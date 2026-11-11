---
title: Extending a space
description: A Vector App, an A2A agent and an MCP server compared.
---

import FlowFigure from '@site/src/components/FlowFigure';
import { extendingFlow } from '@site/src/diagrams/figures/extending-flow.ts';

Outside code reaches a [space](./glossary.md#space) in three ways. A [Vector App](../vector-apps/glossary.md#app) is a web app that a space shows in an iframe. An [A2A](./glossary.md#a2a) agent is a remote agent that an agent of the space hands work to. An [MCP](./glossary.md#mcp) server is a remote set of tools that agents call. All three run outside the space, on their own origins.

## A question about open tickets

Acme's engineering team has a space, and a [member](./glossary.md#member) of it asks the [orchestrator agent](./glossary.md#orchestrator-agent) which tickets are still open. The team runs a ticket tracker, and it can offer the tracker in three ways. As a Vector App, it shows its screens in the space and the agent calls its server. As an A2A agent, it reasons over tickets and the orchestrator agent hands the question to it. As an MCP server, it offers tools such as "list open tickets" that agents call.

Each call starts in the member's run. What the space sends with the call differs.

## The three kinds and how each gets in

Each kind gets in by its own path:

- **Vector App**: added in two steps. [Staff](./glossary.md#staff) register it, and a [space manager](./glossary.md#space-manager) adds it to the space. The space then shows its pages. An agent calls its endpoints with a token that the space makes for the member.
- **A2A agent**: added by someone who may manage agents in the space. The space reads its [agent card](./glossary.md#agent-card) from a URL. The agent joins the agent tree as a leaf, an agent that hands work to no one. If the organization saved a stored credential for it, the space sends that credential with each call. A stored credential is a secret that the organization keeps for one outside service.
- **MCP server**: added by a member as a connector in the [Context Hub](./glossary.md#context-hub). The connector starts as Restricted, so only that member reaches it until they share it. The space finds the tools of the server, and agents call them with the stored credential of the connector. [General access](./glossary.md#general-access) explains Restricted.

A standalone A2A agent or MCP server needs no vs-apps SDK. A Vector App can offer an A2A agent and an MCP server of its own. You declare them in the [app definition](../sdk/glossary.md#app-definition).

<FlowFigure data={extendingFlow} />

## The comparison

Each column is one kind. Each row is one thing that the space sends or gives.

| | Vector App | A2A agent | MCP server |
| --- | --- | --- | --- |
| Calling member | Named, with the capabilities they hold | Named only if an app offers it. Otherwise a stored credential, no member. | Never named |
| Platform data | Only what a space manager attached and the member reaches | Gets no token to call the space | Gets no token to call the space; receives the call's arguments |
| Model calls | A [model slot](../vector-apps/glossary.md#model-slot) a space manager sets | The remote agent's own model | None; the calling agent's model call goes through the [AI gateway](./glossary.md#ai-gateway) |
| Acts | Yes, from the app's server | No | No |

Only a Vector App records [acts](../vector-apps/glossary.md#acts), also from an A2A agent that it offers.

## What the space does for every call

The three kinds share one path. A call starts in an agent [run](./glossary.md#run), and the run works as the member.

Before the call, the space decides what the run may reach. A Vector App is reached only if the member reaches it. An MCP tool is reached only if the member passes the connector and the operation.

The space records each call. A call to an MCP server is a record with its actor. A call to an A2A agent is a run. [The record of work](./the-record-of-work.md) says what each record holds.

## Choosing a kind

Each kind fits one case:

- **Vector App**: you want members to use your own screens, data and workflow inside the space.
- **A2A agent**: you have an agent that does its own reasoning, and the space hands tasks to it.
- **MCP server**: you have tools or an API that agents call, and you need no screens and no reasoning.

## Where to go next

- [Vector Apps quickstart](../vector-apps/quickstart.md): a small app that runs on your machine, then in a space.
- [SDK overview](../sdk/overview.md): what the vs-apps SDK holds.
- [Vector Space glossary](./glossary.md): every term on this page, defined in a sentence.
