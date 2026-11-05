---
title: SDK glossary
sidebar_label: Glossary
---

Each term has one name in these docs. Pages link a term at first use. Each entry gives the definition, the code symbol or field it maps to, and who owns it. The terms of building an app are in the [Vector Apps glossary](../vector-apps/glossary.md), and the terms of the platform are in the [Vector Space glossary](../vector-space/glossary.md).

## Terms

### app definition

The one object that describes an [app](../vector-apps/glossary.md#app): pages, capabilities and resources. It does not read environment variables. It feeds the server manifest and the client navigation.

- Maps to: `defineApp(...)` in `@vectoragents/vs-apps`, typed `AppDefinition`.
- Owner: SDK.

### SDK

The software development kit: the `@vectoragents/vs-apps` package, version 0.4.0.

- Maps to: `@vectoragents/vs-apps` and its subpaths.
- Owner: SDK.

### harness

A local stand-in for [Vector Space](../vector-space/glossary.md#vector-space) that hosts the [app page](../vector-apps/glossary.md#app-page) in a dev shell, for debugging without a registration.

- Maps to: `VectorAppsHarness` in `@vectoragents/vs-apps/react/harness`.
- Owner: SDK.

### dev issuer

The token signer that the app server runs in harness mode. It signs a token on request, verifies tokens it signed and publishes its public key set. In production, Vector Space does these jobs instead.

- Maps to: `createDevIssuer` in `@vectoragents/vs-apps/server`.
- Owner: SDK.

### agent action

An operation an app page registers so the Vector Space agent can call it while the page is open.

- Maps to: `useAgentAction` in `@vectoragents/vs-apps/react`, registered through `AgentActionRegistryProvider`.
- Owner: SDK.

### agent catalog

The build-time list of app page descriptions and agent actions. The server merges it into the manifest at boot. Vector Space ingests it per app and names each entry `<appId>.<id>`, with the id of the app registration as `appId`.

- Maps to: `defineAgentPage` and the `agent-catalog.json` file.
- Owner: SDK builds it. Vector Space ingests it.

### monorepo

One repository that holds the client, the server and the shared package, each as its own package.

- Maps to: the `workspaces` field in the root `package.json`.
- Owner: docs. It is a layout the quickstart uses, not an SDK concept.

### shared package

The package `@hello-app/shared`. It holds the app definition and the capability key. The client and the server both import it.

- Maps to: no SDK symbol.
- Owner: docs. It is a package of the quickstart app, not part of the SDK.

### app platform

The server runtime of the SDK. It serves the routes that Vector Space calls on your server, such as the manifest and provisioning routes. It also verifies tokens and keeps the service secret in your credential store.

- Maps to: `createAppPlatform` in `@vectoragents/vs-apps/server`, and the `/nest` module that binds it.
- Owner: SDK.

### app session

The browser runtime of an app page. It runs the app side of the embed protocol: it gets the token from Vector Space through the iframe bridge and exposes the state of the page.

- Maps to: `startAppSession` in `@vectoragents/vs-apps/browser`. `AppProvider` in `@vectoragents/vs-apps/react` calls it.
- Owner: SDK.

### conformance kit

A test kit for your server. A fake Vector Space signs every kind of token. A list of cases drives the routes that Vector Space calls and checks each answer.

- Maps to: `appPlatformConformance` and `startFakeVectorSpace` in `@vectoragents/vs-apps/conformance`.
- Owner: SDK.
