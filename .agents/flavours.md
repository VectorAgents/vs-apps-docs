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
- Link to a flavoured page with a relative link such as `[x](../guides/x.md)`.

## Generator

- `pnpm generate` reads `docs/` and writes `docs-gen/`. `docs-gen/` is generated and git-ignored.
- `docs-gen/site/` is what Docusaurus publishes. A flavoured page is one file at its source path. Each flavour block sits in `<div className="flavour-block" data-axis=... data-flavour=...>` with a `flavour-label` line. A neutral page is copied as written.
- `docs-gen/pairs/<client>/<server>/` holds one copy of each flavoured page per pair, with only that pair's blocks and no wrappers. It is for `check-snippets`, `starter-sync` and the page tests, and is never published.
- `docs-gen/flavours.json` lists each flavoured page with its URL, its axes and, per tree (the flavours of the axes it varies on), the pair copy that holds it.
- Every page keeps its source path, so a relative link resolves in `site/`.
- `pnpm start` generates once at launch, then runs `scripts/watch-docs.mjs`, which starts the dev server and regenerates on every change under `docs/`. It copies only changed files into `docs-gen/` and never recreates the folder, because `generate` deletes its output folder and that detaches the dev server's file watcher. A change to `flavours.config.json` needs a restart.
- `flavours.config.json` holds `docsRoot` (the source folder), `outDir`, the `axes` with their flavour names and labels, the `defaults` and `todoCap` (the most `todo` blocks allowed).
- The generator fails on a marker error, on a flavour name that equals a top-level folder of `docs/` (`vector-apps`, `sdk`) and when the `todo` blocks exceed `todoCap`. `pnpm check`, `pnpm test`, `pnpm build` and `pnpm start` run it first.

## Reader view

- `docusaurus.config.ts` puts an inline script and an inline style in every page's `<head>`, both built from `flavours.config.json` by `src/flavours/head-script.mjs`. The script sets `data-<axis>` on `<html>` before first paint. The style hides a `.flavour-block` of another flavour and its entry in the right-hand contents, but only once the attribute is set.
- Choice rules (`chooseFlavours`, tested in `scripts/head-script.test.mjs`): a flavour named by the address wins over the saved choice and overwrites it. The address names a flavour with `?client=&server=`, or with a bare anchor that starts `<flavour>-`. Anything else falls back to the saved choice, then the defaults.
- The saved choice is JSON in `localStorage` under `vs-apps-docs.flavours`.
- `src/components/FlavourPicker.tsx` (navbar) sets the attributes and saves the pick through `src/flavours/useFlavours.ts`; picking leaves the address alone. `src/css/custom.css` hides the picker on a page with no flavour block.
- `src/flavours/client.ts` follows a bare anchor after a navigation inside the site and gives a heading link every axis (`shareUrl` in `src/flavours/resolve.mjs`), so a copied heading link opens on the same flavours.
- A `todo` block shows the notice "Not yet written for <flavour>." and a button, "Switch to <written flavour>". The button names the next written block of the same axis in another flavour, else the last one before it. The generator gives that block an id `<flavour>-block-<n>`, n counting the blocks of that flavour on the page. A click picks that flavour, saves it and scrolls to the block (`src/flavours/client.ts`). The style hides the button until the head script has run. A todo with no such block gets no button. A pair copy holds the plain notice.
- Link to a heading inside a block with its id `<flavour>-<slug>`, for example `../../sdk/reference/react.md#react-useapp`.

## Search

- `@easyops-cn/docusaurus-search-local` indexes every block, hidden or not.
- The plugin has no option to rank or flag a hit. `src/plugins/flavour-search.mjs` swaps the `../searchByWorker` import of its search bar and results page for `src/flavours/search-by-worker.js`, which calls the plugin's search and passes the hits to `rankByFlavour` (`src/flavours/search.mjs`).
- A hit belongs to a flavour by its anchor (the heading id rule above, which `chooseFlavours` reads). Hits in the reader's flavour, and hits with no flavour anchor, come first in their order. Other hits follow, with `only in <label> · ` before the page title on the hit's path line. Opening one sets the flavour, because its anchor names it.
- Text in a block under a heading outside any block has that heading's plain anchor, so such a hit is not flagged and not demoted.
- `scripts/flavour-search.test.mjs` fails when a plugin upgrade moves the import or the tree-flag helper that the swap relies on. The plugin version is pinned.

## Starter check

- `pnpm check:starter` generates a project for each pair with the starter CLI and checks every flavoured page, from its pair copy, against that project (SDK pin, `starter` code blocks, directory tree, ports, environment variables). A neutral page is checked against the default pair.
- A page that starts from the `leads-app` overlay says so in front matter: `start: leads-app`. The default is `hello`.
- It fails when a block names a flavour that no starter template names in `flavour.json`, or when a template of an axis has no block or `todo` on a flavoured page that uses the axis.
