import { h, render } from "preact";
import { GUI } from "./GUI";
import { svgImg } from "./Util";

window.onload = function() {
  let el = render(<GUI />, document.body) as HTMLElement;
};
