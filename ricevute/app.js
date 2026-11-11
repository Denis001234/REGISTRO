"use strict";
/* Ricevute Waiblingen Ink · app (GitHub Pages) · backend: Google Apps Script (config.js) */
const CFG = window.CFG || {};
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];

/* ---------- testi IT / DE ---------- */
const DE = {loginTitle:"Belege und Rechnungen",alSearch:"Suchen",alBack:"Zurück",alAsk:"Frage",alGemini:"Gemini-Schlüssel",alClaude:"Claude-Schlüssel",keyGeminiTxt:"Der Gemini-Schlüssel fehlt: hier einmalig einfügen (kostenlos auf aistudio.google.com/apikey mit dem info-Konto erstellen).",keyClaudeTxt:"Claude-Schlüssel: hier einmalig einfügen. Mit dem Schlüssel liest Claude die Fotos, Gemini bleibt als Reserve.",openFolder:"Ordner öffnen",startImport:"Import starten",q1:"Wie viel haben wir im Oktober eingenommen?",q2:"Wie hoch waren die Ausgaben im September?",q3:"Tattoos von Giova Tattoos diesen Monat",q4:"Abos, die wir jeden Monat zahlen",artD:"D · Denis (Waiblingen Ink)",artG:"G · Giova Tattoos",artW:"W · Waiblingen Ink an Tätowierer",notDup:"Kein Duplikat",sheetLink:"Archiv-Tabelle",folderLink:"Drive-Ordner",hello:"Hallo",admin:"Administrator",viewer:"Nur lesen",searchPh:"Kunde, Nummer, Lieferant, Tattoo suchen…",clear:"Abbrechen",shoot:"Beleg fotografieren",pick:"oder eine Datei wählen",inMonth:"Einnahmen im Monat",outMonth:"Ausgaben im Monat",latest:"Letzte Belege",seeAll:"Alle anzeigen",recognized:"Beleg erkannt",reading:"Die KI liest den Beleg…",what:"Was ist das",tAcq:"Einkauf",tCli:"Quittung an Kunden",tFat:"Bezahlte Rechnung",vendor:"Lieferant",client:"Kunde",number:"Nummer",date:"Datum",total:"Gesamt €",rate:"MwSt",cat:"Kategorie",due:"Fällig am",artist:"Wer",note:"Notizen",save:"Im Archiv speichern",update:"Änderungen speichern",delete:"Stornieren",archive:"Archiv",all:"Alle",month:"Monat",home:"Home",photo:"Foto",ask:"Fragen",export:"Export",
 empty:"Noch keine Belege.",noRes:"Nichts gefunden.",results:n=>n+" Ergebnisse",saved:"Gespeichert ✓",updated:"Aktualisiert ✓",deleted:"Storniert",needTotal:"Bitte den Gesamtbetrag eintragen.",sure:"Wirklich stornieren? Nochmal tippen.",readFail:"Lesen nicht möglich: bitte von Hand eintragen.",lowConf:"Bitte prüfen, unsicher gelesen: ",detail:"Beleg",allCats:"Alle Kategorien",recurring:"Wiederkehrend",toConfirm:"Zu bestätigen",fromMail:"aus E-Mail",openMail:"Original-E-Mail öffnen",confirmQ:"Aus dem Postfach denisrider00: Studio oder privat?",studio:"Studio",private:"Privat",privTag:"privat",history:"Verlauf",login:"Mit Google anmelden",loginTxt:"Nur eingeladene Personen haben Zutritt.",logout:"Abmelden",checkMail:"E-Mails jetzt prüfen",mailDone:n=>n+" neue Belege aus E-Mails",loading:"Lädt…",offline:"Server nicht erreichbar.",askPh:"z. B. Wie viel haben wir im Oktober eingenommen?",askBtn:"Fragen",askHint:"Frag das Archiv: Einnahmen, Ausgaben, Kunden, Lieferanten, Zeiträume.",sumIn:"Einnahmen",sumOut:"Ausgaben",docsN:"Belege",period:"Zeitraum",noRate:"Ohne MwSt-Satz",elsterHead:"Schätzung für ELSTER (Umsatzsteuer-Voranmeldung)",k81:"Kz 81 · Umsätze 19 % (netto)",k86:"Kz 86 · Umsätze 7 % (netto)",k66:"Kz 66 · Vorsteuer",k83:"Kz 83 · Vorauszahlung",elsterNote:"Nur eine Schätzung, die echte Berechnung macht die Steuerberaterin. Private Ausgaben und Einkäufe ohne MwSt-Satz werden nicht gezählt.",xPdf:"PDF mit Fotos",xXls:"Excel",xEl:"ELSTER-Blatt (PDF)",preparing:"Wird vorbereitet…",quarter:"Quartal",readonly:"Nur lesen: du kannst nichts ändern.",created:"erstellt",by:"von"};
const IT = {viewer:"Sola lettura",admin:"admin",recognized:"Documento riconosciuto",sheetLink:"Foglio archivio",folderLink:"Cartella Drive",results:n=>n+(n===1?" risultato":" risultati"),empty:"Ancora nessun documento.",noRes:"Nessun risultato.",saved:"Salvato ✓",updated:"Aggiornato ✓",deleted:"Stornato",needTotal:"Inserisci il totale.",sure:"Sicuro? Tocca di nuovo per stornare.",readFail:"Lettura non riuscita: inserisci i dati a mano.",lowConf:"Controlla, letto con poca sicurezza: ",update:"Salva le modifiche",detail:"Documento",allCats:"Tutte le categorie",recurring:"Ricorrenti",toConfirm:"Da confermare",fromMail:"da email",openMail:"Apri l'email originale",confirmQ:"Arrivata da denisrider00: è dello studio o privata?",studio:"Studio",private:"Privata",privTag:"privata",history:"Cronologia",login:"Accedi con Google",loginTxt:"Entra solo chi è stato invitato.",logout:"Esci",mailDone:n=>n+" nuovi documenti dalle email",loading:"Carico…",offline:"Server non raggiungibile.",askPh:"es. Quanto abbiamo incassato a ottobre?",askHint:"Chiedi all'archivio: incassi, spese, clienti, fornitori, periodi.",sumIn:"Entrate",sumOut:"Uscite",preparing:"Preparo il file…",quarter:"Trimestre",readonly:"Sola lettura: non puoi modificare.",created:"creato",by:"da"};
const CATS={einnahme:["Incasso tatuaggio","Tattoo Einnahme"],anzahlung:["Acconto","Anzahlung"],platzmiete:["Affitto postazione tatuatori","Platzmiete Tätowierer"],material:["Materiale tatuaggio","Tattoo Material"],miete:["Affitto","Miete"],energie:["Corrente, gas, acqua","Strom, Gas, Wasser"],telefon:["Telefono e internet","Telefon und Internet"],software:["Abbonamenti e software","Abos und Software"],versicherung:["Assicurazioni","Versicherungen"],werbung:["Pubblicità","Werbung"],fahrzeug:["Auto e carburante","Fahrzeug und Tanken"],buero:["Ufficio e pulizia","Büro und Reinigung"],gebuehren:["Commissioni di pagamento","Zahlungsgebühren"],steuer:["Tasse e contributi","Steuern und Beiträge"],beratung:["Consulenze","Beratung"],sonstiges:["Altro","Sonstiges"]};
Object.assign(DE,{agName:"Mach das für mich",agHint:"Sag mir, was du brauchst: ich bereite die Liste, das PDF oder die Änderungen vor. Bevor ich etwas ändere, zeige ich dir alles und warte auf dein OK.",agSaved:"Gespeicherte Aufträge",agEx:"Beispiele",ag1:"Tattoos am Mittwoch und Freitag von Denis und Giovanni im Oktober, mit PDF",ag2:"Alle Tankbelege von diesem Jahr",ag3:"Ausgaben über 200 € im September",ag4:"Alle Apple Abos in die Kategorie Software"});
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
const ERRS={solo_denis:["Solo Denis può farlo","Nur Denis kann das"],password_mancante:["Prima scegli una password","Bitte zuerst ein Passwort festlegen"],troppi_tentativi:["Troppi tentativi: riprova tra 15 minuti","Zu viele Versuche: in 15 Minuten erneut versuchen"],password_sbagliata:["Password sbagliata","Falsches Passwort"],password_corta:["Almeno 6 caratteri","Mindestens 6 Zeichen"],manca_chiave_gemini:["Manca la chiave Gemini","Der Gemini-Schlüssel fehlt"],chiave_claude_non_valida:["Questa non è una chiave Claude (deve iniziare con sk-ant-)","Das ist kein Claude-Schlüssel (muss mit sk-ant- beginnen)"],chiave_claude_rifiutata:["Claude ha rifiutato la chiave","Claude hat den Schlüssel abgelehnt"],non_autorizzato:["Questo account non è autorizzato","Dieses Konto ist nicht freigeschaltet"],azione_sconosciuta:["Azione sconosciuta","Unbekannte Aktion"],bad_request:["Richiesta non valida","Ungültige Anfrage"]};
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
let undoInfo=null,savedReqs=[],persInfo=null,persPw=null,persDocs=[];
async function load(){try{const j=await api("list");docs=j.docs||[];undoInfo=j.undo||null;savedReqs=j.saved||[];persInfo=j.pers||null;renderAll()}catch(e){if(e.message!=="login")toast(e.message)}}

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
  $("#fVendorRow").classList.toggle("hide",cli);$("#fDueRow").classList.add("hide");
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
  $("#save").textContent=d._new?t("save"):t("update");$("#del").classList.toggle("hide",!!d._new||!isAdmin());$("#docOut").classList.toggle("hide",!!d._new);
  $("#save").classList.toggle("hide",!isAdmin());$$("#v-card input,#v-card select,#v-card textarea").forEach(e=>e.disabled=!isAdmin());
  $("#cardTitle").textContent=d._new?t("recognized"):t("detail");
  setType(d.type);
  const hb=$("#hist");hb.innerHTML="";$("#histBox").classList.toggle("hide",!!d._new);
  if(!d._new){
    api("history",{id:d.id}).then(j=>{if(editing!==d)return;hb.innerHTML=(j.items||[]).map(i=>`<div class="hrow"><b>${esc(whatT(i.what))}</b> · ${esc(new Date(i.when).toLocaleString(lang==="de"?"de-DE":"it-IT"))}<br><span>${esc(t("by"))} ${esc(i.who)}</span>${i.det?`<br><span>${esc(detT(i.det))}</span>`:""}</div>`).join("")||`<div class="hrow"><span>${esc(t("created"))} ${esc(t("by"))} ${esc(d.createdBy||"")}</span></div>`}).catch(()=>{});
    if(d.photoId&&!d._url)api("photo",{id:d.id}).then(j=>{if(editing!==d||!j.data)return;d._url="data:"+j.mime+";base64,"+j.data;d.isPdf=/pdf/.test(j.mime);ph.innerHTML=d.isPdf?`<a class="link" download="beleg.pdf" href="${d._url}">PDF</a>`:`<img alt="" src="${d._url}">`}).catch(()=>{});
  }
}
const WHAT={caricato:["caricato","hochgeladen"],nuovo:["nuovo","neu"],modifica:["modifica","geändert"],storno:["stornato","storniert"],importato:["importato","importiert"],"importazione avviata":["importazione avviata","Import gestartet"],"chiave gemini":["chiave Gemini","Gemini-Schlüssel"],"chiave claude":["chiave Claude","Claude-Schlüssel"],accesso:["accesso","Anmeldung"],stampa:["stampato","gedruckt"],pdf:["scaricato in PDF","als PDF geladen"],invio:["inviato","geteilt"],excel:["esportato in Excel","als Excel exportiert"],"collegamento email":["email collegata","E-Mail verbunden"]};
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
  renderUndo();
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
function renderExp(){const s=$("#expPer"),cur=s.value,ps=periods();s.innerHTML=ps.map(([v,l])=>`<option value="${v}">${esc(l)}</option>`).join("");if(cur&&ps.some(p=>p[0]===cur))s.value=cur;renderExpSmart()}
$("#expPer").onchange=renderExp;
const libs={};function lib(src){return libs[src]||(libs[src]=new Promise((ok,ko)=>{const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=()=>ko(new Error("lib"));document.head.appendChild(s)}))}
const typeName=d=>d.type==="cliente"?(d.art==="W"?"Quittung an Tätowierer":"Quittung an Kunden"):(d.type==="fattura"?"Bezahlte Rechnung":"Einkauf");
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

