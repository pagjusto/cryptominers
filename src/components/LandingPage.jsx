import React, { useState } from 'react';
import {
  Skull,
  LogIn,
  UserPlus,
  Play,
  LogOut,
  Pickaxe,
  ShieldCheck,
  HeartPulse,
  Wrench,
  Package,
  Coins,
  Home,
  Swords,
  Sparkles,
  ChevronRight,
  Users,
  BookOpen,
  Gift
} from 'lucide-react';
import { HERO_ROSTER, RARITY_CONFIG, getRarityConfig, getWeaponById } from '../data/heroRoster';
import { DEFAULT_CRYPTO_ZOMBIES_CONFIG } from '../data/cryptoZombiesConfig';
import { getHeroBaseHP } from '../utils/heroHealth';
import { ENEMIES } from '../data/enemiesCatalog';
import { HOUSE_TIERS } from '../data/housesData';
import { REFERRAL_COMMISSION_PCT, getUserReferralCode } from '../services/referralService';
import RoiSimulatorTab from './RoiSimulatorTab';

const OFFICIAL_RARITY_RATES = [
  {
    id: 'common',
    name: 'Comum',
    hp: getHeroBaseHP('common'),
    power: '1.5 – 3.0',
    coinsPerHour: '1.25 – 1.55',
    weaponCycle: '~4h',
    recovery: '6h40 / 5h20 / 4h26'
  },
  {
    id: 'rare',
    name: 'Raro',
    hp: getHeroBaseHP('rare'),
    power: '3.5 – 6.5',
    coinsPerHour: '2.25 – 2.75',
    weaponCycle: '~6h',
    recovery: '8h / 6h24 / 5h20'
  },
  {
    id: 'super_rare',
    name: 'Super Raro',
    hp: getHeroBaseHP('super_rare'),
    power: '5.5 – 9.5',
    coinsPerHour: '2.90 – 3.40',
    weaponCycle: '~8h',
    recovery: '9h20 / 7h28 / 6h13'
  },
  {
    id: 'epic',
    name: 'Épico',
    hp: getHeroBaseHP('epic'),
    power: '7.0 – 13.0',
    coinsPerHour: '3.50 – 4.10',
    weaponCycle: '~10h',
    recovery: '10h40 / 8h32 / 7h06'
  },
  {
    id: 'legendary',
    name: 'Lendário',
    hp: getHeroBaseHP('legendary'),
    power: '14.0 – 24.0',
    coinsPerHour: '6.00 – 6.84',
    weaponCycle: '~12h',
    recovery: '12h / 9h36 / 8h'
  },
  {
    id: 'super_legend',
    name: 'Super Lendário',
    hp: getHeroBaseHP('super_legend'),
    power: '22.0 – 32.0',
    coinsPerHour: '7.80 – 9.20',
    weaponCycle: '~12h',
    recovery: '13h20 / 10h40 / 8h53'
  }
];

