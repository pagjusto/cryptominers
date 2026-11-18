import fs from 'fs';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

const img2Path = 'C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794977429334_e930799a.jpg';
const raw = fs.readFileSync(img2Path);
const img = jpeg.decode(raw);

console.log('Decoded billboard image:', img.width, 'x', img.height);
