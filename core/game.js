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

        // Base URL cho ảnh
        const base = "https://haiphongls1600-droid.github.io/museum-game/assets/textures/";

        // Hiện vật (caption đã xuống dòng 3 dòng)
        this.artifacts = [
            {
                id: "4-3",
                name: "Sơ đồ tổ chức bộ máy nhà nước",
                description: "Từ thời Lý Thái Tổ, bộ máy nhà nước dần được tổ chức chặt chẽ.\nĐến thời Lê Thánh Tông, mô hình quân chủ chuyên chế đạt đỉnh cao.\nHệ thống 6 bộ, cơ quan giám sát và chính quyền địa phương hoàn chỉnh.",
                x: 4 * this.tileSize + this.tileSize / 2,
                y: 3 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_4-3.png")
            },
            {
                id: "5-1",
                name: "Bộ luật Hồng Đức",
                description: "Bộ luật Hồng Đức (Quốc triều Hình luật) là bộ luật tiến bộ nhất thời phong kiến Việt Nam.\nBiên soạn dưới triều Lê Thánh Tông (1470-1497), gồm 13 chương, 722 điều.\nNổi bật tính nhân đạo, bảo vệ phụ nữ và người yếu thế, thể hiện chủ quyền dân tộc.",
                x: 24 * this.tileSize + this.tileSize / 2,
                y: 3 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_5-1.png")
            },
            // Hiện vật mới: vị trí 9;8
            {
                id: "9-8",
                name: "Tổ chức các khoa thi cử",
                description: "Hệ thống khoa cử Nho học phát triển mạnh từ thời Nhà Trần.\nMở khoa thi Thái học sinh năm 1232, quy định Tam khôi từ 1247.\nHoàn thiện dưới Nhà Lê sơ: 3 năm/khoa, thi nghiêm ngặt, Nho giáo độc tôn.",
                x: 9 * this.tileSize + this.tileSize / 2,
                y: 8 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_9-8.png")
            },
            // Hiện vật mới: vị trí 9;22
            {
                id: "9-22",
                name: "Tổ chức các khoa thi cử",
                description: "Hệ thống khoa cử Nho học phát triển mạnh từ thời Nhà Trần.\nMở khoa thi Thái học sinh năm 1232, quy định Tam khôi từ 1247.\nHoàn thiện dưới Nhà Lê sơ: 3 năm/khoa, thi nghiêm ngặt, Nho giáo độc tôn.",
                x: 9 * this.tileSize + this.tileSize / 2,
                y: 22 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_9-22.png")
            },
            // Hiện vật mới: vị trí 9;23
            {
                id: "9-23",
                name: "Hiện vật tại vị trí (9;23)",
                description: "Đây là hiện vật bạn tự thêm tại vị trí (9;23).\nCaption/mô tả chi tiết bạn có thể chỉnh sửa sau.\nẢnh: artifact_9-23.png",
                x: 9 * this.tileSize + this.tileSize / 2,
                y: 23 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_9-23.png")
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
            if (s.isPlayerNear(this.player, 200)) {
                this.popup = "Hiện vật bí ẩn";
                interacted = true;
            }
        });

        this.artifacts.forEach(a => {
            const d = Math.hypot(this.player.x - a.x, this.player.y - a.y);
            if (d < 250) {
                console.log(`Gần hiện vật ${a.id} (khoảng cách: ${d.toFixed(0)})`);
                this.activeArtifact = a.id;
                this.popup = a.name;
                interacted = true;
            }
        });

        if (!interacted) {
            console.log("Không có hiện vật nào gần để tương tác");
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

            const bw = 700; // tăng chiều rộng popup để chữ không bị cắt
            const bh = 650;
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

                    // Vẽ mô tả (xuống dòng tự động nếu quá dài + giữ \n)
                    this.ctx.font = "20px Arial";
                    this.ctx.textAlign = "center";
                    const maxWidth = bw - 80; // giới hạn chiều rộng chữ
                    let lineY = by + 100 + ih + 60;
                    const lines = art.description.split('\n');
                    lines.forEach(originalLine => {
                        const words = originalLine.split(' ');
                        let currentLine = '';
                        words.forEach(word => {
                            const testLine = currentLine + word + ' ';
                            const metrics = this.ctx.measureText(testLine);
                            if (metrics.width > maxWidth && currentLine !== '') {
                                this.ctx.fillText(currentLine, this.canvas.width / 2, lineY);
                                lineY += 30;
                                currentLine = word + ' ';
                            } else {
                                currentLine = testLine;
                            }
                        });
                        this.ctx.fillText(currentLine, this.canvas.width / 2, lineY);
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
