// Gerenciador de Conexão Web3 — Cripto Myners
// Rede oficial planejada: Solana (USDT SPL)
// As taxas de rede (SOL) são assumidas pelo jogo como custo operacional; nenhuma taxa de rede é cobrada do jogador.
// A integração real com a blockchain não é ativada nesta etapa preliminar de frontend.

const STORAGE_KEYS = {
  CONNECTED: 'crypto_miners_wallet_connected',
  TYPE: 'crypto_miners_wallet_type',
  ADDRESS: 'crypto_miners_wallet_address',
  USDT_BALANCE: 'crypto_miners_wallet_usdt'
};

export const INITIAL_DEMO_USDT = 150.00; // Saldo inicial para testes

export function getSavedWalletState() {
  const isConnected = localStorage.getItem(STORAGE_KEYS.CONNECTED) === 'true';
  const walletType = localStorage.getItem(STORAGE_KEYS.TYPE) || 'phantom';
  const address = localStorage.getItem(STORAGE_KEYS.ADDRESS) || '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';
  const savedUsdt = localStorage.getItem(STORAGE_KEYS.USDT_BALANCE);
  const usdtBalance = savedUsdt !== null ? parseFloat(savedUsdt) : INITIAL_DEMO_USDT;

  return {
    isConnected,
    walletType,
    address,
    usdtBalance,
    network: 'Solana (USDT SPL)'
  };
}

export function saveWalletState(state) {
  localStorage.setItem(STORAGE_KEYS.CONNECTED, state.isConnected ? 'true' : 'false');
  localStorage.setItem(STORAGE_KEYS.TYPE, state.walletType || 'phantom');
  localStorage.setItem(STORAGE_KEYS.ADDRESS, state.address || '');
  localStorage.setItem(STORAGE_KEYS.USDT_BALANCE, state.usdtBalance.toString());
}

export async function requestWalletConnection(type = 'phantom') {
  // Modo Sandbox / Demonstração Amigável (integração real desativada nesta fase de desenvolvimento)
  const demoAddresses = {
    phantom: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    solflare: '7GttKvZB7qX8N6pM2bL8u9eR3w4y1T5s6Z0xV9aB1cD2',
    torus: '5K3kL9mN8bV7c6X5z4A3s2D1f0G9h8J7k6L5m4N3b2V1'
  };

  const currentSaved = getSavedWalletState();
  const state = {
    isConnected: true,
    walletType: type,
    address: demoAddresses[type] || demoAddresses.phantom,
    usdtBalance: currentSaved.usdtBalance,
    network: 'Solana (USDT SPL)'
  };
  saveWalletState(state);
  return state;
}

export function disconnectWalletFromStorage() {
  localStorage.setItem(STORAGE_KEYS.CONNECTED, 'false');
  return {
    isConnected: false,
    walletType: 'phantom',
    address: '',
    usdtBalance: getSavedWalletState().usdtBalance,
    network: 'Solana (USDT SPL)'
  };
}
