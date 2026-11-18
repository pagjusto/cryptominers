const fs = require('fs');
const buf = fs.readFileSync('public/assets/weapon-roster.png');
console.log('weapon-roster.png dimensions:', buf.readUInt32BE(16), 'x', buf.readUInt32BE(20));
