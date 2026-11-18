import fs from 'fs';
import jpeg from 'jpeg-js';

const img1Path = 'C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794977422861_da3e3e9f.jpg';
const raw = fs.readFileSync(img1Path);
const img = jpeg.decode(raw);

// Find canvas top, bottom, left, right border
// Look at row 250 across columns to see where the map background starts
let left = 0, right = img.width - 1, top = 0, bottom = img.height - 1;

for (let x = 0; x < 50; x++) {
  const idx = (250 * img.width + x) * 4;
  // If not border/outer margin
  // Outer margin is very dark (r < 10, g < 10, b < 20)
  if (img.data[idx] > 30 || img.data[idx+1] > 30) {
    left = x;
    break;
  }
}
for (let x = img.width - 1; x > img.width - 60; x--) {
  const idx = (250 * img.width + x) * 4;
  if (img.data[idx] > 30 || img.data[idx+1] > 30) {
    right = x;
    break;
  }
}
for (let y = 0; y < 50; y++) {
  const idx = (y * img.width + 350) * 4;
  if (img.data[idx] > 30 || img.data[idx+1] > 30) {
    top = y;
    break;
  }
}
for (let y = img.height - 1; y > img.height - 60; y--) {
  const idx = (y * img.width + 350) * 4;
  if (img.data[idx] > 30 || img.data[idx+1] > 30) {
    bottom = y;
    break;
  }
}

console.log('Canvas boundaries inside screenshot:');
console.log('Left:', left, 'Right:', right, 'Width:', right - left);
console.log('Top:', top, 'Bottom:', bottom, 'Height:', bottom - top);

// Given GRID_COLS = 15, GRID_ROWS = 11
const cellW = (right - left) / 15;
const cellH = (bottom - top) / 11;
console.log('Cell width:', cellW.toFixed(2), 'Cell height:', cellH.toFixed(2));

const colStart = (320 - left) / cellW;
const colEnd = (499 - left) / cellW;
const rowStart = (26 - top) / cellH;
const rowEnd = (135 - top) / cellH;

console.log(`Grid Column range: ${colStart.toFixed(2)} to ${colEnd.toFixed(2)} -> Cols ~ ${Math.round(colStart)} to ${Math.round(colEnd)}`);
console.log(`Grid Row range: ${rowStart.toFixed(2)} to ${rowEnd.toFixed(2)} -> Rows ~ ${Math.round(rowStart)} to ${Math.round(rowEnd)}`);
