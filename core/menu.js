// menu.js - Màn hình menu khởi đầu
export default class Menu {
    constructor(canvas, startGameCallback) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.startGameCallback = startGameCallback; // Hàm gọi khi nhấn GAME START
        this.inGuide = false;

        this.canvas.addEventListener("click", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            if (this.inGuide) {
                // Nút ĐÓNG
                if (clickX > this.canvas.width / 2 - 150 && clickX < this.canvas.width / 2 + 150 &&
                    clickY > this.canvas.height / 2 + 150 && clickY < this.canvas.height / 2 + 200) {
                    this.inGuide = false;
                    this.draw();
                }
                return;
            }

            // Nút GAME START
            if (clickY > this.canvas.height / 2 - 100 && clickY < this.canvas.height / 2 - 20 &&
                clickX > this.canvas.width / 2 - 250 && clickX < this.canvas.width / 2 + 250) {
                this.startGameCallback();
                return;
            }

            // Nút HƯỚNG DẪN
            if (clickY > this.canvas.height / 2 + 20 && clickY < this.canvas.height / 2 + 100 &&
                clickX > this.canvas.width / 2 - 250 && clickX < this.canvas.width / 2 + 250) {
                this.inGuide = true;
                this.drawGuide();
            }
        });

        this.draw();
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
        this.ctx.fillRect(this.canvas.width / 2 - 250, this.canvas.height / 2 - 80, 500, 100);
        this.ctx.fillStyle = "#FFD700";
        this.ctx.font = "bold 50px 'Courier New', monospace";
        this.ctx.fillText("GAME START", this.canvas.width / 2, this.canvas.height / 2 + 10);

        // Nút HƯỚNG DẪN
        this.ctx.fillStyle = "#8B4513";
        this.ctx.fillRect(this.canvas.width / 2 - 250, this.canvas.height / 2 + 80, 500, 100);
        this.ctx.fillStyle = "#FFD700";
        this.ctx.font = "bold 50px 'Courier New', monospace";
        this.ctx.fillText("HƯỚNG DẪN", this.canvas.width / 2, this.canvas.height / 2 + 170);
    }

    drawGuide() {
        this.ctx.fillStyle = "rgba(0,0,0,0.7)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const boxWidth = 800;
        const boxHeight = 500;
        const boxX = (this.canvas.width - boxWidth) / 2;
        const boxY = (this.canvas.height - boxHeight) / 2;

        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        this.ctx.fillStyle = "#000000";
        this.ctx.font = "bold 40px 'Courier New', monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText("HƯỚNG DẪN CHƠI", this.canvas.width / 2, boxY + 80);

        this.ctx.font = "28px 'Courier New', monospace";
        this.ctx.fillText("Di chuyển: Click chuột / AWSD", this.canvas.width / 2, boxY + 180);
        this.ctx.fillText("Nhấn E để mở popup hiện vật", this.canvas.width / 2, boxY + 240);
        this.ctx.fillText("Trong popup: Click để upload file (ảnh hiện tạm thời)", this.canvas.width / 2, boxY + 300);

        // Nút ĐÓNG
        this.ctx.fillStyle = "#8B4513";
        this.ctx.fillRect(this.canvas.width / 2 - 150, boxY + boxHeight - 120, 300, 80);
        this.ctx.fillStyle = "#FFD700";
        this.ctx.font = "bold 36px 'Courier New', monospace";
        this.ctx.fillText("ĐÓNG", this.canvas.width / 2, boxY + boxHeight - 70);
    }
}
