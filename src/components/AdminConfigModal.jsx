import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, AlertTriangle, CheckCircle2, Sliders, Shield, DollarSign, Home, Layers, Sparkles, Zap, Tv } from 'lucide-react';
import { getCryptoZombiesConfig, saveCryptoZombiesConfig, resetCryptoZombiesConfig, DEFAULT_CRYPTO_ZOMBIES_CONFIG } from '../data/cryptoZombiesConfig';
import AdminAdsMonetizationTab from './AdminAdsMonetizationTab';
import AdminConstructionChestsTab from './AdminConstructionChestsTab';
import AdminIndividualMapsTab from './AdminIndividualMapsTab';

export default function AdminConfigModal({
  isOpen,
  onClose,
  onConfigUpdated,
  miners = [],
  onOpenSpawnZones,
  onToggleCollisionEditor,
  isCollisionEditorOpen = false,
  onOpenTowerModal,
  onOpenBillboardModal,
  onToggleBossTest,
  isBossActiveNow = false
}) {
  const [config, setConfig] = useState(() => getCryptoZombiesConfig());
  const [activeTab, setActiveTab] = useState('chests'); // 'chests' | 'houses' | 'rarities' | 'general'
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setConfig(getCryptoZombiesConfig());
      setSaveSuccess(false);
      setValidationErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Validador de Probabilidades (Soma de cada baú deve ser obrigatoriamente 100%)
  const validateProbabilities = (newConfig) => {
    const errors = {};
    const chests = newConfig.chests || {};
    Object.keys(chests).forEach(k => {
      const p = chests[k].normalProbabilities || chests[k].probabilities;
      if (p) {
        const sum = (Number(p.common) || 0) + (Number(p.rare) || 0) + (Number(p.epic) || 0) + (Number(p.legendary) || 0);
        if (sum !== 100) {
          errors[k] = `A soma das probabilidades do ${chests[k].name} deve ser exatamente 100% (atual: ${sum}%).`;
        }
      }
      if (chests[k].adBonusProbabilities) {
        const bp = chests[k].adBonusProbabilities;
        const bsum = (Number(bp.common) || 0) + (Number(bp.rare) || 0) + (Number(bp.epic) || 0) + (Number(bp.legendary) || 0);
        if (bsum !== 100) {
          errors[`${k}_bonus`] = `A soma das probabilidades COM ANÚNCIO do ${chests[k].name} deve ser exatamente 100% (atual: ${bsum}%).`;
        }
      }
    });
    return errors;
  };

  const handleProbabilityChange = (chestId, rarityKey, value) => {
    const num = Math.max(0, Math.min(100, parseInt(value) || 0));
    setConfig(prev => {
      const nextConfig = {
        ...prev,
        chests: {
          ...prev.chests,
          [chestId]: {
            ...prev.chests[chestId],
            probabilities: {
              ...prev.chests[chestId].probabilities,
              [rarityKey]: num
            }
          }
        }
      };
      setValidationErrors(validateProbabilities(nextConfig));
      return nextConfig;
    });
  };

  const handleChestPriceChange = (chestId, value) => {
    const num = Math.max(1, parseInt(value) || 1);
    setConfig(prev => ({
      ...prev,
      chests: {
        ...prev.chests,
        [chestId]: {
          ...prev.chests[chestId],
          costUsdt: num
        }
      }
    }));
  };

  const handleHouseChange = (houseId, field, value) => {
    const num = parseFloat(value) || 0;
    setConfig(prev => ({
      ...prev,
      houses: {
        ...prev.houses,
        [houseId]: {
          ...prev.houses[houseId],
          [field]: num
        }
      }
    }));
  };

  const handleRarityAttrChange = (rarityId, field, value) => {
    const num = parseFloat(value) || 0;
    setConfig(prev => ({
      ...prev,
      rarityAttributes: {
        ...prev.rarityAttributes,
        [rarityId]: {
          ...prev.rarityAttributes[rarityId],
          [field]: num
        }
      }
    }));
  };

  const handleSave = () => {
    const errors = validateProbabilities(config);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    saveCryptoZombiesConfig(config);
    setSaveSuccess(true);
    if (onConfigUpdated) onConfigUpdated(config);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Deseja restaurar todos os parâmetros para os valores originais da especificação?')) {
      const def = resetCryptoZombiesConfig();
      setConfig(def);
      setValidationErrors({});
      if (onConfigUpdated) onConfigUpdated(def);
    }
  };

  const hasErrors = Object.keys(validationErrors).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none font-tech">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] rounded-3xl p-5 sm:p-6 bg-slate-900 border-2 border-slate-700 text-slate-100 shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* CABEÇALHO ADMIN */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-white/60 flex items-center justify-center overflow-hidden p-1 shadow-md">
              <img src="/assets/icons/settings_gear.webp" alt="Configurações" className="w-full h-full object-contain icon-white-border" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-arcade text-sm sm:text-base text-amber-400">
                  PAINEL ADMINISTRATIVO & BALANCEAMENTO
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  CRYPTOZOMBIES
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Configure preços dos baús, probabilidades, casas e atributos refletidos no jogo e no simulador.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVEGAÇÃO DE ABAS ADMIN */}
        <div className="flex gap-2 py-3 border-b border-slate-800/80 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('chests')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'chests'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers size={14} />
            <span>1. Baús & Probabilidades</span>
          </button>
          <button
            onClick={() => setActiveTab('houses')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'houses'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Home size={14} />
            <span>2. Casas & Descanso</span>
          </button>
          <button
            onClick={() => setActiveTab('rarities')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'rarities'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles size={14} />
            <span>3. Atributos das Raridades</span>
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'general'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sliders size={14} />
            <span>4. Geral & Cotação</span>
          </button>
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'upgrades'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Zap size={14} />
            <span>5. Upgrades & Simulador</span>
          </button>
          <button
            onClick={() => setActiveTab('monetization')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'monetization'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Tv size={14} />
            <span>6. Monetização & Anúncios</span>
          </button>
          <button
            onClick={() => setActiveTab('construction')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'construction'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>🧱</span>
            <span>7. Baús de Construção</span>
          </button>
          <button
            onClick={() => setActiveTab('maps')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'maps'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>🗺️</span>
            <span>8. Mapas & Jazidas</span>
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'tools'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>🛠️</span>
            <span>9. Calibração & Mapa</span>
          </button>
        </div>

        {/* CORPO DE EDIÇÃO */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4">

          {/* ABA 1: BAÚS E PROBABILIDADES */}
          {activeTab === 'chests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Configure preços e probabilidades de cada um dos 4 baús (cada linha deve somar 100%):</span>
              </div>

              {Object.values(config.chests).map(c => {
                const error = validationErrors[c.id];
                const sum = (Number(c.probabilities.common) || 0) + (Number(c.probabilities.rare) || 0) + (Number(c.probabilities.epic) || 0) + (Number(c.probabilities.legendary) || 0);

                return (
                  <div key={c.id} className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{c.icon}</span>
                        <div>
                          <h4 className="font-bold text-sm text-white">{c.name} ({c.heroesCount} {c.heroesCount === 1 ? 'herói' : 'heróis'})</h4>
                          <span className="text-[11px] text-slate-400">{c.description}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Preço (USDT):</span>
                        <input
                          type="number"
                          value={c.costUsdt}
                          onChange={e => handleChestPriceChange(c.id, e.target.value)}
                          className="w-20 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 font-mono font-bold text-amber-300 text-center text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {/* Inputs de Probabilidades */}
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-900">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Comum (%)</label>
                        <input
                          type="number"
                          value={c.probabilities.common}
                          onChange={e => handleProbabilityChange(c.id, 'common', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono text-xs text-slate-300"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-blue-400 block mb-1">Raro (%)</label>
                        <input
                          type="number"
                          value={c.probabilities.rare}
                          onChange={e => handleProbabilityChange(c.id, 'rare', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-blue-500/30 text-center font-mono text-xs text-blue-300"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-purple-400 block mb-1">Épico (%)</label>
                        <input
                          type="number"
                          value={c.probabilities.epic}
                          onChange={e => handleProbabilityChange(c.id, 'epic', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-purple-500/30 text-center font-mono text-xs text-purple-300"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-amber-400 block mb-1">Lendário (%)</label>
                        <input
                          type="number"
                          value={c.probabilities.legendary}
                          onChange={e => handleProbabilityChange(c.id, 'legendary', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-amber-500/30 text-center font-mono text-xs text-amber-300"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className={`font-mono font-bold ${sum === 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        Soma: {sum}% {sum === 100 ? '✓' : '(Deve ser 100%)'}
                      </span>
                      {error && <span className="text-rose-400 font-bold">{error}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ABA 2: CASAS E DESCANSO */}
          {activeTab === 'houses' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Configure as 4 categorias de casas responsáveis pelo descanso e velocidade de recuperação:
              </p>

              {Object.values(config.houses).filter(h => h.id !== 'none').map(h => (
                <div key={h.id} className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{h.icon}</span>
                      <div>
                        <h4 className="font-bold text-sm text-white">{h.name}</h4>
                        <span className="text-[11px] text-slate-400">{h.description}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-900 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Preço (USDT):</label>
                      <input
                        type="number"
                        value={h.costUsdt}
                        onChange={e => handleHouseChange(h.id, 'costUsdt', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-amber-300 text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Vagas de Descanso:</label>
                      <input
                        type="number"
                        value={h.slots}
                        onChange={e => handleHouseChange(h.id, 'slots', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-white text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Velocidade (1.0 = 100%):</label>
                      <input
                        type="number"
                        step="0.05"
                        value={h.recoverySpeedMultiplier}
                        onChange={e => handleHouseChange(h.id, 'recoverySpeedMultiplier', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-emerald-400 text-center font-bold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ABA 3: ATRIBUTOS DAS RARIDADES */}
          {activeTab === 'rarities' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Ajuste os parâmetros base de mineração, energia e consumo de cada raridade:
              </p>

              {Object.keys(config.rarityAttributes).map(k => {
                const attr = config.rarityAttributes[k];
                return (
                  <div key={k} className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm" style={{ color: attr.color }}>
                        {attr.badge} ({attr.rarityName})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Prod. Mín (MINER/h)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={attr.coinsPerHourMin}
                          onChange={e => handleRarityAttrChange(k, 'coinsPerHourMin', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-slate-200 text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Prod. Máx (MINER/h)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={attr.coinsPerHourMax}
                          onChange={e => handleRarityAttrChange(k, 'coinsPerHourMax', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-emerald-300 text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Energia Máxima</label>
                        <input
                          type="number"
                          value={attr.maxEnergy}
                          onChange={e => handleRarityAttrChange(k, 'maxEnergy', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-sky-300 text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Consumo/min</label>
                        <input
                          type="number"
                          step="0.1"
                          value={attr.energyDrainPerMinute}
                          onChange={e => handleRarityAttrChange(k, 'energyDrainPerMinute', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-rose-300 text-center"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ABA 4: GERAL & COTAÇÃO */}
          {activeTab === 'general' && (
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="font-bold text-sm text-white">Parâmetros Globais do CryptoZombies</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Limite Máximo de Mineradores Ativos na Mina:</label>
                  <input
                    type="number"
                    value={config.maxActiveMiners}
                    onChange={e => setConfig(prev => ({ ...prev, maxActiveMiners: parseInt(e.target.value) || 15 }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono font-bold text-amber-300"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">Padrão: 15 mineradores simultâneos.</span>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Cotação da Coins (1 Coins em USDT):</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.0001"
                    value={config.minerCoinUsdtRate}
                    onChange={e => setConfig(prev => ({ ...prev, minerCoinUsdtRate: parseFloat(e.target.value) || 0.01 }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono font-bold text-emerald-400"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">Cotação oficial do projeto: <b>1 Coins = US$ 0,01</b>. Ajustável pelo administrador. Todos os cálculos de ROI e saques utilizam esta cotação.</span>
                </div>
              </div>
            </div>
          )}


          {/* ABA 5: UPGRADES E SIMULADOR */}
          {activeTab === 'upgrades' && (
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-5 text-left">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Zap size={16} className="text-amber-400" />
                  <span>Configuração dos Upgrades de Energia & Heróis</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Defina os custos em MINER e multiplicadores utilizados no Simulador de Upgrades e na economia real.
                </span>
              </div>

              {/* Upgrades de Energia */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-300 uppercase">Custos das Melhorias de Energia (em MINER)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-slate-300 font-bold block">Energia Máxima (+10/20/30%):</span>
                    <div className="space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">+10%:</span>
                        <input
                          type="number"
                          value={config.upgradesConfig?.energyMaxTiers?.[1]?.costMiner || 15}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            setConfig(prev => {
                              const nextTiers = [...(prev.upgradesConfig?.energyMaxTiers || [])];
                              if (nextTiers[1]) nextTiers[1] = { ...nextTiers[1], costMiner: val };
                              return { ...prev, upgradesConfig: { ...prev.upgradesConfig, energyMaxTiers: nextTiers } };
                            });
                          }}
                          className="w-16 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-amber-300 font-bold"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">+20%:</span>
                        <input
                          type="number"
                          value={config.upgradesConfig?.energyMaxTiers?.[2]?.costMiner || 35}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            setConfig(prev => {
                              const nextTiers = [...(prev.upgradesConfig?.energyMaxTiers || [])];
                              if (nextTiers[2]) nextTiers[2] = { ...nextTiers[2], costMiner: val };
                              return { ...prev, upgradesConfig: { ...prev.upgradesConfig, energyMaxTiers: nextTiers } };
                            });
                          }}
                          className="w-16 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-amber-300 font-bold"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">+30%:</span>
                        <input
                          type="number"
                          value={config.upgradesConfig?.energyMaxTiers?.[3]?.costMiner || 60}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            setConfig(prev => {
                              const nextTiers = [...(prev.upgradesConfig?.energyMaxTiers || [])];
                              if (nextTiers[3]) nextTiers[3] = { ...nextTiers[3], costMiner: val };
                              return { ...prev, upgradesConfig: { ...prev.upgradesConfig, energyMaxTiers: nextTiers } };
                            });
                          }}
                          className="w-16 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-amber-300 font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-slate-300 font-bold block">Redução Consumo (-10/20/30%):</span>
                    <div className="space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">-10%:</span>
                        <input
                          type="number"
                          value={config.upgradesConfig?.drainDiscountTiers?.[1]?.costMiner || 20}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            setConfig(prev => {
                              const nextTiers = [...(prev.upgradesConfig?.drainDiscountTiers || [])];
                              if (nextTiers[1]) nextTiers[1] = { ...nextTiers[1], costMiner: val };
                              return { ...prev, upgradesConfig: { ...prev.upgradesConfig, drainDiscountTiers: nextTiers } };
                            });
                          }}
                          className="w-16 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-emerald-400 font-bold"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">-20%:</span>
                        <input
                          type="number"
                          value={config.upgradesConfig?.drainDiscountTiers?.[2]?.costMiner || 45}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            setConfig(prev => {
                              const nextTiers = [...(prev.upgradesConfig?.drainDiscountTiers || [])];
                              if (nextTiers[2]) nextTiers[2] = { ...nextTiers[2], costMiner: val };
                              return { ...prev, upgradesConfig: { ...prev.upgradesConfig, drainDiscountTiers: nextTiers } };
                            });
                          }}
                          className="w-16 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-emerald-400 font-bold"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">-30%:</span>
                        <input
                          type="number"
                          value={config.upgradesConfig?.drainDiscountTiers?.[3]?.costMiner || 75}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            setConfig(prev => {
                              const nextTiers = [...(prev.upgradesConfig?.drainDiscountTiers || [])];
                              if (nextTiers[3]) nextTiers[3] = { ...nextTiers[3], costMiner: val };
                              return { ...prev, upgradesConfig: { ...prev.upgradesConfig, drainDiscountTiers: nextTiers } };
                            });
                          }}
                          className="w-16 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-emerald-400 font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-slate-300 font-bold block">Velocidade Rec. (+15/30/50%):</span>
                    <div className="space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">+15%:</span>
                        <input
                          type="number"
                          value={config.upgradesConfig?.recoverySpeedTiers?.[1]?.costMiner || 15}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            setConfig(prev => {
                              const nextTiers = [...(prev.upgradesConfig?.recoverySpeedTiers || [])];
                              if (nextTiers[1]) nextTiers[1] = { ...nextTiers[1], costMiner: val };
                              return { ...prev, upgradesConfig: { ...prev.upgradesConfig, recoverySpeedTiers: nextTiers } };
                            });
                          }}
                          className="w-16 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-sky-400 font-bold"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">+30%:</span>
                        <input
                          type="number"
                          value={config.upgradesConfig?.recoverySpeedTiers?.[2]?.costMiner || 35}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            setConfig(prev => {
                              const nextTiers = [...(prev.upgradesConfig?.recoverySpeedTiers || [])];
                              if (nextTiers[2]) nextTiers[2] = { ...nextTiers[2], costMiner: val };
                              return { ...prev, upgradesConfig: { ...prev.upgradesConfig, recoverySpeedTiers: nextTiers } };
                            });
                          }}
                          className="w-16 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-sky-400 font-bold"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">+50%:</span>
                        <input
                          type="number"
                          value={config.upgradesConfig?.recoverySpeedTiers?.[3]?.costMiner || 65}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            setConfig(prev => {
                              const nextTiers = [...(prev.upgradesConfig?.recoverySpeedTiers || [])];
                              if (nextTiers[3]) nextTiers[3] = { ...nextTiers[3], costMiner: val };
                              return { ...prev, upgradesConfig: { ...prev.upgradesConfig, recoverySpeedTiers: nextTiers } };
                            });
                          }}
                          className="w-16 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-sky-400 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upgrades de Nível dos Heróis */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-purple-300 uppercase">Parâmetros de Level Up dos Heróis</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Custo Base de Level Up (MINER):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={config.upgradesConfig?.heroBaseUpgradeCost || 2.5}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 2.5;
                        setConfig(prev => ({
                          ...prev,
                          upgradesConfig: { ...prev.upgradesConfig, heroBaseUpgradeCost: val }
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono font-bold text-purple-300"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">Custo inicial para Nv. 1 -&gt; Nv. 2.</span>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Multiplicador Exponencial por Nível:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.upgradesConfig?.heroUpgradeMultiplier || 1.6}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 1.6;
                        setConfig(prev => ({
                          ...prev,
                          upgradesConfig: { ...prev.upgradesConfig, heroUpgradeMultiplier: val }
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono font-bold text-purple-300"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">Fator de escala de custo por nível.</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ABA 6: MONETIZAÇÃO & ANÚNCIOS RECOMPENSADOS */}
          {activeTab === 'monetization' && (
            <AdminAdsMonetizationTab
              config={config}
              onConfigChange={setConfig}
              validationErrors={validationErrors}
            />
          )}

          {/* ABA 7: BAÚS DE CONSTRUÇÃO (APARIÇÃO POR CICLO DE 1 HORA) */}
          {activeTab === 'construction' && (
            <AdminConstructionChestsTab
              config={config}
              onConfigChange={setConfig}
              miners={miners}
            />
          )}

          {/* ABA 8: MAPAS INDIVIDUAIS & JAZIDAS */}
          {activeTab === 'maps' && (
            <AdminIndividualMapsTab
              onMapUpdated={(newMap) => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('cripto_myners_map_updated_externally', { detail: newMap }));
                }
              }}
            />
          )}

          {/* ABA 9: FERRAMENTAS DE CALIBRAÇÃO, RESPAWN & BLOQUEIOS */}
          {activeTab === 'tools' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <h3 className="font-arcade text-xs sm:text-sm text-amber-400">
                  FERRAMENTAS DE CALIBRAÇÃO & EDITOR DO MAPA
                </h3>
                <p className="text-xs text-slate-400">
                  Acesse os modais administrativos de configuração do mapa quando precisar ajustar respawns, bloqueios, sombras ou testar o Boss.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenSpawnZones) onOpenSpawnZones();
                  }}
                  className="p-4 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-left space-y-1.5 transition cursor-pointer"
                >
                  <div className="font-arcade text-xs text-emerald-300">🎯 Mapa de Respawns</div>
                  <p className="text-[11px] text-slate-300">
                    Editar zonas de nascimento de Zumbis e pontos de respawn dos Heróis.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onToggleCollisionEditor) onToggleCollisionEditor();
                  }}
                  className={`p-4 rounded-2xl border text-left space-y-1.5 transition cursor-pointer ${
                    isCollisionEditorOpen
                      ? 'bg-amber-500/20 border-amber-400'
                      : 'bg-amber-950/35 hover:bg-amber-900/45 border-amber-500/40'
                  }`}
                >
                  <div className="font-arcade text-xs text-amber-300">
                    🧱 {isCollisionEditorOpen ? 'Desativar Bloqueios' : 'Desenhar Bloqueios'}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Abrir toolbar e pintar células bloqueadas e caminhos diretamente no mapa.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenTowerModal) onOpenTowerModal();
                  }}
                  className="p-4 rounded-2xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/40 text-left space-y-1.5 transition cursor-pointer"
                >
                  <div className="font-arcade text-xs text-sky-300">🗼 Torre & Sombra</div>
                  <p className="text-[11px] text-slate-300">
                    Abrir calibrador manual da posição e sombra da Torre.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenBillboardModal) onOpenBillboardModal();
                  }}
                  className="p-4 rounded-2xl bg-teal-950/40 hover:bg-teal-900/50 border border-teal-500/40 text-left space-y-1.5 transition cursor-pointer"
                >
                  <div className="font-arcade text-xs text-teal-300">🪧 Sombra Outdoor</div>
                  <p className="text-[11px] text-slate-300">
                    Abrir calibrador da sombra retangular do Outdoor.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onToggleBossTest) onToggleBossTest();
                  }}
                  className="p-4 rounded-2xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 text-left space-y-1.5 transition cursor-pointer"
                >
                  <div className="font-arcade text-xs text-rose-300">
                    ⚡ {isBossActiveNow ? 'Encerrar Boss (Teste)' : 'Testar Invasão do Boss'}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Força início ou encerramento imediato da invasão do Boss Mutante para testes.
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FEEDBACK DE SALVAMENTO */}
        {saveSuccess && (
          <div className="mb-2 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Configurações salvas com sucesso! O simulador e a economia do jogo foram atualizados.</span>
          </div>
        )}

        {/* RODAPÉ DE AÇÃO ADMIN */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Restaurar Padrões</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={hasErrors}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl font-arcade text-xs font-bold transition shadow-md ${
                !hasErrors
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Save size={15} />
              <span>SALVAR CONFIGURAÇÃO</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
