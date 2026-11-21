import { calculateRoiScenario } from './src/utils/roiSimulatorEngine.js';
import { calculateRealAccountStats, calculateUpgradeRoi } from './src/utils/upgradeSimulatorEngine.js';
import { calculateWithdrawalTax } from './src/data/investmentData.js';
import { DEFAULT_CRYPTO_ZOMBIES_CONFIG } from './src/data/cryptoZombiesConfig.js';

console.log('--- TESTE DA COTAÇÃO OFICIAL 1 MNC = US$ 0,01 ---');

// 1. Confirma default_config
console.log(`Default minerCoinUsdtRate: ${DEFAULT_CRYPTO_ZOMBIES_CONFIG.minerCoinUsdtRate}`);
if (DEFAULT_CRYPTO_ZOMBIES_CONFIG.minerCoinUsdtRate !== 0.01) {
  throw new Error(`Esperado 0.01, obtido: ${DEFAULT_CRYPTO_ZOMBIES_CONFIG.minerCoinUsdtRate}`);
}

// 2. Simulação de ROI com a taxa de 0.01
const roiExpected = calculateRoiScenario({
  chestCategory: 'explorer', // Baú Explorer = $50 USDT (5 heróis)
  chestQuantity: 1,
  houseId: 'basic',          // Casa Básica = $25 USDT
  scenario: 'expected',
  config: DEFAULT_CRYPTO_ZOMBIES_CONFIG
});

console.log(`Investimento Total: $${roiExpected.totalInvestment} USDT`);
console.log(`Produção Diária: ${roiExpected.effectiveCoinsPerDay} MNC`);
console.log(`Retorno Diário em USD: $${roiExpected.dailyUsd} USD`);
console.log(`ROI Diário: ${roiExpected.roiDailyPct}%/dia`);
console.log(`Payback: ~${roiExpected.paybackDays} dias`);
console.log(`Retorno em 90 dias: $${roiExpected.projectedReturn90d} USD`);

// 3. Teste de Saque
const withdrawalAmountMnc = 1000; // 1.000 MNC
const rate = 0.01;
const grossUsd = withdrawalAmountMnc * rate; // $10.00 USD
const tax15 = calculateWithdrawalTax(100, grossUsd); // $10 sacado vs $100 investido -> ROI 10% (<50%) -> tax 15%
console.log(`Saque de 1.000 MNC = US$ ${grossUsd} bruto. Taxa com $100 investido: ${tax15}%`);
if (tax15 !== 15) throw new Error('Taxa esperada de 15%');

console.log('✅ TESTE DA COTAÇÃO OFICIAL 1 MNC = US$ 0,01 FINALIZADO COM 100% DE SUCESSO!');
