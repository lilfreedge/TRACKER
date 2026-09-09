import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, OWNER_EMAIL } from '../lib/supabase';
import Loading from '../components/Loading';

interface PlayerHit { id: string; name: string; team: string | null; season_label: string; season_id: string; ovr: number | null; }
interface SeasonHit { id: string; label: string; team: string | null; save_id: string; }
interface SaveHit   { id: string; name: string; game_edition: string; }
interface RivalHit  { id: string; team: string; save_id: string; }

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<PlayerHit[]>([]);
  const [seasons, setSeasons] = useState<SeasonHit[]>([]);
  const [saves, setSaves] = useState<SaveHit[]>([]);
  const [rivals, setRivals] = useState<RivalHit[]>([]);

  async function run(query: string) {
    const term = query.trim();
    if (!term) { setPlayers([]); setSeasons([]); setSaves([]); setRivals([]); return; }
    setLoading(true);
    const like = `%${term}%`;
    const [ps, ses, svs, rvs] = await Promise.all([
      supabase.from('squad_players').select('id, name_snapshot, ovr, season_id, seasons(label, team_name_snapshot, save_id)').ilike('name_snapshot', like).limit(30),
      supabase.from('seasons').select('id, label, team_name_snapshot, save_id').or(`label.ilike.${like},team_name_snapshot.ilike.${like}`).limit(15),
      supabase.from('career_saves').select('*').ilike('name', like).eq('owner_email', OWNER_EMAIL).limit(15),
      supabase.from('rivals').select('*').ilike('rival_team', like).limit(15),
    ]);
    setPlayers((ps.data ?? []).map((r: any) => ({
      id: r.id, name: r.name_snapshot, ovr: r.ovr,
      team: r.seasons?.team_name_snapshot ?? null,
      season_label: r.seasons?.label ?? '?',
      season_id: r.season_id,
    })));
    setSeasons((ses.data ?? []).map((r: any) => ({ id: r.id, label: r.label, team: r.team_name_snapshot, save_id: r.save_id })));
    setSaves((svs.data ?? []).map((r: any) => ({ id: r.id, name: r.name, game_edition: r.game_edition })));
    setRivals((rvs.data ?? []).map((r: any) => ({ id: r.id, team: r.rival_team, save_id: r.save_id })));
    setLoading(false);
  }

  useEffect(() => {
    const h = setTimeout(() => run(q), 250);
    return () => clearTimeout(h);
  }, [q]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Search</h1>
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Type a player, team, save, rival…"
        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm mb-6"
      />

      {loading && <Loading />}

      {!loading && !q && <div className="text-slate-400 text-sm">Type at least one character.</div>}

      {!loading && q && (
        <div className="space-y-6">
          {players.length > 0 && (
            <Section title={`Players (${players.length})`}>
              {players.map((p) => (
                <Link key={p.id} to={`/player/${p.id}`} className="block px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                  <div className="font-medium">{p.name} <span className="text-slate-400 text-xs">OVR {p.ovr ?? '?'}</span></div>
                  <div className="text-xs text-slate-500">{p.team ?? '?'} · {p.season_label}</div>
                </Link>
              ))}
            </Section>
          )}
          {seasons.length > 0 && (
            <Section title={`Seasons (${seasons.length})`}>
              {seasons.map((s) => (
                <Link key={s.id} to={`/season/${s.id}`} className="block px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                  <div className="font-medium">{s.label}</div>
                  <div className="text-xs text-slate-500">{s.team ?? '—'}</div>
                </Link>
              ))}
            </Section>
          )}
          {saves.length > 0 && (
            <Section title={`Saves (${saves.length})`}>
              {saves.map((s) => (
                <Link key={s.id} to={`/save/${s.id}`} className="block px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.game_edition}</div>
                </Link>
              ))}
            </Section>
          )}
          {rivals.length > 0 && (
            <Section title={`Rivals (${rivals.length})`}>
              {rivals.map((r) => (
                <Link key={r.id} to={`/save/${r.save_id}/rivals/${r.id}`} className="block px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                  <div className="font-medium">{r.team}</div>
                </Link>
              ))}
            </Section>
          )}
          {!players.length && !seasons.length && !saves.length && !rivals.length && (
            <div className="text-slate-400 text-sm">No results.</div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: any }) {
  return (
    <div>
      <div className="text-xs uppercase text-slate-500 dark:text-slate-400 mb-2">{title}</div>
      <div className="border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
        {children}
      </div>
    </div>
  );
}
