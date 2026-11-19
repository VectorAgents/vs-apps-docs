---
title: Vector Apps glossary
sidebar_label: Glossary
description: Terms of building a Vector App, each with its definition, the export it maps to and its owner.
---

Each term has one name in these docs. Each entry gives the definition, the export or field it maps to, and who owns it. The terms of Vector Space itself, such as [space](../vector-space/glossary.md#space) and [space admin](../vector-space/glossary.md#space-admin), are in the [Vector Space glossary](../vector-space/glossary.md). The terms of the SDK are in the [SDK glossary](../sdk/glossary.md).

## Terms

### app

A product you ship into spaces: a React client, a server and one [app definition](../sdk/glossary.md#app-definition).

- Maps to: the definition `key`, sent to Vector Space as `appKey`.
- Owner: SDK. It defines the shape of the definition that identifies the app.

### app registration

The record [staff](../vector-space/glossary.md#staff) create in Vector Space from your [manifest](#manifest) URL, one per app. Vector Space fetches the manifest again when staff ask or when the app starts.

- Owner: Vector Space.

### manifest

The JSON the server builds from the [app definitions](../sdk/glossary.md#app-definition) and serves at `GET /api/manifest/:appKey`. Vector Space reads it. The definition file itself is never sent.

- Maps to: `buildManifests` in `@vectoragents/vs-apps/server`.
- Owner: SDK builds it. Vector Space reads it.

### app page

One screen of the app. It becomes a navigation entry in Vector Space, shown only to [members](../vector-space/glossary.md#member) who hold the page's [permission](#permission).

- Maps to: `pages[]` in the definition (`key`, `label`, `path`, optional `permission`). `appPages(...)` lists them on the client.
- Owner: SDK declares it. Vector Space renders the navigation entry.

### permission

A named right to use part of your app. It has the form `<group>:<action>` and an `effect` of `read` or `write`. An app page and server routes reference it.

- Maps to: `permissions[]` in the definition. `RequirePermission` and `useApp().hasPermission` check it on the client.
- Owner: SDK declares it. Vector Space grants it.

### permission grant

A [share](../vector-space/glossary.md#share) of an app that gives a member its permissions. Can use, Can edit and Can manage each give every permission the app declares, while a [custom role](../vector-space/glossary.md#custom-role) gives only the permissions it names. A [space admin](../vector-space/glossary.md#space-admin) makes it.

- Maps to: `useApp().permissions` holds the permissions granted to the current member.
- Owner: Vector Space.

### model slot

A named [AI](../vector-space/glossary.md#ai) model requirement. The app declares the slot and the space admin picks the model. If no one sets a slot, the app cannot use that model.

- Maps to: `resources.models[]` in the definition.
- Owner: SDK declares it. Vector Space stores the choice.

### connector slot

A named requirement for one external connector, such as ClickUp or a REST API. It can declare event handlers for incoming webhooks.

- Maps to: `resources.connectors[]` in the definition, with optional `eventHandlers`.
- Owner: SDK declares it. Vector Space attaches the connector.

### acts

Declared records of what the app did, such as an import, each with a `kind` of `activity` or `audit`. Vector Space refuses an undeclared act key. Vector Space values a successful act as [Human Time Return](../vector-space/glossary.md#human-time-return) when staff approved a baseline for it.

- Maps to: `acts[]` in the definition.
- Owner: SDK declares them. Vector Space bounds and records them.

### approvals

Declared points where a person must confirm an action. Each one raises an [ask](../vector-space/glossary.md#ask). Each approval can opt into a standing "always allow" with `grantable`.

- Maps to: `approvals[]` in the definition.
- Owner: SDK declares them. Vector Space asks the approver.

### user token

The token that Vector Space issues for one member in one space. It names the member and the space and lists the permissions that the member holds in your app. Your server verifies it on each request.

- Maps to: `verifyUserToken` in `@vectoragents/vs-apps/server`.
- Owner: Vector Space issues it. The SDK verifies it.

### app token

A short-lived token that Vector Space issues in exchange for the [service secret](#service-secret). Without a `userId` it acts as the app. An exchange that names a `userId` gives that member a user token with `viaServer: true`, and Vector Space refuses it unless the space admits that user.

- Maps to: `createSpaceS2s` and `SpaceS2sService`. The SDK calls the token a service token.
- Owner: Vector Space issues it. The SDK requests it.

### service secret

The secret Vector Space creates for each pair of app and space and pushes to the app at `POST /api/provision`. The app trades it for an app token.

- Maps to: `AppCredentialStore` in `@vectoragents/vs-apps/server`, the credential store that `createAppPlatform` and the `/nest` adapter keep it in.
- Owner: Vector Space creates it. The SDK stores and exchanges it.

### binding

An app attached to one space. It keeps a copy of the [permissions](#permission), [acts](#acts) and [approvals](#approvals) that the manifest declares, and the model, connector and resource choices of that space. Vector Space updates the copy each time it reads the manifest.

- Owner: Vector Space.

### member directory

The list of a space's members and groups that an app page searches through `useApp().directory`. It is unavailable when `SPACE_API_URL` is not set.

- Maps to: `useApp().directory`.
- Owner: Vector Space serves it. The SDK reads it.

### auto-apply

A setting on an app registration. When it is on, Vector Space applies a manifest change at once. It is off by default and never applies a change that reaches past your app.

- Owner: Vector Space.

### allowed resources

The resources attached to an app from the [Context Hub](../vector-space/glossary.md#context-hub), such as connectors and knowledge sources. An action runs only on resources that are allowed for the app and open to the member. The member's access never grows through the app.

- Owner: Vector Space.
