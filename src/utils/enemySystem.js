// ============================================================================
// CRYPTOZOMBIES — SISTEMA DE INIMIGOS: ZUMBIS E BOSS
//
// Substitui as antigas jazidas e baús por Zumbis e Boss Mutante com:
// 1. Caminhada fluida (patrulha autônoma pelos túneis, passos, bobbing e inclinação)
// 2. Ataque reativo contra heróis (investida frontal, garras lacerantes, choque sísmico)
// 3. Regra Fundamental: Separação total entre visual e economia (MNC intacto).
// ============================================================================

import { TILE_SIZE, BLOCK_EMPTY, BLOCK_BEDROCK, BLOCK_ZOMBIE, BLOCK_BOSS } from '../data/minersData.js';
import { isCityBuilding, isCanyonTrackOrTunnel, isBaseCompound, TACTICAL_ZONES, getCornerSpawnPoint } from './cityMapGeometry.js';
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
 * Localiza a célula livre transitável mais próxima para evitar qualquer sobreposição de zumbis
 */
export function findNearestFreeCell(gx, gy, enemies, grid, miners = []) {
  const GRID_COLS = grid[0]?.length || 15;
  const GRID_ROWS = grid.length || 11;
  const visited = new Set([`${gx},${gy}`]);
  const queue = [{ x: gx, y: gy, dist: 0 }];

  while (queue.length > 0) {
    const cur = queue.shift();
    if (cur.dist > 8) break;

    const neighbors = [
      { x: cur.x + 1, y: cur.y },
      { x: cur.x - 1, y: cur.y },
      { x: cur.x, y: cur.y + 1 },
      { x: cur.x, y: cur.y - 1 }
    ];

    for (const nb of neighbors) {
      const key = `${nb.x},${nb.y}`;
      if (visited.has(key)) continue;
      visited.add(key);

      if (nb.x <= 0 || nb.x >= GRID_COLS - 1 || nb.y <= 0 || nb.y >= GRID_ROWS - 1) continue;
      if (isCityBuilding(nb.x, nb.y) || isBaseCompound(nb.x, nb.y)) continue;
      if (grid[nb.y] && grid[nb.y][nb.x] !== BLOCK_EMPTY && grid[nb.y][nb.x] !== BLOCK_ZOMBIE) continue;

      // REGRA OFICIAL DO USUÁRIO: "zumbis nunca devem ocupar o mesmo local"
      // Nenhum outro zumbi pode estar nessa célula, nem ter essa célula como destino, nem estar visualmente próximo
      const isOccupiedByEnemy = enemies.some(other => {
        if (other.hp <= 0) return false;
        if (other.gx === nb.x && other.gy === nb.y) return true;
        if (other.targetGx === nb.x && other.targetGy === nb.y) return true;
        const ovx = other.visualX ?? other.gx;
        const ovy = other.visualY ?? other.gy;
        return Math.hypot(ovx - nb.x, ovy - nb.y) < 0.95;
      });
      if (isOccupiedByEnemy) {
        queue.push({ x: nb.x, y: nb.y, dist: cur.dist + 1 });
        continue;
      }

      // Nenhum minerador pode estar nessa célula
      const hasHero = miners.some(m => Math.round(m.x) === nb.x && Math.round(m.y) === nb.y);
      if (hasHero) {
        queue.push({ x: nb.x, y: nb.y, dist: cur.dist + 1 });
        continue;
      }

      return nb;
    }
  }

  return null;
}

/**
 * Cria ou sincroniza as entidades de inimigos com o estado do grid e dos depósitos
 */
