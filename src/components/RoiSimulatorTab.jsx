import React, { useMemo, useState } from 'react';
import {
  Calculator,
  Package,
  Users,
  Home,
  HeartPulse,
  Wrench,
  Coins,
  TrendingUp,
  Clock,
  X,
  Check,
  Sparkles,
  ChevronRight,
  Plus,
  Minus
} from 'lucide-react';
import { HERO_ROSTER, getHeroById, getRarityConfig } from '../data/heroRoster';
import { DEFAULT_CRYPTO_ZOMBIES_CONFIG } from '../data/cryptoZombiesConfig';
import { HOUSE_TIERS } from '../data/housesData';
import { STAFF_PLANS } from '../data/staffCatalog';
import { SITE_TRANSLATIONS } from '../data/siteTranslations';
import { getHeroBaseHP } from '../utils/heroHealth';

const MINING_PRODUCTION_MULTIPLIER = 1.0;

const RARITY_AVG_COINS_HOUR = {
  common: 2.60,
  rare: 4.65,
  super_rare: 5.86,
  epic: 7.07,
  legendary: 11.94,
  super_legend: 15.81
};

const RARITY_ORDER = {
  common: 0,
  rare: 1,
  super_rare: 2,
  epic: 3,
  legendary: 4,
  super_legend: 5
};

const SORTED_HERO_ROSTER = [...HERO_ROSTER].sort(
  (a, b) => (RARITY_ORDER[a.rarity] ?? 99) - (RARITY_ORDER[b.rarity] ?? 99)
);

