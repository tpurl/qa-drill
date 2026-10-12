// Q&A Drill: more Fractions practice (add-on loaded from start.js, after fractions.js)
// Adds three choices to Practice on the Fractions tab: fractions bigger than 1, shade the model, read the model.
// It uses the tab's Steps and Problems settings and has its own run and results panels.
(function(){
  const MODES2 = { improper:'Fractions bigger than 1', shade:'Shade the model', read:'Read the model' };
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const rint = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const pickF = a => a[Math.floor(Math.random() * a.length)];
  const fr = (n, d) => d === 1 ? `<span class="fr" style="display:inline-block"><span style="border:0">${n}</span></span>` : `<span class="fr"><span>${n}</span><span>${d}</span></span>`;
  const GRID = { 4:[2,2], 6:[2,3], 8:[2,4], 9:[3,3], 10:[2,5], 12:[3,4] };

  document.head.insertAdjacentHTML('beforeend', `<style>
    .yPart{fill:var(--card);stroke:var(--ink);stroke-width:1.4}
    .yPart.on{fill:var(--accent)}
    .yPart.tap{cursor:pointer}
    .yModels{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin:8px 0}
    .yModel{appearance:none;background:var(--card);border:2px solid var(--rule);border-radius:12px;padding:8px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;color:var(--ink)}
    .yModel.sel{border-color:var(--accent);background:var(--sel)}
    .yModel .lab{font-family:"Bricolage Grotesque",system-ui,sans-serif;font-size:22px;font-weight:700;min-height:1em}
    .yStmt{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-family:"Bricolage Grotesque",system-ui,sans-serif;font-size:30px;font-weight:700;margin:8px 0}
  </style>`);

  // add the choices before "Mixed"
  const sel = $('xMode'), mixedOpt = sel.querySelector('option[value="mixed"]');
  Object.entries(MODES2).forEach(([k, v]) => { const o = document.createElement('option'); o.value = k; o.textContent = v; sel.insertBefore(o, mixedOpt); });

  // own run and results panels
  $('fracDone').insertAdjacentHTML('afterend', `
    <div class="panel" id="yRun" hidden>
      <div class="progress"><span id="yBar"></span></div>
      <div class="meta"><span id="yPos"></span><span class="clock" id="yClock">0:00</span><span id="yScore"></span></div>
      <div id="yBody"></div>
      <div class="feedback" id="yFeedback" aria-live="polite"></div>
      <div class="row">
        <button class="btn" id="yCheck" hidden>Check</button>
        <button class="btn" id="yNext" hidden>Next problem</button>
        <button class="btn quiet" id="yQuit">End</button>
      </div>
    </div>
    <div class="panel" id="yDone" hidden>
      <div class="big" id="ydScore"></div>
      <p id="ydLine" style="margin:8px 0 16px"></p>
      <div class="timeBox" id="yTimes"></div>
      <div class="row" style="margin-bottom:12px">
        <button class="btn" id="yRetry">Retry missed</button>
        <button class="btn ghost" id="yAgain">New problems</button>
        <button class="btn ghost" id="yBack">Change settings</button>
      </div>
      <div id="yMissedWrap"><h3 style="font-size:19px;margin:12px 0 8px">Practice these</h3><ul class="missed" id="yMissedList"></ul></div>
    </div>`);

  // timer and top times
  CLOCK.frac2 = 'yClock';
  const baseRunKey2 = runKey, baseRangeLabel2 = rangeLabel;
  runKey = mode => mode === 'frac2' ? 'frac2|' + $('xMode').value + '|' + $('xSteps').value + '|' + $('xCount').value : baseRunKey2(mode);
  rangeLabel = mode => mode === 'frac2' ? $('xCount').value + ' problems (' + (MODES2[$('xMode').value] || '').toLowerCase() + ')' : baseRangeLabel2(mode);
  // the setup panel's best-time line follows whichever practice type is chosen
  const baseShowSetupBest2 = showSetupBest;
  showSetupBest = mode => {
    if(mode !== 'frac' || !MODES2[$('xMode').value]) return baseShowSetupBest2(mode);
    const b = bestsFor(runKey('frac2'))[0], lab = esc(rangeLabel('frac2'));
    $('fracSetupBest').innerHTML = b ? 'Best time for ' + lab + ': <b>' + fmtT(b.t) + '</b>. Can you beat it?' : 'No best time yet for ' + lab + '. Finish a round to set one.';
  };

  // send Start to this engine for the new choices
  const hideMine = () => { $('yRun').hidden = true; $('yDone').hidden = true; };
  const baseStart = $('xStart').onclick, baseAgain = $('xAgain').onclick;
  $('xStart').onclick = () => { hideMine(); if(MODES2[$('xMode').value]) start(); else baseStart(); };
  $('xAgain').onclick = () => { hideMine(); baseAgain(); };

  // ---------- drawing ----------
  function shapeSvg(kind, N, on, tap){
    const cls = i => 'yPart' + (on.has(i) ? ' on' : '') + (tap ? ' tap' : '');
    if(kind === 'circle'){
      const S = 130, c = S / 2, r = c - 3;
      let s = `<svg viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">`;
      if(N === 1) return s + `<circle class="${cls(0)}" data-i="0" cx="${c}" cy="${c}" r="${r}"/></svg>`;
      for(let i = 0; i < N; i++){
        const a0 = -Math.PI / 2 + i * 2 * Math.PI / N, a1 = a0 + 2 * Math.PI / N, p = a => (c + r * Math.cos(a)).toFixed(2) + ',' + (c + r * Math.sin(a)).toFixed(2);
        s += `<path class="${cls(i)}" data-i="${i}" d="M${c},${c} L${p(a0)} A${r},${r} 0 0 1 ${p(a1)} Z"/>`;
      }
      return s + '</svg>';
    }
    if(kind === 'square' && GRID[N]){
      const [R, C] = GRID[N], S = 130, w = (S - 4) / C, h = (S - 4) / R;
      let s = `<svg viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">`;
      for(let i = 0; i < N; i++) s += `<rect class="${cls(i)}" data-i="${i}" x="${2 + (i % C) * w}" y="${2 + Math.floor(i / C) * h}" width="${w}" height="${h}"/>`;
      return s + '</svg>';
    }
    const W = 220, H = 60, w = (W - 4) / N;
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
    for(let i = 0; i < N; i++) s += `<rect class="${cls(i)}" data-i="${i}" x="${2 + i * w}" y="2" width="${w}" height="${H - 4}"/>`;
    return s + '</svg>';
  }
  const kindFor = N => GRID[N] && Math.random() < .4 ? 'square' : Math.random() < .55 ? 'circle' : 'bar';
  const firstN = n => new Set([...Array(n).keys()]);

  // ---------- problem makers ----------
  function makeImproper(){
    const r = Math.random();
    if(r < .4){ const d = rint(2, 10), k = rint(2, 8); return { type:'improper', n: d * k, d, p: k, q: 1 }; }
    for(;;){
      const q = rint(2, 6), p = rint(q + 1, 3 * q);
      if(gcd(p, q) !== 1) continue;
      const g = r < .85 ? rint(2, 5) : rint(2, 4);
      if(r >= .85){ const pp = rint(1, q - 1); if(gcd(pp, q) !== 1) continue; return { type:'improper', n: pp * g, d: q * g, p: pp, q }; }   // a few that are smaller than 1, so he checks
      return { type:'improper', n: p * g, d: q * g, p, q };
    }
  }
  function makeShade(){
    for(;;){
      const b = pickF([2,2,3,4,4,5,6]), a = rint(1, b - 1), k = Math.random() < .8 ? pickF([2,2,3,4]) : 1;
      if(gcd(a, b) !== 1 || b * k > 12) continue;
      const N = b * k;
      return { type:'shade', a, b, N, kind: kindFor(N) };
    }
  }
  function makeRead(){
    if(Math.random() < .5){ const N = rint(2, 12), a = rint(1, N - 1); return { type:'readName', a, N, kind: kindFor(N) }; }
    for(;;){
      const q = pickF([2,3,4]), p = rint(1, q - 1), ks = shuffle([1,2,3,4].filter(k => q * k <= 12)).slice(0, 2);
      if(gcd(p, q) !== 1 || ks.length < 2) continue;
      const models = ks.map(k => ({ a: p * k, N: q * k }));
      for(let t = 0; models.length < 4 && t < 80; t++){
        const N = rint(2, 12), a = rint(1, N - 1);
        if(a * q === p * N || models.some(m => m.a * N === a * m.N)) continue;
        models.push({ a, N });
      }
      if(models.length < 4) continue;
      const all = shuffle(models).map(m => Object.assign(m, { kind: kindFor(m.N) }));
      return { type:'readPair', models: all, pair: all.map((m, i) => m.a * q === p * m.N ? i : -1).filter(i => i >= 0) };
    }
  }
  function makeSet(mode, count){ return [...Array(count)].map(() => mode === 'improper' ? makeImproper() : mode === 'shade' ? makeShade() : makeRead()); }
  function answerText(pb){
    if(pb.type === 'improper') return fr(pb.n, pb.d) + ' = ' + fr(pb.p, pb.q);
    if(pb.type === 'shade') return fr(pb.a, pb.b) + ' = ' + fr(pb.a * pb.N / pb.b, pb.N);
    if(pb.type === 'readName') return 'shaded: ' + fr(pb.a, pb.N);
    const [i, j] = pb.pair; return fr(pb.models[i].a, pb.models[i].N) + ' = ' + fr(pb.models[j].a, pb.models[j].N);
  }

  // ---------- run ----------
  let Y = null;
  const steps = () => Y.stepsMode === 'always' || (Y.stepsMode === 'missed' && Y.showSteps);
  const setFb = (t, k) => { $('yFeedback').innerHTML = t; $('yFeedback').className = 'feedback' + (k ? ' ' + k : ''); };
  function mistake(t){ Y.err++; Y.misses++; setFb(t, 'bad'); }
  function start(list, full){
    Y = { mode: $('xMode').value, stepsMode: $('xSteps').value, order: list || makeSet($('xMode').value, +$('xCount').value), i:0, score:0, misses:0, missed:[] };
    timerStart('frac2', full !== false);
    $('fracSetup').hidden = true; $('fracDone').hidden = true; $('fracRun').hidden = true; $('yDone').hidden = true; $('yRun').hidden = false;
    show();
  }
  function show(){
    const pb = Y.order[Y.i];
    Object.assign(Y, { err:0, tries:0, done:false, showSteps:false, stage:0 });
    pb.done = false; pb.on = new Set(); pb.picked = []; pb.cn = pb.n; pb.cd = pb.d; pb.hist = [];
    $('yPos').textContent = 'Problem ' + (Y.i + 1) + ' of ' + Y.order.length;
    $('yScore').textContent = Y.score + ' correct';
    $('yBar').style.width = (Y.i / Y.order.length * 100) + '%';
    $('yNext').hidden = true; $('yCheck').hidden = true; setFb('');
    $('yNext').textContent = Y.i === Y.order.length - 1 ? 'See results' : 'Next problem';
    render();
  }
  function render(){ const pb = Y.order[Y.i]; ({ improper: rImproper, shade: rShade, readName: rName, readPair: rPair })[pb.type](pb); }
  function solved(t){ Y.done = true; if(Y.err === 0) Y.score++; else Y.missed.push(Y.order[Y.i]); $('yScore').textContent = Y.score + ' correct'; setFb(t, 'ok'); $('yCheck').hidden = true; $('yNext').hidden = false; render(); $('yNext').focus(); }
  function revealed(t){ Y.done = true; Y.misses++; Y.missed.push(Y.order[Y.i]); setFb(t, 'bad'); $('yCheck').hidden = true; $('yNext').hidden = false; render(); }
  // wrong answer: first time with "only on ones he misses" switches to steps; otherwise two tries, then show the answer
  function wrong(why, reveal, reset){
    if(Y.stepsMode === 'missed' && !Y.showSteps){ Y.err++; Y.misses++; Y.showSteps = true; Y.tries = 0; Y.stage = 0; if(reset) reset(); render(); setFb('Not quite. ' + why + ' Let\'s do this one step by step.', 'bad'); }
    else if(Y.tries < 2){ mistake('Not quite. ' + why); if(reset) reset(); render(); setFb('Not quite. ' + why, 'bad'); }
    else reveal();
  }
  const num = id => `<input class="xIn" id="${id}" inputmode="numeric" pattern="[0-9]*" autocomplete="off" aria-label="number">`;
  const frIn = (t, b) => `<span class="xFrIn">${num(t)}<hr>${num(b)}</span>`;
  const read = id => { const v = ($(id) && $(id).value || '').trim(); return /^\d+$/.test(v) ? +v : null; };
  const enterTo = (ids) => ids.forEach((id, k) => { const el = $(id); if(el) el.onkeydown = e => { if(e.key === 'Enter'){ if(ids[k + 1]) $(ids[k + 1]).focus(); else check(); } }; });

  // ----- fractions bigger than 1 -----
  function rImproper(pb){
    let h = `<p class="hint" style="margin:0">Simplify. The top can be bigger than the bottom. If it comes out to a whole number, type it on top and leave the bottom empty.</p>
      <div class="xBig">${fr(pb.done ? pb.p : pb.cn, pb.done ? pb.q : pb.cd)}</div>`;
    if(Y.done){ $('yBody').innerHTML = h; return; }
    if(steps()){
      if(pb.hist.length){ let s = fr(pb.n, pb.d); pb.hist.forEach(x => { s += ` <b>÷${x.k}</b> → ` + fr(x.n, x.d); }); h += `<div class="xSteps">${s}</div>`; }
      h += `<p class="xQ">Divide the top and bottom by the same number:</p><div class="xBtns">${[2,3,5,7].map(k => `<button class="btn quiet" data-k="${k}">÷ ${k}</button>`).join('')}<button class="btn" data-k="0">It's as simple as it gets</button></div>`;
      $('yBody').innerHTML = h;
      $('yBody').querySelectorAll('[data-k]').forEach(b => b.onclick = () => stepImp(pb, +b.dataset.k));
      return;
    }
    $('yBody').innerHTML = h + `<p class="xQ">Simplest form:</p>${frIn('yT', 'yB')}`;
    $('yCheck').hidden = false; $('yT').focus(); enterTo(['yT', 'yB']);
  }
  function stepImp(pb, k){
    if(Y.done) return;
    if(k === 0){
      if(gcd(pb.cn, pb.cd) === 1){ pb.done = true; solved(pb.cd === 1 ? 'Correct. The bottom is 1, so ' + pb.cn + '/1 is the whole number ' + pb.cn + '. ' + pb.n + ' ÷ ' + pb.d + ' = ' + pb.cn + '.' : 'Correct. ' + pb.n + '/' + pb.d + ' = ' + pb.cn + '/' + pb.cd + '. A bigger top is fine, so don\'t flip it.'); }
      else mistake('Not yet. ' + pb.cn + ' and ' + pb.cd + ' can both still be divided by ' + [2,3,5,7].find(x => pb.cn % x === 0 && pb.cd % x === 0) + '.');
      return;
    }
    if(pb.cn % k || pb.cd % k){ mistake(k + ' doesn\'t divide evenly into both ' + pb.cn + ' and ' + pb.cd + '. Divide both by the same number.'); return; }
    pb.cn /= k; pb.cd /= k; pb.hist.push({ k, n: pb.cn, d: pb.cd });
    setFb(pb.cd === 1 ? 'The bottom is 1 now. Is it as simple as it gets?' : 'Both ÷ ' + k + '. Can they be divided again?');
    rImproper(pb);
  }
  function checkImp(pb){
    const t = read('yT'), b0 = read('yB'), b = b0 === null ? 1 : b0;
    if(t === null){ setFb('Type the top number.'); return; }
    Y.tries++;
    if(t === pb.p && b === pb.q){ pb.done = true; solved('Correct. ' + (pb.q === 1 ? pb.n + ' ÷ ' + pb.d + ' = ' + pb.p + ', a whole number.' : pb.n + '/' + pb.d + ' = ' + pb.p + '/' + pb.q + '.')); return; }
    let why;
    if(t * pb.n === b * pb.d && pb.n !== pb.d) why = 'That\'s flipped. The top number stays on top, even when it\'s bigger.';
    else if(t * pb.d === b * pb.n) why = pb.q === 1 ? fr(t, b) + ' is equal, but simplify all the way: ' + pb.n + ' ÷ ' + pb.d + ' = ' + pb.p + ', a whole number.' : fr(t, b) + ' is equal, but both ' + t + ' and ' + b + ' can still be divided by ' + gcd(t, b) + '.';
    else if(t && b && pb.n % t === 0 && pb.d % b === 0 && pb.n / t !== pb.d / b) why = 'You divided the top by ' + pb.n / t + ' and the bottom by ' + pb.d / b + '. Divide both by the same number.';
    else if(pb.q === 1) why = 'The bottom goes into the top evenly: ' + pb.n + ' ÷ ' + pb.d + ' = ?';
    else why = 'Find a number that divides both ' + pb.n + ' and ' + pb.d + '. Hint: try ' + gcd(pb.n, pb.d) + '.';
    wrong(why, () => { pb.done = true; revealed('The answer is ' + fr(pb.p, pb.q) + '. ' + why.replace(/ = \?$/, ' = ' + pb.p + '.')); }, () => { pb.cn = pb.n; pb.cd = pb.d; pb.hist = []; });
  }

  // ----- shade the model -----
  function rShade(pb){
    const k = pb.N / pb.b, need = pb.a * k, shape = pb.kind === 'square' ? 'square' : pb.kind === 'circle' ? 'circle' : 'bar';
    let h = `<p class="xQ" style="margin-top:0">Shade ${fr(pb.a, pb.b)} of this ${pb.N}-part ${shape}.</p>`;
    if(steps() && Y.stage === 0 && !Y.done) h += `<p class="hint" style="margin:0 0 6px">${pb.a}/${pb.b} means ${pb.a} out of every ${pb.b}. ${pb.N} parts ÷ ${pb.b} = ${k}, so each 1/${pb.b} is ${k} part${k > 1 ? 's' : ''}. Shade ${pb.a} × ${k} = ${need}.</p>`;
    const on = Y.done ? firstN(need) : pb.on;
    h += `<div class="yModels"><div>${shapeSvg(pb.kind, pb.N, on, !Y.done && Y.stage === 0)}</div></div>`;
    if(Y.stage === 0 && !Y.done){ h += `<p class="hint" style="margin:0">Tap parts to shade them. Tap again to unshade. Shaded: <b>${pb.on.size}</b> of ${pb.N}</p>`; $('yCheck').hidden = false; }
    if(Y.stage === 1 && !Y.done){ h += `<p class="xQ">Now write the equivalent fraction statement:</p><div class="yStmt">${fr(pb.a, pb.b)} = ${frIn('yT', 'yB')}</div>`; $('yCheck').hidden = false; }
    if(Y.done) h += `<div class="yStmt">${fr(pb.a, pb.b)} = ${fr(need, pb.N)}</div>`;
    $('yBody').innerHTML = h;
    if(Y.stage === 0 && !Y.done) $('yBody').querySelectorAll('.yPart.tap').forEach(p => p.onclick = () => { const i = +p.dataset.i; pb.on.has(i) ? pb.on.delete(i) : pb.on.add(i); rShade(pb); });
    if(Y.stage === 1 && !Y.done){ $('yT').focus(); enterTo(['yT', 'yB']); }
  }
  function checkShade(pb){
    const k = pb.N / pb.b, need = pb.a * k;
    if(Y.stage === 0){
      const c = pb.on.size;
      if(!c){ setFb('Tap some parts to shade them first.'); return; }
      Y.tries++;
      if(c === need){ Y.stage = 1; Y.tries = 0; setFb('Yes, ' + need + ' of ' + pb.N + ' parts is the same amount as ' + pb.a + '/' + pb.b + '.', 'ok'); rShade(pb); return; }
      let why = pb.a + '/' + pb.b + ' of ' + pb.N + ' parts: ' + pb.N + ' ÷ ' + pb.b + ' = ' + k + ', then ' + pb.a + ' × ' + k + ' = ' + need + ' parts.';
      if(c === pb.a && k > 1) why = 'You shaded ' + c + ' part' + (c > 1 ? 's' : '') + ', but each 1/' + pb.b + ' is ' + k + ' parts here. ' + why;
      else if(c === pb.N - need) why = 'You shaded the part that should stay empty. ' + why;
      wrong(why, () => { revealed('Shade ' + need + ' of ' + pb.N + ' parts. ' + why); }, () => { pb.on = new Set(); });
      return;
    }
    const t = read('yT'), b = read('yB');
    if(t === null || b === null){ setFb('Fill in the top and the bottom.'); return; }
    Y.tries++;
    if(t === need && b === pb.N){ solved('Correct. ' + pb.a + '/' + pb.b + ' = ' + need + '/' + pb.N + ': the same amount, cut into more pieces.'); return; }
    const why = b !== pb.N ? 'The bottom is how many parts the whole ' + (pb.kind === 'circle' ? 'circle' : 'shape') + ' has now: ' + pb.N + '.' : 'The top is how many parts are shaded: ' + need + '.';
    if(Y.tries < 2) mistake('Not quite. ' + why); else revealed('The statement is ' + pb.a + '/' + pb.b + ' = ' + need + '/' + pb.N + '. ' + why);
  }

  // ----- read the model -----
  function rName(pb){
    let h = `<p class="xQ" style="margin-top:0">What fraction of the ${pb.kind === 'square' ? 'square' : pb.kind === 'circle' ? 'circle' : 'bar'} is shaded?</p>
      <div class="yModels"><div>${shapeSvg(pb.kind, pb.N, firstN(pb.a), false)}</div></div>`;
    if(steps() && !Y.done) h += `<p class="hint" style="margin:0 0 6px">Count the shaded parts for the top. Count <u>all</u> the parts for the bottom.</p>`;
    if(Y.done){ $('yBody').innerHTML = h + `<div class="yStmt">${fr(pb.a, pb.N)}</div>`; return; }
    $('yBody').innerHTML = h + frIn('yT', 'yB'); $('yCheck').hidden = false; $('yT').focus(); enterTo(['yT', 'yB']);
  }
  function checkName(pb){
    const t = read('yT'), b = read('yB');
    if(t === null || b === null){ setFb('Fill in the top and the bottom.'); return; }
    Y.tries++;
    if(t * pb.N === b * pb.a && b <= pb.N){ solved(t === pb.a ? 'Correct. ' + pb.a + ' of ' + pb.N + ' parts are shaded.' : 'Correct. ' + pb.a + '/' + pb.N + ' = ' + t + '/' + b + '.'); return; }
    let why = 'Count the shaded parts (' + pb.a + ') for the top and all the parts (' + pb.N + ') for the bottom.';
    if(t === pb.N - pb.a && b === pb.N) why = 'That\'s the unshaded part. ' + why;
    else if(t === pb.a && b === pb.N - pb.a) why = 'The bottom is all the parts, not just the unshaded ones. ' + why;
    else if(t === pb.N && b === pb.a) why = 'That\'s flipped. ' + why;
    wrong(why, () => revealed('It\'s ' + pb.a + '/' + pb.N + '. ' + why));
  }
  function rPair(pb){
    const showLab = steps() || Y.done || Y.stage === 1;
    let h = `<p class="xQ" style="margin-top:0">Which two show equivalent fractions? Tap two.</p><div class="yModels">` +
      pb.models.map((m, i) => `<button class="yModel${pb.picked.includes(i) || (Y.done && pb.pair.includes(i)) ? ' sel' : ''}" data-m="${i}" ${Y.done || Y.stage === 1 ? 'disabled' : ''}>${shapeSvg(m.kind, m.N, firstN(m.a), false)}<span class="lab">${showLab ? m.a + '/' + m.N : ''}</span></button>`).join('') + '</div>';
    if(steps() && Y.stage === 0 && !Y.done) h += `<p class="hint" style="margin:0 0 6px">Equivalent means the same amount is shaded, even if the pieces are different sizes.</p>`;
    if(Y.stage === 1 && !Y.done) h += `<p class="xQ">Now write it as a fraction statement, not the picture numbers:</p><div class="yStmt">${frIn('yT', 'yB')} = ${frIn('yT2', 'yB2')}</div>`;
    if(Y.done){ const [i, j] = pb.pair; h += `<div class="yStmt">${fr(pb.models[i].a, pb.models[i].N)} = ${fr(pb.models[j].a, pb.models[j].N)}</div>`; }
    $('yBody').innerHTML = h;
    if(!Y.done && Y.stage === 0) $('yBody').querySelectorAll('[data-m]').forEach(b => b.onclick = () => {
      const i = +b.dataset.m; pb.picked = pb.picked.includes(i) ? pb.picked.filter(x => x !== i) : pb.picked.concat(i).slice(-2); rPair(pb);
    });
    $('yCheck').hidden = Y.done || (Y.stage === 0 && pb.picked.length !== 2);
    if(Y.stage === 1 && !Y.done){ $('yT').focus(); enterTo(['yT', 'yB', 'yT2', 'yB2']); }
  }
  function checkPair(pb){
    const ms = pb.models;
    if(Y.stage === 0){
      Y.tries++;
      const [i, j] = pb.picked;
      if(pb.pair.includes(i) && pb.pair.includes(j)){ Y.stage = 1; Y.tries = 0; setFb('Yes, those two have the same amount shaded.', 'ok'); rPair(pb); return; }
      const why = ms[i].a + '/' + ms[i].N + ' and ' + ms[j].a + '/' + ms[j].N + ' are not the same amount. Look for two with the same amount shaded.';
      wrong(why, () => revealed('The equivalent ones are ' + ms[pb.pair[0]].a + '/' + ms[pb.pair[0]].N + ' and ' + ms[pb.pair[1]].a + '/' + ms[pb.pair[1]].N + '.'), () => { pb.picked = []; });
      return;
    }
    const v = ['yT', 'yB', 'yT2', 'yB2'].map(read);
    if(v.some(x => x === null)){ setFb('Fill in all four numbers.'); return; }
    Y.tries++;
    const fits = (t, b) => pb.pair.some(k => ms[k].a === t && ms[k].N === b);
    if(fits(v[0], v[1]) && fits(v[2], v[3]) && !(v[0] === v[2] && v[1] === v[3])){ solved('Correct. ' + v[0] + '/' + v[1] + ' = ' + v[2] + '/' + v[3] + '.'); return; }
    const why = 'For each picture, the top is the shaded parts and the bottom is all the parts.';
    if(Y.tries < 2) mistake('Not quite. ' + why); else { const [i, j] = pb.pair; revealed('It\'s ' + ms[i].a + '/' + ms[i].N + ' = ' + ms[j].a + '/' + ms[j].N + '. ' + why); }
  }

  function check(){
    if(!Y || Y.done) return;
    const pb = Y.order[Y.i];
    ({ improper: checkImp, shade: checkShade, readName: checkName, readPair: checkPair })[pb.type](pb);
  }
  $('yCheck').onclick = check;
  $('yNext').onclick = () => { if(Y.i < Y.order.length - 1){ Y.i++; show(); } else finish(); };
  $('yQuit').onclick = () => finish(true);
  function finish(early){
    const done = early ? Y.i + (Y.done ? 1 : 0) : Y.order.length;
    if(early && !Y.done && Y.err) Y.missed.push(Y.order[Y.i]);
    $('yRun').hidden = true; $('yDone').hidden = false;
    $('ydScore').textContent = (done ? Math.round(Y.score / done * 100) : 0) + '%';
    $('ydLine').textContent = Y.score + ' of ' + done + ' right with no mistakes' + (early && done < Y.order.length ? ' (ended early)' : '') + '.';
    timerFinish('frac2', Y.misses, !early || done >= Y.order.length, 'yTimes');
    $('yMissedWrap').hidden = !Y.missed.length; $('yRetry').hidden = !Y.missed.length;
    $('yMissedList').innerHTML = Y.missed.map(pb => `<li style="font-size:20px">${answerText(pb)}</li>`).join('');
  }
  $('yAgain').onclick = () => start();
  $('yRetry').onclick = () => start(Y.missed.map(pb => Object.assign({}, pb, { done:false })), false);
  $('yBack').onclick = () => { $('yDone').hidden = true; $('fracSetup').hidden = false; showSetupBest('frac'); };
  (window.LOADED_EXTRA = window.LOADED_EXTRA || []).push('js/fractions2.js');
})();
