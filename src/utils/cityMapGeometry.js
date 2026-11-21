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
 * Regra Oficial do Usuário: 
 * "e tem herois e zumbis subindo na base onde nao deveriam subir"
 * Zumbis e heróis NUNCA podem subir nem caminhar dentro do santuário da base (Colunas 4 a 10, Linhas 3 a 8).
 */
export function isBaseCompound(c, r) {
  // Complexo militar fortificado & Hospital: todo o quadrado central (muros, leitos, caixas e armaria)
  // Colunas 4 a 10, Linhas 3 a 8 são 100% impenetráveis por heróis e zumbis
  if (c >= 4 && c <= 10 && r >= 3 && r <= 8) return true;
  return false;
}

/**
 * Retorna se a célula (c, r) contém um obstáculo sólido:
 * Mapeamento estrito baseado nas demarcações oficiais do usuário:
 * "onde foi selecionado em hiotese alguma zumbis e herois podem pizar em cima ou passar ali"
 * 
 * - Ruína Noroeste (prédio concreto e escombros)
 * - Outdoor / Billboard "CryptoZombies" e sustentação
 * - Torre de vigia norte
 * - Barricadas de sacos de areia norte
 * - Caixa d'água / gerador oeste
 * - Carros abandonados (oeste e leste)
 * - Cercas de arame, barricadas e escombros oeste
 * - Base Militar Fortificada & Complexo Hospitalar (muros, hospital, pátio)
 * - Barricadas de sacos de areia sul
 * - Caixote de madeira sul
 * - Ruína Sudeste (prédio de concreto, muros e escombros)
 * - Cercas de arame e bloqueios de concreto leste
 * - Silo / reservatório metálico de combustível leste
 * - Guarita / torre de vigia e cercas leste
 * 
 * Onde for true: nem heróis nem zumbis/boss podem pisar, atravessar ou nascer.
 * Onde for false: ruas pavimentadas (livres de carros), caminhos de terra batida e gramados livres.
 */
export function isCityObstacle(c, r) {
  // Limites exteriores do mapa (fora do grid de combate)
  if (c < 0 || c >= GRID_COLS || r < 0 || r >= GRID_ROWS) return true;

  // 1. RUÍNA NOROESTE (Prédio de concreto destruído no topo esquerdo)
  // Circulado pelo usuário: prédio principal e escombros adjacentes
  if (c >= 2 && c <= 4 && (r === 1 || r === 2)) return true;
  if (c === 2 && r === 3) return true; // Escombros no gramado sul da ruína

  // 2. OUTDOOR / BILLBOARD "CRYPTOZOMBIES" (Norte no gramado)
  // Circulado pelo usuário: painel e sapatas metálicas de sustentação
  if ((c === 7 || c === 8) && (r === 0 || r === 1)) return true;

  // 3. TORRE DE VIGIA NORTE (Madeira no topo direito)
  // Circulado pelo usuário: torre elevada em (11, 0)
  if (c === 11 && r === 0) return true;

  // 4. BARRICADAS DE SACOS DE AREIA NORTE (Acima da base militar)
  // Deixa passagem livre nas colunas 6, 7 e 8 para evitar armadilha de 1 bloco sob o outdoor
  if ((c === 5 || c === 9) && r === 2) return true;

  // 5. VIA OESTE & GRAMADO LIVRE (Conecta o noroeste à avenida principal)
  // Deixado 100% livre em (1, 4) e (2, 4) para permitir fluxo contínuo de heróis e zumbis

  // 6. CARROS ABANDONADOS NO ASFALTO (Oeste e Leste)
  // Circulado pelo usuário: veículos parados nas avenidas asfaltadas
  if (c === 1 && r === 5) return true; // Carro na pista oeste
  if ((c === 13 || c === 14) && r === 5) return true; // Carro na pista leste

  // 7. CERCAS DE ARAME, BARRICADAS E ESCOMBROS OESTE
  // Circulado pelo usuário: cercas e barricadas que contornam a via oeste
  if (c === 3 && r === 3) return true; // Cerca e caixotes noroeste
  if (c === 3 && r === 4) return true; // Barricada e cerca da guarita oeste
  if (c === 3 && r === 6) return true; // Cerca longa de arame sudoeste (c=2 é via aberta)
  if (c === 3 && r === 7) return true; // Canto inferior da cerca sudoeste

  // 7.1. TORRE DE SIRENE E ALARME DE VIGIA (Local exato demarcado em vermelho)
  // Regra Oficial do Usuário: "os zumbies e herois nao podem passar por cima dela"
  if (c === 2 && r === 3) return true;

  // 8. BASE MILITAR FORTIFICADA & COMPLEXO HOSPITALAR (Santuário Central)
  // Circulado pelo usuário: todo o complexo murado, pátio, ambulância, hangar e hospital
  if (isBaseCompound(c, r)) return true;

  // 9. BARRICADAS DE SACOS DE AREIA SUL (Abaixo da base militar)
  // Circulado pelo usuário: sacos de areia sudoeste e sudeste do portão sul
  if ((c === 5 || c === 6) && r === 8) return true; // Barricada sul-oeste
  if ((c === 8 || c === 9) && r === 8) return true; // Barricada sul-leste

  // 10. CAIXOTE DE MADEIRA SUL (Gramado/estrada sul)
  // Circulado pelo usuário: pequeno caixote em (8, 9)
  if (c === 8 && r === 9) return true;

  // 11. RUÍNA SUDESTE (Prédio de concreto destruído no canto inferior direito)
  // Circulado pelo usuário: todo o perímetro da ruína, muros e escombros
  if (c >= 10 && c <= 13 && (r === 8 || r === 9)) return true;
  if ((c === 11 || c === 12) && r === 7) return true; // Escombros e cerca norte da ruína

  // 12. CERCAS DE ARAME E BLOQUEIOS DE CONCRETO LESTE
  // Circulado pelo usuário: cerca e barricada na via leste
  if ((c === 11 || c === 12) && r === 6) return true; // Cerca leste
  if (c === 13 && r === 6) return true; // Bloqueio de concreto no asfalto leste

  // 13. SILO / RESERVATÓRIO METÁLICO DE COMBUSTÍVEL LESTE
  // Circulado pelo usuário: tanque cilíndrico na colina leste
  if ((c === 13 || c === 14) && (r === 3 || r === 4)) return true;

  // 14. GUARITA / TORRE DE VIGIA E CERCA LESTE
  // Circulado pelo usuário: guarita elevada e cercas em (11..12, 3..4)
  if ((c === 11 || c === 12) && (r === 3 || r === 4)) return true;

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
  { id: 'se_grass_ruin', name: 'Sudeste Gramado Ruína', center: { x: 7, y: 9 } },
  // 10. Sul-Leste - Encruzilhada da Ruína Sudeste
  { id: 'se_crossroad', name: 'Sudeste Encruzilhada', center: { x: 9, y: 9 } },
  // 11. Sudeste - Gramado Extremo Leste
  { id: 'se_grass_corner', name: 'Sudeste Canto Leste', center: { x: 14, y: 8 } },
  // 12. Leste - Avenida de Asfalto Leste
  { id: 'e_avenue', name: 'Leste Avenida', center: { x: 12, y: 5 } },
  // 13. Nordeste - Trilha de Terra da Torre
  { id: 'ne_trail_tower', name: 'Nordeste Trilha Torre', center: { x: 12, y: 2 } },
  // 14. Nordeste - Gramado Superior da Torre
  { id: 'ne_grass_high', name: 'Nordeste Gramado Alto', center: { x: 13, y: 1 } }
];

