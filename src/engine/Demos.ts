import { MAT } from '../materials/registry';
import { World } from './World';

export interface DemoScene {
  id: string;
  title: string;
  subtitle: string;
  build: (world: World) => void;
}

function fillRect(world: World, x0: number, y0: number, x1: number, y1: number, matId: number, temp?: number): void {
  const minX = Math.max(0, Math.min(x0, x1));
  const maxX = Math.min(world.width - 1, Math.max(x0, x1));
  const minY = Math.max(0, Math.min(y0, y1));
  const maxY = Math.min(world.height - 1, Math.max(y0, y1));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      world.setCell(x, y, matId, temp);
    }
  }
}

export const DEMO_SCENES: DemoScene[] = [
  {
    id: 'physics_lab',
    title: 'Физическая лаборатория (Всё сразу)',
    subtitle: 'Электроцепь с тумблером и вентилятором, башня плотностей (ртуть-вода-масло) и лавовый тигель',
    build: (world: World) => {
      world.clear();
      const w = world.width;
      const h = world.height;
      const floorY = h - 18;

      // Concrete foundation
      fillRect(world, 16, floorY, w - 17, floorY + 7, MAT.CONCRETE);

      // LEFT CHAMBER: Density Tower (Mercury + Steel ball floating on Mercury + Water + Motor Oil)
      const t1L = 28;
      const t1R = Math.round(w * 0.31);
      fillRect(world, t1L, floorY - 96, t1L + 5, floorY, MAT.GLASS);
      fillRect(world, t1R - 5, floorY - 96, t1R, floorY, MAT.GLASS);
      fillRect(world, t1L + 6, floorY - 18, t1R - 6, floorY - 1, MAT.MERCURY);
      fillRect(world, t1L + 6, floorY - 50, t1R - 6, floorY - 20, MAT.WATER);
      fillRect(world, t1L + 6, floorY - 72, t1R - 6, floorY - 52, MAT.MOTOR_OIL);
      // Drop pure Gold nuggets (sink in Mercury!) and Iron filings (float on Mercury!)
      fillRect(world, t1L + 16, floorY - 82, t1L + 28, floorY - 76, MAT.GOLD);
      fillRect(world, t1R - 32, floorY - 82, t1R - 18, floorY - 76, MAT.IRON_FILINGS);

      // CENTER CHAMBER: Interactive Electric Circuit (Generator -> Switch -> Fan + Lamp + Nichrome Water Boiler!)
      const cL = Math.round(w * 0.35);
      const cR = Math.round(w * 0.67);
      // Platform
      fillRect(world, cL, floorY - 52, cR, floorY - 47, MAT.BRICK);
      // Generator -> Copper Wire -> Toggle Switch -> Branch to Fan, LED Lamp, and Nichrome Boiler
      fillRect(world, cL + 6, floorY - 66, cL + 19, floorY - 53, MAT.GENERATOR);
      fillRect(world, cL + 20, floorY - 59, cL + 34, floorY - 57, MAT.COPPER_WIRE);
      // Toggle Switch (ON by default - click it to turn circuit OFF/ON!)
      fillRect(world, cL + 35, floorY - 64, cL + 47, floorY - 53, MAT.SWITCH);
      fillRect(world, cL + 48, floorY - 59, cR - 16, floorY - 57, MAT.COPPER_WIRE);

      // Lamp post
      fillRect(world, cL + 64, floorY - 78, cL + 66, floorY - 60, MAT.COPPER_WIRE);
      fillRect(world, cL + 60, floorY - 90, cL + 70, floorY - 79, MAT.LAMP);

      // Turbine Fan blowing right across smoke/sparks
      fillRect(world, cR - 15, floorY - 74, cR - 5, floorY - 53, MAT.FAN);

      // Lower Water Boiler heated by Nichrome Coil
      fillRect(world, cL + 22, floorY - 40, cL + 26, floorY - 1, MAT.STEEL);
      fillRect(world, cR - 26, floorY - 40, cR - 22, floorY - 1, MAT.STEEL);
      fillRect(world, cL + 48, floorY - 56, cL + 50, floorY - 8, MAT.INSULATED_WIRE);
      fillRect(world, cL + 34, floorY - 7, cR - 34, floorY - 4, MAT.HEATER);
      fillRect(world, cL + 27, floorY - 30, cR - 27, floorY - 8, MAT.WATER);

      // RIGHT CHAMBER: Ceramic Forge with Lava + Ice & Sand test
      const fL = Math.round(w * 0.72);
      const fR = w - 28;
      fillRect(world, fL, floorY - 84, fL + 6, floorY, MAT.CERAMIC);
      fillRect(world, fR - 6, floorY - 84, fR, floorY, MAT.CERAMIC);
      fillRect(world, fL, floorY - 6, fR, floorY, MAT.CERAMIC);
      fillRect(world, fL + 7, floorY - 34, fR - 7, floorY - 7, MAT.LAVA);
      // Steel bridge above lava heating up by blackbody radiation & conduction
      fillRect(world, fL + 7, floorY - 52, fR - 7, floorY - 48, MAT.STEEL);
      fillRect(world, fL + 18, floorY - 68, fR - 18, floorY - 53, MAT.WAX);
    },
  },
  {
    id: 'oil_absorption',
    title: 'Впитывание масла и гидростатика',
    subtitle: 'Ровный горизонт жидкости без пустот, капиллярная пропитка песка и губки',
    build: (world: World) => {
      world.clear();
      const w = world.width;
      const h = world.height;
      const L = Math.round(w * 0.14);
      const R = Math.round(w * 0.86);
      const B = h - 24;
      const T = Math.round(h * 0.28);

      // Brick basin
      fillRect(world, L, T, L + 7, B, MAT.BRICK);
      fillRect(world, R - 7, T, R, B, MAT.BRICK);
      fillRect(world, L, B - 6, R, B, MAT.BRICK);

      // Porous Quartz Sand dune on left-center + Sponge block on right
      for (let y = B - 32; y <= B - 7; y++) {
        const inset = Math.round((B - 7 - y) * 1.2);
        fillRect(world, L + 28 + inset, y, Math.round(w * 0.62) - inset, y, MAT.SAND);
      }
      fillRect(world, Math.round(w * 0.68), B - 28, R - 24, B - 7, MAT.SPONGE);

      // Pour realistic amber Motor Oil above — settles flat into every corner & seeps into pores!
      fillRect(world, L + 10, B - 72, R - 10, B - 35, MAT.MOTOR_OIL);
    },
  },
  {
    id: 'communicating_vessels',
    title: 'Сообщающиеся сосуды (Закон Паскаля)',
    subtitle: 'Вода перетекает по нижнему каналу U-образной трубы и выравнивает уровни в обоих коленах',
    build: (world: World) => {
      world.clear();
      const w = world.width;
      const h = world.height;
      const L = Math.round(w * 0.22);
      const R = Math.round(w * 0.78);
      const midL = Math.round(w * 0.44);
      const midR = Math.round(w * 0.56);
      const topY = Math.round(h * 0.2);
      const botY = h - 22;

      // Outer U-tube walls (Glass + Steel base)
      fillRect(world, L, topY, L + 6, botY, MAT.GLASS);
      fillRect(world, R - 6, topY, R, botY, MAT.GLASS);
      fillRect(world, L, botY - 6, R, botY, MAT.STEEL);

      // Center divider leaving a submerged channel at the bottom!
      fillRect(world, midL, topY + 10, midR, botY - 30, MAT.BRICK);

      // Fill ONLY the left arm high with Water — watch Pascal's hydrostatic head push water UP the right arm!
      fillRect(world, L + 7, topY + 18, midL - 1, botY - 7, MAT.WATER);
    },
  },
  {
    id: 'wind_tunnel_circuit',
    title: 'Аэродинамическая труба и Электрика',
    subtitle: 'Генератор, аккумулятор, кнопка, тумблер и турбины с дымовыми струями',
    build: (world: World) => {
      world.clear();
      const w = world.width;
      const h = world.height;
      const topY = Math.round(h * 0.26);
      const botY = Math.round(h * 0.72);

      // Glass wind-tunnel duct
      fillRect(world, 45, topY, w - 45, topY + 5, MAT.GLASS);
      fillRect(world, 45, botY, w - 45, botY + 5, MAT.GLASS);

      // Stack of 3 electric Fans at wind-tunnel intake (blowing East ->)
      world.activeFanDir = 0;
      fillRect(world, 52, topY + 10, 64, botY - 5, MAT.FAN);

      // Aerodynamic airfoil obstacle inside the tunnel
      for (let dx = 0; dx < 56; dx++) {
        const halfH = Math.round(Math.sin((dx / 56) * Math.PI) * 14);
        const cy = Math.round((topY + botY) * 0.5);
        fillRect(world, Math.round(w * 0.46) + dx, cy - halfH, Math.round(w * 0.46) + dx, cy + halfH, MAT.TITANIUM);
      }

      // Power station underneath: Generator -> Switch -> Battery -> Wire to Fans & Lamps
      const pY = botY + 28;
      fillRect(world, 45, pY + 14, 290, pY + 19, MAT.CONCRETE);
      fillRect(world, 54, pY, 72, pY + 13, MAT.GENERATOR);
      fillRect(world, 73, pY + 6, 95, pY + 8, MAT.COPPER_WIRE);
      fillRect(world, 96, pY + 1, 112, pY + 13, MAT.SWITCH);
      fillRect(world, 113, pY + 6, 138, pY + 8, MAT.COPPER_WIRE);
      fillRect(world, 139, pY, 158, pY + 13, MAT.BATTERY);
      // Vertical insulated cable up to the Fans
      fillRect(world, 58, botY - 4, 60, pY + 6, MAT.INSULATED_WIRE);

      // Coal brazier at tunnel entrance producing visible warm smoke & embers for streamline visualization
      fillRect(world, 82, botY - 12, 108, botY - 1, MAT.COAL);
      fillRect(world, 84, botY - 16, 106, botY - 13, MAT.FIRE);
    },
  },
  {
    id: 'c4_bunker',
    title: 'Штурм бункера: C-4 + Электродетонатор',
    subtitle: 'Нажмите на красную КНОПКУ слева на поле, чтобы подать ток на детонатор и подорвать заряд C-4!',
    build: (world: World) => {
      world.clear();
      const w = world.width;
      const h = world.height;
      const floorY = h - 20;

      fillRect(world, 15, floorY, w - 16, floorY + 10, MAT.CONCRETE);

      // Firing post on the left: Battery + Push Button (click the red button!) + Long Copper Cable
      fillRect(world, 34, floorY - 20, 52, floorY - 1, MAT.BATTERY);
      fillRect(world, 53, floorY - 10, 66, floorY - 8, MAT.COPPER_WIRE);
      // Red Push Button (unpressed initially: meta = 0)
      fillRect(world, 67, floorY - 18, 82, floorY - 1, MAT.BUTTON);
      // Insulated firing cable running across the ground to bunker wall
      const bL = Math.round(w * 0.48);
      const bR = Math.round(w * 0.84);
      fillRect(world, 83, floorY - 4, bL - 8, floorY - 2, MAT.INSULATED_WIRE);

      // Multi-layer Bunker (Brick outer wall, Glass observation windows, Fuel barrels inside!)
      fillRect(world, bL, floorY - 92, bL + 10, floorY - 1, MAT.BRICK);
      fillRect(world, bR - 10, floorY - 92, bR, floorY - 1, MAT.CONCRETE);
      fillRect(world, bL, floorY - 98, bR, floorY - 92, MAT.CONCRETE);
      fillRect(world, bL + 30, floorY - 91, bL + 34, floorY - 58, MAT.GLASS);

      // Breaching C-4 Charge + Electric Detonator attached to outer brick wall!
      fillRect(world, bL - 12, floorY - 38, bL - 1, floorY - 12, MAT.C4);
      fillRect(world, bL - 10, floorY - 11, bL - 4, floorY - 2, MAT.DETONATOR);

      // Inside bunker: Gasoline tank + Propane gas pocket
      fillRect(world, bL + 45, floorY - 28, bR - 25, floorY - 1, MAT.GASOLINE);
      fillRect(world, bL + 20, floorY - 84, bR - 20, floorY - 64, MAT.PROPANE);
    },
  },
  {
    id: 'thermite_armor',
    title: 'Термит 2500 °C против стальной брони',
    subtitle: 'Самоокисляющаяся реакция Fe₂O₃ + Al прожигает три листа конструкционной стали насквозь',
    build: (world: World) => {
      world.clear();
      const w = world.width;
      const h = world.height;
      const cx = Math.round(w * 0.5);

      // Ceramic funnel holding Thermite charge
      fillRect(world, cx - 48, 42, cx - 42, 92, MAT.CERAMIC);
      fillRect(world, cx + 42, 42, cx + 48, 92, MAT.CERAMIC);
      fillRect(world, cx - 41, 56, cx + 41, 88, MAT.THERMITE);
      // High-temp plasma/magnesium igniter at center top
      fillRect(world, cx - 8, 50, cx + 8, 56, MAT.PLASMA);

      // 3 stacked Steel armor plates + bottom Water quench tank!
      fillRect(world, cx - 95, 118, cx + 95, 124, MAT.STEEL);
      fillRect(world, cx - 95, 158, cx + 95, 164, MAT.STEEL);
      fillRect(world, cx - 95, 198, cx + 95, 204, MAT.STEEL);

      // Glass water basin at bottom to catch white-hot molten iron drips!
      fillRect(world, cx - 110, 215, cx - 104, h - 14, MAT.GLASS);
      fillRect(world, cx + 104, 215, cx + 110, h - 14, MAT.GLASS);
      fillRect(world, cx - 110, h - 14, cx + 110, h - 8, MAT.STEEL);
      fillRect(world, cx - 103, h - 42, cx + 103, h - 15, MAT.WATER);
    },
  },
  {
    id: 'tesla_electrolysis',
    title: 'Катушка Тесла и Электролиз рассола',
    subtitle: 'Высоковольтные молнии бьют в электроды, разлагая солёную воду на гремучий водород и кислород',
    build: (world: World) => {
      world.clear();
      const w = world.width;
      const h = world.height;
      const cx = Math.round(w * 0.5);
      const floorY = h - 22;

      // Twin Tesla towers powered by Generators
      fillRect(world, cx - 120, floorY - 18, cx - 98, floorY, MAT.GENERATOR);
      fillRect(world, cx - 112, floorY - 72, cx - 106, floorY - 19, MAT.COPPER_WIRE);
      fillRect(world, cx - 116, floorY - 88, cx - 102, floorY - 73, MAT.TESLA_COIL);

      fillRect(world, cx + 98, floorY - 18, cx + 120, floorY, MAT.GENERATOR);
      fillRect(world, cx + 106, floorY - 72, cx + 112, floorY - 19, MAT.COPPER_WIRE);
      fillRect(world, cx + 102, floorY - 88, cx + 116, floorY - 73, MAT.TESLA_COIL);

      // Central Glass Electrolysis Vat with Water + Salt crystals dissolving into conductive Brine!
      fillRect(world, cx - 72, floorY - 68, cx - 66, floorY, MAT.GLASS);
      fillRect(world, cx + 66, floorY - 68, cx + 72, floorY, MAT.GLASS);
      fillRect(world, cx - 72, floorY, cx + 72, floorY + 6, MAT.GLASS);
      fillRect(world, cx - 65, floorY - 46, cx + 65, floorY - 1, MAT.WATER);
      fillRect(world, cx - 45, floorY - 60, cx + 45, floorY - 48, MAT.SALT);
      // Steel lightning-rod electrodes dipping into the brine
      fillRect(world, cx - 54, floorY - 76, cx - 50, floorY - 12, MAT.STEEL);
      fillRect(world, cx + 50, floorY - 76, cx + 54, floorY - 12, MAT.STEEL);
    },
  },
  {
    id: 'nuclear_reactor',
    title: 'Ядерный реактор (Уран-235 + Свинец)',
    subtitle: 'Свинцово-бетонный саркофаг и топливные стержни урана. Выстрелите нейтронами, чтобы запустить цепную реакцию!',
    build: (world: World) => {
      world.clear();
      const w = world.width;
      const h = world.height;
      const cx = Math.round(w * 0.5);
      const cy = Math.round(h * 0.55);

      // Heavy Concrete + Lead radiation biological shield
      fillRect(world, cx - 96, cy - 68, cx + 96, cy + 68, MAT.CONCRETE);
      fillRect(world, cx - 84, cy - 56, cx + 84, cy + 56, MAT.LEAD);
      fillRect(world, cx - 72, cy - 44, cx + 72, cy + 44, MAT.EMPTY);

      // Cooling water pool + 4 Uranium-235 fuel rods
      fillRect(world, cx - 72, cy - 10, cx + 72, cy + 44, MAT.WATER);
      for (const offset of [-45, -15, 15, 45]) {
        fillRect(world, cx + offset - 4, cy - 26, cx + offset + 4, cy + 38, MAT.URANIUM);
      }

      // Top inspection window (Glass) + small starter Neutron pulse
      fillRect(world, cx - 24, cy - 68, cx + 24, cy - 45, MAT.GLASS);
      world.setCell(cx - 14, cy - 34, MAT.NEUTRON);
    },
  },
];
