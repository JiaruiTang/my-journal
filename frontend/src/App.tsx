import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { apiStore, createDemoStore, isDemo, tokenKey } from './store';
import { categories, categoryLabel, moods, moodLabel, sortEntries, validateEntry, type Entry, type EntryInput } from './types';

function Icon({ name, size = 20 }: { name: 'book' | 'plus' | 'arrow' | 'sprout' | 'close' | 'edit' | 'trash'; size?: number }) {
  const paths = {
    book: <><path d="M5 3h14v18H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M7 3v18M11 8h5M11 12h5"/></>,
    plus: <path d="M12 5v14M5 12h14"/>, arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
    sprout: <><path d="M12 21v-9M12 15C4 15 3 9 3 6c7 0 9 3 9 9ZM12 12c0-7 3-9 9-9 0 6-3 9-9 9Z"/></>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
    edit: <><path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14Z"/></>,
    trash: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
function MoodTag({ entry }: { entry: Entry }) {
  return entry.mood ? <span className={`mood-tag mood-${entry.mood}`}><span aria-hidden="true">{({joyful:'☀', calm:'◌', hopeful:'✧', tired:'☾', sad:'☁'})[entry.mood]}</span>{moodLabel[entry.mood]}</span> : null;
}

function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    return () => { element.close(); };
  }, []);
  return <dialog ref={dialog} className={wide ? 'modal modal-wide' : 'modal'} aria-labelledby="modal-title" onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="modal-heading"><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><Icon name="close" /></button></div>
    {children}
  </dialog>;
}

