---
title: Agent Studio
description: What Agent Studio is, how the agents of a space are set up and tested there, and how a change moves from a draft to a published version.
---

import StructureFigure from '@site/src/components/StructureFigure';
import FlowFigure from '@site/src/components/FlowFigure';
import { agentStudioTree } from '@site/src/diagrams/figures/agent-studio-tree.ts';
import { agentStudioAccess } from '@site/src/diagrams/figures/agent-studio-access.ts';
import { agentStudioLifecycle } from '@site/src/diagrams/figures/agent-studio-lifecycle.ts';

[Agent Studio](./glossary.md#agent-studio) is the part of Vector Space where the [agents](./glossary.md#agent) of a [space](./glossary.md#space) are set up, tested and published. It gives a team one place to change how its agents work, and each change is saved as a version, a fixed copy of the settings of an agent that can be tested and restored.

## A support message in a space

A support team has a space with a [channel](./glossary.md#channel), an agent that people reach through a messaging service. A customer writes in a [linked chat](./glossary.md#linked-chat), a chat on the channel that its owner has linked to the space. The message reaches the [orchestrator agent](./glossary.md#orchestrator-agent), which hands it to a ticket-classifier agent that sorts it by topic and urgency.

The orchestrator agent then hands the case to a remote [A2A](./glossary.md#a2a) agent of the team's customer system, which looks up the customer. The orchestrator agent sends one reply back to the chat. The team set up all of these agents in Agent Studio, tested them on a draft and published them in one step, which made the new settings live for everyone who reaches the space.

## What Agent Studio is for

Agent Studio holds the settings of each agent: what it is told to do, which tools and knowledge it may use, which channels reach it and which evaluations score it. A team changes its agents often, and a bad change would reach every person who uses the space.

So Agent Studio keeps work in progress apart from what runs. Edits go to a draft, the working copy of the agents. An [evaluation](./glossary.md#evaluation) tests an agent before a change goes live, and an earlier version can be restored if a change goes wrong.

An [organization admin](./glossary.md#organization-admin) can configure, delete or reset an agent in a space. The [audit trail](./glossary.md#audit) records every change to the configuration of an agent.

## How agents are arranged

Each space has one orchestrator agent. It is the root of the agent tree, and every other agent of the space is below it. Each agent is either built into the space or a remote A2A agent. A remote A2A agent runs outside the space, and someone who may manage agents in the space adds it to the agent tree.

<StructureFigure data={agentStudioTree} />

The orchestrator agent hands work to agents for a job, and those agents can hand work to their own child agents. Only the output of the orchestrator agent reaches the [member](./glossary.md#member), and the child agents report up to it. An agent can also start a short-lived helper for one task. The helper has no child agents, and it retires when it finishes cleanly.

These facts matter when many agents work together:

- **Separate state**: the platform saves a checkpoint for each child agent, so siblings never share state. A remote A2A agent has no checkpoint, and the remote side carries its conversation.
- **Caps**: each parent agent has a fixed cap on helpers, and each organization has a fixed cap on running work.
- **Pauses**: a pause in a child agent holds its parent. The parent resumes once, when no child agent is still waiting.
- **Records**: every [run](./glossary.md#run), child agent, helper and A2A call opens a record of its own. The tool calls that a remote A2A agent makes on its own side are not recorded. A [thread](./glossary.md#thread) belongs to its owner alone.
- **Remote credentials**: if a call to a remote agent fails on a credential, the agent gets one generic refusal, so it cannot probe stored credentials. The detail goes to the log. Two organizations that point at one [agent card](./glossary.md#agent-card) never share a credential.

## What a run may use

An agent acts for the member who asks, so it can reach nothing that the member cannot, and its scope can narrow that further. A run that a channel, an app or an API key starts acts as the identity of that channel, app or key instead. A new agent starts with no tools and no knowledge, and an empty scope reaches nothing. A remote A2A agent takes none of the tools of the space. The check runs each time a run starts or resumes, so a change to what the member may use applies from then.

<FlowFigure data={agentStudioAccess} />

Two kinds of resource show the check at work:

- **[Datasource](./glossary.md#datasource)**: a [condition](./glossary.md#condition) filters the rows of every query, and the platform checks it before the query runs. An agent does not see a datasource that its member may not query.
- **[Connector](./glossary.md#connector)**: a condition guards the arguments of a call and does not filter the response. The agent is told when a call is refused.

A condition does not bind an owner or an organization admin, and a missing attribute value fails closed: the member reaches nothing.

## The life of a change

Every edit writes to the draft. An edit that changes a versioned setting saves a new version at the same moment, so nobody presses a save button. Three actions then move the draft and the published agents:

<FlowFigure data={agentStudioLifecycle} />

- **Publish**: makes the draft of every agent in the tree its published version in one step, and removes agents that were deleted in the draft.
- **Reset**: rewrites each published agent from its published version, brings back a published agent that was deleted in the draft, and deletes agents that were never published.
- **Restore**: moves the draft back to an earlier version. It saves no version itself, and the next edit does.

Whether the orchestrator agent accepts A2A calls, and the judge of an evaluation, take effect without a publish.

A run keeps the version it started on. An edit applies from the next run, even if the current run is paused for days. A chat in the web interface, channels and calls from other agents run the published version. A test in Agent Studio, or an evaluation that is set to the draft, runs the draft.

An evaluation is a set of saved questions, each with the expected answer that its author wrote. Each question runs as a real run, against the draft or the published version as chosen. A judge model compares each answer with the expected answer, scores it as correct, partly correct or wrong, and gives a short reason. The judge is set to score consistently, so a change in score comes from the agent and not from the judge. The judge model is set for each agent and is not part of a version. The saved questions live in an outside tracing service.

Every paid model call of an evaluation goes through the [AI gateway](./glossary.md#ai-gateway), and the organization pays through its own [AI provider accounts](./glossary.md#ai-provider-account). The spend is recorded against the member who ran the evaluation. Evaluation items wait behind chat work in the queue, so an evaluation does not slow a chat.

## Skills, channels and approvals

- **[Skills](./glossary.md#skill)**: a skill is a stored resource in the space. A member needs [Can use](./glossary.md#can-use) to read it and [Can edit](./glossary.md#can-edit) to change it. A skill can refer to another skill. A built-in skill is defined by the platform: it is not stored, has no resource and cannot be shared. If a member can see a skill but cannot read it, they see only its name and description.
- **Channels**: the owner of a channel links a chat by posting a one-time code in it. The channel accepts a message only from a linked chat and ignores anything else with no reply. A new credential for the channel replaces its webhook secret and unlinks every chat.
- **Who a channel runs as**: a message in a linked chat runs as the owner of the channel. The owner can choose a [service account](./glossary.md#service-account) to run as instead, if the owner can administer that account and it can view the space. Changing this unlinks every chat.
- **Group chats**: every member of a group chat acts with the identity of the channel. Group input is untrusted, so those runs carry only the standing approvals that were made for unattended use.
- **Approvals**: a run that needs a person raises an [ask](./glossary.md#ask) and waits in the [Command Center](./glossary.md#command-center). A decision on an ask gives the run no extra access. Nothing is denied by a timer, so a pause lasts as long as it needs. An approval loosens only through a [standing approval](./glossary.md#standing-approval).

## Use cases

**Financial analysis.** A finance team's space has an analyst agent. A member asks for revenue by region, and the agent queries a datasource. The condition of the member decides which rows come back, so two members who ask the same question can get different totals. Sharing the result is a write, and it waits for approval.

**Employee onboarding.** An HR team's space has an orchestrator agent that runs onboarding for new hires as a service account. It reaches only what is shared with that account, such as a shared folder of welcome documents. When a step needs approval, such as sending a welcome email, the run waits in the Command Center. A service account cannot decide, so the owner of its API key answers. A standing approval of the space can pre-approve the run, because "always allow" belongs to one person and not to an account.

## Where to go next

- [One access model](./one-access-model.md): the check that decides what a user, an agent or an app may do in a space.
- [Approvals and the Command Center](./approvals-and-the-command-center.md): how an ask waits for a person and is decided.
- [The record of work](./the-record-of-work.md): how each run is recorded, and the four views that read the records.
- [Glossary](./glossary.md): every term of Vector Space, each defined in a sentence.
