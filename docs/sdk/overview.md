---
title: SDK overview
description: The nine import paths of the `@vectoragents/vs-apps` package, the dev harness and how to get access.
---

`@vectoragents/vs-apps` is the [SDK](../sdk/glossary.md#sdk) for building an app that runs in [Vector Space](../vector-space/glossary.md#vector-space). It holds the [app definition](../sdk/glossary.md#app-definition), server and browser runtimes, bindings for React, Nest.js and oRPC, build tools, a test kit and a local dev harness. Your code reaches each part through its own import path.

You write an app definition with `defineApp`, which you import from the package root: `import { defineApp } from '@vectoragents/vs-apps'`.

## Subpaths

The package has nine import paths, called subpaths. The root path holds the definition and the shared schemas. Each other subpath holds one runtime or binding.

| Import | What it is for | Reference |
| --- | --- | --- |
| `@vectoragents/vs-apps` | The app definition, shared schemas and the agent action registry. | [Root](./reference/root.md) |
| `@vectoragents/vs-apps/server` | The app platform, [manifests](../vector-apps/glossary.md#manifest), token checks and the routes Vector Space calls. | [Server](./reference/server.md) |
| `@vectoragents/vs-apps/browser` | The browser runtime: the embed session, the iframe bridge and the boot configuration loader. | [Browser](./reference/browser.md) |
| `@vectoragents/vs-apps/nest` | A Nest.js module, guards, decorators and services for the app platform. | [Guides](/vector-apps/category/guides) |
| `@vectoragents/vs-apps/react` | `AppProvider`, `useApp`, `BootGate`, `RequirePermission`, `useAgentAction` and `useUsers`. | [React](./reference/react.md) |
| `@vectoragents/vs-apps/react/harness` | `VectorAppsHarness`, the local stand-in for Vector Space. | [Harness](./reference/harness.md) |
| `@vectoragents/vs-apps/orpc` | The route contract and helpers for an app server that uses oRPC. | [oRPC](./reference/orpc.md) |
| `@vectoragents/vs-apps/extract` | Build-time extraction of the [agent catalog](../sdk/glossary.md#agent-catalog), run by the `vs-apps` command. | [Extract](./reference/extract.md) |
| `@vectoragents/vs-apps/conformance` | A fake Vector Space and the protocol cases that your server must pass. | [Conformance](./reference/conformance.md) |

Some subpaths need a peer package. Install `zod` version 3 with the package. Add `@nestjs/common` and `@nestjs/core` for `nest`, `react` for `react` and `react/harness`, and `@orpc/contract` for `orpc`.

The `server` and `browser` subpaths use only Web-standard APIs. The `nest`, `extract` and `conformance` subpaths need Node.js.

The closed lists that an app definition accepts, such as connector providers, are on the [platform limits](./reference/platform-limits.md) page.

## Dev harness

The dev harness is `VectorAppsHarness`, from the `react/harness` subpath. It shows your app in a shell that looks like Vector Space. The shell asks the [dev issuer](../sdk/glossary.md#dev-issuer) of your app server for a token, as Vector Space would. You can run and test an app without registering it.

The starter app includes the harness. Run it in development only and keep it out of the production build. The [harness reference](./reference/harness.md) shows how to wire it into an app that is not built from the starter.

## Get access

The package is on GitHub Packages, the package registry of GitHub. GitHub Packages answers only a request that carries a token. The token is a GitHub personal access token (classic) with the `read:packages` scope. To get access to the package, ask Vector staff.

The [quickstart](../vector-apps/quickstart.md#0-set-up-access-to-the-package-registry) shows the two `.npmrc` lines that give `npm` your token.

## Next steps

- [Quickstart](../vector-apps/quickstart.md): run a first app.
- [App definition](./app-definition.md): see what the definition holds.
