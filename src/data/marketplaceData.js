// Dados Iniciais e Estrutura do Marketplace P2P do Cripto Myners
// Comissão oficial do jogo: exatamente 5% sobre cada venda (95% Vendedor, 5% Jogo)

export const MARKETPLACE_FEE_PCT = 5;
export const FEE_SPLIT = {
  platform: 5 // 5% comissão oficial da plataforma/jogo
};

export const INITIAL_MARKET_LISTINGS = [
  {
    id: 'listing-1',
    seller: 'CryptoMiner_99',
    miner: {
      id: 'miner-market-1',
      name: 'Vorgan #742',
      classId: 'brute',
      level: 2,
      power: 8,
      speed: 1.1,
      maxStamina: 165,
      currentStamina: 165,
      durability: 100,
      avatar: '🔨',
      color: '#f97316',
      badge: 'RARO',
      passiveTrait: {
        name: 'Golpe Demolidor',
        description: '28% de chance de Dano Crítico x2 em rochas maciças.'
      }
    },
    priceBcoin: 28.5,
    listedAt: 'Há 12 minutos'
  },
  {
    id: 'listing-2',
    seller: 'SatoshiGamer',
    miner: {
      id: 'miner-market-2',
      name: 'Zix #418',
      classId: 'goblin',
      level: 1,
      power: 3,
      speed: 2.1,
      maxStamina: 90,
      currentStamina: 90,
      durability: 100,
      avatar: '👺',
      color: '#22c55e',
      badge: 'SUPER RARO',
      passiveTrait: {
        name: 'Faro para Cristais',
        description: '+50% de bônus em BCOIN garantido ao extrair minérios e veios luminosos.'
      }
    },
    priceBcoin: 42.0,
    listedAt: 'Há 35 minutos'
  },
  {
    id: 'listing-3',
    seller: 'IronPickaxe',
    miner: {
      id: 'miner-market-3',
      name: 'Solas #881',
      classId: 'engineer',
      level: 2,
      power: 7,
      speed: 1.65,
      maxStamina: 145,
      currentStamina: 145,
      durability: 100,
      avatar: '⚙️',
      color: '#eab308',
      badge: 'ÉPICO',
      passiveTrait: {
        name: 'Perfuração em Cadeia',
        description: 'A cada 4 golpes lança dinamite que atinge blocos adjacentes!'
      }
    },
    priceBcoin: 68.0,
    listedAt: 'Há 1 hora'
  },
  {
    id: 'listing-4',
    seller: 'WhaleInvestor_BR',
    miner: {
      id: 'miner-market-4',
      name: 'Vesper #007',
      classId: 'mage',
      level: 3,
      power: 8,
      speed: 1.9,
      maxStamina: 180,
      currentStamina: 180,
      durability: 100,
      avatar: '🔮',
      color: '#a855f7',
      badge: 'ÉPICO',
      passiveTrait: {
        name: 'Magnetismo Arcano',
        description: 'Dispara raios arcanos e atrai +35% de BCOIN ao destruir cristais.'
      }
    },
    priceBcoin: 85.0,
    listedAt: 'Há 3 horas'
  },
  {
    id: 'listing-5',
    seller: 'AncientKing_NFT',
    miner: {
      id: 'miner-market-5',
      name: 'Torin Supremo #001',
      classId: 'legendary',
      level: 2,
      power: 12,
      speed: 2.45,
      maxStamina: 265,
      currentStamina: 265,
      durability: 100,
      avatar: '👑',
      color: '#ec4899',
      badge: 'LENDÁRIO',
      passiveTrait: {
        name: 'Aura da Abundância',
        description: 'Aura contínua: regenera estamina de todos os mineradores próximos na mina.'
      }
    },
    priceBcoin: 165.0,
    listedAt: 'Há 5 horas'
  }
];
