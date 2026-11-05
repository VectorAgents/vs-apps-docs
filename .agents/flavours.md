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

## Reader view

- `docusaurus.config.ts` puts an inline script and an inline style in every page's `<head>`, both built from `flavours.config.json` by `src/flavours/head-script.mjs`. The script sets `data-<axis>` on `<html>` before first paint. The style hides a `.flavour-block` of another flavour and its entry in the right-hand contents, but only once the attribute is set, so a reader without JavaScript sees every block, labelled.
- Choice rules (`chooseFlavours`, tested in `scripts/head-script.test.mjs`): a flavour named by the address wins over the saved choice and overwrites it. The address names a flavour with `?client=&server=`, or with a bare anchor that starts `<flavour>-`. Anything else falls back to the saved choice, then the defaults.
- The saved choice is JSON in `localStorage` under `vs-apps-docs.flavours`.
- `src/components/FlavourPicker.tsx` (navbar) sets the attributes and saves the pick through `src/flavours/useFlavours.ts`. It leaves the address alone. `src/css/custom.css` hides the picker on a page with no flavour block.
- `src/flavours/client.ts` follows a bare anchor after a navigation inside the site and gives a heading link every axis (`shareUrl` in `src/flavours/resolve.mjs`), so a copied heading link opens on the same flavours.
- The generator gives a heading inside a block the id `<flavour>-<slug>`. Link to such a heading with that id, for example `../reference/react.md#react-useapp`.

## Starter check

- `pnpm check:starter` generates a project for each pair with the starter CLI and checks every flavoured page, from its pair copy, against that project (SDK pin, `starter` code blocks, directory tree, ports, environment variables). A neutral page is checked against the default pair.
- A page that starts from the `leads-app` overlay says so in front matter: `start: leads-app`. The default is `hello`.
- It fails when a block names a flavour that no starter template names in `flavour.json`, or when a template of an axis has no block or `todo` on a flavoured page that uses the axis.
