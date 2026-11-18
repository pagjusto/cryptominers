const fs = require('fs');
const { PNG } = require('pngjs');

const weapons = PNG.sync.read(fs.readFileSync('public/assets/weapon-roster.png'));
console.log('weapon-roster.png size:', weapons.width, 'x', weapons.height);

const { WEAPON_CATALOG } = require('../src/data/heroRoster.js');
console.log('WEAPON_CATALOG length:', WEAPON_CATALOG.length);
console.log(WEAPON_CATALOG);
