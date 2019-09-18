import Terrain from "./Terrain";
import { Context2d, idiv, createCanvas, canvasCache } from "./Util";
import { tileSize } from "./settings";
import Unit from "./Unit";
import Cell from "./Cell";
import MovingText from "./MovingText";
import Anim from "./Anim";

import * as v2 from "./v2";
import { V2 } from "./v2";
import Game from "./Game";
import Team from "./Team";
import { verify } from "crypto";

const renderPovs = true;
const renderThreats = false;
const dashInterval = 4;

class Doll {
  at: V2;
  constructor(public unit: Unit, renderer: RenderSchematic) {
    this.at = renderer.cidToScreen(unit.cid);
  }
}

export default class RenderSchematic {
  canvasCacheOutdated = false;
  canvasCache: HTMLCanvasElement;

  width: number;
  height: number;

  anim: Anim[] = [];

  animQueue: Anim[] = [];

  dolls: Doll[] = [];

  static readonly ap1Sprite = canvasCache([tileSize, tileSize], ctx => {
    ctx.strokeStyle = "#555";
    ctx.strokeRect(4.5, 4.5, tileSize - 8, tileSize - 8);
  });

  static readonly ap2Sprite = canvasCache([tileSize, tileSize], ctx => {
    ctx.strokeStyle = "#bbb";
    ctx.strokeRect(4.5, 4.5, tileSize - 8, tileSize - 8);
  });

  static readonly hiddenSprite = canvasCache([tileSize, tileSize], ctx => {
    ctx.fillStyle = `rgba(0,0,0,0.12)`;
    ctx.fillRect(0, 0, tileSize, tileSize);
  });

  static readonly dashPattern = canvasCache(
    [dashInterval, dashInterval],
    ctx => {
      for (let i = 0; i < dashInterval; i++) {
        ctx.fillRect(i, i, 1, 1);
      }
    }
  );

  static readonly crossPattern = canvasCache([3, 3], ctx => {
    for (let i = 0; i < dashInterval; i++) {
      ctx.fillRect(dashInterval - i - 1, i, 1, 1);
      ctx.fillRect(i, i, 1, 1);
    }
  });

