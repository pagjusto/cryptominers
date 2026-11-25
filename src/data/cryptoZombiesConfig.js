// CRYPTOZOMBIES — CONFIGURAÇÃO OFICIAL DE ECONOMIA, BAÚS, CASAS E ATRIBUTOS
// Permite edição administrativa e sincronização em tempo real entre o jogo real e o Simulador de ROI.

const CONFIG_STORAGE_KEY = 'crypto_zombies_admin_config_v1';
const LEGACY_CONFIG_STORAGE_KEY = 'cripto_myners_admin_config_v1';

export const DEFAULT_CRYPTO_ZOMBIES_CONFIG = {
  // Cotação da Coins (Coins) em USDT: 1 Coins = US$ 0,01 oficial
  minerCoinUsdtRate: 0.01,

  // Limite da Mina
  maxActiveMiners: 15,

  // 1. SISTEMA DE BAÚS (Probabilidades Normais vs. Com Anúncio Recompensado)
  chests: {
    miner: {
      id: 'miner',
      name: 'Baú Miner',
      tagline: 'Recrutamento Individual',
      heroesCount: 1,
      costUsdt: 31.31,
      icon: '⛏️',
      image: '/items/hero_chest.png',
      color: '#38bdf8',
      description: 'Entrega 1 herói minerador. Ideal para iniciar sua jornada na mina subterrânea.',
      normalProbabilities: {
        common: 70,
        rare: 20,
        epic: 8,
        legendary: 2
      },
      adBonusProbabilities: {
        common: 64,
        rare: 22,
        epic: 11,
        legendary: 3
      },
      probabilities: {
        common: 70,
        rare: 20,
        epic: 8,
        legendary: 2
      }
    },
    explorer: {
      id: 'explorer',
      name: 'Baú de Herói',
      tagline: 'Esquadrão de Heróis',
      heroesCount: 5,
      costUsdt: 156.57,
      icon: '🗺️',
      image: '/items/hero_chest.png',
      color: '#22c55e',
      popular: true,
      description: 'Entrega 5 heróis combatentes com chances elevadas de heróis Raros e Épicos. Não concede recompensa em moedas, apenas heróis.',
      normalProbabilities: {
        common: 55,
        rare: 27,
        epic: 14,
        legendary: 4
      },
      adBonusProbabilities: {
        common: 48,
        rare: 29,
        epic: 17,
        legendary: 6
      },
      probabilities: {
        common: 55,
        rare: 27,
        epic: 14,
        legendary: 4
      }
    },
    elite: {
      id: 'elite',
      name: 'Baú Elite',
      tagline: 'Companhia de Elite',
      heroesCount: 10,
      costUsdt: 300.61,
      icon: '🛡️',
      image: '/items/hero_chest.png',
      color: '#a855f7',
      description: 'Entrega 10 heróis mineradores. Probabilidade expressiva de Épicos e Lendários com desconto no pacote.',
      normalProbabilities: {
        common: 40,
        rare: 30,
        epic: 22,
        legendary: 8
      },
      adBonusProbabilities: {
        common: 32,
        rare: 32,
        epic: 25,
        legendary: 11
      },
      probabilities: {
        common: 40,
        rare: 30,
        epic: 22,
        legendary: 8
      }
    },
    legendary: {
      id: 'legendary',
      name: 'Baú Legendary',
      tagline: 'Full Team (Mina Completa 15/15)',
      heroesCount: 15,
      costUsdt: 432.13,
      icon: '👑',
      image: '/items/hero_chest.png',
      color: '#f59e0b',
      badge: 'TIME COMPLETO (15)',
      description: 'Entrega 15 heróis mineradores (capacidade máxima de trabalho simultâneo). Maior chance de Lendários do jogo!',
      normalProbabilities: {
        common: 25,
        rare: 30,
        epic: 30,
        legendary: 15
      },
      adBonusProbabilities: {
        common: 16,
        rare: 34,
        epic: 33,
        legendary: 17
      },
      probabilities: {
        common: 25,
        rare: 30,
        epic: 30,
        legendary: 15
      }
    }
  },

  // 2. SISTEMA DE CASAS (Capacidade de descanso e velocidade de recuperação relativa)
  houses: {
    none: {
      id: 'none',
      name: 'Sem Casa (Chão da Mina)',
      slots: 0,
      recoverySpeedMultiplier: 0.5, // 50% de velocidade se não tiver casa
      costUsdt: 0,
      icon: '⛺',
      color: '#64748b',
      description: 'Os sobreviventes aguardam no chão da caverna. Recuperação lenta.'
    },
    basic: {
      id: 'basic',
      name: 'Abrigo Básico',
      slots: 5,
      recoverySpeedMultiplier: 1.0, // 100% de velocidade base
      costUsdt: 25,
      icon: '🛖',
      color: '#38bdf8',
      description: 'Acomoda até 5 sobreviventes em tratamento simultaneamente com 100% da velocidade padrão.'
    },
    reinforced: {
      id: 'reinforced',
      name: 'Abrigo Reforçado',
      slots: 10,
      recoverySpeedMultiplier: 1.25, // 125%
      costUsdt: 50,
      icon: '🏡',
      color: '#22c55e',
      description: 'Acomoda até 10 personagens com recuperação 125% (+25% mais veloz que a básica).'
    },
    advanced: {
      id: 'advanced',
      name: 'Abrigo Avançado',
      slots: 15,
      recoverySpeedMultiplier: 1.50, // 150%
      costUsdt: 85,
      icon: '🏠',
      color: '#f59e0b',
      popular: true,
      description: 'Acomoda até 15 personagens com recuperação 150% (+50% mais rápida). Ideal para esquadrões ativos.'
    },
    legendary: {
      id: 'legendary',
      name: 'Abrigo Lendário',
      slots: 20,
      recoverySpeedMultiplier: 2.00, // 200% (2x mais veloz)
      costUsdt: 135,
      icon: '🏰',
      color: '#ec4899',
      badge: 'MÁXIMO (2.0x)',
      description: 'Acomoda até 20 personagens. Recuperação 200% (o dobro da velocidade da casa básica).'
    }
  },

  // 3. ATRIBUTOS DAS RARIDADES (Conforme Regras Oficiais de Energia e Produção de Referência)
  rarityAttributes: {
    common: {
      rarityName: 'Comum',
      color: '#94a3b8',
      basePowerMin: 1.5,
      basePowerMax: 3.0,
      coinsPerHourMin: 1.25,
      coinsPerHourMax: 1.55, // média 1.40 Coins/h
      maxEnergy: 100, // Regra Oficial: 100
      energyDrainPerHour: 12, // Regra Oficial: 12/h (0.2/min)
      energyDrainPerMinute: 0.20,
      recoveryPerHourReinforced: 15, // Regra Oficial Abrigo Reforçado: 15/h
      baseRecoveryMinutes: 400,
      badge: 'COMUM'
    },
    rare: {
      rarityName: 'Raro',
      color: '#38bdf8',
      basePowerMin: 3.5,
      basePowerMax: 6.5,
      coinsPerHourMin: 2.25,
      coinsPerHourMax: 2.75, // média 2.50 Coins/h
      maxEnergy: 120, // Regra Oficial: 120
      energyDrainPerHour: 12, // Regra Oficial: 12/h (0.2/min)
      energyDrainPerMinute: 0.20,
      recoveryPerHourReinforced: 18, // Regra Oficial Abrigo Reforçado: 18/h
      baseRecoveryMinutes: 400,
      badge: 'RARO'
    },
    epic: {
      rarityName: 'Épico',
      color: '#a855f7',
      basePowerMin: 7.0,
      basePowerMax: 13.0,
      coinsPerHourMin: 3.50,
      coinsPerHourMax: 4.10, // média 3.80 Coins/h
      maxEnergy: 140, // Regra Oficial: 140
      energyDrainPerHour: 12, // Regra Oficial: 12/h (0.2/min)
      energyDrainPerMinute: 0.20,
      recoveryPerHourReinforced: 21, // Regra Oficial Abrigo Reforçado: 21/h
      baseRecoveryMinutes: 400,
      badge: 'ÉPICO'
    },
    legendary: {
      rarityName: 'Lendário',
      color: '#f59e0b',
      basePowerMin: 14.0,
      basePowerMax: 24.0,
      coinsPerHourMin: 6.00,
      coinsPerHourMax: 6.84, // média 6.42 Coins/h
      maxEnergy: 160, // Regra Oficial: 160
      energyDrainPerHour: 12, // Regra Oficial: 12/h (0.2/min)
      energyDrainPerMinute: 0.20,
      recoveryPerHourReinforced: 24, // Regra Oficial Abrigo Reforçado: 24/h
      baseRecoveryMinutes: 400,
      badge: 'LENDÁRIO'
    }
  },

  // 4. PARÂMETROS DO SIMULADOR DE UPGRADES
  upgradesConfig: {
    energyMaxTiers: [
      { id: 'none', label: 'Padrão (+0%)', bonusPct: 0, costMiner: 0 },
      { id: 'tier1', label: '+10% Energia Máx', bonusPct: 10, costMiner: 15 },
      { id: 'tier2', label: '+20% Energia Máx', bonusPct: 20, costMiner: 35 },
      { id: 'tier3', label: '+30% Energia Máx', bonusPct: 30, costMiner: 60 }
    ],
    drainDiscountTiers: [
      { id: 'none', label: 'Padrão (100% consumo)', discountPct: 0, costMiner: 0 },
      { id: 'tier1', label: '-10% Consumo', discountPct: 10, costMiner: 20 },
      { id: 'tier2', label: '-20% Consumo', discountPct: 20, costMiner: 45 },
      { id: 'tier3', label: '-30% Consumo', discountPct: 30, costMiner: 75 }
    ],
    recoverySpeedTiers: [
      { id: 'none', label: 'Padrão (+0%)', bonusPct: 0, costMiner: 0 },
      { id: 'tier1', label: '+15% Vel. Recuperação', bonusPct: 15, costMiner: 15 },
      { id: 'tier2', label: '+30% Vel. Recuperação', bonusPct: 30, costMiner: 35 },
      { id: 'tier3', label: '+50% Vel. Recuperação', bonusPct: 50, costMiner: 65 }
    ],
    heroProductionBonusByStarPct: { 1: 5, 2: 10, 3: 15 }
  },

  // 5. SISTEMA DE MONETIZAÇÃO, ANÚNCIOS RECOMPENSADOS & FUNDO DE SUSTENTABILIDADE
  adsConfig: {
    enabled: true,
    provider: 'admob', // 'admob' | 'unity' | 'applovin' | 'custom'
    providerName: 'Google AdMob & Interactive Network',
    dailyEnergyLimit: 5,
    estimatedCpmUsd: 25.0, // $0.025 USD por anúncio completado
    revenueShareSustainabilityPct: 100, // 100% da receita para o Fundo de Sustentabilidade
    formats: {
      rewardedVideo: true,
      playableInteractive: true
    }
  },

  // 6. SISTEMA DE BAÚS DE CONSTRUÇÃO (SORTEIO POR BOSS DERROTADO)
  constructionChestConfig: {
    enabled: true,
    chanceByRarityPct: {
      common: 2.0,
      rare: 2.2,
      superRare: 2.3,
      epic: 2.4,
      legendary: 2.6667,
      superLegendary: 3.0
    },
    maxAccountChanceCapPct: 40.0, // Teto absoluto de 40% por Boss e por jogador
    cycleDurationSeconds: 0,      // Sem ciclo horário; sorteio a cada Boss derrotado
    dailyLimitPerPlayer: 3,       // Máximo de 3 baús por dia
    timezone: 'America/Sao_Paulo',// Horário oficial de Brasília
    rewardFragmentCount: 1        // Exatamente 1 Fragmento de Construção por baú
  }
};

