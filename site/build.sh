#!/usr/bin/env bash
# Build footballwhoami.com into site/dist: the landing page (site/home) plus privacy, terms and
# support from site/legal, restyled in the app's look. Pass --preview to build with placeholders.
set -euo pipefail
cd "$(dirname "$0")"
if [[ "${1:-}" != "--preview" ]] && grep -q '\[WHY' home/index.html; then echo "Fill in [WHY] in home/index.html first"; exit 1; fi
rm -rf dist
python3 ~/.claude-personal/skills/legal-pages/build_legal_site.py legal dist "Football Who Am I?" footballwhoami.com --home home "$@"
rm -f dist/CNAME  # served by a Cloudflare Worker, not GitHub Pages
CSS='@font-face{font-family:Montserrat;font-weight:400;font-display:swap;src:url(/fonts/montserrat-400Regular.woff2) format("woff2")}@font-face{font-family:Montserrat;font-weight:800;font-display:swap;src:url(/fonts/montserrat-800ExtraBold.woff2) format("woff2")}body{margin:0;background:linear-gradient(180deg,#13264a,#0e1b2f 40%,#070e1a);min-height:100vh;color:#aebbd3;font:16px/1.7 Montserrat,system-ui,sans-serif}main{max-width:680px;margin:auto;padding:32px 20px 64px}a{color:#5ee6d0}h1{color:#f4f6ff;font-weight:800;font-size:34px;line-height:1.2}h2{color:#f4f6ff;font-weight:800;margin-top:32px;font-size:20px}strong{color:#f4f6ff}nav{display:flex;flex-wrap:wrap;gap:18px;font-weight:800}nav a{color:#f4f6ff;text-decoration:none}nav a:first-child{background:linear-gradient(90deg,#7b3fe4,#d6249f);-webkit-background-clip:text;background-clip:text;color:transparent}'
for f in dist/privacy/index.html dist/terms/index.html dist/support/index.html; do
  python3 - "$f" "$CSS" <<'PY'
import re, sys
p, css = sys.argv[1], sys.argv[2]
s = open(p, encoding='utf8').read()
s = re.sub(r'<style>.*?</style>', '<style>' + css + '</style><link rel="icon" href="/favicon.png"><meta name="theme-color" content="#0e1b2f">', s, flags=re.S)
open(p, 'w', encoding='utf8').write(s)
PY
done
echo "Built site/dist"
