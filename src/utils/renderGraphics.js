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
let billboardShadowCanvas = null;

export const DEFAULT_BILLBOARD_CONFIG = {
  // Posição e dimensões do outdoor no gramado norte
  x: 512,
  y: 32,
  width: 216,
  height: 122,

  // Sombra Projetada no Solo (Reflete fielmente o formato retangular do outdoor)
  // REGRA OFICIAL DO USUÁRIO: "sombra do outdor esta redondaa quando deveria refletir a forma do outdor retangular"
  shadowSkewX: -0.80,        // Inclinação lateral da sombra (sol do Noroeste)
  shadowSkewY: -0.18,        // Perspectiva no solo
  shadowScaleX: 1.05,        // Largura da sombra
  shadowScaleY: 0.42,        // Achatamento no solo (projeção no plano do chão)
  shadowRotDeg: -12,         // Rotação da sombra
  shadowOffsetX: 26,         // Deslocamento X da projeção
  shadowOffsetY: 82,         // Deslocamento Y da projeção (ancorada no solo sob o outdoor)
  shadowOpacity: 0.60,       // Opacidade da sombra do painel retangular
  shadowBlur: 2,             // Suavidade / difusão da sombra
  
  // Sombra de contato nos pés metálicos
  footShadowOpacity: 0.85
};

export const billboardConfig = { ...DEFAULT_BILLBOARD_CONFIG };

if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('crypto_zombies_billboard_calibration');
    if (saved) {
      Object.assign(billboardConfig, JSON.parse(saved));
    }
  } catch (e) {}
  window.billboardConfig = billboardConfig;

  window.saveBillboardConfig = (cfg) => {
    Object.assign(window.billboardConfig, cfg);
    try {
      localStorage.setItem('crypto_zombies_billboard_calibration', JSON.stringify(window.billboardConfig));
    } catch (e) {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cryptozombies_billboard_config_updated', { detail: window.billboardConfig }));
    }
    return window.billboardConfig;
  };

  window.resetBillboardConfig = () => {
    Object.assign(window.billboardConfig, DEFAULT_BILLBOARD_CONFIG);
    try {
      localStorage.removeItem('crypto_zombies_billboard_calibration');
    } catch (e) {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cryptozombies_billboard_config_updated', { detail: window.billboardConfig }));
    }
    return window.billboardConfig;
  };
}
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

    // Pré-renderiza a silhueta retangular oficial do outdoor para projeção fiel da sombra no gramado
    try {
      const sCanvas = document.createElement('canvas');
      const w = img.naturalWidth || 633;
      const h = img.naturalHeight || 534;
      sCanvas.width = w;
      sCanvas.height = h;
      const sCtx = sCanvas.getContext('2d');
      if (sCtx) {
        sCtx.drawImage(img, 0, 0);
        sCtx.globalCompositeOperation = 'source-in';
        sCtx.fillStyle = 'rgba(6, 20, 8, 0.72)';
        sCtx.fillRect(0, 0, w, h);
        billboardShadowCanvas = sCanvas;
      }
    } catch (e) {}

    if (onLoaded) onLoaded();
  };
  img.onerror = () => {
    console.error('Falha ao carregar /assets/billboard.png');
  };
}

// Configuração Oficial da Torre de Vigia e de sua Sombra Projetada (Calibrada pelo Usuário)
// REGRA OFICIAL DO USUÁRIO: A FRENTE DA TORRE É A PERNA DO MEIO (e deve deitar sentido a frente / Sul).
export const DEFAULT_TOWER_CONFIG = {
  topDeltaX: -3,
  topDeltaY: 16,
  scaleX: -1.5,
  scaleY: 1.18,
  rotDeg: 0.4,
  yawDeg: -180,
  offsetX: -21,
  offsetY: -12,

  shadowRotDeg: -35.5,
  shadowYawDeg: 4,
  shadowSkewX: -1.06,
  shadowSkewY: -0.5,
  shadowLength: 0.95,
  shadowScaleX: 1,
  shadowScaleY: 1,
  shadowOpacity: 0.85,
  shadowOffsetX: -19,
  shadowOffsetY: -6,

  leanSouth: 0.35,
  leanFront: 0.8,
  levelSides: -0.01,
  leanSides: 0.025,
  skewY: -0.01,
  skewX: 0.025
};

