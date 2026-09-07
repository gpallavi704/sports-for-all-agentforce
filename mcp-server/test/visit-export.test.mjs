import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildVisitExport } from '../ui/visit-export.mjs';
import { clubIdentities } from '../src/visit-model.mjs';
const club=clubIdentities[0];
test('visit export is portable, source-linked, bounded and not an attendance claim',()=>{
  const file=buildVisitExport(club,['Do you have loaner equipment?']);
  assert.equal(file.fileName,'sport-compass-first-visit.html');assert.equal(file.mimeType,'text/html');
  for(const text of [club.name,club.website,club.sourceUrl,club.checkedOn,'loaner equipment','Not an accessibility audit','Not a booking'])assert.ok(file.text.includes(text));
  assert.match(file.text,/lang="en"/);assert.match(file.text,/Content-Security-Policy/);assert.match(file.text,/<h1>/);assert.match(file.text,/<ol>/);
  assert.doesNotMatch(file.text,/<script|<iframe|<form|<img|transcript|conversationHandle|@import|url\(/i);
  assert.ok(file.text.length<15000);
});
test('export escapes markup, rejects unsafe URLs and does not export extra fields',()=>{
  const file=buildVisitExport({...club,name:'<script>alert("x")</script>',email:'private@example.invalid',transcript:'PRIVATE'},['<img src=x onerror=alert(1)>']);
  assert.doesNotMatch(file.text,/<script|<img|PRIVATE|private@example/);assert.match(file.text,/&lt;script&gt;/);
  assert.throws(()=>buildVisitExport({...club,website:'javascript:alert(1)'},['Question']));
  assert.throws(()=>buildVisitExport({...club,sourceUrl:'https://evil.example/'},['Question']));
  assert.throws(()=>buildVisitExport(club,[]));assert.throws(()=>buildVisitExport(club,Array(5).fill('Question')));
  assert.throws(()=>buildVisitExport(club,['x'.repeat(401)]));
});
test('empty club export uses only official finder and selected questions',()=>{
  const file=buildVisitExport(null,['What should I ask?']);
  assert.match(file.text,/https:\/\/member.usafencing.org\/clubs/);
  assert.doesNotMatch(file.text,/Wasatch|Salt City Swords/);
  assert.match(file.plainText,/What should I ask/);
});
test('download is user-initiated, uses host capability, and gives recoverable feedback',()=>{
  const js=readFileSync(new URL('../ui/first-visit.mjs',import.meta.url),'utf8');
  assert.match(js,/'download-plan'\).addEventListener\('click',downloadPlan\)/);
  assert.match(js,/getHostCapabilities\(\)\?\.downloadFile/);assert.match(js,/app.downloadFile/);
  assert.match(js,/if\(downloading\|\|!snapshot/);assert.match(js,/aria-busy/);
  assert.match(js,/Copy the selected text below/);assert.doesNotMatch(js,/uploadFile|fetch\(|localStorage|sessionStorage/);
});
test('copy stays primary and download is hidden without host support or after failure',()=>{
  const html=readFileSync(new URL('../ui/first-visit.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('../ui/first-visit.mjs',import.meta.url),'utf8');
  assert.match(html,/id="copy-plan" class="primary"/);
  assert.match(html,/id="download-plan"[^>]*hidden/);
  assert.match(js,/connected&&!downloadUnavailable&&Boolean\(app.getHostCapabilities\(\)\?\.downloadFile\)/);
  assert.match(js,/'download-plan'\).hidden=!available/);
  assert.match(js,/downloadUnavailable=true/);
  assert.match(js,/File download is not available in this view/);
  assert.match(js,/function planText\(\)\{return buildVisitExport/);
});
