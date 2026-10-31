/**
 * The real server behind the contract in docs/openapi.yaml. Chosen when VITE_API_URL is set
 * at build time. Every call turns a failed request into an ApiError the pages can show.
 */
import type { ApiClient } from './client';
import { ApiError } from './types';

export function httpClient(baseUrl: string): ApiClient {
  const base = baseUrl.replace(/\/$/, '');

  async function call<T>(method: 'GET' | 'POST' | 'PATCH', path: string, body?: unknown): Promise<T> {
    let res: Response;
    try {
      res = await fetch(base + path, {
        method,
        headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new ApiError('network', 'Нет связи с сервером');
    }
    if (res.status === 404) throw new ApiError('not-found', 'Не найдено', 404);
    if (res.status >= 400 && res.status < 500) throw new ApiError('bad-request', 'Запрос не принят', res.status);
    if (!res.ok) throw new ApiError('server', 'Ошибка на сервере', res.status);
    return (await res.json()) as T;
  }
  const q = (params: Record<string, string | number | boolean>) =>
    '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();

  return {
    getPopularSanatoriums: () => call('GET', '/sanatoriums/popular'),
    searchSanatoriums: (query) => call('GET', '/sanatoriums' + q({ ...query })),
    getSanatorium: (id) => call('GET', '/sanatoriums/' + encodeURIComponent(id)),
    getRoomPrograms: (hotelId, roomId) =>
      call('GET', `/sanatoriums/${encodeURIComponent(hotelId)}/rooms/${encodeURIComponent(roomId)}/programs`),
    getTransferOptions: () => call('GET', '/transfer/options'),
    getAvailability: (hotelId, from, to) =>
      call('GET', `/sanatoriums/${encodeURIComponent(hotelId)}/availability` + q({ from, to })),
    getFlightDays: (from, to) => call('GET', '/flights/days' + q({ from, to })),
    quote: (req) => call('POST', '/quotes', req),
    createDraft: (booking, step) => call('POST', '/drafts', { booking, step }),
    getDraft: (code) => call('GET', '/drafts/' + encodeURIComponent(code)),
    saveDraft: (code, patch) => call('PATCH', '/drafts/' + encodeURIComponent(code), patch),
  };
}
