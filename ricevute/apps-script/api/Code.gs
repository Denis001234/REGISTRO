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
      case 'list': return out_({ docs: listDocs_(false).filter(d => admin || !d.priv), undo: admin ? undoInfo_() : null, saved: admin ? JSON.parse(prop('SAVED') || '[]') : [] });
      case 'discard': need(); return out_(discard_(req.id, user.email));
      case 'undo': need(); return out_(undoRedo_(user.email, false));
      case 'redo': need(); return out_(undoRedo_(user.email, true));
      case 'save': need(); return out_({ doc: saveDoc_(req.doc, req.photo, req.mime, user.email) });
      case 'del': need(); return out_(delDoc_(req.id, user.email));
      case 'read': need(); {
        const t0 = Date.now();
        try { const f = readImage_(req.photo, req.mime); log_(user.email, 'lettura ok', '', (Date.now() - t0) + 'ms · ' + (ai_.trace || '')); return out_({ fields: f }); }
        catch (err) { log_(user.email, 'lettura errore', '', (Date.now() - t0) + 'ms · ' + (ai_.trace || '') + ' · ' + err.message); throw err; }
      }
      case 'photo': return out_(photo_(req.id, user.email));
      case 'history': return out_({ items: history_(req.id) });
      case 'ask': return out_(ask_(req.q, admin, req.lang));
      case 'agent': need(); return out_(agent_(req.q, req.lang, user.email));
      case 'lines': need(); return out_(lines_(req.ids));
      case 'agentApply': need(); return out_(agentApply_(req.ids, req.set, req.q, user.email));
      case 'saveReq': need(); { const L = JSON.parse(prop('SAVED') || '[]'); L.push({ name: String(req.name || '').slice(0, 60), q: String(req.q || '').slice(0, 500), by: user.email }); P().setProperty('SAVED', JSON.stringify(L.slice(-20))); log_(user.email, 'richiesta salvata', '', req.name); return out_({ saved: L.slice(-20) }); }
      case 'delReq': need(); { const L = JSON.parse(prop('SAVED') || '[]'); L.splice(Number(req.i), 1); P().setProperty('SAVED', JSON.stringify(L)); return out_({ saved: L }); }
      case 'importNow': need(); return out_({ imported: importMail() });
      case 'setKey': need(); P().setProperty('GEMINI_KEY', String(req.key || '').trim()); log_(user.email, 'chiave gemini', '', 'aggiornata'); return out_({ ok: true });
      case 'setClaudeKey': need(); {
        const k = String(req.key || '').trim();
        if (!/^sk-ant-/.test(k)) throw new Error('chiave_claude_non_valida');
        P().setProperty('CLAUDE_KEY', k);
        try { claude_([{ text: 'Rispondi {"ok":true}' }], true); } catch (e) { P().deleteProperty('CLAUDE_KEY'); throw new Error('chiave_claude_rifiutata: ' + e.message.slice(0, 120)); }
        log_(user.email, 'chiave claude', '', 'aggiornata e provata'); return out_({ ok: true });
      }
      case 'startImport': need(); return out_(startImport_(user.email));
      case 'track': {
        const what = ['stampa', 'pdf', 'invio', 'excel'].indexOf(req.what) >= 0 ? req.what : 'pdf';
        const ids = (Array.isArray(req.ids) ? req.ids : []).slice(0, 300).map(String);
        const det = String(req.det || '').slice(0, 300);
        const now = new Date().toISOString(), rows = (ids.length ? ids : ['']).map(id => [now, user.email, what, id, det]);
        const lg = SpreadsheetApp.openById(prop('SHEET_ID')).getSheetByName('Log');
        lg.getRange(lg.getLastRow() + 1, 1, rows.length, 5).setValues(rows);
        return out_({ ok: true });
      }
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
  const imp = importFolder_();
  let pending = 0; const it = imp.getFiles(); while (it.hasNext() && pending < 999) { it.next(); pending++; }
  return { gemini: !!prop('GEMINI_KEY'), claude: !!prop('CLAUDE_KEY'), importUrl: imp.getUrl(), importPending: pending, importRunning: ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'importFolder'), triggers: ScriptApp.getProjectTriggers().map(t => t.getHandlerFunction()), sheet: 'https://docs.google.com/spreadsheets/d/' + prop('SHEET_ID'), folder: 'https://drive.google.com/drive/folders/' + prop('FOLDER_ID'), importFrom: prop('IMPORT_FROM') };
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
    fileDoc_(rec);
    if (/@/.test(String(who))) record_(who, rec.id, before ? snap_(h, h.map(k => before[k])) : null, snap_(h, row), (before ? 'modifica' : 'nuovo') + ' · ' + [rec.client || rec.vendor, rec.total !== '' ? rec.total + ' €' : ''].filter(Boolean).join(' · '));
    if (before) {
      const f = x => x === undefined || x === null ? '' : x instanceof Date ? Utilities.formatDate(x, 'Europe/Berlin', 'yyyy-MM-dd') : String(x);
      const ch = Object.keys(c).filter(k => f(before[k]) !== f(c[k])).map(k => k + ': ' + f(before[k]) + ' -> ' + f(c[k]));
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
      const beforeRow = v[i].slice();
      sh.getRange(i + 1, h.indexOf('deleted') + 1, 1, 3).setValues([[true, new Date().toISOString(), who]]);
      if (/@/.test(String(who))) { const after = v[i].slice(); after[h.indexOf('deleted')] = true; after[h.indexOf('deletedAt')] = new Date().toISOString(); after[h.indexOf('deletedBy')] = who; record_(who, id, snap_(h, beforeRow), snap_(h, after), 'storno · ' + [v[i][h.indexOf('client')] || v[i][h.indexOf('vendor')], v[i][h.indexOf('total')] + ' €'].join(' · ')); }
      fileDoc_(snap_(h, sh.getRange(i + 1, 1, 1, h.length).getValues()[0]));
      log_(who, 'storno', id, 'documento stornato, resta nell\'archivio come eliminato'); return { ok: true };
    }
    return { ok: false };
  } finally { lock.releaseLock(); }
}
function photo_(id, who) {
  const d = listDocs_(true).filter(x => x.id === id)[0];
  if (!d || !d.photoId) return { none: true };
  const b = DriveApp.getFileById(d.photoId).getBlob();
  return { mime: b.getContentType(), data: Utilities.base64Encode(b.getBytes()) };
}

