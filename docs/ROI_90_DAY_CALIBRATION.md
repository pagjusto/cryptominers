# Cripto Myners — Calibração econômica do ROI em 90 dias

## Objetivo corrigido após esclarecimento

O chamado cenário favorável é a composição de equipe de referência já discutida (6 Comuns, 4 Raros, 4 Épicos e 1 Lendário), não uma equipe comum ou facilmente obtida. O usuário considera essa composição difícil de conseguir com as probabilidades atuais, o que reduz a frequência de jogadores alcançando a produção teórica alta e ajuda a preservar a margem econômica do jogo.

A equipe de referência deve ser tratada como um cenário de equipe forte/difícil de obter, e não como mediana estatística da distribuição de raridades. Não ajustar a produção dessa equipe para 170,89 MNC/dia apenas para forçar payback em 90 dias. Primeiro calcular o resultado efetivo dessa composição com as regras reais de combate, recuperação, presença online e fila de 15 leitos; depois comparar a frequência de obtenção da composição e o custo esperado dos baús.

A meta de 90 dias é uma referência de análise do cenário de equipe difícil, não um teto rígido de produção nem uma promessa de retorno.

## Exemplo-base

- Investimento inicial considerado: US$ 153,80.
- Cotação de referência usada apenas na simulação: 1 MNC = US$ 0,01.
- Horizonte: 90 dias.
- Valor equivalente para recuperar o investimento: 15.380 MNC.
- Produção média necessária: 170,8889 MNC/dia (aproximadamente 170,89 MNC/dia).

Fórmula:

`MNC/dia necessário = investimento_USDT / (dias × preço_referência_MNC)`

## Comparação com a equipe histórica de referência

Composição usada no simulador: 6 Comuns, 4 Raros, 4 Épicos e 1 Lendário.

| Raridade | Quantidade | MNC por sobrevivente/dia | Total MNC/dia |
|---|---:|---:|---:|
| Comum | 6 | 20,88 | 125,28 |
| Raro | 4 | 31,32 | 125,28 |
| Épico | 4 | 41,76 | 167,04 |
| Lendário | 1 | 62,64 | 62,64 |
| **Total** | **15** | | **480,24** |

- Produção teórica em 90 dias: 43.221,60 MNC.
- Valor de referência: US$ 432,22.
- Fator efetivo médio necessário para chegar à meta de 170,89 MNC/dia: aproximadamente 35,58% da produção teórica.
- A diferença entre produção teórica e meta não deve ser implementada como um multiplicador arbitrário. Ela precisa resultar de regras de jogo reais, transparentes e testáveis.

## Regras de calibração

1. O cenário favorável deve se aproximar do retorno do investimento em 90 dias, sem ultrapassar significativamente essa meta no modelo-base.
2. O cenário normal deve ter prazo de retorno superior ao cenário favorável.
3. O cenário desfavorável deve refletir menor disponibilidade/eficiência e prazo maior, sem apresentar resultados como garantidos.
4. Exibir separadamente produção bruta em MNC, valor estimado pela cotação de referência, investimento e ROI estimado.
5. Não chamar a diferença bruta de lucro líquido. Taxas, custos do jogador, liquidez e possibilidade de conversão precisam ser identificados separadamente.
6. O painel da empresa permanece exclusivo do administrador e deve contabilizar receitas efetivamente recebidas, custos, reservas e emissão de MNC separadamente.
7. Não tratar a referência de US$ 0,01 por MNC como preço garantido, caixa recebido ou receita contábil da empresa.


## Probabilidade da equipe de referência por baú (cálculo inicial)

Equipe-alvo de 15 sobreviventes: 6 Comuns, 4 Raros, 4 Épicos e 1 Lendário. Super Raros e Super Lendários: zero na composição-alvo.

Os cálculos abaixo usam as probabilidades `normalProbabilities` atualmente presentes em `src/data/criptoMynersConfig.js`, assumindo sorteios independentes e a mesma distribuição em cada herói do pacote. Não usam o bônus de anúncio.

