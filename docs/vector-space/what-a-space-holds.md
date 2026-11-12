---
title: What a space holds
description: The Context Hub, pages and widgets, Vector Apps and Vector Modules.
---

A [space](./glossary.md#space) holds what its team works with, in four parts:

- **[Context Hub](./glossary.md#context-hub)**: the area where the space lists what it can reach.
- **[Pages](./glossary.md#page)**: grids of widgets that show data.
- **[Vector Apps](../vector-apps/glossary.md#app)**: web apps that the space shows.
- **[Vector Modules](./glossary.md#vector-module)**: first-party products of Vector Space, built over context data or over rows that the space keeps.

Members and agents use these parts to read data, show it and act on it.

## A lead search in a team's space

Acme's sales team has a space, and a [member](./glossary.md#member) of it asks the [orchestrator agent](./glossary.md#orchestrator-agent) to find leads and send an outreach email. The orchestrator agent uses the contexts in the space's Context Hub, which link messaging channels and a customer-contact system. The team follows the outreach on a page, where data widgets show lead status in tables and conversion in charts. The logic that finds leads runs in a Vector App that the space shows.

## The Context Hub

The Context Hub holds six kinds of resource, and a resource is a thing that a space holds and that access rules cover: contexts, knowledge sources, datasources, skills, Vector Apps and Vector Modules. Vector Space shows the list of them as **Resources**. In Acme's space, a context links the customer system and a datasource holds the leads, and [the Context Hub page](./context-hub.md) describes each kind.

## Pages and widgets

A [page](./glossary.md#page) is a grid of widgets, with filters that apply to the whole page, and any member can create one. In Acme's space, the sales team builds a page whose widgets query a datasource of leads.

A [widget](./glossary.md#widget) is one cell of the grid, and it is one of two things:

- **Data widget**: runs a query against one datasource and shows the result as a chart, a table or a single key figure.
- **Document widget**: holds text. The people who may edit a collaborative document edit it live, and only the runs of a schedule write a managed document.

## Vector Apps and Vector Modules

A [Vector App](../vector-apps/glossary.md#app) is a web app that a space shows in an iframe, and a space manager turns it on for a space. In Acme's space, the app that finds leads is a Vector App.

A Vector Module is a first-party product of Vector Space itself, built over context data or over rows that the space keeps. The modules are:

- **Omnibox**: shows conversations from a connected mailbox and lets a member read and reply. [The Context Hub](./context-hub.md#mailboxes-and-the-omnibox) says how mailboxes reach it.
- **Contacts**: holds the contact rows of the space.
- **Calendar**: shows the meetings of the connected calendars.

A module draws on contexts attached to it, so the Omnibox module reads the mailbox that a context links. A module appears in a space when the organization's license lists it.

## Where to go next

- [Agents in a space](./agents-in-a-space.md): how the orchestrator agent, the agents below it, their threads and their runs work together.
- [Extending a space](./extending-a-space.md): how a Vector App, an A2A agent and an MCP server compare as ways to extend a space.
- [Glossary](./glossary.md): every term of Vector Space, each defined in a sentence.
