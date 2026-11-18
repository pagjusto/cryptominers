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
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MINES, INITIAL_MINERS, MINER_CLASSES } from './data/minersData';
import { HERO_ROSTER, WEAPON_CATALOG, getHeroById, getWeaponById } from './data/heroRoster';
import { HOUSE_TIERS } from './data/housesData';
import { ENTRY_PACKAGES, calculateWithdrawalTax } from './data/investmentData';
import { INITIAL_MARKET_LISTINGS, MARKETPLACE_FEE_PCT, FEE_SPLIT } from './data/marketplaceData';
import { MINER_ROSTER } from './data/minersCatalog';
import { generateMineMap } from './utils/mapGenerator';
import { getPlayerMap, generatePlayerMap, DEFAULT_PLAYER_ID } from './utils/individualMapEngine';
import { sfx } from './utils/sfx';
import GameBoard from './components/GameBoard';
import ZombieSurvivalBoard from './components/ZombieSurvivalBoard';
import HeroList from './components/HeroList';
import SummonModal from './components/SummonModal';
import WalletModal from './components/WalletModal';
import UserProfileModal from './components/UserProfileModal';
import ConstructionChestFoundModal from './components/ConstructionChestFoundModal';
import RoiSimulatorModal from './components/RoiSimulatorModal';
import AdminConfigModal from './components/AdminConfigModal';
import StatisticsModal from './components/StatisticsModal';
import { getCriptoMynersConfig } from './data/criptoMynersConfig';
import { 
  DEFAULT_CONSTRUCTION_CHEST_CONFIG,
  calculateActiveMinersChance,
  getDailyConstructionStats,
  getStoredConstructionChests,
  saveStoredConstructionChests,
  getStoredConstructionFragments,
  saveStoredConstructionFragments,
  openConstructionChestById
} from './utils/constructionChestEngine';
import { calculateMinerEfficiency } from './utils/minerRotationEngine';
import { Calculator, Settings } from 'lucide-react';
import { getSavedWalletState, saveWalletState, requestWalletConnection, disconnectWalletFromStorage } from './utils/web3Wallet';
import MinerCatalogModal from './components/MinerCatalogModal';
import MineSelectorModal from './components/MineSelectorModal';
import InventoryModal from './components/InventoryModal';
import PlayableChestModal from './components/PlayableChestModal';
import RewardedAdModal from './components/RewardedAdModal';
import ChestOpeningModal from './components/ChestOpeningModal';
import HeroEnergyRecoveryModal from './components/HeroEnergyRecoveryModal';
import HouseModal from './components/HouseModal';
import InvestmentModal from './components/InvestmentModal';
import MarketplaceModal from './components/MarketplaceModal';
import MiningStatsModal from './components/MiningStatsModal';
import HeroFusionModal from './components/HeroFusionModal';
import GearInventoryModal from './components/GearInventoryModal';
import CampaignMapModal from './components/CampaignMapModal';
import { INITIAL_GEAR_STASH } from './data/gearData';

