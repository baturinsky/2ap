import jsfxr from "jsfxr";

export function sfx(code: number[]) {
  try {
    var soundURL = jsfxr(code);
    var player = new Audio();
    player.src = soundURL;
    player.play();
  } catch (e) {
    console.error(e);
  }
}

export function sfxRnd(code: number[], spread: number = 0.01) {
  let oced = code.slice();
  oced[23] *= Math.random() * 0.2 + 0.8;
  oced[5] *= Math.random() + 0.5;
  this.sfx(oced);
}