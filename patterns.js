/**
 * patterns.js — Bibliothèque de motifs du Jeu de la Vie
 * Chaque motif est un tableau de [row, col] (coordonnées relatives).
 */

const PATTERNS = {

  /* ── STILL LIFE ─────────────────────── */
  block: {
    name: "Bloc",
    cells: [[0,0],[0,1],[1,0],[1,1]]
  },
  beehive: {
    name: "Ruche",
    cells: [[0,1],[0,2],[1,0],[1,3],[2,1],[2,2]]
  },
  loaf: {
    name: "Miche",
    cells: [[0,1],[0,2],[1,0],[1,3],[2,1],[2,3],[3,2]]
  },
  boat: {
    name: "Bateau",
    cells: [[0,0],[0,1],[1,0],[1,2],[2,1]]
  },

  /* ── OSCILLATEURS ──────────────────── */
  blinker: {
    name: "Blinker (T=2)",
    cells: [[0,0],[0,1],[0,2]]
  },
  toad: {
    name: "Crapaud (T=2)",
    cells: [[0,1],[0,2],[0,3],[1,0],[1,1],[1,2]]
  },
  beacon: {
    name: "Phare (T=2)",
    cells: [[0,0],[0,1],[1,0],[1,1],[2,2],[2,3],[3,2],[3,3]]
  },
  pulsar: {
    name: "Pulsar (T=3)",
    cells: [
      [0,2],[0,3],[0,4],[0,8],[0,9],[0,10],
      [2,0],[2,5],[2,7],[2,12],
      [3,0],[3,5],[3,7],[3,12],
      [4,0],[4,5],[4,7],[4,12],
      [5,2],[5,3],[5,4],[5,8],[5,9],[5,10],
      [7,2],[7,3],[7,4],[7,8],[7,9],[7,10],
      [8,0],[8,5],[8,7],[8,12],
      [9,0],[9,5],[9,7],[9,12],
      [10,0],[10,5],[10,7],[10,12],
      [12,2],[12,3],[12,4],[12,8],[12,9],[12,10]
    ]
  },
  pentadecathlon: {
    name: "Pentadécathlon (T=15)",
    cells: [
      [0,1],[1,1],[2,0],[2,2],[3,1],[4,1],[5,1],[6,1],[7,0],[7,2],[8,1],[9,1]
    ]
  },

  /* ── VAISSEAUX ──────────────────────── */
  glider: {
    name: "Planeur (Glider)",
    cells: [[0,1],[1,2],[2,0],[2,1],[2,2]]
  },
  lwss: {
    name: "LWSS",
    cells: [[0,1],[0,4],[1,0],[2,0],[2,4],[3,0],[3,1],[3,2],[3,3]]
  },
  mwss: {
    name: "MWSS",
    cells: [
      [0,3],[1,1],[1,5],[2,0],[3,0],[3,5],[4,0],[4,1],[4,2],[4,3],[4,4]
    ]
  },
  hwss: {
    name: "HWSS",
    cells: [
      [0,3],[0,4],[1,1],[1,6],[2,0],[3,0],[3,6],[4,0],[4,1],[4,2],[4,3],[4,4],[4,5]
    ]
  },

  /* ── CANONS ────────────────────────── */
  gosper: {
    name: "Gosper Glider Gun",
    cells: [
      // Left square
      [5,1],[5,2],[6,1],[6,2],
      // Left part
      [5,11],[6,11],[7,11],
      [4,12],[8,12],
      [3,13],[9,13],
      [3,14],[9,14],
      [6,15],
      [4,16],[8,16],
      [5,17],[6,17],[7,17],
      [6,18],
      // Right part
      [3,21],[4,21],[5,21],
      [3,22],[4,22],[5,22],
      [2,23],[6,23],
      [1,25],[2,25],[6,25],[7,25],
      // Right square
      [3,35],[4,35],[3,36],[4,36]
    ]
  },
  simkin: {
    name: "Simkin Glider Gun",
    cells: [
      [0,0],[0,1],[1,0],[1,1],
      [0,4],[0,5],[1,4],[1,5],
      [4,2],[4,3],[5,2],[5,3],
      [2,8],[2,9],[3,7],[3,11],[4,7],[5,8],[5,9],[5,12],[6,11],
      [6,12],[7,10],[7,11]
    ]
  },

  /* ── SPÉCIAUX ───────────────────────── */
  rpentomino: {
    name: "R-Pentomino",
    cells: [[0,1],[0,2],[1,0],[1,1],[2,1]]
  },
  diehard: {
    name: "Die Hard",
    cells: [[0,6],[1,0],[1,1],[2,1],[2,5],[2,6],[2,7]]
  },
  acorn: {
    name: "Gland (Acorn)",
    cells: [[0,1],[1,3],[2,0],[2,1],[2,4],[2,5],[2,6]]
  },
  pi: {
    name: "Pi Heptomino",
    cells: [[0,0],[0,1],[0,2],[1,0],[1,2],[2,0],[2,2]]
  }
};

/**
 * Retourne la bounding box d'un motif : { minR, maxR, minC, maxC, h, w }
 */
function patternBounds(cells) {
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  for (const [r, c] of cells) {
    if (r < minR) minR = r; if (r > maxR) maxR = r;
    if (c < minC) minC = c; if (c > maxC) maxC = c;
  }
  return { minR, maxR, minC, maxC, h: maxR - minR + 1, w: maxC - minC + 1 };
}

/**
 * Centre un motif autour de (0, 0)
 */
function centerPattern(cells) {
  const { minR, minC, h, w } = patternBounds(cells);
  const dr = -minR - Math.floor(h / 2);
  const dc = -minC - Math.floor(w / 2);
  return cells.map(([r, c]) => [r + dr, c + dc]);
}
