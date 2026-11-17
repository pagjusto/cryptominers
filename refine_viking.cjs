const { Jimp, rgbaToInt } = require('jimp');

async function refineViking() {
  const orig = await Jimp.read('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794769555316_0bf565a7.jpg');
  const w = orig.bitmap.width;
  const h = orig.bitmap.height;

  // 1. Crop out the 4px outer screenshot frame completely
  const cropLeft = 4;
  const cropTop = 4;
  const cropRight = 4;
  const cropBottom = 4;

  const cw = w - cropLeft - cropRight;
  const ch = h - cropTop - cropBottom;

  const cropped = new Jimp({ width: cw, height: ch, color: 0x00000000 });
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      cropped.setPixelColor(orig.getPixelColor(x + cropLeft, y + cropTop), x, y);
    }
  }

  // 2. Flood-fill background detection
  const mask = new Uint8Array(cw * ch); // 1 = background, 0 = foreground
  const queue = [];

  // Seed all perimeter pixels
  for (let x = 0; x < cw; x++) {
    queue.push(x, 0);
    queue.push(x, ch - 1);
    mask[0 * cw + x] = 1;
    mask[(ch - 1) * cw + x] = 1;
  }
  for (let y = 0; y < ch; y++) {
    queue.push(0, y);
    queue.push(cw - 1, y);
    mask[y * cw + 0] = 1;
    mask[y * cw + (cw - 1)] = 1;
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];

    const neighbors = [
      [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < cw && ny >= 0 && ny < ch) {
        const idx = ny * cw + nx;
        if (!mask[idx]) {
          const c = cropped.getPixelColor(nx, ny);
          const r = (c >> 24) & 255;
          const g = (c >> 16) & 255;
          const b = (c >> 8) & 255;

          // Background is dark navy:
          // In the dark corners: r < 45, g < 50, b < 65
          const isDark = (r < 40 && g < 48 && b < 65) || (r < 52 && g < 58 && b < 78 && (b >= r && b >= g));

          if (isDark) {
            mask[idx] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  // 3. Find bounding box of remaining foreground
  let minX = cw, maxX = 0, minY = ch, maxY = 0;
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      if (!mask[y * cw + x]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log('Tight character bounds:', { minX, maxX, minY, maxY, width: maxX - minX + 1, height: maxY - minY + 1 });

  // 4. Create final padded sprite
  const pad = 8;
  const fw = (maxX - minX + 1) + pad * 2;
  const fh = (maxY - minY + 1) + pad * 2;
  const finalSprite = new Jimp({ width: fw, height: fh, color: 0x00000000 });

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const idx = y * cw + x;
      if (!mask[idx]) {
        const c = cropped.getPixelColor(x, y);
        const r = (c >> 24) & 255;
        const g = (c >> 16) & 255;
        const b = (c >> 8) & 255;

        // Anti-aliased alpha falloff for boundary pixels
        let bgCount = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny < 0 || ny >= ch || nx < 0 || nx >= cw || mask[ny * cw + nx]) {
              bgCount++;
            }
          }
        }

        let a = 255;
        if (bgCount > 0) {
          a = Math.round(255 * (1 - (bgCount / 9) * 0.4));
        }

        finalSprite.setPixelColor(rgbaToInt(r, g, b, a), x - minX + pad, y - minY + pad);
      }
    }
  }

  await finalSprite.write('public/miners/viking_cutout.png');
  await finalSprite.write('public/viking_cutout.png');
  await finalSprite.write('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/viking_clean_cutout.png');

  console.log('Saved clean cutout to public/miners/viking_cutout.png (width: ' + fw + ', height: ' + fh + ')');
}

refineViking().catch(console.error);
