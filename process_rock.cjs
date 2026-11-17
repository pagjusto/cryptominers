const { Jimp, rgbaToInt } = require('jimp');

function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function getColorForLum(lumNorm) {
  // Key color stops matching the canyon map floor exactly:
  // 0.00: Deep outline/crevice: [52, 30, 15]
  // 0.25: Shadow facet: [110, 65, 28]
  // 0.50: Mid-shadow facet: [155, 95, 45]
  // 0.70: Base canyon dirt floor: [195, 127, 65]
  // 0.88: Sunlit stone facet: [222, 158, 96]
  // 1.00: Crisp highlight rim: [242, 188, 130]

  const stops = [
    { t: 0.00, r: 50,  g: 28,  b: 14 },
    { t: 0.25, r: 108, g: 62,  b: 26 },
    { t: 0.50, r: 154, g: 94,  b: 44 },
    { t: 0.70, r: 195, g: 127, b: 65 },
    { t: 0.88, r: 222, g: 158, b: 96 },
    { t: 1.00, r: 242, g: 188, b: 130 }
  ];

  for (let i = 0; i < stops.length - 1; i++) {
    const s0 = stops[i];
    const s1 = stops[i + 1];
    if (lumNorm >= s0.t && lumNorm <= s1.t) {
      const segT = (lumNorm - s0.t) / (s1.t - s0.t);
      return {
        r: Math.round(lerp(s0.r, s1.r, segT)),
        g: Math.round(lerp(s0.g, s1.g, segT)),
        b: Math.round(lerp(s0.b, s1.b, segT))
      };
    }
  }

  return { r: 242, g: 188, b: 130 };
}

async function recolorRock() {
  const img = await Jimp.read('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794763312882_04954962.png');
  const w = img.bitmap.width;
  const h = img.bitmap.height;

  // Find min/max lum of original non-transparent pixels
  let minLum = 255, maxLum = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = img.getPixelColor(x, y);
      const a = c & 255;
      if (a > 30) {
        const r = (c >> 24) & 255;
        const g = (c >> 16) & 255;
        const b = (c >> 8) & 255;
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum < minLum) minLum = lum;
        if (lum > maxLum) maxLum = lum;
      }
    }
  }

  console.log(`Original lum: min=${minLum}, max=${maxLum}`);

  const out = new Jimp({ width: w, height: h, color: 0x00000000 });

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = img.getPixelColor(x, y);
      const a = c & 255;
      if (a <= 5) continue;

      const r = (c >> 24) & 255;
      const g = (c >> 16) & 255;
      const b = (c >> 8) & 255;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const lumNorm = Math.max(0, Math.min(1, (lum - minLum) / (maxLum - minLum)));

      const mapped = getColorForLum(lumNorm);
      out.setPixelColor(rgbaToInt(mapped.r, mapped.g, mapped.b, a), x, y);
    }
  }

  await out.write('public/stone_original.png');
  await out.write('public/stone_canyon.png');
  await out.write('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/stone_canyon_preview.png');
  console.log('Saved to public/stone_original.png and public/stone_canyon.png');
}

recolorRock().catch(console.error);
