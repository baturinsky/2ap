export type Action = (time: number) => number|void;

export default class Schedule {
  events: [Action, number][] = [];

  add(when: number, action: Action) {    
    for (let i = this.events.length - 1; i > 0; i--)
      if (this.events[i][1] <= when) {
        this.events.splice(i + 1, 0, [action, when]);
        return;
      }
    this.events.splice(0, 0, [action, when]);
  }

  update(time: number) {
    while (this.events.length > 0 && this.events[0][1] <= time) {
      let action = this.events.shift()
      let nextIn = action[0](time);
      if (nextIn || nextIn == 0) {
        this.add(nextIn + time, action[0]);
      }
    }
  }
}
