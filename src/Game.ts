import * as v2 from "./v2";
import Terrain from "./Terrain";
import { tileSize } from "./settings";
import { V2 } from "./v2";
import Unit from "./Unit";
import RenderSchematic from "./RenderSchematic";
import Team from "./Team";
import Cell from "./Cell";

export default class Game {
  ctx: CanvasRenderingContext2D;
  lastLoopTimeStamp: number;
  time: number = 0;
  terrain: Terrain;
  tooltip: HTMLElement;
  info: HTMLElement;
  //busy: boolean = false;

  //eye: Char;
  lastSelectedFaction: Team;
  chosen: Unit;
  hoveredCell: Cell;

  static readonly PAI = 0;
  static readonly PP = 1;
  static readonly AIAI = 2;

  mode = Game.PAI;

  renderer: RenderSchematic;

  constructor(
    public canvas: HTMLCanvasElement,
    public updateUI: Function,
    terrainString?: string
  ) {
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.tooltip = document.getElementById("tooltip");
    this.info = document.getElementById("info");

    if (!terrainString)
      terrainString = `
      ##################################################
      #      #  a      ++++# + #    ++#  s             #
      # #    #  +         +#   #    ++#  ++++++++      #
      #      +  +         +#   #    ++#  ++++++++      #
      #S#    +  +         +# * #      #                #
      #      #  +          #   #      #                #
      # #    #             #   #     a#                #
      #      #  +          ## ## ######                #
      #             *                                  #
      #                                                #
      #A#    #          A  #s         #a               #
      #      #  +          #          #                #
      #A#    #  #      #a  #  ###    ++                #
      #      #  #      #   #  #      ++       *        #
      #G#    #  ########   #  #      +#                #
      #      #             #          #                #
      # #    ######  ###########  #####                #
      #      #++++      ++ # +        #                #
      #S#    #+            # +   ++   +                #
      #      #            +#          #                #
      #         ######g    #       +  #                #
      #         ######g    #####  #####                #
      #                    #   g      #      #        +#
      #      #          +  #                         ++#
      #G#    #+    *       #+++    +++#   #     #    ++#
      #      #++      +    #          #g               #
      # #    ######++###########++##########    ########
      #                 S+                             #
      #         +              A+                      #
      ##################################################
      `;

    this.terrain = new Terrain(terrainString, (o: any) =>
      this.renderer.draw(o)
    );

    //this.eye = new Char(this, Char.EYE, Char.BLUE, 0);
    this.renderer = new RenderSchematic(this, this.canvas);
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

    if (this.over()) this.updateUI();
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
        ? `<H3 style="color:white; background:${this.terrain.victor.color}">${
            this.terrain.victor.name
          } side victorious</H3>`
        : "");
  }

  click(x: number, y: number) {
    let cell = this.renderer.cellAtScreen(x, y);
    this.clickCell(cell);
    this.renderer.resetCanvasCache();
  }

  canPlayAs(unit: Unit) {
    return unit.blue || this.mode != Game.PAI;
  }

  clickCell(cell:Cell) {

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

  hover(x: number, y: number) {      
    let cell = this.renderer.cellAtScreen(x, y);

    if (this.hoveredCell == cell) return;

    if (!cell) {
      delete this.hoveredCell;
      this.renderer.resetCanvasCache();
      return;
    }

    if (!cell) return;    

    this.hoveredCell = cell;


    let cursor = "default";
    if ((this.chosen && this.chosen.reachable(cell)) || cell.unit)
      cursor = "pointer";

    if (this.chosen && this.chosen.canDamage(cell.unit)) {
      cursor = "crosshair";
      this.updateTooltip(
        this.renderer.cidToCenter(cell.cid),
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

    if(!this.renderer.busy)
      this.renderer.resetCanvasCache();
  }

  async endTurn() {
    delete this.chosen;

    if (this.mode == Game.AIAI) await this.terrain.teams[Team.BLUE].think();
    if (this.mode != Game.PP) await this.terrain.teams[Team.RED].think();
    for (let c of this.terrain.units) {
      c.ap = 2;
    }
    this.renderer.resetCanvasCache();
  }

  toggleMode() {
    this.mode = (this.mode + 1) % 3;
    return ["[P+AI] 2P 2AI", "P+AI [2P] 2AI", "P+AI 2P [2AI]"][this.mode];
  }

  setMode(m: number) {
    this.mode = m;
  }

  get hoveredChar(){
    if(this.hoveredCell)
      return this.hoveredCell.unit;
  }
}

/*

      ##################################################
      #      #  a      ++++# + #    ++#  s             #
      # #    #  +         +#   #    ++#  ++++++++      #
      #      +  +         +#   #    ++#  ++++++++      #
      #S#    +  +         +# * #      #                #
      #      #  +          #   #      #                #
      # #    #             #   #     a#                #
      #      #  +          ## ## ######                #
      #             *                                  #
      #                                                #
      #A#    #          A  #s         #a               #
      #      #  +          #          #                #
      #A#    #  #      #a  #  ###    ++                #
      #      #  #      #   #  #      ++       *        #
      #G#    #  ########   #  #      +#                #
      #      #             #          #                #
      # #    ######  ###########  #####                #
      #      #++++      ++ # +        #                #
      #S#    #+            # +   ++   +                #
      #      #            +#          #                #
      #         ######g    #       +  #                #
      #         ######g    #####  #####                #
      #                    #   g      #      #        +#
      #      #          +  #                         ++#
      #G#    #+    *       #+++    +++#   #     #    ++#
      #      #++      +    #          #g               #
      # #    ######++###########++##########    ########
      #                 S+                             #
      #         +              A+                      #
      ##################################################

*/