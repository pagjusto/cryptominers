# Cripto Myners — Especificação Mestre do Jogo

> Documento-base consolidado a partir das decisões registradas no projeto e das regras já implementadas/documentadas na branch. Não transformar estimativas em promessa de rendimento.

## 1. Identidade e direção
- Nome: **Cripto Myners**.
- Tema: sobrevivência em apocalipse zumbi; mapa pixel art em visão superior e combate automático contra ondas.
- A moeda do ecossistema permanece Minercoin (MNC).

## 2. Equipe e combate
- O jogador monta uma equipe de sobreviventes.
- **A equipe de combate tem no máximo 15 vagas por jogador. Esse limite é fixo e não aumenta com compras, raridade, melhorias ou qualquer outro upgrade.** Sobreviventes extras permanecem no inventário/reserva.
- Ao chegar a **5% de vida**, o sobrevivente deixa o combate e entra no fluxo de feridos; não há morte permanente por esse evento.
- Sobreviventes feridos não produzem MNC. Se não houver sobreviventes ativos em combate, a produção pausa.
- A produção não é retroativa durante pausas ou períodos offline. Sobreviventes saudáveis produzem enquanto estiverem em combate e conectados.
- O médico é um serviço: não ocupa vaga, não luta, não produz MNC, não cria leitos e não acelera a recuperação.

## 3. Enfermaria, abrigo e recuperação
- **O ambulatório também tem no máximo 15 vagas de recuperação simultâneas por jogador. Esse limite é independente das 15 vagas da equipe e não pode ser aumentado por compras ou melhorias.**
- Portanto, cada jogador possui dois limites separados: até 15 sobreviventes na equipe e até 15 sobreviventes em recuperação simultânea no ambulatório. Sobreviventes sem vaga aguardam em fila FIFO; os que ocupam vagas recuperam simultaneamente.
- Ao recuperar 100% da vida, o sobrevivente sai da vaga de recuperação e vai para a reserva. A entrada na equipe depende das vagas de combate disponíveis.
- Sem médico, o jogador online decide individualmente quando enviar cada ferido à enfermaria.
- Com médico ativo, o resgate de feridos é automático enquanto o jogador está online; o limite de 15 vagas simultâneas do ambulatório continua valendo e os demais aguardam na fila.
- Ao perder conexão/ficar offline, a produção para e os sobreviventes que estavam ativos são enviados automaticamente ao fluxo do ambulatório, mesmo sem médico. Se as 15 vagas estiverem ocupadas, aguardam na fila.
- O médico não altera a lista de participantes de um Boss congelada no início do evento.
- Referência de níveis do ambulatório: Básico 5 vagas/100%; Reforçado 10/125%; Avançado 15/150%. O limite absoluto permanece em 15 vagas; não existe nível de 20 vagas. Custos e materiais permanecem pendentes de validação.
- O abrigo básico inicial é gratuito. Custos das próximas melhorias ainda precisam ser confirmados.

## 4. Heróis e raridades
- Seis raridades: Comum, Raro, Super Raro, Épico, Lendário e Super Lendário.
- Elenco planejado: 12 heróis, dois por raridade, sem contar o médico.
- Heróis da mesma raridade compartilham parâmetros; classes/identidades não concedem bônus na versão inicial.
- Sistema de estrelas adiado.
- HP, dano e recuperação finais dependem da tabela de balanceamento validada.

## 5. Produção de Minercoin
- Referência de planejamento: **1 MNC = US$ 0,01**, sem garantia de preço, liquidez, conversão ou saque.
- Produção-base por sobrevivente em 24 horas válidas de combate:
  - Comum: 20,88 MNC/dia
  - Raro: 31,32 MNC/dia
  - Super Raro: 36,54 MNC/dia
  - Épico: 41,76 MNC/dia
  - Lendário: 62,64 MNC/dia
  - Super Lendário: 83,52 MNC/dia
- Calcular por segundo com precisão decimal e acumular frações; arredondar somente para exibição/contabilização.
- Não existe recompensa separada por abate. A produção continua durante Boss sob as condições normais.
- Abrigo não aumenta mineração. Médico não aumenta mineração. Não há mineração offline nem compensação retroativa.

