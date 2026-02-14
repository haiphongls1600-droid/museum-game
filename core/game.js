export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.player = {
      x: 500,
      y: 500,
      size: 40,
      speed: 5
    };

    this.keys = {};
    this.mapWidth = 2000;
    this.mapHeight = 2000;

    // Tường
    this.walls = [
      { x: 200, y: 200, w: 400, h: 40 },
      { x: 800, y: 400, w: 40, h: 400 }
    ];

    // Bàn
    this.tables = [
      { x: 600, y: 700, w: 120, h: 60 }
    ];

    // Cây
    this.trees = [
      { x: 1000, y: 1000, r: 40 }
    ];

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
    if (newX < 20) newX = 20;
    if (newY < 20) newY = 20;
    if (newX > this.mapWidth - 20) newX = this.mapWidth - 20;
    if (newY > this.mapHeight - 20) newY = this.mapHeight - 20;

    if (!this.checkWallCollision(newX, newY)) {
      this.player.x = newX;
      this.player.y = newY;
    }
  }

  checkWallCollision(x, y) {
    for (let wall of this.walls) {
      if (
        x + 20 > wall.x &&
        x - 20 < wall.x + wall.w &&
        y + 20 > wall.y &&
        y - 20 < wall.y + wall.h
      ) {
        return true;
      }
    }
    return false;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Camera theo player
    const camX = this.player.x - this.canvas.width / 2;
    const camY = this.player.y - this.canvas.height / 2;

    this.ctx.save();
    this.ctx.translate(-camX, -camY);

    this.drawMap();
    this.drawWalls();
    this.drawTables();
    this.drawTrees();
    this.drawPlayer();

    this.ctx.restore();
  }

  drawMap() {
    this.ctx.fillStyle = "#3a3a3a";
    this.ctx.fillRect(0, 0, this.mapWidth, this.mapHeight);
  }

  drawWalls() {
    this.ctx.fillStyle = "#555";
    for (let wall of this.walls) {
      this.ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    }
  }

  drawTables() {
    this.ctx.fillStyle = "#8B4513";
    for (let table of this.tables) {
      this.ctx.fillRect(table.x, table.y, table.w, table.h);
    }
  }

  drawTrees() {
    this.ctx.fillStyle = "green";
    for (let tree of this.trees) {
      this.ctx.beginPath();
      this.ctx.arc(tree.x, tree.y, tree.r, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawPlayer() {
    this.ctx.fillStyle = "deepskyblue";
    this.ctx.fillRect(
      this.player.x - 20,
      this.player.y - 20,
      40,
      40
    );
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}