/* ================= Gemini ================= */
const GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];
const CLAUDE_MODEL = 'claude-haiku-5-5';
/* Prima Claude (API a pagamento, dati non usati per addestrare), poi Gemini come riserva; se manca la chiave Claude, solo Gemini. */
function ai_(parts, json) {
  const trace = [];
  const order = prop('CLAUDE_KEY') ? ['claude', 'gemini'] : ['gemini'];
  let lastErr;
  for (const who of order) {
    const t0 = Date.now();
    try {
      const r = who === 'claude' ? claude_(parts, json) : gemini_(parts, json);
      trace.push(who === 'claude' ? CLAUDE_MODEL + ' ok ' + (Date.now() - t0) + 'ms' : (gemini_.trace || 'gemini ok'));
      ai_.trace = trace.join(', ');
      return r;
    } catch (e) { lastErr = e; trace.push(who + ' errore ' + (Date.now() - t0) + 'ms ' + String(e.message).slice(0, 120)); }
  }
  ai_.trace = trace.join(', ');
  throw lastErr;
}
function claude_(parts, json) {
  const content = [];
  parts.forEach(p => {
    if (p.inline_data) {
      const m = p.inline_data.mime_type;
      content.unshift(/pdf/.test(m) ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: p.inline_data.data } }
                                    : { type: 'image', source: { type: 'base64', media_type: m, data: p.inline_data.data } });
    } else if (p.text) content.push({ type: 'text', text: p.text + (json ? '\nRispondi solo con il JSON, senza altro testo.' : '') });
  });
  const r = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { 'x-api-key': prop('CLAUDE_KEY'), 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({ model: prop('CLAUDE_MODEL') || CLAUDE_MODEL, max_tokens: 2000, messages: [{ role: 'user', content }] }) });
  if (r.getResponseCode() !== 200) throw new Error('claude ' + r.getResponseCode() + ' ' + r.getContentText().slice(0, 200));
  const t = (JSON.parse(r.getContentText()).content || []).filter(x => x.type === 'text').map(x => x.text).join('');
  if (!json) return t;
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  return JSON.parse(t.slice(a, b + 1));
}
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
  const trace = [];
  for (const m of models) {
    const t0 = Date.now();
    r = req(m, true);
    if (r.getResponseCode() === 400 && /thinking/i.test(r.getContentText())) r = req(m, false);
    trace.push(m + ' ' + r.getResponseCode() + ' ' + (Date.now() - t0) + 'ms');
    if (r.getResponseCode() === 200) break;
    last = m + ' ' + r.getResponseCode() + ' ' + r.getContentText().slice(0, 150);
  }
  gemini_.trace = trace.join(', ');
  if (r.getResponseCode() !== 200) throw new Error('gemini ' + last);
  const t = (JSON.parse(r.getContentText()).candidates || [{}])[0].content.parts.filter(x => !x.thought).map(x => x.text || '').join('');
  return json ? JSON.parse(t.replace(/^\s*```(json)?|```\s*$/g, '').trim()) : t;
}
const RECEIPT_PROMPT = `Sei il lettore di documenti contabili dello studio di tatuaggi Waiblingen Ink (Denis Cicala & Linda Salihu-Cicala GbR, Lange Straße 10, 71332 Waiblingen, Germania). Rispondi SOLO con JSON.
TIPI
"cliente" = ricevuta emessa DALLO studio. Blocchetto RNK Verlag Nr. 2952 F con timbro "Waiblingen Ink Garden of Tattoo". client = nome scritto a mano a sinistra sotto il timbro. date = casella "Datum" scritta a mano, giorno/mese/anno a due cifre (30/10/26 = 2026-10-30). art = lettera scritta a mano in alto a destra: "D" tatuaggio di Denis, "G" tatuaggio di Giova Tattoos; "W" se la ricevuta è dello studio a un tatuatore (affitto postazione, Platzmiete) e allora category "platzmiete". number = numero STAMPATO in basso nella casella "Verk." dopo l'asterisco (*226276-25 -> "226276-25"). note = testo di "Gegenstand". total = riga di totale (colonne EUR e Cent). category: "einnahme" (tatuaggio) o "anzahlung" (acconto) o "platzmiete". Se in "Gegenstand" c'è "Anz." o "Anz" (abbreviazione di Anzahlung) è un ACCONTO: category "anzahlung" e note "Anzahlung". "Tattoo" = "einnahme". La lettera D/G/W in alto a destra può essere piccola, sbiadita o vicino al timbro: guarda con attenzione prima di dire che manca.
"fattura" = fattura (Rechnung) di un fornitore intestata allo studio, già pagata: tutto ciò che si carica è già pagato, quindi non serve la scadenza. Le ricevute sul blocchetto verde di Giovanni Scorpiniti (timbro "Giova Tattoos", Kastanienweg 3, Korb) intestate a "Denis Cicala e Linda Salihu-Cicala GbR" sono fatture di Giova Tattoos allo studio: type "fattura", vendor "Giovanni Scorpiniti (Giova Tattoos)", art "G", category "sonstiges", number = numero stampato dopo l'asterisco.
"acquisto" = scontrino o fattura di un acquisto già pagato (anche addebito automatico, PayPal, carta).
CAMPI {"type":"cliente|fattura|acquisto","client":string|null,"vendor":string|null,"date":"YYYY-MM-DD"|null,"number":string|null,"total":number|null,"rate":19|7|0|null,"art":"D"|"G"|"W"|null,"note":string|null,"category":"${CATS.join('|')}","due":"YYYY-MM-DD"|null,"iban":string|null,"unsure":[campi incerti]}
Abbonamenti e servizi digitali (Google, Apple, Wix, Kalender.digital, Adobe) -> "software". Non inventare: se non leggibile metti null.`;
function readImage_(b64, mime) {
  const r = ai_([{ text: RECEIPT_PROMPT + (readImage_.extra || '') }, { inline_data: { mime_type: mime || 'image/jpeg', data: b64 } }], true);
  if (r && r.type === 'cliente' && ['D', 'G', 'W'].indexOf(r.art) < 0) {
    r.art = 'D'; r.artDefault = true;
    r.unsure = (Array.isArray(r.unsure) ? r.unsure : []).concat('art');
  }
  return r;
}

/* ================= assistente ================= */
function ask_(q, admin, lang) {
  const de = lang === 'de';
  q = String(q || '').slice(0, 500);
  const docs = listDocs_().filter(d => admin || !d.priv);
  const rows = docs.map(d => [d.id, d.date, d.type, d.art || '', d.client || d.vendor || '', d.number || '', d.cat, d.total, d.rate === '' ? '' : d.rate, d.status, d.priv ? 'privato' : ''].join('|'));
  const prompt = `Sei l'assistente contabile dell'app Ricevute di Waiblingen Ink. Oggi è ${Utilities.formatDate(new Date(), 'Europe/Berlin', 'yyyy-MM-dd')}.
Archivio, una riga per documento: id|data|tipo(cliente=incasso, acquisto=scontrino pagato, fattura=fattura di fornitore già pagata)|chi(D Denis, G Giova Tattoos, W studio verso tatuatore)|cliente o fornitore|numero|categoria|totale lordo €|aliquota|stato(confirm=da confermare)|privato
${rows.join('\n')}
Domanda: ${q}
Rispondi SOLO con JSON {"answer":"risposta breve in ${de ? 'TEDESCO' : 'italiano'}, senza calcoli lunghi","ids":["id di TUTTI i documenti che compongono la risposta"],"kind":"incassi|spese|misto|altro"}.
Le spese private non contano. Se la domanda non riguarda l'archivio, rispondi gentilmente che puoi aiutare solo con ricevute e fatture. Lingua della risposta: ${de ? 'tedesco' : 'italiano'}.`;
  const r = ai_([{ text: prompt }], true);
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
      const raw = { from: m.getFrom(), to: m.getTo(), date: Utilities.formatDate(m.getDate(), 'Europe/Berlin', 'yyyy-MM-dd'), subject: subj, body, msgId: m.getId(), mailUrl,
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
  if (doc.usoNote) rec.note = String(doc.usoNote + (rec.note ? ' · ' + rec.note : '')).slice(0, 500);
  if (doc.uso === 'dubbio') rec.status = 'confirm';
  rec.refs = JSON.stringify((doc.refs || []).map(x => ({ t: String(x && x.t || 'altro').slice(0, 12), v: String(x && x.v || x || '').slice(0, 60) })).filter(x => x.v));
  ensureCols_();
  if (att) { const f = DriveApp.getFolderById(prop('MAIL_ID')).createFile(Utilities.newBlob(att.bytes, att.mime, (rec.date || '') + '_' + att.name)); rec.photoId = f.getId(); rec.mime = att.mime; }
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = sheet_(); const h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    if (listDocs_(true).some(d => d.msgId === msgId)) return false;
    sh.appendRow(h.map(k => rec[k] === undefined ? '' : rec[k]));
    fileDoc_(rec);
    log_('email (' + owner + ')', 'importato', rec.id, [rec.vendor, rec.number, rec.total].filter(Boolean).join(' · '));
  } finally { lock.releaseLock(); }
  try { const r = dedupe_(false, rec.id); if (r.merged.length) log_('doppioni', 'unito all\'import', rec.id, JSON.stringify(r.merged[0]).slice(0, 500)); } catch (e) { log_('doppioni', 'errore', rec.id, String(e.message).slice(0, 200)); }
  return true;
}
function parseMail_(raw, status, owner) {
  if (privMail_(raw, owner)) return false;  // PayPal privato o carta privata: non entra nell'app
  const parts = [{ text: `Email ricevuta da ${raw.from} il ${raw.date}.
Oggetto: ${raw.subject}
Testo:
${String(raw.body || '').slice(0, 6000)}

Decidi se è la PROVA di una SPESA dello studio o di una fattura di un fornitore (scontrino, fattura, ricevuta di pagamento, addebito). NON sono spese: newsletter, pubblicità, conferme di ordine senza importo, incassi ricevuti, resoconti di vendite, avvisi di sicurezza.
Rispondi SOLO con JSON {"expense":true|false,"type":"acquisto|fattura","vendor":string,"date":"YYYY-MM-DD","number":string|null,"total":number|null,"rate":19|7|0|null,"category":"${CATS.join('|')}","due":"YYYY-MM-DD"|null,"iban":string|null,"note":"breve descrizione","refs":[{"t":"fattura|ordine|transazione|altro","v":"ogni numero di riferimento che trovi: numero fattura, numero ordine, ID transazione PayPal, riferimento carta o banca, numero cliente escluso"}]}.
Aggiungi "card": le ultime 4 cifre della carta con cui è stato pagato, se sono scritte (es. "Visa •••• 1234" -> "1234"), altrimenti null.
Abbonamenti digitali -> "software". Se non c'è un importo chiaro, expense=false.
${usoPrompt_()}` }];
  if (raw.att) parts.push({ inline_data: { mime_type: raw.att.mime, data: raw.att.data } });
  const r = ai_(parts, true);
  if (!r.expense || r.total == null) return false;
  const c4 = String(r.card || '').replace(/\D/g, '').slice(-4);
  if (c4 && privCards_().indexOf(c4) >= 0) return false;  // pagata con la carta privata
  const u = usoOf_(r);
  if (u.uso === 'privato') return false;  // spesa privata: non entra nell'app, nessuna riga, foto o registro (l'email resta nella casella)
  const doc = { uso: u.uso, usoNote: u.uso === 'studio' ? '' : 'studio o privata? ' + u.perche, refs: Array.isArray(r.refs) ? r.refs.slice(0, 10) : [], type: r.type === 'fattura' ? 'fattura' : 'acquisto', vendor: r.vendor, date: r.date || raw.date, number: r.number, total: r.total, rate: r.rate, cat: r.category, due: r.due, iban: r.iban, note: r.note };
  return storeMailDoc_(doc, String(raw.msgId), String(raw.mailUrl || ''), raw.att ? { mime: raw.att.mime, bytes: Utilities.base64Decode(raw.att.data), name: raw.att.name } : null, status, owner);
}
function collect_(req) {
  const i = google_(req.g);
  const users = JSON.parse(prop('USERS') || '{}');
  if (users[i.email] !== 'admin' || i.email === Session.getEffectiveUser().getEmail()) return { error: 'login' };
  const m = req.mail || {};
  if (m.test) { log_(i.email, 'collegamento email', '', 'collector pronto'); return { ok: true, email: i.email }; }
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
  const it = folder.getFiles(); while (it.hasNext()) { const f = it.next(), m = f.getName().match(/(\d{4}-\d{2}-\d{2})/), t = m ? new Date(m[1] + 'T12:00:00Z').getTime() : f.getDateCreated().getTime(); if (t < limit) driveDel_(f.getId()); }
  log_('backup', 'giornaliero', '', day);
}

