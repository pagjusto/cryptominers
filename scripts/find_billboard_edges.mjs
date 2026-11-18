import fs from 'fs';
import jpeg from 'jpeg-js';

const img2Path = 'C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794977429334_e930799a.jpg';
const raw = fs.readFileSync(img2Path);
const img = jpeg.decode(raw);

// Let's sample along horizontal lines to find the billboard frame
// Let's check y = 200 (across middle of billboard)
let leftX = 0, rightX = 0;
for (let x = 0; x < img.width; x++) {
  const idx = (200 * img.width + x) * 4;
  const r = img.data[idx], g = img.data[idx+1], b = img.data[idx+2];
  // Outside is grass (g > 120, g > r * 0.9, g > b * 1.3)
  const isGrass = g > 110 && g > b * 1.2 && g > r * 0.8;
  if (!isGrass && leftX === 0 && x > 100) {
    leftX = x;
  }
  if (!isGrass) {
    rightX = x;
  }
}
console.log('Horizontal span at y=200:', leftX, 'to', rightX, 'width:', rightX - leftX);

// Check y=100
let leftX100 = 0, rightX100 = 0;
for (let x = 0; x < img.width; x++) {
  const idx = (100 * img.width + x) * 4;
  const r = img.data[idx], g = img.data[idx+1], b = img.data[idx+2];
  const isGrass = g > 110 && g > b * 1.2 && g > r * 0.8;
  if (!isGrass && leftX100 === 0 && x > 100) leftX100 = x;
  if (!isGrass) rightX100 = x;
}
console.log('Horizontal span at y=100:', leftX100, 'to', rightX100);

// Check y=350
let leftX350 = 0, rightX350 = 0;
for (let x = 0; x < img.width; x++) {
  const idx = (350 * img.width + x) * 4;
  const r = img.data[idx], g = img.data[idx+1], b = img.data[idx+2];
  const isGrass = g > 110 && g > b * 1.2 && g > r * 0.8;
  if (!isGrass && leftX350 === 0 && x > 100) leftX350 = x;
  if (!isGrass) rightX350 = x;
}
console.log('Horizontal span at y=350:', leftX350, 'to', rightX350);
