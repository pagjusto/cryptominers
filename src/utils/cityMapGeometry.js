/**
 * CRYPTOZOMBIES — GEOMETRIA & COLISÕES DO MAPA DA CIDADE DE SOBREVIVÊNCIA
 * 
 * Regra Oficial do Usuário:
 * "herois e zombies na podem passar por cima ou pisar em cima de muros e cercas tambem e carros"
 * "os zumbis e heróis não podem subir para os prédios, somente ruas e grama."
 * 
 * Grid: 15 Colunas x 11 Linhas (720px largura x 528px altura, blocos de 48x48)
 */

export const GRID_COLS = 15;
export const GRID_ROWS = 11;
export const TILE_SIZE = 76;

/**
 * Retorna se a célula (c, r) está no perímetro interno, muros, pátio ou leitos da Base Militar e Hospital.
 * REGRA OFICIAL DO USUÁRIO: 
 * "na marca circulada nao podera herois e zumbis andar sobre e essa barreira"
 * Zumbis e heróis NUNCA podem subir nem caminhar sobre os muros ou dentro do santuário da base.
 */
export function isBaseCompound(c, r) {
  if (typeof c !== 'number' || typeof r !== 'number' || isNaN(c) || isNaN(r)) return false;
  const col = Math.round(c);
  const row = Math.round(r);

  // Complexo militar fortificado & Hospital: todo o perímetro fortificado demarcado pelo usuário (muros, torre oeste, leitos, caixas e armaria)
  // Topo / Ápice Norte (Muro de concreto sob o outdoor):
  if (row === 2 && (col === 7 || col === 8)) return true;
  // Linha 3 (Salas norte e leitos superiores):
  if (row === 3 && (col >= 5 && col <= 10)) return true;
  // Linha 4 (Torre de vigia oeste até muro leste):
  if (row === 4 && (col >= 3 && col <= 11)) return true;
  // Linha 5 (Torre de vigia oeste até quina leste):
  if (row === 5 && (col >= 3 && col <= 11)) return true;
  // Linha 6 (Portão de madeira sudoeste até quina sudeste):
  if (row === 6 && (col >= 3 && col <= 11)) return true;
  // Linha 7 (Muro sul e portão metálico sudeste):
  if (row === 7 && (col >= 4 && col <= 11)) return true;
  // Fundo / Ápice Sul (Quina inferior do muro fortificado):
  if (row === 8 && (col >= 6 && col <= 9)) return true;
  return false;
}

/**
 * Retorna se a célula (c, r) contém um obstáculo sólido:
 * Mapeamento estrito baseado nas demarcações oficiais do usuário:
 * "agora sem as cercas e sacos de areia os zumbis e herois podem andar livremente sem ficar travados exeto nas contruçoes carros torre e outdoor"
 * "na marca circulada nao podera herois e zumbis andar sobre e essa barreira"
 * 
 * - Ruína Noroeste (prédio de concreto + escombros laterais e caixote)
 * - Outdoor / Billboard "CryptoZombies" e sustentação
 * - Torre de sirene oeste e guarita de madeira leste
 * - Carros abandonados (oeste e leste)
 * - Base Militar Fortificada & Complexo Hospitalar (todo o perímetro marcado em vermelho)
 * - Ruína Sudeste (prédio de concreto + escombros frontais caídos)
 * - Silos / reservatórios metálicos nas bordas
 * 
 * Onde for true: nem heróis nem zumbis/boss podem pisar, atravessar ou nascer.
 * Onde for false: ruas pavimentadas (livres de carros), caminhos de terra batida e gramados livres.
 */
