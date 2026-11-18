// ============================================================================
// CHARACTER RENDERERS - VECTOR CARTOON 2D HIGH DEFINITION (11 CLASSES)
// Traço nítido (2.2px cel-shading), silhuetas icônicas e armas com movimentos dedicados
// Cada personagem possui armas personalizadas fiéis à sua temática e animações
// de ataque e repouso (walking/idle) completamente distintas.
// ============================================================================

// Utilitário para traçar contorno padrão
function applyOutline(ctx) {
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = '#09090b';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

// ----------------------------------------------------------------------------
// 1. BOMB-BOT 3000 (miner) - Robô Chibi & Martelete Hidráulico Horizontal
// ----------------------------------------------------------------------------
let robotBombBotImg = null;
let robotBombBotLoaded = false;
let robotJackhammerImg = null;
let robotJackhammerLoaded = false;

export function initBombBot() {
  if (typeof window === 'undefined') return;
  if (!robotBombBotImg) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/robot_bombbot.png?v=' + Date.now();
    img.onload = () => {
      robotBombBotImg = img;
      robotBombBotLoaded = true;
    };
  }
  if (!robotJackhammerImg) {
    const hImg = new Image();
    hImg.crossOrigin = 'anonymous';
    hImg.src = '/robot_jackhammer.png?v=' + Date.now();
    hImg.onload = () => {
      robotJackhammerImg = hImg;
      robotJackhammerLoaded = true;
    };
  }
}

if (typeof window !== 'undefined') {
  initBombBot();
}

