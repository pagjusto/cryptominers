const fs = require('fs');

console.log('=== INTEGRATING CRIPTO MYNERS COMPLETE SYSTEM ===');

// ==========================================
// 1. UPDATE src/components/GameBoard.jsx
// ==========================================
const gameBoardPath = 'C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/src/components/GameBoard.jsx';
let gbContent = fs.readFileSync(gameBoardPath, 'utf8');
const gbIsCRLF = gbContent.includes('\r\n');
gbContent = gbContent.replace(/\r\n/g, '\n');

// Add houseSlots prop to GameBoard
if (!gbContent.includes('houseSlots = 5')) {
  gbContent = gbContent.replace(
    `houseStaminaRate = 1,\n  gameSpeed = 1\n}) {`,
    `houseStaminaRate = 1,\n  houseSlots = 5,\n  gameSpeed = 1\n}) {`
  );
  console.log('Added houseSlots to GameBoard props!');
}

// Update miner rest and stamina exhaustion logic in GameBoard
const oldMinerRestLogic = `        // 1. Descanso na Casa (Recuperação estratégica turbinada pela casa)
        if (miner.status === 'house') {
          miner.isMining = false;
          miner.targetBlock = null;
          if (miner.currentStamina < miner.maxStamina) {
            miner.currentStamina = Math.min(miner.maxStamina, miner.currentStamina + dt * (houseStaminaRate * 0.15));
          }
          return;
        }

        // 2. Descanso no Chão da Mina (Lento: modelo de ~5h por mapa)
        if (miner.status === 'sleep') {
          // Garante que o herói adormecido NUNCA fique sobre os trilhos ou sobre o túnel
          if (isCanyon && isCanyonTrackOrTunnel(Math.round(miner.x), Math.round(miner.y), GRID_COLS, GRID_ROWS)) {
            miner.x = 2;
            miner.y = 8;
          }
          miner.isMining = false;
          miner.targetBlock = null;
          if (miner.currentStamina < miner.maxStamina) {
            miner.currentStamina = Math.min(miner.maxStamina, miner.currentStamina + dt * 0.035);
          }
          return;
        }

        if (miner.currentStamina <= 0) {
          miner.status = 'sleep';
          if (isCanyon && isCanyonTrackOrTunnel(Math.round(miner.x), Math.round(miner.y), GRID_COLS, GRID_ROWS)) {
            miner.x = 2;
            miner.y = 8;
          }
          miner.isMining = false;
          miner.targetBlock = null;
          return;
        }`;

const newMinerRestLogic = `        // 1. Descanso na Casa (Recuperação rápida e transição para reserva quando 100%)
        if (miner.status === 'house') {
          miner.isMining = false;
          miner.targetBlock = null;
          if (miner.currentStamina < miner.maxStamina) {
            miner.currentStamina = Math.min(miner.maxStamina, miner.currentStamina + dt * (houseStaminaRate * 0.25));
          }
          if (miner.currentStamina >= miner.maxStamina) {
            miner.currentStamina = miner.maxStamina;
            miner.status = 'reserve'; // 100% recuperado: vai para a fila de reservas da mina
          }
          return;
        }

        // 2. Fila de espera por vaga na Casa
        if (miner.status === 'waiting_house') {
          miner.isMining = false;
          miner.targetBlock = null;
          return;
        }

        // 3. Reserva (descanso natural leve)
        if (miner.status === 'reserve') {
          miner.isMining = false;
          miner.targetBlock = null;
          if (miner.currentStamina < miner.maxStamina) {
            miner.currentStamina = Math.min(miner.maxStamina, miner.currentStamina + dt * 0.02);
          }
          return;
        }

        // 4. Descanso no Chão da Mina (Lento: modelo de ~5h por mapa)
        if (miner.status === 'sleep') {
          if (isCanyon && isCanyonTrackOrTunnel(Math.round(miner.x), Math.round(miner.y), GRID_COLS, GRID_ROWS)) {
            miner.x = 2;
            miner.y = 8;
          }
          miner.isMining = false;
          miner.targetBlock = null;
          if (miner.currentStamina < miner.maxStamina) {
            miner.currentStamina = Math.min(miner.maxStamina, miner.currentStamina + dt * 0.035);
          }
          if (miner.currentStamina >= miner.maxStamina) {
            miner.currentStamina = miner.maxStamina;
            miner.status = 'reserve';
          }
          return;
        }

        // 5. Energia esgotada na mineração ativa: sai da mina e vai para a fila da casa
        if (miner.currentStamina <= 0) {
          miner.currentStamina = 0;
          miner.status = 'waiting_house';
          miner.isMining = false;
          miner.targetBlock = null;
          return;
        }`;