/* ================= importazione iniziale da cartella Drive ================= */
function importFolder_() {
  let id = prop('IMPORT_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const f = DriveApp.getFolderById(prop('FOLDER_ID')).createFolder('Importazione iniziale');
  P().setProperty('IMPORT_ID', f.getId());
  return f;
}
function sub_(parent, name) { const it = parent.getFoldersByName(name); return it.hasNext() ? it.next() : parent.createFolder(name); }
function startImport_(who) {
  if (!ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'importFolder'))
    { P().deleteProperty('IMPORT_RUNS'); ScriptApp.newTrigger('importFolder').timeBased().everyMinutes(5).create(); }
  log_(who, 'importazione avviata', '', '');
  return { started: true };
}
function stopImport_() { ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'importFolder').forEach(t => ScriptApp.deleteTrigger(t)); }
function jpegOf_(file) {
  const tok = ScriptApp.getOAuthToken();
  const meta = JSON.parse(UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + file.getId() + '?fields=thumbnailLink', { headers: { Authorization: 'Bearer ' + tok }, muteHttpExceptions: true }).getContentText() || '{}');
  if (!meta.thumbnailLink) return null;
  const r = UrlFetchApp.fetch(meta.thumbnailLink.replace(/=s\d+$/, '=s1800'), { headers: { Authorization: 'Bearer ' + tok }, muteHttpExceptions: true });
  return r.getResponseCode() === 200 ? r.getBlob().setContentType('image/jpeg') : null;
}
function importFolder() {
  const runs = Number(prop('IMPORT_RUNS') || 0) + 1; P().setProperty('IMPORT_RUNS', String(runs));
  if (runs > 60) { stopImport_(); log_('importazione', 'fermata', '', 'limite di 60 giri raggiunto'); return; }
  const busy = Number(prop('IMPORT_BUSY') || 0);
  if (busy && Date.now() - busy < 6 * 60 * 1000) { log_('importazione', 'saltato', '', 'giro precedente ancora in corso'); return; }
  P().setProperty('IMPORT_BUSY', String(Date.now()));
  try { return importRun_(); } finally { P().deleteProperty('IMPORT_BUSY'); }
}
function importRun_() {
  const t0 = Date.now(), folder = importFolder_();
  const shv = sheet_().getDataRange().getValues(), mi = shv[0].indexOf('msgId'), seen = {};
  for (let i = 1; i < shv.length; i++) if (shv[i][mi]) seen[shv[i][mi]] = true;
  const done = sub_(folder, 'Originali'), extr = sub_(folder, 'Estratti conto'), bad = sub_(folder, 'Non letti');
  const fails = JSON.parse(prop('IMPORT_FAILS') || '{}');
  const it = folder.getFiles(); let n = 0, left = 0;
  while (it.hasNext()) {
    const f = it.next();
    if (Date.now() - t0 > 4.5 * 60 * 1000) { left++; continue; }
    const mime = f.getMimeType(), name = f.getName();
    if (seen['drive:' + f.getId()]) { f.moveTo(done); log_('importazione', 'già importato', '', name); continue; }
    try {
      if (/csv|spreadsheet|excel|text\/plain|xml/.test(mime) || /\.(csv|xlsx?|xml|mt940|sta)$/i.test(name)) { f.moveTo(extr); log_('importazione', 'estratto conto', '', name); continue; }
      let blob = f.getBlob(), m = mime;
      if (/^image\//.test(mime)) { const j = jpegOf_(f); if (j) { blob = j; m = 'image/jpeg'; } else if (!/jpe?g|png|webp/.test(mime) || f.getSize() > 3.5e6) { left++; continue; } }
      else if (!/pdf/.test(mime)) { f.moveTo(bad); log_('importazione', 'formato non letto', '', name + ' ' + mime); continue; }
      readImage_.extra = '\nSe il documento è un estratto conto bancario (Sparkasse) o un resoconto/elenco di transazioni SumUp o PayPal, rispondi solo {"type":"estratto"}.';
      let r; try { r = readImage_(Utilities.base64Encode(blob.getBytes()), m); } finally { readImage_.extra = ''; }
      if (r.type === 'estratto') { f.moveTo(extr); log_('importazione', 'estratto conto', '', name); continue; }
      const photo = m === mime ? f : DriveApp.getFolderById(prop('PHOTO_ID')).createFile(blob.setName(name.replace(/\.[^.]+$/, '') + '.jpg'));
      const c = clean_({ type: r.type, art: r.art, client: r.client, vendor: r.vendor, number: r.number ? String(r.number).replace(/^\*/, '') : '', date: r.date, total: r.total, rate: r.rate == null ? 19 : r.rate, cat: r.category || (r.type === 'cliente' ? 'einnahme' : 'sonstiges'), due: r.due, iban: r.iban, note: [r.note, r.artDefault ? 'lettera D/G mancante: messo D (Denis), da confermare' : '', (r.unsure || []).filter(x => x !== 'art' || !r.artDefault).length ? 'incerto: ' + r.unsure.filter(x => x !== 'art' || !r.artDefault).join(', ') : ''].filter(Boolean).join(' · '), status: 'confirm' });
      const now = new Date().toISOString();
      const rec = Object.assign({ id: Utilities.getUuid(), src: 'import', msgId: 'drive:' + f.getId(), mailUrl: f.getUrl(), owner: 'import', photoId: photo.getId(), mime: m, createdAt: now, createdBy: 'importazione iniziale', updatedAt: now, updatedBy: 'importazione iniziale' }, c);
      const l2 = LockService.getScriptLock(); l2.waitLock(20000);
      try { const sh = sheet_(); const h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]; sh.appendRow(h.map(k => rec[k] === undefined ? '' : rec[k])); } finally { l2.releaseLock(); }
      if (photo === f) f.moveTo(DriveApp.getFolderById(prop('PHOTO_ID'))); else f.moveTo(done);
      fileDoc_(rec);
      log_('importazione', 'importato', rec.id, [rec.type, rec.client || rec.vendor, rec.number, rec.total, ai_.trace].filter(Boolean).join(' · '));
      n++;
    } catch (e) {
      fails[f.getId()] = (fails[f.getId()] || 0) + 1;
      log_('importazione', 'errore', '', name + ' · ' + String(e.message).slice(0, 200));
      if (fails[f.getId()] >= 2) f.moveTo(bad); else left++;
    }
  }
  P().setProperty('IMPORT_FAILS', JSON.stringify(fails));
  if (!left) { stopImport_(); P().deleteProperty('IMPORT_RUNS'); log_('importazione', 'finita', '', n + ' documenti in questo giro'); }
  return { imported: n, left };
}

