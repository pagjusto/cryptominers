const fs = require('fs');

const path = 'C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Add imports for WalletModal and web3Wallet
const oldImport = `import SummonModal from './components/SummonModal';`;
const newImport = `import SummonModal from './components/SummonModal';
import WalletModal from './components/WalletModal';
import { getSavedWalletState, saveWalletState, requestWalletConnection, disconnectWalletFromStorage } from './utils/web3Wallet';`;

if (content.includes(oldImport)) {
  content = content.replace(oldImport, newImport);
  console.log('WalletModal imports added!');
} else {
  console.log('oldImport not found!');
}

// 2. Add wallet state in App component
const oldStateAnchor = `const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);`;
const newStateAnchor = `const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletState, setWalletState] = useState(() => getSavedWalletState());

  const handleConnectWallet = async (type) => {
    const newState = await requestWalletConnection(type);
    setWalletState(newState);
  };

  const handleDisconnectWallet = () => {
    const newState = disconnectWalletFromStorage();
    setWalletState(newState);
  };

  const handleAddDemoFunds = () => {
    setWalletState(prev => {
      const nextBalance = parseFloat((prev.usdtBalance + 100).toFixed(2));
      const nextState = { ...prev, usdtBalance: nextBalance };
      saveWalletState(nextState);
      return nextState;
    });
  };`;

if (content.includes(oldStateAnchor)) {
  content = content.replace(oldStateAnchor, newStateAnchor);
  console.log('Wallet state added!');
} else {
  console.log('oldStateAnchor not found!');
}

// 3. Update handleRecruitMiner to deduct USDT from wallet
const oldRecruitMiner = `  const handleRecruitMiner = (newMiner, cost = 10) => {
    setBcoin(prev => parseFloat((prev - cost).toFixed(3)));
    setTotalInvested(prev => parseFloat((prev + cost).toFixed(3)));
    setMiners(prev => [...prev, { ...newMiner, durability: 100 }]);
  };`;

const newRecruitMiner = `  const handleRecruitMiner = (newMiner, costUsdt = 10) => {
    // Deduz USDT da Carteira Web3 Conectada (MetaMask / Trust Wallet)
    setWalletState(prev => {
      const nextBalance = Math.max(0, parseFloat((prev.usdtBalance - costUsdt).toFixed(2)));
      const nextState = { ...prev, usdtBalance: nextBalance };
      saveWalletState(nextState);
      return nextState;
    });
    // Registra investimento (paridade 1:1)
    setTotalInvested(prev => parseFloat((prev + costUsdt).toFixed(3)));
    setMiners(prev => [...prev, { ...newMiner, durability: 100 }]);
  };`;

if (content.includes(oldRecruitMiner)) {
  content = content.replace(oldRecruitMiner, newRecruitMiner);
  console.log('handleRecruitMiner updated!');
} else {
  console.log('oldRecruitMiner not found!');
}

// 4. Update Header: Saldo MINER + Wallet Connect Badge
const oldHeaderBcoin = `{/* Saldo Oficial de BCOIN */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-4 py-1.5 rounded-2xl border border-amber-500/40 shadow-inner">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-bold font-arcade text-xs">
              B
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] uppercase text-slate-400 font-bold">Saldo BCOIN</span>
              <span className="font-arcade text-base text-amber-300 font-bold tracking-wider">
                {bcoin.toFixed(3)}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsClaimModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <ArrowDownToLine size={14} />
            <span>CLAIM ({currentWithdrawalTax}% ROI)</span>
          </button>
        </div>`;

const newHeaderBcoin = `{/* Saldo In-Game MINER e Carteira Web3 (USDT) */}
        <div className="flex items-center gap-3">
          {/* Saldo de Mineração MINER (Paridade 1:1) */}
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-2xl border border-amber-500/40 shadow-inner">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-bold font-arcade text-xs">
              ⛏️
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] uppercase text-slate-400 font-bold">Saldo MINER</span>
              <span className="font-arcade text-base text-amber-300 font-bold tracking-wider">
                {bcoin.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Botão de Conectar Carteira / Badge de Saldo USDT */}
          {!walletState.isConnected ? (
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/30 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/50 font-tech text-xs font-bold transition shadow-md active:scale-95 cursor-pointer"
            >
              <Wallet size={15} className="text-amber-400 animate-pulse" />
              <span>CONECTAR CARTEIRA</span>
            </button>
          ) : (
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-slate-950 border border-emerald-500/40 hover:border-emerald-400 text-xs font-tech transition shadow-inner cursor-pointer"
            >
              <span className="text-base">{walletState.walletType === 'trustwallet' ? '🛡️' : walletState.walletType === 'metamask' ? '🦊' : '🔗'}</span>
              <div className="flex flex-col text-left leading-none">
                <span className="font-mono text-[10px] text-slate-400">{walletState.address.slice(0, 6)}...{walletState.address.slice(-4)}</span>
                <span className="font-mono text-xs font-bold text-emerald-400">\${walletState.usdtBalance.toFixed(2)} USDT</span>
              </div>
            </button>
          )}

          <button
            onClick={() => setIsClaimModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition cursor-pointer"
          >
            <ArrowDownToLine size={14} className="text-emerald-400" />
            <span>SAQUE USDT ({currentWithdrawalTax}% TAXA)</span>
          </button>
        </div>`;

