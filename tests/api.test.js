import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createApi } from '../src/api.js';

function fakeFetch(routes) {
  return async (url) => {
    const path = url.replace(/^.*\/readings/, '/readings');
    if (!(path in routes)) return { ok: false, status: 404, json: async () => ({}) };
    return { ok: true, status: 200, json: async () => routes[path] };
  };
}

test('last() returns the single reading', async () => {
  const api = createApi('http://x/api/v1', fakeFetch({ '/readings/last': { title: 'T', lecturas: [] } }));
  const r = await api.last();
  assert.equal(r.title, 'T');
});

test('byDate() unwraps the paginated envelope to the first reading', async () => {
  const api = createApi('http://x/api/v1', fakeFetch({
    '/readings/date/2026-07-19': { data: [{ title: 'Sunday' }], total: 1 },
  }));
  const r = await api.byDate('2026-07-19');
  assert.equal(r.title, 'Sunday');
});

test('byDate() returns null when there is no reading', async () => {
  const api = createApi('http://x/api/v1', fakeFetch({ '/readings/date/2026-01-01': { data: [] } }));
  assert.equal(await api.byDate('2026-01-01'), null);
});

test('a non-ok response throws', async () => {
  const api = createApi('http://x/api/v1', fakeFetch({}));
  await assert.rejects(() => api.last(), /API 404/);
});
