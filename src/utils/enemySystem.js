// ============================================================================
// CRIPTO MYNERS — SISTEMA DE INIMIGOS: ZUMBIS E BOSS
//
// Substitui as antigas jazidas e baús por Zumbis e Boss Mutante com:
// 1. Caminhada fluida (patrulha autônoma pelos túneis, passos, bobbing e inclinação)
// 2. Ataque reativo contra heróis (investida frontal, garras lacerantes, choque sísmico)
// 3. Regra Fundamental: Separação total entre visual e economia (MNC intacto).
// ============================================================================

import { TILE_SIZE, BLOCK_EMPTY, BLOCK_BEDROCK, BLOCK_ZOMBIE, BLOCK_BOSS } from '../data/minersData.js';
import { isCityBuilding, isCanyonTrackOrTunnel } from './cityMapGeometry.js';
import { ENEMIES } from '../data/enemiesCatalog.js';

class EnemySpriteManager {
  constructor() {
    this.zombieImg = null;
    this.zombieUpperImg = null;
    this.zombieLegLeftImg = null;
    this.zombieLegRightImg = null;
    this.bossImg = null;
    this.loaded = false;
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    this.zombieImg = new Image();
    this.zombieImg.crossOrigin = 'anonymous';
    this.zombieImg.src = '/enemies/zombie_clean.png';

    this.zombieUpperImg = new Image();
    this.zombieUpperImg.crossOrigin = 'anonymous';
    this.zombieUpperImg.src = '/enemies/zombie_upper.png';

    this.zombieLegLeftImg = new Image();
    this.zombieLegLeftImg.crossOrigin = 'anonymous';
    this.zombieLegLeftImg.src = '/enemies/zombie_leg_left.png';

    this.zombieLegRightImg = new Image();
    this.zombieLegRightImg.crossOrigin = 'anonymous';
    this.zombieLegRightImg.src = '/enemies/zombie_leg_right.png';

    this.bossImg = new Image();
    this.bossImg.crossOrigin = 'anonymous';
    this.bossImg.src = '/enemies/boss_clean.png';

    let loadedCount = 0;
    const checkReady = () => {
      loadedCount++;
      if (loadedCount >= 5) {
        this.loaded = true;
      }
    };

    this.zombieImg.onload = checkReady;
    this.zombieUpperImg.onload = checkReady;
    this.zombieLegLeftImg.onload = checkReady;
    this.zombieLegRightImg.onload = checkReady;
    this.bossImg.onload = checkReady;

    // Fallbacks para garantir que nunca falhe caso demore o carregamento
    this.zombieImg.onerror = () => {
      this.zombieImg.src = '/enemies/zombie.png';
      checkReady();
    };
    this.bossImg.onerror = () => {
      this.bossImg.src = '/enemies/boss.png';
      checkReady();
    };
  }
}

export const enemySpriteManager = new EnemySpriteManager();

/**
 * Cria ou sincroniza as entidades de inimigos com o estado do grid e dos depósitos
 */
