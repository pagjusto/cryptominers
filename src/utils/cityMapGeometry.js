/**
 * CRYPTOZOMBIES — GEOMETRIA & COLISÕES DO MAPA DA CIDADE DE SOBREVIVÊNCIA
 * 
 * Regra Oficial do Usuário:
 * "herois e zombies na podem passar por cima ou pisar em cima de muros e cercas tambem e carros"
 * "os zumbis e heróis não podem subir para os prédios, somente ruas e grama."
 * 
 * Grid: 15 Colunas x 11 Linhas (720px largura x 528px altura, blocos de 48x48)
 */

import { OFFICIAL_BLOCKED_SUBCELLS } from '../data/officialCitySubgrid.js';

export const GRID_COLS = 19;
export const GRID_ROWS = 14;
export const TILE_SIZE = 76;

/**
 * SUB-GRADE DE ALTA PRECISÃO (QUADRADINHOS BEM MENORES):
 * Divisão de 4x4 por tile = blocos exatos de 19px x 19px (1444 / 76 = 19, 1064 / 56 = 19).
 * Permite contornar escombros, ruínas e quinas de muros sem bloquear as ruas.
 * Total: 76 colunas x 56 linhas = 4.256 quadradinhos cobrindo 100% de todo o mapa de ponta a ponta.
 */
export const SUB_GRID_SCALE = 4;
export const SUB_TILE_SIZE = 19;
export const SUB_GRID_COLS = GRID_COLS * SUB_GRID_SCALE; // 76 colunas
export const SUB_GRID_ROWS = GRID_ROWS * SUB_GRID_SCALE; // 56 linhas
export const TOTAL_SUB_CELLS = SUB_GRID_COLS * SUB_GRID_ROWS; // 4.256 células

/**
 * Geometria padrão oficial do perímetro fortificado da Base Militar e Hospital.
 */
export function isDefaultBaseCompound(col, row) {
  if (typeof col !== 'number' || typeof row !== 'number' || isNaN(col) || isNaN(row)) return false;
  const c = Math.round(col);
  const r = Math.round(row);

  // Complexo militar fortificado & Hospital no grid 19x14:
  if (r === 2 && (c >= 8 && c <= 10)) return true;
  if (r === 3 && (c >= 6 && c <= 12)) return true;
  if (r === 4 && (c >= 4 && c <= 13)) return true;
  if (r === 5 && (c >= 4 && c <= 15)) return true;
  if (r === 6 && (c >= 4 && c <= 15)) return true;
  if (r === 7 && (c >= 4 && c <= 14)) return true;
  if (r === 8 && (c >= 5 && c <= 13)) return true;
  if (r === 9 && (c >= 7 && c <= 11)) return true;
  return false;
}

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
  if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS && isDefaultBaseCompound(col, row)) {
    return true;
  }

  // Se o usuário personalizou os obstáculos desenhando no mapa com a sub-grade:
  if (customObstacles !== null) {
    if (c >= GRID_COLS || r >= GRID_ROWS) {
      return isSubCellBlocked(c, r);
    } else if (!Number.isInteger(c) || !Number.isInteger(r)) {
      const sc = Math.floor(c * SUB_GRID_SCALE);
      const sr = Math.floor(r * SUB_GRID_SCALE);
      return isSubCellBlocked(sc, sr);
    } else {
      const sc1 = col * SUB_GRID_SCALE + 1;
      const sr1 = row * SUB_GRID_SCALE + 1;
      return isSubCellBlocked(sc1, sr1) || isSubCellBlocked(sc1 + 1, sr1 + 1);
    }
  }

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
/**
 * Geometria oficial padrão de obstáculos do mapa da cidade.
 */