export function syncEnemiesWithMap(existingEnemies = [], mapData, grid, hpMap) {
  const result = [];
  const enemyMap = new Map();
  const occupiedTiles = new Set();

  existingEnemies.forEach(e => {
    enemyMap.set(e.id, e);
  });

  const deposits = mapData?.deposits || [];

  deposits.forEach((dep, idx) => {
    if (dep.isCompleted) return;
    // Zumbis e Boss NUNCA podem nascer nem existir na área da base militar/hospital
    if (isCityBuilding(dep.c, dep.r) || isBaseCompound(dep.c, dep.r)) return;

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
        targetZone: dep.targetZone || TACTICAL_ZONES[idx % TACTICAL_ZONES.length]?.center,
        visualX: dep.c,
        visualY: dep.r,
        targetGx: dep.c,
        targetGy: dep.r,
        isWalking: false,
        attackedTimer: 0,
        isUnderAttack: false,
        walkTimer: Math.random() * 20,
        moveCooldown: Math.random() * (isBoss ? 4.5 : 3.0) + 2.0,
        facingDir: Math.random() > 0.5 ? 1 : -1,
        isAttacking: false,
        attackProgress: 0,
        attackCooldown: 0,
        hitFlash: 0,
        hp: isBoss ? (dep.currentHp > 30 ? 30 : (dep.currentHp || 30)) : (dep.currentHp > 2 ? 2 : (dep.currentHp || 2)),
        maxHp: isBoss ? 30 : 2
      };
    } else {
      // Sincroniza HP com mapa individual
      const cellKey = `${entity.gx},${entity.gy}`;
      if (hpMap[cellKey] !== undefined) {
        let targetHp = hpMap[cellKey];
        if (entity.type === 'zombie' && targetHp > 2) targetHp = 2;
        if (entity.type === 'boss' && targetHp > 30) targetHp = 30;
        if (targetHp < entity.hp) {
          entity.hitFlash = 0.25; // Pisca em vermelho ao levar golpe
        }
        entity.hp = targetHp;
      }
    }

    // REGRA OFICIAL DO USUÁRIO: "zumbis nunca devem ocupar o mesmo local"
    const tileKey = `${entity.gx},${entity.gy}`;
    if (!occupiedTiles.has(tileKey)) {
      occupiedTiles.add(tileKey);
      result.push(entity);
    } else {
      // Reloca para célula livre adjacente
      const freeCell = findNearestFreeCell(entity.gx, entity.gy, result, grid, []);
      if (freeCell) {
        entity.gx = freeCell.x;
        entity.gy = freeCell.y;
        entity.visualX = freeCell.x;
        entity.visualY = freeCell.y;
        entity.targetGx = freeCell.x;
        entity.targetGy = freeCell.y;
        occupiedTiles.add(`${freeCell.x},${freeCell.y}`);
        result.push(entity);
      }
    }
  });

  // REGRA OFICIAL DO USUÁRIO: "mantenha a logica dos zumbis , morre 1 nasce outro"
  // Limite rígido oficial: máximo 31 criaturas (30 zumbis + 1 boss)
  return result.slice(0, 31);
}

/**
 * Atualiza IA, movimentação de caminhada e animação de ataque dos inimigos
 */
