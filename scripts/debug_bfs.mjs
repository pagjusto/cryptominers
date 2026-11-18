import { isCityObstacle, GRID_COLS, GRID_ROWS } from '../src/utils/cityMapGeometry.js';
import { isSolidTerrain, findNextHeroAction } from '../src/utils/minerPathfinding.js';
import { BLOCK_EMPTY, BLOCK_BEDROCK, BLOCK_ZOMBIE, BLOCK_BOSS } from '../src/data/minersData.js';
import { generatePlayerMap } from '../src/utils/individualMapEngine.js';

const mapData = generatePlayerMap('test_player', 1);
const grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(BLOCK_EMPTY));
for (let c = 0; c < GRID_COLS; c++) {
  grid[0][c] = BLOCK_BEDROCK;
  grid[GRID_ROWS - 1][c] = BLOCK_BEDROCK;
}
for (let r = 0; r < GRID_ROWS; r++) {
  grid[r][0] = BLOCK_BEDROCK;
  grid[r][GRID_COLS - 1] = BLOCK_BEDROCK;
}
mapData.deposits.forEach(d => {
  grid[d.r][d.c] = d.type === 'boss' ? BLOCK_BOSS : BLOCK_ZOMBIE;
});

const miner = {
  id: 'miner_test',
  x: 1,
  y: 2,
  classId: 'common',
  speed: 1,
  targetDir: 1
};

console.log('Testing miner at (1, 2):');
console.log('isSolidTerrain(1, 2):', isSolidTerrain(1, 2, grid, true));
console.log('Neighbors:');
[
  { x: 1, y: 1 },
  { x: 2, y: 2 },
  { x: 1, y: 3 },
  { x: 0, y: 2 }
].forEach(n => {
  console.log(` (${n.x}, ${n.y}) solid=${isSolidTerrain(n.x, n.y, grid, true)} gridVal=${grid[n.y]?.[n.x]}`);
});

const act = findNextHeroAction(miner, grid, [miner], true);
console.log('Action:', act);
