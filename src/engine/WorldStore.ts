import type { World } from './World';
import type { EnvironmentConfig, SensorPin } from '../types/physics';
import type { HangingWire } from './Wires';
import type { Wheel, MechanicalSpring } from './MechanicalSystem';

type Field = 'mat' | 'temp' | 'vx' | 'vy' | 'wetness' | 'absorbedMat' | 'volt' | 'current' | 'meta' | 'stress' | 'seed' | 'airPressure' | 'airVx' | 'airVy' | 'airOxygen' | 'waveHeight' | 'waveVelocity';
const FIELDS: Field[] = ['mat','temp','vx','vy','wetness','absorbedMat','volt','current','meta','stress','seed','airPressure','airVx','airVy','airOxygen','waveHeight','waveVelocity'];
type NumericArray = Uint8Array | Float32Array;
interface Save { name: string; date: number; width: number; height: number; env: EnvironmentConfig; time: number; tick: number; sensors: SensorPin[]; wires: HangingWire[]; wheels?: Wheel[]; mechanicalSprings?: MechanicalSpring[]; fields: Record<Field, NumericArray>; }

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('PIXPHYSO-worlds', 2);
    req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains('worlds')) req.result.createObjectStore('worlds', {keyPath: 'name'}); if (!req.result.objectStoreNames.contains('templates')) req.result.createObjectStore('templates', {keyPath: 'name'}); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('База сохранений занята другой вкладкой'));
  });
}
async function transaction<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>, storeName = 'worlds'): Promise<T> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode), request = action(tx.objectStore(storeName));
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
  const save: Save = {name, date: Date.now(), width: world.width, height: world.height, env: {...world.env}, time: world.timeSec, tick: world.stepTick, sensors: world.sensors.map(pin => ({...pin})), wires: world.wires.map(wire => ({...wire, points: wire.points.map(point => ({...point}))})), wheels: world.wheels.map(wheel => ({...wheel})), mechanicalSprings: world.mechanicalSprings.map(spring => ({...spring})), fields};
  await transaction('readwrite', store => store.put(save));
}
export async function deleteWorld(name: string): Promise<void> { await transaction('readwrite', store => store.delete(name)); }
export async function loadWorld(world: World, name: string): Promise<void> {
  const save = await transaction<Save | undefined>('readonly', store => store.get(name));
  if (!save || !Number.isInteger(save.width) || !Number.isInteger(save.height) || save.width < 1 || save.height < 1 || save.width > 2000 || save.height > 2000) throw new Error('Повреждённое сохранение');
  const size = save.width * save.height, airSize = Math.ceil(save.width / world.airScale) * Math.ceil(save.height / world.airScale);
  for (const field of FIELDS) {
    const arr = save.fields?.[field], expected = field.startsWith('air') ? airSize : field.startsWith('wave') ? save.width : size;
    if ((field === 'airOxygen' || field.startsWith('wave')) && arr === undefined) continue; // saves created before oxygen was tracked
    if (!(arr instanceof Uint8Array || arr instanceof Float32Array) || arr.length !== expected) throw new Error('Повреждённые данные поля');
  }
  world.resize(save.width, save.height);
  world.resetUndoHistory(); world.stamp.fill(0); world.releaseHand(true);
  for (const field of FIELDS) {
    const data = save.fields[field];
    if (field === 'airOxygen' && !data) world.airOxygen.fill(.21);
    else if (field.startsWith('wave') && !data) world[field].fill(0);
    else world[field].set(data);
  }
  Object.assign(world.env, save.env);
  world.timeSec = save.time; world.stepTick = save.tick;
  world.sensors = save.sensors || []; world.wires = save.wires || [];
  world.wheels = save.wheels || []; world.mechanicalSprings = save.mechanicalSprings || [];
}

