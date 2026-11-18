import { isCityObstacle, GRID_COLS, GRID_ROWS } from '../src/utils/cityMapGeometry.js';

// Visualiza o grid
console.log('Grid 15 cols x 11 rows:');
for (let r = 0; r < GRID_ROWS; r++) {
  let s = '';
  for (let c = 0; c < GRID_COLS; c++) {
    s += isCityObstacle(c, r) ? 'X ' : '. ';
  }
  console.log(`r=${r}: ${s}`);
}
