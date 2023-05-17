import Board from "./Board";
import Cell from "./Cell";
import * as v2 from "./v2";
import { V2 } from "./v2";

export default class Item {
  static readonly MEDKIT = "medkit";

  constructor(public type: string){
  }

  serialize(){
    return this.type;
  }

  static deserialize(type:string){
    return new Item(type)
  }
}