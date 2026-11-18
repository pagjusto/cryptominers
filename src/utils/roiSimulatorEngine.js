// CRIPTO MYNERS — SIMULADOR DE ROI (PROJEÇÃO, NÃO GARANTIA)
const TIERS = ['common', 'rare', 'superRare', 'epic', 'legendary', 'superLegendary'];
const round = (value, digits = 2) => Number(value.toFixed(digits));

export function calculateRoiScenario({ chestCategory = 'miner', chestQuantity = 1, houseId = 'basic', scenario = 'expected', config }) {
  const chest = config.chests[chestCategory] || config.chests.miner;
  const house = config.houses[houseId] || config.houses.basic;
  const probs = chest.probabilities || chest.normalProbabilities || {};
  const totalHeroes = chest.heroesCount * chestQuantity;
  const maxActive = Math.min(config.maxActiveMiners || 15, totalHeroes);
  const reserves = Math.max(0, totalHeroes - maxActive);
  const rarities = Object.fromEntries(TIERS.map(tier => [tier, totalHeroes * ((Number(probs[tier]) || 0) / 100)]));
  const probabilityTotal = TIERS.reduce((sum, tier) => sum + (Number(probs[tier]) || 0), 0);

  let baseMncPerDay = 0;
  let weightedWorkHours = 0;
  let weightedRecoveryHours = 0;
  for (const tier of TIERS) {
    const count = rarities[tier];
    const attr = config.rarityAttributes[tier];
    if (!count || !attr) continue;
    const daily = Number(attr.mncPerDay) || ((Number(attr.coinsPerHourMin || 0) + Number(attr.coinsPerHourMax || 0)) / 2) * 24;
    baseMncPerDay += count * daily;
    const maxHp = Number(attr.maxHp) || Number(attr.maxEnergy) || 100;
    const workHours = (maxHp * 0.95) / 3600; // 1 HP/s; sai do combate ao atingir 5% de HP
    const recoveryHours = Number(attr.baseRecoveryMinutes || 0) / 60 / Math.max(0.01, Number(house.recoverySpeedMultiplier) || 1);
    weightedWorkHours += count * workHours;
    weightedRecoveryHours += count * recoveryHours;
  }

  const averageWorkHours = totalHeroes ? weightedWorkHours / totalHeroes : 0;
  const averageRecoveryHours = totalHeroes ? weightedRecoveryHours / totalHeroes : 0;
  const beds = Math.max(0, Number(house.slots) || 0);
  // Estimativa conservadora de fila FIFO: grupos de sobreviventes compartilham as camas disponíveis.
  const recoveryWaves = beds > 0 ? Math.max(1, Math.ceil(totalHeroes / beds)) : 1;
  const effectiveRecoveryHours = beds > 0 ? averageRecoveryHours * recoveryWaves : averageRecoveryHours * 2;
  const cycleUptime = (averageWorkHours + effectiveRecoveryHours) > 0 ? averageWorkHours / (averageWorkHours + effectiveRecoveryHours) : 0;
  const activeShare = totalHeroes > 0 ? maxActive / totalHeroes : 0;
  const sessionAvailability = Number(config.roiSessionAvailabilityPct ?? 45) / 100;
  const effectiveUptime = Math.max(0, Math.min(1, cycleUptime * activeShare));
  const effectiveMncPerDay = baseMncPerDay * effectiveUptime * sessionAvailability;
  const rate = Number(config.minerCoinUsdtRate) || 0.01;
  const chestCost = Number(chest.costUsdt || 0) * chestQuantity;
  const houseCostMiner = Number(house.costMiner || 0);
  const houseCostUsdt = Number(house.costUsdt || 0);
  const houseCost = houseCostUsdt + houseCostMiner * rate;
  const totalInvestment = chestCost + houseCost;
  const dailyUsd = effectiveMncPerDay * rate;
  const paybackDays = dailyUsd > 0 ? totalInvestment / dailyUsd : null;
  const makeReturn = days => dailyUsd * days;

  return {
    scenario, chestCategory, chestQuantity, houseId, chestCost, houseCost, houseCostMiner,
    houseFragments: Number(house.constructionFragments || 0), totalInvestment,
    totalHeroes, rarities: Object.fromEntries(TIERS.map(tier => [tier, round(rarities[tier], 2)])),
    probabilityTotalPct: round(probabilityTotal), probabilityWarning: Math.abs(probabilityTotal - 100) > 0.001,
    maxActive, reserves, houseSlots: beds, recoveryMultiplier: Number(house.recoverySpeedMultiplier) || 1,
    avgWorkHours: round(averageWorkHours, 2), avgRestHours: round(averageRecoveryHours, 2),
    effectiveUptimePct: round(effectiveUptime * 100, 1), sessionAvailabilityPct: round(sessionAvailability * 100, 1),
    effectiveCoinsPerHour: round(effectiveMncPerDay / 24, 4), effectiveCoinsPerDay: round(effectiveMncPerDay, 2),
    effectiveCoinsPerMonth: round(effectiveMncPerDay * 30, 2), dailyUsd: round(dailyUsd, 2), monthlyUsd: round(dailyUsd * 30, 2),
    roiDailyPct: totalInvestment > 0 ? round(dailyUsd / totalInvestment * 100, 2) : 0,
    paybackDays: paybackDays === null ? null : Math.ceil(paybackDays),
    projectedReturn30d: round(makeReturn(30), 2), projectedReturn60d: round(makeReturn(60), 2),
    projectedReturn90d: round(makeReturn(90), 2), projectedReturn180d: round(makeReturn(180), 2)
  };
}
