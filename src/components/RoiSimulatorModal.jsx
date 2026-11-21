import React, { useState } from 'react';
import { X, TrendingUp, Calculator, ShieldCheck, Sparkles, Home, Layers, DollarSign, Calendar, Clock, ArrowRight, Settings, Info, Award, BarChart3 } from 'lucide-react';
import { calculateRoiScenario } from '../utils/roiSimulatorEngine';
import { getCryptoZombiesConfig } from '../data/cryptoZombiesConfig';

export default function RoiSimulatorModal({
  isOpen,
  onClose,
  onOpenSummonModal,
  onOpenAdminConfig
}) {
  const [selectedChest, setSelectedChest] = useState('explorer');
  const [chestQuantity, setChestQuantity] = useState(1);
  const [selectedHouse, setSelectedHouse] = useState('basic');
  const [activeScenario, setActiveScenario] = useState('expected'); // 'conservative' | 'expected' | 'optimistic'

  if (!isOpen) return null;

  const config = getCryptoZombiesConfig();

  // Calcula os 3 cenários simultaneamente para permitir comparação lado a lado
  const conservativeData = calculateRoiScenario({
    chestCategory: selectedChest,
    chestQuantity,
    houseId: selectedHouse,
    scenario: 'conservative',
    config
  });

  const expectedData = calculateRoiScenario({
    chestCategory: selectedChest,
    chestQuantity,
    houseId: selectedHouse,
    scenario: 'expected',
    config
  });

  const optimisticData = calculateRoiScenario({
    chestCategory: selectedChest,
    chestQuantity,
    houseId: selectedHouse,
    scenario: 'optimistic',
    config
  });

  const currentData = activeScenario === 'conservative'
    ? conservativeData
    : activeScenario === 'optimistic'
      ? optimisticData
      : expectedData;

  const currentChestInfo = config.chests[selectedChest] || config.chests.miner;
  const currentHouseInfo = config.houses[selectedHouse] || config.houses.basic;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl p-5 sm:p-6 bg-slate-900 border-2 border-amber-500/40 text-slate-100 shadow-2xl flex flex-col overflow-hidden font-tech"
        onClick={e => e.stopPropagation()}
      >
        {/* CABEÇALHO OFICIAL */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 flex items-center justify-center text-2xl shadow-lg border border-amber-300/40 font-arcade">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-arcade text-sm sm:text-base text-amber-400 tracking-wider">
                  SIMULADOR DE ROI — CRYPTOZOMBIES
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  MODELO MATEMÁTICO REAL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Simule projeções reais considerando limite de 15 mineradores ativos, estamina e velocidade da casa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAdminConfig && (
              <button
                onClick={onOpenAdminConfig}
                title="Abrir Painel Administrativo de Probabilidades e Economia"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <Settings size={14} />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* CORPO DO SIMULADOR (SCROLLÁVEL) */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4">

          {/* 1. SELETOR DE BAÚ E QUANTIDADE */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Layers size={14} className="text-amber-400" />
                1. Escolha a Categoria do Baú
              </span>
              <span className="text-xs text-amber-400 font-mono">
                {currentChestInfo.heroesCount * chestQuantity} heróis projetados
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.values(config.chests).map(c => {
                const isSelected = selectedChest === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedChest(c.id)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/30 ring-1 ring-amber-400/50 shadow-md'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-2xl">{c.icon}</span>
                        <span className="font-arcade text-[10px] text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.5 rounded">
                          ${c.costUsdt} USDT
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-white">
                        {c.name}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {c.heroesCount} {c.heroesCount === 1 ? 'herói' : 'heróis'} por baú
                      </p>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[9px] font-mono flex justify-between text-slate-400">
                      <span>Épico: {c.probabilities.epic}%</span>
                      <span className="text-amber-400 font-bold">Lendário: {c.probabilities.legendary}%</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quantidade de Baús */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-xs text-slate-400">Quantidade de Baús:</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 5, 10].map(qty => (
                  <button
                    key={qty}
                    onClick={() => setChestQuantity(qty)}
                    className={`px-3 py-1 rounded-xl font-arcade text-xs font-bold transition cursor-pointer ${
                      chestQuantity === qty
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {qty}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. SELETOR DA CASA DE CoinsAÇÃO */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Home size={14} className="text-blue-400" />
                2. Selecione a Casa para Descanso e Revezamento
              </span>
              <span className="text-xs text-blue-300 font-mono">
                {currentHouseInfo.slots} vagas • {Math.round(currentHouseInfo.recoverySpeedMultiplier * 100)}% velocidade
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {Object.values(config.houses).map(h => {
                const isSelected = selectedHouse === h.id;
                return (
                  <button
                    key={h.id}
                    onClick={() => setSelectedHouse(h.id)}
                    className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-400 bg-blue-950/30 ring-1 ring-blue-400/50 shadow-md'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">{h.icon}</span>
                        <span className="font-arcade text-[10px] text-blue-300 font-bold">
                          {h.costUsdt > 0 ? `$${h.costUsdt}` : 'Grátis'}
                        </span>
                      </div>
                      <h4 className="font-bold text-[11px] text-white leading-tight">
                        {h.name.split(' ')[0]} {h.name.split(' ')[1] || ''}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {h.slots} vagas
                      </p>
                    </div>

                    <span className="mt-2 text-[10px] font-mono font-bold text-emerald-400">
                      {Math.round(h.recoverySpeedMultiplier * 100)}% Vel.
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. SELETOR DOS 3 CENÁRIOS COMPARATIVOS */}
          <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 px-3 font-bold uppercase tracking-wider">
              Cenário de Análise:
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveScenario('conservative')}
                className={`px-3.5 py-1.5 rounded-xl font-tech text-xs font-bold transition cursor-pointer ${
                  activeScenario === 'conservative'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🔴 Conservador
              </button>
              <button
                onClick={() => setActiveScenario('expected')}
                className={`px-4 py-1.5 rounded-xl font-tech text-xs font-bold transition cursor-pointer ${
                  activeScenario === 'expected'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🟡 Esperado (Médio)
              </button>
              <button
                onClick={() => setActiveScenario('optimistic')}
                className={`px-3.5 py-1.5 rounded-xl font-tech text-xs font-bold transition cursor-pointer ${
                  activeScenario === 'optimistic'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🟢 Otimista
              </button>
            </div>
          </div>

          {/* 4. CARDS DE MÉTRICAS PRINCIPAIS (INVESTIMENTO, ROI E PAYBACK) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                Investimento Total
              </span>
              <span className="font-arcade text-lg text-white font-bold block">
                ${currentData.totalInvestment} USDT
              </span>
              <span className="text-[10px] text-slate-500">
                Baús: ${currentData.chestCost} • Casa: ${currentData.houseCost}
              </span>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-emerald-500/30 text-center">
              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block mb-1">
                Produção Diária
              </span>
              <span className="font-arcade text-lg text-emerald-400 font-bold block">
                +{currentData.effectiveCoinsPerDay} Coins
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                ≈ ${currentData.dailyUsd} USD / dia
              </span>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-amber-500/30 text-center">
              <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block mb-1">
                ROI Diário Estimado
              </span>
              <span className="font-arcade text-lg text-amber-300 font-bold block">
                {currentData.roiDailyPct}% / dia
              </span>
              <span className="text-[10px] text-slate-400">
                {currentData.effectiveCoinsPerMonth} Coins / mês
              </span>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-purple-500/30 text-center">
              <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider block mb-1">
                Prazo de Payback
              </span>
              <span className="font-arcade text-lg text-purple-300 font-bold block">
                ~{currentData.paybackDays} Dias
              </span>
              <span className="text-[10px] text-slate-400">
                {currentData.paybackDays <= 90 ? '🚀 Retorno Sustentável' : 'Mineração Passiva'}
              </span>
            </div>
          </div>

          {/* 5. DETALHES DE EQUIPE, DISTRIBUIÇÃO E CAPACIDADE DA MINA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Distribuição das Raridades */}
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Distribuição de Raridades ({currentData.totalHeroes} Heróis)</span>
                <span className="text-amber-400 font-mono">{activeScenario.toUpperCase()}</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Comum</span>
                  <span className="font-bold text-slate-200">{currentData.rarities.common}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-blue-500/30">
                  <span className="text-[10px] text-blue-400 block">Raro</span>
                  <span className="font-bold text-blue-300">{currentData.rarities.rare}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-purple-500/30">
                  <span className="text-[10px] text-purple-400 block">Épico</span>
                  <span className="font-bold text-purple-300">{currentData.rarities.epic}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-amber-500/30">
                  <span className="text-[10px] text-amber-400 block">Lendário</span>
                  <span className="font-bold text-amber-300">{currentData.rarities.legendary}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                As probabilidades são aplicadas individualmente a cada herói sorteado dos baús adquiridos.
              </p>
            </div>

            {/* Lógica da Mina & Revezamento */}
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Dinâmica da Mina & Revezamento</span>
                <span className="text-emerald-400 font-mono">Uptime: {currentData.effectiveUptimePct}%</span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between py-0.5 border-b border-slate-900 text-slate-400">
                  <span>Capacidade Ativa da Mina:</span>
                  <b className="text-white">{currentData.maxActive} / 15 minerando</b>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-900 text-slate-400">
                  <span>Equipe Reserva para Revezamento:</span>
                  <b className="text-purple-300">{currentData.reserves} heróis</b>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-900 text-slate-400">
                  <span>Tempo Médio de Trabalho Contínuo:</span>
                  <b className="text-amber-300">{currentData.avgWorkHours} horas</b>
                </div>
                <div className="flex justify-between py-0.5 text-slate-400">
                  <span>Tempo de Descanso na Casa:</span>
                  <b className="text-blue-300">{currentData.avgRestHours} horas ({Math.round(currentData.recoveryMultiplier * 100)}% vel.)</b>
                </div>
              </div>
            </div>

          </div>

          {/* 6. PROJEÇÃO DE RETORNO ACUMULADO */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 size={15} className="text-emerald-400" />
                Retorno Acumulado Projetado (Bruto em USDT)
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                1 Coins = US$ ${(config.minerCoinUsdtRate || 0.01).toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">Em 30 Dias</span>
                <span className="font-arcade text-sm text-white font-bold block">
                  ${currentData.projectedReturn30d}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {Math.round((currentData.projectedReturn30d / currentData.totalInvestment) * 100)}% recuperado
                </span>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">Em 60 Dias</span>
                <span className="font-arcade text-sm text-white font-bold block">
                  ${currentData.projectedReturn60d}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {Math.round((currentData.projectedReturn60d / currentData.totalInvestment) * 100)}% recuperado
                </span>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 block mb-0.5">Em 90 Dias (~3 meses)</span>
                <span className="font-arcade text-sm text-emerald-400 font-bold block">
                  ${currentData.projectedReturn90d}
                </span>
                <span className="text-[10px] text-emerald-400/80 font-mono">
                  {Math.round((currentData.projectedReturn90d / currentData.totalInvestment) * 100)}% recuperado
                </span>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-amber-500/30">
                <span className="text-[10px] text-amber-400 block mb-0.5">Em 180 Dias (~6 meses)</span>
                <span className="font-arcade text-sm text-amber-400 font-bold block">
                  ${currentData.projectedReturn180d}
                </span>
                <span className="text-[10px] text-amber-400/80 font-mono">
                  {Math.round((currentData.projectedReturn180d / currentData.totalInvestment) * 100)}% (Lucro Puro)
                </span>
              </div>
            </div>
          </div>

          {/* 7. NOTA DE TRANSPARÊNCIA E RESPONSABILIDADE */}
          <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <b>Transparência CryptoZombies:</b> Os cálculos acima são estimativas matemáticas calculadas estritamente com base nos parâmetros configurados de probabilidade, produção média, consumo de estamina e cotação oficial configurada de 1 Coins = ${(config.minerCoinUsdtRate || 1.0).toFixed(2)} USDT (não é 1:1 fixo). O simulador considera o funcionamento real da mina (limite de 15 mineradores ativos simultâneos e descansos periódicos na casa) e não constitui garantia de retorno financeiro.
            </p>
          </div>

        </div>

        {/* RODAPÉ DE AÇÃO */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Total a investir:</span>
            <span className="font-arcade text-base text-amber-300 font-bold">
              ${currentData.totalInvestment} USDT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                onClose();
                if (onOpenSummonModal) onOpenSummonModal();
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-arcade text-xs font-bold transition shadow-lg shadow-amber-950/40 cursor-pointer"
            >
              <Sparkles size={16} />
              <span>IR PARA A LOJA DE BAÚS</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
