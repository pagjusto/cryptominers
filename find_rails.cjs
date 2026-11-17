const { Jimp } = require('jimp');

async function traceEntireTrack() {
  const map = await Jimp.read('public/canyon_mine_map.png');
  const w = map.bitmap.width;
  const h = map.bitmap.height;

  // Let's sample in small increments around the known rail path
  // Rail has 2 steel rails separated by ~30-40 pixels
  // Center of track is between top rail and bottom rail
  // Let's sample grid points and print them
  function isSteelPixel(px, py) {
    if (px < 0 || px >= w || py < 0 || py >= h) return false;
    const c = map.getPixelColor(px, py);
    const r = (c >> 24) & 255;
    const g = (c >> 16) & 255;
    const b = (c >> 8) & 255;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    // Steel rail
    return (b >= r - 8 && lum >= 75 && lum <= 180 && r < 185);
  }

  // 1. Curve left going up around tunnel
  console.log('--- Curve going UP around tunnel (x=300 to 450) ---');
  for (let x = 300; x <= 450; x += 15) {
    let hits = [];
    for (let y = 50; y <= 550; y++) {
      if (isSteelPixel(x, y)) hits.push(y);
    }
    if (hits.length > 0) {
      const avgY = hits.reduce((a, b) => a + b, 0) / hits.length;
      console.log(`x=${x} (u=${(x/w).toFixed(3)}): hits=${hits.length}, avgY=${avgY.toFixed(1)} (v=${(avgY/h).toFixed(3)}), span=[${hits[0]}, ${hits[hits.length-1]}]`);
    }
  }

  // 2. Bottom loop (y=600 to 800)
  console.log('--- Bottom loop (y=600 to 800) ---');
  for (let y = 600; y <= 820; y += 20) {
    let hits = [];
    for (let x = 600; x < w; x++) {
      if (isSteelPixel(x, y)) hits.push(x);
    }
    if (hits.length > 0) {
      const avgX = hits.reduce((a, b) => a + b, 0) / hits.length;
      console.log(`y=${y} (v=${(y/h).toFixed(3)}): hits=${hits.length}, avgX=${avgX.toFixed(1)} (u=${(avgX/w).toFixed(3)}), span=[${hits[0]}, ${hits[hits.length-1]}]`);
    }
  }

  // 3. Exit rail at bottom right (y=700 to 840)
  console.log('--- Exit rail at bottom right (x=750 to 1024) ---');
  for (let x = 750; x < w; x += 30) {
    let hits = [];
    for (let y = 650; y < h; y++) {
      if (isSteelPixel(x, y)) hits.push(y);
    }
    if (hits.length > 0) {
      const avgY = hits.reduce((a, b) => a + b, 0) / hits.length;
      console.log(`x=${x} (u=${(x/w).toFixed(3)}): hits=${hits.length}, avgY=${avgY.toFixed(1)} (v=${(avgY/h).toFixed(3)}), span=[${hits[0]}, ${hits[hits.length-1]}]`);
    }
  }
}

traceEntireTrack().catch(console.error);
