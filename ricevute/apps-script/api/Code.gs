/**
 * Ricevute Waiblingen Ink · API
 * Progetto principale sull'account info.gardenoftattoo@gmail.com.
 * Deploy: Web app, Execute as: "Me", Who has access: "Anyone".
 * Accesso: il progetto LOGIN rimanda all'app con un token Google (solo email); questa API lo verifica
 * presso Google, controlla USERS e rilascia una sessione firmata con SECRET (generato qui, mai fuori).
 * Il collector (denisrider00) si identifica allo stesso modo con il token Google del suo account.
 * Script properties (create da setup, nessuna da scrivere a mano):
 *   SECRET, USERS, IMPORT_FROM, FOLDER_ID, SHEET_ID...   GEMINI_KEY si inserisce dall'app (Impostazioni).
 * Per il collector su denisrider00: impostare MODE_DEFAULT = 'collector' qui sotto prima di eseguire setup().
 */

const COLS = ['id','type','art','client','vendor','number','date','total','rate','cat','due','iban','note','src','mailUrl','msgId','photoId','mime','status','priv','owner','createdAt','createdBy','updatedAt','updatedBy','deleted','deletedAt','deletedBy'];
const CATS = ['einnahme','anzahlung','platzmiete','material','miete','energie','telefon','software','versicherung','werbung','fahrzeug','buero','gebuehren','steuer','beratung','sonstiges'];
const MODE_DEFAULT = 'main';
const MAIN_URL = '';  // solo collector: URL /exec della API principale
const DEFAULT_USERS = {'info.gardenoftattoo@gmail.com':'admin','denisrider00@gmail.com':'admin','salihu1999@gmail.com':'admin'};
const P = () => PropertiesService.getScriptProperties();
const prop = k => P().getProperty(k);

/* ================= setup ================= */
function setup() {
  const p = P();
  if (!prop('MODE')) p.setProperty('MODE', MODE_DEFAULT);
  if (!prop('IMPORT_FROM')) p.setProperty('IMPORT_FROM', '2026/09/01');
  if (prop('MODE') === 'collector') { installTriggers_(['importMail']); return 'collector pronto'; }
  if (!prop('SECRET')) p.setProperty('SECRET', Utilities.getUuid() + Utilities.getUuid());
  if (!prop('USERS')) p.setProperty('USERS', JSON.stringify(DEFAULT_USERS));
  if (!prop('FOLDER_ID')) {
    const root = DriveApp.createFolder('Waiblingen Ink Ricevute');
    p.setProperty('FOLDER_ID', root.getId());
    p.setProperty('PHOTO_ID', root.createFolder('Foto').getId());
    p.setProperty('MAIL_ID', root.createFolder('Da email').getId());
    p.setProperty('BACKUP_ID', root.createFolder('Backup').getId());
  }
  if (!prop('SHEET_ID')) {
    const ss = SpreadsheetApp.create('Ricevute Waiblingen Ink · Archivio');
    const sh = ss.getSheets()[0]; sh.setName('Docs'); sh.appendRow(COLS); sh.setFrozenRows(1);
    ss.insertSheet('Log').appendRow(['quando','chi','azione','id','dettagli']);
    DriveApp.getFileById(ss.getId()).moveTo(DriveApp.getFolderById(prop('FOLDER_ID')));
    p.setProperty('SHEET_ID', ss.getId());
  }
  installTriggers_(['importMail', 'dailyBackup']);
  return 'pronto';
}
function installTriggers_(names) {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  if (names.includes('importMail')) ScriptApp.newTrigger('importMail').timeBased().everyHours(1).create();
  if (names.includes('dailyBackup')) ScriptApp.newTrigger('dailyBackup').timeBased().atHour(3).everyDays(1).create();
}

