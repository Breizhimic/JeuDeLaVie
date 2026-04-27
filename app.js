// app.js (abrégé — inclut parsing/generation RLE and JSON)
importPresets();
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let cellSize=12, offsetX=0, offsetY=0;
const alive = new Set();
function key(x,y){return `${x},${y}`;}
function parseKey(s){return s.split(',').map(Number);}

// draw visible cells
function draw(){
  canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight;
  ctx.fillStyle = getComputedStyle(document.body).backgroundColor || '#fff';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = document.body.classList.contains('dark') ? '#fff' : '#000';
  const cols = Math.ceil(canvas.width/cellSize)+2, rows = Math.ceil(canvas.height/cellSize)+2;
  const sx = Math.floor(offsetX), sy = Math.floor(offsetY);
  for(let i=0;i<cols;i++) for(let j=0;j<rows;j++){
    const wx = sx+i, wy = sy+j;
    if(alive.has(key(wx,wy))) ctx.fillRect((i-(offsetX-sx))*cellSize,(j-(offsetY-sy))*cellSize,cellSize,cellSize);
  }
}

// presets UI
function importPresets(){
  const sel = document.getElementById('preset');
  for(const name in PRESETS){ const opt=document.createElement('option'); opt.value=name; opt.textContent=name; sel.appendChild(opt); }
  document.getElementById('loadPreset').onclick = () => {
    const p = PRESETS[sel.value]; if(!p) return;
    alive.clear();
    const baseX = Math.floor(-offsetX + 5), baseY = Math.floor(-offsetY + 5);
    p.cells.forEach(([x,y])=> alive.add(key(baseX+x, baseY+y)));
    draw();
  };
}

// RLE parser (basic, follows LifeWiki spec)
function parseRLE(text){
  const lines = text.split(/\r?\n/).filter(l=>!l.startsWith('#'));
  const header = lines.shift().match(/x\s*=\s*(\d+)\s*,\s*y\s*=\s*(\d+)/i);
  let data = lines.join('').replace(/\s+/g,'');
  let x=0,y=0; alive.clear();
  const re = /(\d*)([bo$!])/g; let m;
  while((m=re.exec(data))!==null){
    const n = m[1]?parseInt(m[1],10):1; const tag = m[2];
    if(tag==='b'){ x += n; }
    else if(tag==='o'){ for(let i=0;i<n;i++){ alive.add(key(x,y)); x++; } }
    else if(tag==='$'){ y += n; x=0; }
    else if(tag==='!') break;
  }
  draw();
}
function generateRLE(){
  // compute bounding box
  if(alive.size===0) return '';
  let xs=[], ys=[];
  for(const k of alive){ const [x,y]=parseKey(k); xs.push(x); ys.push(y); }
  const minx=Math.min(...xs), miny=Math.min(...ys);
  const w=Math.max(...xs)-minx+1, h=Math.max(...ys)-miny+1;
  let rows = Array.from({length:h},()=>Array(w).fill('b'));
  for(const k of alive){ const [x,y]=parseKey(k); rows[y-miny][x-minx]='o'; }
  let body='';
  for(let r=0;r<h;r++){
    let run=0, last=rows[r][0];
    for(let c=0;c<w;c++){
      const cell = rows[r][c];
      if(cell===last) run++; else { body += (run>1?run:'') + last; run=1; last=cell; }
    }
    body += (run>1?run:'') + last + '$';
  }
  body += '!';
  return `x = ${w}, y = ${h}\n${body}`;
}

// file import/export handlers
document.getElementById('fileIn').addEventListener('change', (e)=>{
  const f = e.target.files[0]; if(!f) return;
  const reader = new FileReader();
  reader.onload = ()=> {
    const txt = reader.result;
    if(f.name.endsWith('.json')) {
      const obj = JSON.parse(txt); alive.clear(); (obj.cells||[]).forEach(([x,y])=>alive.add(key(x,y))); draw();
    } else parseRLE(txt);
  };
  reader.readAsText(f);
});
document.getElementById('exportJson').onclick = ()=>{
  const arr = Array.from(alive).map(s=>parseKey(s));
  const blob = new Blob([JSON.stringify({cells:arr},null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='life.json'; a.click(); URL.revokeObjectURL(url);
};
document.getElementById('exportRle').onclick = ()=>{
  const r = generateRLE(); const blob=new Blob([r],{type:'text/plain'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='pattern.rle'; a.click(); URL.revokeObjectURL(url);
};

// minimal interactions: click to toggle
canvas.addEventListener('click',(e)=>{ const rect=canvas.getBoundingClientRect(); const cx=Math.floor((e.clientX-rect.left)/cellSize + offsetX); const cy=Math.floor((e.clientY-rect.top)/cellSize + offsetY); const k=key(cx,cy); if(alive.has(k)) alive.delete(k); else alive.add(k); draw(); });

draw();
