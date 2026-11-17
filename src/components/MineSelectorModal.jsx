import React from 'react';
import { X, Lock, CheckCircle2, Sparkles, Compass } from 'lucide-react';
import { MINES } from '../data/minersData';

export default function MineSelectorModal({ 
  isOpen, 
  onClose, 
  currentMine, 
  onSelectMine, 
  playerGold,
  onOpenCampaignMap
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl rounded-3xl p-6 bg-slate-900 border-2 border-slate-700 text-slate-100 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl border border-amber-500/30">
              🧭
            </div>
            <div>
              <h3 className="font-arcade text-base text-amber-400">
                MAPA DAS MINAS SUBTERRÂNEAS
              </h3>
              <p className="text-xs text-slate-400 font-tech">
                Desbloqueie cavernas mais profundas com minérios raros e maiores recompensas
              </p>
            </div>
          </div>
        </div>

        {/* Banner com atalho para a Trilha de Fases (Saga) */}
        {onOpenCampaignMap && (
          <div 
            onClick={onOpenCampaignMap}
            className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-amber-900/50 to-slate-900 border border-amber-500/40 flex items-center justify-between cursor-pointer hover:border-amber-400 transition shadow-md group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl group-hover:scale-110 transition">🗺️</span>
              <div>
                <h4 className="font-arcade text-xs text-amber-300">
                  VER TRILHA ILUSTRADA DAS FASES (MAPA DA MINA)
                </h4>
                <p className="text-[11px] text-amber-200/70 font-tech">
                  Mapa visual com os 11 níveis, trilhos sinuosos, vagonetes e estrelas
                </p>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-arcade text-[10px] font-bold shadow">
              EXPLORAR SAGA →
            </span>
          </div>
        )}

        {/* Grade de Minas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
          {MINES.map((m) => {
            const isUnlocked = (playerGold !== undefined ? playerGold : 999999) >= m.reqGold;
            const isCurrent = currentMine.id === m.id;

            return (
              <div
                key={m.id}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectMine(m);
                    onClose();
                  }
                }}
                className={`p-4 rounded-2xl border-2 transition relative flex flex-col justify-between ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-950/20 shadow-lg ring-1 ring-amber-400/50'
                    : isUnlocked
                    ? 'border-slate-700 bg-slate-950/70 hover:border-slate-500 cursor-pointer'
                    : 'border-slate-800 bg-slate-950/30 opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{m.icon}</span>
                    {isCurrent ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-arcade text-[9px] font-bold">
                        MINA ATIVA
                      </span>
                    ) : isUnlocked ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold font-tech">
                        DESBLOQUEADA
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-rose-400 font-tech font-bold">
                        <Lock size={12} /> Requer {m.reqGold} Ouro
                      </span>
                    )}
                  </div>

                  <h4 className="font-arcade text-xs text-white mb-0.5">
                    {m.name}
                  </h4>
                  <span className="text-[11px] text-amber-300 font-tech font-semibold block mb-2">
                    {m.subtitle}
                  </span>
                  <p className="text-[11px] text-slate-400 font-tech leading-relaxed mb-3">
                    {m.description}
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-xs font-tech text-slate-300">
                  <span>Multiplicador de Ouro: <b className="text-amber-400">{m.goldMultiplier}x</b></span>
                  <span>Minério: <b className="text-sky-300">{m.primaryDrop}</b></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
