import { Shelf } from "./entities/Shelf.js";
// main.js
import { Game } from "./core/game.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const game = new Game(canvas, ctx);
game.start();
