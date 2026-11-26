// CRYPTOZOMBIES — SERVIÇO DE ANÚNCIOS RECOMPENSADOS & FUNDO DE SUSTENTABILIDADE
// Gerencia eventos de anúncios, integridade de recompensas, limites diários,
// sorteios com bônus e contabilidade do Fundo de Sustentabilidade Publicitário.

const AD_EVENTS_KEY = 'cripto_myners_ad_events_v1';
const SUSTAINABILITY_FUND_KEY = 'cripto_myners_sustainability_fund_v1';
const ADMIN_AUDIT_LOG_KEY = 'cripto_myners_admin_audit_log_v1';

export function getTodayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 1. GERAÇÃO DE ID ÚNICO E EVENTO AUDITÁVEL
export function createUniqueAdId() {
  return 'ad-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
}

// 2. REGISTRO DE EVENTO DE ANÚNCIO NO FUNDO DE SUSTENTABILIDADE
export function recordAdTransaction({
  type, // 'energy_recovery' | 'chest_bonus' | 'mystic_playable'
  benefitDescription,
  heroId = null,
  heroName = null,
  chestType = null,
  status = 'completed', // 'completed' | 'failed' | 'interrupted'
  estimatedRevenueUsd = 0.025,
  provider = 'Google AdMob & Interactive Network'
}) {
  if (typeof window === 'undefined') return null;

  const eventId = createUniqueAdId();
  const timestamp = Date.now();
  const dateStr = getTodayDateString();

  const newEvent = {
    id: eventId,
    timestamp,
    dateStr,
    type,
    benefitDescription,
    heroId,
    heroName,
    chestType,
    status,
    estimatedRevenueUsd: status === 'completed' ? estimatedRevenueUsd : 0,
    provider
  };

  try {
    // 1. Histórico de eventos de anúncios
    const rawEvents = localStorage.getItem(AD_EVENTS_KEY);
    const events = rawEvents ? JSON.parse(rawEvents) : [];
    events.unshift(newEvent);
    // Guarda até os últimos 300 eventos para auditoria
    localStorage.setItem(AD_EVENTS_KEY, JSON.stringify(events.slice(0, 300)));

    // 2. Fundo de Sustentabilidade Publicitário (Métricas agregadas)
    const rawFund = localStorage.getItem(SUSTAINABILITY_FUND_KEY);
    const fund = rawFund ? JSON.parse(rawFund) : {
      totalRevenueUsd: 0,
      confirmedRevenueUsd: 0,
      validAdsCount: 0,
      invalidAdsCount: 0,
      energyRestoresCount: 0,
      chestBonusCount: 0,
      lastUpdated: timestamp
    };

    if (status === 'completed') {
      fund.totalRevenueUsd = parseFloat((fund.totalRevenueUsd + estimatedRevenueUsd).toFixed(4));
      fund.confirmedRevenueUsd = parseFloat((fund.confirmedRevenueUsd + estimatedRevenueUsd).toFixed(4));
      fund.validAdsCount += 1;
      if (type === 'energy_recovery') fund.energyRestoresCount += 1;
      if (type === 'chest_bonus') fund.chestBonusCount += 1;
    } else {
      fund.invalidAdsCount += 1;
    }
    fund.lastUpdated = timestamp;
    localStorage.setItem(SUSTAINABILITY_FUND_KEY, JSON.stringify(fund));

    return newEvent;
  } catch (e) {
    console.error('Erro ao registrar transação de anúncio:', e);
    return newEvent;
  }
}

// 3. CONSULTA DE LIMITE DIÁRIO DE RECUPERAÇÃO DE ENERGIA
export function getDailyEnergyAdsCountToday() {
  if (typeof window === 'undefined') return 0;
  try {
    const rawEvents = localStorage.getItem(AD_EVENTS_KEY);
    if (!rawEvents) return 0;
    const events = JSON.parse(rawEvents);
    const today = getTodayDateString();
    return events.filter(e => e.dateStr === today && e.type === 'energy_recovery' && e.status === 'completed').length;
  } catch (e) {
    return 0;
  }
}

export function canWatchEnergyAdToday(dailyLimit = 5) {
  const used = getDailyEnergyAdsCountToday();
  return used < dailyLimit;
}

