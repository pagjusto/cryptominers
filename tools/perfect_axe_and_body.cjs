const { Jimp } = require('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/node_modules/jimp');

async function process() {
  const imgPath = 'C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_cutout.png';
  const img = await Jimp.read(imgPath);
  const w = img.bitmap.width;
  const h = img.bitmap.height;

  // 1. ISOLATE AND CLEAN THE 3D BATTLEAXE
  // Let's create an axe image with transparent background
  const axe = new Jimp({ width: w, height: h, color: 0x00000000 });

  // Handle axis parameters:
  // p1 = (92, 128) - socket start
  // p2 = (248, 218) - pommel end
  const p1 = { x: 92, y: 128 };
  const p2 = { x: 248, y: 218 };
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  // Normal to handle
  const nx = -uy;
  const ny = ux;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = img.getPixelColor(x, y);
      const a = c & 255;
      if (a < 20) continue;

      const r = (c >> 24) & 255;
      const g = (c >> 16) & 255;
      const b = (c >> 8) & 255;

      // Project (x, y) onto handle axis
      const vx = x - p1.x;
      const vy = y - p1.y;
      const t = vx * ux + vy * uy; // along handle
      const d = Math.abs(vx * nx + vy * ny); // distance from handle centerline

      const isAxeHead = (x <= 118 && y >= 62 && y <= 212);
      const isHandle = (t >= -5 && t <= len + 10 && d <= 12.5);

      if (isAxeHead) {
        // Exclude orange body if any touched the left edge
        const isOrange = (r > 160 && g > 45 && b < 60 && (r - b) > 95);
        if (!isOrange) {
          axe.setPixelColor(c, x, y);
        }
      } else if (isHandle) {
        // Exclude orange fingers or stray belt pixels
        const isOrange = (r > 150 && g > 40 && b < 55 && (r - b) > 90);
        // Exclude the diagonal belt that crosses perpendicular to handle
        const isBelt = (y < 155 && x > 140 && d > 7);
        if (!isOrange && !isBelt) {
          axe.setPixelColor(c, x, y);
        }
      }
    }
  }

  // Fill in holes in the handle (where fingers gripped it)
  // Let's sample the wood color from the clean handle: ~ rgba(55, 36, 30)
  for (let t = 0; t <= len; t += 1) {
    for (let d = -8; d <= 8; d += 1) {
      const px = Math.round(p1.x + t * ux + d * nx);
      const py = Math.round(p1.y + t * uy + d * ny);
      if (px >= 0 && px < w && py >= 0 && py < h) {
        const c = axe.getPixelColor(px, py);
        const a = c & 255;
        if (a < 50) {
          // Fill handle wood with gradient: darker on edges, warm oak in center
          const woodR = Math.round(65 - Math.abs(d) * 2.5);
          const woodG = Math.round(42 - Math.abs(d) * 1.8);
          const woodB = Math.round(32 - Math.abs(d) * 1.5);
          const color = (woodR << 24) | (woodG << 16) | (woodB << 8) | 255;
          axe.setPixelColor(color, px, py);
        }
      }
    }
  }

  // Find tight bounding box of axe
  let minAx = w, maxAx = 0, minAy = h, maxAy = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = axe.getPixelColor(x, y) & 255;
      if (a > 20) {
        if (x < minAx) minAx = x;
        if (x > maxAx) maxAx = x;
        if (y < minAy) minAy = y;
        if (y > maxAy) maxAy = y;
      }
    }
  }

  const aw = maxAx - minAx + 1;
  const ah = maxAy - minAy + 1;
  console.log('Axe bounds:', { minAx, maxAx, minAy, maxAy, aw, ah });

  // Create tight cropped axe
  const croppedAxe = new Jimp({ width: aw, height: ah, color: 0x00000000 });
  for (let y = 0; y < ah; y++) {
    for (let x = 0; x < aw; x++) {
      croppedAxe.setPixelColor(axe.getPixelColor(minAx + x, minAy + y), x, y);
    }
  }

  await croppedAxe.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_axe_3d.png');
  await croppedAxe.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/miners/viking_axe_3d.png');
  await croppedAxe.write('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/viking_axe_3d.png');
  console.log('Saved 3D Axe to public/viking_axe_3d.png!');
}

process().catch(console.error);