/* ---------- stampa, PDF, invio: singolo documento, selezione multipla, modelli ---------- */
Object.assign(IT,{oPrint:"Stampa",oPdf:"Scarica PDF",oShare:"Invia",oSelect:"Seleziona",oAll:"Tutti",oShareReady:"Pronto: tocca qui per inviare",oPreparing:"Preparo il documento…",oNoShare:"Su questo dispositivo l'invio diretto non c'è: ho scaricato il PDF.",oPick:"Seleziona almeno un documento",oSel:n=>n+(n===1?" selezionato":" selezionati"),
 mTitle:"Modelli di riepilogo",mPhotos:"Aggiungi le foto delle ricevute",mOther:"Altri export",
 mA:"A · Come Linda",mAd:"Lista per artista e spese, come i fogli a mano",mB:"B · Per la consulente",mBd:"Tutti i documenti, categorie, IVA, ELSTER (in tedesco)",mC:"C · Per artista",mCd:"Una pagina per Denis, Giova Tattoos, Waiblingen Ink",mD:"D · Una pagina",mDd:"Solo i totali del periodo",
 pDate:"Data",pType:"Tipo",pWho:"Cliente / fornitore",pNum:"Numero",pCat:"Categoria",pTot:"Totale",pRate:"IVA",pNote:"Note",pArt:"Chi",pStatus:"Stato",pOk:"confermato",pConf:"da confermare",pOrigPdf:"Il documento originale è un PDF: lo trovi nell'app o nel download.",
 pList:"Elenco documenti",pIncome:"Entrate",pExpenses:"Spese",pStudioExp:"Spese dello studio",pTotalIn:"Totale entrate",pTotalOut:"Totale spese",pDocs:"Documenti",pToConf:"Da confermare",pVat:"IVA da versare (stima)",pPeriod:"Periodo",pCreated:"Creato con l'app Ricevute il"});
Object.assign(DE,{oPrint:"Drucken",oPdf:"PDF laden",oShare:"Teilen",oSelect:"Auswählen",oAll:"Alle",oShareReady:"Fertig: hier tippen zum Teilen",oPreparing:"Dokument wird vorbereitet…",oNoShare:"Direktes Teilen geht auf diesem Gerät nicht: PDF wurde geladen.",oPick:"Mindestens einen Beleg auswählen",oSel:n=>n+" ausgewählt",
 mTitle:"Vorlagen für Übersichten",mPhotos:"Fotos der Belege anhängen",mOther:"Weitere Exporte",
 mA:"A · Wie Linda",mAd:"Liste pro Künstler und Ausgaben, wie die Handzettel",mB:"B · Für die Steuerberaterin",mBd:"Alle Belege, Kategorien, USt, ELSTER (auf Deutsch)",mC:"C · Pro Künstler",mCd:"Eine Seite für Denis, Giova Tattoos, Waiblingen Ink",mD:"D · Eine Seite",mDd:"Nur die Summen des Zeitraums",
 pDate:"Datum",pType:"Art",pWho:"Kunde / Lieferant",pNum:"Nummer",pCat:"Kategorie",pTot:"Betrag",pRate:"MwSt",pNote:"Notiz",pArt:"Wer",pStatus:"Status",pOk:"bestätigt",pConf:"zu bestätigen",pOrigPdf:"Das Original ist ein PDF: in der App oder im Download.",
 pList:"Belegliste",pIncome:"Einnahmen",pExpenses:"Ausgaben",pStudioExp:"Ausgaben des Studios",pTotalIn:"Summe Einnahmen",pTotalOut:"Summe Ausgaben",pDocs:"Belege",pToConf:"Zu bestätigen",pVat:"USt-Zahllast (Schätzung)",pPeriod:"Zeitraum",pCreated:"Erstellt mit der App Belege am"});
