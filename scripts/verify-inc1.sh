#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

sha256_file() {
  local file="$1"
  shasum -a 256 "$file" | awk '{print $1}'
}

count_attr_matches() {
  local file="$1"
  local needle="$2"
  grep -oF "$needle" "$file" | wc -l | tr -d ' '
}

assert_bare_pattern_is_safe() {
  local sample='href="/css/generated-fonts.0123456789.css"'
  if printf '%s\n' "$sample" | grep -Eq '(^|[^[:alnum:]_])/css/generated-fonts\.css([^[:alnum:]_]|$)'; then
    fail "negative-case guard failed: bare CSS pattern matched a hashed href sample"
  fi
}

discover_html_files() {
  local files=()
  if [[ -f index.html ]]; then
    files+=("index.html")
  fi

  while IFS= read -r file; do
    files+=("${file#./}")
  done < <(find . -name '*.html' -path './posts/*' -type f 2>/dev/null | sort)

  if [[ ${#files[@]} -eq 0 ]]; then
    fail "no generated HTML files found to verify"
  fi

  printf '%s\n' "${files[@]}"
}

assert_single_hashed_css_file() {
  css_files=()
  while IFS= read -r line; do
    css_files+=("$line")
  done < <(find css -maxdepth 1 -type f -name 'generated-fonts.[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f].css' | sort)

  if [[ ${#css_files[@]} -ne 1 ]]; then
    fail "expected exactly one hashed generated CSS file, found ${#css_files[@]}: ${css_files[*]:-<none>}"
  fi

  HASHED_CSS_FILE="${css_files[0]}"
  HASHED_CSS_BASENAME="$(basename "$HASHED_CSS_FILE")"
  HASH_VALUE="${HASHED_CSS_BASENAME#generated-fonts.}"
  HASH_VALUE="${HASH_VALUE%.css}"
}

assert_first_build_state() {
  assert_single_hashed_css_file

  [[ -f css/style.css ]] || fail "expected css/style.css to be preserved"
  [[ ! -e css/generated-fonts.css ]] || fail "unexpected bare css/generated-fonts.css exists"
}

assert_html_references() {
  local html_file
  local expected_href="href=\"/css/${HASHED_CSS_BASENAME}\""
  local bare_pattern='(^|[^[:alnum:]_])/css/generated-fonts\.css([^[:alnum:]_]|$)'

  while IFS= read -r html_file; do
    local attr_count
    local bare_count

    attr_count="$(count_attr_matches "$html_file" "$expected_href")"
    if [[ "$attr_count" -ne 1 ]]; then
      fail "expected exactly one hashed stylesheet href in ${html_file}, found ${attr_count}"
    fi

    bare_count="$(grep -E -c "$bare_pattern" "$html_file" || true)"
    if [[ "$bare_count" -ne 0 ]]; then
      fail "unexpected bare /css/generated-fonts.css reference in ${html_file}"
    fi
  done < <(discover_html_files)
}

assert_second_build_state() {
  local expected_file="$1"
  local expected_css_sha="$2"
  local expected_index_sha="$3"
  local injected_stale_file="$4"

  assert_single_hashed_css_file

  [[ "$HASHED_CSS_FILE" == "$expected_file" ]] || fail "CSS filename changed across builds: expected ${expected_file}, got ${HASHED_CSS_FILE}"
  [[ ! -e "$injected_stale_file" ]] || fail "stale generated CSS file was not swept: ${injected_stale_file}"
  [[ ! -e css/generated-fonts.css ]] || fail "unexpected bare css/generated-fonts.css exists after second build"
  [[ -f css/style.css ]] || fail "css/style.css missing after second build"

  local actual_css_sha
  local actual_index_sha
  actual_css_sha="$(sha256_file "$HASHED_CSS_FILE")"
  actual_index_sha="$(sha256_file index.html)"

  [[ "$actual_css_sha" == "$expected_css_sha" ]] || fail "CSS content changed across builds: expected ${expected_css_sha}, got ${actual_css_sha}"
  [[ "$actual_index_sha" == "$expected_index_sha" ]] || fail "index.html content changed across builds: expected ${expected_index_sha}, got ${actual_index_sha}"
}

cd "$(dirname "$0")/.."

rm -rf posts fonts/subset
find css -maxdepth 1 -type f -name 'generated-fonts*.css' -delete

assert_bare_pattern_is_safe

pnpm run build

assert_first_build_state
assert_html_references

FIRST_CSS_FILE="$HASHED_CSS_FILE"
FIRST_CSS_SHA="$(sha256_file "$HASHED_CSS_FILE")"
FIRST_INDEX_SHA="$(sha256_file index.html)"

STALE_CSS_FILE="css/generated-fonts.0000000000.css"
printf '/* stale */\n' > "$STALE_CSS_FILE"
[[ -f "$STALE_CSS_FILE" ]] || fail "failed to create stale CSS probe file"

pnpm run build

assert_second_build_state "$FIRST_CSS_FILE" "$FIRST_CSS_SHA" "$FIRST_INDEX_SHA" "$STALE_CSS_FILE"
assert_html_references

echo "ALL GATES PASSED"
