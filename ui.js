/**
 * ui.js — Interface utilisateur complète
 */

/* ══════════════════════════════════════════════
   INIT CANVAS + RENDERER
══════════════════════════════════════════════ */
const canvas = document.getElementById("life-canvas");
renderer = new Renderer(canvas, gol);
renderer.centerView();

renderer.onCellToggle = updateStats;
renderer.onViewChange = () => {
  const s = Math.round(renderer.cellSize);
  document.getElementById("zoom-slider").value = s;
  document.getElementById("zoom-val").textContent = s;
};
renderer.onMouseMove = (r, c) => {
  document.getElementById("stat-pos").textContent = `${c}, ${r}`;
};

/* ══════════════════════════════════════════════
   LOGO CANVAS (mini grille animée)
══════════════════════════════════════════════ */
function drawLogo() {
  const lc = document.getElementById("logo-canvas");
  const lx = lc.getContext("2d");
  const dark = document.body.classList.contains("dark");
  const bg = dark ? "#0a0a0a" : "#1a1a1a";
  const alive = dark ? "#f5f4f0" : "#e8ff3a";
  lx.fillStyle = bg;
  lx.fillRect(0, 0, 32, 32);
  // Glider pattern centré
  const glider = [[1,2],[2,3],[3,1],[3,2],[3,3]];
  lx.fillStyle = alive;
  for (const [r, c] of glider) lx.fillRect(c*6+2, r*6+2, 5, 5);
}
drawLogo();

/* ══════════════════════════════════════════════
   GÉNÉRATION DYNAMIQUE DU SELECT
══════════════════════════════════════════════ */
function buildPatternSelect() {
  const sel = document.getElementById("pattern-select");
  sel.innerHTML = '<option value="">— Choisir un motif —</option>';
  for (const cat of PATTERN_CATEGORIES) {
    const grp = document.createElement("optgroup");
    grp.label = cat.label;
    for (const p of cat.patterns) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      grp.appendChild(opt);
    }
    sel.appendChild(grp);
  }
}
buildPatternSelect();

/* ══════════════════════════════════════════════
   PRÉVISUALISATION DU MOTIF
══════════════════════════════════════════════ */
const previewCanvas = document.getElementById("pattern-preview");
const previewCtx    = previewCanvas.getContext("2d");
const previewName   = document.getElementById("pattern-preview-name");

function refreshPreview() {
  const key  = document.getElementById("pattern-select").value;
  const dark = document.body.classList.contains("dark");
  const W = previewCanvas.width, H = previewCanvas.height;

  if (!key || !PATTERNS[key]) {
    previewCtx.fillStyle = dark ? "#111" : "#e8e5df";
    previewCtx.fillRect(0, 0, W, H);
    previewName.textContent = "";
    return;
  }

  const p = PATTERNS[key];
  // Pour les soupes, montrer un aperçu aléatoire fixe (seed stable dans la session)
  let cells = p.cells;
  if ((!cells || cells.length === 0) && SOUP_SIZES[key]) {
    cells = generateSoup(SOUP_SIZES[key]);
  }

  // Appliquer les transformations courantes pour la preview
  const transformed = applyTransform(cells);
  drawPatternPreview(previewCtx, transformed, W, H, dark);
  previewName.textContent = p.name;
}

document.getElementById("pattern-select").addEventListener("change", refreshPreview);

/* ══════════════════════════════════════════════
   BOUCLE DE SIMULATION
══════════════════════════════════════════════ */
let isRunning   = false;
let animFrameId = null;
let lastTime    = 0;
let interval    = 1000 / 10;

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
  isRunning = true; lastTime = 0;
  animFrameId = requestAnimationFrame(simLoop);
  updatePlayBtn();
}

function pauseSim() {
  isRunning = false;
  if (animFrameId) cancelAnimationFrame(animFrameId);
  updatePlayBtn();
}

function toggleSim() { isRunning ? pauseSim() : startSim(); }

