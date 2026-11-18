import { isCityObstacle, GRID_COLS, GRID_ROWS, SAFE_HERO_SPAWN_POINTS } from '../src/utils/cityMapGeometry.js';
import { generatePlayerMap } from '../src/utils/individualMapEngine.js';
import { findNextHeroAction } from '../src/utils/minerPathfinding.js';

// Define updated isCityObstacle logic including the Billboard
function isObstacleWithBillboard(c, r) {
  // Original obstacles
  if (isCityObstacle(c, r)) return true;

  // Outdoor / Billboard Vetorizado: Cols 6, 7, 8, 9 at Rows 0, 1 (and row 2 is already barricade)
  if ((c >= 6 && c <= 9) && (r >= 0 && r <= 2)) {
    return true;
  }

  return false;
}

console.log('--- TEST 1: SAFE_HERO_SPAWN_POINTS ---');
let spawnCollisions = 0;
SAFE_HERO_SPAWN_POINTS.forEach((pt, idx) => {
  if (isObstacleWithBillboard(pt.x, pt.y)) {
    console.error(`Spawn #${idx} at (${pt.x}, ${pt.y}) collides with obstacle!`);
    spawnCollisions++;
  }
});
console.log(`Spawn collisions: ${spawnCollisions} (must be 0)`);

console.log('--- TEST 2: FLOOD FILL CONNECTIVITY ---');
let openCount = 0;
let firstOpen = null;
for (let r = 0; r < GRID_ROWS; r++) {
  for (let c = 0; c < GRID_COLS; c++) {
    if (!isObstacleWithBillboard(c, r)) {
      openCount++;
      if (!firstOpen) firstOpen = { c, r };
    }
  }
}

const queue = [firstOpen];
const visited = new Set([`${firstOpen.c},${firstOpen.r}`]);
const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]];

while (queue.length > 0) {
  const curr = queue.shift();
  for (const [dc, dr] of DIRS) {
    const nc = curr.c + dc;
    const nr = curr.r + dr;
    if (nc >= 0 && nc < GRID_COLS && nr >= 0 && nr < GRID_ROWS && !isObstacleWithBillboard(nc, nr)) {
      const key = `${nc},${nr}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ c: nc, r: nr });
      }
    }
  }
}
console.log(`Open tiles: ${openCount}, Reachable from (${firstOpen.c}, ${firstOpen.r}): ${visited.size}`);
console.log(`Connectivity: ${visited.size === openCount ? 'PASS (100% Connected)' : 'FAIL'}`);

console.log('--- TEST 3: SIMULATE 100 MAPS WITH HERO ACTIONS ---');
let idleDecisions = 0;
for (let mapIdx = 0; mapIdx < 100; mapIdx++) {
  // Mock map generation using isObstacleWithBillboard
  const validCells = [];
  for (let r = 1; r < GRID_ROWS - 1; r++) {
    for (let c = 1; c < GRID_COLS - 1; c++) {
      if (!isObstacleWithBillboard(c, r)) validCells.push({ c, r });
    }
  }

  // Shuffle and pick 20 positions
  const shuffled = [...validCells].sort(() => Math.random() - 0.5).slice(0, 20);
  const grid = Array.from({ length: GRID_ROWS }, (_, r) => 
    Array.from({ length: GRID_COLS }, (_, c) => 
      isObstacleWithBillboard(c, r) ? 1 : 0
    )
  );

  shuffled.forEach(pos => {
    grid[pos.r][pos.c] = 2; // zombie
  });

  // Test 15 heroes at random safe spawns
  for (let h = 0; h < 15; h++) {
    const spawn = SAFE_HERO_SPAWN_POINTS[h % SAFE_HERO_SPAWN_POINTS.length];
    const hero = { id: `hero_${h}`, x: spawn.x, y: spawn.y, speed: 1.0, power: 1 };
    const action = findNextHeroAction(hero, grid, [], true);
    if (action.action === 'idle') {
      idleDecisions++;
    }
  }
}

console.log(`100 maps tested (1500 hero decisions): idle decisions = ${idleDecisions} (must be 0)`);
