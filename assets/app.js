(function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
// nav
const menu=$('#menu'),links=$('#links');menu&&(menu.onclick=()=>menu.setAttribute('aria-expanded',links.classList.toggle('open')));
// Tamil / English (key UI text; have a Tamil speaker proofread before launch)
const TA={nav_home:'முகப்பு',nav_about:'எங்களைப் பற்றி',nav_events:'எங்கள் நிகழ்வுகள்',nav_cat:'அலங்கார வடிவமைப்புகள்',nav_rent:'வாடகை',nav_pack:'தொகுப்புகள்',nav_gal:'படத்தொகுப்பு',nav_corp:'நிறுவன நிகழ்வுகள்',get_quote:'விலைப்புள்ளி பெறுக',
tagline:'தருணங்களைத் தாண்டி. எல்லைகளைத் தாண்டி.',hero_h:'தருணங்களைத் தாண்டி. எல்லைகளைத் தாண்டி.',hero_p:'சென்னை மற்றும் தமிழ்நாடு முழுவதும் திருமணம், கொண்டாட்டம் மற்றும் நிறுவன நிகழ்வுகளை அக்கறையுடன் வடிவமைக்கிறோம்.',
explore:'வடிவமைப்புகளைப் பாருங்கள்',req_quote:'விலைப்புள்ளி கேளுங்கள்',s_events:'நாங்கள் வடிவமைக்கும் நிகழ்வுகள்',s_trend:'பிரபலமான அலங்காரத் தொகுப்புகள்'};
const EN={};$$('[data-i18n]').forEach(e=>EN[e.dataset.i18n]=e.textContent);
function setLang(l){document.documentElement.lang=l==='ta'?'ta':'en';$$('[data-i18n]').forEach(e=>e.textContent=(l==='ta'&&TA[e.dataset.i18n])||EN[e.dataset.i18n]);const b=$('#lang');if(b)b.textContent=l==='ta'?'English':'தமிழ்';try{localStorage.setItem('lang',l)}catch(e){}}
const lb=$('#lang');if(lb){lb.onclick=()=>setLang(document.documentElement.lang==='ta'?'en':'ta');try{localStorage.getItem('lang')==='ta'&&setLang('ta')}catch(e){}}
// catalogue filters
const grid=$('#grid');if(grid){const cards=$$('.card',grid),sel=$$('select[data-f]'),q=$('#q'),map={occasion:'occ',style:'style',color:'color',tier:'tier',venue:'venue',size:'size',flowers:'flowers'};
function run(){const t=q.value.trim().toLowerCase();let n=0;cards.forEach(c=>{let ok=!t||c.dataset.q.includes(t);sel.forEach(s=>{const v=s.value;if(v){const d=c.dataset[map[s.dataset.f]];ok=ok&&(s.dataset.f==='venue'?d.split('|').includes(v):d===v)}});c.hidden=!ok;n+=ok});$('#count').textContent=n;$('#none').hidden=n>0}
q.oninput=run;sel.forEach(s=>s.onchange=run);$('#reset').onclick=()=>{q.value='';sel.forEach(s=>s.value='');run()};
const o=new URLSearchParams(location.search).get('occasion');if(o){const s=$('select[data-f=occasion]');[...s.options].some(x=>x.value===o)&&(s.value=o)}run()}
// design page
$$('.thumbs button').forEach(b=>b.onclick=()=>{$('#big').src=b.dataset.src});
const sh=$('#share');sh&&(sh.onclick=async()=>{const u=location.href;try{navigator.share?await navigator.share({title:document.title,url:u}):(await navigator.clipboard.writeText(u),sh.textContent='Link copied')}catch(e){}});
// quote form (Netlify Forms)
const f=$('#qf');if(f){const err=$('#err'),btn=$('#send'),P=new URLSearchParams(location.search);
const set=(n,v)=>{const el=f.elements[n];if(el&&v)el.value=v};
set('design_code',(P.get('design')||'').toUpperCase());set('theme',P.get('package'));
if(P.get('type')==='corporate'){set('event_type','Corporate event');f.recurring.checked=true}
if(P.get('scope')==='rental'){set('scope','Equipment rental');set('message','Rental enquiry: '+(P.get('item')||''))}
f.addEventListener('submit',async e=>{e.preventDefault();err.textContent='';const d=Object.fromEntries(new FormData(f));
if(!d.name.trim())return err.textContent='Enter your name.';if(!/^\+?\d{8,15}$/.test(d.phone.replace(/[^\d+]/g,'')))return err.textContent='Enter a valid mobile number.';
if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email))return err.textContent='Enter a valid email address.';if(!d.event_type)return err.textContent='Choose an event type.';if(!f.consent.checked)return err.textContent='Please tick the contact consent box.';
btn.disabled=true;btn.textContent='Sending...';let id=null,stored=false;
try{const r=await fetch('/api/enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...d,consent:true,recurring:!!d.recurring})});const j=await r.json();if(j.ok){id=j.enquiry_id;stored=true}}catch(_){}
id=id||('SE-Q-'+new Date().getFullYear()+'-'+Math.random().toString(36).slice(2,7).toUpperCase());$('#enquiry_id').value=id;
try{let mailed=false;try{const r=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(f)).toString()});mailed=r.ok}catch(_){}
if(!stored&&!mailed)throw new Error('Could not send. Please try again or use WhatsApp.');
f.hidden=true;const ok=$('#ok');ok.hidden=false;$('#eid').textContent=id;$('#wa2').href=$('#wa').href.split('?')[0]+'?text='+encodeURIComponent('Hello Sierra Events, my enquiry ID is '+id);ok.focus()}
catch(x){err.textContent=x.message}finally{btn.disabled=false;btn.textContent='Send enquiry'}})}
})();
