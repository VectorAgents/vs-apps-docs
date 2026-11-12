# Docs language checklist

Reader: a working developer who knows TypeScript, Node and React and has not used Space. This holds for build pages (`docs/vector-apps/`, `docs/sdk/`). The concept page section sets its own reader.
Coverage: prose, tables, headings, code comments. Not identifiers or string values in code.
Precedence: rules here win over any reference. A page-type section wins over the shared layer on that page.

## Shared layer (all pages)

### Simple English

- **L1 Plain word.** Use the common word. Bad: "feeds ten uses". Good: "is used in ten places".
- **L2 One idea per sentence.** Split at "and", "so" and ";" when each side could stand alone. On concept pages, related ideas may share a sentence (C8).
- **L3 Sentence length.** Target 25 words or fewer. Hard cap 40. References: mean 13-14, p90 25-28. The concept pages set their own target (see Concept page); the hard cap 40 holds everywhere.
- **L4 Paragraph length.** 5 sentences or fewer. References: mean 1.4-1.9.
- **L5 Table cell and reference description.** 15 words or fewer. A cell over 15 words is a note, not an error. References: 9-11.
- **L6 Active voice.** Name the actor. Bad: "A slot nobody set runs nothing". Good: "If no one sets a slot, the app cannot use that model."
- **L7 No noun stacks.** Three nouns in a row need a verb. Bad: "Connector-event handler wiring". Good: "Register connector event handlers".
- **L8 One name per thing.** Use the glossary name every time. A term keeps the capitals the glossary gives it ("Can use", "Context Hub"); a common-noun term is lowercase mid-sentence ("space manager", "organization admin"). Bad: "registry entry" for "app registration".
- **L9 Spell out the figure.** Give exact numbers and limits, not "a few" or "many".

### Voice

- **V1 Speak to the reader.** Address the reader as "you" and "your". Bad: "The developer adds a page." Good: "You add a page."
- **V2 Imperative for steps.** A task step is a command. Bad: "The page can be added to the definition." Good: "Add the page to the definition."
- **V3 Never name the reader by role.** Do not write "app developer", "the developer" or "the user" for the reader. "Your users" means the people who open your app.
- **V4 Other roles keep their names.** Write "space manager" and "staff" for people in Space. Link them at first use (T1).
- **V5 No "we" or "our".** The docs state what is true and do not speak as Vector.

### Terms

- **T1 Vector and SDK terms.** Define at first use, or link to the glossary at first use. This includes role words such as "staff" and "space manager". Link at the first use in the page, not at the first use in a section.
- **T2 Standard terms.** Standard web, TypeScript, Node and React terms need no definition.
- **T3 Informal words.** A word used with a private meaning ("pull", "boot ping", "ungated", "surface") is a Vector term: apply T1, or replace it with a plain phrase.

### Abbreviations

- **A1 Define at first use.** Write the full form, then the abbreviation in brackets, or link to a glossary entry. Bad: "the SDK refuses". Good: "the software development kit (SDK) refuses".
- **A2 Exempt list.** HTTP, JSON, API, URL, REST API, GraphQL API, OAuth, SQL and MCP need no definition. Add to this list only with maintainer approval.
- **A3 Shortened words count.** "nav", "env", "config" are abbreviations. Write the full word, or define it.
- **A4 Glossary entry.** An abbreviation defined in a page has a glossary entry that the page links to.
- **A5 Code values.** Names in code font (`REST`, `ANTHROPIC`) are identifiers and are not abbreviations.

### Headings

- **H1 Sentence case.**
- **H2 Say what the section gives.** A task heading starts with a verb. A concept heading is a noun phrase. No questions.

## Concept page

Scope: the concept pages of `docs/vector-space/` (What, Why and How groups).
Reader: someone who works in or judges a space and has not used Vector Space. The page assumes no TypeScript, Node or React. A page never names who it is for.

