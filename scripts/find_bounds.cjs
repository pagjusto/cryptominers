const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794975569003_966b73cc.png';
const png = PNG.sync.read(fs.readFileSync(imgPath));

const midX = Math.floor(png.width / 2);
const midY = Math.floor(png.height / 2);

function isBackground(r, g, b) {
  // Card background is very light (r > 230 && g > 230 && b > 230)
  // Also check if it's near-white or light gray border
  return r > 220 && g > 220 && b > 220;
}

function findSpriteBounds(x0, y0, x1, y1) {
  let minX = x1, maxX = x0, minY = y1, maxY = y0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const idx = (y * png.width + x) * 4;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      if (!isBackground(r, g, b)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, maxX, minY, maxY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

const bMale = findSpriteBounds(0, 0, midX, midY);
const bFemale = findSpriteBounds(midX, 0, png.width, midY);
const bRifle = findSpriteBounds(0, midY, midX, png.height);
const bPistol = findSpriteBounds(midX, midY, png.width, png.height);

console.log('Hero Male bounds:', bMale);
console.log('Hero Female bounds:', bFemale);
console.log('Weapon Rifle bounds:', bRifle);
console.log('Weapon Pistol bounds:', bPistol);
