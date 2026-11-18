import fs from 'fs';
import jpeg from 'jpeg-js';

const img1Path = 'C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794977422861_da3e3e9f.jpg';
const raw = fs.readFileSync(img1Path);
const img = jpeg.decode(raw);

let minX = img.width, maxX = 0, minY = img.height, maxY = 0;
let orangePixelCount = 0;

for (let y = 0; y < img.height; y++) {
  for (let x = 0; x < img.width; x++) {
    const idx = (y * img.width + x) * 4;
    const r = img.data[idx];
    const g = img.data[idx + 1];
    const b = img.data[idx + 2];
    
    // Orange marker: high red, medium green, low blue
    // e.g. R > 200, G between 60 and 150, B < 60
    if (r > 200 && g > 60 && g < 150 && b < 60) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      orangePixelCount++;
    }
  }
}

console.log('Image dimensions:', img.width, 'x', img.height);
console.log('Orange pixels found:', orangePixelCount);
console.log('Bounding box of orange mark:');
console.log('X:', minX, 'to', maxX, '(width:', maxX - minX, ')');
console.log('Y:', minY, 'to', maxY, '(height:', maxY - minY, ')');
console.log('Normalized X:', (minX / img.width).toFixed(3), 'to', (maxX / img.width).toFixed(3));
console.log('Normalized Y:', (minY / img.height).toFixed(3), 'to', (maxY / img.height).toFixed(3));
