---
title: How a Vector App works
description: The parts of an app, the six steps from build to removal, who does each step, and the six kinds of token that Vector Space signs.
---

import IsoDiagram from '@site/src/components/IsoDiagram';
import { appsOverview } from '@site/src/diagrams/apps-overview.ts';

An [app](./glossary.md#app) is a web app that runs on its own origin and that a [space](../vector-space/glossary.md#space) shows inside [Vector Space](../vector-space/glossary.md#vector-space), the Vector platform. This page shows the parts of an app, the six steps from build to removal, and the tokens that Vector Space signs for it.

## The parts of an app

You write three parts: a client, a server and a [manifest](./glossary.md#manifest). Your client runs in an iframe inside the space. Your server runs on your own origin and serves the manifest. Vector Space supplies the other two parts that your app uses: platform data and the AI gateway.

<IsoDiagram diagram={appsOverview} figure={1} />

The four lines show the token path. Lines a to c run each time someone uses the app. Line d runs when Vector registers the app and when you change it. Your server decides who may do what. A check in your client is for display only.

## The lifecycle

An app goes through six steps. Each step has one owner. [Staff](../vector-space/glossary.md#staff), the Vector employees who run Vector Space, own the register step. A [space manager](../vector-space/glossary.md#space-manager) owns three steps.

| Step | Who | What happens |
| --- | --- | --- |
| Build | You | You write the client, the server and the app definition. |
| Register | Vector staff | Staff add the app from its manifest URL. |
| Activate | A space manager | The space manager adds the app to a space. |
| Configure | A space manager | The space manager shares the app and sets what it may use. |
| Update | You, then Vector staff | You deploy a new manifest. Staff apply it. |
| Deprovision | A space manager | The space manager removes the app from a space. |

### Build

You describe the app in one [app definition](../sdk/app-definition.md). Your server builds the manifest from it and serves the manifest to Vector Space. The [quickstart](./quickstart.md) walks through this step.

### Register

Staff give Vector Space the URL of your manifest. Vector Space reads and checks it, then shows staff what the manifest declares, such as model slots. Staff then create the [app registration](./glossary.md#app-registration). Registering does not add the app to any space. It uses line d of the diagram.

### Activate

A space manager adds the app to a space. Vector Space first checks that the organization may use the app. Then it calls `POST /api/provision` on your server to push a [service secret](./glossary.md#service-secret). If any part fails, Vector Space tells your server to deprovision, and the activation fails. The space manager can try again.

### Configure

A new app is shared with no one. The space manager shares it with members and groups. That decides who can open it and which [capabilities](./glossary.md#capability) they hold. The space manager also sets each [model slot](./glossary.md#model-slot) and [connector slot](./glossary.md#connector-slot) and attaches the resources the app may read. Until a required slot is set, the app needs setup, but it stays in the space.

### Update

You deploy a new manifest. Your server tells Vector Space at start, and staff can also choose **Check for updates**. If the manifest has not changed, nothing happens. If it has, Vector Space holds it until staff apply it, unless auto-apply is on for that app registration. Auto-apply is off by default.

A change that reaches past your app always waits for staff, even with auto-apply on. A new [approval](./glossary.md#approvals) key is one example.

After staff apply a manifest, Vector Space brings every space that has the app in line with it. A capability that you removed is no longer granted. Vector Space has no rollback. To go back, serve the earlier manifest and ask staff to apply it.

### Deprovision

A space manager removes the app from a space, or someone deletes the space. Vector Space calls `DELETE /api/deprovision` on your server and removes the agents and MCP servers that the app added to the space. The call is best effort. If your server does not answer, Vector Space still removes the app. A space manager can add the app again later.

## The six token kinds

Vector Space signs six kinds of token with one key set. Your app only verifies them. Each token carries the app it is for, and each one expires.

Two kinds go with interfaces that your app can offer. [A2A](../vector-space/glossary.md#a2a) is the Agent2Agent protocol, for one agent that calls another. [MCP](../vector-space/glossary.md#mcp) is the Model Context Protocol, for an agent that calls a server of tools.

| Token | How it travels | Default lifetime |
| --- | --- | --- |
| User token | Vector Space posts it to your client, which sends it to your server. | 5 minutes |
| Provisioning token | Sent when Vector Space reads the manifest, pushes the secret or removes the app. | 2 minutes |
| A2A token | Sent with each call to an agent your app offers. It can identify the member. | 5 minutes |
| MCP token | Sent with each call to a tool server your app offers. | 5 minutes |
| [App token](./glossary.md#app-token) | Your server trades the service secret for it, then calls Vector Space with it. | 10 minutes |
| Events token | Sent with a connector event or with the decision on an approval. | 5 minutes |

The user token identifies the member and the space. It lists the capabilities that the member holds in your app.

## Where to go next

- [Quickstart](./quickstart.md): run a small app and see the user token checked in the browser and on your server.
- [SDK overview](../sdk/overview.md): see what the SDK holds and which import path reaches each part.
- [App definition](../sdk/app-definition.md): describe the pages and capabilities of your app in one object.
- [Vector Apps glossary](./glossary.md): look up each term on this page.
