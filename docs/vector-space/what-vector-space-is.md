---
title: What Vector Space is
description: What Vector Space is, how its work is organized, the three rules every part follows and the ways to extend a space.
---

import StructureFigure from '@site/src/components/StructureFigure';
import { spaceStructure } from '@site/src/diagrams/figures/space-structure.ts';

[Vector Space](./glossary.md#vector-space) is where the people and [AI](./glossary.md#ai) [agents](./glossary.md#agent) of an [organization](./glossary.md#organization) work together on the organization's own data, as one platform rather than scattered AI tools. It brings the organization's systems, knowledge and processes into one place, where an [orchestrator agent](./glossary.md#orchestrator-agent) can use them. Each [run](./glossary.md#run) of an agent follows the organization's access rules, uses its own [AI provider accounts](./glossary.md#ai-provider-account) and registers a record of who ran it.

Work sits in three nested levels:

- **An organization** is the company account that holds all its users, API keys, resources and spaces.
- **A [space](./glossary.md#space)** is where one team works. It belongs to one organization, and an agent works only inside its own space.
- **Pages and widgets** lay out the content of a space. A [page](./glossary.md#page) is a grid of [widgets](./glossary.md#widget) of two kinds. A data widget runs one saved query on a [datasource](./glossary.md#datasource) and renders the result as a chart, a table or a key figure. A document widget holds text that people edit together or that a schedule writes. A [member](./glossary.md#member) can prompt the widget builder in natural language and it writes the query, and an agent can do the same.

## A request in a space

A member of a space asks the orchestrator agent to find leads. The orchestrator agent delegates the search to a specialized agent, which looks only at data that the organization has connected to that space and that this member may see, so another member with different access might see different leads. The model call goes through the [AI gateway](./glossary.md#ai-gateway) on the organization's own AI provider account, and no agent holds a provider key. The record shows that the member started the run.

## The three platform rules

Agents that act on an organization's data need limits on data access, AI spend and accountability. Vector Space sets those limits with three rules, and every part of the platform follows all three.

- **One access model**: one check decides each request, and a person and an agent face that same check, whether the request comes from the web app, the API, an agent or an app, as [One access model](./one-access-model.md) shows.
- **One AI gateway**: every paid model call goes through the gateway, so no agent or app holds an AI provider key and the organization controls its spend.
- **One record of work**: every run, call and cost is recorded with the person or service that started it. [The record of work](./the-record-of-work.md) describes the four governance views of who ran what, and how spend is tracked.

## The parts of a space

<StructureFigure data={spaceStructure} />

The figure shows the five parts of a space and the three [extensions](./glossary.md#extension) that reach it from outside. [Organizations and spaces](./organizations-and-spaces.md) explains how a space and its organization fit.

- **Members**: the people of the space. [Who can do what](./who-can-do-what.md) names the kinds of people and callers.
- **Orchestrator agent**: the one agent that each space starts with, which takes a request and delegates parts of it to specialized agents. [Agents in a space](./agents-in-a-space.md) shows how they fit together.
- **[Command Center](./glossary.md#command-center)**: where an [ask](./glossary.md#ask) waits for a person. When an agent needs approval or an answer, the run pauses for a person, which is [human in the loop (HITL)](./glossary.md#human-in-the-loop), and the ask goes here. The Command Center is a plain part of a space, not a Vector Module. [Approvals and the Command Center](./approvals-and-the-command-center.md) covers asks.
- **[Context Hub](./glossary.md#context-hub)**: the list of what the space can reach, which holds connectors, knowledge sources, datasources, skills and apps. [What a space holds](./what-a-space-holds.md) describes each kind.
- **[Vector Modules](./glossary.md#vector-module)**: first-party tools that work over connector data and sit in the Context Hub. [What a space holds](./what-a-space-holds.md) says more. The modules are:
  - Omnibox, which shows mail and LinkedIn conversations in one stream to read and reply to.
  - Contacts, which holds the contact rows of the space.
  - Calendar, which shows the meetings of the connected calendars.

[Governance](./glossary.md#governance) sits under the organization and reads across all of it, to show what ran and as whom. [The record of work](./the-record-of-work.md) covers it.

## Ways to extend a space

When a team needs logic of its own, it adds an extension to its space. An extension is a Vector App, an A2A agent or an MCP server. [Extending a space](./extending-a-space.md) compares them.

- **[Vector App](../vector-apps/glossary.md#app)**: a web app that a space shows in an iframe.
- **[A2A](./glossary.md#a2a) agent**: a remote agent that agents of the space hand work to.
- **[MCP](./glossary.md#mcp) server**: a remote set of tools that agents of the space call.

## Where to read next

To explore the platform, choose the section that matches your goal: understanding the core parts, learning the rules behind them, or seeing how work runs and how to extend it.

**Core concepts**

- [Organizations and spaces](./organizations-and-spaces.md): how an organization holds many spaces, and how a space is one team's place for its members, its agents and its data.
- [What a space holds](./what-a-space-holds.md): what the team of a space works with, which is where its data connects, how the data is shown, and which apps and tools run inside the space.
- [Agents in a space](./agents-in-a-space.md): how the orchestrator agent hands a request to other agents, and how the conversations of those agents are kept apart.
- [Who can do what](./who-can-do-what.md): the kinds of people and callers in Vector Space, and how each stands in an organization and its spaces.

**Architecture and governance**

- [Why Vector Space](./why-vector-space.md): the problem of controlling agents that work on an organization's own data, and the three rules that answer it.
- [One access model](./one-access-model.md): the one check that decides each request, and the rules that say which of its inputs wins.
- [The record of work](./the-record-of-work.md): what the platform writes down about each piece of work, and the four governance views that show it.

**Workflows and extensions**

- [How work moves through a space](./how-work-moves-through-a-space.md): one request followed from a member's question to a sent email in six steps.
- [Approvals and the Command Center](./approvals-and-the-command-center.md): the part of a space where asks wait for a person, with the standing approvals and the schedules that a person runs.
- [Extending a space](./extending-a-space.md): the three extensions, a Vector App, an A2A agent and an MCP server, compared from the side of the space.

Look up any term in the [Vector Space glossary](./glossary.md).
