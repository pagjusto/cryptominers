# CryptoZombies — Base econômica da mineração

Status: configuração aprovada como referência do cenário mediano.

## Equipe de referência

| Raridade | Quantidade | Multiplicador |
|---|---:|---:|
| Comum | 6 | 1× |
| Raro | 4 | 1,5× |
| Épico | 4 | 2× |
| Lendário | 1 | 3× |
| **Total** | **15** | |

## Produção de referência

- Produção total da equipe: **480,24 Coins por dia**.
- Janela de referência: **24 horas de mineração válida**.
- A produção é acumulada por segundo de mineração válido.
- Taxa média da equipe completa: **0,0055583333 Coins por segundo**.
- Não há divisão fixa de recompensa por Boss. O tempo válido de mineração é o que acumula a produção.

## Produção individual oficial por raridade

Tabela de produção aprovada em 18/11/2026, com seis raridades. O herói Common é a referência-base de 20,88 Coins por dia; os demais valores são calculados pelos multiplicadores aprovados.

| Raridade | Multiplicador | Coins por herói/dia | Coins por herói/hora | Coins por herói/segundo |
|---|---:|---:|---:|---:|
| Common | 1× | 20,88 | 0,8700 | 0,0002416667 |
| Rare | 1,5× | 31,32 | 1,3050 | 0,0003625000 |
| Super Rare | 1,75× | 36,54 | 1,5225 | 0,0004229167 |
| Epic | 2× | 41,76 | 1,7400 | 0,0004833333 |
| Legendary | 3× | 62,64 | 2,6100 | 0,0007250000 |
| Super Legendary | 4× | 83,52 | 3,4800 | 0,0009666667 |

Fórmula oficial:

    produção_diária_individual = 20,88 × multiplicador_da_raridade

A produção é acumulada por segundo de mineração válida. As frações permanecem preservadas internamente e o arredondamento ocorre somente na interface. Não há bônus adicional por classe, função ou arma na produção-base.

## Conferência da equipe mediana

| Raridade | Heróis | Produção diária por raridade |
|---|---:|---:|
| Comum | 6 | 125,28 Coins |
| Raro | 4 | 125,28 Coins |
| Épico | 4 | 167,04 Coins |
| Lendário | 1 | 62,64 Coins |
| **Total** | **15** | **480,24 Coins** |

## Fórmula-base

A composição do cenário mediano representa 23 unidades ponderadas de mineração:

    (6 × 1) + (4 × 1,5) + (4 × 2) + (1 × 3) = 23
    480,24 Coins ÷ 23 = 20,88 Coins por unidade 1× ao dia

A taxa individual diária é: 20,88 × multiplicador da raridade.

A tabela oficial contempla seis raridades, mas a composição de referência do cenário mediano permanece com 15 heróis distribuídos entre Common, Rare, Epic e Legendary. Super Rare e Super Legendary fazem parte da tabela de produção oficial, mas não entram nessa composição específica.

### Taxas agregadas do cenário mediano

- Produção diária: **480,24 Coins**.
- Produção por hora: **20,01 Coins**.
- Produção por minuto: **0,3335 Coins**.
- Produção por segundo: **0,0055583333 Coins**.

Essas taxas representam a equipe completa durante 24 horas de mineração válida, antes dos ajustes de eficiência por envelhecimento e estrelas.

## Eficiência por envelhecimento e estrelas

A eficiência final combina a eficiência-base determinada pela idade do herói com o bônus total correspondente à sua evolução em estrelas.

| Evolução | Bônus de eficiência |
|---|---:|
| ★ | +5% |
| ★★ | +10% |
| ★★★ | +15% |

Fórmula aprovada:

    eficiência_final = eficiência_base_por_idade × (1 + bônus_de_estrelas)

Exemplo: um herói de 60 anos cuja eficiência-base seja 50%, com três estrelas (+15%), terá:

    50% × 1,15 = 57,5% de eficiência final

O bônus das estrelas não elimina nem reverte a penalidade de envelhecimento. O bônus máximo é de +15% em ★★★.

## Envelhecimento — modelo contínuo aprovado

