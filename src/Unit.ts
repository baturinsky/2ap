import Gun from "./Gun";
import { idiv, max } from "./Util";
import Terrain from "./Terrain";
import Cell from "./Cell";
import * as v2 from "./v2";
import Team from "./Team";
import { UnitConf, UnitState } from "./Campaigns";
import { V2 } from "./v2";

export default class Unit {
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

  get terrain() {
    return this.cell.terrain;
  }

  get cid() {
    return this.cell.cid;
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
      velocity: this.velocity
    };
  }

  static readonly saveFields = "hp ap exhaustion stress focus velocity".split(
    " "
  );

  constructor(public cell: Cell, o: UnitState) {
    this.symbol = o.symbol.toLowerCase();
    cell.unit = this;

    let terrain = cell.terrain;
    this.terrain.units.push(this);

    let conf = terrain.campaign.units[this.symbol];

    Object.assign(this, conf);
    this.hp = this.maxHP;

    console.assert(conf);

    this.team =
      terrain.teams[o.symbol.toUpperCase() == o.symbol ? Team.BLUE : Team.RED];

    for (let key of Unit.saveFields) {
      if (key in o) this[key] = o[key];
    }

    this.gun = this.terrain.campaign.guns[conf.gun];
  }

  get blue() {
    return this.team == this.terrain.we;
  }

  pathTo(to: Cell): Cell[] {
    let cid = to.cid;
    let path = [cid];
    while (true) {
      cid = this.dists[cid][1];
      if (cid < 0) break;
      path.push(cid);
    }

    return path.reverse().map(cid => this.terrain.cells[cid]);
  }

  get strokeColor() {
    return this.blue ? "#00a" : "#a00";
  }

  get x() {
    return this.cid % this.terrain.w;
  }
  get y() {
    return idiv(this.cid, this.terrain.w);
  }

  reachable(cell: Cell) {
    return this.apCost(cell) <= this.ap;
  }

  calculateDists() {
    this.dists = this.terrain.calcDists(this.cid);
  }

  calculate() {
    this.calculateDists();
  }

  cover(target: Cell) {
    return this.terrain.cover(this.cell, target);
  }

  get at() {
    return this.terrain.fromCid(this.cid);
  }

  apCost(cell: Cell) {
    if (!this.dists) return Number.MAX_VALUE;
    let l = this.dists[cell.cid][0];
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
    return -Math.round(Math.abs(this.perpendicularVelocity(target)) * 4);
  }

  velocityDefenceBonus(target: V2) {
    return Math.round(Math.abs(this.perpendicularVelocity(target)) * 4);
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

  hitChance(tcell:Cell, tunit?:Unit, direct = false, bonuses?:{
    cover?: number;
    dodge?: number;
    distance?: number;
    accuracy?: number;
    ownVelocity?: number;
    targetVelocity?: number;
    ownFocus?: number;
    targetFocus?: number;
  }): number {
    if(!tunit)
      tunit = tcell.unit;
    if(tunit == this)
      return 0;
    let fov = direct ? this.cell.dfov : this.cell.xfov;
    let tat = tcell.at;
    if (!fov.has(tcell.cid)) return 0;
    let cover = this.cover(tcell || tunit.cell);
    if (cover == -1) return 0;
    if(!bonuses)
      bonuses = {}
    bonuses.accuracy = this.gun.accuracy;
    bonuses.cover = -cover * 25;
    bonuses.dodge = -tunit.def;
    bonuses.distance = -this.gun.accuracyPenalty(this.dist(tunit));
    bonuses.ownVelocity = this.velocityAccuracyBonus(tat);
    bonuses.targetVelocity = -tunit.velocityDefenceBonus(this.at);
    bonuses.ownFocus = this.focusAccuracyBonus(tat);
    bonuses.targetFocus = -tunit.focusDefenceBonus(this.at);

    if(bonuses.cover < bonuses.targetVelocity)
      bonuses.targetVelocity = 0;
    else
      bonuses.cover = 0;

    console.log(JSON.stringify(bonuses));

    let chance = Math.round(Object.values(bonuses).reduce((a, b) => a + b));
    return chance;
  }

  die() {
    this.terrain.units = this.terrain.units.filter(c => c.hp > 0);
    delete this.cell.unit;
    if (this.team.units.length == 0) {
      this.terrain.declareVictory(this.team.enemy);
    }
  }

  takeDamage(dmg: number) {
    this.hp = Math.max(0, this.hp - dmg);
    if (this.hp <= 0) {
      this.die();
    }

    this.onChange();
  }

  onChange() {
    this.terrain.animate({ char: this });
  }

  async shoot(tcell: Cell) {
    if (!tcell) return false;
    let target = tcell.unit;
    if (!target) return false;

    let chance = this.hitChance(tcell);
    if (chance == 0) return false;

    let success = this.terrain.rni() % 100 < chance;

    this.ap = 0;
    let dmg = 0;
    if (success) {
      dmg = this.gun.damageRoll(this, target.cell, this.terrain.rnf);
    }

    await this.animateShoot(target.cid, dmg);

    target.takeDamage(dmg);
    if (target.hp <= 0) this.team.calculate();

    let dir = v2.norm(v2.sub(tcell.at, this.at));
    this.focusAccuracyBonus(tcell.at)
    this.focus = v2.scale(dir, Math.max(this.gun.maxFocus, 10 + this.focusAccuracyBonus(tcell.at)));
    this.velocity = [0, 0];

    return true;
  }

  teleport(to: Cell) {
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

  async move(to: Cell) {
    if (to == this.cell || !to) return false;
    this.ap -= this.apCost(to);

    let path = this.pathTo(to);

    this.velocity = this.calculateVelocity(path);
    this.focus = v2.norm(this.velocity, 10)

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

    for (let owPoint of rfPoints) {
      let place = path[owPoint.moment];
      await this.animateWalk(this.pathTo(place));
      this.teleport(place);
      await owPoint.enemy.shoot(place);
      if (!this.alive) return true;
    }

    await this.animateWalk(this.pathTo(to));
    this.teleport(to);

    if (this.cell.goody) {
      this.hp = this.maxHP;
      this.cell.goody = 0;
    }

    return true;
  }

  async animateWalk(path: Cell[]) {
    if (path.length <= 1) return;
    await this.terrain.animate({ anim: "walk", char: this, path });
  }

  async animateShoot(tcid: number, damage: number) {
    await this.terrain.animate({
      anim: "shoot",
      from: this.cid,
      to: tcid,
      damage
    });
  }

  canDamage(target: Unit) {
    return (
      target &&
      this.team != target.team &&
      this.cell.xfov.has(target.cid) &&
      this.canShoot()
    );
  }

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
    return this.terrain.cells[bestAt];
  }

  averageDamage(tcell: Cell, tunit?:Unit, direct = false) {
    let hitChance = this.hitChance(tcell, tunit, direct);
    return (hitChance * this.gun.averageDamage(this,tcell)) / 100;
  }

  bestTarget() {
    let bestScore = -100;
    let bestAt: Cell = null;
    for (let tchar of this.terrain.units) {
      if (tchar.team == this.team || tchar.hp <= 0) continue;
      let score = this.averageDamage(tchar.cell);
      if (score > bestScore) {
        bestScore = score;
        bestAt = tchar.cell;
      }
    }
    return bestAt;
  }

  async think() {
    await this.move(this.bestPosition());
    if (this.ap > 0) {
      await this.shoot(this.bestTarget());
    }
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
