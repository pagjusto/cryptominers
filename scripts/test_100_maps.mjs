import { isCityObstacleFixed } from './test_connectivity.mjs';
import { generatePlayerMap } from '../src/utils/individualMapEngine.js';
import { findNextHeroAction } from '../src/utils/minerPathfinding.js';

// Vamos testar 100 mapas gerados e 15 heróis em cada mapa
let totalChecks = 0;
let idleChecks = 0;

const SAFE_POINTS = [
  { x: 1, y: 4 }, { x: 2, y: 5 }, { x: 1, y: 6 }, { x: 2, y: 6 },
  { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 9 }, { x: 2, y: 9 },
  { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 4, y: 1 }, { x: 5, y: 1 },
  { x: 12, y: 4 }, { x: 12, y: 5 }, { x: 12, y: 6 }, { x: 13, y: 6 },
  { x: 7, y: 8 }, { x: 8, y: 8 }, { x: 6, y: 9 }, { x: 7, y: 9 }
];

for (let i = 0; i < 100; i++) {
  const map = generatePlayerMap('p1', i + 1);
  const heroes = SAFE_POINTS.slice(0, 15).map((pt, idx) => ({
    id: `hero_${idx}`,
    x: pt.x,
    y: pt.y
  }));

  heroes.forEach(h => {
    totalChecks++;
    const res = findNextHeroAction(h, map.grid, heroes, true);
    if (res.action === 'idle') {
      idleChecks++;
      console.log(`Herói ${h.id} em (${h.x}, ${h.y}) ficou idle no mapa #${i}!`);
    }
  });
}

console.log(`Resultado do teste com 100 mapas e 1.500 decisões:`);
console.log(`Total de decisões: ${totalChecks}, Decisões IDLE: ${idleChecks}`);
if (idleChecks === 0) {
  console.log('✅ SUCESSO TOTAL: 0 HERÓIS BOBOS!');
}
