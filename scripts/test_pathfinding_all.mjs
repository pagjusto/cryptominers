import { isCityObstacle, getSafeHeroSpawn } from '../src/utils/cityMapGeometry.js';
import { generatePlayerMap } from '../src/utils/individualMapEngine.js';
import { findNextHeroAction } from '../src/utils/minerPathfinding.js';

let totalChecks = 0;
let idleChecks = 0;

for (let i = 0; i < 200; i++) {
  const map = generatePlayerMap('p1', i + 1);
  const heroes = Array.from({ length: 15 }, (_, idx) => {
    const pt = getSafeHeroSpawn(idx);
    return { id: `hero_${idx}`, x: pt.x, y: pt.y };
  });

  heroes.forEach(h => {
    totalChecks++;
    const res = findNextHeroAction(h, map.grid, heroes, true);
    if (res.action === 'idle') {
      idleChecks++;
    }
  });
}

console.log(`Testando 200 mapas gerados (3.000 decisões):`);
console.log(`Total: ${totalChecks}, Idles: ${idleChecks}`);
if (idleChecks === 0) {
  console.log('✅ 100% DE SUCESSO: NENHUM HERÓI BOBO EM NENHUM CICLO!');
}
