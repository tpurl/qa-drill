// Q&A Drill: Word data (states, pronunciations, phonics notes) and small helpers
const KEY = 'qa-drill-v2', OLD = 'qa-drill-v1';
const $ = id => document.getElementById(id);
const uid = () => Math.random().toString(36).slice(2,10);
const shuffle = arr => { const a = arr.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const STATES = [['Alabama','Montgomery'],['Alaska','Juneau'],['Arizona','Phoenix'],['Arkansas','Little Rock'],['California','Sacramento'],['Colorado','Denver'],['Connecticut','Hartford'],['Delaware','Dover'],['Florida','Tallahassee'],['Georgia','Atlanta'],['Hawaii','Honolulu'],['Idaho','Boise'],['Illinois','Springfield'],['Indiana','Indianapolis'],['Iowa','Des Moines'],['Kansas','Topeka'],['Kentucky','Frankfort'],['Louisiana','Baton Rouge'],['Maine','Augusta'],['Maryland','Annapolis'],['Massachusetts','Boston'],['Michigan','Lansing'],['Minnesota','Saint Paul'],['Mississippi','Jackson'],['Missouri','Jefferson City'],['Montana','Helena'],['Nebraska','Lincoln'],['Nevada','Carson City'],['New Hampshire','Concord'],['New Jersey','Trenton'],['New Mexico','Santa Fe'],['New York','Albany'],['North Carolina','Raleigh'],['North Dakota','Bismarck'],['Ohio','Columbus'],['Oklahoma','Oklahoma City'],['Oregon','Salem'],['Pennsylvania','Harrisburg'],['Rhode Island','Providence'],['South Carolina','Columbia'],['South Dakota','Pierre'],['Tennessee','Nashville'],['Texas','Austin'],['Utah','Salt Lake City'],['Vermont','Montpelier'],['Virginia','Richmond'],['Washington','Olympia'],['West Virginia','Charleston'],['Wisconsin','Madison'],['Wyoming','Cheyenne']];
const SPELLING = [['necessary','needed; required'],['separate','to set apart or divide'],['believe','to accept something as true'],['receive','to get or be given something'],['beautiful','very pleasing to look at'],['friend','a person you like and trust'],['because','for the reason that'],['different','not the same'],['especially','more than usual; particularly'],['favorite','liked more than all the others'],['library','a place that keeps books for people to borrow'],['neighbor','a person who lives near you'],['restaurant','a place where you buy and eat meals'],['calendar','a chart of the days, weeks, and months of a year'],['surprise','something you did not expect'],['knowledge','what you know or have learned'],['weird','strange or unusual'],['government','the group of people who run a country or state'],['environment','the natural world around us'],['tomorrow','the day after today'],['vacuum','a space with nothing in it, or a machine that sucks up dirt'],['rhythm','a regular, repeated pattern of sound or movement'],['address','where someone lives or where mail is sent'],['occasion','a special event or time'],['guarantee','a promise that something will happen']];
const PRON = {necessary:['nec-es-sar-y','NESS-uh-sair-ee'],separate:['sep-a-rate','SEP-uh-rayt'],believe:['be-lieve','bih-LEEV'],receive:['re-ceive','rih-SEEV'],beautiful:['beau-ti-ful','BYOO-tih-full'],friend:['friend','FREND'],because:['be-cause','bih-KAWZ'],different:['dif-fer-ent','DIF-er-unt'],especially:['es-pe-cial-ly','ih-SPESH-uh-lee'],favorite:['fa-vor-ite','FAY-vuh-rit'],library:['li-brar-y','LY-brair-ee'],neighbor:['neigh-bor','NAY-bur'],restaurant:['res-tau-rant','RES-tuh-rahnt'],calendar:['cal-en-dar','KAL-un-der'],surprise:['sur-prise','sur-PRIZE'],knowledge:['knowl-edge','NOL-ij'],weird:['weird','WEERD'],government:['gov-ern-ment','GUV-ern-ment'],environment:['en-vi-ron-ment','en-VY-run-ment'],tomorrow:['to-mor-row','tuh-MOR-oh'],vacuum:['vac-u-um','VAK-yoom'],rhythm:['rhythm','RITH-um'],address:['ad-dress','uh-DRESS'],occasion:['oc-ca-sion','uh-KAY-zhun'],guarantee:['guar-an-tee','gair-un-TEE']};
function withPron(it){ const k = PRON[it.q.toLowerCase()]; if(k && !it.syl && !it.snd){ it.syl = k[0]; it.snd = k[1]; } return it; }

// rough syllable guess for words without hand-entered syllables
function autoSyl(word){
  if(/\s/.test(word.trim())) return word.trim().split(/\s+/).map(autoSyl).join(' ');
  const w = word.toLowerCase(), V = /[aeiouy]/;
  if(w.length <= 3) return word;
  const groups = []; let i = 0;
  while(i < w.length){ if(V.test(w[i]) && !(w[i]==='y' && i===0)){ let j=i; while(j<w.length && V.test(w[j])) j++; groups.push([i,j]); i=j; } else i++; }
  // silent final e (but keep consonant + "le")
  if(groups.length > 1){ const last = groups[groups.length-1];
    if(last[0] === w.length-1 && w[w.length-1]==='e' && !(w.endsWith('le') && w.length>3 && !V.test(w[w.length-3]))) groups.pop(); }
  if(groups.length < 2) return word;
  const cuts = [];
  for(let g=0; g<groups.length-1; g++){
    const a = groups[g][1], b = groups[g+1][0], cl = w.slice(a,b);
    let cut;
    if(g===groups.length-2 && w.endsWith('le') && b===w.length-1 && cl.length>=2) cut = b-2;
    else if(cl.length <= 1) cut = a;
    else if(/^(ch|sh|th|ph|wh|gh)$/.test(cl.slice(0,2)) && cl.length===2) cut = a;
    else if(/^(ck|ng)/.test(cl)) cut = a+2;
    else if(cl.length >= 3) cut = /(bl|br|cl|cr|dr|fl|fr|gl|gr|pl|pr|sc|sk|sl|sm|sn|sp|st|sw|tr|tw|ch|sh|th|ph|wh)$/.test(cl) ? b-2 : b-1;
    else cut = a+1;
    if(cut > 0 && cut < w.length) cuts.push(cut);
  }
  let out = '', prev = 0; cuts.forEach(c => { out += word.slice(prev,c) + '-'; prev = c; }); out += word.slice(prev);
  return out;
}
const sylOf = it => it.syl ? { text: it.syl, guess:false } : { text: autoSyl(it.q), guess:true };
const showSyl = t => esc(t).replace(/-/g,'·');
const showSnd = t => esc(t).split(/([-\s]+)/).map(p => /[A-Z]/.test(p) && p === p.toUpperCase() ? '<b>'+p+'</b>' : p).join('');

// ---------- phonics: tricky parts of each word ----------
// [start, length, group, label, sound, other spellings, tip]
const PH = {"necessary":[[2,1,"Soft and hard c","Soft c","/s/",["s","ss","sc"],"c before e, i or y usually says /s/."],[4,2,"Double letters","Double s","/s/",["s","c","sc"],"One c, two s’s: ne-C-e-SS-ary."],[6,3,"Endings and suffixes","-ary ending","/air-ee/",["ery","ory","airy"]]],"separate":[[3,1,"Schwa (lazy vowel)","Lazy vowel","/uh/",["e","u","i"],"There’s “a rat” in sep-A-RATe."],[7,1,"Silent letters","Silent e","silent",[""]]],"believe":[[3,2,"ie / ei","i before e","/ee/",["ei","ee","ea"],"Don’t beLIEve a LIE."],[6,1,"Silent letters","Silent e","silent",[""],"English words don’t end in v, so a silent e follows it."]],"receive":[[2,1,"Soft and hard c","Soft c","/s/",["s","ss","sc"]],[3,2,"ie / ei","ei after c","/ee/",["ie","ee","ea"],"i before e, except after c."],[6,1,"Silent letters","Silent e","silent",[""],"English words don’t end in v, so a silent e follows it."]],"beautiful":[[1,3,"Vowel teams","eau","/yoo/",["ew","u","eu"],"Big Elephants Are Useful: b-E-A-U."],[6,3,"Endings and suffixes","Suffix -ful","/ful/",["full","fol","fel"],"The suffix -ful has only one l."]],"friend":[[2,2,"ie / ei","Odd one out","/e/",["e","ea","ei"],"A friend is there to the END: fri-END."]],"because":[[3,2,"Vowel teams","au","/aw/",["aw","o","ou"],"Big Elephants Can Always Understand Small Elephants."],[5,2,"Sneaky sounds","s says /z/","/z/",["z","ze","s"]]],"different":[[2,2,"Double letters","Double f","/f/",["f","ph","gh"]],[4,2,"r-controlled vowels","er","/er/",["ur","ir","ar"]],[6,3,"Endings and suffixes","-ent ending","/unt/",["ant","int","unt"]]],"especially":[[4,2,"Sneaky sounds","ci says /sh/","/sh/",["sh","ti","ch"],"Think of “special” inside it."],[7,3,"Endings and suffixes","-al + -ly","/lee/",["ly","ley","lie"],"especial + ly = two l’s."]],"favorite":[[3,2,"r-controlled vowels","or says /er/","/er/",["er","ur","ir"]],[5,3,"Endings and suffixes","-ite ending","/it/",["it","ate","et"]]],"library":[[3,3,"Sneaky sounds","Don’t skip the r","/rair/",["r","rer","rr"],"Say li-BRAR-y, not li-berry."],[6,1,"Endings and suffixes","y at the end","/ee/",["ee","ey","ie"]]],"neighbor":[[1,4,"Vowel teams","eigh says /ay/","/ay/",["ay","a","ai"],"Same team as eight and weigh."],[6,2,"r-controlled vowels","or says /er/","/er/",["er","our","ur"]]],"restaurant":[[4,2,"Schwa (lazy vowel)","Hidden au","/uh/",["o","a","u"],"Rest-AU-rant: you can barely hear the au."],[7,3,"Endings and suffixes","-ant ending","/ahnt/",["ent","ont","unt"]]],"calendar":[[3,1,"Schwa (lazy vowel)","Lazy vowel","/uh/",["a","i","u"]],[6,2,"r-controlled vowels","ar says /er/","/er/",["er","or","ur"],"A calendAR has dAys And yeARs."]],"surprise":[[1,2,"r-controlled vowels","ur","/er/",["er","ir","or"],"Don’t drop the first r: suR-prise."],[5,3,"Sneaky sounds","s says /z/","/ize/",["ize","ice","yse"]]],"knowledge":[[0,2,"Silent letters","Silent k","/n/",["n","gn","nn"],"It starts with “know.”"],[2,2,"Vowel teams","ow says /o/","/o/",["o","ou","oa"]],[6,3,"Sneaky sounds","dge says /j/","/j/",["ge","j","gge"]]],"weird":[[1,2,"ie / ei","Rule breaker","/ee/",["ie","ee","ea"],"Weird breaks the i-before-e rule. That’s what makes it weird."]],"government":[[1,1,"Schwa (lazy vowel)","o says /uh/","/uh/",["u","a","ou"]],[5,1,"Sneaky sounds","Hidden n","/n/ (easy to miss)",["","nn","m"],"To GOVERN + ment."]],"environment":[[3,4,"Sneaky sounds","Hidden word","/eye-run/",["ir","iern","ern"],"There’s an IRON in envIRONment."]],"tomorrow":[[2,1,"Double letters","Only one m","/m/",["mm","mb","mn"],"One m, two r’s."],[4,2,"Double letters","Double r","/r/",["r","wr","rh"]],[6,2,"Vowel teams","ow says /oh/","/oh/",["o","oe","oa"]]],"vacuum":[[2,1,"Soft and hard c","Hard c","/k/",["k","ck","cc"]],[3,2,"Vowel teams","Double u","/yoo/",["u","oo","ew"],"One c, two u’s."]],"rhythm":[[0,2,"Silent letters","Silent h","/r/",["r","wr","rr"],"Rhythm Helps Your Two Hips Move."],[2,1,"Sneaky sounds","y as a vowel","/i/",["i","e","u"]],[3,3,"Sneaky sounds","th + m","/thum/",["them","thum","thim"]]],"address":[[1,2,"Double letters","Double d","/d/",["d","t"],"Two d’s and two s’s."],[5,2,"Double letters","Double s","/s/",["s","c","se"]]],"occasion":[[1,2,"Double letters","Double c","/k/",["c","ck","k"],"Two c’s, one s."],[4,4,"Endings and suffixes","-sion ending","/zhun/",["tion","sian","shun"]]],"guarantee":[[0,2,"Silent letters","Silent u","/g/",["g","gh","gw"],"Same gu as guard and guess."],[7,2,"Vowel teams","ee","/ee/",["ea","y","ie"]]],"analyze":[[2,1,"Schwa (lazy vowel)","Lazy vowel","/uh/",["e","i","u"]],[4,1,"Sneaky sounds","y as a vowel","/eye/",["i","ie","igh"],"American spelling uses yz: analyze."],[6,1,"Silent letters","Silent e","silent",[""]]],"accurate":[[1,2,"Double letters","Double c","/k/",["c","ck","k"],"Two c’s, one r."],[5,3,"Endings and suffixes","-ate ending","/it/",["it","et","ite"],"Here -ate sounds like \"it.\""]],"conclude":[[3,1,"Soft and hard c","Hard c","/k/",["k","ck","cc"]],[7,1,"Silent letters","Silent e","silent",[""],"The silent e makes the u say /oo/."]],"contrast":[[0,3,"Endings and suffixes","Prefix con-","/kun/",["kon","cun","com"],"con- means \"with\" or \"together.\""]],"evidence":[[2,1,"Schwa (lazy vowel)","Lazy vowel","/ih/",["e","a","u"]],[4,4,"Endings and suffixes","-ence ending","/unss/",["ance","ense","ince"],"Think of \"evident.\""]],"essential":[[1,2,"Double letters","Double s","/s/",["s","c","sc"]],[5,4,"Sneaky sounds","tial says /shul/","/shul/",["cial","shal","sial"],"It comes from \"essence.\""]],"familiar":[[1,1,"Schwa (lazy vowel)","Lazy vowel","/uh/",["e","u","o"]],[5,3,"Endings and suffixes","-iar ending","/yer/",["ier","ure","yer"],"It comes from \"family.\""]],"generate":[[0,1,"Sneaky sounds","Soft g","/j/",["j","dg","gg"],"g before e often says /j/."],[3,1,"Schwa (lazy vowel)","Lazy vowel","/uh/",["a","i","u"]],[5,3,"Endings and suffixes","-ate ending","/ayt/",["ait","eat","et"]]],"identify":[[5,1,"Schwa (lazy vowel)","Lazy vowel","/ih/",["e","a","u"]],[6,2,"Endings and suffixes","Suffix -fy","/fy/",["fie","phy","fi"],"-fy means \"to make\": identify, classify, simplify."]],"influence":[[4,1,"Vowel teams","u says /oo/","/oo/",["oo","ew","ou"]],[5,4,"Endings and suffixes","-ence ending","/unss/",["ance","ense","ince"]]],"perspective":[[1,2,"r-controlled vowels","er","/er/",["ur","ir","ar"]],[3,4,"Sneaky sounds","Root spec = look","/spek/",["spek","speck","spac"],"spec means \"look,\" like in spectacles and inspect."],[8,3,"Endings and suffixes","-ive ending","/iv/",["iv","eve","ave"],"English words don’t end in v, so a silent e follows it."]],"relevant":[[3,1,"Schwa (lazy vowel)","Lazy vowel","/uh/",["a","i","u"],"Say it slowly: rel-E-vant."],[5,3,"Endings and suffixes","-ant ending","/unt/",["ent","int","unt"]]],"significant":[[2,2,"Sneaky sounds","g and n split","/g/ + /n/",["n","gg","ng"],"It comes from \"sign.\" In sig-NIF the g and n are split, so you hear both."],[7,1,"Soft and hard c","Hard c","/k/",["k","ck","qu"]],[8,3,"Endings and suffixes","-ant ending","/unt/",["ent","int","unt"]]],"sufficient":[[2,2,"Double letters","Double f","/f/",["f","ph","gh"]],[5,2,"Sneaky sounds","ci says /sh/","/sh/",["sh","ti","ch"]],[7,3,"Endings and suffixes","-ent ending","/unt/",["ant","int","unt"]]],"maintain":[[1,2,"Vowel teams","ai","/ay/",["ay","a","ei"],"Two ai teams: m-AI-n-t-AI-n."],[5,2,"Vowel teams","ai","/ay/",["ay","ei","a"]]]};
const VT = (c, sound, alts) => ['(?<c>'+c+')', 'Vowel teams', c, sound, alts];
const RC = (c, sound, alts) => ['(?<c>'+c+')(?![aeiouy])', 'r-controlled vowels', c, sound, alts];
const AUTO = [
  ['(?<c>tion)', 'Endings and suffixes', '-tion ending', '/shun/', ['sion','shun','cian']],
  ['(?<c>[ct]i)(?=al|ent|ence|ous|an)', 'Sneaky sounds', 'ci/ti says /sh/', '/sh/', ['sh','ch','si']],
  ['(?<c>sion)', 'Endings and suffixes', '-sion ending', '/shun/ or /zhun/', ['tion','shun','zhun']],
  ['(?<c>ture)$', 'Endings and suffixes', '-ture ending', '/cher/', ['cher','chur','tur']],
  ['(?<c>ous)$', 'Endings and suffixes', '-ous ending', '/us/', ['us','uss','ose']],
  ['(?<c>ough)', 'Vowel teams', 'ough', 'many sounds', ['ow','uff','off']],
  ['(?<c>eigh)', 'Vowel teams', 'eigh says /ay/', '/ay/', ['ay','a','ai']],
  ['(?<c>igh)', 'Silent letters', 'igh says /eye/', '/eye/', ['i','ie','y']],
  ['(?<c>dge)', 'Sneaky sounds', 'dge says /j/', '/j/', ['ge','j','gge']],
  ['(?<c>tch)', 'Sneaky sounds', 'tch says /ch/', '/ch/', ['ch','sh','tsh']],
  ['^(?<c>kn)', 'Silent letters', 'Silent k', '/n/', ['n','gn','nn']],
  ['^(?<c>wr)', 'Silent letters', 'Silent w', '/r/', ['r','rh','rr']],
  ['^(?<c>gn)', 'Silent letters', 'Silent g', '/n/', ['n','kn','nn']],
  ['(?<c>mb)$', 'Silent letters', 'Silent b', '/m/', ['m','mm','mn']],
  ['(?<c>ph)', 'Sneaky sounds', 'ph says /f/', '/f/', ['f','ff','gh']],
  ['(?<c>ck)', 'Sneaky sounds', 'ck says /k/', '/k/', ['k','c','kk']],
  ['c(?<c>ei)', 'ie / ei', 'ei after c', '/ee/', ['ie','ee','ea']],
  ['(?<c>ie)(?=.)', 'ie / ei', 'i before e', '/ee/', ['ei','ee','ea']],
  ['(?<c>ei)', 'ie / ei', 'ei', '/ay/ or /ee/', ['ie','ay','ee']],
  VT('ai','/ay/',['ay','a','ei']), VT('ay','/ay/',['ai','ey','a']), VT('ee','/ee/',['ea','ie','e']), VT('ea','usually /ee/',['ee','ie','e']),
  VT('oa','/oh/',['ow','o','oe']), VT('oo','/oo/',['u','ew','ou']), VT('ou','/ow/',['ow','oo','u']), VT('ow','/ow/ or /oh/',['ou','oa','o']),
  VT('oi','/oy/',['oy','oe','io']), VT('oy','/oy/',['oi','oe','ey']), VT('au','/aw/',['aw','o','ou']), VT('aw','/aw/',['au','o','ow']), VT('ew','/oo/',['oo','u','ue']),
  RC('ar','/ar/',['or','er','arr']), RC('er','/er/',['ur','ir','or']), RC('ir','/er/',['er','ur','ear']), RC('ur','/er/',['er','ir','or']), RC('or','/or/',['our','ore','ar']),
  ['(?<c>([bcdfgklmnprstz])\\2)', 'Double letters', 'DOUBLE', '', null],
  ['(?<c>c)(?=[eiy])', 'Soft and hard c', 'Soft c', '/s/', ['s','ss','sc']],
  ['[aeiouy][^aeiouy](?<c>e)$', 'Silent letters', 'Silent e', 'silent', ['']],
  ['(?<c>ful)$', 'Endings and suffixes', 'Suffix -ful', '/ful/', ['full','fol']],
  ['(?<c>ly)$', 'Endings and suffixes', 'Suffix -ly', '/lee/', ['ley','lee','lie']],
  ['(?<c>ment)$', 'Endings and suffixes', 'Suffix -ment', '/ment/', ['mint','mant']],
  ['(?<c>ness)$', 'Endings and suffixes', 'Suffix -ness', '/nis/', ['nes','nis']],
  ['(?<c>able)$', 'Endings and suffixes', 'Suffix -able', '/uh-bul/', ['ible','abel']],
  ['(?<c>ible)$', 'Endings and suffixes', 'Suffix -ible', '/uh-bul/', ['able','ibel']],
  ['(?<c>ent)$', 'Endings and suffixes', '-ent ending', '/unt/', ['ant','int']],
  ['(?<c>ant)$', 'Endings and suffixes', '-ant ending', '/unt/', ['ent','int']],
  ['[^aeiou](?<c>y)$', 'Endings and suffixes', 'y at the end', '/ee/ or /eye/', ['ee','ie','ey']]
].map(([src, group, label, sound, alts]) => ({ re: new RegExp(src, 'gd'), group, label, sound, alts }));
const phCache = new Map();
function phParts(it){
  const word = it.q.trim();
  if(phCache.has(word)) return phCache.get(word);
  let parts = [];
  const hand = PH[word.toLowerCase()];
  if(hand) parts = hand.map(([s,l,group,label,sound,alts,tip]) => ({s,l,group,label,sound,alts,tip}));
  else if(!/\s/.test(word) && /^[a-z'-]+$/i.test(word)){
    const w = word.toLowerCase(), taken = new Array(w.length).fill(false);
    for(const p of AUTO){
      p.re.lastIndex = 0;
      for(const m of w.matchAll(p.re)){
        const [a,b] = m.indices.groups.c;
        if(taken.slice(a,b).some(Boolean)) continue;
        for(let i=a;i<b;i++) taken[i] = true;
        const chunk = w.slice(a,b);
        if(p.label === 'DOUBLE') parts.push({s:a,l:b-a,group:p.group,label:'Double '+chunk[0],sound:'/'+chunk[0]+'/',alts:[chunk[0]],auto:true});
        else parts.push({s:a,l:b-a,group:p.group,label:p.label,sound:p.sound,alts:p.alts,auto:true});
      }
    }
    parts.sort((x,y)=>x.s-y.s); parts = parts.slice(0,4);
  }
  phCache.set(word, parts);
  return parts;
}
function markWord(word, parts, blankIdx){
  let html = '', i = 0;
  parts.forEach((p,k) => {
    html += esc(word.slice(i, p.s));
    if(k === blankIdx) html += `<span class="blank" style="width:${0.6*p.l + 0.3}em" aria-label="blank"></span>`;
    else html += '<mark class="ph">' + esc(word.slice(p.s, p.s+p.l)) + '</mark>';
    i = p.s + p.l;
  });
  return html + esc(word.slice(i));
}
const soundText = p => p.sound === 'silent' ? 'is silent' : 'says ' + p.sound;
function phListHtml(word, parts, only){
  return parts.filter((p,k) => only === undefined || k === only).map(p =>
    `<li><b>${esc(word.slice(p.s,p.s+p.l))}</b>: ${esc(p.label)}, ${esc(soundText(p))}${p.tip ? `<span class="tip">${esc(p.tip)}</span>` : ''}</li>`).join('');
}

// pronunciation for states and capitals: [syllables, sounds like, tip]
const NAMES = {"Alabama":["Al-a-bam-a","al-uh-BAM-uh"],"Alaska":["A-las-ka","uh-LAS-kuh"],"Arizona":["Ar-i-zo-na","air-ih-ZOH-nuh"],"Arkansas":["Ar-kan-sas","AR-kun-saw","The final s is silent. It rhymes with \"saw,\" not \"Kansas.\""],"California":["Cal-i-for-nia","kal-ih-FOR-nyuh"],"Colorado":["Col-o-ra-do","kol-uh-RAD-oh"],"Connecticut":["Con-nect-i-cut","kuh-NET-ih-kut","The middle c is silent: kuh-NET-ih-kut."],"Delaware":["Del-a-ware","DEL-uh-wair"],"Florida":["Flor-i-da","FLOR-ih-duh"],"Georgia":["Geor-gia","JOR-juh"],"Hawaii":["Ha-wai-i","huh-WY-ee"],"Idaho":["I-da-ho","EYE-duh-hoh"],"Illinois":["Il-li-nois","il-ih-NOY","The s at the end is silent."],"Indiana":["In-di-an-a","in-dee-AN-uh"],"Iowa":["I-o-wa","EYE-uh-wuh"],"Kansas":["Kan-sas","KAN-zus"],"Kentucky":["Ken-tuck-y","ken-TUK-ee"],"Louisiana":["Lou-i-si-an-a","loo-ee-zee-AN-uh"],"Maine":["Maine","MAYN"],"Maryland":["Mar-y-land","MAIR-uh-lund"],"Massachusetts":["Mas-sa-chu-setts","mas-uh-CHOO-sits"],"Michigan":["Mich-i-gan","MISH-ih-gun","The ch sounds like sh."],"Minnesota":["Min-ne-so-ta","min-uh-SOH-tuh"],"Mississippi":["Mis-sis-sip-pi","mis-ih-SIP-ee"],"Missouri":["Mis-sou-ri","mih-ZUR-ee"],"Montana":["Mon-tan-a","mon-TAN-uh"],"Nebraska":["Ne-bras-ka","nuh-BRAS-kuh"],"Nevada":["Ne-vad-a","nuh-VAD-uh","The middle a sounds like the a in \"dad.\""],"New Hampshire":["New Hamp-shire","noo HAMP-sher"],"New Jersey":["New Jer-sey","noo JUR-zee"],"New Mexico":["New Mex-i-co","noo MEK-sih-koh"],"New York":["New York","noo YORK"],"North Carolina":["North Car-o-li-na","north kair-uh-LY-nuh"],"North Dakota":["North Da-ko-ta","north duh-KOH-tuh"],"Ohio":["O-hi-o","oh-HY-oh"],"Oklahoma":["O-kla-ho-ma","oh-kluh-HOH-muh"],"Oregon":["Or-e-gon","OR-ih-gun","It ends in \"gun,\" not \"gone.\""],"Pennsylvania":["Penn-syl-va-nia","pen-sul-VAY-nyuh"],"Rhode Island":["Rhode Is-land","rohd EYE-lund","The s in Island is silent."],"South Carolina":["South Car-o-li-na","south kair-uh-LY-nuh"],"South Dakota":["South Da-ko-ta","south duh-KOH-tuh"],"Tennessee":["Ten-nes-see","ten-uh-SEE"],"Texas":["Tex-as","TEK-sus"],"Utah":["U-tah","YOO-taw"],"Vermont":["Ver-mont","ver-MONT"],"Virginia":["Vir-gin-ia","ver-JIN-yuh"],"Washington":["Wash-ing-ton","WASH-ing-tun"],"West Virginia":["West Vir-gin-ia","west ver-JIN-yuh"],"Wisconsin":["Wis-con-sin","wis-KON-sin"],"Wyoming":["Wy-o-ming","wy-OH-ming"],"Montgomery":["Mont-gom-er-y","mont-GUM-uh-ree"],"Juneau":["Ju-neau","JOO-noh","The eau sounds like \"oh.\""],"Phoenix":["Phoe-nix","FEE-niks","The ph sounds like f, and the oe sounds like \"ee.\""],"Little Rock":["Lit-tle Rock","LIT-ul ROK"],"Sacramento":["Sac-ra-men-to","sak-ruh-MEN-toh"],"Denver":["Den-ver","DEN-ver"],"Hartford":["Hart-ford","HART-ferd"],"Dover":["Do-ver","DOH-ver"],"Tallahassee":["Tal-la-has-see","tal-uh-HASS-ee"],"Atlanta":["At-lan-ta","at-LAN-tuh"],"Honolulu":["Hon-o-lu-lu","hon-uh-LOO-loo"],"Boise":["Boi-se","BOY-see","Locals say BOY-see, not BOYZ."],"Springfield":["Spring-field","SPRING-feeld"],"Indianapolis":["In-di-a-nap-o-lis","in-dee-uh-NAP-uh-lis"],"Des Moines":["Des Moines","duh MOYN","Both s’s are silent."],"Topeka":["To-pe-ka","tuh-PEE-kuh"],"Frankfort":["Frank-fort","FRANK-fert"],"Baton Rouge":["Bat-on Rouge","BAT-un ROOZH","French for \"red stick.\" The g sounds like the s in \"treasure.\""],"Augusta":["Au-gus-ta","aw-GUS-tuh"],"Annapolis":["An-nap-o-lis","uh-NAP-uh-lis"],"Boston":["Bos-ton","BAWS-tun"],"Lansing":["Lan-sing","LAN-sing"],"Saint Paul":["Saint Paul","saynt PAWL"],"Jackson":["Jack-son","JAK-sun"],"Jefferson City":["Jef-fer-son Cit-y","JEF-er-sun SIT-ee"],"Helena":["Hel-e-na","HEL-uh-nuh","Stress the first part: HEL-uh-nuh."],"Lincoln":["Lin-coln","LINK-un","The l in \"coln\" is silent."],"Carson City":["Car-son Cit-y","KAR-sun SIT-ee"],"Concord":["Con-cord","KONG-kerd","It sounds like \"conquered,\" not \"con-cord.\""],"Trenton":["Tren-ton","TREN-tun"],"Santa Fe":["San-ta Fe","san-tuh FAY","Spanish for \"holy faith.\""],"Albany":["Al-ba-ny","AWL-buh-nee","The first a sounds like \"all.\""],"Raleigh":["Ra-leigh","RAH-lee","The eigh sounds like \"ee.\""],"Bismarck":["Bis-marck","BIZ-mark"],"Columbus":["Co-lum-bus","kuh-LUM-bus"],"Oklahoma City":["O-kla-ho-ma Cit-y","oh-kluh-HOH-muh SIT-ee"],"Salem":["Sa-lem","SAY-lum"],"Harrisburg":["Har-ris-burg","HAIR-is-burg"],"Providence":["Prov-i-dence","PROV-ih-dunss"],"Columbia":["Co-lum-bi-a","kuh-LUM-bee-uh"],"Pierre":["Pierre","PEER","Locals say PEER, not the French pee-AIR."],"Nashville":["Nash-ville","NASH-vil"],"Austin":["Aus-tin","AW-stin"],"Salt Lake City":["Salt Lake Cit-y","SAWLT LAYK SIT-ee"],"Montpelier":["Mont-pel-ier","mont-PEEL-yer"],"Richmond":["Rich-mond","RICH-mund"],"Olympia":["O-lym-pi-a","oh-LIM-pee-uh"],"Charleston":["Charles-ton","CHARLZ-tun"],"Madison":["Mad-i-son","MAD-ih-sun"],"Cheyenne":["Chey-enne","shy-AN","The ch sounds like sh: shy-AN."]};
const NAMES_LC = Object.fromEntries(Object.entries(NAMES).map(([k,v]) => [k.toLowerCase(), v]));
const CAP_RE = /^what is the capital of (.+?)\??$/i;

// turn list items into things to pronounce
function makeTerm(text, hint, item, side){
  const t = { id: item.id + ':' + side, q: text, a: hint };
  const own = side === 'q' ? [item.syl, item.snd] : [item.asyl, item.asnd];
  const nm = NAMES_LC[text.toLowerCase()];
  if(own[0] || own[1]){ if(own[0]) t.syl = own[0]; if(own[1]) t.snd = own[1]; }
  else if(nm){ t.syl = nm[0]; t.snd = nm[1]; if(nm[2]) t.tip = nm[2]; t.noPh = true; }
  else if(side === 'a'){ const k = PRON[text.toLowerCase()]; if(k){ t.syl = k[0]; t.snd = k[1]; } }
  if(nm && nm[2] && !t.tip) t.tip = nm[2];
  return t;
}
function buildTerms(pool, cols){
  const out = [];
  pool.forEach(it => {
    const m = it.q.trim().match(CAP_RE);
    const qText = m ? m[1].trim() : it.q.trim();
    if(cols !== 'a') out.push(makeTerm(qText, m ? 'State. Its capital is ' + it.a + '.' : it.a, it, 'q'));
    if(cols !== 'q') out.push(makeTerm(it.a.trim(), m ? 'Capital of ' + qText + '.' : it.q, it, 'a'));
  });
  return out;
}
const looksLikeCapitals = () => items.length && items.filter(it => CAP_RE.test(it.q.trim())).length >= items.length / 2;

const stateItems = () => STATES.map(([s,c])=>({id:uid(), q:'What is the capital of ' + s + '?', a:c}));
const pairItems = arr => arr.map(([q,a])=>withPron({id:uid(), q, a}));
