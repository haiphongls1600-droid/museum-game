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

        // Player
        this.player = {
            x: 6 * this.tileSize,
            y: 4 * this.tileSize,
            size: this.tileSize,
            speed: 4,
            direction: "down"  // Hướng mặc định
        };

        this.keys = {};
        this.shelves = [];
        this.target = null;
        this.popup = null;
        this.nearShelfText = null; // Text gợi ý khi gần tủ

        // Tạo shelves từ map "S"
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x] === "S") {
                    const shelfX = x * this.tileSize + this.tileSize / 2;
                    const shelfY = y * this.tileSize + this.tileSize / 2;
                    this.shelves.push(new Shelf(shelfX, shelfY, 40, 20, `Hiện vật ${x}-${y}`));
                }
            }
        }

        // Load 4 image riêng cho các hướng di chuyển
        this.playerImages = {
            up: this.loadImage("../assets/textures/player_up.png"),
            down: this.loadImage("../assets/textures/player_down.png"),
            left: this.loadImage("../assets/textures/player_left.png"),
            right: this.loadImage("../assets/textures/player_right.png")
        };

        // Key events
        window.addEventListener("keydown", (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        window.addEventListener("keyup", (e) => {
            this.keys[e.key.toLowerCase()] = false;
            if (e.key.toLowerCase() === "e") {
                this.handleInteract();
            }
        });

        // Click để di chuyển
        this.canvas.addEventListener("click", (e) => {
            if (this.popup) return;
            const rect = this.canvas.getBoundingClientRect();
            const mouseScreenX = e.clientX - rect.left;
            const mouseScreenY = e.clientY - rect.top;
            const worldX = this.player.x + (mouseScreenX - this.canvas.width / 2) / this.zoom;
            const worldY = this.player.y + (mouseScreenY - this.canvas.height / 2) / this.zoom;
            this.target = { x: worldX, y: worldY };
        });

        // Load images cơ bản
        this.wallImg = this.loadImage("../assets/textures/wall.png");
        this.floorImg = this.loadImage("../assets/textures/floor.png");
        this.playerImg = this.loadImage("../assets/textures/player.png"); // fallback
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

        this.nearShelfText = null;

        // Di chuyển bằng phím + cập nhật hướng
        let moved = false;
        if (this.keys["w"] || this.keys["arrowup"]) {
            newY -= this.player.speed;
            this.player.direction = "up";
            moved = true;
        }
        if (this.keys["s"] || this.keys["arrowdown"]) {
            newY += this.player.speed;
            this.player.direction = "down";
            moved = true;
        }
        if (this.keys["a"] || this.keys["arrowleft"]) {
            newX -= this.player.speed;
            this.player.direction = "left";
            moved = true;
        }
        if (this.keys["d"] || this.keys["arrowright"]) {
            newX += this.player.speed;
            this.player.direction = "right";
            moved = true;
        }

        // Nếu không phím thì dùng click target
        if (!moved && this.target) {
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

        // Check gần shelf để hiển thị text gợi ý
        this.shelves.forEach(shelf => {
            if (shelf.isPlayerNear(this.player, 80)) {
                this.nearShelfText = "Nhấn E để xem hiện vật";
            }
        });
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
        this.shelves.forEach(shelf => {
            if (shelf.isPlayerNear(this.player, 120)) {
                this.popup = shelf.popupId || "Hiện vật bí ẩn - Khám phá thêm!";
                interacted = true;
            }
        });
    }

    drawMap() {
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                const tile = this.map[y][x];
                const posX = x * this.tileSize;
                const posY = y * this.tileSize;
                let img = null;
                if (tile === "F" || tile === "C") img = this.floorImg;
                if (tile === "W") img = this.wallImg;
                if (tile === "S") img = this.shelfImg;
                if (img && img.complete && img.naturalWidth !== 0) {
                    this.ctx.drawImage(img, posX, posY, this.tileSize, this.tileSize);
                }
            }
        }
    }

    drawPlayer() {
        let img = this.playerImg; // fallback

        if (this.player.direction && this.playerImages) {
            switch (this.player.direction) {
                case "up":
                    img = this.playerImages.up || this.playerImg;
                    break;
                case "down":
                    img = this.playerImages.down || this.playerImg;
                    break;
                case "left":
                    img = this.playerImages.left || this.playerImg;
                    break;
                case "right":
                    img = this.playerImages.right || this.playerImg;
                    break;
            }
        }

        if (img && img.complete && img.naturalWidth !== 0) {
            this.ctx.drawImage(
                img,
                this.player.x - this.player.size / 2,
                this.player.y - this.player.size / 2,
                this.player.size,
                this.player.size
            );
        } else {
            this.ctx.fillStyle = "#ffcc00";
            this.ctx.fillRect(
                this.player.x - this.player.size / 2,
                this.player.y - this.player.size / 2,
                this.player.size,
                this.player.size
            );
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
        this.shelves.forEach(shelf => shelf.draw(this.ctx));
        this.drawPlayer();
        this.ctx.restore();

        // Gợi ý text khi gần tủ
        if (this.nearShelfText) {
            this.ctx.fillStyle = "rgba(0,0,0,0.6)";
            this.ctx.fillRect(this.canvas.width / 2 - 180, this.canvas.height - 80, 360, 50);
            this.ctx.fillStyle = "#ffffff";
            this.ctx.font = "bold 18px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(this.nearShelfText, this.canvas.width / 2, this.canvas.height - 55);
        }

        // Popup overlay
        if (this.popup) {
            this.ctx.fillStyle = "rgba(0,0,0,0.7)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            const boxWidth = 500;
            const boxHeight = 300;
            const boxX = (this.canvas.width - boxWidth) / 2;
            const boxY = (this.canvas.height - boxHeight) / 2;

            this.ctx.fillStyle = "#ffffff";
            this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

            this.ctx.fillStyle = "#000000";
            this.ctx.font = "24px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(this.popup, this.canvas.width / 2, boxY + boxHeight / 2 - 20);

            this.ctx.font = "18px Arial";
            this.ctx.fillText("Nhấn E để đóng", this.canvas.width / 2, boxY + boxHeight / 2 + 40);
        }
    }
}
