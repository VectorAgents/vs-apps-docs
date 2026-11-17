---
title: How a Vector App works
description: The parts of an app, the six steps from build to removal, who does each step, and the six kinds of token that Vector Space signs.
---

import StructureFigure from '@site/src/components/StructureFigure';
import { appsOverview } from '@site/src/diagrams/figures/apps-overview.ts';

An [app](./glossary.md#app) is a web app that runs on its own origin and that a [space](../vector-space/glossary.md#space) shows inside [Vector Space](../vector-space/glossary.md#vector-space), the Vector platform.

## The parts of an app

You write three parts: a client, a server and a [manifest](./glossary.md#manifest). Your client runs in an iframe inside the space. Your server runs on your own origin and serves the manifest. Vector Space supplies the other two parts that your app uses: platform data and the [AI gateway](../vector-space/glossary.md#ai-gateway).

<StructureFigure data={appsOverview} figure={1} />

The three dashed lines are calls. Your client calls your server and your server calls Vector Space each time someone uses the app. Vector Space reads the manifest when [staff](../vector-space/glossary.md#staff) register the app and when you change it. [The token kinds](#the-six-token-kinds) say which token each call carries.

Your server decides who may do what. A check in your client is for display only.

## The lifecycle

An app goes through six steps. Staff, the Vector employees who run Vector Space, own the register step. A [space admin](../vector-space/glossary.md#space-admin) owns three steps.

| Step | Who | What happens |
| --- | --- | --- |
| Build | You | You write the client, the server and the [app definition](../sdk/glossary.md#app-definition). |
| Register | Staff | Staff add the app from its manifest URL. |
| Activate | A space admin | The space admin adds the app to a space. |
| Configure | A space admin | The space admin shares the app and sets what it may use. |
| Update | You, then staff | You deploy a new manifest and staff apply it. |
| Deprovision | A space admin | The space admin removes the app from a space. |

### Build

You describe the app in one [app definition](../sdk/app-definition.md). Your server builds the manifest from it and serves the manifest to Vector Space. The [quickstart](./quickstart.md) walks through this step.

### Register

Staff give Vector Space the URL of your manifest. Vector Space reads and checks it, then shows staff what the manifest declares, such as [model slots](./glossary.md#model-slot). Staff then create the [app registration](./glossary.md#app-registration).

Registering does not add the app to any space.

### Activate

A space admin adds the app to a space. Vector Space first checks that the [organization](../vector-space/glossary.md#organization) may use the app. Then it calls `POST /api/provision` on your server to push a [service secret](./glossary.md#service-secret).

If any part fails, Vector Space tells your server to deprovision, and the activation fails. The space admin can try again.

### Configure

A new app is shared with no one. The space admin shares it with [members](../vector-space/glossary.md#member) and [groups](../vector-space/glossary.md#group). That decides who can open it and which [capabilities](./glossary.md#capability) they hold.

The space admin also sets each model slot and [connector slot](./glossary.md#connector-slot) and attaches the resources the app may read. Until a required slot is set, the app needs setup, but it stays in the space.

### Update

You deploy a new manifest. Your server tells Vector Space at start, and staff can also choose **Check for updates**.

If the manifest changed, Vector Space holds it for staff to apply, unless [auto-apply](./glossary.md#auto-apply) is on for that app registration. If it did not change, nothing happens. Auto-apply is off by default.

A change that reaches past your app always waits for staff, even with auto-apply on. A new [approval](./glossary.md#approvals) key is one example.

After staff apply a manifest, Vector Space brings every space that has the app in line with it. A capability that you removed is no longer granted. Vector Space has no rollback, so to go back, serve the previous manifest and ask staff to apply it.

### Deprovision

A space admin removes the app from a space, or someone deletes the space. Vector Space calls `DELETE /api/deprovision` on your server and removes the [agents](../vector-space/glossary.md#agent) and [MCP](../vector-space/glossary.md#mcp) servers that the app added to the space.

The call is best effort. If your server does not answer, Vector Space still removes the app. A space admin can add the app again later.

## The six token kinds

Vector Space signs six kinds of token with one key set. Your app verifies five of them and requests the sixth, the app token, by trading its service secret. It never verifies the app token. Each token carries the app it is for, and each one expires.

Two kinds go with interfaces that your app can offer: an [A2A](../vector-space/glossary.md#a2a) agent that other agents call, and an MCP server of tools that agents call.

| Token | How it travels | Default lifetime |
| --- | --- | --- |
| [User token](./glossary.md#user-token) | Vector Space posts it to your client, which sends it to your server. | 5 minutes |
| Provisioning token | Sent when Vector Space reads the manifest, pushes the secret or removes the app. | 2 minutes |
| A2A token | Sent with each call to an agent your app offers; it can identify the member. | 5 minutes |
| MCP token | Sent with each call to a tool server your app offers. | 5 minutes |
| [App token](./glossary.md#app-token) | Your server trades the service secret for it, then calls Vector Space with it. | 10 minutes |
| Events token | Sent with a connector event or with the decision on an approval. | 5 minutes |

Only the user token that Vector Space posts to your client carries the name and picture of the member. Two other user tokens carry neither. One goes with an agent's call to an endpoint, a route that the manifest lists under `endpoints` and that an agent can call (`aud: app-user`). The other has `viaServer: true`: your server gets it when it trades the service secret for a `userId`.

## Where to go next

- [Quickstart](./quickstart.md): run a small app and see the user token checked in the browser and on your server.
- [SDK overview](../sdk/overview.md): see what the SDK holds and which import path reaches each part.
- [App definition](../sdk/app-definition.md): describe the pages and capabilities of your app in one object.
- [Vector Apps glossary](./glossary.md): look up each term on this page.
