export class Tween {
  initial: number;
  onEnd: () => void;

  constructor(
    public obj: any,
    public key: string,
    public to: number,
    public dur: number,
    public start: number,
    public fun?: (number) => number
  ) {
    this.initial = obj[key];
  }

  update(time: number): boolean {
    let level = (time - this.start) / this.dur;
    if (level >= 1) {
      this.obj[this.key] = this.to;
      if(this.onEnd)
        this.onEnd();
      return false;
    } else {
      if (this.fun) level = this.fun(level);
      this.obj[this.key] =
        this.initial + (this.to - this.initial) * level;
    }
    return true;
  }
}

export default class Tweens {
  
  tweens: Tween[] = [];

  constructor(public time:number){    
  }

  update(time: number) {
    this.time = time;
    this.tweens = this.tweens.filter(tween => tween.update(time));
  }

  add(object: any, field: string, target: number, duration: number) {
    let t = new Tween(object, field, target, duration, this.time);
    this.tweens.push(t);
    return t;
  }
}


    /*for (let i = 0; i < this.tweens.length; i++) {
      let t = this.tweens[i];
      if (t.object == object && t.field == field) {
        this.tweens.splice(i, 1);
        i--;
      }
    }*/
