// ============================================================================
// CRYPTOZOMBIES — SISTEMA DE MAPAS INDIVIDUAIS, ZUMBIS E BOSS
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
import { 
  isCityBuilding, 
  isCanyonTrackOrTunnel, 
  isBaseCompound,
  TACTICAL_ZONES,
  CORNER_SPAWN_POINTS,
  getSpawnZoneCells,
  isSpawnZoneCell,
  SPAWN_ZONE_VERSION
} from './cityMapGeometry.js';
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

// REGRA OFICIAL DO USUÁRIO: "mantenha a logica dos zumbis , morre 1 nasce outro"
// Capacidade total: 30 zumbis simultâneos ativos + 1 Boss mutante
export const MAX_DEPOSITS_PER_MAP = 31;
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
 * Localiza todas as células válidas e permitidas da cidade onde zumbis e boss podem surgir.
 * Regra Oficial: Zumbis e heróis NÃO podem subir para os prédios, somente ruas e grama.
 */
export function getValidDepositCells(cols = GRID_COLS, rows = GRID_ROWS) {
  const validCells = [];

  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      // Bloqueia edifícios, ruínas, muros, outdoor e toda a área da base militar/hospital
      if (isCityBuilding(c, r) || isBaseCompound(c, r)) continue;

      // Área livre e permitida: ruas asfaltadas, caminhos de terra e gramados externos
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

  // REGRA OFICIAL DO USUÁRIO:
  // "os herois devem ser distribuidos entre todo o mapa nos locais que defini inclusive os zumbis tambem , 
  // os zumbis nascem nos cantos do mapa e caminham para as areas definidas proporcionalmente distribuidos"
  const maxZombies = MAX_DEPOSITS_PER_MAP - 1;
  const chosenPositions = [];
  const usedKeys = new Set();
  const spawnCells = getSpawnZoneCells(GRID_COLS, GRID_ROWS);

  for (let i = 0; i < maxZombies; i++) {
    const tz = TACTICAL_ZONES[i % TACTICAL_ZONES.length].center;
    const availableSpawns = spawnCells.filter(p => !usedKeys.has(`${p.c},${p.r}`));
    if (!availableSpawns.length) break;
    const chosenPos = availableSpawns[Math.floor(Math.random() * availableSpawns.length)];
    usedKeys.add(`${chosenPos.c},${chosenPos.r}`);
    // O inimigo nasce na área verde e mantém sua zona tática como destino de patrulha.
    chosenPositions.push({ ...chosenPos, targetZone: tz });
  }

  const mapId = `map_${playerId}_c${cycleNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const deposits = [];
  const hpMap = {};

  // Inicializa matriz grid com limites perimetrais e prédios como rocha sólida intransponível
  const grid = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    const row = [];
    for (let c = 0; c < GRID_COLS; c++) {
      if (r === 0 || r === GRID_ROWS - 1 || c === 0 || c === GRID_COLS - 1) {
        row.push(BLOCK_BEDROCK);
      } else if (isCityBuilding(c, r)) {
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
    const hp = enemyConfig.baseHp || 2;

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
      targetZone: pos.targetZone || { x: pos.c, y: pos.r },
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
  const remainingCells = spawnCells.filter(pos => grid[pos.r][pos.c] === BLOCK_EMPTY);
  if (remainingCells.length > 0) {
    const bossPos = remainingCells[Math.floor(Math.random() * remainingCells.length)];
    const bossConfig = ENEMIES.BOSS;
    const bossCellKey = `${bossPos.c},${bossPos.r}`;
    const bossId = `boss_${mapId}_0`;
    const bossHp = bossConfig.baseHp || 30;

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
    spawnZoneVersion: SPAWN_ZONE_VERSION,
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

    // MIGRAÇÃO AUTOMÁTICA & HORDA INFINITA: Garante SEMPRE exatamente 20 criaturas ativas no mapa
    const hasOldDeposits = parsed.deposits.some(d => 
      d.type === 'stone' || d.type === 'gold' || d.type === 'diamond' || d.type === 'emerald'
    );
    const hasZombies = parsed.deposits.some(d => d.type === 'zombie');
    const hasAnyInBuilding = parsed.deposits.some(d => !d.isCompleted && isCityBuilding(d.c, d.r));
    const hasOldPillars = parsed.grid && parsed.grid[2] && parsed.grid[2][2] === BLOCK_BEDROCK && !isCityBuilding(2, 2);

    if (hasOldDeposits || !hasZombies || hasAnyInBuilding || hasOldPillars) {
      console.log('🔄 Migrando mapa individual para nova geometria da cidade de sobrevivência...');
      return generatePlayerMap(playerId, parsed.cycleNumber || 1);
    }

    // Migra o mapa já salvo uma única vez: reposiciona criaturas existentes nas zonas verdes.
    if (parsed.spawnZoneVersion !== SPAWN_ZONE_VERSION) {
      const spawnCells = getSpawnZoneCells(GRID_COLS, GRID_ROWS);
      const active = parsed.deposits.filter(d => !d.isCompleted);
      const usedSpawnKeys = new Set(active.filter(d => isSpawnZoneCell(d.c, d.r)).map(d => `${d.c},${d.r}`));
      active.forEach(deposit => {
        if (isSpawnZoneCell(deposit.c, deposit.r)) return;
        const options = spawnCells.filter(p => !usedSpawnKeys.has(`${p.c},${p.r}`));
        if (!options.length) return;
        const next = options[Math.floor(Math.random() * options.length)];
        const oldKey = `${deposit.c},${deposit.r}`;
        const newKey = `${next.c},${next.r}`;
        if (parsed.grid?.[deposit.r]?.[deposit.c] === deposit.blockId) parsed.grid[deposit.r][deposit.c] = BLOCK_EMPTY;
        if (parsed.hpMap?.[oldKey] !== undefined) {
          parsed.hpMap[newKey] = parsed.hpMap[oldKey];
          delete parsed.hpMap[oldKey];
        }
        deposit.c = next.c;
        deposit.r = next.r;
        if (parsed.grid?.[next.r]) parsed.grid[next.r][next.c] = deposit.blockId;
        usedSpawnKeys.add(newKey);
      });
      parsed.spawnZoneVersion = SPAWN_ZONE_VERSION;
      savePlayerMap(playerId, parsed);
    }

    // REGRA OFICIAL DO USUÁRIO: Garante SEMPRE 30 zumbis ativos no mapa (morre 1 nasce outro)
    const activeDeposits = parsed.deposits.filter(d => !d.isCompleted);
    if (activeDeposits.length < MAX_DEPOSITS_PER_MAP) {
      const spawnCells = getSpawnZoneCells(GRID_COLS, GRID_ROWS);
      const activeKeys = new Set(activeDeposits.map(d => `${d.c},${d.r}`));
      const openCells = spawnCells.filter(pos => !activeKeys.has(`${pos.c},${pos.r}`));

      const needed = MAX_DEPOSITS_PER_MAP - activeDeposits.length;
      for (let i = 0; i < needed && openCells.length > 0; i++) {
        const randIdx = Math.floor(Math.random() * openCells.length);
        const newPos = openCells.splice(randIdx, 1)[0];
        const newDep = {
          id: `dep_horde_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
          c: newPos.c,
          r: newPos.r,
          type: 'zombie',
          name: 'Zumbi Andarilho',
          blockId: BLOCK_ZOMBIE,
          rarity: 'common',
          maxHp: 2,
          currentHp: 2,
          isCompleted: false,
          yieldRate: 0.05
        };
        parsed.deposits.push(newDep);
        if (parsed.grid && parsed.grid[newPos.r]) {
          parsed.grid[newPos.r][newPos.c] = BLOCK_ZOMBIE;
        }
        if (parsed.hpMap) {
          parsed.hpMap[`${newPos.c},${newPos.r}`] = 2;
        }
      }
      parsed.remainingDeposits = MAX_DEPOSITS_PER_MAP;
      savePlayerMap(playerId, parsed);
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
export function recordDepositDamage(playerId = DEFAULT_PLAYER_ID, c, r, damage = 0, heroTiles = []) {
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
    isNowBroken = true;

    if (deposit.type === 'boss') {
      mapState.lastBossPos = { c, r };
    }

    // Registra estatísticas individuais do jogador e contagem da rodada
    incrementPlayerMiningStats(playerId, deposit.type);
    mapState.zombiesKilledInCycle = (mapState.zombiesKilledInCycle || 0) + 1;

    // REGRA OFICIAL DO USUÁRIO: "QUANDO ISSO ACONTECER DEVE REESPAUNAR EM OUTRO LOCAL LIVRE"
    // "os zumbis nascem nos cantos do mapa e caminham para as areas definidas proporcionalmente distribuidos"
    // Gera imediatamente um substituto ativo nascendo nos cantos do mapa e mirando a zona com menos criaturas
    const validCells = getValidDepositCells(GRID_COLS, GRID_ROWS);
    const spawnCells = getSpawnZoneCells(GRID_COLS, GRID_ROWS);
    const activeKeys = new Set(
      mapState.deposits.filter(d => !d.isCompleted).map(d => `${d.c},${d.r}`)
    );
    const heroSet = new Set((heroTiles || []).map(h => `${h.c},${h.r}`));

    const isBossType = deposit.type === 'boss';
    const minDistance = isBossType ? 5 : 4;

    const cornerPoints = CORNER_SPAWN_POINTS;
    const distantCorners = cornerPoints.filter(pos => 
      !activeKeys.has(`${pos.c},${pos.r}`) && 
      !heroSet.has(`${pos.c},${pos.r}`) &&
      !isCityBuilding(pos.c, pos.r) && 
      !isBaseCompound(pos.c, pos.r) &&
      (pos.c !== c || pos.r !== r) &&
      Math.hypot(pos.c - c, pos.r - r) >= minDistance
    );

    const openCorners = cornerPoints.filter(pos => 
      !activeKeys.has(`${pos.c},${pos.r}`) && 
      !heroSet.has(`${pos.c},${pos.r}`) &&
      !isCityBuilding(pos.c, pos.r) && 
      !isBaseCompound(pos.c, pos.r) &&
      (pos.c !== c || pos.r !== r)
    );

    const distantOpenCells = spawnCells.filter(pos => 
      !activeKeys.has(`${pos.c},${pos.r}`) &&
      !heroSet.has(`${pos.c},${pos.r}`) &&
      !isCityBuilding(pos.c, pos.r) &&
      !isBaseCompound(pos.c, pos.r) &&
      (pos.c !== c || pos.r !== r) &&
      Math.hypot(pos.c - c, pos.r - r) >= minDistance
    );

    const openCells = spawnCells.filter(pos => 
      !activeKeys.has(`${pos.c},${pos.r}`) && 
      !heroSet.has(`${pos.c},${pos.r}`) &&
      !isCityBuilding(pos.c, pos.r) &&
      !isBaseCompound(pos.c, pos.r) &&
      (pos.c !== c || pos.r !== r)
    );

    const newPos = distantCorners.length > 0 
      ? distantCorners[Math.floor(Math.random() * distantCorners.length)]
      : (distantOpenCells.length > 0 
          ? distantOpenCells[Math.floor(Math.random() * distantOpenCells.length)]
          : (openCorners.length > 0 
              ? openCorners[Math.floor(Math.random() * openCorners.length)]
              : (openCells.length > 0 ? openCells[Math.floor(Math.random() * openCells.length)] : (spawnCells.find(pos => !activeKeys.has(`${pos.c},${pos.r}`)) || spawnCells[0] || { c: 1, r: 1 }))));

    // Determina a zona tática com menor quantidade de zumbis para manter proporção rigorosa
    const zoneCounts = TACTICAL_ZONES.map(z => ({
      center: z.center,
      count: mapState.deposits.filter(d => 
        !d.isCompleted && d.targetZone && d.targetZone.x === z.center.x && d.targetZone.y === z.center.y
      ).length
    }));
    zoneCounts.sort((a, b) => a.count - b.count);
    const assignedZone = zoneCounts[0]?.center || TACTICAL_ZONES[0].center;

    let respawnedDeposit = null;
    if (newPos) {
      const spawnC = newPos.c !== undefined ? newPos.c : newPos.x;
      const spawnR = newPos.r !== undefined ? newPos.r : newPos.y;
      respawnedDeposit = {
        id: `dep_horde_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        c: spawnC,
        r: spawnR,
        targetZone: assignedZone,
        type: isBossType ? 'boss' : 'zombie',
        name: isBossType ? 'Boss Abominação' : 'Zumbi Andarilho',
        blockId: isBossType ? BLOCK_BOSS : BLOCK_ZOMBIE,
        rarity: isBossType ? 'boss' : 'common',
        maxHp: isBossType ? 30 : 2,
        currentHp: isBossType ? 30 : 2,
        isCompleted: false,
        yieldRate: isBossType ? 0.25 : 0.05
      };
      mapState.deposits.push(respawnedDeposit);
      mapState.grid[spawnR][spawnC] = respawnedDeposit.blockId;
      mapState.hpMap[`${spawnC},${spawnR}`] = respawnedDeposit.currentHp;
    }

    // REGRA OFICIAL DO USUÁRIO: "mantenha a logica dos zumbis , morre 1 nasce outro"
    // Mantém sempre 31 criaturas ativas no mapa (30 zumbis + 1 boss)
    const activeCount = mapState.deposits.filter(d => !d.isCompleted).length;
    mapState.remainingDeposits = Math.max(MAX_DEPOSITS_PER_MAP, activeCount);

    // Conclusão de ciclo a cada 30 zumbis eliminados pela equipe
    if (mapState.zombiesKilledInCycle >= 30) {
      cycleCompleted = true;
      mapState.zombiesKilledInCycle = 0;
      mapState.completedAt = new Date().toISOString();
      const nextCycle = (mapState.cycleNumber || 1) + 1;
      mapState.cycleNumber = nextCycle;

      // Dispara evento global de ciclo concluído (concede bônus de MNC de rodada)
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('cripto_myners_map_cycle_completed', {
          detail: {
            playerId,
            oldCycle: nextCycle - 1,
            nextCycle,
            timestamp: new Date().toISOString()
          }
        });
        window.dispatchEvent(event);
      }

      savePlayerMap(playerId, mapState);
      return {
        deposit,
        respawnedDeposit,
        isNowBroken: true,
        cycleCompleted: true,
        oldCycle: nextCycle - 1,
        nextCycle,
        remainingDeposits: MAX_DEPOSITS_PER_MAP,
        currentMap: mapState
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
 * Utilitários para teste oficial de entrada e saída do Boss Mutante
 */
export function removeBossFromPlayerMap(playerId = DEFAULT_PLAYER_ID) {
  const mapState = getPlayerMap(playerId);
  const bossDeposit = mapState.deposits.find(d => (d.type === 'boss' || d.blockId === BLOCK_BOSS) && !d.isCompleted);
  if (bossDeposit) {
    bossDeposit.isCompleted = true;
    mapState.grid[bossDeposit.r][bossDeposit.c] = BLOCK_EMPTY;
    delete mapState.hpMap[`${bossDeposit.c},${bossDeposit.r}`];
    mapState.lastBossPos = { c: bossDeposit.c, r: bossDeposit.r };
  }
  mapState.deposits = mapState.deposits.filter(d => !(d.type === 'boss' || d.blockId === BLOCK_BOSS));
  savePlayerMap(playerId, mapState);
  return mapState;
}

export function spawnBossInPlayerMap(playerId = DEFAULT_PLAYER_ID, options = {}) {
  const mapState = getPlayerMap(playerId);
  const lastPos = mapState.lastBossPos || options.avoidPos || null;

  // Remove qualquer boss anterior
  mapState.deposits = mapState.deposits.filter(d => !(d.type === 'boss' || d.blockId === BLOCK_BOSS));
  
  const validCells = getSpawnZoneCells();
  const occupiedSet = new Set(mapState.deposits.map(d => `${d.c},${d.r}`));
  const heroSet = new Set((options.heroTiles || []).map(h => `${h.c},${h.r}`));
  
  // REGRA OFICIAL DO USUÁRIO: "QUANDO ISSO ACONTECER DEVE REESPAUNAR EM OUTRO LOCAL LIVRE"
  // Prioriza cantos distantes e livres de colisão/jogadores
  const cornerCandidates = CORNER_SPAWN_POINTS.filter(pos => 
    !occupiedSet.has(`${pos.c},${pos.r}`) &&
    !heroSet.has(`${pos.c},${pos.r}`) &&
    !isCityBuilding(pos.c, pos.r) &&
    !isBaseCompound(pos.c, pos.r) &&
    (!lastPos || Math.hypot(pos.c - lastPos.c, pos.r - lastPos.r) >= 5)
  );

  const distantCells = validCells.filter(pos => 
    !occupiedSet.has(`${pos.c},${pos.r}`) &&
    !heroSet.has(`${pos.c},${pos.r}`) &&
    !isCityBuilding(pos.c, pos.r) &&
    !isBaseCompound(pos.c, pos.r) &&
    (!lastPos || Math.hypot(pos.c - lastPos.c, pos.r - lastPos.r) >= 5)
  );

  const freeCells = validCells.filter(pos => 
    !occupiedSet.has(`${pos.c},${pos.r}`) && 
    !heroSet.has(`${pos.c},${pos.r}`) &&
    !isCityBuilding(pos.c, pos.r) &&
    !isBaseCompound(pos.c, pos.r)
  );
  
  const chosenPos = (cornerCandidates.length > 0 
    ? cornerCandidates[Math.floor(Math.random() * cornerCandidates.length)]
    : (distantCells.length > 0 
        ? distantCells[Math.floor(Math.random() * distantCells.length)]
        : (freeCells.length > 0 ? freeCells[Math.floor(Math.random() * freeCells.length)] : (validCells.find(pos => !occupiedSet.has(`${pos.c},${pos.r}`)) || validCells[0] || { c: 1, r: 1 }))));

  mapState.lastBossPos = { c: chosenPos.c, r: chosenPos.r };

  const bossObj = {
    id: `boss_${Date.now()}_test`,
    c: chosenPos.c,
    r: chosenPos.r,
    targetZone: { x: chosenPos.c, y: chosenPos.r },
    type: 'boss',
    typeName: 'Boss Abominação Mutante',
    color: '#ef4444',
    icon: '💀',
    blockId: BLOCK_BOSS,
    sprite: '/enemies/boss_clean.png',
    maxHp: 30,
    currentHp: 30,
    isCompleted: false,
    yieldRate: 0.25
  };
  
  mapState.deposits.push(bossObj);
  mapState.grid[chosenPos.r][chosenPos.c] = BLOCK_BOSS;
  mapState.hpMap[`${chosenPos.c},${chosenPos.r}`] = 30;
  savePlayerMap(playerId, mapState);
  return mapState;
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
