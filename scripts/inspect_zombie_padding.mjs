import fs from 'fs';
import { PNG } from 'pngjs';

for (const name of ['zombie_clean.png', 'zombie_upper.png', 'zombie_leg_left.png', 'zombie_leg_right.png', 'boss_clean.png']) {
  const filePath = `public/enemies/${name}`;
  if (fs.existsSync(filePath)) {
    const png = PNG.sync.read(fs.readFileSync(filePath));
    let minY = png.height, maxY = 0, minX = png.width, maxX = 0;
    for (let y = 0; y < png.height; y++) {
      for (let x = 0; x < png.width; x++) {
        const idx = (y * png.width + x) * 4;
        if (png.data[idx + 3] > 10) {
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
      }
    }
    console.log(`${name}: ${png.width}x${png.height}`);
    console.log(`  Opaque bounds: X: ${minX}..${maxX} (${maxX - minX + 1}px), Y: ${minY}..${maxY} (${maxY - minY + 1}px)`);
    console.log(`  Bottom transparent padding: ${png.height - 1 - maxY}px (${((png.height - 1 - maxY) / png.height * 100).toFixed(1)}%)`);
  }
}
