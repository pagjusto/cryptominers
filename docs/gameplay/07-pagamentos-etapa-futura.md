# Pagamentos — etapa futura

## Fora do escopo desta fase

Por decisão de produto, todos os pagamentos serão desenvolvidos em uma única etapa posterior. Até lá, não implementar checkout, cobrança, débito de saldo, depósitos, saques ou renovação financeira.

## Packs de baús — preços de referência aprovados

Os packs são comprados como um conjunto, mas cada baú é entregue separadamente ao inventário e deve ser aberto individualmente. O tamanho do pack não altera as probabilidades de raridade de cada abertura.

| Pack | Quantidade de baús | Preço de referência | Preço promocional | Desconto |
|---|---:|---:|---:|---:|
| Individual | 1 | US$ 32,99 | US$ 32,99 | 0% |
| Iniciante | 5 | De US$ 164,97 | por US$ 156,72 | 5% |
| Intermediário | 10 | De US$ 329,95 | por US$ 296,95 | 10% |
| Avançado | 15 | De US$ 494,92 | por US$ 435,53 | 12% |

Na apresentação visual da loja, exibir o preço de referência riscado, o preço promocional em destaque e o percentual de desconto. Para o pack Individual, exibir apenas o preço de US$ 32,99, sem selo de desconto.

Base matemática: o preço final do pack Avançado, US$ 435,53 com 12% de desconto, corresponde a um preço-base total aproximado de US$ 494,92 para 15 baús. Os valores dos packs menores seguem a mesma referência unitária, com descontos de 5% e 10%.

Os preços acima são parâmetros comerciais aprovados para planejamento. A implementação de checkout, cobrança, débito de saldo e entrega paga dos baús permanece reservada à etapa conjunta de pagamentos.

## Itens reservados para a etapa conjunta

- Contratação e renovação do médico (USDT ou MNC).
- Renovação automática do médico, com MNC apenas.
- Compra de baús e demais itens pagos.
- Depósitos e saques.
- Carteira e movimentações de saldo.
- Pagamentos e liquidação do Marketplace.
- Comissões e demais transações financeiras.

## Regras já planejadas para o médico

- O jogador poderá escolher USDT ou MNC na contratação manual.
- A renovação automática, se habilitada, será somente em MNC.
- Não haverá débito automático em USDT.
- Se não houver MNC suficiente no vencimento, a renovação automática falha e o médico é desativado imediatamente.
- Ao vencer, o médico para imediatamente; o jogador poderá contratar novamente depois.

Essas regras estão registradas para planejamento, mas não autorizam a implementação de cobrança nesta fase.