function Editor({ entry, save, onClose }: { entry?: Entry; save: (input: EntryInput) => Promise<void>; onClose: () => void }) {
  const [input, setInput] = useState<EntryInput>(entry ?? { title: '', content: '', entry_date: today(), mood: null, is_milestone: false, milestone_type: null });
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setBusy(true);
    try { await save(validateEntry(input)); } catch (e) { setError(e instanceof Error ? e.message : 'Your entry could not be saved.'); }
    finally { setBusy(false); }
  }
  return <Modal title={entry ? 'Return to this page' : 'A new page in your story'} onClose={() => { if (!busy) onClose(); }} wide>
    <form onSubmit={submit} className="entry-form">
      <label>Title<input autoFocus required maxLength={160} placeholder="Give this moment a name…" value={input.title} onChange={e => setInput({ ...input, title: e.target.value })} /></label>
      <div className="form-row"><label>Date<input required type="date" value={input.entry_date} onChange={e => setInput({ ...input, entry_date: e.target.value })} /></label>
        <label>Mood <span className="optional">(optional)</span><select value={input.mood ?? ''} onChange={e => setInput({ ...input, mood: (e.target.value || null) as EntryInput['mood'] })}><option value="">Just being</option>{moods.map(mood => <option key={mood} value={mood}>{moodLabel[mood]}</option>)}</select></label></div>
      <label>Your thoughts<textarea required maxLength={20000} rows={8} placeholder="Start anywhere. This page is yours." value={input.content} onChange={e => setInput({ ...input, content: e.target.value })} /></label>
      <div className="milestone-field"><label className="checkbox-label"><input type="checkbox" checked={input.is_milestone} onChange={e => setInput({ ...input, is_milestone: e.target.checked, milestone_type: e.target.checked ? 'reflection' : null })} /><Icon name="sprout"/>Mark as a milestone</label><p>A moment you want to remember on your Growth Timeline.</p>
        {input.is_milestone && <label>Milestone category<select value={input.milestone_type ?? ''} required onChange={e => setInput({ ...input, milestone_type: e.target.value as EntryInput['milestone_type'] })}>{categories.map(category => <option value={category} key={category}>{categoryLabel[category]}</option>)}</select></label>}</div>
      {error && <p role="alert" className="error">{error}</p>}
      <div className="modal-actions"><button type="button" className="secondary" disabled={busy} onClick={onClose}>Cancel</button><button className="primary" disabled={busy}>{busy ? 'Saving…' : 'Save entry'}<Icon name="arrow" size={18}/></button></div>
    </form>
  </Modal>;
}

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]), [view, setView] = useState<'journal' | 'timeline'>('journal');
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [connected, setConnected] = useState(isDemo || !!sessionStorage.getItem(tokenKey));
  const [token, setToken] = useState('');
  const [editor, setEditor] = useState<Entry | 'new' | null>(null), [detail, setDetail] = useState<Entry | null>(null), [deleting, setDeleting] = useState<Entry | null>(null);
  const [busy, setBusy] = useState(false);
  const store = useRef(isDemo ? createDemoStore(localStorage) : apiStore).current;
  async function load() {
    setLoading(true); setError('');
    try { setEntries(await store.list()); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to open your journal.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (connected) void load(); else setLoading(false); }, [connected]);
  useEffect(() => {
    if (!isDemo) return;
    const refresh = (event: StorageEvent) => { if (event.key === 'my-journal-demo-v1') void load(); };
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);
  const milestones = entries.filter(e => e.is_milestone);
  const visible = sortEntries(view === 'timeline' ? milestones : entries, view === 'timeline');
  async function save(input: EntryInput) {
    const saved = editor && editor !== 'new' ? await store.update(editor.id, input) : await store.create(input);
    setEntries(previous => [...previous.filter(e => e.id !== saved.id), saved]);
    setEditor(null); setNotice('Your page is saved.');
  }
  async function remove() {
    if (!deleting) return;
    setBusy(true); setError('');
    try { await store.remove(deleting.id); setEntries(previous => previous.filter(e => e.id !== deleting.id)); setDeleting(null); setNotice('Entry deleted.'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to delete entry.'); }
    finally { setBusy(false); }
  }
  return <div className="app-shell">
    <header className="site-header"><a className="brand" href={import.meta.env.BASE_URL} aria-label="My Journal home"><span className="brand-icon"><Icon name="book" size={25}/></span><span>my journal<span className="brand-dot">.</span></span></a>
      <span className="header-note">a little space, just for you</span><span className="edition">YOUR EVERYDAY NOTEBOOK</span></header>
    <main>
      <section className="intro"><div><div className="eyebrow"><span/>THE BEAUTY IN THE EVERYDAY</div><h1>Every day deserves<br/>a <em>page.</em></h1><p>Ordinary moments. Small victories. New beginnings.<br className="desktop-break"/> A place for everything that makes you, you.</p></div>
        <div className="intro-note" aria-hidden="true"><span className="note-pin"/><Icon name="sprout" size={30}/><p>Every experience<br/>becomes part<br/>of your story.</p><span className="note-flourish">— keep growing</span></div></section>
      <section className="workspace" aria-label="Your notebook">
        <div className="notebook-toolbar"><nav className="view-tabs" aria-label="Notebook views"><button className={view === 'journal' ? 'tab active' : 'tab'} aria-pressed={view === 'journal'} onClick={() => setView('journal')}><Icon name="book"/>Journal<span className="count">{entries.length}</span></button><button className={view === 'timeline' ? 'tab active' : 'tab'} aria-pressed={view === 'timeline'} onClick={() => setView('timeline')}><Icon name="sprout"/>Growth Timeline</button></nav><button className="primary new-entry" onClick={() => { setNotice(''); setEditor('new'); }} disabled={!connected || loading}><Icon name="plus" size={18}/>New entry</button></div>
        <div className={`storage-note ${isDemo ? '' : 'private-note'}`}><span className="storage-dot"/><p>{isDemo ? <><strong>Your own demo notebook.</strong> Fictional samples to get you started. Changes stay in this browser until you clear site data. Please avoid sensitive information.</> : <><strong>Private local notebook.</strong> Entries are saved in PostgreSQL. {connected ? 'Access token stays in this tab’s session.' : 'Connect with your configured access token.'}</>}</p>{!isDemo && connected && <button className="text-button" onClick={() => { sessionStorage.removeItem(tokenKey); setEntries([]); setConnected(false); }}>Disconnect</button>}</div>
        <div className="section-heading"><div><h2>{view === 'journal' ? 'The pages of your life' : 'Look how far you’ve grown'}</h2><p>{view === 'journal' ? 'A collection of moments, one day at a time.' : 'The moments that shaped you, from then to now.'}</p></div><span className="sort-label">{view === 'journal' ? 'NEWEST FIRST' : 'OLDEST FIRST'}<span aria-hidden="true"> ↓</span></span></div>
        <div className="sr-only" role="status">{notice}</div>
        {error && <div className="error page-error" role="alert">{error}<button className="text-button" onClick={() => void load()}>Try again</button></div>}
        {!connected ? <form className="connection-panel" onSubmit={event => { event.preventDefault(); sessionStorage.setItem(tokenKey, token); setToken(''); setConnected(true); }}><Icon name="book" size={34}/><h3>Open your private notebook</h3><p>Enter the API_TOKEN configured for this local application.<br/>See the README for the development token.</p><label>Access token<input required type="password" autoComplete="off" value={token} onChange={e => setToken(e.target.value)} minLength={24}/></label><button className="primary">Connect to journal<Icon name="arrow" size={18}/></button></form>
          : loading ? <p role="status" className="empty-state">Opening your notebook…</p>
          : !error && (visible.length === 0 ? <div className="empty-state"><Icon name={view === 'journal' ? 'book' : 'sprout'} size={35}/><h3>{view === 'journal' ? 'Your story starts here.' : 'Growth takes many shapes.'}</h3><p>{view === 'journal' ? 'A thought, a feeling, a moment. What will your first page hold?' : 'Mark an entry as a milestone to see it here.'}</p><button className="secondary" onClick={() => setEditor('new')}>Write a page<Icon name="plus" size={18}/></button></div>
            : <div className={view === 'journal' ? 'entry-grid' : 'timeline'}>{visible.map((entry, index) => <article className={`entry-card ${view === 'timeline' ? 'timeline-card' : ''}`} key={entry.id} style={{ animationDelay: `${Math.min(index, 6) * 45}ms` }}>
              {view === 'timeline' && <span className="timeline-point" aria-hidden="true"/>}<div className="card-meta"><time dateTime={entry.entry_date}>{formatDate(entry.entry_date)}</time><MoodTag entry={entry}/></div>
              <button className="entry-open" onClick={() => setDetail(entry)} aria-label={`Read ${entry.title}`}><h3>{entry.title}</h3><p className="entry-preview">{entry.content}</p></button>
              <div className="card-footer">{entry.is_milestone && entry.milestone_type ? <span className="milestone-tag"><Icon name="sprout" size={15}/>{categoryLabel[entry.milestone_type]}</span> : <span className="quiet-label">a moment, remembered</span>}<button className="read-arrow" aria-label={`Open ${entry.title}`} onClick={() => setDetail(entry)}><Icon name="arrow" size={18}/></button></div>
            </article>)}</div>)}
      </section>
      <div className="closing-note"><span/>You don’t have to have it all figured out to write it down.<span/></div>
    </main>
    <footer><span>my journal<span className="brand-dot">.</span></span><p>Made for the moments in between.</p><span className="footer-year">A PAGE AT A TIME</span></footer>
    {editor && <Editor entry={editor === 'new' ? undefined : editor} save={save} onClose={() => setEditor(null)}/>}
    {detail && <Modal title={detail.title} onClose={() => setDetail(null)} wide><div className="detail-meta"><time dateTime={detail.entry_date}>{formatDate(detail.entry_date)}</time><MoodTag entry={detail}/></div>{detail.is_milestone && detail.milestone_type && <span className="milestone-tag"><Icon name="sprout" size={16}/>{categoryLabel[detail.milestone_type]}</span>}<div className="detail-content">{detail.content}</div><div className="modal-actions"><button className="danger-quiet" onClick={() => { setDeleting(detail); setDetail(null); setError(''); }}><Icon name="trash" size={17}/>Delete entry</button><button className="secondary" onClick={() => { setEditor(detail); setDetail(null); }}><Icon name="edit" size={17}/>Edit entry</button></div></Modal>}
    {deleting && <Modal title="Let this page go?" onClose={() => { if (!busy) { setDeleting(null); setError(''); } }}><p className="delete-copy">“{deleting.title}” will be permanently deleted from this notebook. This cannot be undone.</p>{error && <p className="error" role="alert">{error}</p>}<div className="modal-actions"><button className="secondary" disabled={busy} onClick={() => { setDeleting(null); setError(''); }}>Keep entry</button><button className="danger" disabled={busy} onClick={() => void remove()}>{busy ? 'Deleting…' : 'Delete permanently'}</button></div></Modal>}
  </div>;
}
