---
title: How work moves through a space
description: One request followed from a member's question to a sent email, step by step.
---

import FlowFigure from '@site/src/components/FlowFigure';
import { workedExampleFlow } from '@site/src/diagrams/figures/worked-example-flow.ts';

Work in a space moves in steps that the platform checks and records. This page follows one request, from a member's question to a sent email, in six steps.

## Lead and figure

A [member](./glossary.md#member) asks the [orchestrator agent](./glossary.md#orchestrator-agent) to find leads and send an outreach email. One email goes to one qualified lead, and only after a person approves it.

The work uses a [Vector App](../vector-apps/glossary.md#app), a web app that a space shows in an iframe. The app is only an example. Each section below covers one or two steps, and the last one shows who ran each step.

<FlowFigure data={workedExampleFlow} />

## The request

Step 1. The member asks the orchestrator agent in a [thread](./glossary.md#thread), one conversation that only its owner reads. The agent starts a [run](./glossary.md#run), which works as the member. Access is checked as the member on each call.

The agent reaches the app only if the member reaches it. Finding leads is a read action of the app, so the agent calls it and the platform raises no [ask](./glossary.md#ask). An ask is a request that waits for a person to decide.

## Leads found, qualified and saved

Steps 2 and 3. The app uses the space's [Connectors](./glossary.md#connector): Apollo, Exa and BrightData. A connector links a space to one outside account or service.

The app qualifies the leads. For each lead it records an [act](../vector-apps/glossary.md#acts), "lead qualified". An act is one thing that an app did.

The app then saves each lead as a contact in Contacts, a [Vector Module](./glossary.md#vector-module) of the space. The leads stay in the space, so the agent can read them in the next step.

## The draft

Step 4. The agent drafts one email for a qualified lead, using the contacts. The model call goes through the [AI gateway](./glossary.md#ai-gateway), the one route for every paid model call. The run still works as the member.

## The pause for approval

Step 5. The Omnibox is a Vector Module that sends mail for the space. Sending an email is a write, and sends through the Omnibox need approval by default. So the run stops and an ask appears in the [Command Center](./glossary.md#command-center).

The member who asked decides, because a person answers for their own run. When the member approves, the run resumes as that same member. An approval is a second check and never gives access.

[Approvals and the Command Center](./approvals-and-the-command-center.md) explains how an ask is decided.

## The send

Step 6. After the approval, the email goes out through the Omnibox. The run still works as the member. The app records no act for the send.

## The record of work

Vector Space records the [actor](./glossary.md#actor) of each [execution](./glossary.md#execution), which is who it ran as. An execution is one unit of work, such as an agent run. The orchestrator agent is not an actor. Its steps run as the member.

| Step | What happens | Actor |
| --- | --- | --- |
| 1 | The member asks the agent to find leads. | Member |
| 2 | The platform records each connector call. The app records "lead qualified" for each lead. | App |
| 3 | The app saves the leads as contacts. | App |
| 4 | The agent drafts the email through the AI gateway. | Member |
| 5 | The member approves the ask. | Member |
| 6 | The email goes out through the Omnibox. | Member |

[The record of work](./the-record-of-work.md) explains the actor and the four views that read these records.

## Where to go next

- [Approvals and the Command Center](./approvals-and-the-command-center.md): read how an ask is decided and what happens after.
- [Extending a space](./extending-a-space.md): see the three kinds of outside code that a space can call.
- [The record of work](./the-record-of-work.md): read how each step is recorded and who can see it.
- [Vector Space glossary](./glossary.md): look up each term on this page.
