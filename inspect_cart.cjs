const { Jimp } = require('jimp');

async function inspectCart() {
  const cart = await Jimp.read('public/minecart_pixel.png');
  const w = cart.bitmap.width;
  const h = cart.bitmap.height;
  console.log(`Cart dimensions: ${w}x${h}`);

  // Find non-transparent bounds
  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = cart.getPixelColor(x, y);
      const a = c & 255;
      if (a > 30) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log(`Visible cart bounds: x=[${minX}, ${maxX}] (w=${maxX - minX + 1}), y=[${minY}, ${maxY}] (h=${maxY - minY + 1})`);

  // Find where wheels are (bottom 25% of visible height)
  console.log(`Wheel contact level is at y=${maxY} (relative to image height ${h})`);
}

inspectCart().catch(console.error);
