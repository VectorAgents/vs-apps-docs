---
title: Platform limits
---

Reference for the closed lists of `@vectoragents/vs-apps` 0.4.0. A closed list is a fixed set of values. Other pages name the kind of value and link here, so this page is the only place that holds a list.

Each list below carries the SDK version it holds for. A later version can add or remove a value. [`defineApp`](../app-definition.md) rejects a value that is not in the list of its version, except where a section says otherwise.

## Connector providers

Holds for `@vectoragents/vs-apps` 0.4.0. The value of `provider` in each entry of `resources.connectors[]`. A [connector slot](../../vector-apps/glossary.md#connector-slot) accepts a connector of that provider.

| Value | Connects to |
| --- | --- |
| `REST` | A REST API |
| `GRAPHQL` | A GraphQL API |
| `MCP` | A Model Context Protocol (MCP) server |
| `GOOGLE` | Google |
| `CLICKUP` | ClickUp |
| `EXA` | Exa |
| `FIRECRAWL` | Firecrawl |
| `INSTANTLY` | Instantly |
| `UNIPILE` | Unipile |
| `APOLLO` | Apollo |
| `META` | Meta messaging services, listed in the next section |

## Meta messaging services

Holds for `@vectoragents/vs-apps` 0.4.0. The service of a `META` connector. The list of connectors that Vector Space returns to your server reports it in the `service` field. The field is `null` for every other provider.

`defineApp` does not read this list, because a definition cannot name a service.

| Value | Service |
| --- | --- |
| `WHATSAPP` | WhatsApp |
| `MESSENGER` | Messenger |
| `INSTAGRAM` | Instagram |

## Model providers

Holds for `@vectoragents/vs-apps` 0.4.0. The values of `providers` in each entry of `resources.models[]`. The array needs at least one value. A [model slot](../../vector-apps/glossary.md#model-slot) accepts only a model from one of the providers you list.

| Value | Provider |
| --- | --- |
| `ANTHROPIC` | Anthropic |
| `AZURE_OPENAI` | Azure OpenAI |
| `COHERE` | Cohere |
| `AZURE_DOCUMENT_INTELLIGENCE` | Azure Document Intelligence |

## Modalities

Holds for `@vectoragents/vs-apps` 0.4.0. The value of `modality` in each entry of `resources.models[]`. It names the kind of model that the slot calls.

| Value | Kind of model |
| --- | --- |
| `chat` | Chat |
| `vision` | Vision |
| `embed` | Embedding |
| `rerank` | Reranking |

## Capability filters

Holds for `@vectoragents/vs-apps` 0.4.0. The values of `capabilities` in each entry of `resources.models[]`. Each value narrows the models that a space manager can choose for the slot. These are model abilities, not app [capabilities](../../vector-apps/glossary.md#capability).

A model passes a filter unless Vector Space records that the model lacks the ability. A model with no record for an ability passes.

| Value | The model must be able to |
| --- | --- |
| `toolCalling` | Call tools |
| `structuredOutput` | Return structured output |
| `reasoningOutput` | Return its reasoning |
| `promptCaching` | Cache prompts |
| `streaming` | Stream its answer |

## First-party Vector Modules

Holds for `@vectoragents/vs-apps` 0.4.0. The values of `key` in each entry of `resources.modules[]`. The source is Vector Space, not the SDK: the SDK accepts any non-empty string as a module key and checks nothing against this list.

| Value | Module |
| --- | --- |
| `omnibox` | Mail and LinkedIn conversations: read and reply |
| `contacts` | The contacts of a space: read and write |

## Act measure units

Holds for `@vectoragents/vs-apps` 0.4.0. The value of `unit` in each entry of `measures[]` on an [act](../../vector-apps/glossary.md#acts). Every unit holds a whole number. No unit holds a fraction.

| Value | Counts |
| --- | --- |
| `count` | A number of items |
| `ms` | Milliseconds |
| `bytes` | Bytes |

## Next step

Read the [app definition](../app-definition.md) to see where each list is used.
