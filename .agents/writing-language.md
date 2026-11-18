# Docs language checklist

Reader: a working developer who knows TypeScript, Node and React and has not used Vector Space. This holds for the build pages (`docs/vector-apps/` and `docs/sdk/`). The concept pages set their own reader (Concept page). The glossary pages and the entry page serve both readers.
Coverage: prose, tables, headings, code comments. Not identifiers or string values in code. Code comments copied from the starter are not edited.
Precedence: rules here win over any reference. A page-type section wins over the shared layer on that page.

## Shared layer (all pages)

### Simple English

- **L1 Plain word.** Use the common word. Bad: "feeds ten uses". Good: "is used in ten places".
- **L2 One idea per sentence.** Split at "and", "so" and ";" when each side could stand alone.
- **L3 Sentence length.** Target 25 words or fewer. Hard cap 35. Split a long sentence at a clause break. Do not cut words the reader needs, and do not write runs of short fragments: join them into one sentence.
- **L4 Paragraph length.** 5 sentences or fewer.
- **L5 Table cell and reference description.** One sentence per cell, 15 words or fewer. Move longer text out of the table.
- **L6 Active voice.** Name the actor. Bad: "A slot nobody set runs nothing". Good: "If no one sets a slot, the app cannot use that model."
- **L7 No noun stacks.** Three nouns in a row need a verb. Bad: "Connector-event handler wiring". Good: "Register connector event handlers".
- **L8 One name per thing.** Use the glossary name every time. A term keeps the capitals the glossary gives it ("Can use", "Context Hub"); a common-noun term is lowercase mid-sentence ("space admin", "organization admin"). A glossary name is exempt from L7. Bad: "registry entry" for "app registration". Bad: "the sales space". Good: "a sales team's space": the space is generic and the team owns the domain.
- **L9 Spell out the figure.** Give exact numbers and limits, not "a few" or "many". A limit is a literal value with its unit and scope, such as "2-63 characters".
- **L10 Join runs of short sentences.** Three or more consecutive sentences of 12 words or fewer that open the same way become one or two sentences linked by condition, cause or sequence. Lead with the condition or cause, make the actor the subject (L6) and end on the consequence the reader acts on. Keep every fact and stay under the L3 target. A sentence that carries a rule, a limit or an error string stays separate.

### Voice

- **V1 Speak to the reader.** Address the reader as "you" and "your". Bad: "The developer adds a page." Good: "You add a page."
- **V2 Imperative for steps.** A task step is a command. Bad: "The page can be added to the definition." Good: "Add the page to the definition."
- **V3 Never name the reader by role.** Do not write "app developer", "the developer" or "the user" for the reader. The people who open your app are "members": write "member", not "user". Use "user" only where the glossary does, as in "users and groups" in a share.
- **V4 Other roles keep their names.** Write "space editor", "space admin" and "staff" for people in Space.
- **V5 No "we" or "our".** The docs state what is true and do not speak as Vector.
- **V6 Write what is.** State what a thing is and does. Do not explain why something is absent, defend a choice against an alternative the reader never raised, or add a heading for something that does not exist. A rule, a limit or a condition stays even in negative form: "If no one sets a slot, the app cannot use that model." Test: does the sentence still earn its place for a reader who never thought of the alternative?
- **V7 No em or en dashes.** Use a comma, a colon, brackets, a new sentence, or "to" for a range. A hyphen joins words in a compound. It is not a dash. Applies to prose, tables, headings and code comments, not to string values in code.
- **V8 State facts plainly.** Do not use words that only add force or ease: "bedrock", "absolute", "heavily governed", "seamless", "powerful", "robust", "simply", "just", "easily". State a guarantee as a plain fact. Bad: "Access is heavily governed." Good: "Every action needs a capability grant."
- **V9 No contractions.** Write "do not", "it is", "cannot". A possessive "'s" is not a contraction. Applies to prose, tables, headings and code comments, not to string values in code or to starter comments the docs do not edit.
- **V10 No page-describing sentences.** Do not write a sentence that describes the page ("This page shows...", "Below you will find..."). The first sentence defines the thing. On a quickstart, recipe or guide the opening paragraph still states the objective and the result (TU1, R2).
- **V11 No filler.** A sentence carries a fact the next sentence does not. Test: delete the sentence. If no fact is lost, delete it. If it hides a fact, state the fact. Example: "Several rules apply." before a list of the rules fails the test, because the list states every rule.

### Terms