/* ================= HTTP ================= */
function doGet() { return out_({ ok: true, app: 'Ricevute Waiblingen Ink' }); }
function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return out_({ error: 'bad_request' }); }
  try {
    if (req.action === 'collect') return out_(collect_(req));
    if (req.action === 'login') return out_(login_(req.g));
    const user = auth_(req.token);
    const admin = user.role === 'admin';
    const need = () => { if (!admin) throw new Error('solo_lettura'); };
    switch (req.action) {
      case 'me': return out_({ email: user.email, role: user.role });
      case 'list': return out_({ docs: listDocs_().filter(d => admin || !d.priv) });
      case 'save': need(); return out_({ doc: saveDoc_(req.doc, req.photo, req.mime, user.email) });
      case 'del': need(); return out_(delDoc_(req.id, user.email));
      case 'read': need(); return out_({ fields: readImage_(req.photo, req.mime) });
      case 'photo': return out_(photo_(req.id));
      case 'history': return out_({ items: history_(req.id) });
      case 'ask': return out_(ask_(req.q, admin));
      case 'importNow': need(); return out_({ imported: importMail() });
      case 'setKey': need(); P().setProperty('GEMINI_KEY', String(req.key || '').trim()); log_(user.email, 'chiave gemini', '', 'aggiornata'); return out_({ ok: true });
      case 'status': need(); return out_(status_());
      default: return out_({ error: 'azione_sconosciuta' });
    }
  } catch (err) { return out_({ error: String(err.message || err) }); }
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function google_(g) {
  if (!g) throw new Error('login');
  const r = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?access_token=' + encodeURIComponent(g), { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error('login');
  const i = JSON.parse(r.getContentText());
  if (!i.email || String(i.email_verified) !== 'true' || Number(i.expires_in) <= 0) throw new Error('login');
  return { email: String(i.email).toLowerCase(), aud: String(i.aud || i.azp || '') };
}
function login_(g) {
  const i = google_(g);
  const users = JSON.parse(prop('USERS') || '{}'); const role = users[i.email];
  if (!role) { log_(i.email, 'accesso negato', '', ''); throw new Error('non_autorizzato'); }
  if (!prop('LOGIN_AUD')) P().setProperty('LOGIN_AUD', i.aud);
  if (prop('LOGIN_AUD') !== i.aud) { log_(i.email, 'accesso rifiutato', '', 'app sconosciuta ' + i.aud); throw new Error('login'); }
  const body = Utilities.base64EncodeWebSafe(JSON.stringify({ e: i.email, r: role, x: Date.now() + 1000 * 60 * 60 * 24 * 7 }));
  const sig = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(body, prop('SECRET')));
  log_(i.email, 'accesso', '', '');
  return { token: body + '.' + sig, email: i.email, role };
}
function status_() {
  return { gemini: !!prop('GEMINI_KEY'), triggers: ScriptApp.getProjectTriggers().map(t => t.getHandlerFunction()), sheet: 'https://docs.google.com/spreadsheets/d/' + prop('SHEET_ID'), folder: 'https://drive.google.com/drive/folders/' + prop('FOLDER_ID'), importFrom: prop('IMPORT_FROM') };
}
function auth_(token) {
  if (!token || token.indexOf('.') < 0) throw new Error('login');
  const [body, sig] = token.split('.');
  const good = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(body, prop('SECRET')));
  if (sig !== good) throw new Error('login');
  const p = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(body)).getDataAsString());
  if (!p.x || p.x < Date.now()) throw new Error('login');
  const users = JSON.parse(prop('USERS') || '{}');
  const role = users[String(p.e).toLowerCase()];
  if (!role) throw new Error('login');
  return { email: p.e, role };
}

