import type { ActionRecord, RawCapture, Settings, Signal, Status } from './types';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000').replace(/\/$/, '');

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    next: { revalidate: 0 },
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export const getStatus = () => fetchJson<Status>('/status');
export const getSignals = (limit = 100) => fetchJson<Signal[]>(`/signals?limit=${limit}`);
export const getActions = (limit = 100) => fetchJson<ActionRecord[]>(`/actions?limit=${limit}`);
export const getRaw = (limit = 100) => fetchJson<RawCapture[]>(`/raw?limit=${limit}`);
export const getSettings = () => fetchJson<Settings>('/settings');

export const postBotStart = () => fetchJson<void>('/bot/start', { method: 'POST' });
export const postBotStop = () => fetchJson<void>('/bot/stop', { method: 'POST' });
export const postRunOnce = () => fetchJson<void>('/bot/run-once', { method: 'POST' });

export const updateDryRun = (dry_run: boolean) =>
  fetchJson<Settings>('/settings', { method: 'POST', body: JSON.stringify({ dry_run }) });

export const saveSettings = (settings: Settings) =>
  fetchJson<Settings>('/settings', { method: 'POST', body: JSON.stringify(settings) });
