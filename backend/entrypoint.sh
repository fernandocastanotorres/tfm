#!/bin/sh
set -e

STORAGE_DIR="${STORAGE_DOCUMENTS_PATH:-/app/data/documents}"
mkdir -p "$STORAGE_DIR"
chown appuser:appgroup "$STORAGE_DIR"

exec gosu appuser tini -- "$@"
