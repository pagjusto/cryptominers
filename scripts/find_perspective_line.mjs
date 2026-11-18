import fs from 'fs';
import jpeg from 'jpeg-js';

const img2Path = 'C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794977429334_e930799a.jpg';
const raw = fs.readFileSync(img2Path);
const img = jpeg.decode(raw);

// The billboard top frame is a straight line in perspective
// Let's find the top metal edge at several X:
for (const x of [230, 300, 400, 500, 600, 700, 800, 820]) {
  // Look from y = 30 to y = 200 for the transition from grass to metal frame
  // Grass has high G relative to R and B. Metal frame is dark/rusted (R, G, B all < 100 or R>G)
  for (let y = 30; y < 200; y++) {
    const idx = (y * img.width + x) * 4;
    const r = img.data[idx], g = img.data[idx+1], b = img.data[idx+2];
    const isGrass = g > 115 && g > b * 1.25 && g > r * 0.88;
    if (!isGrass) {
      console.log(`x=${x}: top edge at y=${y}, rgb=(${r},${g},${b})`);
      break;
    }
  }
}
