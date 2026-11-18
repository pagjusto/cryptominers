import fs from 'fs';
import { PNG } from 'pngjs';

const png = PNG.sync.read(fs.readFileSync('public/assets/billboard.png'));
let minY = 999, maxY = 0, minX = 999, maxX = 0;
for (let y = 420; y < png.height; y++) {
  for (let x = 160; x < 450; x++) {
    const idx = (y * png.width + x) * 4;
    if (png.data[idx + 3] > 0) {
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
  }
}
console.log('Coordinates of opaque pixels between legs:');
console.log('X:', minX, 'to', maxX);
console.log('Y:', minY, 'to', maxY);
