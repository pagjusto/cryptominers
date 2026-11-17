import React, { useEffect, useMemo, useRef, useState } from 'react';

const COLS = 15;
const ROWS = 11;
const ACTIVE_LIMIT = 15;
const INJURY_THRESHOLD_PCT = 5;

// Valores provisórios de demonstração visual. Balanceamento definitivo ainda não foi aprovado.
export const ZOMBIE_DEMO_CONFIG = {
  survivorDamage: 20,
  zombieDamage: 8,
  survivorAttackCooldownMs: 900,
  zombieAttackCooldownMs: 1500,
  baseFullRecoveryMinutes: 240,
  initialZombieCount: 14
};

const WALLS = new Set([
  '2,1','3,1','4,1','10,1','11,1','12,1',
  '2,2','4,2','10,2','12,2',
  '2,3','3,3','4,3','10,3','11,3','12,3',
  '1,7','2,7','3,7','11,7','12,7','13,7',
  '1,8','3,8','11,8','13,8',
  '1,9','2,9','3,9','11,9','12,9','13,9'
]);

function createWave(wave = 1) {
  const count = Math.min(30, ZOMBIE_DEMO_CONFIG.initialZombieCount + (wave - 1) * 2);
  return Array.from({ length: count }, (_, i) => ({
    id: `zombie-${wave}-${i}`,
    x: 1 + ((i * 7 + 2) % (COLS - 2)),
    y: 1 + ((i * 5 + 1) % (ROWS - 2)),
    hp: 100 + (wave - 1) * 10,
    maxHp: 100 + (wave - 1) * 10,
    attackCooldown: 0
  }));
}

function normalizeSurvivor(survivor, index) {
  const maxHealth = survivor.maxHealth || 100;
  const wasInShelter = survivor.status === 'house' || survivor.status === 'waiting_house';
  return {
    ...survivor,
    maxHealth,
    currentHealth: Number.isFinite(survivor.currentHealth)
      ? Math.min(maxHealth, survivor.currentHealth)
      : (wasInShelter ? 5 : maxHealth),
    x: Number.isFinite(survivor.x) ? survivor.x : 2 + (index % 4),
    y: Number.isFinite(survivor.y) ? survivor.y : 4 + (Math.floor(index / 4) % 3),
    status: survivor.status || 'reserve',
    attackCooldown: survivor.attackCooldown || 0
  };
}

function recoverOffline(survivors, house, elapsedMs) {
  const rate = (house?.recoverySpeedPct || 100) / 100;
  const healedPct = (elapsedMs / 60000) * (100 / ZOMBIE_DEMO_CONFIG.baseFullRecoveryMinutes) * rate;
  return survivors.map(s => {
    if (s.status !== 'house') return s;
    const currentHealth = Math.min(s.maxHealth, s.currentHealth + (s.maxHealth * healedPct / 100));
    return currentHealth >= s.maxHealth
      ? { ...s, currentHealth: s.maxHealth, status: 'reserve' }
      : { ...s, currentHealth };
  });
}

function promoteReserves(survivors, capacity) {
  const next = survivors.map(s => ({ ...s }));
  const activeCount = next.filter(s => s.status === 'work').length;
  const available = Math.max(0, ACTIVE_LIMIT - activeCount);
  const candidates = next
    .filter(s => s.status === 'reserve' && s.currentHealth > INJURY_THRESHOLD_PCT)
    .sort((a, b) => (b.power || 0) - (a.power || 0) || (b.speed || 0) - (a.speed || 0));
  candidates.slice(0, available).forEach(candidate => {
    const target = next.find(s => s.id === candidate.id);
    if (target) target.status = 'work';
  });

  const occupied = next.filter(s => s.status === 'house').length;
  let beds = Math.max(0, capacity - occupied);
  next.forEach(s => {
    if (s.status === 'waiting_house' && beds > 0) {
      s.status = 'house';
      beds -= 1;
    }
  });
  return next;
}

