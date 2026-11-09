---
title: Choose your path
description: Compare a Vector App, an A2A agent and an MCP server by what you build, how each shows up in a space and what Vector Space gives it.
---

Three interfaces plug your code into a [space](../vector-space/glossary.md#space) in [Vector Space](../vector-space/glossary.md#vector-space): a Vector App, an A2A agent and an MCP server. An [A2A](../vector-space/glossary.md#a2a) agent is a remote agent that the agent of the space delegates work to. An [MCP](../vector-space/glossary.md#mcp) server is a remote server of tools that agents call.

This page compares the three so you can pick one before you build. [Why Vector Apps](../vector-apps/why-vector-apps.md) says what an app is.

## Compare the three paths

Each column is one path. Each row is one thing that you build or that Vector Space gives you.

| | Vector App | A2A agent | MCP server |
| --- | --- | --- | --- |
| You build | A client, a server and an [app definition](./glossary.md#app-definition). | An agent that serves an agent card and answers A2A messages. | A server that lists tools and answers MCP calls. |
| Shows up as | [App pages](../vector-apps/glossary.md#app-page) in the space, and entries in the [agent catalog](./glossary.md#agent-catalog). | A sub-agent that the agent of the space delegates to. | A connector in the [Context Hub](../vector-space/glossary.md#context-hub) of the space. |
| Who sets it up | [Staff](../vector-space/glossary.md#staff) register it. A [space manager](../vector-space/glossary.md#space-manager) adds and configures it. | A space manager adds the agent card to the space. | A member of the space adds it as a connector. |
| Knows the calling member | Yes. The user token identifies the member and lists their capabilities. | No, unless an app offers the agent. Then the A2A token can identify the member. | No. Vector Space does not pass the member on. |
| Reads platform data | Yes. The [allowed resources](../vector-apps/glossary.md#allowed-resources) of the space, and the member list. | No. | No. |
| Model calls | Yes, through a [model slot](../vector-apps/glossary.md#model-slot), on the [AI](../vector-space/glossary.md#ai) accounts of the organization. | Your own, outside Vector Space. | Your own, outside Vector Space. |
| App approvals and acts | Yes. You declare [approvals](../vector-apps/glossary.md#approvals) and [acts](../vector-apps/glossary.md#acts). | No. | No. |

To call a space from your own server instead, see [Call Vector Space from your server](../vector-apps/guides/call-space-from-your-server.md).

The connector providers, model providers and other closed lists that an app definition accepts are on the [platform limits](./reference/platform-limits.md) page.

## When each path fits

- **Vector App.** Members use your screens inside the space, with your own data and workflow.
- **A2A agent.** You have an agent that does its own reasoning, and the space delegates tasks to it.
- **MCP server.** You have tools or an API that agents call. It needs no screens and no reasoning.

A Vector App gets the identity of the calling member, the data of the space and model calls through Vector Space. An A2A agent or an MCP server gets none of the three.

An app can also offer an A2A agent and an MCP server of its own. You declare each one in the app definition. The [A2A guide](../vector-apps/guides/expose-app-as-a2a-agent.md) shows how.

## Where to go next

- [Why Vector Apps](../vector-apps/why-vector-apps.md): see what an app is and what a space gives it.
- [Quickstart](../vector-apps/quickstart.md): run a small app on your machine, then in a space.
- [Expose your app as an A2A agent](../vector-apps/guides/expose-app-as-a2a-agent.md): offer an agent from inside an app.
