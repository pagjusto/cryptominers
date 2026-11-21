/**
 * CRYPTOZOMBIES — GERENCIADOR DE AGENDAMENTO DIÁRIO DO BOSS
 * 
 * Regra Oficial do Usuário:
 * "dinamica do boss, aparecem só 2x por dia em horarios randomizados"
 * 
 * - O Boss aparece estritamente 2 vezes por dia em horários aleatórios pré-sorteados para cada dia.
 * - 1ª Aparição sorteada na primeira metade do dia (manhã/tarde).
 * - 2ª Aparição sorteada na segunda metade do dia (tarde/noite).
 * - Duração máxima de cada invasão: até ser derrotado pela equipe (ou até 30 minutos se ignorado).
 * - Fora dos 2 horários, o Boss permanece recolhido e o contador exibe a contagem regressiva para a próxima aparição.
 */

const STORAGE_KEY = 'cryptozombies_boss_daily_schedule';

// Retorna data formatada local YYYY-MM-DD
export function getLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Gera 2 horários aleatórios espaçados para o dia indicado:
 * Evento 1: Entre 08:00 e 13:59 (janela matutina/vespertina)
 * Evento 2: Entre 16:00 e 22:59 (janela noturna)
 */
export function generateDailyBossEvents(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);

  // Sorteia minutos aleatórios para a primeira aparição (08:00 a 13:59)
  const h1 = 8 + Math.floor(Math.random() * 6); // 8, 9, 10, 11, 12, 13
  const min1 = Math.floor(Math.random() * 60);
  const time1 = new Date(y, m - 1, d, h1, min1, 0, 0);

  // Sorteia minutos aleatórios para a segunda aparição (16:00 a 22:59)
  const h2 = 16 + Math.floor(Math.random() * 7); // 16, 17, 18, 19, 20, 21, 22
  const min2 = Math.floor(Math.random() * 60);
  const time2 = new Date(y, m - 1, d, h2, min2, 0, 0);

  const pad = n => String(n).padStart(2, '0');

  return [
    {
      id: `boss_${dateStr}_1`,
      slotIndex: 1,
      timeStr: `${pad(h1)}:${pad(min1)}`,
      startTime: time1.getTime(),
      durationMinutes: 45, // Janela de invasão ativa de 45 minutos (ou até morrer)
      status: 'pending' // 'pending' | 'active' | 'defeated' | 'expired'
    },
    {
      id: `boss_${dateStr}_2`,
      slotIndex: 2,
      timeStr: `${pad(h2)}:${pad(min2)}`,
      startTime: time2.getTime(),
      durationMinutes: 45,
      status: 'pending'
    }
  ];
}

/**
 * Obtém ou inicializa a agenda oficial do dia
 */
export function getTodayBossSchedule(now = new Date()) {
  const todayStr = getLocalDateString(now);

  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.date === todayStr && Array.isArray(parsed.events) && parsed.events.length === 2) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao ler agenda do boss:', e);
    }
  }

  // Gera nova agenda para hoje
  const newSchedule = {
    date: todayStr,
    createdAt: new Date().toISOString(),
    events: generateDailyBossEvents(todayStr)
  };

  saveBossSchedule(newSchedule);
  return newSchedule;
}

export function saveBossSchedule(schedule) {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
    } catch (e) {
      console.warn('Erro ao salvar agenda do boss:', e);
    }
  }
}

/**
 * Avalia o estado da agenda no instante `now`:
 * Retorna se o Boss deve estar ativo agora, qual o evento atual e qual o próximo.
 */
export function evaluateBossSchedule(now = new Date(), schedule = null) {
  const currentSchedule = schedule || getTodayBossSchedule(now);
  const nowMs = now.getTime();

  let activeEvent = null;
  let nextUpcomingEvent = null;
  let defeatedCount = 0;

  for (const ev of currentSchedule.events) {
    const endMs = ev.startTime + ev.durationMinutes * 60 * 1000;

    if (ev.status === 'defeated') {
      defeatedCount++;
      continue;
    }

    // Se está dentro da janela de invasão
    if (nowMs >= ev.startTime && nowMs <= endMs) {
      activeEvent = ev;
    } else if (nowMs > endMs) {
      // Expirou sem ser derrotado
      ev.status = 'expired';
    } else if (nowMs < ev.startTime) {
      if (!nextUpcomingEvent || ev.startTime < nextUpcomingEvent.startTime) {
        nextUpcomingEvent = ev;
      }
    }
  }

  // Se não há próximo evento hoje, projeta o 1º de amanhã
  let countdownMs = 0;
  let countdownText = '--:--:--';
  let nextEventTimeStr = '';

  if (nextUpcomingEvent) {
    countdownMs = Math.max(0, nextUpcomingEvent.startTime - nowMs);
    nextEventTimeStr = nextUpcomingEvent.timeStr;
  } else {
    // Todos os eventos de hoje terminaram; calcula para o dia seguinte
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getLocalDateString(tomorrow);
    const tomorrowEvents = generateDailyBossEvents(tomorrowStr);
    const nextEv = tomorrowEvents[0];
    countdownMs = Math.max(0, nextEv.startTime - nowMs);
    nextEventTimeStr = `Amanhã ${nextEv.timeStr}`;
  }

  const hours = Math.floor(countdownMs / (1000 * 60 * 60));
  const minutes = Math.floor((countdownMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countdownMs % (1000 * 60)) / 1000);
  const pad = n => String(n).padStart(2, '0');
  countdownText = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return {
    isBossActiveNow: !!activeEvent,
    activeEvent,
    nextUpcomingEvent,
    nextEventTimeStr,
    countdownMs,
    countdownText,
    defeatedCount,
    totalDailyEvents: 2,
    schedule: currentSchedule
  };
}

/**
 * Marca o evento ativo como derrotado pela equipe
 */
export function recordBossDefeatInSchedule(now = new Date()) {
  const schedule = getTodayBossSchedule(now);
  const nowMs = now.getTime();

  let modified = false;
  for (const ev of schedule.events) {
    const endMs = ev.startTime + ev.durationMinutes * 60 * 1000;
    if (nowMs >= ev.startTime && nowMs <= endMs && ev.status !== 'defeated') {
      ev.status = 'defeated';
      ev.defeatedAt = new Date().toISOString();
      modified = true;
      break;
    }
  }

  // Se foi uma ativação manual de teste fora de horário
  if (!modified && schedule.events.length > 0) {
    const pending = schedule.events.find(e => e.status === 'pending');
    if (pending) {
      pending.status = 'defeated';
      pending.defeatedAt = new Date().toISOString();
      modified = true;
    }
  }

  if (modified) {
    saveBossSchedule(schedule);
  }
  return schedule;
}

/**
 * Força a ativação de uma janela de invasão agora para testes instantâneos (30 minutos)
 */
export function forceBossInvasionNow(durationMinutes = 30) {
  const now = new Date();
  const schedule = getTodayBossSchedule(now);
  const nowMs = now.getTime();

  // Transforma o primeiro evento pendente em ativo agora
  let target = schedule.events.find(e => e.status !== 'defeated') || schedule.events[0];
  target.startTime = nowMs;
  target.durationMinutes = durationMinutes;
  target.status = 'active';
  const pad = n => String(n).padStart(2, '0');
  target.timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  saveBossSchedule(schedule);
  return evaluateBossSchedule(now, schedule);
}
