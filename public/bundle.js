var app = (function (exports) {
  'use strict';

  function min(list, fn) {
      let minV = Number.MAX_VALUE;
      let minI = -1;
      for (let i = 0; i < list.length; i++) {
          let v = fn(list[i]);
          if (minV > v) {
              minV = v;
              minI = i;
          }
      }
      if (minI >= 0)
          return { ind: minI, item: list[minI], val: minV };
  }
  function max(list, fn) {
      let r = min(list, t => -fn(t));
      if (!r)
          return;
      r.val = -r.val;
      return r;
  }
  function createCanvas(w, h) {
      //const canvas = new OffscreenCanvas(w,h);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      return canvas;
  }
  function canvasCache(size, draw) {
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
  function scale(v, n) {
      return [v[0] * n, v[1] * n];
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

  class Cell {
      constructor(terrain, cid, obstacle, unit) {
          this.terrain = terrain;
          this.cid = cid;
          this.obstacle = obstacle;
          this.unit = unit;
          this.xfov = new Set(); /* FOV with respect of peek-out */
          this.dfov = new Set(); /* direct FOV */
          this.povs = [];
          this.peeked = [];
      }
      calculatePovAnCover() {
          if (this.obstacle)
              return;
          this.cover = this.terrain.obstacles(this.cid);
          this.peekSides();
      }
      calculateFov() {
          if (this.opaque)
              return;
          let t = this.terrain;
          let [x, y] = this.at;
          let visibility = new Set();
          shadowcast(x, y, (x, y) => !t.cellAt(x, y).opaque, (x, y) => {
              visibility.add(t.cid(x, y));
          });
          this.dfov = visibility;
      }
      calculateXFov() {
          let visibility = new Set();
          for (let p of this.povs) {
              for (let visible of p.dfov) {
                  let visibleTile = this.terrain.cells[visible];
                  for (let neighbor of visibleTile.peeked)
                      visibility.add(neighbor.cid);
              }
          }
          this.xfov = visibility;
      }
      get at() {
          return this.terrain.fromCid(this.cid);
      }
      dist(other) {
          return dist(this.at, other.at);
      }
      seal() {
          this.obstacle = 2;
          delete this.unit;
          this.goody = 0;
      }
      get opaque() {
          return this.obstacle == 2;
      }
      peekSides() {
          this.povs = [];
          let t = this.terrain;
          let cid = this.cid;
          this.povs.push(this);
          for (let dir = 0; dir < 8; dir += 2) {
              let forward = cid + t.dir8Deltas[dir];
              if (!t.cells[forward].obstacle)
                  continue;
              let left = [
                  cid + t.dir8Deltas[(dir + 6) % 8],
                  cid + t.dir8Deltas[(dir + 7) % 8]
              ];
              let right = [
                  cid + t.dir8Deltas[(dir + 2) % 8],
                  cid + t.dir8Deltas[(dir + 1) % 8]
              ];
              for (let side of [left, right]) {
                  let peekable = t.cells[side[0]].obstacle == 0 && t.cells[side[1]].obstacle <= 1;
                  if (peekable) {
                      this.povs.push(t.cells[side[0]]);
                  }
              }
          }
          for (let c of this.povs) {
              c.peeked.push(this);
          }
      }
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
      averageDamage(by, target, cell) {
          if (!cell)
              cell = target.cell;
          let dmg = (this.damage[1] + this.damage[0]) * 0.5;
          dmg -= Math.max(0, target.armor - this.breach);
          dmg -= this.damagePenalty(by.dist(cell));
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
          for (let unit of this.units) {
              for (let cell of unit.cell.xfov)
                  this.fov.add(cell);
          }
          let enemyTeam = this.terrain.teams[1 - this.faction];
          for (let cid of this.fov) {
              let cell = this.terrain.cells[cid];
              for (let enemy of enemyTeam.units) {
                  let tcell = enemy.cell;
                  let strength = (4 - t.cover(cell, tcell)) % 5;
                  if (!(this.strength[cid] > strength))
                      this.strength[cid] = strength;
                  let weakness = (4 - t.cover(tcell, cell)) % 5;
                  if (!(this.weakness[cid] > weakness))
                      this.weakness[cid] = weakness;
                  if (strength > 0 || weakness > 0) {
                      let distance = cell.dist(tcell);
                      if (!(this.distance[cid] <= distance))
                          this.distance[cid] = distance;
                  }
              }
          }
      }
      think() {
          return __awaiter(this, void 0, void 0, function* () {
              this.terrain.aiTurn = true;
              this.calculate();
              for (let unit of this.terrain.units) {
                  if (unit.team == this) {
                      yield unit.think();
                  }
              }
              this.terrain.aiTurn = false;
          });
      }
      get units() {
          return this.terrain.units.filter(c => c.team == this);
      }
      get enemy() {
          return this.terrain.teams[1 - this.faction];
      }
      get name() {
          return ["RED", "BLUE"][this.faction];
      }
      get color() {
          return ["RED", "BLUE"][this.faction];
      }
  }
  Team.RED = 0;
  Team.BLUE = 1;

  class Unit {
      constructor(terrain, kind, team, cid, gun = new Gun()) {
          this.terrain = terrain;
          this.kind = kind;
          this.team = team;
          this.cid = cid;
          this.gun = gun;
          this.speed = 5;
          this.maxHP = 10;
          this.hp = this.maxHP;
          this.ap = 2;
          this.armor = 0;
          this.sight = 20;
          this.def = 0;
          if (kind != Unit.EYE)
              terrain.units.push(this);
          switch (kind) {
              case Unit.GUNNER:
                  this.speed = 4;
                  this.hp = 14;
                  break;
              case Unit.ASSAULT:
                  this.speed = 6;
                  this.armor = 1;
                  this.gun = Gun.SHOTGUN;
                  break;
              case Unit.SNIPER:
                  this.hp = 7;
                  this.def = 10;
                  this.gun = Gun.SNIPER;
                  break;
          }
          //console.log(this);
          this.maxHP = this.hp;
      }
      static from(terrain, letter, cid) {
          let io = Unit.letters.indexOf(letter);
          if (io >= 0)
              return new Unit(terrain, io, terrain.teams[Team.RED], cid);
          io = Unit.letters.indexOf(letter.toLowerCase());
          if (io >= 0)
              return new Unit(terrain, io, terrain.teams[Team.BLUE], cid);
      }
      //sprites: { [key: number]: OffscreenCanvas } = {};
      get blue() {
          return this.team == this.terrain.we;
      }
      pathTo(to) {
          let cid = to.cid;
          let path = [cid];
          while (true) {
              cid = this.dists[cid][1];
              if (cid < 0)
                  break;
              path.push(cid);
          }
          return path.reverse().map(cid => this.terrain.cells[cid]);
      }
      get strokeColor() {
          return this.blue ? "#00a" : "#a00";
      }
      get x() {
          return this.cid % this.terrain.w;
      }
      get y() {
          return idiv(this.cid, this.terrain.w);
      }
      get cell() {
          return this.terrain.cells[this.cid];
      }
      reachable(cell) {
          return this.apCost(cell) <= this.ap;
      }
      calculateDists() {
          this.dists = this.terrain.calcDists(this.cid);
      }
      calculate() {
          this.calculateDists();
      }
      cover(target) {
          return this.terrain.cover(this.cell, target);
      }
      get at() {
          return this.terrain.fromCid(this.cid);
      }
      apCost(cell) {
          if (!this.dists)
              return Number.MAX_VALUE;
          let l = this.dists[cell.cid][0];
          let moves = Math.ceil(l / this.speed);
          return moves;
      }
      canShoot() {
          return this.ap > 0;
      }
      hitChance(target, cell) {
          if (!this.cell.xfov.has((cell || target.cell).cid))
              return 0;
          let cover = this.cover(cell || target.cell);
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
          this.terrain.units = this.terrain.units.filter(c => c.hp > 0);
          delete this.cell.unit;
          if (this.team.units.length == 0) {
              this.terrain.declareVictory(this.team.enemy);
          }
      }
      takeDamage(dmg) {
          this.hp = Math.max(0, this.hp - dmg);
          if (this.hp <= 0) {
              this.die();
          }
          this.onChange();
      }
      onChange() {
          this.terrain.animate({ char: this });
      }
      shoot(cell) {
          return __awaiter(this, void 0, void 0, function* () {
              if (!cell)
                  return false;
              let target = cell.unit;
              if (!target)
                  return false;
              let chance = this.hitChance(target);
              if (chance == 0)
                  return false;
              let success = this.terrain.rni() % 100 < chance;
              this.ap = 0;
              let dmg = 0;
              if (success) {
                  dmg = this.gun.damageRoll(this, target, this.terrain.rnf);
              }
              yield this.animateShoot(target.cid, dmg);
              target.takeDamage(dmg);
              if (target.hp <= 0)
                  this.team.calculate();
              return true;
          });
      }
      teleport(to) {
          if (this.cell.cid == to.cid)
              return;
          delete this.cell.unit;
          this.cid = to.cid;
          this.cell.unit = this;
          this.calculate();
      }
      move(to) {
          return __awaiter(this, void 0, void 0, function* () {
              if (to == this.cell || !to)
                  return false;
              this.ap -= this.apCost(to);
              let path = this.pathTo(to);
              let enemies = this.team.enemy.units;
              let owPoints = [];
              for (let enemy of enemies) {
                  if (enemy.ap == 0)
                      continue;
                  let bestMoment = max(path, step => enemy.averageDamage(this, step));
                  if (bestMoment && bestMoment.val > 0) {
                      owPoints.push({ moment: bestMoment.ind, enemy });
                  }
              }
              owPoints = owPoints.sort((a, b) => (a.moment > b.moment ? 1 : -1));
              for (let owPoint of owPoints) {
                  let place = path[owPoint.moment];
                  yield this.animateWalk(this.pathTo(place));
                  this.teleport(place);
                  yield owPoint.enemy.shoot(place);
              }
              yield this.animateWalk(this.pathTo(to));
              this.teleport(to);
              if (this.cell.goody) {
                  this.hp = this.maxHP;
                  this.cell.goody = 0;
              }
              return true;
          });
      }
      animateWalk(path) {
          return __awaiter(this, void 0, void 0, function* () {
              if (path.length <= 1)
                  return;
              yield this.terrain.animate({ anim: "walk", char: this, path });
          });
      }
      animateShoot(tcid, damage) {
          return __awaiter(this, void 0, void 0, function* () {
              yield this.terrain.animate({
                  anim: "shoot",
                  from: this.cid,
                  to: tcid,
                  damage
              });
          });
      }
      canDamage(target) {
          return (target &&
              this.team != target.team &&
              this.cell.xfov.has(target.cid) &&
              this.canShoot());
      }
      bestPosition() {
          let team = this.team;
          this.calculate();
          let bestScore = -100;
          let bestAt;
          for (let i in this.dists) {
              let d = this.dists[i][0];
              if (d > this.speed * this.ap)
                  continue;
              let score = team.strength[i] -
                  team.weakness[i] -
                  idiv(d, this.speed) * 0.5 -
                  d * 0.001;
              if (this.kind == Unit.ASSAULT)
                  score -= team.distance[i] * 0.1;
              if (this.kind == Unit.SNIPER)
                  score += team.distance[i] * 0.1;
              if (score > bestScore) {
                  bestScore = score;
                  bestAt = Number(i);
              }
          }
          return this.terrain.cells[bestAt];
      }
      averageDamage(tchar, cell) {
          let hitChance = this.hitChance(tchar, cell);
          return hitChance * this.gun.averageDamage(this, tchar, cell);
      }
      bestTarget() {
          let bestScore = -100;
          let bestAt = null;
          for (let tchar of this.terrain.units) {
              if (tchar.team == this.team || tchar.hp <= 0)
                  continue;
              let score = this.averageDamage(tchar);
              if (score > bestScore) {
                  bestScore = score;
                  bestAt = tchar.cell;
              }
          }
          return bestAt;
      }
      think() {
          return __awaiter(this, void 0, void 0, function* () {
              yield this.move(this.bestPosition());
              if (this.ap > 0) {
                  yield this.shoot(this.bestTarget());
              }
          });
      }
      dist(other) {
          return dist(this.at, other.at);
      }
      info() {
          let name = [, "gunner", "assault", "sniper"][this.kind];
          return `${name.toUpperCase()} <b>${this.hp}HP</b> ${lang[name]}`;
      }
      get alive() {
          return this.hp > 0;
      }
  }
  Unit.EYE = -1;
  Unit.GUNNER = 1;
  Unit.ASSAULT = 2;
  Unit.SNIPER = 3;
  Unit.RECON = 4;
  Unit.MEDIC = 5;
  Unit.HEAVY = 6;
  Unit.COMMANDER = 7;
  Unit.letters = "`gasrmhc".split("");

  class Terrain {
      constructor(terrainString, animate) {
          this.terrainString = terrainString;
          this.animate = animate;
          this.aiTurn = false;
          this.rni = random(1);
          this.rnf = () => (this.rni() % 1e9) / 1e9;
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
          this.units = [];
          this.teams = [];
          for (let i = 0; i < 2; i++) {
              let team = new Team(this, i);
              this.teams[i] = team;
          }
          for (let y = 0; y < this.h; y++) {
              delete this.victor;
              let line = lines[y];
              for (let x = 0; x < this.w; x++) {
                  let cid = x + y * this.w;
                  let unit = line[x] || " ";
                  let cell = new Cell(this, cid, ["+", "#"].indexOf(unit) + 1, Unit.from(this, unit, this.cid(x, y)));
                  if (unit == "*")
                      cell.goody = 1;
                  this.cells[cid] = cell;
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
          for (let c of this.cells) {
              if (!c.obstacle)
                  c.calculatePovAnCover();
          }
          for (let c of this.cells) {
              if (!c.obstacle) {
                  c.calculatePovAnCover();
                  c.calculateFov();
              }
          }
          for (let c of this.cells) {
              if (!c.obstacle)
                  c.calculateXFov();
          }
      }
      seal(x, y) {
          this.cells[this.cid(x, y)].seal();
      }
      calcDists(x, y) {
          let fromi = isNaN(+y) ? x : this.cid(x, y);
          let dists = this.cells.map(_ => [Number.MAX_VALUE, -1]);
          dists[fromi] = [0, -1];
          let todo = [fromi];
          while (todo.length > 0) {
              let curi = todo.shift();
              let curl = dists[curi][0];
              for (let dir = 0; dir < 8; dir++) {
                  let diagonal = dir % 2;
                  let nexti = this.dir8Deltas[dir] + curi;
                  let blocked = !!(this.cells[nexti].obstacle || this.cells[nexti].unit);
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
      cid(x, y) {
          return x + y * this.w;
      }
      cellAt(x, y) {
          return this.cells[this.cid(x, y)];
      }
      fromCid(ind) {
          return [ind % this.w, idiv(ind, this.w)];
      }
      calculateFov(cid) {
          let [x, y] = this.fromCid(cid);
          let visibility = new Set();
          shadowcast(x, y, (x, y) => !this.cellAt(x, y).opaque, (x, y) => {
              for (let pov of this.cells[this.cid(x, y)].peeked)
                  visibility.add(pov.cid);
          });
          return visibility;
      }
      calculateDirectFov(cid) {
          let [x, y] = this.fromCid(cid);
          let visibility = new Set();
          shadowcast(x, y, (x, y) => !this.cellAt(x, y).opaque, (x, y) => {
              visibility.add(this.cid(x, y));
          });
          return visibility;
      }
      obstacles(cid) {
          let obstacles = [];
          for (let dir = 0; dir < 8; dir += 2) {
              let forward = cid + this.dir8Deltas[dir];
              obstacles.push(this.cells[forward].obstacle);
          }
          return obstacles;
      }
      cover(from, target) {
          let visible = from.xfov.has(target.cid);
          if (!visible)
              return -1;
          let worstCover = 2;
          for (let pov of from.povs) {
              let bestCover = 0;
              let delta = sub(target.at, pov.at);
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
      declareVictory(team) {
          this.victor = team;
      }
      get we() {
          return this.teams[Team.BLUE];
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

  const tileSize = 24;

  class MovingText {
      constructor(text, color, lifeTime, at, vel = [0, 0]) {
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

  const dashInterval = 4;
  class Doll {
      constructor(unit, renderer) {
          this.unit = unit;
          this.at = renderer.cidToScreen(unit.cid);
      }
  }
  class RenderSchematic {
      constructor(game, canvas) {
          this.game = game;
          this.canvas = canvas;
          this.canvasCacheOutdated = false;
          this.anim = [];
          this.animQueue = [];
          this.dolls = [];
          this.dollCache = {};
          this.width = this.canvas.clientWidth;
          this.height = this.canvas.clientHeight;
          this.canvas.height = this.height;
          this.canvas.width = this.width;
          this.synch();
          this.updateCanvasCache();
      }
      synch() {
          this.dolls = this.terrain.units.map(unit => new Doll(unit, this));
      }
      get terrain() {
          return this.game.terrain;
      }
      update(dTime) {
          let anims = this.anim;
          this.anim = [];
          anims = anims.filter(fx => {
              return fx.update(dTime);
          });
          this.anim = this.anim.concat(anims);
          if (this.animQueue.length > 0 && !this.animQueue[0].update(dTime))
              this.animQueue.shift();
          if (this.animQueue.length == 0 && this.blockingAnimationEnd) {
              this.blockingAnimationEnd();
              delete this.blockingAnimationEnd;
          }
          this.dolls = this.dolls.filter(d => d.unit.alive);
      }
      render(ctx) {
          ctx.clearRect(0, 0, this.width, this.height);
          let t = this.terrain;
          if (!this.canvasCache || this.canvasCacheOutdated)
              this.updateCanvasCache();
          ctx.clearRect(0, 0, t.w * tileSize, t.h * tileSize);
          ctx.drawImage(this.canvasCache, 0, 0);
          for (let d of this.dolls) {
              this.renderDoll(ctx, d);
          }
          for (let fx of this.anim)
              if (fx.render)
                  fx.render(ctx);
          if (this.animQueue.length > 0 && this.animQueue[0].render)
              this.animQueue[0].render(ctx);
          if (!this.busy)
              this.renderPath(ctx, this.game.hoveredCell);
          return this.animQueue.length > 0;
      }
      renderPath(ctx, cell) {
          let unit = this.game.chosen;
          if (!unit ||
              !cell ||
              !unit.dists ||
              !unit.dists[cell.cid] ||
              unit.dists[cell.cid][1] == -1)
              return;
          if (!unit.reachable(cell))
              return;
          let end = this.cidToCenter(cell.cid);
          ctx.beginPath();
          if (unit.reachable(cell))
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
          let path = unit.pathTo(cell);
          ctx.beginPath();
          ctx.moveTo(...this.cidToCenter(path[0].cid));
          for (let i of path)
              ctx.lineTo(...this.cidToCenter(i.cid));
          ctx.stroke();
      }
      renderThreats(ctx, cell) {
          let t = this.terrain;
          let i = cell.cid;
          if (!t.teams[Team.RED].strength)
              return;
          ctx.strokeStyle = "#800";
          ctx.lineWidth = t.teams[Team.RED].strength[i] == 4 ? 3 : 1;
          ctx.beginPath();
          ctx.moveTo(3.5, 3.5);
          ctx.lineTo(3.5, 3.5 + 3 * t.teams[Team.RED].strength[i]);
          ctx.stroke();
          ctx.strokeStyle = "#008";
          ctx.lineWidth = t.teams[Team.RED].weakness[i] == 4 ? 3 : 1;
          ctx.beginPath();
          ctx.moveTo(3.5, 3.5);
          ctx.lineTo(3.5 + 3 * t.teams[Team.RED].weakness[i], 3.5);
          ctx.stroke();
      }
      renderCell(ctx, cell) {
          let g = this.game;
          let at = this.cidToScreen(cell.cid);
          let sprite = [, RenderSchematic.lowTile, RenderSchematic.highTile][cell.obstacle];
          ctx.save();
          ctx.shadowColor = `rgba(0,0,0,0)`;
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 2;
          if (g.hoveredCell) {
              let xfov = g.hoveredCell.xfov.has(cell.cid);
              let dfov = g.hoveredCell.dfov.has(cell.cid);
              if (!dfov) {
                  ctx.fillStyle = `rgba(${xfov ? "50,50,0,0.04" : "0,0,50,0.1"})`;
                  ctx.fillRect(at[0], at[1], tileSize, tileSize);
              }
          }
          if (g.chosen && g.chosen.dists && !this.busy) {
              let moves = g.chosen.apCost(cell);
              if (moves > 0 && moves <= g.chosen.ap) {
                  let img = [, RenderSchematic.ap1Sprite, RenderSchematic.ap2Sprite][Math.floor(moves)];
                  if (img)
                      ctx.drawImage(img, at[0], at[1]);
              }
          }
          if (
              cell.povs &&
              cell.peeked.includes(this.game.hoveredCell)) {
              ctx.strokeStyle = `rgba(0,0,0,0.5)`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.arc(at[0] + tileSize / 2, at[1] + tileSize / 2, tileSize / 4, 0, Math.PI * 2);
              ctx.stroke();
          }
          ctx.restore();
          if (cell.goody) {
              ctx.translate(...at);
              ctx.fillStyle = "#080";
              ctx.fillRect(tileSize * 0.35, 0, tileSize * 0.3, tileSize);
              ctx.fillRect(0, tileSize * 0.35, tileSize, tileSize * 0.3);
              ctx.translate(...scale(at, -1));
          }
          if (sprite)
              ctx.drawImage(sprite, at[0], at[1]);
      }
      renderDoll(ctx, doll) {
          ctx.save();
          ctx.translate(...doll.at);
          this.useDollCache(ctx, doll);
          if (doll.unit == this.game.chosen) {
              this.outline(ctx, doll, Math.sin(new Date().getTime() / 100) + 1);
          }
          else if (doll.unit == this.game.hoveredChar) {
              this.outline(ctx, doll, 1.5);
          }
          ctx.restore();
      }
      outline(ctx, doll, width = 2) {
          ctx.save();
          ctx.shadowColor = `rgba(0,0,0,0)`;
          //console.assert(tile.unit.blue)
          ctx.strokeStyle = doll.unit.strokeColor;
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.arc(tileSize / 2, tileSize / 2, tileSize * 0.4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
      }
      useDollCache(ctx, doll) {
          let unit = doll.unit;
          let state = ["cid", "hp", "ap", "kind", "faction"].map(key => unit[key]);
          state.push(this.dollTint(doll));
          let key = state.join(",");
          if (!(key in this.dollCache))
              this.dollCache[key] = canvasCache([tileSize, tileSize], ctx => this.renderDollBody(ctx, doll, this.dollTint(doll)));
          ctx.drawImage(this.dollCache[key], 0, 0);
      }
      dollTint(doll) {
          if (this.busy || this.terrain.aiTurn)
              return 0;
          let unit = doll.unit;
          let flankNum = 0;
          let hover = this.game.hoveredCell;
          if (hover && hover.xfov) {
              let visible = hover.xfov.has(unit.cid) || unit.team == this.game.lastSelectedFaction;
              if (visible)
                  flankNum =
                      (this.terrain.cover(unit.cell, hover) == 0 ? 1 : 0) +
                          (this.terrain.cover(hover, unit.cell) == 0 ? 2 : 0);
              else
                  flankNum = 4;
          }
          if (!this.game.hoveredCell)
              flankNum = 0;
          return flankNum;
      }
      renderDollBody(ctx, doll, tint) {
          let unit = doll.unit;
          ctx.fillStyle = ["#fff", "#fba", "#cfa", "#ffa", "#ccc"][tint];
          ctx.strokeStyle = unit.strokeColor;
          ctx.shadowColor = "#444";
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(0.5 * tileSize, 0.5 * tileSize, tileSize * 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowColor = `rgba(0,0,0,0)`;
          ctx.lineWidth = 2;
          for (let i = 0; i < unit.hp; i++) {
              let angle = Math.PI * (1 - i / (unit.maxHP - 1));
              let v = fromAngle(angle);
              ctx.beginPath();
              ctx.moveTo((0.5 + v[0] * 0.4) * tileSize, (0.5 + v[1] * 0.4) * tileSize);
              ctx.lineTo((0.5 + v[0] * 0.5) * tileSize, (0.5 + v[1] * 0.5) * tileSize);
              ctx.stroke();
          }
          ctx.lineWidth = 1;
          ctx.fillStyle = unit.strokeColor;
          ctx.textAlign = "center";
          ctx.font = `bold ${tileSize / 2}pt Courier`;
          ctx.fillText(Unit.letters[unit.kind].toUpperCase(), 0.5 * tileSize, 0.66 * tileSize);
          ctx.stroke();
          if (unit.ap > 0) {
              ctx.fillStyle = doll.unit.strokeColor;
              ctx.beginPath();
              ctx.moveTo(1, 1);
              ctx.lineTo(6, 1);
              ctx.lineTo(1, 6);
              ctx.closePath();
              ctx.fill();
              if (unit.ap > 1) {
                  ctx.beginPath();
                  ctx.moveTo(tileSize - 1, 1);
                  ctx.lineTo(tileSize - 6, 1);
                  ctx.lineTo(+tileSize - 1, 6);
                  ctx.closePath();
                  ctx.fill();
              }
          }
      }
      cidToScreen(ind) {
          return this.terrain.fromCid(ind).map(a => a * tileSize);
      }
      cidToCenter(ind) {
          return this.terrain.fromCid(ind).map(a => (a + 0.5) * tileSize);
      }
      cidScreen(x, y) {
          return this.terrain.cid(idiv(x, tileSize), idiv(y, tileSize));
      }
      cellAtScreen(x, y) {
          return this.terrain.cells[this.cidScreen(x, y)];
      }
      get animationSpeed() {
          return this.terrain.aiTurn ? 0.5 : 0.5;
      }
      updateCanvasCache() {
          if (!this.canvasCache)
              this.canvasCache = createCanvas(this.terrain.w * tileSize, this.terrain.h * tileSize);
          let ctx = this.canvasCache.getContext("2d");
          ctx.save();
          ctx.clearRect(0, 0, this.terrain.w * tileSize, this.terrain.h * tileSize);
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
          ctx.shadowColor = "#444";
          for (let i = 0; i < this.terrain.cells.length; i++) {
              let cell = this.terrain.cells[i];
              ctx.save();
              this.renderCell(ctx, cell);
          }
          ctx.restore();
          this.canvasCacheOutdated = false;
      }
      resetCanvasCache() {
          this.canvasCacheOutdated = true;
      }
      text(from, text) {
          let at = sum(from, [0, -10]);
          this.anim.push(new MovingText(text, "#f00", 3, at, [0, -10]));
      }
      renderBullet(ctx, [from, to], time) {
          ctx.beginPath();
          let delta = norm(sub(to, from), -20);
          let at = lerp(from, to, time);
          let tail = sum(at, delta);
          var grad = ctx.createLinearGradient(tail[0], tail[1], at[0], at[1]);
          grad.addColorStop(0, `rgba(0,0,0,0)`);
          grad.addColorStop(1, `rgba(0,0,0,1)`);
          ctx.lineWidth = 4;
          ctx.strokeStyle = grad;
          ctx.moveTo(...tail);
          ctx.lineTo(...at);
          ctx.stroke();
          ctx.lineWidth = 1;
          ctx.strokeStyle = "#000";
      }
      shoot(from, to, dmg) {
          let tiles = [from, to].map(v => this.terrain.cells[v]);
          let points;
          let a, b;
          completely: for (a of tiles[0].povs)
              for (b of tiles[1].povs) {
                  if (a.dfov.has(b.cid)) {
                      points = [a, b].map(v => this.cidToCenter(v.cid));
                      break completely;
                  }
              }
          let fdoll = this.dollAt(from);
          let tdoll = this.dollAt(to);
          let time = 0;
          if (a.cid == from && b.cid == to) {
              time = 1;
          }
          this.animQueue.push({
              update: dTime => {
                  if (time < 1 || time > 2) {
                      let peek = (time < 1 ? time : 3 - time) * 0.6;
                      for (let i = 0; i < 2; i++) {
                          let doll = [fdoll, tdoll][i];
                          doll.at = lerp(this.cidToScreen([from, to][i]), sub(points[i], [tileSize / 2, tileSize / 2]), peek);
                      }
                      time += dTime * this.animationSpeed * 10;
                  }
                  else {
                      time +=
                          dTime *
                              Math.min(10, (1000 / dist(...points)) * this.animationSpeed);
                  }
                  if (time > 3) {
                      this.text(points[1], dmg > 0 ? `-${dmg}` : "MISS");
                      fdoll.at = this.cidToScreen(fdoll.unit.cid);
                      tdoll.at = this.cidToScreen(tdoll.unit.cid);
                      return false;
                  }
                  return true;
              },
              render: (ctx) => {
                  if (time > 1 && time < 2)
                      this.renderBullet(ctx, points, time - 1);
              }
          });
      }
      walk(doll, steps) {
          let path = steps.map(v => this.cidToScreen(v.cid));
          let time = 0;
          this.animQueue.push({
              update: dTime => {
                  time += dTime * 15 * this.animationSpeed;
                  if (!path[Math.floor(time) + 1]) {
                      doll.at = path[path.length - 1];
                      return false;
                  }
                  doll.at = lerp(path[Math.floor(time)], path[Math.floor(time) + 1], time - Math.floor(time));
                  return true;
              }
          });
      }
      dollOf(unit) {
          return this.dolls.find(d => d.unit == unit);
      }
      dollAt(cid) {
          return this.dolls.find(d => d.unit.cid == cid);
      }
      draw(o) {
          return __awaiter(this, void 0, void 0, function* () {
              switch (o.anim) {
                  case "walk":
                      this.walk(this.dollOf(o.char), o.path);
                      break;
                  case "shoot":
                      this.shoot(o.from, o.to, o.damage);
                      break;
              }
              yield this.waitForAnim();
          });
      }
      waitForAnim() {
          return new Promise(resolve => {
              this.blockingAnimationEnd = () => resolve();
          });
      }
      get busy() {
          return this.animQueue.length > 0;
      }
  }
  RenderSchematic.ap1Sprite = canvasCache([tileSize, tileSize], ctx => {
      ctx.strokeStyle = "#555";
      ctx.strokeRect(4.5, 4.5, tileSize - 8, tileSize - 8);
  });
  RenderSchematic.ap2Sprite = canvasCache([tileSize, tileSize], ctx => {
      ctx.strokeStyle = "#bbb";
      ctx.strokeRect(4.5, 4.5, tileSize - 8, tileSize - 8);
  });
  RenderSchematic.hiddenSprite = canvasCache([tileSize, tileSize], ctx => {
      ctx.fillStyle = `rgba(0,0,0,0.12)`;
      ctx.fillRect(0, 0, tileSize, tileSize);
  });
  RenderSchematic.dashPattern = canvasCache([dashInterval, dashInterval], ctx => {
      for (let i = 0; i < dashInterval; i++) {
          ctx.fillRect(i, i, 1, 1);
      }
  });
  RenderSchematic.crossPattern = canvasCache([3, 3], ctx => {
      for (let i = 0; i < dashInterval; i++) {
          ctx.fillRect(dashInterval - i - 1, i, 1, 1);
          ctx.fillRect(i, i, 1, 1);
      }
  });
  RenderSchematic.highTile = canvasCache([tileSize, tileSize], ctx => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, tileSize, tileSize);
  });
  RenderSchematic.lowTile = canvasCache([tileSize, tileSize], ctx => {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, tileSize, tileSize);
      ctx.fillStyle = ctx.createPattern(RenderSchematic.dashPattern, "repeat");
      ctx.fillRect(0, 0, tileSize, tileSize);
  });
  RenderSchematic.emptyTile = canvasCache([1, 1], ctx => { });

  class Game {
      constructor(canvas, updateUI, terrainString) {
          this.canvas = canvas;
          this.updateUI = updateUI;
          this.time = 0;
          this.mode = Game.PAI;
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
      #A#    #          A  #s         #a               #
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
          this.terrain = new Terrain(terrainString, (o) => this.renderer.draw(o));
          //this.eye = new Char(this, Char.EYE, Char.BLUE, 0);
          this.renderer = new RenderSchematic(this, this.canvas);
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
          this.renderer.update(dTime);
          this.renderer.render(this.ctx);
          if (this.over())
              this.updateUI();
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
          this.info.innerHTML =
              text ||
                  (this.terrain.victor
                      ? `<H3 style="color:white; background:${this.terrain.victor.color}">${this.terrain.victor.name} side victorious</H3>`
                      : "");
      }
      click(x, y) {
          let cell = this.renderer.cellAtScreen(x, y);
          this.clickCell(cell);
          this.renderer.resetCanvasCache();
      }
      canPlayAs(unit) {
          return unit.blue || this.mode != Game.PAI;
      }
      clickCell(cell) {
          if (!cell)
              return;
          if (cell.unit) {
              if (this.chosen &&
                  this.chosen.team == cell.unit.team &&
                  this.canPlayAs(cell.unit)) {
                  this.chosen = cell.unit;
                  this.chosen.calculate();
                  return;
              }
              if (this.chosen && this.chosen.canDamage(cell.unit)) {
                  this.chosen.shoot(cell);
                  return;
              }
              if (this.chosen == cell.unit) {
                  this.cancel();
              }
              else {
                  if (this.canPlayAs(cell.unit))
                      this.chosen = cell.unit;
              }
              if (this.chosen) {
                  this.chosen.calculate();
              }
          }
          if (!cell.unit && this.chosen && this.chosen.reachable(cell)) {
              this.chosen.move(cell);
              this.terrain.teams[Team.RED].calculate();
          }
          this.lastSelectedFaction = this.chosen ? this.chosen.team : this.terrain.we;
      }
      cancel() {
          delete this.chosen;
          this.renderer.resetCanvasCache();
      }
      hover(x, y) {
          let cell = this.renderer.cellAtScreen(x, y);
          if (this.hoveredCell == cell)
              return;
          if (!cell) {
              delete this.hoveredCell;
              this.renderer.resetCanvasCache();
              return;
          }
          if (!cell)
              return;
          this.hoveredCell = cell;
          let cursor = "default";
          if ((this.chosen && this.chosen.reachable(cell)) || cell.unit)
              cursor = "pointer";
          if (this.chosen && this.chosen.canDamage(cell.unit)) {
              cursor = "crosshair";
              this.updateTooltip(this.renderer.cidToCenter(cell.cid), `${this.chosen.hitChance(cell.unit)}% ${this.chosen.gun
                .averageDamage(this.chosen, cell.unit)
                .toFixed(1)}`);
          }
          else {
              this.updateTooltip();
          }
          document.body.style.cursor = cursor;
          if (cell.unit) {
              this.updateInfo(cell.unit.info());
          }
          else {
              this.updateInfo();
          }
          if (!this.renderer.busy)
              this.renderer.resetCanvasCache();
      }
      endTurn() {
          return __awaiter(this, void 0, void 0, function* () {
              delete this.chosen;
              if (this.mode == Game.AIAI)
                  yield this.terrain.teams[Team.BLUE].think();
              if (this.mode != Game.PP)
                  yield this.terrain.teams[Team.RED].think();
              for (let c of this.terrain.units) {
                  c.ap = 2;
              }
              this.renderer.resetCanvasCache();
          });
      }
      toggleMode() {
          this.mode = (this.mode + 1) % 3;
          return ["[P+AI] 2P 2AI", "P+AI [2P] 2AI", "P+AI 2P [2AI]"][this.mode];
      }
      setMode(m) {
          this.mode = m;
      }
      get hoveredChar() {
          if (this.hoveredCell)
              return this.hoveredCell.unit;
      }
  }
  Game.PAI = 0;
  Game.PP = 1;
  Game.AIAI = 2;
  /*

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
        #A#    #          A  #s         #a               #
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
              game.setMode(mode);
              updateButtons();
          };
      }
      updateButtons();
      gameUpdated(new Game(c, updateUI));
      endButton.onclick = e => {
          if (page == 0) {
              game.endTurn();
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
              game.cancel();
          }
          else {
              game.click(e.offsetX, e.offsetY);
          }
      });
      c.addEventListener("mousemove", e => {
          game.hover(e.offsetX, e.offsetY);
      });
      c.addEventListener("mouseleave", e => {
          game.hover(undefined, undefined);
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
              endButton.style.visibility = game.renderer.busy ? "hidden" : "visible";
      });
      gameUpdated(game);
      console.log(game.terrain.terrainString);
      editArea.value = game.terrain.terrainString;
  };

  exports.mouseAt = mouseAt;

  return exports;

}({}));
