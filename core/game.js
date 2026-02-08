import { AssetsLoader } from "./assetsLoader.js";

export class Game {
  constructor(canvas) {
    this.ctx = canvas.getContext("2d");
    this.loader = new AssetsLoader();
    this.images = {};
  }

  async start() {
    this.images = await this.loader.loadAll(
      "assets/textures/textures.json"
    );

    this.loop();
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    // logic sau này
  }

  render() {
    this.ctx.clearRect(0, 0, 800, 600);

    // test vẽ sàn
    if (this.images.floor) {
      this.ctx.drawImage(this.images.floor, 0, 0, 800, 600);
    }
  }
}
