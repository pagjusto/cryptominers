# Cripto Myners — Modelo contábil do ROI

## Separação de painéis

### Jogador
O simulador individual apresenta somente dados da própria conta:
- gastos próprios com baús e melhorias;
- produção estimada/real de MNC;
- valor de referência em USDT, identificado como estimativa;
- retorno bruto, ROI e prazo estimado de retorno;
- períodos de 30, 60 e 90 dias.

O jogador não recebe dados de receita, custos, reservas, passivos ou lucro da empresa.

### Empresa — exclusivo do administrador
O painel administrativo consolida:
- receitas efetivamente recebidas por venda de baús, assinaturas/serviços e anúncios;
- compras, taxas de pagamento, custos de infraestrutura e operação;
- MNC emitida e obrigações/recompensas ainda não liquidadas;
- fundos de sustentabilidade e demais reservas;
- resultado operacional, lucro/prejuízo e margem.

Acesso deve ser autorizado no backend por papel/permissão administrativa. Ocultar uma rota ou componente no frontend não é controle de acesso. Nenhum dado financeiro administrativo pode ser enviado ao cliente comum.

## Regras contábeis

1. Receita bruta é o valor confirmado recebido, não o preço anunciado nem uma tentativa de checkout.
2. Estornos, chargebacks, taxas de rede, taxas de pagamento e reembolsos devem ser registrados separadamente.
3. Receita de anúncios só entra após confirmação server-to-server do provedor.
4. MNC emitida é obrigação/ emissão do ecossistema e deve ser exibida separada de receita em USDT. Não converter emissão em receita da empresa usando a referência de US$ 0,01.
5. A referência 1 MNC = US$ 0,01 serve apenas para simulação individual; não é cotação garantida, caixa recebido nem receita contábil.
6. Reservas e fundos de sustentabilidade são alocações de caixa/receita, não custos operacionais automaticamente. O painel deve mostrar resultado operacional antes e depois das alocações.
7. Lucro operacional = receitas confirmadas - custos efetivos - taxas - reembolsos - despesas operacionais reconhecidas.
8. Margem operacional = lucro operacional / receita confirmada, quando a receita for maior que zero.
9. O painel deve permitir filtros por período e moeda, sem somar moedas diferentes sem conversão documentada.
10. Registros financeiros devem ser imutáveis/auditáveis, com identificador, origem, usuário/conta, timestamp, moeda, valor, status e referência externa quando aplicável.

## Modelo de evento financeiro

Cada lançamento deve conter:
- id único e idempotente;
- tipo (chest_sale, doctor_plan_sale, ad_revenue, payment_fee, refund, chargeback, infrastructure_cost, operational_cost, mnc_issuance, reserve_allocation);
- direção (inflow/outflow/memo);
- valor numérico positivo e moeda explícita (USDT, USD, MNC ou outra);
- status (pending, confirmed, failed, reversed);
- occurredAt e recordedAt;
- source/provider e externalReference;
- userId quando associado a jogador;
- metadados para auditoria.

Somente lançamentos confirmados entram nos totais realizados. Previsões devem aparecer em bloco separado.

## Limites e segurança

- A autenticação/ autorização administrativa deve ser validada no servidor/backend em cada leitura e escrita.
- Não usar localStorage, configuração local, estado React ou flag enviada pelo navegador como prova de função administrativa.
- Não armazenar credenciais ou segredos no frontend.
- Até existir backend com autenticação e ledger confiável, qualquer painel de empresa é apenas protótipo e não pode ser considerado contabilidade real.

## Pendências de implementação
- Conectar o ledger a webhooks verificados de checkout e anúncios.
- Definir a fonte oficial de custos operacionais e o regime de reconhecimento.
- Definir percentuais e regras de alocação das reservas.
- Criar endpoints com autorização administrativa e trilha de auditoria.
- Validar reconciliação de pagamentos, estornos e saldos antes de habilitar o painel real.
