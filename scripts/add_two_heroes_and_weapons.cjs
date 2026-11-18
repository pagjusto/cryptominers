const fs = require('fs');
const { PNG } = require('pngjs');

// 1. Load source image uploaded by user
const imgPath = 'C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/.user_uploaded/media_1794975569003_966b73cc.png';
const srcPng = PNG.sync.read(fs.readFileSync(imgPath));

function extractTransparentSegment(src, x0, y0, w, h) {
  const out = new PNG({ width: w, height: h });
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

  const visited = new Uint8Array(w * h);
  const queue = [];

  function isBgColor(idx) {
    const r = out.data[idx];
    const g = out.data[idx + 1];
    const b = out.data[idx + 2];
    return r > 215 && g > 215 && b > 215;
  }

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

const maleRaw = extractTransparentSegment(srcPng, 67, 29, 108, 175);
const femaleRaw = extractTransparentSegment(srcPng, 278, 39, 100, 157);
const rifleRaw = extractTransparentSegment(srcPng, 27, 285, 187, 89);
const pistolRaw = extractTransparentSegment(srcPng, 268, 283, 143, 100);

// Helper to scale a transparent sprite
function scaleSprite(src, targetW, targetH) {
  const dst = new PNG({ width: targetW, height: targetH });
  const scaleX = src.width / targetW;
  const scaleY = src.height / targetH;

  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      // Area sampling
      const srcX = Math.min(src.width - 1, Math.floor((x + 0.5) * scaleX));
      const srcY = Math.min(src.height - 1, Math.floor((y + 0.5) * scaleY));
      const srcIdx = (srcY * src.width + srcX) * 4;
      const dstIdx = (y * targetW + x) * 4;

      dst.data[dstIdx] = src.data[srcIdx];
      dst.data[dstIdx + 1] = src.data[srcIdx + 1];
      dst.data[dstIdx + 2] = src.data[srcIdx + 2];
      dst.data[dstIdx + 3] = src.data[srcIdx + 3];
    }
  }
  return dst;
}

// 2. Load existing 11 heroes
const oldRoster = PNG.sync.read(fs.readFileSync('public/assets/hero-roster.png'));
const oldUpper = PNG.sync.read(fs.readFileSync('public/assets/hero-roster-upper.png'));
const oldLegL = PNG.sync.read(fs.readFileSync('public/assets/hero-roster-leg-left.png'));
const oldLegR = PNG.sync.read(fs.readFileSync('public/assets/hero-roster-leg-right.png'));

const TOTAL_HEROES = 13;
const FRAME_W = 128;
const FRAME_H = 128;

const newRoster = new PNG({ width: TOTAL_HEROES * FRAME_W, height: FRAME_H });
const newUpper = new PNG({ width: TOTAL_HEROES * FRAME_W, height: FRAME_H });
const newLegL = new PNG({ width: TOTAL_HEROES * FRAME_W, height: FRAME_H });
const newLegR = new PNG({ width: TOTAL_HEROES * FRAME_W, height: FRAME_H });

// Copy existing 11 heroes (indexes 0 to 10)
for (let y = 0; y < FRAME_H; y++) {
  for (let x = 0; x < 11 * FRAME_W; x++) {
    const srcIdx = (y * oldRoster.width + x) * 4;
    const dstIdx = (y * newRoster.width + x) * 4;

    for (let c = 0; c < 4; c++) {
      newRoster.data[dstIdx + c] = oldRoster.data[srcIdx + c];
      newUpper.data[dstIdx + c] = oldUpper.data[srcIdx + c];
      newLegL.data[dstIdx + c] = oldLegL.data[srcIdx + c];
      newLegR.data[dstIdx + c] = oldLegR.data[srcIdx + c];
    }
  }
}

// Scale and place Hero 11 (Hunter / Male Commando)
const maleH = 82;
const maleW = Math.round(maleRaw.width * (maleH / maleRaw.height)); // 51
const maleScaled = scaleSprite(maleRaw, maleW, maleH);
const maleDstX = 11 * FRAME_W + Math.round((FRAME_W - maleW) / 2);
const maleDstY = 100 - maleH; // Soles at 100 -> top at 18

