import { Shelf } from "./entities/Shelf.js";
import { museumMap } from "./map.js";

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.tileSize = 64;
        this.map = museumMap;
        this.zoom = 1.0; // Giảm zoom để game đi mượt, sau tăng lại 1.2 nếu muốn

        this.resize();
        window.addEventListener("resize", this.resize.bind(this));

        this.player = {
            x: 12 * this.tileSize,
            y: 8 * this.tileSize,
            size: this.tileSize,
            speed: 4,
            direction: "down"
        };

        this.keys = {};
        this.shelves = [];
        this.target = null;
        this.popup = null;
        this.nearShelfText = null;
        this.activeArtifact = null;

        // Tạo shelves
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x] === "S") {
                    const shelfX = x * this.tileSize + this.tileSize / 2;
                    const shelfY = y * this.tileSize + this.tileSize / 2;
                    this.shelves.push(new Shelf(shelfX, shelfY, 40, 20, `Hiện vật ${x}-${y}`));
                }
            }
        }

        // Hiện vật (sửa đường dẫn ảnh đúng)
        this.artifacts = [
            {
                id: "4-3",
                name: "Hiện vật 4-3 - Rồng đất nung",
                description: "Đây là hiện vật ở Việt Nam từ rất lâu về trước.",
                x: 4 * this.tileSize + this.tileSize / 2,
                y: 3 * this.tileSize + this.tileSize / 2,
                img: this.loadImage("../assets/textures/artifact_4-3.png")
            },
            {
                id: "5-1",
                name: "Hiện vật 5-1 - Bình gốm cổ",
                description: "Đây là hiện vật cổ từ thời Lý - Trần.",
                x: 24 * this.tileSize + this.tileSize / 2,
                y: 3 * this.tileSize + this.tileSize / 2,
                img: this.loadImage("../assets/textures/artifact_5-1.png")
            }
        ];

        // Load images (sửa tên file khớp repo)
        this.wallImg = this.loadImage("../assets/textures/wall.png");
        this.floorImg = this.loadImage("../assets/textures/floor.png");
        this.playerImg = this.loadImage("../assets/textures/player.png");
        this.shelfImg = this.loadImage("../assets/textures/shelf.png");
        this.plantImg = this.loadImage("../assets/textures/plant.png");
        this.tableImg = this.loadImage("../assets/textures/table.png");
        this.glassImg = this.loadImage("../assets/textures/glass.png");

        // Debug load ảnh
        this.artifacts.forEach(art => {
            art.img.onload = () => console.log(`Ảnh ${art.name} load OK`);
            art.img.onerror = () => console.log(`Lỗi load ${art.name} - kiểm tra tên file/đường dẫn`);
        });

        // Mobile button
        this.interactBtn = document.getElementById("interactBtn");
        if (this.interactBtn) {
            this.interactBtn.addEventListener("touchstart", e => {
                e.preventDefault();
                this.handleInteract();
            });
            this.interactBtn.addEventListener("click", () => this.handleInteract());
        }

        // Keys
        window.addEventListener("keydown", e => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key.toLowerCase() === "e") this.handleInteract();
        });
        window.addEventListener("keyup", e => this.keys[e.key.toLowerCase()] = false);

        // Click move
        this.canvas.addEventListener("click", e => {
            if (this.popup) return;
            const rect = this.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const wx = this.player.x + (mx - this.canvas.width / 2) / this.zoom;
            const wy = this.player.y + (my - this.canvas.height / 2) / this.zoom;
            this.target = { x: wx, y: wy };
        });

        this.loop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    loadImage(path) {
        const img = new Image();
        img.src = path; // Không dùng new URL để tránh lỗi import.meta
        return img;
    }

    update() {
        let nx = this.player.x;
        let ny = this.player.y;

        if (this.keys["w"] || this.keys["arrowup"]) ny -= this.player.speed;
        if (this.keys["s"] || this.keys["arrowdown"]) ny += this.player.speed;
        if (this.keys["a"] || this.keys["arrowleft"]) nx -= this.player.speed;
        if (this.keys["d"] || this.keys["arrowright"]) nx += this.player.speed;

        if (this.target) {
            const dx = this.target.x - this.player.x;
            const dy = this.target.y - this.player.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 5) {
                nx += (dx / dist) * this.player.speed;
                ny += (dy / dist) * this.player.speed;
            } else {
                this.target = null;
            }
        }

        if (!this.isColliding(nx, ny)) {
            this.player.x = nx;
            this.player.y = ny;
        }

        this.nearShelfText = null;
        this.shelves.forEach(s => {
            if (s.isPlayerNear(this.player, 80)) {
                this.nearShelfText = "Nhấn E để xem";
            }
        });

        if (this.interactBtn) {
            this.interactBtn.classList.toggle("active", !!this.nearShelfText);
        }
    }

    isColliding(x, y) {
        const tx = Math.floor(x / this.tileSize);
        const ty = Math.floor(y / this.tileSize);
        return this.map[ty]?.[tx] === "W" || this.map[ty]?.[tx] === "S";
    }

    handleInteract() {
        if (this.popup) {
            this.popup = null;
            this.activeArtifact = null;
            return;
        }

        let interacted = false;
        this.shelves.forEach(s => {
            if (s.isPlayerNear(this.player, 120)) {
                this.popup = "Hiện vật bí ẩn";
                interacted = true;
            }
        });

        this.artifacts.forEach(a => {
            const d = Math.hypot(this.player.x - a.x, this.player.y - a.y);
            if (d < 120) {
                this.activeArtifact = a.id;
                this.popup = a.name;
                interacted = true;
            }
        });
    }

    drawMap() {
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                const tile = this.map[y][x];
                const px = x * this.tileSize;
                const py = y * this.tileSize;
                let img;
                if (tile === "F" || tile === "C") img = this.floorImg;
                if (tile === "W") img = this.wallImg;
                if (tile === "S") img = this.shelfImg;
                if (tile === "T") img = this.tableImg || this.shelfImg;
                if (tile === "G") img = this.glassImg || this.shelfImg;
                if (tile === "P") img = this.plantImg;

                if (img?.complete && img.naturalWidth) {
                    this.ctx.drawImage(img, px, py, this.tileSize, this.tileSize);
                }
            }
        }
    }

    drawPlayer() {
        const img = this.playerImg;
        if (img?.complete && img.naturalWidth) {
            this.ctx.drawImage(img, this.player.x - this.player.size / 2, this.player.y - this.player.size / 2, this.player.size, this.player.size);
        } else {
            this.ctx.fillStyle = "#ffcc00";
            this.ctx.fillRect(this.player.x - this.player.size / 2, this.player.y - this.player.size / 2, this.player.size, this.player.size);
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
        this.shelves.forEach(s => s.draw(this.ctx));
        this.drawPlayer();
        this.ctx.restore();

        if (this.nearShelfText) {
            this.ctx.fillStyle = "rgba(0,0,0,0.6)";
            this.ctx.fillRect(this.canvas.width / 2 - 180, this.canvas.height - 80, 360, 50);
            this.ctx.fillStyle = "#fff";
            this.ctx.font = "bold 18px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(this.nearShelfText, this.canvas.width / 2, this.canvas.height - 55);
        }

        if (this.popup) {
            this.ctx.fillStyle = "rgba(0,0,0,0.7)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            const bw = 600, bh = 550;
            const bx = (this.canvas.width - bw) / 2;
            const by = (this.canvas.height - bh) / 2;
            this.ctx.fillStyle = "#fff";
            this.ctx.fillRect(bx, by, bw, bh);
            this.ctx.fillStyle = "#000";
            this.ctx.font = "bold 32px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText(this.popup, this.canvas.width / 2, by + 60);
            const art = this.artifacts.find(a => a.id === this.activeArtifact);
            if (art) {
                if (art.img?.complete && art.img.naturalWidth) {
                    const iw = 400;
                    const ih = 400 * (art.img.height / art.img.width);
                    this.ctx.drawImage(art.img, this.canvas.width / 2 - iw / 2, by + 100, iw, ih);
                    this.ctx.font = "20px Arial";
                    this.ctx.fillText(art.description, this.canvas.width / 2, by + 100 + ih + 40);
                } else {
                    this.ctx.font = "20px Arial";
                    this.ctx.fillText("(Ảnh đang tải...)", this.canvas.width / 2, by + 250);
                }
            }
            this.ctx.font = "18px Arial";
            this.ctx.fillText("Nhấn E để đóng", this.canvas.width / 2, by + bh - 40);
        }
    }
}
