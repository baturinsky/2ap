import Unit from "./Unit";
import { canvasCache, Context2d } from "./Util";
import Terrain from "./Terrain";
import { tileSize } from "./settings";
import * as v2 from "./v2";
import shadowcast from "./sym-shadowcast";

export default class Cell {
  rfov = new Set<number>(); /* raw FOV, without XCOM tricks */
  xfov = new Set<number>(); /* FOV with respect of peek-out */
  dfov = new Set<number>(); /* Direct fov, withonly source stepping out. For ground attacks and overwatch */
  povs: Cell[] = [];
  peeked: Cell[] = [];
  cover: number[];
  goody: number;
  hole: boolean;

  constructor(
    public terrain: Terrain,
    public cid: number,
    public obstacle: number,
    public unit?: Unit
  ) {}

  calculatePovAnCover() {
    if (this.obstacle) return;
    this.cover = this.terrain.obstacles(this.cid);
    this.peekSides();
  }

  calculateFov() {
    if (this.opaque) return;

    let t = this.terrain;

    let [x, y] = this.at;

    let visibility = new Set<number>();
    shadowcast(
      x,
      y,
      (x, y) => !t.cellAt(x, y).opaque,
      (x, y) => {
        visibility.add(t.cid(x, y));
      }
    );

    this.rfov = visibility;
  }

  calculateXFov() {
    let visibility = new Set<number>();

    for (let p of this.povs) {
      for (let visible of p.rfov) {
        let visibleTile = this.terrain.cells[visible];
        for (let neighbor of visibleTile.peeked) visibility.add(neighbor.cid);
      }
    }
    this.xfov = visibility;
  }

  calculateDFov() {
    let visibility = new Set<number>();

    for (let p of this.povs) {
      for (let visible of p.rfov) {
        visibility.add(visible);
      }
    }
    this.dfov = visibility;
  }


  get at() {
    return this.terrain.fromCid(this.cid);
  }

  dist(other: Cell | Unit) {
    return v2.dist(this.at, other.at);
  }

  seal() {
    this.obstacle = 2;
    delete this.unit;
    this.goody = 0;
  }

  get opaque() {
    return this.obstacle == 2;
  }

  get passable(){
    return this.obstacle<2 && !this.hole;
  }

  get standable(){
    return this.obstacle==0 && !this.hole && !this.unit;
  }


  peekSides() {
    this.povs = [];
    let t = this.terrain;
    let cid = this.cid;
    this.povs.push(this);
    for (let dir = 0; dir < 8; dir += 2) {
      let forward = cid + t.dir8Deltas[dir];
      if (!t.cells[forward].obstacle) continue;
      let left = [
        cid + t.dir8Deltas[(dir + 6) % 8],
        cid + t.dir8Deltas[(dir + 7) % 8]
      ];
      let right = [
        cid + t.dir8Deltas[(dir + 2) % 8],
        cid + t.dir8Deltas[(dir + 1) % 8]
      ];
      for (let side of [left, right]) {
        let peekable =
          t.cells[side[0]].obstacle == 0 && t.cells[side[1]].obstacle <= 1;
        if (peekable) {
          this.povs.push(t.cells[side[0]]);
        }
      }
    }
    for (let c of this.povs) {
      c.peeked.push(this);
    }
  }
}
