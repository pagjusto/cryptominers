// HP base único dos heróis por raridade (sem distinção de classe Resistente/Ágil).
// O HP máximo é aplicado ao herói e o dano atual é convertido preservando sua porcentagem.
const HERO_BASE_HP = {
  common: 1000,
  rare: 1200,
  super_rare: 1400,
  epic: 1600,
  legendary: 1800,
  super_legend: 2000
};

export function getHeroBaseHP(rarity) {
  const key = String(rarity || 'common').toLowerCase().replace(/[\\s-]/g, '_');
  const aliases = {
    superrare: 'super_rare',
    super_raro: 'super_rare',
    superlegend: 'super_legend',
    super_lendario: 'super_legend',
    super_legendary: 'super_legend'
  };
  return HERO_BASE_HP[aliases[key] || key] || HERO_BASE_HP.common;
}

export function applyHeroBaseHP(hero) {
  const maxHealth = getHeroBaseHP(hero?.rarity);
  const previousMax = Number(hero?.maxHealth) > 0 ? Number(hero.maxHealth) : maxHealth;
  const hasCurrent = typeof hero?.currentHealth === 'number' && Number.isFinite(hero.currentHealth);
  const currentHealth = hasCurrent
    ? Math.max(0, Math.min(maxHealth, (hero.currentHealth / previousMax) * maxHealth))
    : maxHealth;
  if (hero?.maxHealth === maxHealth && hero?.currentHealth === currentHealth) return hero;
  return { ...hero, maxHealth, currentHealth };
}
