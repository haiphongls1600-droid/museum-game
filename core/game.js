update(dt) {
  // 1. Nếu đang mở popup → khóa di chuyển & tương tác
  if (this.activeShelf) {
    this.moveTarget = null;
    return;
  }

  // 2. Tìm kệ gần nhất (chỉ cần 1 kệ gần nhất là đủ)
  this.nearShelf = null;
  for (const shelf of museumMap.shelves) {
    const centerX = shelf.x + shelf.w / 2;
    const centerY = shelf.y + shelf.h / 2;
    const dx = this.player.x - centerX;
    const dy = this.player.y - centerY;
    const distance = Math.hypot(dx, dy); // Math.hypot nhanh & gọn hơn

    if (distance < this.interactDistance) {
      this.nearShelf = shelf;
      break; // chỉ lấy kệ đầu tiên gần nhất
    }
  }

  // 3. Xử lý di chuyển đến điểm click/chạm
  if (this.moveTarget) {
    const dx = this.moveTarget.x - this.player.x;
    const dy = this.moveTarget.y - this.player.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 2) {  // ngưỡng dừng nhỏ để tránh rung
      const speed = this.player.speed || 200; // dùng thuộc tính player nếu có
      const moveX = (dx / dist) * speed * dt;
      const moveY = (dy / dist) * speed * dt;
      this.player.x += moveX;
      this.player.y += moveY;
    } else {
      this.moveTarget = null;
    }
  }

  // 4. Camera follow player (kiểu Soul Knight / top-down centering)
  this.camera.x = this.player.x;
  this.camera.y = this.player.y;
}

update(dt) {
  // 1. Nếu đang mở popup → khóa di chuyển & tương tác
  if (this.activeShelf) {
    this.moveTarget = null;
    return;
  }

  // 2. Tìm kệ gần nhất (chỉ cần 1 kệ gần nhất là đủ)
  this.nearShelf = null;
  for (const shelf of museumMap.shelves) {
    const centerX = shelf.x + shelf.w / 2;
    const centerY = shelf.y + shelf.h / 2;
    const dx = this.player.x - centerX;
    const dy = this.player.y - centerY;
    const distance = Math.hypot(dx, dy); // Math.hypot nhanh & gọn hơn

    if (distance < this.interactDistance) {
      this.nearShelf = shelf;
      break; // chỉ lấy kệ đầu tiên gần nhất
    }
  }

  // 3. Xử lý di chuyển đến điểm click/chạm
  if (this.moveTarget) {
    const dx = this.moveTarget.x - this.player.x;
    const dy = this.moveTarget.y - this.player.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 2) {  // ngưỡng dừng nhỏ để tránh rung
      const speed = this.player.speed || 200; // dùng thuộc tính player nếu có
      const moveX = (dx / dist) * speed * dt;
      const moveY = (dy / dist) * speed * dt;
      this.player.x += moveX;
      this.player.y += moveY;
    } else {
      this.moveTarget = null;
    }
  }

  // 4. Camera follow player (kiểu Soul Knight / top-down centering)
  this.camera.x = this.player.x;
  this.camera.y = this.player.y;
}