export function isDefaultCityObstacle(col, row) {
  // Limites exteriores do mapa (fora do grid de combate)
  if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return true;

  // 1. CONSTRUÇÕES - RUÍNA NOROESTE (Prédio de concreto destruído no topo esquerdo + escombros e lajes)
  if (row <= 2 && (col >= 1 && col <= 5)) return true;

  // 2. OUTDOOR / BILLBOARD "CRYPTOZOMBIES" (Norte no gramado)
  if ((row === 0 || row === 1) && (col >= 8 && col <= 11)) return true;

  // 3. TORRE DE SIRENE E ALARME DE VIGIA OESTE
  if (row === 4 && col === 2) return true;

  // 4. RESERVATÓRIO / HIDRANTE METÁLICO OESTE
  if ((row === 4 || row === 5) && col === 0) return true;

  // 5. CARROS ABANDONADOS NO ASFALTO (Oeste)
  if (row === 6 && (col >= 0 && col <= 1)) return true;

  // 6. CONSTRUÇÃO CENTRAL - BASE MILITAR & HOSPITAL DE SOBREVIVÊNCIA
  if (isDefaultBaseCompound(col, row)) return true;

  // 7. GUARITA ELEVADA DE MADEIRA LESTE (Torre de vigia leste)
  if ((row === 3 || row === 4) && col === 14) return true;

  // 8. CONSTRUÇÕES - SILO / RESERVATÓRIO METÁLICO DE COMBUSTÍVEL LESTE
  if ((row >= 2 && row <= 5) && (col >= 16 && col <= 18)) return true;

  // 9. CARRO ABANDONADO LESTE
  if (row === 6 && (col >= 16 && col <= 18)) return true;

  // 10. CONSTRUÇÕES - RUÍNA SUDESTE (Prédio de concreto destruído no canto inferior direito + escombros caídos)
  if (row >= 9 && row <= 13 && col >= 13 && col <= 18) return true;

  // Todas as demais estradas, caminhos de terra batida e gramados estão 100% livres
  return false;
}

// Armazena e gerencia o grid interativo de colisão customizado pelo usuário (desenho manual no mapa)
// Escala de alta precisão 76x56 (blocos de 19px x 19px cobrindo 100% de todo o mapa)
let customObstacles = null;

export function isSubCellBlocked(subC, subR) {
  if (typeof subC !== 'number' || typeof subR !== 'number' || isNaN(subC) || isNaN(subR)) return true;
  const sc = Math.round(subC);
  const sr = Math.round(subR);
  if (sc < 0 || sc >= SUB_GRID_COLS || sr < 0 || sr >= SUB_GRID_ROWS) return true;

  if (customObstacles === null) {
    initCustomObstacles();
  }

  if (customObstacles !== null) {
    const key = `${sc},${sr}`;
    return Boolean(customObstacles[key]);
  }

  const baseCol = Math.floor(sc / SUB_GRID_SCALE);
  const baseRow = Math.floor(sr / SUB_GRID_SCALE);
  return isDefaultCityObstacle(baseCol, baseRow) || isDefaultBaseCompound(baseCol, baseRow);
}

const STORAGE_KEY_SUBGRID = 'crypto_zombies_custom_subgrid_v6';

export function initCustomObstacles() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUBGRID);
      if (saved) {
        customObstacles = JSON.parse(saved);
        return;
      }
    } catch (e) {}
  }

  // Inicializa mapa oficial na escala de sub-grade 76x56 (19px = 4.256 células)
  const initialMap = {};
  for (let i = 0; i < OFFICIAL_BLOCKED_SUBCELLS.length; i++) {
    const [sc, sr] = OFFICIAL_BLOCKED_SUBCELLS[i];
    initialMap[`${sc},${sr}`] = true;
  }

  customObstacles = initialMap;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_SUBGRID, JSON.stringify(customObstacles));
    } catch (e) {}
  }
}

export function getCustomObstacles() {
  if (customObstacles === null) {
    initCustomObstacles();
  }
  return customObstacles;
}

export function setCustomObstacleCell(c, r, isBlocked, brushSize = 1) {
  if (customObstacles === null) {
    initCustomObstacles();
  }

  const subCol = Math.round(c);
  const subRow = Math.round(r);

  // Aplica o pincel com o tamanho selecionado (1x1 = 19px, 2x2 = 38px, 4x4 = 76px)
  const size = Math.max(1, Math.min(8, Math.round(brushSize)));
  for (let dr = 0; dr < size; dr++) {
    for (let dc = 0; dc < size; dc++) {
      const sc = subCol + dc;
      const sr = subRow + dr;
      if (sc >= 0 && sc < SUB_GRID_COLS && sr >= 0 && sr < SUB_GRID_ROWS) {
        const key = `${sc},${sr}`;
        if (isBlocked) {
          customObstacles[key] = true;
        } else {
          customObstacles[key] = false;
        }
      }
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY_SUBGRID, JSON.stringify(customObstacles));
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cryptozombies_collision_updated', { detail: customObstacles }));
  }
}

