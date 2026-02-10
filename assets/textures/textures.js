// assets/textures/textures.js
export const textures = {};

export function loadTextures(onDone) {
  const names = ["player", "wall", "floor", "shelf", "plant"];
  let loaded = 0;

  names.forEach((name) => {
    const img = new Image();
    img.src = `./assets/textures/${name}.png`;

    img.onload = () => {
      textures[name] = img;
      loaded++;
      if (loaded === names.length) onDone();
    };
  });
}
