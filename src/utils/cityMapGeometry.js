/**
 * CRIPTO MYNERS — GEOMETRIA & COLISÕES DO MAPA DA CIDADE DE SOBREVIVÊNCIA
 * 
 * Regra Oficial do Usuário:
 * "Esse será o novo mapa, os zumbis e heróis não podem subir para os prédios, somente ruas e grama."
 * 
 * Grid: 15 Colunas x 11 Linhas (720px largura x 528px altura, blocos de 48x48)
 */

export const GRID_COLS = 15;
export const GRID_ROWS = 11;
export const TILE_SIZE = 48;

/**
 * Retorna se a célula (c, r) contém um edifício sólido ou obstáculo estrutural.
 * Onde for true: nem heróis nem zumbis/boss podem entrar ou nascer.
 * Onde for false: ruas pavimentadas, caminhos de terra batida e gramados livres.
 */
export function isCityBuilding(c, r) {
  // 1. Ruína Superior Esquerda (Top-Left Ruined Concrete House)
  if (c >= 2 && c <= 4 && r >= 1 && r <= 2) return true;

  // 2. Base Central Fortificada (Central Compound: Armazém, Hospital com Cruz Vermelha, Muros e Torre)
  // Telhado do armazém e caixa d'água superior
  if (c >= 6 && c <= 8 && r === 3) return true;
  // Torre de vigia oeste, galpão de suprimentos e hospital
  if (c >= 4 && c <= 9 && r >= 4 && r <= 5) return true;
  // Muro frontal sul, estacionamento interno e ambulância
  if (c >= 5 && c <= 9 && r === 6) return true;

  // 3. Ruína Inferior Direita (Bottom-Right Ruined Concrete Building)
  // Paredes e escombros do prédio destruído
  if (c >= 12 && c <= 13 && r >= 7 && r <= 8) return true;
  if (c === 11 && r === 8) return true; // Escombros frontais da parede

  // 4. Silo Metálico de Água (extrema direita)
  if (c === 13 && r === 4) return true;

  // 5. Torreta de Vigia Leste de Madeira
  if (c === 11 && r === 3) return true;

  return false;
}

/**
 * Lista de pontos seguros e abertos para spawn inicial de heróis (Ruas e Grama)
 */
export const SAFE_HERO_SPAWN_POINTS = [
  { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 6 }, { x: 2, y: 6 },
  { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 9 },
  { x: 10, y: 1 }, { x: 11, y: 1 }, { x: 12, y: 1 }, { x: 10, y: 2 },
  { x: 12, y: 5 }, { x: 13, y: 5 }, { x: 14, y: 5 },
  { x: 7, y: 8 }, { x: 8, y: 8 }, { x: 6, y: 9 }
];

export function getSafeHeroSpawn(index = 0) {
  return SAFE_HERO_SPAWN_POINTS[index % SAFE_HERO_SPAWN_POINTS.length];
}

/**
 * Alias de compatibilidade com sistemas anteriores
 */
export const isCanyonTrackOrTunnel = isCityBuilding;
