import React from 'react';
import { X, Sparkles, Package, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ConstructionChestFoundModal({
  isOpen,
  chest,
  dailyStats = { chestsAwardedToday: 1, dailyLimit: 3 },
  onClose,
  onOpenInventory
}) {
  if (!isOpen || !chest) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none font-tech">
      <div 
        className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/70 rounded-3xl p-6 text-center shadow-2xl overflow-hidden text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Efeito Glow de Fundo */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Ícone Animado */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="w-24 h-24 rounded-3xl bg-amber-500/10 border-2 border-amber-400 p-2 flex items-center justify-center shadow-lg shadow-amber-950/60 animate-bounce">
            <img src="/items/boss_chest.png" alt="Baú do Boss" className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" />
          </div>
          <span className="absolute -top-1 -right-1 text-sm bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded-full border border-amber-300">
            ★
          </span>
        </div>

        {/* Título e Mensagem */}
        <h2 className="font-arcade text-base text-amber-400 mb-1">
          BAÚ DO BOSS ENCONTRADO!
        </h2>
        <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed mb-4">
          O Boss Mutante foi derrotado e dropou este <b>Baú do Boss</b> exclusivo com fragmentos, poções e chances de herói!
        </p>

        {/* Quadro Informativo do Baú */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 text-left mb-5">
          <div className="flex justify-between text-slate-400">
            <span>Identificador Oficial:</span>
            <span className="font-mono text-amber-300 font-bold">{chest.id}</span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Recompensa do Baú:</span>
            <span className="font-mono text-emerald-400 font-bold">1 Fragmento de Construção</span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Utilidade:</span>
            <span className="text-slate-300 font-tech">Evolução exclusiva de Casas</span>
          </div>

          <div className="flex justify-between text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Limite Diário da Conta:</span>
            <span className="font-mono text-amber-400 font-bold">
              {dailyStats.chestsAwardedToday} de {dailyStats.dailyLimit} hoje
            </span>
          </div>

          <div className="flex justify-between text-slate-500 text-[10px]">
            <span>Horário de Brasília:</span>
            <span>{chest.foundAt}</span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              if (onOpenInventory) onOpenInventory();
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-arcade text-xs font-bold transition shadow-lg shadow-amber-950/40 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <Package size={16} />
            <span>ABRIR NO INVENTÁRIO</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-tech font-bold transition cursor-pointer"
          >
            Continuar Minerando
          </button>
        </div>

        <p className="text-[10px] text-slate-500 mt-3">
          O baú foi adicionado automaticamente ao seu inventário sem interromper a mineração.
        </p>

      </div>
    </div>
  );
}
