#!/bin/bash
# Extract Arsys Sectigo PEM certificates from PKCS#12 files
# Requires: .p12 files in certs/ directory, CERT_PASSWORD env var set
# Run before starting nginx to ensure PEMs are available

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CERT_DIR="${SCRIPT_DIR}"
CERTS_SRC="${SCRIPT_DIR}/../../certs"
LIVE_DIR="${CERT_DIR}/certs/live"
PASS="${CERT_PASSWORD:-}"

if [ -z "$PASS" ]; then
    echo "ERROR: CERT_PASSWORD environment variable is not set"
    exit 1
fi

extract_domain() {
    local domain="$1"
    local ssl_id="$2"
    local ssl_file="${CERTS_SRC}/${ssl_id}.p12"
    local live="${LIVE_DIR}/${domain}"

    if [ ! -f "$ssl_file" ]; then
        echo "WARN: ${ssl_file} not found, skipping ${domain}"
        return 0
    fi

    mkdir -p "$live"

    echo "Extracting ${domain} (${ssl_id})..."

    openssl pkcs12 -in "$ssl_file" -passin "pass:${PASS}" \
        -nokeys -clcerts -legacy 2>/dev/null | \
        openssl x509 -out "${live}/fullchain.pem"

    openssl pkcs12 -in "$ssl_file" -passin "pass:${PASS}" \
        -nocerts -nodes -legacy 2>/dev/null | \
        openssl pkey -out "${live}/privkey.pem"

    chmod 644 "${live}/fullchain.pem" "${live}/chain.pem" 2>/dev/null || true
    chmod 600 "${live}/privkey.pem"

    # Download Sectigo intermediate CA chain (cached after first run)
    if [ ! -f "${live}/chain.pem" ]; then
        curl -sL "http://crt.sectigo.com/SectigoPublicServerAuthenticationCADVR36.crt" \
            -o "${live}/chain.pem"
    fi

    echo "  ${domain} done ($(openssl x509 -in "${live}/fullchain.pem" -noout -dates 2>/dev/null | grep notAfter | cut -d= -f2))"
}

echo "Extracting Arsys Sectigo certificates..."
echo ""

extract_domain "sede.nbpdev.es"       "SSL2121914"
extract_domain "tramitador.nbpdev.es" "SSL2121963"
extract_domain "api.nbpdev.es"        "SSL2125591"
extract_domain "loki.nbpdev.es"       "SSL2125568"
extract_domain "prometheus.nbpdev.es" "SSL2125570"
extract_domain "mail.nbpdev.es"       "SSL2125557"

echo ""
echo "All certificates extracted."