/* ================= archivio (Fogli) ================= */
function sheet_() { return SpreadsheetApp.openById(prop('SHEET_ID')).getSheetByName('Docs'); }
function log_(who, what, id, det) { try { SpreadsheetApp.openById(prop('SHEET_ID')).getSheetByName('Log').appendRow([new Date().toISOString(), who, what, id || '', String(det || '').slice(0, 1500)]); } catch (e) {} }
function history_(id) {
  const v = SpreadsheetApp.openById(prop('SHEET_ID')).getSheetByName('Log').getDataRange().getValues(); v.shift();
  return v.filter(r => r[3] === id).map(r => ({ when: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), who: r[1], what: r[2], det: r[4] }));
}
function listDocs_(all) {
  const v = sheet_().getDataRange().getValues(); const h = v.shift();
  return v.map(r => { const o = {}; h.forEach((k, i) => { if (r[i] !== '' && r[i] !== null) o[k] = r[i] instanceof Date ? Utilities.formatDate(r[i], 'Europe/Berlin', 'yyyy-MM-dd') : r[i]; }); return o; })
          .filter(d => all || !d.deleted);
}
function clean_(d) {
  const s = (x, n) => x == null ? '' : String(x).slice(0, n || 200);
  const num = x => { const n = typeof x === 'number' ? x : parseFloat(String(x || '').replace(',', '.')); return isNaN(n) ? '' : Math.round(n * 100) / 100; };
  const date = x => /^\d{4}-\d{2}-\d{2}$/.test(String(x || '')) ? String(x) : '';
  return {
    type: ['acquisto', 'cliente', 'fattura'].indexOf(d.type) >= 0 ? d.type : 'acquisto',
    art: ['D', 'G', 'W'].indexOf(d.art) >= 0 ? d.art : '',
    client: s(d.client, 80), vendor: s(d.vendor, 80), number: s(d.number, 40), date: date(d.date),
    total: num(d.total), rate: [0, 7, 19].indexOf(Number(d.rate)) >= 0 ? Number(d.rate) : '',
    cat: CATS.indexOf(d.cat) >= 0 ? d.cat : 'sonstiges', due: date(d.due), iban: s(d.iban, 40).replace(/[^A-Z0-9 ]/gi, ''),
    note: s(d.note, 500), status: d.status === 'confirm' ? 'confirm' : 'ok', priv: d.priv === true
  };
}
function saveDoc_(doc, photo, mime, who) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = sheet_(); const now = new Date().toISOString(); const c = clean_(doc || {});
    const v = sh.getDataRange().getValues(); const h = v[0]; const idCol = h.indexOf('id');
    let rowIdx = -1; if (doc.id) for (let i = 1; i < v.length; i++) if (v[i][idCol] === doc.id) { rowIdx = i; break; }
    let rec, before = null;
    if (rowIdx > 0) { rec = {}; h.forEach((k, i) => rec[k] = v[rowIdx][i]); before = Object.assign({}, rec); }
    else rec = { id: Utilities.getUuid(), src: 'foto', createdAt: now, createdBy: who };
    Object.assign(rec, c, { updatedAt: now, updatedBy: who });
    if (photo && !rec.photoId) {
      const ext = /pdf/.test(mime) ? 'pdf' : 'jpg';
      const name = [rec.date || now.slice(0, 10), (rec.client || rec.vendor || 'beleg').replace(/[^\w\-äöüÄÖÜß ]/g, ''), rec.number].filter(Boolean).join('_') + '.' + ext;
      const f = DriveApp.getFolderById(prop('PHOTO_ID')).createFile(Utilities.newBlob(Utilities.base64Decode(photo), mime || 'image/jpeg', name));
      rec.photoId = f.getId(); rec.mime = mime || 'image/jpeg';
    }
    const row = h.map(k => rec[k] === undefined ? '' : rec[k]);
    if (rowIdx > 0) sh.getRange(rowIdx + 1, 1, 1, h.length).setValues([row]); else sh.appendRow(row);
    if (before) {
      const ch = Object.keys(c).filter(k => String(before[k] === undefined ? '' : before[k]) !== String(c[k] === undefined ? '' : c[k])).map(k => k + ': ' + before[k] + ' -> ' + c[k]);
      if (ch.length) log_(who, 'modifica', rec.id, ch.join(' | '));
    } else log_(who, rec.src === 'foto' ? 'caricato' : 'nuovo', rec.id, [rec.type, rec.client || rec.vendor, rec.number, rec.total].filter(Boolean).join(' · '));
    return rec;
  } finally { lock.releaseLock(); }
}
function delDoc_(id, who) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = sheet_(); const v = sh.getDataRange().getValues(); const h = v[0];
    for (let i = 1; i < v.length; i++) if (v[i][h.indexOf('id')] === id) {
      sh.getRange(i + 1, h.indexOf('deleted') + 1, 1, 3).setValues([[true, new Date().toISOString(), who]]);
      log_(who, 'storno', id, 'documento stornato, resta nell\'archivio come eliminato'); return { ok: true };
    }
    return { ok: false };
  } finally { lock.releaseLock(); }
}
function photo_(id) {
  const d = listDocs_(true).filter(x => x.id === id)[0];
  if (!d || !d.photoId) return { none: true };
  const b = DriveApp.getFileById(d.photoId).getBlob();
  return { mime: b.getContentType(), data: Utilities.base64Encode(b.getBytes()) };
}

