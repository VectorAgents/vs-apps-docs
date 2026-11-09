---
title: One access model
description: How a request is decided, the same for the UI, the API, agents and apps.
---

import FigurePlaceholder from '@site/src/components/FigurePlaceholder';

Access is what a caller may do on a resource in a space. Vector Space works it out for each operation with one check, the same for the UI, the API, agents and apps. The check reads four inputs, and clear rules say which input wins.

## Example

A [member](./glossary.md#member) of the sales space asks the [orchestrator agent](./glossary.md#orchestrator-agent) to find leads. The search is an operation on a [datasource](./glossary.md#datasource) of leads. The datasource is open to every member of the space. A [group](./glossary.md#group) that the member belongs to has a [condition](./glossary.md#condition): region equals EU. The member gets EU leads only.

The same holds when the member opens the lead list in a [Vector App](../vector-apps/glossary.md#app), a web app that a space shows in an iframe. Both ways in reach the datasource through the same check.

An API key that acts as the member gets the same EU leads.

## What the check reads

The check reads four inputs for each operation on a resource.

- [General access](./glossary.md#general-access) is the [role](./glossary.md#role) that a resource gives every member of the space. It is Restricted, [Can use](./glossary.md#can-use) or [Can edit](./glossary.md#can-edit).
- A [share](./glossary.md#share) gives one user, group or Vector App a role on a resource. A share of a group reaches every user that the group holds.
- A [block](./glossary.md#block) denies one user or group on one resource, whatever their shares give.
- A condition limits which rows an allowed operation may touch, such as the EU rows of a datasource.

One rule is easy to miss. A Restricted resource reaches only its owner and the users and groups that a share names. An [Organization admin](./glossary.md#organization-admin) is shut out of a Restricted resource unless a share names them.

## How the inputs combine

<FigurePlaceholder slot="access-check" />

These rules say what wins. They are not a numbered order.

- General access and shares add up. A caller gets what either one gives, including the shares of the caller's groups.
- A block wins. It removes access whatever gave it, so no share and no General access brings it back.
- A condition narrows what is left, and nothing widens past it.
- Conditions apply to datasources and connectors only. On a [datasource](./glossary.md#datasource) a condition limits the rows of every query. On a [connector](./glossary.md#connector) it limits the arguments of a call, and the response is not filtered afterwards.

## One check for every way in

The rules are the same for every way in. What differs is who the work runs as.

- In the web app, the work runs as the member.
- An API key runs as the identity it stands for. A personal token acts as its owner. A key of a [service account](./glossary.md#service-account) acts as that account.
- An agent reaches what the member it works for reaches. The settings of an agent can narrow this and never widen it.
- A Vector App reaches only the overlap of its own shares and the access of the member. A [capability grant](../vector-apps/glossary.md#capability-grant) is a share on named capabilities of a Vector App at Can use. So the app reaches exactly those capabilities.

An [approval](./approvals-and-the-command-center.md) is a second check on top of access, and it never gives access.

## Where to go next

- [Who can do what](./who-can-do-what.md): read who the five kinds of people and callers are, and what Can use and Can edit mean.
- [How work moves through a space](./how-work-moves-through-a-space.md): follow one request through the check, from the member to the sent email.
- [Vector Space glossary](./glossary.md): look up each term on this page.
