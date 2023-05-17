import Gun from "./Gun";
import { idiv, max, runPromisesInOrder } from "./Util";
import Cell from "./Cell";
import * as v2 from "./v2";
import Team from "./Team";
import { UnitConf, UnitState } from "./Campaigns";
import { V2 } from "./v2";
import { Action, ShootAction, WalkAction } from "./Action";

const velocityAccuracyScale = 4 * 0, velocityDefenceScale = 4 * 0;


export default class Unit implements UnitState {
  static readonly EYE = -1;
  static readonly GUNNER = 1;
  static readonly ASSAULT = 2;
  static readonly SNIPER = 3;
  static readonly RECON = 4;
  static readonly MEDIC = 5;
  static readonly HEAVY = 6;
  static readonly COMMANDER = 7;

  dists: number[][];

  speed = 5;
  maxHP = 10;
  hp = this.maxHP;
  ap = 2;

  exhaustion = 0;
  stress = 0;
  focus: V2 = [0, 0];
  velocity: V2 = [0, 0];

  armor = 0;

  sight = 20;
  def = 0;

  aggression = 0;
  name = "dude";

  symbol = "d";

  config: UnitConf;
  team: Team;
  gun: Gun;

  get board() {
    return this.cell.board;
  }

  /** ID of the cell */
  get cid() {
    return this.cell.id;
  }

  serialize() {
    return {
      symbol: this.symbol,
      hp: this.hp,
      ap: this.ap,
      cid: this.cid,
      exhaustion: this.exhaustion,
      stress: this.stress,
      focus: this.focus,
      velocity: this.velocity,
      faction: this.team.faction,
      maxHP: this.maxHP
    } as UnitState;
  }

  static readonly saveFields = "hp ap exhaustion stress focus velocity".split(" ");

  constructor(public cell: Cell, o: UnitState) {
    this.symbol = o.symbol.toLowerCase();
    cell.unit = this;

    let board = cell.board;
    this.board.units.push(this);

    let conf = board.campaign.units[this.symbol];

    Object.assign(this, conf);
    this.hp = this.maxHP;

    console.assert(conf != null, conf);

    this.team =
      board.teams[o.symbol.toUpperCase() == o.symbol ? Team.BLUE : Team.RED];

    for (let key of Unit.saveFields) {
      if (key in o) this[key] = o[key];
    }

    this.gun = this.board.campaign.guns[conf.gun];
  }

  get blue() {
    return this.team == this.board.we;
  }

  pathTo(to: Cell): Cell[] {
    let cid = to.id;
    let path = [cid];
    while (true) {
      cid = this.dists[cid][1];
      if (cid < 0) break;
      path.push(cid);
    }

    return path.reverse().map(cid => this.board.cells[cid]);
  }

  get x() {
    return this.at[0];
  }
  get y() {
    return this.at[1];
  }

  reachable(cell: Cell) {
    return this.apCost(cell) <= this.ap;
  }

  calculateDists() {
    this.dists = this.board.calcDists(this.cid);
  }

  calculate() {
    this.calculateDists();
  }

  cover(target: Cell) {
    return this.board.cover(this.cell, target);
  }

  get at() {
    return this.board.cellIdToV2(this.cid);
  }

  apCost(cell: Cell) {
    if (!this.dists) return Number.MAX_VALUE;
    let l = this.dists[cell.id][0];
    let moves = Math.ceil(l / this.speed);
    return moves;
  }

  canShoot() {
    return this.ap > 0;
  }

  perpendicularVelocity(target: V2) {
    if (!this.moving) return 0;
    let dir = v2.norm(v2.sub(target, this.at));
    let p = v2.det(dir, this.velocity);
    return p;
  }

  velocityAccuracyBonus(target: V2) {
    return -Math.round(Math.abs(this.perpendicularVelocity(target)) * velocityAccuracyScale);
  }

  velocityDefenceBonus(target: V2) {
    return Math.round(Math.abs(this.perpendicularVelocity(target)) * velocityDefenceScale);
  }

