import React, { useState } from 'react';
import { X, Star, Lock, Play, Trophy, Sparkles, Compass, Shield, Award } from 'lucide-react';
import { MINES } from '../data/minersData';

// 11 Fases Oficiais da Trilha da Mina (baseadas exatamente no Mapa de Campanha enviado)
export const CAMPAIGN_STAGES = [
  {
    id: 1,
    name: 'Entrada da Mina Antiga',
    subtitle: 'Nível 1 · Solo de Cascalho',
    mineId: 'rock',
    stars: 3,
    bcoinReward: 1.25,
    difficulty: 'Fácil',
    description: 'Início da expedição subterrânea. Rochas comuns e pequenas jazidas superficiais de ouro.',
    drops: 'Pedras Comuns & Pepitas de Ouro',
    x: 95,
    y: 370
  },
  {
    id: 2,
    name: 'Curva dos Trilhos de Madeira',
    subtitle: 'Nível 2 · Galeria Inicial',
    mineId: 'rock',
    stars: 3,
    bcoinReward: 1.80,
    difficulty: 'Fácil',
    description: 'Os trilhos começam a descer em direção à rocha matriz. Primeiros veios de ouro puro encontrados.',
    drops: 'Veios de Ouro & Baús Rústicos',
    x: 285,
    y: 340
  },
  {
    id: 3,
    name: 'Galeria do Cobre e Quartzo',
    subtitle: 'Nível 3 · Encosta Rochosa',
    mineId: 'rock',
    stars: 3,
    bcoinReward: 2.40,
    difficulty: 'Normal',
    description: 'Parede íngreme com minérios de alta densidade. Exige mineradores com bom poder de impacto.',
    drops: 'Ouro Maciço & Fragmentos de Safira',
    x: 300,
    y: 200
  },
  {
    id: 4,
    name: 'Pico dos Vagonetes',
    subtitle: 'Nível 4 · O Ponto Alto da Mina',
    mineId: 'gold',
    stars: 3,
    bcoinReward: 3.10,
    difficulty: 'Normal',
    description: 'Platô elevado onde os vagonetes descarregam as cargas mais valiosas da cordilheira subterrânea.',
    drops: 'Super Veios de Ouro (2x BCOIN)',
    x: 360,
    y: 65
  },
  {
    id: 5,
    name: 'Cruzamento das Cavernas Altas',
    subtitle: 'Nível 5 · Entroncamento Central',
    mineId: 'gold',
    stars: 3,
    bcoinReward: 3.85,
    difficulty: 'Normal',
    description: 'Bifurcação de trilhos sobre o abismo. Baús antigos enterrados sob as vigas de sustentação.',
    drops: 'Cofres de Ouro & Picaretas de Ferro',
    x: 585,
    y: 65
  },
  {
    id: 6,
    name: 'Descida da Safira Azul',
    subtitle: 'Nível 6 · Túnel de Cristalina',
    mineId: 'diamond',
    stars: 2,
    bcoinReward: 4.60,
    difficulty: 'Médio',
    description: 'Cristais azuis cintilantes brotam das fendas laterais. Dano mágico elevado.',
    drops: 'Diamantes Azuis Safira (+0.80 BCOIN)',
    x: 715,
    y: 170
  },
  {
    id: 7,
    name: 'Vale das Esmeraldas Verdes',
    subtitle: 'Nível 7 · Caverna Verdejante',
    mineId: 'emerald',
    stars: 2,
    bcoinReward: 5.40,
    difficulty: 'Médio',
    description: 'Rochas impregnadas com esmeraldas puras. Bônus especial para heróis ninjas e ágeis.',
    drops: 'Esmeraldas Raras & Amuletos da Sorte',
    x: 625,
    y: 300
  },
  {
    id: 8,
    name: 'Abismo dos Guardiões',
    subtitle: 'Nível 8 · Desfiladeiro Sombrio',
    mineId: 'emerald',
    stars: 1,
    bcoinReward: 6.20,
    difficulty: 'Difícil',
    description: 'Queda vertiginosa com alta resistência de rocha. Altares antigos e espíritos mineradores aprisionados.',
    drops: 'Altares de Heróis & Relíquias Místicas',
    x: 505,
    y: 430
  },
  {
    id: 9,
    name: 'Curva do Titânio Profundo',
    subtitle: 'Nível 9 · Camada Magmática',
    mineId: 'volcano',
    stars: 2,
    bcoinReward: 7.10,
    difficulty: 'Difícil',
    description: 'Calor intenso e rochas de titânio indestrutíveis. Exige ferramentas reforçadas com estrelas.',
    drops: 'Baús de Titânio & Elmos de Proteção',
    x: 615,
    y: 570
  },
  {
    id: 10,
    name: 'Santuário dos Deuses da Mina',
    subtitle: 'Nível 10 · Câmara Sagrada (Atual)',
    mineId: 'volcano',
    stars: 0,
    bcoinReward: 8.50,
    difficulty: 'Muito Difícil',
    description: 'Onde repousa o crânio ancestral de ouro. Grande desafio com alta taxa de recomposição de estamina.',
    drops: 'Relíquias Ancestrais & Super BCOIN Pool',
    x: 780,
    y: 500
  },
  {
    id: 11,
    name: 'O Túnel do Tesouro Lendário',
    subtitle: 'Nível 11 · Fim da Linha dos Trilhos',
    mineId: 'volcano',
    stars: 0,
    bcoinReward: 12.00,
    difficulty: 'Lendário (Boss)',
    description: 'O portal final dos trilhos da mina. O chefão de titânio guarda o tesouro definitivo do CryptoZombies!',
    drops: 'Tesouro Lendário (~12.00 BCOIN + 5★ Drop)',
    x: 905,
    y: 370
  }
];

