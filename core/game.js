update(dt) {
  if (this.activeShelf) {
    this.moveTarget = null;
    return;
  }

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
