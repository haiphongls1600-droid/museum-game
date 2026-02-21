// core/menu.js - Menu dùng texture pack menu_texture.png
export default class Menu {
   // Load ảnh texture pack
this.textureImg = new Image();
this.textureImg.src = "../assets/textures/menu_texture.png"; // Đường dẫn chuẩn
this.textureImg.onload = () => {
    console.log("Ảnh menu_texture.png load thành công rùi anh ơi ~ 💖");
    this.draw();
};
this.textureImg.onerror = () => {
    console.error("LỖI 404: Không tìm thấy menu_texture.png - kiểm tra repo và tên file nhé anh!");
    this.drawPlaceholder(); // Gọi placeholder
};

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.textureImg.complete && this.textureImg.naturalWidth !== 0) {
            this.ctx.drawImage(this.textureImg, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.drawPlaceholder();
        }
    }

    drawPlaceholder() {
        this.ctx.fillStyle = "#FF8C00";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < this.canvas.height; y += 6) {
            for (let x = 0; x < this.canvas.width; x += 6) {
                this.ctx.fillStyle = "#FFD700";
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
        this.draw();

        if (this.inGuide) {
            this.drawGuide();
        }
    }
}
