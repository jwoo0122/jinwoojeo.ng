# AGENTS

## Repo Notes

- This repo is a root-output static site. Generated files are written to `index.html`, `posts/`, `fonts/subset/`, and a content-hashed `css/generated-fonts.<hash>.css` (the 10-character hex hash changes whenever the CSS body changes).
- Development entrypoints commonly used in this repo are `pnpm run build`, `node build.mjs`, `node convert.mjs --all`, `node dev.mjs`, and `npx wrangler`.
- There is no active Vercel-specific setup in the local Claude config. Cloudflare Pages is the deployment target.

## Build

```bash
pnpm install --frozen-lockfile
pnpm run build
```

`pnpm run build` does all of the following in one pass:

- converts Markdown into static HTML
- extracts the text that actually appears in generated pages
- subsets `BareunBatang` fonts from that text set
- writes hashed subset font files into `fonts/subset/`
- regenerates a content-hashed `css/generated-fonts.<hash>.css` file and rewrites HTML `<link>` tags to point at it

## Cloudflare Pages

Use these project settings:

- Build command: `pnpm run build`
- Build output directory: `.`
- Root directory: repo root

The build output directory is `.` because this project emits `index.html`, `posts/`, `css/`, `js/`, `functions/`, and other static assets at the repository root.
