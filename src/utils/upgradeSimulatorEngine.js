// CRYPTOZOMBIES — MOTOR MATEMÁTICO DO SIMULADOR DE UPGRADES
// Simula a operação real da conta do jogador (heróis reais, casa atual, ciclos de mineração, descanso e 15 vagas)
// e projeta o impacto sistêmico de melhorias de Casas, Energia e Nível dos Heróis.

export function calculateRealAccountStats(miners = [], currentHouse = {}, config = {}) {
  const rate = config?.minerCoinUsdtRate || 1.0;
  const houseSlots = currentHouse?.slots || 5;
  const houseMultiplier = currentHouse?.recoverySpeedMultiplier || 1.0;

  const totalMiners = miners.length;
  const activeMiners = miners.filter(m => m.status === 'work');
  const inHouseMiners = miners.filter(m => m.status === 'house');
  const waitingMiners = miners.filter(m => m.status === 'waiting_house');
  const reserveMiners = miners.filter(m => m.status === 'reserve' || m.status === 'sleep');

  // Produção instantânea por hora dos mineradores que estão trabalhando agora
  let currentHourlyProduction = 0;
  activeMiners.forEach(m => {
    const baseHour = m.coinsPerHour || ((m.power || 2) * 0.05 * (m.speed || 1));
    currentHourlyProduction += baseHour;
  });

  // Cálculo do ciclo de trabalho e descanso real da equipe
  let weightedWorkMins = 0;
  let weightedRestMins = 0;
  let totalTeamBasePerHour = 0;
  let totalEfficiencyScore = 0;

  miners.forEach(m => {
    const power = m.power || 2;
    const speed = m.speed || 1;
    const maxEnergy = m.maxStamina || 100;
    const drainPerMin = m.energyDrainRate || 1.0;
    const hourlyCoin = m.coinsPerHour || (power * 0.05 * speed);

    const workMins = maxEnergy / drainPerMin;
    const baseRecMins = 240; // 4 horas padrão
    const restMins = baseRecMins / houseMultiplier;

    weightedWorkMins += workMins;
    weightedRestMins += restMins;
    totalTeamBasePerHour += hourlyCoin;

    const eff = (power * 1.5 + speed * 10 + hourlyCoin * 50) * ((m.currentStamina || maxEnergy) / maxEnergy);
    totalEfficiencyScore += eff;
  });

  const avgWorkMins = totalMiners > 0 ? weightedWorkMins / totalMiners : 100;
  const avgRestMins = totalMiners > 0 ? weightedRestMins / totalMiners : 240;

  // Gargalo de leitos na casa
  const bedDeficit = Math.max(0, totalMiners - 15 - houseSlots);
  const avgWaitMins = bedDeficit > 0 ? (bedDeficit / Math.max(1, houseSlots)) * (avgRestMins * 0.5) : 0;
  const totalCycleMins = avgWorkMins + avgRestMins + avgWaitMins;

  // Duty cycle individual do herói
  const individualDutyCycle = totalCycleMins > 0 ? avgWorkMins / totalCycleMins : 0.3;

  // Uptime dos 15 slots da mina
  const totalTeamCapacitySlots = totalMiners * individualDutyCycle;
  const effectiveWorkingSlots = Math.min(15, totalTeamCapacitySlots);
  const mineUptime = totalMiners > 0 ? Math.min(1.0, totalTeamCapacitySlots / Math.min(15, totalMiners)) : 0;

  // Produção diária e mensal da operação real
  const avgHourlyPerMiner = totalMiners > 0 ? totalTeamBasePerHour / totalMiners : 0.1;
  const effectiveDailyCoins = effectiveWorkingSlots * avgHourlyPerMiner * 24;
  const effectiveMonthlyCoins = effectiveDailyCoins * 30;

  // Eficiência geral (normalizada em escala percentual)
  const avgEfficiency = totalMiners > 0 ? totalEfficiencyScore / totalMiners : 0;
  const normalizedEfficiency = Math.min(100, Math.round((avgEfficiency / 30) * 100));

  return {
    totalMiners,
    activeCount: activeMiners.length,
    inHouseCount: inHouseMiners.length,
    waitingCount: waitingMiners.length,
    reserveCount: reserveMiners.length,
    availableSlots: Math.max(0, 15 - activeMiners.length),
    houseSlots,
    houseMultiplier,
    currentHourlyProduction: parseFloat(currentHourlyProduction.toFixed(3)),
    effectiveDailyCoins: parseFloat(effectiveDailyCoins.toFixed(3)),
    effectiveMonthlyCoins: parseFloat(effectiveMonthlyCoins.toFixed(3)),
    dailyUsd: parseFloat((effectiveDailyCoins * rate).toFixed(2)),
    monthlyUsd: parseFloat((effectiveMonthlyCoins * rate).toFixed(2)),
    avgWorkMins: Math.round(avgWorkMins),
    avgRestMins: Math.round(avgRestMins),
    avgWaitMins: Math.round(avgWaitMins),
    effectiveWorkingSlots: parseFloat(effectiveWorkingSlots.toFixed(1)),
    mineUptimePct: Math.round(mineUptime * 100),
    efficiencyScore: normalizedEfficiency,
    avgProductionPerHero: totalMiners > 0 ? parseFloat((effectiveDailyCoins / totalMiners).toFixed(3)) : 0
  };
}