export default function ZombieSurvivalBoard({ survivors = [], onSurvivorsChange, house, onOpenShelter }) {
  const [zombies, setZombies] = useState(() => createWave(1));
  const [wave, setWave] = useState(1);
  const [combatEnabled, setCombatEnabled] = useState(true);
  const survivorsRef = useRef(survivors);
  const zombiesRef = useRef(zombies);
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    const last = Number(localStorage.getItem('cripto_myners_last_recovery_at') || now);
    const normalized = survivors.map(normalizeSurvivor);
    const recovered = recoverOffline(normalized, house, Math.max(0, now - last));
    survivorsRef.current = promoteReserves(recovered, house?.slots || 0);
    onSurvivorsChange(survivorsRef.current);
    lastTickRef.current = now;
    localStorage.setItem('cripto_myners_last_recovery_at', String(now));
    // Recovery is deliberately calculated from timestamps so shelter treatment continues while the tab is closed.
    // This is client-side demo persistence only; production must move timestamps and healing to the server.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { survivorsRef.current = survivors; }, [survivors]);
  useEffect(() => { zombiesRef.current = zombies; }, [zombies]);

  useEffect(() => {
    if (!combatEnabled) return undefined;
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.min(5000, Math.max(0, now - lastTickRef.current));
      lastTickRef.current = now;
      localStorage.setItem('cripto_myners_last_recovery_at', String(now));

      let nextSurvivors = recoverOffline(
        survivorsRef.current.map(s => ({ ...s })),
        house,
        elapsed
      );
      nextSurvivors = promoteReserves(nextSurvivors, house?.slots || 0);
      let nextZombies = zombiesRef.current.map(z => ({ ...z }));

      nextSurvivors = nextSurvivors.map(s => {
        if (s.status !== 'work') return s;
        const aliveZombies = nextZombies.filter(z => z.hp > 0);
        if (!aliveZombies.length) return s;
        const target = aliveZombies.sort((a, b) =>
          (Math.abs(a.x - s.x) + Math.abs(a.y - s.y)) -
          (Math.abs(b.x - s.x) + Math.abs(b.y - s.y))
        )[0];
        const distance = Math.abs(target.x - s.x) + Math.abs(target.y - s.y);
        let updated = { ...s, attackCooldown: Math.max(0, (s.attackCooldown || 0) - elapsed) };
        if (distance <= 1) {
          if (updated.attackCooldown <= 0) {
            nextZombies = nextZombies.map(z => z.id === target.id
              ? { ...z, hp: Math.max(0, z.hp - ZOMBIE_DEMO_CONFIG.survivorDamage) }
              : z);
            updated.attackCooldown = ZOMBIE_DEMO_CONFIG.survivorAttackCooldownMs;
          }
        } else {
          const dx = Math.sign(target.x - s.x);
          const dy = Math.sign(target.y - s.y);
          const tryX = { x: s.x + dx, y: s.y };
          const tryY = { x: s.x, y: s.y + dy };
          const canMove = p => p.x > 0 && p.x < COLS - 1 && p.y > 0 && p.y < ROWS - 1 &&
            !WALLS.has(`${p.x},${p.y}`) &&
            !nextZombies.some(z => z.hp > 0 && z.x === p.x && z.y === p.y);
          const step = canMove(tryX) ? tryX : (canMove(tryY) ? tryY : null);
          if (step) updated = { ...updated, ...step };
        }
        return updated;
      });

      nextZombies = nextZombies.map(z => {
        if (z.hp <= 0) return z;
        const active = nextSurvivors.filter(s => s.status === 'work' && s.currentHealth > 5);
        if (!active.length) return z;
        const target = active.sort((a, b) =>
          (Math.abs(a.x - z.x) + Math.abs(a.y - z.y)) -
          (Math.abs(b.x - z.x) + Math.abs(b.y - z.y))
        )[0];
        const distance = Math.abs(target.x - z.x) + Math.abs(target.y - z.y);
        const cooldown = Math.max(0, (z.attackCooldown || 0) - elapsed);
        if (distance <= 1) {
          if (cooldown <= 0) {
            nextSurvivors = nextSurvivors.map(s => {
              if (s.id !== target.id) return s;
              const currentHealth = Math.max(0, s.currentHealth - ZOMBIE_DEMO_CONFIG.zombieDamage);
              if ((currentHealth / s.maxHealth) * 100 <= INJURY_THRESHOLD_PCT) {
                return { ...s, currentHealth: Math.max(0, currentHealth), status: 'waiting_house', attackCooldown: 0 };
              }
              return { ...s, currentHealth };
            });
            return { ...z, attackCooldown: ZOMBIE_DEMO_CONFIG.zombieAttackCooldownMs };
          }
          return { ...z, attackCooldown: cooldown };
        }
        const dx = Math.sign(target.x - z.x);
        const dy = Math.sign(target.y - z.y);
        const stepX = { x: z.x + dx, y: z.y };
        const stepY = { x: z.x, y: z.y + dy };
        const canMove = p => p.x > 0 && p.x < COLS - 1 && p.y > 0 && p.y < ROWS - 1 &&
          !WALLS.has(`${p.x},${p.y}`) &&
          !nextSurvivors.some(s => s.status === 'work' && s.x === p.x && s.y === p.y);
        const step = canMove(stepX) ? stepX : (canMove(stepY) ? stepY : null);
        return step ? { ...z, ...step, attackCooldown: cooldown } : { ...z, attackCooldown: cooldown };
      });

      nextSurvivors = promoteReserves(nextSurvivors, house?.slots || 0);
      survivorsRef.current = nextSurvivors;
      zombiesRef.current = nextZombies;
      onSurvivorsChange(nextSurvivors);

      if (nextZombies.every(z => z.hp <= 0)) {
        const nextWave = wave + 1;
        setWave(nextWave);
        const spawned = createWave(nextWave);
        zombiesRef.current = spawned;
        setZombies(spawned);
      } else {
        setZombies(nextZombies);
      }
    }, 900);
    return () => clearInterval(timer);
  }, [combatEnabled, house, onSurvivorsChange, wave]);

  const active = survivors.filter(s => s.status === 'work').length;
  const injured = survivors.filter(s => s.status === 'house' || s.status === 'waiting_house').length;
  const defeated = survivors.filter(s => s.currentHealth <= 0 && s.status !== 'house' && s.status !== 'waiting_house').length;
  const aliveZombies = zombies.filter(z => z.hp > 0);
  const cells = useMemo(() => Array.from({ length: COLS * ROWS }, (_, index) => ({
    x: index % COLS,
    y: Math.floor(index / COLS)
  })), []);

  return (
    <section className="w-full max-w-[760px] rounded-3xl border border-emerald-900/70 bg-slate-950 p-3 sm:p-4 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="font-arcade text-sm text-emerald-300">ZONA DE SOBREVIVÊNCIA</h2>
          <p className="text-[11px] text-slate-400">Combate automático • Onda {wave} • Modo demonstração</p>
        </div>
        <button onClick={() => setCombatEnabled(v => !v)} className="px-3 py-2 rounded-xl border border-emerald-500/40 bg-emerald-950/50 text-emerald-300 text-xs font-bold">
          {combatEnabled ? 'Pausar combate' : 'Retomar combate'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-2"><b className="text-emerald-300">{active}/15</b><span className="block text-slate-500">Em combate</span></div>
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-2"><b className="text-amber-300">{injured}/{house?.slots || 0}</b><span className="block text-slate-500">No abrigo / fila</span></div>
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-2"><b className="text-rose-300">{aliveZombies.length}</b><span className="block text-slate-500">Zumbis restantes</span></div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-[#17251f]">
        <div className="relative grid min-w-[600px]" style={{ gridTemplateColumns: `repeat(${COLS}, 40px)`, gridTemplateRows: `repeat(${ROWS}, 40px)` }}>
          {cells.map(cell => {
            const key = `${cell.x},${cell.y}`;
            const wall = WALLS.has(key);
            const road = cell.y === 5 || cell.x === 7;
            return <div key={key} className={`relative border-[0.5px] border-black/10 ${wall ? 'bg-gradient-to-br from-slate-600 to-slate-800' : road ? 'bg-[#4b5148]' : ((cell.x + cell.y) % 2 ? 'bg-[#263b30]' : 'bg-[#2d4435')}`}>
              {wall && <span className="absolute inset-0 flex items-center justify-center text-lg opacity-80">🧱</span>}
              {road && !wall && <span className="absolute inset-0 border-y border-dashed border-yellow-900/40" />}
            </div>;
          })}
          {survivors.filter(s => s.status === 'work').map(s => (
            <div key={s.id} className="absolute z-10 flex flex-col items-center justify-center" style={{ left: s.x * 40, top: s.y * 40, width: 40, height: 40 }}>
              <span className="text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]">{s.avatar || '🧑‍🚀'}</span>
              <span className="absolute bottom-0 w-8 h-1 rounded bg-slate-900 overflow-hidden"><span className="block h-full bg-emerald-400" style={{ width: `${Math.max(0, s.currentHealth / s.maxHealth * 100)}%` }} /></span>
            </div>
          ))}
          {aliveZombies.map(z => (
            <div key={z.id} className="absolute z-20 flex flex-col items-center justify-center" style={{ left: z.x * 40, top: z.y * 40, width: 40, height: 40 }}>
              <span className="text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]">🧟</span>
              <span className="absolute bottom-0 w-8 h-1 rounded bg-slate-900 overflow-hidden"><span className="block h-full bg-rose-500" style={{ width: `${Math.max(0, z.hp / z.maxHp * 100)}%` }} /></span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-slate-400">Sobreviventes feridos são enviados ao abrigo automaticamente ao atingir 5% de vida.</span>
        <button onClick={onOpenShelter} className="px-3 py-2 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-300 font-bold">Abrir abrigo</button>
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-amber-300/70">Simulação local: atributos de dano, vida e velocidade são provisórios. Recuperação offline usa horário do dispositivo; produção real exige validação no backend.</p>
    </section>
  );
}
