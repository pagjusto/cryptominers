const fs = require('fs');
const { PNG } = require('pngjs');

const roster = PNG.sync.read(fs.readFileSync('public/assets/hero-roster.png'));
console.log('hero-roster.png size:', roster.width, 'x', roster.height);

const numHeroes = roster.width / 128;
console.log('Number of heroes currently:', numHeroes);

for (let h = 0; h < numHeroes; h++) {
  const fx0 = h * 128;
  let minX = 128, maxX = 0, minY = 128, maxY = 0;
  for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 128; x++) {
      const idx = (y * roster.width + (fx0 + x)) * 4;
      if (roster.data[idx + 3] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log(`Hero ${h}: w=${maxX - minX + 1}, h=${maxY - minY + 1}, x=[${minX}..${maxX}], y=[${minY}..${maxY}]`);
}
