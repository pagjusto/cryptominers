import React, { useState } from 'react';
import { 
  Tv, 
  ShieldCheck, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  Play, 
  Zap, 
  Sparkles, 
  Sliders, 
  RefreshCw 
} from 'lucide-react';
import { 
  getSustainabilityFundStats, 
  getAdEventsHistory, 
  getAdminAuditLogs 
} from '../utils/adRewardService';

export default function AdminAdsMonetizationTab({
  config,
  onConfigChange,
  validationErrors
}) {
  const [activeSubTab, setActiveSubTab] = useState('settings'); // 'settings' | 'probabilities' | 'fund' | 'audit'

  const fundStats = getSustainabilityFundStats();
  const recentEvents = getAdEventsHistory(15);
  const auditLogs = getAdminAuditLogs(10);

  const adsConfig = config.adsConfig || {
    enabled: true,
    provider: 'admob',
    providerName: 'Google AdMob & Interactive Network',
    dailyEnergyLimit: 5,
    estimatedCpmUsd: 25.0,
    revenueShareSustainabilityPct: 100,
    formats: { rewardedVideo: true, playableInteractive: true }
  };

  const handleAdsFieldChange = (field, value) => {
    onConfigChange({
      ...config,
      adsConfig: {
        ...adsConfig,
        [field]: value
      }
    });
  };

  const handleFormatChange = (formatKey, checked) => {
    onConfigChange({
      ...config,
      adsConfig: {
        ...adsConfig,
        formats: {
          ...adsConfig.formats,
          [formatKey]: checked
        }
      }
    });
  };

  const handleProbChange = (chestId, mode, rarityKey, value) => {
    const num = Math.max(0, Math.min(100, parseInt(value) || 0));
    const targetChest = config.chests[chestId];
    if (!targetChest) return;

    const probField = mode === 'adBonus' ? 'adBonusProbabilities' : 'normalProbabilities';
    const nextProbs = {
      ...(targetChest[probField] || targetChest.probabilities),
      [rarityKey]: num
    };

    onConfigChange({
      ...config,
      chests: {
        ...config.chests,
        [chestId]: {
          ...targetChest,
          [probField]: nextProbs,
          probabilities: mode === 'normal' ? nextProbs : targetChest.probabilities
        }
      }
    });
  };

  return (
    <div className="space-y-4 text-left">
      {/* Sub-navegação */}
      <div className="flex gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'settings', label: '1. Provedor & Limites', icon: Sliders },
          { id: 'probabilities', label: '2. Probabilidades (Normal vs. Ad)', icon: Sparkles },
          { id: 'fund', label: '3. Fundo de Sustentabilidade', icon: DollarSign },
          { id: 'audit', label: '4. Auditoria de Eventos', icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-ABA 1: PROVEDOR & LIMITES */}
      {activeSubTab === 'settings' && (
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Tv size={16} className="text-purple-400" />
                <span>Configurações Globais de Monetização Publicitária</span>
              </h4>
              <span className="text-xs text-slate-400">
                Ative redes, defina formatos suportados e limites de recompensas por jogador.
              </span>
            </div>

            {/* Toggle Global de Anúncios */}
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-bold text-slate-300">Sistema Ativo:</span>
              <input
                type="checkbox"
                checked={adsConfig.enabled}
                onChange={e => handleAdsFieldChange('enabled', e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-tech">
            <div>
              <label className="text-slate-400 block mb-1">Provedor de Anúncios Principal:</label>
              <select
                value={adsConfig.provider}
                onChange={e => handleAdsFieldChange('provider', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
              >
                <option value="admob">Google AdMob (Rewarded Video & Playable)</option>
                <option value="unity">Unity Ads Network</option>
                <option value="applovin">AppLovin MAX & SDK</option>
                <option value="custom">Rede Customizada / Parceiros Web3</option>
              </select>
              <span className="text-[10px] text-slate-500 block mt-1">
                Compatível com verificação server-to-server (SSV).
              </span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Limite Diário de Recuperação de Energia:</label>
              <input
                type="number"
                min="1"
                max="20"
                value={adsConfig.dailyEnergyLimit || 5}
                onChange={e => handleAdsFieldChange('dailyEnergyLimit', parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Máximo de anúncios de recarga 100% que cada jogador pode assistir por dia.
              </span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Receita Estimada por Anúncio (eCPM em USD):</label>
              <input
                type="number"
                step="0.005"
                value={adsConfig.estimatedCpmUsd ? adsConfig.estimatedCpmUsd / 1000 : 0.025}
                onChange={e => handleAdsFieldChange('estimatedCpmUsd', (parseFloat(e.target.value) || 0.025) * 1000)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Valor creditado no Fundo de Sustentabilidade por exibição válida (Padrão: $0.025 USD).
              </span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Destinação da Receita:</label>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs">
                <b>100%</b> Fundo de Sustentabilidade do Jogo (Independente de USDT e Liquidez).
              </div>
            </div>
          </div>

          {/* Formatos Suportados */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300 block mb-2">Formatos Publicitários Autorizados:</span>
            <div className="flex gap-4 text-xs font-tech">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adsConfig.formats?.rewardedVideo}
                  onChange={e => handleFormatChange('rewardedVideo', e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
                <span>Vídeos Recompensados (Rewarded Video)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adsConfig.formats?.playableInteractive}
                  onChange={e => handleFormatChange('playableInteractive', e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
                <span>Anúncios Interativos (Playables)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* SUB-ABA 2: PROBABILIDADES DOS BAÚS (NORMAL VS. COM ANÚNCIO) */}
      {activeSubTab === 'probabilities' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            Configure as probabilidades normais e as probabilidades melhoradas com anúncio para cada baú. 
            <b className="text-amber-300 ml-1">Ambas as colunas devem somar exatamente 100%!</b>
          </div>

          {Object.values(config.chests).map(c => {
            const normal = c.normalProbabilities || c.probabilities || { common: 80, rare: 15, epic: 4, legendary: 1 };
            const adBonus = c.adBonusProbabilities || { common: 74, rare: 17, epic: 7, legendary: 2 };

            const sumNormal = (Number(normal.common) || 0) + (Number(normal.rare) || 0) + (Number(normal.epic) || 0) + (Number(normal.legendary) || 0);
            const sumAd = (Number(adBonus.common) || 0) + (Number(adBonus.rare) || 0) + (Number(adBonus.epic) || 0) + (Number(adBonus.legendary) || 0);

            const isNormalValid = sumNormal === 100;
            const isAdValid = sumAd === 100;

            return (
              <div key={c.id} className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{c.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-white">{c.name} ({c.heroesCount} {c.heroesCount === 1 ? 'herói' : 'heróis'})</h4>
                      <span className="text-[11px] text-slate-400">Preço: ${c.costUsdt} USDT • Sorteio independente por herói</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className={`px-2 py-0.5 rounded ${isNormalValid ? 'bg-slate-800 text-slate-300' : 'bg-rose-500/20 text-rose-300 font-bold'}`}>
                      Normal: {sumNormal}%
                    </span>
                    <span className={`px-2 py-0.5 rounded ${isAdValid ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-rose-500/20 text-rose-300 font-bold'}`}>
                      Com Ad: {sumAd}%
                    </span>
                  </div>
                </div>

                {/* Tabela de Probabilidades Lado a Lado */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Coluna 1: Probabilidades Normais */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-slate-300 font-bold block mb-1">Abertura Normal (Sem Anúncio)</span>
                    <div className="space-y-1 font-mono text-[11px]">
                      {['common', 'rare', 'epic', 'legendary'].map(rarity => (
                        <div key={rarity} className="flex justify-between items-center">
                          <span className="text-slate-400 capitalize">{rarity === 'common' ? 'Comum' : rarity === 'rare' ? 'Raro' : rarity === 'epic' ? 'Épico' : 'Lendário'}:</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={normal[rarity] || 0}
                              onChange={e => handleProbChange(c.id, 'normal', rarity, e.target.value)}
                              className="w-14 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-right text-white font-bold"
                            />
                            <span className="text-slate-500">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Coluna 2: Probabilidades com Anúncio Recompensado */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
                    <span className="text-emerald-300 font-bold block mb-1 flex items-center gap-1">
                      <span>Abertura com Bônus (Com Anúncio)</span>
                      <Sparkles size={12} className="text-emerald-400" />
                    </span>
                    <div className="space-y-1 font-mono text-[11px]">
                      {['common', 'rare', 'epic', 'legendary'].map(rarity => (
                        <div key={rarity} className="flex justify-between items-center">
                          <span className="text-slate-400 capitalize">{rarity === 'common' ? 'Comum' : rarity === 'rare' ? 'Raro' : rarity === 'epic' ? 'Épico' : 'Lendário'}:</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={adBonus[rarity] || 0}
                              onChange={e => handleProbChange(c.id, 'adBonus', rarity, e.target.value)}
                              className="w-14 px-1.5 py-0.5 rounded bg-slate-950 border border-emerald-500/40 text-right text-emerald-300 font-bold"
                            />
                            <span className="text-slate-500">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {(!isNormalValid || !isAdValid) && (
                  <div className="text-rose-400 text-xs font-tech flex items-center gap-1 bg-rose-500/10 p-2 rounded-lg border border-rose-500/30">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>Atenção: Tanto a probabilidade Normal quanto com Bônus devem totalizar exatamente 100%.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-ABA 3: FUNDO DE SUSTENTABILIDADE PUBLICITÁRIO */}
      {activeSubTab === 'fund' && (
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                <DollarSign size={16} />
                <span>Fundo de Sustentabilidade Publicitário (Auditável)</span>
              </h4>
              <span className="text-xs text-slate-400">
                Receitas geradas exclusivamente por anúncios recompensados e playables. Isoladas da liquidez dos jogadores.
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
              CATEGORIA FINANCEIRA INDEPENDENTE
            </span>
          </div>

          {/* Cards de Métricas do Fundo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-tech">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/40">
              <span className="text-slate-400 block mb-1">Receita Confirmada</span>
              <b className="text-lg font-mono text-emerald-400 font-bold">${fundStats.totalRevenueUsd?.toFixed(4) || '0.0000'}</b>
              <span className="text-[10px] text-slate-500 block mt-0.5">USD recebido via rede</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700">
              <span className="text-slate-400 block mb-1">Anúncios Válidos</span>
              <b className="text-lg font-mono text-white font-bold">{fundStats.validAdsCount || 0}</b>
              <span className="text-[10px] text-emerald-400 block mt-0.5">100% concluídos</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700">
              <span className="text-slate-400 block mb-1">Recuperações de Energia</span>
              <b className="text-lg font-mono text-sky-400 font-bold">{fundStats.energyRestoresCount || 0}</b>
              <span className="text-[10px] text-slate-500 block mt-0.5">Heróis recarregados</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700">
              <span className="text-slate-400 block mb-1">Bônus de Baús Concedidos</span>
              <b className="text-lg font-mono text-amber-300 font-bold">{fundStats.chestBonusCount || 0}</b>
              <span className="text-[10px] text-slate-500 block mt-0.5">Baús com chances extras</span>
            </div>
          </div>

          {/* Regras de Compliance Financeiro */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
            <b className="text-slate-300 block mb-1 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Diretrizes de Segregação Financeira:</span>
            </b>
            <p>• A receita publicitária nunca é misturada com compras de baús em USDT nem com reservas de saques.</p>
            <p>• Toda exibição só é computada após confirmação válida da conclusão do anúncio pela rede.</p>
            <p>• Anúncios interrompidos antes do término são descartados sem geração de receita e sem concessão de benefícios.</p>
          </div>
        </div>
      )}

      {/* SUB-ABA 4: AUDITORIA DE EVENTOS */}
      {activeSubTab === 'audit' && (
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <History size={16} className="text-sky-400" />
                <span>Histórico Auditável de Anúncios & Recompensas</span>
              </h4>
              <span className="text-xs text-slate-400">
                Log imutável dos últimos eventos de anúncios concluídos e benefícios concedidos.
              </span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-72 no-scrollbar">
            {recentEvents.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                Nenhum evento publicitário registrado ainda nesta sessão.
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                    <th className="py-2 px-2">ID Evento</th>
                    <th className="py-2 px-2">Tipo</th>
                    <th className="py-2 px-2">Benefício Concedido</th>
                    <th className="py-2 px-2">Receita</th>
                    <th className="py-2 px-2">Data/Hora</th>
                    <th className="py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-[11px]">
                  {recentEvents.map(e => (
                    <tr key={e.id} className="hover:bg-slate-900/50">
                      <td className="py-2 px-2 text-slate-400 truncate max-w-[100px]">{e.id}</td>
                      <td className="py-2 px-2 text-white font-bold">{e.type}</td>
                      <td className="py-2 px-2 text-slate-300 font-tech">{e.benefitDescription}</td>
                      <td className="py-2 px-2 text-emerald-400">+${e.estimatedRevenueUsd?.toFixed(4)}</td>
                      <td className="py-2 px-2 text-slate-500">{new Date(e.timestamp).toLocaleTimeString('pt-BR')}</td>
                      <td className="py-2 px-2">
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                          VÁLIDO
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