export function isCityObstacle(c, r) {
  if (typeof c !== 'number' || typeof r !== 'number' || isNaN(c) || isNaN(r)) return true;
  const col = Math.round(c);
  const row = Math.round(r);

  // Limites exteriores do mapa (fora do grid de combate)
  if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return true;

  // 1. CONSTRUÇÕES - RUÍNA NOROESTE (Prédio de concreto destruído no topo esquerdo + todos os escombros, caixote e lajes)
  // Cobre os dois andares, teto da ruína, escombros caídos à esquerda e à direita e lajes da entrada:
  if (row === 0 && (col >= 1 && col <= 5)) return true;
  if (row === 1 && (col >= 1 && col <= 5)) return true; // Cobre pedras col=1, corpo do prédio e escombros laterais col=4..5
  if (row === 2 && (col >= 1 && col <= 4)) return true; // Cobre caixote de madeira col=1, escombros e rampa col=2..4

  // 2. OUTDOOR / BILLBOARD "CRYPTOZOMBIES" (Norte no gramado)
  // Cobre a placa inteira e suportes: col=7..9 em row=0..1
  if ((row === 0 || row === 1) && (col >= 7 && col <= 9)) return true;

  // 3. TORRE DE SIRENE E ALARME DE VIGIA OESTE
  // Pés e corpo da torre concentrados em col=2: row=3
  if (col === 2 && row === 3) return true;

  // 4. RESERVATÓRIO / HIDRANTE METÁLICO OESTE
  // Silo cilíndrico com base de pedra: col=0 em row=3..4
  if (col === 0 && (row === 3 || row === 4)) return true;

  // 5. CARROS ABANDONADOS NO ASFALTO (Oeste)
  // Carro enferrujado na pista oeste: col=0..1 em row=5
  if ((col === 0 || col === 1) && row === 5) return true;

  // 6. CONSTRUÇÃO CENTRAL - BASE MILITAR & HOSPITAL DE SOBREVIVÊNCIA
  // Perímetro fortificado diamantado demarcado pelo usuário (muros, torre oeste, leitos e armaria)
  if (isBaseCompound(col, row)) return true;

  // 7. GUARITA ELEVADA DE MADEIRA LESTE (Torre de vigia leste)
  // Cobre a guarita e pilares de madeira: col=11 em row=2..3 (mantém a estrada col=12 100% livre)
  if ((row === 2 || row === 3) && col === 11) return true;

  // 8. CONSTRUÇÕES - SILO / RESERVATÓRIO METÁLICO DE COMBUSTÍVEL LESTE E GERADORES
  // Tanque cilíndrico e caixas de baterias: col=13..14 em row=3..4
  if ((col === 13 || col === 14) && (row === 3 || row === 4)) return true;

  // 9. CARRO ABANDONADO LESTE
  // Carro enferrujado na pista leste: col=13..14 em row=5
  if ((col === 13 || col === 14) && row === 5) return true;

  // 10. CONSTRUÇÕES - RUÍNA SUDESTE (Prédio de concreto destruído no canto inferior direito + escombros caídos)
  // Prédio em col=13..14 row=8..10, escombros em col=12 row=8..10 e pedras caídas col=11 row=9..10
  if (row === 8 && (col >= 12 && col <= 14)) return true;
  if ((row === 9 || row === 10) && (col >= 11 && col <= 14)) return true;

  // Todas as demais estradas, caminhos de terra batida e gramados estão 100% livres
  return false;
}

/**
 * Alias para manter 100% de retrocompatibilidade com GameBoard, enemySystem e individualMapEngine
 */
export const isCityBuilding = isCityObstacle;
export const isCanyonTrackOrTunnel = isCityObstacle;

/**
 * 14 ZONAS TÁTICAS DEFINIDAS OFICIALMENTE PELO USUÁRIO (Círculos vermelhos no mapa)
 * Distribuídas proporcionalmente por todo o perímetro ao redor da base militar:
 * Noroeste, Oeste, Sudoeste, Sul, Sudeste, Leste e Nordeste (todas em células 100% livres de obstáculos).
 */
