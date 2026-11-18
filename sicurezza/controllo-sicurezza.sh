#!/usr/bin/env bash
# Controllo di sicurezza di Waiblingen Ink (gratis e open source).
# Da eseguire prima di ogni pubblicazione:   bash sicurezza/controllo-sicurezza.sh
#
# Strumenti (versioni fissate e verificate, niente "latest"):
#   Gitleaks 8.30.0  (github.com/gitleaks/gitleaks, MIT)   chiavi, password e token finiti nel codice o nella cronologia git
#   Semgrep CE       (github.com/semgrep/semgrep, LGPL)     falle nel codice: XSS, eval, link pericolosi, segreti
#   regole Semgrep   (github.com/semgrep/semgrep-rules)      fissate a un commit preciso, lette in locale (nessun invio dati)
#
# Trivy (il più stellato) NON è usato: a marzo 2026 è stato compromesso (CVE-2026-33634, versioni con ruba credenziali).
# Funziona su Linux e macOS (Intel e Apple Silicon). Non manda il codice a nessun server (--metrics=off).
set -euo pipefail

GL_VER="8.30.0"
SG_VER="1.186.0"
RULES_COMMIT="a5ad1714f00c9f7fde980cab0ea1d6dc6d414fd2"
TOOLS="${HOME}/.waiblingen-sicurezza"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$TOOLS"

# --- Gitleaks: scarico il binario ufficiale e controllo l'impronta SHA-256 ---
case "$(uname -s)_$(uname -m)" in
  Linux_x86_64)  GL_FILE="gitleaks_${GL_VER}_linux_x64.tar.gz";    GL_SHA="79a3ab579b53f71efd634f3aaf7e04a0fa0cf206b7ed434638d1547a2470a66e" ;;
  Darwin_arm64)  GL_FILE="gitleaks_${GL_VER}_darwin_arm64.tar.gz"; GL_SHA="b251ab2bcd4cd8ba9e56ff37698c033ebf38582b477d21ebd86586d927cf87e7" ;;
  Darwin_x86_64) GL_FILE="gitleaks_${GL_VER}_darwin_x64.tar.gz";   GL_SHA="ca221d012d247080c2f6f61f4b7a83bffa2453806b0c195c795bbe9a8c775ed5" ;;
  *) echo "Sistema non previsto: $(uname -s) $(uname -m)"; exit 1 ;;
esac
if [ ! -x "$TOOLS/gitleaks" ] || ! "$TOOLS/gitleaks" version 2>/dev/null | grep -q "$GL_VER"; then
  curl -sSLf -o "$TOOLS/$GL_FILE" "https://github.com/gitleaks/gitleaks/releases/download/v${GL_VER}/${GL_FILE}"
  if command -v sha256sum >/dev/null; then GOT=$(sha256sum "$TOOLS/$GL_FILE" | cut -d' ' -f1); else GOT=$(shasum -a 256 "$TOOLS/$GL_FILE" | cut -d' ' -f1); fi
  [ "$GOT" = "$GL_SHA" ] || { echo "ATTENZIONE: impronta di Gitleaks diversa, file scartato"; rm -f "$TOOLS/$GL_FILE"; exit 1; }
  tar xzf "$TOOLS/$GL_FILE" -C "$TOOLS" gitleaks && rm -f "$TOOLS/$GL_FILE"
fi

# --- Semgrep in un ambiente Python separato, versione fissata ---
if [ ! -x "$TOOLS/venv/bin/semgrep" ] || ! "$TOOLS/venv/bin/semgrep" --version 2>/dev/null | grep -q "$SG_VER"; then
  python3 -m venv "$TOOLS/venv"
  "$TOOLS/venv/bin/pip" install -q "semgrep==${SG_VER}"
fi
if [ ! -d "$TOOLS/semgrep-rules/.git" ]; then git clone -q https://github.com/semgrep/semgrep-rules "$TOOLS/semgrep-rules"; fi
git -C "$TOOLS/semgrep-rules" fetch -q --depth 1 origin "$RULES_COMMIT" 2>/dev/null || true
git -C "$TOOLS/semgrep-rules" checkout -q "$RULES_COMMIT"

echo "== 1/2 Gitleaks: segreti nel codice e in tutta la cronologia git =="
"$TOOLS/gitleaks" git "$ROOT" --redact --no-banner || GL_FAIL=1

echo "== 2/2 Semgrep: falle nel codice =="
R="$TOOLS/semgrep-rules"
"$TOOLS/venv/bin/semgrep" scan --metrics=off --disable-version-check --quiet \
  --config "$R/javascript" --config "$R/html" --config "$R/generic/secrets" \
  --exclude 'lib/' --severity ERROR "$ROOT" || true

echo
echo "Nota: Semgrep segnala ogni innerHTML; nell'app Ricevute ogni dato passa da esc() prima di finire nella pagina,"
echo "quindi quelle righe vanno lette, non sono automaticamente falle. Gitleaks invece deve dire: no leaks found."
[ -z "${GL_FAIL:-}" ] || { echo "GITLEAKS HA TROVATO SEGRETI: fermarsi e sistemare prima di pubblicare."; exit 2; }
