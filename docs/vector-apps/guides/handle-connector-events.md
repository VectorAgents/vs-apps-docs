---
title: Handle connector events
description: Receive an inbound event from a connector on your server and reply through the same connector.
---

Receive an inbound event from a connector on your server and answer it through the same connector. When you finish, a handler for one [connector slot](../glossary.md#connector-slot) replies through the connector, checks the `ConnectorExecuteResult` and lets [Vector Space](../../vector-space/glossary.md#vector-space) send the event again when the reply fails.

This guide covers a Nest.js server.

<!-- flavour nest -->
## Prerequisites

- The Nest.js app from Part 1 of the [quickstart](../quickstart.md#part-1-run-the-app-locally), running with `npm run dev:space`. Step 1 of [Part 2](../quickstart.md#part-2-add-the-app-to-a-space) sets up the `.env` file that command reads.
- Background: the [server primitives](../../sdk/reference/root.md) and the [connector slot fields](../../sdk/app-definition.md#resourcesconnectors) of the app definition.

## Steps

### 1. Declare the slot and its handler

This guide uses `ConnectorEventsService` and the `ConnectorExecuteResult` type from the `@vectoragents/vs-apps/nest` subpath of the [SDK](../../sdk/glossary.md#sdk). A connector slot can declare event handlers. A [space admin](../../vector-space/glossary.md#space-admin) attaches a connector to the slot. When a [space editor](../../vector-space/glossary.md#space-editor) routes an event type of that connector to a handler, Vector Space sends each event to your server.

Vector Space routes events only to a handler that the manifest declares. Put the slot in its own file, so that `shared/src/index.ts` changes by two lines.

```ts title="shared/src/support-slot.ts"
import type { AppConnectorRequirement } from '@vectoragents/vs-apps';

export const supportSlot: AppConnectorRequirement = {
  key: 'support',
  provider: 'REST',
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

A handler makes `eventsUrl` required in the manifest. `buildManifests` builds it as `<PUBLIC_BASE_URL>/api/events/hello-app`, so set `PUBLIC_BASE_URL` in `.env` to an address that Vector Space can reach.

### 2. Reply through the connector

A handler gets the event and no user token. To call the connector back, ask `SpaceS2sService` for an [app token](../glossary.md#app-token), then call `connectorExecute`. The call runs with the permissions of the app alone, not those of a member.

`connectorExecute` returns a `ConnectorExecuteResult`: `status` (a number), `data`, and on failure `errorCode` and `retryAfterSeconds`. A failed call comes back as a result with `status` 400 or higher. It does not throw, so the caller must read `status`.

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

  async reply(appId: string, event: ConnectorEventDelivery, text: string): Promise<ConnectorExecuteResult> {
    const token = await this.s2s.getToken(appId, event.spaceId);
    return this.space.connectorExecute(token, {
      spaceId: event.spaceId,
      connectorId: event.connectorId,
      operationId: 'send_message',
      args: { text },
    });
  }
}
```

`operationId` names an operation of the attached connector. `send_message` is an example: use an identifier that your connector defines.

### 3. Register the handler

`ConnectorEventsService` holds the function that runs for each handler. `.on` takes a target and a handler function. The target is the `appKey`, the slot key and the handler key from step 1. It throws if you register the same target twice. Register in `onModuleInit`, so that every handler exists before the server takes requests.

The function gets the event and a context with the verified `claims` of the events token and the `traceparent` header. It returns nothing. The SDK answers `{ handled: true }` when the function returns, and answers `500` when it throws.

Vector Space delivers each event at least once, up to three times. Skip an event identifier that you already handled.

```ts title="server/src/support-events.service.ts"
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConnectorEventsService } from '@vectoragents/vs-apps/nest';
import type { ConnectorEventDelivery, EventsTokenClaims } from '@vectoragents/vs-apps';
import { SupportReplyService } from './support-reply.service';

@Injectable()
export class SupportEventsService implements OnModuleInit {
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
    const result = await this.replies.reply(claims.appId, event, 'Message received.');
    if (result.status >= 400) {
      throw new Error(`Reply failed with status ${result.status} (${result.errorCode ?? 'no error code'})`);
    }
    this.handled.add(event.eventId);
  }
}
```

The throw makes the SDK answer `500`, and Vector Space sends the event again. The set keeps its identifiers in memory, so a restart forgets them. Keep the identifiers in your own storage if a second reply is a problem.

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

### 5. Check the events route

Restart `npm run dev:space`. In a second terminal, post an event with no token. `SERVER_PORT` is the value in `.env`.

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST -H 'Content-Type: application/json' -d '{"eventId":1,"slot":"support","handler":"inbound-message","provider":"REST","connectorId":1,"connectorName":"Support inbox","eventType":"message-received","spaceId":1,"occurredAt":"2026-01-01T00:00:00Z","payload":{}}' http://localhost:<SERVER_PORT>/api/events/hello-app
```

The command prints `401`, because the route accepts only an events token that Vector Space signs. A body that fails the event schema prints `400` first.

## Next steps

- [Add the app to a space](../quickstart.md#part-2-add-the-app-to-a-space): register the app so that a connector can attach to the `support` slot.
<!-- /flavour -->
<!-- flavour node todo -->
<!-- /flavour -->
