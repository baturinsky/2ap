import Unit from "./Unit";
import { V2 } from "./v2";
import Team from "./Team";
import { UnitState } from "./Campaigns";
import RenderSchematic from "./RenderSchematic";
import * as v2 from "./v2";

/** Unit's graphic representation */
export class Doll {

  /** World coordinates (tile size is 1) */
  at: V2;
  state: UnitState;

  constructor(private unit: Unit) {
    this.updateState();
  }

  updateState(state?: UnitState) {
    this.state = state || this.unit.serialize();
    this.at = this.unit.board.cellIdToV2(this.unit.cid);
  }

  alive() {
    return this.state.hp > 0;
  }

  of(unit: Unit) {
    return this.unit == unit;
  }

  get strokeColor() {
    return this.state.faction == Team.BLUE ? "#00a" : "#a00";
  }

  get moving() {
    return v2.length(this.state.velocity) > 0;
  }

  get focused() {
    return v2.length(this.state.focus) > 0;
  }

  worldPos(r: { tileSize: number }) {
    return [this.at[0] * r.tileSize, this.at[1] * r.tileSize];
  }
}
