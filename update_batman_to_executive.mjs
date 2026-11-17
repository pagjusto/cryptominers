import fs from 'fs';

const filePath = 'C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/src/utils/characterRenderers.js';
const code = fs.readFileSync(filePath, 'utf8');

const startMarker = '// ----------------------------------------------------------------------------\r\n// 11. BATMAN (batman)';
const startMarkerLF = '// ----------------------------------------------------------------------------\n// 11. BATMAN (batman)';

let startIndex = code.indexOf(startMarker);
if (startIndex === -1) {
  startIndex = code.indexOf(startMarkerLF);
}

if (startIndex === -1) {
  console.error('Marker 11. BATMAN not found!');
  process.exit(1);
}

const replacement = `// ----------------------------------------------------------------------------
// 11. O MAGNATA / O EXECUTIVO (batman / executive) - Chuva de Dinheiro (Make it Rain)
// Bilionário de terno azul marinho, gravata vermelha e topete loiro que destrói rochas
// arremessando maços maciços de dólares voadores com explosão de cédulas, moedas e cifrões!
// ----------------------------------------------------------------------------
let executiveCharImg = null;
let executiveCharLoaded = false;
let moneyStackImg = null;
let moneyStackLoaded = false;
let moneyFlyingImg = null;
let moneyFlyingLoaded = false;

export function initExecutive() {
  if (typeof window === 'undefined') return;
  if (!executiveCharImg) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/executive_character.png?v=' + Date.now();
    img.onload = () => {
      executiveCharImg = img;
      executiveCharLoaded = true;
    };
  }
  if (!moneyStackImg) {
    const sImg = new Image();
    sImg.crossOrigin = 'anonymous';
    sImg.src = '/money_stack.png?v=' + Date.now();
    sImg.onload = () => {
      moneyStackImg = sImg;
      moneyStackLoaded = true;
    };
  }
  if (!moneyFlyingImg) {
    const fImg = new Image();
    fImg.crossOrigin = 'anonymous';
    fImg.src = '/money_flying.png?v=' + Date.now();
    fImg.onload = () => {
      moneyFlyingImg = fImg;
      moneyFlyingLoaded = true;
    };
  }
}

if (typeof window !== 'undefined') {
  initExecutive();
}

// Auxiliar: Desenha um símbolo de cifrão flutuante ($)
function drawDollarSign(ctx, cx, cy, size, color = '#22c55e') {
  ctx.save();
  ctx.font = \`900 \${size}px sans-serif\`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText('$', cx, cy);
  ctx.restore();
}

export function drawExecutive(ctx, now, swingAngle, legAngle, swingProgress = 0, isMining = false) {
  initExecutive();

  if (executiveCharLoaded && executiveCharImg && moneyStackLoaded && moneyStackImg) {
    const cw = 38; // Largura do personagem de terno
    const ch = 58; // Altura do personagem
    const mw = 22; // Largura do maço de dinheiro em mãos
    const mh = 18; // Altura do maço
    const fw = 34; // Largura do maço voador com speedlines
    const fh = 20; // Altura do maço voador

    // =========================================================================
    // 1. MODO REPOUSO & CAMINHADA (IDLE / CONFIDENT STRIDE)
    // =========================================================================
    if (!isMining) {
      ctx.save();
      ctx.translate(0, 16); // Pivot na base dos sapatos

      const walkBob = Math.abs(Math.sin(now * 0.012)) * 1.5;
      const bodySway = Math.sin(now * 0.012) * 0.035;

      // Sombra formal no chão
      ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
      ctx.beginPath();
      ctx.ellipse(0, -1, 15, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(0, -walkBob);
      ctx.rotate(bodySway);

      // Desenha o sprite do Magnata de Terno
      ctx.drawImage(executiveCharImg, -cw / 2, -ch + 2, cw, ch);

      // Mão direita segurando e contando maço de dinheiro na cintura
      ctx.save();
      const handX = 13;
      const handY = -18;
      const stackBob = Math.sin(now * 0.015) * 1.2;
      ctx.translate(handX, handY + stackBob);
      ctx.rotate(0.18 + Math.sin(now * 0.01) * 0.04);

      // Brilho verde-dólar pulsante
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 6;
      ctx.drawImage(moneyStackImg, -mw / 2, -mh / 2, mw, mh);

      // Cifrão verde sutil subindo da pilha de notas
      if (Math.sin(now * 0.008) > 0.6) {
        const dAlpha = (Math.sin(now * 0.008) - 0.6) * 2.5;
        drawDollarSign(ctx, 4, -14, 10, \`rgba(74, 222, 128, \${dAlpha})\`);
      }

      ctx.restore(); // Fecha maço

      ctx.restore(); // Fecha repouso
      return;
    }

    // =========================================================================
    // 2. MODO ATAQUE: ARREMESSO DO MAÇO DE DÓLARES (CHUVA DE DINHEIRO)
    // =========================================================================
    ctx.save();
    ctx.translate(0, 16); // Pivot na base

    let lungeX = 0;
    let bodyAngle = 0;
    let handX = 13;
    let handY = -18;

    // FASE 1: PUXADA DO MAÇO DO PALETÓ (0.00 a 0.22)
    if (swingProgress < 0.22) {
      const p = swingProgress / 0.22;
      lungeX = -2 * p;
      bodyAngle = -0.10 * p; // Inclina para trás acumulando força
      handX = 13 - 6 * p;
      handY = -18 - 5 * p;
    }
    // FASE 2: ARREMESSO SUPERSÔNICO E EXPLOSÃO NA ROCHA (0.22 a 0.68)
    else if (swingProgress < 0.68) {
      const p = (swingProgress - 0.22) / 0.46;
      lungeX = 4 + Math.sin(p * Math.PI) * 2;
      bodyAngle = 0.12; // Projeta o corpo à frente
      handX = 14 + lungeX;
      handY = -18;
    }
    // FASE 3: AJUSTE DA GRAVATA VERMELHA & RESET (0.68 a 1.00)
    else {
      const p = (swingProgress - 0.68) / 0.32;
      lungeX = 4 * (1 - p);
      bodyAngle = 0.12 * (1 - p);
      // Mão ajusta a gravata na altura do peito
      handX = 14 * (1 - p) + 2 * p;
      handY = -18 * (1 - p) - 22 * p;
    }

    // Sombra no chão
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(lungeX, -1, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Desenha corpo do Magnata
    ctx.save();
    ctx.translate(lungeX, 0);
    ctx.rotate(bodyAngle);
    ctx.drawImage(executiveCharImg, -cw / 2, -ch + 2, cw, ch);
    ctx.restore();

    // Na Fase 1: Maço de dinheiro ainda na mão puxando para arremessar
    if (swingProgress < 0.22) {
      ctx.save();
      ctx.translate(handX, handY);
      ctx.rotate(-0.35 * (swingProgress / 0.22));
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 8;
      ctx.drawImage(moneyStackImg, -mw / 2, -mh / 2, mw, mh);
      ctx.restore();
    }

    // Ponto de contato na rocha à direita
    const impactX = 82;
    const impactY = -18;

    // FASE 2: O MAÇO DE DINHEIRO VOA EM ALTA VELOCIDADE CONTRA A ROCHA
    if (swingProgress >= 0.22 && swingProgress < 0.68) {
      const flyProgress = (swingProgress - 0.22) / 0.46;

      // Trajetória parabólica/horizontal veloz do maço
      const startX = handX + 4;
      const startY = handY;
      const flyX = startX + flyProgress * (impactX - startX);
      const flyY = startY + Math.sin(flyProgress * Math.PI) * -6;
      const spinAngle = flyProgress * Math.PI * 6; // Rotação rápida no ar

      // Linhas de vento / rastro de notas voando atrás do maço
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.55)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(flyX - 10, flyY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Desenha o maço voando com rotação
      ctx.save();
      ctx.translate(flyX, flyY);
      ctx.rotate(spinAngle);
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 10;
      if (moneyFlyingLoaded && moneyFlyingImg) {
        ctx.drawImage(moneyFlyingImg, -fw / 2, -fh / 2, fw, fh);
      } else {
        ctx.drawImage(moneyStackImg, -mw / 2, -mh / 2, mw, mh);
      }
      ctx.restore();

      // =======================================================================
      // IMPACTO MONETÁRIO NA ROCHA (Quando o maço atinge o bloco: flyProgress > 0.40)
      // =======================================================================
      if (flyProgress > 0.35) {
        const hitP = (flyProgress - 0.35) / 0.65;

        // 1. CÉDULAS DE DÓLAR VERDES VOANDO EM LEQUE (Explosão de Notas)
        for (let b = 0; b < 7; b++) {
          const billA = Math.PI - 0.8 + (b * 0.3) + Math.sin(now * 0.05 + b) * 0.2;
          const billDist = 8 + (hitP * 28) + (b * 2);
          const bx = impactX + Math.cos(billA) * billDist;
          const by = impactY + Math.sin(billA) * billDist * 0.8;
          const billRot = (now * 0.02 + b) * Math.PI;

          ctx.save();
          ctx.translate(bx, by);
          ctx.rotate(billRot);
          // Cédula retangular verde com borda escura e centro claro
          ctx.fillStyle = '#15803d';
          ctx.fillRect(-5, -2.5, 10, 5);
          ctx.fillStyle = '#86efac';
          ctx.fillRect(-3.5, -1.5, 7, 3);
          ctx.fillStyle = '#166534';
          ctx.fillRect(-1, -1, 2, 2); // Oval central do dólar
          ctx.restore();
        }

        // 2. CHUVA DE MOEDAS DOURADAS
        for (let m = 0; m < 5; m++) {
          const coinA = Math.PI - 0.6 + (m * 0.35);
          const coinDist = 6 + (hitP * 22);
          const mx = impactX + Math.cos(coinA) * coinDist;
          const my = impactY + Math.sin(coinA) * coinDist * 0.7;

          ctx.fillStyle = '#facc15';
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // 3. ANEL DE CHOQUE VERDE FINANCEIRO
        const ringR = 6 + hitP * 14;
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(impactX, impactY, ringR, 0, Math.PI * 2);
        ctx.stroke();

        // 4. FISSURAS LUMINOSAS VERDES NA PEDRA
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(impactX, impactY);
        ctx.lineTo(impactX + 8, impactY - 6);
        ctx.lineTo(impactX + 15, impactY - 10);
        ctx.moveTo(impactX, impactY);
        ctx.lineTo(impactX + 10, impactY + 6);
        ctx.lineTo(impactX + 16, impactY + 10);
        ctx.stroke();

        // 5. CIFRÕES DOURADOS ($) FLUTUANTES
        drawDollarSign(ctx, impactX + 6, impactY - 12 - hitP * 8, 12, '#fde047');
        drawDollarSign(ctx, impactX - 8, impactY + 8 + hitP * 4, 10, '#4ade80');

        // 6. FLOATING DAMAGE TEXT
        const floatY = impactY - 20 - (Math.sin(flyProgress * Math.PI) * 8);
        ctx.save();
        ctx.font = '900 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#14532d';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#052e16';
        ctx.fillText('💵 CHUVA DE DÓLARES! -50', impactX + 2, floatY + 1);
        ctx.fillStyle = '#86efac';
        ctx.fillText('💵 CHUVA DE DÓLARES! -50', impactX + 2, floatY);
        ctx.restore();
      }
    }

    // FASE 3: CHUVA RESIDUAL DE NOTAS ENQUANTO AJUSTA A GRAVATA (0.68 a 1.00)
    if (swingProgress >= 0.68) {
      for (let d = 0; d < 4; d++) {
        const driftT = (now * 0.004 + d * 0.25) % 1;
        const dx = lungeX + Math.sin(now * 0.008 + d * 2) * 16;
        const dy = -ch + 10 + driftT * 40;
        ctx.save();
        ctx.translate(dx, dy);
        ctx.rotate(Math.sin(now * 0.01 + d) * 0.4);
        ctx.fillStyle = \`rgba(34, 197, 94, \${(1 - driftT) * 0.8})\`;
        ctx.fillRect(-4, -2, 8, 4);
        ctx.restore();
      }
    }

    ctx.restore(); // Fecha translate geral
    return;
  }

  // Fallback caso as imagens ainda não tenham finalizado o carregamento
  applyOutline(ctx);
  ctx.fillStyle = '#1e3a8a';
  ctx.beginPath();
  ctx.roundRect(-10, -1, 20, 14, 4);
  ctx.fill();
  ctx.stroke();
}

// Alias para garantir compatibilidade com slot 'batman'
export const drawBatman = drawExecutive;
`;

const newCode = code.slice(0, startIndex) + replacement;
fs.writeFileSync(filePath, newCode, 'utf8');
console.log('Successfully replaced drawBatman with drawExecutive in characterRenderers.js!');
