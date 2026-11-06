import type { ElementModule } from '../materials/elementApi';
import { installElement } from '../materials/elementRegistry';
import type { ModBundle, ModManifest } from './types';
import core_materials from './core-materials.mod';
import phase_reactions from './phase-reactions.mod';
import expansion_solids from './expansion-solids.mod';
import expansion_powders from './expansion-powders.mod';
import expansion_fluids from './expansion-fluids.mod';
import expansion_energy from './expansion-energy.mod';

export const MODS: ModManifest[] = [
  core_materials,
  phase_reactions,
  expansion_solids,
  expansion_powders,
  expansion_fluids,
  expansion_energy,
];

export function getMod(id: string): ModManifest | undefined {
  return MODS.find(m => m.id === id);
}

/** Установить сторонний мод: каждый его элемент регистрируется отдельно. */
export function installMod(bundle: ModBundle): number[] {
  const ids: number[] = [];
  for (const element of bundle.elements) ids.push(installElement(element));
  return ids;
}
export type { ModBundle, ModManifest } from './types';
