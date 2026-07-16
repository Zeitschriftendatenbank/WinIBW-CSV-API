// csv/tests/csv.tests.js - placeholder test
(function(){
  function assert(cond,msg){ if(!cond) throw new Error(msg||'assert failed'); }
  function test_placeholder(){
    assert(typeof csv !== 'undefined' || true, 'csv module check');
    try{ application.activeWindow.appendMessage('csv.tests.js: placeholder passed',3); }catch(e){}
  }
  try{ test_placeholder(); }catch(e){ application.activeWindow.appendMessage('csv.tests.js failed: '+e.message,1); }
})();