import { calculateRoiScenario } from './src/utils/roiSimulatorEngine.js';
import { calculateWithdrawalTax } from './src/data/investmentData.js';
import { DEFAULT_CRYPTO_ZOMBIES_CONFIG } from './src/data/cryptoZombiesConfig.js';
import { applyOfflineHeroRecovery } from './src/utils/heroHealth.js';

console.log('================================================================');
console.log('SIMULAÇÃO DE 15 DIAS — CENÁRIO MÉDIO DE ROI (CRYPTOZOMBIES)');
console.log('================================================================');

const rate = DEFAULT_CRYPTO_ZOMBIES_CONFIG.minerCoinUsdtRate; // 0.01 USDT / MNC
console.log(`Cotação oficial: 1 Coin = US$ ${rate.toFixed(2)} | Jornada média: 12h/dia\n`);

const setups = [
  { label: 'Baú de Herói 5x (Explorer) + Base Básica', chestCategory: 'explorer', houseId: 'basic' },
  { label: 'Baú de Herói 10x (Elite) + Base Básica', chestCategory: 'elite', houseId: 'basic' },
  { label: 'Baú de Herói 15x (Legendary) + Base Básica', chestCategory: 'legendary', houseId: 'basic' }
];

for (const setup of setups) {
  const res = calculateRoiScenario({
    chestCategory: setup.chestCategory,
    chestQuantity: 1,
    houseId: setup.houseId,
    scenario: 'expected', // Cenário Médio
    config: DEFAULT_CRYPTO_ZOMBIES_CONFIG
  });

  console.log(`--- ${setup.label} ---`);
  console.log(`Investimento Total: US$ ${res.totalInvestment.toFixed(2)}`);
  console.log(`Produção Média Diária: ${res.effectiveCoinsPerDay.toFixed(2)} Coins (US$ ${res.dailyUsd.toFixed(2)}/dia)`);
  console.log(`ROI Diário: ${res.roiDailyPct.toFixed(2)}%/dia | Payback estimado: ~${res.paybackDays} dias`);

  let accCoins = 0;
  let accUsd = 0;
  for (let day = 1; day <= 15; day++) {
    accCoins += res.effectiveCoinsPerDay;
    accUsd += res.dailyUsd;
    if (day === 1 || day === 5 || day === 10 || day === 15) {
      const roi15Pct = res.totalInvestment > 0 ? (accUsd / res.totalInvestment) * 100 : 0;
      const taxPct = calculateWithdrawalTax(res.totalInvestment, accUsd);
      const netUsd = accUsd * (1 - taxPct / 100);
      console.log(
        `  Dia ${String(day).padStart(2, '0')}: ${accCoins.toFixed(1)} Coins | Bruto: US$ ${accUsd.toFixed(2)} | Líquido (taxa ${taxPct}%): US$ ${netUsd.toFixed(2)} | ROI: ${roi15Pct.toFixed(2)}%`
      );
    }
  }
  console.log('');
}

// Simula 12h de mineração + 12h de recarga offline por 15 dias
const sampleTeam = [
  { id: 'h1', rarity: 'common', status: 'house', maxHealth: 1000, currentHealth: 50 },
  { id: 'h2', rarity: 'rare', status: 'house', maxHealth: 1200, currentHealth: 60 },
  { id: 'h3', rarity: 'epic', status: 'house', maxHealth: 1600, currentHealth: 80 }
];
const after12hOffline = applyOfflineHeroRecovery(sampleTeam, 12 * 3600, {
  houseSlots: 5,
  recoverySpeedPct: 100
});
console.log('--- Validação de Recarga Offline (12h descansando entre sessões) ---');
after12hOffline.forEach((h) => {
  console.log(`  ${h.id} (${h.rarity}): ${Math.round(h.currentHealth)}/${h.maxHealth} PV -> status: ${h.status}`);
});
console.log('✅ SIMULAÇÃO DE 15 DIAS CONCLUÍDA COM SUCESSO!');
