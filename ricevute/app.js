"use strict";
/* Ricevute Waiblingen Ink · app (GitHub Pages) · backend: Google Apps Script (config.js) */
const CFG = window.CFG || {};
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];

/* ---------- testi IT / DE ---------- */
const DE = {loginTitle:"Belege und Rechnungen",alSearch:"Suchen",alBack:"Zurück",alAsk:"Frage",alGemini:"Gemini-Schlüssel",alClaude:"Claude-Schlüssel",keyGeminiTxt:"Der Gemini-Schlüssel fehlt: hier einmalig einfügen (kostenlos auf aistudio.google.com/apikey mit dem info-Konto erstellen).",keyClaudeTxt:"Claude-Schlüssel: hier einmalig einfügen. Mit dem Schlüssel liest Claude die Fotos, Gemini bleibt als Reserve.",openFolder:"Ordner öffnen",startImport:"Import starten",q1:"Wie viel haben wir im Oktober eingenommen?",q2:"Wie hoch waren die Ausgaben im September?",q3:"Tattoos von Giova Tattoos diesen Monat",q4:"Abos, die wir jeden Monat zahlen",artD:"D · Denis (Waiblingen Ink)",artG:"G · Giova Tattoos",artW:"W · Waiblingen Ink an Tätowierer",notDup:"Kein Duplikat",sheetLink:"Archiv-Tabelle",folderLink:"Drive-Ordner",hello:"Hallo",admin:"Administrator",viewer:"Nur lesen",searchPh:"Kunde, Nummer, Lieferant, Tattoo suchen…",clear:"Abbrechen",shoot:"Beleg fotografieren",pick:"oder eine Datei wählen",inMonth:"Einnahmen im Monat",outMonth:"Ausgaben im Monat",latest:"Letzte Belege",seeAll:"Alle anzeigen",recognized:"Beleg erkannt",reading:"Die KI liest den Beleg…",what:"Was ist das",tAcq:"Einkauf",tCli:"Quittung an Kunden",tFat:"Rechnung zu zahlen",vendor:"Lieferant",client:"Kunde",number:"Nummer",date:"Datum",total:"Gesamt €",rate:"MwSt",cat:"Kategorie",due:"Fällig am",artist:"Wer",note:"Notizen",save:"Im Archiv speichern",update:"Änderungen speichern",delete:"Stornieren",archive:"Archiv",all:"Alle",month:"Monat",home:"Home",photo:"Foto",ask:"Fragen",export:"Export",
 empty:"Noch keine Belege.",noRes:"Nichts gefunden.",results:n=>n+" Ergebnisse",saved:"Gespeichert ✓",updated:"Aktualisiert ✓",deleted:"Storniert",needTotal:"Bitte den Gesamtbetrag eintragen.",sure:"Wirklich stornieren? Nochmal tippen.",readFail:"Lesen nicht möglich: bitte von Hand eintragen.",lowConf:"Bitte prüfen, unsicher gelesen: ",detail:"Beleg",allCats:"Alle Kategorien",recurring:"Wiederkehrend",toConfirm:"Zu bestätigen",fromMail:"aus E-Mail",openMail:"Original-E-Mail öffnen",confirmQ:"Aus dem Postfach denisrider00: Studio oder privat?",studio:"Studio",private:"Privat",privTag:"privat",history:"Verlauf",login:"Mit Google anmelden",loginTxt:"Nur eingeladene Personen haben Zutritt.",logout:"Abmelden",checkMail:"E-Mails jetzt prüfen",mailDone:n=>n+" neue Belege aus E-Mails",loading:"Lädt…",offline:"Server nicht erreichbar.",askPh:"z. B. Wie viel haben wir im Oktober eingenommen?",askBtn:"Fragen",askHint:"Frag das Archiv: Einnahmen, Ausgaben, Kunden, Lieferanten, Zeiträume.",sumIn:"Einnahmen",sumOut:"Ausgaben",docsN:"Belege",period:"Zeitraum",noRate:"Ohne MwSt-Satz",elsterHead:"Schätzung für ELSTER (Umsatzsteuer-Voranmeldung)",k81:"Kz 81 · Umsätze 19 % (netto)",k86:"Kz 86 · Umsätze 7 % (netto)",k66:"Kz 66 · Vorsteuer",k83:"Kz 83 · Vorauszahlung",elsterNote:"Nur eine Schätzung, die echte Berechnung macht die Steuerberaterin. Private Ausgaben und Einkäufe ohne MwSt-Satz werden nicht gezählt.",xPdf:"PDF mit Fotos",xXls:"Excel",xEl:"ELSTER-Blatt (PDF)",preparing:"Wird vorbereitet…",quarter:"Quartal",readonly:"Nur lesen: du kannst nichts ändern.",created:"erstellt",by:"von"};
const IT = {viewer:"Sola lettura",admin:"admin",recognized:"Documento riconosciuto",sheetLink:"Foglio archivio",folderLink:"Cartella Drive",results:n=>n+(n===1?" risultato":" risultati"),empty:"Ancora nessun documento.",noRes:"Nessun risultato.",saved:"Salvato ✓",updated:"Aggiornato ✓",deleted:"Stornato",needTotal:"Inserisci il totale.",sure:"Sicuro? Tocca di nuovo per stornare.",readFail:"Lettura non riuscita: inserisci i dati a mano.",lowConf:"Controlla, letto con poca sicurezza: ",update:"Salva le modifiche",detail:"Documento",allCats:"Tutte le categorie",recurring:"Ricorrenti",toConfirm:"Da confermare",fromMail:"da email",openMail:"Apri l'email originale",confirmQ:"Arrivata da denisrider00: è dello studio o privata?",studio:"Studio",private:"Privata",privTag:"privata",history:"Cronologia",login:"Accedi con Google",loginTxt:"Entra solo chi è stato invitato.",logout:"Esci",mailDone:n=>n+" nuovi documenti dalle email",loading:"Carico…",offline:"Server non raggiungibile.",askPh:"es. Quanto abbiamo incassato a ottobre?",askHint:"Chiedi all'archivio: incassi, spese, clienti, fornitori, periodi.",sumIn:"Entrate",sumOut:"Uscite",preparing:"Preparo il file…",quarter:"Trimestre",readonly:"Sola lettura: non puoi modificare.",created:"creato",by:"da"};
const CATS={einnahme:["Incasso tatuaggio","Tattoo Einnahme"],anzahlung:["Acconto","Anzahlung"],platzmiete:["Affitto postazione tatuatori","Platzmiete Tätowierer"],material:["Materiale tatuaggio","Tattoo Material"],miete:["Affitto","Miete"],energie:["Corrente, gas, acqua","Strom, Gas, Wasser"],telefon:["Telefono e internet","Telefon und Internet"],software:["Abbonamenti e software","Abos und Software"],versicherung:["Assicurazioni","Versicherungen"],werbung:["Pubblicità","Werbung"],fahrzeug:["Auto e carburante","Fahrzeug und Tanken"],buero:["Ufficio e pulizia","Büro und Reinigung"],gebuehren:["Commissioni di pagamento","Zahlungsgebühren"],steuer:["Tasse e contributi","Steuern und Beiträge"],beratung:["Consulenze","Beratung"],sonstiges:["Altro","Sonstiges"]};
const ITX={};$$("[data-t]").forEach(e=>{ITX[e.dataset.t]=e.textContent});$$("[data-al]").forEach(e=>{ITX[e.dataset.al]=e.getAttribute("aria-label")});$$("[data-ph]").forEach(e=>{ITX[e.dataset.ph]=e.placeholder});
let lang="it";try{lang=localStorage.getItem("wi-lang")||"it"}catch(e){}
const t=k=>{if(lang==="de"&&DE[k]!==undefined)return DE[k];if(IT[k]!==undefined)return IT[k];return ITX[k]!==undefined?ITX[k]:k};
const L=()=>lang==="de"?1:0;
function applyLang(){
  document.documentElement.lang=lang;
  $$("[data-t]").forEach(e=>{const v=t(e.dataset.t);if(typeof v==="string")e.textContent=v});
  $$("[data-ph]").forEach(e=>e.placeholder=t(e.dataset.ph));
  $$("[data-al]").forEach(e=>e.setAttribute("aria-label",t(e.dataset.al)));
  $$(".langs button").forEach(b=>b.classList.toggle("on",b.dataset.l===lang));
  const cur=$("#fCat").value;$("#fCat").innerHTML=Object.entries(CATS).map(([k,v])=>`<option value="${k}">${v[L()]}</option>`).join("");if(cur)$("#fCat").value=cur;
  $("#monthTitle").textContent=new Date().toLocaleDateString(lang==="de"?"de-DE":"it-IT",{month:"long",year:"numeric"}).replace(/^./,c=>c.toUpperCase());
  $("#roleTag").textContent=user&&user.role==="viewer"?t("viewer"):t("admin");
  if(editing)setType(editing.type);renderAll();
}
$$(".langs button").forEach(b=>b.onclick=()=>{lang=b.dataset.l;try{localStorage.setItem("wi-lang",lang)}catch(e){};applyLang()});

