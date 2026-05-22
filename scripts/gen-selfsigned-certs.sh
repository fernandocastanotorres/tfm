#!/usr/bin/env bash
set -euo pipefail

CERTS_DIR="${CERTS_DIR:-./certs}"
DAYS="${DAYS:-3650}"
RSA_BITS="${RSA_BITS:-2048}"
SUBJECT="${SUBJECT:-/CN=localhost/O=TFG/O=Self-Signed/OU=Development}"

mkdir -p "$CERTS_DIR"

openssl req -x509 -nodes -days "$DAYS" -newkey rsa:"$RSA_BITS" \
    -keyout "$CERTS_DIR/tfg-selfsigned.key" \
    -out "$CERTS_DIR/tfg-selfsigned.crt" \
    -subj "$SUBJECT"

chmod 644 "$CERTS_DIR/tfg-selfsigned.crt" "$CERTS_DIR/tfg-selfsigned.key"

echo "Self-signed certificates generated in $CERTS_DIR/"
echo "  crt: $CERTS_DIR/tfg-selfsigned.crt"
echo "  key: $CERTS_DIR/tfg-selfsigned.key"
