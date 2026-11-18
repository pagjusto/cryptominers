export const GRID_COLS = 15;
export const GRID_ROWS = 11;
export const TILE_SIZE = 60; // tamanho do bloco em pixels no Canvas

// Tipos de células do mapa
export const CELL_EMPTY = 0;
export const CELL_WALL = 1;     // Bloco indestrutível de metal/concreto
export const CELL_BLOCK = 2;    // Bloco quebrável de tijolo/pedra
export const CELL_CHEST_WOOD = 3;
export const CELL_CHEST_IRON = 4;
export const CELL_CHEST_GOLD = 5;
export const CELL_CHEST_DIAMOND = 6;
export const CELL_JAIL = 7;     // Prisão com herói preso dentro

// Configurações dos baús
export const CHEST_DATA = {
  [CELL_CHEST_WOOD]: {
    name: 'Baú de Madeira',
    maxHp: 3,
    color: '#854d0e',
    rewardMin: 0.2,
    rewardMax: 0.6,
    icon: '📦'
  },
  [CELL_CHEST_IRON]: {
    name: 'Baú de Ferro',
    maxHp: 8,
    color: '#64748b',
    rewardMin: 0.8,
    rewardMax: 1.8,
    icon: '🧰'
  },
  [CELL_CHEST_GOLD]: {
    name: 'Baú de Ouro',
    maxHp: 18,
    color: '#eab308',
    rewardMin: 2.5,
    rewardMax: 5.0,
    icon: '👑'
  },
  [CELL_CHEST_DIAMOND]: {
    name: 'Baú de Diamante',
    maxHp: 35,
    color: '#06b6d4',
    rewardMin: 8.0,
    rewardMax: 18.0,
    icon: '💎'
  },
  [CELL_JAIL]: {
    name: 'Prisão de Herói',
    maxHp: 12,
    color: '#475569',
    rewardMin: 0,
    rewardMax: 0,
    icon: '⛓️'
  }
};

export const RARITIES = {
  common: {
    id: 'common',
    name: 'Comum',
    color: '#94a3b8',
    bgBadge: 'bg-slate-700 text-slate-200 border-slate-500',
    minPower: 1,
    maxPower: 2,
    speed: 1.2,
    stamina: 60,
    bombCount: 1,
    bombRange: 1,
    chance: 0.80
  },
  rare: {
    id: 'rare',
    name: 'Raro',
    color: '#3b82f6',
    bgBadge: 'bg-blue-950 text-blue-300 border-blue-500',
    minPower: 3,
    maxPower: 5,
    speed: 1.6,
    stamina: 100,
    bombCount: 2,
    bombRange: 2,
    chance: 0.14
  },
  superRare: {
    id: 'superRare',
    name: 'Super Raro',
    color: '#a855f7',
    bgBadge: 'bg-purple-950 text-purple-300 border-purple-500',
    minPower: 6,
    maxPower: 8,
    speed: 2.0,
    stamina: 150,
    bombCount: 3,
    bombRange: 3,
    chance: 0.04
  },
  epic: {
    id: 'epic',
    name: 'Épico',
    color: '#f59e0b',
    bgBadge: 'bg-amber-950 text-amber-300 border-amber-500',
    minPower: 9,
    maxPower: 12,
    speed: 2.4,
    stamina: 200,
    bombCount: 4,
    bombRange: 4,
    chance: 0.015
  },
  legendary: {
    id: 'legendary',
    name: 'Lendário',
    color: '#ef4444',
    bgBadge: 'bg-red-950 text-red-300 border-red-500 animate-pulse',
    minPower: 15,
    maxPower: 20,
    speed: 2.8,
    stamina: 300,
    bombCount: 5,
    bombRange: 5,
    chance: 0.005
  }
};

export const HERO_NAMES = [
  'Bombardei-X', 'Cyborg-01', 'Ignis', 'Volcano', 'Sparky', 'Blast-Master',
  'Dynamite Joe', 'Nitro', 'Pixel-Boom', 'Titan', 'Shadow-Bomber', 'Krypton'
];

export const INITIAL_HEROES = [
  {
    id: 'hero-1',
    name: 'Bombardei-X',
    rarity: 'common',
    power: 2,
    speed: 1.2,
    maxStamina: 60,
    currentStamina: 60,
    bombCount: 1,
    bombRange: 1,
    status: 'work', // 'work' | 'sleep'
    x: 1,
    y: 1,
    color: '#10b981',
    avatar: '🤖'
  },
  {
    id: 'hero-2',
    name: 'Sparky',
    rarity: 'rare',
    power: 4,
    speed: 1.6,
    maxStamina: 100,
    currentStamina: 100,
    bombCount: 2,
    bombRange: 2,
    status: 'work',
    x: 1,
    y: 9,
    color: '#3b82f6',
    avatar: '⚡'
  }
];
