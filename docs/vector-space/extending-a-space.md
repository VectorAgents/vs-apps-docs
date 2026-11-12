---
title: Extending a space
description: A Vector App, an A2A agent and an MCP server compared, and when to choose each.
---

import FlowFigure from '@site/src/components/FlowFigure';
import { extendingFlow } from '@site/src/diagrams/figures/extending-flow.ts';

An [extension](./glossary.md#extension) adds logic of a team's own to a [space](./glossary.md#space). It is a Vector App, an A2A agent or an MCP server. A [Vector App](../vector-apps/glossary.md#app) is a web app that a space shows in an iframe. An [A2A](./glossary.md#a2a) agent is a remote agent that an agent of the space hands work to. An [MCP](./glossary.md#mcp) server is a remote set of tools that agents call.

All three run outside the space, on their own origins.

## A question about open tickets

Acme's engineering team has a space, and a [member](./glossary.md#member) of it asks the [orchestrator agent](./glossary.md#orchestrator-agent) which tickets are still open. The team runs a ticket tracker, and it can offer the tracker in three ways. As a Vector App, it shows its screens in the space and the agent calls its server. As an A2A agent, it reasons over tickets and the orchestrator agent hands the question to it. As an MCP server, it offers tools such as "list open tickets" that agents call.

Each call starts in the member's run. What the space sends with the call differs.

## Adding an extension

Each extension gets in by its own path:

- **Vector App**: added in two steps. [Staff](./glossary.md#staff) register it, and a [space manager](./glossary.md#space-manager) adds it to the space. The space then shows its pages. An agent calls its endpoints with a token that the space makes for the member.
- **A2A agent**: added by someone who may manage agents in the space. The space reads its [agent card](./glossary.md#agent-card) from a URL. The agent joins the agent tree as a leaf, an agent that hands work to no one. If the organization saved a stored credential for it, the space sends that credential with each call. A stored credential is a secret that the organization keeps for one outside service.
- **MCP server**: added by a member as a context in the [Context Hub](./glossary.md#context-hub). The context starts as Restricted, so only that member reaches it until they share it. The space finds the tools of the server, and agents call them with the stored credential of the context. [General access](./glossary.md#general-access) explains Restricted.

A standalone A2A agent or MCP server needs no vs-apps [SDK](../sdk/glossary.md#sdk). A Vector App can offer an A2A agent and an MCP server of its own. You declare them in the [app definition](../sdk/glossary.md#app-definition).

<FlowFigure data={extendingFlow} />

## The comparison

Here is what each extension learns from the space and what it can do there.

| | Vector App | A2A agent | MCP server |
| --- | --- | --- | --- |
| Caller | The app sees the member by name, with the capabilities they hold. | Only an agent that an app offers sees the member. Others get a stored credential. | The server never sees the member. |
| Platform data | The app reaches what a space manager attached and the member can reach. | The agent gets no token, so it cannot call the space. | The server gets no token. It sees only the arguments of each call. |
| Model | A space manager sets the [model slot](../vector-apps/glossary.md#model-slot) the app uses. | The remote agent runs on its own model. | None. The model call of the calling agent goes through the [AI gateway](./glossary.md#ai-gateway). |
| [Acts](../vector-apps/glossary.md#acts) | Yes, from the server of the app. | No. An app that offers it can record acts for it. | No. |

## What the space does for every call

The three extensions share one path. A call starts in an agent [run](./glossary.md#run), and the run works as the member.

Before the call, the space decides what the run may reach. A Vector App is reached only if the member reaches it. An MCP tool is reached only if the member passes the context and the operation.

The space records each call. A call to an MCP server is a record with its actor. A call to an A2A agent is a run. [The record of work](./the-record-of-work.md) says what each record holds.

## Choosing an extension

Pick by what your logic does:

- **Vector App**: build one when your workflow needs screens, pages or data tables for members.
- **A2A agent**: build one when a task needs autonomous reasoning on its own model and the space hands it the task.
- **MCP server**: build one when agents need to look up data in an external API or take an action in a tool, with no screens and no reasoning. To call an existing REST API, add a REST [context](./glossary.md#context) in the Context Hub, with no MCP server.

If a workflow needs screens and also reasoning or tools, build a Vector App that offers an A2A agent or an MCP server.

## Where to go next

- [Vector Apps quickstart](../vector-apps/quickstart.md): a small app that runs on your machine, then in a space.
- [SDK overview](../sdk/overview.md): what the vs-apps SDK holds.
- [Vector Space glossary](./glossary.md): every term on this page, defined in a sentence.
