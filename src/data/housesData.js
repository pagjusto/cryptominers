// CRYPTOZOMBIES — EVOLUÇÃO PERMANENTE DA BASE MÉDICA
// Lançamento: três níveis sequenciais. O nível controla a capacidade visual e real dos leitos.
export const HOUSE_TIERS = [
  {
    id: 'none',
    level: 0,
    name: 'Sem Abrigo',
    icon: '⛺',
    slots: 0,
    recoverySpeedPct: 50,
    fragmentCost: 0,
    mncCost: 0,
    color: '#64748b',
    description: 'Sem ambulatório: sobreviventes feridos aguardam resgate e leito.'
  },
  {
    id: 'basic',
    level: 1,
    name: 'Base Básica',
    icon: '🛖',
    image: '/assets/bases/base_basic.png',
    slots: 5,
    recoverySpeedPct: 100,
    fragmentCost: 0,
    mncCost: 0,
    color: '#38bdf8',
    description: 'Base inicial gratuita com 5 leitos visíveis e tratamento padrão.'
  },
  {
    id: 'reinforced',
    level: 2,
    name: 'Base Reforçada',
    icon: '🏡',
    image: '/assets/bases/base_reinforced.png',
    slots: 10,
    recoverySpeedPct: 125,
    fragmentCost: 20,
    mncCost: 1500,
    color: '#22c55e',
    description: 'Evolução permanente: amplia a enfermaria para 10 leitos e acelera o tratamento.'
  },
  {
    id: 'advanced',
    level: 3,
    name: 'Base Avançada',
    icon: '🏠',
    image: '/assets/bases/base_advanced.png',
    slots: 15,
    recoverySpeedPct: 150,
    fragmentCost: 40,
    mncCost: 4000,
    color: '#f59e0b',
    popular: true,
    description: 'Evolução permanente: amplia a enfermaria para 15 leitos e aumenta a velocidade de tratamento.'
  }
];

// IDs antigos salvos no localStorage são migrados para os três níveis atuais.
export function resolveHouseTier(houseId) {
  const aliasMap = {
    tiny: 'basic',
    mini: 'basic',
    luxury: 'reinforced',
    mansion: 'advanced',
    palace: 'advanced',
    legendary: 'advanced'
  };
  const resolvedId = aliasMap[houseId] || houseId;
  return HOUSE_TIERS.find(h => h.id === resolvedId) || HOUSE_TIERS[1];
}
