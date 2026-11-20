import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  Battery, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sfx } from '../utils/sfx';
import { 
  getDailyEnergyAdsCountToday, 
  canWatchEnergyAdToday, 
  recordAdTransaction 
} from '../utils/adRewardService';
import { getCryptoZombiesConfig } from '../data/cryptoZombiesConfig';
import { MINER_CLASSES } from '../data/minersData';
import RewardedAdModal from './RewardedAdModal';

export default function HeroEnergyRecoveryModal({
  isOpen,
  onClose,
  miners = [],
  preselectedHeroId = null,
  onEnergyRestored // callback(heroId)
}) {
  if (!isOpen) return null;

  const config = getCryptoZombiesConfig();
  const dailyLimit = config?.adsConfig?.dailyEnergyLimit || 5;
  const usedToday = getDailyEnergyAdsCountToday();
  const remainingToday = Math.max(0, dailyLimit - usedToday);
  const canWatch = remainingToday > 0;

  // Filtra heróis que precisam de recuperação (estamina < 100%)
  const eligibleHeroes = miners.filter(m => {
    const current = m.currentStamina !== undefined ? m.currentStamina : m.maxStamina;
    return current < m.maxStamina;
  });

  const [selectedHeroId, setSelectedHeroId] = useState(() => {
    if (preselectedHeroId && eligibleHeroes.some(h => h.id === preselectedHeroId)) {
      return preselectedHeroId;
    }
    return eligibleHeroes[0]?.id || miners[0]?.id || null;
  });

  const [isAdPlayerOpen, setIsAdPlayerOpen] = useState(false);
  const selectedHero = miners.find(m => m.id === selectedHeroId) || eligibleHeroes[0] || miners[0];

  const handleStartWatchAd = () => {
    if (!canWatch || !selectedHero) return;
    setIsAdPlayerOpen(true);
  };

  const handleAdFinished = () => {
    setIsAdPlayerOpen(false);

    if (!selectedHero) return;

    // Registra transação auditada de recuperação de energia
    recordAdTransaction({
      type: 'energy_recovery',
      benefitDescription: `Recuperação de 100% de Energia para ${selectedHero.name}`,
      heroId: selectedHero.id,
      heroName: selectedHero.name,
      status: 'completed',
      estimatedRevenueUsd: 0.025
    });

    sfx.playLevelUp();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#fbbf24', '#22c55e']
    });

    if (onEnergyRestored) {
      onEnergyRestored(selectedHero.id);
    }

    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none text-white font-tech">
        <div 
          className="relative w-full max-w-lg max-h-[90vh] rounded-3xl p-5 sm:p-6 bg-slate-900 border-2 border-slate-700 text-center shadow-2xl flex flex-col overflow-hidden text-left"
          onClick={e => e.stopPropagation()}
        >
          {/* Cabeçalho */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl border border-amber-500/30">
                ☕
              </div>
              <div>
                <h3 className="font-arcade text-sm text-amber-400 flex items-center gap-2">
                  <span>RECUPERAÇÃO DE ENERGIA 100%</span>
                  <span className="text-[10px] font-mono bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/40">
                    AD PATROCINADO
                  </span>
                </h3>
                <span className="text-xs text-slate-400">
                  Assista a um anúncio rápido para restaurar instantaneamente a estamina do seu herói
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Status do Limite Diário */}
          <div className="my-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Battery size={16} className={canWatch ? "text-emerald-400" : "text-rose-400"} />
              <span className="text-slate-300">
                Cota Diária Disponível: <b className={canWatch ? "text-emerald-400 font-mono" : "text-rose-400 font-mono"}>{remainingToday} de {dailyLimit}</b> restantes hoje
              </span>
            </div>
            {!canWatch && (
              <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                LIMITE ATINGIDO
              </span>
            )}
          </div>

          {/* Seleção de Herói Elegível */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-1 max-h-[45vh] mb-4">
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Selecione o herói que receberá a recarga de energia:
            </label>

            {eligibleHeroes.length === 0 ? (
              <div className="p-6 text-center bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 text-xs text-slate-400">
                <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
                <b className="text-slate-200 block mb-1">Todos os heróis estão com energia completa!</b>
                <span>Nenhum personagem necessita de recuperação de estamina no momento.</span>
              </div>
            ) : (
              eligibleHeroes.map(hero => {
                const classInfo = MINER_CLASSES[hero.classId] || MINER_CLASSES.miner;
                const current = hero.currentStamina !== undefined ? hero.currentStamina : hero.maxStamina;
                const staminaPct = Math.round((current / hero.maxStamina) * 100);
                const isSelected = selectedHeroId === hero.id;

                return (
                  <div
                    key={hero.id}
                    onClick={() => setSelectedHeroId(hero.id)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/30 ring-1 ring-amber-400/50 shadow-md'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-10 h-10 rounded-xl border flex items-center justify-center text-xl overflow-hidden relative shrink-0"
                        style={{ borderColor: hero.color || classInfo.color, backgroundColor: `${hero.color || classInfo.color}15` }}
                      >
                        <img 
                          src={hero.image || `/miners/${hero.classId}.png`} 
                          alt={hero.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            if (e.target.src.endsWith('.png')) e.target.src = `/miners/${hero.classId}.jpg`;
                            else e.target.style.display = 'none';
                          }}
                        />
                        <span className="absolute -z-0">{hero.avatar}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-tech font-bold text-xs text-white">
                            {hero.name}
                          </h4>
                          <span 
                            className="text-[9px] font-mono px-1 rounded uppercase font-bold"
                            style={{ backgroundColor: `${hero.color || classInfo.color}20`, color: hero.color || classInfo.color }}
                          >
                            {hero.rarity || classInfo.badge}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          Estamina: <b className="text-amber-300">{Math.round(current)}</b>/{hero.maxStamina} ({staminaPct}%)
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                        ➔ 100% ({hero.maxStamina} STA)
                      </span>
                      <span className="text-[9px] text-slate-500 font-tech">
                        {hero.status === 'house' ? 'Descansando na casa' : 'Aguardando recarga'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Botão de Ação */}
          <div className="pt-2 border-t border-slate-800 shrink-0">
            {canWatch ? (
              <button
                onClick={handleStartWatchAd}
                disabled={!selectedHero || eligibleHeroes.length === 0}
                className={`w-full py-3 rounded-2xl font-arcade text-xs font-bold transition shadow-xl flex items-center justify-center gap-2 ${
                  selectedHero && eligibleHeroes.length > 0
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 cursor-pointer shadow-emerald-950/60 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                }`}
              >
                <Play size={14} className="fill-slate-950" />
                <span>ASSISTIR ANÚNCIO & RECUPERAR 100% ENERGIA</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                Você atingiu o limite diário de <b>{dailyLimit} anúncios</b> de recuperação hoje.
                <span className="block text-[10px] text-slate-500 mt-0.5">Sua cota renova automaticamente à meia-noite!</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* PLAYER DO ANÚNCIO */}
      <RewardedAdModal
        isOpen={isAdPlayerOpen}
        onClose={() => setIsAdPlayerOpen(false)}
        onRewardGranted={handleAdFinished}
        rewardTitle={`Recuperar 100% de Energia: ${selectedHero?.name || 'Herói'}`}
        rewardIcon="⚡"
        durationSec={5}
      />
    </>
  );
}
