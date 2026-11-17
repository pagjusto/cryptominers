// ============================================================================
// CRIPTO MYNERS — SISTEMA DE MAPAS INDIVIDUAIS E JAZIDAS
// 
// REGRAS OBRIGATÓRIAS:
// 1. Mapas Individuais e Independentes: Cada jogador possui seu próprio mapa exclusivo,
//    sem compartilhamento nem interferência cruzada.
// 2. Máximo de 20 jazidas visíveis simultaneamente por mapa.
// 3. Distribuição percentual oficial das jazidas geradas:
//    - Pedra: 50%
//    - Ouro: 25%
//    - Diamante: 17%
//    - Esmeralda: 8%
//    Total: 100%
// 4. Ciclo de Renovação Automática: Quando todas as 20 jazidas forem eliminadas,
//    o ciclo do jogador é finalizado e um novo mapa é gerado automaticamente.
// 5. Jazidas Estritamente Visuais: Elementos cosméticos de ambientação.
//    NÃO representam recursos coletáveis, não possuem inventário próprio e NÃO
//    alteram a taxa de produção real de Minercoin (MNC).
// ============================================================================

import {
  GRID_COLS,
  GRID_ROWS,
  BLOCK_EMPTY,
  BLOCK_BEDROCK,
  BLOCK_ROCK,
  BLOCK_ORE_GOLD,
  BLOCK_ORE_CRYSTAL,
  BLOCK_DEPOSIT_EMERALD
} from '../data/minersData.js';
import { isCanyonTrackOrTunnel } from './canyonGeometry.js';

export const DEPOSIT_TYPES = {
  STONE: {
    id: 'stone',
    blockId: BLOCK_ROCK, // 2
    name: 'Pedra',
    probability: 0.50, // 50%
    color: '#94a3b8',
    icon: '🪨',
    baseHp: 2000, // Regra 7.0: Todas as jazidas possuem o mesmo tempo visual de mineração
    description: 'Jazida clássica de pedra bruta e ardósia cinza'
  },
  GOLD: {
    id: 'gold',
    blockId: BLOCK_ORE_GOLD, // 5
    name: 'Ouro',
    probability: 0.25, // 25%
    color: '#f59e0b',
    icon: '🟡',
    baseHp: 2000, // Regra 7.0: Todas as jazidas possuem o mesmo tempo visual de mineração
    description: 'Veio reluzente com pepitas de ouro amarelo'
  },
  DIAMOND: {
    id: 'diamond',
    blockId: BLOCK_ORE_CRYSTAL, // 4
    name: 'Diamante',
    probability: 0.17, // 17%
    color: '#38bdf8',
    icon: '💎',
    baseHp: 2000, // Regra 7.0: Todas as jazidas possuem o mesmo tempo visual de mineração
    description: 'Veio cintilante com cristais de diamante azul safira'
  },
  EMERALD: {
    id: 'emerald',
    blockId: BLOCK_DEPOSIT_EMERALD || 8, // 8
    name: 'Esmeralda',
    probability: 0.08, // 8%
    color: '#10b981',
    icon: '🟢',
    baseHp: 2000, // Regra 7.0: Todas as jazidas possuem o mesmo tempo visual de mineração
    description: 'Veio raro com gemas verdes luminosas'
  }
};

export const MAX_DEPOSITS_PER_MAP = 20;
export const DEFAULT_PLAYER_ID = 'player_default';

const MAP_STORAGE_PREFIX = 'cripto_myners_player_map_';
const STATS_STORAGE_PREFIX = 'cripto_myners_player_stats_';

// Armazenamento em memória para ambiente de testes Node/Backend
const memoryStore = new Map();

function getStorageItem(key) {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }
  return memoryStore.get(key) || null;
}

function setStorageItem(key, value) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
    return;
  }
  memoryStore.set(key, value);
}

/**
 * Sorteador de tipo de jazida respeitando estritamente a distribuição oficial:
 * Pedra 50% (0.00 .. 0.50)
 * Ouro 25% (0.50 .. 0.75)
 * Diamante 17% (0.75 .. 0.92)
 * Esmeralda 8% (0.92 .. 1.00)
 */
