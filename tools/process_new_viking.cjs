const { Jimp } = require('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/node_modules/jimp');

function removeGridBackground(img) {
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  const mask = new Uint8Array(w * h); // 1 = background, 0 = foreground
  const queue = [];

  // Helper to check if pixel is background (near-white / faint grey checkerboard)
  const isBgPixel = (x, y) => {
    const c = img.getPixelColor(x, y);
    const r = (c >> 24) & 255;
    const g = (c >> 16) & 255;
    const b = (c >> 8) & 255;
    const a = c & 255;
    if (a < 50) return true;
    // Checkerboard is between 220 and 255, nearly neutral
    return (r >= 210 && g >= 210 && b >= 210 && Math.abs(r - g) <= 10 && Math.abs(g - b) <= 10);
  };

  // Seed outer edges
  for (let x = 0; x < w; x++) {
    if (isBgPixel(x, 0)) { mask[0 * w + x] = 1; queue.push(x, 0); }
    if (isBgPixel(x, h - 1)) { mask[(h - 1) * w + x] = 1; queue.push(x, h - 1); }
  }
  for (let y = 0; y < h; y++) {
    if (isBgPixel(0, y)) { mask[y * w + 0] = 1; queue.push(0, y); }
    if (isBgPixel(w - 1, y)) { mask[y * w + (w - 1)] = 1; queue.push(w - 1, y); }
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
        if (!mask[idx] && isBgPixel(nx, ny)) {
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

async function process() {
  const bodyRaw = await Jimp.read('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794772077766_14cf9b11.png');
  const weaponRaw = await Jimp.read('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794772087616_01e43150.png');

  const { cropped: body, bounds: bodyBounds } = removeGridBackground(bodyRaw);
  const { cropped: weapon, bounds: weaponBounds } = removeGridBackground(weaponRaw);

  console.log('Body cropped size:', body.bitmap.width, 'x', body.bitmap.height, bodyBounds);
  console.log('Weapon cropped size:', weapon.bitmap.width, 'x', weapon.bitmap.height, weaponBounds);

  await body.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_body_clean.png');
  await body.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/miners/viking_body_clean.png');
  await body.write('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/viking_body_clean.png');

  await weapon.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_axe_clean.png');
  await weapon.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/miners/viking_axe_clean.png');
  await weapon.write('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/viking_axe_clean.png');

  console.log('Assets processed and saved successfully!');
}

process().catch(console.error);
