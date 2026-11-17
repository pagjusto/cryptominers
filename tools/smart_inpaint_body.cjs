const { Jimp } = require('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/node_modules/jimp');

async function smartInpaint() {
  const orig = await Jimp.read('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_cutout.png');
  const w = orig.bitmap.width;
  const h = orig.bitmap.height;

  // Let's create an axe-free body sprite:
  // In orig, every pixel is either:
  // 1) Background (transparent)
  // 2) Character body (helmet, horns, face, orange skin, leather belts, boots)
  // 3) Axe (steel blade, wooden handle, metal socket)
  
  // We already know where the axe is:
  // Blade: x <= 118, y in [62, 212]
  // Handle: diagonal from (92, 128) to (250, 222) with radius ~ 13px.

  // Let's define the outer character silhouette mask from orig
  const silhouette = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = orig.getPixelColor(x, y) & 255;
      if (a > 30) {
        silhouette[y * w + x] = 1;
      }
    }
  }

  // Identify axe pixels to remove from body:
  const isAxePixel = (x, y) => {
    const a = orig.getPixelColor(x, y) & 255;
    if (a < 30) return false;

    // Check if blade
    if (x <= 116 && y >= 65 && y <= 208) {
      const c = orig.getPixelColor(x, y);
      const r = (c >> 24) & 255;
      const g = (c >> 16) & 255;
      const b = (c >> 8) & 255;
      const isOrangeSkin = (r > 165 && g > 45 && b < 60 && (r - b) > 95);
      return !isOrangeSkin;
    }

    // Check if handle
    // p1 = (90, 126), p2 = (250, 220)
    const dx = 250 - 90;
    const dy = 220 - 126;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;

    const vx = x - 90;
    const vy = y - 126;
    const t = vx * ux + vy * uy;
    const d = Math.abs(vx * nx + vy * ny);

    if (t >= -2 && t <= len + 5 && d <= 12) {
      // It's on the handle!
      // But keep hands if they are orange
      const c = orig.getPixelColor(x, y);
      const r = (c >> 24) & 255;
      const g = (c >> 16) & 255;
      const b = (c >> 8) & 255;
      const isOrangeHand = (r > 155 && g > 40 && b < 55 && (r - b) > 90);
      return !isOrangeHand;
    }

    return false;
  };

  const body = new Jimp({ width: w, height: h, color: 0x00000000 });
  const needsInpaint = new Uint8Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (silhouette[y * w + x]) {
        if (isAxePixel(x, y)) {
          // If the axe was on top of the character's body (torso/belly/legs):
          // Check if it's inside the torso/belly region (x > 95)
          if (x > 95) {
            needsInpaint[y * w + x] = 1;
          }
        } else {
          body.setPixelColor(orig.getPixelColor(x, y), x, y);
        }
      }
    }
  }

  // Iterative inpainting / diffusion: fill needsInpaint from surrounding body pixels
  for (let pass = 0; pass < 20; pass++) {
    const toFill = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        if (needsInpaint[idx]) {
          let sumR = 0, sumG = 0, sumB = 0, count = 0;
          const neighbors = [
            [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1],
            [x + 1, y + 1], [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1]
          ];
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nidx = ny * w + nx;
              if (silhouette[nidx] && !needsInpaint[nidx]) {
                const c = body.getPixelColor(nx, ny);
                if ((c & 255) > 50) {
                  sumR += (c >> 24) & 255;
                  sumG += (c >> 16) & 255;
                  sumB += (c >> 8) & 255;
                  count++;
                }
              }
            }
          }
          if (count > 0) {
            const avgR = Math.round(sumR / count);
            const avgG = Math.round(sumG / count);
            const avgB = Math.round(sumB / count);
            toFill.push({ x, y, c: (((avgR << 24) | (avgG << 16) | (avgB << 8) | 255) >>> 0) });
          }
        }
      }
    }

    if (toFill.length === 0) break;
    for (const item of toFill) {
      body.setPixelColor(item.c, item.x, item.y);
      needsInpaint[item.y * w + item.x] = 0;
    }
  }

  await body.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_body_clean.png');
  await body.write('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/viking_body_clean.png');
  console.log('Smart inpaint complete!');
}

smartInpaint().catch(console.error);
