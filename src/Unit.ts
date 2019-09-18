import Gun from "./Gun";
import { canvasCache, idiv, Context2d, max } from "./Util";
import { tileSize } from "./settings";
import Terrain from "./Terrain";
import Cell from "./Cell";
import * as v2 from "./v2";
import { V2 } from "./v2";
import * as lang from "./lang";
import Game from "./Game";
import Team from "./Team";

export default class Unit {
  static readonly EYE = -1;
  static readonly GUNNER = 1;
  static readonly ASSAULT = 2;
  static readonly SNIPER = 3;
  static readonly RECON = 4;
  static readonly MEDIC = 5;
  static readonly HEAVY = 6;
  static readonly COMMANDER = 7;

  static letters = "`gasrmhc".split("");

  dists: number[][];

  speed = 5;
  maxHP = 10;
  hp = this.maxHP;
  ap = 2;
  armor = 0;

  sight = 20;
  def = 0;

  constructor(
    public terrain: Terrain,
    public kind: number,
    public team: Team,
    public cid: number,
    public gun = new Gun()
  ) {
    if (kind != Unit.EYE) terrain.units.push(this);

    switch (kind) {
      case Unit.GUNNER:
        this.speed = 4;
        this.hp = 14;
        break;
      case Unit.ASSAULT:
        this.speed = 6;
        this.armor = 1;
        this.gun = Gun.SHOTGUN;
        break;
      case Unit.SNIPER:
        this.hp = 7;
        this.def = 10;
        this.gun = Gun.SNIPER;
        break;
    }
    //console.log(this);

    this.maxHP = this.hp;
  }

  static from(terrain: Terrain, letter: string, cid: number) {
    let io = Unit.letters.indexOf(letter);
    if (io >= 0) return new Unit(terrain, io, terrain.teams[Team.RED], cid);
    io = Unit.letters.indexOf(letter.toLowerCase());
    if (io >= 0) return new Unit(terrain, io, terrain.teams[Team.BLUE], cid);
  }

  //sprites: { [key: number]: OffscreenCanvas } = {};

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

  get cell() {
    return this.terrain.cells[this.cid];
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

  hitChance(target: Unit, cell?: Cell): number {
    if (!this.cell.xfov.has((cell || target.cell).cid)) return 0;
    let cover = this.cover(cell || target.cell);
    if (cover == -1) return 0;
    let accuracy = this.gun.accuracy;
    let dodge = target.def;
    let chance = Math.round(
      accuracy -
        cover * 20 -
        dodge -
        this.gun.accuracyPenalty(this.dist(target))
    );
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

  async shoot(cell: Cell) {
    if (!cell) return false;
    let target = cell.unit;
    if (!target) return false;

    let chance = this.hitChance(target);
    if (chance == 0) return false;

    let success = this.terrain.rni() % 100 < chance;

    this.ap = 0;
    let dmg = 0;
    if (success) {
      dmg = this.gun.damageRoll(this, target, this.terrain.rnf);
    }

    await this.animateShoot(target.cid, dmg);

    target.takeDamage(dmg);
    if (target.hp <= 0) this.team.calculate();

    return true;
  }

  teleport(to: Cell) {
    if (this.cell.cid == to.cid) return;
    delete this.cell.unit;
    this.cid = to.cid;
    this.cell.unit = this;
    this.calculate();
  }

  async move(to: Cell) {
    if (to == this.cell || !to) return false;
    this.ap -= this.apCost(to);

    let path = this.pathTo(to);
    let enemies = this.team.enemy.units;
    let owPoints = [] as { moment: number; enemy: Unit }[];
    for (let enemy of enemies) {
      if (enemy.ap == 0) continue;
      let bestMoment = max(path, step => enemy.averageDamage(this, step));
      if (bestMoment && bestMoment.val > 0) {
        owPoints.push({ moment: bestMoment.ind, enemy });
      }
    }

    owPoints = owPoints.sort((a, b) => (a.moment > b.moment ? 1 : -1));

    for (let owPoint of owPoints) {
      let place = path[owPoint.moment];
      await this.animateWalk(this.pathTo(place));
      this.teleport(place);
      await owPoint.enemy.shoot(place);
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
      if (this.kind == Unit.ASSAULT) score -= team.distance[i] * 0.1;
      if (this.kind == Unit.SNIPER) score += team.distance[i] * 0.1;

      if (score > bestScore) {
        bestScore = score;
        bestAt = Number(i);
      }
    }
    return this.terrain.cells[bestAt];
  }

  averageDamage(tchar: Unit, cell?: Cell) {
    let hitChance = this.hitChance(tchar, cell);
    return hitChance * this.gun.averageDamage(this, tchar, cell);
  }

  bestTarget() {
    let bestScore = -100;
    let bestAt: Cell = null;
    for (let tchar of this.terrain.units) {
      if (tchar.team == this.team || tchar.hp <= 0) continue;
      let score = this.averageDamage(tchar);
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

  info() {
    let name = [, "gunner", "assault", "sniper"][this.kind];
    return `${name.toUpperCase()} <b>${this.hp}HP</b> ${lang[name]}`;
  }

  get alive() {
    return this.hp > 0;
  }
}
