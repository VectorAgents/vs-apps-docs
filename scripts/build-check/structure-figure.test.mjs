import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spaceStructure } from '../../src/diagrams/figures/space-structure.ts';
import { structureFigureChecks } from './structure-figure-checks.mjs';

const { page, figure } = structureFigureChecks({
  url: '/vector-space/what-vector-space-is',
  data: spaceStructure,
  searchLabels: ['Orchestrator agent', 'Command Center', 'Context Hub', 'Vector Modules'],
  remoteLinks: 3,
});

test('the overview page shows the real figure and no placeholder', () => {
  assert.ok(figure, 'the page holds a structure figure');
  assert.ok(!page.includes('figure-placeholder'));
});
