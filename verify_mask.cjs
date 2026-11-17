const { Jimp, rgbaToInt } = require('jimp');

async function testMask() {
  const img = await Jimp.read('public/canyon_mine_map.png');
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  const cols = 15;
  const rows = 11;
  const tw = w / cols;
  const th = h / rows;

  // Exact coordinates of the track and tunnel on the 15x11 grid:
  // Tunnel entrance:
  // Center cave: c: 7..10, r: 3..6
  
  // Track cells based on the visual layout:
  // Left straight entrance:
  // r=5: c=0, 1, 2, 3, 4, 5
  // r=6: c=0, 1, 2, 3, 4, 5
  // Left curve upwards around tunnel:
  // r=4: c=4, 5, 6
  // r=3: c=4, 5, 6
  // r=2: c=3, 4, 5
  // r=1: c=3, 4, 5, 6
  // Top curve going right:
  // r=0: c=4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14
  // r=1: c=12, 13, 14
  // Right side curve downwards:
  // r=2: c=13, 14
  // r=3: c=13, 14
  // r=4: c=12, 13, 14
  // r=5: c=11, 12, 13
  // r=6: c=10, 11, 12
  // Bottom-right loop curving down and right:
  // r=7: c=9, 10, 11
  // r=8: c=9, 10, 11, 12, 13
  // r=9: c=10, 11, 12, 13, 14
  // r=10: c=11, 12, 13, 14

  const isTrack = (c, r) => {
    // Tunnel entrance
    if (c >= 7 && c <= 10 && r >= 3 && r <= 6) return true;

    // Track rows
    if (r === 5 || r === 6) {
      if (c <= 5) return true; // Left entrance
    }
    if (r === 4 && (c >= 4 && c <= 6)) return true;
    if (r === 3 && (c >= 4 && c <= 6)) return true;
    if (r === 2 && (c >= 3 && c <= 5)) return true;
    if (r === 1 && (c >= 3 && c <= 6)) return true;

    // Top horizontal and bend
    if (r === 0 && (c >= 4 && c <= 14)) return true;
    if (r === 1 && (c >= 12 && c <= 14)) return true;

    // Right curve descending
    if (r === 2 && (c >= 13 && c <= 14)) return true;
    if (r === 3 && (c >= 13 && c <= 14)) return true;
    if (r === 4 && (c >= 12 && c <= 14)) return true;
    if (r === 5 && (c >= 11 && c <= 13)) return true;
    if (r === 6 && (c >= 10 && c <= 12)) return true;

    // Bottom loop
    if (r === 7 && (c >= 9 && c <= 11)) return true;
    if (r === 8 && (c >= 9 && c <= 13)) return true;
    if (r === 9 && (c >= 10 && c <= 14)) return true;
    if (r === 10 && (c >= 11 && c <= 14)) return true;

    return false;
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const active = isTrack(c, r);
      const x0 = Math.floor(c * tw);
      const y0 = Math.floor(r * th);
      const x1 = Math.floor((c + 1) * tw);
      const y1 = Math.floor((r + 1) * th);

      if (active) {
        // Tint red/magenta over forbidden track/tunnel area
        for (let py = y0; py < y1; py++) {
          for (let px = x0; px < x1; px++) {
            const col = img.getPixelColor(px, py);
            const rVal = Math.min(255, ((col >> 24) & 255) + 60);
            const gVal = Math.max(0, ((col >> 16) & 255) - 30);
            const bVal = Math.max(0, ((col >> 8) & 255) - 30);
            img.setPixelColor(rgbaToInt(rVal, gVal, bVal, 255), px, py);
          }
        }
      }

      // Draw grid borders
      for (let px = x0; px < x1; px++) {
        img.setPixelColor(0x000000ff, px, y0);
        img.setPixelColor(0x000000ff, px, y1 - 1);
      }
      for (let py = y0; py < y1; py++) {
        img.setPixelColor(0x000000ff, x0, py);
        img.setPixelColor(0x000000ff, x1 - 1, py);
      }
    }
  }

  await img.write('test_mask_overlay.png');
  console.log('Saved test_mask_overlay.png');
}

testMask().catch(console.error);
