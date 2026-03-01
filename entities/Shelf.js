// entities/Shelf.js
export class Shelf {
    constructor(x, y, width, height, name) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.name = name;
    }

    isPlayerNear(player, distance) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        return Math.hypot(dx, dy) < distance;
    }

    draw(ctx) {
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
}
