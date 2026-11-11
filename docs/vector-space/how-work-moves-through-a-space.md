---
title: How work moves through a space
description: One request followed from a member's question to a sent email, step by step.
---

import FlowFigure from '@site/src/components/FlowFigure';
import { workedExampleFlow } from '@site/src/diagrams/figures/worked-example-flow.ts';

Work in a space moves in steps that the platform checks and records. This page follows one request, from a member's question to a sent email, in six steps.

## A member's outreach request

Acme's sales team has a space, and a [member](./glossary.md#member) of it asks the [orchestrator agent](./glossary.md#orchestrator-agent) to find leads and send an outreach email. One email goes to one qualified lead, and only after a person approves it.

The work uses a [Vector App](../vector-apps/glossary.md#app), a web app that a space shows in an iframe. The app is only an example.

<FlowFigure data={workedExampleFlow} />

## The six steps

Each step ends with its [actor](./glossary.md#actor), the identity that it ran as. The orchestrator agent is not an actor: its steps run as the member.

1. **Request**: the member asks the orchestrator agent in a [thread](./glossary.md#thread), one conversation that only its owner reads. The agent starts a [run](./glossary.md#run), which works as the member. The agent reaches the app only if the member reaches it. Finding leads is a read action of the app, so the platform raises no [ask](./glossary.md#ask). Actor: member.
2. **Find and qualify**: the app uses the space's [Connectors](./glossary.md#connector), which are Apollo, Exa and BrightData. A connector links a space to one outside account or service. The platform records each connector call. The app qualifies the leads and records an [act](../vector-apps/glossary.md#acts) for each one, "lead qualified". Actor: app.
3. **Save**: the app saves each lead as a contact in Contacts, a [Vector Module](./glossary.md#vector-module) of the space. The leads stay in the space, so the agent can read them in the next step. Actor: app.
4. **Draft**: the agent drafts one email for a qualified lead, using the contacts. The model call goes through the [AI gateway](./glossary.md#ai-gateway), the one route for every paid model call. Actor: member.
5. **Approve**: the Omnibox is a Vector Module for the space's mail and LinkedIn conversations. Sending an email is a write, and sends through the Omnibox need approval by default. So the run stops and an ask appears in the [Command Center](./glossary.md#command-center). The member who asked decides, because a person answers for their own run, and the run resumes as that same member. Actor: member.
6. **Send**: the email goes out through the Omnibox. The app records no act for the send. Actor: member.

## Where to go next

- [Approvals and the Command Center](./approvals-and-the-command-center.md): how an ask waits for a person and is decided.
- [Extending a space](./extending-a-space.md): the three kinds of extension that a space can call.
- [The record of work](./the-record-of-work.md): how each step is recorded, who can see it, and the four views that read the records.
- [Vector Space glossary](./glossary.md): every term on this page, defined in a sentence.
