// Q&A Drill: Spelling tab
// ---------- spelling ----------
let S = null;
const tidy = s => s.trim().replace(/\s+/g,' ').replace(/[’‘]/g,"'");
const norm = s => tidy(s).toLowerCase();
const capsMode = () => (curSet() && curSet().caps) || 'none';
const capFirst = t => t.charAt(0).toUpperCase() + t.slice(1);
const cased = t => capsMode() === 'first' ? capFirst(t) : t;
function capLetters(word){
  if(capsMode() === 'none') return [];
  const w = cased(word.trim());
  const caps = capsMode() === 'first' ? [w.charAt(0)] : (w.match(/[A-Z]/g) || []);
  return caps.filter(c => /[A-Z]/.test(c));
}
function capPhrase(word){
  if(curSet().capSay !== true) return null;
  const caps = capLetters(word);
  return caps.length ? caps.map(c => 'uppercase ' + c + '.').join(' ') : null;
}
// how speech recognition tends to write spoken letter names
const LETTER_SOUNDS = {a:['a','ay','eh','hey','8'],b:['b','be','bee'],c:['c','see','sea','si'],d:['d','dee','the'],e:['e','ee'],f:['f','ef','eff'],g:['g','gee','ji'],h:['h','aitch','age','each'],i:['i','eye','aye'],j:['j','jay'],k:['k','kay','okay','ok','cay'],l:['l','el','elle','ell'],m:['m','em','um'],n:['n','en','and','in'],o:['o','oh','owe','0'],p:['p','pee','pea'],q:['q','queue','cue','kyu'],r:['r','are','our','ar'],s:['s','es','ess','yes'],t:['t','tea','tee','ti'],u:['u','you','yu'],v:['v','vee','we'],w:['w','double'],x:['x','ex','eggs'],y:['y','why','wye'],z:['z','zee','zed','see']};
// returns the letters heard after "uppercase" (also accepts "upper case" and "capital")
function heardUppercase(alt){
  const toks = alt.replace(/\bupper case\b/g,'uppercase').replace(/\bcapital\b/g,'uppercase').split(' ');
  const out = [];
  toks.forEach((t,i) => { if(t === 'uppercase') out.push(toks[i+1] || ''); });
  return out;
}
const letterMatches = (heard, L) => (LETTER_SOUNDS[L.toLowerCase()] || [L.toLowerCase()]).includes(heard);
const needsCapSaid = it => it.id.endsWith(':q') && $('capReq').checked && capLetters(it.q).length > 0;
$('capReq').onchange = () => { curSet().capReq = $('capReq').checked; save(); };
const withCap = (word, extra) => [word, capPhrase(word)].concat(extra || []).filter(Boolean);
function syncCaps(){
  document.querySelectorAll('.capsSel').forEach(x => x.value = capsMode());
  document.querySelectorAll('.capSay').forEach(x => x.checked = curSet().capSay === true);
  $('capReq').checked = curSet().capReq === true;
}
document.querySelectorAll('.capsSel').forEach(x => x.onchange = () => { curSet().caps = x.value; save(); syncCaps(); });
document.querySelectorAll('.capSay').forEach(x => x.onchange = () => { curSet().capSay = x.checked; save(); syncCaps(); });
const expected = it => capsMode() === 'first' ? it.q.charAt(0).toUpperCase() + it.q.slice(1) : it.q;
const spelledRight = (typed, it) => capsMode() === 'none' ? norm(typed) === norm(it.q) : tidy(typed) === tidy(expected(it));

