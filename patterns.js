// Q&A Drill: Patterns tab
// ---------- patterns quiz ----------
let H = null;
function phQuestions(pool){
  const g = $('phGroup').value;
  return pool.flatMap(it => phParts(it).map((p,k) => ({it, k, p}))).filter(x => !g || x.p.group === g);
}
function fillGroups(){
  const sel = $('phGroup'), was = sel.value;
  const groups = [...new Set(poolNow().flatMap(it => phParts(it).map(p => p.group)))].sort();
  sel.innerHTML = '<option value="">All patterns</option>' + groups.map(g => `<option>${esc(g)}</option>`).join('');
  if(groups.includes(was)) sel.value = was;
  const n = phQuestions(poolNow()).length;
  $('startPh').disabled = !n;
  $('phNeed').textContent = n ? n + ' tricky parts to practice.' : 'No spelling patterns found in these words. This works best on single-word lists.';
}
document.querySelectorAll('select.range').forEach(sel => sel.addEventListener('change', () => { if(!$('tab-phon').hidden) fillGroups(); }));
$('phGroup').onchange = fillGroups;
const showAlt = t => t === '' ? '(no letter)' : t;
function startPh(qs, pool, full){
  timerStart('phon', full);
  H = { order: shuffle(qs), pool, i:0, score:0, missed:[], answered:false };
  $('phSetup').hidden = true; $('phDone').hidden = true; $('phRun').hidden = false;
  $('hHear').hidden = !canSpeak; $('hSlow').hidden = !canSpeak;
  showH();
}
function showH(){
  const {it, k, p} = H.order[H.i], parts = phParts(it);
  const right = it.q.slice(p.s, p.s+p.l).toLowerCase();
  const opts = [right]; p.alts.forEach(a => { if(!opts.includes(a) && opts.length < 4) opts.push(a); });
  H.opts = shuffle(opts); H.right = right; H.answered = false;
  $('hWord').innerHTML = markWord(cased(it.q), parts.map((x,j)=> j===k ? x : null).filter(Boolean), 0);
  $('hDef').textContent = it.a;
  $('hChoices').innerHTML = H.opts.map((o,j)=>`<button class="choice letters" data-k="${j}"><span class="k">${j+1}</span><span>${esc(showAlt(o))}</span></button>`).join('');
  $('hFeedback').textContent = ''; $('hFeedback').className = 'feedback'; $('hPh').hidden = true;
  $('hPos').textContent = (H.i+1) + ' of ' + H.order.length;
  $('hScore').textContent = H.score + ' correct';
  $('hBar').style.width = (H.i / H.order.length * 100) + '%';
  $('hNext').disabled = true; $('hNext').textContent = H.i === H.order.length-1 ? 'See results' : 'Next';
  if($('phSay').checked) say(withCap(it.q), 0.9);
}
function pickH(j){
  if(!H || H.answered) return;
  H.answered = true;
  const {it, k, p} = H.order[H.i];
  const btns = [...$('hChoices').children];
  btns.forEach((b,x) => { b.disabled = true; if(H.opts[x] === H.right) b.classList.add('right'); });
  if(H.opts[j] === H.right){ H.score++; $('hFeedback').textContent = 'Correct.'; $('hFeedback').className = 'feedback ok'; }
  else { btns[j].classList.add('wrong'); H.missed.push(H.order[H.i]); $('hFeedback').textContent = 'Not quite. It’s ' + H.right + '.'; $('hFeedback').className = 'feedback bad'; }
  $('hWord').innerHTML = markWord(cased(it.q), [p]);
  $('hPh').innerHTML = '<ul class="phList">' + phListHtml(it.q, phParts(it), k) + '</ul>'; $('hPh').hidden = false;
  $('hScore').textContent = H.score + ' correct';
  $('hNext').disabled = false; $('hNext').focus();
}
$('hChoices').addEventListener('click', e => { const b = e.target.closest('.choice'); if(b) pickH(+b.dataset.k); });
$('hHear').onclick = () => say(withCap(H.order[H.i].it.q), 0.9);
$('hSlow').onclick = () => sayParts(H.order[H.i].it);
$('hNext').onclick = () => { if(H.i < H.order.length-1){ H.i++; showH(); } else finishPh(); };
$('hQuit').onclick = () => finishPh(true);
function finishPh(early){
  if(canSpeak) speechSynthesis.cancel();
  const done = early ? H.i + (H.answered?1:0) : H.order.length;
  $('phRun').hidden = true; $('phDone').hidden = false;
  $('hdScore').textContent = (done ? Math.round(H.score/done*100) : 0) + '%';
  $('hdLine').textContent = H.score + ' of ' + done + ' correct' + (early && done < H.order.length ? ' (ended early)' : '') + '.';
  $('hMissedWrap').hidden = !H.missed.length; $('hRetryMissed').hidden = !H.missed.length;
  $('hMissedList').innerHTML = H.missed.map(m => `<li><span class="phWord" style="font-size:24px">${markWord(cased(m.it.q), [m.p])}</span>${phListHtml(m.it.q, phParts(m.it), m.k).replace(/^<li>|<\/li>$/g,'')}</li>`).join('');
  timerFinish('phon', H.missed.length, !early || done >= H.order.length, 'phTimes');
  stepLabel($('phStepUp'), 'Patterns again');
}
$('startPh').onclick = () => { const p = poolNow(), q = phQuestions(p); if(q.length) startPh(q, p, true); };
$('hRetryMissed').onclick = () => startPh(H.missed, H.pool);
$('phStepUp').onclick = () => { const n = nextN(); if(!n) return; setRange(n); fillGroups(); const p = poolNow(), q = phQuestions(p); if(q.length) startPh(q, p, true); };
$('hAgain').onclick = () => { $('phDone').hidden = true; $('phSetup').hidden = false; fillGroups(); };
document.addEventListener('keydown', e => {
  if($('phRun').hidden || $('tab-phon').hidden || e.target.matches('input,textarea,select')) return;
  if(/^[1-4]$/.test(e.key) && +e.key <= (H.opts||[]).length) pickH(+e.key-1);
  else if(e.key==='Enter' && H.answered && document.activeElement !== $('hNext')) $('hNext').click();
});
