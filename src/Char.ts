import Gun from "./Gun";
import Game from "./Game";
import { canvasCache, idiv, Context2d } from "./Util";
import { tileSize } from "./settings";
import Terrain from "./Terrain";
import * as v2 from "./v2";
import Cell from "./Cell";
import { V2 } from "./v2";
import * as lang from "./lang";
import { disposeEmitNodes } from "typescript";

export default class Char {
  static readonly EYE = -1;
  static readonly GUNNER = 1;
  static readonly ASSAULT = 2;
  static readonly SNIPER = 3;
  static readonly RECON = 4;
  static readonly MEDIC = 5;
  static readonly HEAVY = 6;
  static readonly COMMANDER = 7;

  static readonly RED = 0;
  static readonly BLUE = 1;

  static letters = "`gasrmhc".split("");

  dists: number[][];

  move = 5;
  maxHP = 10;
  hp = this.maxHP;
  ap = 2;
  armor = 0;

  sight = 20;
  def = 0;

  animatedPath: number[];
  animatedShot: [V2, V2];
  animationStage: number;
  shotText: string;

  //flanking = new Set<number>();

  constructor(
    public terrain: Terrain,
    public kind: number,
    public faction: number,
    public cind: number,
    public gun = new Gun()
  ) {
    if (kind != Char.EYE) terrain.chars.push(this);

    switch (kind) {
      case Char.GUNNER:
        this.move = 4;
        this.hp = 14;
        break;
      case Char.ASSAULT:
        this.move = 6;
        this.armor = 1;
        this.gun = Gun.SHOTGUN;
        break;
      case Char.SNIPER:
        this.hp = 7;
        this.def = 10;
        this.gun = Gun.SNIPER;
        break;
    }
    //console.log(this);

    this.maxHP = this.hp;
  }

  static from(terrain: Terrain, letter: string, cind: number) {
    let io = Char.letters.indexOf(letter);
    if (io >= 0) return new Char(terrain, io, Char.RED, cind);
    io = Char.letters.indexOf(letter.toLowerCase());
    if (io >= 0) return new Char(terrain, io, Char.BLUE, cind);
  }

  //sprites: { [key: number]: OffscreenCanvas } = {};

