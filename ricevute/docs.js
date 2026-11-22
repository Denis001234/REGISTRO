"use strict";
/* Ricevute Waiblingen Ink · DOCUMENTI: archivio dello studio (lettere, contratti, assicurazioni, Gewerbe, tatuatori...)
   Separato dalla contabilità: si apre con l'interruttore in alto, solo per amministratori (Denis e Linda).
   Foto lette solo da Claude, pagine raggruppate in un PDF per lettera, sezioni dinamiche, GbR vecchia o nuova, scadenze con promemoria.
   Tutto il testo che arriva dal server passa da esc() prima di finire nella pagina. */
(function () {
  const D = { on: false, loaded: false, docs: [], sections: [], view: "home", owner: "all", sec: null, cur: null, secFilter: "all",
    batch: null, q: "", askMode: "ask", askRes: null, agRes: null, busy: false, dueAll: false, sure: null };
  const T = (it, de) => (lang === "de" ? de : it);
  const OWN = { nuova: () => T("GbR nuova", "Neue GbR"), vecchia: () => T("GbR vecchia", "Alte GbR") };
  const ERR = { manca_chiave_claude: ["Manca la chiave Claude: inseriscila nelle impostazioni dell'app Ricevute", "Claude-Schlüssel fehlt: in den Einstellungen der Belege-App eintragen"],
    pdf_non_valido: ["Il PDF non è valido", "Das PDF ist ungültig"], nome_sezione: ["Scrivi un nome diverso", "Bitte einen anderen Namen eingeben"],
    niente_da_cambiare: ["Niente da cambiare", "Nichts zu ändern"], documento_non_trovato: ["Documento non trovato", "Dokument nicht gefunden"] };
  const msg = e => { const k = String(e && e.message || e).split(/[:\s]/)[0]; return ERR[k] ? ERR[k][lang === "de" ? 1 : 0] : String(e && e.message || e); };
  const today = () => todayISO();
  const days = s => Math.round((new Date(s + "T12:00:00") - new Date(today() + "T12:00:00")) / 864e5);
  const whenTxt = n => n < 0 ? T("scaduta da " + (-n) + (n === -1 ? " giorno" : " giorni"), "seit " + (-n) + (n === -1 ? " Tag" : " Tagen") + " überfällig") : n === 0 ? T("oggi", "heute") : n === 1 ? T("domani", "morgen") : T("tra " + n + " giorni", "in " + n + " Tagen");
  const nDoc = n => n + " " + (n === 1 ? T("documento", "Dokument") : T("documenti", "Dokumente"));
  const live = () => D.docs.filter(d => !d.deleted);
  const byOwner = l => D.owner === "all" ? l : l.filter(d => d.owner === D.owner);
  const sortDate = l => l.slice().sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const dueOpen = () => live().filter(d => d.due && !d.done).sort((a, b) => a.due.localeCompare(b.due));

  /* ricerca che tollera gli errori di battitura */
  function lev1(a, b) { if (Math.abs(a.length - b.length) > 1) return false; let i = 0, j = 0, e = 0; while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; continue; } if (++e > 1) return false; if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; } } return e + (a.length - i) + (b.length - j) <= 1; }
  function match(d, q) {
    const hay = norm([d.sender, d.subject, d.summary, d.section, d.ref, d.dueWhat, d.note, d.tags, OWN[d.owner] && OWN[d.owner](), String(d.date || "").slice(0, 4)].join(" "));
    const words = hay.split(/[^a-z0-9]+/).filter(Boolean);
    return norm(q).split(/\s+/).filter(Boolean).every(t => hay.includes(t) || (t.length >= 4 && words.some(w => lev1(w, t))));
  }

  /* ---------- interruttore Ricevute | Documenti ---------- */
  const app = $(".app");
  const sw = document.createElement("div"); sw.id = "appSw"; sw.className = "appsw dhide";
  sw.innerHTML = '<button type="button" data-a="r" class="on"></button><button type="button" data-a="d"></button>';
  app.insertBefore(sw, app.firstChild);
  const box = document.createElement("div"); box.id = "dApp"; box.className = "dhide"; app.appendChild(box);
  const recvParts = () => [...app.children].filter(e => e !== sw && e !== box);
  function setMode(on) {
    if (on && !isAdmin()) return;
    D.on = on;
    recvParts().forEach(e => e.classList.toggle("dhide", on));
    box.classList.toggle("dhide", !on);
    $$("#appSw button").forEach(b => b.classList.toggle("on", (b.dataset.a === "d") === on));
    window.scrollTo(0, 0);
    if (on) { if (!D.loaded) load(); else render(); } else if (typeof show === "function") show("home");
  }
  sw.addEventListener("click", e => { const b = e.target.closest("button[data-a]"); if (b) setMode(b.dataset.a === "d"); });
  function swLabels() { const b = $$("#appSw button"); b[0].textContent = T("Ricevute", "Belege"); b[1].textContent = T("Documenti", "Dokumente"); }
  const _ra = renderAll; renderAll = function () { _ra(); sw.classList.toggle("dhide", !isAdmin()); swLabels(); if (!isAdmin() && D.on) setMode(false); };
  const _al = applyLang; applyLang = function () { _al(); swLabels(); if (D.on) render(); };

  async function load() {
    try { const j = await api("dList"); D.docs = j.docs || []; D.sections = j.sections || []; D.loaded = true; }
    catch (e) { if (e.message !== "login") toast(msg(e)); }
    render();
  }

  /* ---------- disegno ---------- */
  const ICON = {
    cam: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"></path><circle cx="12" cy="13" r="3.5"></circle></svg>',
    back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>',
    home: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 4h10l6 6v10H4z"></path><path d="M14 4v6h6"></path></svg>',
    arch: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="3" width="13" height="18" rx="2"></rect><path d="M8 3v18"></path><path d="M20 7v12"></path></svg>',
    secs: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 7h7l2 2h9v10H3z"></path></svg>',
    due: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="13" r="8"></circle><path d="M12 9v4l3 2"></path></svg>',
    mic: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="vertical-align:-3px"><rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0"></path><path d="M12 18v3"></path></svg>',
    ask: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"></path></svg>'
  };
  const langBtns = () => `<div class="langs"><button type="button" data-act="lang" data-l="it" class="${lang === "it" ? "on" : ""}">IT</button><button type="button" data-act="lang" data-l="de" class="${lang === "de" ? "on" : ""}">DE</button></div>`;
  const backTop = (title, sub, to) => `<div class="top"><div style="display:flex;align-items:center;gap:12px;min-width:0"><button type="button" class="dbtn" data-act="go" data-v="${esc(to || "home")}" aria-label="${esc(T("Indietro", "Zurück"))}">${ICON.back}</button><div class="dtitle" style="min-width:0"><b style="font-size:19px">${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}</div></div></div>`;
  function nav() {
    const it = [["home", ICON.home, T("Documenti", "Dokumente")], ["arch", ICON.arch, T("Archivio", "Ordner")], ["secs", ICON.secs, T("Sezioni", "Bereiche")], ["due", ICON.due, T("Scadenze", "Fristen")], ["ask", ICON.ask, T("Chiedi", "Fragen")]];
    return `<nav class="tabs"><div class="in">${it.map(([v, i, l]) => `<button type="button" data-act="go" data-v="${v}" class="${D.view === v ? "on" : ""}">${i}<span>${esc(l)}</span></button>`).join("")}</div></nav>`;
  }
  /* mittente "finto" (vuoto, "Senza mittente", "sconosciuto"...) = mittente mancante */
  const realSender = x => { const t = String(x == null ? "" : x).trim(); return /^(senza mittente|mittente (non letto|sconosciuto|mancante)|sconosciuto|non (leggibile|letto)|ohne absender|absender (unbekannt|nicht gelesen)|unbekannt|unknown|n\.?\s?[ad]\.?|n\/a|null|none|undefined|[-–—?.\s]*)$/i.test(t) ? "" : t; };
  function row(d) {
    const tags = [d.owner === "vecchia" ? `<span class="dtag old">${esc(OWN.vecchia())}</span>` : "", d.status === "check" ? `<span class="dtag chk">${esc(T("da controllare", "prüfen"))}</span>` : "",
      d.due && !d.done ? `<span class="dtag ${days(d.due) <= 3 ? "due" : "ok"}">${esc(whenTxt(days(d.due)))}</span>` : ""].join("");
    return `<button type="button" class="dr" data-act="open" data-id="${esc(d.id)}"><span class="m"><b>${esc(realSender(d.sender) || d.subject || (d.section && d.section !== "Altro" ? d.section : "") || T("Senza mittente", "Ohne Absender"))}</b><small>${esc([d.subject, d.section].filter(Boolean).join(" · "))}</small></span><span class="s">${esc(fmtDate(d.date))}${tags}</span></button>`;
  }
  const STOP = new Set(["trova", "trovami", "cerca", "dove", "documento", "documenti", "lettera", "lettere", "della", "dello", "delle", "degli", "quale", "quali", "mostra", "fammi", "vedere", "finde", "suche", "zeig", "zeige", "bitte", "dokument", "dokumente", "brief", "briefe", "von", "der", "die", "das", "und"]);
  const guess = q => { const w = norm(q).split(/[^a-z0-9]+/).filter(x => x.length >= 4 && !STOP.has(x)); if (!w.length) return [];
    return live().map(d => ({ d, n: w.filter(t => match(d, t)).length })).filter(x => x.n).sort((a, b) => b.n - a.n || String(b.d.date || "").localeCompare(String(a.d.date || ""))).map(x => x.d).slice(0, 8); };
  const listOf = (l, empty) => l.length ? `<div class="list">${l.map(row).join("")}</div>` : `<div class="dinfo">${esc(empty || T("Nessun documento.", "Keine Dokumente."))}</div>`;
  const ownerChips = () => `<div class="chips">${[["all", T("Tutti", "Alle")], ["nuova", OWN.nuova()], ["vecchia", OWN.vecchia()]].map(([k, l]) => `<button type="button" data-act="owner" data-o="${k}" class="${D.owner === k ? "on" : ""}">${esc(l)}</button>`).join("")}</div>`;
  const secCount = s => byOwner(live()).filter(d => d.section === s).length;
  const NEWSEC = "__nuova__";
  const newOpt = sel => `<option value="${NEWSEC}" ${sel ? "selected" : ""}>${esc(T("＋ Scrivi una nuova sezione…", "＋ Neuen Bereich eingeben…"))}</option>`;
  const newPh = () => esc(T("es. Stadt Waiblingen, Avvocato Rossi…", "z. B. Stadt Waiblingen, Anwalt Müller…"));
  const askName = () => toast(T("Scrivi il nome della nuova sezione", "Bitte den Namen des neuen Bereichs eingeben"));
  function allSections() { const s = D.sections.slice(); live().forEach(d => { if (d.section && s.indexOf(d.section) < 0) s.push(d.section); }); return s; }

  function vHome() {
    const due = dueOpen().filter(d => days(d.due) <= 30).slice(0, 3), chk = live().filter(d => d.status === "check");
    return `<div class="top"><div class="dtitle"><small>${esc(T("Archivio dello studio · solo Denis e Linda", "Studio-Archiv · nur Denis und Linda"))}</small><b>${esc(T("Documenti", "Dokumente"))}</b></div>${langBtns()}</div>
<main>
  <div class="search"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>
  <input id="dQ" type="search" autocomplete="off" value="${esc(D.q)}" placeholder="${esc(T("Cerca: Vodafone, Gewerbe, polizza, 2025…", "Suchen: Vodafone, Gewerbe, Police, 2025…"))}" aria-label="${esc(T("Cerca nei documenti", "In Dokumenten suchen"))}"></div>
  <div id="dRes"></div>
  <div id="dHomeBody" class="${D.q ? "dhide" : ""}" style="display:flex;flex-direction:column;gap:14px">
    <button type="button" class="dprim" data-act="cam">${ICON.cam}<span><b>${esc(T("Fotografa documenti", "Dokumente fotografieren"))}</b><small>${esc(T("Una foto dopo l'altra: Claude unisce le pagine da solo", "Ein Foto nach dem anderen: Claude fügt die Seiten selbst zusammen"))}</small></span></button>
    <div class="drow2"><button type="button" class="dbtn" data-act="pick">${esc(T("Scegli dalle foto", "Aus Fotos wählen"))}</button><button type="button" class="dbtn" data-act="pdf">${esc(T("Carica PDF", "PDF hochladen"))}</button></div>
    ${D.batch ? `<button type="button" class="dchk" data-act="go" data-v="batch"><b>${esc(T("Caricamento in corso", "Upload läuft"))}</b> · ${esc(T("torna alle foto", "zurück zu den Fotos"))}</button>` : ""}
    ${chk.length ? `<button type="button" class="dchk" data-act="check"><b>${chk.length}</b> ${esc(T(chk.length === 1 ? "documento da controllare" : "documenti da controllare", chk.length === 1 ? "Dokument zu prüfen" : "Dokumente zu prüfen"))}</button>` : ""}
    ${due.length ? `<div class="ddue"><div class="h"><b>${esc(T("Scadenze in arrivo", "Anstehende Fristen"))}</b><button type="button" class="dlink" data-act="go" data-v="due" style="color:var(--orange)">${esc(T("Tutte", "Alle"))}</button></div>${due.map(d => `<button type="button" data-act="open" data-id="${esc(d.id)}"><span><b>${esc(d.sender)}</b> · ${esc(d.dueWhat || d.subject)}</span><span class="w">${esc(whenTxt(days(d.due)))}</span></button>`).join("")}</div>` : ""}
    ${ownerChips()}
    <div class="head"><b>${esc(T("Sezioni", "Bereiche"))}</b><small style="color:var(--muted);font-size:12px">${esc(T("le crea anche Claude", "Claude legt auch neue an"))}</small></div>
    <div class="dsecs">${allSections().map(s => `<button type="button" data-act="sec" data-s="${esc(s)}"><b>${esc(s)}</b><small>${esc(nDoc(secCount(s)))}</small></button>`).join("")}</div>
    ${!D.loaded ? `<div class="dinfo">${esc(T("Carico…", "Lädt…"))}</div>` : ""}
  </div>
</main>`;
  }
  function renderRes() {
    const el = $("#dRes"), body = $("#dHomeBody"); if (!el) return;
    const q = D.q.trim(); body && body.classList.toggle("dhide", !!q);
    if (!q) { el.innerHTML = ""; return; }
    const l = sortDate(live().filter(d => match(d, q)));
    el.innerHTML = `<div class="head"><b>${l.length} ${esc(T("risultati", "Ergebnisse"))}</b><button type="button" class="dlink" data-act="clearq">${esc(T("Annulla", "Abbrechen"))}</button></div>` + listOf(l, T("Niente trovato.", "Nichts gefunden."));
  }
  function vSecs() {
    return backTop(T("Sezioni", "Bereiche"), T("Tocca per aprire, rinominare o unire", "Tippen zum Öffnen, Umbenennen oder Zusammenlegen"), "home") + `<main>${ownerChips()}<div class="list">${allSections().map(s => `<button type="button" class="dr" data-act="sec" data-s="${esc(s)}"><span class="m"><b>${esc(s)}</b></span><span class="s">${secCount(s)}</span></button>`).join("")}</div></main>`;
  }
  function vSec() {
    const all = byOwner(live().filter(d => d.section === D.sec));
    const years = [...new Set(all.map(d => String(d.date || "").slice(0, 4)).filter(Boolean))].sort().reverse();
    const f = D.secFilter, l = sortDate(all.filter(d => f === "all" ? true : f === "due" ? d.due && !d.done : String(d.date || "").startsWith(f)));
    const others = allSections().filter(s => s !== D.sec);
    return backTop(D.sec, nDoc(all.length), "secs") + `<main>${ownerChips()}
<div class="chips">${[["all", T("Tutti", "Alle")], ["due", T("Con scadenza", "Mit Frist")]].concat(years.map(y => [y, y])).map(([k, l2]) => `<button type="button" data-act="sf" data-f="${esc(k)}" class="${f === k ? "on" : ""}">${esc(l2)}</button>`).join("")}</div>
${listOf(l)}
<div class="dform"><label>${esc(T("Rinomina la sezione", "Bereich umbenennen"))}<input id="dRen" value="${esc(D.sec)}" maxlength="40"></label><button type="button" class="dbtn" data-act="ren">${esc(T("Rinomina", "Umbenennen"))}</button>
${others.length ? `<label>${esc(T("Unisci con un'altra sezione", "Mit anderem Bereich zusammenlegen"))}<select id="dMerge">${others.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join("")}</select></label><button type="button" class="dbtn" data-act="merge">${esc(T("Unisci", "Zusammenlegen"))}</button>` : ""}</div></main>`;
  }
  function vDoc() {
    const d = D.docs.find(x => x.id === D.cur); if (!d) { D.view = "home"; return vHome(); }
    const rem = Array.isArray(d.remind) ? d.remind : [3, 2, 1];
    const secOpts = allSections().map(s => `<option value="${esc(s)}" ${s === d.section ? "selected" : ""}>${esc(s)}</option>`).join("");
    return backTop(d.sender || T("Documento", "Dokument"), (d.pages || 1) + " " + T("pagine", "Seiten") + " · PDF", D.from || "home") + `<main>
${d.status === "check" ? `<div class="warn"><span>${esc(d.note || T("Claude non era sicuro: controlla GbR, sezione e dati.", "Claude war unsicher: GbR, Bereich und Daten prüfen."))}</span></div><div class="drow2"><button type="button" class="dbtn go" data-act="okdoc">${esc(T("Va bene così", "Passt so"))}</button><button type="button" class="dbtn red" data-act="del">${esc(D.sure === d.id ? T("Sicuro? Tocca ancora", "Sicher? Nochmal tippen") : T("Toglila dall'archivio", "Aus dem Archiv nehmen"))}</button></div>` : ""}
<div class="drow3"><button type="button" class="dbtn go" data-act="openpdf">${esc(T("Apri PDF", "PDF öffnen"))}</button><button type="button" class="dbtn" data-act="share">${esc(T("Condividi", "Teilen"))}</button><button type="button" class="dbtn" data-act="dlpdf">${esc(T("Scarica", "Laden"))}</button></div>
${d.summary ? `<div class="dinfo"><b>${esc(T("In breve", "Kurz gesagt"))}</b><br>${esc(d.summary)}</div>` : ""}
${d.due ? `<div class="ddue"><div class="h"><b>${esc(T("Scadenza", "Frist"))} ${esc(fmtDate(d.due))}</b><span class="w">${esc(d.done ? T("fatto", "erledigt") : whenTxt(days(d.due)))}</span></div><span style="font-size:13px">${esc(d.dueWhat || "")}</span>
<div class="drem">${[3, 2, 1].map(n => `<button type="button" data-act="rem" data-n="${n}" class="${rem.indexOf(n) >= 0 ? "on" : ""}" aria-pressed="${rem.indexOf(n) >= 0}">${esc(n === 1 ? T("1 giorno prima", "1 Tag vorher") : T(n + " giorni", n + " Tage"))}</button>`).join("")}</div>
<span style="font-size:12px;color:var(--orange)">${esc(T("Email a Denis e Linda alle 8 di mattina, anche il giorno stesso", "E-Mail an Denis und Linda um 8 Uhr, auch am Tag selbst"))}</span>
<button type="button" class="dbtn ${d.done ? "" : "go"}" data-act="done">${esc(d.done ? T("Segna come da fare", "Wieder offen") : T("Fatto / pagato: basta avvisi", "Erledigt / bezahlt: keine Erinnerungen"))}</button></div>` : ""}
<div class="dform">
<label>${esc(T("GbR", "GbR"))}<select id="fOwner"><option value="nuova" ${d.owner !== "vecchia" ? "selected" : ""}>${esc(OWN.nuova())}</option><option value="vecchia" ${d.owner === "vecchia" ? "selected" : ""}>${esc(OWN.vecchia())}</option></select></label>
<label>${esc(T("Sezione", "Bereich"))}<select id="fSection">${secOpts}${newOpt(false)}</select><input id="fSectionNew" maxlength="40" placeholder="${newPh()}" hidden></label>
<label>${esc(T("Mittente", "Absender"))}<input id="fSender" value="${esc(d.sender || "")}" maxlength="100"></label>
<label>${esc(T("Oggetto", "Betreff"))}<input id="fSubject" value="${esc(d.subject || "")}" maxlength="160"></label>
<div class="drow2"><label>${esc(T("Data lettera", "Briefdatum"))}<input id="fDate" type="date" value="${esc(d.date || "")}"></label><label>${esc(T("Scadenza", "Frist"))}<input id="fDue" type="date" value="${esc(d.due || "")}"></label></div>
<label>${esc(T("Cosa fare entro la scadenza", "Was bis zur Frist zu tun ist"))}<input id="fDueWhat" value="${esc(d.dueWhat || "")}" maxlength="120"></label>
<div class="drow2"><label>${esc(T("Importo €", "Betrag €"))}<input id="fAmount" inputmode="decimal" value="${esc(d.amount === undefined ? "" : d.amount)}"></label><label>${esc(T("Riferimento", "Aktenzeichen"))}<input id="fRef" value="${esc(d.ref || "")}" maxlength="120"></label></div>
<label>${esc(T("Riassunto", "Zusammenfassung"))}<textarea id="fSummary" maxlength="800">${esc(d.summary || "")}</textarea></label>
<button type="button" class="dbtn go" data-act="save">${esc(T("Salva modifiche", "Änderungen speichern"))}</button>
</div>
${d.status !== "check" ? `<button type="button" class="dbtn red" data-act="del">${esc(D.sure === d.id ? T("Sicuro? Tocca ancora", "Sicher? Nochmal tippen") : T("Elimina (resta recuperabile in Drive)", "Löschen (in Drive wiederherstellbar)"))}</button>` : ""}
</main>`;
  }
  function vDue() {
    const l = live().filter(d => d.due && (D.dueAll || !d.done)).sort((a, b) => a.due.localeCompare(b.due));
    return `<div class="top"><div class="dtitle"><small>${esc(T("Promemoria via email 3, 2, 1 giorno prima", "Erinnerung per E-Mail 3, 2, 1 Tag vorher"))}</small><b>${esc(T("Scadenze", "Fristen"))}</b></div>${langBtns()}</div><main>
<div class="chips"><button type="button" data-act="dueall" data-x="0" class="${D.dueAll ? "" : "on"}">${esc(T("Da fare", "Offen"))}</button><button type="button" data-act="dueall" data-x="1" class="${D.dueAll ? "on" : ""}">${esc(T("Anche fatte", "Auch erledigte"))}</button></div>
${listOf(l, T("Nessuna scadenza.", "Keine Fristen."))}</main>`;
  }
  function vAsk() {
    const ag = D.askMode === "agent";
    let res = "";
    if (D.busy) res = `<div class="dinfo">${esc(T("Ci penso…", "Ich überlege…"))}</div>`;
    else if (!ag && D.askRes) { const found = D.askRes.ids.map(id => D.docs.find(d => d.id === id)).filter(Boolean), extra = guess(D.askRes.q).filter(d => found.indexOf(d) < 0);
      res = `<div class="dans">${esc(D.askRes.answer)}</div>` + (found.length ? listOf(found) : "") + (extra.length ? `<div class="head"><b>${esc(T("Forse cerchi anche", "Vielleicht suchst du auch"))}</b></div>` + listOf(extra.slice(0, 8)) : ""); }
    else if (ag && D.agRes) {
      const l = D.agRes.list, s = D.agRes.set, ch = [s.section ? T("sezione → ", "Bereich → ") + s.section : "", s.owner ? "→ " + OWN[s.owner]() : "", s.done === true ? T("segna come fatto", "als erledigt markieren") : s.done === false ? T("segna come da fare", "wieder offen") : ""].filter(Boolean).join(" · ");
      res = `<div class="head"><b>${esc(D.agRes.title)}</b><small style="color:var(--muted)">${l.length} ${esc(T("documenti", "Dokumente"))}</small></div>` + listOf(l, T("Niente trovato.", "Nichts gefunden.")) +
        (ch && l.length ? `<div class="warn"><span>${esc(T("Modifica proposta: ", "Vorgeschlagene Änderung: ") + ch)}</span></div><button type="button" class="dbtn go" data-act="apply">${esc(T("Applica a " + l.length + " documenti", "Auf " + l.length + " Dokumente anwenden"))}</button>` : "");
    }
    return `<div class="top"><div class="dtitle"><small>${esc(T("Solo l'archivio documenti", "Nur das Dokumenten-Archiv"))}</small><b>${esc(ag ? T("Fai per me", "Mach für mich") : T("Chiedi", "Fragen"))}</b></div>${langBtns()}</div><main>
<div class="chips"><button type="button" data-act="mode" data-m="ask" class="${ag ? "" : "on"}">${esc(T("Chiedi", "Fragen"))}</button><button type="button" data-act="mode" data-m="agent" class="${ag ? "on" : ""}">${esc(T("Fai per me", "Mach für mich"))}</button></div>
<div class="dform"><label>${esc(ag ? T("Cosa devo fare?", "Was soll ich tun?") : T("Cosa vuoi sapere?", "Was möchtest du wissen?"))}<textarea id="dAskIn" maxlength="500" placeholder="${esc(ag ? T("es. sposta tutte le lettere Vodafone in Contratti", "z.B. alle Vodafone-Briefe nach Verträge verschieben") : T("es. quando scade l'assicurazione dello studio?", "z.B. wann läuft die Studio-Versicherung ab?"))}"></textarea></label>
<div class="drow2"><button type="button" class="dbtn ${D.listening ? "red" : ""}" data-act="mic" aria-pressed="${D.listening ? "true" : "false"}">${ICON.mic} ${esc(D.listening ? T("Sto ascoltando… tocca per fermare", "Ich höre zu… tippen zum Stoppen") : T("Parla", "Sprechen"))}</button><button type="button" class="dbtn go" data-act="askgo" ${D.busy ? "disabled" : ""}>${esc(ag ? T("Prepara", "Vorbereiten") : T("Chiedi", "Fragen"))}</button></div></div>${res}</main>`;
  }

  /* ---------- caricamento: foto → lettura → raggruppamento → PDF → archivio ---------- */
  const fileIn = document.createElement("input"); fileIn.type = "file"; fileIn.className = "dhide"; document.body.appendChild(fileIn);
  function pickFiles(mode) {
    fileIn.value = ""; fileIn.multiple = mode !== "cam";
    fileIn.accept = mode === "pdf" ? "application/pdf" : "image/*";
    if (mode === "cam") fileIn.setAttribute("capture", "environment"); else fileIn.removeAttribute("capture");
    fileIn.click();
  }
  fileIn.onchange = () => { const f = [...fileIn.files]; if (f.length) addFiles(f); };
  async function addFiles(files) {
    if (!D.batch) D.batch = { items: [], groups: null, saving: false, done: 0 };
    D.view = "batch"; D.batch.groups = null; render();
    for (const f of files) {
      const isPdf = f.type === "application/pdf";
      const blob = isPdf ? f : await shrink(f);
      D.batch.items.push({ kind: isPdf ? "pdf" : "img", blob, mime: isPdf ? "application/pdf" : (blob.type || "image/jpeg"), url: isPdf ? null : URL.createObjectURL(blob), info: null, err: null });
    }
    render(); readQueue();
  }
  let reading = 0;
  function readQueue() {
    const b = D.batch; if (!b) return;
    while (reading < 3) {
      const it = b.items.find(x => !x.info && !x.err && !x.busy); if (!it) break;
      it.busy = true; reading++;
      blobToB64(it.blob).then(b64 => api("dPage", { photo: b64, mime: it.mime })).then(j => { it.info = j.page || {}; })
        .catch(e => { it.err = msg(e); if (/manca|Claude-Schl/.test(it.err)) toast(it.err); })
        .finally(() => { it.busy = false; reading--; if (D.batch === b) { if (b.items.every(x => x.info || x.err)) group(); else { if (D.view === "batch") render(); readQueue(); } } });
    }
  }
  async function thumb(blob) {
    try { const bmp = await createImageBitmap(blob); const k = Math.min(1, 900 / Math.max(bmp.width, bmp.height)); const c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k); c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
      const b = await new Promise(r => c.toBlob(r, "image/jpeg", 0.6)); return b ? await blobToB64(b) : null; } catch (e) { return null; }
  }
  async function group() {
    const b = D.batch; if (!b || b.grouping) return; b.grouping = true; b.metaDone = 0; b.metaN = 0; b.phase = "group"; render();
    const imgs = b.items.map((x, i) => ({ x, i })).filter(o => o.x.kind === "img");
    let groups = [];
    if (imgs.length) {
      const pages = imgs.map(o => o.x.info || { head: o.x.err ? "pagina non letta" : "" });
      let arr = null;
      try { const th = []; for (const o of imgs) th.push(await thumb(o.x.blob)); const j = await api("dGroup", { pages, thumbs: th }); arr = j.groups; if (j.sections) D.sections = j.sections; }
      catch (e) { toast(msg(e)); }
      if (!Array.isArray(arr) || !arr.length) arr = imgs.map((o, k) => [k]);
      groups = arr.map(g => ({ pagesIdx: g, items: g.map(k => imgs[k].i), owner: "nuova", section: "Altro", unsure: true, sender: (pages[g[0]] || {}).sender || "", subject: (pages[g[0]] || {}).subject || "" }));
      b.phase = "meta"; b.metaN = groups.length; render();
      let next = 0;
      const worker = async () => { while (next < groups.length) { const g = groups[next++]; try { const j = await api("dMeta", { pages: g.pagesIdx.map(k => pages[k]) }); Object.assign(g, j.meta || {}); } catch (e) {} b.metaDone++; if (D.view === "batch") render(); } };
      await Promise.all([worker(), worker(), worker()]);
    }
    b.items.forEach((x, i) => { if (x.kind === "pdf") { const p = x.info || {}; groups.push({ items: [i], owner: "nuova", section: "Altro", unsure: true, sender: p.sender || "", date: p.date, subject: p.subject || "", summary: p.summary || "", due: p.due, dueWhat: p.dueWhat, amount: p.amount, ref: (p.refs || [])[0] || null, pdfPages: p.of || 1 }); } });
    groups.forEach(g => { if (g.items.some(i => b.items[i].err)) g.unsure = true; });
    /* regola di Denis: se nessuna sezione esistente va bene, la sezione nuova si chiama come il mittente (es. Stadtwerke Waiblingen) */
    groups.forEach(g => {
      const snd = String(g.sender || "").replace(/[<>\/\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 40);
      if (!snd || !(g.newSection || !g.section || g.section === "Altro")) return;
      const hit = allSections().find(x => x.toLowerCase() === snd.toLowerCase());
      g.section = hit || snd; g.newSection = !hit;
    });
    b.groups = groups; b.grouping = false; render();
  }
  async function pdfOfGroup(g) {
    const b = D.batch, items = g.items.map(i => b.items[i]);
    if (items.length === 1 && items[0].kind === "pdf") return { b64: await blobToB64(items[0].blob), pages: g.pdfPages || 1 };
    await lib("lib/jspdf.umd.min.js");
    const doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4", compress: true });
    for (let k = 0; k < items.length; k++) {
      const url = await new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(items[k].blob); });
      const im = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = url; });
      if (k) doc.addPage();
      const s = Math.min(210 / im.width, 297 / im.height), w = im.width * s, h = im.height * s;
      doc.addImage(url, "JPEG", (210 - w) / 2, (297 - h) / 2, w, h);
    }
    const ab = doc.output("arraybuffer");
    return { b64: await blobToB64(new Blob([ab], { type: "application/pdf" })), pages: items.length };
  }
  async function saveAll() {
    const b = D.batch; if (!b || !b.groups || b.saving) return;
    const empty = b.groups.findIndex(g => !g.saved && g.secNew && !String(g.section || "").trim());
    if (empty >= 0) { askName(); const inp = box.querySelector('input[data-act="gsecnew"][data-g="' + empty + '"]'); return inp && inp.focus(); }
    b.saving = true; b.done = 0; render();
    const saved = [];
    for (const g of b.groups) {
      if (g.saved) { b.done++; continue; }
      try {
        const p = await pdfOfGroup(g);
        const j = await api("dSave", { pdf: p.b64, doc: { owner: g.owner, section: g.section, sender: realSender(g.sender) || (g.userSec && g.section !== "Altro" ? g.section : ""), date: g.date, subject: g.subject, summary: g.summary, due: g.due, dueWhat: g.dueWhat, amount: g.amount, ref: g.ref, pages: p.pages, private: g.private === true, unsure: g.unsure === true, newSection: g.newSection === true, oldRule: g.oldRule === true } });
        g.saved = true; saved.push(j.doc); D.docs.push(j.doc);
      } catch (e) { toast(msg(e)); break; }
      b.done++; render();
    }
    b.saving = false;
    if (b.groups.every(g => g.saved)) { b.items.forEach(x => x.url && URL.revokeObjectURL(x.url)); D.batch = null; D.view = "home"; toast(T(saved.length + " documenti archiviati ✓", saved.length + " Dokumente archiviert ✓")); load(); }
    else render();
  }
  function vBatch() {
    const b = D.batch; if (!b) { D.view = "home"; return vHome(); }
    const n = b.items.length, read = b.items.filter(x => x.info || x.err).length;
    const top = backTop(T("Controlla e archivia", "Prüfen und archivieren"), n + " " + T("foto", "Fotos"), "home");
    if (!b.groups) return top + `<main><div class="dinfo">${esc(!b.grouping ? T("Claude legge le pagine: " + read + " di " + n, "Claude liest die Seiten: " + read + " von " + n) : b.phase === "meta" ? T("Claude ha trovato " + b.metaN + " documenti e ora li descrive: " + b.metaDone + " di " + b.metaN, "Claude hat " + b.metaN + " Dokumente gefunden und beschreibt sie: " + b.metaDone + " von " + b.metaN) : T("Claude riconosce le lettere e unisce le pagine…", "Claude erkennt die Briefe und fügt die Seiten zusammen…"))}</div><div class="dbar"><i style="width:${Math.round((b.grouping ? (b.phase === "meta" ? b.metaDone / Math.max(1, b.metaN) : 0.95) : read / Math.max(1, n)) * 100)}%"></i></div>
<div class="warn"><span>${esc(T("Tieni l'app aperta e lo schermo acceso finché non hai archiviato.", "App offen und Bildschirm an lassen, bis alles archiviert ist."))}</span></div>
<div class="drow2"><button type="button" class="dbtn" data-act="cam">${esc(T("+ Altra foto", "+ Weiteres Foto"))}</button><button type="button" class="dbtn" data-act="pick">${esc(T("+ Dalle foto", "+ Aus Fotos"))}</button></div>
<div class="dthumbs">${b.items.map(x => x.url ? `<img src="${esc(x.url)}" alt="">` : `<span>PDF</span>`).join("")}</div>
<button type="button" class="dbtn red" data-act="cancel">${esc(T("Annulla tutto", "Alles abbrechen"))}</button></main>`;
    const secs = allSections(); b.groups.forEach(g => { if (g.section && secs.indexOf(g.section) < 0) secs.push(g.section); });
    return top + `<main><div class="dinfo"><b>${n} ${esc(T("foto", "Fotos"))} → ${b.groups.length} ${esc(T("documenti", "Dokumente"))}.</b> ${esc(T("Se Claude ha sbagliato, unisci o dividi con un tocco.", "Falls Claude sich geirrt hat: mit einem Tipp zusammenlegen oder trennen."))}</div>
${b.groups.map((g, gi) => `<div class="dgrp ${g.private ? "priv" : ""}">
${g.private ? `<div class="warn"><span>${esc(T("Sembra una lettera PRIVATA: l'archivio è per lo studio. Decidi tu.", "Sieht nach einem PRIVATEN Brief aus: das Archiv ist fürs Studio. Du entscheidest."))}</span></div>` : ""}
<div class="dthumbs">${g.items.map(i => b.items[i].url ? `<img src="${esc(b.items[i].url)}" alt="">` : `<span>PDF</span>`).join("")}</div>
<div><b>${esc(g.sender || T("Mittente non letto", "Absender nicht gelesen"))}</b> <span class="dtag ok">${g.items.length} ${esc(T("pag.", "S."))}</span>${g.unsure ? ` <span class="dtag chk">${esc(T("da controllare", "prüfen"))}</span>` : ""}${g.newSection ? ` <span class="dtag ok">${esc(T("nuova sezione", "neuer Bereich"))}</span>` : ""}<br><small style="color:var(--muted)">${esc([g.subject, g.due ? T("scadenza ", "Frist ") + fmtDate(g.due) : ""].filter(Boolean).join(" · "))}</small></div>
<div class="drow2"><label>GbR<select data-act="gown" data-g="${gi}"><option value="nuova" ${g.owner !== "vecchia" ? "selected" : ""}>${esc(OWN.nuova())}</option><option value="vecchia" ${g.owner === "vecchia" ? "selected" : ""}>${esc(OWN.vecchia())}</option></select></label>
<label>${esc(T("Sezione", "Bereich"))}<select data-act="gsec" data-g="${gi}">${secs.map(s => `<option value="${esc(s)}" ${!g.secNew && s === g.section ? "selected" : ""}>${esc(s)}</option>`).join("")}${newOpt(g.secNew)}</select></label></div>
<input data-act="gsecnew" data-g="${gi}" maxlength="40" placeholder="${newPh()}" value="${esc(g.secNew ? g.section || "" : "")}" ${g.secNew ? "" : "hidden"}>
<div class="drow3">${gi ? `<button type="button" class="dbtn" data-act="gmerge" data-g="${gi}">${esc(T("Unisci a sopra", "Mit oben"))}</button>` : `<span></span>`}${g.items.length > 1 ? `<button type="button" class="dbtn" data-act="gsplit" data-g="${gi}">${esc(T("Dividi", "Trennen"))}</button>` : `<span></span>`}<button type="button" class="dbtn red" data-act="gdrop" data-g="${gi}">${esc(T("Togli", "Weglassen"))}</button></div>
</div>`).join("")}
<button type="button" class="dbtn go" style="min-height:54px;font-size:16px" data-act="saveall" ${b.saving || !b.groups.length ? "disabled" : ""}>${esc(b.saving ? T("Archivio " + b.done + " di " + b.groups.length + "…", "Archiviere " + b.done + " von " + b.groups.length + "…") : T("Archivia tutti e " + b.groups.length, "Alle " + b.groups.length + " archivieren"))}</button>
<button type="button" class="dbtn red" data-act="cancel">${esc(T("Annulla tutto", "Alles abbrechen"))}</button></main>`;
  }

  /* ---------- ARCHIVIO: il "Ordner" virtuale. Anteprime, foto grande, destra e sinistra pagina per pagina, ordini a scelta.
     I PDF li disegna pdf.js (lib/, niente CDN, eval spento). Le anteprime restano salvate sul telefono (IndexedDB) e si rifanno solo se mancano. */
  const AR_SORTS = [["up", () => T("Ultimi caricati", "Zuletzt hochgeladen"), -1], ["date", () => T("Data della lettera", "Briefdatum"), -1], ["sender", () => T("Mittente A-Z", "Absender A-Z"), 1],
    ["subject", () => T("Oggetto A-Z", "Betreff A-Z"), 1], ["section", () => T("Sezione A-Z", "Bereich A-Z"), 1], ["due", () => T("Scadenza", "Frist"), 1], ["amount", () => T("Importo", "Betrag"), -1], ["pages", () => T("Numero di pagine", "Seitenzahl"), -1]];
  if (!D.arSort) { D.arSort = "up"; D.arDir = -1; D.arSec = "all"; }
  const titleOf = d => realSender(d.sender) || d.subject || (d.section && d.section !== "Altro" ? d.section : "") || T("Senza mittente", "Ohne Absender");
  const upAt = d => String(d.createdAt || d.updatedAt || "");
  const fmtUp = d => { const s = upAt(d); if (!s) return ""; const t = new Date(s); if (isNaN(t)) return ""; const p = n => String(n).padStart(2, "0"); return p(t.getDate()) + "/" + p(t.getMonth() + 1) + "/" + String(t.getFullYear()).slice(2) + " " + p(t.getHours()) + ":" + p(t.getMinutes()); };
  function arList() {
    const k = D.arSort, dir = D.arDir, cmpT = (a, b) => String(a || "").localeCompare(String(b || ""), "de", { sensitivity: "base", numeric: true });
    const val = d => k === "up" ? upAt(d) : k === "date" ? d.date : k === "sender" ? d.sender : k === "subject" ? d.subject : k === "section" ? d.section : k === "due" ? d.due : k === "amount" ? d.amount : k === "pages" ? d.pages : "";
    const l = byOwner(live()).filter(d => (D.arSec === "all" || d.section === D.arSec) && (!D.arQ || match(d, D.arQ)));
    return l.sort((a, b) => {
      const va = val(a), vb = val(b), ea = va === "" || va == null, eb = vb === "" || vb == null;
      if (ea !== eb) return ea ? 1 : -1; /* i vuoti sempre in fondo */
      let r = (k === "amount" || k === "pages") ? (Number(va) || 0) - (Number(vb) || 0) : cmpT(va, vb);
      if (!r) r = upAt(b).localeCompare(upAt(a));
      return r * (r && (k === "amount" || k === "pages" || !ea) ? dir : 1);
    });
  }
  function vArch() {
    const l = arList(), secs = allSections();
    const dirTxt = (["up", "date", "due"].indexOf(D.arSort) >= 0) ? (D.arDir < 0 ? T("↓ dal più recente", "↓ neueste zuerst") : T("↑ dal più vecchio", "↑ älteste zuerst")) : (["amount", "pages"].indexOf(D.arSort) >= 0) ? (D.arDir < 0 ? T("↓ dal più grande", "↓ größte zuerst") : T("↑ dal più piccolo", "↑ kleinste zuerst")) : (D.arDir > 0 ? "A → Z" : "Z → A");
    return `<div class="top"><div class="dtitle"><small>${esc(T("Il tuo Ordner: tocca un'anteprima e scorri", "Dein Ordner: Vorschau antippen und blättern"))}</small><b>${esc(T("Archivio", "Ordner"))}</b></div>${langBtns()}</div><main>${ownerChips()}
<div class="dform arbar"><div class="drow2"><label>${esc(T("Ordina per", "Sortieren nach"))}<select id="arSort">${AR_SORTS.map(([v, l]) => `<option value="${v}" ${v === D.arSort ? "selected" : ""}>${esc(l())}</option>`).join("")}</select></label>
<label>${esc(T("Sezione", "Bereich"))}<select id="arSec"><option value="all">${esc(T("Tutte", "Alle"))}</option>${secs.map(s => `<option value="${esc(s)}" ${s === D.arSec ? "selected" : ""}>${esc(s)}</option>`).join("")}</select></label></div>
<button type="button" class="dbtn" data-act="ardir">${esc(dirTxt)}</button></div>
<div class="search arsearch"><input id="arQ" type="search" value="${esc(D.arQ || "")}" placeholder="${esc(T("Cerca: mittente, oggetto, nome, parola…", "Suchen: Absender, Betreff, Name, Wort…"))}" autocomplete="off" enterkeyhint="search">${D.arQ ? `<button type="button" class="arx" data-act="arclear" aria-label="${esc(T("Cancella", "Löschen"))}">✕</button>` : ""}</div>
<div id="arRes">${arRes(l)}</div><small style="color:var(--muted);text-align:center;display:block;margin-top:8px">${esc(T("versione archivio 11", "Ordner-Version 11"))}</small></main>`;
  }
  function arRes(l) {
    return `<small style="color:var(--muted)">${esc(nDoc(l.length))}</small>
${l.length ? `<div class="argrid">${l.map((d, i) => `<button type="button" class="arcard" data-act="arop" data-i="${i}"><span class="arth" data-th="${esc(d.id)}">${thumbHtml(d.id)}</span><b>${esc(titleOf(d))}</b>${d.subject ? `<span class="arsub">${esc(d.subject)}</span>` : ""}${d.summary ? `<span class="arsum">${esc(d.summary)}</span>` : ""}<small>${esc([d.section, (d.pages || 1) + " " + T("pag.", "S.")].filter(Boolean).join(" · "))}</small><small>${esc(T("caricato ", "hochgeladen ") + fmtUp(d))}</small></button>`).join("")}</div>` : `<div class="dinfo">${esc(D.arQ ? T("Niente trovato per questa ricerca.", "Nichts gefunden.") : T("Nessun documento.", "Keine Dokumente."))}</div>`}`;
  }

  /* pdf.js caricato solo quando serve */
  let pdfReady = null;
  function pdfLib() {
    if (pdfReady) return pdfReady;
    pdfReady = new Promise((ok, ko) => { if (window.pdfjsLib) return ok(window.pdfjsLib); const s = document.createElement("script"); s.src = "lib/pdf.min.js?v=3.11.174"; s.onload = () => { try { window.pdfjsLib.GlobalWorkerOptions.workerSrc = "lib/pdf.worker.min.js?v=3.11.174"; ok(window.pdfjsLib); } catch (e) { ko(e); } }; s.onerror = () => { pdfReady = null; ko(new Error(T("Visore non caricato, controlla la connessione", "Viewer nicht geladen, Verbindung prüfen"))); }; document.head.appendChild(s); });
    return pdfReady;
  }
  const pdfDocs = new Map(), pdfWait = new Map(), pdfBytes = new Map();
  function getPdf(id) {
    if (pdfDocs.has(id)) { const v = pdfDocs.get(id); pdfDocs.delete(id); pdfDocs.set(id, v); return Promise.resolve(v); }
    if (pdfWait.has(id)) return pdfWait.get(id);
    const p = (async () => {
      const L = await pdfLib(); let by = pdfBytes.get(id);
      if (!by) { const j = await api("dPdf", { id }); if (!j.data) throw new Error(T("PDF non trovato", "PDF nicht gefunden")); by = Uint8Array.from(atob(j.data), c => c.charCodeAt(0)); pdfBytes.set(id, by); while (pdfBytes.size > 8) pdfBytes.delete(pdfBytes.keys().next().value); }
      const doc = await L.getDocument({ data: by.slice(), isEvalSupported: false, enableXfa: false }).promise;
      pdfDocs.set(id, doc); while (pdfDocs.size > 8) { const k = pdfDocs.keys().next().value; const o = pdfDocs.get(k); pdfDocs.delete(k); try { o.destroy(); } catch (e) {} }
      return doc;
    })();
    pdfWait.set(id, p); p.then(() => pdfWait.delete(id), () => pdfWait.delete(id));
    return p;
  }
  async function pageToUrl(doc, n, width, q) {
    const pg = await doc.getPage(n), v0 = pg.getViewport({ scale: 1 }), sc = width / v0.width, v = pg.getViewport({ scale: sc });
    const c = document.createElement("canvas"); c.width = Math.ceil(v.width); c.height = Math.ceil(v.height);
    const cx = c.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, c.width, c.height);
    await pg.render({ canvasContext: cx, viewport: v }).promise;
    const u = c.toDataURL("image/jpeg", q || 0.8); c.width = c.height = 0; return u;
  }

  /* anteprime: memoria + IndexedDB del telefono */
  const TH = new Map(); let idb = null;
  function thDb() { if (idb) return idb; idb = new Promise(ok => { try { const r = indexedDB.open("wiDocThumbs", 1); r.onupgradeneeded = () => r.result.createObjectStore("t"); r.onsuccess = () => ok(r.result); r.onerror = () => ok(null); } catch (e) { ok(null); } }); return idb; }
  async function thGet(id) { const db = await thDb(); if (!db) return null; return new Promise(ok => { try { const q = db.transaction("t").objectStore("t").get(id); q.onsuccess = () => ok(q.result || null); q.onerror = () => ok(null); } catch (e) { ok(null); } }); }
  async function thPut(id, u) { const db = await thDb(); if (!db) return; try { db.transaction("t", "readwrite").objectStore("t").put(u, id); } catch (e) {} }
  const thumbHtml = id => TH.get(id) ? `<img src="${esc(TH.get(id))}" alt="">` : `<span class="spin"></span>`;
  const thQ = []; let thRun = 0, thObs = null;
  function thPaint(id) { const u = TH.get(id); if (!u) return; $$('[data-th="' + id.replace(/"/g, "") + '"]').forEach(el => { el.innerHTML = ""; const im = new Image(); im.alt = ""; im.src = u; el.appendChild(im); }); }
  async function thPump() {
    while (thRun < 2 && thQ.length) {
      const id = thQ.shift(); thRun++;
      (async () => {
        try { let u = await thGet(id); if (!u) { const doc = await getPdf(id); u = await pageToUrl(doc, 1, 260, 0.7); thPut(id, u); } TH.set(id, u); thPaint(id); }
        catch (e) { $$('[data-th="' + id.replace(/"/g, "") + '"]').forEach(el => { el.innerHTML = '<span class="arno">PDF</span>'; }); }
        thRun--; thPump();
      })();
    }
  }
  function thWatch() {
    if (thObs) thObs.disconnect();
    const want = el => { const id = el.dataset.th; if (!TH.has(id) && thQ.indexOf(id) < 0) { thQ.push(id); thPump(); } };
    if (!("IntersectionObserver" in window)) return $$("#dApp [data-th]").forEach(want);
    thObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { thObs.unobserve(e.target); want(e.target); } }), { rootMargin: "400px" });
    $$("#dApp [data-th]").forEach(el => { if (!TH.has(el.dataset.th)) thObs.observe(el); });
  }

  /* visore a tutto schermo: destra/sinistra = pagina dopo/prima, come sfogliare un Ordner */
  const V = { el: null, list: [], i: 0, p: 1, n: 1, zoom: false, tok: 0 };
  function vwOpen(i) {
    V.list = arList().map(d => d.id); V.i = i; V.p = 1; V.zoom = false;
    if (!V.el) {
      V.el = document.createElement("div"); V.el.id = "dViewer"; document.body.appendChild(V.el);
      V.el.addEventListener("click", vwClick); V.el.addEventListener("change", vwChange);
      let x0 = null, y0 = null;
      V.el.addEventListener("touchstart", e => { if (e.touches.length !== 1 || V.zoom) { x0 = null; return; } x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
      V.el.addEventListener("touchend", e => { if (x0 === null || V.zoom || V.busy) return; const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; x0 = null; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3 && !e.target.closest("select,input,.vbar")) vwStep(dx < 0 ? 1 : -1); }, { passive: true });
      document.addEventListener("keydown", e => { if (!V.el || V.el.hidden) return; if (e.target.closest && e.target.closest("input,select,textarea")) return; if (e.key === "ArrowRight") vwStep(1); else if (e.key === "ArrowLeft") vwStep(-1); else if (e.key === "Escape") vwClose(); });
    }
    V.el.hidden = false; document.documentElement.classList.add("vwopen"); vwShow();
  }
  function vwClose() { if (!V.el) return; V.tok++; V.el.hidden = true; V.el.innerHTML = ""; document.documentElement.classList.remove("vwopen"); thWatch(); }
  const vwDoc = () => D.docs.find(x => x.id === V.list[V.i]);
  async function vwStep(dir) {
    const d = vwDoc(); if (!d || V.busy) return;
    if (dir > 0) { if (V.p < V.n) V.p++; else if (V.i < V.list.length - 1) { V.i++; V.p = 1; } else return toast(T("Ultima pagina dell'Ordner", "Letzte Seite im Ordner")); }
    else { if (V.p > 1) V.p--; else if (V.i > 0) { V.i--; V.p = -1; } else return toast(T("Prima pagina dell'Ordner", "Erste Seite im Ordner")); }
    V.zoom = false; V.sureDel = null; vwShow();
  }
  function vwShow() {
    const d = vwDoc(); if (!d) return vwClose();
    const tok = ++V.tok; V.n = V.p === -1 ? (d.pages || 1) : Math.max(V.n && V.list[V.i] === V._cur ? V.n : (d.pages || 1), 1); if (V.p === -1) V.p = V.n; V._cur = d.id;
    const secs = allSections(); if (d.section && secs.indexOf(d.section) < 0) secs.push(d.section);
    const quick = TH.get(d.id) && V.p === 1 ? `<img class="vimg" src="${esc(TH.get(d.id))}" alt="">` : "";
    V.el.innerHTML = `<div class="vbar vtop"><button type="button" class="vx" data-v="close" aria-label="${esc(T("Chiudi", "Schließen"))}">✕</button>
<div class="vt"><b>${esc(titleOf(d))}</b><small>${esc([d.subject, fmtDate(d.date), d.section].filter(Boolean).join(" · "))}</small>${d.summary ? `<span class="vsum">${esc(d.summary)}</span>` : ""}</div>
<span class="vc" id="vCount">${esc(T("Pag. ", "S. ") + V.p + "/" + V.n + " · " + T("doc. ", "Dok. ") + (V.i + 1) + "/" + V.list.length)}</span></div>
<div class="vpage ${V.zoom ? "z" : ""}" data-v="zoom">${quick}<span class="spin" ${quick ? 'style="position:absolute"' : ""}></span></div>
<button type="button" class="vnav l" data-v="prev" aria-label="${esc(T("Pagina prima", "Vorherige Seite"))}">‹</button><button type="button" class="vnav r" data-v="next" aria-label="${esc(T("Pagina dopo", "Nächste Seite"))}">›</button>
<div class="vbar vbot"><select id="vSec">${secs.map(s => `<option value="${esc(s)}" ${s === d.section ? "selected" : ""}>${esc(s)}</option>`).join("")}${newOpt(false)}</select>
<input id="vSecNew" maxlength="40" placeholder="${newPh()}" hidden><button type="button" class="dbtn go" data-v="secsave" hidden>${esc(T("Sposta qui", "Hierher"))}</button>
<button type="button" class="dbtn" data-v="card">${esc(T("Scheda", "Details"))}</button>
<div class="vedit"><button type="button" class="dbtn go" data-v="padd">${esc(T("＋ Aggiungi foto qui", "＋ Foto hier einfügen"))}</button><button type="button" class="dbtn" data-v="pdel">${esc(T("Togli pagina", "Seite entfernen"))}</button></div>
<small class="vhint">${esc(T("Le foto nuove vanno dopo la pagina che stai guardando", "Neue Fotos kommen nach der angezeigten Seite"))}</small></div>`;
    (async () => {
      try {
        const doc = await getPdf(d.id); if (tok !== V.tok) return;
        if (doc.numPages !== V.n) { V.n = doc.numPages; if (V.p > V.n) V.p = V.n; const c = $("#vCount"); if (c) c.textContent = T("Pag. ", "S. ") + V.p + "/" + V.n + " · " + T("doc. ", "Dok. ") + (V.i + 1) + "/" + V.list.length; }
        const w = Math.min(2200, Math.round(Math.min(window.innerWidth, 1100) * Math.min(window.devicePixelRatio || 1, 2) * 1.2));
        const u = await pageToUrl(doc, V.p, w, 0.85); if (tok !== V.tok) return;
        const box2 = V.el.querySelector(".vpage"); if (box2) { box2.innerHTML = ""; const im = new Image(); im.className = "vimg"; im.alt = ""; im.src = u; box2.appendChild(im); }
        vwPreload();
      } catch (e) { if (tok === V.tok) { const b = V.el.querySelector(".vpage"); if (b) b.innerHTML = `<div class="dinfo">${esc(msg(e))}</div>`; } }
    })();
  }
  function vwPreload() { [V.list[V.i + 1], V.list[V.i - 1]].filter(Boolean).forEach(id => getPdf(id).catch(() => {})); }
  /* aggiungere o togliere pagine di una lettera già archiviata (pdf-lib, MIT, in lib/).
     Sicuro: prima si salva la versione nuova, solo dopo la vecchia va in "Eliminati" su Drive (recuperabile). */
  const vwFile = document.createElement("input"); vwFile.type = "file"; vwFile.accept = "image/*"; vwFile.multiple = true; vwFile.hidden = true; document.body.appendChild(vwFile);
  vwFile.onchange = () => { const f = [...vwFile.files]; vwFile.value = ""; if (f.length) vwEdit("add", f); };
  async function toJpeg(blob) {
    if (/^image\/(jpeg|jpg|png)$/i.test(blob.type || "")) return blob;
    const url = URL.createObjectURL(blob);
    try { const im = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = url; }); const k = Math.min(1, 1800 / Math.max(im.width, im.height)); const c = document.createElement("canvas"); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); return await new Promise(r => c.toBlob(r, "image/jpeg", 0.85)); }
    finally { URL.revokeObjectURL(url); }
  }
  function vwBusy(on, txt) {
    V.busy = on; if (!V.el) return;
    let o = V.el.querySelector(".vbusy"); if (on) { if (!o) { o = document.createElement("div"); o.className = "vbusy"; V.el.appendChild(o); } o.innerHTML = `<span class="spin"></span><b>${esc(txt)}</b>`; } else if (o) o.remove();
  }
  async function vwEdit(kind, files) {
    const d = vwDoc(); if (!d || V.busy) return;
    if (kind === "del") {
      if (V.n <= 1) return toast(T("È l'unica pagina: per togliere tutta la lettera apri la Scheda", "Einzige Seite: um den ganzen Brief zu entfernen, Details öffnen"));
      if (V.sureDel !== d.id + ":" + V.p) { V.sureDel = d.id + ":" + V.p; const b = V.el.querySelector('[data-v="pdel"]'); if (b) { b.textContent = T("Sicuro? Tocca ancora", "Sicher? Nochmal tippen"); b.classList.add("red"); } setTimeout(() => { if (V.sureDel === d.id + ":" + V.p) { V.sureDel = null; const b2 = V.el && V.el.querySelector('[data-v="pdel"]'); if (b2) { b2.textContent = T("Togli pagina", "Seite entfernen"); b2.classList.remove("red"); } } }, 5000); return; }
      V.sureDel = null;
    }
    vwBusy(true, kind === "add" ? T("Aggiungo le foto…", "Füge Fotos hinzu…") : T("Tolgo la pagina…", "Entferne die Seite…"));
    try {
      await lib("lib/pdf-lib.min.js?v=1.17.1");
      const PL = window.PDFLib; let bytes = pdfBytes.get(d.id);
      if (!bytes) { const j = await api("dPdf", { id: d.id }); if (!j.data) throw new Error(T("PDF non trovato", "PDF nicht gefunden")); bytes = Uint8Array.from(atob(j.data), c => c.charCodeAt(0)); }
      const pdf = await PL.PDFDocument.load(bytes.slice(), { ignoreEncryption: true });
      const cur = Math.min(Math.max(V.p, 1), pdf.getPageCount());
      let showP = cur;
      if (kind === "del") { pdf.removePage(cur - 1); showP = Math.min(cur, pdf.getPageCount()); }
      else {
        const ref = pdf.getPage(cur - 1).getSize(), W = ref.width > ref.height ? 595.28 : Math.max(ref.width, 300), H = ref.width > ref.height ? 841.89 : Math.max(ref.height, 400);
        let at = cur;
        for (const f of files) {
          const jb = await toJpeg(await shrink(f)), ab = new Uint8Array(await new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = ko; r.readAsArrayBuffer(jb); }));
          const img = /png/i.test(jb.type) ? await pdf.embedPng(ab) : await pdf.embedJpg(ab);
          const s = Math.min(W / img.width, H / img.height), w = img.width * s, h = img.height * s;
          const pg = pdf.insertPage(at, [W, H]); pg.drawImage(img, { x: (W - w) / 2, y: (H - h) / 2, width: w, height: h }); at++;
        }
        showP = cur + 1;
      }
      const out = await pdf.save(), n = pdf.getPageCount();
      const j = await api("dSave", { pdf: await blobToB64(new Blob([out], { type: "application/pdf" })), doc: { owner: d.owner, section: d.section, sender: d.sender, date: d.date, subject: d.subject, summary: d.summary, due: d.due, dueWhat: d.dueWhat, amount: d.amount, ref: d.ref, note: d.note, tags: d.tags, remind: d.remind, done: d.done === true, pages: n, unsure: d.status === "check" } });
      const nd = j.doc; let oldGone = true;
      try { await api("dDel", { id: d.id }); } catch (e) { oldGone = false; }
      D.docs = D.docs.filter(x => x.id !== d.id); D.docs.push(nd);
      V.list[V.i] = nd.id; pdfBytes.set(nd.id, new Uint8Array(out)); pdfBytes.delete(d.id); const od = pdfDocs.get(d.id); if (od) { pdfDocs.delete(d.id); try { od.destroy(); } catch (e) {} }
      TH.delete(d.id); V.n = n; V.p = showP; V._cur = nd.id;
      toast(oldGone ? (kind === "add" ? T("Foto aggiunte ✓", "Fotos hinzugefügt ✓") : T("Pagina tolta ✓", "Seite entfernt ✓")) : T("Salvato, ma la versione vecchia è rimasta: toglila dalla Scheda", "Gespeichert, alte Version noch da: in den Details entfernen"));
      vwBusy(false); vwShow(); render();
    } catch (e) { vwBusy(false); toast(msg(e)); }
  }

  function vwChange(e) {
    if (e.target.id !== "vSec") return;
    const d = vwDoc(), isNew = e.target.value === NEWSEC, inp = $("#vSecNew"), btn = V.el.querySelector('[data-v="secsave"]');
    inp.hidden = !isNew; btn.hidden = !isNew && e.target.value === d.section;
    if (isNew) inp.focus(); else if (e.target.value !== d.section) vwSetSec(e.target.value);
  }
  async function vwSetSec(sec) {
    const d = vwDoc(); if (!d || !sec || sec === d.section) return;
    const patch = { section: sec }; if (!realSender(d.sender)) patch.sender = sec;
    await update(d, patch);
    if (!V.el.hidden && vwDoc() === d) { const tb = V.el.querySelector(".vt b"); if (tb) tb.textContent = titleOf(d); const s = $("#vSec"); if (s && !Array.from(s.options).some(o => o.value === d.section)) { const o = document.createElement("option"); o.value = o.textContent = d.section; s.insertBefore(o, s.lastElementChild); } if (s) s.value = d.section; const inp = $("#vSecNew"); if (inp) { inp.hidden = true; inp.value = ""; } const b = V.el.querySelector('[data-v="secsave"]'); if (b) b.hidden = true; }
  }
  function vwClick(e) {
    const el = e.target.closest("[data-v]"); if (!el) return;
    const a = el.dataset.v;
    if (V.busy) return;
    if (a === "padd") { vwFile.value = ""; return vwFile.click(); }
    if (a === "pdel") return vwEdit("del");
    if (a === "close") return vwClose();
    if (a === "next") return vwStep(1);
    if (a === "prev") return vwStep(-1);
    if (a === "zoom") { V.zoom = !V.zoom; el.classList.toggle("z", V.zoom); return; }
    if (a === "secsave") { const s = $("#vSec").value; if (s === NEWSEC) { const n = $("#vSecNew").value.trim(); if (!n) { askName(); return $("#vSecNew").focus(); } return vwSetSec(n); } return vwSetSec(s); }
    if (a === "card") { const id = V.list[V.i]; vwClose(); D.from = "arch"; D.cur = id; return go("doc"); }
  }

  function render() {
    if (!D.on) return;
    const v = D.view;
    const html = v === "secs" ? vSecs() : v === "sec" ? vSec() : v === "doc" ? vDoc() : v === "due" ? vDue() : v === "ask" ? vAsk() : v === "batch" ? vBatch() : v === "arch" ? vArch() : vHome();
    const keepAsk = $("#dAskIn") ? $("#dAskIn").value : "";
    box.innerHTML = html + (v === "batch" || v === "doc" ? "" : nav());
    if ($("#dAskIn") && keepAsk) $("#dAskIn").value = keepAsk;
    if (D.view === "arch") {
      thWatch();
      const q = $("#arQ"); if (q) q.addEventListener("input", () => { D.arQ = q.value.trim(); const r = $("#arRes"); if (r) { r.innerHTML = arRes(arList()); thWatch(); } const x = box.querySelector(".arx"); if (x && !q.value) x.remove(); else if (!x && q.value) { const b = document.createElement("button"); b.type = "button"; b.className = "arx"; b.dataset.act = "arclear"; b.textContent = "✕"; b.setAttribute("aria-label", T("Cancella", "Löschen")); q.after(b); } });
    }
    if (D.view === "home") { renderRes(); const q = $("#dQ"); q && q.addEventListener("input", () => { D.q = q.value; renderRes(); }); }
  }
  const go = v => { stopMic(); D.view = v; D.sure = null; window.scrollTo(0, 0); render(); };
  /* voce: si parla, il testo compare nel riquadro, poi si preme Chiedi / Prepara (niente parte da solo) */
  let rec = null;
  function stopMic() { if (rec) { try { rec.stop(); } catch (e) {} } }
  function toggleMic() {
    if (rec) return stopMic();
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition, box = $("#dAskIn");
    if (!SR) { if (box) box.focus(); return toast(T("Qui la dettatura dell'app non c'è: usa il microfono della tastiera", "Diktat hier nicht verfügbar: Mikrofon der Tastatur benutzen")); }
    const base = box && box.value.trim() ? box.value.trim() + " " : "";
    rec = new SR(); rec.lang = lang === "de" ? "de-DE" : "it-IT"; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
    rec.onresult = e => { let t = ""; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; const b = $("#dAskIn"); if (b) b.value = (base + t).slice(0, 500); };
    rec.onerror = e => { if (e.error === "not-allowed" || e.error === "service-not-allowed") toast(T("Permetti il microfono all'app nelle impostazioni del telefono", "Bitte Mikrofon für die App in den Einstellungen erlauben")); else if (e.error !== "aborted" && e.error !== "no-speech") toast(T("Non ho capito, riprova", "Nicht verstanden, bitte nochmal")); };
    rec.onend = () => { rec = null; D.listening = false; const v = $("#dAskIn") ? $("#dAskIn").value : ""; render(); if ($("#dAskIn")) $("#dAskIn").value = v; };
    try { rec.start(); D.listening = true; const v = box ? box.value : ""; render(); if ($("#dAskIn")) $("#dAskIn").value = v; } catch (e) { rec = null; D.listening = false; toast(T("Microfono non disponibile", "Mikrofon nicht verfügbar")); }
  }
  function openDoc(id) { D.from = D.view === "doc" ? D.from : D.view; D.cur = id; go("doc"); }
  async function pdfBlob(d) { const j = await api("dPdf", { id: d.id }); if (!j.data) throw new Error(T("PDF non trovato", "PDF nicht gefunden")); const by = Uint8Array.from(atob(j.data), c => c.charCodeAt(0)); return { blob: new Blob([by], { type: "application/pdf" }), name: j.name || "documento.pdf" }; }
  async function update(d, patch) { try { const j = await api("dUpdate", { doc: Object.assign({ id: d.id }, patch) }); Object.assign(d, j.doc); if (j.doc.section && D.sections.indexOf(j.doc.section) < 0) D.sections.push(j.doc.section); toast(T("Salvato ✓", "Gespeichert ✓")); } catch (e) { toast(msg(e)); } render(); }
  const runFilter = f => sortDate(live().filter(d => (!f.owner || d.owner === f.owner) && (!f.sections.length || f.sections.indexOf(d.section) >= 0) && (!f.from || String(d.date || "") >= f.from) && (!f.to || String(d.date || "") <= f.to) && (!f.text || match(d, f.text)) && (!f.due || (f.due === "open" ? d.due && !d.done : !!d.due)) && (!f.check || d.status === "check")));

  box.addEventListener("change", e => {
    if (e.target.id === "arSort") { D.arSort = e.target.value; D.arDir = (AR_SORTS.find(x => x[0] === D.arSort) || [0, 0, -1])[2]; return render(); }
    if (e.target.id === "arSec") { D.arSec = e.target.value; return render(); }
    if (e.target.id === "fSection") { const inp = $("#fSectionNew"); if (inp) { inp.hidden = e.target.value !== NEWSEC; if (!inp.hidden) inp.focus(); } return; }
    const s = e.target.closest("select[data-act]"); if (!s || !D.batch || !D.batch.groups) return;
    const g = D.batch.groups[+s.dataset.g]; if (!g) return;
    if (s.dataset.act === "gown") g.owner = s.value;
    else if (s.dataset.act === "gsec") {
      const inp = box.querySelector('input[data-act="gsecnew"][data-g="' + s.dataset.g + '"]');
      g.userSec = true;
      if (s.value === NEWSEC) { g.secNew = true; g.section = inp ? inp.value.trim() : ""; g.newSection = true; if (inp) { inp.hidden = false; inp.focus(); } }
      else { g.secNew = false; g.section = s.value; g.newSection = D.sections.indexOf(s.value) < 0; if (inp) inp.hidden = true; }
    }
  });
  box.addEventListener("input", e => {
    const t = e.target; if (!t.matches || !t.matches('input[data-act="gsecnew"]') || !D.batch || !D.batch.groups) return;
    const g = D.batch.groups[+t.dataset.g]; if (g) { g.section = t.value.trim(); g.newSection = true; }
  });
  box.addEventListener("click", async e => {
    const el = e.target.closest("[data-act]"); if (!el || el.tagName === "SELECT") return;
    const a = el.dataset.act, d = D.docs.find(x => x.id === D.cur), b = D.batch;
    if (a === "go") return go(el.dataset.v);
    if (a === "arop") return vwOpen(+el.dataset.i);
    if (a === "arclear") { D.arQ = ""; render(); const q = $("#arQ"); if (q) q.focus(); return; }
    if (a === "ardir") { D.arDir = -D.arDir; return render(); }
    if (a === "lang") { const o = $$('.langs button[data-l="' + el.dataset.l + '"]').find(x => !box.contains(x)); if (o) o.click(); return; }
    if (a === "cam" || a === "pick" || a === "pdf") return pickFiles(a);
    if (a === "open") return openDoc(el.dataset.id);
    if (a === "owner") { D.owner = el.dataset.o; return render(); }
    if (a === "sec") { D.sec = el.dataset.s; D.secFilter = "all"; return go("sec"); }
    if (a === "sf") { D.secFilter = el.dataset.f; return render(); }
    if (a === "clearq") { D.q = ""; return render(); }
    if (a === "check") { D.askMode = "agent"; D.agRes = { title: T("Da controllare", "Zu prüfen"), set: {}, list: live().filter(x => x.status === "check") }; return go("ask"); }
    if (a === "dueall") { D.dueAll = el.dataset.x === "1"; return render(); }
    if (a === "ren" || a === "merge") {
      const to = a === "ren" ? $("#dRen").value.trim() : $("#dMerge").value; if (!to || to === D.sec) return;
      try { const j = await api("dSecRename", { from: D.sec, to }); D.sections = j.sections; live().forEach(x => { if (x.section === D.sec) x.section = to; }); D.sec = to; toast(T("Fatto ✓", "Erledigt ✓")); } catch (er) { toast(msg(er)); }
      return render();
    }
    if (d && a === "save") {
      let sec = $("#fSection").value;
      if (sec === NEWSEC) { sec = $("#fSectionNew").value.trim(); if (!sec) { askName(); return $("#fSectionNew").focus(); } }
      const snd = realSender($("#fSender").value) || (sec !== "Altro" ? sec : "");
      return update(d, { owner: $("#fOwner").value, section: sec, sender: snd, subject: $("#fSubject").value, date: $("#fDate").value, due: $("#fDue").value, dueWhat: $("#fDueWhat").value, amount: $("#fAmount").value, ref: $("#fRef").value, summary: $("#fSummary").value });
    }
    if (d && a === "okdoc") return update(d, { status: "ok" });
    if (d && a === "done") return update(d, { done: !d.done });
    if (d && a === "rem") { const n = +el.dataset.n, r = (Array.isArray(d.remind) ? d.remind : [3, 2, 1]).slice(); const k = r.indexOf(n); if (k >= 0) r.splice(k, 1); else r.push(n); return update(d, { remind: r }); }
    if (d && a === "del") {
      if (D.sure !== d.id) { D.sure = d.id; render(); setTimeout(() => { if (D.sure === d.id) { D.sure = null; render(); } }, 5000); return; }
      try { await api("dDel", { id: d.id }); D.docs = D.docs.filter(x => x.id !== d.id); toast(T("Tolto dall'archivio", "Aus dem Archiv genommen")); } catch (er) { toast(msg(er)); }
      D.sure = null; return go(D.from || "home");
    }
    if (d && (a === "openpdf" || a === "dlpdf" || a === "share")) {
      toast(T("Preparo il PDF…", "PDF wird vorbereitet…"));
      try {
        const p = await pdfBlob(d);
        if (a === "dlpdf") return dl(p.name, p.blob);
        if (a === "share") { const f = new File([p.blob], p.name, { type: "application/pdf" }); if (navigator.canShare && navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f], title: p.name }); } catch (_) {} } else dl(p.name, p.blob); return; }
        const u = URL.createObjectURL(p.blob); const w = window.open(u, "_blank"); if (!w) dl(p.name, p.blob); setTimeout(() => URL.revokeObjectURL(u), 60000);
      } catch (er) { toast(msg(er)); }
      return;
    }
    if (a === "mic") return toggleMic();
    if (a === "mode") { stopMic(); D.askMode = el.dataset.m; return render(); }
    if (a === "askgo") {
      const q = ($("#dAskIn").value || "").trim(); if (!q || D.busy) return;
      D.busy = true; render(); $("#dAskIn").value = q;
      try {
        if (D.askMode === "ask") { const j = await api("dAsk", { q, lang }); D.askRes = { q, answer: j.answer, ids: j.ids || [] }; }
        else { const j = await api("dAgent", { q, lang }); D.agRes = { q, title: j.title, set: j.set || {}, list: runFilter(j.filter || { sections: [] }) }; }
      } catch (er) { toast(msg(er)); }
      D.busy = false; render(); $("#dAskIn").value = q; return;
    }
    if (a === "apply" && D.agRes) {
      try { const j = await api("dApply", { ids: D.agRes.list.map(x => x.id), set: D.agRes.set, q: D.agRes.q }); toast(T(j.n + " documenti aggiornati ✓", j.n + " Dokumente aktualisiert ✓")); D.agRes = null; await load(); } catch (er) { toast(msg(er)); }
      return;
    }
    if (b && a === "cancel") { if (b.saving) return; b.items.forEach(x => x.url && URL.revokeObjectURL(x.url)); D.batch = null; return go("home"); }
    if (b && b.groups && !b.saving) {
      const gi = +el.dataset.g, g = b.groups[gi];
      if (a === "gmerge" && gi > 0) { const p = b.groups[gi - 1]; p.items = p.items.concat(g.items); p.unsure = p.unsure || g.unsure; b.groups.splice(gi, 1); return render(); }
      if (a === "gsplit" && g) { const parts = g.items.map((i, k) => Object.assign({}, g, { items: [i], sender: k ? (b.items[i].info || {}).sender || g.sender : g.sender, subject: k ? (b.items[i].info || {}).subject || g.subject : g.subject })); b.groups.splice(gi, 1, ...parts); return render(); }
      if (a === "gdrop" && g) { b.groups.splice(gi, 1); return render(); }
      if (a === "saveall") return saveAll();
    }
  });
})();
