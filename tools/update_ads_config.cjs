const fs = require('fs');

const path = 'C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/src/data/criptoMynersConfig.js';
let content = fs.readFileSync(path, 'utf8');
const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Replace chests with exact normal and adBonus probabilities from prompt
const oldChestsSection = `  // 1. SISTEMA DE BAÚS (Preços e Probabilidades Oficiais da Especificação)
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
      probabilities: {
        common: 70,
        rare: 20,
        epic: 8,
        legendary: 2
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
      costUsdt: 95,
      icon: '🛡️',
      color: '#a855f7',
      description: 'Entrega 10 heróis mineradores. Probabilidade expressiva de Épicos e Lendários com desconto no pacote.',
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
      costUsdt: 140,
      icon: '👑',
      color: '#f59e0b',
      badge: 'TIME COMPLETO (15)',
      description: 'Entrega 15 heróis mineradores (capacidade máxima de trabalho simultâneo). Maior chance de Lendários do jogo!',
      probabilities: {
        common: 25,
        rare: 30,
        epic: 30,
        legendary: 15
      }
    }
  },`;

const newChestsSection = `  // 1. SISTEMA DE BAÚS (Probabilidades Normais vs. Com Anúncio Recompensado)
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
  },`;

if (content.includes(oldChestsSection)) {
  content = content.replace(oldChestsSection, newChestsSection);
  console.log('Chests section updated with normal & adBonus probabilities!');
} else {
  console.log('oldChestsSection not matched directly, checking fallback...');
}

// 2. Add adsConfig to DEFAULT_CRIPTO_MYNERS_CONFIG
const adsConfigBlock = `
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
  }
};`;

if (!content.includes('adsConfig: {')) {
  content = content.replace(
    `    heroPowerBonusPerLevelPct: 25,\n    heroProductionBonusPerLevelPct: 20\n  }\n};`,
    `    heroPowerBonusPerLevelPct: 25,\n    heroProductionBonusPerLevelPct: 20\n  },\n${adsConfigBlock}`
  );
  console.log('adsConfig added to DEFAULT_CRIPTO_MYNERS_CONFIG!');
}

// 3. Update getCriptoMynersConfig
if (!content.includes('adsConfig: { ...DEFAULT_CRIPTO_MYNERS_CONFIG.adsConfig')) {
  content = content.replace(
    `upgradesConfig: { ...DEFAULT_CRIPTO_MYNERS_CONFIG.upgradesConfig, ...(parsed.upgradesConfig || {}) }`,
    `upgradesConfig: { ...DEFAULT_CRIPTO_MYNERS_CONFIG.upgradesConfig, ...(parsed.upgradesConfig || {}) },\n      adsConfig: { ...DEFAULT_CRIPTO_MYNERS_CONFIG.adsConfig, ...(parsed.adsConfig || {}) }`
  );
  console.log('adsConfig read added to getCriptoMynersConfig!');
}

if (isCRLF) content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(path, content, 'utf8');
console.log('criptoMynersConfig.js updated successfully!');
