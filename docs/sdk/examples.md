---
title: Example app definitions
---

Two complete [app definitions](./glossary.md#app-definition) to copy into your own project: a sales outreach app with several [app pages](../vector-apps/glossary.md#app-page) and a customer support app with [connector slots](../vector-apps/glossary.md#connector-slot) for messaging services.

Prerequisites: `@vectoragents/vs-apps` 0.4.0 installed. Copy one file into your project as `src/app.definition.ts`.

## Sales outreach app: pages, capabilities and a model slot

Four app pages, each gated by one [capability](../vector-apps/glossary.md#capability), and one [model slot](../vector-apps/glossary.md#model-slot) the space admin points at a model.

```ts title="src/app.definition.ts" file="src/examples/sdr.definition.ts"
```

## Customer support app: model slots and connector slots

Two model slots and two connector slots. Each connector declares `eventHandlers`, the handlers a space editor routes its event types to.

```ts title="src/app.definition.ts" file="src/examples/csr.definition.ts"
```

## Next steps

Each file passes `defineApp` as pasted, so change only the `key`, page paths and slot keys to match your app.

- [App definition](./app-definition.md): learn what each field does.
- [Recipes](/vector-apps/category/recipes): add a page, a capability or an agent action to your app.
- [Definition builder](/sdk/builder): load an example and edit it in a form.
