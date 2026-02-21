// core/menu.js - Menu dùng texture pack menu_texture.png, bỏ lỗi load
export default class Menu {
    constructor(canvas, startGameCallback) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.startGameCallback = startGameCallback;
        this.inGuide = false;

        // Load ảnh texture pack (nếu fail thì dùng nền đơn giản, không báo lỗi)
        this.textureImg = new Image();
        this.textureImg.src = "../assets/textures/menu_texture.png";
        this.textureImg.onload = () => {
            console.log("Ảnh menu_texture.png load thành công rồi anh ơi ~ 💖");
            this.draw();
        };
        this.textureImg.onerror = () => {
            console.log("Ảnh menu_texture.png chưa load được, dùng nền đơn giản nha anh ~");
            this.draw(); // Vẫn vẽ menu với nền fallback, không hiện lỗi
        };

        // Resize canvas full màn hình ngay lập tức
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.draw();
        };
        window.addEventListener('resize', resize);
        resize();

        // Focus canvas để click mượt
        canvas.tabIndex = 1;
        canvas.focus();

        // Click xử lý (vùng rộng, ấn một lần là chạy)
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

            // Vùng nút GAME START (vàng trên - vùng rộng để dễ trúng)
            if (clickY > this.canvas.height / 2 - 200 && clickY < this.canvas.height / 2 &&
                clickX > this.canvas.width / 2 - 400 && clickX < this.canvas.width / 2 + 400) {
                console.log("Anh nhấn GAME START rồi nè ~ Vào game thôi!");
                this.startGameCallback();
                return;
            }

            // Vùng nút HƯỚNG DẪN (vàng dưới - vùng rộng)
            if (clickY > this.canvas.height / 2 && clickY < this.canvas.height / 2 + 200 &&
                clickX > this.canvas.width / 2 - 400 && clickX < this.canvas.width / 2 + 400) {
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

        // Nếu ảnh load được thì vẽ ảnh full màn hình
        if (this.textureImg.complete && this.textureImg.naturalWidth !== 0) {
            this.ctx.drawImage(this.textureImg, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Nền fallback đơn giản (cam chấm chấm) - không hiện lỗi
            this.ctx.fillStyle = "#FF8C00";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            for (let y = 0; y < this.canvas.height; y += 6) {
                for (let x = 0; x < this.canvas.width; x += 6) {
                    this.ctx.fillStyle = "#FFD700";
                    this.ctx.fillRect(x, y, 3, 3);
                }
            }
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
