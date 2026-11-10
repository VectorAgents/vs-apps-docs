---
title: What Vector Space is
description: What Vector Space is, how its work is organized, the three rules every part follows and where outside code plugs in.
---

import StructureFigure from '@site/src/components/StructureFigure';
import { spaceStructure } from '@site/src/diagrams/figures/space-structure.ts';

[Vector Space](./glossary.md#vector-space) is where the people and [AI](./glossary.md#ai) [agents](./glossary.md#agent) of an [organization](./glossary.md#organization) work together on the organization's own data, as one platform rather than a set of separate AI tools. It brings the organization's systems, knowledge and processes into one place, where an [orchestrator agent](./glossary.md#orchestrator-agent) can use them. Each [run](./glossary.md#run) of an agent follows the organization's access rules, uses its own [AI provider accounts](./glossary.md#ai-provider-account) and leaves a record of who ran it.

Work sits in three nested levels:

- **An organization** is the company account that holds all its users, keys, resources and spaces.
- **A [space](./glossary.md#space)** is where one team works. It belongs to one organization, an agent works only inside its own space, and no resource is shared across spaces.
- **Pages and widgets** lay out the content of a space. A [space page](./glossary.md#space-page) is a grid of [widgets](./glossary.md#widget) of two kinds. A data widget runs one saved query on a [datasource](./glossary.md#datasource) and renders the result as a chart, a table or a key figure. A document widget holds text that people edit together or that a schedule writes. A [member](./glossary.md#member) can prompt the widget builder in natural language and it writes the query, and an agent can do the same.

## A request in a space

A member of a sales team's space asks the orchestrator agent to find leads. The orchestrator agent hands the search on, and it looks only at data that the organization has connected to that space and that this member may see, so another member with different access might see different leads. The model call goes through the [AI gateway](./glossary.md#ai-gateway) on the organization's own AI provider account, and no agent holds a provider key. The record shows that the member started the run.

## The three platform rules

An organization that lets agents act on its own data has to answer three questions: who may reach what, whose keys and money a model call uses, and who did what. Each question has one rule, and each rule holds for every part of Vector Space. [Why Vector Space](./why-vector-space.md) gives the reasons.

- **One access model**: one check decides each request, and a person and an agent face that same check, whether the request comes from the web app, the API, an agent or an app. [One access model](./one-access-model.md) gives the detail.
- **One AI gateway**: every paid model call goes through the gateway, so no agent or app holds an AI provider key and the organization controls its spend.
- **One record of work**: every run, call and cost is recorded with the person or service that started it. [The record of work](./the-record-of-work.md) shows how.

## The parts of a space

<StructureFigure data={spaceStructure} />

The figure shows the five parts of a space and the three things that plug in from outside it. [Organizations and spaces](./organizations-and-spaces.md) explains how a space and its organization fit.

- **Members**: the people of the space. [Who can do what](./who-can-do-what.md) names the kinds of people and callers.
- **Orchestrator agent**: the one agent that each space starts with, which takes a request and hands parts of it to other agents. [Agents in a space](./agents-in-a-space.md) shows how they fit together.
- **[Command Center](./glossary.md#command-center)**: where an [ask](./glossary.md#ask) waits for a person. When an agent needs approval or an answer, the run pauses and the ask goes here, and the Command Center is a plain part of a space, not a Vector Module. [Approvals and the Command Center](./approvals-and-the-command-center.md) covers asks.
- **[Context Hub](./glossary.md#context-hub)**: the list of what the space can reach, which holds connectors, knowledge sources, datasources, skills and apps. [What a space holds](./what-a-space-holds.md) describes each kind.
- **[Vector Modules](./glossary.md#vector-module)**: first-party tools that work over connector data and sit in the Context Hub. [What a space holds](./what-a-space-holds.md) says more. The modules are:
  - `omnibox`, which shows mail and LinkedIn conversations in one stream to read and reply to.
  - `contacts`, which holds the contact rows of the space.
  - Calendar.

The lowest slab of the figure is Governance. It reads across the whole organization to show what ran and as whom. [The record of work](./the-record-of-work.md) covers it.

## Where outside code plugs in

When a team needs logic of its own, three kinds of outside code can plug into a space. [Extending a space](./extending-a-space.md) compares them.

- **[Vector App](../vector-apps/glossary.md#app)**: a web app that a space shows in an iframe.
- **[A2A](./glossary.md#a2a) agent**: a remote agent that agents of the space hand work to.
- **[MCP](./glossary.md#mcp) connector**: a connector to a remote set of tools that agents of the space call.

## Where to read next

To explore the platform, choose the section that matches your goal: understanding the core parts, learning the rules behind them, or seeing how work runs and how to extend it.

**Core concepts**

- [Organizations and spaces](./organizations-and-spaces.md): the organization as the tenant, and the space as the unit of work.
- [What a space holds](./what-a-space-holds.md): the Context Hub, pages and widgets, apps and Vector Modules.
- [Agents in a space](./agents-in-a-space.md): the orchestrator agent, the agent tree, threads and runs.
- [Who can do what](./who-can-do-what.md): the kinds of people and callers, and what Can use and Can edit mean.

**Architecture and governance**

- [Why Vector Space](./why-vector-space.md): the problem the platform solves and the rules every part follows.
- [One access model](./one-access-model.md): how one check decides each request, for the UI, the API, agents and apps.
- [The record of work](./the-record-of-work.md): who ran what, the four governance views and spend.

**Workflows and extensions**

- [How work moves through a space](./how-work-moves-through-a-space.md): one request followed step by step.
- [Approvals and the Command Center](./approvals-and-the-command-center.md): asks, standing approvals and schedules.
- [Extending a space](./extending-a-space.md): a Vector App, an A2A agent and an MCP connector compared.

Look up any term in the [Vector Space glossary](./glossary.md).
<!-- hmr-probe -->
