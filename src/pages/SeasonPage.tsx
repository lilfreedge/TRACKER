import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Season, SquadPlayer, SquadRole } from '../types/database';

const ROLE_LABELS: Record<SquadRole, string> = {
  starting: '11 Titular',
  bench: 'Bench',
  reserve: 'Reserve',
  loaned: 'Cedidos',
};

export default function SeasonPage() {
  const { seasonId } = useParams();
  const [season, setSeason] = useState<Season | null>(null);
  const [players, setPlayers] = useState<SquadPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!seasonId) return;
    setLoading(true);
    const [{ data: se }, { data: pl }] = await Promise.all([
      supabase.from('seasons').select('*').eq('id', seasonId).single(),
      supabase.from('squad_players').select('*').eq('season_id', seasonId).order('formation_slot', { ascending: true, nullsFirst: false }),
    ]);
    setSeason(se);
    setPlayers(pl ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [seasonId]);

  if (loading) return <div className="text-slate-400">Cargando...</div>;
  if (!season) return <div className="text-slate-400">Temporada no encontrada.</div>;

  const grouped: Record<SquadRole, SquadPlayer[]> = {
    starting: [],
    bench: [],
    reserve: [],
    loaned: [],
  };
  for (const p of players) grouped[p.role].push(p);

  return (
    <div>
      <Link to={`/save/${season.save_id}`} className="text-slate-500 hover:text-slate-300 text-sm">← Save</Link>
      <div
        className="mt-3 rounded-lg p-5 mb-6"
        style={{
          background: season.team_color || '#1e293b',
          color: season.team_text_color || '#fff',
        }}
      >
        <div className="text-sm opacity-80">{season.label}</div>
        <div className="text-2xl font-bold mt-1">{season.team_name_snapshot}</div>
        <div className="text-sm opacity-80 mt-1">
          {season.formation} {season.start_date ? `· desde ${season.start_date}` : ''}
        </div>
      </div>

      {(Object.keys(ROLE_LABELS) as SquadRole[]).map((role) => (
        <div key={role} className="mb-6">
          <div className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">
            {ROLE_LABELS[role]} <span className="text-slate-600">({grouped[role].length})</span>
          </div>
          <div className="border border-slate-800 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-3 py-2 w-10">#</th>
                  <th className="text-left px-3 py-2 w-16">Pos</th>
                  <th className="text-left px-3 py-2">Nombre</th>
                  <th className="text-right px-3 py-2 w-14">Edad</th>
                  <th className="text-right px-3 py-2 w-14">OVR</th>
                  <th className="text-left px-3 py-2 w-32">Nacionalidad</th>
                  <th className="text-right px-3 py-2 w-16">Desde</th>
                </tr>
              </thead>
              <tbody>
                {grouped[role].length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-slate-600 py-6">Sin jugadores.</td>
                  </tr>
                ) : grouped[role].map((p) => (
                  <tr key={p.id} className="border-t border-slate-800 hover:bg-slate-900/40">
                    <td className="px-3 py-2 text-slate-400">{p.jersey ?? '?'}</td>
                    <td className="px-3 py-2 font-mono">{p.position ?? '?'}</td>
                    <td className="px-3 py-2 flex items-center gap-2">
                      {p.photo_url && (
                        <img src={p.photo_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                      )}
                      <span>{p.name_snapshot}</span>
                    </td>
                    <td className="px-3 py-2 text-right">{p.age ?? '?'}</td>
                    <td className="px-3 py-2 text-right font-semibold">{p.ovr ?? '?'}</td>
                    <td className="px-3 py-2">{p.nationality_snapshot ?? '?'}</td>
                    <td className="px-3 py-2 text-right text-slate-400">{p.since_year ?? '?'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
