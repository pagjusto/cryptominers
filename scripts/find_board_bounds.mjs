import fs from 'fs';
import jpeg from 'jpeg-js';

const img2Path = 'C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794977429334_e930799a.jpg';
const raw = fs.readFileSync(img2Path);
const img = jpeg.decode(raw);

// Find pixels that belong to the white board:
// The white board has high brightness, r > 180, g > 180, b > 170 (or cream/off-white)
let minX = img.width, maxX = 0, minY = img.height, maxY = 0;
let count = 0;

for (let y = 0; y < img.height; y++) {
  for (let x = 0; x < img.width; x++) {
    const idx = (y * img.width + x) * 4;
    const r = img.data[idx], g = img.data[idx+1], b = img.data[idx+2];
    // Off-white / cream billboard panel
    if (r > 190 && g > 180 && b > 170 && Math.abs(r - g) < 30 && Math.abs(r - b) < 40) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      count++;
    }
  }
}

console.log('White board pixels:', count);
console.log('Board bounds:');
console.log('X:', minX, 'to', maxX, '(width:', maxX - minX, ')');
console.log('Y:', minY, 'to', maxY, '(height:', maxY - minY, ')');
