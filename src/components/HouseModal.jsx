import React, { useState } from 'react';
import { X, HeartPulse, Check, Users, Wrench, ShieldCheck, Sparkles, Clock, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { HOUSE_TIERS, resolveHouseTier } from '../data/housesData';
import { STAFF_PLANS, STAFF_MEMBERS } from '../data/staffCatalog';
import { sfx } from '../utils/sfx';

export default function HouseModal({ 
  isOpen, 
  onClose, 
  currentHouseId = 'basic', 
  miners = [], 
  onToggleHouseRest, 
  onUpgradeWithFragments,
  constructionFragments = 0,
  minerBalance = 0,
  isIrisActive = true,
  irisContract = null,
  onToggleIrisActive = null,
  isArmorerActive = false,
  armorerContract = null,
  onOpenArmorerHire
}) {
  const [activeTab, setActiveTab] = useState('beds'); // 'beds' | 'armory' | 'upgrade'

  if (!isOpen) return null;

  const currentHouse = resolveHouseTier(currentHouseId);
  const houseIndex = HOUSE_TIERS.findIndex(h => h.id === currentHouse.id);
  const minersInHouse = miners.filter(m => m.status === 'house');
  const minersWaiting = miners.filter(m => m.status === 'waiting_house');

  const handleBuyUpgradeWithFragments = (targetHouse) => {
    const fragCost = targetHouse.fragmentCost || 0;
    const mncCost = targetHouse.mncCost || 0;
    if (constructionFragments < fragCost || minerBalance < mncCost) {
      alert(`Recursos insuficientes. Evolução exige ${fragCost} Fragmentos e ${mncCost.toLocaleString('pt-BR')} Coins. Saldo atual: ${constructionFragments} Fragmentos e ${minerBalance.toLocaleString('pt-BR')} Coins.`);
      return;
    }
    if (onUpgradeWithFragments) {
      const upgraded = onUpgradeWithFragments(targetHouse.id, fragCost, mncCost);
      if (upgraded !== true) return;
      sfx.playLevelUp();
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.6 },
        colors: [targetHouse.color, '#f59e0b', '#ffffff']
      });
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none font-tech">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl p-6 bg-slate-900 border-2 border-slate-700 text-slate-100 shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabeçalho do Abrigo */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-3xl shadow-lg"
              style={{ 
                borderColor: currentHouse.color,
                backgroundColor: `${currentHouse.color}20`
              }}
            >
              {currentHouse.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-arcade text-sm text-amber-400">
                  {currentHouse.name}
                </h3>
                <span 
                  className="text-[10px] font-bold font-tech px-2 py-0.5 rounded-full border"
                  style={{ 
                    borderColor: `${currentHouse.color}60`,
                    color: currentHouse.color,
                    backgroundColor: `${currentHouse.color}15`
                  }}
                >
                  ⚡ {currentHouse.recoverySpeedPct}% Velocidade
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Capacidade: <b className="text-white">{minersInHouse.length}/{currentHouse.slots} leitos ocupados</b>
                {minersWaiting.length > 0 && <span className="text-amber-400 ml-1.5 font-bold font-mono">({minersWaiting.length} na fila)</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-tech">
              <button
                onClick={() => setActiveTab('beds')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  activeTab === 'beds'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🩺 Enfermaria ({minersInHouse.length}/{currentHouse.slots})
              </button>
              <button
                onClick={() => setActiveTab('armory')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'armory'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🔨 John Armeiro</span>
                {isArmorerActive ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('upgrade')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  activeTab === 'upgrade'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🏗️ Evolução da Base
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CONTEÚDO DA ABA 1: CAMAS E PERSONAGENS DESCANSANDO */}
        {activeTab === 'beds' && (
          <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4">
            
            {/* Banner da Dra. Íris (Médica Chefe do Abrigo) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-slate-950 to-teal-500/15 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl border-2 border-emerald-400 bg-slate-950 overflow-hidden flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                  <img src="/assets/heroes/iris.png" alt="Dra. Íris" className="w-full h-full object-contain filter drop-shadow" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-arcade text-xs sm:text-sm text-emerald-400">Dra. Íris</h4>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold font-mono ${
                      isIrisActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {isIrisActive ? '● ATIVA NO ABRIGO' : '○ INATIVA (NÃO APARECE)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
                    Médica Cirurgiã Chefe • Atendimento e Resgate nos Leitos
                  </p>
                </div>
              </div>

              {onToggleIrisActive && (
                <button
                  onClick={onToggleIrisActive}
                  className={`px-3 py-1.5 rounded-xl font-tech text-xs font-bold transition border cursor-pointer active:scale-95 ${
                    isIrisActive
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/80'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {isIrisActive ? 'DESATIVAR' : 'ATIVAR MÉDICA'}
                </button>
              )}
            </div>

            {/* Informação do Revezamento */}
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users size={15} className="text-emerald-400" />
                <span>Revezamento automático: sobreviventes recuperados (100% de vida) retornam à reserva.</span>
              </span>
            </div>

            {/* Tabela oficial de tempo de recuperação por raridade */}
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <h4 className="font-tech font-bold text-xs text-emerald-300 uppercase tracking-wider mb-2">
                ⏱️ Tempo de recuperação por raridade
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-left">
                  <thead className="text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="py-1.5 pr-2">Herói</th>
                      <th className="py-1.5 px-2 text-right">Básico</th>
                      <th className="py-1.5 px-2 text-right">Reforçado</th>
                      <th className="py-1.5 pl-2 text-right">Avançado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Comum', '6h40', '5h20', '4h26min40s'],
                      ['Raro', '8h', '6h24', '5h20'],
                      ['Super Raro', '9h20', '7h28', '6h13min20s'],
                      ['Épico', '10h40', '8h32', '7h06min40s'],
                      ['Lendário', '12h', '9h36', '8h'],
                      ['Super Lendário', '13h20', '10h40', '8h53min20s']
                    ].map(([rarity, basic, reinforced, advanced]) => (
                      <tr key={rarity} className="text-slate-300">
                        <td className="py-1.5 pr-2 font-bold">{rarity}</td>
                        <td className={`py-1.5 px-2 text-right font-mono ${currentHouse.id === 'basic' ? 'text-emerald-300' : ''}`}>{basic}</td>
                        <td className={`py-1.5 px-2 text-right font-mono ${currentHouse.id === 'reinforced' ? 'text-emerald-300' : ''}`}>{reinforced}</td>
                        <td className={`py-1.5 pl-2 text-right font-mono ${currentHouse.id === 'advanced' ? 'text-emerald-300' : ''}`}>{advanced}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                Tempos oficiais para recuperação de 5% a 100% de PV. A Base Básica recupera 142,5 PV por hora; a Reforçada aplica 125% e a Avançada 150%. Sem leito disponível, o herói permanece na fila.
              </p>
            </div>

            {/* Camas Ocupadas na Casa */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-tech font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HeartPulse size={14} className="text-rose-400" />
                  <span>Leitos ocupados ({minersInHouse.length}/{currentHouse.slots}):</span>
                </h4>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Tratamento ativo a {currentHouse.recoverySpeedPct}%
                </span>
              </div>

              {minersInHouse.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  Nenhum sobrevivente em tratamento no momento.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {minersInHouse.map(miner => {
                    const healthPct = Math.round(((miner.currentHealth ?? 5) / (miner.maxHealth || 100)) * 100);
                    return (
                      <div 
                        key={miner.id}
                        className="p-2.5 rounded-2xl bg-slate-950/80 border border-blue-500/30 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{miner.avatar}</span>
                          <div>
                            <span className="font-tech font-bold text-xs text-white block">
                              {miner.name}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-blue-300 font-mono">
                              <HeartPulse size={11} className="text-rose-400" />
                              <span>{healthPct}% ({Math.round(miner.currentHealth ?? 5)}/{miner.maxHealth || 100} PV)</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onToggleHouseRest(miner.id)}
                          disabled={(miner.currentHealth ?? 5) < (miner.maxHealth || 100)}
                          className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {(miner.currentHealth ?? 5) >= (miner.maxHealth || 100) ? 'Retornar à equipe' : 'Em tratamento'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Fila de Espera (Quando a casa está cheia) */}
            {minersWaiting.length > 0 && (
              <div>
                <h4 className="font-tech font-bold text-xs text-amber-400 uppercase tracking-wider mb-2">
                  Fila de espera por leito ({minersWaiting.length} sobreviventes aguardando vaga):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {minersWaiting.map(miner => (
                    <div key={miner.id} className="p-2 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between text-xs">
                      <span className="text-slate-300">{miner.avatar} {miner.name}</span>
                      <span className="text-amber-300 font-mono text-[10px]">Aguardando leito...</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mineradores Ativos na Mina */}
            <div>
              <h4 className="font-tech font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">
                Sobreviventes em combate (máx. 15 simultâneos):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {miners.filter(m => m.status === 'work').map(miner => {
                  const healthPct = Math.round(((miner.currentHealth ?? 100) / (miner.maxHealth || 100)) * 100);
                                    return (
                    <div key={miner.id} className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{miner.avatar}</span>
                        <div>
                          <span className="font-bold text-xs text-white block">{miner.name}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">Vida: {healthPct}%</span>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-xl text-[10px] font-bold bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                        Combate automático
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* CONTEÚDO DA ABA 2: SALA DE ARMAS & OFICINA DO JOHN ARMEIRO */}
        {activeTab === 'armory' && (
          <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4">
            
            {/* Banner de Apresentação do John Armeiro */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-slate-950 to-orange-500/15 border-2 border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-amber-400 bg-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)] overflow-hidden flex items-center justify-center shrink-0">
                    <img 
                      src="/assets/heroes/armeiro.png" 
                      alt="John Armeiro" 
                      className="w-full h-full object-contain filter drop-shadow" 
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-sm shadow-md border border-amber-300 font-bold">
                    🔧
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-arcade text-base text-amber-400">
                      John Armeiro
                    </h3>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-bold font-mono">
                      SALA DE ARMAS
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium mt-0.5">
                    Oficina e Ferraria Central do Abrigo
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight mt-1">
                    Repara a durabilidade das armas para 100% de forma 100% automática, sem assistir anúncios e sem interromper a mineração da equipe.
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0 shrink-0">
                <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
                  isArmorerActive 
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.25)]' 
                    : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                }`}>
                  {isArmorerActive ? '● OFICINA EM OPERAÇÃO' : '○ INATIVO (NÃO APARECE)'}
                </span>

                <button
                  onClick={onOpenArmorerHire}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-arcade text-xs font-bold transition shadow-lg shadow-amber-950/40 cursor-pointer active:scale-95 shrink-0"
                >
                  {isArmorerActive ? 'GERENCIAR PLANO' : 'CONTRATAR JOHN ARMEIRO'}
                </button>
              </div>
            </div>

            {/* Destaque das Vantagens Oficiais */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 mb-1 text-amber-400 font-bold text-xs font-tech">
                  <Sparkles size={14} />
                  <span>REPARO 100% AUTO</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Quando a durabilidade zera (0%), ele restaura instantaneamente para 100% sem o herói parar de minerar.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 mb-1 text-emerald-400 font-bold text-xs font-tech">
                  <Check size={14} />
                  <span>ZERO ANÚNCIOS</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Elimina completamente anúncios obrigatórios de reparo manual durante toda a vigência do contrato.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 mb-1 text-sky-400 font-bold text-xs font-tech">
                  <Clock size={14} />
                  <span>DURAÇÃO REAL</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Armas lendárias duram ~12h contínuas de mineração e armas comuns ~4h antes do reparo automático agir.
                </p>
              </div>
            </div>

            {/* Planos Oficiais Aprovados (Mesmo Custo que a Dra. Íris) */}
            <div className="p-4 rounded-3xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-tech font-bold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench size={14} />
                  <span>Planos de Contratação (Mesmo Custo da Dra. Íris):</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  Pagamento via Coins ou USDT
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {STAFF_PLANS.map(plan => (
                  <div
                    key={plan.id}
                    onClick={onOpenArmorerHire}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 hover:border-amber-400/80 transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-arcade text-xs text-white">{plan.name}</span>
                        {plan.discount && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold font-mono">
                            {plan.discount}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono block mb-2">{plan.durationDays} dias</span>
                      <div className="text-base font-black text-amber-400 font-mono">
                        {plan.costCoins.toLocaleString('pt-BR')} Coins
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        ou ${plan.costUsdt.toFixed(2)} USDT
                      </span>
                    </div>

                    <button
                      onClick={onOpenArmorerHire}
                      className="mt-3 w-full py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-tech font-bold text-xs transition border border-amber-500/40"
                    >
                      Contratar Plano
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* CONTEÚDO DA ABA 3: IMOBILIÁRIA / 4 CASAS OFICIAIS */}
        {activeTab === 'upgrade' && (
          <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-3">
            
            {/* Banner de Fragmentos de Construção */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-950 to-purple-500/20 border border-amber-500/40 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-500/50 p-1 flex items-center justify-center shrink-0 shadow-inner">
                  <img src="/items/construction_fragment.png" alt="Fragmentos" className="w-full h-full object-contain filter drop-shadow" />
                </div>
                <div>
                  <span className="font-arcade text-xs text-amber-300 block">
                    {constructionFragments} FRAGMENTO{constructionFragments === 1 ? '' : 'S'} DE CONSTRUÇÃO DISPONÍVEIS
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Fragmentos obtidos nos Baús de Construção. Evolução permanente da base.
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              A evolução é permanente e sequencial. Cada nível aumenta os leitos visíveis e a capacidade real do ambulatório.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {HOUSE_TIERS.filter(h => h.id !== 'none').map(house => {
                const targetIndex = HOUSE_TIERS.findIndex(h => h.id === house.id);
                const isOwned = currentHouse.id === house.id;
                const isPast = targetIndex < houseIndex;
                const fragCost = house.fragmentCost || 0;
                const mncCost = house.mncCost || 0;
                const canAffordFrags = constructionFragments >= fragCost && minerBalance >= mncCost;

                return (
                  <div 
                    key={house.id}
                    className={`p-4 rounded-3xl border-2 transition flex flex-col justify-between text-left ${
                      isOwned 
                        ? 'border-amber-400 bg-amber-950/30 ring-1 ring-amber-400/50 shadow-md' 
                        : (isPast ? 'border-slate-800 bg-slate-950/40 opacity-50' : 'border-slate-800 bg-slate-950/80 hover:border-slate-700')
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{house.icon}</span>
                        <span 
                          className="font-arcade text-xs font-bold px-2.5 py-0.5 rounded-lg border"
                          style={{
                            borderColor: `${house.color}40`,
                            color: house.color,
                            backgroundColor: `${house.color}15`
                          }}
                        >
                          {house.slots} LEITOS • NÍVEL {house.level}
                        </span>
                      </div>

                      {house.image && (
                        <div className="w-full h-44 rounded-2xl bg-slate-900/90 border border-slate-800 p-1.5 mb-2.5 flex items-center justify-center overflow-hidden">
                          <img
                            src={house.image}
                            alt={house.name}
                            className="w-full h-full object-contain drop-shadow-lg scale-105"
                          />
                        </div>
                      )}

                      <h4 className="font-tech font-bold text-sm text-white mb-1">
                        {house.name}
                      </h4>

                      <p className="text-[11px] text-slate-400 font-tech leading-relaxed mb-3">
                        {house.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-tech text-slate-400">Fragmentos:</span>
                        <span className="font-mono text-emerald-400 font-bold">🧱 {fragCost}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-tech text-slate-400">Custo em Coins:</span>
                        <span className="font-mono text-amber-300 font-bold">🪙 {mncCost.toLocaleString('pt-BR')} Coins</span>
                      </div>

                      {isOwned ? (
                        <span className="text-xs font-tech font-bold text-emerald-400 flex items-center justify-center gap-1 py-1.5 bg-emerald-950/40 rounded-xl border border-emerald-500/30">
                          <Check size={14} /> Base Ativa do Jogador
                        </span>
                      ) : isPast ? (
                        <span className="text-xs font-tech text-slate-500 text-center block py-1.5 bg-slate-900/50 rounded-xl">
                          Nível Anterior (Superado)
                        </span>
                      ) : targetIndex === houseIndex + 1 ? (
                        /* Apenas a próxima casa sequencial pode ser evoluída por crafting */
                        <button
                          onClick={() => handleBuyUpgradeWithFragments(house)}
                          disabled={!canAffordFrags}
                          className={`w-full py-2.5 px-3 rounded-xl font-arcade text-xs font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-2 ${
                            canAffordFrags 
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-emerald-950/40' 
                              : 'bg-slate-800/80 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                          }`}
                        >
                          🔨 EVOLUIR BASE
                        </button>
                      ) : (
                        /* Proibido pular níveis */
                        <span className="text-xs font-tech text-slate-500 text-center block py-1.5 bg-slate-900/50 rounded-xl border border-slate-800">
                          🔒 Requer {HOUSE_TIERS[targetIndex - 1]?.name || 'Nível Anterior'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
