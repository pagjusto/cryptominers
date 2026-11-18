# Pagamentos — etapa futura

## Fora do escopo desta fase

Por decisão de produto, todos os pagamentos serão desenvolvidos em uma única etapa posterior. Até lá, não implementar checkout, cobrança, débito de saldo, depósitos, saques ou renovação financeira.

## Packs de baús — preços de referência aprovados

Os packs são comprados como um conjunto, mas cada baú é entregue separadamente ao inventário e deve ser aberto individualmente. O tamanho do pack não altera as probabilidades de raridade de cada abertura.

| Pack | Quantidade de baús | Desconto | Preço final |
|---|---:|---:|---:|
| Individual | 1 | 0% | US$ 32,99 |
| Iniciante | 5 | 5% | US$ 156,72 |
| Intermediário | 10 | 10% | US$ 296,95 |
| Avançado | 15 | 12% | US$ 435,53 |

Base matemática: o preço final do pack Avançado, US$ 435,53 com 12% de desconto, corresponde a um preço-base total aproximado de US$ 494,92 para 15 baús (aproximadamente US$ 32,9947 por baú antes dos descontos). Os valores dos packs menores são calculados sobre a mesma referência, com descontos de 0%, 5% e 10%.

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
