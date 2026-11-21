// ============================================================================
// CRYPTOZOMBIES — SISTEMA DE NAVEGAÇÃO E COMBATE INTELIGENTE DOS HERÓIS (BFS)
// 
// Garante que nenhum herói fique "bobo" ou preso ao combater zumbis e o boss.
// 1. Raio de Combate Tático: Heróis com armas de fogo engajam a até 2 blocos de distância.
// 2. Linha de Tiro Desobstruída: Dispara contra zumbis com visão direta pelas ruas e gramados.
// 3. Perseguição Contínua: Navega pelo menor caminho contornando prédios e obstáculos.
// ============================================================================

import { GRID_COLS, GRID_ROWS, BLOCK_EMPTY, BLOCK_BEDROCK, BLOCK_ZOMBIE, BLOCK_BOSS } from '../data/minersData.js';
import { isCityBuilding } from './cityMapGeometry.js';

export const COMBAT_RANGE = 2; // Alcance tático de combate com armas de fogo (até 2 blocos de distância, incluindo diagonais)

/**
 * Determina se a célula contém um obstáculo intransponível para caminhada física:
 * - Bordas do mapa (rocha matriz perimetral)
 * - Prédios, ruínas, muros, barricadas, carros e outdoor da cidade
 * - Rocha matriz indestrutível
 */
