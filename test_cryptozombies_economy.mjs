import assert from 'node:assert/strict';
import {
  SURVIVOR_RARITY_ODDS,
  SURVIVOR_MNC_PER_DAY,
  SURVIVOR_MNC_PER_SECOND,
  MEDIAN_TEAM_COMPOSITION,
  calculateCompositionDailyProduction,
  calculateSurvivorDailyProduction,
  drawSurvivorRarity,
  drawTeamRarities,
  estimateRoi,
  getMedianTeamScenario
} from './src/utils/cryptozombiesEconomy.js';

assert.equal(SURVIVOR_RARITY_ODDS.reduce((sum, tier) => sum + tier.chancePct, 0), 100);
assert.deepEqual(Object.values(SURVIVOR_MNC_PER_DAY), [20.88, 31.32, 36.54, 41.76, 62.64, 83.52]);
assert.equal(SURVIVOR_MNC_PER_SECOND.common * 86400, 20.88);
assert.equal(SURVIVOR_MNC_PER_SECOND.superRare * 86400, 36.54);
assert.equal(calculateCompositionDailyProduction(MEDIAN_TEAM_COMPOSITION), 480.24);
assert.equal(calculateSurvivorDailyProduction([
  { rarity: 'common' }, { rarity: 'superRare' }, { rarity: 'superLegendary' }
]), 140.94);
assert.equal(drawSurvivorRarity(() => 0), 'common');
assert.equal(drawSurvivorRarity(() => 0.8126), 'rare');
assert.equal(drawSurvivorRarity(() => 0.995), 'superLegendary');
assert.equal(drawTeamRarities(15, () => 0).length, 15);

const roi = estimateRoi({
  chestPackCostUsdt: 435.53,
  doctorCostUsdt: 13.80,
  dailyProductionMnc: 480.24,
  days: 90
});
assert.equal(roi.totalCostUsdt, 449.33);
assert.equal(roi.grossMnc, 43221.6);
assert.equal(roi.grossValueUsdt, 432.216);
assert.equal(roi.guaranteed, false);
assert.equal(roi.isApproximation, true);

const median = getMedianTeamScenario({ chestPackCostUsdt: 435.53 });
assert.equal(median.dailyProductionMnc, 480.24);
assert.equal(median.roi.estimatedPaybackDays > 90, true);

assert.throws(() => drawTeamRarities(-1), RangeError);
assert.throws(() => estimateRoi({ chestPackCostUsdt: -1, dailyProductionMnc: 10 }), RangeError);

console.log('cryptozombiesEconomy: all tests passed');
