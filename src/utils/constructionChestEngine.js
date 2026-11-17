// CRIPTO MYNERS — BAÚ DE CONSTRUÇÃO POR BOSS DERROTADO
// - Um sorteio individual por jogador a cada Boss derrotado
// - Chance-base de 15% por sobrevivente participante, multiplicada pela raridade
// - Multiplicadores: Comum 1x, Raro 1,5x, Épico 2x, Lendário 3x
// - Soma das contribuições limitada ao teto máximo de 40% por Boss e por jogador
// - Limite diário por jogador de no máximo 3 Baús de Construção por dia
// - Renovação diária à meia-noite no horário de Brasília (America/Sao_Paulo)
// - Recebimento automático no inventário sem necessidade de clicar no mapa
// - Cada Baú de Construção entrega exatamente 1 Fragmento de Construção (usado na evolução das casas)
// - Registro de auditoria administrativa e proteção contra duplicação/fraudes

export const DEFAULT_CONSTRUCTION_CHEST_CONFIG = {
  enabled: true,
  baseRateCommonPct: 2, // Comum: 2% por sobrevivente; demais raridades usam multiplicadores oficiais
  rarityMultipliers: {
    common: 1.0,              // 2,00% por sobrevivente
    rare: 1.1,                // 2,20% por sobrevivente
    epic: 1.1666666666666667, // 2,333333...% por sobrevivente
    legendary: 1.3333333333333333 // 2,666666...% por sobrevivente
  },
  maxAccountChanceCapPct: 40.0, // Teto absoluto de 40% por Boss e por jogador
  cycleDurationSeconds: 0,      // Sem ciclo horário; sorteio a cada Boss derrotado
  dailyLimitPerPlayer: 3,       // Máximo de 3 baús por dia
  timezone: 'America/Sao_Paulo',// Horário oficial de Brasília
  rewardFragmentCount: 1        // Exatamente 1 Fragmento de Construção por baú
};

const DAILY_STORAGE_KEY = 'cripto_myners_construction_daily_v1';
const CHESTS_STORAGE_KEY = 'cripto_myners_construction_chests_v1';
const FRAGMENTS_STORAGE_KEY = 'cripto_myners_construction_fragments_v1';
const HISTORY_STORAGE_KEY = 'cripto_myners_construction_history_v1';
const AUDIT_STORAGE_KEY = 'cripto_myners_construction_audit_v1';

/**
 * Retorna a data atual no fuso horário oficial de Brasília (America/Sao_Paulo) no formato YYYY-MM-DD
 */
export function getBrasiliaDateString(date = new Date()) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}

/**
 * Retorna a hora atual de Brasília formatada para logs de auditoria
 */
export function getBrasiliaTimeString(date = new Date()) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'medium'
    }).format(date);
  } catch {
    return new Date(date).toLocaleString('pt-BR');
  }
}

/**
 * Normaliza a raridade de um herói para as 4 oficiais: common, rare, epic, legendary
 */
export function normalizeHeroRarity(hero) {
  const r = (hero.rarity || hero.classInfo?.rarity || 'common').toLowerCase();
  if (r.includes('legendary') || r.includes('lend')) return 'legendary';
  if (r.includes('epic') || r.includes('épico') || r.includes('epico')) return 'epic';
  if (r.includes('super') || r.includes('rare') || r.includes('raro')) return 'rare';
  return 'common';
}

/**
 * Calcula a probabilidade de aparição com base EXCLUSIVAMENTE nos sobreviventes em combate ativo
 * Sobreviventes feridos, em tratamento, na fila ou na reserva NÃO participam do cálculo
 */
