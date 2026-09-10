import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';

interface Save { id: string; name: string; game_edition: string | null; cover_url: string | null; sort_order: number | null; created_at: string; }

const COLORS = ['from-emerald-500 to-teal-700', 'from-blue-500 to-indigo-700', 'from-rose-500 to-red-700', 'from-amber-500 to-orange-700', 'from-purple-500 to-fuchsia-700', 'from-cyan-500 to-blue-700', 'from-lime-500 to-emerald-700'];

export default function SavesPage() {
  const { gameName } = useParams();
  const { t } = useLang();
  const [rows, setRows] = useState<Save[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCover, setNewCover] = useState('');
  const dragId = useRef<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const game = decodeURIComponent(gameName ?? '');
      const { data, error } = await supabase.from('career_saves').select('*').eq('game_edition', game).order('sort_order', { ascending: true }).order('created_at', { ascending: false });
      if (error) throw error;
      setRows((data ?? []) as Save[]);
    } catch (e: any) { setErr(e.message ?? String(e)); }
    setLoading(false);
  }
  useEffect(() => { load(); }, [gameName]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(term));
  }, [rows, q]);

  async function addSave() {
    if (!newName.trim()) return;
    const game = decodeURIComponent(gameName ?? '');
    const maxOrder = rows.reduce((m, s) => Math.max(m, s.sort_order ?? 0), 0);
    const { error } = await supabase.from('career_saves').insert({ name: newName.trim(), game_edition: game, cover_url: newCover.trim() || null, sort_order: maxOrder + 1 });
    if (error) { alert(error.message); return; }
    setNewName(''); setNewCover(''); setShowAdd(false); load();
  }

  async function onDrop(targetId: string) {
    const sourceId = dragId.current;
    if (!sourceId || sourceId === targetId) return;
    const src = rows.findIndex((s) => s.id === sourceId);
    const tgt = rows.findIndex((s) => s.id === targetId);
    if (src < 0 || tgt < 0) return;
    const next = [...rows];
    const [moved] = next.splice(src, 1);
    next.splice(tgt, 0, moved);
    setRows(next);
    dragId.current = null;
    await Promise.all(next.map((s, i) => supabase.from('career_saves').update({ sort_order: i + 1 }).eq('id', s.id)));
  }

  async function del(s: Save) {
    if (!confirm(`Delete "${s.name}" and ALL its seasons?`)) return;
    await supabase.from('career_saves').delete().eq('id', s.id); load();
  }

  if (loading) return <Loading />;
  const game = decodeURIComponent(gameName ?? '');

  return (
    <div>
      <Link to="/" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">← {t('games')}</Link>
      <div className="mt-2 mb-6">
        <h1 className="text-3xl font-bold">{game}</h1>
        <p className="text-slate-500 text-sm mt-1">{t('saves_subtitle') ?? 'Pick a career save or start a new one.'}</p>
      </div>
      {err && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded">{err}</div>}
      <div className="flex gap-2 mb-4 items-center">
        <div className="flex-1 relative">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search_saves') ?? 'Search saves…'} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm" />
          <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg px-4 py-2.5 text-sm flex items-center gap-2 transition">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          {t('add')}
        </button>
      </div>
      {showAdd && (
        <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg p-4 mb-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSave()} placeholder="Save name (e.g. Depor journey)" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input value={newCover} onChange={(e) => setNewCover(e.target.value)} placeholder="Cover URL (optional)" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <div className="flex gap-2"><button onClick={() => setShowAdd(false)} className="text-sm px-3 py-2 text-slate-500">Cancel</button><button onClick={addSave} className="bg-emerald-600 text-white rounded px-4 py-2 text-sm">Save</button></div>
        </div>
      )}
      {filtered.length === 0 ? (
        <div className="text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center bg-white dark:bg-slate-900">
          {q ? 'No matches.' : 'No saves yet. Click + Add to create one.'}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s, idx) => {
            const grad = COLORS[Math.abs(s.name.charCodeAt(0)) % COLORS.length];
            return (
              <div key={s.id}
                draggable
                onDragStart={() => { dragId.current = s.id; }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(s.id)}
                className="group relative rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition cursor-move shadow-sm hover:shadow-lg">
                <Link to={`/save/${s.id}`} className="block">
                  <div className={`aspect-[3/4] relative overflow-hidden bg-gradient-to-br ${grad}`}>
                    {s.cover_url ? (
                      <img src={s.cover_url} alt={s.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-7xl font-black text-white/25 tracking-tighter">{s.name.slice(0, 3).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 text-white/70 text-xs font-mono bg-black/30 rounded px-2 py-0.5">#{idx + 1}</div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
                      <div className="text-white font-bold text-lg drop-shadow line-clamp-2">{s.name}</div>
                      <div className="text-white/70 text-xs mt-0.5">{new Date(s.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </Link>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); del(s); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-lg">×</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