const GBR="Denis Cicala & Linda Salihu-Cicala GbR · Lange Straße 10 · 71332 Waiblingen";
const whoOf=d=>d.type==="cliente"?(d.client||t("tCli")):(d.vendor||t(d.type==="fattura"?"tFat":"tAcq"));
const typeOf=d=>t(d.type==="cliente"?"tCli":d.type==="fattura"?"tFat":"tAcq");
const safe=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^\w\-]+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").slice(0,40);
const photoCache=new Map();
async function photoOf(d){if(!d.photoId)return null;if(photoCache.has(d.id))return photoCache.get(d.id);const j=await api("photo",{id:d.id});const r=j&&j.data?{mime:j.mime,url:"data:"+j.mime+";base64,"+j.data,b64:j.data}:null;photoCache.set(d.id,r);return r}
const imgSize=url=>new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok({w:i.width,h:i.height});i.onerror=ko;i.src=url});
/* blocchi neutri: {h1},{h2},{p},{kv:[[k,v]]},{table:{head,rows,foot,num:[indici colonne numeriche]}},{img:{url,cap}},{pb:1} */
function docKV(d){return[[t("pDate"),fmtDate(d.date)],[t("pType"),typeOf(d)],[t("pWho"),whoOf(d)],[t("pNum"),d.number||""],[t("pCat"),CATS[d.cat]?.[L()]||""],d.type==="cliente"&&d.art?[t("pArt"),({D:"Denis",G:"Giova Tattoos",W:"Waiblingen Ink"})[d.art]||d.art]:null,[t("pTot"),eur(d.total)],[t("pRate"),d.rate===""||d.rate==null?"":d.rate+" %"],[t("pStatus"),d.status==="confirm"?t("pConf"):t("pOk")],d.note?[t("pNote"),d.note]:null].filter(x=>x&&x[1]!=="")}
async function docBlocks(d,first){const b=[];if(!first)b.push({pb:1});b.push({h2:whoOf(d)+" · "+eur(d.total)},{kv:docKV(d)});try{const p=await photoOf(d);if(p&&!/pdf/.test(p.mime))b.push({img:{url:p.url}});else if(p)b.push({p:t("pOrigPdf")})}catch(e){}return b}
function head(title,sub){return[{h1:"Waiblingen Ink"},{p:GBR},{h2:title},sub?{p:sub}:null].filter(Boolean)}
function listTable(list){return{table:{head:[t("pDate"),t("pType"),t("pWho"),t("pNum"),t("pTot")],rows:list.map(d=>[fmtDate(d.date),typeOf(d),whoOf(d)+(d.status==="confirm"?" ●":""),d.number||"",(d.type==="cliente"?"+":"")+eur(d.total)]),foot:[["","","","",""]].slice(0,0),num:[4]}}}
function htmlOf(blocks){return blocks.map(b=>b.pb?'<div class="pb"></div>':b.h1?`<h1 style="font-size:18pt;margin:0">${esc(b.h1)}</h1>`:b.h2?`<h3>${esc(b.h2)}</h3>`:b.h3?`<h4>${esc(b.h3)}</h4>`:b.p?`<p style="margin:2px 0;color:#555">${esc(b.p)}</p>`:b.kv?`<table>${b.kv.map(([k,v])=>`<tr><th style="width:35%">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</table>`:b.table?`<table><tr>${b.table.head.map((x,i)=>`<th class="${(b.table.num||[]).includes(i)?"m":""}">${esc(x)}</th>`).join("")}</tr>${b.table.rows.map(r=>`<tr>${r.map((x,i)=>`<td class="${(b.table.num||[]).includes(i)?"m":""}">${esc(x)}</td>`).join("")}</tr>`).join("")}${(b.table.foot||[]).map(r=>`<tr>${r.map((x,i)=>`<th class="${(b.table.num||[]).includes(i)?"m":""}">${esc(x)}</th>`).join("")}</tr>`).join("")}</table>`:b.img?`<img src="${b.img.url}" alt="">`:"").join("")}
const pdfTxt=s=>String(s??"").replace(/\u2212/g,"-").replace(/\u25CF/g,"*").replace(/[\u2014\u2013]/g,"-").replace(/\u202F/g," ");
const pdfClean=v=>Array.isArray(v)?v.map(pdfClean):v&&typeof v==="object"?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,k==="url"?x:pdfClean(x)])):typeof v==="string"?pdfTxt(v):v;
async function pdfOf(blocks){blocks=pdfClean(blocks);
  await lib("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");await lib("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
  const doc=new window.jspdf.jsPDF({unit:"mm",format:"a4"}),blue=[0,87,255],W=182,PH=283;let y=14;
  const room=n=>{if(y+n>PH){doc.addPage();y=14}};
  const txt=(s,size,bold,color)=>{doc.setFontSize(size);doc.setFont("helvetica",bold?"bold":"normal");doc.setTextColor(...(color||[0,0,0]));const ls=doc.splitTextToSize(String(s),W);room(ls.length*size*0.42+2);doc.text(ls,14,y+size*0.35);y+=ls.length*size*0.42+2;doc.setTextColor(0)};
  for(const b of blocks){
    if(b.pb){doc.addPage();y=14}
    else if(b.h1)txt(b.h1,16,true);else if(b.h2)txt(b.h2,12,true);else if(b.h3)txt(b.h3,10.5,true);else if(b.p)txt(b.p,9,false,[90,90,90]);
    else if(b.kv){doc.autoTable({startY:y,body:b.kv,theme:"plain",styles:{fontSize:9.5,cellPadding:1.2},columnStyles:{0:{fontStyle:"bold",cellWidth:45}}});y=doc.lastAutoTable.finalY+3}
    else if(b.table){const cs={};(b.table.num||[]).forEach(i=>cs[i]={halign:"right"});doc.autoTable({startY:y,head:[b.table.head],body:b.table.rows,foot:b.table.foot&&b.table.foot.length?b.table.foot:undefined,headStyles:{fillColor:blue},footStyles:{fillColor:[241,245,249],textColor:20},styles:{fontSize:8.5,cellPadding:1.4},columnStyles:cs,showFoot:"lastPage",didParseCell:c=>{if((b.table.num||[]).includes(c.column.index))c.cell.styles.halign="right"}});y=doc.lastAutoTable.finalY+4}
    else if(b.img){try{const s=await imgSize(b.img.url);const k=Math.min(W/s.w,(PH-y-4)/s.h,1);if(s.h*k<60){doc.addPage();y=14}const k2=Math.min(W/s.w,(PH-y-4)/s.h);doc.addImage(b.img.url,/png/.test(b.img.url.slice(5,20))?"PNG":"JPEG",14,y,s.w*k2,s.h*k2);y+=s.h*k2+4}catch(e){}}
  }
  const n=doc.getNumberOfPages();for(let i=1;i<=n;i++){doc.setPage(i);doc.setFontSize(7.5);doc.setTextColor(130);doc.text(t("pCreated")+" "+new Date().toLocaleString(lang==="de"?"de-DE":"it-IT")+(user?" · "+user.email:"")+" · "+i+"/"+n,14,292)}
  return doc.output("blob");
}
function printHTML(html){const pa=$("#printArea");pa.innerHTML=html;const imgs=[...pa.querySelectorAll("img")];Promise.all(imgs.map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r}))).then(()=>{window.print();setTimeout(()=>pa.innerHTML="",1500)})}
async function shareFile(blob,name){const f=new File([blob],name,{type:"application/pdf"});
  if(!(navigator.canShare&&navigator.canShare({files:[f]}))){dl(name,blob);toast(t("oNoShare"));return}
  try{await navigator.share({files:[f],title:name})}catch(e){if(e&&e.name==="AbortError")return;const b=$("#shareReady");b.classList.remove("hide");b.onclick=async()=>{b.classList.add("hide");try{await navigator.share({files:[f],title:name})}catch(_){}}}}
let outBusy=false;
async function output(kind,blocksFn,name,ids,det){
  if(outBusy)return;outBusy=true;toast(t("oPreparing"));
  try{const blocks=await blocksFn();
    if(kind==="print")printHTML(htmlOf(blocks));
    else{const blob=await pdfOf(blocks);if(kind==="share")await shareFile(blob,name);else dl(name,blob)}
    api("track",{what:kind==="print"?"stampa":kind==="share"?"invio":"pdf",ids:ids||[],det:det||name}).catch(()=>{});
  }catch(e){toast(errText(e.message))}finally{outBusy=false}
}
/* singolo documento */
const docName=d=>"Beleg_"+(d.date||"")+"_"+safe(whoOf(d))+(d.number?"_"+safe(d.number):"")+".pdf";
function docOut(kind){const d=editing;if(!d||d._new)return;
  if(kind!=="print"&&d.photoId&&/pdf/.test(d.mime||"")){(async()=>{try{const p=await photoOf(d);const bytes=Uint8Array.from(atob(p.b64),c=>c.charCodeAt(0));const blob=new Blob([bytes],{type:"application/pdf"});if(kind==="share")await shareFile(blob,docName(d));else dl(docName(d),blob);api("track",{what:kind==="share"?"invio":"pdf",ids:[d.id],det:docName(d)}).catch(()=>{})}catch(e){toast(errText(e.message))}})();return}
  output(kind,async()=>head(typeOf(d)+" · "+fmtDate(d.date)).concat(await docBlocks(d,true)),docName(d),[d.id],docName(d));
}
$("#dPrint").onclick=()=>docOut("print");$("#dPdf").onclick=()=>docOut("pdf");$("#dShare").onclick=()=>docOut("share");
/* selezione multipla in Archivio e Cerca */
const picked=new Set();let selMode=false;
function setSel(on){selMode=on;if(!on)picked.clear();document.body.classList.toggle("selmode",on);$("#selBar").classList.toggle("hide",!on);paintSel()}
function paintSel(){$$(".row[data-open]").forEach(r=>r.classList.toggle("picked",picked.has(r.dataset.open)));$("#selN").textContent=t("oSel")(picked.size)}
document.addEventListener("click",e=>{if(!selMode)return;const r=e.target.closest("#archList [data-open],#resList [data-open]");if(!r)return;e.stopImmediatePropagation();e.preventDefault();const id=r.dataset.open;picked.has(id)?picked.delete(id):picked.add(id);paintSel()},true);
$$(".selBtn").forEach(b=>b.onclick=()=>setSel(!selMode));
$("#sCancel").onclick=()=>setSel(false);
$("#sAll").onclick=()=>{const box=$("#v-arch").classList.contains("hide")?"#resList":"#archList";$$(box+" [data-open]").forEach(r=>picked.add(r.dataset.open));paintSel()};
function selOut(kind){const list=docs.filter(d=>picked.has(d.id)).sort((a,b)=>String(a.date).localeCompare(String(b.date)));if(!list.length)return toast(t("oPick"));
  const name="Belege_"+list.length+"_"+todayISO()+".pdf";
  output(kind,async()=>{let b=head(t("pList")+" · "+list.length+" "+t("pDocs")).concat([listTable(list)]);const inn=list.filter(d=>d.type==="cliente"),out=list.filter(d=>d.type!=="cliente");b.push({kv:[[t("pTotalIn"),eur(sumOf(inn))],[t("pTotalOut"),eur(sumOf(out))]]});for(const d of list)b=b.concat(await docBlocks(d,false));return b},name,list.map(d=>d.id),name)}
$("#sPrint").onclick=()=>selOut("print");$("#sPdf").onclick=()=>selOut("pdf");$("#sShare").onclick=()=>selOut("share");
const _show=show;show=function(v){if(selMode&&v!=="arch"&&v!=="home")setSel(false);_show(v);if(selMode)paintSel()};
/* modelli A, B, C, D per il periodo dell'Export */
let model="A";
function periodData(){const p=$("#expPer").value,live=docs.filter(d=>!d.priv),inP=d=>inPer(d,p),byDate=(x,y)=>String(x.date).localeCompare(String(y.date));
  const cli=a=>live.filter(d=>d.type==="cliente"&&d.art===a&&inP(d)).sort(byDate);
  const pays=live.filter(d=>isGiovaPay(d)&&inPer({date:prevMon(String(d.date||"").slice(0,7))+"-15"},p)).sort(byDate);
  const exp=live.filter(d=>d.type!=="cliente"&&!isGiovaPay(d)&&inP(d)).sort(byDate);
  const all=live.filter(inP).sort(byDate);
  return{p,label:perLabel(),D:cli("D"),G:cli("G"),W:cli("W"),noArt:live.filter(d=>d.type==="cliente"&&!["D","G","W"].includes(d.art)&&inP(d)),pays,exp,all}}
const cliRows=l=>l.map(d=>[fmtDate(d.date),(d.client||"")+(d.cat==="anzahlung"?" (Anz.)":"")+(d.status==="confirm"?" ●":""),d.number||"",eur(d.total)]);
function artTable(title,l,extra){return[{h3:title},{table:{head:[t("pDate"),t("pWho"),t("pNum"),t("pTot")],rows:cliRows(l),foot:[["",t("sTot")+" · "+l.length,"",eur(sumOf(l))]].concat(extra||[]),num:[3]}}]}
function giovaExtra(P){const g=sumOf(P.G);return P.pays.length?P.pays.map(p=>["",t("sGiovaPaid"),p.number||"","− "+eur(p.total)]).concat([["",t("sRest"),"",eur(g-sumOf(P.pays))]]):[["",t("sNoPay").split(":")[0],"",""]]}
function expTable(l){return[{h3:t("pStudioExp")},{table:{head:[t("pDate"),t("pWho"),t("pCat"),t("pTot")],rows:l.map(d=>[fmtDate(d.date),(d.vendor||"")+(d.status==="confirm"?" ●":""),CATS[d.cat]?.[L()]||"",eur(d.total)]),foot:[["",t("sTot")+" · "+l.length,"",eur(sumOf(l))]],num:[3]}}]}
function totalsKV(P){const dI=sumOf(P.D),gI=sumOf(P.G),gP=sumOf(P.pays),w=sumOf(P.W),ex=sumOf(P.exp),e=elster(P.all);const saldo=dI+gI-gP+w-ex;
  return[[t("sumD"),eur(dI)],[t("sumG"),eur(gI)],[t("sGiovaPaid"),P.pays.length?"− "+eur(gP):"—"],[t("sRent"),eur(w)],[t("pStudioExp"),"− "+eur(ex)],[t("sSaldo"),eur(saldo)],[t("pVat"),eur(e.k83)],[t("pDocs"),String(P.all.length)],[t("pToConf"),String(P.all.filter(d=>d.status==="confirm").length)]]}
function modelBlocks(m,P){const sub=t("pPeriod")+": "+P.label;
  if(m==="A")return head(t("mA").replace(/^A · /,"")+" · "+P.label).concat(artTable(t("sumD"),P.D),artTable(t("sumG"),P.G,giovaExtra(P)),P.W.length?artTable(t("sRent"),P.W):[],P.noArt.length?artTable("?",P.noArt):[],expTable(P.exp));
  if(m==="B"){const rows=rowsDE(P.all);const cats={};P.all.forEach(d=>{const k=(d.type==="cliente"?"Einnahmen · ":"Ausgaben · ")+(CATS[d.cat]?.[1]||d.cat);const r=d.rate===""||d.rate==null?null:+d.rate,tot=+d.total||0;cats[k]=cats[k]||[0,0,0];cats[k][0]+=tot;if(r===19||r===7){cats[k][1]+=tot/(1+r/100);cats[k][2]+=tot-tot/(1+r/100)}});const e=elster(P.all);const de=n=>(Number(n)||0).toLocaleString("de-DE",{style:"currency",currency:"EUR"});
    return[{h1:"Waiblingen Ink"},{p:GBR},{h2:"Belege für die Buchhaltung · "+P.label},{table:{head:["Datum","Art","Kunde / Lieferant","Nr.","Kategorie","Brutto","MwSt %"],rows:rows.map(r=>[r.Datum,r.Art,r["Kunde / Lieferant"],r.Belegnummer,r.Kategorie,r.Brutto===""?"":de(r.Brutto),r["MwSt %"]]),num:[5]}},{h3:"Summen nach Kategorie"},{table:{head:["Kategorie","Brutto","Netto","MwSt"],rows:Object.keys(cats).sort().map(k=>[k,de(cats[k][0]),de(cats[k][1]),de(cats[k][2])]),num:[1,2,3]}},{h3:"Umsatzsteuer-Voranmeldung (Schätzung)"},{table:{head:["Kz","","Betrag"],rows:[["81","Umsätze 19 % netto",de(e.k81)],["86","Umsätze 7 % netto",de(e.k86)],["66","Vorsteuer",de(e.k66)],["83","Vorauszahlung",de(e.k83)]],num:[2]}},{p:"Schätzung. "+e.noRate+" Einkäufe ohne MwSt-Satz nicht berücksichtigt. Private Belege ausgeschlossen."}]}
  if(m==="C")return head(t("mC").replace(/^C · /,"")+" · "+P.label).concat(artTable(t("sumD"),P.D),[{pb:1}],artTable(t("sumG"),P.G,giovaExtra(P)),[{pb:1},{h3:t("sumW")},{kv:totalsKV(P)}],P.W.length?artTable(t("sRent"),P.W):[],expTable(P.exp));
  return head(t("mD").replace(/^D · /,"")+" · "+P.label,sub).concat([{kv:totalsKV(P)},{p:t("sNote")}]);
}
async function modelAll(){const P=periodData();let b=modelBlocks(model,P);if($("#mPhotos").checked){const l=model==="B"?P.all:P.all;for(const d of l)if(d.photoId)b=b.concat(await docBlocks(d,false))}return b}
function renderModels(){if(!$("#models"))return;$("#models").innerHTML=["A","B","C","D"].map(k=>`<button type="button" class="model ${model===k?"on":""}" data-m="${k}"><b>${esc(t("m"+k))}</b><small>${esc(t("m"+k+"d"))}</small></button>`).join("");$("#mPrev").innerHTML=docs.length?htmlOf(modelBlocks(model,periodData())):""}
document.addEventListener("click",e=>{const b=e.target.closest("#models [data-m]");if(b){model=b.dataset.m;renderModels()}});
const mName=()=>"Waiblingen-Ink_Modell-"+model+"_"+($("#expPer").value||"")+".pdf";
$("#mPrint").onclick=()=>output("print",modelAll,mName(),[],t("m"+model)+" · "+perLabel());
$("#mPdf").onclick=()=>output("pdf",modelAll,mName(),[],t("m"+model)+" · "+perLabel());
$("#mShare").onclick=()=>output("share",modelAll,mName(),[],t("m"+model)+" · "+perLabel());
const _renderExp=renderExp;renderExp=function(){_renderExp();renderModels()};
$("#expPer").onchange=renderExp;

/* ---------- annulla / ripeti: ultime 24 ore, operazioni di tutti gli amministratori ---------- */
Object.assign(IT,{uUndo:"Annulla",uRedo:"Ripeti",uNone:"niente da annullare",uNoRedo:"niente da ripetere",uDone:"Annullato: ",uRedone:"Ripristinato: ",uBy:"di "});
Object.assign(DE,{uUndo:"Rückgängig",uRedo:"Wiederholen",uNone:"nichts rückgängig zu machen",uNoRedo:"nichts zu wiederholen",uDone:"Rückgängig gemacht: ",uRedone:"Wiederhergestellt: ",uBy:"von "});
const uDescr=x=>{if(!x)return"";const dt=new Date(x.when);const time=dt.toLocaleTimeString(lang==="de"?"de-DE":"it-IT",{hour:"2-digit",minute:"2-digit"});const d=String(x.descr||"").replace(/^modifica/,lang==="de"?"Änderung":"modifica").replace(/^nuovo/,lang==="de"?"neu":"nuovo").replace(/^storno/,lang==="de"?"Storno":"storno");return d+" · "+String(x.who||"").split("@")[0]+" "+time};
function renderUndo(){const b=$("#undoBar");if(!b)return;b.classList.toggle("hide",!isAdmin());const u=undoInfo&&undoInfo.undo,r=undoInfo&&undoInfo.redo;
  $("#undoBtn").disabled=!u;$("#redoBtn").disabled=!r;$("#undoTxt").textContent=u?uDescr(u):t("uNone");$("#redoTxt").textContent=r?uDescr(r):t("uNoRedo")}
let undoBusy=false;
async function doUndo(redo){if(undoBusy)return;undoBusy=true;$("#undoBtn").disabled=$("#redoBtn").disabled=true;
  try{const j=await api(redo?"redo":"undo");if(j.ok)toast(t(redo?"uRedone":"uDone")+uDescr({descr:j.descr,who:"",when:new Date()}).split(" · ").slice(0,-1).join(" · "));await load()}catch(e){toast(e.message)}finally{undoBusy=false;renderUndo()}}
$("#undoBtn").onclick=()=>doUndo(false);$("#redoBtn").onclick=()=>doUndo(true);

/* ---------- Export intelligente: numeri, entrate per artista, controllo per la consulente, stima IVA a parte ---------- */
Object.assign(IT,{eSaldo:"Saldo",eBarsT:"Da dove arrivano le entrate",eReadyT:"Pronto per la consulente?",rConf:"Documenti da confermare",rDup:"Possibili doppioni",rNoRate:"Acquisti senza aliquota IVA",rGio:"Ricevuta di Giovanni",rNone:"nessuno ✓",rArr:"arrivata ✓",rMiss:"non ancora arrivata",rNoG:"nessun lavoro di Giova",rCheck:"Controlla ›",tVat:"Stima IVA (ELSTER)",tPdfPh:"PDF con foto",elTitle:"Stima IVA",elSub:"Umsatzsteuer-Voranmeldung, solo una stima",elClose:"Chiudi",
 xT:(n,l)=>"Esporta "+(n===1?"questo documento":"questi "+n+" documenti")+(l?" ("+l+")":""),xPh:"Con le foto delle ricevute",oEmail:"Email",oMailBody:"Il PDF è stato scaricato: allegalo a questa email.",rentW:"Platzmiete (W)"});
Object.assign(DE,{eSaldo:"Saldo",eBarsT:"Woher die Einnahmen kommen",eReadyT:"Bereit für die Steuerberaterin?",rConf:"Belege zu bestätigen",rDup:"Mögliche Duplikate",rNoRate:"Einkäufe ohne MwSt-Satz",rGio:"Rechnung von Giovanni",rNone:"keine ✓",rArr:"da ✓",rMiss:"fehlt noch",rNoG:"keine Arbeiten von Giova",rCheck:"Prüfen ›",tVat:"USt-Schätzung (ELSTER)",tPdfPh:"PDF mit Fotos",elTitle:"USt-Schätzung",elSub:"Umsatzsteuer-Voranmeldung, nur eine Schätzung",elClose:"Schließen",
 xT:(n,l)=>(n===1?"Diesen Beleg":"Diese "+n+" Belege")+" exportieren"+(l?" ("+l+")":""),xPh:"Mit Fotos der Belege",oEmail:"E-Mail",oMailBody:"Das PDF wurde geladen: bitte an diese E-Mail anhängen.",rentW:"Platzmiete (W)"});
function renderExpSmart(){
  const p=$("#expPer").value,list=perDocs(),all=docs.filter(d=>inPer(d,p)),e=elster(list);
  $("#eN").textContent=list.length;$("#eIn").textContent=eur(e.inn);$("#eOut").textContent=eur(e.out);$("#eSaldo").textContent=eur(e.inn-e.out);$("#eSaldo").style.color=e.inn-e.out>=0?"var(--green)":"#B91C1C";
  $("#k81").textContent=eur(e.k81);$("#k86").textContent=eur(e.k86);$("#k66").textContent=eur(e.k66);$("#k83").textContent=eur(e.k83);$("#elPer").textContent=perLabel();
  const by=a=>sumOf(list.filter(d=>d.type==="cliente"&&d.art===a)),rows=[[t("sumG"),by("G")],[t("sumD"),by("D")],[t("rentW"),by("W")]].sort((x,y)=>y[1]-x[1]),mx=Math.max(1,...rows.map(r=>r[1]));
  $("#eBars").innerHTML=rows.map(([l,v])=>`<div class="ebar"><span>${esc(l)}</span><i style="width:${Math.max(2,Math.round(v/mx*100))}%;${v?"":"background:#cbd5e1"}"></i><b>${esc(eur(v))}</b></div>`).join("");
  const conf=all.filter(d=>d.status==="confirm").length,dup=all.filter(d=>DUPS.has(d.id)).length;
  const months=[...new Set(list.filter(d=>d.type==="cliente"&&d.art==="G").map(d=>String(d.date).slice(0,7)))].sort();
  const missing=months.filter(m=>!docs.some(d=>!d.priv&&isGiovaPay(d)&&prevMon(String(d.date||"").slice(0,7))===m));
  const gio=!months.length?`<span class="ok">${esc(t("rNoG"))}</span>`:missing.length?`<span class="ko">${esc(t("rMiss"))}${months.length>1?" ("+missing.map(m=>mon(m)).join(", ")+")":""}</span>`:`<span class="ok">${esc(t("rArr"))}</span>`;
  $("#eReady").innerHTML=`<button class="ck ${conf?"go":""}" data-go="conf"><span>${esc(t("rConf"))}</span>${conf?`<span class="ko">${conf} · ${esc(t("rCheck"))}</span>`:`<span class="ok">${esc(t("rNone"))}</span>`}</button>`
   +`<button class="ck ${dup?"go":""}" data-go="dup"><span>${esc(t("rDup"))}</span>${dup?`<span class="ko">${dup} · ${esc(t("rCheck"))}</span>`:`<span class="ok">${esc(t("rNone"))}</span>`}</button>`
   +`<div class="ck"><span>${esc(t("rNoRate"))}</span>${e.noRate?`<span class="ko">${e.noRate}</span>`:`<span class="ok">${esc(t("rNone"))}</span>`}</div>`
   +`<div class="ck"><span>${esc(t("rGio"))}</span>${gio}</div>`;
  renderModels();
}
document.addEventListener("click",e=>{const b=e.target.closest("#eReady [data-go]");if(!b||!b.classList.contains("go"))return;const p=$("#expPer").value;catF=b.dataset.go==="conf"?"__conf":"__dup";$("#archMonth").value=p.includes("Q")?"":p;$$("#archChips button").forEach(x=>x.classList.toggle("on",x.dataset.f==="all"));show("arch")});
function openEl(on){$("#elSheet").classList.toggle("hide",!on)}
$("#xEl").onclick=()=>openEl(true);$("#elClose").onclick=()=>openEl(false);$("#elDim").onclick=()=>openEl(false);
const elBlocks=async()=>{const e=elster(perDocs());return head(t("elTitle")+" · "+perLabel(),t("elSub")).concat([{kv:[[t("k81"),eur(e.k81)],[t("k86"),eur(e.k86)],[t("k66"),eur(e.k66)],[t("k83"),eur(e.k83)]]},{p:t("elsterNote")}])};
const elName=()=>"Waiblingen-Ink_USt-Schaetzung_"+($("#expPer").value||"")+".pdf";
$("#elPrint").onclick=()=>output("print",elBlocks,elName(),[],t("elTitle")+" · "+perLabel());
$("#elPdf").onclick=()=>output("pdf",elBlocks,elName(),[],t("elTitle")+" · "+perLabel());
$("#elShare").onclick=()=>output("share",elBlocks,elName(),[],t("elTitle")+" · "+perLabel());

/* ---------- Archivio e Cerca: esporta esattamente quello che vedi ---------- */
const xPhotos={archX:true,resX:false,agX:false};
function shownDocs(listSel){return [...new Set($$(listSel+" [data-open]").map(r=>r.dataset.open))].map(id=>docs.find(d=>d.id===id)).filter(Boolean)}
const XL={archX:"#archList",resX:"#resList",agX:"#agList"};
function viewLabel(box){if(box==="agX")return agTitle;if(box==="resX")return "“"+$("#q").value.trim()+"”";const parts=[];const f=$("#archChips .on");if(f&&f.dataset.f!=="all")parts.push(f.textContent.trim());const c=$("#catChips .on");if(c&&c.dataset.c)parts.push(c.textContent.trim());const m=$("#archMonth").value;if(m)parts.push(mon(m));return parts.join(" · ")}
function renderXbar(box,listSel){const el=$("#"+box);if(!el)return;const n=shownDocs(listSel).length;el.classList.toggle("hide",!n);if(!n)return;
  el.innerHTML=`<div class="xt">${esc(t("xT")(n,viewLabel(box)))}</div><div class="grid3"><button class="primary ibtn" data-x="print"><i>🖨</i><span>${esc(t("oPrint"))}</span></button><button class="secondary ibtn" data-x="pdf"><i>⬇</i><span>PDF</span></button><button class="secondary ibtn" data-x="share"><i>↗</i><span>${esc(t("oShare"))}</span></button></div><div class="grid2"><button class="secondary ibtn" data-x="xls"><i>▦</i><span>Excel</span></button><button class="secondary ibtn" data-x="mail"><i>✉</i><span>${esc(t("oEmail"))}</span></button></div><label class="tg"><input type="checkbox" data-ph ${xPhotos[box]?"checked":""}> ${esc(t("xPh"))}</label>`}
function renderXbars(){renderXbar("archX","#archList");renderXbar("resX","#resList")}
const _renderAll2=renderAll;renderAll=function(){_renderAll2();renderXbars()};
const _runSearch=runSearch;runSearch=function(){_runSearch();renderXbars()};$("#q").oninput=runSearch;
document.addEventListener("change",e=>{const c=e.target.closest(".xbar [data-ph]");if(c)xPhotos[c.closest(".xbar").id]=c.checked});
function listBlocks(list,title,photos){return async()=>{let b=head(title).concat([listTable(list)]);const inn=list.filter(d=>d.type==="cliente"),out=list.filter(d=>d.type!=="cliente");b.push({kv:[[t("pTotalIn"),eur(sumOf(inn))],[t("pTotalOut"),eur(sumOf(out))],[t("pDocs"),String(list.length)]]});if(photos)for(const d of list)b=b.concat(await docBlocks(d,false));return b}}
document.addEventListener("click",async e=>{const b=e.target.closest(".xbar [data-x]");if(!b)return;const box=b.closest(".xbar").id,list=shownDocs(XL[box]).sort((x,y)=>String(x.date).localeCompare(String(y.date)));if(!list.length)return;
  const lab=viewLabel(box),title=t("pList")+(lab?" · "+lab:""),name="Belege_"+(safe(lab)||"Auswahl")+"_"+todayISO()+".pdf",ids=list.map(d=>d.id),k=b.dataset.x;
  if(k==="xls"){try{await exportXls(list,name.replace(/\.pdf$/,".xlsx"),null);api("track",{what:"excel",ids,det:name}).catch(()=>{})}catch(err){toast(errText(err.message))}return}
  if(k==="mail"){const f=async()=>{const bl=await listBlocks(list,title,xPhotos[box])();const blob=await pdfOf(bl);const file=new File([blob],name,{type:"application/pdf"});
      if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:name})}catch(er){if(er&&er.name!=="AbortError"){const r=$("#shareReady");r.classList.remove("hide");r.onclick=async()=>{r.classList.add("hide");try{await navigator.share({files:[file],title:name})}catch(_){}}}}}
      else{dl(name,blob);location.href="mailto:?subject="+encodeURIComponent("Waiblingen Ink · "+title)+"&body="+encodeURIComponent(t("oMailBody"))}
      api("track",{what:"invio",ids,det:"Email · "+name}).catch(()=>{})};
    if(outBusy)return;outBusy=true;toast(t("oPreparing"));try{await f()}catch(err){toast(errText(err.message))}finally{outBusy=false}return}
  output(k,listBlocks(list,title,xPhotos[box]),name,ids,name)});


