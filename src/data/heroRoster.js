// CRIPTO MYNERS — elenco inicial de heróis e equipamentos
// Catálogo de dados: personagens e armas são entidades separadas.
// As imagens originais serão ligadas pelos spriteIndex quando os assets forem adicionados.

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
    rarityName: 'Lendário',
    spriteIndex: 1,
    weaponId: 'heavy-machine-gun',
    role: 'Absorção de dano e proteção'
  },
  {
    id: 'nox',
    name: 'Nox',
    classId: 'fighter',
    className: 'Combatente',
    rarity: 'rare',
    rarityName: 'Raro',
    spriteIndex: 2,
    weaponId: 'energy-blaster',
    role: 'Combate equilibrado'
  },
  {
    id: 'brasa',
    name: 'Brasa',
    classId: 'assault',
    className: 'Assalto',
    rarity: 'common',
    rarityName: 'Comum',
    spriteIndex: 3,
    weaponId: 'flamethrower',
    role: 'Pressão ofensiva em curta distância'
  },
  {
    id: 'iris',
    name: 'Íris',
    classId: 'medic',
    className: 'Médica',
    rarity: 'epic',
    rarityName: 'Épico',
    spriteIndex: 4,
    weaponId: 'medical-kit',
    role: 'Suporte médico; não concede automação de abrigo por si só'
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
    className: 'Assalto',
    rarity: 'epic',
    rarityName: 'Épico',
    spriteIndex: 7,
    weaponId: 'flare-launcher',
    role: 'Dano explosivo e pressão ofensiva'
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
    role: 'Ataque de precisão'
  },
  {
    id: 'iron',
    name: 'Iron',
    classId: 'heavy',
    className: 'Blindado',
    rarity: 'epic',
    rarityName: 'Épico',
    spriteIndex: 9,
    weaponId: 'grenade',
    role: 'Controle de área e resistência'
  },
  {
    id: 'colosso',
    name: 'Colosso',
    classId: 'juggernaut',
    className: 'Tanque de elite',
    rarity: 'legendary',
    rarityName: 'Lendário',
    spriteIndex: 10,
    weaponId: 'rocket-launcher',
    role: 'Poder de fogo pesado'
  }
];

export const WEAPON_CATALOG = [
  { id: 'assault-rifle', name: 'Rifle de Assalto', sourceIndex: 0, facing: 'right', category: 'rifle' },
  { id: 'pistol', name: 'Pistola', sourceIndex: 1, facing: 'right', category: 'pistola' },
  { id: 'flamethrower', name: 'Lança-chamas', sourceIndex: 2, facing: 'right', category: 'especial' },
  { id: 'energy-blaster', name: 'Canhão de Energia', sourceIndex: 3, facing: 'right', category: 'energia' },
  { id: 'flare-launcher', name: 'Lançador Incendiário', sourceIndex: 4, facing: 'right', category: 'especial' },
  { id: 'compact-rifle', name: 'Rifle Compacto', sourceIndex: 5, facing: 'right', category: 'rifle' },
  { id: 'medical-kit', name: 'Kit Médico', sourceIndex: 6, facing: 'right', category: 'suporte' },
  { id: 'grenade', name: 'Granada', sourceIndex: 7, facing: 'right', category: 'explosivo' },
  { id: 'heavy-machine-gun', name: 'Metralhadora Pesada', sourceIndex: 8, facing: 'right', category: 'pesada' },
  { id: 'shotgun', name: 'Escopeta', sourceIndex: 9, facing: 'right', category: 'escopeta' },
  { id: 'rocket-launcher', name: 'Lança-foguetes', sourceIndex: 10, facing: 'right', category: 'pesada' }
];

export function getHeroById(heroId) {
  return HERO_ROSTER.find(hero => hero.id === heroId) || null;
}

export function getWeaponById(weaponId) {
  return WEAPON_CATALOG.find(weapon => weapon.id === weaponId) || null;
}
