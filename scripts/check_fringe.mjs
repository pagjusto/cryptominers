import fs from 'fs';
import { PNG } from 'pngjs';

const png = PNG.sync.read(fs.readFileSync('public/assets/billboard.png'));
console.log('Size:', png.width, 'x', png.height);

// Check edge pixels around the perimeter of non-transparent areas
let fringeCount = 0;
for (let y = 1; y < png.height - 1; y++) {
  for (let x = 1; x < png.width - 1; x++) {
    const idx = (y * png.width + x) * 4;
    const a = png.data[idx + 3];
    if (a > 0) {
      // Check if neighboring transparent pixel
      let hasTransparentNeighbor = false;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nIdx = ((y + dy) * png.width + (x + dx)) * 4;
        if (png.data[nIdx + 3] === 0) {
          hasTransparentNeighbor = true;
          break;
        }
      }
      if (hasTransparentNeighbor) {
        const r = png.data[idx];
        const g = png.data[idx + 1];
        const b = png.data[idx + 2];
        // If green fringe (grass)
        if (g > 110 && g > r * 1.15 && g > b * 1.25) {
          fringeCount++;
        }
      }
    }
  }
}

console.log('Perimeter pixels with green fringe:', fringeCount);
