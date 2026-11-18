import React, { useMemo, useState } from 'react';
import { X, Home, Layers, Info, BarChart3, Sparkles, Settings } from 'lucide-react';
import { calculateRoiScenario } from '../utils/roiSimulatorEngine';
import { getCriptoMynersConfig } from '../data/criptoMynersConfig';

const TIERS = [
  ['common','Comum','text-slate-200'],['rare','Raro','text-sky-300'],
  ['superRare','Super Raro','text-cyan-300'],['epic','Épico','text-purple-300'],
  ['legendary','Lendário','text-amber-300'],['superLegendary','Super Lendário','text-orange-300']
];
const money = n => Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});

export default function RoiSimulatorModal({isOpen,onClose,onOpenSummonModal,onOpenAdminConfig}) {
  const [chestMix,setChestMix]=useState({miner:0,explorer:0,elite:0,legendary:0});
  const [heroCounts,setHeroCounts]=useState({common:0,rare:0,superRare:0,epic:0,legendary:0,superLegendary:0});
  const [selectedHouse,setSelectedHouse]=useState('basic');
  const [sessionHours,setSessionHours]=useState(24);
  if(!isOpen)return null;
  const config=getCriptoMynersConfig();
  const chests=Object.values(config.chests);
  const mix=chests.map(c=>({id:c.id,quantity:Number(chestMix[c.id])||0}));
  const data=calculateRoiScenario({chestMix:mix,heroCounts,houseId:selectedHouse,sessionHours,config});
  const setChest=(id,value)=>setChestMix(old=>({...old,[id]:Math.max(0,Math.floor(Number(value)||0))}));
  const setHero=(id,value)=>setHeroCounts(old=>({...old,[id]:Math.max(0,Math.floor(Number(value)||0))}));
  const reset=()=>{setChestMix({miner:0,explorer:0,elite:0,legendary:0});setHeroCounts({common:0,rare:0,superRare:0,epic:0,legendary:0,superLegendary:0});setSelectedHouse('basic');setSessionHours(24);};
  const fmtDays=data.paybackDays===null?'—':data.paybackDays.toLocaleString('pt-BR');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl p-5 sm:p-6 bg-slate-900 border-2 border-amber-500/40 text-slate-100 shadow-2xl flex flex-col overflow-hidden font-tech" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div><h2 className="font-arcade text-sm sm:text-base text-amber-400 tracking-wider">SIMULADOR DE ROI — CRIPTO MYNERS</h2><p className="text-xs text-slate-400">Monte sua compra de baús e escolha a equipe que deseja simular.</p></div>
          <div className="flex items-center gap-2">
            {onOpenAdminConfig&&<button onClick={onOpenAdminConfig} className="px-3 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 border border-slate-700"><Settings size={14}/></button>}
            <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white"><X size={20}/></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4">
          <section className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex gap-2 items-center"><Layers size={14} className="text-amber-400"/>1. Monte sua compra de baús</span><b className="text-xs text-amber-300">{data.chestQuantity} baús • {data.chestHeroes} heróis nos pacotes</b></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {chests.map(c=><div key={c.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <span className="text-2xl">{c.icon}</span><div className="flex-1 min-w-0"><b className="block text-xs text-white">{c.name}</b><span className="text-[10px] text-slate-400">{c.heroesCount} heróis • US$ {money(c.costUsdt)} cada</span></div>
                <label className="text-[10px] text-slate-400">Qtd.<input type="number" min="0" step="1" value={chestMix[c.id]||0} onChange={e=>setChest(c.id,e.target.value)} className="block w-20 mt-1 rounded-lg bg-slate-950 border border-slate-700 px-2 py-1.5 text-white text-sm"/></label>
              </div>)}
            </div>
            <div className="flex flex-wrap justify-between gap-2 pt-2 border-t border-slate-800 text-xs"><span className="text-slate-400">Custo dos baús: <b className="text-white">US$ {money(data.chestCost)}</b></span><span className="text-amber-300 font-bold">Investimento em baús: US$ {money(data.chestCost)}</span></div>
          </section>
          <section className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2"><span className="text-xs font-bold text-slate-300 uppercase tracking-wider">2. Escolha a composição dos heróis</span><span className="text-xs text-emerald-300">{data.totalHeroes} heróis selecionados</span></div>
            <p className="text-[11px] text-slate-400">Informe quantos heróis de cada raridade deseja usar na projeção. Essa composição é manual e não é sorteada pelas probabilidades dos baús.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TIERS.map(([id,label,color])=><label key={id} className="p-3 rounded-xl bg-slate-900 border border-slate-800"><span className={`block text-xs font-bold ${color}`}>{label}</span><input type="number" min="0" step="1" value={heroCounts[id]} onChange={e=>setHero(id,e.target.value)} className="mt-2 w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white text-sm"/></label>)}
            </div>
            <div className="text-[11px] text-slate-400">Capacidade simultânea da mina: até 15 heróis. Heróis adicionais entram como reserva para revezamento.</div>
          </section>
          <section className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2"><Home size={14} className="text-blue-400"/>3. Abrigo e tempo conectado</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">{Object.values(config.houses).filter(h=>['basic','reinforced','advanced'].includes(h.id)).map(h=><button key={h.id} onClick={()=>setSelectedHouse(h.id)} className={`p-3 rounded-xl border text-left ${selectedHouse===h.id?'border-blue-400 bg-blue-950/30':'border-slate-800 bg-slate-900'}`}><b className="block text-xs text-white">{h.icon} {h.name}</b><span className="text-[10px] text-slate-400">{h.slots} camas • {Math.round(h.recoverySpeedMultiplier*100)}% recuperação</span><span className="block text-[10px] text-blue-300 mt-1">{h.id==='basic'?'Grátis':`${h.constructionFragments||0} fragmentos + ${Number(h.costMiner||0).toLocaleString('pt-BR')} MNC`}</span></button>)}</div>
            <label className="block text-xs text-slate-300">Horas por dia com o jogo aberto e conectado: <b className="text-amber-300">{sessionHours}h</b><input type="range" min="1" max="24" value={sessionHours} onChange={e=>setSessionHours(Number(e.target.value))} className="block w-full mt-2 accent-amber-400"/><span className="flex justify-between text-[10px] text-slate-500"><span>1 hora</span><span>24 horas</span></span></label>
          </section>
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800"><span className="text-[10px] text-slate-400">Investimento total*</span><b className="block text-lg text-white">US$ {money(data.totalInvestment)}</b><span className="text-[10px] text-slate-500">Baús + abrigo em MNC</span></div>
            <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30"><span className="text-[10px] text-emerald-400">Produção diária</span><b className="block text-lg text-emerald-300">+{money(data.effectiveCoinsPerDay)} MNC</b><span className="text-[10px] text-slate-400">≈ US$ {money(data.dailyUsd)}/dia</span></div>
            <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30"><span className="text-[10px] text-amber-400">ROI diário estimado</span><b className="block text-lg text-amber-300">{data.roiDailyPct}%</b><span className="text-[10px] text-slate-400">{money(data.effectiveCoinsPerMonth)} MNC/mês</span></div>
            <div className="bg-slate-950 p-3 rounded-xl border border-purple-500/30"><span className="text-[10px] text-purple-300">Payback estimado</span><b className="block text-lg text-purple-300">{fmtDays} dias</b><span className="text-[10px] text-slate-400">Projeção matemática</span></div>
          </section>
          <section className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2"><BarChart3 size={14}/>Projeção acumulada (referência USDT)</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{[[30,data.projectedReturn30d],[60,data.projectedReturn60d],[90,data.projectedReturn90d],[180,data.projectedReturn180d]].map(([days,value])=><div key={days} className="bg-slate-900 p-3 rounded-xl"><span className="text-[10px] text-slate-400">{days} dias</span><b className="block text-white">US$ {money(value)}</b></div>)}</div>
          </section>
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400 flex gap-2"><Info size={15} className="text-amber-400 shrink-0"/><p>*O custo dos baús é calculado pela combinação escolhida. A equipe simulada é independente dos baús e pode não corresponder aos heróis efetivamente obtidos. A referência de conversão é 1 MNC = US$ {Number(config.minerCoinUsdtRate||.01).toFixed(2)}; não representa cotação garantida. A mineração só ocorre com o jogo aberto e conectado. Estimativa não é garantia de retorno.</p></div>
        </div>
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button onClick={reset} className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">Restaurar padrão</button>
          <div className="flex gap-2"><button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">Fechar</button><button onClick={()=>{onClose();onOpenSummonModal?.();}} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"><Sparkles size={15}/>IR PARA A LOJA DE BAÚS</button></div>
        </div>
      </div>
    </div>
  );
}
