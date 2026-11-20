// ============================================================================
// CRYPTOZOMBIES — SERVIÇO DE SINCRONIZAÇÃO EM NUVEM (SUPABASE)
// ============================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

/**
 * Carrega todos os dados do jogador a partir do Supabase.
 * Se o jogador não existir no Supabase, retorna null para que os dados locais sejam migrados.
 */
export async function loadPlayerDataFromSupabase(walletAddress) {
  if (!isSupabaseConfigured || !supabase || !walletAddress) return null;

  try {
    // 1. Busca perfil do jogador
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .maybeSingle();

    if (profileErr) {
      console.warn('[Supabase] Erro ao buscar perfil:', profileErr.message);
      return null;
    }

    if (!profile) return null; // Jogador novo, precisa de migração inicial

    // 2. Busca lista de heróis
    const { data: heroes, error: heroesErr } = await supabase
      .from('user_heroes')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('order_index', { ascending: true });

    if (heroesErr) {
      console.warn('[Supabase] Erro ao buscar heróis:', heroesErr.message);
    }

    // 3. Busca inventário e baús
    const { data: inventory, error: invErr } = await supabase
      .from('user_inventory')
      .select('*')
      .eq('wallet_address', walletAddress)
      .maybeSingle();

    if (invErr) {
      console.warn('[Supabase] Erro ao buscar inventário:', invErr.message);
    }

    // 4. Mapeia heróis para o formato interno do jogo
    const mappedHeroes = (heroes || []).map(h => ({
      id: h.id,
      heroId: h.hero_id,
      classId: h.class_id,
      name: h.name,
      rarity: h.rarity,
      rarityName: h.rarity_name,
      power: Number(h.power),
      speed: Number(h.speed),
      durability: Number(h.durability),
      currentStamina: Number(h.current_stamina),
      maxStamina: Number(h.max_stamina),
      currentHealth: Number(h.current_health),
      maxHealth: Number(h.max_health),
      status: h.status,
      weaponId: h.weapon_id,
      equippedGear: h.equipped_gear || {},
      coinsPerHour: Number(h.coins_per_hour)
    }));

    return {
      profile: {
        walletAddress: profile.wallet_address,
        playerName: profile.player_name,
        playerAvatar: profile.player_avatar,
        mncBalance: Number(profile.mnc_balance),
        usdtBalance: Number(profile.usdt_balance),
        totalInvested: Number(profile.total_invested),
        studioRevenue: Number(profile.studio_revenue),
        currentHouseId: profile.current_house_id
      },
      heroes: mappedHeroes.length > 0 ? mappedHeroes : null,
      inventory: inventory ? {
        inventoryChests: inventory.inventory_chests || [],
        purchasedChests: inventory.purchased_chests || [],
        gearStash: inventory.gear_stash || [],
        constructionChests: inventory.construction_chests || [],
        constructionFragments: Number(inventory.construction_fragments || 0)
      } : null
    };
  } catch (err) {
    console.warn('[Supabase] Falha de conexão ao carregar dados:', err);
    return null;
  }
}

/**
 * Sincroniza o perfil do jogador no Supabase
 */
export async function syncProfileToSupabase(walletAddress, data) {
  if (!isSupabaseConfigured || !supabase || !walletAddress) return;

  try {
    const payload = {
      wallet_address: walletAddress,
      player_name: data.playerName || 'Comandante das Minas',
      player_avatar: data.playerAvatar || 'bomb_bot',
      mnc_balance: data.mncBalance !== undefined ? Number(data.mncBalance) : 50,
      usdt_balance: data.usdtBalance !== undefined ? Number(data.usdtBalance) : 100,
      total_invested: data.totalInvested !== undefined ? Number(data.totalInvested) : 0,
      studio_revenue: data.studioRevenue !== undefined ? Number(data.studioRevenue) : 0,
      current_house_id: data.currentHouseId || 'tiny',
      last_login_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'wallet_address' });

    if (error) {
      console.warn('[Supabase] Erro ao sincronizar perfil:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase] Falha ao sincronizar perfil:', err);
  }
}

/**
 * Sincroniza a lista de heróis do jogador no Supabase
 */
export async function syncHeroesToSupabase(walletAddress, heroes = []) {
  if (!isSupabaseConfigured || !supabase || !walletAddress || !heroes.length) return;

  try {
    const records = heroes.map((h, idx) => ({
      id: h.id || `hero_${idx}_${Date.now()}`,
      wallet_address: walletAddress,
      hero_id: h.heroId || h.classId || 'verdant',
      class_id: h.classId || 'explorer',
      name: h.name || 'Sobrevivente',
      rarity: h.rarity || 'common',
      rarity_name: h.rarityName || 'Comum',
      power: Number(h.power || 1),
      speed: Number(h.speed || 1),
      durability: Number(h.durability !== undefined ? h.durability : 100),
      current_stamina: Number(h.currentStamina !== undefined ? h.currentStamina : 100),
      max_stamina: Number(h.maxStamina || 100),
      current_health: Number(h.currentHealth !== undefined ? h.currentHealth : 100),
      max_health: Number(h.maxHealth || 100),
      status: h.status || 'work',
      weapon_id: h.weaponId || null,
      equipped_gear: h.equippedGear || {},
      coins_per_hour: Number(h.coinsPerHour || 1.4),
      order_index: idx
    }));

    const { error } = await supabase
      .from('user_heroes')
      .upsert(records, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] Erro ao sincronizar heróis:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase] Falha ao sincronizar heróis:', err);
  }
}

/**
 * Sincroniza o inventário e baús do jogador
 */
export async function syncInventoryToSupabase(walletAddress, invData = {}) {
  if (!isSupabaseConfigured || !supabase || !walletAddress) return;

  try {
    const payload = {
      wallet_address: walletAddress,
      inventory_chests: invData.inventoryChests || [],
      purchased_chests: invData.purchasedChests || [],
      gear_stash: invData.gearStash || [],
      construction_chests: invData.constructionChests || [],
      construction_fragments: Number(invData.constructionFragments || 0)
    };

    const { error } = await supabase
      .from('user_inventory')
      .upsert(payload, { onConflict: 'wallet_address' });

    if (error) {
      console.warn('[Supabase] Erro ao sincronizar inventário:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase] Falha ao sincronizar inventário:', err);
  }
}

/**
 * Registra uma transação financeira ou de jogo no Supabase
 */
export async function logTransactionToSupabase(walletAddress, tx) {
  if (!isSupabaseConfigured || !supabase || !walletAddress || !tx) return;

  try {
    const payload = {
      wallet_address: walletAddress,
      type: tx.type || 'generic',
      amount_mnc: Number(tx.amountMnc || 0),
      net_usdt: Number(tx.netUsdt || 0),
      tax_pct: Number(tx.taxPct || 0),
      details: tx.details || {},
      status: tx.status || 'completed'
    };

    const { error } = await supabase
      .from('transactions')
      .insert([payload]);

    if (error) {
      console.warn('[Supabase] Erro ao registrar transação:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase] Falha ao registrar transação:', err);
  }
}