export default function LandingPage({
  authUser,
  onOpenAuth,
  onEnterGame,
  onSignOut,
  config = DEFAULT_CRYPTO_ZOMBIES_CONFIG
}) {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', label: 'Início' },
    { id: 'lore', label: 'História' },
    { id: 'gameplay', label: 'Jogabilidade' },
    { id: 'heroes', label: 'Personagens' },
    { id: 'rates', label: 'Rates & Baús' },
    { id: 'bases', label: 'Bases' },
    { id: 'evolution', label: 'Evolução' },
    { id: 'referral', label: 'Indique e Ganhe', icon: Gift },
    { id: 'roi', label: 'Simulador ROI' }
  ];
  const chests = Object.values(config?.chests || DEFAULT_CRYPTO_ZOMBIES_CONFIG.chests);
  const houses = Object.values(config?.houses || DEFAULT_CRYPTO_ZOMBIES_CONFIG.houses).filter(
    (h) => h.id !== 'none' && h.id !== 'legendary'
  );
  const rarityAttributes = Object.entries(
    config?.rarityAttributes || DEFAULT_CRYPTO_ZOMBIES_CONFIG.rarityAttributes
  );
  const minerRate = config?.minerCoinUsdtRate ?? 0.01;
  const maxActiveMiners = config?.maxActiveMiners ?? 15;

  const displayName =
    authUser?.user_metadata?.player_name ||
    authUser?.email?.split('@')[0] ||
    'Comandante';

  return (
    <div className="relative min-h-screen w-full flex flex-col text-slate-100 font-tech selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      {/* PLANO DE FUNDO ATMOSFÉRICO DO SITE */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 opacity-40"
          style={{ backgroundImage: "url('/city_map_lvl3.webp?v=3')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/80 to-slate-950/95 backdrop-blur-[2px]" />
      </div>

      {/* NAVBAR SUPERIOR COM LOGIN/CADASTRO NO CANTO */}
      <header className="sticky top-0 z-50 border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              <img
                src="/assets/cryptozombies_logo.png"
                alt="CryptoZombies"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div className="leading-tight">
              <span className="font-arcade text-sm sm:text-base text-amber-400 tracking-wider block">
                CRYPTOZOMBIES
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 block">
                Sobrevivência & Coleta de recursos
              </span>
            </div>
          </div>

          {/* Abas de navegação (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl border transition cursor-pointer inline-flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 shadow-sm'
                      : 'border-transparent text-slate-300 hover:text-amber-300 hover:bg-slate-900/70'
                  }`}
                >
                  {TabIcon && <TabIcon size={14} className="text-amber-400 shrink-0" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Ações no canto direito */}
          <div className="flex items-center gap-2 shrink-0">
            {authUser ? (
              <>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="truncate max-w-[140px]">{displayName}</span>
                </span>
                <button
                  type="button"
                  onClick={onEnterGame}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-arcade text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                >
                  <Play size={14} />
                  <span>Jogar</span>
                </button>
                <button
                  type="button"
                  onClick={onSignOut}
                  title="Sair da conta"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-rose-400 transition cursor-pointer"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  <UserPlus size={14} className="text-emerald-400" />
                  <span>Cadastrar</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-arcade text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  <LogIn size={14} />
                  <span>Entrar</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Barra de abas mobile/tablet */}
        <div className="lg:hidden border-t border-slate-800/80 px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase tracking-wider shrink-0 transition cursor-pointer inline-flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-amber-500/20 border-amber-400/60 text-amber-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300'
                }`}
              >
                {TabIcon && <TabIcon size={13} className="text-amber-400 shrink-0" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex-1">
      {/* HERO BANNER (ABA INÍCIO) */}
      {activeTab === 'home' && (
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/35 via-slate-950/60 to-slate-950/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Site Oficial • Sobrevivência Tática & Coleta de recursos</span>
            </div>

            <h1 className="font-arcade text-3xl sm:text-5xl leading-tight text-white">
              COMANDE SEU ESQUADRÃO.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                DOMINE A CIDADE.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              Recrute sobreviventes de diferentes raridades, equipe armamentos exclusivos,
              defenda o abrigo contra hordas e Bosses e converta suas{' '}
              <span className="text-amber-300 font-bold">Coins</span> mineradas em recompensas reais.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {authUser ? (
                <button
                  type="button"
                  onClick={onEnterGame}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-arcade text-xs sm:text-sm font-bold uppercase tracking-wider shadow-xl shadow-emerald-500/25 transition cursor-pointer"
                >
                  <Play size={18} />
                  <span>Entrar no Jogo Agora</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('register')}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-arcade text-xs sm:text-sm font-bold uppercase tracking-wider shadow-xl shadow-amber-500/25 transition cursor-pointer"
                  >
                    <UserPlus size={18} />
                    <span>Criar Conta Grátis</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('login')}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-sm font-bold transition cursor-pointer"
                  >
                    <LogIn size={17} className="text-amber-400" />
                    <span>Já tenho conta</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('rates')}
                className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl text-slate-300 hover:text-amber-300 text-sm font-bold transition cursor-pointer"
              >
                <span>Ver Rates & Economia</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Logo oficial sem fundo */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <img
              src="/assets/cryptozombies_logo.png"
              alt="CryptoZombies Logo Oficial"
              className="w-full max-w-[440px] h-auto object-contain drop-shadow-[0_14px_30px_rgba(245,158,11,0.28)]"
            />
          </div>
        </div>
      </section>
      )}

      {/* SEÇÃO LORE: HISTÓRIA DO JOGO */}
      {activeTab === 'lore' && (
      <section id="lore" className="border-b border-slate-800/80 bg-slate-950/75">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-400">
              <BookOpen size={14} />
              <span>Crônicas do Distrito</span>
            </span>
            <h2 className="font-arcade text-2xl sm:text-3xl text-white">
              A HISTÓRIA DE CRYPTOZOMBIES
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              Após o colapso energético que liberou a névoa mutagênica sobre a zona industrial,
              as ruas, ruínas e antigas reservas de mineração foram tomadas por hordas incessantes.
              No centro do caos, um último posto fortificado resiste — e você assume o comando.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-slate-900/85 border border-slate-800 space-y-3">
              <div className="text-xs font-arcade text-amber-400 uppercase tracking-wider">
                Capítulo I • O Surto
              </div>
              <h3 className="font-arcade text-base text-white">A Cidade Infectada</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Com as linhas de suprimento cortadas, depósitos de <b className="text-amber-300">Coins</b> ficaram
                espalhados entre carros abandonados e prédios em ruínas. Apenas esquadrões táticos
                equipados o suficiente conseguem avançar pelas estradas e limpar os setores infestados.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/85 border border-slate-800 space-y-3">
              <div className="text-xs font-arcade text-sky-400 uppercase tracking-wider">
                Capítulo II • O Refúgio
              </div>
              <h3 className="font-arcade text-base text-white">Base Médica & Armeiro</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Dentro dos muros da Base Militar, a cirurgiã <b className="text-sky-300">Dra. Íris</b> mantém
                os leitos ativos para resgatar combatentes feridos, enquanto <b className="text-orange-300">John Armeiro</b>{' '}
                repara armamentos desgastados para que o pelotão nunca perca poder de fogo.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/85 border border-slate-800 space-y-3">
              <div className="text-xs font-arcade text-rose-400 uppercase tracking-wider">
                Capítulo III • A Invasão
              </div>
              <h3 className="font-arcade text-base text-white">Bosses & Evolução</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Duas vezes ao dia, chefões mutantes surgem no perímetro. Derrotá-los em combate
                conjunto rende <b className="text-emerald-300">Baús de Construção</b> e{' '}
                <b className="text-emerald-300">Fragmentos</b> raros para expandir a Base de 5 até 15 leitos.
              </p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* SEÇÃO 1: JOGABILIDADE */}
      {activeTab === 'gameplay' && (
      <section id="jogabilidade" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Como Funciona
          </span>
          <h2 className="font-arcade text-2xl sm:text-3xl text-white">
            JOGABILIDADE & SISTEMAS DA BASE
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            Um ciclo completo de combate tático, gerenciamento de energia, reparo de armas e economia sustentável.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Pickaxe size={20} />
            </div>
            <h3 className="font-arcade text-sm text-white">1. Sobrevivência & Coleta de recursos</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Envie até {maxActiveMiners} heróis para a cidade infectada. Eles eliminam zumbis,
              destroem depósitos e coletam Coins continuamente.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <HeartPulse size={20} />
            </div>
            <h3 className="font-arcade text-sm text-white">2. Enfermaria & Dra. Íris</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quando a vida cai em combate, os heróis descansam nos leitos da Base sob cuidados
              médicos para recuperar até 1.5x mais rápido dependendo da evolução de sua base.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Wrench size={20} />
            </div>
            <h3 className="font-arcade text-sm text-white">3. Armeiro & Durabilidade</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Armas sofrem desgaste durante o combate (4h a 12h conforme a raridade). O Mestre
              Armeiro realiza a manutenção para manter o DPS máximo.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Swords size={20} />
            </div>
            <h3 className="font-arcade text-sm text-white">4. Bosses & Mercado P2P</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Chefões invadem o mapa periodicamente rendendo Baús de Construção e Fragmentos.
              Negocie heróis extras no Mercado P2P ou faça saque em USDT.
            </p>
          </div>
        </div>

        {/* BLOCO DE SUSTENTABILIDADE ECONÔMICA */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/85 border border-emerald-500/30 space-y-6 shadow-xl">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400">
              <ShieldCheck size={15} />
              <span>Arquitetura Econômica de Longo Prazo</span>
            </span>
            <h3 className="font-arcade text-xl sm:text-2xl text-white">
              COMO O JOGO PRESERVA A ECONOMIA PARA DURAR MUITO MAIS
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Ao contrário de projetos que colapsam por emissão sem freio, o CryptoZombies foi
              projetado com múltiplos sumidouros (sinks), controle de produção e incentivos de
              reinvestimento para manter a liquidez saudável por muito mais tempo.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="font-arcade text-xs text-amber-300">Emissão Controlada</h4>
              <p className="text-slate-400 leading-relaxed">
                A produção de <b className="text-slate-200">Coins</b> é limitada a até {maxActiveMiners} heróis
                ativos simultâneos e calibrada por raridade, impedindo farm infinito ou explosão artificial de oferta.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="font-arcade text-xs text-orange-300">Liquidez & Token Oficial</h4>
              <p className="text-slate-400 leading-relaxed">
                O jogo foi pensado com base em uma economia duradoura: alguns anúncios em momentos
                específicos ajudam a manter a pool de liquidez sempre cheia. Em breve teremos a{' '}
                <b className="text-slate-200">moeda oficial</b> que substituirá os Coins, com função
                de queima de tokens para valorizar ainda mais o seu investimento!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="font-arcade text-xs text-sky-300">Revezamento & Evolução</h4>
              <p className="text-slate-400 leading-relaxed">
                Heróis feridos passam pelos leitos da <b className="text-slate-200">Base Médica</b>. Expandir
                de 5 para 10 ou 15 vagas consome <b className="text-slate-200">Fragmentos de Boss</b> e Coins,
                desgaste das armas com reparo pelo <b className="text-slate-200">John Armeiro</b>, valorizando
                a retenção e o progresso da conta.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="font-arcade text-xs text-purple-300">Rejuvenescimento & Estrelas</h4>
              <p className="text-slate-400 leading-relaxed">
                O <b className="text-slate-200">Sistema de Rejuvenescimento</b> renova o ciclo útil
                dos heróis com poções, enquanto a <b className="text-slate-200">Evolução de Estrelas</b>{' '}
                (1★ a 3★) fortalece e amplia a produção (+5% a +15%), criando demanda contínua de ativos.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="font-arcade text-xs text-emerald-300">Mercado P2P & Taxa Anti-Drenagem</h4>
              <p className="text-slate-400 leading-relaxed">
                O comércio de heróis ocorre entre jogadores com taxa de mercado e imposto progressivo
                de saque, protegendo o caixa contra saques predatórios de curto prazo.
              </p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* SEÇÃO 2: PERSONAGENS */}
      {activeTab === 'heroes' && (() => {
        const rarityOrder = {
          common: 0,
          rare: 1,
          super_rare: 2,
          epic: 3,
          legendary: 4,
          super_legend: 5
        };
        const sortedHeroes = [...HERO_ROSTER].sort(
          (a, b) => (rarityOrder[a.rarity] ?? 99) - (rarityOrder[b.rarity] ?? 99)
        );
        const commonHeroes = sortedHeroes.filter((h) => h.rarity === 'common');
        const specialHeroes = sortedHeroes.filter((h) => h.rarity !== 'common');

        const supportCharacters = [
          {
            id: 'iris',
            name: 'Dra. Íris',
            className: 'Médica Cirurgiã da Base',
            badge: 'Suporte Médico',
            image: '/assets/heroes/iris.png',
            role: 'Atendimento médico nos leitos da Base para recuperação contínua dos heróis feridos.',
            toolName: 'Kit Cirúrgico & Leitos',
            borderColor: '#ffffff',
            badgeBg: 'rgba(255, 255, 255, 0.14)',
            badgeText: '#ffffff'
          },
          {
            id: 'armeiro',
            name: 'John Armeiro',
            className: 'Mestre Armeiro da Base',
            badge: 'Suporte Técnico',
            image: '/assets/heroes/armeiro.png',
            role: 'Manutenção e reparo automático das armas desgastadas para manter o poder de fogo máximo.',
            toolName: 'Chave de Reparo Tática',
            toolImg: '/assets/weapons/armeiro_wrench.png',
            borderColor: '#ffffff',
            badgeBg: 'rgba(255, 255, 255, 0.14)',
            badgeText: '#ffffff'
          }
        ];

        const renderHeroCard = (hero) => {
          const rarity = getRarityConfig(hero.rarity);
          const heroWeapon = getWeaponById(hero.weaponId);
          return (
            <div
              key={hero.id}
              style={{ borderColor: rarity.border }}
              className="p-4 rounded-2xl bg-slate-900/90 border flex flex-col justify-between gap-3 shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    style={{ borderColor: rarity.border }}
                    className="w-14 h-14 rounded-2xl bg-slate-950 border overflow-hidden shrink-0 flex items-center justify-center p-1"
                  >
                    <img
                      src={`/assets/heroes/${hero.id}.png`}
                      alt={hero.name}
                      className="w-full h-full object-contain drop-shadow"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-arcade text-sm text-white truncate">{hero.name}</h3>
                    <p className="text-xs text-slate-400 truncate">{hero.className}</p>
                  </div>
                </div>
                <span
                  style={{
                    backgroundColor: rarity.badgeBg,
                    color: rarity.badgeText,
                    borderColor: rarity.badgeBorder
                  }}
                  className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0"
                >
                  {hero.rarityName}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{hero.role}</p>

              <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-11 h-8 rounded-lg bg-slate-950 border border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0">
                    <div
                      className="w-[44px] h-[25px] bg-no-repeat"
                      style={{
                        backgroundImage: 'url(/assets/weapon-roster.png?v=4)',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '572px 25px',
                        backgroundPosition: `-${(heroWeapon?.sourceIndex ?? 0) * 44}px center`,
                        transform: 'scaleX(-1) scale(1.15)',
                        imageRendering: 'pixelated',
                        filter: 'drop-shadow(0 0 1px rgba(255, 255, 255, 0.65))'
                      }}
                    />
                  </div>
                  <div className="min-w-0 leading-tight">
                    <span className="text-[10px] uppercase text-slate-500 block">Arma</span>
                    <span className="text-xs text-amber-300 font-bold truncate block">
                      {heroWeapon?.name || hero.weaponId}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        };

        return (
          <section id="personagens" className="border-t border-slate-800/80 bg-slate-900/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-10">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  Elenco Oficial
                </span>
                <h2 className="font-arcade text-2xl sm:text-3xl text-white">
                  PERSONAGENS, CLASSES & AMEAÇAS
                </h2>
                <p className="text-sm text-slate-400 max-w-2xl">
                  Os sobreviventes combatentes por raridade, os especialistas de suporte da Base e os inimigos do distrito.
                </p>
              </div>

              {/* 1. TODOS OS HERÓIS (COMUNS PRIMEIRO, MESMO ESPAÇAMENTO) */}
              <div className="grid sm:grid-cols-2 gap-4">
                {sortedHeroes.map(renderHeroCard)}
              </div>

              {/* 3. SUPORTE (DRA. ÍRIS & JOHN ARMEIRO) COM BORDA BRANCA */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <h3 className="font-arcade text-xs uppercase tracking-wider text-white">
                  Suporte
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {supportCharacters.map((sup) => (
                    <div
                      key={sup.id}
                      style={{ borderColor: '#ffffff' }}
                      className="p-4 rounded-2xl bg-slate-900/90 border flex flex-col justify-between gap-3 shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            style={{ borderColor: '#ffffff' }}
                            className="w-14 h-14 rounded-2xl bg-slate-950 border overflow-hidden shrink-0 flex items-center justify-center p-1"
                          >
                            <img
                              src={sup.image}
                              alt={sup.name}
                              className="w-full h-full object-contain drop-shadow"
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-arcade text-sm text-white truncate">{sup.name}</h3>
                            <p className="text-xs text-slate-400 truncate">{sup.className}</p>
                          </div>
                        </div>
                        <span
                          style={{
                            backgroundColor: sup.badgeBg,
                            color: sup.badgeText,
                            borderColor: '#ffffff'
                          }}
                          className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0"
                        >
                          {sup.badge}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{sup.role}</p>

                      <div className="pt-2.5 border-t border-slate-800 flex items-center gap-2">
                        {sup.toolImg ? (
                          <div className="w-11 h-8 rounded-lg bg-slate-950 border border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0 p-1">
                            <img src={sup.toolImg} alt={sup.toolName} className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-11 h-8 rounded-lg bg-slate-950 border border-sky-500/30 flex items-center justify-center shrink-0 text-sky-400">
                            <HeartPulse size={16} />
                          </div>
                        )}
                        <div className="min-w-0 leading-tight">
                          <span className="text-[10px] uppercase text-slate-500 block">Especialidade</span>
                          <span className="text-xs text-sky-300 font-bold truncate block">
                            {sup.toolName}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. LOGO APÓS: ZUMBI E BOSS LADO A LADO (MESMO VISUAL DOS CARDS) */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <h3 className="font-arcade text-xs uppercase tracking-wider text-rose-400">
                  Ameaças da Cidade: Zumbi & Boss
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[ENEMIES.ZOMBIE, ENEMIES.BOSS].map((enemy) => (
                    <div
                      key={enemy.id}
                      style={{ borderColor: enemy.color }}
                      className="p-4 rounded-2xl bg-slate-900/90 border flex flex-col justify-between gap-3 shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            style={{ borderColor: enemy.color }}
                            className="w-14 h-14 rounded-2xl bg-slate-950 border overflow-hidden shrink-0 flex items-center justify-center p-1"
                          >
                            <img
                              src={enemy.cleanSprite || enemy.sprite}
                              alt={enemy.type === 'zombie' ? 'Zumbi' : enemy.name}
                              className="w-full h-full object-contain drop-shadow"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-arcade text-sm text-white truncate">
                              {enemy.type === 'zombie' ? 'Zumbi' : enemy.name}
                            </h4>
                            <p className="text-xs text-slate-400 truncate">
                              {enemy.type === 'boss' ? 'Boss' : 'Inimigo'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{enemy.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* SEÇÃO 3: RATES & BAÚS */}
      {activeTab === 'rates' && (
      <section id="rates" className="border-t border-slate-800/80 max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        {/* Tabela de Atributos por Raridade */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
              Atributos & Produção
            </span>
            <h2 className="font-arcade text-2xl sm:text-3xl text-white">
              RATES POR RARIDADE
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Parâmetros oficiais de poder, mineração por hora, energia máxima e recuperação.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/90 text-slate-400 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Raridade</th>
                  <th className="px-4 py-3.5">Vida (PV)</th>
                  <th className="px-4 py-3.5">Poder Base</th>
                  <th className="px-4 py-3.5">Produção (Coins/h)</th>
                  <th className="px-4 py-3.5">Durab. Arma</th>
                  <th className="px-4 py-3.5">Recup. (Básica / Ref. / Avanç.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {OFFICIAL_RARITY_RATES.map((row) => {
                  const rarityCfg = RARITY_CONFIG[row.id] || RARITY_CONFIG.common;
                  const textColor = row.id === 'common' ? '#94a3b8' : rarityCfg.color;
                  return (
                    <tr key={row.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3.5 font-bold" style={{ color: textColor }}>
                        {row.name}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-rose-300 font-bold">
                        {row.hp.toLocaleString('pt-BR')} PV
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-200">
                        {row.power}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-amber-300 font-bold">
                        {row.coinsPerHour} /h
                      </td>
                      <td className="px-4 py-3.5 font-mono text-sky-300">
                        {row.weaponCycle}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-emerald-400">
                        {row.recovery}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Baús e Probabilidades */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Chances de Drop
            </span>
            <h2 className="font-arcade text-2xl sm:text-3xl text-white">
              BAÚS DE RECRUTAMENTO
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {chests.map((chest) => {
              const probs = chest.normalProbabilities || chest.probabilities || {};
              const bonus = chest.adBonusProbabilities || probs;
              return (
                <div
                  key={chest.id}
                  style={{ borderColor: `${chest.color}55` }}
                  className="p-5 rounded-2xl bg-slate-900/90 border flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 p-1 flex items-center justify-center">
                        <img
                          src={chest.image || '/items/hero_chest.png'}
                          alt={chest.name}
                          className="w-full h-full object-contain drop-shadow"
                        />
                      </div>
                      <span
                        style={{ color: chest.color }}
                        className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800"
                      >
                        {chest.heroesCount} {chest.heroesCount === 1 ? 'Herói' : 'Heróis'}
                      </span>
                    </div>
                    <h3 className="font-arcade text-base text-white">{chest.name}</h3>
                    <p className="text-xs text-slate-400">{chest.description}</p>
                  </div>

                  <div className="space-y-1.5 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between text-slate-300">
                      <span>Comum</span>
                      <span className="font-mono">{Number(probs.common ?? 82.87).toFixed(2).replace('.', ',')}%</span>
                    </div>
                    <div className="flex justify-between text-emerald-300">
                      <span>Raro</span>
                      <span className="font-mono">{Number(probs.rare ?? 10.36).toFixed(2).replace('.', ',')}%</span>
                    </div>
                    <div className="flex justify-between text-sky-300">
                      <span>Super Raro</span>
                      <span className="font-mono">{Number(probs.super_rare ?? 5.18).toFixed(2).replace('.', ',')}%</span>
                    </div>
                    <div className="flex justify-between text-purple-300">
                      <span>Épico</span>
                      <span className="font-mono">{Number(probs.epic ?? 1.04).toFixed(2).replace('.', ',')}%</span>
                    </div>
                    <div className="flex justify-between text-orange-300 font-bold">
                      <span>Lendário</span>
                      <span className="font-mono">{Number(probs.legendary ?? 0.51).toFixed(2).replace('.', ',')}%</span>
                    </div>
                    <div className="flex justify-between text-rose-400 font-bold">
                      <span>Super Lendário</span>
                      <span className="font-mono">{Number(probs.super_legend ?? 0.04).toFixed(2).replace('.', ',')}%</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Valor do Baú</span>
                    <span className="font-arcade text-sm text-emerald-400">
                      US$ {Number(chest.costUsdt || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ITENS ESPECIAIS: FRAGMENTOS & POÇÃO DE REJUVENESCIMENTO */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Recursos & Consumíveis
            </span>
            <h2 className="font-arcade text-2xl sm:text-3xl text-white">
              FRAGMENTOS & POÇÃO DE REJUVENESCIMENTO
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/35 flex items-center gap-4 shadow-md">
              <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-emerald-500/40 p-2 flex items-center justify-center shrink-0">
                <img
                  src="/items/construction_fragment.png"
                  alt="Fragmento de Construção"
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
              <div className="space-y-1.5 min-w-0">
                <h3 className="font-arcade text-sm sm:text-base text-white">
                  Fragmento de Construção
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Recurso raro obtido ao derrotar Bosses e abrir Baús de Construção. É utilizado junto
                  com Coins para evoluir permanentemente sua Base Médica de 5 para 10 ou 15 leitos.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/35 flex items-center gap-4 shadow-md">
              <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-purple-500/40 p-2 flex items-center justify-center shrink-0">
                <img
                  src="/items/rejuvenation_potion.png"
                  alt="Poção de Rejuvenescimento"
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
              <div className="space-y-1.5 min-w-0">
                <h3 className="font-arcade text-sm sm:text-base text-white">
                  Poção de Rejuvenescimento
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Consumível especial usado no Sistema de Rejuvenescimento para renovar o ciclo útil
                  dos seus heróis, mantendo seu esquadrão ativo em combate e coleta por muito mais tempo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* SEÇÃO 4: ABRIGOS */}
      {activeTab === 'bases' && (
      <section id="abrigos" className="border-t border-slate-800/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
              Recuperação de Energia
            </span>
            <h2 className="font-arcade text-2xl sm:text-3xl text-white">
              NÍVEIS DE BASE MÉDICA
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Evolua sua base para liberar mais leitos simultâneos e acelerar a recuperação da equipe.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {houses.map((house) => {
              const tierInfo = HOUSE_TIERS.find((t) => t.id === house.id) || {};
              const fragCost = tierInfo.fragmentCost || 0;
              const coinsCost = tierInfo.mncCost || 0;
              return (
              <div
                key={house.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-arcade text-base text-white">{house.name}</h3>
                    <span className="text-xs font-mono font-bold text-sky-300 bg-sky-500/10 border border-sky-500/30 px-2.5 py-0.5 rounded-full">
                      {house.recoverySpeedMultiplier}x Vel.
                    </span>
                  </div>

                  {house.image && (
                    <div className="w-full h-56 rounded-xl bg-slate-950/90 border border-slate-800/80 p-1.5 flex items-center justify-center overflow-hidden">
                      <img
                        src={house.image}
                        alt={house.name}
                        className="w-full h-full object-contain drop-shadow-lg scale-105"
                      />
                    </div>
                  )}

                  <p className="text-xs text-slate-400 leading-relaxed">{house.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Home size={13} className="text-blue-400" />
                    {house.slots} vagas
                  </span>
                  {fragCost === 0 && coinsCost === 0 ? (
                    <span className="font-arcade text-emerald-400">Grátis</span>
                  ) : (
                    <div className="flex items-center gap-2 font-mono font-bold">
                      <span className="text-emerald-400">🧱 {fragCost} Frag.</span>
                      <span className="text-amber-300">🪙 {coinsCost.toLocaleString('pt-BR')} Coins</span>
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* SEÇÃO: EVOLUÇÃO DE HERÓIS */}
      {activeTab === 'evolution' && (
      <section id="evolucao" className="border-t border-slate-800/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-10">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
              Progressão & Rejuvenescimento
            </span>
            <h2 className="font-arcade text-2xl sm:text-3xl text-white">
              EVOLUÇÃO DE HERÓIS (80 DIAS)
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Entenda como funciona o ciclo de 80 dias, quais itens são necessários e o que aumenta ao evoluir seus heróis de 0★ (sem estrelas) até 3★.
            </p>
          </div>

          {/* Como Funciona (3 passos) */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-arcade text-amber-300">1. CICLO DE 80 DIAS</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Todo herói inicia <b>sem estrelas (0★)</b> e cumpre um ciclo útil de <b>80 dias ativos</b>. Ao atingir 80 dias, ele fica pronto para evoluir no botão <b>Evolução</b> dentro do jogo.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-arcade text-purple-300">2. ITENS NECESSÁRIOS</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A evolução consome <b>Baús</b> e <b>Poções de Rejuvenescimento</b> conforme a raridade do herói — sem Fragmentos de Construção.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-arcade text-emerald-300">3. O QUE AUMENTA</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                O herói ganha <b>+5%</b> de Poder e Produção por estrela (até <b>+15%</b> em 3★), remove penalidades de idade, restaura <b>100%</b> da energia/arma e <b>renova o ciclo para 0/80 dias</b>.
              </p>
            </div>
          </div>

          {/* História da Idade & Penalidades por Idade */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-950/35 via-slate-900/95 to-slate-950 border border-rose-500/35 space-y-5 shadow-xl">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-rose-400">
                Desgaste na Zona Infestada
              </span>
              <h3 className="font-arcade text-base sm:text-lg text-white">
                A HISTÓRIA DA IDADE & PENALIDADES POR IDADE
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
                Cada expedição nas minas subterrâneas expõe os sobreviventes à radiação dos cristais e aos esporos tóxicos dos zumbis mutantes. Com o passar das semanas, o corpo do herói acumula fadiga biológica: até os <b>49 dias</b> ele luta em seu auge físico, mas a partir do <b>50º dia</b> sua eficiência cai progressivamente até atingir <b>80 dias</b> — momento em que somente a <b>Poção de Rejuvenescimento</b> restaura sua vitalidade, zera a idade para <b>0/80 dias</b> e libera sua próxima estrela.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
                <div className="font-arcade text-xs text-emerald-300">0 a 49 Dias</div>
                <div className="font-bold text-white">Ápice Físico</div>
                <p className="text-[11px] text-slate-300">
                  <b>0% de penalidade.</b> Produção de Coins e velocidade de recuperação em 100%.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-1">
                <div className="font-arcade text-xs text-amber-300">50 a 69 Dias</div>
                <div className="font-bold text-white">Desgaste Inicial</div>
                <p className="text-[11px] text-slate-300">
                  <b>-15%</b> na produção de Coins e <b>-10%</b> na velocidade de recuperação de energia.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-orange-950/35 border border-orange-500/40 space-y-1">
                <div className="font-arcade text-xs text-orange-300">70 a 79 Dias</div>
                <div className="font-bold text-white">Fadiga Crítica</div>
                <p className="text-[11px] text-slate-300">
                  <b>-30%</b> na produção de Coins e <b>-20%</b> na recuperação de energia.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/45 space-y-1">
                <div className="font-arcade text-xs text-rose-300">80+ Dias</div>
                <div className="font-bold text-white">Ciclo Esgotado</div>
                <p className="text-[11px] text-slate-300">
                  <b>-50%</b> na produção de Coins até evoluir com a <b>Poção de Rejuvenescimento</b>.
                </p>
              </div>
            </div>
          </div>

          {/* Tabela Oficial de Evolução por Raridade */}
          <div className="p-6 rounded-3xl bg-slate-900/95 border border-purple-500/40 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-purple-300 font-bold">
                  Requisitos por Raridade (80 Dias Ativos)
                </span>
                <h3 className="font-arcade text-base sm:text-lg text-white">
                  TABELA OFICIAL DE EVOLUÇÃO (0★ ➔ ★★★)
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                * Heróis <b>Comuns</b> não possuem evolução de estrelas.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Raridade</th>
                    <th className="py-3 px-4">Evolução para ★</th>
                    <th className="py-3 px-4">Evolução para ★★</th>
                    <th className="py-3 px-4">Evolução para ★★★</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {[
                    { name: 'Raro', color: '#38bdf8', s1: '1 baú / 10 poções', s2: '2 baús / 20 poções', s3: '3 baús / 30 poções' },
                    { name: 'Super Raro', color: '#a855f7', s1: '2 baús / 20 poções', s2: '3 baús / 30 poções', s3: '4 baús / 40 poções' },
                    { name: 'Épico', color: '#ec4899', s1: '3 baús / 30 poções', s2: '4 baús / 40 poções', s3: '5 baús / 50 poções' },
                    { name: 'Lendário', color: '#f59e0b', s1: '4 baús / 40 poções', s2: '5 baús / 50 poções', s3: '6 baús / 60 poções' },
                    { name: 'Super Lendário', color: '#ef4444', s1: '5 baús / 50 poções', s2: '6 baús / 60 poções', s3: '7 baús / 70 poções' },
                  ].map((row) => (
                    <tr key={row.name} className="hover:bg-slate-950/60 transition">
                      <td className="py-3.5 px-4 font-arcade text-xs" style={{ color: row.color }}>
                        {row.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-200">{row.s1}</td>
                      <td className="py-3.5 px-4 font-mono text-purple-200">{row.s2}</td>
                      <td className="py-3.5 px-4 font-mono text-amber-300 font-bold">{row.s3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/35 text-xs text-slate-200 flex flex-wrap items-center justify-between gap-2">
              <span>
                <b>O que aumenta a cada evolução:</b> +5% de Poder e Produção (até +15% em ★★★), idade zerada para <b>0/80 dias</b> e 100% de energia/arma restauradas.
              </span>
            </div>
          </div>

          {/* Onde obter os itens */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/35 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-purple-500/40 p-2 flex items-center justify-center shrink-0">
                <img
                  src="/items/rejuvenation_potion.png"
                  alt="Poção de Rejuvenescimento"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-1">
                <h4 className="font-arcade text-xs sm:text-sm text-white">Poção de Rejuvenescimento</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Drop especial ao derrotar Bosses e abrir Baús de Construção. Essencial para renovar o ciclo de 80 dias.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/35 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-amber-500/40 p-2 flex items-center justify-center shrink-0">
                <img
                  src="/items/hero_chest.png"
                  alt="Baús de Herói"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-1">
                <h4 className="font-arcade text-xs sm:text-sm text-white">Baús de Herói</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Adquiridos na loja (MINT) ou em recompensas especiais de Bosses. Guardados no Inventário para usar na evolução.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* SEÇÃO: INDIQUE E GANHE */}
      {activeTab === 'referral' && (
      <section id="indique-e-ganhe" className="border-t border-slate-800/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-400">
                <Gift size={15} />
                <span>Programa de Afiliados</span>
              </span>
              <h2 className="font-arcade text-2xl sm:text-3xl text-white">
                INDIQUE E GANHE {REFERRAL_COMMISSION_PCT}% EM COINS
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl">
                Convide novos comandantes para o CryptoZombies e receba <b className="text-amber-300">{REFERRAL_COMMISSION_PCT}% de comissão em Coins</b> sobre todas as compras de Baús em USDT feitas pelos seus indicados.
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-lg">
              <Gift size={32} className="text-amber-300" />
            </div>
          </div>

          {/* Como funciona */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-arcade text-emerald-300">1. TENHA 1+ HERÓI</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Para liberar seu link exclusivo de divulgação, é obrigatório possuir pelo menos <b>1 herói</b> ativo na sua conta.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-arcade text-purple-300">2. COMPARTILHE SEU LINK</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Copie seu link na aba <b>Indicações</b> do Perfil dentro do jogo e envie para seus amigos se cadastrarem por ele.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-arcade text-amber-300">3. GANHE {REFERRAL_COMMISSION_PCT}% EM COINS</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sempre que um indicado comprar um Baú em USDT, <b>{REFERRAL_COMMISSION_PCT}% do valor</b> é creditado automaticamente em <b>Coins</b> para você.
              </p>
            </div>
          </div>

          {/* Exemplo e CTA */}
          <div className="p-6 rounded-3xl bg-slate-900/95 border border-amber-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Exemplo de Comissão
              </div>
              <p className="text-sm text-slate-200">
                Seu indicado compra um Baú de <b className="text-white">US$ 100,00</b> ➔ Você recebe{' '}
                <b className="text-amber-300">100 Coins</b> (equivalente a US$ 1,00 na cotação oficial de 1 Coin = US$ {minerRate.toFixed(2)}).
              </p>
              {authUser && (
                <p className="text-xs text-slate-400">
                  Seu código de indicação: <b className="font-mono text-emerald-300">{getUserReferralCode(authUser)}</b> (acesse <b>Perfil ➔ Indicações</b> no jogo para copiar seu link).
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              {authUser ? (
                <button
                  type="button"
                  onClick={onEnterGame}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-arcade text-xs flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Gift size={15} />
                  <span>ACESSAR INDICAÇÕES NO JOGO</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-arcade text-xs flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Gift size={15} />
                  <span>CRIAR CONTA PARA INDICAR</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* SEÇÃO 5: SIMULADOR DE ROI */}
      {activeTab === 'roi' && <RoiSimulatorTab config={config} />}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Skull size={16} className="text-amber-400" />
            <span className="font-arcade text-slate-300">CRYPTOZOMBIES</span>
            <span>• Portal Oficial</span>
          </div>
          <div className="flex items-center gap-3">
            {!authUser ? (
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
              >
                Entrar / Criar Conta →
              </button>
            ) : (
              <button
                type="button"
                onClick={onEnterGame}
                className="text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
              >
                Ir para o Jogo →
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
