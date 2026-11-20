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

**Importante:** os valores antigos de idade (30 anos no dia 90, 40 no dia 120, etc.) foram substituídos por esta progressão contínua. A tabela antiga também continha marcos de eficiência-base e HP (100%, 90%, 80%, 70%, 50%, 30% e aposentadoria). Esses valores de eficiência e HP ficam registrados como referências históricas, mas sua relação exata com a nova idade contínua e a regra de interpolação ainda precisa ser definida antes da implementação. Não presumir que eficiência e HP diminuem linearmente com a idade sem aprovação.

## Observações de balanceamento

- Estes números representam a base do cenário mediano com mineração válida durante 24 horas.
- Atributos individuais dos heróis e multiplicadores de casa podem ajustar a produção efetiva conforme as regras do jogo.
- O valor de 480,24 MNC/dia é a referência total da equipe mediana, não uma recompensa por Boss.
- Os valores de eficiência por idade e o bônus por estrelas são fatores distintos, combinados pela fórmula acima.
- Não alterar esta base sem uma nova decisão explícita de balanceamento.
