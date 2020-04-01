export let mouseAt: [number, number];
import { eachFrame, bind, signed, svgImg } from "./Util";
import Game from "./Game";
import { h, render, Component, createRef, FunctionalComponent } from "preact";
import linkState from "linkstate";
import Help from "./Help";
import { V2 } from "./v2";
import * as v2 from "./v2";
import * as lang from "./lang";
import { StageConf, CampaignConf } from "./Campaigns";
import Unit from "./Unit";
import Team from "./Team";

let paused = false;

function mountEventsToCanvas(gui: GUI, c: HTMLCanvasElement) {
  let drag = 0;

  c.addEventListener("mouseup", e => {
    drag = 0;
  });

  c.addEventListener("mousedown", e => {
    if (e.button == 0) {
      gui.game.click(e.offsetX, e.offsetY);
    }

    if (e.button == 2) {
      gui.game.cancel();
    }

    if (gui.state.page == "play") {
      if (e.button == 3) {
        if (location.hash == "#prev") history.forward();
        else history.pushState({}, document.title, "#prev");
        gui.game.chooseNext();
      }
      if (e.button == 4) {
        gui.game.chooseNext(-1);
      }
    }
  });

  c.addEventListener("mousemove", e => {
    if (e.buttons & 6) {
      drag++;
      if (drag >= 3) gui.game.drag(e.movementX, e.movementY);
    }
    gui.game.hover(e.offsetX, e.offsetY);
  });

  c.addEventListener("mouseleave", e => {
    console.log("leave");
    gui.game.hover();
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

class NewGame extends Component<{
  campaigns: string[];
  startStage: (CampaignConf, StageConf) => void;
}> {
  state = { campaign: null as CampaignConf, campaignInd: -1 };

  render() {
    return (
      <div class="new-game row">
        <div>
          <h4>Campaigns</h4>
          {this.props.campaigns.map((id, i) => (
            <div>
              <button
                class={i == this.state.campaignInd ? "long pressed" : "long"}
                onClick={() => this.selectCampaign(i)}
              >
                {id.search(/[0-9]{13}/) == 0
                  ? id.substr(Game.timeStampLength)
                  : id}
              </button>
            </div>
          ))}
        </div>
        <div>
          {this.state.campaign && [
            <h4>Scenarios</h4>,
            this.state.campaign.stages.map((stage, i) => (
              <div>
                <button class="long" onClick={() => this.startStage(i)}>
                  {stage.name}
                </button>
              </div>
            ))
          ]}
        </div>
      </div>
    );
  }

  selectCampaign(campaignInd: number) {
    this.setState({
      campaign: Game.campaignById(this.props.campaigns[campaignInd]),
      campaignInd
    });
  }

  startStage(stageInd: number) {
    this.props.startStage(
      this.state.campaign,
      this.state.campaign.stages[stageInd]
    );
  }
}

let AbilityButton = props => 
  <button>
    <svg width="32px" height="32px">
      <filter
        id="shadow"
        dangerouslySetInnerHTML={{
          __html: `<feDropShadow dx="1" dy="1" stdDeviation="1"/>`
        }}
      />
      <g style="fill:none; stroke:#999; filter:url(#shadow);">
        {props.children}
      </g>
    </svg>
  </button>;


let Saves: FunctionalComponent<{
  saves: string[];
  campaigns: string[];
  save: () => void;
  saveCampaign?: () => void;
  load: (id: string) => void;
  del: (id: string) => void;
  changeName: (from: string, to: string) => void;
}> = props => {
  let c = false;
  return (
    <div class="save">
      <button onClick={props.save}>Save Game</button>
      {props.saves
        .sort()
        .reverse()
        .concat([null], props.campaigns.sort().reverse())
        .map(key =>
          key ? (
            <div class="save-row">
              <button class="short" onClick={() => props.del(key)}>
                Del
              </button>
              &nbsp;
              {new Date(+key.substr(0, Game.timeStampLength)).toLocaleString()}
              <input
                class="save-name"
                disabled={c}
                onChange={e =>
                  props.changeName(key, (e.target as HTMLInputElement).value)
                }
                value={key.substr(Game.timeStampLength)}
              />
              <button onClick={() => props.load(key)}>Load</button>
            </div>
          ) : (
            ((c = true),
            [
              <h4>Custom Campaigns</h4>,
              props.saveCampaign && (
                <button onClick={props.saveCampaign}>Save Campaign</button>
              )
            ])
          )
        )}
    </div>
  );
};

export class GUI extends Component {
  state = {
    aiSides: 2,
    activeTeam: null as Team,
    page: "play",
    game: undefined as Game,
    stageEdit: "",
    modCampaign: true,
    modState: true,
    saves: [] as string[],
    campaigns: [] as string[],
    unitInfo: null as Unit,
    chosen: null as Unit,
    aiTurn: false,
    tooltipText: null as string,
    tooltipAt: null as V2
  };

  canvas = createRef<HTMLCanvasElement>();
  tooltip = createRef<HTMLElement>();

  constructor(props) {
    super(props);

    document.addEventListener("keydown", e => {
      switch (e.code) {
        case "Escape":
          if (this.page == "play") this.setPage("saves");
          else this.setPage("play");
          break;
        case "Tab":
          this.game.chooseNext();
          break;
        case "KeyS":
          if (e.shiftKey) this.setPage("saves");
          break;
      }
    });
  }

  get game() {
    return this.state.game;
  }

  get page() {
    return this.state.page;
  }

  gameUpdated(g: Game) {
    this.setState({ game: g });
  }

  updateSaves() {
    let saves = [];
    let campaigns = [];
    for (let key in localStorage) {
      let prefix = key.substr(0, Game.savePrefixLength);
      if (prefix == Game.savePrefix) {
        saves.push(key.substr(Game.savePrefixLength));
      }
      if (prefix == Game.campaignPrefix) {
        campaigns.push(key.substr(Game.savePrefixLength));
      }
    }
    this.setState({ saves, campaigns });
  }

  updateStageEdit() {
    this.setState({
      stageEdit: this.game.serialize({
        campaign: this.state.modCampaign,
        state: this.state.modState
      })
    });
  }

  setPage(page: string) {
    if (this.state.page == "edit" && this.state.stageEdit) {
      this.game.init(this.state.stageEdit);
    }

    this.setState({ page: page });
    if (page == "edit") {
      this.updateStageEdit();
    }
    if (page != "play") {
      document.body.style.cursor = "default";
    }
    if (page == "new-game") {
      /*this.game.init();
      this.setPage("play");*/
    }
  }

  /*apply() {
    this.game.init(this.state.stageEdit);
    this.setPage("play");
  }*/

  cancelEdit() {
    this.setState({ stageEdit: null });
    this.setPage("menu");
  }

  endTurn() {
    this.game.endTurn(this.state.aiSides);
  }

  updateUI = (event: {
    aiSides?: number;
    aiTurn?: boolean;
    tooltipAt?: V2;
    tooltipText?: string;
    unitInfo?: string;
  }) => {
    this.setState(event);
  };

  componentDidMount() {
    this.gameUpdated(new Game(this.updateUI));
    this.updateSaves();

    let c = this.canvas.current;
    mountEventsToCanvas(this, c);
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

  toggleAI(side: number) {
    let aiSides = this.state.aiSides ^ (1 << side);
    this.setState({ aiSides });
    this.game.setAiSides(aiSides);
  }

  topButtons(): [string, Function | string][] {
    let page = this.state.page;
    if (page == "play") {
      return [
        ["AI", () => this.toggleAI(0)],
        ["AI", () => this.toggleAI(1)],
        [undefined, undefined],
        ["Menu", "menu"]
      ];
    } else {
      return [
        ["New Game", "new-game"],
        ["Saves", "saves"],
        ["Settings", "settings"],
        ["Editor", "edit"],
        ["Help", "help"],
        [undefined, undefined],
        ["Continue", "play"]
      ];
    }
  }

  @bind saveCampaign() {
    let save = this.state.game.serialize({ campaign: true, state: false });
    let id = new Date().getTime() + this.state.game.campaign.name;

    localStorage.setItem(Game.campaignPrefix + id, save);
    this.updateSaves();
  }

  @bind saveGame() {
    let save = this.state.game.serialize();
    let id =
      new Date().getTime() +
      this.state.game.campaign.name +
      ": " +
      this.state.game.stage.name;

    localStorage.setItem(Game.savePrefix + id, save);
    this.updateSaves();
  }

  @bind delGame(id: string) {
    localStorage.removeItem(Game.savePrefix + id);
    localStorage.removeItem(Game.campaignPrefix + id);
    this.updateSaves();
  }

  @bind loadGame(id: string) {
    let save = localStorage.getItem(Game.savePrefix + id);
    if (save) this.game.init(save);
    else {
      save = localStorage.getItem(Game.campaignPrefix + id);
      this.game.init(save, false);
    }

    this.setPage("play");
  }

  @bind changeGameName(from: string, to: string) {
    let newHeader = Game.savePrefix + new Date().getTime() + to;
    let oldHeader = Game.savePrefix + from;
    if (!localStorage[newHeader] && newHeader != oldHeader) {
      localStorage.setItem(newHeader, localStorage[oldHeader]);
      localStorage.removeItem(oldHeader);
      this.updateSaves();
    }
  }

  startStage(campaign: CampaignConf, stage: StageConf) {
    this.game.init2(campaign, stage);
    this.game.makeNotCustom();
    this.setPage("play");
  }

  renderPage() {
    switch (this.state.page) {
      case "help":
        return <Help />;
      case "saves":
        return (
          <Saves
            saves={this.state.saves}
            campaigns={this.state.campaigns}
            saveCampaign={this.game.customCampaign && this.saveCampaign}
            save={this.saveGame}
            load={this.loadGame}
            del={this.delGame}
            changeName={this.changeGameName}
          />
        );
      case "new-game":
        return (
          <NewGame
            campaigns={Game.allCampaignIds()}
            startStage={(campaign, stage) => this.startStage(campaign, stage)}
          />
        );
      default:
        return <div />;
    }
  }

  @bind toggleModCampaign() {
    this.setState({ modCampaign: !this.state.modCampaign });
    this.updateStageEdit();
  }

  @bind toggleModState() {
    this.setState({ modState: !this.state.modState });
    this.updateStageEdit();
  }

  sideButtonText(i: number): JSX.Element {
    let ai = this.state.aiSides & (1 << i);
    let text = <span>{ai ? "AI" : "Player"}</span>;
    if (this.state.activeTeam && this.state.activeTeam.faction == i)
      text = <u>{text}</u>;
    return text;
  }

  render() {
    let state = this.state;
    let page = state.page;
    let cursor = svgImg(
      `width="32" height="32" fill="none" stroke="black"`,
      `<circle r="12" cx="16" cy="16" /><path d="M16 0 v32 M0 16 h32" />`
    );    
  
    return (
      <div style={`cursor:${cursor} 16 16, auto;`}>
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
            />
            <div class="row">
              <label>
                <input
                  type="checkbox"
                  checked={state.modCampaign}
                  onChange={this.toggleModCampaign}
                ></input>
                Modify Campaign
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={state.modState}
                  onChange={this.toggleModState}
                ></input>
                Modify State
              </label>
              <span class="flex-spacer"></span>
              <button id="endb" onClick={e => this.cancelEdit()}>
                Cancel
              </button>
            </div>
          </div>
          {[this.renderPage()]}
        </div>

        <div class="top-buttons row">
          {this.topButtons().map(([text, action], i) =>
            text ? (
              <button
                class={
                  "medium" +
                  (page == "play" && i <= 2 ? " side" + i : "") +
                  (page == action ? " pressed" : "")
                }
                onClick={e =>
                  action instanceof Function ? action() : this.setPage(action)
                }
              >
                {page == "play" && i <= 2 ? this.sideButtonText(i) : text}
              </button>
            ) : (
              <span class="flex-spacer"></span>
            )
          )}
        </div>
        {state.unitInfo && page == "play" && (
          <UnitInfo unit={state.unitInfo} chosen={this.state.chosen} />
        )}

        <div class="bottom-buttons row">
          <span class="flex-spacer"></span>
          {page == "play" && !state.aiTurn && (
            <button id="endb" onClick={e => this.endTurn()}>
              End Turn
            </button>
          )}
        </div>

        <div class="ability-buttons">
          <AbilityButton>
            <circle r="12" cx="16" cy="16" />
            <path d="M16,0 v32 M0 16 h32" />
          </AbilityButton>
          <AbilityButton>
            <circle r="10" cx="16" cy="16" />
            <circle r="6" cx="16" cy="16" />
            <path d="M0,16 Q16,-4 32,16 Q16,36 0,16" />
          </AbilityButton>
          <AbilityButton>
            <path d="M24,4 L0,16 L24,28 M16,8 a10,10 45 0 1 0,16 v-16" />
          </AbilityButton>
          <AbilityButton>
            <path d="M4,0 q24,0 24,12 h-4 q0,-6 -14,-6 l2,8 h-4 L4,0 M16,28 l-8,-8 l16,0 l-8,8" />
          </AbilityButton>
          <AbilityButton>
            <path d="M4,0 q24,0 24,12 h-4 q0,-6 -14,-6 l2,8 h-4 L4,0 M16,20 l-8,8 l16,0 l-8,-8" />
          </AbilityButton>
          <AbilityButton>
            <path d="M4,4 h24 v24 h-24 v-24 m0,8 h25 m-16,0 c0,6 6,6 6,0" />
          </AbilityButton>
        </div>

        <div
          id="tooltip"
          style={
            state.tooltipAt
              ? `display:block; left:${state.tooltipAt[0] +
                  30 +
                  this.canvas.current.offsetLeft}; top:${state.tooltipAt[1]}`
              : `display:none`
          }
        >
          {state.tooltipText}
        </div>
      </div>
    );
  }
}

let UnitInfo: FunctionalComponent<{ unit: Unit; chosen: Unit }> = ({
  unit,
  chosen
}) => {
  let accMods = {};
  let hitChance = 0;
  if (unit && chosen && unit != chosen)
    hitChance = chosen.hitChance(unit.cell, unit, false, accMods);

  return (
    <div id="unitInfo">
      {unit.name.toUpperCase()} <b>{unit.hp}</b>HP <b>{unit.ap}</b>AP{" "}
      <b>{unit.stress}</b>SP
      <br />
      velocity{renderV2(unit.velocity)} focus{renderV2(unit.focus)}
      <br />
      {hitChance && (
        <div>
          Hit Chance: <b>{hitChance}</b>
          {Object.keys(accMods)
            .filter(key => accMods[key])
            .map(key => (
              <span class="nobr">
                {" "}
                {key}
                <b>{signed(accMods[key])}</b>
              </span>
            ))}
        </div>
      )}
      {lang[unit.name]}
    </div>
  );
};

function renderV2(v: V2) {
  let angle = (Math.atan2(v[1], v[0]) / Math.PI) * 180;
  let length = Math.round(v2.length(v));
  return (
    <span>
      <svg width="10px" height="10px">
        <path
          d="M5 5 l 0 -5 l 5 5 l -5 5 l 0 -4 l -5 0 l 0 -2 l 5 0 "
          transform={`rotate(${angle} 5 5)`}
        />
      </svg>
      <b>{length}</b>
    </span>
  );
}

function renderArrow(v: [number, number]) {
  let angle = (Math.atan2(v[1], v[0]) / Math.PI) * 180;
  return (
    <svg width="10px" height="10px">
      <path
        style="fill:#000;"
        d="M5 5 l 0 -5 l 5 5 l -5 5 l 0 -4 l -5 0 l 0 -2 l 5 0 "
        transform={`rotate(${angle} 5 5)`}
      />
    </svg>
  );
}
