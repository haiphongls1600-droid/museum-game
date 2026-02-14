export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.player = {
      x: 0,
      y: 0,
      size: 40,
      speed: 4
    };

    this.camera = { x: 0, y: 0 };

    this.keys = {};
    this.shelves = [];
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

    if (this.keys["w"]) this.player.y -= this.player.speed;
    if (this.keys["s"]) this.player.y += this.player.speed;
    if (this.keys["a"]) this.player.x -= this.player.speed;
    if (this.keys["d"]) this.player.x += this.player.speed;

    this.checkShelfDistance();
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

    this.drawShelves();
    this.drawPlayer();

    if (this.activeShelf) {
      this.drawPopup();
    }

    if (this.nearShelf && !this.activeShelf) {
      this.drawEHint();
    }
  }

  drawPlayer() {
    this.ctx.fillStyle = "deepskyblue";
    this.ctx.fillRect(
      this.player.x - this.player.size / 2,
      this.player.y - this.player.size / 2,
      this.player.size,
      this.player.size
    );
  }

  drawShelves() {
    for (let shelf of this.shelves) {
      this.ctx.fillStyle = "brown";
      this.ctx.fillRect(
        shelf.x - 30,
        shelf.y - 30,
        60,
        60
      );
    }
  }

  drawPopup() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    this.ctx.fillStyle = "rgba(0,0,0,0.6)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const w = 600;
    const h = 400;
    const x = (this.canvas.width - w) / 2;
    const y = (this.canvas.height - h) / 2;

    this.ctx.fillStyle = "white";
    this.ctx.fillRect(x, y, w, h);

    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 5;
    this.ctx.strokeRect(x, y, w, h);

    this.ctx.fillStyle = "black";
    this.ctx.font = "20px Arial";
    this.ctx.fillText("Nhấn ESC để đóng", x + 20, y + h - 20);
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
