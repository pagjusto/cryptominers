import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Sparkles, 
  Zap, 
  Star, 
  Check, 
  ArrowRight, 
  Package, 
  HelpCircle,
  Award,
  Layers
} from 'lucide-react';
import { MINER_CLASSES } from '../data/minersData';
import { GEAR_TYPES, GEAR_RARITIES, GEAR_CATALOG } from '../data/gearData';
import { sfx } from '../utils/sfx';

export default function GearInventoryModal({
  isOpen,
  onClose,
  miners,
  gearStash,
  onEquipGear,
  onUnequipGear,
  onAutoEquipBest
}) {
  if (!isOpen) return null;

  const [selectedMinerId, setSelectedMinerId] = useState(miners[0]?.id || null);
  const [activeTab, setActiveTab] = useState('heroes'); // 'heroes' | 'stash'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'weapon' | 'helmet' | 'amulet'

  const selectedMiner = miners.find(m => m.id === selectedMinerId) || miners[0];
  const minerGear = selectedMiner?.equippedGear || { weapon: null, helmet: null, amulet: null };
  const minerClass = selectedMiner ? (MINER_CLASSES[selectedMiner.classId] || MINER_CLASSES.miner) : null;

  // Itens disponíveis no Stash (filtrados)
  const filteredStash = gearStash.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow de Fundo */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* CABEÇALHO */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-500 text-white shadow-lg shadow-sky-900/30">
              <Shield size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-arcade text-lg sm:text-xl text-white tracking-wide">
                  EQUIPAMENTOS & RELÍQUIAS MÍSTICAS
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-bold">
                  ARTIFACTS & GEARS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Armas (+Dano/Crítico), Elmos visuais e Amuletos (Chance de 2x BCOIN)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTEÚDO PRINCIPAL (DIVIDIDO EM DUAS COLUNAS: HERÓI EQUIPADO VS ARMAZÉM) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* COLUNA ESQUERDA: SLOTS DO HERÓI SELECIONADO (5 colunas) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            
            {/* Seletor Rápido de Herói */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 mb-1.5 block">
                Selecione o Herói:
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                {miners.map(m => {
                  const isSel = m.id === selectedMinerId;
                  const cInfo = MINER_CLASSES[m.classId] || MINER_CLASSES.miner;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMinerId(m.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 transition cursor-pointer ${
                        isSel 
                          ? 'border-sky-400 bg-sky-500/20 text-white shadow-md' 
                          : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span>{cInfo.avatar}</span>
                      <span className="truncate max-w-[80px]">{m.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CARD DO HERÓI COM SEUS 3 SLOTS */}
            {selectedMiner && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-inner flex flex-col justify-between flex-1">
                
                {/* Info do Herói */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-3xl shadow">
                      {minerClass?.avatar || '🤖'}
                    </div>
                    <div>
                      <h3 className="font-arcade text-sm text-white">{selectedMiner.name}</h3>
                      <div className="flex items-center gap-1 text-[11px] text-amber-400 mt-0.5">
                        {Array.from({ length: selectedMiner.stars || 1 }).map((_, i) => (
                          <Star key={i} size={11} fill="#fbbf24" />
                        ))}
                        <span className="font-bold ml-1">{selectedMiner.stars || 1}★</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{minerClass?.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botão Auto-Equip */}
                  <button
                    onClick={() => {
                      onAutoEquipBest(selectedMiner.id);
                      sfx.playLevelUp();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 text-[10px] font-bold transition cursor-pointer"
                  >
                    <Sparkles size={12} />
                    <span>Auto-Equipar</span>
                  </button>
                </div>

                {/* OS 3 SLOTS DE EQUIPAMENTO */}
                <div className="space-y-3 my-4">
                  
                  {/* SLOT 1: ARMA / PICARETA */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                        {minerGear.weapon ? minerGear.weapon.icon : '⛏️'}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">
                          Slot 1: Arma / Picareta
                        </div>
                        {minerGear.weapon ? (
                          <div>
                            <span className="font-arcade text-xs text-amber-300">
                              {minerGear.weapon.name}
                            </span>
                            <p className="text-[10px] text-emerald-400 font-tech">
                              {minerGear.weapon.desc}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Nenhuma arma equipada</span>
                        )}
                      </div>
                    </div>

                    {minerGear.weapon && (
                      <button
                        onClick={() => onUnequipGear(selectedMiner.id, 'weapon')}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 text-[10px] border border-slate-700 transition cursor-pointer"
                      >
                        Desequipar
                      </button>
                    )}
                  </div>

                  {/* SLOT 2: CAPACETE */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                        {minerGear.helmet ? minerGear.helmet.icon : '🪖'}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">
                          Slot 2: Capacete / Elmo
                        </div>
                        {minerGear.helmet ? (
                          <div>
                            <span className="font-arcade text-xs text-sky-300">
                              {minerGear.helmet.name}
                            </span>
                            <p className="text-[10px] text-emerald-400 font-tech">
                              {minerGear.helmet.desc}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Nenhum capacete equipado</span>
                        )}
                      </div>
                    </div>

                    {minerGear.helmet && (
                      <button
                        onClick={() => onUnequipGear(selectedMiner.id, 'helmet')}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 text-[10px] border border-slate-700 transition cursor-pointer"
                      >
                        Desequipar
                      </button>
                    )}
                  </div>

                  {/* SLOT 3: AMULETO MÍSTICO */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                        {minerGear.amulet ? minerGear.amulet.icon : '💍'}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">
                          Slot 3: Amuleto Místico
                        </div>
                        {minerGear.amulet ? (
                          <div>
                            <span className="font-arcade text-xs text-purple-300">
                              {minerGear.amulet.name}
                            </span>
                            <p className="text-[10px] text-amber-400 font-tech font-bold">
                              {minerGear.amulet.desc}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Nenhum amuleto equipado</span>
                        )}
                      </div>
                    </div>

                    {minerGear.amulet && (
                      <button
                        onClick={() => onUnequipGear(selectedMiner.id, 'amulet')}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 text-[10px] border border-slate-700 transition cursor-pointer"
                      >
                        Desequipar
                      </button>
                    )}
                  </div>

                </div>

                {/* Resumo de Atributos com Equipamentos */}
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Poder Total: <b className="text-amber-400">{selectedMiner.power + (minerGear.weapon?.powerBonus || 0)}</b></span>
                  <span>2x BCOIN: <b className="text-purple-400">+{minerGear.amulet ? Math.round(minerGear.amulet.doubleBcoinChance * 100) : 0}%</b></span>
                </div>

              </div>
            )}

          </div>

          {/* COLUNA DIREITA: ARMAZÉM DE EQUIPAMENTOS (7 colunas) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            
            {/* Filtros por Categoria */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filterType === 'all' 
                      ? 'bg-sky-500 text-slate-950' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todos ({gearStash.length})
                </button>
                <button
                  onClick={() => setFilterType('weapon')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filterType === 'weapon' 
                      ? 'bg-sky-500 text-slate-950' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⛏️ Armas
                </button>
                <button
                  onClick={() => setFilterType('helmet')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filterType === 'helmet' 
                      ? 'bg-sky-500 text-slate-950' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🪖 Elmos
                </button>
                <button
                  onClick={() => setFilterType('amulet')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filterType === 'amulet' 
                      ? 'bg-sky-500 text-slate-950' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  💍 Amuletos
                </button>
              </div>

              <span className="text-xs text-slate-400 font-tech">
                Armazém: <b className="text-white">{gearStash.length}</b> itens
              </span>
            </div>

            {/* Dica de obtenção de loot */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-tech">
              <Sparkles size={15} className="shrink-0 text-amber-400" />
              <span>Como obter: Equipamentos caem ao quebrar <b>Veios de Ouro (14%)</b> e <b>Baús Místicos (40%)</b> na mina!</span>
            </div>

            {/* GRID DE ITENS DO ARMAZÉM */}
            <div className="flex-1 min-h-[300px] max-h-[460px] overflow-y-auto space-y-2.5 pr-1">
              {filteredStash.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/40 text-slate-500">
                  <Package size={36} className="mb-2 text-slate-600 animate-pulse" />
                  <p className="font-arcade text-xs text-slate-400">Nenhum equipamento nesta categoria</p>
                  <p className="text-xs text-slate-600 mt-1">Quebre veios de ouro e cofres no mapa para coletar novos itens!</p>
                </div>
              ) : (
                filteredStash.map((item) => {
                  const rStyle = GEAR_RARITIES[item.rarity] || GEAR_RARITIES.common;
                  const isEquippedOnTarget = minerGear[item.type]?.instanceId === item.instanceId;

                  return (
                    <div
                      key={item.instanceId}
                      className={`p-3 rounded-xl border bg-slate-900/90 hover:bg-slate-850 transition flex items-center justify-between ${rStyle.borderColor}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shadow">
                          {item.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-arcade text-xs text-white">{item.name}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${rStyle.bgBadge}`}>
                              {rStyle.name}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-400 font-tech mt-0.5">
                            {item.desc}
                          </p>
                          <span className="text-[10px] text-slate-500">
                            Obtido: {item.acquiredAt || 'Recente'}
                          </span>
                        </div>
                      </div>

                      {/* Botão de Equipar no Herói Selecionado */}
                      <button
                        onClick={() => {
                          if (selectedMiner) {
                            onEquipGear(selectedMiner.id, item);
                            sfx.playMineAction();
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                          isEquippedOnTarget 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default' 
                            : 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-arcade text-[11px] shadow-sm'
                        }`}
                      >
                        {isEquippedOnTarget ? (
                          <>
                            <Check size={13} />
                            <span>Equipado</span>
                          </>
                        ) : (
                          <>
                            <ArrowRight size={13} />
                            <span>Equipar</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
