// maps/museumMap.js
export const museumMap = {
  rooms: [
    // Phòng trung tâm (vuông)
    { x: -150, y: -150, w: 300, h: 300 },

    // Phòng trên
    { x: -100, y: -450, w: 200, h: 250 },

    // Phòng dưới
    { x: -100, y: 200, w: 200, h: 250 },

    // Phòng trái
    { x: -450, y: -100, w: 250, h: 200 },

    // Phòng phải
    { x: 200, y: -100, w: 250, h: 200 }
  ],

  walls: [
    // Tường phòng trung tâm
    { x: -150, y: -150, w: 300, h: 10 },
    { x: -150, y: 140,  w: 300, h: 10 },
    { x: -150, y: -150, w: 10,  h: 300 },
    { x: 140,  y: -150, w: 10,  h: 300 }
  ]
};
