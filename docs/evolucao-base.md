# Evolução permanente da base — CryptoZombies

**Implementação inicial:** 20/11/2026  
**Lançamento:** três níveis sequenciais; o nível Lendário fica para uma atualização futura.

## Níveis e custos aprovados

| Nível | Capacidade | Custo para evoluir |
|---|---:|---|
| Básico | 5 leitos | Gratuito |
| Reforçado | 10 leitos | 20 Fragmentos de Construção + 1.500 MNC |
| Avançado | 15 leitos | 40 Fragmentos de Construção + 4.000 MNC |

A evolução é permanente e não pode pular níveis. O pagamento de Fragmentos e MNC ocorre junto, somente quando ambos os saldos são suficientes. Os custos são cobrados uma única vez ao evoluir para o nível indicado.

As velocidades existentes foram preservadas: Básico 100%, Reforçado 125% e Avançado 150% da velocidade padrão.

## Representação visual

- A base continua no quadrado central já existente, com o mesmo tamanho e posição.
- A visualização é top-down, sem telhado.
- A evolução altera apenas o interior da base; não ocupa estradas nem terreno vizinho.
- Os leitos são mostrados em fileiras de cinco: 1 fileira no Básico, 2 no Reforçado e 3 no Avançado.
- Cada leito mostra visualmente se está livre ou ocupado.
- Sobreviventes em tratamento aparecem deitados nos leitos, com indicador de PV.
- Sobreviventes saudáveis em reserva aparecem em pé no pátio interno da base; a representação inclui todos, não apenas os primeiros quatro.
- Feridos na fila de espera também aparecem em pé dentro do pátio, identificados separadamente como fila, sem ocupar leito nem aparecer deitados.
- Quando um ferido é admitido, passa a aparecer deitado no leito correspondente; ao receber alta, sai do leito e retorna à reserva dentro da base.
- A capacidade visual usa o mesmo valor de slots passado ao sistema de tratamento, para não divergir da capacidade real.

## Comportamento

- O nível da base é salvo no estado local e sincronizado pelo perfil existente.
- IDs antigos de níveis são normalizados para os três níveis atuais.
- Quando um sobrevivente chega a 100% de PV, recebe alta e retorna à reserva, liberando o leito.
- A expansão não altera o limite de 15 sobreviventes em combate.
