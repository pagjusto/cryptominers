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
      name: 'Baú de Herói',
      tagline: 'Recrutamento Individual',
      heroesCount: 1,
      costUsdt: 31.31,
      icon: '⛏️',
      image: '/items/hero_chest.png',
      color: '#38bdf8',
      description: 'Entrega 1 herói minerador. Ideal para iniciar sua jornada na mina subterrânea.',
      normalProbabilities: {
        common: 82.87,
        rare: 10.36,
        super_rare: 5.18,
        epic: 1.04,
        legendary: 0.51,
        super_legend: 0.04
      },
      adBonusProbabilities: {
        common: 82.87,
        rare: 10.36,
        super_rare: 5.18,
        epic: 1.04,
        legendary: 0.51,
        super_legend: 0.04
      },
      probabilities: {
        common: 82.87,
        rare: 10.36,
        super_rare: 5.18,
        epic: 1.04,
        legendary: 0.51,
        super_legend: 0.04
      }
    },
    explorer: {
      id: 'explorer',
      name: 'Baú de Herói 5x',
      tagline: 'Esquadrão de Heróis',
      heroesCount: 5,
      costUsdt: 156.57,
      icon: '🗺️',
      image: '/items/hero_chest.png',
      color: '#22c55e',
      popular: true,
      description: 'Entrega 5 heróis combatentes com chances oficiais de drop. Não concede recompensa em moedas, apenas heróis.',
      normalProbabilities: {
        common: 82.87,
        rare: 10.36,
        super_rare: 5.18,
        epic: 1.04,
        legendary: 0.51,
        super_legend: 0.04
      },
      adBonusProbabilities: {
        common: 82.87,
        rare: 10.36,
        super_rare: 5.18,
        epic: 1.04,
        legendary: 0.51,
        super_legend: 0.04
      },
      probabilities: {
        common: 82.87,
        rare: 10.36,
        super_rare: 5.18,
        epic: 1.04,
        legendary: 0.51,
        super_legend: 0.04
      }
    },
    elite: {
      id: 'elite',
      name: 'Baú de Herói 10x',
      tagline: 'Companhia de Elite',
      heroesCount: 10,
      costUsdt: 300.61,
      icon: '🛡️',
      image: '/items/hero_chest.png',
      color: '#a855f7',
      description: 'Entrega 10 heróis mineradores com chances oficiais de drop e desconto no pacote.',
      normalProbabilities: {
        common: 82.87,
        rare: 10.36,
        super_rare: 5.18,
        epic: 1.04,
        legendary: 0.51,
        super_legend: 0.04
      },
      adBonusProbabilities: {
        common: 82.87,
        rare: 10.36,
        super_rare: 5.18,
        epic: 1.04,
        legendary: 0.51,
        super_legend: 0.04
      },
      probabilities: {
        common: 82.87,
        rare: 10.36,
        super_rare: 5.18,
        epic: 1.04,
        legendary: 0.51,
        super_legend: 0.04
      }
    },
    legendary: {
      id: 'legendary',
      name: 'Baú de Herói 15x',
      tagline: 'Full Team (Mina Completa 15/15)',
      heroesCount: 15,
      costUsdt: 432.13,
      icon: '👑',
      image: '/items/hero_chest.png',
      color: '#f59e0b',
      badge: 'TIME COMPLETO (15)',
      description: 'Entrega 15 heróis mineradores (capacidade máxima de trabalho simultâneo) com chances oficiais de drop.',
      normalProbabilities: {
        common: 82.87,
        rare: 10.36,
        super_rare: 5.18,
        epic: 1.04,
        legendary: 0.51,
        super_legend: 0.04
      },
      adBonusProbabilities: {
        common: 82.87,
        rare: 10.36,
        super_rare: 5.18,
        epic: 1.04,
        legendary: 0.51,
        super_legend: 0.04
      },
      probabilities: {
        common: 82.87,
        rare: 10.36,
        super_rare: 5.18,
        epic: 1.04,
        legendary: 0.51,
        super_legend: 0.04
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
      name: 'Base Básica',
      slots: 5,
      recoverySpeedMultiplier: 1.0, // 100% de velocidade base
      costUsdt: 25,
      icon: '🛖',
      image: '/assets/bases/base_basic.png',
      color: '#38bdf8',
      description: 'Acomoda até 5 sobreviventes em tratamento simultaneamente com 100% da velocidade padrão.'
    },
    reinforced: {
      id: 'reinforced',
      name: 'Base Reforçada',
      slots: 10,
      recoverySpeedMultiplier: 1.25, // 125%
      costUsdt: 50,
      icon: '🏡',
      image: '/assets/bases/base_reinforced.png',
      color: '#22c55e',
      description: 'Acomoda até 10 personagens com recuperação 125% (+25% mais veloz que a básica).'
    },
    advanced: {
      id: 'advanced',
      name: 'Base Avançada',
      slots: 15,
      recoverySpeedMultiplier: 1.50, // 150%
      costUsdt: 85,
      icon: '🏠',
      image: '/assets/bases/base_advanced.png',
      color: '#f59e0b',
      popular: true,
      description: 'Acomoda até 15 personagens com recuperação 150% (+50% mais rápida). Ideal para esquadrões ativos.'
    }
  },

  // 3. ATRIBUTOS DAS RARIDADES (Conforme Regras Oficiais de Energia e Produção de Referência)
  rarityAttributes: {
    common: {
      rarityName: 'Comum',
      color: '#94a3b8',
      basePowerMin: 1.5,
      basePowerMax: 3.0,
      coinsPerHourMin: 2.33,
      coinsPerHourMax: 2.88, // média 2.60 Coins/h (nova base 1.86x)
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
      coinsPerHourMin: 4.19,
      coinsPerHourMax: 5.12, // média 4.65 Coins/h (nova base 1.86x)
      maxEnergy: 120, // Regra Oficial: 120
      energyDrainPerHour: 12, // Regra Oficial: 12/h (0.2/min)
      energyDrainPerMinute: 0.20,
      recoveryPerHourReinforced: 18, // Regra Oficial Abrigo Reforçado: 18/h
      baseRecoveryMinutes: 400,
      badge: 'RARO'
    },
    super_rare: {
      rarityName: 'Super Raro',
      color: '#38bdf8',
      basePowerMin: 5.5,
      basePowerMax: 9.5,
      coinsPerHourMin: 5.39,
      coinsPerHourMax: 6.32, // média 5.86 Coins/h (nova base 1.86x)
      maxEnergy: 130,
      energyDrainPerHour: 12,
      energyDrainPerMinute: 0.20,
      recoveryPerHourReinforced: 19,
      baseRecoveryMinutes: 400,
      badge: 'SUPER RARO'
    },
    epic: {
      rarityName: 'Épico',
      color: '#a855f7',
      basePowerMin: 7.0,
      basePowerMax: 13.0,
      coinsPerHourMin: 6.51,
      coinsPerHourMax: 7.63, // média 7.07 Coins/h (nova base 1.86x)
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
      coinsPerHourMin: 11.16,
      coinsPerHourMax: 12.72, // média 11.94 Coins/h (nova base 1.86x)
      maxEnergy: 160, // Regra Oficial: 160
      energyDrainPerHour: 12, // Regra Oficial: 12/h (0.2/min)
      energyDrainPerMinute: 0.20,
      recoveryPerHourReinforced: 24, // Regra Oficial Abrigo Reforçado: 24/h
      baseRecoveryMinutes: 400,
      badge: 'LENDÁRIO'
    },
    super_legend: {
      rarityName: 'Super Lendário',
      color: '#ef4444',
      basePowerMin: 22.0,
      basePowerMax: 32.0,
      coinsPerHourMin: 14.51,
      coinsPerHourMax: 17.11, // média 15.81 Coins/h (nova base 1.86x)
      maxEnergy: 180,
      energyDrainPerHour: 12,
      energyDrainPerMinute: 0.20,
      recoveryPerHourReinforced: 26,
      baseRecoveryMinutes: 400,
      badge: 'SUPER LENDÁRIO'
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
      chests: Object.keys(DEFAULT_CRYPTO_ZOMBIES_CONFIG.chests).reduce((acc, key) => {
        const defChest = DEFAULT_CRYPTO_ZOMBIES_CONFIG.chests[key];
        const savedChest = parsed.chests?.[key] || {};
        acc[key] = {
          ...defChest,
          ...savedChest,
          name: defChest.name,
          image: defChest.image,
          normalProbabilities: defChest.normalProbabilities,
          adBonusProbabilities: defChest.adBonusProbabilities,
          probabilities: defChest.probabilities
        };
        return acc;
      }, {}),
      houses: Object.keys(DEFAULT_CRYPTO_ZOMBIES_CONFIG.houses).reduce((acc, key) => {
        const defHouse = DEFAULT_CRYPTO_ZOMBIES_CONFIG.houses[key];
        const savedHouse = parsed.houses?.[key] || {};
        acc[key] = {
          ...defHouse,
          ...savedHouse,
          name: defHouse.name,
          image: defHouse.image,
          description: defHouse.description
        };
        return acc;
      }, {}),
      rarityAttributes: parsed.rarityAttributes?.common?.coinsPerHourMin === 1.25
        ? DEFAULT_CRYPTO_ZOMBIES_CONFIG.rarityAttributes
        : { ...DEFAULT_CRYPTO_ZOMBIES_CONFIG.rarityAttributes, ...(parsed.rarityAttributes || {}) },
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