- **C1 Open with the definition.** First sentence says what the thing is. Second says what it does for the reader.
- **C2 Scene early.** A short scene follows the lead, under a noun-phrase heading that names it (for example "A request in a space"). No heading is named "Example".
- **C3 Rule, then reason.** State the rule, then the consequence in the same or the next sentence.
- **C4 End with what next.** Last section gives a result and one next step.
- **C5 Frame.** In order: lead, a scene H2 (C2), detail H2s, "Where to go next". Exceptions: `what-vector-space-is` has a "The three platform rules" H2 and ends with a grouped list of all pages, `how-work-moves-through-a-space` has no scene H2, `why-vector-space` opens with the problem and has no figure.
- **C6 One figure per major idea.** The figure sits inside the detail H2 that names its idea, never right after the lead. `what-a-space-holds` and `who-can-do-what` have none.
- **C7 One scenario.** Each page tells one slice of the same scenario: a member of a team's space asks the orchestrator agent to find leads and send an outreach email. Write "a team's space" or "a sales team's space", never "the sales space": the space is generic and the team owns the domain. The company is Acme, and a second team is Acme's marketing team. `approvals-and-the-command-center`, `extending-a-space` and `agent-studio` use their own example. Vendor names appear only on the worked-example page.
- **C8 Voice.** Sentences run 20 to 35 words, with related ideas allowed in one sentence; L3's hard cap 40 and L4 still hold. No em dashes: use commas, brackets or colons. No intensifiers ("bedrock", "absolute", "heavily governed"): state a guarantee as a plain fact. Use a bold term plus a colon for a parts list. Do not cut words to meet a count; the section has no word range, H2 count or table limit.
- **C9 Stand alone.** Define each term at first use in one clause with a glossary link. A term owned by Vector Apps or the SDK gets one clause and a link.
- **C10 Where to go next.** 2 to 4 links, ordered by what the reader does next, plus the glossary. Only `what-vector-space-is` and `extending-a-space` link outside the section.

## Tutorial page

Scope: `docs/vector-apps/quickstart.md` only. `scripts/voice.mjs` checks L4, the TU1 hard cap and TU2 outside code.

- **TU1 Sentence.** Target 30 words. Hard cap 40. Replaces L3 on this page.
- **TU2 No contractions.**
- **TU3 Reason first.** A step or section opens with a sentence that says why.
- **TU4 Imperative steps.** A step starts with an imperative verb. "-ing" forms are allowed where natural.
- **TU5 Define in one clause.** Define a term in one clause at first use. Link only a destination the reader follows. The page defines "capability", "space manager" and "manifest" in a one-clause appositive at first use, and `scripts/quickstart-page.test.mjs` pins that form.
- **TU6 Security contract first.** Lead with the security contract. Teach through running code, not folder creation. Say that a client check is display only and the server check decides.

## Recipe page

Scope: `docs/vector-apps/recipes/`.

- **R1 Sorting rule.** A recipe starts from a project the starter CLI generates (`--start hello`, or an overlay such as `--start leads-app`) and ends with something you run. If the page needs a result from an earlier page, it is a guide.
- **R2 Layout.** Front matter `title`, an opening paragraph, then the sections Goal, Prerequisites, Steps, Result, Next step, in that order.
- **R3 Goal.** Starts with "End with" and names what runs when the recipe is done.
- **R4 Prerequisites.** Names the start state (the `--start` value of the generated project), the tokens and accounts the steps need, and a closing "Background:" line of links. It does not name another recipe as a requirement.
- **R5 Steps.** Numbered `###` headings, each a verb phrase (H2). Snippet titles start with `client/`, `server/` or `shared/`. Show the diff against the start state, not the whole file.
- **R6 Shared toy app.** Use the app `hello-app`, pages `leads` and `icp`, and capabilities `lead:manage` and `icp:manage`.
- **R7 Result.** One paragraph that says what now works, in the present tense.
- **R8 Next step.** One link. Recipes form a chain, so the link is the next recipe or guide.

## Guide page

Scope: `docs/vector-apps/guides/`.

- **G1 Sorting rule.** A guide starts from the result of a prior recipe. Its Prerequisites name that recipe. If the page starts from the starter app, it is a recipe.
- **G2 Layout.** Same as R2.
- **G3 Prerequisites.** First item names the prior recipe and the state its result leaves: `expose-agent-actions`. A guide that builds on the quickstart app alone names Part 1 of the quickstart and the state it leaves. A guide on the `leads-app` start sets `start: leads-app` in front matter and shows the scaffold command with `--start leads-app` for each server flavour. Then a "Background:" line of links.
- **G4 Goal, Steps, Result.** As R3, R5 and R7.
- **G5 Next step.** One link to one related page. Guides are not a chain.
- **G6 Flavours.** A guide that differs by server puts the Node.js text in a `node` block and the Nest.js text in a `nest` block of one page. Nest snippets keep type-only constructor injection with no `@Inject`.

## Not in this checklist

- Contractions. Decided for the Tutorial page (TU2). Pending for other pages.
- Existing writing standard (hyphens, current state only). Reported in a separate section.
