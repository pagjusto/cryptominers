// Tabela de Recompensas e HP Calibrada para o Modelo Oficial CryptoZombies (~5 Horas por Mapa)
// A mineração não consome estamina; o tempo de mapa é independente de descanso energético.

export const CRYPTO_ZOMBIES_REWARDS = {
  // Rocha Básica de Passagem (~2.800 HP)
  rock: {
    name: 'Rocha Básica',
    hp: 2800,
    minBcoin: 0.040,
    maxBcoin: 0.090,
    icon: '🪨'
  },
  // Minério Comum - Carvão / Cobre (~6.500 HP)
  common: {
    name: 'Minério Comum',
    hp: 6500,
    minBcoin: 0.120,
    maxBcoin: 0.280,
    icon: '⛏️'
  },
  // Veio de Ouro Puro (~16.000 HP)
  gold: {
    name: 'Veio de Ouro',
    hp: 16000,
    minBcoin: 0.450,
    maxBcoin: 0.950,
    icon: '🟡'
  },
  // Veio de Cristais Fluorescentes (~35.000 HP)
  crystal: {
    name: 'Veio de Cristais',
    hp: 35000,
    minBcoin: 1.200,
    maxBcoin: 2.500,
    icon: '💎'
  },
  // Super Baú de Tesouro (~75.000 HP)
  treasure: {
    name: 'Baú de Diamante',
    hp: 75000,
    minBcoin: 3.500,
    maxBcoin: 6.800,
    icon: '🧰'
  },
  // Altar Ancestral / Prisão de Herói (~120.000 HP)
  altar: {
    name: 'Prisão de Herói',
    hp: 120000,
    minBcoin: 0,
    maxBcoin: 0,
    icon: '🏛️'
  }
};
