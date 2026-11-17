import fs from 'fs';

const filePath = 'C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/src/utils/characterRenderers.js';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Original content length:', content.length);

// 1. drawBombBot adjustments
// Change rw = 38; rh = 64; to rw = 36; rh = 56;
content = content.replace(
  /const rw = 38; \/\/ Largura do robô\s*\n\s*const rh = 64; \/\/ Altura do robô/,
  'const rw = 36; // Largura do robô padronizada\n    const rh = 56; // Altura do robô padronizada (56px unificado)'
);
content = content.replace(
  /ctx\.drawImage\(robotBombBotImg, -rw \/ 2, -rh \+ 4, rw, rh\);/g,
  'ctx.drawImage(robotBombBotImg, -rw / 2, -rh + 6, rw, rh);'
);
content = content.replace(
  /ctx\.arc\(-5\.5, -rh \+ 24, 3\.5, 0, Math\.PI \* 2\);/g,
  'ctx.arc(-5.0, -rh + 22, 3.2, 0, Math.PI * 2);'
);
content = content.replace(
  /ctx\.arc\(5\.5, -rh \+ 24, 3\.5, 0, Math\.PI \* 2\);/g,
  'ctx.arc(5.0, -rh + 22, 3.2, 0, Math.PI * 2);'
);
content = content.replace(
  /ctx\.arc\(-5\.5, -rh \+ 24, 3\.8, 0, Math\.PI \* 2\);/g,
  'ctx.arc(-5.0, -rh + 22, 3.2, 0, Math.PI * 2);'
);
content = content.replace(
  /ctx\.arc\(5\.5, -rh \+ 24, 3\.8, 0, Math\.PI \* 2\);/g,
  'ctx.arc(5.0, -rh + 22, 3.2, 0, Math.PI * 2);'
);

// 2. drawFrogNinja adjustments
// Change fw = 42; fh = 58; kw = 11; kh = 34; to fh = 56, kh = 32
content = content.replace(
  /const fw = 42;\s*\n\s*const fh = 58;\s*\n\s*const kw = 11;\s*\n\s*const kh = 34;/,
  'const fw = 42; // Largura padronizada\n    const fh = 56; // Altura unificada (56px)\n    const kw = 11;\n    const kh = 32;'
);
content = content.replace(
  /ctx\.drawImage\(frogShinobiImg, -fw \/ 2, -fh \+ 4, fw, fh\);/g,
  'ctx.drawImage(frogShinobiImg, -fw / 2, -fh + 6, fw, fh);'
);

// 3. drawWitch adjustments
// Change mw = 36; mh = 62; sw = 15; sh = 54; to mw = 34; mh = 56; sw = 14; sh = 48;
content = content.replace(
  /const mw = 36;\s*\n\s*const mh = 62;\s*\n\s*const sw = 15;\s*\n\s*const sh = 54;/,
  'const mw = 34; // Largura padronizada\n    const mh = 56; // Altura unificada (56px)\n    const sw = 14;\n    const sh = 48;'
);
content = content.replace(
  /ctx\.drawImage\(mageWizardImg, -mw \/ 2, -mh \+ 4, mw, mh\);/g,
  'ctx.drawImage(mageWizardImg, -mw / 2, -mh + 6, mw, mh);'
);

// 4. drawVampire adjustments
// Change vw = 40; vh = 64; sw = 28; sh = 72; to vw = 36; vh = 56; sw = 24; sh = 62;
content = content.replace(
  /const vw = 40;\s*\n\s*const vh = 64;\s*\n\s*const sw = 28;\s*\n\s*const sh = 72;/,
  'const vw = 36; // Largura padronizada\n    const vh = 56; // Altura unificada (56px)\n    const sw = 24;\n    const sh = 62;'
);
content = content.replace(
  /ctx\.drawImage\(vampireDraculaImg, -vw \/ 2, -vh \+ 4, vw, vh\);/g,
  'ctx.drawImage(vampireDraculaImg, -vw / 2, -vh + 6, vw, vh);'
);

// 5. drawClassicMiner adjustments
// Change mw = 42; mh = 58; pw = 44; ph = 44; to mh = 56, pw = 42, ph = 42
content = content.replace(
  /const mw = 42; \/\/ Largura do minerador\s*\n\s*const mh = 58; \/\/ Altura do minerador\s*\n\s*const pw = 44; \/\/ Largura da picareta\s*\n\s*const ph = 44; \/\/ Altura da picareta/,
  'const mw = 42; // Largura do minerador\n    const mh = 56; // Altura unificada (56px)\n    const pw = 42; // Largura da picareta\n    const ph = 42; // Altura da picareta'
);

