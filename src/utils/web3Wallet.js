// Gerenciador de Conexão Web3 para MetaMask, Trust Wallet e WalletConnect
// Suporta conexão real via EIP-1193 (window.ethereum) e simulação imediata para testes/sandbox.

const STORAGE_KEYS = {
  CONNECTED: 'crypto_miners_wallet_connected',
  TYPE: 'crypto_miners_wallet_type',
  ADDRESS: 'crypto_miners_wallet_address',
  USDT_BALANCE: 'crypto_miners_wallet_usdt'
};

export const INITIAL_DEMO_USDT = 150.00; // Saldo inicial para testes

export function getSavedWalletState() {
  const isConnected = localStorage.getItem(STORAGE_KEYS.CONNECTED) === 'true';
  const walletType = localStorage.getItem(STORAGE_KEYS.TYPE) || 'metamask';
  const address = localStorage.getItem(STORAGE_KEYS.ADDRESS) || '0x71C38B0B74d9eE9eF530B2d3D52A082f6e6E3A9F';
  const savedUsdt = localStorage.getItem(STORAGE_KEYS.USDT_BALANCE);
  const usdtBalance = savedUsdt !== null ? parseFloat(savedUsdt) : INITIAL_DEMO_USDT;

  return {
    isConnected,
    walletType,
    address,
    usdtBalance,
    network: 'BNB Smart Chain (BEP-20)'
  };
}

export function saveWalletState(state) {
  localStorage.setItem(STORAGE_KEYS.CONNECTED, state.isConnected ? 'true' : 'false');
  localStorage.setItem(STORAGE_KEYS.TYPE, state.walletType || 'metamask');
  localStorage.setItem(STORAGE_KEYS.ADDRESS, state.address || '');
  localStorage.setItem(STORAGE_KEYS.USDT_BALANCE, state.usdtBalance.toString());
}

export async function requestWalletConnection(type = 'metamask') {
  // 1. Se o navegador tem window.ethereum instalado e é MetaMask ou Trust
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // Solicita contas ao provider real
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        const state = {
          isConnected: true,
          walletType: type,
          address,
          usdtBalance: getSavedWalletState().usdtBalance,
          network: 'BNB Smart Chain (BEP-20)'
        };
        saveWalletState(state);
        return state;
      }
    } catch (err) {
      console.warn('Erro ao conectar via window.ethereum, usando modo sandbox:', err);
    }
  }

  // 2. Fallback Sandbox / Modo Simulação Amigável
  // Cria um endereço gerado determinístico para teste imediato
  const demoAddresses = {
    metamask: '0x71C38B0B74d9eE9eF530B2d3D52A082f6e6E3A9F',
    trustwallet: '0x3F8a1B2C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A',
    walletconnect: '0x992B1C2A3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F88'
  };

  const currentSaved = getSavedWalletState();
  const state = {
    isConnected: true,
    walletType: type,
    address: demoAddresses[type] || demoAddresses.metamask,
    usdtBalance: currentSaved.usdtBalance,
    network: 'BNB Smart Chain (BEP-20)'
  };
  saveWalletState(state);
  return state;
}

export function disconnectWalletFromStorage() {
  localStorage.setItem(STORAGE_KEYS.CONNECTED, 'false');
  return {
    isConnected: false,
    walletType: 'metamask',
    address: '',
    usdtBalance: getSavedWalletState().usdtBalance,
    network: 'BNB Smart Chain (BEP-20)'
  };
}
