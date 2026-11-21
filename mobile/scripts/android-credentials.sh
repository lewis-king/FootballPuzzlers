#!/usr/bin/env bash
# Write mobile/credentials.json for local EAS builds, signed with the 2019 key.
# Asks for the two passwords without showing them, checks them against the keystore, and writes a
# git-ignored file readable only by you. Run it in your own terminal:
#   bash ~/Workspace/FootballPuzzlers/mobile/scripts/android-credentials.sh
set -euo pipefail
KS="$HOME/Workspace/.config/store-keys/footballwhoami/FootballWhoAmI-release-key.keystore"
OUT="$(cd "$(dirname "$0")/.." && pwd)/credentials.json"
export PATH=/usr/lib/jvm/java-17-openjdk/bin:$PATH
for try in 1 2 3; do
  read -rsp "Keystore password: " STOREPASS; echo
  export STOREPASS
  if keytool -list -keystore "$KS" -storepass:env STOREPASS -alias footballwhoamikey >/dev/null 2>&1; then
    echo "Keystore password works."; break
  fi
  echo "Not that one (keytool: wrong password). ${try}/3"
  [ "$try" = 3 ] && { echo "Nothing written."; exit 1; }
done
read -rsp "Key password (press Enter if it's the same): " KEYPASS; echo
KEYPASS=${KEYPASS:-$STOREPASS}
export KEYPASS
# The key password is checked by exporting nothing: keytool -keypasswd round-trip would change it, so
# instead try a throwaway self-sign that needs the private key.
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
if ! keytool -certreq -keystore "$KS" -storepass:env STOREPASS -alias footballwhoamikey -keypass:env KEYPASS -file "$TMP/req" >/dev/null 2>&1; then
  echo "The key password didn't unlock the key. Nothing written."; exit 1
fi
umask 077
python3 - "$KS" "$OUT" <<'PY'
import json, os, sys
ks, out = sys.argv[1:]
json.dump({'android': {'keystore': {'keystorePath': ks, 'keystorePassword': os.environ['STOREPASS'],
           'keyAlias': 'footballwhoamikey', 'keyPassword': os.environ['KEYPASS']}}}, open(out, 'w'), indent=2)
PY
echo "Done. Wrote $OUT (git-ignored, only you can read it)."
