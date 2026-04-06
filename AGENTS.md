# AGENTS

## Repo Notes

- This repo is a root-output static site. Generated files are written to `index.html`, `posts/`, `fonts/subset/`, and `css/generated-fonts.css`.
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
- regenerates `css/generated-fonts.css` to point at the new subset files

## Cloudflare Pages

Use these project settings:

- Build command: `pnpm run build`
- Build output directory: `.`
- Root directory: repo root

The build output directory is `.` because this project emits `index.html`, `posts/`, `css/`, `js/`, `functions/`, and other static assets at the repository root.
