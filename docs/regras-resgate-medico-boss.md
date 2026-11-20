# Regras de resgate médico e participação no Boss

Este documento registra as regras de gameplay aprovadas para o sistema de sobreviventes, ambulatório e Boss.

## Equipe e limite de combate

- O limite normal é de até 15 sobreviventes em combate.
- O médico contratado é um profissional adicional: a formação pode ter **15 sobreviventes + 1 médico**.
- O médico não ocupa uma das 15 vagas de combate e não participa diretamente das lutas nem produz MNC.

## Ferimentos e resgate

- Ao atingir 5% de vida, o sobrevivente fica ferido e deixa de combater.
- **Sem médico contratado:** o sobrevivente fica parado no mapa até o jogador selecioná-lo e ordenar o envio ao ambulatório.
- O jogador pode enviar manualmente vários sobreviventes feridos, um por vez, inclusive durante uma batalha contra o Boss.
- **Com médico contratado:** o médico identifica e resgata automaticamente todos os sobreviventes feridos, sem limite de quantidade, encaminhando-os ao ambulatório.
- O médico automatiza o resgate; não aumenta a capacidade dos leitos nem a velocidade de recuperação.

## Substituição de combatentes

- Durante o Boss, só é permitido substituir um sobrevivente que ficou ferido e foi enviado ao ambulatório.
- Não é permitido retirar um sobrevivente saudável para colocar outro durante o Boss.
- A substituição pode ser feita manualmente pelo jogador ou automaticamente pelo médico contratado.
- O sobrevivente substituto pode combater normalmente, mas não recebe participação no sorteio do Baú do Boss daquele Boss.

## Participação no sorteio do Boss

- No início de cada batalha, registrar uma lista imutável dos sobreviventes que compõem a equipe participante.
- A elegibilidade ao sorteio pertence aos sobreviventes registrados no início, e não à formação que termina a batalha.
- Um sobrevivente da equipe inicial que ficar ferido e for enviado ao ambulatório continua contando uma única vez no sorteio, desde que esteja vivo ao término dos 5 minutos.
- Ser resgatado, estar no ambulatório ou ser substituído não remove a participação do sobrevivente inicial.
- Sobreviventes que entram como substitutos depois do início do Boss não recebem participação naquele sorteio.
- Retornar ao combate durante o mesmo evento não gera participação adicional.
- Cada sobrevivente inicial pode contar no máximo uma vez.

## Bloqueios enquanto o Boss estiver vivo

- Bloquear a recuperação instantânea por anúncio enquanto o Boss estiver vivo.
- Bloquear a retirada/troca manual de sobreviventes saudáveis.
- Permitir o envio manual de feridos ao ambulatório.
- Permitir a substituição apenas de sobreviventes feridos, manualmente ou pelo médico contratado.
- A automação do médico não altera a lista original de participantes do sorteio.

## Ambulatório e recuperação

- A velocidade de recuperação depende exclusivamente do nível do abrigo.
- Todos os sobreviventes podem recuperar simultaneamente até o limite de leitos disponíveis.
- Feridos excedentes aguardam em uma fila única.
- A fila segue a ordem de chegada: primeiro a chegar, primeiro a ser atendido (FIFO).
- Quando um leito fica livre, o próximo sobrevivente da fila entra automaticamente.
- Ao atingir 100% de vida, o sobrevivente retorna automaticamente à reserva e libera o leito.
- O médico resgata todos os feridos mesmo quando não há leitos livres; os excedentes aguardam na fila.

## Contratação do médico e ROI

- O jogador pode pagar em **USDT ou MNC**, escolhendo a moeda no momento da contratação.
- Referência econômica: **1 MNC = 0,01 USDT**.
- Preços aprovados:

  | Plano | Duração | USDT | MNC |
  |---|---:|---:|---:|
  | Mensal | 30 dias | 5,20 | 520 |
  | Trimestral | 90 dias | 13,80 | 1.380 |
  | Semestral | 180 dias | 25,00 | 2.500 |

- A renovação pode ser **manual ou automática**.
- Na renovação manual, o jogador confirma a operação e pode pagar em USDT ou MNC.
- A renovação automática é opcional e exclusiva em **MNC**. No vencimento, o sistema verifica o saldo disponível; havendo MNC suficiente, renova pelo mesmo período contratado.
- Se não houver MNC suficiente, a renovação automática falha e o médico para de atuar imediatamente.
- Não há débito automático em USDT.
- Quando o plano expira, o médico para instantaneamente. O jogador pode renovar imediatamente, inclusive após o vencimento.
- O custo do médico deve ser considerado no ROI líquido, sem alterar a taxa bruta de produção de MNC dos sobreviventes.

## Parâmetros do Boss já definidos

- Cada batalha dura 5 minutos.
- O Boss é encerrado automaticamente ao fim dos 5 minutos.
- A regra de participação acima é aplicada ao sorteio de Baú do Boss do evento.


## Sorteio de poções por Boss

- O sorteio de poções segue a mesma chance-base e os mesmos multiplicadores por raridade definidos para o Baú do Boss.
- Chance-base Comum: **2% por sobrevivente elegível**.
- Multiplicadores: Comum **1×**, Raro **1,1×**, Épico **1,1667×** e Lendário **1,3333×**.
- Chances resultantes por sobrevivente: Comum **2%**, Raro **2,2%**, Épico **2,3333%** e Lendário **2,6667%**.
- A soma das contribuições dos sobreviventes elegíveis fica limitada a **40% por jogador em cada Boss**.
- Limite diário: **4 poções por jogador**, com renovação à meia-noite no horário de Brasília (America/Sao_Paulo).
- A elegibilidade considera a equipe registrada no início da batalha, conforme as regras de participação do Boss; substitutos que entram durante o evento não participam do sorteio daquele Boss.
- As quantidades concedidas por ocorrência e a distribuição por tipo de poção permanecem pendentes de definição.
