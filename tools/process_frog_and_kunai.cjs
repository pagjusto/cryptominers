const { Jimp } = require('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/node_modules/jimp');

function removeBackground(img, isBgFn) {
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  const mask = new Uint8Array(w * h); // 1 = background, 0 = foreground
  const queue = [];

  // Seed outer edges
  for (let x = 0; x < w; x++) {
    if (isBgFn(img, x, 0)) { mask[0 * w + x] = 1; queue.push(x, 0); }
    if (isBgFn(img, x, h - 1)) { mask[(h - 1) * w + x] = 1; queue.push(x, h - 1); }
  }
  for (let y = 0; y < h; y++) {
    if (isBgFn(img, 0, y)) { mask[y * w + 0] = 1; queue.push(0, y); }
    if (isBgFn(img, w - 1, y)) { mask[y * w + (w - 1)] = 1; queue.push(w - 1, y); }
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];

    const neighbors = [
      [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
    ];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const idx = ny * w + nx;
        if (!mask[idx] && isBgFn(img, nx, ny)) {
          mask[idx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  // Find tight bounds of foreground
  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[y * w + x]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const fw = maxX - minX + 1;
  const fh = maxY - minY + 1;
  const cropped = new Jimp({ width: fw, height: fh, color: 0x00000000 });

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (!mask[y * w + x]) {
        cropped.setPixelColor(img.getPixelColor(x, y), x - minX, y - minY);
      }
    }
  }

  return { cropped, bounds: { minX, maxX, minY, maxY, fw, fh } };
}

async function processAll() {
  const frogRaw = await Jimp.read('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794777466868_71ebbb5b.png');
  const kunaiRaw = await Jimp.read('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794777490097_e22b20d1.png');

  // Frog background: light grey checkerboard / grid (r, g, b > 210)
  const isFrogBg = (img, x, y) => {
    const c = img.getPixelColor(x, y);
    const a = c & 255;
    if (a < 50) return true;
    const r = (c >> 24) & 255;
    const g = (c >> 16) & 255;
    const b = (c >> 8) & 255;
    return (r >= 210 && g >= 210 && b >= 210 && Math.abs(r - g) <= 10 && Math.abs(g - b) <= 10);
  };

  // Kunai background: dark charcoal (r < 40, g < 40, b < 45)
  const isKunaiBg = (img, x, y) => {
    const c = img.getPixelColor(x, y);
    const a = c & 255;
    if (a < 50) return true;
    const r = (c >> 24) & 255;
    const g = (c >> 16) & 255;
    const b = (c >> 8) & 255;
    return (r < 42 && g < 42 && b < 48);
  };

  const { cropped: frog, bounds: frogBounds } = removeBackground(frogRaw, isFrogBg);
  const { cropped: kunai, bounds: kunaiBounds } = removeBackground(kunaiRaw, isKunaiBg);

  console.log('Frog cropped:', frogBounds);
  console.log('Kunai cropped:', kunaiBounds);

  // Save frog
  await frog.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/frog_shinobi.png');
  await frog.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/miners/frog_shinobi.png');
  await frog.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/miners/goblin.png');
  await frog.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/dist/miners/goblin.png');
  await frog.write('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/frog_shinobi_clean.png');

  // Save kunai
  await kunai.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/kunai_blade.png');
  await kunai.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/miners/kunai_blade.png');
  await kunai.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/dist/kunai_blade.png');
  await kunai.write('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/kunai_blade_clean.png');

  console.log('Frog Shinobi & Kunai processed successfully!');
}

processAll().catch(console.error);
