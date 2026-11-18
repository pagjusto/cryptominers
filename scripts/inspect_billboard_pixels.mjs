import fs from 'fs';
import jpeg from 'jpeg-js';

const img2Path = 'C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794977429334_e930799a.jpg';
const raw = fs.readFileSync(img2Path);
const img = jpeg.decode(raw);

console.log('Image 2:', img.width, 'x', img.height);
// Let's sample colors in the center (billboard board)
// and corners (background grass)
const centerIdx = ((Math.floor(img.height / 2)) * img.width + Math.floor(img.width / 2)) * 4;
console.log('Center pixel:', img.data[centerIdx], img.data[centerIdx+1], img.data[centerIdx+2]);

const cornerIdx = 0;
console.log('Top-left corner:', img.data[cornerIdx], img.data[cornerIdx+1], img.data[cornerIdx+2]);
