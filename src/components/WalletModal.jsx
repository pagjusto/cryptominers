import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Copy, ExternalLink, Wallet, ShieldCheck, ArrowRight, RefreshCw, Zap } from 'lucide-react';
import { getCriptoMynersConfig } from '../data/criptoMynersConfig';

export default function WalletModal({
  isOpen,
  onClose,
  walletState,
  onConnect,
  onDisconnect,
  onAddDemoFunds
}) {
  const [copied, setCopied] = useState(false);
  const [connectingType, setConnectingType] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const { isConnected, address, walletType, usdtBalance, network } = walletState;

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard?.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectWallet = async (type) => {
    setErrorMsg('');
    setConnectingType(type);

    try {
      await onConnect(type);
      setConnectingType(null);
    } catch (err) {
      setErrorMsg(err.message || 'Falha ao conectar à carteira.');
      setConnectingType(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden font-tech text-white">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wallet size={20} />
            </div>
            <div>
              <h2 className="font-arcade text-base text-amber-400">
                {isConnected ? 'CARTEIRA CONECTADA' : 'CONECTAR CARTEIRA'}
              </h2>
              <p className="text-xs text-slate-400">
                {isConnected ? 'Gerencie seus fundos e rede Web3' : 'Selecione sua carteira Web3 para jogar'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* CORPO DO MODAL */}
        <div className="p-6 space-y-4">

          {/* ESTADO 1: JÁ CONECTADO */}
          {isConnected ? (
            <div className="space-y-4">
              
              {/* Card de Informações da Carteira Conectada */}
              <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      {walletType === 'trustwallet' ? '🛡️ Trust Wallet' : walletType === 'metamask' ? '🦊 MetaMask' : '🔗 WalletConnect'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold">
                    {network || 'Solana (USDT SPL)'}
                  </span>
                </div>

                {/* Endereço com botão de copiar */}
                <div className="flex items-center justify-between bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
                  <span className="font-mono text-xs text-slate-300">
                    {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : '0x...'}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-300 transition cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span className="text-emerald-400 text-[11px]">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span className="text-[11px]">Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Saldo em USDT */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Saldo da Carteira (USDT):</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-[10px] text-white">
                      ₮
                    </span>
                    <span className="font-mono font-bold text-base text-emerald-400">
                      ${usdtBalance.toFixed(2)} USDT
                    </span>
                  </div>
                </div>
              </div>

              {/* Botão de Adicionar Saldo Demo para Testes */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-800 text-xs">
                <span className="text-slate-400">Ambiente de Testes / Sandbox:</span>
                <button
                  onClick={onAddDemoFunds}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
                >
                  <Zap size={14} />
                  <span>+100 USDT (Teste)</span>
                </button>
              </div>

              {/* Explicação da Cotação */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/20 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-400">
                  <ShieldCheck size={16} />
                  <span>Cotação Oficial da Minercoin (1 MNC = US$ {(getCriptoMynersConfig()?.minerCoinUsdtRate || 0.01).toFixed(2)})</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Novos heróis são adquiridos diretamente com <b>USDT</b> da sua carteira ou com <b>MNC</b>. Os lucros minerados no jogo são acumulados em <b>MNC</b> e convertidos para USDT com base na cotação oficial configurada (1 MNC = US$ 0,01) no Saque (Claim).
                </p>
              </div>

              {/* Botão Desconectar */}
              <button
                onClick={() => {
                  onDisconnect();
                  onClose();
                }}
                className="w-full py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs transition cursor-pointer"
              >
                Desconectar Carteira
              </button>

            </div>
          ) : (
            /* ESTADO 2: SELECIONAR CARTEIRA PARA CONECTAR */
            <div className="space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                Conecte sua carteira para adquirir novos mineradores em <b>USDT</b> e realizar o saque seguro dos seus rendimentos:
              </p>

              {/* OPÇÃO 1: METAMASK */}
              <button
                onClick={() => handleSelectWallet('metamask')}
                disabled={connectingType !== null}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 transition cursor-pointer group text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#f6851b]/10 border border-[#f6851b]/30 flex items-center justify-center text-2xl group-hover:scale-105 transition">
                    🦊
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition">
                      MetaMask
                    </h3>
                    <p className="text-xs text-slate-400">
                      Extensão para Chrome, Brave e App Mobile
                    </p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
              </button>

              {/* OPÇÃO 2: TRUST WALLET */}
              <button
                onClick={() => handleSelectWallet('trustwallet')}
                disabled={connectingType !== null}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 transition cursor-pointer group text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#0500ff]/10 border border-[#0500ff]/30 flex items-center justify-center text-2xl group-hover:scale-105 transition">
                    🛡️
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition">
                      Trust Wallet
                    </h3>
                    <p className="text-xs text-slate-400">
                      Popular em Celulares e dApp Browser
                    </p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition" />
              </button>

              {/* OPÇÃO 3: WALLETCONNECT */}
              <button
                onClick={() => handleSelectWallet('walletconnect')}
                disabled={connectingType !== null}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 transition cursor-pointer group text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#3b99fc]/10 border border-[#3b99fc]/30 flex items-center justify-center text-2xl group-hover:scale-105 transition">
                    🔗
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-sky-400 transition">
                      WalletConnect
                    </h3>
                    <p className="text-xs text-slate-400">
                      Conecte via QR Code com qualquer carteira
                    </p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition" />
              </button>

              {/* Feedback de Erro se houver */}
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Nota de Segurança e Rede Oficial */}
              <div className="mt-3 p-3 rounded-2xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-300">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Rede Oficial Planejada: Solana (USDT SPL)</span>
                </div>
                <p>
                  Pagamentos em <b>USDT SPL</b>. As taxas de rede são pagas em SOL e assumidas integralmente pelo jogo como custo operacional. Nenhuma taxa de rede adicional é cobrada do jogador.
                </p>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
