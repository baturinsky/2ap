import Terrain from "./Terrain";

export default class Team {
  strength: number[];
  weakness: number[];
  distance: number[];
  fov = new Set<number>();

  static readonly RED = 0;
  static readonly BLUE = 1;

  constructor(public terrain: Terrain, public faction: number) {}

  calculate() {
    this.strength = [];
    this.weakness = [];
    this.distance = [];

    let t = this.terrain;
    this.fov.clear();

    for (let unit of this.units) {
      for (let cell of unit.cell.xfov) this.fov.add(cell);
    }

    let enemyTeam = this.terrain.teams[1-this.faction];

    for (let cid of this.fov) {
      let cell = this.terrain.cells[cid];

      for (let enemy of enemyTeam.units) {        
        let tcell = enemy.cell;

        let strength = (4 - t.cover(cell, tcell)) % 5;
        if (!(this.strength[cid] > strength)) this.strength[cid] = strength;

        let weakness = (4 - t.cover(tcell, cell)) % 5;
        if (!(this.weakness[cid] > weakness)) this.weakness[cid] = weakness;

        if (strength > 0 || weakness > 0) {
          let distance = cell.dist(tcell);
          if (!(this.distance[cid] <= distance))
            this.distance[cid] = distance;
        }
      }
    }
  }

  async think() {
    this.terrain.aiTurn = true;

    this.calculate();
    for (let unit of this.terrain.units) {
      if (unit.team == this) {
        await unit.think();
      }
    }
    
    this.terrain.aiTurn = false;

  }

  get units(){
    return this.terrain.units.filter(c => c.team == this)
  }

  get enemy(){
    return this.terrain.teams[1-this.faction]
  }

  get name(){
    return ["RED", "BLUE"][this.faction];
  }

  get color(){
    return ["RED", "BLUE"][this.faction];
  }

}
