#!/usr/bin/env bash
# check-coverage.sh — Enforce minimum coverage thresholds
#
# Reads JaCoCo XML and LCOV reports from .artifacts/ and fails
# if thresholds are not met.
#
# Environment:
#   COVERAGE_ENFORCEMENT_MODE  "enforce" (fail) or "report" (warn only)
#
# Thresholds:
#   Backend (JaCoCo):  80% instructions, 60% branches
#   Frontend (LCOV):   80% statements
set -euo pipefail

MODE="${COVERAGE_ENFORCEMENT_MODE:-enforce}"
ARTIFACTS_DIR=".artifacts"
FAILURES=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }

# ──────────────────────────────────────────────
# Parse JaCoCo XML for a given file
# Returns: instruction_pct branch_pct
# ──────────────────────────────────────────────
parse_jacoco() {
  local file="$1"
  if [ ! -f "$file" ]; then
    echo "0 0"
    return
  fi

  local instr_missed instr_covered branch_missed branch_covered

  instr_missed=$(grep -oP 'counter type="INSTRUCTION" missed="\K[0-9]+' "$file" | paste -sd+ | bc 2>/dev/null || echo "0")
  instr_covered=$(grep -oP 'counter type="INSTRUCTION" covered="\K[0-9]+' "$file" | paste -sd+ | bc 2>/dev/null || echo "0")
  branch_missed=$(grep -oP 'counter type="BRANCH" missed="\K[0-9]+' "$file" | paste -sd+ | bc 2>/dev/null || echo "0")
  branch_covered=$(grep -oP 'counter type="BRANCH" covered="\K[0-9]+' "$file" | paste -sd+ | bc 2>/dev/null || echo "0")

  local instr_total=$((instr_missed + instr_covered))
  local branch_total=$((branch_missed + branch_covered))

  local instr_pct=0
  local branch_pct=0

  if [ "$instr_total" -gt 0 ]; then
    instr_pct=$(echo "scale=2; $instr_covered * 100 / $instr_total" | bc)
  fi
  if [ "$branch_total" -gt 0 ]; then
    branch_pct=$(echo "scale=2; $branch_covered * 100 / $branch_total" | bc)
  fi

  echo "$instr_pct $branch_pct"
}

# ──────────────────────────────────────────────
# Parse LCOV for a given file
# Returns: statement_pct
# ──────────────────────────────────────────────
parse_lcov() {
  local file="$1"
  if [ ! -f "$file" ]; then
    echo "0"
    return
  fi

  local covered total pct
  covered=$(grep '^DA:' "$file" | awk -F, '{sum += ($2 > 0)} END {print sum+0}')
  total=$(grep -c '^DA:' "$file" 2>/dev/null || echo "0")

  pct=0
  if [ "$total" -gt 0 ]; then
    pct=$(echo "scale=2; $covered * 100 / $total" | bc)
  fi

  echo "$pct"
}

# ──────────────────────────────────────────────
# Check a threshold: actual >= required
# ──────────────────────────────────────────────
check_threshold() {
  local name="$1"
  local actual="$2"
  local required="$3"

  local met
  met=$(echo "$actual >= $required" | bc)

  if [ "$met" -eq 1 ]; then
    log_info "$name: ${actual}% >= ${required}% PASS"
  else
    if [ "$MODE" = "enforce" ]; then
      log_error "$name: ${actual}% < ${required}% FAIL"
      FAILURES=$((FAILURES + 1))
    else
      log_warn "$name: ${actual}% < ${required}% (report mode, not failing)"
    fi
  fi
}

# ──────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────
echo "============================================"
echo " Coverage Gate Check"
echo " Mode: $MODE"
echo "============================================"
echo ""

# Backend coverage (JaCoCo)
echo "--- Backend (JaCoCo) ---"
BACKEND_JACOCO=$(find "$ARTIFACTS_DIR" -name "jacoco.xml" 2>/dev/null | head -1)
if [ -n "$BACKEND_JACOCO" ] && [ -f "$BACKEND_JACOCO" ]; then
  log_info "Found: $BACKEND_JACOCO"
  log_info "File size: $(wc -c < "$BACKEND_JACOCO") bytes"
  read -r instr_pct branch_pct <<< "$(parse_jacoco "$BACKEND_JACOCO")"
  check_threshold "Backend Instructions" "$instr_pct" "80.00"
  check_threshold "Backend Branches" "$branch_pct" "60.00"