export function calculateActiveMinersChance(miners = [], config = DEFAULT_CONSTRUCTION_CHEST_CONFIG) {
  const baseRate = typeof config.baseRateCommonPct === 'number' ? config.baseRateCommonPct : DEFAULT_CONSTRUCTION_CHEST_CONFIG.baseRateCommonPct;
  const multipliers = config.rarityMultipliers || DEFAULT_CONSTRUCTION_CHEST_CONFIG.rarityMultipliers;
  const maxCap = config.maxAccountChanceCapPct ?? DEFAULT_CONSTRUCTION_CHEST_CONFIG.maxAccountChanceCapPct;

  // Somente sobreviventes realmente em combate participam do cálculo.
  // Feridos, fila do abrigo, reservas e personagens pausados não geram Baú de Construção.
  const activeMiners = miners.filter(m => m.status === 'work' && (m.currentHealth ?? 100) > 5);

  const breakdownByRarity = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0
  };

  const contributions = activeMiners.map(m => {
    const rarity = normalizeHeroRarity(m);
    breakdownByRarity[rarity] = (breakdownByRarity[rarity] || 0) + 1;
    const mult = multipliers[rarity] || 1.0;
    const individualChance = baseRate * mult;
    return {
      heroId: m.id,
      name: m.name,
      rarity,
      mult,
      chance: individualChance
    };
  });

  const rawTotalChance = contributions.reduce((acc, curr) => acc + curr.chance, 0);
  const finalChance = Math.min(maxCap, rawTotalChance);
  const isCapped = rawTotalChance > maxCap;

  return {
    activeMinersCount: activeMiners.length,
    activeMiners,
    contributions,
    breakdownByRarity,
    baseRateCommonPct: baseRate,
    rawTotalChance,
    finalChance,
    isCapped,
    maxCap
  };
}

/**
 * Lê o controle diário de Baús de Construção (renovado à meia-noite de Brasília)
 */
export function getDailyConstructionStats() {
  if (typeof window === 'undefined') {
    return { date: getBrasiliaDateString(), chestsAwardedToday: 0, dailyLimit: 3 };
  }

  const todayBrasilia = getBrasiliaDateString();

  try {
    const raw = localStorage.getItem(DAILY_STORAGE_KEY);
    if (!raw) {
      const initial = {
        date: todayBrasilia,
        chestsAwardedToday: 0,
        dailyLimit: 3,
        lastResetTime: Date.now()
      };
      localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    const parsed = JSON.parse(raw);

    // Se a data mudou (passou da meia-noite no horário de Brasília), reseta o contador diário
    if (parsed.date !== todayBrasilia) {
      const resetState = {
        date: todayBrasilia,
        chestsAwardedToday: 0,
        dailyLimit: parsed.dailyLimit || 3,
        lastResetTime: Date.now()
      };
      localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(resetState));
      return resetState;
    }

    return parsed;
  } catch (e) {
    console.warn('Erro ao carregar daily construction stats:', e);
    return { date: todayBrasilia, chestsAwardedToday: 0, dailyLimit: 3 };
  }
}

/**
 * Incrementa o número de baús recebidos hoje
 */
export function incrementDailyConstructionChests() {
  if (typeof window === 'undefined') return;
  const current = getDailyConstructionStats();
  const next = {
    ...current,
    chestsAwardedToday: current.chestsAwardedToday + 1
  };
  localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(next));
  return next;
}

/**
 * Carrega a lista de Baús de Construção guardados no inventário do jogador
 */
export function getStoredConstructionChests() {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(CHESTS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Salva a lista de Baús de Construção do inventário
 */
export function saveStoredConstructionChests(chests) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CHESTS_STORAGE_KEY, JSON.stringify(chests));
}

/**
 * Carrega o saldo de Fragmentos de Construção da conta
 */
