export class Tween {
  initial: number;
  onEnd: () => void;

  constructor(
    public object: any,
    public key: string,
    public from: number,
    public to: number,
    public duration: number,
    public way?: (from: number, to: number, time: number) => number
  ) {
    this.initial = object[key];
  }

  update(time: number): boolean {
    let level = (time - this.from) / this.duration;
    if (level >= 1) {
      this.object[this.key] = this.to;
      if (this.onEnd) this.onEnd();
      return false;
    } else {
      if (this.way) {
        this.object[this.key] = this.way(this.from, this.to, level);
      } else {
        this.object[this.key] = this.initial + (this.to - this.initial) * level;
      }
    }
    return true;
  }
}

/*
export default class Tweens {
  tweens: Tween[] = [];

  constructor(public time: number) {}

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

for (let i = 0; i < this.tweens.length; i++) {
      let t = this.tweens[i];
      if (t.object == object && t.field == field) {
        this.tweens.splice(i, 1);
        i--;
      }
    }*/
