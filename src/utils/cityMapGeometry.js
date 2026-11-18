/**
 * CRIPTO MYNERS — GEOMETRIA & COLISÕES DO MAPA DA CIDADE DE SOBREVIVÊNCIA
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
 * Retorna se a célula (c, r) está no perímetro interno, pátio ou cercas da Base Militar e Hospital.
 * Regra Oficial do Usuário: "veja que zumbis estao invadindo a area da base"
 * Zumbis e Boss NUNCA podem nascer nem caminhar dentro do santuário da base.
 */
export function isBaseCompound(c, r) {
  // Complexo militar fortificado: Hangar, Hospital Cruz Vermelha, Pátio cercado e Doca da Ambulância
  if (c >= 4 && c <= 9 && (r >= 3 && r <= 7)) return true;
  if (c === 10 && (r >= 4 && r <= 7)) return true; // Cercas laterais a leste do hospital
  return false;
}

/**
 * Retorna se a célula (c, r) contém um obstáculo sólido:
 * - Prédios e Ruínas de concreto
 * - Base Militar Fortificada (Santuário dos Sobreviventes)
 * - Muros perimetrais e Portões
 * - Cercas de arame e Barricadas de sacos de areia
 * - Carros abandonados e Ambulância
 * - Torres de vigia e Silos
 * - Outdoor / Billboard "CryptoZombies"
 * 
 * Onde for true: nem heróis nem zumbis/boss podem pisar, atravessar ou nascer.
 * Onde for false: ruas pavimentadas (livres de carros), caminhos de terra batida e gramados livres.
 */