/* ================= Gemini ================= */
const GEMINI_MODELS = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.7-flash'];
function gemini_(parts, json) {
  if (!prop('GEMINI_KEY')) throw new Error('manca_chiave_gemini');
  const req = (model, think) => {
    const gc = { temperature: 0.1 };
    if (json) gc.responseMimeType = 'application/json';
    if (think) gc.thinkingConfig = { thinkingLevel: 'low' };
    return UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent',
      { method: 'post', contentType: 'application/json', headers: { 'x-goog-api-key': prop('GEMINI_KEY') }, payload: JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig: gc }), muteHttpExceptions: true });
  };
  const models = (prop('GEMINI_MODEL') ? [prop('GEMINI_MODEL')] : []).concat(GEMINI_MODELS).filter((x, i, a) => a.indexOf(x) === i);
  let r, last = '';
  for (const m of models) {
    r = req(m, true);
    if (r.getResponseCode() === 400 && /thinking/i.test(r.getContentText())) r = req(m, false);
    if (r.getResponseCode() === 200) break;
    last = m + ' ' + r.getResponseCode() + ' ' + r.getContentText().slice(0, 150);
  }
  if (r.getResponseCode() !== 200) throw new Error('gemini ' + last);
  const t = (JSON.parse(r.getContentText()).candidates || [{}])[0].content.parts.filter(x => !x.thought).map(x => x.text || '').join('');
  return json ? JSON.parse(t.replace(/^\s*```(json)?|```\s*$/g, '').trim()) : t;
}
const RECEIPT_PROMPT = `Sei il lettore di documenti contabili dello studio di tatuaggi Waiblingen Ink (Denis Cicala & Linda Salihu-Cicala GbR, Lange Straße 10, 71332 Waiblingen, Germania). Rispondi SOLO con JSON.
TIPI
"cliente" = ricevuta emessa DALLO studio. Blocchetto RNK Verlag Nr. 2952 F con timbro "Waiblingen Ink Garden of Tattoo". client = nome scritto a mano a sinistra sotto il timbro. date = casella "Datum" scritta a mano, giorno/mese/anno a due cifre (30/10/26 = 2026-10-30). art = lettera scritta a mano in alto a destra: "D" tatuaggio di Denis, "G" tatuaggio di Giova Tattoos; "W" se la ricevuta è dello studio a un tatuatore (affitto postazione, Platzmiete) e allora category "platzmiete". number = numero STAMPATO in basso nella casella "Verk." dopo l'asterisco (*226276-25 -> "226276-25"). note = testo di "Gegenstand". total = riga di totale (colonne EUR e Cent). category: "einnahme" (tatuaggio) o "anzahlung" (acconto) o "platzmiete".
"fattura" = fattura di un fornitore ancora da pagare (scadenza, "zahlbar bis", "fällig", IBAN per bonifico).
"acquisto" = scontrino o fattura di un acquisto già pagato (anche addebito automatico, PayPal, carta).
CAMPI {"type":"cliente|fattura|acquisto","client":string|null,"vendor":string|null,"date":"YYYY-MM-DD"|null,"number":string|null,"total":number|null,"rate":19|7|0|null,"art":"D"|"G"|"W"|null,"note":string|null,"category":"${CATS.join('|')}","due":"YYYY-MM-DD"|null,"iban":string|null,"unsure":[campi incerti]}
Abbonamenti e servizi digitali (Google, Apple, Wix, Kalender.digital, Adobe) -> "software". Non inventare: se non leggibile metti null.`;
function readImage_(b64, mime) {
  return gemini_([{ text: RECEIPT_PROMPT }, { inline_data: { mime_type: mime || 'image/jpeg', data: b64 } }], true);
}

