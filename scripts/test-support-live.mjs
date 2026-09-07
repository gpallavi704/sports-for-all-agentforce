// Creates at most one synthetic Case per run after explicit/native confirmation.
// Usage: node scripts/test-support-live.mjs sport-compass 3
// Uses only the known fictional fixture; leaves created Cases as test evidence.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const target=process.argv[2]||'sport-compass';
const runs=Number(process.argv[3]||1);
assert.ok(Number.isInteger(runs)&&runs>=1&&runs<=3);
execFileSync('node',['scripts/verify-agent-draft.mjs'],{stdio:'pipe'});
const sourcePath='force-app/main/default/aiAuthoringBundles/SportCompass/SportCompass.agent';
const source=readFileSync(sourcePath,'utf8');
function sf(args){
  try {const j=JSON.parse(execFileSync('sf',[...args,'--target-org',target,'--api-version','67.0','--json'],{encoding:'utf8',timeout:90000,maxBuffer:12*1024*1024,stdio:['ignore','pipe','pipe']}));assert.equal(j.status,0);return j.result;}
  catch {throw new Error('Salesforce operation failed: '+args.slice(0,3).join(' '));}
}
assert.equal(sf(['data','query','--query','SELECT Id FROM Organization']).records[0].Id,'00DgL00000c7pj3UAA');
const program='a02gL00000WhbJfQAJ';
const caseQuery="SELECT Id,CaseNumber,Owner.Name,SC_Support_Category__c FROM Case WHERE SC_Is_Demo__c=true AND SC_Program__c='"+program+"' AND SC_Runtime_User__c='005gL00000Nf47FQAR'";
const cases=()=>sf(['data','query','--query',caseQuery]).records;
const report={startedAt:new Date().toISOString(),sourceSha256:createHash('sha256').update(source).digest('hex'),activated:false,syntheticOnly:true,runs:[]};
mkdirSync('temp/support-live',{recursive:true});
const path='temp/support-live/'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';
console.log('Sanitized report: '+path);
function save(){writeFileSync(path,JSON.stringify(report,null,2)+'\n');}
function clean(text){return String(text||'').replace(/https?:\/\/[^\s<>]+/g,'[URL omitted]').replace(/[A-Za-z0-9+/=]{120,}\.[A-Za-z0-9+/=]{30,}/g,'[internal token omitted]');}
async function session(row,scenario,fn){
  const s={scenario,turns:[]};row.sessions.push(s);let id;
  try{
    assert.equal(readFileSync(sourcePath,'utf8'),source,'Do not edit source during evaluation');
    id=sf(['agent','preview','start','--api-name','SportCompass']).sessionId;
    // Preparation now requires the selected program to come from this session's matcher output.
    sf(['agent','preview','send','--api-name','SportCompass','--session-id',id,'--utterance','Find fictional demo programs in Salt Lake City, UT, beginner, mobility preferences.']);
    await fn((utterance)=>{
      const r=sf(['agent','preview','send','--api-name','SportCompass','--session-id',id,'--utterance',utterance]);
      const text=(r.messages||[]).map(m=>clean(m.message)).join('\n');
      s.turns.push({utterance,answer:text});save();return text;
    });
  } finally {
    if(id){
      try{
        const ended=sf(['agent','preview','end','--api-name','SportCompass','--session-id',id]);
        s.traces=readdirSync(ended.tracesPath+'/traces').filter(f=>f.endsWith('.json')).map(f=>{
          const t=JSON.parse(readFileSync(ended.tracesPath+'/traces/'+f,'utf8'));
          return {topic:t.topic,functions:(t.plan||[]).filter(p=>p.type==='FunctionStep').map(p=>({name:p.function?.name,state:p.function?.output?.state,status:p.function?.output?.status,caseId:p.function?.output?.caseId,caseNumber:p.function?.output?.caseNumber,actualUserReply:clean(p.function?.input?.latestUserMessage)}))};
        });s.ended=true;
      }catch{s.ended=false;s.sessionNeedingCleanup=id;process.exitCode=1;}
    }save();
  }
}
for(let i=1;i<=runs;i++){
  const row={run:i,sessions:[]};report.runs.push(row);
  try {
    const before=cases();const initial=new Set(before.map(c=>c.Id));row.beforeCount=initial.size;
    const assertNoNew=()=>assert.deepEqual(cases().map(c=>c.Id).sort(),[...initial].sort(),'Unexpected Case before confirmation');
    await session(row,'cancellation',async send=>{
      const draft=send('Synthetic test only. Prepare, do not create, a demo support request for fixture program '+program+' (DEMO - Youth Program Needs Confirmation), category Equipment question. Show the complete proposed draft.');
      assert.match(draft,/SYNTHETIC DEMO SUPPORT REQUEST/i);assertNoNew();
      send('I guess so');assertNoNew();
      send('no');assertNoNew();
      const after=send('yes');assertNoNew();
      assert.doesNotMatch(after,/I.?m going to confirm your request|reply .?yes.? (again|to proceed|to continue)|please reply .?yes/i,'Discarded draft reopened its confirmation');
      const repeat=send('yes');assertNoNew();
      assert.doesNotMatch(repeat,/I.?m going to confirm your request|reply .?yes.? (again|to proceed|to continue)|please reply .?yes/i,'Repeated yes reopened the discarded draft');
    });
    const cancellation=row.sessions[0].traces.flatMap(t=>t.functions);
    assert.ok(cancellation.some(f=>f.name==='Review_Reply'&&f.state==='DECLINED'),'Cancellation not deterministically reviewed');
    assert.ok(!cancellation.some(f=>f.name==='Confirm_Support'),'Cancelled draft reached write action');
    assert.equal(cancellation.filter(f=>f.name==='Prepare_Support').length,1,'Cancellation or isolated yes prepared a replacement draft');
    await session(row,'revision_and_confirmation',async send=>{
      send('Synthetic test only. Prepare, do not create, a demo support request for DEMO - Youth Program Needs Confirmation, category Equipment question. Show the complete draft.');assertNoNew();
      send('change it');assertNoNew();
      const revision=send('Use Accessibility information needs verification as the reason for DEMO - Youth Program Needs Confirmation. Prepare and show the revised draft; do not create a Case yet.');
      assert.match(revision,/Accessibility information needs verification/);assert.match(revision,/SYNTHETIC DEMO SUPPORT REQUEST/i);assertNoNew();
      send('probably');assertNoNew();
      send('yes');
      let created=cases().filter(c=>!initial.has(c.Id));
      if(created.length===0){send('yes');created=cases().filter(c=>!initial.has(c.Id));}
      assert.equal(created.length,1,'Expected one Case after explicit/native confirmation');
      assert.equal(created[0].SC_Support_Category__c,'Accessibility information needs verification');
      assert.equal(created[0].Owner.Name,'Sport Compass Support');row.created=created[0];
      send('I confirm');
      // Native retry confirmation, if required. Must still return the same Case.
      send('yes');
      assert.equal(cases().filter(c=>!initial.has(c.Id)).length,1,'Duplicate retry created another Case');
    });
    const trace=row.sessions[1].traces.flatMap(t=>t.functions);
    assert.ok(trace.some(f=>f.name==='Review_Reply'&&f.state==='REVISE'),'Revision not deterministically reviewed');
    assert.ok(trace.some(f=>f.name==='Confirm_Support'&&f.status==='CREATED'&&f.actualUserReply.toLowerCase()==='yes'));
    row.passed=true;
  }catch(e){row.passed=false;row.error=e.message;process.exitCode=1;save();console.log(JSON.stringify({run:i,passed:false,error:row.error}));break;}
  save();console.log(JSON.stringify({run:i,passed:row.passed,caseNumber:row.created?.CaseNumber,sessionsEnded:row.sessions.every(s=>s.ended)}));
}
save();
