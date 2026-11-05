---
title: Vector Space at a glance
description: The building blocks of an organization and a space, where your code plugs in, and who the roles are.
---

import IsoDiagram from '@site/src/components/IsoDiagram';
import { spaceOverview } from '@site/src/diagrams/space-overview.ts';

[Vector Space](./glossary.md#vector-space) is made of a few blocks. This page names them, shows how they sit together, says where your code plugs in and lists who works with them. [Why Vector Space](./why-vector-space.md) says what the platform is for.

## The building blocks

An organization is the tenant. Every user, key, resource and [space](./glossary.md#space) belongs to one organization. A space is the unit of work: it holds the parts that people and agents use, and Vector Space works out access inside it.

The picture shows one space inside an organization. Parts 1 to 6 sit in the space. Parts 7 and 8 sit outside it and plug in on dashed links: an [A2A](./glossary.md#a2a) agent and an [MCP](./glossary.md#mcp) connector.

<IsoDiagram diagram={spaceOverview} figure={1} />

The [resource pool](./glossary.md#resource-pool) lists what the space can reach. A [space page](./glossary.md#space-page) is not an app page. It is a grid of widgets that belongs to the space.

## What the picture leaves out

Two things shape a space but have no block in the picture.

### Governance

Governance shows what ran, as whom, what it cost and what it was allowed to spend. It reads the one record of work from the [three platform rules](./why-vector-space.md#the-three-platform-rules). An [Organization admin](./glossary.md#organization-admin) reads it across the whole organization.

### Vector Modules

A Vector Module is a product from Vector that works on connector data. A space activates modules next to its apps. [Platform limits](../sdk/reference/platform-limits.md#first-party-vector-modules) names each Vector Module.

## Where code plugs in

Three kinds of code plug into a space.

- **Vector App.** A web app on its own origin. The space shows each [app page](../vector-apps/glossary.md#app-page) in an iframe.
- **A2A agent.** A remote agent that the orchestrator agent delegates to. A2A is the Agent2Agent protocol.
- **MCP connector.** A remote server of tools that agents call. MCP is the Model Context Protocol.

[Why Vector Apps](../vector-apps/why-vector-apps.md) says what an app is and what a space gives it. [Choose your path](../sdk/choose-your-path.md) compares the three kinds row by row.

## Roles

Five roles work with Vector Space.

- **members** work in spaces. They chat with agents, build space pages and answer what agents ask them.
- **Organization admin** is one person who manages the users, spaces and AI provider accounts of an organization. This person also sets up each connector provider. Every [Organization admin](./glossary.md#organization-admin) is a space manager.
- **space managers** manage one space: its members, roles, resources, agent and apps. A [space manager](./glossary.md#space-manager) holds [Edit level](./glossary.md#edit-level) in that space.
- **staff** are Vector employees who run the platform across organizations. They set up organizations, run the credential vault and register apps. The [glossary entry](./glossary.md#staff) lists what only staff can do.
- **machines** call in without a person at the keyboard. They use API keys, A2A or a [channel](./glossary.md#channel), as a user or as a service account. A service account is a user that is not a person.

## Where to go next

- [Why Vector Apps](../vector-apps/why-vector-apps.md): see what an app is and what a space gives it.
- [Choose your path](../sdk/choose-your-path.md): compare a Vector App, an A2A agent and an MCP server.
- [Vector Space glossary](./glossary.md): look up each term on this page.
