// ============================================================================
// GEARS & RELICS SYSTEM (CRYPTOZOMBIES RPG EXPANSION)
// Slots:
// 1. ⛏️ Arma/Picareta: Aumenta Poder e Chance Crítica
// 2. 🪖 Capacete: item visual; bônus temporariamente desativado
// 3. 💍 Amuleto Místico: Concede chance de dobrar o BCOIN minerado (2x Lucky Drop)
// ============================================================================

export const GEAR_TYPES = {
  weapon: {
    id: 'weapon',
    name: 'Arma / Picareta',
    icon: '⛏️',
    slotLabel: 'Arma',
    desc: 'Aumenta Poder de Dano e Chance de Acerto Crítico'
  },
  helmet: {
    id: 'helmet',
    name: 'Capacete / Elmo',
    icon: '🪖',
    slotLabel: 'Capacete',
    desc: 'Bônus temporariamente desativado enquanto a estamina estiver fora do jogo'
  },
  amulet: {
    id: 'amulet',
    name: 'Amuleto Místico',
    icon: '💍',
    slotLabel: 'Amuleto',
    desc: 'Concede chance de dobrar o BCOIN coletado na mineração'
  }
};

export const GEAR_RARITIES = {
  common: {
    name: 'Comum',
    color: '#94a3b8',
    borderColor: 'border-slate-500',
    bgBadge: 'bg-slate-500/20 text-slate-300',
    glow: 'rgba(148, 163, 184, 0.4)'
  },
  rare: {
    name: 'Raro',
    color: '#38bdf8',
    borderColor: 'border-sky-500',
    bgBadge: 'bg-sky-500/20 text-sky-300',
    glow: 'rgba(56, 189, 248, 0.4)'
  },
  epic: {
    name: 'Épico',
    color: '#a855f7',
    borderColor: 'border-purple-500',
    bgBadge: 'bg-purple-500/20 text-purple-300',
    glow: 'rgba(168, 85, 247, 0.4)'
  },
  legendary: {
    name: 'Lendário',
    color: '#fbbf24',
    borderColor: 'border-amber-400',
    bgBadge: 'bg-amber-500/20 text-amber-300',
    glow: 'rgba(251, 191, 36, 0.5)'
  }
};

export const GEAR_CATALOG = [
  // ⛏️ ARMAS / PICARETAS
  {
    id: 'gear_w1',
    type: 'weapon',
    rarity: 'common',
    name: 'Picareta de Aço Fixo',
    icon: '⛏️',
    powerBonus: 2,
    critBonus: 0.05, // +5%
    desc: '+2 Poder • +5% Crítico'
  },
  {
    id: 'gear_w2',
    type: 'weapon',
    rarity: 'rare',
    name: 'Broca de Adamantium',
    icon: '🔩',
    powerBonus: 4,
    critBonus: 0.10, // +10%
    desc: '+4 Poder • +10% Crítico'
  },
  {
    id: 'gear_w3',
    type: 'weapon',
    rarity: 'epic',
    name: 'Machado Rúnico do Trovão',
    icon: '🪓',
    powerBonus: 7,
    critBonus: 0.18, // +18%
    desc: '+7 Poder • +18% Crítico'
  },
  {
    id: 'gear_w4',
    type: 'weapon',
    rarity: 'legendary',
    name: 'Picareta Divina Estelar',
    icon: '✨',
    powerBonus: 12,
    critBonus: 0.25, // +25%
    desc: '+12 Poder • +25% Crítico Estelar'
  },

  // 🪖 CAPACETES / ELMOS
  {
    id: 'gear_h1',
    type: 'helmet',
    rarity: 'common',
    name: 'Capacete de Couro Reforçado',
    icon: '🪖',
    desc: 'Bônus temporariamente desativado'
  },
  {
    id: 'gear_h2',
    type: 'helmet',
    rarity: 'rare',
    name: 'Elmo de Bronze com Lanterna',
    icon: '🏮',
    desc: 'Bônus temporariamente desativado'
  },
  {
    id: 'gear_h3',
    type: 'helmet',
    rarity: 'epic',
    name: 'Elmo de Titânio Blindado',
    icon: '🛡️',
    desc: 'Bônus temporariamente desativado'
  },
  {
    id: 'gear_h4',
    type: 'helmet',
    rarity: 'legendary',
    name: 'Coroa Dracônica Ancestral',
    icon: '👑',
    desc: 'Bônus temporariamente desativado'
  },

  // 💍 AMULETOS MÍSTICOS
  {
    id: 'gear_a1',
    type: 'amulet',
    rarity: 'common',
    name: 'Amuleto de Cobre Polido',
    icon: '🧿',
    doubleBcoinChance: 0.15, // 15% chance de dobrar BCOIN
    desc: '15% Chance de DOBRAR o BCOIN minerado'
  },
  {
    id: 'gear_a2',
    type: 'amulet',
    rarity: 'rare',
    name: 'Colar da Lua Prateada',
    icon: '🌙',
    doubleBcoinChance: 0.22,
    desc: '22% Chance de DOBRAR o BCOIN minerado'
  },
  {
    id: 'gear_a3',
    type: 'amulet',
    rarity: 'epic',
    name: 'Talismã da Fortuna Dourada',
    icon: '📿',
    doubleBcoinChance: 0.30,
    desc: '30% Chance de DOBRAR o BCOIN minerado'
  },
  {
    id: 'gear_a4',
    type: 'amulet',
    rarity: 'legendary',
    name: 'Anel do Rei Midas',
    icon: '💍',
    doubleBcoinChance: 0.42,
    desc: '42% Chance de DOBRAR o BCOIN minerado (Midas Touch)'
  }
];

// Gerador de Loot de Equipamentos ao minerar Jazidas de Ouro e Baús
export function rollMiningGearDrop(sourceType) {
  // Probabilidade de Drop
  let dropChance = 0;
  if (sourceType === 'gold') dropChance = 0.14; // 14% em Veios de Ouro
  else if (sourceType === 'treasure') dropChance = 0.40; // 40% em Baús Místicos
  else if (sourceType === 'altar') dropChance = 0.50; // 50% em Altares
  else if (sourceType === 'crystal') dropChance = 0.18; // 18% em Diamantes

  if (Math.random() > dropChance) return null;

  // Sorteia raridade com peso
  const randRarity = Math.random();
  let rarity = 'common';
  if (randRarity < 0.60) rarity = 'common';
  else if (randRarity < 0.85) rarity = 'rare';
  else if (randRarity < 0.96) rarity = 'epic';
  else rarity = 'legendary';

  const pool = GEAR_CATALOG.filter(g => g.rarity === rarity);
  const picked = pool[Math.floor(Math.random() * pool.length)];

  return {
    ...picked,
    instanceId: 'gear-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    acquiredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

// Inicial de equipamentos no armazém para o jogador testar de imediato
export const INITIAL_GEAR_STASH = [
  {
    ...GEAR_CATALOG.find(g => g.id === 'gear_w2'), // Broca Adamantium (Rara)
    instanceId: 'starter-gear-1',
    acquiredAt: 'Início da Jornada'
  },
  {
    ...GEAR_CATALOG.find(g => g.id === 'gear_h1'), // Capacete de Couro (Comum)
    instanceId: 'starter-gear-2',
    acquiredAt: 'Início da Jornada'
  },
  {
    ...GEAR_CATALOG.find(g => g.id === 'gear_a1'), // Amuleto de Cobre (Comum)
    instanceId: 'starter-gear-3',
    acquiredAt: 'Início da Jornada'
  }
];
