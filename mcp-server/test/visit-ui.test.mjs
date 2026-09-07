import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createGuidanceServer } from '../src/mcp-guidance.mjs';
import { buildVisitModel, clubIdentities } from '../src/visit-model.mjs';
import { publicUrls } from '../src/public-agent-config.mjs';
import { VISIT_URI } from '../src/visit-resource.mjs';
const now=Date.parse('2026-09-07T12:00:00Z');
const reply='Wasatch Fencing Club is a public listing in Kaysville, UT. https://www.wasatchfencing.com/ Accessibility is unknown. https://www.usafencingutah.com/utah-idaho-clubs';
const model=text=>buildVisitModel([{text}],publicUrls,now);
test('club cards require returned name and exact approved URL, not user input or arbitrary identities',()=>{
  assert.equal(model(reply).clubs[0].id,'wasatch');
  assert.equal(model('Wasatch Fencing Club').clubs.length,0);
  assert.equal(model('https://www.wasatchfencing.com/').clubs.length,0);
  assert.equal(model('Evil Club https://evil.example').clubs.length,0);
  assert.equal(model('Wasatch Fencing Club https://www.wasatchfencing.com/?private=1').clubs.length,0);
  assert.equal(model('No reviewed club listing. '+reply).clubs.length,0);
});
test('UI never promotes generated accessibility claims to verified facts',()=>{
  const item=model(reply+' All access is guaranteed!').clubs[0];
  for(const field of ['wheelchairFencing','stepFreeAccess','loanerEquipment'])assert.equal(item[field],'Needs confirmation');
});
test('only current approved sources are clickable; internal URLs are excluded',()=>{
  const item=model(reply+' https://evil.example/ https://bucket.s3.amazonaws.com/doc?signature=SECRET');
  assert.deepEqual(item.sources,[clubIdentities[0].website,clubIdentities[0].sourceUrl]);
  assert.equal(buildVisitModel([{text:reply}],publicUrls,now+91*86400000).clubs.length,0);
});
test('presentation identities and review dates match the committed Salesforce metadata',()=>{
  for(const [id,filename] of [['wasatch','Wasatch_Fencing'],['salt-city','Salt_City_Swords']]){
    const source=readFileSync(new URL('../../force-app/main/default/customMetadata/Public_Fencing_Club.'+filename+'.md-meta.xml',import.meta.url),'utf8');
    const club=clubIdentities.find(item=>item.id===id);
    for(const field of ['name','city','state','website','sourceUrl','checkedOn'])assert.ok(source.includes('>'+club[field]+'</value>'));
  }
});
async function setup(t){
  let principal='user-a',time=now,text=reply,fail=false;const calls=[];
  const app=createGuidanceServer({publicUrls,enableVisitUi:true,authorize:async()=>principal,now:()=>time,ttlMs:1000,
    client:{start:async()=>{calls.push('start');return randomUUID();},send:async()=>{calls.push('send');if(fail)throw Error();return{messages:[{type:'Inform',message:text}]};},end:async()=>{calls.push('end');}}});
  const client=new Client({name:'UI protocol test',version:'1'});const [a,b]=InMemoryTransport.createLinkedPair();await app.server.connect(b);await client.connect(a);
  t.after(async()=>{await app.close();await client.close();});
  const call=(name,args={})=>client.callTool({name,arguments:args});
  return {app,client,call,calls,as:p=>principal=p,advance:()=>time+=1001,reply:t=>text=t,fail:()=>fail=true};
}
test('renderer is strict, read-only, decoupled and resource has no external asset/network requirements',async t=>{
  const {client,call}=await setup(t);const tools=(await client.listTools()).tools;
  assert.equal(tools.length,4);const render=tools.find(x=>x.name==='show_visit_planner');
  assert.equal(render.annotations.readOnlyHint,true);assert.equal(render.annotations.openWorldHint,false);
  assert.equal(render._meta.ui.resourceUri,VISIT_URI);assert.equal(render.inputSchema.additionalProperties,false);
  assert.equal(tools.find(x=>x.name==='ask_sport_compass')._meta.ui,undefined);
  assert.equal((await call('show_visit_planner',{conversationHandle:randomUUID(),website:'https://evil.example'})).isError,true);
  const resource=await client.readResource({uri:VISIT_URI});assert.match(resource.contents[0].text,/My first fencing visit/);
  assert.deepEqual(resource.contents[0]._meta.ui.csp,{connectDomains:[],resourceDomains:[],frameDomains:[]});
});
test('renderer uses cached Salesforce answer without another upstream or LLM call',async t=>{
  const {call,calls}=await setup(t);const {conversationHandle}=(await call('start_sport_compass')).structuredContent;
  assert.match((await call('show_visit_planner',{conversationHandle})).content[0].text,/GUIDANCE_REQUIRED/);
  await call('ask_sport_compass',{conversationHandle,message:'Find a club in Kaysville, Utah.'});
  for(let i=0;i<3;i++)assert.equal((await call('show_visit_planner',{conversationHandle})).structuredContent.clubs[0].id,'wasatch');
  assert.deepEqual(calls,['start','send']);
});
test('render denies cross-principal, missing authentication, random, ended and expired sessions',async t=>{
  const {call,as,advance}=await setup(t);const {conversationHandle}=(await call('start_sport_compass')).structuredContent;
  await call('ask_sport_compass',{conversationHandle,message:'Kaysville, UT'});as('user-b');
  assert.match((await call('show_visit_planner',{conversationHandle})).content[0].text,/CONVERSATION_NOT_FOUND/);
  as(null);assert.match((await call('show_visit_planner',{conversationHandle})).content[0].text,/AUTHENTICATION_REQUIRED/);
  as('user-a');advance();assert.match((await call('show_visit_planner',{conversationHandle})).content[0].text,/SESSION_EXPIRED/);
  const next=(await call('start_sport_compass')).structuredContent.conversationHandle;await call('end_sport_compass',{conversationHandle:next});
  assert.equal((await call('show_visit_planner',{conversationHandle:next})).isError,true);
});
test('no-results follow-up replaces previous club rather than carrying stale location',async t=>{
  const {call,reply}=await setup(t);const {conversationHandle}=(await call('start_sport_compass')).structuredContent;
  await call('ask_sport_compass',{conversationHandle,message:'Kaysville, UT'});reply('No reviewed club listing for Atlantis, ZZ. https://member.usafencing.org/clubs');
  await call('ask_sport_compass',{conversationHandle,message:'Atlantis, ZZ'});assert.equal((await call('show_visit_planner',{conversationHandle})).structuredContent.clubs.length,0);
});
test('failed follow-up invalidates the render snapshot',async t=>{
  const {call,fail}=await setup(t);const {conversationHandle}=(await call('start_sport_compass')).structuredContent;
  await call('ask_sport_compass',{conversationHandle,message:'Kaysville, UT'});fail();await call('ask_sport_compass',{conversationHandle,message:'Salt Lake City, UT'});
  assert.equal((await call('show_visit_planner',{conversationHandle})).isError,true);
});
test('UI source uses safe text rendering, no model calls, storage, telemetry or automatic contact',()=>{
  const js=readFileSync(new URL('../ui/first-visit.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(js,/innerHTML|outerHTML|localStorage|sessionStorage|callServerTool|sendMessage|fetch\(|XMLHttpRequest|mailto:|\u2014/);
  assert.match(js,/navigator.clipboard/);assert.match(js,/copy-fallback/);
  const html=readFileSync(new URL('../ui/first-visit.html',import.meta.url),'utf8');
  assert.match(html,/role="status"/);assert.match(html,/No booking, email or Salesforce record update/);
});

test('compact card keeps planner opt-in, removes three-tab navigation and retains source/uncertainty',()=>{
  const html=readFileSync(new URL('../ui/first-visit.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('../ui/first-visit.mjs',import.meta.url),'utf8');
  assert.match(html,/id="app"[^>]*data-view="club"/);
  assert.match(html,/id="panel-prepare"[^>]*hidden/);
  assert.match(html,/id="panel-plan"[^>]*hidden/);
  assert.match(html,/id="back-to-club"[^>]*hidden/);
  assert.doesNotMatch(html,/id="nav-(club|prepare|plan)"|class="intro"/);
  assert.match(js,/Needs confirmation: /);
  assert.match(js,/Listing source/);
  assert.match(js,/Not an accessibility audit/);
  assert.match(js,/'plan-visit'\).addEventListener\('click',\(\)=>go\('prepare'\)\)/);
  assert.match(js,/'back-to-club'\).addEventListener\('click',\(\)=>go\('club'\)\)/);
  assert.equal(VISIT_URI,'ui://sport-compass/first-visit-v4.html');
});
