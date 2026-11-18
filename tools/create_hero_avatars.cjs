const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const roster = PNG.sync.read(fs.readFileSync('public/assets/hero-roster.png'));
const numHeroes = 11;
const frameW = 128;
const frameH = 128;

const avatarsPng = new PNG({ width: numHeroes * frameW, height: frameH });

for (let h = 0; h < numHeroes; h++) {
  const frameStartX = h * frameW;

  // 1. Find character bounding box within this frame
  let minX = frameW, maxX = 0, minY = frameH, maxY = 0;
  for (let y = 0; y < frameH; y++) {
    for (let x = 0; x < frameW; x++) {
      const idx = (y * roster.width + (frameStartX + x)) * 4;
      if (roster.data[idx + 3] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const charW = maxX - minX + 1;
  const charH = maxY - minY + 1;

  // 2. Scale character to fill 122px of the 128px frame (maximum zoom and visibility!)
  const targetH = 122;
  const scale = targetH / charH;
  const scaledW = Math.round(charW * scale);
  const scaledH = targetH;

  const dstTopY = Math.round((frameH - scaledH) / 2); // perfectly centered vertically
  const dstLeftX = Math.round((frameW - scaledW) / 2); // perfectly centered horizontally

  const SUB = 4;
  for (let dy = 0; dy < scaledH; dy++) {
    const fy = dstTopY + dy;
    if (fy < 0 || fy >= frameH) continue;

    for (let dx = 0; dx < scaledW; dx++) {
      const fx = dstLeftX + dx;
      if (fx < 0 || fx >= frameW) continue;

      let rAcc = 0, gAcc = 0, bAcc = 0, aAcc = 0;

      for (let syi = 0; syi < SUB; syi++) {
        const subY = dy + (syi + 0.5) / SUB;
        const srcY = minY + Math.min(charH - 1, Math.max(0, Math.floor(subY / scale)));

        for (let sxi = 0; sxi < SUB; sxi++) {
          const subX = dx + (sxi + 0.5) / SUB;
          const srcX = minX + Math.min(charW - 1, Math.max(0, Math.floor(subX / scale)));

          const srcIdx = (srcY * roster.width + (frameStartX + srcX)) * 4;
          const a = roster.data[srcIdx + 3];
          if (a <= 10) continue;

          rAcc += roster.data[srcIdx];
          gAcc += roster.data[srcIdx + 1];
          bAcc += roster.data[srcIdx + 2];
          aAcc += a;
        }
      }

      const totalSamples = SUB * SUB;
      const alpha = Math.round(aAcc / totalSamples);
      if (alpha > 10) {
        const globalX = frameStartX + fx;
        const globalIdx = (fy * avatarsPng.width + globalX) * 4;
        const count = aAcc / 255;
        avatarsPng.data[globalIdx] = Math.round(rAcc / count);
        avatarsPng.data[globalIdx + 1] = Math.round(gAcc / count);
        avatarsPng.data[globalIdx + 2] = Math.round(bAcc / count);
        avatarsPng.data[globalIdx + 3] = alpha;
      }
    }
  }

  console.log(`Hero [${h}]: char bbox [${minX}, ${minY}, ${maxX}, ${maxY}] (${charW}x${charH}) -> scaled to (${scaledW}x${scaledH}) at (${dstLeftX}, ${dstTopY})`);
}

fs.writeFileSync('public/assets/hero-avatars.png', PNG.sync.write(avatarsPng));
console.log('✅ Generated public/assets/hero-avatars.png successfully!');
