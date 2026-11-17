---
title: Handle connector events
description: Receive an inbound event from a connector on your server and reply through the same connector.
start: leads-app
---

Receive an inbound event from a connector on your server and reply through the same connector. The handler for one [connector slot](../glossary.md#connector-slot) checks the `ConnectorExecuteResult` of the reply, and [Vector Space](../../vector-space/glossary.md#vector-space) sends the event again when the handler fails with a `5xx` status.

This guide covers a Nest.js server.

<!-- flavour nest -->
## Prerequisites

- A GitHub package token in `GITHUB_PACKAGES_TOKEN`, as in [step 0 of the quickstart](../quickstart.md#0-set-up-access-to-the-package-registry). The scaffold command reads it.
- The `leads-app` start. Scaffold it into a new folder, `leads-guide`, so it does not clash with the `leads-app` folder of a recipe. Work inside the new folder.

```bash
npm create @vectoragents/app leads-guide -- --client react --server nest --start leads-app
cd leads-guide
```

- The `leads-app` start, added to a space and run with `npm run dev:space`, as in [Part 2 of the quickstart](../quickstart.md#part-2-add-the-app-to-a-space).
- A [space admin](../../vector-space/glossary.md#space-admin) of that space, and a key for an Apollo connector. Any text works as the key for the check in step 6.
- Background: the [server primitives](../../sdk/reference/root.md) and the [connector slot fields](../../sdk/app-definition.md#resourcesconnectors) of the app definition.

## Steps

### 1. Declare the slot and its handler

This guide uses `ConnectorEventsService` from the `@vectoragents/vs-apps/nest` subpath and the `ConnectorExecuteResult` type from the root of the [SDK](../../sdk/glossary.md#sdk). A connector slot can declare event handlers. A space admin attaches a connector to the slot. When a [space editor](../../vector-space/glossary.md#space-editor) routes an event type of that connector to a handler, Vector Space sends each event to your server.

Vector Space routes events only to a handler that the manifest declares. Put the slot in its own file, so that `shared/src/index.ts` changes by two lines.

```ts title="shared/src/support-slot.ts"
import type { AppConnectorRequirement } from '@vectoragents/vs-apps';

export const supportSlot: AppConnectorRequirement = {
  key: 'support',
  provider: 'APOLLO',
  label: 'Support inbox',
  required: false,
  eventHandlers: [
    {
      key: 'inbound-message',
      label: 'Inbound message',
      defaultEventTypes: ['message-received'],
    },
  ],
};
```

In `shared/src/index.ts`, import `supportSlot` from `./support-slot`.

```ts title="shared/src/index.ts" showLineNumbers=1 excerpt
import { defineApp } from '@vectoragents/vs-apps';
// added-next-line
import { supportSlot } from './support-slot';

export const CAPABILITY = 'hello:view';
```

Then add `resources` to the object that `defineApp` takes.

```ts title="shared/src/index.ts" showLineNumbers=25 excerpt
    { key: 'lead:manage', label: 'Manage Leads', effect: 'write' },
    { key: 'icp:manage', label: 'Manage ICP', effect: 'write' },
  ],
  // added-next-line
  resources: { connectors: [supportSlot] },
});
```

`APOLLO` is a provider that sends events: Apollo calls a webhook of the connector, and the `eventHandlers` of the slot receive each event. A `REST` connector has no webhook, so a slot with that provider never receives an event.

A handler makes `eventsUrl` required in the manifest. `buildManifests` builds it as `<PUBLIC_BASE_URL>/api/events/hello-app`, so set `PUBLIC_BASE_URL` in `.env` to an address that Vector Space can reach.

### 2. Reply through the connector

A handler gets the event and no user token. To call the connector back, ask `SpaceS2sService` for an [app token](../glossary.md#app-token), then call `connectorExecute`. The call runs with the permissions of the app alone, not those of a member.

`connectorExecute` returns a `ConnectorExecuteResult`: `status` (a number), `data`, and on failure `errorCode` and `retryAfterSeconds`. Read `status`: a result with `status` 400 or higher is a failed call. Vector Space refuses an unknown `operationId` with `404`, a connector that is not attached to the app with `403`, and a server error with `500`. For each refusal, `connectorExecute` throws a `SpaceActionError` that carries the status.

```ts title="server/src/support-reply.service.ts"
import { Injectable } from '@nestjs/common';
import { SpaceActionsService, SpaceS2sService } from '@vectoragents/vs-apps/nest';
import type { ConnectorEventDelivery, ConnectorExecuteResult } from '@vectoragents/vs-apps';

@Injectable()
export class SupportReplyService {
  constructor(
    private readonly space: SpaceActionsService,
    private readonly s2s: SpaceS2sService,
  ) {}

  async reply(appId: string, event: ConnectorEventDelivery, contactId: string, text: string): Promise<ConnectorExecuteResult> {
    const token = await this.s2s.getToken(appId, event.spaceId);
    return this.space.connectorExecute(token, {
      spaceId: event.spaceId,
      connectorId: event.connectorId,
      operationId: 'apollo.emails.createDraft',
      args: { body: { contact_id: contactId, body_html: text } },
    });
  }
}
```

`operationId` names an operation of the attached connector. `apollo.emails.createDraft` is an operation of the Apollo connector: it saves an unsent email draft for a contact and sends nothing. `args` holds the arguments of the operation, here the `body` of the draft.

### 3. Register the handler

`ConnectorEventsService` holds the function that runs for each handler. `.on` takes a target and a handler function. The target is the `appKey`, the slot key and the handler key from step 1. It throws if you register the same target twice. Register in `onModuleInit`, so that every handler exists before the server takes requests.

The function gets the event and a context with the verified `claims` of the events token and the `traceparent` header. It returns nothing. The SDK answers `{ handled: true }` when the function returns. It answers `500` when the function throws, and with the status of the error when the function throws a `SpaceActionError`, which comes from `@vectoragents/vs-apps/server`.

Vector Space delivers each event at least once, up to three times. It sends an event again only after a `5xx` answer. A `4xx` answer is final: the **Events** tab of the connector shows `1 failed` and a **Redeliver** button. Skip an event identifier that you already handled.

```ts title="server/src/support-events.service.ts"
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConnectorEventsService } from '@vectoragents/vs-apps/nest';
import type { ConnectorEventDelivery, EventsTokenClaims } from '@vectoragents/vs-apps';
import { SupportReplyService } from './support-reply.service';

@Injectable()
export class SupportEventsService implements OnModuleInit {
  private readonly logger = new Logger(SupportEventsService.name);
  private readonly handled = new Set<number>();

  constructor(
    private readonly events: ConnectorEventsService,
    private readonly replies: SupportReplyService,
  ) {}

  onModuleInit() {
    this.events.on({ appKey: 'hello-app', slot: 'support', handler: 'inbound-message' }, (event, { claims }) =>
      this.inboundMessage(event, claims),
    );
  }

  private async inboundMessage(event: ConnectorEventDelivery, claims: EventsTokenClaims): Promise<void> {
    if (this.handled.has(event.eventId)) return;
    this.logger.log(`Received event ${event.eventId} (${event.eventType})`);
    const { contact_id: contactId } = event.payload as { contact_id?: string };
    if (contactId) {
      const result = await this.replies.reply(claims.appId, event, contactId, 'Message received.');
      if (result.status >= 400) {
        throw new Error(`Reply failed with status ${result.status} (${result.errorCode ?? 'no error code'})`);
      }
    }
    this.handled.add(event.eventId);
  }
}
```

The body of an Apollo webhook is whatever your Apollo workflow sends, so the handler replies only when the body holds a `contact_id`. A failed result makes the handler throw, the SDK answers `500` and Vector Space sends the event again. The set keeps its identifiers in memory, so a restart forgets them. Keep the identifiers in your own storage if a second reply is a problem.

A delivery for a handler that no one registered gets `{ handled: false }` and is not sent again. `event.payload` is the body of the provider, unchanged.

### 4. Register the module

The platform module is global, so the module needs no import for `ConnectorEventsService`, `SpaceActionsService` or `SpaceS2sService`.

```ts title="server/src/support-events.module.ts"
import { Module } from '@nestjs/common';
import { SupportEventsService } from './support-events.service';
import { SupportReplyService } from './support-reply.service';

@Module({
  providers: [SupportReplyService, SupportEventsService],
})
export class SupportEventsModule {}
```

In `server/src/app.module.ts`, import `SupportEventsModule`.

```ts title="server/src/app.module.ts" showLineNumbers=3 excerpt
import { MemoryCredentialStore } from './credential-store';
import { HelloController } from './hello.controller';
import { manifests } from './manifests';
// added-next-line
import { SupportEventsModule } from './support-events.module';

@Module({
```

Then add it to the `imports` array, after `AppPlatformModule.forRoot(...)`.

```ts title="server/src/app.module.ts" showLineNumbers=21 excerpt
    }),
    // added-next-line
    SupportEventsModule,
  ],
  controllers: [HelloController],
```

### 5. Attach a connector and route its events

**Role**: staff, then space admin. Restart `npm run dev:space`. The server tells Vector Space about the new slot at start.

1. Staff open the row of the app, then choose **Check for updates**, **Review update** and **Apply**. For a connector slot, the dialog says only `Declared resource requirements changed.`
2. A space admin opens the configuration of the app. The **Connectors** section lists the slot `Support inbox`.
3. In that section, choose **Create**, then **Apollo**. Give the connector a name and a key.
4. In **Resources**, open **Access** on the new connector and set **General access** to `Everyone in <space>`, then confirm **Share**. A Restricted connector is not offered for the slot, and sharing with a group alone does not make it available.
5. In the configuration of the app, choose **Add from pool…**, the connector and **Attach**. The row shows the number of routed event types, `1`: the `defaultEventTypes` of the handler.
6. In **Resources**, open the connector, then **Webhooks**, **Mint webhook** and **Show full**. The URL has the form `<space public host>/api/webhooks/connectors/<secret>/<event name>`.

### 6. Check the events route

In a second terminal, post an event with no token. `SERVER_PORT` is the value in `.env`.

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST -H 'Content-Type: application/json' -d '{"eventId":1,"slot":"support","handler":"inbound-message","provider":"APOLLO","connectorId":1,"connectorName":"Support inbox","eventType":"message-received","spaceId":1,"occurredAt":"2026-01-01T00:00:00Z","payload":{}}' http://localhost:<SERVER_PORT>/api/events/hello-app
```

The command prints `401`, because the route accepts only an events token that Vector Space signs. A body that fails the event schema prints `400` first.

Then post an event to the webhook of the connector, with the secret from step 5 and the event name `message-received`.

```bash
curl -X POST -H 'Content-Type: application/json' -d '{"text":"Where is my order?"}' https://<space public host>/api/webhooks/connectors/<secret>/message-received
```

The command prints `{"ok":true}`. The app log shows the line `Received event <eventId> (message-received)`. The **Events** tab of the connector lists the event, with a count in **Deliveries**. The body holds no `contact_id`, so the handler sends no reply.

## Next steps

- [Connector slot fields](../../sdk/app-definition.md#resourcesconnectors): add a second handler or change the provider of the slot.
<!-- /flavour -->
<!-- flavour node todo -->
<!-- /flavour -->