| Baú | Probabilidades usadas (Comum / Raro / Épico / Lendário) | Heróis considerados | Evento calculado | Chance |
|---|---|---:|---|---:|
| Miner | 80% / 15% / 4% / 1% | 15 aberturas individuais | composição exata 6/4/4/1 | 0,001071% (aprox. 1 em 93.349) |
| Explorer | 76% / 16% / 6% / 2% | 3 baús = 15 heróis | composição exata 6/4/4/1 | 0,010321% (aprox. 1 em 9.689) |
| Elite | 72% / 17% / 8% / 3% | 2 baús = 20 heróis | pelo menos 6 Comuns, 4 Raros, 4 Épicos e 1 Lendário entre os 20; os 5 restantes podem ser de qualquer raridade | 0,834344% (aprox. 1 em 120 pares de baús) |
| Legendary | 68% / 18% / 9% / 5% | 1 baú = 15 heróis | composição exata 6/4/4/1 | 0,107356% (aprox. 1 em 931) |

### Como interpretar

- O baú Elite foi calculado com 20 heróis porque cada unidade entrega 10; o evento pede que a equipe-alvo possa ser formada entre esses 20, deixando 5 excedentes/reserva.
- Para Miner, Explorer e Legendary, o cálculo considera exatamente 15 heróis. Para Explorer são necessárias três unidades; para Miner, quinze unidades individuais.
- As chances são probabilidades de uma abertura/pacote isolado com essas condições, não uma promessa nem uma estimativa do tempo até um jogador conseguir a composição. Jogadores podem combinar heróis de várias compras, trocar/selecionar sobreviventes ou obter recompensas por outros meios; esses mecanismos alteram a probabilidade acumulada.
- Os preços atuais no arquivo são Miner US$ 10, Explorer US$ 15, Elite US$ 95 e Legendary US$ 140. Isso implica custo nominal dos lotes comparados de US$ 150 (15 Miner), US$ 45 (3 Explorer), US$ 190 (2 Elite, 20 heróis) e US$ 140 (1 Legendary). Preços e probabilidades ainda precisam ser confirmados como definitivos.
- O cálculo não inclui `adBonusProbabilities`, promoções, garantias de raridade, pity, fragmentos, mercado secundário ou seleção manual.
- As probabilidades configuradas nos baús não são iguais às probabilidades globais em `src/utils/cryptozombiesEconomy.js`. Antes do lançamento, deve existir uma única fonte de verdade para cada tipo de baú e para os sorteios gerais.

### Fórmula

Para 15 heróis e contagens exatas, a chance é a probabilidade multinomial:

`15! / (6! × 4! × 4! × 1!) × p_comum^6 × p_raro^4 × p_epico^4 × p_lendario`

Para Elite, com 20 heróis, foi calculada a probabilidade acumulada de atingir pelo menos as quatro contagens-alvo, somando todos os resultados possíveis para os cinco heróis excedentes.


## Pendências obrigatórias antes de alterar a produção real

O código atual do simulador de ROI usa uma aproximação de HP, duração de combate, recuperação e ondas de leitos. Essa aproximação não deve ser considerada regra oficial nem ser usada para reduzir produção automaticamente.

Antes de calibrar os atributos reais, definir e validar:
- dano recebido por segundo/ataque e sua relação com HP;
- se energia e HP são sistemas separados e como cada um interrompe o trabalho;
- tempo real para chegar ao limiar de 5% de HP por raridade;
- duração real de recuperação por raridade e efeito dos abrigos;
- capacidade fixa de 15 leitos, fila FIFO e comportamento com ambulatório cheio;
- disponibilidade de sessão do jogador, sem produção offline;
- efeito exato do médico e dos upgrades, sem permitir que aumentem os limites fixos de equipe/leitos.

A lógica de fila deve simular os 15 leitos simultâneos e a fila FIFO individualmente. Não multiplicar simplesmente o tempo médio de recuperação por `ceil(totalHeroes / beds)`, pois isso pode distorcer o tempo de espera e a produção.

## Critério de aceite do simulador

Para o investimento-exemplo de US$ 153,80, o simulador deve mostrar:
- o resultado da equipe forte de referência (6 Comuns, 4 Raros, 4 Épicos e 1 Lendário), sem rebaixar artificialmente sua produção para caber em 90 dias;
- cenários de equipe menos rara com resultados próprios, derivados das regras configuradas;
- a probabilidade/custo esperado de obter a composição forte, calculados a partir das probabilidades efetivamente usadas pelo baú comprado;
- memória de cálculo auditável, com cada fator de disponibilidade/produção visível;
- nenhum rendimento garantido e nenhuma conversão de MNC tratada como caixa sem liquidação real.

Este documento registra a meta e a correção de interpretação. Não altera por si só as taxas de emissão, o combate ou os valores de produção do jogo.
