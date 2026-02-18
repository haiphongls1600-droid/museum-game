import { museumMap } from "./map.js";

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.tileSize = 64;
        this.map = museumMap;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.zoom = 1.2;

        // ===== LOAD IMAGES =====
       this.wallImg   = this.loadImage("../assets/textures/wall.png");
       this.floorImg  = this.loadImage("../assets/textures/floor.png");
       this.playerImg = this.loadImage("../assets/textures/player.png");
       this.shelfImg  = this.loadImage("../assets/textures/shelf.png");
       this.plantImg  = this.loadImage("../assets/textures/plant.png");

        // ===== PLAYER =====
        this.player = {
            x: 6 * this.tileSize,
            y: 4 * this.tileSize,
            size: 64,
            speed: 4
        };

        this.keys = {};

        window.addEventListener("keydown", e => {
            this.keys[e.key] = true;
        });

        window.addEventListener("keyup", e => {
            this.keys[e.key] = false;
        });

        this.loop();
    }

    loadImage(path) {
    const img = new Image();
    img.src = new URL(path, import.meta.url).href;

    img.onerror = () => {
        console.error("Không load được:", img.src);
    };

    return img;
}


    update() {
        let newX = this.player.x;
        let newY = this.player.y;

        if (this.keys["ArrowUp"] || this.keys["w"]) newY -= this.player.speed;
        if (this.keys["ArrowDown"] || this.keys["s"]) newY += this.player.speed;
        if (this.keys["ArrowLeft"] || this.keys["a"]) newX -= this.player.speed;
        if (this.keys["ArrowRight"] || this.keys["d"]) newX += this.player.speed;

        if (!this.isColliding(newX, newY)) {
            this.player.x = newX;
            this.player.y = newY;
        }
    }

    isColliding(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);

        const tile = this.map[tileY]?.[tileX];

        return tile === "W" || tile === "S" || tile === "T" || tile === "G";
    }

    drawMap() {
  for (let y = 0; y < this.map.length; y++) {
    for (let x = 0; x < this.map[y].length; x++) {
      const tile = this.map[y][x];
      const posX = x * this.tileSize;
      const posY = y * this.tileSize;

      let img = null;
      if (tile === "F" || tile === "C") img = this.floorImg;
      if (tile === "W") img = this.wallImg;
      if (tile === "S") img = this.shelfImg;

      if (img && img.complete && img.naturalWidth !== 0) {
        this.ctx.drawImage(img, posX, posY, this.tileSize, this.tileSize);
      }
      // Nếu muốn vẽ placeholder khi thiếu ảnh:
      // else {
      //   this.ctx.fillStyle = tile === "W" ? "#555" : "#222";
      //   this.ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
      // }
    }
  }
}

drawPlayer() {
  if (this.playerImg && this.playerImg.complete && this.playerImg.naturalWidth !== 0) {
    this.ctx.drawImage(
      this.playerImg,
      this.player.x,
      this.player.y,
      this.player.size,
      this.player.size
    );
  } else {
    // Placeholder nếu player image lỗi
    this.ctx.fillStyle = "#ffcc00";
    this.ctx.fillRect(this.player.x, this.player.y, this.player.size, this.player.size);
  }
}

    loop() {
        requestAnimationFrame(() => this.loop());

        this.update();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.scale(this.zoom, this.zoom);

        this.drawMap();
        this.drawPlayer();

        this.ctx.restore();
    }
}
