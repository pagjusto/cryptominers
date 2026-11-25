import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Flame, 
  Zap, 
  Battery, 
  Sparkles, 
  Package, 
  Shield, 
  UserPlus, 
  Check, 
  Wallet, 
  Coins, 
  ArrowRight,
  Calculator,
  Gift
} from 'lucide-react';
import { MINERS_ROSTER, MINT_CHEST_TYPES } from '../data/minersCatalog';
import { getCryptoZombiesConfig } from '../data/cryptoZombiesConfig';
import { sfx } from '../utils/sfx';

export default function SummonModal({
  isOpen,
  onClose,
  onRecruitMiner,
  minerBalance = 0,
  walletState = { isConnected: false, usdtBalance: 0 },
  onOpenWalletModal,
  onOpenRoiSimulator,
  onBuyAndStoreChest,
  onOpenInventory,
  purchasedChestsCount = 0
}) {
  const [activeTab, setActiveTab] = useState('mint'); // 'mint' | 'tavern'
  const [paymentCurrency, setPaymentCurrency] = useState('miner'); // 'miner' | 'usdt'
  const [selectedChestType, setSelectedChestType] = useState('miner');
  const [isProcessing, setIsProcessing] = useState(false);
  const [justPurchasedChest, setJustPurchasedChest] = useState(null);
  const [revealedMiner, setRevealedMiner] = useState(null);

  if (!isOpen) return null;

  const config = getCryptoZombiesConfig();
  const rate = config?.minerCoinUsdtRate || 1.0;
  const currentChest = MINT_CHEST_TYPES.find(c => c.id === selectedChestType) || MINT_CHEST_TYPES[0];
  const chestCostUsdt = currentChest.costUsdt || currentChest.costBcoin || 10;
  const chestCostMiner = rate > 0 ? parseFloat((chestCostUsdt / rate).toFixed(2)) : chestCostUsdt;
  const chestCost = paymentCurrency === 'miner' ? chestCostMiner : chestCostUsdt;
  
  const canAffordChest = paymentCurrency === 'miner'
    ? minerBalance >= chestCostMiner
    : (walletState.isConnected && walletState.usdtBalance >= chestCostUsdt);

  const randomName = () => {
    const names = [
      'Borto', 'Kael', 'Durn', 'Gimlin', 'Vorgan', 'Zix',
      'Ignor', 'Rumble', 'Thorne', 'Barik', 'Grimlock', 'Solas', 'Magnus', 'Vesper',
      'Torin', 'Balin', 'Farin', 'Gloin', 'Nori', 'Bofur'
    ];
    return names[Math.floor(Math.random() * names.length)];
  };

  // 1. COMPRAR BAÚ E ENVIAR AO INVENTÁRIO (USDT OU Coins)
  const handleBuyChest = () => {
    if (paymentCurrency === 'usdt' && !walletState.isConnected) {
      if (onOpenWalletModal) onOpenWalletModal();
      return;
    }

    if (!canAffordChest || isProcessing) return;

    setIsProcessing(true);

    if (onBuyAndStoreChest) {
      const result = onBuyAndStoreChest(currentChest, paymentCurrency);
      if (result) {
        setJustPurchasedChest(typeof result === 'object' ? result : {
          ...currentChest,
          currency: paymentCurrency.toUpperCase(),
          cost: chestCost
        });
      }
    }

    setTimeout(() => {
      setIsProcessing(false);
    }, 300);
  };

  // 2. CONTRATAÇÃO DIRETA NO MERCADO (PAGO EM USDT OU Coins)
  const handleDirectHire = (rosterItem) => {
    const cost = rosterItem.directCostBcoin || 20;

    if (paymentCurrency === 'usdt') {
      if (!walletState.isConnected) {
        if (onOpenWalletModal) onOpenWalletModal();
        return;
      }
      if (walletState.usdtBalance < cost) {
        alert(`Saldo insuficiente em USDT. Necessário: $${cost} USDT (atual: $${walletState.usdtBalance.toFixed(2)}).`);
        return;
      }
    } else {
      if (minerBalance < cost) {
        alert(`Saldo insuficiente de Coinss. Necessário: ${cost} Coins (saldo atual: ${minerBalance.toFixed(2)} Coins).`);
        return;
      }
    }

    sfx.playLevelUp();

    confetti({
      particleCount: rosterItem.rarity === 'legendary' ? 140 : 80,
      spread: 75,
      origin: { y: 0.6 },
      colors: [rosterItem.color, '#fbbf24', '#38bdf8']
    });

    const newMiner = {
      id: 'miner-' + Date.now(),
      name: `${randomName()} #${Math.floor(Math.random() * 900 + 100)}`,
      classId: rosterItem.id.replace('class_', ''),
      rarity: rosterItem.rarity || 'common',
      level: 1,
      power: rosterItem.basePower,
      speed: rosterItem.baseSpeed,
      coinsPerHour: rosterItem.coinsPerHour || 0.15,
      maxStamina: rosterItem.baseStamina || 100,
      currentStamina: rosterItem.baseStamina || 100,
      status: 'work',
      x: Math.floor(Math.random() * 3 + 1),
      y: Math.floor(Math.random() * 3 + 1),
      avatar: rosterItem.avatar,
      image: rosterItem.image || `/miners/${rosterItem.id.replace('class_', '')}.png`,
      color: rosterItem.color,
      passiveTrait: rosterItem.passiveTrait
    };

    setRevealedMiner(newMiner);
    if (onRecruitMiner) {
      onRecruitMiner(newMiner, cost, paymentCurrency);
    }
  };

  const handleCloseModal = () => {
    setJustPurchasedChest(null);
    setRevealedMiner(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none font-tech">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] rounded-3xl p-5 sm:p-6 bg-slate-900 border-2 border-slate-700 text-center shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Botão de Fechar */}
        <button
          onClick={handleCloseModal}
          className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition z-10 cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* FEEDBACK PÓS-COMPRA: BAÚ ENVIADO AO INVENTÁRIO */}
        {justPurchasedChest ? (
          <div className="py-6 flex flex-col items-center justify-center text-center animate-scaleUp max-w-lg mx-auto">
            <div className="w-24 h-24 rounded-3xl bg-amber-500/15 border-2 border-amber-400/50 flex items-center justify-center text-5xl mb-4 shadow-xl animate-bounce">
              {justPurchasedChest.icon || '📦'}
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold font-arcade uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-2">
              ✓ COMPRA CONCLUÍDA COM SUCESSO!
            </span>

            <h2 className="font-arcade text-xl text-white mb-1">
              {justPurchasedChest.name}
            </h2>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-arcade font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {justPurchasedChest.heroesCount || 1} {(justPurchasedChest.heroesCount || 1) === 1 ? 'HERÓI' : 'HERÓIS'}
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Pago: {justPurchasedChest.cost} {justPurchasedChest.currency}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-300 text-xs text-left space-y-2 mb-6 w-full">
              <p className="flex items-start gap-2">
                <Package size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <span>
                  O baú foi guardado no seu <b>INVENTÁRIO</b>. Todos os seus baús comprados ficam salvos para serem abertos <b>um por um</b>.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Ao abrir no Inventário, você escolhe para cada baú entre <b>Abertura Normal</b> ou assistir a um anúncio para <b>Abertura com Bônus</b> (chances aumentadas)!
                </span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 w-full">
              <button
                onClick={() => {
                  handleCloseModal();
                  if (onOpenInventory) onOpenInventory();
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-arcade text-xs font-bold transition shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Package size={16} />
                <span>IR PARA O INVENTÁRIO (ABRIR)</span>
              </button>

              <button
                onClick={() => setJustPurchasedChest(null)}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 hover:border-amber-400 font-arcade text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>COMPRAR OUTRO BAÚ</span>
              </button>
            </div>
          </div>
        ) : revealedMiner ? (
          /* CASO: CoinsADOR CONTRATADO NA TAVERNA */
          <div className="py-4 animate-scaleUp max-w-sm mx-auto">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold font-arcade uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-3">
              ✦ NOVO CoinsADOR CONTRATADO! ✦
            </span>

            <div 
              className="w-24 h-24 mx-auto mb-3 rounded-3xl border-3 flex items-center justify-center text-5xl shadow-2xl animate-bounce overflow-hidden relative"
              style={{ 
                borderColor: revealedMiner.color,
                backgroundColor: `${revealedMiner.color}20`
              }}
            >
              <img 
                src={revealedMiner.image || `/miners/${revealedMiner.classId}.png`} 
                alt={revealedMiner.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (e.target.src.endsWith('.png')) {
                    e.target.src = `/miners/${revealedMiner.classId}.jpg`;
                  } else {
                    e.target.style.display = 'none';
                  }
                }}
              />
              <span className="absolute -z-0">{revealedMiner.avatar}</span>
            </div>

            <h2 className="font-arcade text-lg text-white mb-0.5">
              {revealedMiner.name}
            </h2>
            <span 
              className="text-xs font-tech font-bold uppercase tracking-wider block mb-4"
              style={{ color: revealedMiner.color }}
            >
              Classe: {revealedMiner.classId} • {revealedMiner.rarity}
            </span>

            <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto mb-4 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Flame size={12} className="text-rose-400" /> PODER
                </span>
                <span className="font-arcade text-base text-rose-400">{revealedMiner.power}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Zap size={12} className="text-amber-400" /> VELOCIDADE
                </span>
                <span className="font-arcade text-base text-amber-400">{revealedMiner.speed.toFixed(1)}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Battery size={12} className="text-sky-400" /> ESTAMINA
                </span>
                <span className="font-arcade text-base text-sky-400">{revealedMiner.maxStamina}</span>
              </div>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-arcade text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check size={16} />
              <span>ENVIAR PARA A MINA</span>
            </button>
          </div>
        ) : (
          /* TELA PRINCIPAL: ESCOLHA DE BAÚS & MOEDA */
          <div className="flex flex-col h-full overflow-hidden text-left">
            
            {/* CABEÇALHO */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="font-arcade text-base text-amber-400 flex items-center gap-2">
                  <UserPlus size={18} />
                  <span>AQUISIÇÃO DE CoinsADORES</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Compre baús com <b>Coins</b> ou <b>USDT</b> e abra-os um por um no Inventário.
                </p>
              </div>

              {/* Botões Auxiliares (ROI & Inventário) */}
              <div className="flex items-center gap-2">
                {onOpenInventory && (
                  <button
                    onClick={() => {
                      handleCloseModal();
                      onOpenInventory();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-tech text-xs font-bold transition cursor-pointer"
                  >
                    <Package size={13} className="text-amber-400" />
                    <span>Ver Inventário ({purchasedChestsCount})</span>
                  </button>
                )}

                {onOpenRoiSimulator && (
                  <button
                    onClick={onOpenRoiSimulator}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-tech text-xs font-bold transition cursor-pointer"
                  >
                    <Calculator size={13} className="text-amber-400" />
                    <span>Simulador ROI</span>
                  </button>
                )}
              </div>
            </div>

            {/* SELETOR DE MOEDA DE PAGAMENTO (Coins VS USDT) */}
            <div className="bg-slate-950/90 p-3 rounded-2xl border border-slate-800 mb-4 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Coins size={14} className="text-amber-400" />
                  <span>FORMA DE PAGAMENTO:</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  Cotação Oficial: 1 Coins = US$ {rate.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* OPÇÃO 1: Coins (SALDO IN-GAME) */}
                <button
                  onClick={() => setPaymentCurrency('miner')}
                  className={`p-2.5 rounded-xl border-2 transition text-left flex items-center justify-between cursor-pointer ${
                    paymentCurrency === 'miner'
                      ? 'border-amber-400 bg-amber-950/30 shadow-md ring-1 ring-amber-400/40'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🪙</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-tech font-bold text-xs text-white">Coins</span>
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                          IN-GAME
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Saldo: <b className="text-amber-300">{minerBalance.toFixed(2)} Coins</b>
                      </span>
                    </div>
                  </div>
                  {paymentCurrency === 'miner' && (
                    <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                  )}
                </button>

                {/* OPÇÃO 2: USDT (CARTEIRA WEB3) */}
                <button
                  onClick={() => setPaymentCurrency('usdt')}
                  className={`p-2.5 rounded-xl border-2 transition text-left flex items-center justify-between cursor-pointer ${
                    paymentCurrency === 'usdt'
                      ? 'border-emerald-400 bg-emerald-950/30 shadow-md ring-1 ring-emerald-400/40'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💳</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-tech font-bold text-xs text-white">USDT</span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                          WEB3
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {walletState.isConnected 
                          ? <span>Saldo: <b className="text-emerald-300">${walletState.usdtBalance.toFixed(2)} USDT</b></span>
                          : <span className="text-amber-400">Carteira não conectada</span>}
                      </span>
                    </div>
                  </div>
                  {paymentCurrency === 'usdt' && (
                    <div className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* ABA: LOJA DE BAÚS */}
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-3 shrink-0">
              <button
                onClick={() => setActiveTab('mint')}
                className="flex-1 py-1.5 rounded-xl font-tech text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer bg-amber-500 text-slate-950 shadow-md"
              >
                <Package size={14} />
                <span>Loja de Baús (1, 5, 10 ou 15 Heróis)</span>
              </button>
            </div>

            {/* ABA 1: LOJA DE BAÚS */}
            {activeTab === 'mint' && (
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3.5 pr-0.5">
                
                {/* Banner Explicativo da Dinâmica de Inventário */}
                <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-2xl flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-lg shrink-0">
                    📦
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-amber-300 block">
                      Entrega Direta no Inventário
                    </span>
                    <span className="text-[11px] text-slate-300 block">
                      Todos os baús comprados (qualquer categoria) vão para o seu Inventário para serem abertos <b>um a um</b>, com opção de <b>Abertura Normal</b> ou com <b>Bônus de Anúncio</b>.
                    </span>
                  </div>
                </div>

                {/* Grid das 4 Categorias de Baús */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {MINT_CHEST_TYPES.map(chest => {
                    const isSelected = selectedChestType === chest.id;
                    const costUsdt = chest.costUsdt || chest.costBcoin || 10;
                    const costMiner = rate > 0 ? parseFloat((costUsdt / rate).toFixed(2)) : costUsdt;
                    const heroesCount = chest.heroesCount || 1;

                    return (
                      <div
                        key={chest.id}
                        onClick={() => setSelectedChestType(chest.id)}
                        className={`p-3 rounded-2xl border-2 transition cursor-pointer text-left flex flex-col justify-between ${
                          isSelected
                            ? 'border-amber-400 bg-amber-950/20 shadow-lg ring-1 ring-amber-400/50'
                            : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-2xl">{chest.icon}</span>
                            <span className="font-arcade text-xs font-bold px-2 py-0.5 rounded-md border text-emerald-300 bg-emerald-500/20 border-emerald-500/30">
                              {paymentCurrency === 'miner' ? `${costMiner.toLocaleString('pt-BR')} Coins` : `$${costUsdt} USDT`}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mb-1">
                            <h4 className="font-tech font-bold text-xs text-white">
                              {chest.name}
                            </h4>
                            <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">
                              {heroesCount} {heroesCount === 1 ? 'HERÓI' : 'HERÓIS'}
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-400 font-tech mb-2 line-clamp-2">
                            {chest.description}
                          </p>
                        </div>

                        {/* Probabilidades de Raridade */}
                        <div className="space-y-0.5 border-t border-slate-800/80 pt-1 text-[9px] font-mono text-slate-400">
                          {chest.chances.map((c, i) => (
                            <div key={i} className="flex justify-between">
                              <span>{c.rarity}:</span>
                              <span className="text-amber-200 font-bold">{c.pct}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* BOTÃO DE AÇÃO PRINCIPAL DE COMPRA */}
                <div className="pt-1 pb-1">
                  {paymentCurrency === 'usdt' && !walletState.isConnected ? (
                    <button
                      onClick={onOpenWalletModal}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-arcade text-xs font-bold transition shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Wallet size={16} />
                      <span>CONECTAR CARTEIRA WEB3 (METAMASK / TRUST)</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={handleBuyChest}
                        disabled={!canAffordChest || isProcessing}
                        className={`w-full py-3.5 rounded-2xl font-arcade text-xs font-bold transition shadow-xl flex items-center justify-center gap-2 ${
                          canAffordChest && !isProcessing
                            ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 cursor-pointer shadow-amber-950/40 active:scale-98'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        <Package size={16} />
                        <span>
                          {canAffordChest
                            ? `COMPRAR ${currentChest.name.toUpperCase()} (${chestCost} ${paymentCurrency.toUpperCase()}) E ENVIAR AO INVENTÁRIO`
                            : paymentCurrency === 'miner'
                              ? `SALDO INSUFICIENTE: FALTAM ${(chestCost - minerBalance).toFixed(2)} Coins`
                              : `SALDO INSUFICIENTE: FALTAM ${(chestCost - walletState.usdtBalance).toFixed(2)} USDT`}
                        </span>
                      </button>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                        <span>
                          Pagamento via: <b>{paymentCurrency === 'miner' ? 'Coins (Saldo In-Game)' : 'USDT (Carteira Web3)'}</b>
                        </span>
                        <span>
                          Entrega: <b>{currentChest.heroesCount || 1} {(currentChest.heroesCount || 1) === 1 ? 'herói' : 'heróis'} guardados no Inventário</b>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ABA 2: MERCADO DE CONTRATO DIRETO */}
            {activeTab === 'tavern' && (
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-0.5">
                <p className="text-xs text-slate-400">
                  Contrate mineradores específicos pagando em <b>{paymentCurrency.toUpperCase()}</b>:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {MINERS_ROSTER.map(minerClass => {
                    const cost = minerClass.directCostBcoin || 20;
                    const canAfford = paymentCurrency === 'miner'
                      ? minerBalance >= cost
                      : (walletState.isConnected && walletState.usdtBalance >= cost);

                    return (
                      <div 
                        key={minerClass.id}
                        className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-12 h-12 rounded-xl border flex items-center justify-center text-2xl shadow-inner shrink-0 overflow-hidden"
                            style={{ 
                              borderColor: minerClass.color,
                              backgroundColor: `${minerClass.color}15`
                            }}
                          >
                            {minerClass.image ? (
                              <img 
                                src={minerClass.image} 
                                alt={minerClass.name} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              minerClass.avatar
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-tech font-bold text-xs text-white">
                                {minerClass.name}
                              </h4>
                              <span 
                                className="text-[9px] font-bold font-tech px-1.5 py-0.2 rounded"
                                style={{ 
                                  color: minerClass.color,
                                  backgroundColor: `${minerClass.color}20` 
                                }}
                              >
                                {minerClass.badge}
                              </span>
                            </div>

                            <span className="text-[10px] text-slate-400 block font-tech">
                              Arma: {minerClass.equipment}
                            </span>

                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                              <span className="text-rose-400 font-bold">⚔ {minerClass.basePower}</span>
                              <span className="text-amber-400 font-bold">⚡ {minerClass.baseSpeed}</span>
                              <span className="text-sky-400 font-bold">🔋 {minerClass.baseStamina}</span>
                            </div>
                          </div>
                        </div>

                        {/* Botão de Contrato */}
                        <div>
                          {paymentCurrency === 'usdt' && !walletState.isConnected ? (
                            <button
                              onClick={onOpenWalletModal}
                              className="px-3 py-1.5 rounded-xl font-arcade text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition cursor-pointer"
                            >
                              Conectar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDirectHire(minerClass)}
                              disabled={!canAfford}
                              className={`px-3 py-2 rounded-xl font-arcade text-[10px] font-bold transition shadow-md ${
                                canAfford
                                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 cursor-pointer active:scale-95'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                              }`}
                            >
                              {cost} {paymentCurrency.toUpperCase()}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
