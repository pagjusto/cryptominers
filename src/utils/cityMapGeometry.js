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
  // Carro no asfalto oeste: na faixa c=1, r=5 (a faixa c=2 fica livre para desvio dos pedestres)
  if (c === 1 && r === 5) return true;
  // Carro no asfalto leste: na faixa c=13, r=5 (a faixa c=12 fica livre para desvio dos pedestres)
  if (c === 13 && r === 5) return true;
  // Ambulância estacionada na doca: c=7, r=6 (a pista c=8 fica livre para passagem pelo pátio)
  if (c === 7 && r === 6) return true;

  // 2. PRÉDIOS E RUÍNAS DE CONCRETO
  // Ruína Noroeste (prédio concreto em c=2..3, r=1..2; avenida c=1 livre na lateral)
  if ((c === 2 || c === 3) && (r === 1 || r === 2)) return true;

  // Ruína Sudeste (prédio em c=10..11, r=7..8; avenida leste c=12..13 livre)
  if ((c === 10 || c === 11) && (r === 7 || r === 8)) return true;

  // Base Central (Hangar Militar de Suprimentos & Posto Médico / Hospital Cruz Vermelha)
  if (c >= 5 && c <= 8 && r === 3) return true; // Hangar norte
  if (c >= 5 && c <= 9 && r === 4) return true; // Corpo central do hangar
  if (c >= 5 && c <= 9 && r === 5) return true; // Suprimentos e hospital
  if (c >= 5 && c <= 6 && r === 6) return true; // Doca de caixotes

  // Torres de Vigia e Silo Metálico de Abastecimento
  if ((c === 10 || c === 11) && (r === 0 || r === 1)) return true; // Torre norte
  if (c === 11 && (r === 3 || r === 4)) return true; // Torre leste
  if (c === 13 && (r === 3 || r === 4)) return true; // Silo metálico

  // 3. MUROS, CERCAS DE ARAME E BARRICADAS (Walls, Fences & Sandbags)
  // Muro oeste da base: c=4, r=4..6 (deixa r=7 aberto como corredor livre)
  if (c === 4 && (r >= 4 && r <= 6)) return true;
  // Muro sul da base: c=5, 6, 7 em r=7 (deixa c=8 e c=9 abertos como portões da base)
  if ((c === 5 || c === 6 || c === 7) && r === 7) return true;
  // Barricada norte da base: c=6..8, r=2 (deixa c=5 e c=9 abertos como acessos norte)
  if (c >= 6 && c <= 8 && r === 2) return true;

  // Cercas de arame laterais (não bloqueiam as avenidas principais)
  if (c === 3 && r === 3) return true; // Cerca entre rua oeste e ruína
  if (c === 3 && r === 4) return true; // Barricada
  if (c === 3 && r === 7) return true; // Cerca sul
  if (c === 3 && r === 8) return true; // Cerca baixa

  if (c === 10 && r === 6) return true; // Cerca da ruína sudeste

  // 4. OUTDOOR / BILLBOARD VETORIZADO "CRYPTOZOMBIES" (Cols c=6..9, Rows r=0..2)
  // Grande estrutura metálica com sapatas de sustentação e painel oficial:
  // Nem heróis nem zumbis podem pisar, atravessar ou nascer sobre o outdoor.
  if (c >= 6 && c <= 9 && (r === 0 || r === 1 || r === 2)) return true;

  return false;
}

/**
 * Alias para manter 100% de retrocompatibilidade com GameBoard, enemySystem e individualMapEngine
 */
export const isCityBuilding = isCityObstacle;
export const isCanyonTrackOrTunnel = isCityObstacle;

/**
 * Lista de pontos seguros e 100% abertos para spawn inicial de heróis (apenas Ruas livres e Grama)
 * Nenhum ponto colide com carros, prédios, muros ou cercas, e todos estão rigorosamente nos limites jogáveis.
 */
export const SAFE_HERO_SPAWN_POINTS = [
  // Estrada Oeste (Pista livre e desvio do carro)
  { x: 1, y: 4 }, { x: 2, y: 5 }, { x: 1, y: 6 }, { x: 2, y: 6 },
  // Gramado Sudoeste (Totalmente aberto)
  { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 9 }, { x: 2, y: 9 },
  // Acesso Norte / Gramado Noroeste (Aberto)
  { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 4, y: 1 }, { x: 5, y: 1 },
  // Estrada Leste (Pista livre e desvio do carro)
  { x: 12, y: 4 }, { x: 12, y: 5 }, { x: 12, y: 6 }, { x: 13, y: 6 },
  // Pátio Sul e Gramado Sul (Aberto)
  { x: 7, y: 8 }, { x: 8, y: 8 }, { x: 6, y: 9 }, { x: 7, y: 9 }
];

export function getSafeHeroSpawn(index = 0) {
  return SAFE_HERO_SPAWN_POINTS[index % SAFE_HERO_SPAWN_POINTS.length];
}
