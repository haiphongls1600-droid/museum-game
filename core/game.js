import { Shelf } from "../entities/Shelf.js";
// core/game.js
import { museumMap } from "../maps/museumMap.js";
import { textures, loadTextures } from "../assets/textures/textures.js";

export class Game {
  constructor(canvas) {
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");

  this.lastTime = 0;
  this.camera = { x: 0, y: 0 };

  loadTextures(() => {
    this.player = {
      x: 0,
      y: 0,
      size: 20,
      speed: 200,
      target: null
    };

    this.shelves = [
      new Shelf(200, 150, 60, 30, "art_1"),
      new Shelf(400, 220, 60, 30, "art_2")
    ];

    this.bindEvents();
    requestAnimationFrame(this.loop.bind(this));
  });
    this.activeShelf = null;
this.interactDistance = 60;

this.canvas.addEventListener("click", (e) => {
  if (this.activeShelf) return; // đang mở popup thì không click tiếp

  for (const s of museumMap.shelves) {
    const dx = this.player.x - (s.x + s.w / 2);
    const dy = this.player.y - (s.y + s.h / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.interactDistance) {
      this.activeShelf = s;
      break;
    }
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    this.activeShelf = null;
  }
});
}

  

  bindEvents() {
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - this.canvas.width / 2 + this.camera.x;
      const y = e.clientY - rect.top - this.canvas.height / 2 + this.camera.y;
      this.player.target = { x, y };
    });
  }

  update(dt) {
    const p = this.player;
    if (p.target) {
      const dx = p.target.x - p.x;
      const dy = p.target.y - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 2) {
        p.target = null;
      } else {
        p.x += (dx / dist) * p.speed * dt;
        p.y += (dy / dist) * p.speed * dt;
      }
    }

    // Camera kiểu Soul Knight
    this.camera.x = p.x;
    this.camera.y = p.y;
  }

drawRooms() {
  for (const r of museumMap.rooms) {

    // nền sàn
    this.ctx.drawImage(
      textures.floor,
      r.x,
      r.y,
      r.w,
      r.h
    );

    // viền phòng
    this.ctx.strokeStyle = "#222";
    this.ctx.lineWidth = 8;
    this.ctx.strokeRect(r.x, r.y, r.w, r.h);

  }
}


drawWalls() {
  for (const w of museumMap.walls) {
    this.ctx.drawImage(
      textures.wall,
      w.x,
      w.y,
      w.w,
      w.h
    );
  }
}
drawShelves() {
  const img = textures.shelf;
  for (const s of museumMap.shelves) {
    this.ctx.drawImage(img, s.x, s.y, s.w, s.h);
  }
}

drawPlants() {
  const img = textures.plant;
  for (const p of museumMap.plants) {
    this.ctx.drawImage(img, p.x, p.y, p.w, p.h);
  }
}

 drawPlayer() {
  const p = this.player;
  const img = textures.player;

  if (!img) return; // phòng trường hợp ảnh chưa load

  this.ctx.drawImage(
    img,
    p.x - p.size / 2,
    p.y - p.size / 2,
    p.size,
    p.size
  );
}


  render() {
    this.ctx.setTransform(
      1, 0, 0, 1,
      this.canvas.width / 2 - this.camera.x,
      this.canvas.height / 2 - this.camera.y
    );

    this.ctx.clearRect(
      this.camera.x - this.canvas.width,
      this.camera.y - this.canvas.height,
      this.canvas.width * 2,
      this.canvas.height * 2
    );

    this.drawRooms();
    this.drawWalls();
    this.drawPlayer();
  }

loop(time) {
  const dt = (time - this.lastTime) / 1000;
  this.lastTime = time;

  this.update(dt);
  this.draw();

 requestAnimationFrame(this.loop.bind(this));
}

draw() {

  // reset camera
  this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // camera kiểu Soul Knight
  this.ctx.translate(
    this.canvas.width / 2 - this.camera.x,
    this.canvas.height / 2 - this.camera.y
  );

this.drawRooms();
this.drawShelves();
this.drawPlants();
this.drawWalls();
this.drawPlayer();
if (this.activeShelf) {

  // reset camera để popup cố định màn hình
  this.ctx.setTransform(1, 0, 0, 1, 0, 0);

  // nền tối
  this.ctx.fillStyle = "rgba(0,0,0,0.6)";
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

  // khung popup
  const boxW = 500;
  const boxH = 350;
  const boxX = (this.canvas.width - boxW) / 2;
  const boxY = (this.canvas.height - boxH) / 2;

  this.ctx.fillStyle = "white";
  this.ctx.fillRect(boxX, boxY, boxW, boxH);

  this.ctx.strokeStyle = "black";
  this.ctx.lineWidth = 4;
  this.ctx.strokeRect(boxX, boxY, boxW, boxH);

  // ảnh bên trong (có thể đổi sau)
  this.ctx.drawImage(
    textures.painting,
    boxX + 50,
    boxY + 50,
    boxW - 100,
    boxH - 100
  );

  // hướng dẫn
  this.ctx.fillStyle = "black";
  this.ctx.font = "18px Arial";
  this.ctx.fillText("Nhấn ESC để đóng", boxX + 20, boxY + boxH - 20);
}

}
}
