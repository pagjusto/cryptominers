import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  GRID_COLS, 
  GRID_ROWS, 
  TILE_SIZE, 
  BLOCK_EMPTY, 
  BLOCK_BEDROCK, 
  BLOCK_ROCK, 
  BLOCK_ORE_COMMON, 
  BLOCK_ORE_CRYSTAL, 
  BLOCK_ORE_GOLD, 
  BLOCK_TREASURE, 
  BLOCK_ANCIENT_ALTAR,
  BLOCK_DEPOSIT_EMERALD,
  BLOCK_ZOMBIE,
  BLOCK_BOSS,
  MINER_CLASSES 
} from '../data/minersData';
import { recordDepositDamage, getValidDepositCells } from '../utils/individualMapEngine';
import { syncEnemiesWithMap, updateEnemies, drawEnemyCharacter } from '../utils/enemySystem';
import { CRYPTO_ZOMBIES_REWARDS } from '../data/cryptoZombiesEconomy';
import { 
  drawContinuousCaveFloor, 
  drawVectorCartoonRock, 
  drawMinerCharacter,
  drawBossGreenFog,
  initCanyonMap,
  initCityMap
} from '../utils/renderGraphics';
import { drawMinecart, drawTunnelPortals, initMinecartSprite } from '../utils/minecartRenderer';
import { rockSpriteManager } from '../utils/rockSprites';
import { characterSpriteManager } from '../utils/characterSprites';
import { rollMiningGearDrop } from '../data/gearData';
import { sfx } from '../utils/sfx';
import { 
  isCityBuilding, 
  getSafeHeroSpawn, 
  SAFE_HERO_SPAWN_POINTS,
  isCanyonTrackOrTunnel, 
  isBaseCompound,
  isSpawnZoneCell,
  TACTICAL_ZONES,
  CORNER_SPAWN_POINTS 
} from '../utils/cityMapGeometry';
import { findNextHeroAction, findNearestFreeHeroCell, COMBAT_RANGE, hasClearLineOfSight } from '../utils/minerPathfinding';
import { getHeroById, getWeaponById } from '../data/heroRoster';

