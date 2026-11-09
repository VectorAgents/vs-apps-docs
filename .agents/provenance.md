# Provenance

What each claim in these docs rests on. A ticket or spec named below without a link rests on a `.scratch/` folder that no longer exists, so the claim cannot be traced further.

The sections below follow the page folders: Why Vector Space is under `docs/vector-space/`. Quickstart, Guides, How a Vector App works and Why Vector Apps are under `docs/vector-apps/`. App definition, Reference, SDK overview and Choose your path are under `docs/sdk/`. The Entry page is `docs/index.mdx`.

## Sources

- SDK behaviour rests on the installed `@vectoragents/vs-apps` 0.4.0 dist (compiled output and type declarations) and its README. The SDK source in `packages/apps` of the sibling `vector-spaces` repo settles a claim that the dist leaves open.
- Every code snippet typechecks against the installed package, except the quickstart's `starter` code blocks. The starter's CI typechecks those excerpts ([ADR 0003](adr/0003-quickstart-runs-create-app-from-github-packages.md)). The stamp at the foot of each page shows the version and date of the last run.
- Space-side claims come from Space-side documentation, except the checks under [Verified in a local Space](#verified-in-a-local-space). This covers registration, the pending review, auto-apply, navigation entries, grants and the configuration sheet.

- Glossary terms rest on the product glossary of the sibling `vector-spaces` repo (`docs/product/GLOSSARY.md`), with `docs/systems/apps/BINDINGS.md` for the app settings. A published page never names either file.

## Glossary term mapping

The glossary uses the published word where the product glossary uses an internal one.

| Published term | Product term | Note |
| --- | --- | --- |
| allowed resources | Ceiling (`access.app_binding_resources`) | The resources a space manager attaches to an app. `ceiling` does not occur in `docs/`. |
| the member's access | Floor | The overlap rule: an action runs only on resources that are allowed for the app and open to the member. |
| Context Hub | Pool | The Context Hub row absorbs the pool. Vector Space lists what the space can reach as **Resources**. |
| knowledge source | Source | Vector Space shows knowledge sources in the settings of an app. |
| space page | Page (`pages.pages`) | A grid of widgets. `app page` names the SDK `pages[]` entry. |
| capability grant | Share on named capabilities | A share at Can use on named capabilities of an app. The product grant is a standing approval, a different thing. |
| Vector Space, space | Space | The platform is Vector Space. The workspace is a space. |
| app token | service token | The SDK README calls it a service token. |
| staff | Staff (`UserType.Staff`) | A platform operator, reaching organizations through the tenancy tree. |
| binding | Binding (`access.app_bindings`) | An app activated on a space. |
| ask | Ask (`runs.asks`) | An approval is one kind of ask. |
| channel | Channel (`studio.channels`) | An agent reached from outside the web app. WhatsApp, Messenger and Instagram are Meta messaging services. |

## SDK gaps

- The SDK declares no `engines` field. The docs name the current Node.js LTS release, which the starter CI tests (`lts/*`). Vite 8 accepts every LTS from 22.12.
- The dev route shapes rest on the framework-free dev routes of the app platform (`server/app-platform/dev-issuer/` and `server/dev-issuer/`) and the harness component (`react/harness/`), all in the installed 0.4.0 dist.

## Verified in a local Space

Part 2 of the quickstart is checked in a local Space from the sibling `vector-spaces` repo, through the user interface. Three checks are recorded.

- Publishing the agent of a new space (Add the publish agent step).
- The Organization admin route to that publish: **Settings**, **Organization**, **Spaces**, then the space. After it, an Edit member sees the space in the switcher.
- Sharing the app at View level, so an organization member opens the page and sees `hello:view` (spec).

Labels and toasts drift with the Space UI.

## Not yet verified

- The Space-side behaviour listed in the [app definition](../docs/sdk/app-definition.md) page is a statement of the Space documentation, not an observation.
- No page has run against a hosted Space.

## The record of work

Source paths are in the sibling `vector-spaces` repo, under `docs/`. The page is `docs/vector-space/the-record-of-work.md`. Claim-level sources are in the "the-record-of-work" part of the build's Why-group outline research. The spec overrides name each kind of record without an umbrella noun, leave out replay and retention figures, and keep the gateway off the page.

| Claim | Rests on |
| --- | --- |
| The record of work is who each execution ran as and what started it. Every execution has one actor: a user, a service account, staff, an app or the platform. A schedule is not an actor. It runs as a person or a service account chosen for it. The page lists the five and never counts the actor arms. | `systems/governance/README.md` (The attribution envelope, `actorRef`), `product/GLOSSARY.md` (Tenancy and people: Actor), `systems/access/README.md` (Service accounts). |
| Four views read the records: Overview (what was spent, run or broken, by source), Health (what is wrong now), Activity (what happened, in time order, with decided asks) and Audit (who changed what: access, what the organization may use, keys). Intelligence is not a fifth view. | `systems/governance/SURFACE.md` (How the planes are read), `systems/governance/AUDIT.md` (What is audited), `systems/governance/README.md` (The planes). |
| The Organization admin reads the whole organization and a space manager reads their own space. Another user's thread is never readable there. A figure that cannot be read shows as missing, never as zero. | `product/OVERVIEW.md` (Who uses it), `systems/governance/SURFACE.md` (How the planes are read). |
| Audit fails closed: a change that cannot be recorded does not happen. Spend records fail open: the call works, that window goes unrecorded and the platform counts what it dropped. The spend cap fails open: a down store admits calls. The page words acts as attested, not as fail open, because an audit act is refused when it cannot be kept (spec row: "the rest fail open" read with this exception). | `systems/governance/README.md` (The planes), `systems/governance/AUDIT.md`, `systems/governance/METERING.md` (The write path fails open), `systems/governance/LIMITS.md` (Refusal must be survivable), `systems/INTELLIGENCE.md` (Posture: per kind, and attested). |
| Spend is an estimate at list price from the rate card and never reconciled against an invoice. A call is priced at the version in force when it started. A call with no price is counted and shown beside the total, never as free. | `systems/AI.md` (The rate card), `systems/governance/METERING.md` (Cost). |
| The spend cap limits estimated spend on model calls per organization per calendar month. The organization reads it and staff set it. The refusal sentence rests on an enforced cap, which is gate row 5 of the Vector Space concepts spec (not checked against production). The sentence stands alone so it can be cut. | `systems/governance/LIMITS.md` (Cost is the unit, the month is the period; Observe before refuse). |
| An act is one thing an app did. Only apps record acts. The platform admits an act when the app is live in the space and the actor is real, and does not vouch for the work. An act has a kind, activity or audit, and the matching view shows it. | `systems/INTELLIGENCE.md` (opening; Posture: per kind, and attested; Where an act is read). |
| Human Time Return is time given back to people, counted in seconds. Staff approve the seconds per unit (the baseline). Only successful acts with an approved baseline are valued, and the unvalued count shows beside the total. An act settles once. It is read in Intelligence apart from spend, it is an estimate and the platform computes no return figure. The page leaves out machine time, saved time and the master's word for the saving as a limit. | `systems/INTELLIGENCE.md` (The credibility rule, Settlement, Where an act is read), `systems/governance/README.md` (The planes). Wording: spec section 3.3, decision 6 of the page outlines. |
| The example is the page's own scenario slice. A chat in the web app as what started the work, the model-call cost and the Organization admin reading Activity rest on the Activity rows above. | `systems/governance/SURFACE.md` (Activity is one list of series and executions). |

## Quickstart

Rows marked "Starter claim" describe the starter repo. The starter's own CI and record sit outside this repo, so the rows name where the claim came from.

| Claim | Rests on |
| --- | --- |
| Starter claim: `shared/` exports TypeScript source through `exports` and needs no build step: `tsx watch`, Vite dev and `tsc --noEmit` per package all work. | Scratch run in ticket 01, Prove shared package works with no build step. |
| Starter claim: tested versions are `typescript` 7.0.2, `vite` 8.3.5, `tsx` 4.23.15 and `@vectoragents/vs-apps` 0.4.0. | Ticket 01 for the first three. Ticket 10, Verify the Part 1 commands and outputs, re-ran `typescript` and `vite` from GitHub Packages. It did not record `tsx`. The SDK pin rests on the pin check of the starter sync, which compares it with the installed version. |
| Starter claim: the SDK pin matches the version installed here, and each `starter` excerpt is a verbatim part of its starter file. | The CI job that runs the starter CLI and checks the pages against each generated project ([ADR 0003](adr/0003-quickstart-runs-create-app-from-github-packages.md)). |
| The Part 1 Checks, `npm ls @vectoragents/vs-apps` and the harness run, and their outputs. | A run of the built starter, Build the starter locally. |
| The token hops in the page diagram: the client fetches `/api/client-config`, sends `apps:ready`, receives `apps:token` over `postMessage`, and sends it as `Authorization: Bearer`. Client and server each verify against `SPACE_JWKS_URL`, and only the server check protects data. | The installed 0.4.0 dist (`browser/app-session/`), Research the token path for the diagram. Space-side facts, such as the host minting the token and the token lifetimes (user 5 minutes, provisioning 2 minutes), come from the sibling `vector-spaces` repo. A local Space run shows the browser and server lines for the same user. |
| The harness needs two changes beyond the harness page's first steps: `ALLOWED_PARENT_ORIGIN` set to the harness origin, and server token verification through `platform.verifier`, which is the dev issuer. While the platform holds a dev issuer, `GET /api/client-config` returns `/api/__dev/jwks.json` as `spaceJwksUrl`. | The 0.4.0 dist (`server/app-platform/options/`, `server/app-platform/client-config/`), and a scratch run on Node 25.9.0 with the 0.2.4 SDK, Research the dev harness against the quickstart code, for the first change. Not run on an LTS release or with 0.4.0. |
| The `client-config` route of the platform returns `tokenIssuer`, which is `vector-space` unless the options set another. That matches the Space issuer and the dev issuer. | The default from the 0.4.0 dist (`server/app-platform/client-config/`), Research the token path for the diagram. The Space issuer value is a statement of the Space code, Decide the auto-apply manifest request. |
| The classic-token claim in Prerequisites. | GitHub Docs, "Working with the npm registry". |
| The share step: the user joins the space first, **Save changes** commits the share, and a View-level share lets an organization member open the page. | [Verified in a local Space](#verified-in-a-local-space). |
| Step 4: Space treats a status outside 200 to 299, no reply within 10 seconds, or a network error on `POST /api/provision` as a failure, and the add fails. | Space code, not observed: `provisionSpace` in `vector-spaces` `apps/server/src/domain/vector-apps/provisioning/services/vector-apps-client.service.ts` fails on `!res.ok`, and its `FETCH_TIMEOUT_MS` is 10 seconds, passed to `edgeFetch` as a write (one attempt, no retry). |

## App definition

| Claim | Rests on |
| --- | --- |
| The flowchart hops: `defineApp` validates on import, `buildManifests` builds the manifest at boot, and the server serves it at the manifest route. | The installed 0.4.0 dist, [Decide the ten-uses list](../.scratch/app-definition-review/issues/04-decide-the-ten-uses-list-against-the-3-phase-lifecycle.md). |
| The SDK does not register handlers from the definition. It acknowledges an unregistered handler as `{ handled: false }` and does not retry it. `buildManifests` sets `eventsUrl` to `<publicBaseUrl>/api/events/<appKey>` unless the definition sets it. | The installed 0.4.0 dist and README, [Decide fixes for defects in the current page](../.scratch/app-definition-review/issues/08-decide-fixes-for-defects-in-the-current-page.md). |
| `createAppPlatform` from `@vectoragents/vs-apps/server` serves the events receiver (`POST /api/events/:appKey`) and holds the handler registry, `platform.connectorEvents`. The Nest adapter wraps both as `ConnectorEventsService`. The connector events guide has no Node.js version yet, so the neutral page states only the `eventsUrl` and that the server answers there. | The installed 0.4.0 dist (`server/app-platform/connector-events/`, `nest/app-platform/connector-events/`) and README "Connector events". |
| `buildManifests` throws on a duplicate `appKey` in the list of definitions. `verifyS2sToken` compares the `appKey` of a token with the app key, with no framework. | The installed 0.4.0 dist (`server/manifests/build-manifests.util.js`, `server/app-auth/app-auth.util.js`). |
| Only `verifyS2sToken` and `verifyEventsToken` compare the `appKey` of a token, with the key of the route that was called. `verifyUserToken` and `verifyProvisioningToken` do not read `appKey`. | The 0.4.0 source (`src/server/app-auth/app-auth.util.ts`), read in `@vectoragents/vs-apps` 0.4.0 at `vector-spaces/packages/apps`. |
| The SDK has no slot check. `createSpaceAi` passes the slot to Space, and Space refuses an undeclared or unset slot. The SDK passes the refusal on as a `SpaceActionError`. | The 0.4.0 source (`src/server/space-ai/space-ai.util.ts`: the TSDoc says an unset slot is refused as a `SpaceActionError`; no code checks the manifest). The refusal itself is Space-side and not observed. |
| A plain `createSpaceS2s` exchange gives an app token with no user. With `userId`, the exchange gives a user token under that member's access, with `viaServer: true`, refused unless the space admits the user. The SDK calls the app token a service token. | The 0.4.0 source (`src/actions/actions.schema.ts`, `s2sExchangeInputSchema` comment; `src/tokens/tokens.schema.ts`, `viaServer`; `README.md`, "service token"). Space's refusal status is Space-side and not observed. |
| `defineApp` does not reject unknown top-level keys. It rejects a malformed page key at import. Duplicate page keys are checked in `buildManifests`, not at import. | The installed 0.4.0 dist (`definitionSchema` is not strict, `appPageSchema` checks the key format, `appManifestSchema` checks duplicates), same ticket. |
| The capability `effect` is a label for whoever grants a capability. Access never reads it: a scoped grant holds exactly the capabilities it names, whatever their `read` or `write` effect. | `BINDINGS.md` (Capabilities and access). |
| Vector Space names each agent catalog entry `<appId>.<id>`, where `appId` is the id of the app registration. | `REGISTRY.md` (Agent catalog and endpoints: "namespaced by `appId`"). The exact form `${appId}.${key}` rests on `agent-catalog-ingest.service.ts` (`syncAppSource`, `buildAppCatalog`: `ns(id)`) and the TSDoc of `appEndpointSchema` in `packages/apps` `manifest/manifest.schema.ts`. Space code, not observed. |

## Reference

| Claim | Rests on |
| --- | --- |
| The `root` and `react` prerequisites pin `zod@3`: a zod 4 schema gives an empty `paramsJsonSchema`. | The SDK depends on `zod ^3.25.76` and converts with `zod-to-json-schema` (`agentActionToCatalogAction`, `agent-catalog/agent-catalog-definitions.util.js`). A zod 4.5.4 schema through that converter gave a draft-07 stub with no `properties`, [research 01, E1](../.scratch/recipes-review/research/01-recipe-claims-vs-sdk.md). |
| The SDK puts an action and a page `description` in the manifest, and the bridge attaches the mounted actions to each successful dispatch. The pages claim nothing about how the Space agent uses them. | The installed 0.4.0 dist (`server/manifests/manifest.util.js`, `agent-catalog/agent-catalog-definitions.util.js`, `browser/app-session/app-session-bridge.util.js`). The Space agent prompt is Space-side and not read, [research 01, E6 and E10](../.scratch/recipes-review/research/01-recipe-claims-vs-sdk.md). |
| `pingManifests` posts `{ appKey, manifestHash }` to `{spaceBaseUrl}/api/apps/manifest-ping`, retries at 0, 5 and 15 seconds, stops on 2xx or 429, and never throws. | The installed 0.4.0 dist (`server/manifests/manifest.util.js`, `types/server/manifests/manifest.util.d.ts`). What Space does with the ping is Space-side and not observed. |

## SDK overview and Platform limits

| Claim | Rests on |
| --- | --- |
| The SDK has nine subpaths: `.`, `server`, `browser`, `nest`, `react`, `react/harness`, `orpc`, `extract` and `conformance`. Each one's purpose and peer package. | The `exports` of the installed `package.json` (0.4.0) and the README table "Subpaths" and "Install". `scripts/sdk-overview.test.mjs` compares the table with `exports`. |
| `server` and `browser` use only Web-standard APIs. `nest`, `extract` and `conformance` need Node.js. The `vs-apps` command runs extraction. | The README of 0.4.0 and its `bin` entry. |
| Access: the package is on GitHub Packages and needs a token with `read:packages`. Pages tell the reader to ask Vector staff, and publish no form, address or promise of availability. | The README "Install" and `publishConfig` of 0.4.0. |
| The connector providers, Meta messaging services, model providers and model capability filters. | `app-config/app-config.constant.ts` in `packages/apps` of `vector-spaces` (0.4.0), exported from the package root as `APP_CONNECTOR_PROVIDERS`, `APP_CONNECTOR_SERVICES`, `APP_AI_PROVIDERS` and `APP_MODEL_CAPABILITIES`. `scripts/platform-limits.test.mjs` compares the tables with the installed exports. |
| A Meta messaging service is read from the `service` field of a connector list entry, `null` for every other provider. `defineApp` does not read it. | `src/actions/actions.schema.ts` (`connectorRegistryEntrySchema`). |
| The modalities `chat`, `vision`, `embed` and `rerank`, and the act measure units `count`, `ms` and `bytes`, all whole numbers. | `appModelSlotSchema` and `appActMeasureSchema` in `manifest/manifest.schema.ts` (the TSDoc on the measure says there is no float unit). |
| A model passes a capability filter unless Vector Space records that it lacks the ability. | The TSDoc of `appModelSlotSchema`. The record itself is Vector Space side and not observed. |
| The first-party Vector Modules are `omnibox` and `contacts`. The SDK takes any non-empty string as a module key. | No SDK source. Vector Space docs `systems/context-hub/MODULES.md` and `product/GLOSSARY.md` (Vector Module), and the `ModuleKey` enum in `packages/types`. `defineApp` accepted an unlisted module key in a run against the installed dist. |

## Guides

| Claim | Rests on |
| --- | --- |
| A slot that no one set answers `409` with `AI_SLOT_NOT_READY`, and a slot key that the manifest does not declare answers `400`. `createSpaceAi` throws a `SpaceActionError` that carries the status. | Space code, not observed: `app-s2s-exchange.service.ts` in `vector-spaces` `apps/server/src/domain/vector-apps/backchannel/services/`, [ticket 21, Comments](../.scratch/recipes-review/issues/21-guide-pair-call-a-model-from-your-server.md). The `SpaceActionError` status rests on the installed 0.4.0 dist. No call to a live Space was run. |
| A production Vector Space publishes no gateway address to apps, so the exchange of a model ticket answers `503`. A local stack runs the gateway. | `PROTOCOL.md` (The gateway ticket) and `systems/AI.md` (The gateway: "No environment publishes it to apps: the app-facing address (`AI_GW_SVC_APP_URL`) is set nowhere"), checked at `vector-spaces` commit `cb4c39e10`. No call to a live Space was run. |
| The `409` and `400` statuses of a model call are Space's answers. The SDK source does not raise them. | `README.md` of 0.4.0 and Space code (`app-s2s-exchange.service.ts`, as in the row above), not the SDK source. No call to a live Space was run. |
| The platform reuses a model ticket until one minute before `expiresAt`, for one space, slot, run and trace. | The 0.4.0 source (`src/server/space-ai/space-ai.util.ts`: the cache key is `spaceId:slot:runSpanId:traceId`, `refreshAt = expiresAt * 1000 - 60_000`). |
| Space delivers each connector event at least once, up to three times. | Space code, not observed: the connector event dispatch queue takes the shared job defaults (`attempts: 3`, exponential back-off) in `packages/core/src/kernel/messaging/queues/constants/queue-defaults.constant.ts`, and the redrive service in `vector-spaces` `domain/context-hub/connectors/webhooks/redrive/` names a "three-attempt backoff". [Ticket 19, Comments](../.scratch/recipes-review/issues/19-nest-guide-handle-connector-events.md) records that event routing is not run end to end. |
| The A2A route answers `401` for a missing, invalid or wrong-scope token, and `403` for a token that names another space or app. | The installed 0.4.0 dist (`verifyS2sToken` in `server/app-auth/app-auth.util.js`). The check is [ticket 22, Comments](../.scratch/recipes-review/issues/22-guide-expose-app-as-a2a-agent.md). The `401` with no token is the only status the guide asks the reader to observe. |
| Space creates a service secret for each pair of app and space and pushes it in the body of `POST /api/provision`, where the starter route drops it. | Space code, not observed: `provisionSpace` in `vector-spaces` `apps/server/src/domain/vector-apps/provisioning/services/vector-apps-client.service.ts` posts `{ serviceSecret }` under a provisioning token. The starter behaviour rests on [ticket 21, Comments](../.scratch/recipes-review/issues/21-guide-pair-call-a-model-from-your-server.md) and [ticket 20, Comments](../.scratch/recipes-review/issues/20-guide-pair-call-space-from-your-server.md). |

## How a Vector App works

Source paths are in the sibling `vector-spaces` repo, under `docs/systems/apps/` unless noted. The product docs hold no `APPS.md`, so `README.md` of that folder and the glossary stand in for it.

| Claim | Rests on |
| --- | --- |
| An app is a web app on its own origin that a space embeds in an iframe, and the parts and token lines of the diagram: user token to the client, client to server, server to Vector Space with an app token, Vector Space reads the manifest with a provisioning token. | `README.md` (the model), `PROTOCOL.md` (Tokens, Embed protocol) and the SDK README of 0.4.0 ("What a Vector App is", "Serve the manifest"). The SDK README calls the app token a service token. |
| Staff register an app from its manifest URL after a preview. Registering binds nothing. | `REGISTRY.md` (Registration and refresh). |
| Activate checks the organization licence, pushes the service secret, and on any failure tells the app to deprovision, so the activation fails and can be retried. | `BINDINGS.md` (Binding lifecycle). |
| A new app has no access level. A missing required slot marks the binding as needing setup without blocking the attach. | `BINDINGS.md` (Capabilities and access, Resources and runtime config). |
| A manifest that differs is held for staff unless auto-apply is on for that registration (default off). A change that reaches past the app always waits. Each applied manifest brings active bindings in line. There is no host-side rollback. | `REGISTRY.md` (Registration and refresh), `BINDINGS.md` (Reconcile). |
| Deprovision notifies the app on a best-effort basis, removes its A2A agents and MCP connectors, and a deleted space deprovisions every binding. The app can be added again. | `BINDINGS.md` (Binding lifecycle). |
| The six token kinds and their default lifetimes: user 5, provisioning 2, A2A 5, MCP 5, actions (the app token) 10, events 5 minutes. | `PROTOCOL.md` (Tokens), `apps/server/src/domain/auth/app-tokens/app-token.config.ts` (the `APP_*_TOKEN_TTL` defaults, set per environment) and the SDK README "Tokens and JWKS". The user token identifies the member and the space and lists the capabilities they hold. |
| Only the user token that the host posts to the client carries the name and picture of the member. The user token for an agent's call to an endpoint and the on-behalf user token carry neither. | `PROTOCOL.md` (Tokens: User token, On-behalf user token). |
| Diagram style: true 30 degree isometric, three face tones, `plug` the one accent, position and badge as the signals besides colour, a visible legend with the SVG `title` and `desc`. | This repo's own decision, in `src/diagrams/isoLayout.ts` and the `--iso-*` tokens of `src/css/custom.css`. |
| In forced colors Chromium keeps SVG fill and stroke from author CSS, so the page sets system colours for the diagram. SVG `title`, `desc` and `text` are indexed by the search plugin as part of the section. | Checked in Edge with forced-colors emulation, and by reading `search-index.json` of a build. `scripts/build-check/iso-diagram.test.mjs` pins the second. |

## Why Vector Space

Source paths are in the sibling `vector-spaces` repo, under `docs/`. The product docs hold no `APPS.md`, so `product/OVERVIEW.md` and `product/GLOSSARY.md` are the sources.

| Claim | Rests on |
| --- | --- |
| Vector Space is where the people and AI agents of an organization work on the organization's own data, in spaces. Each run follows the access rules of the organization, is paid through its own AI provider accounts and records who it ran as. | `product/OVERVIEW.md` ("What it is"). |
| The three platform rules: one access model, one AI gateway, one record of work. The page words the access rule as roles, shares, blocks and conditions, which is the product's "roles, shares, blocks and Conditions". | `product/OVERVIEW.md` ("What holds it together"). |
| An organization is the tenant. A space is the unit of work, binds one orchestrator agent, and resolves access inside it for each member and action. | `product/OVERVIEW.md` ("How it fits"), `product/GLOSSARY.md` (Organization, Space, Agent). |

## Organizations and spaces

Source paths are in the sibling `vector-spaces` repo, under `docs/`. The page is `docs/vector-space/organizations-and-spaces.md`.

| Claim | Rests on |
| --- | --- |
| An organization is the tenant. Every user, API key, resource and space belongs to one. A space is the unit of work and holds one orchestrator agent, resources, members and groups, pages, and the apps and Vector Modules turned on for it. | `product/OVERVIEW.md` ("How it fits"), `product/GLOSSARY.md` (Tenancy and people: Organization; Spaces and content: Space). |
| Each organization has one Organization admin, who a transfer passes to another live member. The admin is a space manager of every space. | `product/GLOSSARY.md` (Tenancy and people: Organization admin), `systems/access/README.md` (Organization admin and space managers). |
| AI provider accounts belong to the organization and pay for its model calls. An account reaches every space by default and can be limited to chosen spaces. The page therefore says each resource belongs to one space and never that spaces share nothing. | `product/OVERVIEW.md` ("What it is"), `systems/AI.md` (Data model, invariant 2: an all-spaces account is the default, a scoped account reaches the spaces with a grant row), `systems/credentials/README.md` (Core primitives: one credential can back resources in more than one space). |
| A resource is owned by one space. No share reaches a resource of another space. An agent moves only within its space. | `systems/access/RESOURCES.md` (Resources), `systems/access/README.md` (The pool and tenancy), `systems/STUDIO.md` (The agent tree). |
| Access is worked out inside a space, for each member and operation. Only users of the organization, service accounts included, join its spaces. Membership alone reaches what General access gives. | `product/OVERVIEW.md` ("How it fits"), `systems/access/README.md` (Spaces), `product/GLOSSARY.md` (Access: Member). |
| A space manager manages the members, groups, shares, resources, agent and apps of the space. | `product/OVERVIEW.md` (Who uses it), `systems/access/README.md` (Organization admin and space managers). |
| Left out on purpose: distributors, customers, licences and space deletion (administrative, not concepts), and who creates a space (`who-can-do-what`). | `systems/access/README.md` (The pool and tenancy), `systems/SPACES.md` (Provisioning and deletion). |
| The example is the page's own scenario slice. It states no fact beyond the rows above. | Spec of the Vector Space concepts, section 3.2. |

## Why Vector Apps

Source paths are in the sibling `vector-spaces` repo, under `docs/`. The product docs hold no `APPS.md`: `systems/apps/README.md`, `BINDINGS.md`, `REGISTRY.md` and `PROTOCOL.md` stand in for it, with `product/OVERVIEW.md` and `product/GLOSSARY.md`.

| Claim | Rests on |
| --- | --- |
| An app is a web app on its own origin that a space embeds in an iframe. The reader writes a client, a server and a manifest, and the server decides who may do what. | `product/GLOSSARY.md` (App), `systems/apps/README.md` (the model), `PROTOCOL.md` (Embed protocol) and the SDK README of 0.4.0 ("What a Vector App is"). |
| A space has three ways to plug in code: an app, an A2A agent and an MCP server. An A2A agent is a remote agent the space agent delegates to. An MCP server is a remote set of tools. | `product/OVERVIEW.md` (the Apps layer, "Machines"), `systems/STUDIO.md` (Transport: an A2A leaf is a remote agent card). The three-way split is the page's own framing, as the product docs describe the surfaces and not a choice between them. |
| An app can offer its own A2A agent and MCP server. Vector Space adds them to the space when the app is activated, and removes them on deprovision. | `systems/apps/PROTOCOL.md` (A2A and MCP exposure), `BINDINGS.md` (Binding lifecycle). |
| A space gives an app member identity: the user token identifies the member and the space and lists the capabilities the member holds. Only the host token carries the name and picture of the member. | `PROTOCOL.md` (Tokens, User token). The concept pages say "identifies". Only [How a Vector App works](../docs/vector-apps/how-a-vector-app-works.md) says which token carries the name and picture. |
| A space gives an app platform data: the resources a space manager attaches, reached only where the app is allowed them and the member may open them. | `BINDINGS.md` (Resources and runtime config, Invariants), `README.md` (Invariants: an app token reaches its pinned space alone). |
| A space gives an app governed model access: a model slot that a space manager sets, a ticket for the AI gateway on the organization's own AI accounts, and no AI provider key in the app. A production Vector Space publishes no gateway address to apps and refuses the request with `503`; a local stack runs the gateway. | `PROTOCOL.md` (The gateway ticket: the app chooses no model, the set model is the grant; an environment that publishes no gateway address answers 503), `systems/AI.md` (The gateway: "Dev runs the gateway; prod does not"), `product/OVERVIEW.md` ("One AI gateway"). |
| An app declares acts and approvals. An approval is an ask, shown to the person who decides. | `product/GLOSSARY.md` (Act, Ask), `systems/COMMAND-CENTER.md` (App asks). |

## Choose your path

The three columns and seven rows are this repo's own comparison. The product docs describe the surfaces and not a choice between them. Each cell rests on the sources below.

| Claim | Rests on |
| --- | --- |
| Vector App cells: app pages and agent catalog entries in the space; staff register, a space manager activates and configures; the user token identifies the member; allowed resources and the member list; model slot; approvals and acts. | `systems/apps/REGISTRY.md` (Registration and refresh, Agent catalog and endpoints), `BINDINGS.md` (Binding lifecycle, Resources and runtime config, User directory), `PROTOCOL.md` (Tokens). |
| A2A agent cells: an A2A agent joins the agent tree as a sub-agent the space agent delegates to, and its remote owns its prompt, model and retrieval. | `systems/STUDIO.md` (Transport, A2A leaf, the agent tree). |
| MCP server cell "Shows up as": a connector in the resource pool. | `systems/apps/PROTOCOL.md` (A2A and MCP exposure: an app-exposed MCP server is an ordinary `CONNECTOR` pool resource), `product/GLOSSARY.md` (Connector, Resource). |
| "No" for the member, platform data and approvals and acts on the A2A agent and MCP server columns, "Who sets it up" for both, and "Your own" for model calls. | Not observed in the product docs, which describe only the app-exposed variants. `systems/STUDIO.md` (the outbound A2A client closes over a credential of the organization) fits the "No" for the member. A standalone MCP connector can need a platform approval for a write operation (`systems/COMMAND-CENTER.md`), which is why the row says app approvals and acts. |
| The aside line links the guide Call Vector Space from your server for a caller outside Vector Space. | `docs/vector-apps/guides/call-space-from-your-server.md` and its provenance rows. |
| An app gets the member, the data of the space and model calls through Vector Space. The page says what an app gets and never that an app is the only way. | "Only" is a product claim that can change. |
| Closed lists are linked, never copied. | [Platform limits](../docs/sdk/reference/platform-limits.md). |

## Agents in a space

Source paths are in the sibling `vector-spaces` repo, under `docs/`. Claim-level sources are in the "Page 4: `agents-in-a-space`" part of the build's outline research. The spec overrides drop "What an agent can reach" and "Where agents are set up", and name no depth.

| Claim | Rests on |
| --- | --- |
| An agent is a configured model with instructions, tools and resources. Each space has exactly one orchestrator agent, created with the space. An organization has none. The member's request goes to it, and it hands parts to other agents. | `product/GLOSSARY.md` (Agents and runs: Agent), `systems/STUDIO.md` (The agent tree), `systems/runs/DELEGATION.md` (Levels), `systems/access/README.md` (Spaces). |
| Agent Studio is where a person who manages agents sets up an agent. The page lists instructions and evaluations only. | `product/OVERVIEW.md` (The product's layers), `systems/STUDIO.md` (Draft, versions and publish). |
| The orchestrator agent gives the member one reply: only its output reaches the user. | `systems/STUDIO.md` (output reaches the user only through the orchestrator). |
| The tree: the orchestrator agent is the root, a configured agent can have child agents (the master says "sub-agent"), only agents built into the space have children, and an agent moves only within its space. The page names no depth, no level numbers and no limits, because `STUDIO.md` states no depth and `DELEGATION.md` numbers the levels inconsistently. | `systems/STUDIO.md` (The agent tree), `systems/runs/DELEGATION.md` (Levels). |
| Leaves: a remote A2A agent whose owner controls its prompt, model and retrieval, which an app can offer; and a short-lived helper (the master's "subagent") that an agent starts for one task, which has no children and is retired when it finishes. | `systems/STUDIO.md` (The agent tree, Vocabulary: A2A leaf), `systems/runs/DELEGATION.md` (Levels). |
| A connector is a resource an agent uses, not an agent it delegates to. | `systems/runs/DELEGATION.md` (Levels). |
| A thread is one conversation with one agent, owned by one user, and no one else reads it, administrators included. Others get "not found". | `systems/runs/README.md` (Threads, instances, turns and runs), `systems/access/RUNTIME.md` (Threads), `product/GLOSSARY.md` (Thread). |
| A run is one execution of one agent in a thread and closes when it ends. A delegated agent has a run of its own: inferred from the same sections, as no master sentence says it in these words. The page avoids "turn". | `systems/runs/README.md` (Threads, instances, turns and runs), `product/GLOSSARY.md` (Run). |
| Each agent sees only what the member may see: an agent's reach is the space's resources narrowed to the person it works for. | `systems/access/RESOURCES.md` (Agent scope), `systems/access/RUNTIME.md` (Run identity: a chat in the web app runs as the thread's owner). The page states the web chat case only. |

## One access model

Source paths are in the sibling `vector-spaces` repo, under `docs/`. Claim-level sources are in the "2. one-access-model" part of the Why group's outline research. The spec overrides drop "People who skip the check" and "What the check does not decide", name no step order, and keep the API-key variant of the example as a separate closing paragraph (gate row 6).

| Claim | Rests on |
| --- | --- |
| Access is the result of one check that runs for each operation on a resource, and the same check answers it whatever the way in (UI, API, agents, apps). | `product/GLOSSARY.md` (Access, Share and General access: Access), `product/OVERVIEW.md` (What holds it together), `systems/access/README.md` (The access primitive). |
| The check reads General access (Restricted, Can use or Can edit), shares (one user, group or app, one role), blocks (deny one user or group on one resource) and Conditions (limit the rows an allowed operation touches). A share of a group reaches every user the group holds. | `systems/access/README.md` (The access primitive, Conditions), `systems/access/RESOURCES.md` (General access, Blocks), `product/GLOSSARY.md` (Access: Share, Subject). |
| A Restricted resource reaches only its owner and the users and groups that a share names, and no Organization admin, space manager or staff rank reaches it unless a share names them. | `systems/access/RESOURCES.md` (General access). |
| "What wins", never a numbered order: General access and shares add up, a block wins whatever gave the access, a Condition narrows what is left and nothing widens past it. The master gives a formula, and its only fixed order is that Conditions run last. | `systems/access/README.md` (The access primitive: "a block wins regardless of source"; Conditions). |
| Conditions apply to datasources and connectors only. On a datasource a Condition becomes a row filter in every query. On a connector it guards the call's arguments and the response is not filtered afterwards. | `systems/access/README.md` (Conditions), `systems/access/RUNTIME.md` (Runtime gating, Datasource enforcement). |
| The rules are the same for every way in and the subject differs: a web chat runs as the thread's owner, a personal token as its owner, a service-account key as that account. | `systems/access/RUNTIME.md` (Run identity), `product/GLOSSARY.md` (Tenancy and people). |
| An agent reaches what its person reaches, and the agent's own scope narrows that and never grants. | `systems/access/RESOURCES.md` (Agent scope), `systems/access/RUNTIME.md` (Runtime gating). |
| A Vector App reaches only the overlap of its own shares and the person's access. A capability grant is a share on named capabilities of a Vector App at Can use. | `systems/apps/BINDINGS.md` (Capabilities and access, Invariants). Spec decision 7 of the outline ticket replaces ticket 17's "not a share". |
| An approval is a second check and never grants access. | `systems/COMMAND-CENTER.md` (Deciding). |
| Example: a Condition on a group limits a datasource to EU rows, and the member gets the same rows in an app and through the orchestrator agent. The API-key paragraph rests on the general claim only and is cut if gate row 6 fails. | `systems/access/RUNTIME.md` (Runtime gating, Datasource enforcement), `systems/access/README.md` (Conditions), `product/OVERVIEW.md` (What holds it together). |

## Entry page

Source paths are in the sibling `vector-spaces` repo, under `docs/`. The product docs hold no `APPS.md`: `product/OVERVIEW.md` and `product/GLOSSARY.md` are the sources, with `systems/apps/README.md` for apps.

| Claim | Rests on |
| --- | --- |
| Vector Space is the platform where the people and AI agents of an organization work together in spaces. | `product/OVERVIEW.md` ("What it is"). The page words it as in [Why Vector Space](../docs/vector-space/why-vector-space.md). |
| A Vector App adds your own pages and agent actions to a space. | `product/GLOSSARY.md` (App), `systems/apps/README.md` (the model), `systems/apps/REGISTRY.md` (the manifest lists pages and agent catalog entries). |
| The vs-apps SDK is the TypeScript package you build apps with. | The README of `@vectoragents/vs-apps` 0.4.0. |
| The three cards, Understand, Build and Look up, only link pages that other rows here already source. | The links of the entry page. |

## How work moves through a space

Source paths are in the sibling `vector-spaces` repo, under `docs/`. Claim-level sources are in the "1. `how-work-moves-through-a-space`" part of the How group's outline research. The spec overrides: one H2 per step with no Example H2, the box is named "Connectors", the page does not name Can edit on contacts, it does not say that each further lead raises an ask, and the actors are Member for steps 1, 4, 5 and 6 and App for steps 2 and 3. The agent is not an actor.

| Claim | Rests on |
| --- | --- |
| A member asks the space's one orchestrator agent in a thread. The run works as the thread's owner, the member, and each call is decided for that member. | `systems/STUDIO.md` (The agent tree), `product/GLOSSARY.md` (Agents and runs), `systems/access/RUNTIME.md` (Run identity, Runtime gating). |
| The agent reaches the app only if the member reaches it. | `systems/apps/BINDINGS.md` (Capabilities and access: One reach rule; Invariants). |
| Finding leads is a read action, so it raises no ask. An app endpoint call asks unless the request is a GET, so the page names the action a read (gate row 14). | `systems/apps/REGISTRY.md` (Agent catalog and endpoints), `systems/COMMAND-CENTER.md` (The ask). |
| The app uses Apollo, Exa and BrightData as the space's Connectors. BrightData is a user statement, not a provider on main (gate row 2). | User statement. `systems/context-hub/CALLS.md` for the connector call record. |
| The app records "lead qualified" as an act for each lead. Only apps record acts. | `systems/INTELLIGENCE.md` (lead paragraph; Admission; The manifest is the act vocabulary). |
| The app saves each lead as a contact in the contacts Vector Module (gate row 10: the step stays by user decision). The page does not name the access on contacts. | `systems/context-hub/MODULES.md` (Consumption: agents, apps, client; The contacts module). |
| The agent drafts the email from the contacts. The model call goes through the AI gateway, the one route for every paid model call (gate row 7). | `systems/context-hub/MODULES.md` (Consumption: agents, apps, client), `systems/AI.md` (The gateway). |
| Sending is a write, and sends through the Omnibox need approval by default. The run stops and an ask appears in the Command Center. | `systems/context-hub/MODULES.md` (The omnibox module), `systems/COMMAND-CENTER.md` (The ask; Grants: The default, and what loosens it; Raised and resolved). |
| The member who asked decides, because a person answers for their own run. After approval the run resumes as the same actor, and an approval is a second check and never gives access. | `systems/COMMAND-CENTER.md` (The audience; Deciding). |
| The email goes out through the Omnibox as the member. The app records no act for the send (user decision, ticket 18). | `systems/context-hub/MODULES.md` (Access & visibility; The omnibox module), `systems/COMMAND-CENTER.md` (Deciding), `systems/access/RUNTIME.md` (Run identity). |
| The record names an actor per step: Member for 1, 4, 5 and 6, App for 2 and 3. The actor kind of an app's connector call is not stated in the docs (gate rows 3 and 9). The agent is not an actor: the master has six actor arms. | `systems/governance/README.md` (The attribution envelope; `actorRef`: one grammar over six arms), `systems/governance/EXECUTION.md` (The record), `systems/INTELLIGENCE.md` (Admission). |
