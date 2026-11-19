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

export function initCityMap(onLoaded) {
  initBillboard();
  initUserFog();
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
export function drawContinuousCaveFloor(ctx, width, height, mine, now) {
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

  // Aura Radiante Oficial da Raridade no Solo e no Tronco
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
 * Renderiza uma névoa verde atmosférica com mais ênfase, formas orgânicas irregulares
 * e textura de fumaça rasteira autêntica (sem formas arredondadas geométricas).
 * Dissipa-se naturalmente quando o Boss é derrotado.
 */
export function drawBossGreenFog(ctx, width, height, opacity, now, bossEnemy) {
  if (!opacity || opacity <= 0.005) return;

  ctx.save();
  const baseAlpha = Math.min(1, Math.max(0, opacity));

  // 1. Tonalidade atmosférica ambiente verde tóxica (2x mais ênfase conforme pedido)
  const ambientGrad = ctx.createLinearGradient(0, 0, 0, height);
  ambientGrad.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
  ambientGrad.addColorStop(0.40, 'rgba(34, 197, 94, 0.16)');
  ambientGrad.addColorStop(0.75, 'rgba(21, 128, 61, 0.24)');
  ambientGrad.addColorStop(1, 'rgba(74, 222, 128, 0.35)'); // Base rasteira densa e luminosa
  ctx.fillStyle = ambientGrad;
  ctx.globalAlpha = baseAlpha;
  ctx.fillRect(0, 0, width, height);

  // 2. Camada Autêntica de Textura de Fumaça/Névoa da Referência do Usuário (2x mais ênfase)
  if (userFogLoaded && userFogImg) {
    ctx.save();
    // Camada rasteira 1: fumaça densa fluindo pelo solo da cidade
    const scroll1 = (now * 0.018) % width;
    ctx.globalAlpha = baseAlpha * 0.70;
    ctx.drawImage(userFogImg, -scroll1, height * 0.35, width, height * 0.68);
    ctx.drawImage(userFogImg, width - scroll1, height * 0.35, width, height * 0.68);

    // Camada rasteira 2: plumas volumétricas flutuando em sentido cruzado
    const scroll2 = (now * 0.010) % width;
    ctx.globalAlpha = baseAlpha * 0.50;
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(userFogImg, -width + scroll2, height * 0.05, width * 1.2, height * 0.75);
    ctx.drawImage(userFogImg, scroll2, height * 0.05, width * 1.2, height * 0.75);
    ctx.restore();
    ctx.restore();
  }

  // 3. Fitas e Plumas de Fumaça Orgânica Irregular (SEM NENHUMA FORMA ARREDONDADA)
  // Desenhadas com curvas de Bezier sinuosas e pontas fluidas que imitam névoa real
  ctx.save();
  const time = now * 0.0005;

  for (let r = 0; r < 3; r++) {
    const yBase = height * (0.32 + r * 0.25);
    const speed = 0.8 + r * 0.3;
    const offset = Math.sin(time * speed + r) * 65;
    
    ctx.beginPath();
    ctx.moveTo(-60, yBase + Math.sin(time + r) * 28);
    
    // Curvas Bezier orgânicas sinuosas com formas distintas e assimétricas
    ctx.bezierCurveTo(
      width * 0.25 + offset, yBase - 40 + Math.cos(time * 1.2 + r) * 25,
      width * 0.45 - offset, yBase + 55 + Math.sin(time * 0.9 + r) * 30,
      width * 0.70 + offset * 0.5, yBase - 25 + Math.cos(time + r) * 22
    );
    ctx.bezierCurveTo(
      width * 0.85 + offset, yBase + 35 + Math.sin(time * 1.1) * 25,
      width + 70, yBase - 20,
      width + 90, yBase + 70
    );
    ctx.bezierCurveTo(
      width * 0.65, yBase + 85 + Math.cos(time) * 18,
      width * 0.30, yBase + 95 + Math.sin(time) * 25,
      -60, yBase + 80
    );
    ctx.closePath();

    const smokeGrad = ctx.createLinearGradient(0, yBase - 40, width, yBase + 90);
    smokeGrad.addColorStop(0, 'rgba(74, 222, 128, 0)');
    smokeGrad.addColorStop(0.3, 'rgba(74, 222, 128, 0.22)');
    smokeGrad.addColorStop(0.6, 'rgba(34, 197, 94, 0.18)');
    smokeGrad.addColorStop(1, 'rgba(21, 128, 61, 0)');
    
    ctx.fillStyle = smokeGrad;
    ctx.globalAlpha = baseAlpha;
    ctx.fill();
  }
  ctx.restore();

  // 4. AURA DO BOSS: MESCLADA DE PRETO, ROXO E VERDE COM EMANAÇÃO ASCENDENTE
  if (bossEnemy) {
    const bx = (bossEnemy.visualX !== undefined ? bossEnemy.visualX : (bossEnemy.gx || 7)) * TILE_SIZE + TILE_SIZE / 2;
    const by = (bossEnemy.visualY !== undefined ? bossEnemy.visualY : (bossEnemy.gy || 5)) * TILE_SIZE + TILE_SIZE / 2;
    
    ctx.save();
    ctx.globalAlpha = baseAlpha;

    // Pluma de vapor abissal mesclada de Preto, Roxo e Verde saindo do Boss
    const steamTime = now * 0.002;
    ctx.beginPath();
    ctx.moveTo(bx - 24, by);
    ctx.bezierCurveTo(
      bx - 50 + Math.sin(steamTime) * 20, by - 60,
      bx + 40 + Math.cos(steamTime) * 25, by - 95,
      bx + 18, by - 130
    );
    ctx.bezierCurveTo(
      bx - 30, by - 90,
      bx + 40, by - 45,
      bx + 24, by
    );
    ctx.closePath();

    const bossSteamGrad = ctx.createLinearGradient(bx, by, bx, by - 130);
    bossSteamGrad.addColorStop(0, 'rgba(0, 0, 0, 0.75)'); // Preto na raiz
    bossSteamGrad.addColorStop(0.35, 'rgba(126, 34, 206, 0.50)'); // Roxo no meio
    bossSteamGrad.addColorStop(0.70, 'rgba(34, 197, 94, 0.40)'); // Verde na borda
    bossSteamGrad.addColorStop(1, 'rgba(132, 204, 22, 0)');
    ctx.fillStyle = bossSteamGrad;
    ctx.fill();

    // Névoa mesclada rasteira aos pés do Boss (Preto + Roxo + Verde)
    ctx.beginPath();
    ctx.ellipse(bx, by + 18, 60 + Math.sin(steamTime) * 12, 20, 0, 0, Math.PI * 2);
    const bossMistGrad = ctx.createRadialGradient(bx, by + 18, 4, bx, by + 18, 60);
    bossMistGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)'); // Núcleo preto
    bossMistGrad.addColorStop(0.40, 'rgba(147, 51, 234, 0.55)'); // Halo roxo
    bossMistGrad.addColorStop(0.80, 'rgba(34, 197, 94, 0.45)'); // Borda verde tóxica
    bossMistGrad.addColorStop(1, 'rgba(21, 128, 61, 0)');
    ctx.fillStyle = bossMistGrad;
    ctx.fill();
    ctx.restore();
  }

  // 5. Vinheta escura/verde periférica para fechar a atmosfera
  ctx.save();
  const edgeVignette = ctx.createRadialGradient(
    width / 2, height / 2, width * 0.35,
    width / 2, height / 2, width * 0.72
  );
  edgeVignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  edgeVignette.addColorStop(0.65, 'rgba(22, 101, 52, 0.12)');
  edgeVignette.addColorStop(1, 'rgba(2, 44, 18, 0.36)');
  ctx.fillStyle = edgeVignette;
  ctx.globalAlpha = baseAlpha;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  ctx.restore();
}
