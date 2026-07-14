// Thin client for the dreading-api reading endpoints. `fetchFn` is injectable so
// it can be unit-tested without a network.

export function createApi(baseUrl, fetchFn = fetch) {
  const base = baseUrl.replace(/\/$/, '');

  async function getJson(path) {
    const res = await fetchFn(`${base}${path}`);
    if (!res.ok) {
      throw new Error(`API ${res.status} for ${path}`);
    }
    return res.json();
  }

  return {
    // Most recent reading (single object).
    last() {
      return getJson('/readings/last');
    },
    // Readings for a date (paginated envelope) → first reading or null.
    async byDate(iso) {
      const page = await getJson(`/readings/date/${iso}`);
      const items = (page && page.data) || [];
      return items[0] || null;
    },
  };
}
