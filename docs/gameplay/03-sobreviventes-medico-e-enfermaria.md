# Sobreviventes, médico e enfermaria

## Perfis de atributos dos 12 heróis

O elenco possui **12 heróis**, sem contar o médico: dois personagens para cada uma das seis raridades.

- Os dois heróis de uma mesma raridade produzem a mesma quantidade de MNC por segundo.
- A raridade determina a produção-base e a faixa de HP.
- Dentro de cada raridade, os dois heróis têm perfis diferentes:
  - **Resistente:** maior HP máximo e recuperação mais demorada.
  - **Ágil:** menor HP máximo e recuperação mais rápida.
- A regra de proporção aprovada é: o resistente tem o dobro do HP do ágil; o ágil recupera 100% da vida em um terço do tempo do resistente.
- Exemplo ilustrativo para uma dupla: resistente com 1.000 HP e recuperação em 90 minutos; ágil com 500 HP e recuperação em 30 minutos.
- Não há atributo de dano para diferenciar a produção: a mineração é calculada continuamente por segundo e depende da raridade, não de dano ou abates.
- O sistema de estrelas foi adiado para uma atualização futura. Na versão atual, todos os heróis ficam sem estrelas e não recebem bônus associados a estrelas.

Os números completos de HP e de tempo-base de recuperação para cada uma das seis raridades ainda precisam ser fechados na tabela final de balanceamento. A proporção entre os dois perfis, porém, está definida.

## Quando um sobrevivente fica ferido

Ao atingir **5% de vida**, o sobrevivente sai do combate e passa a ser considerado ferido. Não ocorre morte permanente por esse motivo.

## Resgate manual sem médico

- Quando o jogador está online e não possui médico, o sobrevivente ferido fica aguardando a decisão do jogador.
- O jogador escolhe individualmente quando enviá-lo à enfermaria.
- Não há limite de quantidade de resgates manuais; o envio é feito um sobrevivente por vez.
- Durante um evento de Boss, o envio manual de sobreviventes feridos continua permitido.

## Resgate com médico

O médico é um serviço adicional previsto para uma etapa futura:

- Enquanto o jogador está online, resgata automaticamente todos os sobreviventes feridos, sem limite de quantidade de resgates.
- Não ocupa vaga entre os 15 sobreviventes de combate.
- Não luta e não gera MNC.
- Não aumenta a quantidade de leitos.
- Não acelera a recuperação.
- Durante o Boss, não altera a lista de participantes congelada no início do evento.

A ativação, contratação e renovação do médico dependem da futura etapa conjunta de pagamentos. Não existe cobrança implementada nesta fase.

## Leitos e fila de espera

- A quantidade de leitos depende exclusivamente do nível do abrigo.
- Os sobreviventes são admitidos conforme a disponibilidade.
- Quando não há leito livre, o ferido aguarda em uma fila FIFO: quem chegou primeiro recebe o próximo leito disponível.
- O médico pode encaminhar todos os feridos, mas não cria leitos adicionais.
- Quando um sobrevivente termina a recuperação e deixa o leito, o próximo da fila entra automaticamente.

## Desconexão e reconexão

- Ao perder a conexão ou ficar offline, o jogador deixa de contar para o combate e sua produção de MNC é interrompida.
- Todos os sobreviventes que estavam ativos são enviados automaticamente ao ambulatório/enfermaria, mesmo que o jogador não tenha contratado o médico.
- Ao reconectar, os sobreviventes retornam automaticamente ao combate, respeitando o limite de **15 vagas**.
- Se não houver vagas livres, ficam na reserva e retornam automaticamente quando uma vaga surgir.
- A desconexão não gera produção retroativa de MNC e não concede recuperação instantânea.
- O estado dos sobreviventes e a ordem da fila de recuperação devem ser preservados durante a desconexão.

## Recuperação

- A recuperação acontece simultaneamente para os sobreviventes que ocupam leitos.
- A velocidade depende do perfil do herói e do nível do abrigo.
- O médico não modifica a velocidade de recuperação.
- A recuperação restaura a vida do sobrevivente.
- Ao alcançar 100% de vida, ele retorna automaticamente à reserva e libera o leito.
- Havendo vaga no limite de 15 combatentes, um sobrevivente da reserva poderá voltar ao combate automaticamente.

## Planos previstos para o médico — não disponíveis nesta fase

| Duração | Valor previsto em USDT | Valor previsto em MNC |
|---|---:|---:|
| 30 dias | 5,20 | 520 |
| 90 dias | 13,80 | 1.380 |
| 180 dias | 25,00 | 2.500 |

Os valores são referência de planejamento e não representam uma oferta ativa ou uma cobrança disponível.
