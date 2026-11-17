const { Jimp } = require('jimp');

async function testComposite() {
  const map = await Jimp.read('public/canyon_mine_map.png');
  const stone = await Jimp.read('public/stone_original.png');

  // Let's place the stone at a couple of places on the dirt floor to check harmony
  const sw = Math.floor(48 * 0.72);
  const sh = Math.floor(stone.bitmap.height * (sw / stone.bitmap.width));
  stone.resize({ w: sw, h: sh });

  map.composite(stone, 200, 400);
  map.composite(stone, 350, 600);
  map.composite(stone, 800, 450);

  await map.write('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/stone_on_canyon_test.png');
  console.log('Saved test composite to stone_on_canyon_test.png');
}

testComposite().catch(console.error);
