import fs from 'fs';
import jpeg from 'jpeg-js';

const img2Path = 'C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794977429334_e930799a.jpg';
const raw = fs.readFileSync(img2Path);
const img = jpeg.decode(raw);

const xHist = new Array(img.width).fill(0);
const yHist = new Array(img.height).fill(0);

for (let y = 0; y < img.height; y++) {
  for (let x = 0; x < img.width; x++) {
    const idx = (y * img.width + x) * 4;
    const r = img.data[idx], g = img.data[idx+1], b = img.data[idx+2];
    if (r > 190 && g > 180 && b > 170 && Math.abs(r - g) < 25 && Math.abs(r - b) < 30) {
      xHist[x]++;
      yHist[y]++;
    }
  }
}

// Find ranges where density is high (> 50 pixels per column/row)
let xStart = 0, xEnd = 0, yStart = 0, yEnd = 0;
for (let x = 100; x < img.width - 100; x++) {
  if (xHist[x] > 50 && xStart === 0) xStart = x;
  if (xHist[x] > 50) xEnd = x;
}
for (let y = 30; y < img.height - 30; y++) {
  if (yHist[y] > 50 && yStart === 0) yStart = y;
  if (yHist[y] > 50) yEnd = y;
}

console.log('Central high-density white board region:');
console.log('X:', xStart, 'to', xEnd);
console.log('Y:', yStart, 'to', yEnd);
