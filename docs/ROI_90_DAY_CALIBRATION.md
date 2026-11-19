# Cripto Myners — Calibração econômica do ROI em 90 dias

## Objetivo aprovado

No cenário favorável, um jogador deve poder recuperar aproximadamente o investimento inicial ao longo de 90 dias. A meta não é prometer retorno nem impor um teto rígido à produção: é uma referência de balanceamento para calibrar produção efetiva, combate, recuperação e disponibilidade.

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
- cenário favorável próximo de 15.380 MNC acumulados em 90 dias;
- cenários normal e desfavorável com resultados próprios, derivados das regras configuradas;
- memória de cálculo auditável, com cada fator de disponibilidade/produção visível;
- nenhum rendimento garantido e nenhuma conversão de MNC tratada como caixa sem liquidação real.

Este documento define a meta de calibração aprovada. Não altera por si só as taxas de emissão, o combate ou os valores de produção do jogo.
