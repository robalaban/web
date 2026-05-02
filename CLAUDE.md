# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog/portfolio site for robertbalaban.com built with Astro 5, Tailwind CSS v4, and TypeScript.

## Commands

```bash
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm preview    # Preview production build
astro check     # TypeScript diagnostics
```

No test framework or linter is configured.

## Development Environment

Uses Nix flakes for reproducible dev environment (Node.js 22 + pnpm). Enter with `nix develop` from the repo root (`/Users/robert/code/web`). The Astro project root is the `src/` subdirectory.

## Architecture

**Astro static site** with file-based routing, Markdown blog posts, and no client-side JavaScript.

- `src/pages/` — File-based routes. Blog posts are Markdown files in `src/pages/posts/` with YAML frontmatter (`layout`, `title`, `description`, `publishDate`, `topic?`, `status?`).
- `src/layouts/` — `Layout.astro` is the base layout; `BlogPost.astro` extends it for post pages.
- `src/components/` — Shared Astro components (`Header`, `Footer`).
- `src/data/current.ts` — Centralized "currently reading/learning" data imported by homepage and about page.
- `src/utils/posts.ts` — Post collection helper using `import.meta.glob` to load and sort Markdown posts.
- `src/styles/global.css` — Tailwind v4 theme definition (custom color scales, font families, spacing tokens) and `.prose` typography styles.

**Styling**: Tailwind CSS v4 via Vite plugin. Three font families: Lora (body/sans), Sora (headings), Fira Code (mono). Grayscale primary palette with red secondary accent.

**Config files**: `astro.config.mjs`, `tailwind.config.mjs`, `tsconfig.json` (extends `astro/tsconfigs/strict`).
