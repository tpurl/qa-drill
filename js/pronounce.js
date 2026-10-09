// Q&A Drill: Pronounce tab
// ---------- pronunciation ----------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let P = null, rec = null;
const plain = t => t.toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9' ]+/g,' ').replace(/\s+/g,' ').trim();
function stopListening(){ if(rec){ try{ rec.abort(); }catch(e){} rec = null; } const m = $('pMic'); if(m){ m.classList.remove('on'); m.querySelector('span').textContent = 'Say it'; } }
function startSay(order, pool, full){
  timerStart('say', full);
  P = { order: shuffle(order), pool, i:0, got:0, missed:[], tries:0, ok:false };
  $('saySetup').hidden = true; $('sayDone').hidden = true; $('sayRun').hidden = false;
  $('pMic').hidden = !SR; $('pHear').hidden = !canSpeak; $('pSlow').hidden = !canSpeak;
  showP();
}
function showP(){
  stopListening();
  const it = P.order[P.i]; P.tries = 0; P.ok = false;
  const sy = sylOf(it);
  const pp = it.noPh ? [] : phParts(it);
  const shown = it.id.endsWith(':q') ? cased(it.q) : it.q;
  $('pWord').innerHTML = markWord(shown, pp);
  $('pTip').textContent = it.tip || ''; $('pTip').hidden = !it.tip;
  const need = SR && needsCapSaid(it);
  $('pSayHint').hidden = !need;
  if(need) $('pSayHint').innerHTML = 'Say: <strong>' + esc(cased(it.q)) + ', ' + capLetters(it.q).map(c => 'uppercase ' + c).join(', ') + '</strong>';
  $('pPh').innerHTML = phListHtml(it.q, pp);
  $('pSyl').innerHTML = showSyl(sy.text) + (sy.guess ? ' <span class="guess">(best guess)</span>' : '');
  $('pSnd').innerHTML = it.snd ? showSnd(it.snd) : '';
  $('pSndRow').hidden = !it.snd || !$('showSnd').checked;
  $('pDef').textContent = it.a;
  $('pFeedback').textContent = ''; $('pFeedback').className = 'feedback';
  $('pPos').textContent = 'Word ' + (P.i+1) + ' of ' + P.order.length;
  $('pScore').textContent = SR ? P.got + ' said correctly' : '';
  $('pBar').style.width = (P.i / P.order.length * 100) + '%';
  $('pNext').textContent = P.i === P.order.length-1 ? 'See results' : 'Next word';
  say(it.id.endsWith(':q') ? withCap(it.q) : [it.q], 0.9);
}
$('pHear').onclick = () => { const it = P.order[P.i]; say(it.id.endsWith(':q') ? withCap(it.q) : [it.q], 0.9); };
$('pSlow').onclick = () => sayParts(P.order[P.i]);
$('pMic').onclick = () => {
  if(!SR || !P) return;
  if(rec){ stopListening(); return; }
  if(canSpeak) speechSynthesis.cancel();
  const it = P.order[P.i], target = plain(it.q);
  rec = new SR(); rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 5;
  const btn = $('pMic'); btn.classList.add('on'); btn.querySelector('span').textContent = 'Listening…';
  $('pFeedback').textContent = 'Say the word now.'; $('pFeedback').className = 'feedback';
  let heard = false;
  rec.onresult = e => {
    heard = true;
    const alts = [...e.results[0]].map(a => plain(a.transcript));
    const squash = t => t.replace(/\bst\b/g,'saint').replace(/\bmt\b/g,'mount').replace(/[\s']/g,'');
    const tq = squash(target);
    const hit = alts.some(a => a === target || (' ' + a + ' ').includes(' ' + target + ' ') || squash(a).includes(tq));
    P.tries++;
    let capOk = true, capMsg = '';
    if(hit && needsCapSaid(it)){
      const want = capLetters(it.q);
      const said = alts.map(heardUppercase);
      capOk = said.some(h => h.length >= want.length && want.every((L,i) => letterMatches(h[i], L)));
      if(!capOk){
        const anyUpper = said.some(h => h.length);
        const phrase = cased(it.q) + ', ' + want.map(c => 'uppercase ' + c).join(', ');
        capMsg = anyUpper
          ? 'I heard the word and "uppercase," but not the letter ' + want.join(', ') + '. Try again: "' + phrase + '."'
          : 'Good, that\'s the word. Now say the uppercase letter too: "' + phrase + '."';
      }
    }
    if(hit && !capOk){
      $('pFeedback').textContent = capMsg; $('pFeedback').className = 'feedback bad';
    } else if(hit){
      if(!P.ok){ P.ok = true; P.got++; }
      $('pFeedback').textContent = needsCapSaid(it) ? 'Nice. That was "' + cased(it.q) + '" with the uppercase ' + capLetters(it.q).join(', ') + '.' : 'Nice. That sounded like "' + (it.id.endsWith(':q') ? cased(it.q) : it.q) + '".'; $('pFeedback').className = 'feedback ok';
    } else {
      $('pFeedback').textContent = 'I heard "' + (alts[0] || '…') + '". Try "Slowly, by syllable", then say it again.'; $('pFeedback').className = 'feedback bad';
    }
    $('pScore').textContent = P.got + ' said correctly';
  };
  rec.onerror = e => {
    heard = true;
    const msg = { 'not-allowed': isFile ? 'Chrome blocks the microphone for pages opened as a file. Double-click Start Q&A Drill in the same folder instead.' : 'The microphone is blocked. Allow microphone access for this page in Chrome, then try again.',
      'service-not-allowed':'The microphone is blocked. Allow microphone access for this page in Chrome, then try again.',
      'no-speech':'I didn\'t hear anything. Tap Say it and speak right away.',
      'audio-capture':'No microphone was found.',
      'network':'Speech checking needs an internet connection.' }[e.error];
    if(e.error !== 'aborted'){ $('pFeedback').textContent = msg || 'Something went wrong listening. Try again.'; $('pFeedback').className = 'feedback bad'; }
  };
  rec.onend = () => { if(!heard){ $('pFeedback').textContent = 'I didn\'t catch that. Tap Say it and try again.'; $('pFeedback').className = 'feedback bad'; } rec = null; btn.classList.remove('on'); btn.querySelector('span').textContent = 'Say it'; };
  try{ rec.start(); }catch(err){ stopListening(); }
};
$('pNext').onclick = () => {
  if(SR && !P.ok) P.missed.push(P.order[P.i]);
  if(P.i < P.order.length-1){ P.i++; showP(); } else finishSay();
};
$('pQuit').onclick = () => finishSay(true);
function finishSay(early){
  stopListening(); if(canSpeak) speechSynthesis.cancel();
  const done = early ? P.i + (P.ok?1:0) : P.order.length;
  $('sayRun').hidden = true; $('sayDone').hidden = false;
  if(SR){
    $('pdScore').textContent = (done ? Math.round(P.got/done*100) : 0) + '%';
    $('pdLine').textContent = P.got + ' of ' + done + ' said correctly' + (early && done < P.order.length ? ' (ended early)' : '') + '.';
  } else { $('pdScore').textContent = done; $('pdLine').textContent = 'words practiced.'; }
  $('pMissedWrap').hidden = !P.missed.length; $('pRetryMissed').hidden = !P.missed.length;
  $('pMissedList').innerHTML = P.missed.map(m => `<li><strong>${esc(m.id.endsWith(':q') ? cased(m.q) : m.q)}</strong><br><span class="a">${showSyl(sylOf(m).text)}${m.snd ? '&nbsp;&nbsp;' + showSnd(m.snd) : ''}</span></li>`).join('');
  timerFinish('say', SR ? P.missed.length : 0, !early || done >= P.order.length, 'sayTimes');
  stepLabel($('sayStepUp'), 'Practice again');
}
const sayTerms = () => buildTerms(poolNow(), $('sayCols').value);
$('startSay').onclick = () => { if(items.length){ const t = sayTerms(); startSay(t, t, true); } };
$('sayCols').onchange = () => { curSet().sayCols = $('sayCols').value; save(); };
$('pRetryMissed').onclick = () => startSay(P.missed, P.pool);
$('sayStepUp').onclick = () => { const n = nextN(); if(!n) return; setRange(n); const t = sayTerms(); startSay(t, t, true); };
$('pAgain').onclick = () => { $('sayDone').hidden = true; $('saySetup').hidden = false; };
$('showSnd').onchange = () => { if(P && !$('sayRun').hidden) $('pSndRow').hidden = !P.order[P.i].snd || !$('showSnd').checked; };
$('noMic').hidden = !!SR;
const isFile = location.protocol === 'file:';
$('fileMic').hidden = !(SR && isFile);
