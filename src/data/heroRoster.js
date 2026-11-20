// CRYPTOZOMBIES — elenco oficial de heróis, raridades e equipamentos
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
    color: '#22c55e', // Borda Verde
    border: '#22c55e',
    hasBorderColor: true,
    glowColor: 'rgba(34, 197, 94, 0.45)',
    auraColor: 'rgba(34, 197, 94, 0.55)',
    badgeBg: 'rgba(34, 197, 94, 0.2)',
    badgeText: '#4ade80',
    badgeBorder: '#22c55e'
  },
  super_rare: {
    id: 'super_rare',
    name: 'Super Raro',
    color: '#38bdf8', // Borda Azul
    border: '#38bdf8',
    hasBorderColor: true,
    glowColor: 'rgba(56, 189, 248, 0.50)',
    auraColor: 'rgba(56, 189, 248, 0.60)',
    badgeBg: 'rgba(56, 189, 248, 0.22)',
    badgeText: '#38bdf8',
    badgeBorder: '#38bdf8'
  },
  common: {
    id: 'common',
    name: 'Comum',
    color: '#475569', // Sem cor de borda (borda neutra de ardósia escuro)
    border: '#334155',
    hasBorderColor: false,
    glowColor: 'transparent',
    auraColor: 'transparent',
    badgeBg: 'rgba(100, 116, 139, 0.18)',
    badgeText: '#94a3b8',
    badgeBorder: '#475569'
  }
};

export function getRarityConfig(rarity) {
  const raw = (rarity || 'common').toLowerCase().replace(/[\s-]/g, '_');
  if (raw === 'super_raro' || raw === 'superrare' || raw === 'sr') return RARITY_CONFIG.super_rare;
  return RARITY_CONFIG[raw] || RARITY_CONFIG.common;
}