if (gbContent.includes(oldMinerRestLogic)) {
  gbContent = gbContent.replace(oldMinerRestLogic, newMinerRestLogic);
  console.log('Replaced miner resting & stamina logic in GameBoard!');
} else {
  console.log('oldMinerRestLogic not matched, attempting relaxed replacement...');
  const searchPattern = `if (miner.currentStamina <= 0) {\n          miner.status = 'sleep';`;
  if (gbContent.includes(searchPattern)) {
    gbContent = gbContent.replace(
      searchPattern,
      `if (miner.currentStamina <= 0) {\n          miner.currentStamina = 0;\n          miner.status = 'waiting_house';`
    );
    console.log('Fallback stamina replacement applied in GameBoard!');
  }
}

// Only draw miners who are in 'work' or 'sleep' (do not draw resting in house or in reserve)
if (!gbContent.includes(`if (miner.status === 'house' || miner.status === 'waiting_house' || miner.status === 'reserve') return;`)) {
  gbContent = gbContent.replace(
    `state.miners.forEach(miner => {\n        const classInfo = MINER_CLASSES[miner.classId] || MINER_CLASSES.miner;`,
    `state.miners.forEach(miner => {\n        if (miner.status === 'house' || miner.status === 'waiting_house' || miner.status === 'reserve') return;\n        const classInfo = MINER_CLASSES[miner.classId] || MINER_CLASSES.miner;`
  );
  console.log('Added filter so house/reserve miners are not drawn in mine canvas!');
}

// Add auto-rotation check and periodic onMinersChange inside GameBoard loop
const oldLoopTail = `      // Emissão periódica de estatísticas da rodada e previsão dinâmica do mapa`;
const newLoopTail = `      // Rotação Automática Inteligente da Mina & Gestão de Vagas da Casa
      if (!state.lastRelayCheck || now - state.lastRelayCheck > 1200) {
        state.lastRelayCheck = now;
        
        // A. Alocar quem está esperando na fila da Casa se houver leito livre
        const capacity = houseSlots || 5;
        let inHouse = state.miners.filter(m => m.status === 'house').length;
        if (inHouse < capacity) {
          for (const m of state.miners) {
            if (m.status === 'waiting_house' && inHouse < capacity) {
              m.status = 'house';
              inHouse++;
            }
          }
        }

        // B. Manter até 15 mineradores trabalhando (seleção dos mais eficientes)
        const workingCount = state.miners.filter(m => m.status === 'work').length;
        const slotsNeeded = Math.max(0, 15 - workingCount);
        if (slotsNeeded > 0) {
          const readyCandidates = state.miners
            .filter(m => (m.status === 'reserve' || m.status === 'sleep') && m.currentStamina >= (m.maxStamina * 0.25))
            .sort((a, b) => {
              const effB = (b.power * 1.5 + b.speed * 10) * (b.currentStamina / b.maxStamina);
              const effA = (a.power * 1.5 + a.speed * 10) * (a.currentStamina / a.maxStamina);
              return effB - effA;
            });

          for (let i = 0; i < Math.min(slotsNeeded, readyCandidates.length); i++) {
            const recruit = readyCandidates[i];
            recruit.status = 'work';
            if (typeof recruit.x !== 'number' || isNaN(recruit.x)) recruit.x = 2;
            if (typeof recruit.y !== 'number' || isNaN(recruit.y)) recruit.y = 8;
          }
        }

        // C. Sincronizar mineradores com a aplicação
        if (onMinersChange) {
          onMinersChange(state.miners.map(m => ({ ...m })));
        }
      }

      // Emissão periódica de estatísticas da rodada e previsão dinâmica do mapa`;

