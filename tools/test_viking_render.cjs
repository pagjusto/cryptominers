const { Jimp } = require('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/node_modules/jimp');

async function checkSizes() {
  const body = await Jimp.read('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_body_clean.png');
  const axe = await Jimp.read('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_axe_clean.png');

  console.log('Body aspect ratio:', body.bitmap.width / body.bitmap.height); // 116 / 170 = 0.682
  console.log('Axe aspect ratio:', axe.bitmap.width / axe.bitmap.height);   // 105 / 157 = 0.668

  // In the game, character standard height is around 48px to 52px.
  // If target body height = 48px:
  // scale = 48 / 170 = 0.282
  // Body width = 116 * 0.282 = 32.7px.
  // Axe height = 157 * 0.282 = 44.3px.
  // Axe width = 105 * 0.282 = 29.6px.
  // This matches the standard chibi game scale!
  console.log('At target body height 48px:');
  console.log('Body width:', 116 * (48 / 170), 'height: 48');
  console.log('Axe width:', 105 * (48 / 170), 'height:', 157 * (48 / 170));
}

checkSizes().catch(console.error);
