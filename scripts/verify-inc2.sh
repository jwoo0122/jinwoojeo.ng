#!/bin/bash

set -u

ACTUAL="/Users/jinwoo/repos/jinwoojeo.ng/_headers"
TMP_EXPECTED="$(mktemp "${TMPDIR:-/tmp}/verify-inc2.XXXXXX")" || exit 1

cleanup() {
  rm -f "$TMP_EXPECTED"
}

trap cleanup EXIT HUP INT TERM

cat >"$TMP_EXPECTED" <<'EXPECTED'
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin

/css/style.css
  Cache-Control: public, no-cache

/css/generated-fonts.*.css
  Cache-Control: public, max-age=31536000, immutable

/js/*
  Cache-Control: public, no-cache

/images/*
  Cache-Control: public, max-age=31536000, immutable

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/*.ico
  Cache-Control: public, max-age=31536000, immutable
EXPECTED

if diff -u "$TMP_EXPECTED" "$ACTUAL"; then
  echo "PASS"
  exit 0
fi

echo "FAIL"
exit 1
