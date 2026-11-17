import React, { useState } from 'react';
import { X, Home, Sparkles, HeartPulse, ArrowUpRight, Check, Shield, Zap, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { HOUSE_TIERS, resolveHouseTier } from '../data/housesData';
import { sfx } from '../utils/sfx';

export default function HouseModal({ 
  isOpen, 
  onClose, 
  currentHouseId = 'basic', 
  miners = [], 
  onToggleHouseRest, 
  onUpgradeHouse, 
  onUpgradeWithFragments,
  constructionFragments = 0,
  minerBalance = 0,
  walletState = { isConnected: false, usdtBalance: 0 }
}) {
  const [activeTab, setActiveTab] = useState('beds'); // 'beds' | 'upgrade'

  if (!isOpen) return null;

  const currentHouse = resolveHouseTier(currentHouseId);
  const houseIndex = HOUSE_TIERS.findIndex(h => h.id === currentHouse.id);
  const minersInHouse = miners.filter(m => m.status === 'house');
  const minersWaiting = miners.filter(m => m.status === 'waiting_house');

  // Custos em Fragmentos de Construção por categoria de casa
  const FRAGMENT_COSTS = {
    reinforced: 5,
    advanced: 10,
    legendary: 15
  };

  const handleBuyUpgradeWithFragments = (targetHouse) => {
    const fragCost = FRAGMENT_COSTS[targetHouse.id] || 5;
    if (constructionFragments < fragCost) {
      alert(`Fragmentos insuficientes! Necessário: ${fragCost} Fragmentos de Construção (você tem ${constructionFragments}).`);
      return;
    }
    if (onUpgradeWithFragments) {
      onUpgradeWithFragments(targetHouse.id, fragCost);
      sfx.playLevelUp();
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.6 },
        colors: [targetHouse.color, '#f59e0b', '#ffffff']
      });
    }
  };

  const handleBuyUpgrade = (targetHouse) => {
    const cost = targetHouse.costUsdt || targetHouse.costBcoin || 25;
    // Permite pagar com MINER in-game ou USDT da carteira
    const canPayWithMiner = minerBalance >= cost;
    const canPayWithUsdt = walletState.isConnected && walletState.usdtBalance >= cost;

    if (!canPayWithMiner && !canPayWithUsdt) {
      alert(`Saldo insuficiente! Esta casa custa $${cost} (MINER ou USDT).`);
      return;
    }

    onUpgradeHouse(targetHouse.id, cost);
    sfx.playLevelUp();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: [targetHouse.color, '#fbbf24', '#ffffff']
    });
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
                🩺 Tratamentos ({minersInHouse.length}/{currentHouse.slots})
              </button>
              <button
                onClick={() => setActiveTab('upgrade')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  activeTab === 'upgrade'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🏠 Imobiliária
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
            
            {/* Informação do Revezamento */}
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users size={15} className="text-emerald-400" />
                <span>Revezamento automático: sobreviventes recuperados (100% de vida) retornam à reserva.</span>
              </span>
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
                  Nenhum sobrevivente em tratamento. Ao atingir 5% de vida, um combatente será enviado para cá automaticamente.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {minersInHouse.map(miner => {
                    const staminaPct = Math.round(((miner.currentHealth ?? 5) / (miner.maxHealth || 100)) * 100);
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
                              <span>{staminaPct}% ({Math.round(miner.currentHealth ?? 5)}/{miner.maxHealth || 100} PV)</span>
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
                  const staminaPct = Math.round(((miner.currentHealth ?? 100) / (miner.maxHealth || 100)) * 100);
                                    return (
                    <div key={miner.id} className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{miner.avatar}</span>
                        <div>
                          <span className="font-bold text-xs text-white block">{miner.name}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">Vida: {staminaPct}%</span>
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

        {/* CONTEÚDO DA ABA 2: IMOBILIÁRIA / 4 CASAS OFICIAIS */}
        {activeTab === 'upgrade' && (
          <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-3">
            
            {/* Banner de Fragmentos de Construção */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-950 to-purple-500/20 border border-amber-500/40 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🧱</span>
                <div>
                  <span className="font-arcade text-xs text-amber-300 block">
                    {constructionFragments} FRAGMENTO{constructionFragments === 1 ? '' : 'S'} DE CONSTRUÇÃO DISPONÍVEIS
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Obtidos nos Baús de Construção. Evolua seu abrigo sem gastar moedas!
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Evolua seu abrigo para tratar mais sobreviventes simultaneamente e acelerar a recuperação:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HOUSE_TIERS.filter(h => h.id !== 'none').map(house => {
                const targetIndex = HOUSE_TIERS.findIndex(h => h.id === house.id);
                const isOwned = currentHouse.id === house.id;
                const isPast = targetIndex < houseIndex;
                const fragCost = FRAGMENT_COSTS[house.id] || 5;
                const canAffordFrags = constructionFragments >= fragCost;

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
                        <span className="text-3xl">{house.icon}</span>
                        <span 
                          className="font-arcade text-xs font-bold px-2.5 py-0.5 rounded-lg border"
                          style={{
                            borderColor: `${house.color}40`,
                            color: house.color,
                            backgroundColor: `${house.color}15`
                          }}
                        >
                          {house.slots} VAGAS • {house.recoverySpeedPct}% VEL
                        </span>
                      </div>

                      <h4 className="font-tech font-bold text-sm text-white mb-1">
                        {house.name}
                      </h4>

                      <p className="text-[11px] text-slate-400 font-tech leading-relaxed mb-3">
                        {house.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-tech text-slate-400">
                          Requisito de Crafting:
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">
                          🧱 {fragCost} Fragmentos
                        </span>
                      </div>

                      {isOwned ? (
                        <span className="text-xs font-tech font-bold text-emerald-400 flex items-center justify-center gap-1 py-1.5 bg-emerald-950/40 rounded-xl border border-emerald-500/30">
                          <Check size={14} /> Casa Ativa do Jogador
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
                          🔨 CRAFTAR EVOLUÇÃO (🧱 {fragCost} FRAGS)
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