export function drawBombBot(ctx, now, swingAngle, legAngle, swingProgress = 0, isMining = false) {
  initBombBot();

  // Se os sprites pixel art estiverem carregados, desenha o Robô com Martelete Demolidor Horizontal
  if (robotBombBotLoaded && robotBombBotImg && robotJackhammerLoaded && robotJackhammerImg) {
    const rw = 36; // Largura do robô padronizada
    const rh = 56; // Altura do robô padronizada (56px unificado)
    const hw = 9;  // Largura do martelete (reduzido pela metade)
    const hh = 28; // Comprimento do martelete (reduzido pela metade)

    // =========================================================================
    // 1. MODO REPOUSO & CAMINHADA (IDLE / WALKING)
    // =========================================================================
    if (!isMining) {
      ctx.save();
      ctx.translate(0, 16); // Pivot na base dos pés

      // Passo mecânico / amortecimento hidráulico
      const walkBob = Math.abs(Math.sin(now * 0.012)) * 1.8;
      const bodySway = Math.sin(now * 0.012) * 0.04;
      const breathY = 1 + Math.sin(now * 0.01) * 0.02;
      const breathX = 1 - Math.sin(now * 0.01) * 0.01;

      // Sombra nos pés
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(0, -1, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(0, -walkBob);
      ctx.rotate(bodySway);
      ctx.scale(breathX, breathY);

      // Desenha corpo do Robô
      ctx.drawImage(robotBombBotImg, -rw / 2, -rh + 6, rw, rh);

      // Brilho dos olhos LED ciano
      const eyeGlow = 0.5 + Math.sin(now * 0.015) * 0.3;
      ctx.fillStyle = `rgba(56, 189, 248, ${0.45 * eyeGlow})`;
      ctx.beginPath();
      ctx.arc(-5.0, -rh + 22, 3.2, 0, Math.PI * 2);
      ctx.arc(5.0, -rh + 22, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Led vermelho da antena no topo
      const antennaFlash = Math.sin(now * 0.01) > 0 ? '#ef4444' : '#f87171';
      ctx.fillStyle = antennaFlash;
      ctx.beginPath();
      ctx.arc(0, -rh + 2, 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Martelete em repouso empunhado na mão direita (vertical/leve inclinação)
      ctx.save();
      ctx.translate(13, -14);
      ctx.rotate(0.18 + Math.sin(now * 0.012) * 0.03);

      // Núcleo de energia ciano pulsando
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 4;
      ctx.drawImage(robotJackhammerImg, -hw / 2, 0, hw, hh);

      // Micro-vapor de ar comprimido saindo da válvula
      if (Math.sin(now * 0.02) > 0.7) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.arc(2, 16, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore(); // Fecha martelete

      ctx.restore(); // Fecha idle
      return;
    }

    // =========================================================================
    // 2. MODO ATAQUE: BRITADEIRA / MARTELETE OPERADO NA HORIZONTAL QUEBRANDO ROCHAS!
    // =========================================================================
    ctx.save();
    ctx.translate(0, 16); // Pivot nos pés

    let lungeX = 0;
    let bodyAngle = 0;
    let jackAngle = -Math.PI / 2; // Estritamente HORIZONTAL (ponteira apontada para a rocha em +X)
    let handX = 6;
    let handY = -14;
    let pistonStroke = 0;
    let scaleY = 1;
    let scaleX = 1;

    // FASE 1: POSICIONAMENTO E ENGAJE HORIZONTAL (0.00 a 0.18)
    if (swingProgress < 0.18) {
      const p = swingProgress / 0.18;
      lungeX = 3 * p;
      bodyAngle = 0.08 * p; // Robô projeta o tronco para frente para absorver o recuo
      // Ergue da posição de repouso (0.18 rad) até a horizontal absoluta (-Math.PI / 2)
      jackAngle = 0.18 - p * (0.18 + Math.PI / 2);
      handX = 13 - 7 * p;
      handY = -14;
      pistonStroke = 0;
    }
    // FASE 2: PERCUSSÃO PNEUMÁTICA DE ALTA FREQUÊNCIA NA HORIZONTAL (0.18 a 0.82)
    else if (swingProgress < 0.82) {
      const p = (swingProgress - 0.18) / 0.64;
      lungeX = 4 + Math.sin(p * Math.PI) * 2;
      bodyAngle = 0.12; // Postura agressiva fincada no chão

      // Jackhammer HORIZONTAL (-Math.PI / 2) com micro-vibração angular mecânica
      jackAngle = -Math.PI / 2 + Math.sin(now * 0.08) * 0.025;

      // Movimento alternado ultrarrápido do pistão hidráulico (35 a 45 Hz)
      pistonStroke = Math.sin(swingProgress * Math.PI * 42) * 4.2;
      const recoilTremor = (Math.sin(now * 0.15) * 0.8);

      handX = 4 + lungeX + pistonStroke;
      handY = -14 + recoilTremor;
      scaleY = 0.98 + Math.sin(swingProgress * Math.PI * 42) * 0.03;
    }
    // FASE 3: RETORNO DE PISTÃO E DESCARGA DE PRESSÃO (0.82 a 1.00)
    else {
      const p = (swingProgress - 0.82) / 0.18;
      lungeX = 4 * (1 - p);
      bodyAngle = 0.12 * (1 - p);
      jackAngle = -Math.PI / 2 + p * (0.18 + Math.PI / 2);
      handX = 8 + 5 * p;
      handY = -14;
      pistonStroke = 0;
    }

    // Sombra de impacto
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(lungeX, -1, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Desenha Robô na postura de operação
    ctx.save();
    ctx.translate(lungeX, 0);
    ctx.rotate(bodyAngle);
    ctx.scale(scaleX, scaleY);
    ctx.drawImage(robotBombBotImg, -rw / 2, -rh + 6, rw, rh);

    // Olhos LED em modo hiper-foco
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(-5.0, -rh + 22, 3.2, 0, Math.PI * 2);
    ctx.arc(5.0, -rh + 22, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Antena piscando em aviso industrial de perfuração
    ctx.fillStyle = (Math.floor(now * 0.03) % 2 === 0) ? '#ef4444' : '#ff0000';
    ctx.beginPath();
    ctx.arc(0, -rh + 2, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore(); // Fecha robô

    // Desenha o Martelete Operado na HORIZONTAL
    ctx.save();
    ctx.translate(handX, handY);
    ctx.rotate(jackAngle);

    // Efeito de brilho do núcleo de plasma/bateria ciano durante perfuração
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = (swingProgress >= 0.18 && swingProgress < 0.82) ? 10 : 4;
    ctx.drawImage(robotJackhammerImg, -hw / 2, 0, hw, hh);

    ctx.restore(); // Fecha rotação do martelete

    // =========================================================================
    // EFEITOS DE IMPACTO DA PERFURAÇÃO HORIZONTAL NA ROCHA
    // =========================================================================
    if (swingProgress >= 0.18 && swingProgress < 0.82) {
      // Ponto de contato exato da ponta de aço contra a parede de rocha (+X)
      const impactX = handX + hh - 2;
      const impactY = handY;

      // 1. FISSURAS E RACHADURAS NA ROCHA
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(impactX, impactY);
      ctx.lineTo(impactX + 8, impactY - 6);
      ctx.lineTo(impactX + 14, impactY - 10);
      ctx.moveTo(impactX, impactY);
      ctx.lineTo(impactX + 10, impactY + 5);
      ctx.lineTo(impactX + 16, impactY + 8);
      ctx.stroke();

      // 2. FAÍSCAS DE FRICÇÃO AÇO-ROCHA (Spray horizontal e para trás)
      for (let i = 0; i < 5; i++) {
        const spkAngle = Math.PI - 0.7 + (i * 0.35) + Math.sin(now * 0.05 + i) * 0.2;
        const spkDist = 6 + ((now * 0.08 + i * 5) % 18);
        const sx = impactX + Math.cos(spkAngle) * spkDist;
        const sy = impactY + Math.sin(spkAngle) * spkDist * 0.7;

        ctx.fillStyle = i % 2 === 0 ? '#fef08a' : (i % 3 === 0 ? '#38bdf8' : '#fb923c');
        ctx.beginPath();
        ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. ESTILHAÇOS DE PEDRA VOANDO (Fragmentos de cascalho cinza)
      for (let k = 0; k < 4; k++) {
        const chipAngle = Math.PI - 0.6 + (k * 0.4);
        const chipDist = 8 + ((now * 0.05 + k * 7) % 22);
        const cx = impactX + Math.cos(chipAngle) * chipDist;
        const cy = impactY + Math.sin(chipAngle) * chipDist * 0.8;

        ctx.fillStyle = k % 2 === 0 ? '#475569' : '#334155';
        ctx.fillRect(cx - 1.5, cy - 1.5, 3, 3);
      }

      // 4. NUVEM DE PÓ DE PEDRA (Pneumatic Dust Blast)
      const dustAlpha = 0.35 + Math.sin(now * 0.05) * 0.15;
      ctx.fillStyle = `rgba(226, 232, 240, ${dustAlpha})`;
      ctx.beginPath();
      ctx.arc(impactX - 2, impactY + Math.sin(now * 0.06) * 4, 7, 0, Math.PI * 2);
      ctx.arc(impactX + 4, impactY - 5, 5, 0, Math.PI * 2);
      ctx.fill();

      // 5. ESCAPAMENTO DE AR COMPRIMIDO (Vapor pelas aberturas do motor)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fillRect(handX + 8, handY - 8, 4.5, 2);

      // 6. ONDA DE CHOQUE CIRCULAR DE IMPACTO
      const shockWaveR = 6 + (Math.sin(swingProgress * Math.PI * 30) + 1) * 4;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(impactX, impactY, shockWaveR, 0, Math.PI * 2);
      ctx.stroke();

      // 7. FLOATING DAMAGE TEXT
      const floatY = impactY - 18 - (Math.sin(swingProgress * Math.PI) * 8);
      ctx.save();
      ctx.font = '900 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#09090b';
      ctx.fillText('⚡ MARTELETE! -38', impactX + 2, floatY + 1);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('⚡ MARTELETE! -38', impactX + 2, floatY);
      ctx.restore();
    }

    ctx.restore(); // Fecha translate geral
    return;
  }

  // Fallback caso as imagens ainda não tenham finalizado o carregamento
  applyOutline(ctx);

  // Chassis / Tronco
  const bodyGrad = ctx.createLinearGradient(0, -1, 0, 13);
  bodyGrad.addColorStop(0, '#38bdf8');
  bodyGrad.addColorStop(0.5, '#0284c7');
  bodyGrad.addColorStop(1, '#0369a1');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(-10, -1, 20, 14, 5);
  ctx.fill();
  ctx.stroke();

  // Painel de Bateria
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-6, 2, 12, 6);
  ctx.strokeRect(-6, 2, 12, 6);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(-4, 3.5, 3, 3);
  ctx.fillStyle = '#eab308';
  ctx.fillRect(-0.5, 3.5, 3, 3);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(3, 3.5, 2, 3);

  // Cabeça Robótica Cúbica Arredondada
  const headGrad = ctx.createLinearGradient(0, -22, 0, -2);
  headGrad.addColorStop(0, '#e0f2fe');
  headGrad.addColorStop(1, '#7dd3fc');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.roundRect(-12, -22, 24, 20, 6);
  ctx.fill();
  ctx.stroke();

  // Parafusos nas têmporas
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.arc(-10, -12, 1.8, 0, Math.PI * 2);
  ctx.arc(10, -12, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Visor Digital Preto Curvado
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.roundRect(-9, -17, 18, 10, 3.5);
  ctx.fill();
  ctx.stroke();

  // Olhos Digitais LED Ciano Brilhantes
  const eyeBlink = Math.sin(now * 0.003) > 0.96 ? 1 : 4.5;
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.roundRect(-6.5, -14, 4, eyeBlink, 1.5);
  ctx.roundRect(2.5, -14, 4, eyeBlink, 1.5);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-5.5, -13.5, 1.5, 1.5);
  ctx.fillRect(3.5, -13.5, 1.5, 1.5);

  // Antena com Esfera Vermelha Piscante
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(0, -29);
  ctx.stroke();

  const pingColor = Math.sin(now * 0.01) > 0 ? '#ef4444' : '#f87171';
  ctx.fillStyle = pingColor;
  ctx.beginPath();
  ctx.arc(0, -30, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-1, -31, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // === BRAÇO COM BROCA / BRITADEIRA PNEUMÁTICA LASER ===
  ctx.save();
  ctx.translate(9, 3);

  if (!isMining) {
    // Modo caminhada: braço recolhido em repouso ao lado do corpo
    const sway = Math.sin(now * 0.02) * 0.1;
    ctx.rotate(0.45 + sway);
  } else {
    // Modo perfuração: pistão avança e vibra rapidamente em alta frequência
    const vibe = Math.sin(now * 0.08) * 3;
    const forward = Math.sin(swingProgress * Math.PI) * 5;
    ctx.translate(forward + vibe, -1);
    ctx.rotate(-0.1);

    // Efeito de Faíscas Elétricas de Perfuração Ciano
    ctx.fillStyle = '#38bdf8';
    for (let i = 0; i < 3; i++) {
      const spkAngle = now * 0.05 + i * 2;
      const spkDist = 18 + (i * 3);
      ctx.beginPath();
      ctx.arc(Math.cos(spkAngle) * 4 + spkDist, Math.sin(spkAngle) * 4, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Cilindro do Pistão Hidráulico
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.roundRect(-2, -5, 10, 8, 2);
  ctx.fill();
  ctx.stroke();

  // Eixo Cromado Extensível
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(8, -3, 8, 4);
  ctx.strokeRect(8, -3, 8, 4);

  // Broca Cônica de Tungstênio / Ponta de Plasma
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.moveTo(16, -6);
  ctx.lineTo(24, 0);
  ctx.lineTo(16, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Núcleo de Plasma Ciano no Centro da Broca
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(17, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ----------------------------------------------------------------------------
// 2. BÁRBARO VIKING (brute) - Novo Boneco e Machado Pixel Art Separados
// ----------------------------------------------------------------------------
let vikingCutoutImg = null;
let vikingCutoutLoaded = false;
let vikingBodyImg = null;
let vikingBodyLoaded = false;
let vikingAxeImg = null;
let vikingAxeLoaded = false;

export function initVikingCutout() {
  if (typeof window === 'undefined') return;
  if (!vikingCutoutImg) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/viking_cutout.png?v=' + Date.now();
    img.onload = () => {
      vikingCutoutImg = img;
      vikingCutoutLoaded = true;
    };
  }
  if (!vikingBodyImg) {
    const bImg = new Image();
    bImg.crossOrigin = 'anonymous';
    bImg.src = '/viking_body_clean.png?v=' + Date.now();
    bImg.onload = () => {
      vikingBodyImg = bImg;
      vikingBodyLoaded = true;
    };
  }
  if (!vikingAxeImg) {
    const aImg = new Image();
    aImg.crossOrigin = 'anonymous';
    aImg.src = '/viking_axe_clean.png?v=' + Date.now();
    aImg.onload = () => {
      vikingAxeImg = aImg;
      vikingAxeLoaded = true;
    };
  }
}

if (typeof window !== 'undefined') {
  initVikingCutout();
}

export function drawViking(ctx, now, swingAngle, legAngle, swingProgress = 0, isMining = false) {
  // 1. MODO CAMINHADA E REPOUSO (Idle & Walking)
  // Utiliza o novo boneco segurando o machado em postura guerreira com respiração e waddle
  if (!isMining && vikingCutoutLoaded && vikingCutoutImg) {
    ctx.save();
    // Pivot no centro dos pés no chão (y = 16)
    ctx.translate(0, 16);

    const angle = Math.sin(now * 0.012) * 0.06;
    const walkBob = Math.abs(Math.sin(now * 0.012)) * 2.2;
    const scaleY = 1 + Math.sin(now * 0.012) * 0.03;
    const scaleX = 1 - Math.sin(now * 0.012) * 0.02;

    ctx.translate(0, -walkBob);
    ctx.rotate(angle);
    ctx.scale(scaleX, scaleY);

    const sw = 53;
    const sh = 56;
    ctx.drawImage(vikingCutoutImg, -22, -sh + 6, sw, sh);

    ctx.restore();
    return;
  }

  // 2. MODO ATAQUE: GOLPE REAL COM O NOVO BONECO E MACHADO SEPARADOS!
  // O machado sobe lá no alto empinado atrás da cabeça e desce com avanço frontal (+20px),
  // atingindo com as duas lâminas diretamente a face da rocha!
  if (isMining && vikingBodyLoaded && vikingBodyImg && vikingAxeLoaded && vikingAxeImg) {
    ctx.save();
    ctx.translate(0, 16); // Base nos pés

    let lungeX = 0;
    let bodyAngle = 0;
    let axeAngle = 0;
    let handX = 6;
    let handY = -22;
    let scaleY = 1;
    let scaleX = 1;

    if (swingProgress < 0.35) {
      // Fase 1: Antecipação / Erguer o machado lá no alto atrás do elmo
      const p = swingProgress / 0.35;
      lungeX = -6 * p;
      bodyAngle = -0.16 * Math.sin(p * Math.PI * 0.5);
      axeAngle = 0.35 - p * 2.45; // Gira para trás até -2.1 rad (lá no alto)
      handX = 6 - 8 * p;
      handY = -22 - 6 * p;
      scaleY = 1 + 0.06 * p;
    } else if (swingProgress < 0.64) {
      // Fase 2: O Golpe Acelerado (Descida com avanço e impacto direto na rocha)
      const p = (swingProgress - 0.35) / 0.29;
      const pStrike = p * p * (3 - 2 * p); // Aceleração violenta
      lungeX = -6 + pStrike * 24; // Avança até +18px em direção à rocha
      bodyAngle = -0.16 + pStrike * 0.38; // Inclina tronco (+0.22 rad)
      axeAngle = -2.1 + pStrike * 3.3; // Gira de -2.1 até +1.2 rad (cravando na rocha!)
      handX = -2 + pStrike * 16;
      handY = -28 + pStrike * 14;
      scaleY = 1 - 0.12 * Math.sin(p * Math.PI);
      scaleX = 1 + 0.12 * Math.sin(p * Math.PI);
    } else {
      // Fase 3: Retorno e Recuperação com amortecimento
      const p = (swingProgress - 0.64) / 0.36;
      lungeX = 18 * (1 - p);
      bodyAngle = 0.22 * (1 - p);
      axeAngle = 1.2 - p * 0.85;
      handX = 14 - p * 8;
      handY = -14 - p * 8;
      scaleY = 0.94 + p * 0.06;
      scaleX = 1.06 - p * 0.06;
    }

    ctx.translate(lungeX, 0);
    ctx.rotate(bodyAngle);
    ctx.scale(scaleX, scaleY);

    // 1. Desenha o novo corpo do Viking sem o machado
    const bw = 44;
    const bh = 56;
    ctx.drawImage(vikingBodyImg, -bw / 2, -bh + 6, bw, bh);

    // 2. Desenha o machado sendo empunhado e girando nas mãos
    ctx.save();
    ctx.translate(handX, handY);
    ctx.rotate(axeAngle);
    const aw = 30;
    const ah = 44;
    ctx.drawImage(vikingAxeImg, -aw / 2, -ah * 0.72, aw, ah);
    ctx.restore();

    // 3. Efeitos especiais de colisão e impacto na rocha
    if (swingProgress >= 0.54 && swingProgress <= 0.68) {
      const impactX = 46;
      const impactY = -10;

      // Arco de corte flamejante cortando a pedra
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.95)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(impactX - 10, impactY, 26, -0.7, 0.7);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(impactX - 10, impactY, 24, -0.5, 0.5);
      ctx.stroke();

      // Faíscas douradas e prateadas
      const sparkAngles = [-0.8, -0.5, -0.2, 0.1, 0.4, 0.7, 1.0];
      sparkAngles.forEach((ang, sIdx) => {
        const dist = 14 + (sIdx % 3) * 8;
        const sx = impactX + Math.cos(ang) * dist;
        const sy = impactY + Math.sin(ang) * dist;
        ctx.fillStyle = sIdx % 2 === 0 ? '#fbbf24' : '#ffffff';
        ctx.fillRect(sx, sy, 3, 3);
      });

      // Onda de choque no solo
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(impactX, 16, 18, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
    return;
  }

  // 2. MODO ATAQUE: O GOLPE REAL COM O MACHADO DE BATALHA!
  // O guerreiro ergue o machado de 2 mãos no alto e desce com avanço frontal (+22px),
  // atingindo a rocha diretamente com a lâmina de aço, gerando faíscas e choque.
  applyOutline(ctx);

  ctx.save();
  ctx.translate(0, 16); // Base nos pés

  let lungeX = 0;
  let bodyAngle = 0;
  let slamAngle = 0;
  let scaleY = 1;
  let scaleX = 1;

  if (!isMining) {
    // Modo caminhada sem cutout (fallback vetorial)
    bodyAngle = Math.sin(now * 0.015) * 0.06;
    slamAngle = -0.85 + Math.sin(now * 0.015) * 0.08;
  } else {
    // Ciclo completo de 4 fases do ataque com o machado
    if (swingProgress < 0.35) {
      // Fase 1: Antecipação / Erguer o machado pesado para trás e para o alto
      const p = swingProgress / 0.35;
      lungeX = -6 * p; // Recua acumulando força
      bodyAngle = -0.18 * Math.sin(p * Math.PI * 0.5);
      slamAngle = -0.85 - p * 1.35; // Machado vai a -2.2 rad (empinado acima da cabeça)
      scaleY = 1 + 0.08 * p;
      scaleX = 1 - 0.05 * p;
    } else if (swingProgress < 0.64) {
      // Fase 2: O Golpe Acelerado para frente (Descida do Machado em direção à Rocha)
      const p = (swingProgress - 0.35) / 0.29;
      // Curva de aceleração violenta (ease-in rápido)
      const pStrike = p * p * (3 - 2 * p);
      lungeX = -6 + pStrike * 22; // Avança até +16px em direção à rocha
      bodyAngle = -0.18 + pStrike * 0.45; // Inclina tronco para frente no golpe (+0.27 rad)
      slamAngle = -2.2 + pStrike * 2.95; // Machado desce em arco de -2.2 até +0.75 rad (batendo na rocha!)
      scaleY = 1 - 0.14 * Math.sin(p * Math.PI);
      scaleX = 1 + 0.15 * Math.sin(p * Math.PI);
    } else {
      // Fase 3: Recuperação pós-impacto com recuo elástico
      const p = (swingProgress - 0.64) / 0.36;
      lungeX = 16 * (1 - p);
      bodyAngle = 0.27 * (1 - p);
      slamAngle = 0.75 - p * 1.6;
      scaleY = 0.94 + p * 0.06;
      scaleX = 1.06 - p * 0.06;
    }
  }

  ctx.translate(lungeX, 0);
  ctx.rotate(bodyAngle);
  ctx.scale(scaleX, scaleY);

  // Retorna aos eixos locais do personagem (cabeça/tronco)
  ctx.translate(0, -16);

  // === CORPO DO VIKING (Visual Laranja Chibi com Elmo de Chifres) ===
  // Tronco Robusto Laranja Chibi
  const torsoGrad = ctx.createLinearGradient(0, -2, 0, 14);
  torsoGrad.addColorStop(0, '#f97316');
  torsoGrad.addColorStop(0.5, '#ea580c');
  torsoGrad.addColorStop(1, '#9a3412');
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.roundRect(-12, -2, 24, 17, 5);
  ctx.fill();
  ctx.stroke();

  // Colete Rústico de Pele com Pelo nos Ombros
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.roundRect(-13, -3, 6.5, 18, 3);
  ctx.roundRect(6.5, -3, 6.5, 18, 3);
  ctx.fill();
  ctx.stroke();

  // Cinto de Batalha com Fivela Retangular de Aço (fiel ao 3D)
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(-12, 7, 24, 4.5);
  ctx.strokeRect(-12, 7, 24, 4.5);
  // Fivela de Aço
  ctx.fillStyle = '#94a3b8';
  ctx.strokeRect(-4, 6.5, 8, 5.5);
  ctx.fillRect(-4, 6.5, 8, 5.5);
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(-2, 7.5, 4, 3.5);

  // Cabeça Forte
  ctx.fillStyle = '#fb923c';
  ctx.beginPath();
  ctx.arc(0, -10, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Olhos Ferozes e Sobrancelhas de Batalha
  ctx.fillStyle = '#7c2d12';
  ctx.fillRect(-5, -14, 4, 2);
  ctx.fillRect(1, -14, 4, 2);
  ctx.fillStyle = '#09090b';
  ctx.fillRect(-4, -12, 2.2, 2.2);
  ctx.fillRect(2, -12, 2.2, 2.2);

  // Barba Ruiva Trançada
  ctx.fillStyle = '#c2410c';
  ctx.beginPath();
  ctx.moveTo(-8, -8);
  ctx.quadraticCurveTo(-11, 4, -4, 11);
  ctx.lineTo(0, 13);
  ctx.lineTo(4, 11);
  ctx.quadraticCurveTo(11, 4, 8, -8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Capacete Viking de Aço Forjado com Cúpula 3D
  const helmGrad = ctx.createLinearGradient(0, -22, 0, -9);
  helmGrad.addColorStop(0, '#f1f5f9');
  helmGrad.addColorStop(0.3, '#94a3b8');
  helmGrad.addColorStop(1, '#334155');
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.arc(0, -11, 10, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Faixa de Reforço com Rebites de Ferro
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-10.5, -13, 21, 3.5);
  ctx.strokeRect(-10.5, -13, 21, 3.5);
  // Rebites Prateados
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(-8, -12.2, 2, 2);
  ctx.fillRect(-3, -12.2, 2, 2);
  ctx.fillRect(2, -12.2, 2, 2);
  ctx.fillRect(7, -12.2, 2, 2);

  // Chifres de Marfim do Capacete (com anel de couro escuro na base)
  // Anéis de couro na base dos chifres
  ctx.fillStyle = '#451a03';
  ctx.fillRect(-11, -16, 3, 4);
  ctx.fillRect(8, -16, 3, 4);

  // Chifres Dourados / Marfim
  ctx.fillStyle = '#fef08a';
  // Chifre Esquerdo
  ctx.beginPath();
  ctx.moveTo(-10, -15);
  ctx.quadraticCurveTo(-19, -20, -18, -28);
  ctx.quadraticCurveTo(-13, -22, -6, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Chifre Direito
  ctx.beginPath();
  ctx.moveTo(10, -15);
  ctx.quadraticCurveTo(19, -20, 18, -28);
  ctx.quadraticCurveTo(13, -22, 6, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // === BRAÇOS E MACHADO DE GUERRA DUPLO (DOUBLE-BITTED BATTLEAXE) ===
  ctx.save();
  // Ponto de articulação nas mãos/ombro frontal (+12, -2)
  ctx.translate(10, -2);
  ctx.rotate(slamAngle);

  // Braço Musculoso Laranja empunhando o machado
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.roundRect(-4, -6, 8, 12, 3);
  ctx.fill();
  ctx.stroke();
  // Braçadeira de Couro com Rebites
  ctx.fillStyle = '#451a03';
  ctx.fillRect(-4.5, -2, 9, 4);
  ctx.strokeRect(-4.5, -2, 9, 4);

  // Cabo Longo de Carvalho Rústico (comprimento aumentado para 38px para alcançar a rocha)
  const handleGrad = ctx.createLinearGradient(-3, -38, 3, 0);
  handleGrad.addColorStop(0, '#573016');
  handleGrad.addColorStop(0.5, '#78350f');
  handleGrad.addColorStop(1, '#3b1c0b');
  ctx.fillStyle = handleGrad;
  ctx.fillRect(-3, -38, 6, 42);
  ctx.strokeRect(-3, -38, 6, 42);

  // Faixas e Anéis de Reforço de Ferro no Cabo
  ctx.fillStyle = '#475569';
  ctx.fillRect(-3.5, -14, 7, 3);
  ctx.fillRect(-3.5, -26, 7, 3);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(-3.5, 2, 7, 3); // Anel inferior pommel

  // Encaixe Central de Ferro Forjado (Socket)
  const socketGrad = ctx.createLinearGradient(-5, -36, 5, -26);
  socketGrad.addColorStop(0, '#334155');
  socketGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = socketGrad;
  ctx.fillRect(-5, -36, 10, 10);
  ctx.strokeRect(-5, -36, 10, 10);

  // Rebites Esféricos Centrais 3D
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.arc(-2, -31, 2, 0, Math.PI * 2);
  ctx.arc(2, -31, 2, 0, Math.PI * 2);
  ctx.fill();

  // Ponteira Central Superior (Spike)
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(-3, -36);
  ctx.lineTo(0, -44);
  ctx.lineTo(3, -36);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 1. LÂMINA PRINCIPAL DO MACHADO (Direita / Frontal - Curvada com Entalhes de Batalha)
  const axeRightGrad = ctx.createLinearGradient(0, -42, 28, -24);
  axeRightGrad.addColorStop(0, '#e2e8f0');
  axeRightGrad.addColorStop(0.2, '#94a3b8');
  axeRightGrad.addColorStop(0.7, '#475569');
  axeRightGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = axeRightGrad;
  ctx.beginPath();
  ctx.moveTo(4, -36);
  ctx.quadraticCurveTo(16, -46, 28, -34); // Curva superior da lâmina
  ctx.lineTo(26, -30); // Entalhe de batalha (battle notch)
  ctx.lineTo(28, -28);
  ctx.quadraticCurveTo(18, -20, 4, -26); // Curva inferior
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Fio de Aço Cortante Prateado Polido (Lâmina Direita)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(18, -43);
  ctx.lineTo(28, -34);
  ctx.lineTo(26, -30);
  ctx.lineTo(28, -28);
  ctx.lineTo(20, -22);
  ctx.stroke();

  // 2. LÂMINA TRASEIRA DO MACHADO (Esquerda - 2 Lados Simétricos!)
  const axeLeftGrad = ctx.createLinearGradient(0, -42, -28, -24);
  axeLeftGrad.addColorStop(0, '#cbd5e1');
  axeLeftGrad.addColorStop(0.3, '#64748b');
  axeLeftGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = axeLeftGrad;
  ctx.beginPath();
  ctx.moveTo(-4, -36);
  ctx.quadraticCurveTo(-16, -46, -28, -34);
  ctx.lineTo(-26, -30);
  ctx.lineTo(-28, -28);
  ctx.quadraticCurveTo(-18, -20, -4, -26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Fio de Aço Cortante (Lâmina Esquerda)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-18, -43);
  ctx.lineTo(-28, -34);
  ctx.lineTo(-26, -30);
  ctx.lineTo(-28, -28);
  ctx.lineTo(-20, -22);
  ctx.stroke();

  // Segunda mão segurando o cabo inferior
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.arc(0, -8, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore(); // Fecha articulação do machado

  // === EFEITOS ESPECIAIS DE IMPACTO NO MOMENTO EXATO DA COLISÃO COM A ROCHA ===
  // Ocorre no ápice do golpe (swingProgress entre 0.54 e 0.70)
  if (isMining && swingProgress >= 0.54 && swingProgress <= 0.70) {
    ctx.save();

    // Ponto exato da colisão da lâmina na face da rocha (x ~ 48, y ~ -6)
    const impactX = 48;
    const impactY = -6;

    // 1. Arco de Corte Flamejante Cortando a Pedra
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.95)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(impactX - 10, impactY, 26, -0.7, 0.7);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(impactX - 10, impactY, 24, -0.5, 0.5);
    ctx.stroke();

    // 2. Explosão de Faíscas Douradas e Prateadas Voando da Rocha
    const sparkAngles = [-0.8, -0.5, -0.2, 0.1, 0.4, 0.7, 1.0];
    sparkAngles.forEach((ang, sIdx) => {
      const dist = 14 + (sIdx % 3) * 8;
      const sx = impactX + Math.cos(ang) * dist;
      const sy = impactY + Math.sin(ang) * dist;
      ctx.fillStyle = sIdx % 2 === 0 ? '#fbbf24' : '#ffffff';
      ctx.fillRect(sx, sy, 3, 3);
    });

    // 3. Fragmentos de Rocha Voando
    ctx.fillStyle = '#78716c';
    ctx.fillRect(impactX + 12, impactY - 14, 4, 3);
    ctx.fillRect(impactX + 16, impactY + 8, 3, 4);
    ctx.fillRect(impactX + 8, impactY - 22, 3, 3);

    // 4. Onda de Choque no Solo sob o Impacto
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(impactX, 16, 18, 5, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  ctx.restore(); // Fecha ctx.save() do Viking
}

// ----------------------------------------------------------------------------
// 3. SAPO NINJA SHINOBI (goblin) - Kunais Duplas e Arremesso Veloz
// ----------------------------------------------------------------------------
let frogShinobiImg = null;
let frogShinobiLoaded = false;
let kunaiImg = null;
let kunaiLoaded = false;

export function initFrogShinobi() {
  if (typeof window === 'undefined') return;
  if (!frogShinobiImg) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/frog_shinobi.png?v=' + Date.now();
    img.onload = () => {
      frogShinobiImg = img;
      frogShinobiLoaded = true;
    };
  }
  if (!kunaiImg) {
    const kImg = new Image();
    kImg.crossOrigin = 'anonymous';
    kImg.src = '/kunai_blade.png?v=' + Date.now();
    kImg.onload = () => {
      kunaiImg = kImg;
      kunaiLoaded = true;
    };
  }
}

if (typeof window !== 'undefined') {
  initFrogShinobi();
}

export function drawFrogNinja(ctx, now, swingAngle, legAngle, swingProgress = 0, isMining = false) {
  initFrogShinobi();

  // Se os sprites pixel art estiverem carregados, desenha a física completa com arremesso de Kunai
  if (frogShinobiLoaded && frogShinobiImg && kunaiLoaded && kunaiImg) {
    const fw = 42; // Largura padronizada
    const fh = 56; // Altura unificada (56px)
    const kw = 11;
    const kh = 32;

    // =========================================================================
    // 1. MODO REPOUSO & CAMINHADA (IDLE / WALKING)
    // =========================================================================
    if (!isMining) {
      ctx.save();
      ctx.translate(0, 16); // Pivot na base dos pés

      // Respiração ninja & passo saltitante de anfíbio
      const breath = Math.sin(now * 0.012);
      const walkBob = Math.abs(Math.sin(now * 0.014)) * 2.2;
      const walkTilt = Math.sin(now * 0.014) * 0.05;
      const breathScaleY = 1 + breath * 0.035;
      const breathScaleX = 1 - breath * 0.02;

      ctx.translate(0, -walkBob);
      ctx.rotate(walkTilt);
      ctx.scale(breathScaleX, breathScaleY);

      // Desenha o corpo do Sapo Shinobi
      ctx.drawImage(frogShinobiImg, -fw / 2, -fh + 6, fw, fh);

      // Kunai empunhada na mão frontal direita em postura de guarda shinobi
      ctx.save();
      ctx.translate(11, -21); // Posição exata do punho fechado direito do sapinho
      ctx.rotate(0.35 + breath * 0.05); // Ligeira inclinação para frente

      // Brilho do Chakra Venenoso na ponta afiada da Kunai
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 6;
      ctx.drawImage(kunaiImg, -kw / 2, -kh * 0.72, kw, kh);

      // Faísca esmeralda cintilando na ponta da lâmina
      const sparkGleam = (Math.sin(now * 0.02) + 1) * 0.5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -kh * 0.72, 1.5 + sparkGleam, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      ctx.restore();
      return;
    }

    // =========================================================================
    // 2. MODO ATAQUE: ARREMESSO REAL DA KUNAI NA ROCHA COM IMPACTO!
    // =========================================================================
    ctx.save();
    ctx.translate(0, 16); // Pivot na base dos pés

    let lungeX = 0;
    let bodyAngle = 0;
    let scaleY = 1;
    let scaleX = 1;

    // FASE 1: WIND-UP / MIRA & CONCENTRAÇÃO (0.00 a 0.22)
    if (swingProgress < 0.22) {
      const p = swingProgress / 0.22;
      lungeX = -6 * p;
      bodyAngle = -0.16 * p; // Recua tronco preparando arremesso
      scaleY = 1 + 0.04 * p;
      scaleX = 1 - 0.03 * p;

      ctx.translate(lungeX, 0);
      ctx.rotate(bodyAngle);
      ctx.scale(scaleX, scaleY);

      // Desenha corpo do Sapo
      ctx.drawImage(frogShinobiImg, -fw / 2, -fh + 6, fw, fh);

      // Kunai armada na mão puxada para trás
      const handX = 11 - 10 * p;
      const handY = -21 - 8 * p;
      const kunaiAngle = 0.35 - 1.5 * p;

      ctx.save();
      ctx.translate(handX, handY);
      ctx.rotate(kunaiAngle);
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 8 * p;
      ctx.drawImage(kunaiImg, -kw / 2, -kh * 0.72, kw, kh);

      // Orbe de energia concentrando chakra na ponta
      ctx.fillStyle = 'rgba(74, 222, 128, ' + (0.4 + 0.5 * p) + ')';
      ctx.beginPath();
      ctx.arc(0, -kh * 0.72, 3 + p * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();
      return;
    }

    // FASE 2: O ARREMESSO HIPERSONICO (0.22 a 0.48)
    if (swingProgress < 0.48) {
      const p = (swingProgress - 0.22) / 0.26;
      lungeX = -6 + p * 16; // Avanço ninja frontal até +10px
      bodyAngle = -0.16 + p * 0.36; // Lança o tronco à frente (+0.20 rad)
      scaleY = 1 - 0.08 * Math.sin(p * Math.PI);
      scaleX = 1 + 0.08 * Math.sin(p * Math.PI);

      ctx.translate(lungeX, 0);
      ctx.rotate(bodyAngle);
      ctx.scale(scaleX, scaleY);

      // Desenha o corpo do Sapo no momento do arremesso (mão livre soltou a arma)
      ctx.drawImage(frogShinobiImg, -fw / 2, -fh + 6, fw, fh);

      // Restaura transformação para traçar trajetória absoluta do projétil
      ctx.restore();

      // Projétil Kunai voando em direção à rocha (impactX ~ 48, impactY ~ -10)
      ctx.save();
      ctx.translate(0, 16);

      const pFly = Math.pow(p, 0.75); // Aceleração supersônica inicial
      const startX = 14 + lungeX;
      const startY = -21;
      const targetX = 48;
      const targetY = -10;

      const kx = startX + (targetX - startX) * pFly;
      const ky = startY + (targetY - startY) * pFly - Math.sin(p * Math.PI) * 5;
      const flyAngle = Math.PI / 2 + (1 - p) * 0.25; // Ponta voltada para a direita (+X)

      // Rastro de velocidade laser esmeralda
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.85)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(kx - 24, ky);
      ctx.lineTo(kx, ky);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(kx - 14, ky);
      ctx.lineTo(kx, ky);
      ctx.stroke();

      // Gotículas de veneno no rastro
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(kx - 10, ky + 2, 1.8, 0, Math.PI * 2);
      ctx.arc(kx - 18, ky - 3, 1.4, 0, Math.PI * 2);
      ctx.arc(kx - 26, ky + 1, 1.0, 0, Math.PI * 2);
      ctx.fill();

      // Projétil Kunai voando em alta rotação ninja (arremesso giratório igual ao Batman)
      const spinAngle = (now * 0.045) + p * Math.PI * 8;

      ctx.save();
      ctx.translate(kx, ky);

      // Disco e rastro de corte circular do giro ninja da Kunai
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, kh * 0.48, 0, Math.PI * 2);
      ctx.stroke();

      ctx.rotate(spinAngle);
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 10;
      ctx.drawImage(kunaiImg, -kw / 2, -kh / 2, kw, kh);
      ctx.restore();

      ctx.restore();
      return;
    }

    // FASE 3: IMPACTO DEMOLIDOR & KUNAI CRAVADA NA ROCHA (0.48 a 0.72)
    if (swingProgress < 0.72) {
      const p = (swingProgress - 0.48) / 0.24;
      lungeX = 10;
      bodyAngle = 0.20;

      ctx.translate(lungeX, 0);
      ctx.rotate(bodyAngle);
      ctx.drawImage(frogShinobiImg, -fw / 2, -fh + 6, fw, fh);
      ctx.restore();

      // Kunai Cravada na Rocha
      ctx.save();
      ctx.translate(0, 16);

      const impactX = 48;
      const impactY = -10;
      const tremor = Math.sin((swingProgress - 0.48) * 80) * (1 - p) * 2.2;

      // Desenha a Kunai fincada na rocha
      ctx.save();
      ctx.translate(impactX + tremor, impactY);
      ctx.rotate(Math.PI / 2); // Deitada perfurando a rocha da esquerda para direita
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 8;
      // Offset para mostrar a metade frontal da lâmina penetrada na rocha
      ctx.drawImage(kunaiImg, -kw / 2, -kh * 0.38, kw, kh);
      ctx.restore();

      // 1. Onda de Choque Ácida
      const shockR = 8 + p * 24;
      ctx.strokeStyle = 'rgba(74, 222, 128, ' + (1 - p) * 0.95 + ')';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.ellipse(impactX, impactY, shockR, shockR * 0.65, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, ' + (1 - p) * 0.8 + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(impactX, impactY, shockR * 0.75, shockR * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Explosão de Gotas de Veneno Corrosivo
      const venomDrops = [
        { dx: -14, dy: -16, r: 2.5 },
        { dx: -18, dy: 6, r: 2.2 },
        { dx: -10, dy: 14, r: 2.0 },
        { dx: -22, dy: -4, r: 1.8 },
        { dx: -8, dy: -22, r: 2.2 },
        { dx: -16, dy: -10, r: 2.0 }
      ];
      ctx.fillStyle = '#4ade80';
      venomDrops.forEach(d => {
        ctx.beginPath();
        ctx.arc(impactX + d.dx * p, impactY + d.dy * p, d.r * (1 - p * 0.5), 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Estilhas de Rocha Minada
      ctx.fillStyle = '#78716c';
      ctx.fillRect(impactX + 6 + p * 8, impactY - 10 - p * 6, 3, 3);
      ctx.fillRect(impactX + 10 + p * 6, impactY + 8 + p * 4, 3.5, 3);
      ctx.fillRect(impactX - 6 - p * 12, impactY + 12 + p * 6, 2.5, 2.5);

      // 4. Texto Flutuante de Crítico Shinobi
      ctx.save();
      const floatY = impactY - 8 - p * 18;
      ctx.font = '900 10px monospace';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#022c22';
      ctx.lineWidth = 3;
      ctx.strokeText('💥 KUNAI! -32', impactX, floatY);
      ctx.fillStyle = '#4ade80';
      ctx.fillText('💥 KUNAI! -32', impactX, floatY);
      ctx.restore();

      ctx.restore();
      return;
    }

    // FASE 4: RECUPERAÇÃO & SACAR NOVA KUNAI DO CINTO (0.72 a 1.00)
    const p = (swingProgress - 0.72) / 0.28;
    lungeX = 10 * (1 - p);
    bodyAngle = 0.20 * (1 - p);

    ctx.translate(lungeX, 0);
    ctx.rotate(bodyAngle);
    ctx.drawImage(frogShinobiImg, -fw / 2, -fh + 6, fw, fh);

    // Na segunda metade do reset, o sapinho já puxa uma nova Kunai com brilho
    if (p > 0.45) {
      const drawP = (p - 0.45) / 0.55;
      ctx.save();
      ctx.translate(11, -21);
      ctx.rotate(0.35);
      ctx.scale(drawP, drawP);
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 6;
      ctx.drawImage(kunaiImg, -kw / 2, -kh * 0.72, kw, kh);
      ctx.restore();
    }

    ctx.restore();
    return;
  }
  applyOutline(ctx);

  // Tronco de Sapo Shinobi
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.roundRect(-9, -2, 18, 15, 5);
  ctx.fill();
  ctx.stroke();

  // Colete Preto de Furtividade
  ctx.fillStyle = '#09090b';
  ctx.fillRect(-6, -1, 12, 14);
  ctx.strokeRect(-6, -1, 12, 14);

  // Cabeça Larga de Sapo
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.ellipse(0, -10, 12, 8.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Olhos Esbugalhados Cômicos no Topo da Cabeça
  // Olho Esquerdo
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(-6, -17, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-6, -17, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#09090b';
  ctx.fillRect(-6.5, -19.5, 1.8, 5);

  // Olho Direito
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(6, -17, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(6, -17, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#09090b';
  ctx.fillRect(5.5, -19.5, 1.8, 5);

  // Bandana Ninja com Protetor Metálico
  ctx.fillStyle = '#09090b';
  ctx.fillRect(-11, -14, 22, 5);
  // Placa de Metal
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-4.5, -14, 9, 5);
  ctx.strokeRect(-4.5, -14, 9, 5);

  // Máscara Ninja cobrindo a boca
  ctx.fillStyle = '#27272a';
  ctx.beginPath();
  ctx.roundRect(-8, -9, 16, 7, 3);
  ctx.fill();
  ctx.stroke();

  // === SAPINHO JOGANDO GOSMA VERDE (SLIME SPIT & THROW) ===
  ctx.save();
  ctx.translate(6, 0);

  if (!isMining) {
    // Modo caminhada: sapinho com gotícula de gosma verde borbulhando na mão
    const bubbleBob = Math.sin(now * 0.015) * 1.5;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(4, 2 + bubbleBob, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.arc(3, 1 + bubbleBob, 1.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Modo ataque: o sapinho cospe e arremessa projéteis de gosma verde
    const throwReach = Math.sin(swingProgress * Math.PI) * 4;
    ctx.translate(throwReach, -1);

    // Mãozinha verde estendida
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(3, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // TRAJETÓRIA E PROJÉTIL DE GOSMA VERDE
    const slimeDist = 6 + Math.min(26, swingProgress * 55);
    const slimeArcY = -Math.sin(swingProgress * Math.PI) * 8;

    // Grande Orbe / Projétil de Gosma Verde Ácida
    const slimeGrad = ctx.createRadialGradient(
      slimeDist, slimeArcY, 1,
      slimeDist, slimeArcY, 7
    );
    slimeGrad.addColorStop(0, '#86efac');
    slimeGrad.addColorStop(0.5, '#22c55e');
    slimeGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = slimeGrad;
    ctx.beginPath();
    ctx.ellipse(slimeDist, slimeArcY, 6, 4.5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Brilho e reflexo gelatinoso da gosma
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(slimeDist - 2, slimeArcY - 1.5, 2, 1.2, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Rastro de gotículas de slime no ar
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(slimeDist - 7, slimeArcY + 2, 2, 0, Math.PI * 2);
    ctx.arc(slimeDist - 13, slimeArcY + 4, 1.5, 0, Math.PI * 2);
    ctx.arc(slimeDist - 18, slimeArcY + 2, 1, 0, Math.PI * 2);
    ctx.fill();

    // IMPACTO DE GOSMA VERDE (SLIME SPLAT) NA ROCHA
    if (swingProgress >= 0.35) {
      const splatX = slimeDist + 5;
      const splatSize = Math.min(10, (swingProgress - 0.35) * 20);

      // Poça de gosma respingando no minério
      ctx.fillStyle = 'rgba(34, 197, 94, 0.85)';
      ctx.beginPath();
      ctx.ellipse(splatX, 0, splatSize, splatSize * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Gotas viscosas escorrendo e respingos pontiagudos
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(splatX + 3, -splatSize * 0.8, 2, 0, Math.PI * 2);
      ctx.arc(splatX + 5, splatSize * 0.6, 2.2, 0, Math.PI * 2);
      ctx.arc(splatX - 2, splatSize * 0.7, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Bolhas ácidas estourando
      ctx.fillStyle = '#bbf7d0';
      ctx.beginPath();
      ctx.arc(splatX + 1, -1, 1.5, 0, Math.PI * 2);
      ctx.arc(splatX - 2, 2, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore(); // Fecha gosma verde
}

// ----------------------------------------------------------------------------
// 4. MAGO ARCANO DO SUBSOLO (engineer / mage) - Cajado de Cristal & Bola de Fogo
// ----------------------------------------------------------------------------
let mageWizardImg = null;
let mageWizardLoaded = false;
let mageStaffImg = null;
let mageStaffLoaded = false;

export function initMageWizard() {
  if (typeof window === 'undefined') return;
  if (!mageWizardImg) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/mage_wizard.png?v=' + Date.now();
    img.onload = () => {
      mageWizardImg = img;
      mageWizardLoaded = true;
    };
  }
  if (!mageStaffImg) {
    const sImg = new Image();
    sImg.crossOrigin = 'anonymous';
    sImg.src = '/mage_staff.png?v=' + Date.now();
    sImg.onload = () => {
      mageStaffImg = sImg;
      mageStaffLoaded = true;
    };
  }
}

if (typeof window !== 'undefined') {
  initMageWizard();
}

export function drawWitch(ctx, now, swingAngle, legAngle, swingProgress = 0, isMining = false) {
  initMageWizard();

  // Se os sprites pixel art estiverem carregados, desenha a física completa com lançamento de Bola de Fogo
  if (mageWizardLoaded && mageWizardImg && mageStaffLoaded && mageStaffImg) {
    const mw = 34; // Largura padronizada
    const mh = 56; // Altura unificada (56px)
    const sw = 10; // Reduzido 1 grau/tier (era 14, agora 10px mantendo aspect ratio 53:195)
    const sh = 36; // Reduzido 1 grau/tier (era 48, agora 36px - altura equilibrada com o mago de 56px)

    // =========================================================================
    // 1. MODO REPOUSO & CAMINHADA (IDLE / WALKING)
    // =========================================================================
    if (!isMining) {
      ctx.save();
      ctx.translate(0, 16); // Pivot na base dos pés

      // Flutuação mágica / levitação & respiração arcana
      const floatBob = Math.sin(now * 0.012) * 2.2;
      const breathScaleY = 1 + Math.sin(now * 0.01) * 0.03;
      const breathScaleX = 1 - Math.sin(now * 0.01) * 0.02;
      const tilt = Math.sin(now * 0.01) * 0.04;

      ctx.translate(0, -floatBob);
      ctx.rotate(tilt);
      ctx.scale(breathScaleX, breathScaleY);

      // Desenha o corpo do Mago com chapéu pontudo e manto
      ctx.drawImage(mageWizardImg, -mw / 2, -mh + 6, mw, mh);

      // Cajado empunhado na mão direita frontal com a ponta voltada para cima
      ctx.save();
      ctx.translate(11, 4);
      ctx.rotate(-0.06 + Math.sin(now * 0.012) * 0.04);
      ctx.drawImage(mageStaffImg, -sw / 2, -sh * 0.68, sw, sh);

      // Brilho ardente e brasas dançando no cristal do topo do cajado
      const crystalY = -sh * 0.68 + 4;
      const flamePulse = (Math.sin(now * 0.02) + 1) * 0.5;

      ctx.fillStyle = 'rgba(249, 115, 22, 0.45)';
      ctx.beginPath();
      ctx.arc(0, crystalY, 7 + flamePulse * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, crystalY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Partículas de faíscas ígneas subindo
      const emberBob = (now * 0.02) % 10;
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-2 + Math.sin(now * 0.015) * 3, crystalY - emberBob, 2, 2);

      ctx.restore(); // Fecha cajado

      ctx.restore(); // Fecha modo idle
      return;
    }

    // =========================================================================
    // 2. MODO ATAQUE: DISPARO DE BOLA DE FOGO (FIREBALL) NA ROCHA!
    // =========================================================================
    ctx.save();
    ctx.translate(0, 16); // Pivot nos pés

    let lungeX = 0;
    let bodyAngle = 0;
    let scaleY = 1;
    let scaleX = 1;

    // FASE 1: CONCENTRAÇÃO ARCANA & CARREGAMENTO DO FOGO (0.00 a 0.25)
    if (swingProgress < 0.25) {
      const p = swingProgress / 0.25;
      lungeX = -4 * p;
      bodyAngle = -0.14 * p; // Recuo preparando a conjuração
      scaleY = 1 + 0.05 * p;
      scaleX = 1 - 0.03 * p;

      ctx.translate(lungeX, 0);
      ctx.rotate(bodyAngle);
      ctx.scale(scaleX, scaleY);

      // Desenha Mago
      ctx.drawImage(mageWizardImg, -mw / 2, -mh + 6, mw, mh);

      // Cajado erguido lá no alto canalizando a chama
      const handX = 12 - 6 * p;
      const handY = 4 - 10 * p;
      const staffAngle = -0.06 - 0.42 * p;

      ctx.save();
      ctx.translate(handX, handY);
      ctx.rotate(staffAngle);
      ctx.drawImage(mageStaffImg, -sw / 2, -sh * 0.68, sw, sh);

      // Esfera de Fogo Concentrando no Cristal do Cajado
      const crystalY = -sh * 0.68 + 4;
      const chargeR = 4 + p * 12;

      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 10 * p;

      const fGrad = ctx.createRadialGradient(0, crystalY, 1, 0, crystalY, chargeR);
      fGrad.addColorStop(0, '#ffffff');
      fGrad.addColorStop(0.3, '#fef08a');
      fGrad.addColorStop(0.7, '#f97316');
      fGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = fGrad;
      ctx.beginPath();
      ctx.arc(0, crystalY, chargeR, 0, Math.PI * 2);
      ctx.fill();

      // Faíscas giratórias ao redor do orbe
      const sparkAng = now * 0.02;
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(Math.cos(sparkAng) * (chargeR + 2), crystalY + Math.sin(sparkAng) * (chargeR + 2), 2.5, 2.5);
      ctx.fillRect(Math.cos(sparkAng + Math.PI) * (chargeR + 2), crystalY + Math.sin(sparkAng + Math.PI) * (chargeR + 2), 2.5, 2.5);

      ctx.restore();

      ctx.restore();
      return;
    }

    // FASE 2: O DISPARO DA BOLA DE FOGO (0.25 a 0.52)
    if (swingProgress < 0.52) {
      const p = (swingProgress - 0.25) / 0.27;
      lungeX = -4 + p * 12; // Avanço frontal de conjuração
      bodyAngle = -0.14 + p * 0.32; // Inclina tronco para frente (+0.18 rad)
      scaleY = 1 - 0.06 * Math.sin(p * Math.PI);
      scaleX = 1 + 0.06 * Math.sin(p * Math.PI);

      ctx.translate(lungeX, 0);
      ctx.rotate(bodyAngle);
      ctx.scale(scaleX, scaleY);

      // Desenha o Mago
      ctx.drawImage(mageWizardImg, -mw / 2, -mh + 6, mw, mh);

      // Cajado apontado para a frente em direção ao alvo
      const handX = 6 + p * 10;
      const handY = -6 + p * 8;
      const staffAngle = -0.48 + p * 1.05; // Gira apontando para a rocha

      ctx.save();
      ctx.translate(handX, handY);
      ctx.rotate(staffAngle);
      ctx.drawImage(mageStaffImg, -sw / 2, -sh * 0.68, sw, sh);
      ctx.restore();

      ctx.restore(); // Fecha transformação do corpo

      // TRAJETÓRIA E VÔO DA BOLA DE FOGO
      ctx.save();
      ctx.translate(0, 16);

      const pFly = Math.pow(p, 0.78); // Velocidade hipersônica de lançamento
      const startX = 22 + lungeX;
      const startY = -22;
      const targetX = 48;
      const targetY = -10;

      const fx = startX + (targetX - startX) * pFly;
      const fy = startY + (targetY - startY) * pFly - Math.sin(p * Math.PI) * 6; // Curva de fogo

      // 1. Cauda / Rastro de Chamas Alongado
      const tailLen = 20 + Math.sin(p * Math.PI) * 14;
      const tailGrad = ctx.createLinearGradient(fx - tailLen, fy, fx, fy);
      tailGrad.addColorStop(0, 'rgba(220, 38, 38, 0)');
      tailGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.85)');
      tailGrad.addColorStop(1, '#fef08a');
      ctx.fillStyle = tailGrad;
      ctx.beginPath();
      ctx.moveTo(fx, fy - 6);
      ctx.quadraticCurveTo(fx - tailLen * 0.5, fy - 8, fx - tailLen, fy);
      ctx.quadraticCurveTo(fx - tailLen * 0.5, fy + 8, fx, fy + 6);
      ctx.closePath();
      ctx.fill();

      // 2. Núcleo Incandescente da Bola de Fogo
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 14;

      const ballGrad = ctx.createRadialGradient(fx, fy, 1, fx, fy, 8);
      ballGrad.addColorStop(0, '#ffffff');
      ballGrad.addColorStop(0.25, '#fef08a');
      ballGrad.addColorStop(0.65, '#f97316');
      ballGrad.addColorStop(1, '#dc2626');
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(fx, fy, 8, 0, Math.PI * 2);
      ctx.fill();

      // 3. Faíscas de brasas vivas flutuando no rastro
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(fx - 14, fy - 4, 3, 3);
      ctx.fillRect(fx - 22, fy + 3, 2.5, 2.5);
      ctx.fillRect(fx - 28, fy - 2, 2, 2);

      ctx.restore();
      return;
    }

    // FASE 3: EXPLOSÃO CATACLÍSMICA NA ROCHA (0.52 a 0.76)
    if (swingProgress < 0.76) {
      const p = (swingProgress - 0.52) / 0.24;
      lungeX = 8;
      bodyAngle = 0.18;

      ctx.translate(lungeX, 0);
      ctx.rotate(bodyAngle);
      ctx.drawImage(mageWizardImg, -mw / 2, -mh + 6, mw, mh);

      // Cajado mantido na postura de impacto
      ctx.save();
      ctx.translate(16, 2);
      ctx.rotate(0.57);
      ctx.drawImage(mageStaffImg, -sw / 2, -sh * 0.68, sw, sh);
      ctx.restore();

      ctx.restore(); // Fecha transformação do corpo

      // EXPLOSÃO DE FOGO NA ROCHA ALVO
      ctx.save();
      ctx.translate(0, 16);

      const impactX = 48;
      const impactY = -10;

      // 1. Onda de Choque Ígnea Expansiva
      const blastR = 10 + p * 26;
      ctx.strokeStyle = 'rgba(249, 115, 22, ' + (1 - p) * 0.95 + ')';
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.ellipse(impactX, impactY, blastR, blastR * 0.7, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(254, 240, 138, ' + (1 - p) * 0.8 + ')';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(impactX, impactY, blastR * 0.7, blastR * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Labaredas e Chamas de Explosão Radial
      const flameAngles = [-0.95, -0.6, -0.2, 0.15, 0.55, 0.9, -1.35];
      flameAngles.forEach((ang, idx) => {
        const dist = (8 + idx * 4) * p * 1.6;
        const fxX = impactX + Math.cos(ang) * dist;
        const fxY = impactY + Math.sin(ang) * dist;
        const fSize = Math.max(1.5, (5.5 - idx * 0.5) * (1 - p * 0.6));
        ctx.fillStyle = idx % 2 === 0 ? '#f97316' : '#fbbf24';
        ctx.beginPath();
        ctx.arc(fxX, fxY, fSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Estilhas e Fragmentos de Rocha em Brasas
      ctx.fillStyle = '#78716c';
      ctx.fillRect(impactX + 6 + p * 8, impactY - 10 - p * 6, 3, 3);
      ctx.fillRect(impactX + 10 + p * 6, impactY + 8 + p * 4, 3.5, 3);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(impactX - 6 - p * 10, impactY + 12 + p * 4, 2.5, 2.5);

      // 4. Texto Flutuante de Crítico de Fogo
      ctx.save();
      const floatY = impactY - 10 - p * 18;
      ctx.font = '900 10px monospace';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 3;
      ctx.strokeText('🔥 BOLA DE FOGO! -48', impactX, floatY);
      ctx.fillStyle = '#fde047';
      ctx.fillText('🔥 BOLA DE FOGO! -48', impactX, floatY);
      ctx.restore();

      ctx.restore();
      return;
    }

    // FASE 4: RECUPERAÇÃO & RESFRIAMENTO DO CAJADO (0.76 a 1.00)
    const p = (swingProgress - 0.76) / 0.24;
    lungeX = 8 * (1 - p);
    bodyAngle = 0.18 * (1 - p);

    ctx.translate(lungeX, 0);
    ctx.rotate(bodyAngle);
    ctx.drawImage(mageWizardImg, -mw / 2, -mh + 6, mw, mh);

    // Cajado retornando à postura inicial
    const handX = 16 - p * 4;
    const handY = 2 + p * 2;
    const staffAngle = 0.57 * (1 - p) - 0.06 * p;

    ctx.save();
    ctx.translate(handX, handY);
    ctx.rotate(staffAngle);
    ctx.drawImage(mageStaffImg, -sw / 2, -sh * 0.68, sw, sh);

    // Fumaça cinza subindo da ponta do cristal se dissipando
    const crystalY = -sh * 0.68 + 4;
    ctx.fillStyle = 'rgba(148, 163, 184, ' + (1 - p) * 0.5 + ')';
    ctx.beginPath();
    ctx.arc(0, crystalY - p * 8, 3 + p * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    ctx.restore();
    return;
  }
  applyOutline(ctx);

  // Vestido / Manto Roxo Estelar
  const robeGrad = ctx.createLinearGradient(0, -1, 0, 14);
  robeGrad.addColorStop(0, '#7e22ce');
  robeGrad.addColorStop(1, '#3b0764');
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.roundRect(-9, -1, 18, 15, 3);
  ctx.fill();
  ctx.stroke();

  // Capa Roxa Esvoaçante
  ctx.fillStyle = '#9333ea';
  ctx.beginPath();
  ctx.moveTo(-10, 0); ctx.lineTo(-13, 15); ctx.lineTo(-9, 13);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cabeça Doce de Feiticeira
  ctx.fillStyle = '#fce7f3';
  ctx.beginPath();
  ctx.arc(0, -10, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Olhos Roxos Brilhantes Curiosos
  ctx.fillStyle = '#581c87';
  ctx.beginPath();
  ctx.arc(-3.5, -10.5, 2.2, 0, Math.PI * 2);
  ctx.arc(3.5, -10.5, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-4.5, -12, 1.2, 1.2);
  ctx.fillRect(2.5, -12, 1.2, 1.2);

  // Chapéu Cônico de Bruxa com Borda Larga
  ctx.fillStyle = '#581c87';
  ctx.beginPath();
  ctx.ellipse(0, -14, 15, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Copa Curvada do Chapéu
  ctx.beginPath();
  ctx.moveTo(-9, -15);
  ctx.quadraticCurveTo(-3, -27, 8, -32);
  ctx.quadraticCurveTo(3, -24, 9, -15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Fivela Dourada do Chapéu
  ctx.fillStyle = '#facc15';
  ctx.fillRect(-4, -18, 8, 4);
  ctx.strokeRect(-4, -18, 8, 4);

  // === CAJADO ARCANO COM DISPARO DE FEIXE MÁGICO ===
  ctx.save();
  ctx.translate(9, 2);

  if (!isMining) {
    // Modo caminhada: cajado erguido em repouso
    ctx.rotate(-0.2 + Math.sin(now * 0.02) * 0.08);
  } else {
    // Aponta o cajado para a rocha e dispara raios
    ctx.rotate(-0.85);

    // Feixe Mágico Violeta Pulsante saindo do Cristal
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.lineTo(16, -32);
    ctx.stroke();

    // Anéis de Energia Expansivos
    const ringRad = 4 + (Math.sin(now * 0.03) + 1) * 3;
    ctx.strokeStyle = 'rgba(232, 121, 249, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(10, -32, ringRad, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Bastão de Madeira Encantada
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-2, -26, 4, 26);
  ctx.strokeRect(-2, -26, 4, 26);

  // Cristal de Ametista Pulsante no Topo
  const crystalGlow = Math.sin(now * 0.01) * 2;
  ctx.fillStyle = '#c084fc';
  ctx.beginPath();
  ctx.moveTo(0, -36 + crystalGlow);
  ctx.lineTo(6, -29 + crystalGlow);
  ctx.lineTo(0, -22 + crystalGlow);
  ctx.lineTo(-6, -29 + crystalGlow);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-2, -31 + crystalGlow, 3, 3);

  ctx.restore();
}

export const drawMage = drawWitch;

// ----------------------------------------------------------------------------
// 5. VAMPIRO DAS PROFUNDEZAS (mage) - Foice Noturna de Sangue
// ----------------------------------------------------------------------------
let vampireDraculaImg = null;
let vampireDraculaLoaded = false;
let vampireScytheImg = null;
let vampireScytheLoaded = false;

export function initVampire() {
  if (typeof window === 'undefined') return;
  if (!vampireDraculaImg) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/vampire_dracula.png?v=' + Date.now();
    img.onload = () => {
      vampireDraculaImg = img;
      vampireDraculaLoaded = true;
    };
  }
  if (!vampireScytheImg) {
    const sImg = new Image();
    sImg.crossOrigin = 'anonymous';
    sImg.src = '/vampire_scythe.png?v=' + Date.now();
    sImg.onload = () => {
      vampireScytheImg = sImg;
      vampireScytheLoaded = true;
    };
  }
}

if (typeof window !== 'undefined') {
  initVampire();
}

export function drawVampire(ctx, now, swingAngle, legAngle, swingProgress = 0, isMining = false) {
  initVampire();

  // Se os sprites pixel art estiverem carregados, desenha a física completa do Conde Vampiro e Foice Noturna
  if (vampireDraculaLoaded && vampireDraculaImg && vampireScytheLoaded && vampireScytheImg) {
    const vw = 36; // Largura padronizada
    const vh = 56; // Altura unificada (56px)
    const sw = 24;
    const sh = 62;

    // =========================================================================
    // 1. MODO REPOUSO & CAMINHADA (IDLE / WALKING)
    // =========================================================================
    if (!isMining) {
      ctx.save();
      ctx.translate(0, 16); // Pivot na base dos pés

      // Levitação nobre / flutuação aristocrática e tremular da capa
      const glideBob = Math.sin(now * 0.012) * 2.2;
      const capeWave = Math.sin(now * 0.015) * 0.04;
      const breathY = 1 + Math.sin(now * 0.01) * 0.025;
      const breathX = 1 - Math.sin(now * 0.01) * 0.015;

      ctx.translate(0, -glideBob);
      ctx.rotate(capeWave);
      ctx.scale(breathX, breathY);

      // Desenha o corpo do Conde Vampiro
      ctx.drawImage(vampireDraculaImg, -vw / 2, -vh + 6, vw, vh);

      // Foice Noturna de Sangue empunhada com garbo na mão frontal direita
      ctx.save();
      ctx.translate(13, -2);
      ctx.rotate(0.12 + Math.sin(now * 0.014) * 0.04);

      // Sombra e Foice
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 6;
      ctx.drawImage(vampireScytheImg, -sw * 0.45, -sh * 0.65, sw, sh);

      // Brilho do rubi de sangue no topo da haste
      const rubyPulse = (Math.sin(now * 0.02) + 1) * 0.5;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -sh * 0.65 + 18, 2 + rubyPulse, 0, Math.PI * 2);
      ctx.fill();

      // Micro-névoa carmesim flutuando na lâmina
      const mistY = -sh * 0.65 + 4 - ((now * 0.02) % 10);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
      ctx.beginPath();
      ctx.arc(10 + Math.sin(now * 0.015) * 3, mistY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // Fecha foice

      ctx.restore(); // Fecha idle
      return;
    }

    // =========================================================================
    // 2. MODO ATAQUE: GOLPE CEIFADOR HORIZONTAL DE FOICE NOTURNA!
    // =========================================================================
    ctx.save();
    ctx.translate(0, 16); // Pivot nos pés

    let lungeX = 0;
    let bodyAngle = 0;
    let scytheAngle = 0;
    let handX = 13;
    let handY = -2;
    let scaleY = 1;
    let scaleX = 1;

    // FASE 1: ANTECIPAÇÃO / ARMAR A CEIFADA HORIZONTAL PARA TRÁS (0.00 a 0.28)
    if (swingProgress < 0.28) {
      const p = swingProgress / 0.28;
      lungeX = -4 * p;
      bodyAngle = -0.12 * p; // Recuo aristocrático preparando a ceifada
      scytheAngle = 0.12 - 1.52 * p; // Gira a foice para trás na horizontal (-1.40 rad ≈ -80°)
      handX = 13 - 15 * p; // Puxa a mão para trás (até -2px)
      handY = -2 - 8 * p; // Ergue a empunhadura para a altura do corte (-10px)
      scaleY = 1 + 0.04 * p;

      ctx.translate(lungeX, 0);
      ctx.rotate(bodyAngle);
      ctx.scale(scaleX, scaleY);

      // Desenha corpo
      ctx.drawImage(vampireDraculaImg, -vw / 2, -vh + 6, vw, vh);

      // Foice engatada horizontalmente para trás
      ctx.save();
      ctx.translate(handX, handY);
      ctx.rotate(scytheAngle);
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 8 * p;
      ctx.drawImage(vampireScytheImg, -sw * 0.45, -sh * 0.65, sw, sh);

      // Aura carmesim reunindo poder vampírico na lâmina
      ctx.fillStyle = 'rgba(220, 38, 38, ' + (0.3 + 0.4 * p) + ')';
      ctx.beginPath();
      ctx.arc(8, -sh * 0.65 + 6, 6 + p * 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      ctx.restore();
      return;
    }

    // FASE 2: O GOLPE CEIFADOR HORIZONTAL RASGANTE (0.28 a 0.58)
    if (swingProgress < 0.58) {
      const p = (swingProgress - 0.28) / 0.30;
      const pCleave = p * p * (3 - 2 * p); // Aceleração violenta sobrenatural
      lungeX = -4 + pCleave * 18; // Avanço vampírico frontal (+14px)
      bodyAngle = -0.12 + pCleave * 0.30; // Inclina tronco no plano do corte (+0.18 rad)
      scytheAngle = -1.40 + pCleave * 2.75; // Varredura horizontal rasgando o ar até +1.35 rad (cravando na rocha!)
      handX = -2 + pCleave * 16; // Braço projeta a foice em linha horizontal (até 14px)
      handY = -10 + Math.sin(p * Math.PI) * 1.5; // Mantém a lâmina firme na linha de corte
      scaleY = 1 - 0.06 * Math.sin(p * Math.PI);
      scaleX = 1 + 0.06 * Math.sin(p * Math.PI);

      ctx.translate(lungeX, 0);
      ctx.rotate(bodyAngle);
      ctx.scale(scaleX, scaleY);

      // Desenha corpo
      ctx.drawImage(vampireDraculaImg, -vw / 2, -vh + 6, vw, vh);

      // Foice cortando horizontalmente
      ctx.save();
      ctx.translate(handX, handY);
      ctx.rotate(scytheAngle);
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 12;
      ctx.drawImage(vampireScytheImg, -sw * 0.45, -sh * 0.65, sw, sh);
      ctx.restore();

      ctx.restore(); // Fecha transformação do corpo

      // CRESCENTE DE CORTE CARMESIM HORIZONTAL NO AR
      if (p > 0.25) {
        ctx.save();
        ctx.translate(0, 16);

        const impactX = 48;
        const impactY = -10;

        // 1. Grande Rastro Carmesim Horizontal (Lâmina Ceifadora)
        const slashP = (p - 0.25) / 0.75;
        const startX = handX + 6;
        const endX = impactX + 16 * slashP;
        const midX = (startX + endX) * 0.5;
        const slashY = impactY;

        ctx.strokeStyle = 'rgba(220, 38, 38, ' + (0.5 + 0.5 * slashP) + ')';
        ctx.lineWidth = 4.8;
        ctx.beginPath();
        ctx.moveTo(startX, slashY - 4);
        ctx.quadraticCurveTo(midX, slashY + 5, endX, slashY - 2);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(startX + 6, slashY - 3);
        ctx.quadraticCurveTo(midX, slashY + 4, endX - 2, slashY - 2);
        ctx.stroke();

        // 2. Morcegos fantasmagóricos voando na esteira horizontal do corte
        const bx = startX + (endX - startX) * slashP;
        const by = slashY - 6 - Math.sin(slashP * Math.PI) * 8;
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx - 5, by - 4);
        ctx.lineTo(bx - 2, by + 1);
        ctx.lineTo(bx + 2, by + 1);
        ctx.lineTo(bx + 5, by - 4);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      return;
    }

    // FASE 3: IMPACTO HORIZONTAL DEVASTADOR, CRAVAÇÃO & DRENO VAMPÍRICO (0.58 a 0.78)
    if (swingProgress < 0.78) {
      const p = (swingProgress - 0.58) / 0.20;
      lungeX = 14;
      bodyAngle = 0.18;
      scytheAngle = 1.35; // Foice engatada horizontalmente cortando a rocha
      handX = 14;
      handY = -10;

      ctx.translate(lungeX, 0);
      ctx.rotate(bodyAngle);
      ctx.drawImage(vampireDraculaImg, -vw / 2, -vh + 6, vw, vh);

      // Foice Cravada Horizontalmente na Rocha com tremor
      const tremor = Math.sin((swingProgress - 0.58) * 75) * 2.0 * (1 - p);
      ctx.save();
      ctx.translate(handX + tremor, handY);
      ctx.rotate(scytheAngle);
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 10;
      ctx.drawImage(vampireScytheImg, -sw * 0.45, -sh * 0.65, sw, sh);
      ctx.restore();

      ctx.restore(); // Fecha transformação do corpo

      // EFEITOS DE IMPACTO NA ROCHA
      ctx.save();
      ctx.translate(0, 16);

      const impactX = 48;
      const impactY = -10;

      // 1. Onda de Choque Carmesim Horizontal (Elipse Achatada)
      const shockR = 10 + p * 26;
      ctx.strokeStyle = 'rgba(220, 38, 38, ' + (1 - p) * 0.95 + ')';
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.ellipse(impactX, impactY, shockR * 1.35, shockR * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, ' + (1 - p) * 0.8 + ')';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(impactX, impactY, shockR * 0.9, shockR * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Gotas de Sangue Místico Espirrando Horizontalmente
      const bloodDrops = [
        { dx: -22, dy: -6, r: 2.6 },
        { dx: 18, dy: -2, r: 2.4 },
        { dx: -14, dy: 6, r: 2.2 },
        { dx: 24, dy: 4, r: 2.0 },
        { dx: -10, dy: -12, r: 2.2 },
        { dx: 12, dy: -8, r: 2.0 }
      ];
      ctx.fillStyle = '#dc2626';
      bloodDrops.forEach(d => {
        ctx.beginPath();
        ctx.arc(impactX + d.dx * p, impactY + d.dy * p, d.r * (1 - p * 0.5), 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Estilhas de Pedra Sombria
      ctx.fillStyle = '#52525b';
      ctx.fillRect(impactX + 6 + p * 10, impactY - 4 - p * 4, 3, 3);
      ctx.fillRect(impactX + 12 + p * 8, impactY + 4 + p * 2, 3.5, 3);
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(impactX - 8 - p * 12, impactY + 2 + p * 4, 2.5, 2.5);

      // 4. Texto Flutuante de Crítico Vampírico
      ctx.save();
      const floatY = impactY - 10 - p * 18;
      ctx.font = '900 10px monospace';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 3;
      ctx.strokeText('🩸 CEIFADA HORIZONTAL! -44', impactX, floatY);
      ctx.fillStyle = '#f87171';
      ctx.fillText('🩸 CEIFADA HORIZONTAL! -44', impactX, floatY);
      ctx.restore();

      ctx.restore();
      return;
    }

    // FASE 4: RETRAÇÃO ARISTOCRÁTICA & RECUPERAÇÃO (0.78 a 1.00)
    const p = (swingProgress - 0.78) / 0.22;
    lungeX = 14 * (1 - p);
    bodyAngle = 0.18 * (1 - p);
    scytheAngle = 1.35 * (1 - p) + 0.12 * p; // Gira suavemente da horizontal para a vertical de guarda
    handX = 14 - p * 1;
    handY = -10 * (1 - p) + (-2) * p; // Retorna da altura de corte para a guarda

    ctx.translate(lungeX, 0);
    ctx.rotate(bodyAngle);
    ctx.drawImage(vampireDraculaImg, -vw / 2, -vh + 6, vw, vh);

    ctx.save();
    ctx.translate(handX, handY);
    ctx.rotate(scytheAngle);
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 6 * (1 - p);
    ctx.drawImage(vampireScytheImg, -sw * 0.45, -sh * 0.65, sw, sh);
    ctx.restore();

    ctx.restore();
    return;
  }

  // FALLBACK VETORIAL PROCEDURAL (caso as imagens estejam carregando no 1º frame)
  applyOutline(ctx);

  // Manto Noturno Negro
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.roundRect(-9, -1, 18, 15, 3);
  ctx.fill();
  ctx.stroke();

  // Camisa Vermelho Carmesim
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(-4, -1, 8, 12);
  ctx.strokeRect(-4, -1, 8, 12);

  // Colarinho Alto Draculinha
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(-9, -10); ctx.lineTo(-13, -1); ctx.lineTo(-6, -1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(9, -10); ctx.lineTo(13, -1); ctx.lineTo(6, -1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cabeça Pálida Elegante
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.arc(0, -10, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Olhos Carmesim Hipnóticos
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(-3.5, -11, 2.2, 0, Math.PI * 2);
  ctx.arc(3.5, -11, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-4.5, -12.5, 1, 1);
  ctx.fillRect(2.5, -12.5, 1, 1);

  // Presas de Vampiro Brancas
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(-3, -7); ctx.lineTo(-2, -4); ctx.lineTo(-1, -7);
  ctx.moveTo(1, -7); ctx.lineTo(2, -4); ctx.lineTo(3, -7);
  ctx.fill();

  // Cabelo Negro com Penteado de Viúva
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.arc(0, -11, 8.5, Math.PI, 0);
  ctx.lineTo(0, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Asas Espectrais de Morcego
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.moveTo(-11, -12);
  ctx.lineTo(-15, -24);
  ctx.lineTo(-7, -15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(11, -12);
  ctx.lineTo(15, -24);
  ctx.lineTo(7, -15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // === FOICE NOTURNA DE SANGUE ===
  ctx.save();
  ctx.translate(9, 2);

  if (!isMining) {
    // Foice repousada nas costas
    ctx.rotate(0.55 + Math.sin(now * 0.02) * 0.08);
  } else {
    // Corte rasgante em foice com névoa carmesim
    const scytheAngle = -Math.sin(swingProgress * Math.PI) * 1.4;
    ctx.rotate(scytheAngle);

    if (swingProgress > 0.3 && swingProgress < 0.7) {
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -22, 16, -0.4, Math.PI * 0.7);
      ctx.stroke();
    }
  }

  // Cabo Obsidiana
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-2, -26, 4, 26);
  ctx.strokeRect(-2, -26, 4, 26);

  // Lâmina em Foice Carmesim
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(-3, -26);
  ctx.quadraticCurveTo(10, -32, 17, -22);
  ctx.quadraticCurveTo(8, -19, -3, -16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// Helper: Desenha uma Foice Kama Tática de Energia Ciano Neon (Arma Oficial do Shadow Shinobi)
function drawSingleCyberKama(ctx) {
  // 1. Cabo tático negro reforçado com envoltório de empunhadura
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(-2.2, -22, 4.4, 22, 1.5);
  ctx.fill();
  ctx.stroke();

  // Grips táticos
  ctx.fillStyle = '#1e293b';
  for (let gy = -18; gy <= -4; gy += 4) {
    ctx.fillRect(-2, gy, 4, 1.6);
  }

  // Pomo com spike inferior de energia ciano
  ctx.fillStyle = '#00f0ff';
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(0, 4.5);
  ctx.lineTo(2, 0);
  ctx.closePath();
  ctx.fill();

  // 2. Cabeça metálica da picareta/kama
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(-4.5, -25.5, 9, 5, 1.5);
  ctx.fill();
  ctx.stroke();

  // Contra-espigão traseiro com ponta ciano
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(-4.5, -25);
  ctx.lineTo(-9.5, -23.5);
  ctx.lineTo(-4.5, -21.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#00f0ff';
  ctx.beginPath();
  ctx.moveTo(-7, -24.5);
  ctx.lineTo(-10, -23.5);
  ctx.lineTo(-7, -22);
  ctx.closePath();
  ctx.fill();

  // 3. Lâmina em foice curva frontal de energia ciano (Curved Scythe Blade)
  ctx.save();
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 6;

  const bladeGrad = ctx.createLinearGradient(4, -26, 20, -13);
  bladeGrad.addColorStop(0, '#0f172a');
  bladeGrad.addColorStop(0.4, '#0284c7');
  bladeGrad.addColorStop(1, '#00f0ff');
  ctx.fillStyle = bladeGrad;
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 1.6;

  ctx.beginPath();
  ctx.moveTo(3, -25.5);
  ctx.quadraticCurveTo(14, -29.5, 21.5, -19);
  ctx.lineTo(21.5, -17.5);
  ctx.quadraticCurveTo(13, -19.5, 3, -21);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Filamento central de plasma branco super brilhante
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(4, -24.5);
  ctx.quadraticCurveTo(13, -27.5, 19.5, -18.5);
  ctx.quadraticCurveTo(12, -21, 4, -22);
  ctx.closePath();
  ctx.fill();

  // Glifos cibernéticos de neon
  ctx.fillStyle = '#00f0ff';
  ctx.fillRect(8, -26, 2, 1.2);
  ctx.fillRect(12, -25, 2, 1.2);
  ctx.fillRect(16, -23, 1.8, 1.2);

  ctx.restore();
}

// ----------------------------------------------------------------------------
// 6. MINERADOR CLÁSSICO & PICARETA (legendary / golem) - Capacete Amarelo & Golpe Devastador
// ----------------------------------------------------------------------------
let minerDiggerImg = null;
let minerDiggerLoaded = false;
let minerPickaxeImg = null;
let minerPickaxeLoaded = false;

export function initClassicMiner() {
  if (typeof window === 'undefined') return;
  if (!minerDiggerImg) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/miner_digger.png?v=' + Date.now();
    img.onload = () => {
      minerDiggerImg = img;
      minerDiggerLoaded = true;
    };
  }
  if (!minerPickaxeImg) {
    const pImg = new Image();
    pImg.crossOrigin = 'anonymous';
    pImg.src = '/miner_pickaxe.png?v=' + Date.now();
    pImg.onload = () => {
      minerPickaxeImg = pImg;
      minerPickaxeLoaded = true;
    };
  }
}

if (typeof window !== 'undefined') {
  initClassicMiner();
}

export const drawGolem = (ctx, now, swingAngle, legAngle, swingProgress = 0, isMining = false) =>
  drawClassicMiner(ctx, now, swingAngle, legAngle, swingProgress, isMining);

export function drawClassicMiner(ctx, now, swingAngle, legAngle, swingProgress = 0, isMining = false) {
  initClassicMiner();

  if (minerDiggerLoaded && minerDiggerImg && minerPickaxeLoaded && minerPickaxeImg) {
    const mw = 42; // Largura do minerador
    const mh = 56; // Altura unificada (56px)
    const pw = 42; // Largura da picareta
    const ph = 42; // Altura da picareta

    // Posição da lanterna do capacete
    const lampRelX = 5;
    const lampRelY = -mh + 22;

    // =========================================================================
    // 1. MODO REPOUSO & CAMINHADA (IDLE / WALKING)
    // =========================================================================
    if (!isMining) {
      ctx.save();
      ctx.translate(0, 16); // Pivot na base dos pés

      const walkBob = Math.abs(Math.sin(now * 0.012)) * 1.8;
      const bodySway = Math.sin(now * 0.012) * 0.04;
      const breathY = 1 + Math.sin(now * 0.01) * 0.02;
      const breathX = 1 - Math.sin(now * 0.01) * 0.01;

      // Sombra suave sob os pés
      ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
      ctx.beginPath();
      ctx.ellipse(0, -1, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(0, -walkBob);
      ctx.rotate(bodySway);
      ctx.scale(breathX, breathY);

      // Desenha o corpo do Minerador
      ctx.drawImage(minerDiggerImg, -mw / 2, -mh + 6, mw, mh);

      // Facho de luz dourada/branca projetado pela lanterna do capacete
      ctx.save();
      const coneGrad = ctx.createRadialGradient(lampRelX, lampRelY, 2, lampRelX + 38, lampRelY + 8, 55);
      coneGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      coneGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(lampRelX, lampRelY);
      ctx.arc(lampRelX, lampRelY, 55, -0.22, 0.32);
      ctx.closePath();
      ctx.fill();

      // Bulbo brilhante da lanterna
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(lampRelX, lampRelY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Picareta apoiada na mão direita em postura relaxada
      ctx.save();
      ctx.translate(12, -14);
      ctx.rotate(0.24 + Math.sin(now * 0.012) * 0.04);
      ctx.drawImage(minerPickaxeImg, -4, -ph + 4, pw, ph);

      // Mão de luva branca segurando o cabo
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#272535';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(-4, -4, 8, 8, 2.5);
      ctx.fill();
      ctx.stroke();

      ctx.restore(); // Fecha picareta

      ctx.restore(); // Fecha idle
      return;
    }

    // =========================================================================
    // 2. MODO MINERAÇÃO: GOLPE DEMOLIDOR COM A PICARETA CONTRA A ROCHA
    // =========================================================================
    ctx.save();
    ctx.translate(0, 16); // Pivot nos pés

    let lungeX = 0;
    let bodyAngle = 0;
    let pickAngle = 0;
    let handX = 8;
    let handY = -14;
    let scaleY = 1;
    let scaleX = 1;

    // FASE 1: ANTECIPAÇÃO / ERGUER PICARETA ACIMA DA CABEÇA (0.00 a 0.32)
    if (swingProgress < 0.32) {
      const p = swingProgress / 0.32;
      lungeX = -4 * p;
      bodyAngle = -0.16 * p; // Recuo e arqueamento do tronco
      // A picareta sobe de 0.24 rad até -1.65 rad (alta atrás do capacete)
      pickAngle = 0.24 - p * (0.24 + 1.65);
      handX = 10 - 7 * p;
      handY = -14 - 8 * p;
      scaleY = 1 + 0.05 * p;
    }
    // FASE 2: GOLPE DESCENDENTE ACELERADO (0.32 a 0.58)
    else if (swingProgress < 0.58) {
      const p = (swingProgress - 0.32) / 0.26;
      lungeX = -4 + p * 12; // Avanço corporal para frente (+8px)
      bodyAngle = -0.16 + p * 0.32; // Tronco projeta-se no impacto (+0.16 rad)
      // Picareta desce cortando o ar até fincar na rocha (+0.65 rad)
      pickAngle = -1.65 + Math.pow(p, 1.7) * 2.30;
      handX = 3 + p * 8;
      handY = -22 + p * 12;
      scaleY = 1 - 0.04 * Math.sin(p * Math.PI);
    }
    // FASE 3: IMPACTO, PENETRAÇÃO E CRÍTICO MINERAL (0.58 a 0.78)
    else if (swingProgress < 0.78) {
      const p = (swingProgress - 0.58) / 0.20;
      const tremor = (Math.sin(p * Math.PI * 18) * 1.5);
      lungeX = 8 + tremor;
      bodyAngle = 0.16;
      pickAngle = 0.65; // Travada dentro da rocha
      handX = 11 + tremor;
      handY = -10;
      scaleY = 0.98;
    }
    // FASE 4: DESENGATE E RETORNO (0.78 a 1.00)
    else {
      const p = (swingProgress - 0.78) / 0.22;
      lungeX = 8 * (1 - p);
      bodyAngle = 0.16 * (1 - p);
      pickAngle = 0.65 - p * 0.41; // Retorna para 0.24 rad
      handX = 11 - 1 * p;
      handY = -10 - 4 * (1 - p);
    }

    // Sombra dinâmica
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(lungeX, -1, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Desenha corpo do Minerador
    ctx.save();
    ctx.translate(lungeX, 0);
    ctx.rotate(bodyAngle);
    ctx.scale(scaleX, scaleY);
    ctx.drawImage(minerDiggerImg, -mw / 2, -mh + 6, mw, mh);

    // Lanterna do capacete acompanhando a inclinação
    ctx.save();
    const activeLampX = lampRelX;
    const activeLampY = lampRelY;
    const coneGrad = ctx.createRadialGradient(activeLampX, activeLampY, 2, activeLampX + 45, activeLampY + 10, 65);
    coneGrad.addColorStop(0, 'rgba(254, 240, 138, 0.6)');
    coneGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(activeLampX, activeLampY);
    ctx.arc(activeLampX, activeLampY, 65, -0.22, 0.35);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(activeLampX, activeLampY, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore(); // Fecha minerador

    // Rastro cinético do golpe de picareta (Swoosh Arc)
    if (swingProgress >= 0.35 && swingProgress <= 0.62) {
      ctx.save();
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)';
      ctx.lineWidth = 3.2;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(handX - 4, handY - 10, 42, -1.8, 0.45);
      ctx.stroke();
      ctx.restore();
    }

    // Desenha Picareta
    ctx.save();
    ctx.translate(handX, handY);
    ctx.rotate(pickAngle);
    ctx.drawImage(minerPickaxeImg, -4, -ph + 4, pw, ph);

    // Mãos com luvas brancas firmando o cabo
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#272535';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(-4, -4, 8, 8, 2.5);
    ctx.fill();
    ctx.stroke();

    ctx.restore(); // Fecha picareta

    // =========================================================================
    // EFEITOS DE IMPACTO DA PICARETA NA ROCHA (Fase 3: 0.58 a 0.78)
    // =========================================================================
    if (swingProgress >= 0.58 && swingProgress < 0.78) {
      const impactX = handX + 44;
      const impactY = handY + 12;

      // 1. FISSURAS NA ROCHA
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(impactX, impactY);
      ctx.lineTo(impactX + 10, impactY - 8);
      ctx.lineTo(impactX + 18, impactY - 12);
      ctx.moveTo(impactX, impactY);
      ctx.lineTo(impactX + 12, impactY + 6);
      ctx.lineTo(impactX + 20, impactY + 10);
      ctx.stroke();

      // 2. FAÍSCAS DOURADAS & PRATEADAS (Atrito aço-quartzo)
      for (let i = 0; i < 6; i++) {
        const spkAngle = Math.PI - 0.8 + (i * 0.32) + Math.sin(now * 0.05 + i) * 0.2;
        const spkDist = 6 + ((now * 0.08 + i * 5) % 22);
        const sx = impactX + Math.cos(spkAngle) * spkDist;
        const sy = impactY + Math.sin(spkAngle) * spkDist * 0.75;
        ctx.fillStyle = i % 2 === 0 ? '#fef08a' : (i % 3 === 0 ? '#fbbf24' : '#ffffff');
        ctx.beginPath();
        ctx.arc(sx, sy, 2.0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. ESTILHAÇOS DE MINÉRIO E CRISTAIS DOURADOS
      for (let k = 0; k < 4; k++) {
        const chipAngle = Math.PI - 0.7 + (k * 0.45);
        const chipDist = 8 + ((now * 0.05 + k * 8) % 24);
        const cx = impactX + Math.cos(chipAngle) * chipDist;
        const cy = impactY + Math.sin(chipAngle) * chipDist * 0.8;
        ctx.fillStyle = k % 2 === 0 ? '#f59e0b' : '#475569';
        ctx.fillRect(cx - 1.5, cy - 1.5, 3.5, 3.5);
      }

      // 4. NUVEM DE PÓ DE PEDRA
      const dustAlpha = 0.4 + Math.sin(now * 0.05) * 0.15;
      ctx.fillStyle = `rgba(214, 211, 209, ${dustAlpha})`;
      ctx.beginPath();
      ctx.arc(impactX - 2, impactY + Math.sin(now * 0.06) * 4, 8, 0, Math.PI * 2);
      ctx.arc(impactX + 4, impactY - 6, 6, 0, Math.PI * 2);
      ctx.fill();

      // 5. ONDA DE CHOQUE CINÉTICA
      const shockWaveR = 8 + (Math.sin(swingProgress * Math.PI * 30) + 1) * 5;
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(impactX, impactY, shockWaveR, 0, Math.PI * 2);
      ctx.stroke();

      // 6. FLOATING DAMAGE TEXT
      const floatY = impactY - 20 - (Math.sin(swingProgress * Math.PI) * 9);
      ctx.save();
      ctx.font = '900 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#d97706';
      ctx.shadowBlur = 7;
      ctx.fillStyle = '#09090b';
      ctx.fillText('⛏️ PICARETADA! -52', impactX + 2, floatY + 1);
      ctx.fillStyle = '#facc15';
      ctx.fillText('⛏️ PICARETADA! -52', impactX + 2, floatY);
      ctx.restore();
    }

    ctx.restore(); // Fecha translate geral
    return;
  }

  // Fallback caso as imagens ainda não tenham finalizado o carregamento
  applyOutline(ctx);

  // Faixas do Capuz Ninja flutuando ao vento atrás da cabeça
  const waveRibbon = Math.sin(now * 0.015) * 4;
  ctx.fillStyle = '#09090b';
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-8, -14);
  ctx.quadraticCurveTo(-18, -18 + waveRibbon, -24, -13 + waveRibbon);
  ctx.lineTo(-24, -10 + waveRibbon);
  ctx.quadraticCurveTo(-17, -14 + waveRibbon, -8, -11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // === ARMA SECUNDÁRIA: FOICE KAMA ESQUERDA (Empunhadura Dupla Tática) ===
  ctx.save();
  ctx.translate(-7, 3);
  if (!isMining) {
    // Guarda tática baixa voltada para fora
    ctx.rotate(-0.85 + Math.sin(now * 0.015) * 0.05);
  } else {
    // Golpe em X cruzado durante a mineração
    const crossSlash = Math.sin(swingProgress * Math.PI) * 0.7;
    ctx.rotate(-0.85 + crossSlash);
  }
  drawSingleCyberKama(ctx);
  ctx.restore();

  // Traje Tático Shinobi Negro Matte com Costuras Neon Ciano
  const bodyGrad = ctx.createLinearGradient(0, -2, 0, 15);
  bodyGrad.addColorStop(0, '#1e293b');
  bodyGrad.addColorStop(1, '#09090b');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(-9, -2, 18, 17, 3);
  ctx.fill();
  ctx.stroke();

  // Linhas cibernéticas de energia ciano brilhante no peitoral (estilo Shadow Shinobi)
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-6, 0); ctx.lineTo(0, 5); ctx.lineTo(6, 0);
  ctx.moveTo(0, 5);  ctx.lineTo(0, 11);
  ctx.stroke();

  // Ombreiras táticas de kevlar
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-11, -3, 4, 7, 2);
  ctx.roundRect(7, -3, 4, 7, 2);
  ctx.fill();
  ctx.stroke();

  // Cinto Tático com Bastões de Dinamite e Detonador
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-9, 7, 18, 4);
  ctx.strokeRect(-9, 7, 18, 4);

  // Bastão de dinamite vermelho preso no cinto
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-4, 6.5, 3, 5);
  ctx.fillRect(1, 6.5, 3, 5);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(-3, 6, 1, 1.5);
  ctx.fillRect(2, 6, 1, 1.5);

  // Fivela / Canister de energia ciano no centro do cinto
  ctx.fillStyle = '#00f0ff';
  ctx.beginPath();
  ctx.arc(0, 9, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Capuz Ninja Preto
  const headGrad = ctx.createLinearGradient(0, -22, 0, -2);
  headGrad.addColorStop(0, '#1e293b');
  headGrad.addColorStop(1, '#09090b');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(0, -12, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Máscara do Capuz (cobre boca e queixo)
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.roundRect(-8, -10, 16, 8, 2);
  ctx.fill();
  ctx.stroke();

  // Faixa da testa tática preta
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-10, -17, 20, 5, 2);
  ctx.fill();
  ctx.stroke();

  // OLHOS CIANO NEON ELÉTRICOS BRILHANTES (Idênticos à imagem do Shadow Shinobi)
  ctx.save();
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#00f0ff';
  ctx.beginPath();
  ctx.ellipse(-3.5, -11.5, 2.8, 1.9, -0.15, 0, Math.PI * 2);
  ctx.ellipse(3.5, -11.5, 2.8, 1.9, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Brilho central branco penetrante
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-3.5, -11.5, 1.4, 1.0, -0.15, 0, Math.PI * 2);
  ctx.ellipse(3.5, -11.5, 1.4, 1.0, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // === ARMA PRINCIPAL: FOICE KAMA DIREITA (Golpes Rápidos e Cortantes) ===
  ctx.save();
  ctx.translate(7, 0);

  if (!isMining) {
    // Postura de guarda tática com a kama erguida
    ctx.rotate(0.45 + Math.sin(now * 0.015) * 0.06);
  } else {
    // Golpe Rasgante da Kama de Plasma
    let kamaAngle = 0;
    if (swingProgress < 0.30) {
      // Puxa a foice para trás
      kamaAngle = 0.45 - (swingProgress / 0.30) * 0.85;
    } else if (swingProgress < 0.65) {
      // Golpe demolidor rasgante para a frente
      const norm = (swingProgress - 0.30) / 0.35;
      kamaAngle = -0.40 + norm * 1.45;
    } else {
      // Retorno veloz à guarda
      kamaAngle = 1.05 - (swingProgress - 0.65) * 1.7;
    }
    ctx.rotate(kamaAngle);

    // Arco de Corte de Plasma Ciano Neon Translúcido
    if (swingProgress >= 0.32 && swingProgress <= 0.68) {
      ctx.save();
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.9)';
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.arc(0, -22, 24, -0.7, Math.PI * 0.8);
      ctx.stroke();

      // Faíscas elétricas de plasma azul/ciano
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(18, -24, 2.5, 2.5);
      ctx.fillRect(24, -12, 3, 3);
      ctx.fillRect(12, -32, 2, 2);
      ctx.restore();
    }
  }

  drawSingleCyberKama(ctx);
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 7. CAPITÃO PIRATA (pirate) - Bacamarte Flintlock de Pólvora Negra
// ----------------------------------------------------------------------------
let pirateCaptainImg = null;
let pirateCaptainLoaded = false;
let pirateFlintlockImg = null;
let pirateFlintlockLoaded = false;

export function initPirate() {
  if (typeof window === 'undefined') return;
  if (!pirateCaptainImg) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/pirate_captain.png?v=' + Date.now();
    img.onload = () => {
      pirateCaptainImg = img;
      pirateCaptainLoaded = true;
    };
  }
  if (!pirateFlintlockImg) {
    const gImg = new Image();
    gImg.crossOrigin = 'anonymous';
    gImg.src = '/pirate_flintlock.png?v=' + Date.now();
    gImg.onload = () => {
      pirateFlintlockImg = gImg;
      pirateFlintlockLoaded = true;
    };
  }
}

if (typeof window !== 'undefined') {
  initPirate();
}

export function drawPirate(ctx, now, swingAngle, legAngle, swingProgress = 0, isMining = false) {
  initPirate();

  if (pirateCaptainLoaded && pirateCaptainImg && pirateFlintlockLoaded && pirateFlintlockImg) {
    const pw = 44; // Largura do pirata
    const ph = 55; // Altura do pirata
    const gw = 38; // Largura do bacamarte
    const gh = 20; // Altura do bacamarte

    // =========================================================================
    // 1. MODO REPOUSO & CAMINHADA (IDLE / WALKING)
    // =========================================================================
    if (!isMining) {
      ctx.save();
      ctx.translate(0, 16); // Pivot na base dos pés

      // Swagger pirata (ginga de marujo)
      const walkBob = Math.abs(Math.sin(now * 0.012)) * 1.8;
      const bodySway = Math.sin(now * 0.012) * 0.05;
      const breathY = 1 + Math.sin(now * 0.01) * 0.02;
      const breathX = 1 - Math.sin(now * 0.01) * 0.01;

      // Sombra sob os pés
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, -1, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(0, -walkBob);
      ctx.rotate(bodySway);
      ctx.scale(breathX, breathY);

      // Desenha corpo do Pirata
      ctx.drawImage(pirateCaptainImg, -pw / 2, -ph + 6, pw, ph);

      // Faixas vermelhas da bandana tremulando na brisa marinha (lado esquerdo)
      const ribbonWave = Math.sin(now * 0.018) * 2.5;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-16, -ph + 32);
      ctx.quadraticCurveTo(-22, -ph + 36 + ribbonWave, -26, -ph + 34 + ribbonWave);
      ctx.lineTo(-24, -ph + 38 + ribbonWave);
      ctx.quadraticCurveTo(-20, -ph + 39 + ribbonWave, -15, -ph + 35);
      ctx.closePath();
      ctx.fill();

      // Bacamarte em repouso na mão direita, apontado diagonalmente para baixo
      ctx.save();
      ctx.translate(11, -12);
      ctx.rotate(0.35 + Math.sin(now * 0.012) * 0.04);
      // Pivot na coronha/empunhadura do bacamarte
      ctx.drawImage(pirateFlintlockImg, -6, -11, gw, gh);

      // Mão do pirata segurando a coronha
      ctx.fillStyle = '#fed7aa';
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore(); // Fecha arma

      ctx.restore(); // Fecha idle
      return;
    }

    // =========================================================================
    // 2. MODO ATAQUE: DISPARO DE PÓLVORA NEGRA DO BACAMARTE FLINTLOCK!
    // =========================================================================
    ctx.save();
    ctx.translate(0, 16); // Pivot nos pés

    let lungeX = 0;
    let bodyAngle = 0;
    let gunAngle = 0;
    let handX = 10;
    let handY = -14;
    let recoilDist = 0;
    let scaleY = 1;
    let scaleX = 1;

    // FASE 1: MIRA & ENGATILHAMENTO HORIZONTAL (0.00 a 0.32)
    if (swingProgress < 0.32) {
      const p = swingProgress / 0.32;
      lungeX = 2 * p;
      bodyAngle = 0.06 * p; // Postura firme de atirador
      gunAngle = 0.35 - p * 0.35; // Alinha rigorosamente na horizontal (0.0 rad)
      handX = 11 + 2 * p;
      handY = -12 - 2 * p;
    }
    // FASE 2: DETONAÇÃO, DISPARO E RECUO BRUTAL (0.32 a 0.48)
    else if (swingProgress < 0.48) {
      const p = (swingProgress - 0.32) / 0.16;
      // Recuo violento da pólvora negra jogando o braço e tronco para trás
      recoilDist = Math.sin(p * Math.PI) * 7;
      lungeX = 2 - recoilDist * 0.6;
      bodyAngle = 0.06 - Math.sin(p * Math.PI) * 0.15; // Tronco é empurrado para trás
      gunAngle = -Math.sin(p * Math.PI) * 0.42; // Cano dá coice para cima
      handX = 13 - recoilDist;
      handY = -14;
      scaleX = 1 - Math.sin(p * Math.PI) * 0.05;
      scaleY = 1 + Math.sin(p * Math.PI) * 0.03;
    }
    // FASE 3: SUSTENTAÇÃO DE IMPACTO NA ROCHA & FUMAÇA (0.48 a 0.75)
    else if (swingProgress < 0.75) {
      const p = (swingProgress - 0.48) / 0.27;
      lungeX = 2 * (1 - p);
      bodyAngle = -0.04 * (1 - p);
      gunAngle = -0.15 * (1 - p);
      handX = 13 - 1 * p;
      handY = -14;
    }
    // FASE 4: RECUPERAÇÃO E RETORNO (0.75 a 1.00)
    else {
      const p = (swingProgress - 0.75) / 0.25;
      gunAngle = p * 0.35;
      handX = 12 - 1 * p;
      handY = -14 + 2 * p;
    }

    // Sombra no chão
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(lungeX, -1, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Desenha Pirata
    ctx.save();
    ctx.translate(lungeX, 0);
    ctx.rotate(bodyAngle);
    ctx.scale(scaleX, scaleY);
    ctx.drawImage(pirateCaptainImg, -pw / 2, -ph + 6, pw, ph);
    ctx.restore();

    // Desenha o Bacamarte Flintlock
    ctx.save();
    ctx.translate(handX, handY);
    ctx.rotate(gunAngle);
    ctx.drawImage(pirateFlintlockImg, -6, -11, gw, gh);

    // Mão do pirata empunhando
    ctx.fillStyle = '#fed7aa';
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Posição da boca do cano (Muzzle)
    const muzzleLocalX = 32;
    const muzzleLocalY = -3;

    // =========================================================================
    // 1. FLASH DE DISPARO DA BOCA DO CANO (Muzzle Flash: 0.32 a 0.42)
    // =========================================================================
    if (swingProgress >= 0.32 && swingProgress <= 0.42) {
      const flashP = (swingProgress - 0.32) / 0.10;
      const flashSize = 14 + (1 - flashP) * 10;

      // Chama explosiva da pólvora
      ctx.save();
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 15;

      // Cone de fogo saindo do cano
      const flashGrad = ctx.createRadialGradient(muzzleLocalX, muzzleLocalY, 2, muzzleLocalX + flashSize, muzzleLocalY, flashSize * 1.5);
      flashGrad.addColorStop(0, '#ffffff');
      flashGrad.addColorStop(0.3, '#fef08a');
      flashGrad.addColorStop(0.7, '#f97316');
      flashGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = flashGrad;

      ctx.beginPath();
      ctx.moveTo(muzzleLocalX, muzzleLocalY - 4);
      ctx.lineTo(muzzleLocalX + flashSize * 1.6, muzzleLocalY - 9);
      ctx.lineTo(muzzleLocalX + flashSize * 1.8, muzzleLocalY);
      ctx.lineTo(muzzleLocalX + flashSize * 1.6, muzzleLocalY + 9);
      ctx.lineTo(muzzleLocalX, muzzleLocalY + 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.restore(); // Fecha rotação da arma

    // =========================================================================
    // 2. PROJÉTIL DE CHUMBO EM VOO ULTRARRÁPIDO (0.33 a 0.46)
    // =========================================================================
    const muzzleWorldX = handX + 32;
    const muzzleWorldY = handY - 3;
    const rockTargetX = 54;
    const rockTargetY = -8;

    if (swingProgress >= 0.33 && swingProgress <= 0.46) {
      const bulletP = (swingProgress - 0.33) / 0.13;
      const bx = muzzleWorldX + (rockTargetX - muzzleWorldX) * bulletP;
      const by = muzzleWorldY + (rockTargetY - muzzleWorldY) * bulletP;

      // Projétil de chumbo esférico pesado com rastro de fogo
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(muzzleWorldX, muzzleWorldY);
      ctx.lineTo(bx, by);
      ctx.stroke();

      // Esfera de chumbo incandescente
      ctx.fillStyle = '#334155';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(bx, by, 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(bx + 1, by - 1, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // =========================================================================
    // 3. NUVEM DE FUMAÇA DE PÓLVORA NEGRA (0.34 a 0.75)
    // =========================================================================
    if (swingProgress >= 0.34 && swingProgress <= 0.75) {
      const smokeP = (swingProgress - 0.34) / 0.41;
      const smokeAlpha = (1 - smokeP) * 0.55;
      const smokeDist = smokeP * 18;

      ctx.save();
      ctx.fillStyle = `rgba(226, 232, 240, ${smokeAlpha})`;
      ctx.beginPath();
      ctx.arc(muzzleWorldX + 6 + smokeDist * 0.5, muzzleWorldY - 2 - smokeDist * 0.3, 7 + smokeP * 8, 0, Math.PI * 2);
      ctx.arc(muzzleWorldX + 12 + smokeDist, muzzleWorldY + 3, 5 + smokeP * 7, 0, Math.PI * 2);
      ctx.arc(muzzleWorldX - 2, muzzleWorldY - 6 - smokeDist * 0.2, 6 + smokeP * 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // =========================================================================
    // 4. DETONAÇÃO & IMPACTO NA ROCHA (0.45 a 0.75)
    // =========================================================================
    if (swingProgress >= 0.45 && swingProgress <= 0.75) {
      const impactP = (swingProgress - 0.45) / 0.30;
      const impactX = rockTargetX;
      const impactY = rockTargetY;

      // 1. FISSURAS E CRATERA DE IMPACTO NA ROCHA
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(impactX, impactY);
      ctx.lineTo(impactX + 10, impactY - 8);
      ctx.lineTo(impactX + 18, impactY - 14);
      ctx.moveTo(impactX, impactY);
      ctx.lineTo(impactX + 12, impactY + 6);
      ctx.lineTo(impactX + 20, impactY + 12);
      ctx.stroke();

      // 2. FAÍSCAS INCANDESCENTES DE EXPLOSÃO
      for (let i = 0; i < 6; i++) {
        const spkAngle = Math.PI - 0.8 + (i * 0.32) + Math.sin(now * 0.05 + i) * 0.2;
        const spkDist = 6 + ((now * 0.08 + i * 5) % 24);
        const sx = impactX + Math.cos(spkAngle) * spkDist;
        const sy = impactY + Math.sin(spkAngle) * spkDist * 0.75;
        ctx.fillStyle = i % 2 === 0 ? '#fef08a' : (i % 3 === 0 ? '#f97316' : '#ef4444');
        ctx.beginPath();
        ctx.arc(sx, sy, 2.0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. ESTILHAÇOS DE ROCHA E MOEDAS DE OURO VAPORIZADAS
      for (let k = 0; k < 4; k++) {
        const chipAngle = Math.PI - 0.7 + (k * 0.45);
        const chipDist = 8 + ((now * 0.05 + k * 8) % 26);
        const cx = impactX + Math.cos(chipAngle) * chipDist;
        const cy = impactY + Math.sin(chipAngle) * chipDist * 0.8;
        ctx.fillStyle = k % 2 === 0 ? '#fbbf24' : '#334155';
        ctx.fillRect(cx - 1.5, cy - 1.5, 3.5, 3.5);
      }

      // 4. ONDA DE CHOQUE EXPLOSIVA
      const shockWaveR = 8 + impactP * 18;
      ctx.strokeStyle = `rgba(249, 115, 22, ${1 - impactP})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(impactX, impactY, shockWaveR, 0, Math.PI * 2);
      ctx.stroke();

      // 5. FLOATING DAMAGE TEXT
      const floatY = impactY - 20 - (Math.sin(swingProgress * Math.PI) * 9);
      ctx.save();
      ctx.font = '900 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 7;
      ctx.fillStyle = '#020617';
      ctx.fillText('💣 BACAMARTE! -48', impactX + 2, floatY + 1);
      ctx.fillStyle = '#f97316';
      ctx.fillText('💣 BACAMARTE! -48', impactX + 2, floatY);
      ctx.restore();
    }

    ctx.restore(); // Fecha translate geral
    return;
  }

  // Fallback caso as imagens ainda não tenham finalizado o carregamento para o pirata
  applyOutline(ctx);
}

// ----------------------------------------------------------------------------
// 8. COWBOY XERIFE (cowboy) - Autêntico Revólver Colt .45 com Saque Rápido & Fanning
// ----------------------------------------------------------------------------
let cowboySheriffImg = null;
let cowboySheriffLoaded = false;
let cowboyRevolverImg = null;
let cowboyRevolverLoaded = false;

export function initCowboy() {
  if (typeof window === 'undefined') return;
  if (!cowboySheriffImg) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/cowboy_sheriff.png?v=' + Date.now();
    img.onload = () => {
      cowboySheriffImg = img;
      cowboySheriffLoaded = true;
    };
  }
  if (!cowboyRevolverImg) {
    const rImg = new Image();
    rImg.crossOrigin = 'anonymous';
    rImg.src = '/cowboy_revolver.png?v=' + Date.now();
    rImg.onload = () => {
      cowboyRevolverImg = rImg;
      cowboyRevolverLoaded = true;
    };
  }
}

if (typeof window !== 'undefined') {
  initCowboy();
}

export function drawCowboy(ctx, now, swingAngle, legAngle, swingProgress = 0, isMining = false) {
  initCowboy();

  if (cowboySheriffLoaded && cowboySheriffImg && cowboyRevolverLoaded && cowboyRevolverImg) {
    const cw = 44; // Largura do cowboy
    const ch = 54; // Altura do cowboy
    const gw = 38; // Largura do revólver
    const gh = 20; // Altura do revólver

    // =========================================================================
    // 1. MODO REPOUSO & CAMINHADA (IDLE / WALKING)
    // =========================================================================
    if (!isMining) {
      ctx.save();
      ctx.translate(0, 16); // Base nos pés

      // Passo cadenciado de pistoleiro do faroeste
      const walkBob = Math.abs(Math.sin(now * 0.012)) * 1.8;
      const bodySway = Math.sin(now * 0.012) * 0.04;
      const breathY = 1 + Math.sin(now * 0.01) * 0.02;
      const breathX = 1 - Math.sin(now * 0.01) * 0.01;

      // Sombra sob as botas de couro
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, -1, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(0, -walkBob);
      ctx.rotate(bodySway);
      ctx.scale(breathX, breathY);

      // Desenha o Cowboy com chapéu Stetson e estrela
      ctx.drawImage(cowboySheriffImg, -cw / 2, -ch + 6, cw, ch);

      // Ponta vermelha da bandana tremulando levemente
      const bandWave = Math.sin(now * 0.016) * 1.5;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-12, -ch + 36);
      ctx.quadraticCurveTo(-16, -ch + 39 + bandWave, -19, -ch + 38 + bandWave);
      ctx.lineTo(-17, -ch + 41 + bandWave);
      ctx.closePath();
      ctx.fill();

      // Brilho dourado da estrela de xerife
      const starGlow = 0.5 + Math.sin(now * 0.015) * 0.3;
      ctx.fillStyle = `rgba(250, 204, 21, ${0.4 * starGlow})`;
      ctx.beginPath();
      ctx.arc(6, -ch + 16, 4, 0, Math.PI * 2);
      ctx.fill();

      // Revólver descansando na mão direita com o cano apontado para baixo
      ctx.save();
      ctx.translate(11, -12);
      ctx.rotate(0.38 + Math.sin(now * 0.012) * 0.04);
      // Pivot na empunhadura do revólver
      ctx.drawImage(cowboyRevolverImg, -8, -12, gw, gh);

      // Mão do cowboy segurando a coronha de madeira
      ctx.fillStyle = '#fed7aa';
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore(); // Fecha arma

      ctx.restore(); // Fecha idle
      return;
    }

    // =========================================================================
    // 2. MODO ATAQUE: SAQUE RÁPIDO & TIRO DUPLO COM O COLT .45!
    // =========================================================================
    ctx.save();
    ctx.translate(0, 16); // Pivot nos pés

    let lungeX = 0;
    let bodyAngle = 0;
    let gunAngle = 0;
    let handX = 10;
    let handY = -14;
    let recoilDist = 0;
    let scaleY = 1;
    let scaleX = 1;

    // FASE 1: SAQUE RÁPIDO DO COLDRE E MIRA HORIZONTAL (0.00 a 0.24)
    if (swingProgress < 0.24) {
      const p = swingProgress / 0.24;
      lungeX = 3 * p;
      bodyAngle = 0.08 * p; // Postura agressiva de duelo
      gunAngle = 0.45 - p * 0.45; // Saca do coldre e aponta estritamente na horizontal
      handX = 9 + 4 * p;
      handY = -11 - 3 * p;
    }
    // FASE 2: TIRO #1 E GOLPE NO CÃO / FANNING THE HAMMER (0.24 a 0.44)
    else if (swingProgress < 0.44) {
      const p = (swingProgress - 0.24) / 0.20;
      recoilDist = Math.sin(p * Math.PI) * 6;
      lungeX = 3 - recoilDist * 0.5;
      bodyAngle = 0.08 - Math.sin(p * Math.PI) * 0.12;
      gunAngle = -Math.sin(p * Math.PI) * 0.35; // Coice do revólver
      handX = 13 - recoilDist;
      handY = -14;
    }
    // FASE 3: TIRO #2 RELÂMPAGO (DUPLO IMPACTO) (0.44 a 0.68)
    else if (swingProgress < 0.68) {
      const p = (swingProgress - 0.44) / 0.24;
      recoilDist = Math.sin(p * Math.PI) * 5.5;
      lungeX = 3 - recoilDist * 0.4;
      bodyAngle = 0.08 - Math.sin(p * Math.PI) * 0.10;
      gunAngle = -Math.sin(p * Math.PI) * 0.30;
      handX = 13 - recoilDist;
      handY = -14;
    }
    // FASE 4: GIRO NO DEDO (GUN SPIN) E RETORNO AO COLDRE (0.68 a 1.00)
    else {
      const p = (swingProgress - 0.68) / 0.32;
      // Giro estético de 360 graus em torno do gatilho ao engatilhar de volta
      const spin = p < 0.7 ? (p / 0.7) * Math.PI * 2 : 0;
      gunAngle = spin + p * 0.38;
      lungeX = 3 * (1 - p);
      bodyAngle = 0.08 * (1 - p);
      handX = 13 - 2 * p;
      handY = -14 + 2 * p;
    }

    // Sombra dinâmica no chão
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(lungeX, -1, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Desenha Cowboy
    ctx.save();
    ctx.translate(lungeX, 0);
    ctx.rotate(bodyAngle);
    ctx.scale(scaleX, scaleY);
    ctx.drawImage(cowboySheriffImg, -cw / 2, -ch + 6, cw, ch);
    ctx.restore();

    // Desenha o Revólver Colt .45
    ctx.save();
    ctx.translate(handX, handY);
    ctx.rotate(gunAngle);
    ctx.drawImage(cowboyRevolverImg, -8, -12, gw, gh);

    // Mão do cowboy segurando a empunhadura
    ctx.fillStyle = '#fed7aa';
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const muzzleLocalX = 30;
    const muzzleLocalY = -10;

    // Muzzle Flash do Revólver (Tiro 1: 0.24 a 0.32 | Tiro 2: 0.44 a 0.52)
    const isShot1 = swingProgress >= 0.24 && swingProgress <= 0.32;
    const isShot2 = swingProgress >= 0.44 && swingProgress <= 0.52;

    if (isShot1 || isShot2) {
      const flashP = isShot1 ? (swingProgress - 0.24) / 0.08 : (swingProgress - 0.44) / 0.08;
      const flashSize = 13 + (1 - flashP) * 8;

      ctx.save();
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 12;

      const flashGrad = ctx.createRadialGradient(muzzleLocalX, muzzleLocalY, 1, muzzleLocalX + flashSize, muzzleLocalY, flashSize * 1.4);
      flashGrad.addColorStop(0, '#ffffff');
      flashGrad.addColorStop(0.3, '#fef08a');
      flashGrad.addColorStop(0.7, '#f59e0b');
      flashGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = flashGrad;

      ctx.beginPath();
      ctx.moveTo(muzzleLocalX, muzzleLocalY - 3);
      ctx.lineTo(muzzleLocalX + flashSize * 1.5, muzzleLocalY - 7);
      ctx.lineTo(muzzleLocalX + flashSize * 1.8, muzzleLocalY);
      ctx.lineTo(muzzleLocalX + flashSize * 1.5, muzzleLocalY + 7);
      ctx.lineTo(muzzleLocalX, muzzleLocalY + 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.restore(); // Fecha arma

    // =========================================================================
    // PROJÉTEIS DE CHUMBO / PRATA EM ALTA VELOCIDADE & IMPACTO
    // =========================================================================
    const muzzleWorldX = handX + 30;
    const muzzleWorldY = handY - 10;
    const rockTargetX = 54;
    const rockTargetY = -8;

    // Bala 1 voando (0.26 a 0.36)
    if (swingProgress >= 0.26 && swingProgress <= 0.36) {
      const bp = (swingProgress - 0.26) / 0.10;
      const bx = muzzleWorldX + (rockTargetX - muzzleWorldX) * bp;
      const by = muzzleWorldY + (rockTargetY - muzzleWorldY) * bp;

      ctx.save();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(muzzleWorldX, muzzleWorldY);
      ctx.lineTo(bx, by);
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Bala 2 voando (0.46 a 0.56)
    if (swingProgress >= 0.46 && swingProgress <= 0.56) {
      const bp = (swingProgress - 0.46) / 0.10;
      const bx = muzzleWorldX + (rockTargetX - muzzleWorldX) * bp;
      const by = muzzleWorldY + 3 + (rockTargetY - muzzleWorldY) * bp;

      ctx.save();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(muzzleWorldX, muzzleWorldY + 3);
      ctx.lineTo(bx, by);
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // =========================================================================
    // IMPACTO & DETONAÇÃO BALÍSTICA NA ROCHA (0.35 a 0.70)
    // =========================================================================
    if (swingProgress >= 0.35 && swingProgress <= 0.70) {
      const impactP = (swingProgress - 0.35) / 0.35;
      const impactX = rockTargetX;
      const impactY = rockTargetY;

      // 1. Fissuras balísticas
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(impactX, impactY);
      ctx.lineTo(impactX + 8, impactY - 6);
      ctx.lineTo(impactX + 16, impactY - 12);
      ctx.moveTo(impactX, impactY);
      ctx.lineTo(impactX + 10, impactY + 6);
      ctx.lineTo(impactX + 18, impactY + 10);
      ctx.stroke();

      // 2. Faíscas douradas e prateadas de ricochete
      for (let i = 0; i < 6; i++) {
        const spkAngle = Math.PI - 0.8 + (i * 0.32) + Math.sin(now * 0.05 + i) * 0.2;
        const spkDist = 6 + ((now * 0.08 + i * 5) % 22);
        const sx = impactX + Math.cos(spkAngle) * spkDist;
        const sy = impactY + Math.sin(spkAngle) * spkDist * 0.75;
        ctx.fillStyle = i % 2 === 0 ? '#fef08a' : (i % 3 === 0 ? '#f59e0b' : '#ffffff');
        ctx.beginPath();
        ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Estilhaços de cascalho
      for (let k = 0; k < 4; k++) {
        const chipAngle = Math.PI - 0.7 + (k * 0.45);
        const chipDist = 8 + ((now * 0.05 + k * 8) % 24);
        const cx = impactX + Math.cos(chipAngle) * chipDist;
        const cy = impactY + Math.sin(chipAngle) * chipDist * 0.8;
        ctx.fillStyle = k % 2 === 0 ? '#f59e0b' : '#334155';
        ctx.fillRect(cx - 1.5, cy - 1.5, 3.2, 3.2);
      }

      // 4. Onda de choque expansiva
      const shockWaveR = 6 + impactP * 16;
      ctx.strokeStyle = `rgba(245, 158, 11, ${1 - impactP})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(impactX, impactY, shockWaveR, 0, Math.PI * 2);
      ctx.stroke();

      // 5. Floating text
      const floatY = impactY - 20 - (Math.sin(swingProgress * Math.PI) * 9);
      ctx.save();
      ctx.font = '900 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#d97706';
      ctx.shadowBlur = 7;
      ctx.fillStyle = '#020617';
      ctx.fillText('⭐ TIRO CERTEIRO! -44', impactX + 2, floatY + 1);
      ctx.fillStyle = '#facc15';
      ctx.fillText('⭐ TIRO CERTEIRO! -44', impactX + 2, floatY);
      ctx.restore();
    }

    ctx.restore(); // Fecha translate geral
    return;
  }

  // Fallback caso as imagens ainda não tenham finalizado o carregamento
  applyOutline(ctx);
}

// ----------------------------------------------------------------------------
// 9. FADA ENCANTADA DAS ASAS DE CRISTAL (fairy) - Voo Mágico e Feixe Estelar Prismático
// Sprite recortado oficial: asas de cristal translúcidas, tiara de flores, vestido azul e
// a lendária Varinha Estelar de Ouro que canaliza rajadas de estrelas cadentes contra a rocha!
// ----------------------------------------------------------------------------
let fairySpriteImg = null;
let fairySpriteLoaded = false;
let fairyWandImg = null;
let fairyWandLoaded = false;

export function initFairy() {
  if (typeof window === 'undefined') return;
  if (!fairySpriteImg) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/fairy_sprite.png?v=' + Date.now();
    img.onload = () => {
      fairySpriteImg = img;
      fairySpriteLoaded = true;
    };
  }
  if (!fairyWandImg) {
    const wImg = new Image();
    wImg.crossOrigin = 'anonymous';
    wImg.src = '/fairy_wand.png?v=' + Date.now();
    wImg.onload = () => {
      fairyWandImg = wImg;
      fairyWandLoaded = true;
    };
  }
}

if (typeof window !== 'undefined') {
  initFairy();
}

// Auxiliar: Desenha uma estrela cintilante de 4 pontas
function drawSparkleStar4(ctx, cx, cy, r, color = '#ffffff') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx, cy, cx + r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + r);
  ctx.quadraticCurveTo(cx, cy, cx - r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - r);
  ctx.fill();
  ctx.restore();
}

// Auxiliar: Desenha uma estrela estelar de 8 pontas para impacto mágico
function drawStar8(ctx, cx, cy, outerR, innerR, color = '#fef08a') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  const points = 8;
  for (let i = 0; i < points * 2; i++) {
    const r = (i % 2 === 0) ? outerR : innerR;
    const a = (i * Math.PI) / points;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawFairy(ctx, now, swingAngle, legAngle, swingProgress = 0, isMining = false) {
  initFairy();

  if (fairySpriteLoaded && fairySpriteImg && fairyWandLoaded && fairyWandImg) {
    const fw = 80; // Largura do sprite da fada (asas abertas padronizadas)
    const fh = 62; // Altura unificada (corpo ~48px, altura total 62px com asas)
    const ww = 20; // Largura proporcional da varinha reduzida pela metade (2x menor)
    const wh = 24; // Altura da varinha estelar reduzida pela metade (2x menor)
    const pivotX = ww * (29 / 351); // 1.65
    const pivotY = wh * (387 / 414); // 22.43

    // =========================================================================
    // 1. MODO REPOUSO & CAMINHADA (IDLE / HOVERING FLIGHT)
    // =========================================================================
    if (!isMining) {
      ctx.save();
      ctx.translate(0, 16); // Base do chão

      // Levitação suave contínua no ar (a fada nunca toca o chão pesadamente)
      const hoverY = Math.sin(now * 0.006) * 3 - 2; // Flutua suavemente 2px acima do solo
      const hoverSway = Math.sin(now * 0.005) * 0.04;
      const wingBreath = 1 + Math.sin(now * 0.018) * 0.03;

      // Sombra suave translúcida que pulsa com a altitude do voo
      const shadowScale = 1 - (hoverY + 6) * 0.04;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14 * shadowScale, 4.5 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(0, hoverY);
      ctx.rotate(hoverSway);
      ctx.scale(1, wingBreath);

      // Brilho místico ao redor da fadinha (Fairy Aura)
      ctx.shadowColor = 'rgba(244, 114, 182, 0.55)';
      ctx.shadowBlur = 10 + Math.sin(now * 0.008) * 4;

      // Desenha o sprite da Fadinha
      ctx.drawImage(fairySpriteImg, -fw / 2, -fh + 4, fw, fh);

      // Partículas de purpurina dourada caindo dos pés (Stardust Drift)
      for (let i = 0; i < 3; i++) {
        const driftT = (now * 0.003 + i * 0.33) % 1;
        const driftX = Math.sin(now * 0.008 + i * 2) * 10;
        const driftY = -4 + driftT * 10;
        const driftAlpha = (1 - driftT) * 0.8;
        const starColor = i % 2 === 0 ? `rgba(254, 240, 138, ${driftAlpha})` : `rgba(56, 189, 248, ${driftAlpha})`;
        drawSparkleStar4(ctx, driftX, driftY, 2.2 * (1 - driftT), starColor);
      }

      // Varinha Estelar empunhada na mão direita
      ctx.save();
      const handX = 14; // Mão direita alinhada na escala 80x62
      const handY = -14;
      const wandBob = Math.sin(now * 0.007) * 0.05;
      ctx.translate(handX, handY);
      ctx.rotate(0.12 + wandBob);

      // Brilho celestial da estrela no topo da varinha
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8 + Math.sin(now * 0.012) * 4;
      ctx.drawImage(fairyWandImg, -pivotX, -pivotY, ww, wh);

      // Pequena faísca cintilante pulsando no centro da estrela
      if (Math.sin(now * 0.015) > 0.4) {
        drawSparkleStar4(ctx, ww * (234 / 351) - pivotX, wh * (52 / 414) - pivotY, 2, '#ffffff');
      }

      ctx.restore(); // Fecha varinha
      ctx.restore(); // Fecha fadinha
      return;
    }

    // =========================================================================
    // 2. MODO ATAQUE: CANALIZAÇÃO ESTELAR & DISPARO DO FEIXE CÓSMICO (STARBURST)
    // =========================================================================
    ctx.save();
    ctx.translate(0, 16); // Pivot na base

    let lungeX = 0;
    let hoverY = -6;
    let bodyAngle = 0;
    let wandAngle = 0;
    let handX = 14;
    let handY = -14;
    let scaleX = 1;

    // FASE 1: ASCENSÃO E CARREGAMENTO DE ENERGIA CÓSMICA (0.00 a 0.22)
    if (swingProgress < 0.22) {
      const p = swingProgress / 0.22;
      hoverY = -6 - 8 * p; // Sobe no ar
      bodyAngle = -0.08 * p; // Inclina para trás canalizando
      lungeX = -2 * p;
      // Varinha erguida para o céu em ângulo cósmico
      wandAngle = -0.35 * p;
      handX = 14 + 2 * p;
      handY = -14 - 4 * p;
    }
    // FASE 2: DISPARO DO FEIXE ESTELAR PRISMÁTICO CONTRA A ROCHA (0.22 a 0.72)
    else if (swingProgress < 0.72) {
      const p = (swingProgress - 0.22) / 0.50;
      hoverY = -12 + Math.sin(p * Math.PI) * 2;
      lungeX = 4 + Math.sin(p * Math.PI) * 2;
      bodyAngle = 0.12; // Projeta tronco e asas para frente

      // Varinha apontada em linha reta para a rocha (+X):
      wandAngle = 1.021 + Math.sin(now * 0.08) * 0.02;
      handX = 14 + lungeX;
      handY = -14;
    }
    // FASE 3: PIRUETA CELESTIAL & POUSO GRACIOSO (0.72 a 1.00)
    else {
      const p = (swingProgress - 0.72) / 0.28;
      hoverY = -12 + 6 * p; // Desce de volta para altitude normal
      lungeX = 4 * (1 - p);
      bodyAngle = 0.12 * (1 - p);
      wandAngle = 1.021 * (1 - p);
      handX = 14;
      handY = -14;
      // Pirueta mágica de 360° no ar
      scaleX = Math.cos(p * Math.PI * 2);
    }

    // Sombra no solo com altitude dinâmica
    const shadowR = Math.max(8, 14 + hoverY * 0.3);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(lungeX, 0, shadowR, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Desenha corpo da Fadinha com transformações
    ctx.save();
    ctx.translate(lungeX, hoverY);
    ctx.rotate(bodyAngle);
    ctx.scale(scaleX, 1);

    // Brilho místico das asas batendo
    ctx.shadowColor = 'rgba(244, 114, 182, 0.7)';
    ctx.shadowBlur = (swingProgress >= 0.22 && swingProgress < 0.72) ? 18 : 10;
    ctx.drawImage(fairySpriteImg, -fw / 2, -fh + 4, fw, fh);
    ctx.restore(); // Fecha fada

    // Desenha Varinha Estelar com orientação dinâmica
    ctx.save();
    ctx.translate(handX, handY + hoverY);
    ctx.rotate(wandAngle);
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = (swingProgress >= 0.22 && swingProgress < 0.72) ? 16 : 8;
    ctx.drawImage(fairyWandImg, -pivotX, -pivotY, ww, wh);
    ctx.restore(); // Fecha varinha

    // Mãozinha delicada segurando a empunhadura
    ctx.fillStyle = '#fed7aa';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(handX, handY + hoverY, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // =========================================================================
    // EFEITOS DE DISPARO ESTELAR & EXPLOSÃO PRISMÁTICA NA ROCHA
    // =========================================================================
    const wandBaseAngle = -1.021;
    const wandLen = 18;
    const starTipX = handX + Math.cos(wandAngle + wandBaseAngle) * wandLen;
    const starTipY = handY + hoverY + Math.sin(wandAngle + wandBaseAngle) * wandLen;

    // 1. EFEITO DE CARREGAMENTO / VÓRTICE CÓSMICO (Fase 1: 0.08 a 0.22)
    if (swingProgress >= 0.08 && swingProgress < 0.22) {
      const chargeP = (swingProgress - 0.08) / 0.14;
      for (let s = 0; s < 5; s++) {
        const spiralA = now * 0.015 + (s * (Math.PI * 2 / 5));
        const spiralDist = (1 - chargeP) * 22 + 4;
        const sx = starTipX + Math.cos(spiralA) * spiralDist;
        const sy = starTipY + Math.sin(spiralA) * spiralDist;
        drawSparkleStar4(ctx, sx, sy, 2.5, s % 2 === 0 ? '#fef08a' : '#38bdf8');
      }
      ctx.fillStyle = 'rgba(254, 240, 138, 0.8)';
      ctx.beginPath();
      ctx.arc(starTipX, starTipY, 4 * chargeP, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. DISPARO DO FEIXE & IMPACTO NA ROCHA (Fase 2: 0.22 a 0.72)
    if (swingProgress >= 0.22 && swingProgress < 0.72) {
      const beamProgress = (swingProgress - 0.22) / 0.50;
      const impactX = handX + 78;
      const impactY = handY + hoverY;

      // A. FEIXE LASER ARCO-ÍRIS / PRISMÁTICO CENTRAL
      const beamGrad = ctx.createLinearGradient(starTipX, starTipY, impactX, impactY);
      beamGrad.addColorStop(0, '#ffffff');
      beamGrad.addColorStop(0.2, '#38bdf8');
      beamGrad.addColorStop(0.5, '#f472b6');
      beamGrad.addColorStop(0.8, '#fde047');
      beamGrad.addColorStop(1, '#ffffff');

      // Halo externo do feixe
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 9 + Math.sin(now * 0.06) * 3;
      ctx.beginPath();
      ctx.moveTo(starTipX, starTipY);
      ctx.lineTo(impactX, impactY);
      ctx.stroke();

      // Feixe médio colorido
      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = 4.5 + Math.sin(now * 0.08) * 1.5;
      ctx.beginPath();
      ctx.moveTo(starTipX, starTipY);
      ctx.lineTo(impactX, impactY);
      ctx.stroke();

      // Núcleo branco puro de alta energia
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(starTipX, starTipY);
      ctx.lineTo(impactX, impactY);
      ctx.stroke();

      // B. COMETAS / ESTRELAS CADENTES VIAJANDO PELO FEIXE
      for (let c = 0; c < 3; c++) {
        const cometT = (beamProgress * 3 + c * 0.35) % 1;
        const cometX = starTipX + (impactX - starTipX) * cometT;
        const cometY = starTipY + (impactY - starTipY) * cometT + Math.sin(cometT * Math.PI * 4) * 2;
        drawSparkleStar4(ctx, cometX, cometY, 3.5, c % 2 === 0 ? '#fef08a' : '#ffffff');
      }

      // C. EXPLOSÃO ESTELAR NO IMPACTO
      const starR = 9 + Math.sin(now * 0.05) * 3;
      drawStar8(ctx, impactX, impactY, starR, starR * 0.45, '#fef08a');
      drawStar8(ctx, impactX, impactY, starR * 0.6, starR * 0.25, '#ffffff');

      // Anel de choque mágico
      const ringR = 6 + (Math.sin(beamProgress * Math.PI * 18) + 1) * 6;
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.75)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(impactX, impactY, ringR, 0, Math.PI * 2);
      ctx.stroke();

      // Spray de poeira estelar cintilante
      for (let s = 0; s < 7; s++) {
        const sparkA = Math.PI - 0.9 + (s * 0.3) + Math.sin(now * 0.04 + s) * 0.2;
        const sparkDist = 8 + ((now * 0.07 + s * 6) % 24);
        const sx = impactX + Math.cos(sparkA) * sparkDist;
        const sy = impactY + Math.sin(sparkA) * sparkDist * 0.8;
        const sparkColor = s % 3 === 0 ? '#fef08a' : (s % 3 === 1 ? '#38bdf8' : '#f472b6');
        drawSparkleStar4(ctx, sx, sy, 2.4, sparkColor);
      }

      // Fragmentos de cristais mágicos
      for (let f = 0; f < 4; f++) {
        const fragA = Math.PI - 0.7 + (f * 0.45);
        const fragDist = 10 + ((now * 0.05 + f * 7) % 22);
        const fx = impactX + Math.cos(fragA) * fragDist;
        const fy = impactY + Math.sin(fragA) * fragDist * 0.8;
        ctx.fillStyle = f % 2 === 0 ? '#a5f3fc' : '#fbcfe8';
        ctx.fillRect(fx - 1.5, fy - 1.5, 3, 3);
      }

      // Fissuras luminosas de magia
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(impactX, impactY);
      ctx.lineTo(impactX + 8, impactY - 6);
      ctx.lineTo(impactX + 15, impactY - 10);
      ctx.moveTo(impactX, impactY);
      ctx.lineTo(impactX + 10, impactY + 6);
      ctx.lineTo(impactX + 16, impactY + 10);
      ctx.stroke();

      // D. FLOATING DAMAGE TEXT
      const floatY = impactY - 20 - (Math.sin(beamProgress * Math.PI) * 8);
      ctx.save();
      ctx.font = '900 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#db2777';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#09090b';
      ctx.fillText('✨ PÓ DE ESTRELAS! -46', impactX + 2, floatY + 1);
      ctx.fillStyle = '#fef08a';
      ctx.fillText('✨ PÓ DE ESTRELAS! -46', impactX + 2, floatY);
      ctx.restore();
    }

    // 3. CHUVA DE PURPURINA NA PIRUETA (Fase 3: 0.72 a 1.00)
    if (swingProgress >= 0.72) {
      for (let g = 0; g < 5; g++) {
        const glitterT = (now * 0.005 + g * 0.2) % 1;
        const gx = lungeX + Math.sin(now * 0.01 + g * 2) * 16;
        const gy = hoverY - 10 + glitterT * 26;
        drawSparkleStar4(ctx, gx, gy, 2 * (1 - glitterT), '#fef08a');
      }
    }

    ctx.restore(); // Fecha translate geral
    return;
  }

  // Fallback caso as imagens ainda não tenham finalizado o carregamento
  applyOutline(ctx);
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

export const drawBallerina = drawFairy;

// ----------------------------------------------------------------------------
// 10. HOMEM-ARANHA (spiderman) - Disparadores de Teia nos Pulsos (Web-Blast)
// ----------------------------------------------------------------------------
export function drawSpiderman(ctx, now, swingAngle, legAngle, swingProgress = 0, isMining = false) {
  ctx.save();
  ctx.translate(0, 16);
  ctx.scale(1.5, 1.5);
  ctx.translate(0, -6);
  applyOutline(ctx);

  // Tronco: Traje Azul Royal
  ctx.fillStyle = '#1d4ed8';
  ctx.beginPath();
  ctx.roundRect(-10, -1, 20, 14, 4);
  ctx.fill();
  ctx.stroke();

  // Peitoral Vermelho com Teias
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.roundRect(-5, -1, 10, 14, 2);
  ctx.fill();
  ctx.stroke();

  // Teias no Peitoral
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-5, 4); ctx.lineTo(5, 4);
  ctx.moveTo(-5, 9); ctx.lineTo(5, 9);
  ctx.moveTo(0, -1); ctx.lineTo(0, 13);
  ctx.stroke();
  applyOutline(ctx);

  // Aranha Negra no Centro do Peito
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.ellipse(0, 5, 2, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-2, 4); ctx.lineTo(-4, 2);
  ctx.moveTo(-2, 6); ctx.lineTo(-4, 8);
  ctx.moveTo(2, 4); ctx.lineTo(4, 2);
  ctx.moveTo(2, 6); ctx.lineTo(4, 8);
  ctx.stroke();
  applyOutline(ctx);

  // Cabeça Mascarada Vermelha com Teias
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(0, -11, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Teias da Máscara
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(0, -20); ctx.lineTo(0, -2);
  ctx.moveTo(-9, -11); ctx.lineTo(9, -11);
  ctx.moveTo(-6, -17); ctx.lineTo(6, -5);
  ctx.moveTo(-6, -5); ctx.lineTo(6, -17);
  ctx.stroke();
  applyOutline(ctx);

  // Olhos Brancos Grandes Triangulares com Borda Preta
  // Olho Esquerdo
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(-2, -12);
  ctx.lineTo(-8, -14);
  ctx.lineTo(-7, -7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Olho Direito
  ctx.beginPath();
  ctx.moveTo(2, -12);
  ctx.lineTo(8, -14);
  ctx.lineTo(7, -7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // === DISPARADORES DE TEIA NOS PULSOS (WEB-SHOOTERS - SEM PICARETA) ===
  ctx.save();
  ctx.translate(7, 3);

  if (!isMining) {
    // Modo caminhada: braço atlético com punho cerrado
    ctx.rotate(0.35 + Math.sin(now * 0.02) * 0.1);

    // Braço vermelho
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(-2, -3, 8, 5, 2);
    ctx.fill();
    ctx.stroke();

    // Punho fechado
    ctx.beginPath();
    ctx.arc(6, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Modo disparo: braço esticado com o gesto icônico aranha
    const reachX = Math.sin(swingProgress * Math.PI) * 4;
    ctx.translate(reachX, 0);
    ctx.rotate(-0.1);

    // Braço esticado para frente
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(-2, -3, 10, 5, 2);
    ctx.fill();
    ctx.stroke();

    // Pulso com Web-Shooter metálico
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(6, -3.5, 3, 6);

    // Mão no gesto aranha (dois dedos esticados, dois abaixados)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(9, 0, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // DISPARO COMPLETO DE TEIA ARANHA (JATO + REDE RADIAL NO MINÉRIO)
    if (swingProgress >= 0.18) {
      const webDist = 14 + Math.min(24, (swingProgress - 0.18) * 55);

      // Linha principal do cabo de teia branca
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(11, 0);
      ctx.lineTo(webDist, 0);
      ctx.stroke();

      // Linha de reforço suave
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(11, 0.5);
      ctx.lineTo(webDist, 0.5);
      ctx.stroke();

      // Fios secundários ondulantes espiralando ao redor do cabo
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(11, 0);
      ctx.quadraticCurveTo(11 + (webDist - 11) * 0.35, -5, 11 + (webDist - 11) * 0.7, 0);
      ctx.quadraticCurveTo(11 + (webDist - 11) * 0.85, 5, webDist, 0);
      ctx.moveTo(11, 0);
      ctx.quadraticCurveTo(11 + (webDist - 11) * 0.35, 5, 11 + (webDist - 11) * 0.7, 0);
      ctx.quadraticCurveTo(11 + (webDist - 11) * 0.85, -5, webDist, 0);
      ctx.stroke();

      // REDE DE TEIA DE ARANHA NO IMPACTO COM A ROCHA
      if (swingProgress >= 0.30) {
        const netR = Math.min(12, (swingProgress - 0.30) * 26);

        // Centro do impacto da teia
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(webDist, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Fios radiais da teia (8 direções)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.6;
        for (let a = 0; a < 8; a++) {
          const ang = (a * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(webDist, 0);
          ctx.lineTo(webDist + Math.cos(ang) * netR, Math.sin(ang) * netR);
          ctx.stroke();
        }

        // Círculos concêntricos da teia
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(webDist, 0, netR * 0.6, 0, Math.PI * 2);
        ctx.arc(webDist, 0, netR, 0, Math.PI * 2);
        ctx.stroke();

        // Estilhaços de teia partindo a rocha
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(webDist + netR * 0.7, -4, 2, 2);
        ctx.fillRect(webDist + netR * 0.7, 4, 2, 2);
        ctx.fillRect(webDist - 3, -netR * 0.8, 1.8, 1.8);
      }
    }
  }

  ctx.restore(); // Fecha web-shooters
  ctx.restore(); // Fecha escala geral do Spiderman
}

// ----------------------------------------------------------------------------
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
  ctx.font = `900 ${size}px sans-serif`;
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
    const ch = 56; // Altura unificada (56px)
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
      ctx.drawImage(executiveCharImg, -cw / 2, -ch + 6, cw, ch);

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
        drawDollarSign(ctx, 4, -14, 10, `rgba(74, 222, 128, ${dAlpha})`);
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
    ctx.drawImage(executiveCharImg, -cw / 2, -ch + 6, cw, ch);
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


        // 3. CIFRÕES DOURADOS ($) FLUTUANTES
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
        ctx.fillStyle = `rgba(34, 197, 94, ${(1 - driftT) * 0.8})`;
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

// ============================================================================
// 12. HERÓIS DO ROSTER (11 Sobreviventes e 11 Armas de public/assets/)
// Animação de Tiro com Mira, Recuo, Muzzle Flash, Balística e Impacto (estilo Pirata)
// ============================================================================
let heroRosterImg = null;
let heroRosterLoaded = false;
let heroRosterUpperImg = null;
let heroRosterLegLeftImg = null;
let heroRosterLegRightImg = null;
let weaponRosterImg = null;
let weaponRosterLoaded = false;

export function initRosterSprites() {
  if (typeof window === 'undefined') return;
  if (!heroRosterImg) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/assets/hero-roster.png?v=4';
    img.onload = () => {
      heroRosterImg = img;
      heroRosterLoaded = true;
    };
  }
  if (!heroRosterUpperImg) {
    const uImg = new Image();
    uImg.crossOrigin = 'anonymous';
    uImg.src = '/assets/hero-roster-upper.png?v=4';
    uImg.onload = () => {
      heroRosterUpperImg = uImg;
    };
  }
  if (!heroRosterLegLeftImg) {
    const llImg = new Image();
    llImg.crossOrigin = 'anonymous';
    llImg.src = '/assets/hero-roster-leg-left.png?v=4';
    llImg.onload = () => {
      heroRosterLegLeftImg = llImg;
    };
  }
  if (!heroRosterLegRightImg) {
    const lrImg = new Image();
    lrImg.crossOrigin = 'anonymous';
    lrImg.src = '/assets/hero-roster-leg-right.png?v=4';
    lrImg.onload = () => {
      heroRosterLegRightImg = lrImg;
    };
  }
  if (!weaponRosterImg) {
    const wImg = new Image();
    wImg.crossOrigin = 'anonymous';
    wImg.src = '/assets/weapon-roster.png?v=4';
    wImg.onload = () => {
      weaponRosterImg = wImg;
      weaponRosterLoaded = true;
    };
  }
}

if (typeof window !== 'undefined') {
  initRosterSprites();
}

/**
 * Renderiza qualquer herói sobrevivente do HERO_ROSTER com sua arma do WEAPON_CATALOG,
 * utilizando a consagrada mecânica de animação de tiro, mira horizontal, recuo e muzzle flash do Pirata.
 */
export function drawRosterHero(ctx, hero, weapon, now, swingAngle, legAngle, swingProgress = 0, isMining = false) {
  initRosterSprites();

  // Dimensões proporcionais dos Heróis baseadas na entrada do bunker (~36px de altura)
  const pw = 32; // Largura do herói calibrada
  const ph = 36; // Altura do herói calibrada (entra com folga na porta do bunker de 57px)
  const wScale = weapon?.scale || 1.0;
  const gw = 28 * wScale; // Largura proporcional da arma (calibrada por arma)
  const gh = 15 * wScale; // Altura proporcional da arma

  const spriteIndex = hero?.spriteIndex ?? 0;
  const sourceIndex = weapon?.sourceIndex ?? spriteIndex ?? 0;

  // Resolução nativa dinâmica dos spritesheets vetorizados (alta definição: cada herói tem 128px, cada arma 256px)
  const heroNaturalH = heroRosterImg?.naturalHeight || 128;
  const sw = 128;
  const sh = heroNaturalH;
  const sx = spriteIndex * sw;
  const sy = 0;

  const weaponNaturalH = weaponRosterImg?.naturalHeight || 144;
  const wsw = 256;
  const wsh = weaponNaturalH;
  const wsx = sourceIndex * wsw;
  const wsy = 0;

  const dx = -pw / 2;
  const dy = -(100 / 128) * ph; // Calibrado para que a sola da bota toque perfeitamente o solo e a sombra

  // Ponto anatômico exato da mão do herói e da empunhadura (grip) da arma
  const handBaseX = dx + pw * (86 / 128);
  const handBaseY = dy + ph * (69 / 128);
  const wGripX = gw * (100 / 256);
  const wGripY = gh * (74 / 144);

  // Pontos de pivô anatômicos do quadril para os heróis (proporcionais à moldura 128x128 centrada em x=64)
  const hipLeftX = dx + pw * (56 / 128);
  const hipLeftY = dy + ph * (72 / 128);

  const hipRightX = dx + pw * (72 / 128);
  const hipRightY = dy + ph * (72 / 128);

  const hasParts = heroRosterUpperImg?.complete && heroRosterLegLeftImg?.complete && heroRosterLegRightImg?.complete;

  // =========================================================================
  // 1. MODO REPOUSO & CAMINHADA (IDLE / WALKING)
  // =========================================================================
  if (!isMining) {
    ctx.save();
    ctx.translate(0, 14); // Pivot exatamente na base dos pés

    // Frequência dinâmica dos passos (mesmo ritmo e amplitude de passada dos zumbis)
    const stepPhase = now * 0.016;
    const heroLegSwing = Math.sin(stepPhase) * 0.42; // ~24 graus de passada alternada
    const stepBob = Math.abs(Math.sin(stepPhase)) * 1.6;
    const torsoSway = Math.sin(stepPhase) * 0.035;

    if (hasParts) {
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 1. Perna Direita (trás / fundo)
      ctx.save();
      ctx.translate(hipRightX, hipRightY);
      ctx.rotate(-heroLegSwing);
      ctx.translate(-hipRightX, -hipRightY);
      ctx.drawImage(heroRosterLegRightImg, sx, sy, sw, sh, dx, dy, pw, ph);
      ctx.restore();

      // 2. Perna Esquerda (frente)
      ctx.save();
      ctx.translate(hipLeftX, hipLeftY);
      ctx.rotate(heroLegSwing);
      ctx.translate(-hipLeftX, -hipLeftY);
      ctx.drawImage(heroRosterLegLeftImg, sx, sy, sw, sh, dx, dy, pw, ph);
      ctx.restore();

      // 3. Tronco Superior (Cabeça, Jaqueta, Torso, Braços)
      ctx.save();
      ctx.translate(0, -stepBob);
      ctx.rotate(torsoSway);
      ctx.drawImage(heroRosterUpperImg, sx, sy, sw, sh, dx, dy, pw, ph);

      // Arma apoiada diretamente na mão direita do herói em marcha
      if (weaponRosterLoaded && weaponRosterImg) {
        ctx.save();
        ctx.translate(handBaseX - 1, handBaseY + 1);
        ctx.rotate(0.35 + Math.sin(stepPhase) * 0.04);
        ctx.drawImage(weaponRosterImg, wsx, wsy, wsw, wsh, -wGripX, -wGripY, gw, gh);

        // Mão do herói segurando a coronha / empunhadura
        ctx.fillStyle = '#fed7aa';
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore(); // Fecha tronco
      ctx.restore(); // Fecha filtros
    } else if (heroRosterLoaded && heroRosterImg) {
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(heroRosterImg, sx, sy, sw, sh, dx, dy, pw, ph);
      if (weaponRosterLoaded && weaponRosterImg) {
        ctx.save();
        ctx.translate(handBaseX - 1, handBaseY + 1);
        ctx.rotate(0.35);
        ctx.drawImage(weaponRosterImg, wsx, wsy, wsw, wsh, -wGripX, -wGripY, gw, gh);
        ctx.restore();
      }
      ctx.restore();
    } else {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(dx, dy, pw, ph);
    }

    ctx.restore();
    return;
  }

  // =========================================================================
  // 2. MODO ATAQUE: DISPARO DE ARMA COM LEVE BALANÇO PARA TRÁS E SEM CORTE
  // =========================================================================
  ctx.save();
  ctx.translate(0, 14); // Pivot nos pés

  let bodyRock = 0;   // Ângulo de balanço suave do corpo (radianos)
  let bodyShift = 0;  // Recuo linear suave (pixels)
  let gunAngle = 0;   // Coice do cano para cima

  // FASE 1: MIRA & ENGATILHAMENTO HORIZONTAL (0.00 a 0.32)
  if (swingProgress < 0.32) {
    const p = swingProgress / 0.32;
    bodyRock = 0.02 * p;
    gunAngle = 0.25 - p * 0.25; // Alinha horizontalmente
  }
  // FASE 2: DETONAÇÃO, DISPARO E LEVE BALANÇO PARA TRÁS (0.32 a 0.48)
  else if (swingProgress < 0.48) {
    const p = (swingProgress - 0.32) / 0.16;
    const kick = Math.sin(p * Math.PI);
    bodyRock = 0.02 - kick * 0.07; // Leve balanço para trás (~4 graus)
    bodyShift = -kick * 2.0;       // Recuo suave de 2px
    gunAngle = -kick * 0.22;       // Cano dá coice para cima
  }
  // FASE 3: SUSTENTAÇÃO DE IMPACTO E FUMAÇA (0.48 a 0.75)
  else if (swingProgress < 0.75) {
    const p = (swingProgress - 0.48) / 0.27;
    bodyRock = -0.05 * (1 - p);
    bodyShift = -2.0 * (1 - p);
    gunAngle = -0.10 * (1 - p);
  }
  // FASE 4: RECUPERAÇÃO E RETORNO (0.75 a 1.00)
  else {
    const p = (swingProgress - 0.75) / 0.25;
    gunAngle = p * 0.25;
  }

  // Desenha Corpo do Herói: pernas e tronco unidos no mesmo balanço suave (SEM CORTAR NO MEIO!)
  ctx.save();
  ctx.translate(bodyShift, 0);
  ctx.rotate(bodyRock);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (hasParts) {
    ctx.drawImage(heroRosterLegRightImg, sx, sy, sw, sh, dx, dy, pw, ph);
    ctx.drawImage(heroRosterLegLeftImg, sx, sy, sw, sh, dx, dy, pw, ph);
    ctx.drawImage(heroRosterUpperImg, sx, sy, sw, sh, dx, dy, pw, ph);
  } else if (heroRosterLoaded && heroRosterImg) {
    ctx.drawImage(heroRosterImg, sx, sy, sw, sh, dx, dy, pw, ph);
  } else {
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(dx, dy, pw, ph);
  }

  // Desenha a Arma do Herói empunhada diretamente na mão (sem flutuar)
  if (weaponRosterLoaded && weaponRosterImg) {
    ctx.save();
    ctx.translate(handBaseX, handBaseY);
    ctx.rotate(gunAngle);
    ctx.drawImage(weaponRosterImg, wsx, wsy, wsw, wsh, -wGripX, -wGripY, gw, gh);

    // Mão do herói segurando a empunhadura
    ctx.fillStyle = '#fed7aa';
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Posição da boca do cano (Muzzle)
    const muzzleLocalX = gw - wGripX;
    const muzzleLocalY = -1;

    // 1. FLASH DE DISPARO DA BOCA DO CANO (0.32 a 0.42)
    if (swingProgress >= 0.32 && swingProgress <= 0.42) {
      const flashP = (swingProgress - 0.32) / 0.10;
      const flashSize = 8 + (1 - flashP) * 5;
      const category = weapon?.category || 'rifle';

      ctx.save();
      if (category === 'energia') {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#38bdf8';
      } else if (category === 'especial') {
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#ea580c';
      } else if (category === 'suporte') {
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#10b981';
      } else {
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#fef08a';
      }

      ctx.beginPath();
      ctx.moveTo(muzzleLocalX, muzzleLocalY - 2.5);
      ctx.lineTo(muzzleLocalX + flashSize * 1.5, muzzleLocalY - 5);
      ctx.lineTo(muzzleLocalX + flashSize * 1.7, muzzleLocalY);
      ctx.lineTo(muzzleLocalX + flashSize * 1.5, muzzleLocalY + 5);
      ctx.lineTo(muzzleLocalX, muzzleLocalY + 2.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.restore(); // Fecha arma
  }

  ctx.restore(); // Fecha corpo unificado

  // 2. PROJÉTIL EM VOO ULTRARRÁPIDO (0.33 a 0.46) - Distância encurtada pela metade para 26px
  const muzzleWorldX = handBaseX + (gw - wGripX);
  const muzzleWorldY = handBaseY - 1;
  const targetX = 26; // Encurtada pela metade (era 52)
  const targetY = -6;

  if (swingProgress >= 0.33 && swingProgress <= 0.46) {
    const bulletP = (swingProgress - 0.33) / 0.13;
    const category = weapon?.category || 'rifle';

    ctx.save();
    if (category === 'explosivo') {
      // Granada pesada arremessada em arco parabólico com rotação
      const arc = Math.sin(bulletP * Math.PI) * 14;
      const gx = muzzleWorldX + (targetX - muzzleWorldX) * bulletP;
      const gy = muzzleWorldY + (targetY - muzzleWorldY) * bulletP - arc;
      ctx.translate(gx, gy);
      ctx.rotate(bulletP * Math.PI * 3);
      ctx.fillStyle = '#3f6212';
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, 3.5, 4.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (category === 'molotov') {
      // Coquetel Molotov em parábola com pavio ardente
      const arc = Math.sin(bulletP * Math.PI) * 12;
      const mx = muzzleWorldX + (targetX - muzzleWorldX) * bulletP;
      const my = muzzleWorldY + (targetY - muzzleWorldY) * bulletP - arc;
      ctx.translate(mx, my);
      ctx.rotate(bulletP * Math.PI * 2);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-2, -3, 4, 7);
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, -6, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (category === 'especial') {
      // Lança-chamas: cone contínuo de chamas em expansão
      for (let f = 0; f < 4; f++) {
        const fp = Math.min(1, bulletP + f * 0.15);
        const fx = muzzleWorldX + (targetX - muzzleWorldX) * fp;
        const fy = muzzleWorldY + (targetY - muzzleWorldY) * fp + (Math.sin(now * 0.05 + f) * 3);
        const fSize = 3 + fp * 6;
        ctx.fillStyle = f % 2 === 0 ? '#fef08a' : '#f97316';
        ctx.beginPath();
        ctx.arc(fx, fy, fSize, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (category === 'energia') {
      // Feixe de plasma azul
      const bx = muzzleWorldX + (targetX - muzzleWorldX) * bulletP;
      const by = muzzleWorldY + (targetY - muzzleWorldY) * bulletP;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(muzzleWorldX, muzzleWorldY);
      ctx.lineTo(bx, by);
      ctx.stroke();

      ctx.fillStyle = '#e0f2fe';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Traçante balístico convencional
      const bx = muzzleWorldX + (targetX - muzzleWorldX) * bulletP;
      const by = muzzleWorldY + (targetY - muzzleWorldY) * bulletP;
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(muzzleWorldX, muzzleWorldY);
      ctx.lineTo(bx, by);
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 3. NUVEM DE FUMAÇA DO DISPARO (0.34 a 0.75)
  if (swingProgress >= 0.34 && swingProgress <= 0.75) {
    const smokeP = (swingProgress - 0.34) / 0.41;
    const smokeAlpha = (1 - smokeP) * 0.55;
    const smokeDist = smokeP * 18;

    ctx.save();
    ctx.fillStyle = `rgba(226, 232, 240, ${smokeAlpha})`;
    ctx.beginPath();
    ctx.arc(muzzleWorldX + 6 + smokeDist * 0.5, muzzleWorldY - 2 - smokeDist * 0.3, 7 + smokeP * 8, 0, Math.PI * 2);
    ctx.arc(muzzleWorldX + 12 + smokeDist, muzzleWorldY + 3, 5 + smokeP * 7, 0, Math.PI * 2);
    ctx.arc(muzzleWorldX - 2, muzzleWorldY - 6 - smokeDist * 0.2, 6 + smokeP * 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 4. DETONAÇÃO & IMPACTO NO ALVO (0.45 a 0.75)
  if (swingProgress >= 0.45 && swingProgress <= 0.75) {
    const impactX = targetX;
    const impactY = targetY;
    const impactP = (swingProgress - 0.45) / 0.30;
    const category = weapon?.category || 'rifle';

    if (category === 'explosivo') {
      // Bola de fogo e onda de choque da granada
      ctx.save();
      const expRadius = 6 + impactP * 14;
      ctx.globalAlpha = Math.max(0, 1 - impactP);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(impactX, impactY, expRadius * 1.2, 0, Math.PI * 2);
      ctx.stroke();

      const grad = ctx.createRadialGradient(impactX, impactY, 0, impactX, impactY, expRadius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#fef08a');
      grad.addColorStop(0.7, '#f97316');
      grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(impactX, impactY, expRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (category === 'molotov' || category === 'especial') {
      // Fogo consumidor da garrafa de molotov e do lança-chamas
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - impactP * 0.7);
      for (let k = 0; k < 5; k++) {
        const fx = impactX + (k - 2) * 4;
        const fy = impactY + 4;
        const fh = 8 + Math.sin(now * 0.03 + k) * 6;
        ctx.fillStyle = k % 2 === 0 ? '#f97316' : '#fef08a';
        ctx.beginPath();
        ctx.moveTo(fx - 2, fy);
        ctx.lineTo(fx, fy - fh);
        ctx.lineTo(fx + 2, fy);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    } else {
      // Fissuras e cratera de impacto
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(impactX, impactY);
      ctx.lineTo(impactX + 10, impactY - 8);
      ctx.lineTo(impactX + 18, impactY - 14);
      ctx.moveTo(impactX, impactY);
      ctx.lineTo(impactX + 12, impactY + 6);
      ctx.lineTo(impactX + 20, impactY + 12);
      ctx.stroke();
    }

    // Faíscas incandescentes
    for (let i = 0; i < 6; i++) {
      const spkAngle = Math.PI - 0.8 + (i * 0.32) + Math.sin(now * 0.05 + i) * 0.2;
      const spkDist = 6 + ((now * 0.08 + i * 5) % 24);
      const sx = impactX + Math.cos(spkAngle) * spkDist;
      const sy = impactY + Math.sin(spkAngle) * spkDist * 0.75;
      ctx.fillStyle = i % 2 === 0 ? '#fef08a' : (i % 3 === 0 ? '#f97316' : '#ef4444');
      ctx.beginPath();
      ctx.arc(sx, sy, 2.0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}
