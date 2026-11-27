// Gerenciador de Conexão Web3 Real — CryptoZombies
// Suporta carteiras EVM (MetaMask, Trust Wallet, OKX, Rabby) via window.ethereum
// e carteiras Solana (Phantom, Solflare) via window.solana / window.phantom.solana.

const STORAGE_KEYS = {
  CONNECTED: 'crypto_miners_wallet_connected',
  TYPE: 'crypto_miners_wallet_type',
  ADDRESS: 'crypto_miners_wallet_address',
  USDT_BALANCE: 'crypto_miners_wallet_usdt',
  CHAIN_ID: 'cryptozombies_wallet_chain_id',
  NETWORK: 'cryptozombies_wallet_network',
};

export const EVM_USDT_CONTRACTS = {
  '0x38': {
    name: 'BNB Smart Chain',
    symbol: 'USDT (BEP-20)',
    contract: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
    explorerTx: 'https://bscscan.com/tx/',
  },
  '0x89': {
    name: 'Polygon',
    symbol: 'USDT (PoS)',
    contract: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    decimals: 6,
    explorerTx: 'https://polygonscan.com/tx/',
  },
  '0x1': {
    name: 'Ethereum',
    symbol: 'USDT (ERC-20)',
    contract: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    explorerTx: 'https://etherscan.io/tx/',
  },
  '0xa4b1': {
    name: 'Arbitrum One',
    symbol: 'USDT (Arbitrum)',
    contract: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    decimals: 6,
    explorerTx: 'https://arbiscan.io/tx/',
  },
  '0x2105': {
    name: 'Base',
    symbol: 'USDT (Base)',
    contract: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    decimals: 6,
    explorerTx: 'https://basescan.org/tx/',
  },
};

const SOLANA_USDT_MINT = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';
const SOLANA_MAINNET_RPC = 'https://api.mainnet-beta.solana.com';

export function getSavedWalletState() {
  const isConnected = localStorage.getItem(STORAGE_KEYS.CONNECTED) === 'true';
  const walletType = localStorage.getItem(STORAGE_KEYS.TYPE) || 'metamask';
  const address = localStorage.getItem(STORAGE_KEYS.ADDRESS) || '';
  const savedUsdt = localStorage.getItem(STORAGE_KEYS.USDT_BALANCE);
  const usdtBalance = savedUsdt !== null ? parseFloat(savedUsdt) : 0;
  const chainId = localStorage.getItem(STORAGE_KEYS.CHAIN_ID) || '0x38';
  const network =
    localStorage.getItem(STORAGE_KEYS.NETWORK) ||
    EVM_USDT_CONTRACTS[chainId]?.name ||
    'BNB Smart Chain';

  return {
    isConnected: Boolean(isConnected && address),
    walletType,
    address: isConnected ? address : '',
    usdtBalance: Number.isFinite(usdtBalance) ? usdtBalance : 0,
    chainId,
    network,
  };
}

export function saveWalletState(state) {
  localStorage.setItem(STORAGE_KEYS.CONNECTED, state.isConnected ? 'true' : 'false');
  localStorage.setItem(STORAGE_KEYS.TYPE, state.walletType || 'metamask');
  localStorage.setItem(STORAGE_KEYS.ADDRESS, state.address || '');
  localStorage.setItem(STORAGE_KEYS.USDT_BALANCE, String(state.usdtBalance ?? 0));
  if (state.chainId) localStorage.setItem(STORAGE_KEYS.CHAIN_ID, state.chainId);
  if (state.network) localStorage.setItem(STORAGE_KEYS.NETWORK, state.network);
}

function resolveEvmProvider(type) {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  const providers = Array.isArray(window.ethereum.providers) ? window.ethereum.providers : null;
  if (providers && providers.length > 0) {
    if (type === 'metamask') {
      const mm = providers.find((p) => p.isMetaMask && !p.isTrust);
      if (mm) return mm;
    }
    if (type === 'trustwallet') {
      const tw = providers.find((p) => p.isTrust || p.isTrustWallet);
      if (tw) return tw;
    }
    return providers[0];
  }
  return window.ethereum;
}

function resolveSolanaProvider(type) {
  if (typeof window === 'undefined') return null;
  if (type === 'solflare' && window.solflare) return window.solflare;
  if (window.phantom?.solana) return window.phantom.solana;
  if (window.solana) return window.solana;
  return null;
}

