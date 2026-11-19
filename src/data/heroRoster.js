// CRIPTO MYNERS — elenco oficial de heróis, raridades e equipamentos
// Catálogo de dados: personagens e armas são entidades separadas.

export const RARITY_CONFIG = {
  super_legend: {
    id: 'super_legend',
    name: 'Super Legend',
    color: '#ef4444', // Borda Vermelha
    border: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    auraColor: 'rgba(239, 68, 68, 0.55)',
    badgeBg: 'rgba(239, 68, 68, 0.2)',
    badgeText: '#f87171',
    badgeBorder: 'rgba(239, 68, 68, 0.45)'
  },
  legendary: {
    id: 'legendary',
    name: 'Legend',
    color: '#f97316', // Borda Laranja
    border: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.45)',
    auraColor: 'rgba(249, 115, 22, 0.55)',
    badgeBg: 'rgba(249, 115, 22, 0.2)',
    badgeText: '#fb923c',
    badgeBorder: 'rgba(249, 115, 22, 0.45)'
  },
  epic: {
    id: 'epic',
    name: 'Épico',
    color: '#a855f7', // Borda Roxa
    border: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    auraColor: 'rgba(168, 85, 247, 0.55)',
    badgeBg: 'rgba(168, 85, 247, 0.2)',
    badgeText: '#c084fc',
    badgeBorder: 'rgba(168, 85, 247, 0.45)'
  },
  rare: {
    id: 'rare',
    name: 'Raro',
    color: '#38bdf8', // Borda Azul
    border: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    auraColor: 'rgba(56, 189, 248, 0.55)',
    badgeBg: 'rgba(56, 189, 248, 0.2)',
    badgeText: '#38bdf8',
    badgeBorder: 'rgba(56, 189, 248, 0.45)'
  },
  common: {
    id: 'common',
    name: 'Comum',
    color: '#22c55e', // Borda Verde
    border: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.45)',
    auraColor: 'rgba(34, 197, 94, 0.55)',
    badgeBg: 'rgba(34, 197, 94, 0.2)',
    badgeText: '#4ade80',
    badgeBorder: 'rgba(34, 197, 94, 0.45)'
  }
};

export function getRarityConfig(rarity) {
  const key = (rarity || 'common').toLowerCase();
  return RARITY_CONFIG[key] || RARITY_CONFIG.common;
}

export const HERO_ROSTER = [
  {
    id: 'verdant',
    name: 'Verdant',
    classId: 'explorer',
    className: 'Explorador',
    rarity: 'common',
    rarityName: 'Comum',
    spriteIndex: 0,
    weaponId: 'assault-rifle',
    role: 'Reconhecimento e mobilidade'
  },
  {
    id: 'granito',
    name: 'Granito',
    classId: 'tank',
    className: 'Tanque',
    rarity: 'legendary',
    rarityName: 'Legend',
    spriteIndex: 1,
    weaponId: 'heavy-machine-gun',
    role: 'Absorção de dano e proteção'
  },
  {
    id: 'nox',
    name: 'Nox',
    classId: 'fighter',
    className: 'Combatente',
    rarity: 'epic',
    rarityName: 'Épico',
    spriteIndex: 2,
    weaponId: 'energy-blaster',
    role: 'Combate equilibrado com canhão de energia'
  },
  {
    id: 'brasa',
    name: 'Brasa',
    classId: 'assault',
    className: 'Assalto (Molotov)',
    rarity: 'legendary',
    rarityName: 'Legend',
    spriteIndex: 3,
    weaponId: 'molotov',
    role: 'Arremesso de coquetel molotov e poça incendiária em área'
  },
  {
    id: 'mumia',
    name: 'Múmia',
    classId: 'survivor',
    className: 'Sobrevivente',
    rarity: 'common',
    rarityName: 'Comum',
    spriteIndex: 5,
    weaponId: 'shotgun',
    role: 'Resistência e combate próximo'
  },
  {
    id: 'polar',
    name: 'Polar',
    classId: 'specialist',
    className: 'Especialista',
    rarity: 'rare',
    rarityName: 'Raro',
    spriteIndex: 6,
    weaponId: 'compact-rifle',
    role: 'Precisão e suporte tático'
  },
  {
    id: 'fenix',
    name: 'Fênix',
    classId: 'assault',
    className: 'Assalto (Lança-chamas)',
    rarity: 'super_legend',
    rarityName: 'Super Legend',
    spriteIndex: 7,
    weaponId: 'flamethrower',
    role: 'Jato contínuo de chamas e dispersão de calor em área'
  },
  {
    id: 'sombra',
    name: 'Sombra',
    classId: 'infiltrator',
    className: 'Infiltrador',
    rarity: 'rare',
    rarityName: 'Raro',
    spriteIndex: 8,
    weaponId: 'precision-rifle',
    role: 'Ataque de precisão de longo alcance'
  },
  {
    id: 'iron',
    name: 'Iron',
    classId: 'heavy',
    className: 'Granadeiro Blindado',
    rarity: 'epic',
    rarityName: 'Épico',
    spriteIndex: 9,
    weaponId: 'grenade',
    role: 'Arremesso de granadas pesadas e explosão em área'
  },
  {
    id: 'colosso',
    name: 'Colosso',
    classId: 'juggernaut',
    className: 'Tanque de elite',
    rarity: 'super_legend',
    rarityName: 'Super Legend',
    spriteIndex: 10,
    weaponId: 'rocket-launcher',
    role: 'Poder de fogo pesado'
  },
  {
    id: 'hunter',
    name: 'Hunter',
    classId: 'marksman',
    className: 'Atirador',
    rarity: 'common',
    rarityName: 'Comum',
    spriteIndex: 11,
    weaponId: 'tactical-carbine',
    role: 'Tiroteio tático e combate direto'
  },
  {
    id: 'scarlet',
    name: 'Scarlet',
    classId: 'guerrilla',
    className: 'Guerrilheira',
    rarity: 'common',
    rarityName: 'Comum',
    spriteIndex: 12,
    weaponId: 'heavy-pistol',
    role: 'Ataque rápido e suporte tático'
  }
];

