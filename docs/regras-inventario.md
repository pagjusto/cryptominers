# Regras do inventário — CryptoZombies

Este documento registra as regras aprovadas para agrupamento de itens no inventário.

## Agrupamento de itens (stack)

- Itens do mesmo tipo são agrupados em um único slot do inventário, com a quantidade acumulada exibida.
- Baús iguais acumulam no mesmo slot; baús de tipos diferentes ocupam slots separados. Por exemplo, Baú do Boss e Baú de Herói não se misturam.
- Fragmentos de Construção acumulam em um único slot, exibindo o saldo total.
- Poções do Rejuvenecimento acumulam em um único slot, exibindo a quantidade total.
- Ao receber mais unidades de um item que já possui um slot compatível, a quantidade desse slot aumenta, sem criar outro slot para o mesmo tipo de item.
- O agrupamento reduz o espaço visual/ocupado no inventário; não altera a quantidade de itens recebidos, suas probabilidades de obtenção, seu funcionamento ou suas regras de uso.

## Escopo

Estas regras definem o comportamento esperado do inventário. A implementação no código deve respeitar o agrupamento por tipo de item e preservar os dados já existentes dos jogadores durante qualquer migração ou adaptação do armazenamento.
