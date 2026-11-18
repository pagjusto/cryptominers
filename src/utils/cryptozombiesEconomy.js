// CryptoZombies — economia de mineração e estimativa de ROI.
// Valores de planejamento: não representam promessa de rendimento ou cotação garantida.

export const MNC_USDT_REFERENCE = 0.01;
export const ROI_TARGET_DAYS = 90;
export const MEDIAN_TEAM_SIZE = 15;

// Distribuição aprovada para abertura de baús; soma 100%.
export const SURVIVOR_RARITY_ODDS = Object.freeze([
  { id: 'common', name: 'Comum', chancePct: 81.26 },
  { id: 'rare', name: 'Raro', chancePct: 10.16 },
  { id: 'superRare', name: 'Super Raro', chancePct: 5.08 },
  { id: 'epic', name: 'Épico', chancePct: 2.00 },
  { id: 'legendary', name: 'Lendário', chancePct: 1.00 },
  { id: 'superLegendary', name: 'Super Lendário', chancePct: 0.50 }
]);

// Base diária aprovada: 20,88 MNC para Comum; demais taxas seguem os multiplicadores aprovados.
export const SURVIVOR_MNC_PER_DAY = Object.freeze({
  common: 20.88,
  rare: 31.32,
  superRare: 36.54,
  epic: 41.76,
  legendary: 62.64,
  superLegendary: 83.52
});

export const SURVIVOR_MNC_PER_SECOND = Object.freeze(
  Object.fromEntries(
    Object.entries(SURVIVOR_MNC_PER_DAY).map(([rarity, daily]) => [rarity, daily / 86400])
  )
);

// Composição usada como cenário de referência aprovado anteriormente.
// Não é uma garantia de que todo jogador receberá essa composição ao abrir 15 baús.
export const MEDIAN_TEAM_COMPOSITION = Object.freeze({
  common: 6,
  rare: 4,
  superRare: 0,
  epic: 4,
  legendary: 1,
  superLegendary: 0
});

export function calculateSurvivorDailyProduction(survivors = []) {
  return survivors.reduce((total, survivor) => {
    const rarity = survivor?.rarity || 'common';
    return total + (SURVIVOR_MNC_PER_DAY[rarity] || 0);
  }, 0);
}

export function calculateCompositionDailyProduction(composition = MEDIAN_TEAM_COMPOSITION) {
  return Object.entries(composition).reduce((total, [rarity, count]) => {
    if (!Number.isInteger(count) || count < 0) {
      throw new RangeError(`Quantidade inválida para raridade ${rarity}`);
    }
    return total + (SURVIVOR_MNC_PER_DAY[rarity] || 0) * count;
  }, 0);
}

export function drawSurvivorRarity(random = Math.random) {
  const roll = random() * 100;
  let cumulative = 0;
  for (const tier of SURVIVOR_RARITY_ODDS) {
    cumulative += tier.chancePct;
    if (roll < cumulative) return tier.id;
  }
  return SURVIVOR_RARITY_ODDS[SURVIVOR_RARITY_ODDS.length - 1].id;
}

export function drawTeamRarities(count = MEDIAN_TEAM_SIZE, random = Math.random) {
  if (!Number.isInteger(count) || count < 0) throw new RangeError('Quantidade de baús inválida');
  return Array.from({ length: count }, () => drawSurvivorRarity(random));
}

export function estimateRoi({
  chestPackCostUsdt,
  doctorCostUsdt = 13.80,
  dailyProductionMnc,
  days = ROI_TARGET_DAYS,
  mncUsdtReference = MNC_USDT_REFERENCE
}) {
  for (const [name, value] of Object.entries({ chestPackCostUsdt, doctorCostUsdt, dailyProductionMnc, days, mncUsdtReference })) {
    if (!Number.isFinite(value) || value < 0) throw new RangeError(`Valor inválido: ${name}`);
  }
  const totalCostUsdt = chestPackCostUsdt + doctorCostUsdt;
  const grossMnc = dailyProductionMnc * days;
  const grossValueUsdt = grossMnc * mncUsdtReference;
  const roiPct = totalCostUsdt > 0 ? (grossValueUsdt / totalCostUsdt) * 100 : null;
  const estimatedPaybackDays = dailyProductionMnc * mncUsdtReference > 0
    ? totalCostUsdt / (dailyProductionMnc * mncUsdtReference)
    : null;

  return {
    totalCostUsdt,
    grossMnc,
    grossValueUsdt,
    roiPct,
    estimatedPaybackDays,
    targetDays: days,
    isApproximation: true,
    guaranteed: false
  };
}

export function getMedianTeamScenario({
  chestPackCostUsdt,
  doctorCostUsdt = 13.80,
  days = ROI_TARGET_DAYS
}) {
  const dailyProductionMnc = calculateCompositionDailyProduction();
  return {
    composition: MEDIAN_TEAM_COMPOSITION,
    teamSize: MEDIAN_TEAM_SIZE,
    dailyProductionMnc,
    roi: estimateRoi({ chestPackCostUsdt, doctorCostUsdt, dailyProductionMnc, days })
  };
}
