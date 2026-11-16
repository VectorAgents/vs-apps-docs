import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  APP_AI_PROVIDERS,
  APP_CONNECTOR_PROVIDERS,
  APP_CONNECTOR_SERVICES,
  APP_MODEL_CAPABILITIES,
  appActMeasureSchema,
  appModelSlotSchema,
} from '@vectoragents/vs-apps';
import { installedSdkVersion } from './starter-sync.mjs';
import { section } from './page-helpers.mjs';
import { descriptionOf, longCells, overlong, tablesOf } from './sdk-page-helpers.mjs';

const text = readFileSync(new URL('../docs/sdk/reference/platform-limits.md', import.meta.url), 'utf8');
const version = installedSdkVersion();

// The SDK has no source list of modules: it takes a module key as a free string.
const listSections = [
  ['Connector providers', APP_CONNECTOR_PROVIDERS],
  ['Meta messaging services', APP_CONNECTOR_SERVICES],
  ['Model providers', APP_AI_PROVIDERS],
  ['Modalities', appModelSlotSchema.shape.modality.options],
  ['Capability filters', APP_MODEL_CAPABILITIES],
  ['First-party Vector Modules', ['omnibox', 'contacts']],
  ['Act measure units', appActMeasureSchema.shape.unit.options],
];

/** What each list fills, and whether `defineApp` reads it. */
const fills = {
  'Connector providers': [/`provider` in each entry of `resources\.connectors\[\]`/, /`defineApp` rejects a value outside this list/],
  'Meta messaging services': [/`service` field/, /`defineApp` does not read this list/],
  'Model providers': [/`providers` in each entry of `resources\.models\[\]`/, /`defineApp` rejects a value outside this list/],
  Modalities: [/`modality` in each entry of `resources\.models\[\]`/, /`defineApp` rejects a value outside this list/],
  'Capability filters': [/`capabilities` in each entry of `resources\.models\[\]`/, /`defineApp` rejects a value outside this list/],
  'First-party Vector Modules': [/`key` in each entry of `resources\.modules\[\]`/, /`defineApp` does not read this list/],
  'Act measure units': [/`unit` in each entry of `measures\[\]`/, /`defineApp` rejects a value outside this list/],
};

/** Values in the first column of the tables of a section, without code marks. */
const firstColumn = (body) =>
  body
    .split('\n')
    .filter((line) => /^\| `/.test(line))
    .map((line) => line.match(/^\| `([^`]+)`/)[1]);

test('the page has one section per closed list, in order', () => {
  const headings = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  assert.deepEqual(headings.slice(0, listSections.length), listSections.map(([title]) => title));
});

test('each table lists the values of its source, in source order', () => {
  for (const [title, values] of listSections) {
    assert.deepEqual(firstColumn(section(text, title)), [...values], title);
  }
});

test('the page holds no SDK version and has a description of 160 characters or fewer', () => {
  assert.doesNotMatch(text, new RegExp(version.replaceAll('.', '\\.')));
  assert.doesNotMatch(text, /Holds for/);
  const description = descriptionOf(text);
  assert.ok(description && description.length <= 160);
  assert.doesNotMatch(description, /^(This page|Learn|Reference for)\b/);
});

test('each list section names the field it fills and says whether defineApp reads it', () => {
  for (const [title, patterns] of Object.entries(fills)) {
    for (const pattern of patterns) assert.match(section(text, title), pattern, title);
  }
});

test('each list is a two-column table of a literal value and a short meaning', () => {
  for (const [title] of listSections) {
    const tables = tablesOf(section(text, title));
    assert.equal(tables.length, 1, title);
    assert.equal(tables[0].header.length, 2, title);
  }
  assert.deepEqual(longCells(text), []);
  assert.deepEqual(overlong(text), []);
});

test('the Modules list says its source is Vector Space, not the SDK', () => {
  assert.match(section(text, 'First-party Vector Modules'), /source is Vector Space, not the SDK/);
});

test('the page leaves out NDA text, onboarding, the dev-only claim and the old company name', () => {
  assert.doesNotMatch(text, /\bNDA\b|confidential|RedemptAI|dev only|onboarding|not yet public|public soon/i);
});

test('the page ends with one Next steps link and a reason', () => {
  const next = section(text, 'Next steps');
  assert.equal([...next.matchAll(/\]\(([^)]+)\)/g)].length, 1);
  assert.match(next, /- \[[^\]]+\]\([^)]+\): .*\S\.\s*$/);
  assert.equal(text.split(/^## /m).at(-1).startsWith('Next steps'), true);
});
