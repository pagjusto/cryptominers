const path = require('path');
const { Jimp } = require('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/node_modules/jimp');

async function extractAxe() {
  const imgPath = 'C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_cutout.png';
  const img = await Jimp.read(imgPath);
  const w = img.bitmap.width;
  const h = img.bitmap.height;

  // Let's create an axe image
  // In the image:
  // Axe head: from x=10 to x=125, y=70 to y=205.
  // Handle: diagonal from x=85, y=120 down to x=255, y=225.
  // Let's see what pixels belong to the axe vs the orange body.
  const axe = new Jimp({ width: w, height: h, color: 0x00000000 });
  const body = new Jimp({ width: w, height: h, color: 0x00000000 });

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = img.getPixelColor(x, y);
      const a = c & 255;
      if (a < 20) continue;

      const r = (c >> 24) & 255;
      const g = (c >> 16) & 255;
      const b = (c >> 8) & 255;

      // Check if this pixel is part of the axe:
      // The axe blade is on the left (x < 130, y between 60 and 210)
      // Colors: steel grey/black/white edge. Not vibrant orange!
      // Vibrancy check: in orange body, r is high, g is medium, b is low (r - b > 80).
      // In the axe blade and handle, r - b is low or it is dark.
      const isOrangeBody = (r > 150 && g > 40 && b < 60 && (r - b) > 90);
      const isHelmetHorns = (y < 110 && (r > 140 && g > 110 && b < 70));
      const isHelmetFace = (y < 120 && x > 115 && x < 235);

      // The axe handle goes from (85, 120) to (255, 225).
      // Line equation: y - 120 = (225 - 120) / (255 - 85) * (x - 85) = 105 / 170 * (x - 85) ~ 0.617 * (x - 85)
      const distToHandleAxis = Math.abs(y - (120 + 0.617 * (x - 85)));

      let isAxe = false;
      if (x < 125 && y > 60 && y < 210 && !isOrangeBody && !isHelmetHorns) {
        // This is the blade and socket!
        isAxe = true;
      } else if (distToHandleAxis < 16 && x >= 85 && x <= 260 && y >= 115 && y <= 235) {
        // This is on the handle line!
        // But check if it's the orange hands gripping the handle:
        const isHand = isOrangeBody && (
          (Math.hypot(x - 130, y - 148) < 16) ||
          (Math.hypot(x - 238, y - 208) < 18)
        );
        if (!isHand) {
          isAxe = true;
        }
      }

      if (isAxe) {
        axe.setPixelColor(c, x, y);
      } else {
        body.setPixelColor(c, x, y);
      }
    }
  }

  await axe.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_axe_raw.png');
  await body.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_body_raw.png');
  console.log('Saved raw separation to public/viking_axe_raw.png and viking_body_raw.png');
}

extractAxe().catch(console.error);
