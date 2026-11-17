const fs = require('fs');

const path = 'C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/src/components/SummonModal.jsx';
let content = fs.readFileSync(path, 'utf8');

// Normalize line endings to \n for replacement
const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Replace bcoinBalance in header display
const oldHeaderBalance = `<p className="text-xs text-slate-400 font-tech">
                  Seu Saldo: <b className="text-amber-300 font-mono">{bcoinBalance.toFixed(3)} BCOIN</b>
                </p>`;

const newHeaderBalance = `<div className="flex items-center gap-2 text-xs font-tech mt-0.5">
                  <span className="text-slate-400">Pagamento:</span>
                  {walletState.isConnected ? (
                    <button
                      onClick={onOpenWalletModal}
                      className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold hover:bg-emerald-500/20 transition cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{walletState.walletType === 'trustwallet' ? '🛡️ Trust' : '🦊 MetaMask'}:</span>
                      <span className="font-mono">\${walletState.usdtBalance.toFixed(2)} USDT</span>
                    </button>
                  ) : (
                    <button
                      onClick={onOpenWalletModal}
                      className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 font-bold hover:bg-amber-500/20 transition cursor-pointer"
                    >
                      <Wallet size={12} />
                      <span>Conectar Carteira</span>
                    </button>
                  )}
                </div>`;

if (content.includes(oldHeaderBalance)) {
  content = content.replace(oldHeaderBalance, newHeaderBalance);
  console.log('Header balance replaced!');
} else {
  console.log('Header balance not found!');
}

// 2. Replace chest price badge: {chest.costBcoin} BCOIN
const oldChestBadge = `<span className="font-arcade text-xs text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
                              {chest.costBcoin} BCOIN
                            </span>`;

const newChestBadge = `<span className="font-arcade text-xs text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                              \${chest.costUsdt || chest.costBcoin} USDT
                            </span>`;

if (content.includes(oldChestBadge)) {
  content = content.replace(oldChestBadge, newChestBadge);
  console.log('Chest badge replaced!');
} else {
  console.log('Chest badge not found!');
}

// 3. Replace Mint Action button
const oldMintAction = `<div className="pt-1">
                  <button
                    onClick={handleRecruitFromChest}
                    disabled={!canAffordChest || isOpening}
                    className={\`w-full py-3.5 rounded-2xl font-arcade text-xs font-bold transition shadow-xl flex items-center justify-center gap-2 \${
                      canAffordChest && !isOpening
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }\`}
                  >
                    <Sparkles size={16} />
                    <span>
                      {isOpening 
                        ? 'ABRINDO BAÚ...' 
                        : (canAffordChest ? \`MINTAR POR \${currentChest.costBcoin} BCOIN\` : 'SALDO INSUFICIENTE')}
                    </span>
                  </button>
                </div>`;

const newMintAction = `<div className="pt-1">
                  {!walletState.isConnected ? (
                    <button
                      onClick={onOpenWalletModal}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-arcade text-xs font-bold transition shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Wallet size={16} />
                      <span>CONECTAR CARTEIRA (METAMASK / TRUST) PARA RECRUTAR</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleRecruitFromChest}
                      disabled={!canAffordChest || isOpening}
                      className={\`w-full py-3.5 rounded-2xl font-arcade text-xs font-bold transition shadow-xl flex items-center justify-center gap-2 \${
                        canAffordChest && !isOpening
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 cursor-pointer shadow-emerald-950/50'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }\`}
                    >
                      <Sparkles size={16} />
                      <span>
                        {isOpening 
                          ? 'PROCESSANDO TRANSAÇÃO NA BLOCKCHAIN...' 
                          : (canAffordChest 
                              ? \`PAGAR \$\${chestCostUsdt}.00 USDT COM \${walletState.walletType === 'trustwallet' ? 'TRUST WALLET' : 'METAMASK'}\` 
                              : \`SALDO INSUFICIENTE NA CARTEIRA (\$\${walletState.usdtBalance.toFixed(2)} / \$\${chestCostUsdt} USDT)\`)}
                      </span>
                    </button>
                  )}
                </div>`;

if (content.includes(oldMintAction)) {
  content = content.replace(oldMintAction, newMintAction);
  console.log('Mint action replaced!');
} else {
  console.log('Mint action not found!');
}

// 4. Replace Tavern Contract button
const oldTavernButton = `<button
                          onClick={() => handleDirectHire(minerClass)}
                          disabled={!canAfford}
                          className={\`px-3 py-2 rounded-xl font-tech text-xs font-bold transition shrink-0 \${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }\`}
                        >
                          {cost} BCOIN
                        </button>`;

const newTavernButton = `<div>
                          {!walletState.isConnected ? (
                            <button
                              onClick={onOpenWalletModal}
                              className="px-3 py-1.5 rounded-xl font-arcade text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition cursor-pointer"
                            >
                              Conectar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDirectHire(minerClass)}
                              disabled={!walletState.isConnected || walletState.usdtBalance < cost}
                              className={\`px-3 py-2 rounded-xl font-arcade text-[10px] font-bold transition shadow-md \${
                                walletState.isConnected && walletState.usdtBalance >= cost
                                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 cursor-pointer'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                              }\`}
                            >
                              \${cost} USDT
                            </button>
                          )}
                        </div>`;

if (content.includes(oldTavernButton)) {
  content = content.replace(oldTavernButton, newTavernButton);
  console.log('Tavern button replaced!');
} else {
  console.log('Tavern button not found!');
}

// Restore CRLF if needed
if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Finished updating SummonModal.jsx!');
