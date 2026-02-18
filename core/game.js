import { museumMap } from "./map.js";

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.tileSize = 64;
        this.map = museumMap;
        this.zoom = 1.2;

        // Resize canvas
        this.resize();
        window.addEventListener("resize", this.resize.bind(this));

        // Load images (only existing ones)
        this.wallImg = this.loadImage("../assets/textures/wall.png");
        this.floorImg = this.loadImage("../assets/textures/floor.png");
        this.playerImg = this.loadImage("../assets/textures/player.png");
        this.shelfImg = this.loadImage("../assets/textures/shelf.png");
        this.plantImg = this.loadImage("../assets/textures/plant.png");

        // Player
        this.player = {
            x: 6 * this.tileSize,
            y: 4 * this.tileSize,
            size: this.tileSize,
            speed: 4
        };

        this.keys = {};

        // Key events (lowercase to handle Arrow keys)
        window.addEventListener("keydown", (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        window.addEventListener("keyup", (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Start loop
        this.loop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    loadImage(path) {
        const img = new Image();
        img.src = new URL(path, import.meta.url).href;
        img.onerror = () => console.warn(`Failed to load image: ${path}`);
        return img;
    }

    update() {
        let newX = this.player.x;
        let newY = this.player.y;

        if (this.keys["arrowup"] || this.keys["w"]) newY -= this.player.speed;
        if (this.keys["arrowdown"] || this.keys["s"]) newY += this.player.speed;
        if (this.keys["arrowleft"] || this.keys["a"]) newX -= this.player.speed;
        if (this.keys["arrowright"] || this.keys["d"]) newX += this.player.speed;

        if (!this.isColliding(newX, newY)) {
            this.player.x = newX;
            this.player.y = newY;
        }
    }

    isColliding(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        const tile = this.map[tileY] ? this.map[tileY][tileX] : null;
        return tile === "W" || tile === "S";
    }

    drawMap() {
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                const tile = this.map[y][x];
                const posX = x * this.tileSize;
                const posY = y * this.tileSize;

                let img = null;
                if (tile === "F") img = this.floorImg;
                if (tile === "W") img = this.wallImg;
                if (tile === "S") img = this.shelfImg;

                if (img && img.complete && img.naturalWidth !== 0) {
                    this.ctx.drawImage(img, posX, posY, this.tileSize, this.tileSize);
                }
            }
        }
    }

    drawPlayer() {
        if (this.playerImg && this.playerImg.complete && this.playerImg.naturalWidth !== 0) {
            this.ctx.drawImage(
                this.playerImg,
                this.player.x,
                this.player.y,
                this.player.size,
                this.player.size
            );
        } else {
            this.ctx.fillStyle = "#ffcc00";
            this.ctx.fillRect(this.player.x, this.player.y, this.player.size, this.player.size);
        }
    }

    loop() {
        requestAnimationFrame(() => this.loop());

        this.update();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        // Camera: player in center + zoom
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(-this.player.x - this.player.size / 2, -this.player.y - this.player.size / 2);

        this.drawMap();
        this.drawPlayer();

        this.ctx.restore();
    }
}
