import { describe, it, expect } from 'vitest';
import 'fake-indexeddb/auto';
import { World } from '../src/engine/World';
import { MAT } from '../src/materials/registry';
import { makeWire } from '../src/engine/Wires';
import { saveWorld, loadWorld, saveTemplate, getTemplate, placeTemplate, listTemplates, deleteTemplate } from '../src/engine/WorldStore';

describe('local world slots and reusable templates', () => {
  it('migrates a version-one database and restores saves without oxygen data', async () => {
    const del = indexedDB.deleteDatabase('PIXPHYSO-worlds'); await new Promise<void>((resolve,reject) => { del.onsuccess=()=>resolve(); del.onerror=()=>reject(del.error); });
    const w = new World(10,10); w.setCell(2,2,MAT.WATER,33);
    const fields = Object.fromEntries(['mat','temp','vx','vy','wetness','absorbedMat','volt','current','meta','stress','seed','airPressure','airVx','airVy'].map(key => [key, (w as any)[key].slice()]));
    const req = indexedDB.open('PIXPHYSO-worlds', 1); req.onupgradeneeded=()=>req.result.createObjectStore('worlds',{keyPath:'name'});
    const db = await new Promise<IDBDatabase>((resolve,reject) => { req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error); });
    const tx = db.transaction('worlds','readwrite'); tx.objectStore('worlds').put({name:'old',date:0,width:10,height:10,env:w.env,time:0,tick:1,sensors:[],wires:[],fields});
    await new Promise<void>((resolve,reject) => { tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error); }); db.close();
    const restored = new World(10,10); await loadWorld(restored,'old');
    expect(restored.mat[restored.idx(2,2)]).toBe(MAT.WATER); expect(restored.airOxygen[0]).toBeCloseTo(.21);
    expect(await listTemplates()).toEqual([]);
  });
  it('round trips a full world including oxygen', async () => {
    const a = new World(20,20); a.setCell(2,2,MAT.WATER,42); a.airOxygen[0]=.1; await saveWorld(a,'full');
    const b = new World(10,10); await loadWorld(b,'full');
    expect(b.width).toBe(20); expect(b.airOxygen[0]).toBeCloseTo(.1); expect(b.mat[b.idx(2,2)]).toBe(MAT.WATER); expect(b.temp[b.idx(2,2)]).toBe(42);
  });
  it('copies a selected fragment with materials, cable and sensors and can be placed repeatedly', async () => {
    const w = new World(30,30); w.setCell(3,4,MAT.BATTERY); w.setCell(7,4,MAT.LAMP); w.wires.push(makeWire(3,4,7,4,.5)); w.sensors.push({id:1,x:5,y:4});
    await saveTemplate(w,'lamp',[2,3],[8,5]); expect((await listTemplates()).map(s=>s.name)).toContain('lamp');
    const template = await getTemplate('lamp'), out = new World(40,40);
    placeTemplate(out,template,10,10); placeTemplate(out,template,20,20);
    expect(out.mat[out.idx(11,11)]).toBe(MAT.BATTERY); expect(out.mat[out.idx(15,11)]).toBe(MAT.LAMP);
    expect(out.mat[out.idx(21,21)]).toBe(MAT.BATTERY); expect(out.wires).toHaveLength(2); expect(out.sensors).toHaveLength(2);
    expect(out.popUndo()).toBe(true); expect(out.wires).toHaveLength(1);
    await deleteTemplate('lamp'); expect((await listTemplates()).map(s=>s.name)).not.toContain('lamp');
  });
});
