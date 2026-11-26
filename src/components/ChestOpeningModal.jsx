import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  Flame, 
  Zap, 
  Battery, 
  ShieldCheck, 
  HelpCircle,
  Gift,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sfx } from '../utils/sfx';
import { getCryptoZombiesConfig } from '../data/cryptoZombiesConfig';
import { MINER_ROSTER } from '../data/minersCatalog';
import { rollHeroRarity, recordAdTransaction } from '../utils/adRewardService';
import RewardedAdModal from './RewardedAdModal';

export default function ChestOpeningModal({
  isOpen,
  onClose,
  chest, // { id: 'miner'|'explorer'|'elite'|'legendary', name, icon, heroesCount, ... }
  onHeroesMinted, // callback(mintedHeroes, isAdBonus)
  remainingChestsCount = 0,
  onOpenInventory
}) {
  if (!isOpen || !chest) return null;

  const [isOpening, setIsOpening] = useState(false);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [revealedHeroes, setRevealedHeroes] = useState(null);
  const [usedAdBonus, setUsedAdBonus] = useState(false);

  const config = getCryptoZombiesConfig();
  const chestConfig = config.chests[chest.id] || config.chests.miner;
  const heroesToMint = chestConfig.heroesCount || chest.heroesCount || 1;

  const defaultProbs = {
    common: 82.87,
    rare: 10.36,
    super_rare: 5.18,
    epic: 1.04,
    legendary: 0.51,
    super_legend: 0.04
  };
  const normalProbs = chestConfig.normalProbabilities || chestConfig.probabilities || defaultProbs;
  const adProbs = chestConfig.adBonusProbabilities || defaultProbs;

  const randomName = () => {
    const names = [
      'Borto', 'Kael', 'Durn', 'Gimlin', 'Vorgan', 'Zix',
      'Ignor', 'Rumble', 'Thorne', 'Barik', 'Grimlock', 'Solas', 'Magnus', 'Vesper',
      'Torin', 'Balin', 'Farin', 'Gloin', 'Nori', 'Bofur', 'Bomb-Bot', 'Viking'
    ];
    return names[Math.floor(Math.random() * names.length)];
  };

  const executeRollAndReveal = (isBonus = false) => {
    setIsOpening(true);

    setTimeout(() => {
      sfx.playLevelUp();
      const mintedBatch = [];

      for (let i = 0; i < heroesToMint; i++) {
        // Sorteio individual e independente de raridade por herói
        const selectedRarity = rollHeroRarity(chest.id, isBonus, config);

        let matchingClasses = MINER_ROSTER.filter(m => m.rarity === selectedRarity);
        if (matchingClasses.length === 0) matchingClasses = MINER_ROSTER;
        const pickedRoster = matchingClasses[Math.floor(Math.random() * matchingClasses.length)];

        const attr = config.rarityAttributes[selectedRarity] || config.rarityAttributes.common;
        const rolledPower = parseFloat((attr.basePowerMin + Math.random() * (attr.basePowerMax - attr.basePowerMin)).toFixed(1));
        const rolledCoins = parseFloat((attr.coinsPerHourMin + Math.random() * (attr.coinsPerHourMax - attr.coinsPerHourMin)).toFixed(3));

        mintedBatch.push({
          id: 'miner-' + Date.now() + '-' + i,
          name: `${pickedRoster.name} #${Math.floor(Math.random() * 900 + 100)}`,
          heroId: pickedRoster.heroId || pickedRoster.id.replace('class_', ''),
          classId: pickedRoster.classId || pickedRoster.id.replace('class_', ''),
          className: pickedRoster.title || pickedRoster.role,
          weaponId: pickedRoster.weaponId || 'assault-rifle',
          spriteIndex: pickedRoster.spriteIndex ?? 0,
          rarity: selectedRarity,
          rarityName: pickedRoster.badge,
          power: rolledPower,
          speed: pickedRoster.baseSpeed || 1.2,
          coinsPerHour: rolledCoins,
          maxStamina: attr.maxEnergy || 100,
          currentStamina: attr.maxEnergy || 100,
          energyDrainRate: attr.energyDrainPerMinute || 1.0,
          durability: 100,
          status: 'work',
          x: Math.floor(Math.random() * 3 + 1),
          y: Math.floor(Math.random() * 3 + 1),
          avatar: pickedRoster.avatar,
          image: pickedRoster.image || `/assets/heroes/${pickedRoster.heroId}.png`,
          color: pickedRoster.color,
          passiveTrait: pickedRoster.passiveTrait
        });
      }

      confetti({
        particleCount: isBonus ? 160 : (heroesToMint >= 10 ? 140 : 80),
        spread: 80,
        origin: { y: 0.55 },
        colors: isBonus ? ['#22c55e', '#fbbf24', '#a855f7', '#ffffff'] : ['#f59e0b', '#38bdf8', '#ffffff']
      });

      setRevealedHeroes(mintedBatch);
      setUsedAdBonus(isBonus);
      setIsOpening(false);

      if (onHeroesMinted) {
        onHeroesMinted(mintedBatch, isBonus, chest);
      }
    }, 1000);
  };

  // 1. OPÇÃO A — ABERTURA NORMAL (Sem Anúncio)
  const handleNormalOpen = () => {
    if (isOpening) return;
    executeRollAndReveal(false);
  };

  // 2. OPÇÃO B — ABERTURA COM BÔNUS (Assistir Anúncio)
  const handleStartAdOpen = () => {
    if (isOpening) return;
    setIsAdModalOpen(true);
  };

  const handleAdRewardCompleted = () => {
    setIsAdModalOpen(false);
    // Registra transação de anúncio concluída no Fundo de Sustentabilidade
    recordAdTransaction({
      type: 'chest_bonus',
      benefitDescription: `Bônus de Probabilidades no Baú ${chestConfig.name} (${heroesToMint} heróis)`,
      chestType: chest.id,
      status: 'completed',
      estimatedRevenueUsd: 0.025
    });
    // Executa abertura com probabilidades aumentadas
    executeRollAndReveal(true);
  };

  const handleCloseAll = () => {
    setRevealedHeroes(null);
    setIsOpening(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none text-white font-tech">
        <div 
          className="relative w-full max-w-2xl max-h-[92vh] rounded-3xl p-5 sm:p-6 bg-slate-900 border-2 border-slate-700 text-center shadow-2xl flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Botão de Fechar */}
          <button
            onClick={handleCloseAll}
            className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition z-10 cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* TELA DE REVELAÇÃO DOS HERÓIS APÓS ABERTURA */}
          {revealedHeroes ? (
            <div className="py-2 flex flex-col h-full overflow-hidden animate-scaleUp text-left">
              <div className="mb-3 text-center">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold font-arcade uppercase tracking-wider mb-1.5 border shadow-md ${
                  usedAdBonus
                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {usedAdBonus ? '✦ BÔNUS PUBLICITÁRIO APLICADO! 🍀 ✦' : '✦ ABERTURA NORMAL REALIZADA ✦'}
                </span>
                <h3 className="font-arcade text-base text-white">
                  {revealedHeroes.length} {revealedHeroes.length === 1 ? 'HERÓI RECRUTADO' : 'HERÓIS RECRUTADOS COM SUCESSO!'}
                </h3>
                <p className="text-xs text-slate-400 font-tech">
                  {usedAdBonus 
                    ? 'Probabilidades melhoradas via anúncio foram aplicadas individualmente a cada herói.' 
                    : 'Heróis invocados conforme as probabilidades normais da blockchain.'}
                </p>
              </div>

              {/* Grid dos Heróis Conquistados */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar max-h-[55vh] mb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {revealedHeroes.map((m, idx) => (
                    <div 
                      key={m.id || idx}
                      className="p-2.5 rounded-2xl border bg-slate-950/80 flex flex-col justify-between text-left transition hover:scale-[1.02] shadow-sm relative overflow-hidden"
                      style={{ borderColor: `${m.color}80` }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span 
                          className="text-[9px] font-bold font-mono px-1.5 py-0.2 rounded uppercase"
                          style={{ backgroundColor: `${m.color}25`, color: m.color }}
                        >
                          {m.rarity}
                        </span>
                        <span className="text-xs">{m.avatar}</span>
                      </div>

                      <div 
                        className="w-14 h-14 mx-auto my-1 rounded-xl border flex items-center justify-center overflow-hidden relative shadow-inner"
                        style={{ borderColor: m.color, backgroundColor: `${m.color}15` }}
                      >
                        <img 
                          src={m.image || `/miners/${m.classId}.png`}
                          alt={m.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            if (e.target.src.endsWith('.png')) e.target.src = `/miners/${m.classId}.jpg`;
                            else e.target.style.display = 'none';
                          }}
                        />
                      </div>

                      <h4 className="font-tech font-bold text-xs text-white truncate text-center mb-1">
                        {m.name}
                      </h4>

                      <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-lg text-center text-[9px] font-mono">
                        <span className="text-rose-400" title="Poder">⚔️{m.power}</span>
                        <span className="text-amber-400" title="Velocidade">⚡{m.speed.toFixed(1)}</span>
                        <span className="text-sky-400" title="Estamina">🔋{m.maxStamina}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md mx-auto">
                <button
                  onClick={handleCloseAll}
                  className="flex-1 py-3 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-arcade text-xs font-bold transition shadow-xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 size={16} />
                  <span>INTEGRAR À MINA ({revealedHeroes.length})</span>
                </button>

                {remainingChestsCount > 0 && onOpenInventory && (
                  <button
                    onClick={() => {
                      handleCloseAll();
                      onOpenInventory();
                    }}
                    className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 hover:border-amber-400 font-arcade text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Gift size={14} />
                    <span>ABRIR PRÓXIMO ({remainingChestsCount})</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* TELA DE ESCOLHA DA MODALIDADE DE ABERTURA */
            <div className="space-y-5 text-left">
              
              {/* Topo do Baú */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
                <div 
                  className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center p-2 shadow-inner shrink-0"
                  style={{ borderColor: chestConfig.color, backgroundColor: `${chestConfig.color}15` }}
                >
                  <img src={chestConfig.image || '/items/hero_chest.png'} alt="Baú de Herói" className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-arcade text-base sm:text-lg text-white">
                      {chest.name || chestConfig.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold font-mono text-[10px] border border-amber-500/40">
                      {heroesToMint} {heroesToMint === 1 ? 'HERÓI' : 'HERÓIS'}
                    </span>
                    {chest.currency && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold font-mono text-[10px] border border-slate-700">
                        {chest.currency}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {chestConfig.description || 'Abra seu baú e convoque novos heróis combatentes para a equipe. Concede exclusivamente heróis (sem recompensas em moedas).'}
                  </p>
                </div>
              </div>

              {/* TABELA COMPARATIVA DE PROBABILIDADES */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-tech font-bold text-xs text-slate-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" />
                    <span>COMPARATIVO DE PROBABILIDADES DE RARIDADE</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Sorteio individual por herói</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Comum</span>
                    <div className="font-mono text-slate-300 font-bold">{normalProbs.common}%</div>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold block mt-1">
                      {adProbs.common}% (Ad)
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-sky-400 block mb-0.5">Raro</span>
                    <div className="font-mono text-slate-300 font-bold">{normalProbs.rare}%</div>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold block mt-1">
                      {adProbs.rare}% (Ad)
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-purple-400 block mb-0.5">Épico</span>
                    <div className="font-mono text-slate-300 font-bold">{normalProbs.epic}%</div>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold block mt-1">
                      {adProbs.epic}% (Ad)
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 bg-amber-950/10">
                    <span className="text-[10px] text-amber-400 block mb-0.5">Lendário</span>
                    <div className="font-mono text-slate-300 font-bold">{normalProbs.legendary}%</div>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold block mt-1">
                      {adProbs.legendary}% (Ad)
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 font-tech">
                  💡 <b>Como funciona:</b> Ao optar por assistir ao anúncio recompensado, as probabilidades superiores são aumentadas para este baú específico sem nenhum custo adicional.
                </p>
              </div>

              {/* OPÇÕES DE ABERTURA LADO A LADO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                
                {/* OPÇÃO A — ABERTURA NORMAL */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-300 uppercase">Opção A</span>
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">DIRETO</span>
                    </div>
                    <h4 className="font-tech font-bold text-sm text-white">Abertura Normal</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Abre imediatamente sem exibição de anúncios, com as chances normais.
                    </p>
                  </div>

                  <button
                    onClick={handleNormalOpen}
                    disabled={isOpening}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-arcade text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                  >
                    <span>ABRIR NORMALMENTE</span>
                  </button>
                </div>

                {/* OPÇÃO B — ABERTURA COM BÔNUS PUBLICITÁRIO */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-950/90 to-slate-950 border-2 border-emerald-500/50 flex flex-col justify-between shadow-lg shadow-emerald-950/40 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[9px] font-bold font-arcade px-2 py-0.5 rounded-bl-lg">
                    CHANCES MELHORES 🍀
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-emerald-400 uppercase">Opção B</span>
                      <span className="text-[9px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">BÔNUS AD</span>
                    </div>
                    <h4 className="font-tech font-bold text-sm text-white flex items-center gap-1">
                      <span>Abertura com Bônus</span>
                      <Sparkles size={13} className="text-emerald-400" />
                    </h4>
                    <p className="text-[11px] text-emerald-300/80 mt-0.5">
                      Assista a um anúncio rápido para aumentar as probabilidades de Épicos e Lendários!
                    </p>
                  </div>

                  <button
                    onClick={handleStartAdOpen}
                    disabled={isOpening}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-arcade text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/60 active:scale-95"
                  >
                    <Play size={13} className="fill-slate-950" />
                    <span>ASSISTIR ANÚNCIO & ABRIR</span>
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>

      {/* PLAYER DE ANÚNCIO RECOMPENSADO */}
      <RewardedAdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onRewardGranted={handleAdRewardCompleted}
        rewardTitle={`Bênção da Sorte: Bônus de Probabilidades no ${chestConfig.name}`}
        rewardIcon="🍀"
        durationSec={5}
      />
    </>
  );
}
