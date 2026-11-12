---
title: One access model
description: How a request is decided, the same for the web interface, the API, agents and apps.
---

import StructureFigure from '@site/src/components/StructureFigure';
import { accessCheck } from '@site/src/diagrams/figures/access-check.ts';

Access defines the set of operations a user, agent or app is permitted to perform on a resource within a space. Vector Space works it out for each operation with one check, the same for the [web interface](./glossary.md#web-interface), the API, agents and apps, and the check reads four inputs, with clear rules that say which input wins.

## A lead search limited by region

Acme's sales team has a space, and a [member](./glossary.md#member) of it asks the [orchestrator agent](./glossary.md#orchestrator-agent) to find leads. The search is an operation on a [datasource](./glossary.md#datasource) of leads, and the datasource is open to every member of the space. A [group](./glossary.md#group) that the member belongs to has a [condition](./glossary.md#condition), region equals EU, so the member gets EU leads only.

The same holds when the member opens the lead list in a [Vector App](../vector-apps/glossary.md#app), a web app that a space shows in an iframe, because both ways in reach the datasource through the same check.

An API key that acts as the member gets the same EU leads.

## What the check reads

The check reads four inputs for each operation on a resource:

- **[General access](./glossary.md#general-access)**: the [role](./glossary.md#role) that a resource gives every member of the space, which is Restricted, [Can use](./glossary.md#can-use) or [Can edit](./glossary.md#can-edit).
- **[Share](./glossary.md#share)**: gives one user, group or Vector App a role on a resource, and a share of a group reaches every user that the group holds, including through groups nested inside it.
- **[Block](./glossary.md#block)**: denies one user or group on one resource, whatever their shares give, as Everything, which denies every action, or Editing, which denies the change actions and leaves use.
- **Condition**: limits which rows an allowed operation may touch, such as the EU rows of a datasource.

One rule is easy to miss. A Restricted resource reaches only its owner and the users and groups that a share names, so an [Organization admin](./glossary.md#organization-admin) is shut out of it unless a share names them.

## How the inputs combine

<StructureFigure data={accessCheck} />

These rules say what wins, and they are not a numbered order:

- General access and shares add up, so a user gets what either one gives, including the shares of the user's groups.
- A block wins, and it removes access whatever gave it, so no share and no General access brings it back.
- A condition narrows what is left after the other inputs, and nothing widens past it.
- Conditions apply to datasources and contexts only. On a datasource a condition limits the rows of every query, and on a [context](./glossary.md#context) it limits the arguments of a call, so the response is not filtered afterwards.

## One check for every way in

The rules are the same for every way in, and what differs is who the work runs as:

- **Web interface**: the work runs as the member.
- **API key**: runs as the identity it stands for, so a personal token acts as its owner and a key of a [service account](./glossary.md#service-account) acts as that account.
- **Agent**: reaches what the member it works for reaches, and the settings of an agent can narrow this and never widen it.
- **Vector App**: reaches only the overlap of its own shares and the access of the member. A [capability grant](../vector-apps/glossary.md#capability-grant) is a share on named capabilities of a Vector App at Can use, so the app reaches exactly those capabilities.

An [approval](./approvals-and-the-command-center.md) is a second check on top of access, and it never gives access.

## Where to go next

- [Roles and permissions](./who-can-do-what.md): the five kinds of people and callers in Vector Space, and what Can use and Can edit mean for each.
- [How work moves through a space](./how-work-moves-through-a-space.md): one request followed from the member to the sent email, with the access check at each point.
- [Glossary](./glossary.md): every term of Vector Space, each defined in a sentence.
