import React, { useState } from 'react';
import { X, Sparkles, Flame, CheckCircle, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sfx } from '../utils/sfx';

const SPONSORS = [
  {
    name: 'Binance Web3 Vault',
    logo: '🟡',
    color: '#f59e0b',
    tagline: 'Patrocínio Oficial Play-to-Earn',
    chestTitle: 'Super Baú de Titânio Binance'
  },
  {
    name: 'Ledger Nano Security',
    logo: '🛡️',
    color: '#38bdf8',
    tagline: 'Segurança Cripto em Profundidade',
    chestTitle: 'Cofre Místico Lacrado Ledger'
  },
  {
    name: 'Red Bull Energy Rush',
    logo: '⚡',
    color: '#ef4444',
    tagline: 'Energia Ilimitada para Gamers',
    chestTitle: 'Baú Atômico de Rubis Red Bull'
  }
];

export default function PlayableChestModal({ isOpen, onClose, chest, onChestOpened }) {
  const [clicksRemaining, setClicksRemaining] = useState(3);
  const [isExploding, setIsExploding] = useState(false);
  const [openedReward, setOpenedReward] = useState(null);
  const [sponsor] = useState(() => SPONSORS[Math.floor(Math.random() * SPONSORS.length)]);

  if (!isOpen || !chest) return null;

  const handleStrike = () => {
    if (clicksRemaining <= 0 || isExploding || openedReward) return;

    sfx.playMineAction();

    const nextClicks = clicksRemaining - 1;
    setClicksRemaining(nextClicks);

    if (nextClicks === 0) {
      setIsExploding(true);
      sfx.playDynamiteBlast();

      setTimeout(() => {
        const rewardBcoin = parseFloat((Math.random() * 2.0 + 1.8).toFixed(3)); // Entre 1.800 e 3.800 BCOIN patrocinados!
        setOpenedReward(rewardBcoin);
        setIsExploding(false);
        sfx.playLevelUp();

        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.55 },
          colors: [sponsor.color, '#fbbf24', '#ffffff']
        });
      }, 700);
    }
  };

  const handleClaim = () => {
    if (!openedReward) return;
    onChestOpened(chest.id, openedReward);
    onClose();
  };

  const totalClicks = 3;
  const progressPct = Math.round(((totalClicks - clicksRemaining) / totalClicks) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn select-none">
      <div 
        className="relative w-full max-w-md rounded-3xl p-6 bg-slate-900 border-2 border-slate-700 text-center shadow-2xl flex flex-col justify-between overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabeçalho do Patrocinador (Playable Ad) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">{sponsor.logo}</span>
            <div className="text-left">
              <span className="font-arcade text-xs text-amber-400 block">
                {sponsor.name}
              </span>
              <span className="text-[10px] text-slate-400 font-tech">
                {sponsor.tagline} • <b className="text-amber-300">PLAYABLE AD INTERATIVO</b>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* ÁREA INTERATIVA DO MINI-DESAFIO */}
        {!openedReward ? (
          <div className="py-6 my-auto">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold font-tech uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
              ✦ MINI-DESAFIO: DETONE O LACRE DE TITÂNIO ✦
            </span>

            <p className="text-xs text-slate-300 font-tech mb-4">
              Clique no baú <b className="text-amber-300">{clicksRemaining}x</b> para armar a carga e quebrar o cofre!
            </p>

            {/* Baú Clicável com Feedback de Impacto */}
            <div 
              onClick={handleStrike}
              className={`w-40 h-40 mx-auto rounded-3xl border-3 flex flex-col items-center justify-center p-2 cursor-pointer transition-all duration-150 active:scale-90 shadow-2xl relative ${
                isExploding 
                  ? 'scale-125 bg-amber-500 border-white animate-ping' 
                  : 'bg-slate-950/90 border-amber-500/50 hover:border-amber-400 hover:scale-105'
              }`}
              style={{
                boxShadow: `0 0 30px ${sponsor.color}30`
              }}
            >
              <img 
                src="/items/hero_chest.png" 
                alt="Baú de Herói" 
                className={`w-24 h-24 object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] ${isExploding ? 'animate-bounce' : ''}`}
              />
              <span className="text-[11px] font-arcade text-amber-300 mt-1 font-bold">
                {clicksRemaining > 0 ? `GOLPEAR! (${clicksRemaining})` : 'DETONANDO!'}
              </span>
            </div>

            {/* Barra de impacto */}
            <div className="max-w-xs mx-auto mt-6">
              <div className="flex justify-between text-[11px] font-tech text-slate-400 mb-1">
                <span>Resistência do Lacre:</span>
                <span className="text-amber-300 font-mono font-bold">{progressPct}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-200 rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* TELA DE RECOMPENSA DESBLOQUEADA APÓS O MINI-GAME */
          <div className="py-6 my-auto animate-scaleUp">
            <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-5xl border border-amber-500/40 shadow-xl">
              🪙
            </div>

            <span className="text-[11px] font-tech font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full inline-block mb-2">
              ✓ RECOMPENSA PATROCINADA LIBERADA!
            </span>

            <h3 className="font-arcade text-2xl text-amber-300 mb-1">
              +{openedReward} BCOIN
            </h3>

            <p className="text-xs text-slate-400 font-tech max-w-xs mx-auto mb-6">
              Obrigado por interagir com o desafio da <b className="text-white">{sponsor.name}</b>. O valor foi depositado diretamente na sua carteira!
            </p>

            <button
              onClick={handleClaim}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-arcade text-xs font-bold transition shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={16} />
              <span>COLETAR E GUARDAR BCOIN</span>
            </button>
          </div>
        )}

        {/* Rodapé informativo do Playable Ad */}
        <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-tech">
          Este mini-game gera receita publicitária externa 100% repassada ao cofre de recompensas da comunidade.
        </div>
      </div>
    </div>
  );
}
