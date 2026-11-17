// ============================================================================
// CANYON GEOMETRY & TRACK CURVE SYSTEM
// 1. Spline dos trilhos curvos seguindo exatamente a ferrovia do mapa oficial
// 2. Cálculo de posição (x, y) e ângulo de rotação tangencial do carrinho
// 3. Detecção precisa de células que cruzam os trilhos e a entrada da mina
// ============================================================================

export const CANYON_TRACK_WAYPOINTS = [
  // 1. Entrada horizontal na esquerda (alinhamento em y=470px, v=0.556)
  { u: -0.060, v: 0.556 },
  { u: 0.000,  v: 0.556 },
  { u: 0.150,  v: 0.556 },
  { u: 0.280,  v: 0.556 },
  { u: 0.330,  v: 0.556 },

  // 2. Curva esquerda subindo ao redor da entrada da mina
  { u: 0.375,  v: 0.533 },
  { u: 0.415,  v: 0.479 },
  { u: 0.435,  v: 0.408 },
  { u: 0.425,  v: 0.337 },
  { u: 0.380,  v: 0.284 },
  { u: 0.325,  v: 0.237 },
  { u: 0.315,  v: 0.166 },
  { u: 0.335,  v: 0.112 },
  { u: 0.380,  v: 0.083 },
  { u: 0.440,  v: 0.065 },

  // 3. Topo horizontal cruzando para a direita
  { u: 0.520,  v: 0.053 },
  { u: 0.640,  v: 0.050 },
  { u: 0.760,  v: 0.050 },
  { u: 0.860,  v: 0.059 },
  { u: 0.930,  v: 0.089 },
  { u: 0.980,  v: 0.148 },
  { u: 1.005,  v: 0.225 },
  { u: 1.000,  v: 0.314 },
  { u: 0.950,  v: 0.402 },

  // 4. Descida da direita em S
  { u: 0.875,  v: 0.491 },
  { u: 0.805,  v: 0.574 },
  { u: 0.745,  v: 0.657 },
  { u: 0.705,  v: 0.740 },
  { u: 0.690,  v: 0.822 },

  // 5. Laço inferior contornando para a saída direita
  { u: 0.710,  v: 0.893 },
  { u: 0.760,  v: 0.917 },
  { u: 0.830,  v: 0.917 },
  { u: 0.900,  v: 0.916 },
  { u: 0.970,  v: 0.912 },
  { u: 1.030,  v: 0.905 },
  { u: 1.070,  v: 0.899 }
];

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (
    (2 * p1) +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  );
}

// Pré-amostragem densa para velocidade perfeitamente constante ao longo de curvas
const DENSE_SAMPLES = 500;
const cachedTrackPoints = [];
let totalArcLength = 0;

(function initDenseTrack() {
  const pts = CANYON_TRACK_WAYPOINTS;
  const rawPoints = [];
  
  for (let i = 0; i <= DENSE_SAMPLES; i++) {
    const p = (pts.length - 1) * (i / DENSE_SAMPLES);
    const idx = Math.floor(p);
    const weight = p - idx;

    const p0 = pts[Math.max(0, idx - 1)];
    const p1 = pts[idx];
    const p2 = pts[Math.min(pts.length - 1, idx + 1)];
    const p3 = pts[Math.min(pts.length - 1, idx + 2)];

    const u = catmullRom(p0.u, p1.u, p2.u, p3.u, weight);
    const v = catmullRom(p0.v, p1.v, p2.v, p3.v, weight);
    rawPoints.push({ u, v });
  }

  // Calcula distâncias acumuladas para parametrização por comprimento de arco
  cachedTrackPoints.push({ u: rawPoints[0].u, v: rawPoints[0].v, dist: 0, angle: 0 });
  for (let i = 1; i < rawPoints.length; i++) {
    const prev = rawPoints[i - 1];
    const curr = rawPoints[i];
    const du = curr.u - prev.u;
    const dv = (curr.v - prev.v) * 0.825; // Correção de aspect ratio
    const segDist = Math.sqrt(du * du + dv * dv);
    totalArcLength += segDist;

    const angle = Math.atan2(curr.v - prev.v, curr.u - prev.u);
    cachedTrackPoints.push({
      u: curr.u,
      v: curr.v,
      dist: totalArcLength,
      angle: angle
    });
  }
})();

