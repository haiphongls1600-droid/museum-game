export class AssetsLoader {
  constructor() {
    this.images = {};
  }

  async loadJSON(path) {
    const res = await fetch(path);
    return await res.json();
  }

  loadImage(key, src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.images[key] = img;
        resolve();
      };
    });
  }

  async loadAll(texturesPath) {
    const textures = await this.loadJSON(texturesPath);
    const tasks = [];

    for (const key in textures) {
      tasks.push(this.loadImage(key, textures[key]));
    }

    await Promise.all(tasks);
    return this.images;
  }
}