// Renderização top-down da base médica: leitos ocupados/vagos e pátio de reserva.
function drawBaseShelterVisual(ctx, house, miners, now) {
  if (!house || house.level < 1 || !house.slots) return;

  // Limites internos fixos do complexo central: não invade estradas nem terreno adjacente.
  const x = 4 * TILE_SIZE + 6;
  const y = 4 * TILE_SIZE + 6;
  const w = 7 * TILE_SIZE - 12;
  const h = 4 * TILE_SIZE - 12;
  const color = house.color || '#38bdf8';
  const inBeds = miners.filter(m => m.status === 'house').slice(0, house.slots);
  const waiting = miners.filter(m => m.status === 'waiting_house');
  const resting = miners.filter(m =>
    (m.status === 'reserve' || m.status === 'sleep') &&
    !m.injuredAwaitingRescue &&
    (Number(m.currentHealth ?? m.maxHealth ?? 100) / Number(m.maxHealth || 100)) * 100 > 5
  );

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.fillStyle = 'rgba(7, 16, 27, 0.94)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);

  const headerH = 28;
  const header = ctx.createLinearGradient(x, y, x + w, y + headerH);
  header.addColorStop(0, color + '55');
  header.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
  ctx.fillStyle = header;
  ctx.fillRect(x + 2, y + 2, w - 4, headerH);

  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText('AMBULATÓRIO • NÍVEL ' + house.level, x + 10, y + 16);
  ctx.textAlign = 'right';
  ctx.fillStyle = color;
  ctx.fillText(inBeds.length + ' OCUPADOS • ' + Math.max(0, house.slots - inBeds.length) + ' LIVRES', x + w - 10, y + 16);

  // Leitos: os heróis em tratamento aparecem deitados, um por vaga ocupada.
  const bedStartX = x + 8;
  const bedStartY = y + headerH + 8;
  const bedW = 64;
  const bedH = 52;
  const gapX = 7;
  const bedAreaW = 5 * bedW + 4 * gapX;
  const rows = Math.ceil(house.slots / 5);
  const bedAreaH = h - headerH - 16;
  const rowStep = bedAreaH / rows;

  for (let i = 0; i < house.slots; i++) {
    const row = Math.floor(i / 5);
    const col = i % 5;
    const bx = bedStartX + col * (bedW + gapX);
    const by = bedStartY + row * rowStep + (rowStep - bedH) / 2;
    const patient = inBeds[i];

    ctx.fillStyle = patient ? 'rgba(30, 64, 91, 0.95)' : 'rgba(15, 23, 42, 0.86)';
    ctx.fillRect(bx, by, bedW, bedH);
    ctx.strokeStyle = patient ? '#60a5fa' : 'rgba(148, 163, 184, 0.55)';
    ctx.lineWidth = patient ? 2 : 1.2;
    ctx.strokeRect(bx + 1, by + 1, bedW - 2, bedH - 2);

    ctx.fillStyle = patient ? 'rgba(96, 165, 250, 0.25)' : 'rgba(148, 163, 184, 0.12)';
    ctx.fillRect(bx + 5, by + 6, bedW - 10, bedH - 12);
    ctx.fillStyle = patient ? '#e2e8f0' : '#94a3b8';
    ctx.fillRect(bx + 7, by + 8, 13, 12);

    if (patient) {
      const cy = by + bedH / 2 + 1;
      ctx.fillStyle = '#f1c7a5';
      ctx.beginPath();
      ctx.ellipse(bx + 15, cy, 7, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = patient.color || '#38bdf8';
      ctx.fillRect(bx + 23, cy - 9, 12, 18);
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(bx + 34, cy - 12, 23, 24);
      ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
      ctx.fillRect(bx + 37, cy - 9, 3, 18);
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText('PV ' + Math.round((Number(patient.currentHealth || 5) / Number(patient.maxHealth || 100)) * 100) + '%', bx + 45, by + bedH - 4);
    } else {
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('LEITO LIVRE', bx + bedW / 2, by + bedH - 7);
    }
  }

  // Pátio interno: todos os heróis saudáveis fora da mineração e todos os feridos na fila.
  // Os ícones são compactos para manter a representação dentro do mesmo quadrado da base.
  const patioX = bedStartX + bedAreaW + 12;
  const patioW = x + w - patioX - 8;
  const patioY = y + headerH + 6;
  const patioH = h - headerH - 12;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.62)';
  ctx.fillRect(patioX, patioY, patioW, patioH);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
  ctx.strokeRect(patioX, patioY, patioW, patioH);

  const drawRoster = (heroes, label, startY, waitingList = false) => {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = waitingList ? '#fbbf24' : '#cbd5e1';
    ctx.fillText(label + ' • ' + heroes.length, patioX + 5, startY + 7);

    const cols = 4;
    const cellW = Math.max(28, (patioW - 8) / cols);
    const rowH = 23;
    const availableRows = Math.max(1, Math.floor((patioY + patioH - startY - 17) / rowH));
    const maxVisible = cols * availableRows;
    const visible = heroes.slice(0, maxVisible);

    visible.forEach((hero, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const cx = patioX + 5 + col * cellW + cellW / 2;
      const cy = startY + 23 + row * rowH;
      // Fila usa contorno amarelo; reserva usa contorno azul discreto. Ambos ficam em pé.
      ctx.fillStyle = waitingList ? 'rgba(251, 191, 36, 0.18)' : 'rgba(56, 189, 248, 0.13)';
      ctx.fillRect(cx - 8, cy - 9, 16, 19);
      ctx.strokeStyle = waitingList ? '#fbbf24' : 'rgba(125, 211, 252, 0.65)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 8, cy - 9, 16, 19);
      ctx.fillStyle = '#f1c7a5';
      ctx.beginPath();
      ctx.arc(cx, cy - 4, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = hero.color || (waitingList ? '#f59e0b' : '#22c55e');
      ctx.fillRect(cx - 4, cy, 8, 7);
    });

    const overflow = heroes.length - visible.length;
    if (overflow > 0) {
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = waitingList ? '#fbbf24' : '#cbd5e1';
      ctx.fillText('+' + overflow, patioX + patioW - 4, patioY + patioH - 7);
    }
    return startY + 23 + Math.ceil(Math.min(heroes.length, maxVisible) / cols) * rowH;
  };

  ctx.textAlign = 'center';
  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText('PÁTIO INTERNO', patioX + patioW / 2, patioY + 9);

  const rosterStart = patioY + 17;
  const reserveEnd = drawRoster(resting, 'RESERVA', rosterStart, false);
  if (waiting.length > 0) {
    const waitingStart = Math.min(reserveEnd + 2, patioY + patioH - 35);
    drawRoster(waiting, 'FILA DE LEITOS', waitingStart, true);
  } else if (resting.length === 0) {
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('SEM HERÓIS NA RESERVA', patioX + patioW / 2, patioY + 38);
  }

  ctx.restore();
}

export default function GameBoard({ 
  mine, 
  mapData, 
  miners, 
  playerId = 'player_default',
  onDepositBroken,
  onBossDefeated,
  onMinersChange, 
  onCollectBcoin, 
  onRescueMiner, 
  onMapCleared,
  onStatsUpdate,
  onDropGear,
  statsResetTrigger = 0,
  houseSlots = 5,
  recoverySpeedPct = 100,
  houseVisualTier = null,
  gameSpeed = 1 
}) {
  const canvasRef = useRef(null);
  const mapDataRef = useRef(mapData);
  mapDataRef.current = mapData;
  const [spritesReady, setSpritesReady] = useState(false);
  
  // REGRA OFICIAL DO USUÁRIO: "quando aparecer o boss coloca um aviso na tela dizendo ALERTA BOSS PISCANDO UMAS 4 VEZES"
  const [bossAlert, setBossAlert] = useState(false);
  const [bossAlertKey, setBossAlertKey] = useState(0);
  const lastAlertedBossIdRef = useRef(null);
  const alertTimeoutRef = useRef(null);

  const triggerBossAlert = useCallback((bossId) => {
    if (bossId && lastAlertedBossIdRef.current === bossId) return;
    if (bossId) lastAlertedBossIdRef.current = bossId;
    
    setBossAlertKey(k => k + 1);
    setBossAlert(true);
    try {
      sfx.playSirenWail?.();
    } catch (e) {}

    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    alertTimeoutRef.current = setTimeout(() => {
      setBossAlert(false);
    }, 4600);
  }, []);

  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    };
  }, []);

  const callbacksRef = useRef({});
  callbacksRef.current = {
    playerId,
    onDepositBroken,
    onBossDefeated,
    onCollectBcoin,
    onRescueMiner,
    onMapCleared,
    onStatsUpdate,
    onDropGear,
    onMinersChange
  };

  const houseConfigRef = useRef({ houseSlots, recoverySpeedPct });
  houseConfigRef.current = { houseSlots, recoverySpeedPct };
  const houseVisualRef = useRef(houseVisualTier);
  houseVisualRef.current = houseVisualTier;
  const initialHeroSpawnDoneRef = useRef(false);

  const gameStateRef = useRef({
    grid: mapData.grid,
    hpMap: mapData.hpMap,
    totalMapHp: Object.values(mapData.hpMap).reduce((a, b) => a + b, 0),
    minerStats: {},
    lastStatsEmit: 0,
    bossBattleSessions: {},
    miners: miners,
    floatTexts: [],
    particles: [],
    sparks: [],
    cart: {
      progress: 0,
      speed: 0.048,
      x: -60,
      delayTimer: 0
    },
    lastTime: performance.now()
  });

  const lastMapIdRef = useRef(mapData?.id);

  useEffect(() => {
    initCityMap();
    initCanyonMap();
    initMinecartSprite();
    rockSpriteManager.init(() => {
      characterSpriteManager.init(() => {
        setSpritesReady(true);
      });
    });
  }, []);

  useEffect(() => {
    if (!mapData || !mapData.grid) return;
    const currentKey = mapData.mapId || mapData.id;
    const isNewMap = !currentKey || currentKey !== lastMapIdRef.current || !gameStateRef.current.grid;

    if (isNewMap) {
      lastMapIdRef.current = currentKey;
      gameStateRef.current.grid = mapData.grid.map(row => [...row]);
      gameStateRef.current.hpMap = { ...(mapData.hpMap || {}) };
      gameStateRef.current.totalMapHp = Object.values(mapData.hpMap || {}).reduce((a, b) => a + b, 0);
      gameStateRef.current.isMapClearing = false;
      gameStateRef.current.bossBattleSessions = {};
      gameStateRef.current.enemies = syncEnemiesWithMap([], mapData, gameStateRef.current.grid, gameStateRef.current.hpMap);
    } else {
      // Sincroniza ativamente a horda de 20 zumbis: injeta no grid e no hpMap qualquer criatura nova da horda
      const deposits = mapData.deposits || [];
      deposits.forEach(dep => {
        if (!dep.isCompleted && dep.r >= 0 && dep.r < GRID_ROWS && dep.c >= 0 && dep.c < GRID_COLS) {
          const cellKey = `${dep.c},${dep.r}`;
          if (gameStateRef.current.grid && gameStateRef.current.grid[dep.r][dep.c] === BLOCK_EMPTY) {
            gameStateRef.current.grid[dep.r][dep.c] = dep.blockId || BLOCK_ZOMBIE;
          }
          if (gameStateRef.current.hpMap && gameStateRef.current.hpMap[cellKey] === undefined) {
            gameStateRef.current.hpMap[cellKey] = dep.currentHp || 2;
          }
        }
      });
      gameStateRef.current.enemies = syncEnemiesWithMap(gameStateRef.current.enemies || [], mapData, gameStateRef.current.grid, gameStateRef.current.hpMap);
    }

    // REGRA OFICIAL DO USUÁRIO: "quando aparecer o boss coloca um aviso na tela dizendo ALERTA BOSS PISCANDO UMAS 4 VEZES"
    const activeBoss = mapData?.deposits?.find(
      dep => (dep.type === 'boss' || dep.blockId === BLOCK_BOSS) && !dep.isCompleted
    );
    if (activeBoss) {
      if (lastAlertedBossIdRef.current !== activeBoss.id) {
        triggerBossAlert(activeBoss.id);
      }
    } else {
      lastAlertedBossIdRef.current = null;
    }
  }, [mapData, triggerBossAlert]);

  useEffect(() => {
    if (statsResetTrigger > 0) {
      gameStateRef.current.minerStats = {};
    }
  }, [statsResetTrigger]);

  useEffect(() => {
    const current = gameStateRef.current.miners;
    const isInitialSpawnPass = !initialHeroSpawnDoneRef.current;
    gameStateRef.current.miners = miners.map((m, idx) => {
      const existing = current.find(em => em.id === m.id);
      let initX = existing ? existing.x : m.x;
      let initY = existing ? existing.y : m.y;

      // Se a posição for inválida ou cair dentro de edifícios/muros da cidade, realoca para rua/grama aberta
      const insideBuilding = isCityBuilding(Math.round(initX), Math.round(initY));
      const outOfBounds = initX <= 0 || initX >= GRID_COLS - 1 || initY <= 0 || initY >= GRID_ROWS - 1;
      const outsideRespawnZone = isInitialSpawnPass && !isSpawnZoneCell(Math.round(initX), Math.round(initY));
      if (typeof initX !== 'number' || isNaN(initX) || insideBuilding || outOfBounds || outsideRespawnZone) {
        const safePt = getSafeHeroSpawn(idx);
        initX = safePt.x;
        initY = safePt.y;
      }

      if (existing) {
        return { 
          ...m, 
          x: initX, 
          y: initY, 
          visualX: existing.visualX ?? initX,
          visualY: existing.visualY ?? initY,
          moveCooldown: existing.moveCooldown,
          isMining: existing.isMining,
          targetBlock: existing.targetBlock,
          swingTimer: existing.swingTimer,
          targetDir: existing.targetDir || 1
        };
      }
      return { 
        ...m, 
        x: initX,
        y: initY,
        visualX: initX,
        visualY: initY,
        moveCooldown: 0, 
        isMining: false, 
        targetBlock: null, 
        swingTimer: 0, 
        targetDir: 1 
      };
    });
    if (miners.length > 0) initialHeroSpawnDoneRef.current = true;
  }, [miners, mine]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = GRID_COLS * TILE_SIZE;
    const logicalHeight = GRID_ROWS * TILE_SIZE;

    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    canvas.style.maxWidth = '100%';
    canvas.style.maxHeight = 'calc(100vh - 24px)';
    canvas.style.width = 'auto';
    canvas.style.height = 'auto';
    canvas.style.aspectRatio = `${logicalWidth} / ${logicalHeight}`;

    let animationId;

    const gameLoop = (now) => {
      try {
        const state = gameStateRef.current;
      const rawDt = (now - state.lastTime) / 1000;
      state.lastTime = now;
      const dt = Math.min(rawDt, 0.1) * gameSpeed;
      const isCanyon = (mine?.id === 'canyon' || !mine?.id);

      // Atualiza movimentação de caminhada e combate dos Zumbis e Boss
      const currentMapData = mapDataRef.current;
      if (currentMapData) {
        state.enemies = syncEnemiesWithMap(state.enemies || [], currentMapData, state.grid, state.hpMap);
        // Regra Oficial do Usuário: Zumbis NUNCA podem invadir ou permanecer na área da base militar
        state.enemies = state.enemies.filter(e => {
          if (isBaseCompound(Math.round(e.gx), Math.round(e.gy))) {
            const k = `${Math.round(e.gx)},${Math.round(e.gy)}`;
            delete state.hpMap[k];
            if (state.grid[Math.round(e.gy)]) {
              state.grid[Math.round(e.gy)][Math.round(e.gx)] = BLOCK_EMPTY;
            }
            return false;
          }
          return true;
        });
        updateEnemies(state.enemies, state, dt, now, isCanyon);

        // Registra uma única fotografia imutável da equipe que iniciou este Boss.
        const activeBossForSession = state.enemies?.find(e => e.type === 'boss' && (e.hp === undefined || e.hp > 0));
        if (activeBossForSession && !state.bossBattleSessions?.[activeBossForSession.id]) {
          const sessionKey = `cryptozombies_boss_snapshot_${callbacksRef.current.playerId || 'player_default'}_${activeBossForSession.id}`;
          let savedSession = null;
          try {
            const rawSession = localStorage.getItem(sessionKey);
            if (rawSession) savedSession = JSON.parse(rawSession);
          } catch (e) {}

          const initialParticipants = Array.isArray(savedSession?.participants)
            ? savedSession.participants
            : state.miners
                .filter(m => {
                  const maxHealth = m.maxHealth || 100;
                  const currentHealth = m.currentHealth ?? maxHealth;
                  return m.status === 'work' && (currentHealth / maxHealth) * 100 > 5;
                })
                .map(m => ({ ...m }));
          const startedAt = savedSession?.startedAt || new Date().toISOString();
          state.bossBattleSessions = state.bossBattleSessions || {};
          state.bossBattleSessions[activeBossForSession.id] = {
            bossId: activeBossForSession.id,
            sessionKey,
            startedAt,
            participants: initialParticipants
          };
          if (!savedSession) {
            try {
              localStorage.setItem(sessionKey, JSON.stringify({ bossId: activeBossForSession.id, startedAt, participants: initialParticipants }));
            } catch (e) {}
          }
        }
      }

      // 1. ATUALIZAR MINERADORES

      // Função auxiliar para quebrar bloco e conceder recompensa BCOIN
      const breakBlockAt = (bx, by, bType, hitter) => {
        const cKey = `${bx},${by}`;
        delete state.hpMap[cKey];
        state.grid[by][bx] = BLOCK_EMPTY;

        // Procura se havia um inimigo (Zumbi ou Boss) correspondente nesta célula
        const defeatedEnemy = state.enemies?.find(e => e.gx === bx && e.gy === by);

        // Notifica todos os mineradores que estavam atacando este zumbi para liberarem o alvo e a trava
        state.miners.forEach(m => {
          if ((m.targetBlock && m.targetBlock.x === bx && m.targetBlock.y === by) || (m.lockedEnemyId && defeatedEnemy && m.lockedEnemyId === defeatedEnemy.id)) {
            m.isMining = false;
            m.targetBlock = null;
            m.lockedEnemyId = null;
            m.swingTimer = 0;
            m.moveCooldown = 0; // Libera movimento imediato para o próximo zumbi
          }
        });

        // Notifica e remove o inimigo (Zumbi ou Boss) correspondente
        if (state.enemies) {
          const eIdx = state.enemies.findIndex(e => e.gx === bx && e.gy === by);
          if (eIdx !== -1) {
            const defeated = state.enemies[eIdx];
            state.enemies.splice(eIdx, 1);
            const isBoss = defeated.type === 'boss';

            // Efeito limpo de abate (removidas as partículas verdes artificiais antigas)
            if (isBoss) {
              sfx.playChestOpen?.();

              // O sorteio usa somente os participantes registrados no início e vivos na derrota.
              const battleSession = state.bossBattleSessions?.[defeated.id];
              if (battleSession) {
                const currentMinersById = new Map(state.miners.map(m => [m.id, m]));
                // Heróis não morrem: todos os integrantes do snapshot inicial participam,
                // mesmo feridos, no ambulatório ou ausentes da formação atual após substituição.
                const eligibleInitialParticipants = battleSession.participants.map(initialMiner => {
                  const currentMiner = currentMinersById.get(initialMiner.id);
                  return {
                    ...initialMiner,
                    currentHealth: currentMiner?.currentHealth ?? initialMiner.currentHealth ?? initialMiner.maxHealth ?? 100,
                    status: currentMiner?.status ?? initialMiner.status,
                    bossSnapshotParticipant: true
                  };
                });

                callbacksRef.current.onBossDefeated?.({
                  bossId: defeated.id,
                  startedAt: battleSession.startedAt,
                  participants: eligibleInitialParticipants
                });
                try {
                  if (battleSession.sessionKey) localStorage.removeItem(battleSession.sessionKey);
                } catch (e) {}
                delete state.bossBattleSessions[defeated.id];
              }

              state.floatTexts.push({
                text: '💀 BOSS MUTANTE DERROTADO!',
                x: bx * TILE_SIZE + TILE_SIZE / 2,
                y: by * TILE_SIZE - 12,
                color: '#facc15',
                opacity: 1.0,
                vy: -25
              });

            } else {
              // Abate do zumbi concluído: recompensa e texto flutuante
              state.floatTexts.push({
                text: '🧟 +ZUMBI (+0.05 MNC)',
                x: bx * TILE_SIZE + TILE_SIZE / 2,
                y: by * TILE_SIZE - 8,
                color: '#a3e635',
                opacity: 0.95,
                vy: -22
              });

              // Concede recompensa econômica direta de MNC pelo abate do zumbi
              callbacksRef.current.onCollectBcoin?.(0.05);
            }
          }
        }

        // Rastreamento de estatísticas da rodada (Pedras destruídas pelo herói)
        if (hitter && hitter.id) {
          const ms = state.minerStats[hitter.id] || { blocksBroken: 0, bcoinEarned: 0, damageDealt: 0 };
          ms.blocksBroken = (ms.blocksBroken || 0) + 1;
          state.minerStats[hitter.id] = ms;
        }

        sfx.playRockHit?.();

        // Registra a destruição da jazida no motor de mapas individuais (Lógica Estritamente Visual)
        const pId = callbacksRef.current.playerId || 'player_default';
        const heroTiles = (state.miners || []).filter(m => m.status === 'work').map(m => ({
          c: Math.round(m.x),
          r: Math.round(m.y)
        }));
        const mapDamageResult = recordDepositDamage(pId, bx, by, 999999, heroTiles);
        if (mapDamageResult?.deposit) {
          callbacksRef.current.onDepositBroken?.(mapDamageResult);
          // Remove imediatamente a entidade abatida da memória de inimigos ativos
          state.enemies = (state.enemies || []).filter(e => e.id !== mapDamageResult.deposit.id && !(e.gx === bx && e.gy === by));
          if (mapDamageResult.currentMap) {
            state.enemies = syncEnemiesWithMap(state.enemies, mapDamageResult.currentMap, state.grid, state.hpMap);
          }
          // REGRA OFICIAL DO USUÁRIO: "quando aparecer o boss coloca um aviso na tela dizendo ALERTA BOSS PISCANDO UMAS 4 VEZES"
          if (mapDamageResult?.respawnedDeposit && (mapDamageResult.respawnedDeposit.type === 'boss' || mapDamageResult.respawnedDeposit.blockId === BLOCK_BOSS)) {
            triggerBossAlert(mapDamageResult.respawnedDeposit.id);
          }
        }

        // Verificação se todas as 20 jazidas foram destruídas (Renovação de Ciclo do Mapa Individual)
        let breakableCount = 0;
        for (let r = 0; r < GRID_ROWS; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            const bt = state.grid[r][c];
            if (bt !== BLOCK_EMPTY && bt !== BLOCK_BEDROCK) {
              breakableCount++;
            }
          }
        }

        // Mapa intermitente e perpétuo: sem interrupções de ciclo ou reset de mapa.
        // A horda se mantém contínua com 20 criaturas com respawn imediato nos cantos.
        // if ((breakableCount === 0 || mapDamageResult?.cycleCompleted) && !state.isMapClearing) {
        //   state.isMapClearing = true;
        //   callbacksRef.current.onMapCleared?.(mapDamageResult?.newMap);
        // }
      };

      // REGRA OFICIAL DO USUÁRIO: "Anti-Stacking de personagens tbm"
      // Recuperação de emergência: se algum herói estiver dentro de um obstáculo sólido ou da base militar,
      // reposiciona de forma suave e segura para uma coordenada válida do mapa
      state.miners.forEach(m => {
        if (m.status !== 'work') return;
        const hx = Math.round(m.x);
        const hy = Math.round(m.y);
        const isInsideObstacle = isCityBuilding(hx, hy) || isBaseCompound(hx, hy);

        if (isInsideObstacle) {
          const fallbackCell = SAFE_HERO_SPAWN_POINTS.find(p => 
            !isCityBuilding(p.x, p.y) && 
            !isBaseCompound(p.x, p.y) && 
            !state.miners.some(other => other.id !== m.id && Math.round(other.x) === p.x && Math.round(other.y) === p.y)
          ) || { x: 2, y: 5 };

          m.x = fallbackCell.x;
          m.y = fallbackCell.y;
          m.visualX = fallbackCell.x;
          m.visualY = fallbackCell.y;
          m.stuckTimer = 0;
        }
      });

      state.miners.forEach((miner, minerIndex) => {
        const maxHealth = Number(miner.maxHealth) > 0 ? Number(miner.maxHealth) : 100;
        const currentHealth = Number.isFinite(Number(miner.currentHealth)) ? Number(miner.currentHealth) : maxHealth;

        // REGRA OFICIAL DO USUÁRIO: "veja que tem o medico na equipe e ele nao esta levando pro ambulatorio curar automaticamente"
        // Quando um herói é ferido (<= 5% de vida), a Dra. Íris (Médica do Abrigo) resgata e leva o sobrevivente para o ambulatório
        if (miner.status !== 'house' && miner.status !== 'waiting_house' && (miner.status === 'injured' || miner.injuredAwaitingRescue || (currentHealth / maxHealth) * 100 <= 5)) {
          miner.maxHealth = maxHealth;
          miner.currentHealth = Math.min(currentHealth, maxHealth * 0.05);
          miner.isMining = false;
          miner.targetBlock = null;
          miner.lockedEnemyId = null;
          miner.swingTimer = 0;

          const capacity = houseConfigRef.current?.houseSlots ?? 5;
          const inHouse = state.miners.filter(m => m.status === 'house').length;

          if (inHouse < capacity) {
            // Leito livre no ambulatório: internação imediata sob cuidados da Dra. Íris
            miner.status = 'house';
            miner.injuredAwaitingRescue = false;
            state.floatTexts.push({
              text: '🚑 AMBULATÓRIO (DRA. ÍRIS)',
              x: (miner.x || 2) * TILE_SIZE + TILE_SIZE / 2,
              y: (miner.y || 8) * TILE_SIZE - 12,
              color: '#38bdf8',
              opacity: 1.0,
              vy: -30
            });
          } else {
            // Ambulatório lotado: aguarda na fila de espera
            miner.status = 'waiting_house';
            miner.injuredAwaitingRescue = true;
            state.floatTexts.push({
              text: '⏳ FILA DO AMBULATÓRIO',
              x: (miner.x || 2) * TILE_SIZE + TILE_SIZE / 2,
              y: (miner.y || 8) * TILE_SIZE - 12,
              color: '#fbbf24',
              opacity: 1.0,
              vy: -25
            });
          }
          return;
        }

        // ====================================================================
        // TRATAMENTO MÉDICO NO AMBULATÓRIO DO ABRIGO (DRA. ÍRIS)
        // ====================================================================
        if (miner.status === 'house') {
          miner.isMining = false;
          miner.targetBlock = null;
          miner.lockedEnemyId = null;
          miner.swingTimer = 0;

          // Recuperação contínua de vida baseada na eficiência do abrigo
          const recSpeedPct = houseConfigRef.current?.recoverySpeedPct || 100;
          const healRatePerSec = (maxHealth * 0.075) * (recSpeedPct / 100); // ~13 segundos para regenerar de 5% a 100%
          miner.currentHealth = Math.min(maxHealth, (miner.currentHealth || (maxHealth * 0.05)) + healRatePerSec * dt);

          // Quando atinge 100% de vida: alta médica e retorno à reserva.
          if (miner.currentHealth >= maxHealth) {
            miner.currentHealth = maxHealth;
            miner.status = 'reserve';
            miner.injuredAwaitingRescue = false;
            miner.moveCooldown = 0.5;

            // Reposiciona o sobrevivente curado na zona tática correspondente
            const spawnPt = getSafeHeroSpawn(minerIndex);
            miner.x = spawnPt.x;
            miner.y = spawnPt.y;
            miner.visualX = spawnPt.x;
            miner.visualY = spawnPt.y;

            state.floatTexts.push({
              text: '💚 ALTA MÉDICA (RESERVA)',
              x: spawnPt.x * TILE_SIZE + TILE_SIZE / 2,
              y: spawnPt.y * TILE_SIZE - 12,
              color: '#22c55e',
              opacity: 1.0,
              vy: -35
            });

            // Se houver sobrevivente na fila (waiting_house), interna imediatamente no leito liberado
            const capacity = houseConfigRef.current?.houseSlots ?? 5;
            const currentInHouse = state.miners.filter(m => m.status === 'house').length;
            if (currentInHouse < capacity) {
              const nextInLine = state.miners.find(m => m.status === 'waiting_house');
              if (nextInLine) {
                nextInLine.status = 'house';
                nextInLine.injuredAwaitingRescue = false;
              }
            }
          }
          return;
        }

        // Fila de espera do ambulatório: checa se liberou vaga
        if (miner.status === 'waiting_house') {
          miner.isMining = false;
          miner.targetBlock = null;
          miner.lockedEnemyId = null;
          miner.swingTimer = 0;

          const capacity = houseConfigRef.current?.houseSlots ?? 5;
          const inHouse = state.miners.filter(m => m.status === 'house').length;
          if (inHouse < capacity) {
            miner.status = 'house';
            miner.injuredAwaitingRescue = false;
            state.floatTexts.push({
              text: '🚑 VAGA LIBERADA (AMBULATÓRIO)',
              x: (miner.x || 2) * TILE_SIZE + TILE_SIZE / 2,
              y: (miner.y || 8) * TILE_SIZE - 12,
              color: '#38bdf8',
              opacity: 1.0,
              vy: -30
            });
          }
          return;
        }

        // 3. Reserva: herói inativo, sem consumo ou recuperação de energia.
        if (miner.status === 'reserve') {
          miner.isMining = false;
          miner.targetBlock = null;
          return;
        }

        // 4. Herói em espera no mapa: permanece inativo até ser convocado.
        if (miner.status === 'sleep') {
          if (isCanyon && isCanyonTrackOrTunnel(Math.round(miner.x), Math.round(miner.y), GRID_COLS, GRID_ROWS)) {
            miner.x = 2;
            miner.y = 8;
          }
          miner.isMining = false;
          miner.targetBlock = null;
          return;
        }

        if (typeof miner.x !== 'number' || isNaN(miner.x)) miner.x = 2;
        if (typeof miner.y !== 'number' || isNaN(miner.y)) miner.y = 8;

        const mx = Math.max(1, Math.min(GRID_COLS - 2, Math.round(miner.x)));
        const my = Math.max(1, Math.min(GRID_ROWS - 2, Math.round(miner.y)));

        // Garante que nenhum herói fique preso sobre o outdoor ou obstáculos físicos da cidade
        if (isCityBuilding(mx, my)) {
          const safePoint = getSafeHeroSpawn(minerIndex);
          miner.x = safePoint.x;
          miner.y = safePoint.y;
          miner.targetBlock = null;
          miner.isMining = false;
        }

        // REGRA OFICIAL DO USUÁRIO: "e se quebrar interrompe a mineração"
        if (miner.durability !== undefined && miner.durability <= 0) {
          miner.isMining = false;
          miner.targetBlock = null;
          miner.swingTimer = 0;
          return;
        }

        // ====================================================================
        // REGRA OFICIAL DO USUÁRIO:
        // "quando heroi começa atacar um zumbi ele deve continuar atacando
        //  o mesmo zumbi ate mata-lo e nao deve caminhar enquanto isso"
        // ====================================================================

        // 1. Resolução do zumbi travado (Target Lock)
        let lockedEnemy = null;
        if (miner.lockedEnemyId) {
          lockedEnemy = state.enemies?.find(e => e.id === miner.lockedEnemyId);
        } else if (miner.isMining && miner.targetBlock) {
          lockedEnemy = state.enemies?.find(e => e.gx === miner.targetBlock.x && e.gy === miner.targetBlock.y);
          if (lockedEnemy) {
            miner.lockedEnemyId = lockedEnemy.id;
          }
        }

        // REGRA OFICIAL DO USUÁRIO: "quando o boss aparece todos os herois devem caminhar para perto dele e atacalo"
        // Se o Boss está vivo no mapa e o herói está focado em um zumbi comum (não-boss):
        // Cancela a trava no zumbi comum para que toda a equipe marche imediatamente em direção ao Boss!
        const isBossOnField = state.enemies?.some(e => (e.type === 'boss' || e.blockId === BLOCK_BOSS) && e.hp > 0);
        if (isBossOnField && lockedEnemy && lockedEnemy.type !== 'boss' && lockedEnemy.blockId !== BLOCK_BOSS) {
          lockedEnemy = null;
          miner.lockedEnemyId = null;
          miner.targetBlock = null;
          miner.isMining = false;
          miner.swingTimer = 0;
          miner.moveCooldown = 0;
        }

        // 2. Se o herói já começou a atacar um zumbi (possui lockedEnemy)
        if (lockedEnemy) {
          const cellKey = `${lockedEnemy.gx},${lockedEnemy.gy}`;
          const curHp = state.hpMap[cellKey] ?? lockedEnemy.hp;
          const blockType = state.grid[lockedEnemy.gy] ? state.grid[lockedEnemy.gy][lockedEnemy.gx] : BLOCK_EMPTY;
          const isAlive = curHp !== undefined && curHp > 0 && blockType !== BLOCK_EMPTY && blockType !== BLOCK_BEDROCK && (lockedEnemy.hp === undefined || lockedEnemy.hp > 0);

          if (!isAlive) {
            // Zumbi foi morto! Apenas agora libera a trava do herói para buscar o próximo
            miner.lockedEnemyId = null;
            miner.targetBlock = null;
            miner.isMining = false;
            miner.swingTimer = 0;
            miner.moveCooldown = 0;
          } else {
            // ZUMBI VIVO! O herói DEVE continuar atacando este MESMO zumbi e NÃO DEVE CAMINHAR!
            miner.targetBlock = { x: lockedEnemy.gx, y: lockedEnemy.gy };
            miner.isMining = true;

            // Herói permanece 100% estático disparando no zumbi (não caminha)
            miner.x = mx;
            miner.y = my;

            // Vira o herói diretamente na direção do zumbi atacado
            if (lockedEnemy.gx < miner.x) {
              miner.targetDir = -1;
            } else if (lockedEnemy.gx > miner.x) {
              miner.targetDir = 1;
            }

            // O zumbi também fica travado sob ataque (não caminha para longe)
            lockedEnemy.isUnderAttack = true;
            lockedEnemy.attackedTimer = 2.0;
            lockedEnemy.isWalking = false;
            lockedEnemy.moveCooldown = 2.0;
            lockedEnemy.underAttackByHeroId = miner.id;
            const enemyCurrX = lockedEnemy.visualX ?? lockedEnemy.gx;
            if (Math.abs(miner.x - enemyCurrX) > 0.05) {
              lockedEnemy.facingDir = miner.x < enemyCurrX ? -1 : 1;
            }
          }
        } else if (miner.targetBlock) {
          // Bloco genérico sem enemy (jazida comum)
          const { x: tx, y: ty } = miner.targetBlock;
          const matchedEnemy = state.enemies?.find(e => e.gx === tx && e.gy === ty);
          if (matchedEnemy && (matchedEnemy.hp === undefined || matchedEnemy.hp > 0)) {
            miner.lockedEnemyId = matchedEnemy.id;
            miner.isMining = true;
          } else {
            const currentType = state.grid[ty] ? state.grid[ty][tx] : BLOCK_EMPTY;
            const cellKey = `${tx},${ty}`;
            const hasHp = state.hpMap[cellKey] !== undefined && state.hpMap[cellKey] > 0;
            const dist = Math.abs(tx - mx) + Math.abs(ty - my);

            if (currentType === BLOCK_EMPTY || currentType === BLOCK_BEDROCK || !hasHp || dist > COMBAT_RANGE) {
              miner.targetBlock = null;
              miner.isMining = false;
              miner.moveCooldown = 0;
            }
          }
        }

        // 3. Se o herói está sem alvo ou não está minerando, busca a próxima criatura taticamente
        if (!miner.targetBlock || !miner.isMining) {
          const decision = findNextHeroAction(miner, state.grid, state.miners, isCanyon);
          if (decision.action === 'mine' && decision.targetBlock) {
            miner.targetBlock = decision.targetBlock;
            miner.targetDir = decision.targetDir;
            miner.isMining = true;
            miner.swingTimer = 0.4;

            // Trava imediatamente no zumbi alvo para não trocar e não andar
            const matchedEnemy = state.enemies?.find(e => e.gx === decision.targetBlock.x && e.gy === decision.targetBlock.y);
            if (matchedEnemy) {
              miner.lockedEnemyId = matchedEnemy.id;
              matchedEnemy.isUnderAttack = true;
              matchedEnemy.attackedTimer = 2.0;
              matchedEnemy.isWalking = false;
              matchedEnemy.moveCooldown = 2.0;
              matchedEnemy.underAttackByHeroId = miner.id;
            }
          }
        }

        if (miner.isMining && miner.targetBlock) {
          // Garante que o herói permaneça 100% estático disparando no zumbi (não caminha)
          miner.x = mx;
          miner.y = my;

          // Garante que o herói SEMPRE esteja virado diretamente para o zumbi que está atacando
          if (miner.targetBlock.x < miner.x) {
            miner.targetDir = -1;
          } else if (miner.targetBlock.x > miner.x) {
            miner.targetDir = 1;
          }
          miner.swingTimer = (miner.swingTimer || 0) - dt * (miner.speed * 0.9);

          if (miner.swingTimer <= 0) {
            miner.swingTimer = 0.85;

            const { x: tx, y: ty } = miner.targetBlock;
            const blockType = state.grid[ty] ? state.grid[ty][tx] : BLOCK_EMPTY;
            const cellKey = `${tx},${ty}`;
            const curHp = state.hpMap[cellKey];

            if (curHp === undefined || curHp <= 0 || blockType === BLOCK_EMPTY || blockType === BLOCK_BEDROCK) {
              miner.lockedEnemyId = null;
              miner.targetBlock = null;
              miner.isMining = false;
              miner.moveCooldown = 0;
              return;
            }

            // REGRA OFICIAL DO USUÁRIO: "enquanto o zumbi é atacado ele nao deve caminhar"
            // REGRA OFICIAL DO USUÁRIO: "boss e zumbis devem virar para o lado que esta atacando"
            const targetEnemy = state.enemies?.find(e => (miner.lockedEnemyId && e.id === miner.lockedEnemyId) || (e.gx === tx && e.gy === ty));
            if (targetEnemy) {
              targetEnemy.isUnderAttack = true;
              targetEnemy.attackedTimer = 2.0;
              targetEnemy.isWalking = false;
              targetEnemy.moveCooldown = 2.0;
              targetEnemy.underAttackByHeroId = miner.id;
              const enemyCurrX = targetEnemy.visualX ?? targetEnemy.gx;
              if (Math.abs(miner.x - enemyCurrX) > 0.05) {
                targetEnemy.facingDir = miner.x < enemyCurrX ? -1 : 1;
              }
            }

            if (blockType !== BLOCK_EMPTY && blockType !== BLOCK_BEDROCK) {
              const cid = miner.classId;

              // Regra Oficial 3.1 & 7.0: Produção econômica de MNC contínua por tempo de trabalho ativo dos heróis
              const strikeCoins = parseFloat((((miner.coinsPerHour || 1.40) / 3600) * 0.85).toFixed(4));
              if (strikeCoins > 0) {
                callbacksRef.current.onCollectBcoin?.(strikeCoins);
                if (miner.id) {
                  const ms = state.minerStats[miner.id] || { blocksBroken: 0, bcoinEarned: 0, damageDealt: 0 };
                  ms.bcoinEarned = parseFloat(((ms.bcoinEarned || 0) + strikeCoins).toFixed(4));
                  state.minerStats[miner.id] = ms;
                }
              }

              // Desgaste da durabilidade da arma
              if (miner.durability === undefined) miner.durability = 100;
              miner.durability = Math.max(0, parseFloat((miner.durability - 0.05).toFixed(3)));

              // REGRA OFICIAL DO USUÁRIO: "e se quebrar interrompe a mineração"
              if (miner.durability <= 0) {
                miner.durability = 0;
                miner.isMining = false;
                miner.targetBlock = null;
                miner.swingTimer = 0;
                state.floatTexts.push({
                  text: '🔧 ARMA QUEBRADA!',
                  x: miner.x * TILE_SIZE + TILE_SIZE / 2,
                  y: miner.y * TILE_SIZE - 12,
                  color: '#ef4444',
                  opacity: 1,
                  vy: -30
                });
                return;
              }

              // REGRA OFICIAL DO USUÁRIO: "se baixar de 50% deve diminuir a capacidade de mineração do heroi pela metade"
              const isWeaponDamaged = miner.durability < 50;

              // Bônus de Arma / Picareta: Aumenta Poder e Chance de Crítico
              const weaponPower = miner.equippedGear?.weapon?.powerBonus || 0;
              const weaponCrit = miner.equippedGear?.weapon?.critBonus || 0;

              let basePower = isWeaponDamaged ? Math.max(1, miner.power * 0.5) : miner.power;
              let hitDamage = basePower + weaponPower;
              if (isWeaponDamaged) {
                hitDamage = Math.max(1, Math.floor(hitDamage * 0.5));
              }

              const critChance = (cid === 'brute' ? 0.28 : 0.05) + weaponCrit;
              const isCrit = Math.random() < critChance;
              if (isCrit) {
                hitDamage = hitDamage * 2;
              }

              const isZombie = blockType === BLOCK_ZOMBIE;
              const isBoss = blockType === BLOCK_BOSS;
              const effectiveCurHp = isZombie 
                ? (curHp > 2 ? 2 : curHp) 
                : (isBoss ? (curHp > 30 ? 30 : curHp) : curHp);
              
              // Se a arma estiver danificada (<50%), capacidade reduzida pela metade (50% de chance de causar o dano balístico no zumbi)
              let hitDamageApplied = (isZombie || isBoss) ? (isCrit ? 2 : 1) : hitDamage;
              if (isWeaponDamaged && (isZombie || isBoss)) {
                // Se estiver com <50%, eficácia cai pela metade
                if (Math.random() < 0.5 && !isCrit) {
                  hitDamageApplied = 0;
                  state.floatTexts.push({
                    text: '⚠️ DANO REDUZIDO (50%)',
                    x: tx * TILE_SIZE + TILE_SIZE / 2,
                    y: ty * TILE_SIZE - 8,
                    color: '#f59e0b',
                    opacity: 0.9,
                    vy: -25
                  });
                }
              }
              const newHp = Math.max(0, effectiveCurHp - hitDamageApplied);

              // Textos flutuantes otimizados para manter 60 FPS
              if (isZombie) {
                if (newHp === 1) {
                  state.floatTexts.push({
                    text: '🎯 TIRO 1/2',
                    x: tx * TILE_SIZE + TILE_SIZE / 2,
                    y: ty * TILE_SIZE + 10,
                    color: '#eab308',
                    opacity: 1,
                    vy: -35
                  });
                } else if (newHp <= 0) {
                  state.floatTexts.push({
                    text: isCrit ? '💥 CRÍTICO! (2/2)' : '💀 ABATIDO! (2/2)',
                    x: tx * TILE_SIZE + TILE_SIZE / 2,
                    y: ty * TILE_SIZE + 10,
                    color: isCrit ? '#ef4444' : '#84cc16',
                    opacity: 1,
                    vy: -40
                  });
                }
              } else if (isBoss) {
                const shotCount = 30 - newHp;
                if (newHp <= 0) {
                  state.floatTexts.push({
                    text: '💥 BOSS DERROTADO! (30/30)',
                    x: tx * TILE_SIZE + TILE_SIZE / 2,
                    y: ty * TILE_SIZE + 10,
                    color: '#ef4444',
                    opacity: 1,
                    vy: -45
                  });
                } else {
                  state.floatTexts.push({
                    text: isCrit ? `💥 CRÍTICO! (${shotCount}/30)` : `🎯 TIRO (${shotCount}/30)`,
                    x: tx * TILE_SIZE + TILE_SIZE / 2,
                    y: ty * TILE_SIZE + 10,
                    color: isCrit ? '#f97316' : '#eab308',
                    opacity: 1,
                    vy: -35
                  });
                }
              } else {
                const showFloat = isCrit || Math.random() < 0.25;
                if (showFloat && state.floatTexts.length < 24) {
                  if (isCrit) {
                    sfx.playCritHit?.();
                    state.floatTexts.push({
                      text: `💥 CRÍTICO! -${hitDamage}`,
                      x: tx * TILE_SIZE + TILE_SIZE / 2,
                      y: ty * TILE_SIZE + 10,
                      color: '#f97316',
                      opacity: 1,
                      vy: -45
                    });
                  } else if (cid === 'mage') {
                    state.floatTexts.push({
                      text: isCrit ? `🩸 DRENO! -${hitDamage}` : `-${hitDamage}`,
                      x: tx * TILE_SIZE + TILE_SIZE / 2,
                      y: ty * TILE_SIZE + 10,
                      color: isCrit ? '#ef4444' : '#f87171',
                      opacity: 1,
                      vy: isCrit ? -45 : -35
                    });
                  } else {
                    state.floatTexts.push({
                      text: isWeaponDull ? `⚠️ -${hitDamage}` : `-${hitDamage}`,
                      x: tx * TILE_SIZE + TILE_SIZE / 2,
                      y: ty * TILE_SIZE + 10,
                      color: isWeaponDull ? '#f59e0b' : '#f87171',
                      opacity: 1,
                      vy: -35
                    });
                  }
                }
              }

              // Rastreia dano total infligido pelo herói
              if (miner && miner.id) {
                const ms = state.minerStats[miner.id] || { blocksBroken: 0, bcoinEarned: 0, damageDealt: 0 };
                ms.damageDealt = (ms.damageDealt || 0) + ((isZombie || isBoss) ? hitDamageApplied : hitDamage);
                state.minerStats[miner.id] = ms;
              }

              // Traçantes luminosos e dinâmicos de projétil saindo da arma do herói até o zumbi
              const shotOriginX = mx * TILE_SIZE + TILE_SIZE / 2;
              const shotOriginY = my * TILE_SIZE + TILE_SIZE / 2 - 4;
              const shotTargetX = tx * TILE_SIZE + TILE_SIZE / 2;
              const shotTargetY = ty * TILE_SIZE + TILE_SIZE / 2;
              const shotDist = Math.hypot(shotTargetX - shotOriginX, shotTargetY - shotOriginY);

              const heroInfo = miner.heroId ? getHeroById(miner.heroId) : null;
              const weaponInfo = (miner.weaponId ? getWeaponById(miner.weaponId) : null) || (heroInfo?.weaponId ? getWeaponById(heroInfo.weaponId) : null);
              const wid = weaponInfo?.id || heroInfo?.weaponId || '';

              if (wid === 'grenade') {
                // Granada: detonação com explosão em área no zumbi
                sfx.playDynamiteBlast?.();
                for (let s = 0; s < 14; s++) {
                  const ang = Math.random() * Math.PI * 2;
                  state.sparks.push({
                    x: shotTargetX,
                    y: shotTargetY,
                    vx: Math.cos(ang) * (45 + Math.random() * 80),
                    vy: Math.sin(ang) * (45 + Math.random() * 80) - 15,
                    color: Math.random() > 0.4 ? '#facc15' : (Math.random() > 0.5 ? '#f97316' : '#ef4444'),
                    life: 0.35,
                    maxLife: 0.35
                  });
                }
              } else if (wid === 'flamethrower') {
                // Lança-chamas: cone de fogo contínuo
                for (let b = 1; b <= 5; b++) {
                  const fraction = b / 5;
                  state.sparks.push({
                    x: shotOriginX + (shotTargetX - shotOriginX) * fraction + (Math.random() - 0.5) * 8,
                    y: shotOriginY + (shotTargetY - shotOriginY) * fraction + (Math.random() - 0.5) * 8,
                    vx: ((shotTargetX - shotOriginX) / (shotDist || 1)) * (220 + Math.random() * 80),
                    vy: ((shotTargetY - shotOriginY) / (shotDist || 1)) * (220 + Math.random() * 80),
                    color: Math.random() > 0.4 ? '#f97316' : (Math.random() > 0.5 ? '#fef08a' : '#dc2626'),
                    life: 0.28,
                    maxLife: 0.28
                  });
                }
              } else if (wid === 'molotov') {
                // Molotov: estilhaço de garrafa e labaredas acesas
                sfx.playChestDrop?.();
                for (let s = 0; s < 10; s++) {
                  const ang = Math.random() * Math.PI * 2;
                  state.sparks.push({
                    x: shotTargetX,
                    y: shotTargetY,
                    vx: Math.cos(ang) * (30 + Math.random() * 65),
                    vy: Math.sin(ang) * (30 + Math.random() * 65) - 10,
                    color: Math.random() > 0.4 ? '#f97316' : '#fef08a',
                    life: 0.40,
                    maxLife: 0.40
                  });
                }
              } else {
                // Projétil balístico convencional
                for (let b = 1; b <= 3; b++) {
                  const fraction = b / 4;
                  state.sparks.push({
                    x: shotOriginX + (shotTargetX - shotOriginX) * fraction,
                    y: shotOriginY + (shotTargetY - shotOriginY) * fraction,
                    vx: ((shotTargetX - shotOriginX) / (shotDist || 1)) * 340,
                    vy: ((shotTargetY - shotOriginY) / (shotDist || 1)) * 340,
                    color: isCrit ? '#ef4444' : '#facc15',
                    life: 0.18,
                    maxLife: 0.18
                  });
                }

                // Faíscas visuais no ponto de impacto
                const sparkColor = cid === 'mage' ? '#dc2626' : (isCrit ? '#f97316' : '#fef08a');
                for (let s = 0; s < (isCrit ? 8 : 4); s++) {
                  state.sparks.push({
                    x: tx * TILE_SIZE + TILE_SIZE / 2,
                    y: ty * TILE_SIZE + TILE_SIZE / 2,
                    vx: (Math.random() - 0.5) * 110,
                    vy: (Math.random() - 0.5) * 110,
                    color: sparkColor,
                    life: 0.28,
                    maxLife: 0.28
                  });
                }
              }

              // Passiva do Engenheiro: Dinamite a cada 4 batidas causando splash nos blocos vizinhos
              if (cid === 'engineer') {
                miner.dynamiteCount = (miner.dynamiteCount || 0) + 1;
                if (miner.dynamiteCount >= 4) {
                  miner.dynamiteCount = 0;
                  sfx.playDynamiteBlast?.();
                  state.floatTexts.push({
                    text: `🧨 DINAMITE EM ÁREA!`,
                    x: tx * TILE_SIZE + TILE_SIZE / 2,
                    y: ty * TILE_SIZE - 12,
                    color: '#eab308',
                    opacity: 1,
                    vy: -48
                  });

                  const splashNeighbors = [
                    { x: tx + 1, y: ty },
                    { x: tx - 1, y: ty },
                    { x: tx, y: ty + 1 },
                    { x: tx, y: ty - 1 }
                  ];

                  splashNeighbors.forEach(sn => {
                    if (sn.x >= 0 && sn.x < GRID_COLS && sn.y >= 0 && sn.y < GRID_ROWS) {
                      const sType = state.grid[sn.y][sn.x];
                      if (sType !== BLOCK_EMPTY && sType !== BLOCK_BEDROCK) {
                        const sKey = `${sn.x},${sn.y}`;
                        const sCur = state.hpMap[sKey] || 1;
                        const sDmg = Math.max(1, Math.round(miner.power * 0.8));
                        const sNew = sCur - sDmg;
                        state.floatTexts.push({
                          text: `-${sDmg}`,
                          x: sn.x * TILE_SIZE + TILE_SIZE / 2,
                          y: sn.y * TILE_SIZE + 10,
                          color: '#f59e0b',
                          opacity: 1,
                          vy: -30
                        });
                        if (sNew <= 0) {
                          breakBlockAt(sn.x, sn.y, sType, miner);
                        } else {
                          state.hpMap[sKey] = sNew;
                        }
                      }
                    }
                  });
                }
              }

              // Bloco alvo / zumbi destruído
              if (newHp <= 0) {
                breakBlockAt(tx, ty, blockType, miner);
                miner.lockedEnemyId = null;
                miner.targetBlock = null;
                miner.isMining = false;
                miner.moveCooldown = 0;
              } else {
                state.hpMap[cellKey] = newHp;
              }
            }
          }
          return;
        }

        // Navegação e marcha inteligente em direção à próxima jazida/zumbi do mapa
        // ESTE BLOCO SÓ EXECUTA SE O HERÓI NÃO ESTIVER EM COMBATE ATACANDO UM ZUMBI
        miner.moveCooldown = (miner.moveCooldown || 0) - dt * (miner.speed || 1);

        // REGRA OFICIAL DO USUÁRIO: "QUANDO ISSO ACONTECER DEVE REESPAUNAR EM OUTRO LOCAL LIVRE"
        // Detecção de travamento real: apenas se o herói estiver fora de combate e preso na MESMA célula por mais de 5.0 segundos
        const curTileX = Math.round(miner.x);
        const curTileY = Math.round(miner.y);

        if (!miner.isMining) {
          if (miner.lastTrackedTileX === curTileX && miner.lastTrackedTileY === curTileY) {
            miner.stuckTimer = (miner.stuckTimer || 0) + dt;
          } else {
            miner.lastTrackedTileX = curTileX;
            miner.lastTrackedTileY = curTileY;
            miner.stuckTimer = 0;
          }
        } else {
          miner.stuckTimer = 0;
          miner.lastTrackedTileX = curTileX;
          miner.lastTrackedTileY = curTileY;
        }

        // Se o herói ficou realmente encurralado na mesma célula sem conseguir avançar por mais de 5.0 segundos:
        if (miner.stuckTimer > 5.0) {
          const freeCell = findNearestFreeHeroCell(curTileX, curTileY, miner.id, state.miners, state.grid, isCanyon, state.enemies);
          const fallbackCell = SAFE_HERO_SPAWN_POINTS.find(p => 
            !isCityBuilding(p.x, p.y) && 
            !isBaseCompound(p.x, p.y) && 
            !state.miners.some(o => o.id !== miner.id && Math.round(o.x) === p.x && Math.round(o.y) === p.y)
          ) || { x: 2, y: 5 };

          const targetSpawn = freeCell || fallbackCell;
          miner.x = targetSpawn.x;
          miner.y = targetSpawn.y;
          miner.visualX = targetSpawn.x;
          miner.visualY = targetSpawn.y;
          miner.lastTrackedTileX = targetSpawn.x;
          miner.lastTrackedTileY = targetSpawn.y;
          miner.stuckTimer = 0;
          miner.moveCooldown = 0.35;
          miner.isMining = false;
          miner.lockedEnemyId = null;

          state.floatTexts.push({
            text: '📍 Reespawn Livre',
            x: targetSpawn.x * TILE_SIZE + TILE_SIZE / 2,
            y: targetSpawn.y * TILE_SIZE,
            color: '#38bdf8',
            opacity: 0.9,
            vy: -18
          });
        }

        if (miner.moveCooldown <= 0) {
          miner.moveCooldown = 0.35; // Passo dinâmico calibrado pela velocidade

          const decision = findNextHeroAction(miner, state.grid, state.miners, isCanyon);

          if (decision.action === 'mine' && decision.targetBlock) {
            const curX = Math.round(miner.x);
            const curY = Math.round(miner.y);
            // REGRA OFICIAL DO USUÁRIO:
            // "os herois nao podem travar em locais podendo passar um pelo outro mas nao pararem no mesmo local,
            //  podem passar tambem pelos zumbis mas nao parar no mesmo local que eles, isso faz eles cruzarem pela mesma celula e nao travarem"
            const isOverlappingHero = state.miners.some(o => 
              o.id !== miner.id && 
              o.status === 'work' && 
              o.isMining && 
              Math.round(o.x) === curX && 
              Math.round(o.y) === curY
            );
            const isOverlappingZombie = state.enemies?.some(e => 
              (e.hp === undefined || e.hp > 0) && 
              Math.round(e.gx) === curX && 
              Math.round(e.gy) === curY
            );

            // Não para no mesmo local: se a célula estiver ocupada por outro herói minerando ou zumbi, ajusta para posição livre
            if (isOverlappingHero || isOverlappingZombie) {
              const freeSpot = findNearestFreeHeroCell(curX, curY, miner.id, state.miners, state.grid, isCanyon, state.enemies);
              if (freeSpot) {
                miner.x = freeSpot.x;
                miner.y = freeSpot.y;
              }
            }

            miner.targetBlock = decision.targetBlock;
            miner.targetDir = decision.targetDir;
            miner.isMining = true;
            miner.swingTimer = 0.4;
            const matchedEnemy = state.enemies?.find(e => e.gx === decision.targetBlock.x && e.gy === decision.targetBlock.y);
            if (matchedEnemy) {
              miner.lockedEnemyId = matchedEnemy.id;
              matchedEnemy.isUnderAttack = true;
              matchedEnemy.attackedTimer = 2.0;
              matchedEnemy.isWalking = false;
              matchedEnemy.moveCooldown = 2.0;
              matchedEnemy.underAttackByHeroId = miner.id;
            }
          } else if (decision.action === 'move' && decision.nextStep) {
            // REGRA OFICIAL DO USUÁRIO:
            // "podendo passar um pelo outro mas nao pararem no mesmo local , podem passar tambem pelos zumbis mas nao parar no mesmo local que eles, isso faz eles cruzarem pela mesma celula e nao travarem"
            // Movimentação livre: heróis atravessam outros heróis e zumbis sem bloquear ou pausar
            miner.x = decision.nextStep.x;
            miner.y = decision.nextStep.y;
            if (decision.nextStep.dir) {
              miner.targetDir = decision.nextStep.dir;
            }

            // Ao dar o passo, checa se entrou em alcance de tiro sem parar no mesmo local
            const immediateCheck = findNextHeroAction(miner, state.grid, state.miners, isCanyon);
            if (immediateCheck.action === 'mine' && immediateCheck.targetBlock) {
              const curX = Math.round(miner.x);
              const curY = Math.round(miner.y);
              const isOverlappingHero = state.miners.some(o => 
                o.id !== miner.id && 
                o.status === 'work' && 
                o.isMining && 
                Math.round(o.x) === curX && 
                Math.round(o.y) === curY
              );
              const isOverlappingZombie = state.enemies?.some(e => 
                (e.hp === undefined || e.hp > 0) && 
                Math.round(e.gx) === curX && 
                Math.round(e.gy) === curY
              );

              // Só fixa em combate se não estiver parado exatamente em cima de outro herói ou zumbi
              if (!isOverlappingHero && !isOverlappingZombie) {
                miner.targetBlock = immediateCheck.targetBlock;
                miner.targetDir = immediateCheck.targetDir;
                miner.isMining = true;
                miner.swingTimer = 0.4;
                const matchedEnemy = state.enemies?.find(e => e.gx === immediateCheck.targetBlock.x && e.gy === immediateCheck.targetBlock.y);
                if (matchedEnemy) {
                  miner.lockedEnemyId = matchedEnemy.id;
                  matchedEnemy.isUnderAttack = true;
                  matchedEnemy.attackedTimer = 2.0;
                  matchedEnemy.isWalking = false;
                  matchedEnemy.moveCooldown = 2.0;
                  matchedEnemy.underAttackByHeroId = miner.id;
                }
              }
            }
          }
        }
      });

      // REGRA OFICIAL DO USUÁRIO: "Anti-Stacking de personagens tbm"
      // Passo 3: Atualização visual contínua (lerp) e força de repulsão suave entre heróis
      state.miners.forEach(m => {
        if (m.visualX === undefined || isNaN(m.visualX)) m.visualX = m.x;
        if (m.visualY === undefined || isNaN(m.visualY)) m.visualY = m.y;
        const lerpSpeed = Math.min(1.0, dt * ((m.speed || 1) * 7.5 + 4.0));
        m.visualX += (m.x - m.visualX) * lerpSpeed;
        m.visualY += (m.y - m.visualY) * lerpSpeed;
      });

      const activeMiners = state.miners.filter(m => m.status === 'work');
      for (let i = 0; i < activeMiners.length; i++) {
        const m1 = activeMiners[i];
        for (let j = i + 1; j < activeMiners.length; j++) {
          const m2 = activeMiners[j];
          const dx = m1.visualX - m2.visualX;
          const dy = m1.visualY - m2.visualY;
          const dist = Math.hypot(dx, dy);
          const MIN_HERO_DIST = 0.92; // ~44px de distância mínima
          if (dist < MIN_HERO_DIST && dist > 0.0001) {
            const overlap = MIN_HERO_DIST - dist;
            const pushFactor = (overlap / dist) * 0.45;
            const px = dx * pushFactor;
            const py = dy * pushFactor;

            const n1x = m1.visualX + px;
            const n1y = m1.visualY + py;
            if (!isCityBuilding(Math.round(n1x), Math.round(n1y))) {
              m1.visualX = n1x;
              m1.visualY = n1y;
            }
            const n2x = m2.visualX - px;
            const n2y = m2.visualY - py;
            if (!isCityBuilding(Math.round(n2x), Math.round(n2y))) {
              m2.visualX = n2x;
              m2.visualY = n2y;
            }
          }
        }
      }

      // 1.5. ATUALIZAÇÃO DOS PROJÉTEIS DE GOSMA VERDE (ZUMBIS & BOSS)
      state.slimes = state.slimes || [];
      for (let i = state.slimes.length - 1; i >= 0; i--) {
        const s = state.slimes[i];
        s.progress += dt * s.speed;

        s.currentX = s.startX + (s.targetX - s.startX) * s.progress;
        s.currentY = s.startY + (s.targetY - s.startY) * s.progress - Math.sin(s.progress * Math.PI) * s.arcHeight;

        // Rastro de gotículas de gosma verde
        if (Math.random() < 0.65) {
          state.sparks.push({
            x: s.currentX + (Math.random() - 0.5) * 6,
            y: s.currentY + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            color: Math.random() > 0.4 ? '#84cc16' : '#22c55e',
            life: 0.25,
            maxLife: 0.25
          });
        }

        // Impacto no herói ou solo
        if (s.progress >= 1.0) {
          for (let sp = 0; sp < (s.isBoss ? 12 : 6); sp++) {
            const ang = Math.random() * Math.PI * 2;
            state.sparks.push({
              x: s.targetX,
              y: s.targetY,
              vx: Math.cos(ang) * (25 + Math.random() * 45),
              vy: Math.sin(ang) * (25 + Math.random() * 45),
              color: Math.random() > 0.4 ? '#84cc16' : '#15803d',
              life: 0.30,
              maxLife: 0.30
            });
          }

          const hitHero = state.miners?.find(m => m.id === s.targetHeroId);
          if (hitHero) {
            const maxHealth = Number(hitHero.maxHealth) > 0 ? Number(hitHero.maxHealth) : 100;
            const currentHealth = Number.isFinite(Number(hitHero.currentHealth)) ? Number(hitHero.currentHealth) : maxHealth;
            const healthPct = (currentHealth / maxHealth) * 100;

            // Heróis feridos (5% de vida ou menos) não recebem dano de nenhuma criatura.
            if (hitHero.status === 'work' && healthPct > 5 && !hitHero.injuredAwaitingRescue) {
              const nextHealth = Math.max(maxHealth * 0.05, currentHealth - s.damage);
              hitHero.maxHealth = maxHealth;
              hitHero.currentHealth = nextHealth;

              if ((nextHealth / maxHealth) * 100 <= 5) {
                hitHero.status = 'injured';
                hitHero.injuredAwaitingRescue = true;
                hitHero.isMining = false;
                hitHero.targetBlock = null;
                hitHero.lockedEnemyId = null;
                hitHero.swingTimer = 0;
                hitHero.moveCooldown = 0;
                state.floatTexts.push({
                  text: 'FERIDO! 5% PV',
                  x: s.targetX,
                  y: s.targetY - 14,
                  color: '#fbbf24',
                  opacity: 1.0,
                  vy: -28
                });
              } else {
                state.floatTexts.push({
                  text: `-${s.damage} PV`,
                  x: s.targetX,
                  y: s.targetY - 14,
                  color: '#84cc16',
                  opacity: 1.0,
                  vy: -28
                });
              }
            }
          }

          if (s.isBoss) {
            state.slimePuddles = state.slimePuddles || [];
            state.slimePuddles.push({
              x: s.targetX,
              y: s.targetY,
              radius: 18,
              life: 2.8,
              maxLife: 2.8
            });
          }

          state.slimes.splice(i, 1);
        }
      }

      state.slimePuddles = state.slimePuddles || [];
      for (let i = state.slimePuddles.length - 1; i >= 0; i--) {
        const p = state.slimePuddles[i];
        p.life -= dt;
        if (p.life <= 0) state.slimePuddles.splice(i, 1);
      }

      // 2. PARTÍCULAS & FAÍSCAS
      for (let i = state.sparks.length - 1; i >= 0; i--) {
        const s = state.sparks[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt;
        if (s.life <= 0) state.sparks.splice(i, 1);
      }
      if (state.sparks.length > 60) state.sparks.splice(0, state.sparks.length - 60);

      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) state.particles.splice(i, 1);
      }
      if (state.particles.length > 80) state.particles.splice(0, state.particles.length - 80);

      for (let i = state.floatTexts.length - 1; i >= 0; i--) {
        const ft = state.floatTexts[i];
        ft.y += ft.vy * dt;
        ft.opacity -= dt * 1.1;
        if (ft.opacity <= 0) state.floatTexts.splice(i, 1);
      }
      if (state.floatTexts.length > 32) state.floatTexts.splice(0, state.floatTexts.length - 32);

      // ==========================================
      // RENDERIZAÇÃO EM ALTA DEFINIÇÃO (RETINA)
      // ==========================================
      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      // Verificação do status do Boss para efeitos da torre de sirene e névoa
      const bossEnemy = state.enemies?.find(e => e.type === 'boss' && (e.hp === undefined || e.hp > 0));
      const isBossAlive = Boolean(bossEnemy);

      // REGRA OFICIAL DO USUÁRIO: "quando aparecer o boss coloca um aviso na tela dizendo ALERTA BOSS PISCANDO UMAS 4 VEZES"
      if (bossEnemy && bossEnemy.id !== state.lastSeenBossId) {
        state.lastSeenBossId = bossEnemy.id;
        triggerBossAlert(bossEnemy.id);
      } else if (!isBossAlive) {
        state.lastSeenBossId = null;
      }

      // Sirene de alarme da torre de vigia toca periodicamente enquanto o Boss estiver vivo
      if (isBossAlive) {
        state.sirenSoundTimer = (state.sirenSoundTimer || 0) + dt;
        if (state.sirenSoundTimer >= 2.8) {
          state.sirenSoundTimer = 0;
          sfx.playSirenWail?.();
        }
      } else {
        state.sirenSoundTimer = 0;
      }

      const railY = 5 * TILE_SIZE + 24;
      drawContinuousCaveFloor(ctx, logicalWidth, logicalHeight, mine, now, isBossAlive);
      if (mine?.id === 'canyon') {
        drawBaseShelterVisual(ctx, houseVisualRef.current, state.miners, now);
      }
      if (mine?.id !== 'canyon') {
        drawTunnelPortals(ctx, logicalWidth, railY);
      }

      // 1. Paredões e Pilares Indestrutíveis da Caverna
      // No Mapa da Cidade de Sobrevivência (mine.id === 'canyon'), os edifícios e ruínas já estão
      // perfeitamente ilustrados na arte de fundo (/city_map.webp). Nenhuma pedra de caverna é desenhada.
      if (mine?.id !== 'canyon') {
        for (let r = 0; r < GRID_ROWS; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            const block = state.grid[r][c];
            if (block !== BLOCK_BEDROCK) continue;
            if (r === 0 || r === GRID_ROWS - 1 || c === 0 || c === GRID_COLS - 1) continue;

            const px = c * TILE_SIZE;
            const py = r * TILE_SIZE;
            const sprite = rockSpriteManager.sprites?.rock;

            if (sprite) {
              const aspect = (sprite.width && sprite.height) ? (sprite.width / sprite.height) : 1.05;
              const bW = Math.floor(TILE_SIZE * 0.72);
              const bH = Math.max(20, Math.floor(bW / aspect));
              const bX = px + Math.floor((TILE_SIZE - bW) / 2);
              const bY = py + TILE_SIZE - bH - 2;

              ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
              ctx.beginPath();
              ctx.ellipse(px + TILE_SIZE / 2, py + TILE_SIZE - 2, bW * 0.42, 3.5, 0, 0, Math.PI * 2);
              ctx.fill();

              ctx.drawImage(sprite, bX, bY, bW, bH);
            } else {
              drawVectorCartoonRock(ctx, px, py, TILE_SIZE, 'bedrock', mine, 1, now);
            }
          }
        }
      }

      // 1.8. POÇAS ÁCIDAS BORBULHANTES NO CHÃO (DEIXADAS PELO BOSS)
      if (state.slimePuddles && state.slimePuddles.length > 0) {
        state.slimePuddles.forEach(p => {
          const alpha = Math.min(1, p.life / 0.6) * 0.42;
          ctx.save();
          const pGrad = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.radius);
          pGrad.addColorStop(0, `rgba(132, 204, 22, ${alpha})`);
          pGrad.addColorStop(0.5, `rgba(34, 197, 94, ${alpha * 0.7})`);
          pGrad.addColorStop(1, 'rgba(21, 128, 61, 0)');
          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.radius, p.radius * 0.42, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      // 2. RENDERIZAÇÃO DOS ZUMBIS E DO BOSS COM CAMINHADA E ATAQUE
      if (state.enemies && state.enemies.length > 0) {
        state.enemies.forEach(enemy => {
          drawEnemyCharacter(ctx, enemy, now);
        });
      }

      state.sparks.forEach(s => {
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size || 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2.5. PROJÉTEIS DE GOSMA VERDE (VOANDO EM ARCO PARABÓLICO)
      if (state.slimes && state.slimes.length > 0) {
        state.slimes.forEach(s => {
          ctx.save();
          const r = s.radius || 5;

          // Orbe de gosma luminescente
          const sGrad = ctx.createRadialGradient(s.currentX, s.currentY, 1, s.currentX, s.currentY, r);
          sGrad.addColorStop(0, '#fef08a');
          sGrad.addColorStop(0.35, '#84cc16');
          sGrad.addColorStop(0.85, '#15803d');
          sGrad.addColorStop(1, '#052e16');
          ctx.fillStyle = sGrad;
          ctx.beginPath();
          ctx.arc(s.currentX, s.currentY, r, 0, Math.PI * 2);
          ctx.fill();

          // Contorno de brilho tóxico
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.restore();
        });
      }

      state.miners.forEach((miner, minerIndex) => {
        if (miner.status === 'house' || miner.status === 'waiting_house' || miner.status === 'reserve') return;
        const classInfo = MINER_CLASSES[miner.classId] || MINER_CLASSES.miner;
        const rx = miner.visualX !== undefined ? miner.visualX : miner.x;
        const ry = miner.visualY !== undefined ? miner.visualY : miner.y;
        const mx = rx * TILE_SIZE + TILE_SIZE / 2;
        const my = ry * TILE_SIZE + TILE_SIZE / 2;
        const swingProgress = miner.swingTimer ? Math.max(0, Math.min(1, 1 - (miner.swingTimer / 0.85))) : 0;

        // Garante que o herói SEMPRE esteja virado diretamente para o bloco alvo que está atacando
        let faceDir = miner.targetDir || 1;
        if (miner.targetBlock) {
          if (miner.targetBlock.x < rx) faceDir = -1;
          else if (miner.targetBlock.x > rx) faceDir = 1;
        }

        drawMinerCharacter(ctx, mx, my, miner, classInfo, now, swingProgress, faceDir, minerIndex);
      });

      // Vinheta suave atmosférica para exaltar o visual da cidade
      const vignette = ctx.createRadialGradient(
        logicalWidth / 2, logicalHeight / 2, logicalWidth * 0.40,
        logicalWidth / 2, logicalHeight / 2, logicalWidth * 0.75
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(15, 23, 42, 0.22)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, logicalWidth, logicalHeight);

      // Gestão suave da névoa verde atmosférica enquanto o Boss estiver vivo no mapa
      const targetFogAlpha = isBossAlive ? 1.0 : 0.0;
      if (state.bossFogAlpha === undefined) {
        state.bossFogAlpha = targetFogAlpha;
      } else {
        const fadeSpeed = isBossAlive ? 1.2 : 0.8;
        if (state.bossFogAlpha < targetFogAlpha) {
          state.bossFogAlpha = Math.min(targetFogAlpha, state.bossFogAlpha + dt * fadeSpeed);
        } else if (state.bossFogAlpha > targetFogAlpha) {
          state.bossFogAlpha = Math.max(targetFogAlpha, state.bossFogAlpha - dt * fadeSpeed);
        }
      }

      // Renderiza pequena névoa verde por todo o mapa enquanto o Boss estiver no jogo e vivo
      if (state.bossFogAlpha > 0.005) {
        drawBossGreenFog(ctx, logicalWidth, logicalHeight, state.bossFogAlpha, now, bossEnemy);
      }

      state.floatTexts.forEach(ft => {
        ctx.save();
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.opacity);
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 6;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      ctx.restore();

      // Rotação Automática Inteligente da Mina & Gestão de Vagas da Casa
      if (!state.lastRelayCheck || now - state.lastRelayCheck > 1200) {
        state.lastRelayCheck = now;
        
        // A. Alocar quem está esperando na fila da Casa se houver leito livre
        const capacity = houseConfigRef.current?.houseSlots ?? 5;
        let inHouse = state.miners.filter(m => m.status === 'house').length;
        if (inHouse < capacity) {
          for (const m of state.miners) {
            if (m.status === 'waiting_house' && inHouse < capacity) {
              m.status = 'house';
              inHouse++;
            }
          }
        }

        // B. Manter até 15 mineradores trabalhando (seleção dos mais eficientes)
        const workingCount = state.miners.filter(m => m.status === 'work').length;
        const slotsNeeded = Math.max(0, 15 - workingCount);
        if (slotsNeeded > 0) {
          const readyCandidates = state.miners
            .filter(m => m.status === 'reserve' || m.status === 'sleep')
            .sort((a, b) => (b.power * 1.5 + b.speed * 10) - (a.power * 1.5 + a.speed * 10));

          for (let i = 0; i < Math.min(slotsNeeded, readyCandidates.length); i++) {
            const recruit = readyCandidates[i];
            recruit.status = 'work';
            if (typeof recruit.x !== 'number' || isNaN(recruit.x)) recruit.x = 2;
            if (typeof recruit.y !== 'number' || isNaN(recruit.y)) recruit.y = 8;
          }
        }

        // C. Sincronizar mineradores com a aplicação
        callbacksRef.current.onMinersChange?.(state.miners.map(m => ({ ...m })));
      }

      // Emissão periódica de estatísticas da rodada e previsão dinâmica do mapa
      if (!state.lastStatsEmit || now - state.lastStatsEmit > 750) {
        state.lastStatsEmit = now;
        let remHp = 0;
        for (let k in state.hpMap) remHp += state.hpMap[k];

        let activeDps = 0;
        state.miners.forEach(m => {
          if (m.status === 'work') {
            const swingPerSec = (m.speed * 0.9) / 0.85;
            const critMult = m.classId === 'brute' ? 1.28 : 1.0;
            const weaponPower = m.equippedGear?.weapon?.powerBonus || 0;
            activeDps += (m.power + weaponPower) * critMult * swingPerSec;
          }
        });

        const estSecs = activeDps > 0 ? Math.round(remHp / activeDps) : 0;
        callbacksRef.current.onStatsUpdate?.({
          remainingHp: remHp,
          totalHp: state.totalMapHp || remHp,
          teamDps: parseFloat(activeDps.toFixed(1)),
          estimatedSeconds: estSecs,
          minerStats: { ...state.minerStats }
        });
      }

    } catch (loopErr) {
      console.error('Erro no loop do jogo (capturado com segurança):', loopErr);
    } finally {
      animationId = requestAnimationFrame(gameLoop);
    }
  };

    const handleVisibilityChange = () => {
      gameStateRef.current.lastTime = performance.now();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    animationId = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mine?.id, gameSpeed, spritesReady]);

  // CONTROLE DIRETO POR ARRASTO DO MOUSE NA TORRE DE VIGIA (REGRA: "me permita arrastar com o mouse para ajustar o angulo")
  const dragStartRef = useRef(null);

  const getCanvasCoords = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const logicalWidth = 15 * 48; // 720 (coordenadas lógicas do jogo)
    const logicalHeight = 11 * 48; // 528
    return {
      x: ((clientX - rect.left) / rect.width) * logicalWidth,
      y: ((clientY - rect.top) / rect.height) * logicalHeight
    };
  };

  const handleCanvasMouseDown = (e) => {
    if (typeof window === 'undefined') return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const towerCoords = window.sirenTowerCoordinates || {
      baseX: 174,
      baseY: 335,
      topX: 174,
      topY: 198
    };

    const cfg = window.towerTiltConfig || {};

    // Distância até o topo da torre (sirene)
    const distTop = Math.hypot(coords.x - towerCoords.topX, coords.y - towerCoords.topY);
    // Distância até a base (perna do meio)
    const distBase = Math.hypot(coords.x - towerCoords.baseX, coords.y - towerCoords.baseY);

    // Hitbox ampla cobrindo a torre inteira (fácil de clicar e arrastar com o mouse)
    const isInsideTower = (
      coords.x >= (towerCoords.baseX - 60) &&
      coords.x <= (towerCoords.baseX + 60) &&
      coords.y >= (towerCoords.topY - 40) &&
      coords.y <= (towerCoords.baseY + 30)
    );

    if (distTop < 60 || (isInsideTower && coords.y < (towerCoords.baseY - 25))) {
      // Arrastar para DEITAR a torre sentido a frente (Sul) ou levantar (Norte)
      dragStartRef.current = {
        mode: 'lean',
        startMouseX: coords.x,
        startMouseY: coords.y,
        startTopDeltaX: cfg.topDeltaX ?? 0,
        startTopDeltaY: cfg.topDeltaY ?? 32
      };
      window.isDraggingTowerTop = true;
      if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
      e.preventDefault();
    } else if (distBase < 45 || isInsideTower) {
      // Arrastar a base da torre no solo (Pos X e Pos Y)
      dragStartRef.current = {
        mode: 'pos',
        startMouseX: coords.x,
        startMouseY: coords.y,
        startOffsetX: cfg.offsetX || 0,
        startOffsetY: cfg.offsetY || 0
      };
      if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (typeof window === 'undefined') return;
      const coords = getCanvasCoords(e.clientX, e.clientY);
      const towerCoords = window.sirenTowerCoordinates;

      // Feedback do cursor sobre a torre
      if (!dragStartRef.current && towerCoords && canvasRef.current) {
        const isNearTower = (
          coords.x >= (towerCoords.baseX - 55) &&
          coords.x <= (towerCoords.baseX + 55) &&
          coords.y >= (towerCoords.topY - 35) &&
          coords.y <= (towerCoords.baseY + 25)
        );
        if (isNearTower) {
          canvasRef.current.style.cursor = 'grab';
        } else if (canvasRef.current.style.cursor === 'grab') {
          canvasRef.current.style.cursor = 'default';
        }
      }

      if (!dragStartRef.current) return;
      const { mode, startMouseX, startMouseY, startTopDeltaX, startTopDeltaY, startOffsetX, startOffsetY } = dragStartRef.current;
      const deltaX = coords.x - startMouseX;
      const deltaY = coords.y - startMouseY;

      if (mode === 'lean') {
        // Arrastar para baixo (+deltaY) = DEITAR para a FRENTE (perna do meio / Sul)
        // Arrastar para cima (-deltaY) = LEVANTAR / pender para trás (Norte)
        const nextTopDeltaX = Math.round(startTopDeltaX + deltaX);
        const nextTopDeltaY = Math.max(-50, Math.min(100, Math.round(startTopDeltaY + deltaY)));

        const updated = {
          ...(window.towerTiltConfig || {}),
          topDeltaX: nextTopDeltaX,
          topDeltaY: nextTopDeltaY
        };

        if (window.saveTowerConfig) {
          window.saveTowerConfig(updated);
        }
        window.dispatchEvent(new CustomEvent('cryptozombies_tower_config_updated', { detail: updated }));
      } else if (mode === 'pos') {
        const updated = {
          ...(window.towerTiltConfig || {}),
          offsetX: Math.round(startOffsetX + deltaX),
          offsetY: Math.round(startOffsetY + deltaY)
        };

        if (window.saveTowerConfig) {
          window.saveTowerConfig(updated);
        }
        window.dispatchEvent(new CustomEvent('cryptozombies_tower_config_updated', { detail: updated }));
      }
    };

    const handleGlobalMouseUp = () => {
      if (dragStartRef.current) {
        dragStartRef.current = null;
        if (typeof window !== 'undefined') {
          window.isDraggingTowerTop = false;
        }
        if (canvasRef.current && canvasRef.current.style.cursor === 'grabbing') {
          canvasRef.current.style.cursor = 'grab';
        }
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const handleCanvasClick = (e) => {
    // Carrinho roda exclusivamente pelos trilhos sem conceder bônus (conforme solicitado)
  };

  return (
    <div className="relative inline-flex items-center justify-center border-4 border-amber-950/60 rounded-3xl overflow-hidden shadow-[0_0_90px_rgba(0,0,0,0.95)] bg-slate-950 ring-2 ring-amber-500/20 max-h-[calc(100vh-16px)] max-w-full">
      <canvas 
        ref={canvasRef} 
        className="block max-w-full max-h-[calc(100vh-24px)] w-auto h-auto object-contain select-none"
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasMouseDown}
      />

      {/* REGRA OFICIAL DO USUÁRIO: "ALERTA DE BOSS", "deve ficar bem no meio do mapa", "poem uma sombra vermelha", "PISCANDO UMAS 4 VEZES" */}
      {bossAlert && (
        <div 
          key={bossAlertKey}
          className="absolute inset-0 z-40 pointer-events-none select-none flex items-center justify-center"
        >
          <div 
            className="boss-alert-flashing relative flex flex-col items-center justify-center"
            onAnimationEnd={() => setBossAlert(false)}
          >
            {/* Brilho e sombra ambiental vermelha profunda no fundo */}
            <div className="absolute w-[120%] h-[120%] rounded-full bg-red-600/35 blur-3xl pointer-events-none" />

            {/* Emblema Oficial com Sombra Vermelha Intensa */}
            <img 
              src="/enemies/boss_alert.png" 
              alt="Alerta de Boss" 
              className="relative w-[340px] md:w-[420px] max-w-[85vw] h-auto object-contain select-none pointer-events-none"
              style={{
                filter: 'drop-shadow(0 0 25px rgba(239, 68, 68, 0.95)) drop-shadow(0 0 55px rgba(220, 38, 38, 0.85)) drop-shadow(0 12px 24px rgba(153, 27, 27, 0.9))'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