/* ---------- Fai per me (solo admin) ---------- */
let agMode=false,agTitle="",agState=null;
const L2=(it,de)=>lang==="de"?de:it;
const ART_N={D:"Denis",G:"Giova Tattoos",W:"Waiblingen Ink"};
const WD=()=>L2(["lunedì","martedì","mercoledì","giovedì","venerdì","sabato","domenica"],["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"]);
const wdOf=s=>{const g=new Date(String(s).slice(0,10)+"T12:00:00").getDay();return g===0?7:g};
function agFilter(f){const tx=f.text?norm(f.text):"";
  return docs.filter(d=>{if(d.deleted)return false;const ds=String(d.date||"").slice(0,10);
    if(f.from&&ds<f.from)return false;if(f.to&&ds>f.to)return false;
    if(f.weekdays&&f.weekdays.length&&!f.weekdays.includes(wdOf(ds)))return false;
    if(f.types&&f.types.length&&!f.types.includes(d.type))return false;
    if(f.arts&&f.arts.length&&!f.arts.includes(d.art))return false;
    if(f.cats&&f.cats.length&&!f.cats.includes(d.cat))return false;
    if(tx&&!norm([d.client,d.vendor,d.number,d.note].join(" ")).includes(tx))return false;
    if(f.min!=null&&!(+d.total>=f.min))return false;if(f.max!=null&&!(+d.total<=f.max))return false;
    if(f.status&&(f.status==="confirm")!==(d.status==="confirm"))return false;
    if(f.priv===true){if(!d.priv)return false}else if(f.priv===false||f.priv==null){if(d.priv)return false}
    return true}).sort((a,b)=>String(a.date).localeCompare(String(b.date)))}
