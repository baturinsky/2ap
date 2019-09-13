var app = (function (exports) {
  'use strict';

  function createCanvas(w, h) {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      return canvas;
  }
  function canvasCache(size, draw) {
      //const canvas = new OffscreenCanvas(...size);
      const canvas = createCanvas(...size);
      const ctx = canvas.getContext("2d");
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000";
      draw(ctx);
      return canvas;
  }
  function random(seed) {
      seed = seed % 2147483647;
      if (seed <= 0)
          seed += 2147483646;
      return () => {
          return seed = seed * 16807 % 2147483647;
      };
  }
  function eachFrame(fun) {
      requestAnimationFrame(time => {
          fun(time);
          eachFrame(fun);
      });
  }
  function idiv(a, b) {
      return Math.floor(a / b);
  }

  function sum(a, b, m = 1) {
      return [a[0] + b[0] * m, a[1] + b[1] * m];
  }
  function sub(a, b) {
      return [a[0] - b[0], a[1] - b[1]];
  }
  function length(d) {
      return Math.sqrt(d[0] * d[0] + d[1] * d[1]);
  }
  function norm(v, scale = 1) {
      let d = length(v) || 1;
      return [v[0] / d * scale, v[1] / d * scale];
  }
  function dist(a, b) {
      return length([a[0] - b[0], a[1] - b[1]]);
  }
  function dot(a, b) {
      return a[0] * b[0] + a[1] * b[1];
  }
  function lerp(start, end, amt) {
      return [
          start[0] * (1 - amt) + amt * end[0],
          start[1] * (1 - amt) + amt * end[1]
      ];
  }
  function fromAngle(a) {
      return [Math.cos(a), Math.sin(a)];
  }

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */

  function __awaiter(thisArg, _arguments, P, generator) {
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  }

  class Gun {
      constructor(o) {
          this.damageOptimalRange = [1, 20];
          this.damage = [4, 5];
          this.damagePenaltyPerCell = 100;
          this.accuracyPenaltyMax = 20;
          this.accuracy = 60;
          this.accuracyOptimalRange = [1, 1];
          this.accuracyPenaltyPerCell = 1;
          this.damagePenaltyMax = 2;
          this.breach = 0;
          this.name = "Gun";
          if (o)
              Object.assign(this, o);
      }
      damagePenalty(dist) {
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
      accuracyPenalty(dist) {
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
      averageDamage(by, target) {
          let dmg = (this.damage[1] + this.damage[0]) * 0.5;
          dmg -= Math.max(0, target.armor - this.breach);
          dmg -= this.damagePenalty(by.dist(target));
          return Math.max(0, Math.round(dmg * 10) / 10);
      }
      damageRoll(by, target, rnf) {
          let dmg = rnf() * (this.damage[1] - this.damage[0]) + this.damage[0];
          dmg -= Math.max(0, target.armor - this.breach);
          dmg -= this.damagePenalty(by.dist(target));
          return Math.max(0, Math.round(dmg));
      }
  }
  Gun.SNIPER = new Gun({
      name: "Sniper",
      damageOptimalRange: [1, 30],
      damagePenaltyPerCell: 0.1,
      accuracyOptimalRange: [10, 30],
      accuracyPenaltyPerCell: 1,
      breach: 1
  });
  Gun.SHOTGUN = new Gun({
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

  const tileSize = 24;

  let sniper = `
Hits accurately and hard at long range, regardless of target's armor.
Has extra defence, making him nearly untouchable when in cover. 
Pretty helpess up close and has low HP.
`;
  let assault = `
Psycho with a shotgun. 
Fast and even has a bit of armor to survive close quater fight a bit longer.
Can deal a lot of damage, but only up close.
`;
  let gunner = `
Effective in any range and has extra hp.
Quite slow.
`;

  var lang = /*#__PURE__*/Object.freeze({
    sniper: sniper,
    assault: assault,
    gunner: gunner
  });

  class Char {
      //flanking = new Set<number>();
      constructor(terrain, kind, faction, cind, gun = new Gun()) {
          this.terrain = terrain;
          this.kind = kind;
          this.faction = faction;
          this.cind = cind;
          this.gun = gun;
          this.move = 5;
          this.maxHP = 10;
          this.hp = this.maxHP;
          this.ap = 2;
          this.armor = 0;
          this.sight = 20;
          this.def = 0;
          if (kind != Char.EYE)
              terrain.chars.push(this);
          switch (kind) {
              case Char.GUNNER:
                  this.move = 4;
                  this.hp = 14;
                  break;
              case Char.ASSAULT:
                  this.move = 6;
                  this.armor = 1;
                  this.gun = Gun.SHOTGUN;
                  break;
              case Char.SNIPER:
                  this.hp = 7;
                  this.def = 10;
                  this.gun = Gun.SNIPER;
                  break;
          }
          //console.log(this);
          this.maxHP = this.hp;
      }
      static from(terrain, letter, cind) {
          let io = Char.letters.indexOf(letter);
          if (io >= 0)
              return new Char(terrain, io, Char.RED, cind);
          io = Char.letters.indexOf(letter.toLowerCase());
          if (io >= 0)
              return new Char(terrain, io, Char.BLUE, cind);
      }
      //sprites: { [key: number]: OffscreenCanvas } = {};
      renderBody(ctx) {
          let flankNum = 0;
          let e = this.terrain.eye;
          if (e && e.cell.fov && e.faction != this.faction) {
              let visible = e.cell.fov.has(this.cind) || this.faction == e.faction;
              if (visible)
                  flankNum = (this.cover(e) == 0 ? 1 : 0) + (e.cover(this) == 0 ? 2 : 0);
              else
                  flankNum = 4;
          }
          if (!this.terrain.hoveredTile)
              flankNum = 0;
          ctx.fillStyle = ["#fff", "#faa", "#afa", "#ffa", "#ccc"][flankNum];
          ctx.strokeStyle = this.strokeColor;
          ctx.shadowColor = "#444";
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(0.5 * tileSize, 0.5 * tileSize, tileSize * 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowColor = `rgba(0,0,0,0)`;
          ctx.lineWidth = 2;
          for (let i = 0; i < this.hp; i++) {
              let angle = Math.PI * (1 - i / (this.maxHP - 1));
              let v = fromAngle(angle);
              ctx.beginPath();
              ctx.moveTo((0.5 + v[0] * 0.4) * tileSize, (0.5 + v[1] * 0.4) * tileSize);
              ctx.lineTo((0.5 + v[0] * 0.5) * tileSize, (0.5 + v[1] * 0.5) * tileSize);
              ctx.stroke();
          }
          ctx.lineWidth = 1;
          ctx.fillStyle = this.strokeColor;
          ctx.textAlign = "center";
          ctx.font = `bold ${tileSize / 2}pt Courier`;
          ctx.fillText(Char.letters[this.kind].toUpperCase(), 0.5 * tileSize, 0.66 * tileSize);
          ctx.stroke();
      }
      get friend() {
          return this.faction == 1;
      }
      render(ctx) {
          if (this.animatedShot) {
              ctx.lineWidth = 4;
              ctx.beginPath();
              let delta = norm(sub(this.animatedShot[1], this.animatedShot[0]), -20);
              let at = lerp(this.animatedShot[0], this.animatedShot[1], this.animationStage);
              let tail = sum(at, delta);
              var grad = ctx.createLinearGradient(tail[0], tail[1], at[0], at[1]);
              grad.addColorStop(0, `rgba(0,0,0,0)`);
              grad.addColorStop(1, `rgba(0,0,0,1)`);
              ctx.strokeStyle = grad;
              ctx.moveTo(...tail);
              ctx.lineTo(...at);
              ctx.stroke();
              ctx.lineWidth = 1;
              ctx.strokeStyle = "#000";
          }
          ctx.save();
          ctx.translate(...this.screenPos());
          this.renderBody(ctx);
          if (this.ap > 0) {
              ctx.fillStyle = this.strokeColor;
              ctx.beginPath();
              ctx.moveTo(1, 1);
              ctx.lineTo(6, 1);
              ctx.lineTo(1, 6);
              ctx.closePath();
              ctx.fill();
              if (this.ap > 1) {
                  ctx.beginPath();
                  ctx.moveTo(tileSize - 1, 1);
                  ctx.lineTo(tileSize - 6, 1);
                  ctx.lineTo(+tileSize - 1, 6);
                  ctx.closePath();
                  ctx.fill();
              }
          }
          if (this.selected) {
              this.outline(ctx, Math.sin(new Date().getTime() / 100) + 1);
          }
          if (this.hovered) {
              this.outline(ctx, 1.5);
          }
          ctx.restore();
      }
      pathTo(cind) {
          let path = [cind];
          while (true) {
              cind = this.dists[cind][1];
              if (cind < 0)
                  break;
              path.push(cind);
          }
          return path.reverse();
      }
      get strokeColor() {
          return this.friend ? "#00a" : "#a00";
      }
      outline(ctx, width = 2) {
          ctx.save();
          ctx.shadowColor = `rgba(0,0,0,0)`;
          ctx.strokeStyle = this.strokeColor;
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.arc(tileSize / 2, tileSize / 2, tileSize * 0.4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
      }
      get hovered() {
          return this.terrain.hoveredChar == this;
      }
      get selected() {
          return this.terrain.chosen == this;
      }
      get x() {
          return this.cind % this.terrain.w;
      }
      get y() {
          return idiv(this.cind, this.terrain.w);
      }
      to(cind) {
          if (cind == this.cind || !cind)
              return false;
          this.animateWalk(cind);
          delete this.cell.char;
          this.cind = cind;
          this.cell.char = this;
          this.ap -= this.apCost(cind);
          if (this.cell.goody) {
              this.hp = this.maxHP;
              this.cell.goody = 0;
          }
          this.calculate();
          this.cell.calculate();
          return true;
      }
      animateWalk(cind) {
          this.animatedPath = this.pathTo(cind);
          this.animationStage = 0.01;
      }
      get cell() {
          return this.terrain.cells[this.cind];
      }
      reachable(cind) {
          return this.apCost(cind) <= this.ap;
      }
      calculateDists() {
          this.dists = this.terrain.calcDists(this.cind);
      }
      calculate() {
          this.calculateDists();
          //this.calculateFlanking();
          //this.cell.calculate();
      }
      /*calculateFlanking() {
        this.flanking = new Set<number>();
    
        for (let tchar of this.terrain.chars) {
          let tcell = tchar.cell;
          if (tchar.faction == this.faction) continue;
          let theirCover = this.cover(tchar);
          if (theirCover == 0) this.flanking.add(tcell.cind);
          let myCover = tchar.cover(this);
          if (myCover == 0) tchar.flanking.add(this.cind);
        }
      }*/
      cover(target) {
          return this.terrain.cover(this.cell, target.cell);
      }
      get at() {
          return this.terrain.fromCind(this.cind);
      }
      apCost(cind) {
          if (!this.dists)
              return Number.MAX_VALUE;
          let l = this.dists[cind][0];
          let moves = Math.ceil(l / this.move);
          return moves;
      }
      canFire() {
          return this.ap > 0;
      }
      hitChance(target) {
          let cover = this.cover(target);
          if (cover == -1)
              return 0;
          let accuracy = this.gun.accuracy;
          let dodge = target.def;
          let chance = Math.round(accuracy -
              cover * 20 -
              dodge -
              this.gun.accuracyPenalty(this.dist(target)));
          return chance;
      }
      die() {
          this.terrain.chars = this.terrain.chars.filter(c => c.hp > 0);
          delete this.cell.char;
          if (this.team.chars.length == 0) {
              this.terrain.declareVictory(1 - this.faction);
          }
      }
      takeDamage(dmg) {
          this.hp = Math.max(0, this.hp - dmg);
          if (this.hp <= 0) {
              this.die();
          }
          this.terrain.resetCanvasCache();
          this.terrain.game.updateInfo(this.terrain.hoveredChar ? this.terrain.hoveredChar.info() : null);
      }
      get team() {
          return this.terrain.teams[this.faction];
      }
      fire(cell) {
          if (!cell)
              return false;
          let target = cell.char;
          if (!target)
              return false;
          let chance = this.hitChance(target);
          if (chance == 0)
              return false;
          let success = this.terrain.game.rni() % 100 < chance;
          this.ap = 0;
          let text = "MISS";
          if (success) {
              let dmg = this.gun.damageRoll(this, target, this.terrain.game.rnf);
              target.takeDamage(dmg);
              if (target.hp <= 0)
                  this.team.calculate();
              text = `-${dmg}`;
          }
          this.shotText = text;
          this.animateShot(target.cind);
          return true;
      }
      animateShot(target) {
          this.animationStage = 0.01;
          this.animatedShot = [this.cind, target].map(i => this.terrain.cindToCenter(i));
      }
      canDamage(target) {
          return (target &&
              this.faction != target.faction &&
              this.cell.fov.has(target.cind) &&
              this.canFire());
      }
      bestPosition() {
          let team = this.terrain.teams[this.faction];
          this.calculate();
          let bestScore = -100;
          let bestAt;
          for (let i in this.dists) {
              let d = this.dists[i][0];
              if (d > this.move * this.ap)
                  continue;
              //debugger;
              let score = team.strength[i] -
                  team.weakness[i] -
                  idiv(d, this.move) * 0.5 -
                  d * 0.001;
              if (this.kind == Char.ASSAULT)
                  score -= team.distance[i] * 0.1;
              if (this.kind == Char.SNIPER)
                  score += team.distance[i] * 0.1;
              if (score > bestScore) {
                  bestScore = score;
                  bestAt = Number(i);
              }
          }
          return bestAt;
      }
      bestTarget() {
          let bestScore = -100;
          let bestAt = null;
          for (let tchar of this.terrain.chars) {
              if (tchar.faction == this.faction || tchar.hp <= 0)
                  continue;
              let hitChance = this.hitChance(tchar);
              let damageExpected = this.gun.averageDamage(this, tchar);
              let score = hitChance * damageExpected;
              if (score > bestScore) {
                  bestScore = score;
                  bestAt = tchar.cell;
              }
          }
          return bestAt;
      }
      think() {
          return __awaiter(this, void 0, void 0, function* () {
              if (this.to(this.bestPosition()))
                  yield this.terrain.game.waitForAnim();
              if (this.ap > 0) {
                  if (this.fire(this.bestTarget()))
                      yield this.terrain.game.waitForAnim();
              }
          });
      }
      update(dTime) {
          if (this.animationStage) {
              if (this.animatedPath) {
                  this.animationStage += dTime * 10 * this.terrain.animationSpeed;
                  if (this.animationStage > this.animatedPath.length) {
                      this.endAnimation();
                  }
              }
              if (this.animatedShot) {
                  this.animationStage +=
                      dTime * Math.min(10, 1000 / dist(...this.animatedShot) * this.terrain.animationSpeed);
                  if (this.animationStage > 1) {
                      this.terrain.game.text(this.animatedShot[1], this.shotText);
                      this.endAnimation();
                  }
              }
          }
      }
      endAnimation() {
          this.animationStage = 0;
          delete this.animatedPath;
          delete this.animatedShot;
          if (this.terrain.game.blockingAnimationEnd) {
              this.terrain.game.blockingAnimationEnd();
              delete this.terrain.game.blockingAnimationEnd;
          }
      }
      screenPos() {
          if (this.animatedPath) {
              return lerp(this.terrain.cindToScreen(this.animatedPath[Math.floor(this.animationStage)]), this.terrain.cindToScreen(this.animatedPath[Math.floor(this.animationStage)]), this.animationStage % 1);
          }
          else {
              return this.terrain.cindToScreen(this.cind);
          }
      }
      dist(other) {
          return dist(this.at, other.at);
      }
      info() {
          let name = [, "gunner", "assault", "sniper"][this.kind];
          return `${name.toUpperCase()} <b>${this.hp}HP</b> ${lang[name]}`;
      }
  }
  Char.EYE = -1;
  Char.GUNNER = 1;
  Char.ASSAULT = 2;
  Char.SNIPER = 3;
  Char.RECON = 4;
  Char.MEDIC = 5;
  Char.HEAVY = 6;
  Char.COMMANDER = 7;
  Char.RED = 0;
  Char.BLUE = 1;
  Char.letters = "`gasrmhc".split("");

  class Cell {
      constructor(terrain, cind, obstacle, char) {
          this.terrain = terrain;
          this.cind = cind;
          this.obstacle = obstacle;
          this.char = char;
          this.fov = new Set();
          this.povs = new Set();
          this.peeked = new Set();
      }
      renderThreats(ctx) {
          let t = this.terrain;
          let i = this.cind;
          ctx.strokeStyle = "#080";
          ctx.lineWidth = t.teams[Char.RED].strength[i] == 4 ? 3 : 1;
          ctx.beginPath();
          ctx.moveTo(3.5, 3.5);
          ctx.lineTo(3.5, 3.5 + 3 * t.teams[Char.RED].strength[i]);
          ctx.stroke();
          ctx.strokeStyle = "#800";
          ctx.lineWidth = t.teams[Char.RED].weakness[i] == 4 ? 3 : 1;
          ctx.beginPath();
          ctx.moveTo(3.5, 3.5);
          ctx.lineTo(3.5 + 3 * t.teams[Char.RED].weakness[i], 3.5);
          ctx.stroke();
      }
      render(ctx) {
          let t = this.terrain;
          let i = this.cind;
          let sprite = [, Cell.lowTile, Cell.highTile][this.obstacle];
          let c = t.chosen;
          let e = t.cells[t.hoveredTile];
          ctx.save();
          ctx.shadowColor = `rgba(0,0,0,0)`;
          //this.drawThreats(ctx);
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 2;
          if (e && e.fov && !e.fov.has(i) && t.hoveredTile) {
              //ctx.drawImage(Cell.hiddenSprite, 0, 0)
              ctx.fillStyle = `rgba(0,0,0,0.08)`;
              ctx.fillRect(0, 0, tileSize, tileSize);
          }
          if (c && c.dists) {
              ctx.lineWidth = 1;
              let moves = t.chosen.apCost(i);
              if (moves > 0 && moves <= t.chosen.ap) {
                  let img = [, Cell.ap1Sprite, Cell.ap2Sprite][Math.floor(moves)];
                  if (img)
                      ctx.drawImage(img, 0, 0);
              }
          }
          /*if (c && c.cell.povs && c.cell.povs.has(i)) {
            ctx.strokeStyle = "#444";
            ctx.beginPath();
            ctx.arc(tileSize / 2, tileSize / 2, tileSize / 4, 0, Math.PI * 2);
            ctx.stroke();
          }*/
          ctx.restore();
          if (this.goody) {
              ctx.fillStyle = "#080";
              ctx.fillRect(tileSize * 0.35, 0, tileSize * 0.3, tileSize);
              ctx.fillRect(0, tileSize * 0.35, tileSize, tileSize * 0.3);
          }
          if (sprite)
              ctx.drawImage(sprite, 0, 0);
      }
      calculatePovAnCover() {
          if (this.obstacle)
              return;
          this.cover = this.terrain.obstacles(this.cind);
          this.povs = this.terrain.peekSides(this.cind);
      }
      calculateFov() {
          this.fov.clear();
          for (let p of this.povs) {
              for (let i of this.terrain.calculateFov(p)) {
                  this.fov.add(i);
              }
          }
      }
      calculate() {
          this.calculatePovAnCover();
          this.calculateFov();
      }
      get at() {
          return this.terrain.fromCind(this.cind);
      }
      dist(other) {
          return dist(this.at, other.at);
      }
      seal() {
          this.obstacle = 2;
          delete this.char;
          this.goody = 0;
      }
  }
  Cell.dashInterval = 4;
  Cell.ap1Sprite = canvasCache([tileSize, tileSize], ctx => {
      ctx.strokeStyle = "#555";
      ctx.strokeRect(4.5, 4.5, tileSize - 8, tileSize - 8);
  });
  Cell.ap2Sprite = canvasCache([tileSize, tileSize], ctx => {
      ctx.strokeStyle = "#bbb";
      ctx.strokeRect(4.5, 4.5, tileSize - 8, tileSize - 8);
  });
  Cell.hiddenSprite = canvasCache([tileSize, tileSize], ctx => {
      ctx.fillStyle = `rgba(0,0,0,0.12)`;
      ctx.fillRect(0, 0, tileSize, tileSize);
  });
  Cell.dashPattern = canvasCache([Cell.dashInterval, Cell.dashInterval], ctx => {
      for (let i = 0; i < Cell.dashInterval; i++) {
          ctx.fillRect(i, i, 1, 1);
      }
  });
  Cell.crossPattern = canvasCache([3, 3], ctx => {
      for (let i = 0; i < Cell.dashInterval; i++) {
          ctx.fillRect(Cell.dashInterval - i - 1, i, 1, 1);
          ctx.fillRect(i, i, 1, 1);
      }
  });
  Cell.highTile = canvasCache([tileSize, tileSize], ctx => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, tileSize, tileSize);
  });
  Cell.lowTile = canvasCache([tileSize, tileSize], ctx => {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, tileSize, tileSize);
      ctx.fillStyle = ctx.createPattern(Cell.dashPattern, "repeat");
      ctx.fillRect(0, 0, tileSize, tileSize);
  });
  Cell.emptyTile = canvasCache([1, 1], ctx => { });

  //https://gist.github.com/as-f/59bb06ced7e740e11ec7dda9d82717f6#file-shadowcasting-js
  function shadowcast(cx, cy, transparent, reveal) {
      /**
       * Scan one row of one octant.
       * @param y - distance from the row scanned to the center
       * @param start - starting slope
       * @param end - ending slope
       * @param transform - describes the transfrom to apply on x and y; determines the octant
       */
      var scan = function (y, start, end, transform) {
          if (start >= end) {
              return;
          }
          var xmin = Math.round((y - 0.5) * start);
          var xmax = Math.ceil((y + 0.5) * end - 0.5);
          for (var x = xmin; x <= xmax; x++) {
              var realx = cx + transform.xx * x + transform.xy * y;
              var realy = cy + transform.yx * x + transform.yy * y;
              if (transparent(realx, realy)) {
                  if (x >= y * start && x <= y * end) {
                      reveal(realx, realy);
                  }
              }
              else {
                  if (x >= (y - 0.5) * start && x - 0.5 <= y * end) {
                      reveal(realx, realy);
                  }
                  scan(y + 1, start, (x - 0.5) / y, transform);
                  start = (x + 0.5) / y;
                  if (start >= end) {
                      return;
                  }
              }
          }
          scan(y + 1, start, end, transform);
      };
      // An array of transforms, each corresponding to one octant.
      var transforms = [
          { xx: 1, xy: 0, yx: 0, yy: 1 },
          { xx: 1, xy: 0, yx: 0, yy: -1 },
          { xx: -1, xy: 0, yx: 0, yy: 1 },
          { xx: -1, xy: 0, yx: 0, yy: -1 },
          { xx: 0, xy: 1, yx: 1, yy: 0 },
          { xx: 0, xy: 1, yx: -1, yy: 0 },
          { xx: 0, xy: -1, yx: 1, yy: 0 },
          { xx: 0, xy: -1, yx: -1, yy: 0 }
      ];
      reveal(cx, cy);
      // Scan each octant
      for (var i = 0; i < 8; i++) {
          scan(1, 0, 1, transforms[i]);
      }
  }

  class Team {
      constructor(terrain, faction) {
          this.terrain = terrain;
          this.faction = faction;
          this.fov = new Set();
      }
      calculate() {
          this.strength = [];
          this.weakness = [];
          this.distance = [];
          let t = this.terrain;
          this.fov.clear();
          for (let char of this.chars) {
              for (let cell of char.cell.fov)
                  this.fov.add(cell);
          }
          let enemyTeam = this.terrain.teams[1 - this.faction];
          for (let cind of this.fov) {
              let cell = this.terrain.cells[cind];
              for (let enemy of enemyTeam.chars) {
                  let tcell = enemy.cell;
                  let strength = (4 - t.cover(cell, tcell)) % 5;
                  if (!(this.strength[cind] > strength))
                      this.strength[cind] = strength;
                  let weakness = (4 - t.cover(tcell, cell)) % 5;
                  if (!(this.weakness[cind] > weakness))
                      this.weakness[cind] = weakness;
                  if (strength > 0 || weakness > 0) {
                      let distance = cell.dist(tcell);
                      if (!(this.distance[cind] <= distance))
                          this.distance[cind] = distance;
                  }
              }
          }
      }
      think() {
          return __awaiter(this, void 0, void 0, function* () {
              this.calculate();
              for (let char of this.terrain.chars) {
                  if (char.faction == this.faction)
                      yield char.think();
              }
          });
      }
      get chars() {
          return this.terrain.chars.filter(c => c.faction == this.faction);
      }
  }

  const PAI = 0;
  const PP = 1;
  const AIAI = 2;
  class Terrain {
      constructor(game, terrainString) {
          this.game = game;
          this.terrainString = terrainString;
          this.canvasCacheOutdated = false;
          this.mode = PAI;
          this.init(terrainString);
      }
      init(terrainString) {
          let lines = terrainString
              .split("\n")
              .map(s => s.trim())
              .filter(s => s.length > 0);
          this.h = lines.length;
          this.w = Math.max(...lines.map(s => s.length));
          this.cells = [];
          this.chars = [];
          this.teams = [];
          for (let y = 0; y < this.h; y++) {
              this.victor = -1;
              let line = lines[y];
              for (let x = 0; x < this.w; x++) {
                  let cind = x + y * this.w;
                  let char = line[x] || " ";
                  let cell = new Cell(this, cind, ["+", "#"].indexOf(char) + 1, Char.from(this, char, this.cind(x, y)));
                  if (char == "*")
                      cell.goody = 1;
                  this.cells[cind] = cell;
              }
          }
          for (let i = 0; i < this.w; i++) {
              this.seal(i, 0);
              this.seal(i, this.h - 1);
          }
          for (let i = 0; i < this.h; i++) {
              this.seal(0, i);
              this.seal(this.w - 1, i);
          }
          this.dir8Deltas = Terrain.dirs8.map(v => v[0] + v[1] * this.w);
          this.eye = new Char(this, Char.EYE, Char.BLUE, 0);
          for (let c of this.cells) {
              if (!c.obstacle)
                  c.calculatePovAnCover();
          }
          for (let c of this.cells) {
              if (!c.obstacle)
                  c.calculate();
          }
          for (let i = 0; i < 2; i++) {
              let team = new Team(this, i);
              this.teams[i] = team;
          }
          this.updateCanvasCache();
      }
      seal(x, y) {
          this.cells[this.cind(x, y)].seal();
      }
      update(dTime) {
          for (let c of this.chars)
              c.update(dTime);
      }
      render(ctx) {
          if (!this.canvasCache || this.canvasCacheOutdated)
              this.updateCanvasCache();
          ctx.clearRect(0, 0, this.w * tileSize, this.h * tileSize);
          ctx.drawImage(this.canvasCache, 0, 0);
          this.renderPath(this.hoveredTile);
          for (let c of this.chars) {
              c.render(ctx);
          }
          //this.renderHovered(ctx)
      }
      renderHovered(ctx) {
          let hov = this.cindToScreen(this.hoveredTile);
          ctx.strokeStyle = "#888";
          ctx.lineWidth = 1;
          ctx.strokeRect(hov[0] + 0.5, hov[1] + 0.5, tileSize, tileSize);
      }
      calcDists(x, y) {
          if (isNaN(+x))
              x = this.chosen.cind;
          let fromi = isNaN(+y) ? x : this.cind(x, y);
          let dists = this.cells.map(_ => [Number.MAX_VALUE, -1]);
          dists[fromi] = [0, -1];
          let todo = [fromi];
          while (todo.length > 0) {
              let curi = todo.shift();
              let curl = dists[curi][0];
              for (let dir = 0; dir < 8; dir++) {
                  let diagonal = dir % 2;
                  let nexti = this.dir8Deltas[dir] + curi;
                  let blocked = !!(this.cells[nexti].obstacle || this.cells[nexti].char);
                  if (diagonal &&
                      (this.cells[curi + this.dir8Deltas[(dir + 1) % 8]].obstacle ||
                          this.cells[curi + this.dir8Deltas[(dir + 7) % 8]].obstacle))
                      blocked = true;
                  if (!blocked) {
                      let next = dists[nexti];
                      let plusl = diagonal ? 1.414 : 1;
                      if (next[0] > curl + plusl) {
                          dists[nexti] = [curl + plusl, curi];
                          todo.push(nexti);
                      }
                  }
              }
          }
          return dists;
      }
      cind(x, y) {
          return x + y * this.w;
      }
      cindScreen(x, y) {
          return this.cind(idiv(x, tileSize), idiv(y, tileSize));
      }
      cellAt(x, y) {
          return this.cells[this.cind(x, y)];
      }
      cellAtScreen(x, y) {
          return this.cells[this.cindScreen(x, y)];
      }
      click(x, y) {
          let cind = this.cindScreen(x, y);
          this.clickCell(cind);
          this.resetCanvasCache();
      }
      canPlayAs(char) {
          return char.faction == Char.BLUE || this.mode != PAI;
      }
      clickCell(cind) {
          let cell = this.cells[cind];
          if (!cell)
              return;
          if (cell.char) {
              if (this.chosen &&
                  this.chosen.faction == cell.char.faction &&
                  this.canPlayAs(cell.char)) {
                  this.chosen = cell.char;
                  this.chosen.calculate();
                  return;
              }
              if (this.chosen && this.chosen.canDamage(cell.char)) {
                  this.chosen.fire(cell);
                  return;
              }
              if (this.chosen == cell.char) {
                  this.cancel();
              }
              else {
                  if (this.canPlayAs(cell.char))
                      this.chosen = cell.char;
              }
              if (this.chosen) {
                  this.chosen.calculate();
              }
          }
          if (!cell.char && this.chosen && this.chosen.reachable(cind)) {
              this.chosen.to(cind);
              this.teams[Char.RED].calculate();
          }
          this.eye.faction = this.chosen ? this.chosen.faction : Char.BLUE;
          this.resetCanvasCache();
      }
      hover(x, y) {
          let hover = this.cindScreen(x, y);
          if (this.hoveredTile != hover) {
              this.hoveredTile = hover;
              let cell = this.cells[hover];
              if (!cell)
                  return;
              let cursor = "default";
              if ((this.chosen && this.chosen.reachable(hover)) || cell.char)
                  cursor = "pointer";
              if (cell.char) {
                  this.game.updateInfo(cell.char.info());
              }
              else {
                  this.game.updateInfo();
              }
              if (this.chosen && this.chosen.canDamage(cell.char)) {
                  cursor = "crosshair";
                  this.game.updateTooltip(this.cindToCenter(cell.cind), `${this.chosen.hitChance(cell.char)}% ${this.chosen.gun
                    .averageDamage(this.chosen, cell.char)
                    .toFixed(1)}`);
              }
              else {
                  this.game.updateTooltip();
              }
              document.body.style.cursor = cursor;
              if (cell.obstacle == 0) {
                  this.eye.cind = hover;
                  this.eye.calculate();
                  if (cell) {
                      this.hoveredChar = cell.char;
                  }
                  else
                      delete this.hoveredChar;
                  this.resetCanvasCache();
              }
          }
      }
      fromCind(ind) {
          return [ind % this.w, idiv(ind, this.w)];
      }
      renderPath(cind) {
          let char = this.chosen;
          let cell = char ? char.cell : null;
          if (isNaN(+cind) ||
              !char ||
              !cell ||
              !char.dists ||
              !char.dists[cind] ||
              char.dists[cind][1] == -1)
              return;
          if (!char.reachable(cind))
              return;
          let ctx = this.game.ctx;
          let end = this.cindToCenter(cind);
          ctx.beginPath();
          if (char.reachable(cind))
              ctx.arc(end[0], end[1], tileSize / 4, 0, Math.PI * 2);
          else {
              ctx.moveTo(end[0] - tileSize / 4, end[1] - tileSize / 4);
              ctx.lineTo(end[0] + tileSize / 4, end[1] + tileSize / 4);
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(end[0] - tileSize / 4, end[1] + tileSize / 4);
              ctx.lineTo(end[0] + tileSize / 4, end[1] - tileSize / 4);
          }
          ctx.stroke();
          let path = char.pathTo(cind);
          ctx.beginPath();
          ctx.moveTo(...this.cindToCenter(path[0]));
          for (let i of path)
              ctx.lineTo(...this.cindToCenter(i));
          ctx.stroke();
      }
      cindToScreen(ind) {
          return this.fromCind(ind).map(a => a * tileSize);
      }
      cindToCenter(ind) {
          return this.fromCind(ind).map(a => (a + 0.5) * tileSize);
      }
      calculateFov(cind) {
          let [x, y] = this.fromCind(cind);
          let visibility = new Set();
          shadowcast(x, y, (x, y) => this.cellAt(x, y).obstacle < 2, (x, y) => {
              for (let pov of this.cells[this.cind(x, y)].peeked)
                  visibility.add(pov);
          });
          return visibility;
      }
      resetCanvasCache() {
          this.canvasCacheOutdated = true;
      }
      updateCanvasCache() {
          if (!this.canvasCache)
              this.canvasCache = createCanvas(this.w * tileSize, this.h * tileSize);
          let ctx = this.canvasCache.getContext("2d");
          ctx.save();
          ctx.clearRect(0, 0, this.w * tileSize, this.h * tileSize);
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
          ctx.shadowColor = "#444";
          for (let i = 0; i < this.cells.length; i++) {
              let cell = this.cells[i];
              ctx.save();
              ctx.translate(...this.cindToScreen(i));
              cell.render(ctx);
              ctx.restore();
          }
          ctx.restore();
          this.canvasCacheOutdated = false;
      }
      cancel() {
          delete this.chosen;
          this.resetCanvasCache();
      }
      peekSides(cind) {
          let peeks = new Set();
          for (let dir = 0; dir < 8; dir += 2) {
              let forward = cind + this.dir8Deltas[dir];
              if (!this.cells[forward].obstacle)
                  continue;
              let left = [
                  cind + this.dir8Deltas[(dir + 6) % 8],
                  cind + this.dir8Deltas[(dir + 7) % 8]
              ];
              let right = [
                  cind + this.dir8Deltas[(dir + 2) % 8],
                  cind + this.dir8Deltas[(dir + 1) % 8]
              ];
              for (let side of [left, right]) {
                  let peekable = this.cells[side[0]].obstacle == 0 &&
                      this.cells[side[1]].obstacle <= 1;
                  if (peekable) {
                      peeks.add(side[0]);
                  }
              }
          }
          peeks.add(cind);
          for (let c of peeks) {
              this.cells[c].peeked.add(cind);
          }
          return peeks;
      }
      obstacles(cind) {
          let obstacles = [];
          for (let dir = 0; dir < 8; dir += 2) {
              let forward = cind + this.dir8Deltas[dir];
              obstacles.push(this.cells[forward].obstacle);
          }
          return obstacles;
      }
      cover(from, target) {
          let visible = from.fov.has(target.cind);
          if (!visible)
              return -1;
          let worstCover = 2;
          for (let pov of from.povs) {
              let bestCover = 0;
              let delta = sub(target.at, this.fromCind(pov));
              for (let i = 0; i < 4; i++) {
                  let cover = target.cover[i];
                  if (cover <= bestCover)
                      continue;
                  let dot$1 = dot(Terrain.dirs8[i * 2], delta);
                  if (dot$1 < -0.001)
                      bestCover = cover;
              }
              if (bestCover < worstCover)
                  worstCover = bestCover;
          }
          return worstCover;
      }
      endTurn() {
          return __awaiter(this, void 0, void 0, function* () {
              delete this.chosen;
              this.game.busy = true;
              this.updateCanvasCache();
              if (this.mode == AIAI)
                  yield this.teams[Char.BLUE].think();
              if (this.mode != PP)
                  yield this.teams[Char.RED].think();
              for (let c of this.chars) {
                  c.ap = 2;
              }
              this.updateCanvasCache();
              this.game.busy = false;
          });
      }
      toggleMode() {
          this.mode = (this.mode + 1) % 3;
          return ["[P+AI] 2P 2AI", "P+AI [2P] 2AI", "P+AI 2P [2AI]"][this.mode];
      }
      setMode(m) {
          this.mode = m;
      }
      get animationSpeed() {
          return this.game.busy ? 0.5 : 1.5;
      }
      declareVictory(side) {
          this.victor = side;
      }
  }
  Terrain.dirs8 = [
      [0, -1],
      [1, -1],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1]
  ];

  class FX {
      constructor(game) {
          this.game = game;
          game.fx.push(this);
      }
      update(dTime) {
          return false;
      }
      render(ctx) { }
  }

  class MovingText extends FX {
      constructor(game, text, color, lifeTime, at, vel = [0, 0]) {
          super(game);
          this.text = text;
          this.color = color;
          this.lifeTime = lifeTime;
          this.at = at;
          this.vel = vel;
          this.time = 0;
      }
      update(dTime) {
          this.time += dTime;
          this.at = sum(this.at, this.vel, dTime);
          return this.time < this.lifeTime;
      }
      render(ctx) {
          ctx.save();
          ctx.fillStyle = this.color;
          ctx.shadowColor = `black`;
          ctx.shadowBlur = 1;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
          ctx.font = `12pt "Courier"`;
          ctx.textAlign = "center";
          let y = 0;
          let l = 0;
          for (let line of this.text.split("|")) {
              ctx.fillText(line.trim().substr(0, Math.floor(this.time * 70) - l), this.at[0], this.at[1] + y);
              l += line.length;
              y += 20;
          }
          ctx.restore();
      }
  }

  class Game {
      constructor(canvas, updateUI, terrainString) {
          this.canvas = canvas;
          this.updateUI = updateUI;
          this.time = 0;
          this.fx = [];
          this.busy = false;
          this.rni = random(1);
          this.rnf = () => (this.rni() % 1e9) / 1e9;
          this.ctx = canvas.getContext("2d");
          this.ctx.imageSmoothingEnabled = false;
          this.tooltip = document.getElementById("tooltip");
          this.info = document.getElementById("info");
          if (!terrainString)
              terrainString = `
      ##################################################
      #      #  a      ++++# + #    ++#  s             #
      # #    #  +         +#   #    ++#  ++++++++      #
      #      +  +         +#   #    ++#  ++++++++      #
      #S#    +  +         +# * #      #                #
      #      #  +          #   #      #                #
      # #    #             #   #     a#                #
      #      #  +          ## ## ######                #
      #             *                                  #
      #                                                #
      #A#    #             #s         #a               #
      #      #  +          #          #                #
      #A#    #  #      #a  #  ###    ++                #
      #      #  #      #   #  #      ++       *        #
      #G#    #  ########   #  #      +#                #
      #      #             #          #                #
      # #    ######  ###########  #####                #
      #      #++++      ++ # +        #                #
      #S#    #+            # +   ++   +                #
      #      #            +#          #                #
      #         ######g    #       +  #                #
      #         ######g    #####  #####                #
      #                    #   g      #      #        +#
      #      #          +  #                         ++#
      #G#    #+    *       #+++    +++#   #     #    ++#
      #      #++      +    #          #g               #
      # #    ######++###########++##########    ########
      #                 S+                             #
      #         +              A+                      #
      ##################################################
      `;
          this.terrain = new Terrain(this, terrainString);
          this.width = this.canvas.clientWidth;
          this.height = this.canvas.clientHeight;
          this.canvas.height = this.height;
          this.canvas.width = this.width;
      }
      over() {
          return false;
      }
      update(timeStamp) {
          if (!this.lastLoopTimeStamp)
              this.lastLoopTimeStamp = timeStamp - 0.001;
          let dTime = Math.min(0.02, (timeStamp - this.lastLoopTimeStamp) / 1000);
          this.lastLoopTimeStamp = timeStamp;
          this.time += dTime;
          this.terrain.update(dTime);
          this.fx = this.fx.filter(sfx => sfx.update(dTime));
          this.render();
          if (this.over())
              this.updateUI();
      }
      render() {
          let ctx = this.ctx;
          ctx.clearRect(0, 0, this.width, this.height);
          this.terrain.render(ctx);
          for (let fx of this.fx)
              fx.render(ctx);
      }
      text(from, text) {
          let at = sum(from, [0, -10]);
          console.log(at);
          new MovingText(this, text, "#f00", 3, at, [0, -10]);
      }
      waitForAnim() {
          return new Promise(resolve => {
              this.blockingAnimationEnd = () => resolve();
          });
      }
      updateTooltip(at, text) {
          this.tooltip.style.display = at ? "block" : "none";
          if (at) {
              this.tooltip.style.left = (at[0] +
                  30 +
                  this.canvas.offsetLeft).toString();
              this.tooltip.style.top = at[1].toString();
              this.tooltip.innerHTML = text;
          }
      }
      updateInfo(text) {
          this.info.innerHTML = text || (this.terrain.victor >= 0 ? `<H3 style="background:${["RED", "BLUE"][this.terrain.victor]}">${["RED", "BLUE"][this.terrain.victor]} side victorious</H3>` : "");
      }
  }
  /*
      ##################################################
      #                                                #
      #+++++++G                                        #
      #                                                #
      #                                                #
      # s    ###        +                              #
      # ++              +    g                         #
      #  + a++++        ++++++                         #
      #  +                                             #
      #                      A         S               #
      #                               #                #
      #                                                #
      #   ####                                         #
      #                                                #
      #                  a#                            #
      #                   #                            #
      #             ++++++#                            #
      #                   #                            #
      #           #########                            #
      #           +                                    #
      #                                                #
      #                                                #
      #                                                #
      #                                                #
      #                                                #
      #                                                #
      #                                                #
      #                                                #
      #                                                #
      ##################################################
  */
  /*
  `
        ##################################################
        #      #  a      ++++# + #    ++#  s             #
        # #    #  +         +#   #    ++#  ++++++++      #
        #      +  +         +#   #    ++#  ++++++++      #
        #S#    +  +         +# * #      #                #
        #      #  +          #   #      #                #
        # #    #             #   #     a#                #
        #      #  +          ## ## ######                #
        #             *                                  #
        #                                                #
        #A#    #             #s         #a               #
        #      #  +          #          #                #
        #A#    #  #      #a  #  ###    ++                #
        #      #  #      #   #  #      ++       *        #
        #G#    #  ########   #  #      +#                #
        #      #             #          #                #
        # #    ######  ###########  #####                #
        #      #++++      ++ # +        #                #
        #S#    #+            # +   ++   +                #
        #      #            +#          #                #
        #         ######g    #       +  #                #
        #         ######g    #####  #####                #
        #                    #   g      #      #        +#
        #      #          +  #                         ++#
        #G#    #+    *       #+++    +++#   #     #    ++#
        #      #++      +    #          #g               #
        # #    ######++###########++##########    ########
        #                 S+                             #
        #         +              A+                      #
        ##################################################
        `
  */

  let mouseAt;
  let c;
  let game;
  let paused = false;
  let pageButtons;
  let modeButtons;
  let pages;
  let page = 0;
  let mode = 0;
  let editArea;
  let endButton;
  function gameUpdated(g) {
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
          }
          else {
              modeButtons[i].classList.remove("pressed");
          }
      }
      for (let i = 0; i < 3; i++) {
          if (i == page) {
              pageButtons[i].classList.add("pressed");
              pages[i].style.display = "block";
          }
          else {
              pageButtons[i].classList.remove("pressed");
              pages[i].style.display = "none";
          }
      }
      endButton.innerHTML = page == 0 ? "End Turn" : "Apply";
      endButton.style.visibility = page == 1 ? "hidden" : "visible";
  }
  window.onload = function () {
      c = document.getElementById("main");
      endButton = document.getElementById("endb");
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
          if (page == 0) {
              game.terrain.endTurn();
          }
          if (page == 2) {
              game.terrain.init(editArea.value);
              page = 0;
              updateButtons();
          }
      };
      editArea = document.getElementById("edit-area");
      /*let modeButton = document.getElementById("mode");
      modeButton.onclick = e => {
        modeButton.innerHTML = game.terrain.toggleMode();
      };*/
      c.addEventListener("mousedown", e => {
          if (e.button == 2) {
              console.log(game.terrain);
              game.terrain.cancel();
          }
          else {
              game.terrain.click(e.offsetX, e.offsetY);
          }
      });
      c.addEventListener("mousemove", e => {
          game.terrain.hover(e.offsetX, e.offsetY);
      });
      c.addEventListener("mouseleave", e => {
          delete game.terrain.hoveredTile;
          game.terrain.updateCanvasCache();
      });
      c.addEventListener("mouseenter", e => {
      });
      c.addEventListener("contextmenu", function (e) {
          e.preventDefault();
      }, false);
      document.addEventListener("keyup", e => { });
      document.addEventListener("keydown", e => { });
      eachFrame(time => {
          if (game && !paused && !game.over())
              game.update(time);
          if (page == 0)
              endButton.style.visibility = game.busy ? "hidden" : "visible";
      });
      gameUpdated(game);
      console.log(game.terrain.terrainString);
      editArea.value = game.terrain.terrainString;
  };

  exports.mouseAt = mouseAt;

  return exports;

}({}));
