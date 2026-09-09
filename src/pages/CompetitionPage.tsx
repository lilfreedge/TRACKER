import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';
import type { CompetitionChampion } from '../types/database';

export default function CompetitionPage() {
  const { saveId } = useParams();
  const { t } = useLang();
  const [rows, setRows] = useState<CompetitionChampion[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!saveId) return;
    setLoading(true);
    const { data } = await supabase
      .from('competition_champions')
      .select('*')
      .eq('save_id', saveId)
      .order('competition_name', { ascending: true })
      .order('wins', { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [saveId]);

  if (loading) return <Loading />;

  const grouped = new Map<string, CompetitionChampion[]>();
  for (const r of rows) {
    if (!grouped.has(r.competition_name)) grouped.set(r.competition_name, []);
    grouped.get(r.competition_name)!.push(r);
  }

  return (
    <div>
      <Link to={`/save/${saveId}`} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">{t('back_save')}</Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">{t('competition')}</h1>

      {rows.length === 0 ? (
        <div className="text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded p-8 text-center bg-white dark:bg-slate-900">
          No competition data yet. Import history from the sheet or add manually.
        </div>
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([comp, list]) => (
            <div key={comp}>
              <div className="text-xs uppercase text-slate-500 dark:text-slate-400 mb-2">{comp}</div>
              <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase">
                    <tr>
                      <th className="text-left px-3 py-2">Team</th>
                      <th className="text-right px-3 py-2 w-16">W</th>
                      <th className="text-right px-3 py-2 w-16">2nd</th>
                      <th className="text-left px-3 py-2">Years won</th>
                      <th className="text-left px-3 py-2">Years 2nd</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((r) => (
                      <tr key={r.id} className="border-t border-slate-200 dark:border-slate-800">
                        <td className="px-3 py-2 font-medium">{r.team_name}</td>
                        <td className="px-3 py-2 text-right">{r.wins}</td>
                        <td className="px-3 py-2 text-right">{r.runners_up}</td>
                        <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{r.years_won ?? '—'}</td>
                        <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{r.years_runner_up ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
