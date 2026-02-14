export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.player = {
      x: 400,
      y: 300,
      size: 40,
      speed: 4
    };

    this.camera = { x: 0, y: 0 };
    this.keys = {};

    this.mapWidth = 2000;
    this.mapHeight = 2000;

    this.walls = [
      { x: 300, y: 300, w: 400, h: 40 },
      { x: 900, y: 600, w: 40, h: 400 }
    ];

    this.tables = [
      { x: 600, y: 400, w: 120, h: 60 }
    ];

    this.trees = [
      { x: 1000, y: 1000, r: 40 }
    ];

    this.shelves = [
      { x: 800, y: 300 }
    ];

    this.nearShelf = null;
    this.activeShelf = null;
    this.interactDistance = 80;

    this.bindEvents();
    this.loop();
  }

  bindEvents() {
    window.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;

      if ((e.key === "e" || e.key === "E") && this.nearShelf) {
        this.activeShelf = this.nearShelf;
      }

      if (e.key === "Escape") {
        this.activeShelf = null;
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });
  }

  update() {
    if (this.activeShelf) return;

    let dx = 0;
    let dy = 0;

    if (this.keys["w"] || this.keys["ArrowUp"]) dy -= this.player.speed;
    if (this.keys["s"] || this.keys["ArrowDown"]) dy += this.player.speed;
    if (this.keys["a"] || this.keys["ArrowLeft"]) dx -= this.player.speed;
    if (this.keys["d"] || this.keys["ArrowRight"]) dx += this.player.speed;

    this.movePlayer(dx, dy);
    this.checkShelfDistance();
  }

  movePlayer(dx, dy) {
    const newX = this.player.x + dx;
    const newY = this.player.y + dy;

    if (!this.isColliding(newX, newY)) {
      this.player.x = newX;
      this.player.y = newY;
    }
  }

  isColliding(x, y) {
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

  checkShelfDistance() {
    this.nearShelf = null;
    for (let shelf of this.shelves) {
      const dx = this.player.x - shelf.x;
      const dy = this.player.y - shelf.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.interactDistance) {
        this.nearShelf = shelf;
        break;
      }
    }
  }

  draw() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.camera.x = this.player.x;
    this.camera.y = this.player.y;

    this.ctx.translate(
      this.canvas.width / 2 - this.camera.x,
      this.canvas.height / 2 - this.camera.y
    );

    this.drawMap();
    this.drawWalls();
    this.drawTables();
    this.drawTrees();
    this.drawShelves();
    this.drawPlayer();

    if (this.activeShelf) this.drawPopup();
    if (this.nearShelf && !this.activeShelf) this.drawEHint();
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

  drawShelves() {
    this.ctx.fillStyle = "brown";
    for (let shelf of this.shelves) {
      this.ctx.fillRect(shelf.x - 30, shelf.y - 30, 60, 60);
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

  drawPopup() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    this.ctx.fillStyle = "rgba(0,0,0,0.6)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const w = 500;
    const h = 300;
    const x = (this.canvas.width - w) / 2;
    const y = (this.canvas.height - h) / 2;

    this.ctx.fillStyle = "white";
    this.ctx.fillRect(x, y, w, h);

    this.ctx.fillStyle = "black";
    this.ctx.font = "20px Arial";
    this.ctx.fillText("Đây là hiện vật trưng bày", x + 40, y + 100);
    this.ctx.fillText("Nhấn ESC để đóng", x + 40, y + 150);
  }

  drawEHint() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = "#222";
    this.ctx.fillRect(20, 20, 60, 60);

    this.ctx.fillStyle = "white";
    this.ctx.font = "40px Arial";
    this.ctx.fillText("E", 38, 65);
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}
