import assert from 'node:assert/strict';
import { test } from 'node:test';
import { appsOverview } from '../../src/diagrams/figures/apps-overview.ts';
import { searchText, structureFigureChecks } from './structure-figure-checks.mjs';

const url = '/vector-apps/how-a-vector-app-works';
const { page, figure } = structureFigureChecks({
  url,
  data: appsOverview,
  searchLabels: ['Your client', 'Your server', 'Manifest', 'Platform data', 'AI gateway', 'Your origin'],
  remoteLinks: 3,
});

test('the page holds one structure figure and no iso-diagram markup', () => {
  assert.ok(figure, 'the page holds a structure figure');
  assert.equal(page.match(/<figure class="structure-figure">/g)?.length, 1);
  assert.doesNotMatch(page, /iso-diagram|iso-legend|iso-badge/);
});

test('the picture draws no plain link', () => {
  const svg = figure.match(/<svg class="fig-svg"[\s\S]*?<\/svg>/)[0];
  assert.equal((svg.match(/class="fig-link"/g) ?? []).length, 0);
});

test('the search text keeps the labels apart', () => {
  assert.doesNotMatch(searchText(url), /spaceVector|SpaceYour|\d{3,}/);
});