export function rollDepositType() {
  const rand = Math.random();
  if (rand < 0.50) return DEPOSIT_TYPES.STONE;
  if (rand < 0.75) return DEPOSIT_TYPES.GOLD;
  if (rand < 0.92) return DEPOSIT_TYPES.DIAMOND;
  return DEPOSIT_TYPES.EMERALD;
}

/**
 * Localiza todas as células válidas e permitidas da mina onde jazidas podem surgir.
 * Garante que NENHUMA jazida apareça sob trilhos, sob túneis ou fora da área válida.
 */
export function getValidDepositCells(cols = GRID_COLS, rows = GRID_ROWS) {
  const validCells = [];

  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      // Pilares indestrutíveis padrão de xadrez
      if (r % 2 === 0 && c % 2 === 0) continue;

      // Trilhos e túnel da entrada no Cânion
      if (isCanyonTrackOrTunnel(c, r, cols, rows)) continue;

      // Área livre e permitida
      validCells.push({ c, r });
    }
  }

  return validCells;
}

/**
 * Algoritmo Fisher-Yates para embaralhamento seguro de posições
 */
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Gera um mapa individual completo para o jogador indicado.
 * Contém no máximo 20 jazidas distribuídas aleatoriamente.
 */
export function generatePlayerMap(playerId = DEFAULT_PLAYER_ID, cycleNumber = 1) {
  const validCells = getValidDepositCells(GRID_COLS, GRID_ROWS);
  const shuffledCells = shuffleArray(validCells);

  // Seleciona até 20 posições únicas sem colisão
  const chosenPositions = shuffledCells.slice(0, Math.min(MAX_DEPOSITS_PER_MAP, shuffledCells.length));

  const mapId = `map_${playerId}_c${cycleNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const deposits = [];
  const hpMap = {};
  const countsByType = {
    stone: 0,
    gold: 0,
    diamond: 0,
    emerald: 0
  };

  // Inicializa matriz grid com limites e vazios
  const grid = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    const row = [];
    for (let c = 0; c < GRID_COLS; c++) {
      if (r === 0 || r === GRID_ROWS - 1 || c === 0 || c === GRID_COLS - 1) {
        row.push(BLOCK_BEDROCK);
      } else if (r % 2 === 0 && c % 2 === 0) {
        row.push(BLOCK_BEDROCK);
      } else {
        row.push(BLOCK_EMPTY);
      }
    }
    grid.push(row);
  }

  // Gera as jazidas sorteadas para as posições selecionadas
  chosenPositions.forEach((pos, idx) => {
    const typeObj = rollDepositType();
    const cellKey = `${pos.c},${pos.r}`;
    const depositId = `dep_${mapId}_${idx}`;

    const deposit = {
      id: depositId,
      index: idx,
      type: typeObj.id,
      typeName: typeObj.name,
      color: typeObj.color,
      icon: typeObj.icon,
      blockId: typeObj.blockId,
      c: pos.c,
      r: pos.r,
      maxHp: typeObj.baseHp,
      currentHp: typeObj.baseHp,
      isCompleted: false,
      completedAt: null
    };

    deposits.push(deposit);
    countsByType[typeObj.id] = (countsByType[typeObj.id] || 0) + 1;

    // Atualiza grid e hpMap para compatibilidade total com o canvas e heróis
    grid[pos.r][pos.c] = typeObj.blockId;
    hpMap[cellKey] = typeObj.baseHp;
  });

  const mapState = {
    playerId,
    mapId,
    cycleNumber,
    createdAt: new Date().toISOString(),
    completedAt: null,
    totalDeposits: deposits.length,
    remainingDeposits: deposits.length,
    countsByType,
    deposits,
    grid,
    hpMap
  };

  savePlayerMap(playerId, mapState);
  return mapState;
}

/**
 * Salva o estado do mapa no armazenamento isolado do jogador
 */
export function savePlayerMap(playerId, mapState) {
  try {
    const key = `${MAP_STORAGE_PREFIX}${playerId || DEFAULT_PLAYER_ID}`;
    setStorageItem(key, JSON.stringify(mapState));
  } catch (err) {
    console.error('Erro ao salvar mapa individual do jogador:', err);
  }
}

/**
 * Recupera o mapa atual do jogador. Se não existir, gera o ciclo 1.
 */
export function getPlayerMap(playerId = DEFAULT_PLAYER_ID) {
  try {
    const key = `${MAP_STORAGE_PREFIX}${playerId || DEFAULT_PLAYER_ID}`;
    const raw = getStorageItem(key);
    if (!raw) {
      return generatePlayerMap(playerId, 1);
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.deposits || !parsed.grid || !parsed.hpMap) {
      return generatePlayerMap(playerId, 1);
    }
    return parsed;
  } catch (err) {
    console.warn('Falha ao restaurar mapa do jogador, gerando novo:', err);
    return generatePlayerMap(playerId, 1);
  }
}

/**
 * Reseta o mapa do jogador para o ciclo 1 com novas jazidas
 */
export function resetPlayerMap(playerId = DEFAULT_PLAYER_ID) {
  return generatePlayerMap(playerId, 1);
}

/**
 * Registra dano ou conclusão de jazida no mapa individual do jogador.
 * Ao eliminar a última jazida restante, finaliza o ciclo e renova o mapa automaticamente.
 */
export function recordDepositDamage(playerId = DEFAULT_PLAYER_ID, c, r, damage = 0) {
  const mapState = getPlayerMap(playerId);
  if (!mapState || !mapState.deposits) return null;

  const deposit = mapState.deposits.find(d => d.c === c && d.r === r && !d.isCompleted);
  if (!deposit) return null;

  const cellKey = `${c},${r}`;
  const newHp = Math.max(0, deposit.currentHp - damage);
  deposit.currentHp = newHp;
  mapState.hpMap[cellKey] = newHp;

  let isNowBroken = false;
  let cycleCompleted = false;
  let newMapState = null;

  if (newHp <= 0 && !deposit.isCompleted) {
    deposit.isCompleted = true;
    deposit.completedAt = new Date().toISOString();
    deposit.currentHp = 0;
    delete mapState.hpMap[cellKey];
    mapState.grid[r][c] = BLOCK_EMPTY;
    mapState.remainingDeposits = Math.max(0, mapState.remainingDeposits - 1);
    isNowBroken = true;

    // Registra estatísticas individuais do jogador
    incrementPlayerMiningStats(playerId, deposit.type);

    // Se todas as jazidas foram eliminadas (0 restantes), o ciclo é finalizado!
    const activeDeposits = mapState.deposits.filter(d => !d.isCompleted);
    if (activeDeposits.length === 0) {
      cycleCompleted = true;
      mapState.completedAt = new Date().toISOString();
      const nextCycle = (mapState.cycleNumber || 1) + 1;

      // Dispara evento global de ciclo concluído
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('cripto_myners_map_cycle_completed', {
          detail: {
            playerId,
            oldCycle: mapState.cycleNumber,
            nextCycle,
            timestamp: new Date().toISOString()
          }
        });
        window.dispatchEvent(event);
      }

      // Gera novo mapa imediatamente para o ciclo seguinte
      newMapState = generatePlayerMap(playerId, nextCycle);
      return {
        deposit,
        isNowBroken: true,
        cycleCompleted: true,
        oldCycle: mapState.cycleNumber,
        nextCycle,
        newMap: newMapState
      };
    }
  }

  savePlayerMap(playerId, mapState);

  return {
    deposit,
    isNowBroken,
    cycleCompleted: false,
    remainingDeposits: mapState.remainingDeposits,
    currentMap: mapState
  };
}

/**
 * Estatísticas acumuladas de jazidas mineradas por jogador
 */
export function getPlayerMiningStats(playerId = DEFAULT_PLAYER_ID) {
  try {
    const key = `${STATS_STORAGE_PREFIX}${playerId}`;
    const raw = getStorageItem(key);
    if (!raw) return { totalBroken: 0, stone: 0, gold: 0, diamond: 0, emerald: 0, cyclesCompleted: 0 };
    return JSON.parse(raw);
  } catch (err) {
    return { totalBroken: 0, stone: 0, gold: 0, diamond: 0, emerald: 0, cyclesCompleted: 0 };
  }
}

function incrementPlayerMiningStats(playerId, depositType) {
  try {
    const stats = getPlayerMiningStats(playerId);
    stats.totalBroken = (stats.totalBroken || 0) + 1;
    stats[depositType] = (stats[depositType] || 0) + 1;
    setStorageItem(`${STATS_STORAGE_PREFIX}${playerId}`, JSON.stringify(stats));
  } catch (err) {
    console.warn('Erro ao atualizar estatísticas do jogador:', err);
  }
}

/**
 * Bateria de Teste Monte Carlo para comprovar a distribuição estatística de 10.000 jazidas
 */
export function runMonteCarloDistributionTest(iterations = 10000) {
  const counts = {
    stone: 0,
    gold: 0,
    diamond: 0,
    emerald: 0
  };

  for (let i = 0; i < iterations; i++) {
    const rolled = rollDepositType();
    counts[rolled.id]++;
  }

  const percentages = {
    stone: parseFloat(((counts.stone / iterations) * 100).toFixed(2)),
    gold: parseFloat(((counts.gold / iterations) * 100).toFixed(2)),
    diamond: parseFloat(((counts.diamond / iterations) * 100).toFixed(2)),
    emerald: parseFloat(((counts.emerald / iterations) * 100).toFixed(2))
  };

  const expected = {
    stone: 50.0,
    gold: 25.0,
    diamond: 17.0,
    emerald: 8.0
  };

  const tolerance = 2.0; // Margem aceitável de 2% para N=10.000
  const passed = (
    Math.abs(percentages.stone - expected.stone) <= tolerance &&
    Math.abs(percentages.gold - expected.gold) <= tolerance &&
    Math.abs(percentages.diamond - expected.diamond) <= tolerance &&
    Math.abs(percentages.emerald - expected.emerald) <= tolerance
  );

  return {
    iterations,
    counts,
    percentages,
    expected,
    passed,
    tolerancePct: tolerance
  };
}

/**
 * Teste de Isolamento entre Jogadores:
 * Comprova que ações no Jogador A não afetam em hipótese alguma o Jogador B.
 */
export function runMultiPlayerIsolationTest() {
  const playerA = 'test_player_alpha';
  const playerB = 'test_player_beta';

  // 1. Gera mapas para ambos
  const mapA = generatePlayerMap(playerA, 1);
  const mapB = generatePlayerMap(playerB, 1);

  const initialRemainingA = mapA.remainingDeposits;
  const initialRemainingB = mapB.remainingDeposits;
  const initialDepositsB = JSON.stringify(mapB.deposits.map(d => ({ id: d.id, hp: d.currentHp })));

  // 2. Elimina a primeira jazida do Jogador A
  const firstDepA = mapA.deposits[0];
  recordDepositDamage(playerA, firstDepA.c, firstDepA.r, firstDepA.maxHp + 100);

  // 3. Lê o estado do Jogador B novamente
  const mapBAfter = getPlayerMap(playerB);
  const depositsBAfter = JSON.stringify(mapBAfter.deposits.map(d => ({ id: d.id, hp: d.currentHp })));

  const isolationMaintained = (
    mapBAfter.remainingDeposits === initialRemainingB &&
    depositsBAfter === initialDepositsB
  );

  // 4. Conclui todas as jazidas do Jogador A para verificar renovação isolada
  mapA.deposits.forEach(d => {
    recordDepositDamage(playerA, d.c, d.r, 99999);
  });

  const mapAAfterClearing = getPlayerMap(playerA);
  const mapBFinal = getPlayerMap(playerB);

  const cycleAdvanceIsolated = (
    mapAAfterClearing.cycleNumber === 2 &&
    mapBFinal.cycleNumber === 1
  );

  return {
    passed: isolationMaintained && cycleAdvanceIsolated,
    initialRemainingA,
    initialRemainingB,
    playerARenewedToCycle: mapAAfterClearing.cycleNumber,
    playerBStillInCycle: mapBFinal.cycleNumber,
    isolationMaintained
  };
}
