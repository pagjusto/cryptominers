import fs from 'fs';

console.log('Node version:', process.version);
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
console.log('Dependencies:', Object.keys(pkg.dependencies || {}));
console.log('DevDependencies:', Object.keys(pkg.devDependencies || {}));

const uploadPath = 'C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794977429334_e930799a.jpg';
console.log('Image exists:', fs.existsSync(uploadPath), 'size:', fs.existsSync(uploadPath) ? fs.statSync(uploadPath).size : 0);