function updatePlayBtn() {
  const btn = document.getElementById("btn-play");
  document.getElementById("play-icon").textContent  = isRunning ? "⏸" : "▶";
  document.getElementById("play-label").textContent = isRunning ? "PAUSE" : "PLAY";
  isRunning ? btn.classList.add("running") : btn.classList.remove("running");
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
  pauseSim(); gol.step(); renderer.draw(); updateStats();
});

document.getElementById("btn-clear").addEventListener("click", () => {
  pauseSim(); gol.clear(); renderer.draw(); updateStats();
  toast("Grille effacée");
});

document.getElementById("btn-random").addEventListener("click", () => {
  pauseSim();
  const cs = renderer.cellSize, W = canvas.width, H = canvas.height;
  const minR = Math.floor(renderer.offsetY / cs) - 2;
  const maxR = minR + renderer.rows + 4;
  const minC = Math.floor(renderer.offsetX / cs) - 2;
  const maxC = minC + renderer.cols + 4;
  gol.randomize(minR, maxR, minC, maxC, 0.3);
  renderer.draw(); updateStats();
  toast("Remplissage aléatoire");
});

// Vitesse
document.getElementById("speed-slider").addEventListener("input", function() {
  const fps = parseInt(this.value);
  document.getElementById("speed-val").textContent = fps;
  interval = 1000 / fps;
});

// Zoom slider
document.getElementById("zoom-slider").addEventListener("input", function() {
  const size = parseInt(this.value);
  document.getElementById("zoom-val").textContent = size;
  renderer.setCellSize(size);
});

// Thème
document.getElementById("btn-theme").addEventListener("click", () => {
  const dark = document.body.classList.toggle("dark");
  document.getElementById("theme-icon").textContent = dark ? "○" : "◐";
  drawLogo();
  renderer.draw();
  refreshPreview();
  toast(dark ? "Thème sombre" : "Thème clair");
});

/* ══════════════════════════════════════════════
   MOTIFS — TRANSFORMATION & PLACEMENT
══════════════════════════════════════════════ */
const transform = { rotation: 0, flipH: false, flipV: false };
let placingMode = false;

function applyTransform(cells) {
  if (!cells || cells.length === 0) return [];
  let result = cells.map(([r, c]) => [r, c]);
  if (transform.flipH) result = result.map(([r, c]) => [r, -c]);
  if (transform.flipV) result = result.map(([r, c]) => [-r, c]);
  const times = ((transform.rotation / 90) % 4 + 4) % 4;
  for (let i = 0; i < times; i++) result = result.map(([r, c]) => [c, -r]);
  return result;
}

function getTransformedCells() {
  const key = document.getElementById("pattern-select").value;
  if (!key || !PATTERNS[key]) return null;
  let cells = PATTERNS[key].cells;
  // Soupe aléatoire
  if ((!cells || cells.length === 0) && SOUP_SIZES[key]) {
    cells = generateSoup(SOUP_SIZES[key]);
  }
  return applyTransform(cells);
}

function updateRotDisplay() {
  document.getElementById("rot-display").textContent = transform.rotation + "°";
  document.getElementById("btn-flip-h").classList.toggle("active", transform.flipH);
  document.getElementById("btn-flip-v").classList.toggle("active", transform.flipV);
  refreshPreview();
}

document.getElementById("btn-rot-ccw").addEventListener("click", () => {
  transform.rotation = (transform.rotation - 90 + 360) % 360;
  updateRotDisplay(); toast("Rotation " + transform.rotation + "°");
});
document.getElementById("btn-rot-cw").addEventListener("click", () => {
  transform.rotation = (transform.rotation + 90) % 360;
  updateRotDisplay(); toast("Rotation " + transform.rotation + "°");
});
document.getElementById("btn-flip-h").addEventListener("click", () => {
  transform.flipH = !transform.flipH;
  updateRotDisplay(); toast(transform.flipH ? "Miroir H activé" : "Miroir H désactivé");
});
document.getElementById("btn-flip-v").addEventListener("click", () => {
  transform.flipV = !transform.flipV;
  updateRotDisplay(); toast(transform.flipV ? "Miroir V activé" : "Miroir V désactivé");
});
document.getElementById("btn-reset-transform").addEventListener("click", () => {
  transform.rotation = 0; transform.flipH = false; transform.flipV = false;
  updateRotDisplay(); toast("Transformations réinitialisées");
});