/**
 * PONTOS DE SPAWN NOS CANTOS E BORDAS DO MAPA ("os zumbis nascem nos cantos do mapa")
 * Zumbis surgem nas bordas e cantos extremos e caminham para as áreas livres definidas.
 */
export const CORNER_SPAWN_POINTS = [
  { x: 1, y: 1, c: 1, r: 1 }, { x: 5, y: 1, c: 5, r: 1 }, { x: 6, y: 1, c: 6, r: 1 },
  { x: 1, y: 2, c: 1, r: 2 }, { x: 9, y: 1, c: 9, r: 1 }, { x: 6, y: 2, c: 6, r: 2 },
  { x: 1, y: 7, c: 1, r: 7 }, { x: 1, y: 9, c: 1, r: 9 }, { x: 2, y: 9, c: 2, r: 9 },
  { x: 3, y: 9, c: 3, r: 9 }, { x: 6, y: 9, c: 6, r: 9 }, { x: 7, y: 9, c: 7, r: 9 },
  { x: 9, y: 9, c: 9, r: 9 }, { x: 2, y: 5, c: 2, r: 5 }, { x: 2, y: 6, c: 2, r: 6 },
  { x: 12, y: 1, c: 12, r: 1 }, { x: 13, y: 1, c: 13, r: 1 }, { x: 14, y: 7, c: 14, r: 7 }
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
  { x: 1, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 9, y: 1 }, { x: 6, y: 2 },
  { x: 1, y: 2 }, { x: 2, y: 5 }, { x: 2, y: 6 }, { x: 1, y: 7 }, { x: 1, y: 8 },
  { x: 1, y: 9 }, { x: 2, y: 9 }, { x: 3, y: 9 }, { x: 5, y: 9 }, { x: 6, y: 9 },
  { x: 7, y: 9 }, { x: 9, y: 9 }, { x: 12, y: 1 }, { x: 13, y: 1 }, { x: 12, y: 2 },
  { x: 12, y: 5 }, { x: 14, y: 7 }, { x: 14, y: 8 }
];

export function getSafeHeroSpawn(index = 0) {
  return SAFE_HERO_SPAWN_POINTS[index % SAFE_HERO_SPAWN_POINTS.length];
}