if (gbContent.includes(oldLoopTail) && !gbContent.includes('state.lastRelayCheck')) {
  gbContent = gbContent.replace(oldLoopTail, newLoopTail);
  console.log('Added GameBoard auto-rotation and sync logic!');
}

if (gbIsCRLF) gbContent = gbContent.replace(/\n/g, '\r\n');
fs.writeFileSync(gameBoardPath, gbContent, 'utf8');
console.log('GameBoard.jsx updated successfully!');


// ==========================================
// 2. UPDATE src/components/HeroList.jsx
// ==========================================
const heroListPath = 'C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/src/components/HeroList.jsx';
let hlContent = fs.readFileSync(heroListPath, 'utf8');
const hlIsCRLF = hlContent.includes('\r\n');
hlContent = hlContent.replace(/\r\n/g, '\n');

// Update header to display working / max 15
if (hlContent.includes(`EQUIPE DE MINERADORES ({miners.length})`)) {
  hlContent = hlContent.replace(
    `EQUIPE DE MINERADORES ({miners.length})`,
    `EQUIPE DE MINERADORES ({miners.filter(m => m.status === 'work').length}/15 ATIVOS • {miners.length} TOTAL)`
  );
  console.log('HeroList header count updated!');
}

// Update status badges in HeroList
const oldStatusBadges = `                {/* Status Work/Rest */}
                <div className="flex items-center gap-1">
                  {miner.status === 'house' && (
                    <span className="text-[10px] font-bold font-tech px-2 py-1 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1 animate-pulse">
                      🏠 NA CASA
                    </span>
                  )}

                  <button
                    onClick={() => onToggleStatus(miner.id)}
                    className={\`px-3 py-1.5 rounded-xl text-[11px] font-tech font-bold flex items-center gap-1 transition \${
                      isWorking
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                        : (miner.status === 'house'
                            ? 'bg-blue-600 hover:bg-emerald-500 text-white hover:text-slate-950'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700')
                    }\`}
                  >
                    {isWorking ? <Play size={11} className="fill-slate-950" /> : <Moon size={11} />}
                    <span>{isWorking ? 'ATIVO' : (miner.status === 'house' ? 'ACORDAR' : 'DORMINDO')}</span>
                  </button>
                </div>`;

const newStatusBadges = `                {/* Status Work/House/Waiting/Reserve */}
                <div className="flex items-center gap-1">
                  {miner.status === 'house' && (
                    <span className="text-[10px] font-bold font-tech px-2 py-1 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1 animate-pulse" title="Recuperando energia na cama da Casa">
                      🏠 NA CASA
                    </span>
                  )}
                  {miner.status === 'waiting_house' && (
                    <span className="text-[10px] font-bold font-tech px-2 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1" title="Aguardando vaga livre de cama na Casa">
                      ⏳ FILA CASA
                    </span>
                  )}
                  {miner.status === 'reserve' && (
                    <span className="text-[10px] font-bold font-tech px-2 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1" title="Na reserva, pronto para revezar">
                      🛡️ RESERVA
                    </span>
                  )}

                  <button
                    onClick={() => onToggleStatus(miner.id)}
                    className={\`px-2.5 py-1.5 rounded-xl text-[10px] font-tech font-bold flex items-center gap-1 transition cursor-pointer \${
                      isWorking
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                        : (miner.status === 'house'
                            ? 'bg-blue-600 hover:bg-emerald-500 text-white hover:text-slate-950'
                            : (miner.status === 'waiting_house'
                                ? 'bg-amber-600 text-white hover:bg-amber-500'
                                : 'bg-slate-800 text-slate-300 hover:bg-emerald-600 hover:text-white'))
                    }\`}
                  >
                    {isWorking ? <Play size={10} className="fill-slate-950" /> : <Moon size={10} />}
                    <span>
                      {isWorking 
                        ? 'MINERANDO' 
                        : (miner.status === 'house' 
                            ? 'ACORDAR' 
                            : (miner.status === 'waiting_house' ? 'ESPERANDO' : 'TRABALHAR'))}
                    </span>
                  </button>
                </div>`;

