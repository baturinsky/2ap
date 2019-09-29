import * as v2 from "./v2";
import { V2 } from "./v2";
import Terrain from "./Terrain";
import Unit from "./Unit";
import RenderSchematic from "./RenderSchematic";
import Team from "./Team";
import Cell from "./Cell";
import { campaigns as coreCampaigns, StageConf, CampaignConf } from "./Campaigns";
import { parseWithNewLines } from "./Util";

export default class Game {
  ctx: CanvasRenderingContext2D;
  lastLoopTimeStamp: number;
  time: number = 0;
  terrain: Terrain;

  //eye: Char;
  lastSelectedFaction: Team;
  chosen: Unit;
  lastChosen: Unit;
  hovered: Cell;

  static readonly PAI = 2;
  static readonly PP = 0;
  static readonly AIAI = 3;

  aiSides = Game.PAI;

  renderer: RenderSchematic;

  canvas: HTMLCanvasElement;

  campaign: CampaignConf;
  stage: StageConf;
  customCampaign: boolean;

  static readonly savePrefix = "2aps:";
  static readonly campaignPrefix = "2apc:";
  static readonly savePrefixLength = Game.savePrefix.length;
  static readonly timeStampLength = 13;

  static loadCampaign(id: string): CampaignConf {
    return parseWithNewLines(localStorage.getItem(Game.campaignPrefix + id));
  }

  static campaignById(id?: string) {
    return (
      coreCampaigns.find(c => c.name == id || c.name + " " + c.version == id) ||
      Game.loadCampaign(id) ||
      coreCampaigns[0]
    );
  }

  static savedCampaignIds() {
    return Object.keys(localStorage)
      .filter(n => n.substr(0, Game.savePrefixLength) == Game.campaignPrefix)
      .map(n => n.substr(Game.savePrefixLength))
      .sort()
      .reverse();
  }

  static allCampaignIds() {
    return coreCampaigns
      .map(c => c.name + " " + c.version)
      .concat(Game.savedCampaignIds());
  }

  stageByName(name: string) {
    return (
      this.campaign.stages.find(s => s.name == name) || this.campaign.stages[0]
    );
  }

  init(saveString?: string, useState: boolean = true) {
    delete this.chosen;
    delete this.hovered;
    delete this.lastSelectedFaction;

    let save;

    if (saveString) {
      save = parseWithNewLines(saveString);

      if (save.campaign) {
        this.campaign = Game.campaignById(save.campaign);
      } else {
        this.campaign = save;
        this.customCampaign = true;
      }
    }

    if (!this.campaign) this.campaign = Game.campaignById();
    this.init2(
      this.campaign,
      this.stageByName(save && save.stage),
      save && useState ? save.state : null
    );
  }

  makeNotCustom() {
    this.customCampaign = false;
  }

  init2(campaign: CampaignConf, stage: StageConf, state?: StageConf) {
    this.campaign = campaign;

    this.stage = stage;

    this.terrain = new Terrain(
      this.campaign,
      this.stage,
      state || null,
      (animation: any) => this.renderer.draw(animation)
    );

    this.renderer.synch();

    this.updateUI({ activeTeam: this.activeTeam });
  }

  initStage(stageInd: number) {
    this.init2(this.campaign, this.campaign.stages[stageInd]);
  }

  serialize(
    include: { campaign?: boolean; state?: boolean } = { state: true }
  ) {
    let o: any = {};

    if (include.campaign || this.customCampaign) {
      Object.assign(o, this.campaign);
    } else {
      o.campaign = this.campaign.name;
    }

    if (include.state) {
      o.state = this.terrain.serialize();
    }

    o.stage = this.stage.name;

    return JSON.stringify(o, null, "  ").replace(/\\n/g, "\n");
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    if (this.renderer) this.renderer.resize();
  }

  constructor(public updateUI: Function) {
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

  updateTooltip(tooltipAt?: V2, tooltipText?: string) {
    this.updateUI({ tooltipAt, tooltipText });
  }

  click(x: number, y: number) {
    let cell = this.renderer.cellAtScreenPos(x, y);
    this.clickCell(cell);
    this.renderer.resetCanvasCache();
  }

  isAi(team: Team) {
    return this.aiSides & (1 << team.faction);
  }

  canPlayAs(unit: Unit) {
    return !this.isAi(unit.team);
  }

  choose(c: Unit) {
    this.chosen = c;
    if (!c) return;
    this.lastChosen = this.chosen;
    this.chosen.calculate();
    this.renderer.lookAtCid(this.chosen.cid);
    this.renderer.resetCanvasCache();
  }

  clickCell(cell: Cell) {
    if (!cell) return;

    if (cell.unit) {
      if (
        this.chosen &&
        this.chosen.team == cell.unit.team &&
        this.canPlayAs(cell.unit)
      ) {
        this.choose(cell.unit);
        return;
      }

      if (this.chosen && this.chosen.canDamage(cell.unit)) {
        this.chosen.shoot(cell);
        return;
      }

      if (this.chosen == cell.unit) {
        this.cancel();
      } else {
        if (this.canPlayAs(cell.unit)) this.choose(cell.unit);
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
        `${this.chosen.hitChance(cell)}% ${this.chosen.gun
          .averageDamage(this.chosen, cell)
          .toFixed(1)}`
      );
    } else {
      this.updateTooltip();
    }
    document.body.style.cursor = cursor;

    this.updateUI({chosen:this.chosen, unitInfo:cell.unit});

    if (!this.renderer.busy) this.renderer.resetCanvasCache();
  }

  get blue() {
    return this.terrain.teams[Team.BLUE];
  }

  get red() {
    return this.terrain.teams[Team.RED];
  }

  get activeTeam() {
    return this.terrain.activeTeam;
  }

  async endTurn(aiSides: number) {
    this.aiSides = aiSides;
    if (this.isAi(this.activeTeam)) {
      await this.endSideTurn();
    } else {
      do {
        await this.endSideTurn();
      } while (this.isAi(this.activeTeam));
    }
  }

  async endSideTurn() {
    delete this.chosen;

    let team = this.activeTeam;

    if (this.isAi(team)) await team.think();

    this.terrain.endSideTurn();

    this.renderer.resetCanvasCache();

    this.updateUI({ activeTeam: this.activeTeam });
  }

  setAiSides(m: number) {
    this.aiSides = m;
  }

  get hoveredChar() {
    if (this.hovered) return this.hovered.unit;
  }

  chooseNext(delta = 1) {
    if (!this.chosen) {
      if (this.lastChosen) this.choose(this.lastChosen);
      else this.choose(this.terrain.we.units[0]);
    } else {
      let team = this.chosen.team.units;
      let next =
        team[(team.indexOf(this.chosen) + team.length + delta) % team.length];
      this.choose(next);
    }
  }
}

/*



*/
