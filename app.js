const LS='mony.v1',DG='၀၁၂၃၄၅၆၇၈၉',U={k:1e3,K:1e3,'ထောင်':1e3,'သောင်း':1e4,'သိန်း':1e5,'သန်း':1e6};
const toA=s=>s.replace(/[၀-၉]/g,c=>DG.indexOf(c));
const AMT=/(\d[\d,]*(?:\.\d+)?)\s*(ထောင်|သောင်း|သိန်း|သန်း|[kK](?![A-Za-z]))?/g;
function parseEntry(t){t=toA(t);let m,l=null;AMT.lastIndex=0;while((m=AMT.exec(t)))l=m;if(!l)return null;
 const a=Math.round(parseFloat(l[1].replace(/,/g,''))*(U[l[2]]||1));if(!(a>0))return null;
 const n=(t.slice(0,l.index)+' '+t.slice(l.index+l[0].length)).replace(/^[\s+\-−]+|[\s+\-−]+$/g,'').replace(/\s+/g,' ')||'မှတ်ချက်မရှိ';return{a,n}}
function splitDate(s){s=toA(s.trim());let m=s.match(/^(?:မနေ့က|မနေ့)\s*/);if(m)return[1,s.slice(m[0].length)];
 m=s.match(/^(\d+)\s*ရက်က\s*/);if(m)return[+m[1],s.slice(m[0].length)];return[0,s]}
function parseAll(text,def){const o=[];for(const g of text.split(/[\n;၊။]+|,\s+(?=\D)/)){const s=g.trim();if(!s)continue;
 const [dd,r]=splitDate(s.replace(/^[+\s]+/,'')),p=parseEntry(r);if(p)o.push({k:s[0]==='+'?'in':def,a:p.a,n:p.n,dd})}return o}
const day=(dd=0)=>new Date(Date.now()-dd*864e5).toLocaleDateString('sv-SE',{timeZone:'Asia/Yangon'});
const M=n=>n.toLocaleString('en-US')+' MMK';
if(typeof module!=='undefined')module.exports={parseEntry,splitDate,parseAll};
if(typeof document!=='undefined'){
let db;try{db=JSON.parse(localStorage[LS])}catch(e){}db=db&&db.tx?db:{tx:[],n:1};
const $=s=>document.querySelector(s),save=()=>{localStorage[LS]=JSON.stringify(db)},
E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),
sum=f=>db.tx.filter(f).reduce((s,x)=>s+x.a,0);let tab='t',undo=null,tm;
const row=x=>`<div class=r><span>${x.k=='in'?'➕':'➖'} ${E(x.n)}<small>${x.d}</small></span><b>${M(x.a)}</b><button data-e="${x.id}">✏️</button><button data-x="${x.id}">🗑</button></div>`;
function toast(m,u){const t=$('#t');t.innerHTML=`<span>${m}</span>${u?'<button data-u=1>↩️ ပြန်ထည့်</button>':''}`;t.style.display='flex';clearTimeout(tm);tm=setTimeout(()=>t.style.display='none',6000)}
const mo=()=>sum(x=>x.k=='out'&&x.d.startsWith(day().slice(0,7)));
function warn(){if(!db.b)return'';const p=Math.floor(mo()*100/db.b);return p>=100?' · 🚨 ဘတ်ဂျက်ကျော်ပါပြီ':p>=80?` · ⚠️ ဘတ်ဂျက် ${p}%`:''}
function bud(o){if(!db.b)return'<button class=btn data-a=bud>🎯 လစဉ်ဘတ်ဂျက် သတ်မှတ်မယ်</button>';const p=Math.floor(o*100/db.b);
 return `<h3>🎯 ဘတ်ဂျက် ${M(db.b)}</h3><div style="height:10px;border-radius:6px;background:var(--l);overflow:hidden"><i style="display:block;height:100%;width:${Math.min(p,100)}%;background:${p>=100?'#e5484d':'var(--g)'}"></i></div><small>${p}% သုံးပြီး · ကျန် ${M(Math.max(db.b-o,0))}</small><button class=btn data-a=bud>✏️ ဘတ်ဂျက် ပြောင်းမယ်</button>`}
