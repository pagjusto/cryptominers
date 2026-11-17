const { Jimp } = require('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/node_modules/jimp');

async function createComposite() {
  const body = await Jimp.read('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_body_clean.png');
  const axe = await Jimp.read('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_axe_clean.png');

  // Let's create a composite of the Viking holding the axe in ready stance:
  // In ready stance, the axe is tilted at ~ 25 degrees (or -25 degrees) held across the fists.
  // Axe dimensions: 105 x 157.
  // Body dimensions: 116 x 170.
  
  // Let's rotate the axe by -20 degrees for a heroic ready stance
  const rotatedAxe = axe.clone().rotate(-22);

  // Composite canvas: 180 x 200
  const comp = new Jimp({ width: 180, height: 200, color: 0x00000000 });

  // Blit body in center: x ~ 40, y ~ 20
  // In the body, left fist is at x ~ 49+36 = 85 (in 180 canvas: 40 + 36 = 76)
  // Let's blit the body first
  const bodyX = 35;
  const bodyY = 25;

  // Let's blit the rotated axe so it fits in the hands
  const axeX = 15;
  const axeY = 15;

  // Blit axe in front of body
  comp.composite(body, bodyX, bodyY);
  comp.composite(rotatedAxe, axeX, axeY);

  // Crop tight
  let minX = 180, maxX = 0, minY = 200, maxY = 0;
  for (let y = 0; y < 200; y++) {
    for (let x = 0; x < 180; x++) {
      const a = comp.getPixelColor(x, y) & 255;
      if (a > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const tight = new Jimp({ width: cw, height: ch, color: 0x00000000 });
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      tight.setPixelColor(comp.getPixelColor(minX + x, minY + y), x, y);
    }
  }

  await tight.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_cutout.png');
  await tight.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/miners/viking_cutout.png');
  await tight.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/miners/brute.png');
  await tight.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/miners/viking.png');
  await tight.write('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/miners/viking_pixel.png');
  await tight.write('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/viking_composite_preview.png');

  console.log('Saved composite tight:', cw, 'x', ch);
}

createComposite().catch(console.error);
