export const FULLSCREEN_VERT = `#version 300 es
precision highp float;
out vec2 vUv;

void main() {
  vec2 pos = vec2(
    (gl_VertexID == 1) ? 3.0 : -1.0,
    (gl_VertexID == 2) ? 3.0 : -1.0
  );
  // Flip Y so UV (0,0) maps to top-left of simulation grid (y=0 is sky, y=height-1 is floor)
  vUv = vec2((pos.x + 1.0) * 0.5, 1.0 - (pos.y + 1.0) * 0.5);
  gl_Position = vec4(pos, 0.0, 1.0);
}
`;

// Post-processing vertex shader where FBO textures already have standard OpenGL orientation
export const FBO_VERT = `#version 300 es
precision highp float;
out vec2 vUv;

void main() {
  vec2 pos = vec2(
    (gl_VertexID == 1) ? 3.0 : -1.0,
    (gl_VertexID == 2) ? 3.0 : -1.0
  );
  vUv = (pos + 1.0) * 0.5;
  gl_Position = vec4(pos, 0.0, 1.0);
}
`;

// GPU Continuum Radiance, Volumetric Light & Acoustic Wave Relaxation Pass
export const RADIANCE_SOLVER_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uPrevField;   // RGB = local volumetric light, A = smoothed thermal/pressure field
uniform sampler2D uStateTexA;   // R=matId, G=tempNorm, B=seed, A=wetness
uniform sampler2D uStateTexB;   // R=volt, G=current/stress, B=meta, A=absorbedMat
uniform sampler2D uMatStyleTex; // 80x2 LUT: row0 = baseRGB + styleCode, row1 = accentRGB + opticalPacked
uniform vec2 uTexel;
uniform int uPassIndex;