/* ================= annulla / ripeti (ultime 24 ore, per tutti gli amministratori) ================= */
function undoSheet_() {
  const ss = SpreadsheetApp.openById(prop('SHEET_ID'));
  let u = ss.getSheetByName('Undo');
  if (!u) { u = ss.insertSheet('Undo'); u.appendRow(['op', 'quando', 'chi', 'id', 'prima', 'dopo', 'stato', 'descrizione', 'quando annullato']); }
  return u;
}
function snap_(h, row) {
  const o = {};
  h.forEach((k, i) => { const x = row[i]; o[k] = x instanceof Date ? ((k === 'date' || k === 'due') ? Utilities.formatDate(x, 'Europe/Berlin', 'yyyy-MM-dd') : x.toISOString()) : (x === undefined ? '' : x); });
  return o;
}
function record_(who, id, before, after, descr) {
  const u = undoSheet_(), v = u.getDataRange().getValues();
  for (let i = 1; i < v.length; i++) if (v[i][6] === 'annullato') u.getRange(i + 1, 7).setValue('superato');
  u.appendRow([Utilities.getUuid(), new Date().toISOString(), who, id, before ? JSON.stringify(before) : '', JSON.stringify(after), 'fatto', String(descr).slice(0, 200), '']);
}
function undoInfo_() {
  const v = undoSheet_().getDataRange().getValues(), lim = Date.now() - 24 * 3600 * 1000;
  let un = null, re = null;
  for (let i = v.length - 1; i >= 1; i--) {
    const t = new Date(v[i][1]).getTime();
    if (!un && v[i][6] === 'fatto' && t >= lim) un = { descr: v[i][7], who: v[i][2], when: new Date(v[i][1]).toISOString() };
    if (v[i][6] === 'annullato' && t >= lim && (!re || new Date(v[i][8]).getTime() > new Date(re.undoneAt).getTime())) re = { descr: v[i][7], who: v[i][2], when: new Date(v[i][1]).toISOString(), undoneAt: new Date(v[i][8]).toISOString() };
  }
  return { undo: un, redo: re };
}
function undoRedo_(who, redo) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const u = undoSheet_(), v = u.getDataRange().getValues(), lim = Date.now() - 24 * 3600 * 1000;
    let pick = -1;
    for (let i = v.length - 1; i >= 1; i--) {
      if (new Date(v[i][1]).getTime() < lim) continue;
      if (!redo && v[i][6] === 'fatto') { pick = i; break; }
      if (redo && v[i][6] === 'annullato' && (pick < 0 || new Date(v[i][8]).getTime() > new Date(v[pick][8]).getTime())) pick = i;
    }
    if (pick < 0) return { none: true, info: undoInfo_() };
    const id = v[pick][3], target = redo ? JSON.parse(v[pick][5]) : (v[pick][4] ? JSON.parse(v[pick][4]) : null);
    const sh = sheet_(), d = sh.getDataRange().getValues(), h = d[0], idc = h.indexOf('id');
    for (let r = 1; r < d.length; r++) if (d[r][idc] === id) {
      let row;
      if (target) row = h.map((k, j) => target[k] === undefined ? d[r][j] : target[k]);
      else { row = d[r].slice(); row[h.indexOf('deleted')] = true; row[h.indexOf('deletedAt')] = new Date().toISOString(); row[h.indexOf('deletedBy')] = who + ' (annulla)'; }
      sh.getRange(r + 1, 1, 1, h.length).setValues([row]);
      fileDoc_(snap_(h, row));
      break;
    }
    u.getRange(pick + 1, 7).setValue(redo ? 'fatto' : 'annullato');
    if (!redo) u.getRange(pick + 1, 9).setValue(new Date().toISOString());
    log_(who, redo ? 'ripristinato' : 'annullato', id, v[pick][7] + ' (' + v[pick][2] + ')');
    return { ok: true, descr: v[pick][7], id, info: undoInfo_() };
  } finally { lock.releaseLock(); }
}

/* ================= cartella unica "Tutte le ricevute" su Drive =================
 * Tutte le ricevute/2026-09/2026-09-07_DM_acquisto_18,05.jpg
 * Tutte le ricevute/Stornati/...   Tutte le ricevute/Privati/...
 * I file collegati all'app vengono spostati e rinominati (stesso file, stesso ID); gli originali HEIC restano in Importazione iniziale/Originali. */
