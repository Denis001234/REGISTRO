/**
 * Ricevute Waiblingen Ink · Collector per denisrider00@gmail.com
 * Ogni ora legge le nuove email con ricevute/fatture e le manda all'API principale (account info).
 * L'API le salva come "da confermare" (Studio o Privato lo decidete voi nell'app).
 * Non invia mai email a nessuno: legge soltanto e mette l'etichetta "Ricevute/Archiviata".
 * Primo avvio: selezionare setup e premere Esegui, poi autorizzare.
 */
const MAIN_URL = 'https://script.google.com/macros/s/AKfycbwEq6BDCkJEhFbh-9Y3QC55UAQam_HJkwx7lO6W8VTB9otfiXbmgEAtODQjyCHjplIH/exec';
const IMPORT_FROM = '2026/09/01';
const MAIL_HINT = /(rechnung|beleg|quittung|receipt|invoice|fattura|ricevuta|zahlung|payment|bestellung|order|abbuchung|lastschrift|kontoauszug|ihre zahlung|zahlungsbeleg)/i;

function setup() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('importMail').timeBased().everyHours(1).create();
  const r = UrlFetchApp.fetch(MAIN_URL, { method: 'post', contentType: 'text/plain', muteHttpExceptions: true, followRedirects: true,
    payload: JSON.stringify({ action: 'collect', g: ScriptApp.getOAuthToken(), mail: { test: true } }) });
  Logger.log('Collegamento con l\'API: ' + r.getResponseCode() + ' ' + r.getContentText().slice(0, 200));
  return 'pronto';
}

function importMail() {
  const label = GmailApp.getUserLabelByName('Ricevute/Archiviata') || GmailApp.createLabel('Ricevute/Archiviata');
  const threads = GmailApp.search('after:' + IMPORT_FROM + ' -label:Ricevute-Archiviata -in:sent -in:chats -from:me', 0, 15);
  let n = 0;
  for (const th of threads) {
    for (const m of th.getMessages()) {
      const subj = m.getSubject() || '', body = (m.getPlainBody() || '').slice(0, 6000);
      const atts = m.getAttachments({ includeInlineImages: false }).filter(a => /pdf|image\//.test(a.getContentType()) && a.getSize() < 5e6);
      if (!MAIL_HINT.test(subj + ' ' + body.slice(0, 1500)) && !atts.length) continue;
      if (/nachrichten zur freigabe|resoconto (quotidiano|mensile) versamenti|zahlungseingang|auszahlung/i.test(subj)) continue;
      const raw = { from: m.getFrom(), date: Utilities.formatDate(m.getDate(), 'Europe/Berlin', 'yyyy-MM-dd'), subject: subj, body, msgId: m.getId(),
        mailUrl: 'https://mail.google.com/mail/?authuser=denisrider00@gmail.com#all/' + m.getId(),
        att: atts[0] ? { mime: atts[0].getContentType(), data: Utilities.base64Encode(atts[0].getBytes()), name: atts[0].getName() } : null };
      const res = UrlFetchApp.fetch(MAIN_URL, { method: 'post', contentType: 'text/plain', muteHttpExceptions: true, followRedirects: true,
        payload: JSON.stringify({ action: 'collect', g: ScriptApp.getOAuthToken(), mail: raw }) });
      if (res.getResponseCode() !== 200) return n;
      const j = JSON.parse(res.getContentText() || '{}');
      if (j.error) { Logger.log('errore: ' + j.error); if (/manca_chiave|login/.test(j.error)) return n; continue; }
      if (j.stored) n++;
    }
    th.addLabel(label);
  }
  Logger.log(n + ' documenti inviati');
  return n;
}