export function isSolidTerrain(x, y, grid, isCanyon = true) {
  if (x <= 0 || x >= GRID_COLS - 1 || y <= 0 || y >= GRID_ROWS - 1) return true;

  // Prédios, ruínas, muros, cercas, veículos e outdoor da cidade
  if (isCityBuilding(x, y)) return true;

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
 * Verifica se a célula está ocupada por outro herói ou por um zumbi, impedindo que este herói pare nela.
 * REGRA OFICIAL DO USUÁRIO:
 * "os herois nao podem travar em locais podendo passar um pelo outro mas nao pararem no mesmo local,
 *  podem passar tambem pelos zumbis mas nao parar no mesmo local que eles, isso faz eles cruzarem pela mesma celula e nao travarem"
 */
export function isCellOccupiedForStop(x, y, heroId, allMiners = [], grid = null) {
  // Outro herói ativo parado/minerando nesta célula
  const hasHero = allMiners.some(o => 
    o.id !== heroId && 
    (o.status === 'work' || !o.status) && 
    Math.round(o.x) === x && 
    Math.round(o.y) === y
  );
  if (hasHero) return true;

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
 * 2. Se não estiver, localiza o zumbi mais próximo alcançável via BFS e avança em direção a ele.
 */
export function findNextHeroAction(miner, grid, allMiners = [], isCanyon = true) {
  // REGRA OFICIAL DO USUÁRIO: "e se quebrar interrompe a mineração"
  if (miner.durability !== undefined && miner.durability <= 0) {
    return { action: 'broken', reason: 'weapon_broken' };
  }

  const mx = Math.max(1, Math.min(GRID_COLS - 2, Math.round(miner.x)));
  const my = Math.max(1, Math.min(GRID_ROWS - 2, Math.round(miner.y)));

  // 1. Coleta todas as criaturas ativas restantes no mapa (Zumbis e Boss)
  const activeTargets = [];
  for (let r = 1; r < GRID_ROWS - 1; r++) {
    for (let c = 1; c < GRID_COLS - 1; c++) {
      const b = grid[r] ? grid[r][c] : BLOCK_EMPTY;
      if (b === BLOCK_ZOMBIE || b === BLOCK_BOSS || (b !== BLOCK_EMPTY && b !== BLOCK_BEDROCK)) {
        activeTargets.push({ x: c, y: r, isBoss: b === BLOCK_BOSS });
      }
    }
  }

  // Se não há criaturas ativas, o mapa está limpo
  if (activeTargets.length === 0) {
    return { action: 'idle' };
  }

  // REGRA OFICIAL DO USUÁRIO:
  // "os herois nao podem travar em locais podendo passar um pelo outro mas nao pararem no mesmo local,
  //  podem passar tambem pelos zumbis mas nao parar no mesmo local que eles, isso faz eles cruzarem pela mesma celula e nao travarem"
  // Se a célula atual (mx, my) já estiver ocupada por outro herói minerando/parado ou por um zumbi,
  // o herói NÃO pode parar aqui para atirar. Ele deve continuar se movendo para cruzar a célula!
  const isCurrentCellOccupied = isCellOccupiedForStop(mx, my, miner.id, allMiners, grid);

  // ============================================================================
  // REGRA OFICIAL DO USUÁRIO:
  // "quando o boss aparece todos os herois devem caminhar para perto dele e atacalo"
  // ============================================================================
  const activeBoss = activeTargets.find(t => t.isBoss);

  if (activeBoss) {
    // 1. O Boss é o alvo SUPREMO e PRIORITÁRIO de toda a equipe
    // Só entra em combate estático se a célula atual NÃO estiver sobreposta com outro herói/zumbi
    const distToBoss = Math.abs(activeBoss.x - mx) + Math.abs(activeBoss.y - my);
    if (!isCurrentCellOccupied && distToBoss <= COMBAT_RANGE && hasClearLineOfSight(mx, my, activeBoss.x, activeBoss.y)) {
      const targetDir = activeBoss.x < mx ? -1 : (activeBoss.x > mx ? 1 : (miner.targetDir || 1));
      return {
        action: 'mine',
        targetBlock: { x: activeBoss.x, y: activeBoss.y },
        targetDir
      };
    }

    // 2. Se o herói ainda não está no alcance de combate do Boss, todos devem marchar até ele!
    // Busca em Largura (BFS) focada exclusivamente em aproximar o herói do Boss
    const queue = [{ x: mx, y: my, path: [] }];
    const visited = new Set();
    visited.add(`${mx},${my}`);

    let bestCandidate = null;
    let closestNodeToBoss = null;
    let minDistanceToBoss = Infinity;

    while (queue.length > 0) {
      const curr = queue.shift();

      const distFromCurrToBoss = Math.hypot(activeBoss.x - curr.x, activeBoss.y - curr.y);
      if (curr.path.length > 0 && distFromCurrToBoss < minDistanceToBoss) {
        minDistanceToBoss = distFromCurrToBoss;
        closestNodeToBoss = curr;
      }

      // Posição de ataque 'curr' só é adotada se nenhum outro herói ou zumbi estiver estacionado nela
      const isSpotOccupied = curr.path.length > 0 && isCellOccupiedForStop(curr.x, curr.y, miner.id, allMiners, grid);

      const canShootBoss = !isSpotOccupied && 
        (Math.abs(activeBoss.x - curr.x) + Math.abs(activeBoss.y - curr.y) <= COMBAT_RANGE) && 
        hasClearLineOfSight(curr.x, curr.y, activeBoss.x, activeBoss.y);

      if (canShootBoss && curr.path.length > 0) {
        bestCandidate = {
          target: activeBoss,
          nextStep: curr.path[0],
          pathLength: curr.path.length,
          score: curr.path.length
        };
        break; // Encontrou a rota mais curta até a posição livre de disparo contra o Boss!
      }

      // Exploração nas 4 direções cardinais (heróis atravessam livremente outras entidades no caminho)
      const nextMoves = [
        { x: curr.x, y: curr.y - 1, dir: miner.targetDir || 1 },
        { x: curr.x + 1, y: curr.y, dir: 1 },
        { x: curr.x, y: curr.y + 1, dir: miner.targetDir || 1 },
        { x: curr.x - 1, y: curr.y, dir: -1 }
      ];

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

    if (bestCandidate && bestCandidate.nextStep) {
      return {
        action: 'move',
        nextStep: bestCandidate.nextStep,
        targetDeposit: activeBoss,
        pathLength: bestCandidate.pathLength
      };
    }

    if (closestNodeToBoss && closestNodeToBoss.path.length > 0) {
      return {
        action: 'move',
        nextStep: closestNodeToBoss.path[0],
        targetDeposit: activeBoss,
        pathLength: closestNodeToBoss.path.length
      };
    }
  }

  // 2. Se o herói já estava focado em um alvo e ele ainda existe e está no alcance com célula livre
  if (!isCurrentCellOccupied && miner.targetBlock) {
    const stillAlive = activeTargets.find(t => t.x === miner.targetBlock.x && t.y === miner.targetBlock.y);
    if (stillAlive) {
      const dist = Math.abs(stillAlive.x - mx) + Math.abs(stillAlive.y - my);
      if (dist <= COMBAT_RANGE && hasClearLineOfSight(mx, my, stillAlive.x, stillAlive.y)) {
        const targetDir = stillAlive.x < mx ? -1 : (stillAlive.x > mx ? 1 : (miner.targetDir || 1));
        return {
          action: 'mine',
          targetBlock: { x: stillAlive.x, y: stillAlive.y },
          targetDir
        };
      }
    }
  }

  // 3. Verifica se qualquer criatura ativa está no raio imediato (dist <= COMBAT_RANGE) em célula livre
  if (!isCurrentCellOccupied) {
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

  // 4. Mapeia aglomeração de heróis em cada alvo para distribuir o fogo da equipe
  const targetCrowdMap = {};
  allMiners.forEach(m => {
    if (m.id !== miner.id && m.targetBlock) {
      const key = `${m.targetBlock.x},${m.targetBlock.y}`;
      targetCrowdMap[key] = (targetCrowdMap[key] || 0) + 1;
    }
  });

  // 5. Busca em Largura (BFS) para encontrar a rota mais curta até a posição de combate mais próxima
  const queue = [{ x: mx, y: my, path: [] }];
  const visited = new Set();
  visited.add(`${mx},${my}`);

  let bestCandidate = null;

  while (queue.length > 0) {
    const curr = queue.shift();

    // REGRA OFICIAL DO USUÁRIO: "Anti-Stacking de personagens tbm"
    // Posição de ataque 'curr' só é adotada se nenhum outro herói ou zumbi estiver estacionado nela
    const isSpotOccupied = curr.path.length > 0 && isCellOccupiedForStop(curr.x, curr.y, miner.id, allMiners, grid);

    // Se a partir desta posição 'curr' é possível atirar em algum alvo ativo (dist <= COMBAT_RANGE e linha limpa)
    const reachableTarget = !isSpotOccupied ? activeTargets.find(t => {
      const d = Math.abs(t.x - curr.x) + Math.abs(t.y - curr.y);
      return d <= COMBAT_RANGE && hasClearLineOfSight(curr.x, curr.y, t.x, t.y);
    }) : null;

    if (reachableTarget && curr.path.length > 0) {
      const key = `${reachableTarget.x},${reachableTarget.y}`;
      const crowd = targetCrowdMap[key] || 0;
      // Pondera distância do trajeto + penalidade de aglomeração para espalhar os heróis pelo mapa
      const score = curr.path.length + crowd * 1.5;

      if (!bestCandidate || score < bestCandidate.score) {
        bestCandidate = {
          target: reachableTarget,
          nextStep: curr.path[0],
          pathLength: curr.path.length,
          score
        };

        // Se encontrou um alvo livre de aglomeração a uma distância curta, adota imediatamente
        if (crowd === 0 && curr.path.length <= 4) {
          break;
        }
      }
    }

    // Exploração nas 4 direções cardinais
    const nextMoves = [
      { x: curr.x, y: curr.y - 1, dir: miner.targetDir || 1 },
      { x: curr.x + 1, y: curr.y, dir: 1 },
      { x: curr.x, y: curr.y + 1, dir: miner.targetDir || 1 },
      { x: curr.x - 1, y: curr.y, dir: -1 }
    ];

    for (const m of nextMoves) {
      const key = `${m.x},${m.y}`;
      if (!visited.has(key) && !isSolidTerrain(m.x, m.y, grid, isCanyon)) {
        visited.add(key);
        // Regra Oficial do Usuário: heróis podem cruzar livremente pela mesma célula de outros heróis e zumbis
        queue.push({
          x: m.x,
          y: m.y,
          cost: (curr.cost || 0) + 1,
          path: [...curr.path, { x: m.x, y: m.y, dir: m.dir }]
        });
      }
    }
  }

  if (bestCandidate && bestCandidate.nextStep) {
    return {
      action: 'move',
      nextStep: bestCandidate.nextStep,
      targetDeposit: bestCandidate.target,
      pathLength: bestCandidate.pathLength
    };
  }

  // 6. Fallback Inteligente Direcional: se o BFS for muito longo, avança na direção do alvo mais próximo
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
    let candidates = [
      { x: mx + 1, y: my, dir: 1 },
      { x: mx - 1, y: my, dir: -1 },
      { x: mx, y: my + 1, dir: miner.targetDir || 1 },
      { x: mx, y: my - 1, dir: miner.targetDir || 1 }
    ].filter(pos => !isSolidTerrain(pos.x, pos.y, grid, isCanyon));

    if (candidates.length > 0) {
      // Prioriza candidatos livres para parar, mas permite cruzar por células com outros heróis ou zumbis
      candidates.sort((a, b) => {
        const occA = isCellOccupiedForStop(a.x, a.y, miner.id, allMiners, grid) ? 1 : 0;
        const occB = isCellOccupiedForStop(b.x, b.y, miner.id, allMiners, grid) ? 1 : 0;
        if (occA !== occB) return occA - occB;
        const distA = Math.hypot(closestTarget.x - a.x, closestTarget.y - a.y);
        const distB = Math.hypot(closestTarget.x - b.x, closestTarget.y - b.y);
        return distA - distB;
      });

      return {
        action: 'move',
        nextStep: candidates[0],
        targetDeposit: closestTarget
      };
    }
  }

  return { action: 'idle' };
}
