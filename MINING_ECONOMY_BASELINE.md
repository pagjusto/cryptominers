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

- Produção total da equipe: **480,24 MNC por dia**.
- Janela de referência: **24 horas de mineração válida**.
- A produção é acumulada por segundo de mineração válido.
- Taxa média da equipe completa: **0,0055583333 MNC por segundo**.
- Não há divisão fixa de recompensa por Boss. O tempo válido de mineração é o que acumula a produção.

## Produção individual oficial por raridade

Tabela de produção aprovada em 18/11/2026, com seis raridades. O herói Common é a referência-base de 20,88 MNC por dia; os demais valores são calculados pelos multiplicadores aprovados.

| Raridade | Multiplicador | MNC por herói/dia | MNC por herói/hora | MNC por herói/segundo |
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
| Comum | 6 | 125,28 MNC |
| Raro | 4 | 125,28 MNC |
| Épico | 4 | 167,04 MNC |
| Lendário | 1 | 62,64 MNC |
| **Total** | **15** | **480,24 MNC** |

## Fórmula-base

A composição do cenário mediano representa 23 unidades ponderadas de mineração:

    (6 × 1) + (4 × 1,5) + (4 × 2) + (1 × 3) = 23
    480,24 MNC ÷ 23 = 20,88 MNC por unidade 1× ao dia

A taxa individual diária é: 20,88 × multiplicador da raridade.

A tabela oficial contempla seis raridades, mas a composição de referência do cenário mediano permanece com 15 heróis distribuídos entre Common, Rare, Epic e Legendary. Super Rare e Super Legendary fazem parte da tabela de produção oficial, mas não entram nessa composição específica.

### Taxas agregadas do cenário mediano

- Produção diária: **480,24 MNC**.
- Produção por hora: **20,01 MNC**.
- Produção por minuto: **0,3335 MNC**.
- Produção por segundo: **0,0055583333 MNC**.

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

## Dano em batalha e encaminhamento ao ambulatório

- Durante a partida, os danos causados pelos Bosses reduzem o HP do personagem.
- Quando o HP do personagem chega a **5%**, ele é retirado da partida e encaminhado ao **ambulatório** para recuperação.
- O personagem não continua lutando depois de atingir esse limite.
- Esta regra de combate é distinta da redução gradual do HP máximo causada pelo envelhecimento.
- O método, a duração e o custo da recuperação no ambulatório ainda não foram definidos.

## Recuperação de heróis no ambulatório

**Tabela de recuperação confirmada pelo usuário.** Quando um herói sofre dano durante a partida e seu HP chega a 5%, ele é retirado do combate e encaminhado automaticamente ao ambulatório para recuperar os 95% de HP perdidos.

| Raridade | HP recuperado | Abrigo Básico | Abrigo Reforçado | Abrigo Avançado |
|---|---:|---:|---:|---:|
| Comum | 7.579 HP | 2h | 1h36 | 1h20 |
| Raro | 9.095 HP | 2h24 | 1h55 | 1h36 |
| Super Raro | 11.368 HP | 3h | 2h24 | 2h |
| Épico | 12.992 HP | 3h26 | 2h45 | 2h17 |
| Lendário | 15.158 HP | 4h | Não definido | Não definido |
| Super Lendário | 18.189 HP | 4h48 | Não definido | Não definido |

### Regras de capacidade e fila

- A equipe de combate possui **15 vagas**.
- O ambulatório possui **15 vagas independentes**.
- Se o ambulatório estiver cheio, os heróis feridos aguardam em fila FIFO (primeiro que entra, primeiro que sai).
- O encaminhamento do herói ao ambulatório acontece automaticamente ao atingir 5% de HP.

### Velocidade de recuperação por abrigo

- Abrigo Básico: tempo de referência.
- Abrigo Reforçado: recuperação 25% mais rápida.
- Abrigo Avançado: recuperação 50% mais rápida.

**Pendência de dados:** os tempos para Lendário e Super Lendário nos abrigos Reforçado e Avançado não constavam na tabela recuperada e permanecem sem definição. Não estimar nem preencher esses valores sem aprovação.

## Observações de balanceamento

- Estes números representam a base do cenário mediano com mineração válida durante 24 horas.
- Atributos individuais dos heróis e multiplicadores de casa podem ajustar a produção efetiva conforme as regras do jogo.
- O valor de 480,24 MNC/dia é a referência total da equipe mediana, não uma recompensa por Boss.
- Os valores de eficiência por idade e o bônus por estrelas são fatores distintos, combinados pela fórmula acima.
- Não alterar esta base sem uma nova decisão explícita de balanceamento.
