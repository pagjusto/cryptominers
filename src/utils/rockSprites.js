// ============================================================================
// ROCK & DEPOSIT SPRITE MANAGER
// 1. Pedra Comum Oficial (stone_original.png enviada pelo usuário)
// 2. Jazida de Ouro (deposit_gold_nuggets.png - pedras e pepitas de ouro amarelo)
// 3. Jazida de Diamante Azul (deposit_diamond_source.png - cristais convertidos para azul safira)
// 4. Jazida de Esmeralda (deposit_emerald_user.png - cristais verdes de esmeralda)
// NOTA: Cobre/Bronze 100% removido do jogo conforme solicitado
// ============================================================================

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

class RockSpriteManager {
  constructor() {
    this.loaded = false;
    this.sprites = {};
    this.loadPromise = null;
  }

  init(onReady) {
    if (this.loaded) {
      if (onReady) onReady();
      return;
    }

    if (this.loadPromise) {
      this.loadPromise.then(() => {
        if (onReady) onReady();
      });
      return;
    }

    this.loadPromise = this.loadAllSprites().then(() => {
      this.loaded = true;
      if (onReady) onReady();
    }).catch(err => {
      console.error('Erro ao carregar sprites de rochas e jazidas:', err);
    });
  }

  reload(onReady) {
    this.loaded = false;
    this.loadPromise = null;
    this.sprites = {};
    return this.init(onReady);
  }

  async loadAllSprites() {
    const v = Date.now();
    // 1. Carrega a pedra comum original do usuário (/stone_original.png)
    const commonRock = await this.loadCommonRockOriginal(`/stone_original.png?v=${v}`);
    this.sprites.rock = commonRock;
    this.sprites.bedrock = commonRock;

    // 2. Carrega as jazidas enviadas pelo usuário com cache busting explícito
    const [goldNuggets, diamondBlue, emeraldUser, heroChestImg] = await Promise.all([
      this.loadCroppedPng(`/deposits/deposit_gold_nuggets.png?v=${v}`),          // Pepitas de Ouro amareladas
      this.loadBlueDiamondImage(`/deposits/deposit_diamond_source.png?v=${v}`), // Cristais em Diamante Azul
      this.loadCroppedPng(`/deposits/deposit_emerald_user.png?v=${v}`),         // Cristais de Esmeralda Verde
      this.loadCroppedPng(`/items/hero_chest.png?v=${v}`)                      // Baú de Herói Oficial
    ]);

    this.sprites.gold = goldNuggets;
    this.sprites.common = null;      // Cobre/Bronze 100% REMOVIDO do jogo
    this.sprites.crystal = diamondBlue;  // Diamante Azul Safira
    this.sprites.emerald = emeraldUser || diamondBlue; // Esmeralda Verde
    this.sprites.chest = heroChestImg || this.createMysticChestSprite(); // Baú Místico Oficial
  }

  // Gera sprite vetorial nítido de Baú Místico de Tesouro
  createMysticChestSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 44;
    const ctx = canvas.getContext('2d');

    // Corpo de madeira
    const woodGrad = ctx.createLinearGradient(0, 14, 0, 42);
    woodGrad.addColorStop(0, '#b45309');
    woodGrad.addColorStop(0.5, '#78350f');
    woodGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = woodGrad;
    ctx.strokeStyle = '#1e1b18';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(4, 14, 40, 26, 3);
    ctx.fill();
    ctx.stroke();

    // Tampa arredondada abaulada
    const lidGrad = ctx.createLinearGradient(0, 4, 0, 18);
    lidGrad.addColorStop(0, '#d97706');
    lidGrad.addColorStop(0.7, '#92400e');
    lidGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = lidGrad;
    ctx.beginPath();
    ctx.ellipse(24, 14, 20, 10, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cintas de Aço/Ouro com rebites
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.fillRect(10, 5, 5, 35);
    ctx.strokeRect(10, 5, 5, 35);
    ctx.fillRect(33, 5, 5, 35);
    ctx.strokeRect(33, 5, 5, 35);

    // Fechadura Dourada com Olho Místico
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(20, 15, 8, 11, 2);
    ctx.fill();
    ctx.stroke();

    // Orifício da chave
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(24, 19, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(23.2, 19, 1.6, 4);

    // Gema de Rubi reluzente na tampa
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(24, 9, 2.5, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  }

  // Recorta bordas vazias transparentes para o sprite preencher a célula com nitidez
  cropCanvasBounds(canvas) {
    const w = canvas.width;
    const h = canvas.height;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let minX = w, maxX = 0, minY = h, maxY = 0;
    let found = false;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const a = data[idx + 3];
        if (a > 25) {
          found = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!found) return canvas;

    const cropW = Math.max(1, maxX - minX + 1);
    const cropH = Math.max(1, maxY - minY + 1);

    const outCanvas = document.createElement('canvas');
    outCanvas.width = cropW;
    outCanvas.height = cropH;
    const outCtx = outCanvas.getContext('2d');
    outCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
    return outCanvas;
  }

  // Carrega e processa a nova jazida de pedra na cor do chão do mapa
  loadCommonRockOriginal(src = '/stone_original.png') {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Recorta bordas vazias transparentes para centralizar com máxima nitidez
        const cropped = this.cropCanvasBounds(canvas);
        resolve(cropped);
      };

      img.onerror = () => {
        console.error('Falha ao carregar /stone_original.png');
        resolve(null);
      };
    });
  }

  // Carrega PNG com fundo transparente ou branco residual e recorta perfeitamente
  loadCroppedPng(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Remove qualquer pixel branco de contorno residual
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (r > 242 && g > 242 && b > 242) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);

        const cropped = this.cropCanvasBounds(canvas);
        resolve(cropped);
      };

      img.onerror = () => {
        console.error('Falha ao carregar PNG:', src);
        resolve(null);
      };
    });
  }

  // Carrega os cristais e converte as facetas de verde para DIAMANTE AZUL SAFIRA
  loadBlueDiamondImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;

      img.onload = () => {
        const w = img.width;
        const h = img.height;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Converte as facetas verdes do cristal para DIAMANTE AZUL SAFIRA
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 30) continue;

          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Fundo branco residual
          if (r > 242 && g > 242 && b > 242) {
            data[i + 3] = 0;
            continue;
          }

          const [h, s, l] = rgbToHsl(r, g, b);

          // Se for tonalidade de cristal verde/esmeralda
          if (s > 0.10 && h >= 0.15 && h <= 0.48) {
            // Mapeia para azul safira radiante (~207°)
            const targetHue = 0.575;
            const newS = Math.min(1, s * 1.15);
            const [newR, newG, newB] = hslToRgb(targetHue, newS, l);
            data[i] = newR;
            data[i + 1] = newG;
            data[i + 2] = newB;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const cropped = this.cropCanvasBounds(canvas);
        resolve(cropped);
      };

      img.onerror = () => {
        console.error('Falha ao carregar diamante azul:', src);
        resolve(null);
      };
    });
  }
}

export const rockSpriteManager = new RockSpriteManager();
