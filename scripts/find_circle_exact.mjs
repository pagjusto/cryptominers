import fs from 'fs';
import jpeg from 'jpeg-js';

const img1Path = 'C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794977422861_da3e3e9f.jpg';
const raw = fs.readFileSync(img1Path);
const img = jpeg.decode(raw);

// Find the canvas borders first in img1
// Let's inspect rows 0 to 200
let minX = img.width, maxX = 0, minY = 200, maxY = 0;
let count = 0;

for (let y = 15; y < 180; y++) {
  for (let x = 200; x < 600; x++) {
    const idx = (y * img.width + x) * 4;
    const r = img.data[idx];
    const g = img.data[idx + 1];
    const b = img.data[idx + 2];
    
    // Vivid orange stroke: high saturation, hue ~20-30 deg
    // In RGB: R > 220, G > 70, G < 140, B < 40
    if (r > 220 && g > 60 && g < 140 && b < 40) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      count++;
    }
  }
}

console.log('Orange stroke in top area:');
console.log('Count:', count);
console.log('X:', minX, 'to', maxX);
console.log('Y:', minY, 'to', maxY);

// Also let's find the canvas area inside the screenshot
// The canvas has a dark border or rounded border
