// Q&A Drill: Matching tab
// ---------- matching ----------
let M = null, timer = null;
function startMatch(){
  const all = curGroup() === 'all';
  const size = all ? Infinity : +$('roundSize').value;
  const order = shuffle(poolNow()), rounds = [];
  for(let i=0;i<order.length;i+=size) rounds.push(order.slice(i,i+size));
  if(rounds.length>1 && rounds[rounds.length-1].length===1){ rounds[rounds.length-2].push(rounds.pop()[0]); }
  M = { rounds, r:0, matched:0, total:order.length, miss:0, start:Date.now(), selQ:null, selA:null, delayed: all, pairs: new Map(), checking:false };
  $('matchSetup').hidden = true; $('matchDone').hidden = true; $('matchRun').hidden = false;
  clearInterval(timer); timerStart('match', true);
  showRound();
}
function fmt(ms){ const s = Math.floor(ms/1000); return Math.floor(s/60) + ':' + String(s%60).padStart(2,'0'); }
function tick(){ if(M) $('mTime').textContent = fmt(Date.now()-M.start); }
function showRound(){
  const set = M.rounds[M.r];
  M.left = set.length; M.selQ = M.selA = null;
  $('colQ').innerHTML = shuffle(set).map(it=>`<button class="tile q" data-id="${it.id}">${esc(cased(it.q))}</button>`).join('');
  $('colA').innerHTML = shuffle(set).map(it=>`<button class="tile a" data-id="${it.id}">${esc(it.a)}</button>`).join('');
  $('mRound').textContent = (M.r+1) + ' of ' + M.rounds.length;
  $('mMatched').textContent = M.matched + ' of ' + M.total;
  $('mMiss').textContent = M.miss;
  $('mNext').hidden = true;
  M.pairs = new Map(); M.checking = false;
  $('mMsg').hidden = !M.delayed;
  if(M.delayed) $('mMsg').textContent = 'Match all ' + set.length + '. You won\'t find out which are right until every card is paired. Tap a numbered card to undo it.';
}
// "All" mode: pair everything first, then check every pair at once
const sameAnswer = (q, a) => { const qi = items.find(x=>x.id===q.dataset.id), ai = items.find(x=>x.id===a.dataset.id); return q.dataset.id === a.dataset.id || (qi && ai && qi.a === ai.a); };
function badge(btn, n){ const old = btn.querySelector('.pn'); if(old) old.remove(); if(n) btn.insertAdjacentHTML('afterbegin', `<span class="pn">${n}</span>`); }
function unpair(qBtn){
  const aBtn = M.pairs.get(qBtn); M.pairs.delete(qBtn);
  [qBtn, aBtn].forEach(x => { if(x){ x.classList.remove('paired'); badge(x, 0); delete x.dataset.pn; } });
}
function tapDelayed(btn){
  if(M.checking || btn.classList.contains('done')) return;
  const isQ = btn.classList.contains('q');
  if(btn.classList.contains('paired')){
    const qBtn = isQ ? btn : [...M.pairs.keys()].find(k => M.pairs.get(k) === btn);
    if(qBtn) unpair(qBtn);
    $('mMsg').textContent = 'Paired ' + M.pairs.size + ' of ' + M.left + '. Tap a numbered card to undo it.';
    return;
  }
  const col = isQ ? $('colQ') : $('colA');
  col.querySelectorAll('.sel').forEach(x=>x.classList.remove('sel'));
  if((isQ ? M.selQ : M.selA) === btn){ if(isQ) M.selQ=null; else M.selA=null; return; }
  btn.classList.add('sel'); if(isQ) M.selQ = btn; else M.selA = btn;
  if(M.selQ && M.selA){
    const used = new Set([...M.pairs.keys()].map(k => +k.dataset.pn));
    let n = 1; while(used.has(n)) n++;
    const q = M.selQ, a = M.selA;
    [q,a].forEach(x => { x.classList.remove('sel'); x.classList.add('paired'); x.dataset.pn = n; badge(x, n); });
    M.pairs.set(q, a); M.selQ = M.selA = null;
    if(M.pairs.size === M.left){ M.checking = true; $('mMsg').textContent = 'All paired. Checking…'; setTimeout(checkAllPairs, 400); }
    else $('mMsg').textContent = 'Paired ' + M.pairs.size + ' of ' + M.left + '. Tap a numbered card to undo it.';
  }
}
function checkAllPairs(){
  const wrong = [];
  let right = 0;
  M.pairs.forEach((a, q) => {
    if(sameAnswer(q, a)){ right++; [q,a].forEach(x => { x.classList.remove('paired'); badge(x, 0); x.classList.add('done'); x.disabled = true; }); }
    else wrong.push(q);
  });
  [...M.pairs.keys()].forEach(q => { if(!wrong.includes(q)) M.pairs.delete(q); });
  M.matched += right; M.left -= right; M.miss += wrong.length;
  $('mMatched').textContent = M.matched + ' of ' + M.total; $('mMiss').textContent = M.miss;
  if(!wrong.length){ M.checking = false; $('mMsg').hidden = true; finishMatch(); return; }
  wrong.forEach(q => { const a = M.pairs.get(q); [q,a].forEach(x => { x.classList.remove('paired'); x.classList.add('miss'); }); });
  $('mMsg').textContent = right + ' right, ' + wrong.length + ' wrong. The red ones don\'t match. Pair those again.';
  setTimeout(() => {
    wrong.forEach(q => { const a = M.pairs.get(q); [q,a].forEach(x => x && x.classList.remove('miss')); unpair(q); });
    M.checking = false;
  }, 1500);
}
function tap(btn){
  if(M.delayed) return tapDelayed(btn);
  if(btn.classList.contains('done')) return;
  const isQ = btn.classList.contains('q');
  const col = isQ ? $('colQ') : $('colA');
  col.querySelectorAll('.sel').forEach(x=>x.classList.remove('sel'));
  if((isQ ? M.selQ : M.selA) === btn){ if(isQ) M.selQ=null; else M.selA=null; return; }
  btn.classList.add('sel'); if(isQ) M.selQ = btn; else M.selA = btn;
  if(M.selQ && M.selA){
    const q = M.selQ, a = M.selA;
    const qi = items.find(x=>x.id===q.dataset.id), ai = items.find(x=>x.id===a.dataset.id);
    if(q.dataset.id === a.dataset.id || (qi && ai && qi.a === ai.a)){
      [q,a].forEach(x=>{ x.classList.remove('sel'); x.classList.add('done'); x.disabled = true; });
      M.matched++; M.left--; $('mMatched').textContent = M.matched + ' of ' + M.total;
      if(M.left===0){
        if(M.r < M.rounds.length-1){ $('mNext').hidden = false; $('mNext').focus(); }
        else finishMatch();
      }
    } else {
      M.miss++; $('mMiss').textContent = M.miss;
      [q,a].forEach(x=>{ x.classList.remove('sel'); x.classList.add('miss'); setTimeout(()=>x.classList.remove('miss'), 450); });
    }
    M.selQ = M.selA = null;
  }
}
$('colQ').addEventListener('click', e => { const b=e.target.closest('.tile'); if(b) tap(b); });
$('colA').addEventListener('click', e => { const b=e.target.closest('.tile'); if(b) tap(b); });
$('mNext').onclick = () => { M.r++; showRound(); };
$('mQuit').onclick = () => finishMatch(true);
function finishMatch(early){
  clearInterval(timer);
  $('matchRun').hidden = true; $('matchDone').hidden = false;
  $('mdTime').textContent = (M.total ? Math.round(M.matched/M.total*100) : 0) + '%';
  timerFinish('match', M.miss, M.matched >= M.total, 'matchTimes');
  stepLabel($('matchStepUp'), 'Match again');
  $('mdLine').textContent = 'Matched ' + M.matched + ' of ' + M.total + ' with ' + M.miss + (M.miss===1?' miss':' misses') + (early && M.matched<M.total ? ' (ended early).' : '.');
}
$('startMatch').onclick = () => { if(items.length>=2) startMatch(); };
$('mAgain').onclick = () => { $('matchDone').hidden = true; $('matchSetup').hidden = false; };
$('matchStepUp').onclick = () => { const n = nextN(); if(!n) return; setRange(n); startMatch(); };
