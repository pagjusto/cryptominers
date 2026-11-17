// CRIPTO MYNERS — MOTOR MATEMÁTICO DO SIMULADOR DE ROI
// Modela a produção efetiva considerando limite de 15 vagas, ciclos de trabalho, descanso na casa e revezamento automático.

export function calculateRoiScenario({
  chestCategory = 'miner',
  chestQuantity = 1,
  houseId = 'basic',
  scenario = 'expected', // 'conservative' | 'expected' | 'optimistic'
  config
}) {
  const chest = config.chests[chestCategory] || config.chests.miner;
  const house = config.houses[houseId] || config.houses.none;
  const probs = chest.probabilities;
  const rate = config.minerCoinUsdtRate || 1.0;

  // 1. Custos de Investimento
  const chestCost = chest.costUsdt * chestQuantity;
  const houseCost = house.costUsdt;
  const totalInvestment = chestCost + houseCost;
  const totalHeroes = chest.heroesCount * chestQuantity;

  // 2. Distribuição das Raridades por Cenário
  let rarities = { common: 0, rare: 0, epic: 0, legendary: 0 };

  if (scenario === 'conservative') {
    // Cenário Conservador: Mais comuns, menos épicos/lendários que a média
    const cPct = Math.min(100, probs.common + 15);
    const rPct = Math.max(0, probs.rare - 5);
    const ePct = Math.max(0, probs.epic - 7);
    const lPct = Math.max(0, 100 - cPct - rPct - ePct);

    rarities.common = Math.round(totalHeroes * (cPct / 100));
    rarities.rare = Math.round(totalHeroes * (rPct / 100));
    rarities.epic = Math.round(totalHeroes * (ePct / 100));
    rarities.legendary = Math.max(0, totalHeroes - rarities.common - rarities.rare - rarities.epic);
  } else if (scenario === 'optimistic') {
    // Cenário Otimista: Menos comuns, mais raros/épicos/lendários que a média
    const lPct = Math.min(100, probs.legendary + 8);
    const ePct = Math.min(100, probs.epic + 12);
    const rPct = Math.min(100, probs.rare + 5);
    const cPct = Math.max(0, 100 - lPct - ePct - rPct);

    rarities.legendary = Math.round(totalHeroes * (lPct / 100));
    rarities.epic = Math.round(totalHeroes * (ePct / 100));
    rarities.rare = Math.round(totalHeroes * (rPct / 100));
    rarities.common = Math.max(0, totalHeroes - rarities.legendary - rarities.epic - rarities.rare);
  } else {
    // Cenário Esperado (Média Ponderada Exata das Probabilidades)
    rarities.common = parseFloat((totalHeroes * (probs.common / 100)).toFixed(1));
    rarities.rare = parseFloat((totalHeroes * (probs.rare / 100)).toFixed(1));
    rarities.epic = parseFloat((totalHeroes * (probs.epic / 100)).toFixed(1));
    rarities.legendary = parseFloat((totalHeroes * (probs.legendary / 100)).toFixed(1));
  }

  // 3. Produção Base e Tempo de Trabalho / Descanso por Raridade
  let totalTeamBasePerHour = 0;
  let weightedMaxEnergy = 0;
  let weightedDrainPerMin = 0;
  let weightedRecoveryMins = 0;

  const tiers = ['common', 'rare', 'epic', 'legendary'];
  tiers.forEach(tier => {
    const count = rarities[tier] || 0;
    const attr = config.rarityAttributes[tier];

    let prod = 0;
    let power = 0;
    if (scenario === 'conservative') {
      prod = attr.coinsPerHourMin;
      power = attr.basePowerMin;
    } else if (scenario === 'optimistic') {
      prod = attr.coinsPerHourMax;
      power = attr.basePowerMax;
    } else {
      prod = (attr.coinsPerHourMin + attr.coinsPerHourMax) / 2;
      power = (attr.basePowerMin + attr.basePowerMax) / 2;
    }

    totalTeamBasePerHour += count * prod;
    weightedMaxEnergy += count * attr.maxEnergy;
    weightedDrainPerMin += count * attr.energyDrainPerMinute;
    weightedRecoveryMins += count * attr.baseRecoveryMinutes;
  });

  const avgMaxEnergy = totalHeroes > 0 ? weightedMaxEnergy / totalHeroes : 100;
  const avgDrainPerMin = totalHeroes > 0 ? weightedDrainPerMin / totalHeroes : 1.0;
  const avgBaseRecMins = totalHeroes > 0 ? weightedRecoveryMins / totalHeroes : 240;

  // Tempo médio de trabalho até esgotar energia (minutos e horas)
  const avgWorkMinutes = avgMaxEnergy / avgDrainPerMin; // ex: 100 a 250 min
  const avgWorkHours = avgWorkMinutes / 60;

  // Tempo médio de recuperação na casa selecionada
  const recoveryMultiplier = house.recoverySpeedMultiplier || 0.5;
  const avgRestMinutes = avgBaseRecMins / recoveryMultiplier; // ex: 240 / 1.5 = 160 min
  const avgRestHours = avgRestMinutes / 60;

  // 4. Dinâmica da Mina: Limite de 15 Vagas e Revezamento Automático
  const maxActive = Math.min(15, Math.round(totalHeroes));
  const reserves = Math.max(0, Math.round(totalHeroes) - maxActive);
  const houseSlots = house.slots || 0;

  // Fator de Ocupação da Mina (Uptime Efetivo das 15 vagas)
  let effectiveUptime = 0;

  if (totalHeroes <= 15) {
    // Sem reservas suficientes para revezamento contínuo:
    // A equipe trabalha -> esgota energia -> vai para a casa -> descansa -> volta.
    // Uptime das vagas = Tempo Trabalho / (Tempo Trabalho + Tempo Descanso)
    // Se a casa tiver menos camas que heróis, os que ficam esperando no chão demoram mais
    const bedsAvailable = Math.min(houseSlots, totalHeroes);
    const sleepingOnGround = Math.max(0, totalHeroes - bedsAvailable);
    const effectiveRestHours = (bedsAvailable * avgRestHours + sleepingOnGround * (avgBaseRecMins / (0.5 * 60))) / totalHeroes;

    effectiveUptime = avgWorkHours / (avgWorkHours + effectiveRestHours);
  } else {
    // Com reservas para revezamento automático:
    // Enquanto 15 mineram, os outros descansam na casa.
    // Proporção de revezamento:
    const activeHeroes = 15;
    const restingHeroes = totalHeroes - 15;
    const restingWithBed = Math.min(houseSlots, restingHeroes);
    const restingWaiting = Math.max(0, restingHeroes - restingWithBed);

    // Razão entre reposição de energia vs consumo
    const teamRecoveryRatio = (restingWithBed * (1 / avgRestHours) + restingWaiting * (1 / (avgBaseRecMins / 30))) / (activeHeroes * (1 / avgWorkHours));
    
    // Uptime das 15 vagas aumenta com mais heróis reservas e casas melhores
    effectiveUptime = Math.min(0.98, 0.45 + teamRecoveryRatio * 0.45);
  }

  // 5. Produção Efetiva Real
  // Considera apenas a capacidade das 15 vagas ativas multiplicada pelo uptime real
  const activeHeroesRatio = Math.min(1.0, 15 / Math.max(1, totalHeroes));
  const activeBasePerHour = totalTeamBasePerHour * activeHeroesRatio;
  
  const effectiveCoinsPerHour = activeBasePerHour * effectiveUptime;
  // Regra Oficial 9.0: A projeção de ROI deve considerar 12 horas diárias como cenário médio de referência (não 24 horas obrigatórias)
  const referenceHoursPerDay = 12;
  const effectiveCoinsPerDay = effectiveCoinsPerHour * referenceHoursPerDay;
  const effectiveCoinsPerMonth = effectiveCoinsPerDay * 30;

  const dailyUsd = effectiveCoinsPerDay * rate;
  const monthlyUsd = effectiveCoinsPerMonth * rate;

  // 6. Métricas Financeiras Oficiais da Especificação
  // ROI diário = (Produção diária em valor monetário / Investimento total) × 100
  const roiDailyPct = totalInvestment > 0 ? (dailyUsd / totalInvestment) * 100 : 0;

  // Payback = Investimento total / Retorno líquido diário em valor monetário
  const paybackDays = dailyUsd > 0 ? totalInvestment / dailyUsd : 999;

  // Retornos Acumulados Projetados
  const projectedReturn30d = dailyUsd * 30;
  const projectedReturn60d = dailyUsd * 60;
  const projectedReturn90d = dailyUsd * 90;
  const projectedReturn180d = dailyUsd * 180;

  return {
    scenario,
    chestCategory,
    chestQuantity,
    houseId,
    chestCost,
    houseCost,
    totalInvestment,
    totalHeroes: Math.round(totalHeroes),
    rarities,
    maxActive,
    reserves,
    houseSlots,
    recoveryMultiplier,
    avgWorkHours: parseFloat(avgWorkHours.toFixed(1)),
    avgRestHours: parseFloat(avgRestHours.toFixed(1)),
    effectiveUptimePct: Math.round(effectiveUptime * 100),
    effectiveCoinsPerHour: parseFloat(effectiveCoinsPerHour.toFixed(3)),
    effectiveCoinsPerDay: parseFloat(effectiveCoinsPerDay.toFixed(2)),
    effectiveCoinsPerMonth: parseFloat(effectiveCoinsPerMonth.toFixed(1)),
    dailyUsd: parseFloat(dailyUsd.toFixed(2)),
    monthlyUsd: parseFloat(monthlyUsd.toFixed(2)),
    roiDailyPct: parseFloat(roiDailyPct.toFixed(2)),
    paybackDays: Math.round(paybackDays),
    projectedReturn30d: parseFloat(projectedReturn30d.toFixed(2)),
    projectedReturn60d: parseFloat(projectedReturn60d.toFixed(2)),
    projectedReturn90d: parseFloat(projectedReturn90d.toFixed(2)),
    projectedReturn180d: parseFloat(projectedReturn180d.toFixed(2))
  };
}
