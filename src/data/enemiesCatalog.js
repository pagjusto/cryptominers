// ============================================================================
// CRIPTO MYNERS — CATÁLOGO OFICIAL DE INIMIGOS
//
// 1. O ZUMBI substitui as antigas jazidas com movimentação de caminhada e ataque.
// 2. O BOSS substitui o antigo baú com passos pesados e ataques sísmicos.
// 3. Regra Fundamental: Separação total entre combate visual e economia.
//    Ataques e animações são cosméticos; produção de MNC segue intacta.
// ============================================================================

import { BLOCK_ZOMBIE, BLOCK_BOSS } from './minersData.js';

export const ENEMIES = {
  ZOMBIE: {
    id: 'zombie_deposit',
    blockId: BLOCK_ZOMBIE,
    name: 'Zumbi Mineiro',
    type: 'zombie',
    sprite: '/enemies/zombie.png',
    cleanSprite: '/enemies/zombie_clean.png',
    speed: 0.65, // Células por segundo
    baseHp: 2, // Morre com exatamente 2 tiros conforme regra do usuário
    attackDamage: 0, // Visual apenas
    attackRange: 1.1,
    walkCadence: 6.0,
    maxPerMap: 20,
    color: '#84cc16',
    icon: '🧟',
    description: 'Criatura cambaleante que perambula pelos túneis e ataca com garras afiadas'
  },
  BOSS: {
    id: 'boss_chest',
    blockId: BLOCK_BOSS,
    name: 'Boss Abominação Mutante',
    type: 'boss',
    sprite: '/enemies/boss.png',
    cleanSprite: '/enemies/boss_clean.png',
    speed: 0.38, // Movimentação mais pesada
    baseHp: 6000, // HP do Boss
    attackDamage: 0, // Visual apenas
    attackRange: 1.4,
    walkCadence: 4.0,
    maxPerMap: 1,
    color: '#ef4444',
    icon: '💀',
    reward: 'chest_bonus', // Ao ser derrotado, concede a recompensa do baú
    description: 'Colosso titânico com garras devastadoras e ataques sísmicos'
  }
};