// 6. drawExecutive adjustments
// Change cw = 38; ch = 58; to ch = 56; and -ch + 2 to -ch + 6
content = content.replace(
  /const cw = 38; \/\/ Largura do personagem de terno\s*\n\s*const ch = 58; \/\/ Altura do personagem/,
  'const cw = 38; // Largura do personagem de terno\n    const ch = 56; // Altura unificada (56px)'
);
content = content.replace(
  /ctx\.drawImage\(executiveCharImg, -cw \/ 2, -ch \+ 2, cw, ch\);/g,
  'ctx.drawImage(executiveCharImg, -cw / 2, -ch + 6, cw, ch);'
);

// 7. drawFairy adjustments
// Scale fairy from fw = 56, fh = 44 to fw = 80, fh = 62 (ratio 116/91)
// Wand from ww = 32, wh = 38 to ww = 40, wh = 48
content = content.replace(
  /const fw = 56; \/\/ Largura do sprite da fada \(com asas\)\s*\n\s*const fh = 44; \/\/ Altura do sprite da fada\s*\n\s*const ww = 32; \/\/ Largura da varinha estelar\s*\n\s*const wh = 38; \/\/ Altura da varinha estelar/,
  'const fw = 80; // Largura do sprite da fada (asas abertas padronizadas)\n    const fh = 62; // Altura unificada (corpo ~48px, altura total 62px com asas)\n    const ww = 40; // Largura proporcional da varinha\n    const wh = 48; // Altura da varinha estelar'
);
content = content.replace(
  /const hoverY = Math\.sin\(now \* 0\.006\) \* 4 - 6; \/\/ Flutua 6px acima do solo/,
  'const hoverY = Math.sin(now * 0.006) * 3 - 2; // Flutua suavemente 2px acima do solo'
);
content = content.replace(
  /ctx\.drawImage\(fairySpriteImg, -fw \/ 2, -fh, fw, fh\);/g,
  'ctx.drawImage(fairySpriteImg, -fw / 2, -fh + 4, fw, fh);'
);
content = content.replace(
  /const handX = 13;\s*\n\s*const handY = -14;/,
  'const handX = 18; // Mão direita alinhada na escala 80x62\n      const handY = -18;'
);

// In fairy mining section
content = content.replace(
  /let handX = 13;\s*\n\s*let handY = -14;/,
  'let handX = 18;\n    let handY = -18;'
);
content = content.replace(
  /handX = 13 \+ 2 \* p;\s*\n\s*handY = -14 - 4 \* p;/,
  'handX = 18 + 2 * p;\n      handY = -18 - 4 * p;'
);
content = content.replace(
  /handX = 14 \+ lungeX;\s*\n\s*handY = -14;/,
  'handX = 18 + lungeX;\n      handY = -18;'
);
content = content.replace(
  /handX = 14 \* \(1 - p\) \+ 13 \* p;\s*\n\s*handY = -14;/,
  'handX = 18;\n      handY = -18;'
);

// 8. drawSpiderman adjustments
// Wrap drawSpiderman inside scale(1.5, 1.5)
const spidermanStart = 'export function drawSpiderman(ctx, now, swingAngle, legAngle, swingProgress = 0, isMining = false) {';
if (content.includes(spidermanStart)) {
  content = content.replace(
    spidermanStart,
    `${spidermanStart}\n  ctx.save();\n  ctx.translate(0, 16);\n  ctx.scale(1.5, 1.5);\n  ctx.translate(0, -6);`
  );
  // Add ctx.restore() before closing brace of drawSpiderman
  // Find next export or end
  const idx = content.indexOf(spidermanStart);
  const nextExport = content.indexOf('export function drawExecutive', idx);
  if (nextExport !== -1) {
    const spidermanBody = content.substring(idx, nextExport);
    const lastBrace = spidermanBody.lastIndexOf('}');
    const modifiedBody = spidermanBody.substring(0, lastBrace) + '  ctx.restore();\n}\n\n';
    content = content.substring(0, idx) + modifiedBody + content.substring(nextExport);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated characterRenderers.js! New length:', content.length);
