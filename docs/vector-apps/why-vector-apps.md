---
title: Why Vector Apps
description: The three parts of an app, when to build an app instead of an A2A agent or an MCP server, and the four things a space gives an app.
---

An [app](./glossary.md#app) is a product that you build and host yourself and that a [space](../vector-space/glossary.md#space) shows in an iframe inside [Vector Space](../vector-space/glossary.md#vector-space), the Vector platform. Your screens and logic work inside the space.

## Core components

You write three parts.

- **Client:** your screens and data tables, built with the React bindings of the [SDK](../sdk/glossary.md#sdk) or its framework-free browser helpers.
- **Server:** runs on your origin, serves the manifest and decides who may do what. It uses Web-standard APIs, so it runs on Node.js, Bun, Deno or Workers. The `./nest`, `./extract` and `./conformance` subpaths need Node.js. React is not a server wrapper.
- **[Manifest](./glossary.md#manifest):** lists your pages, permissions and what your app needs from a space. The SDK builds the manifest from one [app definition](../sdk/glossary.md#app-definition).

[Staff](../vector-space/glossary.md#staff) register an app from its manifest URL, and a [space admin](../vector-space/glossary.md#space-admin) adds it to a space.

The `hello-app` of the [quickstart](./quickstart.md) has one [app page](./glossary.md#app-page). Once it is added, [members](../vector-space/glossary.md#member) open it from the navigation. It shows the member id and space id the user token carries.

## Integration methods

[Extending a space](../vector-space/extending-a-space.md) compares three extensions:

- **Vector App:** for screens, pages or data tables for members.
- **[A2A](../vector-space/glossary.md#a2a) agent:** for a task that needs autonomous reasoning on its own model.
- **[MCP](../vector-space/glossary.md#mcp) server:** for agents that look up data in an external API or act in a tool.

An app can also offer an A2A agent and an MCP server of its own. You declare them in the app definition, and Vector Space adds them when a space admin adds the app.

## Platform capabilities

A space gives your app four things.

- **Member identity.** The user token identifies the member and the space and lists the [capabilities](./glossary.md#capability) the member holds in your app.
- **Platform data.** A member who can edit your app and share the resource attaches [connectors](../vector-space/glossary.md#connector) and [knowledge sources](../vector-space/glossary.md#knowledge-source) to it, as [allowed resources](./glossary.md#allowed-resources). A call reaches one only when the app is allowed it and the member may open it.
- **Model access through a slot.** You declare a [model slot](./glossary.md#model-slot), and a space admin picks the model. Your server asks for a model through the slot and gets a short-lived ticket for the [AI gateway](../vector-space/glossary.md#ai-gateway) in place of a key. Your app holds no AI provider key. Each paid model call of Vector Space goes through the gateway, on the AI accounts of the [organization](../vector-space/glossary.md#organization).
- **A record of work.** Your app declares [acts](./glossary.md#acts), records of what it did, and [approvals](./glossary.md#approvals), points where a person must confirm an action. Vector Space keeps the record and shows each approval to the person who decides.

Your server checks every call, as [How a Vector App works](./how-a-vector-app-works.md#the-parts-of-an-app) shows.

## Where to go next

- [How a Vector App works](./how-a-vector-app-works.md)
- [Quickstart](./quickstart.md)
- [Extending a space](../vector-space/extending-a-space.md)
- [SDK overview](../sdk/overview.md)
