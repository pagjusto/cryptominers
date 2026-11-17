const fs = require('fs');

const path = 'C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/src/components/SummonModal.jsx';
let content = fs.readFileSync(path, 'utf8');

const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// Import getCriptoMynersConfig
if (!content.includes('getCriptoMynersConfig')) {
  content = content.replace(
    `import { MINER_ROSTER, MINT_CHEST_TYPES } from '../data/minersCatalog';`,
    `import { MINER_ROSTER, MINT_CHEST_TYPES } from '../data/minersCatalog';
import { getCriptoMynersConfig } from '../data/criptoMynersConfig';
import { Calculator } from 'lucide-react';`
  );
}

// Update props to include onOpenRoiSimulator
content = content.replace(
  `export default function SummonModal({
  isOpen,
  onClose,
  onRecruitMiner,
  minerBalance = 0,
  walletState = { isConnected: false, usdtBalance: 0 },
  onOpenWalletModal,
  onOpenLuckBoostAd
}) {`,
  `export default function SummonModal({
  isOpen,
  onClose,
  onRecruitMiner,
  minerBalance = 0,
  walletState = { isConnected: false, usdtBalance: 0 },
  onOpenWalletModal,
  onOpenRoiSimulator,
  onOpenLuckBoostAd
}) {`
);

// Update default selected chest
content = content.replace(`const [selectedChestType, setSelectedChestType] = useState('common_box');`, `const [selectedChestType, setSelectedChestType] = useState('miner');`);

// Update handleRecruitFromChest to roll for all heroesCount with configured probabilities
const oldRecruitChestLogic = `  // 1. RECRUTAMENTO VIA CAIXA (MINT SORTEIO COM USDT)
  const handleRecruitFromChest = () => {
    if (!walletState.isConnected) {
      if (onOpenWalletModal) onOpenWalletModal();
      return;
    }

    if (!canAffordChest || isOpening) return;
    setIsOpening(true);

    const rand = Math.random();
    let selectedRarity = 'common';

    if (isLuckBoostActive) {
      // PROBABILIDADES DOBRADAS COM PATROCÍNIO (LUCK BOOST ATIVO)
      if (selectedChestType === 'common_box') {
        if (rand < 0.40) selectedRarity = 'common';
        else if (rand < 0.75) selectedRarity = 'rare';
        else if (rand < 0.90) selectedRarity = 'superRare';
        else if (rand < 0.98) selectedRarity = 'epic';
        else selectedRarity = 'legendary'; // 2%
      } else if (selectedChestType === 'rare_box') {
        if (rand < 0.30) selectedRarity = 'rare';
        else if (rand < 0.65) selectedRarity = 'superRare';
        else if (rand < 0.90) selectedRarity = 'epic'; // 25%
        else selectedRarity = 'legendary'; // 10%
      } else {
        if (rand < 0.20) selectedRarity = 'superRare';
        else if (rand < 0.65) selectedRarity = 'epic'; // 45%
        else selectedRarity = 'legendary'; // 35%
      }
    } else {
      // PROBABILIDADES PADRÃO
      if (selectedChestType === 'common_box') {
        if (rand < 0.60) selectedRarity = 'common';
        else if (rand < 0.85) selectedRarity = 'rare';
        else if (rand < 0.95) selectedRarity = 'superRare';
        else if (rand < 0.99) selectedRarity = 'epic';
        else selectedRarity = 'legendary';
      } else if (selectedChestType === 'rare_box') {
        if (rand < 0.50) selectedRarity = 'rare';
        else if (rand < 0.80) selectedRarity = 'superRare';
        else if (rand < 0.95) selectedRarity = 'epic';
        else selectedRarity = 'legendary';
      } else {
        if (rand < 0.35) selectedRarity = 'superRare';
        else if (rand < 0.80) selectedRarity = 'epic';
        else selectedRarity = 'legendary';
      }
    }

    let matchingClasses = MINER_ROSTER.filter(m => m.rarity === selectedRarity);
    if (matchingClasses.length === 0) matchingClasses = MINER_ROSTER;
    const pickedRoster = matchingClasses[Math.floor(Math.random() * matchingClasses.length)];

    setTimeout(() => {
      sfx.playLevelUp();

      confetti({
        particleCount: selectedRarity === 'legendary' ? 150 : (selectedRarity === 'epic' ? 95 : 65),
        spread: 80,
        origin: { y: 0.6 },
        colors: [pickedRoster.color, '#fbbf24', '#ffffff']
      });

      const newMiner = {
        id: 'miner-' + Date.now(),
        name: \`\${randomName()} #\${Math.floor(Math.random() * 900 + 100)}\`,
        classId: pickedRoster.id.replace('class_', ''),
        level: 1,
        power: pickedRoster.basePower,
        speed: pickedRoster.baseSpeed,
        maxStamina: pickedRoster.baseStamina,
        currentStamina: pickedRoster.baseStamina,
        status: 'work',
        x: Math.floor(Math.random() * 3 + 1),
        y: Math.floor(Math.random() * 3 + 1),
        avatar: pickedRoster.avatar,
        image: pickedRoster.image || \`/miners/\${pickedRoster.id.replace('class_', '')}.png\`,
        color: pickedRoster.color,
        passiveTrait: pickedRoster.passiveTrait
      };

      setRevealedMiner(newMiner);
      onRecruitMiner(newMiner, chestCostUsdt);
      setIsOpening(false);
      setIsLuckBoostActive(false);
    }, 1100);
  };`;

