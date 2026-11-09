import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';
import { chooseFlavours, flavourStyle, headScript, storageKey } from '../src/flavours/head-script.mjs';

const axes = { client: { react: 'React' }, server: { node: 'Node.js + TypeScript', nest: 'Nest.js' } };
const defaults = { client: 'react', server: 'node' };
const choose = (input) => chooseFlavours({ search: '', hash: '', saved: null, axes, defaults, ...input });

test('with no address parameter and nothing saved the defaults apply and nothing is saved', () => {
  assert.deepEqual(choose({}), { choice: defaults, save: null });
});

test('a saved flavour applies per axis and a missing or unknown one falls back to the default', () => {
  assert.deepEqual(choose({ saved: { client: 'react', server: 'nest' } }).choice, { client: 'react', server: 'nest' });
  assert.deepEqual(choose({ saved: { client: 'vue', server: 'nest' } }).choice, { client: 'react', server: 'nest' });
  assert.deepEqual(choose({ saved: 'nest' }).choice, defaults);
  assert.deepEqual(choose({ saved: { server: 'constructor' } }).choice, defaults);
});

test('a parameter beats the saved choice and overwrites it, one parameter per axis', () => {
  const result = choose({ search: '?server=nest', saved: { client: 'react', server: 'node' } });
  assert.deepEqual(result.choice, { client: 'react', server: 'nest' });
  assert.deepEqual(result.save, { client: 'react', server: 'nest' });
});

test('a parameter that equals the saved choice saves nothing', () => {
  assert.equal(choose({ search: '?server=nest', saved: { server: 'nest' } }).save, null);
});

test('a parameter that is not an axis or names an unknown flavour is ignored', () => {
  assert.deepEqual(choose({ search: '?client=vue&server=constructor&nest=server&a=1' }), { choice: defaults, save: null });
});

test('a bare anchor that starts with a flavour name switches to that flavour and saves it', () => {
  const result = choose({ hash: '#nest-start-the-server', saved: { server: 'node' } });
  assert.deepEqual(result.choice, { client: 'react', server: 'nest' });
  assert.deepEqual(result.save, { server: 'nest' });
});

test('an anchor needs the hyphen after the flavour name, and other anchors change nothing', () => {
  assert.deepEqual(choose({ hash: '#nestling' }), { choice: defaults, save: null });
  assert.deepEqual(choose({ hash: '#2-register-the-routes' }), { choice: defaults, save: null });
  assert.deepEqual(choose({ hash: '#%E0%A4%A' }), { choice: defaults, save: null });
});

test('a parameter beats an anchor on the same axis', () => {
  assert.equal(choose({ search: '?server=node', hash: '#nest-start' }).choice.server, 'node');
});

test('the saved choice keeps the axes the address does not name', () => {
  assert.deepEqual(choose({ search: '?client=react', saved: { server: 'nest' } }).save, { client: 'react', server: 'nest' });
});

/** Runs the head script in a bare context with fake document, location and storage; returns what it did. */
function runHeadScript({ search = '', hash = '', stored, throwing = false } = {}) {
  const attributes = {};
  const store = new Map(stored === undefined ? [] : [[storageKey, stored]]);
  const localStorage = {
    getItem: (key) => {
      if (throwing) throw new Error('blocked');
      return store.has(key) ? store.get(key) : null;
    },
    setItem: (key, value) => {
      if (throwing) throw new Error('blocked');
      store.set(key, value);
    },
  };
  const context = {
    URLSearchParams,
    JSON,
    Object,
    localStorage,
    location: { search, hash },
    document: { documentElement: { setAttribute: (name, value) => (attributes[name] = value) } },
  };
  vm.runInNewContext(headScript(axes, defaults), context);
  return { attributes, saved: store.get(storageKey) };
}

test('the head script sets one data attribute per axis from the defaults', () => {
  assert.deepEqual(runHeadScript().attributes, { 'data-client': 'react', 'data-server': 'node' });
});

test('the head script reads the saved choice, with a parameter winning and overwriting it', () => {
  const stored = JSON.stringify({ client: 'react', server: 'nest' });
  assert.equal(runHeadScript({ stored }).attributes['data-server'], 'nest');
  const shared = runHeadScript({ stored, search: '?server=node' });
  assert.equal(shared.attributes['data-server'], 'node');
  assert.deepEqual(JSON.parse(shared.saved), { client: 'react', server: 'node' });
});

test('the head script switches on an anchor that names a flavour', () => {
  const result = runHeadScript({ hash: '#nest-start-the-server' });
  assert.equal(result.attributes['data-server'], 'nest');
  assert.deepEqual(JSON.parse(result.saved), { server: 'nest' });
});

test('the head script survives corrupt or blocked storage and still sets the attributes', () => {
  assert.deepEqual(runHeadScript({ stored: '{not json' }).attributes, { 'data-client': 'react', 'data-server': 'node' });
  assert.deepEqual(runHeadScript({ throwing: true, search: '?server=nest' }).attributes, { 'data-client': 'react', 'data-server': 'nest' });
});

test('the head script text holds no closing script tag', () => {
  assert.doesNotMatch(headScript({ client: { 'a</script>': 'X' } }, { client: 'a' }), /<\/script/i);
});

test('the style hides a block of another flavour only once the attribute is set', () => {
  const css = flavourStyle(axes);
  assert.ok(css.includes('html[data-server]:not([data-server="nest"]) .flavour-block[data-axis="server"][data-flavour="nest"]{display:none}'));
  assert.ok(css.includes('html[data-client]:not([data-client="react"]) .flavour-block[data-axis="client"][data-flavour="react"]{display:none}'));
});

test('the style hides the contents entry of a heading inside a hidden block', () => {
  assert.ok(flavourStyle(axes).includes('html[data-server]:not([data-server="nest"]) .table-of-contents li:has(> a[href^="#nest-"]){display:none}'));
});

test('the style hides the picker until the head script has run', () => {
  assert.ok(flavourStyle(axes).includes('html:not([data-client]) .flavour-picker'));
});

test('the style hides the todo switch button until the head script has run', () => {
  assert.ok(flavourStyle(axes).includes('html:not([data-client]) .flavour-todo-switch'));
});