function startSpell(order, pool, full){
  timerStart('spell', full);
  $('sInput').after($('pad'));
  S = { order: shuffle(order), pool, i:0, score:0, missed:[], tries:0, done:false };
  $('spellSetup').hidden = true; $('spellDone').hidden = true; $('spellRun').hidden = false;
  $('noVoice').hidden = canSpeak;
  $('sayWord').hidden = !canSpeak; $('sayDef').hidden = !canSpeak;
  showS();
}
function showS(){
  const it = S.order[S.i];
  S.tries = 0; S.done = false;
  const inp = $('sInput'); inp.value=''; inp.className='spell'; inp.disabled=false;
  inp.name = 'sp-' + uid(); // fresh name each word so Chrome has no history to suggest from
  $('sDef').textContent = it.a; $('sDef').hidden = canSpeak; $('showDef').hidden = !canSpeak;
  $('sFeedback').textContent=''; $('sFeedback').className='feedback';
  $('sCheck').hidden=false; $('sNext').hidden=true; $('sPh').hidden = true; setShift(false);
  $('sNext').textContent = S.i === S.order.length-1 ? 'See results' : 'Next word';
  $('sPos').textContent = 'Word ' + (S.i+1) + ' of ' + S.order.length;
  $('sScore').textContent = S.score + ' correct';
  $('sBar').style.width = (S.i / S.order.length * 100) + '%';
  sayCurrent(true);
  focusInput();
}
function sayCurrent(withDef){
  const it = S.order[S.i];
  const parts = withCap(it.q);
  if(withDef && $('readDef').checked) parts.push(it.a, it.q);
  say(parts);
}
$('sayWord').onclick = () => { sayCurrent(false); focusInput(); };
$('saySlowS').onclick = () => { sayParts(S.order[S.i]); focusInput(); };
$('saySlowS').hidden = !canSpeak;
$('sayDef').onclick = () => { say([S.order[S.i].a]); focusInput(); };
$('showDef').onclick = () => { $('sDef').hidden = false; $('showDef').hidden = true; focusInput(); };
function checkS(){
  if(!S || S.done) return;
  const it = S.order[S.i], inp = $('sInput');
  if(!inp.value.trim()){ focusInput(); return; }
  S.tries++;
  const caseOnly = !spelledRight(inp.value, it) && norm(inp.value) === norm(it.q);
  if(spelledRight(inp.value, it)){
    S.done = true; S.score++;
    inp.className='spell ok'; inp.disabled = true;
    $('sFeedback').textContent = S.tries === 1 ? 'Correct.' : 'Correct on the second try.'; $('sFeedback').className='feedback ok';
    endWord();
  } else if(S.tries < 2){
    inp.className='spell bad';
    $('sFeedback').textContent = caseOnly
      ? (capsMode() === 'first' ? 'Almost. The letters are right, but it needs to start with an uppercase letter.' : 'Almost. The letters are right, but check your uppercase letters.')
      : 'Not quite. Listen again and try once more.';
    $('sFeedback').className='feedback bad';
    sayCurrent(false); if(padOn) inp.value=''; else inp.select();
  } else {
    S.done = true; S.missed.push({ it, typed: inp.value.trim(), want: expected(it) });
    inp.className='spell bad'; inp.disabled = true;
    $('sFeedback').className='feedback bad';
    $('sFeedback').innerHTML = 'The correct spelling is:<div class="reveal">' + esc(expected(it)) + '</div>';
    say([it.q]);
    endWord();
  }
  $('sScore').textContent = S.score + ' correct';
}
function showSpellPh(){
  const it = S.order[S.i], parts = phParts(it);
  if(!parts.length){ $('sPh').hidden = true; return; }
  $('sPh').innerHTML = '<div class="phWord">' + markWord(expected(it), parts) + '</div><ul class="phList">' + phListHtml(it.q, parts) + '</ul>';
  $('sPh').hidden = false;
}
function endWord(){ showSpellPh(); $('sCheck').hidden = true; $('sNext').hidden = false; $('sNext').focus(); }
$('sCheck').onclick = checkS;
$('sInput').addEventListener('keydown', e => { if(!padOn && e.key==='Enter'){ e.preventDefault(); checkS(); } });
$('sNext').onclick = () => { if(S.i < S.order.length-1){ S.i++; showS(); } else finishSpell(); };
$('sQuit').onclick = () => finishSpell(true);
function finishSpell(early){
  if(canSpeak) speechSynthesis.cancel();
  const done = early ? S.i + (S.done?1:0) : S.order.length;
  $('spellRun').hidden = true; $('spellDone').hidden = false;
  $('sdScore').textContent = (done ? Math.round(S.score/done*100) : 0) + '%';
  $('sdLine').textContent = S.score + ' of ' + done + ' spelled correctly' + (early && done < S.order.length ? ' (ended early)' : '') + '.';
  $('sMissedWrap').hidden = !S.missed.length; $('sRetryMissed').hidden = !S.missed.length;
  $('sMissedList').innerHTML = S.missed.map(m=>`<li><strong>${esc(m.want || m.it.q)}</strong><br><span class="a">You typed: ${esc(m.typed)}</span></li>`).join('');
  timerFinish('spell', done - S.score, !early || done >= S.order.length, 'spellTimes');
  stepLabel($('spellStepUp'), 'Spell again');
}
$('startSpell').onclick = () => { if(items.length){ const p = poolNow(); startSpell(p, p, true); } };
$('sRetryMissed').onclick = () => startSpell(S.missed.map(m=>m.it), S.pool);
$('spellStepUp').onclick = () => { const n = nextN(); if(!n) return; setRange(n); const p = poolNow(); startSpell(p, p, true); };
$('sAgain').onclick = () => { $('spellDone').hidden = true; $('spellSetup').hidden = false; };
