# Regras de resgate médico e participação no Boss

Este documento registra as regras de gameplay aprovadas para o sistema de sobreviventes, ambulatório e Boss.

## Equipe e limite de combate

- O limite normal é de até 15 sobreviventes em combate.
- O médico contratado é um profissional adicional: a formação pode ter **15 sobreviventes + 1 médico**.
- O médico não ocupa uma das 15 vagas de combate e não participa diretamente das lutas nem produz MNC.

## Ferimentos e resgate

- Os ataques inimigos reduzem os pontos de vida (PV) do sobrevivente: o Boss causa 20 PV por acerto e cada zumbi comum causa 1 PV por acerto.
- Ao atingir 5% de vida ou menos, o sobrevivente fica ferido: deixa imediatamente de atacar e não pode mais receber ataques de nenhuma unidade inimiga, incluindo o Boss e os zumbis. A vida fica protegida no limite de 5% até o resgate.
- Enquanto estiver ferido e aguardando resgate, também deixa de minerar MNC.
- **Sem médico contratado:** o sobrevivente deita e permanece parado no mapa, fora do combate e sem minerar, até o jogador selecioná-lo e ordenar manualmente seu envio ao ambulatório.
- O jogador pode enviar manualmente vários sobreviventes feridos, um por vez, inclusive durante uma batalha contra o Boss.
- **Com médico contratado:** o médico identifica e resgata automaticamente todos os sobreviventes feridos, sem limite de quantidade, encaminhando-os ao ambulatório. O resgate automático acontece ao atingir o limite de ferimento, sem exigir ação do jogador.
- O médico automatiza o resgate; não aumenta a capacidade dos leitos nem a velocidade de recuperação.

## Substituição de combatentes

- Durante o Boss, só é permitido substituir um sobrevivente que ficou ferido e foi enviado ao ambulatório.
- Não é permitido retirar um sobrevivente saudável para colocar outro durante o Boss.
- A substituição pode ser feita manualmente pelo jogador ou automaticamente pelo médico contratado.
- O sobrevivente substituto pode combater normalmente, mas não recebe participação no sorteio do Baú do Boss daquele Boss.

## Participação no sorteio do Boss

- No início de cada batalha, registrar uma lista imutável dos sobreviventes que compõem a equipe participante.
- A elegibilidade ao sorteio pertence aos sobreviventes registrados no início, e não à formação que termina a batalha.
- Todos os sobreviventes registrados na equipe inicial contam uma única vez no sorteio, independentemente de ferimentos, HP ou status ao término dos 5 minutos. Os heróis não morrem.
- Ser resgatado, estar no ambulatório ou ser substituído não remove a participação do sobrevivente inicial.
- Sobreviventes que entram como substitutos depois do início do Boss não recebem participação naquele sorteio.
- Retornar ao combate durante o mesmo evento não gera participação adicional.
- Cada sobrevivente inicial pode contar no máximo uma vez.
- Validação obrigatória na engine: o sorteio real aceita exclusivamente sobreviventes identificados no snapshot imutável da equipe inicial (bossSnapshotParticipant). Como os heróis não morrem, não há verificação de HP, sobrevivência ou status no encerramento. Sobreviventes sem snapshot, inclusive substitutos, são excluídos.
- Trabalhadores atuais sem snapshot só podem aparecer em prévias e simulações administrativas explicitamente marcadas como simulação; esse caminho não é usado no sorteio real.

## Bloqueios enquanto o Boss estiver vivo

- Bloquear a recuperação instantânea por anúncio enquanto o Boss estiver vivo.
- Bloquear a retirada/troca manual de sobreviventes saudáveis.
- Permitir o envio manual de feridos ao ambulatório.
- Permitir a substituição apenas de sobreviventes feridos, manualmente ou pelo médico contratado.
- A automação do médico não altera a lista original de participantes do sorteio.

## Ambulatório e recuperação

A capacidade do ambulatório depende do nível do abrigo:

| Nível do abrigo | Leitos disponíveis |
|---|---:|
| Básico | **5** |
| Reforçado | **10** |
| Avançado | **15** |

- A velocidade de recuperação depende exclusivamente do nível do abrigo.
- Todos os sobreviventes podem recuperar simultaneamente até o limite de leitos disponíveis para o nível atual.
- Feridos excedentes aguardam em uma fila única.
- A fila segue a ordem de chegada: primeiro a chegar, primeiro a ser atendido (FIFO).
- Quando um leito fica livre, o próximo sobrevivente da fila entra automaticamente.
- Ao atingir 100% de vida, o sobrevivente retorna automaticamente à reserva e libera o leito.
- O médico resgata todos os feridos mesmo quando não há leitos livres; os excedentes aguardam na fila.

## Contratação do médico e ROI

- O custo aprovado da Dra. Íris é de **1.500 Coins por 30 dias**.
- A contratação e cada renovação de 30 dias devem ser contabilizadas como despesa de **1.500 Coins** no cálculo do ROI líquido.
- Não utilizar a tabela anterior de preços em USDT/MNC (5,20 USDT / 520 MNC) para este cenário; ela fica substituída pelo custo de 1.500 Coins por 30 dias.
- O custo do médico deve ser considerado no ROI líquido, sem alterar a taxa bruta de produção de MNC dos sobreviventes.
## Cadência de ataque dos heróis e vida do Boss

