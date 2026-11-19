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
