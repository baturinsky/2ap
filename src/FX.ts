import Game from "./Game";

export default class FX {
  constructor(public game: Game) {
    game.fx.push(this);
  }
  update(dTime: number): boolean {
    return false;
  }
  render(ctx:CanvasRenderingContext2D): void {}
}