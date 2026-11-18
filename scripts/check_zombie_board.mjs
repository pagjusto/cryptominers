import fs from 'fs';
const content = fs.readFileSync('src/components/ZombieSurvivalBoard.jsx', 'utf-8');
console.log('Includes isCityObstacle:', content.includes('isCityObstacle'));
console.log('Includes isCityBuilding:', content.includes('isCityBuilding'));
