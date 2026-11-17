const fs = require('fs');

const path = 'C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/src/components/AdminConfigModal.jsx';
let content = fs.readFileSync(path, 'utf8');
const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Add Zap icon to imports if not present
if (!content.includes('Zap,')) {
  content = content.replace(
    `import { X, Save, RotateCcw, AlertTriangle, CheckCircle2, Sliders, Shield, DollarSign, Home, Layers, Sparkles } from 'lucide-react';`,
    `import { X, Save, RotateCcw, AlertTriangle, CheckCircle2, Sliders, Shield, DollarSign, Home, Layers, Sparkles, Zap } from 'lucide-react';`
  );
}

// 2. Add Tab 5 button
const oldTab4Btn = `          <button
            onClick={() => setActiveTab('general')}
            className={\`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 \${
              activeTab === 'general'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }\`}
          >
            <Sliders size={14} />
            <span>4. Geral & Cotação</span>
          </button>`;

const newTabButtons = `          <button
            onClick={() => setActiveTab('general')}
            className={\`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 \${
              activeTab === 'general'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }\`}
          >
            <Sliders size={14} />
            <span>4. Geral & Cotação</span>
          </button>
          <button
            onClick={() => setActiveTab('upgrades')}
            className={\`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 \${
              activeTab === 'upgrades'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }\`}
          >
            <Zap size={14} />
            <span>5. Upgrades & Simulador</span>
          </button>`;

if (content.includes(oldTab4Btn) && !content.includes(`activeTab === 'upgrades'`)) {
  content = content.replace(oldTab4Btn, newTabButtons);
  console.log('Added Tab 5 button to AdminConfigModal!');
}

// 3. Add Tab 5 Content
const tab5Content = `
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
`;

if (!content.includes(`activeTab === 'upgrades' && (`)) {
  content = content.replace(
    `        </div>\n\n        {/* FEEDBACK DE SALVAMENTO */}`,
    `${tab5Content}        </div>\n\n        {/* FEEDBACK DE SALVAMENTO */}`
  );
  console.log('Added Tab 5 content to AdminConfigModal!');
}

if (isCRLF) content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(path, content, 'utf8');
console.log('AdminConfigModal.jsx upgraded successfully!');
