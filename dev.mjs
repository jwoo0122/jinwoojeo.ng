#!/usr/bin/env node
/**
 * Dev server: watches content/, css/, js/ for changes,
 * runs convert.mjs --all on change, and serves the site on :4321.
 */

import { watch } from 'fs';
import { execSync, spawn } from 'child_process';
import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';

const PORT = 4321;
const WATCH_DIRS = ['content', 'css', 'js'];
const DEBOUNCE_MS = 300;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.xsl': 'application/xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

// ── Convert ─────────────────────────────────────────

function convert() {
  const start = performance.now();
  try {
    execSync('node convert.mjs --all', { stdio: 'pipe' });
    const ms = (performance.now() - start).toFixed(0);
    console.log(`\x1b[32m✓\x1b[0m converted in ${ms}ms`);
  } catch (e) {
    console.error(`\x1b[31m✗\x1b[0m convert failed:\n${e.stderr?.toString() || e.message}`);
  }
}

// ── Watch ───────────────────────────────────────────

let timer = null;

function scheduleConvert(filename) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    console.log(`\x1b[90m  changed: ${filename}\x1b[0m`);
    convert();
    timer = null;
  }, DEBOUNCE_MS);
}

for (const dir of WATCH_DIRS) {
  if (!existsSync(dir)) continue;
  watch(dir, { recursive: true }, (_event, filename) => {
    if (filename) scheduleConvert(`${dir}/${filename}`);
  });
}

// ── HTTP server ─────────────────────────────────────

const server = createServer((req, res) => {
  let url = req.url.split('?')[0];

  // Try: exact path, path/index.html, path.html
  const candidates = [
    join('.', url),
    join('.', url, 'index.html'),
  ];

  let filePath = null;
  for (const c of candidates) {
    if (existsSync(c) && statSync(c).isFile()) {
      filePath = c;
      break;
    }
  }

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404');
    return;
  }

  const ext = extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime });
  res.end(readFileSync(filePath));
});

// ── Start ───────────────────────────────────────────

convert();
server.listen(PORT, () => {
  console.log(`\n\x1b[1mdev server\x1b[0m http://localhost:${PORT}`);
  console.log(`\x1b[90mwatching: ${WATCH_DIRS.join(', ')}\x1b[0m\n`);
});
