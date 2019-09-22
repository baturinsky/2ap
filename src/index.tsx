export let mouseAt: [number, number];
import { eachFrame } from "./Util";
import Game from "./Game";
import { h, render, Component, createRef } from "preact";
import linkState from "linkstate";
import Help from "./Help";

let paused = false;

const PLAY = 0;
const MENU = 1
const NEW = 2;
const LOAD = 3;
const SAVE = 4;
const EDITOR = 5;
const SETTINGS = 6;
const HELP = 7;

function mountEventsToCanvas(game: Game, c: HTMLCanvasElement) {
  let drag = 0;

  c.addEventListener("mouseup", e => {
    drag = 0;
  });

  c.addEventListener("mousedown", e => {
    if (e.button == 2) {
      game.cancel();
    } else {
      game.click(e.offsetX, e.offsetY);
    }
  });

  c.addEventListener("mousemove", e => {
    if (e.buttons & 6) {
      drag++;
      if (drag >= 3) game.drag(e.movementX, e.movementY);
    }
    game.hover(e.offsetX, e.offsetY);
  });

  c.addEventListener("mouseleave", e => {
    game.hover();
  });

  c.addEventListener("mouseenter", e => {});

  c.addEventListener(
    "contextmenu",
    function(e) {
      e.preventDefault();
    },
    false
  );
}

export default store => {
  store.on("@init", () => ({ projects: [] }));

  store.on("projects/add", ({ projects }, project) => {
    return { projects: projects.concat([project]) };
  });
};

class GUI extends Component {
  state = { mode: 0, page: "play", game: undefined as Game, stageEdit: "" };
  canvas = createRef<HTMLCanvasElement>();

  get game() {
    return this.state.game;
  }

  gameUpdated(g: Game) {
    this.setState({ game: g });
  }

  setMode(i: number) {
    this.setState({ mode: i });
    this.game.setMode(i);
  }

  setPage(page: string) {
    this.setState({ page: page });
    if (page == "edit") {
      this.setState({ stageEdit: this.game.campaignString });
    }
    if(page == "save"){
      let save = this.state.game.serialize();
      localStorage.setItem("2apSave", save);
      console.log(save);
      this.setPage("play")
    }
    if(page == "load"){
      let save = localStorage["2apSave"]
      if(save)
        this.game.init(save);
      this.setPage("play")
    }
  }

  clickDone() {
    let page = this.state.page;
    if (page == "play") {
      this.game.endTurn();
    }
    if (page == "edit") {
      this.game.init({customCampaign:this.state.stageEdit});
      this.setPage("play");
    }
  }

  updateUI = (event: { aiTurn?: boolean }) => {
    this.setState(event);
  };

  componentDidMount() {
    this.gameUpdated(new Game(this.updateUI));

    let c = this.canvas.current;
    mountEventsToCanvas(this.game, c);
    this.game.setCanvas(c);

    window.onresize = () => {
      this.game.renderer.resize();
    };

    eachFrame(time => {
      if (this.game && !paused && !this.game.over()) this.game.update(time);
    });
  }

  displayIfPage(p: string) {
    return this.state.page == p ? "display:flex" : "display:none";
  }

  topButtons(): [string, Function|string][] {
    let page = this.state.page;
    if(page == "play"){
      return [
        ["vs AI", () => this.setMode(0)],
        ["2P", () => this.setMode(1)],
        ["2AI", () => this.setMode(2)],
        [undefined, undefined],
        ["Menu", "menu"]
      ];  
    } else {
      return [
        ["New Game", "new"],
        ["Load", "load"],
        ["Save", "save"],
        ["Settings", "settings"],
        ["Editor", "edit"],
        ["Help", "help"],
        [undefined, undefined],
        ["Continue", "play"]
      ];  
    }
  }

  render(props, { mode, page, aiTurn }) {
    return (
      <div>
        <div class="center-screen">
          {[
            <canvas
              ref={this.canvas}
              id="main"
              style={this.displayIfPage("play")}
            ></canvas>,
            <div style={this.displayIfPage("help")}>
              <Help />
            </div>,
            <div id="editor" style={this.displayIfPage("edit")}>
              <textarea
                onChange={linkState(this, "stageEdit")}
                cols={100}
                rows={40}
                value={this.state.stageEdit}
                id="edit-area"
              ></textarea>
            </div>
          ]}
        </div>

        <div id="tooltip"></div>
        <div class="top-buttons row">
          {this.topButtons().map(([text, action], i) =>
            text ? (
              <button
                class={(page=="play"?"small":"medium") + (page=="play" && mode == i || page == action ? " pressed" : "")}
                onClick={e => action instanceof Function?action():this.setPage(action)}
              >
                {text}
              </button>
            ) : (
              <span class="flex-spacer"></span>
            )
          )}
        </div>
        <div class="bottom-buttons row">
          <div id="info"></div>
          {(page == "edit" || page == "play" && !aiTurn) && (
            <button id="endb" onClick={e => this.clickDone()}>
              {page == "play" ? "End Turn" : "Apply"}
            </button>
          )}
        </div>
      </div>
    );
  }
}

window.onload = function() {
  render(<GUI />, document.body);

  /*eachFrame(time => {
    if (game && !paused && !game.over()) game.update(time);
    if (page == 0)
      endButton.style.visibility = game.renderer.busy ? "hidden" : "visible";
  });*/
};