function agChipsOf(f){const c=[],typeN={cliente:t("tCli"),acquisto:t("tAcq"),fattura:t("tFat")};
  if(f.from||f.to)c.push(["date",null,f.from&&f.to?fmtDate(f.from)+" → "+fmtDate(f.to):f.from?L2("dal ","ab ")+fmtDate(f.from):L2("fino al ","bis ")+fmtDate(f.to)]);
  (f.weekdays||[]).forEach(w=>c.push(["weekdays",w,WD()[w-1]]));
  (f.types||[]).forEach(x=>c.push(["types",x,f.types.length===1&&x==="cliente"&&!(f.cats||[]).length?L2("Tatuaggi","Tattoos"):typeN[x]]));
  (f.arts||[]).forEach(x=>c.push(["arts",x,ART_N[x]]));
  (f.cats||[]).forEach(x=>c.push(["cats",x,CATS[x]?CATS[x][L()]:x]));
  if(f.text)c.push(["text",null,"“"+f.text+"”"]);
  if(f.min!=null)c.push(["min",null,"≥ "+eur(f.min)]);if(f.max!=null)c.push(["max",null,"≤ "+eur(f.max)]);
  if(f.status)c.push(["status",null,f.status==="confirm"?t("toConfirm"):L2("confermati","bestätigt")]);
  if(f.priv===true)c.push(["priv",null,L2("privati","privat")]);
  if(agState&&agState.item)c.unshift(["item",null,"🛒 "+agState.item.name]);
  return c}
