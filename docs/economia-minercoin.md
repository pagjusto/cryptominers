# Economia oficial da moeda do jogo — Coins

Status: **decisões aprovadas pelo usuário em novembro de 2026**.

> **Nomenclatura oficial:** a moeda do jogo será identificada apenas como **Coins**. Não utilizar Coins, Coins ou Coins como nome, ticker ou símbolo exibido ao jogador. Identificadores técnicos legados no código podem permanecer temporariamente até uma migração segura, mas a interface e a documentação devem apresentar somente Coins.

## Cotação de referência

- Cotação interna de referência: **1 Coins = US$ 0,01**.
- Equivalência: **100 Coins = US$ 1,00**.
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
| Inicial | 1.000 Coins | US$ 10 |
| Intermediário | 5.000 Coins | US$ 50 |
| Avançado | 10.000 Coins | US$ 100 |
| Máximo | 20.000 Coins | US$ 200 |

- Pagamento em USDT.
- O crédito de Coins ocorre após a confirmação do pagamento.
- Os valores correspondem à cotação de referência de US$ 0,01 por Coins.

## Saques — decisões aprovadas

- O saldo de Coins será convertido para USDT usando a cotação interna definida de **1 Coins = US$ 0,01**.
- **Saque mínimo: 40 USDT**, equivalente a **4.000 Coins** pela cotação de referência.
- A rede escolhida para os saques de USDT é **Solana**, utilizando o padrão/token **SPL**.
- A carteira de destino será uma carteira compatível com USDT na rede Solana.

### Taxa de rede (gas) — decisão aprovada

- **O projeto paga a taxa de rede (gas)** da transferência de USDT pela Solana.
- O jogador **não terá um desconto adicional** no valor do saque por causa do gas.
- O custo efetivo do gas deverá ser registrado individualmente no histórico/detalhamento de cada saque.
- Esse custo será pago pelo projeto **com os recursos arrecadados por meio da taxa percentual de saque**; portanto, o gas reduz a parcela líquida dessa taxa que fica com o projeto.
- O registro do saque deverá permitir identificar, separadamente, o valor bruto, a taxa percentual cobrada do jogador, o custo de gas pago pelo projeto e o valor líquido recebido pelo jogador.
- O custo do gas não deve ser somado novamente à cobrança do jogador nem abatido do valor líquido que ele recebe.

### Prazo de permanência dos créditos e ordem de utilização — decisões aprovadas

- Cada crédito de Coins terá seu próprio prazo de permanência, contado individualmente a partir da data e hora em que aquele crédito for registrado na conta do jogador.
- Créditos realizados em momentos diferentes manterão prazos independentes; um crédito novo não reinicia nem altera o prazo dos créditos anteriores.
- Em um saque, serão consumidos primeiro os créditos mais antigos, seguindo a ordem **FIFO (First In, First Out)**.
- Quando um saque utilizar créditos com tempos de permanência diferentes, a taxa aplicável deverá respeitar a idade de cada lote, em vez de aplicar uma única idade global ao saldo inteiro.

### Taxa regressiva de saque — percentuais e faixas aprovados

A taxa é definida pelo tempo de permanência de cada lote de Coins utilizado no saque:

| Tempo de permanência do lote | Taxa de saque |
|---|---:|
| Até 30 dias | **20%** |
| De 31 a 60 dias | **15%** |
| De 61 a 90 dias | **10%** |
| De 91 a 120 dias | **7%** |
| Acima de 120 dias | **5%** |

- A contagem é individual por lote, desde a data e hora do crédito.
- A taxa de cada lote é aplicada somente à parcela daquele lote consumida no saque.
- Se um saque consumir mais de um lote, as taxas são calculadas separadamente sobre cada parcela e somadas para obter o desconto total do saque.
- O valor líquido enviado ao jogador corresponde ao valor bruto sacado menos a taxa percentual calculada. O gas continua sendo pago pelo projeto, sem desconto adicional ao jogador.
- Exemplo ilustrativo: se um saque utilizar parcelas de lotes com taxas diferentes, cada parcela terá sua própria taxa; não será aplicada uma taxa única sobre todo o saque.

