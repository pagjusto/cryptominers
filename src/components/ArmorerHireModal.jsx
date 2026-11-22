import React, { useState } from 'react';
import { X, Check, ShieldCheck, Wrench, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { STAFF_PLANS, STAFF_MEMBERS } from '../data/staffCatalog';
import { sfx } from '../utils/sfx';

export default function ArmorerHireModal({
  isOpen,
  onClose,
  coinsBalance = 0,
  usdtBalance = 0,
  currentContract = null,
  onHireArmorer
}) {
  const [selectedPlanId, setSelectedPlanId] = useState('quarterly');
  const [paymentCurrency, setPaymentCurrency] = useState('coins'); // 'coins' | 'usdt'

  if (!isOpen) return null;

  const armorer = STAFF_MEMBERS.armeiro;
  const selectedPlan = STAFF_PLANS.find(p => p.id === selectedPlanId) || STAFF_PLANS[1];
  const isCurrentlyActive = Boolean(currentContract?.active && currentContract?.expiresAt > Date.now());

  const daysRemaining = isCurrentlyActive 
    ? Math.max(0, Math.ceil((currentContract.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;

  const cost = paymentCurrency === 'coins' ? selectedPlan.costCoins : selectedPlan.costUsdt;
  const canAfford = paymentCurrency === 'coins' ? coinsBalance >= cost : true;

  const handleConfirmHire = () => {
    if (paymentCurrency === 'coins' && coinsBalance < selectedPlan.costCoins) {
      alert(`Saldo insuficiente de Coins. Você precisa de ${selectedPlan.costCoins.toLocaleString('pt-BR')} Coins (Saldo atual: ${coinsBalance.toFixed(2)} Coins).`);
      return;
    }

    if (onHireArmorer) {
      const success = onHireArmorer(selectedPlan, paymentCurrency);
      if (success !== false) {
        sfx.playLevelUp();
        confetti({
          particleCount: 130,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#d97706', '#ffffff']
        });
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none font-tech">
      <div 
        className="relative w-full max-w-xl max-h-[92vh] rounded-3xl p-5 sm:p-6 bg-slate-900 border-2 border-amber-500/50 text-slate-100 shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* TOPO: Cabeçalho com Avatar e Apresentação do John Armeiro */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3.5">
            {/* Moldura do Armeiro com Borda Dourada */}
            <div className="relative">
              <div 
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-amber-400 bg-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.35)] overflow-hidden flex items-center justify-center shrink-0"
              >
                <img 
                  src={armorer.image} 
                  alt={armorer.name} 
                  className="w-full h-full object-contain filter drop-shadow" 
                />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-xs shadow-md border border-amber-300 font-bold">
                🔧
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-arcade text-sm sm:text-base text-amber-400 tracking-wide">
                  {armorer.name}
                </h3>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-bold font-mono">
                  {armorer.badge}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                {armorer.title}
              </p>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                {armorer.specialty}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* CORPO DO MODAL */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4">
          
          {/* Status do Contrato Atual */}
          <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
            isCurrentlyActive 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
              : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={18} className={isCurrentlyActive ? 'text-emerald-400' : 'text-amber-400'} />
              <div>
                <span className="font-bold block">
                  {isCurrentlyActive ? 'Oficina do John Armeiro Ativa' : 'John Armeiro em Standby (Disponível para Contratação)'}
                </span>
                <span className="text-[11px] opacity-80 block">
                  {isCurrentlyActive 
                    ? `Contrato ativo com ${daysRemaining} dia(s) restantes de reparos automáticos.`
                    : 'Contrate o Armeiro para manter as armas dos 15 heróis 100% operantes sem interrupções.'}
                </span>
              </div>
            </div>
            {isCurrentlyActive && (
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px] border border-emerald-500/40 shrink-0">
                ⚡ ATIVO
              </span>
            )}
          </div>

          {/* Benefícios Oficiais da Sala de Armas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px]">
              <span className="text-amber-400 font-bold block mb-0.5">⚡ Reparo 100% Automático</span>
              <span className="text-slate-400">Quando a arma atinge 0%, o Armeiro restaura para 100% no mesmo segundo.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px]">
              <span className="text-amber-400 font-bold block mb-0.5">🚫 Sem Anúncios de Reparo</span>
              <span className="text-slate-400">Dispensa pausas manuais e cliques em anúncios para afiação de armas.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px]">
              <span className="text-amber-400 font-bold block mb-0.5">📈 Mineração 24/7 sem Queda</span>
              <span className="text-slate-400">Garante taxa ininterrupta da equipe mesmo se você estiver dormindo.</span>
            </div>
          </div>

          {/* Seleção de Moeda de Pagamento */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-tech text-xs text-slate-400 font-bold uppercase">Forma de Pagamento:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setPaymentCurrency('coins')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    paymentCurrency === 'coins' 
                      ? 'bg-amber-500 text-slate-950 shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🪙 Coins ({coinsBalance.toFixed(1)})
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentCurrency('usdt')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    paymentCurrency === 'usdt' 
                      ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  💵 USDT (1 MNC = $0,01)
                </button>
              </div>
            </div>
          </div>

          {/* Planos Oficiais Aprovados (Mesmo Custo que a Dra. Íris) */}
          <div className="space-y-2">
            <span className="font-tech text-xs text-slate-400 font-bold uppercase block">
              Escolha o Período de Atuação:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {STAFF_PLANS.map(plan => {
                const isSelected = selectedPlanId === plan.id;
                const planCost = paymentCurrency === 'coins' ? `${plan.costCoins.toLocaleString('pt-BR')} Coins` : `$${plan.costUsdt.toFixed(2)} USDT`;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-3 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between text-left relative ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/30 ring-1 ring-amber-400/50 shadow-lg'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    {plan.discount && (
                      <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-mono font-bold text-[9px] shadow-sm">
                        {plan.discount}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-arcade text-xs text-white">
                          {plan.name}
                        </span>
                        <Clock size={12} className={isSelected ? 'text-amber-400' : 'text-slate-500'} />
                      </div>
                      <span className="text-[10px] text-slate-400 block mb-2">
                        {plan.durationDays} dias de cobertura
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="font-mono text-sm font-bold text-amber-300 block">
                        {planCost}
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        {plan.tagline}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RODAPÉ COM BOTÃO DE CONTRATAÇÃO */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-[11px] text-slate-400 block">Total a pagar:</span>
            <span className="font-mono text-base font-bold text-amber-300">
              {paymentCurrency === 'coins' 
                ? `${selectedPlan.costCoins.toLocaleString('pt-BR')} Coins` 
                : `$${selectedPlan.costUsdt.toFixed(2)} USDT`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 font-tech text-xs font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmHire}
              disabled={!canAfford}
              className={`px-5 py-2.5 rounded-xl font-arcade text-xs font-bold transition shadow-lg flex items-center gap-2 cursor-pointer ${
                canAfford
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-950/40 active:scale-95'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Sparkles size={13} className="fill-slate-950" />
              <span>{isCurrentlyActive ? 'RENOVAR JOHN ARMEIRO' : 'CONTRATAR JOHN ARMEIRO'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