  focusAccuracyBonus(target: V2) {
    if (!this.focused) return 0;
    let angle = v2.angleBetween(v2.sub(target, this.at), this.focus);
    let bonus = 1 - (4 * Math.abs(angle)) / Math.PI;
    if (bonus < 0) bonus /= 2;
    return Math.round(bonus * v2.length(this.focus));
  }

  focusDefenceBonus(target: V2) {
    return this.focusAccuracyBonus(target);
  }

  /**Chance to hit target. 0 if hit is impossible. "direct" means target will not step out (is moving) */
  hitChance(tcell: Cell, tunit?: Unit, direct = false, bonuses?: {
    cover?: number;
    dodge?: number;
    distance?: number;
    accuracy?: number;
    ownVelocity?: number;
    targetVelocity?: number;
    ownFocus?: number;
    targetFocus?: number;
  }): number {
    if (!tunit)
      tunit = tcell.unit;
    if (tunit == this)
      return 0;
    let fov = direct ? this.cell.dfov : this.cell.xfov;
    let tat = tcell.at;
    if (!fov.has(tcell.id)) return 0;
    let cover = this.cover(tcell || tunit.cell);
    if (cover == -1) return 0;
    if (!bonuses)
      bonuses = {}
    bonuses.accuracy = this.gun.accuracy;
    bonuses.cover = -cover * 25;
    bonuses.dodge = -tunit.def;
    bonuses.distance = -this.gun.accuracyPenalty(this.dist(tunit));

    bonuses.ownVelocity = this.velocityAccuracyBonus(tat);
    bonuses.targetVelocity = -tunit.velocityDefenceBonus(this.at);

    bonuses.ownFocus = this.focusAccuracyBonus(tat);
    bonuses.targetFocus = -tunit.focusDefenceBonus(this.at);

    if (bonuses.cover < bonuses.targetVelocity)
      bonuses.targetVelocity = 0;
    else
      bonuses.cover = 0;

    //console.log(JSON.stringify(bonuses));

    let chance = Math.round(Object.values(bonuses).reduce((a, b) => a + b));
    return chance;
  }

  die() {
    this.board.units = this.board.units.filter(c => c.hp > 0);
    delete this.cell.unit;
    if (this.team.units.length == 0) {
      this.board.declareVictory(this.team.enemy);
    }
  }

  takeDamage(dmg: number) {
    this.hp = Math.max(0, this.hp - dmg);
    if (this.hp <= 0) {
      this.die();
    }
  }

  /** Tries to shoot at target at cell, return null if shot is impossible,
   * {miss:true} for miss, {dmg:number} for hit
  */
  shoot(tcell: Cell): Action[] {    
    if(this.ap <= 0 || !tcell) return null;
    let target = tcell.unit;
    if (!target) return null;

    let chance = this.hitChance(tcell);
    if (chance == 0) return [this.shootAction(tcell, null)];

    let success = this.board.rni() % 100 < chance;

    this.ap = 0;
    let dmg = null;
    if (success) {
      dmg = this.gun.damageRoll(this, target.cell, this.board.rnf);
    }

    target.takeDamage(dmg);
    if (target.hp <= 0) this.team.calculate();

    let dir = v2.norm(v2.sub(tcell.at, this.at));
    this.focusAccuracyBonus(tcell.at)
    this.focus = v2.scale(dir, Math.min(this.gun.maxFocus, 10 + this.focusAccuracyBonus(tcell.at)));
    this.velocity = [0, 0];    

    return [this.shootAction(tcell, dmg)];
  }

  updateAction(){
    return { action: "state", unit: this };
  }

  changePosition(to: Cell) {
    if (this.cell) {
      if (this.cell == to) return;
      delete this.cell.unit;
    }

    to.unit = this;
    this.cell = to;

    this.calculate();
  }

  calculateReactionFire(path: V2[]) {
    let enemies = this.team.enemy.units;
    let rfPoints = [] as { moment: number; enemy: Unit }[];
    for (let enemy of enemies) {
      if (enemy.ap == 0) continue;
      let bestMoment = max(
        path,
        step => !step.unit && enemy.averageDamage(step, this, true)
      );
      if (bestMoment && bestMoment.val >= 1) {
        rfPoints.push({ moment: bestMoment.ind, enemy });
      }
    }

    rfPoints = rfPoints.sort((a, b) => (a.moment > b.moment ? 1 : -1));

    return rfPoints;
  }

