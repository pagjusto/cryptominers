// CRYPTOZOMBIES — CATÁLOGO OFICIAL DE ESPECIALISTAS DO ABRIGO
// Médica Íris (Hospital) & Mestre Armeiro (Sala de Armas)

export const STAFF_PLANS = [
  {
    id: 'monthly',
    name: 'Plano Mensal',
    durationDays: 30,
    costCoins: 520,
    costUsdt: 5.20,
    discount: null,
    tagline: 'Ideal para experimentação'
  },
  {
    id: 'quarterly',
    name: 'Plano Trimestral',
    durationDays: 90,
    costCoins: 1380,
    costUsdt: 13.80,
    discount: '12% OFF',
    popular: true,
    tagline: 'Mais equilibrado para rotina'
  },
  {
    id: 'semiannual',
    name: 'Plano Semestral',
    durationDays: 180,
    costCoins: 2500,
    costUsdt: 25.00,
    discount: '20% OFF',
    tagline: 'Melhor custo-benefício'
  }
];

export const STAFF_MEMBERS = {
  iris: {
    id: 'iris',
    name: 'Dra. Íris',
    title: 'Médica Cirurgiã do Abrigo',
    room: 'Ambulatório & Hospital',
    role: 'Atendimento Médico e Resgate de Feridos',
    specialty: 'Resgate automático de combatentes feridos e encaminhamento para leitos hospitalares.',
    icon: '💉',
    badge: 'ENFERMARIA',
    badgeColor: '#10b981',
    avatar: '💉',
    image: '/assets/heroes/iris.png',
    pos: { x: 490, y: 386 }
  },
  armeiro: {
    id: 'armeiro',
    name: 'Mestre Armeiro',
    title: 'Armeiro & Mecânico da Base',
    room: 'Sala de Armas & Oficina',
    role: 'Manutenção e Reparo Automático de Armas',
    specialty: 'Restaura a durabilidade das armas para 100% automaticamente na sala de armas, eliminando pausas e anúncios de reparo.',
    icon: '🔨',
    badge: 'SALA DE ARMAS',
    badgeColor: '#f59e0b',
    avatar: '🔧',
    image: '/assets/heroes/armeiro.png',
    weaponImage: '/assets/weapons/armeiro_wrench.png',
    pos: { x: 666, y: 358 }
  }
};

export function getStaffContract(staffId) {
  if (typeof window === 'undefined') return { active: false, expiresAt: 0 };
  try {
    const raw = localStorage.getItem(`crypto_miners_staff_${staffId}`);
    if (!raw) {
      // Se não houver registro para Dra. Íris, ela vem ativa como cortesia da base médica
      if (staffId === 'iris') {
        return { active: true, expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, planId: 'permanent' };
      }
      return { active: false, expiresAt: 0 };
    }
    const data = JSON.parse(raw);
    const active = Boolean(data.active && data.expiresAt > Date.now());
    return { ...data, active };
  } catch (e) {
    return { active: staffId === 'iris', expiresAt: 0 };
  }
}

export function saveStaffContract(staffId, contractData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`crypto_miners_staff_${staffId}`, JSON.stringify(contractData));
  } catch (e) {
    console.warn('Erro ao salvar contrato do especialista:', e);
  }
}
