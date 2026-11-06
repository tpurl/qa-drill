// Q&A Drill: nightly checklist (add-on loaded from start.js)
// One list per school night. Tap a step to check it off; checks reset each day.
// Each list is plain text so it is easy to change: one step per line, "time | step", and "Break" for a break.
(function(){
  const DAYS = [['mon','Monday'],['tue','Tuesday'],['wed','Wednesday'],['thu','Thursday']];
  const common = (practice) => [
    '4:00 pm | Pick up Kyler and get food',
    '4:30–5:00 pm | Eat',
    'Break',
    practice,
    'Break',
    'IXL computer work, 15 minutes',
    'Break',
    'Math',
    'Break',
    'Daily homework',
    'Break',
    'Write words in packet',
    'Break',
    'Write definitions in packet',
    'Break',
    'IXL computer work, 15 minutes',
    'Bath',
    'Pick out clothes and get dressed',
    'Read',
    'Break',
    'Head home'
  ].join('\n');
  const DEFAULTS = {
    mon: ['4:00 pm | Pick up Kyler and get food', '4:30–5:00 pm | Eat, and add the new weekly packet to the app', '5:00 pm | Put words and definitions on cards',
          'Break', 'Practice words 1–5: spelling and definitions', 'Break', 'IXL computer work, 15 minutes', 'Break', 'Math', 'Break', 'Daily homework',
          'Break', 'Write words in packet', 'Break', 'Write definitions in packet', 'Break', 'IXL computer work, 15 minutes', 'Bath',
          'Pick out clothes and get dressed', 'Read', 'Break', 'Head home'].join('\n'),
    tue: common('Practice words 6–10: spelling and definitions'),
    wed: common('Practice words 11–15: spelling and definitions'),
    thu: common('Review all words: spelling and definitions')
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
    .clDone{background:var(--ok-bg);border:2px solid var(--ok);border-radius:12px;padding:14px;text-align:center;font-family:"Bricolage Grotesque",system-ui,sans-serif;font-size:22px;font-weight:700;color:var(--ok);margin-top:12px}
  </style>`);
  const nav = document.querySelector('nav.tabs');
  nav.insertAdjacentHTML('afterbegin', '<button role="tab" data-tab="check" aria-selected="false">Tonight</button>');
  $('tab-edit').insertAdjacentHTML('beforebegin', `
  <section id="tab-check" hidden>
    <div class="panel">
      <h2 style="font-size:24px;margin-bottom:10px">Tonight's checklist</h2>
      <div class="clDays" id="clDays"></div>
      <div class="meta" style="margin:0"><span id="clCount"></span><span id="clDate"></span></div>
      <div class="clProg"><span id="clBar"></span></div>
      <ol class="clList" id="clList"></ol>
      <div class="clDone" id="clDone" hidden>All done tonight! Great work. 🎉</div>
      <div class="row" style="margin-top:16px">
        <button class="btn quiet" id="clReset">Uncheck everything</button>
        <button class="btn quiet" id="clEditBtn">Change this list</button>
      </div>
      <div id="clEdit" hidden style="margin-top:14px">
        <p class="hint">One step per line. Put a time first with a | if you want one, like <code>4:00 pm | Pick up Kyler</code>. Type <code>Break</code> for a break. A step that mentions words 1–5, 6–10, 11–15 or "all words" gets a button that opens that practice.</p>
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

  const store = () => (data.checklist = data.checklist || { lists: {}, done: {} });
  const todayKey = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const todayDay = () => ({ 1:'mon', 2:'tue', 3:'wed', 4:'thu' })[new Date().getDay()] || 'mon';
  let day = null;
  const listText = d => store().lists[d] || DEFAULTS[d];
  function parse(text){
    return text.split('\n').map(l => l.trim()).filter(Boolean).map((l, i) => {
      if(/^break$/i.test(l)) return { i, brk: true, text: 'Break' };
      const m = l.match(/^([^|]+)\|(.+)$/);
      const time = m ? m[1].trim() : '', t = m ? m[2].trim() : l;
      // link steps that mention a group of words to that practice
      let link = null;
      const g = t.match(/words?\s*(\d+)\s*[–-]\s*(\d+)/i);
      if(g){ const a = +g[1], b = +g[2]; link = (a === 1 && b === 10) ? 'to2' : String(Math.floor((a - 1) / 5)); }
      else if(/all (the )?words|review all/i.test(t)) link = 'all';
      return { i, time, text: t, link };
    });
  }
  const doneSet = () => { const k = day + '|' + todayKey(); return new Set(store().done[k] || []); };
  function setDone(set){
    const s = store(), k = day + '|' + todayKey();
    s.done[k] = [...set];
    Object.keys(s.done).forEach(x => { if(!x.endsWith(todayKey())) delete s.done[x]; });   // forget older days
    save();
  }
  function render(){
    if(!day) day = todayDay();
    $('clDays').innerHTML = DAYS.map(([k, n]) => `<button class="btn ${k === day ? '' : 'quiet'}" data-d="${k}">${n}${k === todayDay() && [1,2,3,4].includes(new Date().getDay()) ? ' (today)' : ''}</button>`).join('');
    $('clDays').querySelectorAll('[data-d]').forEach(b => b.onclick = () => { day = b.dataset.d; $('clEdit').hidden = true; render(); });
    const steps = parse(listText(day)), done = doneSet();
    const tasks = steps.filter(s => !s.brk), n = tasks.filter(s => done.has(s.i)).length;
    $('clCount').textContent = n + ' of ' + tasks.length + ' done';
    $('clDate').textContent = new Date().toLocaleDateString(undefined, { weekday:'long', month:'short', day:'numeric' });
    $('clBar').style.width = (tasks.length ? n / tasks.length * 100 : 0) + '%';
    $('clList').innerHTML = steps.map(s => s.brk
      ? `<li class="clBreak${done.has(s.i) ? ' done' : ''}" data-i="${s.i}">${done.has(s.i) ? '✓ ' : ''}Break</li>`
      : `<li class="clItem${done.has(s.i) ? ' done' : ''}" data-i="${s.i}"><span class="box">${done.has(s.i) ? '✓' : ''}</span>
          <span>${s.time ? `<span class="time">${esc(s.time)}</span>` : ''}<span class="txt">${esc(s.text)}</span></span>
          ${s.link ? `<span class="go"><button class="btn quiet" data-go="spell" data-g="${s.link}">Spelling</button> <button class="btn quiet" data-go="flash" data-g="${s.link}">Cards</button></span>` : ''}</li>`).join('');
    $('clDone').hidden = !(tasks.length && n === tasks.length);
  }
  $('clList').addEventListener('click', e => {
    const go = e.target.closest('[data-go]');
    if(go){
      e.stopPropagation();
      const sw = data.sets.find(st => st.name === 'Spelling words');
      if(sw && data.cur !== sw.id) switchTo(sw.id);
      setRange(go.dataset.g === 'all' || go.dataset.g === 'to2' ? go.dataset.g : +go.dataset.g);
      showTab(go.dataset.go);
      return;
    }
    const li = e.target.closest('[data-i]'); if(!li) return;
    const set = doneSet(), i = +li.dataset.i;
    set.has(i) ? set.delete(i) : set.add(i);
    setDone(set); render();
  });
  $('clReset').onclick = () => { if(confirm('Uncheck every step for ' + DAYS.find(d => d[0] === day)[1] + '?')){ setDone(new Set()); render(); } };
  $('clEditBtn').onclick = () => { $('clText').value = listText(day); $('clEdit').hidden = false; $('clText').focus(); };
  $('clCancel').onclick = () => { $('clEdit').hidden = true; };
  $('clSave').onclick = () => { store().lists[day] = $('clText').value.trim(); setDone(new Set()); $('clEdit').hidden = true; render(); };
  $('clDefault').onclick = () => { $('clText').value = DEFAULTS[day]; };
  (window.LOADED_EXTRA = window.LOADED_EXTRA || []).push('js/checklist.js');
})();
