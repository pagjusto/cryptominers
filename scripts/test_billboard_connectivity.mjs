import { isCityObstacle, GRID_COLS, GRID_ROWS } from '../src/utils/cityMapGeometry.js';

function testGridWithBillboard(billboardCols, billboardRows) {
  const obstacleGrid = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    const row = [];
    for (let c = 0; c < GRID_COLS; c++) {
      let isObs = isCityObstacle(c, r);
      if (billboardCols.includes(c) && billboardRows.includes(r)) {
        isObs = true;
      }
      row.push(isObs);
    }
    obstacleGrid.push(row);
  }

  // Count open cells
  let openCells = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (!obstacleGrid[r][c]) {
        openCells.push({ c, r });
      }
    }
  }

  // BFS flood-fill from first open cell
  const start = openCells[0];
  const visited = new Set();
  const queue = [start];
  visited.add(`${start.c},${start.r}`);

  const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  while (queue.length > 0) {
    const curr = queue.shift();
    for (const [dc, dr] of DIRS) {
      const nc = curr.c + dc;
      const nr = curr.r + dr;
      if (nc >= 0 && nc < GRID_COLS && nr >= 0 && nr < GRID_ROWS && !obstacleGrid[nr][nc]) {
        const key = `${nc},${nr}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ c: nc, r: nr });
        }
      }
    }
  }

  console.log(`Testing billboard at cols ${JSON.stringify(billboardCols)}, rows ${JSON.stringify(billboardRows)}:`);
  console.log(`Total open cells: ${openCells.length}, Reachable cells: ${visited.size}`);
  console.log(`Connected: ${visited.size === openCells.length ? 'YES (100% SINGLE COMPONENT)' : 'NO (PARTITIONED!)'}`);
}

testGridWithBillboard([6, 7, 8], [0, 1]);
testGridWithBillboard([6, 7, 8, 9], [0, 1]);
testGridWithBillboard([6, 7, 8], [1, 2]);
testGridWithBillboard([6, 7, 8, 9], [1, 2]);
testGridWithBillboard([6, 7, 8, 9], [0, 1, 2]);
