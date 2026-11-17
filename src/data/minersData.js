// Configuração das Classes de Mineradores e das Minas Subterrâneas

export const GRID_COLS = 15;
export const GRID_ROWS = 11;
export const TILE_SIZE = 48;

// Tipos de Blocos Subterrâneos
export const BLOCK_EMPTY = 0;
export const BLOCK_BEDROCK = 1;     // Rocha matriz indestrutível
export const BLOCK_ROCK = 2;        // Rocha comum de escavação
export const BLOCK_ORE_COMMON = 3;  // Minério comum de carvão/cobre
export const BLOCK_ORE_CRYSTAL = 4; // Cristal luminoso da mina
export const BLOCK_ORE_GOLD = 5;    // Veio de ouro puro
export const BLOCK_TREASURE = 6;    // Baú secreto enterrado
export const BLOCK_ANCIENT_ALTAR = 7; // Altar místico da mina
export const BLOCK_DEPOSIT_EMERALD = 8; // Jazida oficial de esmeralda verde (8%)
export const BLOCK_ZOMBIE = 9; // Zumbi oficial (substitui as jazidas com movimento e ataque)
export const BLOCK_BOSS = 10; // Boss oficial (substitui o baú de tesouro com movimento e ataque)

// As 6 Classes de Personagens (Elenco Oficial Bomb Crypto: Criaturas & Fantasia)
export const MINER_CLASSES = {
  miner: {
    id: 'miner',
    name: 'Bomb-Bot 3000',
    subtitle: 'Autômato de Mineração Chibi',
    avatar: '🤖',
    color: '#38bdf8',
    basePower: 2,
    baseSpeed: 1.3,
    baseStamina: 100,
    specialty: 'Resistência Elétrica: 35% menos estamina por golpe',
    description: 'Robô com armadura industrial, olhos de LED ciano e martelete demolidor operado na horizontal.',
    chance: 0.60
  },
  brute: {
    id: 'brute',
    name: 'Bárbaro Viking',
    subtitle: 'O Demolidor com Chifres',
    avatar: '🪓',
    color: '#f97316',
    basePower: 6,
    baseSpeed: 0.95,
    baseStamina: 140,
    specialty: 'Golpe Demolidor: 28% de Crítico Duplo com tremor',
    description: 'Anão guerreiro com elmo de chifres, trança ruiva e machado duplo de batalha.',
    chance: 0.25
  },
  goblin: {
    id: 'goblin',
    name: 'Sapo Ninja Shinobi',
    subtitle: 'O Mestre Anfíbio das Sombras',
    avatar: '🐸',
    color: '#22c55e',
    basePower: 3,
    baseSpeed: 2.1,
    baseStamina: 90,
    specialty: 'Arremesso de Kunai: crítico ácido veloz e +50% bônus em BCOIN',
    description: 'O clássico ninja do Bomb Crypto! Sapinho anfíbio veloz com bandana preta que arremessa velozes Kunais de veneno ácido cortante com impacto perfurante.',
    chance: 0.10
  },
  engineer: {
    id: 'engineer',
    name: 'Mago Arcano do Subsolo',
    subtitle: 'O Arquimago das Chamas & Gemas',
    avatar: '🧙‍♂️',
    color: '#9333ea',
    basePower: 5,
    baseSpeed: 1.5,
    baseStamina: 120,
    specialty: 'Bola de Fogo Demolidora: explosão ígnea e dano em área',
    description: 'Poderoso mago com chapéu pontudo torto e manto roxo estrelado. Conjura esferas de fogo incandescentes pelo seu cajado de cristal.',
    chance: 0.035
  },
  mage: {
    id: 'mage',
    name: 'Conde Vampiro',
    subtitle: 'Lorde das Sombras',
    avatar: '🧛',
    color: '#a855f7',
    basePower: 4,
    baseSpeed: 1.6,
    baseStamina: 130,
    specialty: 'Colheita Carmesim: golpe ceifador de foice e +35% de BCOIN',
    description: 'Nobre gótico com sobretudo carmesim de gola alta, presas afiadas e a lendária Foice Noturna de Sangue.',
    chance: 0.012
  },
  legendary: {
    id: 'legendary',
    name: 'Minerador Clássico',
    subtitle: 'Mestre da Picareta Ancestral',
    avatar: '⛏️',
    color: '#eab308',
    basePower: 10,
    baseSpeed: 2.2,
    baseStamina: 200,
    specialty: 'Golpe de Picareta: Crítico mineral duplo e +50% de BCOIN ao quebrar rochas',
    description: 'O minerador lendário pioneiro com capacete amarelo de segurança, lanterna de foco frontal e picareta pesada de aço temperado.',
    chance: 0.003
  },
  pirate: {
    id: 'pirate',
    name: 'Capitão Pirata',
    subtitle: 'O Corsário dos Sete Mares',
    avatar: '🏴‍☠️',
    color: '#ef4444',
    basePower: 5,
    baseSpeed: 1.4,
    baseStamina: 130,
    specialty: 'Saque Corsário: +40% de chance de dobrar drops de baús',
    description: 'Corsário com chapéu tricórnio de caveira, tapa-olho e autêntico bacamarte de pólvora negra com tiro explosivo.',
    chance: 0.05
  },
  cowboy: {
    id: 'cowboy',
    name: 'Cowboy Xerife',
    subtitle: 'O Pistoleiro do Faroeste',
    avatar: '🤠',
    color: '#f59e0b',
    basePower: 4,
    baseSpeed: 1.8,
    baseStamina: 110,
    specialty: 'Saque Rápido: 35% de chance de disparo duplo instantâneo com rajada de Colt',
    description: 'Pistoleiro clássico com chapéu Stetson, estrela dourada de xerife e o lendário revólver Colt .45 de saque relâmpago.',
    chance: 0.08
  },
  fairy: {
    id: 'fairy',
    name: 'Fadinha das Asas',
    subtitle: 'A Guardiã Alada dos Cristais',
    avatar: '🧚‍♀️',
    color: '#f472b6',
    basePower: 4,
    baseSpeed: 2.3,
    baseStamina: 105,
    specialty: 'Pó de Fada Estelar: voa suavemente com asas reluzentes e dispara feixes cósmicos',
    description: 'Fada encantada com asas translúcidas reluzentes que batem ao voar e a lendária Varinha Estelar de Ouro que dispara feixes cósmicos.',
    chance: 0.06
  },
  ballerina: {
    id: 'fairy',
    name: 'Fadinha das Asas',
    subtitle: 'A Guardiã Alada dos Cristais',
    avatar: '🧚‍♀️',
    color: '#f472b6',
    basePower: 4,
    baseSpeed: 2.3,
    baseStamina: 105,
    specialty: 'Pó de Fada Estelar: voa suavemente com asas reluzentes e dispara feixes cósmicos',
    description: 'Fada encantada com asas translúcidas reluzentes que batem ao voar e a lendária Varinha Estelar de Ouro que dispara feixes cósmicos.',
    chance: 0.06
  },
  spiderman: {
    id: 'spiderman',
    name: 'Homem-Aranha',
    subtitle: 'O Aracnídeo dos Subsolos',
    avatar: '🕷️',
    color: '#3b82f6',
    basePower: 5,
    baseSpeed: 2.0,
    baseStamina: 125,
    specialty: 'Sentido Aranha: golpes velozes reforçados com teia de aço',
    description: 'Herói com traje clássico vermelho e azul com teias, olhos brancos reflexivos e picareta de teia.',
    chance: 0.04
  },
  batman: {
    id: 'batman',
    name: 'O Magnata',
    subtitle: 'O Bilionário das Criptos',
    avatar: '💼',
    color: '#1e3a8a',
    basePower: 7,
    baseSpeed: 1.6,
    baseStamina: 160,
    specialty: 'Chuva de Dinheiro: Arremessa maços maciços de dólares voadores',
    description: 'Bilionário magnata de terno azul marinho e gravata vermelha que destrói blocos arremessando pilhas maciças de dinheiro.',
    chance: 0.02
  }
};

