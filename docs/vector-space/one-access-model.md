---
title: One access model
description: How a request is decided, the same for the web interface, the API, agents and apps.
---

import StructureFigure from '@site/src/components/StructureFigure';
import { accessCheck } from '@site/src/diagrams/figures/access-check.ts';

Access defines the set of operations a user, agent or app is permitted to perform on a resource within a space. Vector Space works it out for each operation with a centralized check, the same for the [web interface](./glossary.md#web-interface), the API, agents and apps. The check reads four inputs, and rules say which input wins.

## A lead search limited by region

Maya, a [member](./glossary.md#member) of Acme's sales team, asks the [orchestrator agent](./glossary.md#orchestrator-agent) to find leads in the team's space. The search is an operation on a [datasource](./glossary.md#datasource) of leads, and the datasource is open to every member of the space. A [group](./glossary.md#group) that Maya belongs to has a [condition](./glossary.md#condition), region equals EU, so Maya gets EU leads only. Omar, another member of the team, is in a group whose condition is region equals US, so the same request gives Omar US leads only.

Maya can also open the lead list in a [Vector App](../vector-apps/glossary.md#app), a web app that a space shows in an iframe. Both ways in reach the datasource through the same check, so Maya sees the same EU leads.

An API key that acts as Maya gets the same EU leads.

## What the check reads

The check reads four inputs for each operation on a resource:

- **[General access](./glossary.md#general-access)**: the [role](./glossary.md#role) that a resource gives every member of the space. It is Restricted, [Can use](./glossary.md#can-use) or [Can edit](./glossary.md#can-edit).
- **[Share](./glossary.md#share)**: gives one user, group or Vector App a role on a resource. A share of a group reaches every user that the group holds, including through groups nested inside it.
- **[Block](./glossary.md#block)**: denies one user or group on one resource, whatever their shares give. A block is Everything, which denies every action, or Editing, which denies the change actions and leaves use.
- **Condition**: limits which rows an allowed operation may touch, such as the EU rows of a datasource.

A Restricted resource reaches only its owner and the users and groups that a share names. An [organization admin](./glossary.md#organization-admin) is shut out of it unless a share names them.

## How the inputs combine

<StructureFigure data={accessCheck} />

Four rules say what wins:

- General access and shares add up, so a member gets what either one gives, including the shares of the member's groups.
- A block wins, and it removes access whatever gave it, so no share and no General access brings it back.
- A condition narrows what is left after the other inputs, and nothing widens past it.
- Conditions apply to datasources and contexts only. On a datasource a condition limits the rows of every query. On a [context](./glossary.md#context) it limits the arguments of a call, so the response is not filtered afterwards.

## A centralized check for every way in

The rules are the same for every way in, and what differs is who the work runs as:

- **Web interface**: the work runs as the member.
- **API key**: runs as the identity it stands for. A personal token acts as its owner, and a key of a [service account](./glossary.md#service-account) acts as that account.
- **Agent**: reaches what the member it works for reaches, and the settings of an agent can narrow this and never widen it.
- **Vector App**: reaches only the overlap of its own shares and the access of the member. A [capability grant](../vector-apps/glossary.md#capability-grant) is a share on named capabilities of a Vector App at Can use, so the app reaches those capabilities only.

An [approval](./approvals-and-the-command-center.md) is a second check on top of access, and it never gives access.

## Where to go next

You now know the four inputs of the access check and how they combine for every way in. Read [How work moves through a space](./how-work-moves-through-a-space.md) next: it follows one request from the member to the sent email, with the access check at each point.

Related:

- [Identity and roles](./who-can-do-what.md): the four kinds of people and callers in Vector Space, and the space roles and share levels that say what each may do.
- [Approvals and the Command Center](./approvals-and-the-command-center.md): how an ask waits for a person and is decided on top of access.
- [Vector Space glossary](./glossary.md): every term of Vector Space, each defined in a sentence.