export function calculateSimulatedAccountStats(
  miners = [],
  currentHouse = {},
  config = {},
  simOptions = {}
) {
  const rate = config?.minerCoinUsdtRate || 1.0;

  // 1. Casa Simulada
  const targetHouseId = simOptions.houseId || currentHouse?.id || 'basic';
  const targetHouse = config?.houses?.[targetHouseId] || currentHouse || { slots: 5, recoverySpeedMultiplier: 1.0 };
  const simHouseSlots = targetHouse.slots || 5;
  const simHouseMultiplier = targetHouse.recoverySpeedMultiplier || 1.0;

  // 2. Upgrades de Energia Simulados
  const energyBonusPct = Number(simOptions.maxEnergyBonusPct) || 0; // ex: 0, 10, 20, 30
  const drainDiscountPct = Number(simOptions.drainDiscountPct) || 0; // ex: 0, 10, 20, 30
  const recoverySpeedBonusPct = Number(simOptions.recoverySpeedBonusPct) || 0; // ex: 0, 15, 30, 50

  // 3. Upgrades de Nível dos Heróis Simulados
  const heroLevelBonus = Number(simOptions.heroLevelBonus) || 0; // ex: 0, 1, 2

  const totalMiners = miners.length;
  let weightedWorkMins = 0;
  let weightedRestMins = 0;
  let totalSimBasePerHour = 0;
  let totalSimEfficiency = 0;

  miners.forEach(m => {
    // Nível simulado
    const powerLevelMult = 1 + (heroLevelBonus * 0.25);
    const prodLevelMult = 1 + (heroLevelBonus * 0.20);

    const basePower = (m.power || 2) * powerLevelMult;
    const baseSpeed = m.speed || 1;
    const baseStamina = (m.maxStamina || 100) * (1 + energyBonusPct / 100);
    const drainPerMin = (m.energyDrainRate || 1.0) * Math.max(0.5, 1 - (drainDiscountPct / 100));

    const hourlyCoin = (m.coinsPerHour || (basePower * 0.05 * baseSpeed)) * prodLevelMult;

    // Tempo de trabalho estendido
    const workMins = baseStamina / drainPerMin;

    // Tempo de recuperação acelerado pela casa simulada + bônus de energia
    const baseRecMins = 240;
    const effectiveRecoveryMult = simHouseMultiplier * (1 + recoverySpeedBonusPct / 100);
    const restMins = baseRecMins / effectiveRecoveryMult;

    weightedWorkMins += workMins;
    weightedRestMins += restMins;
    totalSimBasePerHour += hourlyCoin;

    const eff = (basePower * 1.5 + baseSpeed * 10 + hourlyCoin * 50);
    totalSimEfficiency += eff;
  });

  const avgWorkMins = totalMiners > 0 ? weightedWorkMins / totalMiners : 100;
  const avgRestMins = totalMiners > 0 ? weightedRestMins / totalMiners : 240;

  // Gargalo com a nova capacidade da casa
  const bedDeficit = Math.max(0, totalMiners - 15 - simHouseSlots);
  const avgWaitMins = bedDeficit > 0 ? (bedDeficit / Math.max(1, simHouseSlots)) * (avgRestMins * 0.5) : 0;
  const totalCycleMins = avgWorkMins + avgRestMins + avgWaitMins;

  const simDutyCycle = totalCycleMins > 0 ? avgWorkMins / totalCycleMins : 0.35;
  const totalTeamCapacitySlots = totalMiners * simDutyCycle;
  const effectiveWorkingSlots = Math.min(15, totalTeamCapacitySlots);
  const mineUptime = totalMiners > 0 ? Math.min(1.0, totalTeamCapacitySlots / Math.min(15, totalMiners)) : 0;

  const avgHourlyPerMiner = totalMiners > 0 ? totalSimBasePerHour / totalMiners : 0.12;
  const simHourlyProduction = effectiveWorkingSlots * avgHourlyPerMiner;
  const simDailyCoins = effectiveWorkingSlots * avgHourlyPerMiner * 24;
  const simMonthlyCoins = simDailyCoins * 30;

  const avgEfficiency = totalMiners > 0 ? totalSimEfficiency / totalMiners : 0;
  const normalizedEfficiency = Math.min(100, Math.round((avgEfficiency / 30) * 100));

  return {
    targetHouse,
    simHouseSlots,
    simHouseMultiplier,
    avgWorkMins: Math.round(avgWorkMins),
    avgRestMins: Math.round(avgRestMins),
    avgWaitMins: Math.round(avgWaitMins),
    effectiveWorkingSlots: parseFloat(effectiveWorkingSlots.toFixed(1)),
    mineUptimePct: Math.round(mineUptime * 100),
    simHourlyProduction: parseFloat(simHourlyProduction.toFixed(3)),
    simDailyCoins: parseFloat(simDailyCoins.toFixed(3)),
    simMonthlyCoins: parseFloat(simMonthlyCoins.toFixed(3)),
    dailyUsd: parseFloat((simDailyCoins * rate).toFixed(2)),
    monthlyUsd: parseFloat((simMonthlyCoins * rate).toFixed(2)),
    efficiencyScore: normalizedEfficiency,
    avgProductionPerHero: totalMiners > 0 ? parseFloat((simDailyCoins / totalMiners).toFixed(3)) : 0
  };
}

