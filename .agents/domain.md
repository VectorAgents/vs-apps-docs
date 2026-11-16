# Domain Docs

How the engineering skills read this repo's domain documentation. `docs/` is the published Docusaurus site, so agent config and ADRs live outside it.

## Before exploring, read these

- **`docs/vector-space/glossary.md`, `docs/vector-apps/glossary.md`, `docs/sdk/glossary.md`**: the published glossaries, terms an external developer needs. A term is defined once, in the broadest section that uses it.
- **`.agents/glossary-internal.md`**: terms only the Vector team needs. Not published.
- **`.agents/provenance.md`**: what each published claim rests on, and what is not yet verified. Not published.
- **`.agents/personas.md`**: the cast of named personas for scenes in `docs/vector-space/`, with the naming rules. Not published.
- **`.agents/adr/`**: ADRs touching the area about to change.

If any is missing, proceed silently. `/domain-modeling` creates them when terms or decisions are resolved.

## Use the glossaries' vocabulary

Name domain concepts as the glossaries define them. A concept missing from all of them is a gap to note for `/domain-modeling`.

## Where a term lives

A term is published if a published docs page uses it, or it maps to an SDK export or manifest field. Otherwise it is internal. A term lives in exactly one file, and in exactly one of the three published glossaries.

## Who reads the pages

Concept pages in `docs/vector-space/` are read by decision makers (CTO, CIO) as well as developers. They look for what the product gives them and whether it is safe, so a lead may state the benefit as a plain fact. Quickstart, recipes, guides and SDK pages are read by a developer who wants to finish a task.

## Words for code

Write "export" for a named thing a package exports (a function, hook, component, class or type), never "symbol". Write "codeblock" for a block of code in a page, never "fence".

## Flag ADR conflicts

If output contradicts an existing ADR, say so explicitly rather than silently overriding it.
