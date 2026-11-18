import { isCityObstacle, GRID_COLS, GRID_ROWS } from '../src/utils/cityMapGeometry.js';

console.log('=== FLOOD FILL CONNECTIVITY CHECK ===');
const visited = new Set();
// Find first walkable cell
let start = null;
for (let r = 0; r < GRID_ROWS; r++) {
  for (let c = 0; c < GRID_COLS; c++) {
    if (!isCityObstacle(c, r)) {
      start = { c, r };
      break;
    }
  }
  if (start) break;
}

const queue = [start];
visited.add(`${start.c},${start.r}`);

while (queue.length > 0) {
  const curr = queue.shift();
  const dirs = [
    { c: curr.c + 1, r: curr.r },
    { c: curr.c - 1, r: curr.r },
    { c: curr.c, r: curr.r + 1 },
    { c: curr.c, r: curr.r - 1 }
  ];
  for (const d of dirs) {
    if (d.c >= 0 && d.c < GRID_COLS && d.r >= 0 && d.r < GRID_ROWS) {
      const key = `${d.c},${d.r}`;
      if (!visited.has(key) && !isCityObstacle(d.c, d.r)) {
        visited.add(key);
        queue.push(d);
      }
    }
  }
}

let unreachable = [];
for (let r = 0; r < GRID_ROWS; r++) {
  for (let c = 0; c < GRID_COLS; c++) {
    if (!isCityObstacle(c, r) && !visited.has(`${c},${r}`)) {
      unreachable.push({ c, r });
    }
  }
}

console.log('Total walkable cells in connected component:', visited.size);
console.log('Unreachable walkable cells count:', unreachable.length);
if (unreachable.length > 0) {
  console.log('Unreachable cells:', unreachable);
}
