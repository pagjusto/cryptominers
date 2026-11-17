// Gerenciador de Sprites Recortados Transparentes (Opção B - Cutouts Estilo Sticker/Brawl Stars)
// Remove o fundo das ilustrações, aplica contorno estilizado da classe e prepara o sprite recortado

class CharacterSpriteManager {
  constructor() {
    this.loaded = false;
    this.cutouts = {};
  }

  init(onReady) {
    if (this.loaded) {
      if (onReady) onReady();
      return;
    }

    const rosterMap = {
      miner: '/miners/bomb_bot.jpg',
      brute: '/miners/viking.jpg',
      goblin: '/miners/frog_ninja.jpg',
      engineer: '/miners/witch.jpg',
      mage: '/miners/vampire.jpg',
      legendary: '/miners/golem.jpg'
    };

    const rarityColors = {
      miner: '#38bdf8',
      brute: '#f97316',
      goblin: '#22c55e',
      engineer: '#eab308',
      mage: '#a855f7',
      legendary: '#ec4899'
    };

    const keys = Object.keys(rosterMap);
    let loadedCount = 0;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount >= keys.length) {
        this.loaded = true;
        if (onReady) onReady();
      }
    };

    keys.forEach((cid) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = rosterMap[cid];

      img.onload = () => {
        try {
          this.cutouts[cid] = this.processCutoutSprite(img, rarityColors[cid] || '#38bdf8');
        } catch (e) {
          console.error('Erro ao processar sprite do herói:', cid, e);
        }
        checkComplete();
      };

      img.onerror = () => {
        checkComplete();
      };
    });
  }

  // Processa o recorte da silhueta do herói com remoção de fundo e borda iluminada
  processCutoutSprite(img, outlineColor) {
    const size = 128; // Resolução do sprite recortado
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // 1. Desenha a imagem centralizada no canvas de trabalho
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, size, size);

    // 2. Extrai pixels para remover fundo escuro / bordas externas
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    // Coleta média de cor dos 4 cantos para identificar o fundo da vinheta
    const cornerIndices = [
      0, // top-left
      (size - 1) * 4, // top-right
      ((size - 1) * size) * 4, // bottom-left
      ((size - 1) * size + (size - 1)) * 4 // bottom-right
    ];

    let bgR = 0, bgG = 0, bgB = 0;
    cornerIndices.forEach(idx => {
      bgR += data[idx];
      bgG += data[idx + 1];
      bgB += data[idx + 2];
    });
    bgR = Math.round(bgR / 4);
    bgG = Math.round(bgG / 4);
    bgB = Math.round(bgB / 4);

    const center = size / 2;
    const maxRadius = size * 0.46;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Distância do centro
        const dx = x - center;
        const dy = y - (center - 2); // Leve ajuste para focar o rosto/busto
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Distância da cor do fundo do canto
        const colorDist = Math.sqrt(
          (r - bgR) * (r - bgR) +
          (g - bgG) * (g - bgG) +
          (b - bgB) * (b - bgB)
        );

        // Se estiver fora do raio do herói ou muito escuro/parecido com o fundo da caverna
        if (dist > maxRadius) {
          data[i + 3] = 0; // 100% transparente
        } else if (dist > maxRadius - 4) {
          // Fade suave na borda externa
          const edgeAlpha = Math.max(0, 1 - (dist - (maxRadius - 4)) / 4);
          data[i + 3] = Math.round(data[i + 3] * edgeAlpha);
        } else if (colorDist < 38 && (r < 40 && g < 40 && b < 40)) {
          // Remove resíduos escuros do fundo
          data[i + 3] = 0;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // 3. Cria canvas final com contorno "Sticker" da classe
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = size;
    finalCanvas.height = size;
    const fCtx = finalCanvas.getContext('2d');

    // Desenha silhueta com contorno brilhante da raridade
    fCtx.shadowColor = outlineColor;
    fCtx.shadowBlur = 6;
    fCtx.drawImage(canvas, 0, 0);

    // Borda nítida
    fCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    fCtx.shadowBlur = 4;
    fCtx.drawImage(canvas, 0, 0);

    return finalCanvas;
  }

  getCutout(cid) {
    return this.cutouts[cid] || this.cutouts.miner || null;
  }
}

export const characterSpriteManager = new CharacterSpriteManager();
