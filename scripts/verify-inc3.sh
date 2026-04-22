#!/usr/bin/env bash
# Verification for INC-3: AGENTS.md hashed-CSS artifact contract
# Bash 3.2 compatible. Uses only grep.

AGENTS=/Users/jinwoo/repos/jinwoojeo.ng/AGENTS.md
PASS=0

# Assertion 1: bare `css/generated-fonts.css` must not appear
COUNT=$(grep -cF '`css/generated-fonts.css`' "$AGENTS" || true)
if [ "$COUNT" -ne 0 ]; then
  printf 'FAIL: expected 0 occurrences of `css/generated-fonts.css` in %s, found %s\n' "$AGENTS" "$COUNT"
  PASS=1
fi

# Assertion 2: css/generated-fonts.<hash>.css must appear at least twice
COUNT=$(grep -cF 'css/generated-fonts.<hash>.css' "$AGENTS" || true)
if [ "$COUNT" -lt 2 ]; then
  printf 'FAIL: expected >=2 occurrences of css/generated-fonts.<hash>.css in %s, found %s\n' "$AGENTS" "$COUNT"
  PASS=1
fi

# Assertion 3: content-hashed must appear at least once
COUNT=$(grep -c 'content-hashed' "$AGENTS" || true)
if [ "$COUNT" -lt 1 ]; then
  printf 'FAIL: expected >=1 occurrence of "content-hashed" in %s, found %s\n' "$AGENTS" "$COUNT"
  PASS=1
fi

if [ "$PASS" -eq 0 ]; then
  echo 'PASS'
fi
exit "$PASS"