void main() {
  // On pass 0, sample World textures (flipped Y to match screen space)
  vec2 simUv = vec2(vUv.x, 1.0 - vUv.y);
  vec4 stA = texture(uStateTexA, simUv);
  vec4 stB = texture(uStateTexB, simUv);

  int matId = int(stA.r * 255.0 + 0.5);
  float tempC = stA.g * 2800.0 - 200.0;
  float volt = stB.r * 60.0;
  float cur = stB.g * 32.0;

  vec4 matRow1 = texelFetch(uMatStyleTex, ivec2(matId, 1), 0);
  float opacity = matRow1.a;

  // Intrinsic light emitters (Fire, Plasma, Lava, Lamps, Electric Arcs, Uranium, Incandescent Solids)
  vec3 emit = vec3(0.0);
  if (matId == 62) { // FIRE
    int fireKind = int(stB.b * 255.0 + 0.5);
    emit = fireKind == 1 ? vec3(0.30, 0.75, 1.7) : fireKind == 2 ? vec3(1.8, 1.8, 1.65) : vec3(1.55, 0.62, 0.14);
  } else if (matId == 63 || matId == 77) { // PLASMA / ELECTRIC_ARC
    emit = vec3(0.75, 0.88, 1.85);
  } else if (matId == 26 || matId == 69 || matId == 70) { // LAVA / MOLTEN
    emit = vec3(1.45, 0.48, 0.08);
  } else if (matId == 52 && volt > 3.5) { // LAMP powered
    float br = clamp(volt / 22.0, 0.3, 1.9);
    emit = vec3(1.55, 1.48, 1.18) * br;
  } else if (matId == 60) { // URANIUM
    emit = vec3(0.18, 0.65, 0.22);
  } else if (matId == 61) { // NEUTRON
    emit = vec3(0.35, 1.35, 1.65);
  } else if (matId == 78) { // EMBER
    emit = vec3(1.4, 0.72, 0.2);
  }

  // Planck Blackbody glow for any hot material > 550°C
  if (tempC > 550.0 && matId != 0) {
    float k = clamp((tempC - 550.0) / 2200.0, 0.0, 1.0);
    vec3 bb = vec3(
      smoothstep(0.0, 0.32, k) * 1.35,
      smoothstep(0.16, 0.72, k) * 1.15,
      smoothstep(0.48, 1.0, k) * 1.05
    );
    emit = max(emit, bb);
  }

  if (uPassIndex == 0) {
    fragColor = vec4(emit, clamp((tempC + 50.0) / 1500.0, 0.0, 1.5));
    return;
  }

  // Multi-scale neighbor gathering for volumetric light transport with solid occlusion!
  float stepRadius = (uPassIndex < 4) ? 1.5 : (uPassIndex < 8) ? 3.0 : 5.5;
  vec2 off = uTexel * stepRadius;

  vec4 c0 = texture(uPrevField, vUv);
  vec4 cL = texture(uPrevField, vUv + vec2(-off.x, 0.0));
  vec4 cR = texture(uPrevField, vUv + vec2(off.x, 0.0));
  vec4 cU = texture(uPrevField, vUv + vec2(0.0, off.y));
  vec4 cD = texture(uPrevField, vUv + vec2(0.0, -off.y));
  vec4 cUL = texture(uPrevField, vUv + vec2(-off.x, off.y));
  vec4 cUR = texture(uPrevField, vUv + vec2(off.x, off.y));
  vec4 cDL = texture(uPrevField, vUv + vec2(-off.x, -off.y));
  vec4 cDR = texture(uPrevField, vUv + vec2(off.x, -off.y));

  vec4 avg = (cL + cR + cU + cD) * 0.16 + (cUL + cUR + cDL + cDR) * 0.09;

  // Opaque solids attenuate light transmission (creating real 2D shadows behind walls!)
  float transmission = (matId == 0) ? 0.965 : mix(0.94, 0.36, clamp(opacity, 0.0, 1.0));
  vec3 lightOut = max(emit, mix(c0.rgb, avg.rgb, 0.78) * transmission);
  float fieldA = mix(c0.a, avg.a, 0.65) * 0.97;

  // Subtle cyan corona around energized high-voltage conductors
  if (volt > 8.0 && cur > 0.5) {
    lightOut += vec3(0.06, 0.16, 0.28) * clamp(volt / 48.0, 0.0, 1.0);
  }

  fragColor = vec4(lightOut, fieldA);
}
`;

// Main GPU PBR + Procedural Micro-Texture + Scientific Visualization Shader
export const SCENE_PBR_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uStateTexA;   // R=matId, G=tempNorm, B=seed, A=wetness
uniform sampler2D uStateTexB;   // R=volt, G=current/stress, B=meta, A=absorbedMat
uniform sampler2D uAirTex;      // R=P_norm, G=vx_norm, B=vy_norm, A=wall
uniform sampler2D uRadianceTex; // Volumetric light from GPU Radiance Solver
uniform sampler2D uMatStyleTex; // 80x2 LUT

uniform vec2 uSimSize;
uniform float uTime;
uniform int uDisplayMode;       // 0=realistic, 1=thermal, 2=pressure, 3=velocity, 4=electric, 5=stress
uniform int uRealisticTextures;
uniform int uRefractionSpec;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 blackbodyColor(float tempC) {
  float k = clamp((tempC - 525.0) / 2400.0, 0.0, 1.0);
  return vec3(
    smoothstep(0.0, 0.28, k) * 1.4,
    smoothstep(0.15, 0.68, k) * 1.15,
    smoothstep(0.45, 1.0, k) * 1.1
  );
}

vec3 thermalFlirPalette(float tempC) {
  // -200°C -> +1800°C scientific FLIR Ironbow palette
  float t = clamp((tempC + 120.0) / 1400.0, 0.0, 1.0);
  vec3 c0 = vec3(0.05, 0.04, 0.18);
  vec3 c1 = vec3(0.18, 0.12, 0.58);
  vec3 c2 = vec3(0.76, 0.14, 0.48);
  vec3 c3 = vec3(0.96, 0.48, 0.10);
  vec3 c4 = vec3(1.00, 0.96, 0.78);
  if (t < 0.25) return mix(c0, c1, t * 4.0);
  if (t < 0.5) return mix(c1, c2, (t - 0.25) * 4.0);
  if (t < 0.78) return mix(c2, c3, (t - 0.5) / 0.28);
  return mix(c3, c4, (t - 0.78) / 0.22);
}

void main() {
  // vUv from FBO_VERT has (0,0) bottom-left, so simY = (1.0 - vUv.y) * uSimSize.y
  vec2 simUv = vec2(vUv.x, 1.0 - vUv.y);
  ivec2 px = clamp(ivec2(simUv * uSimSize), ivec2(0), ivec2(uSimSize) - ivec2(1));

  vec4 stA = texelFetch(uStateTexA, px, 0);
  vec4 stB = texelFetch(uStateTexB, px, 0);
  vec4 air = texture(uAirTex, simUv);
  vec4 rad = texture(uRadianceTex, vUv);

  int matId = int(stA.r * 255.0 + 0.5);
  float tempC = stA.g * 2800.0 - 200.0;
  float seed = stA.b;
  float wetness = stA.a;

  float volt = stB.r * 60.0;
  float curOrStress = stB.g;
  int meta = int(stB.b * 255.0 + 0.5);
  int absMatId = int(stB.a * 255.0 + 0.5);

  float airP = (air.r - 0.5) * 400.0;
  vec2 airV = (air.gb - 0.5) * 80.0;

  // --- SCIENTIFIC OVERLAY MODES ---
  if (uDisplayMode == 1) {
    // FLIR Thermal Camera
    float tUse = (matId == 0) ? mix(tempC, tempC + airP * 0.15, 0.3) : tempC;
    vec3 flir = thermalFlirPalette(tUse);
    if (matId == 0) flir *= 0.36;
    // Isotherm contour lines every 100°C
    float iso = abs(fract(tUse / 100.0) - 0.5);
    if (iso < 0.025 && matId != 0) flir += 0.12;
    fragColor = vec4(flir, 1.0);
    return;
  }

  if (uDisplayMode == 2) {
    // Powder-Toy Pressure & Shockwave Mode
    vec3 bg = vec3(0.04, 0.06, 0.09);
    float posP = clamp(airP / 65.0, 0.0, 1.0);
    float negP = clamp(-airP / 45.0, 0.0, 1.0);
    bg += vec3(0.95, 0.25, 0.18) * posP + vec3(0.12, 0.58, 0.98) * negP;
    if (matId != 0) {
      vec3 mc = texelFetch(uMatStyleTex, ivec2(matId, 0), 0).rgb;
      bg = mix(bg, mc, 0.55);
    }
    fragColor = vec4(bg, 1.0);
    return;
  }

  if (uDisplayMode == 3) {
    // Airflow Velocity & Aerodynamics Mode
    float spd = length(airV);
    vec2 dir = spd > 0.05 ? airV / spd : vec2(0.0);
    vec3 flowCol = vec3(
      0.06 + abs(dir.x) * clamp(spd / 20.0, 0.0, 1.0) * 0.85,
      0.08 + clamp(spd / 26.0, 0.0, 1.0) * 0.72,
      0.11 + abs(dir.y) * clamp(spd / 20.0, 0.0, 1.0) * 0.92
    );
    // Animated streamline streaks
    float streak = sin(dot(vec2(px), vec2(-dir.y, dir.x)) * 0.45 + uTime * 4.0);
    flowCol += 0.08 * clamp(spd / 12.0, 0.0, 1.0) * smoothstep(0.6, 1.0, streak);
    if (matId != 0) {
      vec3 mc = texelFetch(uMatStyleTex, ivec2(matId, 0), 0).rgb;
      flowCol = mix(flowCol, mc, 0.65);
    }
    fragColor = vec4(flowCol, 1.0);
    return;
  }

  if (uDisplayMode == 4) {
    // Electricity & Potential Mode
    vec3 base = (matId == 0) ? vec3(0.03, 0.05, 0.08) : texelFetch(uMatStyleTex, ivec2(matId, 0), 0).rgb * 0.32;
    float vNorm = clamp(volt / 48.0, 0.0, 1.0);
    base += vec3(0.12, 0.82, 1.0) * vNorm + vec3(1.0, 0.86, 0.25) * pow(vNorm, 3.0);
    fragColor = vec4(base + rad.rgb * 0.25, 1.0);
    return;
  }

  if (uDisplayMode == 5) {
    // Mechanical Stress, Hydrostatic Head & Density
    vec3 base = (matId == 0) ? vec3(0.04, 0.05, 0.07) : texelFetch(uMatStyleTex, ivec2(matId, 0), 0).rgb * 0.28;
    float st = clamp(curOrStress * 1.4, 0.0, 1.0);
    base += mix(vec3(0.0, 0.45, 0.75), vec3(1.0, 0.22, 0.12), st) * st;
    fragColor = vec4(base, 1.0);
    return;
  }

  // --- MODE 0: FULL REALISTIC HDR + PBR SHADING ---
  if (matId == 0) {
    // Rich dark atmospheric laboratory background + subtle pressure shockwave shimmer + volumetric light!
    float grad = mix(0.055, 0.032, simUv.y);
    vec3 sky = vec3(grad * 0.72, grad * 0.95, grad * 1.24);
    float shock = clamp(abs(airP) / 140.0, 0.0, 0.35);
    sky += vec3(0.32, 0.48, 0.65) * shock;
    sky += rad.rgb * 0.44;
    fragColor = vec4(sky, 1.0);
    return;
  }

  vec4 row0 = texelFetch(uMatStyleTex, ivec2(matId, 0), 0);
  vec4 row1 = texelFetch(uMatStyleTex, ivec2(matId, 1), 0);
  vec3 baseCol = row0.rgb;
  int style = int(row0.a * 255.0 + 0.5);
  vec3 accentCol = row1.rgb;

  // Sample 4 neighbors for 3D normal bevels, meniscus & interface boundaries
  ivec2 maxPx = ivec2(uSimSize) - ivec2(1);
  int mL = int(texelFetch(uStateTexA, clamp(px + ivec2(-1, 0), ivec2(0), maxPx), 0).r * 255.0 + 0.5);
  int mR = int(texelFetch(uStateTexA, clamp(px + ivec2(1, 0), ivec2(0), maxPx), 0).r * 255.0 + 0.5);
  int mU = int(texelFetch(uStateTexA, clamp(px + ivec2(0, -1), ivec2(0), maxPx), 0).r * 255.0 + 0.5);
  int mD = int(texelFetch(uStateTexA, clamp(px + ivec2(0, 1), ivec2(0), maxPx), 0).r * 255.0 + 0.5);

  float occL = (mL == 0) ? 0.0 : 1.0;
  float occR = (mR == 0) ? 0.0 : 1.0;
  float occU = (mU == 0) ? 0.0 : 1.0;
  float occD = (mD == 0) ? 0.0 : 1.0;

  vec3 normal = normalize(vec3(occL - occR, occU - occD, 1.35));
  vec3 lightDir = normalize(vec3(-0.45, -0.68, 0.58));
  float ndl = clamp(dot(normal, lightDir), 0.0, 1.0);

  vec3 col = baseCol;
  if (matId == 62 && meta == 1) { baseCol = vec3(0.25, 0.5, 1.0); accentCol = vec3(0.75, 0.85, 1.0); col = baseCol; }
  if (matId == 62 && meta == 2) { baseCol = vec3(0.95, 0.95, 0.90); accentCol = vec3(1.0); col = baseCol; }
  float emissiveBoost = 0.0;
  vec2 fpx = vec2(px);

  if (uRealisticTextures == 1) {
    if (style == 1) {
      // BRICK: Running-bond clay masonry with recessed mortar joints & clay grain
      float rowIdx = floor(fpx.y / 5.0);
      float offset = mod(rowIdx, 2.0) * 5.0;
      float bx = mod(fpx.x + offset, 10.0);
      float by = mod(fpx.y, 5.0);
      float brickHash = hash21(vec2(floor((fpx.x + offset) / 10.0), rowIdx));
      if (bx < 1.0 || by < 1.0) {
        col = accentCol * (0.86 + 0.14 * seed);
      } else {
        col = baseCol * (0.84 + 0.26 * brickHash) + (seed - 0.5) * 0.08;
      }
    } else if (style == 2) {
      // WOOD: Longitudinal oak wood grain & annual rings
      float ring = sin(fpx.y * 0.55 + sin(fpx.x * 0.09) * 2.6);
      float fiber = (hash21(vec2(floor(fpx.x * 0.35), fpx.y)) - 0.5) * 0.12;
      col = mix(accentCol, baseCol, ring * 0.5 + 0.5) + fiber;
    } else if (style == 3) {
      // BRUSHED METAL (Steel, Titanium, Lead, Sodium): Anisotropic horizontal micro-brush + bevel sheen
      float brush = (hash21(vec2(floor(fpx.x * 0.18), fpx.y)) - 0.5) * 0.11;
      float diagSheen = pow(max(0.0, sin((fpx.x * 0.035 + fpx.y * 0.055))), 6.0) * 0.26;
      col = baseCol + brush + accentCol * diagSheen;
      if (mU == 0 || mL == 0) col = mix(col, accentCol, 0.38);
    } else if (style == 4 || style == 6) {
      // GLASS & ICE: Crisp refractive edge highlight + diagonal Fresnel reflection
      float glint = smoothstep(0.75, 0.98, sin((fpx.x - fpx.y) * 0.14));
      col = mix(baseCol * 0.52, accentCol, glint * 0.38);
      if (mU != matId || mD != matId || mL != matId || mR != matId) {
        col = mix(col, accentCol, 0.58);
      }
      // Transmit background volumetric radiance through glass!
      col += rad.rgb * 0.55;
    } else if (style == 5) {
      // CONCRETE / BASALT: Aggregate stone speckle
      float agg = (seed - 0.5) * 0.18 + (hash21(floor(fpx * 0.5)) - 0.5) * 0.12;
      col = baseCol + agg;
    } else if (style == 7) {
      // SPONGE: Cellular pores
      float pore = smoothstep(0.62, 0.85, hash21(floor(fpx * 0.75)));
      col = mix(baseCol, accentCol * 0.65, pore);
    } else if (style == 11 || style == 12 || style == 13 || style == 14 || style == 15 || style == 16) {
      // GRANULAR POWDERS (Sand, Soil, Salt, Sugar, Coal, Snow, Sawdust, Gold)
      col = mix(baseCol * 0.84, accentCol * 1.06, seed);
      if (style == 13 && seed > 0.82) {
        // Crystalline sparkle on Salt, Sugar, Glass Shards
        col += 0.22;
      }
    } else if (style == 17 || style == 19 || style == 20) {
      // LIQUIDS (Water, Oil, Acid, Gasoline, Ethanol, Honey): Meniscus, waves & Beer-Lambert depth
      float wave = sin(fpx.x * 0.22 + uTime * 3.8 + fpx.y * 0.12) * 0.04;
      col = baseCol + wave;
      // Bright specular meniscus at free surface!
      if (mU == 0 || mU >= 35 && mU <= 43) {
        col = mix(col, accentCol, 0.65);
      }
      if (style == 20) {
        emissiveBoost = 0.45;
      }
    } else if (style == 18) {
      // LIQUID METAL (Mercury): Chrome mirror reflection!
      float chrome = sin(fpx.x * 0.18 - fpx.y * 0.25 + uTime * 2.0) * 0.5 + 0.5;
      col = mix(baseCol * 0.78, accentCol, pow(chrome, 2.2));
      if (mU == 0) col = accentCol * 1.1;
    } else if (style == 21) {
      // LAVA & MOLTEN METAL: Incandescent convection crust & bright fissures
      float crust = sin(fpx.x * 0.19 + uTime * 1.7) * cos(fpx.y * 0.19 - uTime * 1.3);
      col = mix(baseCol * 0.65, accentCol * 1.25, smoothstep(-0.3, 0.65, crust));
      emissiveBoost = 1.35;
    } else if (style == 22) {
      // GASES & VAPORS: Soft billowing volumetric alpha blend over background!
      float puff = 0.75 + 0.25 * sin(fpx.x * 0.15 + uTime * 2.4 + seed * 6.28);
      vec3 bgSky = vec3(0.032, 0.045, 0.062) + rad.rgb * 0.45;
      float alpha = clamp(wetness * 0.65 + 0.22, 0.18, 0.68) * puff;
      col = mix(bgSky, mix(baseCol, accentCol, seed * 0.5), alpha);
      fragColor = vec4(col, 1.0);
      return;
    } else if (style >= 23 && style <= 33) {
      // ELECTRICAL & MECHANICAL HARDWARE
      col = mix(baseCol, accentCol, (seed - 0.3) * 0.35);
      if (matId == 49) {
        // Toggle Switch: bright green when ON (meta > 0), crimson red when OFF!
        bool isOn = meta > 0;
        if (mod(fpx.x, 4.0) >= 1.0 && mod(fpx.y, 4.0) >= 1.0) {
          col = isOn ? vec3(0.12, 0.92, 0.48) : vec3(0.88, 0.18, 0.22);
          if (isOn) emissiveBoost = 0.65;
        }
      } else if (matId == 48) {
        // Push Button: glows bright orange-white when pressed!
        if (meta > 0) {
          col = vec3(1.0, 0.68, 0.22);
          emissiveBoost = 0.85;
        }
      } else if (matId == 50) {
        // Turbine Fan: animated spinning rotor blades!
        float bladeSpeed = (volt > 3.0) ? 18.0 : 0.0;
        float blade = sin((fpx.x + fpx.y) * 0.85 - uTime * bladeSpeed);
        col = mix(baseCol * 0.55, accentCol, smoothstep(-0.2, 0.7, blade));
      } else if (matId == 46) {
        // Battery: metallic casing + copper top + green charge indicator
        float soc = float(meta) / 250.0;
        if (mod(fpx.y, 6.0) < 1.5) {
          col = accentCol;
        } else {
          col = mix(vec3(0.25, 0.28, 0.32), vec3(0.10, 0.78, 0.48), soc);
        }
      } else if (matId == 52 && volt > 3.5) {
        // Powered LED Lamp!
        col = vec3(1.4, 1.35, 1.08);
        emissiveBoost = 1.6;
      }

      // Travelling voltage pulse along energized wires & coils!
      if (volt > 2.0) {
        float pulse = 0.5 + 0.5 * sin((fpx.x + fpx.y) * 0.45 - uTime * 14.0);
        col += vec3(0.15, 0.62, 0.95) * clamp(volt / 48.0, 0.0, 1.0) * (0.35 + 0.65 * pulse);
      }
    } else if (style == 36) {
      // RADIOACTIVE URANIUM: Metallic actinide + eerie Cherenkov/nuclear glow
      col = mix(baseCol, accentCol, 0.35 + 0.35 * sin(uTime * 3.2 + seed * 6.28));
      emissiveBoost = 0.65;
    } else if (style == 37) {
      // PLASMA / FIRE / ELECTRIC ARC / NEUTRON
      float flicker = 0.7 + 0.3 * sin(uTime * 22.0 + seed * 12.0 + fpx.y * 0.3);
      col = mix(baseCol, accentCol, clamp(wetness * flicker, 0.2, 1.0)) * 1.35;
      emissiveBoost = 1.85;
    }

    // Capillary liquid saturation tinting on porous Sand, Soil, Sponge, Sawdust, Brick!
    if (wetness > 0.08 && absMatId > 0 && (style == 1 || style == 7 || style == 11 || style == 12 || style == 16)) {
      vec3 liqCol = texelFetch(uMatStyleTex, ivec2(absMatId, 0), 0).rgb;
      col = mix(col, col * 0.58 + liqCol * 0.36, clamp(wetness * 0.85, 0.0, 0.78));
    }
  }

  // Directional PBR Shading + Specular Highlight
  if (emissiveBoost < 0.5) {
    float shade = 0.76 + 0.34 * ndl;
    col *= shade;
    if (uRefractionSpec == 1 && (style == 3 || style == 4 || style == 6 || style == 17 || style == 18 || style == 19)) {
      vec3 halfVec = normalize(lightDir + vec3(0.0, 0.0, 1.0));
      float spec = pow(clamp(dot(normal, halfVec), 0.0, 1.0), 18.0);
      col += accentCol * spec * 0.42;
    }
  }

  // Planck Blackbody Thermal Radiation on ANY hot material!
  if (tempC > 525.0 && !(matId == 62 && meta > 0)) {
    vec3 bb = blackbodyColor(tempC);
    float blend = clamp((tempC - 525.0) / 1300.0, 0.0, 0.92);
    col = mix(col, bb, blend) + bb * 0.35;
  } else if (tempC < -35.0 && style != 6 && style != 15) {
    // Cryogenic frost rime on deep-frozen metals/walls!
    float frost = clamp((-35.0 - tempC) / 160.0, 0.0, 0.55);
    col = mix(col, vec3(0.78, 0.92, 1.0), frost * (0.5 + 0.5 * seed));
  }

  // Add local GPU volumetric radiance illumination
  col += rad.rgb * 0.28;

  fragColor = vec4(col, 1.0 + emissiveBoost);
}
`;

