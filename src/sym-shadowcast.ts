//https://gist.github.com/as-f/59bb06ced7e740e11ec7dda9d82717f6#file-shadowcasting-js

export default function shadowcast(cx:number, cy:number, transparent:(a:number,b:number) => boolean, reveal:(a:number,b:number) => void) {
  'use strict';
  /**
   * Scan one row of one octant.
   * @param y - distance from the row scanned to the center
   * @param start - starting slope
   * @param end - ending slope
   * @param transform - describes the transfrom to apply on x and y; determines the octant
   */
  var scan = function(y, start, end, transform) {
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
          } else {
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
      { xx:  1, xy:  0, yx:  0, yy:  1 },
      { xx:  1, xy:  0, yx:  0, yy: -1 },
      { xx: -1, xy:  0, yx:  0, yy:  1 },
      { xx: -1, xy:  0, yx:  0, yy: -1 },
      { xx:  0, xy:  1, yx:  1, yy:  0 },
      { xx:  0, xy:  1, yx: -1, yy:  0 },
      { xx:  0, xy: -1, yx:  1, yy:  0 },
      { xx:  0, xy: -1, yx: -1, yy:  0 }
  ];
  reveal(cx, cy);
  // Scan each octant
  for (var i = 0; i < 8; i++) {
      scan(1, 0, 1, transforms[i]);
  }
};