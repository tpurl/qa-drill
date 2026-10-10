// Q&A Drill: vocabulary helpers (loaded as an add-on from start.js). For each word: other ways to say the definition (tests reword them),
// fill-in-the-blank sentences (___ marks the word), and a memory hook.
const VOCAB = {
  analyze:     { defs:['To look at something closely to understand it.', 'To examine the parts of something carefully.'],
                 sent:['Scientists ___ the data to find a pattern.', 'Let\'s ___ the poem line by line to see what it means.'],
                 hook:'Analyze: look at every part up close, like a detective with a magnifying glass.' },
  accurate:    { defs:['Exactly right, with no errors.', 'Correct in every detail.'],
                 sent:['Check your math so your answer is ___.', 'The map was ___, so we didn\'t get lost.'],
                 hook:'Accurate: right on target, like hitting the bullseye.' },
  conclude:    { defs:['To make a decision based on the facts.', 'To figure something out after thinking it through.'],
                 sent:['From the clues, the detective could ___ who took the cookies.', 'After the experiment, we can ___ that plants need sunlight.'],
                 hook:'con-CLUDE closes it, like a conclusion at the end. Don\'t mix it up with con-TRAST.' },
  contrast:    { defs:['To show the differences between things.', 'To compare things to see how they are not alike.'],
                 sent:['___ a cat and a dog by telling how they are different.', 'In your paragraph, ___ summer and winter.'],
                 hook:'con-TRAST tells things apart: black and white have a big contrast.' },
  evidence:    { defs:['Proof that something is true.', 'Facts that help show an idea is right.'],
                 sent:['The muddy footprints were ___ that the dog came inside.', 'Use ___ from the story to support your answer.'],
                 hook:'EVIDence makes the truth EVIDent, plain to see.' },
  essential:   { defs:['Very important or necessary.', 'Something you must have.'],
                 sent:['Water is ___ for plants to live.', 'A pencil is ___ for taking the test.'],
                 hook:'ESSENTial is the essence: the part you can\'t do without.' },
  familiar:    { defs:['Something you know well.', 'Easy to recognize because you have seen it before.'],
                 sent:['The song sounded ___ because I had heard it before.', 'Her face looked ___, but I couldn\'t remember her name.'],
                 hook:'FAMILiar sounds like FAMILy: people you know well.' },
  generate:    { defs:['To create or produce something.', 'To make something new.'],
                 sent:['Wind turbines ___ electricity.', 'Let\'s ___ some ideas for the science fair.'],
                 hook:'Generate works like a GENerator: it makes things.' },
  identify:    { defs:['To recognize or name something.', 'To tell what or who something is.'],
                 sent:['Can you ___ the bird by its colors?', 'The teacher asked us to ___ the main idea.'],
                 hook:'IDentify: your ID card names who you are.' },
  influence:   { defs:['The power to change how someone thinks or acts.', 'Having an effect on someone or something.'],
                 sent:['Good friends can have a good ___ on you.', 'The weather can have an ___ on how we feel.'],
                 hook:'In-FLU-ence: something flows in and changes you.' },
  perspective: { defs:['A point of view.', 'How a person sees or thinks about something.'],
                 sent:['From the dog\'s ___, the bath was terrible.', 'Try to see the problem from her ___.'],
                 hook:'per-SPEC-tive: spec means look, like spectacles. It\'s how you see things.' },
  relevant:    { defs:['Having to do with the subject.', 'Related to what is being talked about.'],
                 sent:['Only include facts that are ___ to your topic.', 'His story about pizza was not ___ to the math lesson.'],
                 hook:'RELevant RELates to the topic.' },
  significant: { defs:['Important or worth noticing.', 'Having a big meaning or effect.'],
                 sent:['Winning the championship was a ___ moment for the team.', 'There was a ___ change in the weather overnight.'],
                 hook:'SIGNificant: it\'s a SIGN that it matters.' },
  sufficient:  { defs:['As much as you need.', 'Enough.'],
                 sent:['We have ___ food for everyone at the party.', 'Is one hour ___ time to finish the project?'],
                 hook:'SUFFicient: it SUFFices, there\'s enough. Don\'t mix it up with SIGNificant.' },
  maintain:    { defs:['To keep something working or in good shape.', 'To keep something going.'],
                 sent:['You have to ___ your bike so it keeps working.', 'Try to ___ a steady pace during the race.'],
                 hook:'MAIN + TAIN (hold): keep holding on to it.' }
};
const vocabOf = it => VOCAB[(it && it.q || '').trim().toLowerCase()] || null;
// the definition to show: the list's own wording, or one of the other ways to say it
function defOf(it){ const v = vocabOf(it); return v ? pick1([it.a].concat(v.defs)) : it.a; }
function sentenceOf(it){ const v = vocabOf(it); return v && v.sent.length ? pick1(v.sent) : null; }
const hookOf = it => { const v = vocabOf(it); return v ? v.hook : ''; };
function pick1(a){ return a[Math.floor(Math.random() * a.length)]; }
// the words he missed on the 10/9 vocabulary test
const MISSED_TEST = { id:'2026-10-09', name:'Missed on test', words:['conclude','contrast','generate','identify','influence','perspective','relevant','significant','sufficient','maintain'] };

// add the "sentence with a blank" choice to Multiple choice
$('direction').insertAdjacentHTML('beforeend', '<option value="sent">a sentence with a blank, pick the word</option>');

// give the missed test words their own list (added once)
const baseLoadVocab = load;
load = function(){
  baseLoadVocab();
  if(data.missedTest === MISSED_TEST.id) return;
  data.missedTest = MISSED_TEST.id;
  const week = data.sets.find(st => st.name === 'Spelling words');
  const words = week ? week.items.filter(it => MISSED_TEST.words.includes(it.q.toLowerCase())) : [];
  if(words.length && !data.sets.some(st => st.name === MISSED_TEST.name)){
    data.sets.push({ id: uid(), name: MISSED_TEST.name, caps: 'first', items: words.map(it => Object.assign({}, it, { id: uid() })) });
  }
  save();
};
// Matching: show the definitions in rotating wordings
const baseShowRoundVocab = showRound;
showRound = function(){
  baseShowRoundVocab();
  $('colA').querySelectorAll('.tile').forEach(t => { const it = items.find(x => x.id === t.dataset.id); if(it) t.textContent = defOf(it); });
};
// Pronounce: show the memory hook when there's no other tip
const baseShowPVocab = showP;
showP = function(){
  baseShowPVocab();
  const it = P.order[P.i], hook = !it.tip && it.id.endsWith(':q') ? hookOf(it) : '';
  if(hook){ $('pTip').textContent = '💡 ' + hook; $('pTip').hidden = false; }
};
// Spelling: add the memory hook under the spelling patterns
const baseShowSpellPhVocab = showSpellPh;
showSpellPh = function(){
  baseShowSpellPhVocab();
  const hook = hookOf(S.order[S.i]);
  if(!hook) return;
  if($('sPh').hidden){ $('sPh').innerHTML = ''; $('sPh').hidden = false; }
  $('sPh').insertAdjacentHTML('beforeend', '<p class="hint" style="margin:8px 0 0">💡 ' + esc(hook) + '</p>');
};
(window.LOADED_EXTRA = window.LOADED_EXTRA || []).push('js/vocab.js');
