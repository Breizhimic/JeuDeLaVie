/**
 * life.js — Moteur du Jeu de la Vie
 *
 * Grille infinie simulée avec un Set de clés "row,col".
 * Algorithme : pour chaque cellule vivante, on examine
 * ses 8 voisins et on compte les voisins vivants.
 */

class GameOfLife {
  constructor() {
    /** @type {Set<string>} */
    this.cells = new Set();
    this.generation = 0;
  }

  /* ── Accesseurs ───────────────────── */
  static key(r, c) { return `${r},${c}`; }
  static fromKey(k) { return k.split(',').map(Number); }

  isAlive(r, c) { return this.cells.has(GameOfLife.key(r, c)); }

  set(r, c, alive) {
    const k = GameOfLife.key(r, c);
    if (alive) this.cells.add(k);
    else        this.cells.delete(k);
  }

  toggle(r, c) {
    this.set(r, c, !this.isAlive(r, c));
  }

  get population() { return this.cells.size; }

  /* ── Modification ─────────────────── */
  clear() {
    this.cells.clear();
    this.generation = 0;
  }

  /**
   * Place un motif (tableau [[r,c]]) centré sur (centerR, centerC).
   */
  placePattern(cells, centerR = 0, centerC = 0) {
    const centred = centerPattern(cells);
    for (const [r, c] of centred) {
      this.set(r + centerR, c + centerC, true);
    }
  }

  /**
   * Remplit aléatoirement la zone visible.
   */
  randomize(minR, maxR, minC, maxC, density = 0.3) {
    this.clear();
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (Math.random() < density) this.set(r, c, true);
      }
    }
  }

  /* ── Simulation ───────────────────── */
  /**
   * Calcule la prochaine génération (règles B3/S23).
   */
  step() {
    /** Compte des voisins vivants pour chaque voisin */
    const neighborCount = new Map();

    for (const key of this.cells) {
      const [r, c] = GameOfLife.fromKey(key);
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nk = GameOfLife.key(r + dr, c + dc);
          neighborCount.set(nk, (neighborCount.get(nk) || 0) + 1);
        }
      }
    }

    const next = new Set();
    for (const [key, count] of neighborCount) {
      const alive = this.cells.has(key);
      // B3/S23 : nait si 3 voisins, survit si 2 ou 3
      if ((alive && (count === 2 || count === 3)) ||
          (!alive && count === 3)) {
        next.add(key);
      }
    }

    this.cells = next;
    this.generation++;
  }

  /* ── Import / Export ──────────────── */
  toJSON() {
    return {
      format: "life-json-v1",
      generation: this.generation,
      cells: [...this.cells].map(GameOfLife.fromKey)
    };
  }

  fromJSON(obj) {
    if (!obj || !Array.isArray(obj.cells)) throw new Error("JSON invalide");
    this.clear();
    this.generation = obj.generation || 0;
    for (const [r, c] of obj.cells) this.set(r, c, true);
  }

  /**
   * Export RLE (Run Length Encoded) — format standard Golly/LifeWiki.
   * On calcule la bounding box des cellules vivantes.
   */
  toRLE() {
    if (this.cells.size === 0) return "x = 0, y = 0, rule = B3/S23\n!";

    let minR = Infinity, maxR = -Infinity;
    let minC = Infinity, maxC = -Infinity;
    for (const k of this.cells) {
      const [r, c] = GameOfLife.fromKey(k);
      if (r < minR) minR = r; if (r > maxR) maxR = r;
      if (c < minC) minC = c; if (c > maxC) maxC = c;
    }

    const h = maxR - minR + 1;
    const w = maxC - minC + 1;
    let header = `x = ${w}, y = ${h}, rule = B3/S23\n`;

    let rle = "";
    for (let r = minR; r <= maxR; r++) {
      let runChar = "";
      let runLen = 0;
      let lastChar = null;

      const flush = () => {
        if (lastChar !== null) {
          rle += (runLen > 1 ? runLen : "") + lastChar;
        }
      };

      for (let c = minC; c <= maxC; c++) {
        const ch = this.isAlive(r, c) ? "o" : "b";
        if (ch === lastChar) {
          runLen++;
        } else {
          flush();
          lastChar = ch;
          runLen = 1;
        }
      }
      // Trim trailing dead cells
      if (lastChar === "b") { /* drop */ }
      else flush();

      if (r < maxR) rle += "$";
    }
    rle += "!";

    // Wrap à 70 colonnes
    const wrapped = rle.match(/.{1,70}/g).join("\n");
    return header + wrapped;
  }

  /**
   * Import RLE.
   */
  fromRLE(text) {
    this.clear();

    // Cherche la première ligne de données (ignore commentaires "#")
    const lines = text.split(/\r?\n/).filter(l => !l.startsWith("#"));
    if (!lines.length) throw new Error("RLE vide");

    // Header
    const headerLine = lines.find(l => l.match(/x\s*=/i));
    if (!headerLine) throw new Error("En-tête RLE manquant");

    const xm = headerLine.match(/x\s*=\s*(\d+)/i);
    const ym = headerLine.match(/y\s*=\s*(\d+)/i);
    if (!xm || !ym) throw new Error("Dimensions RLE invalides");

    const W = parseInt(xm[1]);
    const H = parseInt(ym[1]);

    // Data : tout après le header
    const headerIdx = lines.indexOf(headerLine);
    const data = lines.slice(headerIdx + 1).join("").replace(/\s/g, "");

    let r = 0, c = 0, numStr = "";
    for (const ch of data) {
      if (ch === "!") break;
      if (ch >= "0" && ch <= "9") { numStr += ch; continue; }
      const n = numStr ? parseInt(numStr) : 1;
      numStr = "";
      if (ch === "$") {
        r += n; c = 0;
      } else if (ch === "b") {
        c += n;
      } else if (ch === "o") {
        for (let i = 0; i < n; i++) this.set(r, c + i, true);
        c += n;
      }
    }
  }
}

// Singleton global
const gol = new GameOfLife();
