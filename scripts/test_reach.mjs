import { isCityObstacle, GRID_COLS, GRID_ROWS, SAFE_HERO_SPAWN_POINTS } from '../src/utils/cityMapGeometry.js';
import { isSolidTerrain, findNextHeroAction } from '../src/utils/minerPathfinding.js';
import { BLOCK_EMPTY, BLOCK_BEDROCK, BLOCK_ZOMBIE, BLOCK_BOSS } from '../src/data/minersData.js';
import { generatePlayerMap } from '../src/utils/individualMapEngine.js';

for (let seed = 1; seed <= 10; seed++) {
  const mapData = generatePlayerMap('player_' + seed, seed);
  const grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(BLOCK_EMPTY));
  mapData.deposits.forEach(d => {
    grid[d.r][d.c] = d.type === 'boss' ? BLOCK_BOSS : BLOCK_ZOMBIE;
  });

  // Check each hero spawn
  SAFE_HERO_SPAWN_POINTS.forEach((spawn, idx) => {
    const miner = {
      id: `m_${idx}`,
      x: spawn.x,
      y: spawn.y,
      speed: 1,
      targetDir: 1
    };
    const act = findNextHeroAction(miner, grid, [miner], true);
    if (act.action === 'idle') {
      console.log(`[Seed ${seed}] Miner at (${spawn.x}, ${spawn.y}) is IDLE!`);
    }
  });
}
console.log('Done 10 seeds test.');