// As 7 Minas / Biomas Subterrâneos
export const MINES = [
  {
    id: 'canyon',
    level: 1,
    name: 'Mina do Cânion Subterrâneo',
    subtitle: 'A Grande Ravina dos Vagonetes',
    icon: '🏜️',
    bgFloor: '#784825',
    bgFloorAlt: '#5d3417',
    wallColor: '#9a5e32',
    rockColor: '#b47240',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    primaryDrop: 'Pepitas de Ouro & Cristais',
    goldMultiplier: 1.5,
    gemChance: 0.35,
    reqGold: 0,
    description: 'Cânion detalhado em alta definição com trilhos sinuosos, entrada em vigas de madeira e veios reluzentes de ouro.'
  },
  {
    id: 'stone',
    level: 2,
    name: 'Mina de Pedra',
    subtitle: 'O Ponto de Partida',
    icon: '🪨',
    bgFloor: '#1e293b',
    bgFloorAlt: '#0f172a',
    wallColor: '#475569',
    rockColor: '#64748b',
    glowColor: 'rgba(148, 163, 184, 0.3)',
    primaryDrop: 'Carvão & Cobre',
    goldMultiplier: 1.0,
    gemChance: 0.15,
    reqGold: 0,
    description: 'Caverna inicial rica em pedras e minérios básicos.'
  },
  {
    id: 'emerald',
    level: 2,
    name: 'Mina Esmeralda',
    subtitle: 'Caverna Fluorescente',
    icon: '🟢',
    bgFloor: '#064e3b',
    bgFloorAlt: '#022c22',
    wallColor: '#047857',
    rockColor: '#059669',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    primaryDrop: 'Cristais Verdes',
    goldMultiplier: 1.8,
    gemChance: 0.35,
    reqGold: 100,
    description: 'Paredes cobertas de cristais verdes que emitem luz própria.'
  },
  {
    id: 'gold',
    level: 3,
    name: 'Mina de Ouro',
    subtitle: 'Veio Imperial',
    icon: '🟡',
    bgFloor: '#451a03',
    bgFloorAlt: '#291002',
    wallColor: '#b45309',
    rockColor: '#d97706',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    primaryDrop: 'Pepitas de Ouro',
    goldMultiplier: 3.2,
    gemChance: 0.45,
    reqGold: 350,
    description: 'As rochas reluzem com veios espessos de ouro maciço.'
  },
  {
    id: 'volcano',
    level: 4,
    name: 'Mina Vulcânica',
    subtitle: 'Profundezas de Magma',
    icon: '🌋',
    bgFloor: '#450a0a',
    bgFloorAlt: '#270505',
    wallColor: '#991b1b',
    rockColor: '#dc2626',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    primaryDrop: 'Obsidiana & Rubi',
    goldMultiplier: 5.5,
    gemChance: 0.60,
    reqGold: 900,
    description: 'Ambiente perigoso onde o magma corre ao lado das rochas.'
  },
  {
    id: 'diamond',
    level: 5,
    name: 'Mina de Diamantes',
    subtitle: 'Abismo Cristalino',
    icon: '💎',
    bgFloor: '#082f49',
    bgFloorAlt: '#031926',
    wallColor: '#0284c7',
    rockColor: '#0ea5e9',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    primaryDrop: 'Diamantes Puros',
    goldMultiplier: 9.0,
    gemChance: 0.75,
    reqGold: 2200,
    description: 'Caverna gelada repleta de diamantes azuis de valor inestimável.'
  },
  {
    id: 'legendary',
    level: 6,
    name: 'Mina Cósmica Ancestral',
    subtitle: 'O Santuário das Estrelas',
    icon: '🌌',
    bgFloor: '#2e1065',
    bgFloorAlt: '#170638',
    wallColor: '#7e22ce',
    rockColor: '#9333ea',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    primaryDrop: 'Matéria Estelar',
    goldMultiplier: 16.0,
    gemChance: 0.90,
    reqGold: 5000,
    description: 'O ápice subterrâneo guardado por energias ancestrais do cosmos.'
  }
];

export const INITIAL_MINERS = [
  {
    id: 'miner-1',
    name: 'Bomb-Bot Alpha',
    classId: 'miner',
    level: 1,
    power: 2,
    speed: 1.3,
    maxStamina: 100,
    currentStamina: 100,
    status: 'work',
    x: 1,
    y: 1,
    avatar: '🤖',
    color: '#38bdf8'
  },
  {
    id: 'miner-2',
    name: 'Ragnar Chifre-de-Ferro',
    classId: 'brute',
    level: 1,
    power: 6,
    speed: 0.95,
    maxStamina: 140,
    currentStamina: 140,
    status: 'work',
    x: 1,
    y: 9,
    avatar: '🪓',
    color: '#f97316'
  },
  {
    id: 'miner-3',
    name: 'Kero Shinobi',
    classId: 'goblin',
    level: 1,
    power: 3,
    speed: 2.1,
    maxStamina: 90,
    currentStamina: 90,
    status: 'work',
    x: 13,
    y: 1,
    avatar: '🐸',
    color: '#22c55e'
  }
];
