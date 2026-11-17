const { Jimp, rgbaToInt } = require('jimp');

// Original waypoints in canyonGeometry.js:
const waypoints = [
  { u: -0.06, v: 0.535 },
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
  { u: 1.06, v: 0.895 }
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
  const p = (pts.length - 1) * progress;
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

async function testTrackAlignment() {
  const map = await Jimp.read('public/canyon_mine_map.png');
  const w = map.bitmap.width;
  const h = map.bitmap.height;
  console.log(`Map: ${w}x${h}`);

  // Let's draw the current spline as a bright magenta line (width 3)
  for (let step = 0; step <= 800; step++) {
    const pt = getSplinePoint(waypoints, step / 800);
    const px = Math.round(pt.u * w);
    const py = Math.round(pt.v * h);
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const x = px + dx;
        const y = py + dy;
        if (x >= 0 && x < w && y >= 0 && y < h) {
          map.setPixelColor(rgbaToInt(255, 0, 255, 255), x, y);
        }
      }
    }
  }

  // Draw waypoint handles as large cyan circles (radius 6)
  for (let i = 0; i < waypoints.length; i++) {
    const wp = waypoints[i];
    const cx = Math.round(wp.u * w);
    const cy = Math.round(wp.v * h);
    for (let dy = -5; dy <= 5; dy++) {
      for (let dx = -5; dx <= 5; dx++) {
        if (dx * dx + dy * dy <= 25) {
          const x = cx + dx;
          const y = cy + dy;
          if (x >= 0 && x < w && y >= 0 && y < h) {
            map.setPixelColor(rgbaToInt(0, 255, 255, 255), x, y);
          }
        }
      }
    }
  }

  await map.write('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/spline_calibration_check.png');
  console.log('Saved spline_calibration_check.png');
}

testTrackAlignment().catch(console.error);