- O Boss desfere um ataque a cada **1 segundo**.

A cadência numérica de cada arma é definida em `WEAPON_CATALOG.attacksPerSecond` no código. Os valores aprovados para os 12 heróis do elenco são:

| Herói | Ataques por segundo |
|---|---:|
| Granito | 1,25 |
| Verdant | 0,75 |
| Polar | 0,625 |
| Hunter | 0,625 |
| Scarlet | 0,50 |
| Nox | 0,375 |
| Múmia | 0,375 |
| Fênix | 1,00 |
| Brasa | 0,125 |
| Iron | 0,125 |
| Colosso | 0,125 |
| Sombra | 0,1875 |
| **Total da equipe completa** | **6,0625** |

- A cadência total considera os 12 heróis atacando simultaneamente.
- O Boss possui **30 pontos de vida (PV)**; cada ataque de herói remove **1 PV**.
- Com todos os 12 heróis atacando sem interrupção, o tempo matemático para derrotar o Boss é **30 ÷ 6,0625 = aproximadamente 4,95 segundos**.
- O tempo real pode variar por animações, intervalos de disparo, latência ou indisponibilidade de algum herói.

## Parâmetros do Boss já definidos

- Cada batalha tem duração máxima de 5 minutos caso o Boss não seja derrotado antes.
- O Boss é encerrado imediatamente quando seus 30 PV chegam a zero; se continuar vivo, o evento termina automaticamente ao fim dos 5 minutos.
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


## Armeiro e automação de consertos — decisão de 22/11/2026

- O Armeiro custa **1.500 Coins por 30 dias**, tanto na contratação inicial quanto em cada renovação.
- Enquanto contratado, automatiza **um conserto de arma a cada 24 horas**.
- O valor de 1.500 Coins inclui todos os consertos do período; não cobrar taxa adicional por reparo.
- A contratação e cada renovação são despesas do ROI líquido; não alteram a produção bruta de mineração.
- A Dra. Íris custa **1.500 Coins por 30 dias**. Dra. Íris + Armeiro totalizam 3.000 Coins por ciclo de 30 dias.
- Na projeção de 90 dias, considerar três ciclos de cada serviço: 9.000 Coins no total, além do upgrade do abrigo de 1.500 Coins.

## Regras de dano do Boss — atualização de 22/11/2026

- O Boss ataca uma vez por segundo.
- Cada ataque escolhe aleatoriamente um dos 15 heróis participantes; o mesmo herói pode ser escolhido em ataques consecutivos.
- Cada acerto causa dano discreto de 1% do HP máximo do herói atingido.
- **Não aplicar dano contínuo acumulativo do Boss nem multiplicador de desgaste 3×.** A regra anterior de dano acumulativo foi descartada.
- O herói que atingir 5% de HP é retirado imediatamente do combate/mineração e encaminhado ao ambulatório conforme as regras de resgate.

## Reposição automática durante o Boss — decisão de 22/11/2026

- Quando um sobrevivente ficar ferido durante o Boss e for encaminhado ao ambulatório, sua vaga poderá ser preenchida por outro sobrevivente disponível.
- **A reposição automática só acontece quando a Dra. Íris estiver contratada e ativa.**
- Sem a Dra. Íris contratada, não ocorre reposição automática; o jogador poderá realizar a substituição manualmente, respeitando a regra de que somente sobreviventes feridos podem ser substituídos durante o Boss.
- O sobrevivente que entra como substituto pode combater normalmente, mas não passa a integrar o snapshot imutável da batalha e não recebe participação no sorteio do Baú do Boss daquele evento.
- A substituição não altera a elegibilidade dos sobreviventes que iniciaram a batalha.

- Se a Dra. Íris estiver contratada, mas não houver sobreviventes disponíveis na reserva, a batalha continua com menos integrantes. Não encerrar a batalha nem retirar outros sobreviventes saudáveis para preencher a vaga.
- Um sobrevivente que entrou como substituto também pode ser substituído caso fique ferido e seja encaminhado ao ambulatório. A regra de substituição se aplica sucessivamente durante o mesmo Boss; cada novo substituto continua fora do snapshot imutável e não recebe participação no sorteio daquele evento.
- Se um sobrevivente substituto ficar ferido e não houver outro sobrevivente disponível, ele é encaminhado ao ambulatório conforme a regra de resgate médico. A batalha continua com menos integrantes; não é encerrada por falta de reserva.
- Ao concluir 100% da recuperação no ambulatório, o sobrevivente retorna automaticamente à equipe, independentemente de o Boss ainda estar vivo ou já ter sido derrotado, sem exigir ação do jogador.
- O retorno respeita o limite máximo de 15 sobreviventes na equipe. Se houver vaga, o herói ocupa uma vaga livre; nunca remove nem substitui um sobrevivente saudável que já esteja na equipe.
- Se a equipe já estiver com 15 sobreviventes quando outro concluir a recuperação, ele permanece aguardando na reserva e retorna automaticamente assim que uma vaga ficar livre, sem ultrapassar o limite de 15.
- Se o Boss ainda estiver ativo, o retorno não altera o snapshot imutável nem a elegibilidade ao sorteio: sobreviventes da equipe inicial mantêm apenas sua participação original, e sobreviventes que entraram como substitutos continuam inelegíveis naquele Boss. O retorno não cria participação adicional.
