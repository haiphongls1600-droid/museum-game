import Game from "./core/game.js";

window.onload = () => {
    const canvas = document.getElementById("gamecanvas");
    new Game(canvas);
}
