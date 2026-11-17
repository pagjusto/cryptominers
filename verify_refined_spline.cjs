const { Jimp, rgbaToInt } = require('jimp');

const refinedWaypoints = [
  // 1. Horizontal entry on left (dead center between the two rails at y=470, v=0.556)
  { u: -0.06, v: 0.556 },
  { u: 0.00,  v: 0.556 },
  { u: 0.15,  v: 0.556 },
  { u: 0.28,  v: 0.556 },
  { u: 0.34,  v: 0.550 },

  // 2. Loop curving UP and around the left of the tunnel entrance
  { u: 0.395, v: 0.525 },
  { u: 0.435, v: 0.445 },
  { u: 0.442, v: 0.340 },
  { u: 0.410, v: 0.235 },
  { u: 0.355, v: 0.155 },
  { u: 0.335, v: 0.105 },
  { u: 0.370, v: 0.075 },
  { u: 0.430, v: 0.060 },

  // 3. Top curve going across to the right
  { u: 0.520, v: 0.050 },
  { u: 0.650, v: 0.045 },
  { u: 0.780, v: 0.045 },
  { u: 0.880, v: 0.065 },
  { u: 0.945, v: 0.115 },
  { u: 0.985, v: 0.185 },

  // 4. Right side curve descending diagonally towards center-bottom
  { u: 1.002, v: 0.265 },
  { u: 0.980, v: 0.355 },
  { u: 0.925, v: 0.450 },
  { u: 0.845, v: 0.545 },
  { u: 0.770, v: 0.635 },
  { u: 0.718, v: 0.715 },

  // 5. Bottom loop curving around to the right exit
  { u: 0.690, v: 0.795 },
  { u: 0.705, v: 0.865 },
  { u: 0.755, v: 0.915 },
  { u: 0.830, v: 0.932 },
  { u: 0.910, v: 0.930 },
  { u: 0.980, v: 0.922 },
  { u: 1.060, v: 0.910 }
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

function getSplinePoint(pts, progress) {
  const p = (pts.length - 1) * Math.max(0, Math.min(1, progress));
  const idx = Math.floor(p);
  const weight = p - idx;

  const p0 = pts[Math.max(0, idx - 1)];
  const p1 = pts[idx];
  const p2 = pts[Math.min(pts.length - 1, idx + 1)];
  const p3 = pts[Math.min(pts.length - 1, idx + 2)];

  const u = catmullRom(p0.u, p1.u, p2.u, p3.u, weight);
  const v = catmullRom(p0.v, p1.v, p2.v, p3.v, weight);
  return { u, v };
}

async function verifyRefinedSpline() {
  const map = await Jimp.read('public/canyon_mine_map.png');
  const w = map.bitmap.width;
  const h = map.bitmap.height;

  // Draw continuous bright green line along the refined spline
  for (let step = 0; step <= 1000; step++) {
    const pt = getSplinePoint(refinedWaypoints, step / 1000);
    const px = Math.round(pt.u * w);
    const py = Math.round(pt.v * h);
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const x = px + dx;
        const y = py + dy;
        if (x >= 0 && x < w && y >= 0 && y < h) {
          map.setPixelColor(rgbaToInt(0, 255, 0, 255), x, y);
        }
      }
    }
  }

  // Draw refined waypoints as red circles (radius 4)
  for (let i = 0; i < refinedWaypoints.length; i++) {
    const wp = refinedWaypoints[i];
    const cx = Math.round(wp.u * w);
    const cy = Math.round(wp.v * h);
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < w && y >= 0 && y < h) {
          map.setPixelColor(rgbaToInt(255, 0, 0, 255), x, y);
        }
      }
    }
  }

  await map.write('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/spline_refined_perfect.png');
  console.log('Saved spline_refined_perfect.png');
}

verifyRefinedSpline().catch(console.error);
