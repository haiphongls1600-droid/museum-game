import { Shelf } from "../entities/Shelf.js";
import { museumMap } from "./map.js";

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.tileSize = 64;
        this.map = museumMap;
        this.zoom = 1.2;

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

        // === NPC tại hàng 3, cột 10 ===
        this.npcs = [
            {
                id: "guide",
                name: "Hướng dẫn viên",
                x: 10 * this.tileSize + this.tileSize / 2,
                y: 3 * this.tileSize + this.tileSize / 2,
                img: this.loadImage("https://haiphongls1600-droid.github.io/museum-game/assets/textures/npc_guide.png") // ảnh NPC (tùy chọn)
            }
        ];
        this.nearNpcText = null;
        this.activeNpc = null;

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

        // Base URL cho ảnh hiện vật
        const base = "https://haiphongls1600-droid.github.io/museum-game/assets/textures/";

        // === Mảng artifacts gắn đúng vị trí tất cả 14 shelf ===
        this.artifacts = [
            // Phòng chính
            {
                id: "3-3",
                name: "Hiện vật (3,3)",
                description: "Mô tả hiện vật tại vị trí (3,3) - phòng chính",
                x: 3 * this.tileSize + this.tileSize / 2,
                y: 3 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_3-3.png")
            },
            {
                id: "24-3",
                name: "Hiện vật (24,3)",
                description: "Mô tả hiện vật tại vị trí (24,3) - phòng chính",
                x: 24 * this.tileSize + this.tileSize / 2,
                y: 3 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_24-3.png")
            },
            {
                id: "8-9",
                name: "Hiện vật (8,9)",
                description: "Mô tả hiện vật tại vị trí (8,9) - phòng chính",
                x: 8 * this.tileSize + this.tileSize / 2,
                y: 9 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_8-9.png")
            },
            {
                id: "9-9",
                name: "Hiện vật (9,9)",
                description: "Mô tả hiện vật tại vị trí (9,9) - phòng chính",
                x: 9 * this.tileSize + this.tileSize / 2,
                y: 9 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_9-9.png")
            },
            {
                id: "22-9",
                name: "Hiện vật (22,9)",
                description: "Mô tả hiện vật tại vị trí (22,9) - phòng chính",
                x: 22 * this.tileSize + this.tileSize / 2,
                y: 9 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_22-9.png")
            },
            {
                id: "23-9",
                name: "Hiện vật (23,9)",
                description: "Mô tả hiện vật tại vị trí (23,9) - phòng chính",
                x: 23 * this.tileSize + this.tileSize / 2,
                y: 9 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_23-9.png")
            },

            // Phòng mới
            {
                id: "7-16",
                name: "Hiện vật (7,16)",
                description: "Mô tả hiện vật tại vị trí (7,16) - phòng mới",
                x: 7 * this.tileSize + this.tileSize / 2,
                y: 16 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_7-16.png")
            },
            {
                id: "8-16",
                name: "Hiện vật (8,16)",
                description: "Mô tả hiện vật tại vị trí (8,16) - phòng mới",
                x: 8 * this.tileSize + this.tileSize / 2,
                y: 16 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_8-16.png")
            },
            {
                id: "7-17",
                name: "Hiện vật (7,17)",
                description: "Mô tả hiện vật tại vị trí (7,17) - phòng mới",
                x: 7 * this.tileSize + this.tileSize / 2,
                y: 17 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_7-17.png")
            },
            {
                id: "8-17",
                name: "Hiện vật (8,17)",
                description: "Mô tả hiện vật tại vị trí (8,17) - phòng mới",
                x: 8 * this.tileSize + this.tileSize / 2,
                y: 17 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_8-17.png")
            },
            {
                id: "3-18",
                name: "Hiện vật (3,18)",
                description: "Mô tả hiện vật tại vị trí (3,18) - phòng mới",
                x: 3 * this.tileSize + this.tileSize / 2,
                y: 18 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_3-18.png")
            },
            {
                id: "23-18",
                name: "Hiện vật (23,18)",
                description: "Mô tả hiện vật tại vị trí (23,18) - phòng mới",
                x: 23 * this.tileSize + this.tileSize / 2,
                y: 18 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_23-18.png")
            },
            {
                id: "8-19",
                name: "Hiện vật (8,19)",
                description: "Mô tả hiện vật tại vị trí (8,19) - phòng mới",
                x: 8 * this.tileSize + this.tileSize / 2,
                y: 19 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_8-19.png")
            },
            {
                id: "23-19",
                name: "Hiện vật (23,19)",
                description: "Mô tả hiện vật tại vị trí (23,19) - phòng mới",
                x: 23 * this.tileSize + this.tileSize / 2,
                y: 19 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_23-19.png")
            }
        ];

        // Load images cơ bản
        this.wallImg = this.loadImage(base + "wall.png");
        this.floorImg = this.loadImage(base + "floor.png");
        this.playerImg = this.loadImage(base + "player.png");
        this.shelfImg = this.loadImage(base + "shelf.png");
        this.plantImg = this.loadImage(base + "plant.png");

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
        });
        window.addEventListener("keyup", e => {
            this.keys[e.key.toLowerCase()] = false;
            if (e.key.toLowerCase() === "e") this.handleInteract();
        });

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
        img.src = path;
        img.onload = () => console.log(`Load OK: ${path}`);
        img.onerror = () => console.error(`Load FAIL (404?): ${path}`);
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

        this.nearNpcText = null;
        this.npcs.forEach(npc => {
            const d = Math.hypot(this.player.x - npc.x, this.player.y - npc.y);
            if (d < 150) {
                this.nearNpcText = "Nhấn E để trò chuyện";
            }
        });

        if (this.interactBtn) {
            this.interactBtn.classList.toggle("active", !!this.nearShelfText || !!this.nearNpcText);
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
            this.activeNpc = null;
            return;
        }

        let interacted = false;

        // Kiểm tra NPC
        this.npcs.forEach(npc => {
            const d = Math.hypot(this.player.x - npc.x, this.player.y - npc.y);
            if (d < 150) {
                this.popup = "npc_intro";
                this.activeNpc = npc.id;
                interacted = true;
                return;
            }
        });

        // Kiểm tra artifacts
        if (!interacted) {
            this.artifacts.forEach(a => {
                const d = Math.hypot(this.player.x - a.x, this.player.y - a.y);
                if (d < 450) {
                    console.log(`Gần hiện vật ${a.id} (khoảng cách: ${d.toFixed(0)})`);
                    this.activeArtifact = a.id;
                    this.popup = "artifact_fullscreen";
                    interacted = true;
                    return;
                }
            });
        }

        // Kiểm tra shelves
        if (!interacted) {
            this.shelves.forEach(s => {
                if (s.isPlayerNear(this.player, 250)) {
                    this.popup = "Hiện vật bí ẩn";
                    interacted = true;
                }
            });
        }

        if (!interacted) {
            console.log("Không có hiện vật/NPC nào gần để tương tác");
        }
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

    drawNpcs() {
        this.npcs.forEach(npc => {
            if (npc.img?.complete && npc.img.naturalWidth) {
                this.ctx.drawImage(npc.img, npc.x - 32, npc.y - 32, 64, 64);
            } else {
                this.ctx.fillStyle = "#8B4513";
                this.ctx.fillRect(npc.x - 32, npc.y - 32, 64, 64);
            }
        });
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
        this.drawNpcs();
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

        if (this.nearNpcText) {
            this.ctx.fillStyle = "rgba(0,0,0,0.6)";
            this.ctx.fillRect(this.canvas.width / 2 - 220, this.canvas.height - 140, 440, 50);
            this.ctx.fillStyle = "#fff";
            this.ctx.font = "bold 18px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(this.nearNpcText, this.canvas.width / 2, this.canvas.height - 115);
        }

        if (this.popup) {
            if (this.popup === "npc_intro") {
                this.ctx.fillStyle = "rgba(0,0,0,0.7)";
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                const pw = 800; // chỉnh rộng ảnh popup
                const ph = 600; // chỉnh cao ảnh popup
                const px = (this.canvas.width - pw) / 2;
                const py = (this.canvas.height - ph) / 2;

                const popupImg = new Image();
                popupImg.src = "https://haiphongls1600-droid.github.io/museum-game/assets/textures/popup_npc.png";

                if (popupImg.complete && popupImg.naturalWidth > 0) {
                    this.ctx.drawImage(popupImg, px, py, pw, ph);
                } else {
                    this.ctx.fillStyle = "#ffffff";
                    this.ctx.fillRect(px, py, pw, ph);
                    this.ctx.fillStyle = "#000000";
                    this.ctx.font = "32px Arial";
                    this.ctx.textAlign = "center";
                    this.ctx.textBaseline = "middle";
                    this.ctx.fillText("Đang tải ảnh giới thiệu...", this.canvas.width / 2, this.canvas.height / 2);
                    this.ctx.font = "20px Arial";
                    this.ctx.fillText("(Upload popup_npc.png vào assets/textures/)", this.canvas.width / 2, this.canvas.height / 2 + 50);
                }

                this.ctx.font = "20px Arial";
                this.ctx.fillStyle = "#ffffff";
                this.ctx.textAlign = "center";
                this.ctx.fillText("Nhấn E để đóng", this.canvas.width / 2, this.canvas.height - 40);
            } else {
                const art = this.artifacts.find(a => a.id === this.activeArtifact);
                if (this.popup === "artifact_fullscreen" && art && art.img?.complete && art.img.naturalWidth) {
                    const canvasRatio = this.canvas.width / this.canvas.height;
                    const imgRatio = art.img.width / art.img.height;
                    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
                    if (imgRatio > canvasRatio) {
                        drawWidth = this.canvas.width;
                        drawHeight = drawWidth / imgRatio;
                        offsetY = (this.canvas.height - drawHeight) / 2;
                    } else {
                        drawHeight = this.canvas.height;
                        drawWidth = drawHeight * imgRatio;
                        offsetX = (this.canvas.width - drawWidth) / 2;
                    }
                    this.ctx.drawImage(art.img, offsetX, offsetY, drawWidth, drawHeight);
                } else {
                    this.ctx.fillStyle = "rgba(0,0,0,0.7)";
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    const bw = 700;
                    const bh = 650;
                    const bx = (this.canvas.width - bw) / 2;
                    const by = (this.canvas.height - bh) / 2;
                    this.ctx.fillStyle = "#fff";
                    this.ctx.fillRect(bx, by, bw, bh);
                    this.ctx.fillStyle = "#000";
                    this.ctx.font = "bold 32px Arial";
                    this.ctx.textAlign = "center";
                    this.ctx.fillText(this.popup || "Hiện vật bí ẩn", this.canvas.width / 2, by + 60);
                    if (art) {
                        if (art.img?.complete && art.img.naturalWidth) {
                            const iw = 400;
                            const ih = 400 * (art.img.height / art.img.width);
                            this.ctx.drawImage(art.img, this.canvas.width / 2 - iw / 2, by + 100, iw, ih);
                            this.ctx.font = "20px Arial";
                            const lines = art.description.split('\n');
                            let lineY = by + 100 + ih + 60;
                            lines.forEach(line => {
                                this.ctx.fillText(line, this.canvas.width / 2, lineY);
                                lineY += 30;
                            });
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
    }
}
