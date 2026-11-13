---
title: The Context Hub
description: What the Context Hub holds, how a space connects databases, APIs and mailboxes, and whose credential each one runs on.
---

The [Context Hub](./glossary.md#context-hub) is the area of a [space](./glossary.md#space) that lists what the space can reach. It gives a team one place to connect its data and services, so that [members](./glossary.md#member) and [agents](./glossary.md#agent) read data, call APIs and read mail through the space and nobody hands out a login.

## A sales team connects its data

Acme's sales team has a space, and a member connects the team's data in the Context Hub. They connect the database of leads and describe its tables, add the REST API of the team's customer system, and connect the team's shared sales mailbox. A member then asks the [orchestrator agent](./glossary.md#orchestrator-agent) to find leads and send an outreach email.

The agent reads the lead database, calls the customer system through its API and sends the email from the shared mailbox. The thread appears in the Omnibox, a [Vector Module](./glossary.md#vector-module) that shows the mail threads of a space. The member never held a password for any of the three, because each one runs on the credential of the person who connected it.

## What the Context Hub holds

The Context Hub holds six kinds of resource, and a resource is a thing that a space holds and that access rules cover. Vector Space shows the list of them as **Resources**:

- **[Context](./glossary.md#context)**: links the space to one outside account or endpoint, such as a mailbox, a REST API or an [MCP](./glossary.md#mcp) server.
- **[Knowledge source](./glossary.md#knowledge-source)**: a body of documents that Vector Space indexes, so that agents can search it, and it can be narrowed to chosen folders or documents.
- **[Datasource](./glossary.md#datasource)**: a database that agents and [widgets](./glossary.md#widget) query, where each query only reads data and never changes it.
- **[Skill](./glossary.md#skill)**: a set of named instructions with their tools, which an agent gets as a resource.
- **[Vector App](../vector-apps/glossary.md#app)**: a web app that the space shows in an iframe.
- **[Vector Module](./glossary.md#vector-module)**: a first-party product of Vector Space, such as the Omnibox, that sits in the Context Hub.

A context is the general kind, and a [connector](./glossary.md#connector) is a context made from a pre-built provider. Files and documents are not a kind of resource. They are the content of a knowledge source that a context syncs.

## Datasources

A datasource lets members and agents ask a database questions in plain language. A member connects one of four types of database: PostgreSQL, MySQL, SQL Server or Snowflake.

The member who connects it imports the schema, which lists the tables and columns of the database, and writes a description for each one, so that an agent knows what the data means. Comments that a PostgreSQL database already holds on its tables and columns become the first descriptions, and that member can edit them.

The Knowledge tab of a datasource holds what else an agent needs to know:

- **Instructions**: rules in plain words that apply to the questions they match.
- **SQL pairs**: a question with the SQL that answers it. They show an agent how the team asks.
- **Saved answers**: queries kept for reuse.

A member asks in plain language and never writes SQL. The agent writes the query in the SQL of that database, and the query runs on one datasource, so one question reaches one database.

## APIs and MCP servers

A member who creates a context connects an outside service in the way that the service offers:

- **REST API**: the member who connects it imports an OpenAPI description, a file that lists the calls of the API, and sets the base URL. Each call becomes an operation with request and response parameters, and the path of an operation stays on the origin of the base URL.
- **GraphQL API**: the operations come from introspection, where the API answers with its own list of operations.
- **MCP server**: the tools come from discovery, where the server answers with its own list of tools.

A context uses one of five types of authentication: a bearer token, an API key, OAuth, basic authentication or a custom header. An API key travels in a header by default, or in the query or in the body. The member who connects it sets the header name. Only OAuth tokens refresh on their own.

A connector skips the import, because its operations are already defined. The member who connects it gives an API key or consents with an account, and nothing else is needed. [Extending a space](./extending-a-space.md) compares an MCP server with the other ways to add logic to a space.

## Mailboxes and the Omnibox

A connected mailbox is one context, and the Omnibox shows the threads of several mailboxes in one stream. A shared mailbox is a mailbox context that its owner has shared, so sharing a mailbox is the same act as sharing any other context.

A member sends from a mailbox when the member holds [Can use](./glossary.md#can-use) on the Omnibox and the mailbox is shared with the member. The threads of a Restricted mailbox reach its owner and whoever it is shared with, and agents read the same threads as the members they work for.

## Credentials and sharing

Every resource has [General access](./glossary.md#general-access), the [role](./glossary.md#role) that it gives every member of the space: Restricted, Can use or [Can edit](./glossary.md#can-edit). A [share](./glossary.md#share) adds a role on top of that, and a share with a [group](./glossary.md#group) reaches every user that the group holds. An agent reaches what the member it works for reaches. [One access model](./one-access-model.md) holds the full check.

A credential is the login that a context or datasource uses to reach its outside system. It belongs to the person who created it and is never given to anyone, and not even an [organization admin](./glossary.md#organization-admin) can use it.

When a context or datasource is shared, the people it is shared with run on the credential of its owner. They never get the credential or its target, the database or endpoint behind it. A share gives a role, Can use, Can edit or Can manage, to a user or a group, and attaching a context or datasource to a Vector App shares it with that app.

## Where to go next

A member can now connect a database, an API and a mailbox, and knows whose credential each one runs on. The next page to read is the one on access:

- [One access model](./one-access-model.md): the check that decides what a user, an agent or an app may do on a resource, including who each run is made as.
- [Identity and roles](./who-can-do-what.md): the four kinds of people and callers in Vector Space, and the space roles and share levels that say what each may do.
- [Extending a space](./extending-a-space.md): how a Vector App, an A2A agent and an MCP server compare as ways to extend a space.
- [Agents in a space](./agents-in-a-space.md): how the orchestrator agent and the agents below it use what the Context Hub lists.
- [Glossary](./glossary.md): every term of Vector Space, each defined in a sentence.