- **T1 Vector and SDK terms.** Link a glossary term at its first use on each page, in the page and not in a section. The link shows the definition on hover. Role words such as "staff" and "space admin" count. A term your reader already knows (see the Reader line) needs no link. A sentence carries at most 3 glossary links. Link the rest at their next use.
- **T2 Informal words.** A word used with a private meaning ("pull", "boot ping", "ungated", "surface") is a Vector term: apply T1, or replace it with a plain phrase.

### Abbreviations

- **A1 Define at first use.** Expand an abbreviation at first use only when a developer who knows TypeScript, Node, React and HTTP would not know it. Write the full form with the abbreviation in brackets: "ideal customer profile (ICP)". An abbreviation with a glossary entry (SDK, A2A, MCP) is linked at first use on each page and not expanded: "the [SDK](./glossary.md#sdk) passes the slot key". Known terms such as HTTP, JSON, SQL, UI and OS need nothing.
- **A2 Shortened words.** Write "navigation", "environment" and "configuration" in prose, not "nav", "env" and "config". Glossary terms ("app", "space admin", "dev issuer") are exempt, and so are code identifiers (A4).
- **A3 Glossary entry.** A Vector or product abbreviation used on more than one page has a glossary entry. Link it at first use on each page. A one-page abbreviation defined inline (ICP) and a standard abbreviation need no entry.
- **A4 Code values.** Names in code font (`REST`, `ANTHROPIC`) are identifiers and are not abbreviations.

### Headings

- **H1 Sentence case.**
- **H2 Say what the section gives.** A task heading starts with a verb. A concept heading is a noun phrase. No questions.

### Page parts

- **P1 Page description.** Every page has a `description` in front matter. It is one sentence of 160 characters or fewer, and it says what the reader gets or can do. A page that teaches a task (quickstart, recipe, guide) starts with a verb: "Gate an app page and an endpoint by capability." Every other page (concept, SDK, glossary, entry) uses a noun phrase that says what the page holds: "Signature, behaviour and example of each `@vectoragents/vs-apps/server` export." Do not start with "This page", "Learn" or "Learn more", and do not describe the page itself.
- **P2 Link text.** Link text names the target: the page title, or a phrase that says what the reader finds there. Never use "here", "this page", "read more", "learn more" or a bare URL as link text.
- **P3 Directional words.** Do not point at page content with "above", "below", "earlier" or "as shown". Name the thing ("the `AppCredentialStore` in the next snippet") or link to the section. "Above" and "below" are fine when they describe a place in a component tree or in code order, not in the page.
- **P4 Callouts.** A callout (`:::warning`) is for three cases only: a security risk, an irreversible action, or a failure that gives no error. Put it at the step or entry it concerns. Use at most one callout of a type per section, and keep it to 3 sentences or fewer. State the consequence, then the action to take. Do not use a callout for tips or for general emphasis.
- **P5 Errors.** When a step or an entry has a known failure, say so there. Quote the exact error string in a code span, name the cause in one sentence, and give the fix. Do not collect errors in a separate Troubleshooting section. Add this only for failures a reader is likely to hit, never for every possible error.
- **P6 Tool versions.** A page that needs a tool names its minimum version in Prerequisites, such as "Node.js 20.19 or later". A recipe or guide names a version only when it needs one that the quickstart does not set. The SDK package version appears in the site header only, never in page text.

## Concept page

Scope: the concept pages of `docs/vector-space/`. `docs/vector-apps/why-vector-apps` and `docs/vector-apps/how-a-vector-app-works` are not concept pages: they follow the build-page reader and the shared layer only.
Reader: someone who works in or judges a space and has not used Vector Space. The page assumes no TypeScript, Node or React. A page never names who it is for.

