---
title: Call a model from your server
description: Ask Vector Space for the model that a space admin set on a model slot, and call it once from your server.
start: leads-app
---

Ask [Vector Space](../../vector-space/glossary.md#vector-space) for the model that a [space admin](../../vector-space/glossary.md#space-admin) set on the `lead-summary` [model slot](../glossary.md#model-slot), and call it once from your server. `GET /api/summary` returns the reply of the model.

## Prerequisites

- A GitHub package token in `GITHUB_PACKAGES_TOKEN`, as in [step 0 of the quickstart](../quickstart.md#0-set-up-access-to-the-package-registry). The scaffold command reads it.
- The `leads-app` start, added to a space and run with `npm run dev:space`, as in [Part 2 of the quickstart](../quickstart.md#part-2-add-the-app-to-a-space). Scaffold it into a new folder, `leads-guide`, so it does not clash with the `leads-app` folder of a recipe. Work inside the new folder.

<!-- flavour node -->
```bash
npm create @vectoragents/app leads-guide -- --client react --server node --start leads-app
cd leads-guide
```
<!-- /flavour -->
<!-- flavour nest -->
```bash
npm create @vectoragents/app leads-guide -- --client react --server nest --start leads-app
cd leads-guide
```
<!-- /flavour -->

- A space admin who can reach at least one Anthropic model in that space.
- Background: the [`/server` reference](../../sdk/reference/server.md).

## Steps

### 1. Declare the model slot

A model slot is a named model request that your app declares and a space admin fills with one model. The slot is a plain object that satisfies `AppModelSlot`. `providers` fixes the request format that your code sends, so every model that fills the slot answers in the Anthropic format. `required` makes Vector Space show the slot as needing setup until a space admin sets a model.

```ts title="shared/src/lead-summary-slot.ts"
import type { AppModelSlot } from '@vectoragents/vs-apps';

export const leadSummarySlot = {
  key: 'lead-summary',
  label: 'Lead summary',
  description: 'Writes a one-sentence summary of a lead.',
  modality: 'chat',
  providers: ['ANTHROPIC'],
  required: true,
} satisfies AppModelSlot;
```

Add the slot to the definition in `shared/src/index.ts`. The slot key is lower kebab-case, as in the [definition fields](../../sdk/app-definition.md#resourcesmodels). First import the slot.

```ts title="shared/src/index.ts" showLineNumbers=1 excerpt
import { defineApp } from '@vectoragents/vs-apps';
// added-next-line
import { leadSummarySlot } from './lead-summary-slot';

export const PERMISSION = 'hello:view';
```

Then add `resources` to the object that `defineApp` takes.

```ts title="shared/src/index.ts" showLineNumbers=25 excerpt
    { key: 'lead:manage', label: 'Manage Leads', effect: 'write' },
    { key: 'icp:manage', label: 'Manage ICP', effect: 'write' },
  ],
  // added-next-line
  resources: { models: [leadSummarySlot] },
});
```

### 2. Call the model

<!-- flavour node -->
This guide uses `platform.ai` from the `@vectoragents/vs-apps/server` subpath of the [SDK](../../sdk/glossary.md#sdk) on a `node:http` server.
<!-- /flavour -->
<!-- flavour nest -->
This guide uses `SpaceAiService` from the `@vectoragents/vs-apps/nest` subpath of the [SDK](../../sdk/glossary.md#sdk) on a Nest.js server.
<!-- /flavour -->

Your server never holds a model key. The SDK trades the [service secret](../glossary.md#service-secret) for `apiKey`, a short-lived key for one model slot, and returns it in a client configuration. The configuration also holds the `baseUrl` of the model gateway of Vector Space and the `model` name to send.

<!-- flavour node -->
`platform.ai(appId, spaceId, slot)` resolves to `{ provider, baseUrl, apiKey, model, expiresAt }`. `expiresAt` is Unix time in seconds. Do not store the configuration: call `platform.ai` on each request. The platform reuses a key until one minute before it expires, for the same space, slot, run and trace only.
<!-- /flavour -->
<!-- flavour nest -->
`getClientConfig(appId, spaceId, slot)` returns `{ provider, baseUrl, apiKey, model, expiresAt }`. `expiresAt` is Unix time in seconds. Do not store the configuration: call `getClientConfig` on each request. The service reuses a key until one minute before it expires, for the same space, slot, run and trace only.
<!-- /flavour -->

`model` is the slot's alias, not the model name that the space admin picked. Send it as it is.

If no one sets the slot, Vector Space refuses the call with status `409`. Vector Space refuses a slot key that the manifest does not declare with status `400`.

<!-- flavour node -->
`platform.ai` throws a `SpaceActionError` that carries the status.

```ts title="server/src/lead-summary.ts"
import type { UserTokenClaims } from '@vectoragents/vs-apps';
import type { AiClientConfig, AppPlatform } from '@vectoragents/vs-apps/server';

async function completePrompt(config: AiClientConfig, prompt: string): Promise<string> {
  const response = await fetch(`${config.baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': config.apiKey,
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!response.ok) throw new Error(`The model call failed with status ${response.status}`);
  const reply = (await response.json()) as { content: Array<{ text?: string }> };
  return reply.content.map((block) => block.text ?? '').join('');
}

export async function summarizeLead(platform: AppPlatform, claims: UserTokenClaims) {
  const config = await platform.ai(claims.appId, claims.spaceId, 'lead-summary');
  const summary = await completePrompt(config, 'Write one sentence about a lead named Ada Lovelace, who asked for a demo.');
  return { summary };
}
```

The string `'lead-summary'` must equal the `key` from step 1.
<!-- /flavour -->
<!-- flavour nest -->
The next file sends one message in the Anthropic format. It reads every value from the configuration.

```ts title="server/src/complete-prompt.ts"
import type { AiClientConfig } from '@vectoragents/vs-apps/server';

export async function completePrompt(config: AiClientConfig, prompt: string): Promise<string> {
  const response = await fetch(`${config.baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': config.apiKey,
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!response.ok) throw new Error(`The model call failed with status ${response.status}`);
  const reply = (await response.json()) as { content: Array<{ text?: string }> };
  return reply.content.map((block) => block.text ?? '').join('');
}
```

The controller reads the caller with `appCaller`, as in [open a route and read the caller](./open-route-and-read-caller.md). The `appId` and `spaceId` claims name the app and the space that the token came from.

`SpaceAiService` throws a `SpaceActionError` that carries the status, so the controller turns it into an `HttpException` with the same status.

```ts title="server/src/lead-summary.controller.ts"
import { Controller, Get, HttpException, Req } from '@nestjs/common';
import { appCaller, RequirePermission, SpaceAiService, type AppRequest } from '@vectoragents/vs-apps/nest';
import { SpaceActionError } from '@vectoragents/vs-apps/server';
import { completePrompt } from './complete-prompt';

@Controller('summary')
export class LeadSummaryController {
  constructor(private readonly ai: SpaceAiService) {}

  @Get()
  @RequirePermission('lead:manage')
  async summary(@Req() req: AppRequest) {
    const { claims } = appCaller(req);
    try {
      const config = await this.ai.getClientConfig(claims.appId, claims.spaceId, 'lead-summary');
      const summary = await completePrompt(config, 'Write one sentence about a lead named Ada Lovelace, who asked for a demo.');
      return { summary };
    } catch (error) {
      if (error instanceof SpaceActionError) throw new HttpException(error.message, error.status);
      throw error;
    }
  }
}
```

The string `'lead-summary'` must equal the `key` from step 1.
<!-- /flavour -->

### 3. Mount the route

<!-- flavour node -->
The platform reads `SPACE_API_URL` from `.env`, which Part 2 of the quickstart sets, and removes the `/api` suffix, because it needs the origin of Vector Space.

In `server/src/main.ts`, import `SpaceActionError` next to `AppAuthError`, and import `summarizeLead` from `./lead-summary`.

```ts title="server/src/main.ts" showLineNumbers=3 excerpt
import { PERMISSION } from '@hello-app/shared';
// removed-next-line
import { AppAuthError } from '@vectoragents/vs-apps/server';
// added-next-line
import { AppAuthError, SpaceActionError } from '@vectoragents/vs-apps/server';
import { requirePermission } from './auth';
// added-next-line
import { summarizeLead } from './lead-summary';
import { platform } from './platform';
```

Then add the route inside the `try`, after the `platform.fetch` check and before the `/api/hello` check. In the `catch` block, add a line that answers a `SpaceActionError` with its status.

```ts title="server/src/main.ts" showLineNumbers=33 excerpt
  try {
    const handled = await platform.fetch(toFetchRequest(req));
    if (handled) return await sendFetchResponse(res, handled);
    // added-next-line
    if (pathname === '/api/summary') return send(res, 200, await summarizeLead(platform, await requirePermission(req, 'lead:manage')));
    if (pathname !== '/api/hello') return send(res, 404, { error: 'Not found' });
    const claims = await requirePermission(req, PERMISSION);
    send(res, 200, { sub: claims.sub, spaceId: claims.spaceId });
  } catch (error) {
    if (error instanceof AppAuthError) return send(res, error.status, { error: error.message });
    // added-next-line
    if (error instanceof SpaceActionError) return send(res, error.status, { error: error.message });
    send(res, 500, { error: 'Server error' });
  }
```
<!-- /flavour -->
<!-- flavour nest -->
In `server/src/app.module.ts`, import `LeadSummaryController` from `./lead-summary.controller`, then add it to the `controllers` array next to `HelloController`. `AppPlatformModule` is global, so `AppModule` needs no import to inject `SpaceAiService`.

```ts title="server/src/app.module.ts" showLineNumbers=3 excerpt
import type { AppSigningKeys } from '@vectoragents/vs-apps/server';
import { HelloController } from './hello.controller';
// added-next-line
import { LeadSummaryController } from './lead-summary.controller';
import { manifests } from './manifests';
```

```ts title="server/src/app.module.ts" showLineNumbers=39 excerpt
    }),
  ],
  // removed-next-line
  controllers: [HelloController],
  // added-next-line
  controllers: [HelloController, LeadSummaryController],
})
export class AppModule {}
```
<!-- /flavour -->

### 4. Set the model

**Role**: developer. Restart `npm run dev:space`.

<!-- flavour node -->
Vector Space pushes the service secret to `POST /api/provision` when it adds the app. The [app platform](../../sdk/glossary.md#app-platform) of the starter, `platform` in `server/src/platform.ts`, serves that route. It stores the secret in its credential store, `MemoryCredentialStore` in `server/src/credential-store.ts`, so you write no code for it.

The starter's `MemoryCredentialStore` loses the secrets on restart. Before production, [implement `AppCredentialStore` over your own storage](../quickstart.md#4-verify-the-token-on-the-server). Until Vector Space pushes the secret again, `platform.ai` fails with status `401`. The quickstart shows [how to recover after a restart](../quickstart.md#4-verify-the-token-on-the-server).
<!-- /flavour -->
<!-- flavour nest -->
Vector Space pushes the service secret to `POST /api/provision` when it adds the app. `AppPlatformModule` stores it in the credential store of `AppModule`, `MemoryCredentialStore` in `server/src/credential-store.ts`, so you write no code for it.

The starter's `MemoryCredentialStore` loses the secrets on restart. Before production, [implement `AppCredentialStore` over your own storage](../quickstart.md#4-verify-the-token-on-the-server). Until Vector Space pushes the secret again, `getClientConfig` fails with status `401`. The quickstart shows [how to recover after a restart](../quickstart.md#4-verify-the-token-on-the-server).
<!-- /flavour -->

<!-- flavour node -->
A change to the manifest reaches Vector Space through [`pingManifests`](../../sdk/reference/server.md#pingmanifests) or a manual refresh in Vector Space.
<!-- /flavour -->
<!-- flavour nest -->
The module pings Vector Space with the new manifest at start.
<!-- /flavour -->

A manifest change waits until staff apply it, as [how a Vector app works](../how-a-vector-app-works.md#update) describes. If **Lead summary** is missing, ask [staff](../../vector-space/glossary.md#staff) to select **Check for updates** on your [app registration](../glossary.md#app-registration), then **Review update** and **Apply**.

**Role**: space admin. Open the configuration of the app in Vector Space and choose a model for **Lead summary**.

The list of models holds a model only when the organization has an Anthropic provider. An [organization admin](../../vector-space/glossary.md#organization-admin) adds one in **Settings**, **Organization**, **Providers**, **AI**, **Add provider**, with an API key. Choose **Set** to save the model. Vector Space shows the toast `Model saved`.

### 5. Check the route

In a second terminal, request the route without a token. `SERVER_PORT` is the value in `.env`.

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:<SERVER_PORT>/api/summary
```

The command prints `401`, because the route refuses a request with no user token.

The user token exists only in page memory, so no `curl` call can send a valid one. Show the result in the app page instead. In `client/src/token.ts`, add `fetchSummary` after `fetchHello`. It returns the status and the body as text.

```ts title="client/src/token.ts" showLineNumbers=12 excerpt
  return response.json();
}
// added-start

export async function fetchSummary(): Promise<string> {
  const response = await fetch('/api/summary', {
    headers: { Authorization: `Bearer ${appToken}` },
  });
  return `${response.status} ${await response.text()}`;
}
// added-end
```

In `client/src/HelloPage.tsx`, import `fetchSummary`, call it in the effect and show the result in one more line.

```tsx title="client/src/HelloPage.tsx" showLineNumbers=4 excerpt
// removed-next-line
import { fetchHello } from './token';
// added-next-line
import { fetchHello, fetchSummary } from './token';

export function HelloPage() {
  const { claims, permissions } = useApp();
  const [serverSaw, setServerSaw] = useState<string>('waiting for the server');
  // added-next-line
  const [summary, setSummary] = useState<string>('waiting for the model');

  useEffect(() => {
    // added-next-line
    fetchSummary().then(setSummary).catch((error: Error) => setSummary(error.message));
    fetchHello()
```

```tsx title="client/src/HelloPage.tsx" showLineNumbers=22 excerpt
        <p>Verified on the server: {serverSaw}</p>
        // added-next-line
        <p>Summary route: {summary}</p>
      </main>
```

Open the app page in the space as a member whose [share](../../vector-space/glossary.md#share) gives `lead:manage`. **Can use** gives every capability the app declares. The summary line reads `waiting for the model` for a few seconds. With no model set, it then reads `409` followed by a JSON body that holds the message `No model is set for the "lead-summary" slot on this space`. With a model set, it reads `200` followed by `{"summary":"..."}`.

## Next steps

- [Model slot fields](../../sdk/app-definition.md#resourcesmodels): change which models a space admin can pick for the slot.
