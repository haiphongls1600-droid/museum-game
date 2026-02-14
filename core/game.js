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
