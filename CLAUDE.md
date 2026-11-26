# vs-apps-docs

Docusaurus documentation site for `@vectoragents/vs-apps`. `docs/` holds the source pages in one folder per section: `docs/vector-space/` (13 concept pages in Core concepts, Architecture and governance and Workflows and extensions, glossary; their figures are `StructureFigure`, `FlowFigure`, `LadderFigure` and `FigurePlaceholder`, see the figure bullets below), `docs/vector-apps/` (quickstart, recipes, guides, the two explainers `why-vector-apps` and `how-a-vector-app-works`, glossary) and `docs/sdk/` (app definition, examples, reference, glossary); `docs/index.mdx` is the entry page. The Definition builder is `src/pages/sdk/builder.tsx`. `sidebars.ts` holds one sidebar per section and the navbar shows a tab for each. `scripts/generate.mjs` turns them into `docs-gen/`: `docs-gen/site/` is what Docusaurus publishes, `docs-gen/pairs/<client>/<server>/` is for checks only. `scripts/` also holds the snippet typecheck.

## Agent skills

### Issue tracker

Issues and specs are local markdown under `.scratch/<feature>/`. See `.agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `.agents/triage-labels.md`.

### Domain docs

Single-context: the three glossaries `docs/vector-space/glossary.md`, `docs/vector-apps/glossary.md` and `docs/sdk/glossary.md`, plus `.agents/adr/`. See `.agents/domain.md`.

### Coding standards

Judgement calls for the reviewer: `CODING_STANDARDS.md`. Mechanical rules are checks, not text.

### Writing language

Language rules for `docs/`: simple English, defined abbreviations, numeric limits. See `.agents/writing-language.md`.

## Runbooks and sibling repos

- Register an app in a Space as Vector staff: `.agents/staff-registration.md`.
- Run a local Space and drive its UI: `.agents/local-space.md`.
- Write a page that differs by client or server flavour (axis, flavour, pair, `<!-- flavour <name> -->` blocks; one URL per page, the reader view and search follow the chosen flavour): `.agents/flavours.md`. Config: `flavours.config.json`.
- Master docs: `../vector-spaces/docs` is the source of truth for Vector Space behaviour and shared terms. It is written for the Vector Space team and is dense, so read the entry points and never copy from it. Start at `product/OVERVIEW.md` and `product/GLOSSARY.md`, then `domains/vector-apps/` for Vector Apps (`README.md`, `REGISTRY.md`, `BINDINGS.md`, `PROTOCOL.md`, `SDK.md`). `docs/CLAUDE.md` there says where the rest lives. Published pages here are the simplified outside version, and `.agents/provenance.md` names the master doc each claim rests on. The master docs are not published, so a page never names them. Check every behaviour claim you write or change in `docs/` against the code and a running app, not the master docs alone. Read `../vector-spaces` (the Space and SDK source) and `../vector-flows` (a real SDK app), run them, and drive the signed-in Edge debug browser with `chrome-devtools-edge` or `playwright-cli` (`.agents/local-space.md`, `.agents/browser-checks.md`). Code and observed behaviour win over the master docs: log the finding in `.agents/provenance.md`. Both repos are sources only: a page never names them, and code taken from them is rewritten as a generic example.
- Reference material: [Vector Spaces Field Guide](https://claude.ai/artifact/9CxaYn29Mv8CSZY6orKdpd) (internal, Draft v1, 30 Sep 2026). It covers what Spaces and Vector Apps are, their building blocks and the integration model, for sales and the Core Team. Background only: a published page never cites it.
- Sibling repos: `../vector-spaces` (the Space, owns its start commands) and `../vector-app-quickstart` (the templates and CLI the quickstart runs).
- Commit gate: `pnpm check` (its first step, `pnpm generate`, fails on a marker error or on `todo` blocks above `todoCap`), run by `.githooks/pre-commit` (skipped for merge commits) and CI. `pnpm check:snippets` typechecks neutral pages once from `docs/`, and flavoured pages from `docs-gen/pairs/` with one `tsc` project per pair (`react+node`, `react+nest`; Nest adds both decorator flags). Snippet titles on `docs/vector-apps/recipes/` and `docs/vector-apps/guides/` pages start with `client/`, `server/` or `shared/`, checked on the source pages. A recipe or guide holds an opening paragraph, then Prerequisites, Steps and Next steps (`scripts/recipes.test.mjs`). A codeblock with the meta word `excerpt` shows part of a file and is skipped by the snippet typecheck. `scripts/terms.test.mjs` fails on capital-S "Space" outside "Vector Space", the bare noun "grant" (write "permission grant"), "RedemptAI" and the retired "service secret", "app token" and "credential store" in prose under `docs/`; code spans and codeblocks are skipped there, but the retired identifiers `viaServer`, `MemoryCredentialStore`, `AppCredentialStore`, `/api/provision`, `/api/deprovision` and the anchors `#app-token` and `#service-secret` fail everywhere. To see only the failing tests, run `pnpm test:brief [files]`. The hook prints the tail of the output on failure only.
- Site internals (figures and their data files, code-line marking, glossary hover, voice checks, page-test helpers, the built-site tests, hosting): `.agents/site-internals.md`. Read the section for the part you edit before you touch `src/diagrams/`, `src/css/`, `src/theme/`, `scripts/build-check/`, a page test or `worker/`.
- `SPACE_DIR=<path> pnpm check:space` (default `../vector-spaces`) fails when a label or toast that Part 2 of the quickstart or `.agents/staff-registration.md` names is missing from the Space client source. It runs locally, not in CI.
- `STARTER_DIR=<path> pnpm check:starter` runs the starter's CLI from a local starter checkout, once per pair (`client+server`), and checks the pages against each generated project. Without it, the published `@vectoragents/create-app` runs against `STARTER_REF` (default `main`). Package name and repo: `scripts/starter-source.mjs`. A page asks for the overlay with `start: leads-app` in front matter.
