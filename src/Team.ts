import Board from "./Board";

export default class Team {
  strength: number[];
  weakness: number[];
  distance: number[];
  fov = new Set<number>();

  static readonly BLUE = 0;
  static readonly RED = 1;

  constructor(public board: Board, public faction: number) { }

  serialize() {
    return {
      units: this.units.map(u => u.serialize())
    };
  }

  calculate() {
    this.strength = [];
    this.weakness = [];
    this.distance = [];

    let t = this.board;
    this.fov.clear();

    for (let unit of this.units) {
      for (let cell of unit.cell.xfov) this.fov.add(cell);
    }

    let enemyTeam = this.board.teams[1 - this.faction];

    for (let cid of this.fov) {
      let cell = this.board.cells[cid];

      for (let enemy of enemyTeam.units) {
        let tcell = enemy.cell;

        let strength = (4 - t.cover(cell, tcell)) % 5;
        if (!(this.strength[cid] > strength)) this.strength[cid] = strength;

        let weakness = (4 - t.cover(tcell, cell)) % 5;
        if (!(this.weakness[cid] > weakness)) this.weakness[cid] = weakness;

        if (strength > 0 || weakness > 0) {
          let distance = cell.dist(tcell);
          if (!(this.distance[cid] <= distance)) this.distance[cid] = distance;
        }
      }
    }
  }

  async makeAiTurn() {
    this.board.aiTurn = true;

    this.calculate();

    const moveAllAtOnce = true;

    if (moveAllAtOnce) {
      await Promise.all(this.units
        .map(unit => this.board.animate(unit.move(unit.bestPosition()))));

      await Promise.all(this.units.filter(unit => unit.ap > 0)
        .map(unit => this.board.animate(unit.shoot(unit.bestTarget()))))
    } else {
      for (let unit of this.units) {
        await unit.aiMoveAndAct();
      }
    }

    this.board.aiTurn = false;
  }

  endTurn() {

  }

  beginTurn() {
    for (let c of this.units) {
      c.ap = 2;
    }
    this.board.activeTeam = this;
  }

  get units() {
    return this.board.units.filter(c => c.team == this);
  }

  get enemy() {
    return this.board.teams[1 - this.faction];
  }

  get name() {
    return ["RED", "BLUE"][this.faction];
  }

  get color() {
    return ["RED", "BLUE"][this.faction];
  }
}
