import Board from "./Board";
import { Context2d, idiv, createCanvas, canvasCache, Canvas2d, runPromisesInOrder, shallowCopy } from "./Util";
import Unit from "./Unit";
import Cell from "./Cell";
import MovingText from "./MovingText";
import Animation from "./Animation";

import * as v2 from "./v2";
import { V2 } from "./v2";
import Game from "./Game";
import Team from "./Team";
import { insideBorder } from "./settings";
import { Action, ShootAction, StateAction, WalkAction } from "./Action";
import { Doll } from "./Doll";

const renderPovs = true;
const renderThreats = false;
const dashInterval = 4;

const lookAtDisabled = true;

export default class RenderSchematic {
  canvasCacheOutdated = false;
  canvasCache: Canvas2d;
  canvasBoard: Canvas2d;

  width: number;
  height: number;

  animations: Animation[] = [];

  dolls: Doll[] = [];

  tileSize = 32;

  screenPos = [0, 0] as V2;

  lookingAt: V2;

  get canvas() {
    return this.game.canvas;
  }

  synch() {
    this.dolls = this.board.units.map(unit => new Doll(unit));
    this.updateCanvasCache();
  }

  get board() {
    return this.game.board;
  }

  constructor(public game: Game) {
    this.initSprites();
    //this.text([1000, 100], "test");
  }

  resize() {
    if (!this.canvas) return;

    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;

    if (this.board)
      this.screenPos = [
        0.5 * (this.width - this.board.w * this.tileSize),
        0.5 * (this.height - this.board.h * this.tileSize)
      ];

    this.canvas.getContext("2d").imageSmoothingEnabled = false;
  }

  update(dTime: number) {
    let d = this.lookingAt ? v2.dist(this.lookingAt, this.screenPos) : 0;
    if (this.lookingAt && d > 20) {
      this.screenPos = v2.lerp(
        this.screenPos,
        this.lookingAt,
        Math.min(1, dTime * Math.max(d / 50, 10) * this.animationSpeed)
      );
    } else {
      delete this.lookingAt;

      if (this.animations.length > 0) {
        //console.log(this.animations.length);
        for (let animation of [...this.animations]) {
          let complete = animation.update(dTime);
          if (complete) {
            console.log("end of animation", animation);
            animation.onComplete();
            this.animations.splice(this.animations.indexOf(animation), 1);
          }
        }
      }

    }

    this.dolls = this.dolls.filter(d => d.alive);
  }

  render(ctx: Context2d): boolean {
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);

    let t = this.board;

    ctx.save();

    ctx.translate(...this.screenPos);

    if (!this.canvasCache || this.canvasCacheOutdated) this.updateCanvasCache();
    ctx.clearRect(0, 0, t.w * this.tileSize, t.h * this.tileSize);

    ctx.drawImage(this.canvasCache, 0, 0);

    for (let d of this.dolls) {
      this.renderDoll(ctx, d);
    }

    for (let animation of this.animations) {
      animation.render && animation.render(ctx);
    }

    if (!this.busy) this.renderPath(ctx, this.game.hovered);

