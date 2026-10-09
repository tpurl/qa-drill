// Q&A Drill: start the app (loads last).
// Add-on tabs listed in EXTRA load first; the single-file build inlines them, so they are skipped here.
const EXTRA = ['js/fractions.js'];
function startApp(){ load(); buildPad(); $('usePad').checked = data.pad === undefined ? touchy : !!data.pad; applyPad(); renderSets(); renderList(); showTab(justSeeded ? 'spell' : 'edit'); }
(function loadExtra(i){
  if(i >= EXTRA.length) return startApp();
  if((window.LOADED_EXTRA || []).includes(EXTRA[i])) return loadExtra(i + 1);
  const s = document.createElement('script');
  s.src = EXTRA[i];
  s.onload = s.onerror = () => loadExtra(i + 1);
  document.head.appendChild(s);
})(0);
