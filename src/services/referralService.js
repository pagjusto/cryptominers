import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const REFERRAL_COMMISSION_PCT = 1;
const PENDING_REF_KEY = 'cryptozombies_pending_ref_code_v1';
const LOCAL_REWARDS_KEY = 'cryptozombies_referral_rewards_v1';

/**
 * Captura ?ref=CODIGO da URL e persiste no localStorage para uso no cadastro.
 */
export function captureReferralFromUrl() {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = (params.get('ref') || '').trim().toUpperCase();
    if (ref && /^[A-Z0-9_-]{4,24}$/.test(ref)) {
      localStorage.setItem(PENDING_REF_KEY, ref);
      return ref;
    }
  } catch (e) {}
  return getStoredReferralCode();
}

export function getStoredReferralCode() {
  if (typeof window === 'undefined') return '';
  try {
    return (localStorage.getItem(PENDING_REF_KEY) || '').trim().toUpperCase();
  } catch (e) {
    return '';
  }
}

export function clearStoredReferralCode() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PENDING_REF_KEY);
  } catch (e) {}
}

/**
 * Gera o código de indicação determinístico do jogador.
 */
export function getUserReferralCode(authUser) {
  const rawId = (authUser?.id || '').replace(/[^a-zA-Z0-9]/g, '');
  if (rawId.length >= 6) {
    return `CZ${rawId.slice(0, 6).toUpperCase()}`;
  }
  return 'CZLOCAL1';
}

export function getUserReferralLink(authUser) {
  const code = getUserReferralCode(authUser);
  if (typeof window === 'undefined') return `/?ref=${code}`;
  return `${window.location.origin}/?ref=${code}`;
}

/**
 * Calcula 1% do valor da compra em USDT convertido em Coins.
 */
export function calculateReferralCoins(purchaseUsdt, minerRate = 0.01) {
  const amount = Number(purchaseUsdt) || 0;
  const rate = Math.max(0.0001, Number(minerRate) || 0.01);
  if (amount <= 0) return 0;
  const usdtCommission = amount * (REFERRAL_COMMISSION_PCT / 100);
  return parseFloat((usdtCommission / rate).toFixed(2));
}

/**
 * Vincula o código de indicação pendente ao perfil do usuário autenticado (se ainda não vinculado).
 */
export async function syncPendingReferralToProfile(authUser) {
  const pendingRef = getStoredReferralCode();
  const userId = authUser?.id;
  if (!pendingRef || !userId || !isSupabaseConfigured || !supabase) return;

  const ownCode = getUserReferralCode(authUser);
  if (pendingRef === ownCode) {
    clearStoredReferralCode();
    return;
  }

  try {
    await supabase
      .from('profiles')
      .update({ referred_by_code: pendingRef })
      .eq('id', userId)
      .is('referred_by_user_id', null);
  } catch (e) {
    // Silencioso caso a migração SQL ainda não tenha sido aplicada
  }
}

/**
 * Busca resumo de indicações (total de indicados, Coins ganhos e histórico).
 */
export async function fetchReferralSummary(authUser) {
  const userId = authUser?.id;
  const ownCode = getUserReferralCode(authUser);
  let localHistory = [];
  try {
    const saved = localStorage.getItem(LOCAL_REWARDS_KEY);
    if (saved) localHistory = JSON.parse(saved) || [];
  } catch (e) {}

  if (!userId || !isSupabaseConfigured || !supabase) {
    const totalCoins = localHistory.reduce((acc, r) => acc + Number(r.coins_rewarded || 0), 0);
    const uniqueReferred = new Set(localHistory.map((r) => r.referred_user_id)).size;
    return {
      referralCode: ownCode,
      referredCount: uniqueReferred,
      totalCoinsEarned: parseFloat(totalCoins.toFixed(2)),
      rewards: localHistory,
    };
  }

  try {
    const [profileRes, rewardsRes, countRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('referral_code, referral_coins_earned')
        .eq('id', userId)
        .maybeSingle(),
      supabase
        .from('referral_rewards')
        .select('id, referred_user_id, referred_name, package_id, purchase_usdt, commission_pct, coins_rewarded, created_at')
        .eq('referrer_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('referred_by_user_id', userId),
    ]);

    const rewards = Array.isArray(rewardsRes.data) ? rewardsRes.data : localHistory;
    const totalCoins =
      profileRes.data?.referral_coins_earned != null
        ? Number(profileRes.data.referral_coins_earned)
        : rewards.reduce((acc, r) => acc + Number(r.coins_rewarded || 0), 0);

    return {
      referralCode: profileRes.data?.referral_code || ownCode,
      referredCount: typeof countRes.count === 'number' ? countRes.count : new Set(rewards.map((r) => r.referred_user_id)).size,
      totalCoinsEarned: parseFloat(totalCoins.toFixed(2)),
      rewards,
    };
  } catch (e) {
    const totalCoins = localHistory.reduce((acc, r) => acc + Number(r.coins_rewarded || 0), 0);
    return {
      referralCode: ownCode,
      referredCount: new Set(localHistory.map((r) => r.referred_user_id)).size,
      totalCoinsEarned: parseFloat(totalCoins.toFixed(2)),
      rewards: localHistory,
    };
  }
}

/**
 * Registra recompensa de 1% em Coins para o indicador quando o indicado compra um baú em USDT.
 */
export async function recordReferralPurchaseReward({ authUser, packageId, purchaseUsdt, minerRate = 0.01 }) {
  const userId = authUser?.id;
  if (!userId || !purchaseUsdt || purchaseUsdt <= 0) return null;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc('process_referral_purchase_reward', {
        p_referred_user_id: userId,
        p_package_id: packageId || 'chest',
        p_purchase_usdt: Number(purchaseUsdt),
        p_miner_rate: Number(minerRate) || 0.01,
      });
      if (!error && data) return data;
    } catch (e) {}
  }
  return null;
}
