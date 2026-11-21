# Economia oficial da moeda do jogo (MHC)

Status: **decisões aprovadas pelo usuário em novembro de 2026**.

> **Nomenclatura:** a sigla adotada nas discussões atuais é **MHC**. O código e documentos antigos ainda podem conter **MNC (Minercoin)**; essa diferença de nomenclatura deverá ser tratada na implementação, sem alterar silenciosamente registros históricos.

## Cotação de referência

- Cotação interna de referência: **1 MHC = US$ 0,01**.
- Equivalência: **100 MHC = US$ 1,00**.
- Essa cotação é a referência definida para as operações internas atuais e para a conversão de saques enquanto esta regra estiver vigente.

## Modelo de cotação híbrido

1. Antes da entrada/negociação da moeda na Solana, o administrador define a cotação oficial utilizada pelo projeto.
2. Após a entrada na Solana, a cotação passa a acompanhar o mercado, conforme o modelo híbrido previamente aprovado.
3. As cotações devem ser versionadas e manter seu histórico.
4. Cada operação deve registrar e utilizar a cotação vigente no momento em que ocorreu.
5. Uma atualização de cotação não altera operações passadas nem recalcula retroativamente compras, saldos históricos ou registros financeiros.

## Pacotes de compra

Os pacotes aprovados são vendidos em USDT, sem bônus ou descontos adicionais:

| Pacote | Quantidade | Valor |
|---|---:|---:|
| Inicial | 1.000 MHC | US$ 10 |
| Intermediário | 5.000 MHC | US$ 50 |
| Avançado | 10.000 MHC | US$ 100 |
| Máximo | 20.000 MHC | US$ 200 |

- Pagamento em USDT.
- O crédito de MHC ocorre após a confirmação do pagamento.
- Os valores correspondem à cotação de referência de US$ 0,01 por MHC.

## Saques — decisões aprovadas

- O saldo de MHC será convertido para USDT usando a cotação interna definida de **1 MHC = US$ 0,01**.
- **Saque mínimo: 40 USDT**, equivalente a **4.000 MHC** pela cotação de referência.
- A rede escolhida para os saques de USDT é **Solana**, utilizando o padrão/token **SPL**.
- A carteira de destino será uma carteira compatível com USDT na rede Solana.

### Taxa de rede (gas) — decisão aprovada

- **O projeto paga a taxa de rede (gas)** da transferência de USDT pela Solana.
- O jogador **não terá um desconto adicional** no valor do saque por causa do gas.
- O custo efetivo do gas deverá ser registrado individualmente no histórico/detalhamento de cada saque.
- Esse custo será pago pelo projeto **com os recursos arrecadados por meio da taxa percentual de saque**; portanto, o gas reduz a parcela líquida dessa taxa que fica com o projeto.
- O registro do saque deverá permitir identificar, separadamente, o valor bruto, a taxa percentual cobrada do jogador, o custo de gas pago pelo projeto e o valor líquido recebido pelo jogador.
- O custo do gas não deve ser somado novamente à cobrança do jogador nem abatido do valor líquido que ele recebe.

## Política de burn

- **Não haverá mecanismo de burn de MHC por enquanto.**
- MHC utilizada em upgrades será debitada normalmente do saldo do jogador, sem queima.
- Não haverá percentual de burn nem destinação automática de uma parcela para um fundo por meio desse mecanismo.
- A decisão poderá ser reavaliada futuramente, caso a moeda passe a ter circulação externa ou integração de mercado.

## Regras de implementação e histórico

- Manter histórico/versionamento das cotações com data e hora de vigência.
- Registrar em cada operação financeira a cotação aplicada, a quantidade de MHC, o valor em USDT e o momento da operação.
- Em cada saque, registrar também o valor bruto, a taxa percentual, o custo real de gas pago pelo projeto e o valor líquido recebido pelo jogador.
- Não recalcular transações anteriores quando a cotação mudar.
- Não confundir cotação interna de referência com garantia de preço de mercado após negociação on-chain.

## Itens ainda não definidos neste documento

- Percentuais e faixas definitivas da taxa de saque (a política regressiva precisa ser confirmada antes da implementação).
- Liquidez disponível e mecanismo efetivo de conversão/execução on-chain.
- Detalhes técnicos do contrato/token e da integração de USDT na Solana.
