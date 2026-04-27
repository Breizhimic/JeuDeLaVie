// app.js
// Assure-toi que patterns.js est chargé avant ce fichier.

document.addEventListener('DOMContentLoaded', () => {
  // DOM
  const canvas = document.getElementById('canvas');
  const startBtn = document.getElementById('startBtn');
  const stepBtn = document.getElementById('stepBtn');
  const clearBtn = document.getElementById('clearBtn');
  const randomBtn = document.getElementById('randomBtn');
  const themeBtn = document.getElementById('themeBtn');
  const presetSel = document.getElementById('preset');
  const loadPresetBtn = document.getElementById('loadPreset');
  const fileIn = document.getElementById('fileIn');
  const exportRleBtn = document.getElementById('exportRle');
  const exportJsonBtn = document.getElementById('exportJson');
  const speedInput = document.getElementById('speed');
  const cellSizeInput = document.getElementById('cellSize');

  // état
  let running = false;
  let intervalId = null;
  let fps = parseInt(speedInput.value,10) || 6;
  let cellSize = parseInt(cellSizeInput.value,10) || 12;
  let offsetX = 0, offsetY = 0; // coordonnées du coin supérieur gauche en cellules (float)
  const alive = new Set(); // "x,y"
  const ctx = canvas.getContext('2d');
  let showGrid = false;

  // initial canvas sizing
  function fitCanvas(){
    canvas.width = canvas.clientWidth = document.getElementById('viewport').clientWidth;
    canvas.height = canvas.clientHeight = document.getElementById('viewport').clientHeight;
    draw();
  }
  window.addEventListener('resize', fitCanvas);
  fitCanvas();

  // utilitaires
  const key = (x,y) => `${x},${y}`;
  const parseKey = s => s.split(',').map(Number);

  // draw
  function draw(){
    // colors
    const dark = document.body.classList.contains('dark');
    const aliveColor = dark ? '#000000' : '#000000';
    const deadColor = dark ? '#ffffff' : '#ffffff';
    const gridColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    // clear
    ctx.fillStyle = deadColor;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // compute visible range
    const cs = cellSize;
    const cols = Math.ceil(canvas.width / cs) + 2;
    const rows = Math.ceil(canvas.height / cs) + 2;
    const startX = Math.floor(offsetX);
    const startY = Math.floor(offsetY);

    // draw alive cells in visible area
    ctx.fillStyle = aliveColor;
    for (let i = 0; i <= cols; i++){
      for (let j = 0; j <= rows; j++){
        const wx = startX + i;
        const wy = startY + j;
        if (alive.has(key(wx,wy))){
          const sx = Math.round((i - (offsetX - startX)) * cs);
          const sy = Math.round((j - (offsetY - startY)) * cs);
          ctx.fillRect(sx, sy, cs, cs);
        }
      }
    }

    // optional grid
    if (showGrid){
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      for (let i = 0; i <= cols; i++){
        const x = Math.round((i - (offsetX - startX)) * cs) + 0.5;
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke();
      }
      for (let j = 0; j <= rows; j++){
        const y = Math.round((j - (offsetY - startY)) * cs) + 0.5;
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke();
      }
    }
  }

  // canvas <-> cell
  function canvasToCell(px, py){
    const cs = cellSize;
    const startX = Math.floor(offsetX);
    const startY = Math.floor(offsetY);
    const localX = px / cs + offsetX - startX;
    const localY = py / cs + offsetY - startY;
    const wx = Math.floor(localX) + startX;
    const wy = Math.floor(localY) + startY;
    return [wx, wy];
  }

  function toggleCellAt(px, py, makeAlive = null){
    const [wx, wy] = canvasToCell(px, py);
    const k = key(wx,wy);
    if (makeAlive === null){
      if (alive.has(k)) alive.delete(k);
      else alive.add(k);
    } else {
      if (makeAlive) alive.add(k); else alive.delete(k);
    }
    draw();
  }

  // interactions: paint & pan & zoom
  let drawing = false;
  let panStart = null;
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.button === 0){ // left = paint
      drawing = true;
      toggleCellAt(e.clientX - rect.left, e.clientY - rect.top, true);
      e.preventDefault();
    } else if (e.button === 2){ // right = pan
      panStart = {x:e.clientX, y:e.clientY, ox:offsetX, oy:offsetY};
      e.preventDefault();
    }
  });
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (drawing && (e.buttons & 1)){
      toggleCellAt(e.clientX - rect.left, e.clientY - rect.top, true);
    } else if (panStart){
      const dx = (panStart.x - e.clientX) / cellSize;
      const dy = (panStart.y - e.clientY) / cellSize;
      offsetX = panStart.ox + dx;
      offsetY = panStart.oy + dy;
      draw();
    }
  });
  window.addEventListener('mouseup', () => { drawing = false; panStart = null; });

  // prevent context menu on canvas
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // wheel zoom centered on mouse
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const oldSize = cellSize;
    if (e.deltaY > 0) cellSize = Math.max(4, Math.round(cellSize * 0.9));
    else cellSize = Math.min(80, Math.round(cellSize * 1.1));
    cellSizeInput.value = cellSize;
    // adjust offset so zoom centers on mouse
    const worldBeforeX = offsetX + mx / oldSize;
    const worldBeforeY = offsetY + my / oldSize;
    const worldAfterX = offsetX + mx / cellSize;
    const worldAfterY = offsetY + my / cellSize;
    offsetX += worldBeforeX - worldAfterX;
    offsetY += worldBeforeY - worldAfterY;
    draw();
  }, {passive:false});

  // controls wiring
  startBtn.addEventListener('click', () => {
    running = !running;
    if (running){
      startBtn.textContent = 'Pause';
      startSimulation();
    } else {
      startBtn.textContent = 'Lancer';
      stopSimulation();
    }
  });

  stepBtn.addEventListener('click', () => step());

  clearBtn.addEventListener('click', () => {
    alive.clear();
    draw();
  });

  randomBtn.addEventListener('click', () => {
    // randomize visible area
    const cols = Math.ceil(canvas.width / cellSize) + 2;
    const rows = Math.ceil(canvas.height / cellSize) + 2;
    const startX = Math.floor(offsetX);
    const startY = Math.floor(offsetY);
    for (let i = startX; i < startX + cols; i++){
      for (let j = startY; j < startY + rows; j++){
        if (Math.random() < 0.25) alive.add(key(i,j));
        else alive.delete(key(i,j));
      }
    }
    draw();
  });

  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    draw();
  });

  speedInput.addEventListener('input', () => {
    fps = parseInt(speedInput.value,10);
    if (running){
      stopSimulation();
      startSimulation();
    }
  });

  cellSizeInput.addEventListener('input', () => {
    cellSize = parseInt(cellSizeInput.value,10);
    draw();
  });

  // presets UI
  function populatePresets(){
    for (const name in PRESETS){
      const opt = document.createElement('option');
      opt.value = name; opt.textContent = name;
      presetSel.appendChild(opt);
    }
  }
  populatePresets();

  loadPresetBtn.addEventListener('click', () => {
    const name = presetSel.value;
    const p = PRESETS[name];
    if (!p) return;
    // place pattern centered in view
    const baseX = Math.floor(offsetX + (canvas.width / cellSize) / 2 - p.w/2);
    const baseY = Math.floor(offsetY + (canvas.height / cellSize) / 2 - p.h/2);
    for (const [dx,dy] of p.cells){
      alive.add(key(baseX + dx, baseY + dy));
    }
    draw();
  });

  // Simulation core (sparse algorithm)
  function step(){
    if (alive.size === 0) return;
    const neighborCounts = new Map();
    for (const k of alive){
      const [x,y] = parseKey(k);
      for (let dx=-1; dx<=1; dx++){
        for (let dy=-1; dy<=1; dy++){
          if (dx===0 && dy===0) continue;
          const nk = key(x+dx, y+dy);
          neighborCounts.set(nk, (neighborCounts.get(nk) || 0) + 1);
        }
      }
    }
    const newAlive = new Set();
    // births (exactly 3 neighbors)
    for (const [k,cnt] of neighborCounts.entries()){
      if (cnt === 3) newAlive.add(k);
    }
    // survivors (alive with 2 or 3 neighbors)
    for (const k of alive){
      const cnt = neighborCounts.get(k) || 0;
      if (cnt === 2 || cnt === 3) newAlive.add(k);
    }
    alive.clear();
    for (const k of newAlive) alive.add(k);
    draw();
  }

  function startSimulation(){
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(step, 1000 / fps);
  }
  function stopSimulation(){
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  }

  // RLE parser (basic)
  function parseRLE(text){
    const lines = text.split(/\r?\n/).filter(l => !l.startsWith('#') && l.trim() !== '');
    // find header line with x = .., y = ..
    let headerIndex = -1;
    for (let i=0;i<lines.length;i++){
      if (/x\s*=\s*\d+/i.test(lines[i])){ headerIndex = i; break; }
    }
    if (headerIndex === -1) throw new Error('RLE header not found');
    const header = lines[headerIndex];
    const m = header.match(/x\s*=\s*(\d+)\s*,\s*y\s*=\s*(\d+)/i);
    const width = parseInt(m[1],10), height = parseInt(m[2],10);
    const data = lines.slice(headerIndex+1).join('').replace(/\s+/g,'');
    let x=0,y=0;
    alive.clear();
    const re = /(\d*)([bo$!])/g;
    let mm;
    while ((mm = re.exec(data)) !== null){
      const n = mm[1] ? parseInt(mm[1],10) : 1;
      const tag = mm[2];
      if (tag === 'b'){ x += n; }
      else if (tag === 'o'){ for (let i=0;i<n;i++){ alive.add(key(x,y)); x++; } }
      else if (tag === '$'){ y += n; x = 0; }
      else if (tag === '!'){ break; }
    }
    draw();
  }

  // generate RLE from alive set
  function generateRLE(){
    if (alive.size === 0) return '';
    const coords = Array.from(alive).map(s => parseKey(s));
    const xs = coords.map(c => c[0]), ys = coords.map(c => c[1]);
    const minx = Math.min(...xs), miny = Math.min(...ys);
    const maxx = Math.max(...xs), maxy = Math.max(...ys);
    const w = maxx - minx + 1, h = maxy - miny + 1;
    // build rows
    const rows = [];
    for (let y = miny; y <= maxy; y++){
      let row = '';
      let runChar = null, runCount = 0;
      for (let x = minx; x <= maxx; x++){
        const c = alive.has(key(x,y)) ? 'o' : 'b';
        if (runChar === null){ runChar = c; runCount = 1; }
        else if (c === runChar) runCount++;
        else {
          row += (runCount > 1 ? runCount : '') + runChar;
          runChar = c; runCount = 1;
        }
      }
      if (runChar !== null) row += (runCount > 1 ? runCount : '') + runChar;
      rows.push(row);
    }
    const body = rows.map(r => r + '$').join('') + '!';
    return `x = ${w}, y = ${h}\n${body}`;
  }

  // file import/export
  fileIn.addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const txt = reader.result;
      try {
        if (f.name.toLowerCase().endsWith('.json')){
          const obj = JSON.parse(txt);
          alive.clear();
          (obj.cells || []).forEach(([x,y]) => alive.add(key(x,y)));
          draw();
        } else {
          parseRLE(txt);
        }
      } catch (err){
        alert('Erreur import : ' + err.message);
      }
    };
    reader.readAsText(f);
  });

  exportJsonBtn.addEventListener('click', () => {
    const arr = Array.from(alive).map(s => parseKey(s));
    const blob = new Blob([JSON.stringify({cells:arr},null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'life.json'; a.click();
    URL.revokeObjectURL(url);
  });

  exportRleBtn.addEventListener('click', () => {
    const r = generateRLE();
    const blob = new Blob([r], {type:'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'pattern.rle'; a.click();
    URL.revokeObjectURL(url);
  });

  // keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'g'){ showGrid = !showGrid; draw(); }
  });

  // initial seed: center a glider
  function seedDemo(){
    const p = PRESETS['Glider'];
    if (!p) return;
    const baseX = Math.floor(offsetX + (canvas.width / cellSize) / 2 - p.w/2);
    const baseY = Math.floor(offsetY + (canvas.height / cellSize) / 2 - p.h/2);
    for (const [dx,dy] of p.cells) alive.add(key(baseX+dx, baseY+dy));
    draw();
  }

  // initial offsets (center)
  offsetX = -Math.floor((canvas.width / cellSize) / 2);
  offsetY = -Math.floor((canvas.height / cellSize) / 2);
  seedDemo();
  draw();

  // debug helper (open console si problème)
  console.log('Jeu de la Vie initialisé. Alive cells:', alive.size);
});
