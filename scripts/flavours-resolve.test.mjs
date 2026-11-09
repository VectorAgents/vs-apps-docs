import assert from 'node:assert/strict';
import { test } from 'node:test';
import { shareUrl, shortLabel } from '../src/flavours/resolve.mjs';

test('a share link carries every axis as a parameter and keeps the hash', () => {
  assert.equal(
    shareUrl('https://docs.example/vector-apps/quickstart#nest-start', { client: 'react', server: 'nest' }),
    'https://docs.example/vector-apps/quickstart?client=react&server=nest#nest-start',
  );
});

test('a share link replaces a flavour parameter already in the address and keeps other parameters', () => {
  assert.equal(
    shareUrl('https://docs.example/a?server=node&q=1', { client: 'react', server: 'nest' }),
    'https://docs.example/a?server=nest&q=1&client=react',
  );
});

test('a trigger label is the part of the flavour name before the plus', () => {
  assert.equal(shortLabel('Node.js + TypeScript'), 'Node.js');
  assert.equal(shortLabel('Nest.js'), 'Nest.js');
});