- **C1 Open with the definition.** First sentence says what the thing is. Second says what it does for the reader.
- **C2 Scene early.** A short scene follows the lead, under a noun-phrase heading that names it (for example "A request in a space"). No heading is named "Example". Every page has one.
- **C3 Rule, then reason.** State the rule, then the consequence in the same or the next sentence.
- **C4 End with what next.** The last section is "Where to go next". It gives a result sentence ("You now know ..."), then one primary next step as a sentence with its link, then up to 3 more links under "Related". That is 4 page links in all, plus the glossary. Links to glossary entries inside a description do not count. Each link points to another topic, never to the missing half of this one. Links stay inside Vector Space, except on `what-vector-space-is` and `extending-a-space`.
- **C5 Frame.** In order: lead, a scene H2 (C2), detail H2s, "Where to go next" (C4). One exception: `what-vector-space-is` ends with "Where to read next", a grouped list of every page, with no result sentence, no primary step and no 4-link cap.
- **C6 One figure per major idea.** The figure sits inside the detail H2 that names its idea, never right after the lead. `what-a-space-holds` has none. `how-work-moves-through-a-space` puts its figure in the scene H2, because the figure draws the scene's worked example.
- **C7 One scenario.** Each page tells one slice of the same scenario: Maya, a member of Acme's sales team, asks the orchestrator agent to find leads and send an outreach email. A scene paragraph names a persona from [the persona record](./personas.md) in place of "a member", "this member" or "that member". It introduces the persona at first use in the form the record gives, and never uses he or she. Reference sections, tables, bullets and headings keep the generic "member". `approvals-and-the-command-center` tells a status-note scene with Maya, and `extending-a-space` and `agent-studio` use their own example and persona. Vendor names appear only on the worked-example page.
- **C8 Parts list.** Use a bold term plus a colon for a parts list.
- **C9 Stand alone.** A page covers its topic in full and never hands part of it to another page. It restates the shared base in 1 to 2 sentences. An inline link to an owner page is allowed only if the page still gives the reader everything it promises with the link removed. Every other idea, such as a rule or a mechanism, is explained on the page.

## Tutorial page

Scope: `docs/vector-apps/quickstart.md` only. `quickstart-page.test.mjs` runs `voiceViolations` from `scripts/voice.mjs` on it: the 35-word cap (L3) and the 5-sentence paragraph (L4). `scripts/voice.test.mjs` runs the sentence cap (L3), table cell (L5), contraction (V9), dash (V7), link text (P2) and description (P1) checks on every page under `docs/`.

- **TU1 Task order.** Open with one paragraph that states what the reader builds, the result and, in one sentence, that a client check is display only and the server check decides. Prerequisites and the first command follow. Put no diagram, file tree or roadmap sentence before the first command. Show the file tree at the step that needs it.
- **TU2 Reason only when it changes the action.** Open a step with its reason only when the reason changes what the reader does, or when a wrong action fails silently. Otherwise open with the command.
- **TU3 Check where output is visible.** After a step that produces something the reader can see, add a **Check** line with the exact output or the page to open. Skip it for a step with no visible result. The last step is a Check.

## Recipe and guide page

Scope: `docs/vector-apps/recipes/` and `docs/vector-apps/guides/`. A recipe is a page in the ordered chain of tasks. A guide is a standalone topic.

- **R1 Layout.** Front matter `title` and `description` (P1), plus `start: leads-app` for a page that starts from that overlay. Then an opening paragraph, then the sections Prerequisites, Steps and Next steps, in that order.
- **R2 Opening paragraph.** The opening paragraph states the objective and the result in the present tense, in one or two sentences. The result sentence is plain present tense with no fixed lead-in. Do not repeat it in another section.
- **R3 Prerequisites.** Name the start state in one of two forms: a scaffold command with the `--start` value (one per server flavour when the page has flavours), or an earlier page whose result the steps edit. Name a recipe only if the steps edit that recipe's result. List the tokens and accounts the steps need. End with a "Background:" line of links.
- **R4 Steps.** Numbered `###` headings, each a verb phrase (H2). Snippet titles start with `client/`, `server/` or `shared/`. Show a new file, or a file of about 30 lines or fewer, whole. Show an edit to a longer existing file as an excerpt: the real file path as the title, line numbers that match the real file, about 3 lines of context before and after the change. Mark an excerpt with the codeblock meta word `excerpt`. Mark changed lines with magic comments: added lines green, removed lines red. A whole file and an excerpt use the same marking. A removed line stays visible and the copy button skips it. Do not use `diff` codeblocks or prose patches.
- **R5 Toy app.** Use the app key `hello-app`, pages `leads` and `icp`, and capabilities `lead:manage` and `icp:manage`. In prose and commands, name the project by its start, `leads-app`, and give the scaffold folder the same name. `hello-app` appears only as the app key in code. A page that scaffolds beside a recipe's folder uses a new folder name and says why. Expand ICP once per page.
- **R6 Check.** The last step is a check. It gives the command or action and the exact result the reader sees, such as a status code, a line of output or a visible UI state.
- **R7 Next steps.** The last section is "Next steps". It holds 1 to 3 links. Each has link text that names the destination and one short reason. On a recipe the first link is the next recipe in the chain, and the last recipe links `agent-action-trees`.
- **R8 Flavours.** A page that differs by server puts the Node.js text in a `node` block and the Nest.js text in a `nest` block of one page. If only one flavour is written, one neutral sentence outside the blocks says which server the page covers, and the `todo` block stays for the generator. Nest snippets keep type-only constructor injection with no `@Inject`.

