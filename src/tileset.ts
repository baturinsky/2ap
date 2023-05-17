type TileBits = CanvasImageSource[];

/**
 * Format for connected and single: id, column, row, flags
 * Format for grouped: list of hrouped ids
 */
type Tileset = {
  tilesSize: number,
  tilesheet: CanvasImageSource
  connected: [number, number, number, number?][]
  single: [number, number, number][]
  grouped: number[][],
  sprites: TileBits[]
};

export function context2d(canvas: HTMLCanvasElement) {
  return canvas.getContext("2d");
}

/** Creates a canvas and returns it and it's context */
export function createCanvasCtx(width: number, height: number) {
  let canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  let ctx = context2d(canvas);
  return { canvas, ctx };
}

export function cutImageUp(
  image: CanvasImageSource,
  columns: number,
  rows: number,
  fragmentWidth: number,
  fragmentHeight: number,
  left = 0,
  top = 0
) {
  let imagePieces: HTMLCanvasElement[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      let { canvas, ctx } = createCanvasCtx(fragmentWidth, fragmentHeight);
      ctx.drawImage(
        image,
        left + x * fragmentWidth,
        top + y * fragmentHeight,
        fragmentWidth,
        fragmentHeight,
        0,
        0,
        fragmentWidth,
        fragmentHeight
      );
      imagePieces.push(canvas);
    }
  }
  return imagePieces;
}

/**
 * For each tile quater, in order of left to right and up to down,
 * number represents in which case it should be drawn, depending on the same tile neighbors
 * 0 - no neighbors
 * 1 - neighbor horizontally
 * 2 - vertically
 * 3 - horizontally and vertically
 * 4 - nor horizontally or vertically, but diagonally
 */
const partsOrder = "334433443223100110013223"
  .split("")
  .map((s, i) => Number(s) * 4 + (i % 2) + (Math.floor(i / 4) % 2) * 2);

export function cutImagetoSquares(
  img: CanvasImageSource,
  left: number,
  top: number,
  squareSize
) {
  let partsUnordered = cutImageUp(img, 4, 6, squareSize, squareSize, left, top);
  let tile: HTMLCanvasElement[] = [];
  partsOrder.forEach((v, i) => (tile[v] = partsUnordered[i]));
  return tile;
}

const pathNeighbors = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

const pathDisplacement = -0.1

function drawPath(
  ctx: CanvasRenderingContext2D,
  tile: TileBits,
  pos: number,
  columns: number,
  connect: (pos: number) => boolean
) {
  let tileWidth = tile[0].width as number;
  let [tileX, tileY] = screenPos(pos, columns, tileWidth);
  let pixelPathDisplacement = Math.floor(tileWidth * pathDisplacement)
  ctx.drawImage(tile[1], tileX + pixelPathDisplacement, tileY + pixelPathDisplacement);
  for (let i = 0; i < 4; i++) {
    let connected = connect(
      pos + pathNeighbors[i][0] + pathNeighbors[i][1] * columns
    );
    if (connected)
      ctx.drawImage(
        tile[2 + i],
        tileX + tileWidth * (pathNeighbors[i][0] / 2) + pixelPathDisplacement,
        tileY + tileWidth * (pathNeighbors[i][1] / 2) + pixelPathDisplacement
      );
  }
}

export function drawTile(
  ctx: CanvasRenderingContext2D,
  tile: TileBits,
  pos: number,
  columns: number,
  connect: (pos: number) => boolean = (pos: number) => false
) {
  if (tile.length == 6) return drawPath(ctx, tile, pos, columns, connect);

  let [tileX, tileY] = screenPos(pos, columns, tile[0].width as number * 2);
  for (let corner = 0; corner < 4; corner++) {
    let dx = corner % 2 ? 1 : -1;
    let dy = corner > 1 ? 1 : -1;
    let xNear = connect(pos + dx) ? 0 : 1;
    let yNear = connect(pos + dy * columns) ? 0 : 1;
    let kind = 0;
    if (xNear || yNear) {
      kind = xNear + yNear * 2;
    } else if (!connect(pos + dy * columns + dx)) {
      kind = 4;
    }
    ctx.drawImage(
      tile[kind * 4 + corner],
      tileX + (corner % 2 ? 16 : 0),
      tileY + (corner > 1 ? 16 : 0)
    );
  }
}

