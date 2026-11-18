// Teste de conectividade com geometria corrigida

export function isCityObstacleFixed(c, r) {
  if (c < 0 || c >= 15 || r < 0 || r >= 11) return true;

  // 1. CARROS ABANDONADOS E AMBULÂNCIA
  // Carro no asfalto oeste: na faixa c=1, r=5 (a faixa c=2 fica livre para desvio)
  if (c === 1 && r === 5) return true;
  // Carro no asfalto leste: na faixa c=13, r=5 (a faixa c=12 fica livre para desvio)
  if (c === 13 && r === 5) return true;
  // Ambulância estacionada na doca: c=7, r=6 (a pista c=8 fica livre para passagem pelo pátio)
  if (c === 7 && r === 6) return true;

  // 2. PRÉDIOS E RUÍNAS DE CONCRETO
  // Ruína Noroeste (prédio concreto em c=2..3, r=1..2; avenida c=1 livre na lateral)
  if ((c === 2 || c === 3) && (r === 1 || r === 2)) return true;

  // Ruína Sudeste (prédio em c=10..11, r=7..8; avenida leste c=12..13 livre)
  if ((c === 10 || c === 11) && (r === 7 || r === 8)) return true;

  // Base Central (Hangar Militar & Hospital da Cruz Vermelha)
  if (c >= 5 && c <= 8 && r === 3) return true; // Hangar norte
  if (c >= 5 && c <= 9 && r === 4) return true; // Corpo central do hangar
  if (c >= 5 && c <= 9 && r === 5) return true; // Hospital e suprimentos
  if (c >= 5 && c <= 6 && r === 6) return true; // Doca de caixotes

  // Torres de Vigia e Silo
  if ((c === 10 || c === 11) && (r === 0 || r === 1)) return true; // Torre norte
  if (c === 11 && (r === 3 || r === 4)) return true; // Torre leste
  if (c === 13 && (r === 3 || r === 4)) return true; // Silo metálico

  // 3. MUROS, CERCAS E BARRICADAS
  // Muro oeste da base: c=4, r=4..6 (deixa r=7 aberto como corredor)
  if (c === 4 && (r >= 4 && r <= 6)) return true;
  // Muro sul da base: c=5, 6, 7 em r=7 (deixa c=8 e c=9 abertos como portões da base)
  if ((c === 5 || c === 6 || c === 7) && r === 7) return true;
  // Barricada norte da base: c=6..8, r=2 (deixa c=5 e c=9 abertos como acessos norte)
  if (c >= 6 && c <= 8 && r === 2) return true;

  // Cercas de arame laterais (não cortam avenidas)
  if (c === 3 && r === 3) return true; // Cerca entre rua oeste e ruína
  if (c === 3 && r === 4) return true; // Barricada
  if (c === 3 && r === 7) return true; // Cerca sul
  if (c === 3 && r === 8) return true; // Cerca baixa

  if (c === 10 && r === 6) return true; // Cerca da ruína sudeste

  return false;
}

// Flood Fill para verificar conectividade
const visited = new Set();
const components = [];

for (let r = 1; r < 10; r++) {
  for (let c = 1; c < 14; c++) {
    if (isCityObstacleFixed(c, r) || visited.has(`${c},${r}`)) continue;

    const comp = [];
    const q = [{ c, r }];
    visited.add(`${c},${r}`);

    while (q.length > 0) {
      const cur = q.shift();
      comp.push(cur);

      const nbrs = [
        { c: cur.c + 1, r: cur.r },
        { c: cur.c - 1, r: cur.r },
        { c: cur.c, r: cur.r + 1 },
        { c: cur.c, r: cur.r - 1 }
      ];

      for (const n of nbrs) {
        if (n.c <= 0 || n.c >= 14 || n.r <= 0 || n.r >= 10) continue;
        if (isCityObstacleFixed(n.c, n.r) || visited.has(`${n.c},${n.r}`)) continue;
        visited.add(`${n.c},${n.r}`);
        q.push(n);
      }
    }
    components.push(comp);
  }
}

console.log(`Número de componentes conectados: ${components.length}`);
components.forEach((comp, idx) => {
  console.log(`Componente #${idx + 1}: ${comp.length} células abertas.`);
});
