import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';
import type { CareerSave, Season, SeasonResult } from '../types/database';

export default function CareerPage() {
  const { saveId } = useParams();
  const { t } = useLang();
  const [save, setSave] = useState<CareerSave | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [results, setResults] = useState<SeasonResult[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!saveId) return;
    setLoading(true);
    const [{ data: s }, { data: se }] = await Promise.all([
      supabase.from('career_saves').select('*').eq('id', saveId).single(),
      supabase.from('seasons').select('*').eq('save_id', saveId).order('label', { ascending: true }),
    ]);
    setSave(s);
    setSeasons(se ?? []);
    if (se && se.length) {
      const { data: rs } = await supabase.from('season_results').select('*').in('season_id', se.map((x) => x.id));
      setResults(rs ?? []);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, [saveId]);

  if (loading) return <Loading />;
  if (!save) return null;

  // Aggregate: trophies won by competition
  const trophyMap = new Map<string, number>();
  for (const r of results) {
    if (r.result?.toLowerCase() === 'winner' || r.result?.toLowerCase() === 'w') {
      trophyMap.set(r.competition_name_snapshot, (trophyMap.get(r.competition_name_snapshot) ?? 0) + 1);
    }
  }
  const trophies = [...trophyMap.entries()].sort((a, b) => b[1] - a[1]);
  const totalTrophies = [...trophyMap.values()].reduce((a, b) => a + b, 0);

  return (
    <div>
      <Link to={`/save/${saveId}`} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">{t('back_save')}</Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">{t('career')} · {save.name}</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Seasons" value={seasons.length} />
        <StatCard label="Trophies" value={totalTrophies} />
        <StatCard label="Teams" value={new Set(seasons.map((s) => s.team_name_snapshot)).size} />
      </div>

      {trophies.length > 0 && (
        <div className="mb-6">
          <div className="text-xs uppercase text-slate-500 dark:text-slate-400 mb-2">Trophies by competition</div>
          <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden bg-white dark:bg-slate-900">
            <table className="w-full text-sm">
              <tbody>
                {trophies.map(([comp, n]) => (
                  <tr key={comp} className="border-t border-slate-200 dark:border-slate-800 first:border-t-0">
                    <td className="px-3 py-2">{comp}</td>
                    <td className="px-3 py-2 text-right font-bold text-emerald-600">×{n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <div className="text-xs uppercase text-slate-500 dark:text-slate-400 mb-2">Season by season</div>
        <div className="grid gap-2">
          {seasons.map((s) => (
            <Link
              key={s.id}
              to={`/season/${s.id}`}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-3 flex items-center gap-3 hover:border-emerald-400 transition"
            >
              {s.team_color && (<div className="w-2 h-8 rounded" style={{ background: s.team_color }} />)}
              <div className="flex-1">
                <div className="font-medium">{s.label}</div>
                <div className="text-xs text-slate-500">{s.team_name_snapshot ?? '—'}</div>
              </div>
              <div className="text-xs text-slate-400">{results.filter((r) => r.season_id === s.id && r.result?.toLowerCase().startsWith('winn')).length} 🏆</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
      <div className="text-xs uppercase text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
