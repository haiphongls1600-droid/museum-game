// ================================
// GAME CORE - MUSEUM ENGINE v2
// Zoom 1.2 - Camera Follow
// ================================

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // ===== CONFIG =====
        this.tileSize = 64;
        this.zoom = 1.2;
        this.mapWidth = 3200;
        this.mapHeight = 2400;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // ===== CAMERA =====
        this.camera = {
            x: 0,
            y: 0
        };

        // ===== PLAYER =====
        this.player = {
            x: 400,
            y: 400,
            width: 48,
            height: 48,
            speed: 4,
            moving: false
        };

        // ===== INPUT =====
        this.keys = {};
        this.popupOpen = false;

        // ===== ASSETS =====
        this.images = {};
        this.loadAssets();

        // ===== MAP DATA =====
        this.walls = [];
        this.plants = [];
        this.shelves = [];

        this.buildMap();

        this.addEvents();
        this.loop();
    }

    // ===========================
    // LOAD ASSETS
    // ===========================
    loadAssets() {
        const files = [
            "floor",
            "wall",
            "plant",
            "shelf",
            "player"
        ];

        files.forEach(name => {
            const img = new Image();
            img.src = `./${name}.png`;
            this.images[name] = img;
        });
    }

    // ===========================
    // BUILD MAP
    // ===========================
    buildMap() {

        // Outer walls
        for (let x = 0; x < this.mapWidth; x += this.tileSize) {
            this.walls.push({ x: x, y: 0 });
            this.walls.push({ x: x, y: this.mapHeight - this.tileSize });
        }

        for (let y = 0; y < this.mapHeight; y += this.tileSize) {
            this.walls.push({ x: 0, y: y });
            this.walls.push({ x: this.mapWidth - this.tileSize, y: y });
        }

        // Internal room walls
        for (let x = 600; x < 2600; x += this.tileSize) {
            this.walls.push({ x: x, y: 800 });
            this.walls.push({ x: x, y: 1600 });
        }

        for (let y = 800; y <= 1600; y += this.tileSize) {
            this.walls.push({ x: 600, y: y });
            this.walls.push({ x: 2600 - this.tileSize, y: y });
        }

        // Plants
        this.plants.push({ x: 700, y: 700 });
        this.plants.push({ x: 2400, y: 700 });
        this.plants.push({ x: 700, y: 1700 });
        this.plants.push({ x: 2400, y: 1700 });

        // Shelves
        for (let x = 900; x < 2300; x += 200) {
            this.shelves.push({ x: x, y: 1000 });
            this.shelves.push({ x: x, y: 1400 });
        }
    }

    // ===========================
    // EVENTS
    // ===========================
    addEvents() {
        window.addEventListener("keydown", e => {
            this.keys[e.key.toLowerCase()] = true;

            if (e.key.toLowerCase() === "e") {
                this.popupOpen = true;
            }

            if (e.key === "Escape") {
                this.popupOpen = false;
            }
        });

        window.addEventListener("keyup", e => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    // ===========================
    // COLLISION
    // ===========================
    checkCollision(x, y) {
        const rect1 = {
            x: x,
            y: y,
            w: this.player.width,
            h: this.player.height
        };

        for (let wall of this.walls) {
            const rect2 = {
                x: wall.x,
                y: wall.y,
                w: this.tileSize,
                h: this.tileSize
            };

            if (
                rect1.x < rect2.x + rect2.w &&
                rect1.x + rect1.w > rect2.x &&
                rect1.y < rect2.y + rect2.h &&
                rect1.y + rect1.h > rect2.y
            ) {
                return true;
            }
        }

        return false;
    }

    // ===========================
    // UPDATE
    // ===========================
    update() {
        if (this.popupOpen) return;

        let newX = this.player.x;
        let newY = this.player.y;

        if (this.keys["w"]) newY -= this.player.speed;
        if (this.keys["s"]) newY += this.player.speed;
        if (this.keys["a"]) newX -= this.player.speed;
        if (this.keys["d"]) newX += this.player.speed;

        if (!this.checkCollision(newX, this.player.y)) {
            this.player.x = newX;
        }

        if (!this.checkCollision(this.player.x, newY)) {
            this.player.y = newY;
        }

        // Camera follow
        this.camera.x = this.player.x - this.canvas.width / (2 * this.zoom);
        this.camera.y = this.player.y - this.canvas.height / (2 * this.zoom);

        // Clamp camera
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.mapWidth - this.canvas.width / this.zoom));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.mapHeight - this.canvas.height / this.zoom));
    }

    // ===========================
    // DRAW
    // ===========================
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Floor
        for (let x = 0; x < this.mapWidth; x += this.tileSize) {
            for (let y = 0; y < this.mapHeight; y += this.tileSize) {
                this.ctx.drawImage(this.images.floor, x, y, this.tileSize, this.tileSize);
            }
        }

        // Plants
        for (let plant of this.plants) {
            this.ctx.drawImage(this.images.plant, plant.x, plant.y, 64, 64);
        }

        // Shelves
        for (let shelf of this.shelves) {
            this.ctx.drawImage(this.images.shelf, shelf.x, shelf.y, 64, 64);
        }

        // Walls
        for (let wall of this.walls) {
            this.ctx.drawImage(this.images.wall, wall.x, wall.y, this.tileSize, this.tileSize);
        }

        // Player
        this.ctx.drawImage(
            this.images.player,
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );

        this.ctx.restore();

        if (this.popupOpen) {
            this.drawPopup();
        }
    }

    drawPopup() {
        this.ctx.fillStyle = "rgba(0,0,0,0.7)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = "white";
        this.ctx.font = "30px Arial";
        this.ctx.fillText("Museum Information", 100, 100);
        this.ctx.fillText("Press ESC to close", 100, 150);
    }

    // ===========================
    // LOOP
    // ===========================
    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}
