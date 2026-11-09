---
title: Organizations and spaces
description: The tenant boundary, and the space as the unit of work.
---

import FigurePlaceholder from '@site/src/components/FigurePlaceholder';

An [organization](./glossary.md#organization) is the company account in Vector Space. It is the tenant: every user, key, resource and space sits inside one organization. A [space](./glossary.md#space) is the unit of work: one team's place for its members, its agents and its data. One organization holds many spaces, and each space belongs to one organization.

## Example

A company has one organization. Its sales team has a space of its own, called the sales space. A [member](./glossary.md#member) of the sales space asks the [orchestrator agent](./glossary.md#orchestrator-agent) to find leads and send an outreach email.

The leads live in a resource of the sales space. A second team of the same company has another space. Its members and agents cannot reach those leads, although both spaces belong to one organization.

## The organization as the tenant

Every user, API key, resource and space belongs to one organization. A resource is a thing that a space holds and that access rules cover, such as a [connector](./glossary.md#connector) or a [datasource](./glossary.md#datasource).

Each organization has one [Organization admin](./glossary.md#organization-admin). A transfer passes that place to another member of the organization. The Organization admin manages the organization's users and spaces.

AI provider accounts belong to the organization, not to one space. An AI provider account is the organization's own account with a company that supplies AI models, and it pays for the organization's model calls. Each account reaches every space by default. Someone can limit an account to chosen spaces.

<FigurePlaceholder slot="organization-structure" />

## The space as the unit of work

A space is where one team works. Each space has its own members, its own orchestrator agent and its own [Context Hub](./glossary.md#context-hub), the area where the space lists what it can reach. A space also holds [space pages](./glossary.md#space-page), and the [Vector Apps](../vector-apps/glossary.md#app) and [Vector Modules](./glossary.md#vector-module) that someone turns on for it.

Only users of the organization can join its spaces. That includes [service accounts](./glossary.md#service-account), which are users that are not people. Membership alone reaches what each resource's [General access](./glossary.md#general-access) gives every member. A [share](./glossary.md#share) gives a user, a [group](./glossary.md#group) or an app more.

A [space manager](./glossary.md#space-manager) runs the space: its members, groups, shares, resources, agent and apps. The Organization admin is a space manager of every space of the organization.

Access is worked out inside a space, for each member and each operation.

## Resources that belong to one space

Each resource belongs to one space. A connector that someone adds in the sales space is a resource of the sales space, and of no other.

A share names one resource and lives inside its space. No share reaches a resource of another space. An agent works only inside its own space, so the orchestrator agent of the second team cannot call a connector of the sales space.

That is why the leads of the example stay with the sales space.

## Where to go next

- [What a space holds](./what-a-space-holds.md): the Context Hub, space pages, apps and Vector Modules.
- [Who can do what](./who-can-do-what.md): the Organization admin, space managers, members and the two roles of a share.
- [One access model](./one-access-model.md): how Vector Space decides each operation.
- [Glossary](./glossary.md): every term of Vector Space.
