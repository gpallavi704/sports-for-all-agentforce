// Read-only live agent regression. Does not open mailto links or send messages.
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
function sf(args) {
  const value=JSON.parse(execFileSync('sf',[...args,'--target-org','sport-compass','--json'],
    {encoding:'utf8',timeout:120000,maxBuffer:12000000,stdio:['ignore','pipe','pipe']}));
  assert.equal(value.status,0);return value.result;
}
let session;
try {
  session=sf(['agent','preview','start','--api-name','SportCompass']).sessionId;
  const turns=[
    ['Find a real fencing club in Salt Lake City, Utah.',/Salt City Swords/],
    ['What about Kaysville, Utah?',/Wasatch Fencing/],
    ['Help me email this club about trying wheelchair fencing.',/Sport Compass Team/]
  ];
  for(const [question,expected] of turns) {
    const reply=sf(['agent','preview','send','--api-name','SportCompass','--session-id',session,'--utterance',question]);
    const text=(reply.messages||[]).map(m=>m.message||'').join('\n');
    assert.match(text,expected);
    if(question.startsWith('What about'))assert.doesNotMatch(text,/Salt City Swords|no reviewed/i);
    if(question.startsWith('Help me')) {
      assert.doesNotMatch(text,/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|mailto:|URL_Redacted|Open in email|DEMO ONLY|\u2014/i);
      assert.match(text,/not.*club/i);
      assert.match(text,/draft|review|copy/i);
      assert.doesNotMatch(text,/I (?:have )?(?:sent|emailed)|successfully sent/i);
    }
    // No raw traces or capability URLs in terminal logs.
    console.log(JSON.stringify({question,passed:true}));
  }
} finally {
  if(session) {sf(['agent','preview','end','--api-name','SportCompass','--session-id',session]);console.log('Session closed');}
}
