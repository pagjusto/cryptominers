const { Jimp } = require('jimp');

async function inspectSplineVsTrack() {
  const img = await Jimp.read('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/spline_refined_perfect.png');
  const w = img.bitmap.width;
  const h = img.bitmap.height;

  // Let's sample a crop of the left curve around the tunnel (x=300 to 500, y=100 to 500)
  // and see where the green line (R=0, G=255, B=0) is!
  // Also crop right curve (x=650 to 1024, y=200 to 800)
  
  const cropLeft = img.clone();
  cropLeft.crop({ x: 280, y: 50, w: 220, h: 450 });
  await cropLeft.write('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/spline_crop_left_curve.png');

  const cropRight = img.clone();
  cropRight.crop({ x: 650, y: 200, w: 370, h: 640 });
  await cropRight.write('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/spline_crop_right_curve.png');

  console.log('Saved spline_crop_left_curve.png and spline_crop_right_curve.png');
}

inspectSplineVsTrack().catch(console.error);
