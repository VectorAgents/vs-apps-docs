import assert from 'node:assert/strict';
import { test } from 'node:test';
import { roleLadder } from '../src/diagrams/figures/role-ladder.ts';
import { slotOf } from '../src/diagrams/figures/slots.ts';
import { bannedTermsIn } from './page-helpers.mjs';

const { steps, asides } = roleLadder;
const prose = [roleLadder.title, roleLadder.desc, roleLadder.caption, ...steps.flatMap((s) => [s.holds, s.plus ?? '', ...s.adds]), ...asides.map((a) => a.text)];

test('the data takes its caption from the slot table, and the slot is a ladder of the who-can-do-what page', () => {
  assert.equal(roleLadder.id, 'role-ladder');
  assert.equal(roleLadder.caption, slotOf('role-ladder').caption);
  assert.equal(slotOf('role-ladder').kind, 'ladder');
  assert.equal(slotOf('role-ladder').page, 'who-can-do-what');
});

test('there are three steps from the lowest rung, each with a label, a share level pill and at least one act', () => {
  assert.deepEqual(steps.map((s) => s.label), ['Space member', 'Space editor', 'Space admin']);
  for (const step of steps) {
    assert.ok(step.label.length > 0 && step.holds.length > 0, step.id);
    assert.ok(step.adds.length >= 1 && step.adds.every((a) => a.length > 0), step.id);
  }
  assert.deepEqual(steps.map((s) => s.holds), ['No level on every resource', 'Can edit on every resource', 'Can manage on every resource']);
});

test('the lowest rung adds only its own acts: no lead-in, and every higher rung leads in from the rung below and repeats none of its acts', () => {
  assert.equal(steps[0].plus, undefined);
  steps.slice(1).forEach((step, i) => assert.equal(step.plus, `Everything a ${steps[i].label.toLowerCase()} holds, plus:`, step.id));
  const acts = steps.flatMap((s) => s.adds);
  assert.equal(new Set(acts).size, acts.length);
});

test('two asides stand beside the steps: the custom role and the organization admin', () => {
  assert.deepEqual(asides.map((a) => a.label), ['Custom role', 'Organization admin']);
  for (const aside of asides) assert.ok(aside.text.length > 0, aside.id);
});

test('the text has no dash, no "we" and no capital-S Space in prose, and the ids are unique', () => {
  for (const text of prose) {
    assert.doesNotMatch(text, /[–—]/, text);
    assert.doesNotMatch(text, /\b[Ww]e\b|\b[Oo]ur\b/, text);
    assert.deepEqual(bannedTermsIn(text), [], text);
  }
  assert.ok([...steps, ...asides].every((i) => !/[–—]/.test(i.label)));
  const ids = [...steps, ...asides].map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('the desc names the steps and the asides, so a screen reader hears the shape', () => {
  assert.match(roleLadder.desc, /three steps/i);
  assert.match(roleLadder.desc, /custom role/i);
  assert.match(roleLadder.desc, /organization admin/i);
});
