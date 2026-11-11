---
title: Agents in a space
description: What an agent is, how the orchestrator agent hands work to other agents, and how threads and runs keep that work apart.
---

import StructureFigure from '@site/src/components/StructureFigure';
import { agentTree } from '@site/src/diagrams/figures/agent-tree.ts';

An [agent](./glossary.md#agent) is a model that is set up with instructions, tools and resources, and it works inside one [space](./glossary.md#space). Each space has one [orchestrator agent](./glossary.md#orchestrator-agent), which takes the request of a [member](./glossary.md#member) and hands parts of it to other agents. This page shows how those agents fit together and how their conversations are kept apart.

## A lead search handed to two agents

Acme's sales team has a space, and a member of it asks the orchestrator agent to find leads and send an outreach email. The orchestrator agent hands the lead search to an agent for that job and the email draft to another, and each of them sees only what the member may see. The member does not choose which agent does what, and gets one reply that is built from the answers of both.

## Agents and the orchestrator agent

An agent has three parts:

- **Instructions**: say what the agent does.
- **Tools**: let the agent act.
- **Resources**: what the agent may read, such as a mailbox or a database.

A space manager sets up agents in [Agent Studio](./glossary.md#agent-studio), which holds the instructions and the evaluations of each agent.

Each space starts with one orchestrator agent, created with the space. An organization has none of its own. The request of a member goes to the orchestrator agent first.

The orchestrator agent manages the agents below it. It decides which agent gets which part of the request, and it gives the member one reply.

## The agent tree

<StructureFigure data={agentTree} />

The agents of a space form a tree with three kinds of position:

- **Orchestrator agent**: the root of the tree.
- **Agents for jobs**: sit below the orchestrator agent and take specific jobs, such as searching leads or drafting email. Each of them can have child agents of its own, which take parts of its job, so an agent that searches leads can hand each source to its own child agent. Only agents built into the space have child agents.
- **Leaves**: have no child agents of their own, and there are two kinds:
  - **[A2A](./glossary.md#a2a) agent**: a remote agent that its owner runs outside the space. The owner controls its prompt and model, and the orchestrator agent reaches it with an [agent card](./glossary.md#agent-card). A [Vector App](../vector-apps/glossary.md#app), a web app that a space shows in an iframe, can offer an agent of this kind. [Extending a space](./extending-a-space.md) says how.
  - **Short-lived helper**: started by an agent for one task, and retired when the task ends.

An agent moves only within its own space. A [connector](./glossary.md#connector) is something an agent uses, and work is not handed to it.

## Threads and runs

- **[Thread](./glossary.md#thread)**: one conversation with one agent. Only its owner reads it, and anyone else who asks for it gets "not found", an Organization admin included.
- **[Run](./glossary.md#run)**: one execution of one agent in a thread. It closes when it ends, and when the orchestrator agent hands work to another agent, that agent has a run of its own.

## Where to go next

- [How work moves through a space](./how-work-moves-through-a-space.md): one request followed from the member to the sent email.
- [One access model](./one-access-model.md): the check that decides what a user, an agent or an app may do in a space.
- [Agent Studio](./agent-studio.md): how the agents of a space are set up, tested and published.
- [Glossary](./glossary.md): every term of Vector Space, each defined in a sentence.
