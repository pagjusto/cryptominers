# Minercoin (MNC) e produção

## Moeda do jogo

A moeda do ecossistema é a **Minercoin (MNC)**.

A referência de planejamento definida é **1 MNC = US$ 0,01**. Essa referência não deve ser interpretada como garantia de preço de mercado, liquidez, conversão ou saque.

## Como a produção funciona

- Cada sobrevivente ativo gera MNC individualmente, por segundo válido de combate.
- A taxa individual depende exclusivamente da raridade do sobrevivente.
- Cada raridade possui uma taxa de mineração própria.
- A classe, função ou tipo de arma do sobrevivente não concede bônus nem penalidade de produção.
- O nível do abrigo não altera a mineração nem o ROI; sua influência é restrita à capacidade e à velocidade de recuperação dos sobreviventes.
- A soma da produção dos sobreviventes ativos determina a produção total do jogador.
- Não há pagamento separado por cada zumbi eliminado.
- A produção continua durante o evento de Boss.
- Se não houver sobreviventes em combate, a produção pausa.
- Ao ficar offline ou perder a conexão, a produção é interrompida.
- O tempo pausado ou offline não gera acúmulo retroativo.
- A disponibilidade do jogo por 24 horas não dobra o ROI diário já definido.

## Produção por raridade

A base de cálculo aprovada permanece **20,88 MNC por dia para cada sobrevivente comum**. Os multiplicadores aprovados para as seis raridades são:

| Raridade | Multiplicador | Produção por sobrevivente/dia | Taxa exata por segundo (MNC) |
|---|---:|---:|---:|
| Comum | 1× | 20,88 MNC | 20,88 ÷ 86.400 = 0,000241666666… |
| Raro | 1,5× | 31,32 MNC | 31,32 ÷ 86.400 = 0,0003625 |
| Super Raro | 1,75× | 36,54 MNC | 36,54 ÷ 86.400 = 0,000422916666… |
| Épico | 2× | 41,76 MNC | 41,76 ÷ 86.400 = 0,000483333333… |
| Lendário | 3× | 62,64 MNC | 62,64 ÷ 86.400 = 0,000725 |
| Super Lendário | 4× | 83,52 MNC | 83,52 ÷ 86.400 = 0,000966666666… |

### Regra de precisão para a mineração contínua

- O cálculo da produção deve usar a taxa por segundo com precisão decimal suficiente, sem limitar o valor aos dígitos arredondados exibidos na interface ou em tabelas.
- As taxas devem ser tratadas como a fração exata da produção diária dividida por **86.400 segundos**.
- A produção fracionária deve ser acumulada internamente; não arredondar o saldo a cada segundo ou atualização.
- O arredondamento deve ocorrer apenas para exibição ou no momento de contabilização definido pela implementação, preservando o total acumulado.
- Em 86.400 segundos válidos de mineração contínua, cada sobrevivente deve produzir exatamente seu valor diário de referência.
- Pausas por desconexão, ausência de sobreviventes em combate ou outras condições já definidas não contam como segundos válidos e não geram produção retroativa.

## Simulação de cenário mediano — referência anterior

O valor de **480,24 MNC por dia** permanece como resultado da simulação de referência anterior, usando a composição de **6 sobreviventes comuns, 4 raros, 4 épicos e 1 lendário**. Essa composição não inclui as novas categorias Super Raro e Super Lendário; portanto, o valor de 480,24 MNC/dia não deve ser interpretado como média recalculada para a nova distribuição de seis raridades.

Conferência da composição anterior:

- 6 comuns: **125,28 MNC/dia**
- 4 raros: **125,28 MNC/dia**
- 4 épicos: **167,04 MNC/dia**
- 1 lendário: **62,64 MNC/dia**

**Total: 480,24 MNC por dia.**

Esse valor serve apenas como referência histórica de cenário. Não é uma meta obrigatória que toda composição deva atingir, um limite universal, uma taxa fixa de retorno ou uma promessa de rendimento. A produção real varia conforme a quantidade e a raridade dos sobreviventes ativos, além do tempo válido em combate.

O Abrigo Reforçado citado na simulação representa apenas uma referência de recuperação e não concede bônus de mineração.

## Retorno bruto e líquido

- **Retorno bruto:** total de MNC produzido.
- **Retorno líquido:** produção após descontar custos e despesas aplicáveis, como o custo do médico quando esse serviço estiver ativo.

O cálculo completo do retorno líquido ainda precisa ser formalizado antes da publicação como números garantidos.
