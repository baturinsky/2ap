export let mouseAt: [number, number];
import { eachFrame } from "./Util";
import Game from "./Game";
import { h, render, Component, createRef, FunctionalComponent } from "preact";
import linkState from "linkstate";
import Help from "./Help";
import { V2 } from "./v2";
import { timingSafeEqual } from "crypto";

let paused = false;

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

let savePrefix = "2aps:";
let savePrefixLength = savePrefix.length;

let Saves: FunctionalComponent<{
  saves: string[];
  save: () => void;
  load: (id: string) => void;
  del: (id: string) => void;
  changeName: (from: string, to: string) => void;
}> = props => (
  <div class="save">
    <button onClick={props.save}>New Save</button>
    {props.saves.map(key => (
      <div class="save-row">
        <button class="small" onClick={() => props.del(key)}>
          Del
        </button>
        <input
          class="save-name"
          onChange={e =>
            props.changeName(key, (e.target as HTMLInputElement).value)
          }
          value={key}
        />
        <button class="small" onClick={() => props.load(key)}>
          Load
        </button>
      </div>
    ))}
  </div>
);

class GUI extends Component {
  state = {
    mode: 0,
    page: "play",
    game: undefined as Game,
    stageEdit: "",
    saves: [] as string[]
  };

  canvas = createRef<HTMLCanvasElement>();
  tooltip = createRef<HTMLElement>();

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

  updateSaves() {
    let saves = [];
    for (let key in localStorage) {
      if (key.substr(0, savePrefixLength) == savePrefix) {
        saves.push(key.substr(savePrefixLength));
      }
    }
    this.setState({ saves });
  }

  setPage(page: string) {
    this.setState({ page: page });
    if (page == "edit") {
      this.setState({
        stageEdit: this.game.serialize({ campaign: true, state: true })
      });
    }
    if(page == "new"){
      this.game.init()
      this.setPage("play")
    }
    /*if(page == "save"){
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
    }*/
  }

  clickDone() {
    let page = this.state.page;
    if (page == "play") {
      this.game.endTurn();
    }
    if (page == "edit") {
      this.game.init(this.state.stageEdit);
      this.setPage("play");
    }
  }

  updateUI = (event: {
    aiTurn?: boolean;
    tooltipAt?: V2;
    tooltipText?: string;
    info?: string;
  }) => {
    this.setState(event);
    if (event.tooltipAt || event.tooltipText)
      this.updateTooltip(event.tooltipAt, event.tooltipText);
  };

  updateTooltip(at?: V2, text?: string) {
    let tooltip = this.tooltip.current;
    tooltip.style.display = at ? "block" : "none";
    if (at) {
      tooltip.style.left = (
        at[0] +
        30 +
        this.canvas.current.offsetLeft
      ).toString();
      tooltip.style.top = at[1].toString();
    }
  }

  componentDidMount() {
    this.gameUpdated(new Game(this.updateUI));
    this.updateSaves();

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

  topButtons(): [string, Function | string][] {
    let page = this.state.page;
    if (page == "play") {
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
        ["Saves", "saves"],
        ["Settings", "settings"],
        ["Editor", "edit"],
        ["Help", "help"],
        [undefined, undefined],
        ["Continue", "play"]
      ];
    }
  }

  saveGame() {
    let save = this.state.game.serialize();
    let id = this.state.game.campaign.name + " " + new Date().toISOString();

    localStorage.setItem(savePrefix + id, save);
    this.updateSaves();
  }

  delGame(id: string) {
    localStorage.removeItem(savePrefix + id);
    this.updateSaves();
  }

  loadGame(id: string) {
    let save = localStorage.getItem(savePrefix + id);
    if (save) this.game.init(save);
    this.setPage("play");
  }

  changeGameName(from: string, to: string) {
    if (!localStorage[savePrefix + to]) {
      localStorage.setItem(savePrefix + to, localStorage[savePrefix + from]);
      localStorage.removeItem(savePrefix + from);
      this.updateSaves()
    }
  }

  renderPage() {
    switch (this.state.page) {
      case "help":
        return <Help />;
      case "saves":
        return (
          <Saves
            saves={this.state.saves}
            save={() => this.saveGame()}
            load={id => this.loadGame(id)}
            del={id => this.delGame(id)}
            changeName={(from, to) => this.changeGameName(from, to)}
          />
        );
      default:
        return <div />;
    }
  }

  render(props, { mode, page, aiTurn, info, tooltipText }) {
    return (
      <div>
        <div class="center-screen" style={this.displayIfPage("play")}>
          <canvas ref={this.canvas} id="main"></canvas>
        </div>

        <div class="center-horisontal">
          <div id="editor" style={this.displayIfPage("edit")}>
            <textarea
              onChange={linkState(this, "stageEdit")}
              cols={100}
              rows={40}
              value={this.state.stageEdit}
              id="edit-area"
            ></textarea>
          </div>
          {[this.renderPage()]}
        </div>

        <div id="tooltip" ref={this.tooltip}>
          {tooltipText}
        </div>
        <div class="top-buttons row">
          {this.topButtons().map(([text, action], i) =>
            text ? (
              <button
                class={
                  (page == "play" ? "small" : "medium") +
                  ((page == "play" && mode == i) || page == action
                    ? " pressed"
                    : "")
                }
                onClick={e =>
                  action instanceof Function ? action() : this.setPage(action)
                }
              >
                {text}
              </button>
            ) : (
              <span class="flex-spacer"></span>
            )
          )}
        </div>
        <div class="bottom-buttons row">
          <div id="info" dangerouslySetInnerHTML={{ __html: info }}></div>
          {(page == "edit" || (page == "play" && !aiTurn)) && (
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
