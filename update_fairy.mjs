import fs from 'fs';

const filePath = 'C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/src/utils/characterRenderers.js';
const code = fs.readFileSync(filePath, 'utf8');

const startMarker = '// ----------------------------------------------------------------------------\r\n// 9. FADA ENCANTADA DAS ASAS DE CRISTAL (fairy)';
const startMarkerLF = '// ----------------------------------------------------------------------------\n// 9. FADA ENCANTADA DAS ASAS DE CRISTAL (fairy)';
const endMarker = 'export const drawBallerina = drawFairy;';

let startIndex = code.indexOf(startMarker);
if (startIndex === -1) {
  startIndex = code.indexOf(startMarkerLF);
}
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found!', { startIndex, endIndex });
  process.exit(1);
}

const replacement = `// ----------------------------------------------------------------------------
// 9. FADA ENCANTADA DAS ASAS DE CRISTAL (fairy) - Voo Mágico e Feixe Estelar Prismático
// Sprite recortado oficial: asas de cristal translúcidas, tiara de flores, vestido azul e
// a lendária Varinha Estelar de Ouro que canaliza rajadas de estrelas cadentes contra a rocha!
// ----------------------------------------------------------------------------
let fairySpriteImg = null;
let fairySpriteLoaded = false;
let fairyWandImg = null;
let fairyWandLoaded = false;

export function initFairy() {
  if (typeof window === 'undefined') return;
  if (!fairySpriteImg) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/fairy_sprite.png?v=' + Date.now();
    img.onload = () => {
      fairySpriteImg = img;
      fairySpriteLoaded = true;
    };
  }
  if (!fairyWandImg) {
    const wImg = new Image();
    wImg.crossOrigin = 'anonymous';
    wImg.src = '/fairy_wand.png?v=' + Date.now();
    wImg.onload = () => {
      fairyWandImg = wImg;
      fairyWandLoaded = true;
    };
  }
}

if (typeof window !== 'undefined') {
  initFairy();
}

// Auxiliar: Desenha uma estrela cintilante de 4 pontas
function drawSparkleStar4(ctx, cx, cy, r, color = '#ffffff') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx, cy, cx + r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + r);
  ctx.quadraticCurveTo(cx, cy, cx - r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - r);
  ctx.fill();
  ctx.restore();
}

// Auxiliar: Desenha uma estrela estelar de 8 pontas para impacto mágico
function drawStar8(ctx, cx, cy, outerR, innerR, color = '#fef08a') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  const points = 8;
  for (let i = 0; i < points * 2; i++) {
    const r = (i % 2 === 0) ? outerR : innerR;
    const a = (i * Math.PI) / points;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawFairy(ctx, now, swingAngle, legAngle, swingProgress = 0, isMining = false) {
  initFairy();

  if (fairySpriteLoaded && fairySpriteImg && fairyWandLoaded && fairyWandImg) {
    const fw = 56; // Largura do sprite da fada (com asas)
    const fh = 44; // Altura do sprite da fada
    const ww = 32; // Largura da varinha estelar
    const wh = 38; // Altura da varinha estelar
    const pivotX = ww * (29 / 351); // 2.64
    const pivotY = wh * (387 / 414); // 35.5

    // =========================================================================
    // 1. MODO REPOUSO & CAMINHADA (IDLE / HOVERING FLIGHT)
    // =========================================================================
    if (!isMining) {
      ctx.save();
      ctx.translate(0, 16); // Base do chão

      // Levitação suave contínua no ar (a fada nunca toca o chão pesadamente)
      const hoverY = Math.sin(now * 0.006) * 4 - 6; // Flutua 6px acima do solo
      const hoverSway = Math.sin(now * 0.005) * 0.04;
      const wingBreath = 1 + Math.sin(now * 0.018) * 0.03;

      // Sombra suave translúcida que pulsa com a altitude do voo
      const shadowScale = 1 - (hoverY + 6) * 0.04;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14 * shadowScale, 4.5 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(0, hoverY);
      ctx.rotate(hoverSway);
      ctx.scale(1, wingBreath);

      // Brilho místico ao redor da fadinha (Fairy Aura)
      ctx.shadowColor = 'rgba(244, 114, 182, 0.55)';
      ctx.shadowBlur = 10 + Math.sin(now * 0.008) * 4;

      // Desenha o sprite da Fadinha
      ctx.drawImage(fairySpriteImg, -fw / 2, -fh, fw, fh);

      // Partículas de purpurina dourada caindo dos pés (Stardust Drift)
      for (let i = 0; i < 3; i++) {
        const driftT = (now * 0.003 + i * 0.33) % 1;
        const driftX = Math.sin(now * 0.008 + i * 2) * 10;
        const driftY = -4 + driftT * 10;
        const driftAlpha = (1 - driftT) * 0.8;
        const starColor = i % 2 === 0 ? \`rgba(254, 240, 138, \${driftAlpha})\` : \`rgba(56, 189, 248, \${driftAlpha})\`;
        drawSparkleStar4(ctx, driftX, driftY, 2.2 * (1 - driftT), starColor);
      }

      // Varinha Estelar empunhada na mão direita
      ctx.save();
      const handX = 13;
      const handY = -14;
      const wandBob = Math.sin(now * 0.007) * 0.05;
      ctx.translate(handX, handY);
      ctx.rotate(0.12 + wandBob);

      // Brilho celestial da estrela no topo da varinha
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8 + Math.sin(now * 0.012) * 4;
      ctx.drawImage(fairyWandImg, -pivotX, -pivotY, ww, wh);

      // Pequena faísca cintilante pulsando no centro da estrela
      if (Math.sin(now * 0.015) > 0.4) {
        drawSparkleStar4(ctx, ww * (234 / 351) - pivotX, wh * (52 / 414) - pivotY, 3, '#ffffff');
      }

      ctx.restore(); // Fecha varinha
      ctx.restore(); // Fecha fadinha
      return;
    }

    // =========================================================================
    // 2. MODO ATAQUE: CANALIZAÇÃO ESTELAR & DISPARO DO FEIXE CÓSMICO (STARBURST)
    // =========================================================================
    ctx.save();
    ctx.translate(0, 16); // Pivot na base

    let lungeX = 0;
    let hoverY = -6;
    let bodyAngle = 0;
    let wandAngle = 0;
    let handX = 13;
    let handY = -14;
    let scaleX = 1;

    // FASE 1: ASCENSÃO E CARREGAMENTO DE ENERGIA CÓSMICA (0.00 a 0.22)
    if (swingProgress < 0.22) {
      const p = swingProgress / 0.22;
      hoverY = -6 - 8 * p; // Sobe no ar
      bodyAngle = -0.08 * p; // Inclina para trás canalizando
      lungeX = -2 * p;
      // Varinha erguida para o céu em ângulo cósmico
      wandAngle = -0.35 * p;
      handX = 13 + 2 * p;
      handY = -14 - 4 * p;
    }
    // FASE 2: DISPARO DO FEIXE ESTELAR PRISMÁTICO CONTRA A ROCHA (0.22 a 0.72)
    else if (swingProgress < 0.72) {
      const p = (swingProgress - 0.22) / 0.50;
      hoverY = -12 + Math.sin(p * Math.PI) * 2;
      lungeX = 4 + Math.sin(p * Math.PI) * 2;
      bodyAngle = 0.12; // Projeta tronco e asas para frente

      // Varinha apontada em linha reta para a rocha (+X):
      wandAngle = 1.021 + Math.sin(now * 0.08) * 0.02;
      handX = 14 + lungeX;
      handY = -14;
    }
    // FASE 3: PIRUETA CELESTIAL & POUSO GRACIOSO (0.72 a 1.00)
    else {
      const p = (swingProgress - 0.72) / 0.28;
      hoverY = -12 + 6 * p; // Desce de volta para altitude normal
      lungeX = 4 * (1 - p);
      bodyAngle = 0.12 * (1 - p);
      wandAngle = 1.021 * (1 - p);
      handX = 14 * (1 - p) + 13 * p;
      handY = -14;
      // Pirueta mágica de 360° no ar
      scaleX = Math.cos(p * Math.PI * 2);
    }

    // Sombra no solo com altitude dinâmica
    const shadowR = Math.max(8, 14 + hoverY * 0.3);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(lungeX, 0, shadowR, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Desenha corpo da Fadinha com transformações
    ctx.save();
    ctx.translate(lungeX, hoverY);
    ctx.rotate(bodyAngle);
    ctx.scale(scaleX, 1);

    // Brilho místico das asas batendo
    ctx.shadowColor = 'rgba(244, 114, 182, 0.7)';
    ctx.shadowBlur = (swingProgress >= 0.22 && swingProgress < 0.72) ? 18 : 10;
    ctx.drawImage(fairySpriteImg, -fw / 2, -fh, fw, fh);
    ctx.restore(); // Fecha fada

    // Desenha Varinha Estelar com orientação dinâmica
    ctx.save();
    ctx.translate(handX, handY + hoverY);
    ctx.rotate(wandAngle);
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = (swingProgress >= 0.22 && swingProgress < 0.72) ? 16 : 8;
    ctx.drawImage(fairyWandImg, -pivotX, -pivotY, ww, wh);
    ctx.restore(); // Fecha varinha

    // Mãozinha delicada segurando a empunhadura
    ctx.fillStyle = '#fed7aa';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(handX, handY + hoverY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // =========================================================================
    // EFEITOS DE DISPARO ESTELAR & EXPLOSÃO PRISMÁTICA NA ROCHA
    // =========================================================================
    const wandBaseAngle = -1.021;
    const wandLen = 35;
    const starTipX = handX + Math.cos(wandAngle + wandBaseAngle) * wandLen;
    const starTipY = handY + hoverY + Math.sin(wandAngle + wandBaseAngle) * wandLen;

    // 1. EFEITO DE CARREGAMENTO / VÓRTICE CÓSMICO (Fase 1: 0.08 a 0.22)
    if (swingProgress >= 0.08 && swingProgress < 0.22) {
      const chargeP = (swingProgress - 0.08) / 0.14;
      for (let s = 0; s < 5; s++) {
        const spiralA = now * 0.015 + (s * (Math.PI * 2 / 5));
        const spiralDist = (1 - chargeP) * 22 + 4;
        const sx = starTipX + Math.cos(spiralA) * spiralDist;
        const sy = starTipY + Math.sin(spiralA) * spiralDist;
        drawSparkleStar4(ctx, sx, sy, 2.5, s % 2 === 0 ? '#fef08a' : '#38bdf8');
      }
      ctx.fillStyle = 'rgba(254, 240, 138, 0.8)';
      ctx.beginPath();
      ctx.arc(starTipX, starTipY, 4 * chargeP, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. DISPARO DO FEIXE & IMPACTO NA ROCHA (Fase 2: 0.22 a 0.72)
    if (swingProgress >= 0.22 && swingProgress < 0.72) {
      const beamProgress = (swingProgress - 0.22) / 0.50;
      const impactX = handX + 78;
      const impactY = handY + hoverY;

      // A. FEIXE LASER ARCO-ÍRIS / PRISMÁTICO CENTRAL
      const beamGrad = ctx.createLinearGradient(starTipX, starTipY, impactX, impactY);
      beamGrad.addColorStop(0, '#ffffff');
      beamGrad.addColorStop(0.2, '#38bdf8');
      beamGrad.addColorStop(0.5, '#f472b6');
      beamGrad.addColorStop(0.8, '#fde047');
      beamGrad.addColorStop(1, '#ffffff');

      // Halo externo do feixe
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 9 + Math.sin(now * 0.06) * 3;
      ctx.beginPath();
      ctx.moveTo(starTipX, starTipY);
      ctx.lineTo(impactX, impactY);
      ctx.stroke();

      // Feixe médio colorido
      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = 4.5 + Math.sin(now * 0.08) * 1.5;
      ctx.beginPath();
      ctx.moveTo(starTipX, starTipY);
      ctx.lineTo(impactX, impactY);
      ctx.stroke();

      // Núcleo branco puro de alta energia
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(starTipX, starTipY);
      ctx.lineTo(impactX, impactY);
      ctx.stroke();

      // B. COMETAS / ESTRELAS CADENTES VIAJANDO PELO FEIXE
      for (let c = 0; c < 3; c++) {
        const cometT = (beamProgress * 3 + c * 0.35) % 1;
        const cometX = starTipX + (impactX - starTipX) * cometT;
        const cometY = starTipY + (impactY - starTipY) * cometT + Math.sin(cometT * Math.PI * 4) * 2;
        drawSparkleStar4(ctx, cometX, cometY, 3.5, c % 2 === 0 ? '#fef08a' : '#ffffff');
      }

      // C. EXPLOSÃO ESTELAR NO IMPACTO
      const starR = 9 + Math.sin(now * 0.05) * 3;
      drawStar8(ctx, impactX, impactY, starR, starR * 0.45, '#fef08a');
      drawStar8(ctx, impactX, impactY, starR * 0.6, starR * 0.25, '#ffffff');

      // Anel de choque mágico
      const ringR = 6 + (Math.sin(beamProgress * Math.PI * 18) + 1) * 6;
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.75)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(impactX, impactY, ringR, 0, Math.PI * 2);
      ctx.stroke();

      // Spray de poeira estelar cintilante
      for (let s = 0; s < 7; s++) {
        const sparkA = Math.PI - 0.9 + (s * 0.3) + Math.sin(now * 0.04 + s) * 0.2;
        const sparkDist = 8 + ((now * 0.07 + s * 6) % 24);
        const sx = impactX + Math.cos(sparkA) * sparkDist;
        const sy = impactY + Math.sin(sparkA) * sparkDist * 0.8;
        const sparkColor = s % 3 === 0 ? '#fef08a' : (s % 3 === 1 ? '#38bdf8' : '#f472b6');
        drawSparkleStar4(ctx, sx, sy, 2.4, sparkColor);
      }

      // Fragmentos de cristais mágicos
      for (let f = 0; f < 4; f++) {
        const fragA = Math.PI - 0.7 + (f * 0.45);
        const fragDist = 10 + ((now * 0.05 + f * 7) % 22);
        const fx = impactX + Math.cos(fragA) * fragDist;
        const fy = impactY + Math.sin(fragA) * fragDist * 0.8;
        ctx.fillStyle = f % 2 === 0 ? '#a5f3fc' : '#fbcfe8';
        ctx.fillRect(fx - 1.5, fy - 1.5, 3, 3);
      }

      // Fissuras luminosas de magia
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(impactX, impactY);
      ctx.lineTo(impactX + 8, impactY - 6);
      ctx.lineTo(impactX + 15, impactY - 10);
      ctx.moveTo(impactX, impactY);
      ctx.lineTo(impactX + 10, impactY + 6);
      ctx.lineTo(impactX + 16, impactY + 10);
      ctx.stroke();

      // D. FLOATING DAMAGE TEXT
      const floatY = impactY - 20 - (Math.sin(beamProgress * Math.PI) * 8);
      ctx.save();
      ctx.font = '900 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#db2777';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#09090b';
      ctx.fillText('✨ PÓ DE ESTRELAS! -46', impactX + 2, floatY + 1);
      ctx.fillStyle = '#fef08a';
      ctx.fillText('✨ PÓ DE ESTRELAS! -46', impactX + 2, floatY);
      ctx.restore();
    }

    // 3. CHUVA DE PURPURINA NA PIRUETA (Fase 3: 0.72 a 1.00)
    if (swingProgress >= 0.72) {
      for (let g = 0; g < 5; g++) {
        const glitterT = (now * 0.005 + g * 0.2) % 1;
        const gx = lungeX + Math.sin(now * 0.01 + g * 2) * 16;
        const gy = hoverY - 10 + glitterT * 26;
        drawSparkleStar4(ctx, gx, gy, 2 * (1 - glitterT), '#fef08a');
      }
    }

    ctx.restore(); // Fecha translate geral
    return;
  }

  // Fallback caso as imagens ainda não tenham finalizado o carregamento
  applyOutline(ctx);
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

`;

const newCode = code.slice(0, startIndex) + replacement + code.slice(endIndex);
fs.writeFileSync(filePath, newCode, 'utf8');
console.log('Successfully updated characterRenderers.js with new drawFairy!');
