import { ELEC_COND_LUT, MAT } from '../materials/registry';
import { World } from './World';

/** A discrete return-terminal path estimate, supplementing the scalar potential solver.
 * Uses the shortest connected path, not a full Kirchhoff network solution. */
export class CurrentSolver {
  private queue = new Int32Array(0);
  private parent = new Int32Array(0);
  private seen = new Uint8Array(0);
  private conductivity(m: number, meta: number): number {
    if (m === MAT.GROUND) return 1;
    if (m === MAT.SWITCH || m === MAT.BUTTON || m === MAT.THERMOSTAT || m === MAT.PRESSURE_SWITCH || m === MAT.FUSE) return meta > 0 ? .96 : 0;
    if (m === MAT.RELAY) return (meta & 4) ? .96 : 0;
    return ELEC_COND_LUT[m];
  }
  private resistance(m: number, meta: number): number {
    if (m === MAT.GROUND) return .05;
    if (m === MAT.BATTERY || m === MAT.GENERATOR) return .15;
    if (m === MAT.FUSE) return .3;
    return .08 + 2 * (1 - Math.min(1, this.conductivity(m,meta)));
  }
  private isolated(a: number, b: number): boolean {
    return (a === MAT.INSULATED_WIRE && (b === MAT.WATER || b === MAT.SALTWATER || b === MAT.ACID || b === MAT.STEEL)) ||
      (b === MAT.INSULATED_WIRE && (a === MAT.WATER || a === MAT.SALTWATER || a === MAT.ACID || a === MAT.STEEL));
  }
  public step(world: World): void {
    // No return contact means no work: common scenes keep their original fast path.
    let groundFound = false;
    for (let i=0;i<world.size;i++) if (world.mat[i]===MAT.GROUND) { groundFound=true; break; }
    if (!groundFound) return;
    if (this.queue.length !== world.size) { this.queue=new Int32Array(world.size); this.parent=new Int32Array(world.size); this.seen=new Uint8Array(world.size); }
    this.seen.fill(0);
    const w=world.width,h=world.height,mat=world.mat,meta=world.meta;
    for (let start=0;start<world.size;start++) {
      if (mat[start]!==MAT.GROUND || this.seen[start]) continue;
      let head=0,tail=0,source=-1;
      this.queue[tail++]=start; this.seen[start]=1; this.parent[start]=-1;
      while(head<tail) {
        const i=this.queue[head++],x=i%w,y=(i/w)|0,m=mat[i];
        if (source<0 && ((m===MAT.BATTERY && meta[i]>0) || m===MAT.GENERATOR)) source=i;
        for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++) {
          if ((!dx && !dy) || x+dx<0 || x+dx>=w || y+dy<0 || y+dy>=h) continue;
          const j=(y+dy)*w+x+dx,n=mat[j];
          if(this.seen[j] || !this.conductivity(n,meta[j]) || this.isolated(m,n)) continue;
          if(dx && dy && (mat[y*w+x+dx]===MAT.RELAY || mat[(y+dy)*w+x]===MAT.RELAY)) continue;
          // BFS proceeds from return to source, opposite to forward current.
          const forward=(dir:number) => dir===0 ? -dx : dir===1 ? -dy : dir===2 ? dx : dy;
          if ((m===MAT.DIODE && forward(meta[i]&3)<=0) || (n===MAT.DIODE && forward(meta[j]&3)<=0)) continue;
          const axial=(id:number, v:number) => id!==MAT.RELAY || ((v&1)===0 ? dy===0 : dx===0);
          if(!axial(m,meta[i]) || !axial(n,meta[j])) continue;
          this.seen[j]=1; this.parent[j]=i; this.queue[tail++]=j;
        }
      }
      if(source<0) continue;
      let resistance=.5;
      for(let i=source;i>=0;i=this.parent[i]) resistance += this.resistance(mat[i],meta[i]);
      const current=Math.min(40, (mat[source]===MAT.GENERATOR ? 48 : 24)/resistance);
      for(let i=source;i>=0;i=this.parent[i]) {
        const r=this.resistance(mat[i],meta[i]);
        world.current[i]=Math.max(world.current[i],current);
        world.temp[i]=Math.min(5500,world.temp[i] + current*current*r*.08);
      }
      if(mat[source]===MAT.BATTERY && meta[source]>0 && world.rand()<Math.min(.1,current*.001)) meta[source]--;
    }
  }
}
