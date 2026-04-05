#!/usr/bin/env node
/**
 * Markdown to HTML converter for blog posts and pages.
 * Usage:
 *   node convert.mjs content/post.md          # Convert single post
 *   node convert.mjs --all                    # Convert all posts + pages
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const CONTENT_DIR = 'content';
const POSTS_DIR = 'posts';
const WORDS_PER_MINUTE = 250;
const SITE_URL = 'https://jinwoojeo.ng';

marked.setOptions({ breaks: false, gfm: true });

function getReadingTime(content) {
  const clean = content.replace(/<\/?[^>]+(>|$)/g, '');
  const words = clean.split(/\s/g).length;
  return Math.ceil(words / WORDS_PER_MINUTE);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Footnotes ─────────────────────────────────────

function processFootnotes(markdown) {
  const lines = markdown.split('\n');
  const cleanLines = [];
  const definitions = new Map();
  let currentId = null;
  let currentContent = [];

  for (const line of lines) {
    const defMatch = line.match(/^\[\^([^\]]+)\]:\s*(.*)/);
    if (defMatch) {
      if (currentId) definitions.set(currentId, currentContent.join('\n').trim());
      currentId = defMatch[1];
      currentContent = [defMatch[2]];
    } else if (currentId && (line.startsWith('    ') || line.startsWith('\t') || line.trim() === '')) {
      currentContent.push(line.replace(/^(    |\t)/, ''));
    } else {
      if (currentId) {
        definitions.set(currentId, currentContent.join('\n').trim());
        currentId = null;
        currentContent = [];
      }
      cleanLines.push(line);
    }
  }
  if (currentId) definitions.set(currentId, currentContent.join('\n').trim());

  if (definitions.size === 0) return { markdown, footnotesHtml: '' };

  const refOrder = [];
  let cleaned = cleanLines.join('\n');
  cleaned = cleaned.replace(/\[\^([^\]]+)\](?!:)/g, (_, id) => {
    if (!definitions.has(id)) return `[^${id}]`;
    let idx = refOrder.indexOf(id);
    if (idx === -1) { refOrder.push(id); idx = refOrder.length - 1; }
    return `<sup class="footnote-ref"><a href="#fn-${id}" id="fnref-${id}">${idx + 1}</a></sup>`;
  });

  const items = refOrder.map((id) => {
    const raw = definitions.get(id);
    let html = marked.parse(raw).trim();
    const backref = `\u00a0<a href="#fnref-${id}" class="footnote-backref" title="Back to text">↩</a>`;
    html = html.replace(/<\/p>\s*$/, `${backref}</p>`) || html + backref;
    return `<li id="fn-${id}">${html}</li>`;
  });

  const footnotesHtml = `\n<section class="footnotes">\n<hr>\n<ol>\n${items.join('\n')}\n</ol>\n</section>`;
  return { markdown: cleaned, footnotesHtml };
}

// ── Shared HTML shell ──────────────────────────────

function renderPage({ title, description = '', url, content, extraHead = '', extraBody = '' }) {
  const titleEscaped = escapeHtml(title);
  const descEscaped = escapeHtml(description);
  const fullUrl = `${SITE_URL}${url}`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="icon" type="image/x-icon" href="/cat.ico">
  <link rel="canonical" href="${fullUrl}">
  <title>${titleEscaped}</title>
  <meta name="title" content="${titleEscaped}">
  <meta name="description" content="${descEscaped}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${fullUrl}">
  <meta property="og:title" content="${titleEscaped}">
  <meta property="og:description" content="${descEscaped}">
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${fullUrl}">
  <meta property="twitter:title" content="${titleEscaped}">
  <meta property="twitter:description" content="${descEscaped}">
  <link rel="stylesheet" href="/css/style.css">
${extraHead}  <script type="module" src="/js/components.js"></script>
  <script>
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const set = (dark) => document.documentElement.classList.toggle('dark', dark);
    mq.addEventListener('change', (e) => set(e.matches));
    set(mq.matches);
  </script>
</head>
<body>
  <site-layout>
${content}
  </site-layout>
${extraBody}</body>
</html>`;
}

// ── Post conversion ────────────────────────────────

function convertPost(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(raw);
  const slug = basename(filePath, '.md');

  const readingTime = getReadingTime(content);
  const dateFormatted = formatDate(frontmatter.pubDate);
  const title = frontmatter.title;
  const description = frontmatter.description || '';
  const heroImage = frontmatter.heroImage || null;

  const { markdown: processedContent, footnotesHtml } = processFootnotes(content);
  const htmlContent = marked.parse(processedContent) + footnotesHtml;

  const extraHeadParts = [];
  if (heroImage) {
    extraHeadParts.push(`  <meta property="og:image" content="/images/${heroImage}">`);
    extraHeadParts.push(`  <meta property="twitter:image" content="${SITE_URL}/images/${heroImage}">`);
  }
  extraHeadParts.push(`  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github-dark.min.css">`);

  const html = renderPage({
    title,
    description,
    url: `/posts/${slug}/`,
    extraHead: extraHeadParts.join('\n') + '\n',
    content: `    <h1 class="post-title">${escapeHtml(title)}</h1>
    <div class="post-meta">
      <time>${dateFormatted}</time><span> / ${readingTime}분</span>
    </div>
    <div class="post-spacer"></div>
    <div class="prose">
      ${htmlContent}
    </div>

    <div id="comment-container">
      <script
        src="https://giscus.app/client.js"
        data-repo="jwoo0122/jinwoojeo.ng"
        data-repo-id="MDEwOlJlcG9zaXRvcnkyMjg2MDUwNDM="
        data-category="Announcements"
        data-category-id="DIC_kwDODaA8c84C2d2j"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="en"
        data-loading="lazy"
        crossorigin="anonymous"
        async></script>
    </div>`,
    extraBody: `  <script type="module">
    import hljs from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/es/highlight.min.js';
    hljs.highlightAll();
  </script>
`,
  });

  const outDir = join(POSTS_DIR, slug);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html);

  return { slug, title, description, dateFormatted, readingTime, pubDate: frontmatter.pubDate };
}

// ── Page conversion (e.g. index.md → index.html) ──

function convertPage(filePath, outputPath) {
  const raw = readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(raw);

  const { markdown: processedContent, footnotesHtml } = processFootnotes(content);
  const htmlContent = marked.parse(processedContent) + footnotesHtml;
  const title = frontmatter.title || 'Jinwoo Jeong';
  const description = frontmatter.description || '';
  const url = frontmatter.url || '/';

  const html = renderPage({
    title,
    description,
    url,
    content: `    <div class="prose">\n      ${htmlContent}\n    </div>`,
  });

  writeFileSync(outputPath, html);
}

// ── Posts listing (auto-generated from metadata) ───

function generatePostsIndex(posts) {
  const sorted = [...posts].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  const listItems = sorted.map(p => `      <a href="/posts/${p.slug}">
        <li class="post-item">
          <span>
            <span class="post-item-title">${escapeHtml(p.title)}</span>
            <span class="post-item-meta">${p.dateFormatted} / ${p.readingTime}분</span>
          </span>
          <div class="post-item-desc">${escapeHtml(p.description)}</div>
        </li>
      </a>`).join('\n');

  const html = renderPage({
    title: 'Jinwoo Jeong',
    description: '',
    url: '/posts/',
    content: `    <ul class="post-list">\n${listItems}\n    </ul>`,
  });

  if (!existsSync(POSTS_DIR)) mkdirSync(POSTS_DIR, { recursive: true });
  writeFileSync(join(POSTS_DIR, 'index.html'), html);
}

// ── CLI ────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes('--all')) {
  // Convert all posts
  const postFiles = readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.md') && f !== 'index.md')
    .map(f => join(CONTENT_DIR, f));
  const posts = postFiles.map(f => convertPost(f));
  posts
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .forEach(p => console.log(`  ✓ posts/${p.slug}`));

  // Generate posts listing
  generatePostsIndex(posts);
  console.log('  ✓ posts/index.html');

  // Convert pages
  const indexPath = join(CONTENT_DIR, 'index.md');
  if (existsSync(indexPath)) {
    convertPage(indexPath, 'index.html');
    console.log('  ✓ index.html');
  }

  console.log(`\n${posts.length} posts + pages converted.`);
} else if (args.length > 0) {
  const post = convertPost(args[0]);
  console.log(`✓ ${post.slug} (${post.dateFormatted}, ${post.readingTime}min)`);
  console.log('Run --all to update posts/index.html.');
} else {
  console.log('Usage:');
  console.log('  node convert.mjs content/post.md    # Convert single post');
  console.log('  node convert.mjs --all              # Convert all posts + pages');
}