function agDrop(f,k,v){if(k==="item"){agState.item=null;agState.ask="list";return f}f=JSON.parse(JSON.stringify(f));if(k==="date"){f.from=null;f.to=null}else if(Array.isArray(f[k]))f[k]=f[k].filter(x=>x!==v);else f[k]=null;return f}
const fldName=k=>({cat:L2("Categoria","Kategorie"),rate:L2("IVA","MwSt"),status:"Status",priv:L2("Privato","Privat"),art:L2("Chi","Wer")}[k]);
const fldVal=(k,v)=>k==="cat"?(CATS[v]?CATS[v][L()]:v||"–"):k==="rate"?(v==null||v===""?"–":v+" %"):k==="status"?(v==="confirm"?t("toConfirm"):L2("confermato","bestätigt")):k==="priv"?(v?L2("sì","ja"):L2("no","nein")):k==="art"?(ART_N[v]||v||"–"):String(v);
const same=(k,a,b)=>k==="priv"?!!a===!!b:k==="rate"?Number(a)===Number(b)&&a!==""&&a!=null:String(a??"")===String(b??"");
function agHead(q){return `<div class="agreq"><small>${esc(L2("La tua richiesta","Dein Auftrag"))}</small>${esc(q)}</div>`}
function agChipsHTML(f){const c=agChipsOf(f);return c.length?`<p class="aggot">${esc(L2("Ho capito così (tocca per togliere):","So habe ich es verstanden (antippen zum Entfernen):"))}</p><div class="agchips">${c.map((x,i)=>`<button type="button" data-agdrop="${i}">${esc(x[2])}</button>`).join("")}</div>`:""}
function agRender(){const st=agState,box=$("#askOut");if(!st)return;const f=st.filter,list=agFilter(f);agTitle=st.title||st.q;
  if(st.kind==="answer"){box.innerHTML=agHead(st.q)+`<div class="list" style="padding:14px"><b style="font-size:16px;line-height:1.4">${esc(st.answer||"")}</b></div>`;return}
  let h=agHead(st.q)+agChipsHTML(f);
  if(st.kind==="edit"){const keys=Object.keys(st.set||{});const ch=list.map(d=>({d,diff:keys.filter(k=>!same(k,d[k],st.set[k]))}));const todo=ch.filter(x=>x.diff.length);st.ids=todo.map(x=>x.d.id);
    const what=keys.map(k=>fldName(k)+" → "+fldVal(k,st.set[k])).join(" · ");
    h+=`<div class="agch"><div class="h"><span>${esc(st.title||"")}</span><small>${esc(what)}</small></div>`+(list.length?ch.slice(0,150).map(x=>{const d=x.d,ti=d.type==="cliente"?(d.client||t("tCli")):(d.vendor||t(d.type==="fattura"?"tFat":"tAcq"));
      return `<div class="cr"><div class="t"><span>${esc(fmtDate(d.date))} · ${esc(ti)}</span><span class="mono">${esc(eur(d.total))}</span></div><div class="c">${x.diff.length?x.diff.map(k=>`${esc(fldName(k))}: <span class="old">${esc(fldVal(k,d[k]))}</span> → <span class="new">${esc(fldVal(k,st.set[k]))}</span>`).join("<br>"):`<span class="same">${esc(L2("già a posto, non lo tocco","schon richtig, bleibt so"))}</span>`}</div></div>`}).join(""):`<div class="cr">${esc(t("noRes"))}</div>`)+`</div>`;
    if(todo.length>150)h+=`<div class="agwarn">${esc(L2("Troppi documenti: ne cambio al massimo 150 per volta. Restringi la richiesta.","Zu viele Belege: höchstens 150 auf einmal. Bitte eingrenzen."))}</div>`;
    else if(todo.length)h+=`<div class="agwarn">${esc(L2("Non ho ancora cambiato niente. Se confermi e poi ci ripensi, c'è il tasto Annulla in Home per 24 ore.","Noch nichts geändert. Wenn du bestätigst und es dir anders überlegst: Rückgängig auf der Startseite, 24 Stunden lang."))}</div><div class="agcta"><button type="button" class="ok" id="agOk">✓ ${esc(L2("Conferma","Bestätigen"))} (${todo.length})</button><button type="button" id="agNo">${esc(L2("Lascia stare","Lass es"))}</button></div>`;
    else if(list.length)h+=`<div class="agwarn" style="background:#DCFCE7;border-color:#bbf7d0;color:#14532d">${esc(L2("È già tutto a posto, non c'è niente da cambiare.","Alles schon richtig, nichts zu ändern."))}</div>`;
    box.innerHTML=h;
    const ok=$("#agOk");if(ok)ok.onclick=async()=>{ok.disabled=true;ok.textContent="…";try{const r=await api("agentApply",{ids:st.ids,set:st.set,q:st.q});toast(L2("Fatto: ","Erledigt: ")+r.n+" "+t("docsN"));agState=null;box.innerHTML=`<div class="agwarn" style="background:#DCFCE7;border-color:#bbf7d0;color:#14532d">✓ ${esc(L2("Fatto","Erledigt"))}: ${r.n} ${esc(t("docsN"))}. ${esc(L2("Puoi annullare dalla Home per 24 ore.","Rückgängig auf der Startseite, 24 Stunden lang."))}</div>`;await load()}catch(err){ok.disabled=false;toast(errText(err.message))}};
    const no=$("#agNo");if(no)no.onclick=()=>{agState=null;box.innerHTML="";agHomeShow()};
    return}
  if(st.ask==="items"&&st.item){agItems(st,h,list);return}
  if(list.length&&(st.ask==="count"||st.ask==="sum")){const s2=list.filter(d=>!d.priv).reduce((a,d)=>a+(+d.total||0),0);h+=`<div class="aghead"><b>${st.ask==="count"?esc(list.length+" "+t("docsN")):esc(eur(r2(s2)))}</b><span>${esc(st.title||"")}</span></div>`}
  const arts={};list.forEach(d=>{if(d.type==="cliente"&&!d.priv&&d.art)arts[d.art]=(arts[d.art]||0)+(+d.total||0)});const ak=Object.keys(arts);
  h+=list.length?`<div class="list" id="agList">${list.map(d=>rowHTML(d,[])).join("")}${totHTML(list)}${ak.length>1?`<div class="agarts">${ak.map(a=>`<span>${esc(ART_N[a]||a)} <b>${esc(eur(r2(arts[a])))}</b></span>`).join("")}</div>`:""}</div><div class="xbar hide" id="agX"></div><button type="button" class="agsave" id="agSave">☆ ${esc(L2("Salva come richiesta fissa","Als festen Auftrag speichern"))}</button>`:`<div class="list" style="padding:14px">${esc(t("noRes"))}</div>`;
  box.innerHTML=h;renderXbar("agX","#agList");
  const sv=$("#agSave");if(sv)sv.onclick=async()=>{sv.disabled=true;try{const r=await api("saveReq",{name:st.title||st.q,q:st.q});savedReqs=r.saved||[];agSavedRender();sv.textContent="★ "+L2("Salvata","Gespeichert")}catch(err){sv.disabled=false;toast(errText(err.message))}}}
