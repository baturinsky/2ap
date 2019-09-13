import Char from "./Char";
import { canvasCache, Context2d } from "./Util";
import Terrain from "./Terrain";
import { tileSize } from "./settings";
import * as v2 from "./v2";

export default class Cell {

  fov = new Set<number>();
  povs = new Set<number>();
  peeked = new Set<number>();
  cover: number[];
  goody: number;

  static readonly dashInterval = 4;

  static readonly ap1Sprite = canvasCache([tileSize, tileSize], ctx => {
    ctx.strokeStyle = "#555";
    ctx.strokeRect(4.5, 4.5, tileSize - 8, tileSize - 8);
  });

  static readonly ap2Sprite = canvasCache([tileSize, tileSize], ctx => {
    ctx.strokeStyle = "#bbb";
    ctx.strokeRect(4.5, 4.5, tileSize - 8, tileSize - 8);
  });

  static readonly hiddenSprite = canvasCache([tileSize, tileSize], ctx => {
    ctx.fillStyle = `rgba(0,0,0,0.12)`;
    ctx.fillRect(0, 0, tileSize, tileSize);
  });


  static readonly dashPattern = canvasCache(
    [Cell.dashInterval, Cell.dashInterval],
    ctx => {
      for (let i = 0; i < Cell.dashInterval; i++) {
        ctx.fillRect(i, i, 1, 1);
      }
    }
  );

  static readonly crossPattern = canvasCache([3, 3], ctx => {
    for (let i = 0; i < Cell.dashInterval; i++) {
      ctx.fillRect(Cell.dashInterval - i - 1, i, 1, 1);
      ctx.fillRect(i, i, 1, 1);
    }
  });

  static readonly highTile = canvasCache([tileSize, tileSize], ctx => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, tileSize, tileSize);
  });

  static readonly lowTile = canvasCache([tileSize, tileSize], ctx => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, tileSize, tileSize);
    ctx.fillStyle = ctx.createPattern(Cell.dashPattern, "repeat");
    ctx.fillRect(0, 0, tileSize, tileSize);
  });

  static readonly emptyTile = canvasCache([1, 1], ctx => {});

  constructor(
    public terrain: Terrain,
    public cind: number,
    public obstacle: number,
    public char?: Char
  ) {}

  renderThreats(ctx: Context2d){
    let t = this.terrain;
    let i = this.cind;

    ctx.strokeStyle="#080"
    ctx.lineWidth = t.teams[Char.RED].strength[i]==4?3:1
    ctx.beginPath()
    ctx.moveTo(3.5,3.5)
    ctx.lineTo(3.5,3.5+3*t.teams[Char.RED].strength[i])
    ctx.stroke()

    ctx.strokeStyle="#800"
    ctx.lineWidth = t.teams[Char.RED].weakness[i]==4?3:1
    ctx.beginPath()
    ctx.moveTo(3.5,3.5)
    ctx.lineTo(3.5+3*t.teams[Char.RED].weakness[i], 3.5)
    ctx.stroke()
  }

  render(ctx: Context2d) {
    let t = this.terrain;
    let i = this.cind;

    let sprite = [, Cell.lowTile, Cell.highTile][this.obstacle];
    let c = t.chosen;
    let e = t.cells[t.hoveredTile];

    ctx.save();

    ctx.shadowColor = `rgba(0,0,0,0)`;
    
    //this.drawThreats(ctx);

    ctx.strokeStyle="#000"
    ctx.lineWidth = 2

    if (e && e.fov && !e.fov.has(i) && t.hoveredTile) {
      //ctx.drawImage(Cell.hiddenSprite, 0, 0)
      ctx.fillStyle = `rgba(0,0,0,0.08)`;
      ctx.fillRect(0, 0, tileSize, tileSize);
    }
    if (c && c.dists) {
      ctx.lineWidth = 1;
      let moves = t.chosen.apCost(i);
      if (moves > 0 && moves <= t.chosen.ap) {
        let img = [,Cell.ap1Sprite, Cell.ap2Sprite][Math.floor(moves)]
        if(img)
          ctx.drawImage(img, 0, 0)
      }
    }
    /*if (c && c.cell.povs && c.cell.povs.has(i)) {
      ctx.strokeStyle = "#444";
      ctx.beginPath();
      ctx.arc(tileSize / 2, tileSize / 2, tileSize / 4, 0, Math.PI * 2);
      ctx.stroke();
    }*/
    ctx.restore();

    if(this.goody){
      ctx.fillStyle = "#080"
      ctx.fillRect(tileSize*0.35,0, tileSize*0.3, tileSize)
      ctx.fillRect(0,tileSize*0.35, tileSize, tileSize*0.3)
    }

    if (sprite) ctx.drawImage(sprite, 0, 0);
  }

   calculatePovAnCover() {
    if(this.obstacle)
      return;
    this.cover = this.terrain.obstacles(this.cind);
    this.povs = this.terrain.peekSides(this.cind);
  }

  calculateFov() {
    this.fov.clear();

    for (let p of this.povs) {
      for (let i of this.terrain.calculateFov(p)){
        this.fov.add(i);
      }
    }
  }

  calculate() {    
    this.calculatePovAnCover();
    this.calculateFov();
  }

  get at() {
    return this.terrain.fromCind(this.cind);
  }

  dist(other:Cell|Char){
    return v2.dist(this.at, other.at)
  }

  seal(){
    this.obstacle = 2;
    delete this.char;
    this.goody = 0;
  }

}
