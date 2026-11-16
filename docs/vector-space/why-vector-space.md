---
title: Why Vector Space
description: The problem Vector Space solves, its three platform rules, the AI gateway and Human Time Return.
---

[Vector Space](./glossary.md#vector-space) is the platform where the people and [AI](./glossary.md#ai) agents of an [organization](./glossary.md#organization) work together on the organization's own data. It gives the organization control over that work with three rules: one for access, one for AI provider keys and one for records. People and agents work in shared places called [spaces](./glossary.md#space).

## A lead request under the three rules

Maya, a [member](./glossary.md#member) of Acme's sales team, asks the [orchestrator agent](./glossary.md#orchestrator-agent) in the team's space to find leads and send an outreach email. Three questions follow: what may the agent reach, whose keys and credits does the model call use, and who did what?

The agent reaches only what Maya may reach. The model call goes through the [AI gateway](./glossary.md#ai-gateway), on Acme's own [AI provider account](./glossary.md#ai-provider-account), and Vector Space records the run under Maya's name. Each answer is one of the three rules.

## The three platform rules

Three rules hold for every part of Vector Space, whichever part you use:

- **One access model**: Vector Space works out access for each operation from [General access](./glossary.md#general-access), [shares](./glossary.md#share) and [blocks](./glossary.md#block). A [condition](./glossary.md#condition) limits the rows of an allowed operation, and the same check covers the [web interface](./glossary.md#web-interface), the API, agents and apps.
- **One AI gateway**: every paid model call goes through the AI gateway, so the organization pays through its own accounts.
- **One record of work**: each run, call and [act](../vector-apps/glossary.md#acts) records who it ran as and what started it, and [governance](./glossary.md#governance) reads these records.

## The AI gateway

Every paid model call goes through the AI gateway, on the organization's own AI provider accounts. No other process holds an AI provider key.

Because every call passes one gateway, the platform prices each call from the [rate card](./glossary.md#rate-card) and adds it to the spend of the organization. That spend is an estimate at list price, and a [spend cap](./glossary.md#spend-cap) limits it for one organization in one calendar month.

## Human Time Return

Vector Space measures [Human Time Return](./glossary.md#human-time-return), the time that an app's work gives back to people, counted in seconds. Three things make up the figure:

- **Act**: an app records an act for each batch of work it finishes.
- **Baseline**: [staff](./glossary.md#staff) approve the seconds per unit of an act, and that approved figure is the baseline.
- **Valuation**: only successful acts with an approved baseline are valued, and the platform shows how many are not.

You read Human Time Return in [Intelligence](./glossary.md#intelligence), in addition to spend.

Human Time Return is an estimate, and Vector Space computes no return figure from it. An act is fixed when the platform accepts it, so a later change to the baseline does not alter it.

## Where to go next

You now know the problem each platform rule solves, what the AI gateway does and how Human Time Return is counted. Read [One access model](./one-access-model.md) next: it shows the check that decides what a person, an agent or an app may do on a resource.

Related:

- [The record of work](./the-record-of-work.md): who a run is recorded as, the four governance views, spend, and acts with Human Time Return.
- [How work moves through a space](./how-work-moves-through-a-space.md): one request followed from a member to the result.
- [Vector Space glossary](./glossary.md): every term of Vector Space, each defined in a sentence.
