import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, User, Wallet, ArrowDownToLine, History, CheckCircle2, 
  AlertCircle, Copy, ExternalLink, ShieldCheck, Zap, Sparkles, 
  ArrowRight, Coins, RefreshCw, Edit3, Check, DollarSign,
  TrendingUp, Award, Home, Pickaxe
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sfx } from '../utils/sfx';
import { getCriptoMynersConfig } from '../data/criptoMynersConfig';

// Avatares temáticos disponíveis para o jogador
export const PLAYER_AVATARS = [
  { id: 'bomb_bot', name: 'Bomb-Bot 3000', img: '/miners/bomb_bot.png', emoji: '🤖', title: 'Operador Mecânico' },
  { id: 'viking', name: 'Bárbaro Viking', img: '/miners/viking.png', emoji: '🪓', title: 'Demolidor de Rocha' },
  { id: 'witch', name: 'Bruxa das Trevas', img: '/miners/witch.png', emoji: '🧙‍♀️', title: 'Alquimista do Subsolo' },
  { id: 'mage', name: 'Mago Arcano', img: '/miners/mage.png', emoji: '🔮', title: 'Conjurador de Cristais' },
  { id: 'frog_ninja', name: 'Sapo Shinobi', img: '/miners/frog_ninja.png', emoji: '🐸', title: 'Mestre da Furtividade' },
  { id: 'dragon', name: 'Mecha Dracônico', img: '/miners/legendary.png', emoji: '🐲', title: 'Guardião Lendário' },
  { id: 'engineer', name: 'Engenheira Steampunk', img: '/miners/engineer.png', emoji: '⚙️', title: 'Chefe de Escavação' },
  { id: 'batman', name: 'Cavaleiro das Trevas', img: '/miners/batman.png', emoji: '🦇', title: 'Vigilante das Minas' }
];