export function ind2xy(ind: number, columns: number) {
  let x = ind % columns;
  let y = (ind - x) / columns;
  return [x, y];
}

export function screenPos(ind: number, columns: number, tileWidth: number, tileHeight = tileWidth) {
  let [x, y] = ind2xy(ind, columns);
  return [x * tileWidth, y * tileHeight];
}

const ISPATH = 1;

export function createSprites(tileset: Tileset) {
  if(tileset.sprites)
    return tileset.sprites;
    
  let tileSize = tileset.tilesSize;

  let sprites: TileBits[] = [];
  for (let layer of tileset.connected) {
    let ispath = layer[3] & ISPATH ? true : false;
    let slices: HTMLCanvasElement[] = ispath ?
      cutImageUp(
        tileset.tilesheet,
        2,
        3,
        tileset.tilesSize,
        tileset.tilesSize,
        layer[1] * tileSize,
        layer[2] * tileSize
      )
      : cutImagetoSquares(
        tileset.tilesheet,
        layer[1] * tileSize,
        layer[2] * tileSize,
        tileSize / 2
      )
    sprites[layer[0]] = slices;
  }
  for (let tile of tileset.single) {
    let image = subImage(
      tileset.tilesheet,
      tile[1] * tileSize,
      tile[2] * tileSize,
      tileSize,
      tileSize
    );
    sprites[tile[0]] = [image];
  }
  
  tileset.sprites = sprites;
  return sprites;
}

/** Returns a canvas that is a fragment of the source canvas */
function subImage(
  image: CanvasImageSource,
  left: number,
  top: number,
  width: number,
  height: number
) {
  let { canvas, ctx } = createCanvasCtx(width, height);
  ctx.drawImage(image, left, top, width, height, 0, 0, width, height);
  return canvas;
}

/**
 *
 * @param grid - lists of sprite indices
 * @param directional - for directional tiles (such as RIVER for hex map) - list of cell it flows to
 * @param grid - list of board's ids for each cell
 */
export function drawBoard(
  ctx: CanvasRenderingContext2D,
  grid: number[][],
  directional: { [key: number]: number[] },
  columns: number,
  tileset: Tileset
) {
  let rows = grid.length / columns;

  let sprites = createSprites(tileset);

  let connected = [];
  for (let layer of tileset.connected)
    connected[layer[0]] = true;

  let idToGroup = sprites.map((_, i) => i);
  if (tileset.grouped)
    for (let grouped of tileset.grouped) {
      let group = grouped[0];
      for (let id of grouped)
        idToGroup[id] = group;
    }

  /**
   * Bitmap of connectable sprite ids
   * So, don't have their ids bigger than 32
   */

  let bits = new Uint32Array(grid.length);
  for (let i in grid) {
    let list = grid[i];
    let b = 0;
    for (let v of list) {
      if (connected[v]) b = b | (1 << idToGroup[v]);
    }
    bits[i] = b;
  }

  for (let ind = 0; ind < columns * rows; ind++) {
    if (grid[ind])
      for (let layer of grid[ind]) {
        if (connected[layer]) {
          drawTile(
            ctx,
            sprites[layer],
            ind,
            columns,
            (neighbor) => {
              if (!(bits[neighbor] & (1 << idToGroup[layer]))) return false;
              if (!(layer in directional)) return true;
              return (
                directional[layer][neighbor] == ind ||
                directional[layer][ind] == neighbor
              );
            }
          );
        } else {
          drawTile(ctx, sprites[layer], ind, columns);
        }
      }
  }
}