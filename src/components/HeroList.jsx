import React from 'react';
import { 
  Flame, 
  Zap, 
  HeartPulse, 
  Play,
  Pause, 
  ArrowUpCircle, 
  Wrench, 
  Sparkles, 
  Lock, 
  Shield,
  Clock
} from 'lucide-react';
import { MINER_CLASSES } from '../data/minersData';
import { HERO_ROSTER, getWeaponById } from '../data/heroRoster';

export default function HeroList({ 
  miners, 
  gold, 
  onUpgradeMiner, 
  onToggleStatus, 
  onAllWork, 
  onOpenEnergyBoostAd,
  onOpenEnergyRecoveryModal,
  onRepairMiner,
  onDiversifyTeam,
  onOpenFusionModal,
  onOpenGearModal
}) {
  const workingCount = miners.filter(m => m.status === 'work').length;
  const houseCount = miners.filter(m => m.status === 'house').length;
  const reserveCount = miners.filter(m => m.status === 'reserve' || m.status === 'sleep').length;

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl overflow-hidden font-tech text-white">
      
      {/* 1. TOPO DA EQUIPE DE SOBREVIVENTES */}
      <div className="pb-3 mb-3 border-b border-slate-800 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-arcade text-xs sm:text-sm text-amber-400 tracking-wide">
                EQUIPE DE SOBREVIVENTES
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 text-[10px] font-mono">
                {workingCount}/15 EM COMBATE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700 text-[10px] font-mono">
                {miners.length} TOTAL
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
              <span>🩺 No abrigo: <b className="text-blue-400">{houseCount}</b></span>
              <span>•</span>
              <span>🛡️ Reservas: <b className="text-amber-400">{reserveCount}</b></span>
            </div>
          </div>

          {/* Botões rápidos em massa */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onDiversifyTeam && (
              <button
                onClick={onDiversifyTeam}
                title="Equilibrar todas as classes na equipe"
                className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 border border-purple-500/50 hover:bg-purple-600 hover:text-white text-purple-300 font-tech text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <span>🎲</span>
                <span>Classes</span>
              </button>
            )}
            <button
              onClick={onAllWork}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/30 border border-emerald-500/50 hover:bg-emerald-600 hover:text-white text-emerald-300 font-tech text-xs font-bold flex items-center gap-1 transition cursor-pointer active:scale-95 shadow-sm"
            >
              <Play size={12} className="fill-emerald-300" />
              <span>Todos ao combate</span>
            </button>
            </div>
        </div>
      </div>

      {/* 2. RECURSOS RPG: FUSÃO (QUEIMA DE HERÓIS) & RELÍQUIAS MÍSTICAS */}
      <div className="grid grid-cols-2 gap-2.5 mb-3 shrink-0">
        <button
          onClick={onOpenFusionModal}
          title="Fusão de Heróis (Recurso trancado por enquanto)"
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 hover:border-amber-400/60 text-slate-300 hover:text-white font-tech text-xs font-bold transition shadow-sm cursor-pointer group"
        >
          <Lock size={12} className="text-amber-400 group-hover:scale-110 transition shrink-0" />
          <Flame size={13} className="text-rose-400 shrink-0" />
          <span>FUSÃO DE HERÓIS (★)</span>
        </button>

        <button
          onClick={onOpenGearModal}
          title="Relíquias Místicas (Recurso trancado por enquanto)"
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900 border border-sky-500/30 hover:border-amber-400/60 text-slate-300 hover:text-white font-tech text-xs font-bold transition shadow-sm cursor-pointer group"
        >
          <Lock size={12} className="text-amber-400 group-hover:scale-110 transition shrink-0" />
          <Shield size={13} className="text-sky-400 shrink-0" />
          <span>RELÍQUIAS & ITENS</span>
        </button>
      </div>

      {/* 3. STATUS DO TRATAMENTO AUTOMÁTICO */}
      <div 
        className="mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-amber-500/15 border border-emerald-500/30 hover:border-emerald-400 transition flex items-center justify-between group shadow-sm shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl group-hover:scale-110 transition shadow-inner">
            ❤️‍🩹
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-tech font-bold text-xs sm:text-sm text-emerald-300">
                Tratamento de ferimentos
              </span>
              <span className="text-[9px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-400/40 font-bold font-mono">
                AUTOMÁTICO
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-tech block">
              Recurso de tratamento acelerado será integrado após a rede de anúncios real
            </span>
          </div>
        </div>

        <button disabled className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 font-arcade font-bold text-[10px] shrink-0 cursor-not-allowed">
          EM BREVE
        </button>
      </div>

      {/* 4. LISTA DE SOBREVIVENTES */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2.5 pr-1.5 no-scrollbar">
        {miners.map((miner, index) => {
          const rosterHero = HERO_ROSTER.find(hero => hero.id === miner.heroId) || HERO_ROSTER[index % HERO_ROSTER.length];
          const rosterWeapon = getWeaponById(rosterHero.weaponId);
          const classInfo = MINER_CLASSES[miner.classId] || MINER_CLASSES.miner;
          const upgradeCost = parseFloat((2.5 * Math.pow(1.6, miner.level - 1)).toFixed(2));
          const canUpgrade = gold >= upgradeCost;
          const isWorking = miner.status === 'work';
          const staminaPct = Math.round(((miner.currentHealth ?? miner.maxHealth ?? 100) / (miner.maxHealth || 100)) * 100);
          const durability = miner.durability !== undefined ? Math.round(miner.durability) : 100;
          const isDull = durability <= 20;

          return (
            <div 
              key={miner.id}
              className={`bg-slate-950/80 border rounded-2xl p-2.5 sm:p-3 transition hover:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2.5 overflow-hidden w-full ${
                isDull ? 'border-amber-500/50 ring-1 ring-amber-500/20' : 'border-slate-800'
              }`}
            >
              {/* COLUNA 1: IDENTIDADE DO HERÓI (AVATAR, NOME, CLASSE, TRAIT) */}
              <div className="flex items-center gap-3 shrink-0 min-w-[245px] max-w-[270px]">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-14 h-14 rounded-2xl border-2 shadow-lg shrink-0 bg-slate-900/90 flex items-center justify-center overflow-hidden"
                    title={rosterHero.name}
                    style={{
                      borderColor: classInfo.color,
                      backgroundImage: 'url(/assets/hero-avatars.png?v=3)',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '616px 56px',
                      backgroundPosition: `-${rosterHero.spriteIndex * 56}px center`,
                      imageRendering: 'auto'
                    }} />
                  <div className="w-13 h-14 rounded-xl border border-slate-700 bg-slate-900/80 flex flex-col items-center justify-center px-1 shrink-0">
                    <div className="w-11 h-7 bg-no-repeat" title={rosterWeapon?.name}
                      style={{
                        backgroundImage: 'url(/assets/weapon-roster.png)',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '537.8px 27.5px',
                        backgroundPosition: `-${(rosterWeapon?.sourceIndex || 0) * 48.9}px center`
                      }} />
                    <span className="text-[7.5px] text-slate-300 font-bold text-center leading-tight truncate max-w-[48px]">{rosterWeapon?.name || 'Sem arma'}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-tech font-bold text-xs sm:text-sm text-white truncate max-w-[120px]" title={rosterHero.name}>
                      {rosterHero.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shrink-0">
                      Nv.{miner.level}
                    </span>
                    <span className={`text-[8px] px-1 py-0.2 rounded border font-bold uppercase shrink-0 ${rosterHero.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : rosterHero.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : rosterHero.rarity === 'rare' ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-slate-700/60 text-slate-300 border-slate-600'}`}>
                      {rosterHero.rarityName}
                    </span>
                    {miner.stars && miner.stars > 1 && (
                      <span className="text-[9px] px-1 py-0.2 rounded-md bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40 shrink-0">
                        {'★'.repeat(miner.stars)}
                      </span>
                    )}
                  </div>

                  <span 
                    className="text-[10px] font-bold uppercase tracking-wider block truncate max-w-[125px] mt-0.5"
                    style={{ color: classInfo.color }}
                    title={miner.passiveTrait ? miner.passiveTrait.description : classInfo.specialty}
                  >
                    {rosterHero.className}
                  </span>

                  {miner.passiveTrait && (
                    <span className="text-[9px] text-amber-300/90 font-tech block truncate max-w-[125px]" title={miner.passiveTrait.description}>
                      ✦ {miner.passiveTrait.name}
                    </span>
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
              </div>

              {/* COLUNA 2: ATRIBUTOS, VIDA & EQUIPAMENTOS (ESPAÇOSO NO MEIO) */}
              <div className="flex-1 flex flex-col justify-center gap-1 bg-slate-900/60 p-2 sm:p-2.5 rounded-xl border border-slate-800/80 min-w-0">
                {/* Linha de Atributos */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5 text-rose-400 font-bold" title="Poder de ataque">
                      <Flame size={11} /> {miner.power}
                    </span>
                    <span className="flex items-center gap-0.5 text-amber-400 font-bold" title="Velocidade de movimento">
                      <Zap size={11} /> {miner.speed.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-0.5 text-sky-400 font-bold" title="Vida máxima">
                      <HeartPulse size={11} /> {miner.maxHealth || 100}
                    </span>
                  </div>


                </div>

                {/* Barra de vida */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex-1 flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] text-slate-400 font-mono w-7 shrink-0">
                      {staminaPct}%
                    </span>
                    <div className="flex-1 bg-slate-800 rounded-full h-1.5 sm:h-2 overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          staminaPct > 40 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : (staminaPct > 15 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-600 to-rose-500')
                        }`}
                        style={{ width: `${staminaPct}%` }}
                      />
                    </div>
                  </div>


                </div>

                {/* Barra de Durabilidade da Picareta */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-1 text-[10px]">
                  <span className="flex items-center gap-1 text-slate-400 truncate">
                    <Wrench size={10} className={isDull ? 'text-amber-400 animate-spin' : 'text-slate-400'} />
                    <span>Arma: <b className={isDull ? 'text-amber-400' : 'text-slate-300 font-mono'}>{durability}%</b></span>
                    {isDull && <span className="text-[9px] text-rose-400 font-bold shrink-0">(-50%)</span>}
                  </span>

                  {durability < 100 && (
                    <button
                      onClick={() => onRepairMiner(miner.id)}
                      className="px-1.5 py-0.2 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 font-bold transition flex items-center gap-0.5 text-[9px] cursor-pointer shrink-0"
                    >
                      <Sparkles size={8} />
                      <span>Afiar</span>
                    </button>
                  )}
                </div>
              </div>

              {/* COLUNA 3: STATUS, COMBATE E EVOLUÇÃO */}
              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-1.5 shrink-0 w-[125px]">
                {/* Badge de Status Atual */}
                <div>
                  {miner.status === 'house' && (
                    <span className="text-[9px] font-bold font-tech px-2 py-0.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1 animate-pulse" title="Recuperando vida no abrigo">
                      🩺 NO ABRIGO
                    </span>
                  )}
                  {miner.status === 'waiting_house' && (
                    <span className="text-[9px] font-bold font-tech px-2 py-0.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1" title="Aguardando leito no abrigo">
                      ⏳ FILA DO ABRIGO
                    </span>
                  )}
                  {miner.status === 'reserve' && (
                    <span className="text-[9px] font-bold font-tech px-2 py-0.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1" title="Na reserva, pronto para revezar">
                      🛡️ RESERVA
                    </span>
                  )}
                  {miner.status === 'work' && (
                    <span className="text-[9px] font-bold font-tech px-2 py-0.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1" title="Combatendo zumbis automaticamente">
                      ⚔️ EM COMBATE
                    </span>
                  )}
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center gap-1 w-full justify-end">
                  <button
                    onClick={() => onToggleStatus(miner.id)}
                    disabled={miner.status === 'house' || miner.status === 'waiting_house'}
                    className={`px-2 py-1.5 rounded-xl text-[9px] font-tech font-bold flex items-center justify-center gap-0.5 transition cursor-pointer active:scale-95 shadow-sm shrink-0 ${
                      isWorking
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                        : (miner.status === 'house'
                            ? 'bg-blue-600 hover:bg-emerald-500 text-white hover:text-slate-950'
                            : (miner.status === 'waiting_house'
                                ? 'bg-amber-600 text-white hover:bg-amber-500'
                                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'))
                    }`}
                  >
                    {isWorking ? <Pause size={9} /> : <Play size={9} className="fill-current" />}
                    <span>
                      {isWorking 
                        ? 'PAUSAR' 
                        : (miner.status === 'house' 
                            ? 'TRATANDO' 
                            : (miner.status === 'waiting_house' ? 'AGUARDANDO' : 'ATIVAR'))}
                    </span>
                  </button>

                  <button
                    onClick={() => onUpgradeMiner(miner.id, upgradeCost)}
                    disabled={!canUpgrade}
                    className={`px-2 py-1.5 rounded-xl font-tech font-bold text-[9px] flex items-center justify-center gap-0.5 transition shrink-0 ${
                      canUpgrade
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95 cursor-pointer'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800'
                    }`}
                    title={canUpgrade ? `Evoluir nível por ${upgradeCost} BCOIN` : `Necessário ${upgradeCost} BCOIN`}
                  >
                    <ArrowUpCircle size={10} />
                    <span>+{upgradeCost}B</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
