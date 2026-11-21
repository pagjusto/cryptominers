# Economia oficial da Minercoin (MNC)

Status: **decisões aprovadas pelo usuário em novembro de 2026**.

Este documento consolida a cotação inicial, o modelo de formação de preço, os pacotes de compra e o registro histórico de cotações da Minercoin.

## Cotação inicial

- Cotação inicial oficial: **1 MNC = US$ 0,01**.
- Equivalência: **100 MNC = US$ 1,00**.

## Modelo de cotação híbrido

1. Antes da entrada/negociação da Minercoin na Solana, o administrador define a cotação oficial utilizada pelo projeto.
2. Após a entrada na Solana, a cotação passa a acompanhar o mercado.
3. As cotações devem ser versionadas e manter seu histórico.
4. Cada operação deve registrar e utilizar a cotação vigente no momento em que ocorreu.
5. Uma atualização de cotação não altera operações passadas nem recalcula retroativamente compras, saldos históricos ou registros financeiros.

## Pacotes de compra de MNC

Os pacotes aprovados são vendidos em USDT, sem bônus ou descontos adicionais:

| Pacote | Quantidade | Valor |
|---|---:|---:|
| Inicial | 1.000 MNC | US$ 10 |
| Intermediário | 5.000 MNC | US$ 50 |
| Avançado | 10.000 MNC | US$ 100 |
| Máximo | 20.000 MNC | US$ 200 |

- Pagamento em USDT.
- O crédito de MNC ocorre após a confirmação do pagamento.
- Os valores correspondem à cotação inicial de referência de US$ 0,01 por MNC.

## Regras de implementação

- Manter histórico/versionamento das cotações com data e hora de vigência.
- Registrar em cada operação financeira a cotação aplicada, a quantidade de MNC, o valor em USDT e o momento da operação.
- Não recalcular transações anteriores quando a cotação mudar.
- A cotação de referência do projeto não deve ser confundida com uma garantia de preço de mercado após a negociação na Solana.

## Escopo e pendências separadas

Este documento registra a cotação e os pacotes de compra aprovados. Ele não define, por si só, liquidez, mecanismo de formação de preço on-chain, taxas de rede, limites de compra, política de saque ou conversão de MNC para USDT. Esses pontos permanecem sujeitos às suas próprias decisões.
