// CRYPTOZOMBIES — SISTEMA OFICIAL DE ABRIGOS
// 4 categorias de abrigo para tratamento e recuperação da vida dos sobreviventes:
// - Básica: Capacidade 5, Velocidade 100%
// - Reforçada: Capacidade 10, Velocidade 125%
// - Avançada: Capacidade 15, Velocidade 150%
// - Lendária: Capacidade 20, Velocidade 200%

export const HOUSE_TIERS = [
  {
    id: 'none',
    name: 'Sem Abrigo',
    icon: '⛺',
    slots: 0,
    recoverySpeedPct: 50,
    costUsdt: 0,
    costBcoin: 0,
    color: '#64748b',
    description: 'Sem abrigo médico: sobreviventes feridos aguardam tratamento.'
  },
  {
    id: 'basic',
    name: 'Abrigo Básico',
    icon: '🛖',
    slots: 5,
    recoverySpeedPct: 100,
    costUsdt: 25,
    costBcoin: 25,
    color: '#38bdf8',
    description: 'Acomoda até 5 sobreviventes em tratamento simultaneamente com 100% da velocidade padrão.'
  },
  {
    id: 'reinforced',
    name: 'Abrigo Reforçado',
    icon: '🏡',
    slots: 10,
    recoverySpeedPct: 125,
    costUsdt: 50,
    costBcoin: 50,
    color: '#22c55e',
    description: 'Trata até 10 sobreviventes simultaneamente, com recuperação 125% mais rápida que a básica.'
  },
  {
    id: 'advanced',
    name: 'Abrigo Avançado',
    icon: '🏠',
    slots: 15,
    recoverySpeedPct: 150,
    costUsdt: 85,
    costBcoin: 85,
    popular: true,
    color: '#f59e0b',
    description: 'Trata até 15 sobreviventes simultaneamente, com recuperação 150% da velocidade básica.'
  },
  {
    id: 'legendary',
    name: 'Abrigo Lendário',
    icon: '🏰',
    slots: 20,
    recoverySpeedPct: 200,
    costUsdt: 135,
    costBcoin: 135,
    badge: 'MÁXIMO (2.0x)',
    color: '#ec4899',
    description: 'Trata até 20 sobreviventes simultaneamente, com recuperação duas vezes mais rápida que a básica.'
  }
];

// Mapeamento de retrocompatibilidade para IDs antigos salvos no localStorage
export function resolveHouseTier(houseId) {
  const aliasMap = {
    tiny: 'basic',
    mini: 'basic',
    luxury: 'reinforced',
    mansion: 'advanced',
    palace: 'legendary'
  };
  const resolvedId = aliasMap[houseId] || houseId;
  return HOUSE_TIERS.find(h => h.id === resolvedId) || HOUSE_TIERS[1]; // Padrão: Abrigo Básico
}
