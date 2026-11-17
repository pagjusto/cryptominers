const { Jimp } = require('jimp');

async function testCompositeTrack() {
  const map = await Jimp.read('public/canyon_mine_map.png');
  const cart = await Jimp.read('public/minecart_pixel.png');
  const w = map.bitmap.width;
  const h = map.bitmap.height;

  const geom = await import('./src/utils/canyonGeometry.js');

  // Let's test at 8 progress points: 0.12, 0.22, 0.32, 0.45, 0.60, 0.72, 0.85, 0.94
  const testPoints = [0.12, 0.22, 0.32, 0.45, 0.60, 0.72, 0.85, 0.94];
  const cw = 54;
  const ch = 40;

  for (const p of testPoints) {
    const pos = geom.getCanyonTrackPosition(p, w, h);
    console.log(`Testing cart at p=${p}: x=${pos.x.toFixed(1)}, y=${pos.y.toFixed(1)}, angle=${(pos.angle * 180 / Math.PI).toFixed(1)}°`);

    // Create rotated cart sprite
    const cCopy = cart.clone();
    cCopy.resize({ w: cw, h: ch });
    const angleDeg = -(pos.angle * 180 / Math.PI); // Jimp rotates counter-clockwise
    cCopy.rotate(angleDeg, false);

    // Composite with offset anchored at wheels
    const placeX = Math.round(pos.x - cCopy.bitmap.width / 2);
    const placeY = Math.round(pos.y - cCopy.bitmap.height / 2);
    map.composite(cCopy, placeX, placeY);
  }

  await map.write('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/cart_restored_rotation_simulation.png');
  console.log('Saved cart_restored_rotation_simulation.png');
}

testCompositeTrack().catch(console.error);
