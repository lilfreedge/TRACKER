import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface CompFinish { competition: string; position: string; }
interface StandingRow { pos: string; team: string; points: string; gd: string; }
interface Summary { id: string; season_id: string; final_position: number | null; points: number | null; top_scorer: string | null; top_scorer_goals: number | null; key_moment: string | null; next_objective: string | null; competition_finishes: CompFinish[] | null; top8_standings: StandingRow[] | null; }

const EMPTY_STAND: StandingRow[] = Array.from({ length: 8 }, (_, i) => ({ pos: String(i + 1), team: '', points: '', gd: '' }));

export default function SummarySection({ seasonId }: { seasonId: string }) {
  const [s, setS] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [finishes, setFinishes] = useState<CompFinish[]>([]);
  const [top8, setTop8] = useState<StandingRow[]>(EMPTY_STAND);
  const [topScorer, setTopScorer] = useState('');
  const [topGoals, setTopGoals] = useState('');
  const [keyMoment, setKeyMoment] = useState('');
  const [nextObj, setNextObj] = useState('');
  const [comps, setComps] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('season_summaries').select('*').eq('season_id', seasonId).maybeSingle();
    setS(data as Summary | null);
    setFinishes((data?.competition_finishes as CompFinish[]) ?? []);
    const st = (data?.top8_standings as StandingRow[]) ?? [];
    setTop8(st.length ? [...st, ...EMPTY_STAND].slice(0, 8) : EMPTY_STAND);
    setTopScorer(data?.top_scorer ?? '');
    setTopGoals(data?.top_scorer_goals != null ? String(data.top_scorer_goals) : '');
    setKeyMoment(data?.key_moment ?? '');
    setNextObj(data?.next_objective ?? '');
    // Load the save's competitions so user can pick from a dropdown
    const { data: se } = await supabase.from('seasons').select('save_id').eq('id', seasonId).maybeSingle();
    if (se) {
      const { data: sc } = await supabase.from('save_competitions').select('name').eq('save_id', se.save_id).eq('hidden', false).order('sort_order', { ascending: true });
      setComps((sc ?? []).map((x: any) => x.name));
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, [seasonId]);

  async function save() {
    setSaving(true);
    const cleanFinishes = finishes.filter((f) => f.competition && f.position);
    const cleanTop8 = top8.filter((r) => r.team);
    const payload: any = {
      season_id: seasonId,
      top_scorer: topScorer || null,
      top_scorer_goals: topGoals ? Number(topGoals) : null,
      key_moment: keyMoment || null,
      next_objective: nextObj || null,
      competition_finishes: cleanFinishes,
      top8_standings: cleanTop8,
    };
    if (s?.id) await supabase.from('season_summaries').update(payload).eq('id', s.id);
    else await supabase.from('season_summaries').insert(payload);
    setSaving(false); load();
  }

  function addFinish() { setFinishes([...finishes, { competition: '', position: '' }]); }
  function updateFinish(i: number, key: keyof CompFinish, val: string) { const c = [...finishes]; c[i] = { ...c[i], [key]: val }; setFinishes(c); }
  function delFinish(i: number) { setFinishes(finishes.filter((_, x) => x !== i)); }
  function updateTop8(i: number, key: keyof StandingRow, val: string) { const c = [...top8]; c[i] = { ...c[i], [key]: val }; setTop8(c); }

  if (loading) return <div className="text-slate-400 py-6 text-center text-sm">Loading…</div>;

  return (
    <div className="max-w-3xl">
      <p className="text-slate-500 text-sm mb-4">Season summary — carries over to help you review and plan the next campaign.</p>

      {/* Competition finishes */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase text-slate-500 font-semibold">🏆 Position per competition</div>
          <button onClick={addFinish} className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded px-2 py-1">+ Add</button>
        </div>
        {finishes.length === 0 ? (
          <div className="text-slate-400 text-xs italic border border-dashed border-slate-200 dark:border-slate-800 rounded p-3 bg-white dark:bg-slate-900">No competitions logged yet.</div>
        ) : (
          <div className="grid gap-2">
            {finishes.map((f, i) => (
              <div key={i} className="flex gap-2 items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-2">
                <select value={f.competition} onChange={(e) => updateFinish(i, 'competition', e.target.value)} className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm">
                  <option value="">Competition…</option>
                  {comps.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input value={f.position} onChange={(e) => updateFinish(i, 'position', e.target.value)} placeholder="Position (1st, R16…)" className="w-40 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm" />
                <button onClick={() => delFinish(i)} className="text-slate-400 hover:text-red-500 text-sm px-1">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top 8 league standings */}
      <div className="mb-6">
        <div className="text-xs uppercase text-slate-500 font-semibold mb-2">📊 League table · top 8</div>
        <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden bg-white dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs uppercase">
              <tr><th className="text-left px-2 py-1 w-10">#</th><th className="text-left px-2 py-1">Team</th><th className="text-right px-2 py-1 w-16">Pts</th><th className="text-right px-2 py-1 w-14">GD</th></tr>
            </thead>
            <tbody>
              {top8.map((r, i) => (
                <tr key={i} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-2 py-1 text-slate-400 font-mono">{i + 1}</td>
                  <td className="px-2 py-1"><input value={r.team} onChange={(e) => updateTop8(i, 'team', e.target.value)} placeholder="—" className="w-full bg-transparent border-0 text-sm focus:outline-none" /></td>
                  <td className="px-2 py-1 text-right"><input value={r.points} onChange={(e) => updateTop8(i, 'points', e.target.value)} placeholder="0" className="w-full bg-transparent border-0 text-sm text-right focus:outline-none" /></td>
                  <td className="px-2 py-1 text-right"><input value={r.gd} onChange={(e) => updateTop8(i, 'gd', e.target.value)} placeholder="0" className="w-full bg-transparent border-0 text-sm text-right focus:outline-none" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top scorer + notes */}
      <div className="grid gap-3 sm:grid-cols-2 mb-4">
        <label className="block">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Top scorer</div>
          <input value={topScorer} onChange={(e) => setTopScorer(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Top scorer goals</div>
          <input type="number" value={topGoals} onChange={(e) => setTopGoals(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
        </label>
      </div>
      <label className="block mb-3">
        <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Key moment</div>
        <textarea rows={2} value={keyMoment} onChange={(e) => setKeyMoment(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
      </label>
      <label className="block mb-4">
        <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Next objective</div>
        <textarea rows={2} value={nextObj} onChange={(e) => setNextObj(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
      </label>
      <button onClick={save} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-5 py-2 text-sm font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Save summary'}</button>
    </div>
  );
}
