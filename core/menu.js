// core/menu.js - Menu dùng texture pack + 2 nút riêng game_start.png và huong_dan.png
export default class Menu {
    constructor(canvas, startGameCallback) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.startGameCallback = startGameCallback;
        this.inGuide = false;

        // Load nền + tiêu đề
        this.menuBgImg = new Image();
        this.menuBgImg.src = "../assets/textures/menu_texture.png";
        this.menuBgImg.onload = () => this.draw();
        this.menuBgImg.onerror = () => this.draw(); // fallback im lặng

        // Load nút GAME START
        this.gameStartImg = new Image();
        this.gameStartImg.src = "../assets/textures/game_start.png";
        this.gameStartImg.onload = () => this.draw();
        this.gameStartImg.onerror = () => this.draw(); // không lỗi

        // Load nút HƯỚNG DẪN
        this.huongDanImg = new Image();
        this.huongDanImg.src = "../assets/textures/huong_dan.png";
        this.huongDanImg.onload = () => this.draw();
        this.huongDanImg.onerror = () => this.draw(); // không lỗi

        // Resize full màn hình
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.draw();
        };
        window.addEventListener('resize', resize);
        resize();

        // Focus canvas
        canvas.tabIndex = 1;
        canvas.focus();

        // Click xử lý
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

            // Vùng nút GAME START (từ game_start.png)
            const gameStartX = this.canvas.width / 2 - 200;
            const gameStartY = this.canvas.height / 2 - 100;
            if (clickX > gameStartX && clickX < gameStartX + 400 &&
                clickY > gameStartY && clickY < gameStartY + 80) {
                console.log("Anh nhấn GAME START rồi nè ~ Vào game thôi!");
                this.startGameCallback();
                return;
            }

            // Vùng nút HƯỚNG DẪN (từ huong_dan.png)
            const huongDanX = this.canvas.width / 2 - 200;
            const huongDanY = this.canvas.height / 2 + 50;
            if (clickX > huongDanX && clickX < huongDanX + 400 &&
                clickY > huongDanY && clickY < huongDanY + 80) {
                console.log("Anh nhấn HƯỚNG DẪN nha ~ Mở hướng dẫn đây!");
                this.inGuide = true;
                this.drawGuide();
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

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Nền + tiêu đề từ menu_texture.png
        if (this.menuBgImg.complete && this.menuBgImg.naturalWidth !== 0) {
            this.ctx.drawImage(this.menuBgImg, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Fallback nền cam chấm chấm (không lỗi, không text)
            this.ctx.fillStyle = "#FF8C00";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            for (let y = 0; y < this.canvas.height; y += 6) {
                for (let x = 0; x < this.canvas.width; x += 6) {
                    this.ctx.fillStyle = "#FFD700";
                    this.ctx.fillRect(x, y, 3, 3);
                }
            }
        }

        // Vẽ nút GAME START từ game_start.png (ở giữa trên)
        if (this.gameStartImg.complete && this.gameStartImg.naturalWidth !== 0) {
            const btnWidth = 400;
            const btnHeight = 80;
            this.ctx.drawImage(
                this.gameStartImg,
                this.canvas.width / 2 - btnWidth / 2,
                this.canvas.height / 2 - 100,
                btnWidth,
                btnHeight
            );
        }

        // Vẽ nút HƯỚNG DẪN từ huong_dan.png (ở giữa dưới)
        if (this.huongDanImg.complete && this.huongDanImg.naturalWidth !== 0) {
            const btnWidth = 400;
            const btnHeight = 80;
            this.ctx.drawImage(
                this.huongDanImg,
                this.canvas.width / 2 - btnWidth / 2,
                this.canvas.height / 2 + 50,
                btnWidth,
                btnHeight
            );
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