export function syncEnemiesWithMap(existingEnemies = [], mapData, grid, hpMap) {
  const result = [];
  const enemyMap = new Map();

  existingEnemies.forEach(e => {
    enemyMap.set(e.id, e);
  });

  const deposits = mapData?.deposits || [];

  deposits.forEach((dep, idx) => {
    if (dep.isCompleted) return;

    const isBoss = dep.type === 'boss' || dep.blockId === BLOCK_BOSS;
    const blockId = isBoss ? BLOCK_BOSS : BLOCK_ZOMBIE;
    const enemyType = isBoss ? 'boss' : 'zombie';

    let entity = enemyMap.get(dep.id);

    if (!entity) {
      entity = {
        id: dep.id,
        index: idx,
        type: enemyType,
        blockId: blockId,
        name: isBoss ? 'Boss Abominação' : 'Zumbi Mineiro',
        gx: dep.c,
        gy: dep.r,
        visualX: dep.c,
        visualY: dep.r,
        targetGx: dep.c,
        targetGy: dep.r,
        isWalking: false,
        walkTimer: Math.random() * 20,
        moveCooldown: Math.random() * (isBoss ? 4.5 : 3.0) + 2.0,
        facingDir: Math.random() > 0.5 ? 1 : -1,
        isAttacking: false,
        attackProgress: 0,
        attackCooldown: 0,
        hitFlash: 0,
        hp: isBoss ? (dep.currentHp || 6000) : (dep.currentHp > 2 ? 2 : (dep.currentHp || 2)),
        maxHp: isBoss ? (dep.maxHp || 6000) : 2
      };
    } else {
      // Sincroniza HP com mapa individual
      const cellKey = `${entity.gx},${entity.gy}`;
      if (hpMap[cellKey] !== undefined) {
        const targetHp = entity.type === 'zombie' && hpMap[cellKey] > 2 ? 2 : hpMap[cellKey];
        if (targetHp < entity.hp) {
          entity.hitFlash = 0.25; // Pisca em vermelho ao levar golpe
        }
        entity.hp = targetHp;
      }
    }

    result.push(entity);
  });

  return result;
}

/**
 * Atualiza IA, movimentação de caminhada e animação de ataque dos inimigos
 */
