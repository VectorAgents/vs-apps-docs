---
title: Why Vector Apps
description: When to build an app instead of an A2A agent or an MCP server, what a space gives an app, and the parts you write.
---

An [app](./glossary.md#app) is a product that you build and host yourself and that a space shows in an iframe inside Vector Space, the Vector platform. Your screens and logic work inside the [space](../vector-space/glossary.md#space).

## App, A2A agent or MCP server

Build an app for work that members do on screen. An A2A agent and an MCP server serve agents.

- **Vector App:** for screens, pages or data tables for members.
- **[A2A](../vector-space/glossary.md#a2a) agent:** for a task that needs autonomous reasoning on its own model.
- **[MCP](../vector-space/glossary.md#mcp) server:** for agents that look up data in an external API or act in a tool.

[Extending a space](../vector-space/extending-a-space.md) compares all three. An app can also offer an A2A agent and an MCP server of its own. You declare them in the app definition, and Vector Space adds them when a [space admin](../vector-space/glossary.md#space-admin) adds the app.

## Identity, data, models and a record of work

Your server checks every call, as [How a Vector App works](./how-a-vector-app-works.md#the-parts-of-an-app) shows.

- **Member identity.** Your server can tell which member is calling: the user token identifies the member and the space and lists the [capabilities](./glossary.md#capability) the member holds in your app.
- **Platform data.** Your app can use connectors and knowledge sources. A member who can edit your app and share the resource attaches them to it, as [allowed resources](./glossary.md#allowed-resources). A call reaches one only when the app is allowed it and the member may open it.
- **Model access through a slot.** Your app can call a model without holding an AI provider key. You declare a [model slot](./glossary.md#model-slot), and a space admin picks the model. Your server asks for a model through the slot and gets a short-lived key for the [AI gateway](../vector-space/glossary.md#ai-gateway). Each paid model call of Vector Space goes through the gateway, on the AI accounts of the organization.
- **A record of work.** Your app can record what it did and ask a person to confirm an action. You declare [acts](./glossary.md#acts), records of what the app did. You also declare [approvals](./glossary.md#approvals), points where a person must confirm an action. Vector Space keeps the record and shows each approval to the person who decides.

## Client, server and manifest

The `hello-app` of the quickstart has one [app page](./glossary.md#app-page). Once it is added, members open it from the navigation. It shows the member id and space id the user token carries.

- **Client:** your screens and data tables, built with the React bindings of the [SDK](../sdk/glossary.md#sdk) or its framework-free browser helpers.
- **Server:** runs on your origin, serves the manifest and decides who may do what. It uses Web-standard APIs, so it runs on Node.js, Bun, Deno or Workers.
- **[Manifest](./glossary.md#manifest):** lists your pages, permissions and what your app needs from a space. The SDK builds the manifest from one [app definition](../sdk/glossary.md#app-definition).

## Where to go next

- [How a Vector App works](./how-a-vector-app-works.md): how staff register an app and a space admin adds it to a space.
- [Quickstart](./quickstart.md)
- [Extending a space](../vector-space/extending-a-space.md)
- [SDK overview](../sdk/overview.md)
