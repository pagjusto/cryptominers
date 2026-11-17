const fs = require('fs');

const path = 'C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/src/components/SummonModal.jsx';
let content = fs.readFileSync(path, 'utf8');

const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Atualizar modal max-w para suportar lote visualmente se necessário
content = content.replace(
  `className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl p-6 bg-slate-900 border-2 border-slate-700 text-center shadow-2xl flex flex-col overflow-hidden"`,
  `className="relative w-full max-w-3xl max-h-[92vh] rounded-3xl p-6 bg-slate-900 border-2 border-slate-700 text-center shadow-2xl flex flex-col overflow-hidden"`
);

// 2. Atualizar layout das caixas para 4 colunas em telas maiores
content = content.replace(
  `<div className="grid grid-cols-1 md:grid-cols-3 gap-3">`,
  `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">`
);

// 3. Suporte completo a revelação de lote (Array) e herói único
const oldRevealBlock = `        {/* CASO: MINERADOR REVELADO COM SUCESSO */}
        {revealedMiner ? (
          <div className="py-4 animate-scaleUp">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold font-arcade uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-3">
              ✦ NOVO MINERADOR CONTRATADO! ✦
            </span>

            <div 
              className="w-28 h-28 mx-auto mb-3 rounded-3xl border-3 flex items-center justify-center text-6xl shadow-2xl animate-bounce overflow-hidden relative"
              style={{ 
                borderColor: revealedMiner.color,
                backgroundColor: \`\${revealedMiner.color}20\`
              }}
            >
              <img 
                src={revealedMiner.image || \`/miners/\${revealedMiner.classId}.png\`} 
                alt={revealedMiner.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (e.target.src.endsWith('.png')) {
                    e.target.src = \`/miners/\${revealedMiner.classId}.jpg\`;
                  } else {
                    e.target.style.display = 'none';
                  }
                }}
              />
              <span className="absolute -z-0">{revealedMiner.avatar}</span>
            </div>

            <h2 className="font-arcade text-lg text-white mb-0.5">
              {revealedMiner.name}
            </h2>
            <span 
              className="text-xs font-tech font-bold uppercase tracking-wider block mb-4"
              style={{ color: revealedMiner.color }}
            >
              Classe: {revealedMiner.classId}
            </span>

            {/* Atributos Básicos */}
            <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto mb-4 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Flame size={12} className="text-rose-400" /> PODER
                </span>
                <span className="font-arcade text-base text-rose-400">{revealedMiner.power}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Zap size={12} className="text-amber-400" /> VELOCIDADE
                </span>
                <span className="font-arcade text-base text-amber-400">{revealedMiner.speed.toFixed(1)}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Battery size={12} className="text-sky-400" /> ESTAMINA
                </span>
                <span className="font-arcade text-base text-sky-400">{revealedMiner.maxStamina}</span>
              </div>
            </div>

            {/* Habilidade Passiva */}
            {revealedMiner.passiveTrait && (
              <div className="max-w-sm mx-auto mb-6 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-left">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 mb-0.5">
                  <Sparkles size={12} /> Habilidade: {revealedMiner.passiveTrait.name}
                </span>
                <p className="text-[10px] text-slate-300 font-tech">
                  {revealedMiner.passiveTrait.description}
                </p>
              </div>
            )}

            <button
              onClick={resetModal}
              className="w-full max-w-xs mx-auto py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-arcade text-xs font-bold transition shadow-lg flex items-center justify-center gap-2"
            >
              <Check size={16} />
              <span>ENVIAR PARA A MINA</span>
            </button>
          </div>
        ) : (`;

