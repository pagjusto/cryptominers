const { Jimp } = require('jimp');
async function check() {
  const img = await Jimp.read('public/stone_original.png');
  console.log('Stone dimensions:', img.bitmap.width, 'x', img.bitmap.height);
  const samples = [[100, 30], [100, 100], [50, 120], [140, 120]];
  for (const [x, y] of samples) {
    const c = img.getPixelColor(x, y);
    console.log(`Stone (${x}, ${y}): R=${(c >> 24) & 255}, G=${(c >> 16) & 255}, B=${(c >> 8) & 255}, A=${c & 255}`);
  }
}
check();
