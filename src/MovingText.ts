import Game from "./Game";

import { V2 } from "./v2";
import * as v2 from "./v2";
import { Context2d } from "./Util";
import Anim from "./Anim";

export default class MovingText implements Anim{
  time = 0;
  constructor(
    public text: string,
    public color: string,
    public lifeTime: number,
    public at: V2,
    public vel: V2 = [0, 0]
  ) {    
  }

  update(dTime: number) {
    this.time += dTime;
    this.at = v2.sum(this.at, this.vel, dTime);
    return this.time < this.lifeTime;
  }

  render(ctx:Context2d) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = `black`;
    ctx.shadowBlur = 1;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.font = `12pt "Courier"`;
    ctx.textAlign = "center";
    let y = 0;
    let l = 0;
    for (let line of this.text.split("|")) {
      ctx.fillText(
        line.trim().substr(0, Math.floor(this.time * 70) - l),
        this.at[0],
        this.at[1] + y
      );
      l += line.length;
      y += 20;
    }
    ctx.restore();
  }
}

