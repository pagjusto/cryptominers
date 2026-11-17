const { Jimp } = require('jimp');

async function findCartInScreenshots() {
  const s628 = await Jimp.read('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/browser_evidence/e927e300-8433-43e9-b537-f1b2a811a693/final_step_628.png');
  const s636 = await Jimp.read('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/browser_evidence/e927e300-8433-43e9-b537-f1b2a811a693/final_step_636.png');

  console.log('s628 size:', s628.bitmap.width, 'x', s628.bitmap.height);
  console.log('s636 size:', s636.bitmap.width, 'x', s636.bitmap.height);

  // Search for the yellow gold nuggets / blue cart rim of the minecart in both images
  function searchCart(img, name) {
    // The cart has distinct gold nuggets on top (yellow: r > 220, g > 180, b < 60)
    // and metallic grey/blue chassis
    let hits = [];
    for (let y = 100; y < img.bitmap.height - 100; y += 4) {
      for (let x = 50; x < img.bitmap.width - 50; x += 4) {
        const c = img.getPixelColor(x, y);
        const r = (c >> 24) & 255;
        const g = (c >> 16) & 255;
        const b = (c >> 8) & 255;
        if (r > 230 && g > 180 && g < 220 && b < 50) {
          hits.push({ x, y });
        }
      }
    }
    console.log(`${name} gold hits:`, hits.length);
    if (hits.length > 0) {
      const avgX = hits.reduce((a, b) => a + b.x, 0) / hits.length;
      const avgY = hits.reduce((a, b) => a + b.y, 0) / hits.length;
      console.log(`${name} cart estimated at: (${avgX.toFixed(0)}, ${avgY.toFixed(0)})`);
    }
  }

  searchCart(s628, 's628');
  searchCart(s636, 's636');
}

findCartInScreenshots().catch(console.error);
