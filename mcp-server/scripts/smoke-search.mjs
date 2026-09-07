// Opt-in public Agentforce regression. No business-record or contact actions.
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
if(process.argv[2]!=='--approved-live-check')process.exit(2);
const client=new Client({name:'sport-compass-search-regression',version:'1'});
const transport=new StdioClientTransport({command:process.execPath,args:[fileURLToPath(new URL('../src/stdio-public.mjs',import.meta.url)),'--approved-public-guidance'],env:{},stderr:'pipe'});
transport.stderr.on('data',()=>{});
let conversationHandle;let passed=0;
const cases=[
  {message:'Find a fencing club in Kaysville, Utah, and help me plan my first wheelchair fencing visit.',expected:'wasatch',excluded:'Salt City Swords'},
  {message:'Find a club near Salt Lake City Utah and help me prepare for a first visit.',expected:'salt-city',excluded:'Wasatch Fencing'},
  {message:'What about Atlantis, ZZ? Help me prepare too.',expected:null,excluded:'Wasatch Fencing|Salt City Swords'}
];
try{
  await client.connect(transport);
  const started=await client.callTool({name:'start_sport_compass',arguments:{}},undefined,{timeout:90000});
  assert.equal(started.isError,undefined);conversationHandle=started.structuredContent.conversationHandle;
  for(const [index,item]of cases.entries()){
    const answer=await client.callTool({name:'ask_sport_compass',arguments:{conversationHandle,message:item.message}},undefined,{timeout:90000});
    assert.equal(answer.isError,undefined);
    const text=answer.structuredContent.messages.map(m=>m.text).join('\n');
    const view=await client.callTool({name:'show_visit_planner',arguments:{conversationHandle}});
    assert.equal(view.isError,undefined);
    const ids=view.structuredContent.clubs.map(c=>c.id);
    const ok=(item.expected?ids.includes(item.expected):ids.length===0)&&!new RegExp(item.excluded,'i').test(text);
    console.log(JSON.stringify({turn:index+1,passed:ok,prompt:item.message,answer:text,clubs:ids}));
    if(ok)passed++;else process.exitCode=1;
  }
  console.log(JSON.stringify({passed:passed===cases.length,checks:passed,total:cases.length,backend:'Salesforce Agentforce'}));
}catch{console.error('PUBLIC_SEARCH_REGRESSION_FAILED');process.exitCode=1;}
finally{if(conversationHandle){try{await client.callTool({name:'end_sport_compass',arguments:{conversationHandle}},undefined,{timeout:90000});}catch{process.exitCode=1;}}await client.close();}
