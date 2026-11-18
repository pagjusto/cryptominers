import fs from 'fs';
import jpeg from 'jpeg-js';

const img2Path = 'C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794977429334_e930799a.jpg';
const raw = fs.readFileSync(img2Path);
const img = jpeg.decode(raw);

// Let's inspect the billboard boundary:
// For several columns x = 250, 350, 450, 550, 650, 750, 800
// find the first pixel from top that is the billboard top frame,
// and the bottom of the sign board, and the bottom of the support feet.
for (const x of [250, 350, 450, 550, 650, 750, 800]) {
  let topY = -1;
  let bottomSignY = -1;
  let footY = -1;

  for (let y = 10; y < img.height; y++) {
    const idx = (y * img.width + x) * 4;
    const r = img.data[idx], g = img.data[idx+1], b = img.data[idx+2];
    
    // Background grass is yellowish-green: g > 130 && r > 100 && b < 110 && g > r * 0.95
    // Billboard metal/board is either dark rusted metal (r,g,b < 90) or white/cream board (r>160, g>160, b>140) or logo colors
    const isGrass = (g > 120 && g > b * 1.3 && g > r * 0.85);
    
    if (!isGrass && topY === -1 && y < 150) {
      topY = y;
    }
  }

  console.log(`x=${x}: top frame starts around y=${topY}`);
}
