# Flavours share one URL per topic

Supersedes [ADR 0004](0004-flavours-are-client-and-server-axes.md) in part: its URL rule, Stubs and links, Saved choice, Search and the link in Gaps. ADR 0004 still holds the axes, markers, generator, marker errors, `todo` cap and baseline decisions.

A flavoured page is published once, at one plain URL such as `/vector-apps/quickstart`. The static HTML holds every flavour block. The reader's flavour decides which blocks show. A new flavour (a second client, a Python server) adds a config entry, a starter template and a block or `todo` per flavoured page. The address scheme, head script and search do not change. A new axis adds one parameter.

## Decision

- **URL rule.** One URL per page. The URL has no flavour segment, so a flavoured page has no stub and no redirect. Old flavour-tree URLs and `/nest/...` addresses may break; `onBrokenLinks: 'throw'` guards internal links.
- **Merged page.** The generator wraps each flavour block in an element with `data-axis` and `data-flavour` and a visible label. A `<head>` script sets `data-client` and `data-server` on `<html>` before paint, from the address parameters or the saved choice. CSS shows the matching blocks. Without JavaScript every block shows, labelled.
- **Parameters.** `?client=react&server=nest`, one parameter per axis, named after the axis. A parameter in a shared link overwrites the saved choice. Picking a flavour changes the saved choice only and leaves the address alone. Share and heading-copy actions build the full link with every axis.
- **Anchors.** A heading inside a block has the id `<flavour>-<slug>`, so ids never collide across blocks. A bare anchor whose id names a flavour switches to that flavour. Headings outside blocks keep plain ids.
- **Saved choice.** The choice lives in `localStorage` and starts as `react` + `node`. The picker shows on pages with blocks and is hidden on neutral pages, which the generator flags in front matter.
- **Links.** Authors write relative links and the generator leaves them as written. One sidebar and the stock paginator serve every flavour.
- **Gaps.** A `todo` block renders a notice, "Not yet written for <flavour>", with a button that switches to the written flavour and scrolls to its block. It still counts against `todoCap`.
- **Search.** One global index. A hit in the reader's flavour ranks first. A hit in another flavour is flagged where the search plugin allows; otherwise its anchor carries the flavour prefix, so opening it switches the flavour. The search plugin runs with its stock options.
- **Generator outputs.** `docs-gen/site/` holds the merged pages that Docusaurus publishes. `docs-gen/pairs/<client>/<server>/` holds one copy of each flavoured page per pair, with only that pair's blocks, for `check-snippets`, `starter-sync` and the page tests. Nothing under `pairs/` is published.

## Considered options

- **Flavour first in the path** (`/react/node/vector-apps/quickstart`) and **section first** (`/vector-apps/react/node/quickstart`). Rejected: both lengthen every flavoured URL, and each new flavour or axis adds a path segment, a search context and a redirect case.
- **Tabs per page.** Rejected for the reason in ADR 0004: a tab is local to its page, so the choice does not reach the next page and a link cannot carry it.

## Consequences

- A flavoured page's static HTML is as long as all its flavours together. A reader without JavaScript sees every block.
- The right-hand table of contents lists headings of hidden blocks unless CSS on the prefixed ids, or a swizzled `TOC`, hides them.
- A page shared without parameters opens in the reader's saved flavour, so two readers of one URL can see different text.
- The pair views under `docs-gen/pairs/` keep the checks per pair, so the snippet typecheck, the starter check and the page tests still cover every pair.
