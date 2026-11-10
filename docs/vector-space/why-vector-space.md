---
title: Why Vector Space
description: The problem Vector Space solves, its three platform rules, the AI gateway and Human Time Return.
---

Once [AI](./glossary.md#ai) agents work on an [organization](./glossary.md#organization)'s own data, the organization needs a way to control them. [Vector Space](./glossary.md#vector-space) is the platform that does this: people and agents work on that data in shared places called [spaces](./glossary.md#space), and three rules cover all of it, one for access, one for model keys and one for records.

## The problem Vector Space solves

An organization that lets agents act on its own data must answer three questions: who may reach what, whose keys and credits a model call uses and who did what. Each question has one rule in Vector Space.

Acme's sales team has a space, and a [member](./glossary.md#member) of it asks the [orchestrator agent](./glossary.md#orchestrator-agent) to find leads and send an outreach email. The agent reaches only what that member may reach. The model call goes through the [AI gateway](./glossary.md#ai-gateway), on Acme's own AI provider account, and Vector Space records the run under the member's name.

## The three platform rules

Three rules hold for every part of Vector Space, whichever part you use:

- **One access model**: Vector Space works out access for each operation from [General access](./glossary.md#general-access), [shares](./glossary.md#share), [blocks](./glossary.md#block) and [Conditions](./glossary.md#condition), and the same check covers the web app, the API, agents and apps. [One access model](./one-access-model.md) gives the detail.
- **One AI gateway**: every paid model call goes through the AI gateway, so the organization pays through its own accounts. The next section gives the detail.
- **One record of work**: each run, call and [act](../vector-apps/glossary.md#acts) records who it ran as and what started it, and [the record of work](./the-record-of-work.md) shows how [governance](./glossary.md#governance) reads these records.

## The AI gateway

Every paid model call goes through the AI gateway, on the organization's own [AI provider accounts](./glossary.md#ai-provider-account). No other process holds an AI provider key.

Because every call passes one gateway, the platform can price each call and add it to the spend of the organization. [The record of work](./the-record-of-work.md) says how Vector Space estimates and limits that spend.

## Human Time Return

Vector Space also measures the time that the work gives back to people. [Human Time Return](./glossary.md#human-time-return) is the time that an app's work gives back to people, counted in seconds, and four things make up the figure:

- **Act**: an app records an act for each batch of work it finishes.
- **Baseline**: [staff](./glossary.md#staff) approve the seconds per unit of an act, and that approved figure is the baseline.
- **Valuation**: only successful acts with an approved baseline are valued, and the platform shows how many are not.
- **[Intelligence](./glossary.md#intelligence)**: where you read Human Time Return, apart from spend.

Human Time Return is an estimate, and Vector Space computes no return figure from it. [The record of work](./the-record-of-work.md#acts-and-human-time-return) gives the detail.

## Where to go next

- [One access model](./one-access-model.md): the check that decides what a user, an agent or an app may do on a resource, whatever the way in.
- [The record of work](./the-record-of-work.md): who a run is recorded as, the four governance views, spend, and acts with Human Time Return.
- [How work moves through a space](./how-work-moves-through-a-space.md): one request followed from a member to the result.
- [Vector Space glossary](./glossary.md): every term of Vector Space, each defined in a sentence.
