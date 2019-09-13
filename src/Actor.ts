import Game from "./Game";

export default class Actor {
  constructor(public game: Game) {}
  
  update(dTime: number): boolean {
    return false;
  }

  render(): void {}
}
