import { getValidDepositCells } from '../src/utils/individualMapEngine.js';
import { isCityObstacle } from '../src/utils/cityMapGeometry.js';

const cells = getValidDepositCells();
console.log('Total valid cells for deposits:', cells.length);

const northCells = cells.filter(c => c.r <= 3);
console.log('North cells (r <= 3):', northCells);
