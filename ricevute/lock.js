"use strict";
/* Blocco dell'app Ricevute/Documenti (Waiblingen Ink): codice a 4 cifre obbligatorio + Face ID (o Touch ID / Windows Hello).
   - Si chiede a ogni apertura e quando si torna nell'app dopo almeno 1 minuto fuori.
   - Il codice resta solo su questo dispositivo, salvato come impronta PBKDF2 (mai in chiaro).
   - Face ID usa le passkey del telefono (WebAuthn, verifica dell'utente obbligatoria).
   - Dopo 5 codici sbagliati: codice cancellato e uscita dall'account Google (bisogna rientrare e sceglierne uno nuovo).
   Tutto il testo mostrato è fisso o passa da escH(). */
(function () {
  const K = "wi-lock", KF = "wi-lock-f", AWAY = 60000, MAXF = 5, ITER = 150000;
  const L = () => { try { return localStorage.getItem("wi-lang") === "de" ? "de" : "it"; } catch (e) { return "it"; } };
  const T = (it, de) => (L() === "de" ? de : it);
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const del = k => { try { localStorage.removeItem(k); } catch (e) {} };
  const cfg = () => { try { return JSON.parse(get(K) || "null"); } catch (e) { return null; } };
  const hasToken = () => !!get("wi-token");
  const b64 = u => btoa(String.fromCharCode.apply(null, new Uint8Array(u)));
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const canCrypto = !!(window.crypto && crypto.subtle);
  const canBio = !!(window.PublicKeyCredential && navigator.credentials && canCrypto);

  async function hashPin(pin, salt, iter) {
    const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
    return b64(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: iter }, k, 256));
  }
  function same(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }

  /* ---------- aspetto ---------- */
  const css = document.createElement("style");
  css.textContent = `
html.wi-locked .app,html.wi-locked #v-login,html.wi-cover .app,html.wi-cover #dViewer{visibility:hidden!important}
#wiLock{position:fixed;inset:0;z-index:2147483000;background:#F9FAFB;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:24px 20px calc(24px + env(safe-area-inset-bottom));font:15px/1.45 Inter,system-ui,sans-serif;color:#0f172a;-webkit-user-select:none;user-select:none}
#wiLock[hidden]{display:none}
#wiLock .lg{width:64px;height:64px;border-radius:18px;background:#0057FF;display:flex;align-items:center;justify-content:center}
#wiLock h1{margin:0;font-size:22px;font-weight:800;text-align:center}
#wiLock p{margin:0;color:#475569;text-align:center;max-width:320px}
#wiLock .dots{display:flex;gap:14px;height:18px}
#wiLock .dots i{width:14px;height:14px;border-radius:7px;border:2px solid #0057FF;display:block}
#wiLock .dots i.on{background:#0057FF}
#wiLock .err{color:#b91c1c;min-height:20px;font-size:14px;text-align:center}
#wiLock .pad{display:grid;grid-template-columns:repeat(3,72px);gap:14px}
#wiLock .pad button{height:72px;border-radius:36px;border:1px solid #E5E7EB;background:#fff;font-size:26px;font-weight:600;color:#0f172a;cursor:pointer}
#wiLock .pad button:active{background:#E6EEFF}
#wiLock .pad .nb{border:none;background:none;font-size:15px;color:#0057FF}
#wiLock .bio{min-height:48px;padding:0 20px;border-radius:14px;border:none;background:#0057FF;color:#fff;font-size:16px;font-weight:700;cursor:pointer}
#wiLock .lnk{border:none;background:none;color:#475569;font-size:13px;text-decoration:underline;cursor:pointer}
#wiLock .shake{animation:wiSh .35s}
@keyframes wiSh{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`;
  document.head.appendChild(css);

  const box = document.createElement("div"); box.id = "wiLock"; box.hidden = true; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
  const LOGO = '<div class="lg"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg></div>';
  function mount() { if (!box.isConnected) document.body.appendChild(box); }

  /* ---------- stato ---------- */
  const S = { mode: null, pin: "", first: "", busy: false, hiddenAt: 0, locked: false };
  function show(mode, msg) {
    S.mode = mode; S.pin = ""; S.busy = false;
    document.documentElement.classList.add("wi-locked"); S.locked = true; mount(); box.hidden = false; draw(msg || "");
  }
  function unlock() {
    S.locked = false; S.mode = null; S.pin = ""; box.hidden = true;
    document.documentElement.classList.remove("wi-locked", "wi-cover");
  }
  function draw(msg) {
    const c = cfg(), title = S.mode === "setup1" ? T("Scegli un codice di 4 cifre", "Wähle einen 4-stelligen Code")
      : S.mode === "setup2" ? T("Ripeti il codice", "Code wiederholen")
      : S.mode === "bio" ? T("Attivare Face ID?", "Face ID aktivieren?") : T("App bloccata", "App gesperrt");
    const sub = S.mode === "setup1" ? T("Serve per aprire l'app su questo telefono. Lo conosci solo tu.", "Damit öffnest du die App auf diesem Telefon. Nur du kennst ihn.")
      : S.mode === "setup2" ? T("Inseriscilo di nuovo per conferma.", "Zur Bestätigung noch einmal eingeben.")
      : S.mode === "bio" ? T("Così apri l'app con il viso (o l'impronta). Il codice resta come riserva.", "So öffnest du die App mit dem Gesicht (oder Fingerabdruck). Der Code bleibt als Reserve.")
      : T("Inserisci il codice o usa Face ID", "Code eingeben oder Face ID verwenden");
    if (S.mode === "bio") {
      box.innerHTML = LOGO + `<h1>${title}</h1><p>${sub}</p><button type="button" class="bio" data-a="bioon">${T("Attiva Face ID", "Face ID aktivieren")}</button><button type="button" class="lnk" data-a="biono">${T("Solo codice", "Nur Code")}</button><div class="err"></div>`;
      if (msg) box.querySelector(".err").textContent = msg;
      return;
    }
    const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button type="button" data-k="${n}" aria-label="${n}">${n}</button>`).join("");
    const left = S.mode === "unlock" && c && c.c && canBio ? `<button type="button" class="nb" data-a="bio">Face ID</button>` : `<span></span>`;
    box.innerHTML = LOGO + `<h1>${title}</h1><p>${sub}</p><div class="dots" aria-hidden="true">${[0, 1, 2, 3].map(i => `<i class="${i < S.pin.length ? "on" : ""}"></i>`).join("")}</div><div class="err" aria-live="polite"></div>
<div class="pad">${keys}${left}<button type="button" data-k="0" aria-label="0">0</button><button type="button" class="nb" data-a="back" aria-label="${T("Cancella", "Löschen")}">⌫</button></div>
${S.mode === "unlock" ? `<button type="button" class="lnk" data-a="forgot">${T("Codice dimenticato? Esci ed entra di nuovo con Google", "Code vergessen? Abmelden und neu mit Google anmelden")}</button>` : ""}`;
    if (msg) box.querySelector(".err").textContent = msg;
  }
  function dots() { box.querySelectorAll(".dots i").forEach((d, i) => d.classList.toggle("on", i < S.pin.length)); }
  function err(m) { const e = box.querySelector(".err"); if (e) e.textContent = m; const d = box.querySelector(".dots"); if (d) { d.classList.remove("shake"); void d.offsetWidth; d.classList.add("shake"); } }

  async function full() {
    if (S.busy) return; S.busy = true;
    const pin = S.pin;
    try {
      if (S.mode === "setup1") { S.first = pin; S.mode = "setup2"; S.pin = ""; S.busy = false; return draw(); }
      if (S.mode === "setup2") {
        if (pin !== S.first) { S.mode = "setup1"; S.first = ""; S.pin = ""; S.busy = false; return draw(T("I due codici non coincidono, riprova", "Die Codes stimmen nicht überein, bitte erneut")); }
        const salt = crypto.getRandomValues(new Uint8Array(16));
        set(K, JSON.stringify({ s: b64(salt), h: await hashPin(pin, salt, ITER), i: ITER, c: null })); del(KF);
        S.first = ""; S.pin = "";
        if (canBio) { S.busy = false; return show("bio"); }
        return unlock();
      }
      if (S.mode === "unlock") {
        const c = cfg(); if (!c) return unlock();
        const ok = same(await hashPin(pin, unb64(c.s), c.i || ITER), c.h);
        if (ok) { del(KF); return unlock(); }
        const f = (parseInt(get(KF) || "0", 10) || 0) + 1; set(KF, String(f));
        S.pin = ""; S.busy = false; dots();
        if (f >= MAXF) return reset();
        return err(T("Codice sbagliato. Tentativi rimasti: ", "Falscher Code. Verbleibende Versuche: ") + (MAXF - f));
      }
    } catch (e) { S.pin = ""; S.busy = false; dots(); err(T("Errore, riprova", "Fehler, bitte erneut")); }
  }

  /* Face ID: passkey del dispositivo con verifica obbligatoria */
  async function bioOn() {
    try {
      const c = cfg(); if (!c) return;
      const cred = await navigator.credentials.create({ publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)), rp: { name: "Waiblingen Ink Ricevute" },
        user: { id: crypto.getRandomValues(new Uint8Array(16)), name: "Waiblingen Ink", displayName: "Waiblingen Ink" },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "discouraged" }, timeout: 60000, attestation: "none" } });
      if (!cred) throw new Error("x");
      c.c = b64(cred.rawId); set(K, JSON.stringify(c)); unlock();
    } catch (e) { draw(T("Face ID non attivato: puoi usare il codice", "Face ID nicht aktiviert: du kannst den Code verwenden")); }
  }
  async function bioUse(silent) {
    const c = cfg(); if (!c || !c.c || !canBio || S.busy) return;
    S.busy = true;
    try {
      const a = await navigator.credentials.get({ publicKey: { challenge: crypto.getRandomValues(new Uint8Array(32)), allowCredentials: [{ type: "public-key", id: unb64(c.c) }], userVerification: "required", timeout: 60000 } });
      S.busy = false;
      if (a && a.response && a.response.authenticatorData) {
        const flags = new Uint8Array(a.response.authenticatorData)[32];
        if (flags & 4) { del(KF); return unlock(); } /* UV: il telefono ha verificato viso/impronta */
      }
      if (!silent) err(T("Face ID non riuscito, usa il codice", "Face ID fehlgeschlagen, bitte Code verwenden"));
    } catch (e) { S.busy = false; if (!silent) err(T("Face ID non riuscito, usa il codice", "Face ID fehlgeschlagen, bitte Code verwenden")); }
  }
  function reset() {
    del(K); del(KF); del("wi-token");
    unlock();
    if (typeof window.logout === "function") { try { window.logout(); } catch (e) { location.reload(); } } else location.reload();
    setTimeout(() => { const e = document.getElementById("loginErr"); if (e) e.textContent = T("Per sicurezza sei uscito: entra con Google e scegli un nuovo codice.", "Aus Sicherheitsgründen abgemeldet: mit Google anmelden und einen neuen Code wählen."); }, 300);
  }

  box.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.k !== undefined) { if (S.busy || S.pin.length >= 4) return; S.pin += b.dataset.k; dots(); const er = box.querySelector(".err"); if (er) er.textContent = ""; if (S.pin.length === 4) setTimeout(full, 120); return; }
    const a = b.dataset.a;
    if (a === "back") { S.pin = S.pin.slice(0, -1); return dots(); }
    if (a === "bio") return bioUse(false);
    if (a === "bioon") return bioOn();
    if (a === "biono") return unlock();
    if (a === "forgot") return reset();
  });
  document.addEventListener("keydown", e => {
    if (!S.locked || box.hidden || S.mode === "bio") return;
    if (/^[0-9]$/.test(e.key)) { const k = box.querySelector(`[data-k="${e.key}"]`); if (k) k.click(); e.preventDefault(); }
    else if (e.key === "Backspace") { S.pin = S.pin.slice(0, -1); dots(); e.preventDefault(); }
  });

  /* ---------- quando bloccare ---------- */
  function lockNow(silentBio) {
    if (!hasToken() || !canCrypto) return;
    if (!cfg()) return show("setup1");
    show("unlock");
    if (silentBio) setTimeout(() => bioUse(true), 300);
  }
  /* all'avvio: chi è già collegato vede subito il blocco, prima di qualsiasi dato */
  if (hasToken() && canCrypto) document.documentElement.classList.add("wi-locked");
  const start = () => { if (hasToken() && canCrypto) lockNow(true); };
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
  /* dopo il login con Google: codice obbligatorio se non c'è ancora */
  window.WILOCK = { ready() { if (!S.locked && hasToken() && canCrypto && !cfg()) show("setup1"); } };
  /* uscendo dall'app i dati si coprono subito (anche nell'anteprima delle app aperte); dopo 1 minuto fuori si blocca */
  document.addEventListener("visibilitychange", () => {
    if (!hasToken() || !canCrypto) return;
    if (document.visibilityState === "hidden") { S.hiddenAt = Date.now(); if (!S.locked) document.documentElement.classList.add("wi-cover"); }
    else {
      if (!S.locked && S.hiddenAt && Date.now() - S.hiddenAt >= AWAY) lockNow(true);
      else if (!S.locked) document.documentElement.classList.remove("wi-cover");
      S.hiddenAt = 0;
    }
  });
  window.addEventListener("pageshow", e => { if (e.persisted && hasToken() && canCrypto && !S.locked) lockNow(true); });
})();
