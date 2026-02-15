import Game from "./core/game.js";

window.onload = () => {
    const canvas = document.getElementById("game");

    if (!canvas) {
        console.error("Canvas not found!");
        return;
    }

    new Game(canvas);
};