  renderBody(ctx: Context2d) {
    let flankNum = 0;
    let e = this.terrain.eye;
    if (e && e.cell.fov && e.faction != this.faction) {
      let visible = e.cell.fov.has(this.cind) || this.faction == e.faction;
      if (visible)
        flankNum = (this.cover(e) == 0 ? 1 : 0) + (e.cover(this) == 0 ? 2 : 0);
      else flankNum = 4;
    }

    if(!this.terrain.hoveredTile)
      flankNum = 0;

    ctx.fillStyle = ["#fff", "#faa", "#afa", "#ffa", "#ccc"][flankNum];
    ctx.strokeStyle = this.strokeColor;

    ctx.shadowColor = "#444";
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(0.5 * tileSize, 0.5 * tileSize, tileSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = `rgba(0,0,0,0)`;

    ctx.lineWidth = 2;
    for (let i = 0; i < this.hp; i++) {
      let angle = Math.PI * (1 - i / (this.maxHP - 1));
      let v = v2.fromAngle(angle);
      ctx.beginPath();
      ctx.moveTo((0.5 + v[0] * 0.4) * tileSize, (0.5 + v[1] * 0.4) * tileSize);
      ctx.lineTo((0.5 + v[0] * 0.5) * tileSize, (0.5 + v[1] * 0.5) * tileSize);
      ctx.stroke();
    }
    ctx.lineWidth = 1;

    ctx.fillStyle = this.strokeColor;
    ctx.textAlign = "center";
    ctx.font = `bold ${tileSize / 2}pt Courier`;
    ctx.fillText(
      Char.letters[this.kind].toUpperCase(),
      0.5 * tileSize,
      0.66 * tileSize
    );
    ctx.stroke();
  }

  get friend() {
    return this.faction == 1;
  }

  render(ctx: Context2d) {
    if (this.animatedShot) {
      ctx.lineWidth = 4;
      ctx.beginPath();
      let delta = v2.norm(
        v2.sub(this.animatedShot[1], this.animatedShot[0]),
        -20
      );
      let at = v2.lerp(
        this.animatedShot[0],
        this.animatedShot[1],
        this.animationStage
      );
      let tail = v2.sum(at, delta);
      var grad = ctx.createLinearGradient(tail[0], tail[1], at[0], at[1]);
      grad.addColorStop(0, `rgba(0,0,0,0)`);
      grad.addColorStop(1, `rgba(0,0,0,1)`);

      ctx.strokeStyle = grad;

      ctx.moveTo(...tail);
      ctx.lineTo(...at);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000";
    }

    ctx.save();

    ctx.translate(...this.screenPos());

    this.renderBody(ctx);

    if (this.ap > 0) {
      ctx.fillStyle = this.strokeColor;
      ctx.beginPath();
      ctx.moveTo(1, 1);
      ctx.lineTo(6, 1);
      ctx.lineTo(1, 6);
      ctx.closePath();
      ctx.fill();
      if (this.ap > 1) {
        ctx.beginPath();
        ctx.moveTo(tileSize - 1, 1);
        ctx.lineTo(tileSize - 6, 1);
        ctx.lineTo(+tileSize - 1, 6);
        ctx.closePath();
        ctx.fill();
      }
    }

    if (this.selected) {
      this.outline(ctx, Math.sin(new Date().getTime() / 100) + 1);
    }
    if (this.hovered) {
      this.outline(ctx, 1.5);
    }
    ctx.restore();
  }

  pathTo(cind: number) {
    let path = [cind];
    while (true) {
      cind = this.dists[cind][1];
      if (cind < 0) break;
      path.push(cind);
    }

    return path.reverse();
  }

  get strokeColor() {
    return this.friend ? "#00a" : "#a00";
  }

  outline(ctx: Context2d, width = 2) {
    ctx.save();
    ctx.shadowColor = `rgba(0,0,0,0)`;
    ctx.strokeStyle = this.strokeColor;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(tileSize / 2, tileSize / 2, tileSize * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  get hovered() {
    return this.terrain.hoveredChar == this;
  }

  get selected() {
    return this.terrain.chosen == this;
  }

  get x() {
    return this.cind % this.terrain.w;
  }
  get y() {
    return idiv(this.cind, this.terrain.w);
  }

  to(cind: number) {
    if (cind == this.cind || !cind) return false;
    this.animateWalk(cind);

    delete this.cell.char;
    this.cind = cind;
    this.cell.char = this;
    this.ap -= this.apCost(cind);
    if(this.cell.goody){
      this.hp = this.maxHP
      this.cell.goody = 0;
    }
    this.calculate();
    this.cell.calculate();
    return true;
  }

  animateWalk(cind: number) {
    this.animatedPath = this.pathTo(cind);
    this.animationStage = 0.01;
  }

  get cell() {
    return this.terrain.cells[this.cind];
  }

  reachable(cind: number) {
    return this.apCost(cind) <= this.ap;
  }

  calculateDists() {
    this.dists = this.terrain.calcDists(this.cind);
  }

  calculate() {
    this.calculateDists();
    //this.calculateFlanking();
    //this.cell.calculate();
  }

  /*calculateFlanking() {
    this.flanking = new Set<number>();

    for (let tchar of this.terrain.chars) {
      let tcell = tchar.cell;
      if (tchar.faction == this.faction) continue;
      let theirCover = this.cover(tchar);
      if (theirCover == 0) this.flanking.add(tcell.cind);
      let myCover = tchar.cover(this);
      if (myCover == 0) tchar.flanking.add(this.cind);
    }
  }*/

  cover(target: Char) {
    return this.terrain.cover(this.cell, target.cell);
  }

  get at() {
    return this.terrain.fromCind(this.cind);
  }

  apCost(cind: number) {
    if (!this.dists) return Number.MAX_VALUE;
    let l = this.dists[cind][0];
    let moves = Math.ceil(l / this.move);
    return moves;
  }

  canFire() {
    return this.ap > 0;
  }

  hitChance(target: Char) {
    let cover = this.cover(target);
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

  die(){
    this.terrain.chars = this.terrain.chars.filter(c => c.hp>0)
    delete this.cell.char;
    if(this.team.chars.length == 0){
      this.terrain.declareVictory(1-this.faction);
    }
  }

  takeDamage(dmg: number) {
    this.hp = Math.max(0, this.hp - dmg);
    if(this.hp<=0){
      this.die()
    }
    this.terrain.resetCanvasCache();
    this.terrain.game.updateInfo(
      this.terrain.hoveredChar ? this.terrain.hoveredChar.info() : null
    );
  }

  get team(){
    return this.terrain.teams[this.faction];
  }

  fire(cell: Cell) {
    if(!cell)
      return false;
    let target = cell.char;
    if (!target) return false;

    let chance = this.hitChance(target);
    if (chance == 0) return false;

    let success = this.terrain.game.rni() % 100 < chance;

    this.ap = 0;
    let text = "MISS";
    if (success) {
      let dmg = this.gun.damageRoll(this, target, this.terrain.game.rnf);
      target.takeDamage(dmg);
      if(target.hp<=0)
        this.team.calculate();
      text = `-${dmg}`;
    }

    this.shotText = text;

    this.animateShot(target.cind);

    return true;
  }

  animateShot(target: number) {
    this.animationStage = 0.01;
    this.animatedShot = [this.cind, target].map(i =>
      this.terrain.cindToCenter(i)
    ) as [V2, V2];
  }

  canDamage(target: Char) {
    return (
      target &&
      this.faction != target.faction &&
      this.cell.fov.has(target.cind) &&
      this.canFire()
    );
  }

  bestPosition() {
    let team = this.terrain.teams[this.faction];
    this.calculate();
    let bestScore = -100;
    let bestAt: number;
    for (let i in this.dists) {
      let d = this.dists[i][0];
      if (d > this.move * this.ap) continue;
      //debugger;
      let score =
        team.strength[i] -
        team.weakness[i] -
        idiv(d, this.move) * 0.5 -
        d * 0.001;
      if (this.kind == Char.ASSAULT) score -= team.distance[i] * 0.1;
      if (this.kind == Char.SNIPER) score += team.distance[i] * 0.1;

      if (score > bestScore) {
        bestScore = score;
        bestAt = Number(i);
      }
    }
    return bestAt;
  }

  bestTarget() {
    let bestScore = -100;
    let bestAt: Cell = null;
    for (let tchar of this.terrain.chars) {
      if (tchar.faction == this.faction || tchar.hp<=0) continue;
      let hitChance = this.hitChance(tchar);
      let damageExpected = this.gun.averageDamage(this, tchar);
      let score = hitChance * damageExpected;
      if (score > bestScore) {
        bestScore = score;
        bestAt = tchar.cell;
      }
    }
    return bestAt;
  }

  async think() {
    if (this.to(this.bestPosition())) await this.terrain.game.waitForAnim();
    if (this.ap > 0) {
      if (this.fire(this.bestTarget())) await this.terrain.game.waitForAnim();
    }
  }

  update(dTime: number) {
    if (this.animationStage) {
      if (this.animatedPath) {
        this.animationStage += dTime * 15 * this.terrain.animationSpeed;
        if (this.animationStage > this.animatedPath.length) {
          this.endAnimation();
        }
      }
      if (this.animatedShot) {
        this.animationStage +=
          dTime * Math.min(10, 1000 / v2.dist(...this.animatedShot) * this.terrain.animationSpeed);
        if (this.animationStage > 1) {
          this.terrain.game.text(this.animatedShot[1], this.shotText);
          this.endAnimation();
        }
      }
    }
  }

  endAnimation() {
    this.animationStage = 0;
    delete this.animatedPath;
    delete this.animatedShot;
    if (this.terrain.game.blockingAnimationEnd) {
      this.terrain.game.blockingAnimationEnd();
      delete this.terrain.game.blockingAnimationEnd;
    }
  }

  screenPos() {
    if (this.animatedPath && this.animatedPath[Math.floor(this.animationStage)+1]) {
      return v2.lerp(
        this.terrain.cindToScreen(
          this.animatedPath[Math.floor(this.animationStage)]
        ),
        this.terrain.cindToScreen(
          this.animatedPath[Math.floor(this.animationStage)+1]
        ),
        this.animationStage - Math.floor(this.animationStage)
      );
    } else {
      return this.terrain.cindToScreen(this.cind);
    }
  }

  dist(other: Char | Cell) {
    return v2.dist(this.at, other.at);
  }

  info() {
    let name = [, "gunner", "assault", "sniper"][this.kind];
    return `${name.toUpperCase()} <b>${this.hp}HP</b> ${lang[name]}`;
  }
}
