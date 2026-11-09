---
title: The record of work
description: Who ran what, the four governance views, spend, acts and Human Time Return.
---

import FigurePlaceholder from '@site/src/components/FigurePlaceholder';

The record of work is what Vector Space writes down about each piece of work: who it ran as and what started it. [Governance](./glossary.md#governance) shows that record in four views, so an organization can see what ran, what it cost and what changed.

## Example

A [member](./glossary.md#member) asks the [orchestrator agent](./glossary.md#orchestrator-agent) to find leads and send an outreach email. Vector Space records the work as that member and notes what started it, here a chat in the web app. It also records each model call with its estimated cost.

Later an [Organization admin](./glossary.md#organization-admin) opens [Activity](./glossary.md#activity), finds the work and reads who it ran as.

## The actor behind every record

An [actor](./glossary.md#actor) is who performed one action: a user, a [service account](./glossary.md#service-account), [staff](./glossary.md#staff), an app or the platform. Every [execution](./glossary.md#execution) has one actor. An execution is one unit of work, such as an agent run or a sync pass.

What started it is recorded apart from the actor, such as a chat in the web app. A [schedule](./glossary.md#schedule) is not an actor. It runs as a person or a service account chosen for it.

## The four governance views

Four views read the records. Each answers one question.

- [Overview](./glossary.md#overview): what was spent, run or broken, by source. A figure opens the records behind it.
- [Health](./glossary.md#health): what is wrong now, such as a connector whose calls fail.
- [Activity](./glossary.md#activity): what happened, in time order. A decided [ask](./glossary.md#ask) shows here.
- [Audit](./glossary.md#audit): who changed what. It covers changes to access, to what the organization may use and to keys. Audit reads the change records.

The Organization admin reads the whole organization. A [space manager](./glossary.md#space-manager) reads the same views for their own space. Another user's [thread](./glossary.md#thread) is never readable here. A figure that cannot be read shows as missing, never as zero.

<FigurePlaceholder slot="record-of-work" />

## Failure postures

Change records hold what Audit shows. Spend records hold each model call with its estimated cost. Each part of the record fails in its own way.

Fail closed means the work stops if it cannot be recorded. Fail open means the work goes on and the record has a gap.

| Record | Posture | If the record cannot be written |
| --- | --- | --- |
| Change records | Fails closed | The change does not happen. |
| Spend records | Fails open | The model call still works. That window of spend goes unrecorded. |
| Spend cap | Fails open | If the store that tracks the cap is down, calls go through unchecked. |
| [Acts](../vector-apps/glossary.md#acts) | Attested | The platform checks the app and actor are real, not that the work happened. |

The platform counts the spend that it did not record.

## Spend as an estimate

A spend figure is an estimate. Vector Space prices each model call from the [rate card](./glossary.md#rate-card), the platform's list of prices, so the figure is spend at list price. It is never reconciled against an invoice, which can hold discounts, credits and tax.

A call is priced at the version of the rate card in force when it started. A later price change does not alter calls already made. A call with no price is counted and shown beside the total, never shown as free.

The [spend cap](./glossary.md#spend-cap) limits estimated spend on model calls for one organization in one calendar month. The organization reads the cap, and staff set it.

At the cap, the platform refuses further model calls.

## Acts and Human Time Return

An act is one thing that an app did, such as qualifying a lead. Only apps record acts. The platform admits an act only if the app is turned on for the space and the actor is real. It does not check that the work happened.

Each act has a kind, `activity` or `audit`, and the matching view shows it.

[Human Time Return](./glossary.md#human-time-return) is the time that an app's work gives back to people, counted in seconds. An app records an act for each batch of work it finishes. Staff approve the seconds per unit of an act, and that approved figure is the baseline. Only successful acts with an approved baseline are valued, and the platform shows how many are not.

An act settles once, when the platform admits it, so a later change to the baseline does not alter it. Human Time Return is read in [Intelligence](./glossary.md#intelligence), apart from spend. Intelligence is not one of the four views. Human Time Return is an estimate. The platform computes no return figure.

## Where to go next

- [Why Vector Space](./why-vector-space.md): the three rules that every part of Vector Space follows.
- [Approvals and the Command Center](./approvals-and-the-command-center.md): how an ask is decided, before Activity shows it.
- [Glossary](./glossary.md): every term of Vector Space.
