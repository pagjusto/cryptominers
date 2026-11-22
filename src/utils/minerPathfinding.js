// ============================================================================
// CRYPTOZOMBIES — SISTEMA DE NAVEGAÇÃO E COMBATE INTELIGENTE DOS HERÓIS (BFS)
// 
// Garante que nenhum herói fique "bobo" ou preso ao combater zumbis e o boss.
// 1. Raio de Combate Tático: Heróis com armas de fogo engajam a até 2 blocos de distância.
// 2. Linha de Tiro Desobstruída: Dispara contra zumbis com visão direta pelas ruas e gramados.
// 3. Perseguição Contínua: Navega pelo menor caminho contornando prédios e obstáculos.
// ============================================================================

import { GRID_COLS, GRID_ROWS, BLOCK_EMPTY, BLOCK_BEDROCK, BLOCK_ZOMBIE, BLOCK_BOSS } from '../data/minersData.js';
import { isCityBuilding, isBaseCompound } from './cityMapGeometry.js';

export const COMBAT_RANGE = 2; // Alcance tático de combate com armas de fogo (até 2 blocos de distância, incluindo diagonais)

/**
 * Determina se a célula contém um obstáculo intransponível para caminhada física:
 * - Bordas do mapa (rocha matriz perimetral)
 * - Prédios, ruínas, muros, barricadas, carros e outdoor da cidade
 * - Complexo central da base médica
 * - Rocha matriz indestrutível
 */
export function isSolidTerrain(x, y, grid, isCanyon = true) {
  if (x <= 0 || x >= GRID_COLS - 1 || y <= 0 || y >= GRID_ROWS - 1) return true;

  // Prédios, ruínas, muros, cercas, veículos e outdoor da cidade
  if (isCityBuilding(x, y)) return true;

  // Complexo central do abrigo médico
  if (isBaseCompound(x, y)) return true;

  // Paredes rochosas indestrutíveis de borda
  if (grid && grid[y] && grid[y][x] === BLOCK_BEDROCK) return true;

  return false;
}

/**
 * Verifica se há linha de tiro desobstruída entre o herói e o alvo (sem prédios de concreto no meio)
 */
export function hasClearLineOfSight(x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;

  let cx = x1;
  let cy = y1;

  // Se estiver a 1 bloco (adjacente), o tiro é imediato
  if (Math.max(dx, dy) <= 1) return true;

  // Para distância de 2 blocos, verifica a célula intermediária
  const midX = Math.round((x1 + x2) / 2);
  const midY = Math.round((y1 + y2) / 2);

  if (isCityBuilding(midX, midY)) return false;

  return true;
}

/**
 * Verifica se a célula está ocupada por outro herói que já está estacionado e atirando,
 * ou por um zumbi/boss, impedindo que este herói pare nela como ponto final de tiro.
 * REGRA OFICIAL DO USUÁRIO:
 * "os herois nao podem travar em locais podendo passar um pelo outro mas nao pararem no mesmo local,
 *  podem passar tambem pelos zumbis mas nao parar no mesmo local que eles, isso faz eles cruzarem pela mesma celula e nao travarem"
 */
