import Unit from "./Unit";
import { canvasCache, Context2d } from "./Util";
import Board from "./Board";
import * as v2 from "./v2";
import shadowcast from "./sym-shadowcast";
import Item from "./Item";

export default class Cell {
  
  /** List of the visible cells from here, without XCOM tricks */
  rfov = new Set<number>(); 
  
  /** List of the visible cells from here, with respect of stepping out from this cell,
   * but NOT to target cell. For ground attacks and overwatch. */
  dfov = new Set<number>(); 

  /** List of the visible cells from here, with respect of stepping out from this cell AND to target cell.*/
  xfov = new Set<number>(); 
  
  /** Cells from where this cell is visible */
  povs: Cell[] = [];

  /** Point of views for unit standing on this cell. Includes cell itself and cells perpendicular to the adjacent cover*/
  peeked: Cell[] = [];

  /** List of cells with cover next to this cell */
  cover: number[];

  /** Is this cell impassible */
  hole: boolean;

  items: Item[] = [];

  constructor(
    public board: Board,
    public id: number,
    /** 
     * 0 - passable, standable, no cover, transparent
     * 1 - passable, not standable, half cover, transparent
     * 2 - impassable, full cover, opaque
     */
    public obstacle: number,
    public unit?: Unit
  ) {}

  calculatePovAndCover() {
    if (this.obstacle) return;
    this.cover = this.board.obstacles(this.id);
    this.calculatePovs();
  }

  calculateFov() {
    if (this.opaque) return;

    let t = this.board;

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
        let visibleTile = this.board.cells[visible];
        for (let neighbor of visibleTile.peeked) visibility.add(neighbor.id);
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
    return this.board.cellIdToV2(this.id);
  }

  dist(other: Cell | Unit) {
    return v2.dist(this.at, other.at);
  }

  seal() {
    this.obstacle = 2;
    delete this.unit;
    this.items = []
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


  calculatePovs() {
    this.povs = [];
    let t = this.board;
    let cid = this.id;
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
          t.cells[side[0]].standable && t.cells[side[1]].obstacle <= 1;
        if (peekable) {
          this.povs.push(t.cells[side[0]]);
        }
      }
    }
    for (let c of this.povs) {
      c.peeked.push(this);
    }
  }

  serializable(){
    return this.items.length>0;
  }

  serialize(){
    return {items:this.items.map(i =>i.serialize())}
  }

  deserialize(data:{items:string[]}){
    for(let item of data.items){
      this.addItem(Item.deserialize(item))
    }
  }

  addItem(item:Item){
    this.items.push(item);
  }

}
