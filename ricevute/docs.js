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
    secs: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 7h7l2 2h9v10H3z"></path></svg>',
    due: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="13" r="8"></circle><path d="M12 9v4l3 2"></path></svg>',
    mic: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="vertical-align:-3px"><rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0"></path><path d="M12 18v3"></path></svg>',
    ask: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"></path></svg>'
  };
  const langBtns = () => `<div class="langs"><button type="button" data-act="lang" data-l="it" class="${lang === "it" ? "on" : ""}">IT</button><button type="button" data-act="lang" data-l="de" class="${lang === "de" ? "on" : ""}">DE</button></div>`;
  const backTop = (title, sub, to) => `<div class="top"><div style="display:flex;align-items:center;gap:12px;min-width:0"><button type="button" class="dbtn" data-act="go" data-v="${esc(to || "home")}" aria-label="${esc(T("Indietro", "Zurück"))}">${ICON.back}</button><div class="dtitle" style="min-width:0"><b style="font-size:19px">${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}</div></div></div>`;
  function nav() {
    const it = [["home", ICON.home, T("Documenti", "Dokumente")], ["secs", ICON.secs, T("Sezioni", "Bereiche")], ["due", ICON.due, T("Scadenze", "Fristen")], ["ask", ICON.ask, T("Chiedi", "Fragen")]];
    return `<nav class="tabs"><div class="in">${it.map(([v, i, l]) => `<button type="button" data-act="go" data-v="${v}" class="${D.view === v ? "on" : ""}">${i}<span>${esc(l)}</span></button>`).join("")}</div></nav>`;
  }
  function row(d) {
    const tags = [d.owner === "vecchia" ? `<span class="dtag old">${esc(OWN.vecchia())}</span>` : "", d.status === "check" ? `<span class="dtag chk">${esc(T("da controllare", "prüfen"))}</span>` : "",
      d.due && !d.done ? `<span class="dtag ${days(d.due) <= 3 ? "due" : "ok"}">${esc(whenTxt(days(d.due)))}</span>` : ""].join("");
    return `<button type="button" class="dr" data-act="open" data-id="${esc(d.id)}"><span class="m"><b>${esc(d.sender || T("Senza mittente", "Ohne Absender"))}</b><small>${esc([d.subject, d.section].filter(Boolean).join(" · "))}</small></span><span class="s">${esc(fmtDate(d.date))}${tags}</span></button>`;
  }
  const STOP = new Set(["trova", "trovami", "cerca", "dove", "documento", "documenti", "lettera", "lettere", "della", "dello", "delle", "degli", "quale", "quali", "mostra", "fammi", "vedere", "finde", "suche", "zeig", "zeige", "bitte", "dokument", "dokumente", "brief", "briefe", "von", "der", "die", "das", "und"]);
  const guess = q => { const w = norm(q).split(/[^a-z0-9]+/).filter(x => x.length >= 4 && !STOP.has(x)); if (!w.length) return [];
    return live().map(d => ({ d, n: w.filter(t => match(d, t)).length })).filter(x => x.n).sort((a, b) => b.n - a.n || String(b.d.date || "").localeCompare(String(a.d.date || ""))).map(x => x.d).slice(0, 8); };
  const listOf = (l, empty) => l.length ? `<div class="list">${l.map(row).join("")}</div>` : `<div class="dinfo">${esc(empty || T("Nessun documento.", "Keine Dokumente."))}</div>`;
  const ownerChips = () => `<div class="chips">${[["all", T("Tutti", "Alle")], ["nuova", OWN.nuova()], ["vecchia", OWN.vecchia()]].map(([k, l]) => `<button type="button" data-act="owner" data-o="${k}" class="${D.owner === k ? "on" : ""}">${esc(l)}</button>`).join("")}</div>`;
  const secCount = s => byOwner(live()).filter(d => d.section === s).length;
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
<label>${esc(T("Sezione", "Bereich"))}<select id="fSection">${secOpts}</select></label>
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
    b.saving = true; b.done = 0; render();
    const saved = [];
    for (const g of b.groups) {
      if (g.saved) { b.done++; continue; }
      try {
        const p = await pdfOfGroup(g);
        const j = await api("dSave", { pdf: p.b64, doc: { owner: g.owner, section: g.section, sender: g.sender, date: g.date, subject: g.subject, summary: g.summary, due: g.due, dueWhat: g.dueWhat, amount: g.amount, ref: g.ref, pages: p.pages, private: g.private === true, unsure: g.unsure === true, newSection: g.newSection === true, oldRule: g.oldRule === true } });
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
<label>${esc(T("Sezione", "Bereich"))}<select data-act="gsec" data-g="${gi}">${secs.map(s => `<option value="${esc(s)}" ${s === g.section ? "selected" : ""}>${esc(s)}</option>`).join("")}</select></label></div>
<div class="drow3">${gi ? `<button type="button" class="dbtn" data-act="gmerge" data-g="${gi}">${esc(T("Unisci a sopra", "Mit oben"))}</button>` : `<span></span>`}${g.items.length > 1 ? `<button type="button" class="dbtn" data-act="gsplit" data-g="${gi}">${esc(T("Dividi", "Trennen"))}</button>` : `<span></span>`}<button type="button" class="dbtn red" data-act="gdrop" data-g="${gi}">${esc(T("Togli", "Weglassen"))}</button></div>
</div>`).join("")}
<button type="button" class="dbtn go" style="min-height:54px;font-size:16px" data-act="saveall" ${b.saving || !b.groups.length ? "disabled" : ""}>${esc(b.saving ? T("Archivio " + b.done + " di " + b.groups.length + "…", "Archiviere " + b.done + " von " + b.groups.length + "…") : T("Archivia tutti e " + b.groups.length, "Alle " + b.groups.length + " archivieren"))}</button>
<button type="button" class="dbtn red" data-act="cancel">${esc(T("Annulla tutto", "Alles abbrechen"))}</button></main>`;
  }

  function render() {
    if (!D.on) return;
    const v = D.view;
    const html = v === "secs" ? vSecs() : v === "sec" ? vSec() : v === "doc" ? vDoc() : v === "due" ? vDue() : v === "ask" ? vAsk() : v === "batch" ? vBatch() : vHome();
    const keepAsk = $("#dAskIn") ? $("#dAskIn").value : "";
    box.innerHTML = html + (v === "batch" || v === "doc" ? "" : nav());
    if ($("#dAskIn") && keepAsk) $("#dAskIn").value = keepAsk;
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
    const s = e.target.closest("select[data-act]"); if (!s || !D.batch || !D.batch.groups) return;
    const g = D.batch.groups[+s.dataset.g]; if (!g) return;
    if (s.dataset.act === "gown") g.owner = s.value; else if (s.dataset.act === "gsec") { g.section = s.value; g.newSection = D.sections.indexOf(s.value) < 0; }
  });
  box.addEventListener("click", async e => {
    const el = e.target.closest("[data-act]"); if (!el || el.tagName === "SELECT") return;
    const a = el.dataset.act, d = D.docs.find(x => x.id === D.cur), b = D.batch;
    if (a === "go") return go(el.dataset.v);
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
    if (d && a === "save") return update(d, { owner: $("#fOwner").value, section: $("#fSection").value, sender: $("#fSender").value, subject: $("#fSubject").value, date: $("#fDate").value, due: $("#fDue").value, dueWhat: $("#fDueWhat").value, amount: $("#fAmount").value, ref: $("#fRef").value, summary: $("#fSummary").value });
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
