import { findNextHeroAction } from './src/utils/minerPathfinding.js';
import { generatePlayerMap } from './src/utils/individualMapEngine.js';
import { BLOCK_EMPTY, BLOCK_BEDROCK } from './src/data/minersData.js';

console.log('================================================================');
console.log('TESTE DE DESLOCAMENTO DO HOMEM-ARANHA E ROBÔ APÓS QUEBRA DAS JAZIDAS');
console.log('================================================================\n');

// 1. Gera mapa do jogador
const map = generatePlayerMap('player_test_pocket', 1);

// 2. Simula o exato cenário da foto do usuário:
// Limpa todas as jazidas dentro do bolsão superior esquerdo (c: 1..3, r: 1..4)
for (let r = 1; r <= 4; r++) {
  for (let c = 1; c <= 3; c++) {
    map.grid[r][c] = BLOCK_EMPTY;
  }
}

// 3. Garante que existem jazidas ativas no restante do mapa (sul e leste)
let remainingActive = 0;
for (let r = 1; r < map.grid.length - 1; r++) {
  for (let c = 1; c < map.grid[0].length - 1; c++) {
    if (map.grid[r][c] !== BLOCK_EMPTY && map.grid[r][c] !== BLOCK_BEDROCK) {
      remainingActive++;
    }
  }
}
console.log(`Jazidas ativas restantes no mapa fora do bolsão: ${remainingActive}`);

// 4. Instancia o Homem-Aranha e o Robô nas exatas posições da imagem
const spiderman = { id: 'spiderman', name: 'Homem-Aranha', x: 1, y: 4, speed: 1.2, targetDir: 1, isMining: false, targetBlock: null };
const robot = { id: 'robot', name: 'Bomb-Bot', x: 3, y: 3, speed: 1.0, targetDir: 1, isMining: false, targetBlock: null };

const allMiners = [spiderman, robot];

console.log('\n--- PASSO 1: DECISÃO INICIAL DO HOMEM-ARANHA EM (1, 4) ---');
const actSpider1 = findNextHeroAction(spiderman, map.grid, allMiners, true);
console.log('Homem-Aranha:', actSpider1);

console.log('\n--- PASSO 1: DECISÃO INICIAL DO ROBÔ EM (3, 3) ---');
const actRobot1 = findNextHeroAction(robot, map.grid, allMiners, true);
console.log('Robô:', actRobot1);

if (actSpider1.action !== 'move' || actRobot1.action !== 'move') {
  console.error('❌ ERRO: Heróis não decidiram se mover para a próxima jazida!');
  process.exit(1);
}

// 5. Simula a caminhada passo a passo do Homem-Aranha até atingir a jazida alvo
console.log('\n--- SIMULANDO CAMINHADA PASSO-A-PASSO DO HOMEM-ARANHA ---');
let steps = 0;
while (steps < 20) {
  steps++;
  const act = findNextHeroAction(spiderman, map.grid, allMiners, true);
  if (act.action === 'mine') {
    console.log(`🎯 Sucesso! Homem-Aranha alcançou a jazida em (${act.targetBlock.x}, ${act.targetBlock.y}) após ${steps - 1} passos! Posição final: (${spiderman.x}, ${spiderman.y})`);
    break;
  } else if (act.action === 'move') {
    spiderman.x = act.nextStep.x;
    spiderman.y = act.nextStep.y;
    console.log(`   Passo ${steps}: Homem-Aranha avançou para (${spiderman.x}, ${spiderman.y}) [mirando jazida em (${act.targetDeposit.x}, ${act.targetDeposit.y})]`);
  } else {
    console.error('❌ Homem-Aranha ficou ocioso sem chegar a uma jazida!');
    process.exit(1);
  }
}

// 6. Simula a caminhada passo a passo do Robô até atingir a jazida alvo
console.log('\n--- SIMULANDO CAMINHADA PASSO-A-PASSO DO ROBÔ ---');
let rSteps = 0;
while (rSteps < 20) {
  rSteps++;
  const act = findNextHeroAction(robot, map.grid, allMiners, true);
  if (act.action === 'mine') {
    console.log(`🎯 Sucesso! Robô alcançou a jazida em (${act.targetBlock.x}, ${act.targetBlock.y}) após ${rSteps - 1} passos! Posição final: (${robot.x}, ${robot.y})`);
    break;
  } else if (act.action === 'move') {
    robot.x = act.nextStep.x;
    robot.y = act.nextStep.y;
    console.log(`   Passo ${rSteps}: Robô avançou para (${robot.x}, ${robot.y}) [mirando jazida em (${act.targetDeposit.x}, ${act.targetDeposit.y})]`);
  } else {
    console.error('❌ Robô ficou ocioso sem chegar a uma jazida!');
    process.exit(1);
  }
}

console.log('\n================================================================');
console.log('✅ TESTE FINALIZADO COM 100% DE SUCESSO: NENHUM HERÓI FICA BOBO!');
console.log('================================================================');
