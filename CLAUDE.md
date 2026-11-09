# vs-apps-docs

Docusaurus documentation site for `@vectoragents/vs-apps`. `docs/` holds the source pages in one folder per section: `docs/vector-space/` (11 concept pages in What, Why and How, glossary), `docs/vector-apps/` (quickstart, recipes, guides, glossary) and `docs/sdk/` (app definition, examples, reference, glossary); `docs/index.mdx` is the entry page. The Definition builder is `src/pages/sdk/builder.tsx`. `sidebars.ts` holds one sidebar per section and the navbar shows a tab for each. `scripts/generate.mjs` turns them into `docs-gen/`: `docs-gen/site/` is what Docusaurus publishes, `docs-gen/pairs/<client>/<server>/` is for checks only. `scripts/` also holds the snippet typecheck.

## Agent skills

### Issue tracker

Issues and specs are local markdown under `.scratch/<feature>/`. See `.agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `.agents/triage-labels.md`.

### Domain docs

Single-context: the three glossaries `docs/vector-space/glossary.md`, `docs/vector-apps/glossary.md` and `docs/sdk/glossary.md`, plus `.agents/adr/`. See `.agents/domain.md`.

### Writing language

Language rules for `docs/`: simple English, defined abbreviations, numeric limits. See `.agents/writing-language.md`.

## Runbooks and sibling repos

- Register an app in a Space as Vector staff: `.agents/staff-registration.md`.
- Run a local Space and drive its UI: `.agents/local-space.md`.
- Write a page that differs by client or server flavour (axis, flavour, pair, `<!-- flavour <name> -->` blocks; one URL per page, the reader view and search follow the chosen flavour): `.agents/flavours.md`. Config: `flavours.config.json`.
- Master docs: `../vector-spaces/docs` is the source of truth for Vector Space behaviour and shared terms. It is written for the Vector Space team and is dense, so read the entry points and never copy from it. Start at `product/OVERVIEW.md` and `product/GLOSSARY.md`, then `systems/apps/` for Vector Apps (`README.md`, `REGISTRY.md`, `BINDINGS.md`, `PROTOCOL.md`, `SDK.md`). `docs/CLAUDE.md` there says where the rest lives. Published pages here are the simplified outside version, and `.agents/provenance.md` names the master doc each claim rests on. The master docs are not published, so a page never names them.
- Reference material: [Vector Spaces Field Guide](https://claude.ai/artifact/9CxaYn29Mv8CSZY6orKdpd) (internal, Draft v1, 30 Sep 2026). It covers what Spaces and Vector Apps are, their building blocks and the integration model, for sales and the Core Team. Background only: a published page never cites it.
- Sibling repos: `../vector-spaces` (the Space, owns its start commands) and `../vector-app-quickstart` (the templates and CLI the quickstart runs).
- Commit gate: `pnpm check` (its first step, `pnpm generate`, fails on a marker error or on `todo` blocks above `todoCap`), run by `.githooks/pre-commit` (skipped for merge commits) and CI. `pnpm check:snippets` typechecks neutral pages once from `docs/`, and flavoured pages from `docs-gen/pairs/` with one `tsc` project per pair (`react+node`, `react+nest`; Nest adds both decorator flags). Snippet titles on `docs/vector-apps/recipes/` and `docs/vector-apps/guides/` pages start with `client/`, `server/` or `shared/`, checked on the source pages. `scripts/terms.test.mjs` fails on capital-S "Space" outside "Vector Space", the bare noun "grant" (write "capability grant") and "RedemptAI" in prose under `docs/`; code spans and fences are skipped.
- Figure colours are the `--iso-*` tokens in `src/css/custom.css`, the Vector Space theme, with Geist from `src/css/fonts/` as the figure font. The Apps overview on `how-a-vector-app-works` is a `StructureFigure` with data in `src/diagrams/figures/apps-overview.ts`. It is not a slot, and `scripts/structure-figure.test.mjs` runs the figure rules on it.
- Figure slots of the Vector Space concept pages: `src/diagrams/figures/slots.ts` holds one typed row per slot (`id`, `page`, `kind`, `caption`) and `PLACEHOLDER_CAP`, which only goes down. A page marks its slot with `<FigurePlaceholder slot="<id>" />` (`src/components/FigurePlaceholder.tsx`) inside the H2 that the spec names, and a real figure replaces that one tag: `<StructureFigure data={x} />` (`src/components/StructureFigure.tsx`) or `<FlowFigure data={x} />` (`src/components/FlowFigure.tsx`, which plays) with typed data in `src/diagrams/figures/<id>.ts`, whose caption comes from `slotOf(id)`. Flow data is a structure figure plus steps and scenes (types in `src/diagrams/figure/flow-types.ts`, timeline in `flow.ts`, tests in `scripts/flow-figure.test.mjs`). Vendor marks on a part are images under `static/img/marks/`. `scripts/figure-slots.test.mjs` checks each slot appears once on its page and the placeholder count stays within the cap.
- Figure renderer: `src/diagrams/figure/` holds the data types (`types.ts`), the geometry (`geometry.ts`: projection, rounded plans, facet shading by wall angle, silhouettes), the layout of a structure figure (`layout.ts`: `layoutStructure`) and the icons (`icons.ts`). Paint rules are in `src/css/figure.css`. `scripts/figure-geometry.test.mjs` tests the geometry. `scripts/structure-figure.test.mjs` tests the layout and runs the figure rules on every structure data file that exists (at most 8 parts, 3 slabs and 4 legend items, a label on every part, no part hidden, no arrows).
- Page tests import shared helpers (`section`, `snippetsOf`, `titledSnippets`, `codeOf`, `linksOf`, `nextLinks`, `treesOf`) from `scripts/page-helpers.mjs`. `treesOf(source)` returns `{ tree, text }` for each tree of a flavoured source page, read from `docs-gen/pairs/` (`tree` is the flavours of the axes the page varies on, such as `nest` or `react/nest`), and one entry with `tree` '' for a neutral page, read from `docs-gen/site/`. Run the same assertions on every entry. It needs `pnpm generate` first.
- `pnpm test:build` runs after `pnpm build` and checks the built site (`scripts/build-check/`): every flavoured page at its plain URL with a labelled block per flavour, its sidebar entry and prefixed heading ids; the head script, its hide rules and the picker on every page; each todo notice's switch button and target block; one search index, no per-pair index, and the flavour ranking (`src/plugins/flavour-search.mjs`) in the client bundle.
- `STARTER_DIR=<path> pnpm check:starter` runs the starter's CLI from a local starter checkout, once per pair (`client+server`), and checks the pages against each generated project. Without it, the published `@vectoragents/create-app` runs against `STARTER_REF` (default `main`). Package name and repo: `scripts/starter-source.mjs`. A page asks for the overlay with `start: leads-app` in front matter.
