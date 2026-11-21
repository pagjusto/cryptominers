# CryptoZombies — Zonas de circulação e regras de movimento

Status: **regra de movimentação definida pelo usuário em 21/11/2026**.

A captura de tela enviada em 21/11/2026, com contornos vermelhos desenhados pelo usuário, é a referência visual para delimitar as áreas bloqueadas do mapa. Os contornos devem ser convertidos em áreas reais de colisão no mapa; não usar os traços vermelhos como arte do jogo.

## 1. Áreas bloqueadas

Heróis e zumbis não podem pisar, atravessar ou permanecer nas áreas delimitadas em vermelho na referência. Isso inclui as áreas ocupadas/delimitadas por:
- Base do ambulatório, incluindo seu interior e estrutura;
- construções em ruínas;
- torres e estruturas de defesa;
- cercas, grades e trechos de barreira destacados;
- veículos, reservatórios e objetos destacados;
- sacos de areia, barricadas e demais obstáculos contornados.

A colisão deve seguir o contorno efetivo de cada objeto/área, e não um retângulo amplo que bloqueie terreno livre ao redor. Nenhum caminho, perseguição ou deslocamento automático pode cortar essas regiões.

## 2. Áreas transitáveis

Todo o terreno não delimitado como bloqueado permanece transitável. Isso inclui gramados, estradas de terra, cruzamentos e espaços abertos entre construções, cercas e obstáculos.

Heróis e zumbis podem circular livremente por essas áreas e cruzar seus trajetos.

## 3. Colisão entre personagens

- Heróis e zumbis não devem bloquear fisicamente a passagem uns dos outros.
- Podem cruzar-se e atravessar o espaço ocupado momentaneamente por outro personagem durante o deslocamento.
- Não podem terminar/parar no mesmo ponto de destino ao mesmo tempo.
- Antes de concluir o movimento, cada personagem deve ocupar uma posição livre e distinta.
- Se o destino estiver ocupado/reservado por outro personagem, escolher automaticamente uma posição próxima que esteja livre e seja transitável.
- A regra vale para movimento automático, perseguição, retorno, patrulha e qualquer outro deslocamento de heróis e zumbis.

## 4. Compatibilidade com a base/ambulatório

A área interna do ambulatório é bloqueada para circulação comum de personagens no mapa. A representação dos heróis em tratamento, em espera ou em reserva dentro da base é uma disposição visual/funcional interna da base, tratada pelo sistema do ambulatório; não deve permitir que personagens caminhem pelo interior como se fosse terreno aberto.

## 5. Critérios de validação

1. Nenhum herói ou zumbi atravessa ou fica sobre uma área bloqueada.
2. Personagens conseguem percorrer estradas, gramados e cruzamentos livres.
3. Dois personagens podem cruzar trajetos sem ficarem presos um no outro.
4. Dois personagens nunca finalizam o movimento na mesma posição.
5. Quando dois personagens tentam chegar ao mesmo destino, um deles seleciona outro ponto livre próximo.
6. O caminho alternativo não pode atravessar áreas bloqueadas.

Não alterar a geometria do mapa, a arte dos objetos ou as regras de combate por causa desta especificação.