export function updateEnemies(enemies, state, dt, now, isCanyon = true) {
  if (!enemies || enemies.length === 0) return;

  const GRID_COLS = state.grid[0]?.length || 15;
  const GRID_ROWS = state.grid.length || 11;

  enemies.forEach(enemy => {
    // Reduz flash de dano
    if (enemy.hitFlash > 0) {
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt * 2.5);
    }

    // 1. Detecta se há heróis mineradores adjacentes atacando este inimigo
    const attackingMiner = state.miners?.find(m => {
      if (m.status !== 'work' || !m.isMining) return false;
      if (!m.targetBlock) return false;
      return m.targetBlock.x === enemy.gx && m.targetBlock.y === enemy.gy;
    });

    if (attackingMiner) {
      // Em combate: vira imediatamente para o herói e ataca!
      const targetDir = attackingMiner.x < enemy.visualX ? -1 : 1;
      enemy.facingDir = targetDir;
      enemy.isAttacking = true;

      // Cadência do ataque do zumbi/boss
      enemy.attackCooldown = (enemy.attackCooldown || 0) - dt;
      if (enemy.attackCooldown <= 0) {
        enemy.attackCooldown = enemy.type === 'boss' ? 1.1 : 0.85;
        enemy.attackProgress = 0.01;
      }

      if (enemy.attackProgress > 0) {
        enemy.attackProgress += dt * (enemy.type === 'boss' ? 2.2 : 2.8);
        if (enemy.attackProgress >= 1.0) {
          enemy.attackProgress = 0;
        }
      }

      // Em combate, o inimigo não anda para longe
      enemy.isWalking = false;
      return;
    }

    // Se saiu de combate
    if (!attackingMiner && enemy.isAttacking) {
      enemy.isAttacking = false;
      enemy.attackProgress = 0;
    }

    // 2. Caminhada e patrulha autônoma pelos túneis
    if (enemy.isWalking) {
      const speed = enemy.type === 'boss' ? 0.42 : 0.65;
      const dx = enemy.targetGx - enemy.visualX;
      const dy = enemy.targetGy - enemy.visualY;
      const dist = Math.hypot(dx, dy);

      enemy.walkTimer += dt * (enemy.type === 'boss' ? 5.5 : 8.0);

      if (dist < 0.06) {
        // Chegou à célula de destino
        enemy.visualX = enemy.targetGx;
        enemy.visualY = enemy.targetGy;
        enemy.gx = enemy.targetGx;
        enemy.gy = enemy.targetGy;
        enemy.isWalking = false;
        enemy.moveCooldown = Math.random() * (enemy.type === 'boss' ? 4.0 : 2.2) + 1.2;
      } else {
        const step = Math.min(dist, speed * dt);
        enemy.visualX += (dx / dist) * step;
        enemy.visualY += (dy / dist) * step;
        if (Math.abs(dx) > 0.05) {
          enemy.facingDir = dx < 0 ? -1 : 1;
        }

        // Partículas sutis de poeira nos passos pesados do Boss
        if (enemy.type === 'boss' && Math.random() < 0.35 && state.particles) {
          state.particles.push({
            x: enemy.visualX * TILE_SIZE + TILE_SIZE / 2 + (Math.random() - 0.5) * 20,
            y: enemy.visualY * TILE_SIZE + TILE_SIZE - 4,
            vx: (Math.random() - 0.5) * 25,
            vy: -Math.random() * 20 - 5,
            color: 'rgba(180, 140, 100, 0.5)',
            size: Math.random() * 2.5 + 1.5,
            life: 0.35,
            maxLife: 0.35
          });
        }
      }
    } else {
      // Temporizador para decidir a próxima caminhada
      enemy.moveCooldown = (enemy.moveCooldown || 2.0) - dt;

      if (enemy.moveCooldown <= 0) {
        // Encontra células vizinhas livres para caminhar (Cima, Baixo, Esquerda, Direita)
        const candidates = [
          { x: enemy.gx + 1, y: enemy.gy },
          { x: enemy.gx - 1, y: enemy.gy },
          { x: enemy.gx, y: enemy.gy + 1 },
          { x: enemy.gx, y: enemy.gy - 1 }
        ].filter(pos => {
          if (pos.x <= 0 || pos.x >= GRID_COLS - 1 || pos.y <= 0 || pos.y >= GRID_ROWS - 1) return false;
          if (isCityBuilding(pos.x, pos.y)) return false; // Prédios e estruturas da cidade (apenas ruas e grama)
          if (state.grid[pos.y] && state.grid[pos.y][pos.x] !== BLOCK_EMPTY) return false; // Bloqueado por rocha/outro

          // Não anda em cima de outro minerador
          const hasHero = state.miners?.some(m => Math.round(m.x) === pos.x && Math.round(m.y) === pos.y);
          if (hasHero) return false;

          return true;
        });

        if (candidates.length > 0) {
          const chosen = candidates[Math.floor(Math.random() * candidates.length)];
          const oldKey = `${enemy.gx},${enemy.gy}`;
          const newKey = `${chosen.x},${chosen.y}`;

          // Transfere no grid e hpMap para que o BFS dos heróis continue perfeitamente sincronizado
          const curHp = state.hpMap[oldKey] !== undefined ? state.hpMap[oldKey] : enemy.hp;
          delete state.hpMap[oldKey];
          state.grid[enemy.gy][enemy.gx] = BLOCK_EMPTY;

          state.grid[chosen.y][chosen.x] = enemy.blockId;
          state.hpMap[newKey] = curHp;

          enemy.targetGx = chosen.x;
          enemy.targetGy = chosen.y;
          enemy.isWalking = true;
          enemy.facingDir = chosen.x < enemy.gx ? -1 : 1;
        } else {
          // Tenta novamente em 2 segundos se cercado
          enemy.moveCooldown = 2.0;
        }
      }
    }
  });
}

/**
 * Renderiza um Zumbi ou Boss no Canvas com animação de caminhada, ataque e barra de vida
 */
