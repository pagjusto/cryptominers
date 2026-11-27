import React from 'react';
import { 
  Flame, 
  HeartPulse, 
  Play,
  Pause, 
  Wrench, 
  Sparkles, 
  Lock, 
  Shield,
  Clock,
  Pickaxe
} from 'lucide-react';
import { MINER_CLASSES } from '../data/minersData';
import { HERO_ROSTER, getWeaponById, getRarityConfig } from '../data/heroRoster';
import { getMinerActiveDays } from './HeroEvolutionModal';

export default function HeroList({ 
  miners, 
  gold, 
  onUpgradeMiner, 
  onToggleStatus, 
  onAllWork, 
  onRepairMiner,
  onDiversifyTeam,
  isIrisActive = true,
  isArmorerActive = false,
  armorerContract = null,
  onOpenArmorerHire,
  onOpenHouseModal,
  onOpenEvolutionModal
}) {
  const workingCount = miners.filter(m => m.status === 'work').length;
  const injuredCount = miners.filter(m => m.status === 'injured' || m.injuredAwaitingRescue).length;
  const houseCount = miners.filter(m => m.status === 'house').length;
  const reserveCount = miners.filter(m => m.status === 'reserve' || m.status === 'sleep').length;

  const armorerDaysLeft = isArmorerActive && armorerContract?.expiresAt
    ? Math.max(0, Math.ceil((armorerContract.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl overflow-hidden font-tech text-white">
      
      {/* 1. TOPO DA EQUIPE DE SOBREVIVENTES */}
      <div className="pb-3 mb-3 border-b border-slate-800 shrink-0">
        <div className="flex flex-col gap-2">
          {/* Linha 1: Título e Contadores de Combate */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-arcade text-xs sm:text-sm text-amber-400 tracking-wide">
                EQUIPE DE SOBREVIVENTES
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 text-[10px] font-mono whitespace-nowrap">
                {workingCount}/15 EM COMBATE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700 text-[10px] font-mono whitespace-nowrap">
                {miners.length} TOTAL
              </span>
              {injuredCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 text-[10px] font-mono whitespace-nowrap">
                  {injuredCount} FERIDOS
                </span>
              )}
            </div>
          </div>

          {/* Linha 2: Subtotais e Botões de Ação em Massa */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>🩺 No abrigo: <b className="text-blue-400">{houseCount}</b></span>
              <span>•</span>
              <span>🛡️ Reservas: <b className="text-amber-400">{reserveCount}</b></span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {onDiversifyTeam && (
                <button
                  onClick={onDiversifyTeam}
                  title="Equilibrar todas as classes na equipe"
                  className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 border border-purple-500/50 hover:bg-purple-600 hover:text-white text-purple-300 font-tech text-xs font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                >
                  <span>🎲</span>
                  <span>Classes</span>
                </button>
              )}
              <button
                onClick={onAllWork}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/30 border border-emerald-500/50 hover:bg-emerald-600 hover:text-white text-emerald-300 font-tech text-xs font-bold flex items-center gap-1 transition cursor-pointer active:scale-95 shadow-sm whitespace-nowrap shrink-0"
              >
                <Play size={12} className="fill-emerald-300 shrink-0" />
                <span>Todos ao combate</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RELÍQUIAS MÍSTICAS (EM BREVE) & EVOLUÇÃO (80 DIAS) */}
      <div className="grid grid-cols-2 gap-2 mb-3 shrink-0">
        <button
          type="button"
          disabled
          title="Relíquias & Itens (Em Breve)"
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-500 font-tech text-[11px] font-bold shadow-sm cursor-not-allowed opacity-60 select-none"
        >
          <Lock size={12} className="text-amber-500/60 shrink-0" />
          <Shield size={13} className="text-slate-500 shrink-0" />
          <span className="truncate">RELÍQUIAS (Em Breve)</span>
        </button>

        <button
          type="button"
          onClick={onOpenEvolutionModal}
          title="Evolução & Rejuvenescimento de Heróis (80 dias)"
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-gradient-to-r from-purple-900/50 to-amber-900/35 hover:from-purple-800/60 hover:to-amber-800/50 border border-purple-500/45 text-purple-200 hover:text-white font-tech text-[11px] font-bold shadow-sm transition cursor-pointer"
        >
          <Sparkles size={13} className="text-amber-400 shrink-0" />
          <span className="truncate">EVOLUÇÃO</span>
        </button>
      </div>

      {/* 3. ESPECIALISTAS DO ABRIGO: DRA. ÍRIS (HOSPITAL) & JOHN ARMEIRO (SALA DE ARMAS) */}
      <div className="grid grid-cols-1 gap-2 mb-3.5 shrink-0">
        {/* DRA. ÍRIS: TRATAMENTO E RECUPERAÇÃO DO ABRIGO */}
        <div 
          onClick={onOpenHouseModal}
          className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border border-emerald-500/40 hover:border-emerald-400 transition flex items-center justify-between group shadow-sm cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-[46px] h-[46px] sm:w-[50px] sm:h-[50px] rounded-2xl border-2 shadow-lg shrink-0 bg-slate-900/90 flex items-center justify-center overflow-hidden transition-all duration-300"
              title="Dra. Íris (Médica do Abrigo)"
              style={{
                borderColor: '#ffffff',
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.45)',
                backgroundImage: 'url(/assets/hero-avatars.png?v=4)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '676px 52px',
                backgroundPosition: '-208px center',
                imageRendering: 'auto'
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-tech font-bold text-xs sm:text-sm text-emerald-300">
                  Dra. Íris • Médica do Abrigo
                </span>
                <span className="text-[9px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-400/40 font-bold font-mono">
                  ENFERMARIA
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-tech block">
                Cuidados médicos contínuos e recuperação nos leitos do hospital
              </span>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-xl font-mono font-bold text-[10px] shrink-0 border ${
            isIrisActive
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {isIrisActive ? 'HOSPITAL ATIVO' : 'MÉDICA INATIVA'}
          </span>
        </div>

        {/* JOHN ARMEIRO: SALA DE ARMAS & REPARO AUTOMÁTICO */}
        <div 
          onClick={onOpenArmorerHire}
          className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border border-emerald-500/40 hover:border-emerald-400 transition flex items-center justify-between group shadow-sm cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-[46px] h-[46px] sm:w-[50px] sm:h-[50px] rounded-2xl border-2 shadow-lg shrink-0 bg-slate-950 flex items-center justify-center overflow-hidden transition-all duration-300"
              title="John Armeiro (Sala de Armas)"
              style={{
                borderColor: '#ffffff',
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.45)'
              }}
            >
              <img 
                src="/assets/heroes/armeiro.png" 
                alt="John Armeiro" 
                className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-tech font-bold text-xs sm:text-sm text-emerald-300">
                  John Armeiro • Sala de Armas
                </span>
                <span className="text-[9px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-400/40 font-bold font-mono">
                  SALA DE ARMAS
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-tech block">
                {isArmorerActive 
                  ? `Oficina ativa: restaura 100% das armas automaticamente (${armorerDaysLeft}d restantes)` 
                  : 'Recupera armas automaticamente a 100% sem anúncios nem pausas'}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenArmorerHire?.();
            }}
            className={`px-2.5 py-1.5 rounded-xl font-mono font-bold text-[10px] shrink-0 transition cursor-pointer flex items-center gap-1.5 shadow-md ${
              isArmorerActive
                ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 hover:bg-emerald-900/90'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-300 font-tech font-bold animate-pulse'
            }`}
          >
            <Wrench size={11} className={isArmorerActive ? 'text-emerald-400' : 'text-slate-950'} />
            <span>{isArmorerActive ? `OFICINA (${armorerDaysLeft}d)` : 'CONTRATAR'}</span>
          </button>
        </div>
      </div>

      {/* 4. LISTA DE SOBREVIVENTES */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2.5 pr-1.5 no-scrollbar">
        {miners.map((miner, index) => {
          const rosterHero = HERO_ROSTER.find(hero => hero.id === miner.heroId) || HERO_ROSTER[index % HERO_ROSTER.length];
          const rosterWeapon = getWeaponById(rosterHero.weaponId);
          const rarityConfig = getRarityConfig(rosterHero.rarity);
          const classInfo = MINER_CLASSES[miner.classId] || MINER_CLASSES.miner;
          const isWorking = miner.status === 'work';
          const healthPct = Math.round(((miner.currentHealth ?? miner.maxHealth ?? 100) / (miner.maxHealth || 100)) * 100);
          const durability = miner.durability !== undefined ? Math.round(miner.durability) : 100;
          const isBroken = durability <= 0;
          const ageDays = getMinerActiveDays(miner);
          const ageReductionPct = ageDays >= 80 ? 50 : ageDays >= 70 ? 30 : ageDays >= 50 ? 15 : 0;
          const weaponReductionPct = isBroken ? 100 : 0;
          const hourlyCoins = miner.coinsPerHour || ((miner.power || 2) * 0.05 * (miner.speed || 1.2));
          const ratePerMinute = hourlyCoins / 60;
          const effectiveRatePerMinute = isBroken ? 0 : ratePerMinute * (1 - ageReductionPct / 100);

          return (
            <div 
              key={miner.id}
              className={`bg-slate-950/90 border rounded-2xl p-2.5 sm:p-3 transition hover:border-slate-700 shadow-sm flex flex-col gap-2.5 w-full ${
                isBroken 
                  ? 'border-rose-500/70 ring-1 ring-rose-500/40 bg-rose-950/10' 
                  : 'border-slate-800'
              }`}
            >
              {/* LINHA 1: IDENTIDADE DO COMBATENTE + AÇÕES E STATUS */}
              <div className="flex items-start justify-between gap-2.5 w-full">
                
                {/* AVATAR + ARMA */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Avatar do Herói (Borda com a Cor Oficial da Raridade) */}
                  <div 
                    className="w-[52px] h-[52px] rounded-2xl border-2 shadow-lg shrink-0 bg-slate-900/90 flex items-center justify-center overflow-hidden transition-all duration-300"
                    title={`${rosterHero.name} (${rarityConfig.name})`}
                    style={{
                      borderColor: rarityConfig.hasBorderColor === false ? '#334155' : rarityConfig.color,
                      boxShadow: rarityConfig.hasBorderColor === false ? 'none' : `0 0 10px ${rarityConfig.glowColor}`,
                      backgroundImage: 'url(/assets/hero-avatars.png?v=4)',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '676px 52px',
                      backgroundPosition: `-${rosterHero.spriteIndex * 52}px center`,
                      imageRendering: 'auto'
                    }} 
                  />

                  {/* Thumbnail da Arma (Quadro com Borda Branca Destacada e Contorno Luminoso) */}
                  <div 
                    className="w-[52px] h-[52px] rounded-2xl border-2 bg-slate-900/90 flex flex-col items-center justify-center shrink-0 shadow-md group hover:border-white transition-all duration-300 overflow-hidden"
                    title={`${rosterWeapon?.name || 'Sem arma'} (${rosterWeapon?.category || ''})`}
                    style={{
                      borderColor: '#ffffff',
                      boxShadow: '0 0 8px rgba(255, 255, 255, 0.25)'
                    }}
                  >
                    <div 
                      className="w-[44px] h-[25px] bg-no-repeat transition-transform group-hover:scale-[1.85]"
                      style={{
                        backgroundImage: 'url(/assets/weapon-roster.png?v=4)',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '572px 25px',
                        backgroundPosition: `-${(rosterWeapon?.sourceIndex || 0) * 44}px center`,
                        transform: 'scaleX(-1) scale(1.68)',
                        imageRendering: 'pixelated',
                        filter: 'drop-shadow(0 0 1px rgba(255, 255, 255, 0.7))'
                      }} 
                    />
                  </div>
                </div>

                {/* INFORMAÇÕES DE NOME, CLASSE E TRAIT */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-tech font-bold text-sm text-white truncate max-w-[140px]" title={rosterHero.name}>
                      {rosterHero.name}
                    </span>
                    <span 
                      className="text-[8px] px-1.5 py-0.5 rounded border font-bold uppercase shrink-0 font-mono tracking-wider"
                      style={{
                        backgroundColor: rarityConfig.badgeBg,
                        color: rarityConfig.badgeText,
                        borderColor: rarityConfig.badgeBorder
                      }}
                    >
                      {rarityConfig.name}
                    </span>
                    {miner.stars > 0 && (
                      <span className="text-[9px] px-1 py-0.2 rounded-md bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40 shrink-0">
                        {'★'.repeat(miner.stars)}
                      </span>
                    )}
                  </div>

                  {/* Classe do Herói */}
                  <div className="text-[11px] font-bold tracking-wide mt-0.5 truncate" style={{ color: classInfo.color }}>
                    {rosterHero.className}
                  </div>

                  {/* Trait Passivo */}
                  {miner.passiveTrait && (
                    <div className="text-[9px] text-amber-300/90 font-tech flex items-center gap-1 mt-0.5 truncate" title={miner.passiveTrait.description}>
                      <span>✦ {miner.passiveTrait.name}</span>
                    </div>
                  )}

                  {/* Relíquias Equipadas */}
                  {miner.equippedGear && (
                    <div className="flex items-center gap-1 mt-0.5">
                      {miner.equippedGear.weapon && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded border border-amber-500/30" title={miner.equippedGear.weapon.name}>
                          {miner.equippedGear.weapon.icon}
                        </span>
                      )}
                      {miner.equippedGear.helmet && (
                        <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1 py-0.2 rounded border border-sky-500/30" title={miner.equippedGear.helmet.name}>
                          {miner.equippedGear.helmet.icon}
                        </span>
                      )}
                      {miner.equippedGear.amulet && (
                        <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 py-0.2 rounded border border-purple-500/30" title={miner.equippedGear.amulet.name}>
                          {miner.equippedGear.amulet.icon}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* STATUS & BOTÃO PAUSAR/ATIVAR NO TOPO DIREITO */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {/* Badge de Status Atual */}
                  <div>
                    {miner.status === 'house' && (
                      <span className="text-[9px] font-bold font-tech px-2 py-0.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1 animate-pulse whitespace-nowrap" title="Recuperando vida no abrigo">
                        🩺 NO ABRIGO
                      </span>
                    )}
                    {miner.status === 'waiting_house' && (
                      <span className="text-[9px] font-bold font-tech px-2 py-0.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 whitespace-nowrap" title="Aguardando leito no abrigo">
                        ⏳ FILA DO ABRIGO
                      </span>
                    )}
                    {miner.status === 'reserve' && (
                      <span className="text-[9px] font-bold font-tech px-2 py-0.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 whitespace-nowrap" title="Na reserva, pronto para revezar">
                        🛡️ RESERVA
                      </span>
                    )}
                    {(miner.status === 'injured' || miner.injuredAwaitingRescue) && (
                      <span className="text-[9px] font-bold font-tech px-2 py-0.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 whitespace-nowrap" title="Ferido: não combate nem minera; aguardando resgate">
                        🩹 FERIDO — AGUARDANDO RESGATE
                      </span>
                    )}
                    {miner.status === 'work' && (
                      <span className="text-[9px] font-bold font-tech px-2 py-0.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 whitespace-nowrap" title="Combatendo zumbis automaticamente">
                        ⚔️ EM COMBATE
                      </span>
                    )}
                  </div>

                  {/* Botão de Ação */}
                  <button
                    onClick={() => onToggleStatus(miner.id)}
                    disabled={miner.status === 'house' || miner.status === 'waiting_house' || miner.status === 'injured' || miner.injuredAwaitingRescue}
                    className={`px-3 py-1 rounded-xl text-[10px] font-tech font-bold flex items-center justify-center gap-1 transition cursor-pointer active:scale-95 shadow-sm shrink-0 whitespace-nowrap ${
                      isWorking
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                        : (miner.status === 'house'
                            ? 'bg-blue-600 text-white'
                            : (miner.status === 'waiting_house'
                                ? 'bg-amber-600 text-white'
                                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'))
                    }`}
                  >
                    {isWorking ? <Pause size={10} /> : <Play size={10} className="fill-current" />}
                    <span>
                      {isWorking 
                        ? 'PAUSAR' 
                        : (miner.status === 'house' 
                            ? 'TRATANDO' 
                            : (miner.status === 'waiting_house' ? 'AGUARDANDO' : 'ATIVAR'))}
                    </span>
                  </button>
                </div>
              </div>

              {/* LINHA 2: BANDEJA DE ATRIBUTOS, BARRA DE VIDA E DURABILIDADE */}
              <div className="bg-slate-900/70 p-2 rounded-xl border border-slate-800/80 flex flex-col gap-1.5 w-full">
                {/* Atributos Básicos & Porcentagem de Vida */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span 
                      className={`flex items-center gap-1 font-bold ${isBroken ? 'text-rose-400' : 'text-amber-400'}`}
                      title={`Taxa base: ${ratePerMinute.toFixed(4)} MNC/min • Idade: -${ageReductionPct}% • Arma: -${weaponReductionPct}%`}
                    >
                      <Pickaxe size={12} className={isBroken ? 'text-rose-400' : 'text-amber-400'} /> {effectiveRatePerMinute.toFixed(3)} MNC/min
                    </span>
                    <span className="flex items-center gap-1 text-sky-400 font-bold" title="Vida máxima">
                      <HeartPulse size={12} /> {miner.maxHealth || 100}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        ageDays >= 80
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                          : ageDays >= 70
                            ? 'bg-orange-500/15 text-orange-300 border-orange-500/40'
                            : ageDays >= 50
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      }`}
                      title={`Idade do herói: ${ageDays}/80 dias • Redução por idade: -${ageReductionPct}% na produção de Coins`}
                    >
                      <Clock size={10} />
                      <span>{ageDays}/80d</span>
                      <span className="opacity-90">({ageReductionPct > 0 ? `-${ageReductionPct}%` : '0%'})</span>
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold font-mono ${
                    healthPct > 40 ? 'text-emerald-400' : (healthPct > 15 ? 'text-amber-400' : 'text-rose-400')
                  }`}>
                    {healthPct}% VIDA
                  </span>
                </div>

                {/* Barra de Vida Contínua de Ponta a Ponta */}
                <div className="w-full bg-slate-800/90 rounded-full h-2 overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      healthPct > 40 
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                        : (healthPct > 15 
                            ? 'bg-gradient-to-r from-amber-500 to-amber-400' 
                            : 'bg-gradient-to-r from-rose-600 to-rose-500')
                    }`}
                    style={{ width: `${healthPct}%` }}
                  />
                </div>

                {/* Durabilidade da Arma & Botão Consertar */}
                <div className="flex items-center justify-between border-t border-slate-800/60 pt-1 text-[10px] gap-2">
                  <span className="flex items-center gap-1.5 text-slate-300 truncate">
                    <Wrench size={11} className={isBroken ? 'text-rose-500 animate-bounce shrink-0' : 'text-slate-400 shrink-0'} />
                    <span className="truncate">
                      <b className="text-amber-300/90">{rosterWeapon?.name || 'Arma'}</b>:{' '}
                      <span className={isBroken ? 'text-rose-400 font-bold font-mono' : 'text-slate-400 font-mono'}>
                        {durability}%
                      </span>
                    </span>
                    {isBroken ? (
                      <span className="text-[9px] text-rose-400 font-bold whitespace-nowrap bg-rose-500/20 px-1.5 py-0.2 rounded border border-rose-500/30">
                        QUEBRADA (-100% MNC)
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap">
                        (Redução arma: 0%)
                      </span>
                    )}
                  </span>

                  {isArmorerActive ? (
                    <span className="text-[9px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/40 flex items-center gap-1 font-tech shrink-0">
                      <Wrench size={9} className="text-amber-400" />
                      <span>Armeiro Ativo</span>
                    </span>
                  ) : (
                    durability < 100 && (
                      <button
                        onClick={() => onRepairMiner(miner.id)}
                        className={`px-2.5 py-0.5 rounded-lg font-bold transition flex items-center gap-1 text-[9px] cursor-pointer shadow-sm whitespace-nowrap shrink-0 ${
                          isBroken
                            ? 'bg-rose-500 hover:bg-rose-400 text-slate-950 border border-rose-400 animate-pulse'
                            : 'bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        <Wrench size={9} />
                        <span>Consertar</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
