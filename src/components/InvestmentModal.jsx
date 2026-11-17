import React, { useState } from 'react';
import { X, Wallet, TrendingUp, ShieldCheck, DollarSign, ArrowUpRight, Sparkles, Check, Flame, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ENTRY_PACKAGES, ROI_PROFILES, WITHDRAWAL_RULES, calculateWithdrawalTax } from '../data/investmentData';
import { MINER_ROSTER } from '../data/minersCatalog';
import { sfx } from '../utils/sfx';

export default function InvestmentModal({ 
  isOpen, 
  onClose, 
  totalInvested = 50, 
  totalMined = 0, 
  bcoinBalance = 0,
  minersCount = 3,
  onBatchMintPackage 
}) {
  const [activeTab, setActiveTab] = useState('packages'); // 'packages' | 'roi'
  const [isMinting, setIsMinting] = useState(false);

  if (!isOpen) return null;

  const currentTaxPct = calculateWithdrawalTax(totalInvested, totalMined);
  const roiPct = totalInvested > 0 ? Math.min(500, Math.round((totalMined / totalInvested) * 100)) : 0;
  const isBreakeven = roiPct >= 100;

  const handleBuyPackage = (pkg) => {
    if (bcoinBalance < pkg.costBcoin || isMinting) return;
    setIsMinting(true);

    sfx.playLevelUp();

    setTimeout(() => {
      onBatchMintPackage(pkg);
      setIsMinting(false);

      confetti({
        particleCount: pkg.heroesCount >= 10 ? 180 : 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: [pkg.color, '#fbbf24', '#ffffff']
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl p-6 bg-slate-900 border-2 border-slate-700 text-slate-100 shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl border border-amber-500/30">
              💎
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-arcade text-sm text-amber-400">
                  INVESTIMENTO & PAINEL DE ROI
                </h3>
                <span className="text-[10px] font-bold font-tech px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  REGRAS DO BOMBCRYPTO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-tech">
                Entrada no jogo: 10 BCOIN por herói • Limite: 15 heróis simultâneos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-tech">
              <button
                onClick={() => setActiveTab('packages')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  activeTab === 'packages'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📦 Pacotes de Entrada
              </button>
              <button
                onClick={() => setActiveTab('roi')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  activeTab === 'roi'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📊 Termômetro de ROI ({roiPct}%)
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ABA 1: PACOTES DE ENTRADA (MINT EM LOTE DO BOMBCRYPTO) */}
        {activeTab === 'packages' && (
          <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-tech bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span>Seu Saldo Disponível: <b className="text-amber-300 font-mono">{bcoinBalance.toFixed(3)} BCOIN</b></span>
              <span>Heróis na Equipe: <b className="text-white">{minersCount}/15 permitidos</b></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {ENTRY_PACKAGES.map(pkg => {
                const canAfford = bcoinBalance >= pkg.costBcoin;
                const canAddHeroes = minersCount + pkg.heroesCount <= 15;

                return (
                  <div
                    key={pkg.id}
                    className={`p-4 rounded-3xl border-2 transition flex flex-col justify-between text-left relative ${
                      pkg.popular
                        ? 'border-amber-400 bg-amber-950/25 ring-1 ring-amber-400/50 shadow-xl'
                        : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-arcade text-[9px] font-bold shadow-md">
                        MAIS POPULAR NO BOMB
                      </span>
                    )}

                    {pkg.badge && (
                      <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-arcade text-[9px] font-bold shadow-md">
                        {pkg.badge}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">{pkg.icon}</span>
                        <div className="text-right">
                          <span className="font-arcade text-sm text-amber-300 font-bold block">
                            {pkg.costBcoin} BCOIN
                          </span>
                          <span className="text-[10px] text-slate-400 font-tech">
                            {pkg.heroesCount} {pkg.heroesCount === 1 ? 'Minerador' : 'Mineradores'}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-tech font-bold text-sm text-white mb-0.5">
                        {pkg.name}
                      </h4>
                      <span className="text-[10px] text-amber-400/90 font-tech block mb-2 font-bold">
                        {pkg.tagline}
                      </span>

                      <p className="text-[11px] text-slate-400 font-tech leading-relaxed mb-3">
                        {pkg.description}
                      </p>

                      <div className="space-y-1 mb-3 pt-2 border-t border-slate-800 text-[10px] font-tech text-slate-300">
                        {pkg.features.map((feat, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <Check size={11} className="text-emerald-400 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>

                      {/* Estimativas de retorno do Bomb Crypto (Modelo 3 Meses) */}
                      <div className="bg-slate-900 p-2.5 rounded-xl text-[10px] font-tech text-slate-400 space-y-1 mb-2">
                        <div className="flex justify-between items-center">
                          <span>Farm estimado:</span>
                          <b className="text-emerald-400 font-mono">~{pkg.estimatedDailyBcoin} BCOIN/dia</b>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>ROI Base (Passivo):</span>
                          <b className="text-slate-300 font-mono">~{pkg.estimatedRoiDays} dias (~3 meses)</b>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>ROI com Casa & Boosts:</span>
                          <b className="text-amber-400 font-mono font-bold">~{pkg.activeRoiDays} dias (~1.7 meses)</b>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyPackage(pkg)}
                      disabled={!canAfford || !canAddHeroes || isMinting}
                      className={`w-full py-2.5 rounded-xl font-arcade text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5 ${
                        canAfford && canAddHeroes && !isMinting
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 cursor-pointer'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800'
                      }`}
                    >
                      <Sparkles size={13} />
                      <span>
                        {!canAddHeroes 
                          ? 'LIMITE 15 ATINGIDO' 
                          : (canAfford ? (isMinting ? 'MINTANDO...' : `ENTRAR POR ${pkg.costBcoin} B`) : 'SALDO INSUFICIENTE')}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ABA 2: TERMÔMETRO DE ROI & REGRAS DE SAQUE (MECÂNICA REAL DO BOMBCRYPTO) */}
        {activeTab === 'roi' && (
          <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4">
            
            {/* Cards de Métricas Financeiras */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 font-tech block mb-1">
                  TOTAL INVESTIDO (MINT)
                </span>
                <span className="font-arcade text-lg text-rose-400 font-bold">
                  {totalInvested.toFixed(3)} BCOIN
                </span>
                <span className="text-[10px] text-slate-500 block font-tech mt-0.5">
                  Custo de aquisição da equipe
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 font-tech block mb-1">
                  TOTAL MINERADO
                </span>
                <span className="font-arcade text-lg text-emerald-400 font-bold">
                  {totalMined.toFixed(3)} BCOIN
                </span>
                <span className="text-[10px] text-slate-500 block font-tech mt-0.5">
                  Extraído das rochas e baús
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 font-tech block mb-1">
                  RETORNO DO INVESTIMENTO (ROI)
                </span>
                <span className={`font-arcade text-lg font-bold ${isBreakeven ? 'text-amber-400' : 'text-sky-400'}`}>
                  {roiPct}% {isBreakeven ? '🚀' : ''}
                </span>
                <span className="text-[10px] text-slate-500 block font-tech mt-0.5">
                  {isBreakeven ? 'Breakeven Atingido (Lucro puro)' : 'Recuperando investimento'}
                </span>
              </div>
            </div>

            {/* Barra de Progresso de Breakeven */}
            <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800">
              <div className="flex justify-between items-center text-xs font-tech mb-2">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-amber-400" />
                  <span>Progresso para o Breakeven (100% do Investimento Pago):</span>
                </span>
                <span className="text-amber-300 font-mono font-bold">{Math.min(100, roiPct)}%</span>
              </div>

              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(5, roiPct))}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-tech mt-1.5">
                <span>0% (Início)</span>
                <span>50% (Metade)</span>
                <span className="text-emerald-400 font-bold">100% Breakeven (Meta)</span>
              </div>
            </div>

            {/* Projeção dos 3 Perfis de Retorno (Curva Sustentável de ~90 Dias) */}
            <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-tech font-bold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-400" />
                  <span>Projeção dos Perfis de Jogador (Curva de 3 Meses):</span>
                </h4>
                <span className="text-[10px] font-bold font-tech px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  90 DIAS SUSTENTÁVEL
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {ROI_PROFILES.map(profile => (
                  <div 
                    key={profile.id}
                    className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 text-left flex flex-col justify-between"
                    style={{ borderTop: `3px solid ${profile.color}` }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-tech font-bold text-xs text-white">{profile.title}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {profile.badge}
                        </span>
                      </div>
                      <div className="font-arcade text-xs text-amber-300 font-bold mb-1">
                        {profile.roiDays}
                      </div>
                      <div className="text-[10px] font-tech text-emerald-400 mb-2">
                        Farm: {profile.dailyBcoinRate}
                      </div>
                      <p className="text-[10px] text-slate-400 font-tech leading-relaxed">
                        {profile.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-[10px] font-tech text-slate-400 space-y-1">
                <span className="text-amber-300 font-bold block mb-0.5 flex items-center gap-1">
                  <Zap size={12} className="text-amber-400" />
                  Por que a Curva de 3 Meses é a Mais Saudável?
                </span>
                <p className="leading-relaxed">
                  Diferente do Bomb Crypto de 2021 (onde ROIs de 15 a 30 dias geraram hiperinflação rápida e esgotaram a liquidez), o ciclo de ~90 dias equilibra a emissão controlada de BCOIN com drenos contínuos (Casas, Afiação de Picaretas e Taxa de 6% do Marketplace) somados à injeção de capital real via Anúncios Patrocinados (Playable Ads).
                </p>
              </div>
            </div>

            {/* Tabela de Imposto de Saque (ROI Tax do Bomb Crypto) */}
            <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800">
              <h4 className="font-tech font-bold text-xs text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck size={14} />
                <span>Tabela Oficial de Taxa de Saque (ROI Fee do Bomb Crypto):</span>
              </h4>

              <div className="space-y-1.5 text-xs font-tech">
                {WITHDRAWAL_RULES.taxTiers.map((tier, i) => {
                  const isCurrentTier = (i === 0 && roiPct < 100) || 
                                       (i === 1 && roiPct >= 100 && roiPct < 200) || 
                                       (i === 2 && roiPct >= 200);

                  return (
                    <div 
                      key={i}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                        isCurrentTier 
                          ? 'border-amber-400 bg-amber-950/30 text-amber-200 ring-1 ring-amber-400/40' 
                          : 'border-slate-800/80 bg-slate-900/40 text-slate-400'
                      }`}
                    >
                      <span>{tier.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-arcade text-xs font-bold">{tier.taxPct}% taxa</span>
                        {isCurrentTier && (
                          <span className="text-[9px] bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full font-bold uppercase">
                            Sua Taxa Atual
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[10px] text-slate-500 font-tech mt-3 leading-relaxed">
                * No Bomb Crypto, quanto mais você reinveste e joga, menor fica a taxa de saque para proteger a liquidez do ecossistema.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
