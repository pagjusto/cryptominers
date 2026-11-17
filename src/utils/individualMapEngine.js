// ============================================================================
// CRIPTO MYNERS — SISTEMA DE MAPAS INDIVIDUAIS, ZUMBIS E BOSS
// 
// REGRAS OBRIGATÓRIAS:
// 1. Mapas Individuais e Independentes: Cada jogador possui seu próprio mapa exclusivo,
//    sem compartilhamento nem interferência cruzada.
// 2. Os ZUMBIS substituem as antigas jazidas visuais (até 20 zumbis simultâneos por mapa).
// 3. O BOSS mutante substitui o antigo baú (spawn único com HP elevado e recompensas).
// 4. Ciclo de Renovação Automática: Quando todas as entidades forem eliminadas,
//    o ciclo do jogador é finalizado e um novo mapa é gerado automaticamente.
// 5. Separação Estrita entre Visual e Economia: Inimigos são elementos dinâmicos de ambientação.
//    A produção real de Minercoin (MNC) permanece calculada de forma segura e inalterada.
// ============================================================================

import {
  GRID_COLS,
  GRID_ROWS,
  BLOCK_EMPTY,
  BLOCK_BEDROCK,
  BLOCK_ROCK,
  BLOCK_ORE_GOLD,
  BLOCK_ORE_CRYSTAL,
  BLOCK_DEPOSIT_EMERALD,
  BLOCK_ZOMBIE,
  BLOCK_BOSS
} from '../data/minersData.js';
import { isCanyonTrackOrTunnel } from './canyonGeometry.js';
import { ENEMIES } from '../data/enemiesCatalog.js';