// Funções de Carregamento e Persistência Administrativa
export function getCryptoZombiesConfig() {
  if (typeof window === 'undefined') return DEFAULT_CRYPTO_ZOMBIES_CONFIG;
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY) || localStorage.getItem(LEGACY_CONFIG_STORAGE_KEY);
    if (saved && !localStorage.getItem(CONFIG_STORAGE_KEY)) localStorage.setItem(CONFIG_STORAGE_KEY, saved);
    if (!saved) return DEFAULT_CRYPTO_ZOMBIES_CONFIG;
    const parsed = JSON.parse(saved);
    // Migração automática da antiga taxa 1.0 (da época 1:1) para a taxa oficial de 1 Coins = US$ 0,01
    const effectiveRate = (parsed.minerCoinUsdtRate !== undefined && Number(parsed.minerCoinUsdtRate) !== 1.0)
      ? Number(parsed.minerCoinUsdtRate)
      : 0.01;

    const {
      heroBaseUpgradeCost: _legacyHeroBaseUpgradeCost,
      heroUpgradeMultiplier: _legacyHeroUpgradeMultiplier,
      heroPowerBonusPerLevelPct: _legacyHeroPowerBonusPerLevelPct,
      heroProductionBonusPerLevelPct: _legacyHeroProductionBonusPerLevelPct,
      ...savedUpgradesConfig
    } = parsed.upgradesConfig || {};

    return {
      ...DEFAULT_CRYPTO_ZOMBIES_CONFIG,
      ...parsed,
      minerCoinUsdtRate: effectiveRate,
      chests: { ...DEFAULT_CRYPTO_ZOMBIES_CONFIG.chests, ...(parsed.chests || {}) },
      houses: { ...DEFAULT_CRYPTO_ZOMBIES_CONFIG.houses, ...(parsed.houses || {}) },
      rarityAttributes: { ...DEFAULT_CRYPTO_ZOMBIES_CONFIG.rarityAttributes, ...(parsed.rarityAttributes || {}) },
      upgradesConfig: {
        ...DEFAULT_CRYPTO_ZOMBIES_CONFIG.upgradesConfig,
        ...savedUpgradesConfig,
        heroProductionBonusByStarPct: DEFAULT_CRYPTO_ZOMBIES_CONFIG.upgradesConfig.heroProductionBonusByStarPct
      },
      adsConfig: { ...DEFAULT_CRYPTO_ZOMBIES_CONFIG.adsConfig, ...(parsed.adsConfig || {}) },
      constructionChestConfig: {
        ...DEFAULT_CRYPTO_ZOMBIES_CONFIG.constructionChestConfig,
        ...(parsed.constructionChestConfig || {}),
        chanceByRarityPct: DEFAULT_CRYPTO_ZOMBIES_CONFIG.constructionChestConfig.chanceByRarityPct,
        maxAccountChanceCapPct: parsed.constructionChestConfig?.maxAccountChanceCapPct === 10
          ? 40
          : (parsed.constructionChestConfig?.maxAccountChanceCapPct ?? DEFAULT_CRYPTO_ZOMBIES_CONFIG.constructionChestConfig.maxAccountChanceCapPct),
        cycleDurationSeconds: 0
      }
    };
  } catch (e) {
    console.error('Erro ao ler configuração do CryptoZombies:', e);
    return DEFAULT_CRYPTO_ZOMBIES_CONFIG;
  }
}

export function saveCryptoZombiesConfig(newConfig) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
}

export function resetCryptoZombiesConfig() {
  if (typeof window === 'undefined') return DEFAULT_CRYPTO_ZOMBIES_CONFIG;
  localStorage.removeItem(CONFIG_STORAGE_KEY);
  return DEFAULT_CRYPTO_ZOMBIES_CONFIG;
}
