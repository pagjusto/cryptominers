import { isCityObstacleFixed } from './test_connectivity.mjs';

const SAFE_POINTS = [
  // Estrada Oeste
  { x: 1, y: 4 }, { x: 2, y: 5 }, { x: 1, y: 6 }, { x: 2, y: 6 },
  // Gramado Sudoeste
  { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 9 }, { x: 2, y: 9 },
  // Acesso Norte / Gramado Noroeste
  { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 4, y: 1 }, { x: 5, y: 1 },
  // Estrada Leste
  { x: 12, y: 4 }, { x: 12, y: 5 }, { x: 12, y: 6 }, { x: 13, y: 6 },
  // Pátio Sul e Gramado Sul
  { x: 7, y: 8 }, { x: 8, y: 8 }, { x: 6, y: 9 }, { x: 7, y: 9 }
];

console.log('Testando pontos seguros de spawn:');
let allValid = true;
SAFE_POINTS.forEach((pt, idx) => {
  const inBounds = pt.x >= 1 && pt.x <= 13 && pt.y >= 1 && pt.y <= 9;
  const isObs = isCityObstacleFixed(pt.x, pt.y);
  if (!inBounds || isObs) {
    console.log(`Ponto #${idx} inválido: (${pt.x}, ${pt.y}) - inBounds: ${inBounds}, isObs: ${isObs}`);
    allValid = false;
  }
});
if (allValid) {
  console.log('✅ TODOS OS 20 PONTOS DE SPAWN SÃO 100% VÁLIDOS E LIVRES!');
}