export default function App() {
  const [bcoin, setBcoin] = useState(() => {
    const saved = localStorage.getItem('crypto_miners_bcoin');
    return saved !== null ? parseFloat(saved) : 50.000;
  });

  // Total BCOIN Investido (para cálculo do ROI do Bomb Crypto)
  const [totalInvested, setTotalInvested] = useState(() => {
    const saved = localStorage.getItem('crypto_miners_invested');
    return saved !== null ? parseFloat(saved) : 30.000;
  });
  const [isInvestmentOpen, setIsInvestmentOpen] = useState(false);

  // Lucro Arrecadado pelo Estúdio com Taxas do Marketplace (3% da plataforma)
  const [studioRevenue, setStudioRevenue] = useState(() => {
    const saved = localStorage.getItem('crypto_miners_studio_rev');
    return saved !== null ? parseFloat(saved) : 18.500;
  });

  // Listagens ativas no Marketplace P2P
  const [marketplaceListings, setMarketplaceListings] = useState(() => {
    const saved = localStorage.getItem('crypto_miners_market');
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
  const [mapClearNotice, setMapClearNotice] = useState(null); // Notificação de vitória do Bomb Crypto
  const [mapData, setMapData] = useState(() => {
    const savedWallet = getSavedWalletState();
    const pId = savedWallet?.address || DEFAULT_PLAYER_ID;
    return getPlayerMap(pId);
  });

  const [miners, setMiners] = useState(() => {
    const saved = localStorage.getItem('crypto_miners_team');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migração automática de bailarina para fada com asas
          let hasBallerina = false;
          let migrated = parsed.map(m => {
            if (m.classId === 'ballerina') {
              hasBallerina = true;
              const fInfo = MINER_CLASSES.fairy;
              return {
                ...m,
                classId: 'fairy',
                avatar: fInfo.avatar,
                color: fInfo.color,
                name: m.name.includes('Bailarina') ? m.name.replace('Bailarina', 'Fadinha') : m.name
              };
            }
            return m;
          });
          if (hasBallerina) {
            localStorage.setItem('crypto_miners_team', JSON.stringify(migrated));
            return migrated;
          }

          const hasNewClasses = parsed.some(m => ['pirate', 'cowboy', 'fairy', 'spiderman', 'batman'].includes(m.classId));
          const mageCount = parsed.filter(m => m.classId === 'mage').length;
          if ((!hasNewClasses || mageCount > parsed.length * 0.25) && parsed.length >= 3) {
            const classPool = ['miner', 'brute', 'goblin', 'engineer', 'mage', 'legendary', 'pirate', 'cowboy', 'fairy', 'spiderman', 'batman'];
            const balanced = parsed.map((m, idx) => {
              const newClassId = classPool[idx % classPool.length];
              const cInfo = MINER_CLASSES[newClassId] || MINER_CLASSES.miner;
              return {
                ...m,
                classId: newClassId,
                avatar: cInfo.avatar,
                color: cInfo.color,
                name: m.name.startsWith('Resgatado') || m.name.includes('#')
                  ? `${cInfo.name.split(' ')[0]} #${m.id.split('-').pop().slice(-3) || idx}`
                  : m.name
              };
            });
            localStorage.setItem('crypto_miners_team', JSON.stringify(balanced));
            return balanced;
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

          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_MINERS;
  });

  // Casa dos mineradores (House System - Estilo Bomb Crypto)
  const [currentHouseId, setCurrentHouseId] = useState(() => {
    return localStorage.getItem('crypto_miners_house') || 'tiny';
  });
  const [isHouseOpen, setIsHouseOpen] = useState(false);

  // Inventário de Baús Místicos encontrados pelos mineradores
  const [inventoryChests, setInventoryChests] = useState(() => {
    const saved = localStorage.getItem('crypto_miners_chests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'chest-welcome',
        title: 'Super Baú de Titânio',
        foundAt: 'Início da Jornada'
      }
    ];
  });

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
  const [isNavPinned, setIsNavPinned] = useState(false);
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
  const [criptoMynersConfig, setCriptoMynersConfig] = useState(() => getCriptoMynersConfig());
  const [walletState, setWalletState] = useState(() => getSavedWalletState());
  const activePlayerId = walletState?.address || DEFAULT_PLAYER_ID;

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

  const handleWithdrawClaim = (amount, netUsdt, taxPct) => {
    setBcoin(prev => {
      const nextBalance = parseFloat(Math.max(0, prev - amount).toFixed(3));
      localStorage.setItem('crypto_miners_bcoin', nextBalance.toString());
      return nextBalance;
    });
    setWalletState(prev => {
      const nextBalance = parseFloat((prev.usdtBalance + netUsdt).toFixed(2));
      const nextState = { ...prev, usdtBalance: nextBalance };
      saveWalletState(nextState);
      return nextState;
    });
  };

  const handleConnectWallet = async (type) => {
    const newState = await requestWalletConnection(type);
    setWalletState(newState);
  };

  const handleDisconnectWallet = () => {
    const newState = disconnectWalletFromStorage();
    setWalletState(newState);
  };

  const handleAddDemoFunds = () => {
    setWalletState(prev => {
      const nextBalance = parseFloat((prev.usdtBalance + 100).toFixed(2));
      const nextState = { ...prev, usdtBalance: nextBalance };
      saveWalletState(nextState);
      return nextState;
    });
  };
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [activePlayableChest, setActivePlayableChest] = useState(null);

  // Baús de Construção e Fragmentos de Construção
  const [constructionChests, setConstructionChests] = useState(() => getStoredConstructionChests());
  const [constructionFragments, setConstructionFragments] = useState(() => getStoredConstructionFragments());
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

  // Abrir Baú de Construção do Inventário (Idempotente & +1 Fragmento)
  const handleOpenConstructionChest = (chestId) => {
    const result = openConstructionChestById(chestId);
    if (result.success) {
      setConstructionChests(result.updatedChests);
      setConstructionFragments(result.totalFragments);
    }
  };

  // Evoluir Casa usando Fragmentos de Construção
  const handleUpgradeHouseWithFragments = (targetHouseId, fragmentsCost) => {
    if (constructionFragments < fragmentsCost) return;
    const nextFragments = constructionFragments - fragmentsCost;
    saveStoredConstructionFragments(nextFragments);
    setConstructionFragments(nextFragments);
    setCurrentHouseId(targetHouseId);
    localStorage.setItem('crypto_miners_house', targetHouseId);
  };

  // Baús de Heróis adquiridos em USDT guardados no Inventário
  const [purchasedChests, setPurchasedChests] = useState(() => {
    const saved = localStorage.getItem('crypto_miners_purchased_chests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
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
  const [isEnergyRecoveryOpen, setIsEnergyRecoveryOpen] = useState(false);
  const [preselectedHeroForEnergy, setPreselectedHeroForEnergy] = useState(null);

  // Painel de Inteligência & Estatísticas da Mineração (Dashboard & Previsão de Tempo)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
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
  
  // Estado para Anúncios Patrocinados Gerais (Estamina Turbo, Reparo de Picareta, Bênção da Sorte)
  const [adModalConfig, setAdModalConfig] = useState({
    isOpen: false,
    title: '',
    icon: '⚡',
    onGranted: null
  });

  // 🧬 Sistema de Fusão de Heróis (Hero Fusion / Queima de Heróis)
  const [isFusionModalOpen, setIsFusionModalOpen] = useState(false);

  // 🛡️ Sistema de Equipamentos e Relíquias (Artifacts & Gears)
  const [isGearModalOpen, setIsGearModalOpen] = useState(false);
  const [gearStash, setGearStash] = useState(() => {
    const saved = localStorage.getItem('crypto_miners_gear_stash');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_GEAR_STASH;
  });

  // 🧬 FUSÃO DE HERÓIS: Queima 2 heróis da mesma raridade para elevar estrelas (★) e Poder
  const handleFuseHeroes = ({ targetId, sacrificeIds, newStars, newPower, newMaxStamina }) => {
    setMiners(prev => {
      // 1. Remove os 2 heróis sacrificados (queima permanente de NFTs)
      const afterBurn = prev.filter(m => !sacrificeIds.includes(m.id));
      // 2. Eleva as estrelas, poder e estamina do herói alvo
      const updated = afterBurn.map(m => {
        if (m.id === targetId) {
          return {
            ...m,
            stars: newStars,
            power: newPower,
            maxStamina: newMaxStamina,
            currentStamina: newMaxStamina
          };
        }
        return m;
      });
      localStorage.setItem('crypto_miners_team', JSON.stringify(updated));
      return updated;
    });
  };

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
        available.sort((a, b) => (b.powerBonus || b.doubleBcoinChance || b.staminaDiscount || 0) - (a.powerBonus || a.doubleBcoinChance || a.staminaDiscount || 0));
        handleEquipGear(minerId, available[0]);
      }
    });
  };

  // 🛡️ DROP DE EQUIPAMENTO OBTIDO NA MINERAÇÃO
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

  const currentHouse = HOUSE_TIERS.find(h => h.id === currentHouseId) || HOUSE_TIERS[1];
  const minersInHouse = miners.filter(m => m.status === 'house');

  const currentMinerRate = criptoMynersConfig?.minerCoinUsdtRate || 0.01;
  const currentWithdrawalTax = calculateWithdrawalTax(totalInvested, totalMinedSession, currentMinerRate);
  const roiPct = totalInvested > 0 ? Math.min(500, Math.round(((totalMinedSession * currentMinerRate) / totalInvested) * 100)) : 0;

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
    localStorage.setItem('crypto_miners_studio_rev', studioRevenue.toString());
  }, [studioRevenue]);

  useEffect(() => {
    localStorage.setItem('crypto_miners_market', JSON.stringify(marketplaceListings));
  }, [marketplaceListings]);

  useEffect(() => {
    localStorage.setItem('crypto_miners_house', currentHouseId);
  }, [currentHouseId]);

  useEffect(() => {
    localStorage.setItem('crypto_miners_chests', JSON.stringify(inventoryChests));
  }, [inventoryChests]);

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
  // Regra 7.0: A renovação do mapa visual NÃO concede bônus financeiro aleatório de MNC.
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

      let matching = MINER_ROSTER.filter(m => m.rarity === rarity);
      if (matching.length === 0) matching = MINER_ROSTER;
      const picked = matching[Math.floor(Math.random() * matching.length)];
      const name = names[Math.floor(Math.random() * names.length)];

      newBatch.push({
        id: 'miner-batch-' + Date.now() + '-' + i,
        name: `${name} #${Math.floor(Math.random() * 900 + 100)}`,
        classId: picked.id.replace('class_', ''),
        level: 1,
        power: picked.basePower,
        speed: picked.baseSpeed,
        maxStamina: picked.baseStamina,
        currentStamina: picked.baseStamina,
        durability: 100,
        status: 'work',
        x: Math.floor(Math.random() * 3 + 1),
        y: Math.floor(Math.random() * 3 + 1),
        avatar: picked.avatar,
        image: picked.image || `/miners/${picked.id.replace('class_', '')}.jpg`,
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

  // 2. ANUNCIAR MINERADOR NO MARKETPLACE
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

  // Encontrar um novo baú místico na mina
  const handleFindMysticChest = (chest) => {
    setInventoryChests(prev => [chest, ...prev]);
  };

  const handleSimulateFindChest = () => {
    const newChest = {
      id: 'chest-' + Date.now(),
      title: 'Cofre Místico de Titânio',
      foundAt: new Date().toLocaleTimeString()
    };
    handleFindMysticChest(newChest);
    sfx.playCrystalCollect();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#38bdf8', '#fbbf24']
    });
  };

  // Abrir o mini-desafio do baú no inventário
  const handleSelectChestToOpen = (chest) => {
    setIsInventoryOpen(false);
    setActivePlayableChest(chest);
  };

  // Recompensa concluída do Playable Ad
  const handleChestOpened = (chestId, rewardAmount) => {
    setInventoryChests(prev => prev.filter(c => c.id !== chestId));
    handleCollectBcoin(rewardAmount);
    setActivePlayableChest(null);
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

  // 2. COMPRAR E GUARDAR NO INVENTÁRIO DE BAÚS DE HERÓIS (USDT OU MINERCOIN CONFORME COTAÇÃO)
  const handleBuyAndStoreChest = (chest, currency = 'miner') => {
    const isMiner = currency.toLowerCase() === 'miner';
    const costUsdt = chest.costUsdt || chest.costBcoin || 10;
    const costMiner = currentMinerRate > 0 ? parseFloat((costUsdt / currentMinerRate).toFixed(2)) : costUsdt;
    const finalCost = isMiner ? costMiner : costUsdt;

    if (isMiner) {
      if (bcoin < costMiner) {
        alert(`Saldo insuficiente de Minercoins. Necessário: ${costMiner} MINER (saldo atual: ${bcoin.toFixed(2)} MINER) na cotação atual de 1 MINER = $${currentMinerRate.toFixed(2)} USDT.`);
        return false;
      }
      // Deduz Minercoin (saldo bcoin in-game)
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
      // Deduz USDT da carteira Web3
      setWalletState(prev => {
        const nextBalance = parseFloat((prev.usdtBalance - costUsdt).toFixed(2));
        const next = { ...prev, usdtBalance: nextBalance };
        saveWalletState(next);
        return next;
      });
      setTotalInvested(prev => parseFloat((prev + costUsdt).toFixed(3)));
    }

    const newPurchased = {
      instanceId: 'purchased-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      id: chest.id,
      name: chest.name,
      icon: chest.icon,
      heroesCount: chest.heroesCount || 1,
      cost: finalCost,
      currency: isMiner ? 'MINER' : 'USDT',
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

  // 5. RECUPERAÇÃO 100% DE ENERGIA DO HERÓI VIA ANÚNCIO PATROCINADO
  const handleOpenEnergyRecovery = (heroId = null) => {
    setPreselectedHeroForEnergy(heroId);
    setIsEnergyRecoveryOpen(true);
  };

  const handleHeroEnergyRestored = (heroId) => {
    setMiners(prev => {
      const updated = prev.map(m => {
        if (m.id === heroId) {
          return {
            ...m,
            currentStamina: m.maxStamina,
            status: m.status === 'house' || m.status === 'waiting_house' ? 'work' : m.status
          };
        }
        return m;
      });
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

  const handleUpgradeHouse = (newHouseId, cost) => {
    if (bcoin < cost) return;
    setBcoin(prev => parseFloat((prev - cost).toFixed(3)));
    setCurrentHouseId(newHouseId);
  };

  // Anúncio Patrocinado: Energia Turbo para toda a equipe
  const handleEnergyBoost = () => {
    setAdModalConfig({
      isOpen: true,
      title: 'Recuperar 100% da Estamina de Toda a Equipe',
      icon: '☕',
      onGranted: () => {
        setMiners(prev => prev.map(m => ({
          ...m,
          currentStamina: m.maxStamina,
          status: 'work'
        })));
        sfx.playLevelUp();
      }
    });
  };

  // Anúncio Patrocinado: Afiar picareta / Restaurar durabilidade
  const handleRepairMiner = (minerId) => {
    setAdModalConfig({
      isOpen: true,
      title: 'Afiar e Reparar Ferramenta (100% Durabilidade)',
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
      maxStamina: cInfo.baseStamina,
      currentStamina: cInfo.baseStamina,
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
          maxStamina: m.maxStamina + 25,
          currentStamina: m.maxStamina + 25,
          durability: 100
        };
      }
      return m;
    }));
  };

  const handleToggleStatus = (minerId) => {
    setMiners(prev => prev.map(m => {
      if (m.id !== minerId) return m;
      if (m.status === 'house' || m.status === 'waiting_house' || (m.currentHealth !== undefined && m.currentHealth <= 5)) return m;
      return { ...m, status: m.status === 'work' ? 'reserve' : 'work' };
    }));
  };

  const handleAllWork = () => {
    setMiners(prev => {
      const eligible = prev.filter(m => m.status !== 'house' && m.status !== 'waiting_house' && (m.currentHealth === undefined || m.currentHealth > 5));
      const sorted = [...eligible].sort((a, b) => calculateMinerEfficiency(b) - calculateMinerEfficiency(a));
      const top15Ids = new Set(sorted.slice(0, 15).map(m => m.id));
      const updated = prev.map(m => {
        if (m.status === 'house' || m.status === 'waiting_house') return m;
        if (top15Ids.has(m.id)) return { ...m, status: 'work' };
        return { ...m, status: 'reserve' };
      });
      localStorage.setItem('crypto_miners_team', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAllRest = () => {
    setMiners(prev => prev.map(m => ({ ...m, status: m.status === 'house' ? 'house' : 'sleep' })));
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
      // Deduz Minercoin do saldo in-game
      setBcoin(prev => {
        const nextBalance = Math.max(0, parseFloat((prev - cost).toFixed(3)));
        localStorage.setItem('crypto_miners_bcoin', nextBalance.toString());
        return nextBalance;
      });
    }
    // Registra investimento conforme a cotação oficial da Minercoin
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
        <span className="font-arcade text-[9px] text-amber-400">CRIPTO MYNERS</span>
        <span className="text-slate-600">|</span>
        <span className="font-mono text-emerald-400 text-xs font-bold">🪙 {bcoin.toFixed(2)} MNC</span>
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
        
        {/* Saldo In-Game MNC (Clique abre Perfil, Carteira & Saques) */}
        <button 
          onClick={() => handleOpenUserProfile('profile')}
          title={`Saldo: ${bcoin.toFixed(2)} MNC ≈ US$ ${(bcoin * currentMinerRate).toFixed(2)} • Clique para abrir Perfil, Carteira e Saques (Claim)`}
          className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-amber-500/40 hover:border-amber-400 transition shadow-inner cursor-pointer group active:scale-95 shrink-0"
        >
          <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-bold font-arcade text-[10px] group-hover:scale-105 transition">
            🪙
          </div>
          <div className="flex flex-col leading-none text-left">
            <span className="text-[9px] uppercase text-slate-400 font-bold flex items-center gap-1">
              <span>MNC</span>
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

          {/* BOTÃO INVENTÁRIO DE BAÚS (PLAYABLE ADS) */}
          <button
            onClick={() => setIsInventoryOpen(true)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-tech text-xs font-bold transition cursor-pointer ${
              inventoryChests.length > 0
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Package size={13} className={inventoryChests.length > 0 ? 'text-amber-400' : 'text-slate-400'} />
            <span>INVENTÁRIO</span>
            <span className="px-1 py-0.1 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold font-mono">
              {inventoryChests.length}
            </span>
          </button>

          {/* BOTÃO CATÁLOGO DE MINERADORES */}
          <button
            onClick={() => setIsCatalogOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-tech text-xs font-bold border border-slate-700 transition cursor-pointer"
          >
            <BookOpen size={13} />
            <span>CATÁLOGO</span>
          </button>

          {/* NOVO MENU: ESTATÍSTICAS & RETORNO DE ROI */}
          <button
            onClick={() => setIsStatisticsOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900/80 text-purple-300 border border-purple-500/50 font-tech text-xs font-bold transition cursor-pointer shadow-md shadow-purple-950/40 active:scale-95"
          >
            <BarChart3 size={14} className="text-purple-400" />
            <span>ESTATÍSTICAS</span>
            <span className="px-1 py-0.1 rounded-full bg-purple-500 text-slate-950 text-[9px] font-bold font-mono">
              ROI
            </span>
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

          {/* Reset do Mapa */}
          <button
            onClick={handleResetCurrentMine}
            title="Escanear Novo Veio da Mina"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 cursor-pointer"
          >
            <RefreshCw size={15} />
          </button>

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
        </div>
      </header>

      {/* ÁREA DO JOGO (MAPA À ESQUERDA + EQUIPE AO LADO À DIREITA) */}
      <main className="flex-1 w-full h-screen flex flex-row items-start justify-start pt-0 px-2 pb-1 gap-3 overflow-hidden relative select-none">
        
        {/* ÁREA DO TABULEIRO: JOGADO TODO PARA A ESQUERDA */}
        <div className="shrink-0 flex flex-col items-start justify-start h-full">
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
              {/* STATUS DO MAPA NO CANTO SUPERIOR ESQUERDO DO MAPA */}
              <div 
                title="Status do Ciclo Atual e Criaturas"
                className="absolute top-2.5 left-3 z-30 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/80 shadow-2xl pointer-events-none select-none"
              >
                <span className="font-mono text-amber-300 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-700/60 text-xs font-bold shadow-sm">
                  Ciclo #{mapData?.cycleNumber || 1}
                </span>

                <span className="flex items-center gap-1 text-xs bg-lime-950/80 text-lime-300 px-2 py-0.5 rounded-md border border-lime-500/50 font-bold shadow-sm" title="Zumbis restantes">
                  🧟 <b className="text-white">{mapData?.deposits?.filter(d => d.type === 'zombie' && !d.isCompleted).length ?? 19}</b>/19
                </span>

                <span className="flex items-center gap-1 text-xs bg-red-950/80 text-red-300 px-2 py-0.5 rounded-md border border-red-500/50 font-bold shadow-sm" title="Status do Boss Mutante">
                  💀 Boss: <b className={mapData?.deposits?.some(d => d.type === 'boss' && !d.isCompleted) ? 'text-amber-300' : 'text-emerald-400'}>
                    {mapData?.deposits?.some(d => d.type === 'boss' && !d.isCompleted) ? 'Ativo' : 'Morto'}
                  </b>
                </span>
              </div>

              <GameBoard
                mine={currentMine}
                mapData={mapData}
                miners={miners}
                playerId={activePlayerId}
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
                onMinersChange={setMiners}
                onCollectBcoin={handleCollectBcoin}
                onRescueMiner={handleRescueMiner}
                onFindMysticChest={handleFindMysticChest}
                onMapCleared={handleMapCleared}
                onStatsUpdate={setStatsData}
                onDropGear={handleDropGear}
                statsResetTrigger={statsResetTrigger}
                houseStaminaRate={currentHouse.staminaPerSec}
                houseSlots={currentHouse.slots}
                gameSpeed={gameSpeed}
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
                    <span>Bônus de Vitória: +{mapClearNotice.bonus} MNC</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PAINEL DA EQUIPE DE SOBREVIVENTES DE VOLTA AO LADO DO MAPA */}
        <aside className="flex-1 h-[calc(100vh-16px)] flex flex-col shrink min-w-[340px] max-w-[620px] overflow-hidden pt-0.5">
          <HeroList
            miners={miners}
            gold={bcoin}
            onUpgradeMiner={handleUpgradeMiner}
            onToggleStatus={handleToggleStatus}
            onAllWork={handleAllWork}
            onOpenEnergyBoostAd={() => handleOpenEnergyRecovery(null)}
            onOpenEnergyRecoveryModal={handleOpenEnergyRecovery}
            onRepairMiner={handleRepairMiner}
            onDiversifyTeam={handleDiversifyTeam}
          />
        </aside>

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

      {/* MODAL DE INVESTIMENTO & ROI DO BOMBCRYPTO */}
      <InvestmentModal
        isOpen={isInvestmentOpen}
        onClose={() => setIsInvestmentOpen(false)}
        totalInvested={totalInvested}
        totalMined={totalMinedSession}
        bcoinBalance={bcoin}
        minersCount={miners.length}
        onBatchMintPackage={handleBatchMintPackage}
      />

      {/* MODAL DA CASA DOS MINERADORES (HOUSE SYSTEM) */}
      <HouseModal
        isOpen={isHouseOpen}
        onClose={() => setIsHouseOpen(false)}
        currentHouseId={currentHouseId}
        miners={miners}
        onToggleHouseRest={handleToggleHouseRest}
        onUpgradeHouse={handleUpgradeHouse}
        onUpgradeWithFragments={handleUpgradeHouseWithFragments}
        constructionFragments={constructionFragments}
        minerBalance={bcoin}
        walletState={walletState}
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
      />

      {/* NOVO MENU: ESTATÍSTICAS & SIMULADOR DE UPGRADES — CRIPTO MYNERS */}
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
        miners={miners}
      />

      {/* MODAL DO CATÁLOGO DE MINERADORES */}
      <MinerCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onOpenMintModal={() => setIsSummonOpen(true)}
      />

      {/* MODAL DO MAPA DE FASES (TRILHA DA MINA / SAGA BOMBCRYPTO) */}
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

      {/* MODAL DE INVENTÁRIO (BAÚS DE HERÓIS, CONSTRUÇÃO E DA MINA) */}
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        chests={inventoryChests}
        purchasedChests={purchasedChests}
        constructionChests={constructionChests}
        constructionFragments={constructionFragments}
        onOpenHeroChest={handleOpenPurchasedChest}
        onOpenConstructionChest={handleOpenConstructionChest}
        onSelectChestToOpen={handleSelectChestToOpen}
        onSimulateFindChest={handleSimulateFindChest}
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

      {/* MODAL DE PLAYABLE AD: MINI-DESAFIO DE EXPLODIR O BAÚ */}
      <PlayableChestModal
        isOpen={!!activePlayableChest}
        chest={activePlayableChest}
        onClose={() => setActivePlayableChest(null)}
        onChestOpened={handleChestOpened}
      />

      {/* MODAL DE ANÚNCIO PATROCINADO (ENERGIA TURBO, REPARO & BÊNÇÃO) */}
      <RewardedAdModal
        isOpen={adModalConfig.isOpen}
        rewardTitle={adModalConfig.title}
        rewardIcon={adModalConfig.icon}
        onClose={() => setAdModalConfig(prev => ({ ...prev, isOpen: false }))}
        onRewardGranted={adModalConfig.onGranted}
      />



      {/* MODAL DE INTELIGÊNCIA & DASHBOARD DE MINERAÇÃO */}
      <MiningStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        statsData={statsData}
        miners={miners}
        currentMine={currentMine}
        onResetStats={() => setStatsResetTrigger(prev => prev + 1)}
      />

      {/* MODAL DE FUSÃO & QUEIMA DE HERÓIS (ESTRELAS & PODER) */}
      <HeroFusionModal
        isOpen={isFusionModalOpen}
        onClose={() => setIsFusionModalOpen(false)}
        miners={miners}
        onFuseHeroes={handleFuseHeroes}
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

      {/* MODAL DE RECUPERAÇÃO DE 100% DE ENERGIA DO HERÓI (COM LIMITE DIÁRIO AUDITADO) */}
      <HeroEnergyRecoveryModal
        isOpen={isEnergyRecoveryOpen}
        onClose={() => {
          setIsEnergyRecoveryOpen(false);
          setPreselectedHeroForEnergy(null);
        }}
        miners={miners}
        preselectedHeroId={preselectedHeroForEnergy}
        onEnergyRestored={handleHeroEnergyRestored}
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
                onOpenEnergyBoostAd={() => handleOpenEnergyRecovery(null)}
                onOpenEnergyRecoveryModal={handleOpenEnergyRecovery}
                onRepairMiner={handleRepairMiner}
                onDiversifyTeam={handleDiversifyTeam}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
