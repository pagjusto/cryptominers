import React, { useState } from 'react';
import { X, Flame, Zap, Battery, Sparkles, Shield, ChevronRight } from 'lucide-react';
import { MINER_ROSTER } from '../data/minersCatalog';

export default function MinerCatalogModal({ isOpen, onClose, onOpenMintModal }) {
  const [selectedMiner, setSelectedMiner] = useState(MINER_ROSTER[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl h-[85vh] rounded-3xl p-6 bg-slate-900 border-2 border-slate-700 text-slate-100 shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl border border-amber-500/30">
              📖
            </div>
            <div>
              <h3 className="font-arcade text-base text-amber-400">
                CATÁLOGO DE COMBATENTES SOBREVIVENTES
              </h3>
              <p className="text-xs text-slate-400 font-tech">
                Conheça os 13 heróis oficiais, armas equipadas, atributos e habilidades táticas de sobrevivência
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenMintModal();
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-arcade text-xs font-bold transition shadow-lg flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>MINTAR AGORA</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Conteúdo Principal Dividido: Lista à Esquerda + Detalhes da Carta à Direita */}
        <div className="flex-1 flex gap-6 overflow-hidden pt-4">
          
          {/* LADO ESQUERDO: LISTA DOS MINERADORES */}
          <div className="w-72 lg:w-80 overflow-y-auto space-y-2 pr-1 no-scrollbar shrink-0">
            {MINER_ROSTER.map((m) => {
              const isSelected = selectedMiner.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMiner(m)}
                  className={`p-3 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-amber-400 bg-amber-950/20 shadow-md ring-1 ring-amber-400/50'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl border flex items-center justify-center text-2xl shadow-inner overflow-hidden relative shrink-0"
                      style={{ 
                        borderColor: m.color,
                        backgroundColor: `${m.color}20`
                      }}
                    >
                      {m.image ? (
                        <img 
                          src={m.image} 
                          alt={m.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        m.avatar
                      )}
                    </div>
                    <div>
                      <h4 className="font-tech font-bold text-sm text-white">
                        {m.name}
                      </h4>
                      <span 
                        className="text-[10px] font-bold font-tech uppercase tracking-wider block"
                        style={{ color: m.color }}
                      >
                        {m.badge}
                      </span>
                    </div>
                  </div>

                  <ChevronRight size={18} className={isSelected ? 'text-amber-400' : 'text-slate-600'} />
                </div>
              );
            })}
          </div>

          {/* LADO DIREITO: CARTA COLECIONÁVEL EXPANDIDA */}
          <div className="flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar bg-slate-950 p-6 rounded-3xl border-2 border-slate-800 shadow-inner">
            
            {/* Topo da Carta */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-bold font-tech uppercase tracking-widest border"
                  style={{ 
                    borderColor: selectedMiner.color,
                    color: selectedMiner.color,
                    backgroundColor: `${selectedMiner.color}15`
                  }}
                >
                  ✦ {selectedMiner.badge} • {selectedMiner.role}
                </span>

                <span className="text-xs text-slate-400 font-tech">
                  Arma: <b className="text-white">{selectedMiner.equipment}</b>
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="w-24 h-24 rounded-3xl border-2 flex items-center justify-center text-5xl shadow-2xl overflow-hidden relative shrink-0 ring-2"
                  style={{ 
                    borderColor: selectedMiner.color,
                    backgroundColor: `${selectedMiner.color}15`,
                    ringColor: `${selectedMiner.color}40`
                  }}
                >
                  {selectedMiner.image ? (
                    <img 
                      src={selectedMiner.image} 
                      alt={selectedMiner.name} 
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  ) : (
                    selectedMiner.avatar
                  )}
                </div>
                <div>
                  <h2 className="font-arcade text-lg text-white mb-0.5">
                    {selectedMiner.name}
                  </h2>
                  <span className="text-sm text-amber-300 font-tech font-bold block">
                    "{selectedMiner.title}"
                  </span>
                  <p className="text-xs text-slate-400 font-tech mt-1 max-w-md">
                    {selectedMiner.lore}
                  </p>
                </div>
              </div>

              {/* Atributos Base */}
              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 font-tech flex items-center justify-center gap-1">
                    <Flame size={13} className="text-rose-400" /> FORÇA DO GOLPE
                  </span>
                  <span className="font-arcade text-lg text-white font-bold block mt-1">
                    {selectedMiner.basePower}
                  </span>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 font-tech flex items-center justify-center gap-1">
                    <Zap size={13} className="text-amber-400" /> VELOCIDADE
                  </span>
                  <span className="font-arcade text-lg text-white font-bold block mt-1">
                    {selectedMiner.baseSpeed}
                  </span>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 font-tech flex items-center justify-center gap-1">
                    <Battery size={13} className="text-sky-400" /> ESTAMINA
                  </span>
                  <span className="font-arcade text-lg text-white font-bold block mt-1">
                    {selectedMiner.baseStamina}
                  </span>
                </div>
              </div>

              {/* Habilidade Passiva Exclusiva (Trait) */}
              <div 
                className="p-4 rounded-2xl border bg-slate-900/70"
                style={{ borderColor: `${selectedMiner.color}40` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={16} style={{ color: selectedMiner.color }} />
                  <span className="font-tech font-bold text-sm text-white">
                    HABILIDADE PASSIVA: {selectedMiner.passiveTrait.name}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-tech leading-relaxed">
                  {selectedMiner.passiveTrait.description}
                </p>
              </div>
            </div>

            {/* Rodapé da Carta */}
            <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-tech">
                Disponível no Recrutamento ou Contrato Direto por <b className="text-amber-300 font-mono">{selectedMiner.directCostBcoin * 100} MNC</b>.
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenMintModal();
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade text-xs font-bold transition shadow-lg flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>RECRUTAR COMBATENTE</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
