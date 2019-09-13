import Char from "./Char";

export default class Gun {
  damageOptimalRange = [1, 20];
  damage = [4, 5];
  damagePenaltyPerCell = 100;
  accuracyPenaltyMax = 20;

  accuracy = 60;
  accuracyOptimalRange = [1, 1];
  accuracyPenaltyPerCell = 1;

  damagePenaltyMax = 2;  

  breach = 0;

  name = "Gun";

  static readonly SNIPER = new Gun({
    name: "Sniper",
    damageOptimalRange: [1, 30],
    damagePenaltyPerCell: 0.1,
    accuracyOptimalRange: [10, 30],
    accuracyPenaltyPerCell: 1,
    breach: 1
  });

  static readonly SHOTGUN = new Gun({
    name: "Shotgun",
    damage: [6, 7],
    damageOptimalRange: [1, 1],
    damagePenaltyMax: 4,
    damagePenaltyPerCell: 0.3,
    accuracy: 80,
    accuracyOptimalRange: [1, 1],
    accuracyPenaltyPerCell: 5,
    accuracyPenaltyMax: 40
  });

  constructor(o?: any) {
    if (o) Object.assign(this, o);
  }

  damagePenalty(dist: number) {
    let diff = 0;
    if (dist < this.damageOptimalRange[0]) {
      diff = this.damageOptimalRange[0] - dist;
    }
    if (dist > this.damageOptimalRange[1]) {
      diff = dist - this.damageOptimalRange[1];
    }
    //debugger;
    return Math.min(this.damagePenaltyMax, this.damagePenaltyPerCell * diff);
  }

  accuracyPenalty(dist: number) {
    let diff = 0;
    if (dist < this.accuracyOptimalRange[0]) {
      diff = this.accuracyOptimalRange[0] - dist;
    }
    if (dist > this.accuracyOptimalRange[1]) {
      diff = dist - this.accuracyOptimalRange[1];
    }
    //debugger;
    return Math.min(this.accuracyPenaltyMax, this.accuracyPenaltyPerCell * diff);
  }

  averageDamage(by: Char, target: Char) {
    let dmg = (this.damage[1] + this.damage[0]) * 0.5;
    dmg -= Math.max(0, target.armor - this.breach);
    dmg -= this.damagePenalty(by.dist(target));    
    return Math.max(0, Math.round(dmg * 10) / 10);
  }

  damageRoll(by: Char, target: Char, rnf: () => number) {
    let dmg = rnf() * (this.damage[1] - this.damage[0]) + this.damage[0];
    dmg -= Math.max(0, target.armor - this.breach);
    dmg -= this.damagePenalty(by.dist(target));
    return Math.max(0, Math.round(dmg));
  }
}
