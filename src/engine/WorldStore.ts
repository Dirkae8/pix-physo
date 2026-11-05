import type { World } from './World';
import type { EnvironmentConfig, SensorPin } from '../types/physics';
import type { HangingWire } from './Wires';

type Field = 'mat' | 'temp' | 'vx' | 'vy' | 'wetness' | 'absorbedMat' | 'volt' | 'current' | 'meta' | 'stress' | 'seed' | 'airPressure' | 'airVx' | 'airVy';
const FIELDS: Field[] = ['mat','temp','vx','vy','wetness','absorbedMat','volt','current','meta','stress','seed','airPressure','airVx','airVy'];
type NumericArray = Uint8Array | Float32Array;
interface Save { name: string; date: number; width: number; height: number; env: EnvironmentConfig; time: number; tick: number; sensors: SensorPin[]; wires: HangingWire[]; fields: Record<Field, NumericArray>; }

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('PIXPHYSO-worlds', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('worlds', {keyPath: 'name'});
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('База сохранений занята другой вкладкой'));
  });
}
async function transaction<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('worlds', mode), request = action(tx.objectStore('worlds'));
    tx.oncomplete = () => { db.close(); resolve(request.result); };
    tx.onerror = () => { db.close(); reject(tx.error || request.error); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error('Сохранение отменено')); };
  });
}
export async function listWorlds(): Promise<{name: string; date: number}[]> {
  const all = await transaction<Save[]>('readonly', store => store.getAll());
  return all.map(({name, date}) => ({name, date})).sort((a,b) => b.date-a.date);
}
export async function saveWorld(world: World, name: string): Promise<void> {
  const fields = {} as Record<Field, NumericArray>;
  for (const field of FIELDS) fields[field] = world[field].slice();
  const save: Save = {name, date: Date.now(), width: world.width, height: world.height, env: {...world.env}, time: world.timeSec, tick: world.stepTick, sensors: world.sensors.map(pin => ({...pin})), wires: world.wires.map(wire => ({...wire, points: wire.points.map(point => ({...point}))})), fields};
  await transaction('readwrite', store => store.put(save));
}
export async function deleteWorld(name: string): Promise<void> { await transaction('readwrite', store => store.delete(name)); }
export async function loadWorld(world: World, name: string): Promise<void> {
  const save = await transaction<Save | undefined>('readonly', store => store.get(name));
  if (!save || !Number.isInteger(save.width) || !Number.isInteger(save.height) || save.width < 1 || save.height < 1 || save.width > 2000 || save.height > 2000) throw new Error('Повреждённое сохранение');
  const size = save.width * save.height, airSize = Math.ceil(save.width / world.airScale) * Math.ceil(save.height / world.airScale);
  for (const field of FIELDS) {
    const arr = save.fields?.[field], expected = field.startsWith('air') ? airSize : size;
    if (!(arr instanceof Uint8Array || arr instanceof Float32Array) || arr.length !== expected) throw new Error('Повреждённые данные поля');
  }
  world.resize(save.width, save.height);
  world.resetUndoHistory(); world.stamp.fill(0); world.releaseHand(true);
  for (const field of FIELDS) world[field].set(save.fields[field]);
  Object.assign(world.env, save.env);
  world.timeSec = save.time; world.stepTick = save.tick;
  world.sensors = save.sensors || []; world.wires = save.wires || [];
}
