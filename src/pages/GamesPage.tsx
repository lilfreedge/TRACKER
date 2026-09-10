import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import { APP_NAME } from '../lib/changelog';
import { GAME_TYPES, getGameType } from '../lib/gameTypes';
import Loading from '../components/Loading';

interface Game { id: string; name: string; cover_url: string | null; sort_order: number | null; game_type: string | null; }

export default function GamesPage() {
  const { t } = useLang();
  const [games, setGames] = useState<Game[]>([]);
  const [saveCounts, setSaveCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCover, setNewCover] = useState('');
  const [newType, setNewType] = useState<string>('eafc');
  const [err, setErr] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data: gs, error: e1 } = await supabase.from('games').select('*').order('sort_order', { ascending: true }).order('name', { ascending: true });
      if (e1) throw e1;
      setGames((gs ?? []) as Game[]);
      const { data: saves, error: e2 } = await supabase.from('career_saves').select('game_edition');
      if (e2) throw e2;
      const counts: Record<string, number> = {};
      for (const s of saves ?? []) { const k = (s as any).game_edition ?? ''; counts[k] = (counts[k] ?? 0) + 1; }
      setSaveCounts(counts);
    } catch (e: any) { setErr(e.message ?? String(e)); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return games;
    return games.filter((g) => g.name.toLowerCase().includes(term));
  }, [games, q]);

  async function addGame() {
    if (!newName.trim()) return;
    const maxOrder = games.reduce((m, g) => Math.max(m, g.sort_order ?? 0), 0);
    const { error } = await supabase.from('games').insert({ name: newName.trim(), cover_url: newCover.trim() || null, game_type: newType, sort_order: maxOrder + 1 });
    if (error) { alert(error.message); return; }
    setNewName(''); setNewCover(''); setNewType('eafc'); setShowAdd(false); load();
  }

  async function onDrop(targetId: string) {
    const sourceId = dragId.current;
    if (!sourceId || sourceId === targetId) return;
    const src = games.findIndex((g) => g.id === sourceId);
    const tgt = games.findIndex((g) => g.id === targetId);
    if (src < 0 || tgt < 0) return;
    const next = [...games];
    const [moved] = next.splice(src, 1);
    next.splice(tgt, 0, moved);
    setGames(next); dragId.current = null;
    await Promise.all(next.map((g, i) => supabase.from('games').update({ sort_order: i + 1 }).eq('id', g.id)));
  }

  async function deleteGame(g: Game) {
    if ((saveCounts[g.name] ?? 0) > 0) { alert(`Tiene ${saveCounts[g.name]} save(s). Bórralos primero.`); return; }
    if (!confirm(`Borrar ${g.name}?`)) return;
    await supabase.from('games').delete().eq('id', g.id); load();
  }

  if (loading) return <Loading />;

  return (
    <div>
      {/* App logo hero */}
      <div className="flex flex-col items-center text-center mb-8 pt-4">
        <img src="/app-logo.png" alt={APP_NAME} className="w-32 h-32 sm:w-40 sm:h-40" />
        <h1 className="text-3xl sm:text-4xl font-black mt-4 tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">{APP_NAME}</h1>
        <p className="text-slate-500 text-sm mt-2 max-w-md">{t('games_subtitle') ?? 'Pick the game edition you want to work on.'}</p>
      </div>

      {err && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded">{err}</div>}

      <div className="flex gap-2 mb-4 items-center">
        <div className="flex-1 relative">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search_games') ?? 'Search games…'} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm" />
          <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg px-4 py-2.5 text-sm flex items-center gap-2 transition">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          {t('add') ?? 'Add'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-xl p-5 mb-4">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-2">Choose game type</div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mb-4">
            {GAME_TYPES.map((gt) => {
              const active = newType === gt.id;
              return (
                <button key={gt.id} onClick={() => gt.implemented && setNewType(gt.id)} disabled={!gt.implemented}
                  className={`text-left border rounded-lg p-3 transition ${active ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'} ${!gt.implemented ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  <div className={`w-8 h-8 rounded bg-gradient-to-br ${gt.color} mb-2`} />
                  <div className="font-semibold text-sm">{gt.label}{!gt.implemented && <span className="ml-1 text-[10px] font-normal text-slate-400">soon</span>}</div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-tight">{gt.description}</div>
                </button>
              );
            })}
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addGame()} placeholder="Game name (e.g. EAFC 27)" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
            <input value={newCover} onChange={(e) => setNewCover(e.target.value)} placeholder="Cover URL (optional)" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
            <div className="flex gap-2"><button onClick={() => setShowAdd(false)} className="text-sm px-3 py-2 text-slate-500">Cancel</button><button onClick={addGame} className="bg-emerald-600 text-white rounded px-4 py-2 text-sm">Save</button></div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center bg-white dark:bg-slate-900">
          {q ? 'No matches.' : 'No games yet. Click + Add to create one.'}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => {
            const gt = getGameType(g.game_type);
            return (
              <div key={g.id}
                draggable
                onDragStart={() => { dragId.current = g.id; }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(g.id)}
                className="group relative rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition cursor-move shadow-sm hover:shadow-lg">
                <Link to={`/game/${encodeURIComponent(g.name)}`} className="block">
                  <div className={`aspect-[3/4] relative overflow-hidden bg-gradient-to-br ${gt.color}`}>
                    {g.cover_url ? (
                      <img src={g.cover_url} alt={g.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl font-black text-white/25 tracking-tighter">{g.name.slice(0, 4).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 text-[10px] uppercase font-bold text-white/90 bg-black/40 rounded px-2 py-0.5 backdrop-blur">{gt.label}</div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
                      <div className="text-white font-bold text-lg drop-shadow">{g.name}</div>
                      <div className="text-white/70 text-xs mt-0.5">{saveCounts[g.name] ?? 0} {t('saves') ?? 'saves'}</div>
                    </div>
                  </div>
                </Link>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteGame(g); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-lg">×</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
