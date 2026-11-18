import fs from 'fs';
import path from 'path';

function walk(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      files = files.concat(walk(full));
    } else if (full.endsWith('.js') || full.endsWith('.jsx')) {
      files.push(full);
    }
  }
  return files;
}

const files = walk('./src');
console.log('Total source files:', files.length);

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  if (content.includes('isCityObstacle') || content.includes('isCityBuilding') || content.includes('isCanyonTrackOrTunnel')) {
    console.log('File referencing obstacle system:', file);
  }
}
