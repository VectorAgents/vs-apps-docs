---
title: Why Vector Space
description: The problem Vector Space solves, its three platform rules and the AI gateway.
---

Once [AI](./glossary.md#ai) agents work on an [organization](./glossary.md#organization)'s own data, the organization needs a way to control them. [Vector Space](./glossary.md#vector-space) is the platform that does this. People and agents work on that data in shared places called [spaces](./glossary.md#space). Three rules cover all of it: one for access, one for model keys and one for records.

Its aim is time given back to people. [Human Time Return](./glossary.md#human-time-return) is the time that an app's work gives back to people, counted in seconds. An app records an [act](../vector-apps/glossary.md#acts) for each batch of work it finishes, and [staff](./glossary.md#staff) approve the seconds per unit of an act.

Only successful acts with an approved baseline are valued, and the platform shows how many are not. You read Human Time Return in [Intelligence](./glossary.md#intelligence), apart from spend. It is an estimate, and Vector Space computes no return figure from it. [The record of work](./the-record-of-work.md#acts-and-human-time-return) gives the detail.

## The problem Vector Space solves

An organization that lets agents act on its own data must answer three questions. Who may reach what? Whose keys and money does a model call use? Who did what? Each question has one rule in Vector Space.

A [member](./glossary.md#member) asks the [orchestrator agent](./glossary.md#orchestrator-agent) of a space to find leads and send an outreach email. The agent reaches only what that member may reach. The model call goes through the [AI gateway](./glossary.md#ai-gateway), on the organization's own AI provider account. Vector Space records the run under the member's name.

## The three platform rules

Three rules hold for every part of Vector Space. Each rule is a promise that does not depend on which part you use.

- **One access model.** Vector Space works out access for each operation from [General access](./glossary.md#general-access), [shares](./glossary.md#share), [blocks](./glossary.md#block) and [Conditions](./glossary.md#condition). The same check covers the web app, the API, agents and apps. [One access model](./one-access-model.md) gives the detail.
- **One AI gateway.** Every paid model call goes through the AI gateway, so the organization pays through its own accounts. The next section gives the detail.
- **One record of work.** Each run, call and act records who it ran as and what started it. [The record of work](./the-record-of-work.md) shows how [governance](./glossary.md#governance) reads these records.

## The AI gateway

Every paid model call goes through the AI gateway, on the organization's own AI provider accounts. An AI provider account is the account of the organization with a company that sells model access. No other process holds an AI provider key.

Because every call passes one gateway, the platform can price each call and add it to the spend of the organization. [The record of work](./the-record-of-work.md) says how Vector Space estimates and limits that spend.

## Where to go next

- [One access model](./one-access-model.md): see what the access check reads and what wins.
- [The record of work](./the-record-of-work.md): see who a run is recorded as, the four governance views and spend.
- [How work moves through a space](./how-work-moves-through-a-space.md): follow one request from a member to the result.
- [Vector Space glossary](./glossary.md): look up each term on this page.
