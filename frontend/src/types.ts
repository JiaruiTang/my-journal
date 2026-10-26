export const moods = ['joyful', 'calm', 'hopeful', 'tired', 'sad'] as const;
export const categories = ['achievement', 'challenge', 'turning_point', 'reflection'] as const;
export type Mood = typeof moods[number];
export type Category = typeof categories[number];
export const categoryLabel: Record<Category, string> = {
  achievement: 'Achievement', challenge: 'Challenge / Failure',
  turning_point: 'Turning Point', reflection: 'Reflection',
};
export const moodLabel: Record<Mood, string> = { joyful: 'Joyful', calm: 'Calm', hopeful: 'Hopeful', tired: 'Tired', sad: 'Sad' };
export type EntryInput = {
  title: string; content: string; entry_date: string; mood: Mood | null;
  is_milestone: boolean; milestone_type: Category | null;
};
export type Entry = EntryInput & { id: string; created_at: string; updated_at: string };
export interface EntryStore {
  list(): Promise<Entry[]>;
  create(input: EntryInput): Promise<Entry>;
  update(id: string, input: EntryInput): Promise<Entry>;
  remove(id: string): Promise<void>;
}
export function validateEntry(input: EntryInput): EntryInput {
  if (typeof input.title !== 'string' || typeof input.content !== 'string' || typeof input.is_milestone !== 'boolean') throw new Error('Check your entry fields.');
  const title = input.title.trim(), content = input.content.trim();
  if (!title || title.length > 160) throw new Error('Give your entry a title of 1–160 characters.');
  if (!content || content.length > 20000) throw new Error('Write between 1 and 20,000 characters.');
  const parsed = new Date(`${input.entry_date}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.entry_date) || Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== input.entry_date)
    throw new Error('Choose a valid date.');
  if (input.mood !== null && !moods.includes(input.mood)) throw new Error('Choose a valid mood.');
  if (input.is_milestone && (!input.milestone_type || !categories.includes(input.milestone_type))) throw new Error('Choose a milestone category.');
  if (!input.is_milestone && input.milestone_type !== null) throw new Error('Only milestones can have a category.');
  // Read responses include metadata; write requests must contain only editable fields.
  return { title, content, entry_date: input.entry_date, mood: input.mood,
    is_milestone: input.is_milestone, milestone_type: input.milestone_type };
}
export function sortEntries(entries: Entry[], timeline = false) {
  return [...entries].sort((a, b) => {
    const order = a.entry_date.localeCompare(b.entry_date) || a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id);
    return timeline ? order : -order;
  });
}