if (hlContent.includes(oldStatusBadges)) {
  hlContent = hlContent.replace(oldStatusBadges, newStatusBadges);
  console.log('HeroList status badges updated!');
}

if (hlIsCRLF) hlContent = hlContent.replace(/\n/g, '\r\n');
fs.writeFileSync(heroListPath, hlContent, 'utf8');
console.log('HeroList.jsx updated successfully!');


// ==========================================
// 3. UPDATE src/App.jsx
// ==========================================
const appPath = 'C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/src/App.jsx';
let appContent = fs.readFileSync(appPath, 'utf8');
const appIsCRLF = appContent.includes('\r\n');
appContent = appContent.replace(/\r\n/g, '\n');

// 3.1 Add imports if not present
if (!appContent.includes('RoiSimulatorModal')) {
  appContent = appContent.replace(
    `import WalletModal from './components/WalletModal';`,
    `import WalletModal from './components/WalletModal';
import RoiSimulatorModal from './components/RoiSimulatorModal';
import AdminConfigModal from './components/AdminConfigModal';
import { getCriptoMynersConfig } from './data/criptoMynersConfig';
import { autoRelayTeam, calculateOfflineProgress, calculateMinerEfficiency } from './utils/minerRotationEngine';
import { Calculator, Settings } from 'lucide-react';`
  );
  console.log('Added RoiSimulatorModal and Admin imports to App.jsx!');
}

// 3.2 Add modal states
if (!appContent.includes('isRoiSimulatorOpen')) {
  appContent = appContent.replace(
    `const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);`,
    `const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isRoiSimulatorOpen, setIsRoiSimulatorOpen] = useState(false);
  const [isAdminConfigOpen, setIsAdminConfigOpen] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState(null);
  const [criptoMynersConfig, setCriptoMynersConfig] = useState(() => getCriptoMynersConfig());`
  );
  console.log('Added modal states to App.jsx!');
}

// 3.3 Update handleRecruitMiner to handle array of miners
const oldRecruitLogicInApp = `  const handleRecruitMiner = (newMiner, costUsdt = 10) => {
    // Deduz USDT da Carteira Web3 Conectada (MetaMask / Trust Wallet)
    setWalletState(prev => {
      const nextBalance = Math.max(0, parseFloat((prev.usdtBalance - costUsdt).toFixed(2)));
      const nextState = { ...prev, usdtBalance: nextBalance };
      saveWalletState(nextState);
      return nextState;
    });
    // Registra investimento (paridade 1:1)
    setTotalInvested(prev => parseFloat((prev + costUsdt).toFixed(3)));
    setMiners(prev => [...prev, { ...newMiner, durability: 100 }]);
  };`;

const newRecruitLogicInApp = `  const handleRecruitMiner = (newMiner, costUsdt = 10) => {
    // Deduz USDT da Carteira Web3 Conectada (MetaMask / Trust Wallet)
    setWalletState(prev => {
      const nextBalance = Math.max(0, parseFloat((prev.usdtBalance - costUsdt).toFixed(2)));
      const nextState = { ...prev, usdtBalance: nextBalance };
      saveWalletState(nextState);
      return nextState;
    });
    // Registra investimento (paridade 1:1)
    setTotalInvested(prev => parseFloat((prev + costUsdt).toFixed(3)));

    setMiners(prev => {
      const toAdd = Array.isArray(newMiner)
        ? newMiner.map(m => ({ ...m, durability: 100 }))
        : [{ ...newMiner, durability: 100 }];
      const updated = [...prev, ...toAdd];
      localStorage.setItem('crypto_miners_team', JSON.stringify(updated));
      return updated;
    });
  };`;

if (appContent.includes(oldRecruitLogicInApp)) {
  appContent = appContent.replace(oldRecruitLogicInApp, newRecruitLogicInApp);
  console.log('handleRecruitMiner updated for arrays!');
}

