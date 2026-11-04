/**
 * Ricevute Waiblingen Ink · LOGIN
 * Deploy: Web app, Execute as: "User accessing the web app", Who has access: "Anyone with Google account".
 * Unico permesso richiesto all'utente: leggere il suo indirizzo email.
 * Script properties (uguali al progetto API): SECRET, APP_URL, USERS
 *   USERS = {"info.gardenoftattoo@gmail.com":"admin","denisrider00@gmail.com":"admin","salihu1999@gmail.com":"admin"}
 */
function doGet(e) {
  const p = PropertiesService.getScriptProperties();
  const users = JSON.parse(p.getProperty('USERS') || '{}');
  const appUrl = p.getProperty('APP_URL');
  const email = String(Session.getActiveUser().getEmail() || '').toLowerCase();
  const role = users[email];
  const page = (title, body) => HtmlService.createHtmlOutput(
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<div style="font-family:Inter,system-ui,sans-serif;max-width:420px;margin:60px auto;padding:24px;text-align:center;color:#0f172a">' +
    '<h2 style="margin:0 0 12px">' + title + '</h2>' + body + '</div>')
    .setTitle('Ricevute Waiblingen Ink')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  if (!email) return page('Accesso non riuscito', '<p>Google non ha comunicato il tuo indirizzo. Riprova dal browser con il tuo account.</p>');
  if (!role) return page('Accesso negato', '<p>' + email + ' non è autorizzato.<br>Chiedi a un amministratore di invitarti.</p>');
  const payload = { e: email, r: role, x: Date.now() + 1000 * 60 * 60 * 24 * 7 };
  const body = Utilities.base64EncodeWebSafe(JSON.stringify(payload));
  const sig = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(body, p.getProperty('SECRET')));
  const target = appUrl + '#t=' + body + '.' + sig;
  return page('Ciao!', '<p>Accesso come <b>' + email + '</b></p>' +
    '<a href="' + target + '" target="_top" style="display:inline-block;margin-top:12px;padding:14px 28px;border-radius:14px;background:#0057FF;color:#fff;text-decoration:none;font-weight:700">Entra nell\'app</a>');
}
