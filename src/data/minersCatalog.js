// Catálogo Completo das Classes de Mineradores do Crypto Miners
// Inclui atributos base, raridades, passivas exclusivas (Traits) e lore de cada personagem

export const MINER_ROSTER = [
  {
    id: 'class_miner',
    name: 'Bomb-Bot 3000',
    title: 'O Autômato de Mineração',
    role: 'Equilibrado',
    rarity: 'common',
    avatar: '🤖',
    image: '/miners/bomb_bot.png',
    bannerImage: '/miners/banners/banner_miner.png',
    color: '#38bdf8',
    borderColor: '#0284c7',
    badge: 'COMUM',
    basePower: 2,
    baseSpeed: 1.3,
    baseStamina: 100,
    equipment: 'Martelete Hidráulico Horizontal & Antena LED',
    weaponType: 'jackhammer',
    directCostBcoin: 10,
    passiveTrait: {
      name: 'Resistência Elétrica',
      description: 'Consome 35% menos estamina por golpe na rocha (0.45 ao invés de 0.70).'
    },
    lore: 'Autômato industrial com martelete demolidor operado na horizontal. Com alta frequência de percussão pneumática, quebra qualquer rocha com facilidade.'
  },
  {
    id: 'class_brute',
    name: 'Bárbaro Viking',
    title: 'O Demolidor com Chifres',
    role: 'Quebra-Blocos Pesado',
    rarity: 'rare',
    avatar: '🪓',
    image: '/miners/viking.png',
    bannerImage: '/miners/banners/banner_brute.png',
    color: '#f97316',
    borderColor: '#c2410c',
    badge: 'RARO',
    basePower: 5.5,
    baseSpeed: 0.95,
    baseStamina: 120,
    equipment: 'Machado de Guerra Rúnico Duplo',
    weaponType: 'battleaxe',
    directCostBcoin: 25,
    passiveTrait: {
      name: 'Fúria Nórdica',
      description: '28% de chance de Golpe Crítico x2 com tremor violento de impacto.'
    },
    lore: 'Guerreiro anão com elmo de chifres curvados e trança ruiva. Seu machado rúnico racha qualquer rocha maciça em dois.'
  },
  {
    id: 'class_goblin',
    name: 'Sapo Ninja Shinobi',
    title: 'O Mestre Anfíbio das Sombras',
    role: 'Velocista & Caçador de Cristais',
    rarity: 'epic',
    avatar: '🐸',
    image: '/miners/goblin.png',
    bannerImage: '/miners/banners/banner_goblin.png',
    color: '#22c55e',
    borderColor: '#15803d',
    badge: 'ÉPICO',
    basePower: 8.0,
    baseSpeed: 2.1,
    baseStamina: 140,
    equipment: 'Kunai Shinobi de Aço & Veneno',
    weaponType: 'kunai_throw',
    directCostBcoin: 45,
    passiveTrait: {
      name: 'Arremesso Shinobi',
      description: 'Arremessa Kunais velozes nas rochas com crítico perfurante e +50% de bônus em BCOIN garantido.'
    },
    lore: 'O lendário clássico do Bomb Crypto! Ágil, saltitante e com postura shinobi letal, arremessa Kunais com lâminas de aço afiado e veneno esmeralda.'
  },
  {
    id: 'class_engineer',
    name: 'Mago Arcano do Subsolo',
    title: 'O Arquimago das Chamas & Gemas',
    role: 'Magia de Fogo em Área',
    rarity: 'epic',
    avatar: '🧙‍♂️',
    image: '/miners/engineer.png',
    bannerImage: '/miners/banners/banner_engineer.png',
    color: '#9333ea',
    borderColor: '#7e22ce',
    badge: 'ÉPICO',
    basePower: 9.0,
    baseSpeed: 1.5,
    baseStamina: 140,
    equipment: 'Cajado de Cristal & Bola de Fogo',
    weaponType: 'fireball_staff',
    directCostBcoin: 65,
    passiveTrait: {
      name: 'Bola de Fogo Demolidora',
      description: 'Canaliza bolas de fogo explosivas nas rochas causando dano ígneo devastador e impacto em área!'
    },
    lore: 'Mago clássico com chapéu pontudo e manto roxo estrelado. Canaliza labaredas incandescentes no cristal do seu cajado para explodir veios inteiros de minério.'
  },
  {
    id: 'class_mage',
    name: 'Conde Vampiro',
    title: 'Lorde das Sombras',
    role: 'Canalizador Sombrio',
    rarity: 'epic',
    avatar: '🧛',
    image: '/miners/vampire.png',
    bannerImage: '/miners/banners/banner_mage.png',
    color: '#a855f7',
    borderColor: '#7e22ce',
    badge: 'ÉPICO',
    basePower: 8.5,
    baseSpeed: 1.6,
    baseStamina: 140,
    equipment: 'Foice Noturna de Sangue & Manto das Sombras',
    weaponType: 'blood_scythe',
    directCostBcoin: 75,
    passiveTrait: {
      name: 'Colheita Carmesim',
      description: 'Golpeia com a Foice de Sangue gerando arco cortante, dreno de essência e +35% de BCOIN ao destruir minérios.'
    },
    lore: 'Um aristocrata vampiro que habita as profundezas. Com gola alta rubra e sua lendária Foice Noturna com asas de morcego e lâmina carmesim, colhe o poder das rochas.'
  },
  {
    id: 'class_legendary',
    name: 'Minerador Lendário',
    title: 'O Mestre da Picareta Ancestral',
    role: 'Demolidor Mineral Supremo',
    rarity: 'legendary',
    avatar: '⛏️',
    image: '/miners/golem.png',
    bannerImage: '/miners/banners/banner_legendary.png',
    color: '#eab308',
    borderColor: '#ca8a04',
    badge: 'LENDÁRIO',
    basePower: 18.0,
    baseSpeed: 2.2,
    baseStamina: 160,
    equipment: 'Picareta de Aço & Capacete com Lanterna',
    weaponType: 'pickaxe',
    directCostBcoin: 150,
    passiveTrait: {
      name: 'Instinto Mineral Ancestral',
      description: 'Golpes com a picareta têm 40% de chance de causar dano quádruplo e dobrar a extração de ouro!'
    },
    lore: 'O lendário minerador pioneiro que descobriu as minas subterrâneas de Bomb Crypto. Com capacete amarelo iluminador e sua picareta de aço temperado, estilhaça qualquer rocha com extrema facilidade.'
  },
  {
    id: 'class_pirate',
    name: 'Capitão Pirata',
    title: 'O Corsário dos Sete Mares',
    role: 'Caçador de Tesouros',
    rarity: 'rare',
    avatar: '🏴‍☠️',
    image: '/miners/pirate.png',
    bannerImage: '/miners/banners/banner_pirate.png',
    color: '#ef4444',
    borderColor: '#b91c1c',
    badge: 'RARO',
    basePower: 4.5,
    baseSpeed: 1.4,
    baseStamina: 120,
    equipment: 'Bacamarte Flintlock de Pólvora Negra & Tapa-Olho',
    weaponType: 'flintlock',
    directCostBcoin: 30,
    passiveTrait: {
      name: 'Saque Corsário',
      description: '+40% de chance de dobrar o valor do saque em baús e veios raros.'
    },
    lore: 'Corsário destemido com tricórnio de caveira e autêntico bacamarte de cano de bronze. Dispara tiros estrondosos de pólvora negra para estilhaçar blocos e pilhar tesouros.'
  },
  {
    id: 'class_cowboy',
    name: 'Cowboy Xerife',
    title: 'O Pistoleiro do Faroeste',
    role: 'Ataques Rápidos',
    rarity: 'rare',
    avatar: '🤠',
    image: '/miners/cowboy.png',
    bannerImage: '/miners/banners/banner_cowboy.png',
    color: '#f59e0b',
    borderColor: '#d97706',
    badge: 'RARO',
    basePower: 4.0,
    baseSpeed: 1.8,
    baseStamina: 120,
    equipment: 'Revólver Colt .45 Peacemaker & Estrela de Xerife',
    weaponType: 'revolver',
    directCostBcoin: 28,
    passiveTrait: {
      name: 'Tiro Certeiro',
      description: '35% de chance de desferir dois disparos consecutivos ultrarrápidos no mesmo bloco.'
    },
    lore: 'O xerife lendário do velho oeste. Com chapéu Stetson e estrela dourada, possui o saque mais rápido da mina, desferindo rajadas relâmpago com seu Colt .45.'
  },
  {
    id: 'class_fairy',
    name: 'Fadinha das Asas',
    title: 'A Guardiã Alada dos Cristais',
    role: 'Voo Mágico & Agilidade',
    rarity: 'rare',
    avatar: '🧚‍♀️',
    image: '/miners/fairy.png',
    bannerImage: '/miners/banners/banner_fairy.png',
    color: '#f472b6',
    borderColor: '#db2777',
    badge: 'RARO',
    basePower: 4.8,
    baseSpeed: 2.3,
    baseStamina: 120,
    equipment: 'Asas Translúcidas de Cristal & Varinha Estelar Prismática',
    weaponType: 'star_wand',
    directCostBcoin: 48,
    passiveTrait: {
      name: 'Pó de Fada Estelar',
      description: 'Voa suavemente sobre as trilhas da mina com asas translúcidas e dispara feixes cósmicos de estrelas cadentes.'
    },
    lore: 'A guardiã alada dos cristais estelares. Munida de sua Varinha Estelar de Ouro e Asas de Cristal, canaliza constelações para pulverizar rochas em chuva de meteoros brilhantes.'
  },
  {
    id: 'class_spiderman',
    name: 'Homem-Aranha',
    title: 'O Aracnídeo dos Subsolos',
    role: 'Mobilidade & Teia',
    rarity: 'epic',
    avatar: '🕷️',
    image: '/miners/spiderman.png',
    bannerImage: '/miners/banners/banner_spiderman.png',
    color: '#3b82f6',
    borderColor: '#1d4ed8',
    badge: 'ÉPICO',
    basePower: 9.5,
    baseSpeed: 2.0,
    baseStamina: 140,
    equipment: 'Lançadores de Teia & Picareta de Aço',
    weaponType: 'web_pick',
    directCostBcoin: 70,
    passiveTrait: {
      name: 'Sentido Aranha',
      description: 'Prevê os pontos fracos das rochas, garantindo que nenhum golpe seja desperdiçado.'
    },
    lore: 'Com grandes poderes vêm grandes quantidades de BCOIN! Escala tetos de caverna e quebra rochas com teias reforçadas.'
  },
  {
    id: 'class_batman',
    name: 'O Magnata',
    title: 'O Bilionário das Criptos',
    role: 'Poder Financeiro & Destruição em Massa',
    rarity: 'legendary',
    avatar: '💼',
    image: '/miners/batman.png',
    bannerImage: '/miners/banners/banner_batman.png',
    color: '#1e3a8a',
    borderColor: '#3b82f6',
    badge: 'LENDÁRIO',
    basePower: 17.0,
    baseSpeed: 1.6,
    baseStamina: 160,
    equipment: 'Terno Sob Medida & Maço de Dólares Voadores',
    weaponType: 'money_shot',
    directCostBcoin: 130,
    passiveTrait: {
      name: 'Chuva de Dinheiro (Make it Rain)',
      description: 'Arremessa maços maciços de dólares em velocidade supersônica com explosão de cédulas, moedas de ouro e tremores.'
    },
    lore: 'O bilionário magnata dos negócios que comprou a mina. Munido de pilhas infinitas de dinheiro e terno impecável, destrói blocos lançando rajadas de notas com poder financeiro avassalador.'
  }
];