export function isCellOccupiedForStop(x, y, heroId, allMiners = [], grid = null) {
  // Outro herói ativo que já está estacionado e atirando nesta célula
  const hasHeroStationed = allMiners.some(o => 
    o.id !== heroId && 
    (o.status === 'work' || !o.status) && 
    o.isMining && 
    Math.round(o.x) === x && 
    Math.round(o.y) === y
  );
  if (hasHeroStationed) return true;

  // Zumbi ou Boss nesta célula
  if (grid && grid[y] && (grid[y][x] === BLOCK_ZOMBIE || grid[y][x] === BLOCK_BOSS)) {
    return true;
  }
  return false;
}
export function findNearestFreeHeroCell(hx, hy, heroId, allMiners = [], grid = null, isCanyon = true, enemies = []) {
  const GRID_COLS = grid && grid[0] ? grid[0].length : 15;
  const GRID_ROWS = grid ? grid.length : 11;
  const visited = new Set([`${hx},${hy}`]);
  const queue = [{ x: hx, y: hy, dist: 0 }];

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
      if (isCityBuilding(nb.x, nb.y) || isSolidTerrain(nb.x, nb.y, grid, isCanyon)) continue;

      // REGRA OFICIAL DO USUÁRIO: "Anti-Stacking de personagens tbm"
      // Nenhum outro herói pode estar nesta célula
      const isOccupiedByHero = allMiners.some(o => 
        o.id !== heroId && 
        (o.status === 'work' || !o.status) && 
        Math.round(o.x) === nb.x && 
        Math.round(o.y) === nb.y
      );
      if (isOccupiedByHero) {
        queue.push({ x: nb.x, y: nb.y, dist: cur.dist + 1 });
        continue;
      }

      // Nenhum bloco ou zumbi pode estar nessa célula
      if (grid && grid[nb.y] && grid[nb.y][nb.x] !== BLOCK_EMPTY) {
        queue.push({ x: nb.x, y: nb.y, dist: cur.dist + 1 });
        continue;
      }

      if (enemies && enemies.some(e => e.hp > 0 && e.gx === nb.x && e.gy === nb.y)) {
        queue.push({ x: nb.x, y: nb.y, dist: cur.dist + 1 });
        continue;
      }

      return { x: nb.x, y: nb.y };
    }
  }

  return null;
}

/**
 * Encontra a melhor ação e o próximo passo para o herói minerador.
 * 1. Se estiver no raio de combate (distância <= 2 com linha de tiro limpa), passa a atirar imediatamente.
 * 2. REGRA OFICIAL DO USUÁRIO: "quando jogadores nao acham zumbs perto devem verificar no mapa onde tem zumbis e ir ate eles"
 *    Localiza todos os zumbis e o Boss no mapa e marcha pelo menor caminho contornando prédios e base.
 */