**Decisão aprovada: Opção A — envelhecimento contínuo de 0,222222... ano de idade por dia real.** Esta regra substitui os valores antigos de idade intermediária que não eram compatíveis com uma taxa uniforme.

- Idade inicial: **20 anos**.
- Idade final: **80 anos**.
- Duração do ciclo: **270 dias reais**.
- Envelhecimento total: **60 anos em 270 dias**.
- Taxa: **60 ÷ 270 = 0,222222... ano de idade por dia real**.
- Equivalência aproximada: **2,67 meses de idade por dia real**.
- O cálculo é contínuo, incluindo frações de dia.
- Aos 80 anos, após 270 dias, o herói se aposenta.

Fórmula da idade:

    idade = 20 + (dias_de_vida × 60 ÷ 270)

### Idades calculadas nos marcos de referência

| Dias de vida | Idade pela regra contínua |
|---:|---:|
| 0 | 20 anos |
| 90 | 40 anos |
| 120 | 46,67 anos |
| 150 | 53,33 anos |
| 180 | 60 anos |
| 240 | 73,33 anos |
| 270 | 80 anos — aposentadoria |

### Marcos aprovados de eficiência-base e HP

O usuário aprovou manter os valores da tabela de referência para eficiência-base e HP, associados aos respectivos dias de vida. Eles ficam definidos como os marcos oficiais do envelhecimento:

| Dias de vida | Idade pela regra contínua | Eficiência-base | HP | Situação |
|---:|---:|---:|---:|---|
| 0 | 20 anos | 100% | 100% | Ativo |
| 90 | 40 anos | 90% | 90% | Ativo |
| 120 | 46,67 anos | 80% | 80% | Ativo |
| 150 | 53,33 anos | 70% | 70% | Ativo |
| 180 | 60 anos | 50% | 50% | Ativo |
| 240 | 73,33 anos | 30% | 30% | Ativo |
| 270 | 80 anos | 0% | 0% | Aposentado |

Os valores acima estão aprovados como pontos de referência. **A transição entre cada marco é gradual e linear**, tanto para a eficiência-base quanto para o HP. Os valores diminuem continuamente e proporcionalmente ao longo dos dias entre dois marcos consecutivos, sem saltos ou períodos de estabilidade. O cálculo deve considerar frações de dia quando aplicável.

Para cada intervalo entre dois marcos consecutivos, calcular a queda proporcional entre o valor inicial e o valor final daquele intervalo. Essa interpolação é aplicada separadamente aos valores de eficiência-base e HP, que neste modelo compartilham os mesmos marcos.

Aos 270 dias, o herói chega a 80 anos, tem eficiência-base 0%, HP 0% e se aposenta.

## HP máximo por raridade, desgaste e recuperação — regra definida em 22/11/2026

Esta seção registra as decisões mais recentes de balanceamento e prevalece sobre valores conflitantes de HP e recuperação que apareçam em tabelas anteriores deste documento. Os valores de HP desta seção são HP máximo-base do herói por raridade; não são os pontos de eficiência/HP percentual usados no envelhecimento.

| Raridade | HP máximo | Limite de resgate (5% do HP) | HP a recuperar (95%) |
|---|---:|---:|---:|
| Comum | 1.000 | 50 | 950 |
| Raro | 1.200 | 60 | 1.140 |
| Super Raro | 1.400 | 70 | 1.330 |
| Épico | 1.600 | 80 | 1.520 |
| Lendário | 1.800 | 90 | 1.710 |
| Super Lendário | 2.000 | 100 | 1.900 |

### Regra de dano contínuo durante a mineração

O Lendário é a referência de balanceamento: perde 95% do HP máximo em 12 horas de mineração normal, até atingir o limite de resgate de 5%.

    dano_normal_por_segundo = 1.710 ÷ (12 × 3.600)
    dano_normal_por_segundo = 0,0395833333 PV/s
    dano_normal_por_hora = 142,5 PV/h

A mesma taxa absoluta de desgaste normal por segundo é aplicada a todas as raridades. Portanto, heróis com menos HP atingem o limite de resgate mais cedo; heróis com mais HP permanecem minerando por mais tempo.

