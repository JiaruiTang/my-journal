import { beforeEach, describe, expect, it } from 'vitest';
import { createDemoStore, demoKey } from './store';
import { sortEntries, validateEntry, type EntryInput } from './types';

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value); }, removeItem: key => { data.delete(key); }, clear: () => data.clear(), key: i => [...data.keys()][i] ?? null, get length() { return data.size; } };
}
const input: EntryInput = { title: 'Test page', content: 'A fictional moment.', entry_date: '2026-10-26', mood: 'calm', is_milestone: false, milestone_type: null };

describe('entry contracts', () => {
  it.each([
    {title: ' '}, {title: 'a'.repeat(161)}, {content: ''}, {content: 'a'.repeat(20001)},
    {entry_date: '2026-02-30'}, {entry_date: ''}, {mood: 'unknown'},
    {is_milestone: true}, {milestone_type: 'reflection'},
  ])('rejects invalid input %j', patch => {
    expect(() => validateEntry({ ...input, ...patch } as EntryInput)).toThrow();
  });
  it('accepts leap days, trims text, and allows no mood', () => {
    expect(validateEntry({ ...input, title: '  Hello ', mood: null, entry_date: '2024-02-29' }).title).toBe('Hello');
  });
  it('strips response metadata before sending editable fields back to the API', () => {
    const response = { ...input, id: 'some-id', created_at: '2026-10-26T12:00:00Z', updated_at: '2026-10-26T12:00:00Z' };
    expect(validateEntry(response)).toEqual(input);
  });
});

describe('isolated demo storage', () => {
  let storage: Storage;
  beforeEach(() => { storage = memoryStorage(); });
  it('CRUD persists across adapter instances and does not resurrect deleted samples', async () => {
    const store = createDemoStore(storage);
    expect(await store.list()).toHaveLength(3);
    const created = await store.create(input);
    const refreshed = createDemoStore(storage);
    expect(await refreshed.list()).toHaveLength(4);
    await refreshed.update(created.id, { ...input, title: 'Edited', is_milestone: true, milestone_type: 'achievement' });
    expect((await store.list()).find(e => e.id === created.id)?.is_milestone).toBe(true);
    for (const entry of await store.list()) await store.remove(entry.id);
    expect(await createDemoStore(storage).list()).toEqual([]);
  });
  it('does not share entries between browser storage contexts', async () => {
    const first = createDemoStore(storage), second = createDemoStore(memoryStorage());
    await first.create(input);
    expect(await first.list()).toHaveLength(4);
    expect(await second.list()).toHaveLength(3);
  });
  it('shows corruption and quota failures without claiming a save', async () => {
    storage.setItem(demoKey, '{bad');
    await expect(createDemoStore(storage).list()).rejects.toThrow('could not be read');
    storage.clear();
    await createDemoStore(storage).list();
    storage.setItem = () => { throw new Error('quota'); };
    await expect(createDemoStore(storage).create(input)).rejects.toThrow('not saved');
  });
  it('sorts gallery descending and timeline ascending without mutating records', async () => {
    const entries = await createDemoStore(storage).list();
    expect(sortEntries(entries).map(e => e.entry_date)).toEqual(['2026-10-24', '2026-10-22', '2026-10-19']);
    expect(sortEntries(entries, true).map(e => e.entry_date)).toEqual(['2026-10-19', '2026-10-22', '2026-10-24']);
    expect(entries[0].entry_date).toBe('2026-10-24');
  });
});
