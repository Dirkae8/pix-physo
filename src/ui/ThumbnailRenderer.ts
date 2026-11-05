import { MAT } from '../materials/registry';
import { MaterialDef } from '../types/physics';

const THUMB_W = 144;
const THUMB_H = 100;

function fract(v: number): number {
  return v - Math.floor(v);
}

function hash2(x: number, y: number): number {
  return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
}

function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number, octaves = 4): number {
  let val = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * valueNoise(x * freq, y * freq);
    freq *= 2.03;
    amp *= 0.5;
  }
  return val;
}

function clampByte(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v | 0;
}

function drawStudioBackdrop(ctx: CanvasRenderingContext2D, accent: [number, number, number]): void {
  const bg = ctx.createRadialGradient(THUMB_W * 0.5, THUMB_H * 0.35, 6, THUMB_W * 0.5, THUMB_H * 0.55, THUMB_W * 0.72);
  bg.addColorStop(0, `rgb(${Math.round(24 + accent[0] * 0.08)}, ${Math.round(32 + accent[1] * 0.08)}, ${Math.round(42 + accent[2] * 0.08)})`);
  bg.addColorStop(1, '#090d13');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, THUMB_W, THUMB_H);

  // Subtle studio tabletop horizon & reflection floor
  const floorGrad = ctx.createLinearGradient(0, THUMB_H * 0.7, 0, THUMB_H);
  floorGrad.addColorStop(0, 'rgba(255,255,255,0.03)');
  floorGrad.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, THUMB_H * 0.7, THUMB_W, THUMB_H * 0.3);

  // Contact shadow ellipse
  const sh = ctx.createRadialGradient(THUMB_W * 0.5, THUMB_H * 0.82, 4, THUMB_W * 0.5, THUMB_H * 0.82, 54);
  sh.addColorStop(0, 'rgba(0,0,0,0.75)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sh;
  ctx.fillRect(10, THUMB_H * 0.65, THUMB_W - 20, THUMB_H * 0.35);
}