// 3.4 Add Offline Progress & Heartbeat Effect
if (!appContent.includes('crypto_miners_last_timestamp')) {
  const offlineEffectCode = `  // Progresso Offline e Timestamp Heartbeat
  useEffect(() => {
    const savedTime = localStorage.getItem('crypto_miners_last_timestamp');
    const now = Date.now();
    if (savedTime) {
      const elapsedSecs = Math.floor((now - parseInt(savedTime, 10)) / 1000);
      if (elapsedSecs > 10) {
        const config = getCriptoMynersConfig();
        const { updatedMiners, offlineCoins, offlineMinutes } = calculateOfflineProgress(
          miners,
          currentHouse,
          elapsedSecs,
          config
        );
        if (offlineCoins > 0) {
          setBcoin(prev => parseFloat((prev + offlineCoins).toFixed(3)));
          setTotalMinedSession(prev => parseFloat((prev + offlineCoins).toFixed(3)));
          setMiners(updatedMiners);
          setOfflineNotice({
            coins: offlineCoins,
            minutes: offlineMinutes
          });
        }
      }
    }
    localStorage.setItem('crypto_miners_last_timestamp', now.toString());

    const heartbeat = setInterval(() => {
      localStorage.setItem('crypto_miners_last_timestamp', Date.now().toString());
    }, 4000);

    return () => clearInterval(heartbeat);
  }, []);
`;
  appContent = appContent.replace(
    `  useEffect(() => {\n    localStorage.setItem('crypto_miners_bcoin', bcoin.toString());`,
    `${offlineEffectCode}\n  useEffect(() => {\n    localStorage.setItem('crypto_miners_bcoin', bcoin.toString());`
  );
  console.log('Offline progress effect added to App.jsx!');
}

// 3.5 Update handleAllWork to respect 15 workers limit
if (!appContent.includes('top15Ids')) {
  appContent = appContent.replace(
    `  const handleAllWork = () => {\n    setMiners(prev => prev.map(m => ({ ...m, status: 'work' })));\n  };`,
    `  const handleAllWork = () => {
    setMiners(prev => {
      const sorted = [...prev].sort((a, b) => calculateMinerEfficiency(b) - calculateMinerEfficiency(a));
      const top15Ids = new Set(sorted.slice(0, 15).map(m => m.id));
      const updated = prev.map(m => {
        if (top15Ids.has(m.id)) return { ...m, status: 'work' };
        return { ...m, status: m.status === 'house' ? 'house' : 'reserve' };
      });
      localStorage.setItem('crypto_miners_team', JSON.stringify(updated));
      return updated;
    });
  };`
  );
  console.log('handleAllWork updated for 15 limit!');
}

// 3.6 Update Navbar Header: Add [SIMULADOR DE ROI] and [ADMIN]
if (!appContent.includes('setIsRoiSimulatorOpen(true)')) {
  appContent = appContent.replace(
    `{/* BOTÃO MINT */}`,
    `{/* BOTÃO DO SIMULADOR DE ROI — CRIPTO MYNERS */}
          <button
            onClick={() => setIsRoiSimulatorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-tech text-xs font-bold transition cursor-pointer shadow-sm"
          >
            <Calculator size={14} className="text-amber-400" />
            <span>SIMULADOR ROI</span>
          </button>

          {/* BOTÃO MINT */}`
  );
  console.log('Added SIMULADOR ROI button to navbar!');
}

if (!appContent.includes('setIsAdminConfigOpen(true)')) {
  appContent = appContent.replace(
    `{/* Reset do Mapa */}`,
    `{/* PAINEL ADMINISTRATIVO */}
          <button
            onClick={() => setIsAdminConfigOpen(true)}
            title="Painel Administrativo da Economia"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition border border-slate-700 cursor-pointer"
          >
            <Settings size={16} />
          </button>

          {/* Reset do Mapa */}`
  );
  console.log('Added ADMIN button to navbar!');
}

// 3.7 Update HUD working count: Na Mina: X/15, Na Casa: Y/{slots}, Reservas: Z
const oldHudWorking = `<span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Trabalhando: <b className="text-white">{miners.filter(m => m.status === 'work').length}/{miners.length}</b>
              </span>`;

