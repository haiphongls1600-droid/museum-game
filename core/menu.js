// core/menu.js - Menu khởi đầu
export default class Menu {
    constructor(canvas, startGameCallback) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.startGameCallback = startGameCallback;
        this.inGuide = false;

        // Resize canvas full màn hình và gọi lại draw
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.draw(); // Vẽ lại menu khi resize
        };
        window.addEventListener('resize', resize);
        resize();

        // Focus canvas để nhận event tốt hơn
        canvas.tabIndex = 1; // Cho phép focus
        canvas.focus();

        // Debug click toàn canvas
        this.canvas.addEventListener("click", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            console.log(`Click tại: x=${Math.round(clickX)}, y=${Math.round(clickY)}`);

            if (this.inGuide) {
                // Vùng nút ĐÓNG (rộng hơn để dễ click)
                if (clickX > this.canvas.width / 2 - 200 && clickX < this.canvas.width / 2 + 200 &&
                    clickY > this.canvas.height / 2 + 100 && clickY < this.canvas.height / 2 + 250) {
                    this.inGuide = false;
                    this.draw();
                    console.log("Đóng hướng dẫn");
                }
                return;
            }

            // Nút GAME START (vùng rộng hơn, dễ trúng)
            if (clickY > this.canvas.height / 2 - 150 && clickY < this.canvas.height / 2 - 30 &&
                clickX > this.canvas.width / 2 - 350 && clickX < this.canvas.width / 2 + 350) {
                console.log("Nhấn GAME START - Chuyển sang game");
                this.startGameCallback();
                return;
            }

            // Nút HƯỚNG DẪN (vùng rộng hơn)
            if (clickY > this.canvas.height / 2 + 50 && clickY < this.canvas.height / 2 + 170 &&
                clickX > this.canvas.width / 2 - 350 && clickX < this.canvas.width / 2 + 350) {
                console.log("Nhấn HƯỚNG DẪN - Mở popup");
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

        // Nền chấm chấm vàng cam
        this.ctx.fillStyle = "#FFD700";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < this.canvas.height; y += 8) {
            for (let x = 0; x < this.canvas.width; x += 8) {
                this.ctx.fillStyle = "#000000";
                this.ctx.fillRect(x, y, 4, 4);
            }
        }

        // Tiêu đề
        this.ctx.fillStyle = "#8B4513";
        this.ctx.font = "bold 70px 'Courier New', monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText("THE MUSEUM GAME", this.canvas.width / 2, this.canvas.height / 4);

        // Nút GAME START
        this.ctx.fillStyle = "#8B4513";
        this.ctx.fillRect(this.canvas.width / 2 - 350, this.canvas.height / 2 - 150, 700, 120);
        this.ctx.fillStyle = "#FFD700";
        this.ctx.font = "bold 50px 'Courier New', monospace";
        this.ctx.fillText("GAME START", this.canvas.width / 2, this.canvas.height / 2 - 70);

        // Nút HƯỚNG DẪN
        this.ctx.fillStyle = "#8B4513";
        this.ctx.fillRect(this.canvas.width / 2 - 350, this.canvas.height / 2 + 50, 700, 120);
        this.ctx.fillStyle = "#FFD700";
        this.ctx.font = "bold 50px 'Courier New', monospace";
        this.ctx.fillText("HƯỚNG DẪN", this.canvas.width / 2, this.canvas.height / 2 + 130);
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.inGuide) {
            this.drawGuide();
        } else {
            this.draw();
        }
    }
}
