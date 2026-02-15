import { Game } from "./core/game.js";

const canvas = document.getElementById("game");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resize();
window.addEventListener("resize", resize);

new Game(canvas);
