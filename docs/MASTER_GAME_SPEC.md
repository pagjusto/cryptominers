# Cripto Myners — Especificação Mestre do Jogo

> Documento-base consolidado a partir das decisões registradas no projeto e das regras já implementadas/documentadas na branch. Em caso de conflito, esta especificação identifica o que é regra aprovada, referência de planejamento ou pendência. Não transformar estimativas em promessa de rendimento.

## 1. Identidade e direção

- Nome do jogo: **Cripto Myners**.
- Tema atual: sobrevivência em apocalipse zumbi.
- Apresentação: mapa em pixel art, visão superior, combate automático contra ondas de zumbis.
- O projeto substitui a antiga direção de mineração/fantasia como tema visual e de gameplay. A moeda do ecossistema permanece Minercoin (MNC).

## 2. Equipe e combate

- O jogador monta uma equipe de sobreviventes.
- Até **15 sobreviventes** podem atuar simultaneamente.
- O combate é automático.
- Ao chegar a **5% de vida**, o sobrevivente deixa o combate e entra no fluxo de feridos; não há morte permanente por esse evento.
- Sobreviventes feridos não produzem MNC.
- Se não houver sobreviventes ativos em combate, a produção pausa.
- A produção não é retroativa durante pausas ou períodos offline.
- Sobreviventes saudáveis podem continuar produzindo enquanto estiverem em combate e o jogador estiver conectado.
- O médico é um serviço, não um combatente: não ocupa vaga, não luta, não produz MNC, não cria leitos e não acelera a recuperação.

## 3. Enfermaria, abrigo e recuperação

- O abrigo define capacidade de leitos e velocidade de recuperação.
- Quando não há leito disponível, o sobrevivente aguarda em fila FIFO.
- A recuperação dos ocupantes dos leitos ocorre simultaneamente.
- Ao recuperar 100% da vida, o sobrevivente sai do leito e vai para a reserva.
- Havendo vaga no limite de 15, a reposição pode ocorrer automaticamente.
- Sem médico, o jogador online decide individualmente quando enviar cada ferido à enfermaria.
- Com médico ativo, o resgate de feridos é automático enquanto o jogador está online, sem limite de quantidade; a capacidade física dos leitos continua valendo.
- Ao perder conexão/ficar offline, a produção para e os sobreviventes que estavam ativos são enviados automaticamente ao fluxo de enfermaria, mesmo sem médico. Ao reconectar, retornam respeitando o limite de 15; sem vaga, ficam na reserva.
- O médico não altera a lista de participantes de um Boss congelada no início do evento.
- Referência de níveis de abrigo: Básico 5 leitos/100%; Reforçado 10/125%; Avançado 15/150%; Lendário 20/200%. Custos e materiais de melhoria devem ser tratados como pendentes até validação da tabela econômica final.
- O abrigo básico inicial é gratuito. A regra de gratuidade apenas para a primeira aquisição e custos das próximas melhorias precisam permanecer explícitos no fluxo de upgrade; não presumir valores ausentes.

## 4. Heróis e raridades

- Existem seis raridades: Comum, Raro, Super Raro, Épico, Lendário e Super Lendário.
- O elenco planejado tem 12 heróis, dois por raridade, sem contar o médico.
- Na versão inicial, heróis da mesma raridade compartilham parâmetros; classes/identidades temáticas não concedem bônus de atributos ou produção.
- Sistema de estrelas adiado; não aplicar bônus de estrelas na versão atual.
- Valores finais de HP, dano e tempos de recuperação devem vir da tabela de balanceamento validada. Valores encontrados em simulações locais não são automaticamente definitivos.

## 5. Produção de Minercoin

- A moeda do jogo é **Minercoin (MNC)**.
- A referência de planejamento é **1 MNC = US$ 0,01**, sem garantia de preço, liquidez, conversão ou saque.
- Produção-base por sobrevivente em 24 horas válidas de combate:
  - Comum: 20,88 MNC/dia
  - Raro: 31,32 MNC/dia
  - Super Raro: 36,54 MNC/dia
  - Épico: 41,76 MNC/dia
  - Lendário: 62,64 MNC/dia
  - Super Lendário: 83,52 MNC/dia
- Calcular por segundo com precisão decimal e acumular frações; arredondar somente para exibição/contabilização.
- Não existe recompensa separada por abate. A produção continua durante Boss enquanto as condições normais de combate forem atendidas.
- Abrigo não aumenta mineração. Médico não aumenta mineração.
- Não há mineração offline nem compensação retroativa.

## 6. Baús de heróis e compras

