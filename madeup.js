// Q&A Drill: Made-up words tab
// ---------- made-up words that follow phonics rules exactly ----------
// A word is a list of chunks: { t: letters, alts: other spellings the rules allow, snd: sounds in this chunk, ph: pattern note, syl: starts a new syllable }
const pickOne = a => a[Math.floor(Math.random() * a.length)];
const VOWELS = ['a','e','i','o','u'];
const ONSET1 = ['b','d','f','g','h','j','l','m','n','p','r','s','t','v','w','y','z','k'];
const ONSET2 = ['bl','br','cl','cr','dr','fl','fr','gl','gr','pl','pr','sl','sn','sp','st','tr','sh','ch','th'];
function onset(v, allowBlend = true){
  let o;
  do { o = (allowBlend && Math.random() < 0.45) ? pickOne(ONSET2) : pickOne(ONSET1); }
  while(o === 'g' && /^[ei]/.test(v));                       // g before e or i can say /j/, so skip it
  if(o === 'k') o = /^[aou]/.test(v) ? 'c' : 'k';             // /k/: c before a, o, u; k before e, i
  return { t:o, snd:[o.replace(/^c(?!h)/,'k')] };
}
const PAT = (group, label, sound, tip) => ({ group, label, sound, tip });
const SHORT_KEY = { a:'/a/ as in apple', e:'/e/ as in egg', i:'/i/ as in itch', o:'/o/ as in octopus', u:'/u/ as in up' };
const shortV = (v, tip) => ({ t:v, snd:['short '+v], ph:PAT('Vowel sounds','Short '+v, SHORT_KEY[v], tip === false ? null : (tip || 'A vowel closed in by a consonant is usually short.')) });
function closedCoda(end){
  const r = Math.random();
  if(end && r < 0.14){ const c = pickOne(['f','l','s']); return { t:c+c, snd:[c], ph:PAT('Double letters','FLOSS rule','/'+c+'/','After a short vowel at the end of a one-syllable word, double f, l and s.') }; }
  if(end && r < 0.26) return { t:'ck', snd:['k'], ph:PAT('Sneaky sounds','ck after a short vowel','/k/','Right after a short vowel, /k/ is spelled ck.') };
  if(end && r < 0.34) return { t:'tch', snd:['ch'], ph:PAT('Sneaky sounds','tch after a short vowel','/ch/','Right after a short vowel, /ch/ is spelled tch.') };
  if(end && r < 0.42) return { t:'dge', snd:['j'], ph:PAT('Sneaky sounds','dge after a short vowel','/j/','Right after a short vowel, /j/ is spelled dge.') };
  if(end && r < 0.56){ const c = pickOne(['nd','nt','mp','st','sk','lt','ft','lp','ng','nk','sh','th']); return { t:c, snd:[c] }; }
  const c = pickOne(['b','d','g','m','n','p','t','x']); return { t:c, snd:[c === 'x' ? 'ks' : c] };
}
function closedSyl(end = true, allowBlend = true){
  const v = pickOne(VOWELS);
  return [onset(v, allowBlend), shortV(v), closedCoda(end)];
}
const LONG = { a:'ai', i:null, o:'oa', u:null };
function silentESyl(){
  const v = pickOne(Object.keys(LONG)), on = onset(v), c = pickOne(['b','d','k','l','m','n','p','t']);
  const alts = []; if(LONG[v] && c !== 'k') alts.push(LONG[v] + c);
  if(v === 'i' && c === 't') alts.push('ight');
  return [on, { t: v + c + 'e', alts, snd:['long '+v, c], ph:PAT('Silent letters','Silent e: '+v+'_e',{a:'/ay/',i:'/eye/',o:'/oh/',u:'/yoo/'}[v],'The silent e at the end makes the '+v+' say its name.') }];
}
const TEAM_MID = [
  ['ai','long a',['a_e'],'ai in the middle of a word says /ay/.'], ['ee','long e',['ea'],'ee and ea both say /ee/, so either works.'],
  ['ea','long e',['ee'],'ea and ee both say /ee/, so either works.'], ['oa','long o',['o_e'],'oa in the middle of a word says /oh/.'],
  ['oi','oy',[],'Use oi in the middle of a word and oy at the end.'], ['ou','ow',[],'ou in the middle of a word says /ow/.'], ['oo','oo',[],'oo says /oo/ like in moon.']
];
const TEAM_END = [['ay','long a','Use ay at the end of a word, ai in the middle.'],['ee','long e','ee at the end says /ee/.'],['oy','oy','Use oy at the end of a word, oi in the middle.'],['ew','oo','ew and ue at the end both say /oo/.']];
function teamSyl(){
  if(Math.random() < 0.35){
    const [t, snd, tip] = pickOne(TEAM_END);
    return [onset(t[0]), { t, alts: t === 'ew' ? ['ue'] : [], snd:[snd], ph:PAT('Vowel teams', t + ' at the end', snd, tip) }];
  }
  if(Math.random() < 0.15) return [onset('i'), { t:'ight', alts:['ite'], snd:['long i','t'], ph:PAT('Vowel teams','igh','long i','igh says /eye/. The gh is silent.') }];
  const [t, snd, altsPat, tip] = pickOne(TEAM_MID), c = pickOne(['b','d','l','m','n','p','t']);
  return [onset(t[0]), { t: t + c, alts: altsPat.map(a => a.includes('_') ? a[0] + c + 'e' : a + c), snd:[snd, c], ph:PAT('Vowel teams', t, snd, tip) }];
}
function rSyl(){
  const [t, snd, others] = pickOne([['ar','ar',[]],['or','or',[]],['er','er',['ir','ur']],['ir','er',['er','ur']],['ur','er',['er','ir']]]);
  const c = Math.random() < 0.6 ? pickOne(['b','d','m','n','p','t','k']) : '';
  return [onset(t[0]), { t: t + c, alts: others.map(x => x + c), snd: c ? [snd, c] : [snd], ph:PAT('r-controlled vowels', t, snd, others.length ? 'er, ir and ur all say /er/, so any of them works.' : 'The r changes the vowel sound.') }];
}
function leWord(){
  const v = pickOne(VOWELS), c = pickOne(['b','d','g','p','t','z','f']);
  return [onset(v), shortV(v, 'The double consonant before -le keeps this vowel short.'),
    { t:c, snd:[c] }, { t: c + 'le', snd:['ul'], ph:PAT('Endings and suffixes','Consonant + le','/'+c+'ul/','A final -'+c+'le says /'+c+'ul/. The double '+c+' keeps the first vowel short.'), syl:true }];
}
function twoSyl(){
  const v1 = pickOne(VOWELS), v2 = pickOne(VOWELS);
  const c1 = pickOne(['b','d','m','n','p','t','s']), o2 = onset(v2, false);
  if(o2.t === c1) o2.t = o2.t === 't' ? 'p' : 't', o2.snd = [o2.t];
  const c2 = pickOne(['b','d','g','m','n','p','t','x','st','nd','nt','mp']);
  return [onset(v1), shortV(v1, 'Both syllables are closed, so both vowels are short.'), { t:c1, snd:[c1] }, Object.assign(o2, { syl:true }), shortV(v2, false), { t:c2, snd:[c2 === 'x' ? 'ks' : c2] }];
}
const FAKE_FOCUS = {
  mixed:   { name:'Mixed patterns', make: () => pickOne([closedSyl, silentESyl, teamSyl, rSyl, leWord, twoSyl])() },
  short:   { name:'Short vowels', make: () => closedSyl() },
  silente: { name:'Silent e', make: silentESyl },
  teams:   { name:'Vowel teams', make: teamSyl },
  r:       { name:'r-controlled vowels', make: rSyl },
  rules:   { name:'ck, tch, dge and FLOSS', make: () => { let w; do { w = closedSyl(); } while(!w[2].ph); return w; } },
  le:      { name:'Consonant + le', make: leWord },
  two:     { name:'Two syllables', make: twoSyl }
};
const BAD = /f[uv]c?k|shi?t|d[i1]c?k|c[o0]c?k|cum|t[i1]t|fag|n[i1]g|sex|ass|but{1,2}|p[i1]ss|damn|hell|crap|slut|wh[o0]r|rape|kill|fart|poo|pee|puk|nud|bich|bitch|homo|gay|jew|nazi|weed|drug|twat|pube|pen[i1]s|boob|dum|stup|hate|die|dead|gun|wtf|omg/;
const REAL = new Set(('cat dog bat hat sat mat rat pat fat cap map tap lap nap gap rap sap bed red led fed wed pen ten hen den men pet net get jet let met set wet vet big dig fig pig wig bit fit hit kit lit pit sit wit bin fin pin tin win hot pot dot got lot not rot cot job mob rob sob top hop mop pop bug hug jug mug rug tug bun fun run sun nut hut cut bus cup pup tub rub sub hum gum sum bad dad had mad sad pad lad box fox six mix fix wax tax ' +
  'back pack sack tack rack lack neck deck kick lick pickOne sick tick lock rock sock dock duck luck tuck buck ' +
  'cake bake lake make rake take wake fake game name same tame came gate late mate rate date cape tape bike hike like kite bite site time lime dime mine fine line nine pine wine hide ride side wide bone cone tone hope rope note vote home dome mole pole hole role cube tube mule rule cute mute ' +
  'rain pain main gain tail mail nail sail pail wait bait day pay say way may ray bay hay lay play stay tree free see bee feet meet seed need deep keep beat heat meat neat seat team bean mean lean read lead boat coat goat road toad soap loan coin join oil boil soil foil out loud shout food mood moon soon noon boot root pool tool cool new few dew blue clue toy boy joy soy night light might right sight fight tight ' +
  'car bar far jar star park dark mark farm barn born corn horn fork for torn her fur burn turn hurt bird girl dirt first fern gird term herd ' +
  'bubble puddle little bottle middle paddle apple cattle battle kettle saddle riddle giggle wiggle juggle topple shuffle ruffle waffle muffle sniffle toddle muddle huddle fiddle nibble dabble pebble ripple nipple hobble ' +
  'bell cell fell sell tell well yell hill fill bill mill pill will doll dull full pull ball call fall hall mall tall wall mess less miss kiss boss toss fuss off cliff stuff puff snuff sniff staff ' +
  'match patch catch fetch sketch itch pitch witch ditch notch hutch badge edge ledge hedge ridge bridge fudge judge nudge ' +
  'hand land band sand send bend mend tend lend pond fond tent bent dent rent sent went mint hint lint camp lamp damp ramp jump bump pump lump dump best nest pest rest test vest west fast last past mast list mist fist cost lost must dust rust gust desk disk task mask husk belt felt melt lift gift soft help ring sing king wing long song bang hang sank bank tank pink sink wink ' +
  'ship shop shot shut fish dish wish rush cash bath math with then them this that than chip chop chin chat ' +
  'flag flat flap flip flop clap clip clam clan crab crib crop drip drop drum frog from glad grab grin plan plug plus prop slam slap slip slot sled snap snip spot spin spit step stop trap trip trim ' +
  'drain maim spine flight peck germ plight slight fright bright light tight spite slide glide pride bride prize shine spike strike stroke smoke broke spoke slope globe grade trade blade shade flame frame plane crane shake snake brake flake grape drape wipe ripe pipe type tribe kite ' +
  'harp sharp card hard yard lard cord lord short sport snort curb nurb perk jerk term herb verb ' +
  'sledge kir nozzle dazzle fizzle sizzle puzzle muzzle guzzle drizzle frizzle grizzle raffle baffle ' +
  'basket napkin rabbit kitten mitten picnic magnet button sunset tiptop').split(' '));
