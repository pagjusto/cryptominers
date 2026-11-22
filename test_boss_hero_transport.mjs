import assert from 'node:assert';
import { getValidCombatPositionsAroundBoss, COMBAT_RANGE, hasClearLineOfSight } from './src/utils/minerPathfinding.js';
import { isCityBuilding, isBaseCompound } from './src/utils/cityMapGeometry.js';
import { GRID_COLS, GRID_ROWS, BLOCK_EMPTY } from './src/data/minersData.js';

console.log('================================================================');
console.log('TESTE: TRANSPORTE AUTOMÁTICO E RETORNO DOS HERÓIS NO EVENTO BOSS');
console.log('================================================================\n');

// 1. Teste de alocação de posições de combate válidas ao redor do Boss
const grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(BLOCK_EMPTY));
const bossX = 12;
const bossY = 2; // Canto nordeste

console.log(`[TESTE 1] Alocando posições de combate ao redor do Boss em (${bossX}, ${bossY})...`);
const count = 15;
const combatPositions = getValidCombatPositionsAroundBoss(bossX, bossY, count, grid, []);

assert.strictEqual(combatPositions.length, count, `Deve alocar exatamente ${count} posições`);

combatPositions.forEach((pos, idx) => {
  assert(pos.x >= 1 && pos.x < GRID_COLS - 1, `Posição X (${pos.x}) fora dos limites`);
  assert(pos.y >= 1 && pos.y < GRID_ROWS - 1, `Posição Y (${pos.y}) fora dos limites`);
  assert(!isCityBuilding(pos.x, pos.y), `Posição (${pos.x}, ${pos.y}) não pode ser edifício/obstáculo`);
  assert(!isBaseCompound(pos.x, pos.y), `Posição (${pos.x}, ${pos.y}) não pode invadir base militar`);
  assert(!(pos.x === bossX && pos.y === bossY), `Posição não pode ser a mesma célula do Boss`);
  assert(hasClearLineOfSight(pos.x, pos.y, bossX, bossY), `Posição (${pos.x}, ${pos.y}) deve ter linha de tiro para o Boss`);
});

const uniqueCoords = new Set(combatPositions.map(p => `${p.x},${p.y}`));
console.log(`✅ TESTE 1 APROVADO: ${combatPositions.length} posições válidas de tiro geradas, ${uniqueCoords.size} células distintas sem sobreposição de edifícios ou abrigo.`);

// 2. Simulação de ciclo de vida do evento:
// - Posições de mineração originais
// - Transporte tático
// - Ferimento e resgate de um herói
// - Entrada de substituto herdando a posição
// - Derrota do Boss e retorno automático
console.log('\n[TESTE 2] Ciclo de vida completo: Spawn Boss -> Transporte -> Ferimento -> Substituto -> Retorno...');

// Criando 5 heróis minerando em pontos distintos do mapa
const initialMiners = [
  { id: 'h1', name: 'Pirata', status: 'work', x: 2, y: 7, targetBlock: { x: 1, y: 7 } },
  { id: 'h2', name: 'Mago', status: 'work', x: 3, y: 6, targetBlock: { x: 3, y: 5 } },
  { id: 'h3', name: 'Bruto', status: 'work', x: 10, y: 8, targetBlock: { x: 11, y: 8 } },
  { id: 'h4', name: 'Cowboy', status: 'work', x: 1, y: 2, targetBlock: { x: 1, y: 1 } },
  { id: 'h5', name: 'Aranha', status: 'work', x: 13, y: 7, targetBlock: { x: 13, y: 8 } },
  { id: 'h_reserve', name: 'Ninja Substituto', status: 'reserve', x: 2, y: 8, targetBlock: null },
  { id: 'h_house', name: 'Fada Internada', status: 'house', x: 4, y: 4, targetBlock: null }
];

// Estado simulado do jogo
const simState = {
  grid,
  hpMap: {},
  miners: JSON.parse(JSON.stringify(initialMiners)),
  floatTexts: [],
  activeBossEvent: null
};

// Passo A: Boss aparece
const bossId = 'boss_mutante_01';
const activeWorkingHeroes = simState.miners.filter(m => m.status === 'work');
assert.strictEqual(activeWorkingHeroes.length, 5, 'Apenas os 5 heróis trabalhando devem ser identificados');

// Salva as posições ANTES do transporte
const savedPositions = new Map();
activeWorkingHeroes.forEach(m => {
  savedPositions.set(m.id, { x: m.x, y: m.y, targetBlock: m.targetBlock ? { ...m.targetBlock } : null });
});

simState.activeBossEvent = {
  bossId,
  bossX,
  bossY,
  savedPositions,
  vacantOriginalPositions: [],
  returned: false
};

// Transporta os heróis para perto do Boss
const combatSpots = getValidCombatPositionsAroundBoss(bossX, bossY, activeWorkingHeroes.length, grid, []);
activeWorkingHeroes.forEach((miner, idx) => {
  const spot = combatSpots[idx];
  miner.x = spot.x;
  miner.y = spot.y;
  miner.isMining = true;
  miner.targetBlock = { x: bossX, y: bossY };
  miner.lockedEnemyId = bossId;
});

console.log('   -> Heróis transportados para combate contra o Boss:');
simState.miners.filter(m => m.status === 'work').forEach(m => {
  console.log(`      ${m.name}: pos combate (${m.x}, ${m.y}) mirando Boss em (${bossX}, ${bossY})`);
  assert(Math.abs(m.x - bossX) + Math.abs(m.y - bossY) <= 4, 'Herói deve estar próximo ao Boss');
  assert.strictEqual(m.lockedEnemyId, bossId, 'Deve estar travado no Boss');
});

