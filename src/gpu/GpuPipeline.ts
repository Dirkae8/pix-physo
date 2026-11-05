import { World } from '../engine/World';
import { MATERIAL_BY_ID, MAX_MAT_ID } from '../materials/registry';
import { DisplayMode, GameSettings } from '../types/physics';
import {
  BLOOM_BLUR_FRAG,
  COMPOSITE_FRAG,
  FBO_VERT,
  RADIANCE_SOLVER_FRAG,
  SCENE_PBR_FRAG,
} from './shaders';

const STYLE_CODE_MAP: Record<string, number> = {
  brick: 1,
  wood: 2,
  brushed_metal: 3,
  glass: 4,
  concrete: 5,
  ice: 6,
  sponge: 7,
  rubber: 8,
  ceramic: 9,
  wax: 10,
  granular: 11,
  soil: 12,
  crystal: 13,
  coal: 14,
  snow: 15,
  fibers: 16,
  liquid_clear: 17,
  liquid_metal: 18,
  liquid_oil: 19,
  liquid_glow: 20,
  lava: 21,
  gas: 22,
  wire: 23,
  cable: 24,
  battery: 25,
  generator: 26,
  button: 27,
  switch: 28,
  fan: 29,
  heater: 30,
  lamp: 31,
  tesla: 32,
  detonator: 33,
  explosive: 34,
  c4: 35,
  radioactive: 36,
  plasma: 37,
  tool: 38,
};

const DISPLAY_MODE_CODE: Record<DisplayMode, number> = {
  realistic: 0,
  thermal: 1,
  pressure: 2,
  velocity: 3,
  electric: 4,
  stress: 5,
};

interface FboTarget {
  fbo: WebGLFramebuffer;
  tex: WebGLTexture;
  w: number;
  h: number;
}

export class GpuPipeline {
  public readonly gl: WebGL2RenderingContext | null;
  public readonly gpuAvailable: boolean;
  public readonly rendererName: string;

  private uniforms = new WeakMap<WebGLProgram, Map<string, WebGLUniformLocation | null>>();
  private uniform(program: WebGLProgram, name: string): WebGLUniformLocation | null {
    let cache = this.uniforms.get(program);
    if (!cache) { cache = new Map(); this.uniforms.set(program, cache); }
    if (!cache.has(name)) cache.set(name, this.gl!.getUniformLocation(program, name));
    return cache.get(name) ?? null;
  }
  private vao: WebGLVertexArrayObject | null = null;
  private progRadiance: WebGLProgram | null = null;
  private progScene: WebGLProgram | null = null;
  private progBloom: WebGLProgram | null = null;
  private progComposite: WebGLProgram | null = null;

  private texStateA: WebGLTexture | null = null;
  private texStateB: WebGLTexture | null = null;
  private texAir: WebGLTexture | null = null;
  private texMatStyle: WebGLTexture | null = null;

  private fboRadA: FboTarget | null = null;
  private fboRadB: FboTarget | null = null;
  private fboScene: FboTarget | null = null;
  private fboBloomA: FboTarget | null = null;
  private fboBloomB: FboTarget | null = null;

  private airUploadBuf: Uint8Array = new Uint8Array(0);
  private useHalfFloatFbo = false;
  private allocW = 0;
  private allocH = 0;

