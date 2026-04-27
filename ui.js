/**
 * ui.js — Gestion de l'interface utilisateur
 * Connecte tous les composants : moteur, renderer, contrôles.
 */

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
const canvas = document.getElementById("life-canvas");

// Renderer (gère le canvas + navigation)
renderer = new Renderer(canvas, gol);
renderer.centerView();

// Callbacks renderer
renderer.onCellToggle = updateStats;
renderer.onViewChange = () => {};
renderer.onMouseMove  = (r, c) => {
  document.getElementById("stat-pos").textContent = `${c}, ${r}`;
};

/* ══════════════════════════════════════════════
   BOUCLE DE SIMULATION
══════════════════════════════════════════════ */
let isRunning   = false;
let animFrameId = null;
let lastTime    = 0;
let interval    = 1000 / 10; // ms entre générations

function simLoop(timestamp) {
  if (!isRunning) return;
  animFrameId = requestAnimationFrame(simLoop);

  if (timestamp - lastTime >= interval) {
    gol.step();
    renderer.draw();
    updateStats();
    lastTime = timestamp;
  }
}

function startSim() {
  if (isRunning) return;
  isRunning = true;
  lastTime  = 0;
  animFrameId = requestAnimationFrame(simLoop);
  updatePlayBtn();
}

function pauseSim() {
  isRunning = false;
  if (animFrameId) cancelAnimationFrame(animFrameId);
  updatePlayBtn();
}

function toggleSim() {
  isRunning ? pauseSim() : startSim();
}

function updatePlayBtn() {
  const btn = document.getElementById("btn-play");
  const icon = document.getElementById("play-icon");
  const label = document.getElementById("play-label");
  if (isRunning) {
    btn.classList.add("running");
    icon.textContent  = "⏸";
    label.textContent = "PAUSE";
  } else {
    btn.classList.remove("running");
    icon.textContent  = "▶";
    label.textContent = "PLAY";
  }
}

/* ══════════════════════════════════════════════
   STATS
══════════════════════════════════════════════ */
function updateStats() {
  document.getElementById("stat-gen").textContent   = gol.generation.toLocaleString("fr-FR");
  document.getElementById("stat-alive").textContent = gol.population.toLocaleString("fr-FR");
  document.getElementById("hud-gen").textContent    = `GÉN. ${gol.generation.toLocaleString("fr-FR")}`;
}

/* ══════════════════════════════════════════════
   CONTRÔLES PRINCIPAUX
══════════════════════════════════════════════ */
document.getElementById("btn-play").addEventListener("click", toggleSim);

document.getElementById("btn-step").addEventListener("click", () => {
  pauseSim();
  gol.step();
  renderer.draw();
  updateStats();
});

document.getElementById("btn-clear").addEventListener("click", () => {
  pauseSim();
  gol.clear();
  renderer.draw();
  updateStats();
  toast("Grille effacée");
});

document.getElementById("btn-random").addEventListener("click", () => {
  pauseSim();
  const cs = renderer.cellSize;
  const W  = canvas.width, H = canvas.height;
  const minR = Math.floor(renderer.offsetY / cs) - 2;
  const maxR = minR + renderer.rows + 4;
  const minC = Math.floor(renderer.offsetX / cs) - 2;
  const maxC = minC + renderer.cols + 4;
  gol.randomize(minR, maxR, minC, maxC, 0.3);
  renderer.draw();
  updateStats();
  toast("Remplissage aléatoire");
});

/* Vitesse */
const speedSlider = document.getElementById("speed-slider");
const speedVal    = document.getElementById("speed-val");
speedSlider.addEventListener("input", () => {
  const fps = parseInt(speedSlider.value);
  speedVal.textContent = fps;
  interval = 1000 / fps;
});

/* Zoom */
const zoomSlider = document.getElementById("zoom-slider");
const zoomVal    = document.getElementById("zoom-val");
zoomSlider.addEventListener("input", () => {
  const size = parseInt(zoomSlider.value);
  zoomVal.textContent = size;
  renderer.setCellSize(size);
});

// Sync zoom slider si zoom par molette
renderer.onViewChange = () => {
  const s = Math.round(renderer.cellSize);
  zoomSlider.value = s;
  zoomVal.textContent = s;
};

