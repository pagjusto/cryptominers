import React, { useState } from 'react';
import { 
  X, 
  Flame, 
  Sparkles, 
  Star, 
  AlertTriangle, 
  ArrowRight, 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  Info 
} from 'lucide-react';
import { MINER_CLASSES } from '../data/minersData';
import { MINER_ROSTER } from '../data/minersCatalog';
import { sfx } from '../utils/sfx';
import confetti from 'canvas-confetti';

export default function HeroFusionModal({
  isOpen,
  onClose,
  miners,
  onFuseHeroes
}) {
  if (!isOpen) return null;

  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [selectedSacrificeIds, setSelectedSacrificeIds] = useState([]);
  const [fusionSuccessData, setFusionSuccessData] = useState(null);

  // Mapeia raridade para cada classe a partir do MINER_ROSTER
  const getMinerRarity = (miner) => {
    const fromRoster = MINER_ROSTER.find(r => r.id === `class_${miner.classId}` || r.heroId === miner.heroId || r.classId === miner.classId);
    return fromRoster ? fromRoster.rarity : 'common';
  };

  const getRarityLabel = (rarity) => {
    switch (rarity) {
      case 'common': return { text: 'COMUM', color: 'text-slate-300 border-slate-500 bg-slate-500/20' };
      case 'rare': return { text: 'RARO', color: 'text-sky-300 border-sky-500 bg-sky-500/20' };
      case 'superRare': return { text: 'SUPER RARO', color: 'text-blue-300 border-blue-500 bg-blue-500/20' };
      case 'epic': return { text: 'ÉPICO', color: 'text-purple-300 border-purple-500 bg-purple-500/20' };
      case 'legendary': return { text: 'LENDÁRIO', color: 'text-amber-300 border-amber-500 bg-amber-500/20' };
      default: return { text: 'COMUM', color: 'text-slate-300 border-slate-500 bg-slate-500/20' };
    }
  };

  const targetMiner = miners.find(m => m.id === selectedTargetId);
  const targetRarity = targetMiner ? getMinerRarity(targetMiner) : null;
  const targetStars = targetMiner ? (targetMiner.stars || 1) : 1;

  // Candidatos para sacrifício: mesma raridade do alvo, não pode ser o próprio alvo nem estar em repouso
  const eligibleSacrifices = miners.filter(m => {
    if (!targetMiner) return false;
    if (m.id === targetMiner.id) return false;
    const r = getMinerRarity(m);
    return r === targetRarity;
  });

  const toggleSacrifice = (minerId) => {
    if (selectedSacrificeIds.includes(minerId)) {
      setSelectedSacrificeIds(prev => prev.filter(id => id !== minerId));
    } else {
      if (selectedSacrificeIds.length < 2) {
        setSelectedSacrificeIds(prev => [...prev, minerId]);
      }
    }
  };

  const handleSelectTarget = (minerId) => {
    setSelectedTargetId(minerId);
    setSelectedSacrificeIds([]);
    setFusionSuccessData(null);
  };

  const canFuse = targetMiner && targetStars < 5 && selectedSacrificeIds.length === 2;

  // Executar a Fusão de Heróis (Queima 2 e sobe estrelas e poder)
  const handleExecuteFusion = () => {
    if (!canFuse) return;

    const sac1 = miners.find(m => m.id === selectedSacrificeIds[0]);
    const sac2 = miners.find(m => m.id === selectedSacrificeIds[1]);
    if (!sac1 || !sac2) return;

    const oldPower = targetMiner.power;
    const newStars = targetStars + 1;
    // Bônus: +25% de Poder (mínimo +2)
    const powerGain = Math.max(2, Math.round(oldPower * 0.25));
    const newPower = oldPower + powerGain;

    // Dispara animação épica de fusão
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981']
    });
    sfx.playLevelUp();

    onFuseHeroes({
      targetId: targetMiner.id,
      sacrificeIds: [sac1.id, sac2.id],
      newStars,
      newPower
    });

    setFusionSuccessData({
      targetName: targetMiner.name,
      avatar: (MINER_CLASSES[targetMiner.classId] || {}).avatar || '⛏️',
      oldStars: targetStars,
      newStars,
      oldPower,
      newPower,
      sacrificedNames: [sac1.name, sac2.name]
    });

    setSelectedTargetId(null);
    setSelectedSacrificeIds([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow Místico */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* CABEÇALHO */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-lg shadow-rose-900/30">
              <Flame size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-arcade text-lg sm:text-xl text-white tracking-wide">
                  ALTAR DE FUSÃO & QUEIMA DE HERÓIS
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                  HERO FUSION
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sacrifique 2 heróis da mesma raridade para elevar as Estrelas (★) e o Poder Base do Herói Principal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* SUCESSO DE FUSÃO ANTERIOR */}
          {fusionSuccessData && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border border-amber-400/50 flex items-center justify-between animate-scaleUp">
              <div className="flex items-center gap-3">
                <span className="text-3xl animate-bounce">{fusionSuccessData.avatar}</span>
                <div>
                  <h3 className="font-arcade text-sm text-amber-300">
                    FUSÃO BEM-SUCEDIDA! {fusionSuccessData.targetName} EVOLUIU!
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-tech mt-0.5">
                    <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                      {Array.from({ length: fusionSuccessData.newStars }).map((_, i) => (
                        <Star key={i} size={13} fill="#fbbf24" className="text-amber-400 inline" />
                      ))}
                      <span className="ml-1">({fusionSuccessData.newStars}★)</span>
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">
                      Poder: {fusionSuccessData.oldPower} ➔ {fusionSuccessData.newPower} (+{fusionSuccessData.newPower - fusionSuccessData.oldPower})
                    </span>
                    <span>•</span>
                    <span className="text-rose-400 text-[11px]">
                      Heróis consumidos: {fusionSuccessData.sacrificedNames.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setFusionSuccessData(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
              >
                Dispensar
              </button>
            </div>
          )}

          {/* MESA DE FUSÃO (LAYOUT 3 SLOTS: ALVO + SACRIFÍCIO 1 + SACRIFÍCIO 2) */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 shadow-inner">
            <h3 className="text-xs font-arcade text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              <span>Círculo de Alquimia dos Heróis</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              
              {/* SLOT 1: HERÓI PRINCIPAL (ALVO) */}
              <div className={`p-4 rounded-2xl border-2 transition relative flex flex-col items-center text-center ${
                targetMiner 
                  ? 'border-amber-400/80 bg-amber-500/10 shadow-lg shadow-amber-500/10' 
                  : 'border-dashed border-slate-700 bg-slate-900/40'
              }`}>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
                  👑 Herói Principal (Alvo)
                </span>

                {targetMiner ? (
                  <>
                    <div className="text-4xl mb-1">
                      {(MINER_CLASSES[targetMiner.classId] || {}).avatar || '🤖'}
                    </div>
                    <div className="font-arcade text-sm text-white font-bold">{targetMiner.name}</div>
                    
                    {/* Estrelas */}
                    <div className="flex items-center gap-0.5 my-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={13} 
                          fill={i < targetStars ? "#fbbf24" : "none"} 
                          className={i < targetStars ? "text-amber-400" : "text-slate-600"} 
                        />
                      ))}
                      <span className="text-xs text-amber-400 font-bold ml-1">{targetStars}★</span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-0.5 mt-1 font-mono">
                      <div>Poder: <b className="text-amber-300">{targetMiner.power}</b></div>
                    </div>

                    <button
                      onClick={() => handleSelectTarget(null)}
                      className="mt-3 text-[11px] text-rose-400 hover:text-rose-300 transition underline cursor-pointer"
                    >
                      Remover Seleção
                    </button>
                  </>
                ) : (
                  <div className="py-6 text-slate-500 text-xs">
                    <p className="font-bold">Selecione o Herói Alvo</p>
                    <p className="text-[11px] mt-1 text-slate-600">Escolha um herói na lista abaixo</p>
                  </div>
                )}
              </div>

              {/* SETA CENTRAL COM PREVISÃO */}
              <div className="flex flex-col items-center justify-center text-center px-2">
                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 mb-2">
                  <Flame size={28} className={canFuse ? "animate-bounce text-rose-400" : "text-slate-600"} />
                </div>
                
                {targetMiner && targetStars >= 5 ? (
                  <div className="text-xs text-amber-400 font-bold">
                    ⭐ Herói já atingiu o Nível Máximo (5★)!
                  </div>
                ) : targetMiner && selectedSacrificeIds.length === 2 ? (
                  <div className="text-xs text-emerald-400 font-bold space-y-0.5 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
                    <p className="text-amber-300 font-arcade">PRONTO PARA FUNDIR!</p>
                    <p>Novo Grau: <b>{targetStars + 1}★ (+1)</b></p>
                    <p>Poder: <b>+{Math.max(2, Math.round(targetMiner.power * 0.25))} Bônus</b></p>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 space-y-1">
                    <p>Selecione o herói alvo e 2 sacrifícios da mesma raridade.</p>
                  </div>
                )}
              </div>

              {/* SLOTS DE SACRIFÍCIO (QUEIMA) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span className="flex items-center gap-1 text-rose-400">
                    <Flame size={13} />
                    Sacrifícios Necessários: ({selectedSacrificeIds.length}/2)
                  </span>
                  {targetRarity && (
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] ${getRarityLabel(targetRarity).color}`}>
                      Exige: {getRarityLabel(targetRarity).text}
                    </span>
                  )}
                </div>

                {/* 2 Caixas de Sacrifício */}
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1].map((slotIdx) => {
                    const sacId = selectedSacrificeIds[slotIdx];
                    const sacMiner = miners.find(m => m.id === sacId);

                    return (
                      <div 
                        key={slotIdx}
                        className={`p-3 rounded-xl border transition text-center flex flex-col items-center justify-center min-h-[110px] ${
                          sacMiner 
                            ? 'border-rose-500/70 bg-rose-500/10' 
                            : 'border-dashed border-slate-700 bg-slate-900/40 text-slate-600'
                        }`}
                      >
                        {sacMiner ? (
                          <>
                            <span className="text-2xl mb-1">
                              {(MINER_CLASSES[sacMiner.classId] || {}).avatar || '⛏️'}
                            </span>
                            <span className="text-xs font-bold text-white truncate max-w-full">
                              {sacMiner.name.split(' ')[0]}
                            </span>
                            <span className="text-[10px] text-rose-400 font-bold mt-0.5">
                              🔥 Será Queimado
                            </span>
                            <button
                              onClick={() => toggleSacrifice(sacMiner.id)}
                              className="text-[10px] text-slate-400 hover:text-white mt-1 cursor-pointer"
                            >
                              ✕ Remover
                            </button>
                          </>
                        ) : (
                          <div className="text-[11px] text-slate-500">
                            Sacrifício #{slotIdx + 1}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-start gap-1.5 text-[10px] text-amber-400/90 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                  <AlertTriangle size={13} className="shrink-0 text-amber-400 mt-0.5" />
                  <span>Atenção: Os 2 heróis selecionados para sacrifício serão destruídos permanentemente.</span>
                </div>
              </div>

            </div>

            {/* BOTÃO PRINCIPAL DE AÇÃO */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-end">
              <button
                disabled={!canFuse}
                onClick={handleExecuteFusion}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-arcade text-xs transition cursor-pointer ${
                  canFuse 
                    ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-bold shadow-lg shadow-rose-950/50 active:scale-95' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                }`}
              >
                <Flame size={16} />
                <span>REALIZAR FUSÃO MÍSTICA (SUBIR ESTRELA)</span>
              </button>
            </div>
          </div>

          {/* LISTA DE HERÓIS PARA SELEÇÃO */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-arcade text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Info size={14} className="text-sky-400" />
                <span>
                  {targetMiner ? 'Passo 2: Selecione 2 Heróis para Sacrifício' : 'Passo 1: Selecione o Herói Alvo que vai subir de Estrela'}
                </span>
              </h3>
              <span className="text-xs text-slate-400">Total na Equipe: {miners.length}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1">
              {miners.map((m) => {
                const cInfo = MINER_CLASSES[m.classId] || MINER_CLASSES.miner;
                const rarity = getMinerRarity(m);
                const rStyle = getRarityLabel(rarity);
                const isTarget = m.id === selectedTargetId;
                const isSacrifice = selectedSacrificeIds.includes(m.id);
                const stars = m.stars || 1;

                // Se temos um alvo selecionado, apenas heróis da mesma raridade e não-alvos são elegíveis para sacrifício
                const isEligibleSacrifice = targetMiner && !isTarget && rarity === targetRarity;
                const isDimmed = targetMiner && !isTarget && !isEligibleSacrifice;

                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      if (!targetMiner) {
                        handleSelectTarget(m.id);
                      } else {
                        if (isTarget) {
                          handleSelectTarget(null);
                        } else if (isEligibleSacrifice) {
                          toggleSacrifice(m.id);
                        }
                      }
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer relative flex flex-col justify-between ${
                      isTarget 
                        ? 'border-amber-400 bg-amber-500/20 shadow-md ring-2 ring-amber-400/50' 
                        : isSacrifice
                          ? 'border-rose-500 bg-rose-500/20 shadow-md ring-2 ring-rose-500/50'
                          : isDimmed
                            ? 'border-slate-800 bg-slate-950/40 opacity-40 cursor-not-allowed'
                            : 'border-slate-800 bg-slate-900 hover:border-slate-600 hover:bg-slate-850'
                    }`}
                  >
                    {/* Badge de Seleção */}
                    {isTarget && (
                      <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-bold font-arcade shadow">
                        ALVO
                      </span>
                    )}
                    {isSacrifice && (
                      <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold font-arcade shadow">
                        SACRIFÍCIO
                      </span>
                    )}

                    <div className="flex items-start gap-2">
                      <span className="text-2xl">{cInfo.avatar}</span>
                      <div className="overflow-hidden">
                        <div className="font-arcade text-xs text-white truncate">{m.name}</div>
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold border mt-0.5 ${rStyle.color}`}>
                          {rStyle.text}
                        </span>
                      </div>
                    </div>

                    {/* Estrelas do Herói */}
                    <div className="flex items-center gap-0.5 mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={11} 
                          fill={i < stars ? "#fbbf24" : "none"} 
                          className={i < stars ? "text-amber-400" : "text-slate-700"} 
                        />
                      ))}
                      <span className="text-[10px] text-amber-400 font-bold ml-1">{stars}★</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono pt-2 border-t border-slate-800/60">
                      <span>Poder: <b className="text-white">{m.power}</b></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
