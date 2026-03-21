# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

- `deploy:gh-pages` — builds the portfolio and pushes all dist files to `mjshuff23/mjshuff23.github.io` via GitHub API. Requires the GitHub integration to be connected. Run: `pnpm run build --filter @workspace/portfolio && pnpm --filter @workspace/scripts run deploy:gh-pages`

### `artifacts/portfolio` (`@workspace/portfolio`)

Michael Shuff's personal portfolio site. React + TypeScript + Vite. Single-page with smooth-scroll anchor sections.

- **Sections**: Hero, About, Skills, Projects (ESCO ecosystem), Experience, Contact
- **Design**: Dark-mode-first (electric teal on deep space blue), Chakra Petch display font, Manrope body font
- **Content source**: Michael Shuff's Google Docs resume + ESCO Figma FigJam boards
- **ESCO Figma boards**: 4 boards linked in the Projects section (Layered Architecture, Cross-Domain, System Architecture, SocraBot Fallacy Model)
- **Dependencies**: `framer-motion` (animations), `lucide-react` (icons), `wouter` (routing)
- **Theme**: `src/hooks/use-theme.ts` — persists to localStorage, defaults to dark
- **Dev**: `pnpm --filter @workspace/portfolio run dev` (port 21113)
- **Build**: `pnpm --filter @workspace/portfolio run build` → `dist/`
- **Deploy to GitHub Pages**: `pnpm --filter @workspace/scripts run deploy:gh-pages` (uses GitHub integration)

#### Google Docs Data Pipeline

Resume content is sourced live from Google Docs and compiled into a static JSON file:

1. **Google Doc**: `1B2KtRocWTPhkZwgTxw69VK_FLKXmvhOeXGxCmQ_V76Y` (Shuff_Michael_Resume_AI_Focus)
2. **Output**: `artifacts/portfolio/src/data/resume.json` — committed to the repo and bundled at build time
3. **Schema**: `lastSynced`, `personal`, `about.bio`, `about.stats`, `skills[]`, `experience[]`
4. **Data import**: `resume.ts` imports from `resume.json` (TypeScript `resolveJsonModule: true`) and re-exports typed constants (`PERSONAL`, `ABOUT`, `SKILLS`, `EXPERIENCE`). Static ESCO project data remains in `resume.ts`.
5. **Refresh**: Run `pnpm --filter @workspace/scripts run fetch:resume` to regenerate `resume.json` from Google Docs. Requires either `GOOGLE_DOCS_TOKEN` env var or the Google Docs Replit integration connected. The script uses the OAuth access token from the integration.
6. **Note on Google Docs format**: The resume uses `NORMAL_TEXT` for all paragraphs (including section headers). Section detection is done by keyword matching (e.g. "SUMMARY", "SKILLS", "RELEVANT EXPERIENCE") and bullet detection via the `bullet` property. Skills are pipe-delimited on a single line.
