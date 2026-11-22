import fallback from '../../shared/portfolio.json';

// Leave VITE_API_URL empty in development (Vite proxies /api). Set it when the API is on another domain.
const BASE = import.meta.env.VITE_API_URL || '';

export const bundled = fallback;

export async function loadPortfolio() {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await fetch(`${BASE}/api/portfolio`, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data?.profile) throw new Error('Unexpected response');
    return { data, source: 'api' };
  } catch {
    return { data: fallback, source: 'bundled' };
  } finally {
    clearTimeout(timer);
  }
}

export async function sendMessage(payload) {
  let res;
  try {
    res = await fetch(`${BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    const err = new Error('The backend is not reachable.');
    err.offline = true;
    throw err;
  }
  let body = null;
  try {
    body = await res.json();
  } catch {
    const err = new Error('The backend is not reachable.');
    err.offline = true;
    throw err;
  }
  if (!res.ok) throw new Error(body?.error || 'Something went wrong. Try again.');
  return body;
}