/* Thème */
document.getElementById("btn-theme").addEventListener("click", () => {
  const body = document.body;
  const isDark = body.classList.toggle("dark");
  document.getElementById("theme-icon").textContent = isDark ? "○" : "◐";
  renderer.draw();
  toast(isDark ? "Thème sombre" : "Thème clair");
});

/* ══════════════════════════════════════════════
   MOTIFS — TRANSFORMATION & PLACEMENT
══════════════════════════════════════════════ */

// État de la transformation courante
const transform = {
  rotation: 0,   // 0, 90, 180, 270
  flipH: false,
  flipV: false
};

let placingMode = false; // true = prochain clic pose le motif

/**
 * Applique rotation + miroir à un tableau de cellules [[r,c]].
 */
function applyTransform(cells) {
  let result = cells.map(([r, c]) => [r, c]);

  // Miroir horizontal (axe vertical) → inverse les colonnes
  if (transform.flipH) result = result.map(([r, c]) => [r, -c]);
  // Miroir vertical (axe horizontal) → inverse les lignes
  if (transform.flipV) result = result.map(([r, c]) => [-r, c]);

  // Rotation (multiple de 90°)
  const times = ((transform.rotation / 90) % 4 + 4) % 4;
  for (let i = 0; i < times; i++) {
    // Rotation 90° horaire : (r, c) → (c, -r)
    result = result.map(([r, c]) => [c, -r]);
  }

  return result;
}

function getTransformedCells() {
  const key = document.getElementById("pattern-select").value;
  if (!key || !PATTERNS[key]) return null;
  return applyTransform(PATTERNS[key].cells);
}

function updateRotDisplay() {
  document.getElementById("rot-display").textContent = transform.rotation + "°";
  document.getElementById("btn-flip-h").classList.toggle("active", transform.flipH);
  document.getElementById("btn-flip-v").classList.toggle("active", transform.flipV);
}

// Rotation CCW / CW
document.getElementById("btn-rot-ccw").addEventListener("click", () => {
  transform.rotation = (transform.rotation - 90 + 360) % 360;
  updateRotDisplay();
  toast("Rotation " + transform.rotation + "°");
});
document.getElementById("btn-rot-cw").addEventListener("click", () => {
  transform.rotation = (transform.rotation + 90) % 360;
  updateRotDisplay();
  toast("Rotation " + transform.rotation + "°");
});

// Miroirs
document.getElementById("btn-flip-h").addEventListener("click", () => {
  transform.flipH = !transform.flipH;
  updateRotDisplay();
  toast(transform.flipH ? "Miroir H activé" : "Miroir H désactivé");
});
document.getElementById("btn-flip-v").addEventListener("click", () => {
  transform.flipV = !transform.flipV;
  updateRotDisplay();
  toast(transform.flipV ? "Miroir V activé" : "Miroir V désactivé");
});

// Reset transformation
document.getElementById("btn-reset-transform").addEventListener("click", () => {
  transform.rotation = 0; transform.flipH = false; transform.flipV = false;
  updateRotDisplay();
  toast("Transformations réinitialisées");
});

// Placer au centre
document.getElementById("btn-place").addEventListener("click", () => {
  const cells = getTransformedCells();
  if (!cells) { toast("Sélectionnez un motif d'abord"); return; }
  const cs   = renderer.cellSize;
  const centR = Math.floor((renderer.offsetY + canvas.height / 2) / cs);
  const centC = Math.floor((renderer.offsetX + canvas.width  / 2) / cs);
  gol.placePattern(cells, centR, centC);
  renderer.draw();
  updateStats();
  const name = PATTERNS[document.getElementById("pattern-select").value].name;
  toast(`"${name}" placé au centre`);
});

// Mode placement au clic
function enterPlaceMode() {
  const cells = getTransformedCells();
  if (!cells) { toast("Sélectionnez un motif d'abord"); return; }
  placingMode = true;
  canvas.style.cursor = "crosshair";
  document.getElementById("place-hint").classList.add("visible");
  document.getElementById("btn-place-click").classList.add("active");
  document.getElementById("hud-mode").textContent = "PLACEMENT";
  document.getElementById("hud-mode").className   = "mode-badge pan";
  toast("Cliquez sur la grille pour placer le motif");
}