function render(){const t=day(),ym=t.slice(0,7),out=sum(x=>x.k=='out'&&x.d==t),bal=sum(x=>x.k=='in')-sum(x=>x.k=='out');
 $('#sum').innerHTML=`<div><small>ယနေ့ သုံးငွေ</small><b>${M(out)}</b></div><div><small>လက်ကျန်</small><b>${M(bal)}</b></div>`;
 document.querySelectorAll('nav button').forEach(b=>b.className=b.dataset.tab==tab?'on':'');let h='';
 if(tab=='t')h=db.tx.filter(x=>x.d==t).reverse().map(row).join('')||'<p class=e>ယနေ့ မှတ်တမ်း မရှိသေးပါ</p>';
 else if(tab=='m'){const i=sum(x=>x.k=='in'&&x.d.startsWith(ym)),o=sum(x=>x.k=='out'&&x.d.startsWith(ym)),g={};
  db.tx.filter(x=>x.k=='out'&&x.d.startsWith(ym)).forEach(x=>g[x.n]=(g[x.n]||0)+x.a);
  h=bud(o)+`<h3>${ym}</h3><div class=r><span>➕ ဝင်ငွေ</span><b>${M(i)}</b></div><div class=r><span>➖ သုံးငွေ</span><b>${M(o)}</b></div><div class=r><span>📈 ကျန်ငွေ</span><b>${M(i-o)}</b></div><h3>🔥 အများဆုံး</h3>`+
  Object.entries(g).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([n,a])=>`<div class=r><span>${E(n)}</span><b>${M(a)}</b></div>`).join('')}
 else if(tab=='h'){let last='';h=db.tx.slice(-150).reverse().map(x=>{const s=x.d!=last?`<h3>${x.d}</h3>`:'';last=x.d;return s+row(x)}).join('')||'<p class=e>မှတ်တမ်း မရှိသေးပါ</p>'}
 else{const w=!db.lb||Date.now()-db.lb>12096e5;h=(w&&db.tx.length>20?'<p class=e>⚠️ Backup မလုပ်တာ ကြာပါပြီ</p>':'')+
  '<button class=btn data-a=csv>📤 Excel (CSV) ထုတ်မယ်</button><button class=btn data-a=bak>💾 Backup သိမ်းမယ်</button><button class=btn data-a=res>♻️ Backup ပြန်ထည့်မယ်</button><p class=e>စာရင်းတွေက ဒီဖုန်းထဲမှာပဲ သိမ်းပါတယ်</p>'}
 $('#v').innerHTML=h;const seen=[];for(const x of [...db.tx].reverse()){if(x.k=='out'&&!seen.includes(x.n)&&seen.length<8)seen.push(x.n)}
 $('#ch').innerHTML=seen.map(n=>`<button class=chip data-c="${E(n)}">${E(n)}</button>`).join('')}
async function out(name,type,txt){const f=new File([txt],name,{type});try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f]});return true}}catch(e){if(e.name=='AbortError')return false}
 const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=name;a.click();return true}
$('#f').onsubmit=e=>{e.preventDefault();const r=parseAll($('#i').value,'out');if(!r.length){toast('ပမာဏ မတွေ့ပါ 🤔 ဥပမာ: ထမင်း 3000');return}
 r.forEach(x=>db.tx.push({id:db.n++,k:x.k,a:x.a,n:x.n,d:day(x.dd)}));save();$('#i').value='';tab='t';render();toast(`✅ ${r.length} ခု မှတ်ပြီးပါပြီ`+warn())};
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.tab){tab=d.tab;render()}else if(d.x){const i=db.tx.findIndex(x=>x.id==d.x);if(i>=0){undo=db.tx.splice(i,1)[0];save();render();toast('🗑 ဖျက်ပြီး',1)}}
 else if(d.u&&undo){db.tx.push(undo);db.tx.sort((a,b)=>a.id-b.id);undo=null;save();render();$('#t').style.display='none'}
 else if(d.e){const x=db.tx.find(y=>y.id==d.e);if(!x)return;const q=prompt('ပြင်ပါ (ဥပမာ: ထမင်း 3500)',x.n+' '+x.a);if(q===null)return;
  const [dd,r]=splitDate(q.replace(/^[+\s]+/,'')),p=parseEntry(r);if(!p){toast('ပမာဏ မတွေ့ပါ');return}x.n=p.n;x.a=p.a;if(q.trim()[0]=='+')x.k='in';if(dd)x.d=day(dd);save();render();toast('✏️ ပြင်ပြီးပါပြီ')}
 else if(d.a=='bud'){const q=prompt('လစဉ် ဘတ်ဂျက် (ဥပမာ: 300000 သို့မဟုတ် ၃ သိန်း)',db.b||'');if(q===null)return;const p=parseEntry(q);if(!p){toast('ပမာဏ မတွေ့ပါ');return}db.b=p.a;save();render();toast('🎯 ဘတ်ဂျက် '+M(p.a))}
 else if(d.c){$('#i').value=d.c+' ';$('#i').focus()}
 else if(d.a=='csv'){const q=s=>'"'+String(s).replace(/"/g,'""')+'"';await out('mony.csv','text/csv','\ufeffdate,type,note,amount\n'+db.tx.map(x=>[x.d,x.k,q(x.n),x.a].join(',')).join('\n'))}
 else if(d.a=='bak'){if(await out('mony-backup-'+day()+'.json','application/json',JSON.stringify(db))){db.lb=Date.now();save();render()}}
 else if(d.a=='res')$('#file').click()});
$('#file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const j=JSON.parse(await f.text());if(!Array.isArray(j.tx))throw 0;
 if(confirm('ဒီဖုန်းထဲက စာရင်းအားလုံးကို Backup နဲ့ အစားထိုးမလား?')){db=j;save();render();toast('♻️ ပြန်ထည့်ပြီး')}}catch(x){toast('Backup ဖိုင် မမှန်ပါ')}e.target.value=''};
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');
render()}
