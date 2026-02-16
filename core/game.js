import { museumMap } from "../maps/museumMap.js";

export default class Game {

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.tileSize = 64;
        this.map = museumMap;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.zoom = 1;

        // ===== LOAD IMAGES =====
        this.wallImg  = this.loadImage("../assets/textures/wall.png");
        this.floorImg = this.loadImage("../assets/textures/floor.png");
        this.playerImg= this.loadImage("../assets/textures/player.png");
        this.shelfImg = this.loadImage("../assets/textures/shelf.png");
        this.plantImg = this.loadImage("../assets/textures/plant.png");

        // ===== PLAYER =====
        this.player = {
            x: 4,
            y: 4,
            speed: 0.1,
            frameX: 0,
            frameY: 0,
            frameWidth: 32,
            frameHeight: 32
        };

        this.keys = {};

        window.addEventListener("keydown", (e) => this.keys[e.key] = true);
        window.addEventListener("keyup", (e) => this.keys[e.key] = false);

        requestAnimationFrame(() => this.loop());
    }

    loadImage(path) {
        const img = new Image();
        img.src = path;
        img.onerror = () => console.error("Không load được:", path);
        return img;
    }

    update() {
        let newX = this.player.x;
        let newY = this.player.y;

        if (this.keys["ArrowUp"] || this.keys["w"]) newY -= this.player.speed;
        if (this.keys["ArrowDown"] || this.keys["s"]) newY += this.player.speed;
        if (this.keys["ArrowLeft"] || this.keys["a"]) newX -= this.player.speed;
        if (this.keys["ArrowRight"] || this.keys["d"]) newX += this.player.speed;

        if (!this.isWall(newX, newY)) {
            this.player.x = newX;
            this.player.y = newY;
        }
    }

    isWall(x, y) {
        const tileX = Math.floor(x);
        const tileY = Math.floor(y);

        if (!this.map[tileY] || !this.map[tileY][tileX]) return true;

        return this.map[tileY][tileX] === "W";
    }

    drawMap() {
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {

                const tile = this.map[y][x];
                const posX = x * this.tileSize;
                const posY = y * this.tileSize;

                if ((tile === "F" || tile === "C") && this.floorImg.complete)
                    this.ctx.drawImage(this.floorImg, posX, posY, this.tileSize, this.tileSize);

                if (tile === "W" && this.wallImg.complete)
                    this.ctx.drawImage(this.wallImg, posX, posY, this.tileSize, this.tileSize);
            }
        }

        // ===== TỦ KÍNH =====
        if (this.shelfImg.complete)
            this.ctx.drawImage(this.shelfImg, 2 * this.tileSize, 2 * this.tileSize, 64, 64);

        // ===== BÀN =====
        if (this.plantImg.complete)
            this.ctx.drawImage(this.plantImg, 6 * this.tileSize, 6 * this.tileSize, 64, 64);
    }

    drawPlayer() {
        if (!this.playerImg.complete) return;

        this.ctx.drawImage(
            this.playerImg,
            this.player.frameX * this.player.frameWidth,
            this.player.frameY * this.player.frameHeight,
            this.player.frameWidth,
            this.player.frameHeight,
            this.player.x * this.tileSize,
            this.player.y * this.tileSize,
            this.tileSize,
            this.tileSize
        );
    }

    loop() {
        this.update();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.scale(this.zoom, this.zoom);

        this.drawMap();
        this.drawPlayer();

        this.ctx.restore();

        requestAnimationFrame(() => this.loop());
    }
}
