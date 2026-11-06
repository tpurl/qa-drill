// Q&A Drill: nightly checklist (add-on loaded from start.js)
// One list per school night. Tap a step to start it and tap again when it's done; the real times are kept
// so you can see how long each step and each 15-minute break actually takes. Each night is saved to a history.
// Each list is plain text so it is easy to change: one step per line, "time | step", and "Break" for a break.
(function(){
  const DAYS = [['mon','Monday'],['tue','Tuesday'],['wed','Wednesday'],['thu','Thursday']];
  // Monday is the night the packet comes home; Tuesday to Thursday follow the same plan without the card and app steps
  const after = (practice) => [
    practice,
    'Read fluency passage (time it) ~10',
    'IXL computer work',
    'Write definitions in packet',
    'Bath',
    'Pick out clothes and get dressed',
    'Head home'
  ];
  const DEFAULTS = {
    mon: ['3:00 pm | Write words in packet', 'Put words and definitions on cards', '4:00 pm | Pick up Kyler and get food',
          'Eat, and add the new weekly packet to the app']
          .concat(after('Practice words 1–5: spelling and definitions, write words and definitions 2 times each.')).join('\n'),
    tue: ['3:00 pm | Write words in packet', '4:00 pm | Pick up Kyler and get food', 'Eat']
          .concat(after('Practice words 6–10: spelling and definitions, write words and definitions 2 times each.')).join('\n'),
    wed: ['3:00 pm | Write words in packet', '4:00 pm | Pick up Kyler and get food', 'Eat']
          .concat(after('Practice words 11–15: spelling and definitions, write words and definitions 2 times each.')).join('\n'),
    thu: ['3:00 pm | Write words in packet', '4:00 pm | Pick up Kyler and get food', 'Eat']
          .concat(after('Review all words: spelling and definitions, write words and definitions 2 times each.')).join('\n')
  };

  document.head.insertAdjacentHTML('beforeend', `<style>
    .clDays{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px}
    .clDays .btn{padding:7px 12px}
    .clProg{height:12px;background:var(--rule);border-radius:6px;overflow:hidden;margin:8px 0 4px}
    .clProg span{display:block;height:100%;background:var(--ok);transition:width .25s}
    ol.clList{list-style:none;margin:10px 0 0;padding:0;display:grid;gap:8px}
    .clItem{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;background:var(--card);border:2px solid var(--rule);border-radius:10px;padding:10px 12px;cursor:pointer;user-select:none}
    .clItem .box{flex:none;width:28px;height:28px;border-radius:8px;border:2.5px solid var(--muted);display:grid;place-items:center;font-weight:700;color:#fff}
    .clItem.done{background:var(--ok-bg);border-color:var(--ok)}
    .clItem.done .box{background:var(--ok);border-color:var(--ok)}
    .clItem.done .txt{text-decoration:line-through;color:var(--muted)}
    .clItem .time{font-size:13px;font-weight:700;color:var(--accent);display:block}
    .clItem .txt{font-size:17px;font-weight:700}
    .clItem > span:nth-child(2){flex:1;min-width:0}
    .clItem .go{flex-basis:100%;padding-left:40px;display:flex;gap:8px}
    .clItem .go .btn{padding:6px 14px;font-size:15px}
    .clBreak{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:14px;font-weight:700;padding:2px 6px;cursor:pointer}
    .clBreak::before,.clBreak::after{content:"";flex:1;border-top:2px dashed var(--rule)}
    .clBreak.done{color:var(--ok)}
    .clItem.run{border-color:var(--accent);background:var(--sel)}
    .clItem.run .box{border-color:var(--accent)}
    .clItem .act{display:block;font-size:13px;font-weight:700;color:var(--muted);margin-top:2px}
    .clItem.run .act{color:var(--accent)}
    .clItem .act.over{color:var(--bad)}
    .clBreak{flex-wrap:wrap}
    .clBreak .bt{flex:none}
    .clBreak.run{color:var(--accent)}
    .clBreak.over{color:var(--bad)}
    .clSum{display:grid;grid-template-columns:1fr 1fr;gap:6px 14px;background:var(--bg);border-radius:10px;padding:10px 12px;font-size:14px;margin:6px 0 4px}
    .clSum b{display:block;font-size:17px;color:var(--ink)}
    table.clHist{width:100%;border-collapse:collapse;font-size:14px;font-variant-numeric:tabular-nums}
    table.clHist td,table.clHist th{padding:6px 6px;border-bottom:1px solid var(--rule);text-align:left}
    table.clHist th{color:var(--muted);font-size:12px}
    .clDone{background:var(--ok-bg);border:2px solid var(--ok);border-radius:12px;padding:14px;text-align:center;font-family:"Bricolage Grotesque",system-ui,sans-serif;font-size:22px;font-weight:700;color:var(--ok);margin-top:12px}
  </style>`);
  const nav = document.querySelector('nav.tabs');
  nav.insertAdjacentHTML('afterbegin', '<button role="tab" data-tab="check" aria-selected="false">Tonight</button>');
  $('tab-edit').insertAdjacentHTML('beforebegin', `
  <section id="tab-check" hidden>
    <div class="panel">
      <h2 style="font-size:24px;margin-bottom:10px">Tonight's checklist</h2>
      <div class="clDays" id="clDays"></div>
      <p class="hint" style="margin:0 0 6px">Tap a step when you <b>start</b> it, and tap again when it's <b>done</b>. Each break is 15 minutes, with a countdown. Tap the box to check a step off right away.</p>
      <div class="meta" style="margin:0"><span id="clCount"></span><span id="clDate"></span></div>
      <div class="clProg"><span id="clBar"></span></div>
      <div class="clSum" id="clSum"></div>
      <ol class="clList" id="clList"></ol>
      <div class="clDone" id="clDone" hidden>All done tonight! Great work. 🎉</div>
      <div id="clHistWrap" style="margin-top:18px" hidden>
        <h3 style="font-size:18px;margin-bottom:6px">Past nights</h3>
        <div style="overflow-x:auto"><table class="clHist"><thead><tr><th>Night</th><th>Start</th><th>Finish</th><th>Total</th><th>vs plan</th><th>Work</th><th>Breaks</th></tr></thead><tbody id="clHist"></tbody></table></div>
      </div>
      <div class="row" style="margin-top:16px">
        <button class="btn quiet" id="clReset">Start tonight over</button>
        <button class="btn quiet" id="clEditBtn">Change this list</button>
      </div>
      <div id="clEdit" hidden style="margin-top:14px">
        <p class="hint">One step per line. Put a time first with a | if you want one, like <code>4:00 pm | Pick up Kyler</code>. Type <code>Break</code> for a break. Every step is estimated at 30 minutes; end a line with <code>~20</code> to estimate 20 minutes instead. A step that mentions words 1–5, 6–10, 11–15, "all words" or fluency gets a button that opens that practice.</p>
        <textarea id="clText" style="min-height:280px"></textarea>
        <div class="row" style="margin-top:10px">
          <button class="btn" id="clSave">Save list</button>
          <button class="btn quiet" id="clCancel">Cancel</button>
          <button class="btn quiet" id="clDefault">Put back the original</button>
        </div>
      </div>
    </div>
  </section>`);
  const myBtn = nav.querySelector('[data-tab="check"]');
  const baseShowTabCl = showTab;
  showTab = function(name){
    if(name === 'check'){
      baseShowTabCl('edit'); $('tab-edit').hidden = true; $('tab-check').hidden = false;
      nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b === myBtn));
      render();
    } else { baseShowTabCl(name); $('tab-check').hidden = true; myBtn.setAttribute('aria-selected', 'false'); }
  };
  myBtn.onclick = () => showTab('check');

  const BREAK_MIN = 15, TASK_MIN = 30;   // estimates: every task 30 minutes, every break 15 (a line ending in ~20 uses 20 instead)
  const store = () => { const c = (data.checklist = data.checklist || { lists: {}, done: {} }); c.nights = c.nights || {}; c.history = c.history || []; return c; };
  const todayKey = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const todayDay = () => ({ 1:'mon', 2:'tue', 3:'wed', 4:'thu' })[new Date().getDay()] || 'mon';
  let day = null;
  // November 2026 plan: replace the saved Tuesday-Thursday lists with the new ones (Monday was set by hand)
  const baseLoadCl = load;
  load = function(){
    baseLoadCl();
    const c = store();
    if(!c.planNov){ c.planNov = true; ['tue','wed','thu'].forEach(d => delete c.lists[d]); if(c.lists.mon && c.lists.mon.replace(/\s+/g, ' ').trim() === DEFAULTS.mon.replace(/\s+/g, ' ').trim()) delete c.lists.mon; save(); }
  };
  const listText = d => store().lists[d] || DEFAULTS[d];
  function parse(text){
    return text.split('\n').map(l => l.trim()).filter(Boolean).map((l, i) => {
      if(/^break$/i.test(l)) return { i, brk: true, text: 'Break', est: BREAK_MIN };
      const m = l.match(/^([^|]+)\|(.+)$/);
      let time = m ? m[1].trim() : '', t = m ? m[2].trim() : l, est = TASK_MIN;
      const em = t.match(/\s*~\s*(\d+)\s*(min)?\s*$/i); if(em){ est = +em[1]; t = t.slice(0, em.index).trim(); }
      // link steps that mention a group of words, or fluency, to that practice
      let link = null;
      const g = t.match(/words?\s*(\d+)\s*[–-]\s*(\d+)/i);
      if(g){ const a = +g[1], b = +g[2]; link = (a === 1 && b === 10) ? 'to2' : String(Math.floor((a - 1) / 5)); }
      else if(/all (the )?words|review all/i.test(t)) link = 'all';
      else if(/fluency/i.test(t)) link = 'flu';
      return { i, time, text: t, link, est };
    });
  }
  // tonight's record: { start, rows: { i: { s, e } } }
  const nightKey = () => day + '|' + todayKey();
  function night(){
    const s = store(), k = nightKey();
    Object.keys(s.nights).forEach(x => { if(!x.endsWith(todayKey())) delete s.nights[x]; });   // keep only today
    return (s.nights[k] = s.nights[k] || { rows: {} });
  }
  const now = () => Date.now();
  const mins = ms => Math.round(ms / 60000);
  const hm = ms => { const m = Math.max(0, Math.round(ms / 60000)); return m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60) + ' min' : m + ' min'; };
  const mmss = ms => { const t = Math.max(0, Math.round(ms / 1000)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
  const clock = t => new Date(t).toLocaleTimeString(undefined, { hour:'numeric', minute:'2-digit' });
  const lastEnd = n => Math.max(0, ...Object.values(n.rows).map(r => r.e || 0));
  function finishRunning(n, t){ Object.values(n.rows).forEach(r => { if(r.s && !r.e) r.e = t; }); }
  function totals(steps, n){
    let work = 0, brk = 0, nBrk = 0;
    steps.forEach(st => { const r = n.rows[st.i]; if(!r || !r.s) return; const d = (r.e || now()) - r.s; if(st.brk){ brk += d; nBrk++; } else work += d; });
    return { work, brk, nBrk };
  }
  const planMin = steps => steps.reduce((a, st) => a + st.est, 0);
  // the plan starts at the first time written in the list (4:00 pm), on today's date
  // "4:00 pm" (or the start of "4:30–5:00 pm") as a time today; null if there isn't one
  function timeOf(txt){
    const m = txt && txt.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i); if(!m) return null;
    const ap = m[3] || (txt.match(/(am|pm)/i) || [, 'pm'])[1];
    let h = +m[1]; if(/pm/i.test(ap) && h < 12) h += 12; if(/am/i.test(ap) && h === 12) h = 0;
    const d = new Date(); d.setHours(h, +m[2], 0, 0); return d.getTime();
  }
  function planStart(steps){
    const first = steps.find(st => timeOf(st.time) !== null);
    if(first) return timeOf(first.time);
    const d = new Date(); d.setHours(16, 0, 0, 0); return d.getTime();
  }
  // the plan by itself: estimates in order, waiting for any step with a set time (like the 4:00 pm pick-up)
  const planEnd = steps => schedule(steps, { rows: {} }, 0).end;
  const planMs = steps => planEnd(steps) - planStart(steps);
  // estimated time still needed: unfinished steps at their estimate, minus time already spent on the running one
  function remainingMs(steps, n, t){
    return steps.reduce((a, st) => { const r = n.rows[st.i] || {}; if(r.e) return a; const est = st.est * 60000; return a + (r.s ? Math.max(0, est - (t - r.s)) : est); }, 0);
  }
  // when each step runs: done steps use their real times; the running step ends at its estimate (or now, if it's
  // gone over); every step after that starts when the one before it is expected to finish
  function schedule(steps, n, t){
    let cur = n.start ? n.start : planStart(steps);
    const out = {};
    steps.forEach(st => {
      const r = n.rows[st.i] || {}, est = st.est * 60000;
      if(r.e){ out[st.i] = { s: r.s, e: r.e }; cur = r.e; }
      else if(r.s){ const e = Math.max(r.s + est, t); out[st.i] = { s: r.s, e }; cur = e; }
      else { const at = timeOf(st.time); if(at !== null && at > cur) cur = at; out[st.i] = { s: cur, e: cur + est }; cur += est; }
    });
    out.end = cur; return out;
  }
  const rng = (a, b) => { const A = clock(a), B = clock(b), pa = A.slice(-2), pb = B.slice(-2); return (pa === pb && /[AP]M/i.test(pa) ? A.slice(0, -3) : A) + '–' + B; };
  const diffTxt = (ms) => { const m = Math.round(ms / 60000); return m === 0 ? 'right on time' : hm(Math.abs(ms)) + ' ' + (m > 0 ? 'over' : 'under'); };
  function breakLabel(r, t, w){
    const done = !!r.e, run = r.s && !r.e;
    const used = r.s ? (r.e || t) - r.s : 0, left = BREAK_MIN * 60000 - used, over = !!r.s && left < 0;
    const text = done ? `✓ Break ${rng(r.s, r.e)}: ${hm(used)}${used > BREAK_MIN * 60000 + 30000 ? ' (' + hm(used - BREAK_MIN * 60000) + ' over)' : ''}`
      : run ? (over ? `Break: ${mmss(-left)} over. Tap when it's over` : `Break: ${mmss(left)} left. Tap when it's over`) : `Break ${w ? rng(w.s, w.e) : ''} (${BREAK_MIN} min). Tap to start`;
    return { text, over };
  }
  function actLabel(r, t, est, w){
    const took = r.s ? (r.e || t) - r.s : 0;
    return r.e ? `${rng(r.s, r.e)}: took ${hm(took)} (${diffTxt(took - est * 60000)})`
      : r.s ? `${rng(r.s, r.s + est * 60000)}: ${mmss(took)} of ${est} min. Tap when done` : `${w ? rng(w.s, w.e) : ''} (${est} min)`;
  }
  function summary(steps, n, t){
    const tasks = steps.filter(s => !s.brk), doneN = tasks.filter(s => n.rows[s.i] && n.rows[s.i].e).length, breaks = steps.length - tasks.length;
    const tt = totals(steps, n), allDone = tasks.length && doneN === tasks.length, end = allDone ? lastEnd(n) : t;
    const plan = planMs(steps), ps = planStart(steps);
    const planLine = `<span>Plan: ${tasks.length} step${tasks.length === 1 ? '' : 's'}${breaks ? ' + ' + breaks + ' break' + (breaks === 1 ? '' : 's') : ''}<b>${hm(plan)}</b></span><span>Planned finish<b>${clock(ps + plan)}</b> if started at ${clock(ps)}</span>`;
    if(!n.start) return planLine;
    const proj = allDone ? end : schedule(steps, n, t).end;
    return `<span>Started<b>${clock(n.start)}</b></span><span>${allDone ? 'Finished' : 'Time so far'}<b>${allDone ? clock(end) + ' (' + hm(end - n.start) + ')' : hm(t - n.start)}</b></span>` +
      (breaks ? `<span>Work time<b>${hm(tt.work)}</b></span><span>Break time<b>${hm(tt.brk)}</b> ${tt.nBrk} of ${breaks} breaks</span>` : '') +
      `<span>${allDone ? 'Planned' : 'Planned finish'}<b>${allDone ? hm(plan) : clock(ps + plan)}</b></span><span>${allDone ? 'Compared to plan' : 'Finish at this pace'}<b>${allDone ? diffTxt((end - n.start) - plan) : clock(proj)}</b></span>`;
  }
  // update only the running clocks, so taps aren't lost while the list redraws
  function tick(){
    const steps = parse(listText(day)), n = night(), t = now();
    $('clSum').innerHTML = summary(steps, n, t);
    const sc = schedule(steps, n, t);
    $('clList').querySelectorAll('li:not(.done)').forEach(li => {
      const i = +li.dataset.i, r = n.rows[i] || {}, st = steps.find(x => x.i === i); if(!st) return;
      if(li.classList.contains('clBreak')){ const L = breakLabel(r, t, sc[i]); li.querySelector('.bt').textContent = L.text; li.classList.toggle('over', L.over); }
      else { const a = li.querySelector('.act'); if(a) a.textContent = actLabel(r, t, st.est, sc[i]); }
    });
  }
  function render(){
    if(!day) day = todayDay();
    $('clDays').innerHTML = DAYS.map(([k, n]) => `<button class="btn ${k === day ? '' : 'quiet'}" data-d="${k}">${n}${k === todayDay() && [1,2,3,4].includes(new Date().getDay()) ? ' (today)' : ''}</button>`).join('');
    $('clDays').querySelectorAll('[data-d]').forEach(b => b.onclick = () => { day = b.dataset.d; $('clEdit').hidden = true; render(); });
    const steps = parse(listText(day)), n = night(), t = now();
    const tasks = steps.filter(s => !s.brk), doneN = tasks.filter(s => n.rows[s.i] && n.rows[s.i].e).length;
    const breaks = steps.filter(s => s.brk).length;
    $('clCount').textContent = doneN + ' of ' + tasks.length + ' steps done';
    $('clDate').textContent = new Date().toLocaleDateString(undefined, { weekday:'long', month:'short', day:'numeric' });
    $('clBar').style.width = (tasks.length ? doneN / tasks.length * 100 : 0) + '%';
    // summary
    const allDone = tasks.length && doneN === tasks.length;
    $('clSum').innerHTML = summary(steps, n, t);
    // rows
    const sc = schedule(steps, n, t);
    $('clList').innerHTML = steps.map(st => {
      const r = n.rows[st.i] || {}, run = r.s && !r.e, done = !!r.e;
      if(st.brk){
        const L = breakLabel(r, t, sc[st.i]);
        return `<li class="clBreak${done ? ' done' : ''}${run ? ' run' : ''}${L.over && !done ? ' over' : ''}" data-i="${st.i}"><span class="bt">${L.text}</span></li>`;
      }
      const act = actLabel(r, t, st.est, sc[st.i]);
      return `<li class="clItem${done ? ' done' : ''}${run ? ' run' : ''}" data-i="${st.i}"><span class="box" data-box="1">${done ? '✓' : ''}</span>
          <span>${st.time ? `<span class="time">Set for ${esc(st.time)}</span>` : ''}<span class="txt">${esc(st.text)}</span>${act ? `<span class="act">${act}</span>` : ''}</span>
          ${st.link ? (st.link === 'flu' ? `<span class="go"><button class="btn quiet" data-go="flu">Fluency</button></span>` : `<span class="go"><button class="btn quiet" data-go="spell" data-g="${st.link}">Spelling</button> <button class="btn quiet" data-go="flash" data-g="${st.link}">Cards</button></span>`) : ''}</li>`;
    }).join('');
    $('clDone').hidden = !allDone;
    if(allDone) saveHistory(steps, n);
    renderHistory();
  }
  function saveHistory(steps, n){
    const s = store(), k = nightKey(), tt = totals(steps, n), end = lastEnd(n);
    const rec = { k, day, date: todayKey(), start: n.start, end, work: tt.work, brk: tt.brk, plan: planMs(steps),
      steps: steps.map(st => { const r = n.rows[st.i] || {}; return [st.brk ? 'Break' : st.text, r.s && r.e ? mins(r.e - r.s) : null]; }) };
    s.history = s.history.filter(h => h.k !== k); s.history.unshift(rec); s.history.splice(20); save();
  }
  function renderHistory(){
    const h = store().history;
    $('clHistWrap').hidden = !h.length;
    $('clHist').innerHTML = h.map(r => `<tr><td>${new Date(r.date + 'T12:00:00').toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' })}</td><td>${clock(r.start)}</td><td>${clock(r.end)}</td><td>${hm(r.end - r.start)}</td><td>${r.plan ? diffTxt((r.end - r.start) - r.plan) : ''}</td><td>${hm(r.work)}</td><td>${hm(r.brk)}</td></tr>`).join('');
  }
  // tap a step: start it (ending whatever was running), tap again: done, tap a done step: undo
  $('clList').addEventListener('click', e => {
    const go = e.target.closest('[data-go]');
    if(go){
      e.stopPropagation();
      if(go.dataset.go === 'flu'){ showTab('flu'); return; }
      const sw = data.sets.find(st => st.name === 'Spelling words');
      if(sw && data.cur !== sw.id) switchTo(sw.id);
      setRange(go.dataset.g === 'all' || go.dataset.g === 'to2' ? go.dataset.g : +go.dataset.g);
      showTab(go.dataset.go);
      return;
    }
    const li = e.target.closest('[data-i]'); if(!li) return;
    const n = night(), i = +li.dataset.i, r = n.rows[i] || {}, t = now();
    if(r.e){ if(confirm('Mark this step as not done? Its time will be cleared.')) delete n.rows[i]; }
    else if(r.s) r.e = t;
    else if(e.target.closest('[data-box]')){ const from = lastEnd(n) || n.start || t; finishRunning(n, t); n.rows[i] = { s: Math.min(from, t), e: t }; if(!n.start) n.start = n.rows[i].s; }
    else { finishRunning(n, t); n.rows[i] = { s: t }; if(!n.start) n.start = t; }
    save(); render();
  });
  // live clocks while something is running
  setInterval(() => { if(!$('tab-check').hidden && day){ const n = night(); if(Object.values(n.rows).some(r => r.s && !r.e)) tick(); } }, 1000);
  $('clReset').onclick = () => { if(confirm('Clear tonight\'s times for ' + DAYS.find(d => d[0] === day)[1] + ' and start over?')){ delete store().nights[nightKey()]; save(); render(); } };
  $('clEditBtn').onclick = () => { $('clText').value = listText(day); $('clEdit').hidden = false; $('clText').focus(); };
  $('clCancel').onclick = () => { $('clEdit').hidden = true; };
  $('clSave').onclick = () => { store().lists[day] = $('clText').value.trim(); delete store().nights[nightKey()]; save(); $('clEdit').hidden = true; render(); };
  $('clDefault').onclick = () => { $('clText').value = DEFAULTS[day]; };
  (window.LOADED_EXTRA = window.LOADED_EXTRA || []).push('js/checklist.js');
})();
