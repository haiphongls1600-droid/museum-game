export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.zoom = 1.2;

        // ===== LOAD IMAGES (PATH CHUẨN) =====
const BASE = window.location.pathname.includes("museum-game")
  ? "/museum-game/"
  : "/";

this.wallImg   = this.loadImage(BASE + "assets/wall.png");
this.floorImg  = this.loadImage(BASE + "assets/floor.png");
this.playerImg = this.loadImage(BASE + "assets/player.png");
this.shelfImg  = this.loadImage(BASE + "assets/shelf.png");
this.plantImg  = this.loadImage(BASE + "assets/plant.png");



        this.loop();
    }

    loadImage(path) {
        const img = new Image();
        img.src = path;

        img.onerror = () => {
            console.error("Không load được:", path);
        };

        return img;
    }

    loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.scale(this.zoom, this.zoom);

        // Vẽ nếu ảnh đã load xong
        if (this.floorImg.complete && this.floorImg.naturalWidth !== 0)
            this.ctx.drawImage(this.floorImg, 0, 0);

        if (this.wallImg.complete && this.wallImg.naturalWidth !== 0)
            this.ctx.drawImage(this.wallImg, 300, 200);

        if (this.playerImg.complete && this.playerImg.naturalWidth !== 0)
            this.ctx.drawImage(this.playerImg, 500, 350);

        this.ctx.restore();

        requestAnimationFrame(() => this.loop());
    }
}