export function findNextHeroAction(miner, grid, allMiners = [], isCanyon = true, activeEnemies = []) {
  // REGRA OFICIAL DO USUÁRIO: "e se quebrar interrompe a mineração"
  if (miner.durability !== undefined && miner.durability <= 0) {
    return { action: 'broken', reason: 'weapon_broken' };
  }

  const mx = Math.max(1, Math.min(GRID_COLS - 2, Math.round(miner.x)));
  const my = Math.max(1, Math.min(GRID_ROWS - 2, Math.round(miner.y)));

  // 1. Coleta todas as criaturas ativas restantes no mapa (Zumbis e Boss)
  // Utiliza as entidades dinâmicas de activeEnemies (se fornecidas) e complementa com o grid
  const targetMap = new Map();
  if (Array.isArray(activeEnemies) && activeEnemies.length > 0) {
    activeEnemies.forEach(e => {
      if (e.hp === undefined || e.hp > 0) {
        const k = `${e.gx},${e.gy}`;
        targetMap.set(k, { x: e.gx, y: e.gy, isBoss: e.type === 'boss', id: e.id });
      }
    });
  }

  // Complementa com blocos de zumbis/boss ativos no grid
  for (let r = 1; r < GRID_ROWS - 1; r++) {
    for (let c = 1; c < GRID_COLS - 1; c++) {
      const b = grid[r] ? grid[r][c] : BLOCK_EMPTY;
      if (b === BLOCK_ZOMBIE || b === BLOCK_BOSS || (b !== BLOCK_EMPTY && b !== BLOCK_BEDROCK)) {
        const k = `${c},${r}`;
        if (!targetMap.has(k)) {
          targetMap.set(k, { x: c, y: r, isBoss: b === BLOCK_BOSS });
        }
      }
    }
  }

  const activeTargets = Array.from(targetMap.values());

  // Se não há criaturas ativas em nenhum lugar do mapa
  if (activeTargets.length === 0) {
    return { action: 'idle' };
  }

  // REGRA OFICIAL DO USUÁRIO:
  // "os herois nao podem travar em locais podendo passar um pelo outro mas nao pararem no mesmo local,
  //  podem passar tambem pelos zumbis mas nao parar no mesmo local que eles, isso faz eles cruzarem pela mesma celula e nao travarem"
  const isCurrentCellOccupied = isCellOccupiedForStop(mx, my, miner.id, allMiners, grid);

  // ============================================================================
  // ÂNCORA FIRME DE COMBATE (ANTI PING-PONG / NÃO TROCA DE LUGAR):
  // Se este herói já está em combate ativo (isMining) e seu alvo ainda existe e está
  // no alcance de tiro com linha de visão, ele PERMANECE FIRME ATIRANDO!
  // ============================================================================
  if (miner.isMining && miner.targetBlock) {
    const target = activeTargets.find(t => t.x === miner.targetBlock.x && t.y === miner.targetBlock.y);
    if (target) {
      const dist = Math.abs(target.x - mx) + Math.abs(target.y - my);
      if (dist <= COMBAT_RANGE && hasClearLineOfSight(mx, my, target.x, target.y)) {
        const targetDir = target.x < mx ? -1 : (target.x > mx ? 1 : (miner.targetDir || 1));
        return {
          action: 'mine',
          targetBlock: { x: target.x, y: target.y },
          targetDir
        };
      }
    }
  }

  // ============================================================================
  // REGRA OFICIAL DO USUÁRIO:
  // "quando o boss aparece todos os herois devem caminhar para perto dele e atacalo"
  // ============================================================================
  const activeBoss = activeTargets.find(t => t.isBoss);

  // Combate imediato contra o Boss se já estiver no raio de tiro
  if (activeBoss && !isCurrentCellOccupied) {
    const distToBoss = Math.abs(activeBoss.x - mx) + Math.abs(activeBoss.y - my);
    if (distToBoss <= COMBAT_RANGE && hasClearLineOfSight(mx, my, activeBoss.x, activeBoss.y)) {
      const targetDir = activeBoss.x < mx ? -1 : (activeBoss.x > mx ? 1 : (miner.targetDir || 1));
      return {
        action: 'mine',
        targetBlock: { x: activeBoss.x, y: activeBoss.y },
        targetDir
      };
    }
  }

  // Combate imediato contra qualquer zumbi no raio tático
  if (!activeBoss && !isCurrentCellOccupied) {
    const inRangeTargets = activeTargets
      .map(t => ({
        ...t,
        dist: Math.abs(t.x - mx) + Math.abs(t.y - my)
      }))
      .filter(t => t.dist <= COMBAT_RANGE && hasClearLineOfSight(mx, my, t.x, t.y))
      .sort((a, b) => a.dist - b.dist);

    if (inRangeTargets.length > 0) {
      const chosen = inRangeTargets[0];
      const targetDir = chosen.x < mx ? -1 : (chosen.x > mx ? 1 : (miner.targetDir || 1));
      return {
        action: 'mine',
        targetBlock: { x: chosen.x, y: chosen.y },
        targetDir
      };
    }
  }

  // ============================================================================
  // REGRA OFICIAL DO USUÁRIO:
  // "quando jogadores nao acham zumbs perto devem verificar no mapa onde tem zumbis e ir ate eles"
  // ============================================================================
  const targetCrowdMap = {};
  allMiners.forEach(m => {
    if (m.id !== miner.id && m.targetBlock) {
      const key = `${m.targetBlock.x},${m.targetBlock.y}`;
      targetCrowdMap[key] = (targetCrowdMap[key] || 0) + 1;
    }
  });

  // Busca em Largura (BFS) em malha completa para encontrar a melhor rota nas ruas/gramados
  const queue = [{ x: mx, y: my, path: [] }];
  const visited = new Set([`${mx},${my}`]);

  let bestCandidate = null;
  let fallbackCandidate = null;

  while (queue.length > 0) {
    const curr = queue.shift();

    if (activeBoss) {
      const distToBoss = Math.abs(activeBoss.x - curr.x) + Math.abs(activeBoss.y - curr.y);
      const isSpotOccupied = curr.path.length > 0 && isCellOccupiedForStop(curr.x, curr.y, miner.id, allMiners, grid);
      const canShootBoss = distToBoss <= COMBAT_RANGE && hasClearLineOfSight(curr.x, curr.y, activeBoss.x, activeBoss.y);

      if (canShootBoss && curr.path.length > 0) {
        if (!isSpotOccupied) {
          bestCandidate = {
            target: activeBoss,
            nextStep: curr.path[0],
            pathLength: curr.path.length
          };
          break; // Rota ideal até posição livre de tiro contra o Boss encontrada
        } else if (!fallbackCandidate) {
          fallbackCandidate = {
            target: activeBoss,
            nextStep: curr.path[0],
            pathLength: curr.path.length
          };
        }
      }
    } else {
      const isSpotOccupied = curr.path.length > 0 && isCellOccupiedForStop(curr.x, curr.y, miner.id, allMiners, grid);
      const reachableTarget = activeTargets.find(t => {
        const d = Math.abs(t.x - curr.x) + Math.abs(t.y - curr.y);
        return d <= COMBAT_RANGE && hasClearLineOfSight(curr.x, curr.y, t.x, t.y);
      });

      if (reachableTarget && curr.path.length > 0) {
        const key = `${reachableTarget.x},${reachableTarget.y}`;
        const crowd = targetCrowdMap[key] || 0;
        const score = curr.path.length + crowd * 1.5;

        if (!isSpotOccupied) {
          if (!bestCandidate || score < bestCandidate.score) {
            bestCandidate = {
              target: reachableTarget,
              nextStep: curr.path[0],
              pathLength: curr.path.length,
              score
            };
            if (crowd === 0 && curr.path.length <= 4) {
              break;
            }
          }
        } else if (!fallbackCandidate || score < fallbackCandidate.score) {
          fallbackCandidate = {
            target: reachableTarget,
            nextStep: curr.path[0],
            pathLength: curr.path.length,
            score
          };
        }
      }
    }

    // Exploração nas 4 direções cardinais com variação determinística baseada no ID do herói
    const idOffset = (typeof miner.id === 'string' ? miner.id.charCodeAt(miner.id.length - 1) : (Number(miner.id) || 0)) % 4;
    const baseMoves = [
      { x: curr.x + 1, y: curr.y, dir: 1 },
      { x: curr.x, y: curr.y + 1, dir: miner.targetDir || 1 },
      { x: curr.x - 1, y: curr.y, dir: -1 },
      { x: curr.x, y: curr.y - 1, dir: miner.targetDir || 1 }
    ];
    const nextMoves = baseMoves.slice(idOffset).concat(baseMoves.slice(0, idOffset));

    for (const m of nextMoves) {
      const key = `${m.x},${m.y}`;
      if (!visited.has(key) && !isSolidTerrain(m.x, m.y, grid, isCanyon)) {
        visited.add(key);
        queue.push({
          x: m.x,
          y: m.y,
          path: [...curr.path, { x: m.x, y: m.y, dir: m.dir }]
        });
      }
    }
  }

  const chosenCandidate = bestCandidate || fallbackCandidate;
  if (chosenCandidate && chosenCandidate.nextStep) {
    return {
      action: 'move',
      nextStep: chosenCandidate.nextStep,
      targetDeposit: chosenCandidate.target,
      pathLength: chosenCandidate.pathLength
    };
  }

  // 5. Rota Global Direcionada: se o herói estiver muito distante e a busca ampla não encerrou um ponto livre,
  // localiza o zumbi mais próximo no mapa e caminha diretamente pela malha viária em direção a ele
  let closestTarget = null;
  let minDist = Infinity;
  for (const t of activeTargets) {
    const dist = Math.hypot(t.x - mx, t.y - my);
    if (dist < minDist) {
      minDist = dist;
      closestTarget = t;
    }
  }

  if (closestTarget) {
    const directQueue = [{ x: mx, y: my, path: [] }];
    const directVisited = new Set([`${mx},${my}`]);
    while (directQueue.length > 0) {
      const curr = directQueue.shift();
      const dist = Math.abs(closestTarget.x - curr.x) + Math.abs(closestTarget.y - curr.y);
      if (dist <= COMBAT_RANGE && curr.path.length > 0) {
        return {
          action: 'move',
          nextStep: curr.path[0],
          targetDeposit: closestTarget,
          pathLength: curr.path.length
        };
      }
      for (const m of [
        { x: curr.x + 1, y: curr.y, dir: 1 },
        { x: curr.x - 1, y: curr.y, dir: -1 },
        { x: curr.x, y: curr.y + 1, dir: 1 },
        { x: curr.x, y: curr.y - 1, dir: -1 }
      ]) {
        const k = `${m.x},${m.y}`;
        if (!directVisited.has(k) && !isSolidTerrain(m.x, m.y, grid, isCanyon)) {
          directVisited.add(k);
          directQueue.push({ x: m.x, y: m.y, path: [...curr.path, m] });
        }
      }
    }
  }

  return { action: 'idle' };
}

