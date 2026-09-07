import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { EXTERNAL_PREFIX } from '../mcp-server/src/agent-api.mjs';
function sf(args) {
  try { return JSON.parse(execFileSync('/opt/homebrew/bin/sf', [...args, '--target-org', 'sport-compass', '--json'], { encoding: 'utf8', timeout: 120000, maxBuffer: 16000000, stdio: ['ignore','pipe','pipe'] })).result; }
  catch { throw Error('DIAGNOSTIC_CLI_FAILURE'); }
}
let session;
try {
  session = sf(['agent','preview','start','--api-name','SportCompass']).sessionId;
  const prompts = process.argv.includes('--transition') ? [
    'I am new to wheelchair fencing. How can I get started? Please cite the public sources you use.',
    'For that first visit, what equipment should I ask the club about? Please do not assume they provide it.',
    'For a fictional demo only, find beginner programs in Salt Lake City, UT with mobility access and equipment support. I am an adult. Show unknown accessibility details explicitly.'
  ] : ['Find beginner demo programs in Salt Lake City, UT for a 25-year-old with mobility and equipment preferences. Use the real configured matching action, not made-up examples.'];
  for (const prompt of prompts) {
    const result = sf(['agent','preview','send','--api-name','SportCompass','--session-id',session,'--utterance',EXTERNAL_PREFIX + prompt]);
    console.log(JSON.stringify({ messages: (result.messages || []).filter(m => m.type === 'Inform').map(m => m.message) }));
  }
} catch { console.log('DIAGNOSTIC_INCOMPLETE'); process.exitCode = 1; }
finally {
  if (session) {
    try {
      const end = sf(['agent','preview','end','--api-name','SportCompass','--session-id',session]);
      const dir = end.tracesPath + '/traces';
      const traces = readdirSync(dir).filter(name => name.endsWith('.json')).map(name => {
        const t=JSON.parse(readFileSync(dir+'/'+name,'utf8'));
        return {topic:t.topic, functions:(t.plan||[]).filter(p=>p.type==='FunctionStep').map(p=>({name:p.function?.name,outputKeys:Object.keys(p.function?.output||{})})), stepTypes:(t.plan||[]).map(p=>p.type)};
      });
      console.log(JSON.stringify({ended:true,traces}));
    } catch { console.log('SESSION_END_OR_TRACE_REVIEW_FAILED'); process.exitCode=1; }
  }
}
