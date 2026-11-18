import fs from 'fs';

console.log('city_map.webp exists:', fs.existsSync('public/city_map.webp'));
if (fs.existsSync('public/city_map.webp')) {
  console.log('Size:', fs.statSync('public/city_map.webp').size);
}
