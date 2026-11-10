import { existsSync, mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Writes an empty stamp when none exists, so the stamp import resolves before `check:snippets` has run. */
export function ensureStamp(stampFile = join(root, 'static', 'verified.json')) {
  if (existsSync(stampFile)) return false;
  writeStamp(stampFile, { package: '', verifiedAt: '', snippets: 0 });
  return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) ensureStamp();

/** Replaces the stamp in one rename: the dev server reads `static/verified.json` while it rewrites, and a plain write shows it an empty file. */
export function writeStamp(stampFile, stamp) {
  const dir = dirname(stampFile);
  const temp = join(dir, `.${basename(stampFile)}.${process.pid}.tmp`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(temp, `${JSON.stringify(stamp, null, 2)}\n`);
  renameSync(temp, stampFile);
}
