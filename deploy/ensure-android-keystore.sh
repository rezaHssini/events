#!/usr/bin/env bash
# Create a release keystore + keystore.properties for signed APK builds.
# Reuses the same files on later runs so installs can update in place.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="${ANDROID_DIR:-${ROOT}/apps/mobile/android}"
KEYSTORE_FILE="${ANDROID_DIR}/event-release.keystore"
PROPS_FILE="${ANDROID_DIR}/keystore.properties"

STORE_PASS="${ANDROID_KEYSTORE_PASSWORD:-event-release-store}"
KEY_ALIAS="${ANDROID_KEY_ALIAS:-event-release}"
KEY_PASS="${ANDROID_KEY_PASSWORD:-event-release-key}"

if [ ! -f "${KEYSTORE_FILE}" ]; then
  echo "==> Creating Android release keystore..."
  keytool -genkeypair -v \
    -keystore "${KEYSTORE_FILE}" \
    -alias "${KEY_ALIAS}" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storetype PKCS12 \
    -storepass "${STORE_PASS}" \
    -keypass "${KEY_PASS}" \
    -dname "CN=Event, OU=Mobile, O=Event Platform, L=Los Angeles, ST=California, C=US"
fi

cat > "${PROPS_FILE}" <<EOF
storeFile=event-release.keystore
storePassword=${STORE_PASS}
keyAlias=${KEY_ALIAS}
keyPassword=${KEY_PASS}
EOF

echo "==> Android signing ready: ${KEYSTORE_FILE}"