export const HERO_ROSTER = [
  {
    id: 'verdant',
    name: 'Verdant',
    classId: 'explorer',
    className: 'Explorador',
    rarity: 'super_rare',
    rarityName: 'Super Raro',
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
    rarity: 'super_rare',
    rarityName: 'Super Raro',
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
  { 
    id: 'assault-rifle', 
    name: 'Rifle de Assalto Tático', 
    sourceIndex: 0, 
    facing: 'right', 
    category: 'Rifle Automático', 
    damage: '+3 Poder', 
    critBonus: '+8%', 
    cadence: 'Muito Rápida', 
    range: 'Médio / Longo',
    hero: 'Verdant',
    description: 'Arma padrão de forças especiais. Cadência sustentada e precisão balanceada para varredura de hordas.' 
  },
  { 
    id: 'pistol', 
    name: 'Pistola Tática 9mm', 
    sourceIndex: 1, 
    facing: 'right', 
    category: 'Pistola Semiautomática', 
    scale: 0.62,
    damage: '+2 Poder', 
    critBonus: '+12%', 
    cadence: 'Rápida', 
    range: 'Curto / Médio',
    hero: 'Sobrevivente',
    description: 'Leve e de saque imediato. Ideal para disparos cirúrgicos rápidos em curta distância.' 
  },
  { 
    id: 'flamethrower', 
    name: 'Lança-Chamas Militar', 
    sourceIndex: 2, 
    facing: 'right', 
    category: 'Arma Incendiária', 
    damage: '+6 Poder', 
    critBonus: '+15%', 
    cadence: 'Contínua', 
    range: 'Curto (Cone de Fogo)',
    hero: 'Fênix',
    description: 'Jato contínuo de chamas que queima e incinera múltiplos alvos simultaneamente no campo.' 
  },
  { 
    id: 'energy-blaster', 
    name: 'Canhão de Energia Plasma', 
    sourceIndex: 3, 
    facing: 'right', 
    category: 'Armamento de Energia', 
    damage: '+5 Poder', 
    critBonus: '+10%', 
    cadence: 'Média', 
    range: 'Longo',
    hero: 'Nox',
    description: 'Dispara pulsos ionizados de alta densidade que perfuram a couraça de infectados e estruturas.' 
  },
  { 
    id: 'flare-launcher', 
    name: 'Lançador Incendiário de Sinal', 
    sourceIndex: 4, 
    facing: 'right', 
    category: 'Lançador de Artilharia', 
    damage: '+4 Poder', 
    critBonus: '+14%', 
    cadence: 'Média', 
    range: 'Longo',
    hero: 'Assalto',
    description: 'Projéteis incendiários de fósforo branco que iluminam o terreno e queimam alvos.' 
  },
  { 
    id: 'molotov', 
    name: 'Coquetel Molotov Incendiário', 
    sourceIndex: 4, 
    facing: 'right', 
    category: 'Explosivo / Incendiário', 
    scale: 0.65,
    damage: '+6 Poder', 
    critBonus: '+20%', 
    cadence: 'Lenta', 
    range: 'Médio (Área de Chamas)',
    hero: 'Brasa',
    description: 'Garrafa artesanal de combustível. Na explosão, gera uma poça flamejante contínua no chão.' 
  },
  { 
    id: 'compact-rifle', 
    name: 'Rifle Compacto Bullpup', 
    sourceIndex: 5, 
    facing: 'right', 
    category: 'Rifle Tático', 
    damage: '+4 Poder', 
    critBonus: '+10%', 
    cadence: 'Rápida', 
    range: 'Médio',
    hero: 'Polar',
    description: 'Design compacto para manobras ágeis em corredores urbanos com alto controle de recuo.' 
  },
  { 
    id: 'medical-kit', 
    name: 'Kit Médico de Biorecuperação', 
    sourceIndex: 6, 
    facing: 'right', 
    category: 'Equipamento de Suporte', 
    damage: '+1 Poder', 
    critBonus: '+5% Cura', 
    cadence: 'Estável', 
    range: 'Suporte de Campo',
    hero: 'Dra. Íris',
    description: 'Maleta cirúrgica e desfibrilador de campo para recuperação de sobreviventes feridos.' 
  },
  { 
    id: 'grenade', 
    name: 'Granada de Fragmentação', 
    sourceIndex: 7, 
    facing: 'right', 
    category: 'Explosivo Pesado', 
    scale: 0.68,
    damage: '+7 Poder', 
    critBonus: '+25%', 
    cadence: 'Lenta', 
    range: 'Médio (Impacto em Área)',
    hero: 'Tropa de Choque',
    description: 'Estilhaços balísticos e onda de choque devastadora para aniquilar aglomerados de infectados.' 
  },
  { 
    id: 'precision-rifle', 
    name: 'Rifle de Precisão Sniper .50', 
    sourceIndex: 8, 
    facing: 'right', 
    category: 'Rifle de Precisão', 
    damage: '+7 Poder', 
    critBonus: '+28%', 
    cadence: 'Lenta', 
    range: 'Extremo (Tiro Certeiro)',
    hero: 'Franco-Atirador',
    description: 'Mira telescópica de alto alcance. Elimina alvos críticos com disparos de altíssimo impacto.' 
  },
  { 
    id: 'heavy-machine-gun', 
    name: 'Metralhadora Pesada Gatling', 
    sourceIndex: 8, 
    facing: 'right', 
    category: 'Metralhadora Pesada', 
    damage: '+8 Poder', 
    critBonus: '+14%', 
    cadence: 'Extrema', 
    range: 'Médio / Longo',
    hero: 'Granito',
    description: 'Arma de supressão máxima. Barragem ininterrupta de projéteis de grosso calibre.' 
  },
  { 
    id: 'shotgun', 
    name: 'Escopeta Tática Calibre 12', 
    sourceIndex: 9, 
    facing: 'right', 
    category: 'Escopeta Pesada', 
    damage: '+5 Poder', 
    critBonus: '+18%', 
    cadence: 'Média', 
    range: 'Curto (Dispersão de Chumbo)',
    hero: 'Múmia',
    description: 'Dispara múltiplos balotes de chumbo em leque. Devastadora em encontros cara a cara.' 
  },
  { 
    id: 'rocket-launcher', 
    name: 'Lança-Foguetes RPG Blindado', 
    sourceIndex: 10, 
    facing: 'right', 
    category: 'Artilharia Pesada', 
    damage: '+10 Poder', 
    critBonus: '+20%', 
    cadence: 'Lenta', 
    range: 'Longo (Explosão Titânica)',
    hero: 'Artilheiro',
    description: 'Projéteis autopropulsados com ogiva explosiva para abater chefões e mutantes colossais.' 
  },
  { 
    id: 'tactical-carbine', 
    name: 'Carbina Tática de Reconhecimento', 
    sourceIndex: 11, 
    facing: 'right', 
    category: 'Carbina Semiautomática', 
    damage: '+5 Poder', 
    critBonus: '+16%', 
    cadence: 'Rápida', 
    range: 'Médio / Longo',
    hero: 'Hunter',
    description: 'Combina leveza de empunhadura e disparos duplos de alta precisão contra mutantes rápidos.' 
  },
  { 
    id: 'heavy-pistol', 
    name: 'Revólver Pesado Magnum .44', 
    sourceIndex: 12, 
    facing: 'right', 
    category: 'Arma Secundária Pesada', 
    scale: 0.58,
    damage: '+4 Poder', 
    critBonus: '+22%', 
    cadence: 'Média', 
    range: 'Curto / Médio',
    hero: 'Scarlet',
    description: 'Poder de parada impressionante. Cada tiro causa impacto contundente com alta chance crítica.' 
  }
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