### Tempo de mineração até o resgate e recuperação no Abrigo Básico

A recuperação ocorre à mesma taxa absoluta de 142,5 PV/h. Assim, para esta referência, o tempo de recuperação dos 95% perdidos é igual ao tempo de mineração necessário para perder esses 95%.

| Raridade | Tempo de mineração até 5% | Tempo de recuperação | Ciclo completo |
|---|---:|---:|---:|
| Comum | 6h40 | 6h40 | 13h20 |
| Raro | 8h | 8h | 16h |
| Super Raro | 9h20 | 9h20 | 18h40 |
| Épico | 10h40 | 10h40 | 21h20 |
| Lendário | 12h | 12h | 24h |
| Super Lendário | 13h20 | 13h20 | 26h40 |

Os tempos acima são a referência do Abrigo Básico, sem fila de espera. Multiplicadores dos abrigos alteram a velocidade de recuperação, não a taxa de desgaste normal.

### Dano durante combate contra o Boss

Foi definida uma taxa de desgaste de combate equivalente a **3× o dano contínuo normal** para heróis que estejam atacando o Boss:

    dano_combate_por_segundo = 0,0395833333 × 3
    dano_combate_por_segundo = 0,11875 PV/s

Esta taxa é o desgaste contínuo de combate e deve ser contabilizada apenas durante o período em que o herói estiver participando do combate.

### Ataques individuais do Boss e fila circular

Regras definidas na conversa de 22/11/2026:

- O Boss não possui uma barra de HP própria nesta mecânica.
- O evento de Boss envolve os heróis próximos atacando/participando do combate.
- O Boss desfere um ataque a cada **1 segundo**.
- O Boss ataca um herói próximo por vez, seguindo uma fila circular.
- Ao atingir o último herói próximo, a fila reinicia no primeiro.
- Exemplo com cinco heróis próximos: H1 → H2 → H3 → H4 → H5 → H1...
- Cada ataque individual do Boss causa dano equivalente a **1% do HP máximo do herói atingido**.

| Raridade | HP máximo | Dano recebido por ataque do Boss (1%) |
|---|---:|---:|
| Comum | 1.000 | 10 PV |
| Raro | 1.200 | 12 PV |
| Super Raro | 1.400 | 14 PV |
| Épico | 1.600 | 16 PV |
| Lendário | 1.800 | 18 PV |
| Super Lendário | 2.000 | 20 PV |

O ataque individual de 1% do HP máximo é um evento discreto; não deve ser confundido com a taxa contínua de desgaste de combate de 0,11875 PV/s. Para calcular a perda total durante um evento, contabilizar ambos somente se a implementação mantiver os dois mecanismos ativos.

### Pontos ainda necessários para a simulação cronológica de 24 horas

- Duração efetiva de cada evento de Boss ou quantidade de ciclos de ataque durante o evento.
- Quantidade de heróis próximos/participantes em cada evento.
- Confirmação de que o desgaste contínuo de combate 3× e o dano discreto de 1% por ataque são cumulativos na implementação.
- Regras de ocupação e fila de recuperação aplicadas simultaneamente à equipe real.
- Os valores de tempo do Abrigo Reforçado e Avançado para as raridades devem ser derivados dos multiplicadores aprovados de 125% e 150% sobre a velocidade de recuperação básica, sem confundir velocidade com duração.

Não assumir duração de evento, número de heróis atingidos, ou perda total por Boss sem esses parâmetros.

## Dano em batalha e encaminhamento ao ambulatório — regra geral

- Quando o HP do personagem chega a **5%**, ele é retirado da partida e encaminhado ao **ambulatório** para recuperação.
- O personagem não continua lutando depois de atingir esse limite.
- Esta regra de combate é distinta da redução gradual do HP máximo causada pelo envelhecimento.

## Capacidade e fila de recuperação

