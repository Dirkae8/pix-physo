import type { ElementModule } from '../materials/elementApi';

/** Один мод = один файл-манифест со списком своих элементов. */
export interface ModManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  elements: readonly number[];
}
export function defineMod(m: ModManifest): ModManifest { return m; }

/** Контракт стороннего мода: можно поставлять новые элементы отдельным файлом. */
export interface ModBundle {
  manifest: ModManifest;
  elements: readonly ElementModule[];
}