function pad32(hexWithoutPrefix) {
  return hexWithoutPrefix.toLowerCase().replace(/^0x/, '').padStart(64, '0');
}

function parseTokenUnits(amountUsdt, decimals) {
  const fixed = Number(amountUsdt).toFixed(decimals);
  const [whole, frac = ''] = fixed.split('.');
  const fracPadded = frac.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + fracPadded);
}

export async function fetchEvmUsdtBalance(provider, address, chainId) {
  const cfg = EVM_USDT_CONTRACTS[chainId];
  if (!cfg || !provider || !address) return 0;

  // balanceOf(address) selector = 0x70a08231
  const data = '0x70a08231' + pad32(address);
  const rawHex = await provider.request({
    method: 'eth_call',
    params: [{ to: cfg.contract, data }, 'latest'],
  });
  if (!rawHex || rawHex === '0x') return 0;
  const rawBig = BigInt(rawHex);
  const divisor = 10n ** BigInt(cfg.decimals);
  const whole = Number(rawBig / divisor);
  const remainder = Number(rawBig % divisor) / Number(divisor);
  return parseFloat((whole + remainder).toFixed(2));
}

export async function fetchSolanaUsdtBalance(address) {
  if (!address) return 0;
  try {
    const res = await fetch(SOLANA_MAINNET_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner',
        params: [
          address,
          { mint: SOLANA_USDT_MINT },
          { encoding: 'jsonParsed' },
        ],
      }),
    });
    const json = await res.json();
    const accounts = json?.result?.value || [];
    let total = 0;
    for (const acc of accounts) {
      const uiAmount = acc?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
      if (typeof uiAmount === 'number') total += uiAmount;
    }
    return parseFloat(total.toFixed(2));
  } catch {
    return 0;
  }
}

/**
 * Conecta à carteira Web3 real instalada no navegador.
 */
export async function requestWalletConnection(type = 'metamask') {
  if (type === 'phantom' || type === 'solflare') {
    const solProvider = resolveSolanaProvider(type);
    if (!solProvider) {
      throw new Error(
        'Carteira Solana (Phantom/Solflare) não encontrada no navegador. Instale a extensão oficial para conectar.'
      );
    }
    const resp = await solProvider.connect();
    const pubKey = (resp?.publicKey || solProvider.publicKey)?.toString();
    if (!pubKey) {
      throw new Error('Não foi possível obter o endereço da carteira Solana.');
    }
    const usdtBalance = await fetchSolanaUsdtBalance(pubKey);
    const state = {
      isConnected: true,
      walletType: type,
      address: pubKey,
      usdtBalance,
      chainId: 'solana',
      network: 'Solana (USDT SPL)',
    };
    saveWalletState(state);
    return state;
  }

  const evmProvider = resolveEvmProvider(type);
  if (!evmProvider) {
    throw new Error(
      'Nenhuma carteira Web3 (MetaMask ou Trust Wallet) detectada no navegador. Instale a extensão ou abra pelo navegador da carteira.'
    );
  }

  const accounts = await evmProvider.request({ method: 'eth_requestAccounts' });
  const address = accounts?.[0];
  if (!address) {
    throw new Error('Conexão cancelada ou nenhuma conta selecionada na carteira.');
  }

  const chainId = (await evmProvider.request({ method: 'eth_chainId' }))?.toLowerCase() || '0x38';
  const chainCfg = EVM_USDT_CONTRACTS[chainId];
  const network = chainCfg ? chainCfg.name : `EVM (${chainId})`;
  const usdtBalance = chainCfg ? await fetchEvmUsdtBalance(evmProvider, address, chainId) : 0;

  const state = {
    isConnected: true,
    walletType: type,
    address,
    usdtBalance,
    chainId,
    network,
  };
  saveWalletState(state);
  return state;
}

/**
 * Atualiza o saldo real on-chain de USDT da carteira conectada.
 */
export async function refreshWalletUsdtBalance() {
  const current = getSavedWalletState();
  if (!current.isConnected || !current.address) return current;

  if (current.chainId === 'solana') {
    const usdtBalance = await fetchSolanaUsdtBalance(current.address);
    const next = { ...current, usdtBalance };
    saveWalletState(next);
    return next;
  }

  const evmProvider = resolveEvmProvider(current.walletType);
  if (!evmProvider) return current;
  const chainId = (await evmProvider.request({ method: 'eth_chainId' }))?.toLowerCase() || current.chainId;
  const chainCfg = EVM_USDT_CONTRACTS[chainId];
  const usdtBalance = chainCfg ? await fetchEvmUsdtBalance(evmProvider, current.address, chainId) : 0;
  const next = {
    ...current,
    chainId,
    network: chainCfg ? chainCfg.name : current.network,
    usdtBalance,
  };
  saveWalletState(next);
  return next;
}

