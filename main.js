import { Game } from "./core/game.js";

const canvas = document.getElementById("game");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

new Game(canvas);
