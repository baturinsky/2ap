import * as v2 from "./v2";
import Terrain from "./Terrain";
import { V2 } from "./v2";
import Unit from "./Unit";
import RenderSchematic from "./RenderSchematic";
import Team from "./Team";
import Cell from "./Cell";
import { defaultCampaign } from "./Campaigns";

export default class Game {
  ctx: CanvasRenderingContext2D;
  lastLoopTimeStamp: number;
  time: number = 0;
  terrain: Terrain;
  tooltip: HTMLElement;
  info: HTMLElement;

  //eye: Char;
  lastSelectedFaction: Team;
  chosen: Unit;
  hovered: Cell;

  aiTurn: boolean;

  static readonly PAI = 0;
  static readonly PP = 1;
  static readonly AIAI = 2;

  mode = Game.PAI;

  renderer: RenderSchematic;

  campaign: any;
  customCampaign:boolean;

  init(save?: any) {
    let campaign: any;

    delete this.chosen;
    delete this.hovered;
    delete this.lastSelectedFaction;

    if(save){
      if(typeof save == "string")
        save = JSON.parse(save);
    }
  
    if(save && save.customCampaign){
      this.customCampaign = true;
      let split = save.customCampaign.split('"');
      for (let i = 1; i < split.length; i += 2) {
        split[i] = split[i].replace(/\n/g, "\\n");
      }
      campaign = JSON.parse(split.join('"'));
    }

    if(!campaign)
      campaign = defaultCampaign;

    this.terrain = new Terrain(campaign, save, (o: any) =>
      this.renderer.draw(o)
    );

    this.renderer.synch();

    console.log(this.serialize());
  }

  canvas: HTMLCanvasElement;

  serialize() {
    return JSON.stringify({
      terrain: this.terrain.serialize(),
      customCampaign:this.customCampaign?this.campaign:false
    });
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    if (this.renderer) this.renderer.resize();
  }

  constructor(public updateUI: Function) {
    this.tooltip = document.getElementById("tooltip");
    this.info = document.getElementById("info");

    this.renderer = new RenderSchematic(this);

    this.init();
  }

  over() {
    return false;
  }

  update(timeStamp: number) {
    if (!this.lastLoopTimeStamp) this.lastLoopTimeStamp = timeStamp - 0.001;
    let dTime = Math.min(0.02, (timeStamp - this.lastLoopTimeStamp) / 1000);
    this.lastLoopTimeStamp = timeStamp;
    this.time += dTime;

    this.renderer.update(dTime);

    this.renderer.render(this.ctx);

    if (this.over()) this.updateUI({ over: true });

    if (this.chosen && !this.chosen.alive) {
      delete this.chosen;
    }
  }

  updateTooltip(at?: V2, text?: string) {
    this.tooltip.style.display = at ? "block" : "none";
    if (at) {
      this.tooltip.style.left = (
        at[0] +
        30 +
        this.canvas.offsetLeft
      ).toString();
      this.tooltip.style.top = at[1].toString();
      this.tooltip.innerHTML = text;
    }
  }

  updateInfo(text?: string) {
    this.info.innerHTML =
      text ||
      (this.terrain.victor
        ? `<H3 style="color:white; background:${this.terrain.victor.color}">${this.terrain.victor.name} side victorious</H3>`
        : "");
  }

  click(x: number, y: number) {
    let cell = this.renderer.cellAtScreenPos(x, y);
    this.clickCell(cell);
    this.renderer.resetCanvasCache();
  }

  canPlayAs(unit: Unit) {
    return unit.blue || this.mode != Game.PAI;
  }

  clickCell(cell: Cell) {
    if (!cell) return;

    if (cell.unit) {
      if (
        this.chosen &&
        this.chosen.team == cell.unit.team &&
        this.canPlayAs(cell.unit)
      ) {
        this.chosen = cell.unit;
        this.chosen.calculate();
        return;
      }

      if (this.chosen && this.chosen.canDamage(cell.unit)) {
        this.chosen.shoot(cell);
        return;
      }

      if (this.chosen == cell.unit) {
        this.cancel();
      } else {
        if (this.canPlayAs(cell.unit)) this.chosen = cell.unit;
      }

      if (this.chosen) {
        this.chosen.calculate();
      }
    }

    if (!cell.unit && this.chosen && this.chosen.reachable(cell)) {
      this.chosen.move(cell);
      this.terrain.teams[Team.RED].calculate();
    }

    this.lastSelectedFaction = this.chosen ? this.chosen.team : this.terrain.we;
  }

  cancel() {
    delete this.chosen;
    this.renderer.resetCanvasCache();
  }

  momentum: V2 = [0, 0];

  drag(dx: number, dy: number) {
    this.renderer.screenPos = v2.sum(this.renderer.screenPos, [dx, dy]);
  }

  hover(x?: number, y?: number) {
    let cell = this.renderer.cellAtScreenPos(x, y);

    if (this.hovered == cell) return;

    if (!cell) {
      delete this.hovered;
      this.renderer.resetCanvasCache();
      return;
    }

    if (!cell) return;

    this.hovered = cell;

    let cursor = "default";
    if ((this.chosen && this.chosen.reachable(cell)) || cell.unit)
      cursor = "pointer";

    if (this.chosen && this.chosen.canDamage(cell.unit)) {
      cursor = "crosshair";
      this.updateTooltip(
        this.renderer.cidToCenterScreen(cell.cid),
        `${this.chosen.hitChance(cell.unit)}% ${this.chosen.gun
          .averageDamage(this.chosen, cell.unit)
          .toFixed(1)}`
      );
    } else {
      this.updateTooltip();
    }
    document.body.style.cursor = cursor;

    if (cell.unit) {
      this.updateInfo(cell.unit.info());
    } else {
      this.updateInfo();
    }

    if (!this.renderer.busy) this.renderer.resetCanvasCache();
  }

  async endTurn() {
    delete this.chosen;

    this.aiTurn = true;
    this.updateUI({ aiMoving: true });

    if (this.mode == Game.AIAI) await this.terrain.teams[Team.BLUE].aiTurn();
    this.terrain.teams[Team.RED].beginTurn();
    if (this.mode != Game.PP) await this.terrain.teams[Team.RED].aiTurn();
    this.terrain.teams[Team.BLUE].beginTurn();
    this.renderer.resetCanvasCache();

    this.aiTurn = false;
    this.updateUI({ aiMoving: false });
  }

  toggleMode() {
    this.mode = (this.mode + 1) % 3;
    return ["[P+AI] 2P 2AI", "P+AI [2P] 2AI", "P+AI 2P [2AI]"][this.mode];
  }

  setMode(m: number) {
    this.mode = m;
  }

  get hoveredChar() {
    if (this.hovered) return this.hovered.unit;
  }

  get campaignString() {
    let s = JSON.stringify(this.campaign || defaultCampaign, null, " ").replace(/\\n/g, "\n");
    return s;
  }
}

/*



*/
