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

A recuperação do Abrigo Básico é 60% mais rápida que o desgaste: o tempo de recuperação corresponde a 40% do tempo de mineração necessário para perder os mesmos 95% de HP.

| Raridade | Tempo de mineração até 5% | Recuperação Básico | Ciclo completo |
|---|---:|---:|---:|
| Comum | 6h40 | 2h40 | 9h20 |
| Raro | 8h | 3h12 | 11h12 |
| Super Raro | 9h20 | 3h44 | 13h04 |
| Épico | 10h40 | 4h16 | 14h56 |
| Lendário | 12h | 4h48 | 16h48 |
| Super Lendário | 13h20 | 5h20 | 18h40 |

Os tempos acima são a referência do Abrigo Básico, sem fila de espera. Multiplicadores dos abrigos alteram a velocidade de recuperação, não a taxa de desgaste normal.

### Dano durante combate contra o Boss

Não aplicar dano contínuo acumulativo de combate nem multiplicador de desgaste 3×. Para esta regra, considerar somente os ataques discretos do Boss descritos abaixo, além do desgaste normal de mineração quando aplicável.

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

O ataque individual de 1% do HP máximo é um evento discreto. Não somar dano contínuo acumulativo do Boss nem aplicar a antiga regra de desgaste 3×.

### Parâmetros para a simulação cronológica de 24 horas

- Capacidade do ambulatório: 5 leitos no Abrigo Básico, 10 no Reforçado e 15 no Avançado.
- A quantidade de leitos define quantos heróis recuperam simultaneamente; os excedentes aguardam em fila FIFO.
- A taxa de cura do Básico é 356,25 PV/h; Reforçado aplica 125% (445,3125 PV/h) e Avançado 150% (534,375 PV/h).

Não assumir duração de evento, número de heróis atingidos, ou perda total por Boss sem esses parâmetros.

## Dano em batalha e encaminhamento ao ambulatório — regra geral

- Quando o HP do personagem chega a **5%**, ele é retirado da partida e encaminhado ao **ambulatório** para recuperação.
- O personagem não continua lutando depois de atingir esse limite.
- Esta regra de combate é distinta da redução gradual do HP máximo causada pelo envelhecimento.

## Capacidade e fila de recuperação

A capacidade do ambulatório depende do nível do abrigo:

| Nível do abrigo | Leitos disponíveis |
|---|---:|
| Básico | **5** |
| Reforçado | **10** |
| Avançado | **15** |

- A equipe de combate possui **15 vagas**.
- A quantidade de leitos não altera o limite da equipe; ela define quantos heróis podem recuperar simultaneamente.
- Se todos os leitos do nível atual estiverem ocupados, os heróis feridos excedentes aguardam em fila FIFO (primeiro que entra, primeiro que sai).
- O encaminhamento do herói ao ambulatório acontece automaticamente ao atingir 5% de HP.
- O médico Dra. Íris automatiza o encaminhamento dos heróis feridos ao ambulatório; não acelera a recuperação.

## Tempos de recuperação por abrigo — tabela calculada

A velocidade do Abrigo Básico é **356,25 PV por hora**, equivalente a 2,5 vezes o desgaste normal (recuperação 60% mais rápida em duração). Reforçado e Avançado aplicam multiplicadores adicionais:

    taxa_recuperação = 356,25 × multiplicador_do_abrigo
    tempo_recuperação = HP_a_recuperar ÷ taxa_recuperação

- Abrigo Básico: 100% da velocidade-base (356,25 PV/h).
- Abrigo Reforçado: 125% da velocidade-base (445,3125 PV/h).
- Abrigo Avançado: 150% da velocidade-base (534,375 PV/h).

| Raridade | HP a recuperar | Abrigo Básico | Abrigo Reforçado | Abrigo Avançado |
|---|---:|---:|---:|---:|
| Comum | 950 | 2h40min | 2h08min | 1h46min40s |
| Raro | 1.140 | 3h12min | 2h33min36s | 2h08min |
| Super Raro | 1.330 | 3h44min | 2h59min12s | 2h29min20s |
| Épico | 1.520 | 4h16min | 3h24min48s | 2h50min40s |
| Lendário | 1.710 | 4h48min | 3h50min24s | 3h12min |
| Super Lendário | 1.900 | 5h20min | 4h16min | 3h33min20s |

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


## Balanceamento econômico de 90 dias — atualização de 22/11/2026

### Meta e conversão Coin/USDT

