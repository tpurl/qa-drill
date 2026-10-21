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

// Government: the three branches, plus the President and Vice President (in a set order, like a lesson)
// Current as of October 2026: Donald Trump (47th President) and JD Vance (Vice President), in office since January 20, 2025.
const GOV = [
  ['How many branches does the U.S. government have?', 'Three'],
  ['Which branch makes the laws?', 'Legislative branch'],
  ['Which branch carries out the laws?', 'Executive branch'],
  ['Which branch explains the laws and decides if they are fair?', 'Judicial branch'],
  ['What is the legislative branch called?', 'Congress'],
  ['What are the two parts of Congress?', 'The Senate and the House of Representatives'],
  ['How many senators does each state have?', 'Two'],
  ['Where does Congress meet?', 'The U.S. Capitol'],
  ['Who leads the executive branch?', 'The President'],
  ['Who is the President of the United States?', 'Donald Trump'],
  ['Who is the Vice President of the United States?', 'JD Vance'],
  ['What number President is Donald Trump?', '47th'],
  ['How many years is a President\'s term?', 'Four'],
  ['Where does the President live and work?', 'The White House'],
  ['Who takes over if the President can\'t do the job?', 'The Vice President'],
  ['What does the Vice President do when the Senate has a tie vote?', 'Breaks the tie'],
  ['What is the highest court in the judicial branch?', 'The Supreme Court'],
  ['How many justices are on the Supreme Court?', 'Nine'],
  ['What keeps one branch from getting too powerful?', 'Checks and balances'],
  ['What document set up the three branches?', 'The Constitution']
];
Object.assign(NAMES, {
  'Legislative branch': ['Leg-is-la-tive branch', 'LEJ-is-lay-tiv BRANCH', 'Legislative makes the laws. Think "legal."'],
  'Executive branch': ['Ex-ec-u-tive branch', 'ig-ZEK-yoo-tiv BRANCH', 'The executive branch carries out the laws. The President leads it.'],
  'Judicial branch': ['Ju-di-cial branch', 'joo-DISH-ul BRANCH', 'Judicial sounds like judge. Judges decide what the laws mean.'],
  'Congress': ['Con-gress', 'KONG-gris'],
  'The Supreme Court': ['The Su-preme Court', 'thuh suh-PREEM KORT'],
  'The U.S. Capitol': ['The U S Cap-i-tol', 'thuh YOO ES KAP-ih-tul', 'Capitol with an o is the building. Capital with an a is a city, like a state capital.'],
  'Checks and balances': ['Checks and bal-an-ces', 'CHEKS and BAL-un-siz', 'Each branch can check, or stop, the others.'],
  'The Constitution': ['The Con-sti-tu-tion', 'thuh kon-stih-TOO-shun'],
  'Donald Trump': ['Don-ald Trump', 'DON-uld TRUMP'],
  'JD Vance': ['J D Vance', 'JAY DEE VANS']
});
['Legislative branch','Executive branch','Judicial branch','Congress','The Supreme Court','The U.S. Capitol','Checks and balances','The Constitution','Donald Trump','JD Vance'].forEach(k => { NAMES_LC[k.toLowerCase()] = NAMES[k]; });
function addGovList(switchToIt){
  let set = data.sets.find(st => st.name === 'Government');
  if(!set){ set = { id: uid(), name: 'Government', order: 'sheet', caps: 'none', sayCols: 'a', items: GOV.map(([q, a]) => ({ id: uid(), q, a })) }; data.sets.push(set); }
  if(switchToIt){ switchTo(set.id); $('bulkMsg').textContent = 'Government is ready. Try Multiple choice, Matching or Flashcards.'; }
  else save();
}
const baseLoadGov = load;
load = function(){ baseLoadGov(); if(!data.govAdded){ data.govAdded = true; addGovList(false); } };
$('monthsBtn').insertAdjacentHTML('afterend', ' <button class="btn quiet" id="govBtn">Load government</button>');
$('govBtn').onclick = () => addGovList(true);
// keep the Use menu short when the first column is a long question: just "1–5", "6–10"...
const baseGroupLabel = groupLabel;
groupLabel = g => { const L = baseGroupLabel(g); return L.length > 48 ? L.split(':')[0] : L; };
(window.LOADED_EXTRA = window.LOADED_EXTRA || []).push('js/lists.js');
