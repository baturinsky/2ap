import Cell from "./Cell";
import Unit from "./Unit";

export type Action = { action: string, [key: string]: any; };

/** Shoot action. Bullet flying, damage numbers. May require step-out animation for units */
export type ShootAction = { action: "shoot", from: Cell, to: Cell, damage?: number, shooter?:Unit, victim:Unit, direct?:boolean }

/** Walk action. Moves through all points in order */
export type WalkAction = { action: "walk", unit: Unit, path: Cell[] }

/** Updates doll state (hp etc) to the serialised state that unit hat at the moment of action creation */
export type StateAction = { action: "state", unit: Unit }