- Meta de saldo líquido ao final de 90 dias: **43.000 Coins**.
- Equivalência financeira pretendida: **430 USDT**.
- Cotação fixa definida para este modelo: **1 Coin = 0,01 USDT**; equivalentemente, **1 USDT = 100 Coins**.
- Portanto, **43.000 Coins = 430 USDT**.
- Não interpretar a cotação como 1 USDT = 0,01 Coin.

### Premissas do cenário

- Equipe mediana: 15 heróis (6 Common, 4 Rare, 4 Epic e 1 Legendary).
- Produção-base da equipe: 480,24 Coins por 24 horas de mineração válida.
- A recuperação é 60% mais rápida: o tempo de recuperação corresponde a 40% do tempo normal.
- Abrigo Básico, com 5 leitos, até o dia 54; upgrade para Abrigo Reforçado, com 10 leitos, no dia 55.
- A fila do ambulatório segue FIFO: primeiro a chegar, primeiro a ser atendido. Quando um leito fica livre, o próximo herói da fila inicia a recuperação.
- Para esta projeção, não aplicar redução de eficiência por envelhecimento antes do dia 90; aplicar 90% somente no dia 90.
- Despesas projetadas até o dia 90: **10.500 Coins**: Dra. Íris (3 ciclos de 30 dias = 4.500 Coins), Armeiro (3 ciclos de 30 dias = 4.500 Coins) e upgrade do Abrigo Reforçado (1.500 Coins).
- Meta bruta necessária: aproximadamente **53.500 Coins** para alcançar 43.000 Coins líquidos após as despesas.

### Simulação cronológica com fila FIFO

Simulação cronológica de eventos para 90 dias, com os 15 heróis iniciando com HP cheio, desgaste normal e fila FIFO:

- Produção bruta antes do multiplicador: **31.334,11 Coins** em 90 dias.
- Produção média: **348,16 Coins/dia**.
- Composição: 6 Common, 4 Rare, 4 Epic e 1 Legendary.
- Capacidade: 5 leitos até o início do dia 55; 10 leitos a partir do dia 55.
- Desgaste: 142,5 PV/h enquanto minera.
- Recuperação: Básico 356,25 PV/h; Reforçado 445,3125 PV/h; Avançado 534,375 PV/h.
- Eficiência de mineração: 100% até o dia 89; 90% somente durante o dia 90.
- Resultado: **2.907 atendimentos**, espera média de **5min58s** e maior espera de **5h04min**. Não foram incluídos ataques do Boss.

### Fator uniforme de balanceamento recalculado

Para alcançar 53.500 Coins brutos e cobrir 10.500 Coins em despesas, o fator recalculado é **1,7074×**, preservando as proporções relativas entre raridades.

    produção_balanceada = 31.334,11488 × 1,7074
    produção_balanceada = 53.499,87 Coins (aprox.)

O fator corresponde a um aumento de aproximadamente **70,74%** sobre a produção simulada com FIFO.

| Raridade | Produção-base (Coins/herói/dia) | Produção com fator 1,7074× |
|---|---:|---:|
| Common | 20,88 | 35,6486 |
| Rare | 31,32 | 53,4729 |
| Epic | 41,76 | 71,2973 |
| Legendary | 62,64 | 106,9458 |

### Resultado econômico projetado

| Indicador | Valor |
|---|---:|
| Produção bruta simulada com fator 1,7074× | **53.499,87 Coins** |
| Dra. Íris — 3 ciclos | 4.500,00 Coins |
| Armeiro — 3 ciclos | 4.500,00 Coins |
| Upgrade do Abrigo Reforçado | 1.500,00 Coins |
| Total de despesas | **10.500,00 Coins** |
| Saldo líquido projetado | **42.999,87 Coins** |
| Equivalência a 100 Coins/USDT | **430,00 USDT** |

O fator **1,7074×** fica definido como parâmetro recalculado para este cenário. Por arredondamento, a projeção fica aproximadamente 0,13 Coin abaixo da meta exata de 43.000 Coins líquidos.

### Serviços contratados

- **Dra. Íris:** 1.500 Coins por 30 dias. Automatiza o resgate de todos os heróis feridos; não aumenta leitos nem velocidade de recuperação.
- **Armeiro:** 1.500 Coins por 30 dias. Automatiza um conserto de arma a cada 24 horas durante a contratação. O preço inclui os consertos; não há taxa adicional por reparo.
- Cada contratação/renovação de 30 dias é contabilizada como despesa no ROI líquido, sem alterar a produção bruta.
