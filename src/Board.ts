import { idiv, random } from "./Util";
import Cell from "./Cell";
import Unit from "./Unit";
import * as v2 from "./v2";
import shadowcast from "./sym-shadowcast";
import Team from "./Team";
import Gun from "./Gun";
import { StageConf, CampaignConf, StateConf } from "./Campaigns";
import Item from "./Item";
import { Action } from "./Action";

type V2 = [number, number];
const sightRange = 20;

export default class Board {
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
  aiTurn: boolean = false;

  dir8Deltas: number[];

  units: Unit[];
  teams: Team[];

  victor: Team;

  boardString: string;

  rni = random(1);

  activeTeam: Team;

  rnf = () => (this.rni() % 1e9) / 1e9;

  serialize() {
    return {
      teams: this.teams.map(t => t.serialize()),
      cells: this.cells.filter(c => c.serializable()).map(o => o.serialize()),
      activeTeam: this.activeTeam.faction
    };
  }

  init(boardString: string) {
    this.boardString = boardString;

    let lines = boardString
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    this.h = lines.length;
    this.w = Math.max(...lines.map(s => s.length));

    this.cells = [];
    this.units = [];
    this.teams = [];

    delete this.victor;

    for (let i = 0; i < 2; i++) {
      let team = new Team(this, i);
      this.teams[i] = team;
    }

    for (let y = 0; y < this.h; y++) {
      let line = lines[y];
      for (let x = 0; x < this.w; x++) {
        let cid = x + y * this.w;
        let symbol = line[x] || " ";
        let cell = new Cell(this, cid, ["+", "#"].indexOf(symbol) + 1);
        if (this.campaign.units[symbol.toLowerCase()])
          new Unit(cell, { symbol, cid });
        if (symbol == "*") cell.addItem(new Item(Item.MEDKIT));
        if (symbol == "~") cell.hole = true;
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

    this.dir8Deltas = Board.dirs8.map(v => v[0] + v[1] * this.w);

    for (let c of this.cells) {
      if (!c.obstacle) c.calculatePovAndCover();
    }

    console.log(this.w);
    console.log(this.h);
    console.time("FOV");

    for (let c of this.cells) {
      if (!c.obstacle) {
        c.calculatePovAndCover();
        c.calculateFov();
      }
    }

    console.timeEnd("FOV");

    for (let c of this.cells) {
      if (!c.obstacle) {
        c.calculateXFov();
        c.calculateDFov();
      }
    }

    this.activeTeam = this.teams[0];

    console.log(this);
  }

  seal(x: number, y: number) {
    this.cells[this.cid(x, y)].seal();
  }

  constructor(
    public campaign: CampaignConf,
    public stage: StageConf,
    state: StateConf,
    public animate: (actions: Action[]) => Promise<void>
  ) {
    for (let gunId in campaign.guns) {
      campaign.guns[gunId] = new Gun(campaign.guns[gunId]);
    }
    this.init(this.stage.board);

    if (state) this.loadState(state);
  }

  loadState(state: StateConf) {
    if (!state || !state.teams) return;

    this.units = [];
    this.cells.forEach(c => {
      delete c.unit;
      c.items = [];
    });

    this.teams = state.teams.map((t, i) => {
      let team = new Team(this, i);
      for (let u of t.units) {
        let unit = new Unit(this.cells[u.cid], u);
        unit.team = team;
      }
      return team;
    });

    this.activeTeam = this.teams[state.activeTeam];
  }

  calcDists(fromi: number) {
    let dists = this.cells.map(_ => [Number.MAX_VALUE, -1]);
    dists[fromi] = [0, -1];
    let todo: number[] = [fromi];

    let unit = this.cells[fromi].unit;

    while (todo.length > 0) {
      let curi = todo.shift();
      let curl = dists[curi][0];
      let curc = this.cells[curi];

      for (let dir = 0; dir < 8; dir++) {
        let diagonal = dir % 2;
        let nexti = this.dir8Deltas[dir] + curi;
        let nextc = this.cells[nexti];

        if (!nextc.passable || (nextc.unit && !nextc.unit.friendly(unit)))
          continue;

        if (
          diagonal &&
          (this.cells[curi + this.dir8Deltas[(dir + 1) % 8]].obstacle ||
            this.cells[curi + this.dir8Deltas[(dir + 7) % 8]].obstacle)
        )
          continue;

        let obstacleness =
          nextc.obstacle +
          curc.obstacle +
          (curc.unit ? 1 : 0) +
          (nextc.unit ? 1 : 0);
        if (obstacleness > 1 && (diagonal && obstacleness > 0)) continue;

        let next = dists[nexti];
        let plusl = obstacleness + (diagonal ? 1.414 : 1);
        if (next[0] > curl + plusl) {
          dists[nexti] = [curl + plusl, curi];
          todo.push(nexti);
        }
      }
    }

    for (let i = 0; i < dists.length; i++) {
      if (!this.cells[i].standable) dists[i][0] = Number.MAX_VALUE;
    }
    return dists;
  }

  /** cell id within map bounds */
  safeCid(x: number, y: number) {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) return this.cid(x, y);
  }

  /** cell id (position in array) */
  cid(x: number, y: number) {
    return x + y * this.w;
  }

  cellAt(x: number, y: number): Cell {
    return this.cells[this.cid(x, y)];
  }

  /** [x,y] for given cid */
  cellIdToV2(ind: number): V2 {
    return [ind % this.w, idiv(ind, this.w)];
  }

  calculateFov(cid: number) {
    let [x, y] = this.cellIdToV2(cid);
    let visibility = new Set<number>();
    shadowcast(
      x,
      y,
      (x, y) => !this.cellAt(x, y).opaque,
      (x, y) => {
        for (let pov of this.cells[this.cid(x, y)].peeked)
          visibility.add(pov.id);
      }
    );
    return visibility;
  }

  calculateDirectFov(cid: number) {
    let [x, y] = this.cellIdToV2(cid);
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

  /**Is "target" in cover from "from"*/
  cover(from: Cell, target: Cell) {
    let visible = from.xfov.has(target.id);

    if (!visible) return -1;

    let worstCover = 2;

    for (let pov of from.povs) {
      let bestCover = 0;
      let delta = v2.sub(target.at, pov.at);

      for (let i = 0; i < 4; i++) {
        let cover = target.cover[i];
        if (cover <= bestCover) continue;
        let dot = v2.dot(Board.dirs8[i * 2], delta);
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

  endSideTurn() {
    this.activeTeam.endTurn();

    this.teams[(this.activeTeam.faction + 1) % this.teams.length].beginTurn();
  }
}
