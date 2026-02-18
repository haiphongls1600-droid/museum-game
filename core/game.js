import { Shelf } from "../entities/Shelf.js";
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

        // Khởi tạo các biến cần thiết
        this.player = {
            x: 6 * this.tileSize,
            y: 4 * this.tileSize,
            size: this.tileSize,
            speed: 4
        };
        this.keys = {};
        this.shelves = [];
        this.target = null;
        this.popup = null;

        // Tạo shelves từ map
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x] === "S") {
                    const shelfX = x * this.tileSize + this.tileSize / 2;
                    const shelfY = y * this.tileSize + this.tileSize / 2;
                    this.shelves.push(new Shelf(shelfX, shelfY, 40, 20, `Shelf_${x}_${y}`));
                }
            }
        }

        // Key events
        window.addEventListener("keydown", (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });

        window.addEventListener("keyup", (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = false;

            // Xử lý phím E khi THẢ phím (tránh spam)
            if (key === "e") {
                this.handleInteract();
                console.log("E pressed - checking interact, popup:", this.popup);
            }
        });

        // Click để di chuyển
        this.canvas.addEventListener("click", (e) => {
            if (this.popup) return; // Không di chuyển khi popup mở

            const rect = this.canvas.getBoundingClientRect();
            const mouseScreenX = e.clientX - rect.left;
            const mouseScreenY = e.clientY - rect.top;

            // Chuyển screen → world coord (ngược camera + zoom)
            const worldX = this.player.x + (mouseScreenX - this.canvas.width / 2) / this.zoom;
            const worldY = this.player.y + (mouseScreenY - this.canvas.height / 2) / this.zoom;

            this.target = { x: worldX, y: worldY };
            console.log("Click target set to:", this.target); // Debug
        });

        // Load images
        this.wallImg = this.loadImage("../assets/textures/wall.png");
        this.floorImg = this.loadImage("../assets/textures/floor.png");
        this.playerImg = this.loadImage("../assets/textures/player.png");
        this.shelfImg = this.loadImage("../assets/textures/shelf.png");
        this.plantImg = this.loadImage("../assets/textures/plant.png");

        // Bắt đầu loop
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

        // Kiểm tra có input từ phím không
        const hasKeyMove = ["w", "s", "a", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"]
            .some(k => this.keys[k]);

        if (hasKeyMove) {
            // Di chuyển bằng phím (ưu tiên hơn click)
            if (this.keys["w"] || this.keys["arrowup"]) newY -= this.player.speed;
            if (this.keys["s"] || this.keys["arrowdown"]) newY += this.player.speed;
            if (this.keys["a"] || this.keys["arrowleft"]) newX -= this.player.speed;
            if (this.keys["d"] || this.keys["arrowright"]) newX += this.player.speed;
        } else if (this.target) {
            // Di chuyển bằng click
            const dx = this.target.x - this.player.x;
            const dy = this.target.y - this.player.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 5) {
                newX += (dx / dist) * this.player.speed;
                newY += (dy / dist) * this.player.speed;
            } else {
                this.target = null;
            }
        }

        // Collision check
        if (!this.isColliding(newX, newY)) {
            this.player.x = newX;
            this.player.y = newY;
        }
    }

    isColliding(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        const tile = this.map[tileY]?.[tileX];
        return tile === "W" || tile === "S";
    }

    handleInteract() {
        if (this.popup) {
            this.popup = null;
            return;
        }

        let interacted = false;
        for (const shelf of this.shelves) {
            if (shelf.isPlayerNear(this.player, 80)) {
                this.popup = shelf.text || "Hiện vật bí ẩn";
                interacted = true;
                break;
            }
        }

        if (!interacted) {
            console.log("Không có shelf nào gần để interact");
        }
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

                if (img && img.complete && img.naturalWidth !== 0) {
                    this.ctx.drawImage(img, posX, posY, this.tileSize, this.tileSize);
                } else {
                    this.ctx.fillStyle = tile === "W" ? "#555" : "#333";
                    this.ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
                }
            }
        }

        // Vẽ shelves entity
        this.shelves.forEach(shelf => {
            shelf.draw(this.ctx);
        });
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
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(-this.player.x - this.player.size / 2, -this.player.y - this.player.size / 2);

        this.drawMap();
        this.drawPlayer();

        this.ctx.restore();

        // Popup overlay (không bị ảnh hưởng camera/zoom)
        if (this.popup) {
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            const boxWidth = 440;
            const boxHeight = 240;
            const boxX = (this.canvas.width - boxWidth) / 2;
            const boxY = (this.canvas.height - boxHeight) / 2;

            this.ctx.fillStyle = "#ffffff";
            this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

            this.ctx.fillStyle = "#000000";
            this.ctx.font = "28px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(this.popup, this.canvas.width / 2, this.canvas.height / 2 - 20);

            this.ctx.font = "18px Arial";
            this.ctx.fillText("Nhấn E để đóng", this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }
}
