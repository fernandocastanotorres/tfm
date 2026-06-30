#!/bin/bash
# Certbot certificate generation script — Let's Encrypt for non-Arsys domains
# sede and tramitador use Arsys Sectigo certificates (not managed here)

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
        --email "admin@nbpdev.es" \
        --agree-tos \
        --non-interactive \
        --expand \
        --keep-until-expiring
}

case "${1:-}" in
    api|Api)
        generate_cert "api.nbpdev.es"
        ;;
    grafana|Grafana)
        generate_cert "grafana.nbpdev.es"
        ;;
    prometheus|Prometheus)
        generate_cert "prometheus.nbpdev.es"
        ;;
    loki|Loki)
        generate_cert "loki.nbpdev.es"
        ;;
    mail|Mail)
        generate_cert "mail.nbpdev.es"
        ;;
    all|All)
        for domain in \
            "api.nbpdev.es" \
            "grafana.nbpdev.es" \
            "prometheus.nbpdev.es" \
            "loki.nbpdev.es" \
            "mail.nbpdev.es"
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
        echo "Usage: $0 {api|grafana|prometheus|loki|mail|all|renew}"
        echo "  api, grafana, prometheus, loki, mail"
        echo "       Generate Let's Encrypt certificate for specific domain"
        echo "  all   Generate certificates for all domains"
        echo "  renew Renew all existing certificates"
        echo ""
        echo "  Note: sede and tramitador use Arsys Sectigo certs (not managed here)"
        exit 1
        ;;
esac
