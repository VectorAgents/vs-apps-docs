# vs-apps-docs

Docusaurus site for `@vectoragents/vs-apps`.

```bash
pnpm install
pnpm start
pnpm build
pnpm test
```

- `pnpm install` needs a GitHub token with `read:packages` in `~/.npmrc` for `@vectoragents` (registry set in the project `.npmrc`).
- `pnpm build` runs `scripts/check-snippets.mjs` first: it typechecks every `ts`/`tsx` block (neutral pages from `docs/`, flavoured pages from each pair copy under `docs-gen/pairs/`) against the pinned package and writes `static/verified.json`, which the site shows as the verified stamp.
- CI reads the registry token from the `PACKAGES_TOKEN` secret.
- `pnpm check:starter` is networked and runs in its own CI job. It generates the pair copies, runs `@vectoragents/create-app` once per client-server pair, and checks the pages against each generated project. `STARTER_DIR=<path>` uses a local starter checkout (its CLI and templates) instead; the job needs the `PACKAGES_TOKEN` secret.

## Hosting

The site is a Cloudflare Worker (`wrangler.jsonc`) that serves `build/` behind HTTP Basic auth (`worker/index.ts`). `.github/workflows/deploy.yml` deploys every push to `main`.

One-time setup:

- Worker secrets, the one login every reader shares: `pnpm exec wrangler secret put BASIC_AUTH_USER`, then `pnpm exec wrangler secret put BASIC_AUTH_PASSWORD`. The Worker answers 500 until both are set.
- GitHub secrets `CLOUDFLARE_API_TOKEN` (the "Edit Cloudflare Workers" token template) and `CLOUDFLARE_ACCOUNT_ID`.
- GitHub variable `DOCS_URL`: the site address with no trailing slash.

Local preview: put both names in `.dev.vars` as `NAME=value` lines, then `pnpm build && pnpm exec wrangler dev`.
