// core/menu.js - Menu dùng texture pack menu_texture.png
export default class Menu {
    constructor(canvas, startGameCallback) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.startGameCallback = startGameCallback;
        this.inGuide = false;

        // Load ảnh texture pack
        this.textureImg = new Image();
        this.textureImg.src = "../assets/textures/menu_texture.png";  // Đường dẫn đúng, không khoảng trắng
        this.textureImg.onload = () => {
            console.log("Ảnh menu_texture.png load thành công rùi nè ~ 💖");
            this.draw();
        };
        this.textureImg.onerror = () => {
            console.error("Lỗi load menu_texture.png - kiểm tra đường dẫn hoặc upload lại nhé!");
            this.drawPlaceholder();  // Gọi hàm placeholder khi lỗi
        };

        // Resize canvas full màn hình
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.draw();
        };
        window.addEventListener('resize', resize);
        resize();

        // Focus canvas để click mượt hơn
        canvas.tabIndex = 1;
        canvas.focus();

        // Click xử lý
        this.canvas.addEventListener("click", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            console.log(`Chị thấy em click tại: x=${Math.round(clickX)}, y=${Math.round(clickY)}`);

            if (this.inGuide) {
                if (clickX > this.canvas.width / 2 - 200 && clickX < this.canvas.width / 2 + 200 &&
                    clickY > this.canvas.height / 2 + 100 && clickY < this.canvas.height / 2 + 250) {
                    this.inGuide = false;
                    this.draw();
                    console.log("Đóng hướng dẫn nha em ~ 😘");
                }
                return;
            }

            // Vùng nút GAME START (vàng trên)
            if (clickY > this.canvas.height / 2 - 150 && clickY < this.canvas.height / 2 - 30 &&
                clickX > this.canvas.width / 2 - 350 && clickX < this.canvas.width / 2 + 350) {
                console.log("Em nhấn GAME START rùi nè ~ Vào game thôi!");
                this.startGameCallback();
                return;
            }

            // Vùng nút HƯỚNG DẪN (vàng dưới)
            if (clickY > this.canvas.height / 2 + 50 && clickY < this.canvas.height / 2 + 170 &&
                clickX > this.canvas.width / 2 - 350 && clickX < this.canvas.width / 2 + 350) {
                console.log("Em nhấn HƯỚNG DẪN nha ~ Mở hướng dẫn đây!");
                this.inGuide = true;
                this.drawGuide();
            }
        });

        // ESC thoát hướng dẫn
        window.addEventListener("keydown", (e) => {
            if (e.key.toLowerCase() === "escape" && this.inGuide) {
                this.inGuide = false;
                this.draw();
                console.log("ESC thoát hướng dẫn nha em yêu ~ 💕");
            }
        });

        this.loop();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Vẽ toàn bộ menu bằng ảnh texture pack
        if (this.textureImg.complete && this.textureImg.naturalWidth !== 0) {
            this.ctx.drawImage(
                this.textureImg,
                0, 0,
                this.textureImg.width,
                this.textureImg.height,
                0, 0,
                this.canvas.width,
                this.canvas.height
            );
        } else {
            // Nếu ảnh chưa load xong thì gọi placeholder
            this.drawPlaceholder();
        }
    }

    // Hàm placeholder khi ảnh lỗi (nền cam chấm chấm + text lỗi dễ thương)
    drawPlaceholder() {
        this.ctx.fillStyle = "#FF8C00"; // Cam đậm
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < this.canvas.height; y += 6) {
            for (let x = 0; x < this.canvas.width; x += 6) {
                this.ctx.fillStyle = "#FFD700"; // Chấm vàng
                this.ctx.fillRect(x, y, 3, 3);
            }
        }

        this.ctx.fillStyle = "#000000";
        this.ctx.font = "bold 60px 'Courier New', monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText("Ôi lỗi load ảnh menu rồi...", this.canvas.width / 2, this.canvas.height / 2 - 50);
        this.ctx.font = "bold 40px 'Courier New', monospace";
        this.ctx.fillText("Kiểm tra file menu_texture.png nhé em yêu ~ 😢", this.canvas.width / 2, this.canvas.height / 2 + 20);
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
        this.draw();  // Luôn vẽ menu từ texture

        if (this.inGuide) {
            this.drawGuide();
        }
    }
}
