/* QR Empreinte Entreprise — prototype front-only. Données en localStorage. */
const DB_KEY='qre_db_v1';
const CATS=['Accueil','Temps d\'attente','Propreté','Qualité du service','Autre'];
let db=load();
function load(){try{return JSON.parse(localStorage.getItem(DB_KEY))||seed()}catch{return seed()}}
function save(){localStorage.setItem(DB_KEY,JSON.stringify(db))}
function uid(){return Math.random().toString(36).slice(2,10)}
function seed(){return{secret:uid()+uid(),entreprises:[],sites:[],emplacements:[],qrs:[],scans:[],retours:[]}}

/* ---- Signature HMAC-SHA256 (Web Crypto) ---- */
async function hmac(msg){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(db.secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const s=await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(msg));return [...new Uint8Array(s)].slice(0,8).map(b=>b.toString(16).padStart(2,'0')).join('')}
async function signQR(q){return hmac(`${q.id}|${q.entrepriseId}|${q.siteId}|${q.emplacementId}|${q.createdAt}`)}
async function verifyQR(payload){const q=db.qrs.find(x=>x.id===payload.id);if(!q)return{ok:false,msg:'QR inconnu'};
 if(q.revoked)return{ok:false,msg:'QR révoqué par l\'entreprise'};const sig=await signQR(q);
 if(sig!==payload.sig)return{ok:false,msg:'Signature invalide : QR copié ou altéré'};return{ok:true,qr:q}}

/* ---- Helpers ---- */
const $=s=>document.querySelector(s);const name=(arr,id)=>(db[arr].find(x=>x.id===id)||{}).nom||'—';
function show(v){document.querySelectorAll('.view').forEach(e=>e.classList.toggle('active',e.id==='v-'+v));document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.v===v));render()}

/* ---- Admin ---- */
function addEntreprise(){const n=$('#e-nom').value.trim();if(!n)return;db.entreprises.push({id:uid(),nom:n,secteur:$('#e-sect').value});$('#e-nom').value='';save();render()}
function addSite(){const n=$('#s-nom').value.trim(),e=$('#s-ent').value;if(!n||!e)return;db.sites.push({id:uid(),nom:n,entrepriseId:e,ville:$('#s-ville').value});$('#s-nom').value='';save();render()}
function addEmplacement(){const n=$('#l-nom').value.trim(),s=$('#l-site').value;if(!n||!s)return;const site=db.sites.find(x=>x.id===s);db.emplacements.push({id:uid(),nom:n,siteId:s,entrepriseId:site.entrepriseId});$('#l-nom').value='';save();render()}
async function genQR(empId){const l=db.emplacements.find(x=>x.id===empId);const q={id:uid(),entrepriseId:l.entrepriseId,siteId:l.siteId,emplacementId:l.id,createdAt:Date.now(),revoked:false};q.sig=await signQR(q);db.qrs.push(q);save();render()}
function revoke(id){const q=db.qrs.find(x=>x.id===id);q.revoked=!q.revoked;save();render()}
function qrURL(q){return location.href.split('#')[0]+'#scan='+btoa(JSON.stringify({id:q.id,sig:q.sig}))}

/* ---- Scan / Feedback ---- */
let current=null,note=0;
async function openScan(b64){let p;try{p=JSON.parse(atob(b64))}catch{return feedbackState('bad','QR illisible')}
 const r=await verifyQR(p);show('scan');db.scans.push({qrId:p.id,at:Date.now(),ok:r.ok});save();
 if(!r.ok){current=null;return feedbackState('bad',r.msg)}current=r.qr;note=0;$('#f-ctx').textContent=`${name('entreprises',current.entrepriseId)} · ${name('sites',current.siteId)} · ${name('emplacements',current.emplacementId)}`;feedbackState(null);renderStars()}
function feedbackState(t,m){$('#f-alert').className='alert '+(t||'');$('#f-alert').style.display=t?'block':'none';$('#f-alert').textContent=m||'';$('#f-form').style.display=t==='bad'||t==='ok'?'none':'block'}
function renderStars(){$('#f-stars').innerHTML=[1,2,3,4,5].map(i=>`<button class="${i<=note?'on':''}" onclick="note=${i};renderStars()">★</button>`).join('')}
function sendFeedback(){if(!current||!note)return alert('Choisissez une note');db.retours.push({id:uid(),qrId:current.id,entrepriseId:current.entrepriseId,siteId:current.siteId,emplacementId:current.emplacementId,note,cat:$('#f-cat').value,com:$('#f-com').value,at:Date.now()});$('#f-com').value='';save();feedbackState('ok','Merci ! Votre retour a été enregistré.')}

