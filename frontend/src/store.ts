import { type Entry, type EntryInput, type EntryStore, validateEntry } from './types';

export const demoKey = 'my-journal-demo-v1';
export const tokenKey = 'my-journal-access-token';
export const isDemo = import.meta.env.VITE_STORAGE_MODE !== 'api';

export function sampleEntries(): Entry[] {
  return [
    { id: 'sample-1', title: 'A little room to begin', content: 'I put my phone away and took the long way home. The afternoon light made even the familiar streets feel new.\n\nA reminder that a good day does not have to be a remarkable one.', entry_date: '2026-10-24', mood: 'calm', is_milestone: false, milestone_type: null, created_at: '2026-10-24T17:00:00Z', updated_at: '2026-10-24T17:00:00Z' },
    { id: 'sample-2', title: 'Brave enough to try', content: 'Today I shared an idea I had been keeping to myself. It was not perfectly formed, and that turned out to be okay.\n\nTaking the first small step felt like its own kind of achievement.', entry_date: '2026-10-22', mood: 'hopeful', is_milestone: true, milestone_type: 'achievement', created_at: '2026-10-22T17:00:00Z', updated_at: '2026-10-22T17:00:00Z' },
    { id: 'sample-3', title: 'Finding a different rhythm', content: 'My plans changed, so I made tea and started again. I am learning to leave a little space for the unexpected.\n\nProgress can look quieter than I imagined.', entry_date: '2026-10-19', mood: 'tired', is_milestone: true, milestone_type: 'reflection', created_at: '2026-10-19T17:00:00Z', updated_at: '2026-10-19T17:00:00Z' },
  ];
}

export function createDemoStore(storage: Storage): EntryStore {
  function read(): Entry[] {
    const value = storage.getItem(demoKey);
    if (value === null) {
      const samples = sampleEntries();
      write(samples);
      return samples;
    }
    try {
      const entries: unknown = JSON.parse(value);
      if (!Array.isArray(entries)) throw new Error();
      for (const entry of entries) {
        validateEntry(entry);
        if (typeof entry.id !== 'string' || typeof entry.created_at !== 'string' || typeof entry.updated_at !== 'string') throw new Error();
      }
      return entries;
    } catch {
      throw new Error('Your saved demo data could not be read. Clear this site’s browser storage to start again.');
    }
  }
  function write(entries: Entry[]) {
    try { storage.setItem(demoKey, JSON.stringify(entries)); }
    catch { throw new Error('Browser storage is unavailable or full. Your changes were not saved.'); }
  }
  return {
    async list() { return read(); },
    async create(input) {
      const valid = validateEntry(input), now = new Date().toISOString();
      const entry = { ...valid, id: crypto.randomUUID(), created_at: now, updated_at: now };
      write([...read(), entry]);
      return entry;
    },
    async update(id, input) {
      const valid = validateEntry(input), entries = read();
      const previous = entries.find(e => e.id === id);
      if (!previous) throw new Error('Entry not found. Refresh your journal.');
      const entry = { ...previous, ...valid, updated_at: new Date().toISOString() };
      write(entries.map(e => e.id === id ? entry : e));
      return entry;
    },
    async remove(id) {
      const entries = read();
      if (!entries.some(e => e.id === id)) throw new Error('Entry not found. Refresh your journal.');
      write(entries.filter(e => e.id !== id));
    },
  };
}

async function request(path: string, method = 'GET', body?: EntryInput) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`/api/entries${path}`, {
      method, signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionStorage.getItem(tokenKey) ?? ''}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error('Access token was rejected. Disconnect and enter the configured token.');
      const result = await response.json().catch(() => null);
      throw new Error(result?.error?.message ?? 'The journal could not be reached. Please try again.');
    }
    return response.status === 204 ? undefined : response.json();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw new Error('The journal took too long to respond. Please try again.');
    throw error;
  } finally { clearTimeout(timeout); }
}
export const apiStore: EntryStore = {
  list: () => request(''),
  create: input => request('', 'POST', validateEntry(input)),
  update: (id, input) => request(`/${encodeURIComponent(id)}`, 'PATCH', validateEntry(input)),
  remove: id => request(`/${encodeURIComponent(id)}`, 'DELETE'),
};