export const towerTiltConfig = { ...DEFAULT_TOWER_CONFIG };

if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('crypto_zombies_tower_calibration');
    if (saved) {
      Object.assign(towerTiltConfig, JSON.parse(saved));
    }
  } catch (e) {}
  window.towerTiltConfig = towerTiltConfig;

  window.saveTowerConfig = (cfg) => {
    Object.assign(window.towerTiltConfig, cfg);
    try {
      localStorage.setItem('crypto_zombies_tower_calibration', JSON.stringify(window.towerTiltConfig));
    } catch (e) {}
    return window.towerTiltConfig;
  };

  window.resetTowerConfig = () => {
    Object.assign(window.towerTiltConfig, DEFAULT_TOWER_CONFIG);
    try {
      localStorage.removeItem('crypto_zombies_tower_calibration');
    } catch (e) {}
    return window.towerTiltConfig;
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

    const w = img.naturalWidth || 682;
    const h = img.naturalHeight || 1024;

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

    // 1.1 OUTDOOR / BILLBOARD VETORIZADO "CRYPTOZOMBIES" & SOMBRA RETANGULAR PROJETADA
    drawBillboard(ctx, now);

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
 * Renderiza o Outdoor / Billboard "CryptoZombies" com sua sombra retangular realista no solo.
 * 
 * Regra Oficial do Usuário:
 * "sombra do outdor esta redondaa quando deveria refletir a forma do outdor retangular"
 */
export function drawBillboard(ctx, now) {
  if (!billboardImg && typeof window !== 'undefined') {
    initBillboard();
  }
  if (!billboardLoaded || !billboardImg) return;

  const cfg = (typeof window !== 'undefined' && window.billboardConfig) || billboardConfig;
  const bX = cfg.x ?? 512;
  const bY = cfg.y ?? 32;
  const bW = cfg.width ?? 216;
  const bH = cfg.height ?? 122;

  // 1. SOMBRA RETANGULAR PROJETADA NO GRAMADO (Reflete o formato retangular do painel)
  ctx.save();

  const sX = bX + (cfg.shadowOffsetX ?? 26);
  const sY = bY + (cfg.shadowOffsetY ?? 82);
  const sScaleX = cfg.shadowScaleX ?? 1.05;
  const sScaleY = cfg.shadowScaleY ?? 0.42;
  const sSkewX = cfg.shadowSkewX ?? -0.80;
  const sSkewY = cfg.shadowSkewY ?? -0.18;
  const sRotRad = ((cfg.shadowRotDeg ?? -12) * Math.PI) / 180;
  const sOpacity = cfg.shadowOpacity ?? 0.60;
  const sBlur = cfg.shadowBlur ?? 2;

  ctx.save();
  ctx.translate(sX, sY);
  ctx.rotate(sRotRad);
  ctx.transform(sScaleX, sSkewY, sSkewX, sScaleY, 0, 0);

  if (sBlur > 0 && ctx.filter !== undefined) {
    ctx.filter = `blur(${sBlur}px)`;
  }
  ctx.globalAlpha = sOpacity;

  if (billboardShadowCanvas) {
    // Projeta no chão a silhueta recortada exata da placa retangular e das pernas metálicas
    ctx.drawImage(billboardShadowCanvas, -bW * 0.08, -bH * 0.65, bW, bH);
  } else {
    // Projeção retangular procedural geométrica
    ctx.fillStyle = 'rgba(6, 20, 8, 0.90)';
    ctx.fillRect(0, -bH * 0.70, bW * 0.92, bH * 0.62);
    ctx.fillRect(bW * 0.22, -bH * 0.12, 12, bH * 0.22);
    ctx.fillRect(bW * 0.70, -bH * 0.12, 12, bH * 0.22);
  }
  ctx.restore();

  // 2. Sombras de contato profundo nos apoios metálicos de sustentação no gramado
  const leftFootX = bX + bW * 0.28;
  const leftFootY = bY + bH * 0.89;
  const rightFootX = bX + bW * 0.72;
  const rightFootY = bY + bH * 0.98;
  const footOpacity = cfg.footShadowOpacity ?? 0.85;

  ctx.fillStyle = `rgba(0, 10, 0, ${footOpacity})`;
  ctx.beginPath();
  ctx.ellipse(leftFootX, leftFootY, 13, 5.2, 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(rightFootX, rightFootY, 15, 6.2, 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 3. Renderiza o outdoor vetorizado com proporções perfeitas e alta nitidez
  ctx.drawImage(billboardImg, bX, bY, bW, bH);
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

  // Imagem oficial recortada em alta definição (682x1024)
  const tW = 108;
  const tH = 162;
  const tX = 121;
  const tY = 183;

  // Coordenadas físicas exatas da base de cada uma das sapatas metálicas da torre (medidas no sprite oficial 682x1024)
  const footLeftX = tX + tW * (235 / 682);       // ~158.2
  const footLeftY = tY + tH * (894 / 1024);      // ~324.4
  const footCenterX = tX + tW * (337 / 682);     // ~174.4 (Perna do meio / frente)
  const footCenterY = tY + tH * (958 / 1024);    // ~334.6
  const footRightX = tX + tW * (458 / 682);      // ~193.5
  const footRightY = tY + tH * (895 / 1024);     // ~324.6
  const footBackX = tX + tW * (322 / 682);       // ~172.0 (Sapata traseira)
  const footBackY = tY + tH * (860 / 1024);      // ~319.1

  // 1. Sombras realistas da torre (corpo projetado no gramado + oclusão de contato nas 4 sapatas)
  ctx.save();
  
  const cfg = (typeof window !== 'undefined' && window.towerTiltConfig) || towerTiltConfig;
  const towerDrawable = sirenTowerShadedCanvas || sirenTowerImg;

  // REGRA OFICIAL DO USUÁRIO: A FRENTE DA TORRE É A PERNA DO MEIO (e deve deitar sentido a frente).
  // "veja que invez de pender para frente ele encolhe ou alonga , ela tinha que deitar sentido a frente"
  const topDeltaX = cfg.topDeltaX ?? (cfg.leanSides ? cfg.leanSides * tH : 0);
  const topDeltaY = cfg.topDeltaY ?? (cfg.leanSouth ? cfg.leanSouth * 45 : (cfg.leanFront ? cfg.leanFront * 45 : 32));
  const levelSidesVal = cfg.levelSides ?? cfg.skewY ?? 0;

  // Matriz de inclinação ancorada na perna do meio (0, 0):
  // O ponto do topo (0, -tH) deita exatamente para (topDeltaX, -tH + topDeltaY)
  const shearX = -topDeltaX / tH;
  const scaleYFactor = Math.max(0.2, (tH - topDeltaY) / tH) * (cfg.scaleY ?? 1.0);

  // Rotação horizontal tridimensional (Giro no eixo Y / Yaw)
  const yawRad = ((cfg.yawDeg || 0) * Math.PI) / 180;
  const horizScale = (cfg.scaleX ?? 0.90) * Math.cos(yawRad);

  // Nivelamento entre os lados esquerdo e direito (escada) com rotação Yaw
  const horizSkewY = levelSidesVal - Math.sin(yawRad) * 0.10;

  const rotRad = ((cfg.rotDeg ?? 0) * Math.PI) / 180;
  const cosR = Math.cos(rotRad);
  const sinR = Math.sin(rotRad);

  // 1.0. SOMBRA DIRECIONAL DA ESTRUTURA DA TORRE NO SOLO (Controlada por cfg)
  if (sirenTowerShadowCanvas) {
    ctx.save();
    ctx.globalAlpha = cfg.shadowOpacity ?? 0.85;
    // Ponto de fixação na sapata central (perna do meio) + offsets
    ctx.translate(
      footCenterX + (cfg.offsetX || 0) + (cfg.shadowOffsetX || 0), 
      footCenterY + (cfg.offsetY || 0) + (cfg.shadowOffsetY || 0)
    );
    
    if (cfg.shadowRotDeg) {
      ctx.rotate((cfg.shadowRotDeg * Math.PI) / 180);
    }

    const shadowYawRad = ((cfg.shadowYawDeg || 0) * Math.PI) / 180;
    const sLength = cfg.shadowLength ?? 1.0;
    const sSkewX = (cfg.shadowSkewX ?? -0.75) * sLength;
    const sSkewY = (cfg.shadowSkewY ?? -0.26) * sLength;
    const sScaleX = (cfg.shadowScaleX ?? 1.0) * Math.cos(shadowYawRad);
    const sScaleY = (cfg.shadowScaleY ?? 1.0);

    ctx.transform(sScaleX, 0.0, sSkewX, sSkewY * sScaleY, 0, 0);
    ctx.drawImage(sirenTowerShadowCanvas, -tW * (337 / 682), -tH * (958 / 1024), tW, tH);
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
  ctx.ellipse(tX + tW * 0.52 + (cfg.offsetX || 0), tY + tH * 0.955 + (cfg.offsetY || 0), tW * 0.46 * Math.abs(horizScale), 6.5, 0.08, 0, Math.PI * 2);
  ctx.fill();

  // 1.2. Oclusão de ambiente escura no solo sob a base da estrutura
  ctx.fillStyle = 'rgba(0, 10, 0, 0.58)';
  ctx.beginPath();
  ctx.ellipse(tX + tW * 0.50 + (cfg.offsetX || 0), tY + tH * 0.950 + (cfg.offsetY || 0), tW * 0.36 * Math.abs(horizScale), 5.0, 0.05, 0, Math.PI * 2);
  ctx.fill();

  // 1.3. Sombras de oclusão de contato direto sob as 4 sapatas (acompanham a rotação e inclinação)
  ctx.fillStyle = 'rgba(0, 8, 0, 0.94)';

  const getTransformedFoot = (rawX, rawY) => {
    const dx = rawX - footCenterX;
    const dy = rawY - footCenterY;
    const tx = horizScale * dx + shearX * dy;
    const ty = horizSkewY * dx + scaleYFactor * dy;
    const rx = tx * cosR - ty * sinR;
    const ry = tx * sinR + ty * cosR;
    return {
      x: footCenterX + (cfg.offsetX || 0) + rx,
      y: footCenterY + (cfg.offsetY || 0) + ry
    };
  };

  const tFootBack = getTransformedFoot(footBackX, footBackY);
  const tFootLeft = getTransformedFoot(footLeftX, footLeftY);
  const tFootRight = getTransformedFoot(footRightX, footRightY);
  const tFootCenter = getTransformedFoot(footCenterX, footCenterY);

  // Sapata traseira
  ctx.beginPath();
  ctx.ellipse(tFootBack.x, tFootBack.y + 0.5, 6.5 * Math.max(0.3, Math.abs(horizScale)), 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sapata frontal esquerda
  ctx.beginPath();
  ctx.ellipse(tFootLeft.x, tFootLeft.y + 0.5, 8.0 * Math.max(0.3, Math.abs(horizScale)), 3.0, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sapata frontal direita
  ctx.beginPath();
  ctx.ellipse(tFootRight.x, tFootRight.y + 0.5, 8.5 * Math.max(0.3, Math.abs(horizScale)), 3.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sapata frontal centro (pivô principal)
  ctx.beginPath();
  ctx.ellipse(tFootCenter.x, tFootCenter.y + 0.5, 9.5 * Math.max(0.3, Math.abs(horizScale)), 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 2. Desenho da Torre em Alta Resolução deitando no sentido da frente (perna do meio)
  // REGRA OFICIAL DO USUÁRIO: "ela tinha que deitar sentido a frente"
  ctx.save();
  ctx.translate(footCenterX + (cfg.offsetX || 0), footCenterY + (cfg.offsetY || 0));
  
  if (cfg.rotDeg) {
    ctx.rotate((cfg.rotDeg * Math.PI) / 180);
  }

  // Ancorado na perna do meio (sapata frontal): deita o topo para frente
  ctx.transform(horizScale, horizSkewY, shearX, scaleYFactor, 0, 0);
  ctx.drawImage(towerDrawable, -tW * (337 / 682), -tH * (958 / 1024), tW, tH);
  ctx.restore();

  // 2.1. Oclusão de contato na quina frontal da sapata central para perfeita ancoragem no solo
  ctx.save();
  ctx.fillStyle = 'rgba(0, 10, 0, 0.65)';
  ctx.beginPath();
  ctx.ellipse(tFootCenter.x, tFootCenter.y, 7.5 * Math.max(0.3, Math.abs(horizScale)), 1.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Efeito da Sirene e Luz Giratória Vermelha no Topo da Torre
  // Posição exata do bulbo vermelho da sirene acompanhando o topo deitado da torre:
  const localBeaconX = tW * (338 / 682) - tW * (337 / 682);
  const localBeaconY = tH * (93 / 1024) - tH * (958 / 1024);
  
  const transBeaconX = horizScale * localBeaconX + shearX * localBeaconY;
  const transBeaconY = horizSkewY * localBeaconX + scaleYFactor * localBeaconY;
  
  const rotatedBeaconX = transBeaconX * cosR - transBeaconY * sinR;
  const rotatedBeaconY = transBeaconX * sinR + transBeaconY * cosR;

  const beaconX = footCenterX + (cfg.offsetX || 0) + rotatedBeaconX;
  const beaconY = footCenterY + (cfg.offsetY || 0) + rotatedBeaconY;

  // Exporta coordenadas em tempo real para controle direto por arrasto do mouse
  if (typeof window !== 'undefined') {
    window.sirenTowerCoordinates = {
      baseX: footCenterX + (cfg.offsetX || 0),
      baseY: footCenterY + (cfg.offsetY || 0),
      topX: beaconX,
      topY: beaconY,
      tW,
      tH,
      topDeltaX,
      topDeltaY
    };
  }

  // Desenha alça visual interativa quando o painel de calibrador estiver aberto ou arrastando
  if (typeof window !== 'undefined' && (window.isTowerCalibrating || window.isDraggingTowerTop)) {
    ctx.save();
    // Linha guia conectando a base da perna do meio ao topo da sirene
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(footCenterX + (cfg.offsetX || 0), footCenterY + (cfg.offsetY || 0));
    ctx.lineTo(beaconX, beaconY);
    ctx.stroke();

    // Alça de arraste no topo da sirene
    ctx.setLineDash([]);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.fillStyle = window.isDraggingTowerTop ? 'rgba(245, 158, 11, 0.6)' : 'rgba(245, 158, 11, 0.25)';
    ctx.beginPath();
    ctx.arc(beaconX, beaconY, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ponto central
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(beaconX, beaconY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Rótulo discreto
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#fde68a';
    ctx.textAlign = 'center';
    ctx.fillText('🖱️ Arraste p/ Sul', beaconX, beaconY - 20);
    ctx.restore();
  }

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
      // Plano horizontal 2.5D acompanhando suavemente o ângulo de nivelamento da cabine:
      ctx.transform(1.0, cfg.skewY * 0.6, 0.0, 0.28, 0, 0);

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
