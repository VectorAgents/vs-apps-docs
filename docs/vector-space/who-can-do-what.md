---
title: Identity and roles
description: Four kinds of people and callers, and the roles that say what each may do.
---

import LadderFigure from '@site/src/components/LadderFigure';
import { roleLadder } from '@site/src/diagrams/figures/role-ladder.ts';

[Vector Space](./glossary.md#vector-space) has four kinds of people and callers, and each kind is an identity. Three of them belong to an [organization](./glossary.md#organization), the company account in Vector Space, and [Staff](./glossary.md#staff) reach organizations from outside:

- **[Organization admin](./glossary.md#organization-admin)**: the one person who runs the organization. The admin creates spaces, users and [service accounts](./glossary.md#service-account), and manages [AI provider accounts](./glossary.md#ai-provider-account).
- **[Members](./glossary.md#member)**: people in an organization who work in a space. They chat with [agents](./glossary.md#agent), build [pages](./glossary.md#page) and answer what agents ask. A [space role](#space-roles-and-share-levels) or a [share](./glossary.md#share) gives a member more.
- **Staff**: Vector employees who run the platform across organizations. They run the app registry and set the [spend cap](./glossary.md#spend-cap) of an organization.
- **Service accounts**: users of an organization that are not people, such as the identity behind an API key or a [schedule](./glossary.md#schedule). They reach what a member reaches and what a role in a space gives them. They own no resources.

A kind says who a user is in an organization, or for Staff, how they reach one. A [role](./glossary.md#role) says what the user may do, in a space or on one resource.

## A new member in a team's space

Acme's sales team has a space, and Omar, another member of the team, joins it and asks the [orchestrator agent](./glossary.md#orchestrator-agent) to find leads and send an outreach email. The agent works for Omar, so it reaches what Omar reaches.

Lena, Acme's organization admin, adds Omar to the space. Adding a member to a space takes a [space admin](./glossary.md#space-admin) of that space. The organization admin is a space admin of every space, and can also create a new space.

## How each kind reaches a space

Four rules say how the kinds reach a space:

- **Organization admin**: an organization has one, and a transfer passes the position to another member. The admin is a space admin of every space, with no share needed.
- **Members**: a member reaches what each resource's [General access](./glossary.md#general-access) gives every member of the space, and a share gives more. A member can also create resources, and each one starts private to its creator.
- **Space roles**: a space admin gives a space role to another user. A [group](./glossary.md#group) can hold one, and then every user of the group holds it. A service account can hold one too, directly or through a group, but only the organization admin can add a service account to a space.
- **Restricted resources**: closed even to the organization admin unless a share names them.

## Space roles and share levels

A role is a set of permissions that a user or group holds in one place. Vector Space has two ladders: space roles cover a whole space, and share levels cover one resource.

- **Space member**: reaches what each resource's General access gives every member of the space.
- **[Space editor](./glossary.md#space-editor)**: builds and publishes agents, and edits the settings and event routes of an app.
- **Space admin**: holds everything a space editor holds, and also adds members and apps, sets policies and model slots, shares an app, and sets [standing approvals](./glossary.md#standing-approval) for the whole space.

<LadderFigure data={roleLadder} />

- **[Can use](./glossary.md#can-use)**: lets a user use a resource without changing it.
- **[Can edit](./glossary.md#can-edit)**: lets a user configure a resource and use it.
- **[Can manage](./glossary.md#can-manage)**: lets a user share a resource and manage who reaches it, as well as configure and use it.

A space editor holds Can edit, and a space admin holds Can manage, on every resource of the space except another member's Restricted resource. A share gives one user, group or app one share level on one resource. A group is a set of users and groups, and a share that gives a level to a group gives it to every user the group holds.

[One access model](./one-access-model.md) shows how Vector Space joins shares, General access, [blocks](./glossary.md#block) and [conditions](./glossary.md#condition) into one answer for each operation.

## Custom roles

A [custom role](./glossary.md#custom-role) is a named set of permissions that the organization admin defines. A space admin gives it to a user or group in a space, on top of their space role, and it adds permissions to that role. A custom role never lets its holder add members or apps, delete the space, or make a change that only the organization admin makes.

For example, an organization defines a role that lets its holder read the space's [governance](./glossary.md#governance) views. A space admin gives it to a member, who then reads them without becoming a space admin.

## Where to go next

You now know the four kinds of people and callers, and the roles that say what each may do. Read [One access model](./one-access-model.md) next to see how Vector Space decides what a member, an agent or an app may do on a resource, whatever the way in.

**Related**

- [Organizations and spaces](./organizations-and-spaces.md): the organization that holds users, resources and spaces, and the space where one team works.

Look up any term in the [Vector Space glossary](./glossary.md).