### Tela de confirmação do saque — decisão aprovada

Antes de confirmar definitivamente um saque, o jogador deverá visualizar uma tela de revisão com o cálculo completo, incluindo:

- Valor bruto solicitado.
- Quantidade/parcelas de Coins retiradas de cada lote utilizado.
- Tempo de permanência e taxa percentual aplicada a cada lote.
- Valor descontado de taxa em cada parcela e total das taxas.
- Valor líquido final que será enviado ao jogador em USDT.
- Informação de que o gas da rede Solana é pago pelo projeto e não será descontado novamente do jogador.

O saque somente será efetivado após a confirmação explícita do jogador nessa tela. A tela deve apresentar os valores de forma clara antes da confirmação, sem esconder ou agrupar taxas de lotes diferentes em uma taxa única não explicada.

### Dupla confirmação de saque — decisão aprovada

- O jogador deverá realizar **duas confirmações obrigatórias** para autorizar um saque: uma dentro do jogo e outra pelo e-mail cadastrado na conta.
- Primeiro, o jogador revisa os valores e confirma a solicitação na tela do jogo.
- Em seguida, o sistema envia um e-mail de segurança com os dados do saque, incluindo valor bruto, taxas, valor líquido e carteira de destino, para que o jogador confira as informações.
- O saque somente será autorizado para processamento depois que o jogador clicar na ação de aprovação do próprio e-mail.
- O link de aprovação enviado por e-mail terá validade de **30 minutos** a partir do envio.
- A confirmação no jogo, isoladamente, não autoriza o processamento; da mesma forma, a aprovação por e-mail não substitui a confirmação inicial dentro do jogo.
- Se a aprovação por e-mail não for concluída, o saque não deve ser enviado à rede Solana e deve permanecer aguardando a segunda confirmação, com estado claramente identificado no histórico.
- Após as duas confirmações, o saque segue para o processamento e recebe o status **Pendente** até a confirmação da transferência na Solana.

### Status e conclusão do saque — decisão aprovada

- Após o jogador confirmar a solicitação na tela de revisão, o saque deverá receber o status **Pendente** enquanto aguarda o processamento e a confirmação da transferência na rede Solana.
- O saque somente poderá receber o status **Concluído** depois que a transferência de USDT for efetivamente confirmada na rede Solana.
- A confirmação da solicitação pelo jogador, por si só, não significa que o saque foi concluído.
- O histórico do jogador deverá apresentar o status atual do saque de forma clara.

## Política de burn

- **Não haverá mecanismo de burn de Coins por enquanto.**
- Coins utilizada em upgrades será debitada normalmente do saldo do jogador, sem queima.
- Não haverá percentual de burn nem destinação automática de uma parcela para um fundo por meio desse mecanismo.
- A decisão poderá ser reavaliada futuramente, caso a moeda passe a ter circulação externa ou integração de mercado.

## Regras de implementação e histórico

- Manter histórico/versionamento das cotações com data e hora de vigência.
- Registrar em cada operação financeira a cotação aplicada, a quantidade de Coins, o valor em USDT e o momento da operação.
- Em cada saque, registrar também o valor bruto, as parcelas de lotes consumidas, a idade de cada lote, a taxa aplicada a cada parcela, o desconto total, o custo real de gas pago pelo projeto, o valor líquido recebido pelo jogador e o status do processamento.
- Para os créditos de Coins, manter identificação individual do lote e sua data/hora de crédito, permitindo calcular o prazo de permanência e aplicar FIFO.
- Não recalcular transações anteriores quando a cotação mudar.
- Não confundir cotação interna de referência com garantia de preço de mercado após negociação on-chain.

## Itens ainda não definidos neste documento

- Liquidez disponível e mecanismo efetivo de conversão/execução on-chain.
- Detalhes técnicos do contrato/token e da integração de USDT na Solana.
