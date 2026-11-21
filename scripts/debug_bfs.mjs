import { findNextHeroAction, isCellOccupiedForStop, hasClearLineOfSight } from '../src/utils/minerPathfinding.js';
import { BLOCK_EMPTY, BLOCK_BEDROCK, BLOCK_ZOMBIE } from '../src/data/minersData.js';

const grid = Array.from({ length: 11 }, () => Array(15).fill(BLOCK_EMPTY));
for (let c = 0; c < 15; c++) {
  grid[0][c] = BLOCK_BEDROCK;
  grid[10][c] = BLOCK_BEDROCK;
}
for (let r = 0; r < 11; r++) {
  grid[r][0] = BLOCK_BEDROCK;
  grid[r][14] = BLOCK_BEDROCK;
}
grid[2][10] = BLOCK_ZOMBIE;

const miners = [
  { id: 'hero1', x: 9, y: 2, status: 'work', speed: 1, targetBlock: { x: 10, y: 2 } },
  { id: 'hero2', x: 7, y: 2, status: 'work', speed: 1 },
];

console.log('Occupied check for (8, 2):', isCellOccupiedForStop(8, 2, 'hero2', miners, grid));
console.log('Occupied check for (9, 2):', isCellOccupiedForStop(9, 2, 'hero2', miners, grid));
console.log('Line of sight from (8, 2) to (10, 2):', hasClearLineOfSight(8, 2, 10, 2));

const act = findNextHeroAction(miners[1], grid, miners, true);
console.log('Act:', act);