/* ---- Stats ---- */
function stats(filterEnt){const R=db.retours.filter(r=>!filterEnt||r.entrepriseId===filterEnt),S=db.scans.filter(s=>{const q=db.qrs.find(x=>x.id===s.qrId);return !filterEnt||(q&&q.entrepriseId===filterEnt)});
 const avg=R.length?(R.reduce((a,r)=>a+r.note,0)/R.length).toFixed(2):'—';const neg=R.filter(r=>r.note<=2).length;const invalid=S.filter(s=>!s.ok).length;
 const by=(key,arr)=>{const m={};R.forEach(r=>{const k=r[key];m[k]=m[k]||{n:0,s:0,neg:0};m[k].n++;m[k].s+=r.note;if(r.note<=2)m[k].neg++});return Object.entries(m).map(([k,v])=>({nom:arr?name(arr,k):k,n:v.n,avg:(v.s/v.n).toFixed(2),neg:v.neg})).sort((a,b)=>a.avg-b.avg)};
 const byHour={};R.forEach(r=>{const h=Math.floor(new Date(r.at).getHours()/3)*3;const k=`${h}h–${h+3}h`;byHour[k]=byHour[k]||{n:0,s:0};byHour[k].n++;byHour[k].s+=r.note});
 return{scans:S.length,invalid,retours:R.length,completion:S.length?Math.round(R.length/S.length*100):0,avg,neg,sites:by('siteId','sites'),emps:by('emplacementId','emplacements'),cats:by('cat'),hours:Object.entries(byHour).map(([k,v])=>({nom:k,n:v.n,avg:(v.s/v.n).toFixed(2)})).sort((a,b)=>a.nom.localeCompare(b.nom,undefined,{numeric:true}))}}

/* ---- Démo ---- */
async function demo(){if(!confirm('Charger un jeu de données de démo (Sénégal) ? Les données actuelles seront remplacées.'))return;db=seed();
 const ents=[['CBAO Attijariwafa Bank','Banque',[['Agence Plateau','Dakar'],['Agence Almadies','Dakar'],['Agence Thiès','Thiès']],['Accueil','Guichet 1','Guichet 2','Zone d\'attente']],
  ['Orange Sénégal','Télécoms',[['Boutique Sea Plaza','Dakar'],['Boutique Liberté 6','Dakar']],['Accueil','Comptoir SAV','Caisse']],
  ['Terrou-Bi','Hôtellerie',[['Hôtel Terrou-Bi','Dakar']],['Réception','Restaurant','Chambre 204','Piscine']]];
 for(const[en,sect,sites,emps]of ents){const e={id:uid(),nom:en,secteur:sect};db.entreprises.push(e);for(const[sn,v]of sites){const s={id:uid(),nom:sn,entrepriseId:e.id,ville:v};db.sites.push(s);
  for(const ln of emps){const l={id:uid(),nom:ln,siteId:s.id,entrepriseId:e.id};db.emplacements.push(l);const q={id:uid(),entrepriseId:e.id,siteId:s.id,emplacementId:l.id,createdAt:Date.now()-86400000*20,revoked:false};q.sig=await signQR(q);db.qrs.push(q);
   const bias=ln.includes('attente')||ln.includes('Guichet 2')?-1.2:ln.includes('Réception')?0.6:0;const n=8+Math.floor(Math.random()*12);
   for(let i=0;i<n;i++){const at=Date.now()-Math.random()*86400000*20;db.scans.push({qrId:q.id,at,ok:true});if(Math.random()<0.7){let note=Math.round(Math.min(5,Math.max(1,3.6+bias+(Math.random()*2-1)*1.5)));db.retours.push({id:uid(),qrId:q.id,entrepriseId:e.id,siteId:s.id,emplacementId:l.id,note,cat:note<=2?CATS[Math.floor(Math.random()*4)]:CATS[Math.floor(Math.random()*5)],com:note<=2?'Trop d\'attente, personnel peu disponible.':'',at})}}
   if(Math.random()<0.3)db.scans.push({qrId:q.id,at:Date.now()-3600000,ok:false})}}}
 save();render()}
