// Q&A Drill: Lists, storage, groups of 5, tabs, speech, letter pad, timers and top times
// ---------- storage: multiple lists ----------
let data = { sets: [], cur: null, range: 5, seededSpelling: false };
let items = [], justSeeded = false;
function load(){
  try{
    const raw = localStorage.getItem(KEY);
    if(raw){ const d = JSON.parse(raw); if(d && Array.isArray(d.sets) && d.sets.length) data = Object.assign(data, d); }
    else {
      const old = localStorage.getItem(OLD);
      if(old){ const arr = JSON.parse(old); if(Array.isArray(arr) && arr.length){
        const isStates = arr.some(x => /^What is the capital of/.test(x.q));
        const r = +localStorage.getItem(OLD+'-range');
        data.sets = [{ id:uid(), name: isStates ? 'States and capitals' : 'My list', items: arr.filter(x=>x&&x.q&&x.a) }];
        if(r) data.range = r;
      }}
    }
  }catch(e){}
  if(!data.sets.length) data.sets = [{ id:uid(), name:'States and capitals', items: stateItems() }];
  if(!data.seededSpelling){
    data.seededSpelling = true; justSeeded = true;
    if(!data.sets.some(s => s.name === 'Spelling words')) data.sets.push({ id:uid(), name:'Spelling words', items: [] });
    data.cur = data.sets.find(s => s.name === 'Spelling words').id;
    data.group = 0;
  }
  // This week's words: replaces the Spelling words list once per new week
  const WEEK = { id: '2026-10-05-2', name: 'Spelling words', words: [["analyze", "To study something carefully.", "an-a-lyze", "AN-uh-lize"], ["accurate", "Correct and free from mistakes.", "ac-cu-rate", "AK-yur-it"], ["conclude", "To decide after thinking about the facts.", "con-clude", "kun-KLOOD"], ["contrast", "To show how things are different.", "con-trast", "kun-TRAST"], ["evidence", "Facts or information that support an idea.", "ev-i-dence", "EV-ih-dunss"], ["essential", "Very important.", "es-sen-tial", "ih-SEN-shul"], ["familiar", "Known or recognized.", "fa-mil-iar", "fuh-MIL-yer"], ["generate", "To create something.", "gen-er-ate", "JEN-uh-rayt"], ["identify", "To name or recognize something.", "i-den-ti-fy", "eye-DEN-tih-fy"], ["influence", "The power to affect someone or something.", "in-flu-ence", "IN-floo-unss"], ["perspective", "The way someone sees or understands something.", "per-spec-tive", "per-SPEK-tiv"], ["relevant", "Connected to the topic or situation.", "rel-e-vant", "REL-uh-vunt"], ["significant", "Important or meaningful.", "sig-nif-i-cant", "sig-NIF-ih-kunt"], ["sufficient", "Enough for what is needed.", "suf-fi-cient", "suh-FISH-unt"], ["maintain", "To keep something in good condition or continue it.", "main-tain", "mayn-TAYN"]] };
  // remove the old sample words (necessary, separate, believe...) from every list
  const OLD = new Set(SPELLING.map(([q,a]) => q + '|' + a));
  data.sets.forEach(st => { st.items = st.items.filter(it => !OLD.has(it.q + '|' + it.a)); });
  if(data.week !== WEEK.id){
    data.week = WEEK.id;
    let set = data.sets.find(st => st.name === WEEK.name);
    if(!set){ set = { id: uid(), name: WEEK.name, items: [] }; data.sets.push(set); }
    set.items = WEEK.words.map(([q,a,syl,snd]) => ({ id: uid(), q, a, syl, snd }));
    if(!set.caps || set.caps === 'none') set.caps = 'first';
    data.cur = set.id; data.group = 0; justSeeded = true;
  }
  if(!data.capReqOff){ data.capReqOff = true; data.sets.forEach(st => { st.capReq = false; }); } // saying "uppercase" no longer required by default
  if(!data.capSayOff){ data.capSayOff = true; data.sets.forEach(st => { st.capSay = false; }); } // voice no longer says "uppercase" by default
  if(!data.sets.some(s => s.id === data.cur)) data.cur = data.sets[0].id;
  data.sets.forEach(st => st.items.forEach(withPron));
  items = curSet().items;
  save();
}
function save(){ try{ curSet().items = items; localStorage.setItem(KEY, JSON.stringify(data)); }catch(e){} }
const curSet = () => data.sets.find(s => s.id === data.cur);

