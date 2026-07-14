// API base URL. Defaults to the local API stack; override with ?api=<url> or by
// setting localStorage 'dreading_api' (handy for pointing at a deployed API).
const params = new URLSearchParams(location.search);
export const API_BASE =
  params.get('api') || localStorage.getItem('dreading_api') || 'https://dreading-api-worker.honchkrow1995.workers.dev/api/v1';
