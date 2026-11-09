---
title: Vector Space glossary
sidebar_label: Glossary
---

Each term has one name in these docs. Pages link a term at first use. Each entry gives the definition, the code symbol or field it maps to, and who owns it. The terms of building an app are in the [Vector Apps glossary](../vector-apps/glossary.md), and the terms of the SDK are in the [SDK glossary](../sdk/glossary.md).

## Terms

### Vector Space

The Vector platform. It holds organizations and their spaces. It shows each app in an iframe.

- Maps to: no SDK symbol. The app talks to Vector Space through the token, the iframe bridge and the manifest.
- Owner: Vector Space.

### space

A shared place in Vector Space for one team. A space manager adds apps, shares capabilities and sets slots in it. It also holds space pages, a resource pool and members.

- Maps to: no SDK symbol.
- Owner: Vector Space.

### space manager

A member of a space at Edit level, or an Organization admin. They add apps, grant capabilities and choose the models and connectors for the slots.

- Maps to: no SDK symbol.
- Owner: Vector Space.

### Organization admin

A member who manages the organization in Vector Space and sees **Organization** under **Settings**. Every Organization admin is a space manager.

- Maps to: no SDK symbol.
- Owner: Vector Space.

### Edit level

The access level that lets a member edit a space. A member at Edit level is a space manager.

- Maps to: no SDK symbol.
- Owner: Vector Space.

### space page

A grid of widgets in a space, with page filters. It is not an [app page](../vector-apps/glossary.md#app-page), and the SDK has no part in it.

- Maps to: no SDK symbol.
- Owner: Vector Space.

### staff

Vector employees who administer Vector Space itself. Only staff register apps, apply manifest changes and edit an organization license. External developers are not staff. A space manager works inside one space instead.

- Maps to: no SDK symbol.
- Owner: Vector Space.

### resource pool

The list of everything a space holds: connectors, knowledge sources, skills, apps and space pages. A member or app reaches only what the pool lists. Vector Space shows the pool under Context Hub as **Resources**.

- Maps to: no SDK symbol.
- Owner: Vector Space.

### knowledge source

A body of documents that Vector Space indexes for search. A space manager can attach one to an app, with an optional scope of folders or documents. Vector Space shows knowledge sources in the settings of an app.

- Maps to: no SDK symbol.
- Owner: Vector Space.

### Context Hub

The area of Vector Space for what a space can reach: connectors, knowledge sources, datasources and the resource pool.

- Maps to: no SDK symbol.
- Owner: Vector Space.

### ask

Anything an agent or an app waits on a person for. An approval of an app is one kind of ask. A request for more detail is another.

- Maps to: no SDK symbol.
- Owner: Vector Space.

### channel

An agent that a person reaches from outside the web app, with its own prompt. The channel is the agent, not the service it is reached through: WhatsApp, Messenger and Instagram are Meta messaging services.

- Maps to: no SDK symbol.
- Owner: Vector Space.

### MCP

Model Context Protocol. An open protocol that connects a model to tools and data. A [connector slot](../vector-apps/glossary.md#connector-slot) with the provider `MCP` uses it.

- Maps to: `provider: 'MCP'` in `resources.connectors[]`.
- Owner: SDK declares it. Vector Space attaches the connector.

### A2A

Agent2Agent. An open protocol that lets one agent find another through an agent card and call it with JSON Remote Procedure Call (JSON-RPC) messages. An app that declares an agent publishes the card and answers `message/send` and `message/stream`.

- Maps to: `agents[]` in the definition, and `buildAppAgentCard` and `createA2aRequestHandler` in `@vectoragents/vs-apps/server`.
- Owner: SDK declares it. Vector Space calls it.

### AI

Artificial intelligence. In these docs it means a model that reads and writes language, such as a chat model, and the agents that run on it.

- Maps to: no SDK symbol.
- Owner: Vector Space.
