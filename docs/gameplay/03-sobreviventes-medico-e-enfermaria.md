# Sobreviventes, médico e enfermaria

## Quando um sobrevivente fica ferido

Ao atingir **5% de vida**, o sobrevivente sai do combate e passa a ser considerado ferido. Não ocorre morte permanente por esse motivo.

## Resgate sem médico

- O sobrevivente ferido fica aguardando a decisão do jogador.
- O jogador escolhe individualmente quando enviá-lo à enfermaria.
- Não há limite de quantidade de resgates manuais; o envio é feito um sobrevivente por vez.
- Durante um evento de Boss, o envio manual de sobreviventes feridos continua permitido.

## Resgate com médico

O médico é um serviço adicional previsto para uma etapa futura:

- Resgata automaticamente todos os sobreviventes feridos, sem limite de quantidade de resgates.
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

## Recuperação

- A recuperação acontece simultaneamente para os sobreviventes que ocupam leitos.
- A velocidade depende apenas do nível do abrigo.
- O médico não modifica a velocidade de recuperação.
- A recuperação restaura a vida do sobrevivente.
- Ao alcançar 100% de vida, ele retorna automaticamente à reserva e libera o leito.
- Havendo vaga no limite de 15 combatentes, um sobrevivente da reserva poderá voltar ao combate.

## Planos previstos para o médico — não disponíveis nesta fase

| Duração | Valor previsto em USDT | Valor previsto em MNC |
|---|---:|---:|
| 30 dias | 5,20 | 520 |
| 90 dias | 13,80 | 1.380 |
| 180 dias | 25,00 | 2.500 |

Os valores são referência de planejamento e não representam uma oferta ativa ou uma cobrança disponível.
