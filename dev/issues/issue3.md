# Issue 3: Tornar a aplicação responsive — aside de escolhas como dropdown

**Problema:** O layout atual (desktop-first) apresenta as dimensões na área central e o painel lateral (`aside`) com as 10 escolhas fixo à esquerda. Em ecrãs pequenos (mobile / tablet) isto é inutilizável — o painel lateral occupa demasiado espaço ou nem cabe.

**Objetivo:** Tornar a app totalmente responsive. Em particular, o painel lateral de escolhas (`aside` em `VotacaoApp.tsx`) deve transformar-se num **dropdown/bottom sheet** que pode ser aberto/fechado pelo utilizador.

## Comportamento esperado

### Desktop (≥lg / ~1024px)
- Manter o layout atual: aside fixo à esquerda, dimensões à direita.

### Tablet / Mobile (< lg)
- O painel lateral deixa de ser visível por defeito.
- Aparece um botão flutuante ou barra superior (ex: "As minhas escolhas (3/10)") que, ao clicar, abre um **dropdown / drawer** por baixo ou por cima.
- Dentro do dropdown:
  - Lista das escolhas (com possibilidade de remover).
  - Barra de progresso 3/10.
  - Botão **Submeter votação** (bloqueado enquanto não tiver 10).
- Ao clicar fora ou num botão "Fechar", o dropdown fecha.
- A seção de dimensões deve usar a largura total disponível e os cards de medidas devem manter-se tocáveis.

## Ficheiros prováveis a alterar
- `astro-app/src/components/VotacaoApp.tsx` — layout principal e painel lateral.

## Notas
- Manter o estado `escolhas` e lógica de `toggleMedida`/`submit` inalterados — apenas mudar a forma como se apresentam.
- Garantir que o modal "Como funciona" continua a funcionar bem em mobile.
