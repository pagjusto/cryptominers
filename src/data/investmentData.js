// Configuração Oficial de Investimento e Economia Sustentável de 3 Meses (~90 dias de ROI)
// No modelo original de mineração Web3: 1 Herói = 10 BCOIN, Full Team = 15 Heróis (150 BCOIN).

export const ENTRY_PACKAGES = [
  {
    id: 'starter',
    name: 'Passe Solitário (Iniciante)',
    tagline: 'Entrada Mínima do Jogo',
    heroesCount: 1,
    costBcoin: 10,
    icon: '⛏️',
    color: '#38bdf8',
    estimatedDailyBcoin: 0.115,
    estimatedRoiDays: 87,
    activeRoiDays: 55,
    description: '1 Minerador. Ideal para conhecer a mecânica da mina com o menor risco inicial.',
    features: [
      '1 Caixa de Recrutamento (10 BCOIN)',
      'Acesso à Mina Subterrânea',
      'Mineração sustentável de longo prazo'
    ]
  },
  {
    id: 'squad',
    name: 'Esquadrão Minerador (Recomendado)',
    tagline: 'O Setup Mais Popular',
    heroesCount: 5,
    costBcoin: 50,
    icon: '⚒️',
    color: '#22c55e',
    popular: true,
    estimatedDailyBcoin: 0.585,
    estimatedRoiDays: 85,
    activeRoiDays: 53,
    description: '5 Mineradores. Ritmo ideal para limpar mapas rapidamente e farmar baús de valor.',
    features: [
      '5 Caixas de Recrutamento (50 BCOIN)',
      'Garante ao menos 1 especialista Raro+',
      'Limpeza de mapas 5x mais rápida'
    ]
  },
  {
    id: 'full_team',
    name: 'Time Completo "Full Team"',
    tagline: 'Referência clássica de equipe completa',
    heroesCount: 15,
    costBcoin: 150,
    icon: '👑',
    color: '#f59e0b',
    badge: 'MÁXIMO PERMITIDO (15/15)',
    estimatedDailyBcoin: 1.780,
    estimatedRoiDays: 84,
    activeRoiDays: 50,
    description: '15 Mineradores (o limite máximo de heróis no mapa simultaneamente).',
    features: [
      '15 Caixas de Recrutamento (150 BCOIN)',
      'Capacidade máxima de mineração do mapa',
      'Maior retorno diário em BCOIN',
      'Desconto de gás no mint em lote'
    ]
  }
];

// Perfis de Retorno do Modelo Sustentável de 3 Meses
export const ROI_PROFILES = [
  {
    id: 'passive',
    title: 'Jogador Passivo',
    roiDays: '85 a 100 dias (~3 meses)',
    dailyBcoinRate: '~0.11 B / herói / dia',
    badge: 'SEM CASA',
    color: '#94a3b8',
    description: 'Deixa os mineradores descansando no chão da caverna. Recuperação básica de estamina sem custos adicionais.'
  },
  {
    id: 'strategic',
    title: 'Jogador Estratégico',
    roiDays: '65 a 75 dias (~2.2 meses)',
    dailyBcoinRate: '~0.15 B / herói / dia',
    badge: 'CASA & CAMAS',
    color: '#38bdf8',
    description: 'Investe em uma Casa (Tiny/Mini/Luxury) para recuperar estamina até 10x mais rápido e usa classes sinérgicas.'
  },
  {
    id: 'hardcore',
    title: 'Jogador Ativo (Hardcore)',
    roiDays: '50 a 60 dias (~1.8 meses)',
    dailyBcoinRate: '~0.20 B / herói / dia',
    badge: 'PLAYABLE ADS & BOOSTS',
    color: '#f59e0b',
    description: 'Abre os Baús de Titânio patrocinados, ativa a Bênção no MINT e usa Energia Turbo, acelerando o retorno com receita externa.'
  }
];

// Regras Oficiais de Saque e Taxas Regressivas por ROI — CryptoZombies
export const WITHDRAWAL_RULES = {
  minWithdrawUsd: 40, // Saque mínimo oficial: US$ 40
  getMinWithdrawMnc: (rate = 0.01) => Math.ceil(40 / (rate || 0.01)),
  taxTiers: [
    { roiMin: 0, roiMax: 49, taxPct: 15, label: 'ROI de 0% a 49% (Taxa: 15%)' },
    { roiMin: 50, roiMax: 99, taxPct: 10, label: 'ROI de 50% a 99% (Taxa: 10%)' },
    { roiMin: 100, roiMax: 149, taxPct: 5, label: 'ROI de 100% a 149% (Taxa: 5%)' },
    { roiMin: 150, roiMax: 999999, taxPct: 3, label: 'ROI de 150% ou superior (Taxa Fixa: 3%)' }
  ],
  dailyWithdrawLimit: 'PENDENTE_DE_DEFINICAO' // Não aplicar limite diário sem regra operacional confirmada
};

export function calculateWithdrawalTax(totalInvestedUsdt, totalWithdrawnUsdt) {
  if (totalInvestedUsdt <= 0) return 15;
  const roiPct = (Math.max(0, totalWithdrawnUsdt) / totalInvestedUsdt) * 100;
  
  if (roiPct < 50) return 15;
  if (roiPct < 100) return 10;
  if (roiPct < 150) return 5;
  return 3; // 3% fixa para ROI >= 150%
}
