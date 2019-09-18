import { idiv, Context2d, createCanvas, random } from "./Util";
import Cell from "./Cell";
import Unit from "./Unit";
import Game from "./Game";
import * as v2 from "./v2";
import { tileSize } from "./settings";
import shadowcast from "./sym-shadowcast";
import Team from "./Team";

type V2 = [number, number];
const sightRange = 20;

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
  aiTurn:boolean = false;

  dir8Deltas: number[];

  units: Unit[];
  teams: Team[];

  victor: Team;

  rni = random(1);

  rnf = () => (this.rni() % 1e9) / 1e9;

  init(terrainString: string) {
    let lines = terrainString
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    this.h = lines.length;
    this.w = Math.max(...lines.map(s => s.length));

    this.cells = [];
    this.units = [];
    this.teams = [];

    for (let i = 0; i < 2; i++) {
      let team = new Team(this, i);
      this.teams[i] = team;
    }

    for (let y = 0; y < this.h; y++) {
      delete this.victor;

      let line = lines[y];
      for (let x = 0; x < this.w; x++) {
        let cid = x + y * this.w;
        let unit = line[x] || " ";
        let cell = new Cell(
          this,
          cid,
          ["+", "#"].indexOf(unit) + 1,
          Unit.from(this, unit, this.cid(x, y))
        );
        if (unit == "*") cell.goody = 1;
        this.cells[cid] = cell;
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

    for (let c of this.cells) {
      if (!c.obstacle) c.calculatePovAnCover();
    }

    for (let c of this.cells) {
      if (!c.obstacle) {
        c.calculatePovAnCover();
        c.calculateFov();
      }
    }

    for (let c of this.cells) {
      if (!c.obstacle) c.calculateXFov();
    }
  }

  seal(x: number, y: number) {
    this.cells[this.cid(x, y)].seal();
  }

  constructor(public terrainString: string, public animate: (any) => Promise<void>) {
    this.init(terrainString);
  }

  calcDists(x: number, y?: number) {
    let fromi = isNaN(+y) ? x : this.cid(x, y);
    let dists = this.cells.map(_ => [Number.MAX_VALUE, -1]);
    dists[fromi] = [0, -1];
    let todo: number[] = [fromi];

    while (todo.length > 0) {
      let curi = todo.shift();
      let curl = dists[curi][0];
      for (let dir = 0; dir < 8; dir++) {
        let diagonal = dir % 2;
        let nexti = this.dir8Deltas[dir] + curi;

        let blocked = !!(this.cells[nexti].obstacle || this.cells[nexti].unit);
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

  cid(x: number, y: number) {
    return x + y * this.w;
  }

  cellAt(x: number, y: number): Cell {
    return this.cells[this.cid(x, y)];
  }

  fromCid(ind: number): V2 {
    return [ind % this.w, idiv(ind, this.w)];
  }

  calculateFov(cid: number) {
    let [x, y] = this.fromCid(cid);
    let visibility = new Set<number>();
    shadowcast(
      x,
      y,
      (x, y) => !this.cellAt(x, y).opaque,
      (x, y) => {
        for (let pov of this.cells[this.cid(x, y)].peeked)
          visibility.add(pov.cid);
      }
    );
    return visibility;
  }

  calculateDirectFov(cid: number) {
    let [x, y] = this.fromCid(cid);
    let visibility = new Set<number>();
    shadowcast(
      x,
      y,
      (x, y) => !this.cellAt(x, y).opaque,
      (x, y) => {
        visibility.add(this.cid(x, y));
      }
    );
    return visibility;
  }


  obstacles(cid: number) {
    let obstacles: number[] = [];
    for (let dir = 0; dir < 8; dir += 2) {
      let forward = cid + this.dir8Deltas[dir];
      obstacles.push(this.cells[forward].obstacle);
    }
    return obstacles;
  }

  cover(from: Cell, target: Cell) {
    let visible = from.xfov.has(target.cid);

    if (!visible) return -1;

    let worstCover = 2;

    for (let pov of from.povs) {
      let bestCover = 0;
      let delta = v2.sub(target.at, pov.at);

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

  declareVictory(team: Team) {
    this.victor = team;
  }

  get we() {
    return this.teams[Team.BLUE];
  }
}
