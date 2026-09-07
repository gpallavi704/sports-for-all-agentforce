// Local, bounded export. No conversation text, personal details or network calls.
const clubSites=new Set(['https://www.wasatchfencing.com/','https://www.saltcityswords.com/']);
const directory='https://member.usafencing.org/clubs';
const source='https://www.usafencingutah.com/utah-idaho-clubs';
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function buildVisitExport(club,questions){
  if(!Array.isArray(questions)||questions.length<1||questions.length>4||questions.some(q=>typeof q!=='string'||q.length>400))throw Error('INVALID_PLAN');
  if(club&&(!clubSites.has(club.website)||club.sourceUrl!==source||!/^\d{4}-\d{2}-\d{2}$/.test(club.checkedOn)))throw Error('INVALID_CLUB');
  const label=club?String(club.name).slice(0,120):'Choose a club from the official directory';
  const location=club?String(club.city).slice(0,80)+', '+String(club.state).slice(0,2):'A conversation starter for your first visit';
  const website=club?.website||directory;
  const text=['SPORT COMPASS','MY FIRST FENCING VISIT','',label,location,'',
    'Needs confirmation: wheelchair fencing, step-free access and loaner equipment.','',
    'QUESTIONS TO ASK',...questions.map((q,i)=>(i+1)+'. '+q),'','Club website: '+website,
    ...(club?['Listing source: '+source,'Source checked: '+club.checkedOn+' (not an accessibility audit).']:[]),'',
    'Suggested preparation only. Not a booking, eligibility decision or accessibility guarantee. Nothing has been sent to the club.','',
    'This plan contains your selected questions. Share it only if you are comfortable sharing those choices.'].join('\n');
  const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; base-uri \'none\'; form-action \'none\'"><title>My First Fencing Visit | Sport Compass</title><style>'+
    '*{box-sizing:border-box}body{margin:0;padding:24px;background:#f3f6f8;color:#112d46;font:17px/1.65 system-ui,sans-serif}main{max-width:760px;margin:auto;padding:32px;background:white;border-top:6px solid #b8283b;border-radius:12px}header{border-bottom:1px solid #c5cfd7;padding-bottom:20px}h1{font-size:32px;line-height:1.2;margin:12px 0}h2{font-size:22px;line-height:1.3}p{margin:12px 0}a{color:#143955;overflow-wrap:anywhere}li{padding:8px 0}.note{padding:16px;background:#f3f6f8;border-radius:8px}.muted{color:#4c6070;font-size:14px}footer{border-top:1px solid #c5cfd7;margin-top:24px;padding-top:12px}@media(max-width:480px){body{padding:12px}main{padding:20px}h1{font-size:28px}}@media print{body{padding:0;background:white}main{max-width:none;border-radius:0}li{break-inside:avoid}a{color:inherit}}'+
    '</style></head><body><main><header><strong>SPORT COMPASS</strong><h1>My first fencing visit</h1><p>A few questions. A more prepared first visit.</p></header><section aria-labelledby="club"><h2 id="club">'+escape(label)+'</h2><p>'+escape(location)+'</p><p class="note"><strong>Needs confirmation:</strong> wheelchair fencing, step-free access and loaner equipment.</p></section><section aria-labelledby="questions"><h2 id="questions">Ask before you go</h2><ol>'+questions.map(q=>'<li>'+escape(q)+'</li>').join('')+'</ol></section><section aria-labelledby="links"><h2 id="links">Keep these links handy</h2><p><a href="'+escape(website)+'">'+escape(website)+'</a></p>'+(club?'<p><a href="'+source+'">Public listing source</a></p><p class="muted">Source checked '+escape(club.checkedOn)+'. Not an accessibility audit.</p>':'')+'</section><footer><p class="muted">Suggested preparation only. Not a booking, eligibility decision or accessibility guarantee. Nothing has been sent to the club.</p><p class="muted">This file contains your selected questions. Share it only if you are comfortable sharing those choices.</p></footer></main></body></html>';
  return {fileName:'sport-compass-first-visit.html',mimeType:'text/html',text:html,plainText:text};
}
