import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { tracks } from '../src/tracks/index.ts';

const docs = new URL('../docs/', import.meta.url);

test('track ids are unique', () => {
  assert.equal(new Set(tracks.map((t) => t.id)).size, tracks.length);
});

test('each track names a title, a one-line goal and a route', () => {
  for (const track of tracks) {
    assert.ok(track.title && track.goal && track.to, track.id);
    assert.ok(!track.goal.includes('\n'), track.id);
  }
});

test('each track links its first step', () => {
  assert.deepEqual(Object.fromEntries(tracks.map((t) => [t.title, t.to])), {
    'Hello world app': '/vector-apps/quickstart',
    'Build an app definition': '/sdk/app-definition',
    'Gate by capability': '/vector-apps/quickstart',
    'Expose agent actions': '/vector-apps/quickstart',
  });
  for (const { to } of tracks) assert.ok(existsSync(new URL(`${to.slice(1)}.md`, docs)), to);
});