export function getStoredConstructionFragments() {
  if (typeof window === 'undefined') return 0;
  try {
    const saved = localStorage.getItem(FRAGMENTS_STORAGE_KEY);
    return saved ? parseInt(saved, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

/**
 * Salva o saldo de Fragmentos de Construção da conta
 */
export function saveStoredConstructionFragments(count) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FRAGMENTS_STORAGE_KEY, Math.max(0, count).toString());
}

/**
 * Carrega o histórico de aparições e sorteios dos Baús de Construção
 */
export function getConstructionHistory() {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Adiciona um evento ao histórico de aparições
 */
export function addConstructionHistoryEntry(entry) {
  if (typeof window === 'undefined') return;
  try {
    const history = getConstructionHistory();
    const updated = [entry, ...history.slice(0, 99)]; // Mantém os últimos 100 registros
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Erro ao salvar histórico de baús de construção:', e);
  }
}

/**
 * Carrega o log de auditoria de alterações administrativas
 */
export function getConstructionAuditLog() {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(AUDIT_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Registra uma alteração no log de auditoria administrativa
 */
export function logConstructionAudit(action, details, adminName = 'Administrador do Sistema') {
  if (typeof window === 'undefined') return;
  try {
    const auditLog = getConstructionAuditLog();
    const newEntry = {
      id: `AUDIT-${Date.now().toString(36).toUpperCase()}`,
      timestamp: getBrasiliaTimeString(),
      action,
      details,
      adminName
    };
    const updated = [newEntry, ...auditLog.slice(0, 99)];
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Erro ao salvar auditoria:', e);
  }
}

/**
 * Executa o sorteio individual após a derrota de um Boss.
 * Aplica o teto de 40%, limite diário de 3 e considera somente participantes ativos.
 */
export function executeConstructionBossRoll(miners = [], config = DEFAULT_CONSTRUCTION_CHEST_CONFIG, options = {}) {
  const { isSimulated = false, forceSuccess = false } = options;

  // 1. Verifica se o sistema está habilitado
  if (config.enabled === false && !isSimulated) {
    return {
      success: false,
      reason: 'system_disabled',
      message: 'Sistema de Baús de Construção desativado nas configurações administrativas.'
    };
  }

  // 2. Calcula probabilidade dos heróis ativos
  const activeChance = calculateActiveMinersChance(miners, config);

  if (activeChance.activeMinersCount === 0) {
    return {
      success: false,
      reason: 'no_active_miners',
      message: 'Nenhum sobrevivente ativo participou do combate contra o Boss.',
      activeChance
    };
  }

  // 3. Verifica limite diário
  const dailyStats = getDailyConstructionStats();
  const dailyLimit = config.dailyLimitPerPlayer || 3;

  if (dailyStats.chestsAwardedToday >= dailyLimit) {
    const event = {
      id: `EVT-${Date.now().toString(36).toUpperCase()}`,
      timestamp: getBrasiliaTimeString(),
      type: 'DAILY_LIMIT_REACHED',
      chestsAwardedToday: dailyStats.chestsAwardedToday,
      dailyLimit,
      activeMinersCount: activeChance.activeMinersCount,
      finalChance: activeChance.finalChance,
      result: 'REJEITADO (Limite diário atingido: 3/3)'
    };
    if (!isSimulated) {
      addConstructionHistoryEntry(event);
    }
    return {
      success: false,
      reason: 'daily_limit_reached',
      message: `Limite diário de Baús de Construção atingido (${dailyStats.chestsAwardedToday}/${dailyLimit}). Renovação à meia-noite de Brasília.`,
      dailyStats,
      activeChance
    };
  }

  // 4. Executa o sorteio do Boss com chance efetiva limitada a 40%.
  const roll = parseFloat((Math.random() * 100).toFixed(4));
  const won = forceSuccess || roll <= activeChance.finalChance;

  if (won) {
    // Gerar Baú de Construção único
    const chestId = `CBC-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const newChest = {
      id: chestId,
      name: 'Baú de Construção',
      icon: '🧱',
      color: '#f59e0b',
      tagline: 'Material Raro de Expansão',
      description: 'Baú especial obtido durante a combate ativo. Contém exatamente 1 Fragmento de Construção para evolução de casas.',
      foundAt: getBrasiliaTimeString(),
      foundDateBrasilia: dailyStats.date,
      rewardFragmentCount: 1,
      opened: false,
      activeMinersCount: activeChance.activeMinersCount,
      rarityDistribution: activeChance.breakdownByRarity,
      chanceApplied: activeChance.finalChance,
      rollResult: roll
    };

    if (!isSimulated) {
      // 1. Atualiza limite diário
      incrementDailyConstructionChests();

      // 2. Adiciona o baú ao inventário
      const currentStoredChests = getStoredConstructionChests();
      saveStoredConstructionChests([newChest, ...currentStoredChests]);

      // 3. Registra no histórico oficial
      addConstructionHistoryEntry({
        id: newChest.id,
        timestamp: newChest.foundAt,
        type: 'CHEST_FOUND',
        activeMinersCount: activeChance.activeMinersCount,
        breakdownByRarity: activeChance.breakdownByRarity,
        chanceApplied: activeChance.finalChance,
        isCapped: activeChance.isCapped,
        roll,
        result: 'SUCESSO: Baú de Construção concedido ao inventário'
      });

      // 4. Notifica a aplicação para abrir o modal de celebração
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cripto_myners_construction_chest_awarded', { detail: newChest }));
      }
    }

    return {
      success: true,
      won: true,
      chest: newChest,
      roll,
      activeChance,
      dailyStats: {
        ...dailyStats,
        chestsAwardedToday: dailyStats.chestsAwardedToday + (isSimulated ? 0 : 1)
      }
    };
  } else {
    // Sorteio do Boss não premiado
    if (!isSimulated) {
      addConstructionHistoryEntry({
        id: `TRY-${Date.now().toString(36).toUpperCase()}`,
        timestamp: getBrasiliaTimeString(),
        type: 'BOSS_CHEST_MISSED',
        activeMinersCount: activeChance.activeMinersCount,
        breakdownByRarity: activeChance.breakdownByRarity,
        chanceApplied: activeChance.finalChance,
        isCapped: activeChance.isCapped,
        roll,
        result: `Não premiado (Sorteio: ${roll}% > Chance: ${activeChance.finalChance}%)`
      });
    }

    return {
      success: true,
      won: false,
      roll,
      activeChance,
      dailyStats
    };
  }
}

// Alias temporário para compatibilidade com chamadas antigas do painel.
export const executeConstructionCycleRoll = executeConstructionBossRoll;

/**
 * Abre um Baú de Construção do inventário de forma idempotente e segura
 * Cada baú entrega exatamente 1 Fragmento de Construção.
 */
export function openConstructionChestById(chestId) {
  if (typeof window === 'undefined') return { success: false, message: 'Janela indisponível' };

  const chests = getStoredConstructionChests();
  const targetIndex = chests.findIndex(c => c.id === chestId);

  if (targetIndex === -1) {
    return { success: false, message: 'Baú de Construção não encontrado no inventário.' };
  }

  const targetChest = chests[targetIndex];
  if (targetChest.opened) {
    return { success: false, message: 'Este Baú de Construção já foi aberto anteriormente.' };
  }

  // Remove o baú do inventário ou marca como aberto
  const updatedChests = chests.filter(c => c.id !== chestId);
  saveStoredConstructionChests(updatedChests);

  // Adiciona exatamente 1 Fragmento de Construção
  const currentFragments = getStoredConstructionFragments();
  const nextFragments = currentFragments + 1;
  saveStoredConstructionFragments(nextFragments);

  // Registra no histórico
  addConstructionHistoryEntry({
    id: `OPEN-${Date.now().toString(36).toUpperCase()}`,
    timestamp: getBrasiliaTimeString(),
    type: 'CHEST_OPENED',
    chestId,
    fragmentsGranted: 1,
    result: `Baú de Construção aberto: +1 Fragmento de Construção (Total: ${nextFragments})`
  });

  return {
    success: true,
    chestId,
    fragmentCountAdded: 1,
    totalFragments: nextFragments,
    updatedChests
  };
}

/**
 * Retorna estatísticas consolidadas para o painel administrativo
 */
export function getConstructionAdminSummary(config = DEFAULT_CONSTRUCTION_CHEST_CONFIG) {
  const dailyStats = getDailyConstructionStats();
  const storedChests = getStoredConstructionChests();
  const totalFragments = getStoredConstructionFragments();
  const history = getConstructionHistory();
  const auditLog = getConstructionAuditLog();

  const totalChestsFoundHistorical = history.filter(h => h.type === 'CHEST_FOUND').length;
  const totalChestsOpenedHistorical = history.filter(h => h.type === 'CHEST_OPENED').length;

  return {
    enabled: config.enabled !== false,
    baseRateCommonPct: config.baseRateCommonPct ?? 15,
    rarityMultipliers: config.rarityMultipliers || DEFAULT_CONSTRUCTION_CHEST_CONFIG.rarityMultipliers,
    maxCapPct: config.maxAccountChanceCapPct ?? 40.0,
    cycleDurationSeconds: config.cycleDurationSeconds ?? 0,
    dailyLimit: config.dailyLimitPerPlayer || 3,
    chestsAwardedToday: dailyStats.chestsAwardedToday,
    remainingDailyLimit: Math.max(0, (config.dailyLimitPerPlayer || 3) - dailyStats.chestsAwardedToday),
    brasiliaDate: dailyStats.date,
    storedChestsInInventoryCount: storedChests.length,
    totalFragmentsBalance: totalFragments,
    totalChestsFoundHistorical,
    totalChestsOpenedHistorical,
    history,
    auditLog
  };
}
