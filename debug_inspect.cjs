const { Jimp } = require('jimp');

async function check() {
  try {
    const img = await Jimp.read('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794763056861_80f338c6.jpg');
    console.log('Image dimensions:', img.bitmap.width, 'x', img.bitmap.height);
  } catch (e) {
    console.error(e);
  }
}
check();