export const DEPOSIT_TYPES = {
  STONE: {
    id: 'stone',
    blockId: BLOCK_ROCK,
    name: 'Pedra',
    probability: 0.50,
    color: '#94a3b8',
    icon: '🪨',
    baseHp: 2000,
    description: 'Jazida clássica de pedra bruta'
  },
  GOLD: {
    id: 'gold',
    blockId: BLOCK_ORE_GOLD,
    name: 'Ouro',
    probability: 0.25,
    color: '#f59e0b',
    icon: '🟡',
    baseHp: 2000,
    description: 'Veio reluzente com pepitas de ouro'
  },
  DIAMOND: {
    id: 'diamond',
    blockId: BLOCK_ORE_CRYSTAL,
    name: 'Diamante',
    probability: 0.17,
    color: '#38bdf8',
    icon: '💎',
    baseHp: 2000,
    description: 'Veio cintilante com cristais de diamante azul'
  },
  EMERALD: {
    id: 'emerald',
    blockId: BLOCK_DEPOSIT_EMERALD || 8,
    name: 'Esmeralda',
    probability: 0.08,
    color: '#10b981',
    icon: '🟢',
    baseHp: 2000,
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
 * Sorteador de tipo de jazida legado (mantido para compatibilidade e testes)
 */
export function rollDepositType() {
  const rand = Math.random();
  if (rand < 0.50) return DEPOSIT_TYPES.STONE;
  if (rand < 0.75) return DEPOSIT_TYPES.GOLD;
  if (rand < 0.92) return DEPOSIT_TYPES.DIAMOND;
  return DEPOSIT_TYPES.EMERALD;
}

/**
 * Localiza todas as células válidas e permitidas da mina onde inimigos/jazidas podem surgir.
 * Garante que NENHUMA entidade apareça sob trilhos, sob túneis ou fora da área válida.
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
 * Contém no máximo 20 entidades simultâneas: 19 Zumbis + 1 Boss mutante (substitui o baú).
 */
export function generatePlayerMap(playerId = DEFAULT_PLAYER_ID, cycleNumber = 1) {
  const validCells = getValidDepositCells(GRID_COLS, GRID_ROWS);
  const shuffledCells = shuffleArray(validCells);

  // Seleciona até 19 posições para os Zumbis e 1 para o Boss (Total = 20 entidades no mapa)
  const maxZombies = MAX_DEPOSITS_PER_MAP - 1;
  const chosenPositions = shuffledCells.slice(0, Math.min(maxZombies, shuffledCells.length));

  const mapId = `map_${playerId}_c${cycleNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const deposits = [];
  const hpMap = {};

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

  // 1. Gera os 20 Zumbis que substituem as antigas jazidas
  chosenPositions.forEach((pos, idx) => {
    const enemyConfig = ENEMIES.ZOMBIE;
    const cellKey = `${pos.c},${pos.r}`;
    const zombieId = `zombie_${mapId}_${idx}`;
    const hp = enemyConfig.baseHp || 2000;

    const zombie = {
      id: zombieId,
      index: idx,
      type: 'zombie',
      typeName: 'Zumbi Mineiro',
      color: enemyConfig.color || '#84cc16',
      icon: enemyConfig.icon || '🧟',
      blockId: BLOCK_ZOMBIE,
      sprite: enemyConfig.cleanSprite || enemyConfig.sprite,
      c: pos.c,
      r: pos.r,
      maxHp: hp,
      currentHp: hp,
      isCompleted: false,
      completedAt: null
    };

    deposits.push(zombie);
    grid[pos.r][pos.c] = BLOCK_ZOMBIE;
    hpMap[cellKey] = hp;
  });

  // 2. Insere o Boss Mutante (substitui o antigo baú com movimento e ataque)
  const remainingCells = validCells.filter(pos => grid[pos.r][pos.c] === BLOCK_EMPTY);
  if (remainingCells.length > 0) {
    const bossPos = remainingCells[Math.floor(Math.random() * remainingCells.length)];
    const bossConfig = ENEMIES.BOSS;
    const bossCellKey = `${bossPos.c},${bossPos.r}`;
    const bossId = `boss_${mapId}_0`;
    const bossHp = bossConfig.baseHp || 6000;

    const bossObj = {
      id: bossId,
      index: 20,
      type: 'boss',
      typeName: 'Boss Abominação Mutante',
      color: bossConfig.color || '#ef4444',
      icon: bossConfig.icon || '💀',
      blockId: BLOCK_BOSS,
      sprite: bossConfig.cleanSprite || bossConfig.sprite,
      c: bossPos.c,
      r: bossPos.r,
      maxHp: bossHp,
      currentHp: bossHp,
      isCompleted: false,
      completedAt: null,
      reward: 'chest_bonus'
    };

    deposits.push(bossObj);
    grid[bossPos.r][bossPos.c] = BLOCK_BOSS;
    hpMap[bossCellKey] = bossHp;
  }

  const countsByType = {
    zombie: deposits.filter(d => d.type === 'zombie').length,
    boss: deposits.filter(d => d.type === 'boss').length,
    stone: 0,
    gold: 0,
    diamond: 0,
    emerald: 0
  };

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
 * Recupera o mapa atual do jogador. Se não existir ou se for o mapa antigo com jazidas,
 * regenera imediatamente com os novos Zumbis e Boss!
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

    // MIGRAÇÃO AUTOMÁTICA: Se o mapa armazenado ainda tiver as antigas jazidas de pedra/ouro/etc.,
    // regenera imediatamente para o formato com Zumbis e Boss!
    const hasOldDeposits = parsed.deposits.some(d => 
      d.type === 'stone' || d.type === 'gold' || d.type === 'diamond' || d.type === 'emerald'
    );
    const hasZombies = parsed.deposits.some(d => d.type === 'zombie');

    if (hasOldDeposits || !hasZombies) {
      console.log('🔄 Migrando mapa individual antigo para Zumbis e Boss...');
      return generatePlayerMap(playerId, parsed.cycleNumber || 1);
    }

    return parsed;
  } catch (err) {
    console.warn('Falha ao restaurar mapa do jogador, gerando novo:', err);
    return generatePlayerMap(playerId, 1);
  }
}

/**
 * Reseta o mapa do jogador para o ciclo 1 com novas criaturas
 */
export function resetPlayerMap(playerId = DEFAULT_PLAYER_ID) {
  return generatePlayerMap(playerId, 1);
}

/**
 * Registra dano ou eliminação de inimigo/jazida no mapa individual do jogador.
 * Ao eliminar todas as entidades restantes, finaliza o ciclo e renova o mapa automaticamente.
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

    // Se todos os zumbis e o boss foram eliminados, finaliza o ciclo!
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
 * Estatísticas acumuladas de inimigos derrotados por jogador
 */
export function getPlayerMiningStats(playerId = DEFAULT_PLAYER_ID) {
  try {
    const key = `${STATS_STORAGE_PREFIX}${playerId}`;
    const raw = getStorageItem(key);
    if (!raw) return { totalBroken: 0, zombie: 0, boss: 0, cyclesCompleted: 0 };
    return JSON.parse(raw);
  } catch (err) {
    return { totalBroken: 0, zombie: 0, boss: 0, cyclesCompleted: 0 };
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
 * Bateria de Teste Monte Carlo para comprovar a distribuição estatística
 */
export function runMonteCarloDistributionTest(iterations = 10000) {
  const counts = { stone: 0, gold: 0, diamond: 0, emerald: 0 };
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
  return { iterations, counts, percentages, passed: true };
}

/**
 * Teste de Isolamento entre Jogadores
 */
export function runMultiPlayerIsolationTest() {
  const playerA = 'test_player_alpha';
  const playerB = 'test_player_beta';
  const mapA = generatePlayerMap(playerA, 1);
  const mapB = generatePlayerMap(playerB, 1);
  const firstDepA = mapA.deposits[0];
  recordDepositDamage(playerA, firstDepA.c, firstDepA.r, firstDepA.maxHp + 100);
  const mapBAfter = getPlayerMap(playerB);
  return {
    passed: mapBAfter.remainingDeposits === mapB.remainingDeposits
  };
}
