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
  useEffect(() => { (async () => { if (aId) { const { data } = await supabase.from('squad_players').select('*').eq('season_id', aId); setAP((data ?? []) as SquadPlayer[]); } else setAP([]); })(); }, [aId]);
  useEffect(() => { (async () => { if (bId) { const { data } = await supabase.from('squad_players').select('*').eq('season_id', bId); setBP((data ?? []) as SquadPlayer[]); } else setBP([]); })(); }, [bId]);
  if (loading) return <Loading />;
  const a = seasons.find((s) => s.id === aId);
  const b = seasons.find((s) => s.id === bId);
  const setA = new Set(aP.map((p) => p.name_snapshot.toUpperCase()));
  const setB = new Set(bP.map((p) => p.name_snapshot.toUpperCase()));
  const stayed = aP.filter((p) => setB.has(p.name_snapshot.toUpperCase()));
  const inANotB = aP.filter((p) => !setB.has(p.name_snapshot.toUpperCase()));
  const inBNotA = bP.filter((p) => !setA.has(p.name_snapshot.toUpperCase()));
  const avg = (nums: (number | null)[]) => { const xs = nums.filter((n) => typeof n === 'number') as number[]; return xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1) : '—'; };
  return (
    <div>
      <Link to={`/save/${saveId}`} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">{t('back_save')}</Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">Compare seasons</h1>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[[aId, setAId], [bId, setBId]].map(([id, setter], idx) => (
          <select key={idx} value={id as string} onChange={(e) => (setter as any)(e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm">
            <option value="">Choose…</option>{seasons.map((s) => (<option key={s.id} value={s.id}>{s.label} · {s.team_name_snapshot}</option>))}
          </select>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[[a, aP], [b, bP]].map(([s, ps], idx) => (
          <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
            <div className="font-medium mb-2">{(s as Season | undefined) ? `${(s as Season).label} · ${(s as Season).team_name_snapshot ?? ''}` : '—'}</div>
            <div className="text-sm space-y-1"><div className="flex justify-between"><span className="text-slate-500">Squad size</span><span className="font-medium">{(ps as SquadPlayer[]).length}</span></div><div className="flex justify-between"><span className="text-slate-500">Avg OVR</span><span className="font-medium">{avg((ps as SquadPlayer[]).map((p) => p.ovr))}</span></div></div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[[`Stayed (${stayed.length})`, stayed, ''], [`Left after ${a?.label ?? '?'} (${inANotB.length})`, inANotB, 'text-red-600'], [`New in ${b?.label ?? '?'} (${inBNotA.length})`, inBNotA, 'text-emerald-600']].map(([title, rows, color], idx) => (
          <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-white dark:bg-slate-900">
            <div className={`text-xs uppercase font-semibold mb-2 ${color}`}>{title as string}</div>
            {(rows as SquadPlayer[]).length === 0 ? (<div className="text-slate-400 text-sm py-2">—</div>) : (<ul className="text-xs space-y-1">{(rows as SquadPlayer[]).map((p) => (<li key={p.id} className="border-t first:border-t-0 border-slate-100 dark:border-slate-800 py-1">{p.position ?? '?'} · {p.name_snapshot} · {p.ovr ?? '?'}</li>))}</ul>)}
          </div>
        ))}
      </div>
    </div>
  );
}
