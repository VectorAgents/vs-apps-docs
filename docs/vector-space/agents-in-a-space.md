---
title: Agents in a space
description: What an agent is, how the orchestrator agent hands work to other agents, and how threads and runs keep that work apart.
---

import StructureFigure from '@site/src/components/StructureFigure';
import { agentTree } from '@site/src/diagrams/figures/agent-tree.ts';

An [agent](./glossary.md#agent) is a model that is set up with instructions, tools and resources. It works inside one [space](./glossary.md#space). Each space has one [orchestrator agent](./glossary.md#orchestrator-agent). It takes the request of a [member](./glossary.md#member) and hands parts of it to other agents. This page shows how those agents fit together and how their conversations are kept apart.

## Example

A member of the sales space asks the orchestrator agent to find leads and send an outreach email. The orchestrator agent hands the lead search to one agent and the email draft to another. Each of them sees only what the member may see. The member does not choose which agent does what. The member gets one reply, built from the answers of both.

## Agents and the orchestrator agent

An agent has instructions that say what it does and tools that let it act. It also has resources that it may read, such as a mailbox or a database. A person who manages agents sets them up in [Agent Studio](./glossary.md#agent-studio), which holds the instructions and the evaluations of each agent.

Each space starts with exactly one orchestrator agent, created with the space. An organization has none of its own. The request of a member goes to the orchestrator agent first.

The orchestrator agent manages the agents below it. It decides which agent gets which part of the request, and it gives the member one reply.

## The agent tree

<StructureFigure data={agentTree} />

The agents of a space form a tree. The orchestrator agent is the root. Below it sit agents for specific jobs, such as searching leads or drafting email. Each of these agents can have child agents of its own, which take parts of its job.

An agent that searches leads can hand each source to its own child agent. Only agents built into the space have child agents.

The tree ends in leaves. A leaf has no child agents of its own. There are two kinds of leaf:

- An [A2A](./glossary.md#a2a) agent is a remote agent that its owner runs outside the space. The owner controls its prompt and model, and the orchestrator agent reaches it with an [agent card](./glossary.md#agent-card). A [Vector App](../vector-apps/glossary.md#app), a web app that a space shows in an iframe, can offer an agent of this kind. [Extending a space](./extending-a-space.md) says how.
- A short-lived helper is started by an agent for one task. It is retired when the task ends.

An agent moves only within its own space. A [connector](./glossary.md#connector) is something an agent uses. It is not an agent that gets work handed to it.

## Threads and runs

A [thread](./glossary.md#thread) is one conversation with one agent. Only its owner reads it. No one else can open it, an Organization admin included. Anyone else who asks for it gets "not found".

A [run](./glossary.md#run) is one execution of one agent in a thread. It closes when it ends. When the orchestrator agent hands work to another agent, that agent has a run of its own.

## Where to go next

- [How work moves through a space](./how-work-moves-through-a-space.md): follow one request from the member to the sent email.
- [One access model](./one-access-model.md): see how Vector Space decides what an agent may reach.
- [Vector Space glossary](./glossary.md): look up each term on this page.
