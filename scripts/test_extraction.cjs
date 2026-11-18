const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794975569003_966b73cc.png';
const srcPng = PNG.sync.read(fs.readFileSync(imgPath));

// Function to flood-fill transparent background on a sub-region
function extractSegment(src, x0, y0, w, h) {
  const out = new PNG({ width: w, height: h });
  // Copy region
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcIdx = ((y0 + y) * src.width + (x0 + x)) * 4;
      const dstIdx = (y * w + x) * 4;
      out.data[dstIdx] = src.data[srcIdx];
      out.data[dstIdx + 1] = src.data[srcIdx + 1];
      out.data[dstIdx + 2] = src.data[srcIdx + 2];
      out.data[dstIdx + 3] = src.data[srcIdx + 3];
    }
  }

  // Flood fill from borders to remove background (white/off-white)
  const visited = new Uint8Array(w * h);
  const queue = [];

  function isBgColor(idx) {
    const r = out.data[idx];
    const g = out.data[idx + 1];
    const b = out.data[idx + 2];
    // Background is near white/light gray: r > 215, g > 215, b > 215
    return r > 215 && g > 215 && b > 215;
  }

  // Push border pixels
  for (let x = 0; x < w; x++) {
    const topIdx = x * 4;
    const botIdx = ((h - 1) * w + x) * 4;
    if (isBgColor(topIdx)) { queue.push(x, 0); visited[x] = 1; }
    if (isBgColor(botIdx)) { queue.push(x, h - 1); visited[(h - 1) * w + x] = 1; }
  }
  for (let y = 0; y < h; y++) {
    const leftIdx = (y * w) * 4;
    const rightIdx = (y * w + (w - 1)) * 4;
    if (isBgColor(leftIdx) && !visited[y * w]) { queue.push(0, y); visited[y * w] = 1; }
    if (isBgColor(rightIdx) && !visited[y * w + (w - 1)]) { queue.push(w - 1, y); visited[y * w + (w - 1)] = 1; }
  }

  let head = 0;
  while (head < queue.length) {
    const qx = queue[head++];
    const qy = queue[head++];
    const idx = (qy * w + qx) * 4;
    out.data[idx + 3] = 0; // Make transparent

    const neighbors = [
      [qx + 1, qy],
      [qx - 1, qy],
      [qx, qy + 1],
      [qx, qy - 1]
    ];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const nPos = ny * w + nx;
        if (!visited[nPos]) {
          visited[nPos] = 1;
          const nIdx = nPos * 4;
          if (isBgColor(nIdx)) {
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  return out;
}

const maleSeg = extractSegment(srcPng, 67, 29, 108, 175);
const femaleSeg = extractSegment(srcPng, 278, 39, 100, 157);
const rifleSeg = extractSegment(srcPng, 27, 285, 187, 89);
const pistolSeg = extractSegment(srcPng, 268, 283, 143, 100);

console.log('Extracted segments successfully:');
console.log('Male:', maleSeg.width, 'x', maleSeg.height);
console.log('Female:', femaleSeg.width, 'x', femaleSeg.height);
console.log('Rifle:', rifleSeg.width, 'x', rifleSeg.height);
console.log('Pistol:', pistolSeg.width, 'x', pistolSeg.height);
