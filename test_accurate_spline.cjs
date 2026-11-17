const { Jimp, rgbaToInt } = require('jimp');

const accurateWaypoints = [
  // 1. Horizontal entry on left
  { u: -0.06, v: 0.556 },
  { u: 0.00,  v: 0.556 },
  { u: 0.15,  v: 0.556 },
  { u: 0.28,  v: 0.556 },
  { u: 0.335, v: 0.552 },

  // 2. Curve around left of tunnel entrance
  { u: 0.370, v: 0.533 },
  { u: 0.405, v: 0.485 },
  { u: 0.418, v: 0.414 },
  { u: 0.418, v: 0.331 },
  { u: 0.395, v: 0.243 },
  { u: 0.350, v: 0.172 },
  { u: 0.325, v: 0.124 },
  { u: 0.350, v: 0.089 },
  { u: 0.405, v: 0.071 },

  // 3. Top curve going across to the right
  { u: 0.490, v: 0.057 },
  { u: 0.635, v: 0.050 },
  { u: 0.765, v: 0.050 },
  { u: 0.860, v: 0.071 },
  { u: 0.925, v: 0.118 },
  { u: 0.965, v: 0.189 },

  // 4. Right side curve descending
  { u: 0.985, v: 0.272 },
  { u: 0.965, v: 0.367 },
  { u: 0.910, v: 0.473 },
  { u: 0.835, v: 0.580 },
  { u: 0.765, v: 0.675 },
  { u: 0.710, v: 0.763 },

  // 5. Bottom loop curving around to right exit
  { u: 0.685, v: 0.840 },
  { u: 0.700, v: 0.899 },
  { u: 0.745, v: 0.929 },
  { u: 0.815, v: 0.935 },
  { u: 0.885, v: 0.932 },
  { u: 0.950, v: 0.925 },
  { u: 1.015, v: 0.917 },
  { u: 1.065, v: 0.911 }
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

async function testAccurateSpline() {
  const map = await Jimp.read('public/canyon_mine_map.png');
  const w = map.bitmap.width;
  const h = map.bitmap.height;

  // Draw continuous red line of width 3 along spline
  for (let step = 0; step <= 1200; step++) {
    const pt = getSplinePoint(accurateWaypoints, step / 1200);
    const px = Math.round(pt.u * w);
    const py = Math.round(pt.v * h);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = px + dx;
        const y = py + dy;
        if (x >= 0 && x < w && y >= 0 && y < h) {
          map.setPixelColor(rgbaToInt(255, 0, 0, 255), x, y);
        }
      }
    }
  }

  await map.write('C:/Users/pagju/.gemini/antigravity/brain/51ab78cf-f6ff-4793-9e3a-bcf5e180dec7/accurate_track_spline.png');
  console.log('Saved accurate_track_spline.png');
}

testAccurateSpline().catch(console.error);