- A equipe de combate possui **15 vagas**.
- O ambulatório possui **15 vagas independentes**.
- Se o ambulatório estiver cheio, os heróis feridos aguardam em fila FIFO (primeiro que entra, primeiro que sai).
- O encaminhamento do herói ao ambulatório acontece automaticamente ao atingir 5% de HP.
- O médico Dra. Íris automatiza o encaminhamento dos heróis feridos ao ambulatório; não acelera a recuperação.

## Tempos de recuperação por abrigo — tabela calculada

A velocidade de recuperação do Abrigo Básico é a referência: **142,5 PV por hora**. Os outros abrigos aumentam a velocidade, e o tempo é inversamente proporcional ao multiplicador:

    tempo_recuperação = HP_a_recuperar ÷ (142,5 × multiplicador_do_abrigo)

- Abrigo Básico: 100% da velocidade (142,5 PV/h).
- Abrigo Reforçado: 125% da velocidade (178,125 PV/h), ou seja, tempo básico ÷ 1,25.
- Abrigo Avançado: 150% da velocidade (213,75 PV/h), ou seja, tempo básico ÷ 1,5.

| Raridade | HP a recuperar | Abrigo Básico (100%) | Abrigo Reforçado (125%) | Abrigo Avançado (150%) |
|---|---:|---:|---:|---:|
| Comum | 950 | 6h40min | 5h20min | 4h26min40s |
| Raro | 1.140 | 8h | 6h24min | 5h20min |
| Super Raro | 1.330 | 9h20min | 7h28min | 6h13min20s |
| Épico | 1.520 | 10h40min | 8h32min | 7h06min40s |
| Lendário | 1.710 | 12h | 9h36min | 8h |
| Super Lendário | 1.900 | 13h20min | 10h40min | 8h53min20s |

Os tempos são calculados para recuperar do limite de resgate (5% do HP máximo) até 100%, sem considerar espera em fila. Manter precisão em segundos/frações internamente; a interface pode exibir horas e minutos. O tempo efetivo de entrada no jogo também depende da disponibilidade das vagas do ambulatório e da fila FIFO.

Não usar tabelas antigas de recuperação que estejam em conflito com os valores de HP e a taxa de recuperação definidos nesta seção.

## Observações de balanceamento

- A produção de 480,24 Coins/dia é a referência total da equipe mediana durante 24 horas de mineração válida, antes das interrupções por dano, recuperação e fila.
- A produção efetiva deve descontar somente o tempo em que o herói não está minerando.
- Atributos individuais e multiplicadores de abrigo podem ajustar a produção efetiva conforme as regras do jogo.
- Não alterar esta base sem uma nova decisão explícita de balanceamento.

## Tabela comercial de baús de heróis — aprovada em 21/11/2026

Esta é a tabela de preços comerciais definida para os pacotes de 1, 5, 10 e 15 heróis. O pacote de 15 heróis tem preço final de **US$ 432,13**, já com 8% de desconto aplicado. O valor unitário-base é inferido matematicamente a partir desse pacote.

| Pacote | Quantidade de heróis | Desconto | Preço final (USDT) |
|---|---:|---:|---:|
| Miner | 1 | 0% | **US$ 31,31** |
| Explorer | 5 | 0% | **US$ 156,57** |
| Elite | 10 | 4% | **US$ 300,61** |
| Legendary | 15 | 8% | **US$ 432,13** |

### Regra de cálculo

- Preço unitário-base inferido: **US$ 31,313768... por herói**, calculado por 432,13 ÷ 0,92 ÷ 15.
- Miner: 1 × preço unitário-base, sem desconto.
- Explorer: 5 × preço unitário-base, sem desconto.
- Elite: 10 × preço unitário-base, com 4% de desconto.
- Legendary: 15 × preço unitário-base, com 8% de desconto.
- Preços finais arredondados para duas casas decimais.
- O usuário confirmou o preço de US$ 432,13 para Legendary e os descontos de 4% para Elite e 8% para Legendary. Os preços dos pacotes de 1, 5 e 10 heróis são derivados matematicamente dessa base.

**Importante:** esta seção documenta os preços comerciais. Ela não altera automaticamente os preços de compra atualmente implementados no código do jogo; a implementação deve ser feita separadamente após revisão do fluxo de compra.
