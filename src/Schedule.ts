export type ScheduledAction = (time: number) => number | void;
type Event = {
  resolve: ScheduledAction;
  reject: (reason:any)=>void
  time: number;
};

export default class Schedule {
  events: Event[] = [];

  when(when: number) {
    const p = new Promise<number>((resolve, reject) => {
      let event: Event = { resolve: resolve, reject:reject, time: when };
      for (let i = this.events.length - 1; i > 0; i--) {
        if (this.events[i][1] <= when) {
          this.events.splice(i + 1, 0, event);
          break;
        }
      }
      this.events.unshift(event);
    });
    return p;
  }

  update(time: number) {
    while (this.events.length > 0 && this.events[0][1] <= time) {
      let event = this.events.shift();
      let nextIn = event.resolve(time);
      if (nextIn || nextIn == 0) {
        this.when(nextIn + time).then(event.resolve);
      }
    }
  }

  cancelAll(){
    for(let e of this.events){
      e.reject("cancelled")
    }
  }
}
