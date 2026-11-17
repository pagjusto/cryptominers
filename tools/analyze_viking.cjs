const path = require('path');
const { Jimp } = require('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/node_modules/jimp');

async function analyze() {
  const imgPath = 'C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_cutout.png';
  const img = await Jimp.read(imgPath);
  console.log('Image dimensions:', img.bitmap.width, 'x', img.bitmap.height);

  // Let's find the bounding box of non-transparent pixels
  let minX = img.bitmap.width, maxX = 0, minY = img.bitmap.height, maxY = 0;
  for (let y = 0; y < img.bitmap.height; y++) {
    for (let x = 0; x < img.bitmap.width; x++) {
      const c = img.getPixelColor(x, y);
      const a = c & 255;
      if (a > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log('Non-transparent bbox:', { minX, maxX, minY, maxY, w: maxX - minX + 1, h: maxY - minY + 1 });
}

analyze().catch(console.error);