function reset(){if(confirm('Effacer toutes les données ?')){db=seed();save();render()}}
function exportCSV(){const rows=[['date','entreprise','site','emplacement','note','categorie','commentaire'],...db.retours.map(r=>[new Date(r.at).toISOString(),name('entreprises',r.entrepriseId),name('sites',r.siteId),name('emplacements',r.emplacementId),r.note,r.cat,(r.com||'').replace(/"/g,'""')])];
 const csv=rows.map(r=>r.map(v=>`"${v}"`).join(';')).join('\n');const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,\ufeff'+encodeURIComponent(csv);a.download='retours_qr_empreinte.csv';a.click()}

/* ---- Render ---- */
function opt(arr,label=x=>x.nom){return arr.map(x=>`<option value="${x.id}">${label(x)}</option>`).join('')}
function table(rows,cols){if(!rows.length)return '<small>Aucune donnée</small>';return `<table><tr>${cols.map(c=>`<th>${c[0]}</th>`).join('')}</tr>${rows.map(r=>`<tr>${cols.map(c=>`<td>${c[1](r)}</td>`).join('')}</tr>`).join('')}</table>`}
const bar=v=>`<div class="bar"><i style="width:${v/5*100}%;background:${v<2.5?'var(--bad)':v<3.5?'var(--warn)':'var(--ok)'}"></i></div>`;
function render(){
 /* dashboard */
 const f=$('#d-ent');const prev=f.value;f.innerHTML='<option value="">Toutes les entreprises</option>'+opt(db.entreprises);f.value=prev;const s=stats(f.value);
 $('#d-kpi').innerHTML=[['Scans',s.scans],['Scans invalides / copiés',s.invalid],['Retours',s.retours],['Taux de complétion',s.completion+'%'],['Note moyenne',s.avg],['Signalements négatifs (≤2)',s.neg]].map(k=>`<div class="card kpi"><div class="v">${k[1]}</div><div class="l">${k[0]}</div></div>`).join('');
 $('#d-sites').innerHTML=table(s.sites,[['Site',r=>r.nom],['Retours',r=>r.n],['Note',r=>r.avg+bar(r.avg)],['Négatifs',r=>r.neg]]);
 $('#d-emps').innerHTML=table(s.emps,[['Emplacement',r=>r.nom],['Retours',r=>r.n],['Note',r=>r.avg+bar(r.avg)],['Négatifs',r=>r.neg]]);
 $('#d-cats').innerHTML=table(s.cats,[['Type de problème',r=>r.nom],['Retours',r=>r.n],['Note',r=>r.avg+bar(r.avg)],['Négatifs',r=>r.neg]]);
 $('#d-hours').innerHTML=table(s.hours,[['Créneau',r=>r.nom],['Retours',r=>r.n],['Note',r=>r.avg+bar(r.avg)]]);
 $('#d-last').innerHTML=table([...db.retours].sort((a,b)=>b.at-a.at).slice(0,10),[['Date',r=>new Date(r.at).toLocaleString('fr-FR')],['Site',r=>name('sites',r.siteId)],['Emplacement',r=>name('emplacements',r.emplacementId)],['Note',r=>'★'.repeat(r.note)],['Catégorie',r=>r.cat],['Commentaire',r=>r.com||'']]);
 /* admin */
 $('#s-ent').innerHTML=opt(db.entreprises);$('#l-site').innerHTML=opt(db.sites,x=>`${name('entreprises',x.entrepriseId)} · ${x.nom}`);
 $('#a-list').innerHTML=db.entreprises.map(e=>`<div class="card"><b>${e.nom}</b> <span class="tag">${e.secteur}</span>${db.sites.filter(x=>x.entrepriseId===e.id).map(si=>`<div style="margin:8px 0 0 12px"><b>${si.nom}</b> <small>${si.ville||''}</small><ul style="margin:4px 0">${db.emplacements.filter(l=>l.siteId===si.id).map(l=>`<li>${l.nom} <button class="btn sec" style="padding:3px 8px" onclick="genQR('${l.id}')">+ QR</button></li>`).join('')}</ul></div>`).join('')}</div>`).join('')||'<small>Aucune entreprise. Créez-en une ou chargez la démo.</small>';
 /* qrs */
 $('#q-list').innerHTML=db.qrs.map(q=>`<div class="qr"><canvas id="c-${q.id}"></canvas><b>${name('sites',q.siteId)}</b><br>${name('emplacements',q.emplacementId)}<br><small>${name('entreprises',q.entrepriseId)}</small><br>${q.revoked?'<span class="tag rev">révoqué</span>':'<span class="tag">actif</span>'} <small>sig ${q.sig.slice(0,6)}…</small><br><button class="btn sec" style="padding:4px 8px;margin-top:6px" onclick="openScan('${btoa(JSON.stringify({id:q.id,sig:q.sig}))}')">Simuler scan</button> <button class="btn sec" style="padding:4px 8px;margin-top:6px" onclick="openScan('${btoa(JSON.stringify({id:q.id,sig:'0000'}))}')">Scan copié</button> <button class="btn ${q.revoked?'':'danger'}" style="padding:4px 8px;margin-top:6px" onclick="revoke('${q.id}')">${q.revoked?'Réactiver':'Révoquer'}</button></div>`).join('')||'<small>Aucun QR généré.</small>';
 if(window.QRCode)db.qrs.forEach(q=>{const c=document.getElementById('c-'+q.id);if(c)QRCode.toCanvas(c,qrURL(q),{width:120,margin:1})});
 $('#f-cat').innerHTML=CATS.map(c=>`<option>${c}</option>`).join('');
}
window.addEventListener('hashchange',()=>{const m=location.hash.match(/#scan=(.+)/);if(m)openScan(m[1])});
window.addEventListener('load',()=>{render();const m=location.hash.match(/#scan=(.+)/);if(m)openScan(m[1]);else show('dash')});
