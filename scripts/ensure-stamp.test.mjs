import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { ensureStamp, writeStamp } from './ensure-stamp.mjs';

test('writes an empty stamp when absent and keeps an existing one', () => {
  const file = join(mkdtempSync(join(tmpdir(), 'stamp-')), 'static', 'verified.json');
  assert.equal(ensureStamp(file), true);
  assert.equal(JSON.parse(readFileSync(file, 'utf8')).verifiedAt, '');
  writeFileSync(file, '{"package":"0.2.4","verifiedAt":"2026-01-01T00:00:00.000Z","snippets":1}');
  assert.equal(ensureStamp(file), false);
  assert.ok(existsSync(file));
  assert.equal(JSON.parse(readFileSync(file, 'utf8')).package, '0.2.4');
});

test('writeStamp never exposes an empty or partial file to a concurrent reader, and leaves no temp file', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'stamp-'));
  const file = join(dir, 'static', 'verified.json');
  const stamp = { package: '0.4.0', verifiedAt: '2026-01-01T00:00:00.000Z', snippets: 103 };
  writeStamp(file, stamp);
  const reader = `
    const { readFileSync } = require('node:fs');
    const end = Date.now() + 500;
    let bad = 0;
    while (Date.now() < end) { try { JSON.parse(readFileSync(process.argv[1], 'utf8')); } catch { bad++; } }
    console.log(bad);`;
  const child = spawn(process.execPath, ['-e', reader, file], { stdio: ['ignore', 'pipe', 'inherit'] });
  let out = '';
  child.stdout.on('data', (chunk) => (out += chunk));
  const end = Date.now() + 500;
  while (Date.now() < end) writeStamp(file, stamp);
  await new Promise((resolve) => child.on('close', resolve));
  assert.equal(Number(out), 0);
  assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')), stamp);
  assert.deepEqual(readdirSync(join(dir, 'static')), ['verified.json']);
});
