# Cripto Myners — Base econômica da mineração

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

## Produção individual reconstruída por raridade

A tabela abaixo é a reconstrução matemática a partir dos multiplicadores e da composição da equipe de referência. Não é uma transcrição literal de uma tabela histórica.

| Raridade | MNC por herói/dia | MNC por herói/segundo |
|---|---:|---:|
| Comum (1×) | 20,88 | 0,0002416667 |
| Raro (1,5×) | 31,32 | 0,0003625000 |
| Épico (2×) | 41,76 | 0,0004833333 |
| Lendário (3×) | 62,64 | 0,0007250000 |

## Conferência da equipe mediana

| Raridade | Heróis | Produção diária por raridade |
|---|---:|---:|
| Comum | 6 | 125,28 MNC |
| Raro | 4 | 125,28 MNC |
| Épico | 4 | 167,04 MNC |
| Lendário | 1 | 62,64 MNC |
| **Total** | **15** | **480,24 MNC** |

## Fórmula-base

A composição de referência representa 23 unidades ponderadas de mineração:

    (6 × 1) + (4 × 1,5) + (4 × 2) + (1 × 3) = 23
    480,24 MNC ÷ 23 = 20,88 MNC por unidade 1× ao dia

A taxa individual diária de referência é: 20,88 × multiplicador da raridade.

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

## Observações de balanceamento

- Estes números representam a base do cenário mediano com mineração válida durante 24 horas.
- Atributos individuais dos heróis e multiplicadores de casa podem ajustar a produção efetiva conforme as regras do jogo.
- O valor de 480,24 MNC/dia é a referência total da equipe mediana, não uma recompensa por Boss.
- Os valores de eficiência por idade e o bônus por estrelas são fatores distintos, combinados pela fórmula acima.
- Não alterar esta base sem uma nova decisão explícita de balanceamento.