export const WEAPON_CATALOG = [
  { id: 'assault-rifle', name: 'Rifle de Assalto', sourceIndex: 0, facing: 'right', category: 'rifle' },
  { id: 'pistol', name: 'Pistola', sourceIndex: 1, facing: 'right', category: 'pistola', scale: 0.62 },
  { id: 'flamethrower', name: 'Lança-chamas', sourceIndex: 2, facing: 'right', category: 'especial' },
  { id: 'energy-blaster', name: 'Canhão de Energia', sourceIndex: 3, facing: 'right', category: 'energia' },
  { id: 'flare-launcher', name: 'Lançador Incendiário', sourceIndex: 4, facing: 'right', category: 'especial' },
  { id: 'molotov', name: 'Coquetel Molotov', sourceIndex: 4, facing: 'right', category: 'molotov', scale: 0.65 },
  { id: 'compact-rifle', name: 'Rifle Compacto', sourceIndex: 5, facing: 'right', category: 'rifle' },
  { id: 'medical-kit', name: 'Kit Médico', sourceIndex: 6, facing: 'right', category: 'suporte' },
  { id: 'grenade', name: 'Granada', sourceIndex: 7, facing: 'right', category: 'explosivo', scale: 0.68 },
  { id: 'precision-rifle', name: 'Rifle de Precisão', sourceIndex: 8, facing: 'right', category: 'rifle' },
  { id: 'heavy-machine-gun', name: 'Metralhadora Pesada', sourceIndex: 8, facing: 'right', category: 'pesada' },
  { id: 'shotgun', name: 'Escopeta', sourceIndex: 9, facing: 'right', category: 'escopeta' },
  { id: 'rocket-launcher', name: 'Lança-foguetes', sourceIndex: 10, facing: 'right', category: 'pesada' },
  { id: 'tactical-carbine', name: 'Carbina Tática', sourceIndex: 11, facing: 'right', category: 'rifle' },
  { id: 'heavy-pistol', name: 'Pistola Pesada', sourceIndex: 12, facing: 'right', category: 'pistola', scale: 0.58 }
];

// Íris não é combatente nem herói jogável: é o médico do abrigo e hospital
export const MEDIC_STAFF = {
  id: 'iris',
  name: 'Íris',
  title: 'Médica Cirurgiã do Abrigo',
  role: 'Atendimento Médico e Tratamento de Ferimentos',
  spriteIndex: 4,
  weaponId: 'medical-kit',
  avatar: '💉',
  isPlayable: false,
  description: 'Médica cirurgiã da base militar de sobrevivência. Responsável pelo hospital de campanha e recuperação dos sobreviventes feridos.'
};

export function getHeroById(heroId) {
  if (heroId === 'iris') return MEDIC_STAFF;
  return HERO_ROSTER.find(hero => hero.id === heroId) || null;
}

export function getWeaponById(weaponId) {
  return WEAPON_CATALOG.find(weapon => weapon.id === weaponId) || null;
}
