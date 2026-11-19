---
title: Platform limits
description: The closed lists of values that an app definition accepts, such as connector providers, model providers and modalities.
---

A closed list is a fixed set of values. Other pages name the kind of value and link here, so this page is the only place that holds a list. Each section names the field that its list fills and says whether [`defineApp`](../app-definition.md) rejects a value outside the list.

## Connector providers

The value of `provider` in each entry of `resources.connectors[]`. A [connector slot](../../vector-apps/glossary.md#connector-slot) accepts a connector of that provider. `defineApp` rejects a value outside this list.

| Value | Connects to |
| --- | --- |
| `REST` | A REST API |
| `GRAPHQL` | A GraphQL API |
| `MCP` | An [MCP](../../vector-space/glossary.md#mcp) server |
| `GOOGLE` | Google |
| `CLICKUP` | ClickUp |
| `EXA` | Exa |
| `FIRECRAWL` | Firecrawl |
| `INSTANTLY` | Instantly |
| `UNIPILE` | Unipile |
| `APOLLO` | Apollo |
| `META` | Meta messaging services, listed in the next section |
| `BRIGHTDATA` | Bright Data |

## Meta messaging services

The service of a `META` connector. The list of connectors that [Vector Space](../../vector-space/glossary.md#vector-space) returns to your server reports it in the `service` field, which is `null` for every other provider. `defineApp` does not read this list, because a definition cannot name a service.

| Value | Service |
| --- | --- |
| `WHATSAPP` | WhatsApp |
| `MESSENGER` | Messenger |
| `INSTAGRAM` | Instagram |

## Model providers

The values of `providers` in each entry of `resources.models[]`. The array needs at least one value. A [model slot](../../vector-apps/glossary.md#model-slot) accepts only a model from one of the providers you list. `defineApp` rejects a value outside this list.

| Value | Provider |
| --- | --- |
| `ANTHROPIC` | Anthropic |
| `AZURE_OPENAI` | Azure OpenAI |
| `COHERE` | Cohere |
| `AZURE_DOCUMENT_INTELLIGENCE` | Azure Document Intelligence |

## Modalities

The value of `modality` in each entry of `resources.models[]`. It names the kind of model that the slot calls. `defineApp` rejects a value outside this list.

| Value | Kind of model |
| --- | --- |
| `chat` | Chat |
| `vision` | Vision |
| `embed` | Embedding |
| `rerank` | Reranking |

## Capability filters

The values of `capabilities` in each entry of `resources.models[]`. Each value narrows the models that a [space admin](../../vector-space/glossary.md#space-admin) can choose for the slot. These are model abilities, not app [capabilities](../../vector-apps/glossary.md#capability). `defineApp` rejects a value outside this list.

A model passes a filter unless Vector Space records that the model lacks the ability. A model with no record for an ability passes.

| Value | The model must be able to |
| --- | --- |
| `toolCalling` | Call tools |
| `structuredOutput` | Return structured output |
| `reasoningOutput` | Return its reasoning |
| `promptCaching` | Cache prompts |
| `streaming` | Stream its answer |

## First-party Vector Modules

The values of `key` in each entry of `resources.modules[]`. The source is Vector Space, not the SDK. `defineApp` does not read this list: it accepts any non-empty string as a module key.

| Value | Module |
| --- | --- |
| `omnibox` | Mail and LinkedIn conversations: read and reply |
| `contacts` | The contacts of a space: read and write |

## Act measure units

The value of `unit` in each entry of `measures[]` on an [act](../../vector-apps/glossary.md#acts). Every unit holds a whole number. `defineApp` rejects a value outside this list.

| Value | Counts |
| --- | --- |
| `count` | A number of items |
| `ms` | Milliseconds |
| `bytes` | Bytes |

## Next steps

- [App definition](../app-definition.md): see where each list is used.
