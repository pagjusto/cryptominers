const { Jimp } = require('jimp');

const waypoints = [
  { u: -0.05, v: 0.535 },
  { u: 0.00, v: 0.535 },
  { u: 0.15, v: 0.535 },
  { u: 0.28, v: 0.535 },
  { u: 0.36, v: 0.505 },
  { u: 0.415, v: 0.42 },
  { u: 0.41, v: 0.31 },
  { u: 0.34, v: 0.21 },
  { u: 0.295, v: 0.15 },
  { u: 0.345, v: 0.095 },
  { u: 0.44, v: 0.065 },
  { u: 0.59, v: 0.045 },
  { u: 0.74, v: 0.05 },
  { u: 0.87, v: 0.085 },
  { u: 0.955, v: 0.155 },
  { u: 0.985, v: 0.25 },
  { u: 0.965, v: 0.36 },
  { u: 0.90, v: 0.47 },
  { u: 0.81, v: 0.56 },
  { u: 0.73, v: 0.64 },
  { u: 0.675, v: 0.725 },
  { u: 0.67, v: 0.815 },
  { u: 0.74, v: 0.88 },
  { u: 0.85, v: 0.915 },
  { u: 0.97, v: 0.905 },
  { u: 1.05, v: 0.895 }
];

function getSplinePoint(points, t) {
  const p = (points.length - 1) * t;
  const intPoint = Math.floor(p);
  const weight = p - intPoint;

  const p0 = points[Math.max(0, intPoint - 1)];
  const p1 = points[intPoint];
  const p2 = points[Math.min(points.length - 1, intPoint + 1)];
  const p3 = points[Math.min(points.length - 1, intPoint + 2)];

  const u = 0.5 * (
    (2 * p1.u) +
    (-p0.u + p2.u) * weight +
    (2 * p0.u - 5 * p1.u + 4 * p2.u - p3.u) * weight * weight +
    (-p0.u + 3 * p1.u - 3 * p2.u + p3.u) * weight * weight * weight
  );

  const v = 0.5 * (
    (2 * p1.v) +
    (-p0.v + p2.v) * weight +
    (2 * p0.v - 5 * p1.v + 4 * p2.v - p3.v) * weight * weight +
    (-p0.v + 3 * p1.v - 3 * p2.v + p3.v) * weight * weight * weight
  );

  return { u, v };
}

// Generate dense spline points
const denseTrack = [];
for (let i = 0; i <= 500; i++) {
  denseTrack.push(getSplinePoint(waypoints, i / 500));
}

function isTrackOrTunnel(c, r) {
  const cu = (c + 0.5) / 15;
  const cv = (r + 0.5) / 11;

  // Tunnel bounds (center entrance)
  if (cu >= 0.46 && cu <= 0.76 && cv >= 0.28 && cv <= 0.62) {
    return 'TUNNEL';
  }

  // Distance to track centerline
  for (const pt of denseTrack) {
    const du = (cu - pt.u) * 1.0;
    const dv = (cv - pt.v) * 0.825; // Aspect correction
    const dist = Math.sqrt(du * du + dv * dv);
    if (dist < 0.065) {
      return 'TRACK';
    }
  }

  return 'OPEN';
}

async function renderCheck() {
  const img = await Jimp.read('public/canyon_mine_map.png');
  const w = img.bitmap.width;
  const h = img.bitmap.height;

  const cols = 15, rows = 11;
  const tw = w / cols, th = h / rows;

  console.log('15x11 Grid Map Status:');
  for (let r = 0; r < rows; r++) {
    let str = '';
    for (let c = 0; c < cols; c++) {
      const status = isTrackOrTunnel(c, r);
      if (status === 'TUNNEL') str += ' [T]';
      else if (status === 'TRACK') str += ' [R]';
      else str += '  . ';

      // Draw bounding box on image
      const x0 = Math.floor(c * tw);
      const y0 = Math.floor(r * th);
      const color = status === 'TRACK' ? 0x00FF0088 : (status === 'TUNNEL' ? 0x0000FF88 : 0xFFFF0088);
      // Mark center
      const cx = Math.floor((c + 0.5) * tw);
      const cy = Math.floor((r + 0.5) * th);
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (cx+dx >= 0 && cx+dx < w && cy+dy >= 0 && cy+dy < h) {
            img.setPixelColor(color, cx+dx, cy+dy);
          }
        }
      }
    }
    console.log(`r=${r.toString().padStart(2, ' ')}: ` + str);
  }

  await img.write('test_grid_allocation.png');
  console.log('Grid allocation saved to test_grid_allocation.png');
}

renderCheck().catch(err => console.error(err));
