import React, { useState } from 'react';
import { X, ShoppingBag, Tag, Sparkles, Flame, Zap, Battery, ShieldCheck, ArrowRight, DollarSign, Check, AlertCircle, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MARKETPLACE_FEE_PCT } from '../data/marketplaceData';
import { sfx } from '../utils/sfx';
import { getMinerActiveDays } from './HeroEvolutionModal';

export default function MarketplaceModal({ 
  isOpen, 
  onClose, 
  listings = [], 
  myMiners = [], 
  bcoinBalance = 0, 
  onBuyListing, 
  onListMiner, 
  onCancelListing,
  studioRevenue = 0 
}) {
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'sell'
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  
  // Estado para venda de minerador
  const [selectedMinerToSell, setSelectedMinerToSell] = useState(null);
  const [sellPriceInput, setSellPriceInput] = useState('25');

  if (!isOpen) return null;

  const filteredListings = listings.filter(item => {
    if (selectedClassFilter === 'all') return true;
    return item.miner.classId === selectedClassFilter;
  });

  const parsedPrice = parseFloat(sellPriceInput) || 0;
  const feeAmount = parseFloat(((parsedPrice * MARKETPLACE_FEE_PCT) / 100).toFixed(3));
  const sellerNetAmount = parseFloat((parsedPrice - feeAmount).toFixed(3));

  const handleConfirmBuy = (listing) => {
    if (bcoinBalance < listing.priceBcoin) return;
    onBuyListing(listing);
    sfx.playLevelUp();
    confetti({
      particleCount: 110,
      spread: 75,
      origin: { y: 0.6 },
      colors: [listing.miner.color, '#fbbf24', '#ffffff']
    });
  };

  const handleConfirmList = () => {
    if (!selectedMinerToSell || parsedPrice <= 0) return;
    onListMiner(selectedMinerToSell, parsedPrice);
    sfx.playMineAction();
    setSelectedMinerToSell(null);
    setSellPriceInput('25');
    setActiveTab('browse');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl p-6 bg-slate-900 border-2 border-slate-700 text-slate-100 shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl border border-amber-500/30">
              🛒
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-arcade text-sm text-amber-400">
                  MARKETPLACE P2P • COMÉRCIO DE MINERADORES
                </h3>
                <span className="text-[10px] font-bold font-tech px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  TAXA DE CORRETAGEM: {MARKETPLACE_FEE_PCT}%
                </span>
              </div>
              <p className="text-xs text-slate-400 font-tech">
                Compre e venda mineradores entre jogadores reais • Seu Saldo: <b className="text-amber-300 font-mono">{bcoinBalance.toFixed(3)} BCOIN</b>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-tech">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  activeTab === 'browse'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🛒 Explorar Mercado ({listings.length})
              </button>
              <button
                onClick={() => setActiveTab('sell')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  activeTab === 'sell'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🏷️ Anunciar / Vender
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Comissão oficial única de 5%: sem divisão interna não aprovada */}
        <div className="my-2.5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-950 to-emerald-500/10 border border-slate-800 flex items-center justify-between text-xs font-tech shrink-0">
          <span className="text-amber-300 font-bold">Comissão total da plataforma: {MARKETPLACE_FEE_PCT}%</span>
          <span className="text-emerald-400 font-bold">Vendedor recebe 95% • Jogo recebe 5%</span>
        </div>

        {/* ABA 1: EXPLORAR MERCADO (COMPRA DE MINERADORES) */}
        {activeTab === 'browse' && (
          <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-3">
            
            {/* Filtros de Classe */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-tech">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'miner', label: '🤖 Bomb-Bot' },
                { id: 'brute', label: '🪓 Viking' },
                { id: 'goblin', label: '🐸 Sapo Ninja' },
                { id: 'engineer', label: '🧙‍♂️ Mago Arcano' },
                { id: 'mage', label: '🧛 Vampiro' },
                { id: 'legendary', label: '👑 Golem' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedClassFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                    selectedClassFilter === f.id
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Grid dos Mineradores à Venda */}
            {filteredListings.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-tech">
                Nenhum minerador encontrado com o filtro selecionado no momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredListings.map(listing => {
                  const m = listing.miner;
                  const canAfford = bcoinBalance >= listing.priceBcoin;

                  return (
                    <div 
                      key={listing.id}
                      className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between text-left group"
                    >
                      <div>
                        {/* Topo do Card */}
                        <div className="flex items-center justify-between mb-2">
                          <span 
                            className="text-[10px] font-arcade font-bold px-2 py-0.5 rounded-full border"
                            style={{ 
                              borderColor: `${m.color}60`,
                              color: m.color,
                              backgroundColor: `${m.color}15`
                            }}
                          >
                            {m.badge || 'MINERADOR'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-tech">
                            Vendedor: <b className="text-slate-300">{listing.seller}</b>
                          </span>
                        </div>

                        {/* Avatar, Nome e Nível */}
                        <div className="flex items-center gap-3 mb-2.5">
                          <div 
                            className="w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-2xl shadow-inner shrink-0 group-hover:scale-105 transition overflow-hidden relative"
                            style={{ 
                              borderColor: m.color,
                              backgroundColor: `${m.color}20`
                            }}
                          >
                            <img 
                              src={m.image || `/miners/${m.classId}.png`} 
                              alt={m.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (e.target.src.endsWith('.png')) {
                                  e.target.src = `/miners/${m.classId}.jpg`;
                                } else {
                                  e.target.style.display = 'none';
                                }
                              }}
                            />
                            <span className="absolute -z-0">{m.avatar}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-tech font-bold text-sm text-white">
                                {m.name}
                              </h4>
                              {m.stars > 0 && (
                                <span className="text-[10px] text-amber-300 font-bold">
                                  {'★'.repeat(m.stars)}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-tech">
                              {listing.listedAt}
                            </span>
                          </div>
                        </div>

                        {/* Atributos + Idade */}
                        {(() => {
                          const ageDays = getMinerActiveDays(m);
                          const ageColor =
                            ageDays >= 80
                              ? 'text-rose-400'
                              : ageDays >= 70
                              ? 'text-orange-400'
                              : ageDays >= 50
                              ? 'text-amber-300'
                              : 'text-emerald-400';
                          return (
                            <div className="grid grid-cols-4 gap-1 bg-slate-900/80 p-2 rounded-xl text-center text-xs font-tech mb-2">
                              <div>
                                <span className="text-[10px] text-slate-400 block">FORÇA</span>
                                <span className="font-arcade text-rose-400 font-bold">{m.power}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">VELOC.</span>
                                <span className="font-arcade text-amber-400 font-bold">{m.speed}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">ESTAM.</span>
                                <span className="font-arcade text-sky-400 font-bold">{m.maxStamina}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">IDADE</span>
                                <span className={`font-arcade font-bold ${ageColor}`}>{ageDays}/80d</span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Passiva */}
                        {m.passiveTrait && (
                          <p className="text-[10px] text-slate-400 font-tech italic line-clamp-2 mb-3">
                            ✦ {m.passiveTrait.name}: {m.passiveTrait.description}
                          </p>
                        )}
                      </div>

                      {/* Botão de Compra com Preço */}
                      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-tech block uppercase">Preço:</span>
                          <span className="font-arcade text-sm text-amber-300 font-bold">
                            {listing.priceBcoin} BCOIN
                          </span>
                        </div>

                        {listing.isMyListing ? (
                          <button
                            onClick={() => onCancelListing(listing.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/50 hover:text-rose-300 text-slate-400 font-tech text-xs font-bold transition border border-slate-700 cursor-pointer"
                          >
                            Cancelar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConfirmBuy(listing)}
                            disabled={!canAfford}
                            className={`px-3.5 py-1.5 rounded-xl font-arcade text-xs font-bold transition shadow-sm flex items-center gap-1.5 ${
                              canAfford
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer active:scale-95'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800'
                            }`}
                          >
                            <span>COMPRAR</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ABA 2: ANUNCIAR / VENDER MINERADORES */}
        {activeTab === 'sell' && (
          <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* LADO ESQUERDO: ESCOLHER MINERADOR DA SUA EQUIPE */}
              <div className="bg-slate-950/80 p-4 rounded-3xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <h4 className="font-tech font-bold text-xs text-amber-300 uppercase tracking-wider mb-2">
                    1. Escolha o Minerador que deseja colocar à venda:
                  </h4>

                  {myMiners.length === 0 ? (
                    <p className="text-xs text-slate-500 font-tech py-6 text-center">
                      Você não possui mineradores disponíveis para anunciar.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pr-1">
                      {myMiners.map(miner => {
                        const isSelected = selectedMinerToSell?.id === miner.id;
                        return (
                          <div 
                            key={miner.id}
                            onClick={() => setSelectedMinerToSell(miner)}
                            className={`p-2.5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'border-amber-400 bg-amber-950/30 ring-1 ring-amber-400/50 shadow-md'
                                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl">{miner.avatar}</span>
                              <div className="text-left">
                                <span className="font-tech font-bold text-xs text-white flex items-center gap-1">
                                  <span>{miner.name}</span>
                                  {miner.stars > 0 && (
                                    <span className="text-[10px] text-amber-300">{'★'.repeat(miner.stars)}</span>
                                  )}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ⚔ {miner.power} | ⚡ {miner.speed} | 🔋 {miner.maxStamina} | ⏳ {getMinerActiveDays(miner)}/80d
                                </span>
                              </div>
                            </div>

                            <span className="text-xs font-tech font-bold text-amber-400">
                              {isSelected ? '✓ Selecionado' : 'Selecionar'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-slate-500 font-tech mt-3">
                  * Ao anunciar no mercado, o minerador sai temporariamente da mina até ser vendido ou cancelado.
                </p>
              </div>

              {/* LADO DIREITO: DEFINIR PREÇO & SIMULADOR DA COMISSÃO DE 5% */}
              <div className="bg-slate-950/80 p-4 rounded-3xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <h4 className="font-tech font-bold text-xs text-amber-300 uppercase tracking-wider mb-3">
                    2. Defina o Preço de Venda em BCOIN:
                  </h4>

                  {selectedMinerToSell ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-slate-400 font-tech block mb-1">
                          Valor anunciado no Marketplace (BCOIN):
                        </label>
                        <div className="relative">
                          <input 
                            type="number"
                            min="1"
                            step="0.5"
                            value={sellPriceInput}
                            onChange={e => setSellPriceInput(e.target.value)}
                            className="w-full bg-slate-900 border-2 border-slate-700 focus:border-amber-400 rounded-2xl py-2.5 px-4 font-arcade text-base text-amber-300 outline-none"
                          />
                          <span className="absolute right-4 top-3 text-xs font-tech font-bold text-slate-400">
                            BCOIN
                          </span>
                        </div>
                      </div>

                      {/* Simulador da Comissão de 5% */}
                      <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs font-tech">
                        <div className="flex justify-between text-slate-400">
                          <span>Preço Bruto de Venda:</span>
                          <span className="font-mono text-white font-bold">{parsedPrice.toFixed(3)} BCOIN</span>
                        </div>
                        <div className="flex justify-between text-rose-400 border-b border-slate-800 pb-1.5">
                          <span>Taxa da Plataforma ({MARKETPLACE_FEE_PCT}%):</span>
                          <span className="font-mono font-bold">-{feeAmount.toFixed(3)} BCOIN</span>
                        </div>
                        <div className="flex justify-between text-emerald-400 text-sm font-bold pt-0.5">
                          <span>Você Recebe Líquido:</span>
                          <span className="font-mono font-arcade text-base text-emerald-300">
                            +{sellerNetAmount.toFixed(3)} BCOIN
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 font-tech space-y-0.5">
                        <span className="block text-slate-500">Regra Oficial do Marketplace:</span>
                        <span className="block text-emerald-300">• 95% do valor creditado ao vendedor (+{sellerNetAmount.toFixed(3)} Coins)</span>
                        <span className="block text-amber-300">• 5% de comissão retida pelo jogo (-{feeAmount.toFixed(3)} Coins)</span>
                        <span className="block text-slate-400">• Sem taxas adicionais ou escondidas</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-500 text-xs font-tech">
                      Selecione um minerador na lista ao lado para configurar o preço de venda.
                    </div>
                  )}
                </div>

                <button
                  onClick={handleConfirmList}
                  disabled={!selectedMinerToSell || parsedPrice <= 0}
                  className={`w-full mt-4 py-3 rounded-2xl font-arcade text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 ${
                    selectedMinerToSell && parsedPrice > 0
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 cursor-pointer'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800'
                  }`}
                >
                  <Tag size={15} />
                  <span>PUBLICAR NO MARKETPLACE</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