- Compras de baús são realizadas diretamente em **USDT**; a produção de MNC é um fluxo separado.
- A interface já prevê pagamento em USDT ou MNC; a política comercial final deve respeitar a decisão mais recente de separar a compra de baús em USDT e não tratar MNC como receita automática de mineração.
- Tipos de baú, quantidades de heróis, preços e probabilidades precisam ser mantidos em uma única configuração e validados como tabelas completas antes de publicação.
- A abertura com anúncio recompensado concede um bônus moderado de raridade. A estrutura de bônus é aprovada; as tabelas numéricas exatas devem ser conferidas contra a decisão final registrada antes de serem tratadas como definitivas.
- Não anunciar retorno financeiro garantido nem probabilidade de lucro individual.

## 7. Boss global e Baú de Construção

- Boss global ocorre **4 vezes por dia**, com intervalos de **6 horas**; o primeiro horário diário é aleatório e muda a cada dia.
- Todos os jogadores compartilham o mesmo calendário no fuso de Brasília (America/Sao_Paulo).
- Cada confronto dura **5 minutos**. O relógio não pausa por desconexão.
- O jogador precisa estar participando no início e reconectar antes do fim para manter a elegibilidade.
- A lista de sobreviventes elegíveis é congelada no início do Boss. Sobreviventes originais feridos/deslocados continuam elegíveis se estiverem vivos ao final e o jogador mantiver participação; substitutos que entram depois não entram no sorteio.
- O dano causado ao Boss não altera a chance de Baú de Construção.
- A chance individual por sobrevivente elegível é: Comum 2,00%; Raro 2,20%; Super Raro 2,2667%; Épico 2,3333%; Lendário 2,6667%; Super Lendário 3,00%.
- As chances individuais são somadas, com teto de **40% por jogador por Boss**.
- No máximo 1 Baú de Construção por jogador em cada Boss e limite documentado de 3 por dia.
- Cada Baú de Construção concede 1 Fragmento de Construção garantido e tem 2% de chance independente de conceder também 1 Baú de Herói.
- O Baú de Herói adicional não substitui o fragmento.
- Falhas globais do servidor e o caso de nenhum sobrevivente elegível precisam de regra operacional antes do lançamento.

## 8. Médico

- Planos documentados como referência: 30 dias — US$ 5,20 ou 520 MNC; 90 dias — US$ 13,80 ou 1.380 MNC; 180 dias — US$ 25,00 ou 2.500 MNC.
- A contratação/pagamento ainda depende de integração confiável de backend/checkout.
- Renovação automática somente em MNC; não debitar USDT automaticamente.
- Preços e disponibilidade comercial devem ser confirmados antes de ativar cobrança pública.

## 9. Modelo de negócio e sustentabilidade

- Fontes de receita do jogo: anúncios, compras dentro do jogo e venda de baús.
- O objetivo econômico é manter margem agregada positiva para o jogo no horizonte de planejamento, considerando a população total, custos operacionais, recompensas e receitas.
- Não prometer que cada jogador recuperará seu investimento em 90 dias. Resultados individuais variam conforme raridade obtida, tempo válido de jogo e demais regras.
- Separar receitas, obrigações, reservas e fundos de sustentabilidade antes de calcular lucro distribuível.
- Receita de anúncios deve alimentar o Fundo de Sustentabilidade conforme configuração aprovada (100% na configuração atual).
- O simulador econômico deve modelar separadamente cada tipo de baú e depois uma mistura de jogadores/baús, mostrando cenários agregados, custos, reservas, margem e sensibilidade. Receita bruta não deve ser apresentada como lucro.

## 10. Simulador e parâmetros que não podem ser confundidos

- Sessão padrão de planejamento: até 24 horas por dia, configurável de 1 a 24 horas; isso não significa mineração offline.
- Não aplicar desconto fixo de disponibilidade de 60% como se fosse regra do jogo.
- O ROI de 90 dias é uma meta estatística de planejamento para composição mediana, não garantia individual.
- A composição mediana histórica documentada (6 comuns, 4 raros, 4 épicos e 1 lendário) soma 480,24 MNC/dia, mas não inclui as novas categorias Super Raro e Super Lendário e não deve ser confundida com uma média recalculada da distribuição atual.
- Toda projeção deve distinguir produção bruta, valor de referência em USDT, custos, lucro líquido e prazo estimado. Indicar claramente premissas e incerteza da cotação de MNC.

## 11. Pendências antes de publicar economia definitiva

1. Confirmar tabela final de preços e probabilidades de cada baú, incluindo o bônus por anúncio.
2. Corrigir/validar atributos completos de todas as seis raridades (HP, dano e recuperação).
3. Fechar custos e materiais de cada nível de abrigo, inclusive a regra de primeira aquisição gratuita.
4. Definir a regra comercial final e limites do médico.
5. Confirmar regras operacionais de falha do servidor e ausência de sobreviventes elegíveis no Boss.
6. Modelar custos de operação, receita realista de anúncios, compras e baús, reservas e distribuição.
7. Garantir que pagamentos, saldos, sorteios e estado competitivo sejam validados no backend; estado local do navegador não é fonte confiável.