function allFolder_() {
  let id = prop('ALL_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const f = DriveApp.getFolderById(prop('FOLDER_ID')).createFolder('Tutte le ricevute');
  P().setProperty('ALL_ID', f.getId());
  return f;
}
function fileName_(d) {
  const clean = x => String(x || '').replace(/[\\/:*?"<>|#%]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40);
  const date = d.date instanceof Date ? Utilities.formatDate(d.date, 'Europe/Berlin', 'yyyy-MM-dd') : String(d.date || 'senza-data').slice(0, 10);
  const kind = d.type === 'cliente' ? 'ricevuta' : d.type === 'fattura' ? 'fattura' : 'acquisto';
  const tot = d.total === '' || d.total == null ? '' : String(Math.round(Number(d.total) * 100) / 100).replace('.', ',');
  const ext = /pdf/.test(d.mime || '') ? 'pdf' : /png/.test(d.mime || '') ? 'png' : 'jpg';
  return [date, clean(d.type === 'cliente' ? d.client : d.vendor) || 'documento', kind, d.type === 'cliente' ? clean(d.number) : '', tot].filter(Boolean).join('_') + '.' + ext;
}
function fileDoc_(d) {
  try {
    if (!d || !d.photoId) return;
    const all = allFolder_(), file = DriveApp.getFileById(d.photoId);
    const date = d.date instanceof Date ? Utilities.formatDate(d.date, 'Europe/Berlin', 'yyyy-MM') : String(d.date || '').slice(0, 7);
    const del = d.deleted === true || String(d.deleted).toUpperCase() === 'TRUE';
    const priv = d.priv === true || String(d.priv).toUpperCase() === 'TRUE';
    const target = sub_(all, del ? 'Stornati' : priv ? 'Privati' : (/^\d{4}-\d{2}$/.test(date) ? date : 'Senza data'));
    const name = fileName_(d);
    if (file.getName() !== name) file.setName(name);
    const parents = file.getParents(); let inside = false;
    while (parents.hasNext()) if (parents.next().getId() === target.getId()) inside = true;
    if (!inside) file.moveTo(target);
  } catch (e) { log_('drive', 'errore cartella', d && d.id, String(e.message).slice(0, 200)); }
}
function organizeAll() {
  const t0 = Date.now(), done = JSON.parse(prop('ORG_DONE') || '{}');
  const docs = listDocs_(true); let n = 0, left = 0;
  for (const d of docs) {
    if (!d.photoId || done[d.id]) continue;
    if (Date.now() - t0 > 5 * 60 * 1000) { left++; continue; }
    fileDoc_(d); done[d.id] = 1; n++;
  }
  P().setProperty('ORG_DONE', JSON.stringify(done));
  log_('drive', 'cartella unica', '', n + ' file sistemati' + (left ? ', ' + left + ' ancora da fare' : ''));
  Logger.log(n + ' file sistemati, ' + left + ' da fare');
}

/* ================= Fai per me: l'AI traduce la richiesta in filtri o modifiche, i conti li fa l'app ================= */
function agent_(q, lang, who) {
  q = String(q || '').slice(0, 500);
  const today = Utilities.formatDate(new Date(), 'Europe/Berlin', 'yyyy-MM-dd');
  const prompt = `Sei "Fai per me", l'aiutante contabile dell'app Ricevute di Waiblingen Ink (studio di tatuaggi). Oggi è ${today} (${Utilities.formatDate(new Date(), 'Europe/Berlin', 'EEEE')}).
NON rispondi con i dati: traduci la richiesta in un FILTRO sui documenti e, se chiesto, in una MODIFICA. I conti li fa l'app.
Documenti: tipo "cliente" (ricevuta a cliente = incasso), "acquisto" (scontrino pagato), "fattura" (fattura di fornitore già pagata). Chi: "D" Denis, "G" Giova Tattoos (Giovanni), "W" Waiblingen Ink verso tatuatore (affitto postazione). "Tatuaggi" = ricevute a cliente. Categorie: ${CATS.join(', ')} (einnahme tatuaggio, anzahlung acconto, platzmiete, material, miete, energie, telefon, software abbonamenti, versicherung, werbung, fahrzeug auto e carburante, buero ufficio, gebuehren, steuer, beratung, sonstiges altro).
Rispondi SOLO con JSON:
{"kind":"list|edit|answer","title":"titolo breve della pagina","filter":{"from":"YYYY-MM-DD"|null,"to":"YYYY-MM-DD"|null,"weekdays":[1-7, 1=lunedì]|[],"types":[]|["cliente","acquisto","fattura"],"arts":[]|["D","G","W"],"cats":[],"text":"parola da cercare in cliente/fornitore/numero/nota"|null,"min":numero|null,"max":numero|null,"status":"confirm"|"ok"|null,"priv":true|false|null},"set":{"cat":"...","rate":0|7|19,"status":"ok","priv":true|false,"art":"D|G|W"},"ask":"list|count|sum|items","pick":"all|last|first","item":{"name":"nome del prodotto","words":["parole da cercare nelle righe dello scontrino, anche abbreviazioni, marca, tedesco e italiano"]}|null,"answer":"frase breve"}
PRODOTTI: se l'utente chiede di un ARTICOLO comprato (quanti pezzi o pacchi, quanto speso solo per quel prodotto, es. Zewa, guanti, inchiostro, carta igienica, benzina), metti "ask":"items" e "item" con il nome e 3-8 parole di ricerca (marca, nome tedesco e italiano, abbreviazioni da scontrino: es. Zewa -> ["zewa","toilettenpapier","klopapier","toilet","carta igienica"]); in quel caso NON mettere il prodotto in filter.text e metti types ["acquisto","fattura"]. Se chiede QUANDO l'ha comprato l'ultima volta metti "pick":"last", la prima volta "pick":"first", altrimenti "all". Se non dice un periodo lascia from e to null: si cerca in tutti gli scontrini. "ask":"count" se chiede quanti documenti, "sum" se chiede quanto in tutto, altrimenti "list".
Regole: "list" per elenchi, riepiloghi, PDF, totali. "edit" solo se l'utente chiede di cambiare, mettere, segnare, confermare (in "set" solo i campi da cambiare, tra cat, rate, status, priv, art). "answer" solo se la richiesta non riguarda ricevute e fatture: allora rispondi gentilmente che puoi aiutare solo con la contabilità. Mesi senza anno = l'anno più recente non nel futuro. Il titolo e la risposta in ${lang === 'de' ? 'TEDESCO' : 'italiano'}.
Richiesta: ${q}`;
  const r = ai_([{ text: prompt }], true);
  const f = r.filter || {}, okD = x => /^\d{4}-\d{2}-\d{2}$/.test(String(x || '')) ? String(x) : null;
  const filter = { from: okD(f.from), to: okD(f.to),
    weekdays: (Array.isArray(f.weekdays) ? f.weekdays : []).map(Number).filter(x => x >= 1 && x <= 7),
    types: (Array.isArray(f.types) ? f.types : []).filter(x => ['cliente', 'acquisto', 'fattura'].indexOf(x) >= 0),
    arts: (Array.isArray(f.arts) ? f.arts : []).filter(x => ['D', 'G', 'W'].indexOf(x) >= 0),
    cats: (Array.isArray(f.cats) ? f.cats : []).filter(x => CATS.indexOf(x) >= 0),
    text: f.text ? String(f.text).slice(0, 60) : null, min: isFinite(f.min) && f.min !== null ? Number(f.min) : null, max: isFinite(f.max) && f.max !== null ? Number(f.max) : null,
    status: f.status === 'confirm' || f.status === 'ok' ? f.status : null, priv: f.priv === true || f.priv === false ? f.priv : null };
  const set = {}, s0 = r.set || {};
  if (CATS.indexOf(s0.cat) >= 0) set.cat = s0.cat;
  if ([0, 7, 19].indexOf(Number(s0.rate)) >= 0 && s0.rate !== null && s0.rate !== '') set.rate = Number(s0.rate);
  if (s0.status === 'ok') set.status = 'ok';
  if (s0.priv === true || s0.priv === false) set.priv = s0.priv;
  if (['D', 'G', 'W'].indexOf(s0.art) >= 0) set.art = s0.art;
  const kind = r.kind === 'edit' && Object.keys(set).length ? 'edit' : r.kind === 'answer' ? 'answer' : 'list';
  log_(who, 'fai per me', '', q);
  const it = r.item && r.item.name ? { name: String(r.item.name).slice(0, 60), words: (Array.isArray(r.item.words) ? r.item.words : []).concat(r.item.name).map(x => String(x).toLowerCase().trim()).filter(x => x.length >= 3).slice(0, 10) } : null;
  const ask = it ? 'items' : ['count', 'sum'].indexOf(r.ask) >= 0 ? r.ask : 'list';
  if (it) { filter.text = null; if (!filter.types.length) filter.types = ['acquisto', 'fattura']; }
  const pick = it && ['last', 'first'].indexOf(r.pick) >= 0 ? r.pick : 'all';
  return { ask, pick, item: it, kind, title: String(r.title || q).replace(/\s+[\u2013\u2014-]+\s+/g, ' · ').slice(0, 120), filter, set, answer: String(r.answer || '') };
}
function agentApply_(ids, set, q, who) {
  ids = (Array.isArray(ids) ? ids : []).slice(0, 150).map(String);
  const s = {}; set = set || {};
  if (CATS.indexOf(set.cat) >= 0) s.cat = set.cat;
  if ([0, 7, 19].indexOf(Number(set.rate)) >= 0 && set.rate !== null && set.rate !== '') s.rate = Number(set.rate);
  if (set.status === 'ok') s.status = 'ok';
  if (set.priv === true || set.priv === false) s.priv = set.priv;
  if (['D', 'G', 'W'].indexOf(set.art) >= 0) s.art = set.art;
  if (!Object.keys(s).length) throw new Error('niente_da_cambiare');
  const docs = listDocs_(true), by = {}; docs.forEach(d => by[d.id] = d);
  let n = 0;
  ids.forEach(id => { const x = by[id]; if (!x || x.deleted) return; const d = Object.assign({}, x, s); d.priv = s.priv !== undefined ? s.priv : x.priv === true; saveDoc_(d, null, null, who + ' · Fai per me'); n++; });
  log_(who, 'fai per me: modifica', '', n + ' documenti · ' + String(q || '').slice(0, 200));
  return { ok: true, n };
}

/* ================= righe degli scontrini: lette dalla foto una volta sola e salvate nel foglio "Articoli" ================= */
const LINES_PROMPT = `Leggi lo scontrino o la fattura nella foto ed elenca TUTTE le righe di articoli comprati. Rispondi SOLO con JSON {"lines":[{"desc":"testo della riga come stampato","name":"nome chiaro del prodotto con marca, in tedesco come sullo scontrino","qty":numero di pezzi o confezioni (se c'è "2 x" o "2 St" metti 2; se non indicato 1; per peso o litri metti la quantità e unit),"unit":"pz|kg|l","price":prezzo unitario in euro|null,"total":totale della riga in euro}]}. Gli sconti sono righe con total negativo. Non mettere subtotali, IVA, pagamento, resto. Se non leggi un valore metti null.`;
function linesSheet_() {
  const ss = SpreadsheetApp.openById(prop('SHEET_ID'));
  let s = ss.getSheetByName('Articoli');
  if (!s) { s = ss.insertSheet('Articoli'); s.appendRow(['id', 'quando', 'righe']); }
  return s;
}
function lines_(ids) {
  ids = (Array.isArray(ids) ? ids : []).slice(0, 8).map(String);
  const sh = linesSheet_(), v = sh.getDataRange().getValues(), cache = {};
  for (let i = 1; i < v.length; i++) cache[v[i][0]] = v[i][2];
  const out = {}, missing = [], t0 = Date.now();
  ids.forEach(id => {
    if (cache[id]) { try { out[id] = JSON.parse(cache[id]); return; } catch (e) {} }
    if (Date.now() - t0 > 4 * 60 * 1000) { missing.push(id); return; }
    try {
      const p = photo_(id);
      if (p.none) { out[id] = null; return; }
      const r = ai_([{ text: LINES_PROMPT }, { inline_data: { mime_type: p.mime, data: p.data } }], true);
      const L = (Array.isArray(r.lines) ? r.lines : []).slice(0, 80).map(x => ({ desc: String(x.desc || '').slice(0, 80), name: String(x.name || '').slice(0, 80),
        qty: isFinite(x.qty) && x.qty !== null && x.qty !== '' ? Number(x.qty) : 1, unit: ['pz', 'kg', 'l'].indexOf(x.unit) >= 0 ? x.unit : 'pz',
        price: isFinite(x.price) && x.price !== null && x.price !== '' ? Number(x.price) : null, total: isFinite(x.total) && x.total !== null && x.total !== '' ? Number(x.total) : null }));
      sh.appendRow([id, new Date().toISOString(), JSON.stringify(L)]);
      out[id] = L;
    } catch (e) { missing.push(id); log_('fai per me', 'righe errore', id, String(e.message).slice(0, 200)); }
  });
  return { lines: out, missing };
}

/* ================= doppioni: stessa spesa arrivata da fornitore, PayPal, carta =================
 * Livello 1: un numero di riferimento in comune + stesso importo + date entro 10 giorni = stessa spesa.
 * Livello 2: nessun numero in comune ma stesso importo, date entro 3 giorni e stesso fornitore (Anthropic = ANTHROPIC* CLAUDE SUB = Anthropic Ireland).
 *            Non si uniscono se sono due documenti dello stesso tipo con numeri diversi (es. due ordini eBay veri da 4,99 lo stesso giorno).
 * Si tiene la copia migliore (confermata a mano, con PDF o foto, fattura del fornitore), le altre vanno in Stornati e si possono annullare. */
const DUP_STOP = ['gmbh', 'ltd', 'limited', 'ireland', 'inc', 'kg', 'sub', 'com', 'www', 'paypal', 'europe', 'sarl', 'the', 'und', 'and', 'online', 'shop', 'store', 'services', 'service', 'payment', 'payments', 'zahlung', 'pte', 'llc', 'germany', 'deutschland', 'gbr', 'mbh', 'co'];
function ensureCols_() {
  const sh = sheet_(), h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  ['refs', 'altre'].forEach(k => { if (h.indexOf(k) < 0) { sh.getRange(1, sh.getLastColumn() + 1).setValue(k); } });
}
function vtok_(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter(w => w.length >= 3 && DUP_STOP.indexOf(w) < 0 && !/^\d+$/.test(w)); }
function refsOf_(d) {
  const out = {}; let r = [];
  try { r = JSON.parse(d.refs || '[]'); } catch (e) {}
  const add = (raw, t) => { const v = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); if (v.length >= 6 && (v.match(/\d/g) || []).length >= 4 && !/^(19|20)\d{6}$/.test(v) && !out[v]) out[v] = t; };
  r.forEach(x => add(x && x.v, x && x.t || 'altro'));
  add(d.number, 'numero');
  (String([d.vendor, d.note].join(' ')).toUpperCase().match(/[A-Z0-9][A-Z0-9\-\/\.]{5,}[A-Z0-9]/g) || []).forEach(t => add(t, 'altro'));
  return out;
}
function dayDiff_(a, b) { return Math.abs(new Date(String(a).slice(0, 10) + 'T12:00:00Z') - new Date(String(b).slice(0, 10) + 'T12:00:00Z')) / 864e5; }
function kind_(d) { const v = String(d.vendor || ''); return /paypal/i.test(v) ? 'paypal' : /\*/.test(v) ? 'carta' : 'fornitore'; }
function score_(d) { return (d.status === 'ok' && d.src !== 'email' ? 8 : 0) + (d.status === 'ok' ? 4 : 0) + (d.photoId ? 3 : 0) + (kind_(d) === 'fornitore' ? 2 : kind_(d) === 'paypal' ? 1 : 0) + (d.rate !== '' && d.rate != null ? 1 : 0); }
function dupPair_(a, b) {
  if (Math.abs((+a.total || 0) - (+b.total || 0)) > 0.005 || !(+a.total)) return null;
  const dd = dayDiff_(a.date, b.date);
  if (dd > 10) return null;
  const ra = refsOf_(a), rb = refsOf_(b), shared = Object.keys(ra).filter(k => rb[k]);
  if (shared.length) return 'numero ' + shared[0];
  if (dd > 3) return null;
  const ta = vtok_(a.vendor), tb = vtok_(b.vendor), same = ta.filter(w => tb.indexOf(w) >= 0);
  if (!same.length) return null;
  if (Object.keys(ra).length && Object.keys(rb).length && kind_(a) === kind_(b)) return null;
  return 'stesso fornitore (' + same[0] + '), importo e data';
}
function dedupe_(dry, onlyId) {
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    ensureCols_();
    const sh = sheet_(), v = sh.getDataRange().getValues(), h = v[0], idc = h.indexOf('id');
    const docs = [];
    for (let i = 1; i < v.length; i++) { const d = snap_(h, v[i]); d._row = i; if (d.deleted === true || String(d.deleted).toUpperCase() === 'TRUE' || d.type === 'cliente' || !d.date) continue; docs.push(d); }
    const par = {}, why = {}; const f = x => par[x] === x ? x : (par[x] = f(par[x]));
    docs.forEach(d => par[d.id] = d.id);
    for (let i = 0; i < docs.length; i++) for (let j = i + 1; j < docs.length; j++) {
      const a = docs[i], b = docs[j];
      if (onlyId && a.id !== onlyId && b.id !== onlyId) continue;
      if (String(a.priv).toUpperCase() === 'TRUE' !== (String(b.priv).toUpperCase() === 'TRUE')) continue;
      const w = dupPair_(a, b); if (!w) continue;
      par[f(a.id)] = f(b.id); why[a.id + '|' + b.id] = w;
    }
    const groups = {}; docs.forEach(d => { const r = f(d.id); (groups[r] = groups[r] || []).push(d); });
    const merged = [], who = 'doppioni@sistema', now = new Date().toISOString();
    Object.keys(groups).forEach(k => {
      const g = groups[k]; if (g.length < 2) return;
      g.sort((x, y) => score_(y) - score_(x) || String(x.createdAt).localeCompare(String(y.createdAt)));
      const keep = g[0], rest = g.slice(1);
      const reason = rest.map(r => why[keep.id + '|' + r.id] || why[r.id + '|' + keep.id] || 'stessa spesa (gruppo)');
      merged.push({ tieni: [keep.date, keep.vendor, keep.total].join(' · '), storna: rest.map((r, i) => [r.date, r.vendor, r.total, reason[i]].join(' · ')) });
      if (dry) return;
      const before = h.map(c => v[keep._row][h.indexOf(c)]), krow = v[keep._row].slice();
      const set = (c, x) => { const i = h.indexOf(c); if (i >= 0) krow[i] = x; };
      let altre = []; try { altre = JSON.parse(keep.altre || '[]'); } catch (e) {}
      let krefs = []; try { krefs = JSON.parse(keep.refs || '[]'); } catch (e) {}
      rest.forEach(r => {
        if (!keep.number && r.number) { set('number', r.number); keep.number = r.number; }
        if ((keep.rate === '' || keep.rate == null) && r.rate !== '' && r.rate != null) { set('rate', r.rate); keep.rate = r.rate; }
        if (!keep.photoId && r.photoId) { set('photoId', r.photoId); set('mime', r.mime); keep.photoId = r.photoId; }
        if (r.mailUrl) altre.push(r.mailUrl);
        try { krefs = krefs.concat(JSON.parse(r.refs || '[]')); } catch (e) {}
        if (r.number) krefs.push({ t: 'numero', v: String(r.number) });
        const rb = v[r._row].slice(), ra = rb.slice();
        ra[h.indexOf('deleted')] = true; ra[h.indexOf('deletedAt')] = now; ra[h.indexOf('deletedBy')] = who;
        ra[h.indexOf('note')] = String(('doppione di ' + [keep.date, keep.vendor, keep.total + ' €'].join(' · ') + ' · ' + (r.note || '')).slice(0, 500));
        if (r.photoId && r.photoId === keep.photoId) { ra[h.indexOf('photoId')] = ''; }
        sh.getRange(r._row + 1, 1, 1, h.length).setValues([ra]);
        record_(who, r.id, snap_(h, rb), snap_(h, ra), 'doppione stornato · ' + [r.vendor, r.total + ' €'].join(' · '));
        log_(who, 'doppione stornato', r.id, 'tenuto ' + keep.id + ' · ' + (why[keep.id + '|' + r.id] || why[r.id + '|' + keep.id] || 'stessa spesa'));
        fileDoc_(snap_(h, ra));
      });
      set('altre', JSON.stringify(altre.filter((x, i, a) => a.indexOf(x) === i).slice(0, 10)));
      set('refs', JSON.stringify(krefs.slice(0, 20)));
      set('updatedAt', now); set('updatedBy', who);
      sh.getRange(keep._row + 1, 1, 1, h.length).setValues([krow]);
      record_(who, keep.id, snap_(h, before), snap_(h, krow), 'unito con ' + rest.length + ' doppioni · ' + [keep.vendor, keep.total + ' €'].join(' · '));
      fileDoc_(snap_(h, krow));
    });
    if (!dry && merged.length) log_(who, 'pulizia doppioni', '', merged.length + ' spese unite');
    return { merged };
  } finally { lock.releaseLock(); }
}

/* ================= spese private: non entrano nell'app =================
 * All'import email l'AI decide studio / privata / dubbio. Privata = scartata (nessuna riga, foto, registro o backup; l'email resta nella casella).
 * Dubbio = "da confermare". Se Denis o Linda toccano "Privata" il documento viene cancellato del tutto (discard_), senza annulla.
 * Per Amazon, eBay, PayPal e simili decide l'articolo, non il venditore.
 * I fornitori segnati come privati si ricordano solo come impronta cifrata (VENDOR_PRIV), mai con il nome leggibile. */
const MARKET = /amazon|ebay|paypal|aliexpress|temu|otto\b|kaufland|etsy|shein|wish|klarna|zalando/i;
function vkey_(v) { return vtok_(v).slice(0, 2).join(' '); }
function vhash_(k) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature('vendor:' + k, prop('SECRET'))).slice(0, 22); }
function usoPrompt_() {
  if (!usoPrompt_.txt) {
    const learned = JSON.parse(prop('VENDOR_USE') || '{}'), studio = {};
    listDocs_(false).forEach(d => { if (!d.priv && d.type !== 'cliente' && d.status === 'ok' && d.vendor && !MARKET.test(d.vendor)) studio[String(d.vendor).slice(0, 40)] = 1; });
    Object.keys(learned).forEach(k => { if (learned[k] === 'studio') studio[k] = 1; });
    usoPrompt_.txt = `USO: Waiblingen Ink è uno studio di tatuaggi. Decidi se la spesa è per lo STUDIO o PRIVATA.
Studio: materiale per tatuaggi (inchiostri, aghi, cartucce, guanti, pellicola, carta, disinfettanti, stencil), pulizia, ufficio e stampanti, software e abbonamenti digitali, telefono e internet, pubblicità, arredamento e attrezzatura dello studio, corsi, affitto, energia, assicurazioni, tasse e consulenze dell'attività.
Privata: vestiti e scarpe, spesa alimentare, piante e giardino, gomme e ricambi auto privata, legna e carbone, casa, animali, giocattoli, tempo libero, ristoranti privati.
Per Amazon, eBay, PayPal, AliExpress, Temu e altri marketplace decidi dall'ARTICOLO comprato, non dal venditore. Se non sei sicuro metti "dubbio".
Fornitori già usati per lo studio: ${Object.keys(studio).slice(0, 80).join(', ') || 'nessuno'}.
Aggiungi al JSON: "uso":"studio|privato|dubbio","perche":"motivo breve in italiano (es. abbonamento software)"`;
  }
  return usoPrompt_.txt;
}
function usoOf_(r) {
  const vendor = String(r.vendor || ''), k = vkey_(vendor);
  if (k && !MARKET.test(vendor)) {
    if (JSON.parse(prop('VENDOR_PRIV') || '[]').indexOf(vhash_(k)) >= 0) return { uso: 'privato', perche: '' };
    if (JSON.parse(prop('VENDOR_USE') || '{}')[k] === 'studio') return { uso: 'studio', perche: 'fornitore dello studio' };
  }
  const uso = ['studio', 'privato', 'dubbio'].indexOf(r.uso) >= 0 ? r.uso : 'studio';
  return { uso, perche: String(r.perche || '').slice(0, 120) };
}
function learnPriv_(vendor) {
  const k = vkey_(vendor); if (!k || MARKET.test(String(vendor || ''))) return;
  const L = JSON.parse(prop('VENDOR_PRIV') || '[]'), h = vhash_(k);
  if (L.indexOf(h) < 0) { L.push(h); P().setProperty('VENDOR_PRIV', JSON.stringify(L.slice(-500))); }
  const U = JSON.parse(prop('VENDOR_USE') || '{}'); if (U[k]) { delete U[k]; P().setProperty('VENDOR_USE', JSON.stringify(U)); }
}
/* "Privata": cancella il documento per sempre, con foto, registro, annulla e articoli. */
function discard_(id, who, noLearn) {
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    const d = listDocs_(true).filter(x => x.id === id)[0];
    if (!d) return { ok: false };
    if (d.type === 'cliente') throw new Error('non_privata');
    if (!noLearn) learnPriv_(d.vendor);
    const set = {}; set[id] = 1;
    const ss = SpreadsheetApp.openById(prop('SHEET_ID'));
    // anche i doppioni già stornati della stessa spesa (stessa spesa arrivata da PayPal, carta, fornitore)
    ss.getSheetByName('Log').getDataRange().getValues().forEach(r => { if (r[2] === 'doppione stornato' && String(r[4]).indexOf('tenuto ' + id) >= 0 && r[3]) set[r[3]] = 1; });
    purgeSs_(ss, set, false).forEach(driveDel_);
    return { ok: true };
  } finally { lock.releaseLock(); }
}
/* Cancella per sempre un file di Drive (non nel cestino). */
function driveDel_(fileId) {
  if (!fileId) return;
  UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) + '?supportsAllDrives=true',
    { method: 'delete', headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });
}
function delRows_(sh, pred) {
  if (!sh) return 0;
  const v = sh.getDataRange().getValues(); let n = 0;
  for (let i = v.length - 1; i >= 1; i--) if (pred(v[i])) { sh.deleteRow(i + 1); n++; }
  return n;
}
/* Toglie da un foglio archivio (vero o copia di backup) i documenti in set; con flags anche quelli segnati pers/priv.
 * Restituisce le foto da cancellare (solo se nessun documento rimasto le usa). */
