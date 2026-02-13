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

  // ===== STATE =====
  this.activeShelf = null;
  this.nearShelf = null;
  this.interactDistance = 150;
  this.moveTarget = null;

  loadTextures(() => {

    // ===== PLAYER =====
    this.player = {
      x: 100,
      y: 100,
      size: 20,
      speed: 200
    };

    // ===== SHELVES =====
    this.shelves = [
      new Shelf(200, 150, 60, 30, "art_1"),
      new Shelf(400, 220, 60, 30, "art_2")
    ];

    // ===== EVENTS =====
    this.bindEvents();

    // ===== START LOOP =====
    requestAnimationFrame(this.loop.bind(this));
  });
}


  bindEvents() {

  // CLICK
  this.canvas.addEventListener("click", (e) => {

    if (this.activeShelf) return;

    // Click nút E
    if (this.nearShelf) {
      const x = e.offsetX;
      const y = e.offsetY;

      if (x >= 20 && x <= 80 && y >= 20 && y <= 80) {
        this.activeShelf = this.nearShelf;
        return;
      }
    }

    const worldX = e.offsetX - (this.canvas.width / 2 - this.camera.x);
    const worldY = e.offsetY - (this.canvas.height / 2 - this.camera.y);

    this.moveTarget = { x: worldX, y: worldY };
  });


  // KEYBOARD
  window.addEventListener("keydown", (e) => {

    if ((e.key === "e" || e.key === "E") &&
        this.nearShelf &&
        !this.activeShelf) {

      this.activeShelf = this.nearShelf;
    }

    if (e.key === "Escape") {
      this.activeShelf = null;
    }

  });
}

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

 for (const s of this.shelves) {

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


    // Camera kiểu Soul Knight
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
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
this.activeShelf = null;
this.moveTarget = null;
this.interactDistance = 70;

this.canvas.addEventListener("click", (e) => {

  // Nếu đang mở popup thì không làm gì
  if (this.activeShelf) return;

  const rect = this.canvas.getBoundingClientRect();
  const screenX = e.clientX - rect.left;
  const screenY = e.clientY - rect.top;

  const worldX = screenX - this.canvas.width / 2 + this.camera.x;
  const worldY = screenY - this.canvas.height / 2 + this.camera.y;

  let clickedShelf = null;

  for (const s of museumMap.shelves) {
    const inside =
      worldX >= s.x &&
      worldX <= s.x + s.w &&
      worldY >= s.y &&
      worldY <= s.y + s.h;

    if (inside) {
      clickedShelf = s;
      break;
    }
  }

  // Nếu click trúng kệ
  if (clickedShelf) {

    const centerX = clickedShelf.x + clickedShelf.w / 2;
    const centerY = clickedShelf.y + clickedShelf.h / 2;

    const dx = this.player.x - centerX;
    const dy = this.player.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.interactDistance) {
      this.activeShelf = clickedShelf;
      return;
    }
  }

  // Nếu không mở popup thì di chuyển
  this.moveTarget = { x: worldX, y: worldY };
});

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

  this.ctx.setTransform(1, 0, 0, 1, 0, 0);

  this.ctx.fillStyle = "rgba(0,0,0,0.6)";
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

  const boxW = 600;
  const boxH = 400;
  const boxX = (this.canvas.width - boxW) / 2;
  const boxY = (this.canvas.height - boxH) / 2;

  this.ctx.fillStyle = "white";
  this.ctx.fillRect(boxX, boxY, boxW, boxH);

  this.ctx.strokeStyle = "black";
  this.ctx.lineWidth = 5;
  this.ctx.strokeRect(boxX, boxY, boxW, boxH);

  this.ctx.drawImage(
    textures.painting,
    boxX + 50,
    boxY + 50,
    boxW - 100,
    boxH - 100
  );

  this.ctx.fillStyle = "black";
  this.ctx.font = "18px Arial";
  this.ctx.fillText("Nhấn ESC để thoát", boxX + 20, boxY + boxH - 20);
}

  this.ctx.setTransform(1, 0, 0, 1, 0, 0);

  this.ctx.fillStyle = "rgba(0,0,0,0.7)";
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

  const w = 600;
  const h = 400;
  const x = (this.canvas.width - w) / 2;
  const y = (this.canvas.height - h) / 2;

  this.ctx.fillStyle = "white";
  this.ctx.fillRect(x, y, w, h);

  this.ctx.strokeStyle = "black";
  this.ctx.lineWidth = 5;
  this.ctx.strokeRect(x, y, w, h);

  this.ctx.fillStyle = "black";
  this.ctx.font = "20px Arial";
  this.ctx.fillText("Nhấn ESC để thoát", x + 20, y + h - 20);
}
if (this.nearShelf && !this.activeShelf) {

  this.ctx.setTransform(1, 0, 0, 1, 0, 0);

  this.ctx.fillStyle = "#222";
  this.ctx.fillRect(20, 20, 60, 60);

  this.ctx.fillStyle = "white";
  this.ctx.font = "40px Arial";
  this.ctx.fillText("E", 38, 65);
}

}
}