for (let y = 0; y < maleH; y++) {
  const fy = maleDstY + y;
  for (let x = 0; x < maleW; x++) {
    const fx = maleDstX + x;
    const srcIdx = (y * maleW + x) * 4;
    const dstIdx = (fy * newRoster.width + fx) * 4;

    if (maleScaled.data[srcIdx + 3] > 20) {
      for (let c = 0; c < 4; c++) {
        newRoster.data[dstIdx + c] = maleScaled.data[srcIdx + c];
      }
      // Upper body vs legs (split at y around hip level: fy <= 68)
      if (fy <= 68) {
        for (let c = 0; c < 4; c++) newUpper.data[dstIdx + c] = maleScaled.data[srcIdx + c];
      } else {
        const frameRelX = fx - 11 * FRAME_W;
        if (frameRelX <= 64) {
          for (let c = 0; c < 4; c++) newLegL.data[dstIdx + c] = maleScaled.data[srcIdx + c];
        } else {
          for (let c = 0; c < 4; c++) newLegR.data[dstIdx + c] = maleScaled.data[srcIdx + c];
        }
      }
    }
  }
}

// Scale and place Hero 12 (Scarlet / Female Soldier)
const femaleH = 78;
const femaleW = Math.round(femaleRaw.width * (femaleH / femaleRaw.height)); // 50
const femaleScaled = scaleSprite(femaleRaw, femaleW, femaleH);
const femaleDstX = 12 * FRAME_W + Math.round((FRAME_W - femaleW) / 2);
const femaleDstY = 100 - femaleH; // Soles at 100 -> top at 22

for (let y = 0; y < femaleH; y++) {
  const fy = femaleDstY + y;
  for (let x = 0; x < femaleW; x++) {
    const fx = femaleDstX + x;
    const srcIdx = (y * femaleW + x) * 4;
    const dstIdx = (fy * newRoster.width + fx) * 4;

    if (femaleScaled.data[srcIdx + 3] > 20) {
      for (let c = 0; c < 4; c++) {
        newRoster.data[dstIdx + c] = femaleScaled.data[srcIdx + c];
      }
      if (fy <= 68) {
        for (let c = 0; c < 4; c++) newUpper.data[dstIdx + c] = femaleScaled.data[srcIdx + c];
      } else {
        const frameRelX = fx - 12 * FRAME_W;
        if (frameRelX <= 64) {
          for (let c = 0; c < 4; c++) newLegL.data[dstIdx + c] = femaleScaled.data[srcIdx + c];
        } else {
          for (let c = 0; c < 4; c++) newLegR.data[dstIdx + c] = femaleScaled.data[srcIdx + c];
        }
      }
    }
  }
}

fs.writeFileSync('public/assets/hero-roster.png', PNG.sync.write(newRoster));
fs.writeFileSync('public/assets/hero-roster-upper.png', PNG.sync.write(newUpper));
fs.writeFileSync('public/assets/hero-roster-leg-left.png', PNG.sync.write(newLegL));
fs.writeFileSync('public/assets/hero-roster-leg-right.png', PNG.sync.write(newLegR));
console.log('✅ Updated hero-roster sheets to 13 heroes (1664x128)!');

// 3. Generate high-definition zoomed hero-avatars.png for all 13 heroes
const newAvatars = new PNG({ width: TOTAL_HEROES * FRAME_W, height: FRAME_H });

