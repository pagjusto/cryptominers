const fs = require('fs');
const { PNG } = require('pngjs');
const webp = require('webp-converter');

// Check what modules exist for reading webp or inspect file
console.log('Inspecting public/city_map.webp...');
const stat = fs.statSync('public/city_map.webp');
console.log('city_map.webp size:', stat.size);
