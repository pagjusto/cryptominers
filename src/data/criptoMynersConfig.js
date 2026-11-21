// CRIPTO MYNERS — CONFIGURAÇÃO OFICIAL DE ECONOMIA, BAÚS, CASAS E ATRIBUTOS
// Permite edição administrativa e sincronização em tempo real entre o jogo real e o Simulador de ROI.

const CONFIG_STORAGE_KEY = 'cripto_myners_admin_config_v1';

export const DEFAULT_CRIPTO_MYNERS_CONFIG = {
  // Cotação da Minercoin (MNC) em USDT: 1 MNC = US$ 0,01 oficial
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
      costUsdt: 10,
      icon: '⛏️',
      color: '#38bdf8',
      description: 'Entrega 1 herói minerador. Ideal para iniciar sua jornada na mina subterrânea.',
      normalProbabilities: {
        common: 80,
        rare: 15,
        epic: 4,
        legendary: 1
      },
      adBonusProbabilities: {
        common: 74,
        rare: 17,
        epic: 7,
        legendary: 2
      },
      probabilities: {
        common: 80,
        rare: 15,
        epic: 4,
        legendary: 1
      }
    },
    explorer: {
      id: 'explorer',
      name: 'Baú Explorer',
      tagline: 'Esquadrão de Exploração',
      heroesCount: 5,
      costUsdt: 50,
      icon: '🗺️',
      color: '#22c55e',
      popular: true,
      description: 'Entrega 5 heróis mineradores com chances elevadas de heróis Raros e Épicos.',
      normalProbabilities: {
        common: 76,
        rare: 16,
        epic: 6,
        legendary: 2
      },
      adBonusProbabilities: {
        common: 69,
        rare: 18,
        epic: 9,
        legendary: 4
      },
      probabilities: {
        common: 76,
        rare: 16,
        epic: 6,
        legendary: 2
      }
    },
    elite: {
      id: 'elite',
      name: 'Baú Elite',
      tagline: 'Companhia de Elite',
      heroesCount: 10,
      costUsdt: 95,
      icon: '🛡️',
      color: '#a855f7',
      description: 'Entrega 10 heróis mineradores. Probabilidade expressiva de Épicos e Lendários com desconto no pacote.',
      normalProbabilities: {
        common: 72,
        rare: 17,
        epic: 8,
        legendary: 3
      },
      adBonusProbabilities: {
        common: 64,
        rare: 19,
        epic: 11,
        legendary: 6
      },
      probabilities: {
        common: 72,
        rare: 17,
        epic: 8,
        legendary: 3
      }
    },
    legendary: {
      id: 'legendary',
      name: 'Baú Legendary',
      tagline: 'Full Team (Mina Completa 15/15)',
      heroesCount: 15,
      costUsdt: 140,
      icon: '👑',
      color: '#f59e0b',
      badge: 'TIME COMPLETO (15)',
      description: 'Entrega 15 heróis mineradores (capacidade máxima de trabalho simultâneo). Maior chance de Lendários do jogo!',
      normalProbabilities: {
        common: 68,
        rare: 18,
        epic: 9,
        legendary: 5
      },
      adBonusProbabilities: {
        common: 59,
        rare: 20,
        epic: 13,
        legendary: 8
      },
      probabilities: {
        common: 68,
        rare: 18,
        epic: 9,
        legendary: 5
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
      description: 'Os heróis descansam no chão da caverna. Recuperação lenta.'
    },
    basic: {
      id: 'basic',
      name: 'Casa Básica',
      slots: 5,
      recoverySpeedMultiplier: 1.0, // 100% de velocidade base
      costUsdt: 25,
      icon: '🛖',
      color: '#38bdf8',
      description: 'Acomoda até 5 personagens descansando simultaneamente com 100% da velocidade padrão.'
    },
    reinforced: {
      id: 'reinforced',
      name: 'Casa Reforçada',
      slots: 10,
      recoverySpeedMultiplier: 1.25, // 125%
      costUsdt: 50,
      icon: '🏡',
      color: '#22c55e',
      description: 'Acomoda até 10 personagens com recuperação 125% (+25% mais veloz que a básica).'
    },
    advanced: {
      id: 'advanced',
      name: 'Casa Avançada',
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
      name: 'Casa Lendária',
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
      coinsPerHourMax: 1.55, // média 1.40 MNC/h
      maxEnergy: 100, // Regra Oficial: 100
      energyDrainPerHour: 12, // Regra Oficial: 12/h (0.2/min)
      energyDrainPerMinute: 0.20,
      recoveryPerHourReinforced: 15, // Regra Oficial Casa Reforçada: 15/h
      baseRecoveryMinutes: 400,
      badge: 'COMUM'
    },
    rare: {
      rarityName: 'Raro',
      color: '#38bdf8',
      basePowerMin: 3.5,
      basePowerMax: 6.5,
      coinsPerHourMin: 2.25,
      coinsPerHourMax: 2.75, // média 2.50 MNC/h
      maxEnergy: 120, // Regra Oficial: 120
      energyDrainPerHour: 12, // Regra Oficial: 12/h (0.2/min)
      energyDrainPerMinute: 0.20,
      recoveryPerHourReinforced: 18, // Regra Oficial Casa Reforçada: 18/h
      baseRecoveryMinutes: 400,
      badge: 'RARO'
    },
    epic: {
      rarityName: 'Épico',
      color: '#a855f7',
      basePowerMin: 7.0,
      basePowerMax: 13.0,
      coinsPerHourMin: 3.50,
      coinsPerHourMax: 4.10, // média 3.80 MNC/h
      maxEnergy: 140, // Regra Oficial: 140
      energyDrainPerHour: 12, // Regra Oficial: 12/h (0.2/min)
      energyDrainPerMinute: 0.20,
      recoveryPerHourReinforced: 21, // Regra Oficial Casa Reforçada: 21/h
      baseRecoveryMinutes: 400,
      badge: 'ÉPICO'
    },
    legendary: {
      rarityName: 'Lendário',
      color: '#f59e0b',
      basePowerMin: 14.0,
      basePowerMax: 24.0,
      coinsPerHourMin: 6.00,
      coinsPerHourMax: 6.84, // média 6.42 MNC/h
      maxEnergy: 160, // Regra Oficial: 160
      energyDrainPerHour: 12, // Regra Oficial: 12/h (0.2/min)
      energyDrainPerMinute: 0.20,
      recoveryPerHourReinforced: 24, // Regra Oficial Casa Reforçada: 24/h
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
    heroBaseUpgradeCost: 2.5,
    heroUpgradeMultiplier: 1.6,
    heroPowerBonusPerLevelPct: 25,
    heroProductionBonusPerLevelPct: 20
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
    maxAccountChanceCapPct: 40.0,
    cycleDurationSeconds: 0,
    dailyLimitPerPlayer: 3,
    timezone: 'America/Sao_Paulo',
    rewardFragmentCount: 1
  }
};

