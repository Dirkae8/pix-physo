import { MAT, STATE_LUT } from '../materials/registry';
import { World } from './World';

/** A shallow-water surface mode. The displacement field drives particle velocity;
 * its only external source is wind shear. It is not a full Navier–Stokes solver. */
export class SurfaceWaveSolver {
  private surfaceY = new Int32Array(0);
  private surfaceMat = new Uint8Array(0);
  private nextHeight = new Float32Array(0);
  private nextVelocity = new Float32Array(0);
  public step(world: World): void {
    const width=world.width,height=world.height;
    if (this.surfaceY.length!==width) {
      this.surfaceY=new Int32Array(width); this.surfaceMat=new Uint8Array(width);
      this.nextHeight=new Float32Array(width); this.nextVelocity=new Float32Array(width);
    }
    this.surfaceY.fill(-1); this.surfaceMat.fill(0);
    for (let x=0;x<width;x++) for(let y=1;y<height-1;y++) {
      const i=y*width+x, m=world.mat[i], above=world.mat[i-width];
      if (STATE_LUT[m]===3 && world.mat[i+width]===m && (above===MAT.EMPTY || STATE_LUT[above]===4)) {
        this.surfaceY[x]=y; this.surfaceMat[x]=m; break;
      }
    }
    const h=world.waveHeight,v=world.waveVelocity;
    for(let x=0;x<width;x++) {
      const y=this.surfaceY[x], m=this.surfaceMat[x];
      if(y<0) { this.nextHeight[x]=0; this.nextVelocity[x]=0; continue; }
      const adjacent=(n:number) => n>=0 && n<width && this.surfaceMat[n]===m && Math.abs(this.surfaceY[n]-y)<=1;
      const left=adjacent(x-1)?h[x-1]:h[x], right=adjacent(x+1)?h[x+1]:h[x];
      const ai=world.airIdxFromCell(x,y-1), wind=world.airVx[ai];
      const forcing=Math.abs(wind)>2 ? Math.min(40,Math.abs(wind))*.0015*Math.sin(x*.19-world.timeSec*2.7)*Math.sign(wind) : 0;
      const velocity=(v[x] + .10*(left+right-2*h[x]) + forcing)*.94;
      this.nextVelocity[x]=Math.max(-.2,Math.min(.2,velocity));
      this.nextHeight[x]=Math.max(-1.5,Math.min(1.5,h[x]+this.nextVelocity[x]));
      // Transfer part of the wave motion back to the surface parcel.
      world.vy[y*width+x] -= this.nextVelocity[x]*.08;
    }
    h.set(this.nextHeight); v.set(this.nextVelocity);
  }
  public getSurfaceY(): Int32Array { return this.surfaceY; }
}