/* ================= assistente ================= */
function ask_(q, admin) {
  q = String(q || '').slice(0, 500);
  const docs = listDocs_().filter(d => admin || !d.priv);
  const rows = docs.map(d => [d.id, d.date, d.type, d.art || '', d.client || d.vendor || '', d.number || '', d.cat, d.total, d.rate === '' ? '' : d.rate, d.status, d.priv ? 'privato' : ''].join('|'));
  const prompt = `Sei l'assistente contabile dell'app Ricevute di Waiblingen Ink. Oggi è ${Utilities.formatDate(new Date(), 'Europe/Berlin', 'yyyy-MM-dd')}.
Archivio, una riga per documento: id|data|tipo(cliente=incasso, acquisto=spesa pagata, fattura=spesa da pagare)|chi(D Denis, G Giova Tattoos, W studio verso tatuatore)|cliente o fornitore|numero|categoria|totale lordo €|aliquota|stato(confirm=da confermare)|privato
${rows.join('\n')}
Domanda: ${q}
Rispondi SOLO con JSON {"answer":"risposta breve in italiano, senza calcoli lunghi","ids":["id di TUTTI i documenti che compongono la risposta"],"kind":"incassi|spese|misto|altro"}.
Le spese private non contano. Se la domanda non riguarda l'archivio, rispondi gentilmente che puoi aiutare solo con ricevute e fatture.`;
  const r = gemini_([{ text: prompt }], true);
  const set = {}; docs.forEach(d => set[d.id] = d);
  const ids = (r.ids || []).filter(id => set[id]);
  log_('assistente', 'domanda', '', q);
  return { answer: String(r.answer || ''), ids, kind: r.kind || 'altro' };
}

