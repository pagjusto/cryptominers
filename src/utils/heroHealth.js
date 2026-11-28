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
  const key = String(rarity || 'common').toLowerCase().replace(/[\s-]/g, '_');
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
  const previousMax = Number(hero?.maxHealth) > 0 ? Number(hero.maxHealth) : (typeof hero?.currentHealth === 'number' ? 100 : maxHealth);
  const hasCurrent = typeof hero?.currentHealth === 'number' && Number.isFinite(hero.currentHealth);
  const currentHealth = hasCurrent
    ? Math.max(0, Math.min(maxHealth, (hero.currentHealth / previousMax) * maxHealth))
    : maxHealth;
  if (hero?.maxHealth === maxHealth && hero?.currentHealth === currentHealth) return hero;
  return { ...hero, maxHealth, currentHealth };
}

/**
 * Simula a recuperação offline dos heróis internados no ambulatório ('house')
 * e na fila de espera ('waiting_house') enquanto o jogo esteve fechado ou fora da tela de jogo.
 */
export function applyOfflineHeroRecovery(
  miners,
  elapsedSeconds,
  { houseSlots = 5, recoverySpeedPct = 100 } = {}
) {
  if (!Array.isArray(miners) || miners.length === 0) return miners;
  const elapsed = Number(elapsedSeconds);
  if (!Number.isFinite(elapsed) || elapsed <= 1) return miners;

  const healRatePerSec = (142.5 / 3600) * ((Number(recoverySpeedPct) || 100) / 100);
  if (healRatePerSec <= 0) return miners;

  const list = miners.map((m) => ({ ...m }));
  let remaining = Math.min(elapsed, 7 * 24 * 3600);
  let changed = false;

  // Limite de iterações de segurança (máximo = total de heróis + folga)
  for (let iter = 0; iter < list.length + 10 && remaining > 0.01; iter++) {
    // 1. Preenche leitos livres com quem aguarda na fila (ordem FIFO)
    let inHouse = list.filter((m) => m.status === 'house').length;
    if (inHouse < houseSlots) {
      const waiting = list
        .filter((m) => m.status === 'waiting_house')
        .sort((a, b) => (Number(a.injuryQueueSequence) || 0) - (Number(b.injuryQueueSequence) || 0));
      for (const nextHero of waiting) {
        if (inHouse >= houseSlots) break;
        nextHero.status = 'house';
        nextHero.injuryQueueSequence = null;
        nextHero.injuredAwaitingRescue = false;
        inHouse++;
        changed = true;
      }
    }

    // 2. Identifica heróis atualmente em tratamento no ambulatório
    const healing = list.filter((m) => {
      if (m.status !== 'house') return false;
      const maxHp = Number(m.maxHealth) > 0 ? Number(m.maxHealth) : getHeroBaseHP(m.rarity);
      const curHp = typeof m.currentHealth === 'number' && Number.isFinite(m.currentHealth)
        ? m.currentHealth
        : maxHp * 0.05;
      return curHp < maxHp;
    });

    if (healing.length === 0) break;

    // 3. Avança até o próximo herói atingir 100% de PV (ou até esgotar o tempo offline)
    let minTimeToFull = Infinity;
    for (const m of healing) {
      const maxHp = Number(m.maxHealth) > 0 ? Number(m.maxHealth) : getHeroBaseHP(m.rarity);
      const curHp = typeof m.currentHealth === 'number' && Number.isFinite(m.currentHealth)
        ? m.currentHealth
        : maxHp * 0.05;
      const t = (maxHp - curHp) / healRatePerSec;
      if (t < minTimeToFull) minTimeToFull = t;
    }

    const step = Math.min(remaining, Math.max(0.01, minTimeToFull));
    for (const m of healing) {
      const maxHp = Number(m.maxHealth) > 0 ? Number(m.maxHealth) : getHeroBaseHP(m.rarity);
      const curHp = typeof m.currentHealth === 'number' && Number.isFinite(m.currentHealth)
        ? m.currentHealth
        : maxHp * 0.05;
      const nextHp = Math.min(maxHp, curHp + healRatePerSec * step);
      m.currentHealth = nextHp;
      changed = true;

      if (nextHp >= maxHp - 0.001) {
        m.currentHealth = maxHp;
        m.status = 'reserve';
        m.injuredAwaitingRescue = false;
      }
    }

    remaining -= step;
  }

  return changed ? list : miners;
}
