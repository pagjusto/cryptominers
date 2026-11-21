# Zonas de respawn do mapa — CryptoZombies

## Regra visual aprovada
As duas áreas marcadas em verde na captura do mapa atual são as zonas fixas de nascimento:
- faixa norte: gramados/caminhos do alto à esquerda e centro-norte;
- faixa sul: gramado inferior, contornando o complexo central e as ruínas.

Os contornos verdes da referência são marcações de planejamento e não aparecem como barreiras no jogo.

## Comportamento
- Heróis recém-criados/inicializados nascem dentro dessas zonas.
- Zumbis e Boss nascem dentro dessas zonas, inclusive nos respawns.
- O mapa salvo recebe migração de versão para mover inimigos ativos antigos que estavam fora das zonas.
- Depois do nascimento, heróis e inimigos continuam podendo caminhar e patrulhar por todo o mapa transitável; as zonas não restringem a movimentação.
- Obstáculos, prédios, muros, cercas e o complexo central continuam bloqueando passagem e spawn.
- Respawn evita células ocupadas por inimigos e, quando possível, por heróis.

## Implementação
- `src/utils/cityMapGeometry.js`: máscara das zonas, lista de pontos seguros para heróis e pontos de respawn de inimigos; `SPAWN_ZONE_VERSION = 2`.
- `src/utils/individualMapEngine.js`: spawn inicial de zumbis/Boss, migração de mapas salvos e respawn restritos às zonas.
- `src/components/GameBoard.jsx`: posiciona heróis novos dentro das zonas e mantém a movimentação normal depois.

As zonas são definidas por células do mapa atual (15 × 11); não alteram terreno, layout, estradas ou a base central.