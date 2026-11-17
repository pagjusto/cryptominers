// Módulo de Renderização de Caverna, Rochas com Veios e Bonecos de Cada Classe
import { 
  GRID_COLS, 
  GRID_ROWS, 
  TILE_SIZE 
} from '../data/minersData';
import { characterSpriteManager } from './characterSprites';
import {
  drawBombBot,
  drawViking,
  drawFrogNinja,
  drawWitch,
  drawVampire,
  drawGolem,
  drawPirate,
  drawCowboy,
  drawFairy,
  drawBallerina,
  drawSpiderman,
  drawBatman,
  drawExecutive
} from './characterRenderers';

// ============================================================================
// CANYON MINE MAP IMAGE MANAGER (O MAPA REAL DO CÂNION EM ALTA DEFINIÇÃO)
// ============================================================================
let canyonBgImg = null;
let canyonBgLoaded = false;

export function initCanyonMap(onLoaded) {
  if (canyonBgLoaded && canyonBgImg) {
    if (onLoaded) onLoaded();
    return;
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = `/canyon_mine_map.png?v=${Date.now()}`;
  img.onload = () => {
    canyonBgImg = img;
    canyonBgLoaded = true;
    if (onLoaded) onLoaded();
  };
  img.onerror = () => {
    console.error('Falha ao carregar /canyon_mine_map.png');
  };
}

// 1. Chão da Caverna Contínuo / Mapa Real do Cânion
export function drawContinuousCaveFloor(ctx, width, height, mine, now) {
  // Se for a Mina do Cânion Subterrâneo (ou quando a imagem do cânion estiver pronta)
  if (mine?.id === 'canyon' || (canyonBgLoaded && canyonBgImg && (!mine || mine.id === 'canyon'))) {
    if (canyonBgLoaded && canyonBgImg) {
      // 1. Renderiza o mapa completo do cânion plano em altíssima definição
      ctx.drawImage(canyonBgImg, 0, 0, width, height);

      // 2. Iluminação dinâmica sutil: pulsar suave das tochas na entrada da mina
      const torchFlicker = Math.sin(now * 0.008) * 0.08 + 0.92;

      // Brilho quente suave na entrada da mina em vigas de carvalho no topo
      const torchGlow = ctx.createRadialGradient(width * 0.50, height * 0.14, 10, width * 0.50, height * 0.14, 130);
      torchGlow.addColorStop(0, `rgba(251, 191, 36, ${0.16 * torchFlicker})`);
      torchGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = torchGlow;
      ctx.fillRect(0, 0, width, height);

      return;
    }
  }

  // Chão tradicional das outras minas (pedra, vulcão, etc.)
  ctx.fillStyle = mine?.bgFloor || '#1e293b';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = mine?.bgFloorAlt || '#0f172a';
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const px = c * TILE_SIZE;
      const py = r * TILE_SIZE;
      if ((c * 7 + r * 13) % 5 === 0) {
        ctx.beginPath();
        ctx.ellipse(px + 24, py + 24, 16, 10, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Trilho de mineração rústico
  const railY = 5 * TILE_SIZE + 24;
  for (let x = 0; x < width; x += 22) {
    ctx.fillStyle = '#3e2010';
    ctx.fillRect(x, railY - 12, 10, 24);
    ctx.fillStyle = '#1c0d06';
    ctx.fillRect(x + 1, railY - 11, 8, 2);
    ctx.fillStyle = '#78716c';
    ctx.fillRect(x + 2, railY - 8, 2, 2);
    ctx.fillRect(x + 2, railY + 6, 2, 2);
  }

  const steelGrad = ctx.createLinearGradient(0, railY - 7, 0, railY + 8);
  steelGrad.addColorStop(0, '#57534e');
  steelGrad.addColorStop(0.5, '#d6d3d1');
  steelGrad.addColorStop(1, '#292524');

  ctx.fillStyle = steelGrad;
  ctx.fillRect(0, railY - 8, width, 3);
  ctx.fillRect(0, railY + 5, width, 3);
}

// 2. A Rocha Vetorial com Veios
export function drawVectorCartoonRock(ctx, x, y, size, oreType, mine, hpRatio, now) {
  ctx.save();
  ctx.translate(x, y);

  const scale = size / 52;
  ctx.scale(scale, scale);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();
  ctx.ellipse(26, 47, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  let cTop = '#525761';
  let cMid = '#3b3f47';
  let cDark = '#25272d';
  let cDeep = '#181a1e';
  let cLine = '#0c0d0f';

  if (mine.id === 'emerald') {
    cTop = '#3f5249';
    cMid = '#283832';
    cDark = '#17241f';
  } else if (mine.id === 'volcano') {
    cTop = '#4e3d3d';
    cMid = '#382a2a';
    cDark = '#241717';
  } else if (mine.id === 'diamond') {
    cTop = '#414d57';
    cMid = '#2a353e';
    cDark = '#182026';
  }

  if (oreType === 'bedrock') {
    cTop = '#33373e';
    cMid = '#23252a';
    cDark = '#141518';
  }

  ctx.lineJoin = 'miter';
  ctx.miterLimit = 2;

  // Face frontal inferior
  ctx.fillStyle = cDeep;
  ctx.strokeStyle = cLine;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(6, 26);
  ctx.lineTo(4, 38);
  ctx.lineTo(16, 48);
  ctx.lineTo(25, 48);
  ctx.lineTo(29, 39);
  ctx.lineTo(40, 47);
  ctx.lineTo(46, 42);
  ctx.lineTo(50, 31);
  ctx.lineTo(44, 21);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Faceta esquerda
  ctx.fillStyle = cDark;
  ctx.beginPath();
  ctx.moveTo(6, 26);
  ctx.lineTo(16, 38);
  ctx.lineTo(25, 38);
  ctx.lineTo(25, 48);
  ctx.lineTo(16, 48);
  ctx.lineTo(4, 38);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Faceta direita
  ctx.fillStyle = cDark;
  ctx.beginPath();
  ctx.moveTo(29, 39);
  ctx.lineTo(40, 34);
  ctx.lineTo(46, 34);
  ctx.lineTo(46, 42);
  ctx.lineTo(40, 47);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Platô superior
  ctx.fillStyle = cMid;
  ctx.beginPath();
  ctx.moveTo(9, 27);
  ctx.lineTo(17, 21);
  ctx.lineTo(24, 23);
  ctx.lineTo(24, 15);
  ctx.lineTo(32, 18);
  ctx.lineTo(41, 23);
  ctx.lineTo(48, 22);
  ctx.lineTo(45, 32);
  ctx.lineTo(39, 34);
  ctx.lineTo(29, 39);
  ctx.lineTo(25, 38);
  ctx.lineTo(16, 38);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = cTop;
  ctx.beginPath();
  ctx.moveTo(10, 27);
  ctx.lineTo(17, 22);
  ctx.lineTo(23, 24);
  ctx.lineTo(23, 36);
  ctx.lineTo(16, 36);
  ctx.closePath();
  ctx.fill();

  // Pico superior
  ctx.fillStyle = cMid;
  ctx.beginPath();
  ctx.moveTo(17, 21);
  ctx.lineTo(17, 12);
  ctx.lineTo(25, 9);
  ctx.lineTo(25, 23);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = cTop;
  ctx.beginPath();
  ctx.moveTo(17, 12);
  ctx.lineTo(20, 8);
  ctx.lineTo(26, 8);
  ctx.lineTo(25, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = cDark;
  ctx.beginPath();
  ctx.moveTo(25, 9);
  ctx.lineTo(31, 14);
  ctx.lineTo(39, 16);
  ctx.lineTo(32, 18);
  ctx.lineTo(24, 15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = cTop;
  ctx.beginPath();
  ctx.moveTo(29, 18);
  ctx.lineTo(38, 17);
  ctx.lineTo(36, 21);
  ctx.lineTo(27, 20);
  ctx.closePath();
  ctx.fill();

  // Lascas
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillRect(8, 28, 2, 4);
  ctx.fillRect(11, 26, 2, 3);

  // Minérios nos veios
  if (oreType === 'gold') {
    // Veio de Ouro Vivo
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(12, 34);
    ctx.lineTo(24, 28);
    ctx.lineTo(34, 32);
    ctx.lineTo(44, 24);
    ctx.stroke();

    const nuggets = [{ x: 18, y: 31, r: 6 }, { x: 29, y: 26, r: 7.5 }, { x: 38, y: 28, r: 6.5 }];
    nuggets.forEach(n => {
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(n.x - 2, n.y - 2, 2, 2);
    });
  } else if (oreType === 'crystal') {
    // Cristais de Diamante Azul
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(26, 16);
    ctx.lineTo(34, 26);
    ctx.lineTo(26, 36);
    ctx.lineTo(18, 26);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(25, 20, 2, 4);
  } else if (oreType === 'emerald') {
    // Cristais de Esmeralda Verde
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(26, 16);
    ctx.lineTo(34, 26);
    ctx.lineTo(26, 36);
    ctx.lineTo(18, 26);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#6ee7b7';
    ctx.fillRect(25, 20, 2, 4);
  }

  // Barra de vida
  if (hpRatio < 1 && oreType !== 'bedrock') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.beginPath();
    ctx.roundRect(8, 48, 36, 4.5, 2);
    ctx.fill();

    ctx.fillStyle = hpRatio > 0.4 ? '#22c55e' : (hpRatio > 0.15 ? '#eab308' : '#ef4444');
    ctx.beginPath();
    ctx.roundRect(8, 48, 36 * hpRatio, 4.5, 2);
    ctx.fill();
  }

  ctx.restore();
}

// ----------------------------------------------------------------------------
// 3. BONECOS 2D DE ALTA DEFINIÇÃO (11 Classes com traço vetorial de cel-shading)
// ----------------------------------------------------------------------------
export function drawMinerCharacter(ctx, mx, my, miner, classInfo, now, swingProgress = 0, targetDir = 1) {
  ctx.save();

  const isWorking = miner.status === 'work';
  const isMining = miner.isMining;
  const bounceY = isWorking && !isMining ? Math.sin(now * 0.015) * 3 : 0;
  const legAngle = isWorking && !isMining ? Math.sin(now * 0.02) * 6 : 0;
  const swingAngle = isMining && swingProgress > 0 ? -Math.sin(swingProgress * Math.PI) * 1.35 : 0;

  ctx.translate(mx, my + bounceY);

  // Escala proporcional dos bonecos (reduzido conforme solicitado pelo usuário para dar respiro nas trilhas)
  const CHAR_SCALE = 0.62;
  ctx.scale(CHAR_SCALE, CHAR_SCALE);

  const cid = miner.classId || 'miner';

  // 1. Lanterna / Aura no Piso Específica por Classe
  const lightGrad = ctx.createRadialGradient(0, 8, 4, 0, 8, 44);
  switch (cid) {
    case 'miner':
      lightGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      lightGrad.addColorStop(0.5, 'rgba(2, 132, 199, 0.2)');
      break;
    case 'brute':
      lightGrad.addColorStop(0, 'rgba(249, 115, 22, 0.45)');
      lightGrad.addColorStop(0.5, 'rgba(180, 83, 9, 0.2)');
      break;
    case 'goblin':
      lightGrad.addColorStop(0, 'rgba(34, 197, 94, 0.45)');
      lightGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.2)');
      break;
    case 'engineer':
      lightGrad.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
      lightGrad.addColorStop(0.5, 'rgba(147, 51, 234, 0.2)');
      break;
    case 'mage':
      lightGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
      lightGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.3)');
      break;
    case 'legendary':
      lightGrad.addColorStop(0, 'rgba(251, 191, 36, 0.55)');
      lightGrad.addColorStop(0.5, 'rgba(234, 88, 12, 0.3)');
      break;
    case 'pirate':
      lightGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
      lightGrad.addColorStop(0.5, 'rgba(234, 179, 8, 0.2)');
      break;
    case 'cowboy':
      lightGrad.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
      lightGrad.addColorStop(0.5, 'rgba(180, 83, 9, 0.2)');
      break;
    case 'fairy':
    case 'ballerina':
      lightGrad.addColorStop(0, 'rgba(244, 114, 182, 0.65)');
      lightGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.35)');
      break;
    case 'spiderman':
      lightGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
      lightGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.25)');
      break;
    case 'batman':
      lightGrad.addColorStop(0, 'rgba(15, 23, 42, 0.75)');
      lightGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.2)');
      break;
    default:
      lightGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      lightGrad.addColorStop(0.5, 'rgba(2, 132, 199, 0.2)');
      break;
  }
  lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = lightGrad;
  ctx.beginPath();
  ctx.arc(0, 8, 44, 0, Math.PI * 2);
  ctx.fill();

  // 2. Sombra Suave no Piso
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();
  ctx.ellipse(0, 18, 17, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. Corpo e Equipamento do Personagem (com suporte a espelhamento de direção)
  ctx.save();
  if (targetDir < 0) {
    ctx.scale(-1, 1);
  }

  // Pernas e Botas Animadas
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = '#09090b';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const bootColors = {
    miner: '#0369a1',
    brute: '#78350f',
    goblin: '#14532d',
    engineer: '#3b0764',
    mage: '#18181b',
    legendary: '#1c1917',
    pirate: '#0f172a',
    cowboy: '#78350f',
    fairy: '#f472b6',
    ballerina: '#f472b6',
    spiderman: '#dc2626',
    batman: '#0f172a'
  };
  const bootColor = bootColors[cid] || '#0369a1';

  // Botas Animadas (puladas para personagens com sprites pixel-art dedicados)
  if (cid !== 'brute' && cid !== 'goblin' && cid !== 'engineer' && cid !== 'mage' && cid !== 'miner' && cid !== 'legendary' && cid !== 'pirate' && cid !== 'cowboy' && cid !== 'fairy' && cid !== 'ballerina' && cid !== 'batman' && cid !== 'executive' && cid !== 'spiderman') {
    // Bota Esquerda
    ctx.fillStyle = bootColor;
    ctx.beginPath();
    ctx.roundRect(-10 + legAngle, 12, 8, 8, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-10 + legAngle, 18, 8, 2);

    // Bota Direita
    ctx.fillStyle = bootColor;
    ctx.beginPath();
    ctx.roundRect(2 - legAngle, 12, 8, 8, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#09090b';
    ctx.fillRect(2 - legAngle, 18, 8, 2);
  }

  // Brilho mágico de pó de fada nos tornozelos
  if (cid === 'fairy' || cid === 'ballerina') {
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(-6 + legAngle, 16, 1.5, 0, Math.PI * 2);
    ctx.arc(6 - legAngle, 16, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Renderizador específico da classe com movimentos e armas dedicadas
  switch (cid) {
    case 'miner':
      drawBombBot(ctx, now, swingAngle, legAngle, swingProgress, isMining);
      break;
    case 'brute':
      drawViking(ctx, now, swingAngle, legAngle, swingProgress, isMining);
      break;
    case 'goblin':
      drawFrogNinja(ctx, now, swingAngle, legAngle, swingProgress, isMining);
      break;
    case 'engineer':
      drawWitch(ctx, now, swingAngle, legAngle, swingProgress, isMining);
      break;
    case 'mage':
      drawVampire(ctx, now, swingAngle, legAngle, swingProgress, isMining);
      break;
    case 'legendary':
      drawGolem(ctx, now, swingAngle, legAngle, swingProgress, isMining);
      break;
    case 'pirate':
      drawPirate(ctx, now, swingAngle, legAngle, swingProgress, isMining);
      break;
    case 'cowboy':
      drawCowboy(ctx, now, swingAngle, legAngle, swingProgress, isMining);
      break;
    case 'fairy':
    case 'ballerina':
      drawFairy(ctx, now, swingAngle, legAngle, swingProgress, isMining);
      break;
    case 'spiderman':
      drawSpiderman(ctx, now, swingAngle, legAngle, swingProgress, isMining);
      break;
    case 'executive':
    case 'batman':
      drawExecutive(ctx, now, swingAngle, legAngle, swingProgress, isMining);
      break;
    default:
      drawBombBot(ctx, now, swingAngle, legAngle, swingProgress, isMining);
      break;
  }

  ctx.restore(); // Fecha ctx.scale(-1, 1)

  // 4. Balão de Sono Zzz (não espelhado)
  if (miner.status === 'sleep') {
    const floatY = Math.sin(now * 0.005) * 3;
    ctx.font = 'bold 12px var(--font-arcade, monospace)';
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText('Zzz', 14, -22 + floatY);
    ctx.shadowColor = 'transparent';
  }

  // 5. Barra de Estamina Nítida com Contorno Escuro
  const barW = 32;
  const barH = 5;
  const pct = Math.max(0, miner.currentStamina / miner.maxStamina);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.beginPath();
  ctx.roundRect(-barW / 2 - 1, -34, barW + 2, barH + 2, 2.5);
  ctx.fill();

  ctx.fillStyle = pct > 0.4 ? '#22c55e' : (pct > 0.15 ? '#f59e0b' : '#ef4444');
  ctx.beginPath();
  ctx.roundRect(-barW / 2, -33, barW * pct, barH, 2);
  ctx.fill();

  // 6. Estrelas de Fusão do Herói (★) exibidas acima da barra
  const stars = miner.stars || 1;
  if (stars > 1) {
    ctx.font = 'bold 9px var(--font-arcade, monospace)';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 3;
    const starStr = '★'.repeat(stars);
    ctx.fillText(starStr, 0, -38);
    ctx.shadowColor = 'transparent';
  }

  ctx.restore();
}