// Funções de Carregamento e Persistência Administrativa
export function getCriptoMynersConfig() {
  if (typeof window === 'undefined') return DEFAULT_CRIPTO_MYNERS_CONFIG;
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!saved) return DEFAULT_CRIPTO_MYNERS_CONFIG;
    const parsed = JSON.parse(saved);
    // Migração automática da antiga taxa 1.0 (da época 1:1) para a taxa oficial de 1 MNC = US$ 0,01
    const effectiveRate = (parsed.minerCoinUsdtRate !== undefined && Number(parsed.minerCoinUsdtRate) !== 1.0)
      ? Number(parsed.minerCoinUsdtRate)
      : 0.01;

    return {
      ...DEFAULT_CRIPTO_MYNERS_CONFIG,
      ...parsed,
      minerCoinUsdtRate: effectiveRate,
      chests: { ...DEFAULT_CRIPTO_MYNERS_CONFIG.chests, ...(parsed.chests || {}) },
      houses: { ...DEFAULT_CRIPTO_MYNERS_CONFIG.houses, ...(parsed.houses || {}) },
      rarityAttributes: { ...DEFAULT_CRIPTO_MYNERS_CONFIG.rarityAttributes, ...(parsed.rarityAttributes || {}) },
      upgradesConfig: { ...DEFAULT_CRIPTO_MYNERS_CONFIG.upgradesConfig, ...(parsed.upgradesConfig || {}) },
      adsConfig: { ...DEFAULT_CRIPTO_MYNERS_CONFIG.adsConfig, ...(parsed.adsConfig || {}) },
      constructionChestConfig: {
        ...DEFAULT_CRIPTO_MYNERS_CONFIG.constructionChestConfig,
        ...(parsed.constructionChestConfig || {}),
        chanceByRarityPct: DEFAULT_CRIPTO_MYNERS_CONFIG.constructionChestConfig.chanceByRarityPct,
        maxAccountChanceCapPct: parsed.constructionChestConfig?.maxAccountChanceCapPct === 10
          ? 40
          : (parsed.constructionChestConfig?.maxAccountChanceCapPct ?? 40),
        cycleDurationSeconds: 0
      }
    };
  } catch (e) {
    console.error('Erro ao ler configuração do Cripto Myners:', e);
    return DEFAULT_CRIPTO_MYNERS_CONFIG;
  }
}

export function saveCriptoMynersConfig(newConfig) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
}

export function resetCriptoMynersConfig() {
  if (typeof window === 'undefined') return DEFAULT_CRIPTO_MYNERS_CONFIG;
  localStorage.removeItem(CONFIG_STORAGE_KEY);
  return DEFAULT_CRIPTO_MYNERS_CONFIG;
}
