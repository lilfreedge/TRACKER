import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';
import type { Season } from '../types/database';

export default function DashboardPage() {
  const { saveId } = useParams();
  const { t } = useLang();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!saveId) return;
    setLoading(true);
    const { data } = await supabase.from('seasons').select('*').eq('save_id', saveId);
    setSeasons(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [saveId]);

  if (loading) return <Loading />;

  const teams = new Set(seasons.map((s) => s.team_name_snapshot).filter(Boolean));
  const years = seasons.length > 0 ? seasons.length : 0;

  return (
    <div>
      <Link to={`/save/${saveId}`} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">{t('back_save')}</Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">{t('dashboard')}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Seasons managed" value={years} />
        <StatCard label="Clubs" value={teams.size} />
        <StatCard label="Trophies" value={0} note="More stats coming" />
        <StatCard label="Winrate" value={'—'} />
      </div>
    </div>
  );
}

function StatCard({ label, value, note }: { label: string; value: number | string; note?: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
      <div className="text-xs uppercase text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      {note && <div className="text-xs text-slate-400 mt-1">{note}</div>}
    </div>
  );
}
