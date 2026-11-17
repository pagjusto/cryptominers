// ============================================================================
// CRIPTO MYNERS — SISTEMA DE NAVEGAÇÃO E BUSCA INTELIGENTE DE JAZIDAS (BFS)
// 
// Garante que nenhum herói fique "bobo" ou preso ao terminar de minerar.
// Quando a jazida atual é destruída, o herói busca a próxima jazida ativa
// em todo o mapa e navega pelo menor caminho até ela, contornando obstáculos.
// ============================================================================

import { GRID_COLS, GRID_ROWS, BLOCK_EMPTY, BLOCK_BEDROCK } from '../data/minersData.js';
import { isCityBuilding } from './cityMapGeometry.js';

/**
 * Determina se a célula contém um obstáculo intransponível para caminhada.
 * - Bordas do mapa (rocha matriz perimetral)
 * - Prédios e estruturas da cidade (zumbis e heróis NÃO podem subir nos prédios, somente ruas e grama)
 * - Jazidas e rochas sólidas (o herói para ao lado, não atravessa rocha ou obstáculos)
 */
export function isSolidTerrain(x, y, grid, isCanyon = true) {
  if (x <= 0 || x >= GRID_COLS - 1 || y <= 0 || y >= GRID_ROWS - 1) return true;

  // Prédios, ruínas e bases fortificadas da cidade
  if (isCityBuilding(x, y)) return true;

  // Jazidas, zumbis bloqueadores e rochas sólidas
  if (grid && grid[y] && grid[y][x] !== BLOCK_EMPTY) return true;

  return false;
}

/**
 * Encontra a melhor ação e o próximo passo para o herói minerador.
 * 1. Se já estiver adjacente a uma jazida ativa, passa a minerá-la imediatamente.
 * 2. Se não estiver, localiza a jazida mais próxima alcançável via BFS e dá o próximo passo.
 */
export function findNextHeroAction(miner, grid, allMiners = [], isCanyon = true) {
  const mx = Math.max(1, Math.min(GRID_COLS - 2, Math.round(miner.x)));
  const my = Math.max(1, Math.min(GRID_ROWS - 2, Math.round(miner.y)));

  const neighbors = [
    { x: mx, y: my - 1, dir: miner.targetDir || 1 },
    { x: mx + 1, y: my, dir: 1 },
    { x: mx, y: my + 1, dir: miner.targetDir || 1 },
    { x: mx - 1, y: my, dir: -1 }
  ];

  // 1. Verifica se já está encostado em uma jazida ativa que pode atacar agora
  const adjacentDeposit = neighbors.find(n => {
    if (n.x < 0 || n.x >= GRID_COLS || n.y < 0 || n.y >= GRID_ROWS) return false;
    const t = grid[n.y] ? grid[n.y][n.x] : BLOCK_EMPTY;
    return t !== BLOCK_EMPTY && t !== BLOCK_BEDROCK;
  });

  if (adjacentDeposit) {
    const targetDir = adjacentDeposit.x < mx ? -1 : (adjacentDeposit.x > mx ? 1 : (miner.targetDir || 1));
    return {
      action: 'mine',
      targetBlock: { x: adjacentDeposit.x, y: adjacentDeposit.y },
      targetDir
    };
  }

  // 2. Coleta todas as jazidas ativas restantes no mapa
  const activeDeposits = [];
  for (let r = 1; r < GRID_ROWS - 1; r++) {
    for (let c = 1; c < GRID_COLS - 1; c++) {
      const b = grid[r] ? grid[r][c] : BLOCK_EMPTY;
      if (b !== BLOCK_EMPTY && b !== BLOCK_BEDROCK) {
        activeDeposits.push({ x: c, y: r });
      }
    }
  }

  // Se não há mais jazidas, o mapa foi limpo
  if (activeDeposits.length === 0) {
    return { action: 'idle' };
  }

  // Contagem de outros mineradores focados em cada jazida para melhor distribuição da equipe
  const depositCrowdMap = {};
  allMiners.forEach(m => {
    if (m.id !== miner.id && m.targetBlock) {
      const key = `${m.targetBlock.x},${m.targetBlock.y}`;
      depositCrowdMap[key] = (depositCrowdMap[key] || 0) + 1;
    }
  });

  // 3. Busca em Largura (BFS) para encontrar a jazida mais acessível
  const queue = [{ x: mx, y: my, path: [] }];
  const visited = new Set();
  visited.add(`${mx},${my}`);

  let bestCandidate = null;

  while (queue.length > 0) {
    const curr = queue.shift();

    // Se este ponto está adjacente a uma jazida ativa
    const touchingDeposit = activeDeposits.find(d => 
      (Math.abs(d.x - curr.x) === 1 && d.y === curr.y) || 
      (Math.abs(d.y - curr.y) === 1 && d.x === curr.x)
    );

    if (touchingDeposit && curr.path.length > 0) {
      const key = `${touchingDeposit.x},${touchingDeposit.y}`;
      const crowd = depositCrowdMap[key] || 0;
      // Pondera distância + penalidade por aglomeração (distribui heróis por várias jazidas)
      const score = curr.path.length + crowd * 2.2;

      if (!bestCandidate || score < bestCandidate.score) {
        bestCandidate = {
          deposit: touchingDeposit,
          standPos: { x: curr.x, y: curr.y },
          nextStep: curr.path[0],
          pathLength: curr.path.length,
          score
        };

        // Se o primeiro encontrado não tem ninguém batendo, é a escolha ótima imediata
        if (crowd === 0) {
          break;
        }
      }
    }

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
      targetDeposit: bestCandidate.deposit,
      pathLength: bestCandidate.pathLength
    };
  }

  // Fallback de contingência: move para qualquer vizinho livre
  const openNeighbors = neighbors.filter(n => !isSolidTerrain(n.x, n.y, grid, isCanyon));
  if (openNeighbors.length > 0) {
    const next = openNeighbors[Math.floor(Math.random() * openNeighbors.length)];
    return { 
      action: 'move', 
      nextStep: { x: next.x, y: next.y, dir: next.dir } 
    };
  }

  return { action: 'idle' };
}