  static readonly highTile = canvasCache([tileSize, tileSize], ctx => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, tileSize, tileSize);
  });

  static readonly lowTile = canvasCache([tileSize, tileSize], ctx => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, tileSize, tileSize);
    ctx.fillStyle = ctx.createPattern(RenderSchematic.dashPattern, "repeat");
    ctx.fillRect(0, 0, tileSize, tileSize);
  });

  static readonly emptyTile = canvasCache([1, 1], ctx => {});

  synch() {
    this.dolls = this.terrain.units.map(unit => new Doll(unit, this));
  }

  get terrain() {
    return this.game.terrain;
  }

  constructor(public game: Game, public canvas: HTMLCanvasElement) {
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    this.canvas.height = this.height;
    this.canvas.width = this.width;

    this.synch();
    this.updateCanvasCache();
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
    ctx.clearRect(0, 0, this.width, this.height);

    let t = this.terrain;

    if (!this.canvasCache || this.canvasCacheOutdated) this.updateCanvasCache();
    ctx.clearRect(0, 0, t.w * tileSize, t.h * tileSize);

    ctx.drawImage(this.canvasCache, 0, 0);

    for (let d of this.dolls) {
      this.renderDoll(ctx, d);
    }

    for (let fx of this.anim) if (fx.render) fx.render(ctx);

    if (this.animQueue.length > 0 && this.animQueue[0].render)
      this.animQueue[0].render(ctx);

    if(!this.busy)
      this.renderPath(ctx, this.game.hoveredCell);

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

    let end = this.cidToCenter(cell.cid);

    ctx.beginPath();
    if (unit.reachable(cell))
      ctx.arc(end[0], end[1], tileSize / 4, 0, Math.PI * 2);
    else {
      ctx.moveTo(end[0] - tileSize / 4, end[1] - tileSize / 4);
      ctx.lineTo(end[0] + tileSize / 4, end[1] + tileSize / 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(end[0] - tileSize / 4, end[1] + tileSize / 4);
      ctx.lineTo(end[0] + tileSize / 4, end[1] - tileSize / 4);
    }
    ctx.stroke();

    let path = unit.pathTo(cell);

    ctx.beginPath();
    ctx.moveTo(...this.cidToCenter(path[0].cid));
    for (let i of path) ctx.lineTo(...this.cidToCenter(i.cid));
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
    let g = this.game;
    let at = this.cidToScreen(cell.cid);

    let sprite = [, RenderSchematic.lowTile, RenderSchematic.highTile][
      cell.obstacle
    ];

    ctx.save();

    ctx.shadowColor = `rgba(0,0,0,0)`;

    if (renderThreats) this.renderThreats(ctx, cell);

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    if (g.hoveredCell) {
      let xfov = g.hoveredCell.xfov.has(cell.cid)
      let dfov = g.hoveredCell.dfov.has(cell.cid)
      if(!dfov){
        ctx.fillStyle = `rgba(${xfov?"50,50,0,0.04":"0,0,50,0.1"})`;
        ctx.fillRect(at[0], at[1], tileSize, tileSize);
      }
    }

    if (g.chosen && g.chosen.dists && !this.busy) {
      let moves = g.chosen.apCost(cell);
      if (moves > 0 && moves <= g.chosen.ap) {
        let img = [, RenderSchematic.ap1Sprite, RenderSchematic.ap2Sprite][
          Math.floor(moves)
        ];
        if (img) ctx.drawImage(img, at[0], at[1]);
      }
    }

    if (
      renderPovs &&
      cell.povs &&
      cell.peeked.includes(this.game.hoveredCell)
    ) {
      ctx.strokeStyle = `rgba(0,0,0,0.5)`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(at[0] + tileSize / 2, at[1] + tileSize / 2, tileSize / 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    if (cell.goody) {
      ctx.translate(...at)
      ctx.fillStyle = "#080";
      ctx.fillRect(tileSize * 0.35, 0, tileSize * 0.3, tileSize);
      ctx.fillRect(0, tileSize * 0.35, tileSize, tileSize * 0.3);
      ctx.translate(...v2.scale(at, -1))
    }

    if (sprite) ctx.drawImage(sprite, at[0], at[1]);
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
    ctx.shadowColor = `rgba(0,0,0,0)`;
    //console.assert(tile.unit.blue)
    ctx.strokeStyle = doll.unit.strokeColor;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(tileSize / 2, tileSize / 2, tileSize * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  dollCache: { [key: string]: HTMLCanvasElement } = {};

  useDollCache(ctx: Context2d, doll: Doll) {
    let unit = doll.unit;
    let state = ["cid", "hp", "ap", "kind", "faction"].map(key => unit[key]);
    state.push(this.dollTint(doll));
    let key = state.join(",");
    if (!(key in this.dollCache))
      this.dollCache[key] = canvasCache([tileSize, tileSize], ctx =>
        this.renderDollBody(ctx, doll, this.dollTint(doll))
      );
    ctx.drawImage(this.dollCache[key], 0, 0);
  }

  dollTint(doll: Doll) {
    if(this.busy || this.terrain.aiTurn)
      return 0;
    let unit = doll.unit;
    let flankNum = 0;
    let hover = this.game.hoveredCell;
    if (hover && hover.xfov) {
      let visible =
        hover.xfov.has(unit.cid) || unit.team == this.game.lastSelectedFaction;
      if (visible)
        flankNum =
          (this.terrain.cover(unit.cell, hover) == 0 ? 1 : 0) +
          (this.terrain.cover(hover, unit.cell) == 0 ? 2 : 0);
      else flankNum = 4;
    }
    if (!this.game.hoveredCell) flankNum = 0;

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
    ctx.arc(0.5 * tileSize, 0.5 * tileSize, tileSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = `rgba(0,0,0,0)`;

    ctx.lineWidth = 2;
    for (let i = 0; i < unit.hp; i++) {
      let angle = Math.PI * (1 - i / (unit.maxHP - 1));
      let v = v2.fromAngle(angle);
      ctx.beginPath();
      ctx.moveTo((0.5 + v[0] * 0.4) * tileSize, (0.5 + v[1] * 0.4) * tileSize);
      ctx.lineTo((0.5 + v[0] * 0.5) * tileSize, (0.5 + v[1] * 0.5) * tileSize);
      ctx.stroke();
    }
    ctx.lineWidth = 1;

    ctx.fillStyle = unit.strokeColor;
    ctx.textAlign = "center";
    ctx.font = `bold ${tileSize / 2}pt Courier`;
    ctx.fillText(
      Unit.letters[unit.kind].toUpperCase(),
      0.5 * tileSize,
      0.66 * tileSize
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
        ctx.moveTo(tileSize - 1, 1);
        ctx.lineTo(tileSize - 6, 1);
        ctx.lineTo(+tileSize - 1, 6);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  cidToScreen(ind: number): V2 {
    return this.terrain.fromCid(ind).map(a => a * tileSize) as V2;
  }

  cidToCenter(ind: number): V2 {
    return this.terrain.fromCid(ind).map(a => (a + 0.5) * tileSize) as V2;
  }

  cidScreen(x: number, y: number) {
    return this.terrain.cid(idiv(x, tileSize), idiv(y, tileSize));
  }

  cellAtScreen(x: number, y: number): Cell {
    return this.terrain.cells[this.cidScreen(x, y)];
  }

  get animationSpeed() {
    return this.terrain.aiTurn ? 0.5 : 0.5;
  }

  updateCanvasCache() {
    if (!this.canvasCache)
      this.canvasCache = createCanvas(
        this.terrain.w * tileSize,
        this.terrain.h * tileSize
      );

    let ctx = this.canvasCache.getContext("2d");

    ctx.save();
    ctx.clearRect(0, 0, this.terrain.w * tileSize, this.terrain.h * tileSize);

    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowColor = "#444";

    for (let i = 0; i < this.terrain.cells.length; i++) {
      let cell = this.terrain.cells[i];
      ctx.save();
      this.renderCell(ctx, cell);
    }

    ctx.restore();

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
        if (a.dfov.has(b.cid)) {
          points = [a, b].map(v => this.cidToCenter(v.cid)) as [V2, V2];
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
          for(let i=0;i<2;i++){
            let doll = [fdoll,tdoll][i]
            doll.at = v2.lerp(
              this.cidToScreen([from,to][i]),
              v2.sub(points[i], [tileSize / 2, tileSize / 2]),
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
          fdoll.at = this.cidToScreen(fdoll.unit.cid);
          tdoll.at = this.cidToScreen(tdoll.unit.cid);
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
    let path = steps.map(v => this.cidToScreen(v.cid)) as [V2, V2];
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

  get busy(){
    return this.animQueue.length > 0;
  }

}
