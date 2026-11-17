const { Jimp } = require('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/node_modules/jimp');

async function cleanBody() {
  const orig = await Jimp.read('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_cutout.png');
  const rawBody = await Jimp.read('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_body_raw.png');
  const w = orig.bitmap.width;
  const h = orig.bitmap.height;

  // Let's create a clean body image
  const body = new Jimp({ width: w, height: h, color: 0x00000000 });

  // Copy existing body pixels
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = rawBody.getPixelColor(x, y);
      if ((c & 255) > 20) {
        body.setPixelColor(c, x, y);
      }
    }
  }

  // Define the torso bounds:
  // Torso center ~ (170, 145), radius X ~ 58, radius Y ~ 55
  // Left shoulder ~ (120, 105), Right arm ~ (235, 160)
  for (let y = 100; y < 225; y++) {
    for (let x = 105; x < 235; x++) {
      const existing = body.getPixelColor(x, y);
      const alpha = existing & 255;
      
      // Check if pixel is inside torso ellipse
      const dx = (x - 172) / 52;
      const dy = (y - 148) / 52;
      const distSq = dx * dx + dy * dy;

      if (distSq <= 1.0) {
        if (alpha < 50) {
          // Inside missing diagonal cut! Inpaint with orange body texture & shading
          // Base orange shading: warm top-left light
          const lightDist = Math.hypot(x - 160, y - 130) / 60;
          const shade = Math.max(0.6, 1.05 - lightDist * 0.45);

          let r = Math.round(220 * shade);
          let g = Math.round(65 * shade);
          let b = Math.round(8 * shade);

          // Check if this pixel is on the leather belt:
          // Belt line goes from (130, 115) to (225, 175)
          // Line equation: (y - 115) - 0.63 * (x - 130) ~ 0
          const beltDist = Math.abs((y - 115) - 0.63 * (x - 130));
          if (beltDist < 9.5) {
            // Dark brown leather belt
            const edgeFactor = Math.abs(beltDist) / 9.5;
            const beltShade = 1.0 - edgeFactor * 0.3;
            r = Math.round(68 * beltShade);
            g = Math.round(38 * beltShade);
            b = Math.round(28 * beltShade);

            // Stitching lines on top and bottom of belt
            if (beltDist > 6.5 && beltDist < 8.5) {
              r = Math.round(110 * beltShade);
              g = Math.round(75 * beltShade);
              b = Math.round(50 * beltShade);
            }
          }

          const col = (((r << 24) | (g << 16) | (b << 8) | 255) >>> 0);
          body.setPixelColor(col, x, y);
        }
      }
    }
  }

  // Smooth blur over the inpaint boundaries to make it 100% seamless
  await body.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_body_clean.png');
  await body.write('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/viking_body_clean.png');
  console.log('Saved clean body to public/viking_body_clean.png');
}

cleanBody().catch(console.error);
