import Terrain from "./Terrain";
import { Context2d, idiv, createCanvas, canvasCache, Canvas2d } from "./Util";
import Unit from "./Unit";
import Cell from "./Cell";
import MovingText from "./MovingText";
import Anim from "./Anim";

import * as v2 from "./v2";
import { V2 } from "./v2";
import Game from "./Game";
import Team from "./Team";

const renderPovs = true;
const renderThreats = false;
const dashInterval = 4;

class Doll {
  at: V2;
  constructor(public unit: Unit, renderer: RenderSchematic) {
    this.at = renderer.cidToPoint(unit.cid);
  }
}

export default class RenderSchematic {
  canvasCacheOutdated = false;
  canvasCache: Canvas2d;
  canvasTerrain: Canvas2d;

  width: number;
  height: number;

  anim: Anim[] = [];

  animQueue: Anim[] = [];

  dolls: Doll[] = [];

  tileSize = 32;

  screenPos = [0, 0] as V2;

  get canvas(){
    return this.game.canvas;
  }

  synch() {
    this.dolls = this.terrain.units.map(unit => new Doll(unit, this));
    this.updateCanvasCache();
  }

  get terrain() {
    return this.game.terrain;
  }

  constructor(public game: Game) {
    this.initSprites();
  }

  resize() {
    if(!this.canvas)
      return;

    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;

    if (this.terrain)
      this.screenPos = [
        0.5 * (this.width - this.terrain.w * this.tileSize),
        0.5 * (this.height - this.terrain.h * this.tileSize)
      ];

    this.canvas.getContext("2d").imageSmoothingEnabled = false;    

  }

  update(dTime: number) {
    let anims = this.anim;
    this.anim = [];

    anims = anims.filter(fx => {
      return fx.update(dTime);
    });

    this.anim = this.anim.concat(anims);

    if (this.animQueue.length > 0 && !this.animQueue[0].update(dTime))
      this.animQueue.shift();

    if (this.animQueue.length == 0 && this.blockingAnimationEnd) {
      this.blockingAnimationEnd();
      delete this.blockingAnimationEnd;
    }

    this.dolls = this.dolls.filter(d => d.unit.alive);
  }

  render(ctx: Context2d): boolean {
    if(!ctx)
      return;

    ctx.clearRect(0, 0, this.width, this.height);

    let t = this.terrain;

    ctx.save();

    ctx.translate(...this.screenPos);

    if (!this.canvasCache || this.canvasCacheOutdated) this.updateCanvasCache();
    ctx.clearRect(0, 0, t.w * this.tileSize, t.h * this.tileSize);

    ctx.drawImage(this.canvasCache, 0, 0);

    for (let d of this.dolls) {
      this.renderDoll(ctx, d);
    }

    for (let fx of this.anim) if (fx.render) fx.render(ctx);

    if (this.animQueue.length > 0 && this.animQueue[0].render)
      this.animQueue[0].render(ctx);

    if (!this.busy) this.renderPath(ctx, this.game.hovered);

    ctx.restore();

    return this.animQueue.length > 0;
  }

  renderPath(ctx: Context2d, cell: Cell) {
    let unit = this.game.chosen;

    if (
      !unit ||
      !cell ||
      !unit.dists ||
      !unit.dists[cell.cid] ||
      unit.dists[cell.cid][1] == -1
    )
      return;

    if (!unit.reachable(cell)) return;

    let end = this.cidToCenterPoint(cell.cid);

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
    ctx.moveTo(...this.cidToCenterPoint(path[0].cid));
    for (let i of path) ctx.lineTo(...this.cidToCenterPoint(i.cid));
    ctx.stroke();
  }

  renderThreats(ctx: Context2d, cell: Cell) {
    let t = this.terrain;
    let i = cell.cid;

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
    let at = this.cidToPoint(cell.cid);

    let sprite = [, this.lowTile, this.highTile][cell.obstacle];

    if (cell.hole) {
      sprite = this.waterTile;
    }

    if (sprite) ctx.drawImage(sprite, at[0], at[1]);

    if (cell.goody) {
      ctx.translate(...at);
      ctx.fillStyle = "#080";
      ctx.fillRect(this.tileSize * 0.35, 0, this.tileSize * 0.3, this.tileSize);
      ctx.fillRect(0, this.tileSize * 0.35, this.tileSize, this.tileSize * 0.3);
      ctx.translate(...v2.scale(at, -1));
    }
  }

