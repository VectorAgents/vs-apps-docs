---
title: Approvals and the Command Center
description: Asks, standing approvals and schedules.
---

import FlowFigure from '@site/src/components/FlowFigure';
import { approvalsFlow } from '@site/src/diagrams/figures/approvals-flow.ts';

An [ask](./glossary.md#ask) is anything that an agent or an app waits on a person for, such as approval to make a change. The [Command Center](./glossary.md#command-center) is the part of a [space](./glossary.md#space) where asks wait. It also lists the [standing approvals](./glossary.md#standing-approval) that let a call run without asking and the [schedules](./glossary.md#schedule) that a person owns.

## A status note that waits for approval

Acme's sales team has a space, and a [member](./glossary.md#member) of it asks the [orchestrator agent](./glossary.md#orchestrator-agent) to post a status note to the team chat. The post goes out through a [connector](./glossary.md#connector), and it changes something outside the space. So the [run](./glossary.md#run) stops, and an ask appears in the Command Center.

The member reads the ask and approves it. The run continues and the note is posted. The member also ticks "always allow", so the same post runs later with no ask.

## The ask and who decides it

An agent raises an ask when its run reaches an operation that writes, such as a post to a team chat. It also raises one when it needs a person to answer a question. A [Vector App](../vector-apps/glossary.md#app), a web app that a space shows in an iframe, raises one for an approval that it declares.

The Command Center is a plain part of a space. It is not a [Vector Module](./glossary.md#vector-module).

Each ask goes to its answerer, the person who answers for the run:

- **Member**: answers for their own run.
- **[Service account](./glossary.md#service-account)**: cannot decide. The owner of its API key answers. If there is none, the owner of the [thread](./glossary.md#thread) or [schedule](./glossary.md#schedule) that it ran for answers.
- **App**: an ask that an app raises from its own server goes to the [space managers](./glossary.md#space-manager).

A space manager also sees an ask whose answerer can no longer view the space. Anyone who leaves a space stops seeing and deciding its asks.

<FlowFigure data={approvalsFlow} />

## After a decision

A run that raises an ask stops where it is and waits. A decision is a second check, never extra access. An ask ends in one of four ways:

- **Approved**: the run continues as its own [actor](./glossary.md#actor), the same identity as before. The identity of the person who decided never reaches the run. A person who approves with changes, or who answers a question that the agent asked, ends the ask the same way.
- **Rejected**: the rejection goes back to the run.
- **Ended without a decision**: a new message in the thread, a stop, a cancelled task, a retired agent, or a deleted thread or agent ends the ask. The run does not continue.
- **Expired**: nobody answers within 400 days of the raise. Nothing is denied. When the last open ask of a paused run expires, the run is cancelled.

An app's ask pauses no run, because no run waits. A decision or an expiry is sent back to the app.

## Standing approvals

A standing approval lets one agent run one operation without asking, or lets one app's approval pass. Vector Space shows it as "always allow". It names the [context](./glossary.md#context) the call goes through, so an approval for a post through one context never covers another context.

There are two kinds. A personal approval covers the runs of the person who made it. A member makes one by ticking "always allow" on an ask that they answer. A space-wide approval covers everyone in the space, and a space manager can set one.

A standing approval covers only calls that were approved. It applies from the next run, not to the run that is already going. It stays until someone revokes it. The maker revokes their own, and a space manager revokes any in the space. [Activity](./glossary.md#activity) names the approval on a call that it let through.

## Schedules

A schedule is a background task that an agent or a person sets to run on a timer. A person can create one in the Command Center, and an agent can create one from a conversation. The Command Center lists the schedules that you own, and only the owner edits, pauses, runs or deletes a schedule.

Every run of a schedule acts as one identity. That is a service account chosen when the schedule was set up, or else the person who created it. A service account uses its own standing approvals. Any other identity uses the approvals of the owner.

A schedule whose agent writes stops at an ask. If the schedule runs as its creator and the creator ticked "always allow" first, every later run goes through with no ask.

## Where to go next

- [How work moves through a space](./how-work-moves-through-a-space.md): one request followed through an ask to a sent email.
- [The record of work](./the-record-of-work.md): where a decided ask shows in Activity.
- [Glossary](./glossary.md): every term of Vector Space, each defined in a sentence.