function makeFake(focus){
  for(let tries = 0; tries < 300; tries++){
    const parts = FAKE_FOCUS[focus].make();
    const word = parts.map(p => p.t).join('');
    if(word.length < 3 || BAD.test(word) || REAL.has(word) || /(.)\1\1/.test(word)) continue;
    let at = 0; const ph = [];
    parts.forEach(p => { if(p.ph) ph.push({ s:at, l:p.t.length, group:p.ph.group, label:p.ph.label, sound:p.ph.sound, alts:[], tip:p.ph.tip }); at += p.t.length; });
    let spellings = [''];
    parts.forEach(p => { const opts = [p.t].concat(p.alts || []); spellings = spellings.flatMap(s => opts.map(o => s + o)).slice(0, 40); });
    spellings = [...new Set(spellings)];
    if(spellings.slice(1).some(s => REAL.has(s) || BAD.test(s))) continue;
    const si = parts.findIndex(p => p.syl);
    const syl = si > 0 ? parts.slice(0,si).map(p=>p.t).join('') + '-' + parts.slice(si).map(p=>p.t).join('') : word;
    const sounds = parts.flatMap(p => p.snd || [p.t]);
    const SAYV = {'short a':'a','short e':'eh','short i':'ih','short o':'ah','short u':'uh','long a':'ay','long e':'ee','long i':'eye','long o':'oh','long u':'yoo'};
    const sayOf = arr => { const u = arr.flatMap(p => p.snd || [p.t]); return u.map((x,k) => x === 'long i' ? (k > 0 && k < u.length-1 ? 'y' : 'eye') : (SAYV[x] || x)).join(''); };
    const snd = si > 0 ? sayOf(parts.slice(0,si)).toUpperCase() + '-' + sayOf(parts.slice(si)) : sayOf(parts).toUpperCase();
    return { id:'fake:' + word, q:word, a:FAKE_FOCUS[focus].name, syl, snd, sounds, ph, spellings };
  }
  return null;
}
function makeFakeSet(focus, n){
  const out = [], seen = new Set();
  for(let i = 0; out.length < n && i < n * 20; i++){ const w = makeFake(focus); if(w && !seen.has(w.q)){ seen.add(w.q); out.push(w); } }
  return out;
}

