import React, { useState } from 'react';
import { 
  X, 
  Trophy, 
  Clock, 
  Zap, 
  Pickaxe, 
  Coins, 
  Flame, 
  RotateCcw, 
  Activity,
  Award,
  Sparkles,
  BarChart3,
  Layers
} from 'lucide-react';
import { MINER_CLASSES } from '../data/minersData';

export default function MiningStatsModal({
  isOpen,
  onClose,
  statsData,
  miners,
  currentMine,
  onResetStats
}) {
  if (!isOpen) return null;

  const [sortBy, setSortBy] = useState('bcoin'); // 'bcoin' | 'blocks' | 'damage'

  const {
    remainingHp = 0,
    totalHp = 1,
    teamDps = 0,
    estimatedSeconds = 0,
    minerStats = {}
  } = statsData || {};

  // Formatação do tempo restante
  const formatTime = (secs) => {
    if (!secs || secs <= 0 || !isFinite(secs)) return 'Pausado (Time descansando)';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);

    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const progressPct = totalHp > 0 
    ? Math.min(100, Math.max(0, ((totalHp - remainingHp) / totalHp) * 100)) 
    : 0;

  // Monta lista de mineradores com estatísticas agregadas
  const rankedMiners = miners.map(m => {
    const classInfo = MINER_CLASSES[m.classId] || MINER_CLASSES.miner;
    const s = minerStats[m.id] || { blocksBroken: 0, bcoinEarned: 0, damageDealt: 0 };
    return {
      ...m,
      className: classInfo.name,
      avatar: classInfo.avatar,
      color: classInfo.color,
      blocksBroken: s.blocksBroken || 0,
      bcoinEarned: s.bcoinEarned || 0,
      damageDealt: s.damageDealt || 0,
      personalDps: parseFloat(((m.power * (m.classId === 'brute' ? 1.28 : 1.0) * (m.speed * 0.9)) / 0.85).toFixed(1))
    };
  });

  // Ordenação
  rankedMiners.sort((a, b) => {
    if (sortBy === 'bcoin') return b.bcoinEarned - a.bcoinEarned || b.blocksBroken - a.blocksBroken;
    if (sortBy === 'blocks') return b.blocksBroken - a.blocksBroken || b.bcoinEarned - a.bcoinEarned;
    return b.damageDealt - a.damageDealt;
  });

  // O MVP da rodada (Top 1)
  const mvp = rankedMiners[0];
  const maxBlocks = Math.max(1, ...rankedMiners.map(m => m.blocksBroken));
  const maxBcoin = Math.max(0.001, ...rankedMiners.map(m => m.bcoinEarned));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow de fundo */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* CABEÇALHO */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Activity size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-arcade text-lg sm:text-xl text-white tracking-wide">
                  DASHBOARD DE MINERAÇÃO
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-tech text-[10px] font-bold border border-purple-500/40">
                  TEMPO REAL
                </span>
              </div>
              <p className="font-tech text-xs text-slate-400">
                Previsão de conclusão do mapa, estatísticas de combate e ranking de MVP
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* CORPO ROLÁVEL */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar relative z-10">

          {/* SEÇÃO 1: PREVISÃO DO MAPA & SAÚDE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* CARD DO CRONÔMETRO DINÂMICO */}
            <div className="md:col-span-2 p-4 rounded-xl bg-gradient-to-br from-slate-950/90 to-purple-950/30 border border-purple-500/30 shadow-inner relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 font-tech text-xs font-bold text-purple-300 uppercase tracking-wider">
                  <Clock size={15} className="text-purple-400" />
                  Previsão de Conclusão do Mapa
                </span>
                <span className="flex items-center gap-1 font-tech text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30 font-bold">
                  <Zap size={12} />
                  DPS: {teamDps} HP/s
                </span>
              </div>

              {/* Display do Cronômetro */}
              <div className="flex items-baseline gap-3 my-2">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-tight bg-slate-900/90 px-3 py-1.5 rounded-xl border border-purple-500/40 shadow-sm text-purple-200">
                  {formatTime(estimatedSeconds)}
                </span>
                <span className="font-tech text-xs text-slate-400">
                  estimado no ritmo atual
                </span>
              </div>

              {/* Barra de Progresso do Mapa */}
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-xs font-tech text-slate-300">
                  <span>Progresso do Mapa #{currentMine?.name || 'Mina'}</span>
                  <span className="font-mono font-bold text-amber-300">{progressPct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 via-amber-500 to-emerald-400 transition-all duration-500 shadow-sm"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-tech text-slate-400">
                  <span>HP Restante: <b className="text-white font-mono">{remainingHp}</b></span>
                  <span>HP Total Inicial: <b className="text-slate-300 font-mono">{totalHp}</b></span>
                </div>
              </div>
            </div>

            {/* MINI CARD COM RESUMO RÁPIDO */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="font-tech text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  ⚡ Eficiência da Equipe
                </span>
                <div className="space-y-2 text-xs font-tech">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Heróis Ativos:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {miners.filter(m => m.status === 'work').length}/{miners.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Na Casa (Descanso):</span>
                    <span className="font-bold text-blue-400 font-mono">
                      {miners.filter(m => m.status === 'house').length} heróis
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Dormindo (0 Stam):</span>
                    <span className="font-bold text-rose-400 font-mono">
                      {miners.filter(m => m.status === 'sleep').length} heróis
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-tech">
                💡 <i>Dica: Acelere o tempo colocando heróis para descansar na Casa.</i>
              </div>
            </div>

          </div>

          {/* SEÇÃO 2: CARD DESTAQUE MVP DA RODADA */}
          {mvp && (
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border-2 border-amber-500/50 shadow-lg shadow-amber-950/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-slate-950 font-arcade text-[10px] font-bold rounded-bl-xl shadow-md flex items-center gap-1">
                <Trophy size={12} />
                MVP DA RODADA
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Avatar com Coroa */}
                <div className="relative">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2 shadow-md relative"
                    style={{ borderColor: mvp.color, backgroundColor: `${mvp.color}20` }}
                  >
                    <span>{mvp.avatar}</span>
                  </div>
                  <span className="absolute -top-3 -right-2 text-xl animate-bounce">👑</span>
                </div>

                {/* Dados do Herói */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="font-arcade text-base sm:text-lg text-amber-300">
                      {mvp.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-tech">({mvp.className})</span>
                  </div>
                  <p className="font-tech text-xs text-slate-300 mt-0.5">
                    Líder absoluto de produtividade na mina nesta rodada!
                  </p>
                </div>

                {/* 4 Métricas de Ouro do MVP */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
                  <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-tech block">PEDRAS</span>
                    <span className="font-mono font-bold text-sm text-white">{mvp.blocksBroken}</span>
                  </div>
                  <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-amber-500/40 text-center">
                    <span className="text-[10px] text-amber-400 font-tech block">BCOIN</span>
                    <span className="font-mono font-bold text-sm text-amber-400">+{mvp.bcoinEarned.toFixed(3)}</span>
                  </div>
                  <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-rose-400 font-tech block">DANO</span>
                    <span className="font-mono font-bold text-sm text-rose-300">{mvp.damageDealt}</span>
                  </div>
                  <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-sky-400 font-tech block">DPS</span>
                    <span className="font-mono font-bold text-sm text-sky-300">{mvp.personalDps}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEÇÃO 3: RANKING COMPLETO DOS 11 MINERADORES */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-purple-400" />
                <h3 className="font-arcade text-sm text-white uppercase tracking-wider">
                  Classificação da Equipe ({rankedMiners.length} Mineradores)
                </h3>
              </div>

              {/* Botões de Ordenação */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSortBy('bcoin')}
                  className={`px-2.5 py-1 rounded-lg font-tech text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    sortBy === 'bcoin' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Coins size={12} />
                  <span>Mais BCOIN</span>
                </button>
                <button
                  onClick={() => setSortBy('blocks')}
                  className={`px-2.5 py-1 rounded-lg font-tech text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    sortBy === 'blocks' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Pickaxe size={12} />
                  <span>Mais Pedras</span>
                </button>
                <button
                  onClick={() => setSortBy('damage')}
                  className={`px-2.5 py-1 rounded-lg font-tech text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    sortBy === 'damage' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Flame size={12} />
                  <span>Mais Dano</span>
                </button>
              </div>
            </div>

            {/* TABELA DE MINERADORES */}
            <div className="bg-slate-950/60 rounded-xl border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
              {rankedMiners.map((m, idx) => {
                const isTop1 = idx === 0;
                const isTop2 = idx === 1;
                const isTop3 = idx === 2;

                const medal = isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${idx + 1}`;

                return (
                  <div 
                    key={m.id} 
                    className={`flex items-center gap-3 p-3 transition hover:bg-slate-900/80 ${
                      isTop1 ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    {/* Posição / Medalha */}
                    <div className="w-8 text-center font-arcade text-sm font-bold text-slate-300">
                      {medal}
                    </div>

                    {/* Avatar do Herói */}
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border shadow-sm relative flex-shrink-0"
                      style={{ borderColor: m.color, backgroundColor: `${m.color}20` }}
                    >
                      <span>{m.avatar}</span>
                    </div>

                    {/* Nome, Classe e Status */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-arcade text-xs text-white truncate">{m.name}</span>
                        <span 
                          className="px-1.5 py-0.2 rounded text-[10px] font-bold font-tech"
                          style={{ backgroundColor: `${m.color}30`, color: m.color }}
                        >
                          {m.className}
                        </span>
                      </div>
                      
                      {/* Barra de Progresso Relativo de Pedras */}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(m.blocksBroken / maxBlocks) * 100}%`,
                              backgroundColor: m.color 
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-tech font-mono flex-shrink-0">
                          {m.blocksBroken} pedras
                        </span>
                      </div>
                    </div>

                    {/* Dano e BCOIN */}
                    <div className="text-right flex-shrink-0 space-y-0.5">
                      <div className="font-mono font-bold text-xs text-amber-400 flex items-center justify-end gap-1">
                        <Coins size={12} />
                        +{m.bcoinEarned.toFixed(3)}
                      </div>
                      <div className="font-tech text-[10px] text-slate-400">
                        Dano: <b className="text-slate-300 font-mono">{m.damageDealt}</b>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RODAPÉ DO MODAL */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/70 text-xs font-tech text-slate-400">
          <div className="flex items-center gap-1 text-[11px]">
            <Sparkles size={13} className="text-amber-400" />
            <span>As estatísticas de produção acumulam ao longo de toda a rodada.</span>
          </div>

          <div className="flex items-center gap-2">
            {onResetStats && (
              <button
                onClick={onResetStats}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer font-bold border border-slate-700"
                title="Zerar pontuação da rodada atual"
              >
                <RotateCcw size={12} />
                <span>Resetar Estatísticas</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition cursor-pointer shadow-md"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
