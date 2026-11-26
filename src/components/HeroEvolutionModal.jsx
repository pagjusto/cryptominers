import React, { useMemo, useState } from 'react';
import {
  X,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Star,
  Lock,
} from 'lucide-react';
import { getRarityConfig } from '../data/heroRoster';

const EVOLUTION_REQUIRED_DAYS = 80;

const RARITY_EVOLUTION_BASE = {
  rare: 1,
  super_rare: 2,
  epic: 3,
  legendary: 4,
  super_legend: 5,
};

export const getEvolutionRecipe = (rarity = 'common', currentStars = 0) => {
  const base = RARITY_EVOLUTION_BASE[rarity];
  if (!base || currentStars >= 3) return null;
  const starOffset = Math.max(0, Math.min(2, currentStars));
  const chests = base + starOffset;
  const potions = chests * 10;
  return {
    nextStars: currentStars + 1,
    chests,
    potions,
    powerBonusPct: 5,
  };
};

export const getMinerActiveDays = (miner) => {
  if (!miner) return 0;
  if (typeof miner.activeDays === 'number' && Number.isFinite(miner.activeDays)) {
    return Math.max(0, Math.floor(miner.activeDays));
  }
  if (typeof miner.createdAt === 'number' && Number.isFinite(miner.createdAt)) {
    return Math.max(0, Math.floor((Date.now() - miner.createdAt) / 86400000));
  }
  return 0;
};

