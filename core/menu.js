// core/menu.js - Màn hình menu khởi đầu
export default class Menu {
    constructor(canvas, startGameCallback) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.startGameCallback = startGameCallback;
        this.inGuide = false;

        // Resize canvas full màn hình
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // Focus canvas để nhận event tốt hơn
        canvas.focus();

        // Click xử lý
        this.canvas.addEventListener("click", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            console.log(`Click tại: x=${clickX}, y=${clickY}`);  // Debug tọa độ click

            if (this.inGuide) {
                // Nút ĐÓNG (vùng rộng hơn để dễ click)
                if (clickX > this.canvas.width / 2 - 200 && clickX < this.canvas.width / 2 + 200 &&
                    clickY > this.canvas.height / 2 + 100 && clickY < this.canvas.height / 2 + 250) {
                    this.inGuide = false;
                    this.draw();
                    console.log("Đóng hướng dẫn");
                }
                return;
            }

            // Nút GAME START (vùng rộng hơn)
            if (clickY > this.canvas.height / 2 - 120 && clickY < this.canvas.height / 2 - 20 &&
                clickX > this.canvas.width / 2 - 300 && clickX < this.canvas.width / 2 + 300) {
                console.log("Nhấn GAME START");
                this.startGameCallback();
                return;
            }

            // Nút HƯỚNG DẪN (vùng rộng hơn)
            if (clickY > this.canvas.height / 2 + 20 && clickY < this.canvas.height / 2 + 120 &&
                clickX > this.canvas.width / 2 - 300 && clickX < this.canvas.width / 2 + 300) {
                console.log("Nhấn HƯỚNG DẪN");
                this.inGuide = true;
                this.drawGuide();
            }
        });

        // ESC thoát hướng dẫn
        window.addEventListener("keydown", (e) => {
            if (e.key.toLowerCase() === "escape" && this.inGuide) {
                this.inGuide = false;
                this.draw();
                console.log("ESC thoát hướng dẫn");
            }
        });

        this.loop();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = "#FFD700";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < this.canvas.height; y += 8) {
            for (let x = 0; x < this.canvas.width; x += 8) {
                this.ctx.fillStyle = "#000000";
                this.ctx.fillRect(x, y, 4, 4);
            }
        }

        this.ctx.fillStyle = "#8B4513";
        this.ctx.font = "bold 70px 'Courier New', monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText("THE MUSEUM GAME", this.canvas.width / 2, this.canvas.height / 4);

        this.ctx.fillStyle = "#8B4513";
        this.ctx.fillRect(this.canvas.width / 2 - 300, this.canvas.height / 2 - 120, 600, 100);
        this.ctx.fillStyle = "#FFD700";
        this.ctx.font = "bold 50px 'Courier New', monospace";
        this.ctx.fillText("GAME START", this.canvas.width / 2, this.canvas.height / 2 - 40);

        this.ctx.fillStyle = "#8B4513";
        this.ctx.fillRect(this.canvas.width / 2 - 300, this.canvas.height / 2 + 20, 600, 100);
        this.ctx.fillStyle = "#FFD700";
        this.ctx.font = "bold 50px 'Courier New', monospace";
        this.ctx.fillText("HƯỚNG DẪN", this.canvas.width / 2, this.canvas.height / 2 + 100);
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
        this.ctx.fillText("Trong popup: Click để upload file (ảnh hiện tạm thời)", this.canvas.width / 2, boxY + 320);
        this.ctx.fillText("Nhấn ESC hoặc click ĐÓNG để thoát hướng dẫn", this.canvas.width / 2, boxY + 380);

        this.ctx.fillStyle = "#8B4513";
        this.ctx.fillRect(this.canvas.width / 2 - 200, boxY + boxHeight - 150, 400, 100);
        this.ctx.fillStyle = "#FFD700";
        this.ctx.font = "bold 40px 'Courier New', monospace";
        this.ctx.fillText("ĐÓNG", this.canvas.width / 2, boxY + boxHeight - 90);
    }

    loop() {
        requestAnimationFrame(() => this.loop());
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.inGuide) {
            this.drawGuide();
        } else {
            this.draw();
        }
    }
}