function purgeSs_(ss, set, flags) {
  const sh = ss.getSheetByName('Docs'); if (!sh) return [];
  const v = sh.getDataRange().getValues(), h = v[0], idc = h.indexOf('id'), pc = h.indexOf('photoId');
  const yes = c => { const i = h.indexOf(c); return r => i >= 0 && (r[i] === true || String(r[i]).toUpperCase() === 'TRUE'); };
  const isP = yes('pers'), isV = yes('priv');
  if (flags) for (let i = 1; i < v.length; i++) if (isP(v[i]) || isV(v[i])) set[v[i][idc]] = 1;
  const ids = Object.keys(set).filter(Boolean);
  const photos = {}, used = {};
  for (let i = 1; i < v.length; i++) { const p = pc >= 0 ? v[i][pc] : ''; if (!p) continue; if (set[v[i][idc]]) photos[p] = 1; else used[p] = 1; }
  delRows_(sh, r => !!set[r[idc]]);
  if (flags && h.indexOf('pers') >= 0) sh.deleteColumn(h.indexOf('pers') + 1);
  const has = x => { const t = String(x || ''); return ids.some(id => t.indexOf(id) >= 0); };
  const PERS = /personal|password personali|personali denis/i;
  delRows_(ss.getSheetByName('Log'), r => !!set[r[3]] || has(r[4]) || PERS.test(String(r[2]) + ' ' + String(r[4])));
  delRows_(ss.getSheetByName('Undo'), r => !!set[r[3]] || has(r[4]) || has(r[5]) || PERS.test(String(r[7])));
  delRows_(ss.getSheetByName('Articoli'), r => !!set[r[0]]);
  return Object.keys(photos).filter(p => !used[p]);
}
/* Pulizia una tantum (Esegui dall'editor): toglie dall'app tutte le spese private già salvate (pers o priv),
 * cancella foto e cartelle Personali/Privati, ripulisce i backup e ricrea il foglio senza cronologia delle versioni.
 * Se il tempo non basta riparte da sola dopo un minuto. */
