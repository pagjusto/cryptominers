// CRIPTO MYNERS — MOTOR DE REVEZAMENTO AUTOMÁTICO E RECUPERAÇÃO OFFLINE
// Regra Oficial 3.1: NÃO existe mineração offline. Sem conexão ativa, a produção de MNC para.
// Apenas a recuperação de energia dos personagens na casa continua offline.

export function calculateMinerEfficiency(miner) {
  if (!miner) return 0;
  const power = miner.power || 2;
  const speed = miner.speed || 1;
  const coinsPerHour = miner.coinsPerHour || (power * 0.05);
  const staminaRatio = (miner.currentStamina || 0) / (miner.maxStamina || 100);

  // Eficiência ponderada: Produção x Poder x Estamina disponível
  return (power * 1.5 + speed * 10 + coinsPerHour * 50) * Math.max(0.1, staminaRatio);
}

export function autoRelayTeam(miners, currentHouse, maxSlots = 15) {
  if (!miners || miners.length === 0) return { updatedMiners: [], events: [] };

  const houseCapacity = currentHouse?.slots || 0;
  const events = [];

  let nextMiners = miners.map(m => ({ ...m }));

  // 1. Processa os que estão na mina com estamina zerada
  nextMiners = nextMiners.map(miner => {
    if (miner.status === 'work' && (miner.currentStamina <= 0 || miner.currentStamina === undefined)) {
      events.push({
        type: 'exhausted',
        minerName: miner.name,
        message: `${miner.name} esgotou a energia e foi descansar.`
      });
      return { ...miner, currentStamina: 0, status: 'waiting_house' };
    }
    return miner;
  });

  // 2. Processa os que estavam na casa e já atingiram 100% de energia
  nextMiners = nextMiners.map(miner => {
    if (miner.status === 'house' && miner.currentStamina >= miner.maxStamina) {
      events.push({
        type: 'recovered',
        minerName: miner.name,
        message: `${miner.name} recuperou 100% da energia e foi para a reserva!`
      });
      return { ...miner, currentStamina: miner.maxStamina, status: 'reserve' };
    }
    return miner;
  });

  // 3. Gerenciamento de Vagas na Casa (Preenche camas vazias com quem está na fila de espera)
  const currentInBeds = nextMiners.filter(m => m.status === 'house').length;
  let availableBeds = Math.max(0, houseCapacity - currentInBeds);

  if (availableBeds > 0) {
    nextMiners = nextMiners.map(miner => {
      if (miner.status === 'waiting_house' && availableBeds > 0) {
        availableBeds--;
        events.push({
          type: 'entered_house',
          minerName: miner.name,
          message: `${miner.name} conseguiu uma cama na ${currentHouse?.name || 'Casa'}!`
        });
        return { ...miner, status: 'house' };
      }
      return miner;
    });
  }

  // 4. Preenchimento Inteligente das 15 Vagas da Mina
  // Conta quantos estão trabalhando
  const activeCount = nextMiners.filter(m => m.status === 'work').length;
  const neededWorkers = Math.max(0, maxSlots - activeCount);

  if (neededWorkers > 0) {
    // Candidatos a substituição: quem está na 'reserve' ou 'sleep' com estamina suficiente (> 25% da barra)
    const candidates = nextMiners
      .filter(m => (m.status === 'reserve' || m.status === 'sleep') && m.currentStamina >= (m.maxStamina * 0.25))
      .sort((a, b) => calculateMinerEfficiency(b) - calculateMinerEfficiency(a));

    const selectedIds = new Set(candidates.slice(0, neededWorkers).map(c => c.id));

    if (selectedIds.size > 0) {
      nextMiners = nextMiners.map(miner => {
        if (selectedIds.has(miner.id)) {
          events.push({
            type: 'promoted_to_mine',
            minerName: miner.name,
            message: `🔄 ${miner.name} assumiu uma vaga ativa na mina!`
          });
          return { ...miner, status: 'work' };
        }
        return miner;
      });
    }
  }

  return { updatedMiners: nextMiners, events };
}

// Cálculo Contínuo Offline de Mineração e Descanso
export function calculateOfflineProgress(miners, currentHouse, elapsedSeconds, config) {
  if (!miners || miners.length === 0 || elapsedSeconds <= 5) {
    return { updatedMiners: miners, offlineCoins: 0, offlineMinutes: 0 };
  }

  const houseRecSpeed = currentHouse?.recoverySpeedMultiplier || 0.5;
  const rate = config?.minerCoinUsdtRate || 1.0;
  const maxSlots = config?.maxActiveMiners || 15;

  let nextMiners = miners.map(m => ({ ...m }));
  let totalCoinsEarned = 0;

  // Discretizamos o tempo offline em passos de 60 segundos (até o máximo de 12 horas)
  const cappedSeconds = Math.min(12 * 3600, elapsedSeconds);
  const steps = Math.floor(cappedSeconds / 60);

  for (let s = 0; s < steps; s++) {
    // Regra Oficial 3.1: Sem conexão/sessão aberta, a produção de MNC para. Não há mineração offline.
    // Apenas a recuperação de energia na casa continua offline.

    // 2. Recuperação na casa
    const houseCapacity = currentHouse?.slots || 0;
    let bedsFree = houseCapacity - nextMiners.filter(m => m.status === 'house').length;

    // Aloca quem está na fila
    if (bedsFree > 0) {
      nextMiners = nextMiners.map(miner => {
        if (miner.status === 'waiting_house' && bedsFree > 0) {
          bedsFree--;
          return { ...miner, status: 'house' };
        }
        return miner;
      });
    }

    // Aumenta estamina
    nextMiners = nextMiners.map(miner => {
      if (miner.status === 'house' && miner.currentStamina < miner.maxStamina) {
        const recPerMin = (miner.maxStamina / 240) * houseRecSpeed;
        const nextStamina = Math.min(miner.maxStamina, miner.currentStamina + recPerMin);
        return {
          ...miner,
          currentStamina: nextStamina,
          status: nextStamina >= miner.maxStamina ? 'reserve' : 'house'
        };
      }
      return miner;
    });

    // 3. Substituições imediatas
    const activeWorkers = nextMiners.filter(m => m.status === 'work').length;
    if (activeWorkers < maxSlots) {
      const candidates = nextMiners
        .filter(m => (m.status === 'reserve' || m.status === 'sleep') && m.currentStamina >= (m.maxStamina * 0.8))
        .sort((a, b) => calculateMinerEfficiency(b) - calculateMinerEfficiency(a));

      const needed = maxSlots - activeWorkers;
      const pickIds = new Set(candidates.slice(0, needed).map(c => c.id));

      if (pickIds.size > 0) {
        nextMiners = nextMiners.map(m => pickIds.has(m.id) ? { ...m, status: 'work' } : m);
      }
    }
  }

  return {
    updatedMiners: nextMiners,
    offlineCoins: 0, // Regra Oficial: Não existe mineração offline
    offlineMinutes: Math.round(cappedSeconds / 60)
  };
}