const newRevealBlock = `        {/* CASO: MINERADOR REVELADO COM SUCESSO */}
        {revealedMiner ? (
          Array.isArray(revealedMiner) ? (
            /* CASO A: LOTE DE MINERADORES (5, 10 ou 15 HERÓIS) */
            <div className="py-2 flex flex-col h-full overflow-hidden animate-scaleUp">
              <div className="mb-3">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold font-arcade uppercase tracking-wider bg-gradient-to-r from-amber-500/30 to-amber-600/30 text-amber-300 border border-amber-500/50 shadow-md mb-1.5">
                  ✦ {revealedMiner.length} HERÓIS INVOCADOS COM SUCESSO! ✦
                </span>
                <p className="text-xs text-slate-400 font-tech">
                  Confira os novos recrutas sorteados para sua equipe de mineração:
                </p>
              </div>

              {/* Grid de Heróis com Scroll */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar max-h-[56vh] mb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {revealedMiner.map((m, idx) => (
                    <div 
                      key={m.id || idx}
                      className="p-2.5 rounded-2xl border bg-slate-950/80 flex flex-col justify-between text-left transition hover:scale-[1.02] shadow-sm relative overflow-hidden"
                      style={{ borderColor: \`\${m.color}80\` }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span 
                          className="text-[9px] font-bold font-mono px-1.5 py-0.2 rounded uppercase"
                          style={{ backgroundColor: \`\${m.color}25\`, color: m.color }}
                        >
                          {m.rarity || 'COMUM'}
                        </span>
                        <span className="text-xs">{m.avatar}</span>
                      </div>

                      <div 
                        className="w-14 h-14 mx-auto my-1 rounded-xl border flex items-center justify-center overflow-hidden relative shadow-inner"
                        style={{ borderColor: m.color, backgroundColor: \`\${m.color}15\` }}
                      >
                        <img 
                          src={m.image || \`/miners/\${m.classId}.png\`}
                          alt={m.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            if (e.target.src.endsWith('.png')) e.target.src = \`/miners/\${m.classId}.jpg\`;
                            else e.target.style.display = 'none';
                          }}
                        />
                      </div>

                      <h4 className="font-tech font-bold text-xs text-white truncate text-center mb-1">
                        {m.name}
                      </h4>

                      <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-lg text-center text-[9px] font-mono">
                        <span className="text-rose-400" title="Poder">⚔️{m.power}</span>
                        <span className="text-amber-400" title="Velocidade">⚡{m.speed.toFixed(1)}</span>
                        <span className="text-sky-400" title="Estamina">🔋{m.maxStamina}</span>
                      </div>

                      {m.passiveTrait && (
                        <span className="text-[8px] text-amber-300 font-tech truncate mt-1 text-center block" title={m.passiveTrait.description}>
                          ★ {m.passiveTrait.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={resetModal}
                className="w-full max-w-sm mx-auto py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-arcade text-xs font-bold transition shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check size={16} />
                <span>INTEGRAR TODOS À MINA ({revealedMiner.length} HERÓIS)</span>
              </button>
            </div>
          ) : (
            /* CASO B: HERÓI ÚNICO EM DESTAQUE */
            <div className="py-4 animate-scaleUp">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold font-arcade uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-3">
                ✦ NOVO MINERADOR CONTRATADO! ✦
              </span>

              <div 
                className="w-28 h-28 mx-auto mb-3 rounded-3xl border-3 flex items-center justify-center text-6xl shadow-2xl animate-bounce overflow-hidden relative"
                style={{ 
                  borderColor: revealedMiner.color,
                  backgroundColor: \`\${revealedMiner.color}20\`
                }}
              >
                <img 
                  src={revealedMiner.image || \`/miners/\${revealedMiner.classId}.png\`} 
                  alt={revealedMiner.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if (e.target.src.endsWith('.png')) {
                      e.target.src = \`/miners/\${revealedMiner.classId}.jpg\`;
                    } else {
                      e.target.style.display = 'none';
                    }
                  }}
                />
                <span className="absolute -z-0">{revealedMiner.avatar}</span>
              </div>

              <h2 className="font-arcade text-lg text-white mb-0.5">
                {revealedMiner.name}
              </h2>
              <span 
                className="text-xs font-tech font-bold uppercase tracking-wider block mb-4"
                style={{ color: revealedMiner.color }}
              >
                Classe: {revealedMiner.classId}
              </span>

              {/* Atributos Básicos */}
              <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto mb-4 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Flame size={12} className="text-rose-400" /> PODER
                  </span>
                  <span className="font-arcade text-base text-rose-400">{revealedMiner.power}</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Zap size={12} className="text-amber-400" /> VELOCIDADE
                  </span>
                  <span className="font-arcade text-base text-amber-400">{revealedMiner.speed.toFixed(1)}</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Battery size={12} className="text-sky-400" /> ESTAMINA
                  </span>
                  <span className="font-arcade text-base text-sky-400">{revealedMiner.maxStamina}</span>
                </div>
              </div>

              {/* Habilidade Passiva */}
              {revealedMiner.passiveTrait && (
                <div className="max-w-sm mx-auto mb-6 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-left">
                  <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 mb-0.5">
                    <Sparkles size={12} /> Habilidade: {revealedMiner.passiveTrait.name}
                  </span>
                  <p className="text-[10px] text-slate-300 font-tech">
                    {revealedMiner.passiveTrait.description}
                  </p>
                </div>
              )}

              <button
                onClick={resetModal}
                className="w-full max-w-xs mx-auto py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-arcade text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check size={16} />
                <span>ENVIAR PARA A MINA</span>
              </button>
            </div>
          )
        ) : (`;

if (content.includes(oldRevealBlock)) {
  content = content.replace(oldRevealBlock, newRevealBlock);
  console.log('Batch reveal block replaced successfully!');
} else {
  console.log('Old reveal block not found directly, checking fallback...');
}

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(path, content, 'utf8');
console.log('SummonModal.jsx upgraded with batch UI!');