export const TACTICAL_ZONES = [
  // 1. Noroeste - Gramado Aberto Oeste (Ao lado da ruína e torre)
  { id: 'nw_grass_open', name: 'Noroeste Gramado Aberto', center: { x: 1, y: 3 } },
  // 2. Noroeste - Gramado Atrás da Ruína (Canto superior esquerdo)
  { id: 'nw_grass_high', name: 'Noroeste Gramado Alto', center: { x: 5, y: 1 } },
  // 3. Norte - Estrada Aberta Norte
  { id: 'n_road_open', name: 'Norte Estrada', center: { x: 6, y: 2 } },
  // 4. Oeste - Estrada de Asfalto Livre
  { id: 'w_road_side', name: 'Oeste Estrada Livre', center: { x: 2, y: 5 } },
  // 5. Sudoeste - Gramado Sul da Avenida
  { id: 'sw_grass_open', name: 'Sudoeste Gramado', center: { x: 1, y: 7 } },
  // 6. Sudoeste - Trilha do Canto Inferior Esquerdo
  { id: 'sw_trail_corner', name: 'Sudoeste Canto', center: { x: 1, y: 9 } },
  // 7. Sul-Oeste - Gramado Frontal da Base
  { id: 's_grass_front', name: 'Sul Gramado Frontal', center: { x: 3, y: 9 } },
  // 8. Sul - Gramado Central do Portão
  { id: 's_grass_center', name: 'Sul Gramado Central', center: { x: 6, y: 9 } },
  // 9. Sul-Leste - Gramado Dianteiro da Ruína Sudeste
  { id: 'se_grass_ruin', name: 'Sudeste Gramado Ruína', center: { x: 9, y: 9 } },
  // 10. Sul-Leste - Encruzilhada da Ruína Sudeste
  { id: 'se_crossroad', name: 'Sudeste Encruzilhada', center: { x: 10, y: 9 } },
  // 11. Sudeste - Gramado Extremo Leste
  { id: 'se_grass_corner', name: 'Sudeste Canto Leste', center: { x: 13, y: 7 } },
  // 12. Leste - Avenida de Asfalto Leste
  { id: 'e_avenue', name: 'Leste Avenida', center: { x: 12, y: 5 } },
  // 13. Nordeste - Trilha de Terra da Torre
  { id: 'ne_trail_tower', name: 'Nordeste Trilha Torre', center: { x: 10, y: 2 } },
  // 14. Nordeste - Gramado Superior da Torre
  { id: 'ne_grass_high', name: 'Nordeste Gramado Alto', center: { x: 13, y: 1 } }
];

/**
 * PONTOS DE SPAWN NOS CANTOS E BORDAS DO MAPA ("os zumbis nascem nos cantos do mapa")
 * Zumbis surgem nas bordas e cantos extremos e caminham para as áreas livres definidas.
 */
export const CORNER_SPAWN_POINTS = [
  { x: 1, y: 3, c: 1, r: 3 }, { x: 6, y: 2, c: 6, r: 2 }, { x: 10, y: 1, c: 10, r: 1 },
  { x: 3, y: 3, c: 3, r: 3 }, { x: 12, y: 1, c: 12, r: 1 }, { x: 13, y: 1, c: 13, r: 1 },
  { x: 1, y: 7, c: 1, r: 7 }, { x: 1, y: 9, c: 1, r: 9 }, { x: 2, y: 9, c: 2, r: 9 },
  { x: 3, y: 9, c: 3, r: 9 }, { x: 6, y: 9, c: 6, r: 9 }, { x: 7, y: 9, c: 7, r: 9 },
  { x: 9, y: 9, c: 9, r: 9 }, { x: 2, y: 5, c: 2, r: 5 }, { x: 2, y: 6, c: 2, r: 6 },
  { x: 12, y: 5, c: 12, r: 5 }, { x: 12, y: 6, c: 12, r: 6 }, { x: 13, y: 7, c: 13, r: 7 }
];

export function getCornerSpawnPoint(index = 0) {
  return CORNER_SPAWN_POINTS[index % CORNER_SPAWN_POINTS.length];
}