// Per-pixel PBR 3D studio block renderer (for realistic Steel, Brick, Wood, Concrete, Titanium, Ceramic, Ice, Sponge, Rubber, Wax, Lead)
function renderRealisticSolidBlock(ctx: CanvasRenderingContext2D, def: MaterialDef): void {
  drawStudioBackdrop(ctx, def.accentColor);
  const img = ctx.getImageData(0, 0, THUMB_W, THUMB_H);
  const d = img.data;

  // Render an angled 3D isometric slab with top face, front-left face, and front-right face!
  const cx = THUMB_W * 0.5;
  const cy = THUMB_H * 0.52;

  for (let y = 10; y < THUMB_H - 8; y++) {
    for (let x = 16; x < THUMB_W - 16; x++) {
      // Transform into isometric cube coordinates
      const dx = (x - cx) / 44;
      const dy = (y - cy) / 25;

      // Determine which face of the 3D block (top, left, right) pixel hits
      let face = 0; // 0=none, 1=top, 2=left, 3=right
      let u = 0;
      let v = 0;

      // Top diamond: |dx| + |dy + 0.42| <= 0.98
      const topY = dy + 0.44;
      if (Math.abs(dx) + Math.abs(topY) <= 0.98) {
        face = 1;
        u = (dx + topY) * 0.5 + 0.5;
        v = (topY - dx) * 0.5 + 0.5;
      } else if (dx < 0 && dx >= -0.98 && dy > -0.44 + (-dx - 0.98) && dy <= 0.66 + dx * 0.52 + 0.48) {
        const topEdge = -0.44 + (0.98 + dx);
        const botEdge = 0.42 + (0.98 + dx);
        if (dy >= topEdge - 0.96 && dy <= botEdge) {
          // Left front face
          const localTop = -0.44 + Math.abs(dx);
          const localBot = localTop + 0.82;
          if (dy >= localTop && dy <= localBot) {
            face = 2;
            u = dx + 0.98;
            v = (dy - localTop) / 0.82;
          }
        }
      } else if (dx >= 0 && dx <= 0.98) {
        const localTop = -0.44 + dx;
        const localBot = localTop + 0.82;
        if (dy >= localTop && dy <= localBot) {
          face = 3;
          u = dx;
          v = (dy - localTop) / 0.82;
        }
      }

      if (face === 0) continue;

      let r = def.baseColor[0];
      let g = def.baseColor[1];
      let b = def.baseColor[2];
      const ar = def.accentColor[0];
      const ag = def.accentColor[1];
      const ab = def.accentColor[2];

      // Realistic procedural PBR material surface per style!
      if (def.textureStyle === 'brushed_metal') {
        // PHOTO-GRADE STEEL / TITANIUM / LEAD: fine brushed linear scratches + studio softbox specular band!
        const fineGrain = fbm(u * 65, v * 5.5, 3) - 0.5;
        const microScratch = (hash2(Math.floor(u * 140), Math.floor(v * 26)) - 0.5) * 24;
        const specSweep = Math.exp(-Math.pow((u * 0.8 + v * 0.55 - 0.58) * 4.2, 2)) * 95;
        const secSheen = Math.exp(-Math.pow((u - v - 0.15) * 5.5, 2)) * 36;
        r = r + fineGrain * 34 + microScratch + specSweep + secSheen;
        g = g + fineGrain * 34 + microScratch + specSweep + secSheen;
        b = b + fineGrain * 36 + microScratch + specSweep * 1.05 + secSheen;
      } else if (def.textureStyle === 'brick') {
        // REAL CLAY MASONRY BRICK: porous baked terracotta + recessed mortar grooves + mineral grains
        const row = Math.floor(v * 3.0);
        const mortU = fract(u * 2.0 + (row % 2) * 0.5);
        const mortV = fract(v * 3.0);
        if (mortU < 0.08 || mortV < 0.11) {
          const mNoise = (fbm(x * 0.4, y * 0.4, 3) - 0.5) * 32;
          r = ar * 0.88 + mNoise;
          g = ag * 0.88 + mNoise;
          b = ab * 0.86 + mNoise;
        } else {
          const clayPits = (fbm(x * 0.32, y * 0.32, 4) - 0.48) * 68;
          const darkSpeck = hash2(x, y) > 0.93 ? -34 : 0;
          r += clayPits + darkSpeck;
          g += clayPits * 0.72 + darkSpeck;
          b += clayPits * 0.58 + darkSpeck;
        }
      } else if (def.textureStyle === 'wood') {
        // REAL OAK WOOD TIMBER: natural wood fibers & warm growth rings
        const warp = fbm(u * 4, v * 4, 3) * 2.5;
        const rings = Math.sin((v * 14 + warp) * Math.PI) * 0.5 + 0.5;
        const fiber = (fbm(u * 55, v * 6, 2) - 0.5) * 26;
        r = r * (0.76 + 0.34 * rings) + fiber;
        g = g * (0.74 + 0.34 * rings) + fiber * 0.8;
        b = b * (0.7 + 0.32 * rings) + fiber * 0.6;
      } else if (def.textureStyle === 'glass' || def.textureStyle === 'ice') {
        // REFRACTIVE CRYSTAL GLASS / ICE: translucent cyan-white caustics & sharp Fresnel edge reflections
        const bgIdx = (y * THUMB_W + x) * 4;
        const caust = Math.pow(fbm(u * 7, v * 7, 3), 2) * 110;
        const fresnel =
          u < 0.08 || u > 0.92 || v < 0.08 || v > 0.92
            ? 0.88
            : Math.exp(-Math.pow((u + v - 0.85) * 5.0, 2)) * 0.65;
        r = d[bgIdx] * 0.38 + r * 0.48 + caust + ar * fresnel * 0.65;
        g = d[bgIdx + 1] * 0.38 + g * 0.52 + caust + ag * fresnel * 0.65;
        b = d[bgIdx + 2] * 0.38 + b * 0.56 + caust + ab * fresnel * 0.68;
      } else if (def.textureStyle === 'sponge') {
        const cell = fbm(x * 0.36, y * 0.36, 3);
        const hole = cell > 0.6 ? -58 : (cell - 0.3) * 45;
        r += hole;
        g += hole * 0.88;
        b += hole * 0.5;
      } else {
        // Concrete, Ceramic, Rubber, Wax
        const stone = (fbm(x * 0.28, y * 0.28, 4) - 0.5) * 52;
        const micro = (hash2(x, y) - 0.5) * 16;
        r += stone + micro;
        g += stone + micro;
        b += stone + micro;
      }

      // 3D Face studio lighting (Top brightest, Left lit by key light, Right shaded + rim bounce)
      const faceShade = face === 1 ? 1.16 : face === 2 ? 0.94 : 0.66;
      // Crisp chamfer highlight along 3D edges!
      const edgeBevel =
        (u < 0.045 || v < 0.045 || u > 0.955 || v > 0.955) ? (def.metallic > 0.5 ? 42 : 18) : 0;

      const idx = (y * THUMB_W + x) * 4;
      d[idx] = clampByte(r * faceShade + edgeBevel);
      d[idx + 1] = clampByte(g * faceShade + edgeBevel);
      d[idx + 2] = clampByte(b * faceShade + edgeBevel);
      d[idx + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
}

// Realistic 3D Heap of Macro Grains / Crystals / Nuggets (Sand, Soil, Salt, Sugar, Coal, Gold, Gunpowder, Thermite, etc.)
function renderRealisticPowderMound(ctx: CanvasRenderingContext2D, def: MaterialDef): void {
  drawStudioBackdrop(ctx, def.accentColor);
  const img = ctx.getImageData(0, 0, THUMB_W, THUMB_H);
  const d = img.data;

  const cx = THUMB_W * 0.5;
  const baseY = THUMB_H * 0.82;

  for (let y = 18; y < THUMB_H - 6; y++) {
    for (let x = 14; x < THUMB_W - 14; x++) {
      const nx = (x - cx) / 52;
      if (Math.abs(nx) > 1.02) continue;

      // Natural angle-of-repose conical pile silhouette with organic bumpy ridge
      const ridgeNoise = (fbm(x * 0.16, def.id * 3.1, 3) - 0.5) * 9;
      const moundTopY = baseY - (1 - Math.pow(Math.abs(nx), 1.35)) * 52 + ridgeNoise;
      const moundBottomY = baseY + Math.sqrt(Math.max(0, 1 - nx * nx)) * 8;

      if (y < moundTopY || y > moundBottomY) continue;

      // 3D macro surface normal of the cone for realistic key lighting!
      const lightShade = 0.68 + Math.max(-0.25, -nx * 0.36 + (moundBottomY - y) / 130);
      const grainScale = def.textureStyle === 'coal' ? 0.25 : def.textureStyle === 'fibers' ? 0.45 : 0.65;
      const gVal = fbm(x * grainScale, y * grainScale, 3);
      const sparkle = hash2(x + def.id * 17, y);

      let r = def.baseColor[0] * (0.75 + gVal * 0.55);
      let g = def.baseColor[1] * (0.75 + gVal * 0.55);
      let b = def.baseColor[2] * (0.75 + gVal * 0.55);

      if ((def.textureStyle === 'crystal' || def.metallic > 0.7) && sparkle > 0.88) {
        const glint = (sparkle - 0.88) * 720;
        r += glint;
        g += glint * (def.id === MAT.GOLD ? 0.92 : 1.0);
        b += glint * (def.id === MAT.GOLD ? 0.55 : 1.0);
      }

      const idx = (y * THUMB_W + x) * 4;
      d[idx] = clampByte(r * lightShade);
      d[idx + 1] = clampByte(g * lightShade);
      d[idx + 2] = clampByte(b * lightShade);
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  // Scatter realistic loose foreground grains around the base of the mound!
  for (let i = 0; i < 42; i++) {
    const gx = cx + (hash2(i, def.id) - 0.5) * 112;
    const gy = baseY + 2 + hash2(def.id, i + 99) * 10;
    const sz = 1.3 + hash2(i * 3, def.id) * 1.8;
    ctx.fillStyle = `rgb(${def.accentColor[0]}, ${def.accentColor[1]}, ${def.accentColor[2]})`;
    ctx.beginPath();
    ctx.arc(gx, gy, sz, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Realistic Studio Macro Liquid Pool & Droplets / Glass Beaker (Water, Mercury, Motor Oil, Lava, Acid, Honey, LN2)
function renderRealisticLiquid(ctx: CanvasRenderingContext2D, def: MaterialDef): void {
  drawStudioBackdrop(ctx, def.accentColor);
  const img = ctx.getImageData(0, 0, THUMB_W, THUMB_H);
  const d = img.data;

  // Render sleek optical glass beaker filled with realistic refractive/metallic/glowing liquid + meniscus!
  const cx = THUMB_W * 0.5;
  const topY = 18;
  const botY = 84;
  const halfW = 36;
  const liqTop = 36;

  for (let y = topY; y <= botY; y++) {
    for (let x = Math.round(cx - halfW); x <= Math.round(cx + halfW); x++) {
      const nx = (x - cx) / halfW; // -1 .. +1
      const cylZ = Math.sqrt(Math.max(0.02, 1 - nx * nx));
      const idx = (y * THUMB_W + x) * 4;

      const isRim = Math.abs(nx) > 0.91 || y >= botY - 3 || y <= topY + 2;
      const meniscusY = liqTop + Math.round(cylZ * 3 - (def.id === MAT.MERCURY ? -4 : 2));

      if (y >= meniscusY && y < botY - 2 && Math.abs(nx) <= 0.91) {
        const depth = (y - meniscusY) / (botY - liqTop);
        let r = def.baseColor[0];
        let g = def.baseColor[1];
        let b = def.baseColor[2];

        if (def.textureStyle === 'liquid_metal') {
          // PHOTO-GRADE LIQUID MERCURY: mirror-chrome studio environment reflection!
          const envBands = Math.sin(nx * 4.5 + y * 0.08) * 0.5 + 0.5;
          const spec = Math.exp(-Math.pow((nx + 0.38) * 4.5, 2)) * 135;
          r = 115 + envBands * 95 + spec;
          g = 122 + envBands * 98 + spec;
          b = 134 + envBands * 104 + spec;
        } else if (def.textureStyle === 'lava') {
          // MOLTEN LAVA: incandescent orange-yellow magma veins under dark basaltic crust
          const magma = fbm(x * 0.14, y * 0.14, 4);
          r = 150 + magma * 165;
          g = 24 + Math.pow(magma, 1.8) * 210;
          b = 6 + Math.pow(magma, 3.0) * 120;
        } else {
          // Water, Motor Oil, Gasoline, Acid, Honey, Ethanol: Beer-Lambert depth + subsurface glow + softbox highlight!
          const subsurface = (1 - Math.abs(nx) * 0.55) * (1.15 - depth * 0.38);
          const caustic = Math.pow(fbm(x * 0.15, y * 0.18, 3), 2) * 58;
          const softbox = Math.exp(-Math.pow((nx + 0.42) * 5.2, 2)) * 95;
          r = r * subsurface + caustic + softbox;
          g = g * subsurface + caustic + softbox;
          b = b * subsurface + caustic + softbox;
        }

        // Bright liquid meniscus rim!
        if (Math.abs(y - meniscusY) <= 1) {
          r = r * 0.45 + def.accentColor[0] * 0.75;
          g = g * 0.45 + def.accentColor[1] * 0.75;
          b = b * 0.45 + def.accentColor[2] * 0.75;
        }

        d[idx] = clampByte(r);
        d[idx + 1] = clampByte(g);
        d[idx + 2] = clampByte(b);
        d[idx + 3] = 255;
      } else if (isRim) {
        // Borosilicate beaker glass wall highlight
        const sheen = Math.abs(nx + 0.75) < 0.16 || Math.abs(nx - 0.82) < 0.1 ? 155 : 58;
        d[idx] = clampByte(d[idx] * 0.55 + sheen);
        d[idx + 1] = clampByte(d[idx + 1] * 0.55 + sheen * 1.08);
        d[idx + 2] = clampByte(d[idx + 2] * 0.55 + sheen * 1.16);
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

// Realistic Pressurized Industrial Gas Cylinder + Volumetric Vapor Plume
function renderRealisticGasCylinder(ctx: CanvasRenderingContext2D, def: MaterialDef): void {
  drawStudioBackdrop(ctx, def.baseColor);

  // Volumetric glowing gas cloud swirling behind & around cylinder valve
  for (let i = 0; i < 3; i++) {
    const gx = THUMB_W * (0.42 + i * 0.12);
    const gy = THUMB_H * (0.34 - i * 0.04);
    const rad = ctx.createRadialGradient(gx, gy, 2, gx, gy, 34);
    rad.addColorStop(0, `rgba(${def.accentColor[0]}, ${def.accentColor[1]}, ${def.accentColor[2]}, 0.52)`);
    rad.addColorStop(0.55, `rgba(${def.baseColor[0]}, ${def.baseColor[1]}, ${def.baseColor[2]}, 0.24)`);
    rad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, THUMB_W, THUMB_H);
  }

  // 3D Cylindrical Steel Pressure Tank with color-coded shoulder collar & brass valve!
  const cx = THUMB_W * 0.48;
  const tankW = 34;
  const tankGrad = ctx.createLinearGradient(cx - tankW / 2, 0, cx + tankW / 2, 0);
  tankGrad.addColorStop(0, '#1e2631');
  tankGrad.addColorStop(0.28, `rgb(${def.baseColor[0]}, ${def.baseColor[1]}, ${def.baseColor[2]})`);
  tankGrad.addColorStop(0.45, `rgb(${def.accentColor[0]}, ${def.accentColor[1]}, ${def.accentColor[2]})`);
  tankGrad.addColorStop(0.85, '#1b222c');
  tankGrad.addColorStop(1, '#0f141b');

  ctx.fillStyle = tankGrad;
  ctx.beginPath();
  ctx.roundRect(cx - tankW / 2, 32, tankW, 54, [15, 15, 5, 5]);
  ctx.fill();

  // Brass regulator valve & pressure dial
  ctx.fillStyle = '#d4a238';
  ctx.fillRect(cx - 4, 21, 8, 12);
  ctx.fillRect(cx - 2, 24, 15, 4);
  ctx.beginPath();
  ctx.arc(cx + 16, 25, 6.5, 0, Math.PI * 2);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 16, 25);
  ctx.lineTo(cx + 19, 21);
  ctx.strokeStyle = '#ef4444';
  ctx.stroke();
}

// Realistic 3D Studio Hardware Renders for Electrical, Mechanical, Explosive & Tool Items!
function renderRealisticHardwareOrTool(ctx: CanvasRenderingContext2D, def: MaterialDef): void {
  drawStudioBackdrop(ctx, def.accentColor);
  const cx = THUMB_W * 0.5;
  const cy = THUMB_H * 0.5;

  if (def.id === MAT.BATTERY) {
    // 3D Cylindrical Li-Ion / Heavy-Duty Cell with brushed copper top & metallic emerald jacket
    const w = 44;
    const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
    g.addColorStop(0, '#0b3b2c');
    g.addColorStop(0.32, '#10b981');
    g.addColorStop(0.5, '#6ee7b7');
    g.addColorStop(0.88, '#064e3b');
    g.addColorStop(1, '#022c22');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(cx - w / 2, 28, w, 56, 6);
    ctx.fill();

    // Copper header band & silver positive cap
    const capG = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
    capG.addColorStop(0, '#92400e');
    capG.addColorStop(0.38, '#fbbf24');
    capG.addColorStop(1, '#78350f');
    ctx.fillStyle = capG;
    ctx.beginPath();
    ctx.roundRect(cx - w / 2, 24, w, 14, [6, 6, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(cx - 9, 17, 18, 7, 2);
    ctx.fill();

    // Crisp '+' symbol
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('24V', cx, 62);
    return;
  }

  if (def.id === MAT.GENERATOR) {
    // Industrial Copper-Wound Dynamo / Alternator with cooling fins & glowing rotor core!
    const bodyG = ctx.createLinearGradient(0, 24, 0, 82);
    bodyG.addColorStop(0, '#64748b');
    bodyG.addColorStop(0.35, '#cbd5e1');
    bodyG.addColorStop(0.75, '#334155');
    bodyG.addColorStop(1, '#0f172a');
    ctx.fillStyle = bodyG;
    ctx.beginPath();
    ctx.roundRect(28, 26, 88, 54, 10);
    ctx.fill();

    // Copper stator coils visible through vents
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#ea580c' : '#fb923c';
      ctx.fillRect(40 + i * 13, 34, 8, 38);
    }

    // Glowing cyan energy core ring
    ctx.beginPath();
    ctx.arc(cx, 53, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, 53, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#e0f2fe';
    ctx.fill();
    return;
  }

  if (def.id === MAT.FAN) {
    // Realistic Axial Turbine Fan in brushed aluminum housing with 7 curved blades!
    const housing = ctx.createLinearGradient(34, 14, 110, 88);
    housing.addColorStop(0, '#94a3b8');
    housing.addColorStop(0.5, '#334155');
    housing.addColorStop(1, '#1e293b');
    ctx.fillStyle = housing;
    ctx.beginPath();
    ctx.roundRect(35, 13, 74, 74, 12);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 31, 0, Math.PI * 2);
    ctx.fillStyle = '#090d14';
    ctx.fill();

    // Turbine blades
    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < 7; i++) {
      ctx.rotate((Math.PI * 2) / 7);
      const blG = ctx.createLinearGradient(0, 0, 26, 8);
      blG.addColorStop(0, '#38bdf8');
      blG.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = blG;
      ctx.beginPath();
      ctx.moveTo(4, -3);
      ctx.quadraticCurveTo(18, -11, 28, -3);
      ctx.quadraticCurveTo(22, 6, 4, 3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();
    return;
  }

  if (def.id === MAT.BUTTON) {
    // Industrial Brushed Metal Control Box with Glossy Red Mushroom Push-Button!
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.roundRect(36, 48, 72, 34, 6);
    ctx.fill();

    const bezel = ctx.createLinearGradient(44, 40, 100, 56);
    bezel.addColorStop(0, '#e2e8f0');
    bezel.addColorStop(1, '#64748b');
    ctx.fillStyle = bezel;
    ctx.beginPath();
    ctx.ellipse(cx, 50, 26, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    const btn = ctx.createRadialGradient(cx - 8, 30, 3, cx, 36, 26);
    btn.addColorStop(0, '#fca5a5');
    btn.addColorStop(0.35, '#ef4444');
    btn.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = btn;
    ctx.beginPath();
    ctx.ellipse(cx, 38, 22, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (def.id === MAT.SWITCH) {
    // Heavy-Duty Chrome Toggle Switch with ON LED!
    const plate = ctx.createLinearGradient(38, 20, 106, 84);
    plate.addColorStop(0, '#94a3b8');
    plate.addColorStop(0.5, '#475569');
    plate.addColorStop(1, '#1e293b');
    ctx.fillStyle = plate;
    ctx.beginPath();
    ctx.roundRect(40, 20, 64, 64, 8);
    ctx.fill();

    // Hex nut & chrome bat handle angled UP-RIGHT
    ctx.beginPath();
    ctx.arc(cx, 56, 13, 0, Math.PI * 2);
    ctx.fillStyle = '#cbd5e1';
    ctx.fill();

    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, 56);
    ctx.lineTo(cx + 16, 25);
    ctx.stroke();

    // Glowing green status LED
    ctx.beginPath();
    ctx.arc(52, 32, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    return;
  }

  if (def.id === MAT.COPPER_WIRE || def.id === MAT.INSULATED_WIRE || def.id === MAT.HEATER) {
    // Stripped Heavy Braided Copper Cable / Insulated Jacket / Glowing Nichrome Coil!
    if (def.id === MAT.HEATER) {
      ctx.lineWidth = 6.5;
      for (let i = 0; i < 6; i++) {
        const sx = 28 + i * 16;
        const g = ctx.createLinearGradient(sx, 26, sx + 12, 74);
        g.addColorStop(0, '#fde047');
        g.addColorStop(0.5, '#f97316');
        g.addColorStop(1, '#991b1b');
        ctx.strokeStyle = g;
        ctx.beginPath();
        ctx.ellipse(sx + 6, cy, 8, 22, 0.2, 0, Math.PI * 2);
        ctx.stroke();
      }
      return;
    }

    // Outer insulation sleeve on left half + gleaming braided copper strands on right half!
    const hasSleeve = def.id === MAT.INSULATED_WIRE;
    if (hasSleeve) {
      const slG = ctx.createLinearGradient(0, 34, 0, 68);
      slG.addColorStop(0, '#38bdf8');
      slG.addColorStop(0.4, '#0284c7');
      slG.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = slG;
      ctx.beginPath();
      ctx.roundRect(18, 36, 66, 28, 6);
      ctx.fill();
    }

    const startX = hasSleeve ? 78 : 22;
    for (let s = -2; s <= 2; s++) {
      const cg = ctx.createLinearGradient(startX, cy + s * 4 - 3, 124, cy + s * 4 + 3);
      cg.addColorStop(0, '#fed7aa');
      cg.addColorStop(0.45, '#ea580c');
      cg.addColorStop(1, '#9a3412');
      ctx.strokeStyle = cg;
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.moveTo(startX, cy + s * 3.6);
      ctx.bezierCurveTo(startX + 18, cy + s * 5.2, 108, cy + s * 2.5, 124, cy + s * 4.8);
      ctx.stroke();
    }
    return;
  }

  if (def.id === MAT.LAMP) {
    // Glowing Studio Floodlight / Halogen Bulb
    const halo = ctx.createRadialGradient(cx, 44, 4, cx, 44, 46);
    halo.addColorStop(0, 'rgba(255, 252, 220, 0.98)');
    halo.addColorStop(0.45, 'rgba(250, 204, 21, 0.45)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, THUMB_W, THUMB_H);

    ctx.beginPath();
    ctx.arc(cx, 42, 21, 0, Math.PI * 2);
    ctx.fillStyle = '#fef9c3';
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(cx - 10, 61, 20, 18);
    return;
  }

  if (def.id === MAT.TESLA_COIL) {
    // Copper-wound secondary tower + brushed aluminum toroid + jagged plasma arcs!
    ctx.fillStyle = '#b45309';
    ctx.fillRect(cx - 9, 38, 18, 44);
    const tor = ctx.createLinearGradient(cx - 24, 24, cx + 24, 38);
    tor.addColorStop(0, '#f8fafc');
    tor.addColorStop(0.5, '#94a3b8');
    tor.addColorStop(1, '#334155');
    ctx.fillStyle = tor;
    ctx.beginPath();
    ctx.roundRect(cx - 24, 24, 48, 15, 8);
    ctx.fill();

    // Lightning arcs
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2.2;
    for (const dir of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + dir * 20, 30);
      ctx.lineTo(cx + dir * 34, 18);
      ctx.lineTo(cx + dir * 48, 28);
      ctx.lineTo(cx + dir * 58, 14);
      ctx.stroke();
    }
    return;
  }

  if (def.id === MAT.TNT || def.id === MAT.C4 || def.id === MAT.DETONATOR || def.id === MAT.URANIUM) {
    if (def.id === MAT.TNT) {
      for (let k = -1; k <= 1; k++) {
        const sx = cx + k * 15 - 7;
        const g = ctx.createLinearGradient(sx, 0, sx + 14, 0);
        g.addColorStop(0, '#991b1b');
        g.addColorStop(0.4, '#ef4444');
        g.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.roundRect(sx, 24, 14, 58, 4);
        ctx.fill();
      }
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx - 24, 46, 48, 14);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TNT', cx, 56);
    } else if (def.id === MAT.C4) {
      ctx.fillStyle = '#d6d3c4';
      ctx.beginPath();
      ctx.roundRect(34, 30, 76, 44, 6);
      ctx.fill();
      ctx.fillStyle = '#3f6212';
      ctx.fillRect(34, 44, 76, 16);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('M112 C-4', cx, 56);
    } else if (def.id === MAT.URANIUM) {
      const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 44);
      glow.addColorStop(0, 'rgba(134, 239, 172, 0.75)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, THUMB_W, THUMB_H);

      const rod = ctx.createLinearGradient(cx - 18, 0, cx + 18, 0);
      rod.addColorStop(0, '#14532d');
      rod.addColorStop(0.4, '#4ade80');
      rod.addColorStop(1, '#1e293b');
      ctx.fillStyle = rod;
      ctx.beginPath();
      ctx.roundRect(cx - 18, 22, 36, 58, 6);
      ctx.fill();
      ctx.fillStyle = '#052e16';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('U-235', cx, 56);
    } else {
      // Electric Detonator Blasting Cap
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(36, 44, 58, 16, 4);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(20, 48);
      ctx.lineTo(36, 48);
      ctx.stroke();
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(20, 56);
      ctx.lineTo(36, 56);
      ctx.stroke();
      const spark = ctx.createRadialGradient(98, 52, 1, 98, 52, 20);
      spark.addColorStop(0, '#ffffff');
      spark.addColorStop(0.4, '#fbbf24');
      spark.addColorStop(1, 'rgba(239,68,68,0)');
      ctx.fillStyle = spark;
      ctx.fillRect(76, 30, 44, 44);
    }
    return;
  }

  // Energy, Neutrons & Interactive Physics Tools!
  if (def.id === MAT.FIRE) {
    for (let k = 0; k < 4; k++) {
      const fg = ctx.createRadialGradient(cx + (k - 1.5) * 8, 62 - k * 8, 2, cx, 48, 38);
      fg.addColorStop(0, '#fffbeb');
      fg.addColorStop(0.35, '#fbbf24');
      fg.addColorStop(0.7, '#ea580c');
      fg.addColorStop(1, 'rgba(153,27,27,0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(cx - 26, 78);
      ctx.quadraticCurveTo(cx - 30, 38, cx, 14);
      ctx.quadraticCurveTo(cx + 30, 38, cx + 26, 78);
      ctx.fill();
    }
    return;
  }

  if (def.id === MAT.PLASMA || def.id === MAT.NEUTRON) {
    const orb = ctx.createRadialGradient(cx, cy, 2, cx, cy, 42);
    orb.addColorStop(0, '#ffffff');
    orb.addColorStop(0.32, def.id === MAT.NEUTRON ? '#38bdf8' : '#c084fc');
    orb.addColorStop(0.7, def.id === MAT.NEUTRON ? 'rgba(6,182,212,0.35)' : 'rgba(124,58,237,0.35)');
    orb.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = orb;
    ctx.fillRect(0, 0, THUMB_W, THUMB_H);

    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    for (let a = 0; a < 6; a++) {
      const ang = (a / 6) * Math.PI * 2 + 0.3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang) * 18, cy + Math.sin(ang) * 14);
      ctx.lineTo(cx + Math.cos(ang + 0.25) * 34, cy + Math.sin(ang + 0.25) * 32);
      ctx.stroke();
    }
    return;
  }

  if (def.id === MAT.TOOL_HAND) {
    // Shaded 3D Mechanical/Articulated Grabbing Hand gripping a glowing fracture block!
    ctx.fillStyle = '#0ea5e9';
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 16, 48, 34, 30, 9);
    ctx.fill();
    for (let f = -2; f <= 1; f++) {
      ctx.beginPath();
      ctx.roundRect(cx + f * 9 - 2, 22 + Math.abs(f) * 3, 7, 28, 3.5);
      ctx.fill();
    }
    // Thumb
    ctx.save();
    ctx.translate(cx - 18, 56);
    ctx.rotate(-0.55);
    ctx.beginPath();
    ctx.roundRect(-5, -18, 8, 22, 4);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Heat / Cool / Wind / Eraser precision instruments
  const ring = ctx.createRadialGradient(cx, cy, 4, cx, cy, 34);
  ring.addColorStop(0, `rgb(${def.accentColor[0]}, ${def.accentColor[1]}, ${def.accentColor[2]})`);
  ring.addColorStop(0.55, `rgba(${def.baseColor[0]}, ${def.baseColor[1]}, ${def.baseColor[2]}, 0.65)`);
  ring.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = ring;
  ctx.beginPath();
  ctx.arc(cx, cy, 34, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 3;
  if (def.id === MAT.TOOL_WIND) {
    for (let row = -1; row <= 1; row++) {
      ctx.beginPath();
      ctx.moveTo(34, cy + row * 11);
      ctx.bezierCurveTo(64, cy + row * 11 - 8, 84, cy + row * 11 + 8, 108, cy + row * 11);
      ctx.stroke();
    }
  } else if (def.id === MAT.TOOL_ERASER) {
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.roundRect(cx - 22, cy - 12, 26, 24, [5, 0, 0, 5]);
    ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(cx + 4, cy - 12, 18, 24, [0, 5, 5, 0]);
    ctx.fill();
  }
}

const thumbnailCache = new Map<number, string>();

export function getMaterialThumbnailUrl(def: MaterialDef): string {
  const cached = thumbnailCache.get(def.id);
  if (cached) return cached;

  if (typeof document === 'undefined') {
    return '';
  }

  const canvas = document.createElement('canvas');
  canvas.width = THUMB_W;
  canvas.height = THUMB_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  if (def.category === 'solids') {
    renderRealisticSolidBlock(ctx, def);
  } else if (def.category === 'powders' || def.id === MAT.GUNPOWDER || def.id === MAT.THERMITE) {
    renderRealisticPowderMound(ctx, def);
  } else if (def.category === 'liquids' || def.id === MAT.NAPALM) {
    renderRealisticLiquid(ctx, def);
  } else if (def.category === 'gases') {
    renderRealisticGasCylinder(ctx, def);
  } else {
    renderRealisticHardwareOrTool(ctx, def);
  }

  const dataUrl = canvas.toDataURL('image/png');
  thumbnailCache.set(def.id, dataUrl);
  return dataUrl;
}