// Placer au centre
document.getElementById("btn-place").addEventListener("click", () => {
  const cells = getTransformedCells();
  if (!cells || cells.length === 0) { toast("Sélectionnez un motif d'abord"); return; }
  const cs = renderer.cellSize;
  const centR = Math.floor((renderer.offsetY + canvas.height / 2) / cs);
  const centC = Math.floor((renderer.offsetX + canvas.width  / 2) / cs);
  gol.placePattern(cells, centR, centC);
  renderer.draw(); updateStats();
  const name = PATTERNS[document.getElementById("pattern-select").value]?.name || "Motif";
  toast(`"${name}" placé au centre`);
});

// Mode placement au clic
function enterPlaceMode() {
  const cells = getTransformedCells();
  if (!cells || cells.length === 0) { toast("Sélectionnez un motif d'abord"); return; }
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
  placingMode ? exitPlaceMode() : enterPlaceMode();
});

canvas.addEventListener("mousedown", e => {
  if (!placingMode || e.button !== 0) return;
  e.stopImmediatePropagation();
  const cells = getTransformedCells();
  if (!cells || cells.length === 0) return;
  const [r, c] = renderer.pixelToCell(e.offsetX, e.offsetY);
  gol.placePattern(cells, r, c);
  renderer.draw(); updateStats();
  const name = PATTERNS[document.getElementById("pattern-select").value]?.name || "Motif";
  toast(`"${name}" placé`);
  exitPlaceMode();
}, true);

/* ══════════════════════════════════════════════
   EXPORT
══════════════════════════════════════════════ */
document.getElementById("btn-export-json").addEventListener("click", () => {
  showModal("Export JSON", JSON.stringify(gol.toJSON(), null, 2));
});
document.getElementById("btn-export-rle").addEventListener("click", () => {
  showModal("Export RLE", gol.toRLE());
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
      if (file.name.endsWith(".json")) { gol.fromJSON(JSON.parse(text)); toast("JSON importé ✓"); }
      else { gol.fromRLE(text); toast("RLE importé ✓"); }
      renderer.centerView(); renderer.draw(); updateStats();
    } catch (err) { toast("Erreur d'import : " + err.message); }
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
  navigator.clipboard.writeText(document.getElementById("modal-text").value)
    .then(() => toast("Copié dans le presse-papier ✓"));
});
document.getElementById("modal-overlay").addEventListener("click", e => {
  if (e.target === document.getElementById("modal-overlay"))
    document.getElementById("modal-overlay").hidden = true;
});

/* ══════════════════════════════════════════════
   RACCOURCIS CLAVIER
══════════════════════════════════════════════ */
document.addEventListener("keydown", e => {
  if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
  switch (e.code) {
    case "Space":        e.preventDefault(); toggleSim(); break;
    case "ArrowRight":   e.preventDefault(); pauseSim(); gol.step(); renderer.draw(); updateStats(); break;
    case "KeyC":         if (!e.ctrlKey && !e.metaKey) document.getElementById("btn-clear").click(); break;
    case "KeyR":         if (!e.ctrlKey && !e.metaKey) document.getElementById("btn-random").click(); break;
    case "KeyT":         if (!e.ctrlKey && !e.metaKey) document.getElementById("btn-theme").click(); break;
    case "Escape":       document.getElementById("modal-overlay").hidden = true; exitPlaceMode(); break;
    case "Equal": case "NumpadAdd":      renderer.zoom(1.2, canvas.width/2, canvas.height/2); renderer.onViewChange(); break;
    case "Minus": case "NumpadSubtract": renderer.zoom(0.83, canvas.width/2, canvas.height/2); renderer.onViewChange(); break;
    case "Digit0": case "Numpad0":       renderer.centerView(); break;
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
refreshPreview();

// Gosper gun au démarrage
setTimeout(() => {
  gol.placePattern(PATTERNS.gosper.cells, 0, 0);
  renderer.draw();
  updateStats();
}, 80);
