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
  // Complexo militar fortificado & Hospital: todo o perímetro fortificado demarcado pelo usuário (muros, torre oeste, leitos, caixas e armaria)
  // Topo / Ápice Norte (Muro de concreto sob o outdoor):
  if (r === 2 && (c === 7 || c === 8)) return true;
  // Linha 3 (Salas norte e leitos superiores):
  if (r === 3 && (c >= 5 && c <= 10)) return true;
  // Linha 4 (Torre de vigia oeste até muro leste):
  if (r === 4 && (c >= 3 && c <= 11)) return true;
  // Linha 5 (Torre de vigia oeste até quina leste):
  if (r === 5 && (c >= 3 && c <= 11)) return true;
  // Linha 6 (Portão de madeira sudoeste até quina sudeste):
  if (r === 6 && (c >= 3 && c <= 11)) return true;
  // Linha 7 (Muro sul e portão metálico sudeste):
  if (r === 7 && (c >= 4 && c <= 11)) return true;
  // Fundo / Ápice Sul (Quina inferior do muro fortificado):
  if (r === 8 && (c >= 6 && c <= 8)) return true;
  return false;
}

/**
 * Retorna se a célula (c, r) contém um obstáculo sólido:
 * Mapeamento estrito baseado nas demarcações oficiais do usuário:
 * "agora sem as cercas e sacos de areia os zumbis e herois podem andar livremente sem ficar travados exeto nas contruçoes carros torre e outdoor"
 * "na marca circulada nao podera herois e zumbis andar sobre e essa barreira"
 * 
 * - Ruína Noroeste (prédio de concreto)
 * - Outdoor / Billboard "CryptoZombies" e sustentação
 * - Torre de sirene oeste e guarita de madeira leste
 * - Carros abandonados (oeste e leste)
 * - Base Militar Fortificada & Complexo Hospitalar (todo o perímetro marcado em vermelho)
 * - Ruína Sudeste (prédio de concreto no canto inferior direito)
 * - Silos / reservatórios metálicos nas bordas
 * 
 * Onde for true: nem heróis nem zumbis/boss podem pisar, atravessar ou nascer.
 * Onde for false: ruas pavimentadas (livres de carros), caminhos de terra batida e gramados livres.
 */
export function isCityObstacle(c, r) {
  // Limites exteriores do mapa (fora do grid de combate)
  if (c < 0 || c >= GRID_COLS || r < 0 || r >= GRID_ROWS) return true;

  // 1. CONSTRUÇÕES - RUÍNA NOROESTE (Prédio de concreto destruído no topo esquerdo)
  // Cobre os dois andares e o teto da ruína: c=2..4 em r=0..1
  if ((r === 0 || r === 1) && (c >= 2 && c <= 4)) return true;

  // 2. OUTDOOR / BILLBOARD "CRYPTOZOMBIES" (Norte no gramado)
  // Cobre a placa inteira e suportes: c=7..9 em r=0..1
  if ((r === 0 || r === 1) && (c >= 7 && c <= 9)) return true;

  // 3. TORRE DE SIRENE E ALARME DE VIGIA OESTE
  // Pés e corpo da torre concentrados em c=2: r=3
  if (c === 2 && r === 3) return true;

  // 4. RESERVATÓRIO / HIDRANTE METÁLICO OESTE
  // Silo cilíndrico com base de pedra: c=0 em r=3..4
  if (c === 0 && (r === 3 || r === 4)) return true;

  // 5. CARROS ABANDONADOS NO ASFALTO (Oeste)
  // Carro enferrujado na pista oeste: c=0..1 em r=5
  if ((c === 0 || c === 1) && r === 5) return true;

  // 6. CONSTRUÇÃO CENTRAL - BASE MILITAR & HOSPITAL DE SOBREVIVÊNCIA
  // Perímetro fortificado diamantado demarcado pelo usuário (muros, torre oeste, leitos e armaria)
  if (isBaseCompound(c, r)) return true;

  // 7. GUARITA ELEVADA DE MADEIRA LESTE (Torre de vigia leste)
  // Cobre a guarita e pilares de madeira: c=11 em r=2..3 (mantém a estrada c=12 100% livre)
  if ((r === 2 || r === 3) && c === 11) return true;

  // 8. CONSTRUÇÕES - SILO / RESERVATÓRIO METÁLICO DE COMBUSTÍVEL LESTE E GERADORES
  // Tanque cilíndrico e caixas de baterias: c=13..14 em r=3..4
  if ((c === 13 || c === 14) && (r === 3 || r === 4)) return true;

  // 9. CARRO ABANDONADO LESTE
  // Carro enferrujado na pista leste: c=13..14 em r=5
  if ((c === 13 || c === 14) && r === 5) return true;

  // 10. CONSTRUÇÕES - RUÍNA SUDESTE (Prédio de concreto destruído no canto inferior direito)
  // Prédio em c=13..14 r=8..10 e escombros frontais em c=12 r=9..10 (mantém a estrada c=12 r=8 100% livre)
  if (r === 8 && (c >= 13 && c <= 14)) return true;
  if ((r === 9 || r === 10) && (c >= 12 && c <= 14)) return true;

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
  // 1. Noroeste - Gramado Aberto Oeste (Ao lado da ruína)
  { id: 'nw_grass_open', name: 'Noroeste Gramado Aberto', center: { x: 1, y: 2 } },
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
  { id: 'se_crossroad', name: 'Sudeste Encruzilhada', center: { x: 10, y: 8 } },
  // 11. Sudeste - Gramado Extremo Leste
  { id: 'se_grass_corner', name: 'Sudeste Canto Leste', center: { x: 14, y: 7 } },
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
  { x: 0, y: 1, c: 0, r: 1 }, { x: 5, y: 1, c: 5, r: 1 }, { x: 10, y: 1, c: 10, r: 1 },
  { x: 1, y: 2, c: 1, r: 2 }, { x: 6, y: 2, c: 6, r: 2 }, { x: 12, y: 1, c: 12, r: 1 },
  { x: 1, y: 7, c: 1, r: 7 }, { x: 1, y: 9, c: 1, r: 9 }, { x: 2, y: 9, c: 2, r: 9 },
  { x: 3, y: 9, c: 3, r: 9 }, { x: 6, y: 9, c: 6, r: 9 }, { x: 7, y: 9, c: 7, r: 9 },
  { x: 9, y: 9, c: 9, r: 9 }, { x: 2, y: 5, c: 2, r: 5 }, { x: 2, y: 6, c: 2, r: 6 },
  { x: 12, y: 5, c: 12, r: 5 }, { x: 13, y: 1, c: 13, r: 1 }, { x: 14, y: 7, c: 14, r: 7 }
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
  { x: 0, y: 1 }, { x: 5, y: 1 }, { x: 10, y: 1 }, { x: 12, y: 1 }, { x: 6, y: 2 },
  { x: 1, y: 2 }, { x: 2, y: 5 }, { x: 2, y: 6 }, { x: 1, y: 7 }, { x: 1, y: 8 },
  { x: 1, y: 9 }, { x: 2, y: 9 }, { x: 3, y: 9 }, { x: 5, y: 9 }, { x: 6, y: 9 },
  { x: 7, y: 9 }, { x: 9, y: 9 }, { x: 10, y: 8 }, { x: 13, y: 1 }, { x: 10, y: 2 },
  { x: 12, y: 5 }, { x: 14, y: 6 }, { x: 14, y: 7 }
];

export function getSafeHeroSpawn(index = 0) {
  return SAFE_HERO_SPAWN_POINTS[index % SAFE_HERO_SPAWN_POINTS.length];
}