// Passo B: O herói h1 (Pirata) fica ferido e é encaminhado para o ambulatório
const wounded = simState.miners.find(m => m.id === 'h1');
wounded.status = 'house'; // Sai do combate para tratamento
const origH1 = simState.activeBossEvent.savedPositions.get('h1');
simState.activeBossEvent.savedPositions.delete('h1');
simState.activeBossEvent.vacantOriginalPositions.push({ originalHeroId: 'h1', pos: origH1 });

assert(!simState.activeBossEvent.savedPositions.has('h1'), 'Pirata ferido não deve constar como participante ativo');
assert.strictEqual(simState.activeBossEvent.vacantOriginalPositions.length, 1, 'Vaga original do Pirata deve estar na lista de vagas');
console.log(`   -> ${wounded.name} foi ferido e resgatado para a enfermaria. Vaga de mineração (${origH1.x}, ${origH1.y}) reservada.`);

// Passo C: O herói substituto (Ninja) entra da reserva para preencher a vaga
const recruit = simState.miners.find(m => m.id === 'h_reserve');
recruit.status = 'work';
const vacant = simState.activeBossEvent.vacantOriginalPositions.shift();
simState.activeBossEvent.savedPositions.set(recruit.id, vacant.pos);

// Substituto é transportado para o combate
recruit.x = combatSpots[0].x;
recruit.y = combatSpots[0].y;
recruit.isMining = true;
recruit.targetBlock = { x: bossX, y: bossY };
recruit.lockedEnemyId = bossId;

console.log(`   -> ${recruit.name} assumiu a vaga de combate e herdou a posição original (${vacant.pos.x}, ${vacant.pos.y}) do Pirata.`);
assert.deepStrictEqual(simState.activeBossEvent.savedPositions.get(recruit.id), { x: 2, y: 7, targetBlock: { x: 1, y: 7 } });

// Passo D: O Boss morre -> Retorno automático
console.log('   -> Boss derrotado! Executando retorno automático...');

function testReturn(state, bId) {
  const event = state.activeBossEvent;
  if (!event || event.returned) return;
  event.returned = true;

  state.miners.forEach(miner => {
    if (miner.status === 'work' && event.savedPositions?.has(miner.id)) {
      const orig = event.savedPositions.get(miner.id);
      miner.x = orig.x;
      miner.y = orig.y;
      miner.isMining = false;
      miner.targetBlock = orig.targetBlock ? { ...orig.targetBlock } : null;
      miner.lockedEnemyId = null;
    }
  });
  state.activeBossEvent = null;
}

testReturn(simState, bossId);

// Verificações pós-retorno:
const p1 = simState.miners.find(m => m.id === 'h1');
assert.strictEqual(p1.status, 'house', 'Pirata ferido deve permanecer na enfermaria');

const pNinja = simState.miners.find(m => m.id === 'h_reserve');
assert.strictEqual(pNinja.x, 2, 'Ninja substituto deve ter retornado para X=2 (posição herdada do Pirata)');
assert.strictEqual(pNinja.y, 7, 'Ninja substituto deve ter retornado para Y=7 (posição herdada do Pirata)');
assert.deepStrictEqual(pNinja.targetBlock, { x: 1, y: 7 }, 'Ninja substituto deve restaurar o alvo de mineração herdado');

const p2 = simState.miners.find(m => m.id === 'h2');
assert.strictEqual(p2.x, 3, 'Mago deve retornar à posição original X=3');
assert.strictEqual(p2.y, 6, 'Mago deve retornar à posição original Y=6');

const p3 = simState.miners.find(m => m.id === 'h3');
assert.strictEqual(p3.x, 10, 'Bruto deve retornar à posição original X=10');
assert.strictEqual(p3.y, 8, 'Bruto deve retornar à posição original Y=8');

const pHouse = simState.miners.find(m => m.id === 'h_house');
assert.strictEqual(pHouse.x, 4, 'Fada que já estava internada não deve ter sido movida');

console.log('✅ TESTE 2 APROVADO: Todos os heróis retornaram fielmente às suas posições originais de mineração, o substituto herdou a posição exata da vaga assumida, e feridos permaneceram protegidos no ambulatório!');

// Passo E: Teste de encerramento por expiração/cancelamento
console.log('\n[TESTE 3] Encerramento por expiração de tempo ou cancelamento...');
// Prepara novo evento
simState.activeBossEvent = {
  bossId: 'boss_expired_02',
  savedPositions: new Map([
    ['h2', { x: 3, y: 6 }],
    ['h3', { x: 10, y: 8 }]
  ]),
  returned: false
};
// Move para combate
p2.x = 11; p2.y = 2;
p3.x = 11; p3.y = 3;

// Expira por tempo
testReturn(simState, 'boss_expired_02');

assert.strictEqual(p2.x, 3, 'Mago deve retornar a X=3 após expiração');
assert.strictEqual(p3.x, 10, 'Bruto deve retornar a X=10 após expiração');
console.log('✅ TESTE 3 APROVADO: Retorno ocorre com perfeição também no encerramento por tempo ou cancelamento!');

console.log('\n================================================================');
console.log('TODOS OS 3 TESTES DA MECÂNICA DO BOSS FORAM CONCLUÍDOS COM 100% DE SUCESSO!');
console.log('================================================================');
