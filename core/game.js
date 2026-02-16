import { museumMap } from "./map.js";

this.tileSize = 64;
this.map = museumMap;

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.zoom = 1.2;

        // ===== LOAD IMAGES (PATH CHUẨN) =====

const BASE = "./";

this.wallImg   = this.loadImage("./assets/textures/wall.png");
this.floorImg  = this.loadImage("./assets/textures/floor.png");
this.playerImg = this.loadImage("./assets/textures/player.png");
this.shelfImg  = this.loadImage("./assets/textures/shelf.png");
this.plantImg  = this.loadImage("./assets/textures/plant.png");




        this.loop();
    }

    loadImage(path) {
        const img = new Image();
        img.src = path;

        img.onerror = () => {
            console.error("Không load được:", path);
        };

        return img;
    }

    loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.scale(this.zoom, this.zoom);

        // Vẽ nếu ảnh đã load xong
        for (let y = 0; y < this.map.length; y++) {
    for (let x = 0; x < this.map[y].length; x++) {

        const tile = this.map[y][x];
        const posX = x * this.tileSize;
        const posY = y * this.tileSize;

        if (tile === "W" && this.wallImg.complete)
            this.ctx.drawImage(this.wallImg, posX, posY, this.tileSize, this.tileSize);

        if ((tile === "F" || tile === "C") && this.floorImg.complete)
            this.ctx.drawImage(this.floorImg, posX, posY, this.tileSize, this.tileSize);
    }
}

this.ctx.drawImage(this.playerImg, 6 * this.tileSize, 4 * this.tileSize, 64, 64);
