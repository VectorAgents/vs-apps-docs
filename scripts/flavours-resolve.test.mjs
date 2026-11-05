import assert from 'node:assert/strict';
import { test } from 'node:test';
import { choiceInQuery, completeChoice, shortLabel } from '../src/flavours/resolve.mjs';

const axes = { client: { react: 'React' }, server: { node: 'Node.js + TypeScript', nest: 'Nest.js' } };
const defaults = { client: 'react', server: 'node' };

test('a full choice takes the saved flavour of each axis', () => {
  assert.deepEqual(completeChoice({ client: 'react', server: 'nest' }, axes, defaults), { client: 'react', server: 'nest' });
});

test('a missing or unknown saved flavour falls back to the default of its axis', () => {
  assert.deepEqual(completeChoice(null, axes, defaults), defaults);
  assert.deepEqual(completeChoice({ client: 'vue', server: 'nest' }, axes, defaults), { client: 'react', server: 'nest' });
  assert.deepEqual(completeChoice('nest', axes, defaults), defaults);
});

test('the query names a flavour with one parameter per axis', () => {
  assert.deepEqual(choiceInQuery('?client=react&server=nest', axes), { client: 'react', server: 'nest' });
  assert.deepEqual(choiceInQuery('?server=nest', axes), { server: 'nest' });
});

test('a query parameter that is not an axis, or names an unknown flavour, is ignored', () => {
  assert.deepEqual(choiceInQuery('?client=vue&server=nest&a=1', axes), { server: 'nest' });
  assert.deepEqual(choiceInQuery('?react=client', axes), {});
  assert.deepEqual(choiceInQuery('', axes), {});
});

test('a prototype property name is not a flavour', () => {
  assert.deepEqual(choiceInQuery('?server=constructor&client=__proto__', axes), {});
});

test('a trigger label is the part of the flavour name before the plus', () => {
  assert.equal(shortLabel('Node.js + TypeScript'), 'Node.js');
  assert.equal(shortLabel('Nest.js'), 'Nest.js');
});
