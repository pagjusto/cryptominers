import fs from 'fs';

const files = fs.readdirSync('src/components');
console.log('Components:', files);
if (files.includes('TacticalSurvivalGrid.jsx')) {
  const content = fs.readFileSync('src/components/TacticalSurvivalGrid.jsx', 'utf-8');
  console.log('TacticalSurvivalGrid size:', content.length);
}
