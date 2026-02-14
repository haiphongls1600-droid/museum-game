update(dt) {

  // ==========================
  // 1️⃣ Nếu popup đang mở → không cho di chuyển
  // ==========================
  if (this.activeShelf) {
    this.moveTarget = null; // đảm bảo không còn di chuyển
    return;
  }

  // ==========================
  // 2️⃣ Reset nearShelf
  // ==========================
  this.nearShelf = null;

  for (const s of museumMap.shelves) {

    const centerX = s.x + s.w / 2;
    const centerY = s.y + s.h / 2;

    const dx = this.player.x - centerX;
    const dy = this.player.y - centerY;

    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.interactDistance) {
      this.nearShelf = s;
      break;
    }
  }

  // ==========================
  // 3️⃣ Xử lý di chuyển
  // ==========================
  if (this.moveTarget) {

    const dx = this.moveTarget.x - this.player.x;
    const dy = this.moveTarget.y - this.player.y;

    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 2) {
      const speed = 200;

      this.player.x += (dx / dist) * speed * dt;
      this.player.y += (dy / dist) * speed * dt;
    } else {
      this.moveTarget = null;
    }
  }

}
