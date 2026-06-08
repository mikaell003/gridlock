const SIZE = 6;
const COLORS = ['red','blue','green','yellow','purple','orange'];
const SCORE_PER_BLOCK = 10;
const LEVEL_THRESHOLD = 200;

let board=[], score=0, multiplier=1, maxMultiplier=1;
let spawnRate=1800, spawnTimer=null, gameRunning=false;
let level=1, levelXP=0, hiScore=0, soundOn=true;
let audioCtx=null;

// Load hi score
hiScore = parseInt(localStorage.getItem('gridlock_hi')||'0');

// Audio
function getAudio(){
  if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  return audioCtx;
}
function playTone(freq,type,dur,vol=0.3){
  if(!soundOn) return;
  try{
    const ctx=getAudio();
    const o=ctx.createOscillator();
    const g=ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type=type; o.frequency.setValueAtTime(freq,ctx.currentTime);
    g.gain.setValueAtTime(vol,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
    o.start(); o.stop(ctx.currentTime+dur);
  }catch(e){}
}
function playFuse(blocks){
  const freqs=[220,330,440,550,660];
  const f=freqs[Math.min(blocks-2,4)];
  playTone(f*2,'sine',0.15,0.2);
  playTone(f*3,'sine',0.1,0.15);
}
function playMiss(){playTone(80,'sawtooth',0.12,0.15);}
function playLevelUp(){
  [523,659,784,1047].forEach((f,i)=>setTimeout(()=>playTone(f,'triangle',0.2,0.25),i*80));
}
function playGameOver(){
  [440,350,280,180].forEach((f,i)=>setTimeout(()=>playTone(f,'sawtooth',0.3,0.2),i*120));
}

function toggleSound(){
  soundOn=!soundOn;
  document.getElementById('soundBtn').textContent=soundOn?'🔊 SOUND':'🔇 SOUND';
}

// Init
function initBoard(){
  board=Array(SIZE).fill(null).map(()=>Array(SIZE).fill(null));
}

function startGame(){
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('gameoverScreen').classList.add('hidden');
  document.getElementById('howToScreen').classList.add('hidden');
  document.getElementById('gameUI').style.display='block';

  initBoard();
  score=0; multiplier=1; maxMultiplier=1;
  level=1; levelXP=0; spawnRate=1800;
  gameRunning=true;
  if(spawnTimer) clearTimeout(spawnTimer);

  updateStats();
  render();

  // Seed initial blocks
  for(let i=0;i<6;i++) spawnBlock(false);
  startSpawner();
}

function showStart(){
  document.getElementById('gameoverScreen').classList.add('hidden');
  document.getElementById('startScreen').classList.remove('hidden');
  const el=document.getElementById('startHiScore');
  if(hiScore>0){
    el.innerHTML=`<div class="hi-score-row"><span class="hi-score-label">Best Score</span><span class="hi-score-val">${hiScore}</span></div>`;
  }
}
function showHowTo(){document.getElementById('howToScreen').classList.remove('hidden');}
function hideHowTo(){document.getElementById('howToScreen').classList.add('hidden');}

// Spawn
function emptyCells(){
  let c=[];
  for(let r=0;r<SIZE;r++) for(let col=0;col<SIZE;col++) if(!board[r][col]) c.push([r,col]);
  return c;
}

function spawnBlock(animate=true){
  const empties=emptyCells();
  if(empties.length===0){gameOver();return;}
  const [r,c]=empties[Math.floor(Math.random()*empties.length)];
  board[r][c]=COLORS[Math.floor(Math.random()*COLORS.length)];
  if(animate) renderCellSpawn(r,c);
  else render();
}

function startSpawner(){
  const loop=()=>{
    if(!gameRunning) return;
    spawnBlock(true);
    spawnRate=Math.max(450,spawnRate*0.975);

    // Level up check
    const newLevel=Math.floor(score/LEVEL_THRESHOLD)+1;
    if(newLevel>level){
      level=newLevel;
      levelXP=0;
      playLevelUp();
      showMultFlash(`LEVEL ${level}!`,getComputedStyle(document.documentElement).getPropertyValue('--green'));
    }
    levelXP=(score%LEVEL_THRESHOLD)/LEVEL_THRESHOLD;
    updateStats();
    spawnTimer=setTimeout(loop,spawnRate);
  };
  spawnTimer=setTimeout(loop,spawnRate);
}

// Render
function render(){
  const grid=document.getElementById('grid');
  grid.innerHTML='';
  for(let r=0;r<SIZE;r++){
    for(let c=0;c<SIZE;c++){
      const cell=document.createElement('div');
      cell.className='cell';
      if(board[r][c]){
        cell.classList.add(board[r][c]);
        cell.classList.add('glow-'+board[r][c]);
      }else{
        cell.classList.add('empty');
      }
      cell.dataset.r=r; cell.dataset.c=c;
      cell.onclick=()=>handleClick(r,c);
      grid.appendChild(cell);
    }
  }
  updateStats();
}

function renderCellSpawn(r,c){
  const el=getCellEl(r,c);
  const div=document.createElement('div');
  div.className='cell spawn';
  if(board[r][c]){
    div.classList.add(board[r][c]);
    div.classList.add('glow-'+board[r][c]);
  }else div.classList.add('empty');
  div.dataset.r=r; div.dataset.c=c;
  div.onclick=()=>handleClick(r,c);
  if(el) el.replaceWith(div);
}

function getCellEl(r,c){
  return document.querySelector(`[data-r="${r}"][data-c="${c}"]`);
}

// Click handler
function handleClick(r,c){
  if(!gameRunning||board[r][c]) return;

  const neighbors=getNeighbors(r,c);
  const groups={};
  neighbors.forEach(([nr,nc])=>{
    const color=board[nr][nc];
    if(color){
      if(!groups[color]) groups[color]=[];
      groups[color].push([nr,nc]);
    }
  });

  let bestColor=null,max=0;
  for(let color in groups){
    if(groups[color].length>max){max=groups[color].length;bestColor=color;}
  }

  if(max>=2){
    // Fuse!
    const cells=groups[bestColor];
    cells.forEach(([nr,nc])=>{
      board[nr][nc]=null;
      const el=getCellEl(nr,nc);
      if(el){el.classList.add('clear');}
    });

    const gained=max*SCORE_PER_BLOCK*multiplier;
    score+=gained;
    multiplier++;
    if(multiplier>maxMultiplier) maxMultiplier=multiplier;

    // Score popup
    const el=getCellEl(r,c);
    if(el) showScorePopup(el,gained,bestColor);

    // Multiplier flash on high combos
    if(multiplier>2) showMultFlash(`×${multiplier-1}`,colorHex(bestColor));

    playFuse(max);

    setTimeout(()=>render(),320);
  }else{
    // Miss
    multiplier=1;
    const el=getCellEl(r,c);
    if(el){el.style.animation='none';el.offsetHeight;el.classList.add('pop');}
    playMiss();
  }
  updateStats();
}

function colorHex(c){
  const map={red:'#ff3b5c',blue:'#60c8ff',green:'#00e676',yellow:'#ffd600',purple:'#d500f9',orange:'#ff6d00'};
  return map[c]||'#fff';
}

function getNeighbors(r,c){
  return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([nr,nc])=>nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE);
}

function showScorePopup(el,pts,color){
  const rect=el.getBoundingClientRect();
  const wrap=document.querySelector('.grid-wrap');
  const wrect=wrap.getBoundingClientRect();
  const pop=document.createElement('div');
  pop.className='score-popup';
  pop.textContent=`+${pts}`;
  pop.style.color=colorHex(color);
  pop.style.left=(rect.left-wrect.left+rect.width/2-20)+'px';
  pop.style.top=(rect.top-wrect.top-10)+'px';
  wrap.appendChild(pop);
  setTimeout(()=>pop.remove(),900);
}

function showMultFlash(text,color){
  const wrap=document.querySelector('.grid-wrap');
  const fl=document.createElement('div');
  fl.className='mult-flash';
  fl.textContent=text;
  fl.style.color=color;
  fl.style.textShadow=`0 0 30px ${color}`;
  wrap.appendChild(fl);
  setTimeout(()=>fl.remove(),700);
}

function updateStats(){
  document.getElementById('score').textContent=score.toLocaleString();
  document.getElementById
