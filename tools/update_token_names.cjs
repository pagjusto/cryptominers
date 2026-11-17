const fs = require('fs');

// 1. Update GameBoard.jsx
const gbPath = 'C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/src/components/GameBoard.jsx';
let gbContent = fs.readFileSync(gbPath, 'utf8');
gbContent = gbContent.replace(/\+`\+\$\{bcoinAmount\} BCOIN 🪙`/g, '+`${bcoinAmount} MINER ⛏️`');
gbContent = gbContent.replace(/💍 2x BCOIN!/g, '💍 2x MINER!');
fs.writeFileSync(gbPath, gbContent, 'utf8');
console.log('GameBoard.jsx updated!');

// 2. Update App.jsx session mined text
const appPath = 'C:/Users/pagju/.gemini/antigravity/scratch/bombcrypto-game/src/App.jsx';
let appContent = fs.readFileSync(appPath, 'utf8');
appContent = appContent.replace(/\+`\+\$\{totalMinedSession\.toFixed\(3\)\} BCOIN`/g, '+`${totalMinedSession.toFixed(3)} MINER`');
appContent = appContent.replace(/Farmado na Sessão: <b className="text-amber-400">\+\{totalMinedSession\.toFixed\(3\)\} BCOIN<\/b>/g, 'Farmado na Sessão: <b className="text-amber-400">+{totalMinedSession.toFixed(3)} MINER</b>');
fs.writeFileSync(appPath, appContent, 'utf8');
console.log('App.jsx session text updated!');
