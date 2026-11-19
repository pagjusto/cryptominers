// Cripto Myners — cálculos puros para contabilidade e ROI.
// Não autentica usuários nem substitui um ledger persistido no backend.
const FINANCIAL_TYPES = Object.freeze({
  chest_sale: 'revenue',
  doctor_plan_sale: 'revenue',
  ad_revenue: 'revenue',
  marketplace_fee: 'revenue',
  payment_fee: 'cost',
  refund: 'cost',
  chargeback: 'cost',
  infrastructure_cost: 'cost',
  operational_cost: 'cost',
  reserve_allocation: 'allocation',
  sustainability_allocation: 'allocation',
  mnc_issuance: 'memo'
});

const roundMoney = value => Math.round((value + Number.EPSILON) * 100) / 100;

function validAmount(value) {
  return Number.isFinite(value) && value >= 0;
}

export function summarizeCompanyLedger(entries = [], { currency = 'USDT', from, to } = {}) {
  if (!Array.isArray(entries)) throw new TypeError('entries deve ser um array');
  const totals = { grossRevenue: 0, costs: 0, allocations: 0, mncIssued: 0, pending: 0, confirmedCount: 0 };
  const byType = {};
  const included = [];

  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;
    if (!validAmount(entry.amount) || !entry.currency || !entry.type) continue;
    if (entry.currency !== currency) continue;
    if (from && (!entry.occurredAt || entry.occurredAt < from)) continue;
    if (to && (!entry.occurredAt || entry.occurredAt > to)) continue;

    if (entry.status === 'pending') {
      totals.pending = roundMoney(totals.pending + entry.amount);
      continue;
    }
    if (entry.status !== 'confirmed') continue;

    const category = FINANCIAL_TYPES[entry.type];
    if (!category) continue;
    included.push(entry);
    byType[entry.type] = roundMoney((byType[entry.type] || 0) + entry.amount);
    totals.confirmedCount += 1;

    if (category === 'revenue') totals.grossRevenue += entry.amount;
    if (category === 'cost') totals.costs += entry.amount;
    if (category === 'allocation') totals.allocations += entry.amount;
  }

  // Emissão de MNC é informativa e deve ser consultada na moeda MNC, nunca convertida em receita USDT.
  if (currency === 'MNC') {
    for (const entry of included) {
      if (entry.type === 'mnc_issuance') totals.mncIssued += entry.amount;
    }
  }

  totals.grossRevenue = roundMoney(totals.grossRevenue);
  totals.costs = roundMoney(totals.costs);
  totals.allocations = roundMoney(totals.allocations);
  totals.mncIssued = roundMoney(totals.mncIssued);
  totals.operatingProfit = roundMoney(totals.grossRevenue - totals.costs);
  totals.profitAfterAllocations = roundMoney(totals.operatingProfit - totals.allocations);
  totals.operatingMarginPct = totals.grossRevenue > 0
    ? roundMoney((totals.operatingProfit / totals.grossRevenue) * 100)
    : null;

  return { currency, totals, byType };
}

export function calculatePlayerRoi({
  initialInvestment = 0,
  grossRewardMnc = 0,
  mncReferenceUsdt = 0.01,
  periodDays = 90
} = {}) {
  for (const [key, value] of Object.entries({ initialInvestment, grossRewardMnc, mncReferenceUsdt, periodDays })) {
    if (!Number.isFinite(value) || value < 0) throw new RangeError(`Valor inválido: ${key}`);
  }
  const estimatedGrossValueUsdt = roundMoney(grossRewardMnc * mncReferenceUsdt);
  const estimatedNetValueUsdt = roundMoney(estimatedGrossValueUsdt - initialInvestment);
  return {
    periodDays,
    initialInvestment: roundMoney(initialInvestment),
    grossRewardMnc: roundMoney(grossRewardMnc),
    referenceRate: mncReferenceUsdt,
    estimatedGrossValueUsdt,
    estimatedNetValueUsdt,
    roiPct: initialInvestment > 0 ? roundMoney((estimatedNetValueUsdt / initialInvestment) * 100) : null,
    isEstimate: true,
    guaranteed: false
  };
}

export { FINANCIAL_TYPES };
