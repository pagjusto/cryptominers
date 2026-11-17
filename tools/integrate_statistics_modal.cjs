const fs = require('fs');

const path = 'C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');
const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Add BarChart3 to lucide-react import
if (!content.includes('BarChart3,')) {
  content = content.replace(
    `import {\n  Pickaxe,`,
    `import {\n  BarChart3,\n  Pickaxe,`
  );
  console.log('BarChart3 added to imports!');
}

// 2. Import StatisticsModal
if (!content.includes('StatisticsModal')) {
  content = content.replace(
    `import AdminConfigModal from './components/AdminConfigModal';`,
    `import AdminConfigModal from './components/AdminConfigModal';\nimport StatisticsModal from './components/StatisticsModal';`
  );
  console.log('StatisticsModal imported!');
}

// 3. Add isStatisticsOpen state
if (!content.includes('isStatisticsOpen')) {
  content = content.replace(
    `const [isAdminConfigOpen, setIsAdminConfigOpen] = useState(false);`,
    `const [isAdminConfigOpen, setIsAdminConfigOpen] = useState(false);\n  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);`
  );
  console.log('isStatisticsOpen state added!');
}

// 4. Update Header button: change DASHBOARD button to ESTATÍSTICAS
const oldStatsBtn = `{/* BOTÃO DO DASHBOARD & ESTATÍSTICAS */}
          <button
            onClick={() => setIsStatsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/70 text-purple-300 border border-purple-500/40 font-tech text-xs font-bold transition cursor-pointer shadow-sm"
          >
            <Activity size={14} className="text-purple-400" />
            <span>DASHBOARD</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-500 text-slate-950 text-[10px] font-bold font-mono">
              ⏱️ {formatEstimatedTime(statsData.estimatedSeconds)}
            </span>
          </button>`;

const newStatsBtn = `{/* NOVO MENU: ESTATÍSTICAS & SIMULADOR DE UPGRADES */}
          <button
            onClick={() => setIsStatisticsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 text-purple-300 border border-purple-500/50 font-tech text-xs font-bold transition cursor-pointer shadow-md shadow-purple-950/40 active:scale-95"
          >
            <BarChart3 size={15} className="text-purple-400" />
            <span>ESTATÍSTICAS</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-500 text-slate-950 text-[10px] font-bold font-mono">
              UPGRADES
            </span>
          </button>`;

if (content.includes(oldStatsBtn)) {
  content = content.replace(oldStatsBtn, newStatsBtn);
  console.log('Header ESTATÍSTICAS button updated!');
} else {
  console.log('oldStatsBtn not matched directly, checking fallback...');
  content = content.replace(
    `<span>DASHBOARD</span>`,
    `<span>ESTATÍSTICAS</span>`
  );
  content = content.replace(
    `onClick={() => setIsStatsModalOpen(true)}`,
    `onClick={() => setIsStatisticsOpen(true)}`
  );
}

// 5. Render StatisticsModal component
if (!content.includes('<StatisticsModal')) {
  const modalRenderCode = `      {/* NOVO MENU: ESTATÍSTICAS & SIMULADOR DE UPGRADES — CRIPTO MYNERS */}
      <StatisticsModal
        isOpen={isStatisticsOpen}
        onClose={() => setIsStatisticsOpen(false)}
        miners={miners}
        bcoin={bcoin}
        totalMinedSession={totalMinedSession}
        currentHouse={currentHouse}
        currentMine={currentMine}
        onOpenHouseModal={() => setIsHouseOpen(true)}
        onUpgradeMiner={handleUpgradeMiner}
      />
`;
  content = content.replace(
    `{/* PAINEL ADMINISTRATIVO — CRIPTO MYNERS */}`,
    `${modalRenderCode}\n      {/* PAINEL ADMINISTRATIVO — CRIPTO MYNERS */}`
  );
  console.log('StatisticsModal rendered in App.jsx!');
}

if (isCRLF) content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(path, content, 'utf8');
console.log('App.jsx updated with StatisticsModal successfully!');
