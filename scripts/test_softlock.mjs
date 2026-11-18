import { isCityObstacle, GRID_COLS, GRID_ROWS } from '../src/utils/cityMapGeometry.js';
import { isSolidTerrain, findNextHeroAction } from '../src/utils/minerPathfinding.js';
import { BLOCK_EMPTY, BLOCK_BEDROCK, BLOCK_ZOMBIE } from '../src/data/minersData.js';

const grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(BLOCK_EMPTY));
for (let c = 0; c < GRID_COLS; c++) {
  grid[0][c] = BLOCK_BEDROCK;
  grid[GRID_ROWS - 1][c] = BLOCK_BEDROCK;
}
for (let r = 0; r < GRID_ROWS; r++) {
  grid[r][0] = BLOCK_BEDROCK;
  grid[r][GRID_COLS - 1] = BLOCK_BEDROCK;
}

// Only 2 zombies remain, just like in the screenshot!
const z1 = { x: 10, y: 2 }; // Near tower/outdoor
const z2 = { x: 11, y: 5 }; // Right of hospital
grid[z1.y][z1.x] = BLOCK_ZOMBIE;
grid[z2.y][z2.x] = BLOCK_ZOMBIE;

console.log('Testing heroes path to remaining 2 zombies:');
const testHeroes = [
  { id: 'h1', x: 7, y: 8 },
  { id: 'h2', x: 2, y: 5 },
  { id: 'h3', x: 1, y: 8 },
  { id: 'h4', x: 8, y: 8 }
];

testHeroes.forEach(h => {
  const act = findNextHeroAction(h, grid, testHeroes, true);
  console.log(`Hero at (${h.x}, ${h.y}):`, act);
});
