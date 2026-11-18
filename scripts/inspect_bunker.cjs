// Convert webp to png so we can inspect pixels with pngjs
// Let's see if we have webp-converter or any decoder
const fs = require('fs');
console.log('Inspecting city_map.webp...');
// We can use canvas if installed or write a small html to render it and inspect
