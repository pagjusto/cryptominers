import { isCityBuilding, GRID_COLS, GRID_ROWS } from '../src/utils/cityMapGeometry.js';
import { generatePlayerMap } from '../src/utils/individualMapEngine.js';
import { findNextHeroAction, isSolidTerrain } from '../src/utils/minerPathfinding.js';

// 1. Imprime a matriz de obstáculos
console.log('--- MAPA DE OBSTÁCULOS (15x11) ---');
for (let r = 0; r < GRID_ROWS; r++) {
  let line = `r=${r.toString().padStart(2, ' ')}: `;
  for (let c = 0; c < GRID_COLS; c++) {
    const obs = isCityBuilding(c, r);
    line += obs ? '██ ' : '.. ';
  }
  console.log(line);
}

// 2. Análise de conectividade (Flood Fill em todas as células abertas)
const visited = new Set();
const components = [];

for (let r = 1; r < GRID_ROWS - 1; r++) {
  for (let c = 1; c < GRID_COLS - 1; c++) {
    if (isCityBuilding(c, r) || visited.has(`${c},${r}`)) continue;

    const comp = [];
    const q = [{ c, r }];
    visited.add(`${c},${r}`);

    while (q.length > 0) {
      const cur = q.shift();
      comp.push(cur);

      const nbrs = [
        { c: cur.c + 1, r: cur.r },
        { c: cur.c - 1, r: cur.r },
        { c: cur.c, r: cur.r + 1 },
        { c: cur.c, r: cur.r - 1 }
      ];

      for (const n of nbrs) {
        if (n.c <= 0 || n.c >= GRID_COLS - 1 || n.r <= 0 || n.r >= GRID_ROWS - 1) continue;
        if (isCityBuilding(n.c, n.r) || visited.has(`${n.c},${n.r}`)) continue;
        visited.add(`${n.c},${n.r}`);
        q.push(n);
      }
    }
    components.push(comp);
  }
}

console.log(`\nNúmero de componentes conectados no mapa aberto: ${components.length}`);
components.forEach((comp, idx) => {
  console.log(`Componente #${idx + 1}: ${comp.length} células abertas. Exemplo: (${comp[0].c}, ${comp[0].r})`);
});

// 3. Testa 50 mapas gerados com 15 heróis e simula 20 turnos de decisão
let idleCount = 0;
let totalDecisions = 0;

for (let m = 0; m < 20; m++) {
  const map = generatePlayerMap('test_player', m + 1);
  const heroes = [
    { id: 'h1', x: 1, y: 1 },
    { id: 'h2', x: 2, y: 5 },
    { id: 'h3', x: 4, y: 1 },
    { id: 'h4', x: 7, y: 1 },
    { id: 'h5', x: 9, y: 1 },
    { id: 'h6', x: 13, y: 1 },
    { id: 'h7', x: 1, y: 9 },
    { id: 'h8', x: 4, y: 9 },
    { id: 'h9', x: 8, y: 9 },
    { id: 'h10', x: 13, y: 9 },
    { id: 'h11', x: 1, y: 4 },
    { id: 'h12', x: 13, y: 4 },
    { id: 'h13', x: 7, y: 2 },
    { id: 'h14', x: 3, y: 5 },
    { id: 'h15', x: 11, y: 5 }
  ];

  heroes.forEach(h => {
    totalDecisions++;
    const dec = findNextHeroAction(h, map.grid, heroes, true);
    if (dec.action === 'idle') {
      idleCount++;
      console.log(`Herói em (${h.x}, ${h.y}) ficou IDLE no mapa #${m}!`);
    }
  });
}

console.log(`\nDecisões IDLE: ${idleCount} / ${totalDecisions}`);
