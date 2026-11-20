import React, { useState, useEffect } from 'react';
import { 
  Shield, CheckCircle2, AlertTriangle, Play, RefreshCw, 
  RotateCcw, Sliders, Layers, Clock, Sparkles, Zap, Award, 
  Package, Database, Check, AlertCircle, Calendar, Hash
} from 'lucide-react';
import { 
  DEFAULT_CONSTRUCTION_CHEST_CONFIG,
  calculateActiveMinersChance,
  getDailyConstructionStats,
  getConstructionAdminSummary,
  executeConstructionBossRoll,
  logConstructionAudit,
  getBrasiliaTimeString
} from '../utils/constructionChestEngine';

export default function AdminConstructionChestsTab({
  config,
  onConfigChange,
  miners = []
}) {
  const currentChestConfig = config.constructionChestConfig || DEFAULT_CONSTRUCTION_CHEST_CONFIG;
  const [summary, setSummary] = useState(() => getConstructionAdminSummary(currentChestConfig));
  const [testResult, setTestResult] = useState(null);
  const [auditMessage, setAuditMessage] = useState('');

  // Atualiza sumário administrativo
  const refreshSummary = () => {
    setSummary(getConstructionAdminSummary(currentChestConfig));
  };

  useEffect(() => {
    refreshSummary();
  }, [currentChestConfig]);

  // Cálculo ao vivo com os heróis atuais
  const liveChance = calculateActiveMinersChance(miners, currentChestConfig);

  // Alteração de parâmetros
  const handleUpdateParam = (field, value) => {
    const updated = {
      ...currentChestConfig,
      [field]: value
    };
    onConfigChange({
      ...config,
      constructionChestConfig: updated
    });
    logConstructionAudit(
      'ALTERAÇÃO_PARAMETRO',
      `Campo '${field}' alterado para '${JSON.stringify(value)}'`
    );
    setAuditMessage(`Alteração registrada: ${field} atualizado.`);
    setTimeout(() => setAuditMessage(''), 3000);
  };

  const handleUpdateRarityChance = (rarity, value) => {
    const num = Math.max(0, parseFloat(value) || 0);
    const updatedChances = {
      ...(currentChestConfig.chanceByRarityPct || DEFAULT_CONSTRUCTION_CHEST_CONFIG.chanceByRarityPct),
      [rarity]: num
    };
    handleUpdateParam('chanceByRarityPct', updatedChances);
  };

  // Teste de Sorteio por Boss (Simulado)
  const handleSimulateBossRoll = () => {
    const result = executeConstructionBossRoll(miners, currentChestConfig, { isSimulated: true });
    setTestResult(result);
    refreshSummary();
  };

  // Teste de Sorteio por Boss com Concessão Real de Teste
  const handleExecuteRealBossRoll = () => {
    const result = executeConstructionCycleRoll(miners, currentChestConfig, { isSimulated: false, forceSuccess: true });
    setTestResult(result);
    refreshSummary();
    logConstructionAudit('TESTE_BOSS_FORCADO', 'Administrador forçou concessão de teste de 1 Baú de Construção.');
  };

  // Resetar contador diário para testes
  const handleResetDailyLimit = () => {
    try {
      localStorage.removeItem('cripto_myners_construction_daily_v1');
      refreshSummary();
      logConstructionAudit('RESET_LIMITE_DIARIO', 'Contador diário de baús resetado manualmente pelo admin.');
      setAuditMessage('Limite diário resetado com sucesso para testes.');
      setTimeout(() => setAuditMessage(''), 3000);
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="space-y-6 text-left font-tech animate-fadeIn">
      
      {/* HEADER DA ABA */}
      <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-purple-500/20 border-2 border-amber-500/40 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center text-2xl shadow-inner">
            🧱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-arcade text-base text-amber-300">
                CONFIGURAÇÃO DOS BAÚS DE CONSTRUÇÃO
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                currentChestConfig.enabled !== false 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                {currentChestConfig.enabled !== false ? '● SISTEMA ATIVO' : '○ DESATIVADO'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Chance de Baú por Boss derrotado, teto de 40%, limite diário e auditoria de Fragmentos
            </p>
          </div>
        </div>

        {/* Toggle Ativar/Desativar */}
        <button
          onClick={() => handleUpdateParam('enabled', currentChestConfig.enabled === false)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md ${
            currentChestConfig.enabled !== false
              ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
          }`}
        >
          {currentChestConfig.enabled !== false ? 'Desativar Sistema' : 'Ativar Sistema'}
        </button>
      </div>

      {auditMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{auditMessage}</span>
        </div>
      )}

      {/* QUADRO DE MÉTRICAS EM TEMPO REAL */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Limite Diário / Jogador</span>
          <div className="flex items-baseline gap-1">
            <b className="font-arcade text-xl text-amber-300">
              {summary.chestsAwardedToday} / {summary.dailyLimit}
            </b>
            <span className="text-xs text-slate-400">baús</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Renovação: 00:00 Brasília
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30">
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider block mb-1">Chance Atual da Equipe</span>
          <div className="flex items-baseline gap-1">
            <b className="font-arcade text-xl text-emerald-400">
              {liveChance.finalChance}%
            </b>
            <span className="text-xs text-emerald-400/80 font-mono">/ Boss</span>
          </div>
          <span className="text-[10px] text-slate-400">
            {liveChance.isCapped ? '⚠️ Teto de 40% aplicado' : `${liveChance.activeMinersCount} sobreviventes ativos`}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-blue-500/30">
          <span className="text-[10px] text-blue-400 uppercase tracking-wider block mb-1">Baús Encontrados (Histórico)</span>
          <div className="flex items-baseline gap-1">
            <b className="font-arcade text-xl text-blue-300">
              {summary.totalChestsFoundHistorical}
            </b>
            <span className="text-xs text-slate-400">baús</span>
          </div>
          <span className="text-[10px] text-slate-500">
            {summary.storedChestsInInventoryCount} fechados no inventário
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/30">
          <span className="text-[10px] text-purple-400 uppercase tracking-wider block mb-1">Fragmentos Distribuídos</span>
          <div className="flex items-baseline gap-1">
            <b className="font-arcade text-xl text-purple-300">
              {summary.totalFragmentsBalance}
            </b>
            <span className="text-xs text-purple-400/80">🧱</span>
          </div>
          <span className="text-[10px] text-slate-500">
            1 Fragmento por baú
          </span>
        </div>
      </div>

      {/* SEÇÃO 1: PARÂMETROS GLOBAIS DE ECONOMIA E PROBABILIDADE */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-amber-400" />
            <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wider">
              1. Parâmetros Oficiais de Distribuição
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Valores Globais Iguais p/ Todos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Teto Máximo por Boss */}
          <div className="space-y-1.5 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-300 font-bold">Teto Máximo por Boss</label>
              <span className="font-mono text-emerald-400 font-bold">{currentChestConfig.maxAccountChanceCapPct}%</span>
            </div>
            <input 
              type="number"
              step="0.5"
              min="1.0"
              max="40.0"
              value={currentChestConfig.maxAccountChanceCapPct}
              onChange={e => handleUpdateParam('maxAccountChanceCapPct', parseFloat(e.target.value) || 40.0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-400"
            />
            <p className="text-[10px] text-slate-500 leading-tight">
              Teto máximo de 40% por jogador em cada Boss derrotado.
            </p>
          </div>

          {/* Limite Diário por Jogador */}
          <div className="space-y-1.5 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-300 font-bold">Limite Diário de Baús</label>
              <span className="font-mono text-sky-400 font-bold">{currentChestConfig.dailyLimitPerPlayer} baús/dia</span>
            </div>
            <input 
              type="number"
              min="1"
              max="10"
              value={currentChestConfig.dailyLimitPerPlayer}
              onChange={e => handleUpdateParam('dailyLimitPerPlayer', parseInt(e.target.value, 10) || 3)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-sky-300 font-mono focus:outline-none focus:border-sky-400"
            />
            <p className="text-[10px] text-slate-500 leading-tight">
              Regra padrão: exatamente 3 baús por dia para cada jogador. Renovação: 00:00 Brasília.
            </p>
          </div>

        </div>
      </div>

      {/* SEÇÃO 2: CHANCES DIRETAS POR RARIDADE */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-purple-400" />
            <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wider">
              2. Chances Individuais por Raridade
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            Chance direta por sobrevivente elegível
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { key: 'common', name: 'Comum', color: 'text-slate-300', border: 'border-slate-700' },
            { key: 'rare', name: 'Raro', color: 'text-blue-400', border: 'border-blue-500/40' },
            { key: 'superRare', name: 'Super Raro', color: 'text-cyan-400', border: 'border-cyan-500/40' },
            { key: 'epic', name: 'Épico', color: 'text-purple-400', border: 'border-purple-500/40' },
            { key: 'legendary', name: 'Lendário', color: 'text-amber-400', border: 'border-amber-500/40' },
            { key: 'superLegendary', name: 'Super Lendário', color: 'text-rose-400', border: 'border-rose-500/40' }
          ].map(r => {
            const chance = currentChestConfig.chanceByRarityPct?.[r.key] ?? DEFAULT_CONSTRUCTION_CHEST_CONFIG.chanceByRarityPct[r.key];
            return (
              <div key={r.key} className={`bg-slate-900 p-3.5 rounded-xl border ${r.border} space-y-2`}>
                <div className="flex justify-between items-center">
                  <span className={`font-bold text-xs uppercase ${r.color}`}>{r.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    {chance}%
                  </span>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 block">Chance por sobrevivente:</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    max="40"
                    value={chance}
                    onChange={e => handleUpdateRarityChance(r.key, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-200 text-center focus:outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEÇÃO 3: DIAGNÓSTICO AO VIVO DA EQUIPE MINERANDO AGORA */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-emerald-400" />
            <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wider">
              3. Diagnóstico ao Vivo dos Heróis Minerando
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            Somente heróis ativos na mina participam do sorteio
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-xs text-slate-400 font-bold">Sobreviventes em Combate:</span>
            <div className="font-arcade text-lg text-emerald-400">
              {liveChance.activeMinersCount} sobreviventes em combate
            </div>
            <p className="text-[10px] text-slate-500">
              Heróis descansando na casa ou sem energia são excluídos automaticamente.
            </p>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-xs text-slate-400 font-bold">Soma Bruta das Probabilidades:</span>
            <div className="font-arcade text-lg text-amber-300">
              {liveChance.rawTotalChance}%
            </div>
            <p className="text-[10px] text-slate-500">
              Soma direta das contribuições individuais dos heróis ativos.
            </p>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-xs text-slate-400 font-bold">Probabilidade Efetiva por Boss:</span>
            <div className="font-arcade text-lg text-emerald-400 flex items-center gap-2">
              <span>{liveChance.finalChance}%</span>
              {liveChance.isCapped && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-tech font-bold">
                  TETO 40%
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500">
              Teto absoluto de 40% por jogador em cada Boss derrotado.
            </p>
          </div>
        </div>

        {/* Breakdown de Heróis Ativos */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400">Distribuição ativa:</span>
          <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            Comuns: <b>{liveChance.breakdownByRarity.common}</b>
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-300">
            Raros: <b>{liveChance.breakdownByRarity.rare}</b>
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300">
            Épicos: <b>{liveChance.breakdownByRarity.epic}</b>
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300">
            Lendários: <b>{liveChance.breakdownByRarity.legendary}</b>
          </span>
        </div>
      </div>

      {/* SEÇÃO 4: SIMULAÇÃO E HOMOLOGAÇÃO ADMINISTRATIVA */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-400" />
            <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wider">
              4. Ferramentas de Teste e Homologação Administrativa
            </h4>
          </div>
          <span className="text-xs text-slate-500">Ambiente Seguro</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleSimulateBossRoll}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition cursor-pointer active:scale-95"
          >
            <Play size={14} />
            <span>Simular Sorteio por Boss (Sem Concessão)</span>
          </button>

          <button
            onClick={handleExecuteRealBossRoll}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition cursor-pointer active:scale-95"
          >
            <Sparkles size={14} />
            <span>Forçar Concessão de Baú de Teste</span>
          </button>

          <button
            onClick={handleResetDailyLimit}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition cursor-pointer active:scale-95"
          >
            <RotateCcw size={14} />
            <span>Resetar Limite Diário (0/3)</span>
          </button>
        </div>

        {/* Resultado do Teste */}
        {testResult && (
          <div className={`p-4 rounded-xl border text-xs font-mono space-y-1.5 ${
            testResult.won 
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
              : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}>
            <div className="flex justify-between font-bold">
              <span>Resultado do Sorteio:</span>
              <span>{testResult.won ? '🎉 SUCESSO: BAÚ CONCEDIDO!' : '❌ NÃO SORTEADO NESTE BOSS'}</span>
            </div>
            <div>Roll do Sorteio: <b>{testResult.roll}%</b> (Necessário: ≤ {testResult.activeChance?.finalChance}%)</div>
            <div>Heróis Ativos no Cálculo: <b>{testResult.activeChance?.activeMinersCount}</b></div>
            <div>Limite Diário Após Sorteio: <b>{testResult.dailyStats?.chestsAwardedToday} / {testResult.dailyStats?.dailyLimit}</b></div>
            {testResult.chest && (
              <div className="pt-1 border-t border-emerald-500/30 text-emerald-400">
                Baú Gerado: <b>{testResult.chest.id}</b> (Recompensa: 1 Fragmento de Construção)
              </div>
            )}
          </div>
        )}
      </div>

      {/* SEÇÃO 5: HISTÓRICO DE APARIÇÕES E AUDITORIA */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-sky-400" />
            <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wider">
              5. Histórico de Aparições e Auditoria Administrativa
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {summary.history?.length || 0} eventos registrados
          </span>
        </div>

        {summary.history && summary.history.length > 0 ? (
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {summary.history.slice(0, 15).map((evt, idx) => (
              <div 
                key={evt.id || idx}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs font-mono flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <span className={evt.type === 'CHEST_FOUND' ? 'text-emerald-400 font-bold' : evt.type === 'CHEST_OPENED' ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                    {evt.type === 'CHEST_FOUND' ? '🧱 ENCONTRADO' : evt.type === 'CHEST_OPENED' ? '🔓 ABERTO (+1 FRAG)' : '⏱️ BOSS'}
                  </span>
                  <span className="text-slate-500">{evt.timestamp}</span>
                </div>
                <div className="text-right text-slate-300 truncate max-w-sm">
                  {evt.result || evt.details || evt.id}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-4">
            Nenhuma aparição registrada ainda. Os sorteios por Boss aparecerão aqui automaticamente.
          </p>
        )}
      </div>

    </div>
  );
}