/* ---------- utilità ---------- */
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const eur=n=>(Number(n)||0).toLocaleString(lang==="de"?"de-DE":"it-IT",{style:"currency",currency:"EUR"});
function parseNum(v){if(v==null||v==="")return null;if(typeof v==="number")return Math.round(v*100)/100;let s=String(v).trim().replace(/[€\s]/g,"");if(/,\d{1,2}$/.test(s))s=s.replace(/\./g,"").replace(",",".");else s=s.replace(/,/g,"");const n=parseFloat(s);return isNaN(n)?null:Math.round(n*100)/100}
const fmtNum=n=>n==null||n===""?"":Number(n).toFixed(2).replace(".",",");
const todayISO=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const fmtDate=s=>s?String(s).slice(0,10).split("-").reverse().join("."):"";
const r2=n=>Math.round(n*100)/100;
function toast(m){const e=$("#toast");e.textContent=m;e.style.display="block";clearTimeout(toast.h);toast.h=setTimeout(()=>e.style.display="none",3000)}
const blobToB64=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(String(f.result).split(",")[1]);f.readAsDataURL(b)});

/* ---------- login e API ---------- */
let token=null,user=null;
let gtoken=null;
(function(){const m=location.hash.match(/#g=([^&]+)/);if(m){gtoken=decodeURIComponent(m[1]);history.replaceState(null,"",location.pathname)}try{token=localStorage.getItem("wi-token")}catch(e){}})();
function logout(){try{localStorage.removeItem("wi-token")}catch(e){}token=null;user=null;showLogin()}
const ERRS={manca_chiave_gemini:["Manca la chiave Gemini","Der Gemini-Schlüssel fehlt"],chiave_claude_non_valida:["Questa non è una chiave Claude (deve iniziare con sk-ant-)","Das ist kein Claude-Schlüssel (muss mit sk-ant- beginnen)"],chiave_claude_rifiutata:["Claude ha rifiutato la chiave","Claude hat den Schlüssel abgelehnt"],non_autorizzato:["Questo account non è autorizzato","Dieses Konto ist nicht freigeschaltet"],azione_sconosciuta:["Azione sconosciuta","Unbekannte Aktion"],bad_request:["Richiesta non valida","Ungültige Anfrage"]};
function errText(e){e=String(e||"");const k=e.split(/[:\s]/)[0];if(ERRS[k])return ERRS[k][L()]+(e.length>k.length?" ("+e.slice(k.length).replace(/^[:\s]+/,"").slice(0,120)+")":"");if(/^(gemini|claude)\b/.test(e))return (lang==="de"?"Die KI antwortet gerade nicht: ":"L'intelligenza artificiale non risponde: ")+e.slice(0,120);return e}
async function api(action,payload){
  let r;
  try{r=await fetch(CFG.API,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(Object.assign({token,action},payload||{}))})}catch(e){throw new Error(t("offline"))}
  const j=await r.json();
  if(j.error==="login"){logout();throw new Error("login")}
  if(j.error==="solo_lettura")throw new Error(t("readonly"));
  if(j.error)throw new Error(errText(j.error));
  return j;
}
function showLogin(){applyLang();$("#v-login").classList.remove("hide");$(".app").classList.add("hide");$("#loginBtn").href=CFG.LOGIN}
$("#logout").onclick=logout;

/* ---------- dati ---------- */
let docs=[],editing=null;
const isAdmin=()=>user&&user.role==="admin";
async function load(){try{const j=await api("list");docs=j.docs||[];renderAll()}catch(e){if(e.message!=="login")toast(e.message)}}

/* ---------- viste ---------- */
function show(v){
  ["home","card","arch","ask","exp","sum"].forEach(x=>$("#v-"+x).classList.toggle("hide",x!==v));
  $$("nav.tabs button").forEach(b=>b.classList.toggle("on",b.dataset.v===v));
  $("nav.tabs").classList.toggle("hide",v==="card");if(v==="sum")$$("nav.tabs button").forEach(b=>b.classList.toggle("on",b.dataset.v==="home"));
  window.scrollTo(0,0);renderAll();
}
$$("nav.tabs button").forEach(b=>b.onclick=()=>b.dataset.v==="shoot"?openCamera():show(b.dataset.v));
$("#seeAll").onclick=()=>show("arch");
$("#cardBack").onclick=()=>{const back=editing&&editing._from;editing=null;show(back||"home")};

/* ---------- foto e lettura con Gemini ---------- */
const fileIn=$("#file");
function openCamera(){if(!isAdmin())return toast(t("readonly"));fileIn.setAttribute("capture","environment");fileIn.click()}
$("#shoot").onclick=openCamera;
$("#pickFile").onclick=()=>{if(!isAdmin())return toast(t("readonly"));fileIn.removeAttribute("capture");fileIn.click()};
fileIn.onchange=async()=>{const f=fileIn.files[0];fileIn.value="";if(f)newDoc(f)};
async function shrink(file){
  if(!file.type.startsWith("image/"))return file;
  try{const bmp=await createImageBitmap(file);const k=Math.min(1,1800/Math.max(bmp.width,bmp.height));const c=document.createElement("canvas");c.width=Math.round(bmp.width*k);c.height=Math.round(bmp.height*k);c.getContext("2d").drawImage(bmp,0,0,c.width,c.height);return await new Promise(r=>c.toBlob(b=>r(b||file),"image/jpeg",.85))}catch(e){return file}
}
async function newDoc(file){
  const blob=await shrink(file),isPdf=file.type==="application/pdf";
  editing={type:"acquisto",date:todayISO(),total:null,rate:19,cat:"sonstiges",art:"D",note:"",_url:URL.createObjectURL(blob),_blob:blob,_mime:isPdf?"application/pdf":"image/jpeg",isPdf,_new:true};
  fillCard();show("card");readAI(blob);
}
async function readAI(blob){
  const target=editing,st=$("#ocrState");st.classList.remove("hide");warn(null);
  try{
    const j=await api("read",{photo:await blobToB64(blob),mime:target._mime});
    if(editing!==target)return;const r=j.fields||{},f={};
    if(["cliente","fattura","acquisto"].includes(r.type))f.type=r.type;
    ["client","vendor","number","note","iban"].forEach(k=>{if(r[k])f[k]=String(r[k]).replace(/^\*/,"")});
    if(r.date&&/^\d{4}-\d{2}-\d{2}$/.test(r.date))f.date=r.date;
    if(r.due&&/^\d{4}-\d{2}-\d{2}$/.test(r.due))f.due=r.due;
    const tot=parseNum(r.total);if(tot!=null)f.total=tot;
    if([19,7,0].includes(r.rate))f.rate=r.rate;
    if(["D","G","W"].includes(r.art))f.art=r.art;
    if(CATS[r.category])f.cat=r.category;
    Object.assign(target,f);readSafe(target);fillCard();
    const names={client:t("client"),vendor:t("vendor"),date:t("date"),number:t("number"),total:t("total"),art:t("artist"),artist:t("artist"),due:t("due")};
    const uns=(Array.isArray(r.unsure)?r.unsure:[]).map(k=>names[k]).filter(Boolean);
    if(f.total==null&&!uns.includes(names.total))uns.push(names.total);
    const artMsg=r.artDefault?(lang==="de"?"Kein D/G auf der Quittung: D (Denis) eingesetzt, bitte prüfen. ":"Nessuna D/G sulla ricevuta: messo D (Denis), controlla. "):"";
    const uns2=r.artDefault?uns.filter(x=>x!==t("artist")):uns;
    warn(artMsg||uns2.length?artMsg+(uns2.length?t("lowConf")+[...new Set(uns2)].join(", "):""):null);
  }catch(e){if(editing===target&&e.message!=="login")warn(t("readFail")+" ("+e.message+")")}
  finally{st.classList.add("hide")}
}
function readSafe(d){if(d.type==="cliente"&&!d.cat)d.cat="einnahme"}
function warn(m){$("#cardWarn").classList.toggle("hide",!m);$("#cardWarnTxt").textContent=m||""}

/* ---------- scheda ---------- */
function setType(type){
  editing.type=type;$$("#typeSeg button").forEach(b=>b.classList.toggle("on",b.dataset.type===type));
  const cli=type==="cliente";
  $("#fClientRow").classList.toggle("hide",!cli);$("#fArtRow").classList.toggle("hide",!cli);
  $("#fVendorRow").classList.toggle("hide",cli);$("#fDueRow").classList.toggle("hide",type!=="fattura");
}
$$("#typeSeg button").forEach(b=>b.onclick=()=>{if(!isAdmin())return;readCard();setType(b.dataset.type)});
async function fillCard(){
  const d=editing,ph=$("#cardPhoto");
  ph.innerHTML=d._url?(d.isPdf?"<span>PDF</span>":`<img alt="" src="${esc(d._url)}">`):(d.photoId?`<span>${esc(t("loading"))}</span>`:"<span></span>");
  $("#fVendor").value=d.vendor||"";$("#fClient").value=d.client||"";$("#fNum").value=d.number||"";$("#fDate").value=String(d.date||"").slice(0,10);
  $("#fTotal").value=fmtNum(d.total);$("#fRate").value=String(d.rate===""||d.rate==null?19:d.rate);$("#fCat").value=d.cat||"sonstiges";
  $("#fDue").value=String(d.due||"").slice(0,10);$("#fArt").value=d.art||"D";$("#fNote").value=(d.note||"")+(d.iban&&!String(d.note||"").includes(d.iban)?((d.note?" · ":"")+"IBAN "+d.iban):"");
  const ml=$("#mailLink");ml.classList.toggle("hide",!d.mailUrl);if(d.mailUrl){ml.href=d.mailUrl;ml.textContent=t("openMail")}
  {const ds=(DUPS.get(d.id)||[]).map(id=>docs.find(x=>x.id===id)).filter(Boolean);$("#dupBox").classList.toggle("hide",!ds.length||!!d._new);
   if(ds.length){$("#dupTxt").textContent=lang==="de"?"Mögliches Duplikat von:":"Possibile doppione di:";$("#dupList").innerHTML=ds.map(x=>rowHTML(x,[])).join("");$("#notDup").textContent=lang==="de"?"Kein Duplikat":"Non è un doppione";$("#notDup").classList.toggle("hide",!isAdmin())}}
  $("#confirmBox").classList.toggle("hide",!(d.status==="confirm"&&isAdmin()));
  {const imp=d.src==="import";$("#confirmBox b").textContent=imp?(lang==="de"?"Erstimport: Daten prüfen und bestätigen":"Importazione iniziale: controlla i dati e conferma"):t("confirmQ");$("#cStudio").textContent=imp?(lang==="de"?"Bestätigen ✓":"Confermato ✓"):t("studio");$("#cPriv").textContent=imp?(lang==="de"?"Privat":"Privata"):t("private")}
  $("#save").textContent=d._new?t("save"):t("update");$("#del").classList.toggle("hide",!!d._new||!isAdmin());
  $("#save").classList.toggle("hide",!isAdmin());$$("#v-card input,#v-card select,#v-card textarea").forEach(e=>e.disabled=!isAdmin());
  $("#cardTitle").textContent=d._new?t("recognized"):t("detail");
  setType(d.type);
  const hb=$("#hist");hb.innerHTML="";$("#histBox").classList.toggle("hide",!!d._new);
  if(!d._new){
    api("history",{id:d.id}).then(j=>{if(editing!==d)return;hb.innerHTML=(j.items||[]).map(i=>`<div class="hrow"><b>${esc(whatT(i.what))}</b> · ${esc(new Date(i.when).toLocaleString(lang==="de"?"de-DE":"it-IT"))}<br><span>${esc(t("by"))} ${esc(i.who)}</span>${i.det?`<br><span>${esc(detT(i.det))}</span>`:""}</div>`).join("")||`<div class="hrow"><span>${esc(t("created"))} ${esc(t("by"))} ${esc(d.createdBy||"")}</span></div>`}).catch(()=>{});
    if(d.photoId&&!d._url)api("photo",{id:d.id}).then(j=>{if(editing!==d||!j.data)return;d._url="data:"+j.mime+";base64,"+j.data;d.isPdf=/pdf/.test(j.mime);ph.innerHTML=d.isPdf?`<a class="link" download="beleg.pdf" href="${d._url}">PDF</a>`:`<img alt="" src="${d._url}">`}).catch(()=>{});
  }
}
const WHAT={caricato:["caricato","hochgeladen"],nuovo:["nuovo","neu"],modifica:["modifica","geändert"],storno:["stornato","storniert"],importato:["importato","importiert"],"importazione avviata":["importazione avviata","Import gestartet"],"chiave gemini":["chiave Gemini","Gemini-Schlüssel"],"chiave claude":["chiave Claude","Claude-Schlüssel"],accesso:["accesso","Anmeldung"]};
const FIELD={type:["tipo","Art"],art:["chi","Wer"],client:["cliente","Kunde"],vendor:["fornitore","Lieferant"],number:["numero","Nummer"],date:["data","Datum"],total:["totale","Betrag"],rate:["IVA","MwSt"],cat:["categoria","Kategorie"],due:["scadenza","Fällig"],iban:["IBAN","IBAN"],note:["note","Notiz"],status:["stato","Status"],priv:["privata","privat"]};
const whatT=w=>(WHAT[w]||[w,w])[L()];
const detT=d=>String(d).replace(/\b(type|art|client|vendor|number|date|total|rate|cat|due|iban|note|status|priv):/g,(m,k)=>FIELD[k][L()]+":").replace("documento stornato, resta nell'archivio come eliminato",lang==="de"?"Beleg storniert, bleibt im Archiv als gelöscht":"documento stornato, resta nell'archivio come eliminato");
function readCard(){const d=editing;d.vendor=$("#fVendor").value.trim();d.client=$("#fClient").value.trim();d.number=$("#fNum").value.trim();d.date=$("#fDate").value;d.total=parseNum($("#fTotal").value);d.rate=+$("#fRate").value;d.cat=$("#fCat").value;d.due=$("#fDue").value;d.art=$("#fArt").value;d.note=$("#fNote").value.trim()}
async function saveCard(extra){
  readCard();const d=Object.assign(editing,extra||{});
  if(d.total==null){toast(t("needTotal"));$("#fTotal").focus();return}
  const btn=$("#save");btn.disabled=true;
  try{
    const payload={doc:{id:d.id,type:d.type,art:d.art,client:d.client,vendor:d.vendor,number:d.number,date:d.date,total:d.total,rate:d.rate,cat:d.cat,due:d.due,iban:d.iban,note:d.note,status:d.status==="confirm"&&!extra?"confirm":(extra?"ok":d.status),priv:!!d.priv}};
    if(d._new&&d._blob){payload.photo=await blobToB64(d._blob);payload.mime=d._mime}
    await api("save",payload);toast(d._new?t("saved"):t("updated"));editing=null;await load();show("home");
  }catch(e){if(e.message!=="login")toast(e.message)}finally{btn.disabled=false}
}
$("#save").onclick=()=>saveCard();
$("#notDup").onclick=()=>{$("#fNote").value=($("#fNote").value.trim()?$("#fNote").value.trim()+" · ":"")+NOTDUP;saveCard()};
$("#cStudio").onclick=()=>saveCard({priv:false,status:"ok"});
$("#cPriv").onclick=()=>saveCard({priv:true,status:"ok"});
$("#del").onclick=async e=>{
  const b=e.currentTarget;if(!b.dataset.sure){b.dataset.sure=1;b.textContent=t("sure");setTimeout(()=>{delete b.dataset.sure;b.textContent=t("delete")},3000);return}
  try{await api("del",{id:editing.id});editing=null;toast(t("deleted"));await load();show("home")}catch(err){toast(err.message)}
};
function openDoc(id){const d=docs.find(x=>x.id===id);if(!d)return;editing=Object.assign({},d);if(!$("#v-sum").classList.contains("hide"))editing._from="sum";fillCard();warn(null);show("card")}

/* ---------- liste ---------- */
const ICON={acquisto:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.8" aria-hidden="true"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"></path></svg>',cliente:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="1.8" aria-hidden="true"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>',fattura:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0057FF" stroke-width="1.8" aria-hidden="true"><path d="M4 4h16v16H4z"></path><path d="M4 9h16"></path></svg>'};
const ICLS={acquisto:"acq",cliente:"cli",fattura:"fat"};
const NOTDUP="✓ non doppione";
function dupKey(d){return norm(d.type==="cliente"?d.client:d.vendor).replace(/[^a-z0-9]/g,"").slice(0,8)}
function findDups(){const map=new Map(),live=docs.filter(d=>!String(d.note||"").includes(NOTDUP));
  for(let i=0;i<live.length;i++)for(let j=i+1;j<live.length;j++){const a=live[i],b=live[j];if(a.type!==b.type)continue;
    const sameNum=a.number&&b.number&&norm(a.number)===norm(b.number)&&dupKey(a)===dupKey(b);
    const days=Math.abs((new Date(a.date)-new Date(b.date))/864e5);
    const same=Math.abs((+a.total||0)-(+b.total||0))<0.005&&dupKey(a)&&dupKey(a)===dupKey(b)&&days<=3&&!(a.number&&b.number&&norm(a.number)!==norm(b.number));
    if(sameNum||same){(map.get(a.id)||map.set(a.id,[]).get(a.id)).push(b.id);(map.get(b.id)||map.set(b.id,[]).get(b.id)).push(a.id)}}
  return map}
let DUPS=new Map();
function totHTML(list){
  if(!list.length)return "";let inn=0,out=0,priv=0;list.forEach(d=>{if(d.priv){priv++;return}if(d.type==="cliente")inn+=+d.total||0;else out+=+d.total||0});
  const de=lang==="de",parts=[];
  if(inn)parts.push(`<span>${de?"Einnahmen":"Entrate"}</span><b class="in">+${esc(eur(inn))}</b>`);
  if(out)parts.push(`<span>${de?"Ausgaben":"Uscite"}</span><b>${esc(eur(out))}</b>`);
  if(inn&&out)parts.push(`<span>${de?"Saldo":"Saldo"}</span><b class="${inn-out>=0?"in":""}">${esc(eur(inn-out))}</b>`);
  return `<div class="tot"><div class="totn">${de?"Summe":"Totale"} · ${list.length} ${de?"Belege":"documenti"}${priv?` · ${priv} ${de?"privat, nicht gezählt":"privati non contati"}`:""}</div>${parts.map(x=>`<div class="totr">${x}</div>`).join("")}</div>`;
}
function rowHTML(d,terms){
  const title=d.type==="cliente"?(d.client||t("tCli")):(d.vendor||t(d.type==="fattura"?"tFat":"tAcq"));
  const sub=[DUPS.has(d.id)?"⚠ "+(lang==="de"?"Duplikat?":"doppione?"):"",d.status==="confirm"?"● "+t("toConfirm"):"",d.priv?t("privTag"):"",d.src==="email"?"✉":d.src==="import"?"⇪":"",fmtDate(d.date),d.number?("Nr. "+d.number):"",CATS[d.cat]?.[L()]||"",d.type==="cliente"&&d.art?d.art:""].filter(Boolean).join(" · ");
  return `<button class="row" data-open="${esc(d.id)}"><span class="ico ${ICLS[d.type]||"acq"}">${ICON[d.type]||ICON.acquisto}</span><span class="rmain"><b>${hl(title,terms)}</b><small>${hl(sub,terms)}</small></span><span class="amt ${d.type==="cliente"?"in":""}"${d.priv?' style="opacity:.5"':""}>${d.type==="cliente"?"+":""}${esc(eur(d.total))}</span></button>`;
}
document.addEventListener("click",e=>{const r=e.target.closest("[data-open]");if(r)openDoc(r.dataset.open)});
const counts=d=>!d.priv;
let catF="";
const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ß/g,"ss");
const vkey=d=>d.type==="cliente"?"":norm(d.vendor).replace(/[^a-z]/g,"").slice(0,12);
function recurringVendors(){const m=new Map();docs.forEach(d=>{const k=vkey(d);if(!k)return;if(!m.has(k))m.set(k,new Set());m.get(k).add(String(d.date||"").slice(0,7))});return new Set([...m].filter(([,s])=>s.size>=2).map(([k])=>k))}
function renderAll(){
  if(!user)return;
  DUPS=findDups();$("#dupBanner").classList.toggle("hide",!DUPS.size||!isAdmin());$("#dupN").textContent=DUPS.size+(lang==="de"?" Belege sind mögliche Duplikate: prüfen":" documenti sono possibili doppioni: controlla");
  const m=todayISO().slice(0,7);let inn=0,out=0,conf=0;
  docs.forEach(d=>{if(d.status==="confirm")conf++;if(!counts(d))return;if(String(d.date||"").startsWith(m)){if(d.type==="cliente")inn+=+d.total||0;else out+=+d.total||0}});
  $("#sIn").textContent=eur(inn);$("#sOut").textContent=eur(out);
  $("#confBanner").classList.toggle("hide",!conf||!isAdmin());$("#confN").textContent=conf;
  const sorted=[...docs].sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))||String(b.createdAt||"").localeCompare(String(a.createdAt||"")));
  $("#latest").innerHTML=sorted.slice(0,6).map(d=>rowHTML(d,[])).join("")+totHTML(sorted.slice(0,6))||`<div class="empty">${esc(t("empty"))}</div>`;
  const f=$("#archChips .on")?.dataset.f||"all",am=$("#archMonth").value,rec=recurringVendors();
  const used=[...new Set(docs.map(d=>d.cat).filter(Boolean))];
  $("#catChips").innerHTML=[`<button data-c="" class="${catF===""?"on":""}">${esc(t("allCats"))}</button>`,conf?`<button data-c="__conf" class="${catF==="__conf"?"on":""}">${esc(t("toConfirm"))} (${conf})</button>`:"",DUPS.size?`<button data-c="__dup" class="${catF==="__dup"?"on":""}" style="color:#B91C1C">⚠ ${lang==="de"?"Duplikate":"Doppioni"} (${DUPS.size})</button>`:"",rec.size?`<button data-c="__rec" class="${catF==="__rec"?"on":""}">${esc(t("recurring"))}</button>`:""].concat(Object.keys(CATS).filter(k=>used.includes(k)).map(k=>`<button data-c="${k}" class="${catF===k?"on":""}">${esc(CATS[k][L()])}</button>`)).join("");
  const arch=sorted.filter(d=>(f==="all"||d.type===f)&&(!am||String(d.date||"").startsWith(am))&&(!catF||(catF==="__rec"?rec.has(vkey(d)):catF==="__conf"?d.status==="confirm":catF==="__dup"?DUPS.has(d.id):d.cat===catF)));
  $("#archList").innerHTML=arch.map(d=>rowHTML(d,[])).join("")+totHTML(arch)||`<div class="empty">${esc(docs.length?t("noRes"):t("empty"))}</div>`;
  runSearch();
  if(!$("#v-exp").classList.contains("hide"))renderExp();
  if(!$("#v-sum").classList.contains("hide"))renderSum();
}
document.addEventListener("click",e=>{const c=e.target.closest("#catChips button");if(c){catF=c.dataset.c;renderAll()}});
$$("#archChips button").forEach(b=>b.onclick=()=>{$$("#archChips button").forEach(x=>x.classList.toggle("on",x===b));renderAll()});
$("#archMonth").oninput=renderAll;
$("#confBanner").onclick=()=>{catF="__conf";show("arch")};
$("#dupBanner").onclick=()=>{catF="__dup";$("#archMonth").value="";show("arch")};
$("#keyBtn").onclick=async()=>{const k=$("#keyIn").value.trim();if(!k)return;try{await api("setKey",{key:k});$("#keyIn").value="";toast("✓");loadStatus()}catch(e){toast(e.message)}};
const tt=(i,d)=>lang==="de"?d:i;
$("#claudeBtn").onclick=async()=>{const k=$("#claudeIn").value.trim();if(!k)return;const b=$("#claudeBtn");b.disabled=true;try{await api("setClaudeKey",{key:k});$("#claudeIn").value="";toast(tt("Chiave Claude provata e salvata ✓","Claude-Schlüssel geprüft und gespeichert ✓"));loadStatus()}catch(e){toast(e.message)}finally{b.disabled=false}};
$("#impBtn").onclick=async()=>{try{await api("startImport");toast(tt("Importazione avviata: lavora da sola ogni 5 minuti","Import gestartet: läuft alle 5 Minuten"));loadStatus()}catch(e){toast(e.message)}};
async function loadStatus(){if(!isAdmin())return;try{const s=await api("status");$("#keyBox").classList.toggle("hide",s.gemini);
$("#claudeBox").classList.toggle("hide",!!s.claude);
$("#aiState").textContent=(s.claude?"Claude ✓":"Claude ✗")+" · "+(s.gemini?"Gemini ✓":"Gemini ✗");
$("#impBox").classList.toggle("hide",!s.importPending&&!s.importRunning);$("#impLink").href=s.importUrl||"#";
$("#impTxt").textContent=s.importRunning?tt("Importazione iniziale in corso: ","Erstimport läuft: ")+s.importPending+tt(" file ancora da leggere"," Dateien übrig"):tt("Importazione iniziale: ","Erstimport: ")+s.importPending+tt(" file nella cartella"," Dateien im Ordner");
$("#impBtn").classList.toggle("hide",!!s.importRunning);$("#stLinks").innerHTML=`<a class="link" target="_blank" rel="noopener" href="${esc(s.sheet)}">${esc(t("sheetLink"))}</a> · <a class="link" target="_blank" rel="noopener" href="${esc(s.folder)}">${esc(t("folderLink"))}</a>`}catch(e){}}
$("#checkMail").onclick=async e=>{const b=e.currentTarget;b.disabled=true;b.textContent=t("loading");try{const j=await api("importNow");toast(t("mailDone")(j.imported||0));await load()}catch(err){toast(err.message)}finally{b.disabled=false;b.textContent=t("checkMail")}};

