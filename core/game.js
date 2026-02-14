export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.lastTime = 0;
    this.camera = { x: 0, y: 0 };

    
    this.activeShelf = null;
    this.nearShelf = null;
    this.interactDistance = 150;
    this.moveTarget = null;

    // Giả sử bạn có hàm loadTextures (nếu chưa có thì tạm comment phần này)
    // loadTextures(() => {
      this.player = {
        x: 100,
        y: 100,
        size: 20,
        speed: 200
      };

      // Giả sử museumMap.shelves tồn tại, nếu chưa có thì dùng this.shelves tạm
      this.shelves = [
        { x: 200, y: 150, w: 60, h: 30, texture: "art_1" },
        { x: 400, y: 220, w: 60, h: 30, texture: "art_2" }
      ];

      // this.bindEvents();   // comment tạm nếu chưa định nghĩa
      requestAnimationFrame(this.loop.bind(this));
    // });
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

    this.nearShelf = null;
    for (const shelf of this.shelves) {  // dùng this.shelves tạm nếu chưa có museumMap
      const cx = shelf.x + shelf.w / 2;
      const cy = shelf.y + shelf.h / 2;
      const dist = Math.hypot(this.player.x - cx, this.player.y - cy);

      if (dist < this.interactDistance) {
        this.nearShelf = shelf;
        break;
      }
    }

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

    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
  }

  draw() {
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const camera = this.camera;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cw, ch);

    // Camera follow player
    ctx.translate(cw / 2 - camera.x, ch / 2 - camera.y);

    // Vẽ nền tạm (màu xám)
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(-2000, -2000, 4000, 4000);  // nền lớn để test

    // Vẽ player tạm (hình tròn đỏ)
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(this.player.x, this.player.y, this.player.size, 0, Math.PI * 2);
    ctx.fill();

    // Vẽ shelves tạm (hình chữ nhật xanh)
    ctx.fillStyle = 'green';
    for (const s of this.shelves) {
      ctx.fillRect(s.x, s.y, s.w, s.h);
    }

    // Reset transform cho UI
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (this.activeShelf) {
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

      ctx.fillStyle = '#222';
      ctx.font = '20px Arial';
      ctx.fillText('Nhấn ESC để thoát', x + 30, y + h - 30);
    }
    else if (this.nearShelf) {
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
}

// Khởi tạo game
const canvas = document.getElementById('game');
if (canvas) {
  window.game = new Game(canvas);  // gán vào window để dễ debug
  console.log('Game khởi tạo thành công!');
} else {
  console.error('Không tìm thấy canvas id="game"');
}
