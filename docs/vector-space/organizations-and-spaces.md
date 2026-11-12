---
title: Organizations and spaces
description: The tenant boundary, and the space as the unit of work.
---

import StructureFigure from '@site/src/components/StructureFigure';
import { organizationStructure } from '@site/src/diagrams/figures/organization-structure.ts';

An [organization](./glossary.md#organization) is the company account in Vector Space, and it is the tenant: every user, API key, resource and space sits inside one organization. A [space](./glossary.md#space) is the unit of work, one team's place for its members, its agents and its data. One organization holds many spaces, and each space belongs to one organization.

## Two teams in one organization

Acme has one organization, and its sales team has a space of its own. A [member](./glossary.md#member) of the sales team's space asks the [orchestrator agent](./glossary.md#orchestrator-agent) to find leads and send an outreach email, and the leads live in a resource of that space. Acme's marketing team has another space, and its members and agents cannot reach those leads, although both spaces belong to one organization.

## The organization as the tenant

Every user, API key, resource and space belongs to one organization. A resource is a thing that a space holds and that access rules cover, such as a [context](./glossary.md#context) or a [datasource](./glossary.md#datasource).

Each organization has one [Organization admin](./glossary.md#organization-admin), who manages the organization's users and spaces, and a transfer passes that place to another member of the organization.

[AI provider accounts](./glossary.md#ai-provider-account) belong to the organization, not to one space, and they pay for the organization's model calls. Each account reaches every space by default, and someone can limit an account to chosen spaces.

<StructureFigure data={organizationStructure} />

## The space as the unit of work

A space is where one team works, and each space has four parts of its own:

- **Members**: the users of the space, which include [service accounts](./glossary.md#service-account), users that are not people, such as the identity behind an API key or a schedule. Only users of the organization can join its spaces. Membership alone reaches what each resource's [General access](./glossary.md#general-access) gives every member, and a [share](./glossary.md#share) gives a user, a [group](./glossary.md#group) or an app more.
- **Orchestrator agent**: the one agent that each space starts with, which takes a request and delegates parts of it to other agents.
- **[Context Hub](./glossary.md#context-hub)**: the area where the space lists what it can reach.
- **Pages, apps and modules**: the [pages](./glossary.md#page) of the space, and its [Vector Apps](../vector-apps/glossary.md#app) and [Vector Modules](./glossary.md#vector-module).

A [space manager](./glossary.md#space-manager) runs the space: its members, groups, shares, resources, agent and apps. The Organization admin is a space manager of every space of the organization, and access is worked out inside a space, for each member and each operation.

## Resources that belong to one space

Each space keeps its resources, shares and agents apart from every other space:

- **Resources**: each resource belongs to one space, so a context that someone adds in the sales team's space is a resource of that space and of no other.
- **Shares**: a share names one resource and lives inside its space, so no share reaches a resource of another space.
- **Agents**: an agent works only inside its own space, so the orchestrator agent of the marketing team cannot call a context of the sales team's space.

That is why the leads stay with the sales team.

## Where to go next

- [What a space holds](./what-a-space-holds.md): what the team of a space works with, which is where its data connects, how the data is shown, and which apps and tools run inside the space.
- [Who can do what](./who-can-do-what.md): the five kinds of people and callers in Vector Space, and how each stands in an organization and its spaces.
- [One access model](./one-access-model.md): the one check that decides each request, and the rules that say which of its inputs wins.
- [Glossary](./glossary.md): every term of Vector Space, each defined in a sentence.
