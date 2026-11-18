import fs from 'fs';
import { PNG } from 'pngjs';

const png = PNG.sync.read(fs.readFileSync('public/assets/billboard.png'));
console.log('Inspecting cutout: width =', png.width, 'height =', png.height);

// Check alpha distribution
let transparentCount = 0;
let opaqueCount = 0;
for (let i = 0; i < png.data.length; i += 4) {
  if (png.data[i + 3] === 0) transparentCount++;
  else opaqueCount++;
}
console.log('Transparent pixels:', transparentCount, 'Opaque pixels:', opaqueCount);