/**
 * Localiza posições táticas válidas, livres e desobstruídas ao redor do Boss para o transporte automático dos heróis.
 * - Prioriza o raio de combate COMBAT_RANGE (1 a 2 células, expandindo suavemente até 3 ou 4 se necessário)
 * - Evita colisão com prédios, abrigo médico, rocha matriz e o próprio Boss
 * - Garante linha de tiro desobstruída (Line of Sight)
 * - Garante que cada herói transportado receba uma célula distinta sem sobreposição
 */
export function getValidCombatPositionsAroundBoss(bossX, bossY, count, grid, existingMiners = []) {
  const bx = Math.round(bossX);
  const by = Math.round(bossY);
  const candidates = [];

  for (let d = 1; d <= 4; d++) {
    for (let dy = -d; dy <= d; dy++) {
      for (let dx = -d; dx <= d; dx++) {
        if (Math.abs(dx) + Math.abs(dy) === d) {
          const tx = bx + dx;
          const ty = by + dy;
          if (tx >= 1 && tx < GRID_COLS - 1 && ty >= 1 && ty < GRID_ROWS - 1) {
            if (!isCityBuilding(tx, ty) && !isBaseCompound(tx, ty) && !(tx === bx && ty === by)) {
              const b = grid && grid[ty] ? grid[ty][tx] : BLOCK_EMPTY;
              if (b !== BLOCK_BEDROCK) {
                if (hasClearLineOfSight(tx, ty, bx, by)) {
                  candidates.push({ x: tx, y: ty, dist: d });
                }
              }
            }
          }
        }
      }
    }
  }

  // Ordena por menor distância até o Boss
  candidates.sort((a, b) => a.dist - b.dist);

  const assigned = [];
  const usedCoords = new Set();

  // Registra células de outros heróis fixos que não serão substituídos/movidos
  existingMiners.forEach(m => {
    if (m && m.status === 'work' && typeof m.x === 'number') {
      usedCoords.add(`${Math.round(m.x)},${Math.round(m.y)}`);
    }
  });

  for (const c of candidates) {
    const key = `${c.x},${c.y}`;
    if (!usedCoords.has(key)) {
      usedCoords.add(key);
      assigned.push({ x: c.x, y: c.y });
      if (assigned.length >= count) break;
    }
  }

  // Fallback caso a quantidade solicitada seja maior que os espaços estritamente únicos
  let fallbackIdx = 0;
  while (assigned.length < count && candidates.length > 0) {
    const c = candidates[fallbackIdx % candidates.length];
    assigned.push({ x: c.x, y: c.y });
    fallbackIdx++;
  }

  return assigned;
}
