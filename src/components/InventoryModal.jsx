import React, { useState } from 'react';
import { X, Package, Sparkles, Shield, Gift, ChevronRight, Zap, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sfx } from '../utils/sfx';

function groupInventoryItems(items, getKey) {
  const groups = new Map();
  items.forEach((item, index) => {
    const key = getKey(item);
    if (!groups.has(key)) groups.set(key, { item, quantity: 0, key: String(key ?? index) });
    groups.get(key).quantity += 1;
  });
  return Array.from(groups.values());
}

export default function InventoryModal({ 
  isOpen, 
  onClose, 
  purchasedChests = [],
  constructionChests = [],
  constructionFragments = 0,
  rejuvenationPotions = 0,
  onOpenHeroChest,
  onOpenConstructionChest,
  onOpenMintModal,
  onOpenHouseModal
}) {
  const [activeTab, setActiveTab] = useState(() => {
    if (constructionChests.length > 0) return 'construction';
    return 'heroes';
  });
  const [justOpenedChest, setJustOpenedChest] = useState(null);
  const groupedPurchasedChests = groupInventoryItems(purchasedChests, chest => chest.id);
  const groupedConstructionChests = groupInventoryItems(constructionChests, chest => chest.type || chest.kind || 'boss-chest');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none font-tech">
      <div 
        className="relative w-full max-w-xl max-h-[88vh] rounded-3xl p-5 sm:p-6 bg-slate-900 border-2 border-slate-700 text-slate-100 shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabeçalho do Inventário */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-white/60 overflow-hidden p-1 shadow-md">
              <img src="/assets/icons/backpack.png" alt="Mochila do Inventário" className="w-full h-full object-contain icon-white-border" />
            </div>
            <div>
              <h3 className="font-arcade text-sm text-amber-400">
                INVENTÁRIO DO JOGADOR
              </h3>
              <span className="text-[11px] text-slate-400">
                Baús de Heróis adquiridos e Baús de Poção e Fragmentos do Boss
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Abas do Inventário */}
        <div className="flex gap-2 py-3 border-b border-slate-800 shrink-0">
          <button
            onClick={() => { setActiveTab('heroes'); setJustOpenedChest(null); }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'heroes'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Gift size={14} />
            <span>Heróis ({purchasedChests.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab('construction'); setJustOpenedChest(null); }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'construction'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <img src="/items/boss_chest.png" alt="Poção e Fragmentos" className="w-3.5 h-3.5 object-contain" />
            <span>Poção e Fragmentos ({constructionChests.length})</span>
          </button>
        </div>

        {/* Lista de Baús */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-3">
          {activeTab === 'heroes' ? (
            /* ABA 1: BAÚS DE HERÓIS COMPRADOS EM Coins OU USDT */
            purchasedChests.length === 0 ? (
              <div className="py-8 text-center bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 p-6">
                <span className="text-4xl block mb-2">🎁</span>
                <h4 className="font-tech font-bold text-sm text-slate-300 mb-1">
                  Nenhum Baú de Heróis no Inventário
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  Adquira baús na loja (MINT) com <b>Coins</b> ou <b>USDT</b>. Todos os baús comprados (1, 5, 10 ou 15 heróis) são guardados aqui para você abrir um por um, escolhendo entre Abertura Normal ou com Bônus de Anúncio!
                </p>

                {onOpenMintModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMintModal();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-arcade text-xs font-bold transition flex items-center gap-1.5 mx-auto cursor-pointer shadow-md active:scale-95"
                  >
                    <Sparkles size={14} />
                    <span>Adquirir Baús na Loja (MINT)</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1 px-1">
                  <span className="text-xs text-slate-400">
                    Total guardado: <b className="text-amber-300 font-mono">{purchasedChests.length} baú(s)</b>
                  </span>
                  {onOpenMintModal && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenMintModal();
                      }}
                      className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>+ Comprar mais baús</span>
                    </button>
                  )}
                </div>

                {groupedPurchasedChests.map(({ item: chest, quantity, key }) => {
                  const chestIcon = chest.icon || (chest.id === 'legendary' ? '👑' : (chest.id === 'elite' ? '🛡️' : (chest.id === 'explorer' ? '🧭' : '⛏️')));
                  const heroesCount = chest.heroesCount || 1;
                  const currency = chest.currency || 'USDT';
                  const isMiner = currency.toUpperCase() === 'MINER';
                  const isBossReward = chest.source === 'boss_reward';

                  return (
                    <div 
                      key={key}
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition flex items-center justify-between group shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 p-1 flex items-center justify-center shrink-0 group-hover:scale-105 transition shadow-inner">
                          <img 
                            src={chest.image || '/items/hero_chest.png'} 
                            alt="Baú de Herói" 
                            className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" 
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-sm text-white">
                              {chest.name || `Baú ${chest.id}`}
                            </h4>
                            <span className="text-[9px] font-bold font-arcade bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
                              {heroesCount} {heroesCount === 1 ? 'HERÓI' : 'HERÓIS'}
                            </span>
                            <span className="text-[9px] font-bold font-mono bg-slate-800 text-white px-2 py-0.5 rounded-full border border-slate-700">×{quantity}</span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] ${
                              isBossReward ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : (isMiner ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30')
                            }`}>
                              {isBossReward ? '🎁 RECOMPENSA DO BOSS' : (isMiner ? '🪙 Coins' : '💳 USDT')} {chest.cost ? `(${chest.cost})` : ''}
                            </span>
                            {chest.purchasedAt && (
                              <span className="text-[10px] text-slate-500">
                                {chest.purchasedAt}
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                            ✦ Escolha individual: Abertura Normal ou com Bônus de Anúncio
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenHeroChest(chest)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-arcade text-xs font-bold transition shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                      >
                        <Sparkles size={13} />
                        <span>ABRIR</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          ) : activeTab === 'construction' ? (
            /* ABA 2: BAÚS DE CONSTRUÇÃO (ENTREGAM EXATAMENTE 1 FRAGMENTO DE CONSTRUÇÃO) */
            <div className="space-y-3">
              
              {/* Banner de Saldo de Fragmentos de Construção */}
              <div className="bg-gradient-to-r from-amber-500/20 via-slate-950 to-purple-500/20 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-amber-500/50 flex items-center justify-center p-1.5 shrink-0 shadow-inner">
                    <img 
                      src="/items/construction_fragment.png" 
                      alt="Fragmento de Construção" 
                      className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" 
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-arcade text-sm text-amber-300">
                        {constructionFragments} FRAGMENTO{constructionFragments === 1 ? '' : 'S'} DE CONSTRUÇÃO
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Utilizados exclusivamente para evoluir as Casas dos seus mineradores.
                    </p>
                  </div>
                </div>

                {onOpenHouseModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenHouseModal();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <Home size={14} />
                    <span>Evoluir Casa</span>
                  </button>
                )}
              </div>

              <div className="bg-gradient-to-r from-emerald-500/15 via-slate-950 to-teal-500/15 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-center p-1.5 shrink-0 shadow-inner">
                    <img 
                      src="/items/rejuvenation_potion.png" 
                      alt="Poção do Rejuvenescimento" 
                      className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(16,185,129,0.5)]" 
                    />
                  </div>
                  <div>
                    <span className="font-arcade text-sm text-emerald-300">{rejuvenationPotions} POÇÃO{rejuvenationPotions === 1 ? '' : 'ÕES'} DO REJUVENESCIMENTO</span>
                    <p className="text-[11px] text-slate-400">Itens acumulados em um único slot do inventário.</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-white bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">×{rejuvenationPotions}</span>
              </div>

              {/* Feedback de Baú Aberto Recentemente */}
              {justOpenedChest && (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-center space-y-2 animate-fadeIn">
                  <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                    🎉
                  </div>
                  <h4 className="font-arcade text-xs text-emerald-300">
                    BAÚ DE POÇÃO E FRAGMENTOS ABERTO!
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Recompensas: <b>{justOpenedChest.openingResult?.rewardParts?.join(' + ') || 'Nenhuma recompensa registrada'}</b>.
                    {justOpenedChest.openingResult?.fragmentGranted ? <> Agora você possui <b>{constructionFragments} fragmentos</b>.</> : null}
                  </p>
                  <button
                    onClick={() => setJustOpenedChest(null)}
                    className="px-4 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-arcade text-[10px] font-bold cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              )}

              {/* Lista de Baús de Poção e Fragmentos Fechados */}
              {constructionChests.length === 0 ? (
                <div className="py-8 text-center bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 p-6 space-y-2">
                  <div className="w-14 h-14 mx-auto mb-2 flex items-center justify-center">
                    <img src="/items/boss_chest.png" alt="Baú de Poção e Fragmentos" className="w-12 h-12 object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" />
                  </div>
                  <h4 className="font-tech font-bold text-sm text-slate-300">
                    Nenhum Baú de Poção e Fragmentos no momento
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Recompensa <b>exclusiva do Boss Mutante</b>! Participe das batalhas de defesa quando o Boss invadir a base às <b>12:00</b> e <b>20:00</b>. Ao derrotá-lo com sua equipe, o baú é entregue automaticamente aqui no seu inventário (máximo de <b>3 baús por dia</b>).
                  </p>
                </div>
              ) : (
                groupedConstructionChests.map(({ item: chest, quantity, key }) => (
                  <div 
                    key={key}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-400 transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/40 p-1 flex items-center justify-center shrink-0 group-hover:scale-105 transition shadow-inner">
                        <img src="/items/boss_chest.png" alt="Baú de Poção e Fragmentos" className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-arcade text-xs text-amber-300">
                            {chest.name || 'Baú de Poção e Fragmentos'}
                          </h4>
                          <span className="text-[9px] font-bold font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                            {chest.id}
                          </span>
                          <span className="text-[9px] font-bold font-mono bg-slate-800 text-white px-2 py-0.5 rounded-full border border-slate-700">×{quantity}</span>
                        </div>

                        <span className="text-[11px] text-slate-300 block mt-0.5">
                          Recompensas ao abrir: <b className="text-emerald-400 font-mono">45% Fragmento · 45% Poção · 10% ambos</b> + 5% Baú de Herói
                        </span>

                        <span className="text-[10px] text-slate-500 block">
                          Encontrado em: {chest.foundAt || 'Boss Mutante derrotado'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (onOpenConstructionChest) {
                          const result = onOpenConstructionChest(chest.id);
                          if (result?.success) setJustOpenedChest({ ...chest, openingResult: result });
                        }
                        sfx.playLevelUp();
                        confetti({
                          particleCount: 110,
                          spread: 70,
                          origin: { y: 0.6 },
                          colors: ['#f59e0b', '#38bdf8', '#ffffff']
                        });
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-arcade text-xs font-bold transition shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                    >
                      <Sparkles size={13} />
                      <span>ABRIR BAÚ</span>
                    </button>
                  </div>
                ))
              )}

            </div>
          ) : null}
        </div>

        {/* Rodapé Informativo */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            {activeTab === 'heroes' 
              ? 'Abra cada baú individualmente com ou sem bônus de anúncio.' 
              : 'Baús de Poção e Fragmentos são exclusivos do Boss e concedem Poções e Fragmentos.'}
          </span>
        </div>

      </div>
    </div>
  );
}
