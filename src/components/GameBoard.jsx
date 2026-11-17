import React, { useRef, useEffect, useState } from 'react';
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
import { recordDepositDamage } from '../utils/individualMapEngine';
import { syncEnemiesWithMap, updateEnemies, drawEnemyCharacter } from '../utils/enemySystem';
import { BOMB_CRYPTO_REWARDS } from '../data/bombCryptoEconomy';
import { 
  drawContinuousCaveFloor, 
  drawVectorCartoonRock, 
  drawMinerCharacter,
  initCanyonMap
} from '../utils/renderGraphics';
import { drawMinecart, drawTunnelPortals, initMinecartSprite } from '../utils/minecartRenderer';
import { rockSpriteManager } from '../utils/rockSprites';
import { characterSpriteManager } from '../utils/characterSprites';
import { rollMiningGearDrop } from '../data/gearData';
import { sfx } from '../utils/sfx';
import { getCanyonTrackPosition, isCanyonTrackOrTunnel } from '../utils/canyonGeometry';
import { findNextHeroAction } from '../utils/minerPathfinding';

export default function GameBoard({ 
  mine, 
  mapData, 
  miners, 
  playerId = 'player_default',
  onDepositBroken,
  onMinersChange, 
  onCollectBcoin, 
  onRescueMiner, 
  onFindMysticChest,
  onMapCleared,
  onStatsUpdate,
  onDropGear,
  statsResetTrigger = 0,
  houseStaminaRate = 2.5,
  houseSlots = 5,
  gameSpeed = 1 
}) {
  const canvasRef = useRef(null);
  const [spritesReady, setSpritesReady] = useState(false);

  const callbacksRef = useRef({});
  callbacksRef.current = {
    playerId,
    onDepositBroken,
    onCollectBcoin,
    onRescueMiner,
    onFindMysticChest,
    onMapCleared,
    onStatsUpdate,
    onDropGear,
    onMinersChange
  };

  const houseConfigRef = useRef({ houseSlots, houseStaminaRate });
  houseConfigRef.current = { houseSlots, houseStaminaRate };

  const gameStateRef = useRef({
    grid: mapData.grid,
    hpMap: mapData.hpMap,
    totalMapHp: Object.values(mapData.hpMap).reduce((a, b) => a + b, 0),
    minerStats: {},
    lastStatsEmit: 0,
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
    // Evita recarregar a malha e desincronizar o estado dos heróis se o id do mapa for o mesmo
    if (currentKey && currentKey === lastMapIdRef.current && gameStateRef.current.grid) {
      return;
    }
    lastMapIdRef.current = currentKey;
    gameStateRef.current.grid = mapData.grid.map(row => [...row]);
    gameStateRef.current.hpMap = { ...(mapData.hpMap || {}) };
    gameStateRef.current.totalMapHp = Object.values(mapData.hpMap || {}).reduce((a, b) => a + b, 0);
    gameStateRef.current.isMapClearing = false;
    gameStateRef.current.enemies = syncEnemiesWithMap([], mapData, gameStateRef.current.grid, gameStateRef.current.hpMap);
  }, [mapData?.mapId, mapData?.id]);

  useEffect(() => {
    if (statsResetTrigger > 0) {
      gameStateRef.current.minerStats = {};
    }
  }, [statsResetTrigger]);

  useEffect(() => {
    const isCanyon = (mine?.id === 'canyon' || !mine?.id);
    const current = gameStateRef.current.miners;
    gameStateRef.current.miners = miners.map((m, idx) => {
      const existing = current.find(em => em.id === m.id);
      let initX = existing ? existing.x : m.x;
      let initY = existing ? existing.y : m.y;

      // Se for no Cânion e a posição for inválida ou cair dentro da estrutura da entrada da mina, realoca para chão aberto
      const isInTunnelEntrance = Math.round(initX) >= 6 && Math.round(initX) <= 10 && Math.round(initY) >= 3 && Math.round(initY) <= 6;
      if (typeof initX !== 'number' || isNaN(initX) || (isCanyon && isInTunnelEntrance)) {
        initX = 2 + (idx % 2);
        initY = 7 + (Math.floor(idx / 2) % 2);
      }

      if (existing) {
        return { 
          ...m, 
          x: initX, 
          y: initY, 
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
        moveCooldown: 0, 
        isMining: false, 
        targetBlock: null, 
        swingTimer: 0, 
        targetDir: 1 
      };
    });
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
    canvas.style.width = `${logicalWidth}px`;
    canvas.style.height = `${logicalHeight}px`;

    let animationId;

    const gameLoop = (now) => {
      try {
        const state = gameStateRef.current;
      const rawDt = (now - state.lastTime) / 1000;
      state.lastTime = now;
      const dt = Math.min(rawDt, 0.1) * gameSpeed;
      const isCanyon = (mine?.id === 'canyon' || !mine?.id);

      // Atualiza movimentação de caminhada e combate dos Zumbis e Boss
      if (mapData) {
        state.enemies = syncEnemiesWithMap(state.enemies || [], mapData, state.grid, state.hpMap);
        updateEnemies(state.enemies, state, dt, now, isCanyon);
      }

      // 1. ATUALIZAR MINERADORES
      // Aura de Regeneração do Guardião Ancestral
      const hasWorkingLegendary = state.miners.some(m => m.classId === 'legendary' && m.status === 'work');
      if (hasWorkingLegendary) {
        state.legendaryAuraTimer = (state.legendaryAuraTimer || 0) + dt;
        if (state.legendaryAuraTimer >= 1.6) {
          state.legendaryAuraTimer = 0;
          state.miners.forEach(other => {
            if (other.status === 'work' && other.classId !== 'legendary' && other.currentStamina < other.maxStamina) {
              other.currentStamina = Math.min(other.maxStamina, other.currentStamina + 1.2);
              state.floatTexts.push({
                text: `+STA ⚡`,
                x: Math.round(other.x) * TILE_SIZE + TILE_SIZE / 2,
                y: Math.round(other.y) * TILE_SIZE - 8,
                color: '#34d399',
                opacity: 0.9,
                vy: -22
              });
            }
          });
        }
      }

      // Função auxiliar para quebrar bloco e conceder recompensa BCOIN
      const breakBlockAt = (bx, by, bType, hitter) => {
        const cKey = `${bx},${by}`;
        delete state.hpMap[cKey];
        state.grid[by][bx] = BLOCK_EMPTY;
        // Notifica todos os mineradores que estavam atacando esta jazida para liberarem o alvo
        state.miners.forEach(m => {
          if (m.targetBlock && m.targetBlock.x === bx && m.targetBlock.y === by) {
            m.isMining = false;
            m.targetBlock = null;
            m.swingTimer = 0;
            m.moveCooldown = 0; // Libera movimento imediato para a próxima jazida
          }
        });

        // Notifica e remove o inimigo (Zumbi ou Boss) correspondente
        if (state.enemies) {
          const eIdx = state.enemies.findIndex(e => e.gx === bx && e.gy === by);
          if (eIdx !== -1) {
            const defeated = state.enemies[eIdx];
            state.enemies.splice(eIdx, 1);
            const isBoss = defeated.type === 'boss';

            for (let p = 0; p < (isBoss ? 28 : 12); p++) {
              state.particles.push({
                x: bx * TILE_SIZE + TILE_SIZE / 2,
                y: by * TILE_SIZE + TILE_SIZE / 2,
                vx: (Math.random() - 0.5) * (isBoss ? 200 : 130),
                vy: (Math.random() - 0.5) * (isBoss ? 200 : 130) - 25,
                color: isBoss ? '#ef4444' : '#84cc16',
                size: Math.random() * 4 + 2,
                life: 0.6,
                maxLife: 0.6
              });
            }

            if (isBoss) {
              sfx.playChestOpen?.();
              state.floatTexts.push({
                text: '💀 BOSS MUTANTE DERROTADO! +BÔNUS',
                x: bx * TILE_SIZE + TILE_SIZE / 2,
                y: by * TILE_SIZE - 12,
                color: '#facc15',
                opacity: 1.0,
                vy: -25
              });
              callbacksRef.current.onFindMysticChest?.({
                type: 'boss_defeat_reward',
                rewardMnc: 25,
                title: 'Abominação Mutante Derrotada'
              });
            }
          }
        }

        // Rastreamento de estatísticas da rodada (Pedras destruídas pelo herói)
        if (hitter && hitter.id) {
          const ms = state.minerStats[hitter.id] || { blocksBroken: 0, bcoinEarned: 0, damageDealt: 0 };
          ms.blocksBroken = (ms.blocksBroken || 0) + 1;
          state.minerStats[hitter.id] = ms;
        }

        // Partículas de impacto mineral
        for (let p = 0; p < 8; p++) {
          state.particles.push({
            x: bx * TILE_SIZE + TILE_SIZE / 2,
            y: by * TILE_SIZE + TILE_SIZE / 2,
            vx: (Math.random() - 0.5) * 120,
            vy: (Math.random() - 0.5) * 120,
            color: bType === BLOCK_ORE_GOLD ? '#facc15' : (bType === BLOCK_ORE_CRYSTAL ? '#38bdf8' : '#c27f42'),
            size: Math.random() * 3.5 + 2,
            life: 0.45,
            maxLife: 0.45
          });
        }

        sfx.playRockHit();

        // Registra a destruição da jazida no motor de mapas individuais (Lógica Estritamente Visual)
        const pId = callbacksRef.current.playerId || 'player_default';
        const mapDamageResult = recordDepositDamage(pId, bx, by, 999999);
        if (mapDamageResult?.deposit) {
          callbacksRef.current.onDepositBroken?.(mapDamageResult);
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

        if ((breakableCount === 0 || mapDamageResult?.cycleCompleted) && !state.isMapClearing) {
          state.isMapClearing = true;
          callbacksRef.current.onMapCleared?.(mapDamageResult?.newMap);
        }
      };

      state.miners.forEach(miner => {
        // 1. Descanso na Casa (Recuperação rápida e transição para reserva quando 100%)
        if (miner.status === 'house') {
          miner.isMining = false;
          miner.targetBlock = null;
          if (miner.currentStamina < miner.maxStamina) {
            const staminaRate = houseConfigRef.current?.houseStaminaRate || 2.5;
            miner.currentStamina = Math.min(miner.maxStamina, miner.currentStamina + dt * (staminaRate * 0.25));
          }
          if (miner.currentStamina >= miner.maxStamina) {
            miner.currentStamina = miner.maxStamina;
            miner.status = 'reserve'; // 100% recuperado: vai para a fila de reservas da mina
          }
          return;
        }

        // 2. Fila de espera por vaga na Casa
        if (miner.status === 'waiting_house') {
          miner.isMining = false;
          miner.targetBlock = null;
          return;
        }

        // 3. Reserva (descanso natural leve)
        if (miner.status === 'reserve') {
          miner.isMining = false;
          miner.targetBlock = null;
          if (miner.currentStamina < miner.maxStamina) {
            miner.currentStamina = Math.min(miner.maxStamina, miner.currentStamina + dt * 0.02);
          }
          return;
        }

        // 4. Descanso no Chão da Mina (Lento: modelo de ~5h por mapa)
        if (miner.status === 'sleep') {
          if (isCanyon && isCanyonTrackOrTunnel(Math.round(miner.x), Math.round(miner.y), GRID_COLS, GRID_ROWS)) {
            miner.x = 2;
            miner.y = 8;
          }
          miner.isMining = false;
          miner.targetBlock = null;
          if (miner.currentStamina < miner.maxStamina) {
            miner.currentStamina = Math.min(miner.maxStamina, miner.currentStamina + dt * 0.035);
          }
          if (miner.currentStamina >= miner.maxStamina) {
            miner.currentStamina = miner.maxStamina;
            miner.status = 'reserve';
          }
          return;
        }

        // 5. Energia esgotada na mineração ativa: sai da mina e vai para a fila da casa
        if (miner.currentStamina <= 0) {
          miner.currentStamina = 0;
          miner.status = 'waiting_house';
          miner.isMining = false;
          miner.targetBlock = null;
          return;
        }

        if (typeof miner.x !== 'number' || isNaN(miner.x)) miner.x = 2;
        if (typeof miner.y !== 'number' || isNaN(miner.y)) miner.y = 8;

        const mx = Math.max(1, Math.min(GRID_COLS - 2, Math.round(miner.x)));
        const my = Math.max(1, Math.min(GRID_ROWS - 2, Math.round(miner.y)));

        // Garante que nenhum herói fique preso dentro da estrutura física de madeira da entrada da mina
        if (isCanyon && (mx >= 6 && mx <= 10 && my >= 3 && my <= 6)) {
          miner.x = 2;
          miner.y = 8;
          miner.targetBlock = null;
          miner.isMining = false;
        }

        // Se o herói já tem um bloco alvo, valida se ele ainda existe, se tem HP e se o herói ainda está adjacente
        if (miner.targetBlock) {
          const { x: tx, y: ty } = miner.targetBlock;
          const currentType = state.grid[ty] ? state.grid[ty][tx] : BLOCK_EMPTY;
          const isAdjacent = Math.abs(tx - mx) + Math.abs(ty - my) === 1;
          const cellKey = `${tx},${ty}`;
          const hasHp = state.hpMap[cellKey] !== undefined && state.hpMap[cellKey] > 0;
          if (currentType === BLOCK_EMPTY || currentType === BLOCK_BEDROCK || !isAdjacent || !hasHp) {
            miner.targetBlock = null;
            miner.isMining = false;
            miner.moveCooldown = 0;
          }
        }

        // Se o herói está sem alvo ou não está minerando, busca a próxima jazida imediatamente
        if (!miner.targetBlock || !miner.isMining) {
          const decision = findNextHeroAction(miner, state.grid, state.miners, isCanyon);
          if (decision.action === 'mine' && decision.targetBlock) {
            miner.targetBlock = decision.targetBlock;
            miner.targetDir = decision.targetDir;
            miner.isMining = true;
            miner.swingTimer = 0.5;
          }
        }

        if (miner.isMining && miner.targetBlock) {
          // Garante que o herói SEMPRE esteja virado diretamente para a jazida que está atacando
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
              miner.targetBlock = null;
              miner.isMining = false;
              miner.moveCooldown = 0;
              return;
            }

            if (blockType !== BLOCK_EMPTY && blockType !== BLOCK_BEDROCK) {
              const cid = miner.classId;

              // Regra Oficial 4.0: Consumo de estamina de 12 por hora de trabalho ativo (0.20/min)
              let staminaCost = parseFloat(((12 / 3600) * 0.85).toFixed(4));
              if (miner.equippedGear?.helmet?.staminaDiscount) {
                staminaCost *= (1 - miner.equippedGear.helmet.staminaDiscount);
              }
              miner.currentStamina = Math.max(0, miner.currentStamina - staminaCost);

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

              // Desgaste suave da durabilidade (ferramenta dura múltiplos mapas)
              if (miner.durability === undefined) miner.durability = 100;
              miner.durability = Math.max(0, parseFloat((miner.durability - 0.005).toFixed(3)));
              const isWeaponDull = miner.durability <= 15;

              // Bônus de Arma / Picareta: Aumenta Poder e Chance de Crítico
              const weaponPower = miner.equippedGear?.weapon?.powerBonus || 0;
              const weaponCrit = miner.equippedGear?.weapon?.critBonus || 0;

              let hitDamage = miner.power + weaponPower;
              if (isWeaponDull) {
                hitDamage = Math.max(1, Math.floor(hitDamage * 0.5));
              }

              const critChance = (cid === 'brute' ? 0.28 : 0.05) + weaponCrit;
              const isCrit = Math.random() < critChance;
              if (isCrit) {
                hitDamage = hitDamage * 2;
              }

              // Textos flutuantes otimizados para manter 60 FPS
              const showFloat = isCrit || Math.random() < 0.25;
              if (showFloat && state.floatTexts.length < 24) {
                if (isCrit) {
                  sfx.playCritHit();
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

              const newHp = curHp - hitDamage;

              // Rastreia dano total infligido pelo herói
              if (miner && miner.id) {
                const ms = state.minerStats[miner.id] || { blocksBroken: 0, bcoinEarned: 0, damageDealt: 0 };
                ms.damageDealt = (ms.damageDealt || 0) + hitDamage;
                state.minerStats[miner.id] = ms;
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

              // Passiva do Engenheiro: Dinamite a cada 4 batidas causando splash nos blocos vizinhos
              if (cid === 'engineer') {
                miner.dynamiteCount = (miner.dynamiteCount || 0) + 1;
                if (miner.dynamiteCount >= 4) {
                  miner.dynamiteCount = 0;
                  sfx.playDynamiteBlast();
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

              // Bloco alvo destruído
              if (newHp <= 0) {
                breakBlockAt(tx, ty, blockType, miner);
              } else {
                state.hpMap[cellKey] = newHp;
              }
            }
          }
          return;
        }

        // Navegação e marcha inteligente em direção à próxima jazida do mapa
        miner.moveCooldown = (miner.moveCooldown || 0) - dt * (miner.speed || 1);

        if (miner.moveCooldown <= 0) {
          miner.moveCooldown = 0.35; // Passo dinâmico calibrado pela velocidade

          const decision = findNextHeroAction(miner, state.grid, state.miners, isCanyon);

          if (decision.action === 'mine' && decision.targetBlock) {
            miner.targetBlock = decision.targetBlock;
            miner.targetDir = decision.targetDir;
            miner.isMining = true;
            miner.swingTimer = 0.5;
          } else if (decision.action === 'move' && decision.nextStep) {
            miner.x = decision.nextStep.x;
            miner.y = decision.nextStep.y;
            if (decision.nextStep.dir) {
              miner.targetDir = decision.nextStep.dir;
            }

            // Ao dar o passo, checa imediatamente se já encostou na jazida
            const immediateCheck = findNextHeroAction(miner, state.grid, state.miners, isCanyon);
            if (immediateCheck.action === 'mine' && immediateCheck.targetBlock) {
              miner.targetBlock = immediateCheck.targetBlock;
              miner.targetDir = immediateCheck.targetDir;
              miner.isMining = true;
              miner.swingTimer = 0.5;
            }
          }
        }
      });

      // 2. PARTÍCULAS & FAÍSCAS
      for (let i = state.sparks.length - 1; i >= 0; i--) {
        const s = state.sparks[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt;
        if (s.life <= 0) state.sparks.splice(i, 1);
      }

      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) state.particles.splice(i, 1);
      }

      for (let i = state.floatTexts.length - 1; i >= 0; i--) {
        const ft = state.floatTexts[i];
        ft.y += ft.vy * dt;
        ft.opacity -= dt * 1.1;
        if (ft.opacity <= 0) state.floatTexts.splice(i, 1);
      }

      // ==========================================
      // RENDERIZAÇÃO EM ALTA DEFINIÇÃO (RETINA)
      // ==========================================
      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      const railY = 5 * TILE_SIZE + 24;
      drawContinuousCaveFloor(ctx, logicalWidth, logicalHeight, mine, now);
      if (mine?.id !== 'canyon') {
        drawTunnelPortals(ctx, logicalWidth, railY);
      }

      // 1. Paredões e Pilares Indestrutíveis da Caverna
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const block = state.grid[r][c];
          if (block !== BLOCK_BEDROCK) continue;
          if (isCanyon && isCanyonTrackOrTunnel(c, r, GRID_COLS, GRID_ROWS)) continue;

          // No Cânion, bordas são os próprios paredões naturais da arte de fundo
          if (mine?.id === 'canyon' && (r === 0 || r === GRID_ROWS - 1 || c === 0 || c === GRID_COLS - 1)) {
            continue;
          }

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

      state.miners.forEach(miner => {
        if (miner.status === 'house' || miner.status === 'waiting_house' || miner.status === 'reserve') return;
        const classInfo = MINER_CLASSES[miner.classId] || MINER_CLASSES.miner;
        const mx = miner.x * TILE_SIZE + TILE_SIZE / 2;
        const my = miner.y * TILE_SIZE + TILE_SIZE / 2;
        const swingProgress = miner.swingTimer ? Math.max(0, Math.min(1, 1 - (miner.swingTimer / 0.85))) : 0;

        // Garante que o herói SEMPRE esteja virado diretamente para o bloco alvo que está atacando
        let faceDir = miner.targetDir || 1;
        if (miner.targetBlock) {
          if (miner.targetBlock.x < miner.x) faceDir = -1;
          else if (miner.targetBlock.x > miner.x) faceDir = 1;
        }

        drawMinerCharacter(ctx, mx, my, miner, classInfo, now, swingProgress, faceDir);
      });

      // Carrinhos de Minérios Estáticos (conforme solicitação do usuário: um no começo e outro entre a 2ª e 3ª curva)
      if (isCanyon) {
        // 1. Carrinho estático no começo dos trilhos (reta horizontal inicial)
        const cartPos1 = getCanyonTrackPosition(0.08, logicalWidth, logicalHeight);
        drawMinecart(ctx, cartPos1.x, cartPos1.y, 0, cartPos1.angle);

        // 2. Carrinho estático no topo, entre a 2ª e a 3ª curva (reta horizontal superior)
        const cartPos2 = getCanyonTrackPosition(0.46, logicalWidth, logicalHeight);
        drawMinecart(ctx, cartPos2.x, cartPos2.y, 0, cartPos2.angle);
      } else {
        // Mapa clássico: dois carrinhos estáticos sobre os trilhos da linha 5
        drawMinecart(ctx, 120, railY, 0, 0);
        drawMinecart(ctx, logicalWidth * 0.55, railY, 0, 0);
      }

      // Vinheta atmosférica (suave no cânion para exaltar o visual dourado e os detalhes dos penhascos)
      const vignette = ctx.createRadialGradient(
        logicalWidth / 2, logicalHeight / 2, logicalWidth * 0.35,
        logicalWidth / 2, logicalHeight / 2, logicalWidth * 0.68
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, mine?.id === 'canyon' ? 'rgba(30, 16, 7, 0.35)' : 'rgba(3, 7, 18, 0.55)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, logicalWidth, logicalHeight);

      state.floatTexts.forEach(ft => {
        ctx.save();
        ctx.font = 'bold 13px var(--font-tech)';
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
        const capacity = houseConfigRef.current?.houseSlots || 5;
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
            .filter(m => (m.status === 'reserve' || m.status === 'sleep') && m.currentStamina >= (m.maxStamina * 0.25))
            .sort((a, b) => {
              const effB = (b.power * 1.5 + b.speed * 10) * (b.currentStamina / b.maxStamina);
              const effA = (a.power * 1.5 + a.speed * 10) * (a.currentStamina / a.maxStamina);
              return effB - effA;
            });

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
          if (m.status === 'work' && m.currentStamina > 0) {
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

  const handleCanvasClick = (e) => {
    // Carrinho roda exclusivamente pelos trilhos sem conceder bônus (conforme solicitado)
  };

  return (
    <div className="relative inline-block border-4 border-amber-950/60 rounded-3xl overflow-hidden shadow-[0_0_90px_rgba(0,0,0,0.95)] bg-slate-950 ring-2 ring-amber-500/20">
      <canvas 
        ref={canvasRef} 
        className="block cursor-pointer"
        onClick={handleCanvasClick}
      />
    </div>
  );
}
