#!/usr/bin/env node
/**
 * Markdown to HTML converter for blog posts.
 * Usage:
 *   node convert.mjs content/post.md          # Convert single post
 *   node convert.mjs --all                    # Convert all posts in content/
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const CONTENT_DIR = 'content';
const POSTS_DIR = 'posts';
const WORDS_PER_MINUTE = 250;
const SITE_URL = 'https://jinwoojeo.ng';

function getReadingTime(content) {
  const clean = content.replace(/<\/?[^>]+(>|$)/g, '');
  const words = clean.split(/\s/g).length;
  return Math.ceil(words / WORDS_PER_MINUTE);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function convertPost(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(raw);
  const slug = basename(filePath, '.md');

  const readingTime = getReadingTime(content);
  const dateFormatted = formatDate(frontmatter.pubDate);
  const title = frontmatter.title;
  const description = frontmatter.description || '';
  const heroImage = frontmatter.heroImage || null;
  const titleEscaped = escapeHtml(title);
  const descEscaped = escapeHtml(description);

  // Configure marked to pass through HTML (default behavior)
  marked.setOptions({
    breaks: false,
    gfm: true,
  });

  const htmlContent = marked.parse(content);

  const ogImageTag = heroImage
    ? `<meta property="og:image" content="/images/${heroImage}">`
    : '';
  const twitterImageTag = heroImage
    ? `<meta property="twitter:image" content="${SITE_URL}/images/${heroImage}">`
    : '';

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="icon" type="image/x-icon" href="/cat.ico">
  <link rel="canonical" href="${SITE_URL}/posts/${slug}/">
  <title>${titleEscaped}</title>
  <meta name="title" content="${titleEscaped}">
  <meta name="description" content="${descEscaped}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE_URL}/posts/${slug}/">
  <meta property="og:title" content="${titleEscaped}">
  <meta property="og:description" content="${descEscaped}">
  ${ogImageTag}
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${SITE_URL}/posts/${slug}/">
  <meta property="twitter:title" content="${titleEscaped}">
  <meta property="twitter:description" content="${descEscaped}">
  ${twitterImageTag}
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github-dark.min.css">
  <script>
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const set = (dark) => document.documentElement.classList.toggle('dark', dark);
    mq.addEventListener('change', (e) => set(e.matches));
    set(mq.matches);
  </script>
</head>
<body>
  <main class="container">
    <div class="header">
      <span class="site-title">Jinwoo Jeong</span>
      <a class="nav-link" href="/">About</a>
      <a class="nav-link" href="/posts">Posts</a>
      <a class="nav-link" href="https://github.com/jwoo0122" target="_blank">GitHub</a>
    </div>

    <h1 class="post-title">${titleEscaped}</h1>
    <div class="post-meta">
      <time>${dateFormatted}</time><span> / ${readingTime}min</span>
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
    </div>

    <footer class="footer">
      &copy; <span id="year"></span> Jinwoo Jeong. All rights reserved.
      <script>document.getElementById('year').textContent=new Date().getFullYear()</script>
    </footer>
  </main>
  <script type="module" src="/js/components.js"></script>
  <script type="module">
    import hljs from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/es/highlight.min.js';
    hljs.highlightAll();
  </script>
</body>
</html>`;

  const outDir = join(POSTS_DIR, slug);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html);

  return { slug, title, description, dateFormatted, readingTime, pubDate: frontmatter.pubDate };
}

// Parse args
const args = process.argv.slice(2);

if (args.includes('--all')) {
  const files = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md')).map(f => join(CONTENT_DIR, f));
  const posts = files.map(f => convertPost(f));
  posts.forEach(p => console.log(`✓ ${p.slug} (${p.dateFormatted}, ${p.readingTime}min)`));
  console.log(`\nConverted ${posts.length} posts.`);
  console.log('Remember to update posts/index.html and rss.xml if needed.');
} else if (args.length > 0) {
  const post = convertPost(args[0]);
  console.log(`✓ ${post.slug} (${post.dateFormatted}, ${post.readingTime}min)`);
  console.log('Remember to update posts/index.html and rss.xml.');
} else {
  console.log('Usage:');
  console.log('  node convert.mjs content/post.md    # Convert single post');
  console.log('  node convert.mjs --all              # Convert all posts');
}