export default function RoiSimulatorTab({ lang = 'pt' }) {
  const tr = (SITE_TRANSLATIONS[lang] || SITE_TRANSLATIONS.pt).roi;
  const chests = useMemo(
    () => Object.values(DEFAULT_CRYPTO_ZOMBIES_CONFIG.chests),
    []
  );
  const bases = useMemo(
    () => HOUSE_TIERS.filter((h) => h.id !== 'none'),
    []
  );
  const minerRate = DEFAULT_CRYPTO_ZOMBIES_CONFIG.minerCoinUsdtRate ?? 0.01;

  const [selectedChestId, setSelectedChestId] = useState('explorer'); // default 5x
  const [selectedHeroIds, setSelectedHeroIds] = useState(() =>
    ['hunter', 'scarlet', 'hunter', 'scarlet', 'hunter']
  );
  const [selectedBaseId, setSelectedBaseId] = useState('basic');
  const [includeIris, setIncludeIris] = useState(false);
  const [includeArmorer, setIncludeArmorer] = useState(false);
  const [staffPlanId, setStaffPlanId] = useState('monthly');
  const [dailyMiningHours, setDailyMiningHours] = useState(12);

  // Modais de seleção
  const [isChestModalOpen, setIsChestModalOpen] = useState(false);
  const [isHeroesModalOpen, setIsHeroesModalOpen] = useState(false);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);

  const MINING_HOUR_OPTIONS = [
    { hours: 5, label: '5h / dia', desc: 'Uso leve / casual' },
    { hours: 8, label: '8h / dia', desc: 'Rotina diária padrão' },
    { hours: 12, label: '12h / dia', desc: 'Ritmo intermediário' },
    { hours: 16, label: '16h / dia', desc: 'Alta atividade com revezamento' },
    { hours: 24, label: '24h / dia', desc: 'Operação contínua integral' }
  ];

  const selectedChest =
    chests.find((c) => c.id === selectedChestId) || chests[0];
  const heroCount = Math.min(15, Number(selectedChest?.heroesCount || 1));
  const selectedBase =
    bases.find((b) => b.id === selectedBaseId) || bases[0];
  const selectedStaffPlan =
    STAFF_PLANS.find((p) => p.id === staffPlanId) || STAFF_PLANS[0];

  const handleSelectChest = (chest) => {
    setSelectedChestId(chest.id);
    const nextCount = Math.min(15, Number(chest.heroesCount || 1));
    setSelectedHeroIds((prev) => {
      if (prev.length === nextCount) return prev;
      if (prev.length > nextCount) return prev.slice(0, nextCount);
      return [...prev, ...Array(nextCount - prev.length).fill('hunter')];
    });
    setIsChestModalOpen(false);
  };

  const applyPreset = (mode) => {
    if (mode === 'all_common') {
      setSelectedHeroIds(
        Array.from({ length: heroCount }, (_, i) => (i % 2 === 0 ? 'hunter' : 'scarlet'))
      );
    } else if (mode === 'realistic') {
      const next = Array.from({ length: heroCount }, (_, idx) => {
        if (heroCount >= 15 && idx === 0) return 'nox';
        if (heroCount >= 10 && idx === 1) return 'verdant';
        if (heroCount >= 5 && idx === 0) return 'polar';
        if (heroCount >= 10 && idx === 2) return 'sombra';
        return idx % 2 === 0 ? 'hunter' : 'scarlet';
      });
      setSelectedHeroIds(next);
    } else if (mode === 'medium') {
      const next = Array.from({ length: heroCount }, (_, idx) => {
        if (heroCount >= 15 && idx === 0) return 'nox';
        if (heroCount >= 10 && idx === 1) return 'verdant';
        if (heroCount >= 5 && idx === 0) return 'polar';
        if (heroCount >= 10 && idx === 2) return 'sombra';
        return idx % 2 === 0 ? 'hunter' : 'scarlet';
      });
      setSelectedHeroIds(next);
      setDailyMiningHours(12);
      setSelectedBaseId('basic');
      setIncludeIris(true);
      setIncludeArmorer(false);
    } else if (mode === 'all_rare') {
      setSelectedHeroIds(
        Array.from({ length: heroCount }, (_, i) => (i % 2 === 0 ? 'polar' : 'sombra'))
      );
    } else if (mode === 'all_legendary') {
      setSelectedHeroIds(
        Array.from({ length: heroCount }, (_, i) => (i % 2 === 0 ? 'granito' : 'brasa'))
      );
    }
  };

  const heroCountsMap = useMemo(() => {
    const map = {};
    selectedHeroIds.slice(0, heroCount).forEach((id) => {
      map[id] = (map[id] || 0) + 1;
    });
    return map;
  }, [selectedHeroIds, heroCount]);

  const handleAddHero = (heroId) => {
    setSelectedHeroIds((prev) => {
      if (prev.length >= heroCount || prev.length >= 15) return prev;
      return [...prev, heroId];
    });
  };

  const handleRemoveHero = (heroId) => {
    setSelectedHeroIds((prev) => {
      const idx = prev.lastIndexOf(heroId);
      if (idx === -1) return prev;
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });
  };

  const simulation = useMemo(() => {
    const chestCostUsdt = Number(selectedChest?.costUsdt || 0);
    const baseCoinsCost = Number(selectedBase?.mncCost || 0);
    const baseFragCost = Number(selectedBase?.fragmentCost || 0);
    const baseCostUsdt = baseCoinsCost * minerRate;

    const irisCostUsdt = includeIris ? Number(selectedStaffPlan?.costUsdt || 5.2) : 0;
    const armorerCostUsdt = includeArmorer ? Number(selectedStaffPlan?.costUsdt || 5.2) : 0;
    const staffCostUsdt = irisCostUsdt + armorerCostUsdt;

    const totalInvestedUsdt = chestCostUsdt + baseCostUsdt + staffCostUsdt;

    // Soma da produção bruta por hora dos heróis escolhidos (já com o multiplicador oficial 1.86x do jogo)
    const activeSlots = selectedHeroIds.slice(0, heroCount);
    const heroesSim = activeSlots.map((hId, i) => {
      const h = getHeroById(hId);
      const r = h?.rarity || 'common';
      const maxHp = getHeroBaseHP(r);
      return {
        id: i,
        maxHp,
        hp: maxHp,
        cph: (RARITY_AVG_COINS_HOUR[r] || 1.4) * MINING_PRODUCTION_MULTIPLIER,
        status: 'work',
        seq: 0
      };
    });
    const grossCoinsPerHour = heroesSim.reduce((sum, h) => sum + h.cph, 0);

    // Helper: simula ciclo real de desgaste (142.5 PV/h) + recuperação + fila nos leitos
    const simulateBaseUptime = (slots, recPct) => {
      if (heroesSim.length === 0 || grossCoinsPerHour <= 0) return 1;
      const list = heroesSim.map((h) => ({ ...h, hp: h.maxHp, status: 'work', seq: 0 }));
      const drainPerMin = 142.5 / 60;
      const healPerMin = (142.5 * (recPct / 100)) / 60;
      let seqCounter = 0;
      let simCoins = 0;
      const simDays = 5;
      const simTotalMins = simDays * 1440;

      for (let m = 0; m < simTotalMins; m++) {
        let inHouse = list.filter((h) => h.status === 'house').length;
        if (inHouse < slots) {
          list
            .filter((h) => h.status === 'waiting')
            .sort((a, b) => a.seq - b.seq)
            .forEach((h) => {
              if (inHouse < slots) {
                h.status = 'house';
                inHouse++;
              }
            });
        }
        for (const h of list) {
          if (h.status === 'work') {
            simCoins += h.cph / 60;
            h.hp -= drainPerMin;
            if (h.hp <= h.maxHp * 0.05) {
              h.hp = h.maxHp * 0.05;
              if (inHouse < slots) {
                h.status = 'house';
                inHouse++;
              } else {
                h.status = 'waiting';
                h.seq = ++seqCounter;
              }
            }
          } else if (h.status === 'house') {
            h.hp += healPerMin;
            if (h.hp >= h.maxHp) {
              h.hp = h.maxHp;
              h.status = 'work';
            }
          }
        }
      }
      const coins24hReal = simCoins / simDays;
      const gross24h = grossCoinsPerHour * 24;
      return gross24h > 0 ? Math.min(1, coins24hReal / gross24h) : 1;
    };

    const houseSlots = Number(selectedBase?.slots ?? 5);
    const recSpeedPct = Number(selectedBase?.recoverySpeedPct ?? 100);
    const uptimeRatio = simulateBaseUptime(houseSlots, recSpeedPct);
    const basicUptimeRatio = selectedBase?.id === 'basic' ? uptimeRatio : simulateBaseUptime(5, 100);

    const effectiveActiveHoursPerDay = dailyMiningHours * uptimeRatio;
    const dailyCoins = grossCoinsPerHour * effectiveActiveHoursPerDay;
    const dailyUsdt = dailyCoins * minerRate;

    const basicDailyCoins = grossCoinsPerHour * (dailyMiningHours * basicUptimeRatio);
    const basicDailyUsdt = basicDailyCoins * minerRate;

    // Simulação real dia-a-dia: começa na Base Básica até juntar Fragmentos do Boss + Coins da Base escolhida,
    // e renova Dra. Íris / John Armeiro periodicamente com a própria mineração.
    const chanceByRarity = { common: 2.0, rare: 2.2, super_rare: 2.3, epic: 2.4, legendary: 2.6667, super_legend: 3.0 };
    const bossChestChance = Math.min(0.40, activeSlots.reduce((sum, hId) => {
      const r = getHeroById(hId)?.rarity || 'common';
      return sum + (chanceByRarity[r] || 2.0) / 100;
    }, 0));
    const fragsPerDay = Math.max(0.01, 2 * bossChestChance * 0.55);
    const daysToUnlockBase = baseFragCost > 0 ? Math.ceil(baseFragCost / fragsPerDay) : 0;
    const staffCycleDays = Number(selectedStaffPlan?.durationDays || 30);

    let freeUsd = 0;
    let baseUnlocked = daysToUnlockBase === 0;
    let realPaybackDays = 0;
    const returnsByDay = { 15: 0, 30: 0, 60: 0, 90: 0 };

    if (chestCostUsdt > 0 && (dailyUsdt > 0 || basicDailyUsdt > 0)) {
      for (let d = 1; d <= 730; d++) {
        freeUsd += baseUnlocked ? dailyUsdt : basicDailyUsdt;
        if (staffCostUsdt > 0 && (d === 1 || (d - 1) % staffCycleDays === 0)) {
          freeUsd -= staffCostUsdt;
        }
        if (!baseUnlocked && d >= daysToUnlockBase && freeUsd >= baseCostUsdt) {
          freeUsd -= baseCostUsdt;
          baseUnlocked = true;
        }
        if (d === 15 || d === 30 || d === 60 || d === 90) {
          returnsByDay[d] = Math.max(0, freeUsd);
        }
        if (!realPaybackDays && freeUsd >= chestCostUsdt) {
          realPaybackDays = d;
          if (d >= 90) break;
        }
      }
    }

    const roiDays = realPaybackDays || (dailyUsdt > 0 ? Math.ceil(totalInvestedUsdt / dailyUsdt) : 0);
    const dailyRoiPct = totalInvestedUsdt > 0 ? (dailyUsdt / totalInvestedUsdt) * 100 : 0;

    return {
      chestCostUsdt,
      baseCoinsCost,
      baseFragCost,
      baseCostUsdt,
      staffCostUsdt,
      totalInvestedUsdt,
      grossCoinsPerHour,
      uptimeRatio,
      effectiveActiveHoursPerDay,
      dailyCoins,
      dailyUsdt,
      roiDays,
      dailyRoiPct,
      return15d: returnsByDay[15],
      return30d: returnsByDay[30],
      return60d: returnsByDay[60],
      return90d: returnsByDay[90]
    };
  }, [
    selectedChest,
    selectedHeroIds,
    heroCount,
    selectedBase,
    includeIris,
    includeArmorer,
    selectedStaffPlan,
    minerRate,
    dailyMiningHours
  ]);

  return (
    <section id="simulador-roi" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* CABEÇALHO */}
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-purple-400">
          <Calculator size={14} />
          <span>{tr.eyebrow}</span>
        </span>
        <h2 className="font-arcade text-2xl sm:text-3xl text-white">
          {tr.title}
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl">
          {tr.subtitle}
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* COLUNA ESQUERDA: CONFIGURAÇÃO EM 4 PASSOS */}
        <div className="lg:col-span-7 space-y-5">
          {/* PASSO 1: ESCOLHER BAÚ (1, 5, 10 OU 15) */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-amber-400" />
                <h3 className="font-arcade text-sm text-white">1. Investimento em Baú</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {chests.map((c) => {
                const isSelected = c.id === selectedChest.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectChest(c)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <img
                        src={c.image || '/items/hero_chest.png'}
                        alt={c.name}
                        className="w-8 h-8 object-contain"
                      />
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700">
                        {c.heroesCount}x
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white truncate">{c.name}</div>
                      <div className="text-xs font-arcade text-emerald-400">
                        US$ {Number(c.costUsdt).toFixed(2)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PASSO 2: ESCOLHER OS HERÓIS (1, 5, 10 OU 15 SLOTS) */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-sky-400" />
                <h3 className="font-arcade text-sm text-white">
                  2. Heróis do Esquadrão ({selectedHeroIds.length}/{heroCount})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHeroesModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/50 text-sky-300 text-xs font-bold transition cursor-pointer"
              >
                <span>Escolher Heróis ({selectedHeroIds.length}/{heroCount})</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => applyPreset('all_common')}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 cursor-pointer"
              >
                Todos Comuns
              </button>
              <button
                type="button"
                onClick={() => applyPreset('medium')}
                className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/50 text-amber-300 font-bold cursor-pointer"
              >
                Cenário Médio (12h)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('realistic')}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 cursor-pointer"
              >
                Misto Realista
              </button>
              <button
                type="button"
                onClick={() => applyPreset('all_rare')}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 cursor-pointer"
              >
                Todos Raros
              </button>
              <button
                type="button"
                onClick={() => applyPreset('all_legendary')}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-orange-500/40 text-orange-300 cursor-pointer"
              >
                Todos Lendários
              </button>
            </div>

            {/* Resumo visual dos heróis selecionados com nome, foto e raridade */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(heroCountsMap).map(([hId, qty]) => {
                const hero = getHeroById(hId);
                if (!hero) return null;
                const cfg = getRarityConfig(hero.rarity);
                return (
                  <button
                    key={hId}
                    type="button"
                    onClick={() => setIsHeroesModalOpen(true)}
                    style={{
                      borderColor: cfg.border,
                      backgroundColor: cfg.badgeBg,
                      color: cfg.badgeText
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer hover:brightness-125 transition"
                    title="Clique para ajustar quantidades e heróis"
                  >
                    <img
                      src={`/assets/heroes/${hero.id}.png`}
                      alt={hero.name}
                      className="w-6 h-6 object-contain"
                    />
                    <span className="font-mono text-white">{qty}×</span>
                    <span className="text-white">{hero.name}</span>
                    <span className="text-[10px] opacity-90">({hero.rarityName})</span>
                  </button>
                );
              })}
              {selectedHeroIds.length < heroCount && (
                <button
                  type="button"
                  onClick={() => setIsHeroesModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl border border-dashed border-sky-500/50 text-sky-300 text-xs font-bold cursor-pointer hover:bg-sky-500/10"
                >
                  + Adicionar ({heroCount - selectedHeroIds.length} vagas livres)
                </button>
              )}
            </div>
          </div>

          {/* PASSO 3: ESCOLHER A BASE DESEJADA */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Home size={18} className="text-blue-400" />
              <h3 className="font-arcade text-sm text-white">3. Base Médica</h3>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {bases.map((base) => {
                const isSelected = base.id === selectedBase.id;
                return (
                  <button
                    key={base.id}
                    type="button"
                    onClick={() => setSelectedBaseId(base.id)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-400 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-full h-24 rounded-lg bg-slate-950 border border-slate-800/80 p-1 flex items-center justify-center overflow-hidden">
                      <img
                        src={base.image}
                        alt={base.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-white">{base.name}</span>
                        <span className="text-[10px] font-mono text-sky-300">
                          {base.recoverySpeedPct}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">{base.slots} vagas</div>
                      <div className="text-[11px] font-mono font-bold pt-1 text-emerald-400">
                        {base.mncCost === 0
                          ? 'Grátis'
                          : `🧱 ${base.fragmentCost} + 🪙 ${base.mncCost.toLocaleString('pt-BR')}`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PASSO 4: ESCOLHER SUPORTES (OPCIONAL) */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-emerald-400" />
                <h3 className="font-arcade text-sm text-white">4. Suportes da Base (Opcional)</h3>
              </div>

              <div className="flex items-center gap-1.5 text-[11px]">
                {STAFF_PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setStaffPlanId(plan.id)}
                    className={`px-2.5 py-1 rounded-lg border font-bold cursor-pointer transition ${
                      staffPlanId === plan.id
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {plan.durationDays}d ({plan.costCoins.toLocaleString('pt-BR')} Coins)
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIncludeIris((v) => !v)}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-left transition cursor-pointer ${
                  includeIris
                    ? 'bg-emerald-500/15 border-emerald-400'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/heroes/iris.png"
                    alt="Dra. Íris"
                    className="w-11 h-11 rounded-xl border border-white/60 bg-slate-950 object-contain p-1"
                  />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <HeartPulse size={13} className="text-emerald-400" />
                      <span>Dra. Íris</span>
                    </div>
                    <div className="text-[11px] text-amber-300 font-mono font-bold">
                      +{selectedStaffPlan.costCoins.toLocaleString('pt-BR')} Coins ({selectedStaffPlan.durationDays}d)
                    </div>
                  </div>
                </div>
                <span
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center ${
                    includeIris
                      ? 'bg-emerald-500 border-emerald-300 text-slate-950'
                      : 'bg-slate-900 border-slate-700 text-transparent'
                  }`}
                >
                  <Check size={14} />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIncludeArmorer((v) => !v)}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-left transition cursor-pointer ${
                  includeArmorer
                    ? 'bg-emerald-500/15 border-emerald-400'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/heroes/armeiro.png"
                    alt="John Armeiro"
                    className="w-11 h-11 rounded-xl border border-white/60 bg-slate-950 object-contain p-1"
                  />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Wrench size={13} className="text-emerald-400" />
                      <span>John Armeiro</span>
                    </div>
                    <div className="text-[11px] text-amber-300 font-mono font-bold">
                      +{selectedStaffPlan.costCoins.toLocaleString('pt-BR')} Coins ({selectedStaffPlan.durationDays}d)
                    </div>
                  </div>
                </div>
                <span
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center ${
                    includeArmorer
                      ? 'bg-emerald-500 border-emerald-300 text-slate-950'
                      : 'bg-slate-900 border-slate-700 text-transparent'
                  }`}
                >
                  <Check size={14} />
                </span>
              </button>
            </div>
          </div>

          {/* PASSO 5: ESCOLHER TEMPO BASE DE MINERAÇÃO / DIA */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-purple-400" />
                <h3 className="font-arcade text-sm text-white">5. Tempo Base de Mineração</h3>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {MINING_HOUR_OPTIONS.map((opt) => {
                const isSelected = dailyMiningHours === opt.hours;
                return (
                  <button
                    key={opt.hours}
                    type="button"
                    onClick={() => setDailyMiningHours(opt.hours)}
                    className={`py-2.5 px-2 rounded-xl border text-center font-mono text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-purple-500/25 border-purple-400 text-purple-200 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {opt.hours}h/dia
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: RESULTADO DA SIMULAÇÃO */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 p-6 rounded-3xl bg-slate-900/95 border border-purple-500/40 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-purple-300 font-bold">
                {tr.summaryLabel}
              </span>
              <h3 className="font-arcade text-lg text-white">{tr.summaryTitle}</h3>
            </div>
            <div className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-400/40 text-xs font-mono text-amber-300 font-bold">
              1 Coin = US$ {minerRate.toFixed(2)}
            </div>
          </div>

          <div className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/35 text-[11px] text-amber-200 leading-relaxed">
            <b className="text-amber-300">{tr.importantLabel}</b> {tr.importantText}
          </div>

          {/* Detalhamento do Investimento */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>{selectedChest.name} ({heroCount} heróis)</span>
              <span className="font-mono font-bold text-white">
                US$ {simulation.chestCostUsdt.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>
                {selectedBase.name}
                {simulation.baseFragCost > 0 ? ` (+${simulation.baseFragCost} Frag.)` : ''}
              </span>
              <span className="font-mono font-bold text-white">
                {simulation.baseCostUsdt > 0
                  ? `US$ ${simulation.baseCostUsdt.toFixed(2)}`
                  : 'Grátis'}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>
                Suportes ({[includeIris && 'Dra. Íris', includeArmorer && 'John Armeiro'].filter(Boolean).join(' + ') || 'Nenhum'})
              </span>
              <span className="font-mono font-bold text-white">
                US$ {simulation.staffCostUsdt.toFixed(2)}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="font-arcade text-xs text-slate-200">{tr.totalInvestment}</span>
              <span className="font-arcade text-xl text-emerald-400">
                US$ {simulation.totalInvestedUsdt.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Card de Retorno / Payback */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-bold uppercase">
                <Coins size={14} />
                <span>{tr.dailyProduction}</span>
              </div>
              <div className="font-arcade text-base text-white">
                {simulation.dailyCoins.toFixed(1)} Coins
              </div>
              <div className="text-xs font-mono text-emerald-400 font-bold">
                ≈ US$ {simulation.dailyUsdt.toFixed(2)} / {lang === 'en' ? 'day' : 'dia'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-purple-300 font-bold uppercase">
                <Clock size={14} />
                <span>{tr.roiPayback}</span>
              </div>
              <div className="font-arcade text-xl text-amber-300">
                ~{simulation.roiDays} {lang === 'en' ? 'days' : 'dias'}
              </div>
              <div className="text-xs font-mono text-purple-200">
                {simulation.dailyRoiPct.toFixed(2)}% {lang === 'en' ? 'per day' : 'ao dia'}
              </div>
              <div className="text-[10px] text-amber-200/85 font-medium pt-0.5 leading-tight">
                {tr.beforeFees}
              </div>
            </div>
          </div>

          {/* Projeção 30 / 60 / 90 dias */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase">
              <TrendingUp size={14} className="text-emerald-400" />
              <span>{tr.accumulated}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-900 border border-amber-500/40">
                <span className="text-[10px] text-amber-300 block">15 Dias</span>
                <b className="font-mono text-amber-300">US$ {simulation.return15d.toFixed(2)}</b>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">30 Dias</span>
                <b className="font-mono text-emerald-400">US$ {simulation.return30d.toFixed(2)}</b>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">60 Dias</span>
                <b className="font-mono text-emerald-400">US$ {simulation.return60d.toFixed(2)}</b>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">90 Dias</span>
                <b className="font-mono text-amber-300">US$ {simulation.return90d.toFixed(2)}</b>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              * Estimativa real com taxa base atualizada, {Math.round((simulation.uptimeRatio || 1) * 100)}% de uptime
              (~{simulation.effectiveActiveHoursPerDay.toFixed(1)}h/dia efetivas descontando descanso na {selectedBase.name}).
            </p>
          </div>
        </div>
      </div>

      {/* MODAL 1: ESCOLHER BAÚ (1, 5, 10 OU 15) */}
      {isChestModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
              <h3 className="font-arcade text-sm sm:text-base text-amber-400">
                ESCOLHER BAÚ DE INVESTIMENTO
              </h3>
              <button
                type="button"
                onClick={() => setIsChestModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-4">
              {chests.map((c) => {
                const isSelected = c.id === selectedChest.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectChest(c)}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center gap-4 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={c.image || '/items/hero_chest.png'}
                      alt={c.name}
                      className="w-14 h-14 object-contain shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="font-arcade text-sm text-white">{c.name}</div>
                      <div className="text-xs text-slate-400">
                        {c.heroesCount} {c.heroesCount === 1 ? 'Herói' : 'Heróis'}
                      </div>
                      <div className="font-arcade text-sm text-emerald-400">
                        US$ {Number(c.costUsdt).toFixed(2)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ESCOLHER HERÓIS PELO NOME & RARIDADE (ATÉ O LIMITE DO BAÚ / MÁX. 15) */}
      {isHeroesModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-4xl max-h-[88vh] flex flex-col bg-slate-900 border border-sky-500/40 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="font-arcade text-sm sm:text-base text-sky-400">
                  ESCOLHER HERÓIS ({selectedHeroIds.length} / {heroCount} • MÁX. 15)
                </h3>
                <p className="text-xs text-slate-400">
                  Você pode escolher mais de 2 heróis iguais, respeitando o limite total de {heroCount}{' '}
                  {heroCount === 1 ? 'herói' : 'heróis'} (nunca passando de 15).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHeroesModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SORTED_HERO_ROSTER.map((hero) => {
                const cfg = getRarityConfig(hero.rarity);
                const qty = heroCountsMap[hero.id] || 0;
                const canAdd = selectedHeroIds.length < heroCount && selectedHeroIds.length < 15;
                const avgCoins = RARITY_AVG_COINS_HOUR[hero.rarity] || 1.4;

                return (
                  <div
                    key={hero.id}
                    style={{ borderColor: qty > 0 ? cfg.border : undefined }}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition ${
                      qty > 0 ? 'bg-slate-950/95 shadow-md' : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        style={{ borderColor: cfg.border }}
                        className="w-11 h-11 rounded-xl bg-slate-900 border p-1 flex items-center justify-center shrink-0"
                      >
                        <img
                          src={`/assets/heroes/${hero.id}.png`}
                          alt={hero.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-arcade text-xs text-white truncate">{hero.name}</div>
                        <span
                          style={{
                            color: cfg.badgeText,
                            backgroundColor: cfg.badgeBg,
                            borderColor: cfg.badgeBorder
                          }}
                          className="inline-block text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full border mt-0.5"
                        >
                          {hero.rarityName}
                        </span>
                        <div className="text-[10px] font-mono text-amber-300 mt-0.5">
                          {avgCoins.toFixed(2)} Coins/h
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveHero(hero.id)}
                        disabled={qty === 0}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-35 text-white flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-6 text-center font-mono text-xs font-bold text-white">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddHero(hero.id)}
                        disabled={!canAdd}
                        className="w-7 h-7 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-35 text-slate-950 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedHeroIds([])}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('all_common')}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                >
                  Completar com Comuns
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsHeroesModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-slate-950 font-arcade text-xs font-bold cursor-pointer"
              >
                Confirmar ({selectedHeroIds.length}/{heroCount})
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL 3: ESCOLHER TEMPO BASE DE MINERAÇÃO / DIA */}
      {isHoursModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
              <h3 className="font-arcade text-sm sm:text-base text-purple-400">
                TEMPO BASE DE MINERAÇÃO
              </h3>
              <button
                type="button"
                onClick={() => setIsHoursModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-2.5">
              {MINING_HOUR_OPTIONS.map((opt) => {
                const isSelected = dailyMiningHours === opt.hours;
                return (
                  <button
                    key={opt.hours}
                    type="button"
                    onClick={() => {
                      setDailyMiningHours(opt.hours);
                      setIsHoursModalOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-400'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-arcade text-sm text-white">{opt.label}</div>
                      <div className="text-xs text-slate-400">{opt.desc}</div>
                    </div>
                    {isSelected && <Check size={16} className="text-purple-300" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
