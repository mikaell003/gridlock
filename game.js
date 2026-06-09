const SIZE = 6;
const COLORS = ['red','blue','green','yellow','purple','orange'];
const SCORE_PER_BLOCK = 10;
const LEVEL_THRESHOLD = 200;

let board = [], score = 0, multiplier = 1, maxMultiplier = 1;
let spawnRate = 1800, spawnTimer = null, gameRunning = false;
let level = 1, levelXP = 0, hiScore = 0, soundOn = true;
let audioCtx = null;

hiScore = parseInt(localStorage.getItem('gridlock_hi') || '0');

// ── Audio ──────────────────────────────────────────────────────────────────
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, type, dur, vol) {
  vol = vol || 0.3;
  if (!soundOn) return;
  try {
    var ctx = getAudio();
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start();
    o.stop(ctx.currentTime + dur);
  } catch(e) {}
}

function playFuse(blocks) {
  var freqs = [220, 330, 440, 550, 660];
  var f = freqs[Math.min(blocks - 2, 4)];
  playTone(f * 2, 'sine', 0.15, 0.2);
  playTone(f * 3, 'sine', 0.1, 0.15);
}

function playMiss() { playTone(80, 'sawtooth', 0.12, 0.15); }

function playLevelUp() {
  [523, 659, 784, 1047].forEach(function(f, i) {
    setTimeout(function() { playTone(f, 'triangle', 0.2, 0.25); }, i * 80);
  });
}

function playGameOver() {
  [440, 350, 280, 180].forEach(function(f, i) {
    setTimeout(function() { playTone(f, 'sawtooth', 0.3, 0.2); }, i * 120);
  });
}

function toggleSound() {
  soundOn = !soundOn;
  document.getElementById('soundBtn').textContent = soundOn ? '🔊 SOUND' : '🔇 SOUND';
}

// ── Board ──────────────────────────────────────────────────────────────────
function initBoard() {
  board = [];
  for (var i = 0; i < SIZE; i++) {
    board.push([]);
    for (var j = 0; j < SIZE; j++) board[i].push(null);
  }
}

function startGame() {
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('gameoverScreen').classList.add('hidden');
  document.getElementById('howToScreen').classList.add('hidden');
  document.getElementById('gameUI').style.display = 'block';

  initBoard();
  score = 0; multiplier = 1; maxMultiplier = 1;
  level = 1; levelXP = 0; spawnRate = 1800;
  gameRunning = true;
  if (spawnTimer) clearTimeout(spawnTimer);

  updateStats();
  render();

  for (var i = 0; i < 6; i++) spawnBlock(false);
  render();
  startSpawner();
}

function showStart() {
  document.getElementById('gameoverScreen').classList.add('hidden');
  document.getElementById('gameUI').style.display = 'none';
  document.getElementById('startScreen').classList.remove('hidden');
  var el = document.getElementById('startHiScore');
  if (hiScore > 0) {
    el.innerHTML = '<div class="hi-score-row"><span class="hi-score-label">Best Score</span><span class="hi-score-val">' + hiScore.toLocaleString() + '</span></div>';
  }
}

function showHowTo() { document.getElementById('howToScreen').classList.remove('hidden'); }
function hideHowTo() { document.getElementById('howToScreen').classList.add('hidden'); }

// ── Spawn ──────────────────────────────────────────────────────────────────
function emptyCells() {
  var c = [];
  for (var r = 0; r < SIZE; r++)
    for (var col = 0; col < SIZE; col++)
      if (!board[r][col]) c.push([r, col]);
  return c;
}

function spawnBlock(animate) {
  var empties = emptyCells();
  if (empties.length === 0) { gameOver(); return; }
  var pick = empties[Math.floor(Math.random() * empties.length)];
  var r = pick[0], c = pick[1];
  board[r][c] = COLORS[Math.floor(Math.random() * COLORS.length)];
  if (animate) renderCellSpawn(r, c);
}

function startSpawner() {
  var loop = function() {
    if (!gameRunning) return;
    spawnBlock(true);
    spawnRate = Math.max(450, spawnRate * 0.975);

    var newLevel = Math.floor(score / LEVEL_THRESHOLD) + 1;
    if (newLevel > level) {
      level = newLevel;
      levelXP = 0;
      playLevelUp();
      showMultFlash('LEVEL ' + level + '!', '#00e676');
    }
    levelXP = (score % LEVEL_THRESHOLD) / LEVEL_THRESHOLD;
    updateStats();
    spawnTimer = setTimeout(loop, spawnRate);
  };
  spawnTimer = setTimeout(loop, spawnRate);
}

// ── Render ─────────────────────────────────────────────────────────────────
function render() {
  var grid = document.getElementById('grid');
  grid.innerHTML = '';
  for (var r = 0; r < SIZE; r++) {
    for (var c = 0; c < SIZE; c++) {
      var cell = document.createElement('div');
      cell.className = 'cell';
      if (board[r][c]) {
        cell.classList.add(board[r][c]);
        cell.classList.add('glow-' + board[r][c]);
      } else {
        cell.classList.add('empty');
      }
      cell.dataset.r = r;
      cell.dataset.c = c;
      (function(row, col) {
        cell.onclick = function() { handleClick(row, col); };
      })(r, c);
      grid.appendChild(cell);
    }
  }
  updateStats();
}

