const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794975569003_966b73cc.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);
console.log('Image dimensions:', png.width, 'x', png.height);
