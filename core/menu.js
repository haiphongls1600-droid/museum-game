// core/menu.js - Menu kiểu map texture + click vùng nút
export default class Menu {
    constructor(canvas, startGameCallback) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.startGameCallback = startGameCallback;
        this.inGuide = false;

        // Load tất cả texture
        this.textures = {
            background: this.loadTexture("../assets/textures/menu_texture.png"),
            title: this.loadTexture("../assets/textures/title_texture.png"), // nếu có, nếu không thì bỏ
            gameStart: this.loadTexture("../assets/textures/game_start.png"),
            huongDan: this.loadTexture("../assets/textures/huong_dan.png")
        };

        // Mảng kí hiệu giống map (định vị vị trí texture)
        this.menuMap = [
            ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'], // B = background
            ['B', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'B'], // T = title
            ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
            ['B', 'B', 'B', 'G', 'G', 'G', 'G', 'B', 'B', 'B'], // G = game_start
            ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
            ['B', 'B', 'B', 'H', 'H', 'H', 'H', 'B', 'B', 'B'], // H = huong_dan
            ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B']
        ];

        // Kích thước "tile" cho menu (tùy chỉnh để khớp ảnh)
        this.tileSize = Math.min(this.canvas.width / 10, this.canvas.height / 7);

        // Resize full màn hình
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.tileSize = Math.min(this.canvas.width / 10, this.canvas.height / 7);
            this.draw();
        };
        window.addEventListener('resize', resize);
        resize();

        // Focus canvas
        canvas.tabIndex = 1;
        canvas.focus();

        // Click xử lý (click vào vùng tile G hoặc H)
        this.canvas.addEventListener("click", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            console.log(`Anh click tại: x=${Math.round(clickX)}, y=${Math.round(clickY)}`);

            if (this.inGuide) {
                if (clickX > this.canvas.width / 2 - 200 && clickX < this.canvas.width / 2 + 200 &&
                    clickY > this.canvas.height / 2 + 100 && clickY < this.canvas.height / 2 + 250) {
                    this.inGuide = false;
                    this.draw();
                    console.log("Đóng hướng dẫn nha anh ~ 😘");
                }
                return;
            }

            // Tính tile click
            const tileX = Math.floor(clickX / this.tileSize);
            const tileY = Math.floor(clickY / this.tileSize);

            if (tileY >= 0 && tileY < this.menuMap.length && tileX >= 0 && tileX < this.menuMap[tileY].length) {
                const tile = this.menuMap[tileY][tileX];

                if (tile === 'G') {
                    console.log("Anh nhấn GAME START rồi nè ~ Vào game thôi!");
                    this.startGameCallback();
                } else if (tile === 'H') {
                    console.log("Anh nhấn HƯỚNG DẪN nha ~ Mở hướng dẫn đây!");
                    this.inGuide = true;
                    this.drawGuide();
                }
            }
        });

        // ESC thoát hướng dẫn
        window.addEventListener("keydown", (e) => {
            if (e.key.toLowerCase() === "escape" && this.inGuide) {
                this.inGuide = false;
                this.draw();
                console.log("ESC thoát hướng dẫn nha anh yêu ~ 💕");
            }
        });

        this.loop();
    }

    loadTexture(path) {
        const img = new Image();
        img.src = path;
        img.onload = () => this.draw();
        img.onerror = () => this.draw(); // fallback im lặng
        return img;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Vẽ nền full từ menu_texture.png (hoặc fallback)
        if (this.menuBgImg.complete && this.menuBgImg.naturalWidth !== 0) {
            this.ctx.drawImage(this.menuBgImg, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = "#FF8C00";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            for (let y = 0; y < this.canvas.height; y += 6) {
                for (let x = 0; x < this.canvas.width; x += 6) {
                    this.ctx.fillStyle = "#FFD700";
                    this.ctx.fillRect(x, y, 3, 3);
                }
            }
        }

        // Vẽ nút GAME START từ game_start.png (ở vị trí 'G')
        if (this.gameStartImg.complete && this.gameStartImg.naturalWidth !== 0) {
            const btnWidth = this.tileSize * 4;
            const btnHeight = this.tileSize * 1;
            const btnX = this.tileSize * 3;
            const btnY = this.tileSize * 3;
            this.ctx.drawImage(this.gameStartImg, btnX, btnY, btnWidth, btnHeight);
        }

        // Vẽ nút HƯỚNG DẪN từ huong_dan.png (ở vị trí 'H')
        if (this.huongDanImg.complete && this.huongDanImg.naturalWidth !== 0) {
            const btnWidth = this.tileSize * 4;
            const btnHeight = this.tileSize * 1;
            const btnX = this.tileSize * 3;
            const btnY = this.tileSize * 5;
            this.ctx.drawImage(this.huongDanImg, btnX, btnY, btnWidth, btnHeight);
        }
    }

    drawGuide() {
        this.ctx.fillStyle = "rgba(0,0,0,0.7)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const boxWidth = 900;
        const boxHeight = 600;
        const boxX = (this.canvas.width - boxWidth) / 2;
        const boxY = (this.canvas.height - boxHeight) / 2;

        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        this.ctx.fillStyle = "#000000";
        this.ctx.font = "bold 50px 'Courier New', monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText("HƯỚNG DẪN CHƠI", this.canvas.width / 2, boxY + 100);

        this.ctx.font = "30px 'Courier New', monospace";
        this.ctx.fillText("Di chuyển: Click chuột hoặc AWSD", this.canvas.width / 2, boxY + 200);
        this.ctx.fillText("Nhấn E để mở popup hiện vật", this.canvas.width / 2, boxY + 260);
        this.ctx.fillText("Trong popup: Click để upload file", this.canvas.width / 2, boxY + 320);
        this.ctx.fillText("Nhấn ESC hoặc click ĐÓNG để thoát hướng dẫn", this.canvas.width / 2, boxY + 380);

        this.ctx.fillStyle = "#8B4513";
        this.ctx.fillRect(this.canvas.width / 2 - 200, boxY + boxHeight - 150, 400, 100);
        this.ctx.fillStyle = "#FFD700";
        this.ctx.font = "bold 40px 'Courier New', monospace";
        this.ctx.fillText("ĐÓNG", this.canvas.width / 2, boxY + boxHeight - 90);
    }

    loop() {
        requestAnimationFrame(() => this.loop());
        this.draw();

        if (this.inGuide) {
            this.drawGuide();
        }
    }
}