function pulisciPersonali() {
  const t0 = Date.now(), lock = LockService.getScriptLock(); lock.waitLock(60000);
  try {
    const p = P(), set = JSON.parse(prop('CLEAN_IDS') || '{}');
    if (!prop('CLEAN_STEP')) {
      purgeSs_(SpreadsheetApp.openById(prop('SHEET_ID')), set, true).forEach(driveDel_);
      p.setProperty('CLEAN_IDS', JSON.stringify(set));
      ['PERS_HASH', 'PERS_SALT'].forEach(k => p.deleteProperty(k));
      const U = JSON.parse(prop('VENDOR_USE') || '{}'), PV = JSON.parse(prop('VENDOR_PRIV') || '[]');
      Object.keys(U).forEach(k => { if (U[k] !== 'studio') { const h = vhash_(k); if (PV.indexOf(h) < 0) PV.push(h); delete U[k]; } });
      p.setProperty('VENDOR_USE', JSON.stringify(U)); p.setProperty('VENDOR_PRIV', JSON.stringify(PV));
      const all = allFolder_();
      ['Personali Denis', 'Privati'].forEach(n => { const it = all.getFoldersByName(n); while (it.hasNext()) driveDel_(it.next().getId()); });
      p.setProperty('CLEAN_STEP', 'backup');
      Logger.log('Archivio ripulito: ' + Object.keys(set).length + ' documenti privati tolti');
    }
    if (prop('CLEAN_STEP') === 'backup') {
      const done = JSON.parse(prop('CLEAN_BK') || '[]'), folder = DriveApp.getFolderById(prop('BACKUP_ID'));
      const files = []; const it = folder.getFiles(); while (it.hasNext()) files.push(it.next());
      for (const f of files) {
        if (done.indexOf(f.getId()) >= 0) continue;
        if (Date.now() - t0 > 4.5 * 60 * 1000) { p.setProperty('CLEAN_BK', JSON.stringify(done)); again_(); return 'continua tra un minuto'; }
        const nf = cleanBackup_(f, set, folder); if (nf) done.push(nf);
        driveDel_(f.getId());
      }
      p.setProperty('CLEAN_BK', JSON.stringify(done));
      p.setProperty('CLEAN_STEP', 'sheet');
    }
    if (prop('CLEAN_STEP') === 'sheet') {
      freshSheet_();
      ['CLEAN_STEP', 'CLEAN_BK', 'CLEAN_IDS'].forEach(k => p.deleteProperty(k));
      ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'pulisciPersonali').forEach(t => ScriptApp.deleteTrigger(t));
      Logger.log('Pulizia finita');
      return 'pulizia finita';
    }
  } finally { lock.releaseLock(); }
}
function again_() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'pulisciPersonali').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('pulisciPersonali').timeBased().after(60 * 1000).create();
}
/* Backup vecchio -> copia pulita con lo stesso nome (il file vecchio poi si cancella per sempre). */
function cleanBackup_(f, set, folder) {
  const name = f.getName(), auth = { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() };
  if (/\.json$/i.test(name)) {
    let arr = []; try { arr = JSON.parse(f.getBlob().getDataAsString()); } catch (e) { return null; }
    const yes = x => x === true || String(x).toUpperCase() === 'TRUE';
    arr = arr.filter(d => !set[d.id] && !yes(d.pers) && !yes(d.priv)).map(d => { delete d.pers; return d; });
    return folder.createFile(Utilities.newBlob(JSON.stringify(arr), 'application/json', name)).getId();
  }
  if (/\.xlsx$/i.test(name)) {
    const r = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + f.getId() + '/copy?fields=id&supportsAllDrives=true', { method: 'post', contentType: 'application/json', headers: auth, muteHttpExceptions: true,
      payload: JSON.stringify({ name: 'pulizia_tmp', mimeType: 'application/vnd.google-apps.spreadsheet', parents: [folder.getId()] }) });
    if (r.getResponseCode() !== 200) throw new Error('conversione backup ' + r.getResponseCode());
    const tmp = JSON.parse(r.getContentText()).id;
    try {
      purgeSs_(SpreadsheetApp.openById(tmp), Object.assign({}, set), true);
      SpreadsheetApp.flush();
      const x = UrlFetchApp.fetch('https://docs.google.com/spreadsheets/d/' + tmp + '/export?format=xlsx', { headers: auth }).getBlob().setName(name);
      return folder.createFile(x).getId();
    } finally { driveDel_(tmp); }
  }
  return null;
}
/* Nuovo foglio archivio identico ma senza cronologia delle versioni (dove si vedrebbero le righe tolte); stessi permessi, nessuna email di avviso. */
function freshSheet_() {
  const oldId = prop('SHEET_ID'), auth = { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, api = 'https://www.googleapis.com/drive/v3/files/';
  SpreadsheetApp.flush();
  const old = DriveApp.getFileById(oldId), copy = old.makeCopy(old.getName(), DriveApp.getFolderById(prop('FOLDER_ID')));
  const pr = UrlFetchApp.fetch(api + oldId + '/permissions?fields=permissions(type,role,emailAddress,domain)&supportsAllDrives=true', { headers: auth, muteHttpExceptions: true });
  if (pr.getResponseCode() === 200) (JSON.parse(pr.getContentText()).permissions || []).forEach(x => {
    if (x.role === 'owner') return;
    const body = { type: x.type, role: x.role }; if (x.emailAddress) body.emailAddress = x.emailAddress; if (x.domain) body.domain = x.domain;
    UrlFetchApp.fetch(api + copy.getId() + '/permissions?sendNotificationEmail=false&supportsAllDrives=true', { method: 'post', contentType: 'application/json', headers: auth, muteHttpExceptions: true, payload: JSON.stringify(body) });
  });
  P().setProperty('SHEET_ID', copy.getId());
  driveDel_(oldId);
}
/* Prova senza toccare niente: quante spese private ci sono ancora nell'archivio. */
function contaPrivate() {
  const v = sheet_().getDataRange().getValues(), h = v[0], yes = c => { const i = h.indexOf(c); return r => i >= 0 && (r[i] === true || String(r[i]).toUpperCase() === 'TRUE'); };
  const isP = yes('pers'), isV = yes('priv'); let a = 0, b = 0;
  for (let i = 1; i < v.length; i++) { if (isP(v[i])) a++; else if (isV(v[i])) b++; }
  Logger.log('Personali importate: ' + a + ' · segnate Privata: ' + b);
  return { personali: a, privata: b };
}

/* ================= PayPal privato e carta privata =================
 * PayPal privato = conto con login denisrider00: le sue email arrivano a denisrider00 e non entrano mai nell'app.
 * Carte private: ultime 4 cifre nella proprietà dello script PRIV_CARDS (es. ["1234"]), mai scritte nel codice.
 * Le email dei negozi (eBay, Amazon...) continuano a passare dalla decisione studio/privata, salvo se citano la carta privata. */
function privCards_() { try { return JSON.parse(prop('PRIV_CARDS') || '[]').map(String); } catch (e) { return []; } }
function isPayPal_(from) { return /@([\w-]+\.)*paypal\.[a-z.]+/i.test(String(from || '')); }
function privCard_(txt) {
  return privCards_().some(c => new RegExp('(\\*|•|·|x|X|\\.\\.\\.|endet auf|endend auf|endet mit|endend mit|ending in|ends in|ending|termina(?:nte)? (?:in|con|per)|finisce (?:con|in|per)|ziffern|karte|card|carta|mastercard|visa)[^0-9\\n]{0,25}' + c + '(?!\\d)', 'i').test(String(txt || '')));
}
function privMail_(raw, owner) {
  const txt = [raw.subject, raw.body].join(' ');
  if (isPayPal_(raw.from) && (/denisrider00/i.test(String(owner || '')) || /denisrider00@gmail\.com/i.test(String(raw.to || '') + ' ' + txt))) return 'paypal privato';
  if (privCard_(txt)) return 'carta privata';
  return '';
}
/* Elenco (senza toccare niente) dei documenti già in archivio arrivati dalla casella info che sono PayPal privato o carta privata. */
function candidatiPrivati() {
  const out = [];
  listDocs_(false).forEach(d => {
    let why = privCard_([d.vendor, d.note, d.number, d.refs].join(' ')) ? 'carta privata (testo)' : '';
    if (!why && d.src === 'email' && d.msgId && !/denisrider00/i.test(String(d.owner))) {
      try { const m = GmailApp.getMessageById(String(d.msgId)); why = privMail_({ from: m.getFrom(), to: m.getTo(), subject: m.getSubject(), body: (m.getPlainBody() || '').slice(0, 6000) }, 'info'); } catch (e) {}
    }
    if (why) out.push([d.id, d.date, d.vendor, d.total, why].join(' | '));
  });
  Logger.log(out.length + ' candidati\n' + out.join('\n'));
  return out;
}
/* Cancella per sempre i documenti scelti da Denis (proprietà DA_ELIMINARE = lista di id), poi svuota la proprietà. */
function eliminaScelti() {
  const ids = JSON.parse(prop('DA_ELIMINARE') || '[]'); let n = 0;
  ids.forEach(id => { if (discard_(String(id), 'denisrider00@gmail.com', true).ok) n++; });
  P().deleteProperty('DA_ELIMINARE');
  Logger.log(n + ' documenti eliminati');
  return n;
}