const newRecruitChestLogic = `  // 1. RECRUTAMENTO VIA CAIXA (SORTEIO INDIVIDUAL POR HERÓI COM PROBABILIDADES CONFIGURADAS)
  const handleRecruitFromChest = () => {
    if (!walletState.isConnected) {
      if (onOpenWalletModal) onOpenWalletModal();
      return;
    }

    if (!canAffordChest || isOpening) return;
    setIsOpening(true);

    const config = getCriptoMynersConfig();
    const chestConfig = config.chests[selectedChestType] || config.chests.miner;
    const probs = chestConfig.probabilities;
    const heroesToMint = chestConfig.heroesCount || 1;

    setTimeout(() => {
      sfx.playLevelUp();

      const mintedBatch = [];

      for (let i = 0; i < heroesToMint; i++) {
        const rand = Math.random() * 100;
        let selectedRarity = 'common';

        // Probabilidades oficiais aplicadas individualmente a cada herói
        const pLeg = isLuckBoostActive ? Math.min(100, probs.legendary * 2) : probs.legendary;
        const pEpic = isLuckBoostActive ? Math.min(100, probs.epic * 1.5) : probs.epic;
        const pRare = probs.rare;

        if (rand < pLeg) {
          selectedRarity = 'legendary';
        } else if (rand < (pLeg + pEpic)) {
          selectedRarity = 'epic';
        } else if (rand < (pLeg + pEpic + pRare)) {
          selectedRarity = 'rare';
        } else {
          selectedRarity = 'common';
        }

        let matchingClasses = MINER_ROSTER.filter(m => m.rarity === selectedRarity);
        if (matchingClasses.length === 0) matchingClasses = MINER_ROSTER;
        const pickedRoster = matchingClasses[Math.floor(Math.random() * matchingClasses.length)];

        // Atributos individuais balanceados pela raridade
        const attr = config.rarityAttributes[selectedRarity] || config.rarityAttributes.common;
        const rolledPower = parseFloat((attr.basePowerMin + Math.random() * (attr.basePowerMax - attr.basePowerMin)).toFixed(1));
        const rolledCoins = parseFloat((attr.coinsPerHourMin + Math.random() * (attr.coinsPerHourMax - attr.coinsPerHourMin)).toFixed(3));

        mintedBatch.push({
          id: 'miner-' + Date.now() + '-' + i,
          name: \`\${randomName()} #\${Math.floor(Math.random() * 900 + 100)}\`,
          classId: pickedRoster.id.replace('class_', ''),
          rarity: selectedRarity,
          level: 1,
          power: rolledPower,
          speed: pickedRoster.baseSpeed || 1.2,
          coinsPerHour: rolledCoins,
          maxStamina: attr.maxEnergy || 100,
          currentStamina: attr.maxEnergy || 100,
          energyDrainRate: attr.energyDrainPerMinute || 1.0,
          durability: 100,
          status: 'work',
          x: Math.floor(Math.random() * 3 + 1),
          y: Math.floor(Math.random() * 3 + 1),
          avatar: pickedRoster.avatar,
          image: pickedRoster.image || \`/miners/\${pickedRoster.id.replace('class_', '')}.png\`,
          color: pickedRoster.color,
          passiveTrait: pickedRoster.passiveTrait
        });
      }

      confetti({
        particleCount: heroesToMint >= 10 ? 180 : (heroesToMint >= 5 ? 120 : 80),
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#38bdf8', '#a855f7', '#ffffff']
      });

      // Se for 1, mostra o card de destaque; se for pacote, mostra o lote
      setRevealedMiner(mintedBatch.length === 1 ? mintedBatch[0] : mintedBatch);
      onRecruitMiner(mintedBatch.length === 1 ? mintedBatch[0] : mintedBatch, chestCostUsdt);
      setIsOpening(false);
      setIsLuckBoostActive(false);
    }, 1100);
  };`;

if (content.includes(oldRecruitChestLogic)) {
  content = content.replace(oldRecruitChestLogic, newRecruitChestLogic);
  console.log('handleRecruitFromChest updated with batch rolls!');
} else {
  console.log('oldRecruitChestLogic not found!');
}

// Add ROI simulator button in header
const oldHeaderRight = `{/* Botões de alternância de aba */}`;
const newHeaderRight = `{/* Botão do Simulador de ROI */}
              <button
                onClick={() => {
                  if (onOpenRoiSimulator) onOpenRoiSimulator();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-tech text-xs font-bold transition cursor-pointer shadow-sm"
              >
                <Calculator size={14} className="text-amber-400" />
                <span>Simulador de ROI</span>
              </button>

              {/* Botões de alternância de aba */}`;

if (content.includes(oldHeaderRight)) {
  content = content.replace(oldHeaderRight, newHeaderRight);
  console.log('ROI simulator button added to SummonModal header!');
}

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(path, content, 'utf8');
console.log('SummonModal.jsx batch upgrades finished!');
