import { isCityObstacle, GRID_COLS, GRID_ROWS, SAFE_HERO_SPAWN_POINTS } from '../src/utils/cityMapGeometry.js';
import { isSolidTerrain, findNextHeroAction } from '../src/utils/minerPathfinding.js';
import { BLOCK_EMPTY, BLOCK_BEDROCK, BLOCK_ZOMBIE, BLOCK_BOSS } from '../src/data/minersData.js';
import { generatePlayerMap } from '../src/utils/individualMapEngine.js';

console.log('=== MAP WALKABILITY GRID ===');
for (let r = 0; r < GRID_ROWS; r++) {
  let s = '';
  for (let c = 0; c < GRID_COLS; c++) {
    s += isCityObstacle(c, r) ? '#' : '.';
  }
  console.log(r.toString().padStart(2, '0') + ' ' + s);
}

console.log('\n=== TESTING PATHFINDING WITH GENERATED MAP ===');
const mapData = generatePlayerMap('test_player', 1);
console.log('Generated deposits count:', mapData.deposits.length);

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

console.log('\nDeposits positions:');
mapData.deposits.forEach((d, i) => {
  console.log(`Deposit ${i}: (${d.c}, ${d.r}) type=${d.type}`);
});

console.log('\nSimulating 15 heroes over 30 steps:');
const miners = SAFE_HERO_SPAWN_POINTS.slice(0, 15).map((spawn, idx) => ({
  id: `miner_${idx}`,
  x: spawn.x,
  y: spawn.y,
  classId: 'common',
  speed: 1,
  targetDir: 1,
  targetBlock: null,
  isMining: false
}));

for (let step = 1; step <= 30; step++) {
  let miningCount = 0;
  let movingCount = 0;
  let idleCount = 0;

  miners.forEach(m => {
    // If mining, check if target block still exists
    if (m.targetBlock) {
      const isAdj = Math.max(Math.abs(m.targetBlock.x - m.x), Math.abs(m.targetBlock.y - m.y)) === 1;
      const b = grid[m.targetBlock.y]?.[m.targetBlock.x];
      if (b === BLOCK_EMPTY || b === BLOCK_BEDROCK || !isAdj) {
        m.targetBlock = null;
        m.isMining = false;
      }
    }

    if (!m.targetBlock || !m.isMining) {
      const decision = findNextHeroAction(m, grid, miners, true);
      if (decision.action === 'mine' && decision.targetBlock) {
        m.targetBlock = decision.targetBlock;
        m.isMining = true;
      } else if (decision.action === 'move' && decision.nextStep) {
        m.x = decision.nextStep.x;
        m.y = decision.nextStep.y;
        if (decision.nextStep.dir) m.targetDir = decision.nextStep.dir;
      } else {
        // idle
      }
    }

    if (m.isMining) miningCount++;
    else if (m.targetBlock) movingCount++;
    else idleCount++;
  });

  if (step % 5 === 0 || step === 1) {
    console.log(`Step ${step}: ${miningCount} mining, ${movingCount} moving towards target, ${idleCount} idle`);
    if (idleCount > 0) {
      miners.filter(m => !m.isMining && !m.targetBlock).forEach(m => {
        console.log(`  Stuck miner ${m.id} at (${m.x}, ${m.y})`);
      });
    }
  }
}
