import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';
import type { Season, SeasonResult, SquadPlayer } from '../types/database';

export default function DashboardPage() {
  const { saveId } = useParams();
  const { t } = useLang();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [results, setResults] = useState<SeasonResult[]>([]);
  const [players, setPlayers] = useState<SquadPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!saveId) return;
    setLoading(true);
    const { data: ss } = await supabase.from('seasons').select('*').eq('save_id', saveId);
    setSeasons((ss ?? []) as Season[]);
    if (ss && ss.length) {
      const ids = ss.map((s) => s.id);
      const [{ data: rs }, { data: ps }] = await Promise.all([
        supabase.from('season_results').select('*').in('season_id', ids),
        supabase.from('squad_players').select('*').in('season_id', ids),
      ]);
      setResults((rs ?? []) as SeasonResult[]);
      setPlayers((ps ?? []) as SquadPlayer[]);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, [saveId]);

  if (loading) return <Loading />;

  const teams = new Set(seasons.map((s) => s.team_name_snapshot).filter(Boolean));
  const trophies = results.filter((r) => (r.result ?? '').toLowerCase().startsWith('winn') || (r.result ?? '').toLowerCase() === 'w').length;
  const runners  = results.filter((r) => (r.result ?? '').toLowerCase().includes('runner') || (r.result ?? '').toLowerCase().includes('2nd')).length;
  const ovrs = players.map((p) => p.ovr).filter((n) => typeof n === 'number') as number[];
  const avgOvr = ovrs.length ? (ovrs.reduce((a, b) => a + b, 0) / ovrs.length).toFixed(1) : '—';
  const topByOvr = [...players]
    .filter((p) => p.ovr != null)
    .sort((a, b) => (b.ovr ?? 0) - (a.ovr ?? 0))
    .slice(0, 8);

  return (
    <div>
      <Link to={`/save/${saveId}`} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">{t('back_save')}</Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">{t('dashboard')}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Seasons" value={seasons.length} />
        <StatCard label="Clubs managed" value={teams.size} />
        <StatCard label="Trophies" value={trophies} accent="emerald" />
        <StatCard label="Runners-up" value={runners} accent="amber" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
          <div className="text-xs uppercase text-slate-500 dark:text-slate-400 mb-2">Squad</div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between"><span>Players tracked</span><span className="font-medium">{players.length}</span></div>
            <div className="flex justify-between"><span>Avg OVR</span><span className="font-medium">{avgOvr}</span></div>
          </div>
        </div>
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
          <div className="text-xs uppercase text-slate-500 dark:text-slate-400 mb-2">Career length</div>
          <div className="text-sm">
            {seasons.length} seasons across {teams.size} club{teams.size === 1 ? '' : 's'}.
          </div>
        </div>
      </div>

      <div>
        <div className="text-xs uppercase text-slate-500 dark:text-slate-400 mb-2">Top 8 by OVR</div>
        <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden bg-white dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase">
              <tr>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Pos</th>
                <th className="text-right px-3 py-2">OVR</th>
              </tr>
            </thead>
            <tbody>
              {topByOvr.length === 0 ? (
                <tr><td colSpan={3} className="text-center text-slate-400 py-4">—</td></tr>
              ) : topByOvr.map((p) => (
                <tr key={p.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-3 py-2">
                    <Link to={`/player/${p.id}`} className="hover:underline">{p.name_snapshot}</Link>
                  </td>
                  <td className="px-3 py-2 font-mono">{p.position ?? '?'}</td>
                  <td className="px-3 py-2 text-right font-semibold">{p.ovr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: 'emerald' | 'amber' | 'red' }) {
  const color = accent === 'emerald' ? 'text-emerald-600' : accent === 'amber' ? 'text-amber-600' : accent === 'red' ? 'text-red-600' : '';
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
      <div className="text-xs uppercase text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`text-3xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}