// rough "how would this be said" reader for checking speech on made-up words
const G2P_TEAMS = [['eigh','AY'],['ia','EYE'],['igh','EYE'],['ai','AY'],['ay','AY'],['ee','EE'],['ea','EE'],['oa','OH'],['oe','OH'],['oi','OY'],['oy','OY'],['ou','OW'],['oo','OO'],['ew','OO'],['ue','OO'],['ui','OO'],['au','AW'],['aw','AW'],['ie','EE'],['ei','AY']];
const LONGV = { a:'AY', e:'EE', i:'EYE', o:'OH', u:'OO', y:'EYE' };
function g2p(raw){
  let w = raw.toLowerCase().replace(/[^a-z]/g,'');
  if(!w) return [];
  const out = [], V = /[aeiouy]/;
  let i = 0;
  const isV = j => j < w.length && /[aeiou]/.test(w[j]);
  while(i < w.length){
    const rest = w.slice(i);
    // consonant + le at the end
    if(/^([^aeiou])\1?le$/.test(rest) && i > 0){ out.push(cons(rest[0]), 'short u', 'l'); break; }
    // r-controlled
    let m = rest.match(/^(ar|or|er|ir|ur)(?![aeiou])/);
    if(m && !(rest[0]==='e' && i===0 && false)){ out.push(m[1] === 'ar' ? 'AR' : m[1] === 'or' ? 'OR' : 'ER'); i += 2; continue; }
    const team = G2P_TEAMS.find(([g]) => rest.startsWith(g) && !(g === 'ow' && false));
    if(team){ out.push(team[1]); i += team[0].length; continue; }
    if(rest.startsWith('ow')){ out.push(i + 2 >= w.length ? 'OH' : 'OW'); i += 2; continue; }
    const c = w[i];
    if(/[aeiou]/.test(c)){
      // silent final e
      if(c === 'e' && i === w.length - 1 && out.length) { i++; continue; }
      // vowel + one consonant + e at end (or + e + s/d) -> long
      if(/^[aeiou][^aeiou]e(s|d)?$/.test(rest)){ out.push(LONGV[c]); i++; continue; }
      // open vowel at the very end -> long
      if(i === w.length - 1){ out.push(LONGV[c]); i++; continue; }
      out.push('short ' + c); i++; continue;
    }
    if(c === 'y'){
      if(i === 0 || isV(i+1)){ out.push('y'); i++; continue; }
      out.push(i === w.length - 1 ? 'EE' : 'short i'); i++; continue;
    }
    // consonant clusters
    const two = rest.slice(0,3);
    if(two.startsWith('tch')){ out.push('CH'); i += 3; continue; }
    if(two.startsWith('dge')){ out.push('J'); i += 3; continue; }
    if(rest.startsWith('ph')){ out.push('f'); i += 2; continue; }
    if(rest.startsWith('ck')){ out.push('k'); i += 2; continue; }
    if(rest.startsWith('ch')){ out.push('CH'); i += 2; continue; }
    if(rest.startsWith('sh')){ out.push('SH'); i += 2; continue; }
    if(rest.startsWith('th')){ out.push('TH'); i += 2; continue; }
    if(rest.startsWith('wh')){ out.push('w'); i += 2; continue; }
    if(i === 0 && rest.startsWith('kn')){ out.push('n'); i += 2; continue; }
    if(i === 0 && rest.startsWith('wr')){ out.push('r'); i += 2; continue; }
    if(rest.startsWith('gh')){ i += 2; continue; }
    if(c === 'x'){ out.push('k','s'); i++; continue; }
    if(c === 'q'){ out.push('k'); i += rest.startsWith('qu') ? 2 : 1; if(rest.startsWith('qu')) out.push('w'); continue; }
    if(c === 'c'){ out.push(/[eiy]/.test(w[i+1] || '') ? 's' : 'k'); i++; continue; }
    if(c === 'g' && rest.startsWith('ge') && i + 2 === w.length){ out.push('J'); i += 2; continue; }
    // doubled consonant sounds once
    if(w[i+1] === c){ out.push(cons(c)); i += 2; continue; }
    out.push(cons(c)); i++;
  }
  return out;
}
function cons(c){ return c === 'z' ? 's' : c === 'c' ? 'k' : c; }
function lev(a, b){
  const d = Array.from({length:a.length+1}, (_,i) => [i].concat(Array(b.length).fill(0)));
  for(let j=1;j<=b.length;j++) d[0][j] = j;
  for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++)
    d[i][j] = Math.min(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1] + (a[i-1]===b[j-1]?0:1));
  return d[a.length][b.length];
}
const isVowelTok = t => /^(short |AY|EE|EYE|OH|OO|OY|OW|AW|AR|OR|ER)/.test(t);
// sounds that speech recognition often swaps for each other
const NEAR = ['b|p','p|f','d|t','g|k','v|f','s|z','J|CH','CH|SH','m|n','TH|f','TH|t','w|r','l|r','short o|AW','short e|short i','short u|short o'].map(x => x.split('|'));
const near = (x, y) => NEAR.some(([p,q]) => (p===x && q===y) || (p===y && q===x));
function subCost(x, y){
  if(x === y) return 0;
  const vx = isVowelTok(x), vy = isVowelTok(y);
  if(vx !== vy) return 1.5;
  if(near(x, y)) return vx ? 0.75 : 0.5;
  return 1;
}
function wlev(a, b){
  const d = Array.from({length:a.length+1}, (_,i) => [i].concat(Array(b.length).fill(0)));
  for(let j=1;j<=b.length;j++) d[0][j] = j;
  for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++)
    d[i][j] = Math.min(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1] + subCost(a[i-1], b[j-1]));
  return d[a.length][b.length];
}
// common words speech recognition writes that don't follow the rules
const IRREG = { one:['w','short u','n'], two:['t','OO'], to:['t','OO'], do:['d','OO'], eye:['EYE'], i:['EYE'], you:['y','OO'], are:['AR'], our:['OW','r'], oh:['OH'], says:['s','short e','s'], said:['s','short e','d'], was:['w','short u','s'], of:['short u','v'], the:['TH','short u'], a:['short u'] };
const firstVowel = toks => { const v = toks.find(isVowelTok); return v === 'AW' ? 'short o' : v; };
// true when what was heard sounds like the made-up word.
// The main vowel has to be right (that's the phonics being practiced); small consonant slips are allowed,
// because speech recognition turns made-up words into the nearest real words.
function soundsLike(heard, word){
  const a = g2p(word);
  if(!a.length) return false;
  const limit = a.length <= 3 ? 1 : a.length <= 5 ? 1.5 : 2;
  const words = heard.toLowerCase().replace(/[^a-z' ]/g,' ').split(/\s+/).filter(Boolean);
  for(let i = 0; i < words.length; i++){
    for(let j = i + 1; j <= Math.min(words.length, i + 3); j++){
      const b = words.slice(i, j).flatMap(x => IRREG[x] || g2p(x));
      if(!b.length || firstVowel(b) !== firstVowel(a)) continue;
      if(wlev(a, b) <= limit) return true;
    }
  }
  return false;
}

let F = null;
$('fakeFocus').innerHTML = Object.entries(FAKE_FOCUS).map(([k,v]) => `<option value="${k}">${esc(v.name)}</option>`).join('');
const canRecord = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
$('fNoMic').hidden = canRecord;
const fakeNorm = t => t.trim().toLowerCase().replace(/\s+/g,'');
// record him, then play the word followed by his recording so he can compare
let recMedia = null, recUrl = null, recTimer = null;
function stopRecording(discard){ clearTimeout(recTimer); if(recMedia && recMedia.state !== 'inactive'){ recMedia._discard = !!discard; recMedia.stop(); } }
function stopFakeListening(){
  stopRecording(true);
  if(recUrl){ URL.revokeObjectURL(recUrl); recUrl = null; }
  const m = $('fMic'); m.classList.remove('on'); m.querySelector('span').textContent = 'Say it';
  $('fJudge').hidden = true;
}
const playRecording = () => new Promise(res => { if(!recUrl) return res(); const a = new Audio(recUrl); a.onended = res; a.onerror = res; a.play().catch(res); });
const speakAndWait = (text, rate) => new Promise(res => {
  if(!canSpeak) return res();
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.rate = rate; u.lang = 'en-US'; if(voice) u.voice = voice;
  u.onend = res; u.onerror = res; speechSynthesis.speak(u); setTimeout(res, 4000);
});
async function compareNow(){
  $('fJudge').hidden = true;
  $('fFeedback').textContent = 'Listen: the word first, then you.'; $('fFeedback').className = 'feedback';
  await speakAndWait(F.order[F.i].q, 0.85);
  await new Promise(r => setTimeout(r, 350));
  await playRecording();
  if(F.ok){ $('fFeedback').textContent = 'Marked as said correctly.'; $('fFeedback').className = 'feedback ok'; }
  else { $('fFeedback').textContent = 'Did yours sound the same?'; $('fJudge').hidden = false; }
}
function startFake(words, full){
  const mode = $('fakeMode').value;
  words = words || makeFakeSet($('fakeFocus').value, +$('fakeCount').value);
  if(!words.length) return;
  timerStart('fake', full !== false);
  F = { mode, order: shuffle(words), all: words, i:0, score:0, missed:[], tries:0, ok:false, done:false };
  $('fakeSetup').hidden = true; $('fakeDone').hidden = true; $('fakeRun').hidden = false;
  $('fSpellBox').hidden = mode !== 'spell'; $('fCheck').hidden = mode !== 'spell'; $('fAsk').hidden = mode !== 'spell';
  if(mode === 'spell') $('fPadHost').appendChild($('pad'));
  $('fHear').hidden = !canSpeak; $('fSlow').hidden = !canSpeak;
  $('fMic').hidden = !canRecord || mode === 'spell';
  showF();
}
function fillFakeInfo(w){
  $('fWord').innerHTML = markWord(w.q, w.ph);
  $('fSyl').innerHTML = showSyl(w.syl);
  $('fSnd').innerHTML = showSnd(w.snd);
  $('fSndRow').hidden = !$('fShowSnd').checked;
  $('fPhList').innerHTML = '<li><b>Sounds</b>: ' + w.sounds.map(esc).join(' · ') + '</li>' + phListHtml(w.q, w.ph);
  $('fDef').textContent = 'Made-up word (' + w.a.toLowerCase() + ')' + (w.spellings.length > 1 ? '. Other spellings that follow the rules: ' + w.spellings.slice(1).join(', ') : '') + '.';
}
function showF(){
  stopFakeListening();
  const w = F.order[F.i];
  F.tries = 0; F.ok = false; F.done = false;
  fillFakeInfo(w);
  $('fShow').hidden = F.mode === 'spell';
  $('fSpellOut').hidden = !canSpeak || F.mode === 'spell';
  $('fSelfOk').hidden = true;
  $('fFeedback').textContent = ''; $('fFeedback').className = 'feedback';
  $('fPos').textContent = 'Word ' + (F.i+1) + ' of ' + F.order.length;
  $('fScore').textContent = (F.mode === 'spell' ? F.score + ' correct' : (canRecord ? F.score + ' said correctly' : ''));
  $('fBar').style.width = (F.i / F.order.length * 100) + '%';
  $('fNext').textContent = F.i === F.order.length-1 ? 'See results' : 'Next word';
  if(F.mode === 'spell'){
    const inp = $('fInput'); inp.value = ''; inp.className = 'spell'; inp.disabled = false; inp.name = 'fk-' + uid();
    $('fCheck').hidden = false; $('fNext').hidden = true; setShift(false);
    if(!padOn) inp.focus();
  } else $('fNext').hidden = false;
  say([w.q], 0.85);
}
$('fShowSnd').onchange = () => { if(F && !$('fakeRun').hidden) $('fSndRow').hidden = !$('fShowSnd').checked; };
$('fHear').onclick = () => { say([F.order[F.i].q], 0.85); if(F.mode === 'spell' && !padOn) $('fInput').focus(); };
$('fSlow').onclick = () => { const w = F.order[F.i], syls = w.syl.split('-'); say(syls.length > 1 ? syls.concat([w.q]) : [w.q, w.q], 0.6); if(F.mode === 'spell' && !padOn) $('fInput').focus(); };
$('fSpellOut').onclick = () => { const w = F.order[F.i].q; say([w].concat([...w].map(c => c.toUpperCase())), 0.8); };
function markSaid(text){
  if(!F.ok){ F.ok = true; F.score++; }
  $('fFeedback').textContent = text; $('fFeedback').className = 'feedback ok'; $('fSelfOk').hidden = true; $('fJudge').hidden = true;
  $('fScore').textContent = F.score + ' said correctly';
}
$('fSelfOk').onclick = () => markSaid('Marked as said correctly.');
$('fMic').onclick = async () => {
  if(!canRecord || !F) return;
  if(recMedia && recMedia.state === 'recording'){ stopRecording(); return; }
  let stream;
  try{ stream = await navigator.mediaDevices.getUserMedia({ audio:true }); }
  catch(e){
    $('fFeedback').textContent = location.protocol === 'file:' ? 'Chrome blocks the microphone for pages opened as a file. Use the web address instead.' : 'The microphone is blocked. Allow microphone access for this page in Chrome, then try again.';
    $('fFeedback').className = 'feedback bad'; return;
  }
  if(canSpeak) speechSynthesis.cancel();
  if(recUrl){ URL.revokeObjectURL(recUrl); recUrl = null; }
  const chunks = [], rec = new MediaRecorder(stream), btn = $('fMic');
  recMedia = rec;
  rec.ondataavailable = e => { if(e.data && e.data.size) chunks.push(e.data); };
  rec.onstop = () => {
    stream.getTracks().forEach(t => t.stop());
    btn.classList.remove('on'); btn.querySelector('span').textContent = 'Say it';
    if(rec._discard || !chunks.length) return;
    recUrl = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
    compareNow();
  };
  rec.start();
  btn.classList.add('on'); btn.querySelector('span').textContent = 'Recording… tap to stop';
  $('fJudge').hidden = true;
  $('fFeedback').textContent = 'Say the word now.'; $('fFeedback').className = 'feedback';
  recTimer = setTimeout(() => stopRecording(), 3500);
};
$('fRight').onclick = () => { $('fJudge').hidden = true; markSaid('Nice. Marked as said correctly.'); };
$('fAgainRec').onclick = () => { $('fJudge').hidden = true; $('fMic').click(); };
$('fReplay').onclick = () => compareNow();
function checkF(){
  if(!F || F.mode !== 'spell' || F.done) return;
  const w = F.order[F.i], inp = $('fInput'), typed = fakeNorm(inp.value);
  if(!typed){ if(!padOn) inp.focus(); return; }
  F.tries++;
  if(w.spellings.includes(typed)){
    F.done = true; F.ok = true; F.score++; inp.className = 'spell ok'; inp.disabled = true;
    $('fFeedback').textContent = typed === w.q ? (F.tries === 1 ? 'Correct.' : 'Correct on the second try.') : 'Correct! That spelling follows the rules too. I made it as "' + w.q + '."';
    $('fFeedback').className = 'feedback ok';
    endFSpell();
  } else if(F.tries < 2){
    inp.className = 'spell bad';
    $('fFeedback').textContent = 'Not quite. Listen again and think about the rules.'; $('fFeedback').className = 'feedback bad';
    { const syls = w.syl.split('-'); say(syls.length > 1 ? syls.concat([w.q]) : [w.q, w.q], 0.6); } if(padOn) inp.value = ''; else inp.select();
  } else {
    F.done = true; F.missed.push(w); inp.className = 'spell bad'; inp.disabled = true;
    $('fFeedback').innerHTML = 'The rules spell it:<div class="reveal">' + esc(w.q) + '</div>'; $('fFeedback').className = 'feedback bad';
    endFSpell();
  }
  $('fScore').textContent = F.score + ' correct';
}
function endFSpell(){ $('fShow').hidden = false; $('fSpellOut').hidden = !canSpeak; $('fCheck').hidden = true; $('fNext').hidden = false; $('fNext').focus(); }
$('fCheck').onclick = checkF;
$('fInput').addEventListener('keydown', e => { if(!padOn && e.key === 'Enter'){ e.preventDefault(); if(F.done) $('fNext').click(); else checkF(); } });
$('fNext').onclick = () => {
  if(F.mode === 'read' && canRecord && !F.ok) F.missed.push(F.order[F.i]);
  if(F.i < F.order.length-1){ F.i++; showF(); } else finishF();
};
$('fQuit').onclick = () => finishF(true);
function finishF(early){
  stopFakeListening(); if(canSpeak) speechSynthesis.cancel();
  const done = early ? F.i + ((F.ok || F.done) ? 1 : 0) : F.order.length;
  $('fakeRun').hidden = true; $('fakeDone').hidden = false;
  const scored = F.mode === 'spell' || canRecord;
  if(scored){
    $('fdScore').textContent = (done ? Math.round(F.score/done*100) : 0) + '%';
    $('fdLine').textContent = F.score + ' of ' + done + (F.mode === 'spell' ? ' spelled correctly' : ' said correctly') + (early && done < F.order.length ? ' (ended early)' : '') + '.';
  } else { $('fdScore').textContent = done; $('fdLine').textContent = 'words practiced.'; }
  timerFinish('fake', scored ? done - F.score : 0, !early || done >= F.order.length, 'fakeTimes');
  $('fMissedWrap').hidden = !F.missed.length; $('fRetryMissed').hidden = !F.missed.length;
  $('fMissedList').innerHTML = F.missed.map(m => `<li><strong>${esc(m.q)}</strong><br><span class="a">${showSyl(m.syl)}&nbsp;&nbsp;${showSnd(m.snd)}</span></li>`).join('');
}
$('startFake').onclick = () => startFake();
$('fAgain').onclick = () => startFake();
$('fRetryMissed').onclick = () => startFake(F.missed.slice(), false);
$('fBack').onclick = () => { $('fakeDone').hidden = true; $('fakeSetup').hidden = false; };
