// entities/Shelf.js (sửa lỗi + cải thiện nhẹ)
export class Shelf {
  constructor(x, y, width = 40, height = 20, popupId = "default") {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.popupId = popupId;  // Nếu dùng để map với text cụ thể
    this.text = `Hiện vật ${popupId}`;  // Thêm text mặc định, bạn có thể custom sau
  }

  draw(ctx, shelfImg) {  // Thêm tham số shelfImg
    if (shelfImg && shelfImg.complete && shelfImg.naturalWidth !== 0) {
        ctx.drawImage(
            shelfImg,
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height
        );
    } else {
        ctx.fillStyle = "#8b5a2b";
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
}
  isPlayerNear(player, distance = 80) {  // Tăng distance lên 80 cho dễ interact
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    return Math.sqrt(dx * dx + dy * dy) < distance;
  }
}
