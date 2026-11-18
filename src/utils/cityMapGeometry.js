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
export const TILE_SIZE = 60;

/**
 * Retorna se a célula (c, r) contém um obstáculo sólido:
 * - Prédios e Ruínas de concreto
 * - Muros perimetrais e Portões
 * - Cercas de arame e Barricadas de sacos de areia
 * - Carros abandonados e Ambulância
 * - Torres de vigia e Silos
 * 
 * Onde for true: nem heróis nem zumbis/boss podem pisar, atravessar ou nascer.
 * Onde for false: ruas pavimentadas (livres de carros), caminhos de terra batida e gramados livres.
 */
export function isCityObstacle(c, r) {
  // Limites do mapa
  if (c < 0 || c >= GRID_COLS || r < 0 || r >= GRID_ROWS) return true;

  // 1. CARROS ABANDONADOS E AMBULÂNCIA (Veículos nas ruas e pátio)
  // Carro abandonado no asfalto oeste (pista superior)
  if (c === 1 && r === 5) return true;
  // Carro abandonado no asfalto leste (pista superior)
  if (c === 13 && r === 5) return true;
  // Ambulância no estacionamento/pátio interno da base
  if ((c === 7 || c === 8) && r === 6) return true;

  // 2. PRÉDIOS E RUÍNAS DE CONCRETO
  // Ruína Noroeste (Top-Left Ruined Concrete House & Walls)
  if (c >= 1 && c <= 3 && r >= 1 && r <= 2) return true;

  // Ruína Sudeste (Bottom-Right Ruined Concrete Building, Paredes e Escombros)
  if (c >= 10 && c <= 12 && r === 7) return true; // Parede norte e escombros
  if (c >= 10 && c <= 12 && r === 8) return true; // Interior e frente da ruína
  if (c === 13 && (r === 7 || r === 8)) return true; // Escombros leste

  // Base Central (Hangar Militar de Suprimentos & Posto Médico / Hospital Cruz Vermelha)
  if (c >= 5 && c <= 8 && r === 3) return true; // Estrutura norte do armazém
  if (c >= 5 && c <= 9 && r === 4) return true; // Galpão do hangar e clínica médica
  if (c >= 5 && c <= 9 && r === 5) return true; // Suprimentos e hospital
  if (c >= 5 && c <= 6 && r === 6) return true; // Doca de carga e caixotes

  // Torres de Vigia e Silo Metálico de Abastecimento
  if ((c === 10 || c === 11) && (r === 0 || r === 1)) return true; // Torre de vigia norte
  if (c === 11 && (r === 3 || r === 4)) return true; // Torre de vigia leste
  if (c === 13 && (r === 3 || r === 4)) return true; // Silo metálico

  // 3. MUROS, CERCAS DE ARAME E BARRICADAS (Walls, Fences & Sandbags)
  // --- Muro e Cercas Perimetrais da Base Central ---
  // Muro oeste de concreto com mourões:
  if (c === 4 && (r >= 4 && r <= 7)) return true;
  // Muro sul da base (concreto reforçado com sacos de areia):
  if ((c === 5 || c === 6 || c === 7) && r === 7) return true;
  // Perímetro leste da base (portão de ferro e cerca de segurança):
  if (c === 9 && (r === 6 || r === 7)) return true;
  // Barricada de sacos de areia ao norte da base (acima do telhado):
  if (c >= 6 && c <= 9 && r === 2) return true;

  // --- Cercas e Barricadas da Estrada Oeste ---
  if ((c === 2 || c === 3) && r === 3) return true; // Cerca de arame norte
  if (c === 3 && r === 4) return true; // Ninho de sacos de areia
  if ((c === 2 || c === 3) && r === 7) return true; // Cerca de arame sul
  if (c === 3 && r === 8) return true; // Cerca de madeira baixa

  // --- Cercas e Barricadas da Estrada Leste ---
  if ((c === 10 || c === 11) && r === 6) return true; // Cerca próxima da ruína sudeste

  return false;
}

/**
 * Alias para manter 100% de retrocompatibilidade com GameBoard, enemySystem e individualMapEngine
 */
export const isCityBuilding = isCityObstacle;
export const isCanyonTrackOrTunnel = isCityObstacle;

/**
 * Lista de pontos seguros e 100% abertos para spawn inicial de heróis (apenas Ruas livres e Grama)
 * Nenhum ponto colide com carros, prédios, muros ou cercas.
 */
export const SAFE_HERO_SPAWN_POINTS = [
  // Estrada Oeste (Pista sul e desvio do carro)
  { x: 0, y: 5 }, { x: 1, y: 6 }, { x: 2, y: 5 }, { x: 0, y: 6 },
  // Gramado Sudoeste (Totalmente aberto)
  { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 9 }, { x: 2, y: 9 },
  // Gramado Noroeste / Norte (Aberto)
  { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 4, y: 0 }, { x: 5, y: 1 },
  // Estrada Leste (Pista sul e desvio do carro)
  { x: 12, y: 5 }, { x: 14, y: 5 }, { x: 12, y: 6 }, { x: 13, y: 6 },
  // Pátio Sul e Gramado Sul (Aberto)
  { x: 7, y: 8 }, { x: 8, y: 8 }, { x: 6, y: 9 }, { x: 7, y: 9 }
];

export function getSafeHeroSpawn(index = 0) {
  return SAFE_HERO_SPAWN_POINTS[index % SAFE_HERO_SPAWN_POINTS.length];
}