for (let h = 0; h < TOTAL_HEROES; h++) {
  const frameStartX = h * FRAME_W;

  let minX = FRAME_W, maxX = 0, minY = FRAME_H, maxY = 0;
  for (let y = 0; y < FRAME_H; y++) {
    for (let x = 0; x < FRAME_W; x++) {
      const idx = (y * newRoster.width + (frameStartX + x)) * 4;
      if (newRoster.data[idx + 3] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const charW = maxX - minX + 1;
  const charH = maxY - minY + 1;
  const targetH = 122; // Maximum zoom
  const scale = targetH / charH;
  const scaledW = Math.round(charW * scale);
  const scaledH = targetH;

  const dstTopY = Math.round((FRAME_H - scaledH) / 2);
  const dstLeftX = Math.round((FRAME_W - scaledW) / 2);

  for (let dy = 0; dy < scaledH; dy++) {
    const fy = dstTopY + dy;
    if (fy < 0 || fy >= FRAME_H) continue;

    for (let dx = 0; dx < scaledW; dx++) {
      const fx = dstLeftX + dx;
      if (fx < 0 || fx >= FRAME_W) continue;

      const srcY = minY + Math.min(charH - 1, Math.max(0, Math.floor(dy / scale)));
      const srcX = minX + Math.min(charW - 1, Math.max(0, Math.floor(dx / scale)));
      const srcIdx = (srcY * newRoster.width + (frameStartX + srcX)) * 4;
      const dstIdx = (fy * newAvatars.width + (frameStartX + fx)) * 4;

      if (newRoster.data[srcIdx + 3] > 20) {
        newAvatars.data[dstIdx] = newRoster.data[srcIdx];
        newAvatars.data[dstIdx + 1] = newRoster.data[srcIdx + 1];
        newAvatars.data[dstIdx + 2] = newRoster.data[srcIdx + 2];
        newAvatars.data[dstIdx + 3] = newRoster.data[srcIdx + 3];
      }
    }
  }
}

fs.writeFileSync('public/assets/hero-avatars.png', PNG.sync.write(newAvatars));
console.log('✅ Generated hero-avatars.png for 13 heroes (1664x128)!');

// 4. Update weapon-roster.png to include the 2 new weapons (13 slots, 256x144 each -> 3328x144)
const oldWeapons = PNG.sync.read(fs.readFileSync('public/assets/weapon-roster.png'));
const TOTAL_WEAPONS = 13;
const WEAPON_SLOT_W = 256;
const WEAPON_SLOT_H = 144;

const newWeapons = new PNG({ width: TOTAL_WEAPONS * WEAPON_SLOT_W, height: WEAPON_SLOT_H });

// Copy old 11 weapons
for (let y = 0; y < WEAPON_SLOT_H; y++) {
  for (let x = 0; x < 11 * WEAPON_SLOT_W; x++) {
    const srcIdx = (y * oldWeapons.width + x) * 4;
    const dstIdx = (y * newWeapons.width + x) * 4;
    for (let c = 0; c < 4; c++) {
      newWeapons.data[dstIdx + c] = oldWeapons.data[srcIdx + c];
    }
  }
}

// Place Weapon 11 (Carbina Tática / rifleRaw)
const rifleDstX = 11 * WEAPON_SLOT_W + Math.round((WEAPON_SLOT_W - rifleRaw.width) / 2);
const rifleDstY = Math.round((WEAPON_SLOT_H - rifleRaw.height) / 2);

for (let y = 0; y < rifleRaw.height; y++) {
  const fy = rifleDstY + y;
  for (let x = 0; x < rifleRaw.width; x++) {
    const fx = rifleDstX + x;
    const srcIdx = (y * rifleRaw.width + x) * 4;
    const dstIdx = (fy * newWeapons.width + fx) * 4;
    if (rifleRaw.data[srcIdx + 3] > 20) {
      for (let c = 0; c < 4; c++) newWeapons.data[dstIdx + c] = rifleRaw.data[srcIdx + c];
    }
  }
}

// Place Weapon 12 (Pistola Pesada / pistolRaw)
const pistolDstX = 12 * WEAPON_SLOT_W + Math.round((WEAPON_SLOT_W - pistolRaw.width) / 2);
const pistolDstY = Math.round((WEAPON_SLOT_H - pistolRaw.height) / 2);

for (let y = 0; y < pistolRaw.height; y++) {
  const fy = pistolDstY + y;
  for (let x = 0; x < pistolRaw.width; x++) {
    const fx = pistolDstX + x;
    const srcIdx = (y * pistolRaw.width + x) * 4;
    const dstIdx = (fy * newWeapons.width + fx) * 4;
    if (pistolRaw.data[srcIdx + 3] > 20) {
      for (let c = 0; c < 4; c++) newWeapons.data[dstIdx + c] = pistolRaw.data[srcIdx + c];
    }
  }
}

fs.writeFileSync('public/assets/weapon-roster.png', PNG.sync.write(newWeapons));
console.log('✅ Updated weapon-roster.png to 13 weapons (3328x144)!');
