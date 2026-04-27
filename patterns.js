/**
 * patterns.js — Bibliothèque étendue du Jeu de la Vie
 */

const PATTERN_CATEGORIES = [
  {
    id: "still",
    label: "Still Life (stables)",
    patterns: [
      { id:"block",       name:"Block",            cells:[[0,0],[0,1],[1,0],[1,1]] },
      { id:"beehive",     name:"Beehive",           cells:[[0,1],[0,2],[1,0],[1,3],[2,1],[2,2]] },
      { id:"loaf",        name:"Loaf",              cells:[[0,1],[0,2],[1,0],[1,3],[2,1],[2,3],[3,2]] },
      { id:"boat",        name:"Boat",              cells:[[0,0],[0,1],[1,0],[1,2],[2,1]] },
      { id:"tub",         name:"Tub",               cells:[[0,1],[1,0],[1,2],[2,1]] },
      { id:"pond",        name:"Pond",              cells:[[0,1],[0,2],[1,0],[1,3],[2,0],[2,3],[3,1],[3,2]] },
      { id:"ship",        name:"Ship",              cells:[[0,0],[0,1],[1,0],[1,2],[2,1],[2,2]] },
      { id:"barge",       name:"Barge",             cells:[[0,1],[1,0],[1,2],[2,1],[2,3],[3,2]] },
      { id:"longboat",    name:"Long Boat",         cells:[[0,0],[0,1],[1,0],[1,2],[2,1],[2,3],[3,2]] },
      { id:"longtub",     name:"Long Tub",          cells:[[0,2],[1,1],[1,3],[2,0],[2,4],[3,1],[3,3],[4,2]] },
      { id:"hat",         name:"Hat",               cells:[[0,1],[1,0],[1,2],[2,0],[2,1],[2,2]] },
      { id:"carrier",     name:"Aircraft Carrier",  cells:[[0,0],[0,1],[1,0],[1,3],[2,2],[2,3]] },
      { id:"eater1",      name:"Eater 1",           cells:[[0,0],[0,1],[1,0],[1,2],[2,3],[3,2],[3,3]] },
      { id:"eater2",      name:"Eater 2",           cells:[[0,0],[0,1],[1,0],[1,3],[2,2],[2,4],[3,4],[4,3],[4,4]] },
      { id:"python",      name:"Python",            cells:[[0,0],[0,1],[1,2],[1,3],[2,0],[2,3],[3,0],[3,1],[3,2]] },
      { id:"hook",        name:"Hook",              cells:[[0,0],[0,1],[1,0],[2,0],[2,1],[2,2],[3,2]] },
      { id:"deadpond",    name:"Dead Pond",         cells:[[0,1],[0,2],[1,0],[1,3],[2,0],[2,3],[3,1],[3,2]] },
    ]
  },
  {
    id: "osc2",
    label: "Oscillateurs T=2",
    patterns: [
      { id:"blinker",     name:"Blinker",           cells:[[0,0],[0,1],[0,2]] },
      { id:"toad",        name:"Toad",              cells:[[0,1],[0,2],[0,3],[1,0],[1,1],[1,2]] },
      { id:"beacon",      name:"Beacon",            cells:[[0,0],[0,1],[1,0],[1,1],[2,2],[2,3],[3,2],[3,3]] },
      { id:"clock",       name:"Clock",             cells:[[0,1],[1,0],[1,2],[2,1],[2,3],[3,2]] },
      { id:"bipole",      name:"Bipole",            cells:[[0,0],[0,1],[1,0],[1,2],[2,3],[2,4],[3,3]] },
      { id:"tripole",     name:"Tripole",           cells:[[0,0],[0,1],[1,0],[1,2],[2,3],[2,5],[3,4],[3,5],[4,3]] },
      { id:"quadpole",    name:"Quad Pole",         cells:[[0,0],[0,1],[1,0],[1,2],[2,3],[2,5],[3,4],[3,6],[4,5],[4,7],[5,6]] },
    ]
  },
  {
    id: "osc_other",
    label: "Oscillateurs T=3+",
    patterns: [
      { id:"pulsar",      name:"Pulsar (T=3)",      cells:[[0,2],[0,3],[0,4],[0,8],[0,9],[0,10],[2,0],[2,5],[2,7],[2,12],[3,0],[3,5],[3,7],[3,12],[4,0],[4,5],[4,7],[4,12],[5,2],[5,3],[5,4],[5,8],[5,9],[5,10],[7,2],[7,3],[7,4],[7,8],[7,9],[7,10],[8,0],[8,5],[8,7],[8,12],[9,0],[9,5],[9,7],[9,12],[10,0],[10,5],[10,7],[10,12],[12,2],[12,3],[12,4],[12,8],[12,9],[12,10]] },
      { id:"pentadeca",   name:"Pentadecathlon (T=15)", cells:[[0,1],[1,1],[2,0],[2,2],[3,1],[4,1],[5,1],[6,1],[7,0],[7,2],[8,1],[9,1]] },
      { id:"figure8",     name:"Figure Eight (T=8)", cells:[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2],[3,3],[3,4],[3,5],[4,3],[4,4],[4,5],[5,3],[5,4],[5,5]] },
      { id:"octagon2",    name:"Octagon II (T=5)",  cells:[[0,3],[0,4],[1,2],[1,5],[2,1],[2,6],[3,0],[3,7],[4,0],[4,7],[5,1],[5,6],[6,2],[6,5],[7,3],[7,4]] },
      { id:"koksgalaxy",  name:"Kok's Galaxy (T=8)",cells:[[0,1],[0,2],[0,3],[0,4],[0,5],[0,7],[0,8],[1,0],[1,8],[2,0],[2,8],[3,0],[3,8],[4,0],[4,8],[5,0],[5,2],[6,0],[6,8],[7,1],[7,2],[7,3],[7,4],[7,5],[7,7],[7,8]] },
      { id:"fumarole",    name:"Fumarole (T=5)",    cells:[[0,1],[0,2],[1,0],[1,3],[2,1],[2,2],[3,0],[3,3],[4,1],[4,2]] },
      { id:"queenbee",    name:"Queen Bee (T=30)",  cells:[[0,1],[1,3],[2,0],[2,4],[3,0],[3,4],[4,0],[4,4],[5,3],[6,1]] },
      { id:"blocker",     name:"Blocker (T=2)",     cells:[[0,1],[0,2],[1,0],[1,1],[1,3],[1,4],[2,0],[2,4],[3,0],[3,4],[4,1],[4,3],[5,2]] },
      { id:"mold",        name:"Mold (T=4)",        cells:[[0,1],[0,2],[1,0],[1,3],[2,0],[2,2],[2,3],[3,1],[3,3],[4,2],[4,3]] },
      { id:"mazing",      name:"Mazing (T=4)",      cells:[[0,1],[0,2],[1,0],[1,3],[2,2],[2,3],[3,0],[3,1],[4,0],[4,3],[5,1],[5,2]] },
      { id:"unix",        name:"Unix (T=6)",        cells:[[0,1],[1,0],[1,2],[1,3],[2,0],[2,1],[2,3],[3,3],[4,2],[4,3]] },
      { id:"caterer",     name:"Caterer (T=3)",     cells:[[0,1],[0,2],[1,0],[1,3],[2,4],[3,0],[3,2],[3,3],[3,4]] },
    ]
  },
  {
    id: "spaceships",
    label: "Vaisseaux (Spaceships)",
    patterns: [
      { id:"glider",      name:"Glider",            cells:[[0,1],[1,2],[2,0],[2,1],[2,2]] },
      { id:"lwss",        name:"LWSS",              cells:[[0,1],[0,4],[1,0],[2,0],[2,4],[3,0],[3,1],[3,2],[3,3]] },
      { id:"mwss",        name:"MWSS",              cells:[[0,3],[1,1],[1,5],[2,0],[3,0],[3,5],[4,0],[4,1],[4,2],[4,3],[4,4]] },
      { id:"hwss",        name:"HWSS",              cells:[[0,3],[0,4],[1,1],[1,6],[2,0],[3,0],[3,6],[4,0],[4,1],[4,2],[4,3],[4,4],[4,5]] },
      { id:"loafer",      name:"Loafer",            cells:[[0,1],[0,2],[1,0],[1,3],[2,1],[2,3],[3,2],[3,3],[4,5],[5,5],[5,6],[6,4],[6,7],[7,5],[7,7],[8,6],[8,7]] },
      { id:"copperhead",  name:"Copperhead",        cells:[[0,2],[0,3],[1,0],[1,1],[1,4],[1,5],[2,1],[2,4],[3,1],[3,2],[3,3],[3,4],[5,0],[5,1],[5,4],[5,5],[6,0],[6,5],[7,0],[7,5],[8,1],[8,2],[8,3],[8,4]] },
      { id:"weekender",   name:"Weekender",         cells:[[0,1],[0,2],[0,5],[0,6],[1,0],[1,3],[1,4],[1,7],[3,1],[3,2],[3,5],[3,6],[4,0],[4,7],[5,0],[5,7],[6,0],[6,7],[7,1],[7,2],[7,5],[7,6]] },
      { id:"canada",      name:"Canada Goose",      cells:[[0,0],[0,1],[1,0],[2,1],[2,2],[2,3],[3,3],[3,4],[4,4],[5,4],[5,5],[6,2],[6,4],[7,1],[7,3],[8,0],[8,2]] },
      { id:"seal",        name:"Seal",              cells:[[0,2],[0,3],[1,0],[1,1],[1,4],[1,5],[2,0],[2,5],[3,0],[3,5],[4,1],[4,4],[5,2],[5,3]] },
    ]
  },
  {
    id: "guns",
    label: "Canons (Guns)",
    patterns: [
      { id:"gosper",      name:"Gosper Glider Gun", cells:[[5,1],[5,2],[6,1],[6,2],[5,11],[6,11],[7,11],[4,12],[8,12],[3,13],[9,13],[3,14],[9,14],[6,15],[4,16],[8,16],[5,17],[6,17],[7,17],[6,18],[3,21],[4,21],[5,21],[3,22],[4,22],[5,22],[2,23],[6,23],[1,25],[2,25],[6,25],[7,25],[3,35],[4,35],[3,36],[4,36]] },
      { id:"simkin",      name:"Simkin Glider Gun", cells:[[0,0],[0,1],[1,0],[1,1],[0,4],[0,5],[1,4],[1,5],[4,2],[4,3],[5,2],[5,3],[2,8],[2,9],[3,7],[3,11],[4,7],[5,8],[5,9],[5,12],[6,11],[6,12],[7,10],[7,11]] },
      { id:"lw_volcano",  name:"LW Volcano (P46)",  cells:[[0,1],[0,2],[1,0],[1,3],[2,3],[3,0],[3,2],[3,3],[5,3],[5,4],[5,5],[6,3],[6,5],[7,4],[7,5],[8,0],[8,1],[9,0],[9,2],[10,1]] },
      { id:"bigun",       name:"Big Gun (P46)",     cells:[[0,0],[0,1],[1,0],[1,1],[5,0],[5,1],[6,0],[6,1],[2,7],[2,8],[3,6],[3,9],[4,5],[4,10],[5,5],[5,11],[6,5],[6,11],[7,6],[7,9],[8,7],[8,8]] },
      { id:"popgun",      name:"Pop Gun",           cells:[[2,0],[2,1],[3,0],[3,1],[0,4],[0,5],[1,3],[1,6],[2,3],[2,7],[3,3],[3,7],[4,4],[4,5],[4,6],[5,8],[5,9],[6,8],[6,9]] },
    ]
  },
  {
    id: "methuselahs",
    label: "Méthusalems",
    patterns: [
      { id:"rpentomino",  name:"R-Pentomino",       cells:[[0,1],[0,2],[1,0],[1,1],[2,1]] },
      { id:"diehard",     name:"Die Hard",          cells:[[0,6],[1,0],[1,1],[2,1],[2,5],[2,6],[2,7]] },
      { id:"acorn",       name:"Acorn",             cells:[[0,1],[1,3],[2,0],[2,1],[2,4],[2,5],[2,6]] },
      { id:"pi",          name:"Pi Heptomino",      cells:[[0,0],[0,1],[0,2],[1,0],[1,2],[2,0],[2,2]] },
      { id:"bheptomino",  name:"B-Heptomino",       cells:[[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1]] },
      { id:"thunderbird", name:"Thunderbird",       cells:[[0,0],[0,1],[0,2],[1,1],[2,1],[3,1]] },
      { id:"bunnies",     name:"Bunnies",           cells:[[0,0],[0,6],[1,2],[1,6],[2,2],[3,1],[3,5]] },
      { id:"rabbits",     name:"Rabbits",           cells:[[0,0],[0,1],[0,2],[0,5],[1,0],[2,3],[2,4],[2,5],[3,1],[3,2],[3,4]] },
      { id:"switchengine",name:"Switch Engine",     cells:[[0,0],[0,2],[1,2],[2,5],[2,6],[2,7],[3,5],[4,1],[4,2],[4,5],[5,6],[5,7]] },
      { id:"lidka",       name:"Lidka",             cells:[[0,0],[1,2],[2,0],[2,3],[3,2],[3,3],[4,0],[4,3],[5,0],[5,1]] },
    ]
  },
  {
    id: "puffers",
    label: "Puffeurs & Trains",
    patterns: [
      { id:"puffer1",     name:"Puffer 1",          cells:[[0,1],[0,2],[0,3],[1,0],[1,3],[2,3],[3,0],[3,2],[4,5],[4,6],[4,7],[5,5],[5,8],[6,8],[7,5],[7,7]] },
      { id:"puffer2",     name:"Puffer 2",          cells:[[0,2],[1,0],[1,4],[2,5],[3,0],[3,5],[4,1],[4,2],[4,3],[4,4],[4,5],[6,1],[6,2],[6,3],[7,0],[7,3],[8,3],[9,0],[9,2]] },
      { id:"corderrake",  name:"Corder Rake",       cells:[[0,3],[1,1],[1,2],[1,4],[2,0],[2,4],[3,0],[3,3],[3,4],[4,0],[4,1],[4,7],[4,8],[5,6],[5,9],[6,5],[6,9],[7,5],[7,8],[7,9],[8,5],[8,6]] },
    ]
  },
  {
    id: "agars",
    label: "Tapis (Agars) & Infinis",
    patterns: [
      { id:"linepuffer",  name:"Line Puffer",       cells:[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[0,11]] },
      { id:"cross",       name:"Croix",             cells:[[0,2],[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[2,3],[2,4],[3,1],[3,2],[3,3],[4,2]] },
      { id:"diamond",     name:"Losange",           cells:[[0,2],[1,1],[1,3],[2,0],[2,2],[2,4],[3,1],[3,3],[4,2]] },
      { id:"x29",         name:"X29",               cells:[[0,1],[0,2],[1,0],[1,3],[2,0],[2,1],[2,3],[3,1],[3,2],[3,3]] },
      { id:"pinwheel",    name:"Moulin à vent",     cells:[[0,2],[0,3],[1,0],[1,1],[1,4],[2,0],[2,4],[3,0],[3,1],[3,4],[4,2],[4,3]] },
    ]
  },
  {
    id: "classics",
    label: "Grands classiques",
    patterns: [
      { id:"glider_gun2",  name:"Double Glider Gun",cells:[[5,1],[5,2],[6,1],[6,2],[5,11],[6,11],[7,11],[4,12],[8,12],[3,13],[9,13],[3,14],[9,14],[6,15],[4,16],[8,16],[5,17],[6,17],[7,17],[6,18],[3,21],[4,21],[5,21],[3,22],[4,22],[5,22],[2,23],[6,23],[1,25],[2,25],[6,25],[7,25],[3,35],[4,35],[3,36],[4,36],[12,1],[12,2],[13,1],[13,2],[12,11],[13,11],[14,11],[11,12],[15,12],[10,13],[16,13],[10,14],[16,14],[13,15],[11,16],[15,16],[12,17],[13,17],[14,17],[13,18],[10,21],[11,21],[12,21],[10,22],[11,22],[12,22],[9,23],[13,23],[8,25],[9,25],[13,25],[14,25],[10,35],[11,35],[10,36],[11,36]] },
      { id:"eater_block",  name:"Eater + Block",    cells:[[0,0],[0,1],[1,0],[1,2],[2,3],[3,2],[3,3],[5,0],[5,1],[6,0],[6,1]] },
      { id:"glider_eater", name:"Glider Eater",     cells:[[0,0],[0,1],[1,0],[1,2],[2,3],[3,2],[3,3]] },
      { id:"3enginecorder",name:"3-Engine Corder",  cells:[[0,2],[0,3],[1,0],[1,1],[1,4],[2,0],[2,4],[3,1],[3,3],[4,2],[6,2],[6,3],[7,0],[7,1],[7,4],[8,0],[8,4],[9,1],[9,3],[10,2]] },
      { id:"p60gun",       name:"P60 Glider Gun",   cells:[[0,0],[0,1],[1,0],[1,2],[2,0],[3,0],[3,1],[4,3],[5,4],[6,4],[7,3],[7,4]] },
    ]
  },
  {
    id: "soup",
    label: "Configurations aléatoires",
    patterns: [
      { id:"soup5x5",     name:"Soupe 5×5",         cells:[] },
      { id:"soup10x10",   name:"Soupe 10×10",        cells:[] },
      { id:"soup20x20",   name:"Soupe 20×20",        cells:[] },
      { id:"soup30x30",   name:"Soupe 30×30",        cells:[] },
    ]
  }
];