export const BLOOM_BLUR_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTex;
uniform vec2 uDir;
uniform int uExtractPass;

void main() {
  const float weights[5] = float[](0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);
  vec4 center = texture(uTex, vUv);

  vec3 sum = center.rgb;
  if (uExtractPass == 1) {
    float lum = max(max(sum.r, sum.g), sum.b);
    sum = (lum > 0.78 || center.a > 1.2) ? sum * clamp(lum - 0.45, 0.2, 2.0) : vec3(0.0);
  }
  sum *= weights[0];

  for (int i = 1; i < 5; i++) {
    vec2 off = uDir * float(i) * 1.65;
    vec4 s1 = texture(uTex, vUv + off);
    vec4 s2 = texture(uTex, vUv - off);
    vec3 c1 = s1.rgb;
    vec3 c2 = s2.rgb;
    if (uExtractPass == 1) {
      float l1 = max(max(c1.r, c1.g), c1.b);
      float l2 = max(max(c2.r, c2.g), c2.b);
      c1 = (l1 > 0.78 || s1.a > 1.2) ? c1 * clamp(l1 - 0.45, 0.2, 2.0) : vec3(0.0);
      c2 = (l2 > 0.78 || s2.a > 1.2) ? c2 * clamp(l2 - 0.45, 0.2, 2.0) : vec3(0.0);
    }
    sum += (c1 + c2) * weights[i];
  }

  fragColor = vec4(sum, 1.0);
}
`;

export const COMPOSITE_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSceneTex;
uniform sampler2D uBloomTex;
uniform sampler2D uRadianceTex;
uniform float uBloomIntensity;
uniform float uTime;
uniform int uHeatShimmer;

void main() {
  vec2 uv = vUv;

  // Heat-haze refractive air shimmer near extreme temperatures (> 350°C)
  if (uHeatShimmer == 1) {
    float heat = texture(uRadianceTex, uv).a;
    if (heat > 0.28) {
      float strength = clamp((heat - 0.28) * 0.0045, 0.0, 0.0035);
      uv.x += sin(uv.y * 95.0 + uTime * 12.0) * strength;
      uv.y += cos(uv.x * 85.0 + uTime * 9.5) * strength * 0.6;
      uv = clamp(uv, vec2(0.001), vec2(0.999));
    }
  }

  vec3 scene = texture(uSceneTex, uv).rgb;
  vec3 bloom = texture(uBloomTex, uv).rgb * uBloomIntensity;

  // ACES-inspired filmic HDR tone mapping so glowing fire, plasma & white-hot steel never clip ugly!
  vec3 hdr = scene + bloom;
  vec3 mapped = (hdr * (2.51 * hdr + 0.03)) / (hdr * (2.43 * hdr + 0.59) + 0.14);
  mapped = pow(clamp(mapped, 0.0, 1.0), vec3(0.95));

  fragColor = vec4(mapped, 1.0);
}
`;
