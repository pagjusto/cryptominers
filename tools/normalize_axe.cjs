const { Jimp } = require('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/node_modules/jimp');

async function normalizeAxe() {
  const orig = await Jimp.read('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_axe_3d_clean.png');
  const w = orig.bitmap.width;
  const h = orig.bitmap.height;

  // The handle in viking_axe_3d_clean.png is along vector (ux, uy)
  // Let's find the angle of the handle:
  // p1 (socket) ~ (92 - 8, 128 - 65) = (84, 63)
  // p2 (pommel) ~ (248 - 8, 218 - 65) = (240, 153)
  // dx = 156, dy = 90 -> angle = atan2(90, 156) = 29.98 degrees (~30 degrees).
  // If we rotate by -120 degrees (-29.98 - 90 = -120 degrees), the handle will point straight DOWN (positive Y) and the blade will point straight UP (negative Y)!
  
  // Let's rotate by -120 degrees with Jimp
  // In Jimp, rotate is clockwise for positive degrees.
  const rotated = orig.clone().rotate(-120);

  // Now find tight bounding box
  let minX = rotated.bitmap.width, maxX = 0, minY = rotated.bitmap.height, maxY = 0;
  for (let y = 0; y < rotated.bitmap.height; y++) {
    for (let x = 0; x < rotated.bitmap.width; x++) {
      const a = rotated.getPixelColor(x, y) & 255;
      if (a > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const rw = maxX - minX + 1;
  const rh = maxY - minY + 1;
  console.log('Rotated axe bounds:', { rw, rh });

  const finalAxe = new Jimp({ width: rw, height: rh, color: 0x00000000 });
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      finalAxe.setPixelColor(rotated.getPixelColor(minX + x, minY + y), x, y);
    }
  }

  await finalAxe.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_axe_vertical.png');
  await finalAxe.write('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/viking_axe_vertical.png');
  console.log('Saved vertical axe to public/viking_axe_vertical.png');
}

normalizeAxe().catch(console.error);
