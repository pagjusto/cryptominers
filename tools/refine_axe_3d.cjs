const { Jimp } = require('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/node_modules/jimp');

async function refineAxe() {
  const img = await Jimp.read('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_axe_3d.png');
  const w = img.bitmap.width;
  const h = img.bitmap.height;

  // Let's clean up any reddish/orange fringe on the axe handle and blade
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = img.getPixelColor(x, y);
      const a = c & 255;
      if (a < 20) continue;

      const r = (c >> 24) & 255;
      const g = (c >> 16) & 255;
      const b = (c >> 8) & 255;

      // Detect orange/red fringe from the body
      const isRedFringe = (r > 130 && g < 80 && b < 50 && (r - b) > 65);
      if (isRedFringe) {
        // Check if this pixel is on the handle: replace with wood tone
        if (x > 110) {
          const woodR = 60;
          const woodG = 38;
          const woodB = 28;
          img.setPixelColor(((woodR << 24) | (woodG << 16) | (woodB << 8) | a) >>> 0, x, y);
        } else {
          // If stray red on blade or outside, make transparent
          img.setPixelColor(0x00000000, x, y);
        }
      }
    }
  }

  // Smooth the handle
  await img.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_axe_3d_clean.png');
  await img.write('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/viking_axe_3d_clean.png');
  console.log('Saved refined axe to public/viking_axe_3d_clean.png');
}

refineAxe().catch(console.error);
