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

        // === THÊM NPC ===
        this.npcs = [
            {
                id: "guide",
                name: "Hướng dẫn viên",
                x: 10 * this.tileSize + this.tileSize / 2,  // cột 10
                y: 3 * this.tileSize + this.tileSize / 2,   // hàng 3
                description: "Chào mừng bạn đến với Bảo tàng Lịch sử Việt Nam!\n" +
                             "Đây là nơi lưu giữ những hiện vật quý giá từ thời Lý - Trần - Lê.\n" +
                             "Bạn có thể di chuyển bằng phím WASD hoặc click chuột vào vị trí mong muốn.\n" +
                             "Đứng gần kệ trưng bày (S) hoặc hiện vật rồi nhấn E để xem chi tiết.\n" +
                             "Chúc bạn có trải nghiệm thú vị và học hỏi được nhiều điều!",
                img: this.loadImage("https://haiphongls1600-droid.github.io/museum-game/assets/textures/npc_guide.png")  // ảnh NPC (upload nếu có)
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

        // Hiện vật (giữ nguyên phần của bạn)
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
            {
                id: "9-8",
                name: "Tổ chức các khoa thi cử",
                description: "Hệ thống khoa cử Nho học phát triển mạnh từ thời Nhà Trần.\nMở khoa thi Thái học sinh năm 1232, quy định Tam khôi từ 1247.\nHoàn thiện dưới Nhà Lê sơ: 3 năm/khoa, thi nghiêm ngặt, Nho giáo độc tôn.",
                x: 9 * this.tileSize + this.tileSize / 2,
                y: 8 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_9-8.png")
            },
            {
                id: "9-22",
                name: "Tổ chức các khoa thi cử",
                description: "Hệ thống khoa cử Nho học phát triển mạnh từ thời Nhà Trần.\nMở khoa thi Thái học sinh năm 1232, quy định Tam khôi từ 1247.\nHoàn thiện dưới Nhà Lê sơ: 3 năm/khoa, thi nghiêm ngặt, Nho giáo độc tôn.",
                x: 9 * this.tileSize + this.tileSize / 2,
                y: 22 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_9-22.png")
            },
            {
                id: "9-23",
                name: "Hiện vật tại vị trí (9;23)",
                description: "Đây là hiện vật bạn tự thêm tại vị trí (9;23).\nCaption/mô tả chi tiết bạn có thể chỉnh sửa sau.\nẢnh: artifact_9-23.png",
                x: 9 * this.tileSize + this.tileSize / 2,
                y: 23 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_9-23.png")
            },
            // Các hiện vật khác bạn đã có (giữ nguyên)
            {
                id: "4-30",
                name: "Hiện vật tại (4;30)",
                description: "Đây là hiện vật mới tại vị trí (4;30).\nCaption/mô tả chi tiết bạn có thể chỉnh sửa sau.\nẢnh: artifact_4-30.png",
                x: 4 * this.tileSize + this.tileSize / 2,
                y: 30 * this.tileSize + this.tileSize / 2,
                img: this.loadImage(base + "artifact_4-30.png")
            },
            // ... (các hiện vật khác giữ nguyên)
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

        // Phát hiện gần shelf
        this.nearShelfText = null;
        this.shelves.forEach(s => {
            if (s.isPlayerNear(this.player, 80)) {
                this.nearShelfText = "Nhấn E để xem";
            }
        });

        // Phát hiện gần NPC
        this.nearNpcText = null;
        this.npcs.forEach(npc => {
            const d = Math.hypot(this.player.x - npc.x, this.player.y - npc.y);
            if (d < 150) {
                this.nearNpcText = "Nhấn E để trò chuyện với " + npc.name;
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

        // 1. Kiểm tra NPC trước
        this.npcs.forEach(npc => {
            const d = Math.hypot(this.player.x - npc.x, this.player.y - npc.y);
            if (d < 150) {
                this.popup = "npc_intro";
                this.activeNpc = npc.id;
                interacted = true;
                return;
            }
        });

        // 2. Kiểm tra artifacts
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

        // 3. Kiểm tra shelves
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

    // Vẽ NPC
    drawNpcs() {
        this.npcs.forEach(npc => {
            if (npc.img?.complete && npc.img.naturalWidth) {
                this.ctx.drawImage(npc.img, npc.x - 32, npc.y - 64, 64, 128);  // kích thước NPC
            } else {
                // Hình thay thế nếu chưa có ảnh
                this.ctx.fillStyle = "#8B4513";  // màu nâu
                this.ctx.fillRect(npc.x - 32, npc.y - 64, 64, 128);
                this.ctx.fillStyle = "#fff";
                this.ctx.font = "16px Arial";
                this.ctx.textAlign = "center";
                this.ctx.fillText("NPC", npc.x, npc.y - 20);
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
        this.drawNpcs();  // vẽ NPC
        this.drawPlayer();
        this.ctx.restore();

        // Text gần shelf
        if (this.nearShelfText) {
            this.ctx.fillStyle = "rgba(0,0,0,0.6)";
            this.ctx.fillRect(this.canvas.width / 2 - 180, this.canvas.height - 80, 360, 50);
            this.ctx.fillStyle = "#fff";
            this.ctx.font = "bold 18px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(this.nearShelfText, this.canvas.width / 2, this.canvas.height - 55);
        }

        // Text gần NPC
        if (this.nearNpcText) {
            this.ctx.fillStyle = "rgba(0,0,0,0.6)";
            this.ctx.fillRect(this.canvas.width / 2 - 220, this.canvas.height - 140, 440, 50);
            this.ctx.fillStyle = "#fff";
            this.ctx.font = "bold 18px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(this.nearNpcText, this.canvas.width / 2, this.canvas.height - 115);
        }

        // Popup
        if (this.popup) {
            if (this.popup === "npc_intro") {
                const npc = this.npcs.find(n => n.id === this.activeNpc);
                if (npc) {
                    this.ctx.fillStyle = "rgba(0,0,0,0.7)";
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                    const bw = 800;
                    const bh = 500;
                    const bx = (this.canvas.width - bw) / 2;
                    const by = (this.canvas.height - bh) / 2;

                    this.ctx.fillStyle = "#fff";
                    this.ctx.fillRect(bx, by, bw, bh);

                    // Tiêu đề
                    this.ctx.fillStyle = "#000";
                    this.ctx.font = "bold 36px Arial";
                    this.ctx.textAlign = "center";
                    this.ctx.fillText(npc.name, this.canvas.width / 2, by + 80);

                    // Ảnh NPC (nếu có)
                    if (npc.img?.complete && npc.img.naturalWidth) {
                        this.ctx.drawImage(npc.img, bx + 40, by + 120, 200, 300);
                    }

                    // Nội dung giới thiệu
                    this.ctx.font = "24px Arial";
                    this.ctx.textAlign = "left";
                    let lineY = by + 140;
                    const lines = npc.description.split('\n');
                    lines.forEach(line => {
                        this.ctx.fillText(line, bx + 260, lineY);
                        lineY += 40;
                    });

                    // Hướng dẫn đóng
                    this.ctx.font = "20px Arial";
                    this.ctx.textAlign = "center";
                    this.ctx.fillText("Nhấn E để đóng", this.canvas.width / 2, by + bh - 40);
                }
            } else {
                // Popup hiện vật cũ (giữ nguyên phần của bạn)
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
