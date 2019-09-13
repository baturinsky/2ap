import Terrain from "./Terrain";

export default class Team {
  strength: number[];
  weakness: number[];
  distance: number[];
  fov = new Set<number>();

  constructor(public terrain: Terrain, public faction: number) {}

  calculate() {
    this.strength = [];
    this.weakness = [];
    this.distance = [];

    let t = this.terrain;
    this.fov.clear();

    for (let char of this.chars) {
      for (let cell of char.cell.fov) this.fov.add(cell);
    }

    let enemyTeam = this.terrain.teams[1-this.faction];

    for (let cind of this.fov) {
      let cell = this.terrain.cells[cind];

      for (let enemy of enemyTeam.chars) {        
        let tcell = enemy.cell;

        let strength = (4 - t.cover(cell, tcell)) % 5;
        if (!(this.strength[cind] > strength)) this.strength[cind] = strength;

        let weakness = (4 - t.cover(tcell, cell)) % 5;
        if (!(this.weakness[cind] > weakness)) this.weakness[cind] = weakness;

        if (strength > 0 || weakness > 0) {
          let distance = cell.dist(tcell);
          if (!(this.distance[cind] <= distance))
            this.distance[cind] = distance;
        }
      }
    }
  }

  async think() {
    this.calculate();
    for (let char of this.terrain.chars) {
      if (char.faction == this.faction) await char.think();
    }
  }

  get chars(){
    return this.terrain.chars.filter(c => c.faction == this.faction)
  }
}
