# Provenance

What each claim in these docs rests on. A ticket or spec named below without a link rests on a `.scratch/` folder that no longer exists, so the claim cannot be traced further.

The sections below follow the page folders: Why Vector Space and Vector Space at a glance are under `docs/vector-space/`. Quickstart, Guides, How a Vector App works and Why Vector Apps are under `docs/vector-apps/`. App definition, Reference, SDK overview and Choose your path are under `docs/sdk/`.

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
| resource pool | Pool | Vector Space lists it under Context Hub as **Resources**. |
| knowledge source | Source | Vector Space shows knowledge sources in the settings of an app. |
| space page | Page (`pages.pages`) | A grid of widgets. `app page` names the SDK `pages[]` entry. |
| capability grant | Grant | The noun only. The product grant is a standing approval, a different thing. |
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
| Access: the package is on GitHub Packages and needs a token with `read:packages`. Pages tell the reader to ask Vector staff, and publish no form, address or promise of availability. | The README "Install" and `publishConfig` of 0.4.0, the audience decision in `.scratch/hub-structure/issues/10-hub-audience-and-visibility.md`, and [the 0.4.0 SDK research](../.scratch/sdk-coverage/research/01-sdk-surface-for-manifest-and-security.md). |
| The connector providers, Meta messaging services, model providers and model capability filters. | `app-config/app-config.constant.ts` in `packages/apps` of `vector-spaces` (0.4.0), exported from the package root as `APP_CONNECTOR_PROVIDERS`, `APP_CONNECTOR_SERVICES`, `APP_AI_PROVIDERS` and `APP_MODEL_CAPABILITIES`. `scripts/platform-limits.test.mjs` compares the tables with the installed exports. |
| A Meta messaging service is read from the `service` field of a connector list entry, `null` for every other provider. `defineApp` does not read it. | `src/actions/actions.schema.ts` (`connectorRegistryEntrySchema`). |
| The modalities `chat`, `vision`, `embed` and `rerank`, and the act measure units `count`, `ms` and `bytes`, all whole numbers. | `appModelSlotSchema` and `appActMeasureSchema` in `manifest/manifest.schema.ts` (the TSDoc on the measure says there is no float unit). |
| A model passes a capability filter unless Vector Space records that it lacks the ability. | The TSDoc of `appModelSlotSchema`. The record itself is Vector Space side and not observed. |
| The first-party Vector Modules are `omnibox` and `contacts`. The SDK takes any non-empty string as a module key. | No SDK source. Vector Space docs `systems/context-hub/MODULES.md` and `product/GLOSSARY.md` (Vector Module), and the `ModuleKey` enum in `packages/types`. `defineApp` accepted an unlisted module key in a run against the installed dist. |

## Guides

| Claim | Rests on |
| --- | --- |
| A slot that no one set answers `409` with `AI_SLOT_NOT_READY`, and a slot key that the manifest does not declare answers `400`. `createSpaceAi` throws a `SpaceActionError` that carries the status. | Space code, not observed: `app-s2s-exchange.service.ts` in `vector-spaces` `apps/server/src/domain/vector-apps/backchannel/services/`, [ticket 21, Comments](../.scratch/recipes-review/issues/21-guide-pair-call-a-model-from-your-server.md). The `SpaceActionError` status rests on the installed 0.4.0 dist. No call to a live Space was run. |
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
| A manifest that differs is held for staff unless auto-apply is on for that registration (default off). A change that reaches past the app always waits. Each applied manifest brings active bindings in line. There is no host-side rollback. | `REGISTRY.md` (Registration and refresh), `BINDINGS.md` (Reconcile). The page leaves out the "dev only" claim for auto-apply. |
| Deprovision notifies the app on a best-effort basis, removes its A2A agents and MCP connectors, and a deleted space deprovisions every binding. The app can be added again. | `BINDINGS.md` (Binding lifecycle). |
| The six token kinds and their default lifetimes: user 5, provisioning 2, A2A 5, MCP 5, actions (the app token) 10, events 5 minutes. | `PROTOCOL.md` (Tokens), `apps/server/src/domain/auth/app-tokens/app-token.config.ts` (the `APP_*_TOKEN_TTL` defaults, set per environment) and the SDK README "Tokens and JWKS". The user token identifies the member and the space and lists the capabilities they hold. |
| Diagram style: true 30 degree isometric, three face tones, `plug` the one accent, position and badge as the signals besides colour, a visible legend with the SVG `title` and `desc`. | Spec section 7 and the diagram tickets of the hub structure map, with no link. The palette is the one of the variant A prototype. |
| In forced colors Chromium keeps SVG fill and stroke from author CSS, so the page sets system colours for the diagram. SVG `title`, `desc` and `text` are indexed by the search plugin as part of the section. | Checked in Edge with forced-colors emulation, and by reading `search-index.json` of a build. `scripts/build-check/iso-diagram.test.mjs` pins the second. |
| No placeholder example app (Hiring, SDR, CSR) and no Vector Module name appears in the diagram or the page. | The two examples `sdr` and `csr` exist as SDK example definitions in `src/examples/`. A Hiring app appears only in the SDK README. The product knows two Vector Modules, `omnibox` and `contacts` (`product/GLOSSARY.md`), not a calendar. |

