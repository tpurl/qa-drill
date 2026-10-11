// Q&A Drill: Fractions tab (equivalent fractions, simplifying step by step, word problems, mixed check)
// Self-contained add-on: it adds its own tab, styles and timer, and hooks into the app's tab switching.
(function(){
  const MODES = {
    equiv:    'Equivalent fractions',
    simplify: 'Simplify step by step',
    word:     'Word problems',
    compare:  'Compare (<, >, =)',
    order:    'Put in order',
    mixed:    'Mixed (all kinds)'
  };
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const lcm = (a, b) => a / gcd(a, b) * b;
  const rint = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const pickF = a => a[Math.floor(Math.random() * a.length)];
  const fr = (n, d) => `<span class="fr"><span>${n}</span><span>${d}</span></span>`;

  // ---------- styles ----------
  document.head.insertAdjacentHTML('beforeend', `<style>
    .fr{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.1;font-variant-numeric:tabular-nums;margin:0 .15em}
    .fr>span{padding:0 .2em}
    .fr>span:first-child{border-bottom:.09em solid currentColor}
    .xBig{font-family:"Bricolage Grotesque",system-ui,sans-serif;font-size:clamp(34px,9vw,48px);font-weight:700;display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:6px 0 10px}
    .xEq{display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;margin:6px 0 4px}
    .xEq figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:6px}
    .xEq .op{font-family:"Bricolage Grotesque",system-ui,sans-serif;font-size:34px;font-weight:700}
    .xEq figcaption{font-family:"Bricolage Grotesque",system-ui,sans-serif;font-size:34px;font-weight:700}
    .xOps{display:flex;flex-direction:column;justify-content:space-around;align-self:flex-end;height:80px;margin-bottom:4px;font-weight:700;color:var(--accent);font-size:18px}
    .xQ{font-size:19px;font-weight:700;margin:12px 0 8px}
    .xBtns{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 6px}
    .xBtns .btn{min-width:64px;font-size:19px}
    .xIn{width:84px!important;font-family:"Bricolage Grotesque",system-ui,sans-serif;font-size:28px;font-weight:700;text-align:center;padding:6px 8px}
    .xFrIn{display:inline-flex;flex-direction:column;align-items:center;gap:6px}
    .xFrIn hr{width:96px;border:0;border-top:3px solid var(--ink);margin:0}
    .xSteps{color:var(--muted);font-size:17px;margin:6px 0 0;display:flex;flex-wrap:wrap;align-items:center;gap:6px}
    .xSteps b{color:var(--accent)}
    .xWord{font-size:19px;line-height:1.5;margin:4px 0 6px}
    .xWord mark{background:var(--sel);color:inherit;border-radius:3px;padding:0 3px}
    .xSym{display:inline-grid;place-items:center;min-width:56px;height:56px;border:3px dashed var(--rule);border-radius:12px;font-size:36px;color:var(--accent)}
    .xSym.set{border-style:solid;border-color:var(--accent)}
    .xSymBtns .btn{min-width:72px;font-size:28px;padding:6px 14px}
    .xChips{display:flex;gap:10px;flex-wrap:wrap;margin:6px 0 10px}
    .xChip{appearance:none;background:var(--card);border:2px solid var(--rule);border-radius:12px;padding:8px 14px;font-family:"Bricolage Grotesque",system-ui,sans-serif;font-size:28px;font-weight:700;cursor:pointer;color:var(--ink);box-shadow:var(--shadow)}
    .xChip small{display:block;font-size:14px;color:var(--muted);font-weight:700}
    .xChip.used{opacity:.3}
    .xSlots{display:flex;gap:8px;align-items:center;flex-wrap:wrap;min-height:76px;padding:8px;border:2px dashed var(--rule);border-radius:12px;margin:4px 0 6px}
    .xSlots .xChip{box-shadow:none;border-color:var(--accent)}
    .xSlots .arrow{color:var(--muted);font-size:22px;font-weight:700}
    .xConv{display:grid;gap:8px;margin:6px 0}
    .xConv .row1{display:flex;align-items:center;gap:10px;font-family:"Bricolage Grotesque",system-ui,sans-serif;font-size:28px;font-weight:700}
    .xConv .op2{color:var(--accent);font-size:16px}
  </style>`);

  // ---------- tab and markup ----------
  const nav = document.querySelector('nav.tabs');
  nav.insertAdjacentHTML('beforeend', '<button role="tab" data-tab="frac" aria-selected="false">Fractions</button>');
  document.getElementById('tab-match').insertAdjacentHTML('afterend', `
  <section id="tab-frac" hidden>
    <div class="panel" id="fracSetup">
      <h2 style="font-size:24px;margin-bottom:12px">Fractions</h2>
      <p class="hint">The big rule: whatever you do to the bottom, do the same to the top. Choose whether to show the steps every time, never, or only on the problems he gets wrong. New problems are made every time.</p>
      <div class="opts">
        <label>Practice <select id="xMode">${Object.entries(MODES).map(([k,v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
        <label>Steps <select id="xSteps"><option value="always">show the steps</option><option value="missed">only on ones he misses</option><option value="never">no steps (like a worksheet)</option></select></label>
        <label>Problems <select id="xCount"><option>5</option><option selected>8</option><option>10</option><option>12</option></select></label>
      </div>
      <button class="btn" id="xStart">Start fractions</button>
      <p class="timeBest" id="fracSetupBest"></p>
    </div>

    <div class="panel" id="fracRun" hidden>
      <div class="progress"><span id="xBar"></span></div>
      <div class="meta"><span id="xPos"></span><span class="clock" id="xClock">0:00</span><span id="xScore"></span></div>
      <div id="xBody"></div>
      <div class="feedback" id="xFeedback" aria-live="polite"></div>
      <div class="row">
        <button class="btn" id="xCheck" hidden>Check</button>
        <button class="btn" id="xNext" hidden>Next problem</button>
        <button class="btn quiet" id="xQuit">End</button>
      </div>
    </div>

    <div class="panel" id="fracDone" hidden>
      <div class="big" id="xdScore"></div>
      <p id="xdLine" style="margin:8px 0 16px"></p>
      <div class="timeBox" id="fracTimes"></div>
      <div class="row" style="margin-bottom:12px">
        <button class="btn" id="xRetry">Retry missed</button>
        <button class="btn ghost" id="xAgain">New problems</button>
        <button class="btn ghost" id="xBack">Change settings</button>
      </div>
      <div id="xMissedWrap"><h3 style="font-size:19px;margin:12px 0 8px">Practice these</h3><ul class="missed" id="xMissedList"></ul></div>
    </div>
  </section>`);
  const myBtn = nav.querySelector('[data-tab="frac"]');

  // hook into tab switching and the timer / top-times system
  const baseShowTab = showTab;
  showTab = function(name){
    if(name === 'frac'){
      baseShowTab('edit');
      $('tab-edit').hidden = true; $('tab-frac').hidden = false;
      nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b === myBtn));
      if(data.fracSteps) $('xSteps').value = data.fracSteps;
      showSetupBest('frac');
    } else {
      baseShowTab(name);
      $('tab-frac').hidden = true; myBtn.setAttribute('aria-selected', 'false');
    }
  };
  myBtn.onclick = () => showTab('frac');
  CLOCK.frac = 'xClock';
  const baseRunKey = runKey, baseRangeLabel = rangeLabel;
  runKey = mode => mode === 'frac' ? 'frac|' + $('xMode').value + '|' + $('xSteps').value + '|' + $('xCount').value : baseRunKey(mode);
  rangeLabel = mode => mode === 'frac' ? $('xCount').value + ' problems (' + MODES[$('xMode').value].toLowerCase() + ')' : baseRangeLabel(mode);
  $('fracSetup').addEventListener('change', () => showSetupBest('frac'));

  // ---------- pie charts ----------
  function pie(n, d, size = 96){
    const c = size / 2, r = c - 3;
    let s = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">`;
    if(d <= 1) return s + `<circle cx="${c}" cy="${c}" r="${r}" fill="${n ? 'var(--accent)' : 'var(--card)'}" stroke="var(--ink)" stroke-width="1.2"/></svg>`;
    for(let i = 0; i < d; i++){
      const a0 = -Math.PI/2 + i * 2*Math.PI/d, a1 = a0 + 2*Math.PI/d;
      const p = (a) => (c + r*Math.cos(a)).toFixed(2) + ',' + (c + r*Math.sin(a)).toFixed(2);
      s += `<path d="M${c},${c} L${p(a0)} A${r},${r} 0 0 1 ${p(a1)} Z" fill="${i < n ? 'var(--accent)' : 'var(--card)'}" stroke="var(--ink)" stroke-width="1.2"/>`;
    }
    return s + '</svg>';
  }

  // ---------- problem makers ----------
  function makeEquiv(){
    for(;;){
      const b = pickF([2,3,4,6,8]), a = rint(1, b - 1), k = pickF([2,2,3,4]);
      if(b * k > 16 || gcd(a, b) !== 1 && Math.random() < 0.7) continue;
      const kind = pickF(['up','up','down','bottom']);
      return { type:'equiv', a, b, k, kind };
    }
  }
  function makeSimplify(maxD = 48){
    for(;;){
      const q = rint(2, 12), p = rint(1, q - 1);
      if(gcd(p, q) !== 1) continue;
      const g = pickF([2,2,3,3,4,4,5,6,7,8,9]);
      if(q * g > maxD || q * g < 6) continue;
      return { type:'simplify', n: p * g, d: q * g, p, q };
    }
  }
  const NAMES_X = ['Frank','Maya','Leo','Ava','Sam','Zoe','Kai','Nia'];
  const WORDS = [
    (n,d,w) => ({ text:`There are <mark>${d} students</mark> in ${w}'s class. <mark>${n}</mark> of them are buying lunch today.`, ask:'What fraction of the students are buying lunch?', part:'students buying lunch', whole:'students in the class' }),
    (n,d,w) => ({ text:`${w} has <mark>${d} marbles</mark>. <mark>${n}</mark> of them are blue.`, ask:'What fraction of the marbles are blue?', part:'blue marbles', whole:'marbles in all' }),
    (n,d,w) => ({ text:`A garden has <mark>${d} plants</mark>. <mark>${n}</mark> of them are tomato plants.`, ask:'What fraction of the plants are tomatoes?', part:'tomato plants', whole:'plants in all' }),
    (n,d,w) => ({ text:`${w}'s team has <mark>${d} players</mark>. <mark>${n}</mark> of them scored a goal this season.`, ask:'What fraction of the players scored?', part:'players who scored', whole:'players on the team' }),
    (n,d,w) => ({ text:`There are <mark>${d} books</mark> on the shelf. ${w} has read <mark>${n}</mark> of them.`, ask:'What fraction of the books has ' + w + ' read?', part:'books read', whole:'books on the shelf' }),
    (n,d,w) => ({ text:`A box holds <mark>${d} crayons</mark>. <mark>${n}</mark> of them are broken.`, ask:'What fraction of the crayons are broken?', part:'broken crayons', whole:'crayons in the box' })
  ];
  function makeWord(){
    const s = makeSimplify(40), w = pickF(NAMES_X);
    return Object.assign({ type:'word', name:w }, s, { type:'word' }, pickF(WORDS)(s.n, s.d, w));
  }
  function makeCompare(){
    const D = [2,3,4,5,6,8,10,12];
    for(;;){
      const r = Math.random();
      let a, b, c, d;
      if(r < .25){ b = d = pickF(D); a = rint(1, b - 1); c = rint(1, b - 1); if(a === c) continue; }
      else if(r < .45){ b = pickF(D); d = pickF(D); if(b === d) continue; a = c = rint(1, Math.min(b, d) - 1); }
      else if(r < .55){ const q = pickF([2,3,4,5,6]), p = rint(1, q - 1), k = pickF([2,3]); if(gcd(p, q) !== 1) continue; [a, b, c, d] = Math.random() < .5 ? [p, q, p*k, q*k] : [p*k, q*k, p, q]; }
      else { b = pickF(D); d = pickF(D); if(b === d) continue; a = rint(1, b - 1); c = rint(1, d - 1); if(a * d === c * b) continue; }
      if(lcm(b, d) > 24) continue;
      return { type:'compare', a, b, c, d };
    }
  }
  function makeOrder(){
    const families = [[2,4,8],[3,6,12],[2,3,6],[2,5,10],[3,4,12],[2,3,4,12],[2,4,6,12]];
    for(;;){
      const fam = pickF(families), n = Math.random() < .35 ? 4 : 3, list = [];
      for(let t = 0; list.length < n && t < 60; t++){
        const d = pickF(fam), a = rint(1, d - 1);
        if(gcd(a, d) !== 1 || list.some(f => f.a * d === a * f.b)) continue;
        list.push({ a, b: d });
      }
      if(list.length < n || new Set(list.map(f => f.b)).size < 2) continue;
      const L = list.reduce((m, f) => lcm(m, f.b), 1);
      if(L > 24) continue;
      return { type:'order', list, asc: Math.random() < .7, L };
    }
  }
  function makeSet(mode, count){
    const out = [];
    for(let i = 0; i < count; i++){
      const m = mode === 'mixed' ? pickF(['equiv','equiv','simplify','simplify','word','compare','compare','order']) : mode;
      out.push(m === 'equiv' ? makeEquiv() : m === 'simplify' ? makeSimplify() : m === 'word' ? makeWord() : m === 'compare' ? makeCompare() : makeOrder());
    }
    return out;
  }

  // describe a problem for the missed list
  const symOf = pb => { const x = pb.a * pb.d, y = pb.c * pb.b; return x < y ? '<' : x > y ? '>' : '='; };
  const sortedList = pb => pb.list.slice().sort((p, q) => pb.asc ? p.a * q.b - q.a * p.b : q.a * p.b - p.a * q.b);
  function answerText(pb){
    if(pb.type === 'compare') return fr(pb.a, pb.b) + ' ' + esc(symOf(pb)) + ' ' + fr(pb.c, pb.d);
    if(pb.type === 'order') return sortedList(pb).map(f => fr(f.a, f.b)).join(pb.asc ? ' &lt; ' : ' &gt; ');
    if(pb.type === 'equiv'){ const t = target(pb); return equivLeft(pb) + ' = ' + (pb.kind === 'bottom' ? fr(t.top, t.ans) : fr(t.ans, t.bot)); }
    return fr(pb.n, pb.d) + ' = ' + fr(pb.p, pb.q);
  }
  const equivLeft = pb => pb.kind === 'down' ? fr(pb.a * pb.k, pb.b * pb.k) : fr(pb.a, pb.b);
  function target(pb){
    if(pb.kind === 'up')   return { top:null, bot: pb.b * pb.k, ans: pb.a * pb.k, opTop:'×' + pb.k, opBot:'×' + pb.k };
    if(pb.kind === 'down') return { top:null, bot: pb.b, ans: pb.a, opTop:'÷' + pb.k, opBot:'÷' + pb.k };
    return { top: pb.a * pb.k, bot:null, ans: pb.b * pb.k, opTop:'×' + pb.k, opBot:'×' + pb.k };   // missing bottom
  }

  // ---------- run ----------
  let X = null;
  // steps: always, never, or only after a wrong answer on that problem
  const steps = () => X.stepsMode === 'always' || (X.stepsMode === 'missed' && X.showSteps);
  $('xSteps').onchange = () => { data.fracSteps = $('xSteps').value; save(); };
  // first wrong answer with "only on ones he misses": count it, then walk through it step by step
  function switchToSteps(pb, why){
    X.err++; X.misses++; X.showSteps = true; X.stage = 0; X.tries = 0;
    if(pb.type !== 'equiv'){ pb.cn = pb.n; pb.cd = pb.d; pb.hist = []; }
    $('xCheck').hidden = true;
    if(pb.type === 'order') pb.sel = [];
    if(pb.type === 'equiv') renderEquiv(pb); else if(pb.type === 'simplify') renderSimplify(pb); else if(pb.type === 'word') renderWord(pb);
    else if(pb.type === 'compare') renderCompare(pb); else renderOrder(pb);
    setFeedback('Not quite. ' + why + ' Let\'s do this one step by step.', 'bad');
  }
  function start(list, full){
    const mode = $('xMode').value;
    X = { mode, stepsMode: $('xSteps').value, showSteps:false, order: list || makeSet(mode, +$('xCount').value), i:0, score:0, misses:0, missed:[], err:0, stage:0, done:false };
    timerStart('frac', full !== false);
    $('fracSetup').hidden = true; $('fracDone').hidden = true; $('fracRun').hidden = false;
    show();
  }
  function setFeedback(text, kind){ $('xFeedback').innerHTML = text; $('xFeedback').className = 'feedback' + (kind ? ' ' + kind : ''); }
  function mistake(text){ X.err++; X.misses++; setFeedback(text, 'bad'); }
  function show(){
    const pb = X.order[X.i];
    X.err = 0; X.stage = 0; X.done = false; X.tries = 0; X.showSteps = false;
    $('xPos').textContent = 'Problem ' + (X.i + 1) + ' of ' + X.order.length;
    $('xScore').textContent = X.score + ' correct';
    $('xBar').style.width = (X.i / X.order.length * 100) + '%';
    $('xNext').hidden = true; $('xCheck').hidden = true; setFeedback('');
    $('xNext').textContent = X.i === X.order.length - 1 ? 'See results' : 'Next problem';
    if(pb.type === 'equiv') renderEquiv(pb);
    else if(pb.type === 'simplify'){ pb.cn = pb.n; pb.cd = pb.d; pb.hist = []; renderSimplify(pb); }
    else if(pb.type === 'word'){ pb.cn = pb.n; pb.cd = pb.d; pb.hist = []; renderWord(pb); }
    else if(pb.type === 'compare') renderCompare(pb);
    else { pb.sel = []; renderOrder(pb); }
  }
  function solved(text){
    X.done = true;
    if(X.err === 0) X.score++; else X.missed.push(X.order[X.i]);
    $('xScore').textContent = X.score + ' correct';
    setFeedback(text, 'ok');
    $('xCheck').hidden = true; $('xNext').hidden = false; $('xNext').focus();
  }
  function revealed(text){
    X.done = true; X.missed.push(X.order[X.i]);
    setFeedback(text, 'bad');
    $('xCheck').hidden = true; $('xNext').hidden = false; $('xNext').focus();
  }
  const numInput = (id, ph) => `<input class="xIn" id="${id}" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="${ph || '?'}" aria-label="answer">`;
  const fracInput = () => `<span class="xFrIn">${numInput('xTop','top')}<hr>${numInput('xBot','bottom')}</span>`;
  const readNum = id => { const v = ($(id) && $(id).value || '').trim(); return /^\d+$/.test(v) ? +v : null; };

  // ----- equivalent fractions -----
  function renderEquiv(pb){
    const t = target(pb);
    const ln = pb.kind === 'down' ? pb.a * pb.k : pb.a, ld = pb.kind === 'down' ? pb.b * pb.k : pb.b;
    const rd = pb.kind === 'bottom' ? pb.b * pb.k : t.bot;
    const known = pb.kind === 'bottom' ? 'top' : 'bottom';
    const ops = (X.stage > 0 || !steps())
      ? `<div class="xOps"><span>${X.stage > 0 ? t.opTop : ''}</span><span>${X.stage > 0 ? t.opBot : ''}</span></div>`
      : (known === 'bottom' ? `<div class="xOps"><span></span><span>?</span></div>` : `<div class="xOps"><span>?</span><span></span></div>`);
    const right = X.done ? fr(pb.kind === 'bottom' ? t.top : t.ans, pb.kind === 'bottom' ? t.ans : t.bot)
      : (pb.kind === 'bottom' ? `<span class="xFrIn"><span>${t.top}</span><hr>${(X.stage > 0 || !steps()) ? numInput('xNum') : '<span>?</span>'}</span>`
                              : `<span class="xFrIn">${(X.stage > 0 || !steps()) ? numInput('xNum') : '<span>?</span>'}<hr><span>${t.bot}</span></span>`);
    let html = `<p class="hint" style="margin:0">Write the missing number.</p>
      <div class="xEq">
        <figure>${pie(ln, ld)}<figcaption>${fr(ln, ld)}</figcaption></figure>
        ${ops}
        <span class="op">=</span>
        <figure>${pie(X.done ? (pb.kind === 'bottom' ? t.top : t.ans) : 0, pb.kind === 'bottom' && !X.done ? 1 : (pb.kind === 'bottom' ? t.ans : t.bot))}<figcaption>${right}</figcaption></figure>
      </div>`;
    if(steps() && X.stage === 0 && !X.done){
      const from = known === 'bottom' ? ld : ln, to = known === 'bottom' ? rd : t.top;
      const right1 = known === 'bottom' ? t.opBot : t.opTop;
      const opts = shuffle([right1, pb.kind === 'down' ? '×' + pb.k : '÷' + pb.k, (to > from ? '+' : '−') + Math.abs(to - from)]);
      html += `<p class="xQ">The ${known} went from ${from} to ${to}. What happened to it?</p>
        <div class="xBtns">${opts.map(o => `<button class="btn quiet" data-op="${o}">${o}</button>`).join('')}</div>`;
      $('xBody').innerHTML = html;
      $('xBody').querySelectorAll('[data-op]').forEach(b => b.onclick = () => {
        if(b.dataset.op === right1){ X.stage = 1; setFeedback('Yes. Now do the same to the ' + (known === 'bottom' ? 'top' : 'bottom') + '.', 'ok'); renderEquiv(pb); }
        else if(b.dataset.op[0] === '+' || b.dataset.op[0] === '−') mistake('Fractions change by multiplying or dividing, not adding. ' + from + ' ' + right1 + ' = ' + to + '.');
        else mistake('Look again: ' + from + ' ' + right1 + ' = ' + to + '.');
      });
      return;
    }
    if(steps() && X.stage === 1 && !X.done){
      const base = known === 'bottom' ? ln : ld;
      html += `<p class="xQ">Do the same to the ${known === 'bottom' ? 'top' : 'bottom'}: ${base} ${known === 'bottom' ? t.opTop : t.opBot} = ?</p>`;
    }
    $('xBody').innerHTML = html;
    if(!X.done){ $('xCheck').hidden = false; const inp = $('xNum'); if(inp){ inp.focus(); inp.onkeydown = e => { if(e.key === 'Enter') check(); }; } }
  }
  function checkEquiv(pb){
    const t = target(pb), x = readNum('xNum');
    if(x === null){ setFeedback('Type a number first.'); return; }
    X.tries++;
    if(x === t.ans){ solved('Correct. ' + (pb.kind === 'down' ? 'Top and bottom were both divided by ' + pb.k : 'Top and bottom were both multiplied by ' + pb.k) + ', so the fractions are equal.'); renderEquiv(pb); return; }
    let why;
    if(pb.kind === 'up'){
      if(x * pb.k === pb.a) why = 'The bottom was multiplied by ' + pb.k + ', but you divided the top. Do the same to both: ' + pb.a + ' × ' + pb.k + ' = ?';
      else if(x === pb.a + (pb.b * pb.k - pb.b)) why = 'You added ' + (pb.b * pb.k - pb.b) + '. Fractions need multiplying: the bottom was × ' + pb.k + ', so the top is × ' + pb.k + ' too.';
      else why = 'The bottom was multiplied by ' + pb.k + '. Multiply the top by ' + pb.k + ' too.';
    } else if(pb.kind === 'down'){
      if(x === pb.a * pb.k * pb.k) why = 'The bottom was divided by ' + pb.k + ', but you multiplied the top. Do the same to both.';
      else why = 'The bottom was divided by ' + pb.k + '. Divide the top by ' + pb.k + ' too.';
    } else {
      if(x * pb.k === pb.b) why = 'The top was multiplied by ' + pb.k + ', but you divided the bottom. Do the same to both.';
      else why = 'The top was multiplied by ' + pb.k + '. Multiply the bottom by ' + pb.k + ' too.';
    }
    if(X.stepsMode === 'missed' && !X.showSteps) switchToSteps(pb, why);
    else if(X.tries < 2){ mistake('Not quite. ' + why); $('xNum').select(); }
    else { X.misses++; X.done = true; revealed('The answer is ' + t.ans + '. ' + why.replace(/ = \?$/, ' = ' + t.ans)); renderEquiv(pb); }
  }

  // ----- simplify step by step -----
  const DIVS = [2,3,5,7,11];
  function stepsHtml(pb){
    if(!pb.hist.length) return '';
    let h = fr(pb.n, pb.d);
    pb.hist.forEach(s => { h += ` <b>÷${s.k}</b> → ` + fr(s.n, s.d); });
    return `<div class="xSteps">${h}</div>`;
  }
  function renderSimplify(pb, intro){
    let html = intro || '';
    html += `<div class="xBig">${fr(pb.cn, pb.cd)}</div>${stepsHtml(pb)}`;
    if(X.done){ $('xBody').innerHTML = html; return; }
    if(steps()){
      html += `<p class="xQ">Divide the top and bottom by the same number:</p>
        <div class="xBtns">${DIVS.map(k => `<button class="btn quiet" data-k="${k}">÷ ${k}</button>`).join('')}
        <button class="btn" data-k="0">It's as simple as it gets</button></div>`;
      $('xBody').innerHTML = html;
      $('xBody').querySelectorAll('[data-k]').forEach(b => b.onclick = () => stepSimplify(pb, +b.dataset.k, intro));
    } else {
      html += `<p class="xQ">Write it in simplest form:</p>${fracInput()}`;
      $('xBody').innerHTML = html;
      $('xCheck').hidden = false; $('xTop').focus();
      ['xTop','xBot'].forEach(id => $(id).onkeydown = e => { if(e.key === 'Enter'){ if(id === 'xTop') $('xBot').focus(); else check(); } });
    }
  }
  function stepSimplify(pb, k, intro){
    if(k === 0){
      const g = gcd(pb.cn, pb.cd);
      if(g === 1){ solved('Correct. ' + fr(pb.n, pb.d) + ' = ' + fr(pb.cn, pb.cd) + ' in simplest form.'); renderSimplify(pb, intro); }
      else { const hint = DIVS.find(x => pb.cn % x === 0 && pb.cd % x === 0); mistake('Not yet. Both ' + pb.cn + ' and ' + pb.cd + ' can still be divided by ' + hint + '. Keep going.'); }
      return;
    }
    if(pb.cn % k || pb.cd % k){
      const which = (pb.cn % k && pb.cd % k) ? 'either ' + pb.cn + ' or ' + pb.cd : (pb.cn % k ? pb.cn : pb.cd);
      mistake(k + ' doesn\'t divide evenly into ' + which + '. Both numbers have to divide by the same number.');
      return;
    }
    pb.cn /= k; pb.cd /= k; pb.hist.push({ k, n: pb.cn, d: pb.cd });
    setFeedback('Both ÷ ' + k + '. Can they be divided again?');
    renderSimplify(pb, intro);
  }
  function checkFraction(pb){
    const t = readNum('xTop'), b = readNum('xBot');
    if(t === null || b === null || b === 0){ setFeedback('Fill in the top and the bottom.'); return; }
    X.tries++;
    if(t === pb.p && b === pb.q){ solved('Correct. ' + fr(pb.n, pb.d) + ' = ' + fr(pb.p, pb.q) + '.'); X.order[X.i].cn = t; X.order[X.i].cd = b; renderSimplify(pb, pb.type === 'word' ? wordIntro(pb, true) : ''); return; }
    let why;
    if(t * pb.n === b * pb.d) why = pb.type === 'word' ? 'That\'s flipped. The part (' + pb.n + ') goes on top and the whole (' + pb.d + ') on the bottom.' : 'That\'s flipped. ' + pb.n + ' is on top, so the top of your answer comes from ' + pb.n + '.';
    else if(t === pb.n && b === pb.d) why = 'That\'s the right fraction. Now simplify it.';
    else if(t * pb.d === b * pb.n) why = fr(t, b) + ' is equal, but not simplest. Both ' + t + ' and ' + b + ' can still be divided by ' + gcd(t, b) + '.';
    else if(t && b && pb.n % t === 0 && pb.d % b === 0 && pb.n / t !== pb.d / b) why = 'You divided the top by ' + (pb.n / t) + ' and the bottom by ' + (pb.d / b) + '. Divide both by the same number.';
    else why = 'Find a number that divides both ' + pb.n + ' and ' + pb.d + '. Hint: try ' + gcd(pb.n, pb.d) + '.';
    if(X.stepsMode === 'missed' && !X.showSteps) switchToSteps(pb, why);
    else if(X.tries < 2){ mistake('Not quite. ' + why); $('xTop').select(); }
    else { X.misses++; X.done = true; revealed('The answer is ' + fr(pb.p, pb.q) + '. ' + why); renderSimplify(Object.assign(pb, { cn: pb.p, cd: pb.q }), pb.type === 'word' ? wordIntro(pb, true) : ''); }
  }

  // ----- word problems -----
  function wordIntro(pb, withFraction){
    return `<p class="xWord">${pb.text}</p><p class="xQ" style="margin-top:0">${pb.ask}</p>` + (withFraction ? `<p class="hint" style="margin:0">${pb.part.charAt(0).toUpperCase() + pb.part.slice(1)} on top, ${pb.whole} on the bottom:</p>` : '');
  }
  function renderWord(pb){
    if(!steps()){ renderSimplify(pb, wordIntro(pb)); $('xBody').querySelector('.xBig').remove(); return; }
    if(X.stage === 0){
      const opts = shuffle([pb.n, pb.d]);
      $('xBody').innerHTML = wordIntro(pb) + `<p class="xQ">Which number is the part (the ${pb.part})? It goes on top.</p>
        <div class="xBtns">${opts.map(o => `<button class="btn quiet" data-v="${o}">${o}</button>`).join('')}</div>`;
      $('xBody').querySelectorAll('[data-v]').forEach(b => b.onclick = () => {
        if(+b.dataset.v === pb.n){ X.stage = 1; setFeedback('Yes. ' + pb.n + ' is the part and ' + pb.d + ' is the whole, so the fraction is ' + pb.n + '/' + pb.d + '. Now simplify it.', 'ok'); renderSimplify(pb, wordIntro(pb, true)); }
        else mistake(pb.d + ' is the whole group (' + pb.whole + '). The part is the ' + pb.part + '.');
      });
      return;
    }
    renderSimplify(pb, wordIntro(pb, true));
  }

  // ----- shared step: pick a common bottom number, then rewrite each fraction -----
  const convList = pb => pb.type === 'compare' ? [{ a: pb.a, b: pb.b }, { a: pb.c, b: pb.d }] : pb.list;
  const commonBottom = pb => convList(pb).reduce((m, f) => lcm(m, f.b), 1);
  function bottomChoices(pb){
    const L = commonBottom(pb), bs = [...new Set(convList(pb).map(f => f.b))];
    const opts = new Set([L]);
    const prod = bs.reduce((m, b) => m * b, 1); if(prod !== L && prod <= 60) opts.add(prod);
    opts.add(bs.reduce((m, b) => m + b, 0)); opts.add(Math.max(...bs) + 1);
    return shuffle([...opts].slice(0, 4));
  }
  function bottomStepHtml(pb){
    const bs = [...new Set(convList(pb).map(f => f.b))];
    return `<p class="xQ">To compare, give them the same bottom number. What number can ${bs.join(', ').replace(/, ([^,]*)$/, ' and $1')} all go into?</p>
      <div class="xBtns">${bottomChoices(pb).map(o => `<button class="btn quiet" data-l="${o}">${o}</button>`).join('')}</div>`;
  }
  function wireBottom(pb, render){
    const L = commonBottom(pb);
    $('xBody').querySelectorAll('[data-l]').forEach(b => b.onclick = () => {
      const v = +b.dataset.l;
      if(v === L){ X.stage = 1; setFeedback('Yes, ' + L + '. Now rewrite each fraction with ' + L + ' on the bottom.', 'ok'); render(pb); }
      else if(convList(pb).every(f => v % f.b === 0)) mistake(v + ' works, but ' + L + ' is smaller and easier. Look for the smallest number they all go into.');
      else mistake(convList(pb).filter(f => v % f.b).map(f => f.b).join(' and ') + ' doesn\'t go into ' + v + ' evenly. Try counting by ' + Math.max(...convList(pb).map(f => f.b)) + 's.');
    });
  }
  function convertHtml(pb){
    const L = commonBottom(pb);
    return `<p class="xQ">Rewrite each one with ${L} on the bottom. Multiply the top by the same number as the bottom:</p><div class="xConv">` +
      convList(pb).map((f, i) => `<div class="row1">${fr(f.a, f.b)} <span class="op2">×${L / f.b}</span> = <span class="xFrIn">${numInput('xC' + i)}<hr><span>${L}</span></span></div>`).join('') + '</div>';
  }
  function checkConvert(pb, next){
    const L = commonBottom(pb), list = convList(pb);
    const vals = list.map((f, i) => readNum('xC' + i));
    if(vals.some(v => v === null)){ setFeedback('Fill in every top number.'); return; }
    const wrong = list.findIndex((f, i) => vals[i] !== f.a * (L / f.b));
    if(wrong < 0){ $('xCheck').hidden = true; next(); return; }
    const f = list[wrong];
    mistake(f.b + ' × ' + (L / f.b) + ' = ' + L + ', so multiply the top by ' + (L / f.b) + ' too: ' + f.a + ' × ' + (L / f.b) + ' = ?');
  }

  // ----- compare (<, >, =) -----
  function compareWhy(pb){
    const s = symOf(pb), L = lcm(pb.b, pb.d);
    if(pb.b === pb.d) return 'The bottoms are the same, so just compare the tops: ' + pb.a + ' ' + s + ' ' + pb.c + '.';
    if(pb.a === pb.c) return 'The tops are the same. A bigger bottom means smaller pieces, so ' + (pb.b > pb.d ? pb.a + '/' + pb.b : pb.c + '/' + pb.d) + ' is the smaller fraction.';
    const A = pb.a * L / pb.b, C = pb.c * L / pb.d;
    if(s === '=') return 'They\'re equal: with ' + L + ' on the bottom, both are ' + A + '/' + L + '.';
    return 'With ' + L + ' on the bottom: ' + pb.a + '/' + pb.b + ' = ' + A + '/' + L + ' and ' + pb.c + '/' + pb.d + ' = ' + C + '/' + L + '. ' + A + ' ' + s + ' ' + C + '.';
  }
  function renderCompare(pb){
    const L = lcm(pb.b, pb.d), special = pb.b === pb.d || pb.a === pb.c;
    const shown = X.done ? symOf(pb) : '?';
    let html = `<p class="hint" style="margin:0">Which sign goes in the box: &lt;, &gt; or =?</p>
      <div class="xBig" style="justify-content:center">${fr(pb.a, pb.b)} <span class="xSym${X.done ? ' set' : ''}">${esc(shown)}</span> ${fr(pb.c, pb.d)}</div>`;
    if(steps() && !X.done){
      html += `<div class="xEq">${pie(pb.a, pb.b, 84)}<span class="op"></span>${pie(pb.c, pb.d, 84)}</div>`;
      if(special && X.stage === 0) X.stage = 2;
      if(X.stage === 0){ $('xBody').innerHTML = html + bottomStepHtml(pb); wireBottom(pb, renderCompare); return; }
      if(X.stage === 1){ $('xBody').innerHTML = html + convertHtml(pb); $('xCheck').hidden = false; $('xC0').focus(); return; }
      if(pb.b === pb.d) html += '<p class="xQ">The bottoms are the same, so the bigger top is the bigger fraction.</p>';
      else if(pb.a === pb.c) html += '<p class="xQ">The tops are the same. A bigger bottom means smaller pieces.</p>';
      else html += `<p class="xQ">${fr(pb.a * L / pb.b, L)} and ${fr(pb.c * L / pb.d, L)}: compare the tops.</p>`;
    }
    if(!X.done){
      html += `<div class="xBtns xSymBtns">${['<','=','>'].map(o => `<button class="btn quiet" data-s="${o}">${esc(o)}</button>`).join('')}</div>
        <p class="hint" style="margin:4px 0 0">Tip: the open side of &lt; or &gt; faces the bigger fraction.</p>`;
    }
    $('xBody').innerHTML = html;
    $('xBody').querySelectorAll('[data-s]').forEach(b => b.onclick = () => pickSym(pb, b.dataset.s));
  }
  function pickSym(pb, sym){
    if(X.done) return;
    X.tries++;
    if(sym === symOf(pb)){ solved('Correct. ' + compareWhy(pb)); renderCompare(pb); return; }
    let why = compareWhy(pb);
    if(pb.a === pb.c && sym !== '=') why = 'Careful: a bigger bottom number means smaller pieces. ' + why;
    if(X.stepsMode === 'missed' && !X.showSteps) switchToSteps(pb, why);
    else if(X.tries < 2) mistake('Not quite. ' + why);
    else { X.misses++; X.done = true; revealed('The answer is ' + esc(symOf(pb)) + '. ' + why); renderCompare(pb); }
  }

  // ----- put in order -----
  function renderOrder(pb){
    const L = pb.L, dir = pb.asc ? 'least to greatest' : 'greatest to least';
    let html = `<p class="xQ" style="margin-top:0">Put these in order from <u>${dir}</u>.</p>`;
    if(steps() && !X.done && X.stage === 0){ $('xBody').innerHTML = html + `<div class="xChips">${pb.list.map(f => `<span class="xChip">${fr(f.a, f.b)}</span>`).join('')}</div>` + bottomStepHtml(pb); wireBottom(pb, renderOrder); return; }
    if(steps() && !X.done && X.stage === 1){ $('xBody').innerHTML = html + convertHtml(pb); $('xCheck').hidden = false; $('xC0').focus(); return; }
    const showConv = steps() || X.done;
    const chip = (f, i, used) => `<button class="xChip${used ? ' used' : ''}" data-i="${i}" ${used || X.done ? 'disabled' : ''}>${fr(f.a, f.b)}${showConv ? `<small>= ${f.a * L / f.b}/${L}</small>` : ''}</button>`;
    const placed = X.done ? sortedList(pb).map(f => pb.list.indexOf(f)) : pb.sel;
    html += `<div class="xChips">${pb.list.map((f, i) => chip(f, i, pb.sel.includes(i) || X.done)).join('')}</div>
      <p class="hint" style="margin:0">${pb.asc ? 'Least' : 'Greatest'} first. Tap a fraction to place it, and tap a placed one to take it back.</p>
      <div class="xSlots" id="xSlots">${placed.map((i, k) => (k ? `<span class="arrow">${pb.asc ? '&lt;' : '&gt;'}</span>` : '') + `<button class="xChip" data-back="${i}" ${X.done ? 'disabled' : ''}>${fr(pb.list[i].a, pb.list[i].b)}${showConv ? `<small>= ${pb.list[i].a * L / pb.list[i].b}/${L}</small>` : ''}</button>`).join('')}</div>`;
    $('xBody').innerHTML = html;
    if(X.done) return;
    $('xBody').querySelectorAll('[data-i]').forEach(b => b.onclick = () => { pb.sel.push(+b.dataset.i); renderOrder(pb); });
    $('xBody').querySelectorAll('[data-back]').forEach(b => b.onclick = () => { pb.sel = pb.sel.filter(x => x !== +b.dataset.back); renderOrder(pb); });
    $('xCheck').hidden = pb.sel.length !== pb.list.length;
  }
  function checkOrder(pb){
    if(pb.sel.length !== pb.list.length){ setFeedback('Place every fraction first.'); return; }
    X.tries++;
    const want = sortedList(pb).map(f => pb.list.indexOf(f));
    if(pb.sel.every((i, k) => i === want[k])){ solved('Correct. With ' + pb.L + ' on the bottom they are ' + sortedList(pb).map(f => f.a * pb.L / f.b + '/' + pb.L).join(', ') + '.'); renderOrder(pb); return; }
    const byBottom = pb.sel.map(i => pb.list[i].b);
    const sortedByBottom = byBottom.every((b, k) => !k || (pb.asc ? b >= byBottom[k - 1] : b <= byBottom[k - 1]));
    let why = 'Give them the same bottom (' + pb.L + '): ' + pb.list.map(f => f.a + '/' + f.b + ' = ' + (f.a * pb.L / f.b) + '/' + pb.L).join(', ') + '. Then order the tops.';
    if(sortedByBottom) why = 'It looks like you went by the bottom numbers. A bigger bottom means smaller pieces, not a bigger fraction. ' + why;
    if(X.stepsMode === 'missed' && !X.showSteps){ pb.sel = []; switchToSteps(pb, why); }
    else if(X.tries < 2){ pb.sel = []; mistake('Not quite. ' + why); renderOrder(pb); }
    else { X.misses++; X.done = true; revealed('The order is ' + answerText(pb) + '. ' + why); renderOrder(pb); }
  }

  function check(){
    if(!X || X.done) return;
    const pb = X.order[X.i];
    if(pb.type === 'equiv') checkEquiv(pb);
    else if(pb.type === 'compare') checkConvert(pb, () => { X.stage = 2; setFeedback('Now both have the same bottom. Compare the tops.', 'ok'); renderCompare(pb); });
    else if(pb.type === 'order'){ if(steps() && X.stage === 1) checkConvert(pb, () => { X.stage = 2; setFeedback('Now they all have the same bottom. Put them in order by the tops.', 'ok'); renderOrder(pb); }); else checkOrder(pb); }
    else checkFraction(pb);
  }
  $('xCheck').onclick = check;
  $('xNext').onclick = () => { if(X.i < X.order.length - 1){ X.i++; show(); } else finish(); };
  $('xQuit').onclick = () => finish(true);
  function finish(early){
    const done = early ? X.i + (X.done ? 1 : 0) : X.order.length;
    if(early && !X.done && X.err) X.missed.push(X.order[X.i]);
    $('fracRun').hidden = true; $('fracDone').hidden = false;
    $('xdScore').textContent = (done ? Math.round(X.score / done * 100) : 0) + '%';
    $('xdLine').textContent = X.score + ' of ' + done + ' right with no mistakes' + (early && done < X.order.length ? ' (ended early)' : '') + '.';
    timerFinish('frac', X.misses, !early || done >= X.order.length, 'fracTimes');
    $('xMissedWrap').hidden = !X.missed.length; $('xRetry').hidden = !X.missed.length;
    $('xMissedList').innerHTML = X.missed.map(pb => `<li style="font-size:20px">${answerText(pb)}</li>`).join('');
  }
  const fresh = pb => { const c = Object.assign({}, pb); delete c.cn; delete c.cd; delete c.hist; delete c.sel; return c; };
  $('xStart').onclick = () => start();
  $('xAgain').onclick = () => start();
  $('xRetry').onclick = () => start(X.missed.map(fresh), false);
  $('xBack').onclick = () => { $('fracDone').hidden = true; $('fracSetup').hidden = false; showSetupBest('frac'); };

  (window.LOADED_EXTRA = window.LOADED_EXTRA || []).push('js/fractions.js');
})();
