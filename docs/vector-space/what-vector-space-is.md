---
title: What Vector Space is
description: What Vector Space is, the three rules every part follows, the parts of a space and where to read next.
---

import StructureFigure from '@site/src/components/StructureFigure';
import { spaceStructure } from '@site/src/diagrams/figures/space-structure.ts';

[Vector Space](./glossary.md#vector-space) is where the people and [AI](./glossary.md#ai) [agents](./glossary.md#agent) of an [organization](./glossary.md#organization) work together on the organization's own data. It brings the organization's systems, knowledge and processes into one place, where a top-level agent can use them. Each [run](./glossary.md#run) of an agent follows the organization's access rules. A run uses the organization's own AI provider accounts, which are its accounts with the companies that supply AI models. Vector Space also records who ran it.

## Example

A [member](./glossary.md#member) of the sales [space](./glossary.md#space) asks the [orchestrator agent](./glossary.md#orchestrator-agent) to find leads. The orchestrator agent hands the search on. It looks only at data that the organization has connected to that space, and only at what that member may see.

The access rules of the organization decide this for each person, so another member might see different leads. The record shows that the member started the run.

## The three platform rules

Three rules hold for every part of Vector Space. [Why Vector Space](./why-vector-space.md) gives the reasons.

- **One access model.** One check decides each request. A person and an agent face the same check. [One access model](./one-access-model.md) gives the detail.
- **One AI gateway.** Every paid model call goes through the [AI gateway](./glossary.md#ai-gateway). No agent or app holds an AI provider key, and the organization controls its spend.
- **One record of work.** Every run, call and cost is recorded with the person or service that started it. [The record of work](./the-record-of-work.md) shows how.

## The parts of a space

<StructureFigure data={spaceStructure} />

A space is where one team works. Every space belongs to one organization, the company account that holds all its users, keys, resources and spaces. An agent works only inside its own space, and no resource is shared across spaces. [Organizations and spaces](./organizations-and-spaces.md) explains how the two fit. The figure shows the five parts of a space and the three things that plug in from outside it.

- Members are the people of the space. [Who can do what](./who-can-do-what.md) names the kinds of people and callers.
- The orchestrator agent is the one agent that each space starts with. It takes a request and hands parts of it to other agents. [Agents in a space](./agents-in-a-space.md) shows how they fit together.
- The [Command Center](./glossary.md#command-center) is where an [ask](./glossary.md#ask) waits for a person. When an agent needs approval or an answer, the run pauses and the ask goes here. It is a plain part of a space, not a Vector Module. [Approvals and the Command Center](./approvals-and-the-command-center.md) covers asks.
- The [Context Hub](./glossary.md#context-hub) lists what the space can reach: connectors, knowledge sources, datasources, skills and apps. [What a space holds](./what-a-space-holds.md) describes each kind.
- [Vector Modules](./glossary.md#vector-module) are first-party tools that work over connector data, and they sit in the Context Hub. [What a space holds](./what-a-space-holds.md) says more. The modules are:
  - `omnibox`, which shows mail and LinkedIn conversations in one stream to read and reply to.
  - `contacts`, which holds the contact rows of the space.
  - Calendar.

The lowest slab of the figure is Governance. It reads across the whole organization to show what ran and as whom. [The record of work](./the-record-of-work.md) covers it.

## Where outside code plugs in

When a team needs logic of its own, three kinds of outside code can plug into a space. [Extending a space](./extending-a-space.md) compares them.

- A [Vector App](../vector-apps/glossary.md#app) is a web app that a space shows in an iframe.
- An [A2A](./glossary.md#a2a) agent is a remote agent that agents of the space hand work to.
- An [MCP](./glossary.md#mcp) connector is a connector to a remote set of tools that agents of the space call.

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
