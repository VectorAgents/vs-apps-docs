import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { unstable_startWorker } from 'wrangler';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const text = (value) => ({ type: 'plain_text', value });

const workers = [];
const start = async (bindings) => {
  const worker = await unstable_startWorker({
    config: join(root, 'wrangler.jsonc'),
    bindings,
    dev: { server: { port: 0 }, inspector: false, logLevel: 'none' },
  });
  workers.push(worker);
  const { origin } = await worker.url;
  return (path, login) =>
    fetch(origin + path, {
      redirect: 'manual',
      headers: login ? { Authorization: `Basic ${Buffer.from(login).toString('base64')}` } : {},
    });
};
after(() => Promise.all(workers.map((worker) => worker.dispose())));

// A non-Latin-1 character covers the UTF-8 encoding the challenge asks the browser for.
const get = await start({ BASIC_AUTH_USER: text('reader'), BASIC_AUTH_PASSWORD: text('pässword') });

test('a request with no login gets the Basic challenge and no page', async () => {
  const response = await get('/');
  assert.equal(response.status, 401);
  assert.match(response.headers.get('WWW-Authenticate'), /^Basic realm=/);
  assert.doesNotMatch(await response.text(), /<html/);
});

test('a wrong password, a wrong user and the empty login are refused', async () => {
  for (const login of ['reader:wrong', 'wrong:pässword', ':', 'undefined:undefined']) {
    assert.equal((await get('/', login)).status, 401, login);
  }
});

test('a missing page answers 401 without a login, so the challenge does not show which pages exist', async () => {
  assert.equal((await get('/no-such-page')).status, 401);
});

test('the right login gets the home page, an asset and the 404 page', async () => {
  const home = await get('/', 'reader:pässword');
  assert.equal(home.status, 200);
  const page = await home.text();
  assert.match(page, /<html/);
  const [, asset] = page.match(/<script[^>]* src="(\/assets\/[^"]+)"/);
  assert.equal((await get(asset, 'reader:pässword')).status, 200);
  const missing = await get('/no-such-page', 'reader:pässword');
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /Page Not Found/);
});

test('a Worker with no secrets set refuses every login', async () => {
  const bare = await start({});
  assert.equal((await bare('/')).status, 500);
  assert.equal((await bare('/', 'undefined:undefined')).status, 500);
});
