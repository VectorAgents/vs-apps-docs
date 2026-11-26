# Site internals

Not published. How the figures, code-line marking, glossary hover, voice checks, tests and hosting of the docs site work. `CLAUDE.md` points here; read the section for the part you edit.

## Figures

- Figure colours are the `--iso-*` tokens in `src/css/custom.css`, the Vector Space theme, with Geist from `src/css/fonts/` as the figure font. The Apps overview on `how-a-vector-app-works` is a `StructureFigure` with data in `src/diagrams/figures/apps-overview.ts`.
- Figure slots of the Vector Space concept pages: `src/diagrams/figures/slots.ts` (one typed row per slot and `PLACEHOLDER_CAP`; its TSDoc holds the rules). A page marks a slot with `<FigurePlaceholder slot="<id>" />` inside the H2 that the spec names. A real figure replaces that tag: `StructureFigure`, `FlowFigure` or `LadderFigure` (`src/components/`) with typed data in `src/diagrams/figures/<id>.ts`. Flow types are in `src/diagrams/figure/flow-types.ts`, the timeline in `flow.ts`. A `ladder` is flat text, not a picture: an ordered list of steps that each add acts, with its types in `ladder-types.ts` and no hover or button path. Vendor marks are images under `static/img/marks/`. Tests: `scripts/figure-slots.test.mjs`, `scripts/flow-figure.test.mjs`, `scripts/ladder-figure.test.mjs`.
- Figure renderer in `src/diagrams/figure/`: data types (`types.ts`, whose TSDoc lists the rules every structure figure follows), geometry (`geometry.ts`), structure layout (`layout.ts`) and icons (`icons.ts`). Paint rules are in `src/css/figure.css`. Tests: `scripts/figure-geometry.test.mjs` and `scripts/structure-figure.test.mjs`, which runs the figure rules on every structure data file.

## Code-line marking

- Code-line marking: the magic comments `added-next-line`, `removed-next-line` and the `added-start`/`added-end` and `removed-start`/`removed-end` pairs (`docusaurus.config.ts`) put `code-line-added` and `code-line-removed` on rendered rows (styles in `src/css/custom.css`). The copy button (`src/theme/CodeBlock/Buttons/CopyButton`) skips removed rows. Test: `scripts/build-check/code-line-marking.test.mjs`.

## Voice checks

- Voice checks: `scripts/voice.mjs` exports `voiceViolations` (sentence over 35 words, paragraph over 5 sentences), `contractionViolations`, `dashViolations`, `linkTextViolations` and `descriptionViolations`. `scripts/voice.test.mjs` runs the last four on every page under `docs/`. `voiceViolations` runs in the page tests of the quickstart, the explainers and the concept pages.

## Glossary hover

- Glossary hover: `pnpm generate` writes `docs-gen/glossary-index.json` (`scripts/glossary-index.mjs`): the first paragraph and `Owner` line of each glossary entry, keyed `<section>#<heading slug>`, outside `docs-gen/site/` and so out of the search index. `src/theme/MDXComponents/A.tsx` wraps every link to a glossary entry in a popover card from that index (styles in `src/css/glossary-hover.css`); no page needs markup. Tests: `scripts/glossary-index.test.mjs`, `scripts/build-check/glossary-hover.test.mjs`.

## Page tests

- Page tests import shared helpers (`section`, `snippetsOf`, `titledSnippets`, `codeOf`, `linksOf`, `nextLinks`, `treesOf`, `bodyOf`, `unlink`, `rowsOf`, `brokenLinks`, `longSentences`, `bannedTermsIn`, `lastStep`, `assertPersonaScene`) from `scripts/page-helpers.mjs`. `treesOf(source)` returns `{ tree, text }` for each tree of a flavoured source page, read from `docs-gen/pairs/` (`tree` is the flavours of the axes the page varies on, such as `nest` or `react/nest`), and one entry with `tree` '' for a neutral page, read from `docs-gen/site/`. Run the same assertions on every entry. It needs `pnpm generate` first. Concept page tests also share `scripts/concept-link-rules.mjs` (`glossaryLinkProblems`, `assertWhereNext`) and `scripts/core-concept-checks.mjs` (`assertCoreRules`); SDK page tests share `scripts/sdk-page-helpers.mjs`.

## Built-site tests

- `pnpm test:build` runs after `pnpm build` and checks the built site (`scripts/build-check/`): every flavoured page at its plain URL with a labelled block per flavour, its sidebar entry and prefixed heading ids; the head script, its hide rules and the picker on every page; each todo notice's switch button and target block; one search index, no per-pair index, and the flavour ranking (`src/plugins/flavour-search.mjs`) in the client bundle; code lines (`code-line-marking`: both line classes in a built codeblock, the copy override in the bundle); glossary hover (`glossary-hover`); the figure pages (`apps-figure`, `structure-figure`, `flow-figure` and `ladder-figure`; the structure ones share `structure-figure-checks.mjs`: SVG title and desc, caption, legend, one button per part, search index) and the Vector Space section (`vector-space-section`: navbar tab, sidebar of 13 pages, placeholders).

## Hosting

- Hosting: a Cloudflare Worker (`wrangler.jsonc`) serves `build/` behind HTTP Basic auth (`worker/index.ts`). The login is the Worker secrets `BASIC_AUTH_USER` and `BASIC_AUTH_PASSWORD`. `worker/` has its own `tsconfig.json`; `pnpm typecheck` generates its types with `wrangler types` and checks it as a second project. `.github/workflows/deploy.yml` deploys a push to `main` after `pnpm test:build`, whose `basic-auth` check runs the Worker on the build. Setup: `README.md`.
