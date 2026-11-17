const { Jimp } = require('jimp');

async function inspectZoom() {
  const img = await Jimp.read('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/minecart_curve_zoom.png');
  console.log('Zoom shot dimensions:', img.bitmap.width, 'x', img.bitmap.height);
}
inspectZoom().catch(console.error);