type TemplateField = 'mat' | 'temp' | 'meta' | 'wetness' | 'absorbedMat' | 'seed';
const TEMPLATE_FIELDS: TemplateField[] = ['mat','temp','meta','wetness','absorbedMat','seed'];
export interface Template { name: string; date: number; width: number; height: number; fields: Record<TemplateField, NumericArray>; sensors: SensorPin[]; wires: HangingWire[]; wheels?: Wheel[]; mechanicalSprings?: MechanicalSpring[] }
export async function listTemplates(): Promise<{name: string; date: number}[]> {
  const all = await transaction<Template[]>('readonly', store => store.getAll(), 'templates');
  return all.map(({name,date}) => ({name,date})).sort((a,b) => b.date-a.date);
}
export async function saveTemplate(world: World, name: string, a: [number,number], b: [number,number]): Promise<void> {
  const x0 = Math.max(0, Math.min(a[0], b[0])), y0 = Math.max(0, Math.min(a[1], b[1]));
  const x1 = Math.min(world.width-1, Math.max(a[0], b[0])), y1 = Math.min(world.height-1, Math.max(a[1], b[1]));
  const width = x1-x0+1, height = y1-y0+1, fields = {} as Record<TemplateField, NumericArray>;
  for (const field of TEMPLATE_FIELDS) {
    const src = world[field], out = field === 'temp' ? new Float32Array(width*height) : new Uint8Array(width*height);
    for (let y = 0; y < height; y++) out.set(src.subarray((y0+y)*world.width+x0, (y0+y)*world.width+x0+width), y*width);
    fields[field] = out;
  }
  const inside = (x:number,y:number) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
  const sensors = world.sensors.filter(p => inside(p.x,p.y)).map(p => ({...p,x:p.x-x0,y:p.y-y0}));
  const wires = world.wires.filter(w => inside(w.ax,w.ay) && inside(w.bx,w.by)).map(w => ({...w, ax:w.ax-x0, ay:w.ay-y0, bx:w.bx-x0, by:w.by-y0, points:w.points.map(p => ({...p,x:p.x-x0,y:p.y-y0,oldX:p.oldX-x0,oldY:p.oldY-y0}))}));
  const wheels = world.wheels.filter(w => inside(w.x,w.y)).map(w => ({...w,x:w.x-x0,y:w.y-y0}));
  const mechanicalSprings = world.mechanicalSprings.filter(s => inside(s.ax,s.ay) && inside(s.x,s.y)).map(s => ({...s,ax:s.ax-x0,ay:s.ay-y0,x:s.x-x0,y:s.y-y0}));
  await transaction('readwrite', store => store.put({name,date:Date.now(),width,height,fields,sensors,wires,wheels,mechanicalSprings}), 'templates');
}
export async function getTemplate(name: string): Promise<Template> {
  const t = await transaction<Template | undefined>('readonly', store => store.get(name), 'templates');
  if (!t || !Number.isInteger(t.width) || !Number.isInteger(t.height) || t.width < 1 || t.height < 1 || t.width > 2000 || t.height > 2000) throw new Error('Повреждённая схема');
  for (const key of TEMPLATE_FIELDS) if (!(t.fields?.[key] instanceof Uint8Array || t.fields?.[key] instanceof Float32Array) || t.fields[key].length !== t.width*t.height) throw new Error('Повреждённые данные схемы');
  return t;
}
export async function deleteTemplate(name: string): Promise<void> { await transaction('readwrite', store => store.delete(name), 'templates'); }
export function placeTemplate(world: World, t: Template, x: number, y: number): void {
  world.pushUndo();
  for (let dy = 0; dy < t.height && y+dy < world.height; dy++) for (let dx = 0; dx < t.width && x+dx < world.width; dx++) {
    const src = dy*t.width+dx, dst = (y+dy)*world.width+x+dx;
    if (t.fields.mat[src] === 0) continue;
    world.setCell(x+dx, y+dy, t.fields.mat[src]);
    for (const field of TEMPLATE_FIELDS) world[field][dst] = t.fields[field][src];
  }
  const inside = (px:number,py:number) => world.inBounds(px+x,py+y);
  for (const p of t.sensors || []) if (inside(p.x,p.y) && world.sensors.length < 16) world.sensors.push({...p,id:Date.now()+world.sensors.length,x:p.x+x,y:p.y+y});
  for (const wheel of t.wheels || []) if (inside(wheel.x,wheel.y) && world.wheels.length < 64) world.wheels.push({...wheel,x:wheel.x+x,y:wheel.y+y});
  for (const spring of t.mechanicalSprings || []) if (inside(spring.ax,spring.ay) && inside(spring.x,spring.y) && world.mechanicalSprings.length < 64) world.mechanicalSprings.push({...spring,ax:spring.ax+x,ay:spring.ay+y,x:spring.x+x,y:spring.y+y});
  for (const w of t.wires || []) if (inside(w.ax,w.ay) && inside(w.bx,w.by)) world.wires.push({...w,ax:w.ax+x,ay:w.ay+y,bx:w.bx+x,by:w.by+y,points:w.points.map(p => ({...p,x:p.x+x,y:p.y+y,oldX:p.oldX+x,oldY:p.oldY+y}))});
}