export function drawEnemyCharacter(ctx, enemy, now) {
  const isBoss = enemy.type === 'boss';
  const img = isBoss ? enemySpriteManager.bossImg : enemySpriteManager.zombieImg;

  const px = enemy.visualX * TILE_SIZE + TILE_SIZE / 2;
  const py = enemy.visualY * TILE_SIZE + TILE_SIZE / 2;

  // 1. Animação de Caminhada
  // Para o Boss: passadas pesadas e estremecimento do solo
  // Para os Zumbis: caminham movimentando as pernas de verdade (sem balançar o corpo feito pêndulo)
  const bobbing = isBoss 
    ? (enemy.isWalking ? Math.sin(enemy.walkTimer) * 3.8 : Math.sin(now * 0.003 + enemy.index) * 1.2)
    : (enemy.isWalking ? Math.sin(enemy.walkTimer * 5.0) * 1.2 : Math.sin(now * 0.003 + enemy.index) * 0.8);

  // O Boss ainda tem uma leve inclinação de peso, mas o Zumbi NÃO balança mais de um lado pro outro!
  const walkTilt = isBoss && enemy.isWalking ? Math.cos(enemy.walkTimer) * 0.06 : 0;

  // 2. Animação de Ataque (investida com garras afiadas)
  let lungeX = 0;
  let attackTilt = 0;
  let attackScale = 1;

  if (enemy.isAttacking && enemy.attackProgress > 0) {
    const p = enemy.attackProgress;
    // Curva de ataque: preparação rápida (0..0.3), bote violento (0.3..0.6), recuo (0.6..1.0)
    if (p < 0.3) {
      lungeX = -enemy.facingDir * (p / 0.3) * (isBoss ? 5 : 3);
      attackTilt = -enemy.facingDir * 0.12;
    } else if (p < 0.6) {
      const strikeP = (p - 0.3) / 0.3;
      lungeX = enemy.facingDir * strikeP * (isBoss ? 16 : 10);
      attackTilt = enemy.facingDir * 0.24;
      attackScale = isBoss ? 1.08 : 1.05;
    } else {
      const recoverP = (1.0 - p) / 0.4;
      lungeX = enemy.facingDir * recoverP * (isBoss ? 16 : 10);
      attackTilt = enemy.facingDir * recoverP * 0.15;
    }
  }

  // 3. Desenho do Sprite do Inimigo com Transformações
  ctx.save();
  ctx.translate(px + lungeX, py + bobbing);
  ctx.scale(enemy.facingDir * attackScale, attackScale);
  ctx.rotate(walkTilt + attackTilt);

  // Zumbis mais largos e imponentes conforme solicitado (largura expandida de 0.95 para 1.32)
  const drawW = isBoss ? Math.floor(TILE_SIZE * 1.75) : Math.floor(TILE_SIZE * 1.32);
  const drawH = isBoss ? Math.floor(TILE_SIZE * 1.75) : Math.floor(TILE_SIZE * 1.15);

  const dx = -drawW / 2;
  const dy = -drawH + TILE_SIZE / 2 - 2;

  // Pontos de pivô anatômicos das articulações do quadril (escala 640x640)
  const hipLeftX = dx + drawW * (294 / 640);
  const hipLeftY = dy + drawH * (372 / 640);

  const hipRightX = dx + drawW * (352 / 640);
  const hipRightY = dy + drawH * (372 / 640);

  const hasZombieParts = !isBoss && 
    enemySpriteManager.zombieUpperImg?.complete && 
    enemySpriteManager.zombieLegLeftImg?.complete && 
    enemySpriteManager.zombieLegRightImg?.complete;

  if (hasZombieParts) {
    if (enemy.hitFlash > 0) {
      ctx.filter = `brightness(1.5) drop-shadow(0 0 6px #ef4444)`;
    }

    const isWalking = enemy.isWalking;
    // Frequência dinâmica dos passos ao caminhar
    const stepCadence = (enemy.walkTimer || 0) * 8.0;
    // Movimentação real das pernas alternando para frente e para trás
    const legAngle = isWalking ? Math.sin(stepCadence) * 0.44 : 0; // ~25 graus de passada
    const stepBob = isWalking ? Math.abs(Math.sin(stepCadence)) * 2.0 : 0;
    const torsoSway = isWalking ? Math.sin(stepCadence) * 0.035 : 0;

    // 1. Perna Direita (fundo / trás)
    ctx.save();
    ctx.translate(hipRightX, hipRightY);
    ctx.rotate(-legAngle);
    ctx.translate(-hipRightX, -hipRightY);
    ctx.drawImage(enemySpriteManager.zombieLegRightImg, dx, dy, drawW, drawH);
    ctx.restore();

    // 2. Perna Esquerda (frente)
    ctx.save();
    ctx.translate(hipLeftX, hipLeftY);
    ctx.rotate(legAngle);
    ctx.translate(-hipLeftX, -hipLeftY);
    ctx.drawImage(enemySpriteManager.zombieLegLeftImg, dx, dy, drawW, drawH);
    ctx.restore();

    // 3. Tronco Superior (Cabeça, Jaqueta, Braços e Mãos)
    ctx.save();
    ctx.translate(0, -stepBob);
    ctx.rotate(torsoSway);
    ctx.drawImage(enemySpriteManager.zombieUpperImg, dx, dy, drawW, drawH);
    ctx.restore();

    ctx.filter = 'none';
  } else if (img && img.complete && img.naturalWidth > 0) {
    // Efeito de flash vermelho ao receber golpe do herói
    if (enemy.hitFlash > 0) {
      ctx.filter = `brightness(1.5) drop-shadow(0 0 6px #ef4444)`;
    }

    ctx.drawImage(img, dx, dy, drawW, drawH);
    ctx.filter = 'none';
  } else {
    // Fallback vetorial retrô caso a imagem esteja carregando
    ctx.fillStyle = isBoss ? '#991b1b' : '#3f6212';
    ctx.fillRect(dx, dy, drawW, drawH);
  }

  // 5. Efeito Visual de Garras / Ataque Lacerante
  if (enemy.isAttacking && enemy.attackProgress > 0.25 && enemy.attackProgress < 0.65) {
    ctx.strokeStyle = isBoss ? '#ef4444' : '#bef264';
    ctx.lineWidth = isBoss ? 3.5 : 2.5;
    ctx.lineCap = 'round';

    const slashForward = drawW * 0.45;
    const slashTop = -drawH * 0.65;

    // Três riscos diagonais de garras afiadas cortando o ar
    for (let s = -1; s <= 1; s++) {
      ctx.beginPath();
      ctx.moveTo(slashForward - 10, slashTop + s * 9 - 10);
      ctx.lineTo(slashForward + 12, slashTop + s * 9 + 12);
      ctx.stroke();
    }
  }

  ctx.restore();

  // 6. Efeito Sísmico no chão do Boss ao esmagar
  if (isBoss && enemy.isAttacking && enemy.attackProgress > 0.35 && enemy.attackProgress < 0.60) {
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(px + lungeX, py + TILE_SIZE / 2 - 2, 32, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 7. Barra de Vida (HP Bar)
  const hpRatio = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));

  if (isBoss) {
    // BARRA DE VIDA DO BOSS (Imponente no topo com ícone de caveira)
    const barW = 54;
    const barH = 5;
    const barX = px - barW / 2;
    const barY = py - drawH * 0.72;

    ctx.save();
    // Fundo escuro com borda
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

    // Gradiente de vida do Boss (Vermelho a Dourado)
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, '#ef4444');
    grad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = grad;
    ctx.fillRect(barX, barY, barW * hpRatio, barH);

    // Tag '💀 BOSS'
    ctx.font = 'bold 9px var(--font-arcade, sans-serif)';
    ctx.fillStyle = '#fca5a5';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText('💀 BOSS', px, barY - 3);
    ctx.restore();
  } else if (hpRatio < 1.0) {
    // Mini Barra de Vida para Zumbis danificados
    const barW = 28;
    const barH = 3.5;
    const barX = px - barW / 2;
    const barY = py - drawH * 0.68;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

    ctx.fillStyle = hpRatio > 0.4 ? '#84cc16' : '#ef4444';
    ctx.fillRect(barX, barY, barW * hpRatio, barH);
    ctx.restore();
  }
}
