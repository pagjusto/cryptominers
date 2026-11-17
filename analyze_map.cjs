const { Jimp } = require('jimp');

async function test() {
  const img = await Jimp.read('public/canyon_mine_map.png');
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  console.log('Loaded:', w, 'x', h);

  const cols = 15;
  const rows = 11;
  const tileW = w / cols;
  const tileH = h / rows;

  // Steel rail has distinctive bluish-gray color:
  // e.g., r ~ 70-130, g ~ 90-140, b ~ 110-170 with b > r
  // Dark tunnel has very low brightness < 60
  // Dirt ground has r > 180, g ~ 130-160, b ~ 70-110 (warm orange/brown, r > g > b)

  const mapGrid = [];

  for (let r = 0; r < rows; r++) {
    let rowTypes = [];
    for (let c = 0; c < cols; c++) {
      let railScore = 0;
      let tunnelScore = 0;
      let samples = 0;

      for (let dy = 0.1; dy <= 0.9; dy += 0.15) {
        for (let dx = 0.1; dx <= 0.9; dx += 0.15) {
          const px = Math.floor((c + dx) * tileW);
          const py = Math.floor((r + dy) * tileH);
          const color = img.getPixelColor(px, py);
          const red = (color >> 24) & 255;
          const green = (color >> 16) & 255;
          const blue = (color >> 8) & 255;
          const lum = 0.299 * red + 0.587 * green + 0.114 * blue;

          // Rail test: steel rail or wooden tie
          // Steel rail: blue >= red - 10 and lum between 80 and 180 and saturation moderate
          // Wooden tie: dark reddish brown (red: 90-140, green: 50-80, blue: 25-50)
          const isSteel = (blue > red - 5 && lum > 70 && lum < 180);
          const isWoodTie = (red > 70 && red < 150 && green < 90 && blue < 65);
          if (isSteel || isWoodTie) railScore++;

          // Tunnel test: dark interior
          if (lum < 55) tunnelScore++;
          samples++;
        }
      }

      const railRatio = railScore / samples;
      const tunnelRatio = tunnelScore / samples;

      if (tunnelRatio > 0.15) {
        rowTypes.push('T'); // Tunnel
      } else if (railRatio > 0.12) {
        rowTypes.push('R'); // Rail
      } else {
        rowTypes.push('.'); // Dirt
      }
    }
    console.log(`r=${r.toString().padStart(2, ' ')}: ` + rowTypes.join(' '));
    mapGrid.push(rowTypes);
  }
}

test().catch(err => console.error(err));
