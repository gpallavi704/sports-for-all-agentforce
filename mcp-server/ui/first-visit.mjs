import { App } from '@modelcontextprotocol/ext-apps';

const app = new App({ name: 'Sport Compass first visit', version: '1.0.0' }, {});
const $ = id => document.getElementById(id);
const needs = [
  { id:'fencing', label:'Wheelchair fencing', hint:'Sessions and coaching for a first visit', question:'Do you currently offer introductory wheelchair fencing and coaching for someone new to the sport?' },
  { id:'access', label:'Getting into the venue', hint:'Step-free entry and accessible facilities', question:'Is there step-free entry and an accessible restroom, and are there access arrangements I should discuss before visiting?' },
  { id:'equipment', label:'Equipment and what to bring', hint:'Loaner gear, fencing frame and chair setup', question:'Do you have loaner fencing gear and a suitable fencing frame and chair setup, and what should I bring?' },
  { id:'cost', label:'Costs and first-session details', hint:'Introductory fees, times and what to expect', question:'What does an introductory session cost, when is it available, and can I observe before deciding to take part?' }
];
let snapshot; let club; let oneStep = false; let questionIndex = 0; let connected = false;
const selected = new Set(['fencing','access','equipment']);
const say = text => { $('feedback').textContent = text; };
const el = (tag, text, cls) => { const node = document.createElement(tag); if(text) node.textContent=text; if(cls)node.className=cls; return node; };
function go(panel) {
  $('copy-fallback').hidden=true; $('copy-text').value='';
  for (const name of ['club','prepare','plan']) {
    $('panel-'+name).hidden = name !== panel;
    if(name===panel)$('nav-'+name).setAttribute('aria-current','step'); else $('nav-'+name).removeAttribute('aria-current');
  }
  $(panel==='club'?'club-heading':panel==='prepare'?'prepare-heading':'plan-heading').focus();
  say('');
}
function link(text, url) {
  const a=el('a',text); a.href=url; a.target='_blank'; a.rel='noopener noreferrer';
  a.addEventListener('click',async event=>{
    if(!connected)return;
    event.preventDefault();
    try { const result=await app.openLink({url}); if(result?.isError)throw Error(); }
    catch { say('The host could not open the link. Copy the link address or use the source link in the chat.'); }
  }); return a;
}
function questions(){ return needs.filter(item=>selected.has(item.id)); }
function planText(){return ['My first fencing visit',club ? club.name+' | '+club.city+', '+club.state : 'Contact a club from the official directory.', 'Wheelchair fencing, step-free access and equipment need confirmation.', '', ...questions().map((item,i)=>(i+1)+'. '+item.question), '', 'Club contact: '+(club?.website||snapshot.directoryUrl), 'Suggested questions only. No booking or message has been sent.'].join('\n');}
function draftText(){return 'Hello'+(club?' '+club.name+' team':'')+',\n\nI am interested in an introductory fencing visit.\n\n'+questions().map(item=>item.question).join('\n\n')+'\n\nThank you!';}
function updatePlan(){
  $('copy-fallback').hidden=true; $('copy-text').value='';
  const list=questions(); questionIndex=Math.min(questionIndex,Math.max(0,list.length-1));
  $('questions').replaceChildren(...(oneStep?list.slice(questionIndex,questionIndex+1):list).map(item=>el('li',item.question)));
  $('questions').start=oneStep?questionIndex+1:1;
  $('question-nav').hidden=!oneStep||list.length<2;
  $('question-position').textContent='Question '+(questionIndex+1)+' of '+list.length;
  $('prev-question').disabled=questionIndex===0; $('next-question').disabled=questionIndex===list.length-1;
  $('step-mode').setAttribute('aria-pressed',String(oneStep)); $('step-mode').textContent=oneStep?'Show all questions':'One step at a time';
  $('draft').value=draftText(); $('build-plan').disabled=list.length===0;
  $('copy-plan').disabled=list.length===0; $('copy-draft').disabled=list.length===0;
  $('plan-for').textContent=club?'For your conversation with '+club.name+'.':'Choose a real club using the official directory, then use these questions.';
}
async function copy(text){
  try { if(!navigator.clipboard?.writeText)throw Error(); await navigator.clipboard.writeText(text); $('copy-fallback').hidden=true; say('Copied. Nothing has been sent.'); }
  catch { $('copy-fallback').hidden=false; $('copy-text').value=text; $('copy-text').focus(); $('copy-text').select(); say('Clipboard access is unavailable here. Your text is selected below for manual copying.'); }
}
function chooseClub(next){ club=next; updatePlan(); for(const input of document.querySelectorAll('.progress input'))input.checked=false; $('progress-count').textContent='0 of 3 preparation steps marked'; go('prepare'); }
function render(data){
  if(!data||data.kind!=='sport-compass-first-visit'||data.version!==1||!Array.isArray(data.clubs)||!Array.isArray(data.guidance))return;
  snapshot=data; club=data.clubs[0];
  $('loading').hidden=true; $('content').hidden=false; $('clubs').replaceChildren();
  for(const item of data.clubs){
    const card=el('article',null,'club'); card.append(el('span','PUBLIC CLUB LISTING','listing'),el('h3',item.name),el('p',item.city+', '+item.state,'location'));
    const facts=el('div',null,'facts');
    for(const label of ['Wheelchair fencing','Step-free access','Loaner equipment']){const row=el('div',null,'fact');row.append(el('span',label),el('span','Needs confirmation','status'));facts.append(row);}
    card.append(facts); const links=el('div',null,'links');links.append(link('Club website',item.website),link('Directory source',item.sourceUrl));card.append(links,el('p','Source checked '+item.checkedOn+'. Not an accessibility audit.','small'));
    if(data.clubs.length>1){const select=el('button','Plan for '+item.name);select.addEventListener('click',()=>chooseClub(item));card.append(select);}
    $('clubs').append(card);
  }
  if(!data.clubs.length){const empty=el('div',null,'club');empty.append(el('h3','Start with the official club finder'),el('p','No supported club card was identified in the latest guidance. This does not mean no suitable clubs exist.','sub'),link('Open USA Fencing club finder',data.directoryUrl));$('clubs').append(empty);}
  $('source-links').replaceChildren(...data.sources.map(url=>link(new URL(url).hostname+new URL(url).pathname.replace(/\/$/,''),url)));
  $('guidance').replaceChildren(...data.guidance.map(text=>el('p',text,'guidance-text')));
  updatePlan();
}
for(const item of needs){
  const label=el('label');const input=document.createElement('input');input.type='checkbox';input.id='need-'+item.id;input.checked=selected.has(item.id);input.addEventListener('change',()=>{input.checked?selected.add(item.id):selected.delete(item.id);questionIndex=0;updatePlan();if(!selected.size)say('Choose at least one topic to build your checklist.');else say('');});
  const words=el('span');words.append(el('strong',item.label),el('span',item.hint,'hint'));label.append(input,words);$('preferences').append(label);
}
for(const name of ['club','prepare','plan'])$('nav-'+name).addEventListener('click',()=>go(name));
$('plan-visit').addEventListener('click',()=>go('prepare'));
$('build-plan').addEventListener('click',()=>{updatePlan();go('plan');});
$('edit-needs').addEventListener('click',()=>go('prepare'));
$('step-mode').addEventListener('click',()=>{oneStep=!oneStep;questionIndex=0;updatePlan();});
$('prev-question').addEventListener('click',()=>{questionIndex--;updatePlan();});
$('next-question').addEventListener('click',()=>{questionIndex++;updatePlan();});
$('copy-plan').addEventListener('click',()=>copy(planText()));
$('copy-draft').addEventListener('click',()=>copy(draftText()));
for(const input of document.querySelectorAll('.progress input'))input.addEventListener('change',()=>{$('progress-count').textContent=document.querySelectorAll('.progress input:checked').length+' of 3 preparation steps marked';});
function theme(context){document.documentElement.dataset.theme=context?.theme==='dark'?'dark':'light';}
app.ontoolresult=result=>render(result.structuredContent);
app.onhostcontextchanged=theme;
app.onerror=()=>{if(!snapshot)say('The card could not connect. You can still use the guidance in the chat.');};
app.connect().then(()=>{connected=true;theme(app.getHostContext());}).catch(()=>say('The interactive host is unavailable. Use the text guidance in the chat.'));
setTimeout(()=>{if(!snapshot){$('loading').textContent='Waiting for the latest guidance. If this card stays empty, ask Sport Compass to show your first-visit plan again.';}},12000);
