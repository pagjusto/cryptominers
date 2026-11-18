import fs from 'fs';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

const img2Path = 'C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794977429334_e930799a.jpg';
const raw = fs.readFileSync(img2Path);
const img = jpeg.decode(raw);

// Let's create an RGBA output image
const out = new PNG({ width: img.width, height: img.height });

// Fill with transparent
for (let i = 0; i < out.data.length; i += 4) {
  out.data[i] = 0;
  out.data[i+1] = 0;
  out.data[i+2] = 0;
  out.data[i+3] = 0;
}

// Check every pixel
for (let y = 0; y < img.height; y++) {
  for (let x = 0; x < img.width; x++) {
    const idx = (y * img.width + x) * 4;
    const r = img.data[idx];
    const g = img.data[idx + 1];
    const b = img.data[idx + 2];

    // Check if within billboard broad bounds: x between 200 and 860
    if (x < 200 || x > 860) continue;

    // Top boundary line: from (212, 36) to (845, 160)
    // t in [0, 1]
    const t = (x - 212) / (845 - 212);
    const topY = 36 + t * (160 - 36);
    if (y < topY - 12) continue; // Above billboard top frame

    // Main board bottom line: from (212, 365) to (845, 492)
    const boardBottomY = 365 + t * (492 - 365);

    // Is it in the main board area? (between topY and boardBottomY)
    const inBoardArea = (y >= topY - 12 && y <= boardBottomY + 8);

    // Is it in left leg area? x between 260 and 315, y between boardBottomY and 530
    const inLeftLeg = (x >= 260 && x <= 315 && y > boardBottomY && y <= 530);

    // Is it in right leg area? x between 680 and 735, y > boardBottomY and y <= 570
    const inRightLeg = (x >= 680 && x <= 735 && y > boardBottomY && y <= 570);

    if (!inBoardArea && !inLeftLeg && !inRightLeg) continue;

    // Inside these regions, distinguish foreground (billboard, metal, text, bolts) from background grass
    // Background grass is characterized by:
    // Green > Red, Green > Blue, yellowish green tones
    // Metal is dark (r,g,b low) or rusted (r > g)
    // Board is bright cream/white (r, g, b > 160)
    // Logo is vivid cyan, green, yellow, brown
    
    // Check if pixel is clearly outside grass
    // Grass condition:
    const isGrass = (g > 110 && g > b * 1.25 && g > r * 0.88 && (r < 170 || g > 150));

    // Specifically under the board between legs (where grass shows through):
    if (!inBoardArea) {
      // In the leg zone: legs are dark steel I-beams (r < 110, g < 110, b < 110) or rust
      // If it looks like grass, skip it
      if (isGrass || (g > r && g > b && g > 90)) continue;
    }

    // Also at the very top edge, if grass:
    if (y < topY + 5 && isGrass) continue;

    // Keep pixel
    out.data[idx] = r;
    out.data[idx + 1] = g;
    out.data[idx + 2] = b;
    out.data[idx + 3] = 255;
  }
}

// Find tight bounding box of output
let minX = out.width, maxX = 0, minY = out.height, maxY = 0;
for (let y = 0; y < out.height; y++) {
  for (let x = 0; x < out.width; x++) {
    const idx = (y * out.width + x) * 4;
    if (out.data[idx + 3] > 0) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

console.log('Cutout bounds:', minX, minY, maxX, maxY);
console.log('Cutout size:', maxX - minX + 1, 'x', maxY - minY + 1);

// Crop to tight bounding box
const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;
const cropped = new PNG({ width: cropW, height: cropH });

for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < cropW; x++) {
    const srcIdx = ((minY + y) * out.width + (minX + x)) * 4;
    const dstIdx = (y * cropW + x) * 4;
    cropped.data[dstIdx] = out.data[srcIdx];
    cropped.data[dstIdx + 1] = out.data[srcIdx + 1];
    cropped.data[dstIdx + 2] = out.data[srcIdx + 2];
    cropped.data[dstIdx + 3] = out.data[srcIdx + 3];
  }
}

fs.writeFileSync('public/assets/billboard.png', PNG.sync.write(cropped));
console.log('Saved public/assets/billboard.png successfully!');
