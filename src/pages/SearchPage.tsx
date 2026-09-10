import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Loading from '../components/Loading';
import type { CareerSave, Season, SquadPlayer, Rival } from '../types/database';

interface Hit { kind: 'save' | 'season' | 'player' | 'rival'; id: string; title: string; sub: string; to: string; }

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [saves, setSaves] = useState<CareerSave[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [players, setPlayers] = useState<SquadPlayer[]>([]);
  const [rivals, setRivals] = useState<Rival[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    setLoading(true);
    const [sa, se, pl, rv] = await Promise.all([
      supabase.from('career_saves').select('*'),
      supabase.from('seasons').select('*'),
      supabase.from('squad_players').select('*'),
      supabase.from('rivals').select('*'),
    ]);
    setSaves((sa.data ?? []) as CareerSave[]);
    setSeasons((se.data ?? []) as Season[]);
    setPlayers((pl.data ?? []) as SquadPlayer[]);
    setRivals((rv.data ?? []) as Rival[]);
    setLoading(false);
  })(); }, []);

  const hits = useMemo<Hit[]>(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const out: Hit[] = [];
    for (const s of saves) if ((s.name ?? '').toLowerCase().includes(term)) out.push({ kind: 'save', id: s.id, title: s.name, sub: s.game_edition ?? '', to: `/save/${s.id}` });
    for (const s of seasons) if ((s.label ?? '').toLowerCase().includes(term) || (s.team_name_snapshot ?? '').toLowerCase().includes(term)) out.push({ kind: 'season', id: s.id, title: `${s.label} · ${s.team_name_snapshot ?? ''}`, sub: 'Season', to: `/season/${s.id}` });
    for (const p of players) if ((p.name_snapshot ?? '').toLowerCase().includes(term)) out.push({ kind: 'player', id: p.id, title: p.name_snapshot, sub: `${p.position ?? '?'} · OVR ${p.ovr ?? '?'}`, to: `/player/${p.id}` });
    for (const r of rivals) if ((r.rival_team ?? '').toLowerCase().includes(term)) out.push({ kind: 'rival', id: r.id, title: r.rival_team, sub: 'Rival', to: `/save/${r.save_id}/rival/${r.id}` });
    return out.slice(0, 200);
  }, [q, saves, seasons, players, rivals]);

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Search</h1>
      <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search players, seasons, saves, rivals…" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-4 py-3 text-sm mb-4" />
      {q.trim() === '' ? (
        <div className="text-slate-400 text-sm">Type to search across your career data.</div>
      ) : hits.length === 0 ? (
        <div className="text-slate-500">No matches.</div>
      ) : (
        <div className="grid gap-2">{hits.map((h) => (
          <Link key={`${h.kind}-${h.id}`} to={h.to} className="border border-slate-200 dark:border-slate-800 rounded p-3 bg-white dark:bg-slate-900 hover:border-emerald-400 flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">{h.kind}</span>
            <div className="flex-1 min-w-0"><div className="font-medium truncate">{h.title}</div><div className="text-xs text-slate-500">{h.sub}</div></div>
          </Link>
        ))}</div>
      )}
    </div>
  );
}