/* ---------- ricerca che perdona gli errori ---------- */
function lev(a,b,max){if(Math.abs(a.length-b.length)>max)return max+1;let p=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const c=[i];let best=i;for(let j=1;j<=b.length;j++){c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));best=Math.min(best,c[j])}if(best>max)return max+1;p=c}return p[b.length]}
function termHits(term,words,full){if(full.includes(term))return 3;const max=term.length>=8?2:term.length>=4?1:0;if(!max)return 0;for(const w of words){if(lev(term,w,max)<=max)return 1;if(w.length>term.length&&lev(term,w.slice(0,term.length),max)<=max)return 1}return 0}
function hay(d){return norm([d.client,d.vendor,d.number,d.note,CATS[d.cat]?.join(" "),fmtDate(d.date),d.date,fmtNum(d.total),d.type==="cliente"?({D:"denis d",G:"giova g",W:"waiblingen w"}[d.art]||""):"",d.createdBy].join(" "))}
function runSearch(){
  const q=norm($("#q").value).trim();$("#searchRes").classList.toggle("hide",!q);$("#homeBody").classList.toggle("hide",!!q);if(!q)return;
  const terms=q.split(/\s+/).filter(Boolean),res=[];
  for(const d of docs){const h=hay(d),words=h.split(/[^a-z0-9,]+/).filter(Boolean);let s=0,ok=true;for(const tm of terms){const x=termHits(tm,words,h);if(!x){ok=false;break}s+=x}if(ok)res.push([s,d])}
  res.sort((a,b)=>b[0]-a[0]||String(b[1].date||"").localeCompare(String(a[1].date||"")));
  $("#resTitle").textContent=t("results")(res.length);$("#resList").innerHTML=res.map(([,d])=>rowHTML(d,terms)).join("")+totHTML(res.map(([,d])=>d))||`<div class="empty">${esc(t("noRes"))}</div>`;
}
function hl(text,terms){let s=esc(text);for(const tm of terms){if(tm.length<2)continue;s=s.replace(new RegExp("("+tm.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","ig"),"<mark>$1</mark>")}return s}
$("#q").oninput=runSearch;$("#clearQ").onclick=()=>{$("#q").value="";runSearch()};

/* ---------- assistente ---------- */
let lastAsk=null;
$("#askForm").onsubmit=async e=>{
  e.preventDefault();const q=$("#askIn").value.trim();if(!q)return;
  const box=$("#askOut");box.innerHTML=`<div class="info"><span class="spin"></span><span>${esc(t("loading"))}</span></div>`;
  try{
    const j=await api("ask",{lang,q});const set=new Map(docs.map(d=>[d.id,d]));const list=(j.ids||[]).map(id=>set.get(id)).filter(Boolean).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    let inn=0,out=0;list.forEach(d=>{if(!counts(d))return;if(d.type==="cliente")inn+=+d.total||0;else out+=+d.total||0});
    lastAsk={q,answer:j.answer,list,inn:r2(inn),out:r2(out)};
    box.innerHTML=`<div class="list" style="padding:14px;display:flex;flex-direction:column;gap:10px"><span style="font-size:13px;color:var(--muted)">${esc(q)}</span><b style="font-size:16px;line-height:1.4">${esc(j.answer)}</b><div class="grid2">${inn?`<div class="stat"><span>${esc(t("sumIn"))}</span><span class="mono" style="color:var(--green)">${esc(eur(inn))}</span></div>`:""}${out?`<div class="stat"><span>${esc(t("sumOut"))}</span><span class="mono">${esc(eur(out))}</span></div>`:""}</div><span style="font-size:12px;color:var(--muted)">${list.length} ${esc(t("docsN"))}</span></div>`+
      (list.length?`<div class="list">${list.map(d=>rowHTML(d,[])).join("")}${totHTML(list)}</div><div class="grid2"><button class="secondary" id="askPdf">PDF</button><button class="secondary" id="askXls">Excel</button></div>`:"");
    if(list.length){$("#askPdf").onclick=()=>exportPdf(list,"Domanda: "+q+"\n"+j.answer,"Waiblingen-Ink_Risposta.pdf",false);$("#askXls").onclick=()=>exportXls(list,"Waiblingen-Ink_Risposta.xlsx",null)}
  }catch(err){box.innerHTML=`<div class="warn">${esc(err.message)}</div>`}
};
$$("#askChips button").forEach(b=>b.onclick=()=>{$("#askIn").value=b.textContent;$("#askForm").requestSubmit()});

/* ---------- export ---------- */
function periods(){const ms=[...new Set(docs.map(d=>String(d.date||"").slice(0,7)).filter(Boolean))].sort().reverse();const qs=[...new Set(ms.map(m=>m.slice(0,4)+"-Q"+Math.ceil(+m.slice(5,7)/3)))];const loc=lang==="de"?"de-DE":"it-IT";return ms.map(m=>[m,new Date(m+"-15").toLocaleDateString(loc,{month:"long",year:"numeric"})]).concat(qs.map(q=>[q,t("quarter")+" "+q.slice(6)+" "+q.slice(0,4)]))}
function inPer(d,p){const m=String(d.date||"").slice(0,7);if(!m||!p)return false;if(p.includes("Q"))return m.slice(0,4)===p.slice(0,4)&&("Q"+Math.ceil(+m.slice(5,7)/3))===p.slice(5);return m===p}
const perDocs=()=>docs.filter(d=>counts(d)&&inPer(d,$("#expPer").value)).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
function elster(list){let n19=0,n7=0,vst=0,noRate=0,inn=0,out=0;for(const d of list){const tot=+d.total||0;const r=d.rate===""||d.rate==null?null:+d.rate;if(d.type==="cliente"){inn+=tot;if((r??19)===19)n19+=tot/1.19;else if(r===7)n7+=tot/1.07}else{out+=tot;if(r===19||r===7)vst+=tot-tot/(1+r/100);else if(r!==0)noRate++}}const k81=Math.floor(n19),k86=Math.floor(n7);return{k81,k86,k66:r2(vst),k83:r2(k81*0.19+k86*0.07-vst),noRate,inn:r2(inn),out:r2(out)}}
function renderExp(){const s=$("#expPer"),cur=s.value,ps=periods();s.innerHTML=ps.map(([v,l])=>`<option value="${v}">${esc(l)}</option>`).join("");if(cur&&ps.some(p=>p[0]===cur))s.value=cur;const list=perDocs(),e=elster(list);$("#eN").textContent=list.length;$("#eNR").textContent=e.noRate;$("#eIn").textContent=eur(e.inn);$("#eOut").textContent=eur(e.out);$("#k81").textContent=eur(e.k81);$("#k86").textContent=eur(e.k86);$("#k66").textContent=eur(e.k66);$("#k83").textContent=eur(e.k83)}
$("#expPer").onchange=renderExp;
const libs={};function lib(src){return libs[src]||(libs[src]=new Promise((ok,ko)=>{const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=()=>ko(new Error("lib"));document.head.appendChild(s)}))}
const typeName=d=>d.type==="cliente"?(d.art==="W"?"Quittung an Tätowierer":"Quittung an Kunden"):(d.type==="fattura"?"Rechnung zu zahlen":"Einkauf");
function rowsDE(list){return list.map(d=>{const r=d.rate===""||d.rate==null?null:+d.rate,tot=d.total===""?null:+d.total,has=tot!=null&&(r===19||r===7);return{"Datum":fmtDate(d.date),"Art":typeName(d),"Wer":d.type==="cliente"?(d.art||""):"","Kunde / Lieferant":d.type==="cliente"?(d.client||""):(d.vendor||""),"Belegnummer":d.number||"","Kategorie":CATS[d.cat]?.[1]||"","Brutto":tot??"","MwSt %":r??"","Netto":has?r2(tot/(1+r/100)):"","MwSt":has?r2(tot-tot/(1+r/100)):"","Notiz":d.note||"","Quelle":d.src==="email"?"E-Mail":"Foto","Erfasst von":d.createdBy||"","Geändert von":d.updatedBy||""}})}
function dl(name,blob){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)}
function busy(on){$("#xState").classList.toggle("hide",!on);$("#xState").textContent=t("preparing");["#xPdf","#xXls","#xEl"].forEach(s=>$(s).disabled=on)}
const perLabel=()=>$("#expPer").selectedOptions[0]?.textContent||"";
async function exportXls(list,name,el){await lib("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rowsDE(list)),"Belege");if(el)XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([["Umsatzsteuer-Voranmeldung, SCHÄTZUNG",perLabel()],[],["Kennzahl","Beschreibung","Betrag €"],[81,"Umsätze 19 % (Bemessungsgrundlage, volle Euro)",el.k81],[86,"Umsätze 7 % (Bemessungsgrundlage, volle Euro)",el.k86],[66,"Vorsteuerbeträge",el.k66],[83,"Verbleibende Vorauszahlung",el.k83],[],["Hinweis","Schätzung. "+el.noRate+" Einkäufe ohne MwSt-Satz nicht berücksichtigt. Private Ausgaben ausgeschlossen."]]),"ELSTER");dl(name,new Blob([XLSX.write(wb,{bookType:"xlsx",type:"array"})]))}
async function exportPdf(list,head,name,withElster,withPhotos){
  await lib("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");await lib("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
  const doc=new window.jspdf.jsPDF({unit:"mm",format:"a4"}),blue=[0,87,255];let y=30;
  doc.setFontSize(15);doc.text("Waiblingen Ink",14,16);doc.setFontSize(9);doc.setTextColor(90);doc.text(doc.splitTextToSize(head,180),14,22);doc.setTextColor(0);
  if(withElster){const e=elster(list);doc.autoTable({startY:y+4,head:[["Kz","Umsatzsteuer-Voranmeldung (Schätzung)","€"]],body:[["81","Umsätze 19 % netto",eur(e.k81)],["86","Umsätze 7 % netto",eur(e.k86)],["66","Vorsteuer",eur(e.k66)],["83","Vorauszahlung",eur(e.k83)]],headStyles:{fillColor:blue},styles:{fontSize:9}});y=doc.lastAutoTable.finalY}
  if(withElster!=="only"){const rows=rowsDE(list);doc.autoTable({startY:y+6,head:[["Datum","Art","Wer","Kunde/Lieferant","Nr.","Kategorie","Brutto €","MwSt %","Erfasst von"]],body:rows.map(r=>[r.Datum,r.Art,r.Wer,r["Kunde / Lieferant"],r.Belegnummer,r.Kategorie,r.Brutto===""?"":String(r.Brutto).replace(".",","),r["MwSt %"],r["Erfasst von"]]),headStyles:{fillColor:blue},styles:{fontSize:7.5}})}
  if(withPhotos)for(const d of list){if(!d.photoId)continue;try{const j=await api("photo",{id:d.id});if(!j.data||/pdf/.test(j.mime))continue;const url="data:"+j.mime+";base64,"+j.data;const img=await new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=ko;i.src=url});doc.addPage();doc.setFontSize(10);doc.text([fmtDate(d.date),typeName(d),d.client||d.vendor||"",d.number?("Nr. "+d.number):"",eur(d.total)].filter(Boolean).join(" · "),14,12);const k=Math.min(182/img.width,270/img.height);doc.addImage(url,"JPEG",14,16,img.width*k,img.height*k)}catch(_){}}
  dl(name,doc.output("blob"));
}
const fname=ext=>"Waiblingen-Ink_Belege_"+($("#expPer").value||"export")+"."+ext;
$("#xXls").onclick=async()=>{busy(true);try{const l=perDocs();await exportXls(l,fname("xlsx"),elster(l))}catch(e){toast(e.message)}finally{busy(false)}};
$("#xPdf").onclick=async()=>{busy(true);try{await exportPdf(perDocs(),"Belege "+perLabel()+" · Denis Cicala & Linda Salihu-Cicala GbR · Lange Straße 10 · 71332 Waiblingen",fname("pdf"),true,true)}catch(e){toast(e.message)}finally{busy(false)}};
$("#xEl").onclick=async()=>{busy(true);try{await exportPdf(perDocs(),"ELSTER Schätzung "+perLabel(),"Waiblingen-Ink_ELSTER_"+($("#expPer").value||"")+".pdf","only",false)}catch(e){toast(e.message)}finally{busy(false)}};

/* ---------- avvio ---------- */
(async()=>{
  if(!CFG.API||!CFG.LOGIN){document.body.innerHTML="<p style='padding:20px'>Configurazione mancante (config.js).</p>";return}
  if(gtoken){try{const j=await api("login",{g:gtoken});token=j.token;try{localStorage.setItem("wi-token",token)}catch(e){}}catch(e){showLogin();$("#loginErr").textContent=/autorizzat|freigeschaltet/.test(e.message)?errText("non_autorizzato"):(lang==="de"?"Anmeldung fehlgeschlagen, bitte erneut versuchen.":"Accesso non riuscito, riprova.");return}}
  if(!token)return showLogin();
  try{user=await api("me")}catch(e){return showLogin()}
  $("#v-login").classList.add("hide");$(".app").classList.remove("hide");
  $("#who").textContent=user.email;
  if(!isAdmin()){$("#shoot").classList.add("hide");$("#pickFile").classList.add("hide");$("#checkMail").classList.add("hide")}
  applyLang();await load();loadStatus();
})();

/* ---------- riepilogo per artista (D = Denis, G = Giova Tattoos, W = Waiblingen Ink) ---------- */
Object.assign(IT,{sumOpen:"Riepilogo per artista: Denis, Giova Tattoos, Waiblingen Ink",sumTitle:"Riepilogo per artista",alMonth:"Mese",sumD:"Denis",sumG:"Giova Tattoos",sumW:"Waiblingen Ink",
 sInc:"Incassato",sTat:"Tatuaggi",sAnz:"Acconti",sDocs:"ricevute",sTot:"Totale",sGiovaPaid:"Pagato a Giovanni (sua ricevuta)",sRest:"Resta a Waiblingen Ink",
 sNoPay:"Ricevuta di Giovanni per questo mese non ancora arrivata: quando la fotografate, il conto si completa da solo.",sForWork:"per i lavori di",
 sFromD:"Da Denis",sFromG:"Da Giova Tattoos (dopo la sua quota)",sFromGwait:"Da Giova Tattoos (manca la sua ricevuta)",sRent:"Affitto postazione e materiale",sExp:"Spese dello studio",sSaldo:"Saldo del mese",
 sNote:"Contano solo i documenti nell'app: le spese senza ricevuta (affitto, banca) arriveranno con l'estratto conto. I privati non sono contati.",sConf:"da confermare",sEmpty:"Nessuna ricevuta in questo mese."});
Object.assign(DE,{sumOpen:"Übersicht pro Künstler: Denis, Giova Tattoos, Waiblingen Ink",sumTitle:"Übersicht pro Künstler",alMonth:"Monat",sumD:"Denis",sumG:"Giova Tattoos",sumW:"Waiblingen Ink",
 sInc:"Eingenommen",sTat:"Tattoos",sAnz:"Anzahlungen",sDocs:"Belege",sTot:"Summe",sGiovaPaid:"An Giovanni gezahlt (seine Rechnung)",sRest:"Bleibt bei Waiblingen Ink",
 sNoPay:"Giovannis Rechnung für diesen Monat fehlt noch: sobald ihr sie fotografiert, ergänzt sich die Rechnung von selbst.",sForWork:"für die Arbeiten im",
 sFromD:"Von Denis",sFromG:"Von Giova Tattoos (nach seinem Anteil)",sFromGwait:"Von Giova Tattoos (seine Rechnung fehlt)",sRent:"Platzmiete und Material",sExp:"Ausgaben des Studios",sSaldo:"Saldo des Monats",
 sNote:"Es zählen nur Belege in der App: Ausgaben ohne Beleg (Miete, Bank) kommen mit dem Kontoauszug. Private Belege zählen nicht.",sConf:"zu bestätigen",sEmpty:"Keine Belege in diesem Monat."});
let sumA="D";
const mon=m=>{const s=new Date(m+"-15").toLocaleDateString(lang==="de"?"de-DE":"it-IT",{month:"long",year:"numeric"});return s.charAt(0).toUpperCase()+s.slice(1)};
const prevMon=m=>{const d=new Date(m+"-15");d.setMonth(d.getMonth()-1);return d.toISOString().slice(0,7)};
/* ricevuta di Giovanni allo studio: spesa con lettera G o fornitore Giovanni/Giova; vale per il mese precedente alla sua data */
const isGiovaPay=d=>d.type!=="cliente"&&(d.art==="G"||/giovanni|giova\b|giova tattoo/i.test(d.vendor||""));
function sumOf(l){return l.reduce((s,d)=>s+(+d.total||0),0)}
function sumBox(title,list,extra){
  return `<div class="list"><div class="row" style="cursor:default;background:#f8fafc"><span class="rmain"><b>${esc(title)}</b></span></div>${list.map(d=>rowHTML(d,[])).join("")||`<div class="empty">${esc(t("sEmpty"))}</div>`}<div class="tot"><div class="totr"><span>${esc(t("sTot"))} · ${list.length} ${esc(t("sDocs"))}</span><b class="in">${esc(eur(sumOf(list)))}</b></div>${extra||""}</div></div>`}
function renderSum(){
  const months=[...new Set(docs.map(d=>String(d.date||"").slice(0,7)).filter(Boolean))].sort().reverse();
  const sel=$("#sumMonth"),cur=sel.value||todayISO().slice(0,7);
  sel.innerHTML=months.map(m=>`<option value="${m}">${esc(mon(m))}</option>`).join("");
  sel.value=months.includes(cur)?cur:(months[0]||"");const M=sel.value;
  $$("#sumWho button").forEach(b=>b.classList.toggle("on",b.dataset.a===sumA));
  const live=docs.filter(d=>!d.priv),inM=d=>String(d.date||"").startsWith(M);
  const cli=a=>live.filter(d=>d.type==="cliente"&&d.art===a&&inM(d)).sort((x,y)=>String(x.date).localeCompare(String(y.date)));
  const pays=live.filter(d=>isGiovaPay(d)&&prevMon(String(d.date||"").slice(0,7))===M);
  const rr=(l,v,c)=>`<div class="totr"><span>${esc(l)}</span><b class="${c||""}">${esc(v)}</b></div>`;
  let h="";
  if(sumA!=="W"){
    const l=cli(sumA),anz=l.filter(d=>d.cat==="anzahlung");
    h+=`<div class="grid2"><div class="stat"><span>${esc(t("sInc"))}</span><span class="mono" style="color:var(--green)">${esc(eur(sumOf(l)))}</span></div><div class="stat"><span>${esc(t("sTat"))} · ${esc(t("sAnz"))}</span><span class="mono">${esc(eur(sumOf(l)-sumOf(anz)))}</span><span>${esc(t("sAnz"))}: ${esc(eur(sumOf(anz)))}</span></div></div>`;
    let extra="";
    if(sumA==="G")extra=pays.length?pays.map(p=>rr(t("sGiovaPaid")+" · "+(p.number||"")+" ("+fmtDate(p.date)+")","− "+eur(p.total))).join("")+rr(t("sRest"),eur(sumOf(l)-sumOf(pays)),"in"):`<div class="sumnote">${esc(t("sNoPay"))}</div>`;
    h+=sumBox(t("sum"+sumA)+" · "+mon(M),l,extra);
    if(sumA==="G"&&pays.length)h+=`<div class="list">${pays.map(d=>rowHTML(d,[])).join("")}</div>`;
  }else{
    const dI=sumOf(cli("D")),gI=sumOf(cli("G")),gP=sumOf(pays),rent=cli("W");
    const exp=live.filter(d=>d.type!=="cliente"&&!isGiovaPay(d)&&inM(d));
    const saldo=dI+(pays.length?gI-gP:gI)+sumOf(rent)-sumOf(exp);
    h+=`<div class="grid2"><div class="stat"><span>${esc(t("sSaldo"))}</span><span class="mono" style="color:${saldo>=0?"var(--green)":"#B91C1C"}">${esc(eur(saldo))}</span></div><div class="stat"><span>${esc(t("sExp"))}</span><span class="mono">${esc(eur(sumOf(exp)))}</span></div></div>`;
    h+=`<div class="list"><div class="tot" style="border-top:none">${rr(t("sFromD"),eur(dI),"in")}${rr(pays.length?t("sFromG"):t("sFromGwait"),eur(pays.length?gI-gP:gI),"in")}${rr(t("sRent"),eur(sumOf(rent)),"in")}${rr(t("sExp"),"− "+eur(sumOf(exp)))}${rr(t("sSaldo"),eur(saldo),saldo>=0?"in":"")}</div></div>`;
    if(rent.length)h+=sumBox(t("sRent"),rent);
    h+=`<div class="list"><div class="row" style="cursor:default;background:#f8fafc"><span class="rmain"><b>${esc(t("sExp"))}</b></span></div>${exp.sort((x,y)=>String(x.date).localeCompare(String(y.date))).map(d=>rowHTML(d,[])).join("")||`<div class="empty">${esc(t("sEmpty"))}</div>`}${totHTML(exp)}</div>`;
  }
  h+=`<div class="sumnote">${esc(t("sNote"))}</div>`;
  $("#sumBody").innerHTML=h;
}
$("#sumBtn").onclick=()=>show("sum");
$("#sumBack").onclick=()=>show("home");
$("#sumMonth").onchange=renderSum;
$$("#sumWho button").forEach(b=>b.onclick=()=>{sumA=b.dataset.a;renderSum()});