function exitPlaceMode() {
  placingMode = false;
  canvas.style.cursor = "";
  document.getElementById("place-hint").classList.remove("visible");
  document.getElementById("btn-place-click").classList.remove("active");
  document.getElementById("hud-mode").textContent = "DESSIN";
  document.getElementById("hud-mode").className   = "mode-badge";
}

document.getElementById("btn-place-click").addEventListener("click", () => {
  if (placingMode) { exitPlaceMode(); return; }
  enterPlaceMode();
});

// Intercepter le clic sur le canvas si on est en mode placement
canvas.addEventListener("mousedown", e => {
  if (!placingMode || e.button !== 0) return;
  e.stopImmediatePropagation();
  const cells = getTransformedCells();
  if (!cells) return;
  const [r, c] = renderer.pixelToCell(e.offsetX, e.offsetY);
  gol.placePattern(cells, r, c);
  renderer.draw();
  updateStats();
  const name = PATTERNS[document.getElementById("pattern-select").value].name;
  toast(`"${name}" placé`);
  exitPlaceMode();
}, true); // capture phase pour intercepter avant le renderer


/* ══════════════════════════════════════════════
   EXPORT
══════════════════════════════════════════════ */
document.getElementById("btn-export-json").addEventListener("click", () => {
  const data = JSON.stringify(gol.toJSON(), null, 2);
  showModal("Export JSON", data);
});

document.getElementById("btn-export-rle").addEventListener("click", () => {
  const data = gol.toRLE();
  showModal("Export RLE", data);
});

/* ══════════════════════════════════════════════
   IMPORT
══════════════════════════════════════════════ */
document.getElementById("file-import").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const text = ev.target.result;
    try {
      if (file.name.endsWith(".json")) {
        gol.fromJSON(JSON.parse(text));
        toast("JSON importé ✓");
      } else {
        gol.fromRLE(text);
        toast("RLE importé ✓");
      }
      renderer.centerView();
      renderer.draw();
      updateStats();
    } catch (err) {
      toast("Erreur d'import : " + err.message);
    }
    e.target.value = "";
  };
  reader.readAsText(file);
});

/* ══════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════ */
function showModal(title, text) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-text").value = text;
  document.getElementById("modal-overlay").hidden = false;
}

document.getElementById("modal-close").addEventListener("click", () => {
  document.getElementById("modal-overlay").hidden = true;
});

document.getElementById("modal-copy").addEventListener("click", () => {
  const t = document.getElementById("modal-text").value;
  navigator.clipboard.writeText(t).then(() => toast("Copié dans le presse-papier ✓"));
});

document.getElementById("modal-overlay").addEventListener("click", e => {
  if (e.target === document.getElementById("modal-overlay")) {
    document.getElementById("modal-overlay").hidden = true;
  }
});

/* ══════════════════════════════════════════════
   RACCOURCIS CLAVIER
══════════════════════════════════════════════ */
document.addEventListener("keydown", e => {
  // Ignorer si on tape dans un champ
  if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;

  switch (e.code) {
    case "Space":
      e.preventDefault();
      toggleSim();
      break;
    case "ArrowRight":
      e.preventDefault();
      pauseSim();
      gol.step();
      renderer.draw();
      updateStats();
      break;
    case "KeyC":
      if (e.ctrlKey || e.metaKey) break;
      document.getElementById("btn-clear").click();
      break;
    case "KeyR":
      if (e.ctrlKey || e.metaKey) break;
      document.getElementById("btn-random").click();
      break;
    case "Escape":
      document.getElementById("modal-overlay").hidden = true;
      break;
    case "Equal":
    case "NumpadAdd":
      renderer.zoom(1.2, canvas.width / 2, canvas.height / 2);
      renderer.onViewChange();
      break;
    case "Minus":
    case "NumpadSubtract":
      renderer.zoom(0.83, canvas.width / 2, canvas.height / 2);
      renderer.onViewChange();
      break;
    case "Digit0":
    case "Numpad0":
      renderer.centerView();
      break;
  }
});

/* ══════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════ */
let _toastTimer = null;
function toast(msg, duration = 2200) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove("show"), duration);
}

/* ══════════════════════════════════════════════
   INIT FINAL
══════════════════════════════════════════════ */
updateStats();

// Placer un Gosper Gun au démarrage pour impressionner
setTimeout(() => {
  gol.placePattern(PATTERNS.gosper.cells, 0, 0);
  renderer.draw();
  updateStats();
}, 100);
