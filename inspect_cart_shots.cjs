const { Jimp } = require('jimp');

async function analyzeImg1() {
  const img1 = await Jimp.read('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/cart_on_curve_step652.png');
  const w = img1.bitmap.width;
  const h = img1.bitmap.height;

  // Find gold nuggets of cart
  let hits = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = img1.getPixelColor(x, y);
      const r = (c >> 24) & 255;
      const g = (c >> 16) & 255;
      const b = (c >> 8) & 255;
      if (r > 230 && g > 180 && g < 225 && b < 60) {
        hits.push({ x, y });
      }
    }
  }

  if (hits.length > 0) {
    const avgX = hits.reduce((a, b) => a + b.x, 0) / hits.length;
    const avgY = hits.reduce((a, b) => a + b.y, 0) / hits.length;
    console.log(`Cart in img1 found at: (${avgX.toFixed(1)}, ${avgY.toFixed(1)}), total hits: ${hits.length}`);
  } else {
    console.log('No cart gold detected in img1');
  }
}
analyzeImg1().catch(console.error);