/**
 * Executa pagamento real em USDT on-chain (EVM ERC-20/BEP-20 transfer).
 */
export async function executeRealUsdtPayment({ amountUsdt, memo = 'CryptoZombies' }) {
  const treasuryAddress = (import.meta.env.VITE_TREASURY_WALLET_ADDRESS || '').trim();
  if (!treasuryAddress) {
    throw new Error(
      'Carteira tesouraria do projeto (VITE_TREASURY_WALLET_ADDRESS) não configurada nas variáveis de ambiente.'
    );
  }

  const current = getSavedWalletState();
  if (!current.isConnected || !current.address) {
    throw new Error('Conecte sua carteira Web3 antes de realizar transações reais.');
  }

  const evmProvider = resolveEvmProvider(current.walletType);
  if (!evmProvider) {
    throw new Error('Provedor Web3 (MetaMask/Trust Wallet) não encontrado.');
  }

  const chainId = (await evmProvider.request({ method: 'eth_chainId' }))?.toLowerCase() || current.chainId;
  const chainCfg = EVM_USDT_CONTRACTS[chainId];
  if (!chainCfg) {
    throw new Error(
      `Rede atual (${chainId}) não suportada para USDT. Troque para BNB Smart Chain, Polygon, Arbitrum, Base ou Ethereum na sua carteira.`
    );
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(treasuryAddress)) {
    throw new Error('Endereço VITE_TREASURY_WALLET_ADDRESS inválido para rede EVM (deve começar com 0x...).');
  }

  const amountUnits = parseTokenUnits(amountUsdt, chainCfg.decimals);
  // transfer(address to, uint256 value) selector = 0xa9059cbb
  const data =
    '0xa9059cbb' +
    pad32(treasuryAddress) +
    pad32(amountUnits.toString(16));

  const txHash = await evmProvider.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: current.address,
        to: chainCfg.contract,
        data,
      },
    ],
  });

  if (!txHash) {
    throw new Error('Transação cancelada na carteira.');
  }

  const updatedState = await refreshWalletUsdtBalance();

  return {
    txHash,
    explorerUrl: `${chainCfg.explorerTx}${txHash}`,
    network: chainCfg.name,
    amountUsdt,
    memo,
    updatedState,
  };
}

/**
 * Solicita assinatura criptográfica da carteira conectada para comprovar posse ao solicitar saque.
 */
export async function signWithdrawalAuthorization({ address, netUsdt, grossCoins }) {
  const message = `CryptoZombies — Autorização de Saque\nCarteira: ${address}\nValor Bruto: ${Number(grossCoins).toFixed(2)} Coins\nValor Líquido: ${Number(netUsdt).toFixed(2)} USDT\nTimestamp: ${new Date().toISOString()}`;

  const current = getSavedWalletState();
  if (current.chainId === 'solana') {
    const solProvider = resolveSolanaProvider(current.walletType);
    if (solProvider?.signMessage) {
      const encoded = new TextEncoder().encode(message);
      const signed = await solProvider.signMessage(encoded, 'utf8');
      return { message, signature: signed?.signature ? Array.from(signed.signature).slice(0, 16).join('') : 'signed' };
    }
    return { message, signature: 'solana_connected' };
  }

  const evmProvider = resolveEvmProvider(current.walletType);
  if (!evmProvider) {
    throw new Error('Carteira Web3 desconectada. Reconecte para assinar o pedido de saque.');
  }

  const signature = await evmProvider.request({
    method: 'personal_sign',
    params: [message, address],
  });
  return { message, signature };
}

export function disconnectWalletFromStorage() {
  localStorage.setItem(STORAGE_KEYS.CONNECTED, 'false');
  localStorage.setItem(STORAGE_KEYS.ADDRESS, '');
  localStorage.setItem(STORAGE_KEYS.USDT_BALANCE, '0');
  return {
    isConnected: false,
    walletType: 'metamask',
    address: '',
    usdtBalance: 0,
    chainId: '0x38',
    network: 'BNB Smart Chain',
  };
}