export default function HeroEvolutionModal({
  isOpen,
  onClose,
  miners = [],
  purchasedChests = [],
  rejuvenationPotions = 0,
  onEvolveHero,
}) {
  const [selectedHeroId, setSelectedHeroId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const enrichedMiners = useMemo(() => {
    return miners.map((m) => {
      const activeDays = getMinerActiveDays(m);
      const stars = m.stars ?? 0;
      const isCommon = !RARITY_EVOLUTION_BASE[m.rarity];
      const isMaxStars = stars >= 3;
      const hasEnoughDays = activeDays >= EVOLUTION_REQUIRED_DAYS;
      const isEligible = !isCommon && hasEnoughDays && !isMaxStars;
      return {
        ...m,
        activeDays,
        stars,
        isCommon,
        isMaxStars,
        hasEnoughDays,
        isEligible,
      };
    });
  }, [miners]);

  const selectedHero = useMemo(() => {
    if (!selectedHeroId) return null;
    return enrichedMiners.find((m) => m.id === selectedHeroId) || null;
  }, [enrichedMiners, selectedHeroId]);

  const recipe = useMemo(() => {
    if (!selectedHero) {
      return getEvolutionRecipe('rare', 0);
    }
    return getEvolutionRecipe(selectedHero.rarity, selectedHero.stars);
  }, [selectedHero]);

  if (!isOpen) return null;

  const chestsCount = purchasedChests.length;
  const hasChests = recipe ? chestsCount >= recipe.chests : false;
  const hasPotions = recipe ? rejuvenationPotions >= recipe.potions : false;
  const hasAllItems = Boolean(recipe && hasChests && hasPotions);
  const canEvolve = Boolean(selectedHero?.isEligible && hasAllItems);

  const eligibleCount = enrichedMiners.filter((m) => m.isEligible).length;

  const handleConfirmEvolution = () => {
    if (!selectedHero || !canEvolve || !recipe) return;
    if (onEvolveHero) {
      const ok = onEvolveHero(selectedHero.id, recipe);
      if (ok) {
        setFeedback({
          type: 'success',
          message: `${selectedHero.name} evoluiu para ${recipe.nextStars}★ e teve seu ciclo renovado!`,
        });
        setSelectedHeroId(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-arcade text-sm sm:text-base text-white">
                EVOLUÇÃO DE HERÓIS (80 DIAS)
              </h2>
              <p className="text-[11px] text-slate-400">
                Selecione um herói (Raro a Super Lendário) com {EVOLUTION_REQUIRED_DAYS} dias ativos e os baús/poções necessários.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {feedback && (
            <div
              className={`px-4 py-3 rounded-xl border text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
              }`}
            >
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Passo 1: Selecionar Herói com 80 dias */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-arcade text-xs text-purple-300 uppercase flex items-center gap-2">
                <Clock size={14} />
                <span>1. Selecionar Herói ({EVOLUTION_REQUIRED_DAYS} dias)</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Elegíveis: <b className="text-emerald-400">{eligibleCount}</b> / {enrichedMiners.length}
              </span>
            </div>

            {enrichedMiners.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 text-center text-xs text-slate-400">
                Você ainda não possui heróis no esquadrão.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {enrichedMiners.map((miner) => {
                  const rarity = getRarityConfig(miner.rarity);
                  const isSelected = selectedHero?.id === miner.id;
                  const daysRemaining = Math.max(0, EVOLUTION_REQUIRED_DAYS - miner.activeDays);

                  return (
                    <button
                      key={miner.id}
                      type="button"
                      disabled={!miner.isEligible}
                      onClick={() => {
                        setSelectedHeroId(miner.id);
                        setFeedback(null);
                      }}
                      className={`p-3 rounded-2xl border text-left transition flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-purple-500/20 border-purple-400 shadow-lg'
                          : miner.isEligible
                          ? 'bg-slate-950/80 border-slate-700 hover:border-purple-400/60 cursor-pointer'
                          : 'bg-slate-950/40 border-slate-800/80 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={miner.image}
                          alt={miner.name}
                          className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 object-contain p-1 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            <span>{miner.name}</span>
                            {miner.stars > 0 ? (
                              <span className="text-[10px] text-amber-300">
                                {'★'.repeat(miner.stars)}
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-400 font-normal">
                                (Sem estrelas)
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-bold" style={{ color: rarity.color }}>
                            {rarity.name}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {miner.isCommon ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400">
                            <Lock size={10} /> Não evolui
                          </span>
                        ) : miner.isMaxStars ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-300">
                            <Star size={10} /> Máx (3★)
                          </span>
                        ) : miner.isEligible ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                            <CheckCircle2 size={10} /> {miner.activeDays}d (Pronto)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
                            <Lock size={10} /> {miner.activeDays}/80d (-{daysRemaining}d)
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Passo 2: Itens Necessários */}
          {recipe && (
            <div className="space-y-3">
              <h3 className="font-arcade text-xs text-amber-300 uppercase">
                2. Itens Necessários ({selectedHero ? `${getRarityConfig(selectedHero.rarity).name} • ${selectedHero.stars}★ ➔ ${recipe.nextStars}★` : 'Exemplo Raro • 0★ ➔ 1★'})
              </h3>

              <div className="grid sm:grid-cols-2 gap-3">
                {/* Baús de Herói */}
                <div
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                    hasChests
                      ? 'bg-emerald-950/25 border-emerald-500/35'
                      : 'bg-rose-950/20 border-rose-500/35'
                  }`}
                >
                  <img
                    src="/items/hero_chest.png"
                    alt="Baús"
                    className="w-10 h-10 object-contain shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-white leading-tight">
                      Baús
                    </div>
                    <div
                      className={`text-xs font-mono font-bold mt-0.5 ${
                        hasChests ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {chestsCount} / {recipe.chests}
                    </div>
                  </div>
                </div>

                {/* Poções de Rejuvenescimento */}
                <div
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                    hasPotions
                      ? 'bg-emerald-950/25 border-emerald-500/35'
                      : 'bg-rose-950/20 border-rose-500/35'
                  }`}
                >
                  <img
                    src="/items/rejuvenation_potion.png"
                    alt="Poção de Rejuvenescimento"
                    className="w-10 h-10 object-contain shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-white leading-tight">
                      Poções de Rejuvenescimento
                    </div>
                    <div
                      className={`text-xs font-mono font-bold mt-0.5 ${
                        hasPotions ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {rejuvenationPotions} / {recipe.potions}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2">
                <span>
                  Bônus da evolução: <b className="text-purple-300">+{recipe.powerBonusPct}% Poder/Produção</b> e{' '}
                  <b className="text-emerald-300">Ciclo de 80 dias renovado (0/80d)</b>.
                </span>
                {!selectedHero && (
                  <span className="text-amber-300 flex items-center gap-1">
                    <AlertTriangle size={12} /> Selecione um herói com 80 dias acima
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Fechar
          </button>
          <button
            type="button"
            disabled={!canEvolve}
            onClick={handleConfirmEvolution}
            className={`px-5 py-2.5 rounded-xl font-arcade text-xs flex items-center gap-2 transition ${
              canEvolve
                ? 'bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white shadow-lg cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Sparkles size={14} />
            <span>EVOLUIR HERÓI</span>
          </button>
        </div>
      </div>
    </div>
  );
}
