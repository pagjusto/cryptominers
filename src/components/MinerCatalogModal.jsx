import React, { useState } from 'react';
import { X, Flame, Zap, Sparkles, Shield, ChevronRight, Crosshair, Target } from 'lucide-react';
import { MINER_ROSTER } from '../data/minersCatalog';
import { WEAPON_CATALOG, getWeaponById, HERO_ROSTER } from '../data/heroRoster';

export default function MinerCatalogModal({ isOpen, onClose, onOpenMintModal }) {
  const [activeTab, setActiveTab] = useState('heroes'); // 'heroes' | 'weapons'
  const [selectedMiner, setSelectedMiner] = useState(MINER_ROSTER[0]);
  const [selectedWeapon, setSelectedWeapon] = useState(WEAPON_CATALOG[0]);

  if (!isOpen) return null;

  const equippedWeapon = getWeaponById(selectedMiner.weaponId) || WEAPON_CATALOG[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl h-[88vh] rounded-3xl p-6 bg-slate-900 border-2 border-slate-700 text-slate-100 shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl border border-amber-500/30">
              📖
            </div>
            <div>
              <h3 className="font-arcade text-base text-amber-400">
                CATÁLOGO DE SOBREVIVENTES & ARSENAL
              </h3>
              <p className="text-xs text-slate-400 font-tech">
                Conheça os heróis, classes táticas, armas balísticas e habilidades especiais
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenMintModal();
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-arcade text-xs font-bold transition shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>MINTAR AGORA</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ABAS DO CATÁLOGO: COMBATENTES vs ARSENAL DE ARMAS */}
        <div className="flex items-center gap-2 pt-3 pb-2 border-b border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('heroes')}
            className={`px-4 py-2 rounded-xl font-arcade text-xs transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'heroes'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>🧑‍🚀</span>
            <span>COMBATENTES ({MINER_ROSTER.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('weapons')}
            className={`px-4 py-2 rounded-xl font-arcade text-xs transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'weapons'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>🔫</span>
            <span>ARSENAL DE ARMAS ({WEAPON_CATALOG.length})</span>
          </button>
        </div>

        {/* CONTEÚDO PRINCIPAL: COMBATENTES */}
        {activeTab === 'heroes' && (
          <div className="flex-1 flex gap-6 overflow-hidden pt-4">
            
            {/* LADO ESQUERDO: LISTA DOS COMBATENTES */}
            <div className="w-72 lg:w-80 overflow-y-auto space-y-2 pr-1 no-scrollbar shrink-0">
              {MINER_ROSTER.map((m) => {
                const isSelected = selectedMiner.id === m.id;
                const heroWeapon = getWeaponById(m.weaponId);
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMiner(m)}
                    className={`p-3 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/20 shadow-md ring-1 ring-amber-400/50'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Avatar do Herói */}
                      <div 
                        className="w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl shadow-inner overflow-hidden relative shrink-0"
                        style={{ 
                          borderColor: m.hasBorderColor === false ? '#334155' : m.color,
                          backgroundColor: m.hasBorderColor === false ? 'rgba(30, 41, 59, 0.4)' : `${m.color}20`,
                          boxShadow: m.hasBorderColor === false ? 'none' : `0 0 8px ${m.color}40`
                        }}
                      >
                        {m.image ? (
                          <img 
                            src={m.image} 
                            alt={m.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          m.avatar
                        )}
                      </div>

                      {/* Thumbnail da Arma Dedicada do Personagem (com borda branca, idêntica ao painel de combate) */}
                      <div 
                        className="w-11 h-11 rounded-xl border-2 bg-slate-950 flex flex-col items-center justify-center shrink-0 shadow-md overflow-hidden"
                        title={`${heroWeapon?.name || m.equipment} (${heroWeapon?.category || 'Arma'})`}
                        style={{
                          borderColor: '#ffffff',
                          boxShadow: '0 0 8px rgba(255, 255, 255, 0.30)'
                        }}
                      >
                        <div 
                          className="w-[44px] h-[25px] bg-no-repeat"
                          style={{
                            backgroundImage: 'url(/assets/weapon-roster.png?v=4)',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '572px 25px',
                            backgroundPosition: `-${(heroWeapon?.sourceIndex ?? 0) * 44}px center`,
                            transform: 'scaleX(-1) scale(1.4)',
                            imageRendering: 'pixelated',
                            filter: 'drop-shadow(0 0 1px rgba(255, 255, 255, 0.7))'
                          }} 
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-tech font-bold text-sm text-white flex items-center gap-1.5 truncate">
                          {m.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span 
                            className="text-[9px] font-bold font-tech uppercase tracking-wider px-1.5 py-0.2 rounded border shrink-0"
                            style={{ 
                              color: m.color,
                              borderColor: `${m.color}60`,
                              backgroundColor: `${m.color}15`
                            }}
                          >
                            {m.badge}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[85px]" title={heroWeapon?.name || m.equipment}>
                            {heroWeapon?.name || m.equipment}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight size={18} className={isSelected ? 'text-amber-400' : 'text-slate-600'} />
                  </div>
                );
              })}
            </div>

            {/* LADO DIREITO: CARTA COLECIONÁVEL EXPANDIDA */}
            <div className="flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar bg-slate-950 p-6 rounded-3xl border-2 border-slate-800 shadow-inner">
              
              <div>
                {/* Topo da Carta */}
                <div className="flex items-center justify-between mb-4">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-bold font-tech uppercase tracking-widest border flex items-center gap-1.5"
                    style={{ 
                      borderColor: selectedMiner.color,
                      color: selectedMiner.color,
                      backgroundColor: `${selectedMiner.color}15`,
                      boxShadow: `0 0 10px ${selectedMiner.color}30`
                    }}
                  >
                    ✦ {selectedMiner.badge} • {selectedMiner.role}
                  </span>

                  <span className="text-xs text-slate-400 font-tech">
                    ID: <b className="text-white font-mono">{selectedMiner.heroId || selectedMiner.classId}</b>
                  </span>
                </div>

                {/* Avatar e Perfil */}
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-24 h-24 rounded-3xl border-2 flex items-center justify-center text-5xl shadow-2xl overflow-hidden relative shrink-0 ring-2"
                    style={{ 
                      borderColor: selectedMiner.hasBorderColor === false ? '#334155' : selectedMiner.color,
                      backgroundColor: selectedMiner.hasBorderColor === false ? 'rgba(30, 41, 59, 0.4)' : `${selectedMiner.color}15`,
                      ringColor: selectedMiner.hasBorderColor === false ? 'transparent' : `${selectedMiner.color}50`,
                      boxShadow: selectedMiner.hasBorderColor === false ? 'none' : `0 0 20px ${selectedMiner.color}30`
                    }}
                  >
                    {selectedMiner.image ? (
                      <img 
                        src={selectedMiner.image} 
                        alt={selectedMiner.name} 
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    ) : (
                      selectedMiner.avatar
                    )}
                  </div>
                  <div>
                    <h2 className="font-arcade text-lg text-white mb-0.5">
                      {selectedMiner.name}
                    </h2>
                    <span className="text-sm text-amber-300 font-tech font-bold block">
                      "{selectedMiner.title}"
                    </span>
                    <p className="text-xs text-slate-400 font-tech mt-1 max-w-md">
                      {selectedMiner.lore}
                    </p>
                  </div>
                </div>

                {/* ARMA EQUIPADA DO HERÓI (DESTAQUE VISUAL COM SPRITE) */}
                {equippedWeapon && (
                  <div className="p-3.5 rounded-2xl border-2 border-white/20 bg-slate-900/90 shadow-md flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-16 h-16 rounded-2xl border-2 bg-slate-950 flex flex-col items-center justify-center shrink-0 shadow-lg overflow-hidden"
                        style={{
                          borderColor: '#ffffff',
                          boxShadow: '0 0 10px rgba(255, 255, 255, 0.35)'
                        }}
                      >
                        <div 
                          className="w-[44px] h-[25px] bg-no-repeat transition-transform hover:scale-125"
                          style={{
                            backgroundImage: 'url(/assets/weapon-roster.png?v=4)',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '572px 25px',
                            backgroundPosition: `-${(equippedWeapon.sourceIndex ?? 0) * 44}px center`,
                            transform: 'scaleX(-1) scale(1.65)',
                            imageRendering: 'pixelated',
                            filter: 'drop-shadow(0 0 1px rgba(255, 255, 255, 0.7))'
                          }} 
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider font-mono">ARMA EQUIPADA:</span>
                          <h4 className="font-tech font-bold text-sm text-white">
                            {equippedWeapon.name}
                          </h4>
                          <span className="text-[9px] bg-slate-800 text-amber-300 px-1.5 py-0.2 rounded border border-slate-700 font-mono">
                            {equippedWeapon.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-tech mt-0.5">
                          {equippedWeapon.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-emerald-400 block">
                        {equippedWeapon.damage || '+3 Poder'}
                      </span>
                      <span className="text-[11px] font-mono text-amber-400 block">
                        {equippedWeapon.critBonus || '+10% Crítico'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Atributos Base */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 font-tech flex items-center justify-center gap-1">
                      <Flame size={13} className="text-rose-400" /> FORÇA DO GOLPE
                    </span>
                    <span className="font-arcade text-lg text-white font-bold block mt-1">
                      {selectedMiner.basePower}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 font-tech flex items-center justify-center gap-1">
                      <Zap size={13} className="text-amber-400" /> VELOCIDADE
                    </span>
                    <span className="font-arcade text-lg text-white font-bold block mt-1">
                      {selectedMiner.baseSpeed}
                    </span>
                  </div>

                </div>

                {/* Habilidade Passiva Exclusiva (Trait) */}
                <div 
                  className="p-4 rounded-2xl border bg-slate-900/70"
                  style={{ borderColor: `${selectedMiner.color}40` }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={16} style={{ color: selectedMiner.color }} />
                    <span className="font-tech font-bold text-sm text-white">
                      HABILIDADE PASSIVA: {selectedMiner.passiveTrait.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-tech leading-relaxed">
                    {selectedMiner.passiveTrait.description}
                  </p>
                </div>
              </div>

              {/* Rodapé da Carta */}
              <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-tech">
                  Disponível no Recrutamento ou Contrato Direto por <b className="text-amber-300 font-mono">{selectedMiner.directCostBcoin * 100} MNC</b>.
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onOpenMintModal();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade text-xs font-bold transition shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>RECRUTAR COMBATENTE</span>
                </button>
              </div>

            </div>

          </div>
        )}

        {/* CONTEÚDO PRINCIPAL: ARSENAL DE ARMAS (NOVA SEÇÃO COMPLETA) */}
        {activeTab === 'weapons' && (
          <div className="flex-1 flex gap-6 overflow-hidden pt-4">
            
            {/* LADO ESQUERDO: LISTA DO ARSENAL DE ARMAS */}
            <div className="w-72 lg:w-80 overflow-y-auto space-y-2 pr-1 no-scrollbar shrink-0">
              {WEAPON_CATALOG.map((w) => {
                const isSelected = selectedWeapon.id === w.id;
                return (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWeapon(w)}
                    className={`p-3 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/20 shadow-md ring-1 ring-amber-400/50'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Frame da Arma com Sprite */}
                      <div 
                        className="w-13 h-13 rounded-xl border-2 bg-slate-950 flex flex-col items-center justify-center shrink-0 shadow-inner overflow-hidden"
                        style={{
                          borderColor: isSelected ? '#fbbf24' : '#64748b',
                          boxShadow: isSelected ? '0 0 10px rgba(251, 191, 36, 0.4)' : 'none'
                        }}
                      >
                        <div 
                          className="w-[44px] h-[25px] bg-no-repeat"
                          style={{
                            backgroundImage: 'url(/assets/weapon-roster.png?v=4)',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '572px 25px',
                            backgroundPosition: `-${(w.sourceIndex ?? 0) * 44}px center`,
                            transform: 'scaleX(-1) scale(1.45)',
                            imageRendering: 'pixelated',
                            filter: 'drop-shadow(0 0 1px rgba(255, 255, 255, 0.7))'
                          }} 
                        />
                      </div>
                      <div>
                        <h4 className="font-tech font-bold text-sm text-white">
                          {w.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] bg-slate-800 text-amber-300 px-1.5 py-0.2 rounded border border-slate-700 font-mono">
                            {w.category}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-400">
                            {w.damage || '+3 Poder'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight size={18} className={isSelected ? 'text-amber-400' : 'text-slate-600'} />
                  </div>
                );
              })}
            </div>

            {/* LADO DIREITO: CARTA DETALHADA DA ARMA */}
            <div className="flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar bg-slate-950 p-6 rounded-3xl border-2 border-slate-800 shadow-inner">
              
              <div>
                {/* Topo do Card de Arma */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold font-tech uppercase tracking-widest border border-amber-500/40 text-amber-400 bg-amber-500/10 shadow-sm flex items-center gap-1.5">
                    🔫 {selectedWeapon.category} • ARSENAL MILITAR
                  </span>

                  <span className="text-xs text-slate-400 font-tech">
                    Herói Principal: <b className="text-amber-300">{selectedWeapon.hero || 'Combatentes'}</b>
                  </span>
                </div>

                {/* Showcase Gigante da Arma */}
                <div className="relative w-full h-36 rounded-3xl border-2 border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 shadow-2xl mb-5 overflow-hidden group">
                  <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Sprite da Arma Ampliado com Borda Luminosa */}
                  <div 
                    className="w-[88px] h-[50px] bg-no-repeat transition-transform duration-300 group-hover:scale-125"
                    style={{
                      backgroundImage: 'url(/assets/weapon-roster.png?v=4)',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1144px 50px',
                      backgroundPosition: `-${(selectedWeapon.sourceIndex ?? 0) * 88}px center`,
                      transform: 'scaleX(-1) scale(1.35)',
                      imageRendering: 'pixelated',
                      filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.45))'
                    }} 
                  />

                  <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between text-xs text-slate-400 font-tech">
                    <span>Frame #{selectedWeapon.sourceIndex + 1}</span>
                    <span className="text-emerald-400 font-mono font-bold">{selectedWeapon.damage || '+3 Poder'}</span>
                  </div>
                </div>

                {/* Identificação e Lore */}
                <div className="mb-4">
                  <h2 className="font-arcade text-lg text-white mb-1">
                    {selectedWeapon.name}
                  </h2>
                  <p className="text-xs text-slate-300 font-tech leading-relaxed">
                    {selectedWeapon.description || 'Armamento balístico calibrado para sobrevivência em território infectado.'}
                  </p>
                </div>

                {/* Atributos da Arma */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                  <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-tech block">PODER DE FOGO</span>
                    <span className="font-arcade text-sm text-emerald-400 font-bold block mt-1">
                      {selectedWeapon.damage || '+3'}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-tech block">CHANCE CRÍTICA</span>
                    <span className="font-arcade text-sm text-amber-400 font-bold block mt-1">
                      {selectedWeapon.critBonus || '+10%'}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-tech block">CADÊNCIA</span>
                    <span className="font-arcade text-xs text-sky-400 font-bold block mt-1">
                      {selectedWeapon.cadence || 'Média'}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-tech block">ALCANCE</span>
                    <span className="font-arcade text-xs text-purple-400 font-bold block mt-1">
                      {selectedWeapon.range || 'Médio'}
                    </span>
                  </div>
                </div>

                {/* Informação de Especialista Compatível */}
                <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg border border-amber-500/40">
                      🎯
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-tech block">HERÓI ESPECIALISTA:</span>
                      <span className="font-tech font-bold text-sm text-white">
                        {selectedWeapon.hero || 'Combatentes'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const matchedHero = MINER_ROSTER.find(h => h.weaponId === selectedWeapon.id || h.name.toLowerCase() === (selectedWeapon.hero || '').toLowerCase());
                      if (matchedHero) {
                        setSelectedMiner(matchedHero);
                        setActiveTab('heroes');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-arcade text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>VER HERÓI</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>

              {/* Rodapé do Arsenal */}
              <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-tech">
                  Arma forjada e atribuída a cada combatente no recrutamento oficial.
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onOpenMintModal();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade text-xs font-bold transition shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>FORJAR / RECRUTAR</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