function renderSets(){
  $('setSel').innerHTML = data.sets.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
  $('setSel').value = data.cur;
  $('deleteList').disabled = data.sets.length < 2;
}
function switchTo(id){
  stopAll();
  data.cur = id; items = curSet().items; data.group = 0; save();
  renderSets(); renderList(); showTab(currentTab);
}
$('setSel').onchange = () => switchTo($('setSel').value);
$('newList').onclick = () => {
  const name = (prompt('Name for the new list', 'New list') || '').trim(); if(!name) return;
  const s = { id:uid(), name, items:[] }; data.sets.push(s); switchTo(s.id); $('bulk').focus();
};
$('renameList').onclick = () => {
  const name = (prompt('Rename this list', curSet().name) || '').trim(); if(!name) return;
  curSet().name = name; save(); renderSets(); renderList();
};
$('deleteList').onclick = () => {
  if(data.sets.length < 2) return;
  if(!confirm('Delete the list "' + curSet().name + '" and its ' + items.length + ' items?')) return;
  data.sets = data.sets.filter(s => s.id !== data.cur); switchTo(data.sets[0].id);
};

// ---------- parsing ----------
function parse(text){
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  const delim = /\t|::|\|/;
  const out = [];
  if(lines.some(l => delim.test(l))){
    lines.forEach(l => {
      let parts;
      if(l.includes('\t')) parts = l.split('\t');
      else if(l.includes('::')) parts = l.split('::');
      else parts = l.split('|');
      parts = parts.map(x=>x.trim());
      const q = parts[0], a = parts.length >= 3 ? parts[1] : parts.slice(1).join(' ').trim();
      const it = {id:uid(), q, a};
      if(parts[2]) it.syl = parts[2]; if(parts[3]) it.snd = parts[3];
      if(q && a) out.push(withPron(it));
    });
  } else {
    for(let i=0;i+1<lines.length;i+=2) out.push(withPron({id:uid(), q:lines[i], a:lines[i+1]}));
  }
  return out;
}

// ---------- list ----------
function renderList(){
  $('count').textContent = items.length + (items.length===1?' item':' items');
  $('listTitle').textContent = curSet().name;
  const ol = $('list');
  if(!items.length){ ol.innerHTML = '<li class="empty" style="display:block;background:none;box-shadow:none">This list is empty. Paste some pairs above or load one of the ready-made lists.</li>'; return; }
  ol.innerHTML = sortedItems().map((it,i) => `<li data-id="${it.id}"><span class="n">${i+1}</span><div class="q">${esc(it.q)}</div><div class="a">${esc(it.a)}</div>${(it.syl||it.snd) ? `<div class="p">${it.syl?'<b>'+showSyl(it.syl)+'</b>':''}${it.syl&&it.snd?'&nbsp;&nbsp;':''}${it.snd?showSnd(it.snd):''}</div>` : ''}
    <div class="acts"><button class="icon" data-act="edit">Edit</button><button class="icon" data-act="del">Delete</button></div></li>`).join('');
}
$('list').addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b) return;
  const li = b.closest('li'); const id = li.dataset.id; const it = items.find(x=>x.id===id); if(!it) return;
  if(b.dataset.act==='del'){ items = items.filter(x=>x.id!==id); save(); renderList(); }
  else if(b.dataset.act==='edit'){
    li.className='editing';
    li.innerHTML = `<input type="text" class="eq" value="${esc(it.q)}"><input type="text" class="ea" value="${esc(it.a)}">
      <input type="text" class="esy" value="${esc(it.syl||'')}" placeholder="Syllables (optional), e.g. nec-es-sar-y">
      <input type="text" class="esn" value="${esc(it.snd||'')}" placeholder="Sounds like (optional), e.g. NESS-uh-sair-ee">
      <div class="row"><button class="btn" data-act="save">Save changes</button><button class="btn quiet" data-act="cancel">Cancel</button></div>`;
    li.querySelector('.eq').focus();
  }
  else if(b.dataset.act==='save'){
    const q = li.querySelector('.eq').value.trim(), a = li.querySelector('.ea').value.trim();
    if(q && a){ it.q=q; it.a=a;
      const sy = li.querySelector('.esy').value.trim(), sn = li.querySelector('.esn').value.trim();
      if(sy) it.syl = sy; else delete it.syl;
      if(sn) it.snd = sn; else delete it.snd;
      save(); }
    renderList();
  }
  else if(b.dataset.act==='cancel') renderList();
});

