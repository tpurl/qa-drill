// Q&A Drill: extra lists and list order (add-on loaded from start.js)
// 1. "Missed on spelling test" list (added once)  2. Order toggle: alphabetical or as on the sheet
const MISSED_SPELLING = { id:'2026-10-09-spelling', name:'Missed on spelling test', words:['conclude','familiar','perspective'] };
const baseLoadLists = load;
load = function(){
  baseLoadLists();
  if(data.missedSpelling === MISSED_SPELLING.id) return;
  data.missedSpelling = MISSED_SPELLING.id;
  const week = data.sets.find(st => st.name === 'Spelling words');
  const words = week ? week.items.filter(it => MISSED_SPELLING.words.includes(it.q.toLowerCase())) : [];
  if(words.length && !data.sets.some(st => st.name === MISSED_SPELLING.name)){
    data.sets.push({ id: uid(), name: MISSED_SPELLING.name, caps: 'first', items: words.map(it => Object.assign({}, it, { id: uid() })) });
  }
  save();
};

// order toggle, shown next to the list name on the Questions tab
$('listTitle').insertAdjacentHTML('afterend',
  '<label style="font-size:15px;color:var(--muted);display:flex;align-items:center;gap:6px">Order <select id="orderSel" style="width:auto">' +
  '<option value="abc">alphabetical</option><option value="sheet">as on the sheet</option></select></label>');
$('orderSel').onchange = () => {
  curSet().order = $('orderSel').value; data.group = 0; save();
  renderList(); fillRanges(); showAllSetupBest();
};
const baseRenderListOrder = renderList;
renderList = function(){ baseRenderListOrder(); $('orderSel').value = curSet().order === 'sheet' ? 'sheet' : 'abc'; };
(window.LOADED_EXTRA = window.LOADED_EXTRA || []).push('js/lists.js');