if (content.includes(oldHeaderBcoin)) {
  content = content.replace(oldHeaderBcoin, newHeaderBcoin);
  console.log('Header Bcoin/Miner/Wallet updated!');
} else {
  console.log('oldHeaderBcoin not found!');
}

// 5. Update SummonModal props in App.jsx
const oldSummonModalProps = `<SummonModal
        isOpen={isSummonOpen}
        onClose={() => setIsSummonOpen(false)}
        onRecruitMiner={handleRecruitMiner}
        bcoinBalance={bcoin}
        onOpenLuckBoostAd={handleOpenLuckBoostAd}
      />`;

const newSummonModalProps = `<SummonModal
        isOpen={isSummonOpen}
        onClose={() => setIsSummonOpen(false)}
        onRecruitMiner={handleRecruitMiner}
        minerBalance={bcoin}
        walletState={walletState}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        onOpenLuckBoostAd={handleOpenLuckBoostAd}
      />

      {/* MODAL DE CARTEIRAS WEB3 (METAMASK / TRUST WALLET / WALLETCONNECT) */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        walletState={walletState}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
        onAddDemoFunds={handleAddDemoFunds}
      />`;

if (content.includes(oldSummonModalProps)) {
  content = content.replace(oldSummonModalProps, newSummonModalProps);
  console.log('SummonModal and WalletModal integration updated in App.jsx!');
} else {
  console.log('oldSummonModalProps not found!');
}

// 6. Update Claim Modal text & logic: 1 MINER = 1.00 USDT converted directly to wallet
const oldClaimBody = `<h3 className="font-arcade text-base text-amber-400 mb-1">
              SAQUE DE BCOIN (CLAIM)
            </h3>
            <p className="text-xs text-slate-400 font-tech mb-4">
              Regra oficial do Bomb Crypto: Saque mínimo de <b>40 BCOIN</b>.
            </p>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 mb-4 text-xs font-tech space-y-2 text-left">
              <div className="flex justify-between text-slate-400">
                <span>Saldo em Carteira:</span>
                <span className="text-amber-300 font-bold font-mono">{bcoin.toFixed(3)} BCOIN</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Investido:</span>
                <span className="text-rose-400 font-bold font-mono">{totalInvested.toFixed(3)} BCOIN</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Retorno (ROI Atual):</span>
                <span className="text-sky-400 font-bold font-mono">{roiPct}% {roiPct >= 100 ? '🚀' : ''}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800/80 pt-1.5">
                <span className="text-slate-300 font-bold">Taxa de Saque (ROI Fee):</span>
                <span className="text-amber-400 font-bold font-arcade">{currentWithdrawalTax}%</span>
              </div>
              {bcoin >= 40 && (
                <div className="flex justify-between border-t border-slate-800/80 pt-1.5 text-emerald-400 font-bold">
                  <span>Recebimento Líquido:</span>
                  <span className="font-mono">{(bcoin * (1 - currentWithdrawalTax / 100)).toFixed(3)} BCOIN</span>
                </div>
              )}
            </div>

            {bcoin >= 40 ? (
              <button
                onClick={() => {
                  const fee = (bcoin * currentWithdrawalTax) / 100;
                  const net = bcoin - fee;
                  setBcoin(0);
                  sfx.playLevelUp();
                  confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#f59e0b', '#10b981', '#ffffff']
                  });
                  alert(\`Saque de \${net.toFixed(3)} BCOIN realizado com sucesso para sua carteira!\\nTaxa retida de \${fee.toFixed(3)} BCOIN (\${currentWithdrawalTax}%) devolvida ao Pool de Recompensas.\`);
                  setIsClaimModalOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-arcade text-xs font-bold transition shadow-lg cursor-pointer"
              >
                SACAR {(bcoin * (1 - currentWithdrawalTax / 100)).toFixed(2)} BCOIN (-{currentWithdrawalTax}%)
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-slate-800 text-slate-500 font-arcade text-[10px] font-bold cursor-not-allowed border border-slate-700/50"
                >
                  FALTAM {(40 - bcoin).toFixed(2)} BCOIN PARA O SAQUE (MÍN. 40)
                </button>
                <button
                  onClick={() => setIsClaimModalOpen(false)}
                  className="w-full py-2 text-xs font-tech text-slate-400 hover:text-white transition"
                >
                  Voltar ao Jogo
                </button>
              </div>
            )}`;

