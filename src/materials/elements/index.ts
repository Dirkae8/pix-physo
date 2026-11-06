// Сгенерировано scripts/generate-elements.mjs — 251 элементов.
// Порядок по id обязателен: RAW_MATERIALS[0] должен быть «Воздух».
import type { ElementModule } from '../elementApi';

import e0 from './empty';
import e1 from './brick';
import e2 from './wood';
import e3 from './steel';
import e4 from './glass';
import e5 from './titanium';
import e6 from './concrete';
import e7 from './ice';
import e8 from './sponge';
import e9 from './rubber';
import e10 from './ceramic';
import e11 from './wax';
import e12 from './lead';
import e13 from './sand';
import e14 from './soil';
import e15 from './salt';
import e16 from './sugar';
import e17 from './coal';
import e18 from './snow';
import e19 from './sawdust';
import e20 from './cement';
import e21 from './sodium';
import e22 from './gold';
import e23 from './iron_filings';
import e24 from './water';
import e25 from './mercury';
import e26 from './lava';
import e27 from './motor_oil';
import e28 from './crude_oil';
import e29 from './gasoline';
import e30 from './acid';
import e31 from './liquid_nitrogen';
import e32 from './ethanol';
import e33 from './honey';
import e34 from './nitroglycerin';
import e35 from './hydrogen';
import e36 from './methane';
import e37 from './propane';
import e38 from './acetylene';
import e39 from './oxygen';
import e40 from './steam';
import e41 from './smoke';
import e42 from './co2';
import e43 from './chlorine';
import e44 from './copper_wire';
import e45 from './insulated_wire';
import e46 from './battery';
import e47 from './generator';
import e48 from './button';
import e49 from './switch';
import e50 from './fan';
import e51 from './heater';
import e52 from './lamp';
import e53 from './tesla_coil';
import e54 from './detonator';
import e55 from './gunpowder';
import e56 from './tnt';
import e57 from './c4';
import e58 from './thermite';
import e59 from './napalm';
import e60 from './uranium';
import e61 from './neutron';
import e62 from './fire';
import e63 from './plasma';
import e64 from './tool_hand';
import e65 from './tool_heat';
import e66 from './tool_cool';
import e67 from './tool_wind';
import e68 from './tool_eraser';
import e69 from './molten_metal';
import e70 from './molten_glass';
import e71 from './saltwater';
import e72 from './syrup';
import e73 from './basalt';
import e74 from './charcoal';
import e75 from './glass_shards';
import e76 from './fuel_vapor';
import e77 from './electric_arc';
import e78 from './ember';
import e79 from './molten_wax';
import e80 from './granite';
import e81 from './aluminum';
import e82 from './obsidian';
import e83 from './sulfur';
import e84 from './magnesium';
import e85 from './potassium';
import e86 from './quicklime';
import e87 from './liquid_oxygen';
import e88 from './peroxide';
import e89 from './glycerin';
import e90 from './seawater';
import e91 from './nitrogen';
import e92 from './helium';
import e93 from './neon';
import e94 from './argon';
import e95 from './fluorine';
import e96 from './ammonia';
import e97 from './silver_wire';
import e98 from './aluminum_wire';
import e99 from './resistor';
import e100 from './carbon_electrode';
import e101 from './plutonium';
import e102 from './rdx';
import e103 from './petn';
import e104 from './dynamite';
import e105 from './black_powder';
import e106 from './flash_powder';
import e107 from './white_phosphorus';
import e108 from './fuel_gel';
import e109 from './tool_sensor';
import e110 from './tool_laser';
import e111 from './tool_vortex';
import e112 from './tool_shock';
import e113 from './tool_spark';
import e114 from './tool_mixer';
import e115 from './tool_cryo';
import e116 from './tool_ignite';
import e117 from './ethanol_vapor';
import e118 from './molten_aluminum';
import e119 from './molten_gold';
import e120 from './molten_lead';
import e121 from './molten_titanium';
import e122 from './molten_iron_filings';
import e123 from './dry_ice';
import e124 from './alkali';
import e125 from './frost';
import e126 from './rust';
import e127 from './capacitor';
import e128 from './diode';
import e129 from './fuse';
import e130 from './thermostat';
import e131 from './pressure_switch';
import e132 from './pump';
import e133 from './valve';
import e134 from './extinguisher';
import e135 from './water_vapor';
import e136 from './relay';
import e137 from './electromagnet';
import e138 from './compressor';
import e139 from './vacuum_pump';
import e140 from './soot';
import e141 from './molten_copper_wire';
import e142 from './molten_silver_wire';
import e143 from './gas_cylinder';
import e144 from './ground';
import e145 from './wick';
import e146 from './plastic_abs';
import e147 from './pvc';
import e148 from './polyethylene';
import e149 from './kevlar';
import e150 from './paper';
import e151 from './cardboard';
import e152 from './styrofoam';
import e153 from './silicone';
import e154 from './plywood';
import e155 from './cotton_cloth';
import e156 from './cork';
import e157 from './linoleum';
import e158 from './drywall';
import e159 from './ceramic_wool';
import e160 from './fr4';
import e161 from './copper_plate';
import e162 from './brass';
import e163 from './cast_iron';
import e164 from './asphalt';
import e165 from './graphite_block';
import e166 from './marble';
import e167 from './dry_water';
import e168 from './flour';
import e169 from './starch';
import e170 from './cocoa';
import e171 from './detergent';
import e172 from './silica_gel';
import e173 from './aluminum_filings';
import e174 from './titanium_filings';
import e175 from './glass_grit';
import e176 from './alumina';
import e177 from './gypsum';
import e178 from './baking_soda';
import e179 from './coal_dust';
import e180 from './expanded_clay';
import e181 from './chicken_broth';
import e182 from './vegetable_oil';
import e183 from './milk';
import e184 from './vinegar';
import e185 from './soy_sauce';
import e186 from './beer';
import e187 from './red_wine';
import e188 from './coffee_drink';
import e189 from './condensed_milk';
import e190 from './orange_juice';
import e191 from './maple_syrup';
import e192 from './diesel';
import e193 from './kerosene';
import e194 from './acetone';
import e195 from './benzene';
import e196 from './toluene';
import e197 from './turpentine';
import e198 from './olive_oil';
import e199 from './castor_oil';
import e200 from './liquid_soap';
import e201 from './ozone';
import e202 from './nitrous_oxide';
import e203 from './carbon_monoxide';
import e204 from './sulfur_dioxide';
import e205 from './hydrogen_sulfide';
import e206 from './butane';
import e207 from './ethylene';
import e208 from './xenon';
import e209 from './krypton';
import e210 from './water_mist';
import e211 from './acid_fumes';
import e212 from './hydrogen_chloride';
import e213 from './biogas';
import e214 from './sf6';
import e215 from './gold_wire';
import e216 from './nichrome_wire';
import e217 from './superconductor';
import e218 from './graphene_wire';
import e219 from './ceramic_insulator';
import e220 from './glass_insulator';
import e221 from './piezo';
import e222 from './thermocouple';
import e223 from './led_strip';
import e224 from './wire_resistor';
import e225 from './ammonal';
import e226 from './anfo';
import e227 from './mercury_fulminate';
import e228 from './lead_azide';
import e229 from './picric_acid';
import e230 from './tetryl';
import e231 from './hmx';
import e232 from './nitrocellulose';
import e233 from './nitromethane';
import e234 from './pyro_mix';
import e235 from './tool_magnet';
import e236 from './tool_vacuum';
import e237 from './tool_hammer';
import e238 from './tool_dryer';
import e239 from './acrylic_glass';
import e240 from './basalt_slab';
import e241 from './chalk';
import e242 from './graphite_dust';
import e243 from './mercury_vapor';
import e244 from './radon';
import e245 from './molten_plastic';
import e246 from './broth_vapor';
import e247 from './oil_vapor';
import e248 from './solvent_vapor';
import e249 from './plastic_fume';
import e250 from './paper_ash';

