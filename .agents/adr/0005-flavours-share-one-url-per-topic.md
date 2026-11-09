# Flavours share one URL per topic

Supersedes [ADR 0004](0004-flavours-are-client-and-server-axes.md) in part: its URL rule, Stubs and links, Saved choice, Search and the link in Gaps. ADR 0004 still holds the axes, markers, generator, marker errors, `todo` cap and baseline decisions.

A flavoured page is published once, at one plain URL such as `/vector-apps/quickstart`. The static HTML holds every flavour block. The reader's flavour decides which blocks show. A new flavour (a second client, a Python server) adds a config entry, a starter template and a block or `todo` per flavoured page. The address scheme, head script and search do not change. A new axis adds one parameter.

## Decision

- **URL rule.** One URL per page. The URL has no flavour segment, so a flavoured page has no stub and no redirect. `onBrokenLinks: 'throw'` guards internal links.
- **Merged page.** The generator wraps each flavour block with its axis, its flavour and a visible label. A `<head>` script and CSS show the reader's blocks before paint. Mechanics: `.agents/flavours.md`, Generator and Reader view.
- **Parameters.** `?client=react&server=nest`, one parameter per axis, named after the axis. Which source wins, and what a pick or a copied link carries: `.agents/flavours.md`, Reader view.
- **Anchors.** A heading inside a block has the id `<flavour>-<slug>`, so ids never collide across blocks. Headings outside blocks keep plain ids.
- **Saved choice.** The choice lives in `localStorage`, so it follows the reader to the next page. The defaults start it (`flavours.config.json`).
- **Links.** Authors write relative links and they stay as written. One sidebar and the stock paginator serve every flavour.
- **Gaps.** A `todo` block renders a notice and a button to the written flavour. It still counts against `todoCap`.
- **Search.** One global index, not one per pair, from the search plugin with its stock options. Ranking and flagging: `.agents/flavours.md`, Search.

## Considered options

- **Flavour first in the path** (`/react/node/vector-apps/quickstart`) and **section first** (`/vector-apps/react/node/quickstart`). Rejected: both lengthen every flavoured URL, and each new flavour or axis adds a path segment, a search context and a redirect case.
- **Tabs per page.** Rejected for the reason in ADR 0004: a tab is local to its page, so the choice does not reach the next page and a link cannot carry it.

## Consequences

- A flavoured page's static HTML is as long as all its flavours together. A reader without JavaScript sees every block.
- Without JavaScript the right-hand contents lists the headings of every block.
- A page shared without parameters opens in the reader's saved flavour, so two readers of one URL can see different text.
- The pair views under `docs-gen/pairs/` keep the checks per pair, so the snippet typecheck, the starter check and the page tests still cover every pair.
