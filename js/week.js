// Q&A Drill: this week's words, vocabulary help and fluency passage (add-on loaded from start.js).
// Each week only this file changes. Week of Nov 2 - Nov 6.
// Definitions are left empty until the packet's vocabulary page is added (they must match the packet exactly).
const THIS_WEEK = {
  id: '2026-11-02',
  words: [["ambitious", "", "am-bi-tious", "am-BISH-us"], ["dilemma", "", "di-lem-ma", "dih-LEM-uh"], ["resilient", "", "re-sil-ient", "rih-ZIL-yunt"], ["interpret", "", "in-ter-pret", "in-TUR-prit"], ["elaborate", "", "e-lab-o-rate", "ih-LAB-uh-rayt"], ["innovative", "", "in-no-va-tive", "IN-uh-vay-tiv"], ["diverse", "", "di-verse", "dy-VURS"], ["justify", "", "jus-ti-fy", "JUS-tih-fy"], ["efficient", "", "ef-fi-cient", "ih-FISH-unt"], ["skeptical", "", "skep-ti-cal", "SKEP-tih-kul"], ["transform", "", "trans-form", "trans-FORM"], ["tremendous", "", "tre-men-dous", "trih-MEN-dus"], ["cautious", "", "cau-tious", "KAW-shus"], ["emphasize", "", "em-pha-size", "EM-fuh-size"], ["authentic", "", "au-then-tic", "aw-THEN-tik"]],
  vocab: {"ambitious": {"defs": [], "sent": ["She is ___ and wants to be a scientist someday.", "The ___ team practiced every single day."], "hook": "AMBITIOUS people have big goals and work hard to reach them."}, "dilemma": {"defs": [], "sent": ["He had a ___: go to the party or finish his project.", "Picking between two favorite snacks is a tasty ___."], "hook": "DI means two. A dilemma is being stuck between two choices."}, "resilient": {"defs": [], "sent": ["The ___ tree bent in the storm but did not break.", "Being ___ means you bounce back after a loss."], "hook": "RESILIENT people bounce back, like a rubber ball."}, "interpret": {"defs": [], "sent": ["Can you ___ what the map symbols mean?", "A translator helps ___ another language."], "hook": "INTERPRET: figure out what something means."}, "elaborate": {"defs": [], "sent": ["Can you ___ on your answer with more details?", "The teacher asked him to ___ on his idea."], "hook": "e-LAB-or-ate: put more labor (work) into it and add details."}, "innovative": {"defs": [], "sent": ["The ___ robot can clean your room.", "Her ___ idea won the science fair."], "hook": "INNOVative has NOVA in it, which means new."}, "diverse": {"defs": [], "sent": ["Our class is ___, with kids from many places.", "A rainforest has a ___ group of animals."], "hook": "DIVERSE: lots of different kinds, like a big box of crayons."}, "justify": {"defs": [], "sent": ["Can you ___ your answer with a reason?", "He tried to ___ why he was late."], "hook": "JUSTify: give a reason that shows it's just, or fair."}, "efficient": {"defs": [], "sent": ["An ___ worker gets a lot done fast.", "Packing your bag the night before is ___."], "hook": "EFFICIENT: no wasted time or effort."}, "skeptical": {"defs": [], "sent": ["I was ___ that a dog could do math.", "Be ___ of ads that sound too good to be true."], "hook": "SKEPTICAL: you have doubts and want proof."}, "transform": {"defs": [], "sent": ["A caterpillar will ___ into a butterfly.", "We can ___ this box into a robot costume."], "hook": "TRANS + FORM: change into a new form, or shape."}, "tremendous": {"defs": [], "sent": ["The crowd let out a ___ cheer.", "He did a ___ job on his project."], "hook": "TREMENDOUS: so big it could make you tremble."}, "cautious": {"defs": [], "sent": ["Be ___ when you cross the street.", "The ___ cat sniffed the new food first."], "hook": "CAUTIOUS: like a CAUTION sign. Be careful!"}, "emphasize": {"defs": [], "sent": ["The coach likes to ___ teamwork.", "Use bold letters to ___ an important word."], "hook": "EMPHASIZE: say it stronger so it stands out."}, "authentic": {"defs": [], "sent": ["This is an ___ dinosaur bone, not a copy.", "The signed jersey was ___."], "hook": "AUTHENTIC: the real deal, not a fake."}},
  phonics: {"ambitious": [[4, 5, "Endings and suffixes", "-tious ending", "/shus/", ["shus", "cious", "tous"], "The ti says /sh/: am-BISH-us."]], "cautious": [[1, 2, "Vowel teams", "au", "/aw/", ["aw", "o", "ou"], "Same au as caution."], [3, 5, "Endings and suffixes", "-tious ending", "/shus/", ["shus", "cious", "tous"], "The ti says /sh/: KAW-shus."]]}
};
// fluency passage: still last week's until this week's passage is added
window.WEEK_PASSAGE = {
  id: '2026-10-26', title: 'The Challenge That Changed Everything', goal: 180, sheetTimes: [['2026-10-26', 540]],
  text: ["When the seventh-grade students learned about the upcoming school invention fair, they were excited but nervous. Their teacher explained that the competition would require creativity, teamwork, and perseverance. Each group would need to design something that could solve a problem in their community. Jordan wanted to create a device that would help students carry heavy backpacks. He decided to take the initiative and share his idea with his classmates. Although Jordan was usually independent, he understood that he would need to collaborate with others to complete the project.", "His group began to anticipate the challenges they might face. They knew they had to prioritize their tasks because they only had two weeks to finish. Everyone agreed to contribute ideas, materials, and time. During the first week, the group faced several problems. Their original design broke, and they did not have enough supplies to build another one. Instead of giving up, Jordan encouraged his classmates to adapt their plan. One student was especially resourceful and suggested using recycled materials from the school's storage room. Their teacher offered constructive advice to help them improve their design. She reminded them that success required more than intelligence. It also required integrity, patience, and a strong commitment to finishing what they started. As the competition approached, Jordan noticed that one group was struggling. Even though they were competing against each other, he showed compassion by offering to help them fix their project.", "On the day of the fair, Jordan's group proudly presented their invention. Although they did not win first place, the judges praised their creativity and teamwork. Their teacher explained that every student had the potential to become a great inventor.", "Jordan smiled because he realized they had managed to accomplish something important. They had learned how to solve problems, support others, and keep trying when things became difficult.", "By the end of the day, Jordan understood that true success was not always measured by winning. Sometimes, it was measured by the lessons learned along the way."]
};
Object.assign(VOCAB, THIS_WEEK.vocab);
Object.assign(PH, THIS_WEEK.phonics);
// put this week's words in the Spelling words list (once per new week)
const baseLoadWeek = load;
load = function(){
  baseLoadWeek();
  // the Spelling words list follows the packet's order (1-5 Monday, 6-10 Tuesday, 11-15 Wednesday)
  if(!data.sheetOrderDefault){
    data.sheetOrderDefault = true;
    const sw = data.sets.find(st => st.name === 'Spelling words');
    if(sw){ sw.order = 'sheet'; if(data.cur === sw.id) data.group = 0; }
    save();
  }
  // keep this week's definitions exactly as the packet has them
  const packetDef = Object.fromEntries(THIS_WEEK.words.map(([q, a]) => [q, a]));
  data.sets.forEach(st => st.items.forEach(it => { const d = packetDef[it.q.toLowerCase()]; if(d && it.a !== d){ it.a = d; } }));
  save();
  if(data.weekList === THIS_WEEK.id) return;
  data.weekList = THIS_WEEK.id;
  let set = data.sets.find(st => st.name === 'Spelling words');
  if(!set){ set = { id: uid(), name: 'Spelling words', items: [] }; data.sets.push(set); }
  set.items = THIS_WEEK.words.map(([q, a, syl, snd]) => ({ id: uid(), q, a, syl, snd }));
  if(!set.caps || set.caps === 'none') set.caps = 'first';
  set.order = 'sheet';
  data.cur = set.id; data.group = 0; items = set.items; justSeeded = true;
  save();
};
(window.LOADED_EXTRA = window.LOADED_EXTRA || []).push('js/week.js');
