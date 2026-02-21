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
        this.activeArtifact = null; // Lưu id hiện vật đang mở
        this.uploadedFileURL = null;     // Link tạm thời của file upload
        this.uploadedFileName = "";      // Tên file
        this.uploadedFileType = "";      // Loại file (image/png, application/pdf,...)

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

        // Danh sách hiện vật riêng biệt (tên, mô tả, vị trí, ảnh riêng)
        this.artifacts = [
            {
                id: "4-3",
                name: "Hiện vật 4-3 - Rồng đất nung",
                description: "Đây là hiện vật ở Việt Nam từ rất lâu về trước.",
                x: 4 * this.tileSize + this.tileSize / 2,  // Vị trí đúng x=4
                y: 3 * this.tileSize + this.tileSize / 2,  // Vị trí đúng y=3
                img: this.loadImage("../assets/textures/artifact_4-3.png")
            },
            {
                id: "5-1",
                name: "Hiện vật 5-1 - Bình gốm cổ",
                description: "Đây là hiện vật cổ từ thời Lý - Trần.",
                x: 24 * this.tileSize + this.tileSize / 2,
                y: 3 * this.tileSize + this.tileSize / 2,
                img: this.loadImage("../assets/textures/artifact_5-1.png") // Nếu có ảnh
            }
            // Thêm hiện vật khác nếu cần
        ];

        // Load images cơ bản
        this.wallImg = this.loadImage("../assets/textures/wall.png");
        this.floorImg = this.loadImage("../assets/textures/floor.png");
        this.playerImg = this.loadImage("../assets/textures/player.png");
        this.shelfImg = this.loadImage("../assets/textures/shelf.png");
        this.plantImg = this.loadImage("../assets/textures/plant.png");
        this.tableImg = this.loadImage("../assets/textures/table.png");
        this.glassImg = this.loadImage("../assets/textures/glass.png");

        // Debug load ảnh hiện vật (xem console để kiểm tra)
        this.artifacts.forEach(art => {
            art.img.onload = () => console.log(`Ảnh ${art.name} đã load thành công!`);
            art.img.onerror = () => console.log(`Lỗi load ảnh ${art.name} - kiểm tra tên file/đường dẫn!`);
        });

        // Nút interact cho mobile
        this.interactBtn = document.getElementById("interactBtn");
        if (this.interactBtn) {
            this.interactBtn.addEventListener("touchstart", (e) => {
                e.preventDefault();
                this.handleInteract();
            });
            this.interactBtn.addEventListener("click", () => this.handleInteract());
        }

        // Xử lý upload file từ input
        this.uploadInput = document.getElementById("uploadArtifact");
        if (this.uploadInput) {
            this.uploadInput.addEventListener("change", (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.uploadedFileName = file.name;
                    this.uploadedFileType = file.type;
                    this.uploadedFileURL = URL.createObjectURL(file); // Tạo link tạm để hiển thị
                    console.log("File uploaded:", file.name, "Type:", file.type);
                    // Force redraw popup để hiện file mới
                    this.loop(); // Gọi lại loop để vẽ ngay
                }
            });
        }

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

        if (this.keys["w"] || this.keys["arrowup"]) newY -= this.player.speed;
        if (this.keys["s"] || this.keys["arrowdown"]) newY += this.player.speed;
        if (this.keys["a"] || this.keys["arrowleft"]) newX -= this.player.speed;
        if (this.keys["d"] || this.keys["arrowright"]) newX += this.player.speed;

        if (!this.keys["w"] && !this.keys["s"] && !this.keys["a"] && !this.keys["d"] &&
            !this.keys["arrowup"] && !this.keys["arrowdown"] && !this.keys["arrowleft"] && !this.keys["arrowright"] &&
            this.target) {
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

        if (!this.isColliding(newX, newY)) {
            this.player.x = newX;
            this.player.y = newY;
        }

        this.shelves.forEach(shelf => {
            if (shelf.isPlayerNear(this.player, 80)) {
                this.nearShelfText = "Nhấn E hoặc chạm nút để xem";
            }
        });

        if (this.interactBtn) {
            if (this.nearShelfText) {
                this.interactBtn.classList.add("active");
            } else {
                this.interactBtn.classList.remove("active");
            }
        }
    }

    isColliding(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        const tile = this.map[tileY]?.[tileX];
        return tile === "W" || tile === "S" || tile === "T" || tile === "G" || tile === "P";
    }

    handleInteract() {
        if (this.popup) {
            this.popup = null;
            this.activeArtifact = null;
            return;
        }

        let interacted = false;

        // Tủ cũ (shelves)
        this.shelves.forEach(shelf => {
            if (shelf.isPlayerNear(this.player, 120)) {
                this.popup = shelf.popupId || "Hiện vật bí ẩn - Khám phá thêm!";
                this.activeArtifact = null;
                interacted = true;
            }
        });

        // Check từng hiện vật riêng (tên + mô tả + ảnh riêng)
        this.artifacts.forEach(artifact => {
            const dist = Math.hypot(this.player.x - artifact.x, this.player.y - artifact.y);
            if (dist < 120) {
                this.activeArtifact = artifact.id;
                this.popup = artifact.name; // Tên riêng của hiện vật
                interacted = true;
            }
        });

        // Khi mở popup hiện vật, tự động mở input upload
        if (this.activeArtifact && this.uploadInput) {
            this.uploadInput.value = ""; // Reset input
            this.uploadInput.click();   // Mở hộp thoại chọn file
        }

        if (!interacted) {
            console.log("Không có hiện vật nào gần để tương tác");
        }
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
                if (tile === "T") img = this.tableImg || this.shelfImg;
                if (tile === "G") img = this.glassImg || this.shelfImg;
                if (tile === "P") img = this.plantImg;

                if (img && img.complete && img.naturalWidth !== 0) {
                    this.ctx.drawImage(img, posX, posY, this.tileSize, this.tileSize);
                }
            }
        }
    }

    drawPlayer() {
        const img = this.playerImg;

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

        if (this.nearShelfText) {
            this.ctx.fillStyle = "rgba(0,0,0,0.6)";
            this.ctx.fillRect(this.canvas.width / 2 - 180, this.canvas.height - 80, 360, 50);
            this.ctx.fillStyle = "#ffffff";
            this.ctx.font = "bold 18px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(this.nearShelfText, this.canvas.width / 2, this.canvas.height - 55);
        }

        if (this.popup) {
            this.ctx.fillStyle = "rgba(0,0,0,0.7)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            const boxWidth = 700;
            const boxHeight = 650;
            const boxX = (this.canvas.width - boxWidth) / 2;
            const boxY = (this.canvas.height - boxHeight) / 2;

            this.ctx.fillStyle = "#ffffff";
            this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

            this.ctx.fillStyle = "#000000";
            this.ctx.font = "bold 32px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText(this.popup || "Khám phá hiện vật", this.canvas.width / 2, boxY + 60);

            // Nếu có hiện vật gốc
            const currentArtifact = this.artifacts.find(a => a.id === this.activeArtifact);
            if (currentArtifact) {
                // Ảnh gốc (nếu có)
                if (currentArtifact.img && currentArtifact.img.complete && currentArtifact.img.naturalWidth !== 0) {
                    const imgWidth = 300;
                    const imgHeight = 300 * (currentArtifact.img.height / currentArtifact.img.width);
                    this.ctx.drawImage(currentArtifact.img, boxX + 50, boxY + 100, imgWidth, imgHeight);
                }

                // Mô tả gốc
                this.ctx.font = "20px Arial";
                this.ctx.fillText(currentArtifact.description, this.canvas.width / 2, boxY + 500);
            }

            // Phần upload & preview file người chơi tải lên
            this.ctx.font = "22px Arial";
            this.ctx.fillText("Tải file lên để xem hiện vật của bạn", this.canvas.width / 2, boxY + 550);

            // Nếu đã upload file
            if (this.uploadedFileURL) {
                if (this.uploadedFileType.startsWith('image/')) {
                    // Hiển thị ảnh preview
                    const uploadedImg = new Image();
                    uploadedImg.src = this.uploadedFileURL;
                    if (uploadedImg.complete) {
                        const imgWidth = 400;
                        const imgHeight = 400 * (uploadedImg.height / uploadedImg.width);
                        this.ctx.drawImage(uploadedImg, boxX + boxWidth - 450, boxY + 100, imgWidth, imgHeight);
                    } else {
                        uploadedImg.onload = () => this.loop(); // Redraw khi ảnh load xong
                    }
                } else {
                    // File không phải ảnh → hiển thị tên
                    this.ctx.font = "20px Arial";
                    this.ctx.fillText("File đã tải: " + this.uploadedFileName, boxX + boxWidth - 450, boxY + 150);
                }
            }

            this.ctx.font = "18px Arial";
            this.ctx.fillText("Nhấn E hoặc chạm nút để đóng", this.canvas.width / 2, boxY + boxHeight - 40);
        }
    }
}