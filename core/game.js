class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.lastTime = 0;
    this.camera = { x: 0, y: 0 };

    // Trạng thái tương tác
    this.activeShelf = null;
    this.nearShelf = null;
    this.interactDistance = 150;
    this.moveTarget = null;

    // Load textures rồi mới khởi tạo
    loadTextures(() => {
      // Player
      this.player = {
        x: 100,
        y: 100,
        size: 20,
        speed: 200
      };

      // Shelves (dễ thêm sau)
      this.shelves = [
        new Shelf(200, 150, 60, 30, "art_1"),
        new Shelf(400, 220, 60, 30, "art_2")
      ];

      this.bindEvents();
      requestAnimationFrame(this.loop.bind(this));
    });
  }

  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.update(dt);
    this.draw();

    requestAnimationFrame(this.loop.bind(this));
  }

  update(dt) {
    if (this.activeShelf) {
      this.moveTarget = null;
      return;
    }

    // Tìm kệ gần nhất
    this.nearShelf = null;
    for (const shelf of museumMap.shelves) {
      const cx = shelf.x + shelf.w / 2;
      const cy = shelf.y + shelf.h / 2;
      const dist = Math.hypot(this.player.x - cx, this.player.y - cy);

      if (dist < this.interactDistance) {
        this.nearShelf = shelf;
        break;
      }
    }

    // Di chuyển đến target
    if (this.moveTarget) {
      const dx = this.moveTarget.x - this.player.x;
      const dy = this.moveTarget.y - this.player.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 2) {
        const speed = this.player.speed ?? 200;
        this.player.x += (dx / dist) * speed * dt;
        this.player.y += (dy / dist) * speed * dt;
      } else {
        this.moveTarget = null;
      }
    }

    // Camera follow player
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
  }

  draw() {
    const { ctx, canvas, camera, activeShelf, nearShelf } = this;
    const cw = canvas.width;
    const ch = canvas.height;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    ctx.translate(cw / 2 - camera.x, ch / 2 - camera.y);

    this.drawRooms?.();
    this.drawWalls?.();
    this.drawPlants?.();
    this.drawShelves?.();
    this.drawPlayer?.();

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (activeShelf) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, cw, ch);

      const w = 620;
      const h = 440;
      const x = (cw - w) / 2;
      const y = (ch - h) / 2;

      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 6;
      ctx.strokeRect(x, y, w, h);

      if (textures?.painting) {
        ctx.drawImage(textures.painting, x + 50, y + 50, w - 100, h - 140);
      }

      ctx.fillStyle = '#222';
      ctx.font = '20px Arial';
      ctx.fillText('Nhấn ESC hoặc click ngoài để thoát', x + 30, y + h - 30);
    }
    else if (nearShelf) {
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.beginPath();
      ctx.arc(60, 60, 40, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = '50px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('E', 60, 60);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }
  }

  // Thêm các method khác nếu cần: bindEvents, drawRooms, drawWalls, v.v.
}

// Khởi tạo game
const canvas = document.getElementById('game');
if (canvas) {
  const game = new Game(canvas);
} else {
  console.error('Không tìm thấy canvas với id="game"');
}
