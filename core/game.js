import { Shelf } from "../entities/Shelf.js";
import { museumMap } from "./map.js";

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.tileSize = 64;
        this.map = museumMap;
        this.zoom = 1.2;

        // Resize canvas
        this.resize();
        window.addEventListener("resize", this.resize.bind(this));
this.canvas.addEventListener("click", (e) => {
  if (this.popup) return;  // Không di chuyển khi popup mở

  const rect = this.canvas.getBoundingClientRect();
  const mouseScreenX = e.clientX - rect.left;
  const mouseScreenY = e.clientY - rect.top;

  // Chuyển từ screen coords → world coords (ngược camera + zoom)
  const worldX = this.player.x + (mouseScreenX - this.canvas.width / 2) / this.zoom;
  const worldY = this.player.y + (mouseScreenY - this.canvas.height / 2) / this.zoom;

  this.target = { x: worldX, y: worldY };
});
        // Load images (only existing ones)
        this.wallImg = this.loadImage("../assets/textures/wall.png");
        this.floorImg = this.loadImage("../assets/textures/floor.png");
        this.playerImg = this.loadImage("../assets/textures/player.png");
        this.shelfImg = this.loadImage("../assets/textures/shelf.png");
        this.plantImg = this.loadImage("../assets/textures/plant.png");

        // Player
        this.player = {
            x: 6 * this.tileSize,
            y: 4 * this.tileSize,
            size: this.tileSize,
            speed: 4
        };

        this.keys = {};
this.shelves = [];
this.target = null;       // Cho di chuyển chuột
this.popup = null;        // Text hiển thị popup
this.interactKeyPressed = false;  // Tránh spam E

// Tạo shelves từ map (từ tile "S")
for (let y = 0; y < this.map.length; y++) {
  for (let x = 0; x < this.map[y].length; x++) {
    if (this.map[y][x] === "S") {
      // Center của tile
      const shelfX = x * this.tileSize + this.tileSize / 2;
      const shelfY = y * this.tileSize + this.tileSize / 2;
      this.shelves.push(new Shelf(shelfX, shelfY, 40, 20, `Shelf_${x}_${y}`));
    }
  }
}
        // Key events (lowercase to handle Arrow keys)
        window.addEventListener("keydown", (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        window.addEventListener("keyup", (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Start loop
        this.loop();
    }
handleInteract() {
  if (this.popup) {
    this.popup = null;  // Đóng popup bằng E lần nữa
    return;
  }

  for (const shelf of this.shelves) {
    if (shelf.isPlayerNear(this.player, 80)) {  // Dùng distance lớn hơn
      this.popup = shelf.text || "Hiện vật bí ẩn";  // Nếu bạn thêm text
      return;
    }
  }
}
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    loadImage(path) {
        const img = new Image();
        img.src = new URL(path, import.meta.url).href;
        img.onerror = () => console.warn(`Failed to load image: ${path}`);
        return img;
    }

    update() {
  let newX = this.player.x;
  let newY = this.player.y;

  // Nếu có key di chuyển → dùng key (override target)
  const hasKeyMove = ["w","s","a","d","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].some(k => this.keys[k]);
  if (hasKeyMove || !this.target) {
    if (this.keys["w"] || this.keys["ArrowUp"]) newY -= this.player.speed;
    if (this.keys["s"] || this.keys["ArrowDown"]) newY += this.player.speed;
    if (this.keys["a"] || this.keys["ArrowLeft"]) newX -= this.player.speed;
    if (this.keys["d"] || this.keys["ArrowRight"]) newX += this.player.speed;
  } else if (this.target) {
    const dx = this.target.x - this.player.x;
    const dy = this.target.y - this.player.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 5) {
      newX += (dx / dist) * this.player.speed;
      newY += (dy / dist) * this.player.speed;
    } else {
      this.target = null;  // Đến nơi
    }
  }

  // Collision
  if (!this.isColliding(newX, newY)) {
    this.player.x = newX;
    this.player.y = newY;
  }
}

    isColliding(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        const tile = this.map[tileY] ? this.map[tileY][tileX] : null;
        return tile === "W" || tile === "S";
    }
drawMap() {
  // Vẽ các tile từ map (nền tảng)
  for (let y = 0; y < this.map.length; y++) {
    for (let x = 0; x < this.map[y].length; x++) {
      const tile = this.map[y][x];
      const posX = x * this.tileSize;
      const posY = y * this.tileSize;

      let img = null;

      if (tile === "F") img = this.floorImg;          // Floor
      if (tile === "W") img = this.wallImg;           // Wall
      // Nếu tile "S" → vẽ shelf bằng image (nếu muốn giữ tile), nhưng ta sẽ vẽ entity riêng ở dưới
      // if (tile === "S") img = this.shelfImg;

      if (img && img.complete && img.naturalWidth !== 0) {
        this.ctx.drawImage(img, posX, posY, this.tileSize, this.tileSize);
      } else {
        // Placeholder nếu thiếu ảnh (tùy chọn)
        this.ctx.fillStyle = tile === "W" ? "#555" : "#333";
        this.ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
      }
    }
  }

  // Vẽ tất cả Shelf entities (override lên tile nếu cần)
  // → Dùng class Shelf để vẽ, có thể thêm hiệu ứng sau (highlight khi gần, animation...)
  this.shelves.forEach(shelf => {
    shelf.draw(this.ctx);
  });
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
            this.ctx.fillStyle = "#ffcc00";
            this.ctx.fillRect(this.player.x, this.player.y, this.player.size, this.player.size);
        }
    }

    loop() {
        requestAnimationFrame(() => this.loop());

        this.update();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        // Camera: player in center + zoom
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(-this.player.x - this.player.size / 2, -this.player.y - this.player.size / 2);

        this.drawMap();
        this.drawPlayer();

        this.ctx.restore();
        // Vẽ popup nếu đang mở
if (this.popup) {
  // Nền tối mờ toàn màn hình
  this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

  // Hộp trắng ở giữa
  const boxWidth = 440;
  const boxHeight = 240;
  const boxX = (this.canvas.width - boxWidth) / 2;
  const boxY = (this.canvas.height - boxHeight) / 2;

  this.ctx.fillStyle = "#ffffff";
  this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

  // Text nội dung
  this.ctx.fillStyle = "#000000";
  this.ctx.font = "28px Arial";
  this.ctx.textAlign = "center";
  this.ctx.textBaseline = "middle";
  this.ctx.fillText(this.popup, this.canvas.width / 2, this.canvas.height / 2 - 20);

  // Hướng dẫn đóng
  this.ctx.font = "18px Arial";
  this.ctx.fillText("Nhấn E để đóng", this.canvas.width / 2, this.canvas.height / 2 + 40);
}
    }
}
