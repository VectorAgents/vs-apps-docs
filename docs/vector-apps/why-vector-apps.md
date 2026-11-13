---
title: Why Vector Apps
description: What an app is, where it fits among the ways to plug code into a space, and what a space gives it.
---

An [app](./glossary.md#app) is a product that you build and host yourself and that a [space](../vector-space/glossary.md#space) shows in an iframe inside [Vector Space](../vector-space/glossary.md#vector-space), the Vector platform. This page says what an app is, where it fits among the ways to plug code into a space, and what a space gives it.

## What an app is

You write three parts: a client, a server and a [manifest](./glossary.md#manifest). The client holds your screens. The server runs on your own origin, serves the manifest and decides who may do what. The manifest tells Vector Space which pages and permissions your app has and what it needs from a space.

The `hello-app` of the [quickstart](./quickstart.md) is a small app with one [app page](./glossary.md#app-page). Once it is added to a space, members open that page from the navigation of the space. The page shows the user id and space id that the user token carries.

## Where an app fits

[Extending a space](../vector-space/extending-a-space.md) compares the three ways to extend a space with your code: a Vector App, an [A2A](../vector-space/glossary.md#a2a) agent and an [MCP](../vector-space/glossary.md#mcp) server.

An app can also offer an A2A agent and an MCP server of its own. You declare them in the [app definition](../sdk/glossary.md#app-definition), and Vector Space adds them to the space when a [space admin](../vector-space/glossary.md#space-admin) adds the app.

## What a space gives an app

A space gives your app four things. Each one stays inside the rules of the space.

- **Member identity.** The user token identifies the member and the space. It lists the capabilities that the member holds in your app.
- **Platform data.** A member who can edit your app and share the resource attaches resources to it, such as connectors and knowledge sources. These are the [allowed resources](./glossary.md#allowed-resources). A call reaches a resource only when the app is allowed it and the member may open it.
- **Governed model access.** You declare a [model slot](./glossary.md#model-slot), and a space admin picks the model. Your server asks for a model through the slot and gets a short-lived ticket for the [AI](../vector-space/glossary.md#ai) gateway in place of a key, so your app holds no AI provider key. The gateway is the one route that each paid model call of Vector Space takes, on the AI accounts of the organization. A production Vector Space publishes no gateway address to apps, so it refuses the request with status `503`. A local stack runs the gateway and answers it.
- **A record of work.** Your app declares [acts](./glossary.md#acts), records of what it did, and [approvals](./glossary.md#approvals), points where a person must confirm an action. Vector Space keeps the record and shows each approval to the person who must decide.

Your server checks every call. A check in your client is for display only.

## Where to go next

- [How a Vector App works](./how-a-vector-app-works.md): see the parts of an app, the six steps from build to removal and the tokens.
- [Quickstart](./quickstart.md): run a small app on your machine, then in a space.
- [Extending a space](../vector-space/extending-a-space.md): compare a Vector App, an A2A agent and an MCP server.
