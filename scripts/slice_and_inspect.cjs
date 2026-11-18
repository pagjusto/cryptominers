const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794975569003_966b73cc.png';
const png = PNG.sync.read(fs.readFileSync(imgPath));

console.log('Total:', png.width, 'x', png.height);

// The image is divided into approximately 2 rows and 2 columns
const midX = Math.floor(png.width / 2); // 253
const midY = Math.floor(png.height / 2); // 217

const regions = [
  { name: 'hero_male', x0: 0, y0: 0, x1: midX, y1: midY },
  { name: 'hero_female', x0: midX, y0: 0, x1: png.width, y1: midY },
  { name: 'weapon_rifle', x0: 0, y0: midY, x1: midX, y1: png.height },
  { name: 'weapon_pistol', x0: midX, y0: midY, x1: png.width, y1: png.height }
];

for (const reg of regions) {
  // Inspect corners to see background color
  const cornerIdx = (reg.y0 * png.width + reg.x0) * 4;
  console.log(`${reg.name} corner rgba:`, png.data[cornerIdx], png.data[cornerIdx+1], png.data[cornerIdx+2], png.data[cornerIdx+3]);
}
