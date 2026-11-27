import React, { useState, useEffect } from 'react';
import { 
  BarChart3,
  Pickaxe, 
  Coins, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Sparkles, 
  Compass,
  ArrowDownToLine,
  Wallet,
  X,
  BookOpen,
  Package,
  Home,
  TrendingUp,
  ShieldCheck,
  ShoppingBag,
  Activity,
  Clock,
  Trophy,
  Flame,
  Users,
  Pin,
  ChevronDown,
  LogOut,
  Globe,
  Crosshair
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MINES, INITIAL_MINERS, MINER_CLASSES } from './data/minersData';
import { HERO_ROSTER, WEAPON_CATALOG, getHeroById, getWeaponById } from './data/heroRoster';
import { resolveHouseTier } from './data/housesData';
import { ENTRY_PACKAGES, calculateWithdrawalTax } from './data/investmentData';
import { INITIAL_MARKET_LISTINGS, MARKETPLACE_FEE_PCT, FEE_SPLIT } from './data/marketplaceData';
import { MINERS_ROSTER } from './data/minersCatalog';
import { generateMineMap } from './utils/mapGenerator';
import { isCityBuilding, isBaseCompound, getSafeHeroSpawn } from './utils/cityMapGeometry';
import { getPlayerMap, generatePlayerMap, DEFAULT_PLAYER_ID, removeBossFromPlayerMap, spawnBossInPlayerMap } from './utils/individualMapEngine';
import { evaluateBossSchedule, recordBossDefeatInSchedule, forceBossInvasionNow } from './utils/bossScheduleManager';
import { sfx } from './utils/sfx';
import { isSupabaseConfigured } from './lib/supabaseClient';
import { 
  loadPlayerDataFromSupabase, 
  syncProfileToSupabase, 
  syncHeroesToSupabase, 
  syncInventoryToSupabase, 
  logTransactionToSupabase 
} from './services/supabaseService';
import GameBoard from './components/GameBoard';
import ZombieSurvivalBoard from './components/ZombieSurvivalBoard';
import HeroList from './components/HeroList';
import HeroEvolutionModal from './components/HeroEvolutionModal';
import SummonModal from './components/SummonModal';
import WalletModal from './components/WalletModal';
import UserProfileModal from './components/UserProfileModal';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import SpawnZonesModal from './components/SpawnZonesModal';
import { getCurrentAuthUser, subscribeAuthChanges, signOutUser } from './services/authService';
import {
  captureReferralFromUrl,
  syncPendingReferralToProfile,
  recordReferralPurchaseReward
} from './services/referralService';
import ConstructionChestFoundModal from './components/ConstructionChestFoundModal';
import RoiSimulatorModal from './components/RoiSimulatorModal';
import AdminConfigModal from './components/AdminConfigModal';
import StatisticsModal from './components/StatisticsModal';
import TowerCalibrationModal from './components/TowerCalibrationModal';
import BillboardCalibrationModal from './components/BillboardCalibrationModal';
import MapCollisionEditorToolbar from './components/MapCollisionEditorToolbar';
import { getActiveObstaclesCount, resetCustomObstacles } from './utils/cityMapGeometry';
import { getCryptoZombiesConfig } from './data/cryptoZombiesConfig';
import { 
  DEFAULT_CONSTRUCTION_CHEST_CONFIG,
  calculateActiveMinersChance,
  executeConstructionBossRoll,
  getDailyConstructionStats,
  getStoredConstructionChests,
  saveStoredConstructionChests,
  getStoredConstructionFragments,
  saveStoredConstructionFragments,
  openConstructionChestById
} from './utils/constructionChestEngine';
import { calculateMinerEfficiency } from './utils/minerRotationEngine';
import { Calculator, Settings } from 'lucide-react';
import {
  getSavedWalletState,
  saveWalletState,
  requestWalletConnection,
  disconnectWalletFromStorage,
  executeRealUsdtPayment,
  refreshWalletUsdtBalance
} from './utils/web3Wallet';
import MinerCatalogModal from './components/MinerCatalogModal';
import MineSelectorModal from './components/MineSelectorModal';
import InventoryModal from './components/InventoryModal';
import RewardedAdModal from './components/RewardedAdModal';
import ChestOpeningModal from './components/ChestOpeningModal';
import HouseModal from './components/HouseModal';
import ArmorerHireModal from './components/ArmorerHireModal';
import { getStaffContract, saveStaffContract } from './data/staffCatalog';
import InvestmentModal from './components/InvestmentModal';
import MarketplaceModal from './components/MarketplaceModal';
import MiningStatsModal from './components/MiningStatsModal';
import GearInventoryModal from './components/GearInventoryModal';
import CampaignMapModal from './components/CampaignMapModal';
import { INITIAL_GEAR_STASH } from './data/gearData';
import { applyHeroBaseHP } from './utils/heroHealth';

