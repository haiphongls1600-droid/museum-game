import Game from "./core/game.js";

window.onload = () => {
    const canvas = document.getElementById("game");
    new Game(canvas);
}
