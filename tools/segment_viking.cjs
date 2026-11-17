const path = require('path');
const { Jimp } = require('C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/node_modules/jimp');

async function segment() {
  const imgPath = 'C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/public/viking_cutout.png';
  const img = await Jimp.read(imgPath);
  const w = img.bitmap.width;
  const h = img.bitmap.height;

  // Let's create an axe image and a body image
  const axeImg = new Jimp({ width: w, height: h, color: 0x00000000 });
  const bodyImg = new Jimp({ width: w, height: h, color: 0x00000000 });

  // Let's examine pixels:
  // The axe blade is mostly steel grey (r ~ g ~ b) on the left side (x < 130).
  // The handle is dark wood (r in 50..110, g in 30..70, b in 20..50) running diagonally.
  // The body is orange: r > 160, g in 40..130, b < 50.
  // The helmet is y < 110, x between 90 and 260.
  // Let's inspect by sampling regions or saving debug maps.
  
  // Let's sample colors across several points of interest:
  const samples = [
    { name: 'left blade tip', x: 25, y: 130 },
    { name: 'blade middle', x: 60, y: 140 },
    { name: 'blade upper curve', x: 80, y: 90 },
    { name: 'blade lower curve', x: 65, y: 175 },
    { name: 'socket rivets', x: 85, y: 120 },
    { name: 'handle near hand', x: 120, y: 155 },
    { name: 'hand 1 (orange)', x: 130, y: 145 },
    { name: 'handle mid', x: 175, y: 175 },
    { name: 'hand 2 (orange)', x: 235, y: 200 },
    { name: 'handle end', x: 248, y: 215 },
    { name: 'belly (orange)', x: 165, y: 120 },
    { name: 'belt buckle', x: 195, y: 150 },
    { name: 'helmet center', x: 180, y: 80 }
  ];

  for (const s of samples) {
    const c = img.getPixelColor(s.x, s.y);
    const r = (c >> 24) & 255;
    const g = (c >> 16) & 255;
    const b = (c >> 8) & 255;
    const a = c & 255;
    console.log(`${s.name} (${s.x},${s.y}): rgba(${r},${g},${b},${a})`);
  }
}

segment().catch(console.error);
