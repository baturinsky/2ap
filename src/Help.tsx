import { h, render, Component } from "preact";

export default function Help() {
  return (
    <div id="help">
      <h3>This is a prototype of a browser XCOM-like game.</h3>

      <p>
        Currently it only has three unit types, no complex moves like overwatch,
        and only one map, but it will grow. It's already fully playable and
        closely matches XCOM conventions. Left click on your
        <span style="color:blue">(blue)</span> units to select, click on empty
        space to move or on enemy to fire. Right click to deselect. Each unit
        has two action points (hence the game's name), shown as "horns". And
        some Hit Points, shown as the "beard". Units, naturally, die when out of
        HP, but can replenish HPs with "*" pickups. When next to cover (black or
        dashed squares), unit is protected by it on respective side and can
        "peek" out of it to shoot or, sadly, be shot at, just like in XCOM.
        Black squares are high cover, granting 40% defence and blocking vision.
        Dashed squares are low cover, giving only 20$ defence and no LOS
        obsruction.
      </p>

      <p>
        When you hover the mouse over the square, you can see what is visible
        from it, and which enemies are flanked from (i.e. have no cover, marked{" "}
        <span style="background:#8f8">green</span>), or 
        <span style="background:#f88">flanking</span> this square, or 
        <span style="background:#ff8;">both</span>.
      </p>

      <p>
        You can play against AI, it's a default mode. AI is quite competent,
        seeking cover and trying to flank you when possible. Also you can switch
        to 2 player mode, or even AI vs AI. Difference, basically, is that when
        you press "End turn", AI will make moves, depending on mode, for none,
        one or both sides if they have APs remained.
      </p>

      <p>
        Even more, you can play on your own map! Just switch to Edit mode, and
        edit text field. # is high cover, + is low cover, G, A, S are blue units
        and g, a, s are red units. Note that map borders should always be high
        cover. Don't forget to press "Apply" when you done.
      </p>
    </div>
  );
}
