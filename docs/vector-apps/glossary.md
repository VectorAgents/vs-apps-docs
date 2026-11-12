---
title: Vector Apps glossary
sidebar_label: Glossary
---

Each term has one name in these docs. Pages link a term at first use. Each entry gives the definition, the code symbol or field it maps to, and who owns it. The terms of Vector Space itself, such as [space](../vector-space/glossary.md#space) and [space manager](../vector-space/glossary.md#space-manager), are in the [Vector Space glossary](../vector-space/glossary.md). The terms of the SDK are in the [SDK glossary](../sdk/glossary.md).

## Terms

### app

A product you ship into spaces: a React client, a server and one [app definition](../sdk/glossary.md#app-definition).

- Maps to: the definition `key`, sent to Vector Space as `appKey`.
- Owner: SDK. It defines the shape of the definition that identifies the app.

### app registration

The record Vector creates in Vector Space from your manifest URL. One registration per app. Vector Space re-pulls the manifest on a pull or the app's boot ping.

- Maps to: no SDK symbol.
- Owner: Vector Space.

### manifest

The JSON the server builds from the app definitions and serves at `GET /api/manifest/:appKey`. Vector Space reads it. The definition file itself is never sent.

- Maps to: `buildManifests` in `@vectoragents/vs-apps/server`.
- Owner: SDK builds it. Vector Space reads it.

### app page

One screen of the app. It becomes a navigation entry in Vector Space, shown only to users who hold the page's capability.

- Maps to: `pages[]` in the definition (`key`, `label`, `path`, optional `capability`). `appPages(...)` lists them on the client.
- Owner: SDK declares it. Vector Space renders the navigation entry.

### capability

A named permission of the form `<group>:<action>` with an `effect` of `read` or `write`. An app page and server routes reference it.

- Maps to: `capabilities[]` in the definition. `RequireCapability` and `useApp().hasCapability` check it on the client.
- Owner: SDK declares it. Vector Space grants it.

### capability grant

A [share](../vector-space/glossary.md#share) on named capabilities, at Can use, for users or groups. A space manager makes it. Only declared capabilities can be shared.

- Maps to: no SDK symbol. `useApp().capabilities` holds the capabilities granted to the current user.
- Owner: Vector Space.

### model slot

A named [AI](../vector-space/glossary.md#ai) model requirement. The app declares the slot and the space manager picks the model. No slot is inherited, and an unset slot runs nothing.

- Maps to: `resources.models[]` in the definition.
- Owner: SDK declares it. Vector Space stores the choice.

### connector slot

A named requirement for one external connector, such as ClickUp or a REST API. A slot takes one context, which may be a connector. It can declare event handlers for incoming webhooks.

- Maps to: `resources.connectors[]` in the definition, with optional `eventHandlers`.
- Owner: SDK declares it. Vector Space attaches the connector.

### acts

Declared records of what the app did, such as an import. Each act has a `kind` of `activity` or `audit`. Vector Space refuses an undeclared act key. An act is what [Human Time Return](../vector-space/glossary.md#human-time-return) values.

- Maps to: `acts[]` in the definition.
- Owner: SDK declares them. Vector Space bounds and records them.

### approvals

Declared points where a person must confirm an action. Each one raises an [ask](../vector-space/glossary.md#ask). Each approval can opt into a standing "always allow" with `grantable`.

- Maps to: `approvals[]` in the definition.
- Owner: SDK declares them. Vector Space asks the approver.

### app token

A short-lived token that Vector Space issues in exchange for the service secret. The SDK calls it a service token. A plain exchange gives a token limited to what the app may do, with no user involved. An exchange that names a `userId` gives a user token under that member's own access, with `viaServer: true`. Vector Space refuses it unless the space admits that user.

- Maps to: `createSpaceS2s` and `SpaceS2sService`.
- Owner: Vector Space issues it. The SDK requests it.

### service secret

The secret Vector Space creates for each pair of app and space and pushes to the app at `POST /api/provision`. The app trades it for an app token.

- Maps to: `AppCredentialStore` in `@vectoragents/vs-apps/server`, the credential store that `createAppPlatform` and the `/nest` adapter keep it in.
- Owner: Vector Space creates it. The SDK stores and exchanges it.

### binding

An app attached to one space. The binding keeps a copy of the capabilities, acts and approvals that the manifest declares. It also holds the model, connector and resource choices of that space. Vector Space updates the copy each time it reads the manifest.

- Maps to: no SDK symbol. The SDK sees the effect through the verified token and `loadAppClientConfig`.
- Owner: Vector Space.

### allowed resources

The resources a space manager attaches to an app, such as connectors and knowledge sources. They come from the [Context Hub](../vector-space/glossary.md#context-hub). An action runs only on resources that are allowed for the app and open to the member. The member's access never grows through the app.

- Maps to: no SDK symbol.
- Owner: Vector Space.
