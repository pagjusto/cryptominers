import React, { useState, useEffect } from 'react';
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
  Gift,
  Globe,
  Copy,
  Check,
  Lock,
  Share2,
  X
} from 'lucide-react';
import { HERO_ROSTER, RARITY_CONFIG, getRarityConfig, getWeaponById } from '../data/heroRoster';
import { DEFAULT_CRYPTO_ZOMBIES_CONFIG } from '../data/cryptoZombiesConfig';
import { getHeroBaseHP } from '../utils/heroHealth';
import { ENEMIES } from '../data/enemiesCatalog';
import { HOUSE_TIERS } from '../data/housesData';
import {
  REFERRAL_COMMISSION_PCT,
  getUserReferralCode,
  getUserReferralLink,
  fetchReferralSummary
} from '../services/referralService';
import { SITE_TRANSLATIONS, SITE_LANG_STORAGE_KEY, getStoredSiteLang } from '../data/siteTranslations';
import RoiSimulatorTab from './RoiSimulatorTab';

const OFFICIAL_RARITY_RATES = [
  {
    id: 'common',
    name: 'Comum',
    hp: getHeroBaseHP('common'),
    power: '1.5 – 3.0',
    coinsPerHour: '2.33 – 2.88',
    weaponCycle: '~4h',
    recovery: '6h40 / 5h20 / 4h26'
  },
  {
    id: 'rare',
    name: 'Raro',
    hp: getHeroBaseHP('rare'),
    power: '3.5 – 6.5',
    coinsPerHour: '4.19 – 5.12',
    weaponCycle: '~6h',
    recovery: '8h / 6h24 / 5h20'
  },
  {
    id: 'super_rare',
    name: 'Super Raro',
    hp: getHeroBaseHP('super_rare'),
    power: '5.5 – 9.5',
    coinsPerHour: '5.39 – 6.32',
    weaponCycle: '~8h',
    recovery: '9h20 / 7h28 / 6h13'
  },
  {
    id: 'epic',
    name: 'Épico',
    hp: getHeroBaseHP('epic'),
    power: '7.0 – 13.0',
    coinsPerHour: '6.51 – 7.63',
    weaponCycle: '~10h',
    recovery: '10h40 / 8h32 / 7h06'
  },
  {
    id: 'legendary',
    name: 'Lendário',
    hp: getHeroBaseHP('legendary'),
    power: '14.0 – 24.0',
    coinsPerHour: '11.16 – 12.72',
    weaponCycle: '~12h',
    recovery: '12h / 9h36 / 8h'
  },
  {
    id: 'super_legend',
    name: 'Super Lendário',
    hp: getHeroBaseHP('super_legend'),
    power: '22.0 – 32.0',
    coinsPerHour: '14.51 – 17.11',
    weaponCycle: '~12h',
    recovery: '13h20 / 10h40 / 8h53'
  }
];