export function updateEnemies(enemies, state, dt, now, isCanyon = true) {
  if (!enemies || enemies.length === 0) return;

  const GRID_COLS = state.grid[0]?.length || 15;
  const GRID_ROWS = state.grid.length || 11;

  // REGRA OFICIAL DO USUÁRIO: "zumbis nunca devem ocupar o mesmo local"
  // 0. DESEMPILHAMENTO E SEPARAÇÃO RÍGIDA DE POSIÇÕES
  // Garante que nenhum zumbi compartilhe a mesma célula no grid nem fique sobreposto a outro
  const occupiedTiles = new Map();
  enemies.forEach(enemy => {
    if (enemy.hp <= 0) return;
    const key = `${enemy.gx},${enemy.gy}`;
    if (!occupiedTiles.has(key)) {
      occupiedTiles.set(key, enemy);
    } else {
      // Conflito de ocupação! Dois zumbis na mesma célula. Reloca o duplicado imediatamente
      const freeCell = findNearestFreeCell(enemy.gx, enemy.gy, enemies, state.grid, state.miners);
      if (freeCell) {
        const oldKey = `${enemy.gx},${enemy.gy}`;
        const newKey = `${freeCell.x},${freeCell.y}`;
        if (state.hpMap[oldKey] !== undefined && !occupiedTiles.has(oldKey)) {
          delete state.hpMap[oldKey];
        }
        state.hpMap[newKey] = enemy.hp || 2;
        if (state.grid[freeCell.y]) {
          state.grid[freeCell.y][freeCell.x] = enemy.blockId;
        }
        enemy.gx = freeCell.x;
        enemy.gy = freeCell.y;
        enemy.visualX = freeCell.x;
        enemy.visualY = freeCell.y;
        enemy.targetGx = freeCell.x;
        enemy.targetGy = freeCell.y;
        enemy.isWalking = false;
        occupiedTiles.set(newKey, enemy);
      }
    }
  });

  enemies.forEach(enemy => {
    // REGRA OFICIAL DO USUÁRIO: "onde foi selecionado em hiotese alguma zumbis e herois podem pizar em cima ou passar ali"
    // Se o zumbi estiver sobre qualquer obstáculo ou ruína, reloca-o imediatamente para terreno livre
    if (isCityBuilding(enemy.gx, enemy.gy) || isBaseCompound(enemy.gx, enemy.gy)) {
      const openPoint = getCornerSpawnPoint(Math.floor(Math.random() * 8));
      const oldKey = `${enemy.gx},${enemy.gy}`;
      const newKey = `${openPoint.c},${openPoint.r}`;
      if (state.grid[enemy.gy] && state.grid[enemy.gy][enemy.gx] === enemy.blockId) {
        state.grid[enemy.gy][enemy.gx] = BLOCK_EMPTY;
      }
      if (state.hpMap[oldKey] !== undefined) {
        state.hpMap[newKey] = state.hpMap[oldKey];
        delete state.hpMap[oldKey];
      }
      enemy.gx = openPoint.c;
      enemy.gy = openPoint.r;
      enemy.visualX = openPoint.c;
      enemy.visualY = openPoint.r;
      enemy.targetGx = openPoint.c;
      enemy.targetGy = openPoint.r;
      enemy.isWalking = false;
      if (state.grid[openPoint.r]) {
        state.grid[openPoint.r][openPoint.c] = enemy.blockId;
      }
    }

    // Reduz flash de dano
    if (enemy.hitFlash > 0) {
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt * 2.5);
    }

    // 1. Detecta heróis em combate e alcance de ataque com Gosma Verde
    const isBoss = enemy.type === 'boss';
    const ex = enemy.visualX ?? enemy.gx;
    const ey = enemy.visualY ?? enemy.gy;

    // REGRA OFICIAL DO USUÁRIO: "boss tambem so ataca herois que tiverem perto"
    // Tanto os zumbis comuns quanto o Boss atacam APENAS heróis muito próximos (alcance curto de combate <= 2.0 tiles)
    const combatRange = isBoss ? 2.0 : 1.8;

    // Procura herói alvo ESTRITAMENTE dentro do combatRange permitido
    const activeHeroes = state.miners?.filter(m => {
      const maxHealth = Number(m.maxHealth) > 0 ? Number(m.maxHealth) : 100;
      const currentHealth = Number.isFinite(Number(m.currentHealth)) ? Number(m.currentHealth) : maxHealth;
      const healthPct = (currentHealth / maxHealth) * 100;
      return m.status === 'work' && healthPct > 5 && !m.injuredAwaitingRescue &&
        (m.durability === undefined || m.durability > 0);
    }) || [];
    let targetHero = null;
    let closestDist = Infinity;

    const lockedHero = activeHeroes.find(m => (m.lockedEnemyId && m.lockedEnemyId === enemy.id) || (m.targetBlock && m.targetBlock.x === enemy.gx && m.targetBlock.y === enemy.gy));
    if (lockedHero) {
      const d = Math.hypot(lockedHero.x - ex, lockedHero.y - ey);
      if (d <= combatRange) {
        targetHero = lockedHero;
        closestDist = d;
      }
    }
    
    if (!targetHero && activeHeroes.length > 0) {
      activeHeroes.forEach(m => {
        const d = Math.hypot(m.x - ex, m.y - ey);
        if (d <= combatRange && d < closestDist) {
          closestDist = d;
          targetHero = m;
        }
      });
    }

    if (targetHero) {
      // REGRA OFICIAL DO USUÁRIO: "boss e zumbis devem virar para o lado que esta atacando"
      if (Math.abs(targetHero.x - ex) > 0.05) {
        enemy.facingDir = targetHero.x < ex ? -1 : 1;
      }
      enemy.isAttacking = true;

      // Cadência do ataque de cuspe de gosma verde
      enemy.attackCooldown = (enemy.attackCooldown || 0) - dt;
      if (enemy.attackCooldown <= 0) {
        enemy.attackCooldown = isBoss ? (1.5 + Math.random() * 0.6) : (2.0 + Math.random() * 0.8);
        enemy.attackProgress = 0.01;

        // DISPARA PROJÉTIL DE GOSMA VERDE EM DIREÇÃO AO HERÓI
        state.slimes = state.slimes || [];
        // Posição de origem na boca ajustada pela direção virada
        const mouthOffsetX = (enemy.facingDir === 1 ? 1 : -1) * (isBoss ? 16 : 8);
        const startPx = ex * TILE_SIZE + TILE_SIZE / 2 + mouthOffsetX;
        const startPy = ey * TILE_SIZE + TILE_SIZE / 2 - (isBoss ? 20 : 12);
        const targetPx = targetHero.x * TILE_SIZE + TILE_SIZE / 2;
        const targetPy = targetHero.y * TILE_SIZE + TILE_SIZE / 2;

        state.slimes.push({
          startX: startPx,
          startY: startPy,
          currentX: startPx,
          currentY: startPy,
          targetX: targetPx,
          targetY: targetPy,
          targetHeroId: targetHero.id,
          progress: 0,
          speed: isBoss ? 1.4 : 2.8,
          arcHeight: isBoss ? 35 : 12,
          radius: isBoss ? 9 : 5,
          isBoss: isBoss,
          // REGRA OFICIAL DO USUÁRIO: "o boss deve tirar 20 de dano por hit", "coloque dano de zumis de 1 por hit"
          damage: isBoss ? 20 : 1
        });

        // O Boss pode cuspir uma segunda gosma em dispersão se houver outro herói próximo
        if (isBoss) {
          const otherHero = activeHeroes.find(m => m.id !== targetHero.id && Math.hypot(m.x - ex, m.y - ey) <= combatRange);
          if (otherHero) {
            state.slimes.push({
              startX: startPx,
              startY: startPy,
              currentX: startPx,
              currentY: startPy,
              targetX: otherHero.x * TILE_SIZE + TILE_SIZE / 2,
              targetY: otherHero.y * TILE_SIZE + TILE_SIZE / 2,
              targetHeroId: otherHero.id,
              progress: 0,
              speed: 1.3,
              arcHeight: 38,
              radius: 8,
              isBoss: true,
              damage: 20
            });
          }
        }
      }

      if (enemy.attackProgress > 0) {
        enemy.attackProgress += dt * (isBoss ? 2.2 : 2.8);
        if (enemy.attackProgress >= 1.0) {
          enemy.attackProgress = 0;
        }
      }

      // Em combate, o inimigo foca a mira
      enemy.isWalking = false;
      return;
    }

    // Se saiu de combate
    if (!targetHero && enemy.isAttacking) {
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
      // Temporizador de ataque sofrido (reseta gradualmente)
      if (enemy.attackedTimer > 0) {
        enemy.attackedTimer -= dt;
      }

      // REGRA OFICIAL DO USUÁRIO: "enquanto o zumbi é atacado ele nao deve caminhar"
      // REGRA OFICIAL DO USUÁRIO: "quando heroi começa atacar um zumbi ele deve continuar atacando o mesmo zumbi ate mata-lo e nao deve caminhar enquanto isso"
      const isTargetedByHero = activeHeroes.some(m => m.isMining && ((m.lockedEnemyId && m.lockedEnemyId === enemy.id) || (m.targetBlock && m.targetBlock.x === enemy.gx && m.targetBlock.y === enemy.gy)));
      const isUnderAttack = (enemy.hitFlash > 0) || (enemy.attackedTimer > 0) || (enemy.isUnderAttack) || isTargetedByHero;
      if (isUnderAttack) {
        enemy.isWalking = false;
        enemy.isUnderAttack = true;
        enemy.moveCooldown = 1.5; // Permanece estático e em posição de combate enquanto sob ataque
        return;
      }

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
          if (isCityBuilding(pos.x, pos.y) || isBaseCompound(pos.x, pos.y)) return false; // Bloqueia prédios e toda a área da base militar
          if (state.grid[pos.y] && state.grid[pos.y][pos.x] !== BLOCK_EMPTY && state.grid[pos.y][pos.x] !== enemy.blockId) return false; // Bloqueado por rocha/outro

          // REGRA OFICIAL DO USUÁRIO: "zumbis nunca devem ocupar o mesmo local"
          // Não pode se mover para célula que já contenha outro zumbi ou que seja o destino de outro zumbi
          const hasOtherEnemy = enemies.some(other => {
            if (other.id === enemy.id || other.hp <= 0) return false;
            if (other.gx === pos.x && other.gy === pos.y) return true;
            if (other.targetGx === pos.x && other.targetGy === pos.y) return true;
            const ovx = other.visualX ?? other.gx;
            const ovy = other.visualY ?? other.gy;
            if (Math.hypot(ovx - pos.x, ovy - pos.y) < 0.95) return true;
            return false;
          });
          if (hasOtherEnemy) return false;

          // Não anda em cima de outro minerador
          const hasHero = state.miners?.some(m => Math.round(m.x) === pos.x && Math.round(m.y) === pos.y);
          if (hasHero) return false;

          return true;
        });

        if (candidates.length > 0) {
          // REGRA OFICIAL DO USUÁRIO: "caminham para as areas definidas proporcionalmente distribuidos"
          let chosen = null;
          const targetX = enemy.targetZone?.x ?? enemy.targetZone?.c;
          const targetY = enemy.targetZone?.y ?? enemy.targetZone?.r;

          if (targetX !== undefined && targetY !== undefined) {
            const currentDist = Math.abs(enemy.gx - targetX) + Math.abs(enemy.gy - targetY);
            if (currentDist > 1) {
              // Se ainda não chegou na zona definida, caminha em direção a ela
              candidates.sort((a, b) => {
                const distA = Math.abs(a.x - targetX) + Math.abs(a.y - targetY);
                const distB = Math.abs(b.x - targetX) + Math.abs(b.y - targetY);
                return distA - distB;
              });
              chosen = candidates[0];
            }
          }

          if (!chosen) {
            chosen = candidates[Math.floor(Math.random() * candidates.length)];
          }

          const oldKey = `${enemy.gx},${enemy.gy}`;
          const newKey = `${chosen.x},${chosen.y}`;

          // Transfere no grid e hpMap para que o BFS dos heróis continue perfeitamente sincronizado
          const curHp = state.hpMap[oldKey] !== undefined ? state.hpMap[oldKey] : enemy.hp;
          delete state.hpMap[oldKey];
          state.grid[enemy.gy][enemy.gx] = BLOCK_EMPTY;

          state.grid[chosen.y][chosen.x] = enemy.blockId;
          state.hpMap[newKey] = curHp;

          const dir = chosen.x < enemy.gx ? -1 : 1;
          enemy.targetGx = chosen.x;
          enemy.targetGy = chosen.y;
          enemy.gx = chosen.x;
          enemy.gy = chosen.y;
          enemy.isWalking = true;
          enemy.facingDir = dir;
          enemy.moveCooldown = Math.random() * 1.5 + 1.2;
        } else {
          // Tenta novamente em 2 segundos se cercado
          enemy.moveCooldown = 2.0;
        }
      }
    }
  });

  // REGRA OFICIAL DO USUÁRIO: "zumbis nunca devem ocupar o mesmo local"
  // Força contínua de repulsão suave para manter distância visual mínima (0.92 tiles) enquanto caminham
  for (let i = 0; i < enemies.length; i++) {
    const e1 = enemies[i];
    if (e1.hp <= 0) continue;
    for (let j = i + 1; j < enemies.length; j++) {
      const e2 = enemies[j];
      if (e2.hp <= 0) continue;
      const v1x = e1.visualX ?? e1.gx;
      const v1y = e1.visualY ?? e1.gy;
      const v2x = e2.visualX ?? e2.gx;
      const v2y = e2.visualY ?? e2.gy;
      const dx = v1x - v2x;
      const dy = v1y - v2y;
      const dist = Math.hypot(dx, dy);
      if (dist < 0.92 && dist > 0.0001) {
        const overlap = 0.92 - dist;
        const pushFactor = (overlap / dist) * 0.45;
        const px = dx * pushFactor;
        const py = dy * pushFactor;

        const n1x = v1x + px;
        const n1y = v1y + py;
        if (!isCityBuilding(n1x, n1y) && !isBaseCompound(n1x, n1y)) {
          e1.visualX = n1x;
          e1.visualY = n1y;
        }
        const n2x = v2x - px;
        const n2y = v2y - py;
        if (!isCityBuilding(n2x, n2y) && !isBaseCompound(n2x, n2y)) {
          e2.visualX = n2x;
          e2.visualY = n2y;
        }
      }
    }
  }
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

  // Zumbis e Boss com escala aumentada suavemente (~15%) conforme solicitação
  const drawW = isBoss ? Math.floor(TILE_SIZE * 0.82) : Math.floor(TILE_SIZE * 0.60);
  const drawH = isBoss ? Math.floor(TILE_SIZE * 0.75) : Math.floor(TILE_SIZE * 0.54);

  // Calibragem física exata para pés plantados no solo (elimina qualquer efeito de flutuação):
  // No sprite 640x640 do zumbi, a sola da bota está em Y=536 (536/640 = 0.8375)
  // No sprite 1024x1024 do boss, a sola dos pés está em Y=948 (948/1024 = 0.9258)
  const groundY = isBoss ? 18 : 12;
  const dy = isBoss
    ? groundY - Math.round(drawH * (948 / 1024))
    : groundY - Math.round(drawH * (536 / 640));
  const dx = -drawW / 2;

  // 3. Sombra de Contato Realista no Solo (ancorada exatamente na sola das botas, sem aura no chão)
  ctx.save();
  ctx.translate(px + lungeX * 0.35, py);
  const shadowY = groundY;
  // Sombra compacta ajustada à largura das botas do zumbi (não parece poça nem aura)
  const shadowRx = isBoss ? 20.0 : 11.0;
  const shadowRy = isBoss ? 5.8 : 3.6;

  // Camada 1: Penumbra difusa suave
  ctx.beginPath();
  ctx.fillStyle = isBoss ? 'rgba(0, 0, 0, 0.22)' : 'rgba(0, 0, 0, 0.20)';
  ctx.ellipse(0, shadowY, shadowRx, shadowRy, 0, 0, Math.PI * 2);
  ctx.fill();

  // Camada 2: Núcleo de oclusão de contato direto (bem escuro e rente ao solo)
  ctx.beginPath();
  ctx.fillStyle = isBoss ? 'rgba(0, 0, 0, 0.50)' : 'rgba(0, 0, 0, 0.44)';
  ctx.ellipse(0, shadowY, shadowRx * 0.78, shadowRy * 0.70, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // AURA OFICIAL DO BOSS (Desenha ATRÁS do corpo do Boss, emanando do tronco)
  // REGRA OFICIAL DO USUÁRIO: "aumente a aura do boz um pouco, quase nao se percebe"
  if (isBoss) {
    ctx.save();
    ctx.translate(px + lungeX * 0.35, py);
    const auraPulse = 0.96 + Math.sin(now * 0.005) * 0.08;
    const auraRx = 33 * auraPulse;
    const auraRy = 26 * auraPulse;

    // Centrada no torso (y = -3), emanando estritamente por TRÁS do sprite opaco do Boss
    const bodyAura = ctx.createRadialGradient(0, -3, 4, 0, -3, auraRx);
    bodyAura.addColorStop(0, 'rgba(126, 34, 206, 0.55)');
    bodyAura.addColorStop(0.38, 'rgba(147, 51, 234, 0.38)');
    bodyAura.addColorStop(0.72, 'rgba(34, 197, 94, 0.25)');
    bodyAura.addColorStop(1, 'rgba(21, 128, 61, 0)');
    ctx.fillStyle = bodyAura;
    ctx.beginPath();
    ctx.ellipse(0, -3, auraRx, auraRy, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 4. Desenho do Sprite do Inimigo com Transformações
  // Para os zumbis com pernas separadas, os pés ficam firmemente apoiados no chão
  // enquanto o tronco e cabeça realizam o bobbing e a respiração.
  ctx.save();
  const rootBob = isBoss ? bobbing * 0.5 : 0;
  ctx.translate(px + lungeX, py + rootBob);
  ctx.rotate(walkTilt + attackTilt);

  // Orientação dos sprites de origem:
  // - boss_clean.png foi desenhado originalmente virado para a ESQUERDA.
  // - zombie_clean.png (e as partes das pernas) foram desenhados originalmente virados para a DIREITA.
  // REGRA OFICIAL DO USUÁRIO: "eles estao andando de ré" -> Corrigido para andar sempre de frente na direção do movimento!
  let flipFactor;
  if (isBoss) {
    // Para o Boss: facingDir === 1 (Direita) espelha (-1); facingDir === -1 (Esquerda) natural (1)
    flipFactor = enemy.facingDir === 1 ? -1 : 1;
  } else {
    // Para os Zumbis: facingDir === 1 (Direita) natural (1); facingDir === -1 (Esquerda) espelha (-1)
    flipFactor = enemy.facingDir === -1 ? -1 : 1;
  }
  ctx.scale(flipFactor * attackScale, attackScale);

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

    // 3. Tronco Superior (Cabeça, Jaqueta, Braços e Mãos com bobbing e respiração)
    ctx.save();
    ctx.translate(0, -stepBob + bobbing);
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

  // O efeito anterior de 3 riscos de garra cortando o ar (#bef264) foi removido a pedido do usuário.
  ctx.restore();

  // 6. Efeito Sísmico no chão do Boss ao esmagar
  if (isBoss && enemy.isAttacking && enemy.attackProgress > 0.35 && enemy.attackProgress < 0.60) {
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.ellipse(px + lungeX, py + 16, 22, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 7. Barra de Vida (HP Bar)
  const hpRatio = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));

  if (isBoss) {
    // BARRA DE VIDA DO BOSS (Imponente no topo com ícone de caveira)
    const barW = 38;
    const barH = 4;
    const barX = px - barW / 2;
    const barY = py - drawH * 0.85;

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

    // Tag '💀 BOSS' (REGRA OFICIAL DO USUÁRIO: "remova a descrição de 30/30 do boss")
    ctx.font = 'bold 8.5px var(--font-arcade, sans-serif)';
    ctx.fillStyle = '#fca5a5';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText('💀 BOSS', px, barY - 3);
    ctx.restore();
  } else if (hpRatio < 1.0) {
    // Mini Barra de Vida para Zumbis danificados
    const barW = 18;
    const barH = 2.5;
    const barX = px - barW / 2;
    const barY = py - drawH * 0.80;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

    ctx.fillStyle = hpRatio > 0.4 ? '#84cc16' : '#ef4444';
    ctx.fillRect(barX, barY, barW * hpRatio, barH);
    ctx.restore();
  }
}