function addItems(got, label){
  const have = new Set(items.map(x=>x.q.toLowerCase()));
  const add = got.filter(x=>!have.has(x.q.toLowerCase()));
  items = items.concat(add); save(); renderList();
  $('bulkMsg').textContent = add.length ? 'Added ' + add.length + ' ' + label + '.' : 'Those are already in this list.';
}
$('addBulk').onclick = () => {
  const got = parse($('bulk').value);
  if(!got.length){ $('bulkMsg').textContent = 'Nothing added. Put a question and answer on each line with a tab, | or :: between them.'; return; }
  addItems(got, got.length===1?'pair':'pairs'); $('bulk').value='';
};
$('addOne').onclick = () => {
  const q = $('oneQ').value.trim(), a = $('oneA').value.trim();
  if(!q || !a){ (q?$('oneA'):$('oneQ')).focus(); return; }
  const it = {id:uid(), q, a}, sy = $('oneS').value.trim(), sn = $('oneN').value.trim();
  if(sy) it.syl = sy; if(sn) it.snd = sn;
  items.push(withPron(it)); save(); renderList(); ['oneQ','oneA','oneS','oneN'].forEach(k=>$(k).value=''); $('oneQ').focus();
};
$('oneA').addEventListener('keydown', e => { if(e.key==='Enter') $('addOne').click(); });
$('states').onclick = () => addItems(stateItems(), 'states');
$('clearBtn').onclick = () => { if(items.length && confirm('Remove all ' + items.length + ' items from "' + curSet().name + '"?')){ items=[]; save(); renderList(); } };
$('exportBtn').onclick = () => {
  const clean = t => (t||'').replace(/\t/g,' ');
  const text = items.map(it => [it.q, it.a].concat(it.syl||it.snd ? [it.syl||'', it.snd||''] : []).map(clean).join('\t')).join('\n');
  const ta = $('bulk'); ta.value = text; ta.focus(); ta.select();
  try{ navigator.clipboard && navigator.clipboard.writeText(text); $('bulkMsg').textContent = 'Copied ' + items.length + ' pairs to the clipboard (tab-separated, pastes into Excel). They’re also in the box above.'; }
  catch(e){ $('bulkMsg').textContent = 'Your list is in the box above. Copy it from there.'; }
};
$('importBtn').onclick = () => $('importFile').click();
$('importFile').onchange = e => {
  const f = e.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = () => {
    let got = [];
    try{ const d = JSON.parse(r.result); if(Array.isArray(d)) got = d.filter(x=>x&&x.q&&x.a).map(x=>({id:uid(),q:String(x.q),a:String(x.a)})); }
    catch(_){ got = parse(String(r.result)); }
    if(got.length) addItems(got, 'pairs'); else $('bulkMsg').textContent = 'That file had no question/answer pairs I could read.';
  };
  r.readAsText(f); e.target.value='';
};

// ---------- range (first 5, first 10, ...) ----------
// lists are practiced 5 at a time, in alphabetical order
const GROUP = 5;
const sortKey = it => { const m = it.q.trim().match(CAP_RE); return (m ? m[1] : it.q).trim().toLowerCase(); };
const sortedItems = () => (curSet() && curSet().order === 'sheet') ? items.slice() : items.slice().sort((x,y) => sortKey(x).localeCompare(sortKey(y)));
const groupCount = () => Math.ceil(items.length / GROUP);
const shortName = it => { const m = it.q.trim().match(CAP_RE); const t = (m ? m[1] : it.q).trim(); return t.charAt(0).toUpperCase() + t.slice(1); };
function groupLabel(g){
  if(g === 'all') return 'All ' + items.length;
  const so = sortedItems(), a = g*GROUP, b = Math.min(a+GROUP, so.length);
  if(!so.length) return 'None yet';
  return (a+1) + '–' + b + ': ' + shortName(so[a]) + (b-1 > a ? ' to ' + shortName(so[b-1]) : '');
}
function curGroup(){ const g = data.group; if(g === 'all') return groupCount() > 1 ? 'all' : 0; const n = +g || 0; return n < groupCount() ? n : 0; }
function fillRanges(){
  const G = Math.max(groupCount(), 1), cur = curGroup();
  const opts = [...Array(G).keys()].concat(G > 1 ? ['all'] : []);
  document.querySelectorAll('select.range').forEach(sel => {
    sel.innerHTML = opts.map(g => `<option value="${g}">${esc(groupLabel(g))}</option>`).join('');
    sel.value = String(cur);
  });
}
const rangeVal = () => String(curGroup());
function setRange(g){ data.group = g; save(); fillRanges(); if(typeof showAllSetupBest === 'function') showAllSetupBest(); }
document.querySelectorAll('select.range').forEach(sel => sel.onchange = () => setRange(sel.value === 'all' ? 'all' : +sel.value));
const poolNow = () => { const so = sortedItems(), g = curGroup(); return g === 'all' ? so : so.slice(g*GROUP, g*GROUP + GROUP); };
const nextN = () => { const g = curGroup(); return (g !== 'all' && g + 1 < groupCount()) ? g + 1 : 0; };
function stepLabel(btn, verb){
  const n = nextN(); btn.hidden = !n;
  if(n) btn.textContent = verb + ' with ' + (n*GROUP + 1) + '–' + Math.min((n+1)*GROUP, items.length);
}