// Les soupes sont aléatoires — générées au moment du placement
const SOUP_SIZES = { soup5x5:5, soup10x10:10, soup20x20:20, soup30x30:30 };

function generateSoup(size, density=0.38) {
  const cells = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (Math.random() < density) cells.push([r, c]);
  return cells;
}

// Dictionnaire plat PATTERNS (compatibilité)
const PATTERNS = {};
for (const cat of PATTERN_CATEGORIES) {
  for (const p of cat.patterns) {
    PATTERNS[p.id] = p;
  }
}

function patternBounds(cells) {
  if (!cells || cells.length === 0) return { minR:0, maxR:0, minC:0, maxC:0, h:1, w:1 };
  let minR=Infinity, maxR=-Infinity, minC=Infinity, maxC=-Infinity;
  for (const [r,c] of cells) {
    if(r<minR)minR=r; if(r>maxR)maxR=r; if(c<minC)minC=c; if(c>maxC)maxC=c;
  }
  return {minR,maxR,minC,maxC,h:maxR-minR+1,w:maxC-minC+1};
}

function centerPattern(cells) {
  if (!cells || cells.length === 0) return [];
  const {minR,minC,h,w} = patternBounds(cells);
  const dr=-minR-Math.floor(h/2), dc=-minC-Math.floor(w/2);
  return cells.map(([r,c])=>[r+dr,c+dc]);
}

