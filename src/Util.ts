export type Context2d =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;
export type Canvas2d = HTMLCanvasElement | OffscreenCanvas;

export function min<T>(list: T[], fn: (T) => number) {
  let minV = Number.MAX_VALUE;
  let minI = -1;
  for (let i = 0; i < list.length; i++) {
    let v = fn(list[i]);
    if (minV > v) {
      minV = v;
      minI = i;
    }
  }
  if (minI >= 0) return { ind: minI, item: list[minI], val: minV };
}

export function max<T>(list: T[], fn: (T) => number) {
  let r = min(list, t => -fn(t));
  if (!r) return;
  r.val = -r.val;
  return r;
}

export function createCanvas(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

export function createOffscreenCanvas(w: number, h: number) {
  return new OffscreenCanvas(w, h);
}

export function canvasCache(
  size: [number, number],
  draw: (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  ) => void
): HTMLCanvasElement | OffscreenCanvas {
  const canvas = createCanvas(...size);
  const ctx = canvas.getContext("2d");
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#000";
  draw(ctx);
  return canvas;
}

export function randomElement<T>(list: T[], rni: () => number) {
  return list[rni() % list.length];
}

export function weightedRandom(a: number[], rni: () => number) {
  let roll = (rni() % a.reduce((x, y) => x + y)) - a[0];
  let i = 0;
  while (roll >= 0) roll -= a[++i];
  return i;
}

export function random(seed) {
  seed = seed % 2147483647;
  if (seed <= 0) seed += 2147483646;
  return () => {
    return (seed = (seed * 16807) % 2147483647);
  };
}

export function eachFrame(fun: (time: number) => void) {
  requestAnimationFrame(time => {
    fun(time);
    eachFrame(fun);
  });
}

export function idiv(a: number, b: number) {
  return Math.floor(a / b);
}

export function bind(target, name, descriptor) {
  return {
    get() {
      const bound = descriptor.value.bind(this);

      Object.defineProperty(this, name, {
        value: bound
      });

      return bound;
    }
  };
}

export function parseWithNewLines(json: string) {
  if (!json) return null;
  let split = json.split('"');
  for (let i = 1; i < split.length; i += 2) {
    split[i] = split[i].replace(/\n/g, "\\n");
  }
  return JSON.parse(split.join('"'));
}

export function signed(n: number):string {
  return (n > 0 ? "+":"") + n;
}

export function svgImg(attrs:string, body:string){
  return `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${body}</svg>')`;
}