export function isCityObstacle(c, r) {
  // Limites do mapa
  if (c < 0 || c >= GRID_COLS || r < 0 || r >= GRID_ROWS) return true;

  // 1. CARROS ABANDONADOS E AMBULÂNCIA (Veículos nas ruas e pátio)
  // Carro no asfalto oeste: na faixa c=1, r=5 (a faixa c=2 fica livre para desvio dos pedestres)
  if (c === 1 && r === 5) return true;
  // Carro no asfalto leste: na faixa c=13, r=5 (a faixa c=12 fica livre para desvio dos pedestres)
  if (c === 13 && r === 5) return true;
  // Ambulância estacionada na doca: c=7, r=6
  if (c === 7 && r === 6) return true;

  // 2. PRÉDIOS E RUÍNAS DE CONCRETO
  // Ruína Noroeste (prédio concreto em c=2..3, r=1..2; avenida c=1 livre na lateral)
  if ((c === 2 || c === 3) && (r === 1 || r === 2)) return true;

  // Ruína Sudeste (prédio em c=10..11, r=7..8; avenida leste c=12..13 livre)
  if ((c === 10 || c === 11) && (r === 7 || r === 8)) return true;

  // 3. BASE MILITAR FORTIFICADA & SANTUÁRIO DOS SOBREVIVENTES
  // Hangar Militar de Suprimentos, Hospital Cruz Vermelha, Pátio cercado da Ambulância, Portão e Muros:
  // Zumbis e Boss são estritamente proibidos de invadir ou nascer nesta área.
  if (isBaseCompound(c, r)) return true;

  // Torres de Vigia e Silo Metálico de Abastecimento
  if ((c === 10 || c === 11) && (r === 0 || r === 1)) return true; // Torre norte
  if (c === 11 && (r === 3 || r === 4)) return true; // Torre leste
  if (c === 13 && (r === 3 || r === 4)) return true; // Silo metálico

  // 4. MUROS, CERCAS DE ARAME E BARRICADAS (Walls, Fences & Sandbags)
  // Barricada norte da base: c=6..8, r=2 (deixa c=5 e c=9 abertos como acessos norte)
  if (c >= 6 && c <= 8 && r === 2) return true;

  // Cercas de arame laterais (não bloqueiam as avenidas principais)
  if (c === 3 && r === 3) return true; // Cerca entre rua oeste e ruína
  if (c === 3 && r === 4) return true; // Barricada
  if (c === 3 && r === 7) return true; // Cerca sul
  if (c === 3 && r === 8) return true; // Cerca baixa

  if (c === 10 && r === 6) return true; // Cerca da ruína sudeste

  // 5. OUTDOOR / BILLBOARD VETORIZADO "CRYPTOZOMBIES" (Cols c=7..9, Row r=1 no gramado)
  // Estrutura metálica com sapatas de sustentação e painel oficial aumentado 2x:
  // Nem heróis nem zumbis podem pisar, atravessar ou nascer sobre o outdoor.
  if (c >= 7 && c <= 9 && r === 1) return true;

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
 * Noroeste, Oeste, Sudoeste, Sul, Sudeste, Leste e Nordeste.
 */
export const TACTICAL_ZONES = [
  // 1. Noroeste - Gramado Atrás da Ruína (Canto superior esquerdo)
  { id: 'nw_grass_high', name: 'Noroeste Gramado Alto', center: { x: 4, y: 1 } },
  // 2. Noroeste - Gramado Aberto Oeste (Ao lado da ruína)
  { id: 'nw_grass_open', name: 'Noroeste Gramado Aberto', center: { x: 1, y: 2 } },
  // 3. Noroeste - Encruzilhada da Base Norte (Estrada de terra)
  { id: 'nw_crossroad', name: 'Norte Encruzilhada', center: { x: 4, y: 2 } },
  // 4. Oeste - Estrada Lateral da Base (Entre avenida e muro oeste)
  { id: 'w_road_side', name: 'Oeste Estrada Lateral', center: { x: 3, y: 5 } },
  // 5. Sudoeste - Gramado Sul da Avenida
  { id: 'sw_grass_open', name: 'Sudoeste Gramado', center: { x: 1, y: 7 } },
  // 6. Sudoeste - Trilha do Canto Inferior Esquerdo
  { id: 'sw_trail_corner', name: 'Sudoeste Canto', center: { x: 1, y: 9 } },
  // 7. Sul-Oeste - Gramado Frontal da Base
  { id: 's_grass_front', name: 'Sul Gramado Frontal', center: { x: 3, y: 9 } },
  // 8. Sul - Gramado Central do Portão
  { id: 's_grass_center', name: 'Sul Gramado Central', center: { x: 6, y: 9 } },
  // 9. Sul-Leste - Gramado Dianteiro da Ruína Sudeste
  { id: 'se_grass_ruin', name: 'Sudeste Gramado Ruína', center: { x: 8, y: 9 } },
  // 10. Sul-Leste - Encruzilhada da Ruína Sudeste
  { id: 'se_crossroad', name: 'Sudeste Encruzilhada', center: { x: 9, y: 8 } },
  // 11. Sudeste - Gramado Extremo Leste
  { id: 'se_grass_corner', name: 'Sudeste Canto Leste', center: { x: 13, y: 8 } },
  // 12. Leste - Avenida de Asfalto Leste (Em frente ao hospital)
  { id: 'e_avenue', name: 'Leste Avenida', center: { x: 12, y: 5 } },
  // 13. Nordeste - Trilha de Terra da Torre
  { id: 'ne_trail_tower', name: 'Nordeste Trilha Torre', center: { x: 10, y: 2 } },
  // 14. Nordeste - Gramado Superior da Torre
  { id: 'ne_grass_high', name: 'Nordeste Gramado Alto', center: { x: 13, y: 1 } }
];

/**
 * PONTOS DE SPAWN NOS CANTOS E BORDAS DO MAPA ("os zumbis nascem nos cantos do mapa")
 * Zumbis surgem nas bordas e cantos extremos e caminham para as zonas táticas definidas.
 */
export const CORNER_SPAWN_POINTS = [
  // Canto Noroeste (Extremo superior esquerdo)
  { x: 1, y: 1, c: 1, r: 1 },
  { x: 2, y: 1, c: 2, r: 1 },
  // Canto Nordeste (Extremo superior direito)
  { x: 13, y: 1, c: 13, r: 1 },
  { x: 12, y: 1, c: 12, r: 1 },
  // Canto Sudoeste (Extremo inferior esquerdo)
  { x: 1, y: 9, c: 1, r: 9 },
  { x: 2, y: 9, c: 2, r: 9 },
  // Canto Sudeste (Extremo inferior direito)
  { x: 13, y: 9, c: 13, r: 9 },
  { x: 12, y: 9, c: 12, r: 9 },
  // Vias de Entrada Externas
  { x: 1, y: 4, c: 1, r: 4 },  // Avenida Oeste
  { x: 13, y: 4, c: 13, r: 4 }, // Avenida Leste
  { x: 5, y: 1, c: 5, r: 1 },  // Acesso Norte
  { x: 7, y: 9, c: 7, r: 9 }   // Acesso Sul
];

export function getCornerSpawnPoint(index = 0) {
  return CORNER_SPAWN_POINTS[index % CORNER_SPAWN_POINTS.length];
}

/**
 * Lista oficial de spawn inicial dos heróis distribuídos por todo o mapa nos locais definidos pelo usuário.
 * Cada um dos 15 heróis ocupa uma zona tática própria ao redor da base.
 */
export const SAFE_HERO_SPAWN_POINTS = [
  ...TACTICAL_ZONES.map(z => ({ x: z.center.x, y: z.center.y })),
  { x: 1, y: 4 } // 15º herói na avenida oeste
];

export function getSafeHeroSpawn(index = 0) {
  return SAFE_HERO_SPAWN_POINTS[index % SAFE_HERO_SPAWN_POINTS.length];
}
