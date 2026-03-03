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
    this.drawNpcs();
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
    // Popup chỉ là ảnh
    this.ctx.fillStyle = "rgba(0,0,0,0.7)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Kích thước popup ảnh - bạn chỉnh 2 số này
    const pw = 800;   // rộng
    const ph = 600;   // cao
    const px = (this.canvas.width - pw) / 2;
    const py = (this.canvas.height - ph) / 2;

    // Ảnh popup (đường dẫn cố định, không dùng base để tránh lỗi)
    const popupImg = new Image();
    popupImg.src = "https://haiphongls1600-droid.github.io/museum-game/assets/textures/popup_npc.png";

    // Kiểm tra ảnh đã load chưa
    if (popupImg.complete && popupImg.naturalWidth > 0) {
        this.ctx.drawImage(popupImg, px, py, pw, ph);
    } else {
        // Placeholder khi ảnh chưa load hoặc không tồn tại
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(px, py, pw, ph);
        this.ctx.fillStyle = "#000000";
        this.ctx.font = "32px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText("Đang tải ảnh giới thiệu...", this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = "20px Arial";
        this.ctx.fillText("(Kiểm tra file popup_npc.png trong assets/textures/)", this.canvas.width / 2, this.canvas.height / 2 + 50);
    }

    // Nút đóng
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Nhấn E để đóng", this.canvas.width / 2, this.canvas.height - 40);
}
        } else {
            // Phần popup hiện vật cũ giữ nguyên
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
