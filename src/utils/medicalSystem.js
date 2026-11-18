// Regras centrais do ambulatório CryptoZombies.
// Este módulo é puro: não realiza cobranças nem confia em saldos enviados pelo cliente.
export const DOCTOR_PLANS = Object.freeze([
  { id: 'monthly', days: 30, usdt: 5.20, mnc: 520 },
  { id: 'quarterly', days: 90, usdt: 13.80, mnc: 1380 },
  { id: 'semiannual', days: 180, usdt: 25.00, mnc: 2500 }
]);

export const INJURY_THRESHOLD_PCT = 5;
export const ACTIVE_SURVIVOR_LIMIT = 15;

export function isInjured(survivor) {
  if (!survivor || !Number.isFinite(survivor.currentHealth) || !Number.isFinite(survivor.maxHealth) || survivor.maxHealth <= 0) return false;
  return (survivor.currentHealth / survivor.maxHealth) * 100 <= INJURY_THRESHOLD_PCT;
}

// O resgate não cria camas. A fila é FIFO e os feridos mantêm a ordem de chegada.
export function rescueInjured(survivors, { doctorActive = false, survivorId = null, capacity = 0 } = {}) {
  const next = survivors.map(s => ({ ...s }));
  const targets = next.filter(s =>
    (s.status === 'work' || s.status === 'injured') &&
    isInjured(s) &&
    (doctorActive || s.id === survivorId)
  );
  targets.forEach(s => {
    s.status = 'waiting_house';
    s.rescueRequestedAt = Number.isFinite(s.rescueRequestedAt) ? s.rescueRequestedAt : Date.now();
  });
  return assignBedsFIFO(next, capacity);
}

export function assignBedsFIFO(survivors, capacity = 0) {
  const next = survivors.map(s => ({ ...s }));
  const occupied = next.filter(s => s.status === 'house').length;
  let freeBeds = Math.max(0, Math.floor(capacity) - occupied);
  const waiting = next
    .filter(s => s.status === 'waiting_house')
    .sort((a, b) => (a.rescueRequestedAt || 0) - (b.rescueRequestedAt || 0));
  for (const queued of waiting) {
    if (freeBeds <= 0) break;
    const survivor = next.find(s => s.id === queued.id);
    survivor.status = 'house';
    freeBeds -= 1;
  }
  return next;
}

export function recoverInShelter(survivors, elapsedMs, recoverySpeedPct = 100, baseFullRecoveryMinutes = 240) {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return survivors.map(s => ({ ...s }));
  const speed = Math.max(0, recoverySpeedPct) / 100;
  const baseMinutes = Math.max(1, baseFullRecoveryMinutes);
  const healedFraction = (elapsedMs / (baseMinutes * 60000)) * speed;
  return survivors.map(s => {
    if (s.status !== 'house') return { ...s };
    const maxHealth = s.maxHealth || 100;
    const currentHealth = Math.min(maxHealth, (s.currentHealth || 0) + maxHealth * healedFraction);
    return currentHealth >= maxHealth
      ? { ...s, currentHealth: maxHealth, status: 'reserve', rescueRequestedAt: undefined }
      : { ...s, currentHealth };
  });
}

// Renovação: cobrança automática é permitida apenas em MNC; nunca tenta debitar USDT automaticamente.
export function getDoctorRenewalDecision({ expiresAt, now = Date.now(), autoRenew = false, currency = 'MNC', mncBalance = 0, planMnc = 0 }) {
  if (Number.isFinite(expiresAt) && expiresAt > now) return { active: true, renew: false, reason: 'not_expired' };
  if (!autoRenew) return { active: false, renew: false, reason: 'manual_renewal_required' };
  if (currency !== 'MNC') return { active: false, renew: false, reason: 'auto_renew_requires_mnc' };
  if (mncBalance < planMnc) return { active: false, renew: false, reason: 'insufficient_mnc' };
  return { active: false, renew: true, reason: 'mnc_balance_sufficient', amountMnc: planMnc };
}
