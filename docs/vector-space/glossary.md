---
title: Vector Space glossary
sidebar_label: Glossary
description: Terms of Vector Space, each with its definition and its owner.
---

Each term has one name in these docs. Each entry gives the definition, the code symbol or field it maps to, and who owns it. The terms of building an app are in the [Vector Apps glossary](../vector-apps/glossary.md), and the terms of the SDK are in the [SDK glossary](../sdk/glossary.md).

## Terms

### Vector Space

The Vector platform. It holds organizations and their spaces. It shows each app in an iframe.

- Owner: Vector Space.

### space

A shared place in Vector Space for one team. A space admin adds members and apps to it. It also holds [pages](#page), a [Context Hub](#context-hub) and members.

- Owner: Vector Space.

### space editor

The space role that adds editing to a member. A space editor builds and publishes agents, and edits the settings and event routes of an app.

- Owner: Vector Space.

### space admin

The space role above [space editor](#space-editor). A space admin holds everything a space editor holds. A space admin also adds members and apps, sets policies and model slots, shares an app, and sets standing approvals for the whole space.

- Owner: Vector Space.

### organization admin

The one member who manages the organization in Vector Space and sees **Organization** under **Settings**. An organization has one organization admin. The organization admin is a space admin of every space.

- Owner: Vector Space.

### page

A grid of widgets in a space, with page filters.

- Owner: Vector Space.

### staff

Vector employees who administer Vector Space itself. Only staff register apps, apply [manifest](../vector-apps/glossary.md#manifest) changes and edit an organization license. A [space admin](#space-admin) works inside one space.

- Owner: Vector Space.

### knowledge source

A body of documents that Vector Space indexes for search. A member who can edit the app and share the source can attach one to an app, with an optional scope of folders or documents. Vector Space shows knowledge sources in the settings of an app.

- Owner: Vector Space.

### Context Hub

The area of a space for what it can reach: six kinds of resource, which are [contexts](#context), knowledge sources, [datasources](#datasource), skills, apps and [Vector Modules](#vector-module). Pages are not one of them. Vector Space shows the list as **Resources**, and a member or app reaches only what it lists.

- Owner: Vector Space.

### ask

Anything an agent or an app waits on a person for. An approval of an app is one kind of ask. A request for more detail is another.

- Owner: Vector Space.

### human in the loop

Also written HITL. A run that pauses until a person decides. The agent or app raises an [ask](#ask), and the run resumes when a person answers it in the [Command Center](#command-center).

- Owner: Vector Space.

### channel

An agent that a person reaches through a messaging service, with its own prompt. The channel is the agent, not the service it is reached through: WhatsApp, Messenger and Instagram are Meta messaging services.

- Owner: Vector Space.

### MCP

Model Context Protocol. An open protocol that connects a model to tools and data. A [connector slot](../vector-apps/glossary.md#connector-slot) with the provider `MCP` uses it.

- Maps to: `provider: 'MCP'` in `resources.connectors[]`.
- Owner: SDK declares it. Vector Space attaches the context.

### A2A

Agent2Agent. An open protocol that lets one agent find another through an agent card and call it with JSON Remote Procedure Call (JSON-RPC) messages. An app that declares an agent publishes the card and answers `message/send` and `message/stream`.

- Maps to: `agents[]` in the definition, and `buildAppAgentCard` and `createA2aRequestHandler` in `@vectoragents/vs-apps/server`.
- Owner: SDK declares it. Vector Space calls it.

### AI

Artificial intelligence. In these docs it means a model that reads and writes language, such as a chat model, and the agents that run on it.

- Owner: Vector Space.

### organization

The customer account in Vector Space. Every user, API key, resource and space belongs to one organization. It has one [organization admin](#organization-admin).

- Owner: Vector Space.

### member

A person in an organization who is in a space. Membership alone reaches what [General access](#general-access) gives. A space role or a [share](#share) gives more.

- Owner: Vector Space.

### web interface

The browser interface that the internal team of an organization uses to work in a space. Customers of the organization do not use it: they reach an agent through a [channel](#channel). A [Vector App](../vector-apps/glossary.md#app) is a web app that this interface shows in an iframe.

- Owner: Vector Space.

### role

A set of permissions that a user or group holds in one place. A role is never a set of people, such as a [group](#group), or a kind of person, such as the organization admin. On one resource the roles are Can use, Can edit and Can manage.

- Owner: Vector Space.

### custom role

A [role](#role) that the organization admin defines as a set of permissions. A space admin gives it to a user or group, on top of their space role. It never lets its holder add members, add apps, delete the space or make a change that only the organization admin makes.

- Owner: Vector Space.

### Can use

The [role](#role) that lets a user use a resource without changing it.

- Owner: Vector Space.

### Can edit

The [role](#role) that lets a user configure a resource and use it.

- Owner: Vector Space.

### Can manage

The [role](#role) that lets a user share a resource and manage who reaches it, as well as configure and use it.

- Owner: Vector Space.

### share

One subject's role on one object: the space, a resource or a child resource of it. The subject is a user, a [group](#group) or an app. A share on named capabilities of an app is a [capability grant](../vector-apps/glossary.md#capability-grant).

- Owner: Vector Space.

### block

A preset, Everything or Editing, that denies one user or group on one resource, whatever their shares give. A block wins whatever its source.

- Owner: Vector Space.

### condition

A limit on the rows that one user or group sees in one resource. A group's condition binds every user the group holds. Datasources and contexts only.

- Owner: Vector Space.

### group

A named set of users and groups of one space. A group holds every user of the groups it contains. Groups nest.

- Owner: Vector Space.

### General access

The role that a resource gives every member of the space: Restricted, Can use or Can edit. A [share](#share) adds access on top.

- Owner: Vector Space.

### service account

A user of an organization that is not a person. An API key, a [channel](#channel) or a [schedule](#schedule) can run as one.

- Owner: Vector Space.

### agent

A model set up with instructions, tools and resources. It works inside one space and runs in a [thread](#thread).

- Owner: Vector Space.

### orchestrator agent

The one agent each space starts with. It takes a member's request and hands parts of it to other agents.

- Owner: Vector Space.

### thread

One conversation with an agent. Only its owner reads it.

- Owner: Vector Space.

### run

One execution of an agent in a [thread](#thread). It closes when it ends.

- Owner: Vector Space.

### schedule

A background task that an agent or a person sets to run on a timer.

- Owner: Vector Space.

### context

A link from a space to one outside account or endpoint, such as a mailbox, a REST API or an MCP server. A [connector](#connector) is a context made from a pre-built provider. The create sheet of Vector Space reads "New Connector".

- Owner: Vector Space.

### connector

A [context](#context) made from a pre-built provider, such as Apollo, Exa, BrightData or Meta. The operations are already defined, and the member who creates one connects its account or key.

- Owner: Vector Space.

### datasource

A database that agents and [widgets](#widget) query. It is one of the six kinds of resource in the [Context Hub](#context-hub).

- Owner: Vector Space.

### skill

Named instructions with their tools, which an [agent](#agent) gets as a resource.

- Owner: Vector Space.

### widget

One cell of a [page](#page): a database query with its chart, or a document.

- Owner: Vector Space.

### Vector Module

A first-party product that works over context data and sits in the [Context Hub](#context-hub). The modules are Omnibox, Contacts and Calendar.

- Owner: Vector Space.

### extension

A Vector App, an [A2A](#a2a) agent or an [MCP](#mcp) server that adds logic of a team's own to a space.

- Owner: Vector Space.

### Command Center

The part of a space where an [ask](#ask) waits for a person.

- Owner: Vector Space.

### Agent Studio

The part of Vector Space where the [orchestrator agent](#orchestrator-agent) is set up: its canvas, its channels and its evaluations.

- Owner: Vector Space.

### evaluation

A test of an agent in [Agent Studio](#agent-studio). Each saved question runs as a [run](#run), and a judge model scores the answer against the expected answer. It can run on the draft or on the published version.

- Owner: Vector Space.

### linked chat

A chat on a [channel](#channel) that the owner of the channel has linked to the space, by posting a one-time code in it. A channel accepts a message only from a linked chat.

- Owner: Vector Space.

### standing approval

Permission for an agent to run one operation, or for an app's approval to pass, without asking each time. Vector Space shows it as "always allow".

- Owner: Vector Space.

### governance

The record of what ran, as whom and at what spend. Vector Space shows it in four views: Overview, Health, Activity and Audit.

- Owner: Vector Space.

### execution

One unit of work that Vector Space records, such as a [run](#run), a [schedule](#schedule) fire or a sync pass. Each execution has one [actor](#actor).

- Owner: Vector Space.

### actor

Who performed one action: a user, a [service account](#service-account), staff, an app or the platform. Every [execution](#execution) records one actor.

- Owner: Vector Space.

### Overview

A [governance](#governance) view of what was spent, run or broken, by source. A figure opens the records behind it.

- Owner: Vector Space.

### Health

A [governance](#governance) view of what is wrong now, such as a context whose calls fail.

- Owner: Vector Space.

### Activity

A [governance](#governance) view of what happened, in time order. It includes the [acts](../vector-apps/glossary.md#acts) that apps declare as activity.

- Owner: Vector Space.

### Audit

A [governance](#governance) view of who changed what. It includes the [acts](../vector-apps/glossary.md#acts) that apps declare as audit.

- Owner: Vector Space.

### Intelligence

The part of Vector Space where you read the [acts](../vector-apps/glossary.md#acts) of apps and their [Human Time Return](#human-time-return), in addition to spend.

- Owner: Vector Space.

### Human Time Return

The time that an app's work gives back to people, counted in seconds. It is an estimate, not a spend figure. Only successful [acts](../vector-apps/glossary.md#acts) with a baseline that staff approved are valued.

- Owner: Vector Space.

### AI gateway

The service that every paid model call goes through. It uses the organization's own [AI provider accounts](#ai-provider-account).

- Owner: Vector Space.

### AI provider account

The organization's own account with a company that supplies AI models. It belongs to the organization, not to one space, and no agent or app holds its key.

- Owner: Vector Space.

### spend cap

A limit on estimated AI spend, for one organization in one calendar month. The organization reads it. Staff set it.

- Owner: Vector Space.

### rate card

The platform's list of prices for model calls. [Governance](#governance) prices each call from it, so spend is an estimate.

- Owner: Vector Space.

### agent card

The public description of an agent under the [A2A](#a2a) protocol: its name, its skills and how to call it.

- Owner: Vector Space.