// ---------- tabs ----------
let currentTab = 'edit';
document.querySelectorAll('nav.tabs button').forEach(b => b.onclick = () => showTab(b.dataset.tab));
function showTab(name){
  currentTab = name;
  if(!['spell','say','phon','fake'].includes(name) && window.speechSynthesis) speechSynthesis.cancel();
  fillRanges();
  document.querySelectorAll('nav.tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.tab===name));
  ['edit','spell','say','phon','fake','quiz','match'].forEach(t => $('tab-'+t).hidden = t!==name);
  if(name === 'phon') fillGroups();
  if(name === 'spell' || name === 'say') syncCaps();
  showAllSetupBest();
  if(name === 'say') $('sayCols').value = curSet().sayCols || (looksLikeCapitals() ? 'both' : 'q');
  if(name !== 'say') stopListening();
  if(name !== 'fake' && typeof stopFakeListening === 'function') stopFakeListening();
  $('sayNeed').textContent = items.length ? '' : 'Add some words to this list first.'; $('startSay').disabled = !items.length;
  const few = items.length < 2 ? 'Add at least 2 items to this list first.' : '';
  $('quizNeed').textContent = few; $('matchNeed').textContent = few;
  $('spellNeed').textContent = items.length ? '' : 'Add some words to this list first.';
  $('startQuiz').disabled = items.length < 2; $('startMatch').disabled = items.length < 2; $('startSpell').disabled = !items.length;
}
function stopAll(){
  if(window.speechSynthesis) speechSynthesis.cancel();
  clearInterval(timer);
  stopListening(); for(const k in RUNS) delete RUNS[k];
  ['spellRun','spellDone','sayRun','sayDone','phRun','phDone','fakeRun','fakeDone','quizRun','quizDone','matchRun','matchDone'].forEach(id => $(id).hidden = true);
  ['spellSetup','saySetup','phSetup','fakeSetup','quizSetup','matchSetup'].forEach(id => $(id).hidden = false);
}

// ---------- speech ----------
const canSpeak = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let voice = null;
function pickVoice(){
  if(!canSpeak) return;
  const vs = speechSynthesis.getVoices();
  voice = vs.find(v => v.lang === 'en-US' && /natural|enhanced|premium|google/i.test(v.name))
       || vs.find(v => v.lang === 'en-US') || vs.find(v => /^en/i.test(v.lang)) || null;
}
if(canSpeak){ pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function say(parts, rateOverride){
  if(!canSpeak) return;
  speechSynthesis.cancel();
  const rate = rateOverride || +$('rate').value;
  parts.forEach(t => {
    const u = new SpeechSynthesisUtterance(t);
    u.rate = rate; u.lang = 'en-US'; if(voice) u.voice = voice;
    speechSynthesis.speak(u);
  });
}

// syllable-by-syllable playback: each part slowly, then the whole word
function sayParts(it){
  const src = it.snd || sylOf(it).text;
  const parts = src.split(/[-\s·]+/).filter(Boolean).map(x => x.toLowerCase());
  if(!canSpeak) return;
  speechSynthesis.cancel();
  const queue = parts.map(t => [t, 0.6]).concat([[it.q, 0.7]]);
  queue.forEach(([t, rate]) => {
    const u = new SpeechSynthesisUtterance(t); u.rate = rate; u.lang='en-US'; if(voice) u.voice = voice;
    speechSynthesis.speak(u);
  });
}

// ---------- on-screen letter pad ----------
const touchy = window.matchMedia && matchMedia('(pointer: coarse)').matches;
let padOn = false;
const ROWS = ['qwertyuiop','asdfghjkl','zxcvbnm'];
function buildPad(){
  const pad = $('pad');
  pad.innerHTML = ROWS.map((r,i) => '<div class="prow">' +
    (i===2 ? '<button type="button" class="shift" data-k="shift" aria-label="Uppercase letter (Shift)" aria-pressed="false">⇧</button>' : '') +
    [...r].map(c=>`<button type="button" data-k="${c}">${c}</button>`).join('') +
    (i===2 ? '<button type="button" class="back" data-k="back" aria-label="Backspace">⌫</button>' : '') + '</div>').join('') +
    '<div class="prow"><button type="button" data-k="\'">\'</button><button type="button" data-k="-">-</button><button type="button" class="space" data-k=" ">space</button><button type="button" class="wide" data-k="clear">Clear</button></div>';
}
let padShift = false;
function setShift(on){
  padShift = on;
  $('pad').querySelectorAll('button[data-k]').forEach(b => {
    const k = b.dataset.k;
    if(/^[a-z]$/.test(k)) b.textContent = on ? k.toUpperCase() : k;
    if(k === 'shift'){ b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }
  });
}
// which spelling box the letter pad is typing into right now
function padCtx(){
  if(!$('spellRun').hidden && !$('tab-spell').hidden && S && !S.done) return { inp: $('sInput'), cls:'spell' };
  if(!$('fakeRun').hidden && !$('tab-fake').hidden && F && F.mode === 'spell' && !F.done) return { inp: $('fInput'), cls:'spell' };
  return null;
}
function padKey(k){
  const ctx = padCtx(); if(!ctx) return;
  const inp = ctx.inp;
  if(k==='shift'){ setShift(!padShift); return; }
  if(k==='back') inp.value = inp.value.slice(0,-1);
  else if(k==='clear') inp.value = '';
  else if(inp.value.length < 60){
    if(padShift && /^[a-z]$/.test(k)){ k = k.toUpperCase(); setShift(false); }
    inp.value += k;
  }
  if(inp.classList.contains('bad')) inp.className = 'spell';
}
$('pad').addEventListener('pointerdown', e => { const b = e.target.closest('button'); if(b){ e.preventDefault(); padKey(b.dataset.k); } });
$('pad').addEventListener('click', e => { if(e.detail === 0){ const b = e.target.closest('button'); if(b) padKey(b.dataset.k); } }); // keyboard activation
function applyPad(){
  padOn = $('usePad').checked;
  ['sInput','fInput'].forEach(id => {
    const inp = $(id);
    inp.readOnly = padOn;
    inp.setAttribute('inputmode', padOn ? 'none' : 'text');
    inp.placeholder = padOn ? 'Tap the letters' : 'Type the word';
  });
  $('pad').hidden = !padOn;
}
function focusInput(){ if(!padOn) $('sInput').focus(); }
// a hardware keyboard still works while the pad is on
document.addEventListener('keydown', e => {
  if(!padOn || e.ctrlKey || e.metaKey || e.altKey) return;
  const inSpell = !$('spellRun').hidden && !$('tab-spell').hidden;
  const inFake = !$('fakeRun').hidden && !$('tab-fake').hidden && F && F.mode === 'spell';
  if(!inSpell && !inFake) return;
  if(e.target.matches('input:not(#sInput):not(#fInput),textarea,select')) return;
  if(e.key==='Enter' && e.target.matches('button')) return; // let the focused button handle it
  if(e.key==='Enter'){ e.preventDefault(); if(inSpell){ if(S.done) $('sNext').click(); else checkS(); } else { if(F.done) $('fNext').click(); else checkF(); } }
  else if(e.key==='Backspace'){ e.preventDefault(); padKey('back'); }
  else if(/^[a-zA-Z' -]$/.test(e.key)){ e.preventDefault(); padKey(e.key); }
});
$('usePad').onchange = () => { data.pad = $('usePad').checked; save(); applyPad(); };

// ---------- timers and top times ----------
const PENALTY = 5, TOP_N = 5;
const RUNS = {};
const CLOCK = { spell:'sClock', say:'pClock', phon:'hClock', fake:'fClock', quiz:'qClock', match:'mTime' };
function runKey(mode){
  if(mode === 'fake') return 'fake|' + $('fakeMode').value + '|' + $('fakeFocus').value + '|' + $('fakeCount').value;
  let k = curSet().id + '|' + mode + '|' + rangeVal();
  if(mode==='quiz') k += '|' + $('nChoices').value + $('direction').value;
  if(mode==='match') k += '|' + $('roundSize').value;
  if(mode==='say') k += '|' + $('sayCols').value;
  if(mode==='phon') k += '|' + $('phGroup').value;
  return k;
}
const bestsFor = key => ((data.best || {})[key] || []);
function fmtT(ms){ const s = Math.round(ms/1000); return Math.floor(s/60) + ':' + String(s%60).padStart(2,'0'); }
function rangeLabel(mode){
  if(mode === 'fake') return $('fakeCount').value + ' made-up words (' + FAKE_FOCUS[$('fakeFocus').value].name.toLowerCase() + ', ' + ($('fakeMode').value === 'read' ? 'reading' : 'spelling') + ')';
  const g = curGroup(); return g === 'all' ? 'all ' + items.length : 'words ' + (g*GROUP + 1) + '–' + Math.min(g*GROUP + GROUP, items.length);
}
function showSetupBest(mode){
  const el = $(mode + 'SetupBest'); if(!el || !curSet()) return;
  const b = bestsFor(runKey(mode))[0];
  el.innerHTML = b ? 'Best time for ' + esc(rangeLabel(mode)) + ': <b>' + fmtT(b.t) + '</b>. Can you beat it?' : 'No best time yet for ' + esc(rangeLabel(mode)) + '. Finish a round to set one.';
}
const showAllSetupBest = () => Object.keys(CLOCK).forEach(showSetupBest);
['spellSetup','saySetup','phSetup','fakeSetup','quizSetup','matchSetup'].forEach(id => $(id).addEventListener('change', () => setTimeout(showAllSetupBest, 0)));
function timerStart(mode, full){
  const key = runKey(mode), best = bestsFor(key)[0];
  RUNS[mode] = { start: Date.now(), key, full: !!full, best: best ? best.t : null, done:false };
  if(mode === 'match') $('mBestStat').innerHTML = best ? 'Best <b>' + fmtT(best.t) + '</b>' : '';
  tickClocks();
}
function tickClocks(){
  for(const m in RUNS){
    const r = RUNS[m]; if(!r || r.done) continue;
    const el = $(CLOCK[m]); if(!el) continue;
    const t = fmtT(Date.now() - r.start);
    el.textContent = (m !== 'match' && r.best && r.full) ? t + ' / best ' + fmtT(r.best) : t;
  }
}
setInterval(tickClocks, 250);
function timerFinish(mode, misses, completed, boxId){
  const r = RUNS[mode], box = $(boxId); if(!r || !box) return;
  r.done = true;
  const ms = Date.now() - r.start, total = ms + misses * PENALTY * 1000;
  let entry = null, list = bestsFor(r.key), note = '', badge = '';
  if(!completed) note = 'Finish every word to get on the top times.';
  else if(!r.full) note = 'Retry rounds don\'t count toward top times.';
  else {
    data.best = data.best || {};
    list = data.best[r.key] = (data.best[r.key] || []);
    entry = { t: total, ms, miss: misses, d: Date.now() };
    list.push(entry); list.sort((a,b) => a.t - b.t); list.splice(TOP_N); save();
    const rank = list.indexOf(entry);
    if(rank === 0) badge = list.length === 1 ? 'First best time!' : 'New best time!';
    else if(rank > 0) badge = '#' + (rank+1) + ' on your top times';
    else note = 'Not in the top ' + TOP_N + ' this time. The best is ' + fmtT(list[0].t) + '.';
    showSetupBest(mode);
  }
  const detail = misses ? '<small> (' + fmtT(ms) + ' + ' + (misses*PENALTY) + 's for ' + misses + (misses===1?' mistake':' mistakes') + ')</small>' : '';
  const fmtD = d => new Date(d).toLocaleDateString(undefined, { month:'short', day:'numeric' });
  box.innerHTML = '<div class="tl">⏱ ' + fmtT(total) + detail + '</div>' +
    (badge ? '<div class="badge">' + badge + '</div>' : '') +
    (note ? '<div class="note">' + note + '</div>' : '') +
    (list.length ? '<div class="note" style="margin-top:10px">Top times for ' + esc(rangeLabel(mode)) + '. Each mistake adds ' + PENALTY + ' seconds.</div><ol class="top">' +
      list.map((e,i) => `<li class="${e===entry?'me':''}"><span class="rk">${i+1}.</span><span>${fmtT(e.t)}</span><span class="ex">${e.miss ? e.miss + (e.miss===1?' mistake':' mistakes') : 'no mistakes'}, ${fmtD(e.d)}</span></li>`).join('') + '</ol>' : '');
}
