import React, { useState, useEffect } from 'react';
import { X, Play, Sparkles, CheckCircle2, ShieldCheck, ExternalLink, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sfx } from '../utils/sfx';

// Lista de patrocinadores fictícios de alta qualidade para simular o ecossistema
const SPONSORS = [
  {
    id: 'binance',
    brand: 'Binance Pay & Web3',
    headline: 'Conecte sua carteira Web3 com taxa zero e máxima segurança.',
    tagline: 'Patrocinador Oficial do Crypto Miners',
    logo: '🟡',
    color: '#f59e0b',
    bgGrad: 'from-amber-950/80 via-slate-900 to-black',
    badge: 'PARCEIRO OFICIAL'
  },
  {
    id: 'ledger',
    brand: 'Ledger Nano Vault',
    headline: 'Guarde seus BCOINs e NFTs na hardware wallet mais segura do mundo.',
    tagline: 'Segurança de Nível Militar Subterrâneo',
    logo: '🛡️',
    color: '#38bdf8',
    bgGrad: 'from-sky-950/80 via-slate-900 to-black',
    badge: 'SEGURANÇA CRYPTO'
  },
  {
    id: 'redbull',
    brand: 'Energy Rush Gaming',
    headline: 'Energia infinita para minerar as profundezas mais escuras.',
    tagline: 'Turbine a estamina da sua equipe',
    logo: '⚡',
    color: '#ef4444',
    bgGrad: 'from-rose-950/80 via-slate-900 to-black',
    badge: 'ENERGIA TURBO'
  }
];

export default function RewardedAdModal({ 
  isOpen, 
  onClose, 
  onRewardGranted, 
  rewardTitle = "Recuperar Estamina 100%",
  rewardIcon = "⚡",
  durationSec = 5 
}) {
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sponsor] = useState(() => SPONSORS[Math.floor(Math.random() * SPONSORS.length)]);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(durationSec);
      setIsCompleted(false);
      return;
    }

    setTimeLeft(durationSec);
    setIsCompleted(false);

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCompleted(true);
          sfx.playLevelUp();
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
            colors: [sponsor.color, '#fbbf24', '#ffffff']
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, durationSec, sponsor.color]);

  if (!isOpen) return null;

  const handleClaim = () => {
    if (!isCompleted) return;
    onRewardGranted();
    onClose();
  };

  const progressPct = Math.round(((durationSec - timeLeft) / durationSec) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div 
        className={`relative w-full max-w-md rounded-3xl p-6 bg-gradient-to-b ${sponsor.bgGrad} border-2 border-slate-700 text-center shadow-2xl flex flex-col justify-between overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Barra superior de status do anúncio */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-arcade font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
              ANÚNCIO PATROCINADO
            </span>
            <span className="text-[10px] font-tech text-slate-400">
              {isCompleted ? 'Recompensa liberada!' : `Aguarde ${timeLeft}s`}
            </span>
          </div>

          {isCompleted && (
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Barra de progresso do patrocinador */}
        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden my-3 border border-slate-800">
          <div 
            className="h-full transition-all duration-1000 ease-linear rounded-full"
            style={{ 
              width: `${progressPct}%`,
              backgroundColor: sponsor.color
            }}
          />
        </div>

        {/* Conteúdo do Anúncio Patrocinado */}
        <div className="py-4 my-auto">
          <div 
            className="w-16 h-16 mx-auto mb-3 rounded-2xl border-2 flex items-center justify-center text-3xl shadow-xl animate-pulse"
            style={{ 
              borderColor: sponsor.color,
              backgroundColor: `${sponsor.color}20`
            }}
          >
            {sponsor.logo}
          </div>

          <span 
            className="text-[10px] font-tech font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-block mb-1 border"
            style={{ 
              borderColor: `${sponsor.color}50`,
              color: sponsor.color,
              backgroundColor: `${sponsor.color}10`
            }}
          >
            {sponsor.badge}
          </span>

          <h3 className="font-arcade text-base text-white mb-1">
            {sponsor.brand}
          </h3>

          <p className="text-xs text-slate-300 font-tech mb-2 max-w-xs mx-auto leading-relaxed">
            {sponsor.headline}
          </p>

          <span className="text-[10px] text-slate-500 font-tech block">
            {sponsor.tagline}
          </span>
        </div>

        {/* Caixa de Bonificação Prometida */}
        <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 my-2 text-left flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl shrink-0">
              {rewardIcon}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-tech block uppercase">
                Bônus Financiado pelo Patrocinador:
              </span>
              <span className="font-tech font-bold text-xs text-amber-300">
                {rewardTitle}
              </span>
            </div>
          </div>

          {isCompleted ? (
            <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-full border-2 border-slate-700 border-t-amber-400 animate-spin shrink-0" />
          )}
        </div>

        {/* Botão de Resgate / Conclusão */}
        <div className="pt-2">
          <button
            onClick={handleClaim}
            disabled={!isCompleted}
            className={`w-full py-3.5 rounded-2xl font-arcade text-xs font-bold transition shadow-xl flex items-center justify-center gap-2 ${
              isCompleted
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 cursor-pointer animate-scaleUp'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Sparkles size={16} />
            <span>
              {isCompleted ? 'COLETAR BÔNUS PATROCINADO' : `AGUARDE ${timeLeft} SEGUNDOS...`}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
