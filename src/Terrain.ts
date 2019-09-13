import { idiv, Context2d, createCanvas } from "./Util";
import Cell from "./Cell";
import Char from "./Char";
import Game from "./Game";
import * as v2 from "./v2";
import { tileSize } from "./settings";
import shadowcast from "./sym-shadowcast";
import Team from "./Team";

type V2 = [number, number];
const sightRange = 20;
const PAI = 0;
const PP = 1;
const AIAI = 2;

export default class Terrain {
  static readonly dirs8: V2[] = [
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1]
  ];

  cells: Cell[];
  w: number;
  h: number;

  dir8Deltas: number[];

  chars: Char[];
  teams: Team[];

  eye: Char;
  chosen: Char;
  hoveredChar: Char;
  hoveredTile: number;

  canvasCacheOutdated = false;

  canvasCache: HTMLCanvasElement;
  mode = PAI;

  victor:number;

  init(terrainString: string) {
    let lines = terrainString
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    this.h = lines.length;
    this.w = Math.max(...lines.map(s => s.length));

    this.cells = [];
    this.chars = [];
    this.teams = [];

    for (let y = 0; y < this.h; y++) {
      this.victor = -1;

      let line = lines[y];
      for (let x = 0; x < this.w; x++) {
        let cind = x + y * this.w;
        let char = line[x] || " ";
        let cell = new Cell(
          this,
          cind,
          ["+", "#"].indexOf(char) + 1,
          Char.from(this, char, this.cind(x, y))
        );
        if (char == "*") cell.goody = 1;
        this.cells[cind] = cell;
      }
    }

    for (let i = 0; i < this.w; i++) {
      this.seal(i, 0);
      this.seal(i, this.h - 1);
    }

    for (let i = 0; i < this.h; i++) {
      this.seal(0, i);
      this.seal(this.w - 1, i);
    }

    this.dir8Deltas = Terrain.dirs8.map(v => v[0] + v[1] * this.w);
    this.eye = new Char(this, Char.EYE, Char.BLUE, 0);

    for (let c of this.cells) {
      if (!c.obstacle) c.calculatePovAnCover();
    }

    for (let c of this.cells) {
      if (!c.obstacle) c.calculate();
    }

    for (let i = 0; i < 2; i++) {
      let team = new Team(this, i);
      this.teams[i] = team;
    }

    this.updateCanvasCache();    
  }

  seal(x: number, y: number) {
    this.cells[this.cind(x, y)].seal();
  }

  constructor(public game: Game, public terrainString: string) {
    this.init(terrainString);
  }

  update(dTime: number) {
    for (let c of this.chars) c.update(dTime);
  }

  render(ctx: Context2d) {
    if (!this.canvasCache || this.canvasCacheOutdated) this.updateCanvasCache();
    ctx.clearRect(0, 0, this.w * tileSize, this.h * tileSize);

    ctx.drawImage(this.canvasCache, 0, 0);
    this.renderPath(this.hoveredTile);
    for (let c of this.chars) {
      c.render(ctx);
    }
    //this.renderHovered(ctx)
  }

  renderHovered(ctx: Context2d) {
    let hov = this.cindToScreen(this.hoveredTile);
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;
    ctx.strokeRect(hov[0] + 0.5, hov[1] + 0.5, tileSize, tileSize);
  }

  calcDists(x?: number, y?: number) {
    if (isNaN(+x)) x = this.chosen.cind;
    let fromi = isNaN(+y) ? x : this.cind(x, y);
    let dists = this.cells.map(_ => [Number.MAX_VALUE, -1]);
    dists[fromi] = [0, -1];
    let todo: number[] = [fromi];

    while (todo.length > 0) {
      let curi = todo.shift();
      let curl = dists[curi][0];
      for (let dir = 0; dir < 8; dir++) {
        let diagonal = dir % 2;
        let nexti = this.dir8Deltas[dir] + curi;

        let blocked = !!(this.cells[nexti].obstacle || this.cells[nexti].char);
        if (
          diagonal &&
          (this.cells[curi + this.dir8Deltas[(dir + 1) % 8]].obstacle ||
            this.cells[curi + this.dir8Deltas[(dir + 7) % 8]].obstacle)
        )
          blocked = true;

        if (!blocked) {
          let next = dists[nexti];
          let plusl = diagonal ? 1.414 : 1;
          if (next[0] > curl + plusl) {
            dists[nexti] = [curl + plusl, curi];
            todo.push(nexti);
          }
        }
      }
    }
    return dists;
  }

  cind(x: number, y: number) {
    return x + y * this.w;
  }

  cindScreen(x: number, y: number) {
    return this.cind(idiv(x, tileSize), idiv(y, tileSize));
  }

  cellAt(x: number, y: number): Cell {
    return this.cells[this.cind(x, y)];
  }

  cellAtScreen(x: number, y: number): Cell {
    return this.cells[this.cindScreen(x, y)];
  }

  click(x: number, y: number) {
    let cind = this.cindScreen(x, y);
    this.clickCell(cind);
    this.resetCanvasCache();
  }

  canPlayAs(char: Char) {
    return char.faction == Char.BLUE || this.mode != PAI;
  }

  clickCell(cind) {
    let cell = this.cells[cind];

    if (!cell) return;

    if (cell.char) {
      if (
        this.chosen &&
        this.chosen.faction == cell.char.faction &&
        this.canPlayAs(cell.char)
      ) {
        this.chosen = cell.char;
        this.chosen.calculate();
        return;
      }

      if (this.chosen && this.chosen.canDamage(cell.char)) {
        this.chosen.fire(cell);
        return;
      }

      if (this.chosen == cell.char) {
        this.cancel();
      } else {
        if (this.canPlayAs(cell.char)) this.chosen = cell.char;
      }

      if (this.chosen) {
        this.chosen.calculate();
      }
    }

    if (!cell.char && this.chosen && this.chosen.reachable(cind)) {
      this.chosen.to(cind);
      this.teams[Char.RED].calculate();
    }

    this.eye.faction = this.chosen ? this.chosen.faction : Char.BLUE;

    this.resetCanvasCache();
  }

  hover(x: number, y: number) {
    let hover = this.cindScreen(x, y);

    if (this.hoveredTile != hover) {
      this.hoveredTile = hover;
      let cell = this.cells[hover];

      if (!cell) return;

      let cursor = "default";
      if ((this.chosen && this.chosen.reachable(hover)) || cell.char)
        cursor = "pointer";

      if (cell.char) {
        this.game.updateInfo(cell.char.info());
      } else {
        this.game.updateInfo();
      }

      if (this.chosen && this.chosen.canDamage(cell.char)) {
        cursor = "crosshair";
        this.game.updateTooltip(
          this.cindToCenter(cell.cind),
          `${this.chosen.hitChance(cell.char)}% ${this.chosen.gun
            .averageDamage(this.chosen, cell.char)
            .toFixed(1)}`
        );
      } else {
        this.game.updateTooltip();
      }
      document.body.style.cursor = cursor;

      if (cell.obstacle == 0) {
        this.eye.cind = hover;
        this.eye.calculate();

        if (cell) {
          this.hoveredChar = cell.char;
        } else delete this.hoveredChar;

        this.resetCanvasCache();
      }
    }
  }

  fromCind(ind: number): V2 {
    return [ind % this.w, idiv(ind, this.w)];
  }

  renderPath(cind: number) {
    let char = this.chosen;
    let cell = char ? char.cell : null;

    if (
      isNaN(+cind) ||
      !char ||
      !cell ||
      !char.dists ||
      !char.dists[cind] ||
      char.dists[cind][1] == -1
    )
      return;

    if (!char.reachable(cind)) return;

    let ctx = this.game.ctx;
    let end = this.cindToCenter(cind);

    ctx.beginPath();
    if (char.reachable(cind))
      ctx.arc(end[0], end[1], tileSize / 4, 0, Math.PI * 2);
    else {
      ctx.moveTo(end[0] - tileSize / 4, end[1] - tileSize / 4);
      ctx.lineTo(end[0] + tileSize / 4, end[1] + tileSize / 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(end[0] - tileSize / 4, end[1] + tileSize / 4);
      ctx.lineTo(end[0] + tileSize / 4, end[1] - tileSize / 4);
    }
    ctx.stroke();

    let path = char.pathTo(cind);

    ctx.beginPath();
    ctx.moveTo(...this.cindToCenter(path[0]));
    for (let i of path) ctx.lineTo(...this.cindToCenter(i));
    ctx.stroke();
  }

  cindToScreen(ind: number): V2 {
    return this.fromCind(ind).map(a => a * tileSize) as V2;
  }

  cindToCenter(ind: number): V2 {
    return this.fromCind(ind).map(a => (a + 0.5) * tileSize) as V2;
  }

  calculateFov(cind: number) {
    let [x, y] = this.fromCind(cind);
    let visibility = new Set<number>();
    shadowcast(
      x,
      y,
      (x, y) => this.cellAt(x, y).obstacle < 2,
      (x, y) => {
        for (let pov of this.cells[this.cind(x, y)].peeked) visibility.add(pov);
      }
    );
    return visibility;
  }

  resetCanvasCache() {
    this.canvasCacheOutdated = true;
  }

  updateCanvasCache() {
    if (!this.canvasCache)
      this.canvasCache = createCanvas(this.w * tileSize, this.h * tileSize);

    let ctx = this.canvasCache.getContext("2d");

    ctx.save();
    ctx.clearRect(0, 0, this.w * tileSize, this.h * tileSize);

    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowColor = "#444";

    for (let i = 0; i < this.cells.length; i++) {
      let cell = this.cells[i];
      ctx.save();
      ctx.translate(...this.cindToScreen(i));
      cell.render(ctx);
      ctx.restore();
    }

    ctx.restore();

    this.canvasCacheOutdated = false;
  }

  cancel() {
    delete this.chosen;
    this.resetCanvasCache();
  }

  peekSides(cind: number) {
    let peeks: Set<number> = new Set<number>();
    for (let dir = 0; dir < 8; dir += 2) {
      let forward = cind + this.dir8Deltas[dir];
      if (!this.cells[forward].obstacle) continue;
      let left = [
        cind + this.dir8Deltas[(dir + 6) % 8],
        cind + this.dir8Deltas[(dir + 7) % 8]
      ];
      let right = [
        cind + this.dir8Deltas[(dir + 2) % 8],
        cind + this.dir8Deltas[(dir + 1) % 8]
      ];
      for (let side of [left, right]) {
        let peekable =
          this.cells[side[0]].obstacle == 0 &&
          this.cells[side[1]].obstacle <= 1;
        if (peekable) {
          peeks.add(side[0]);
        }
      }
    }
    peeks.add(cind);
    for (let c of peeks) {
      (this.cells[c] as Cell).peeked.add(cind);
    }
    return peeks;
  }

  obstacles(cind: number) {
    let obstacles: number[] = [];
    for (let dir = 0; dir < 8; dir += 2) {
      let forward = cind + this.dir8Deltas[dir];
      obstacles.push(this.cells[forward].obstacle);
    }
    return obstacles;
  }

  cover(from: Cell, target: Cell) {
    let visible = from.fov.has(target.cind);

    if (!visible) return -1;

    let worstCover = 2;

    for (let pov of from.povs) {
      let bestCover = 0;
      let delta = v2.sub(target.at, this.fromCind(pov));

      for (let i = 0; i < 4; i++) {
        let cover = target.cover[i];
        if (cover <= bestCover) continue;
        let dot = v2.dot(Terrain.dirs8[i * 2], delta);
        if (dot < -0.001) bestCover = cover;
      }

      if (bestCover < worstCover) worstCover = bestCover;
    }

    return worstCover;
  }

  async endTurn() {
    delete this.chosen;
    this.game.busy = true;
    this.updateCanvasCache();

    if (this.mode == AIAI) await this.teams[Char.BLUE].think();
    if (this.mode != PP) await this.teams[Char.RED].think();
    for (let c of this.chars) {
      c.ap = 2;
    }
    this.updateCanvasCache();
    this.game.busy = false;
  }

  toggleMode() {
    this.mode = (this.mode + 1) % 3;
    return ["[P+AI] 2P 2AI", "P+AI [2P] 2AI", "P+AI 2P [2AI]"][this.mode];
  }

  setMode(m: number) {
    this.mode = m;
  }

  get animationSpeed() {
    return this.game.busy ? 0.5 : 1.5;
  }

  declareVictory(side:number){
    this.victor = side;
  }
}