const newClaimBody = `<h3 className="font-arcade text-base text-emerald-400 mb-1">
              SAQUE & CONVERSÃO PARA USDT (CLAIM)
            </h3>
            <p className="text-xs text-slate-400 font-tech mb-4">
              Paridade <b>1 MINER = 1.00 USDT</b> • Saque mínimo de <b>40 MINER</b>.
            </p>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 mb-4 text-xs font-tech space-y-2 text-left">
              <div className="flex justify-between text-slate-400">
                <span>Saldo In-Game (MINER):</span>
                <span className="text-amber-300 font-bold font-mono">{bcoin.toFixed(3)} MINER</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Conversão para USDT (1:1):</span>
                <span className="text-emerald-400 font-bold font-mono">\${bcoin.toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Carteira de Destino:</span>
                <span className="text-slate-300 font-mono text-[11px]">
                  {walletState.isConnected 
                    ? \`\${walletState.address.slice(0, 8)}... (\${walletState.walletType === 'trustwallet' ? 'Trust' : 'MetaMask'})\`
                    : 'Nenhuma carteira conectada'}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-800/80 pt-1.5">
                <span className="text-slate-300 font-bold">Taxa de Saque do Jogo:</span>
                <span className="text-amber-400 font-bold font-arcade">{currentWithdrawalTax}%</span>
              </div>
              {bcoin >= 40 && (
                <div className="flex justify-between border-t border-slate-800/80 pt-1.5 text-emerald-400 font-bold">
                  <span>Recebimento Líquido na Carteira:</span>
                  <span className="font-mono font-bold text-sm">\${(bcoin * (1 - currentWithdrawalTax / 100)).toFixed(2)} USDT</span>
                </div>
              )}
            </div>

            {bcoin >= 40 ? (
              <button
                onClick={() => {
                  if (!walletState.isConnected) {
                    setIsWalletModalOpen(true);
                    return;
                  }
                  const fee = (bcoin * currentWithdrawalTax) / 100;
                  const net = bcoin - fee;
                  setBcoin(0);
                  // Credita o valor líquido de USDT na carteira conectada do jogador
                  setWalletState(prev => {
                    const nextBalance = parseFloat((prev.usdtBalance + net).toFixed(2));
                    const nextState = { ...prev, usdtBalance: nextBalance };
                    saveWalletState(nextState);
                    return nextState;
                  });
                  sfx.playLevelUp();
                  confetti({
                    particleCount: 130,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#10b981', '#f59e0b', '#ffffff']
                  });
                  alert(\`🎉 Saque realizado com sucesso!\\n\\n\${net.toFixed(2)} USDT foram creditados diretamente na sua carteira (\${walletState.walletType === 'trustwallet' ? 'Trust Wallet' : 'MetaMask'})!\\nTaxa retida: \${fee.toFixed(2)} USDT (\${currentWithdrawalTax}%).\`);
                  setIsClaimModalOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-arcade text-xs font-bold transition shadow-lg cursor-pointer"
              >
                SACAR \${(bcoin * (1 - currentWithdrawalTax / 100)).toFixed(2)} USDT PARA CARTEIRA (-{currentWithdrawalTax}%)
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-slate-800 text-slate-500 font-arcade text-[10px] font-bold cursor-not-allowed border border-slate-700/50"
                >
                  FALTAM {(40 - bcoin).toFixed(2)} MINER PARA O SAQUE (MÍN. 40)
                </button>
                <button
                  onClick={() => setIsClaimModalOpen(false)}
                  className="w-full py-2 text-xs font-tech text-slate-400 hover:text-white transition"
                >
                  Voltar ao Jogo
                </button>
              </div>
            )}`;

if (content.includes(oldClaimBody)) {
  content = content.replace(oldClaimBody, newClaimBody);
  console.log('Claim modal body updated!');
} else {
  console.log('oldClaimBody not found!');
}

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Finished updating App.jsx!');
