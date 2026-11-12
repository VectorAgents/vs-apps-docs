---
title: Roles and permissions
description: Five kinds of people and callers, Can use and Can edit.
---

Vector Space has five kinds of people and callers, and each kind has a place in an [organization](./glossary.md#organization), the company account in Vector Space:

- **[Organization admin](./glossary.md#organization-admin)**: the one person who runs the organization. The admin creates spaces, users and service accounts, and manages AI provider accounts.
- **[Space managers](./glossary.md#space-manager)**: users who hold [Can edit](./glossary.md#can-edit) on a [space](./glossary.md#space), or the organization admin. They manage the members, [groups](./glossary.md#group), [shares](./glossary.md#share), resources, agent and apps of the space.
- **[Members](./glossary.md#member)**: people in an organization who work in a space. They chat with agents, build pages and answer what agents ask.
- **[Staff](./glossary.md#staff)**: Vector employees who run the platform across organizations. They run the app registry and set the [spend cap](./glossary.md#spend-cap) of an organization.
- **[Service accounts](./glossary.md#service-account)**: users of an organization that are not people, such as the identity behind an API key or a schedule. They reach what a member reaches, own no resources and are never space managers.

A kind says who a user is in an organization. A [role](./glossary.md#role) says what the user may do on one resource, and a share gives the role Can use or Can edit.

## A new member in a team's space

Acme's sales team has a space, and a new member joins it and asks the [orchestrator agent](./glossary.md#orchestrator-agent) to find leads and send an outreach email. The agent works for that member, so it reaches what the member reaches.

The member cannot add another member to the space. A space manager of the space can, and so can the organization admin, who can also create a new space.

## How each kind reaches a space

Four rules say how the kinds reach a space:

- **Organization admin**: an organization has one, and a transfer passes the position to another member. The admin is a space manager of every space, with no share needed.
- **Members**: a member reaches what each resource's [General access](./glossary.md#general-access) gives every member of the space, and a share gives more. A member can also create resources, and each one starts private to its creator.
- **Can edit on a space**: only a space manager gives it to another user. A group can hold it, and then every user of the group is a space manager. A service account never holds it, not even through a group.
- **Restricted resources**: closed even to the organization admin unless a share names them, and [One access model](./one-access-model.md) gives the rule.

## What Can use and Can edit mean

A share gives one user, group or app one role on one thing, such as the space or a resource. Vector Space has two roles:

- **[Can use](./glossary.md#can-use)**: lets a user use a thing without changing it.
- **[Can edit](./glossary.md#can-edit)**: lets a user configure a thing and use it.

A role is not a set of people. A group is a set of users and groups, and a share that gives a role to a group gives it to every user the group holds. The effect of Can edit depends on where it is given:

- **On the space**: makes a user a space manager.
- **On a resource**: lets the user configure that resource only.

[One access model](./one-access-model.md) shows how Vector Space joins shares, General access, [blocks](./glossary.md#block) and [conditions](./glossary.md#condition) into one answer for each operation.

## Where to go next

- [One access model](./one-access-model.md): the check that decides what a user, an agent or an app may do on a resource, whatever the way in.
- [Organizations and spaces](./organizations-and-spaces.md): the organization that holds users, resources and spaces, and the space where one team works.
- [Glossary](./glossary.md): every term of Vector Space, each defined in a sentence.