    ctx.restore();
  }

  renderPath(ctx: Context2d, cell: Cell) {
    let unit = this.game.chosen;

    if (
      !unit ||
      !cell ||
      !unit.dists ||
      !unit.dists[cell.id] ||
      unit.dists[cell.id][1] == -1
    )
      return;

    if (!unit.reachable(cell)) return;

    let end = this.cellIdToCenterPoint(cell.id);

    ctx.beginPath();
    if (unit.reachable(cell))
      ctx.arc(end[0], end[1], this.tileSize / 4, 0, Math.PI * 2);
    else {
      ctx.moveTo(end[0] - this.tileSize / 4, end[1] - this.tileSize / 4);
      ctx.lineTo(end[0] + this.tileSize / 4, end[1] + this.tileSize / 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(end[0] - this.tileSize / 4, end[1] + this.tileSize / 4);
      ctx.lineTo(end[0] + this.tileSize / 4, end[1] - this.tileSize / 4);
    }
    ctx.stroke();

    let path = unit.pathTo(cell);

    ctx.beginPath();
    ctx.moveTo(...this.cellIdToCenterPoint(path[0].id));
    for (let i of path) ctx.lineTo(...this.cellIdToCenterPoint(i.id));
    ctx.stroke();
  }

  renderThreats(ctx: Context2d, cell: Cell) {
    let t = this.board;
    let i = cell.id;

    if (!t.teams[Team.RED].strength) return;

    ctx.strokeStyle = "#800";
    ctx.lineWidth = t.teams[Team.RED].strength[i] == 4 ? 3 : 1;
    ctx.beginPath();
    ctx.moveTo(3.5, 3.5);
    ctx.lineTo(3.5, 3.5 + 3 * t.teams[Team.RED].strength[i]);
    ctx.stroke();

    ctx.strokeStyle = "#008";
    ctx.lineWidth = t.teams[Team.RED].weakness[i] == 4 ? 3 : 1;
    ctx.beginPath();
    ctx.moveTo(3.5, 3.5);
    ctx.lineTo(3.5 + 3 * t.teams[Team.RED].weakness[i], 3.5);
    ctx.stroke();
  }

  renderCell(ctx: Context2d, cell: Cell) {
    let at = this.cellIdToPoint(cell.id);

    let sprite = [, this.lowTile, this.highTile][cell.obstacle];

    if (cell.hole) {
      sprite = this.waterTile;
    }

    if (sprite) ctx.drawImage(sprite, at[0], at[1]);

    if (cell.items.length > 0) {
      ctx.translate(...at);
      ctx.fillStyle = "#080";
      ctx.fillRect(this.tileSize * 0.35, 0, this.tileSize * 0.3, this.tileSize);
      ctx.fillRect(0, this.tileSize * 0.35, this.tileSize, this.tileSize * 0.3);
      ctx.translate(...v2.scale(at, -1));
    }
  }

  renderCellUI(ctx: Context2d, cell: Cell) {
    let at = this.cellIdToPoint(cell.id);
    let g = this.game;

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    if (g.hovered && !g.hovered.opaque) {
      let xfov = g.hovered.xfov.has(cell.id);
      let dfov = g.hovered.rfov.has(cell.id);
      if (!dfov) {
        ctx.fillStyle = `rgba(${xfov ? "50,50,0,0.04" : "0,0,50,0.1"})`;
        ctx.fillRect(at[0], at[1], this.tileSize, this.tileSize);
      }

      if (renderThreats) this.renderThreats(ctx, cell);
    }

    if (g.chosen && g.chosen.dists && !this.busy) {
      let moves = g.chosen.apCost(cell);
      if (moves > 0 && moves <= g.chosen.ap) {
        let img = [, this.ap1Sprite, this.ap2Sprite][Math.floor(moves)];
        if (img) ctx.drawImage(img, at[0], at[1]);
      }
    }

    if (renderPovs && cell.povs && cell.peeked.includes(this.game.hovered)) {
      ctx.strokeStyle = `rgba(0,0,0,0.5)`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(
        at[0] + this.tileSize / 2,
        at[1] + this.tileSize / 2,
        this.tileSize / 4,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }

  renderDoll(ctx: Context2d, doll: Doll) {
    ctx.save();

    ctx.translate(...v2.scale(doll.at, this.tileSize));

    this.useDollCache(ctx, doll);

    if (doll.of(this.game.chosen)) {
      this.outline(ctx, doll, Math.sin(new Date().getTime() / 100) + 1);
    } else if (doll.of(this.game.hoveredUnit)) {
      this.outline(ctx, doll, 1.5);
    }
    ctx.restore();
  }

  outline(ctx: Context2d, doll: Doll, width = 2) {
    ctx.save();
    ctx.strokeStyle = doll.strokeColor;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(
      this.tileSize / 2,
      this.tileSize / 2,
      this.tileSize * 0.4,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.restore();
  }

  dollCache: { [key: string]: Canvas2d } = {};

  useDollCache(ctx: Context2d, doll: Doll) {
    let state = shallowCopy(doll.state);
    delete state.cid;
    state.tint = this.dollTint(doll);
    let key = JSON.stringify(state);
    if (!(key in this.dollCache))
      this.dollCache[key] = canvasCache(
        [this.tileSize * 2, this.tileSize * 2],
        ctx => this.renderDollBody(ctx, doll, this.dollTint(doll))
      );
    ctx.drawImage(
      this.dollCache[key],
      -0.5 * this.tileSize,
      -0.5 * this.tileSize
    );
  }

  dollTint(doll: Doll) {
    let state = doll.state;
    if (this.busy || this.board.aiTurn) return 0;
    let flankNum = 0;
    let hover = this.game.hovered;
    if (hover && !hover.opaque && hover.xfov) {
      let visible =
        hover.xfov.has(state.cid) || state.faction == this.game.lastSelectedTeam?.faction;
      if (visible)
        flankNum =
          (this.board.cover(this.board.cells[state.cid], hover) == 0 ? 1 : 0) +
          (this.board.cover(hover, this.board.cells[state.cid]) == 0 ? 2 : 0);
      else flankNum = 4;
    }
    if (!this.game.hovered) flankNum = 0;

    return flankNum;
  }

  renderDollBody(ctx: Context2d, doll: Doll, tint: number) {
    let state = doll.state;

    ctx.fillStyle = ["#fff", "#fba", "#cfa", "#ffa", "#ccc"][tint];
    ctx.strokeStyle = doll.strokeColor;

    ctx.scale(this.tileSize, this.tileSize);
    ctx.translate(0.5, 0.5);

    ctx.shadowColor = "#444";
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(0.5, 0.5, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = `rgba(0,0,0,0)`;

    /*ctx.lineWidth = 0.05;
    
    for (let i = 0; i < unit.hp; i++) {
      let angle = Math.PI * (1 - i / (unit.maxHP - 1));
      let v = v2.fromAngle(angle);
      ctx.beginPath();
      ctx.moveTo(
        (0.5 + v[0] * 0.3),
        (0.5 + v[1] * 0.3)
      );
      ctx.lineTo(
        (0.5 + v[0] * 0.4),
        (0.5 + v[1] * 0.4)
      );
      ctx.stroke();
    }*/

    ctx.lineWidth = 0.1;

    if (state.ap > 0) {
      ctx.fillStyle = doll.strokeColor;
      ctx.beginPath();
      ctx.arc(0.2, 0.4, 0.07, 0, Math.PI * 2);
      ctx.fill();
      if (state.ap > 1) {
        ctx.beginPath();
        ctx.arc(0.8, 0.4, 0.07, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = doll.strokeColor;
    ctx.font = `bold 0.5pt Courier`;
    ctx.fillText(state.symbol.toUpperCase(), 0.29, 0.66);
    ctx.stroke();
    ctx.restore();

    if (doll.focused) {
      ctx.save();
      ctx.translate(0.5, 0.5);
      let angle = Math.atan2(state.focus[1], state.focus[0]);
      ctx.rotate(angle);
      ctx.lineWidth = 0.003 * v2.length(state.focus);
      ctx.beginPath();
      ctx.moveTo(0.45, -0.15);
      ctx.lineTo(0.6, 0);
      ctx.lineTo(0.45, 0.15);
      ctx.stroke();
      ctx.restore();
    }

    if (doll.moving) {
      ctx.save();
      ctx.translate(0.5, 0.5);
      let angle = Math.atan2(state.velocity[1], state.velocity[0]);
      ctx.rotate(angle);
      ctx.lineWidth = 0.01 + 0.01 * v2.length(state.velocity);
      ctx.beginPath();
      ctx.moveTo(-0.6, -0.15);
      ctx.lineTo(-0.45, 0);
      ctx.lineTo(-0.6, 0.15);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.lineWidth = 0.05;
    ctx.transform(-1, 0, 0, 1, 1, 0);
    ctx.setLineDash([6 / state.maxHP - 0.05, 0.05]);
    ctx.beginPath();
    ctx.arc(0.5, 0.5, 0.35, 0, (Math.PI * state.hp) / state.maxHP);
    ctx.stroke();
    ctx.restore();
  }

  cellIdToPoint(ind: number): V2 {
    return this.board.cellIdToV2(ind).map(a => a * this.tileSize) as V2;
  }

  cellIdToCenterPoint(ind: number): V2 {
    return v2.scale(
      v2.sum(this.board.cellIdToV2(ind), [0.5, 0.5]),
      this.tileSize
    );
  }

  cidToCenterScreen(ind: number): V2 {
    return v2.sum(this.cellIdToCenterPoint(ind), this.screenPos);
  }

  cidFromPoint(x: number, y: number) {
    return this.board.safeCid(idiv(x, this.tileSize), idiv(y, this.tileSize));
  }

  cellAtScreenPos(x: number, y: number): Cell {
    return this.board.cells[
      this.cidFromPoint(...v2.sub([x, y], this.screenPos))
    ];
  }

  get animationSpeed() {
    return 0.5;
    //return this.board.aiTurn ? 0.5 : 0.5;
  }

  updateCanvasCache() {
    let boardScreenSize = [this.board.w * this.tileSize, this.board.h * this.tileSize] as [number, number];
    if (!this.canvasCache)
      this.canvasCache = createCanvas(...boardScreenSize);

    if (!this.canvasBoard)
      this.canvasBoard = createCanvas(...boardScreenSize);

    let tctx = this.canvasBoard.getContext("2d");
    tctx.clearRect(0, 0, ...boardScreenSize);
    for (let i = 0; i < this.board.cells.length; i++) {
      let cell = this.board.cells[i];
      this.renderCell(tctx, cell);
    }

    let ctx = this.canvasCache.getContext("2d");

    ctx.clearRect(0, 0, ...boardScreenSize);

    ctx.save();
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowColor = "#444";
    ctx.drawImage(this.canvasBoard, 0, 0);
    ctx.restore();

    for (let i = 0; i < this.board.cells.length; i++) {
      let cell = this.board.cells[i];
      this.renderCellUI(ctx, cell);
    }

    this.canvasCacheOutdated = false;
  }

  resetCanvasCache() {
    this.canvasCacheOutdated = true;
  }

  async text(from: V2, text: string) {
    let at = v2.sum(from, [0, -10]);
    await this.addAnimation(new MovingText(text, "#f00", 3, at, [0, -10]));
  }

  renderBullet(ctx: Context2d, [from, to]: V2[], time: number) {
    ctx.beginPath();
    let delta = v2.norm(v2.sub(to, from), -20);
    let at = v2.lerp(from, to, time);
    this.lookAt(at);
    let tail = v2.sum(at, delta);
    var grad = ctx.createLinearGradient(tail[0], tail[1], at[0], at[1]);
    grad.addColorStop(0, `rgba(0,0,0,0)`);
    grad.addColorStop(1, `rgba(0,0,0,1)`);

    ctx.lineWidth = 4;
    ctx.strokeStyle = grad;

    ctx.moveTo(...tail);
    ctx.lineTo(...at);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000";
  }

  insideScreen(at: V2) {
    at = v2.sum(at, this.screenPos);
    return (
      at[0] >= insideBorder &&
      at[1] >= insideBorder &&
      at[0] <= this.width - insideBorder &&
      at[1] <= this.height - insideBorder
    );
  }

  lookAtCid(cid: number) {
    this.lookAt(this.cellIdToCenterPoint(cid));
  }

  lookAt(at: V2) {
    if (lookAtDisabled)
      return;
    let newLookingA: V2 = [-at[0] + this.width / 2, -at[1] + this.height / 2];
    if (v2.dist(this.screenPos, newLookingA) <= 20) {
      this.screenPos = newLookingA;
    }
    if (!this.insideScreen(at)) this.lookingAt = newLookingA;
  }

  dollOf(unit: Unit) {
    return this.dolls.find(d => d.of(unit));
  }

  dollAt(cell: Cell) {
    return this.dolls.find(d => this.board.cellAt(...d.at) == cell);
  }

  async animateSequence(actions: Action[]) {
    if (actions)
      await runPromisesInOrder(actions.map(action => () => this.animate(action)));
  }

  async animate(action: Action) {
    if (!action)
      return;
    let animation: Animation;
    //console.trace(action, Date.now());
    switch (action.action) {
      case "state":
        let sta = action as StateAction;
        let state = sta.unit.serialize();
        animation = {
          update: () => {
            this.dollOf(sta.unit).updateState(state);
            return true;
          }
        };
        break;
      case "walk":
        let wa = action as WalkAction;
        animation = new WalkAnimation(this, wa);
        break;
      case "shoot":
        animation = new ShootAnimation(this, action as ShootAction);
        break;
    }
    if (animation)
      await this.addAnimation(animation);
  }

  addAnimation(animation: Animation) {
    return new Promise<void>(onComplete => {
      animation.onComplete = onComplete;
      this.animations.push(animation);
      //console.log("added animation", animation, this.animations.length);
    })
  }

  get busy() {
    return false;
    //return this.animations.length > 0;
  }

  ap1Sprite: Canvas2d;
  ap2Sprite: Canvas2d;
  hiddenSprite: Canvas2d;
  dashPattern: Canvas2d;
  wavePattern: Canvas2d;
  crossPattern: Canvas2d;
  highTile: Canvas2d;
  lowTile: Canvas2d;
  waterTile: Canvas2d;

  initSprites() {
    this.ap1Sprite = canvasCache([this.tileSize, this.tileSize], ctx => {
      ctx.strokeStyle = "#555";
      ctx.strokeRect(4.5, 4.5, this.tileSize - 8, this.tileSize - 8);
    });

    this.ap2Sprite = canvasCache([this.tileSize, this.tileSize], ctx => {
      ctx.strokeStyle = "#bbb";
      ctx.strokeRect(4.5, 4.5, this.tileSize - 8, this.tileSize - 8);
    });

    this.hiddenSprite = canvasCache([this.tileSize, this.tileSize], ctx => {
      ctx.fillStyle = `rgba(0,0,0,0.12)`;
      ctx.fillRect(0, 0, this.tileSize, this.tileSize);
    });

    this.dashPattern = canvasCache([dashInterval, dashInterval], ctx => {
      for (let i = 0; i < dashInterval; i++) {
        ctx.fillRect(i, i, 1, 1);
      }
    });

    this.wavePattern = canvasCache([8, 8], ctx => {
      ctx.beginPath();
      ctx.arc(4.5, 2, 5, 0, Math.PI);
      ctx.stroke();
    });

    this.crossPattern = canvasCache([3, 3], ctx => {
      for (let i = 0; i < dashInterval; i++) {
        ctx.fillRect(dashInterval - i - 1, i, 1, 1);
        ctx.fillRect(i, i, 1, 1);
      }
    });

    this.highTile = canvasCache([this.tileSize, this.tileSize], ctx => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, this.tileSize, this.tileSize);
    });

    this.lowTile = canvasCache([this.tileSize, this.tileSize], ctx => {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, this.tileSize, this.tileSize);
      ctx.fillStyle = ctx.createPattern(this.dashPattern, "repeat");
      ctx.fillRect(0, 0, this.tileSize, this.tileSize);
    });

    this.waterTile = canvasCache([this.tileSize, this.tileSize], ctx => {
      ctx.fillStyle = ctx.createPattern(this.wavePattern, "repeat");
      ctx.fillRect(0, 0, this.tileSize, this.tileSize);
    });
  }
}

class WalkAnimation {
  path: V2[];
  time: number;
  doll: Doll;
  constructor(public renderer: RenderSchematic, public action: WalkAction) {
    this.doll = renderer.dollOf(action.unit);
    this.path = action.path.map(v => v.at);
    this.time = 0;
  }

  update(dTime: number) {
    this.time += dTime * 15 * this.renderer.animationSpeed;
    let step = Math.floor(this.time);

    if (!this.path[step + 1]) {
      this.doll.at = this.path[this.path.length - 1];
      return true;
    }

    this.doll.at = v2.lerp(
      this.path[step],
      this.path[step + 1],
      this.time - step
    );

    this.renderer.lookAt(this.doll.at);

    return false;
  }
}

/** Shot animation. dmg=null for misses, 0 for fully absorbed hit */
class ShootAnimation {
  /** Animation stage. 0-1: stepping out, 1-2: shoot itself. 2-3: returning. If no stepping out then skips right to 1 */
  time = 0;
  bulletFlightDuration: number;
  animationEndsAt: number;
  impactSfxCreated: boolean;
  tileSize: number;
  fdoll: Doll;
  tdoll: Doll;
  muzzlePoint: v2.V2;
  targetPoint: v2.V2;
  finalPoint: V2;

  constructor(public renderer: RenderSchematic, public action: ShootAction) {

    let { from, to, damage, shooter, victim, direct } = action;

    this.fdoll = renderer.dollOf(shooter);
    this.tdoll = renderer.dollOf(victim);

    this.muzzlePoint = [...this.fdoll.at] as V2;
    this.targetPoint = [...this.tdoll.at] as V2;

    this.tdoll.state.hp -= action.damage;

    let noStepOut = false;

    completely: for (let a of from.povs)
      for (let b of direct ? [to] : to.povs) {
        if (a.rfov.has(b.id)) {
          [this.muzzlePoint, this.targetPoint] = [a, b].map(v => renderer.cellIdToCenterPoint(v.id)) as [V2, V2];
          if (a == from && b == to) {
            noStepOut = true;
            this.time = 1;
          }
          break completely;
        }
      }

    if (damage) {
      this.finalPoint = this.targetPoint;
    } else {
      let dir = v2.norm(v2.sub(this.targetPoint, this.muzzlePoint));
      this.finalPoint = v2.sum(
        v2.sum(this.targetPoint, v2.rot(dir)),
        dir,
        10 * renderer.tileSize
      );
    }

    this.bulletFlightDuration = Math.min(1, v2.dist(this.muzzlePoint, this.finalPoint) / 100);
    this.animationEndsAt = 1 + Math.max(this.bulletFlightDuration, noStepOut ? 0 : 1);
    this.impactSfxCreated = false;
  }

  update(dTime) {
    this.time += dTime * this.renderer.animationSpeed * 10;
    if (this.time < 1) {
      // Stepping out animation. For direct shots - only for shooter
      let peekDistance = Math.max(0, (this.time < 1 ? this.time : 2 - this.time) * 0.6);
      for (let i = 0; i < (this.action.direct ? 1 : 2); i++) {
        let doll = [this.fdoll, this.tdoll][i];
        doll.at = v2.lerp(
          this.renderer.cellIdToPoint([this.action.from, this.action.to][i].id),
          v2.sub([this.muzzlePoint, this.targetPoint][i], [this.tileSize / 2, this.tileSize / 2]),
          peekDistance
        );
      }
    }
    if (this.time >= 1 && !this.impactSfxCreated) {
      this.renderer.text(this.targetPoint, this.action.damage != null ? `-${this.action.damage}` : "MISS");
      this.impactSfxCreated = true;
    }

    if (this.time >= this.animationEndsAt) {
      this.fdoll.at = this.renderer.cellIdToPoint(this.fdoll.state.cid);
      if (!this.action.direct) {
        this.tdoll.at = this.renderer.cellIdToPoint(this.tdoll.state.cid);
      }
      return true;
    }
    return false;
  }

  render(ctx: Context2d) {
    if (this.time > 1 && this.time < 2)
      this.renderer.renderBullet(ctx, [this.muzzlePoint, this.finalPoint], this.time - 1);
  }
}
