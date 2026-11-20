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


## Recompensas do Baú do Boss

- O sorteio realizado após a derrota do Boss determina se o jogador recebe um **Baú do Boss**; quando recebido, o baú é enviado ao inventário.
- O jogador abre o Baú do Boss pelo inventário, e as recompensas são concedidas nesse momento.
- As recompensas possíveis dentro do Baú do Boss incluem **Fragmentos de Construção**, **Poção do Rejuvenecimento** e a possibilidade de obter um **Baú de Herói**.
- A **Poção do Rejuvenecimento não é concedida por um sorteio independente após a batalha**; ela é uma possível recompensa na abertura do Baú do Boss.
- A chance de obter um **Baú de Herói** na abertura é de **5%**, em um sorteio independente da equipe utilizada pelo jogador e da raridade ou quantidade de sobreviventes elegíveis.
- Ao abrir cada Baú do Boss, o resultado das recompensas principais segue uma única distribuição: **45% de chance de receber 1 Fragmento de Construção**, **45% de chance de receber 1 Poção do Rejuvenecimento** e **10% de chance de receber 1 Fragmento de Construção e 1 Poção do Rejuvenecimento juntos**.
- Portanto, toda abertura concede pelo menos uma recompensa principal; no resultado de 10%, as duas são concedidas na mesma abertura.
- A chance de obter um **Baú de Herói** permanece em **5%**, em um sorteio separado e independente. Assim, o Baú de Herói pode sair junto com qualquer um dos três resultados principais ou não sair.
- Ficam sem efeito as regras anteriores de sorteio independente de poções, inclusive a chance por raridade e o limite diário de 4 poções associado àquele sorteio. Eventuais limites de recebimento por abertura ou por dia deverão ser definidos para o conteúdo do baú.

## Chances por raridade — Baú do Boss

O sorteio para receber um Baú do Boss usa as seguintes chances individuais e diretas por raridade. Não existe chance-base intermediária nem multiplicador:

| Raridade | Chance direta por sobrevivente elegível |
|---|---:|
| Comum | 2% |
| Raro | 2,2% |
| Super Raro | 2,3% |
| Épico | 2,4% |
| Lendário | 2,6667% |
| Super Lendário | 3% |

- A soma das contribuições dos sobreviventes elegíveis é limitada a **40% por jogador em cada Boss**.
- Para Baús do Boss, permanece o limite de **3 por jogador por dia**, renovado à meia-noite no horário de Brasília (America/Sao_Paulo).
- A elegibilidade continua vinculada à equipe registrada no início da batalha; substitutos não participam do sorteio daquele evento.

### Exemplo de cálculo — cenário mediano

Considerando a equipe de referência definida em `MINING_ECONOMY_BASELINE.md` (6 Comuns, 4 Raros, 4 Épicos e 1 Lendário), sem Super Raros ou Super Lendários:

| Raridade | Quantidade | Chance individual | Contribuição |
|---|---:|---:|---:|
| Comum | 6 | 2% | 12% |
| Raro | 4 | 2,2% | 8,8% |
| Super Raro | 0 | 2,3% | 0% |
| Épico | 4 | 2,4% | 9,6% |
| Lendário | 1 | 2,6667% | 2,6667% |
| Super Lendário | 0 | 3% | 0% |
| **Total** | **15** | | **33,0667%** |

A composição acima é **apenas uma simulação de referência do cenário mediano**, não uma equipe fixa ou obrigatória para os jogadores. A chance real varia conforme a quantidade e a raridade dos sobreviventes elegíveis na equipe de cada jogador. O cálculo é a soma direta das chances individuais, conforme a regra aditiva implementada na engine; não é uma probabilidade composta por independência. Independentemente da composição da equipe ou da soma bruta calculada, a chance efetivamente aplicada **nunca pode ultrapassar 40% por jogador e por Boss**. Quando a soma ultrapassar 40%, o sistema limita o resultado aplicado a 40%.
