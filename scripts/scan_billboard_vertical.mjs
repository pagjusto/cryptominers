import fs from 'fs';
import jpeg from 'jpeg-js';

const img2Path = 'C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794977429334_e930799a.jpg';
const raw = fs.readFileSync(img2Path);
const img = jpeg.decode(raw);

// The billboard is a large rectangle with a dark rusty metal border:
// Top horizontal beam, bottom beam, left vertical beam, right vertical beam, and support legs.
// Let's sample along horizontal lines to find the top beam, bottom beam, left and right edges.

console.log('Sampling vertical scan down x = 512 (middle):');
for (let y = 0; y < img.height; y += 10) {
  const idx = (y * img.width + 512) * 4;
  const r = img.data[idx], g = img.data[idx+1], b = img.data[idx+2];
  // Check if it's grass (g > r and g > b and g > 100) or metal beam (dark, r~60-90, g~50-70, b~40-60)
  // or white board (r > 180, g > 180, b > 170)
  let type = 'grass/bg';
  if (r > 160 && g > 160 && b > 150) type = 'white_board';
  else if (r < 100 && g < 100 && b < 100) type = 'metal/dark';
  console.log(`y=${y}: rgb(${r},${g},${b}) -> ${type}`);
}