## 6. Baús de heróis e compras
- Compras de baús diretamente em **USDT**; produção de MNC é um fluxo separado.
- Tipos, quantidades, preços e probabilidades devem ficar em configuração única e ser validados antes de publicação.
- Anúncio recompensado concede bônus moderado de raridade; estrutura aprovada, percentuais exatos ainda precisam ser conferidos.
- Não anunciar retorno financeiro garantido nem lucro individual garantido.

## 7. Boss global e Baú de Construção
- Boss global: **4 vezes por dia**, intervalos de **6 horas**; primeiro horário diário aleatório e variável.
- Calendário compartilhado no fuso de Brasília (America/Sao_Paulo).
- Cada confronto dura **5 minutos**; o relógio não pausa por desconexão.
- O jogador precisa participar no início e reconectar antes do fim para manter elegibilidade.
- A lista de sobreviventes elegíveis é congelada no início. Sobreviventes originais feridos/deslocados continuam elegíveis se estiverem vivos ao final e o jogador mantiver participação; substitutos posteriores não entram no sorteio.
- Dano causado ao Boss não altera a chance de Baú de Construção.
- Chance individual por sobrevivente: Comum 2,00%; Raro 2,20%; Super Raro 2,2667%; Épico 2,3333%; Lendário 2,6667%; Super Lendário 3,00%.
- Chances somadas, com teto de **40% por jogador por Boss**.
- No máximo 1 Baú de Construção por jogador por Boss e limite documentado de 3 por dia.
- Cada Baú de Construção concede 1 Fragmento de Construção garantido e tem 2% de chance independente de conceder também 1 Baú de Herói.
- Falhas globais do servidor e ausência de sobreviventes elegíveis precisam de regra operacional antes do lançamento.

## 8. Médico
- Planos documentados como referência: 30 dias — US$ 5,20 ou 520 MNC; 90 dias — US$ 13,80 ou 1.380 MNC; 180 dias — US$ 25,00 ou 2.500 MNC.
- Contratação/pagamento dependem de integração confiável de backend/checkout.
- Renovação automática somente em MNC; não debitar USDT automaticamente.
- Preços e disponibilidade comercial precisam ser confirmados antes da cobrança pública.

## 9. Modelo de negócio e sustentabilidade
- Fontes de receita: anúncios, compras dentro do jogo e venda de baús.
- Objetivo: margem agregada positiva para o jogo no horizonte de planejamento, considerando população, custos, recompensas e receitas.
- Não prometer que cada jogador recuperará investimento em 90 dias; resultados individuais variam.
- Separar receitas, obrigações, reservas e fundos de sustentabilidade antes de calcular lucro distribuível.
- Receita de anúncios destinada ao Fundo de Sustentabilidade conforme configuração atual (100%).
- Simulador deve modelar cada baú separadamente e depois uma mistura de jogadores, incluindo custos, reservas, margem e sensibilidade. Receita bruta não é lucro.

## 10. Simulador e parâmetros
- Sessão de planejamento configurável de 1 a 24 horas/dia; não significa mineração offline.
- Não aplicar desconto fixo de disponibilidade de 60% como regra do jogo.
- ROI de 90 dias é meta estatística de planejamento, não garantia individual.
- Composição mediana histórica documentada (6 comuns, 4 raros, 4 épicos e 1 lendário) soma 480,24 MNC/dia; não inclui Super Raro e Super Lendário e não deve ser tratada como média atual.
- Projeções devem distinguir produção bruta, valor de referência, custos, lucro líquido e prazo estimado.

## 11. Pendências antes da economia definitiva
1. Confirmar preços e probabilidades finais dos baús e bônus de anúncio.
2. Validar atributos completos das seis raridades.
3. Fechar custos e materiais de cada abrigo.
4. Confirmar regra comercial e limites do médico.
5. Definir regras para falha do servidor e ausência de elegíveis no Boss.
6. Modelar custos operacionais, receita de anúncios, compras, reservas e distribuição.
7. Validar pagamentos, saldos, sorteios e estado competitivo no backend; estado local do navegador não é fonte confiável.