  // Fallback 2D renderer if WebGL2 unavailable
  private fallbackCtx: CanvasRenderingContext2D | null = null;
  private fallbackImg: ImageData | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });

    if (!gl) {
      this.gl = null;
      this.gpuAvailable = false;
      this.rendererName = 'Canvas2D Fallback';
      this.fallbackCtx = canvas.getContext('2d');
      return;
    }

    this.gl = gl;
    this.useHalfFloatFbo = Boolean(gl.getExtension('EXT_color_buffer_float'));

    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    this.rendererName = dbg
      ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL))
      : String(gl.getParameter(gl.RENDERER) || 'WebGL2 Hardware GPU');

    try {
      this.vao = gl.createVertexArray();
      this.progRadiance = this.compileProgram(FBO_VERT, RADIANCE_SOLVER_FRAG);
      this.progScene = this.compileProgram(FBO_VERT, SCENE_PBR_FRAG);
      this.progBloom = this.compileProgram(FBO_VERT, BLOOM_BLUR_FRAG);
      this.progComposite = this.compileProgram(FBO_VERT, COMPOSITE_FRAG);
      this.texMatStyle = this.buildMaterialStyleLut();
      this.gpuAvailable = true;
    } catch (err) {
      console.error('WebGL2 shader setup failed, using fallback:', err);
      this.gpuAvailable = false;
      this.fallbackCtx = canvas.getContext('2d');
    }
  }

  private compileShader(type: number, source: string): WebGLShader {
    const gl = this.gl!;
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, source);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw new Error(`GLSL compile error: ${log}`);
    }
    return sh;
  }

  private compileProgram(vertSrc: string, fragSrc: string): WebGLProgram {
    const gl = this.gl!;
    const vs = this.compileShader(gl.VERTEX_SHADER, vertSrc);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fragSrc);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(prog);
      gl.deleteProgram(prog);
      throw new Error(`Program link error: ${log}`);
    }
    return prog;
  }

  private buildMaterialStyleLut(): WebGLTexture {
    const gl = this.gl!;
    const data = new Uint8Array(MAX_MAT_ID * 2 * 4);

    for (let id = 0; id < MAX_MAT_ID; id++) {
      const m = MATERIAL_BY_ID[id];
      const o0 = id * 4;
      data[o0] = m.baseColor[0];
      data[o0 + 1] = m.baseColor[1];
      data[o0 + 2] = m.baseColor[2];
      data[o0 + 3] = STYLE_CODE_MAP[m.textureStyle] ?? 1;

      const o1 = (MAX_MAT_ID + id) * 4;
      data[o1] = m.accentColor[0];
      data[o1 + 1] = m.accentColor[1];
      data[o1 + 2] = m.accentColor[2];
      data[o1 + 3] = Math.round(Math.max(0, Math.min(1, m.opacity)) * 255);
    }

    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, MAX_MAT_ID, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    return tex;
  }

  private createFbo(w: number, h: number, linear: boolean): FboTarget {
    const gl = this.gl!;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, linear ? gl.LINEAR : gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, linear ? gl.LINEAR : gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    if (this.useHalfFloatFbo) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }

    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { fbo, tex, w, h };
  }

  private ensureTargets(world: World): void {
    const gl = this.gl!;
    const w = world.width;
    const h = world.height;
    if (this.allocW === w && this.allocH === h && this.texStateA) return;

    // Release the previous resolution's targets instead of accumulating GPU memory.
    for (const tex of [this.texStateA, this.texStateB, this.texAir]) if (tex) gl.deleteTexture(tex);
    for (const target of [this.fboRadA, this.fboRadB, this.fboScene, this.fboBloomA, this.fboBloomB]) {
      if (target) { gl.deleteFramebuffer(target.fbo); gl.deleteTexture(target.tex); }
    }
    this.allocW = w;
    this.allocH = h;

    const mkDataTex = (tw: number, th: number, linear: boolean): WebGLTexture => {
      const t = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, linear ? gl.LINEAR : gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, linear ? gl.LINEAR : gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, tw, th, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      return t;
    };

    this.texStateA = mkDataTex(w, h, false);
    this.texStateB = mkDataTex(w, h, false);
    this.texAir = mkDataTex(world.airW, world.airH, true);
    this.airUploadBuf = new Uint8Array(world.airSize * 4);

    // Radiance & Bloom FBOs at 1/2 and full resolution for silky volumetric glow
    const rw = Math.max(64, w >> 1);
    const rh = Math.max(64, h >> 1);
    this.fboRadA = this.createFbo(rw, rh, true);
    this.fboRadB = this.createFbo(rw, rh, true);
    this.fboScene = this.createFbo(w * 2, h * 2, true);
    this.fboBloomA = this.createFbo(w, h, true);
    this.fboBloomB = this.createFbo(w, h, true);
  }

  public render(
    world: World,
    settings: GameSettings,
    displayMode: DisplayMode
  ): { gpuMs: number; particleCount: number } {
    const t0 = performance.now();
    const particleCount = world.packGpuTextures();

    if (!this.gpuAvailable || !this.gl) {
      this.renderFallback2D(world);
      return { gpuMs: performance.now() - t0, particleCount };
    }

    const gl = this.gl;
    this.ensureTargets(world);

    // Pack coarse Air Grid for GPU pressure/velocity shaders
    for (let i = 0; i < world.airSize; i++) {
      const o = i << 2;
      this.airUploadBuf[o] = Math.max(0, Math.min(255, Math.round(128 + (world.airPressure[i] / 400) * 255)));
      this.airUploadBuf[o + 1] = Math.max(0, Math.min(255, Math.round(128 + (world.airVx[i] / 80) * 255)));
      this.airUploadBuf[o + 2] = Math.max(0, Math.min(255, Math.round(128 + (world.airVy[i] / 80) * 255)));
      this.airUploadBuf[o + 3] = world.airWall[i] ? 255 : 0;
    }

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

    gl.bindTexture(gl.TEXTURE_2D, this.texStateA);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, world.width, world.height, gl.RGBA, gl.UNSIGNED_BYTE, world.gpuStateTexA);

    gl.bindTexture(gl.TEXTURE_2D, this.texStateB);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, world.width, world.height, gl.RGBA, gl.UNSIGNED_BYTE, world.gpuStateTexB);

    gl.bindTexture(gl.TEXTURE_2D, this.texAir);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, world.airW, world.airH, gl.RGBA, gl.UNSIGNED_BYTE, this.airUploadBuf);

    gl.bindVertexArray(this.vao);

    // --- STAGE 1: GPU Volumetric Radiance & Field Solver (Ping-Pong FBOs) ---
    // In GPU 90% mode: 12 multi-scale light/thermal relaxation passes; in Balance 70% mode: 5 passes!
    const radPasses = settings.computeMode === 'gpu90' ? 12 : 5;
    gl.useProgram(this.progRadiance!);
    gl.viewport(0, 0, this.fboRadA!.w, this.fboRadA!.h);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.texStateA);
    gl.uniform1i(this.uniform(this.progRadiance!, 'uStateTexA'), 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.texStateB);
    gl.uniform1i(this.uniform(this.progRadiance!, 'uStateTexB'), 2);

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, this.texMatStyle);
    gl.uniform1i(this.uniform(this.progRadiance!, 'uMatStyleTex'), 3);

    gl.uniform2f(
      this.uniform(this.progRadiance!, 'uTexel'),
      1 / this.fboRadA!.w,
      1 / this.fboRadA!.h
    );

    let radRead = this.fboRadA!;
    let radWrite = this.fboRadB!;

    for (let p = 0; p < radPasses; p++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, radWrite.fbo);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, radRead.tex);
      gl.uniform1i(this.uniform(this.progRadiance!, 'uPrevField'), 0);
      gl.uniform1i(this.uniform(this.progRadiance!, 'uPassIndex'), p);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      const tmp = radRead;
      radRead = radWrite;
      radWrite = tmp;
    }

    // --- STAGE 2: GPU PBR Material + Blackbody + Scientific Mode Render ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboScene!.fbo);
    gl.viewport(0, 0, this.fboScene!.w, this.fboScene!.h);
    gl.useProgram(this.progScene!);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texStateA);
    gl.uniform1i(this.uniform(this.progScene!, 'uStateTexA'), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.texStateB);
    gl.uniform1i(this.uniform(this.progScene!, 'uStateTexB'), 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.texAir);
    gl.uniform1i(this.uniform(this.progScene!, 'uAirTex'), 2);

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, radRead.tex);
    gl.uniform1i(this.uniform(this.progScene!, 'uRadianceTex'), 3);

    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, this.texMatStyle);
    gl.uniform1i(this.uniform(this.progScene!, 'uMatStyleTex'), 4);

    gl.uniform2f(this.uniform(this.progScene!, 'uSimSize'), world.width, world.height);
    gl.uniform1f(this.uniform(this.progScene!, 'uTime'), world.timeSec);
    gl.uniform1i(this.uniform(this.progScene!, 'uDisplayMode'), DISPLAY_MODE_CODE[displayMode]);
    gl.uniform1i(this.uniform(this.progScene!, 'uRealisticTextures'), settings.realisticTextures ? 1 : 0);
    gl.uniform1i(this.uniform(this.progScene!, 'uRefractionSpec'), settings.refractionAndSpec ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // --- STAGE 3: Separable Multi-Pass HDR Gaussian Bloom ---
    const bloomPasses = settings.hdrBloom ? (settings.computeMode === 'gpu90' ? 4 : 2) : 0;
    if (bloomPasses > 0) {
      gl.useProgram(this.progBloom!);
      gl.viewport(0, 0, this.fboBloomA!.w, this.fboBloomA!.h);

      for (let bp = 0; bp < bloomPasses; bp++) {
        // Horizontal blur
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboBloomA!.fbo);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, bp === 0 ? this.fboScene!.tex : this.fboBloomB!.tex);
        gl.uniform1i(this.uniform(this.progBloom!, 'uTex'), 0);
        gl.uniform2f(this.uniform(this.progBloom!, 'uDir'), 1 / this.fboBloomA!.w, 0);
        gl.uniform1i(this.uniform(this.progBloom!, 'uExtractPass'), bp === 0 ? 1 : 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        // Vertical blur
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboBloomB!.fbo);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.fboBloomA!.tex);
        gl.uniform1i(this.uniform(this.progBloom!, 'uTex'), 0);
        gl.uniform2f(this.uniform(this.progBloom!, 'uDir'), 0, 1 / this.fboBloomA!.h);
        gl.uniform1i(this.uniform(this.progBloom!, 'uExtractPass'), 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    }

    // --- STAGE 4: Final Filmic HDR Tone-Mapping + Heat-Haze Composite ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.progComposite!);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.fboScene!.tex);
    gl.uniform1i(this.uniform(this.progComposite!, 'uSceneTex'), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.fboBloomB!.tex);
    gl.uniform1i(this.uniform(this.progComposite!, 'uBloomTex'), 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, radRead.tex);
    gl.uniform1i(this.uniform(this.progComposite!, 'uRadianceTex'), 2);

    gl.uniform1f(
      this.uniform(this.progComposite!, 'uBloomIntensity'),
      settings.hdrBloom && displayMode === 'realistic' ? settings.bloomIntensity : 0.15
    );
    gl.uniform1f(this.uniform(this.progComposite!, 'uTime'), world.timeSec);
    gl.uniform1i(
      this.uniform(this.progComposite!, 'uHeatShimmer'),
      settings.heatShimmer && displayMode === 'realistic' ? 1 : 0
    );

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);

    return { gpuMs: performance.now() - t0, particleCount };
  }

  private renderFallback2D(world: World): void {
    const ctx = this.fallbackCtx;
    if (!ctx) return;
    if (!this.fallbackImg || this.fallbackImg.width !== world.width || this.fallbackImg.height !== world.height) {
      this.canvas.width = world.width;
      this.canvas.height = world.height;
      this.fallbackImg = ctx.createImageData(world.width, world.height);
    }
    const data = this.fallbackImg.data;
    for (let i = 0; i < world.size; i++) {
      const m = world.mat[i];
      const o = i << 2;
      if (m === 0) {
        data[o] = 11;
        data[o + 1] = 16;
        data[o + 2] = 22;
        data[o + 3] = 255;
      } else {
        const def = MATERIAL_BY_ID[m];
        const s = 0.85 + (world.seed[i] / 255) * 0.3;
        data[o] = Math.min(255, def.baseColor[0] * s);
        data[o + 1] = Math.min(255, def.baseColor[1] * s);
        data[o + 2] = Math.min(255, def.baseColor[2] * s);
        data[o + 3] = 255;
      }
    }
    ctx.putImageData(this.fallbackImg, 0, 0);
  }
}
