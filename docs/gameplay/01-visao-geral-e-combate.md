# Visão geral e combate

## Objetivo da partida

O jogador monta uma equipe de sobreviventes para enfrentar ondas de zumbis, manter sua equipe ativa e gerar Minercoin (MNC) durante o tempo válido de combate.

## Mapa e equipe

- O jogo utiliza um mapa tático em visão superior, organizado em grade.
- Até **15 sobreviventes** podem atuar no combate simultaneamente.
- O médico, quando contratado em uma futura etapa de pagamentos, é um serviço adicional: não ocupa uma das 15 vagas, não luta e não produz MNC.
- A equipe pode conter sobreviventes em combate, em recuperação, aguardando vaga na enfermaria ou na reserva.

## Combate

- O combate contra zumbis é automático durante a partida.
- Os sobreviventes atacam os inimigos conforme as regras de combate do jogo.
- Ao chegar a **5% de vida**, o sobrevivente deixa de participar do combate e passa ao fluxo de feridos.
- O sobrevivente não morre permanentemente por esse evento: ele pode ser encaminhado à enfermaria e recuperado.
- Quando recupera 100% da vida, retorna à reserva. Se houver vaga no limite de 15 combatentes, poderá voltar ao combate conforme a regra de reposição.

## Ondas

A quantidade de zumbis por onda e o intervalo entre ondas já foram definidos no planejamento do jogo. Os valores devem ser mantidos na configuração oficial do projeto; esta página não os redefine.

## Produção durante o combate

- A produção de MNC ocorre continuamente por segundo válido de combate; não existe recompensa individual por abate.
- A produção considera a composição da equipe e as regras econômicas do jogo.
- Durante um Boss, a produção continua seguindo a regra normal.
- Se não houver sobreviventes em combate, a produção pausa.
- Não há compensação retroativa por períodos em que a produção ficou pausada.

## Parâmetros ainda provisórios

Dano, vida, velocidade de ataque e outros números usados na simulação local podem ser provisórios. Eles não devem ser apresentados como equilíbrio definitivo até serem validados e configurados oficialmente.
