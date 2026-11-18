// CRIPTO MYNERS — SIMULADOR DE ROI COM COMPOSIÇÃO MANUAL
const TIERS = ['common', 'rare', 'superRare', 'epic', 'legendary', 'superLegendary'];
const HP = { common:7579, rare:9095, superRare:11368, epic:12992, legendary:15158, superLegendary:18189 };
const round = (value, digits=2) => Number((Number(value)||0).toFixed(digits));

export function calculateRoiScenario({ chestMix=[], heroCounts={}, houseId='basic', sessionHours=24, config }) {
  const house = config.houses[houseId] || config.houses.basic;
  const mix = chestMix.filter(item => Number(item.quantity)>0).map(item => {
    const chest=config.chests[item.id];
    return chest ? { id:item.id, quantity:Math.max(0,Math.floor(Number(item.quantity)||0)), heroes:Number(chest.heroesCount)||0, cost:Number(chest.costUsdt)||0 } : null;
  }).filter(Boolean);
  const chestQuantity=mix.reduce((s,x)=>s+x.quantity,0);
  const chestHeroes=mix.reduce((s,x)=>s+x.heroes*x.quantity,0);
  const chestCost=mix.reduce((s,x)=>s+x.cost*x.quantity,0);
  const rarities=Object.fromEntries(TIERS.map(t=>[t,Math.max(0,Math.floor(Number(heroCounts[t])||0))]));
  const totalHeroes=TIERS.reduce((s,t)=>s+rarities[t],0);
  const maxActive=Math.min(Number(config.maxActiveMiners)||15,totalHeroes);
  const reserves=Math.max(0,totalHeroes-maxActive);
  let baseMncPerDay=0, weightedWork=0, weightedRecovery=0;
  for (const tier of TIERS) {
    const count=rarities[tier], attr=config.rarityAttributes[tier]||{};
    const daily=Number(attr.mncPerDay)||0;
    const hp=Number(attr.maxHp)||HP[tier];
    const workHours=hp*.95/3600;
    const restHours=(Number(attr.baseRecoveryMinutes)||240)/60/Math.max(.01,Number(house.recoverySpeedMultiplier)||1);
    baseMncPerDay += count*daily;
    weightedWork += count*workHours;
    weightedRecovery += count*restHours;
  }
  const avgWork=totalHeroes?weightedWork/totalHeroes:0;
  const avgRest=totalHeroes?weightedRecovery/totalHeroes:0;
  const beds=Math.max(0,Number(house.slots)||0);
  const waves=beds>0?Math.max(1,Math.ceil(totalHeroes/beds)):1;
  const recoveryWithQueue=avgRest*waves;
  const cycleUptime=avgWork+recoveryWithQueue>0?avgWork/(avgWork+recoveryWithQueue):0;
  const activeShare=totalHeroes?maxActive/totalHeroes:0;
  const hours=Math.max(0,Math.min(24,Number(sessionHours)||0));
  const sessionAvailability=hours/24;
  const effectiveUptime=Math.max(0,Math.min(1,cycleUptime*activeShare*sessionAvailability));
  const effectiveMncPerDay=baseMncPerDay*effectiveUptime;
  const rate=Number(config.minerCoinUsdtRate)||.01;
  const houseCostMiner=Number(house.costMiner)||0;
  const houseCost=houseCostMiner*rate;
  const totalInvestment=chestCost+houseCost;
  const dailyUsd=effectiveMncPerDay*rate;
  const paybackDays=dailyUsd>0?totalInvestment/dailyUsd:null;
  const projected=days=>dailyUsd*days;
  return {
    chestMix:mix,chestQuantity,chestHeroes,chestCost,houseCost,houseCostMiner,houseFragments:Number(house.constructionFragments)||0,
    totalInvestment,totalHeroes,rarities,probabilityTotalPct:null,probabilityWarning:false,
    maxActive,reserves,houseSlots:beds,recoveryMultiplier:Number(house.recoverySpeedMultiplier)||1,
    avgWorkHours:round(avgWork),avgRestHours:round(avgRest),effectiveUptimePct:round(effectiveUptime*100,1),
    sessionAvailabilityPct:round(sessionAvailability*100,1),sessionHours:hours,
    effectiveCoinsPerHour:round(effectiveMncPerDay/24,4),effectiveCoinsPerDay:round(effectiveMncPerDay),
    effectiveCoinsPerMonth:round(effectiveMncPerDay*30),dailyUsd:round(dailyUsd),monthlyUsd:round(dailyUsd*30),
    roiDailyPct:totalInvestment>0?round(dailyUsd/totalInvestment*100):0,
    paybackDays:paybackDays===null?null:Math.ceil(paybackDays),
    projectedReturn30d:round(projected(30)),projectedReturn60d:round(projected(60)),
    projectedReturn90d:round(projected(90)),projectedReturn180d:round(projected(180))
  };
}
