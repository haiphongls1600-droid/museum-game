// core/game.js
export class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;

    // Camera / player
    this.player = {
      x: 0,
      y: 0,
      size: 20,
      speed: 2,
    };

    // Phòng trung tâm (hình vuông)
    this.room = {
      x: -150,
      y: -150,
      width: 300,
      height: 300,
    };

    this.keys = {};
    this.lastTime = 0;
  }

  start() {
    this.bindEvents();
    requestAnimationFrame(this.loop.bind(this));
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
    // Di chuyển kiểu Soul Knight (top-down)
    if (this.keys["w"] || this.keys["ArrowUp"]) this.player.y -= this.player.speed;
    if (this.keys["s"] || this.keys["ArrowDown"]) this.player.y += this.player.speed;
    if (this.keys["a"] || this.keys["ArrowLeft"]) this.player.x -= this.player.speed;
    if (this.keys["d"] || this.keys["ArrowRight"]) this.player.x += this.player.speed;
  }

  drawRoom() {
    const { ctx, room } = this;
    ctx.fillStyle = "#444";
    ctx.fillRect(room.x, room.y, room.width, room.height);
  }

  drawPlayer() {
    const { ctx, player } = this;
    ctx.fillStyle = "#ffcc00";
    ctx.fillRect(
      player.x - player.size / 2,
      player.y - player.size / 2,
      player.size,
      player.size
    );
  }

  loop(time) {
    const delta = time - this.lastTime;
    this.lastTime = time;

    this.update();

    // Camera: player luôn ở giữa màn hình
    this.ctx.setTransform(
      1,
      0,
      0,
      1,
      this.canvas.width / 2 - this.player.x,
      this.canvas.height / 2 - this.player.y
    );

    this.ctx.clearRect(
      this.player.x - this.canvas.width,
      this.player.y - this.canvas.height,
      this.canvas.width * 2,
      this.canvas.height * 2
    );

    this.drawRoom();
    this.drawPlayer();

    requestAnimationFrame(this.loop.bind(this));
  }
}
