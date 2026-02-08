// entities/Player.js
export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 20;
  }

  draw(ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
  }
}
