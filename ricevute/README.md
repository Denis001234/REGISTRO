# Ricevute Waiblingen Ink

App per ricevute, scontrini e fatture di Waiblingen Ink (Denis Cicala & Linda Salihu-Cicala GbR).
Tutto gratuito: GitHub Pages + Google Apps Script + Google Drive/Fogli + Gemini (piano gratuito).

## Architettura

| Parte | Dove | Cosa fa |
|---|---|---|
| `index.html`, `app.js`, `config.js` | GitHub Pages | App installabile (iPhone, Android, iPad, computer). Nessun segreto nel codice. |
| `apps-script/login` | Apps Script, esegue come l'utente | Legge l'email Google di chi entra, controlla la lista `USERS`, rilascia un token firmato (HMAC, 7 giorni) e rimanda all'app. |
| `apps-script/api` (MODE=main) | Apps Script su info.gardenoftattoo, esegue come info | Archivio su Fogli, foto su Drive, lettura Gemini, assistente, import email ogni ora, backup ogni notte, registro di ogni azione. |
| `apps-script/api` (MODE=collector) | Apps Script su denisrider00 | Ogni ora legge le email di denisrider00 e manda le spese all'API principale come "da confermare". |

## Dati (formato aperto, portabile)

- Foglio Google `Ricevute Waiblingen Ink · Archivio`, scheda **Docs**: una riga per documento.
  Colonne: `id,type,art,client,vendor,number,date,total,rate,cat,due,iban,note,src,mailUrl,msgId,photoId,mime,status,priv,owner,createdAt,createdBy,updatedAt,updatedBy,deleted,deletedAt,deletedBy`
  - `type`: `cliente` (ricevuta emessa), `acquisto` (spesa pagata), `fattura` (da pagare)
  - `art`: `D` Denis, `G` Giova Tattoos (flusso A), `W` Waiblingen Ink verso tatuatore
  - `status`: `confirm` = da confermare Studio/Privato; `priv=true` = privata, esclusa da totali ed export
  - Niente si cancella davvero: lo storno imposta `deleted`, `deletedAt`, `deletedBy`.
- Scheda **Log**: `quando, chi, azione, id, dettagli` (ogni caricamento, modifica campo per campo con prima/dopo, storno, import, backup).
- Cartella Drive `Waiblingen Ink Ricevute/`: `Foto/`, `Da email/`, `Backup/` (ogni notte .xlsx + .json, 60 giorni).

Per migrare a un altro sistema: scaricare il foglio (xlsx/csv) e la cartella Drive. Il JSON di backup contiene tutto.

## API (POST text/plain, JSON)

`{token, action, ...}` con action: `me`, `list`, `save {doc, photo(base64), mime}`, `del {id}`, `read {photo, mime}`, `photo {id}`, `history {id}`, `ask {q}`, `importNow`.
Ruoli: `admin` (tutto), `viewer` (sola lettura, niente documenti privati). Le scritture sono bloccate lato server.

## Sicurezza

- Accesso solo con account Google in `USERS`; token firmato con `SECRET` (mai nel codice dell'app); il login rimanda solo a `APP_URL`.
- Chiave Gemini solo nelle proprietà dello script.
- L'AI estrae campi fissi e non può fare azioni (niente invii, niente pagamenti).
- Tutto il testo mostrato nell'app è trattato come testo (niente HTML eseguibile); Content-Security-Policy restrittiva.
- Nota privacy: Gemini gratuito può usare i contenuti per migliorare i servizi Google. Per la versione definitiva valutare un'alternativa.

## Installazione

1. GitHub Pages su questo repository (branch `main`, cartella root).
2. Progetto Apps Script **API** su info: incollare `apps-script/api/*`, proprietà `SECRET`, `USERS`, `GEMINI_KEY`, `MODE=main`, `COLLECT_SECRET`, `IMPORT_FROM`; eseguire `setup()`; Deploy → Web app (Execute as: Me, Access: Anyone).
3. Progetto Apps Script **LOGIN**: incollare `apps-script/login/*`, proprietà `SECRET`, `USERS`, `APP_URL`; Deploy → Web app (Execute as: User accessing, Access: Anyone with Google account).
4. Progetto Apps Script **collector** su denisrider00: stesso codice API, proprietà `MODE=collector`, `MAIN_URL`, `COLLECT_SECRET`, `GEMINI_KEY`, `IMPORT_FROM`; eseguire `setup()`.
5. Inserire i due URL in `config.js`.
6. Mac mini: Google Drive per desktop con l'account info sincronizza `Backup/` sul disco; da lì una copia su iCloud.

## Stato del progetto (11 novembre 2026), per riprendere il lavoro in una chat nuova

Fatto e online:
- Foto lette dall'AI (Claude Haiku prima, Gemini riserva), import email info + denisrider00 (collector), archivio, Cerca, Chiedi.
- Riepilogo per artista, stampa/PDF/invio singoli e multipli, 4 modelli export, export di quello che vedi (Archivio, Cerca).
- Annulla/Ripeti 24 ore (scheda Undo), cartella unica Drive "Tutte le ricevute" per mese.
- "Fai per me" (solo admin): filtri capiti dall'AI, conti fatti dall'app, modifiche con anteprima e conferma, righe degli scontrini lette dalla foto e salvate nella scheda Articoli (prodotti, quantità, ultima volta).
- Doppioni: unione automatica (numero di riferimento in comune, oppure stesso importo + date entro 3 giorni + stesso fornitore); copie stornate da `doppioni@sistema`. Pulizia archivio fatta l'11/11 (13 copie).
- Studio o personale: all'import email l'AI decide studio/privato/dubbio; impara dai fornitori spostati da Denis (proprietà VENDOR_USE); marketplace decisi dall'articolo.

Da fare (approvato da Denis l'11/11):
- Archivio privato totalmente separato sul Google di denisrider00 (progetto collector come web app con foglio e cartella "Spese personali Denis"); nello studio nessuna traccia; PIN di 4 cifre + accesso solo con Google denisrider00 + blocco 15 min dopo 5 errori e 24 ore dopo 10; spostamento delle vecchie spese "privata" con pulizia di Log, Undo, Articoli, Drive e backup.
- Oggi la versione intermedia tiene i personali nel foglio dello studio con colonna `pers` e password: va sostituita.

Come si pubblica:
- App: copiare `index.html` e `app.js` qui, alzare `app.js?v=N` in index.html, commit e push su main (GitHub Pages).
- API: progetto Apps Script "Ricevute API" sull'account info (script.google.com/u/1), incollare il codice nell'editor, salvare, poi Esegui il deployment > Gestisci deployment > matita > Versione: Nuova versione > Esegui il deployment. Il codice qui in `apps-script/api/Code.gs` è sempre identico a quello pubblicato.