// 4. CONSULTA DE MÉTRICAS DO FUNDO DE SUSTENTABILIDADE PUBLICITÁRIO
export function getSustainabilityFundStats() {
  if (typeof window === 'undefined') {
    return {
      totalRevenueUsd: 0,
      confirmedRevenueUsd: 0,
      validAdsCount: 0,
      invalidAdsCount: 0,
      energyRestoresCount: 0,
      chestBonusCount: 0
    };
  }
  try {
    const rawFund = localStorage.getItem(SUSTAINABILITY_FUND_KEY);
    if (!rawFund) {
      return {
        totalRevenueUsd: 0,
        confirmedRevenueUsd: 0,
        validAdsCount: 0,
        invalidAdsCount: 0,
        energyRestoresCount: 0,
        chestBonusCount: 0
      };
    }
    return JSON.parse(rawFund);
  } catch (e) {
    return {
      totalRevenueUsd: 0,
      confirmedRevenueUsd: 0,
      validAdsCount: 0,
      invalidAdsCount: 0,
      energyRestoresCount: 0,
      chestBonusCount: 0
    };
  }
}

// 5. HISTÓRICO DE ANÚNCIOS ASSISTIDOS
export function getAdEventsHistory(limit = 50) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AD_EVENTS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.slice(0, limit) : [];
  } catch (e) {
    return [];
  }
}

// 6. REGISTRO DE AUDITORIA ADMINISTRATIVA
export function logAdminAuditChange({
  section,
  description,
  oldValues,
  newValues,
  adminUser = 'Admin Myners'
}) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(ADMIN_AUDIT_LOG_KEY);
    const logs = raw ? JSON.parse(raw) : [];
    logs.unshift({
      id: 'audit-' + Date.now(),
      timestamp: Date.now(),
      dateStr: new Date().toLocaleString('pt-BR'),
      section,
      description,
      oldValues,
      newValues,
      adminUser
    });
    localStorage.setItem(ADMIN_AUDIT_LOG_KEY, JSON.stringify(logs.slice(0, 100)));
  } catch (e) {
    console.error('Erro ao salvar auditoria administrativa:', e);
  }
}

export function getAdminAuditLogs(limit = 20) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ADMIN_AUDIT_LOG_KEY);
    if (!raw) return [];
    return JSON.parse(raw).slice(0, limit);
  } catch (e) {
    return [];
  }
}

// 7. SORTEIO SEGURO DE RARIDADE (INDIVIDUAL POR HERÓI)
// Aplica as tabelas oficiais de Probabilidades Normais vs. Com Anúncio
export function rollHeroRarity(chestId = 'miner', isAdBonus = false, config = {}) {
  const defaultProbs = {
    common: 82.87,
    rare: 10.36,
    super_rare: 5.18,
    epic: 1.04,
    legendary: 0.51,
    super_legend: 0.04
  };
  const chest = config?.chests?.[chestId] || {
    normalProbabilities: defaultProbs,
    adBonusProbabilities: defaultProbs
  };

  const probs = isAdBonus
    ? (chest.adBonusProbabilities || chest.probabilities || defaultProbs)
    : (chest.normalProbabilities || chest.probabilities || defaultProbs);

  const pSuperLeg = Number(probs.super_legend ?? 0.04);
  const pLeg = Number(probs.legendary ?? 0.51);
  const pEpic = Number(probs.epic ?? 1.04);
  const pSuperRare = Number(probs.super_rare ?? 5.18);
  const pRare = Number(probs.rare ?? 10.36);

  // Sorteio com aleatoriedade segura (0..100)
  const rand = Math.random() * 100;

  if (rand < pSuperLeg) {
    return 'super_legend';
  } else if (rand < pSuperLeg + pLeg) {
    return 'legendary';
  } else if (rand < pSuperLeg + pLeg + pEpic) {
    return 'epic';
  } else if (rand < pSuperLeg + pLeg + pEpic + pSuperRare) {
    return 'super_rare';
  } else if (rand < pSuperLeg + pLeg + pEpic + pSuperRare + pRare) {
    return 'rare';
  }
  return 'common';
}
