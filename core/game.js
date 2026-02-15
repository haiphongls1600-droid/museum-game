export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.lastTime = 0;

    // ===== MAP =====
    this.map = {
      width: 2000,
      height: 2000
    };

    // ===== CAMERA =====
    this.camera = { x: 0, y: 0 };

    // ===== PLAYER =====
    this.player = {
      x: 300,
      y: 300,
      size: 20,
      speed: 250,
      vx: 0,
      vy: 0
    };

    // ===== INPUT =====
    this.keys = {};
    this.moveTarget = null;

    // ===== INTERACTION =====
    this.interactDistance = 120;
    this.nearShelf = null;
    this.activeShelf = null;

    // ===== OBJECTS =====
    this.shelves = [
      { x: 600, y: 500, w: 120, h: 60 },
      { x: 1200, y: 900, w: 120, h: 60 }
    ];

    this.walls = [
      { x: 800, y: 200, w: 60, h: 400 },
      { x: 400, y: 1000, w: 600, h: 60 }
    ];

    this.bindEvents();
    requestAnimationFrame(this.loop.bind(this));
  }

  // ================= LOOP =================
  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.update(dt);
    this.draw();

    requestAnimationFrame(this.loop.bind(this));
  }

  // ================= INPUT =================
  bindEvents() {
    window.addEventListener("keydown", e => {
      this.keys[e.key.toLowerCase()] = true;

      if (e.key === "e" && this.nearShelf) {
        this.activeShelf = this.nearShelf;
      }

      if (e.key === "Escape") {
        this.activeShelf = null;
      }
    });

    window.addEventListener("keyup", e => {
      this.keys[e.key.toLowerCase()] = false;
    });

    this.canvas.addEventListener("click", e => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const worldX = x + this.camera.x - this.canvas.width / 2;
      const worldY = y + this.camera.y - this.canvas.height / 2;

      this.moveTarget = { x: worldX, y: worldY };
    });
  }

  // ================= UPDATE =================
  update(dt) {
    if (this.activeShelf) return;

    this.handleMovement(dt);
    this.checkCollision();
    this.updateCamera();
    this.detectShelf();
  }

  handleMovement(dt) {
    const p = this.player;
    p.vx = 0;
    p.vy = 0;

    if (this.keys["w"]) p.vy = -1;
    if (this.keys["s"]) p.vy = 1;
    if (this.keys["a"]) p.vx = -1;
    if (this.keys["d"]) p.vx = 1;

    // Normalize WASD
    const len = Math.hypot(p.vx, p.vy);
    if (len > 0) {
      p.vx /= len;
      p.vy /= len;
      this.moveTarget = null;
    }

    // Click move
    if (this.moveTarget) {
      const dx = this.moveTarget.x - p.x;
      const dy = this.moveTarget.y - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 5) {
        p.vx = dx / dist;
        p.vy = dy / dist;
      } else {
        this.moveTarget = null;
      }
    }

    p.x += p.vx * p.speed * dt;
    p.y += p.vy * p.speed * dt;

    // Clamp map
    p.x = Math.max(p.size, Math.min(this.map.width - p.size, p.x));
    p.y = Math.max(p.size, Math.min(this.map.height - p.size, p.y));
  }

  checkCollision() {
    const p = this.player;

    for (const wall of this.walls) {
      if (
        p.x + p.size > wall.x &&
        p.x - p.size < wall.x + wall.w &&
        p.y + p.size > wall.y &&
        p.y - p.size < wall.y + wall.h
      ) {
        p.x -= p.vx * 5;
        p.y -= p.vy * 5;
      }
    }
  }

  detectShelf() {
    this.nearShelf = null;

    for (const s of this.shelves) {
      const cx = s.x + s.w / 2;
      const cy = s.y + s.h / 2;

      const dist = Math.hypot(this.player.x - cx, this.player.y - cy);

      if (dist < this.interactDistance) {
        this.nearShelf = s;
        break;
      }
    }
  }

  updateCamera() {
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;

    this.camera.x = Math.max(
      this.canvas.width / 2,
      Math.min(this.map.width - this.canvas.width / 2, this.camera.x)
    );

    this.camera.y = Math.max(
      this.canvas.height / 2,
      Math.min(this.map.height - this.canvas.height / 2, this.camera.y)
    );
  }

  // ================= DRAW =================
  draw() {
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cw, ch);

    ctx.translate(cw / 2 - this.camera.x, ch / 2 - this.camera.y);

    // MAP
    ctx.fillStyle = "#2e2e2e";
    ctx.fillRect(0, 0, this.map.width, this.map.height);

    // Walls
    ctx.fillStyle = "#555";
    for (const w of this.walls) {
      ctx.fillRect(w.x, w.y, w.w, w.h);
    }

    // Shelves
    ctx.fillStyle = "green";
    for (const s of this.shelves) {
      ctx.fillRect(s.x, s.y, s.w, s.h);
    }

    // Player
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(this.player.x, this.player.y, this.player.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // UI
    if (this.activeShelf) {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, 0, cw, ch);

      ctx.fillStyle = "white";
      ctx.fillRect(cw / 2 - 300, ch / 2 - 200, 600, 400);

      ctx.fillStyle = "black";
      ctx.font = "24px Arial";
      ctx.fillText("Artwork Info - ESC to close", cw / 2 - 200, ch / 2);
    }
    else if (this.nearShelf) {
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(60, 60, 40, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.font = "40px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("E", 60, 60);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
    }
  }
}
