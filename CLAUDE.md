# vs-apps-docs

Docusaurus documentation site for `@vectoragents/vs-apps`. `docs/` holds the source pages. `scripts/generate.mjs` turns them into `docs-gen/`: `docs-gen/site/` is what Docusaurus publishes, `docs-gen/pairs/<client>/<server>/` is for checks only. `scripts/` also holds the snippet typecheck.

## Agent skills

### Issue tracker

Issues and specs are local markdown under `.scratch/<feature>/`. See `.agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `.agents/triage-labels.md`.

### Domain docs

Single-context: `docs/glossary.md` plus `.agents/adr/`. See `.agents/domain.md`.

### Writing language

Language rules for `docs/`: simple English, defined abbreviations, numeric limits. See `.agents/writing-language.md`.

## Runbooks and sibling repos

- Register an app in a Space as Vector staff: `.agents/staff-registration.md`.
- Run a local Space and drive its UI: `.agents/local-space.md`.
- Write a page that differs by client or server flavour (axis, flavour, pair, `<!-- flavour <name> -->` blocks): `.agents/flavours.md`. Config: `flavours.config.json`.
- Sibling repos: `../vector-spaces` (the Space, owns its start commands) and `../vector-app-quickstart` (the templates and CLI the quickstart runs).
- Commit gate: `pnpm check` (its first step, `pnpm generate`, fails on a marker error or on `todo` blocks above `todoCap`), run by `.githooks/pre-commit` (skipped for merge commits) and CI. `pnpm check:snippets` typechecks neutral pages once from `docs/`, and flavoured pages from `docs-gen/pairs/` with one `tsc` project per pair (`react+node`, `react+nest`; Nest adds both decorator flags). Recipe and guide snippet titles start with `client/`, `server/` or `shared/`, checked on the source pages.
- Page tests import shared helpers (`section`, `snippetsOf`, `titledSnippets`, `codeOf`, `linksOf`, `nextLinks`, `treesOf`) from `scripts/page-helpers.mjs`. `treesOf(source)` returns `{ tree, text }` for each tree of a flavoured source page, read from `docs-gen/pairs/` (`tree` is the flavours of the axes the page varies on, such as `nest` or `react/nest`), and one entry with `tree` '' for a neutral page, read from `docs-gen/site/`. Run the same assertions on every entry. It needs `pnpm generate` first.
- `pnpm test:build` runs after `pnpm build` and checks the built site: every flavoured page at its plain URL with a labelled block per flavour, its sidebar entry, and one search index.
- `STARTER_DIR=<path> pnpm check:starter` runs the starter's CLI from a local starter checkout, once per pair (`client+server`), and checks the pages against each generated project. Without it, the published `@vectoragents/create-app` runs against `STARTER_REF` (default `main`). Package name and repo: `scripts/starter-source.mjs`. A page asks for the overlay with `start: leads-app` in front matter.