document.addEventListener("click",e=>{const b=e.target.closest("[data-agdrop]");if(!b||!agState)return;const c=agChipsOf(agState.filter)[+b.dataset.agdrop];if(!c)return;agState.filter=agDrop(agState.filter,c[0],c[1]);agRender()});
async function agRun(q){const box=$("#askOut");agHomeShow(false);box.innerHTML=agHead(q)+`<div class="info"><span class="spin"></span><span>${esc(L2("Ci penso…","Ich überlege…"))}</span></div>`;
  try{const j=await api("agent",{q,lang});agState=Object.assign({q},j);agRender()}catch(err){box.innerHTML=agHead(q)+`<div class="warn">${esc(errText(err.message))}</div>`}}
function agSavedRender(){const el=$("#agSaved");if(!el)return;$("#agSavedL").classList.toggle("hide",!savedReqs.length);
  el.innerHTML=savedReqs.map((r,i)=>`<div class="sv"><div><b>${esc(r.name)}</b><small>${esc(r.q)}</small></div><button type="button" class="run" data-agrun="${i}">▶</button><button type="button" data-agdel="${i}" aria-label="${esc(L2("Elimina","Löschen"))}">✕</button></div>`).join("")}
document.addEventListener("click",async e=>{const r=e.target.closest("[data-agrun]");if(r){const x=savedReqs[+r.dataset.agrun];if(x){$("#askIn").value=x.q;agRun(x.q)}return}
  const d=e.target.closest("[data-agdel]");if(d){try{const j=await api("delReq",{i:+d.dataset.agdel});savedReqs=j.saved||[];agSavedRender()}catch(err){toast(errText(err.message))}}});
function agHomeShow(v){$("#agHome").classList.toggle("hide",!(agMode&&v!==false&&!agState));if(agMode)agSavedRender()}
function agSetMode(m){agMode=m&&isAdmin();$$("#askSeg button").forEach(b=>b.classList.toggle("on",(b.dataset.m==="agent")===agMode));
  $("#agHint").classList.toggle("hide",!agMode);$("[data-t=askHint]").classList.toggle("hide",agMode);$("#askChips").classList.toggle("hide",agMode);
  $("#askIn").placeholder=agMode?L2("es. tatuaggi di mercoledì a ottobre, con PDF","z.B. Tattoos am Mittwoch im Oktober, mit PDF"):t("askPh");
  $("#askForm button[type=submit]").textContent=agMode?L2("Fai","Los"):t("askBtn");$("#askOut").innerHTML="";agState=null;agHomeShow()}
$$("#askSeg button").forEach(b=>b.onclick=()=>agSetMode(b.dataset.m==="agent"));
$$("#agChips button").forEach(b=>b.onclick=()=>{$("#askIn").value=b.textContent;agRun(b.textContent)});
function agInit(){const a=isAdmin();$("#askSeg").classList.toggle("hide",!a);if(!a&&agMode)agSetMode(false)}
const _renderAll3=renderAll;renderAll=function(){_renderAll3();agInit()};
const _askSubmit=$("#askForm").onsubmit;$("#askForm").onsubmit=e=>{if(!agMode)return _askSubmit(e);e.preventDefault();const q=$("#askIn").value.trim();if(q)agRun(q)};
(function(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition,m=$("#askMic");if(!SR||!m)return;m.classList.remove("hide");let rec=null;
  m.onclick=()=>{if(rec){rec.stop();return}rec=new SR();rec.lang=lang==="de"?"de-DE":"it-IT";rec.interimResults=true;m.classList.add("rec");
    rec.onresult=ev=>{$("#askIn").value=[...ev.results].map(r=>r[0].transcript).join("")};rec.onend=()=>{m.classList.remove("rec");rec=null};rec.onerror=()=>{};rec.start()}})();

