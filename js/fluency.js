// Q&A Drill: Fluency tab (add-on loaded from start.js)
// The week's fluency passage with a stopwatch, a daily time log against the goal, a read-aloud at goal pace,
// and the vocabulary words highlighted (tap one to see what it means).
(function(){
  const PASSAGE = {
    id: '2026-10-05', title: 'The Power of a Good Idea', goal: 150,   // goal in seconds (2 min 30 sec)
    // times written on the sheet that week (Mon to Thu)
    sheetTimes: [['2026-10-05', 210], ['2026-10-06', 200], ['2026-10-07', 225], ['2026-10-08', 197]],
    text: [
      "When Maya's class was asked to improve their school garden, she knew they needed to analyze the problem before making a plan. The garden had become difficult to maintain because many of the plants were not getting enough sunlight or water. Maya wanted to find an accurate explanation for why the plants were struggling. She walked around the garden and took notes. She noticed that some plants were growing well, while others were small and weak.",
      "She also asked her classmates for their perspective on the problem. After gathering enough evidence, Maya and her group were able to identify several problems. They concluded that the garden needed a better watering system and more space between some of the plants. These changes were essential if they wanted the garden to grow successfully. The students had several ideas, but not every idea was relevant to the problem. Some students suggested adding decorations, while others wanted to paint the garden fence. Although those ideas were interesting, Maya explained that they would not solve the main problem. The group decided to generate a simple plan. They would move some plants, create a watering schedule, and maintain the garden each week.",
      "Their teacher said they had sufficient time and supplies to complete the project. At first, the changes did not seem significant. However, after several weeks, the plants began to grow taller and healthier. The students realized that small actions could have a big influence when everyone worked together. Maya smiled as she looked at the garden. She had learned that solving a problem does not always require a complicated answer. Sometimes, the most important step is to understand the problem, use the right evidence, and create a plan that everyone can follow."
    ]
  };
  const WORDS = PASSAGE.text.join(' ').split(/\s+/).length;

  document.head.insertAdjacentHTML('beforeend', `<style>
    .flPassage{font-size:19px;line-height:1.7;margin:4px 0 0}
    .flPassage p{margin:0 0 12px;text-indent:1.4em}
    .flPassage .vw{background:var(--sel);border-radius:4px;padding:0 3px;cursor:pointer;font-weight:700;border-bottom:2px solid var(--accent)}
    .flPassage .now{background:var(--ok-bg);border-radius:4px}
    .flClock{font-family:"Bricolage Grotesque",system-ui,sans-serif;font-size:56px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1}
    .flGoal{color:var(--muted);font-size:15px}
    .flBar{position:sticky;top:env(safe-area-inset-top,0px);z-index:2;background:var(--card);padding:10px 0;display:flex;align-items:center;gap:14px;flex-wrap:wrap;border-bottom:1px solid var(--rule);margin-bottom:12px}
    .flDef{background:var(--bg);border-left:4px solid var(--accent);border-radius:4px;padding:8px 12px;margin:0 0 12px}
    table.flLog{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums;font-size:16px}
    table.flLog td,table.flLog th{padding:6px 8px;border-bottom:1px solid var(--rule);text-align:left}
    table.flLog th{color:var(--muted);font-weight:700;font-size:14px}
    .flOk{color:var(--ok);font-weight:700} .flOver{color:var(--bad);font-weight:700}
  </style>`);
  const nav = document.querySelector('nav.tabs');
  nav.insertAdjacentHTML('beforeend', '<button role="tab" data-tab="flu" aria-selected="false">Fluency</button>');
  document.getElementById('tab-match').insertAdjacentHTML('afterend', `
  <section id="tab-flu" hidden>
    <div class="panel">
      <h2 style="font-size:24px;margin-bottom:4px" id="flTitle"></h2>
      <p class="flGoal" id="flGoalLine"></p>
      <div class="flBar">
        <div class="flClock" id="flClock">0:00</div>
        <button class="btn" id="flGo">Start reading</button>
        <button class="sayBtn small" id="flHear">Hear it at goal pace</button>
      </div>
      <div class="feedback" id="flMsg" aria-live="polite" style="margin-top:0"></div>
      <div class="flDef" id="flDef" hidden></div>
      <div class="flPassage" id="flText"></div>
    </div>
    <div class="panel">
      <h3 style="font-size:19px;margin-bottom:8px">Reading log</h3>
      <table class="flLog"><thead><tr><th>Day</th><th>Time</th><th>vs goal</th><th>Words/min</th></tr></thead><tbody id="flLog"></tbody></table>
      <p class="hint" style="margin:10px 0 0">Times from the paper sheet are included. Tap a time to remove it if it was a practice run.</p>
    </div>
  </section>`);
  const myBtn = nav.querySelector('[data-tab="flu"]');
  const baseShowTabFl = showTab;
  showTab = function(name){
    if(name === 'flu'){
      baseShowTabFl('edit'); $('tab-edit').hidden = true; $('tab-flu').hidden = false;
      nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b === myBtn));
      render();
    } else { baseShowTabFl(name); $('tab-flu').hidden = true; myBtn.setAttribute('aria-selected', 'false'); stopAll(); }
  };
  myBtn.onclick = () => showTab('flu');

  const fmtS = s => Math.floor(s / 60) + ':' + String(Math.round(s % 60)).padStart(2, '0');
  const wpm = s => Math.round(WORDS / (s / 60));
  function log(){
    data.fluency = data.fluency || {};
    if(!data.fluency[PASSAGE.id]) data.fluency[PASSAGE.id] = PASSAGE.sheetTimes.map(([d, s]) => ({ d, s, sheet:true }));
    return data.fluency[PASSAGE.id];
  }
  // vocabulary words from the Spelling words list, matched with their endings (concluded, maintain...)
  function vocabItems(){ const st = data.sets.find(x => x.name === 'Spelling words'); return st ? st.items : []; }
  function passageHtml(){
    const vi = vocabItems();
    let si = 0;
    return PASSAGE.text.map(par => '<p>' + par.split(/(?<=[.!?])\s+/).map(sent => {
      let h = esc(sent);
      vi.forEach(it => {
        const stem = it.q.toLowerCase().replace(/e$/, '');
        h = h.replace(new RegExp('\\b(' + stem + '[a-z]*)', 'gi'), (m) => `<span class="vw" data-q="${esc(it.q)}">${m}</span>`);
      });
      return `<span class="sent" data-i="${si++}">${h}</span>`;
    }).join(' ') + '</p>').join('');
  }
  function render(){
    $('flTitle').textContent = PASSAGE.title;
    const best = log().length ? Math.min(...log().map(e => e.s)) : null;
    $('flGoalLine').textContent = 'Goal: ' + fmtS(PASSAGE.goal) + ' (' + WORDS + ' words, about ' + wpm(PASSAGE.goal) + ' words a minute)' + (best ? '. Best so far: ' + fmtS(best) + '.' : '.');
    if(!$('flText').innerHTML) $('flText').innerHTML = passageHtml();
    const today = new Date().toISOString().slice(0, 10);
    $('flLog').innerHTML = log().slice().reverse().map((e, i) => {
      const diff = e.s - PASSAGE.goal;
      const day = new Date(e.d + 'T12:00:00').toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' });
      return `<tr><td>${day}${e.d === today ? ' (today)' : ''}${e.sheet ? ' 📄' : ''}</td><td><a href="#" data-del="${log().length - 1 - i}">${fmtS(e.s)}</a></td>` +
        `<td class="${diff <= 0 ? 'flOk' : 'flOver'}">${diff <= 0 ? 'goal met' : '+' + fmtS(diff)}</td><td>${wpm(e.s)}</td></tr>`;
    }).join('');
    $('flLog').querySelectorAll('[data-del]').forEach(a => a.onclick = ev => {
      ev.preventDefault();
      if(confirm('Remove this time from the log?')){ log().splice(+a.dataset.del, 1); save(); render(); }
    });
  }
  // tap a highlighted word to see its meaning
  $('flText').addEventListener('click', e => {
    const w = e.target.closest('.vw'); if(!w) return;
    const it = vocabItems().find(x => x.q === w.dataset.q); if(!it) return;
    const hook = hookOf(it);
    $('flDef').innerHTML = `<strong>${esc(cased(it.q))}</strong>: ${esc(it.a)}` + (hook ? `<br><span class="hint">💡 ${esc(hook)}</span>` : '');
    $('flDef').hidden = false;
  });

  // stopwatch
  let t0 = null, tick = null;
  function stopAll(){ clearInterval(tick); tick = null; t0 = null; if(canSpeak) speechSynthesis.cancel(); $('flGo').textContent = 'Start reading'; $('flHear').textContent = 'Hear it at goal pace'; hl(-1); reading = false; }
  $('flGo').onclick = () => {
    if(t0 === null){
      if(canSpeak) speechSynthesis.cancel(); reading = false; hl(-1); $('flHear').textContent = 'Hear it at goal pace';
      t0 = Date.now(); $('flGo').textContent = 'Done reading';
      $('flMsg').textContent = 'Read it out loud. Tap Done reading at the last word.'; $('flMsg').className = 'feedback';
      tick = setInterval(() => { $('flClock').textContent = fmtS((Date.now() - t0) / 1000); }, 250);
    } else {
      const s = Math.round((Date.now() - t0) / 1000);
      clearInterval(tick); tick = null; t0 = null; $('flGo').textContent = 'Start reading';
      $('flClock').textContent = fmtS(s);
      if(s < 30){ $('flMsg').textContent = 'That was under 30 seconds, so it wasn\'t saved.'; return; }
      const best = log().length ? Math.min(...log().map(e => e.s)) : Infinity;
      log().push({ d: new Date().toISOString().slice(0, 10), s }); save();
      const diff = s - PASSAGE.goal;
      $('flMsg').textContent = (diff <= 0 ? 'Goal met! ' : fmtS(diff) + ' over the goal. ') + (s < best ? 'New best time. ' : '') + wpm(s) + ' words a minute.';
      $('flMsg').className = 'feedback ' + (diff <= 0 || s < best ? 'ok' : '');
      render();
    }
  };

  // read aloud at the goal pace, highlighting each sentence
  let reading = false;
  function hl(i){ $('flText').querySelectorAll('.sent').forEach(s => s.classList.toggle('now', +s.dataset.i === i)); }
  $('flHear').onclick = () => {
    if(!canSpeak) return;
    if(reading){ stopAll(); return; }
    if(t0 !== null) return;
    speechSynthesis.cancel(); reading = true; $('flHear').textContent = 'Stop';
    const sents = [...$('flText').querySelectorAll('.sent')];
    const rate = Math.max(0.6, Math.min(1.6, wpm(PASSAGE.goal) / 165));   // device voices read about 165 words a minute at normal speed
    sents.forEach((s, i) => {
      const u = new SpeechSynthesisUtterance(s.textContent); u.rate = rate; u.lang = 'en-US'; if(voice) u.voice = voice;
      u.onstart = () => { if(reading){ hl(i); s.scrollIntoView({ block:'nearest', behavior:'smooth' }); } };
      if(i === sents.length - 1) u.onend = () => { reading = false; hl(-1); $('flHear').textContent = 'Hear it at goal pace'; };
      speechSynthesis.speak(u);
    });
  };
  (window.LOADED_EXTRA = window.LOADED_EXTRA || []).push('js/fluency.js');
})();