/**
 * Lista oficial de spawn inicial dos heróis distribuídos por todo o mapa nos locais definidos pelo usuário.
 * Cada um dos 15 heróis ocupa uma zona tática própria ao redor da base.
 */
// ZONAS DE RESPAWN DEFINIDAS PELO USUÁRIO NA MARCAÇÃO VERDE DO MAPA.
// Norte: gramados/caminhos superiores à esquerda e centro-norte.
// Sul: faixa de gramado inferior, contornando ruínas e complexo central.
// Personagens podem caminhar pelo mapa todo; estas zonas são somente os pontos de nascimento.
export const SPAWN_ZONE_VERSION = 3;
export function isSpawnZoneCell(c, r) {
  const inNorthSpawn = r >= 1 && r <= 2 && c >= 1 && c <= 13;
  const inSouthSpawn = r >= 9 && r <= 10 && c >= 1 && c <= 13;
  const inWestSpawn = c >= 1 && c <= 3 && r >= 1 && r <= 9;
  const inEastSpawn = c >= 11 && c <= 14 && r >= 1 && r <= 8;
  return (inNorthSpawn || inSouthSpawn || inWestSpawn || inEastSpawn) && !isCityBuilding(c, r) && !isBaseCompound(c, r);
}

export function getSpawnZoneCells(cols = GRID_COLS, rows = GRID_ROWS) {
  const cells = [];
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      if (isSpawnZoneCell(c, r)) cells.push({ c, r, x: c, y: r });
    }
  }
  return cells;
}

// Heróis nascem em estradas e gramados 100% livres e desimpedidos (fora da base central)
export const SAFE_HERO_SPAWN_POINTS = [
  { x: 1, y: 3 }, { x: 6, y: 2 }, { x: 10, y: 1 }, { x: 12, y: 1 }, { x: 13, y: 1 },
  { x: 3, y: 3 }, { x: 10, y: 2 }, { x: 12, y: 2 }, { x: 4, y: 3 }, { x: 1, y: 4 },
  { x: 2, y: 5 }, { x: 12, y: 5 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 12, y: 6 },
  { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 9 },
  { x: 2, y: 9 }, { x: 3, y: 9 }, { x: 5, y: 9 }, { x: 6, y: 9 }, { x: 7, y: 9 },
  { x: 9, y: 9 }, { x: 10, y: 9 }, { x: 13, y: 7 }
];

export function getSafeHeroSpawn(index = 0) {
  return SAFE_HERO_SPAWN_POINTS[index % SAFE_HERO_SPAWN_POINTS.length];
}

/**
 * Posições oficiais dos Especialistas do Abrigo (Dra. Íris e John Armeiro)
 * por Nível de Evolução da Base (1, 2 e 3):
 * 
 * - Nível 1 (Básico, 5 leitos): Mantém as posições originais consolidadas.
 * - Nível 2 (Reforçado, 10 leitos): Dra. Íris no ponto azul (pátio inferior), Armeiro no ponto vermelho (sala de armas).
 * - Nível 3 (Avançado, 15 leitos): Dra. Íris no ponto azul (entre os leitos inferiores), Armeiro no ponto vermelho (sala de armas).
 */
export const SHELTER_SPECIALISTS_CONFIG = {
  1: {
    iris: { x: 490, y: 386 },
    armorer: { x: 666, y: 358 }
  },
  2: {
    iris: { x: 538, y: 471 },
    armorer: { x: 678, y: 378 }
  },
  3: {
    iris: { x: 462, y: 425 },
    armorer: { x: 681, y: 372 }
  }
};

export function getShelterSpecialistPos(level = 1, role = 'iris') {
  const lvl = Math.max(1, Math.min(3, Number(level) || 1));
  const cfg = SHELTER_SPECIALISTS_CONFIG[lvl] || SHELTER_SPECIALISTS_CONFIG[1];
  return cfg[role] || (role === 'armorer' ? cfg.armorer : cfg.iris);
}