const newHudWorking = `<span className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-slate-400">Na Mina:</span>
                <b className="text-emerald-400 font-bold">{miners.filter(m => m.status === 'work').length}/15</b>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Na Casa:</span>
                <b className="text-blue-400 font-bold">{miners.filter(m => m.status === 'house').length}/{currentHouse.slots}</b>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Reservas:</span>
                <b className="text-amber-400 font-bold">{miners.filter(m => m.status === 'reserve' || m.status === 'sleep').length}</b>
              </span>`;

if (appContent.includes(oldHudWorking)) {
  appContent = appContent.replace(oldHudWorking, newHudWorking);
  console.log('Updated HUD counters for Mina/Casa/Reservas!');
}

// 3.8 Pass houseSlots to GameBoard
if (!appContent.includes('houseSlots={currentHouse.slots}')) {
  appContent = appContent.replace(
    `houseStaminaRate={currentHouse.staminaPerSec}`,
    `houseStaminaRate={currentHouse.staminaPerSec}\n            houseSlots={currentHouse.slots}`
  );
  console.log('Passed houseSlots to GameBoard!');
}

// 3.9 Pass onOpenRoiSimulator to SummonModal
if (!appContent.includes('onOpenRoiSimulator={() => setIsRoiSimulatorOpen(true)}')) {
  appContent = appContent.replace(
    `onOpenWalletModal={() => setIsWalletModalOpen(true)}`,
    `onOpenWalletModal={() => setIsWalletModalOpen(true)}\n        onOpenRoiSimulator={() => setIsRoiSimulatorOpen(true)}`
  );
  console.log('Passed onOpenRoiSimulator to SummonModal!');
}

// 3.10 Render RoiSimulatorModal, AdminConfigModal, and Offline Notice
if (!appContent.includes('<RoiSimulatorModal')) {
  const modalRenderCode = `      {/* SIMULADOR DE ROI — CRIPTO MYNERS */}
      <RoiSimulatorModal
        isOpen={isRoiSimulatorOpen}
        onClose={() => setIsRoiSimulatorOpen(false)}
        onOpenMintModal={() => {
          setIsRoiSimulatorOpen(false);
          setIsSummonOpen(true);
        }}
        onOpenHouseModal={() => {
          setIsRoiSimulatorOpen(false);
          setIsHouseOpen(true);
        }}
      />

      {/* PAINEL ADMINISTRATIVO — CRIPTO MYNERS */}
      <AdminConfigModal
        isOpen={isAdminConfigOpen}
        onClose={() => {
          setIsAdminConfigOpen(false);
          setCriptoMynersConfig(getCriptoMynersConfig());
        }}
        onSaveConfig={(newCfg) => {
          setCriptoMynersConfig(newCfg);
        }}
      />

      {/* NOTIFICAÇÃO DE PROGRESSO OFFLINE */}
      {offlineNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border-2 border-emerald-500/60 p-4 rounded-2xl shadow-2xl animate-bounce text-left max-w-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="font-arcade text-xs text-emerald-400 flex items-center gap-1.5">
              <span>⛏️</span> PROGRESSO OFFLINE
            </span>
            <button 
              onClick={() => setOfflineNotice(null)}
              className="text-slate-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-300 font-tech">
            Enquanto esteve offline (~{offlineNotice.minutes} min), seus mineradores ativos extraíram:
          </p>
          <div className="mt-2 text-sm font-bold font-mono text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/40">
            +{offlineNotice.coins.toFixed(3)} MINER (\${offlineNotice.coins.toFixed(2)} USDT)
          </div>
        </div>
      )}
`;
  appContent = appContent.replace(
    `      {/* MODAL DO CATÁLOGO DE MINERADORES */}`,
    `${modalRenderCode}\n      {/* MODAL DO CATÁLOGO DE MINERADORES */}`
  );
  console.log('Rendered RoiSimulatorModal, AdminConfigModal, and Offline Notice in App.jsx!');
}

if (appIsCRLF) appContent = appContent.replace(/\n/g, '\r\n');
fs.writeFileSync(appPath, appContent, 'utf8');
console.log('App.jsx updated successfully!');
console.log('=== SYSTEM INTEGRATION COMPLETE ===');
