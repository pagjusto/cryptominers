const fs = require('fs');
const buf = fs.readFileSync('public/city_map.webp');
console.log('File size:', buf.length);
console.log('RIFF header:', buf.toString('ascii', 0, 4));
console.log('WEBP format:', buf.toString('ascii', 8, 12));
console.log('Chunk type:', buf.toString('ascii', 12, 16));

// Check VP8, VP8L, VP8X
const chunk = buf.toString('ascii', 12, 16);
if (chunk === 'VP8X') {
  const width = 1 + buf.readUIntLE(24, 3);
  const height = 1 + buf.readUIntLE(27, 3);
  console.log(`VP8X Dimensions: ${width} x ${height}`);
} else if (chunk === 'VP8L') {
  const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24];
  const width = 1 + (((b1 & 0x3F) << 8) | b0);
  const height = 1 + (((b3 & 0xF) << 10) | (b2 << 2) | ((b1 & 0xC0) >> 6));
  console.log(`VP8L Dimensions: ${width} x ${height}`);
} else if (chunk === 'VP8 ') {
  const width = buf.readUInt16LE(26) & 0x3FFF;
  const height = buf.readUInt16LE(28) & 0x3FFF;
  console.log(`VP8 Dimensions: ${width} x ${height}`);
}