/**
 * Retorna posição (x, y) e ângulo de rotação (radianos) do carrinho para um progresso 0..1
 */
export function getCanyonTrackPosition(progress, width, height) {
  const targetDist = Math.max(0, Math.min(1, progress)) * totalArcLength;

  // Busca binária rápida na curva
  let low = 0, high = cachedTrackPoints.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (cachedTrackPoints[mid].dist < targetDist) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const idx = Math.max(0, Math.min(cachedTrackPoints.length - 2, low));
  const p1 = cachedTrackPoints[idx];
  const p2 = cachedTrackPoints[idx + 1] || p1;

  const segLen = (p2.dist - p1.dist) || 0.0001;
  const t = Math.max(0, Math.min(1, (targetDist - p1.dist) / segLen));

  const u = p1.u + (p2.u - p1.u) * t;
  const v = p1.v + (p2.v - p1.v) * t;
  const dx = (p2.u - p1.u) * width;
  const dy = (p2.v - p1.v) * height;
  const angle = Math.atan2(dy, dx);

  return {
    x: u * width,
    y: v * height,
    angle: angle,
    u,
    v
  };
}

/**
 * Determina se a célula (c, r) do grid está sobre os trilhos ou sobre a entrada da mina.
 * Regra: jazidas, pedras e heróis NÃO podem ficar sob os trilhos ou sob a entrada da mina!
 */
export function isCanyonTrackOrTunnel(c, r, cols = 15, rows = 11) {
  // 1. Área da Entrada da Mina (arcos de madeira e pedras da entrada no centro: c=6..10, r=3..6)
  if (c >= 6 && c <= 10 && r >= 3 && r <= 6) return true;

  // 2. Traçado dos Trilhos por Células (Mapeamento exato do traçado curvo da ferrovia):
  // Entrada horizontal à esquerda
  if ((r === 5 || r === 6) && c <= 5) return true;

  // Curva esquerda contornando a mina para cima
  if (r === 4 && (c >= 4 && c <= 6)) return true;
  if (r === 3 && (c >= 4 && c <= 6)) return true;
  if (r === 2 && (c >= 3 && c <= 5)) return true;
  if (r === 1 && (c >= 3 && c <= 6)) return true;

  // Curva superior cruzando para a direita
  if (r === 0 && (c >= 4 && c <= 14)) return true;
  if (r === 1 && (c >= 12 && c <= 14)) return true;

  // Curva direita descendo
  if (r === 2 && (c >= 13 && c <= 14)) return true;
  if (r === 3 && (c >= 13 && c <= 14)) return true;
  if (r === 4 && (c >= 12 && c <= 14)) return true;
  if (r === 5 && (c >= 11 && c <= 13)) return true;
  if (r === 6 && (c >= 10 && c <= 12)) return true;

  // Curva inferior direita fazendo o laço/curva
  if (r === 7 && (c >= 9 && c <= 11)) return true;
  if (r === 8 && (c >= 9 && c <= 13)) return true;
  if (r === 9 && (c >= 10 && c <= 14)) return true;
  if (r === 10 && (c >= 11 && c <= 14)) return true;

  // 3. Verificação contínua adicional pela spline
  const cu = (c + 0.5) / cols;
  const cv = (r + 0.5) / rows;
  for (let i = 0; i < cachedTrackPoints.length; i += 2) {
    const pt = cachedTrackPoints[i];
    const du = (cu - pt.u);
    const dv = (cv - pt.v) * 0.825;
    if (du * du + dv * dv < 0.0055) {
      return true;
    }
  }

  return false;
}