export default function LandingPage({
  authUser,
  heroCount = 0,
  onOpenAuth,
  onEnterGame,
  onSignOut,
  config = DEFAULT_CRYPTO_ZOMBIES_CONFIG
}) {
  const [activeTab, setActiveTab] = useState('home');
  const [lang, setLang] = useState(() => getStoredSiteLang());
  const [legalModalType, setLegalModalType] = useState(null); // null | 'terms' | 'privacy'
  const [refCopied, setRefCopied] = useState(false);
  const [referralSummary, setReferralSummary] = useState({
    referralCode: getUserReferralCode(authUser),
    referredCount: 0,
    totalCoinsEarned: 0,
    rewards: []
  });
  const t = SITE_TRANSLATIONS[lang] || SITE_TRANSLATIONS.pt;

  useEffect(() => {
    if (!authUser) {
      setReferralSummary({
        referralCode: getUserReferralCode(null),
        referredCount: 0,
        totalCoinsEarned: 0,
        rewards: []
      });
      return;
    }
    fetchReferralSummary(authUser).then((summary) => {
      if (summary) setReferralSummary(summary);
    });
  }, [authUser, activeTab]);

  const hasHeroToPromote = heroCount >= 1;
  const referralLink = getUserReferralLink(authUser);

  const handleCopyReferralLink = () => {
    if (!authUser || !hasHeroToPromote) return;
    try {
      navigator.clipboard.writeText(referralLink);
      setRefCopied(true);
      setTimeout(() => setRefCopied(false), 2000);
    } catch (e) {}
  };

  const handleToggleLang = (nextLang) => {
    const resolved = nextLang === 'en' ? 'en' : 'pt';
    setLang(resolved);
    try {
      localStorage.setItem(SITE_LANG_STORAGE_KEY, resolved);
    } catch (e) {}
  };

  const tabs = [
    { id: 'home', label: t.tabs.home },
    { id: 'lore', label: t.tabs.lore },
    { id: 'gameplay', label: t.tabs.gameplay },
    { id: 'heroes', label: t.tabs.heroes },
    { id: 'rates', label: t.tabs.rates },
    { id: 'bases', label: t.tabs.bases },
    { id: 'evolution', label: t.tabs.evolution },
    { id: 'referral', label: t.tabs.referral, icon: Gift },
    { id: 'roi', label: t.tabs.roi }
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
    <div className="landing-rusty-theme relative min-h-screen w-full flex flex-col text-slate-100 font-tech selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      {/* PLANO DE FUNDO ATMOSFÉRICO DO SITE (VERDE COM NÉVOA) */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#03110b]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 opacity-35"
          style={{ backgroundImage: "url('/city_map_lvl3.webp?v=3')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#041b11]/90 via-[#062417]/80 to-[#020d08]/95 backdrop-blur-[2px]" />
        {/* Névoa atmosférica verde */}
        <div className="absolute -top-24 -left-24 w-[660px] h-[460px] rounded-full bg-emerald-500/20 blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 -right-24 w-[620px] h-[500px] rounded-full bg-lime-500/15 blur-[130px] animate-pulse" />
        <div className="absolute bottom-0 inset-x-0 h-80 bg-gradient-to-t from-emerald-950/85 via-emerald-900/35 to-transparent blur-xl" />
      </div>

      {/* NAVBAR SUPERIOR COM LOGIN/CADASTRO NO CANTO */}
      <header className="sticky top-0 z-50 border-b border-emerald-900/50 bg-[#03120b]/90 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-5 h-16 flex items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <img
                src="/assets/cryptozombies_logo.png"
                alt="CryptoZombies"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div className="leading-tight">
              <span className="font-arcade text-xs sm:text-sm text-amber-400 tracking-wider block whitespace-nowrap">
                CRYPTOZOMBIES
              </span>
              <span className="hidden xl:block text-[9px] uppercase tracking-widest text-slate-400 whitespace-nowrap">
                {t.brandSubtitle}
              </span>
            </div>
          </div>

          {/* Abas de navegação (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2.5 py-1.5 rounded-xl border transition cursor-pointer inline-flex items-center gap-1 whitespace-nowrap shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 shadow-sm'
                      : 'border-transparent text-slate-300 hover:text-amber-300 hover:bg-slate-900/70'
                  }`}
                >
                  {TabIcon && <TabIcon size={13} className="text-amber-400 shrink-0" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Ações no canto direito */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Seletor de Idioma PT / EN */}
            <div
              className="inline-flex items-center rounded-xl bg-slate-900 border border-slate-700 p-0.5 text-[10px] font-bold uppercase shrink-0"
              title={lang === 'pt' ? 'Mudar idioma para Inglês' : 'Switch language to Portuguese'}
            >
              <Globe size={12} className="text-emerald-400 mx-1.5 shrink-0" />
              <button
                type="button"
                onClick={() => handleToggleLang('pt')}
                className={`px-1.5 py-1 rounded-lg transition cursor-pointer ${
                  lang === 'pt' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                PT
              </button>
              <button
                type="button"
                onClick={() => handleToggleLang('en')}
                className={`px-1.5 py-1 rounded-lg transition cursor-pointer ${
                  lang === 'en' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {authUser ? (
              <>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="truncate max-w-[110px]">{displayName}</span>
                </span>
                <button
                  type="button"
                  onClick={onEnterGame}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-arcade text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition cursor-pointer whitespace-nowrap"
                >
                  <Play size={13} />
                  <span>{t.nav.play}</span>
                </button>
                <button
                  type="button"
                  onClick={onSignOut}
                  title={t.nav.signOut}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-rose-400 transition cursor-pointer"
                >
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap"
                >
                  <UserPlus size={13} className="text-emerald-400" />
                  <span>{t.nav.register}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-arcade text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20 transition cursor-pointer whitespace-nowrap"
                >
                  <LogIn size={13} />
                  <span>{t.nav.login}</span>
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
      <section className="relative overflow-hidden border-b border-emerald-900/50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/35 via-[#04180f]/55 to-[#03110b]/80">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#03110b]/85 via-emerald-950/25 to-transparent blur-md" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} />
              <span>{t.home.badge}</span>
            </div>

            <h1 className="font-arcade text-3xl sm:text-5xl leading-tight text-white">
              {t.home.titleLine1}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                {t.home.titleLine2}
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              {t.home.descriptionPrefix}{' '}
              <span className="text-amber-300 font-bold">{t.home.descriptionHighlight}</span>{' '}
              {t.home.descriptionSuffix}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {authUser ? (
                <button
                  type="button"
                  onClick={onEnterGame}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-arcade text-xs sm:text-sm font-bold uppercase tracking-wider shadow-xl shadow-emerald-500/25 transition cursor-pointer"
                >
                  <Play size={18} />
                  <span>{t.home.ctaPlay}</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('register')}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-arcade text-xs sm:text-sm font-bold uppercase tracking-wider shadow-xl shadow-amber-500/25 transition cursor-pointer"
                  >
                    <UserPlus size={18} />
                    <span>{t.home.ctaCreate}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('login')}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-sm font-bold transition cursor-pointer"
                  >
                    <LogIn size={17} className="text-amber-400" />
                    <span>{t.home.ctaLogin}</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('rates')}
                className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl text-slate-300 hover:text-amber-300 text-sm font-bold transition cursor-pointer"
              >
                <span>{t.home.ctaRates}</span>
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
      <section id="lore" className="border-b border-emerald-900/50 bg-[#04160e]/55">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-400">
              <BookOpen size={14} />
              <span>{t.lore.eyebrow}</span>
            </span>
            <h2 className="font-arcade text-2xl sm:text-3xl text-white">
              {t.lore.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              {t.lore.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-slate-900/85 border border-slate-800 space-y-3">
              <div className="text-xs font-arcade text-amber-400 uppercase tracking-wider">
                {t.lore.ch1Tag}
              </div>
              <h3 className="font-arcade text-base text-white">{t.lore.ch1Title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t.lore.ch1Body}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/85 border border-slate-800 space-y-3">
              <div className="text-xs font-arcade text-sky-400 uppercase tracking-wider">
                {t.lore.ch2Tag}
              </div>
              <h3 className="font-arcade text-base text-white">{t.lore.ch2Title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t.lore.ch2Body}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/85 border border-slate-800 space-y-3">
              <div className="text-xs font-arcade text-rose-400 uppercase tracking-wider">
                {t.lore.ch3Tag}
              </div>
              <h3 className="font-arcade text-base text-white">{t.lore.ch3Title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t.lore.ch3Body}
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
            {t.gameplay.eyebrow}
          </span>
          <h2 className="font-arcade text-2xl sm:text-3xl text-white">
            {t.gameplay.title}
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            {t.gameplay.subtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Pickaxe size={20} />
            </div>
            <h3 className="font-arcade text-sm text-white">
              {lang === 'en' ? '1. Survival & Resource Gathering' : '1. Sobrevivência & Coleta de recursos'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'en'
                ? `Deploy up to ${maxActiveMiners} heroes into the infected city. They eliminate zombies, destroy caches, and gather Coins continuously.`
                : `Envie até ${maxActiveMiners} heróis para a cidade infectada. Eles eliminam zumbis, destroem depósitos e coletam Coins continuamente.`}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <HeartPulse size={20} />
            </div>
            <h3 className="font-arcade text-sm text-white">
              {lang === 'en' ? '2. Infirmary & Dr. Iris' : '2. Enfermaria & Dra. Íris'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'en'
                ? 'When HP drops in combat, heroes rest in Base medical beds under care to recover up to 1.5x faster depending on your base tier.'
                : 'Quando a vida cai em combate, os heróis descansam nos leitos da Base sob cuidados médicos para recuperar até 1.5x mais rápido dependendo da evolução de sua base.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Wrench size={20} />
            </div>
            <h3 className="font-arcade text-sm text-white">
              {lang === 'en' ? '3. Armorer & Durability' : '3. Armeiro & Durabilidade'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'en'
                ? 'Weapons wear down during combat (4h to 12h by rarity). John the Armorer performs maintenance to keep maximum DPS.'
                : 'Armas sofrem desgaste durante o combate (4h a 12h conforme a raridade). O Mestre Armeiro realiza a manutenção para manter o DPS máximo.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Swords size={20} />
            </div>
            <h3 className="font-arcade text-sm text-white">
              {lang === 'en' ? '4. Bosses & P2P Market' : '4. Bosses & Mercado P2P'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'en'
                ? 'Bosses invade the map periodically, dropping Construction Chests and Fragments. Trade extra heroes on the P2P Market or withdraw in USDT.'
                : 'Chefões invadem o mapa periodicamente rendendo Baús de Construção e Fragmentos. Negocie heróis extras no Mercado P2P ou faça saque em USDT.'}
            </p>
          </div>
        </div>

        {/* BLOCO DE SUSTENTABILIDADE ECONÔMICA */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/85 border border-emerald-500/30 space-y-6 shadow-xl">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400">
              <ShieldCheck size={15} />
              <span>{lang === 'en' ? 'Long-Term Economic Architecture' : 'Arquitetura Econômica de Longo Prazo'}</span>
            </span>
            <h3 className="font-arcade text-xl sm:text-2xl text-white">
              {lang === 'en'
                ? 'HOW THE GAME PRESERVES THE ECONOMY TO LAST LONGER'
                : 'COMO O JOGO PRESERVA A ECONOMIA PARA DURAR MUITO MAIS'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {lang === 'en'
                ? 'Unlike projects that collapse from unchecked emission, CryptoZombies is designed with multiple token sinks, production caps, and reinvestment incentives to keep liquidity healthy.'
                : 'Ao contrário de projetos que colapsam por emissão sem freio, o CryptoZombies foi projetado com múltiplos sumidouros (sinks), controle de produção e incentivos de reinvestimento para manter a liquidez saudável por muito mais tempo.'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="font-arcade text-xs text-amber-300">
                {lang === 'en' ? 'Controlled Emission' : 'Emissão Controlada'}
              </h4>
              <p className="text-slate-400 leading-relaxed">
                {lang === 'en'
                  ? `Coin production is capped at ${maxActiveMiners} active heroes and calibrated by rarity, preventing infinite farming or supply spikes.`
                  : <>A produção de <b className="text-slate-200">Coins</b> é limitada a até {maxActiveMiners} heróis ativos simultâneos e calibrada por raridade, impedindo farm infinito ou explosão artificial de oferta.</>}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="font-arcade text-xs text-orange-300">
                {lang === 'en' ? 'Liquidity & Official Token' : 'Liquidez & Token Oficial'}
              </h4>
              <p className="text-slate-400 leading-relaxed">
                {lang === 'en'
                  ? 'Built for a lasting economy: targeted ads help keep the liquidity pool funded, and an official token with burn mechanics is planned to strengthen your investment.'
                  : <>O jogo foi pensado com base em uma economia duradoura: alguns anúncios em momentos específicos ajudam a manter a pool de liquidez sempre cheia. Em breve teremos a <b className="text-slate-200">moeda oficial</b> que substituirá os Coins, com função de queima de tokens para valorizar ainda mais o seu investimento!</>}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="font-arcade text-xs text-sky-300">
                {lang === 'en' ? 'Rotation & Evolution' : 'Revezamento & Evolução'}
              </h4>
              <p className="text-slate-400 leading-relaxed">
                {lang === 'en'
                  ? 'Wounded heroes rest in the Medical Base. Expanding from 5 to 10 or 15 beds consumes Boss Fragments and Coins, plus weapon repairs by John the Armorer.'
                  : <>Heróis feridos passam pelos leitos da <b className="text-slate-200">Base Médica</b>. Expandir de 5 para 10 ou 15 vagas consome <b className="text-slate-200">Fragmentos de Boss</b> e Coins, desgaste das armas com reparo pelo <b className="text-slate-200">John Armeiro</b>, valorizando a retenção e o progresso da conta.</>}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="font-arcade text-xs text-purple-300">
                {lang === 'en' ? 'Rejuvenation & Stars' : 'Rejuvenescimento & Estrelas'}
              </h4>
              <p className="text-slate-400 leading-relaxed">
                {lang === 'en'
                  ? 'The Rejuvenation System renews hero cycles with potions, while Star Evolution (1★ to 3★) boosts production (+5% to +15%), driving steady asset demand.'
                  : <>O <b className="text-slate-200">Sistema de Rejuvenescimento</b> renova o ciclo útil dos heróis com poções, enquanto a <b className="text-slate-200">Evolução de Estrelas</b> (1★ a 3★) fortalece e amplia a produção (+5% a +15%), criando demanda contínua de ativos.</>}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="font-arcade text-xs text-emerald-300">
                {lang === 'en' ? 'P2P Market & Anti-Drain Tax' : 'Mercado P2P & Taxa Anti-Drenagem'}
              </h4>
              <p className="text-slate-400 leading-relaxed">
                {lang === 'en'
                  ? 'Hero trading runs between players with a marketplace fee and progressive withdrawal tax, protecting the treasury against short-term predatory drains.'
                  : 'O comércio de heróis ocorre entre jogadores com taxa de mercado e imposto progressivo de saque, protegendo o caixa contra saques predatórios de curto prazo.'}
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
                        transform: [0, 1, 3, 4, 8, 9, 10].includes(heroWeapon?.sourceIndex ?? 0)
                          ? 'scaleX(-1) scale(1.15)'
                          : 'scale(1.15)',
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
          <section id="personagens" className="border-t border-emerald-900/50 bg-[#04160e]/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-10">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  {t.heroes.eyebrow}
                </span>
                <h2 className="font-arcade text-2xl sm:text-3xl text-white">
                  {t.heroes.title}
                </h2>
                <p className="text-sm text-slate-400 max-w-2xl">
                  {t.heroes.subtitle}
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
                              className={`w-full h-full object-contain drop-shadow ${
                                sup.id === 'iris' ? 'scale-[1.35]' : ''
                              }`}
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
      <section id="rates" className="border-t border-emerald-900/50 max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        {/* Tabela de Atributos por Raridade */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
              {t.rates.eyebrow}
            </span>
            <h2 className="font-arcade text-2xl sm:text-3xl text-white">
              {t.rates.title}
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              {t.rates.subtitle}
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/90 text-slate-400 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">{lang === 'en' ? 'Rarity' : 'Raridade'}</th>
                  <th className="px-4 py-3.5">{lang === 'en' ? 'Health (HP)' : 'Vida (PV)'}</th>
                  <th className="px-4 py-3.5">{lang === 'en' ? 'Base Power' : 'Poder Base'}</th>
                  <th className="px-4 py-3.5">{lang === 'en' ? 'Output (Coins/h)' : 'Produção (Coins/h)'}</th>
                  <th className="px-4 py-3.5">{lang === 'en' ? 'Weapon Durab.' : 'Durab. Arma'}</th>
                  <th className="px-4 py-3.5">{lang === 'en' ? 'Recov. (Basic / Reinf. / Adv.)' : 'Recup. (Básica / Ref. / Avanç.)'}</th>
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
      <section id="abrigos" className="border-t border-emerald-900/50 bg-[#04160e]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
              {t.bases.eyebrow}
            </span>
            <h2 className="font-arcade text-2xl sm:text-3xl text-white">
              {t.bases.title}
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              {t.bases.subtitle}
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
                      {house.recoverySpeedMultiplier}x {lang === 'en' ? 'Speed' : 'Vel.'}
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
                    {house.slots} {lang === 'en' ? 'slots' : 'vagas'}
                  </span>
                  {fragCost === 0 && coinsCost === 0 ? (
                    <span className="font-arcade text-emerald-400">{lang === 'en' ? 'Free' : 'Grátis'}</span>
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
      <section id="evolucao" className="border-t border-emerald-900/50 bg-[#04160e]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-10">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
              {t.evolution.eyebrow}
            </span>
            <h2 className="font-arcade text-2xl sm:text-3xl text-white">
              {t.evolution.title}
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              {t.evolution.subtitle}
            </p>
          </div>

          {/* Como Funciona (3 passos) */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-arcade text-amber-300">{t.evolution.step1Title}</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t.evolution.step1Body}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-arcade text-purple-300">{t.evolution.step2Title}</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t.evolution.step2Body}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-arcade text-emerald-300">{t.evolution.step3Title}</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t.evolution.step3Body}
              </p>
            </div>
          </div>

          {/* História da Idade & Penalidades por Idade */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-950/35 via-slate-900/95 to-slate-950 border border-rose-500/35 space-y-5 shadow-xl">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-rose-400">
                {t.evolution.ageEyebrow}
              </span>
              <h3 className="font-arcade text-base sm:text-lg text-white">
                {t.evolution.ageTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
                {t.evolution.ageStory}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
                <div className="font-arcade text-xs text-emerald-300">{lang === 'en' ? '0 to 49 Days' : '0 a 49 Dias'}</div>
                <div className="font-bold text-white">{lang === 'en' ? 'Physical Peak' : 'Ápice Físico'}</div>
                <p className="text-[11px] text-slate-300">
                  {lang === 'en'
                    ? <><b>0% penalty.</b> Coin output and recovery speed at 100%.</>
                    : <><b>0% de penalidade.</b> Produção de Coins e velocidade de recuperação em 100%.</>}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-1">
                <div className="font-arcade text-xs text-amber-300">{lang === 'en' ? '50 to 69 Days' : '50 a 69 Dias'}</div>
                <div className="font-bold text-white">{lang === 'en' ? 'Early Wear' : 'Desgaste Inicial'}</div>
                <p className="text-[11px] text-slate-300">
                  {lang === 'en'
                    ? <><b>-15%</b> Coin output and <b>-10%</b> energy recovery speed.</>
                    : <><b>-15%</b> na produção de Coins e <b>-10%</b> na velocidade de recuperação de energia.</>}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-orange-950/35 border border-orange-500/40 space-y-1">
                <div className="font-arcade text-xs text-orange-300">{lang === 'en' ? '70 to 79 Days' : '70 a 79 Dias'}</div>
                <div className="font-bold text-white">{lang === 'en' ? 'Critical Fatigue' : 'Fadiga Crítica'}</div>
                <p className="text-[11px] text-slate-300">
                  {lang === 'en'
                    ? <><b>-30%</b> Coin output and <b>-20%</b> energy recovery speed.</>
                    : <><b>-30%</b> na produção de Coins e <b>-20%</b> na recuperação de energia.</>}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/45 space-y-1">
                <div className="font-arcade text-xs text-rose-300">{lang === 'en' ? '80+ Days' : '80+ Dias'}</div>
                <div className="font-bold text-white">{lang === 'en' ? 'Cycle Depleted' : 'Ciclo Esgotado'}</div>
                <p className="text-[11px] text-slate-300">
                  {lang === 'en'
                    ? <><b>-50%</b> Coin output until evolved with a <b>Rejuvenation Potion</b>.</>
                    : <><b>-50%</b> na produção de Coins até evoluir com a <b>Poção de Rejuvenescimento</b>.</>}
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
      <section id="indique-e-ganhe" className="border-t border-emerald-900/50 bg-[#04160e]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-400">
                <Gift size={15} />
                <span>{t.referral.eyebrow}</span>
              </span>
              <h2 className="font-arcade text-2xl sm:text-3xl text-white">
                {t.referral.title}
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl">
                {t.referral.subtitle}
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-lg">
              <Gift size={32} className="text-amber-300" />
            </div>
          </div>

          {/* Como funciona */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-arcade text-emerald-300">{t.referral.step1Title}</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t.referral.step1Body}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-arcade text-purple-300">{t.referral.step2Title}</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t.referral.step2Body}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-arcade text-amber-300">{t.referral.step3Title}</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t.referral.step3Body}
              </p>
            </div>
          </div>

          {/* Exemplo e Painel de Indicação no Site */}
          <div className="p-6 rounded-3xl bg-slate-900/95 border border-amber-500/40 space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Exemplo de Comissão
                </div>
                <p className="text-sm text-slate-200">
                  Seu indicado compra um Baú de <b className="text-white">US$ 100,00</b> ➔ Você recebe{' '}
                  <b className="text-amber-300">100 Coins</b> (equivalente a US$ 1,00 na cotação oficial de 1 Coin = US$ {minerRate.toFixed(2)}).
                </p>
              </div>

              {!authUser && (
                <div className="flex flex-wrap gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenAuth('register')}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-arcade text-xs flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Gift size={15} />
                    <span>{t.referral.ctaGuest}</span>
                  </button>
                </div>
              )}
            </div>

            {authUser && (
              <div className="pt-5 border-t border-slate-800 space-y-5">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-950 border border-purple-500/40 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-arcade text-sm sm:text-base text-white flex items-center gap-2">
                        <Share2 size={16} className="text-purple-400" />
                        <span>SEU PAINEL DE INDICAÇÃO</span>
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Gerencie seu link exclusivo, acompanhe indicados e veja suas comissões diretamente pelo site.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-400/40 font-mono text-xs font-bold text-amber-300">
                      Comissão: {REFERRAL_COMMISSION_PCT}% Coins
                    </span>
                  </div>

                  {!hasHeroToPromote ? (
                    <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-3">
                      <Lock size={18} className="text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <div className="font-bold text-rose-200">
                          Divulgação bloqueada: é necessário ter pelo menos 1 herói
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          Para liberar seu link exclusivo de indicação e receber {REFERRAL_COMMISSION_PCT}% em Coins, adquira ou invoque pelo menos <b>1 herói</b> na sua conta.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block">
                        Seu Link Exclusivo de Indicação (Código: {referralSummary.referralCode})
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          readOnly
                          value={referralLink}
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-emerald-300 select-all focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleCopyReferralLink}
                          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-arcade text-xs flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
                        >
                          {refCopied ? <Check size={14} /> : <Copy size={14} />}
                          <span>{refCopied ? 'COPIADO!' : 'COPIAR LINK'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      Indicados Cadastrados
                    </span>
                    <div className="font-arcade text-xl text-white">
                      {referralSummary.referredCount}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      Total Ganho em Coins
                    </span>
                    <div className="font-arcade text-xl text-amber-300">
                      {referralSummary.totalCoinsEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      Status de Divulgação
                    </span>
                    <div className={`font-arcade text-sm ${hasHeroToPromote ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {hasHeroToPromote ? 'LIBERADO (1+ Herói)' : 'BLOQUEADO (0 Heróis)'}
                    </div>
                  </div>
                </div>

                {/* Histórico de Comissões */}
                <div className="space-y-2.5">
                  <h4 className="font-arcade text-xs text-slate-300 uppercase">
                    Histórico de Comissões Recebidas
                  </h4>
                  {referralSummary.rewards.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 text-center text-xs text-slate-400">
                      Nenhuma comissão registrada ainda. Compartilhe seu link após liberar com 1+ herói!
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {referralSummary.rewards.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-bold text-white">
                              {item.referred_name || 'Comandante'} • {item.package_id || 'Baú USDT'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Compra: US$ {Number(item.purchase_usdt || 0).toFixed(2)} •{' '}
                              {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : 'Hoje'}
                            </div>
                          </div>
                          <div className="font-mono font-bold text-amber-300 shrink-0">
                            +{Number(item.coins_rewarded || 0).toFixed(2)} Coins
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      )}

      {/* SEÇÃO 5: SIMULADOR DE ROI */}
      {activeTab === 'roi' && <RoiSimulatorTab config={config} lang={lang} />}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-emerald-900/50 bg-[#020d08]/95 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Skull size={16} className="text-amber-400" />
              <span className="font-arcade text-slate-300">CRYPTOZOMBIES</span>
              <span>• {t.footer.portal}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setLegalModalType('terms')}
                className="text-slate-400 hover:text-amber-300 underline underline-offset-2 transition cursor-pointer"
              >
                {lang === 'en' ? 'Terms of Use' : 'Termos de Uso'}
              </button>
              <button
                type="button"
                onClick={() => setLegalModalType('privacy')}
                className="text-slate-400 hover:text-amber-300 underline underline-offset-2 transition cursor-pointer"
              >
                {lang === 'en' ? 'Privacy Policy' : 'Política de Privacidade'}
              </button>
              {!authUser ? (
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                >
                  {lang === 'en' ? 'Sign In / Create Account →' : 'Entrar / Criar Conta →'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onEnterGame}
                  className="text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
                >
                  {lang === 'en' ? 'Enter Game →' : 'Ir para o Jogo →'}
                </button>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-950/80 text-[11px] text-slate-500 text-center leading-relaxed">
            {lang === 'en'
              ? 'Web3 Risk Notice: Digital assets, blockchain transactions, and play-to-earn games involve market and operational risks. ROI projections are estimates based on simulated parameters and do not guarantee future returns.'
              : 'Aviso de Risco Web3: Ativos digitais, transações em blockchain e jogos Web3 envolvem riscos operacionais e de mercado. Projeções de ROI são estimativas baseadas em parâmetros simulados e não garantem rentabilidade futura.'}
          </div>
        </div>
      </footer>

      {/* MODAL LEGAL (TERMOS DE USO & POLÍTICA DE PRIVACIDADE) */}
      {legalModalType && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setLegalModalType(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[82vh] rounded-3xl bg-slate-900 border border-slate-700 p-6 flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="font-arcade text-sm sm:text-base text-amber-400">
                {legalModalType === 'terms'
                  ? (lang === 'en' ? 'TERMS OF USE • CRYPTOZOMBIES' : 'TERMOS DE USO • CRYPTOZOMBIES')
                  : (lang === 'en' ? 'PRIVACY POLICY • CRYPTOZOMBIES' : 'POLÍTICA DE PRIVACIDADE • CRYPTOZOMBIES')}
              </h3>
              <button
                type="button"
                onClick={() => setLegalModalType(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed pr-1">
              {legalModalType === 'terms' ? (
                lang === 'en' ? (
                  <>
                    <p><b>1. Eligibility & Account:</b> Players are responsible for maintaining the security of their login credentials and connected Web3 wallets. Never share your private keys or seed phrases.</p>
                    <p><b>2. On-Chain Transactions:</b> All USDT chest purchases and support hires confirmed on blockchain networks are irreversible. Gas fees are borne by the user.</p>
                    <p><b>3. Game Economy & Balancing:</b> CryptoZombies reserves the right to adjust economic parameters, drop rates, and anti-abuse rules to preserve ecosystem sustainability.</p>
                    <p><b>4. Risk Disclaimer:</b> Participation does not constitute financial advice or guaranteed profit. Only allocate resources you understand and are comfortable using in Web3 environments.</p>
                  </>
                ) : (
                  <>
                    <p><b>1. Elegibilidade e Conta:</b> O jogador é integralmente responsável pela segurança de suas credenciais de acesso e carteiras Web3 conectadas. Nunca compartilhe suas chaves privadas ou frases-semente.</p>
                    <p><b>2. Transações On-Chain:</b> Todas as compras de Baús e contratações em USDT confirmadas na blockchain são irreversíveis. Taxas de rede (gas) são de responsabilidade do usuário.</p>
                    <p><b>3. Economia e Balanceamento:</b> O CryptoZombies reserva-se o direito de ajustar parâmetros econômicos, taxas e regras antifraude para preservar a sustentabilidade do ecossistema.</p>
                    <p><b>4. Aviso de Risco:</b> A participação no jogo não constitui recomendação financeira nem garantia de lucro. Utilize apenas valores adequados ao seu perfil de risco em ambientes Web3.</p>
                  </>
                )
              ) : lang === 'en' ? (
                <>
                  <p><b>1. Data Collected:</b> We store your account email, player profile preferences, public Web3 wallet address, and in-game progression securely via Supabase.</p>
                  <p><b>2. Use of Data:</b> Data is used strictly for authentication, cloud save synchronization, referral tracking, and transaction auditing.</p>
                  <p><b>3. Wallet Security:</b> We never request or store private keys. Wallet connections and signatures occur strictly through your browser Web3 provider.</p>
                  <p><b>4. User Rights:</b> You may request account review or deletion at any time through official support channels.</p>
                </>
              ) : (
                <>
                  <p><b>1. Dados Coletados:</b> Armazenamos seu e-mail de cadastro, preferências de perfil, endereço público da carteira Web3 e progresso no jogo com segurança via Supabase.</p>
                  <p><b>2. Uso das Informações:</b> Os dados são utilizados exclusivamente para autenticação, sincronização em nuvem, controle de indicações e auditoria de transações.</p>
                  <p><b>3. Segurança da Carteira:</b> Nunca solicitamos nem armazenamos chaves privadas. Conexões e assinaturas ocorrem exclusivamente na extensão/carteira do seu navegador.</p>
                  <p><b>4. Direitos do Usuário:</b> Você pode solicitar revisão ou exclusão dos seus dados cadastrais a qualquer momento pelos canais oficiais de suporte.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
