import React, { useState, useMemo } from 'react';
import { 
  X, 
  BarChart3, 
  Activity, 
  TrendingUp, 
  Flame, 
  Zap, 
  Battery, 
  Home, 
  Users, 
  Clock, 
  DollarSign, 
  Coins, 
  Sparkles, 
  RotateCcw, 
  ShoppingCart, 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle,
  Play,
  Moon,
  ChevronRight,
  Sliders,
  Filter,
  Search,
  AlertCircle,
  Calculator,
  Info,
  Layers,
  Award,
  Calendar
} from 'lucide-react';
import { 
  calculateRealAccountStats, 
  calculateSimulatedAccountStats, 
  calculateUpgradeRoi 
} from '../utils/upgradeSimulatorEngine';
import { calculateRoiScenario } from '../utils/roiSimulatorEngine';
import { getCriptoMynersConfig } from '../data/criptoMynersConfig';
import { MINER_CLASSES } from '../data/minersData';

export default function StatisticsModal({
  isOpen,
  onClose,
  initialTab = 'overview',
  miners = [],
  bcoin = 0,
  totalMinedSession = 0,
  totalInvested = 0,
  roiPct = 0,
  currentWithdrawalTax = 10,
  currentHouse = { id: 'basic', name: 'Casa Básica', slots: 5, recoverySpeedMultiplier: 1.0 },
  currentMine,
  onOpenHouseModal,
  onOpenSummonModal,
  onUpgradeMiner
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const config = useMemo(() => getCriptoMynersConfig(), []);

  // Sincroniza aba inicial quando abre
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Estados do Simulador de ROI (Baús & Casas — Prompt 6088 Oficial)
  const [roiChest, setRoiChest] = useState('explorer');
  const [roiQuantity, setRoiQuantity] = useState(1);
  const [roiHouse, setRoiHouse] = useState('basic');
  const [roiScenario, setRoiScenario] = useState('expected'); // 'conservative' | 'expected' | 'optimistic'

  // Cálculos dos 3 Cenários Oficiais de ROI
  const conservativeData = useMemo(() => calculateRoiScenario({
    chestCategory: roiChest,
    chestQuantity: roiQuantity,
    houseId: roiHouse,
    scenario: 'conservative',
    config
  }), [roiChest, roiQuantity, roiHouse, config]);

  const expectedData = useMemo(() => calculateRoiScenario({
    chestCategory: roiChest,
    chestQuantity: roiQuantity,
    houseId: roiHouse,
    scenario: 'expected',
    config
  }), [roiChest, roiQuantity, roiHouse, config]);

  const optimisticData = useMemo(() => calculateRoiScenario({
    chestCategory: roiChest,
    chestQuantity: roiQuantity,
    houseId: roiHouse,
    scenario: 'optimistic',
    config
  }), [roiChest, roiQuantity, roiHouse, config]);

  const currentRoiData = roiScenario === 'conservative'
    ? conservativeData
    : roiScenario === 'optimistic'
      ? optimisticData
      : expectedData;

  const currentChestInfo = config.chests[roiChest] || config.chests.miner;
  const currentHouseInfo = config.houses[roiHouse] || config.houses.basic;

  // Filtros da aba Desempenho dos Heróis
  const [heroSortBy, setHeroSortBy] = useState('production'); // 'production' | 'efficiency' | 'energy' | 'recovery' | 'rarity'
  const [heroSearch, setHeroSearch] = useState('');

  // Estados do Simulador de Upgrades
  const [simOptions, setSimOptions] = useState({
    houseId: currentHouse?.id || 'basic',
    maxEnergyBonusPct: 0,
    drainDiscountPct: 0,
    recoverySpeedBonusPct: 0,
    heroLevelBonus: 0
  });

  const [simulatedFlag, setSimulatedFlag] = useState(true);
  const [purchaseConfirmModal, setPurchaseConfirmModal] = useState(null);

  // Cálculos da Conta Real
  const realStats = useMemo(() => {
    return calculateRealAccountStats(miners, currentHouse, config);
  }, [miners, currentHouse, config]);

  // Cálculos da Conta Simulada
  const simStats = useMemo(() => {
    return calculateSimulatedAccountStats(miners, currentHouse, config, simOptions);
  }, [miners, currentHouse, config, simOptions]);

  // ROI dos Upgrades
  const upgradeRoi = useMemo(() => {
    return calculateUpgradeRoi(realStats, simStats, simOptions, config, currentHouse, miners);
  }, [realStats, simStats, simOptions, config, currentHouse, miners]);

  // Lista dos Heróis com métricas individuais de desempenho
  const analyzedHeroes = useMemo(() => {
    const rate = config?.minerCoinUsdtRate || 1.0;
    const houseMultiplier = currentHouse?.recoverySpeedMultiplier || 1.0;

    return miners.map(m => {
      const classInfo = MINER_CLASSES[m.classId] || MINER_CLASSES.miner;
      const power = m.power || 2;
      const speed = m.speed || 1;
      const maxEnergy = m.maxStamina || 100;
      const currentEnergy = m.currentStamina !== undefined ? m.currentStamina : maxEnergy;
      const drainPerMin = m.energyDrainRate || 1.0;
      const coinsPerHour = m.coinsPerHour || (power * 0.05 * speed);

      // Tempo até esgotar energia
      const minutesToDrain = drainPerMin > 0 ? Math.round(currentEnergy / drainPerMin) : 0;

      // Tempo até recuperar energia na casa atual
      const missingEnergy = Math.max(0, maxEnergy - currentEnergy);
      const recoveryRatePerMin = (maxEnergy / 240) * houseMultiplier;
      const minutesToRecover = recoveryRatePerMin > 0 ? Math.round(missingEnergy / recoveryRatePerMin) : 0;

      // Eficiência ponderada
      const efficiency = (power * 1.5 + speed * 10 + coinsPerHour * 50) * Math.max(0.1, currentEnergy / maxEnergy);

      // Rarity weight
      const rarityWeights = { common: 1, rare: 2, superRare: 3, epic: 4, legendary: 5 };
      const rarityRank = rarityWeights[m.rarity || classInfo.rarity] || 1;

      return {
        ...m,
        classInfo,
        power,
        speed,
        maxEnergy,
        currentEnergy,
        drainPerMin,
        coinsPerHour: parseFloat(coinsPerHour.toFixed(3)),
        minutesToDrain,
        minutesToRecover,
        efficiencyScore: parseFloat(efficiency.toFixed(1)),
        rarityRank,
        rarityName: m.rarity || classInfo.badge || 'COMUM'
      };
    });
  }, [miners, currentHouse, config]);

  // Ordenação e busca de heróis
  const filteredHeroes = useMemo(() => {
    let result = [...analyzedHeroes];

    if (heroSearch.trim()) {
      const q = heroSearch.toLowerCase();
      result = result.filter(h => 
        (h.name && h.name.toLowerCase().includes(q)) ||
        (h.classId && h.classId.toLowerCase().includes(q)) ||
        (h.rarityName && h.rarityName.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (heroSortBy === 'production') return b.coinsPerHour - a.coinsPerHour;
      if (heroSortBy === 'efficiency') return b.efficiencyScore - a.efficiencyScore;
      if (heroSortBy === 'energy') return b.currentEnergy - a.currentEnergy;
      if (heroSortBy === 'recovery') return a.minutesToRecover - b.minutesToRecover;
      if (heroSortBy === 'rarity') return b.rarityRank - a.rarityRank;
      return 0;
    });

    return result;
  }, [analyzedHeroes, heroSortBy, heroSearch]);

  const formatMins = (mins) => {
    if (mins <= 0) return '0 min';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const handleResetSimulation = () => {
    setSimOptions({
      houseId: currentHouse?.id || 'basic',
      maxEnergyBonusPct: 0,
      drainDiscountPct: 0,
      recoverySpeedBonusPct: 0,
      heroLevelBonus: 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow de fundo */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* CABEÇALHO PRINCIPAL DO MODAL */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500/30 to-amber-500/20 text-amber-300 border border-amber-500/30 shadow-inner">
              <BarChart3 size={24} className="text-amber-400" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h2 className="font-arcade text-base sm:text-lg text-amber-400 tracking-wide">
                  ESTATÍSTICAS & RETORNO DE ROI (OFICIAL)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold font-mono">
                  DADOS REAIS & 3 CENÁRIOS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-tech">
                Métricas da operação de mineração, retorno de ROI da conta, simulador de baús/casas e simulação de upgrades
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* ABAS DO MENU ESTATÍSTICAS */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800/80 bg-slate-950/40 shrink-0 overflow-x-auto no-scrollbar gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-tech text-xs font-bold transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/50'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
              }`}
            >
              <Activity size={14} />
              <span>1. VISÃO GERAL</span>
            </button>

            <button
              onClick={() => setActiveTab('heroes')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-tech text-xs font-bold transition cursor-pointer ${
                activeTab === 'heroes'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/50'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
              }`}
            >
              <Users size={14} />
              <span>2. DESEMPENHO ({miners.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-tech text-xs font-bold transition cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/50'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
              }`}
            >
              <Sliders size={14} />
              <span>3. SIMULADOR UPGRADES</span>
            </button>

            <button
              onClick={() => setActiveTab('roi_chests')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-tech text-xs font-bold transition cursor-pointer ${
                activeTab === 'roi_chests'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/50'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
              }`}
            >
              <Calculator size={14} />
              <span>4. SIMULADOR ROI (BAÚS & CASAS)</span>
              <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30">
                3 CENÁRIOS
              </span>
            </button>

            <button
              onClick={() => setActiveTab('roi')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-tech text-xs font-bold transition cursor-pointer ${
                activeTab === 'roi' || activeTab === 'roi_real'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/50'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
              }`}
            >
              <TrendingUp size={14} />
              <span>5. ROI REAL DA CONTA</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Saldo: <b className="text-amber-300">{bcoin.toFixed(3)} MINER</b></span>
            <span>•</span>
            <span>Casa: <b className="text-blue-300">{currentHouse.name}</b></span>
          </div>
        </div>

        {/* CONTEÚDO PRINCIPAL SCROLLÁVEL */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 no-scrollbar">

          {/* ======================================================== */}
          {/* SEÇÃO 1: VISÃO GERAL (DADOS REAIS DA OPERAÇÃO) */}
          {/* ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn text-left">
              
              {/* Banner Resumo de Produção Financeira */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 border border-amber-500/30 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-tech mb-1">
                    <span className="flex items-center gap-1"><Zap size={14} className="text-amber-400" /> Produção Instantânea</span>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">1 HORA</span>
                  </div>
                  <div className="my-1">
                    <span className="text-2xl font-arcade text-amber-300 font-bold">{realStats.currentHourlyProduction}</span>
                    <span className="text-xs font-arcade text-amber-400/80 ml-1">MINER/h</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    ≈ ${(realStats.currentHourlyProduction * (config.minerCoinUsdtRate || 1)).toFixed(2)} USDT por hora ativa
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-950 border border-emerald-500/30 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-tech mb-1">
                    <span className="flex items-center gap-1"><Coins size={14} className="text-emerald-400" /> Produção Estimada</span>
                    <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">24 HORAS</span>
                  </div>
                  <div className="my-1">
                    <span className="text-2xl font-arcade text-emerald-400 font-bold">{realStats.effectiveDailyCoins}</span>
                    <span className="text-xs font-arcade text-emerald-400/80 ml-1">MINER/dia</span>
                  </div>
                  <span className="text-xs text-emerald-300/80 font-mono font-bold">
                    ≈ ${realStats.dailyUsd} USDT/dia (Ciclo real com descanso)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500/15 via-slate-900 to-slate-950 border border-sky-500/30 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-tech mb-1">
                    <span className="flex items-center gap-1"><DollarSign size={14} className="text-sky-400" /> Produção Mensal</span>
                    <span className="text-[10px] bg-sky-400/20 text-sky-300 px-1.5 py-0.2 rounded font-mono">30 DIAS</span>
                  </div>
                  <div className="my-1">
                    <span className="text-2xl font-arcade text-sky-300 font-bold">{realStats.effectiveMonthlyCoins}</span>
                    <span className="text-xs font-arcade text-sky-400/80 ml-1">MINER/mês</span>
                  </div>
                  <span className="text-xs text-sky-300 font-mono">
                    ≈ ${realStats.monthlyUsd} USDT/mês projetado
                  </span>
                </div>
              </div>

              {/* Grid de Métricas da Equipe e Alocação */}
              <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-tech font-bold text-sm text-slate-200 flex items-center gap-2">
                    <Users size={16} className="text-purple-400" />
                    <span>ALOCAÇÃO & STATUS EM TEMPO REAL DA EQUIPE</span>
                  </h3>
                  <span className="text-xs font-tech text-slate-400">
                    Capacidade da Mina: <b>15 simultâneos</b>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-tech">
                  <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30">
                    <span className="text-slate-400 block mb-1">⛏️ Minerando na Mina</span>
                    <div className="flex items-baseline gap-1">
                      <b className="text-lg font-arcade text-emerald-400">{realStats.activeCount}</b>
                      <span className="text-slate-500 font-mono">/ 15 vagas</span>
                    </div>
                    <span className="text-[10px] text-emerald-300/80">Trabalho ativo desferindo dano</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-blue-500/30">
                    <span className="text-slate-400 block mb-1">🏠 Descansando na Casa</span>
                    <div className="flex items-baseline gap-1">
                      <b className="text-lg font-arcade text-blue-400">{realStats.inHouseCount}</b>
                      <span className="text-slate-500 font-mono">/ {realStats.houseSlots} leitos</span>
                    </div>
                    <span className="text-[10px] text-blue-300/80">Velocidade: {Math.round(realStats.houseMultiplier * 100)}%</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30">
                    <span className="text-slate-400 block mb-1">⏳ Aguardando Fila</span>
                    <div className="flex items-baseline gap-1">
                      <b className="text-lg font-arcade text-amber-400">{realStats.waitingCount}</b>
                      <span className="text-slate-500 font-mono">heróis</span>
                    </div>
                    <span className="text-[10px] text-amber-300/80">Sem leito livre na Casa</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700">
                    <span className="text-slate-400 block mb-1">🛡️ Reservas Prontos</span>
                    <div className="flex items-baseline gap-1">
                      <b className="text-lg font-arcade text-sky-400">{realStats.reserveCount}</b>
                      <span className="text-slate-500 font-mono">heróis</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Prontos para revezamento</span>
                  </div>
                </div>

                {/* Barra de Uptime & Eficiência */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Eficiência Geral da Equipe:</span>
                      <b className="text-amber-400 font-arcade">{realStats.efficiencyScore}%</b>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${realStats.efficiencyScore}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 font-tech">
                      Score ponderado com base em Poder, Velocidade, Consumo e Estamina disponível.
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Uptime dos 15 Slots da Mina:</span>
                      <b className="text-emerald-400 font-arcade">{realStats.mineUptimePct}%</b>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-sky-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${realStats.mineUptimePct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 font-tech">
                      Média diária de preenchimento dos 15 slots via rotação automática contínua.
                    </span>
                  </div>
                </div>
              </div>

              {/* Informações Complementares da Conta */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-tech">
                  <span className="text-slate-400 block mb-1">Total de Minercoins Coletadas</span>
                  <b className="text-base font-mono text-emerald-400">{totalMinedSession.toFixed(3)} MINER</b>
                  <p className="text-[10px] text-slate-500 mt-0.5">Produção histórica e de sessão</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-tech">
                  <span className="text-slate-400 block mb-1">Produção Média por Herói</span>
                  <b className="text-base font-mono text-amber-300">{realStats.avgProductionPerHero} MINER/dia</b>
                  <p className="text-[10px] text-slate-500 mt-0.5">Considerando {miners.length} heróis cadastrados</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-tech">
                  <span className="text-slate-400 block mb-1">Tempo Médio de Ciclo</span>
                  <b className="text-base font-mono text-sky-300">
                    {formatMins(realStats.avgWorkMins)} trab. / {formatMins(realStats.avgRestMins)} desc.
                  </b>
                  <p className="text-[10px] text-slate-500 mt-0.5">Fila média: {formatMins(realStats.avgWaitMins)}</p>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* SEÇÃO 2: DESEMPENHO DOS HERÓIS (DETALHAMENTO INDIVIDUAL) */}
          {/* ======================================================== */}
          {activeTab === 'heroes' && (
            <div className="space-y-4 animate-fadeIn text-left">
              {/* Barra de Filtros e Busca */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar herói ou classe..."
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-tech"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
                  <span className="text-[11px] text-slate-400 font-tech shrink-0 flex items-center gap-1">
                    <Filter size={12} /> Ordenar:
                  </span>
                  {[
                    { id: 'production', label: 'Produção' },
                    { id: 'efficiency', label: 'Eficiência' },
                    { id: 'energy', label: 'Energia' },
                    { id: 'recovery', label: 'Mais Rápido' },
                    { id: 'rarity', label: 'Raridade' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setHeroSortBy(tab.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-tech font-bold transition shrink-0 cursor-pointer ${
                        heroSortBy === tab.id
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid de Cards dos Heróis */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredHeroes.map(hero => {
                  const staminaPct = Math.round((hero.currentEnergy / hero.maxEnergy) * 100);
                  const isWorking = hero.status === 'work';
                  const isInHouse = hero.status === 'house';
                  const isWaiting = hero.status === 'waiting_house';

                  return (
                    <div 
                      key={hero.id}
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
                    >
                      {/* Topo do Card: Avatar, Nome e Raridade */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-11 h-11 rounded-xl border-2 flex items-center justify-center text-xl shadow-inner overflow-hidden relative shrink-0"
                            style={{ 
                              borderColor: hero.classInfo.color,
                              backgroundColor: `${hero.classInfo.color}15`
                            }}
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

                          <div className="leading-tight">
                            <h4 className="font-tech font-bold text-xs text-white truncate max-w-[140px]">
                              {hero.name}
                            </h4>
                            <span 
                              className="text-[9px] font-bold font-mono px-1.5 py-0.2 rounded uppercase inline-block mt-0.5"
                              style={{ backgroundColor: `${hero.classInfo.color}25`, color: hero.classInfo.color }}
                            >
                              {hero.rarityName} • Nv. {hero.level || 1}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isWorking && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-tech bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                              MINERANDO ⛏️
                            </span>
                          )}
                          {isInHouse && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-tech bg-blue-500/20 text-blue-300 border border-blue-500/40">
                              NA CASA 🏠
                            </span>
                          )}
                          {isWaiting && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-tech bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              FILA CASA ⏳
                            </span>
                          )}
                          {!isWorking && !isInHouse && !isWaiting && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-tech bg-slate-800 text-slate-300 border border-slate-700">
                              RESERVA 🛡️
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Barra de Energia */}
                      <div className="space-y-1 bg-slate-900/80 p-2 rounded-xl">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Energia: <b className="text-white">{Math.round(hero.currentEnergy)}</b>/{hero.maxEnergy}</span>
                          <span className={staminaPct > 35 ? 'text-emerald-400' : 'text-rose-400 font-bold'}>{staminaPct}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              staminaPct > 40 ? 'bg-emerald-400' : (staminaPct > 15 ? 'bg-amber-400' : 'bg-rose-500')
                            }`}
                            style={{ width: `${staminaPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Atributos e Estimativas */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-tech text-slate-300 bg-slate-900/50 p-2 rounded-xl">
                        <div>
                          <span className="text-slate-500 block">Produção por Hora:</span>
                          <b className="text-amber-300 font-mono text-xs">{hero.coinsPerHour} MINER/h</b>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Eficiência Geral:</span>
                          <b className="text-purple-300 font-mono text-xs">{hero.efficiencyScore} pts</b>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Tempo até Esgotar:</span>
                          <span className="text-slate-300 font-mono">
                            {isWorking ? formatMins(hero.minutesToDrain) : 'Pausado'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Tempo p/ Recuperar:</span>
                          <span className="text-blue-300 font-mono">
                            {staminaPct < 100 ? formatMins(hero.minutesToRecover) : '100% Carregado'}
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SEÇÃO 3: SIMULADOR DE UPGRADES (COMBINAÇÃO HIPOTÉTICA) */}
          {/* ======================================================== */}
          {activeTab === 'simulator' && (
            <div className="space-y-6 animate-fadeIn text-left">
              
              {/* Aviso Importante de Simulação */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs font-tech text-amber-200">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400 shrink-0" />
                  <span>
                    <b>Modo Simulação Ativo:</b> Teste melhorias na sua casa, energia e heróis sem descontar nenhum saldo.
                  </span>
                </div>
                <button
                  onClick={handleResetSimulation}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <RotateCcw size={12} />
                  <span>Limpar Simulação</span>
                </button>
              </div>

              {/* SELEÇÃO DOS UPGRADES HIPOTÉTICOS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Simulador de Casas */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-tech font-bold text-xs text-blue-300 flex items-center gap-1.5">
                      <Home size={14} /> 1. SIMULADOR DE CASAS
                    </h4>
                    <span className="text-[10px] text-slate-500">Atual: {currentHouse.name}</span>
                  </div>

                  <div className="space-y-1.5">
                    {Object.values(config.houses).filter(h => h.id !== 'none').map(house => {
                      const isSelected = simOptions.houseId === house.id;
                      const isCurrent = currentHouse.id === house.id;

                      return (
                        <div
                          key={house.id}
                          onClick={() => setSimOptions(prev => ({ ...prev, houseId: house.id }))}
                          className={`p-2.5 rounded-xl border text-xs font-tech transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-blue-400 bg-blue-950/40 ring-1 ring-blue-400/50'
                              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white">{house.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded">ATUAL</span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              {house.slots} leitos • {Math.round(house.recoverySpeedMultiplier * 100)}% velocidade
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-blue-300">
                            ${house.costUsdt} USDT
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Simulador de Melhorias de Energia */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h4 className="font-tech font-bold text-xs text-amber-300 flex items-center gap-1.5">
                    <Zap size={14} /> 2. UPGRADES DE ENERGIA
                  </h4>

                  {/* Capacidade Máxima */}
                  <div className="space-y-1 text-xs font-tech">
                    <span className="text-[11px] text-slate-400">Energia Máxima da Equipe:</span>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { pct: 0, cost: 0 },
                        { pct: 10, cost: 15 },
                        { pct: 20, cost: 35 },
                        { pct: 30, cost: 60 }
                      ].map(t => (
                        <button
                          key={t.pct}
                          onClick={() => setSimOptions(prev => ({ ...prev, maxEnergyBonusPct: t.pct }))}
                          className={`py-1 rounded-lg text-[10px] font-mono transition cursor-pointer ${
                            simOptions.maxEnergyBonusPct === t.pct
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          +{t.pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Redução de Consumo */}
                  <div className="space-y-1 text-xs font-tech">
                    <span className="text-[11px] text-slate-400">Eficiência (Redução de Consumo):</span>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { pct: 0, cost: 0 },
                        { pct: 10, cost: 20 },
                        { pct: 20, cost: 45 },
                        { pct: 30, cost: 75 }
                      ].map(t => (
                        <button
                          key={t.pct}
                          onClick={() => setSimOptions(prev => ({ ...prev, drainDiscountPct: t.pct }))}
                          className={`py-1 rounded-lg text-[10px] font-mono transition cursor-pointer ${
                            simOptions.drainDiscountPct === t.pct
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          -{t.pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Velocidade de Recuperação Extra */}
                  <div className="space-y-1 text-xs font-tech">
                    <span className="text-[11px] text-slate-400">Bônus Extra de Recuperação:</span>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { pct: 0, cost: 0 },
                        { pct: 15, cost: 15 },
                        { pct: 30, cost: 35 },
                        { pct: 50, cost: 65 }
                      ].map(t => (
                        <button
                          key={t.pct}
                          onClick={() => setSimOptions(prev => ({ ...prev, recoverySpeedBonusPct: t.pct }))}
                          className={`py-1 rounded-lg text-[10px] font-mono transition cursor-pointer ${
                            simOptions.recoverySpeedBonusPct === t.pct
                              ? 'bg-sky-500 text-slate-950 font-bold'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          +{t.pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* 3. Simulador de Melhoria dos Heróis (Level Up) */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="font-tech font-bold text-xs text-purple-300 flex items-center gap-1.5 mb-2">
                      <Flame size={14} /> 3. LEVEL UP DA EQUIPE ATIVA
                    </h4>
                    <p className="text-[11px] text-slate-400 font-tech mb-3">
                      Simule o aumento de nível nos 15 heróis da equipe ativa (+25% de Poder e +20% de Produção por nível).
                    </p>

                    <div className="grid grid-cols-3 gap-1.5 mb-4">
                      {[
                        { lvl: 0, label: 'Nível Atual' },
                        { lvl: 1, label: '+1 Nível (Time)' },
                        { lvl: 2, label: '+2 Níveis (Time)' }
                      ].map(opt => (
                        <button
                          key={opt.lvl}
                          onClick={() => setSimOptions(prev => ({ ...prev, heroLevelBonus: opt.lvl }))}
                          className={`p-2 rounded-xl text-center text-xs font-tech transition cursor-pointer ${
                            simOptions.heroLevelBonus === opt.lvl
                              ? 'bg-purple-600 text-white font-bold ring-1 ring-purple-400'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resumo de Custos Simulados */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-tech space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Custo Casa:</span>
                      <span className="font-mono">${upgradeRoi.houseCostUsdt} USDT</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Custo Energia:</span>
                      <span className="font-mono">{upgradeRoi.energyCostMiner} MINER</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Custo Heróis:</span>
                      <span className="font-mono">{upgradeRoi.heroLevelCostMiner.toFixed(1)} MINER</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-1 font-bold text-amber-300">
                      <span>Total Investimento:</span>
                      <span className="font-mono">${upgradeRoi.totalUpgradeCostUsd} USDT</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* TABELA COMPARATIVA LADO A LADO (ATUAL VS. SIMULADO) */}
              <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-tech font-bold text-xs text-slate-200 flex items-center gap-1.5">
                    <BarChart3 size={15} className="text-amber-400" />
                    <span>TABELA COMPARATIVA DE RESULTADOS: ATUAL VS. PROJETADO</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Impacto Sistêmico das Melhorias Combinadas
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-tech">
                    <thead>
                      <tr className="border-b border-slate-800/80 text-[11px] text-slate-400 bg-slate-950">
                        <th className="py-2.5 px-4 font-bold">Indicador de Desempenho</th>
                        <th className="py-2.5 px-4 font-bold text-slate-300">Situação Atual</th>
                        <th className="py-2.5 px-4 font-bold text-amber-300">Situação Simulada</th>
                        <th className="py-2.5 px-4 font-bold text-emerald-400 text-right">Impacto / Diferença</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      <tr>
                        <td className="py-2.5 px-4 text-slate-300 font-tech">Produção Efetiva por Hora</td>
                        <td className="py-2.5 px-4 text-slate-400">{realStats.currentHourlyProduction} MINER/h</td>
                        <td className="py-2.5 px-4 text-amber-300 font-bold">{simStats.simHourlyProduction} MINER/h</td>
                        <td className="py-2.5 px-4 text-emerald-400 font-bold text-right">
                          +{(simStats.simHourlyProduction - realStats.currentHourlyProduction).toFixed(3)} MINER/h
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-300 font-tech">Produção Diária (24h com revezamento)</td>
                        <td className="py-2.5 px-4 text-slate-400">{realStats.effectiveDailyCoins} MINER/dia</td>
                        <td className="py-2.5 px-4 text-amber-300 font-bold">{simStats.simDailyCoins} MINER/dia</td>
                        <td className="py-2.5 px-4 text-emerald-400 font-bold text-right">
                          +{upgradeRoi.additionalDailyCoins} MINER/dia (+{upgradeRoi.improvementPct}%)
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-300 font-tech">Produção Mensal Estimada (30d)</td>
                        <td className="py-2.5 px-4 text-slate-400">{realStats.effectiveMonthlyCoins} MINER/mês</td>
                        <td className="py-2.5 px-4 text-amber-300 font-bold">{simStats.simMonthlyCoins} MINER/mês</td>
                        <td className="py-2.5 px-4 text-emerald-400 font-bold text-right">
                          +{upgradeRoi.additionalMonthlyCoins} MINER/mês
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-300 font-tech">Leitos Disponíveis na Casa</td>
                        <td className="py-2.5 px-4 text-slate-400">{realStats.houseSlots} leitos</td>
                        <td className="py-2.5 px-4 text-blue-300 font-bold">{simStats.simHouseSlots} leitos</td>
                        <td className="py-2.5 px-4 text-emerald-400 font-bold text-right">
                          +{simStats.simHouseSlots - realStats.houseSlots} leitos
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-300 font-tech">Tempo Médio de Recuperação</td>
                        <td className="py-2.5 px-4 text-slate-400">{formatMins(realStats.avgRestMins)}</td>
                        <td className="py-2.5 px-4 text-blue-300 font-bold">{formatMins(simStats.avgRestMins)}</td>
                        <td className="py-2.5 px-4 text-emerald-400 font-bold text-right">
                          -{formatMins(Math.max(0, realStats.avgRestMins - simStats.avgRestMins))} mais rápido
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-300 font-tech">Tempo de Fila / Espera por Leito</td>
                        <td className="py-2.5 px-4 text-slate-400">{formatMins(realStats.avgWaitMins)}</td>
                        <td className="py-2.5 px-4 text-blue-300 font-bold">{formatMins(simStats.avgWaitMins)}</td>
                        <td className="py-2.5 px-4 text-emerald-400 font-bold text-right">
                          -{formatMins(Math.max(0, realStats.avgWaitMins - simStats.avgWaitMins))} espera
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-300 font-tech">Eficiência Geral da Equipe</td>
                        <td className="py-2.5 px-4 text-slate-400">{realStats.efficiencyScore}%</td>
                        <td className="py-2.5 px-4 text-purple-300 font-bold">{simStats.efficiencyScore}%</td>
                        <td className="py-2.5 px-4 text-emerald-400 font-bold text-right">
                          +{simStats.efficiencyScore - realStats.efficiencyScore}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BOTÕES DE AÇÃO: SIMULAR, VER RESULTADOS & COMPRAR UPGRADE */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('roi')}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-tech text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <TrendingUp size={14} />
                    <span>VER ANÁLISE DE ROI & GRÁFICOS</span>
                  </button>
                  <button
                    onClick={handleResetSimulation}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-tech text-xs transition cursor-pointer"
                  >
                    Resetar
                  </button>
                </div>

                {upgradeRoi.totalUpgradeCostUsd > 0 && (
                  <button
                    onClick={() => {
                      if (simOptions.houseId !== currentHouse.id && onOpenHouseModal) {
                        onClose();
                        onOpenHouseModal();
                      } else {
                        alert(`💡 Para efetuar as melhorias simuladas na sua conta real:\n\n• Upgrades de Casa: Acesse o menu CASA.\n• Upgrades de Heróis: Acesse a lista de heróis e clique no botão de nível.`);
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-arcade text-xs font-bold transition shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <ShoppingCart size={15} />
                    <span>COMPRAR UPGRADE (${upgradeRoi.totalUpgradeCostUsd} USDT)</span>
                  </button>
                )}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* SEÇÃO 4: SIMULADOR DE ROI (BAÚS & CASAS — PROMPT 6088 OFICIAL) */}
          {/* ======================================================== */}
          {activeTab === 'roi_chests' && (
            <div className="space-y-6 animate-fadeIn text-left">
              
              {/* BANNER OFICIAL DO SIMULADOR DE ROI */}
              <div className="bg-gradient-to-r from-amber-500/15 via-slate-950 to-purple-500/15 border-2 border-amber-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 flex items-center justify-center text-2xl shadow-lg border border-amber-300/40 font-arcade">
                      📊
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-arcade text-base sm:text-lg text-amber-400 tracking-wider">
                          SIMULADOR DE ROI — CRIPTO MYNERS
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                          MODELO MATEMÁTICO REAL
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-tech">
                        Simule projeções reais considerando limite de 15 mineradores ativos, estamina, revezamento e velocidade da casa.
                      </p>
                    </div>
                  </div>

                  {onOpenSummonModal && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenSummonModal();
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-arcade text-xs font-bold transition shadow-md shadow-amber-950/40 cursor-pointer self-start sm:self-auto"
                    >
                      <Sparkles size={14} />
                      <span>IR PARA A LOJA (MINT)</span>
                    </button>
                  )}
                </div>

                {/* 1. SELETOR DE BAÚ E QUANTIDADE */}
                <div className="mt-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider font-tech">
                      <Layers size={14} className="text-amber-400" />
                      1. Escolha a Categoria do Baú
                    </span>
                    <span className="text-xs text-amber-400 font-mono">
                      {currentChestInfo.heroesCount * roiQuantity} heróis projetados
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {Object.values(config.chests).map(c => {
                      const isSelected = roiChest === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setRoiChest(c.id)}
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
                            <h4 className="font-bold text-xs text-white font-tech">
                              {c.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-tech">
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
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 font-tech">
                    <span className="text-xs text-slate-400">Quantidade de Baús Adquiridos:</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 5, 10].map(qty => (
                        <button
                          key={qty}
                          onClick={() => setRoiQuantity(qty)}
                          className={`px-3 py-1 rounded-xl font-arcade text-xs font-bold transition cursor-pointer ${
                            roiQuantity === qty
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

                {/* 2. SELETOR DA CASA DE MINERAÇÃO */}
                <div className="mt-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3 font-tech">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Home size={14} className="text-blue-400" />
                      2. Selecione a Casa para Descanso e Revezamento
                    </span>
                    <span className="text-xs text-blue-300 font-mono">
                      {currentHouseInfo.slots} vagas • {Math.round(currentHouseInfo.recoverySpeedMultiplier * 100)}% velocidade
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.values(config.houses).map(h => {
                      const isSelected = roiHouse === h.id;
                      return (
                        <button
                          key={h.id}
                          onClick={() => setRoiHouse(h.id)}
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
                                {h.costUsdt > 0 ? `$${h.costUsdt} USDT` : 'Grátis'}
                              </span>
                            </div>
                            <h4 className="font-bold text-[11px] text-white leading-tight">
                              {h.name}
                            </h4>
                            <p className="text-[10px] text-slate-400">
                              {h.slots} vagas de descanso
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

                {/* 3. SELETOR DOS 3 CENÁRIOS COMPARATIVOS (PROMPT 6088) */}
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-950 p-2 rounded-2xl border border-slate-800 gap-2 font-tech">
                  <span className="text-xs text-slate-300 px-3 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Filter size={14} className="text-amber-400" />
                    3. Selecione o Cenário de Simulação (Prompt 6088):
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setRoiScenario('conservative')}
                      className={`px-3.5 py-1.5 rounded-xl font-tech text-xs font-bold transition cursor-pointer ${
                        roiScenario === 'conservative'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
                      }`}
                    >
                      🔴 Conservador
                    </button>
                    <button
                      onClick={() => setRoiScenario('expected')}
                      className={`px-4 py-1.5 rounded-xl font-tech text-xs font-bold transition cursor-pointer ${
                        roiScenario === 'expected'
                          ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                          : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
                      }`}
                    >
                      🟡 Esperado (Médio)
                    </button>
                    <button
                      onClick={() => setRoiScenario('optimistic')}
                      className={`px-3.5 py-1.5 rounded-xl font-tech text-xs font-bold transition cursor-pointer ${
                        roiScenario === 'optimistic'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
                      }`}
                    >
                      🟢 Otimista
                    </button>
                  </div>
                </div>

              </div>

              {/* 4. CARDS DE MÉTRICAS PRINCIPAIS (INVESTIMENTO, ROI E PAYBACK) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-tech">
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                    Investimento Total
                  </span>
                  <span className="font-arcade text-lg text-white font-bold block">
                    ${currentRoiData.totalInvestment} USDT
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Baús: ${currentRoiData.chestCost} • Casa: ${currentRoiData.houseCost}
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-emerald-500/30 text-center">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block mb-1">
                    Produção Diária
                  </span>
                  <span className="font-arcade text-lg text-emerald-400 font-bold block">
                    +{currentRoiData.effectiveCoinsPerDay} MINER
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ≈ ${currentRoiData.dailyUsd} USD / dia
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-amber-500/30 text-center">
                  <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block mb-1">
                    ROI Diário Estimado
                  </span>
                  <span className="font-arcade text-lg text-amber-300 font-bold block">
                    {currentRoiData.roiDailyPct}% / dia
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {currentRoiData.effectiveCoinsPerMonth} MINER / mês
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-purple-500/30 text-center">
                  <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider block mb-1">
                    Prazo de Payback
                  </span>
                  <span className="font-arcade text-lg text-purple-300 font-bold block">
                    ~{currentRoiData.paybackDays} Dias
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {currentRoiData.paybackDays <= 90 ? '🚀 Retorno Sustentável' : 'Mineração Passiva'}
                  </span>
                </div>
              </div>

              {/* 5. DETALHES DE EQUIPE, DISTRIBUIÇÃO E CAPACIDADE DA MINA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-tech">
                
                {/* Distribuição das Raridades */}
                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>Distribuição de Raridades ({currentRoiData.totalHeroes} Heróis)</span>
                    <span className="text-amber-400 font-mono uppercase">{roiScenario}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Comum</span>
                      <span className="font-bold text-slate-200">{currentRoiData.rarities.common}</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-xl border border-blue-500/30">
                      <span className="text-[10px] text-blue-400 block">Raro</span>
                      <span className="font-bold text-blue-300">{currentRoiData.rarities.rare}</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-xl border border-purple-500/30">
                      <span className="text-[10px] text-purple-400 block">Épico</span>
                      <span className="font-bold text-purple-300">{currentRoiData.rarities.epic}</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-xl border border-amber-500/30">
                      <span className="text-[10px] text-amber-400 block">Lendário</span>
                      <span className="font-bold text-amber-300">{currentRoiData.rarities.legendary}</span>
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
                    <span className="text-emerald-400 font-mono">Uptime: {currentRoiData.effectiveUptimePct}%</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between py-0.5 border-b border-slate-900 text-slate-400">
                      <span>Capacidade Ativa da Mina:</span>
                      <b className="text-white">{currentRoiData.maxActive} / 15 minerando</b>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-900 text-slate-400">
                      <span>Equipe Reserva para Revezamento:</span>
                      <b className="text-purple-300">{currentRoiData.reserves} heróis</b>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-900 text-slate-400">
                      <span>Tempo Médio de Trabalho Contínuo:</span>
                      <b className="text-amber-300">{currentRoiData.avgWorkHours} horas</b>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-400">
                      <span>Tempo de Descanso na Casa:</span>
                      <b className="text-blue-300">{currentRoiData.avgRestHours} horas ({Math.round(currentRoiData.recoveryMultiplier * 100)}% vel.)</b>
                    </div>
                  </div>
                </div>

              </div>

              {/* 6. PROJEÇÃO DE RETORNO ACUMULADO */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3 font-tech">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 size={15} className="text-emerald-400" />
                    Retorno Acumulado Projetado (Bruto em USDT)
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    1 MNC = US$ ${(config.minerCoinUsdtRate || 0.01).toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Em 30 Dias</span>
                    <span className="font-arcade text-sm text-white font-bold block">
                      ${currentRoiData.projectedReturn30d}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {Math.round((currentRoiData.projectedReturn30d / Math.max(1, currentRoiData.totalInvestment)) * 100)}% recuperado
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Em 60 Dias</span>
                    <span className="font-arcade text-sm text-white font-bold block">
                      ${currentRoiData.projectedReturn60d}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {Math.round((currentRoiData.projectedReturn60d / Math.max(1, currentRoiData.totalInvestment)) * 100)}% recuperado
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-400 block mb-0.5">Em 90 Dias (~3 meses)</span>
                    <span className="font-arcade text-sm text-emerald-400 font-bold block">
                      ${currentRoiData.projectedReturn90d}
                    </span>
                    <span className="text-[10px] text-emerald-400/80 font-mono">
                      {Math.round((currentRoiData.projectedReturn90d / Math.max(1, currentRoiData.totalInvestment)) * 100)}% recuperado
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-amber-500/30">
                    <span className="text-[10px] text-amber-400 block mb-0.5">Em 180 Dias (~6 meses)</span>
                    <span className="font-arcade text-sm text-amber-400 font-bold block">
                      ${currentRoiData.projectedReturn180d}
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-mono">
                      {Math.round((currentRoiData.projectedReturn180d / Math.max(1, currentRoiData.totalInvestment)) * 100)}% (Lucro Puro)
                    </span>
                  </div>
                </div>
              </div>

              {/* 7. TABELA COMPARATIVA DOS 3 CENÁRIOS LADO A LADO */}
              <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden font-tech">
                <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-tech font-bold text-xs text-slate-200 flex items-center gap-1.5">
                    <Award size={15} className="text-amber-400" />
                    <span>COMPARATIVO DIRETO DOS 3 CENÁRIOS (PROMPT 6088)</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {currentChestInfo.name} ({roiQuantity}x) + {currentHouseInfo.name}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800/80 text-[11px] text-slate-400 bg-slate-950">
                        <th className="py-2.5 px-4 font-bold">Métrica Financeira</th>
                        <th className="py-2.5 px-4 font-bold text-rose-400">🔴 Conservador</th>
                        <th className="py-2.5 px-4 font-bold text-amber-300">🟡 Esperado (Médio)</th>
                        <th className="py-2.5 px-4 font-bold text-emerald-400 text-right">🟢 Otimista</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      <tr>
                        <td className="py-2.5 px-4 text-slate-300 font-tech">Produção Diária Efetiva</td>
                        <td className="py-2.5 px-4 text-rose-300">{conservativeData.effectiveCoinsPerDay} MINER/dia</td>
                        <td className="py-2.5 px-4 text-amber-300 font-bold">{expectedData.effectiveCoinsPerDay} MINER/dia</td>
                        <td className="py-2.5 px-4 text-emerald-400 font-bold text-right">{optimisticData.effectiveCoinsPerDay} MINER/dia</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-300 font-tech">Produção Mensal (30 dias)</td>
                        <td className="py-2.5 px-4 text-rose-300">{conservativeData.effectiveCoinsPerMonth} MINER</td>
                        <td className="py-2.5 px-4 text-amber-300 font-bold">{expectedData.effectiveCoinsPerMonth} MINER</td>
                        <td className="py-2.5 px-4 text-emerald-400 font-bold text-right">{optimisticData.effectiveCoinsPerMonth} MINER</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-300 font-tech">ROI Diário Estimado</td>
                        <td className="py-2.5 px-4 text-rose-300">{conservativeData.roiDailyPct}% / dia</td>
                        <td className="py-2.5 px-4 text-amber-300 font-bold">{expectedData.roiDailyPct}% / dia</td>
                        <td className="py-2.5 px-4 text-emerald-400 font-bold text-right">{optimisticData.roiDailyPct}% / dia</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-300 font-tech">Prazo Estimado de Payback</td>
                        <td className="py-2.5 px-4 text-rose-300">~{conservativeData.paybackDays} dias</td>
                        <td className="py-2.5 px-4 text-amber-300 font-bold">~{expectedData.paybackDays} dias</td>
                        <td className="py-2.5 px-4 text-emerald-400 font-bold text-right">~{optimisticData.paybackDays} dias</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-300 font-tech">Heróis Épicos / Lendários</td>
                        <td className="py-2.5 px-4 text-rose-300">{conservativeData.rarities.epic} Épicos • {conservativeData.rarities.legendary} Lend.</td>
                        <td className="py-2.5 px-4 text-amber-300 font-bold">{expectedData.rarities.epic} Épicos • {expectedData.rarities.legendary} Lend.</td>
                        <td className="py-2.5 px-4 text-emerald-400 font-bold text-right">{optimisticData.rarities.epic} Épicos • {optimisticData.rarities.legendary} Lend.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-300 font-tech">Retorno Projetado em 90d</td>
                        <td className="py-2.5 px-4 text-rose-300">${conservativeData.projectedReturn90d} USDT</td>
                        <td className="py-2.5 px-4 text-amber-300 font-bold">${expectedData.projectedReturn90d} USDT</td>
                        <td className="py-2.5 px-4 text-emerald-400 font-bold text-right">${optimisticData.projectedReturn90d} USDT</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 8. NOTA DE TRANSPARÊNCIA E RESPONSABILIDADE */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-slate-400 text-[11px] font-tech">
                <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <b>Transparência Cripto Myners:</b> Os cálculos acima são estimativas matemáticas calculadas estritamente com base nos parâmetros configurados de probabilidade, produção média, consumo de estamina e cotação oficial configurada de 1 MINER = ${(config.minerCoinUsdtRate || 1.0).toFixed(2)} USDT (não é 1:1 fixo). O simulador considera o funcionamento real da mina (limite de 15 mineradores ativos simultâneos e descansos periódicos na casa) e não constitui garantia de retorno financeiro.
                </p>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* SEÇÃO 5: RETORNO DE INVESTIMENTO REAL DA CONTA & UPGRADES */}
          {/* ======================================================== */}
          {(activeTab === 'roi' || activeTab === 'roi_real') && (
            <div className="space-y-6 animate-fadeIn text-left">
              
              {/* RETORNO DE INVESTIMENTO REAL DA CONTA (ROI DA CARTEIRA) */}
              <div className="bg-gradient-to-r from-amber-500/10 via-slate-950 to-purple-500/10 border-2 border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                      <TrendingUp size={22} />
                    </div>
                    <div>
                      <h3 className="font-arcade text-base text-amber-300">
                        RETORNO DE INVESTIMENTO DA CONTA (ROI REAL)
                      </h3>
                      <p className="text-xs text-slate-400 font-tech">
                        Acompanhe a recuperação do seu capital investido e o lucro líquido com base na cotação oficial
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-tech">Cotação:</span>
                    <span className="font-arcade text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      1 MNC = US$ ${(config.minerCoinUsdtRate || 0.01).toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 font-tech ml-1">Taxa de Saque:</span>
                    <span className="font-arcade text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {currentWithdrawalTax}% TAXA
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-tech uppercase block mb-0.5">Total Investido</span>
                    <b className="font-arcade text-lg text-slate-200">US$ {totalInvested.toFixed(2)}</b>
                    <span className="text-[10px] text-slate-500 font-mono block">USDT</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-tech uppercase block mb-0.5">Total Minerado</span>
                    <b className="font-arcade text-lg text-amber-300">{totalMinedSession.toFixed(2)}</b>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      MNC (≈ US$ ${(totalMinedSession * (config.minerCoinUsdtRate || 0.01)).toFixed(2)})
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-400 font-tech uppercase block mb-0.5">Progresso de ROI</span>
                    <b className="font-arcade text-lg text-emerald-400">{roiPct}%</b>
                    <span className="text-[10px] text-emerald-300/80 font-tech block">
                      {roiPct >= 100 ? '🎉 100% Recuperado!' : `${Math.max(0, 100 - roiPct).toFixed(0)}% restante`}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-sky-500/30">
                    <span className="text-[10px] text-sky-400 font-tech uppercase block mb-0.5">Tempo p/ Payback</span>
                    <b className="font-arcade text-lg text-sky-300">
                      {roiPct >= 100 
                        ? '0 dias' 
                        : (realStats.effectiveDailyCoins * (config.minerCoinUsdtRate || 0.01)) > 0 
                          ? `${Math.ceil(Math.max(0, totalInvested - (totalMinedSession * (config.minerCoinUsdtRate || 0.01))) / (realStats.effectiveDailyCoins * (config.minerCoinUsdtRate || 0.01)))} dias` 
                          : '—'}
                    </b>
                    <span className="text-[10px] text-slate-400 font-tech block">
                      {roiPct >= 100 ? 'Lucro líquido puro' : 'Baseado na cotação oficial'}
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso do ROI da Conta */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] font-tech">
                    <span className="text-slate-400">Progresso até o Breakeven (100% Payback):</span>
                    <span className="font-bold text-amber-300 font-mono">{Math.min(100, roiPct)}% / 100%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-500 to-emerald-400 transition-all duration-700 shadow-sm"
                      style={{ width: `${Math.min(100, roiPct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-0.5">
                    <span>US$ 0,00</span>
                    <span>Breakeven: ${(totalInvested / (config.minerCoinUsdtRate || 0.01)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} MNC (US$ {totalInvested.toFixed(2)})</span>
                    <span>Lucro: +US$ {Math.max(0, (totalMinedSession * (config.minerCoinUsdtRate || 0.01)) - totalInvested).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Título da Seção de Upgrades */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <Sliders size={16} className="text-purple-400" />
                <h4 className="font-tech font-bold text-xs uppercase tracking-wider text-slate-300">
                  Simulação de ROI dos Upgrades (Casas, Heróis & Estamina)
                </h4>
              </div>

              {/* Cards de Métricas Financeiras de Retorno */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-tech uppercase block mb-1">Custo Total dos Upgrades</span>
                  <div className="flex items-baseline gap-1">
                    <b className="text-xl font-arcade text-amber-300">${upgradeRoi.totalUpgradeCostUsd}</b>
                    <span className="text-xs text-slate-400 font-mono">USDT</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ≈ {upgradeRoi.totalUpgradeCostMiner} MINER
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 font-tech uppercase block mb-1">Ganho Adicional Diário</span>
                  <div className="flex items-baseline gap-1">
                    <b className="text-xl font-arcade text-emerald-400">+{upgradeRoi.additionalDailyCoins}</b>
                    <span className="text-xs text-emerald-400/80 font-arcade">MINER</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-mono font-bold">
                    +${upgradeRoi.additionalDailyUsd} USDT/dia (+{upgradeRoi.improvementPct}%)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/30">
                  <span className="text-[10px] text-purple-300 font-tech uppercase block mb-1">ROI Diário do Upgrade</span>
                  <div className="flex items-baseline gap-1">
                    <b className="text-xl font-arcade text-purple-300">{upgradeRoi.dailyRoiPct}%</b>
                    <span className="text-xs text-purple-400/80 font-mono">ao dia</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-tech">
                    Retorno diário sobre o valor investido
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-sky-500/30">
                  <span className="text-[10px] text-sky-400 font-tech uppercase block mb-1">Payback Estimado</span>
                  <div className="flex items-baseline gap-1">
                    <b className="text-xl font-arcade text-sky-300">
                      {upgradeRoi.paybackDays !== null ? `${upgradeRoi.paybackDays} dias` : '—'}
                    </b>
                  </div>
                  <span className="text-[10px] text-slate-400 font-tech">
                    {upgradeRoi.paybackDays !== null ? 'Tempo para recuperar o custo' : 'Sem custo adicional'}
                  </span>
                </div>
              </div>

              {/* GRÁFICO 1: PRODUÇÃO ATUAL VS. PRODUÇÃO SIMULADA (BAR CHART SVG) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="font-tech font-bold text-xs text-slate-200 flex items-center gap-2">
                    <BarChart3 size={15} className="text-amber-400" />
                    <span>GRÁFICO COMPARATIVO: PRODUÇÃO REAL VS. PROJETADA COM UPGRADES</span>
                  </h3>
                  <div className="flex items-center gap-3 text-[10px] font-tech">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-600"></span> Atual</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Projetado</span>
                  </div>
                </div>

                {/* Gráfico Visual em SVG */}
                <div className="h-44 w-full flex items-end justify-around gap-6 pt-6 pb-2 px-4 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  {/* Barra Diária */}
                  <div className="flex-1 flex flex-col items-center h-full justify-end">
                    <div className="flex items-end justify-center gap-2 w-full h-32">
                      <div 
                        className="w-12 bg-slate-600 rounded-t-lg transition-all duration-500 relative group"
                        style={{ height: `${Math.max(10, Math.min(100, (realStats.effectiveDailyCoins / Math.max(1, simStats.simDailyCoins)) * 100))}%` }}
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-300">
                          {realStats.effectiveDailyCoins}
                        </span>
                      </div>
                      <div 
                        className="w-12 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-500 relative group shadow-lg shadow-emerald-950/50"
                        style={{ height: '100%' }}
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-emerald-300 font-bold">
                          {simStats.simDailyCoins}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-tech text-slate-400 mt-2">Produção Diária (MINER/dia)</span>
                  </div>

                  {/* Barra Mensal */}
                  <div className="flex-1 flex flex-col items-center h-full justify-end">
                    <div className="flex items-end justify-center gap-2 w-full h-32">
                      <div 
                        className="w-12 bg-slate-600 rounded-t-lg transition-all duration-500 relative group"
                        style={{ height: `${Math.max(10, Math.min(100, (realStats.effectiveMonthlyCoins / Math.max(1, simStats.simMonthlyCoins)) * 100))}%` }}
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-300">
                          {realStats.effectiveMonthlyCoins}
                        </span>
                      </div>
                      <div 
                        className="w-12 bg-gradient-to-t from-sky-600 to-sky-400 rounded-t-lg transition-all duration-500 relative group shadow-lg shadow-sky-950/50"
                        style={{ height: '100%' }}
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-sky-300 font-bold">
                          {simStats.simMonthlyCoins}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-tech text-slate-400 mt-2">Produção Mensal (MINER/mês)</span>
                  </div>
                </div>
              </div>

              {/* GRÁFICO 2: CURVA DE RETORNO ACUMULADO NO TEMPO (7d, 15d, 30d, 60d, 90d) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="font-tech font-bold text-xs text-slate-200 flex items-center gap-2">
                    <TrendingUp size={15} className="text-emerald-400" />
                    <span>CURVA PROJETADA DE RETORNO LÍQUIDO ACUMULADO ($ USDT)</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Retorno líquido = Produção adicional acumulada - Custo do Upgrade
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-tech">
                  {[
                    { label: '7 Dias', val: upgradeRoi.cumulativeReturns.days7 },
                    { label: '15 Dias', val: upgradeRoi.cumulativeReturns.days15 },
                    { label: '30 Dias', val: upgradeRoi.cumulativeReturns.days30 },
                    { label: '60 Dias', val: upgradeRoi.cumulativeReturns.days60 },
                    { label: '90 Dias', val: upgradeRoi.cumulativeReturns.days90 }
                  ].map((period, i) => (
                    <div 
                      key={i} 
                      className={`p-3 rounded-xl border flex flex-col justify-between ${
                        period.val >= 0 
                          ? 'border-emerald-500/40 bg-emerald-950/20' 
                          : 'border-slate-800 bg-slate-900/60'
                      }`}
                    >
                      <span className="text-slate-400 text-[10px]">{period.label}</span>
                      <b className={`text-base font-mono my-1 ${period.val >= 0 ? 'text-emerald-300' : 'text-slate-400'}`}>
                        {period.val >= 0 ? `+$${period.val}` : `-$${Math.abs(period.val)}`}
                      </b>
                      <span className={`text-[9px] ${period.val >= 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                        {period.val >= 0 ? 'Lucro Líquido' : 'Em amortização'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aviso Legal de Projeções */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-slate-400 text-[11px] font-tech">
                <HelpCircle size={16} className="text-slate-500 shrink-0 mt-0.5" />
                <p>
                  As projeções financeiras do simulador baseiam-se em modelos matemáticos estritos considerando atributos reais da equipe, limites de 15 mineradores simultâneos e tempo de descanso. Estimativas não constituem garantia de rentabilidade financeira futura.
                </p>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
