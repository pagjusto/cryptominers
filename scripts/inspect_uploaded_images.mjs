import fs from 'fs';
import jpeg from 'jpeg-js';

const img1Path = 'C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794977422861_da3e3e9f.jpg';
const img2Path = 'C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794977429334_e930799a.jpg';

const raw1 = fs.readFileSync(img1Path);
const d1 = jpeg.decode(raw1);
console.log('Image 1 (map with circle):', d1.width, 'x', d1.height);

const raw2 = fs.readFileSync(img2Path);
const d2 = jpeg.decode(raw2);
console.log('Image 2 (billboard):', d2.width, 'x', d2.height);