/* ---------- Fai per me: domande su un prodotto (righe degli scontrini) ---------- */
const LINES={};
const lineMatch=(ln,words)=>{const x=norm((ln.desc||"")+" "+(ln.name||""));return words.some(w=>x.includes(norm(w)))};
async function agItems(st,h0,cand){const box=$("#askOut"),tok=st._tok=Math.random();
  const withP=cand.filter(d=>d.photoId),noP=cand.length-withP.length;
  const draw=(inner)=>{if(st._tok!==tok||agState!==st)return;box.innerHTML=h0+inner};
  let need=withP.filter(d=>!(d.id in LINES)).map(d=>d.id),done=withP.length-need.length,failed=[];
  while(need.length){draw(`<div class="info"><span class="spin"></span><span>${esc(L2("Leggo le righe degli scontrini: ","Ich lese die Belegzeilen: ")+done+" / "+withP.length)}</span></div><p class="aggot">${esc(L2("La prima volta ci vuole un po', poi resta salvato.","Beim ersten Mal dauert es etwas, danach ist es gespeichert."))}</p>`);
    const part=need.splice(0,6);try{const r=await api("lines",{ids:part});Object.assign(LINES,r.lines||{});failed=failed.concat(r.missing||[])}catch(err){failed=failed.concat(part)}
    done+=part.length;if(st._tok!==tok||agState!==st)return}
  const words=st.item.words&&st.item.words.length?st.item.words:[st.item.name];
  const hits=withP.map(d=>({d,ls:(LINES[d.id]||[]).filter(l=>lineMatch(l,words))})).filter(x=>x.ls.length).sort((a,b)=>String(a.d.date).localeCompare(String(b.d.date)));
  let qty=0,tot=0;const other={};hits.forEach(x=>x.ls.forEach(l=>{if(l.unit==="pz")qty+=+l.qty||0;else other[l.unit]=(other[l.unit]||0)+(+l.qty||0);tot+=+l.total||0}));
  const nm=st.item.name,lnTxt=l=>`${l.qty!=null?(+l.qty).toLocaleString(lang==="de"?"de-DE":"it-IT")+(l.unit==="pz"?" ×":" "+l.unit):""} ${l.name||l.desc}${l.total!=null?" · "+eur(l.total):""}`;
  let head;
  if(!hits.length)head=`<div class="aghead"><b>${esc(L2("Non trovato","Nicht gefunden"))}</b><span>${esc(L2(`Ho letto ${withP.length} scontrini e "${nm}" non c'è.`,`${withP.length} Belege gelesen, "${nm}" ist nicht dabei.`))}</span></div>`;
  else if(st.pick==="last"||st.pick==="first"){const x=st.pick==="last"?hits[hits.length-1]:hits[0],d=x.d;
    head=`<div class="aghead"><span>${esc(st.pick==="last"?L2("Ultima volta","Zuletzt"):L2("Prima volta","Zum ersten Mal"))}</span><b>${esc(fmtDate(d.date))}</b><span>${esc(d.vendor||"")} · ${esc(x.ls.map(lnTxt).join(", "))}</span></div>`}
  else{const q2=[qty?qty.toLocaleString(lang==="de"?"de-DE":"it-IT")+" "+L2("pezzi","Stück"):""].concat(Object.keys(other).map(u=>other[u].toLocaleString()+" "+u)).filter(Boolean).join(" + ");
    head=`<div class="aghead"><span>${esc(nm)}</span><b>${esc(q2||"–")} · ${esc(eur(r2(tot)))}</b><span>${esc(L2(`in ${hits.length} scontrini su ${withP.length} letti`,`in ${hits.length} von ${withP.length} gelesenen Belegen`))}</span></div>`}
  const warn=(noP||failed.length)?`<p class="aggot">${esc(L2(`${noP?noP+" documenti senza foto non controllati. ":""}${failed.length?failed.length+" scontrini non letti, riprova più tardi.":""}`,`${noP?noP+" Belege ohne Foto nicht geprüft. ":""}${failed.length?failed.length+" Belege nicht gelesen, später nochmal versuchen.":""}`))}</p>`:"";
  const rows=hits.slice().reverse().map(x=>rowHTML(x.d,[])+`<div class="aglines">${x.ls.map(l=>`<span>${esc(lnTxt(l))}</span>`).join("")}</div>`).join("");
  draw(head+warn+(hits.length?`<div class="list" id="agList">${rows}<div class="tot"><div class="totn">${esc(nm)} · ${hits.length} ${esc(t("docsN"))}</div><div class="totr"><span>${esc(L2("Spesa solo per questo prodotto","Ausgaben nur für dieses Produkt"))}</span><b>${esc(eur(r2(tot)))}</b></div></div></div><div class="xbar hide" id="agX"></div><button type="button" class="agsave" id="agSave">☆ ${esc(L2("Salva come richiesta fissa","Als festen Auftrag speichern"))}</button>`:""));
  renderXbar("agX","#agList");
  const sv=$("#agSave");if(sv)sv.onclick=async()=>{sv.disabled=true;try{const r=await api("saveReq",{name:st.title||st.q,q:st.q});savedReqs=r.saved||[];agSavedRender();sv.textContent="★ "+L2("Salvata","Gespeichert")}catch(err){sv.disabled=false;toast(errText(err.message))}}}

/* ---------- Spese personali (solo Denis, con password) ---------- */
const isDenis=()=>user&&String(user.email).toLowerCase()==="denisrider00@gmail.com";
function renderPersBtn(){const b=$("#persBtn");if(!b)return;const on=!!(isDenis()&&persInfo);b.classList.toggle("hide",!on);if(!on){$("#persBox").classList.add("hide");return}
  $("#persT").textContent=L2("Spese personali (solo Denis)","Private Ausgaben (nur Denis)");$("#persN").textContent=persInfo.n;}
function persLock(){const box=$("#persBox"),first=!persInfo.hasPw;
  box.innerHTML=`<b>${esc(first?L2("Scegli una password per le tue spese personali","Wähle ein Passwort für deine privaten Ausgaben"):L2("Password","Passwort"))}</b>`+
   (first?`<p class="aggot">${esc(L2("Solo tu la conosci: nessun altro la vede, nemmeno Linda. Almeno 6 caratteri.","Nur du kennst es, auch Linda nicht. Mindestens 6 Zeichen."))}</p>`:"")+
   `<input type="password" id="pw1" autocomplete="${first?"new-password":"current-password"}" placeholder="${esc(L2("Password","Passwort"))}">`+(first?`<input type="password" id="pw2" autocomplete="new-password" placeholder="${esc(L2("Ripeti la password","Passwort wiederholen"))}">`:"")+
   `<button class="primary" id="pwGo" type="button">${esc(first?L2("Salva e apri","Speichern und öffnen"):L2("Apri","Öffnen"))}</button>`;
  const go=async()=>{const p=$("#pw1").value;if(first&&p!==$("#pw2").value)return toast(L2("Le due password non sono uguali","Die Passwörter stimmen nicht überein"));
    try{if(first){await api("persSetPw",{pw:p});persInfo.hasPw=true}await persOpen(p)}catch(err){toast(errText(err.message))}};
  $("#pwGo").onclick=go;box.querySelectorAll("input").forEach(i=>i.onkeydown=e=>{if(e.key==="Enter")go()})}
async function persOpen(p){const j=await api("persList",{pw:p});persPw=p;persDocs=(j.docs||[]).sort((a,b)=>String(b.date).localeCompare(String(a.date)));persInfo.n=persDocs.length;renderPersBtn();persRender()}
function persRender(){const box=$("#persBox"),tot=persDocs.reduce((a,d)=>a+(+d.total||0),0);
  box.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><b>${esc(L2("Non contate nei conti dello studio","Nicht in der Studio-Buchhaltung"))}</b><button class="link" id="persClose" type="button">🔒 ${esc(L2("Chiudi","Schließen"))}</button></div>`+
   (persDocs.length?persDocs.map(d=>`<div class="pr"><div><b>${esc(d.vendor||"")}</b><small>${esc(fmtDate(d.date))} · ${esc(String(d.note||"").slice(0,90))}</small></div><span class="mono">${esc(eur(d.total))}</span><button type="button" data-pmove="${esc(d.id)}">Studio →</button></div>`).join("")+`<div style="display:flex;justify-content:space-between"><span>${esc(L2("Totale personali","Summe privat"))} · ${persDocs.length}</span><b class="mono">${esc(eur(r2(tot)))}</b></div>`
   :`<p class="aggot">${esc(L2("Nessuna spesa personale.","Keine privaten Ausgaben."))}</p>`);
  $("#persClose").onclick=()=>{persPw=null;persDocs=[];box.classList.add("hide")}}
$("#persBtn").onclick=()=>{const box=$("#persBox");if(!box.classList.contains("hide")){if(!persPw)box.classList.add("hide");return}box.classList.remove("hide");persPw?persRender():persLock()};
document.addEventListener("click",async e=>{const b=e.target.closest("[data-pmove]");if(!b)return;b.disabled=true;
  try{await api("persMove",{id:b.dataset.pmove,to:"studio",pw:persPw});toast(L2("Messo nello studio ✓","Ins Studio verschoben ✓"));await persOpen(persPw);await load()}catch(err){b.disabled=false;toast(errText(err.message))}});
$("#toPers").onclick=async()=>{const d=editing;if(!d||!d.id)return;const b=$("#toPers");b.disabled=true;
  try{await api("persMove",{id:d.id,to:"privato"});toast(L2("Spostato nelle tue spese personali 🔒","In deine privaten Ausgaben verschoben 🔒"));editing=null;await load();show("arch")}catch(err){toast(errText(err.message))}finally{b.disabled=false}};
const _fillCard2=fillCard;fillCard=function(){_fillCard2();const d=editing;$("#toPers").classList.toggle("hide",!(isDenis()&&d&&!d._new&&d.type!=="cliente"));$("#toPersT").textContent=L2("Spesa personale (solo Denis)","Private Ausgabe (nur Denis)")};
const _renderAll4=renderAll;renderAll=function(){_renderAll4();renderPersBtn()};