export default function UserProfileModal({
  isOpen,
  onClose,
  initialTab = 'profile',
  walletState = {},
  onConnectWallet,
  onDisconnectWallet,
  onAddDemoFunds,
  bcoinBalance = 0,
  onWithdraw,
  totalInvested = 0,
  totalMinedSession = 0,
  currentWithdrawalTax = 10,
  miners = [],
  currentHouse = { name: 'Abrigo Básico', slots: 5 },
  currentMine = { name: 'Mina do Cânion' },
  constructionFragments = 0,
  constructionChests = []
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [copied, setCopied] = useState(false);
  const [connectingType, setConnectingType] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Perfil do Jogador
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('cripto_myners_player_name') || 'Comandante das Minas';
  });
  const [tempPlayerName, setTempPlayerName] = useState(playerName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState(() => {
    return localStorage.getItem('cripto_myners_player_avatar') || 'bomb_bot';
  });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Saque (Claim)
  const [withdrawAmount, setWithdrawAmount] = useState(() => {
    return bcoinBalance >= 5000 ? bcoinBalance.toFixed(2) : '5000';
  });
  const [withdrawSuccessReceipt, setWithdrawSuccessReceipt] = useState(null);
  const [withdrawHistory, setWithdrawHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('cripto_myners_withdraw_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const config = useMemo(() => getCriptoMynersConfig(), []);
  const minerRate = config?.minerCoinUsdtRate || 0.01;

  // Atualiza a aba inicial sempre que o modal abre
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'profile');
      setErrorMsg('');
      setWithdrawSuccessReceipt(null);
      if (bcoinBalance >= minWithdrawMnc) {
        setWithdrawAmount(bcoinBalance.toFixed(2));
      } else {
        setWithdrawAmount(minWithdrawMnc.toString());
      }
    }
  }, [isOpen, initialTab, bcoinBalance]);

  if (!isOpen) return null;

  const currentAvatar = PLAYER_AVATARS.find(a => a.id === selectedAvatarId) || PLAYER_AVATARS[0];
  const { isConnected, address, walletType, usdtBalance = 0, network } = walletState;

  // Salvar Nome do Jogador
  const handleSaveName = () => {
    const trimmed = tempPlayerName.trim();
    if (trimmed) {
      setPlayerName(trimmed);
      localStorage.setItem('cripto_myners_player_name', trimmed);
    }
    setIsEditingName(false);
  };

  // Salvar Avatar do Jogador
  const handleSelectAvatar = (avatarId) => {
    setSelectedAvatarId(avatarId);
    localStorage.setItem('cripto_myners_player_avatar', avatarId);
    setShowAvatarPicker(false);
    sfx.playLevelUp();
  };

  // Copiar Endereço
  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard?.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Conectar Carteira
  const handleSelectWallet = async (type) => {
    setErrorMsg('');
    setConnectingType(type);
    try {
      if (onConnectWallet) {
        await onConnectWallet(type);
      }
      setConnectingType(null);
      sfx.playLevelUp();
    } catch (err) {
      setErrorMsg(err.message || 'Falha ao conectar à carteira.');
      setConnectingType(null);
    }
  };

  const minWithdrawUsd = 50;
  const minWithdrawMnc = Math.ceil(minWithdrawUsd / (minerRate || 0.01));

  // Cálculo de Saque com Base na Cotação da Minercoin
  const parsedWithdrawAmount = parseFloat(withdrawAmount) || 0;
  const withdrawGrossUsdt = parseFloat((parsedWithdrawAmount * minerRate).toFixed(2));
  const isMinMet = withdrawGrossUsdt >= minWithdrawUsd;
  const hasEnoughBalance = bcoinBalance >= parsedWithdrawAmount && parsedWithdrawAmount > 0;
  const withdrawFeeUsdt = parseFloat(((withdrawGrossUsdt * currentWithdrawalTax) / 100).toFixed(2));
  const withdrawNetUsdt = parseFloat((withdrawGrossUsdt - withdrawFeeUsdt).toFixed(2));

  // Executar Saque
  const handleConfirmWithdraw = () => {
    if (!isConnected) {
      setActiveTab('wallet');
      return;
    }
    if (!isMinMet) {
      alert(`O valor mínimo de saque é US$ ${minWithdrawUsd.toFixed(2)} (${minWithdrawMnc.toLocaleString()} MNC).`);
      return;
    }
    if (!hasEnoughBalance) {
      alert('Saldo insuficiente de MINER para realizar este saque.');
      return;
    }

    const txReceipt = {
      id: `TX-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      date: new Date().toLocaleString('pt-BR'),
      grossMiner: parsedWithdrawAmount,
      taxPct: currentWithdrawalTax,
      feeUsdt: withdrawFeeUsdt,
      netUsdt: withdrawNetUsdt,
      walletAddress: address,
      walletType: walletType || 'metamask'
    };

    // Callback para App.jsx deduzir bcoin e creditar usdt na carteira
    if (onWithdraw) {
      onWithdraw(parsedWithdrawAmount, withdrawNetUsdt, currentWithdrawalTax);
    }

    // Salvar no histórico
    const updatedHistory = [txReceipt, ...withdrawHistory];
    setWithdrawHistory(updatedHistory);
    try {
      localStorage.setItem('cripto_myners_withdraw_history', JSON.stringify(updatedHistory));
    } catch (e) {
      console.warn('Erro ao salvar histórico de saques:', e);
    }

    // Efeitos
    sfx.playLevelUp();
    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#38bdf8', '#ffffff']
    });

    setWithdrawSuccessReceipt(txReceipt);
  };

  // Rank baseado no total minerado
  const getPlayerRank = () => {
    if (totalMinedSession >= 500) return { title: 'Magnata do Garimpo', color: 'text-amber-400', badge: 'MESTRE' };
    if (totalMinedSession >= 200) return { title: 'Capataz de Elite', color: 'text-purple-400', badge: 'ELITE' };
    if (totalMinedSession >= 50) return { title: 'Engenheiro das Rochas', color: 'text-sky-400', badge: 'AVANÇADO' };
    return { title: 'Comandante Novato', color: 'text-emerald-400', badge: 'OPERADOR' };
  };

  const rank = getPlayerRank();

  // Heróis
  const activeMinersCount = miners.filter(m => (m.currentStamina ?? 100) > 0).length;
  const restingMinersCount = miners.length - activeMinersCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none font-tech">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border-2 border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white"
        onClick={e => e.stopPropagation()}
      >
        
        {/* HEADER DO MODAL */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={currentAvatar.img} 
                alt={currentAvatar.name}
                className="w-12 h-12 rounded-2xl border-2 border-amber-500/50 bg-slate-950 object-cover shadow-inner"
              />
              <span className="absolute -bottom-1 -right-1 text-sm bg-slate-900 rounded-full px-1 border border-amber-500/40">
                {currentAvatar.emoji}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-arcade text-base text-amber-400">
                  {playerName}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {rank.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>{rank.title}</span>
                <span>•</span>
                <span className="font-mono text-emerald-400">
                  {isConnected ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Carteira Desconectada'}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVEGAÇÃO POR ABAS */}
        <div className="flex items-center px-6 pt-3 bg-slate-950/60 border-b border-slate-800 gap-2 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('profile'); setWithdrawSuccessReceipt(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-tech text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-amber-400 border-amber-400 shadow-sm'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <User size={15} />
            <span>MEU PERFIL</span>
          </button>

          <button
            onClick={() => { setActiveTab('wallet'); setWithdrawSuccessReceipt(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-tech text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'wallet'
                ? 'bg-slate-900 text-amber-400 border-amber-400 shadow-sm'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Wallet size={15} />
            <span>CARTEIRA WEB3</span>
            {isConnected && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('withdraw'); setWithdrawSuccessReceipt(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-tech text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'withdraw'
                ? 'bg-slate-900 text-emerald-400 border-emerald-400 shadow-sm'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <ArrowDownToLine size={15} />
            <span>SAQUES & CLAIM</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              1 MNC = US$ {minerRate.toFixed(2)}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('history'); setWithdrawSuccessReceipt(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-tech text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-slate-900 text-amber-400 border-amber-400 shadow-sm'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <History size={15} />
            <span>HISTÓRICO</span>
            {withdrawHistory.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {withdrawHistory.length}
              </span>
            )}
          </button>
        </div>

        {/* CORPO DO MODAL */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ========================================================= */}
          {/* ABA 1: PERFIL DO USUÁRIO & RESUMO GERAL */}
          {/* ========================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Card de Identidade */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative group cursor-pointer" onClick={() => setShowAvatarPicker(!showAvatarPicker)}>
                      <img 
                        src={currentAvatar.img} 
                        alt={currentAvatar.name}
                        className="w-16 h-16 rounded-2xl border-2 border-amber-500/60 bg-slate-900 object-cover shadow-lg group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-xs font-bold text-amber-300">
                        Trocar
                      </div>
                    </div>

                    <div>
                      {isEditingName ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="text"
                            value={tempPlayerName}
                            onChange={e => setTempPlayerName(e.target.value)}
                            maxLength={24}
                            className="bg-slate-900 border border-amber-500/60 rounded-xl px-3 py-1.5 text-sm text-amber-300 font-tech focus:outline-none"
                            placeholder="Seu nome..."
                            autoFocus
                          />
                          <button 
                            onClick={handleSaveName}
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={() => { setTempPlayerName(playerName); setIsEditingName(false); }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 className="font-arcade text-lg text-amber-300">{playerName}</h3>
                          <button 
                            onClick={() => { setTempPlayerName(playerName); setIsEditingName(true); }}
                            className="text-slate-500 hover:text-amber-400 transition cursor-pointer p-1"
                            title="Editar nome"
                          >
                            <Edit3 size={15} />
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-slate-400 mt-0.5">
                        Avatar Atual: <b className="text-slate-200">{currentAvatar.name}</b> • {currentAvatar.title}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300 cursor-pointer transition self-start"
                  >
                    <Sparkles size={14} className="text-amber-400" />
                    <span>{showAvatarPicker ? 'Fechar Galeria' : 'Trocar Avatar'}</span>
                  </button>
                </div>

                {/* Seletor de Avatar Expandido */}
                {showAvatarPicker && (
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                      Escolha seu Avatar de Perfil:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {PLAYER_AVATARS.map(avatar => {
                        const isSelected = avatar.id === selectedAvatarId;
                        return (
                          <button
                            key={avatar.id}
                            onClick={() => handleSelectAvatar(avatar.id)}
                            className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                                : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            <img 
                              src={avatar.img} 
                              alt={avatar.name}
                              className="w-8 h-8 rounded-lg object-cover bg-slate-950 border border-slate-700" 
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-bold truncate block">{avatar.name}</span>
                              <span className="text-[10px] text-slate-500 block truncate">{avatar.emoji} {avatar.title}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Grid de Resumo Patrimonial */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                
                {/* Saldo MINER */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Saldo MINER</span>
                    <span>⛏️</span>
                  </div>
                  <div className="font-arcade text-lg text-amber-300 font-bold">
                    {bcoinBalance.toFixed(3)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    ≈ ${bcoinBalance.toFixed(2)} USDT
                  </div>
                </div>

                {/* Saldo Carteira USDT */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Carteira Web3 (USDT)</span>
                    <span>₮</span>
                  </div>
                  <div className="font-arcade text-lg text-emerald-400 font-bold">
                    ${usdtBalance.toFixed(2)}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-300/80 truncate">
                    {isConnected ? (walletType === 'trustwallet' ? 'Trust Wallet' : 'MetaMask') : 'Desconectada'}
                  </div>
                </div>

                {/* Heróis */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-blue-500/30 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Equipe de Heróis</span>
                    <span>👥</span>
                  </div>
                  <div className="font-arcade text-lg text-blue-300 font-bold">
                    {miners.length} Heróis
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {activeMinersCount} ativos • {restingMinersCount} repouso
                  </div>
                </div>

                {/* Casa */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Acomodação</span>
                    <span>🏠</span>
                  </div>
                  <div className="font-arcade text-sm text-slate-200 font-bold truncate">
                    {currentHouse.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Capacidade: {currentHouse.slots} heróis
                  </div>
                </div>

                {/* Total Minerado */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Total Minerado</span>
                    <span>💎</span>
                  </div>
                  <div className="font-arcade text-base text-amber-400 font-bold">
                    {totalMinedSession.toFixed(2)} MNC
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    ≈ US$ ${(totalMinedSession * minerRate).toFixed(2)}
                  </div>
                </div>

                {/* Total Investido */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Total Investido</span>
                    <span>💵</span>
                  </div>
                  <div className="font-arcade text-base text-purple-300 font-bold">
                    US$ {totalInvested.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono">
                    1 MNC = US$ {minerRate.toFixed(2)}
                  </div>
                </div>

                {/* Fragmentos de Construção */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-1 col-span-2 sm:col-span-3">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span className="font-bold text-amber-300">🧱 Fragmentos de Construção Acumulados</span>
                    <span className="text-[10px] font-mono text-slate-400">{constructionChests.length} baús no inventário</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="font-arcade text-lg text-amber-400 font-bold">
                        {constructionFragments} Fragmento{constructionFragments === 1 ? '' : 's'}
                      </span>
                      <span className="text-xs text-slate-400">para evolução de casas</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-tech">
                      ✓ Obtidos via mineração ativa
                    </span>
                  </div>
                </div>

              </div>

              {/* Botões de Ação Rápida */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-arcade text-xs font-bold transition shadow-lg shadow-emerald-950/40 cursor-pointer active:scale-95"
                >
                  <ArrowDownToLine size={16} />
                  <span>EFETUAR SAQUE (CLAIM USDT)</span>
                </button>

                <button
                  onClick={() => setActiveTab('wallet')}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-tech text-xs font-bold transition cursor-pointer"
                >
                  <Wallet size={16} />
                  <span>{isConnected ? 'CONFIGURAR CARTEIRA' : 'CONECTAR CARTEIRA WEB3'}</span>
                </button>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* ABA 2: CONEXÃO DE CARTEIRA WEB3 */}
          {/* ========================================================= */}
          {activeTab === 'wallet' && (
            <div className="space-y-4 animate-fadeIn">
              
              {isConnected ? (
                /* CARTEIRA JÁ CONECTADA */
                <div className="space-y-4">
                  <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-5 space-y-4 shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="font-arcade text-sm text-emerald-400 uppercase tracking-wider">
                          {walletType === 'trustwallet' ? '🛡️ Trust Wallet Conectada' : walletType === 'metamask' ? '🦊 MetaMask Conectada' : '🔗 WalletConnect'}
                        </span>
                      </div>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold">
                        {network || 'Solana (USDT SPL)'}
                      </span>
                    </div>

                    {/* Endereço com botão copiar */}
                    <div className="bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Endereço Público da Carteira:</span>
                        <span className="font-mono text-xs text-slate-200">
                          {address || '0x...'}
                        </span>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-amber-400 transition cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 size={14} className="text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Saldo USDT */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Saldo Disponível na Carteira:</span>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
                          ₮
                        </span>
                        <span className="font-mono font-bold text-lg text-emerald-400">
                          ${usdtBalance.toFixed(2)} USDT
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sandbox de Fundos Demo */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 text-xs">
                    <div>
                      <span className="font-bold text-slate-300 block">Ambiente Sandbox de Testes:</span>
                      <span className="text-slate-500 text-[11px]">Adicione USDT demo para testar compras e depósitos livremente.</span>
                    </div>
                    <button
                      onClick={() => {
                        if (onAddDemoFunds) onAddDemoFunds();
                        sfx.playLevelUp();
                      }}
                      className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition cursor-pointer active:scale-95 shrink-0"
                    >
                      <Zap size={14} className="text-amber-400" />
                      <span>+100 USDT Demo</span>
                    </button>
                  </div>

                  {/* Informativo de Cotação */}
                  <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/20 text-xs text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-blue-400">
                      <ShieldCheck size={16} />
                      <span>Cotação Oficial da Minercoin (MNC)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Seus tokens <b>MNC</b> conquistados na mineração possuem cotação oficial de <b>1 MNC = US$ {minerRate.toFixed(2)}</b>. Ao efetuar o saque na aba Saques, o valor líquido correspondente em USDT entra diretamente na sua carteira conectada.
                    </p>
                  </div>

                  {/* Desconectar */}
                  <button
                    onClick={() => {
                      if (onDisconnectWallet) onDisconnectWallet();
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs transition cursor-pointer"
                  >
                    Desconectar Esta Carteira
                  </button>
                </div>
              ) : (
                /* SELECIONAR CARTEIRA PARA CONECTAR */
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Conecte sua carteira Web3 para adquirir baús com <b>USDT</b> e resgatar seus lucros da mineração via <b>Saque (Claim)</b>:
                  </p>

                  <div className="space-y-3">
                    {/* METAMASK */}
                    <button
                      onClick={() => handleSelectWallet('metamask')}
                      disabled={connectingType !== null}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 transition cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#f6851b]/10 border border-[#f6851b]/30 flex items-center justify-center text-2xl group-hover:scale-105 transition">
                          🦊
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition">
                            MetaMask
                          </h3>
                          <p className="text-xs text-slate-400">
                            Extensão para Chrome, Brave, Firefox e App Mobile
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
                    </button>

                    {/* TRUST WALLET */}
                    <button
                      onClick={() => handleSelectWallet('trustwallet')}
                      disabled={connectingType !== null}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 transition cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#0500ff]/10 border border-[#0500ff]/30 flex items-center justify-center text-2xl group-hover:scale-105 transition">
                          🛡️
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition">
                            Trust Wallet
                          </h3>
                          <p className="text-xs text-slate-400">
                            Carteira móvel mais popular para jogos e dApps Web3
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition" />
                    </button>

                    {/* WALLETCONNECT */}
                    <button
                      onClick={() => handleSelectWallet('walletconnect')}
                      disabled={connectingType !== null}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 transition cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#3b99fc]/10 border border-[#3b99fc]/30 flex items-center justify-center text-2xl group-hover:scale-105 transition">
                          🔗
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white group-hover:text-sky-400 transition">
                            WalletConnect
                          </h3>
                          <p className="text-xs text-slate-400">
                            Conecte com mais de 300 carteiras via QR Code
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition" />
                    </button>
                  </div>

                  {errorMsg && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-300">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      <span>Rede Oficial Planejada: Solana (USDT SPL)</span>
                    </div>
                    <p>
                      Saques em <b>USDT SPL</b> na rede Solana. As taxas de rede (SOL) são assumidas pelo jogo como custo operacional. Nenhuma taxa de blockchain é cobrada do jogador.
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* ABA 3: SAQUES (CLAIM) MINER ➔ USDT */}
          {/* ========================================================= */}
          {activeTab === 'withdraw' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Recibo de Sucesso Recente */}
              {withdrawSuccessReceipt ? (
                <div className="bg-emerald-950/40 border-2 border-emerald-500/60 rounded-2xl p-5 space-y-4 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl border border-emerald-500/40">
                    🎉
                  </div>
                  <div>
                    <h3 className="font-arcade text-base text-emerald-300">
                      SAQUE REALIZADO COM SUCESSO!
                    </h3>
                    <p className="text-xs text-slate-300 font-tech mt-1">
                      <b>${withdrawSuccessReceipt.netUsdt.toFixed(2)} USDT</b> foram creditados na sua carteira conectada.
                    </p>
                  </div>

                  <div className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800 text-left text-xs font-mono space-y-1.5">
                    <div className="flex justify-between text-slate-400">
                      <span>ID da Transação:</span>
                      <span className="text-slate-200">{withdrawSuccessReceipt.id}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Valor Bruto (MINER):</span>
                      <span className="text-amber-400 font-bold">{withdrawSuccessReceipt.grossMiner.toFixed(2)} MINER</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Taxa de Saque ({withdrawSuccessReceipt.taxPct}%):</span>
                      <span className="text-rose-400">-${withdrawSuccessReceipt.feeUsdt.toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-1.5">
                      <span>Crédito Líquido na Carteira:</span>
                      <span>+${withdrawSuccessReceipt.netUsdt.toFixed(2)} USDT</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setWithdrawSuccessReceipt(null)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer transition"
                    >
                      Novo Saque
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-arcade text-xs font-bold cursor-pointer transition"
                    >
                      Ver Histórico
                    </button>
                  </div>
                </div>
              ) : (
                /* FORMULÁRIO DE SAQUE */
                <div className="space-y-4">
                  
                  {/* Banner de Regras */}
                  <div className="bg-gradient-to-r from-amber-500/10 via-slate-950 to-emerald-500/10 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Coins size={16} className="text-amber-400" />
                        <span className="font-bold text-slate-200">Cotação Oficial da Minercoin</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
                          1 MNC = US$ {minerRate.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Saque mínimo de <b>US$ {minWithdrawUsd.toFixed(2)} ({minWithdrawMnc.toLocaleString()} MNC)</b>. A taxa dinâmica protege o pool de liquidez do jogo.
                      </p>
                    </div>

                    <div className="bg-slate-900/90 px-3.5 py-2 rounded-xl border border-amber-500/30 text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block">Taxa de Saque Atual:</span>
                      <span className="font-arcade text-sm text-amber-300 font-bold">
                        {currentWithdrawalTax}% TAXA
                      </span>
                    </div>
                  </div>

                  {/* Quadro de Saldos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Saldo In-Game Disponível</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <b className="font-arcade text-xl text-amber-300">{bcoinBalance.toFixed(2)}</b>
                        <span className="text-xs text-amber-400 font-arcade">MNC</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ≈ US$ ${(bcoinBalance * minerRate).toFixed(2)}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Carteira de Destino</span>
                      {isConnected ? (
                        <div className="mt-1">
                          <span className="font-mono text-xs text-emerald-400 font-bold block truncate">
                            {address}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {walletType === 'trustwallet' ? '🛡️ Trust Wallet' : '🦊 MetaMask'} • Saldo: ${usdtBalance.toFixed(2)} USDT
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs text-rose-400 font-bold">Nenhuma carteira</span>
                          <button
                            onClick={() => setActiveTab('wallet')}
                            className="text-[11px] text-amber-300 underline cursor-pointer"
                          >
                            Conectar agora
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Campo de Entrada de Valor para Saque */}
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-300">Quanto deseja sacar (MNC)?</label>
                      <span className="text-[11px] text-amber-300 font-mono font-bold">Mínimo: US$ 50 ({minWithdrawMnc.toLocaleString()} MNC)</span>
                    </div>

                    <div className="relative">
                      <input 
                        type="number"
                        min={minWithdrawMnc}
                        step="1"
                        max={bcoinBalance}
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        placeholder={`Ex: ${minWithdrawMnc}`}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-base text-amber-300 font-arcade focus:outline-none focus:border-amber-500/60"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-arcade text-slate-400">
                        MNC
                      </span>
                    </div>

                    {/* Botões de Atalho */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(minWithdrawMnc.toString())}
                        className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                      >
                        US$ 50 (Mínimo)
                      </button>

                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(Math.max(minWithdrawMnc, parseFloat((bcoinBalance * 0.5).toFixed(0))).toString())}
                        className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                      >
                        50%
                      </button>

                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(bcoinBalance.toFixed(2))}
                        className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-bold transition cursor-pointer"
                      >
                        100% (Tudo)
                      </button>
                    </div>
                  </div>

                  {/* Resumo do Cálculo do Saque */}
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Valor Solicitado:</span>
                      <span className="font-mono text-amber-300 font-bold">
                        {parsedWithdrawAmount.toFixed(2)} MNC (≈ US$ {withdrawGrossUsdt.toFixed(2)})
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>Taxa de Saque Retida ({currentWithdrawalTax}%):</span>
                      <span className="font-mono text-rose-400 font-bold">
                        -US$ {withdrawFeeUsdt.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between border-t border-slate-800/80 pt-2 text-emerald-400 font-bold">
                      <span className="text-sm">Valor Líquido a Receber na Carteira:</span>
                      <span className="font-arcade text-base">US$ {withdrawNetUsdt.toFixed(2)} USDT</span>
                    </div>
                  </div>

                  {/* Botão de Confirmação ou Avisos */}
                  {!isConnected ? (
                    <button
                      onClick={() => setActiveTab('wallet')}
                      className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade text-xs font-bold transition shadow-lg cursor-pointer"
                    >
                      CONECTAR CARTEIRA PARA PODER SACAR
                    </button>
                  ) : !isMinMet ? (
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                      ⚠️ O valor mínimo para realizar o saque é de <b>US$ 50 ({minWithdrawMnc.toLocaleString()} MNC)</b>.
                    </div>
                  ) : !hasEnoughBalance ? (
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center text-xs text-rose-400">
                      ⚠️ Saldo insuficiente de MINER. Você possui <b>{bcoinBalance.toFixed(2)} MINER</b>.
                    </div>
                  ) : (
                    <button
                      onClick={handleConfirmWithdraw}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-arcade text-xs font-bold transition shadow-lg shadow-emerald-950/40 cursor-pointer active:scale-95"
                    >
                      CONFIRMAR SAQUE DE ${withdrawNetUsdt.toFixed(2)} USDT (-{currentWithdrawalTax}% TAXA)
                    </button>
                  )}

                  {/* Explicação da Taxa Dinâmica */}
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-400">
                      <ShieldCheck size={14} className="text-amber-400" />
                      <span>Como funciona a taxa de saque?</span>
                    </div>
                    <p>
                      Inspirada no modelo econômico do CryptoZombies: jogadores com ROI inicial pagam taxa reduzida (10%); conforme o lucro acumulado ultrapassa 100%, 200% ou 300% do investimento inicial, a taxa escala progressivamente até 30%, alimentando o tesouro da mina e garantindo longevidade ao jogo.
                    </p>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* ABA 4: HISTÓRICO DE SAQUES */}
          {/* ========================================================= */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-arcade text-sm text-slate-200">HISTÓRICO DE SAQUES E CLAIMS</h3>
                  <p className="text-xs text-slate-400">Registro completo de todos os resgates convertidos em USDT</p>
                </div>
                {withdrawHistory.length > 0 && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {withdrawHistory.length} transação(ões)
                  </span>
                )}
              </div>

              {withdrawHistory.length === 0 ? (
                <div className="py-12 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 text-slate-500 flex items-center justify-center text-2xl">
                    📜
                  </div>
                  <div>
                    <h4 className="font-tech font-bold text-sm text-slate-300">Nenhum saque realizado ainda</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Quando você atingir o mínimo de US$ {minWithdrawUsd.toFixed(2)} e efetuar seu primeiro saque na aba Saques, ele aparecerá aqui com todos os detalhes e comprovante.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('withdraw')}
                    className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition cursor-pointer"
                  >
                    Ir para Aba de Saques
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {withdrawHistory.map((item, idx) => (
                    <div 
                      key={item.id || idx}
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span className="font-mono text-xs font-bold text-slate-200">{item.id}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/30">
                            CONCLUÍDO
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">{item.date}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Bruto (MINER):</span>
                          <span className="font-mono text-amber-300 font-bold">{item.grossMiner?.toFixed(2)} MINER</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Taxa Retida:</span>
                          <span className="font-mono text-rose-400">-${item.feeUsdt?.toFixed(2)} ({item.taxPct}%)</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Líquido Creditado:</span>
                          <span className="font-mono text-emerald-400 font-bold">+${item.netUsdt?.toFixed(2)} USDT</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Carteira:</span>
                          <span className="font-mono text-slate-400 text-[11px] truncate block">
                            {item.walletAddress ? `${item.walletAddress.slice(0, 6)}...${item.walletAddress.slice(-4)}` : 'MetaMask'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
