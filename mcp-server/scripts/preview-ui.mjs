// Local visual test host. No Salesforce access, authentication or public listener.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { buildVisitModel } from '../src/visit-model.mjs';
import { publicUrls } from '../src/public-agent-config.mjs';
const fixture=buildVisitModel([{text:'Wasatch Fencing Club is a public listing in Kaysville, UT. https://www.wasatchfencing.com/ Wheelchair fencing, access and equipment are unconfirmed. https://www.usafencingutah.com/utah-idaho-clubs'}],publicUrls,Date.parse('2026-09-07'));
const js=await build({stdin:{contents:`import {AppBridge,PostMessageTransport} from '@modelcontextprotocol/ext-apps/app-bridge';
const frame=document.querySelector('iframe');const bridge=new AppBridge(null,{name:'Local UI test',version:'1'},{openLinks:{}},{hostContext:{theme:'light',displayMode:'inline'}});
bridge.oninitialized=async()=>{await bridge.sendToolInput({arguments:{}});await bridge.sendToolResult({structuredContent:${JSON.stringify(fixture)},content:[]});};
bridge.onsizechange=({height})=>{frame.style.height=Math.max(400,height)+'px';};
bridge.onopenlink=async({url})=>{document.getElementById('event').textContent='Link requested: '+url;return {};};
document.getElementById('dark').onchange=e=>bridge.setHostContext({theme:e.target.checked?'dark':'light',displayMode:'inline'});
document.getElementById('narrow').onchange=e=>frame.style.width=e.target.checked?'375px':'720px';
await bridge.connect(new PostMessageTransport(frame.contentWindow,frame.contentWindow));frame.src='/widget';`,resolveDir:new URL('../',import.meta.url).pathname.replaceAll('%20',' ')},bundle:true,write:false,format:'esm',minify:true});
const html='<!doctype html><html lang="en"><title>Sport Compass local UI test</title><body style="font:16px system-ui;background:#e9eef3"><h1>Local UI fixture, not a live Salesforce test</h1><label><input id="dark" type="checkbox">Dark theme</label> <label><input id="narrow" type="checkbox">375px phone width</label><p id="event" role="status"></p><iframe title="Sport Compass first-visit planner" style="width:720px;max-width:100%;height:700px;border:0;border-radius:18px" allow="clipboard-write" sandbox="allow-scripts allow-same-origin"></iframe><script type="module" src="/host.js"></script></body></html>';
const widget=await readFile(new URL('../dist/first-visit.html',import.meta.url));
const server=createServer((req,res)=>{const routes={'/':[html,'text/html'],'/host.js':[js.outputFiles[0].text,'text/javascript'],'/widget':[widget,'text/html']};const item=routes[req.url];if(!item){res.writeHead(404).end();return;}res.setHeader('Content-Type',item[1]);res.setHeader('Cache-Control','no-store');res.end(item[0]);});
server.listen(4177,'127.0.0.1',()=>console.log('Local UI fixture: http://127.0.0.1:4177'));