export const ELEMENT_MODULES: ElementModule[] = [
  e0,
  e1,
  e2,
  e3,
  e4,
  e5,
  e6,
  e7,
  e8,
  e9,
  e10,
  e11,
  e12,
  e13,
  e14,
  e15,
  e16,
  e17,
  e18,
  e19,
  e20,
  e21,
  e22,
  e23,
  e24,
  e25,
  e26,
  e27,
  e28,
  e29,
  e30,
  e31,
  e32,
  e33,
  e34,
  e35,
  e36,
  e37,
  e38,
  e39,
  e40,
  e41,
  e42,
  e43,
  e44,
  e45,
  e46,
  e47,
  e48,
  e49,
  e50,
  e51,
  e52,
  e53,
  e54,
  e55,
  e56,
  e57,
  e58,
  e59,
  e60,
  e61,
  e62,
  e63,
  e64,
  e65,
  e66,
  e67,
  e68,
  e69,
  e70,
  e71,
  e72,
  e73,
  e74,
  e75,
  e76,
  e77,
  e78,
  e79,
  e80,
  e81,
  e82,
  e83,
  e84,
  e85,
  e86,
  e87,
  e88,
  e89,
  e90,
  e91,
  e92,
  e93,
  e94,
  e95,
  e96,
  e97,
  e98,
  e99,
  e100,
  e101,
  e102,
  e103,
  e104,
  e105,
  e106,
  e107,
  e108,
  e109,
  e110,
  e111,
  e112,
  e113,
  e114,
  e115,
  e116,
  e117,
  e118,
  e119,
  e120,
  e121,
  e122,
  e123,
  e124,
  e125,
  e126,
  e127,
  e128,
  e129,
  e130,
  e131,
  e132,
  e133,
  e134,
  e135,
  e136,
  e137,
  e138,
  e139,
  e140,
  e141,
  e142,
  e143,
  e144,
  e145,
  e146,
  e147,
  e148,
  e149,
  e150,
  e151,
  e152,
  e153,
  e154,
  e155,
  e156,
  e157,
  e158,
  e159,
  e160,
  e161,
  e162,
  e163,
  e164,
  e165,
  e166,
  e167,
  e168,
  e169,
  e170,
  e171,
  e172,
  e173,
  e174,
  e175,
  e176,
  e177,
  e178,
  e179,
  e180,
  e181,
  e182,
  e183,
  e184,
  e185,
  e186,
  e187,
  e188,
  e189,
  e190,
  e191,
  e192,
  e193,
  e194,
  e195,
  e196,
  e197,
  e198,
  e199,
  e200,
  e201,
  e202,
  e203,
  e204,
  e205,
  e206,
  e207,
  e208,
  e209,
  e210,
  e211,
  e212,
  e213,
  e214,
  e215,
  e216,
  e217,
  e218,
  e219,
  e220,
  e221,
  e222,
  e223,
  e224,
  e225,
  e226,
  e227,
  e228,
  e229,
  e230,
  e231,
  e232,
  e233,
  e234,
  e235,
  e236,
  e237,
  e238,
  e239,
  e240,
  e241,
  e242,
  e243,
  e244,
  e245,
  e246,
  e247,
  e248,
  e249,
  e250,
];