export const MINT_CHEST_TYPES = [
  {
    id: 'miner',
    name: 'Baú Miner',
    heroesCount: 1,
    costUsdt: 10,
    costBcoin: 1000,
    description: 'Entrega 1 herói minerador. Ideal para iniciar sua jornada na mina.',
    icon: '⛏️',
    color: '#38bdf8',
    chances: [
      { rarity: 'Comum', pct: '70%' },
      { rarity: 'Raro', pct: '20%' },
      { rarity: 'Épico', pct: '8%' },
      { rarity: 'Lendário', pct: '2%' }
    ]
  },
  {
    id: 'explorer',
    name: 'Baú Explorer',
    heroesCount: 5,
    costUsdt: 50,
    costBcoin: 5000,
    popular: true,
    description: 'Entrega 5 heróis mineradores com chances elevadas de Raros e Épicos.',
    icon: '🗺️',
    color: '#22c55e',
    chances: [
      { rarity: 'Comum', pct: '55%' },
      { rarity: 'Raro', pct: '27%' },
      { rarity: 'Épico', pct: '14%' },
      { rarity: 'Lendário', pct: '4%' }
    ]
  },
  {
    id: 'elite',
    name: 'Baú Elite',
    heroesCount: 10,
    costUsdt: 95,
    costBcoin: 9500,
    description: 'Entrega 10 heróis mineradores. Probabilidade expressiva de Épicos e Lendários com desconto no pacote.',
    icon: '🛡️',
    color: '#a855f7',
    chances: [
      { rarity: 'Comum', pct: '40%' },
      { rarity: 'Raro', pct: '30%' },
      { rarity: 'Épico', pct: '22%' },
      { rarity: 'Lendário', pct: '8%' }
    ]
  },
  {
    id: 'legendary',
    name: 'Baú Legendary',
    heroesCount: 15,
    costUsdt: 140,
    costBcoin: 14000,
    badge: 'TIME COMPLETO (15)',
    description: 'Entrega 15 heróis mineradores (capacidade máxima da mina simultânea). Maior chance de Lendários do jogo!',
    icon: '👑',
    color: '#f59e0b',
    chances: [
      { rarity: 'Comum', pct: '25%' },
      { rarity: 'Raro', pct: '30%' },
      { rarity: 'Épico', pct: '30%' },
      { rarity: 'Lendário', pct: '15%' }
    ]
  }
];
