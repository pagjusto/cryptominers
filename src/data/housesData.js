// CRIPTO MYNERS — SISTEMA OFICIAL DE CASAS
// 4 Categorias oficiais responsáveis pelo descanso e recuperação de energia dos personagens:
// - Básica: Capacidade 5, Velocidade 100%
// - Reforçada: Capacidade 10, Velocidade 125%
// - Avançada: Capacidade 15, Velocidade 150%
// - Lendária: Capacidade 20, Velocidade 200%

export const HOUSE_TIERS = [
  {
    id: 'none',
    name: 'Sem Casa (Chão da Mina)',
    icon: '⛺',
    slots: 0,
    recoverySpeedPct: 50,
    staminaPerSec: 1.5,
    costUsdt: 0,
    costBcoin: 0,
    color: '#64748b',
    description: 'Os mineradores dormem no chão de pedra da mina. Recuperação básica de energia.'
  },
  {
    id: 'basic',
    name: 'Casa Básica',
    icon: '🛖',
    slots: 5,
    recoverySpeedPct: 100,
    staminaPerSec: 5.0, // 100% velocidade base
    costUsdt: 25,
    costBcoin: 25,
    color: '#38bdf8',
    description: 'Acomoda até 5 personagens descansando simultaneamente com 100% da velocidade padrão.'
  },
  {
    id: 'reinforced',
    name: 'Casa Reforçada',
    icon: '🏡',
    slots: 10,
    recoverySpeedPct: 125,
    staminaPerSec: 6.25, // 125% (+25% mais rápida)
    costUsdt: 50,
    costBcoin: 50,
    color: '#22c55e',
    description: 'Acomoda até 10 personagens com velocidade de recuperação de 125% (25% mais rápida que a básica).'
  },
  {
    id: 'advanced',
    name: 'Casa Avançada',
    icon: '🏠',
    slots: 15,
    recoverySpeedPct: 150,
    staminaPerSec: 7.5, // 150% (+50% mais rápida)
    costUsdt: 85,
    costBcoin: 85,
    popular: true,
    color: '#f59e0b',
    description: 'Acomoda até 15 personagens com velocidade de recuperação de 150% (+50% mais rápida). Ideal para manter a mina com revezamento ágil.'
  },
  {
    id: 'legendary',
    name: 'Casa Lendária',
    icon: '🏰',
    slots: 20,
    recoverySpeedPct: 200,
    staminaPerSec: 10.0, // 200% (dobro da velocidade)
    costUsdt: 135,
    costBcoin: 135,
    badge: 'MÁXIMO (2.0x)',
    color: '#ec4899',
    description: 'Acomoda até 20 personagens. Velocidade de recuperação de 200% (o dobro da velocidade da básica). Exemplo: recupera energia completa em metade do tempo.'
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
  return HOUSE_TIERS.find(h => h.id === resolvedId) || HOUSE_TIERS[1]; // Padrão: Casa Básica
}
