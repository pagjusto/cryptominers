const { Jimp } = require('jimp');

function getSplinePoint(points, t) {
  const p = (points.length - 1) * t;
  const intPoint = Math.floor(p);
  const weight = p - intPoint;

  const p0 = points[Math.max(0, intPoint - 1)];
  const p1 = points[intPoint];
  const p2 = points[Math.min(points.length - 1, intPoint + 1)];
  const p3 = points[Math.min(points.length - 1, intPoint + 2)];

  // Catmull-Rom spline
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

async function testSpline() {
  const img = await Jimp.read('public/canyon_mine_map.png');
  const w = img.bitmap.width;
  const h = img.bitmap.height;

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

  // Draw continuous green line along the spline
  for (let step = 0; step <= 400; step++) {
    const t = step / 400;
    const pt = getSplinePoint(waypoints, t);
    const cx = Math.floor(pt.u * w);
    const cy = Math.floor(pt.v * h);
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const px = cx + c;
        const py = cy + r;
        if (px >= 0 && px < w && py >= 0 && py < h) {
          img.setPixelColor(0x00FF00FF, px, py);
        }
      }
    }
  }

  await img.write('test_spline_result.png');
  console.log('Spline drawn to test_spline_result.png');
}

testSpline().catch(err => console.error(err));
