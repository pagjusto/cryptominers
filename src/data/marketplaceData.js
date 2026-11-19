// Dados Iniciais e Estrutura do Marketplace P2P do Cripto Myners
// Comissão oficial do jogo: exatamente 5% sobre cada venda (95% Vendedor, 5% Jogo)

export const MARKETPLACE_FEE_PCT = 5;
export const FEE_SPLIT = {
  platform: 5 // 5% comissão oficial da plataforma/jogo
};

export const INITIAL_MARKET_LISTINGS = [
  {
    id: 'listing-1',
    seller: 'Survivor_BR',
    miner: {
      id: 'miner-market-1',
      name: 'Granito #742',
      heroId: 'granito',
      classId: 'tank',
      className: 'Tanque',
      weaponId: 'heavy-machine-gun',
      spriteIndex: 1,
      level: 2,
      power: 9,
      speed: 1.0,
      maxStamina: 195,
      currentStamina: 195,
      durability: 100,
      avatar: '🛡️',
      image: '/assets/heroes/granito.png',
      color: '#eab308',
      badge: 'LENDÁRIO',
      passiveTrait: {
        name: 'Blindagem de Titânio',
        description: 'Reduz 50% do dano recebido e dispara saraivadas pesadas com metralhadora giratória.'
      }
    },
    priceBcoin: 155.0,
    listedAt: 'Há 12 minutos'
  },
  {
    id: 'listing-2',
    seller: 'ZombieHunter_X',
    miner: {
      id: 'miner-market-2',
      name: 'Nox #418',
      heroId: 'nox',
      classId: 'fighter',
      className: 'Combatente',
      weaponId: 'energy-blaster',
      spriteIndex: 2,
      level: 1,
      power: 5,
      speed: 1.4,
      maxStamina: 120,
      currentStamina: 120,
      durability: 100,
      avatar: '⚡',
      image: '/assets/heroes/nox.png',
      color: '#38bdf8',
      badge: 'RARO',
      passiveTrait: {
        name: 'Descarga de Plasma',
        description: 'Dispara esferas luminosas de energia que desestabilizam e perfuram alvos em área.'
      }
    },
    priceBcoin: 32.0,
    listedAt: 'Há 35 minutos'
  },
  {
    id: 'listing-3',
    seller: 'IronShield',
    miner: {
      id: 'miner-market-3',
      name: 'Iron #881',
      heroId: 'iron',
      classId: 'heavy',
      className: 'Granadeiro Blindado',
      weaponId: 'grenade',
      spriteIndex: 9,
      level: 2,
      power: 7.8,
      speed: 1.2,
      maxStamina: 145,
      currentStamina: 145,
      durability: 100,
      avatar: '💣',
      image: '/assets/heroes/iron.png',
      color: '#a855f7',
      badge: 'ÉPICO',
      passiveTrait: {
        name: 'Explosão Fragmentária',
        description: 'Arremessa granadas em parábola com rotação que detonam em ondas de choque e estilhaços.'
      }
    },
    priceBcoin: 58.0,
    listedAt: 'Há 1 hora'
  },
  {
    id: 'listing-4',
    seller: 'FlameMaster',
    miner: {
      id: 'miner-market-4',
      name: 'Fênix #007',
      heroId: 'fenix',
      classId: 'assault',
      className: 'Assalto (Lança-chamas)',
      weaponId: 'flamethrower',
      spriteIndex: 7,
      level: 3,
      power: 8.5,
      speed: 1.4,
      maxStamina: 155,
      currentStamina: 155,
      durability: 100,
      avatar: '🔥',
      image: '/assets/heroes/fenix.png',
      color: '#ef4444',
      badge: 'ÉPICO',
      passiveTrait: {
        name: 'Inferno Contínuo',
        description: 'Cospe um jato contínuo de labaredas expansivas que queima múltiplos zumbis em área.'
      }
    },
    priceBcoin: 75.0,
    listedAt: 'Há 3 horas'
  },
  {
    id: 'listing-5',
    seller: 'MolotovSquad',
    miner: {
      id: 'miner-market-5',
      name: 'Brasa #109',
      heroId: 'brasa',
      classId: 'assault',
      className: 'Assalto (Molotov)',
      weaponId: 'molotov',
      spriteIndex: 3,
      level: 2,
      power: 4.5,
      speed: 1.35,
      maxStamina: 120,
      currentStamina: 120,
      durability: 100,
      avatar: '🍾',
      image: '/assets/heroes/brasa.png',
      color: '#f97316',
      badge: 'COMUM',
      passiveTrait: {
        name: 'Chamas Alastras',
        description: 'Arremessa coquetéis molotov em parábola criando poças de fogo ardente sob o zumbi.'
      }
    },
    priceBcoin: 18.0,
    listedAt: 'Há 5 horas'
  }
];