function renderCellSpawn(r, c) {
  var el = getCellEl(r, c);
  if (!el) { render(); return; }
  var div = document.createElement('div');
  div.className = 'cell spawn';
  if (board[r][c]) {
    div.classList.add(board[r][c]);
    div.classList.add('glow-' + board[r][c]);
  } else {
    div.classList.add('empty');
  }
  div.dataset.r = r;
  div.dataset.c = c;
  (function(row, col) {
    div.onclick = function() { handleClick(row, col); };
  })(r, c);
  el.replaceWith(div);
}

function getCellEl(r, c) {
  return document.querySelector('[data-r="' + r + '"][data-c="' + c + '"]');
}

// ── Click handler ──────────────────────────────────────────────────────────
function handleClick(r, c) {
  if (!gameRunning || board[r][c]) return;

  var neighbors = getNeighbors(r, c);
  var groups = {};
  neighbors.forEach(function(pos) {
    var nr = pos[0], nc = pos[1];
    var color = board[nr][nc];
    if (color) {
      if (!groups[color]) groups[color] = [];
      groups[color].push([nr, nc]);
    }
  });

  var bestColor = null, max = 0;
  for (var color in groups) {
    if (groups[color].length > max) {
      max = groups[color].length;
      bestColor = color;
    }
  }

  if (max >= 2) {
    var cells = groups[bestColor];
    cells.forEach(function(pos) {
      board[pos[0]][pos[1]] = null;
      var el = getCellEl(pos[0], pos[1]);
      if (el) el.classList.add('clear');
    });

    var gained = max * SCORE_PER_BLOCK * multiplier;
    score += gained;
    multiplier++;
    if (multiplier > maxMultiplier) maxMultiplier = multiplier;

    var el = getCellEl(r, c);
    if (el) showScorePopup(el, gained, bestColor);

    if (multiplier > 2) showMultFlash('\u00d7' + (multiplier - 1), colorHex(bestColor));

    playFuse(max);
    setTimeout(render, 320);
  } else {
    multiplier = 1;
    var el = getCellEl(r, c);
    if (el) {
      el.style.animation = 'none';
      el.offsetHeight; // reflow
      el.classList.add('pop');
    }
    playMiss();
  }
  updateStats();
}

function colorHex(c) {
  var map = {
    red:'#ff3b5c', blue:'#60c8ff', green:'#00e676',
    yellow:'#ffd600', purple:'#d500f9', orange:'#ff6d00'
  };
  return map[c] || '#fff';
}

function getNeighbors(r, c) {
  return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(function(pos) {
    return pos[0] >= 0 && pos[0] < SIZE && pos[1] >= 0 && pos[1] < SIZE;
  });
}

// ── Popups ─────────────────────────────────────────────────────────────────
function showScorePopup(el, pts, color) {
  var rect = el.getBoundingClientRect();
  var wrap = document.querySelector('.grid-wrap');
  var wrect = wrap.getBoundingClientRect();
  var pop = document.createElement('div');
  pop.className = 'score-popup';
  pop.textContent = '+' + pts;
  pop.style.color = colorHex(color);
  pop.style.left = (rect.left - wrect.left + rect.width / 2 - 20) + 'px';
  pop.style.top = (rect.top - wrect.top - 10) + 'px';
  wrap.appendChild(pop);
  setTimeout(function() { pop.remove(); }, 900);
}

function showMultFlash(text, color) {
  var wrap = document.querySelector('.grid-wrap');
  if (!wrap) return;
  var fl = document.createElement('div');
  fl.className = 'mult-flash';
  fl.textContent = text;
  fl.style.color = color;
  fl.style.textShadow = '0 0 30px ' + color;
  wrap.appendChild(fl);
  setTimeout(function() { fl.remove(); }, 700);
}

// ── Stats ──────────────────────────────────────────────────────────────────
function updateStats() {
  document.getElementById('score').textContent = score.toLocaleString();
  document.getElementById('multiplier').textContent = '\u00d7' + multiplier;
  document.getElementById('hiScore').textContent = Math.max(score, hiScore).toLocaleString();
  document.getElementById('levelNum').textContent = level;
  document.getElementById('levelFill').style.width = (levelXP * 100) + '%';
}

// ── Game Over ──────────────────────────────────────────────────────────────
function gameOver() {
  gameRunning = false;
  if (spawnTimer) clearTimeout(spawnTimer);

  var isNew = score > hiScore;
  if (isNew) { hiScore = score; localStorage.setItem('gridlock_hi', hiScore); }

  playGameOver();

  setTimeout(function() {
    document.getElementById('finalScore').textContent = score.toLocaleString();
    document.getElementById('goHiScore').textContent = hiScore.toLocaleString();
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('finalCombo').textContent = '\u00d7' + maxMultiplier;
    var nr = document.getElementById('newRecord');
    if (isNew) nr.classList.remove('hidden');
    else nr.classList.add('hidden');
    document.getElementById('gameoverScreen').classList.remove('hidden');
  }, 800);
}

// Init
showStart();
