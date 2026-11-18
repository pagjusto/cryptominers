import { findNextHeroAction, COMBAT_RANGE, hasClearLineOfSight, isSolidTerrain } from '../src/utils/minerPathfinding.js';
import { GRID_COLS, GRID_ROWS, BLOCK_EMPTY, BLOCK_BEDROCK, BLOCK_ZOMBIE } from '../src/data/minersData.js';

const grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(BLOCK_EMPTY));
for (let c = 0; c < GRID_COLS; c++) {
  grid[0][c] = BLOCK_BEDROCK;
  grid[GRID_ROWS - 1][c] = BLOCK_BEDROCK;
}
for (let r = 0; r < GRID_ROWS; r++) {
  grid[r][0] = BLOCK_BEDROCK;
  grid[r][GRID_COLS - 1] = BLOCK_BEDROCK;
}

// 2 zombies
grid[2][10] = BLOCK_ZOMBIE;
grid[5][11] = BLOCK_ZOMBIE;

console.log('grid[2][10]:', grid[2][10]);
console.log('grid[5][11]:', grid[5][11]);

const heroes = [
  { id: 'h1', x: 1, y: 4, speed: 1 },
  { id: 'h2', x: 2, y: 5, speed: 1 },
  { id: 'h3', x: 10, y: 8, speed: 1 },
  { id: 'h4', x: 11, y: 9, speed: 1 }
];

heroes.forEach(h => {
  const res = findNextHeroAction(h, grid, heroes, true);
  console.log(`Hero ${h.id} at (${h.x}, ${h.y}):`, res);
});