  renderCellUI(ctx: Context2d, cell: Cell) {
    let at = this.cidToPoint(cell.cid);
    let g = this.game;


    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    if (g.hovered && !g.hovered.opaque) {
      let xfov = g.hovered.xfov.has(cell.cid);
      let dfov = g.hovered.rfov.has(cell.cid);
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

    if (
      renderPovs &&
      cell.povs &&
      cell.peeked.includes(this.game.hovered)
    ) {
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

    ctx.translate(...doll.at);

    this.useDollCache(ctx, doll);

    if (doll.unit == this.game.chosen) {
      this.outline(ctx, doll, Math.sin(new Date().getTime() / 100) + 1);
    } else if (doll.unit == this.game.hoveredChar) {
      this.outline(ctx, doll, 1.5);
    }
    ctx.restore();
  }

  outline(ctx: Context2d, doll: Doll, width = 2) {
    ctx.save();
    ctx.strokeStyle = doll.unit.strokeColor;
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
    let unit = doll.unit;
    let state = ["cid", "hp", "ap", "kind", "faction"].map(key => unit[key]);
    state.push(this.dollTint(doll));
    let key = state.join(",");
    if (!(key in this.dollCache))
      this.dollCache[key] = canvasCache([this.tileSize, this.tileSize], ctx =>
        this.renderDollBody(ctx, doll, this.dollTint(doll))
      );
    ctx.drawImage(this.dollCache[key], 0, 0);
  }

  dollTint(doll: Doll) {
    if (this.busy || this.terrain.aiTurn) return 0;
    let unit = doll.unit;
    let flankNum = 0;
    let hover = this.game.hovered;
    if (hover && !hover.opaque && hover.xfov) {
      let visible =
        hover.xfov.has(unit.cid) || unit.team == this.game.lastSelectedFaction;
      if (visible)
        flankNum =
          (this.terrain.cover(unit.cell, hover) == 0 ? 1 : 0) +
          (this.terrain.cover(hover, unit.cell) == 0 ? 2 : 0);
      else flankNum = 4;
    }
    if (!this.game.hovered) flankNum = 0;

    return flankNum;
  }

  renderDollBody(ctx: Context2d, doll: Doll, tint: number) {
    let unit = doll.unit;

    ctx.fillStyle = ["#fff", "#fba", "#cfa", "#ffa", "#ccc"][tint];
    ctx.strokeStyle = unit.strokeColor;

    ctx.shadowColor = "#444";
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(
      0.5 * this.tileSize,
      0.5 * this.tileSize,
      this.tileSize * 0.4,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowColor = `rgba(0,0,0,0)`;

    ctx.lineWidth = 2;
    for (let i = 0; i < unit.hp; i++) {
      let angle = Math.PI * (1 - i / (unit.maxHP - 1));
      let v = v2.fromAngle(angle);
      ctx.beginPath();
      ctx.moveTo(
        (0.5 + v[0] * 0.4) * this.tileSize,
        (0.5 + v[1] * 0.4) * this.tileSize
      );
      ctx.lineTo(
        (0.5 + v[0] * 0.5) * this.tileSize,
        (0.5 + v[1] * 0.5) * this.tileSize
      );
      ctx.stroke();
    }
    ctx.lineWidth = 1;

    ctx.fillStyle = unit.strokeColor;
    ctx.textAlign = "center";
    ctx.font = `bold ${this.tileSize / 2}pt Courier`;
    ctx.fillText(
      unit.symbol.toUpperCase(),
      0.5 * this.tileSize,
      0.66 * this.tileSize
    );
    ctx.stroke();

    if (unit.ap > 0) {
      ctx.fillStyle = doll.unit.strokeColor;
      ctx.beginPath();
      ctx.moveTo(1, 1);
      ctx.lineTo(6, 1);
      ctx.lineTo(1, 6);
      ctx.closePath();
      ctx.fill();
      if (unit.ap > 1) {
        ctx.beginPath();
        ctx.moveTo(this.tileSize - 1, 1);
        ctx.lineTo(this.tileSize - 6, 1);
        ctx.lineTo(+this.tileSize - 1, 6);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  cidToPoint(ind: number): V2 {
    return this.terrain.fromCid(ind).map(a => a * this.tileSize) as V2;
  }

  cidToCenterPoint(ind: number): V2 {
    return v2.scale(v2.sum(this.terrain.fromCid(ind), [0.5, 0.5]), this.tileSize);
  }

  cidToCenterScreen(ind: number): V2 {
    return v2.sum(this.cidToCenterPoint(ind), this.screenPos);
  }

  cidFromPoint(x: number, y: number) {        
    return this.terrain.safeCid(idiv(x, this.tileSize), idiv(y, this.tileSize));
  }

  cellAtScreenPos(x: number, y: number): Cell {
    return this.terrain.cells[      
      this.cidFromPoint(...v2.sub([x, y], this.screenPos))
    ];
  }

  get animationSpeed() {
    return this.terrain.aiTurn ? 0.5 : 0.5;
  }

  updateCanvasCache() {
    if (!this.canvasCache)
      this.canvasCache = createCanvas(
        this.terrain.w * this.tileSize,
        this.terrain.h * this.tileSize
      );

    if (!this.canvasTerrain)
      this.canvasTerrain = createCanvas(
        this.terrain.w * this.tileSize,
        this.terrain.h * this.tileSize
      );

    let tctx = this.canvasTerrain.getContext("2d");
    tctx.clearRect(
      0,
      0,
      this.terrain.w * this.tileSize,
      this.terrain.h * this.tileSize
    );
    for (let i = 0; i < this.terrain.cells.length; i++) {
      let cell = this.terrain.cells[i];
      this.renderCell(tctx, cell);
    }

    let ctx = this.canvasCache.getContext("2d");

    ctx.clearRect(
      0,
      0,
      this.terrain.w * this.tileSize,
      this.terrain.h * this.tileSize
    );

    ctx.save();
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowColor = "#444";
    ctx.drawImage(this.canvasTerrain, 0, 0);
    ctx.restore();

    for (let i = 0; i < this.terrain.cells.length; i++) {
      let cell = this.terrain.cells[i];
      this.renderCellUI(ctx, cell);
    }

    this.canvasCacheOutdated = false;
  }

  resetCanvasCache() {
    this.canvasCacheOutdated = true;
  }

  text(from: V2, text: string) {
    let at = v2.sum(from, [0, -10]);
    this.anim.push(new MovingText(text, "#f00", 3, at, [0, -10]));
  }

  renderBullet(ctx: Context2d, [from, to]: V2[], time: number) {
    ctx.beginPath();
    let delta = v2.norm(v2.sub(to, from), -20);
    let at = v2.lerp(from, to, time);
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

  shoot(from: number, to: number, dmg: number) {
    let tiles = [from, to].map(v => this.terrain.cells[v]);

    let points: [V2, V2];

    let a: Cell, b: Cell;

    completely: for (a of tiles[0].povs)
      for (b of tiles[1].povs) {
        if (a.rfov.has(b.cid)) {
          points = [a, b].map(v => this.cidToCenterPoint(v.cid)) as [V2, V2];
          break completely;
        }
      }

    let fdoll = this.dollAt(from);
    let tdoll = this.dollAt(to);

    let time = 0;
    if (a.cid == from && b.cid == to) {
      time = 1;
    }

    this.animQueue.push({
      update: dTime => {
        if (time < 1 || time > 2) {
          let peek = (time < 1 ? time : 3 - time) * 0.6;
          for (let i = 0; i < 2; i++) {
            let doll = [fdoll, tdoll][i];
            doll.at = v2.lerp(
              this.cidToPoint([from, to][i]),
              v2.sub(points[i], [this.tileSize / 2, this.tileSize / 2]),
              peek
            );
          }
          time += dTime * this.animationSpeed * 10;
        } else {
          time +=
            dTime *
            Math.min(10, (1000 / v2.dist(...points)) * this.animationSpeed);
        }

        if (time > 3) {
          this.text(points[1], dmg > 0 ? `-${dmg}` : "MISS");
          fdoll.at = this.cidToPoint(fdoll.unit.cid);
          tdoll.at = this.cidToPoint(tdoll.unit.cid);
          return false;
        }
        return true;
      },
      render: (ctx: Context2d) => {
        if (time > 1 && time < 2) this.renderBullet(ctx, points, time - 1);
      }
    });
  }

  walk(doll: Doll, steps: Cell[]) {
    let path = steps.map(v => this.cidToPoint(v.cid)) as [V2, V2];
    let time = 0;
    this.animQueue.push({
      update: dTime => {
        time += dTime * 15 * this.animationSpeed;

        if (!path[Math.floor(time) + 1]) {
          doll.at = path[path.length - 1];
          return false;
        }

        doll.at = v2.lerp(
          path[Math.floor(time)],
          path[Math.floor(time) + 1],
          time - Math.floor(time)
        );
        return true;
      }
    });
  }

  dollOf(unit: Unit) {
    return this.dolls.find(d => d.unit == unit);
  }

  dollAt(cid: number) {
    return this.dolls.find(d => d.unit.cid == cid);
  }

  async draw(o: any) {
    switch (o.anim) {
      case "walk":
        this.walk(this.dollOf(o.char), o.path);
        break;
      case "shoot":
        this.shoot(o.from, o.to, o.damage);
        break;
    }
    await this.waitForAnim();
  }

  blockingAnimationEnd: Function;

  waitForAnim() {
    return new Promise<void>(resolve => {
      this.blockingAnimationEnd = () => resolve();
    });
  }

  get busy() {
    return this.animQueue.length > 0;
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
