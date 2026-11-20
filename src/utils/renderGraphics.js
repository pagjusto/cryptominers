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
  drawExecutive,
  drawRosterHero
} from './characterRenderers';
import { HERO_ROSTER, WEAPON_CATALOG, getHeroById, getWeaponById, getRarityConfig } from '../data/heroRoster';

// ============================================================================
// CITY SURVIVAL MAP & CANYON MAP IMAGE MANAGERS
// ============================================================================
let cityBgImg = null;
let cityBgLoaded = false;
let billboardImg = null;
let billboardLoaded = false;
let canyonBgImg = null;
let canyonBgLoaded = false;
let userFogImg = null;
let userFogLoaded = false;

export function initUserFog(onLoaded) {
  if (userFogLoaded && userFogImg) {
    if (onLoaded) onLoaded();
    return;
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = '/user_fog.avif';
  img.onload = () => {
    userFogImg = img;
    userFogLoaded = true;
    if (onLoaded) onLoaded();
  };
  img.onerror = () => {
    console.warn('user_fog.avif não carregado, usando névoa procedural');
  };
}

export function initBillboard(onLoaded) {
  if (billboardLoaded && billboardImg) {
    if (onLoaded) onLoaded();
    return;
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = `/assets/billboard.png?v=1`;
  img.onload = () => {
    billboardImg = img;
    billboardLoaded = true;
    if (onLoaded) onLoaded();
  };
  img.onerror = () => {
    console.error('Falha ao carregar /assets/billboard.png');
  };
}

let sirenTowerImg = null;
let sirenTowerLoaded = false;
let sirenTowerShadowCanvas = null;
let sirenTowerShadedCanvas = null;

export function initSirenTower(onLoaded) {
  if (sirenTowerLoaded && sirenTowerImg) {
    if (onLoaded) onLoaded();
    return;
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = '/structures/siren_tower.png';
  img.onload = () => {
    sirenTowerImg = img;
    sirenTowerLoaded = true;

    const w = img.naturalWidth || 158;
    const h = img.naturalHeight || 371;

    // 1. Pré-renderiza a silhueta da torre inteira para a sombra projetada no solo
    try {
      const sCanvas = document.createElement('canvas');
      sCanvas.width = w;
      sCanvas.height = h;
      const sCtx = sCanvas.getContext('2d');
      if (sCtx) {
        sCtx.drawImage(img, 0, 0);
        sCtx.globalCompositeOperation = 'source-in';
        sCtx.fillStyle = 'rgba(6, 20, 8, 0.68)';
        sCtx.fillRect(0, 0, w, h);
        sirenTowerShadowCanvas = sCanvas;
      }
    } catch (e) {}

    // 2. Pré-renderiza a torre com iluminação volumétrica própria (Sol no Noroeste, sombra no Sudeste/face direita)
    try {
      const shCanvas = document.createElement('canvas');
      shCanvas.width = w;
      shCanvas.height = h;
      const shCtx = shCanvas.getContext('2d');
      if (shCtx) {
        shCtx.drawImage(img, 0, 0);
        shCtx.globalCompositeOperation = 'source-atop'; // Aplica iluminação estritamente nos pixels da torre
        const grad = shCtx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.12)'); // Face noroeste/esquerda iluminada pelo sol
        grad.addColorStop(0.35, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.70, 'rgba(0, 10, 0, 0.14)');
        grad.addColorStop(1.0, 'rgba(0, 15, 0, 0.32)'); // Face sudeste/direita sombreada
        shCtx.fillStyle = grad;
        shCtx.fillRect(0, 0, w, h);
        sirenTowerShadedCanvas = shCanvas;
      }
    } catch (e) {}

    if (onLoaded) onLoaded();
  };
  img.onerror = () => {
    console.error('Falha ao carregar /structures/siren_tower.png');
  };
}

export function initCityMap(onLoaded) {
  initBillboard();
  initUserFog();
  initSirenTower();
  if (cityBgLoaded && cityBgImg) {
    if (onLoaded) onLoaded();
    return;
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = `/city_map.webp?v=1`;
  img.onload = () => {
    cityBgImg = img;
    cityBgLoaded = true;
    if (onLoaded) onLoaded();
  };
  img.onerror = () => {
    console.error('Falha ao carregar /city_map.webp');
    initCanyonMap(onLoaded);
  };
}

export function initCanyonMap(onLoaded) {
  if (canyonBgLoaded && canyonBgImg) {
    if (onLoaded) onLoaded();
    return;
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = `/canyon_mine_map.png?v=1`;
  img.onload = () => {
    canyonBgImg = img;
    canyonBgLoaded = true;
    if (onLoaded) onLoaded();
  };
  img.onerror = () => {
    console.error('Falha ao carregar /canyon_mine_map.png');
  };
}

// 1. Chão do Mapa: Cidade de Sobrevivência Zumbi em Alta Definição
export function drawContinuousCaveFloor(ctx, width, height, mine, now, isBossAlive = false) {
  if (!cityBgImg && typeof window !== 'undefined') {
    initCityMap();
  }

  // 1. Prioridade Oficial: Mapa da Cidade de Sobrevivência Zumbi
  if (cityBgLoaded && cityBgImg) {
    ctx.drawImage(cityBgImg, 0, 0, width, height);

    // 1.1 OUTDOOR / BILLBOARD VETORIZADO "CRYPTOZOMBIES" (Versão exata que ficou perfeita: 180x101, frontal/lateral no gramado)
    if (!billboardImg && typeof window !== 'undefined') {
      initBillboard();
    }
    if (billboardLoaded && billboardImg) {
      // Dimensões do outdoor aumentadas conforme solicitação (~20% maior: 216x122)
      const bW = 216;
      const bH = 122;
      // Posicionado no gramado norte (Cols 7 e 8, Rows 0 e 1)
      const bX = 512;
      const bY = 32;

      // Sombras realistas de contato e projeção solar no gramado (Sol vindo do noroeste)
      ctx.save();
      
      // 1. Sombra suave e difusa projetada pelo painel no gramado (diagonal para sudeste)
      ctx.fillStyle = 'rgba(5, 20, 5, 0.40)';
      ctx.beginPath();
      ctx.ellipse(bX + bW * 0.58, bY + bH * 0.93, bW * 0.46, 17, 0.10, 0, Math.PI * 2);
      ctx.fill();

      // 2. Sombra de oclusão de ambiente sob a base da estrutura
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(bX + bW * 0.50, bY + bH * 0.88, bW * 0.42, 20, 0.05, 0, Math.PI * 2);
      ctx.fill();

      // 3. Sombra profunda de contato no pé esquerdo (apoio traseiro no gramado)
      const leftFootX = bX + bW * 0.28;
      const leftFootY = bY + bH * 0.89;
      ctx.fillStyle = 'rgba(0, 10, 0, 0.85)';
      ctx.beginPath();
      ctx.ellipse(leftFootX, leftFootY, 13, 5.2, 0.12, 0, Math.PI * 2);
      ctx.fill();

      // 4. Sombra profunda de contato no pé direito (apoio frontal no gramado)
      const rightFootX = bX + bW * 0.72;
      const rightFootY = bY + bH * 0.98;
      ctx.fillStyle = 'rgba(0, 10, 0, 0.88)';
      ctx.beginPath();
      ctx.ellipse(rightFootX, rightFootY, 15, 6.2, 0.12, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Renderiza o outdoor vetorizado com proporções perfeitas e alta nitidez
      ctx.drawImage(billboardImg, bX, bY, bW, bH);
    }

    // 1.2 TORRE DE VIGIA E ALARME DE SIRENE ("exatamente nesse local coloque essa torre , sem que ela fique sobre o muro")
    drawSirenTower(ctx, now, isBossAlive);

    // Efeito suave de luz solar e calor na cidade
    const sunPulse = Math.sin((now || 0) * 0.002) * 0.03 + 0.97;
    const sunGlow = ctx.createRadialGradient(width * 0.5, height * 0.3, 80, width * 0.5, height * 0.3, width * 0.85);
    sunGlow.addColorStop(0, `rgba(255, 255, 230, ${0.05 * sunPulse})`);
    sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  // 2. Fallback enquanto a imagem carrega
  if (canyonBgLoaded && canyonBgImg) {
    ctx.drawImage(canyonBgImg, 0, 0, width, height);
    return;
  }

  // 3. Fallback gradiente de cor verde/terra
  ctx.fillStyle = mine?.bgFloor || '#4d6836';
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
export function drawMinerCharacter(ctx, mx, my, miner, classInfo, now, swingProgress = 0, targetDir = 1, minerIndex = 0) {
  ctx.save();

  const isWorking = miner.status === 'work';
  const isMining = miner.isMining;
  const bounceY = 0;
  const legAngle = isWorking && !isMining ? Math.sin(now * 0.02) * 5 : 0;
  const swingAngle = isMining && swingProgress > 0 ? -Math.sin(swingProgress * Math.PI) * 1.35 : 0;

  // Escala dos heróis aumentada suavemente (~15%) conforme solicitação
  const CHAR_SCALE = 1.15;

  const cid = miner.classId || 'miner';

  // Resolução do herói oficial do HERO_ROSTER e sua arma do WEAPON_CATALOG
  const rosterHero = (miner.heroId && getHeroById(miner.heroId)) 
    || HERO_ROSTER.find(h => h.classId === cid || h.id === cid)
    || HERO_ROSTER[minerIndex % HERO_ROSTER.length];
  const rosterWeapon = (miner.weaponId && getWeaponById(miner.weaponId))
    || (rosterHero && getWeaponById(rosterHero.weaponId))
    || WEAPON_CATALOG[rosterHero?.spriteIndex % WEAPON_CATALOG.length];
  const rarityConfig = getRarityConfig(rosterHero?.rarity || miner.rarity);

  // 1. Sombra Suave e Realista de Contato no Piso + Aura de Raridade
  ctx.save();
  ctx.translate(mx, my);
  ctx.scale(CHAR_SCALE, CHAR_SCALE);

  // Sombra sob os pés
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 14, 11, 3.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Aura Radiante Oficial da Raridade no Solo e no Tronco (apenas para heróis com raridade colorida)
  if (rarityConfig.hasBorderColor !== false && rarityConfig.auraColor && rarityConfig.auraColor !== 'transparent') {
    const pulse = 0.88 + Math.sin(now * 0.005 + minerIndex * 1.3) * 0.12;
    const auraColor = rarityConfig.color;

    // Halo no piso sob os pés do herói
    const groundGrad = ctx.createRadialGradient(0, 13, 2, 0, 13, 19 * pulse);
    groundGrad.addColorStop(0, rarityConfig.auraColor || `${auraColor}88`);
    groundGrad.addColorStop(0.5, `${auraColor}40`);
    groundGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = groundGrad;
    ctx.beginPath();
    ctx.ellipse(0, 13, 19 * pulse, 7.5 * pulse, 0, 0, Math.PI * 2);
    ctx.fill();

    // Anel sutil de energia cintilante no chão
    ctx.strokeStyle = auraColor;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.45 * pulse;
    ctx.beginPath();
    ctx.ellipse(0, 13, 15 * pulse, 5.8 * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Halo esférico ambiente ao redor do corpo
    ctx.globalAlpha = 1.0;
    const bodyGrad = ctx.createRadialGradient(0, -2, 3, 0, -2, 22 * pulse);
    bodyGrad.addColorStop(0, `${auraColor}38`);
    bodyGrad.addColorStop(0.6, `${auraColor}15`);
    bodyGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0, -2, 22 * pulse, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  ctx.translate(mx, my + bounceY);
  ctx.scale(CHAR_SCALE, CHAR_SCALE);

  // 2. Corpo e Equipamento do Personagem (com suporte a espelhamento de direção)
  ctx.save();
  if (targetDir < 0) {
    ctx.scale(-1, 1);
  }

  // Se o herói for do HERO_ROSTER, renderiza com seu sprite e arma dedicada (animação de tiro estilo Pirata)
  if (rosterHero) {
    drawRosterHero(ctx, rosterHero, rosterWeapon, now, swingAngle, legAngle, swingProgress, isMining);
  } else {
    // Fallback legado
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
  const barW = 30;
  const barH = 4.5;
  const pct = Math.max(0, miner.currentStamina / miner.maxStamina);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.beginPath();
  ctx.roundRect(-barW / 2 - 1, -29, barW + 2, barH + 2, 2.5);
  ctx.fill();

  ctx.fillStyle = pct > 0.4 ? '#22c55e' : (pct > 0.15 ? '#f59e0b' : '#ef4444');
  ctx.beginPath();
  ctx.roundRect(-barW / 2, -28, barW * pct, barH, 2);
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
    ctx.fillText(starStr, 0, -33);
    ctx.shadowColor = 'transparent';
  }

  ctx.restore();
}

/**
 * Renderiza uma suave e elegante névoa verde rasteira sobre o mapa enquanto o Boss estiver vivo.
 * Ondulações contínuas de margem a margem, sem cortes, sem costuras e sem formas geométricas duras.
 * Dissipa-se naturalmente quando o Boss é derrotado.
 */
export function drawBossGreenFog(ctx, width, height, opacity, now, bossEnemy) {
  if (!opacity || opacity <= 0.005) return;

  ctx.save();
  const baseAlpha = Math.min(1, Math.max(0, opacity));

  // 1. Tonalidade atmosférica ambiente suave em verde biológico/tóxico
  const ambientGrad = ctx.createLinearGradient(0, 0, 0, height);
  ambientGrad.addColorStop(0, 'rgba(16, 185, 129, 0.06)');
  ambientGrad.addColorStop(0.40, 'rgba(34, 197, 94, 0.08)');
  ambientGrad.addColorStop(0.75, 'rgba(21, 128, 61, 0.12)');
  ambientGrad.addColorStop(1, 'rgba(74, 222, 128, 0.18)'); // Base rasteira suavemente iluminada
  ctx.fillStyle = ambientGrad;
  ctx.globalAlpha = baseAlpha;
  ctx.fillRect(0, 0, width, height);

  // 2. Lençóis contínuos de névoa rasteira ondulando pelo chão (de margem a margem, sem cortes)
  const time = now * 0.0006;
  const layers = [
    { yRatio: 0.50, hRatio: 0.35, speed: 1.0, colorMid: 'rgba(74, 222, 128, 0.12)', colorBase: 'rgba(34, 197, 94, 0.16)' },
    { yRatio: 0.65, hRatio: 0.30, speed: -0.7, colorMid: 'rgba(34, 197, 94, 0.14)', colorBase: 'rgba(21, 128, 61, 0.18)' },
    { yRatio: 0.78, hRatio: 0.22, speed: 1.3, colorMid: 'rgba(132, 204, 22, 0.15)', colorBase: 'rgba(74, 222, 128, 0.20)' }
  ];

  layers.forEach((layer, lIdx) => {
    ctx.save();
    const yStart = height * layer.yRatio;
    const bandHeight = height * layer.hRatio;
    const waveOffset = time * layer.speed + lIdx * 2.0;

    ctx.beginPath();
    ctx.moveTo(0, yStart);

    // Linha de crista sinuosa e suave
    const step = 40;
    for (let x = 0; x <= width + step; x += step) {
      const waveY = yStart + Math.sin(x * 0.006 + waveOffset) * 14 + Math.cos(x * 0.012 - waveOffset * 0.8) * 8;
      ctx.lineTo(x, waveY);
    }

    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    // Gradiente vertical que dissolve a crista para transparente sem nenhuma borda reta
    const bandGrad = ctx.createLinearGradient(0, yStart - 10, 0, yStart + bandHeight);
    bandGrad.addColorStop(0, 'rgba(74, 222, 128, 0)');
    bandGrad.addColorStop(0.35, layer.colorMid);
    bandGrad.addColorStop(1, layer.colorBase);

    ctx.fillStyle = bandGrad;
    ctx.globalAlpha = baseAlpha * 0.85;
    ctx.fill();
    ctx.restore();
  });

  // 3. Vinheta periférica suave para fechar a atmosfera
  ctx.save();
  const edgeVignette = ctx.createRadialGradient(
    width / 2, height / 2, width * 0.38,
    width / 2, height / 2, width * 0.72
  );
  edgeVignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  edgeVignette.addColorStop(0.70, 'rgba(22, 101, 52, 0.08)');
  edgeVignette.addColorStop(1, 'rgba(2, 44, 18, 0.22)');
  ctx.fillStyle = edgeVignette;
  ctx.globalAlpha = baseAlpha;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  ctx.restore();
}

/**
 * Renderiza a Torre de Vigia e Alarme de Sirene no local exato demarcado pelo usuário.
 * 
 * Regras Oficiais do Usuário:
 * 1. "exatamente nesse local coloque essa torre , sem que ela fique sobre o muro"
 *    -> Posicionada no gramado oeste: tX = 138, tY = 218, tW = 84, tH = 120 (proporção 303x432).
 *    -> Não encosta nem sobrepõe a cerca de arame (que começa em X=226) nem o gerador de água à esquerda.
 * 2. "essa tore tocara uma sirene e a luz ficara girando em vermelho toda vez q o boss aparecer"
 *    -> Quando o Boss estiver ativo (isBossAlive), a cúpula do topo emite feixe giratório 360° em vermelho vibrante,
 *       com pulso de alerta no solo e efeito estroboscópico/lens flare.
 *    -> Em repouso (Boss inativo), a luz fica apagada/sutil.
 * 3. "adicione sombra tambem sem que pareça estar voando"
 *    -> Sombra direcional suave no solo projetada para sudeste (alinhada à iluminação solar da cidade).
 *    -> Sombras de oclusão profunda sob a base.
 *    -> 4 sombras de contato direto desenhadas sob cada um dos 4 apoios metálicos para fixação perfeita no solo.
 */
export function drawSirenTower(ctx, now, isBossAlive = false) {
  if (!sirenTowerImg && typeof window !== 'undefined') {
    initSirenTower();
  }
  if (!sirenTowerLoaded || !sirenTowerImg) return;

  // Imagem recortada proporcional (158x371, proporção 0.42587)
  const tW = 62;
  const tH = 144;
  const tX = 149;
  const tY = 196; // tY fixado para tH = 144

  // Coordenadas físicas exatas da base de cada uma das sapatas metálicas da torre (medidas no sprite 158x371)
  const footLeftX = tX + tW * (20 / 158);       // ~156.8
  const footLeftY = tY + tH * (358 / 371);      // ~335.0
  const footCenterX = tX + tW * (73 / 158);     // ~177.6
  const footCenterY = tY + tH * (370 / 371);    // ~339.6
  const footRightX = tX + tW * (136 / 158);     // ~202.4
  const footRightY = tY + tH * (360 / 371);     // ~335.7
  const footBackX = tX + tW * (92 / 158);       // ~185.1
  const footBackY = tY + tH * (336 / 371);      // ~326.3

  // 1. Sombras realistas da torre (corpo projetado no gramado + oclusão de contato nas 4 sapatas)
  ctx.save();
  
  // 1.0. SOMBRA DIRECIONAL COMPLETA DA ESTRUTURA DA TORRE NO SOLO (Giro de ~190° para o outro lado, projetando para Sudeste/Leste)
  if (sirenTowerShadowCanvas) {
    ctx.save();
    // Ponto de fixação no pé central da torre
    ctx.translate(footCenterX, footCenterY);
    // Cisalhamento e achatamento isométrico projetando para Sudeste (190° em relação ao Noroeste):
    // c = -0.75 (projeta a sombra para a direita/leste à medida que desce/afasta)
    // d = -0.26 (projeta a sombra para a frente/sudeste na perspectiva isométrica)
    ctx.transform(1.0, 0.0, -0.75, -0.26, 0, 0);
    ctx.drawImage(sirenTowerShadowCanvas, -tW * (73 / 158), -tH, tW, tH);
    ctx.restore();
  } else {
    // Fallback: projeção trapezoidal translúcida no solo para Sudeste
    ctx.save();
    ctx.fillStyle = 'rgba(6, 20, 8, 0.55)';
    ctx.beginPath();
    ctx.moveTo(footLeftX, footLeftY);
    ctx.lineTo(footRightX, footRightY);
    const topProjX = footCenterX + tH * 0.75;
    const topProjY = footCenterY + tH * 0.26;
    ctx.lineTo(topProjX + 16, topProjY + 5);
    ctx.lineTo(topProjX - 16, topProjY - 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 1.1. Sombra suave difusa conectando a base da estrutura (deslocada suavemente para sudeste)
  ctx.fillStyle = 'rgba(6, 20, 8, 0.45)';
  ctx.beginPath();
  ctx.ellipse(tX + tW * 0.52, tY + tH * 0.955, tW * 0.46, 6.5, 0.08, 0, Math.PI * 2);
  ctx.fill();

  // 1.2. Oclusão de ambiente escura no solo sob a base da estrutura
  ctx.fillStyle = 'rgba(0, 10, 0, 0.58)';
  ctx.beginPath();
  ctx.ellipse(tX + tW * 0.50, tY + tH * 0.950, tW * 0.36, 5.0, 0.05, 0, Math.PI * 2);
  ctx.fill();

  // 1.3. Sombras de oclusão de contato direto sob as 4 sapatas (ancoragem física precisa e aprumada)
  ctx.fillStyle = 'rgba(0, 8, 0, 0.94)';

  // Sapata traseira
  ctx.beginPath();
  ctx.ellipse(footBackX, footBackY + 0.5, 6.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sapata frontal esquerda
  ctx.beginPath();
  ctx.ellipse(footLeftX, footLeftY + 0.5, 8.0, 3.0, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sapata frontal direita
  ctx.beginPath();
  ctx.ellipse(footRightX, footRightY + 0.5, 8.5, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sapata frontal centro (pivô principal)
  ctx.beginPath();
  ctx.ellipse(footCenterX, footCenterY + 0.5, 9.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 2. Desenho da Torre em Alta Resolução aprumada perfeitamente na vertical
  // REGRA OFICIAL DO USUÁRIO: "a nossa torre parece q esta pendida para traz ,corrija"
  // Corrigido: Torre 100% vertical e aprumada, sem inclinação/cisalhamento artificial para trás
  const towerDrawable = sirenTowerShadedCanvas || sirenTowerImg;
  ctx.drawImage(towerDrawable, tX, tY, tW, tH);

  // 2.1. Oclusão de contato na quina frontal da sapata central para perfeita ancoragem no solo
  ctx.save();
  ctx.fillStyle = 'rgba(0, 10, 0, 0.65)';
  ctx.beginPath();
  ctx.ellipse(footCenterX, footCenterY, 7.5, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Efeito da Sirene e Luz Giratória Vermelha no Topo da Torre
  // Posição exata do bulbo vermelho da sirene centralizado no topo da cabine:
  const beaconX = tX + tW * 0.50;
  const beaconY = tY + tH * 0.040;

  if (isBossAlive) {
    ctx.save();
    const rotSpeed = 0.0055;
    const sirenAngle = (now * rotSpeed) % (Math.PI * 2);

    // REGRA OFICIAL DO USUÁRIO: "a luz deve girar em sentido horizontal tipo helice de helicoptero e nao parecendo um relogio"
    // e "dois feches de luz do mesmo tamanh dos dois lados"
    const beamLength = 170;
    const beamSpread = 0.34; // ~19 graus de abertura do feixe

    // Função para desenhar feixes de luz que giram no plano horizontal isométrico (como hélice de helicóptero):
    const drawHelicopterBeam = (angle, len, alpha) => {
      ctx.save();
      ctx.translate(beaconX, beaconY);
      // Plano horizontal 2.5D perfeitamente nivelado:
      // scale Y (0.28) achata a rotação no plano horizontal do topo da torre como hélice de helicóptero
      ctx.transform(1.0, 0.0, 0.0, 0.28, 0, 0);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, len, angle - beamSpread, angle + beamSpread);
      ctx.closePath();

      const beamGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, len);
      beamGrad.addColorStop(0, `rgba(255, 80, 80, ${alpha * 0.95})`);
      beamGrad.addColorStop(0.35, `rgba(239, 68, 68, ${alpha * 0.65})`);
      beamGrad.addColorStop(0.80, `rgba(220, 38, 38, ${alpha * 0.20})`);
      beamGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fill();

      // Feixe central laser luminoso dando corpo de hélice incandescente
      ctx.strokeStyle = `rgba(255, 220, 220, ${alpha * 0.70})`;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * len * 0.88, Math.sin(angle) * len * 0.88);
      ctx.stroke();

      ctx.restore();
    };

    // Feixes gêmeos 100% idênticos girando em sentido horizontal como hélice de helicóptero (opostos a 180° / Math.PI)
    drawHelicopterBeam(sirenAngle, beamLength, 0.85);
    drawHelicopterBeam(sirenAngle + Math.PI, beamLength, 0.85);

    // 3.3. Cúpula da Sirene com Brilho Incandescente
    const pulse = 1.0 + Math.sin(now * 0.015) * 0.15;
    const beaconGlow = ctx.createRadialGradient(beaconX, beaconY, 1, beaconX, beaconY, 16 * pulse);
    beaconGlow.addColorStop(0, '#ffffff');
    beaconGlow.addColorStop(0.30, '#ff4444');
    beaconGlow.addColorStop(0.70, 'rgba(239, 68, 68, 0.85)');
    beaconGlow.addColorStop(1, 'rgba(220, 38, 38, 0)');
    ctx.fillStyle = beaconGlow;
    ctx.beginPath();
    ctx.arc(beaconX, beaconY, 16 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // 3.4. Lens Flare / Flash quando qualquer uma das pás/feixes passa apontando para frente (câmera)
    const bladeFacingCamera = Math.sin(sirenAngle);
    const facingIntensity = Math.max(0, Math.abs(bladeFacingCamera) - 0.72) / 0.28;
    if (facingIntensity > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${facingIntensity * 0.90})`;
      ctx.beginPath();
      ctx.arc(beaconX, beaconY, 6 * facingIntensity, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(255, 200, 200, ${facingIntensity * 0.80})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(beaconX - 26 * facingIntensity, beaconY);
      ctx.lineTo(beaconX + 26 * facingIntensity, beaconY);
      ctx.moveTo(beaconX, beaconY - 10 * facingIntensity);
      ctx.lineTo(beaconX, beaconY + 10 * facingIntensity);
      ctx.stroke();
    }

    ctx.restore();
  } else {
    // 3.5. Sirene Desligada em Repouso
    ctx.save();
    ctx.fillStyle = 'rgba(120, 20, 20, 0.35)';
    ctx.beginPath();
    ctx.arc(beaconX, beaconY, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