export default function CampaignMapModal({
  isOpen,
  onClose,
  currentStage = 10,
  onSelectStage,
  activeHero,
  bcoin
}) {
  const [selectedStage, setSelectedStage] = useState(
    CAMPAIGN_STAGES.find(s => s.id === currentStage) || CAMPAIGN_STAGES[6]
  );

  if (!isOpen) return null;

  const totalStars = CAMPAIGN_STAGES.reduce((acc, s) => acc + (s.stars || 0), 0);
  const maxStars = CAMPAIGN_STAGES.length * 3;

  const handleLaunchStage = (stg) => {
    if (onSelectStage) {
      onSelectStage(stg);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-5xl rounded-3xl bg-slate-950 border-2 border-amber-600/50 text-slate-100 shadow-[0_0_80px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden max-h-[95vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabeçalho do Mapa de Campanha */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-600/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl border border-amber-500/40 shadow-inner">
              🗺️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-arcade text-base sm:text-lg text-amber-300 tracking-wide drop-shadow">
                  TRILHA DA MINA · MAPA DE FASES
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold font-mono">
                  SAGA CRYPTOZOMBIES
                </span>
              </div>
              <p className="text-xs text-amber-200/70 font-tech">
                Avance pelos trilhos sinuosos da montanha subterrânea, complete estrelas e derrote as rochas ancestrais!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Placar de Estrelas Coletadas */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-amber-500/40 px-3.5 py-1.5 rounded-2xl shadow-inner">
              <Star size={16} className="text-amber-400 fill-amber-400 animate-pulse" />
              <span className="font-mono text-xs font-bold text-amber-300">
                {totalStars} / {maxStars} ★
              </span>
            </div>

            {/* Botão Fechar */}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Conteúdo Principal: Mapa Ilustrado em SVG no estilo exato da referência */}
        <div className="relative flex-1 bg-[#4a2e18] overflow-hidden flex items-center justify-center min-h-[380px] sm:min-h-[500px]">
          {/* Ilustração Vetorial Completa do Mapa da Mina */}
          <svg
            viewBox="0 0 1024 617"
            className="w-full h-full object-contain select-none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Gradientes de Terreno Montanhoso Subterrâneo */}
              <linearGradient id="canyonBase" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#784825" />
                <stop offset="50%" stopColor="#5d3417" />
                <stop offset="100%" stopColor="#45230d" />
              </linearGradient>

              <linearGradient id="tierHigh" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#9a5e32" />
                <stop offset="100%" stopColor="#754320" />
              </linearGradient>

              <linearGradient id="tierMid" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#b47240" />
                <stop offset="100%" stopColor="#874e27" />
              </linearGradient>

              <linearGradient id="railSteel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>

              <radialGradient id="crystalGlowBlue" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#0284c7" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="crystalGlowPurple" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#9333ea" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#6b21a8" stopOpacity="0" />
              </radialGradient>

              {/* Filtro de Sombra Suave dos Elementos */}
              <filter id="shadowDrop" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#1e1005" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* 1. FUNDO DO CÂNION E PLATÔS ESCALONADOS (TERRAÇOS DA MINA) */}
            <rect width="1024" height="617" fill="url(#canyonBase)" />

            {/* Camadas de Rocha Terracota Curvadas */}
            {/* Platô Superior Esquerdo */}
            <path
              d="M 0,0 L 480,0 Q 420,120 320,180 Q 220,240 100,280 L 0,300 Z"
              fill="url(#tierHigh)"
              stroke="#381b0a"
              strokeWidth="4"
            />
            {/* Platô Central Superior */}
            <path
              d="M 450,0 L 1024,0 L 1024,180 Q 860,190 740,240 Q 640,280 500,200 Q 430,130 450,0 Z"
              fill="url(#tierMid)"
              stroke="#381b0a"
              strokeWidth="4"
            />
            {/* Colina Central Intermediária */}
            <path
              d="M 380,240 Q 520,180 680,260 Q 720,380 620,440 Q 480,480 380,360 Z"
              fill="#6a3a19"
              stroke="#301507"
              strokeWidth="4"
            />
            {/* Encosta Inferior Direita */}
            <path
              d="M 680,380 Q 820,340 960,400 L 1024,440 L 1024,617 L 620,617 Q 660,510 680,380 Z"
              fill="url(#tierHigh)"
              stroke="#381b0a"
              strokeWidth="4"
            />
            {/* Depressão do Lago / Pântano Inferior Esquerdo */}
            <path
              d="M 0,440 Q 140,430 220,510 Q 260,580 200,617 L 0,617 Z"
              fill="#522b13"
              stroke="#2e1406"
              strokeWidth="3"
            />

            {/* Fendas e Rachaduras Geológicas nas Rochas */}
            <g stroke="#261005" strokeWidth="2.5" fill="none" opacity="0.6">
              <path d="M 60,140 Q 110,170 140,150 Q 180,190 200,180" />
              <path d="M 780,80 Q 830,100 870,75 Q 920,120 950,110" />
              <path d="M 460,330 Q 510,360 540,340" />
              <path d="M 720,490 Q 760,520 810,500" />
            </g>

            {/* 2. ENTRADA DO TÚNEL DA MINA (ARCO DE MADEIRA RÚSTICA COM CORDA) */}
            <g transform="translate(380, 210)" filter="url(#shadowDrop)">
              {/* Interior Escuro Profundo */}
              <ellipse cx="60" cy="90" rx="36" ry="46" fill="#090503" />
              <rect x="24" y="80" width="72" height="60" fill="#090503" />
              
              {/* Postes de Madeira Inclinados */}
              <polygon points="12,145 28,145 42,45 24,45" fill="#5c2d12" stroke="#261005" strokeWidth="3" />
              <polygon points="92,145 108,145 96,45 78,45" fill="#5c2d12" stroke="#261005" strokeWidth="3" />
              {/* Viga Superior de Carvalho */}
              <polygon points="16,48 104,48 100,28 20,28" fill="#783d19" stroke="#261005" strokeWidth="3" />
              {/* Amarrações de Corda de Sisal */}
              <rect x="23" y="32" width="10" height="14" rx="2" fill="#d97706" stroke="#451a03" strokeWidth="1.5" />
              <rect x="87" y="32" width="10" height="14" rx="2" fill="#d97706" stroke="#451a03" strokeWidth="1.5" />
            </g>

            {/* 3. VAGONETE DE CARGA NO PLATÔ CENTRAL (OFICIAL PIXEL-ART) */}
            <g transform="translate(490, 140)" filter="url(#shadowDrop)">
              <ellipse cx="48" cy="62" rx="42" ry="10" fill="rgba(0,0,0,0.55)" />
              <image href="/minecart_pixel.png" x="0" y="0" width="96" height="70" preserveAspectRatio="xMidYMid meet" />
            </g>

            {/* 4. PLACA DE MADEIRA DIRECIONAL */}
            <g transform="translate(490, 85)" filter="url(#shadowDrop)">
              <rect x="22" y="30" width="8" height="40" fill="#451a03" stroke="#1c0d06" strokeWidth="2" />
              <polygon points="6,8 52,8 64,22 52,36 6,36" fill="#78350f" stroke="#1c0d06" strokeWidth="2.5" />
              <line x1="16" y1="22" x2="48" y2="22" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" />
              <polyline points="40,15 48,22 40,29" stroke="#fef08a" strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>

            {/* 5. CAIXAS DE MADEIRA (DINAMITE / SUPRIMENTOS) */}
            {/* Caixa Superior Esquerda */}
            <g transform="translate(90, 165)" filter="url(#shadowDrop)">
              <rect x="0" y="0" width="54" height="54" rx="4" fill="#854d0e" stroke="#261005" strokeWidth="3" />
              <rect x="6" y="6" width="42" height="42" fill="#a16207" />
              <line x1="6" y1="6" x2="48" y2="48" stroke="#3a1d08" strokeWidth="3" />
              <line x1="48" y1="6" x2="6" y2="48" stroke="#3a1d08" strokeWidth="3" />
              {/* Segunda caixa atrás */}
              <g transform="translate(36, -26)">
                <rect x="0" y="0" width="50" height="50" rx="4" fill="#713f12" stroke="#261005" strokeWidth="3" />
                <line x1="5" y1="5" x2="45" y2="45" stroke="#3a1d08" strokeWidth="2.5" />
                <line x1="45" y1="5" x2="5" y2="45" stroke="#3a1d08" strokeWidth="2.5" />
              </g>
            </g>
            {/* Caixa Direita */}
            <g transform="translate(760, 310)" filter="url(#shadowDrop)">
              <rect x="0" y="0" width="54" height="54" rx="4" fill="#854d0e" stroke="#261005" strokeWidth="3" />
              <line x1="6" y1="6" x2="48" y2="48" stroke="#3a1d08" strokeWidth="3" />
              <line x1="48" y1="6" x2="6" y2="48" stroke="#3a1d08" strokeWidth="3" />
            </g>

            {/* 6. BARRIS DE CARVALHO COM ÁGUA / PÓLVORA */}
            <g transform="translate(380, 515)" filter="url(#shadowDrop)">
              {/* Barril 1 */}
              <g transform="translate(0, 0)">
                <ellipse cx="26" cy="46" rx="22" ry="7" fill="rgba(0,0,0,0.5)" />
                <path d="M 6,10 Q 0,26 8,44 Q 26,48 44,44 Q 52,26 46,10 Z" fill="#92400e" stroke="#261005" strokeWidth="2.5" />
                <ellipse cx="26" cy="10" rx="20" ry="7" fill="#38bdf8" stroke="#261005" strokeWidth="2" />
                <line x1="3" y1="22" x2="49" y2="22" stroke="#1e293b" strokeWidth="2" />
                <line x1="5" y1="34" x2="47" y2="34" stroke="#1e293b" strokeWidth="2" />
              </g>
              {/* Barril 2 */}
              <g transform="translate(42, 14)">
                <ellipse cx="26" cy="46" rx="22" ry="7" fill="rgba(0,0,0,0.5)" />
                <path d="M 6,10 Q 0,26 8,44 Q 26,48 44,44 Q 52,26 46,10 Z" fill="#78350f" stroke="#261005" strokeWidth="2.5" />
                <ellipse cx="26" cy="10" rx="20" ry="7" fill="#0284c7" stroke="#261005" strokeWidth="2" />
                <line x1="3" y1="22" x2="49" y2="22" stroke="#1e293b" strokeWidth="2" />
              </g>
            </g>

            {/* 7. CRISTAIS LUMINOSOS NAS ROCHAS (AZUIS E ROXOS) */}
            {/* Cristais Azuis Canto Superior Esquerdo */}
            <g transform="translate(130, 80)">
              <circle cx="20" cy="20" r="28" fill="url(#crystalGlowBlue)" />
              <polygon points="12,32 16,10 24,18 20,32" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
              <polygon points="20,32 26,4 32,14 26,32" fill="#7dd3fc" stroke="#0284c7" strokeWidth="1.5" />
              <polygon points="26,32 34,16 38,24 30,32" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
            </g>
            {/* Cristais Azuis Superior Direito */}
            <g transform="translate(860, 80)">
              <circle cx="20" cy="20" r="28" fill="url(#crystalGlowBlue)" />
              <polygon points="14,30 20,8 26,16 22,30" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
              <polygon points="22,30 28,2 34,12 28,30" fill="#7dd3fc" stroke="#0284c7" strokeWidth="1.5" />
            </g>
            {/* Cristais Roxos no Cânion Central */}
            <g transform="translate(405, 140)">
              <circle cx="20" cy="20" r="24" fill="url(#crystalGlowPurple)" />
              <polygon points="12,28 18,8 24,16 20,28" fill="#c084fc" stroke="#7e22ce" strokeWidth="1.5" />
              <polygon points="20,28 26,2 32,12 26,28" fill="#e9d5ff" stroke="#7e22ce" strokeWidth="1.5" />
            </g>
            {/* Cristais Roxos perto da Fase 8 */}
            <g transform="translate(640, 540)">
              <circle cx="20" cy="20" r="24" fill="url(#crystalGlowPurple)" />
              <polygon points="12,28 18,8 24,16 20,28" fill="#c084fc" stroke="#7e22ce" strokeWidth="1.5" />
              <polygon points="20,28 26,2 32,12 26,28" fill="#e9d5ff" stroke="#7e22ce" strokeWidth="1.5" />
            </g>

            {/* 8. OS TRILHOS SINUOSOS DA MINA (DORMENTES DE MADEIRA + TRILHOS DE AÇO) */}
            {/* Caminho Sinuoso Completo */}
            <path
              id="mineTrackPath"
              d="M 60,395 C 160,390 240,380 290,340 C 330,300 310,240 315,190 C 320,130 320,70 375,65 C 440,60 520,60 585,65 C 670,70 725,110 730,180 C 735,250 670,300 625,320 C 560,350 490,400 500,450 C 510,510 570,590 640,580 C 720,570 780,530 810,470 C 850,390 890,360 960,360"
              fill="none"
              stroke="#3a200e"
              strokeWidth="42"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dormentes de Madeira Escura */}
            <path
              d="M 60,395 C 160,390 240,380 290,340 C 330,300 310,240 315,190 C 320,130 320,70 375,65 C 440,60 520,60 585,65 C 670,70 725,110 730,180 C 735,250 670,300 625,320 C 560,350 490,400 500,450 C 510,510 570,590 640,580 C 720,570 780,530 810,470 C 850,390 890,360 960,360"
              fill="none"
              stroke="#542e13"
              strokeWidth="36"
              strokeDasharray="9,18"
              strokeLinecap="butt"
              strokeLinejoin="round"
            />
            {/* Trilho de Ferro Esquerdo/Superior */}
            <path
              d="M 60,386 C 160,381 240,371 285,333 C 323,295 303,237 308,187 C 313,127 313,67 372,60 C 438,55 518,55 583,60 C 665,65 718,105 723,173 C 728,241 665,291 620,311 C 555,341 483,391 493,443 C 503,501 563,581 635,571 C 713,561 773,521 803,463 C 843,383 883,353 960,353"
              fill="none"
              stroke="url(#railSteel)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Trilho de Ferro Direito/Inferior */}
            <path
              d="M 60,404 C 160,399 240,389 295,347 C 337,305 317,243 322,193 C 327,133 327,73 378,70 C 442,65 522,65 587,70 C 675,75 732,115 737,187 C 742,259 675,309 630,329 C 565,359 497,409 507,457 C 517,519 577,599 645,589 C 727,579 787,539 817,477 C 857,397 897,367 960,367"
              fill="none"
              stroke="url(#railSteel)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 9. CRISTAIS ROXOS DECORATIVOS NAS PARADAS DOS TRILHOS */}
            {[
              { x: 70, y: 360 },
              { x: 260, y: 320 },
              { x: 265, y: 195 },
              { x: 340, y: 55 },
              { x: 605, y: 60 },
              { x: 745, y: 160 },
              { x: 605, y: 285 },
              { x: 480, y: 410 },
              { x: 645, y: 580 },
              { x: 925, y: 380 }
            ].map((pos, idx) => (
              <g key={`purple-crystal-${idx}`} transform={`translate(${pos.x}, ${pos.y})`}>
                <polygon points="6,18 10,4 14,10 12,18" fill="#c084fc" stroke="#6b21a8" strokeWidth="1" />
                <polygon points="12,18 16,0 20,8 16,18" fill="#e9d5ff" stroke="#6b21a8" strokeWidth="1" />
              </g>
            ))}

            {/* 10. OS 11 PONTOS DE PARADA DAS FASES (BOTÕES CHUNKY 3D DA REFERÊNCIA) */}
            {CAMPAIGN_STAGES.map((stg) => {
              const isSelected = selectedStage?.id === stg.id;
              const isCurrent = currentStage === stg.id;
              const isUnlocked = stg.id <= currentStage;

              return (
                <g
                  key={stg.id}
                  transform={`translate(${stg.x}, ${stg.y})`}
                  className="cursor-pointer transition-transform duration-200"
                  onClick={() => setSelectedStage(stg)}
                >
                  {/* Sombra da Pedra Pedestal */}
                  <ellipse cx="0" cy="14" rx="26" ry="9" fill="rgba(0,0,0,0.65)" />

                  {/* Base de Pedra sob o Número */}
                  <ellipse cx="0" cy="8" rx="23" ry="11" fill="#4a2e18" stroke="#1c0d06" strokeWidth="2.5" />

                  {/* Efeito de Aura Pulsante se for a fase atual */}
                  {isCurrent && (
                    <circle
                      cx="0"
                      cy="-6"
                      r="32"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="3.5"
                      strokeDasharray="6,4"
                      className="animate-spin"
                      style={{ transformOrigin: '0px -6px' }}
                    />
                  )}

                  {/* Círculo de Destaque se estiver selecionado */}
                  {isSelected && (
                    <circle
                      cx="0"
                      cy="-6"
                      r="28"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3.5"
                    />
                  )}

                  {/* Número Estilizado em 3D Amarelo Dourado com Borda Grossa */}
                  {isUnlocked ? (
                    <g>
                      {/* Sombra 3D Inferior do Número */}
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fontFamily="var(--font-arcade, monospace)"
                        fontWeight="900"
                        fontSize="32"
                        fill="#78350f"
                        stroke="#1c0d06"
                        strokeWidth="7"
                        strokeLinejoin="round"
                      >
                        {stg.id}
                      </text>
                      {/* Face Amarela Vibrante */}
                      <text
                        x="0"
                        y="1"
                        textAnchor="middle"
                        fontFamily="var(--font-arcade, monospace)"
                        fontWeight="900"
                        fontSize="32"
                        fill="#fde047"
                        stroke="#78350f"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      >
                        {stg.id}
                      </text>
                    </g>
                  ) : (
                    /* Ícone de Cadeado para Fases Bloqueadas */
                    <g transform="translate(-12, -22)">
                      <rect x="2" y="10" width="20" height="16" rx="3" fill="#64748b" stroke="#1e293b" strokeWidth="2" />
                      <path d="M 6,10 L 6,6 Q 6,0 12,0 Q 18,0 18,6 L 18,10" fill="none" stroke="#64748b" strokeWidth="2.5" />
                    </g>
                  )}

                  {/* Estrelas Douradas sob o Número (★★★) */}
                  <g transform="translate(0, 16)">
                    {stg.stars > 0 ? (
                      <g>
                        {/* 1 Estrela */}
                        {stg.stars === 1 && (
                          <polygon points="0,-4 1.8,0.5 6.5,0.7 2.8,3.6 4.1,8.2 0,5.4 -4.1,8.2 -2.8,3.6 -6.5,0.7 -1.8,0.5" fill="#facc15" stroke="#78350f" strokeWidth="1" />
                        )}
                        {/* 2 Estrelas */}
                        {stg.stars === 2 && (
                          <g>
                            <g transform="translate(-7, 0) scale(0.85)">
                              <polygon points="0,-4 1.8,0.5 6.5,0.7 2.8,3.6 4.1,8.2 0,5.4 -4.1,8.2 -2.8,3.6 -6.5,0.7 -1.8,0.5" fill="#facc15" stroke="#78350f" strokeWidth="1" />
                            </g>
                            <g transform="translate(7, 0) scale(0.85)">
                              <polygon points="0,-4 1.8,0.5 6.5,0.7 2.8,3.6 4.1,8.2 0,5.4 -4.1,8.2 -2.8,3.6 -6.5,0.7 -1.8,0.5" fill="#facc15" stroke="#78350f" strokeWidth="1" />
                            </g>
                          </g>
                        )}
                        {/* 3 Estrelas */}
                        {stg.stars === 3 && (
                          <g>
                            <g transform="translate(-11, 2) scale(0.75)">
                              <polygon points="0,-4 1.8,0.5 6.5,0.7 2.8,3.6 4.1,8.2 0,5.4 -4.1,8.2 -2.8,3.6 -6.5,0.7 -1.8,0.5" fill="#facc15" stroke="#78350f" strokeWidth="1" />
                            </g>
                            <g transform="translate(0, -1) scale(0.9)">
                              <polygon points="0,-4 1.8,0.5 6.5,0.7 2.8,3.6 4.1,8.2 0,5.4 -4.1,8.2 -2.8,3.6 -6.5,0.7 -1.8,0.5" fill="#fde047" stroke="#78350f" strokeWidth="1" />
                            </g>
                            <g transform="translate(11, 2) scale(0.75)">
                              <polygon points="0,-4 1.8,0.5 6.5,0.7 2.8,3.6 4.1,8.2 0,5.4 -4.1,8.2 -2.8,3.6 -6.5,0.7 -1.8,0.5" fill="#facc15" stroke="#78350f" strokeWidth="1" />
                            </g>
                          </g>
                        )}
                      </g>
                    ) : (
                      /* Sem estrelas completadas */
                      <circle cx="0" cy="2" r="2.5" fill="#64748b" opacity="0.6" />
                    )}
                  </g>
                </g>
              );
            })}

            {/* 11. CRACHÁ / PINO DO JOGADOR ("JOHN DOE" / HEROI ATIVO NA FASE ATUAL) */}
            {(() => {
              const currentStgObj = CAMPAIGN_STAGES.find(s => s.id === currentStage) || CAMPAIGN_STAGES[9];
              return (
                <g
                  transform={`translate(${currentStgObj.x - 44}, ${currentStgObj.y - 120})`}
                  filter="url(#shadowDrop)"
                  className="animate-bounce"
                  style={{ animationDuration: '2.5s' }}
                >
                  {/* Nome do Jogador */}
                  <text
                    x="44"
                    y="14"
                    textAnchor="middle"
                    fontFamily="var(--font-arcade, monospace)"
                    fontSize="13"
                    fontWeight="bold"
                    fill="#fef08a"
                    stroke="#451a03"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  >
                    {activeHero?.name || 'Minerador #1'}
                  </text>

                  {/* Moldura de Carvalho Rústica */}
                  <rect
                    x="8"
                    y="22"
                    width="72"
                    height="72"
                    rx="8"
                    fill="#78350f"
                    stroke="#1c0d06"
                    strokeWidth="3.5"
                  />
                  <rect
                    x="14"
                    y="28"
                    width="60"
                    height="60"
                    rx="4"
                    fill="#451a03"
                  />

                  {/* Ícone de Caveira / Avatar do Herói */}
                  <text
                    x="44"
                    y="72"
                    textAnchor="middle"
                    fontSize="36"
                  >
                    {activeHero?.avatar || '💀'}
                  </text>

                  {/* Setinha apontando para a fase */}
                  <polygon
                    points="36,94 52,94 44,106"
                    fill="#78350f"
                    stroke="#1c0d06"
                    strokeWidth="2"
                  />
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Painel Inferior: Detalhes da Fase Selecionada + Botão de Entrar */}
        {selectedStage && (
          <div className="bg-slate-900 border-t border-amber-600/30 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-3xl font-arcade font-bold text-amber-300 shadow-md">
                {selectedStage.id}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-arcade text-sm sm:text-base text-white">
                    {selectedStage.name}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-tech ${
                    selectedStage.difficulty.includes('Fácil')
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : selectedStage.difficulty.includes('Normal')
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      : selectedStage.difficulty.includes('Lendário')
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}>
                    {selectedStage.difficulty}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-tech mt-0.5 max-w-xl line-clamp-1 sm:line-clamp-none">
                  {selectedStage.description}
                </p>
                <div className="flex items-center gap-4 text-xs font-tech text-slate-400 mt-1">
                  <span>Recompensa BCOIN: <b className="text-amber-400">~{selectedStage.bcoinReward.toFixed(2)} B</b></span>
                  <span>Drops: <b className="text-sky-300">{selectedStage.drops}</b></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {selectedStage.id <= currentStage ? (
                <button
                  onClick={() => handleLaunchStage(selectedStage)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-arcade text-xs font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] transition cursor-pointer active:scale-95"
                >
                  <Play size={16} fill="currentColor" />
                  <span>ENTRAR NA MINA #{selectedStage.id}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 text-slate-400 font-arcade text-xs font-bold border border-slate-700">
                  <Lock size={15} />
                  <span>DESBLOQUEIE A FASE #{selectedStage.id - 1}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
