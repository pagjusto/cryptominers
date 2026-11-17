const { Jimp } = require('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/node_modules/jimp');

async function inspectFrog() {
  const frogRaw = await Jimp.read('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794777466868_71ebbb5b.png');
  const kunaiRaw = await Jimp.read('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794777490097_e22b20d1.png');

  console.log('Frog dimensions:', frogRaw.bitmap.width, 'x', frogRaw.bitmap.height);
  console.log('Kunai dimensions:', kunaiRaw.bitmap.width, 'x', kunaiRaw.bitmap.height);

  // Check top-left corner colors of frog:
  console.log('Frog corner colors:');
  for (let y = 0; y < 4; y++) {
    const row = [];
    for (let x = 0; x < 4; x++) {
      const c = frogRaw.getPixelColor(x, y);
      row.push(`(${(c>>24)&255},${(c>>16)&255},${(c>>8)&255},${c&255})`);
    }
    console.log(row.join(' '));
  }

  // Check top-left corner colors of kunai:
  console.log('Kunai corner colors:');
  for (let y = 0; y < 4; y++) {
    const row = [];
    for (let x = 0; x < 4; x++) {
      const c = kunaiRaw.getPixelColor(x, y);
      row.push(`(${(c>>24)&255},${(c>>16)&255},${(c>>8)&255},${c&255})`);
    }
    console.log(row.join(' '));
  }
}

inspectFrog().catch(console.error);
