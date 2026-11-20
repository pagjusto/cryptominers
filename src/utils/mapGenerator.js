import { 
  GRID_COLS, 
  GRID_ROWS, 
  BLOCK_EMPTY, 
  BLOCK_BEDROCK, 
  BLOCK_ROCK, 
  BLOCK_ORE_CRYSTAL, 
  BLOCK_ORE_GOLD, 
  BLOCK_TREASURE, 
  BLOCK_ANCIENT_ALTAR,
  BLOCK_DEPOSIT_EMERALD 
} from '../data/minersData';
import { CRYPTO_ZOMBIES_REWARDS } from '../data/cryptoZombiesEconomy';
import { isCityBuilding, isCanyonTrackOrTunnel } from './cityMapGeometry';
import { generatePlayerMap, getPlayerMap, DEFAULT_PLAYER_ID, MAX_DEPOSITS_PER_MAP } from './individualMapEngine';

/**
 * Gera ou recupera o mapa individual do jogador, garantindo:
 * 1. Isolamento absoluto por conta (playerId).
 * 2. Máximo de 20 jazidas simultâneas com a distribuição oficial (50% Pedra, 25% Ouro, 17% Diamante, 8% Esmeralda).
 * 3. Nenhuma jazida sobre trilhos ou sob a entrada da mina.
 * 4. Compatibilidade total com componentes que utilizam { grid, hpMap }.
 */
export function generateMineMap(mine, playerId = DEFAULT_PLAYER_ID, cycleNumber = 1, forceNew = false) {
  if (forceNew) {
    return generatePlayerMap(playerId, cycleNumber);
  }

  // Se o jogador já possui um mapa ativo em andamento, recupera o estado persistido
  const savedMap = getPlayerMap(playerId);
  if (savedMap && savedMap.grid && savedMap.hpMap && savedMap.deposits) {
    return savedMap;
  }

  return generatePlayerMap(playerId, cycleNumber);
}