## Why Vector Space and Vector Space at a glance

Source paths are in the sibling `vector-spaces` repo, under `docs/`. The product docs hold no `APPS.md`, so `product/OVERVIEW.md` and `product/GLOSSARY.md` are the sources.

| Claim | Rests on |
| --- | --- |
| Vector Space is where the people and AI agents of an organization work on the organization's own data, in spaces. Each run follows the access rules of the organization, is paid through its own AI provider accounts and records who it ran as. | `product/OVERVIEW.md` ("What it is"). |
| The three platform rules: one access model, one AI gateway, one record of work. The page words the access rule as roles, shares, blocks and conditions, which is the product's "roles, shares, blocks and Conditions". | `product/OVERVIEW.md` ("What holds it together"). |
| An organization is the tenant. A space is the unit of work, binds one orchestrator agent, and resolves access inside it for each member and action. | `product/OVERVIEW.md` ("How it fits"), `product/GLOSSARY.md` (Organization, Space, Agent). |
| The diagram parts: orchestrator agent, resource pool, members, space pages, Command Center, Vector Apps, with an A2A agent and an MCP connector outside. A space page is a grid of widgets and documents. The Command Center holds what an agent or app waits on a person for. | `product/OVERVIEW.md` ("The product's layers"), `product/GLOSSARY.md` (Page, Widget, Document, Agent, Ask). The picture is variant A of the hub structure map prototype, with the Calendar module and the example apps of the prototype left out. |
| An MCP connector is an MCP server bound into a space. An A2A agent is a remote agent that the orchestrator agent delegates to. | `product/GLOSSARY.md` (Provider, Connector), `systems/STUDIO.md` (Transport: an A2A leaf is a remote agent card). The pages name both as interfaces and have no page for either. |
| Governance shows what ran, as whom, what it cost and what it was allowed to spend. An Organization admin reads it across the organization. | `product/OVERVIEW.md` (the Governance layer, "Who uses it"). |
| A Vector Module is a first-party product over connector data, activated on a space next to its apps. The page names no module and links the Platform limits table. | `product/GLOSSARY.md` (Vector Module). The product knows two modules, `omnibox` and `contacts`, not three and not a calendar, so the three names of the prototype were dropped. |
| The roles: members, an Organization admin (one per organization, every one a space manager), space managers (Edit level), staff (tenancy, the credential vault and the app registry) and machines (API keys, A2A and channels, as a user or a service account). | `product/OVERVIEW.md` ("Who uses it"), `product/GLOSSARY.md` (Organization admin, Service account, Staff). |
| The page names no resource tiers. | The hub structure spec lists "resource tiers" for the picture, but no product doc names tiers of resources. The resource pool is one list. |

## Why Vector Apps

Source paths are in the sibling `vector-spaces` repo, under `docs/`. The product docs hold no `APPS.md`: `systems/apps/README.md`, `BINDINGS.md`, `REGISTRY.md` and `PROTOCOL.md` stand in for it, with `product/OVERVIEW.md` and `product/GLOSSARY.md`.

