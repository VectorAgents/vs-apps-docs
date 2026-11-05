import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { defineApp } from '@vectoragents/vs-apps';
import { connectorProviders, coreFieldRules, modalities, modelCapabilities, modelProviders, resourceFieldRules } from '../src/data/field-rules.ts';

const base = {
  key: 'demo-app',
  version: '0.1.0',
  pages: [{ key: 'home', label: 'Home', path: '/' }],
  capabilities: [{ key: 'demo:view', label: 'View', effect: 'read' }],
};

const place = {
  key: (v) => ({ ...base, key: v }),
  'pages[].key': (v) => ({ ...base, pages: [{ key: v, label: 'Home', path: '/' }] }),
  'pages[].capability': (v) => ({ ...base, pages: [{ key: 'home', label: 'Home', path: '/', capability: v }] }),
  'capabilities[].key': (v) => ({ ...base, capabilities: [{ key: v, label: 'View', effect: 'read' }] }),
  'resources.connectors[].key': (v) => ({
    ...base,
    resources: { connectors: [{ key: v, provider: 'REST', required: false }] },
  }),
  'resources.connectors[].eventHandlers[].key': (v) => ({
    ...base,
    resources: { connectors: [{ key: 'crm', provider: 'REST', required: false, eventHandlers: [{ key: v, label: 'H' }] }] },
  }),
  'resources.models[].key': (v) => ({
    ...base,
    resources: { models: [{ key: v, modality: 'chat', providers: ['ANTHROPIC'], required: false }] },
  }),
};

const samples = {
  key: ['demo-app', 'ab', 'a', 'Demo', '1demo', 'demo_app'],
  'pages[].key': ['home', 'my-page', 'Home', '1home', 'my_page'],
  'pages[].capability': ['demo:view', 'a:b:c', 'demo', 'Demo:view', 'demo:', 'demo_x:view'],
  'capabilities[].key': ['demo:view', 'a:b:c', 'demo', 'Demo:view', 'demo:', 'demo_x:view'],
  'resources.connectors[].key': ['crm', 'my-crm', 'Crm', 'my_crm'],
  'resources.connectors[].eventHandlers[].key': ['inbound', 'in-bound', 'Inbound', 'in_bound'],
  'resources.models[].key': ['chat', 'fast-chat', 'Chat', 'fast_chat'],
};

const accepts = (def) => {
  try {
    defineApp(def);
    return true;
  } catch {
    return false;
  }
};

test('every pattern rule agrees with defineApp', () => {
  const patterned = [...coreFieldRules, ...resourceFieldRules].filter((r) => r.pattern);
  assert.deepEqual(patterned.map((r) => r.path).sort(), Object.keys(place).sort());
  for (const rule of patterned) {
    for (const value of samples[rule.path]) {
      assert.equal(new RegExp(rule.pattern).test(value), accepts(place[rule.path](value)), `${rule.path}: ${value}`);
    }
  }
});

test('required flags agree with defineApp for core top-level fields', () => {
  for (const rule of coreFieldRules.filter((r) => /^[a-z]+$/i.test(r.path))) {
    const { [rule.path]: _omitted, ...rest } = base;
    if (!(rule.path in base)) continue;
    assert.equal(accepts(rest), !rule.required, rule.path);
  }
});

test('each rule has a path and a rule sentence', () => {
  for (const rule of [...coreFieldRules, ...resourceFieldRules]) {
    assert.ok(rule.path && rule.rule && typeof rule.required === 'boolean', rule.path);
  }
});

const limitsLink = /\]\(\.\/reference\/platform-limits\.md#([a-z-]+)\)/g;
const limitsPage = new URL('../docs/sdk/reference/platform-limits.md', import.meta.url);

test('a rule links only to a section of the platform limits page', () => {
  const sections = [...readFileSync(limitsPage, 'utf8').matchAll(/^## (.+)$/gm)].map((m) =>
    m[1].toLowerCase().replaceAll(' ', '-'),
  );
  for (const rule of [...coreFieldRules, ...resourceFieldRules]) {
    const links = rule.rule.match(/\]\(/g)?.length ?? 0;
    const anchors = [...rule.rule.matchAll(limitsLink)].map((m) => m[1]);
    assert.equal(anchors.length, links, `${rule.path}: ${rule.rule}`);
    for (const anchor of anchors) assert.ok(sections.includes(anchor), `${rule.path}: #${anchor}`);
  }
});

test('no rule lists a value of a closed list', () => {
  const closed = [...modalities, ...modelProviders, ...modelCapabilities, ...connectorProviders];
  for (const rule of [...coreFieldRules, ...resourceFieldRules]) {
    for (const value of closed) assert.ok(!rule.rule.includes(value), `${rule.path} lists ${value}`);
  }
});
