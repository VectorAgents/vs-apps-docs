---
title: Who can do what
description: Five kinds of people and callers, Can use and Can edit.
---

Vector Space has five kinds of people and callers: the [Organization admin](./glossary.md#organization-admin), [space managers](./glossary.md#space-manager), [members](./glossary.md#member), [staff](./glossary.md#staff) and [service accounts](./glossary.md#service-account). Each kind says how a user or caller stands in an organization and its spaces. A kind is not a [role](./glossary.md#role). What someone may do on one resource comes from a [share](./glossary.md#share), which gives the role Can use or Can edit.

## Example

A new member joins the sales [space](./glossary.md#space). The member asks the [orchestrator agent](./glossary.md#orchestrator-agent) to find leads and send an outreach email. The agent works for that member, so it reaches what the member reaches.

The member cannot add another member to the space. A space manager of the sales space can, and so can the Organization admin. The admin can also create a new space.

## Five kinds of people and callers

Each kind below has a place in an [organization](./glossary.md#organization), the company account in Vector Space. The table says who each kind is and what it does.

| Kind | Who they are | What they do |
| --- | --- | --- |
| [Organization admin](./glossary.md#organization-admin) | The one person who runs the organization. | Creates spaces, users and service accounts. Manages AI provider accounts. |
| [space manager](./glossary.md#space-manager) | A user who holds [Can edit](./glossary.md#can-edit) on a space, or the Organization admin. | Manages the space's members, groups, shares, resources, agent and apps. |
| [member](./glossary.md#member) | A person in an organization who works in a space. | Chats with agents, builds pages and answers what agents ask. |
| [staff](./glossary.md#staff) | Vector employees who run the platform across organizations. | Run the app registry and set the [spend cap](./glossary.md#spend-cap) of an organization. |
| [service account](./glossary.md#service-account) | A user of an organization that is not a person. | Reaches what a member reaches, owns no resources and is never a space manager. |

An organization has one Organization admin. The admin is a space manager of every space, with no share needed. The place passes to another member by a transfer.

A member reaches what each resource's [General access](./glossary.md#general-access) gives every member of the space. A share gives more. A member can also create resources, and each one starts private to its creator.

Only a space manager gives Can edit on the space to another user. A [group](./glossary.md#group) can hold it, and then every user of the group is a space manager. A service account never holds it, not even through a group.

A Restricted resource is closed even to the Organization admin unless a share names them, and [One access model](./one-access-model.md) gives the rule.

## What Can use and Can edit mean

A [share](./glossary.md#share) gives one user, [group](./glossary.md#group) or app one role on one thing, such as the space or a resource. Vector Space has two roles, and they are the only two.

- [Can use](./glossary.md#can-use) lets someone use a thing without changing it.
- [Can edit](./glossary.md#can-edit) lets someone configure a thing and use it.

A role is not a set of people. A group is a set of users and groups, and a share can give a role to one. On the space itself, Can edit makes a user a space manager. On a resource, it lets the user configure that resource only.

[One access model](./one-access-model.md) shows how Vector Space joins shares, [General access](./glossary.md#general-access), [blocks](./glossary.md#block) and [conditions](./glossary.md#condition) into one answer for each operation.

## Where to go next

- [One access model](./one-access-model.md): how Vector Space decides each operation, whatever the way in.
- [Organizations and spaces](./organizations-and-spaces.md): the organization as the tenant and the space as the unit of work.
- [Glossary](./glossary.md): every term of Vector Space.
