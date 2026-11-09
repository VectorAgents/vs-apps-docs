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

const text = readFileSync(new URL('../docs/sdk/reference/platform-limits.md', import.meta.url), 'utf8');
const version = installedSdkVersion();
const stamp = `\`@vectoragents/vs-apps\` ${version.replaceAll('.', '\\.')}`;

// Modules have no SDK source: the SDK takes a module key as a free string.
const listSections = [
  ['Connector providers', APP_CONNECTOR_PROVIDERS],
  ['Meta messaging services', APP_CONNECTOR_SERVICES],
  ['Model providers', APP_AI_PROVIDERS],
  ['Modalities', appModelSlotSchema.shape.modality.options],
  ['Capability filters', APP_MODEL_CAPABILITIES],
  ['First-party Vector Modules', ['omnibox', 'contacts']],
  ['Act measure units', appActMeasureSchema.shape.unit.options],
];

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

test('the page and each list carry the installed SDK version stamp', () => {
  assert.match(text, new RegExp(`^Reference for the closed lists of ${stamp}\\.`, 'm'));
  for (const [title] of listSections) assert.match(section(text, title), new RegExp(stamp), title);
});

test('the Modules list says its source is Vector Space, not the SDK', () => {
  assert.match(section(text, 'First-party Vector Modules'), /source is Vector Space, not the SDK/);
});

test('the page leaves out NDA text, onboarding, the dev-only claim and the old company name', () => {
  assert.doesNotMatch(text, /\bNDA\b|confidential|RedemptAI|dev only|onboarding|not yet public|public soon/i);
});

test('the page ends with one Next step link', () => {
  const next = section(text, 'Next step');
  assert.equal([...next.matchAll(/\]\(([^)]+)\)/g)].length, 1);
  assert.equal(text.split(/^## /m).at(-1).startsWith('Next step'), true);
});
