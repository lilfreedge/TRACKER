import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';
import type { Season, SquadPlayer } from '../types/database';

export default function CompareSeasonsPage() {
  const { saveId } = useParams();
  const { t } = useLang();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [aId, setAId] = useState<string>('');
  const [bId, setBId] = useState<string>('');
  const [aP, setAP] = useState<SquadPlayer[]>([]);
  const [bP, setBP] = useState<SquadPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    if (!saveId) return;
    setLoading(true);
    const { data } = await supabase.from('seasons').select('*').eq('save_id', saveId).order('label', { ascending: false });
    setSeasons((data ?? []) as Season[]);
    if (data && data.length >= 2) { setAId(data[0].id); setBId(data[1].id); }
    setLoading(false);
  })(); }, [saveId]);

  useEffect(() => { (async () => {
    if (aId) {
      const { data } = await supabase.from('squad_players').select('*').eq('season_id', aId);
      setAP((data ?? []) as SquadPlayer[]);
    } else setAP([]);
  })(); }, [aId]);

  useEffect(() => { (async () => {
    if (bId) {
      const { data } = await supabase.from('squad_players').select('*').eq('season_id', bId);
      setBP((data ?? []) as SquadPlayer[]);
    } else setBP([]);
  })(); }, [bId]);

  if (loading) return <Loading />;

  const a = seasons.find((s) => s.id === aId);
  const b = seasons.find((s) => s.id === bId);
  const setA = new Set(aP.map((p) => p.name_snapshot.toUpperCase()));
  const setB = new Set(bP.map((p) => p.name_snapshot.toUpperCase()));
  const stayed = aP.filter((p) => setB.has(p.name_snapshot.toUpperCase()));
  const inANotB = aP.filter((p) => !setB.has(p.name_snapshot.toUpperCase()));
  const inBNotA = bP.filter((p) => !setA.has(p.name_snapshot.toUpperCase()));

  return (
    <div>
      <Link to={`/save/${saveId}`} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">{t('back_save')}</Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">Compare seasons</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <select value={aId} onChange={(e) => setAId(e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm">
          <option value="">Choose…</option>
          {seasons.map((s) => (<option key={s.id} value={s.id}>{s.label} · {s.team_name_snapshot}</option>))}
        </select>
        <select value={bId} onChange={(e) => setBId(e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm">
          <option value="">Choose…</option>
          {seasons.map((s) => (<option key={s.id} value={s.id}>{s.label} · {s.team_name_snapshot}</option>))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatBlock title={a ? `${a.label} · ${a.team_name_snapshot ?? ''}` : ''} rows={[
          ['Squad size', aP.length],
          ['Avg OVR', avg(aP.map((p) => p.ovr))],
          ['Formation', a?.formation ?? '—'],
        ]}/>
        <StatBlock title={b ? `${b.label} · ${b.team_name_snapshot ?? ''}` : ''} rows={[
          ['Squad size', bP.length],
          ['Avg OVR', avg(bP.map((p) => p.ovr))],
          ['Formation', b?.formation ?? '—'],
        ]}/>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ListCard title={`Stayed (${stayed.length})`} rows={stayed.map((p) => `${p.position ?? '?'} · ${p.name_snapshot} · ${p.ovr ?? '?'}`)} />
        <ListCard title={`Left after ${a?.label ?? '?'} (${inANotB.length})`} color="red" rows={inANotB.map((p) => `${p.position ?? '?'} · ${p.name_snapshot} · ${p.ovr ?? '?'}`)} />
        <ListCard title={`New in ${b?.label ?? '?'} (${inBNotA.length})`} color="emerald" rows={inBNotA.map((p) => `${p.position ?? '?'} · ${p.name_snapshot} · ${p.ovr ?? '?'}`)} />
      </div>
    </div>
  );
}

function avg(nums: (number | null)[]): string {
  const xs = nums.filter((n) => typeof n === 'number') as number[];
  if (!xs.length) return '—';
  return (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1);
}

function StatBlock({ title, rows }: { title: string; rows: [string, any][] }) {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
      <div className="font-medium text-slate-900 dark:text-slate-100 mb-2">{title || '—'}</div>
      <div className="space-y-1 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">{k}</span>
            <span className="font-medium">{String(v ?? '—')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListCard({ title, rows, color }: { title: string; rows: string[]; color?: 'red' | 'emerald' }) {
  const chip = color === 'red' ? 'text-red-600' : color === 'emerald' ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-200';
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-white dark:bg-slate-900">
      <div className={`text-xs uppercase font-semibold mb-2 ${chip}`}>{title}</div>
      {rows.length === 0 ? (
        <div className="text-slate-400 dark:text-slate-600 text-sm py-2">—</div>
      ) : (
        <ul className="text-xs space-y-1">
          {rows.map((r, i) => <li key={i} className="border-t first:border-t-0 border-slate-100 dark:border-slate-800 py-1">{r}</li>)}
        </ul>
      )}
    </div>
  );
}
