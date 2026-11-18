import fs from 'fs';
import { PNG } from 'pngjs';

const png = PNG.sync.read(fs.readFileSync('public/assets/billboard.png'));

// The left leg is around x in 60..115 (in cropped coordinates)
// The right leg is around x in 480..535 (in cropped coordinates)
// The bottom of the board is around y in 360..480
// In the region between x = 150 and x = 450, for y > 400:
// Pixels should be transparent (alpha = 0)!
let opaqueBetweenLegs = 0;
for (let y = 420; y < png.height; y++) {
  for (let x = 160; x < 450; x++) {
    const idx = (y * png.width + x) * 4;
    if (png.data[idx + 3] > 0) {
      opaqueBetweenLegs++;
    }
  }
}
console.log('Opaque pixels between legs (below board):', opaqueBetweenLegs);
