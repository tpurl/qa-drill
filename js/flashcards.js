// Q&A Drill: Flashcards tab (add-on loaded from start.js)
// Say the answer out loud before flipping, then mark Knew it / Missed it. Missed cards come back until all are known,
// and cards he misses often come up first next time.
(function(){
  document.head.insertAdjacentHTML('beforeend', `<style>
    .fcCard{background:var(--card);border:2px solid var(--rule);border-radius:14px;box-shadow:var(--shadow);min-height:220px;padding:22px 18px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:10px;margin:6px 0 14px}
    .fcCard.back{border-color:var(--accent)}
    .fcSide{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700}
    .fcWord{font-family:"Bricolage Grotesque",system-ui,sans-serif;font-size:clamp(34px,10vw,52px);font-weight:700;line-height:1.1}
    .fcDef{font-size:clamp(20px,5.4vw,26px);font-weight:700;line-height:1.35}
    .fcCard .pron{margin:0}
    .fcPiles{display:flex;gap:16px;color:var(--muted);font-size:15px;margin-bottom:8px;flex-wrap:wrap}
    .fcPiles b{color:var(--ink)}
  </style>`);
  const nav = document.querySelector('nav.tabs');
  nav.insertAdjacentHTML('beforeend', '<button role="tab" data-tab="flash" aria-selected="false">Flashcards</button>');
  document.getElementById('tab-match').insertAdjacentHTML('afterend', `
  <section id="tab-flash" hidden>
    <div class="panel" id="fcSetup">
      <h2 style="font-size:24px;margin-bottom:12px">Flashcards</h2>
      <p class="hint">Like paper flash cards: say the answer out loud <strong>before</strong> you flip. Then be honest with Knew it or Missed it. Missed cards come back until the pile is empty, and cards he misses often come up first next time.</p>
      <div class="opts">
        <label>Use <select class="range" id="fcRange"></select></label>
        <label>Side up first
          <select id="fcSide"><option value="def">definition (say the word), like the test</option><option value="word">word (say what it means)</option></select>
        </label>
      </div>
      <button class="btn" id="fcStart">Start flashcards</button>
    </div>
    <div class="panel" id="fcRun" hidden>
      <div class="fcPiles"><span>Left <b id="fcLeft"></b></span><span>Knew it <b id="fcKnew">0</b></span><span>Missed pile <b id="fcMiss">0</b></span></div>
      <div class="fcCard" id="fcCard"></div>
      <div class="row" id="fcFlipRow"><button class="btn" id="fcFlip">Flip the card</button><button class="sayBtn small" id="fcHear" hidden>Hear it</button></div>
      <div class="row" id="fcMarkRow" hidden>
        <button class="btn" id="fcKnewBtn">Knew it</button>
        <button class="btn quiet" id="fcMissBtn">Missed it</button>
        <button class="sayBtn small" id="fcHear2">Hear it</button>
        <button class="sayBtn small" id="fcSlow">Slowly</button>
      </div>
      <div class="row" style="margin-top:14px"><button class="btn quiet" id="fcQuit">End</button></div>
    </div>
    <div class="panel" id="fcDone" hidden>
      <div class="big" id="fcScore"></div>
      <p id="fcLine" style="margin:8px 0 16px"></p>
      <div class="row" style="margin-bottom:12px"><button class="btn" id="fcAgain">Go again</button><button class="btn ghost" id="fcBack">Change settings</button></div>
      <div id="fcHardWrap"><h3 style="font-size:19px;margin:12px 0 8px">Needed more than one try</h3><ul class="missed" id="fcHard"></ul></div>
    </div>
  </section>`);
  const myBtn = nav.querySelector('[data-tab="flash"]');
  const baseShowTabFc = showTab;
  showTab = function(name){
    if(name === 'flash'){
      baseShowTabFc('edit'); $('tab-edit').hidden = true; $('tab-flash').hidden = false;
      nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b === myBtn));
    } else { baseShowTabFc(name); $('tab-flash').hidden = true; myBtn.setAttribute('aria-selected', 'false'); }
  };
  myBtn.onclick = () => showTab('flash');
  $('fcRange').onchange = () => setRange($('fcRange').value === 'all' ? 'all' : +$('fcRange').value);

  // remembers, per list and word, how often each card was known or missed
  const statKey = it => curSet().id + '|' + it.q.toLowerCase();
  const stats = () => (data.cardStats = data.cardStats || {});
  const weight = it => { const s = stats()[statKey(it)]; return s ? (s.miss + 1) / (s.knew + 1) : 1; };
  let C = null;
  function start(){
    const pool = poolNow();
    if(!pool.length) return;
    // shuffle, then put the cards he misses most near the front
    const order = shuffle(pool).sort((a, b) => weight(b) - weight(a) + (Math.random() - .5) * .3);
    C = { side: $('fcSide').value, queue: order, total: order.length, knew: 0, missPile: 0, firstTry: 0, tries: {}, flipped: false };
    $('fcSetup').hidden = true; $('fcDone').hidden = true; $('fcRun').hidden = false;
    show();
  }
  const wordOf = it => cased(it.q.trim().replace(CAP_RE, '$1'));
  function front(it){
    if(C.side === 'def') return `<div class="fcSide">Definition</div><div class="fcDef">${esc(defOf(it))}</div><p class="hint" style="margin:6px 0 0">Say the word out loud, then flip.</p>`;
    return `<div class="fcSide">Word</div><div class="fcWord">${esc(wordOf(it))}</div><p class="hint" style="margin:6px 0 0">Say what it means out loud, then flip.</p>`;
  }
  function back(it){
    const sy = sylOf(it), hook = hookOf(it);
    return `<div class="fcSide">${C.side === 'def' ? 'Word' : 'Definition'}</div>` +
      (C.side === 'def' ? `<div class="fcWord">${esc(wordOf(it))}</div>` : `<div class="fcDef">${esc(it.a)}</div><div class="fcWord" style="font-size:28px">${esc(wordOf(it))}</div>`) +
      `<p class="pron"><span class="syl">${showSyl(sy.text)}</span>${it.snd ? '&nbsp;&nbsp;<span class="snd">' + showSnd(it.snd) + '</span>' : ''}</p>` +
      (C.side === 'def' ? `<p class="hint" style="margin:0">${esc(it.a)}</p>` : '') +
      (hook ? `<p class="hint" style="margin:0">💡 ${esc(hook)}</p>` : '');
  }
  function show(){
    const it = C.queue[0];
    C.flipped = false;
    $('fcCard').className = 'fcCard'; $('fcCard').innerHTML = front(it);
    $('fcFlipRow').hidden = false; $('fcMarkRow').hidden = true;
    $('fcHear').hidden = !(canSpeak && C.side === 'word');
    $('fcLeft').textContent = C.queue.length; $('fcKnew').textContent = C.knew; $('fcMiss').textContent = C.missPile;
    $('fcFlip').focus();
  }
  function flip(){
    if(C.flipped) return;
    C.flipped = true;
    const it = C.queue[0];
    $('fcCard').className = 'fcCard back'; $('fcCard').innerHTML = back(it);
    $('fcFlipRow').hidden = true; $('fcMarkRow').hidden = false;
    $('fcHear2').hidden = !canSpeak; $('fcSlow').hidden = !canSpeak;
    if(C.side === 'def') say([it.q], 0.9);
  }
  function mark(knew){
    const it = C.queue.shift(), k = statKey(it), s = stats()[k] = stats()[k] || { knew:0, miss:0 };
    C.tries[k] = (C.tries[k] || 0) + 1;
    if(knew){
      s.knew++; C.knew++;
      if(C.tries[k] === 1) C.firstTry++;
      if(C.tries[k] > 1) C.missPile = Math.max(0, C.missPile - 1);
    } else {
      s.miss++;
      if(C.tries[k] === 1) C.missPile++;
      C.queue.push(it);                    // back of the pile until he knows it
      (C.hard = C.hard || new Map()).set(k, it);
    }
    s.last = Date.now(); save();
    if(C.queue.length) show(); else finish();
  }
  function finish(early){
    if(canSpeak) speechSynthesis.cancel();
    $('fcRun').hidden = true; $('fcDone').hidden = false;
    const seen = Object.keys(C.tries).length;
    $('fcScore').textContent = (seen ? Math.round(C.firstTry / seen * 100) : 0) + '%';
    $('fcLine').textContent = C.firstTry + ' of ' + seen + ' known on the first try' + (early && C.queue.length ? ' (ended early)' : '') + '.';
    const hard = C.hard ? [...C.hard.values()] : [];
    $('fcHardWrap').hidden = !hard.length;
    $('fcHard').innerHTML = hard.map(it => `<li><strong>${esc(wordOf(it))}</strong><br><span class="a">${esc(it.a)}</span></li>`).join('');
  }
  $('fcStart').onclick = start; $('fcAgain').onclick = start;
  $('fcBack').onclick = () => { $('fcDone').hidden = true; $('fcSetup').hidden = false; };
  $('fcFlip').onclick = flip;
  $('fcCard').onclick = () => { if(!C.flipped) flip(); };
  $('fcKnewBtn').onclick = () => mark(true);
  $('fcMissBtn').onclick = () => mark(false);
  $('fcHear').onclick = () => say([C.queue[0].q], 0.9);
  $('fcHear2').onclick = () => say([C.queue[0].q], 0.9);
  $('fcSlow').onclick = () => sayParts(C.queue[0]);
  $('fcQuit').onclick = () => finish(true);
  document.addEventListener('keydown', e => {
    if($('tab-flash').hidden || $('fcRun').hidden || e.target.matches('input,textarea,select')) return;
    if(e.key === ' ' || e.key === 'Enter'){ if(!C.flipped){ e.preventDefault(); flip(); } }
    else if(C.flipped && (e.key === 'k' || e.key === '1')) mark(true);
    else if(C.flipped && (e.key === 'm' || e.key === '2')) mark(false);
  });
  (window.LOADED_EXTRA = window.LOADED_EXTRA || []).push('js/flashcards.js');
})();
