// ============================================================================
// MINECART & RAILWAY RENDERER (CARRINHO DE MINÉRIOS E TÚNEIS)
// 1. Túneis de entrada e saída nas paredes da caverna
// 2. Novo Carrinho Oficial Pixel-Art enviado pelo usuário (/minecart_pixel.png)
// NOTA: O carrinho roda estritamente sobre os trilhos na linha 5 sem bônus/clique
// ============================================================================

let cartSprite = null;
let cartLoaded = false;

export function initMinecartSprite(onLoaded) {
  if (cartLoaded && cartSprite) {
    if (onLoaded) onLoaded();
    return;
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = `/minecart_pixel.png?v=${Date.now()}`;
  img.onload = () => {
    cartSprite = img;
    cartLoaded = true;
    if (onLoaded) onLoaded();
  };
  img.onerror = () => {
    console.error('Falha ao carregar sprite /minecart_pixel.png');
  };
}

export function drawTunnelPortals(ctx, width, railY) {
  // 1. Túnel de Entrada (Esquerda)
  drawSinglePortal(ctx, -6, railY, true);

  // 2. Túnel de Saída (Direita)
  drawSinglePortal(ctx, width + 6, railY, false);
}

function drawSinglePortal(ctx, px, py, isLeft) {
  ctx.save();
  ctx.translate(px, py);
  if (!isLeft) ctx.scale(-1, 1);

  // Interior escuro profundo do túnel
  ctx.fillStyle = '#05070a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 22, 0, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(0, 22);
  ctx.lineTo(0, -22);
  ctx.closePath();
  ctx.fill();

  // Vigas de Madeira de Sustentação Rústica
  ctx.fillStyle = '#451a03';
  ctx.strokeStyle = '#1c0d06';
  ctx.lineWidth = 2.5;

  // Poste vertical
  ctx.beginPath();
  ctx.roundRect(0, -26, 7, 52, 2);
  ctx.fill();
  ctx.stroke();

  // Viga superior transversal
  ctx.beginPath();
  ctx.roundRect(0, -28, 18, 7, 2);
  ctx.fill();
  ctx.stroke();

  // Cinta de Ferro com Rebites
  ctx.fillStyle = '#334155';
  ctx.fillRect(1, -12, 5, 4);
  ctx.fillRect(1, 12, 5, 4);

  // Lanterna de Mineração Suspensa com Brilho
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(10, -18, 3, 0, Math.PI * 2);
  ctx.fill();

  const glow = ctx.createRadialGradient(10, -18, 1, 10, -18, 16);
  glow.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(10, -18, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawMinecart(ctx, cartX, cartY, now, angle = 0) {
  ctx.save();
  ctx.translate(cartX, cartY);

  // Rotação dinâmica acompanhando perfeitamente as curvas da ferrovia (modo oficial aprovado)
  if (angle !== 0) {
    ctx.rotate(angle);
  }

  // Trepidação mecânica sutil ao se mover nos trilhos
  const rumbleY = Math.sin(now * 0.035) * 0.7;

  // 1. Sombra Suave no Piso e Trilhos
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 8, 24, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Desenho do Novo Carrinho Pixel-Art Oficial enviado pelo usuário
  if (cartSprite && cartLoaded) {
    // Proporção fiel do pixel-art com ouro transbordando da caçamba
    const cw = 54;
    const ch = 40;
    // Ancoragem ajustada: o ponto de rotação coincide com o eixo inferior das rodas (-ch * 0.72)
    // Isso garante que ao girar nas curvas, as rodas fiquem cravadas no trilho sem dar "saidinha"!
    ctx.drawImage(cartSprite, -cw / 2, -ch * 0.72 + rumbleY, cw, ch);
  } else {
    // Fallback simples enquanto a imagem carrega
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(-22, -14, 44, 26, 3);
    ctx.fill();
  }

  // 3. Faíscas sutis sob as rodas de ferro nos trilhos
  if (Math.sin(now * 0.04) > 0.45) {
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(-14, 8, 1.2, 0, Math.PI * 2);
    ctx.arc(14, 8, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sem nenhum texto ou bônus (apenas percorre os trilhos fazendo as curvas)
  ctx.restore();
}
