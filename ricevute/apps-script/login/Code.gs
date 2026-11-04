/**
 * Ricevute Waiblingen Ink · LOGIN
 * Deploy: Web app, Execute as: "User accessing the web app", Who has access: "Anyone with Google account".
 * Unico permesso chiesto a chi entra: leggere il suo indirizzo email.
 * Rimanda SEMPRE e solo all'app (APP_URL) con un token Google valido 1 ora, che l'app scambia subito con l'API.
 */
const APP_URL = 'https://denis001234.github.io/REGISTRO/ricevute/';
function doGet() {
  const email = Session.getActiveUser().getEmail();
  const target = APP_URL + '#g=' + encodeURIComponent(ScriptApp.getOAuthToken());
  return HtmlService.createHtmlOutput(
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<div style="font-family:Inter,system-ui,sans-serif;max-width:420px;margin:60px auto;padding:24px;text-align:center;color:#0f172a">' +
    '<h2 style="margin:0 0 12px">Ricevute Waiblingen Ink</h2><p>Accesso come <b>' + email + '</b></p>' +
    '<a href="' + target + '" target="_top" style="display:inline-block;margin-top:12px;padding:14px 28px;border-radius:14px;background:#0057FF;color:#fff;text-decoration:none;font-weight:700">Entra nell\'app</a></div>')
    .setTitle('Ricevute Waiblingen Ink');
}
