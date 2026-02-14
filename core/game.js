export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.player = {
      x: 400,
      y: 400,
      size: 30,
      speed: 4
    };

    this.keys = {};

    // Load map image
    this.mapImage = new Image();
    this.mapImage.src = "./assets/map.png";

    this.mapWidth = 0;
    this.mapHeight = 0;

    this.mapImage.onload = () => {
      this.mapWidth = this.mapImage.width;
      this.mapHeight = this.mapImage.height;
    };

    this.bindEvents();
    this.loop();
  }

  bindEvents() {
    window.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });
  }

  update() {
    let dx = 0;
    let dy = 0;

    if (this.keys["w"] || this.keys["ArrowUp"]) dy -= this.player.speed;
    if (this.keys["s"] || this.keys["ArrowDown"]) dy += this.player.speed;
    if (this.keys["a"] || this.keys["ArrowLeft"]) dx -= this.player.speed;
    if (this.keys["d"] || this.keys["ArrowRight"]) dx += this.player.speed;

    this.movePlayer(dx, dy);
  }

  movePlayer(dx, dy) {
    let newX = this.player.x + dx;
    let newY = this.player.y + dy;

    // Giới hạn trong map
    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX > this.mapWidth) newX = this.mapWidth;
    if (newY > this.mapHeight) newY = this.mapHeight;

    this.player.x = newX;
    this.player.y = newY;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.mapImage.complete) return;

    // Camera theo player
    const camX = this.player.x - this.canvas.width / 2;
    const camY = this.player.y - this.canvas.height / 2;

    this.ctx.save();
    this.ctx.translate(-camX, -camY);

    // Vẽ map
    this.ctx.drawImage(this.mapImage, 0, 0);

    // Vẽ player
    this.ctx.fillStyle = "deepskyblue";
    this.ctx.fillRect(
      this.player.x - this.player.size / 2,
      this.player.y - this.player.size / 2,
      this.player.size,
      this.player.size
    );

    this.ctx.restore();
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}