  calculateVelocity(path: Cell[]) {
    let delta = v2.sub(path[path.length - 1].at, path[0].at);
    return v2.round(v2.norm(delta, this.speed));
  }

  move(to: Cell) {
    if (to == this.cell || !to) return null;
    this.ap -= this.apCost(to);

    let path = this.pathTo(to);

    this.velocity = this.calculateVelocity(path);
    this.focus = v2.norm(this.velocity, 10)

    let enemies = this.team.enemy.units;

    let actions: Action[] = [];

    /** Optimal moment to reactionfire this unit */
    let rfPoints = [] as { moment: number; enemy: Unit }[];
    for (let enemy of enemies) {
      if (enemy.ap == 0) continue;
      let bestMoment = max(
        path,
        step => !step.unit && enemy.averageDamage(step, this, true)
      );
      if (bestMoment && bestMoment.val >= 1) {
        rfPoints.push({ moment: bestMoment.ind, enemy });
      }
    }

    rfPoints = rfPoints.sort((a, b) => (a.moment > b.moment ? 1 : -1));

    for (let rfPoint of rfPoints) {
      let place = path[rfPoint.moment];
      actions.push(this.walkAction(this.pathTo(place)))
      this.changePosition(place);
      let shot = rfPoint.enemy.shoot(place);
      if (shot){
        actions = actions.concat(shot);
      }
      if (!this.alive) return actions;
    }

    actions.push(this.walkAction(this.pathTo(to)));
    this.changePosition(to);

    if (this.cell.items.length > 0) {
      this.hp = this.maxHP;
      this.cell.items = [];
    }

    return actions;
  }

  walkAction(path: Cell[]) {
    if (path.length <= 1) return null;
    return { action: "walk", unit: this, path } as WalkAction;
  }

  shootAction(to: Cell, damage: number) {
    let direct = this.board.activeTeam != this.team;    
    return {
      action: "shoot",
      from: this.cell,
      to,
      shooter: this,
      victim: to.unit,
      damage,
      direct
    } as ShootAction;
  }

  canDamage(target: Unit) {
    return (
      target &&
      this.team != target.team &&
      this.cell.xfov.has(target.cid) &&
      this.canShoot()
    );
  }

  /** Calculates best position to move to, using team.strength and team.weakness of the cells */
  bestPosition(): Cell {
    let team = this.team;
    this.calculate();
    let bestScore = -100;
    let bestAt: number;
    for (let i in this.dists) {
      let d = this.dists[i][0];
      if (d > this.speed * this.ap) continue;
      let score =
        team.strength[i] -
        team.weakness[i] -
        idiv(d, this.speed) * 0.5 -
        d * 0.001;
      score += team.distance[i] * this.aggression;

      if (score > bestScore) {
        bestScore = score;
        bestAt = Number(i);
      }
    }
    return this.board.cells[bestAt];
  }

  averageDamage(tcell: Cell, tunit?: Unit, direct = false) {
    let hitChance = this.hitChance(tcell, tunit, direct);
    return (hitChance * this.gun.averageDamage(this, tcell)) / 100;
  }

  bestTarget() {
    let bestScore = -100;
    let bestAt: Cell = null;
    for (let target of this.board.units) {
      if (target.team == this.team || target.hp <= 0) continue;
      let score = this.averageDamage(target.cell);
      if (score > bestScore) {
        bestScore = score;
        bestAt = target.cell;
      }
    }
    return bestAt;
  }

  async aiMoveAndAct() {
    if (!this.alive)
      return;
    await this.board.animate(this.move(this.bestPosition()));
    await this.board.animate(this.shoot(this.bestTarget()));
  }

  dist(other: Unit | Cell) {
    return v2.dist(this.at, other.at);
  }

  get alive() {
    return this.hp > 0;
  }

  friendly(other: Unit) {
    return other && this.team == other.team;
  }

  get moving() {
    return v2.length(this.velocity) > 0;
  }

  get focused() {
    return v2.length(this.focus) > 0;
  }
}