function drawPatternPreview(ctx, cells, w, h, dark) {
  const bg    = dark ? "#0a0a0a" : "#f5f4f0";
  const alive = dark ? "#f5f4f0" : "#0a0a0a";
  const grid  = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  if (!cells || cells.length === 0) {
    ctx.fillStyle = dark ? "#333" : "#ccc";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("aléatoire", w/2, h/2+4);
    return;
  }
  const b = patternBounds(cells);
  const pad = 3;
  const cs = Math.max(1, Math.floor(Math.min((w-pad*2)/b.w, (h-pad*2)/b.h)));
  const offX = Math.floor((w - cs*b.w)/2) - b.minC*cs;
  const offY = Math.floor((h - cs*b.h)/2) - b.minR*cs;
  if (cs >= 4) {
    ctx.strokeStyle = grid; ctx.lineWidth = 0.5;
    for (let r=b.minR; r<=b.maxR+1; r++) { const y=offY+r*cs+.5; ctx.beginPath(); ctx.moveTo(offX+b.minC*cs,y); ctx.lineTo(offX+(b.maxC+1)*cs,y); ctx.stroke(); }
    for (let c=b.minC; c<=b.maxC+1; c++) { const x=offX+c*cs+.5; ctx.beginPath(); ctx.moveTo(x,offY+b.minR*cs); ctx.lineTo(x,offY+(b.maxR+1)*cs); ctx.stroke(); }
  }
  ctx.fillStyle = alive;
  for (const [r,c] of cells) ctx.fillRect(offX+c*cs+.5, offY+r*cs+.5, Math.max(1,cs-.5), Math.max(1,cs-.5));
}
