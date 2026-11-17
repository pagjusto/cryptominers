const { Jimp, rgbaToInt } = require('jimp');

// Read canyonGeometry.js waypoints
const fs = require('fs');

async function renderTrackSimulation() {
  const map = await Jimp.read('public/canyon_mine_map.png');
  const w = map.bitmap.width;
  const h = map.bitmap.height;

  // Let's import canyonGeometry.js
  const geom = await import('./src/utils/canyonGeometry.js');

  // Let's test 20 points
  for (let i = 0; i <= 20; i++) {
    const p = i / 20;
    const pos = geom.getCanyonTrackPosition(p, w, h);
    console.log(`p=${p.toFixed(2)}: x=${pos.x.toFixed(1)}, y=${pos.y.toFixed(1)}, angle=${(pos.angle * 180 / Math.PI).toFixed(1)}°`);

    // Draw marker at (pos.x, pos.y)
    const cx = Math.round(pos.x);
    const cy = Math.round(pos.y);
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const px = cx + dx;
        const py = cy + dy;
        if (px >= 0 && px < w && py >= 0 && py < h) {
          map.setPixelColor(rgbaToInt(255, 255, 0, 255), px, py);
        }
      }
    }
  }

  await map.write('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/track_simulation_points.png');
  console.log('Saved track_simulation_points.png');
}

renderTrackSimulation().catch(console.error);