## SDK page

Scope: `docs/sdk/`. A reference page is one of the eight pages under `docs/sdk/reference/` for a subpath, plus `platform-limits`. `overview`, `app-definition` and `examples` follow the shared rules and the lines below. The glossary follows the Glossary page section.

- **S1 Reference outline.** A reference page has, in order: an opening paragraph that names the subpath; `## Prerequisites` only when the page needs more than the installed package; one `##` per export, headed by the export's name, with `### Signature`, `### Behaviour` and `### Example` under it; an optional `## Next steps` of 1 to 3 links worded as R7. No `## Result`. No sentence that describes the page itself, such as "Every symbol below follows one layout". `platform-limits` keeps one closing link.
- **S2 Entries.** An entry heading carries the full name of the thing, such as `resources.connectors[].eventHandlers[]` or `useUsers`, never a short name under a generic parent heading. A field with sub-fields gets one row per sub-field. Every field row says whether the field is required. Behaviour is stated as flat facts: what the export returns, what it throws and what it never does. No hedge unless the behaviour is not deterministic.
- **S3 Closed lists and warnings.** A closed list of values lives only on `platform-limits`. Other pages name the kind of value and link there. On SDK pages a callout is for a silent failure only.
- **S4 Example.** One example per export, showing the most common use. The example is a complete file that typechecks against the installed package. The `excerpt` marking of R4 does not apply. The codeblock title is the file path in the reader's project, such as `src/ping.ts`. A comment explains only a line the code cannot show, and the prose around the example does not narrate its lines.
- **S5 `app-definition`.** Headings follow H2: a task heading starts with a verb, a concept heading is a noun phrase. "How to write one" becomes "Write an app definition". "What an app definition does" becomes "Where the app definition is used". The page states no count or number that refers to an item of its own list. A cross-reference links the heading by its anchor name, such as `[Import check](#validate-on-import)`.
- **S6 `overview` and `examples`.** `overview` has one table with one row per subpath of the installed package: import path, one-sentence use, link to the reference page. A subpath with no reference page says where its docs are. Each example in `examples` is a complete file embedded from `src/examples/` with the `file=` meta word. The heading names what it shows and one sentence says why a reader would copy it. Both pages end with `## Next steps` of 1 to 3 links.
- **S7 `platform-limits`.** One `##` per closed list, named for the list, in source order. Each section names the field its list fills. A two-column table: the literal value in a code span, and one short meaning. Each section says whether `defineApp` rejects a value outside the list, or why it does not read the list.

## Glossary page

Scope: `docs/vector-space/glossary.md`, `docs/vector-apps/glossary.md`, `docs/sdk/glossary.md`.

- **GL1 Entry shape.** A `###` term heading, the definition paragraph, an optional `- Maps to:` line that names an export or field, then an `- Owner:` line. The line starts with `SDK`, `Vector Space`, `SDK and Vector Space` or `docs`. It is 1 or 2 sentences of 15 words or fewer, the second saying what the other side does. Write no Maps to line when the term has no export.
- **GL2 Definition.** The first paragraph. 3 sentences or fewer and 50 words or fewer. It stands alone and starts with what the thing is. Shared rules L1 to L9, V and T2 apply.
- **GL3 Definition links.** Link a glossary term once, at its first use in the entry, 3 links or fewer. Link only to glossary entries, never to the entry's own term. T1 sets the hover.
- **GL4 Intro.** One paragraph above Terms. It names the entry shape and links the other two glossaries. It does not restate T1.

## Entry page

Scope: `docs/index.mdx`.

- **E1 Lead.** Three sentences: Vector Space, a Vector App, the SDK, each linked to its glossary entry.
- **E2 Cards.** Three cards in the order Understand, Build, Look up. The one primary button sits in the Build card.
- **E3 Card heading.** A card H2 says what the card gives and does not repeat the text of a link in the card. Bad: H2 "What Vector Space is" above a link "What Vector Space is". Good: "Vector Space concepts". The `description` follows P1.

## Not in this checklist

- Current state only. No rule here and no script checks it. Reviewers check it by hand.
