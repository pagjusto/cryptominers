import fs from 'fs';
const modules = fs.readdirSync('./node_modules');
console.log('Relevant modules:', modules.filter(m => m.includes('jpeg') || m.includes('jpg') || m.includes('png') || m.includes('image') || m.includes('canvas') || m.includes('sharp')));
