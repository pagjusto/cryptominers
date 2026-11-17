# ⛏️ Cripto Myners — Web3 Mining Idle Game

![Cripto Myners Banner](public/miners/all_miners_banner.png)

> **Cripto Myners** é um jogo Web3 idle de mineração e estratégia com estética pixel art retrô. Desenvolvido em **React 19**, **Vite** e **Canvas**, o jogo implementa mapas individuais por jogador, economia dinâmica sustentável baseada em **Minercoin (MNC)**, sistema de heróis mineradores, casas de repouso, baús de construção e simulador completo de ROI.

---

## 🌟 Principais Funcionalidades

### 1. 🗺️ Mapas Individuais & Jazidas Dinâmicas
- **Mapas Isolados**: Cada jogador possui seu próprio mapa exclusivo associado à sua conta, garantindo independência total de ciclo e desempenho para milhares de usuários simultâneos.
- **Geração de Jazidas (Até 20 simultâneas)**:
  - 🪨 **Pedra**: 50%
  - 🪙 **Ouro**: 25%
  - 💎 **Diamante**: 17%
  - ❇️ **Esmeralda**: 8%
- **Desacoplamento Visual vs Econômico**: As jazidas são elementos visuais dinâmicos de ambientação. A economia é calculada no motor de mineração independente da aparência visual da jazida.
- **Renovação Contínua de Ciclos**: Ao concluir o trabalho nas 20 jazidas, um novo ciclo se inicia automaticamente com novas posições aleatórias sem colisões.

### 2. 💰 Economia Oficial da Minercoin (MNC)
- **Cotação Oficial do Projeto**: **1 MNC = US$ 0,01** (100 MNC = US$ 1,00).
- **Cotação Dinâmica**: Ajustável pelo administrador no painel administrativo, refletindo imediatamente em todo o jogo (preço de baús, recompensas, projeções de ROI e saques).
- **Recompensas Justas**: Produção em MNC baseada nos atributos dos heróis (Power, Speed, Stamina) e multiplicadores de casa.

### 3. ⚔️ Sistema de Heróis Mineradores
- **Limite de Mineração**: Até **15 heróis ativos** minerando simultaneamente por mapa.
- **Raridades e Multiplicadores**:
  - ⚪ **Comum** (1×)
  - 🔵 **Raro** (1,5×)
  - 🟣 **Épico** (2×)
  - 🟡 **Lendário** (3×)
- **Revezamento Automático**: Heróis sem energia descansam automaticamente e dão lugar aos heróis recuperados da reserva.

### 4. 📦 Sistema de Baús de Construção & Fragmentos
- **Aparição Automática**: A cada 1 hora de mineração válida, calcula a chance de drop baseada nos heróis ativos.
- **Teto de Probabilidade**: Máximo de **10% de chance por conta** em cada ciclo de 1 hora.
- **Limite Diário**: Máximo de **3 Baús de Construção por dia** por jogador, com renovação à meia-noite (horário de Brasília - America/Sao_Paulo).
- **Recompensa Garantida**: Cada baú concede **1 Fragmento de Construção**, utilizado na evolução das casas.

### 5. 🏡 Casas de Repouso
- Aceleração da recuperação de energia dos heróis.
- Evolução por níveis utilizando Fragmentos de Construção e MNC.
- Níveis: *Tiny House*, *Basic House*, *Comfort House*, *Mansion*, *Villa*, *Palace*.

### 6. 📊 Menu Estatísticas & Simulador de ROI (3 Cenários)
- **5 Abas de Análise Detalhada**:
  1. **Visão Geral**: Métricas consolidadas da conta.
  2. **Desempenho**: Detalhamento herói por herói.
  3. **Simulador de Upgrades**: Simulação do impacto de melhorias de casas e heróis.
  4. **Simulador de ROI (Baús & Casas)**: Projeções completas em **3 Cenários**:
     - 🔴 **Conservador** (Mínimo garantido)
     - 🟡 **Esperado** (Média ponderada)
     - 🟢 **Otimista** (Teto estatístico)
     - Comparativo lado a lado e projeções de retorno acumulado (30d, 60d, 90d, 180d).
  5. **ROI Real da Conta**: Histórico real de investimento vs retorno monetário.

### 7. 💳 Perfil, Carteira Web3 & Saques com Taxa Regressiva
- Conexão de carteira (MetaMask / Web3).
- Saques de MNC convertidos com base na cotação oficial em USD.
- **Tabela Regressiva de Taxas de Saque**:
  - **15%**: Menos de 50% do investimento recuperado.
  - **10%**: Entre 50% e 100% do investimento recuperado.
  - **5%**: Mais de 100% do investimento recuperado (pós-breakeven).

### 8. 🛠️ Painel Administrativo
- Configuração de probabilidades de drop de baús de construção e taxa-base.
- Cotação em tempo real de 1 MNC em USDT.
- Gestão de anúncios premiados (Rewarded Ads).
- Ajustes de parâmetros da economia e mineração.

---

## 🚀 Instalação e Execução

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior
- [npm](https://www.npmjs.com/) ou [pnpm](https://pnpm.io/)

### Passo a Passo

```bash
# 1. Clonar o repositório
git clone https://github.com/SEU_USUARIO/cripto-myners.git

# 2. Entrar na pasta do projeto
cd cripto-myners

# 3. Instalar as dependências
npm install

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse a aplicação no navegador em: `http://localhost:5173/` (ou na porta informada pelo terminal).

---

## 🧪 Testes Automatizados

O projeto conta com suíte de testes unitários para verificação de regras econômicas, escalabilidade e mecânica de mapas:

```bash
npm test
```

### Cobertura dos Testes:
- ✅ Cotação oficial `1 MNC = US$ 0,01` e cálculos de breakeven.
- ✅ Escala de taxas de saque regressivas (15%, 10%, 5%).
- ✅ Mapas individuais e isolamento de ciclo entre jogadores.
- ✅ Distribuição Monte Carlo das 4 jazidas (Pedra 50%, Ouro 25%, Diamante 17%, Esmeralda 8%).
- ✅ Suporte a 1.000 jogadores simultâneos gerando mapas em menos de 600ms.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Efeitos**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Engine Gráfica**: HTML5 Canvas 2D & Spritesheets customizados

---

## 📄 Licença

Este projeto é desenvolvido para a plataforma **Cripto Myners**. Todos os direitos reservados.
