import * as v2 from "./v2";
import { random, idiv } from "./Util";
import Terrain from "./Terrain";
import FX from "./FX";
import MovingText from "./MovingText";
import { tileSize } from "./settings";
import { V2 } from "./v2";

export default class Game {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  lastLoopTimeStamp: number;
  time: number = 0;
  terrain: Terrain;
  tooltip: HTMLElement;
  info: HTMLElement;
  fx: FX[] = [];
  busy: boolean = false;

  rni = random(1);

  rnf = () => (this.rni() % 1e9) / 1e9;

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
      #A#    #             #s         #a               #
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

    this.terrain = new Terrain(this, terrainString);

    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    this.canvas.height = this.height;
    this.canvas.width = this.width;
  }

  over() {
    return false;
  }

  update(timeStamp: number) {
    if (!this.lastLoopTimeStamp) this.lastLoopTimeStamp = timeStamp - 0.001;
    let dTime = Math.min(0.02, (timeStamp - this.lastLoopTimeStamp) / 1000);
    this.lastLoopTimeStamp = timeStamp;
    this.time += dTime;

    this.terrain.update(dTime);

    this.fx = this.fx.filter(sfx => sfx.update(dTime));

    this.render();

    if (this.over()) this.updateUI();
  }

  render() {
    let ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    this.terrain.render(ctx);

    for (let fx of this.fx) fx.render(ctx);
  }

  text(from: V2, text: string) {
    let at = v2.sum(from, [0, -10]);
    console.log(at);
    new MovingText(this, text, "#f00", 3, at, [0, -10]);
  }

  blockingAnimationEnd: Function;

  waitForAnim() {
    return new Promise<void>(resolve => {
      this.blockingAnimationEnd = () => resolve();
    });
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
    this.info.innerHTML = text || (this.terrain.victor>=0?`<H3 style="background:${["RED","BLUE"][this.terrain.victor]}">${["RED","BLUE"][this.terrain.victor]} side victorious</H3>`:"");
  }
}

/*
    ##################################################
    #                                                #
    #+++++++G                                        #
    #                                                #
    #                                                #
    # s    ###        +                              #
    # ++              +    g                         #
    #  + a++++        ++++++                         #
    #  +                                             #
    #                      A         S               #
    #                               #                #
    #                                                #
    #   ####                                         #
    #                                                #
    #                  a#                            #
    #                   #                            #
    #             ++++++#                            #
    #                   #                            #
    #           #########                            #
    #           +                                    #
    #                                                #
    #                                                #
    #                                                #
    #                                                #
    #                                                #
    #                                                #
    #                                                #
    #                                                #
    #                                                #
    ##################################################
*/

/*
`
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
      #A#    #             #s         #a               #
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
      `
*/