# Flavour pages

How to write a page that differs by flavour. Terms: axis, flavour, pair, flavour block and neutral page in `.agents/glossary-internal.md`. Decisions: [ADR 0004](adr/0004-flavours-are-client-and-server-axes.md) (axes, markers, generator) and [ADR 0005](adr/0005-flavours-share-one-url-per-topic.md) (one URL per topic).

## Markers

```md
<!-- flavour node -->
...text for Node.js + TypeScript...
<!-- /flavour -->

<!-- flavour nest todo -->
<!-- /flavour -->
```

- Each marker sits alone on its line. Blocks do not nest.
- A page that uses an axis needs a block or a `todo` block for every flavour of that axis.
- A page-level `react` block wraps the body of a client-only page. A `react` block may sit next to server blocks.
- Prose, the app definition and the manifest stay outside blocks.
- Link to a flavoured page with a relative link such as `[x](../guides/x.md)`. The generator keeps it as written.

## Generator

- `pnpm generate` reads `docs/` and writes `docs-gen/`. `docs-gen/` is generated and git-ignored.
- `docs-gen/site/` is what Docusaurus publishes. A flavoured page is one file at its source path. Each flavour block sits in `<div className="flavour-block" data-axis=... data-flavour=...>` with a `flavour-label` line, so every flavour shows, labelled, until the reader view hides the others. A `todo` block holds the notice "Not yet written for <flavour>." A neutral page is copied with `neutral: true` added to its front matter.
- `docs-gen/pairs/<client>/<server>/` holds one copy of each flavoured page per pair, with only that pair's blocks and no wrappers. It is for `check-snippets`, `starter-sync` and the page tests, and is never published.
- `docs-gen/flavours.json` lists each flavoured page with its URL, its axes and, per tree (the flavours of the axes it varies on), the pair copy that holds it.
- Links stay as written. Every page keeps its source path, so a relative link resolves in `site/`.
- `pnpm start` generates once at launch. After an edit to `docs/`, restart it: the dev server does not watch `docs/`.
- `flavours.config.json` holds `docsRoot` (the source folder), `outDir`, the `axes` with their flavour names and labels, the `defaults` and `todoCap` (the most `todo` blocks allowed).
- The generator fails on a marker error, on a flavour name that equals a top-level folder of `docs/` and when the `todo` blocks exceed `todoCap`. `pnpm check`, `pnpm test`, `pnpm build` and `pnpm start` run it first.
- The sidebar lists each page once and the paginator is the stock one.

## Saved choice

- The saved choice is JSON in `localStorage` under `vs-apps-docs.flavours`. `src/flavours/useFlavours.ts` reads it, with `?client=&server=` from the address winning (`choiceInQuery` in `src/flavours/resolve.mjs`, tested in `scripts/flavours-resolve.test.mjs`).
- `src/components/FlavourPicker.tsx` saves a pick and leaves the address alone. The navbar does not list it yet, and no head script or CSS hides a block.

## Starter check

- `pnpm check:starter` generates a project for each pair with the starter CLI and checks every flavoured page, from its pair copy, against that project (SDK pin, `starter` code blocks, directory tree, ports, environment variables). A neutral page is checked against the default pair.
- A page that starts from the `leads-app` overlay says so in front matter: `start: leads-app`. The default is `hello`.
- It fails when a block names a flavour that no starter template names in `flavour.json`, or when a template of an axis has no block or `todo` on a flavoured page that uses the axis.
