export let mouseAt: [number, number];
import { eachFrame } from "./Util";
import Game from "./Game";
import Terrain from "./Terrain";
let c: HTMLCanvasElement;

let game: Game;
let paused = false;
let pageButtons: HTMLElement[];
let modeButtons: HTMLElement[];
let pages: HTMLElement[];
let page = 0;
let mode = 0;
let editArea: HTMLTextAreaElement;
let endButton: HTMLElement

function gameUpdated(g: Game) {
  game = g;
  if (!game) {
    c.getContext("2d").clearRect(0, 0, 1200, 1200);
  }
}

function updateUI() {
  gameUpdated(game);
}

function updateButtons() {
  for (let i = 0; i < 3; i++) {
    if (i == mode) {
      modeButtons[i].classList.add("pressed");
    } else {
      modeButtons[i].classList.remove("pressed");
    }
  }

  for (let i = 0; i < 3; i++) {
    if (i == page) {
      pageButtons[i].classList.add("pressed");
      pages[i].style.display = "block";
    } else {
      pageButtons[i].classList.remove("pressed");
      pages[i].style.display = "none";
    }
  }

  endButton.innerHTML = page==0?"End Turn":"Apply"
  endButton.style.visibility = page == 1?"hidden":"visible";
}

window.onload = function() {
  c = document.getElementById("main") as HTMLCanvasElement;
  endButton = document.getElementById("endb")

  pages = ["main", "help", "editor"].map(id => document.getElementById(id));

  pageButtons = ["playb", "helpb", "editb"].map(id => document.getElementById(id));

  for (let i = 0; i < 3; i++) {
    pageButtons[i].onclick = e => {
      page = i;
      updateButtons();
    };
  }

  modeButtons = ["pai", "pp", "aiai"].map(id => document.getElementById(id));

  for (let i = 0; i < 3; i++) {
    modeButtons[i].onclick = e => {
      mode = i;
      game.terrain.setMode(mode);
      updateButtons();
    };
  }

  updateButtons();

  gameUpdated(new Game(c, updateUI));

  endButton.onclick = e => {
    if(page == 0){
      game.terrain.endTurn();
    }
    if(page == 2){
      game.terrain.init(editArea.value);
      page = 0;
      updateButtons();
    }
  };

  editArea = document.getElementById("edit-area") as HTMLTextAreaElement;

  /*let modeButton = document.getElementById("mode");
  modeButton.onclick = e => {
    modeButton.innerHTML = game.terrain.toggleMode();
  };*/

  c.addEventListener("mousedown", e => {
    if (e.button == 2) {
      console.log(game.terrain);
      game.terrain.cancel();
    } else {
      game.terrain.click(e.offsetX, e.offsetY);
    }
  });

  c.addEventListener("mousemove", e => {
    game.terrain.hover(e.offsetX, e.offsetY);
  });

  c.addEventListener("mouseleave", e => {
    delete game.terrain.hoveredTile;
    game.terrain.updateCanvasCache()
  });

  c.addEventListener("mouseenter", e => {
  });

  c.addEventListener(
    "contextmenu",
    function(e) {
      e.preventDefault();
    },
    false
  );

  document.addEventListener("keyup", e => {});

  document.addEventListener("keydown", e => {});

  eachFrame(time => {
    if (game && !paused && !game.over()) game.update(time);
    if(page == 0)
      endButton.style.visibility = game.busy?"hidden":"visible";
  });

  gameUpdated(game);

  console.log(game.terrain.terrainString);

  editArea.value = game.terrain.terrainString;
};