else
  log_info "Searching in: $(pwd)/$ARTIFACTS_DIR"
  log_info "Available files: $(find "$ARTIFACTS_DIR" -type f 2>/dev/null | head -20 || echo 'none')"
  if [ "$MODE" = "enforce" ]; then
    log_error "No JaCoCo report found"
    FAILURES=$((FAILURES + 1))
  else
    log_warn "No JaCoCo report found (report mode)"
  fi
fi
echo ""

# Frontend coverage (LCOV)
echo "--- Frontend Citizen (LCOV) ---"
FRONTEND_LCOV=$(find "$ARTIFACTS_DIR" -name "lcov.info" -path "*/frontend/*" 2>/dev/null | head -1)
if [ -z "$FRONTEND_LCOV" ]; then
  FRONTEND_LCOV=$(find "$ARTIFACTS_DIR" -name "lcov.info" -path "*/front-end/*" 2>/dev/null | head -1)
fi
if [ -z "$FRONTEND_LCOV" ]; then
  FRONTEND_LCOV=$(find "$ARTIFACTS_DIR" -name "lcov.info" 2>/dev/null | head -1)
fi
if [ -n "$FRONTEND_LCOV" ] && [ -f "$FRONTEND_LCOV" ]; then
  log_info "Found: $FRONTEND_LCOV"
  log_info "File size: $(wc -c < "$FRONTEND_LCOV") bytes"
  stmt_pct=$(parse_lcov "$FRONTEND_LCOV")
  check_threshold "Frontend Statements" "$stmt_pct" "80.00"
else
  log_info "Searching in: $(pwd)/$ARTIFACTS_DIR"
  log_info "Available files: $(find "$ARTIFACTS_DIR" -type f 2>/dev/null | head -20 || echo 'none')"
  if [ "$MODE" = "enforce" ]; then
    log_error "No frontend LCOV report found"
    FAILURES=$((FAILURES + 1))
  else
    log_warn "No frontend LCOV report found (report mode)"
  fi
fi
echo ""

# Backoffice coverage (LCOV)
echo "--- Frontend Backoffice (LCOV) ---"
BACKOFFICE_LCOV=$(find "$ARTIFACTS_DIR" -name "lcov.info" -path "*/backoffice/*" 2>/dev/null | head -1)
if [ -z "$BACKOFFICE_LCOV" ]; then
  BACKOFFICE_LCOV=$(find "$ARTIFACTS_DIR" -name "lcov.info" -path "*/back-office/*" 2>/dev/null | head -1)
fi
if [ -z "$BACKOFFICE_LCOV" ]; then
  BACKOFFICE_LCOV=$(find "$ARTIFACTS_DIR" -name "lcov.info" 2>/dev/null | head -1)
fi
if [ -n "$BACKOFFICE_LCOV" ] && [ -f "$BACKOFFICE_LCOV" ]; then
  log_info "Found: $BACKOFFICE_LCOV"
  log_info "File size: $(wc -c < "$BACKOFFICE_LCOV") bytes"
  stmt_pct=$(parse_lcov "$BACKOFFICE_LCOV")
  check_threshold "Backoffice Statements" "$stmt_pct" "80.00"
else
  log_info "Searching in: $(pwd)/$ARTIFACTS_DIR"
  log_info "Available files: $(find "$ARTIFACTS_DIR" -type f 2>/dev/null | head -20 || echo 'none')"
  if [ "$MODE" = "enforce" ]; then
    log_error "No backoffice LCOV report found"
    FAILURES=$((FAILURES + 1))
  else
    log_warn "No backoffice LCOV report found (report mode)"
  fi
fi
echo ""

# ──────────────────────────────────────────────
# Summary
# ──────────────────────────────────────────────
echo "============================================"
if [ "$FAILURES" -gt 0 ]; then
  log_error "Coverage gates FAILED ($FAILURES threshold(s) not met)"
  exit 1
else
  log_info "All coverage gates PASSED"
  exit 0
fi
