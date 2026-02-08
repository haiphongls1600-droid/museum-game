// entities/Shelf.js
export class Shelf {
  constructor(x, y, width = 40, height = 20, popupId = "default") {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.popupId = popupId;
  }

  draw(ctx) {
    ctx.fillStyle = "#8b5a2b";
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
  }

  isPlayerNear(player, distance = 30) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    return Math.sqrt(dx * dx + dy * dy) < distance;
  }
}
