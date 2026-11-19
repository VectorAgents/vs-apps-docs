---
title: Example app definitions
description: Two complete app definitions to copy into your project, a sales outreach app and a customer support app.
---

Two complete [app definitions](./glossary.md#app-definition) to copy into your own project as `src/app.definition.ts`: a sales outreach app with several [app pages](../vector-apps/glossary.md#app-page) and a customer support app with [connector slots](../vector-apps/glossary.md#connector-slot) for messaging services.

## Sales outreach app: pages, permissions and a model slot

Copy it for four app pages that each need one [permission](../vector-apps/glossary.md#permission), and for a [model slot](../vector-apps/glossary.md#model-slot) the [space admin](../vector-space/glossary.md#space-admin) points at a model.

```ts title="src/app.definition.ts" file="src/examples/sdr.definition.ts"
```

## Customer support app: model slots and connector slots

Copy it for two model slots and two connector slots, where each connector declares `eventHandlers`: the handlers a [space editor](../vector-space/glossary.md#space-editor) routes its event types to.

```ts title="src/app.definition.ts" file="src/examples/csr.definition.ts"
```

## Next steps

Each file passes `defineApp` as pasted, so change only the `key`, page paths and slot keys to match your app.

- [App definition](./app-definition.md): see what each field does.
- [Recipes](/vector-apps/category/recipes): add a page, a permission or an agent action to your app.
- [Definition builder](/sdk/builder): load an example and edit it in a form.
