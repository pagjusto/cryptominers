const { Jimp } = require('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/node_modules/jimp');

async function testBg() {
  const body = await Jimp.read('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794772077766_14cf9b11.png');
  const weapon = await Jimp.read('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794772087616_01e43150.png');

  console.log('Body:');
  for (let y = 0; y < 8; y++) {
    const row = [];
    for (let x = 0; x < 8; x++) {
      const c = body.getPixelColor(x, y);
      const r = (c >> 24) & 255;
      const g = (c >> 16) & 255;
      const b = (c >> 8) & 255;
      const a = c & 255;
      row.push(`(${r},${g},${b},${a})`);
    }
    console.log(row.slice(0, 4).join(' '));
  }

  console.log('Weapon:');
  for (let y = 0; y < 8; y++) {
    const row = [];
    for (let x = 0; x < 8; x++) {
      const c = weapon.getPixelColor(x, y);
      const r = (c >> 24) & 255;
      const g = (c >> 16) & 255;
      const b = (c >> 8) & 255;
      const a = c & 255;
      row.push(`(${r},${g},${b},${a})`);
    }
    console.log(row.slice(0, 4).join(' '));
  }
}

testBg().catch(console.error);