export default function App() {
  const [bcoin, setBcoin] = useState(() => {
    const saved = localStorage.getItem('crypto_miners_bcoin');
    return saved !== null ? parseFloat(saved) : 50.000;
  });

  // Total BCOIN Investido (para cálculo do ROI do CryptoZombies)
  const [totalInvested, setTotalInvested] = useState(() => {
    const saved = localStorage.getItem('crypto_miners_invested');
    return saved !== null ? parseFloat(saved) : 30.000;
  });

  // ROI de saque: considera somente USDT efetivamente sacado (valor líquido recebido).
  const [totalWithdrawnUsdt, setTotalWithdrawnUsdt] = useState(() => {
    const saved = localStorage.getItem('crypto_miners_total_withdrawn_usdt');
    return saved !== null ? Math.max(0, parseFloat(saved) || 0) : 0;
  });
  const [isInvestmentOpen, setIsInvestmentOpen] = useState(false);

  // Lucro Arrecadado pelo Estúdio com Taxas do Marketplace (3% da plataforma)
  const [studioRevenue, setStudioRevenue] = useState(() => {
    const saved = localStorage.getItem('crypto_miners_studio_rev');
    return saved !== null ? parseFloat(saved) : 18.500;
  });

  // Listagens ativas no Marketplace P2P (inicia vazio, sem heróis fictícios)
  const [marketplaceListings, setMarketplaceListings] = useState(() => {
    const saved = localStorage.getItem('cryptozombies_market_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_MARKET_LISTINGS;
  });
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);

  const [boardMode, setBoardMode] = useState('canyon'); // 'canyon' (Canvas HD com Zumbis e Boss) | 'tactical' (Grid Tático)
  const [currentMine, setCurrentMine] = useState(MINES[0]);
  const [mapStage, setMapStage] = useState(1);
  const [mapClearNotice, setMapClearNotice] = useState(null); // Notificação de vitória do CryptoZombies
  const [mapData, setMapData] = useState(() => {
    const savedWallet = getSavedWalletState();
    const pId = savedWallet?.address || DEFAULT_PLAYER_ID;
    return getPlayerMap(pId);
  });

  const [miners, setMiners] = useState(() => {
    const saved = localStorage.getItem('crypto_miners_team');
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sanitização de coordenadas: garante que nenhum herói carregado do localStorage permaneça dentro de escombros ou base
          let hasObstaclePosition = false;
          parsed = parsed.map((m, idx) => {
            const mx = Math.round(m.x);
            const my = Math.round(m.y);
            if (typeof m.x !== 'number' || typeof m.y !== 'number' || isNaN(m.x) || isNaN(m.y) || isCityBuilding(mx, my) || isBaseCompound(mx, my)) {
              hasObstaclePosition = true;
              const safePt = getSafeHeroSpawn(idx);
              return { ...m, x: safePt.x, y: safePt.y, visualX: safePt.x, visualY: safePt.y };
            }
            return m;
          });
          if (hasObstaclePosition) {
            localStorage.setItem('crypto_miners_team', JSON.stringify(parsed));
          }
          // Migração automática de heróis legados (que não existem mais no HERO_ROSTER) para heróis oficiais
          const validRosterIds = new Set(HERO_ROSTER.map(h => h.id));
          let hasLegacyHeroes = false;
          parsed = parsed.map((m, idx) => {
            if (!m.heroId || !validRosterIds.has(m.heroId)) {
              hasLegacyHeroes = true;
              const rh = HERO_ROSTER[idx % HERO_ROSTER.length];
              return {
                ...m,
                heroId: rh.id,
                name: rh.name,
                classId: rh.classId,
                className: rh.className,
                weaponId: rh.weaponId,
                rarity: rh.rarity,
                rarityName: rh.rarityName,
                spriteIndex: rh.spriteIndex,
                image: `/assets/heroes/${rh.id}.png`
              };
            }
            return m;
          });
          if (hasLegacyHeroes) {
            localStorage.setItem('crypto_miners_team', JSON.stringify(parsed));
          }

          // Sanitização: Íris é a médica do abrigo (NPC / não jogador, não possui raridade de combate)
          if (parsed.some(m => m.heroId === 'iris')) {
            parsed = parsed.map(m => {
              if (m.heroId === 'iris') {
                const fallback = HERO_ROSTER.find(h => h.id === 'nox') || HERO_ROSTER[0];
                return {
                  ...m,
                  heroId: fallback.id,
                  name: fallback.name,
                  classId: fallback.classId,
                  className: fallback.className,
                  weaponId: fallback.weaponId,
                  rarity: fallback.rarity,
                  rarityName: fallback.rarityName,
                  spriteIndex: fallback.spriteIndex
                };
              }
              return m;
            });
            localStorage.setItem('crypto_miners_team', JSON.stringify(parsed));
          }

          // Sincronização automática das raridades oficiais do HERO_ROSTER (ex: Verdant e Múmia são Super Raros)
          const needsRosterUpdate = parsed.some(m => {
            const rh = HERO_ROSTER.find(h => h.id === m.heroId);
            return rh && m.rarity !== rh.rarity;
          });
          if (needsRosterUpdate) {
            parsed = parsed.map(m => {
              const rh = HERO_ROSTER.find(h => h.id === m.heroId);
              if (rh) {
                return {
                  ...m,
                  rarity: rh.rarity,
                  rarityName: rh.rarityName
                };
              }
              return m;
            });
            localStorage.setItem('crypto_miners_team', JSON.stringify(parsed));
          }

          // Sincronização definitiva dos 11 novos Heróis e Armas do HERO_ROSTER
          const needsRosterSync = parsed.some(m => !m.heroId || !m.weaponId);
          if (needsRosterSync) {
            const synced = parsed.map((m, idx) => {
              const rosterHero = HERO_ROSTER.find(h => h.id === m.heroId) || HERO_ROSTER[idx % HERO_ROSTER.length];
              const cInfo = MINER_CLASSES[rosterHero.classId] || MINER_CLASSES.miner;
              return {
                ...m,
                heroId: rosterHero.id,
                weaponId: m.weaponId || rosterHero.weaponId,
                classId: rosterHero.classId,
                className: rosterHero.className,
                rarity: m.rarity || rosterHero.rarity,
                rarityName: rosterHero.rarityName,
                spriteIndex: rosterHero.spriteIndex,
                name: (m.name && !m.name.startsWith('Bomb-Bot') && !m.name.startsWith('Ragnar') && !m.name.startsWith('Kero') && !m.name.startsWith('Morgana') && !m.name.startsWith('Vlad') && !m.name.startsWith('Minerador') && !m.name.startsWith('Capitão') && !m.name.startsWith('Cowboy') && !m.name.startsWith('Fadinha') && !m.name.startsWith('Homem-Aranha') && !m.name.startsWith('Bruce') && !m.name.startsWith('Bilionário'))
                  ? m.name
                  : rosterHero.name,
                avatar: cInfo.avatar,
                color: cInfo.color
              };
            });
            localStorage.setItem('crypto_miners_team', JSON.stringify(synced));
            return synced;
          }
          // Sincronização dos novos heróis Hunter e Scarlet
          if (!parsed.some(m => m.heroId === 'hunter') || !parsed.some(m => m.heroId === 'scarlet')) {
            const updated = [...parsed];
            if (!updated.some(m => m.heroId === 'hunter') && updated.length < 15) {
              const hunter = INITIAL_MINERS.find(m => m.heroId === 'hunter');
              if (hunter) updated.push({ ...hunter, id: 'miner-' + Date.now() + '-hunter' });
            }
            if (!updated.some(m => m.heroId === 'scarlet') && updated.length < 15) {
              const scarlet = INITIAL_MINERS.find(m => m.heroId === 'scarlet');
              if (scarlet) updated.push({ ...scarlet, id: 'miner-' + Date.now() + '-scarlet' });
            }
            localStorage.setItem('crypto_miners_team', JSON.stringify(updated));
            return updated;
          }

          // Garante que a equipe ativa tenha 15 heróis saudáveis prontos para combate
          const isWounded = m => {
            const maxHealth = Number(m.maxHealth) > 0 ? Number(m.maxHealth) : 100;
            const currentHealth = Number.isFinite(Number(m.currentHealth)) ? Number(m.currentHealth) : maxHealth;
            return m.status === 'injured' || m.injuredAwaitingRescue || (currentHealth / maxHealth) * 100 <= 5;
          };
          // Migra antigos estados de descanso por estamina para reserva.
          // Mantém house/waiting_house apenas para feridos em tratamento ou aguardando leito.
          const normalizedStatuses = parsed.map(m => {
            if ((m.status === 'house' || m.status === 'waiting_house') && !isWounded(m)) {
              return { ...m, status: 'reserve' };
            }
            return m;
          });
          const workHeroes = normalizedStatuses.filter(m => m.status === 'work' && !isWounded(m));
          if (workHeroes.length < 15) {
            let activeCount = 0;
            const restored = normalizedStatuses.map(m => {
              if (isWounded(m)) return m;
              if (activeCount < 15) {
                activeCount++;
                return {
                  ...m,
                  status: 'work'
                };
              }
              return m;
            });
            localStorage.setItem('crypto_miners_team', JSON.stringify(restored));
            return restored;
          }

          if (normalizedStatuses.some((m, i) => m !== parsed[i])) {
            localStorage.setItem('crypto_miners_team', JSON.stringify(normalizedStatuses));
            return normalizedStatuses;
          }
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_MINERS;
  });

  // Aplica a tabela única de HP por raridade a toda a equipe, inclusive heróis já salvos e recém-adquiridos.
  // Ao migrar o HP máximo, preserva a porcentagem de vida atual do herói.
  useEffect(() => {
    const updated = miners.map(applyHeroBaseHP);
    if (updated.some((hero, index) => hero !== miners[index])) {
      setMiners(updated);
    }
  }, [miners]);

  // Casa dos mineradores (House System - sistema próprio de mineração e abrigos)
  const [currentHouseId, setCurrentHouseId] = useState(() => {
    const savedHouseId = localStorage.getItem('crypto_miners_house') || 'basic';
    return resolveHouseTier(savedHouseId).id;
  });
  const [isHouseOpen, setIsHouseOpen] = useState(false);
  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState(false);

  // John Armeiro (Sala de Armas & Manutenção Automática de Armas)
  const [armorerContract, setArmorerContract] = useState(() => getStaffContract('armeiro'));
  const [isArmorerHireOpen, setIsArmorerHireOpen] = useState(false);
  const isArmorerActive = Boolean(armorerContract?.active && armorerContract?.expiresAt > Date.now());

  // Médica Chefe do Abrigo: Dra. Íris (Hospital & Leitos)
  const [irisContract, setIrisContract] = useState(() => getStaffContract('iris'));
  const isIrisActive = Boolean(
    resolveHouseTier(currentHouseId).slots > 0 &&
    irisContract?.active &&
    (irisContract?.expiresAt > Date.now() || irisContract?.planId === 'permanent')
  );

  const handleToggleIrisActive = () => {
    setIrisContract(prev => {
      const currentlyActive = Boolean(prev?.active && (prev?.expiresAt > Date.now() || prev?.planId === 'permanent'));
      const nextActive = !currentlyActive;
      const updated = {
        ...(prev || {}),
        active: nextActive,
        expiresAt: nextActive ? (prev?.expiresAt > Date.now() ? prev.expiresAt : Date.now() + 365 * 24 * 60 * 60 * 1000) : 0,
        planId: prev?.planId || 'permanent'
      };
      saveStaffContract('iris', updated);
      return updated;
    });
  };

  const handleHireArmorer = async (plan, currency) => {
    if (currency === 'coins') {
      if (bcoin < plan.costCoins) {
        alert(`Saldo insuficiente de Coins. Você precisa de ${plan.costCoins.toLocaleString('pt-BR')} Coins.`);
        return false;
      }
      setBcoin(prev => {
        const next = parseFloat(Math.max(0, prev - plan.costCoins).toFixed(3));
        localStorage.setItem('crypto_miners_bcoin', next.toString());
        return next;
      });
    } else {
      if ((walletState?.usdtBalance || 0) < plan.costUsdt) {
        alert(`Saldo insuficiente de USDT. Você precisa de $${plan.costUsdt.toFixed(2)} USDT.`);
        return false;
      }
      try {
        const payment = await executeRealUsdtPayment({
          amountUsdt: plan.costUsdt,
          memo: `Contrato Armeiro ${plan.durationDays}d`
        });
        if (payment?.updatedState) setWalletState(payment.updatedState);
      } catch (err) {
        alert(err?.message || 'Transação Web3 cancelada ou falhou.');
        return false;
      }
    }

    const durationMs = plan.durationDays * 24 * 60 * 60 * 1000;
    const currentExpiry = (armorerContract?.active && armorerContract?.expiresAt > Date.now())
      ? armorerContract.expiresAt
      : Date.now();
    const nextExpiry = currentExpiry + durationMs;

    const newContract = {
      active: true,
      planId: plan.id,
      hiredAt: Date.now(),
      expiresAt: nextExpiry,
      durationDays: plan.durationDays,
      paidWith: currency
    };

    setArmorerContract(newContract);
    saveStaffContract('armeiro', newContract);

    // Imediatamente restaura as armas de todos os heróis da equipe para 100% de durabilidade
    setMiners(prev => {
      const restored = prev.map(m => ({ ...m, durability: 100 }));
      localStorage.setItem('crypto_miners_team', JSON.stringify(restored));
      return restored;
    });

    return true;
  };

  // Limpeza de baús antigos da mina descontinuados
  useEffect(() => {
    try {
      localStorage.removeItem('crypto_miners_chests');
    } catch (e) {}
  }, []);

  const [gameSpeed, setGameSpeed] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(false); // Som desativado por padrão conforme solicitado
  const [isSummonOpen, setIsSummonOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isMineSelectorOpen, setIsMineSelectorOpen] = useState(false);
  const [isCampaignMapOpen, setIsCampaignMapOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [userProfileTab, setUserProfileTab] = useState('profile'); // 'profile' | 'wallet' | 'withdraw' | 'history'
  const [isRoiSimulatorOpen, setIsRoiSimulatorOpen] = useState(false);
  const [isAdminConfigOpen, setIsAdminConfigOpen] = useState(false);
  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
  const [isTeamDrawerOpen, setIsTeamDrawerOpen] = useState(false);
  const [isNavPinned, setIsNavPinned] = useState(true);
  const [isNavHovered, setIsNavHovered] = useState(false);
  const showNavbar = isNavPinned || isNavHovered;

  // Auto-exibe o navbar quando o cursor do mouse se aproxima do topo da tela
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientY <= 32) {
        setIsNavHovered(true);
      } else if (e.clientY > 85 && !isNavPinned) {
        setIsNavHovered(false);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isNavPinned]);
  const [cryptoZombiesConfig, setCryptoZombiesConfig] = useState(() => getCryptoZombiesConfig());
  const [walletState, setWalletState] = useState(() => getSavedWalletState());
  const [authUser, setAuthUser] = useState(null);
  const [showGameView, setShowGameView] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [isSpawnZonesOpen, setIsSpawnZonesOpen] = useState(false);

  useEffect(() => {
    captureReferralFromUrl();
    let mounted = true;
    getCurrentAuthUser().then((user) => {
      if (mounted) {
        setAuthUser(user);
        if (user) syncPendingReferralToProfile(user);
      }
    });
    const unsubscribe = subscribeAuthChanges((user) => {
      if (mounted) {
        setAuthUser(user);
        if (user) syncPendingReferralToProfile(user);
      }
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user) => {
    setAuthUser(user);
    setShowGameView(true);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.warn('[Auth] Erro ao sair:', err);
    } finally {
      setAuthUser(null);
      setShowGameView(false);
    }
  };

  const cloudAccountKey = walletState?.address || (authUser?.id ? `auth_${authUser.id}` : null);
  const activePlayerId = cloudAccountKey || DEFAULT_PLAYER_ID;

  // Sincroniza o mapa individual se a conta do jogador for alterada
  useEffect(() => {
    const pId = walletState?.address || DEFAULT_PLAYER_ID;
    const current = getPlayerMap(pId);
    setMapData(current);
  }, [walletState?.address]);

  // Listener para eventos de mapa atualizado externamente ou ciclo concluído
  useEffect(() => {
    const handleExternalMapUpdate = (e) => {
      if (e.detail) {
        setMapData(e.detail);
      }
    };
    window.addEventListener('cripto_myners_map_updated_externally', handleExternalMapUpdate);
    return () => window.removeEventListener('cripto_myners_map_updated_externally', handleExternalMapUpdate);
  }, []);

  const handleOpenUserProfile = (tab = 'profile') => {
    setUserProfileTab(tab);
    setIsUserProfileOpen(true);
  };

  const setIsWalletModalOpen = (val) => {
    if (val) handleOpenUserProfile('wallet');
    else setIsUserProfileOpen(false);
  };

  const setIsClaimModalOpen = (val) => {
    if (val) handleOpenUserProfile('withdraw');
    else setIsUserProfileOpen(false);
  };

  const handleWithdrawClaim = (amount, netUsdt, taxPct, gasAccounting = {}) => {
    setTotalWithdrawnUsdt(prev => parseFloat((prev + Math.max(0, Number(netUsdt) || 0)).toFixed(2)));
    let nextBcoinBalance = bcoin;
    setBcoin(prev => {
      const nextBalance = parseFloat(Math.max(0, prev - amount).toFixed(3));
      nextBcoinBalance = nextBalance;
      localStorage.setItem('crypto_miners_bcoin', nextBalance.toString());
      return nextBalance;
    });
    setWalletState(prev => {
      const nextBalance = parseFloat((prev.usdtBalance + netUsdt).toFixed(2));
      const nextState = { ...prev, usdtBalance: nextBalance };
      saveWalletState(nextState);
      return nextState;
    });

    if (isSupabaseConfigured && walletState?.address) {
      logTransactionToSupabase(walletState.address, {
        type: 'withdraw',
        amountMnc: amount,
        netUsdt: netUsdt,
        taxPct: taxPct,
        details: {
          mncRemaining: nextBcoinBalance,
          gasPayer: gasAccounting.gasPayer || 'project',
          gasNetwork: gasAccounting.gasNetwork || 'solana',
          gasAsset: gasAccounting.gasAsset || 'SOL',
          gasCostUsdt: gasAccounting.gasCostUsdt ?? null,
          gasStatus: gasAccounting.gasStatus || 'pending_onchain_integration',
          feeAccounting: 'gas_cost_deducted_from_project_share_of_withdrawal_fee'
        }
      });
    }
  };

  const handleConnectWallet = async (type) => {
    const newState = await requestWalletConnection(type);
    setWalletState(newState);
  };

  const handleDisconnectWallet = () => {
    const newState = disconnectWalletFromStorage();
    setWalletState(newState);
  };

  const handleAddDemoFunds = async () => {
    const refreshed = await refreshWalletUsdtBalance();
    setWalletState(refreshed);
  };
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  // Baús de Construção e Fragmentos de Construção
  const [constructionChests, setConstructionChests] = useState(() => getStoredConstructionChests());
  const [constructionFragments, setConstructionFragments] = useState(() => getStoredConstructionFragments());
  // Saldo empilhável de Poções do Rejuvenescimento, persistido localmente.
  const [rejuvenationPotions, setRejuvenationPotions] = useState(() => {
    const saved = localStorage.getItem('cryptozombies_rejuvenation_potions_v1');
    const parsed = Number(saved);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  });
  useEffect(() => {
    localStorage.setItem('cryptozombies_rejuvenation_potions_v1', String(rejuvenationPotions));
  }, [rejuvenationPotions]);

  // Integração do saldo empilhável com futuros eventos de concessão/consumo de poções.
  useEffect(() => {
    const handlePotionAwarded = (event) => {
      const quantity = Number(event.detail?.quantity ?? 1);
      if (Number.isInteger(quantity) && quantity > 0) {
        setRejuvenationPotions(prev => prev + quantity);
      }
    };
    const handlePotionConsumed = () => {
      setRejuvenationPotions(prev => Math.max(0, prev - 1));
    };
    window.addEventListener('cryptozombies_rejuvenation_potion_awarded', handlePotionAwarded);
    window.addEventListener('cryptozombies_rejuvenation_potion_consumed', handlePotionConsumed);
    return () => {
      window.removeEventListener('cryptozombies_rejuvenation_potion_awarded', handlePotionAwarded);
      window.removeEventListener('cryptozombies_rejuvenation_potion_consumed', handlePotionConsumed);
    };
  }, []);
  const [constructionDailyStats, setConstructionDailyStats] = useState(() => getDailyConstructionStats());
  const [newlyFoundConstructionChest, setNewlyFoundConstructionChest] = useState(null);

  // Listener para eventos de concessão de Baú de Construção (inclusive via testes admin e derrota de Boss)
  useEffect(() => {
    const handleChestAwarded = (e) => {
      const chest = e.detail;
      setConstructionChests(getStoredConstructionChests());
      setConstructionDailyStats(getDailyConstructionStats());
      setNewlyFoundConstructionChest(chest);
    };
    window.addEventListener('cripto_myners_construction_chest_awarded', handleChestAwarded);
    return () => window.removeEventListener('cripto_myners_construction_chest_awarded', handleChestAwarded);
  }, []);

  // Regra Oficial do Usuário: "dinamica do boss, aparecem só 2x por dia em horarios randomizados"
  const [bossScheduleState, setBossScheduleState] = useState(() => evaluateBossSchedule());

  // Sincronizador contínuo da agenda de invasões do Boss (2x ao dia em horários randomizados)
  useEffect(() => {
    const updateSchedule = () => {
      const state = evaluateBossSchedule();
      setBossScheduleState(state);

      const isBossOnMap = mapData?.deposits?.some(d => (d.type === 'boss' || d.blockId === 10) && !d.isCompleted);
      if (state.isBossActiveNow && !isBossOnMap) {
        // Horário de invasão sorteado chegou: ativa o Boss no mapa com sirene e névoa
        const heroTiles = (miners || []).filter(m => m.status === 'work').map(m => ({ c: Math.round(m.x), r: Math.round(m.y) }));
        const updated = spawnBossInPlayerMap(activePlayerId, { heroTiles });
        setMapData(updated);
      } else if (!state.isBossActiveNow && isBossOnMap) {
        // Fora do horário de invasão: mantém o Boss recolhido
        const updated = removeBossFromPlayerMap(activePlayerId);
        setMapData(updated);
      }
    };

    updateSchedule();
    const ticker = setInterval(updateSchedule, 1000);
    return () => clearInterval(ticker);
  }, [activePlayerId, miners, mapData]);

  // Funções de Teste Oficial: Remoção e Inserção Dinâmica do Boss
  const handleToggleBoss = () => {
    const isBossActive = mapData?.deposits?.some(d => (d.type === 'boss' || d.blockId === 10) && !d.isCompleted);
    if (isBossActive) {
      const updated = removeBossFromPlayerMap(activePlayerId);
      setMapData(updated);
    } else {
      const heroTiles = (miners || []).filter(m => m.status === 'work').map(m => ({ c: Math.round(m.x), r: Math.round(m.y) }));
      const updated = spawnBossInPlayerMap(activePlayerId, { heroTiles });
      setMapData(updated);
    }
  };

  const handleTestBossCycle = (delayMs = 3500) => {
    // 1. Remove o boss imediatamente
    const withoutBoss = removeBossFromPlayerMap(activePlayerId);
    setMapData(withoutBoss);

    // 2. Após o delay, reinsere o boss em outro local livre e distante dos heróis
    setTimeout(() => {
      const heroTiles = (miners || []).filter(m => m.status === 'work').map(m => ({ c: Math.round(m.x), r: Math.round(m.y) }));
      const withBoss = spawnBossInPlayerMap(activePlayerId, { heroTiles });
      setMapData(withBoss);
    }, delayMs);
  };

  useEffect(() => {
    window.removeBoss = () => {
      const m = removeBossFromPlayerMap(activePlayerId);
      setMapData(m);
      return '💀 Boss removido! A torre de sirene e a névoa verde estão se desativando...';
    };
    window.spawnBoss = () => {
      const heroTiles = (miners || []).filter(m => m.status === 'work').map(m => ({ c: Math.round(m.x), r: Math.round(m.y) }));
      const m = spawnBossInPlayerMap(activePlayerId, { heroTiles });
      setMapData(m);
      return '⚠️ Boss inserido! O ALERTA BOSS começará a piscar 4 vezes, a sirene tocará e a névoa retornará.';
    };
    window.testBossCycle = (delayMs = 3500) => {
      handleTestBossCycle(delayMs);
      return `🔄 Ciclo iniciado: Boss removido agora e retornará em ${delayMs}ms com alerta e torre.`;
    };
  }, [activePlayerId, miners]);

  // Encerra o evento de Boss quando atingir o limite de 5 minutos, sem registrar derrota.
  const handleBossExpired = ({ bossId }) => {
    const updated = removeBossFromPlayerMap(activePlayerId);
    setMapData(updated);
    console.info('[CryptoZombies] Evento do Boss encerrado por tempo', { bossId });
  };

  // Executa o sorteio oficial quando o Boss é derrotado.
  // A lista recebida já contém apenas sobreviventes da equipe registrada no início da batalha.
  const handleBossDefeated = ({ bossId, participants = [] }) => {
    // Registra a vitória na agenda oficial diária e recolhe o Boss do mapa
    recordBossDefeatInSchedule();
    setBossScheduleState(evaluateBossSchedule());
    const withoutBoss = removeBossFromPlayerMap(activePlayerId);
    setMapData(withoutBoss);

    const result = executeConstructionBossRoll(participants, DEFAULT_CONSTRUCTION_CHEST_CONFIG, {
      bossId,
      eventType: 'boss_defeat'
    });
    if (result?.won) {
      console.info('[CryptoZombies] Baú do Boss concedido', { bossId, chestId: result.chest?.id });
    } else {
      console.info('[CryptoZombies] Sorteio do Boss concluído sem concessão', {
        bossId,
        reason: result?.reason || 'not_won',
        chance: result?.activeChance?.finalChance ?? 0,
        roll: result?.roll
      });
    }
    return result;
  };

  // Abrir Baú do Boss e integrar todas as recompensas ao inventário persistente.
  const handleOpenConstructionChest = (chestId) => {
    const result = openConstructionChestById(chestId);
    if (!result.success) return result;

    setConstructionChests(result.updatedChests);
    if (result.fragmentGranted) setConstructionFragments(result.totalFragments);
    if (result.potionGranted) setRejuvenationPotions(prev => prev + 1);

    if (result.heroChestGranted) {
      const rewardChest = {
        instanceId: 'boss-reward-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
        id: 'boss-hero-reward',
        name: 'Baú de Herói',
        icon: '🎁',
        image: '/items/hero_chest.png',
        heroesCount: 1,
        currency: 'RECOMPENSA',
        source: 'boss_reward',
        purchasedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setPurchasedChests(prev => {
        const next = [rewardChest, ...prev];
        localStorage.setItem('crypto_miners_purchased_chests', JSON.stringify(next));
        return next;
      });
    }

    return result;
  };

  // Evolução permanente e sequencial da base: fragmentos + Coins.
  const handleUpgradeHouseWithFragments = (targetHouseId, fragmentsCost, mncCost) => {
    const currentTier = resolveHouseTier(localStorage.getItem('crypto_miners_house') || currentHouseId);
    const targetTier = resolveHouseTier(targetHouseId);
    if (targetTier.level !== currentTier.level + 1) return false;
    if (constructionFragments < fragmentsCost || bcoin < mncCost) return false;

    const nextFragments = constructionFragments - fragmentsCost;
    const nextMnc = parseFloat((bcoin - mncCost).toFixed(3));
    saveStoredConstructionFragments(nextFragments);
    setConstructionFragments(nextFragments);
    setBcoin(nextMnc);
    localStorage.setItem('crypto_miners_bcoin', nextMnc.toString());
    setCurrentHouseId(targetTier.id);
    localStorage.setItem('crypto_miners_house', targetTier.id);
    return true;
  };

  // Evolução de heróis com 80 dias de serviço ativo: Baús + Poções por raridade.
  const handleEvolveHero = (heroId, recipe) => {
    if (!heroId || !recipe) return false;
    if (
      purchasedChests.length < recipe.chests ||
      rejuvenationPotions < recipe.potions
    ) {
      return false;
    }

    let evolved = false;
    setMiners((prev) =>
      prev.map((m) => {
        if (m.id !== heroId) return m;
        const currentStars = m.stars ?? 0;
        if (currentStars >= 3) return m;
        evolved = true;
        const bonusFactor = 1 + (recipe.powerBonusPct || 5) / 100;
        const basePower = Number(m.power || m.basePower || 1);
        return {
          ...m,
          stars: recipe.nextStars || currentStars + 1,
          power: parseFloat((basePower * bonusFactor).toFixed(2)),
          activeDays: 0,
          createdAt: Date.now(),
          energy: m.maxEnergy || 100,
          weaponDurability: 100,
        };
      })
    );

    if (!evolved) return false;

    setPurchasedChests((prev) => {
      const next = prev.slice(recipe.chests);
      localStorage.setItem('crypto_miners_purchased_chests', JSON.stringify(next));
      return next;
    });
    setRejuvenationPotions((prev) => Math.max(0, prev - recipe.potions));
    try { sfx.levelUp(); } catch (e) {}
    return true;
  };

  // Baús de Heróis adquiridos em USDT guardados no Inventário
  const [purchasedChests, setPurchasedChests] = useState(() => {
    const saved = localStorage.getItem('crypto_miners_purchased_chests');
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    // Baú Miner inicial de demonstração no inventário caso novo usuário
    return [
      {
        instanceId: 'purchased-welcome-miner',
        id: 'miner',
        name: 'Baú Miner',
        icon: '📦',
        heroesCount: 1,
        purchasedAt: 'Início da Jornada'
      }
    ];
  });

  // Modais de Anúncios Recompensados: Abertura de Baús com Bônus & Recuperação 100% de Energia
  const [isChestOpeningOpen, setIsChestOpeningOpen] = useState(false);
  const [activeChestToOpen, setActiveChestToOpen] = useState(null);

  // Painel de Inteligência & Estatísticas da Mineração (Dashboard & Previsão de Tempo)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isTowerModalOpen, setIsTowerModalOpen] = useState(false);
  const [isBillboardModalOpen, setIsBillboardModalOpen] = useState(false);
  const [isCollisionEditorOpen, setIsCollisionEditorOpen] = useState(false);
  const [isFullPageMap, setIsFullPageMap] = useState(false);
  const [collisionEditorTool, setCollisionEditorTool] = useState('block'); // 'block' | 'clear'
  const [collisionBrushSize, setCollisionBrushSize] = useState(1); // 1 = 19px (Fino), 2 = 38px (Médio), 4 = 76px (Grande)
  const [showCollisionGrid, setShowCollisionGrid] = useState(true);
  const [showCollisionCoordinates, setShowCollisionCoordinates] = useState(false);
  const [collisionVersion, setCollisionVersion] = useState(0);
  const [statsData, setStatsData] = useState({
    remainingHp: 2800,
    totalHp: 3200,
    teamDps: 18.2,
    estimatedSeconds: 13320,
    minerStats: {}
  });
  const [statsResetTrigger, setStatsResetTrigger] = useState(0);

  // Formatação do tempo restante para o HUD
  const formatEstimatedTime = (secs) => {
    if (!secs || secs <= 0 || !isFinite(secs)) return 'Pausado';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  // Identifica o MVP atual da rodada
  const currentMvp = React.useMemo(() => {
    let top = null;
    let max = -1;
    miners.forEach(m => {
      const ms = statsData.minerStats[m.id];
      const count = ms ? (ms.blocksBroken || 0) : 0;
      if (count > max) {
        max = count;
        top = { ...m, blocksBroken: count };
      }
    });
    return top && top.blocksBroken > 0 ? top : null;
  }, [miners, statsData.minerStats]);
  
  // Estado para Anúncios Patrocinados Gerais (Reparo de Picareta, Bênção da Sorte)
  const [adModalConfig, setAdModalConfig] = useState({
    isOpen: false,
    title: '',
    icon: '⚡',
    onGranted: null
  });

  // 🛡️ Sistema de Equipamentos e Relíquias (Artifacts & Gears)
  const [isGearModalOpen, setIsGearModalOpen] = useState(false);
  const [gearStash, setGearStash] = useState(() => {
    const saved = localStorage.getItem('crypto_miners_gear_stash');
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_GEAR_STASH;
  });

  // 🛡️ EQUIPAR ITEM NO HERÓI
  const handleEquipGear = (minerId, gearItem) => {
    setMiners(prev => {
      const updated = prev.map(m => {
        if (m.id === minerId) {
          const currentGear = m.equippedGear || { weapon: null, helmet: null, amulet: null };
          const previousItem = currentGear[gearItem.type];
          
          if (previousItem) {
            setGearStash(s => [...s, previousItem]);
          }

          return {
            ...m,
            equippedGear: {
              ...currentGear,
              [gearItem.type]: gearItem
            }
          };
        }
        return m;
      });
      localStorage.setItem('crypto_miners_team', JSON.stringify(updated));
      return updated;
    });

    setGearStash(s => {
      const nextStash = s.filter(it => it.instanceId !== gearItem.instanceId);
      localStorage.setItem('crypto_miners_gear_stash', JSON.stringify(nextStash));
      return nextStash;
    });
  };

  // 🛡️ DESEQUIPAR ITEM DO HERÓI
  const handleUnequipGear = (minerId, slotType) => {
    let unequippedItem = null;
    setMiners(prev => {
      const updated = prev.map(m => {
        if (m.id === minerId && m.equippedGear && m.equippedGear[slotType]) {
          unequippedItem = m.equippedGear[slotType];
          return {
            ...m,
            equippedGear: {
              ...m.equippedGear,
              [slotType]: null
            }
          };
        }
        return m;
      });
      localStorage.setItem('crypto_miners_team', JSON.stringify(updated));
      return updated;
    });

    if (unequippedItem) {
      setGearStash(s => {
        const nextStash = [...s, unequippedItem];
        localStorage.setItem('crypto_miners_gear_stash', JSON.stringify(nextStash));
        return nextStash;
      });
    }
  };

  // 🛡️ AUTO-EQUIPAR OS MELHORES ITENS DISPONÍVEIS NO HERÓI
  const handleAutoEquipBest = (minerId) => {
    ['weapon', 'helmet', 'amulet'].forEach(type => {
      const available = gearStash.filter(g => g.type === type);
      if (available.length > 0) {
        available.sort((a, b) => (b.powerBonus || b.doubleBcoinChance || 0) - (a.powerBonus || a.doubleBcoinChance || 0));
        handleEquipGear(minerId, available[0]);
      }
    });
  };

  // 🛡️ DROP DE EQUIPAMENTO OBTIDO NA CoinsAÇÃO
  const handleDropGear = (newGear) => {
    setGearStash(prev => {
      const next = [newGear, ...prev];
      localStorage.setItem('crypto_miners_gear_stash', JSON.stringify(next));
      return next;
    });
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#fbbf24']
    });
  };

  const [totalMinedSession, setTotalMinedSession] = useState(0);

  const currentHouse = resolveHouseTier(currentHouseId);
  const minersInHouse = miners.filter(m => m.status === 'house');

  // Heróis efetivamente minerando em combate ativo (status work, durabilidade positiva e não feridos)
  const activeWorkingMiners = miners.filter(m => 
    m.status === 'work' && 
    (m.durability === undefined || m.durability > 0) &&
    !m.injuredAwaitingRescue
  );

  const currentMncPerHour = activeWorkingMiners.reduce((acc, m) => {
    const coinsPerHour = m.coinsPerHour || ((m.power || 2) * 0.05 * (m.speed || 1.2));
    return acc + coinsPerHour;
  }, 0);

  const currentMncPerMinute = currentMncPerHour / 60;

  const currentMinerRate = cryptoZombiesConfig?.minerCoinUsdtRate || 0.01;
  const currentWithdrawalTax = calculateWithdrawalTax(totalInvested, totalWithdrawnUsdt);
  const roiPct = totalInvested > 0 ? Math.min(500, Math.round((totalWithdrawnUsdt / totalInvested) * 100)) : 0;

  // Mineração 100% ativa no navegador: quando fechado ou desligado, o jogo não minera offline

  useEffect(() => {
    localStorage.setItem('crypto_miners_bcoin', bcoin.toString());
  }, [bcoin]);

  useEffect(() => {
    localStorage.setItem('crypto_miners_team', JSON.stringify(miners));
  }, [miners]);

  useEffect(() => {
    localStorage.setItem('crypto_miners_invested', totalInvested.toString());
  }, [totalInvested]);

  useEffect(() => {
    localStorage.setItem('crypto_miners_total_withdrawn_usdt', totalWithdrawnUsdt.toString());
  }, [totalWithdrawnUsdt]);

  useEffect(() => {
    localStorage.setItem('crypto_miners_studio_rev', studioRevenue.toString());
  }, [studioRevenue]);

  useEffect(() => {
    localStorage.setItem('cryptozombies_market_v2', JSON.stringify(marketplaceListings));
  }, [marketplaceListings]);

  useEffect(() => {
    localStorage.setItem('crypto_miners_house', currentHouseId);
  }, [currentHouseId]);

  // ============================================================================
  // SINCRONIZAÇÃO E CARREGAMENTO EM NUVEM COM O SUPABASE
  // ============================================================================
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState(isSupabaseConfigured ? 'connected' : 'offline');

  // 1. Carregamento inicial do jogador no Supabase
  useEffect(() => {
    let isMounted = true;
    async function initCloudSync() {
      if (!isSupabaseConfigured || !cloudAccountKey) return;
      try {
        setIsCloudSyncing(true);
        const cloudData = await loadPlayerDataFromSupabase(cloudAccountKey);
        if (cloudData && isMounted) {
          if (cloudData.profile?.mncBalance !== undefined) {
            setBcoin(cloudData.profile.mncBalance);
          }
          if (cloudData.profile?.usdtBalance !== undefined) {
            setWalletState(prev => ({ ...prev, usdtBalance: cloudData.profile.usdtBalance }));
          }
          if (cloudData.profile?.totalInvested !== undefined) {
            setTotalInvested(cloudData.profile.totalInvested);
          }
          if (cloudData.profile?.studioRevenue !== undefined) {
            setStudioRevenue(cloudData.profile.studioRevenue);
          }
          if (cloudData.profile?.currentHouseId) {
            setCurrentHouseId(resolveHouseTier(cloudData.profile.currentHouseId).id);
          }
          if (cloudData.heroes && cloudData.heroes.length > 0) {
            setMiners(cloudData.heroes);
          }
          if (cloudData.inventory?.purchasedChests) {
            setPurchasedChests(cloudData.inventory.purchasedChests);
          }
          if (cloudData.inventory?.gearStash) {
            setGearStash(cloudData.inventory.gearStash);
          }
          setCloudStatus('synced');
        } else if (isMounted) {
          // Primeira inicialização deste jogador no Supabase: migra os dados locais atuais
          await syncProfileToSupabase(cloudAccountKey, {
            mncBalance: bcoin,
            usdtBalance: walletState.usdtBalance,
            totalInvested,
            studioRevenue,
            currentHouseId
          });
          if (miners && miners.length > 0) {
            await syncHeroesToSupabase(cloudAccountKey, miners);
          }
          await syncInventoryToSupabase(cloudAccountKey, {
            purchasedChests,
            gearStash
          });
          setCloudStatus('synced');
        }
      } catch (err) {
        console.warn('[Supabase] Falha ao sincronizar estado da nuvem:', err);
      } finally {
        if (isMounted) setIsCloudSyncing(false);
      }
    }
    initCloudSync();
    return () => { isMounted = false; };
  }, [cloudAccountKey]);

  // 2. Sincronização periódica inteligente (Debounce de 4 segundos para evitar sobrecarga)
  useEffect(() => {
    if (!isSupabaseConfigured || !cloudAccountKey) return;

    const timer = setTimeout(async () => {
      try {
        await syncProfileToSupabase(cloudAccountKey, {
          mncBalance: bcoin,
          usdtBalance: walletState.usdtBalance,
          totalInvested,
          studioRevenue,
          currentHouseId
        });
        if (miners && miners.length > 0) {
          await syncHeroesToSupabase(cloudAccountKey, miners);
        }
        await syncInventoryToSupabase(cloudAccountKey, {
          purchasedChests,
          gearStash
        });
        setCloudStatus('synced');
      } catch (e) {
        console.warn('[Supabase] Erro no auto-sync:', e);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [bcoin, miners, totalInvested, studioRevenue, currentHouseId, purchasedChests, gearStash, cloudAccountKey]);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (!nextState) {
      sfx.mute();
    } else {
      sfx.unmute();
    }
  };

  const handleCollectBcoin = (amount) => {
    setBcoin(prev => parseFloat((prev + amount).toFixed(3)));
    setTotalMinedSession(prev => parseFloat((prev + amount).toFixed(3)));
  };

  // MECÂNICA DE RENOVAÇÃO DO MAPA INDIVIDUAL: AO ELIMINAR AS 20 JAZIDAS, RENOVA O CICLO!
  // Regra 7.0: A renovação do mapa visual NÃO concede bônus financeiro aleatório de Coins.
  const handleMapCleared = (newMapParam) => {
    sfx.playLevelUp();

    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#fbbf24', '#38bdf8', '#ec4899', '#22c55e']
    });

    const currentCycle = mapData?.cycleNumber || 1;
    const nextCycle = currentCycle + 1;
    setMapStage(nextCycle);
    setMapClearNotice({
      bonus: 0,
      nextStage: nextCycle
    });

    setTimeout(() => {
      const pId = walletState?.address || DEFAULT_PLAYER_ID;
      const freshMap = newMapParam || generatePlayerMap(pId, nextCycle);
      setMapData(freshMap);
      setMiners(prev => prev.map((m, i) => ({
        ...m,
        x: (i % 2 === 0) ? 1 : 13,
        y: (i < 2) ? 1 : 9
      })));
    }, 2200);

    setTimeout(() => {
      setMapClearNotice(null);
    }, 3800);
  };

  // Compra de Pacote de Entrada em Lote (1, 5 ou 15 Heróis)
  const handleBatchMintPackage = (pkg) => {
    setBcoin(prev => parseFloat((prev - pkg.costBcoin).toFixed(3)));
    setTotalInvested(prev => parseFloat((prev + pkg.costBcoin).toFixed(3)));

    const newBatch = [];
    const names = [
      'Borto', 'Kael', 'Durn', 'Gimlin', 'Vorgan', 'Zix',
      'Ignor', 'Rumble', 'Thorne', 'Barik', 'Grimlock', 'Solas', 'Magnus', 'Vesper',
      'Torin', 'Balin', 'Farin', 'Gloin', 'Nori', 'Bofur'
    ];

    for (let i = 0; i < pkg.heroesCount; i++) {
      const rand = Math.random();
      let rarity = 'common';
      if (rand < 0.60) rarity = 'common';
      else if (rand < 0.85) rarity = 'rare';
      else if (rand < 0.95) rarity = 'superRare';
      else if (rand < 0.99) rarity = 'epic';
      else rarity = 'legendary';

      let matching = MINERS_ROSTER.filter(m => m.rarity === rarity);
      if (matching.length === 0) matching = MINERS_ROSTER;
      const picked = matching[Math.floor(Math.random() * matching.length)];
      const name = names[Math.floor(Math.random() * names.length)];

      newBatch.push({
        id: 'miner-batch-' + Date.now() + '-' + i,
        name: `${picked.name} #${Math.floor(Math.random() * 900 + 100)}`,
        heroId: picked.heroId || picked.id.replace('class_', ''),
        classId: picked.classId || picked.id.replace('class_', ''),
        className: picked.title || picked.role,
        weaponId: picked.weaponId || 'assault-rifle',
        spriteIndex: picked.spriteIndex ?? 0,
        rarity: picked.rarity,
        rarityName: picked.badge,
        level: 1,
        power: picked.basePower,
        speed: picked.baseSpeed,
        durability: 100,
        status: 'work',
        x: Math.floor(Math.random() * 3 + 1),
        y: Math.floor(Math.random() * 3 + 1),
        avatar: picked.avatar,
        image: picked.image || `/assets/heroes/${picked.heroId}.png`,
        color: picked.color,
        passiveTrait: picked.passiveTrait
      });
    }

    setMiners(prev => [...prev, ...newBatch]);
  };

  // 1. COMPRA NO MARKETPLACE P2P COM TAXA DE 5%
  const handleBuyMarketplaceItem = (listing) => {
    if (bcoin < listing.priceBcoin) return;

    // Deduz BCOIN do comprador
    setBcoin(prev => parseFloat((prev - listing.priceBcoin).toFixed(3)));

    // Receita da plataforma: 5% da comissão total do marketplace
    const studioProfit = parseFloat(((listing.priceBcoin * FEE_SPLIT.platform) / 100).toFixed(3));
    setStudioRevenue(prev => parseFloat((prev + studioProfit).toFixed(3)));

    // Remove do mercado
    setMarketplaceListings(prev => prev.filter(item => item.id !== listing.id));

    // Adiciona o minerador à equipe com coordenadas seguras no mapa
    setMiners(prev => [
      ...prev, 
      { 
        ...listing.miner, 
        status: 'work', 
        durability: 100,
        x: (typeof listing.miner.x === 'number' && !isNaN(listing.miner.x)) ? listing.miner.x : Math.floor(Math.random() * 3 + 1),
        y: (typeof listing.miner.y === 'number' && !isNaN(listing.miner.y)) ? listing.miner.y : Math.floor(Math.random() * 3 + 1)
      }
    ]);
  };

  // 2. ANUNCIAR CoinsADOR NO MARKETPLACE
  const handleListMinerForSale = (miner, priceBcoin) => {
    // Remove o minerador da mina ativa
    setMiners(prev => prev.filter(m => m.id !== miner.id));

    // Cria a nova listagem
    const newListing = {
      id: 'listing-' + Date.now(),
      seller: 'Você (Minha Carteira)',
      isMyListing: true,
      miner: miner,
      priceBcoin: priceBcoin,
      listedAt: 'Agora'
    };

    setMarketplaceListings(prev => [newListing, ...prev]);
  };

  // 3. CANCELAR ANÚNCIO E DEVOLVER PARA A EQUIPE
  const handleCancelListing = (listingId) => {
    const listing = marketplaceListings.find(l => l.id === listingId);
    if (!listing) return;

    setMarketplaceListings(prev => prev.filter(l => l.id !== listingId));
    setMiners(prev => [
      ...prev, 
      { 
        ...listing.miner, 
        status: 'work',
        x: (typeof listing.miner.x === 'number' && !isNaN(listing.miner.x)) ? listing.miner.x : 1,
        y: (typeof listing.miner.y === 'number' && !isNaN(listing.miner.y)) ? listing.miner.y : 1
      }
    ]);
  };

  // 1. COMPRAR E ABRIR IMEDIATAMENTE (OPÇÃO A OU B NO MODAL)
  const handleBuyAndOpenChest = (chest) => {
    const cost = chest.costUsdt || 10;
    if (!walletState.isConnected) {
      setIsWalletModalOpen(true);
      return;
    }
    if (walletState.usdtBalance < cost) {
      alert(`Saldo insuficiente em USDT na carteira. Necessário: $${cost} USDT (atual: $${walletState.usdtBalance.toFixed(2)}).`);
      return;
    }

    // Deduz USDT da carteira
    setWalletState(prev => {
      const nextBalance = parseFloat((prev.usdtBalance - cost).toFixed(2));
      const next = { ...prev, usdtBalance: nextBalance };
      saveWalletState(next);
      return next;
    });

    setIsSummonOpen(false);
    setActiveChestToOpen(chest);
    setIsChestOpeningOpen(true);
  };

  // 2. COMPRAR E GUARDAR NO INVENTÁRIO DE BAÚS DE HERÓIS (USDT ON-CHAIN OU COINS)
  const handleBuyAndStoreChest = async (chest, currency = 'miner') => {
    const isMiner = currency.toLowerCase() === 'miner';
    const costUsdt = chest.costUsdt || chest.costBcoin || 10;
    const costMiner = currentMinerRate > 0 ? parseFloat((costUsdt / currentMinerRate).toFixed(2)) : costUsdt;
    const finalCost = isMiner ? costMiner : costUsdt;

    if (isMiner) {
      if (bcoin < costMiner) {
        alert(`Saldo insuficiente de Coins. Necessário: ${costMiner} Coins (saldo atual: ${bcoin.toFixed(2)} Coins) na cotação atual de 1 Coins = $${currentMinerRate.toFixed(2)} USDT.`);
        return false;
      }
      // Deduz Coins (saldo bcoin in-game)
      setBcoin(prev => {
        const nextBalance = parseFloat(Math.max(0, prev - costMiner).toFixed(3));
        localStorage.setItem('crypto_miners_bcoin', nextBalance.toString());
        return nextBalance;
      });
      setTotalInvested(prev => parseFloat((prev + costUsdt).toFixed(3)));
    } else {
      if (!walletState.isConnected) {
        setIsWalletModalOpen(true);
        return false;
      }
      if (walletState.usdtBalance < costUsdt) {
        alert(`Saldo insuficiente em USDT na carteira. Necessário: $${costUsdt} USDT (atual: $${walletState.usdtBalance.toFixed(2)}).`);
        return false;
      }
      try {
        const payment = await executeRealUsdtPayment({
          amountUsdt: costUsdt,
          memo: `Compra ${chest.name || chest.id}`
        });
        if (payment?.updatedState) setWalletState(payment.updatedState);
        if (isSupabaseConfigured && walletState?.address) {
          logTransactionToSupabase(walletState.address, {
            type: 'chest_purchase_usdt',
            amountUsdt: costUsdt,
            txHash: payment?.txHash,
            network: payment?.network,
            packageId: chest.id
          });
        }
      } catch (err) {
        alert(err?.message || 'Transação Web3 cancelada ou falhou.');
        return false;
      }
      setTotalInvested(prev => parseFloat((prev + costUsdt).toFixed(3)));
      recordReferralPurchaseReward({
        authUser,
        packageId: chest.name || chest.id,
        purchaseUsdt: costUsdt,
        minerRate: currentMinerRate
      });
    }

    const newPurchased = {
      instanceId: 'purchased-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      id: chest.id,
      name: chest.name,
      icon: chest.icon,
      image: chest.image || '/items/hero_chest.png',
      heroesCount: chest.heroesCount || 1,
      cost: finalCost,
      currency: isMiner ? 'Coins' : 'USDT',
      purchasedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setPurchasedChests(prev => {
      const next = [newPurchased, ...prev];
      localStorage.setItem('crypto_miners_purchased_chests', JSON.stringify(next));
      return next;
    });

    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.6 },
      colors: isMiner ? ['#f59e0b', '#38bdf8', '#ffffff'] : ['#22c55e', '#fbbf24', '#ffffff']
    });

    sfx.playLevelUp();
    return newPurchased;
  };

  // 3. ABRIR BAÚ DE HERÓIS DO INVENTÁRIO
  const handleOpenPurchasedChest = (chest) => {
    setIsInventoryOpen(false);
    setActiveChestToOpen(chest);
    setIsChestOpeningOpen(true);
  };

  // 4. CONCLUSÃO DA ABERTURA DO BAÚ (OPÇÃO A OU OPÇÃO B)
  const handleChestHeroesMinted = (mintedBatch, isBonus, chest) => {
    // Remove o baú aberto de purchasedChests (se for um baú que estava guardado)
    if (chest?.instanceId) {
      setPurchasedChests(prev => {
        const next = prev.filter(c => c.instanceId !== chest.instanceId);
        localStorage.setItem('crypto_miners_purchased_chests', JSON.stringify(next));
        return next;
      });
    }

    // Adiciona os heróis à equipe
    setMiners(prev => {
      const updated = [...prev, ...mintedBatch];
      localStorage.setItem('crypto_miners_team', JSON.stringify(updated));
      return updated;
    });
  };

  // Alocar minerador na cama da Casa para descanso acelerado
  const handleToggleHouseRest = (minerId) => {
    setMiners(prev => prev.map(m => {
      if (m.id !== minerId || m.status !== 'house') return m;
      const maxHealth = m.maxHealth || 100;
      if ((m.currentHealth || 0) < maxHealth) return m;
      return { ...m, status: 'reserve' };
    }));
  };



  // Anúncio Patrocinado: Consertar arma / Restaurar durabilidade
  const handleRepairMiner = (minerId) => {
    setAdModalConfig({
      isOpen: true,
      title: 'Consertar e Reparar Arma (100% Durabilidade)',
      icon: '🔧',
      onGranted: () => {
        setMiners(prev => prev.map(m => {
          if (m.id === minerId) {
            return { ...m, durability: 100 };
          }
          return m;
        }));
        sfx.playMineAction();
      }
    });
  };

  // Anúncio Patrocinado: Bênção da Sorte no MINT (2x chances de Lendário/Épico)
  const handleOpenLuckBoostAd = (onSuccess) => {
    setAdModalConfig({
      isOpen: true,
      title: 'Bênção da Sorte: Dobrar Chance de Heróis Lendários & Épicos!',
      icon: '🍀',
      onGranted: () => {
        if (onSuccess) onSuccess();
        sfx.playLevelUp();
      }
    });
  };

  const handleRescueMiner = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#ec4899', '#38bdf8', '#fbbf24']
    });

    const classPool = ['miner', 'brute', 'goblin', 'engineer', 'mage', 'legendary', 'pirate', 'cowboy', 'fairy', 'spiderman', 'batman'];
    const chosenClass = classPool[Math.floor(Math.random() * classPool.length)];
    const cInfo = MINER_CLASSES[chosenClass] || MINER_CLASSES.miner;

    const newMiner = {
      id: 'miner-altar-' + Date.now(),
      name: `${cInfo.name.split(' ')[0]} #${Math.floor(Math.random() * 900 + 100)}`,
      classId: chosenClass,
      level: 1,
      power: cInfo.basePower,
      speed: cInfo.baseSpeed,
      durability: 100,
      status: 'work',
      x: 7,
      y: 5,
      avatar: cInfo.avatar,
      color: cInfo.color
    };

    setMiners(prev => [...prev, newMiner]);
  };

  const handleUpgradeMiner = (minerId, cost) => {
    if (bcoin < cost) return;
    setBcoin(prev => parseFloat((prev - cost).toFixed(3)));
    sfx.playLevelUp();

    setMiners(prev => prev.map(m => {
      if (m.id === minerId) {
        return {
          ...m,
          level: m.level + 1,
          power: m.power + 2,
          speed: parseFloat((m.speed + 0.15).toFixed(2)),
          durability: 100
        };
      }
      return m;
    }));
  };

  const handleToggleStatus = (minerId) => {
    setMiners(prev => prev.map(m => {
      if (m.id !== minerId) return m;
      const maxHealth = Number(m.maxHealth) > 0 ? Number(m.maxHealth) : 100;
      const currentHealth = Number.isFinite(Number(m.currentHealth)) ? Number(m.currentHealth) : maxHealth;
      if (m.status === 'house' || m.status === 'waiting_house' || m.status === 'injured' ||
          m.injuredAwaitingRescue || (currentHealth / maxHealth) * 100 <= 5) return m;
      return { ...m, status: m.status === 'work' ? 'reserve' : 'work' };
    }));
  };

  const handleAllWork = () => {
    setMiners(prev => {
      // Regra Oficial do Usuário: Não cura automaticamente feridos por esta ação.
      // Heróis feridos são resgatados e tratados no ambulatório pela Dra. Íris.
      const eligible = prev.filter(m => {
        const maxHealth = Number(m.maxHealth) > 0 ? Number(m.maxHealth) : 100;
        const currentHealth = Number.isFinite(Number(m.currentHealth)) ? Number(m.currentHealth) : maxHealth;
        return m.status !== 'injured' && !m.injuredAwaitingRescue && (currentHealth / maxHealth) * 100 > 5 &&
               m.status !== 'house' && m.status !== 'waiting_house';
      });
      const sorted = [...eligible].sort((a, b) => calculateMinerEfficiency(b) - calculateMinerEfficiency(a));
      const top15Ids = new Set(sorted.slice(0, 15).map(m => m.id));
      const updated = prev.map(m => {
        const maxHealth = Number(m.maxHealth) > 0 ? Number(m.maxHealth) : 100;
        const currentHealth = Number.isFinite(Number(m.currentHealth)) ? Number(m.currentHealth) : maxHealth;
        if (m.status === 'injured' || m.injuredAwaitingRescue || (currentHealth / maxHealth) * 100 <= 5 ||
            m.status === 'house' || m.status === 'waiting_house') return m;
        if (top15Ids.has(m.id)) {
          return { ...m, status: 'work' };
        }
        return { ...m, status: 'reserve' };
      });
      localStorage.setItem('crypto_miners_team', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAllRest = () => {
    setMiners(prev => prev.map(m => (
      m.status === 'injured' || m.injuredAwaitingRescue
        ? m
        : { ...m, status: m.status === 'house' ? 'house' : 'sleep' }
    )));
  };

  const handleSelectMine = (newMine) => {
    setCurrentMine(newMine);
    setMapData(generateMineMap(newMine));
    setMiners(prev => prev.map((m, i) => ({
      ...m,
      x: (i % 2 === 0) ? 1 : 13,
      y: (i < 2) ? 1 : 9
    })));
  };

  // Seleção e Entrada em Fase da Trilha da Mina (Modo Campanha Saga)
  const handleSelectCampaignStage = (stg) => {
    setMapStage(stg.id);
    const targetMine = MINES.find(m => m.id === stg.mineId) || MINES[0];
    setCurrentMine(targetMine);
    setMapData(generateMineMap(targetMine));
    setMiners(prev => prev.map((m, i) => ({
      ...m,
      x: (i % 2 === 0) ? 1 : 13,
      y: (i < 2) ? 1 : 9
    })));
    sfx.playLevelUp();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleResetCurrentMine = () => {
    setMapData(generateMineMap(currentMine));
    setMiners(prev => prev.map((m, i) => ({
      ...m,
      x: (i % 2 === 0) ? 1 : 13,
      y: (i < 2) ? 1 : 9
    })));
  };

  const handleDiversifyTeam = () => {
    const classPool = ['miner', 'brute', 'goblin', 'engineer', 'mage', 'legendary', 'pirate', 'cowboy', 'fairy', 'spiderman', 'batman'];
    const updated = miners.map((m, idx) => {
      const newClassId = classPool[idx % classPool.length];
      const cInfo = MINER_CLASSES[newClassId] || MINER_CLASSES.miner;
      return {
        ...m,
        classId: newClassId,
        avatar: cInfo.avatar,
        color: cInfo.color,
        name: m.name.startsWith('Resgatado') || m.name.includes('#')
          ? `${cInfo.name.split(' ')[0]} #${m.id.split('-').pop().slice(-3) || idx + 1}`
          : m.name
      };
    });
    setMiners(updated);
    localStorage.setItem('crypto_miners_team', JSON.stringify(updated));
    sfx.playLevelUp();
    confetti({ particleCount: 80, spread: 70 });
  };

  const handleRecruitMiner = (newMiner, cost = 10, currency = 'miner') => {
    if (currency.toLowerCase() === 'usdt') {
      // Deduz USDT da Carteira Web3 Conectada (MetaMask / Trust Wallet)
      setWalletState(prev => {
        const nextBalance = Math.max(0, parseFloat((prev.usdtBalance - cost).toFixed(2)));
        const nextState = { ...prev, usdtBalance: nextBalance };
        saveWalletState(nextState);
        return nextState;
      });
    } else {
      // Deduz Coins do saldo in-game
      setBcoin(prev => {
        const nextBalance = Math.max(0, parseFloat((prev - cost).toFixed(3)));
        localStorage.setItem('crypto_miners_bcoin', nextBalance.toString());
        return nextBalance;
      });
    }
    // Registra investimento conforme a cotação oficial da Coins
    const costInUsdt = currency.toLowerCase() === 'usdt' ? cost : parseFloat((cost * currentMinerRate).toFixed(3));
    setTotalInvested(prev => parseFloat((prev + costInUsdt).toFixed(3)));

    setMiners(prev => {
      const toAdd = Array.isArray(newMiner)
        ? newMiner.map(m => ({ ...m, durability: 100 }))
        : [{ ...newMiner, durability: 100 }];
      const updated = [...prev, ...toAdd];
      localStorage.setItem('crypto_miners_team', JSON.stringify(updated));
      return updated;
    });
  };

  if (!showGameView || !authUser) {
    return (
      <>
        <LandingPage
          authUser={authUser}
          onOpenAuth={handleOpenAuth}
          onEnterGame={() => setShowGameView(true)}
          onSignOut={handleSignOut}
          config={cryptoZombiesConfig}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-tech overflow-hidden select-none">
      
      {/* ABA INDICADORA DE MENU NO TOPO (QUANDO NAVBAR ESTÁ RECOLHIDO) */}
      <div 
        onClick={() => setIsNavHovered(true)}
        onMouseEnter={() => setIsNavHovered(true)}
        className={`fixed top-0 left-1/2 -translate-x-1/2 z-40 px-4 py-0.5 rounded-b-xl bg-slate-900/90 hover:bg-slate-800/95 border-b border-x border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-2 shadow-2xl cursor-pointer backdrop-blur-md transition-all duration-300 ${
          showNavbar ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100 translate-y-0'
        }`}
        title="Passe o mouse ou clique no topo para abrir o Menu"
      >
        <span className="text-[11px] animate-pulse">🧟</span>
        <span className="font-arcade text-[9px] text-amber-400">CRYPTOZOMBIES</span>
        <span className="text-slate-600">|</span>
        <span className="font-mono text-emerald-400 text-xs font-bold">🪙 {bcoin.toFixed(2)} Coins</span>
        <span className="text-slate-600">|</span>
        <span 
          className="flex items-center gap-1 text-[10px] text-amber-300 font-mono font-bold bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 cursor-pointer"
          title={`Taxa atual de mineração: ${currentMncPerMinute.toFixed(4)} Coins/min (${currentMncPerHour.toFixed(2)} Coins/h) • ${activeWorkingMiners.length} herói(s) minerando`}
        >
          <Pickaxe size={11} className="text-amber-400" />
          <span>{currentMncPerMinute.toFixed(3)} Coins/min</span>
        </span>
        <span className="text-[10px] text-amber-400/80 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/30 flex items-center gap-0.5">
          <span>MENU</span>
          <ChevronDown size={11} />
        </span>
      </div>

      {/* BARRA SUPERIOR (HEADER) FLUTUANTE QUE DESLIZA AO MOVER O MOUSE */}
      <header 
        onMouseEnter={() => setIsNavHovered(true)}
        onMouseLeave={() => { if (!isNavPinned) setIsNavHovered(false); }}
        className={`fixed top-0 left-0 right-0 h-14 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-2 sm:px-3 flex items-center justify-between gap-1.5 z-50 shadow-2xl transition-all duration-300 ease-out transform overflow-x-auto no-scrollbar ${
          showNavbar ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        
        {/* Saldo In-Game Coins (Clique abre Perfil, Carteira & Saques) */}
        <button 
          onClick={() => handleOpenUserProfile('profile')}
          title={`Saldo: ${bcoin.toFixed(2)} Coins ≈ US$ ${(bcoin * currentMinerRate).toFixed(2)} • Clique para abrir Perfil, Carteira e Saques (Claim)`}
          className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-amber-500/40 hover:border-amber-400 transition shadow-inner cursor-pointer group active:scale-95 shrink-0"
        >
          <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-bold font-arcade text-[10px] group-hover:scale-105 transition">
            🪙
          </div>
          <div className="flex flex-col leading-none text-left">
            <span className="text-[9px] uppercase text-slate-400 font-bold flex items-center gap-1">
              <span>Coins</span>
              <span className="text-[8.5px] text-emerald-400 font-mono">
                ({currentMinerRate === 0.01 ? '0,01' : `$${currentMinerRate}`})
              </span>
            </span>
            <span className="font-arcade text-xs text-amber-300 font-bold tracking-wider">
              {bcoin.toFixed(2)}
            </span>
          </div>
        </button>

        {/* Ações da Expedição */}
        <div className="flex items-center gap-1.5 shrink-0">
          
          {/* BOTÃO DO MARKETPLACE P2P */}
          <button
            onClick={() => setIsMarketplaceOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-500/40 font-tech text-xs font-bold transition cursor-pointer shadow-sm"
          >
            <ShoppingBag size={13} className="text-emerald-400" />
            <span>MERCADO</span>
            <span className="px-1 py-0.1 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-bold font-mono">
              {marketplaceListings.length}
            </span>
          </button>

          {/* BOTÃO DO ABRIGO MÉDICO */}
          <button
            onClick={() => setIsHouseOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/70 text-blue-300 border border-blue-500/40 font-tech text-xs font-bold transition cursor-pointer shadow-sm"
          >
            <Home size={13} className="text-blue-400" />
            <span>ABRIGO</span>
            <span className="px-1 py-0.1 rounded-full bg-blue-500 text-slate-950 text-[9px] font-bold font-mono">
              {minersInHouse.length}/{currentHouse.slots}
            </span>
          </button>

          {/* BOTÃO INVENTÁRIO DE BAÚS (HERÓIS & BOSS) */}
          <button
            onClick={() => setIsInventoryOpen(true)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-tech text-xs font-bold transition cursor-pointer ${
              (purchasedChests.length + constructionChests.length) > 0
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Package size={13} className={(purchasedChests.length + constructionChests.length) > 0 ? 'text-amber-400' : 'text-slate-400'} />
            <span>INVENTÁRIO</span>
            <span className="px-1 py-0.1 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold font-mono">
              {purchasedChests.length + constructionChests.length}
            </span>
          </button>

          {/* BOTÃO CATÁLOGO DE CoinsADORES */}
          <button
            onClick={() => setIsCatalogOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-tech text-xs font-bold border border-slate-700 transition cursor-pointer"
          >
            <BookOpen size={13} />
            <span>CATÁLOGO</span>
          </button>

          {/* BOTÃO ROI EM TEMPO REAL (ESTATÍSTICAS REAIS DA CONTA) */}
          <button
            onClick={() => setIsStatisticsOpen(true)}
            title="Estatísticas e Cálculo de ROI em Tempo Real (baseado nos seus upgrades e investimentos)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900/80 text-purple-300 border border-purple-500/50 font-tech text-xs font-bold transition cursor-pointer shadow-md shadow-purple-950/40 active:scale-95"
          >
            <BarChart3 size={14} className="text-purple-400" />
            <span>ROI REAL</span>
          </button>

          {/* BOTÃO EQUIPE (JANELA FLUTUANTE) */}
          <button
            onClick={() => setIsTeamDrawerOpen(prev => !prev)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-tech text-xs font-bold border border-amber-500/40 transition cursor-pointer shadow-md shadow-amber-950/30 active:scale-95"
            title="Abrir Painel da Equipe de Heróis"
          >
            <Users size={14} className="text-amber-400" />
            <span>EQUIPE</span>
            <span className="px-1 py-0.1 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold font-mono">
              {miners.filter(m => m.status === 'work').length}/15
            </span>
          </button>

          {/* BOTÃO MINT */}
          <button
            onClick={() => setIsSummonOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-arcade text-xs font-bold transition shadow-lg shadow-amber-950/40 active:scale-95 cursor-pointer"
          >
            <Sparkles size={13} />
            <span>MINT</span>
          </button>

          {/* PAINEL ADMINISTRATIVO */}
          <button
            onClick={() => setIsAdminConfigOpen(true)}
            title="Painel Administrativo da Economia"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition border border-slate-700 cursor-pointer"
          >
            <Settings size={15} />
          </button>

          {/* Taxa de Mineração Atual da Equipe */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-[11px] font-mono shrink-0 cursor-help"
            title={`Taxa atual de mineração: ${currentMncPerMinute.toFixed(4)} Coins/min (${currentMncPerHour.toFixed(2)} Coins/h) • ${activeWorkingMiners.length} herói(s) minerando`}
          >
            <Pickaxe size={12} className="text-amber-400" />
            <span className="text-amber-300 font-bold">{currentMncPerMinute.toFixed(3)} Coins/min</span>
            <span className="text-[9px] text-slate-400 hidden xl:inline">({activeWorkingMiners.length} ativos)</span>
          </div>

          {/* Som */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? "Mutar Som" : "Ativar Som"}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 cursor-pointer"
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} className="text-rose-400" />}
          </button>

          {/* Fixar / Desafixar Menu Superior */}
          <button
            onClick={() => setIsNavPinned(prev => !prev)}
            title={isNavPinned ? "Menu fixado permanentemente. Clique para ativar auto-ocultação" : "Clique para fixar o menu no topo"}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition border cursor-pointer text-xs font-bold ${
              isNavPinned 
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-sm' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700'
            }`}
          >
            <Pin size={13} className={isNavPinned ? 'rotate-45 text-amber-400' : ''} />
            <span className="hidden xl:inline text-[9px]">{isNavPinned ? 'FIXO' : 'AUTO'}</span>
          </button>

          {/* Voltar ao Portal / Site */}
          <button
            onClick={() => setShowGameView(false)}
            title="Voltar para a página inicial do site"
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 cursor-pointer text-xs font-bold"
          >
            <Globe size={13} className="text-sky-400" />
            <span className="hidden xl:inline text-[9px]">SITE</span>
          </button>

          {/* Sair da Conta */}
          <button
            onClick={handleSignOut}
            title="Sair da conta"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/70 text-slate-300 hover:text-rose-300 transition border border-slate-700 hover:border-rose-500/40 cursor-pointer"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* ÁREA DO JOGO (MAPA À ESQUERDA + EQUIPE AO LADO À DIREITA OU PÁGINA TODA) */}
      <main className={`flex-1 w-full h-screen flex flex-row items-start justify-start pt-0 ${isFullPageMap ? 'p-0 gap-0' : 'px-2 pb-1 gap-3'} overflow-hidden relative select-none`}>
        
        {/* ÁREA DO TABULEIRO: JOGADO TODO PARA A ESQUERDA OU PÁGINA TODA */}
        <div className={`${isFullPageMap ? 'w-full h-full flex-1' : 'shrink-0'} flex flex-col items-center justify-center h-full`}>
          {boardMode === 'tactical' ? (
            <div className="w-full flex flex-col items-start pt-2">
              {/* Seletor quando no modo tático */}
              <div className="flex items-center gap-2 mb-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-lg">
                <button
                  onClick={() => setBoardMode('canyon')}
                  className="px-3 py-1.5 rounded-xl font-tech text-xs text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  🎮 Voltar para Mina de Combate (Canvas HD)
                </button>
              </div>
              <ZombieSurvivalBoard
                survivors={miners}
                onSurvivorsChange={setMiners}
                house={currentHouse}
                onOpenShelter={() => setIsHouseOpen(true)}
              />
            </div>
          ) : (
            <div className="flex flex-col items-start justify-start relative h-full pt-0.5">
              {/* STATUS DO MAPA INTERMITENTE NO CANTO SUPERIOR ESQUERDO DO MAPA */}
              <div 
                title="Batalha Intermitente & Status dos Zumbis"
                className="absolute top-2.5 left-3 z-30 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/80 shadow-2xl select-none"
              >
                <span className="flex items-center gap-1 text-xs bg-lime-950/80 text-lime-300 px-2 py-0.5 rounded-md border border-lime-500/50 font-bold shadow-sm" title="Status dos Zumbis">
                  🧟 <b className="text-white">{mapData?.deposits?.filter(d => d.type === 'zombie' && !d.isCompleted).length ?? 20}</b>/30 Zumbis
                </span>

                {/* STATUS DO BOSS */}
                {bossScheduleState.isBossActiveNow && (
                  <span 
                    className="flex items-center gap-1 text-xs bg-red-950/90 text-red-200 border border-red-500/80 px-2 py-0.5 rounded-md font-bold shadow-lg animate-pulse"
                    title="Invasão do Boss ativa agora! Derrote-o com sua equipe."
                  >
                    💀 Boss: <b className="text-amber-300">ATIVO</b>
                  </span>
                )}
              </div>

              <GameBoard
                mine={currentMine}
                mapData={mapData}
                miners={miners}
                playerId={activePlayerId}
                isFullPageMap={isFullPageMap}
                onToggleFullPage={() => setIsFullPageMap(prev => !prev)}
                onDepositBroken={(res) => {
                  if (res?.currentMap) {
                    setMapData(res.currentMap);
                  } else {
                    setMapData(prev => ({
                      ...prev,
                      remainingDeposits: res?.remainingDeposits ?? prev.remainingDeposits
                    }));
                  }
                }}
                onBossDefeated={handleBossDefeated}
                onBossExpired={handleBossExpired}
                onMinersChange={setMiners}
                onCollectBcoin={handleCollectBcoin}
                onRescueMiner={handleRescueMiner}
                onMapCleared={handleMapCleared}
                onStatsUpdate={setStatsData}
                onDropGear={handleDropGear}
                statsResetTrigger={statsResetTrigger}
                houseSlots={currentHouse.slots}
                recoverySpeedPct={currentHouse.recoverySpeedPct || 100}
                houseVisualTier={currentHouse}
                isIrisActive={isIrisActive}
                isArmorerActive={isArmorerActive}
                onOpenArmorerHire={() => setIsArmorerHireOpen(true)}
                onOpenHouseModal={() => setIsHouseOpen(true)}
                gameSpeed={gameSpeed}
                isCollisionEditorOpen={isCollisionEditorOpen}
                collisionEditorTool={collisionEditorTool}
                onSelectCollisionTool={setCollisionEditorTool}
                collisionBrushSize={collisionBrushSize}
                onSelectBrushSize={setCollisionBrushSize}
                showCollisionGrid={showCollisionGrid}
                onToggleCollisionGrid={() => setShowCollisionGrid(prev => !prev)}
                showCoordinates={showCollisionCoordinates}
                onToggleCollisionCoordinates={() => setShowCollisionCoordinates(prev => !prev)}
                onCloseCollisionEditor={() => setIsCollisionEditorOpen(false)}
                onResetCollision={() => {
                  resetCustomObstacles();
                  setCollisionVersion(v => v + 1);
                }}
                onCollisionUpdated={() => setCollisionVersion(v => v + 1)}
              />

              {/* NOTIFICAÇÃO DE MAPA LIMPO */}
              {mapClearNotice && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center z-30 animate-scaleUp p-6 text-center border-2 border-amber-400">
                  <span className="text-6xl mb-2 animate-bounce">🏆</span>
                  <h2 className="font-arcade text-2xl text-amber-300 mb-1">
                    CICLO #{mapData?.cycleNumber || 1} CONCLUÍDO!
                  </h2>
                  <p className="text-slate-300 text-sm max-w-md mb-3">
                    Todos os Zumbis e o Boss Mutante foram eliminados! Gerando um novo mapa exclusivo com novas criaturas para o Ciclo #{((mapData?.cycleNumber || 1) + 1)}...
                  </p>
                  <div className="flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-2 rounded-xl border border-amber-500/40 text-sm font-bold">
                    <span>🪙</span>
                    <span>Bônus de Vitória: +{mapClearNotice.bonus} Coins</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PAINEL DA EQUIPE DE SOBREVIVENTES DE VOLTA AO LADO DO MAPA */}
        {!isFullPageMap && (
          <aside className="flex-1 h-[calc(100vh-16px)] flex flex-col shrink min-w-[340px] max-w-[620px] overflow-hidden pt-0.5">
            <HeroList
              miners={miners}
              gold={bcoin}
              onUpgradeMiner={handleUpgradeMiner}
              onToggleStatus={handleToggleStatus}
              onAllWork={handleAllWork}
              onRepairMiner={handleRepairMiner}
              onDiversifyTeam={handleDiversifyTeam}
              isIrisActive={isIrisActive}
              isArmorerActive={isArmorerActive}
              armorerContract={armorerContract}
              onOpenArmorerHire={() => setIsArmorerHireOpen(true)}
              onOpenHouseModal={() => setIsHouseOpen(true)}
              onOpenEvolutionModal={() => setIsEvolutionModalOpen(true)}
            />
          </aside>
        )}

      </main>

      {/* MODAL DO MARKETPLACE P2P (COMÉRCIO COM TAXA DE 5%) */}
      <MarketplaceModal
        isOpen={isMarketplaceOpen}
        onClose={() => setIsMarketplaceOpen(false)}
        listings={marketplaceListings}
        myMiners={miners}
        bcoinBalance={bcoin}
        onBuyListing={handleBuyMarketplaceItem}
        onListMiner={handleListMinerForSale}
        onCancelListing={handleCancelListing}
        studioRevenue={studioRevenue}
      />

      {/* MODAL DE INVESTIMENTO & ROI DO CRYPTOZOMBIES */}
      <InvestmentModal
        isOpen={isInvestmentOpen}
        onClose={() => setIsInvestmentOpen(false)}
        totalInvested={totalInvested}
        totalMined={totalMinedSession}
        bcoinBalance={bcoin}
        minersCount={miners.length}
        onBatchMintPackage={handleBatchMintPackage}
      />

      {/* MODAL DE ZONAS DE RESPAWN (ZUMBIS & HERÓIS) */}
      <SpawnZonesModal
        isOpen={isSpawnZonesOpen}
        onClose={() => setIsSpawnZonesOpen(false)}
        miners={miners}
        mapData={mapData}
        houseLevel={currentHouse?.slots >= 15 ? 3 : currentHouse?.slots >= 10 ? 2 : 1}
        onApplySpawns={() => {
          const updatedMap = generatePlayerMap(activePlayerId, mapData?.cycleNumber || 1);
          setMapData(updatedMap);
          setMiners((prev) => {
            const next = prev.map((m, idx) => {
              const pt = getSafeHeroSpawn(idx);
              return { ...m, x: pt.x, y: pt.y, visualX: pt.x, visualY: pt.y };
            });
            localStorage.setItem('crypto_miners_team', JSON.stringify(next));
            return next;
          });
        }}
      />

      {/* MODAL DA CASA DOS SOBREVIVENTES (HOUSE SYSTEM) */}
      <HouseModal
        isOpen={isHouseOpen}
        onClose={() => setIsHouseOpen(false)}
        currentHouseId={currentHouseId}
        miners={miners}
        onToggleHouseRest={handleToggleHouseRest}
        onUpgradeWithFragments={handleUpgradeHouseWithFragments}
        constructionFragments={constructionFragments}
        minerBalance={bcoin}
        isIrisActive={isIrisActive}
        irisContract={irisContract}
        onToggleIrisActive={handleToggleIrisActive}
        isArmorerActive={isArmorerActive}
        armorerContract={armorerContract}
        onOpenArmorerHire={() => {
          setIsHouseOpen(false);
          setIsArmorerHireOpen(true);
        }}
      />

      {/* MODAL OFICIAL DE CONTRATAÇÃO DO JOHN ARMEIRO (SALA DE ARMAS) */}
      <ArmorerHireModal
        isOpen={isArmorerHireOpen}
        onClose={() => setIsArmorerHireOpen(false)}
        coinsBalance={bcoin}
        usdtBalance={walletState?.usdtBalance || 0}
        currentContract={armorerContract}
        onHireArmorer={handleHireArmorer}
      />

      {/* MODAL MINT COM BÊNÇÃO DA SORTE PATROCINADA */}
      <SummonModal
        isOpen={isSummonOpen}
        onClose={() => setIsSummonOpen(false)}
        onRecruitMiner={handleRecruitMiner}
        minerBalance={bcoin}
        walletState={walletState}
        onOpenWalletModal={() => handleOpenUserProfile('wallet')}
        onOpenRoiSimulator={() => setIsStatisticsOpen(true)}
        onOpenLuckBoostAd={handleOpenLuckBoostAd}
        onBuyAndStoreChest={handleBuyAndStoreChest}
        onOpenInventory={() => {
          setIsSummonOpen(false);
          setIsInventoryOpen(true);
        }}
        purchasedChestsCount={purchasedChests.length}
      />

      {/* MODAL DE PERFIL DO USUÁRIO, CARTEIRA WEB3 E SAQUES (CLAIM) */}
      <UserProfileModal
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
        initialTab={userProfileTab}
        walletState={walletState}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        onAddDemoFunds={handleAddDemoFunds}
        bcoinBalance={bcoin}
        onWithdraw={handleWithdrawClaim}
        totalInvested={totalInvested}
        totalMinedSession={totalMinedSession}
        currentWithdrawalTax={currentWithdrawalTax}
        miners={miners}
        currentHouse={currentHouse}
        currentMine={currentMine}
        constructionFragments={constructionFragments}
        constructionChests={constructionChests}
        authUser={authUser}
      />

      {/* NOVO MENU: ESTATÍSTICAS & SIMULADOR DE UPGRADES — CRYPTOZOMBIES */}
      <StatisticsModal
        isOpen={isStatisticsOpen}
        onClose={() => setIsStatisticsOpen(false)}
        miners={miners}
        bcoin={bcoin}
        totalMinedSession={totalMinedSession}
        totalInvested={totalInvested}
        roiPct={roiPct}
        currentWithdrawalTax={currentWithdrawalTax}
        currentHouse={currentHouse}
        currentMine={currentMine}
        onOpenHouseModal={() => setIsHouseOpen(true)}
        onOpenSummonModal={() => setIsSummonOpen(true)}
        onUpgradeMiner={handleUpgradeMiner}
      />

      {/* PAINEL ADMINISTRATIVO — CRYPTOZOMBIES */}
      <AdminConfigModal
        isOpen={isAdminConfigOpen}
        onClose={() => {
          setIsAdminConfigOpen(false);
          setCryptoZombiesConfig(getCryptoZombiesConfig());
        }}
        onSaveConfig={(newCfg) => {
          setCryptoZombiesConfig(newCfg);
        }}
        miners={miners}
        onOpenSpawnZones={() => setIsSpawnZonesOpen(true)}
        onToggleCollisionEditor={() => setIsCollisionEditorOpen(prev => !prev)}
        isCollisionEditorOpen={isCollisionEditorOpen}
        onOpenTowerModal={() => setIsTowerModalOpen(prev => !prev)}
        onOpenBillboardModal={() => setIsBillboardModalOpen(prev => !prev)}
        isBossActiveNow={bossScheduleState.isBossActiveNow}
        onToggleBossTest={() => {
          const heroTiles = (miners || []).filter(m => m.status === 'work').map(m => ({ c: Math.round(m.x), r: Math.round(m.y) }));
          if (bossScheduleState.isBossActiveNow) {
            const updated = removeBossFromPlayerMap(activePlayerId);
            setMapData(updated);
            recordBossDefeatInSchedule();
            setBossScheduleState(evaluateBossSchedule());
          } else {
            forceBossInvasionNow(20);
            const updated = spawnBossInPlayerMap(activePlayerId, { heroTiles });
            setMapData(updated);
            setBossScheduleState(evaluateBossSchedule());
          }
        }}
      />

      {/* MODAL DO CATÁLOGO DE CoinsADORES */}
      <MinerCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onOpenMintModal={() => setIsSummonOpen(true)}
      />

      {/* MODAL DO MAPA DE FASES (TRILHA DA MINA / SAGA CRYPTOZOMBIES) */}
      <CampaignMapModal
        isOpen={isCampaignMapOpen}
        onClose={() => setIsCampaignMapOpen(false)}
        currentStage={mapStage}
        onSelectStage={handleSelectCampaignStage}
        activeHero={miners.find(m => m.status === 'work') || miners[0]}
        bcoin={bcoin}
      />

      {/* MODAL DE SELEÇÃO DE MINAS */}
      <MineSelectorModal
        isOpen={isMineSelectorOpen}
        onClose={() => setIsMineSelectorOpen(false)}
        currentMine={currentMine}
        onSelectMine={handleSelectMine}
        playerGold={bcoin}
        onOpenCampaignMap={() => {
          setIsMineSelectorOpen(false);
          setIsCampaignMapOpen(true);
        }}
      />

      {/* MODAL DE INVENTÁRIO (BAÚS DE HERÓIS E DE CONSTRUÇÃO DO BOSS) */}
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        purchasedChests={purchasedChests}
        constructionChests={constructionChests}
        constructionFragments={constructionFragments}
        rejuvenationPotions={rejuvenationPotions}
        onOpenHeroChest={handleOpenPurchasedChest}
        onOpenConstructionChest={handleOpenConstructionChest}
        onOpenMintModal={() => setIsSummonOpen(true)}
        onOpenHouseModal={() => setIsHouseOpen(true)}
      />

      {/* MODAL NOTIFICADOR DE BAÚ DE CONSTRUÇÃO ENCONTRADO */}
      <ConstructionChestFoundModal
        isOpen={!!newlyFoundConstructionChest}
        chest={newlyFoundConstructionChest}
        dailyStats={constructionDailyStats}
        onClose={() => setNewlyFoundConstructionChest(null)}
        onOpenInventory={() => {
          setNewlyFoundConstructionChest(null);
          setIsInventoryOpen(true);
        }}
      />

      {/* MODAL DE ANÚNCIO PATROCINADO (ENERGIA TURBO, REPARO & BÊNÇÃO) */}
      <RewardedAdModal
        isOpen={adModalConfig.isOpen}
        rewardTitle={adModalConfig.title}
        rewardIcon={adModalConfig.icon}
        onClose={() => setAdModalConfig(prev => ({ ...prev, isOpen: false }))}
        onRewardGranted={adModalConfig.onGranted}
      />



      {/* MODAL DE INTELIGÊNCIA & DASHBOARD DE CoinsAÇÃO */}
      <MiningStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        statsData={statsData}
        miners={miners}
        currentMine={currentMine}
        onResetStats={() => setStatsResetTrigger(prev => prev + 1)}
      />

      {/* PAINEL DE CALIBRAÇÃO MANUAL DA TORRE E DA SOMBRA */}
      <TowerCalibrationModal
        isOpen={isTowerModalOpen}
        onClose={() => setIsTowerModalOpen(false)}
      />

      {/* PAINEL DE CALIBRAÇÃO MANUAL DA SOMBRA DO OUTDOOR */}
      <BillboardCalibrationModal
        isOpen={isBillboardModalOpen}
        onClose={() => setIsBillboardModalOpen(false)}
      />

      {/* MODAL DE EQUIPAMENTOS & RELÍQUIAS MÍSTICAS */}
      <GearInventoryModal
        isOpen={isGearModalOpen}
        onClose={() => setIsGearModalOpen(false)}
        miners={miners}
        gearStash={gearStash}
        onEquipGear={handleEquipGear}
        onUnequipGear={handleUnequipGear}
        onAutoEquipBest={handleAutoEquipBest}
      />

      {/* MODAL DE ABERTURA DE BAÚS COM BÔNUS PUBLICITÁRIO (OPÇÃO A / OPÇÃO B) */}
      <ChestOpeningModal
        isOpen={isChestOpeningOpen}
        onClose={() => {
          setIsChestOpeningOpen(false);
          setActiveChestToOpen(null);
        }}
        chest={activeChestToOpen}
        onHeroesMinted={handleChestHeroesMinted}
        remainingChestsCount={purchasedChests.filter(c => c.instanceId !== activeChestToOpen?.instanceId).length}
        onOpenInventory={() => {
          setIsChestOpeningOpen(false);
          setActiveChestToOpen(null);
          setIsInventoryOpen(true);
        }}
      />

      {/* JANELA FLUTUANTE LATERAL DA EQUIPE DE HERÓIS */}
      {isTeamDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop escurecido com blur que fecha ao clicar */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity cursor-pointer"
            onClick={() => setIsTeamDrawerOpen(false)}
          />

          {/* Painel lateral flutuante */}
          <div className="relative w-full max-w-[580px] sm:max-w-[640px] md:max-w-[700px] lg:max-w-[760px] h-full bg-slate-950 border-l-2 border-amber-500/40 shadow-2xl flex flex-col z-10 animate-slide-in-right">
            {/* Header da Janela Flutuante */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800 shadow-md">
              <div className="flex items-center gap-2.5">
                <Users className="text-amber-400" size={20} />
                <h2 className="font-arcade text-amber-300 text-sm tracking-wide">
                  PAINEL DA EQUIPE DE HERÓIS
                </h2>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-mono font-bold border border-amber-500/30">
                  {miners.filter(m => m.status === 'work').length}/15 em Campo
                </span>
              </div>
              <button
                onClick={() => setIsTeamDrawerOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/50 hover:text-rose-300 text-slate-300 transition text-xs font-bold border border-slate-700 cursor-pointer"
              >
                <X size={16} />
                <span>FECHAR</span>
              </button>
            </div>

            {/* Conteúdo da Lista de Heróis */}
            <div className="flex-1 overflow-y-auto p-3">
              <HeroList
                miners={miners}
                gold={bcoin}
                onUpgradeMiner={handleUpgradeMiner}
                onToggleStatus={handleToggleStatus}
                onAllWork={handleAllWork}
                onRepairMiner={handleRepairMiner}
                onDiversifyTeam={handleDiversifyTeam}
                isIrisActive={isIrisActive}
                isArmorerActive={isArmorerActive}
                armorerContract={armorerContract}
                onOpenArmorerHire={() => setIsArmorerHireOpen(true)}
                onOpenHouseModal={() => setIsHouseOpen(true)}
                onOpenEvolutionModal={() => setIsEvolutionModalOpen(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EVOLUÇÃO DE HERÓIS (80 DIAS) */}
      <HeroEvolutionModal
        isOpen={isEvolutionModalOpen}
        onClose={() => setIsEvolutionModalOpen(false)}
        miners={miners}
        purchasedChests={purchasedChests}
        rejuvenationPotions={rejuvenationPotions}
        onEvolveHero={handleEvolveHero}
      />

    </div>
  );
}