export function blockAllCustomObstacles() {
  const map = {};
  for (let sr = 0; sr < SUB_GRID_ROWS; sr++) {
    for (let sc = 0; sc < SUB_GRID_COLS; sc++) {
      map[`${sc},${sr}`] = true;
    }
  }
  customObstacles = map;
  try {
    localStorage.setItem(STORAGE_KEY_SUBGRID, JSON.stringify(customObstacles));
  } catch (e) {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cryptozombies_collision_updated', { detail: customObstacles }));
  }
}

export function clearAllCustomObstacles() {
  const map = {};
  for (let sr = 0; sr < SUB_GRID_ROWS; sr++) {
    for (let sc = 0; sc < SUB_GRID_COLS; sc++) {
      map[`${sc},${sr}`] = false;
    }
  }
  customObstacles = map;
  try {
    localStorage.setItem(STORAGE_KEY_SUBGRID, JSON.stringify(customObstacles));
  } catch (e) {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cryptozombies_collision_updated', { detail: customObstacles }));
  }
}

export function resetCustomObstacles() {
  customObstacles = null;
  try {
    localStorage.removeItem(STORAGE_KEY_SUBGRID);
    localStorage.removeItem('crypto_zombies_custom_subgrid_v3');
    localStorage.removeItem('crypto_zombies_custom_subgrid_v2');
    localStorage.removeItem('crypto_zombies_custom_collision_grid');
  } catch (e) {}
  initCustomObstacles();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cryptozombies_collision_updated', { detail: customObstacles }));
  }
}

export function getActiveObstaclesCount() {
  if (customObstacles === null) initCustomObstacles();
  let count = 0;
  for (let sr = 0; sr < SUB_GRID_ROWS; sr++) {
    for (let sc = 0; sc < SUB_GRID_COLS; sc++) {
      if (isSubCellBlocked(sc, sr)) count++;
    }
  }
  return count;
}

export function exportCustomObstaclesCode() {
  const blockedList = [];
  for (let sr = 0; sr < SUB_GRID_ROWS; sr++) {
    for (let sc = 0; sc < SUB_GRID_COLS; sc++) {
      if (isSubCellBlocked(sc, sr)) {
        blockedList.push({ sc, sr });
      }
    }
  }
  return JSON.stringify(blockedList, null, 2);
}

export function isCityObstacle(c, r) {
  if (typeof c !== 'number' || typeof r !== 'number' || isNaN(c) || isNaN(r)) return true;

  // 1. Coordenadas de sub-célula diretas (ex: c in 15..59 ou r in 11..43)
  if (c >= GRID_COLS || r >= GRID_ROWS) {
    return isSubCellBlocked(c, r);
  }

  // 2. Coordenadas contínuas com fração (ex: herói em x=2.35, y=1.75)
  if (!Number.isInteger(c) || !Number.isInteger(r)) {
    const sc = Math.floor(c * SUB_GRID_SCALE);
    const sr = Math.floor(r * SUB_GRID_SCALE);
    return isSubCellBlocked(sc, sr);
  }

  // 3. Coordenadas inteiras da malha base 15x11 (ex: c=2, r=1 em A* ou BFS)
  const col = Math.round(c);
  const row = Math.round(r);
  if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return true;

  // Verifica as 16 sub-células da célula base
  let blockedCount = 0;
  let centerBlocked = 0;
  for (let dr = 0; dr < SUB_GRID_SCALE; dr++) {
    for (let dc = 0; dc < SUB_GRID_SCALE; dc++) {
      const sc = col * SUB_GRID_SCALE + dc;
      const sr = row * SUB_GRID_SCALE + dr;
      if (isSubCellBlocked(sc, sr)) {
        blockedCount++;
        // Sub-células centrais (dc=1..2, dr=1..2)
        if ((dc === 1 || dc === 2) && (dr === 1 || dr === 2)) {
          centerBlocked++;
        }
      }
    }
  }

  // Uma célula base inteira só é considerada intransponível se o centro estiver bloqueado
  // ou se tiver densidade de bloqueio significativa (>= 6 de 16 sub-células)
  return centerBlocked >= 2 || blockedCount >= 6;
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
  { id: 'nw_grass_high', name: 'Noroeste Gramado Alto', center: { x: 6, y: 1 } },
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
  const base = cfg[role] || (role === 'armorer' ? cfg.armorer : cfg.iris);
  const scaleX = (GRID_COLS * TILE_SIZE) / 1140;
  const scaleY = (GRID_ROWS * TILE_SIZE) / 836;
  return {
    x: Math.round(base.x * scaleX),
    y: Math.round(base.y * scaleY)
  };
}
