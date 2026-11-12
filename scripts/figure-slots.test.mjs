import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { PLACEHOLDER_CAP, slots } from '../src/diagrams/figures/slots.ts';
import { section } from './page-helpers.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docs = join(root, 'docs');

/** Slot id and tag of every figure in an MDX page: a placeholder names its slot, a real figure takes its id from the data file it imports. */
export function figuresOf(text) {
  const dataIds = Object.fromEntries([...text.matchAll(/import \{ (\w+) \} from '@site\/src\/diagrams\/figures\/([\w-]+)\.ts'/g)].map(([, name, id]) => [name, id]));
  return [...text.matchAll(/<(FigurePlaceholder|StructureFigure|FlowFigure)\b([^>]*)\/>/g)].map(([, tag, props]) => {
    if (tag === 'FigurePlaceholder') return { tag, id: props.match(/slot="([^"]+)"/)?.[1] };
    return { tag, id: dataIds[props.match(/data=\{(\w+)\}/)?.[1]] };
  });
}

const sourceFiles = readdirSync(docs, { recursive: true })
  .filter((file) => /\.mdx?$/.test(file))
  .map((file) => file.split('\\').join('/'));
const read = (file) => readFileSync(join(docs, file), 'utf8');
const pageOf = (slot) => `vector-space/${slot.page}.md`;

/** The H2 that holds each slot's figure. */
const headings = {
  'space-structure': 'The parts of a space',
  'organization-structure': 'The organization as the tenant',
  'agent-tree': 'The agent tree',
  'access-check': 'How the inputs combine',
  'record-of-work': 'The four governance views',
  'worked-example-flow': "A member's outreach request",
  'approvals-flow': 'The ask and who decides it',
  'extending-flow': 'Adding an extension',
  'agent-studio-tree': 'How agents are arranged',
  'agent-studio-access': 'What a run may use',
  'agent-studio-lifecycle': 'The life of a change',
};

test('figuresOf reads a placeholder by slot and a real figure by the id of its data file', () => {
  const real = "import StructureFigure from '@site/src/components/StructureFigure';\nimport { agentTree } from '@site/src/diagrams/figures/agent-tree.ts';\n\n<StructureFigure data={agentTree} />\n";
  assert.deepEqual(figuresOf(real), [{ tag: 'StructureFigure', id: 'agent-tree' }]);
  assert.deepEqual(figuresOf('<FigurePlaceholder slot="access-check" />'), [{ tag: 'FigurePlaceholder', id: 'access-check' }]);
  assert.deepEqual(figuresOf('no figure'), []);
});

test('the registry holds the 11 slots, each with a unique id, a page of the section, a kind and a caption', () => {
  assert.deepEqual(slots.map((s) => s.id), Object.keys(headings));
  assert.equal(new Set(slots.map((s) => s.page)).size, 9);
  for (const slot of slots) {
    assert.ok(existsSync(join(docs, pageOf(slot))), `${slot.id}: ${pageOf(slot)}`);
    assert.ok(['structure', 'flow'].includes(slot.kind), slot.id);
    assert.ok(slot.caption.length > 0 && !/[–—]/.test(slot.caption), slot.id);
  }
});

test('each page holds exactly the figures of its slots, each as a placeholder or as the real figure of its kind with the same id', () => {
  for (const page of new Set(slots.map((s) => s.page))) {
    const pageSlots = slots.filter((s) => s.page === page);
    const figures = figuresOf(read(`vector-space/${page}.md`));
    assert.deepEqual(figures.map((f) => f.id), pageSlots.map((s) => s.id), `${page}: figures in slot order`);
    figures.forEach((figure, i) => {
      if (figure.tag !== 'FigurePlaceholder') assert.equal(figure.tag, pageSlots[i].kind === 'flow' ? 'FlowFigure' : 'StructureFigure', figure.id);
    });
  }
});

test('each figure sits inside the H2 that the spec names for its slot', () => {
  for (const slot of slots) {
    const h2 = section(read(pageOf(slot)), headings[slot.id]);
    assert.equal(figuresOf(h2).length, 1, `${slot.id} in "${headings[slot.id]}"`);
  }
});

test('no other page of the section holds a figure', () => {
  const owned = new Set(slots.map(pageOf));
  for (const file of sourceFiles.filter((f) => f.startsWith('vector-space/') && !owned.has(f))) assert.deepEqual(figuresOf(read(file)), [], file);
});

test('outside the section, only the Apps overview holds a figure', () => {
  const outside = sourceFiles.filter((f) => !f.startsWith('vector-space/') && figuresOf(read(f)).length > 0);
  assert.deepEqual(outside, ['vector-apps/how-a-vector-app-works.md']);
});

test('the placeholder count is within PLACEHOLDER_CAP, which is at most 8', () => {
  const placeholders = sourceFiles.flatMap((file) => figuresOf(read(file))).filter((f) => f.tag === 'FigurePlaceholder');
  assert.ok(PLACEHOLDER_CAP <= 8);
  assert.ok(placeholders.length <= PLACEHOLDER_CAP, `${placeholders.length} placeholders`);
});

test('the placeholder shows the words "Diagram in progress" and no brief or master doc name', () => {
  const component = readFileSync(join(root, 'src/components/FigurePlaceholder.tsx'), 'utf8');
  assert.match(component, /Diagram in progress/);
  assert.doesNotMatch(component + JSON.stringify(slots), /\.md\b|brief|OVERVIEW|\.scratch/);
});
