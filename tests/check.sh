#!/usr/bin/env bash
# ==============================================================================
# CodeQuote Automated Test Suite
# Tests file existence, non-emptiness, HTML structure, JS functions, quotes count,
# syntax validation, and Kubernetes health probe endpoint.
# Returns 0 on success, 1 on failure.
# ==============================================================================

set -o pipefail

# ANSI color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo -e "${CYAN}${BOLD}======================================================${NC}"
echo -e "${CYAN}${BOLD}      CodeQuote Automated DevOps Test Suite          ${NC}"
echo -e "${CYAN}${BOLD}======================================================${NC}"

# Helper function for reporting test outcome
report_result() {
  local test_name="$1"
  local status="$2"
  local message="$3"
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  if [ "$status" -eq 0 ]; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo -e " [${GREEN}${BOLD}PASS${NC}] ${test_name} - ${message}"
  else
    FAILED_TESTS=$((FAILED_TESTS + 1))
    echo -e " [${RED}${BOLD}FAIL${NC}] ${test_name} - ${message}"
  fi
}

# ------------------------------------------------------------------------------
# Test 1: Verify all required app files exist and are non-empty
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}Phase 1: File Presence & Non-Empty Checks${NC}"
for file in "app/index.html" "app/style.css" "app/script.js" "app/health.html"; do
  if [ -f "$file" ] && [ -s "$file" ]; then
    size=$(wc -c < "$file" | tr -d ' ')
    report_result "File: $file" 0 "File exists and is non-empty (${size} bytes)"
  else
    report_result "File: $file" 1 "File missing or empty"
  fi
done

# ------------------------------------------------------------------------------
# Test 2: HTML Page Title Verification
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}Phase 2: HTML Semantic Verification${NC}"
if grep -q -i "<title>.*CodeQuote.*</title>" app/index.html; then
  title_found=$(grep -o -i "<title>[^<]*</title>" app/index.html)
  report_result "HTML Title" 0 "Found valid title: $title_found"
else
  report_result "HTML Title" 1 "Page title tag missing or does not mention CodeQuote"
fi

# ------------------------------------------------------------------------------
# Test 3: CSS and JS Asset Link Verification in app/index.html
# ------------------------------------------------------------------------------
if grep -q 'href="style.css"' app/index.html; then
  report_result "CSS Link" 0 "Found stylesheet link to style.css"
else
  report_result "CSS Link" 1 "Missing or incorrect link to style.css in app/index.html"
fi

if grep -q 'src="script.js"' app/index.html; then
  report_result "JS Script Tag" 0 "Found script tag referencing script.js"
else
  report_result "JS Script Tag" 1 "Missing or incorrect script tag for script.js in app/index.html"
fi

# ------------------------------------------------------------------------------
# Test 4: Key JavaScript Functions Verification in app/script.js
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}Phase 3: JavaScript Core Logic Verification${NC}"
for fn_name in "getRandomQuote" "getDailyQuote" "copyToClipboard"; do
  if grep -q -E "function[[:space:]]+${fn_name}|const[[:space:]]+${fn_name}" app/script.js; then
    report_result "Function: $fn_name" 0 "Core function definition found"
  else
    report_result "Function: $fn_name" 1 "Required function definition missing in app/script.js"
  fi
done

# Check additional required identifiers
for identifier in "quotes" "localStorage" "navigator.share"; do
  if grep -q "$identifier" app/script.js; then
    report_result "Identifier: $identifier" 0 "Required identifier/API used"
  else
    report_result "Identifier: $identifier" 1 "Required identifier $identifier not found in app/script.js"
  fi
done

# ------------------------------------------------------------------------------
# Test 5: Verify At Least 20 Quotes in app/script.js
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}Phase 4: Quote Repository Size Verification${NC}"
# Each quote is on its own line starting with { id: X, ...
quote_lines=$(grep -c -E "^[[:space:]]*\{[[:space:]]*id:[[:space:]]*[0-9]+" app/script.js || true)
if [ "$quote_lines" -ge 20 ]; then
  report_result "Quote Count" 0 "Found $quote_lines quotes (minimum requirement: 20)"
else
  report_result "Quote Count" 1 "Found only $quote_lines quotes; at least 20 are required"
fi

# ------------------------------------------------------------------------------
# Test 6: JavaScript Syntax Check (using Node.js if available)
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}Phase 5: Syntax Validation${NC}"
if command -v node >/dev/null 2>&1; then
  if node -c app/script.js >/dev/null 2>&1; then
    report_result "JS Syntax (Node -c)" 0 "Syntax is 100% valid with no syntax errors"
  else
    report_result "JS Syntax (Node -c)" 1 "Syntax error detected in app/script.js"
  fi
else
  echo -e " [${YELLOW}SKIP${NC}] Node.js not detected in runtime path, skipping node -c check"
fi

# ------------------------------------------------------------------------------
# Test 7: Kubernetes Health Probe Verification (health.html contains "OK")
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}Phase 6: Kubernetes Health Probe Verification${NC}"
if grep -q "OK" app/health.html; then
  report_result "Health Probe (health.html)" 0 "Contains 'OK' for liveness/readiness probes"
else
  report_result "Health Probe (health.html)" 1 "app/health.html does NOT contain 'OK'"
fi

# ------------------------------------------------------------------------------
# Summary and Exit Code
# ------------------------------------------------------------------------------
echo -e "\n${CYAN}${BOLD}======================================================${NC}"
echo -e "${BOLD}Test Summary: ${PASSED_TESTS}/${TOTAL_TESTS} tests passed (${FAILED_TESTS} failures)${NC}"
echo -e "${CYAN}${BOLD}======================================================${NC}"

if [ "$FAILED_TESTS" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}ALL TESTS PASSED! Pipeline can proceed to Docker build.${NC}\n"
  exit 0
else
  echo -e "${RED}${BOLD}TESTS FAILED! Stopping pipeline. Fix the errors above.${NC}\n"
  exit 1
fi
