/**
 * renderer.js — Rendu canvas + navigation (pan / zoom)
 *
 * Grille infinie centrée sur l'origine.
 * La vue est définie par (originX, originY) = coin supérieur gauche
 * du canvas en coordonnées « cellule ».
 */

class Renderer {
  constructor(canvas, gol) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.gol = gol;

    /* Taille de cellule en pixels */
    this.cellSize = 16;

    /* Décalage de vue (coin haut-gauche en pixels monde) */
    this.offsetX = 0;
    this.offsetY = 0;

    /* État souris */
    this._mouse = { down: false, panning: false, startX: 0, startY: 0, startOX: 0, startOY: 0 };

    /* Mode dessin (true) ou pan (false, activé si pas de mouvement après mousedown très court) */
    this.drawMode = true;    // true = dessiner, false = pan forcé
    this._drawValue = true;  // valeur à écrire (pour dessiner/effacer cohérent)
    this._hasMoved = false;
    this._isPanning = false;

    /* Callbacks */
    this.onCellToggle = null;
    this.onViewChange = null;
    this.onMouseMove  = null;

    this._resize();
    this._bindEvents();
  }

  /* ── Dimensions ─────────────────────── */
  _resize() {
    const area = this.canvas.parentElement;
    this.canvas.width  = area.clientWidth;
    this.canvas.height = area.clientHeight;
    this.draw();
  }

  get cols() { return Math.ceil(this.canvas.width  / this.cellSize) + 2; }
  get rows() { return Math.ceil(this.canvas.height / this.cellSize) + 2; }

  /* ── Conversion coord ───────────────── */
  /** Pixels canvas → cellule */
  pixelToCell(px, py) {
    return [
      Math.floor((py + this.offsetY) / this.cellSize),
      Math.floor((px + this.offsetX) / this.cellSize)
    ];
  }

  /** Cellule → pixels canvas (coin haut-gauche) */
  cellToPixel(r, c) {
    return [
      c * this.cellSize - this.offsetX,
      r * this.cellSize - this.offsetY
    ];
  }

  /* ── Zoom ───────────────────────────── */
  zoom(factor, cx, cy) {
    // Garde le point (cx, cy) immobile à l'écran
    const worldX = cx + this.offsetX;
    const worldY = cy + this.offsetY;

    this.cellSize = Math.max(4, Math.min(64, this.cellSize * factor));

    this.offsetX = worldX - cx;
    this.offsetY = worldY - cy;

    // Clamp
    this.offsetX = Math.round(this.offsetX);
    this.offsetY = Math.round(this.offsetY);

    this.draw();
    if (this.onViewChange) this.onViewChange();
  }

  setCellSize(size) {
    const cx = this.canvas.width  / 2;
    const cy = this.canvas.height / 2;
    const factor = size / this.cellSize;
    this.zoom(factor, cx, cy);
  }

  /* ── Navigation ─────────────────────── */
  centerView() {
    this.offsetX = -Math.floor(this.canvas.width  / 2);
    this.offsetY = -Math.floor(this.canvas.height / 2);
    this.draw();
  }

  /* ── Dessin ─────────────────────────── */
  draw() {
    const { ctx, canvas, cellSize, gol } = this;
    const W = canvas.width, H = canvas.height;
    const cs = cellSize;

    // Couleurs lues directement selon la classe (évite le timing CSS/transition)
    const isDark = document.body.classList.contains("dark");
    const aliveColor = isDark ? "#f5f4f0" : "#0a0a0a";
    const deadColor  = isDark ? "#0a0a0a" : "#f5f4f0";
    const gridColor  = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)";

    // Fond
    ctx.fillStyle = deadColor;
    ctx.fillRect(0, 0, W, H);

    // Grille (seulement si cellSize >= 6)
    if (cs >= 6) {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;

      // Lignes verticales
      const startC = Math.floor(this.offsetX / cs);
      const endC   = startC + this.cols;
      for (let c = startC; c <= endC; c++) {
        const x = c * cs - this.offsetX + 0.5;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }

      // Lignes horizontales
      const startR = Math.floor(this.offsetY / cs);
      const endR   = startR + this.rows;
      for (let r = startR; r <= endR; r++) {
        const y = r * cs - this.offsetY + 0.5;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    }

    // Cellules vivantes
    ctx.fillStyle = aliveColor;
    for (const key of gol.cells) {
      const [r, c] = GameOfLife.fromKey(key);
      const px = c * cs - this.offsetX;
      const py = r * cs - this.offsetY;
      if (px > -cs && px < W && py > -cs && py < H) {
        ctx.fillRect(px + 0.5, py + 0.5, cs - 1, cs - 1);
      }
    }
  }

  /* ── Événements ─────────────────────── */
  _bindEvents() {
    const c = this.canvas;

    // Resize
    window.addEventListener("resize", () => this._resize());

    // Molette → zoom
    c.addEventListener("wheel", e => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      this.zoom(factor, e.offsetX, e.offsetY);
    }, { passive: false });

    // Mouse down
    c.addEventListener("mousedown", e => {
      if (e.button !== 0) return;
      this._mouse.down = true;
      this._mouse.startX = e.clientX;
      this._mouse.startY = e.clientY;
      this._mouse.startOX = this.offsetX;
      this._mouse.startOY = this.offsetY;
      this._hasMoved = false;
      this._isPanning = false;

      // Si Middle click ou Alt → pan forcé
      if (e.altKey || e.button === 1) {
        this._isPanning = true;
      } else {
        // Dessiner la cellule initiale
        const [r, col] = this.pixelToCell(e.offsetX, e.offsetY);
        this._drawValue = !gol.isAlive(r, col);
        gol.set(r, col, this._drawValue);
        this.draw();
        if (this.onCellToggle) this.onCellToggle();
      }
    });

    // Mouse move
    window.addEventListener("mousemove", e => {
      if (!this._mouse.down) {
        // Juste la position
        const rect = this.canvas.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        if (this.onMouseMove) {
          const [r, c] = this.pixelToCell(px, py);
          this.onMouseMove(r, c);
        }
        return;
      }

      const dx = e.clientX - this._mouse.startX;
      const dy = e.clientY - this._mouse.startY;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (!this._isPanning && dist > 6) {
        // Détermine si on pan ou on dessine
        this._isPanning = false; // on dessine en glissant
      }

      if (this._isPanning) {
        this.offsetX = this._mouse.startOX - dx;
        this.offsetY = this._mouse.startOY - dy;
        this.draw();
        this.canvas.style.cursor = "grabbing";
        document.getElementById("hud-mode").textContent = "PAN";
        document.getElementById("hud-mode").className = "mode-badge pan";
        if (this.onViewChange) this.onViewChange();
      } else {
        // Dessin en glissant
        const rect = this.canvas.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        const [r, col] = this.pixelToCell(px, py);
        if (gol.isAlive(r, col) !== this._drawValue) {
          gol.set(r, col, this._drawValue);
          this.draw();
          if (this.onCellToggle) this.onCellToggle();
        }
        if (this.onMouseMove) this.onMouseMove(r, col);
      }
    });

    // Mouse up
    window.addEventListener("mouseup", e => {
      if (!this._mouse.down) return;
      this._mouse.down = false;
      this.canvas.style.cursor = "";
      document.getElementById("hud-mode").textContent = "DESSIN";
      document.getElementById("hud-mode").className = "mode-badge";
    });

    // Middle click pan
    c.addEventListener("mousedown", e => {
      if (e.button === 1) {
        e.preventDefault();
        this._isPanning = true;
      }
    });

    // Clic droit → pan alternatif
    c.addEventListener("contextmenu", e => e.preventDefault());
    c.addEventListener("mousedown", e => {
      if (e.button === 2) {
        this._mouse.down = true;
        this._mouse.startX = e.clientX;
        this._mouse.startY = e.clientY;
        this._mouse.startOX = this.offsetX;
        this._mouse.startOY = this.offsetY;
        this._isPanning = true;
      }
    });

    // Touch support basique
    let lastTouchDist = null;
    c.addEventListener("touchstart", e => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        this._mouse.down = true;
        this._mouse.startX = t.clientX;
        this._mouse.startY = t.clientY;
        this._mouse.startOX = this.offsetX;
        this._mouse.startOY = this.offsetY;
        this._isPanning = false;
        const rect = c.getBoundingClientRect();
        const [r, col] = this.pixelToCell(t.clientX - rect.left, t.clientY - rect.top);
        this._drawValue = !gol.isAlive(r, col);
        gol.set(r, col, this._drawValue);
        this.draw();
        if (this.onCellToggle) this.onCellToggle();
      } else if (e.touches.length === 2) {
        const a = e.touches[0], b = e.touches[1];
        lastTouchDist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      }
    }, { passive: true });

    c.addEventListener("touchmove", e => {
      e.preventDefault();
      if (e.touches.length === 1 && this._mouse.down) {
        const t = e.touches[0];
        const dx = t.clientX - this._mouse.startX;
        const dy = t.clientY - this._mouse.startY;
        if (Math.abs(dx) + Math.abs(dy) > 10) {
          this._isPanning = true;
        }
        if (this._isPanning) {
          this.offsetX = this._mouse.startOX - dx;
          this.offsetY = this._mouse.startOY - dy;
          this.draw();
        } else {
          const rect = c.getBoundingClientRect();
          const [r, col] = this.pixelToCell(t.clientX - rect.left, t.clientY - rect.top);
          if (gol.isAlive(r, col) !== this._drawValue) {
            gol.set(r, col, this._drawValue);
            this.draw();
            if (this.onCellToggle) this.onCellToggle();
          }
        }
      } else if (e.touches.length === 2) {
        const a = e.touches[0], b = e.touches[1];
        const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
        if (lastTouchDist) {
          const cx = (a.clientX + b.clientX) / 2;
          const cy = (a.clientY + b.clientY) / 2;
          const rect = c.getBoundingClientRect();
          this.zoom(dist / lastTouchDist, cx - rect.left, cy - rect.top);
        }
        lastTouchDist = dist;
      }
    }, { passive: false });

    c.addEventListener("touchend", () => {
      this._mouse.down = false;
      lastTouchDist = null;
    }, { passive: true });
  }
}

// Sera instancié dans ui.js
let renderer = null;