| Claim | Rests on |
| --- | --- |
| An app is a web app on its own origin that a space embeds in an iframe. The reader writes a client, a server and a manifest, and the server decides who may do what. | `product/GLOSSARY.md` (App), `systems/apps/README.md` (the model), `PROTOCOL.md` (Embed protocol) and the SDK README of 0.4.0 ("What a Vector App is"). |
| A space has three ways to plug in code: an app, an A2A agent and an MCP server. An A2A agent is a remote agent the space agent delegates to. An MCP server is a remote set of tools. | `product/OVERVIEW.md` (the Apps layer, "Machines"), `systems/STUDIO.md` (Transport: an A2A leaf is a remote agent card). The three-way split is the page's own framing, as the product docs describe the surfaces and not a choice between them. |
| An app can offer its own A2A agent and MCP server. Vector Space adds them to the space when the app is activated, and removes them on deprovision. | `systems/apps/PROTOCOL.md` (A2A and MCP exposure), `BINDINGS.md` (Binding lifecycle). |
| A space gives an app member identity: the user token identifies the member and the space and lists the capabilities the member holds. Only the host token carries the name and picture of the member. | `PROTOCOL.md` (Tokens, User token). The page says "identifies", never "names". |
| A space gives an app platform data: the resources a space manager attaches, reached only where the app is allowed them and the member may open them. | `BINDINGS.md` (Resources and runtime config, Invariants), `README.md` (Invariants: an app token reaches its pinned space alone). |
| A space gives an app governed model access: a model slot that a space manager sets, a call through the AI gateway on the organization's own AI accounts, and no AI provider key in the app. | `PROTOCOL.md` (The gateway ticket: the app chooses no model, the set model is the grant), `product/OVERVIEW.md` ("One AI gateway"). |
| An app declares acts and approvals. An approval is an ask, shown to the person who decides. | `product/GLOSSARY.md` (Act, Ask), `systems/COMMAND-CENTER.md` (App asks). |
| The page leaves out the "what makes a good app" and "not for a public product" advice of the Partner Guide. | Spec section 4 of the hub structure map. The product docs state neither (research 01, claims 3.2 and 3.3). |

## Choose your path

The three columns and seven rows are this repo's own comparison. The product docs describe the surfaces and not a choice between them (Partner Guide check, claims 2.1 to 2.11). Each cell rests on the sources below. The page has no Effort row.

| Claim | Rests on |
| --- | --- |
| Vector App cells: app pages and agent catalog entries in the space; staff register, a space manager activates and configures; the user token identifies the member; allowed resources and the member list; model slot; approvals and acts. | `systems/apps/REGISTRY.md` (Registration and refresh, Agent catalog and endpoints), `BINDINGS.md` (Binding lifecycle, Resources and runtime config, User directory), `PROTOCOL.md` (Tokens). |
| A2A agent cells: an A2A agent joins the agent tree as a sub-agent the space agent delegates to, and its remote owns its prompt, model and retrieval. | `systems/STUDIO.md` (Transport, A2A leaf, the agent tree). |
| MCP server cell "Shows up as": a connector in the resource pool. | `systems/apps/PROTOCOL.md` (A2A and MCP exposure: an app-exposed MCP server is an ordinary `CONNECTOR` pool resource), `product/GLOSSARY.md` (Connector, Resource). |
| "No" for the member, platform data and approvals and acts on the A2A agent and MCP server columns, "Who sets it up" for both, and "Your own" for model calls. | The Partner Guide cells. Not observed in the product docs, which describe only the app-exposed variants (research 01, claims 2.6, 2.7 and 3.2). `systems/STUDIO.md` (the outbound A2A client closes over a credential of the organization) fits the "No" for the member. A standalone MCP connector can need a platform approval for a write operation (`systems/COMMAND-CENTER.md`), which is why the row says app approvals and acts. |
| The aside line links the guide Call Vector Space from your server for a caller outside Vector Space. | `docs/vector-apps/guides/call-space-from-your-server.md` and its provenance rows. Spec section 4 decided on one aside line, with no "Calling a space" column. |
| An app gets the member, the data of the space and model calls through Vector Space. The page says what an app gets and never that an app is the only way. | Research 01, claim 2.11: "only" is a product claim that can change. |
| Closed lists are linked, never copied. | [Platform limits](../docs/sdk/reference/platform-limits.md). |
