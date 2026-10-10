// Q&A Drill: Multiple choice tab
// ---------- quiz ----------
let Q = null;
function startQuiz(order, pool, full){
  timerStart('quiz', full);
  const n = +$('nChoices').value, dir = $('direction').value;
  Q = { order: shuffle(order), pool, i:0, score:0, missed:[], n, dir, answered:false };
  $('quizSetup').hidden = true; $('quizDone').hidden = true; $('quizRun').hidden = false;
  showQ();
}
function showQ(){
  const it = Q.order[Q.i];
  // definitions are shown in rotating wordings, since tests often reword them
  const sentence = Q.dir === 'sent' ? sentenceOf(it) : null;
  const promptText = Q.dir==='qa' ? it.q : sentence ? sentence.replace('___', '_____') : defOf(it);
  const right = Q.dir==='qa' ? defOf(it) : it.q;
  const field = Q.dir==='qa' ? 'a' : 'q';
  const seen = new Set([right.toLowerCase()]);
  const wrong = [];
  for(const o of [...shuffle(Q.pool), ...shuffle(items)]){
    const v = field === 'a' ? defOf(o) : o.q;
    if(o === it || seen.has(v.toLowerCase())) continue;
    seen.add(v.toLowerCase()); wrong.push(v); if(wrong.length >= Q.n-1) break;
  }
  Q.opts = shuffle([right, ...wrong]); Q.right = right; Q.answered=false;
  $('qPrompt').textContent = Q.dir==='qa' ? cased(promptText) : promptText;
  $('qChoices').innerHTML = Q.opts.map((o,k)=>`<button class="choice" data-k="${k}"><span class="k">${k+1}</span><span>${esc(Q.dir!=='qa' ? cased(o) : o)}</span></button>`).join('');
  $('qPos').textContent = 'Question ' + (Q.i+1) + ' of ' + Q.order.length;
  $('qScore').textContent = Q.score + ' correct';
  $('qBar').style.width = (Q.i / Q.order.length * 100) + '%';
  $('qFeedback').textContent=''; $('qFeedback').className='feedback';
  $('qNext').disabled = true;
  $('qNext').textContent = Q.i === Q.order.length-1 ? 'See results' : 'Next question';
}
function pick(k){
  if(!Q || Q.answered) return;
  Q.answered = true;
  const btns = [...$('qChoices').children];
  const chosen = Q.opts[k];
  btns.forEach((b,j)=>{ b.disabled=true; if(Q.opts[j]===Q.right) b.classList.add('right'); });
  const hook = hookOf(Q.order[Q.i]);
  const hookHtml = hook ? '<div class="hint" style="margin:6px 0 0;font-weight:400">💡 ' + esc(hook) + '</div>' : '';
  if(chosen === Q.right){ Q.score++; $('qFeedback').innerHTML = 'Correct.' + hookHtml; $('qFeedback').className='feedback ok'; }
  else { btns[k].classList.add('wrong'); Q.missed.push(Q.order[Q.i]); $('qFeedback').innerHTML = esc('Not quite. The answer is: ' + (Q.dir!=='qa' ? cased(Q.right) : Q.right)) + hookHtml; $('qFeedback').className='feedback bad'; }
  $('qScore').textContent = Q.score + ' correct';
  $('qNext').disabled = false; $('qNext').focus();
}
$('qChoices').addEventListener('click', e => { const b = e.target.closest('.choice'); if(b) pick(+b.dataset.k); });
$('qNext').onclick = () => { if(Q.i < Q.order.length-1){ Q.i++; showQ(); } else finishQuiz(); };
$('qQuit').onclick = () => finishQuiz(true);
function finishQuiz(early){
  const done = early ? Q.i + (Q.answered?1:0) : Q.order.length;
  $('quizRun').hidden = true; $('quizDone').hidden = false;
  $('dScore').textContent = (done ? Math.round(Q.score/done*100) : 0) + '%';
  $('dLine').textContent = Q.score + ' of ' + done + ' correct' + (early && done < Q.order.length ? ' (ended early)' : '') + '.';
  $('missedWrap').hidden = !Q.missed.length; $('retryMissed').hidden = !Q.missed.length;
  $('missedList').innerHTML = Q.missed.map(m=>`<li><strong>${esc(cased(m.q))}</strong><br><span class="a">${esc(m.a)}</span></li>`).join('');
  timerFinish('quiz', Q.missed.length, !early || done >= Q.order.length, 'quizTimes');
  stepLabel($('quizStepUp'), 'Quiz again');
}
$('startQuiz').onclick = () => { if(items.length>=2){ const p = poolNow(); startQuiz(p, p, true); } };
$('retryMissed').onclick = () => startQuiz(Q.missed, Q.pool);
$('quizStepUp').onclick = () => { const n = nextN(); if(!n) return; setRange(n); const p = poolNow(); startQuiz(p, p, true); };
$('retryAll').onclick = () => { $('quizDone').hidden = true; $('quizSetup').hidden = false; };
document.addEventListener('keydown', e => {
  if($('quizRun').hidden || $('tab-quiz').hidden || e.target.matches('input,textarea,select')) return;
  if(/^[1-6]$/.test(e.key) && +e.key <= (Q.opts||[]).length) pick(+e.key-1);
  else if(e.key==='Enter' && Q.answered && document.activeElement !== $('qNext')) $('qNext').click();
});