/* ================= email ================= */
const MAIL_HINT = /(rechnung|beleg|quittung|receipt|invoice|fattura|ricevuta|zahlung|payment|bestellung|order|abbuchung|lastschrift|kontoauszug|ihre zahlung|zahlungsbeleg)/i;
function importMail() {
  const collector = prop('MODE') === 'collector';
  const label = GmailApp.getUserLabelByName('Ricevute/Archiviata') || GmailApp.createLabel('Ricevute/Archiviata');
  const seen = {}; if (!collector) listDocs_(true).forEach(d => { if (d.msgId) seen[d.msgId] = 1; });
  const threads = GmailApp.search('after:' + prop('IMPORT_FROM') + ' -label:Ricevute-Archiviata -in:sent -in:chats -from:me', 0, 15);
  let n = 0;
  for (const th of threads) {
    for (const m of th.getMessages()) {
      if (seen[m.getId()]) continue;
      const subj = m.getSubject() || '', body = (m.getPlainBody() || '').slice(0, 6000);
      const atts = m.getAttachments({ includeInlineImages: false }).filter(a => /pdf|image\//.test(a.getContentType()) && a.getSize() < 5e6);
      if (!MAIL_HINT.test(subj + ' ' + body.slice(0, 1500)) && !atts.length) continue;
      if (/nachrichten zur freigabe|resoconto (quotidiano|mensile) versamenti|zahlungseingang|auszahlung/i.test(subj)) continue;
      const mailUrl = 'https://mail.google.com/mail/?authuser=' + Session.getEffectiveUser().getEmail() + '#all/' + m.getId();
      const raw = { from: m.getFrom(), date: Utilities.formatDate(m.getDate(), 'Europe/Berlin', 'yyyy-MM-dd'), subject: subj, body, msgId: m.getId(), mailUrl,
        att: atts[0] ? { mime: atts[0].getContentType(), data: Utilities.base64Encode(atts[0].getBytes()), name: atts[0].getName() } : null };
      if (collector) {
        const res = UrlFetchApp.fetch(MAIN_URL, { method: 'post', contentType: 'text/plain', muteHttpExceptions: true, followRedirects: true,
          payload: JSON.stringify({ action: 'collect', g: ScriptApp.getOAuthToken(), mail: raw }) });
        if (res.getResponseCode() !== 200) return n;
        const j = JSON.parse(res.getContentText() || '{}'); if (j.error) { if (j.error === 'manca_chiave_gemini') return n; continue; }
        if (j.stored) n++;
      } else {
        try { if (parseMail_(raw, 'ok', 'info')) n++; } catch (err) { log_('import', 'errore', '', err.message); return n; }
      }
    }
    th.addLabel(label);
  }
  if (!collector && n) log_('import', 'email', '', n + ' documenti');
  return n;
}
function storeMailDoc_(doc, msgId, mailUrl, att, status, owner) {
  const c = clean_(Object.assign({}, doc, { status }));
  const now = new Date().toISOString();
  const rec = Object.assign({ id: Utilities.getUuid(), src: 'email', msgId, mailUrl, owner, createdAt: now, createdBy: 'email', updatedAt: now, updatedBy: 'email' }, c);
  if (att) { const f = DriveApp.getFolderById(prop('MAIL_ID')).createFile(Utilities.newBlob(att.bytes, att.mime, (rec.date || '') + '_' + att.name)); rec.photoId = f.getId(); rec.mime = att.mime; }
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = sheet_(); const h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    if (listDocs_(true).some(d => d.msgId === msgId)) return false;
    sh.appendRow(h.map(k => rec[k] === undefined ? '' : rec[k]));
    log_('email (' + owner + ')', 'importato', rec.id, [rec.vendor, rec.number, rec.total].filter(Boolean).join(' · '));
  } finally { lock.releaseLock(); }
  return true;
}
function parseMail_(raw, status, owner) {
  const parts = [{ text: `Email ricevuta da ${raw.from} il ${raw.date}.
Oggetto: ${raw.subject}
Testo:
${String(raw.body || '').slice(0, 6000)}

Decidi se è la PROVA di una SPESA dello studio o di una fattura da pagare (scontrino, fattura, ricevuta di pagamento, addebito). NON sono spese: newsletter, pubblicità, conferme di ordine senza importo, incassi ricevuti, resoconti di vendite, avvisi di sicurezza.
Rispondi SOLO con JSON {"expense":true|false,"type":"acquisto|fattura","vendor":string,"date":"YYYY-MM-DD","number":string|null,"total":number|null,"rate":19|7|0|null,"category":"${CATS.join('|')}","due":"YYYY-MM-DD"|null,"iban":string|null,"note":"breve descrizione"}.
Abbonamenti digitali -> "software". Se non c'è un importo chiaro, expense=false.` }];
  if (raw.att) parts.push({ inline_data: { mime_type: raw.att.mime, data: raw.att.data } });
  const r = gemini_(parts, true);
  if (!r.expense || r.total == null) return false;
  const doc = { type: r.type === 'fattura' ? 'fattura' : 'acquisto', vendor: r.vendor, date: r.date || raw.date, number: r.number, total: r.total, rate: r.rate, cat: r.category, due: r.due, iban: r.iban, note: r.note };
  return storeMailDoc_(doc, String(raw.msgId), String(raw.mailUrl || ''), raw.att ? { mime: raw.att.mime, bytes: Utilities.base64Decode(raw.att.data), name: raw.att.name } : null, status, owner);
}
function collect_(req) {
  const i = google_(req.g);
  const users = JSON.parse(prop('USERS') || '{}');
  if (users[i.email] !== 'admin' || i.email === Session.getEffectiveUser().getEmail()) return { error: 'login' };
  const m = req.mail || {};
  if (listDocs_(true).some(d => d.msgId === String(m.msgId))) return { stored: false };
  return { stored: !!parseMail_(m, 'confirm', i.email) };
}

/* ================= backup giornaliero ================= */
function dailyBackup() {
  const day = Utilities.formatDate(new Date(), 'Europe/Berlin', 'yyyy-MM-dd');
  const folder = DriveApp.getFolderById(prop('BACKUP_ID'));
  const url = 'https://docs.google.com/spreadsheets/d/' + prop('SHEET_ID') + '/export?format=xlsx';
  const xlsx = UrlFetchApp.fetch(url, { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() } }).getBlob().setName('Archivio_' + day + '.xlsx');
  folder.createFile(xlsx);
  folder.createFile(Utilities.newBlob(JSON.stringify(listDocs_(true)), 'application/json', 'Archivio_' + day + '.json'));
  const limit = Date.now() - 1000 * 60 * 60 * 24 * 60;
  const it = folder.getFiles(); while (it.hasNext()) { const f = it.next(); if (f.getDateCreated().getTime() < limit) f.setTrashed(true); }
  log_('backup', 'giornaliero', '', day);
}
