#!/bin/bash
# Certbot certificate generation script
# Run this once per domain to generate initial certificates

set -e

CERT_DIR="./infrastructure/nginx/certs"
WWW_DIR="./infrastructure/nginx/www"

create_dir() {
    local domain="$1"
    mkdir -p "${CERT_DIR}/live/${domain}"
    mkdir -p "${WWW_DIR}"
}

generate_cert() {
    local domain="$1"
    create_dir "$domain"

    docker run --rm \
        -v "${WWW_DIR}:/var/www/letsencrypt" \
        -v "${CERT_DIR}:/etc/letsencrypt" \
        certbot/certbot certonly \
        --webroot \
        --webroot-path /var/www/letsencrypt \
        --domain "$domain" \
        --email "admin@nbpdev.com" \
        --agree-tos \
        --non-interactive \
        --expand \
        --keep-until-expiring
}

case "${1:-}" in
    sede|Sede)
        generate_cert "sede.nbpdev.com"
        ;;
    tramitador|Tramitador)
        generate_cert "tramitador.nbpdev.com"
        ;;
    api|Api)
        generate_cert "api.nbpdev.com"
        ;;
    grafana|Grafana)
        generate_cert "grafana.nbpdev.com"
        ;;
    prometheus|Prometheus)
        generate_cert "prometheus.nbpdev.com"
        ;;
    loki|Loki)
        generate_cert "loki.nbpdev.com"
        ;;
    mail|Mail)
        generate_cert "mail.nbpdev.com"
        ;;
    all|All)
        for domain in \
            "sede.nbpdev.com" \
            "tramitador.nbpdev.com" \
            "api.nbpdev.com" \
            "grafana.nbpdev.com" \
            "prometheus.nbpdev.com" \
            "loki.nbpdev.com" \
            "mail.nbpdev.com"
        do
            generate_cert "$domain"
        done
        ;;
    renew)
        docker run --rm \
            -v "${CERT_DIR}:/etc/letsencrypt" \
            certbot/certbot renew \
            --webroot \
            --webroot-path /var/www/letsencrypt \
            --post-hook "docker exec tfm-nginx nginx -s reload"
        ;;
    *)
        echo "Usage: $0 {sede|tramitador|api|grafana|prometheus|loki|mail|all|renew}"
        echo "  sede, tramitador, api, grafana, prometheus, loki, mail"
        echo "       Generate certificate for specific domain"
        echo "  all   Generate certificates for all domains"
        echo "  renew Renew all existing certificates"
        exit 1
        ;;
esac
