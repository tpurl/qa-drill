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

// definitions: exactly as the packet unless "mix in other wordings" is turned on
const baseDefOfLists = defOf;
defOf = it => data.mixDefs ? baseDefOfLists(it) : it.a;
const mixBox = id => '<label class="check"><input type="checkbox" class="mixDefs"> Mix in other wordings of the definitions (tests sometimes reword them)</label>';
['quizSetup', 'matchSetup'].forEach(id => $(id).querySelector('.opts').insertAdjacentHTML('beforeend', mixBox()));
document.querySelectorAll('.mixDefs').forEach(x => x.onchange = () => { data.mixDefs = x.checked; save(); document.querySelectorAll('.mixDefs').forEach(y => y.checked = data.mixDefs); });
const baseRenderListMix = renderList;
renderList = function(){ baseRenderListMix(); document.querySelectorAll('.mixDefs').forEach(y => y.checked = !!data.mixDefs); };

// Months of the year: its own list, in order 1 to 12 (like States and capitals)
const MONTHS = [['January','Jan-u-ar-y','JAN-yoo-air-ee'],['February','Feb-ru-ar-y','FEB-roo-air-ee'],['March','March','MARCH'],['April','A-pril','AY-pril'],
  ['May','May','MAY'],['June','June','JOON'],['July','Ju-ly','juh-LY'],['August','Au-gust','AW-gust'],['September','Sep-tem-ber','sep-TEM-ber'],
  ['October','Oc-to-ber','ok-TOH-ber'],['November','No-vem-ber','noh-VEM-ber'],['December','De-cem-ber','dih-SEM-ber']];
const ORD = n => n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th');
const monthItems = () => MONTHS.map(([q, syl, snd], i) => ({ id: uid(), q, a: ORD(i + 1) + ' month of the year', syl, snd }));
Object.assign(NAMES, {
  February: ['Feb-ru-ar-y', 'FEB-roo-air-ee', 'Don\'t skip the first r: Feb-RU-ar-y.'],
  August: ['Au-gust', 'AW-gust', 'The au sounds like "aw," like in saw.'],
  December: ['De-cem-ber', 'dih-SEM-ber', 'The c sounds like s because an e comes after it.']
});
['February', 'August', 'December'].forEach(k => { NAMES_LC[k.toLowerCase()] = NAMES[k]; });
function addMonthsList(switchToIt){
  let set = data.sets.find(st => st.name === 'Months of the year');
  if(!set){ set = { id: uid(), name: 'Months of the year', order: 'sheet', caps: 'first', sayCols: 'q', items: monthItems() }; data.sets.push(set); }
  if(switchToIt){ switchTo(set.id); $('bulkMsg').textContent = 'Months of the year is ready. Try it on the Pronounce tab.'; }
  else save();
}
const baseLoadMonths = load;
load = function(){ baseLoadMonths(); if(!data.monthsAdded){ data.monthsAdded = true; addMonthsList(false); } };
$('states').insertAdjacentHTML('afterend', ' <button class="btn quiet" id="monthsBtn">Load months of the year</button>');
$('monthsBtn').onclick = () => addMonthsList(true);
(window.LOADED_EXTRA = window.LOADED_EXTRA || []).push('js/lists.js');