export function calculateUpgradeRoi(realStats, simStats, simOptions = {}, config = {}, currentHouse = {}, miners = []) {
  const rate = config?.minerCoinUsdtRate || 1.0;

  // 1. Custo da Casa Simulada
  let houseCostUsdt = 0;
  const targetHouseId = simOptions.houseId;
  if (targetHouseId && targetHouseId !== currentHouse?.id) {
    const targetHouse = config?.houses?.[targetHouseId];
    if (targetHouse) {
      // Diferença de valor para upgrade de casa
      const currentHouseCost = currentHouse?.costUsdt || 0;
      houseCostUsdt = Math.max(0, (targetHouse.costUsdt || 0) - currentHouseCost);
    }
  }

  // 2. Custos de Melhoria de Energia (em MINER, convertidos conforme cotação configurada)
  let energyCostMiner = 0;
  const energyTiers = {
    maxEnergy: { 10: 15, 20: 35, 30: 60 },
    drain: { 10: 20, 20: 45, 30: 75 },
    recovery: { 15: 15, 30: 35, 50: 65 }
  };
  energyCostMiner += (energyTiers.maxEnergy[simOptions.maxEnergyBonusPct] || 0);
  energyCostMiner += (energyTiers.drain[simOptions.drainDiscountPct] || 0);
  energyCostMiner += (energyTiers.recovery[simOptions.recoverySpeedBonusPct] || 0);

  // 3. Custos de Melhoria de Heróis (Level Up em MINER)
  let heroLevelCostMiner = 0;
  const levelBonus = Number(simOptions.heroLevelBonus) || 0;
  if (levelBonus > 0) {
    // Upgrades calculados sobre os 15 heróis da equipe ativa
    const targetHerocount = Math.min(15, miners.length);
    for (let i = 0; i < targetHerocount; i++) {
      const currentLvl = miners[i]?.level || 1;
      for (let l = 0; l < levelBonus; l++) {
        const costForLevel = parseFloat((2.5 * Math.pow(1.6, (currentLvl + l) - 1)).toFixed(2));
        heroLevelCostMiner += costForLevel;
      }
    }
  }

  // Conversão fiel à cotação oficial da Minercoin (não é 1:1 fixo)
  const houseCostMiner = rate > 0 ? parseFloat((houseCostUsdt / rate).toFixed(2)) : houseCostUsdt;
  const totalUpgradeCostMiner = parseFloat((houseCostMiner + energyCostMiner + heroLevelCostMiner).toFixed(2));
  const totalUpgradeCostUsd = parseFloat((houseCostUsdt + (energyCostMiner + heroLevelCostMiner) * rate).toFixed(2));

  // 4. Produção Adicional
  const additionalDailyCoins = Math.max(0, parseFloat((simStats.simDailyCoins - realStats.effectiveDailyCoins).toFixed(3)));
  const additionalMonthlyCoins = Math.max(0, parseFloat((simStats.simMonthlyCoins - realStats.effectiveMonthlyCoins).toFixed(3)));
  const additionalDailyUsd = parseFloat((additionalDailyCoins * rate).toFixed(2));
  const additionalMonthlyUsd = parseFloat((additionalMonthlyCoins * rate).toFixed(2));

  const improvementPct = realStats.effectiveDailyCoins > 0
    ? parseFloat((((simStats.simDailyCoins - realStats.effectiveDailyCoins) / realStats.effectiveDailyCoins) * 100).toFixed(1))
    : 0;

  // 5. Fórmulas de ROI e Payback
  // ROI Diário = (Retorno adicional diário em valor monetário / Custo do upgrade) × 100
  const dailyRoiPct = totalUpgradeCostUsd > 0 && additionalDailyUsd > 0
    ? parseFloat(((additionalDailyUsd / totalUpgradeCostUsd) * 100).toFixed(2))
    : 0;

  // Payback = Custo do upgrade / Retorno adicional diário
  const paybackDays = totalUpgradeCostUsd > 0 && additionalDailyUsd > 0
    ? parseFloat((totalUpgradeCostUsd / additionalDailyUsd).toFixed(1))
    : (totalUpgradeCostUsd === 0 ? 0 : null);

  // 6. Projeção de Retorno Acumulado (Lucro Líquido = Produção adicional acumulada - Custo do upgrade)
  const cumulative7d = parseFloat(((additionalDailyUsd * 7) - totalUpgradeCostUsd).toFixed(2));
  const cumulative15d = parseFloat(((additionalDailyUsd * 15) - totalUpgradeCostUsd).toFixed(2));
  const cumulative30d = parseFloat(((additionalDailyUsd * 30) - totalUpgradeCostUsd).toFixed(2));
  const cumulative60d = parseFloat(((additionalDailyUsd * 60) - totalUpgradeCostUsd).toFixed(2));
  const cumulative90d = parseFloat(((additionalDailyUsd * 90) - totalUpgradeCostUsd).toFixed(2));

  return {
    houseCostUsdt,
    energyCostMiner,
    heroLevelCostMiner,
    totalUpgradeCostMiner,
    totalUpgradeCostUsd,
    additionalDailyCoins,
    additionalMonthlyCoins,
    additionalDailyUsd,
    additionalMonthlyUsd,
    improvementPct,
    dailyRoiPct,
    paybackDays,
    isPositiveReturn: additionalDailyUsd > 0,
    cumulativeReturns: {
      days7: cumulative7d,
      days15: cumulative15d,
      days30: cumulative30d,
      days60: cumulative60d,
      days90: cumulative90d
    }
  };
}
