// maps/museumMap.js
export const museumMap = {
  rooms: [
    // Phòng trung tâm
    { x: -150, y: -150, w: 300, h: 300 },

    // Trên
    { x: -100, y: -450, w: 200, h: 250 },

    // Dưới
    { x: -100, y: 200, w: 200, h: 250 },

    // Trái
    { x: -450, y: -100, w: 250, h: 200 },

    // Phải
    { x: 200, y: -100, w: 250, h: 200 }
  ],

  walls: [
    // Tường phòng trung tâm
    { x: -150, y: -150, w: 300, h: 10 },
    { x: -150, y: 140, w: 300, h: 10 },
    { x: -150, y: -150, w: 10, h: 300 },
    { x: 140, y: -150, w: 10, h: 300 }
  ],

  shelves: [
    { x: -60, y: 80, w: 60, h: 30 },
    { x: 20, y: 80, w: 60, h: 30 }
  ],

  plants: [
    { x: -100, y: -20, w: 32, h: 32 },
    { x: 70, y: -20, w: 32, h: 32 }
  ]
};
