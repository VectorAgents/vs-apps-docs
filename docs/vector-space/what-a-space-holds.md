---
title: What a space holds
description: The Context Hub, space pages and widgets, Vector Apps and Vector Modules.
---

A [space](./glossary.md#space) holds what its team works with. It has a [Context Hub](./glossary.md#context-hub), [space pages](./glossary.md#space-page), and the [Vector Apps](../vector-apps/glossary.md#app) and [Vector Modules](./glossary.md#vector-module) that someone turns on for it. The Context Hub is the area where the space lists what it can reach. Members and agents use these parts to read data, show it and act on it.

## Example

A [member](./glossary.md#member) of the sales space asks the [orchestrator agent](./glossary.md#orchestrator-agent) to find leads and send an outreach email. The sales space holds what that work needs.

Its Context Hub has connectors to the accounts that the team uses. A page of lead widgets shows the leads in charts and tables. An app that finds leads runs inside the space.

## The Context Hub

The Context Hub holds six kinds of resource. A resource is a thing that a space holds and that access rules cover. Vector Space shows the list of them as **Resources**.

- A [connector](./glossary.md#connector) links the space to one outside account or endpoint, such as a mailbox or a REST API.
- A [knowledge source](./glossary.md#knowledge-source) is a body of documents that Vector Space indexes, so that agents can search it. It can be narrowed to chosen folders or documents.
- A [datasource](./glossary.md#datasource) is a database that agents and widgets query. Each query only reads data and never changes it.
- A [skill](./glossary.md#skill) is a set of named instructions with their tools. An agent gets it as a resource.
- A Vector App is a resource. [Vector Apps and Vector Modules](#vector-apps-and-vector-modules) have their own section below.
- A [Vector Module](./glossary.md#vector-module) is a first-party product that sits in the Context Hub.

Files and documents are not a kind of resource. They are the content of a knowledge source that a connector syncs.

## Pages and widgets in a space

A [space page](./glossary.md#space-page) is a grid of widgets, with filters that apply to the whole page. A space page is not one of the six kinds of resource, so the Context Hub does not list it. It sits beside the Context Hub in the space.

A [widget](./glossary.md#widget) is one cell of the grid. A widget is one of two things:

- A data widget runs a query against one datasource and shows the result as a chart, a table or a single key figure.
- A document widget holds text. A collaborative document is edited live by the people who may edit it. A managed document is written only by the runs of a schedule.

Any member can create a page. In the example, the sales team builds a page whose widgets query a datasource of leads.

A space page is also not an [app page](../vector-apps/glossary.md#app-page), which is one screen of a Vector App.

## Vector Apps and Vector Modules

A [Vector App](../vector-apps/glossary.md#app) is a web app that a space shows in an iframe. A space manager turns an app on for a space. In the example, the app that finds leads is a Vector App.

A Vector Module is different. It is a first-party product of Vector Space itself, built over connector data or over rows that the space keeps. A module is a peer of an app: it is not an app, and it is not a connector. The modules are:

- `omnibox`, which shows conversations from a connected mailbox and lets a member read and reply.
- `contacts`, which holds the contact rows of the space.
- Calendar.

A module draws on connectors that someone attaches to it. The omnibox module, for example, reads the mailbox that a connector links.

Apps and modules are alike in one way: both are resources in the Context Hub. They differ in who provides them: Vector Space provides the modules, and an app comes from outside Vector Space.

## Where to go next

- [Agents in a space](./agents-in-a-space.md): the orchestrator agent, the agent tree, threads and runs.
- [Extending a space](./extending-a-space.md): how a Vector App, an A2A agent and an MCP server compare.
- [Glossary](./glossary.md): every term of Vector Space.
